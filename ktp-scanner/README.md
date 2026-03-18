# KTP Scanner (DL/ML)

Microservice pemindaian KTP dengan EasyOCR (deep learning), output JSON sesuai kontrak backend Node E-BPHTB.

## Setup

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
```

## Menjalankan service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

- API: `http://localhost:8001`
- Health: `GET /health`
- Scan KTP: `POST /scan` (multipart form `fotoktp`)

## Validasi akurasi (target 90%)

1. Letakkan gambar KTP di `dataset/images/` (mis. `sample_001.jpg`).
2. Buat ground truth di `dataset/ground_truth/sample_001.json` (lihat `sample_template.json`).
   - Generate template: `python scripts/generate_ground_truth_template.py sample_001`
3. Jalankan:
   - Terhadap service: `python validate_accuracy.py --service-url http://localhost:8001`
   - Lokal (tanpa server): `python validate_accuracy.py`
4. Target: overall accuracy >= 90%.

## Struktur

- `app/main.py` – FastAPI, endpoint `/scan`
- `app/ocr_pipeline.py` – Preprocessing + EasyOCR + ekstraksi
- `app/field_extractor.py` – Parsing field dari teks OCR (regex)
- `app/schemas.py` – Kontrak response (stats, completeness)
- `validate_accuracy.py` – Skrip validasi vs ground truth
- `dataset/images/` – Gambar KTP
- `dataset/ground_truth/` – JSON ground truth per sample

## Dokumentasi lengkap

Lihat `docs/KTP_SCANNER_SERVICE.md` di root repo.
