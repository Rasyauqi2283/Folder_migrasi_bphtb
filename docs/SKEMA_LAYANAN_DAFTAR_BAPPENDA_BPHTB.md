# Skema Layanan Daftar (Registrasi) BAPPENDA BPHTB

Dokumen ini mendeskripsikan alur dan skema **layanan daftar** (registrasi pengguna) di sistem E-BPHTB Kabupaten Bogor berdasarkan codebase saat ini. Gunakan sebagai acuan sebelum memulai migrasi atau perubahan; perbaiki jika ada yang tidak sesuai dengan proses bisnis yang diinginkan.

---

## 1. Ringkasan

- **Tujuan:** Pengguna baru mendaftar ke sistem E-BPHTB lewat salah satu dari tiga jalur (verse). Setiap verse punya alur dan link pendaftaran sendiri; setelah verifikasi OTP (dan untuk PU: pengisian field penyesuaian), akun dipindah ke tabel user terverifikasi.
- **Tiga jalur (verse):** **Wajib Pajak (WP)**, **Karyawan (NIP)**, **PPAT/PPATS (PU)**. Masing-masing mengarah ke link pendaftaran yang berbeda (mis. `/daftar?verse=wp`, `?verse=karyawan`, `?verse=pu`).
- **Alur per verse** (konsep):
  - **WP:** Daftar → langsung masuk `a_2_verified_users` → OTP (email/WA) → 2 tahap `verifiedstatus` (pending → verified). Nomor WP (mis. WP01) dikirim ke email. Tahap unverified dilewat/skip.
  - **Karyawan & PU:** Daftar → masuk `a_1_unverified_users` → OTP → verifikasi OTP → pindah ke `a_2_verified_users` → admin/userid sesuai verse.

---

## 2. Tiga Jalur Pendaftaran (verse) dan Link

| verse | Nama | Link pendaftaran (contoh) | Divisi hasil | Field wajib tambahan |
|-------|------|---------------------------|--------------|----------------------|
| **WP** | Wajib Pajak | `/daftar?verse=wp` | Wajib Pajak | — |
| **Karyawan** | Karyawan (NIP) | `/daftar?verse=karyawan` | *(diisi admin nanti)* | NIP |
| **PU** | PPAT / PPATS | `/daftar?verse=pu` | PPAT atau PPATS | special_field (nama PPAT/gelar), pejabat_umum, divisi (PPAT/PPATS); plus field penyesuaian (sungguh pejabat pembuat akta atau bukan) |

---

## 3. Alur per Verse (Konsep)

### 3.1 Verse WP (Wajib Pajak)

1. **Daftar** — User pilih pendaftaran Wajib Pajak (link `?verse=wp`), isi form umum + upload KTP. Data **langsung masuk** ke `a_2_verified_users` (bukan `a_1_unverified_users`).
2. **Tahap `verifiedstatus` (2 tahap — unverified dilewat). Nilai di DB:**
   - **`verified_pending`** (unverified) — User daftar dan menerima OTP (email/WA), namun belum submit atau gagal OTP.
   - **`complete`** (verified) — OTP sudah diinput dan sesuai; user mendapat nomor WP (mis. **WP01**) yang dikirim via email, dan menjadi user utuh yang bisa login.

### 3.2 Verse Karyawan

1. **Daftar** — User pilih pendaftaran Karyawan (link `?verse=karyawan`), isi form umum + **NIP** + upload KTP. Data masuk ke `a_1_unverified_users`.
2. **OTP** — Sistem kirim OTP ke email/WA; user masukkan OTP di halaman verifikasi.
3. **Verifikasi OTP** — Setelah OTP benar, data dihapus dari `a_1_unverified_users` dan di-INSERT ke `a_2_verified_users` dengan `verifiedstatus = 'verified_pending'`. Userid dan divisi **belum** di-set.
4. **Admin – Bagian Pending** — User dengan `verified_pending` tertampil di layanan admin bagian **pending**. Admin memeriksa dan memutuskan: disetujui atau tidak.
5. **Admin – Setuju** — Jika admin klik tombol **Setuju**, proses berpindah menjadi `complete`; userid dan divisi di-set oleh admin. **Email otomatis** dikirim ke user: akun sudah aktif dan bisa digunakan (berisi User ID). Setelah itu user bisa login.

### 3.3 Verse PU (PPAT/PPATS)

1. **Daftar** — User pilih pendaftaran PPAT/PPATS (link `?verse=pu`), isi form umum + **field khusus**: nama PPAT/gelar (`special_field`), pejabat umum (`pejabat_umum`), pilihan divisi (PPAT atau PPATS), serta **field penyesuaian** (data penegasan: sungguh pejabat pembuat akta atau bukan). Data masuk ke `a_1_unverified_users`.
2. **OTP** — Sistem kirim OTP ke email/WA; user masukkan OTP di halaman verifikasi.
3. **Verifikasi OTP** — Setelah OTP benar, data dihapus dari `a_1_unverified_users` dan di-INSERT ke `a_2_verified_users` dengan divisi PPAT/PPATS, `verifiedstatus = 'verified_pending'`. Userid dan `ppat_khusus` di-generate.
4. **Admin – Bagian Pending** — User dengan `verified_pending` tertampil di layanan admin bagian **pending**. Admin memeriksa dan memutuskan: disetujui atau tidak.
5. **Admin – Setuju** — Jika admin klik tombol **Setuju**, proses berpindah menjadi `complete`. **Email otomatis** dikirim ke user: akun sudah aktif dan bisa digunakan (berisi User ID). Setelah itu user bisa login.

---

## 4. Tabel Database Terkait

### Invariant sistem satu pintu (a_1 dan a_2)

- **a_1_unverified_users** dan **a_2_verified_users** adalah satu kesatuan alur; yang membedakan hanya “pintu” (portal) dan tahap verifikasi.
- **Satu user (email/NIK) tidak boleh ada di kedua tabel sekaligus.** Jika data user dengan OTP dan NIK yang sama sudah berpindah ke `a_2_verified_users` (verifiedstatus `verified_pending` atau `complete`), baris yang bersangkutan di `a_1_unverified_users` **wajib dihapus** agar tidak keliru dalam asumsi data.
- **Saat verify-otp sukses (WP):** baris di a_1 (jika ada) dihapus, data masuk a_2 dengan `verifiedstatus = 'complete'`.
- **Saat verify-otp sukses (Karyawan/PU):** baris di a_1 dihapus, data masuk a_2 dengan `verifiedstatus = 'verified_pending'`.
- **Saat register:** backend menghapus dulu baris a_1 untuk email yang sudah ada di a_2 (verified_pending/complete), lalu cek/insert a_1. Dengan demikian tidak ada data ganda antara a_1 dan a_2.

### 4.1 a_1_unverified_users (calon pengguna, belum verifikasi OTP)

- **Hanya untuk Karyawan dan PU.** Menyimpan data sementara saat registrasi sampai OTP benar.
- **`verifiedstatus = 'unverified'`** = ruang lobi tunggu. User boleh daftar ulang/overwrite data sebelumnya (mis. koreksi typo, minta OTP baru). Data belum final.
- **Blokir daftar ulang** hanya apabila user sudah di a_2 dengan `verified_pending` atau `complete` — pada tahap itu data sudah final.
- Kolom penting: `nama`, `nik`, `telepon`, `email`, `password` (hash), `foto` (fileId KTP terenkripsi), `otp`, `gender`, `verse`, `nip` (Karyawan), `special_field`, `pejabat_umum`, `divisi` (PU: PPAT/PPATS).
- Setelah verifikasi OTP berhasil, baris di sini di-**DELETE** dan data di-**INSERT** ke `a_2_verified_users`.
- **WP tidak masuk ke sini** — WP langsung ke `a_2_verified_users`.

### 4.2 a_2_verified_users (pengguna terverifikasi)

- Kolom penting: `userid`, `divisi`, `verse`, `nip`, `special_field`, `pejabat_umum`, `ppat_khusus` (untuk PPAT/PPATS), `verifiedstatus`, `statuspengguna`, dll.
- **Nilai kolom `verifiedstatus` di database:** `verified_pending` (= unverified), `complete` (= verified).
- **WP:** Langsung masuk saat daftar. Kolom `verifiedstatus` punya 2 tahap (unverified dilewat):
  - **`verified_pending`** (unverified) — Baru daftar, OTP dikirim (email/WA), belum submit atau gagal OTP.
  - **`complete`** (verified) — OTP sudah sesuai; nomor WP (mis. WP01) dikirim via email, user utuh dan bisa login.
- **Karyawan:** Masuk a_2 setelah OTP benar dengan `verified_pending`. Tertampil di admin bagian pending. Admin set userid/divisi dan klik Setuju → `complete`, lalu **email otomatis** (akun aktif + User ID) dikirim. Prefix userid: A, LTB, LSB, P, PV.
- **PU:** Masuk a_2 setelah OTP benar dengan `verified_pending`. Tertampil di admin bagian pending. Admin klik Setuju → `complete`, lalu **email otomatis** (akun aktif + User ID) dikirim. Prefix: PAT, PATS.
- **WP:** Langsung `complete` setelah OTP benar; email (akun aktif + User ID) dikirim saat verify-otp.

### 4.3 Prefix UserID per Role/Divisi

| Role / Divisi | Prefix userid | Contoh |
|---------------|---------------|--------|
| Wajib Pajak | WP | WP01 |
| Karyawan – Admin | A | A01 |
| Karyawan – LTB (Loket Terima Berkas) | LTB | LTB01 |
| Karyawan – LSB (Loket Serah Berkas) | LSB | LSB01 |
| Karyawan – Peneliti | P | P01 |
| Karyawan – Peneliti Validasi (Pejabat) | PV | PV01 |
| PU – PPAT / Notaris | PAT | PAT01 |
| PU – PPATS | PATS | PATS01 |

**Penomoran UserID (berlaku untuk semua prefix):** Jika userid dengan nomor tertentu sudah ada, user berikutnya mendapat nomor urut berikutnya. Contoh: untuk Admin, jika A01 sudah ada maka user berikutnya mendapat A02, A03, … hingga A99999. Berlaku sama untuk WP (WP01, WP02, …), LTB (LTB01, LTB02, …), PAT (PAT01, PAT02, …), dan prefix lain. Setiap prefix punya urutan nomor sendiri.

---

## 5. Alur Endpoint (Backend)

| Urutan | Endpoint | Metode | Fungsi |
|--------|----------|--------|--------|
| 1 | `/api/v1/auth/upload-ktp` | POST | Upload file KTP (optional: bisa juga kirim KTP saat submit register). Mengembalikan `uploadId` untuk dipakai di register. |
| 2 | `/api/v1/auth/register` | POST | Input: nama, nik, telepon, email, password, gender, (verse, nip / special_field, pejabat_umum, divisi), dan `ktpUploadId` atau file KTP. **WP:** langsung INSERT ke `a_2_verified_users` dengan `verifiedstatus` = 'verified_pending', OTP dikirim (email/WA). **Karyawan & PU:** INSERT ke `a_1_unverified_users`, OTP dikirim. Response: redirect ke halaman verifikasi OTP. |
| 3 | `/api/v1/auth/verify-otp` | POST | Input: email, otp. **Karyawan & PU:** cek di `a_1_unverified_users`; jika OTP cocok, INSERT ke `a_2_verified_users` dengan `verifiedstatus` = 'verified_pending', DELETE dari `a_1_unverified_users`. **WP:** cek di `a_2_verified_users`; jika OTP cocok, update `verifiedstatus` ke 'complete', generate nomor WP (mis. WP01), kirim nomor via email. Response sukses. |
| 4 | `/api/v1/auth/resend-otp` | POST | Input: email. Generate OTP baru. **Karyawan & PU:** update di `a_1_unverified_users`. **WP:** update di `a_2_verified_users`. Kirim OTP via email/WA. |
| 5 | `/api/v1/auth/complete-profile` | POST | Setelah login pertama kali (jika profil belum lengkap): isi username, nip (jika Karyawan), special_field/pejabat_umum (jika PPAT/PPATS), special_parafv (jika Peneliti Validasi). Dipanggil dari halaman profile-completetask. |

---

## 6. Alur Frontend (Ringkas)

1. **Halaman pilihan registrasi** (mis. landing): User pilih **Wajib Pajak**, **Karyawan**, atau **PPAT/PPATS** (dropdown Registrasi).
2. **Halaman form registrasi** (registrasi.html?verse=wp | verse=karyawan | verse=pu): Form dengan field umum (nama, NIK, telepon, email, password, konfirmasi password, gender) + field conditional per verse (NIP / special_field, pejabat_umum, divisi). Upload KTP: bisa OCR real (`/api/v1/auth/real-ktp-verification`) untuk auto-fill NIK/nama/gender, lalu file KTP di-upload (upload-ktp atau digabung saat submit) dan dapat `ktpUploadId`.
3. **Submit form** → POST `/api/v1/auth/register` (FormData dengan ktpUploadId). Jika sukses, email disimpan (mis. di localStorage), redirect ke **verifikasi-otp.html**.
4. **Halaman verifikasi OTP:** User masukkan OTP dari email/WA → POST `/api/v1/auth/verify-otp`. **WP:** update `verifiedstatus` ke `complete`, nomor WP (mis. WP01) dikirim via email. **Karyawan & PU:** pindah ke `a_2_verified_users` dengan `verifiedstatus` = `verified_pending`. Jika sukses, redirect ke login atau halaman sukses.
5. **Login** → backend cek kelengkapan profil (username, nip, special_field/pejabat_umum, dll. sesuai divisi). Jika belum lengkap → redirect ke **profile-completetask.html** → isi data → POST `/api/v1/auth/complete-profile`. Jika sudah lengkap → redirect ke dashboard sesuai divisi.

---

## 7. Validasi dan Keamanan (Ringkas)

- **Register:** Email tidak boleh sudah ada di `a_2_verified_users`. Password minimal 6 karakter (backend); frontend bisa lebih ketat (mis. 8 karakter, huruf besar/kecil/angka). NIK 16 digit. Gender: Perempuan / Laki-laki. KTP wajib (file atau ktpUploadId).
- **KTP:** Disimpan terenkripsi (secure storage); bisa pakai OCR real untuk ekstrak data. Format: JPEG/PNG, batas ukuran (mis. 3MB).
- **OTP:** Dikirim lewat email dan/atau WA. **Karyawan & PU:** disimpan di `a_1_unverified_users.otp`. **WP:** disimpan di `a_2_verified_users`.
- **Email “Akun Aktif” (Karyawan & PU):** Setelah admin klik **Setuju** di layanan pending, status berubah ke `complete`. **Email otomatis** dikirim ke user berisi informasi bahwa akun sudah aktif dan bisa digunakan (termasuk User ID). User tahu bisa login dari email ini.

---

## 8. Poin yang Perlu Diverifikasi / Diperbaiki

- **PU – field penyesuaian:** Implementasi teknis field "sungguh pejabat pembuat akta atau bukan" (nama kolom, validasi, tampilan di form) bisa didetailkan di codebase atau dokumen terpisah.
- **verifiedstatus (DB):** `verified_pending` (unverified) → `complete` (verified). Nomor WP dikirim via email setelah OTP benar.
- **Redirect setelah verify-otp:** Apakah langsung ke login atau ada halaman “akun berhasil dibuat” dulu?
- **Resend OTP:** Batas percobaan dan cooldown (jika ada) belum didokumentasikan di dokumen ini; bisa ditambah jika aturan bisnis sudah jelas.

---

## 9. Referensi File (Codebase)

| Fungsi | Lokasi |
|--------|--------|
| Register, verify-otp, resend-otp, complete-profile | `E-BPHTB_root_utama/backend/routesxcontroller/1_auth/authRoutes.js` |
| Upload KTP (upload-ktp, real-ktp-verification) | `authRoutes.js` + `backend/config/uploads/secure_upload_ktp.js`, `backend/utils/ktpOCR.js` |
| Form & validasi frontend registrasi | `E-BPHTB_root_utama/public/registrasi.html`, `public/registrasi.js` |
| Generator userid / ppat_khusus | `backend/services/id_generator.js` |
| Role & verse | `docs/ROLES.md`, `backend/utils/constant.js` |
| Skema tabel user | `docs/DATABASE.md` (a_1_unverified_users, a_2_verified_users) |
| Daftar endpoint auth | `docs/API.md` |

---

*Dokumen ini dibuat dari analisis codebase untuk keperluan rencana migrasi dan pemahaman skema. Silakan koreksi jika ada yang tidak sesuai dengan proses bisnis BAPPENDA BPHTB.*
