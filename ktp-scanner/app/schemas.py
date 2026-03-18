"""Request/response schemas for KTP Scanner API - matches Node backend contract."""

from typing import Optional, Any
from pydantic import BaseModel, Field


class TTL(BaseModel):
    tempat: Optional[str] = None
    tanggal: Optional[str] = None


class Stats(BaseModel):
    totalFields: int = 11
    extractedFields: int = 0
    confidence: float = 0.0
    processingTime: int = 0
    isValidNIK: bool = False
    completeness: float = 0.0


class ScanResponse(BaseModel):
    """Full response contract for Node backend compatibility."""
    nik: Optional[str] = None
    nama: Optional[str] = None
    ttl: Optional[TTL] = None
    alamat: Optional[str] = None
    rtRw: Optional[str] = None
    kelurahan: Optional[str] = None
    kecamatan: Optional[str] = None
    jenisKelamin: Optional[str] = None
    golonganDarah: Optional[str] = None
    agama: Optional[str] = None
    statusPerkawinan: Optional[str] = None
    pekerjaan: Optional[str] = None
    kewarganegaraan: Optional[str] = None
    berlakuHingga: Optional[str] = None
    rawText: str = ""
    confidence: float = 0.0
    processingTime: int = 0
    stats: Optional[Stats] = None
    error: Optional[str] = None

    class Config:
        extra = "allow"  # allow rawText truncation etc.


def _validate_nik(nik: Optional[str]) -> bool:
    if not nik or len(nik) != 16 or not nik.isdigit():
        return False
    province = nik[:2]
    valid = [
        "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "31", "32", "33", "34", "35", "36",
        "51", "52", "53", "61", "62", "63", "64", "65", "71", "72", "73", "74", "75", "76", "81", "82",
        "91", "92", "93", "94",
    ]
    return province in valid


def build_stats(result: dict) -> Stats:
    """Compute stats from extracted result."""
    total = 11
    count = 0
    if result.get("nik"):
        count += 1
    if result.get("nama"):
        count += 1
    if result.get("ttl"):
        count += 1
    if result.get("alamat"):
        count += 1
    if result.get("jenisKelamin"):
        count += 1
    if result.get("golonganDarah"):
        count += 1
    if result.get("agama"):
        count += 1
    if result.get("statusPerkawinan"):
        count += 1
    if result.get("pekerjaan"):
        count += 1
    if result.get("kewarganegaraan"):
        count += 1
    if result.get("berlakuHingga"):
        count += 1
    isValidNIK = bool(result.get("nik") and _validate_nik(result["nik"]))
    confidence = float(result.get("confidence", 0))
    processing_time = int(result.get("processingTime", 0))
    completeness = (count / total) * 100 if total else 0
    return Stats(
        totalFields=total,
        extractedFields=count,
        confidence=confidence,
        processingTime=processing_time,
        isValidNIK=isValidNIK,
        completeness=round(completeness, 1),
    )
