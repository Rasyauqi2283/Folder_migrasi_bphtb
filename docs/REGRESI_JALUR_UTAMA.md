# Checklist Regresi — Jalur Utama (Rencana 10 Hari, Hari 9)

Digunakan untuk uji jalur utama setelah migrasi bertahap ke Next.js. Backend tetap Node (E-BPHTB_root_utama).

## Prasyarat

- Backend Node jalan: `npm run dev` atau `npm run dev:backend` (port 3000 atau fallback 3001/3002).
- Next.js jalan: `npm run dev:next` (port 3000) atau `npm run dev:next:3100` (port 3100).
- PostgreSQL lokal dengan database `bappenda` (untuk login/daftar).

## Checklist

### 1. Landing (Next.js)

- [ ] Buka http://localhost:3000 (atau 3100 jika Next di 3100).
- [ ] Halaman menampilkan "Selamat Datang di E-BPHTB Kabupaten Bogor", ilustrasi, tombol "Cek Keaslian Dokumen".
- [ ] Header: logo BAPPENDA, "E-BPHTB", "Masuk", "Registrasi" (dropdown: WP, Karyawan, PPAT/PPATS).
- [ ] Footer: copyright, indikator backend (titik hijau = backend terhubung).
- [ ] Klik "Cek Keaslian Dokumen" mengarah ke halaman validasi (legacy atau link yang benar).

### 2. Login (Next.js)

- [ ] Klik "Masuk" → halaman login Next.js.
- [ ] Input UserID dan Kata Sandi, submit.
- [ ] Jika salah: pesan error tampil.
- [ ] Jika benar: redirect ke dashboard legacy sesuai divisi (atau profile-completetask jika belum lengkap).
- [ ] Link "Lupa Kata Sandi" dan "Daftar Disini" berfungsi.

### 3. Daftar (Next.js)

- [ ] Dari header pilih Registrasi → Wajib Pajak / Karyawan / PPAT/PPATS → halaman daftar dengan field sesuai verse.
- [ ] Upload KTP → status upload tampil (sukses/gagal).
- [ ] Isi form, submit → pesan sukses dan redirect ke verifikasi OTP (legacy) atau pesan error.

### 4. Auth shell

- [ ] Setelah login (legacy), buka lagi landing Next.js: header menampilkan nama user dan "Keluar".
- [ ] Klik "Keluar" → redirect ke /login, localStorage bersih.
- [ ] Buka /dashboard (Next.js) tanpa login → redirect ke /login.
- [ ] Login lalu buka /dashboard → halaman dashboard tampil (link ke legacy dashboard).

### 5. Backend health

- [ ] Dengan backend Node mati: buka landing Next.js → indikator backend (titik abu).
- [ ] Dengan backend Node hidup: indikator hijau.

## Endpoint kritikal (backend Node)

- `GET /api/config` — dipanggil Next.js untuk health check.
- `POST /api/v1/auth/login` — login.
- `POST /api/v1/auth/register` — daftar.
- `POST /api/v1/auth/upload-ktp` — upload KTP (daftar).

## Catatan

- Halaman legacy (public/*.html) tetap ada dan tidak dihapus; migrasi halaman ke Next.js bertahap.
- Jika ditemukan bug, perbaiki dan centang ulang item yang gagal.
