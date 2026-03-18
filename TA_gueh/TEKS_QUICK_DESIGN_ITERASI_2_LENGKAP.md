# 📝 TEKS QUICK DESIGN ITERASI 2 - LENGKAP

## **c) Quick Design (Desain Cepat)**

Pada tahap pemodelan desain cepat untuk Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru yang telah direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti dengan melakukan presentasi wireframe dan mockup kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan feedback dan validasi terhadap fitur keamanan yang kompleks seperti sistem sertifikat digital dan QR code. Kasubbid PSI berperan sebagai validator yang melakukan review terhadap desain untuk memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid PSI. Output desain yang dihasilkan adalah sebagai berikut:

**a) Komponen Keamanan:** Desain iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan sertifikat digital dan modul verifikasi QR code. Panel pengelolaan sertifikat dirancang untuk memungkinkan admin mengelola sertifikat digital yang dihasilkan oleh sistem, sedangkan modul verifikasi QR code dirancang untuk validasi keaslian dokumen secara cepat.

**b) Diagram Alur Validasi:** Diagram alur validasi dirancang menggunakan Draw.io yang terdiri atas tahap: User Request → Authentication → Certificate Generation → QR Code Creation → Verification. Alur ini menggambarkan proses validasi dokumen yang memastikan keamanan dan keaslian dokumen melalui sertifikat digital dan QR code.

**c) Antarmuka Pengguna:** Antarmuka pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan dashboard pemantauan status dokumen dan notifikasi otomatis. Dashboard ini dirancang untuk memberikan overview status dokumen yang mencakup informasi validasi sertifikat digital dan QR code.

**d) Activity Diagram:** Activity Diagram Iterasi 2 menggambarkan alur kerja sistem booking online E-BPHTB secara komprehensif dengan penambahan fitur keamanan dan integrasi Bank serta Peneliti Validasi sebagai produk online terintegrasi. Activity Diagram dapat dilihat pada Gambar X, Gambar Y, Gambar Z, Gambar AA, dan Gambar AB.

Activity Diagram Iterasi 2 terdiri atas lima diagram utama yang menggambarkan proses terintegrasi dan fitur baru:

**Gambar X: Activity Diagram Bank Integration - Verifikasi Pembayaran (Iterasi 2)**

Activity Diagram Bank Integration menggambarkan proses verifikasi pembayaran oleh Bank sebagai produk online terintegrasi dengan sistem. Proses dimulai ketika Bank login ke sistem dengan role "Bank", mengakses dashboard Bank yang menampilkan daftar booking yang memerlukan verifikasi pembayaran. Bank memilih booking untuk diverifikasi, melihat detail booking (data wajib pajak, objek pajak, perhitungan BPHTB), kemudian menginput data pembayaran meliputi: nomor bukti pembayaran, tanggal pembayaran, tanggal perolehan, BPHTB yang telah dibayar, dan catatan bank. Sistem melakukan validasi data pembayaran, kemudian memulai database transaction untuk: (1) Insert/Update bank_1_cek_hasil_transaksi dengan semua data pembayaran, status_verifikasi 'Terverifikasi', nama_pengecek, verified_by, dan verified_at, (2) Update pat_2_bphtb_perhitungan dengan bphtb_yangtelah_dibayar, (3) Update pat_4_objek_pajak dengan nomor_bukti_pembayaran, tanggal_perolehan, dan tanggal_pembayaran, (4) Sinkronisasi dengan LTB (parallel workflow) dengan update status di ltb_1_terima_berkas_sspd, (5) Mengirim notifikasi ke LTB dan PPAT bahwa pembayaran telah terverifikasi. Proses ini memungkinkan Bank dan LTB bekerja secara paralel untuk mempercepat proses verifikasi.

**Gambar Y: Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**

Activity Diagram Peneliti Validasi Final Validation (Iterasi 2) menggambarkan proses validasi final yang telah terintegrasi dengan sistem digital. Proses dimulai ketika Peneliti Validasi melihat notifikasi dari Clear to Paraf, membuka booking, dan melihat dokumen yang sudah diparaf. Peneliti Validasi melakukan final validation, kemudian sistem melakukan proses digital: (1) Mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path (tidak perlu upload manual setiap kali), (2) Generate sertifikat digital lokal dan menyimpan ke pv_local_certs dengan enkripsi AES-256, (3) Generate QR code ganda (publik dan internal) dengan payload yang berbeda, (4) Generate nomor validasi dengan format 7acak-3acak, (5) Insert ke pv_2_signing_requests untuk tracking penandatanganan, (6) Update pv_1_paraf_validate dengan status 'Validated' dan nomor validasi, (7) Insert ke pat_7_validasi_surat dengan nomor validasi, (8) Insert ke lsb_1_serah_berkas dengan status 'Pending Handover', (9) Update pat_1_bookingsspd dengan trackstatus 'Dikirim ke LSB' dan nomor validasi, (10) Mengirim notifikasi ke LSB dan email ke PPAT. Semua proses dilakukan dalam satu database transaction untuk memastikan konsistensi data.

**Gambar Z: Activity Diagram Upload Tanda Tangan Sekali (Iterasi 2)**

Activity Diagram Upload Tanda Tangan Sekali menggambarkan proses PPAT/PPATS mengupload tanda tangan sekali yang akan disimpan secara permanen di a_2_verified_users.tanda_tangan_path untuk digunakan berulang kali pada semua booking selanjutnya. Proses dimulai ketika PPAT/PPATS membuka modal upload tanda tangan reusable, sistem melakukan validasi user verified, mengecek apakah tanda tangan sudah ada (jika ada, menampilkan warning bahwa tanda tangan akan menggantikan yang lama), memilih file tanda tangan (JPG/PNG, maksimal 2MB), sistem melakukan validasi file (ukuran dan format), menampilkan preview tanda tangan, konfirmasi upload, kemudian sistem memproses image (resize dan optimize), menyimpan ke secure storage dengan path /signatures/userid/, dan melakukan update a_2_verified_users dengan tanda_tangan_path. Proses ini memungkinkan PPAT/PPATS hanya perlu upload tanda tangan sekali untuk digunakan selamanya, meningkatkan efisiensi dan mengurangi duplikasi data.

**Gambar AA: Activity Diagram Peneliti Auto Fill Signature (Reusable) - Iterasi 2**

Activity Diagram Peneliti Auto Fill Signature (Reusable) menggambarkan proses Peneliti menggunakan tanda tangan reusable dari database tanpa perlu upload manual setiap kali. Proses dimulai ketika Peneliti melihat notifikasi dari LTB, membuka booking yang diterima, melihat dokumen booking, memverifikasi dokumen, kemudian sistem secara otomatis mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path berdasarkan userid Peneliti. Sistem mengecek apakah tanda tangan reusable ada, jika ada maka sistem menampilkan tanda tangan yang sudah terisi otomatis kepada Peneliti, kemudian Peneliti menekan tombol kirim ke Clear to Paraf. Sistem melakukan database transaction untuk: (1) Update p_1_verifikasi dengan status 'Verified' dan tanda_tangan_path dari reusable, (2) Insert ke p_3_clear_to_paraf dengan status 'Pending', (3) Update pat_1_bookingsspd dengan trackstatus 'Verified by Peneliti', (4) Commit transaction, (5) Mengirim notifikasi ke Peneliti (Paraf). Proses ini menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" dari Iterasi 1, meningkatkan efisiensi dan konsistensi tanda tangan.

**Gambar AB: Activity Diagram Admin Validasi QR Code (Iterasi 2)**

Activity Diagram Admin Validasi QR Code menggambarkan proses Admin melakukan validasi QR code untuk verifikasi keaslian dokumen yang telah divalidasi oleh Peneliti Validasi. Proses dimulai ketika Admin login ke sistem dengan role "Admin", mengakses dashboard admin, memilih menu validasi QR code, kemudian Admin memindai QR code dari dokumen (atau input manual). Sistem melakukan parsing QR code untuk extract payload (nomor_validasi, dll), kemudian melakukan validasi QR code dengan mengecek di pat_7_validasi_surat. Jika QR code tidak valid, sistem menampilkan error. Jika valid, sistem mengambil detail dokumen dari pat_7_validasi_surat, pv_1_paraf_validate, dan pat_1_bookingsspd, kemudian memverifikasi digital signature dengan mengecek pv_local_certs dan pv_2_signing_requests. Sistem menampilkan hasil validasi (status: Valid, detail dokumen), melakukan log validasi ke pv_7_audit_log, dan Admin dapat melihat detail dokumen serta export laporan validasi (opsional). Proses ini memungkinkan Admin melakukan quality control dan verifikasi keaslian dokumen secara cepat dan akurat.

**e) Swimlane Diagram:** Swimlane Diagram Iterasi 2 menggambarkan alur kerja sistem booking online E-BPHTB yang telah dikembangkan menjadi lebih terintegrasi dengan penambahan divisi BANK dan sistem notifikasi real-time. Swimlane Diagram dapat dilihat pada Gambar Z.

Diagram ini membagi keseluruhan proses menjadi tujuh lane utama yaitu PPAT (pengajuan dan upload), LTB (verifikasi berkas), BANK (verifikasi pembayaran), Peneliti (pemeriksaan data), Clear to Paraf (persetujuan digital), Peneliti Validasi (validasi akhir dengan Generate Sertifikat Digital Lokal dan Generate QR Code), dan LSB (serah terima).

**Perubahan Utama dari Iterasi 1:**

1. **PPAT Lane:** Proses dimulai dengan "Upload Tanda Tangan Reusable (Sekali)" yang disimpan di a_2_verified_users, kemudian "Create Booking" dan "Auto Fill Signature (dari a_2_verified_users)" yang memungkinkan tanda tangan otomatis terisi tanpa perlu upload ulang. PPAT mengirim booking ke "Send to LTB & Bank (Parallel)" yang menunjukkan integrasi simultan dengan dua divisi.
2. **LTB Lane:** Proses tetap sama dengan Iterasi 1, namun terintegrasi dengan Bank melalui parallel workflow. LTB melakukan "Receive from PPAT", "Generate No. Registrasi", "Validate Documents", dan "Send to Peneliti".
3. **Bank Lane (BARU - Iterasi 2):** Bank sebagai produk online terintegrasi melakukan "Receive from PPAT (Parallel dengan LTB)", "Check Transaction Results", "Input Payment Data", "Verify Payment", "Update bank_1_cek_hasil_transaksi", dan "Sync with LTB (Parallel Workflow)". Proses ini berjalan secara paralel dengan LTB untuk mempercepat verifikasi pembayaran.
4. **Peneliti Lane:** Proses diubah menjadi "Auto Fill Signature (Reusable)" yang menggunakan tanda tangan dari a_2_verified_users, menghilangkan kebutuhan untuk "Add Manual Signature" dan "Drop Gambar Tanda Tangan" setiap kali.
5. **Clear to Paraf Lane:** Proses tetap sama dengan Iterasi 1, melakukan "Give Paraf & Stempel" dan "Send to Peneliti Validasi".
6. **Peneliti Validasi Lane:** Proses mengalami perubahan signifikan dengan penambahan fitur digital: "Select Reusable Signature" (menggantikan "Manual Signature"), "Generate Digital Certificate", "Generate QR Code (Ganda)", dan "Generate Nomor Validasi". Proses ini memastikan keamanan dan keaslian dokumen melalui sertifikat digital lokal dan QR code ganda.
7. **LSB Lane:** Proses tetap sama dengan Iterasi 1, melakukan "Manual Handover" dan "Update pat_1_bookingsspd".

Swimlane Diagram ini menggambarkan workflow yang lebih efisien dengan integrasi BANK yang memungkinkan verifikasi pembayaran paralel dengan pemeriksaan berkas. PPAT/PPATS dapat mengunggah tanda tangan sekali untuk digunakan berulang kali, sementara Peneliti Validasi melakukan proses Generate Sertifikat Digital Lokal dan Generate QR Code untuk keamanan dokumen. Sistem notifikasi real-time memungkinkan komunikasi yang lebih efektif antar divisi, dengan Admin yang mengelola validasi QR code dan monitoring sistem secara menyeluruh.

**f) Use Case Diagram:** Use Case Diagram Iterasi 2 menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan, otomasi, serta integrasi Bank dan Peneliti Validasi sebagai produk online terintegrasi. Use Case Diagram dapat dilihat pada Gambar W.

Use Case Diagram Iterasi 2 ini menggambarkan peningkatan signifikan pada sistem E-BPHTB melalui penambahan fitur keamanan, otomasi proses, serta peningkatan efisiensi kerja antar divisi. Diagram ini menampilkan delapan aktor utama, yaitu PPAT/PPATS, LTB, BANK (sebagai produk online terintegrasi), Peneliti, Peneliti (Paraf), Peneliti Validasi, LSB, dan Admin, yang berinteraksi dengan 30 use case. Dari 30 use case tersebut, terdapat 15 use case baru yang ditambahkan di Iterasi 2, yang terdiri dari: (1) **Upload Tanda Tangan Sekali** (PPAT/PPATS) - upload tanda tangan sekali untuk digunakan berulang kali, (2) **Auto Fill Signature** (PPAT/PPATS) - otomatis mengisi tanda tangan dari database, (3) **Cek Validasi Pembayaran** (Bank) - verifikasi pembayaran BPHTB oleh Bank sebagai produk online terintegrasi, (4) **Hasil Transaksi** (Bank) - melihat hasil transaksi pembayaran yang telah diverifikasi, (5) **Parallel Workflow** (Bank) - verifikasi pembayaran secara paralel dengan proses LTB, (6) **Auto Fill Signature (Reusable)** (Peneliti) - menggunakan tanda tangan reusable tanpa upload manual, (7) **Select Reusable Signature** (Peneliti Validasi) - memilih tanda tangan reusable untuk validasi, (8) **Generate Sertifikat Digital Lokal** (Peneliti Validasi) - menghasilkan sertifikat digital dengan enkripsi AES-256, (9) **Generate QR Code** (Peneliti Validasi) - menghasilkan QR code ganda untuk verifikasi keaslian dokumen, (10) **Generate Nomor Validasi** (Peneliti Validasi) - menghasilkan nomor validasi format 7acak-3acak, (11) **Validasi QR Code** (Admin) - validasi QR code untuk verifikasi keaslian dokumen, dan (12) **Real-time Notifications** (Admin) - sistem notifikasi real-time menggunakan long polling. Use case baru ini mencakup berbagai fungsi penting seperti otomasi tanda tangan digital, validasi QR Code, serta integrasi sistem bank.

Use Case Diagram ini menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. PPAT/PPATS dapat melakukan "Upload Tanda Tangan Sekali" yang akan digunakan berulang kali dan disimpan di a_2_verified_users, kemudian sistem secara otomatis melakukan "Auto Fill Signature" untuk setiap booking baru tanpa perlu upload ulang. BANK sebagai produk online terintegrasi memiliki use case baru yaitu "Cek Validasi Pembayaran", "Hasil Transaksi", dan "Parallel Workflow" yang memungkinkan verifikasi pembayaran berjalan secara paralel dengan proses LTB. Peneliti memiliki use case "Auto Fill Signature (Reusable)" yang menggantikan proses manual "Add Manual Signature" dan "Drop Gambar Tanda Tangan" dari Iterasi 1. Peneliti Validasi memiliki akses ke use case baru yaitu "Select Reusable Signature", "Generate Sertifikat Digital Lokal", "Generate QR Code", dan "Generate Nomor Validasi" untuk proses validasi yang lebih aman dan terintegrasi. Admin dapat melakukan "Validasi QR Code" dan mengelola "Real-time Notifications" untuk monitoring sistem secara menyeluruh.

Perubahan utama dari Iterasi 1 ke Iterasi 2 pada Use Case Diagram meliputi: (1) PPAT/PPATS: "Add Manual Signature" digantikan dengan "Upload Tanda Tangan Sekali" dan "Auto Fill Signature", (2) Peneliti: "Add Manual Signature" dan "Drop Gambar Tanda Tangan" digantikan dengan "Auto Fill Signature (Reusable)", (3) Peneliti Validasi: "Manual Signature" dan "Drop Gambar Tanda Tangan" digantikan dengan "Select Reusable Signature", "Generate Sertifikat Digital Lokal", "Generate QR Code", dan "Generate Nomor Validasi", (4) BANK: Penambahan aktor baru dengan use case "Cek Validasi Pembayaran", "Hasil Transaksi", dan "Parallel Workflow", (5) Admin: Penambahan use case "Validasi QR Code" dan "Real-time Notifications".

Use Case Diagram Iterasi 2 ini tidak hanya berfungsi sebagai representasi visual dari hubungan antar aktor dan fungsi sistem, tetapi juga menjadi panduan penting dalam tahap pengembangan lanjutan. Peningkatan fitur otomasi, keamanan, dan integrasi lintas divisi (Bank dan Peneliti Validasi sebagai produk online terintegrasi) menunjukkan komitmen pengembang dalam menghadirkan sistem E-BPHTB yang lebih efisien, transparan, dan adaptif terhadap perkembangan teknologi informasi dalam pelayanan publik.

**g) Struktur Database:** Struktur database Iterasi 2 mengalami penambahan tabel baru untuk mendukung integrasi Bank dan sistem sertifikat digital lokal. ERD Database Iterasi 2 dapat dilihat pada Gambar V.

Struktur database Iterasi 2 menambahkan 8 tabel baru yang mendukung fitur keamanan dan integrasi:

1. **bank_1_cek_hasil_transaksi:** Tabel untuk menyimpan data verifikasi pembayaran oleh Bank, termasuk nomor bukti pembayaran, tanggal pembayaran, BPHTB yang telah dibayar, status verifikasi, dan informasi pengecek. Tabel ini terintegrasi dengan pat_2_bphtb_perhitungan dan pat_4_objek_pajak untuk sinkronisasi data pembayaran.
2. **pv_local_certs:** Tabel untuk menyimpan sertifikat digital lokal yang dihasilkan oleh sistem untuk setiap dokumen yang divalidasi. Sertifikat ini menggunakan enkripsi AES-256 dan terhubung dengan a_2_verified_users untuk informasi penandatangan.
3. **pv_2_signing_requests:** Tabel untuk tracking request penandatanganan dengan sertifikat digital, terhubung dengan pv_1_paraf_validate untuk melacak proses validasi.
4. **pv_1_debug_log:** Tabel untuk logging proses debugging dalam sistem penandatanganan digital.
5. **pv_4_signing_audit_event:** Tabel untuk audit event penandatanganan, terhubung dengan pv_2_signing_requests.
6. **pv_7_audit_log:** Tabel untuk audit trail lengkap semua aktivitas validasi, terhubung dengan pv_1_paraf_validate.
7. **pat_7_validasi_surat:** Tabel untuk menyimpan nomor validasi (format 7acak-3acak) dan informasi validasi surat, terhubung dengan pat_1_bookingsspd.
8. **sys_notifications:** Tabel untuk sistem notifikasi real-time, terhubung dengan a_2_verified_users dan pat_1_bookingsspd.

Selain penambahan tabel baru, beberapa tabel yang sudah ada juga mengalami update:

- **a_2_verified_users:** Ditambahkan kolom tanda_tangan_path untuk menyimpan path tanda tangan reusable yang dapat digunakan berulang kali.
- **pv_1_paraf_validate:** Ditambahkan kolom created_at dan catatan "Iterasi 2 - Digital Certificate Integration" untuk mendukung proses validasi dengan sertifikat digital lokal.

Struktur database ini dirancang untuk mendukung parallel workflow antara Bank dan LTB, sistem sertifikat digital lokal, QR code ganda, dan notifikasi real-time yang menjadi ciri khas Iterasi 2.

---

## 📋 RINGKASAN PENEMPATAN GAMBAR

### **Di Bagian "c) Quick Design (Desain Cepat)":**

1. **Setelah paragraf "d) Activity Diagram":**

   - **Gambar X: Activity Diagram Bank Integration - Verifikasi Pembayaran (Iterasi 2)**
   - **Gambar Y: Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**
   - **Gambar Z: Activity Diagram Upload Tanda Tangan Sekali (Iterasi 2)**
   - **Gambar AA: Activity Diagram Peneliti Auto Fill Signature (Reusable) - Iterasi 2**
   - **Gambar AB: Activity Diagram Admin Validasi QR Code (Iterasi 2)**
2. **Setelah paragraf "e) Swimlane Diagram":**

   - **Gambar AC: Diagram Proses Bisnis Iterasi 2 (dengan Penambahan Role Bank)**
3. **Setelah paragraf "f) Use Case Diagram":**

   - **Gambar AD: Use Case Diagram Iterasi 2**
4. **Setelah paragraf "g) Struktur Database":**

   - **Gambar AE: ERD Database E-BPHTB - Iterasi 2**

---

## ✅ CHECKLIST KELENGKAPAN

- ✅ **a) Komponen Keamanan** - Sudah lengkap
- ✅ **b) Diagram Alur Validasi** - Sudah lengkap
- ✅ **c) Antarmuka Pengguna** - Sudah lengkap
- ✅ **d) Activity Diagram** - **SUDAH DILENGKAPI** dengan deskripsi 2 diagram
- ✅ **e) Swimlane Diagram** - **SUDAH DILENGKAPI** dengan deskripsi lengkap
- ✅ **f) Use Case Diagram** - Sudah lengkap
- ✅ **g) Struktur Database** - **DITAMBAHKAN** dengan deskripsi lengkap

---

**Dibuat untuk:** Bagian Quick Design Iterasi 2 di BAB IV
**Tanggal:** Desember 2025
**Status:** Semua bagian sudah lengkap
