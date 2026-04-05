# E-BPHTB Migration

Workspace untuk migrasi bertahap dari Node.js (E-BPHTB_root_utama) ke **Next.js** (frontend) dan **Golang** (backend).

## Pengingat arsitektur

- **E-BPHTB_root_utama** — Masih memakai **Node.js** sebagai backend. Aplikasi besar dan Node.js berat, risiko layanan down bila beban tinggi. Dipakai sementara selama migrasi.
- **E-BPHTB_MIgration** — Target akhir: **backend sepenuhnya Golang**, **frontend sepenuhnya Next.js**. Di folder migrasi tidak mengandalkan Node.js sebagai server; Node hanya dipakai sementara (mis. proxy Go → Node untuk endpoint yang belum selesai di-port ke Go). Semua layanan produksi nanti jalan di Go + Next.js.


- **frontend-next/** — Aplikasi Next.js (TSX), port 3000. Menggantikan halaman HTML statis di `E-BPHTB_root_utama/public/`. Asset (gambar, logo) agar tersedia di `/asset/...` harus diletakkan di `frontend-next/public/asset/`.
- **backend/** — Backend Golang (step 1 selesai: health, /api/config, graceful shutdown). Migrasi per 10 step; lihat backend/README.md dan docs/RANCANGAN_MIGRASI_PENUH.md.
- **migrated/node/** — Modul Node.js yang sudah dipindah ke sini (sumber tunggal). Saat ini: KTP OCR (utils/ktpOCR.js, utils/ktpOCRClient.js). Backend di root_utama mengimpor dari sini.
- **sandbox/** — Skrip uji (mis. run-ktp-ocr.js) untuk modul migrasi.
- **docs/MIGRASI_STATUS.md** — Checklist bagian mana yang sudah/belum dipindah dan siap sandbox/blackbox.

## Menjalankan dari root repo

```bash
# Backend Node (legacy) — E-BPHTB_root_utama
npm run dev:backend

# Frontend Next — E-BPHTB_MIgration/frontend-next
npm run install:next
npm run dev:next
```

Backend Go (step 1):

```bash
cd E-BPHTB_MIgration/backend
go run ./cmd/server
# Listen di http://localhost:8000; curl http://localhost:8000/health
```

Atau dari folder ini:

```bash
cd frontend-next
npm install
npm run dev
```

## Dokumen terkait

- **Cara run lokal (backend + Next):** `docs/SOP_DEV_LOKAL.md`
- **Uji registrasi (karyawan) + KTP OCR di localhost:3000:** `docs/UJI_REGISTRASI_LOKAL.md`
- **Checklist 10 hari & regresi:** `docs/CHECKLIST_10_HARI.md`, `docs/REGRESI_JALUR_UTAMA.md`
- Rancangan migrasi penuh: `docs/RANCANGAN_MIGRASI_PENUH.md`
