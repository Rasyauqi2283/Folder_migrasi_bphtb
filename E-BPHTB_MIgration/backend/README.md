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

Server listen di port **8000** (sama untuk lokal & Koyeb; env `PORT` / `GO_PORT` / `BACKEND_GO_PORT` opsional).

## Env (opsional)

- `GO_PORT` atau `BACKEND_GO_PORT` — port server (default 3005)
- `NODE_ENV` — environment (development/production)
- `API_URL` — URL API untuk response /api/config
- `DATABASE_URL` — connection string PostgreSQL (untuk step 3+)

## Verifikasi step 1

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/config
```
