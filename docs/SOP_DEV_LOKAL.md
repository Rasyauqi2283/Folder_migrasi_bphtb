# SOP Development Lokal — E-BPHTB

Dokumentasi cara menjalankan backend Node dan frontend Next.js di lingkungan lokal (Rencana 10 Hari: pondasi index.js → Next.js bertahap).

## Lokasi file env

- **Backend Node:** file `.env` dibaca dari **root repo** (folder yang berisi `E-BPHTB_root_utama` dan `E-BPHTB_MIgration`). Copy dari `.env.example` di root repo.
- **Next.js:** bisa pakai `.env.local` di `E-BPHTB_MIgration/frontend-next/` untuk `NEXT_PUBLIC_LEGACY_BASE_URL=http://localhost:3000`.

## Matriks Environment

| Variabel | Deskripsi | Nilai khas (lokal) |
|----------|-----------|---------------------|
| `LOCAL_DEV` | Mode dev lokal: DB pakai PG_*, CORS/API pakai localhost | `1` |
| `NODE_ENV` | Environment Node | `development` |
| `PORT` | Port backend Node (index.js) | `3000` |
| `NEXT_PORT` | Port Next.js bila jalan terpisah (dipakai backend untuk CORS) | `3100` |
| `STARTUP_QUIET` | Log startup ringkas (seperti Next.js) | `1` |
| `SESSION_SECRET` | Secret session (wajib; ganti dengan string acak) | - |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` | PostgreSQL lokal | localhost, 5432, bappenda, postgres, … |
| `KTP_OCR_SERVICE_URL` | URL service KTP Scanner (DL/ML). Kosongkan atau matikan service = fallback Tesseract | `http://localhost:8001` |

Untuk dev lokal **jangan set** (biarkan kosong atau hapus): `DATABASE_URL`, `VITE_API_URI`, `CORS_ORIGINS` ke URL Railway.

Backend mendeteksi `LOCAL_DEV=1` atau `NODE_ENV=development` untuk:

- Port fallback: jika `PORT` (mis. 3000) sibuk, otomatis mencoba 3001, 3002.
- CORS: menambah origin `http://localhost:3100` agar Next.js di port 3100 bisa panggil API.
- API URL: dipakai dari localhost sesuai port yang terbaca.

## Menjalankan Backend Node (E-BPHTB_root_utama)

```bash
cd E-BPHTB_root_utama
# Pastikan .env ada (copy dari .env.example)
node index.js
```

- Backend listen di `http://localhost:3000` (atau 3001/3002 jika 3000 sibuk).
- Log singkat: "▲ E-BPHTB", "Local: http://localhost:PORT", "Ready in Xs".
- Graceful shutdown: Ctrl+C menutup server dan pool DB dengan bersih.

## Menjalankan Frontend Next.js (E-BPHTB_MIgration/frontend-next)

```bash
cd E-BPHTB_MIgration/frontend-next
npm install
npm run dev
```

- **Hanya Next.js:** script default `next dev -p 3000` → aplikasi di http://localhost:3000.
- **Backend + Next bersamaan:** ubah script ke `"dev": "next dev -p 3100"` agar Next di http://localhost:3100 dan backend di 3000. Atau dari root repo: `npm run dev:next` (cek script di package.json).
- Set `NEXT_PUBLIC_LEGACY_BASE_URL=http://localhost:3000` (di `.env.local` atau env) agar frontend memanggil API backend lama.

## Menjalankan Keduanya (Backend + Next.js)

1. Terminal 1 — Backend:
   ```bash
   cd E-BPHTB_root_utama
   node index.js
   ```
2. Terminal 2 — Next.js (port 3100):
   ```bash
   # Dari root repo:
   npm run dev:next:3100
   # Atau dari folder frontend-next: npx next dev -p 3100
   ```
3. Buka:
   - Backend (HTML lama): `http://localhost:3000`
   - Next.js: `http://localhost:3100` (atau 3000 jika hanya Next yang jalan)

**Fitur scan KTP (real-ktp-verification):** Untuk memakai pipeline DL/ML, jalankan juga service Python KTP Scanner di port 8001 (lihat `docs/KTP_SCANNER_SERVICE.md`). Jika service tidak dijalankan, backend otomatis memakai fallback Tesseract.

## Port Bentrok (EADDRINUSE)

- Di development, backend otomatis mencoba port 3000 → 3001 → 3002.
- Jika semua kandidat dipakai, proses keluar dengan pesan jelas dan saran (hentikan proses atau set `PORT` lain di `.env`).
- Pastikan satu proses saja yang memakai satu port (jangan dua instance backend di port yang sama).

## Referensi

- Bootstrap backend: `E-BPHTB_root_utama/backend/bootstrap/` (runtime-config, logger, middleware, start-server, server-lifecycle).
- Konfigurasi env contoh: `.env.example` di root repo.
- Script dari root repo: `npm run dev` / `npm run dev:backend` (backend), `npm run dev:next` (Next.js port 3000), `npm run dev:next:3100` (Next.js port 3100, untuk dipasangkan dengan backend), `npm run start` (backend production).
- Checklist 10 hari dan regresi: `docs/CHECKLIST_10_HARI.md`, `docs/REGRESI_JALUR_UTAMA.md`.
- KTP Scanner (DL/ML): `docs/KTP_SCANNER_SERVICE.md`.
