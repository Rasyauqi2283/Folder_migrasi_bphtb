"""
Fallback heuristik dari teks OCR mentah jika model NER tidak tersedia atau gagal.
"""
from __future__ import annotations

import re


def extract_from_text(text: str) -> dict[str, str | None]:
    t = (text or "").replace("\n", " ")
    t = re.sub(r"\s+", " ", t).strip()
    out: dict[str, str | None] = {
        "nik": None,
        "nama": None,
        "alamat": None,
        "rt_rw": None,
        "kecamatan": None,
    }
    # NIK 16 digit
    m = re.search(r"\b(\d{16})\b", t)
    if m:
        out["nik"] = m.group(1)
    # RT/RW
    m = re.search(r"RT\.?\s*/?\s*RW\.?\s*([0-9/]+)", t, re.I)
    if m:
        out["rt_rw"] = m.group(1).strip()
    # Kecamatan
    m = re.search(r"KECAMATAN\s+([A-Z][A-Z\s]+?)(?:\s+KABUPATEN|\s+KOTA|$)", t, re.I)
    if m:
        out["kecamatan"] = m.group(1).strip()
    return out
