# Status Migrasi E-BPHTB

Dokumen ini mencatat bagian mana yang sudah dipindah ke folder **E-BPHTB_MIgration** dan mana yang masih di **E-BPHTB_root_utama**, serta kesiapan sandbox/blackbox test.

## Pengingat arsitektur

- **root_utama** = backend **Node.js** (legacy, berat, risiko down saat beban besar).
- **folder migrasi** = backend **sepenuhnya Golang** + frontend **Next.js**. Node.js **bukan** stack backend di migrasi; proxy Go → Node hanya **sementara** sampai endpoint selesai di-port ke Go. Target: semua layanan jalan di Go + Next.js agar stabil dan tidak down.

---

| Kategori        | Sudah di Migrasi | Masih di root_utama | Sandbox/Blackbox |
|-----------------|------------------|----------------------|-------------------|
| KTP OCR (Go)    | Ya (internal/ktpocr, Tesseract CLI) | - | Siap |
| upload-ktp      | Ya (Go)          | -                    | Siap              |
| real-ktp-verification | Ya (Go)   | -                    | Siap              |
| register        | Ya (Go)          | -                    | Siap              |
| verify-otp, resend-otp, login | - | Ya (Node) | Via proxy ke Node |
| Frontend Next   | Ya               | -                    | Siap              |
| Backend Go      | Ya (health, auth handlers) | - | Siap              |

---

## Modul yang sudah dipindah ke E-BPHTB_MIgration

### 1. KTP OCR + Auth (Go)

| Item | Lokasi | Keterangan |
|------|--------|------------|
| KTP OCR | `internal/ktpocr/` | Tesseract CLI, preprocessing, field extraction |
| upload-ktp | `internal/handler/auth.go` | POST multipart fotoktp, simpan ke temp_uploads |
| real-ktp-verification | `internal/handler/auth.go` | POST multipart fotoktp, OCR, return field KTP |
| register | `internal/handler/auth.go` | Form parse, DB a_1_unverified_users, bcrypt, OTP |

**Syarat:** Tesseract terpasang di PATH (`tesseract` command). PostgreSQL untuk register.

**Cara uji:**

- `POST /api/v1/auth/upload-ktp` dengan form field `fotoktp`
- `POST /api/v1/auth/real-ktp-verification` dengan form field `fotoktp`
- `POST /api/v1/auth/register` dengan form (nama, nik, telepon, email, password, gender, ktpUploadId, verse, dll.)

---

## Yang masih di E-BPHTB_root_utama (belum dipindah)

- Backend Node (index.js, routes, DB, session)
- verify-otp, resend-otp, login (bisa di-proxy dari Go ke Node)
- Admin unverified_users, layanan lain (PPAT, notifikasi, dll.)

---

## Alur pengembangan

1. **upload-ktp, real-ktp-verification, register** sudah di Go (`E-BPHTB_MIgration/backend`). Tidak perlu Node untuk alur daftar + KTP.
2. **verify-otp, resend-otp, login** masih di Node; proxy Go → Node bila `LEGACY_NODE_URL` diset.
3. KTP OCR di Go memakai Tesseract CLI (no CGo); pastikan `tesseract` terpasang.

---

## Sandbox

- **Skrip uji KTP OCR:** `E-BPHTB_MIgration/sandbox/run-ktp-ocr.js`
- **Menjalankan:** Dari root repo: `node E-BPHTB_MIgration/sandbox/run-ktp-ocr.js <path-file-ktp.jpg>`
- Memakai modul dari `migrated/node/utils/ktpOCR.js` (Tesseract).
