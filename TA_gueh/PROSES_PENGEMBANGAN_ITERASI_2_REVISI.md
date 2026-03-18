# Proses Pengembangan Iterasi 2 (Revisi)

Iterasi kedua dilakukan dari Maret hingga Agustus 2025 setelah memperoleh feedback dari pengujian Iterasi 1, dimana berdasarkan *action plan* yang telah disepakati, fokus pengembangan dialihkan pada peningkatan keamanan dokumen dan efisiensi proses melalui implementasi tanda tangan digital *reusable*, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi. Proses pengembangan mengikuti tahapan metode *prototyping* sebagai berikut:

## a) Communication (Komunikasi)

Tahap komunikasi kedua dilakukan untuk menggali kebutuhan pengembangan fitur keamanan dan efisiensi dokumen berdasarkan hasil evaluasi Iterasi 1. Diskusi dilakukan dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk merancang sistem validasi berbasis sertifikat digital. Analisis kebutuhan menunjukkan sistem harus mendukung: (1) enkripsi dokumen dengan *AES-256*, (2) validasi keaslian menggunakan *QR code*, (3) audit trail lengkap untuk setiap proses dokumen, dan (4) pembuatan sertifikat digital sebagai tanda keaslian dokumen.

Hasil komunikasi dari diskusi dengan Kasubbid PSI menunjukkan bahwa iterasi kedua perlu fokus pada peningkatan keamanan dokumen dan efisiensi proses untuk mengatasi kekurangan yang ditemukan pada Iterasi 1. Sistem keamanan yang direncanakan akan mengintegrasikan teknologi sertifikat digital dan *QR code* yang akan dikembangkan khusus untuk sistem ini, dimana sebelumnya BAPPENDA belum memiliki sistem sertifikat digital untuk validasi dokumen. Implementasi sistem sertifikat digital ini diharapkan dapat memastikan keaslian dan keamanan dokumen yang diproses melalui sistem *booking online*.

## b) Quick Plan (Perencanaan Cepat)

Selama tahap perencanaan cepat, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem keamanan dan efisiensi untuk Iterasi 2. Proses perencanaan dilakukan melalui diskusi teknis dengan Kasubbid PSI sebagai mentor dan validator dalam merancang solusi keamanan yang komprehensif. Output perencanaan yang dihasilkan adalah sebagai berikut:

### a) Modifikasi Database

Tahap perencanaan mencakup penambahan 7 tabel *database* baru untuk mendukung fitur keamanan, yaitu *bank_1_cek_hasil_transaksi*, *pv_local_certs*, *pv_2_signing_requests*, *pv_1_debug_log*, *pv_4_signing_audit_event*, *pv_7_audit_log*, dan *sys_notifications*. Modifikasi juga dilakukan pada beberapa tabel *existing* (*a_2_verified_users*, *p_1_verifikasi*, dan *p_3_clear_to_paraf*) untuk menambahkan kolom tanda tangan digital. Penambahan tabel dan kolom ini dirancang untuk mendukung arsitektur keamanan dengan empat lapisan utama.

### b) Arsitektur Keamanan 4 Lapisan

1. **Certificate Generation**: Sistem akan menghasilkan sertifikat digital untuk setiap dokumen yang divalidasi, di mana sertifikat ini berfungsi sebagai tanda keaslian dan keamanan dokumen.

2. **QR Code Embedding**: Sistem akan menambahkan *QR code* ke setiap dokumen yang telah divalidasi, di mana *QR code* ini dapat digunakan untuk verifikasi keaslian dokumen secara cepat.

3. **Encrypted Storage**: Dokumen yang disimpan di *database* akan dienkripsi menggunakan AES-256 untuk memastikan keamanan data dari akses yang tidak sah.

4. **Audit Logging**: Sistem akan mencatat semua aktivitas yang terjadi pada dokumen dalam tabel *audit log*, di mana catatan ini berfungsi untuk *tracking* dan *audit trail* setiap proses yang dilakukan.

### c) Integrasi Sistem

Sistem juga dirancang untuk terintegrasi dengan divisi Bank untuk verifikasi pembayaran, dimana integrasi ini memungkinkan verifikasi pembayaran dilakukan secara paralel dengan pemeriksaan berkas untuk meningkatkan efisiensi proses.

## c) Quick Design (Desain Cepat)

Pada tahap pemodelan desain cepat untuk Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru yang telah direncanakan pada tahap *Quick Plan*. Proses desain dilakukan oleh peneliti dengan melakukan presentasi *wireframe* dan *mockup* kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan *feedback* dan validasi terhadap fitur keamanan yang kompleks seperti sistem sertifikat digital dan *QR code*. Kasubbid PSI berperan sebagai validator yang melakukan *review* terhadap desain untuk memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid PSI. Output desain yang dihasilkan adalah sebagai berikut:

### a) Komponen Keamanan

Desain iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan sertifikat digital dan modul verifikasi *QR code*. Panel pengelolaan sertifikat dirancang untuk memungkinkan admin mengelola sertifikat digital yang dihasilkan oleh sistem, sedangkan modul verifikasi *QR code* dirancang untuk validasi keaslian dokumen secara cepat.

### b) Diagram Alur Validasi

Diagram alur validasi dirancang menggunakan *Draw.io* yang terdiri atas tahap: *User Request* → *Authentication* → *Certificate Generation* → *QR Code Creation* → *Verification*. Alur ini menggambarkan proses validasi dokumen yang memastikan keamanan dan keaslian dokumen melalui sertifikat digital dan *QR code*.

### c) Antarmuka Pengguna

Antarmuka pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan *dashboard* pemantauan status dokumen dan notifikasi otomatis. *Dashboard* ini dirancang untuk memberikan *overview* status dokumen yang mencakup informasi validasi sertifikat digital dan *QR code*.

### d) Activity Diagram

*Activity Diagram* Iterasi 2 menggambarkan alur kerja sistem *booking online* E-BPHTB secara komprehensif dengan penambahan fitur keamanan dan integrasi Bank serta Peneliti Validasi sebagai produk online terintegrasi. *Activity Diagram* dapat dilihat pada Gambar 11, Gambar 12, Gambar 13, Gambar 14, dan Gambar 15.

Activity Diagram Iterasi 2 terdiri atas lima diagram utama yang menggambarkan proses terintegrasi:

#### 1. Activity Diagram Bank Integration (Gambar 11)

Activity Diagram Bank Integration menggambarkan proses verifikasi pembayaran oleh Bank sebagai produk online terintegrasi dengan sistem. Proses dimulai ketika Bank login ke sistem dengan role "Bank", mengakses dashboard Bank yang menampilkan daftar booking yang memerlukan verifikasi pembayaran. Bank memilih booking untuk diverifikasi, melihat detail booking (data wajib pajak, objek pajak, perhitungan BPHTB), kemudian menginput data pembayaran meliputi: nomor bukti pembayaran, tanggal pembayaran, tanggal perolehan, BPHTB yang telah dibayar, dan catatan bank. Sistem melakukan validasi data pembayaran, kemudian memulai database transaction untuk: (1) Insert/Update `bank_1_cek_hasil_transaksi` dengan semua data pembayaran, status_verifikasi 'Terverifikasi', nama_pengecek, verified_by, dan verified_at, (2) Update `pat_2_bphtb_perhitungan` dengan bphtb_yangtelah_dibayar, (3) Update `pat_4_objek_pajak` dengan nomor_bukti_pembayaran, tanggal_perolehan, dan tanggal_pembayaran, (4) Sinkronisasi dengan LTB (parallel workflow) dengan update status di `ltb_1_terima_berkas_sspd`, (5) Mengirim notifikasi ke LTB dan PPAT bahwa pembayaran telah terverifikasi. Proses ini memungkinkan Bank dan LTB bekerja secara paralel untuk mempercepat proses verifikasi.

#### 2. Activity Diagram Peneliti Validasi Final Validation (Gambar 12)

Activity Diagram Peneliti Validasi Final Validation (Iterasi 2) menggambarkan proses validasi final yang telah terintegrasi dengan sistem digital. Proses dimulai ketika Peneliti Validasi melihat notifikasi dari Clear to Paraf, membuka booking, dan melihat dokumen yang sudah diparaf. Peneliti Validasi melakukan final validation, kemudian sistem melakukan proses digital: (1) Mengambil tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` (tidak perlu upload manual setiap kali), (2) Generate sertifikat digital lokal dan menyimpan ke `pv_local_certs` dengan enkripsi AES-256, (3) Generate QR code ganda (publik dan internal) dengan payload yang berbeda, (4) Generate nomor validasi dengan format 7acak-3acak, (5) Insert ke `pv_2_signing_requests` untuk tracking penandatanganan, (6) Update `pv_1_paraf_validate` dengan status 'Validated' dan nomor validasi, (7) Insert ke `pat_7_validasi_surat` dengan nomor validasi, (8) Insert ke `lsb_1_serah_berkas` dengan status 'Pending Handover', (9) Update `pat_1_bookingsspd` dengan trackstatus 'Dikirim ke LSB' dan nomor validasi, (10) Mengirim notifikasi ke LSB dan email ke PPAT. Semua proses dilakukan dalam satu database transaction untuk memastikan konsistensi data.

#### 3. Activity Diagram Upload Tanda Tangan Sekali (Gambar 13)

Activity Diagram Upload Tanda Tangan Sekali menggambarkan proses PPAT/PPATS mengupload tanda tangan sekali yang akan disimpan secara permanen di `a_2_verified_users.tanda_tangan_path` untuk digunakan berulang kali pada semua booking selanjutnya. Proses dimulai ketika PPAT/PPATS membuka modal upload tanda tangan reusable, sistem melakukan validasi user verified, mengecek apakah tanda tangan sudah ada (jika ada, menampilkan warning bahwa tanda tangan akan menggantikan yang lama), memilih file tanda tangan (JPG/PNG, maksimal 2MB), sistem melakukan validasi file (ukuran dan format), menampilkan preview tanda tangan, konfirmasi upload, kemudian sistem memproses image (resize dan optimize), menyimpan ke secure storage dengan path `/signatures/userid/`, dan melakukan update `a_2_verified_users` dengan `tanda_tangan_path`. Proses ini memungkinkan PPAT/PPATS hanya perlu upload tanda tangan sekali untuk digunakan selamanya, meningkatkan efisiensi dan mengurangi duplikasi data.

#### 4. Activity Diagram Peneliti Auto Fill Signature (Reusable) (Gambar 14)

Activity Diagram Peneliti Auto Fill Signature (Reusable) menggambarkan proses Peneliti menggunakan tanda tangan reusable dari database tanpa perlu upload manual setiap kali. Proses dimulai ketika Peneliti melihat notifikasi dari LTB, membuka booking yang diterima, melihat dokumen booking, memverifikasi dokumen, kemudian sistem secara otomatis mengambil tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` berdasarkan userid Peneliti. Sistem mengecek apakah tanda tangan reusable ada, jika ada maka sistem menampilkan tanda tangan yang sudah terisi otomatis kepada Peneliti, kemudian Peneliti menekan tombol kirim ke Clear to Paraf. Sistem melakukan database transaction untuk: (1) Update `p_1_verifikasi` dengan status 'Verified' dan tanda_tangan_path dari reusable, (2) Insert ke `p_3_clear_to_paraf` dengan status 'Pending', (3) Update `pat_1_bookingsspd` dengan trackstatus 'Verified by Peneliti', (4) Commit transaction, (5) Mengirim notifikasi ke Peneliti (Paraf). Proses ini menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" dari Iterasi 1, meningkatkan efisiensi dan konsistensi tanda tangan.

#### 5. Activity Diagram Admin Validasi QR Code (Gambar 15)

Activity Diagram Admin Validasi QR Code menggambarkan proses Admin melakukan validasi QR code untuk verifikasi keaslian dokumen yang telah divalidasi oleh Peneliti Validasi. Proses dimulai ketika Admin login ke sistem dengan role "Admin", mengakses dashboard admin, memilih menu validasi QR code, kemudian Admin memindai QR code dari dokumen (atau input manual). Sistem melakukan parsing QR code untuk extract payload (nomor_validasi, dll), kemudian melakukan validasi QR code dengan mengecek di `pat_7_validasi_surat`. Jika QR code tidak valid, sistem menampilkan error. Jika valid, sistem mengambil detail dokumen dari `pat_7_validasi_surat`, `pv_1_paraf_validate`, dan `pat_1_bookingsspd`, kemudian memverifikasi digital signature dengan mengecek `pv_local_certs` dan `pv_2_signing_requests`. Sistem menampilkan hasil validasi (status: Valid, detail dokumen), melakukan log validasi ke `pv_7_audit_log`, dan Admin dapat melihat detail dokumen serta export laporan validasi (opsional). Proses ini memungkinkan Admin melakukan quality control dan verifikasi keaslian dokumen secara cepat dan akurat.

### e) Proses Bisnis

Proses Bisnis Iterasi 2 menggambarkan alur kerja sistem *booking online* E-BPHTB yang telah dikembangkan menjadi lebih terintegrasi dengan penambahan divisi BANK dan sistem notifikasi *real-time*. Swimlane Diagram dapat dilihat pada Gambar 16.

**Gambar 16 Alur Proses Bisnis Iterasi 2**

Diagram ini membagi keseluruhan proses menjadi tujuh *lane* utama yaitu PPAT (pengajuan dan *upload*), LTB (verifikasi berkas), BANK (verifikasi pembayaran), Peneliti (pemeriksaan data), *Clear to Paraf* (persetujuan digital), Peneliti Validasi (validasi akhir dengan *Generate* Sertifikat Digital Lokal dan *Generate QR Code*), dan LSB (serah terima).

**Perubahan Utama dari Iterasi 1:**

1. **PPAT *Lane***: Proses dimulai dengan "*Upload* Tanda Tangan *Reusable* (Sekali)" yang disimpan di *a_2_verified_users*, kemudian "*Create Booking*" dan "*Auto Fill Signature* (dari *a_2_verified_users*)" yang memungkinkan tanda tangan otomatis terisi tanpa perlu *upload* ulang. PPAT mengirim *booking* ke "*Send to LTB & Bank (Parallel)*" yang menunjukkan integrasi simultan dengan dua divisi.

2. **LTB *Lane***: Proses tetap sama dengan Iterasi 1, namun terintegrasi dengan Bank melalui *parallel workflow*. LTB melakukan "*Receive from PPAT*", "*Generate No. Registrasi*", "*Validate Documents*", dan "*Send to Peneliti*".

3. **Bank *Lane* (Iterasi 2)**: Bank sebagai produk *online* terintegrasi melakukan "*Receive from PPAT (Parallel dengan LTB)*", "*Check Transaction Results*", "*Input Payment Data*", "*Verify Payment*", "*Update bank_1_cek_hasil_transaksi*", dan "*Sync with LTB (Parallel Workflow)*". Proses ini berjalan secara paralel dengan LTB untuk mempercepat verifikasi pembayaran.

4. **Peneliti *Lane***: Proses diubah menjadi "*Auto Fill Signature (Reusable)*" yang menggunakan tanda tangan dari *a_2_verified_users*, menghilangkan kebutuhan untuk "*Add Manual Signature*" dan "*Drop Gambar Tanda Tangan*" setiap kali.

5. **Clear to Paraf *Lane***: Proses tetap sama dengan Iterasi 1, melakukan "*Give Paraf & Stempel*" dan "*Send to Peneliti Validasi*".

6. **Peneliti Validasi *Lane***: Proses mengalami perubahan signifikan dengan penambahan fitur digital: "*Select Reusable Signature*" (menggantikan "*Manual Signature*"), "*Generate Digital Certificate*", "*Generate QR Code (Ganda)*", dan "*Generate Nomor Validasi*". Proses ini memastikan keamanan dan keaslian dokumen melalui sertifikat digital lokal dan *QR code* ganda.

7. **LSB *Lane***: Proses tetap sama dengan Iterasi 1, melakukan "*Manual Handover*" dan "*Update pat_1_bookingsspd*".

Proses ini menggambarkan *workflow* yang lebih efisien dengan integrasi BANK yang memungkinkan verifikasi pembayaran paralel dengan pemeriksaan berkas. PPAT/PPATS dapat mengunggah tanda tangan sekali untuk digunakan berulang kali (*reusable*), sementara Peneliti Validasi melakukan proses *Generate* Sertifikat Digital Lokal dan *Generate QR Code* untuk keamanan dokumen. Sistem notifikasi *real-time* memungkinkan komunikasi yang lebih efektif antar divisi, dengan Admin yang mengelola validasi *QR code* dan *monitoring* sistem secara menyeluruh.

### f) Use Case Diagram

*Use Case Diagram* Iterasi 2 menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. *Use Case Diagram* dapat dilihat pada Gambar 17.

**Gambar 17 *Usecase* Iterasi 2**

*Use Case Diagram* Iterasi 2 ini menggambarkan signifikan pada sistem *E-BPHTB* melalui penambahan fitur keamanan, otomasi proses, serta peningkatan efisiensi kerja antar divisi. Diagram ini menampilkan tujuh aktor utama, yaitu PPAT/PPATS, LTB, BANK, Peneliti, Peneliti Validasi, Sistem, dan Admin, yang berinteraksi dengan 22 use case yang mencakup berbagai fungsi penting seperti otomasi tanda tangan digital, validasi *QR Code*, serta integrasi sistem bank.

*Use Case Diagram* ini menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. PPAT/PPATS dapat melakukan "Upload Tanda Tangan Sekali" dan "PPAT Auto Fill Signature" yang akan digunakan berulang kali, sementara Peneliti dapat melakukan "Peneliti Auto Fill Signature Reusable". BANK terintegrasi langsung dengan berbagai fungsi seperti "Bank Login", "Bank View Dashboard", "Bank View Booking List", "Bank View Booking Detail", "Bank Cek Validasi Pembayaran Detail", "Bank Hasil Transaksi", "Bank Input Payment Data", "Bank Verify Payment", dan "Bank Save Verification". Peneliti Validasi memiliki akses ke "Generate Sertifikat Digital Lokal", "Generate QR Code", "Verifikasi Digital Signature", dan "Select Reusable Signature" untuk proses validasi yang lebih aman. Admin dapat melakukan "Admin Validasi QR Code" dan mengelola "Real-time Notifications" untuk monitoring sistem secara menyeluruh. Sistem secara otomatis melakukan "Display QR Code di Dokumen", "Generate Nomor Validasi", "Sinkronisasi Bank-LTB", dan "Integrasi Bank dengan LTB Parallel Workflow" untuk mendukung efisiensi proses.

*Use Case Diagram* Iterasi 2 ini tidak hanya berfungsi sebagai representasi visual dari hubungan antar aktor dan fungsi sistem, tetapi juga menjadi panduan penting dalam tahap pengembangan lanjutan. Peningkatan fitur otomasi, keamanan, dan integrasi lintas divisi menunjukkan komitmen pengembang dalam menghadirkan sistem *E-BPHTB* yang lebih efisien, transparan, dan adaptif terhadap perkembangan teknologi informasi dalam pelayanan publik.

### g) Struktur Database

Struktur *database* Iterasi 2 mengalami penambahan tabel baru untuk mendukung integrasi Bank dan sistem sertifikat digital lokal. ERD *Database* Iterasi 2 dapat dilihat pada Gambar 18.

**Gambar 18 Struktur Database Iterasi 2**

Struktur *database* Iterasi 2 menambahkan 7 tabel baru yang mendukung fitur keamanan dan integrasi:

1. **bank_1_cek_hasil_transaksi**: Tabel untuk menyimpan data verifikasi pembayaran oleh Bank, termasuk nomor bukti pembayaran, tanggal pembayaran, BPHTB yang telah dibayar, status verifikasi, dan informasi pengecek. Tabel ini terintegrasi dengan *pat_2_bphtb_perhitungan* dan *pat_4_objek_pajak* untuk sinkronisasi data pembayaran.

2. **pv_local_certs**: Tabel untuk menyimpan sertifikat digital lokal yang dihasilkan oleh sistem untuk setiap dokumen yang divalidasi. Sertifikat ini menggunakan enkripsi AES-256 dan terhubung dengan *a_2_verified_users* untuk informasi penandatangan.

3. **pv_2_signing_requests**: Tabel untuk *tracking request* penandatanganan dengan sertifikat digital, terhubung dengan *pv_1_paraf_validate* untuk melacak proses validasi.

4. **pv_1_debug_log**: Tabel untuk *logging* proses *debugging* dalam sistem penandatanganan digital.

5. **pv_4_signing_audit_event**: Tabel untuk *audit event* penandatanganan, terhubung dengan *pv_2_signing_requests*.

6. **pv_7_audit_log**: Tabel untuk *audit trail* lengkap semua aktivitas validasi, terhubung dengan *pv_1_paraf_validate*.

7. **sys_notifications**: Tabel untuk sistem notifikasi *real-time*, terhubung dengan *a_2_verified_users* dan *pat_1_bookingsspd*.

Struktur database ini dirancang untuk mendukung parallel workflow antara Bank dan LTB, sistem sertifikat digital lokal, QR code ganda, dan notifikasi real-time yang menjadi ciri khas Iterasi 2.

---

**Catatan:** File ini dibuat untuk perbandingan dengan versi lama. Silakan review dan bandingkan dengan bagian yang ada di `Bab_4_hasilPembahasan_pbaru.md` untuk memastikan konsistensi dan akurasi.
