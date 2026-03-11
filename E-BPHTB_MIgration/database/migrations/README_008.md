# Migration 008: Tukar Kolom 4 dan 7

## Maksud
- **Sebelum:** Kolom 1–3 (nama, nik, telepon) = data diri; kolom 4 = email (beda); kolom 5–6 = password, foto; kolom 7 = otp (data diri).
- **Sesudah:** Kolom 4 dan 7 ditukar sehingga urutan 7 kolom pertama menjadi:  
  **1=nama, 2=nik, 3=telepon, 4=otp, 5=password, 6=foto, 7=email.**

## Tabel yang diubah
- `a_1_unverified_users`
- `a_2_verified_users`

## Cara jalan
1. Buat tabel baru dengan urutan kolom yang sudah ditukar (4=otp, 7=email).
2. Salin data dari tabel lama ke tabel baru.
3. Hapus tabel lama, ganti nama tabel baru menjadi nama tabel lama.
4. Set sequence `id` agar insert baru tidak bentrok.

## Aplikasi (Go)
Tidak perlu diubah. INSERT/SELECT memakai **nama kolom**, bukan urutan posisi, jadi perilaku aplikasi tetap sama.

## Menjalankan
```bash
psql -U <user> -d <database> -f database/migrations/008_reorder_columns_swap_4_and_7.sql
```

## Syarat
- Migrasi 001–007 (dan migrasi lain yang menambah kolom di `a_1`/`a_2`) harus sudah dijalankan.
- Tabel `a_1_unverified_users` harus punya kolom: gender, verse, nip, special_field, pejabat_umum, divisi, ktp_ocr_json, created_at (sesuai yang dipakai di kode). Jika belum, sesuaikan isi `008_reorder_columns_swap_4_and_7.sql` dengan skema Anda.
