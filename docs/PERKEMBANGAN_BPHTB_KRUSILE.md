# Perkembangan E-BPHTB Krusile

Dokumen ini mencatat **perkembangan (development progress)** sistem E-BPHTB dalam konteks **Krusile** — migrasi dan perbaikan layanan daftar, auth, dan database.  
Referensi: `KRUSILE_ENGINEERING_BRIEF.md`, `KRUSILE_IMPLEMENTATION_SNIPPETS.md`, `SKEMA_LAYANAN_DAFTAR_BAPPENDA_BPHTB.md`.

---

## 1. Ringkasan Konteks

| Aspek | Keterangan |
|-------|------------|
| **Krusile** | Nama konteks arsitektur/engineering untuk E-BPHTB: performa web, notifikasi, keamanan, optimasi backend. |
| **Target migrasi** | Backend **Golang** (port 3005), frontend **Next.js** (port 3000); menggantikan Node.js di `E-BPHTB_root_utama`. |
| **Workspace** | `E-BPHTB_MIgration/` — backend Go, frontend-next, database migrations. |

---

## 2. Perkembangan Backend (Go)

- **Auth API:** Register, Login, Verify OTP, Resend OTP, Upload KTP, KTP OCR verification.
- **Registrasi:** Form `application/x-www-form-urlencoded`; fallback baca nilai dari DOM untuk autofill.
- **Email:** Modul `internal/email` — SendGrid atau SMTP (Gmail); `SendOTP()`, `SendUserIDNotification()` untuk notifikasi User ID ke WP setelah verifikasi.
- **Login:** Query `GetByIdentifierForLogin` memakai kolom **`ppat_khusus`** (bukan `ppatk_khusus`) dan filter `verifiedstatus = 'complete'`.
- **Blokir pendaftaran:** Hanya jika email sudah di `a_2_verified_users` dengan **`verified_pending`** atau **`complete`**; user yang masih di `a_1_unverified_users` (pending OTP) tetap boleh mendaftar ulang / dapat OTP baru.

---

## 3. Perkembangan Frontend (Next.js)

- **Halaman daftar** (`/daftar`): Form registrasi per verse (WP, Karyawan, PU); upload KTP, OCR, validasi.
- **Verifikasi OTP** (`/verifikasi-otp`): Input OTP 6 digit, timer, resend OTP; setelah sukses redirect ke `/login`.
- **Login** (`/login`): Identifier (email/userid/username) + password; redirect ke dashboard sesuai profil.
- **API base URL:** Konfigurasi via `getBackendBaseUrl()` untuk proxy/rewrite ke backend Go.

---

## 4. Perkembangan Database (PostgreSQL)

| Migration | Deskripsi |
|-----------|-----------|
| `004_add_ktp_ocr_json_to_a_1.sql` | Kolom `ktp_ocr_json` di `a_1_unverified_users` untuk hasil OCR. |
| `005_add_ppat_khusus_to_a_2.sql` | Kolom PPAT di `a_2_verified_users` (sebelum rename). |
| `006_rename_ppatk_khusus_to_ppat_khusus.sql` | Rename `ppatk_khusus` → `ppat_khusus`. |
| `007_clean_non_admin_cascade.sql` | Pembersihan data non-admin (cascade); sisakan divisi Administrator. |

---

## 5. Perkembangan Logika Registrasi & Verifikasi

### 5.1 Verse dan verifiedstatus

- **WP (Wajib Pajak):** Setelah verifikasi OTP → `verifiedstatus = 'complete'`; User ID (mis. WP01) dikirim via email; bisa langsung login.
- **Karyawan & PU:** Setelah verifikasi OTP → `verifiedstatus = 'verified_pending'`; menunggu admin set userid/divisi; belum bisa login sampai status diubah ke `complete`.

### 5.2 Blokir pendaftaran

- **Tidak boleh daftar:** Email sudah ada di `a_2_verified_users` dengan `verifiedstatus` **`verified_pending`** atau **`complete`**.
- **Boleh daftar:** Email hanya di `a_1_unverified_users` (masih pending OTP) — bisa update data dan dapat OTP baru.

### 5.3 Email

- **OTP:** Dikirim saat register dan resend-otp (SendGrid atau SMTP).
- **User ID (WP):** Setelah verify OTP berhasil, WP menerima email berisi User ID agar bisa login.

---

## 6. Perbaikan Krusial yang Sudah Diterapkan

| No | Masalah | Perbaikan |
|----|---------|-----------|
| 1 | WP dapat `verified_pending` setelah OTP | WP diset `verifiedstatus = 'complete'` saat verify-otp. |
| 2 | Email User ID tidak dikirim ke WP | Tambah `SendUserIDNotification(to, nama, userid)` dan dipanggil setelah WP verify OTP. |
| 3 | Login error: kolom `ppatk_khusus` tidak ada | Query login pakai kolom **`ppat_khusus`** (repository `user.go`). |
| 4 | Semua email di `a_2` diblokir daftar | Hanya `verified_pending` dan `complete` yang memblokir; pending OTP di `a_1` tetap boleh daftar. |
| 5 | PU verify-otp memanggil GeneratePPATNumber | Untuk PU, `ppat_khusus` dibiarkan kosong (diisi admin nanti). |
| 6 | Duplicate key saat verify OTP (race) | Penanganan error 23505: pesan "Akun sudah terverifikasi", hapus dari `a_1_unverified_users`. |
| 7 | Email sudah terdaftar | Response `code: "EMAIL_ALREADY_REGISTERED"`; frontend tampilkan tombol Masuk ke `/login`. |

---

## 7. Referensi Dokumen

| Dokumen | Isi |
|---------|-----|
| `docs/SKEMA_LAYANAN_DAFTAR_BAPPENDA_BPHTB.md` | Skema daftar, verse, tabel, endpoint, verifiedstatus. |
| `docs/KRUSILE_ENGINEERING_BRIEF.md` | Arsitektur performa, notifikasi, keamanan, optimasi backend. |
| `docs/KRUSILE_IMPLEMENTATION_SNIPPETS.md` | Snippet implementasi (rate limit, session, Redis, path safety). |
| `E-BPHTB_MIgration/README.md` | Arsitektur migrasi, cara menjalankan backend Go dan frontend Next. |

---

*Dokumen perkembangan ini diperbarui seiring perubahan fitur dan perbaikan di codebase E-BPHTB Krusile.*
