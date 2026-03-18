# Role (Divisi) di E-BPHTB

Dokumen ini mendata semua **role/divisi** yang dipakai di aplikasi. Role disimpan di kolom `divisi` pada tabel `a_2_verified_users`. Setelah penambahan kolom `verse`, role akan dikelompokkan ke dalam 3 kategori: **Karyawan**, **PU**, **WP**.

---

## 1. Jumlah role saat ini

**Total: 10 divisi** (didefinisikan di `backend/utils/constant.js` sebagai `DIVISI_MAP`), plus **2–3 varian admin** yang diperlakukan setara di middleware.

| No | Divisi | Kode | Keterangan |
|----|--------|------|------------|
| 1 | PPAT | PAT | Pejabat Pembuat Akta Tanah |
| 2 | PPATS | PATS | PPAT Khusus |
| 3 | Administrator | A | Admin sistem |
| 4 | Customer Service | CS | Layanan pelanggan |
| 5 | LTB | LTB | Loket Terima Berkas |
| 6 | LSB | LSB | Loket Serah Berkas (alias: "Loket Serah Berkas") |
| 7 | Peneliti | P | Peneliti |
| 8 | Peneliti Validasi | PV | Peneliti Validasi |
| 9 | Wajib Pajak | WP | Wajib Pajak (alias: "WP") |
| 10 | BANK | BANK | Bank (verifikasi pembayaran) |

**Varian admin (di middleware):** `Admin`, `Administrator`, `Super Admin` — ketiganya dianggap sebagai role admin.

---

## 2. Pengelompokan ke `verse` (rencana)

Kolom **`verse`** di `a_2_verified_users` akan mengelompokkan user ke dalam 3 kategori:

| verse | Divisi yang termasuk |
|-------|----------------------|
| **Karyawan** | LTB, LSB, Peneliti, Peneliti Validasi, BANK, Administrator, Admin, Super Admin, Customer Service |
| **PU** | PPAT, PPATS |
| **WP** | Wajib Pajak (WP) |

---

## 3. Sumber di codebase

- **Definisi resmi:** `E-BPHTB_root_utama/backend/utils/constant.js` — `DIVISI_MAP`, `ID_PATTERNS`.
- **Notifikasi (recipient_divisi):** `backend/routesxcontroller/3_notification/notification_service.js` — Administrator, LTB, BANK, Peneliti, Peneliti Validasi, LSB, plus `booking.ppat_divisi` (PPAT/PPATS).
- **Admin/validator:** `backend/routesxcontroller/4_admin/adminRoutes.js` — verifyAdmin (Admin, Administrator, Super Admin), verifyValidationRoles (+ Peneliti Validasi, LSB, Loket Serah Berkas).
- **Auth & complete-profile:** `backend/routesxcontroller/1_auth/authRoutes.js` — redirect dan validasi profil per divisi (Wajib Pajak, PPAT, PPATS, Peneliti Validasi); NIP untuk non-WP/non-PPAT; special_field dan pejabat_umum untuk PPAT/PPATS; special_parafv untuk Peneliti Validasi.
