# KTP NER Service (sandbox)

Layanan **terpisah** untuk tahap NLP setelah OCR — **Named Entity Recognition** menuju struktur JSON (`nik`, `nama`, `alamat`, `pekerjaan`, …).

## Status

- **Default:** `heuristic` — ekstraksi berbasis pola (mirip ide di `backend/internal/ktpocr`), tanpa GPU.
- **IndoROBERTa:** belum diimplementasikan di dalam repo ini; gunakan `requirements-ml.txt` + kode `transformers` di `app/main.py` ketika dataset BIO siap.

## Menjalankan

```bash
cd sandbox/ktp-ner-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8090
```

Uji:

```bash
curl -s -X POST http://127.0.0.1:8090/v1/extract -H "Content-Type: application/json" -d "{\"raw_text\":\"NIK : 3201010101010101\\nNAMA : FAHRI RAMADHAN\"}"
```

## Integrasi ke backend Go (nanti)

1. Set env `KTP_NER_SERVICE_URL=http://127.0.0.1:8090`
2. Setelah OCR menghasilkan `RawText`, POST ke `/v1/extract` jika URL diset.
3. Gabungkan field dengan hasil regex; validasi NIK 16 digit.

## Integrasi frontend

- Perluas response `upload-ktp` / `register` dengan objek `ner_fields` ketika service aktif.
- **BookingSspdTambahUnified:** isi field form dari JSON; user tetap verifikasi manual.

## Dataset & fine-tuning

Lihat `docs/ktp_ner_pipeline_roadmap.md` — inti kesulitan adalah **anotasi BIO**, bukan baris kode.
