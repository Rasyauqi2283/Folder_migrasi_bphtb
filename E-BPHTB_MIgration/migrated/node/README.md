# Modul Node yang sudah dipindah ke Migrasi

Modul di sini dipakai oleh backend Node (E-BPHTB_root_utama) lewat import path. Edit hanya di sini; jangan duplikasi di root_utama.

## Isi

- **utils/ktpOCR.js** — Tesseract OCR KTP (rebuild, JK + Gol.Darah dipisah).
- **utils/ktpOCRClient.js** — Client Python KTP scanner + fallback ke ktpOCR.

## Ketergantungan

Modul ini memakai `tesseract.js` dan `sharp` dari **root repo** (package.json di root). Jalankan backend atau sandbox dari root repo.

## Sandbox

```bash
# Dari root repo
node E-BPHTB_MIgration/sandbox/run-ktp-ocr.js <path-gambar-ktp.jpg>
```

Lihat juga: `E-BPHTB_MIgration/docs/MIGRASI_STATUS.md`.
