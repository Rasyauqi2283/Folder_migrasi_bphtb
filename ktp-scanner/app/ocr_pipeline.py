"""OCR pipeline: image preprocessing + EasyOCR + field extraction."""

import io
import time
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple

# Lazy init to avoid slow import at module load
_reader = None


def _get_reader():
    global _reader
    if _reader is None:
        import easyocr
        _reader = easyocr.Reader(["id", "en"], gpu=False, verbose=False)
    return _reader


def preprocess_image(image_bytes: bytes, max_width: int = 2000) -> bytes:
    """Resize if too large, grayscale optional - keep bytes for EasyOCR."""
    try:
        from PIL import Image
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ("L", "RGB"):
            img = img.convert("RGB")
        w, h = img.size
        if w > max_width:
            ratio = max_width / w
            new_h = int(h * ratio)
            img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except Exception:
        return image_bytes


def run_ocr(image_bytes: bytes) -> Tuple[str, float]:
    """Run EasyOCR, return (full_text, avg_confidence)."""
    reader = _get_reader()
    import numpy as np
    from PIL import Image
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    arr = np.array(img)
    results = reader.readtext(arr)
    lines = []
    confs = []
    for (bbox, text, conf) in results:
        if text and conf > 0.1:
            lines.append(text.strip())
            confs.append(conf)
    full_text = "\n".join(lines) if lines else ""
    avg_conf = (sum(confs) / len(confs) * 100.0) if confs else 0.0
    return full_text, avg_conf


def extract_ktp(image_path: Optional[str] = None, image_bytes: Optional[bytes] = None) -> Dict[str, Any]:
    """
    Main pipeline: load image -> preprocess -> OCR -> field extraction.
    Either image_path or image_bytes must be provided.
    """
    start = time.time()
    if image_path:
        path = Path(image_path)
        if not path.exists():
            return _error_result(f"File not found: {image_path}", int((time.time() - start) * 1000))
        image_bytes = path.read_bytes()
    if not image_bytes:
        return _error_result("No image provided", int((time.time() - start) * 1000))

    try:
        processed = preprocess_image(image_bytes)
        raw_text, confidence = run_ocr(processed)
    except Exception as e:
        return _error_result(str(e), int((time.time() - start) * 1000))

    from .field_extractor import FieldExtractor
    from .schemas import build_stats

    result = FieldExtractor.extract_all(raw_text)
    result["confidence"] = confidence
    result["processingTime"] = int((time.time() - start) * 1000)
    result["stats"] = build_stats(result).model_dump()
    return result


def _error_result(message: str, processing_time: int) -> Dict[str, Any]:
    return {
        "nik": None,
        "nama": None,
        "ttl": None,
        "alamat": None,
        "rtRw": None,
        "kelurahan": None,
        "kecamatan": None,
        "jenisKelamin": None,
        "golonganDarah": None,
        "agama": None,
        "statusPerkawinan": None,
        "pekerjaan": None,
        "kewarganegaraan": None,
        "berlakuHingga": None,
        "rawText": "",
        "confidence": 0,
        "processingTime": processing_time,
        "stats": {
            "totalFields": 11,
            "extractedFields": 0,
            "confidence": 0,
            "processingTime": processing_time,
            "isValidNIK": False,
            "completeness": 0,
        },
        "error": message,
    }
