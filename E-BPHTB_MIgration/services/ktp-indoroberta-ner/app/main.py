"""
FastAPI: OCR KTP (EasyOCR) + NER IndoBERT (fine-tuned) -> JSON terstruktur.
POST /extract-ktp — multipart field: file (gambar).
"""
from __future__ import annotations

import io
import logging
import os
import re
from pathlib import Path

import numpy as np
import torch
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from transformers import pipeline

import easyocr

from app.heuristic_extract import extract_from_text

LOG = logging.getLogger("uvicorn.error")

MODEL_DIR = Path(os.getenv("MODEL_PATH", "./model/indoroberta-ktp-ner")).resolve()

# Map label entitas (setelah strip B-/I-) ke field JSON
_ENTITY_TO_FIELD: dict[str, str] = {
    "NIK": "nik",
    "NAMA": "nama",
    "ALAMAT": "alamat",
    "RT_RW": "rt_rw",
    "KECAMATAN": "kecamatan",
    "KEL_DESA": "kel_desa",
    "TEMPAT_LAHIR": "tempat_lahir",
    "TANGGAL_LAHIR": "tanggal_lahir",
}

_reader: easyocr.Reader | None = None
_ner_pipe = None


def _get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["id"], gpu=torch.cuda.is_available())
    return _reader


def _get_ner_pipeline():
    global _ner_pipe
    if _ner_pipe is not None:
        return _ner_pipe
    cfg = MODEL_DIR / "config.json"
    if not cfg.is_file():
        return None
    device = 0 if torch.cuda.is_available() else -1
    _ner_pipe = pipeline(
        "token-classification",
        model=str(MODEL_DIR),
        tokenizer=str(MODEL_DIR),
        aggregation_strategy="simple",
        device=device,
    )
    return _ner_pipe


def _normalize_entity_label(label: str) -> str | None:
    s = (label or "").strip().upper()
    if s.startswith("B-") or s.startswith("I-"):
        s = s[2:]
    return _ENTITY_TO_FIELD.get(s)


def _merge_ner_entities(entities: list[dict]) -> dict[str, str]:
    """Gabungkan span NER ke field (satu string per field)."""
    chunks: dict[str, list[str]] = {}
    for e in entities:
        lab = e.get("entity_group") or e.get("label") or ""
        field = _normalize_entity_label(str(lab))
        if not field:
            continue
        w = (e.get("word") or "").strip()
        if not w:
            continue
        chunks.setdefault(field, []).append(w)
    return {k: " ".join(v).strip() for k, v in chunks.items()}


def _digits_nik(s: str | None) -> str | None:
    if not s:
        return None
    m = re.search(r"\d{16}", re.sub(r"\s+", "", s))
    return m.group(0) if m else None


class ExtractResponse(BaseModel):
    nik: str | None = None
    nama: str | None = None
    alamat: str | None = None
    rt_rw: str | None = None
    kecamatan: str | None = None
    raw_text: str = ""
    manual_verification_required: bool = False
    engine: str = Field(default="", description="easyocr+indoroberta atau easyocr+heuristic")


app = FastAPI(title="KTP OCR + IndoROBERTa NER", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": (MODEL_DIR / "config.json").is_file()}


@app.post("/extract-ktp", response_model=ExtractResponse)
async def extract_ktp(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unggah file gambar (JPEG/PNG).")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="File kosong.")

    reader = _get_reader()
    try:
        from PIL import Image

        img = Image.open(io.BytesIO(data)).convert("RGB")
        arr = np.array(img)
        ocr_lines = reader.readtext(arr, detail=0, paragraph=False)
    except Exception as e:
        LOG.exception("EasyOCR gagal")
        raise HTTPException(status_code=500, detail=f"OCR gagal: {e}") from e

    if isinstance(ocr_lines, str):
        raw_text = ocr_lines
    else:
        raw_text = "\n".join(str(x) for x in ocr_lines) if ocr_lines else ""

    raw_text = re.sub(r"\s+", " ", raw_text).strip()
    heur = extract_from_text(raw_text)

    out: dict = {
        "nik": heur.get("nik"),
        "nama": None,
        "alamat": heur.get("alamat"),
        "rt_rw": heur.get("rt_rw"),
        "kecamatan": heur.get("kecamatan"),
        "raw_text": raw_text,
        "manual_verification_required": True,
        "engine": "easyocr+heuristic",
    }

    ner = _get_ner_pipeline()
    if ner is not None and raw_text:
        try:
            ents = ner(raw_text)
            merged = _merge_ner_entities(ents)
            for key in ("nik", "nama", "alamat", "rt_rw", "kecamatan"):
                if merged.get(key):
                    out[key] = merged[key]
            if merged.get("kel_desa") and not out.get("alamat"):
                out["alamat"] = merged.get("kel_desa")
            nik_clean = _digits_nik(out.get("nik"))
            if nik_clean:
                out["nik"] = nik_clean
            out["engine"] = "easyocr+indoroberta"
        except Exception as e:
            LOG.warning("NER gagal, fallback heuristik: %s", e)

    if not out.get("nik"):
        out["nik"] = heur.get("nik")
    nik_final = _digits_nik(out.get("nik"))
    if nik_final:
        out["nik"] = nik_final

    # manual jika tidak ada 16 digit NIK
    out["manual_verification_required"] = not bool(re.fullmatch(r"\d{16}", str(out.get("nik") or "")))

    return ExtractResponse(**out)


def main():
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8020"))
    uvicorn.run("app.main:app", host=host, port=port, reload=False)


if __name__ == "__main__":
    main()
