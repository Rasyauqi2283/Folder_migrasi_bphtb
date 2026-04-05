# E-BPHTB Migration — Panduan Development

> **Produksi (Railway) tidak dipakai.** Semua development dan pengecekan berkala memakai backend lokal di folder migrasi.

## Mana yang dibuka saat `npm run dev`?

| Perintah | Folder / Server | Port |
|----------|-----------------|------|
| `npm run dev` (di root) | E-BPHTB_root_utama (Node) — **jangan pakai** | 3000 |
| `npm run dev:next` | **E-BPHTB_MIgration/frontend-next** (Next.js) | 3000 |
| `npm run dev:go` | **E-BPHTB_MIgration/backend** (Go) | 8000 |

**Untuk kerja di migrasi:** Gunakan `npm run dev:next` dan `npm run dev:go`.

## Alur Lokal (Tanpa Railway)

1. **Backend Go** (API, login, register, dll.):
   ```bash
   npm run dev:go
   ```
   Berjalan di `http://localhost:8000`.

2. **Frontend Next.js**:
   ```bash
   npm run dev:next
   ```
   Berjalan di `http://localhost:3000`. Mem-proxy `/api/*` ke Go (3005).

3. **Backend Node** (opsional, untuk upload KTP / OCR):
   ```bash
   # Dari root utama (hanya jika butuh OCR/upload-ktp)
   PORT=3001 node E-BPHTB_root_utama/index.js
   ```
   Backend Go mem-proxy beberapa endpoint ke Node 3001.

## Login tanpa CORS

Next.js mem-proxy `/api/*` ke backend Go lokal. Tidak perlu CORS.

## Env vars (opsional)

- `NEXT_PUBLIC_LEGACY_BASE_URL` — URL backend (default: `http://localhost:8000`)
- `NEXT_PUBLIC_API_BASE_URL` — alias untuk LEGACY_BASE_URL

## EasyOCR (Primary) + Tesseract (Fallback)

Lihat **[DOCKER_SETUP.md](DOCKER_SETUP.md)** untuk panduan instalasi Docker dan troubleshooting.

1. Jalankan service EasyOCR (Docker):
   ```powershell
   docker compose up -d easyocr
   ```
   Jika Docker tidak tersedia, jalankan tanpa Docker:
   ```powershell
   cd ocr-easy-service
   .\run-local.ps1
   ```
2. Cek health service:
   ```bash
   curl http://localhost:8010/health
   ```
3. Jalankan backend + frontend seperti biasa:
   - `npm run dev:go`
   - `npm run dev:next`
4. Endpoint `real-ktp-verification` akan mencoba EasyOCR dulu, lalu otomatis fallback ke Tesseract jika hasil lemah/timeout/error.

### Konfigurasi backend (.env)

- `EASYOCR_ENABLED=true`
- `EASYOCR_URL=http://localhost:8010/ocr`
- `EASYOCR_TIMEOUT_MS=8000`

## Pengecekan Berkala

1. Jalankan `npm run dev:go` dan `npm run dev:next`.
2. Akses `http://localhost:3000/login` dan uji login.
3. Akses `http://localhost:3000/daftar` dan uji registrasi.
4. Pastikan tidak ada referensi ke Railway/produksi.
