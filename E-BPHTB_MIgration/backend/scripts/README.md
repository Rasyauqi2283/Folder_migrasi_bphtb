# Scripts Backend E-BPHTB

## Seed akun dummy (semua role)

File `seed_dummy_users_all_roles.sql` menambahkan **satu akun dummy per role** yang belum ada di data uji. Password semua akun: **Farras** (6 huruf).

- **Role yang sudah ada** (tidak di-insert lagi): Administrator (A01, A02, SA01), Wajib Pajak (WP01).
- **Role yang di-insert**: PPAT, PPATS, Notaris, BANK, LTB, LSB, Customer Service, Peneliti, Peneliti Validasi.

### Cara menjalankan

Dari folder **backend** (atau dengan path penuh ke file):

```bash
psql -U postgres -d bappenda -f scripts/seed_dummy_users_all_roles.sql
```

Anda akan diminta password postgres. Di akhir, script menampilkan daftar user complete.

### Akun dummy setelah seed

| User ID | Divisi            | Email                    | Password |
|---------|-------------------|--------------------------|----------|
| PAT01   | PPAT              | dummy-ppat@test.local    | Farras   |
| PATS01  | PPATS             | dummy-ppats@test.local   | Farras   |
| NOTA01  | Notaris           | dummy-notaris@test.local | Farras   |
| BANK01  | BANK              | dummy-bank@test.local   | Farras   |
| LTB01   | LTB               | dummy-ltb@test.local     | Farras   |
| LSB01   | LSB               | dummy-lsb@test.local     | Farras   |
| CS01    | Customer Service  | dummy-cs@test.local      | Farras   |
| P01     | Peneliti          | dummy-peneliti@test.local| Farras   |
| PV01    | Peneliti Validasi | dummy-pv@test.local      | Farras   |

Userid mengikuti format: **01, 02, … 09, 10, … 99, 100, 1000, … 99999** (tanpa leading zero kecuali 01–09).

Script bisa dijalankan ulang: dummy lama (email `dummy-*@test.local`) akan dihapus dulu, lalu di-insert lagi.

## Generate hash bcrypt

Untuk menghasilkan hash bcrypt password lain (default "Farras"):

```bash
go run ./cmd/genhash
go run ./cmd/genhash "PasswordBaru"
```
