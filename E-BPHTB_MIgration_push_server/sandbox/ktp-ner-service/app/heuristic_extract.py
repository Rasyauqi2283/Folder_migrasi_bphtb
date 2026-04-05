"""
Placeholder Information Extraction (bukan IndoROBERTa).
Memetakan raw_text OCR ke field — pola mirip logika regex di Go (ktpocr/extract.go).
Diganti dengan pipeline HF ketika model + dataset siap.
"""
from __future__ import annotations

import re
from typing import Any


def _digits(s: str) -> str:
    return "".join(c for c in s if c.isdigit())


def extract_nik(text: str) -> str | None:
    t = text.replace("\n", " ")
    for m in re.finditer(r"\b(\d{16})\b", t):
        if _valid_province(m.group(1)[:2]):
            return m.group(1)
    d = _digits(text)
    if len(d) >= 16:
        for i in range(0, len(d) - 15):
            cand = d[i : i + 16]
            if _valid_province(cand[:2]):
                return cand
    m = re.search(r"NIK\s*[:.]?\s*([\d\sOIl]{16,32})", text, re.I)
    if m:
        raw = _digits(m.group(1).replace("O", "0").replace("l", "1").replace("I", "1"))
        if len(raw) >= 16:
            cand = raw[:16]
            if _valid_province(cand[:2]):
                return cand
    return None


_VALID_PROV = {
    "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "21", "31", "32", "33", "34", "35", "36",
    "51", "52", "53", "61", "62", "63", "64", "65",
    "71", "72", "73", "74", "75", "76", "81", "82",
    "91", "92", "93", "94",
}


def _valid_province(prefix: str) -> bool:
    return prefix in _VALID_PROV


def extract_nama(text: str) -> str | None:
    m = re.search(r"NAMA\s*[:.]?\s*([A-Za-z][A-Za-z\s'.-]{3,49})", text, re.I)
    if m:
        n = re.sub(r"\s+", " ", m.group(1).strip()).upper()
        if len(n) >= 4 and not re.search(r"\d", n):
            return n
    return None


def extract_alamat(text: str) -> str | None:
    m = re.search(
        r"ALAMAT\s*[:.]?\s*([A-Za-z0-9\s,.\-/]{5,120}?)(?:\s*RT|KEL|KECAMATAN|AGAMA|JENIS|$)",
        text,
        re.I | re.S,
    )
    if m:
        a = re.sub(r"\s+", " ", m.group(1).strip()).upper()
        a = re.split(r"\s*RT/?RW", a, 1)[0].strip()
        if len(a) >= 5:
            return a
    return None


def extract_pekerjaan(text: str) -> str | None:
    m = re.search(r"PEKERJAAN\s*[:.]?\s*([A-Za-z\s]{3,50})", text, re.I)
    if m:
        p = re.sub(r"\s+", " ", m.group(1).strip()).upper()
        if len(p) >= 3:
            return p
    return None


def heuristic_extract(raw_text: str) -> dict[str, Any]:
    raw = (raw_text or "").strip()
    if not raw:
        return {
            "nik": None,
            "nama": None,
            "alamat": None,
            "pekerjaan": None,
        }
    return {
        "nik": extract_nik(raw),
        "nama": extract_nama(raw),
        "alamat": extract_alamat(raw),
        "pekerjaan": extract_pekerjaan(raw),
    }
