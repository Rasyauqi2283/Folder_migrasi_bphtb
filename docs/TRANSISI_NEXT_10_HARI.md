# Transisi 10 Hari: Node Backend -> Next Frontend

Dokumen ini menjadi SOP operasional fase pertama migrasi bertahap.

## Topologi Dev Lokal

- Backend legacy (Express): `http://localhost:3001` (atau 3002) — saat Next jalan di 3000, set `PORT=3001` di .env agar tidak bentrok.
- Frontend Next (E-BPHTB_MIgration/frontend-next): `http://localhost:3000`
- Next.js tetap memanggil API backend legacy pada fase ini.

## Variabel Environment Inti

Di root `.env`:

- `LOCAL_DEV=1`
- `NODE_ENV=development`
- `PORT=3000`
- `NEXT_PORT=3000`
- `STARTUP_QUIET=1`

Di `E-BPHTB_MIgration/frontend-next/.env.local` (copy dari `.env.local.example`):

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`
- `NEXT_PUBLIC_LEGACY_BASE_URL=http://localhost:3000`

## Cara Menjalankan

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (frontend Next):

```bash
npm run install:next
npm run dev:next
```

## Verifikasi Minimum

1. Backend start dan menampilkan `Ready`.
2. Jika `3000` sudah terpakai, backend fallback otomatis ke `3001`/`3002`.
3. Next start di `3000`.
4. Halaman `http://localhost:3000` terbuka.
5. Panel "Koneksi Backend Lama" pada halaman Next menampilkan status terhubung.
6. Link `Masuk`/`Registrasi`/`Cek Keaslian Dokumen` tetap menuju halaman legacy.

## Catatan Fase 1

- Migrasi UI baru dimulai dari halaman landing.
- Endpoint API belum dipindahkan ke Go pada fase ini.
- Backend legacy tetap menjadi sumber utama logic bisnis.
