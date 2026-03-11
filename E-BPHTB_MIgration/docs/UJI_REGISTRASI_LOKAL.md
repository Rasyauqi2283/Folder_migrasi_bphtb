# Uji Registrasi (Karyawan) + KTP OCR di Localhost

Panduan singkat untuk menjalankan uji registrasi karyawan di **localhost:3000** dengan backend **Golang** (tanpa Node untuk auth).

## Arsitektur

```
Browser (localhost:3000)  →  Next.js (frontend)
                                  ↓
                         Backend Go (localhost:3005)
                           - upload-ktp
                           - real-ktp-verification (KTP OCR via Tesseract CLI)
                           - register
                                  ↓ (opsional, untuk verify-otp, resend-otp, login)
                         Backend Node (localhost:3001)
```

**Tidak perlu Node** untuk upload KTP, OCR, dan registrasi. Semua sudah jalan di Go.

## Syarat

- **Tesseract CLI** terpasang dan ada di PATH (untuk KTP OCR)
- **PostgreSQL** jalan (untuk register)
- **Go** terpasang (untuk backend)

## 1. Backend Go (upload-ktp, real-ktp-verification, register)

```bash
cd E-BPHTB_MIgration/backend
copy .env.example .env
# Edit .env: DATABASE_URL, TEMP_UPLOADS_DIR (opsional)
go run ./cmd/server
```

Go listen di **http://localhost:3005**. Endpoint auth (upload-ktp, real-ktp-verification, register) dilayani langsung oleh Go.

## 2. Frontend Next.js

```bash
cd E-BPHTB_MIgration/frontend-next
copy .env.local.example .env.local
# .env.local: NEXT_PUBLIC_LEGACY_BASE_URL=http://localhost:3005
npm run dev
```

Next.js listen di **http://localhost:3000**. Buka:

- **Registrasi karyawan:** http://localhost:3000/daftar?verse=karyawan

## 3. Proxy ke Node (opsional)

Untuk **verify-otp**, **resend-otp**, **login** yang masih di Node, set di `backend/.env`:

```
LEGACY_NODE_URL=http://localhost:3001
```

Lalu jalankan Node dari root repo:

```powershell
$env:PORT=3001; npm run dev:backend
```

## 4. Ringkasan env

| Lokasi | Variabel | Nilai |
|--------|----------|-------|
| E-BPHTB_MIgration/backend | GO_PORT | 3005 |
| E-BPHTB_MIgration/backend | DATABASE_URL | postgres://... |
| E-BPHTB_MIgration/backend | TEMP_UPLOADS_DIR | ./temp_uploads |
| E-BPHTB_MIgration/backend | LEGACY_NODE_URL | http://localhost:3001 (jika butuh verify-otp/login) |
| E-BPHTB_MIgration/frontend-next | NEXT_PUBLIC_LEGACY_BASE_URL | http://localhost:3005 |

## 5. Cara memastikan DB terhubung dengan folder migrasi

Database yang dipakai backend Go **sama** dengan yang Anda buka dengan `psql -U postgres -d bappenda`. Yang menentukan koneksi adalah **variabel env** di folder migrasi.

1. **Cek URL koneksi**
   - Di **E-BPHTB_MIgration/backend** buka file `.env` (bisa copy dari `.env.example`).
   - Pastikan `DATABASE_URL` mengarah ke database yang sama, contoh:
     ```bash
     DATABASE_URL=postgres://postgres:SANDI_ANDA@localhost:5432/bappenda?sslmode=disable
     ```
   - Jika `.env` tidak ada atau `DATABASE_URL` kosong, backend memakai default di code:  
     `postgres://postgres:postgres@localhost:5432/bappenda?sslmode=disable`  
     (user `postgres`, database `bappenda`). Ganti password jika beda dengan instalasi Anda.

2. **Cek saat backend jalan**
   - Jalankan backend: `cd E-BPHTB_MIgration/backend` lalu `go run ./cmd/server`.
   - Jika koneksi gagal, di log akan muncul:  
     `[DB] WARNING: failed to connect: ... (register will fail)`  
   - Jika tidak ada pesan itu, koneksi berhasil (pool dipakai untuk register/login/verify-otp).

3. **Cek lewat HTTP (paling gampang)**
   - Setelah backend jalan, buka di browser atau curl:
     ```bash
     curl http://localhost:3005/health
     ```
   - Jika DB terhubung, respons berisi `"database": "connected"`.
   - Jika tidak terhubung: `"database": "disconnected"` dan ada `database_error`.
   - Jika `DATABASE_URL` kosong: `"database": "not_configured"`.

**Ringkas:** DB yang Anda pakai di `psql -U postgres -d bappenda` adalah DB yang dipakai migrasi **jika** `DATABASE_URL` di **E-BPHTB_MIgration/backend/.env** mengarah ke host/user/database yang sama (biasanya `localhost`, user `postgres`, database `bappenda`). Verifikasi dengan cara 2 dan 3 di atas.

## 5.1 Kolom yang boleh kosong (a_2_verified_users)

Karena user beragam role, kolom berikut **boleh kosong/NULL**: `ppatk_khusus`, `special_field`, `pejabat_umum`, `status_ppat`, `nip`. Backend tidak memaksa kolom ini terisi untuk login atau response.

## 6. Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| ERR_CONNECTION_REFUSED ke 3005 | Backend Go tidak jalan | Jalankan `go run ./cmd/server` dari backend |
| "OCR could not extract text" | Tesseract tidak terpasang atau tidak di PATH | Install Tesseract (mis. `choco install tesseract` di Windows) |
| Register gagal "Database tidak tersedia" | PostgreSQL tidak jalan atau DATABASE_URL salah | Pastikan DB jalan dan URL benar |
| OTP tidak terkirim | Layanan email belum dikonfigurasi | OTP dicetak ke log (dev mode) |
