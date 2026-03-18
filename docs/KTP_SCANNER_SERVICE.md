# KTP Scanner Service (DL/ML)

Layanan pemindaian KTP berbasis deep learning / machine learning (EasyOCR) yang dipanggil oleh backend Node sebagai microservice. Output JSON mengikuti kontrak yang sama dengan OCR lama (Tesseract) agar frontend tidak berubah.

## Arsitektur

- **Python service**: FastAPI, endpoint `POST /scan`, menerima multipart form `fotoktp`.
- **Node backend**: Memanggil service ini terlebih dahulu; jika gagal atau service mati, fallback ke Tesseract (`ktpOCR.js`).

## Menjalankan Python service

```bash
cd ktp-scanner
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

- Service berjalan di `http://localhost:8001`.
- Health check: `GET http://localhost:8001/health`.

## Environment backend Node

| Variabel | Deskripsi | Default |
|----------|-----------|---------|
| `KTP_OCR_SERVICE_URL` | URL dasar service KTP Scanner (tanpa trailing slash) | `http://localhost:8001` |

Jika tidak di-set atau service tidak bisa diakses, backend otomatis memakai Tesseract (fallback).

## Endpoint

- **POST /scan**  
  - Body: multipart form, field `fotoktp` (file gambar KTP).  
  - Format: `.jpg`, `.jpeg`, `.png`, `.bmp`, maksimal 10MB.  
  - Response: JSON dengan field `nik`, `nama`, `ttl`, `alamat`, `rtRw`, `kelurahan`, `kecamatan`, `jenisKelamin`, `golonganDarah`, `agama`, `statusPerkawinan`, `pekerjaan`, `kewarganegaraan`, `berlakuHingga`, `rawText`, `confidence`, `processingTime`, `stats`.

## Validasi akurasi (target 90%)

1. Siapkan dataset: folder `ktp-scanner/dataset/images/` (gambar KTP) dan `ktp-scanner/dataset/ground_truth/` (JSON ground truth per sample, nama file sama dengan nama gambar tanpa ekstensi).
2. Template ground truth: `dataset/ground_truth/sample_template.json`. Untuk sample baru:  
   `python scripts/generate_ground_truth_template.py sample_001`  
   lalu isi nilai sebenarnya.
3. Jalankan validator:
   - Terhadap service yang sudah jalan:  
     `python validate_accuracy.py --service-url http://localhost:8001`
   - Tanpa service (OCR lokal):  
     `python validate_accuracy.py`
4. Target: **Overall accuracy >= 90%** (per-field: exact match = 1, partial Levenshtein >= 0.85 = 0.5).

## Referensi

- Kode service: `ktp-scanner/app/` (main.py, ocr_pipeline.py, field_extractor.py, schemas.py).
- Client Node: `E-BPHTB_root_utama/backend/utils/ktpOCRClient.js`.
- Integrasi route: `E-BPHTB_root_utama/backend/routesxcontroller/1_auth/authRoutes.js` (endpoint `POST /api/v1/auth/real-ktp-verification`).
