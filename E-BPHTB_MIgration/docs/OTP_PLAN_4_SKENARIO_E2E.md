# OTP & Registrasi — 4 Skenario E2E (Plan Cursor)

Dokumen ini mendukung to-do plan:
- Request OTP berbasis memory map + TTL (tanpa write DB)
- Verify OTP finalisasi: insert DB + tulis JSON temp_uploads setelah OTP valid
- Upload KTP: tidak menulis file sebelum OTP, hanya return OCR JSON
- Route terdaftar di `cmd/server/main.go`

---

## Route yang terdaftar

| Method | Endpoint | Handler | Keterangan |
|--------|----------|---------|------------|
| POST | `/api/v1/auth/upload-ktp` | UploadKTP | OCR only, return JSON + `uploadId` + `ktpOcrJson`; no file write |
| POST | `/api/v1/auth/request-otp` | RequestOTP | OTP in-memory + TTL, no DB |
| POST | `/api/v1/auth/verify-otp-finalize` | VerifyOTPFinalize | Setelah OTP valid: insert a_2 + tulis JSON ke temp_uploads |
| POST | `/api/v1/auth/verify-otp` | VerifyOTP | OTP dari DB (a_1); commit atomik ke a_2 + delete a_1 |
| POST | `/api/v1/auth/register` | Register | Insert/update a_1, kirim OTP; terima `ktpOcrJson` dari form (tanpa wajib file) |
| POST | `/api/v1/auth/resend-otp` | ResendOTP | Memory atau DB (a_1) |

---

## 4 Skenario E2E untuk diuji

### Skenario 1: Alur memory OTP (tanpa register ke DB dulu)

1. **Upload KTP**  
   `POST /api/v1/auth/upload-ktp` (multipart `fotoktp`)  
   → Response: `uploadId`, `ktpOcrJson`, `data` (field KTP). **Tidak ada file ditulis ke server.**

2. **Request OTP**  
   `POST /api/v1/auth/request-otp` body `{"email":"user@example.com"}`  
   → OTP disimpan in-memory (TTL 10 menit). Email berisi kode OTP.

3. **Verify OTP Finalize**  
   `POST /api/v1/auth/verify-otp-finalize` body:
   - `email`, `otp`
   - `pendingRegistration`: objek berisi `nama`, `nik`, `telepon`, `password`, `gender`, `verse`, `ktpUploadId`, **`ktpOcrJson`** (dari step 1), plus `nip`/`special_field`/`pejabat_umum`/`divisi` jika PU/Karyawan.  
   → Setelah OTP valid: insert ke `a_2_verified_users`, tulis JSON ke `temp_uploads`, response sukses.

4. **Login** (jika WP dan status complete)  
   `POST /api/v1/auth/login` dengan userid + password.

**Assert:** Tidak ada insert ke `a_1`; data masuk ke `a_2` hanya setelah verify-otp-finalize. File JSON di temp_uploads hanya ada setelah finalize.

---

### Skenario 2: Alur register ke DB lalu verify OTP (Karyawan/PU)

1. **Upload KTP**  
   `POST /api/v1/auth/upload-ktp`  
   → Simpan `uploadId` dan `ktpOcrJson` di client.

2. **Register**  
   `POST /api/v1/auth/register` (form/json) dengan semua field + **`ktpOcrJson`** (dan `ktpUploadId` jika ada).  
   → Insert/update `a_1_unverified_users`, kirim OTP ke email. **Tidak wajib ada file di temp_uploads** jika `ktpOcrJson` dikirim.

3. **Verify OTP**  
   `POST /api/v1/auth/verify-otp` body `{"email":"...","otp":"123456"}`  
   → Baca OTP dari DB (a_1); transaksi: generate userid (jika PU), insert a_2, delete a_1. Kirim email User ID untuk WP.

4. **Login** (setelah admin set userid untuk Karyawan, atau langsung untuk PU/WP)  
   `POST /api/v1/auth/login`.

**Assert:** Data di a_1; setelah verify-otp pindah ke a_2; a_1 ter-delete.

---

### Skenario 3: Upload KTP hanya return OCR (no file write)

1. **Upload KTP**  
   `POST /api/v1/auth/upload-ktp`  
   → Response berisi `ktpOcrJson` (string JSON untuk DB).

2. **Cek server**  
   Tidak ada file baru di `temp_uploads` untuk upload ini (hanya file sementara untuk proses OCR, lalu dihapus).

3. **Register dengan ktpOcrJson**  
   `POST /api/v1/auth/register` dengan `ktpOcrJson` dari step 1 (dan `ktpUploadId` dari response).  
   → Registrasi sukses tanpa perlu file ada di temp_uploads.

**Assert:** Endpoint upload-ktp tidak menulis file ke temp_uploads; register sukses hanya dengan `ktpOcrJson` di body.

---

### Skenario 4: Resend OTP (memory dan DB)

**4a. Setelah Request OTP (memory)**  
- `POST /api/v1/auth/request-otp` dengan email.  
- `POST /api/v1/auth/resend-otp` dengan email yang sama.  
→ OTP baru terkirim; verifikasi dengan OTP terbaru di verify-otp-finalize.

**4b. Setelah Register (DB)**  
- `POST /api/v1/auth/register` (dengan ktpOcrJson).  
- `POST /api/v1/auth/resend-otp` dengan email yang sama.  
→ OTP baru terkirim; update OTP di `a_1`; verifikasi dengan OTP terbaru di verify-otp.

**Assert:** Resend berhasil untuk kedua alur (memory dan DB).

---

## Ringkasan pemenuhan to-do

| To-do | Status | Lokasi |
|-------|--------|--------|
| Request OTP memory map + TTL, no DB | ✅ | `RequestOTP`, `pendingOTP` map, `pendingOTPTTL` |
| Verify OTP finalize: insert DB + temp_uploads setelah OTP valid | ✅ | `VerifyOTPFinalize` |
| Upload KTP: tidak tulis file sebelum OTP, hanya return OCR JSON | ✅ | `UploadKTP` (no write ke temp_uploads); response `ktpOcrJson`; `Register` terima `ktpOcrJson` tanpa wajib file |
| Daftar route + uji 4 skenario | ✅ | `main.go`; doc ini untuk uji e2e |
