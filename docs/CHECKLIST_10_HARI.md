# Checklist Akhir 10 Hari — Pondasi index.js → Next.js

Setelah rencana 10 hari, gunakan dokumen ini untuk freeze dan memastikan siap lanjut ke fase berikutnya (pilot Golang, migrasi halaman lanjutan).

## Deliverable (sudah tercapai)

| Item | Status |
|------|--------|
| `index.js` lebih kecil dan modular (bootstrap: config, middleware, routes, server start) | ✅ |
| Port fallback (3000 → 3001 → 3002) + graceful shutdown | ✅ |
| Isu EADDRINUSE berkurang (fallback + shutdown bersih) | ✅ |
| App Next.js `frontend-next/` jalan di http://localhost:3000 atau 3100 | ✅ |
| Minimal 1 halaman UI pindah ke Next.js (landing, login, daftar, dashboard shell) | ✅ |
| Dokumen transisi dan cara run lokal | ✅ |

## Dokumentasi

- **Cara run lokal:** [docs/SOP_DEV_LOKAL.md](SOP_DEV_LOKAL.md)
- **Checklist regresi jalur utama:** [docs/REGRESI_JALUR_UTAMA.md](REGRESI_JALUR_UTAMA.md)
- **Matriks env:** [.env.example](../.env.example) (root repo)

## Struktur relevan

- **Backend Node:** `E-BPHTB_root_utama/index.js`, `backend/bootstrap/` (runtime-config, logger, middleware, start-server, server-lifecycle).
- **Frontend Next.js:** `E-BPHTB_MIgration/frontend-next/` — `app/page.tsx` (landing), `app/login/`, `app/daftar/`, `app/(protected)/dashboard/`, `app/context/AuthContext.tsx`, `app/components/RequireAuth.tsx`, `BackendHealth`, `LandingHeader`, `RasproLogo`.

## Freeze

- Tidak mengubah kontrak API backend yang dipanggil Next.js (login, register, upload-ktp, config).
- Halaman legacy di `E-BPHTB_root_utama/public/` tetap ada; tidak dihapus sampai digantikan resmi.

## Siap lanjut fase berikutnya

- [ ] Regresi jalur utama (landing, login, daftar, auth shell, health) sudah dijalankan sesuai REGRESI_JALUR_UTAMA.md.
- [ ] Env lokal (.env dari .env.example) diset untuk LOCAL_DEV=1, NODE_ENV=development, PORT, PG_*, SESSION_SECRET.
- [ ] Mulai pilot Golang per domain (mis. notifikasi atau reporting) di belakang API gateway/proxy; frontend tetap memanggil backend Node sampai endpoint Go siap.
