# Tata letak folder di server (VS Code / IIS) — `BPHTB_BOGOR_DEV_FARRAS` + `E-BPHTB_MIgration`

Dokumen ini untuk saat Anda **sudah membuka workspace di server** (seperti screenshot: root `BPHTB_BOGOR_DEV_FARRAS`, `conf.cfg/master_config.php`, `aplikasi/`, `index.php`, `web.config`).

## Rekomendasi struktur (satu akar deploy PHP)

Letakkan folder migrasi **di dalam** root aplikasi PHP yang sama, supaya satu tree mudah di-backup dan path relatif jelas:

```text
BPHTB_BOGOR_DEV_FARRAS/              ← root IIS / folder yang Anda buka di VS Code
├── conf.cfg/
│   └── master_config.php
├── aplikasi/
├── sistem/
├── index.php
├── web.config
└── E-BPHTB_MIgration/               ← salin / git clone di sini
    ├── backend/
    │   └── master_config.env.example → salin ke backend\.env lalu isi secret
    ├── frontend-next/
    └── CHAT_CONTEXT_MODULE_PORTING.md
```

Contoh path absolut umum:

`C:\inetpub\wwwroot\BPHTB_BOGOR_DEV_FARRAS\E-BPHTB_MIgration\`

**Alternatif:** `E-BPHTB_MIgration` sebagai **saudara** (sibling) folder PHP — boleh, asalkan Anda konsisten mengisi URL publik di env (tidak ada asumsi relatif file antar tree).

## Integrasi path (ringkas)

| Kebutuhan | Siapa | Nilai tipikal |
|-----------|--------|----------------|
| PHP memanggil Go (OCR, proxy upload) | `conf.cfg/master_config.php` | `define('VVF_GO_API_BASE', 'http://127.0.0.1:8000');` — Go listen di mesin yang sama |
| Next memanggil Go | `frontend-next` | Default: proxy `next.config.mjs` → `API_PROXY_TARGET` / `127.0.0.1:8000` |
| Next membuka registrasi PHP | env Next + env Go | `NEXT_PUBLIC_PHP_LEGACY_BASE_URL` = URL publik ke root PHP (mis. `http://192.168.x.x/BPHTB_BOGOR_DEV_FARRAS`) — **sama** dengan konsep `MY_BASE_URL` tanpa file `index.php` di ujung path kecuali memang dipakai |
| Go “master config” | `E-BPHTB_MIgration/backend/.env` | Isi dari `backend/master_config.env.example`; **`PHP_LEGACY_BASE_URL`** = URL yang sama untuk konsistensi metadata `GET /api/config` |

## Perintah singkat (setelah path di atas)

Dari folder server:

```powershell
cd E-BPHTB_MIgration\backend
copy master_config.env.example .env
# edit .env: DATABASE_URL, PHP_LEGACY_BASE_URL, MSSQL_*, SMTP_*, dll.

go run ./cmd/server
```

Terminal lain:

```powershell
cd E-BPHTB_MIgration\frontend-next
copy .env.local.example .env.local
# set NEXT_PUBLIC_PHP_LEGACY_BASE_URL jika registrasi lewat PHP

npm install
npm run dev
```

## IIS

- **PHP** tetap dilayani oleh site yang mengarah ke `BPHTB_BOGOR_DEV_FARRAS` (sudah ada `web.config`).
- **Go** biasanya proses **terpisah** (Windows Service / NSSM / task scheduler) di port **8000**.
- **Next** dev: port **3000**; produksi: `npm run build` + `npm run start` atau reverse proxy (ARR) dari hostname ke `localhost:3000`.

## Multi-root VS Code (opsional)

Jika Anda ingin **dua root** sekaligus (PHP tree + migrasi saja):

- File → Add Folder to Workspace → tambahkan `E-BPHTB_MIgration` jika ia di sibling, atau cukup satu folder `BPHTB_BOGOR_DEV_FARRAS` jika migrasi sudah di subfolder seperti di atas.

---

Pemetaan detail env ↔ `master_config.php`: `backend/internal/config/master_parity.go` dan `backend/master_config.env.example`.
