# E-BPHTB Backend (Golang)

Migrasi bertahap dari `E-BPHTB_root_utama/index.js` ke Go dalam **10 step**. Rancangan lengkap: `docs/RANCANGAN_MIGRASI_PENUH.md`.

## Step yang sudah diimplementasi

| Step | Isi | Status |
|------|-----|--------|
| 1 | Config env, server HTTP, GET /health, GET /api/config, graceful shutdown | Done |
| 2–9 | CORS, DB, auth, session, PPAT, admin, proxy ke Node | Rencana (lihat RANCANGAN_MIGRASI_PENUH.md) |
| 10 | Graceful shutdown (sudah ada di step 1) | Done |

## Menjalankan

```bash
cd E-BPHTB_MIgration/backend
go run ./cmd/server
```

Server listen di port **8000** (sama untuk lokal & Koyeb; hanya env `PORT` dipakai, default 8000).

## Env (opsional)

- `PORT` — port server (default **8000**; Koyeb set PORT=8000)
- `NODE_ENV` — environment (development/production)
- `API_URL` — URL API untuk response /api/config
- `DATABASE_URL` — connection string PostgreSQL (untuk step 3+)
- **`CORS_ORIGINS`** — untuk **production (Koyeb)** wajib di-set ke domain frontend Vercel, contoh: `https://bphtbbappenda.vercel.app`. Jika tidak diset, backend hanya mengizinkan `http://localhost:3000` dan request dari Vercel akan kena CORS. Beberapa origin pisah koma.

## Verifikasi step 1

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/config
```
