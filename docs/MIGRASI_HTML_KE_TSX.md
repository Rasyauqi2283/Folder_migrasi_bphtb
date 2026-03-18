# Migrasi HTML ke TSX (Next.js)

Format halaman lama (HTML di `E-BPHTB_root_utama/public/`) secara bertahap dipindah ke TSX di `frontend-next/` agar siap penyesuaian ke Golang dan Next.js menyeluruh.

## Status TSX di frontend-next

| Route   | File              | Keterangan                    |
|---------|-------------------|--------------------------------|
| `/`     | app/page.tsx      | Landing (TSX)                 |
| `/login`| app/login/page.tsx| Halaman masuk (TSX, link ke legacy) |
| `/daftar` | app/daftar/page.tsx | Registrasi (TSX, query `?verse=wp|karyawan|pu`) |

- **lib/api.ts**: Helper TypeScript untuk `fetchBackendConfig`, `getLegacyBaseUrl`.
- **app/layout.tsx**: Layout root (metadata, HTML lang).

## Pola migrasi

1. **Halaman baru**: Buat di `frontend-next/app/<route>/page.tsx` (TSX).
2. **API tetap**: Panggil backend Node (dan nanti Golang) lewat `NEXT_PUBLIC_API_BASE_URL` atau proxy.
3. **Legacy**: Link ke `NEXT_PUBLIC_LEGACY_BASE_URL` (mis. `/login`, `/registrasi.html`) untuk halaman yang belum dimigrasi.

## Langkah berikutnya

- Ubah halaman HTML lain (dashboard, profile, dll.) menjadi komponen TSX per route.
- Setelah backend Go siap, arahkan `NEXT_PUBLIC_API_BASE_URL` ke layanan Go atau gateway.
- Hapus referensi ke file HTML lama setelah migrasi per halaman selesai.
