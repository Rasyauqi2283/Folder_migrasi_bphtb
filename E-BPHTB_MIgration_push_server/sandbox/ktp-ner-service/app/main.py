"""
KTP NER microservice — placeholder (heuristic) + hook untuk IndoROBERTa (HF) nanti.

Jalankan:
  uvicorn app.main:app --host 0.0.0.0 --port 8090

Lindungi dengan reverse proxy / firewall; jangan expose publik tanpa auth di produksi.
"""
from __future__ import annotations

import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.heuristic_extract import heuristic_extract

app = FastAPI(title="KTP NER Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    raw_text: str = Field(..., description="Teks mentah dari Tesseract/EasyOCR")


class ExtractResponse(BaseModel):
    success: bool
    engine: str
    fields: dict[str, Any]
    bio_debug: list[dict[str, Any]] | None = None


@app.get("/health")
def health():
    return {"ok": True, "engine": os.getenv("NER_ENGINE", "heuristic")}


@app.post("/v1/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest):
    """
    Saat ini: `heuristic` (regex + aturan).
    Untuk IndoROBERTa: set NER_ENGINE=indoroberta dan implementasikan load model di bawah.
    """
    engine = os.getenv("NER_ENGINE", "heuristic").strip().lower()
    if engine == "indoroberta":
        # Hook: muat transformers di sini; jangan import torch di top-level agar dependency minimal tetap jalan.
        raise HTTPException(
            status_code=501,
            detail="IndoROBERTa belum di-wire: set NER_ENGINE=heuristic atau implementasikan pipeline HF (lihat README).",
        )

    fields = heuristic_extract(req.raw_text)
    return ExtractResponse(
        success=True,
        engine="heuristic",
        fields=fields,
        bio_debug=None,
    )


# Contoh implementasi masa depan (pseudo):
#
# from transformers import AutoTokenizer, AutoModelForTokenClassification
# tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
# model = AutoModelForTokenClassification.from_pretrained(MODEL_ID)
# ... tokenize → forward → argmax labels → merge BIO spans → fields
