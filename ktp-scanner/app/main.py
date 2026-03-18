"""FastAPI app for KTP scanning - POST /scan returns JSON per Node contract."""

import os
import tempfile
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException

from .ocr_pipeline import extract_ktp


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Optional: preload EasyOCR on startup to avoid first-request delay
    # from .ocr_pipeline import _get_reader
    # _get_reader()
    yield
    # cleanup if any


app = FastAPI(title="KTP Scanner", version="1.0.0", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ktp-scanner"}


@app.post("/scan")
async def scan(fotoktp: UploadFile = File(...)):
    """Accept multipart form 'fotoktp', return KTP fields as JSON (Node contract)."""
    if not fotoktp.filename:
        raise HTTPException(status_code=400, detail="Missing file")
    ext = os.path.splitext(fotoktp.filename)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".bmp"):
        raise HTTPException(status_code=400, detail="Unsupported format. Use: .jpg, .jpeg, .png, .bmp")
    content = await fotoktp.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    try:
        result = extract_ktp(image_bytes=content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return result
