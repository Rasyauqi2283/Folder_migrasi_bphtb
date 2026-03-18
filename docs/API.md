# E-BPHTB API Documentation

Backend: Node.js/Express. Entry: `E-BPHTB_root_utama/index.js`.  
Dokumen ini mendaftar semua endpoint API sebagai referensi untuk migrasi bertahap ke Golang/Next.js.

---

## 1. Ringkasan

- **Perkiraan total endpoint:** ~120+ (method + path unik).
- **Mount:** Beberapa router di-mount di base path; path di bawah ini sudah full path (base + route).
- **Sumber:** `E-BPHTB_root_utama/index.js` (langsung `app.get/post/...`) dan router di `E-BPHTB_root_utama/backend/`.

---

## 2. Mount Table

| Base path | Router / module | File sumber |
|-----------|------------------|-------------|
| `/api/v1/auth` | authRoutes | backend/routesxcontroller/1_auth/authRoutes.js |
| `/api/v1/auth` | passwordResetRouter | backend/endpoint_session/password_service.js |
| `/api/v1/auth` | profileRouter | backend/routesxcontroller/2_profile/profile_endpoint.js |
| `/api/users` | userRoutes | backend/routesxcontroller/userRoutes.js |
| `/api/faqs`, `/api/faq` | faqRoutes | backend/routesxcontroller/faqroutes.js |
| `/api/notices` | noticeRoutes | backend/routesxcontroller/noticeRoutes.js |
| `/api/public` | publicValidationRouter | backend/routesxcontroller/9_public/publicValidationRoutes.js |
| `/api/secure-files` | secureFileRoutes | backend/endpoint_session/registrasi/secure_file_routes.js |
| `/api/notifications` | notificationRouter | backend/routesxcontroller/3_notification/notification_routes.js |
| `/api/admin` | adminRouter | backend/routesxcontroller/4_admin/adminRoutes.js |
| `/api/admin/notification-warehouse` | notificationWarehouseRouter | backend/routesxcontroller/4_admin/notification_warehouse_routes.js |
| `/api/peneliti` | penelitiCounterRoutes | backend/routesxcontroller/3_peneliti/peneliti_counter_routes.js |
| `/api/bsre` | bsreAuthRouter | backend/routesxcontroller/8_bsre/bsre_auth_routes.js |
| `/` | bsreCertRouter | backend/routesxcontroller/8_bsre/bsre_certificate_routes.js |
| `/api/v1/sign/validation` | bsreValidationRouter | backend/routesxcontroller/8_bsre/bsre_validation_routes.js |
| `/api/railway-signature` | railwaySignatureRoutes | backend/routesxcontroller/5_PPAT_endpoint/RailwaySignatureRoutes.js |

---

## 3. Endpoint per Domain

### 3.1 Config & health

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/config` | index.js | Config frontend (apiUrl, environment). |
| GET | `/api/database-monitoring` | index.js | Jalankan runFullDatabaseMonitoring. |
| GET | `/debug-session` | index.js | Debug session (dev). |
| GET | `/health` | index.js | Health check server. |
| GET | `/api/public/health` | publicValidationRoutes.js | Health public. |
| GET | `/api/bsre/health` | bsre_auth_routes.js | Health BSRE. |

### 3.2 Auth (`/api/v1/auth`)

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| POST | `/api/v1/auth/login` | authRoutes.js | Login (identifier + password). |
| POST | `/api/v1/auth/register` | authRoutes.js | Registrasi user. |
| POST | `/api/v1/auth/upload-ktp` | authRoutes.js | Upload KTP (registrasi). |
| POST | `/api/v1/auth/verify-otp` | authRoutes.js | Verifikasi OTP. |
| POST | `/api/v1/auth/resend-otp` | authRoutes.js | Kirim ulang OTP. |
| POST | `/api/v1/auth/complete-profile` | authRoutes.js | Lengkapi profil setelah verifikasi. |
| POST | `/api/v1/auth/logout` | authRoutes.js | Logout. |
| POST | `/api/v1/auth/ping` | authRoutes.js | Ping keep-alive. |
| POST | `/api/v1/auth/simulate-ktp-verification` | authRoutes.js | Simulasi verifikasi KTP (dev). |
| POST | `/api/v1/auth/real-ktp-verification` | authRoutes.js | Verifikasi KTP riil (upload fotoktp). |
| POST | `/api/v1/auth/reset-password-request` | password_service.js | Request reset password. |
| POST | `/api/v1/auth/verify-reset-token` | password_service.js | Verifikasi token reset. |
| POST | `/api/v1/auth/reset-password` | password_service.js | Set password baru. |
| GET | `/api/v1/auth/profile` | profile_endpoint.js | Ambil profil user (session). |
| POST | `/api/v1/auth/update-profile-paraf` | profile_endpoint.js | Update profil paraf. |
| DELETE | `/api/v1/auth/update-profile-paraf` | profile_endpoint.js | Hapus update paraf. |
| GET | `/api/v1/auth/tanda-tangan/:userid` | profile_endpoint.js | Download tanda tangan user. |
| GET | `/api/v1/auth/peneliti/check-signature` | profile_endpoint.js | Cek tanda tangan peneliti. |
| GET | `/api/v1/auth/get-tanda-tangan` | profile_endpoint.js | Get tanda tangan (session). |
| POST | `/api/v1/auth/profile/upload` | profile_endpoint.js | Upload foto profil. |
| POST | `/api/v1/auth/update-password` | profile_endpoint.js | Update password (rate limited). |
| POST | `/api/v1/auth/reset-password-debug` | profile_endpoint.js | Debug reset password. |
| GET | `/api/v1/auth/members-header` | profile_endpoint.js | Data header members. |

### 3.3 Users & admin

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| POST | `/api/users/generate-userid` | userRoutes.js | Generate userid. |
| POST | `/api/users/assign-userid-and-divisi` | userRoutes.js | Assign userid dan divisi. |
| GET | `/api/users/complete` | userRoutes.js | Daftar user lengkap. |
| GET | `/api/users/pending` | userRoutes.js + index.js | User pending (juga di index.js). |
| POST | `/api/users/update` | index.js | Update user (admin). |
| GET | `/api/member-count/admin-access` | index.js | Hitung member (admin). |
| GET | `/api/admin/test-pending-users` | adminRoutes.js | Test user pending (verifyAdmin). |
| GET | `/api/admin/ktp-preview/:userId` | adminRoutes.js | Preview KTP (verifyAdmin). |
| PUT | `/api/admin/users/:userid` | adminRoutes.js | Update user admin. |
| PUT | `/api/admin/users/:userid/status-ppat` | adminRoutes.js | Update status PPAT. |
| GET | `/api/admin/users/:userid` | adminRoutes.js | Detail user. |
| GET | `/api/admin/status-ppat/notifications` | adminRoutes.js | Notifikasi status PPAT. |
| GET | `/api/admin/status-ppat/users` | adminRoutes.js | User status PPAT. |
| GET | `/api/admin/ppat/user/:userid/diserahkan` | adminRoutes.js | Berkas diserahkan per user. |
| GET | `/api/admin/validate-qr/:no_validasi` | adminRoutes.js | Validasi QR (verifyValidationRoles). |
| GET | `/api/admin/validate-qr-search` | adminRoutes.js | Cari validasi QR. |
| GET | `/api/admin/validation-statistics` | adminRoutes.js | Statistik validasi. |
| GET | `/api/admin/notification-warehouse/ppat-ltb` | notification_warehouse_routes.js | Data PPAT-LTB. |
| GET | `/api/admin/notification-warehouse/ppat-ltb/:bookingId` | notification_warehouse_routes.js | Detail booking. |
| GET | `/api/admin/notification-warehouse/stats` | notification_warehouse_routes.js | Statistik. |
| GET | `/api/admin/notification-warehouse/ppat-users` | notification_warehouse_routes.js | Daftar user PPAT. |
| GET | `/api/admin/notification-warehouse/ppat-users/:userId` | notification_warehouse_routes.js | Detail user. |
| GET | `/api/admin/notification-warehouse/ppat-users-stats` | notification_warehouse_routes.js | Statistik user. |
| GET | `/api/admin/notification-warehouse/peneliti-lsb` | notification_warehouse_routes.js | Data peneliti-LSB. |
| GET | `/api/admin/notification-warehouse/lsb-ppat` | notification_warehouse_routes.js | Data LSB-PPAT. |
| GET | `/api/admin/notification-warehouse/ppat-renewal` | notification_warehouse_routes.js | Renewal PPAT. |
| GET | `/api/admin/notification-warehouse/test` | notification_warehouse_routes.js | Test. |
| GET | `/api/admin/notification-warehouse/ppat-chart-data` | notification_warehouse_routes.js | Data chart. |
| POST | `/api/admin/notification-warehouse/send-ping` | notification_warehouse_routes.js | Kirim ping. |
| POST | `/api/admin/notification-warehouse/test-ping` | notification_warehouse_routes.js | Test ping. |
| GET | `/api/admin/notification-warehouse/poll-ping` | notification_warehouse_routes.js | Poll ping. |
| GET | `/api/admin/pending-deletions` | example_integration.js | Daftar pending deletion (auto-delete). |
| POST | `/api/admin/execute-auto-delete` | example_integration.js | Eksekusi auto delete. |

### 3.4 PPAT & booking

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/check-my-signature` | endpoint_ppat.js | Cek tanda tangan saya. |
| POST | `/api/ppat/update-file-id` | endpoint_ppat.js | Update file ID. |
| GET | `/api/ppat/load-booking-perorangan` | endpoint_ppat.js | Load booking perorangan. |
| POST | `/api/ppat/create-booking-perorangan` | endpoint_ppat.js | Buat booking perorangan. |
| GET | `/api/ppat/load-all-booking` | endpoint_ppat.js | Load semua booking. |
| GET | `/api/ppat/booking/:nobooking` | endpoint_ppat.js | Detail booking (umum). |
| GET | `/api/ppat/booking-badan/:nobooking` | endpoint_ppat.js | Detail booking badan. |
| GET | `/api/ppat/booking-perorangan/:nobooking` | endpoint_ppat.js | Detail booking perorangan. |
| POST | `/api/save-ppat-additional-data` | endpoint_ppat.js | Simpan data tambahan PPAT. |
| PUT | `/api/ppat/booking/:nobooking/trackstatus` | endpoint_ppat.js | Update trackstatus. |
| DELETE | `/api/ppat/booking/:nobooking` | endpoint_ppat.js | Hapus booking. |
| POST | `/api/ppat/upload-signatures` | endpoint_ppat.js | Upload tanda tangan. |
| POST | `/api/ppat/upload-documents` | endpoint_ppat.js | Upload dokumen. |
| POST | `/api/ppat/update-file-urls` | endpoint_ppat.js | Update URL file. |
| GET | `/api/ppat/get-documents` | endpoint_ppat.js | Ambil dokumen. |
| GET | `/api/ppat/file-proxy` | endpoint_ppat.js | Proxy file. |
| GET | `/api/test-railway-proxy` | endpoint_ppat.js | Test proxy Railway. |
| GET | `/api/ppat/quota` | endpoint_ppat.js | Kuota booking. |
| POST | `/api/ppat/schedule-send` | endpoint_ppat.js | Jadwalkan kirim. |
| POST | `/api/ppat/send-now` | endpoint_ppat.js | Kirim sekarang. |
| GET | `/api/ppat/my-schedules` | endpoint_ppat.js | Jadwal saya. |
| POST | `/api/ppat/process-pending-queue` | endpoint_ppat.js | Proses antrian pending. |
| POST | `/api/cleanup-invalid-proxy-paths` | endpoint_ppat.js | Bersihkan path proxy invalid. |
| POST | `/api/cleanup-old-files` | endpoint_ppat.js | Bersihkan file lama. |
| GET | `/api/ppat/railway-health` | endpoint_ppat.js | Health Railway storage. |
| PUT | `/api/ppat/update-trackstatus/:nobooking` | endpoint_ppat.js | Update trackstatus (alternatif). |
| GET | `/api/ppat/verify-file-sync` | endpoint_ppat.js | Verifikasi sinkron file. |
| POST | `/api/ppat_create-booking-and-bphtb-perorangan` | create_booking_endpoint.js | Buat booking + BPHTB perorangan. |
| POST | `/api/ppat_create-booking-and-bphtb` | create_booking_endpoint.js | Buat booking + BPHTB (badan). |
| GET | `/api/ppat_generate-pdf-badan/:nobooking` | generatepdfbooking_ppat.js | Generate PDF badan. |
| GET | `/api/ppat/generate-pdf-mohon-validasi/:nobooking` | generatepdfbooking_ppat.js | Generate PDF permohonan validasi. |
| GET | `/api/ppat/rekap/diserahkan` | index.js | Rekap diserahkan. |
| GET | `/api/ppat/generate-pdf-validasi/:nobooking` | index.js | Generate PDF validasi. |
| GET | `/api/ppat/generate-pdf-verif-paraf/:nobooking` | index.js | Generate PDF verif paraf. |
| GET | `/api/railway-signature/test-storage` | RailwaySignatureRoutes.js | Test storage. |
| POST | `/api/railway-signature/upload-signature` | RailwaySignatureRoutes.js | Upload tanda tangan. |
| GET | `/api/railway-signature/signature-info/:filename` | RailwaySignatureRoutes.js | Info file tanda tangan. |
| GET | `/api/railway-signature/list-signatures` | RailwaySignatureRoutes.js | Daftar tanda tangan. |
| DELETE | `/api/railway-signature/delete-signature/:filename` | RailwaySignatureRoutes.js | Hapus tanda tangan. |
| GET | `/api/railway-signature/check-signature` | RailwaySignatureRoutes.js | Cek tanda tangan. |

### 3.5 LTB

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/ltb_get-ltb-berkas` | index.js | Daftar berkas LTB. |
| POST | `/api/ltb_ltb-reject` | index.js | LTB tolak berkas. |
| POST | `/api/ltb_send-to-peneliti` | index.js | Kirim ke peneliti. |
| POST | `/api/ltb/reject-with-auto-delete` | example_integration.js | Reject + auto delete. |

### 3.6 Peneliti & paraf

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/peneliti_get-berkas-fromltb` | index.js | Berkas dari LTB (peneliti). |
| POST | `/api/peneliti/transfer-signature` | index.js | Transfer tanda tangan. |
| POST | `/api/peneliti_update-berdasarkan-pemilihan` | index.js | Update berdasarkan pemilihan. |
| POST | `/api/peneliti_send-to-paraf` | index.js | Kirim ke paraf. |
| POST | `/api/peneliti_reject-with-reason` | index.js | Tolak dengan alasan. |
| GET | `/api/peneliti/get-berkas-till-verif` | index.js | Berkas sampai verif. |
| POST | `/api/peneliti/paraf-transfer-signature` | index.js | Paraf transfer tanda tangan. |
| POST | `/api/peneliti_update-ttd-paraf` | index.js | Update TTD paraf. |
| POST | `/api/peneliti_send-to-ParafValidate` | index.js | Kirim ke ParafValidate. |
| GET | `/api/peneliti_lanjutan-generate-pdf-badan/:nobooking` | generatepdfcheck_peneliti.js | Generate PDF lanjutan peneliti. |
| GET | `/api/paraf/get-berkas-pending` | index.js | Berkas pending paraf. |
| GET | `/api/paraf/get-monitoring-documents` | index.js | Dokumen monitoring paraf. |
| GET | `/api/paraf/get-berkas-till-clear` | index.js | Berkas sampai clear. |
| GET | `/api/peneliti/counter/:userid` | peneliti_counter_routes.js | Counter peneliti. |
| POST | `/api/peneliti/counter/:userid/increment` | peneliti_counter_routes.js | Increment counter. |
| GET | `/api/peneliti/counter/team/summary` | peneliti_counter_routes.js | Ringkasan tim. |
| GET | `/api/peneliti/counter/daily-summary` | peneliti_counter_routes.js | Ringkasan harian. |
| POST | `/api/peneliti/counter/reset` | peneliti_counter_routes.js | Reset counter. |
| POST | `/api/peneliti/counter/auto-reset` | peneliti_counter_routes.js | Auto reset. |
| GET | `/api/peneliti/counter/history/:userid` | peneliti_counter_routes.js | Riwayat counter. |

### 3.7 Validasi (flow validasi & BSRE)

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| POST | `/api/validasi/:no_validasi/claim` | index.js | Claim validasi. |
| POST | `/api/validasi/:no_validasi/appearance` | index.js | Appearance. |
| POST | `/api/validasi/:no_validasi/prepare-document` | index.js | Siapkan dokumen. |
| POST | `/api/validasi/:no_validasi/initiate` | index.js | Inisiasi signing. |
| POST | `/api/validasi/:no_validasi/authorize` | index.js | Otorisasi. |
| POST | `/api/validasi/:no_validasi/verify` | index.js | Verifikasi. |
| POST | `/api/validasi/:no_validasi/decision` | index.js | Keputusan. |
| GET | `/api/validasi/:no_validasi/status` | index.js | Status validasi. |
| POST | `/api/validasi/:no_validasi/verify-qr` | index.js | Verifikasi QR. |
| POST | `/api/validasi/:no_validasi/cancel` | index.js | Batalkan. |
| GET | `/api/Validasi_lanjutan-generate-pdf-bookingsspd/:nobooking` | generatepdfverif_paraf.js | Generate PDF validasi lanjutan. |

### 3.8 Bank

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/bank/transaksi` | index.js | Daftar transaksi bank. |
| POST | `/api/bank/transaksi/:nobooking/approve` | index.js | Approve transaksi. |
| POST | `/api/bank/transaksi/:nobooking/reject` | index.js | Reject transaksi. |

### 3.9 LSB

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/LSB_berkas-complete` | index.js | Berkas lengkap LSB. |
| GET | `/api/LSB_monitoring-penyerahan` | index.js | Monitoring penyerahan. |
| POST | `/api/LSB_send-to-ppat` | index.js | Kirim ke PPAT. |
| POST | `/api/pv/send-to-lsb` | index.js | Kirim ke LSB (dari validasi). |

### 3.10 Notifikasi

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/notifications/unread` | notification_routes.js, notification_endpoints.js | Notifikasi belum dibaca. |
| GET | `/api/notifications/all` | notification_endpoints.js | Semua notifikasi. |
| GET | `/api/notifications/poll` | notification_routes.js | Long polling. |
| POST | `/api/notifications/mark-read` | notification_routes.js, notification_endpoints.js | Tandai dibaca. |
| POST | `/api/notifications/clear-all` | notification_endpoints.js | Hapus semua. |
| GET | `/api/notifications/history` | notification_routes.js | Riwayat. |
| GET | `/api/notifications/sound-toggle` | notification_endpoints.js | Toggle suara. |

### 3.11 BSRE / signing

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| POST | `/api/bsre/auth` | bsre_auth_routes.js | Auth BSRE (token). |
| GET | `/api/v1/sign/cert/:id` | bsre_certificate_routes.js | Detail sertifikat. |
| POST | `/api/v1/sign/cert/revoke` | bsre_certificate_routes.js | Revoke sertifikat. |
| GET | `/api/v1/sign/cert/download/:id` | bsre_certificate_routes.js | Download sertifikat. |
| POST | `/api/v1/sign/cert-requests` | bsre_certificate_routes.js | Buat cert request. |
| GET | `/api/v1/sign/cert-requests/:id` | bsre_certificate_routes.js | Detail cert request. |
| GET | `/api/pv/docs` | bsre_certificate_routes.js | Dokumen PV. |
| GET | `/api/pv/auth-status` | bsre_certificate_routes.js | Status auth PV. |
| GET | `/api/pv/cert/list` | bsre_certificate_routes.js | Daftar sertifikat. |
| POST | `/api/pv/cert/issue` | bsre_certificate_routes.js | Issue sertifikat. |
| POST | `/api/pv/cert/:serial/revoke` | bsre_certificate_routes.js | Revoke by serial. |
| GET | `/api/pv/cert/status` | bsre_certificate_routes.js | Status sertifikat. |
| GET | `/api/pv/cert/verified` | bsre_certificate_routes.js | Sertifikat terverifikasi. |
| POST | `/api/pv/cert/verify-local` | bsre_certificate_routes.js | Verifikasi lokal. |
| POST | `/api/pv/upload-signature` | bsre_certificate_routes.js | Upload tanda tangan (PV). |
| POST | `/api/pv/generate-qr` | bsre_certificate_routes.js | Generate QR. |
| POST | `/api/pv/generate-qr-with-validasi` | bsre_certificate_routes.js | Generate QR dengan validasi. |
| POST | `/api/pv/send-to-lsb` | bsre_certificate_routes.js | Kirim ke LSB (dari PV). |
| POST | `/api/pv/reject-with-auto-delete` | bsre_certificate_routes.js | Reject + auto delete. |
| POST | `/api/v1/sign/validation/validate` | bsre_validation_routes.js | Validasi dokumen. |
| POST | `/api/v1/sign/validation/validate/docx` | bsre_validation_routes.js | Validasi DOCX. |

### 3.12 Public

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/public/validate-qr/:no_validasi` | publicValidationRoutes.js | Validasi QR (public). |
| GET | `/api/public/validasi-download/:token` | index.js | Download hasil validasi (token). |

### 3.13 FAQ, notices, secure-files

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/faqs/`, `/api/faq/` | faqroutes.js | Daftar FAQ (public). |
| POST | `/api/faqs/`, `/api/faq/` | faqroutes.js | Buat FAQ. |
| PUT | `/api/faqs/:id`, `/api/faq/:id` | faqroutes.js | Update FAQ. |
| DELETE | `/api/faqs/:id`, `/api/faq/:id` | faqroutes.js | Hapus FAQ. |
| POST | `/api/faqs/upload`, `/api/faq/upload` | faqroutes.js | Upload gambar FAQ. |
| GET | `/api/notices/` | noticeRoutes.js | Notice aktif. |
| POST | `/api/notices/` | noticeRoutes.js | Update notice (admin). |
| GET | `/api/secure-files/ktp/:fileId` | secure_file_routes.js | Download KTP (admin). |
| GET | `/api/secure-files/ktp-list/:userId` | secure_file_routes.js | Daftar KTP user. |
| GET | `/api/secure-files/audit-logs` | secure_file_routes.js | Audit log akses file. |

### 3.14 Analytics & utility

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/analytics/tax/summary` | index.js | Ringkasan pajak (total BPHTB). |
| GET | `/api/analytics/tax/per-user` | index.js | Pajak per user (paginated). |
| POST | `/api/select-month/dashboard` | index.js | Pilih bulan dashboard. |
| GET | `/api/user/dashboard` | index.js | Data dashboard user. |
| GET | `/api/getCreatorByBooking/:nobooking` | index.js | Creator booking. |
| GET | `/api/getCreatorMohonValidasi/:nobooking` | index.js | Creator permohonan validasi. |
| GET | `/api/get-orders` | index.js | Daftar order. |
| GET | `/api/validate-nobooking/:nobooking` | index.js | Validasi nobooking. |
| GET | `/api/check-nobooking-usage/:nobooking` | example_integration.js | Cek penggunaan nobooking. |

### 3.15 Static & halaman

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/public/*` | index.js | Serve file public (path aman). |
| GET | `/uploads/documents/*` | index.js | Serve dokumen upload. |
| GET | `/` | index.js | Halaman awal (halaman_awal.html). |
| GET | `/test-email` | index.js | Test kirim email (dev). |

### 3.16 Quota (contoh)

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| POST | `/api/create-with-quota` | booking_quota_endpoint_example.js | Buat dengan kuota. |
| GET | `/api/quota-status` | booking_quota_endpoint_example.js | Status kuota. |
| GET | `/api/queue-status` | booking_quota_endpoint_example.js | Status antrian. |

### 3.17 Admin cleanup (PPAT case)

| Method | Path | Sumber | Deskripsi |
|--------|------|--------|-----------|
| GET | `/api/admin/cleanup-status` | ppat_case.js | Status cleanup. |
| POST | `/api/admin/start-cleanup` | ppat_case.js | Mulai cleanup. |
| POST | `/api/admin/stop-cleanup` | ppat_case.js | Hentikan cleanup. |

---

## 4. Catatan migrasi

- **Endpoint yang mengubah state (POST/PUT/DELETE):** Prioritaskan dokumentasi kontrak request/response saat pindah ke Golang. Contoh: login, create-booking, send-to-peneliti, validasi/claim, validasi/initiate, bank/approve, LSB_send-to-ppat.
- **Duplikasi path:** Beberapa path dilayani dua sumber (mis. `/api/notifications/unread` bisa dari notification_routes dan notification_endpoints). Pastikan satu sumber resmi atau gabung handler saat migrasi.
- **Router mount di `/`:** bsre_certificate_routes di-mount di `/`, sehingga path-nya sudah absolut (e.g. `/api/v1/sign/cert/:id`). Saat reimplementasi di Go, perhatikan base path yang sama.
- **File & proxy:** Endpoint file-proxy, upload-signatures, upload-documents, dan secure-files mengandalkan storage (lokal/Railway/Uploadcare). Dokumentasi storage dan env (path, bucket, key) perlu terpisah.
- **Rate limiting:** Hanya beberapa endpoint yang punya rate limit eksplisit (reset-password, update-password). Untuk Go, pertimbangkan rate limit global atau per-domain.
