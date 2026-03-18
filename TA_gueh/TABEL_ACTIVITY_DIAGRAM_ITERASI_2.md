# 📊 TABEL ACTIVITY DIAGRAM ITERASI 2

## Tabel 1: Activity Diagram - Proses Utama Iterasi 2 (Activity 18-20) - Dijelaskan Rinci

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 18 | Upload Tanda Tangan Sekali (Iterasi 2) | PPAT/PPATS, Sistem | Alur upload tanda tangan sekali yang disimpan di `a_2_verified_users.tanda_tangan_path` untuk digunakan berulang kali pada semua booking selanjutnya. Proses meliputi validasi user verified, cek tanda tangan existing, validasi file, preview, dan update database. | a_2_verified_users | Lampiran X |
| 19 | Peneliti Auto Fill Signature (Reusable) - Iterasi 2 | Peneliti, Sistem | Alur Peneliti menerima notifikasi dari LTB, membuka booking, memverifikasi dokumen, dan sistem secara otomatis mengisi tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` tanpa perlu upload manual. Proses menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" dari Iterasi 1. | p_1_verifikasi, a_2_verified_users, p_3_clear_to_paraf, pat_1_bookingsspd | Lampiran X |
| 20 | Admin Validasi QR Code (Iterasi 2) | Admin, Sistem | Alur Admin login, mengakses dashboard, memilih menu validasi QR code, memindai QR code dari dokumen, sistem memparse dan memvalidasi QR code di `pat_7_validasi_surat`, memverifikasi digital signature, menampilkan hasil validasi, dan melakukan log audit. | pat_7_validasi_surat, pv_1_paraf_validate, pv_local_certs, pv_2_signing_requests, pv_7_audit_log, pat_1_bookingsspd | Lampiran X |

---

## Tabel 2: Activity Diagram - Proses Terintegrasi Iterasi 2 (Activity 21-25) - Prioritas Tinggi

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 21 | Generate Sertifikat Digital Lokal (Iterasi 2) | Peneliti Validasi (Pejabat), Sistem | Alur generate sertifikat digital lokal dengan algoritma ECDSA-P256, enkripsi passphrase menggunakan scrypt (N=16384, r=8, p=1), generate serial number, calculate fingerprint SHA-256, dan insert ke `pv_local_certs` dengan status 'active' dan validitas 365 hari. | pv_local_certs, a_2_verified_users | Lampiran X |
| 22 | Generate QR Code (Iterasi 2) | Peneliti Validasi (Pejabat), Sistem | Alur generate QR code ganda (publik dan internal) dengan format payload: NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR\|nomor_validasi. Proses meliputi mengambil data user, tanggal sertifikat, nomor validasi, membangun payload, generate QR code image (256x256), dan update database. | pat_7_validasi_surat, pv_1_paraf_validate, a_2_verified_users, pv_local_certs | Lampiran X |
| 23 | Display QR Code di Dokumen (Iterasi 2) | Sistem | Alur menampilkan QR code di dokumen PDF validasi. Proses meliputi mengambil data QR code dari database, load QR code image, membangun PDF validasi, embed QR code ke PDF (posisi kanan bawah, size 100x100), menambahkan info tanda tangan (NIP, special_parafv), menyimpan PDF, dan update database. | pat_7_validasi_surat, pv_1_paraf_validate, file PDF | Lampiran X |
| 24 | Integrasi Bank dengan LTB Parallel Workflow (Iterasi 2) | PPAT/PPATS, LTB, Bank, Sistem | Alur parallel workflow antara Bank dan LTB. PPAT mengirim booking ke LTB & Bank secara bersamaan. LTB dan Bank bekerja secara paralel (LTB: verifikasi berkas, Bank: verifikasi pembayaran). Sistem menunggu kedua proses selesai, kemudian melakukan sinkronisasi data, update status booking, dan mengirim notifikasi ke semua pihak. | bank_1_cek_hasil_transaksi, ltb_1_terima_berkas_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_1_bookingsspd | Lampiran X |
| 25 | Verifikasi Digital Signature (Iterasi 2) | Peneliti Validasi (Pejabat), Sistem | Alur verifikasi digital signature dari sertifikat lokal. Proses meliputi mengambil sertifikat dari `pv_local_certs`, cek tanda tangan sudah upload, input passphrase, verifikasi passphrase menggunakan scrypt dan timingSafeEqual, set session, dan menampilkan hasil verifikasi. | pv_local_certs, a_2_verified_users | Lampiran X |

---

## Tabel 3: Activity Diagram - Proses Terintegrasi Iterasi 2 (Activity 26-32) - Prioritas Sedang

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 26 | PPAT Auto Fill Signature (Iterasi 2) | PPAT/PPATS, Sistem | Alur sistem otomatis mengisi tanda tangan dari database ke booking baru. Proses meliputi mengambil tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path`, cek tanda tangan ada, auto fill signature ke `pat_6_sign`, dan update booking. | pat_6_sign, a_2_verified_users, pat_1_bookingsspd | Lampiran X |
| 27 | Generate Nomor Validasi (Iterasi 2) | Sistem | Alur generate nomor validasi dengan format 7acak-3acak (contoh: A1B2C3D-E4F). Proses meliputi generate bagian 1 (7 karakter acak), generate bagian 2 (3 karakter acak), menggabungkan format, cek unik di database, regenerate jika duplikat, dan insert ke `pat_7_validasi_surat`. | pat_7_validasi_surat | Lampiran X |
| 28 | Select Reusable Signature - Peneliti Validasi (Iterasi 2) | Peneliti Validasi (Pejabat), Sistem | Alur memilih tanda tangan reusable untuk proses validasi. Proses meliputi mengambil tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path`, load tanda tangan image, update `pv_1_paraf_validate` dengan tanda_tangan_path, dan menampilkan preview. | pv_1_paraf_validate, a_2_verified_users | Lampiran X |
| 29 | Real-time Notifications (Iterasi 2) | Admin, Sistem | Alur sistem notifikasi real-time menggunakan long polling. Proses meliputi Admin mengakses menu real-time notifications, sistem memulai long polling connection, mengambil notifikasi dari database, push notifikasi ke client secara real-time, Admin menyusun dan mengirim notifikasi baru, insert ke `sys_notifications`, trigger long polling update, dan mengirim email (opsional). | sys_notifications, pat_1_bookingsspd | Lampiran X |
| 30 | Bank Cek Validasi Pembayaran Detail (Iterasi 2) | Bank (Produk Online Terintegrasi), Sistem | Alur detail verifikasi pembayaran oleh Bank. Proses meliputi melihat daftar booking, memilih booking, melihat detail booking, menginput data pembayaran, melakukan verifikasi, insert/update `bank_1_cek_hasil_transaksi`, update `pat_2_bphtb_perhitungan` dan `pat_4_objek_pajak`, dan menampilkan hasil verifikasi. | bank_1_cek_hasil_transaksi, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_1_bookingsspd | Lampiran X |
| 31 | Bank Hasil Transaksi (Iterasi 2) | Bank (Produk Online Terintegrasi), Sistem | Alur melihat hasil transaksi pembayaran yang telah diverifikasi. Proses meliputi melihat daftar hasil transaksi, memilih transaksi, melihat detail transaksi (status verifikasi, nomor bukti, tanggal pembayaran, BPHTB dibayar, nama pengecek, verified_at), dan export laporan (opsional). | bank_1_cek_hasil_transaksi, pat_1_bookingsspd | Lampiran X |
| 32 | Sinkronisasi Bank-LTB (Iterasi 2) | Sistem | Alur sinkronisasi data antara Bank dan LTB. Proses meliputi mengambil data dari Bank (`bank_1_cek_hasil_transaksi`), mengambil data dari LTB (`ltb_1_terima_berkas_sspd`), update LTB dengan status verifikasi Bank, update `pat_2_bphtb_perhitungan` dan `pat_4_objek_pajak` dengan data Bank, update `pat_1_bookingsspd`, mengirim notifikasi ke LTB dan Bank, dan commit transaction. | bank_1_cek_hasil_transaksi, ltb_1_terima_berkas_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_1_bookingsspd | Lampiran X |

---

## Tabel 4: Activity Diagram - Proses Terintegrasi Iterasi 2 (Activity Bank & Peneliti Validasi) - Sudah Ada

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| Bank | Bank Integration - Verifikasi Pembayaran (Iterasi 2) | Bank (Produk Online Terintegrasi), Sistem | Alur Bank login sebagai produk online terintegrasi, mengakses dashboard, melihat daftar booking yang memerlukan verifikasi pembayaran, memilih booking, melihat detail booking, menginput data pembayaran (nomor bukti, tanggal, BPHTB yang dibayar), melakukan verifikasi, dan sistem melakukan parallel workflow dengan LTB. Proses meliputi insert/update `bank_1_cek_hasil_transaksi`, update `pat_2_bphtb_perhitungan` dan `pat_4_objek_pajak`, serta sinkronisasi dengan LTB. | bank_1_cek_hasil_transaksi, pat_2_bphtb_perhitungan, pat_4_objek_pajak, ltb_1_terima_berkas_sspd, pat_1_bookingsspd | Lampiran X |
| Peneliti Validasi | Peneliti Validasi Final Validation (Iterasi 2) | Peneliti Validasi (Pejabat), Sistem | Alur Peneliti Validasi menerima notifikasi dari Clear to Paraf, membuka booking, melihat dokumen yang sudah diparaf, melakukan final validation, memilih tanda tangan reusable dari `a_2_verified_users`, sistem melakukan generate sertifikat digital lokal (enkripsi AES-256), generate QR code ganda (publik dan internal), generate nomor validasi (format 7acak-3acak), insert ke berbagai tabel terkait, dan mengirim notifikasi ke LSB serta email ke PPAT. Proses menggantikan "Manual Signature" dan "Drop Gambar Tanda Tangan" dari Iterasi 1. | p_3_clear_to_paraf, pv_1_paraf_validate, pv_local_certs, pv_2_signing_requests, pat_7_validasi_surat, lsb_1_serah_berkas, pat_1_bookingsspd, a_2_verified_users | Lampiran X |

---

## 📝 Catatan

- **Total Activity Diagram Iterasi 2:** 15 diagram
  - **3 Activity Diagram yang dijelaskan rinci:** Activity 18, 19, 20
  - **5 Activity Diagram prioritas tinggi:** Activity 21, 22, 23, 24, 25
  - **7 Activity Diagram prioritas sedang:** Activity 26, 27, 28, 29, 30, 31, 32
  - **2 Activity Diagram yang sudah ada:** Bank Integration, Peneliti Validasi Final Validation
- **Format:** Semua Activity Diagram menggunakan format Swimlane untuk menunjukkan pembagian tanggung jawab antar aktor
- **Lokasi File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/`
- **Format File:** XML (Draw.io format)

---

## 🔗 Keterkaitan dengan Use Case Diagram

Activity Diagram Iterasi 2 ini menggambarkan implementasi dari 15 use case baru di Iterasi 2:

1. **Upload Tanda Tangan Sekali** → Activity 18
2. **Auto Fill Signature (PPAT)** → Activity 26
3. **Cek Validasi Pembayaran** → Activity 30
4. **Hasil Transaksi** → Activity 31
5. **Parallel Workflow** → Activity 24
6. **Auto Fill Signature (Reusable) - Peneliti** → Activity 19
7. **Select Reusable Signature** → Activity 28
8. **Generate Sertifikat Digital Lokal** → Activity 21
9. **Generate QR Code** → Activity 22
10. **Display QR Code di Dokumen** → Activity 23
11. **Generate Nomor Validasi** → Activity 27
12. **Validasi QR Code** → Activity 20
13. **Verifikasi Digital Signature** → Activity 25
14. **Real-time Notifications** → Activity 29
15. **Sinkronisasi Bank-LTB** → Activity 32

---

## 💡 Tips untuk Word

**Cara menggunakan tabel ini di Microsoft Word:**

1. **Copy Tabel 1** → Paste ke Word → Format sebagai tabel Word
2. **Copy Tabel 2** → Paste di halaman baru atau setelah Tabel 1 → Format sebagai tabel Word
3. **Atur format tabel:**
   - Font: Times New Roman atau sesuai style TA (biasanya 10-11pt)
   - AutoFit: AutoFit to Window atau AutoFit to Contents
   - Border: All borders untuk kejelasan
   - Header row: Bold dan bisa diwarnai (opsional)
4. **Jika masih tidak muat:**
   - Kurangi font size header menjadi 9pt
   - Gunakan landscape orientation untuk halaman tabel
   - Atau bagi menjadi lebih banyak tabel jika diperlukan

**Alternatif:** Jika Word masih kesulitan, gunakan format landscape (A4 landscape) untuk halaman yang berisi tabel.

---

## 📊 Perbandingan dengan Iterasi 1

### **Activity Diagram yang Diubah:**
- **Activity 14 (Iterasi 1):** Peneliti Receive from LTB dengan "Add Manual Signature" dan "Drop Gambar Tanda Tangan"
- **Activity 19 (Iterasi 2):** Peneliti Auto Fill Signature (Reusable) - menggantikan proses manual dengan auto fill dari database

- **Activity 16 (Iterasi 1):** Peneliti Validasi Final Validation dengan "Manual Signature" dan "Drop Gambar Tanda Tangan" (QR code hanya pajangan)
- **Activity Peneliti Validasi (Iterasi 2):** Peneliti Validasi Final Validation dengan "Select Reusable Signature", "Generate Sertifikat Digital Lokal", "Generate QR Code", dan "Generate Nomor Validasi" (QR code fungsional)

- **Activity 17 (Iterasi 1):** Admin Monitor Process and Send Ping Notifications
- **Activity 20 (Iterasi 2):** Admin Validasi QR Code - fitur baru untuk validasi QR code

### **Activity Diagram Baru:**
- **Activity 18:** Upload Tanda Tangan Sekali (PPAT/PPATS) - fitur baru Iterasi 2
- **Activity Bank Integration:** Bank Integration - Verifikasi Pembayaran - aktor baru Iterasi 2

---

*Tabel ini disusun untuk dokumentasi Activity Diagram Iterasi 2 dalam Tugas Akhir*
