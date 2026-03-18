# TABEL LAMPIRAN ITERASI 2 - LENGKAP

| No | Nama Activity Diagram | Deskripsi Lengkap | Lampiran |
|----|----------------------|-------------------|----------|
| 1 | Upload Tanda Tangan Sekali (Iterasi 2) | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Upload tanda tangan sekali untuk digunakan berulang kali. Proses meliputi upload tanda tangan (JPG/PNG maksimal 2MB), validasi file, preview signature, simpan ke secure storage, update a_2_verified_users.tanda_tangan_path dengan reusable flag, dan menampilkan konfirmasi tanda tangan tersimpan. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 85 - Halaman Upload Tanda Tangan Sekali |
| 2 | Peneliti Auto Fill Signature Reusable (Iterasi 2) | **Aktor:** Peneliti, Sistem. **Alur:** Sistem otomatis mengisi tanda tangan reusable dari database ke booking baru. Proses meliputi mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path berdasarkan userid Peneliti, cek tanda tangan ada, auto fill signature ke pat_6_sign (copy tanda_tangan_path ke signature_path, signature_type='reusable'), update pat_1_bookingsspd jika diperlukan, dan menampilkan tanda tangan otomatis terisi. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 86 - Halaman Auto Fill Signature Peneliti |
| 3 | Admin Validasi QR Code (Iterasi 2) | **Aktor:** Admin, Sistem. **Alur:** Admin melakukan validasi QR code pada dokumen validasi. Proses meliputi mengakses menu validasi QR code, scan QR code dari dokumen, sistem membaca payload QR code (NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR\|nomor_validasi), verifikasi data dengan database (pat_7_validasi_surat, pv_1_paraf_validate), cek validitas sertifikat digital, menampilkan hasil validasi (valid/tidak valid dengan detail), dan log audit trail. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 87 - Halaman Validasi QR Code Admin |
| 4 | Generate Sertifikat Digital Lokal (Iterasi 2) | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Generate sertifikat digital lokal dengan algoritma ECDSA-P256, enkripsi passphrase menggunakan scrypt (N=16384, r=8, p=1), generate serial number (8 bytes random hex uppercase), calculate fingerprint SHA-256, revoke sertifikat lama jika ada, insert ke pv_local_certs dengan status 'active' dan validitas 365 hari. | Lampiran 88 - Activity Diagram Generate Sertifikat Digital Lokal<br>Lampiran 89 - Halaman Generate Sertifikat Digital |
| 5 | Generate QR Code (Iterasi 2) | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Generate QR code ganda (publik dan internal) dengan format payload: NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR\|nomor_validasi. Proses meliputi mengambil data user (NIP, special_parafv), tanggal sertifikat, nomor validasi, membangun payload, generate QR code image (256x256), save ke /penting_F_simpan/qr_code_place/, update database. | Lampiran 90 - Activity Diagram Generate QR Code<br>Lampiran 91 - Halaman Generate QR Code |
| 6 | Display QR Code di Dokumen (Iterasi 2) | **Aktor:** Sistem. **Alur:** Menampilkan QR code di dokumen PDF validasi. Proses meliputi mengambil data QR code dari database, load QR code image dari /penting_F_simpan/qr_code_place/, membangun PDF validasi menggunakan PDFKit, embed QR code ke PDF (posisi kanan bawah, size 100x100, margin 50px), menambahkan info tanda tangan (NIP, special_parafv di bawah QR Code), menyimpan PDF ke /penting_F_simpan/pdf_validasi/, update database. | Lampiran 92 - Activity Diagram Display QR Code di Dokumen<br>Lampiran 93 - Halaman Dokumen dengan QR Code |
| 7 | Integrasi Bank dengan LTB Parallel Workflow (Iterasi 2) | **Aktor:** PPAT/PPATS, LTB, Bank (Produk Online Terintegrasi), Sistem. **Alur:** Parallel workflow antara Bank dan LTB. PPAT mengirim booking ke LTB & Bank secara bersamaan. LTB dan Bank bekerja secara paralel (LTB: verifikasi berkas, generate no. registrasi; Bank: verifikasi pembayaran, update transaction). Sistem menunggu kedua proses selesai, kemudian melakukan sinkronisasi data (update ltb_1_terima_berkas_sspd dengan data Bank, update pat_2_bphtb_perhitungan dan pat_4_objek_pajak), update status booking, dan mengirim notifikasi ke semua pihak. | Lampiran 94 - Activity Diagram Integrasi Bank dengan LTB Parallel Workflow<br>Lampiran 95 - Halaman Parallel Workflow |
| 8 | Verifikasi Digital Signature (Iterasi 2) | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Verifikasi digital signature dari sertifikat lokal. Proses meliputi mengambil sertifikat dari pv_local_certs (serial_number, passphrase_alg, passphrase_salt, passphrase_hash), cek tanda tangan sudah upload, input passphrase, verifikasi passphrase menggunakan scrypt dan timingSafeEqual, set session (req.session.pv_local_cert), dan menampilkan hasil verifikasi. | Lampiran 96 - Activity Diagram Verifikasi Digital Signature<br>Lampiran 97 - Halaman Verifikasi Digital Signature |
| 9 | PPAT Auto Fill Signature (Iterasi 2) | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Sistem otomatis mengisi tanda tangan dari database ke booking baru. Proses meliputi mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path berdasarkan userid PPAT, cek tanda tangan ada, auto fill signature ke pat_6_sign (copy tanda_tangan_path ke signature_path, signature_type='reusable'), update pat_1_bookingsspd jika diperlukan, dan menampilkan tanda tangan otomatis terisi. | Lampiran 98 - Activity Diagram PPAT Auto Fill Signature<br>Lampiran 99 - Halaman Auto Fill Signature PPAT |
| 10 | Generate Nomor Validasi (Iterasi 2) | **Aktor:** Sistem. **Alur:** Generate nomor validasi dengan format 7acak-3acak (contoh: A1B2C3D-E4F). Proses meliputi generate bagian 1 (7 karakter acak alphanumeric: A-Z, 0-9), generate bagian 2 (3 karakter acak alphanumeric), menggabungkan format dengan separator "-", cek unik di database (pat_7_validasi_surat), regenerate jika duplikat, dan insert ke pat_7_validasi_surat dengan nomor_validasi, nobooking, status, created_at. | Lampiran 100 - Activity Diagram Generate Nomor Validasi<br>Lampiran 101 - Halaman Nomor Validasi |
| 11 | Select Reusable Signature - Peneliti Validasi (Iterasi 2) | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Memilih tanda tangan reusable untuk proses validasi. Proses meliputi mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path berdasarkan userid Peneliti Validasi, cek tanda tangan ada, load tanda tangan image dari secure storage, update pv_1_paraf_validate dengan tanda_tangan_path=reusable_path, dan menampilkan preview tanda tangan. | Lampiran 102 - Activity Diagram Select Reusable Signature Peneliti Validasi<br>Lampiran 103 - Halaman Select Reusable Signature |
| 12 | Real-time Notifications (Iterasi 2) | **Aktor:** Admin, Sistem. **Alur:** Sistem notifikasi real-time menggunakan long polling. Proses meliputi Admin mengakses menu real-time notifications, sistem memulai long polling connection (client-side: polling setiap 5 detik, server-side: hold connection), mengambil notifikasi dari database (sys_notifications: status='unread', filter berdasarkan userid/divisi), push notifikasi ke client secara real-time, Admin menyusun dan mengirim notifikasi baru (pilih penerima, tulis pesan), insert ke sys_notifications untuk setiap penerima, trigger long polling update, dan mengirim email (opsional). | Lampiran 104 - Activity Diagram Real-time Notifications<br>Lampiran 105 - Halaman Real-time Notifications |
| 13 | Bank Cek Validasi Pembayaran Detail (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Detail verifikasi pembayaran oleh Bank. Proses meliputi melihat daftar booking yang memerlukan verifikasi pembayaran, memilih booking, melihat detail booking (data wajib pajak, objek pajak, perhitungan BPHTB), menginput data pembayaran (nomor bukti, tanggal, BPHTB yang dibayar), melakukan verifikasi, validasi data pembayaran, insert/update bank_1_cek_hasil_transaksi (status_verifikasi='Terverifikasi', nama_pengecek, verified_by, verified_at), update pat_2_bphtb_perhitungan dengan bphtb_yangtelah_dibayar, update pat_4_objek_pajak dengan nomor_bukti_pembayaran dan tanggal_pembayaran, dan menampilkan hasil verifikasi. | Lampiran 106 - Activity Diagram Bank Cek Validasi Pembayaran Detail<br>Lampiran 107 - Halaman Validasi Pembayaran Bank |
| 14 | Bank Hasil Transaksi (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Melihat hasil transaksi pembayaran yang telah diverifikasi. Proses meliputi melihat daftar hasil transaksi (bank_1_cek_hasil_transaksi: status_verifikasi='Terverifikasi', filter berdasarkan userid Bank), memilih transaksi, melihat detail transaksi (status verifikasi, nomor bukti pembayaran, tanggal pembayaran, BPHTB yang dibayar, nama pengecek, verified_at), JOIN dengan pat_1_bookingsspd untuk info booking, dan export laporan ke Excel/PDF (opsional). | Lampiran 108 - Activity Diagram Bank Hasil Transaksi<br>Lampiran 109 - Halaman Hasil Transaksi Bank |
| 15 | Sinkronisasi Bank-LTB (Iterasi 2) | **Aktor:** Sistem. **Alur:** Sinkronisasi data antara Bank dan LTB. Proses meliputi mengambil data dari Bank (bank_1_cek_hasil_transaksi: status_verifikasi='Terverifikasi', nomor_bukti_pembayaran, tanggal_pembayaran, bphtb_yangtelah_dibayar), mengambil data dari LTB (ltb_1_terima_berkas_sspd: status proses, no_registrasi), update ltb_1_terima_berkas_sspd dengan status_proses='Bank Verified', bank_verified_at=NOW(), bank_verification_status='Terverifikasi', update pat_2_bphtb_perhitungan dengan bphtb_yangtelah_dibayar dari Bank, update pat_4_objek_pajak dengan nomor_bukti_pembayaran dan tanggal_pembayaran dari Bank, update pat_1_bookingsspd dengan trackstatus='Verified by LTB & Bank', bank_verified=TRUE, mengirim notifikasi ke LTB dan Bank, dan commit transaction. | Lampiran 110 - Activity Diagram Sinkronisasi Bank-LTB<br>Lampiran 111 - Halaman Sinkronisasi Bank-LTB |
| 16 | Bank Login (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank login sebagai produk online terintegrasi. Proses meliputi Bank mengakses halaman login, menginput userid dan password, sistem validasi kredensial (cek di a_2_verified_users dengan role='Bank'), autentikasi berhasil, set session (req.session.userid, req.session.role), redirect ke dashboard Bank, dan menampilkan notifikasi login berhasil. | Lampiran 112 - Activity Diagram Bank Login<br>Lampiran 113 - Halaman Login Bank |
| 17 | Bank View Dashboard (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank mengakses dan melihat dashboard Bank. Proses meliputi Bank login ke sistem, mengakses dashboard Bank, sistem mengambil data statistik (total booking pending, total booking terverifikasi, total booking ditolak), menampilkan daftar booking pending verifikasi (bank_1_cek_hasil_transaksi: status_verifikasi='Pending'), menampilkan grafik/statistik pembayaran, dan refresh data real-time. | Lampiran 114 - Activity Diagram Bank View Dashboard<br>Lampiran 115 - Dashboard Bank |
| 18 | Bank View Booking List (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank melihat daftar booking yang memerlukan verifikasi pembayaran. Proses meliputi Bank mengakses menu "Daftar Booking", sistem mengambil data booking dari bank_1_cek_hasil_transaksi dengan status_verifikasi='Pending' (filter berdasarkan userid Bank), menampilkan daftar booking (nobooking, nama_wajib_pajak, tanggal_booking, status), filter dan search booking, dan menampilkan jumlah total booking pending. | Lampiran 116 - Activity Diagram Bank View Booking List<br>Lampiran 117 - Halaman Daftar Booking Bank |
| 19 | Bank View Booking Detail (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank melihat detail booking yang akan diverifikasi. Proses meliputi Bank memilih booking dari daftar, sistem mengambil data lengkap booking (pat_1_bookingsspd: data wajib pajak, pat_4_objek_pajak: data objek pajak, pat_2_bphtb_perhitungan: perhitungan BPHTB), menampilkan detail booking lengkap, menampilkan dokumen pendukung (jika ada), dan menampilkan status booking saat ini. | Lampiran 118 - Activity Diagram Bank View Booking Detail<br>Lampiran 119 - Halaman Detail Booking Bank |
| 20 | Bank Input Payment Data (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank menginput data pembayaran untuk verifikasi. Proses meliputi Bank membuka form input pembayaran untuk booking yang dipilih, menginput data pembayaran (nomor_bukti_pembayaran, tanggal_pembayaran, bphtb_yangtelah_dibayar, catatan_bank), sistem validasi input (format tanggal, jumlah pembayaran, nomor bukti tidak kosong), preview data yang diinput, dan menyimpan data ke temporary storage (belum commit). | Lampiran 120 - Activity Diagram Bank Input Payment Data<br>Lampiran 121 - Halaman Input Data Pembayaran Bank |
| 21 | Bank Verify Payment (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank melakukan verifikasi pembayaran. Proses meliputi Bank mereview data pembayaran yang telah diinput, melakukan verifikasi (cek nomor bukti pembayaran, validasi tanggal pembayaran, validasi jumlah BPHTB yang dibayar), sistem validasi data pembayaran, cek apakah data pembayaran sesuai dengan perhitungan BPHTB, dan menampilkan hasil verifikasi (berhasil/gagal dengan alasan). | Lampiran 122 - Activity Diagram Bank Verify Payment<br>Lampiran 123 - Halaman Verifikasi Pembayaran Bank |
| 22 | Bank Save Verification (Iterasi 2) | **Aktor:** Bank (Produk Online Terintegrasi), Sistem. **Alur:** Bank menyimpan hasil verifikasi pembayaran ke database. Proses meliputi Bank menekan tombol simpan verifikasi, sistem memulai database transaction, insert/update bank_1_cek_hasil_transaksi (nobooking, userid, nomor_bukti_pembayaran, tanggal_pembayaran, bphtb_yangtelah_dibayar, status_verifikasi='Terverifikasi', nama_pengecek, verified_by, verified_at), update pat_2_bphtb_perhitungan dengan bphtb_yangtelah_dibayar, update pat_4_objek_pajak dengan nomor_bukti_pembayaran dan tanggal_pembayaran, trigger sinkronisasi dengan LTB (Activity 32), commit transaction, dan menampilkan status: Verifikasi Pembayaran Berhasil. | Lampiran 124 - Activity Diagram Bank Save Verification<br>Lampiran 125 - Halaman Simpan Verifikasi Bank |

---

## RINGKASAN LAMPIRAN

### **Total Activity Diagram Iterasi 2: 22 Activity Diagram** (3 Activity Diagram dijelaskan di Bab Hasil & Pembahasan, tidak masuk lampiran)
### **Total Lampiran Iterasi 2: 41 Lampiran** (Lampiran 85-125)

**Rincian:**
- **Activity Diagram di Lampiran:** 19 lampiran (Lampiran 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124)
- **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):** 3 Activity Diagram
  - No 1: Upload Tanda Tangan Sekali (Iterasi 2) - Activity 18
  - No 2: Peneliti Auto Fill Signature Reusable (Iterasi 2) - Activity 19
  - No 3: Admin Validasi QR Code (Iterasi 2) - Activity 20
- **Tampilan Website:** 22 lampiran (Lampiran 85-87, 89, 91, 93, 95, 97, 99, 101, 103, 105, 107, 109, 111, 113, 115, 117, 119, 121, 123, 125)

---

## CATATAN

1. **Format Lampiran:**
   - Activity Diagram selalu ditempatkan terlebih dahulu (Lampiran genap mulai dari 88, 90, 92, dst.)
   - Tampilan Website mengikuti setelah Activity Diagram terkait (Lampiran ganjil/genap berturut-turut)
   - 3 Activity Diagram (Upload Tanda Tangan Sekali, Peneliti Auto Fill Signature Reusable, Admin Validasi QR Code) dijelaskan di Bab Hasil & Pembahasan, tidak masuk lampiran

2. **Pemisahan Fitur:**
   - Setiap fitur memiliki Activity Diagram terpisah sesuai prinsip "1 fitur = 1 Activity Diagram"
   - Bank Integration dipisah menjadi 7 Activity Diagram individual (No 16-22, Activity 39-45)
   - Peneliti Validasi Final Validation dipisah menjadi beberapa Activity Diagram (No 4-6, 8, 10-11, Activity 21-23, 25, 27-28)

3. **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):**
   - **No 1: Upload Tanda Tangan Sekali (Iterasi 2)** - Activity 18 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 85: Hanya Tampilan Website)
   - **No 2: Peneliti Auto Fill Signature Reusable (Iterasi 2)** - Activity 19 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 86: Hanya Tampilan Website)
   - **No 3: Admin Validasi QR Code (Iterasi 2)** - Activity 20 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 87: Hanya Tampilan Website)

4. **Mapping Nomor Activity Diagram:**
   - No 1-3: Activity 18-20 (dijelaskan di Bab Hasil & Pembahasan)
   - No 4-15: Activity 21-32 (di lampiran)
   - No 16-22: Activity 39-45 (di lampiran - Bank Features)

5. **File Activity Diagram:**
   - Semua Activity Diagram tersedia di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/`
   - Format file: XML (Draw.io compatible)

6. **File Tampilan Website:**
   - Screenshot/wireframe tampilan website tersedia sesuai struktur halaman yang ada di sistem
   - File HTML tersedia di folder `public/html_folder/` sesuai struktur role

---

**Versi:** Lengkap - Setelah Perombakan Menyeluruh Iterasi 2 (Update: Format disamakan dengan Iterasi 1, Lampiran dimulai dari 85, Total 22 Activity Diagram)  
**Tanggal:** 2025  
**Status:** ✅ Semua Activity Diagram Sudah Terpisah Sesuai Prinsip 1 Fitur = 1 Activity Diagram

---

## CATATAN PENTING TENTANG 3 ACTIVITY DIAGRAM DI BAB HASIL & PEMBAHASAN

**Activity Diagram berikut dijelaskan secara detail di Bab Hasil & Pembahasan dan TIDAK masuk ke Lampiran:**

1. **No 1: Upload Tanda Tangan Sekali (Iterasi 2)** - Activity 18 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 85: Hanya Tampilan Website)
2. **No 2: Peneliti Auto Fill Signature Reusable (Iterasi 2)** - Activity 19 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 86: Hanya Tampilan Website)
3. **No 3: Admin Validasi QR Code (Iterasi 2)** - Activity 20 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 87: Hanya Tampilan Website)

**Activity Diagram ini tetap ada dan dijelaskan di Bab Hasil & Pembahasan, hanya tidak dicetak ulang di Lampiran.**

---

## KETERKAITAN DENGAN ITERASI 1

- **Lampiran Iterasi 1:** Lampiran 1-84 (Total 84 Lampiran)
- **Lampiran Iterasi 2:** Lampiran 85-125 (Total 41 Lampiran)
- **Total Lampiran Gabungan:** Lampiran 1-125 (Total 125 Lampiran)
