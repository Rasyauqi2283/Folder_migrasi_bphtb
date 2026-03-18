# Error Progress Per Page – Peneliti Validasi

## Ringkasan error yang pernah muncul

- **GET /api/peneliti/get-berkas-till-verif 401 (Unauthorized)**  
Dashboard Peneliti Validasi memanggil endpoint role **Peneliti**, sehingga mengembalikan 401 untuk user Peneliti Validasi.
- **GET /api/pv/cert/list 502 (Bad Gateway)**  
Backend Go tidak jalan atau endpoint `/api/pv/cert/list` di-proxy ke Node dan Node tidak merespons (pastikan backend di port 8000 jalan dan env `.env.local` frontend mengarah ke 8000).

---

## Perbaikan yang sudah dilakukan


| No  | Masalah                                                                   | Perbaikan                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Dashboard memanggil `/api/peneliti/get-berkas-till-verif` (role Peneliti) | Dashboard Peneliti Validasi sekarang hanya memakai API paraf/pv: `**/api/paraf/get-berkas-pending`** untuk kartu "Berkas Pending", `**/api/paraf/get-monitoring-documents**` untuk monitoring, `**/api/pv/cert/list**` untuk sertifikat. 401 pada get-berkas-till-verif tidak lagi dipanggil. |
| 2   | 502 pada `/api/pv/cert/list`                                              | Pastikan backend Go jalan di **port 8000** dan frontend `.env.local` berisi `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`. Jika endpoint cert masih di-proxy ke Node, pastikan layanan Node juga jalan.                                                                                    |
| 3   | Halaman Tanda Paraf hanya link ke legacy                                  | Halaman **Tanda Paraf** dirakit ulang di Next.js: upload file, canvas gambar, preview tanda tangan baru & yang dipakai, integrasi `/api/v1/auth/profile` dan `/api/v1/auth/update-profile-paraf`. Tidak lagi bergantung ke `tanda_paraf.html`.                                                |
| 4   | Halaman Monitoring Verifikasi sederhana                                   | Halaman **Monitoring Verifikasi** dirakit ulang: filter (Semua / Sudah Divalidasi / Ditolak), tabel gaya gothic, pagination, page size, modal detail dengan link PDF (Validasi & Verif Paraf) dan dokumen terkait. Data dari `/api/paraf/get-monitoring-documents`.                           |


---

## Verifikasi

- Login sebagai **Peneliti Validasi** → Dashboard tidak lagi memanggil API Peneliti; hitungan Berkas Pending dan Monitoring dari API paraf.
- **Tanda Paraf**: upload/gambar paraf, simpan, preview baru dan yang dipakai tampil.
- **Monitoring Verifikasi**: data tabel, filter, pagination, dan modal detail berfungsi; link PDF membuka tab baru.

