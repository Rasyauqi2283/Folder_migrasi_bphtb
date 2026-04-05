import os
import time
from typing import Any

import cv2
import easyocr
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from contextlib import asynccontextmanager


_reader: easyocr.Reader | None = None


def get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        use_gpu = os.getenv("EASYOCR_GPU", "false").lower() == "true"
        _reader = easyocr.Reader(["id", "en"], gpu=use_gpu, verbose=False)
    return _reader


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Preload EasyOCR model at startup so first /ocr request is fast (no cold start)."""
    get_reader()
    yield
    # shutdown: reader stays in memory until process exits


app = FastAPI(title="EasyOCR Service", version="1.0.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok"}


@app.post("/ocr")
async def ocr_image(image: UploadFile = File(...)) -> dict[str, Any]:
    started = time.time()
    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="empty image")

    nparr = np.frombuffer(content, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="invalid image format")

    try:
        reader = get_reader()
        result = reader.readtext(img, detail=1, paragraph=False)
        lines = []
        for item in result:
            if len(item) < 2:
                continue
            txt = str(item[1]).strip()
            if txt:
                lines.append(txt)

        raw_text = "\n".join(lines)
        duration_ms = int((time.time() - started) * 1000)
        return {
            "success": True,
            "raw_text": raw_text,
            "lines": lines,
            "duration_ms": duration_ms,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"easyocr_failed: {exc}") from exc
