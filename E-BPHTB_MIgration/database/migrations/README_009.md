# Migration 009 — Rapikan urutan kolom

## Perubahan

### a_1_unverified_users
- **ktp_ocr_json** dipindah ke kolom terakhir sebelum `created_at`.
- Urutan baru: id, nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, gender, verse, nip, special_field, pejabat_umum, divisi, **ktp_ocr_json**, created_at.

### a_2_verified_users
- **username** dan **statuspengguna** ditukar posisi (username sebelum statuspengguna).
- Urutan baru setelah divisi: username, statuspengguna, nip, special_parafv, special_field, ppat_khusus, pejabat_umum, status_ppat, tanda_tangan_path, tanda_tangan_mime, last_active, gender, verse.

## Cara menjalankan

```bash
psql -U postgres -d bappenda -f E-BPHTB_MIgration/database/migrations/009_reorder_columns_a1_ktp_a2_username.sql
```

Atau dari dalam psql:
```sql
\i E-BPHTB_MIgration/database/migrations/009_reorder_columns_a1_ktp_a2_username.sql
```

## Catatan
- Migration ini menggunakan transaksi (BEGIN/COMMIT). Jika terjadi error, semua perubahan akan di-rollback.
- Jika tabel `sys_notifications` tidak ada, baris ADD CONSTRAINT untuk FK bisa di-comment atau dilewati.
- Backend Go tidak perlu diubah — INSERT menggunakan nama kolom, bukan urutan posisi.
