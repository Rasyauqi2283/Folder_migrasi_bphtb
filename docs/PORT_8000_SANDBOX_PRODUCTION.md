# Port 8000 — Sandbox & Production Sama

Backend Go memakai **port 8000** di mana pun (localhost dan Koyeb). Frontend Next.js mem-proxy `/api/*` ke backend. Agar tidak 502 Bad Gateway, pastikan konfigurasi berikut konsisten.

## Ringkasan

| Lingkungan | Backend Go | Frontend Next | Proxy target |
|------------|------------|----------------|--------------|
| Lokal      | `http://localhost:8000` | `http://localhost:3000` | `http://127.0.0.1:8000` |
| Koyeb      | Port 8000 (otomatis)    | Vercel                    | `NEXT_PUBLIC_API_BASE_URL` = URL Koyeb |

## Yang sudah diset (default)

- **Backend** (`config.go`): default port **8000**. Env `PORT` / `GO_PORT` / `BACKEND_GO_PORT` opsional.
- **Frontend** (`lib/api.ts`, `next.config.mjs`): default proxy target **http://localhost:8000** (lokal) / **http://127.0.0.1:8000** (rewrite).

## Cek kalau dapat 502 Bad Gateway

1. **Backend benar-benar di 8000**
   - Lokal: `curl http://localhost:8000/health` harus OK.
   - Jangan set `GO_PORT=3005` atau `PORT=3005` di env backend.

2. **Frontend mem-proxy ke 8000**
   - Jangan set `NEXT_PUBLIC_LEGACY_BASE_URL=http://localhost:3005` (atau port lain) di `.env.local` frontend.
   - Kalau tidak set env, default sudah **8000**.

3. **Restart & rebuild setelah ganti port**
   - Setelah mengubah default port atau env proxy, **restart** `npm run dev` (Next.js) agar rewrite pakai target baru.
   - Kalau pakai build: hapus cache lalu build lagi:
     ```bash
     cd E-BPHTB_MIgration/frontend-next
     rm -rf .next
     npm run build
     ```

4. **Production (Vercel + Koyeb)**
   - Di Vercel: set **NEXT_PUBLIC_API_BASE_URL** (atau **NEXT_PUBLIC_LEGACY_BASE_URL**) = URL backend Koyeb, mis. `https://bphtb-backend-rasyaproduction.koyeb.app` (tanpa trailing slash).
   - Di Koyeb: port service tetap **8000**; tidak perlu set env PORT kecuali platform memaksa.

## Env (opsional)

- **Lokal backend**: `PORT=8000` atau kosongkan (default 8000).
- **Lokal frontend**: kosongkan `NEXT_PUBLIC_LEGACY_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` agar pakai default `http://localhost:8000`.
- **Production frontend**: `NEXT_PUBLIC_API_BASE_URL=https://<backend-koyeb>.koyeb.app`.

Dengan ini, sandbox dan production memakai port/URL yang sama secara konsep (backend 8000), sehingga maintenance tetap sederhana.
