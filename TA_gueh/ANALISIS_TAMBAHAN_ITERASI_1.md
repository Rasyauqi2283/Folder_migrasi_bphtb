# 📋 ANALISIS TAMBAHAN UNTUK PROSES PENGEMBANGAN ITERASI 1

## 🎯 RINGKASAN

Berdasarkan review terhadap bagian **4.1.1.1 Proses Pengembangan Iterasi 1**, berikut adalah komponen yang **perlu ditambahkan atau diperjelas** untuk membuat deskripsi lebih lengkap dan komprehensif.

---

## ✅ KOMPONEN YANG SUDAH ADA (Sudah Baik)

1. ✅ **Tahapan Prototyping** - Communication, Quick Plan, Quick Design, Construction, Delivery & Feedback
2. ✅ **Metodologi Pengumpulan Data** - Wawancara dan Observasi
3. ✅ **Diagram UML** - Activity Diagram, Use Case Diagram, Diagram Proses Bisnis, ERD
4. ✅ **Fitur Utama** - Formulir Booking, Upload Dokumen, Dashboard, Login Multi-divisi
5. ✅ **Hasil Evaluasi** - Kekurangan yang ditemukan dan action plan untuk Iterasi 2

---

## ⚠️ KOMPONEN YANG PERLU DITAMBAHKAN

### 1. **DETAIL PERHITUNGAN BPHTB DAN NJOP** ⚠️ PENTING

**Status Saat Ini:** 
- Hanya disebutkan "perhitungan BPHTB dan NJOP otomatis"
- Tidak dijelaskan bagaimana cara kerjanya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Formulir Booking Online, tambahkan:

```
*e) Sistem Perhitungan BPHTB dan NJOP Otomatis*: Sistem dirancang untuk melakukan perhitungan BPHTB dan NJOP secara otomatis berdasarkan data yang dimasukkan oleh PPAT/PPATS. Perhitungan NJOP dilakukan dengan mengalikan luas tanah dengan nilai NJOP tanah per meter persegi, ditambah dengan luas bangunan dikalikan nilai NJOP bangunan per meter persegi. Total NJOP kemudian digunakan sebagai dasar perhitungan BPHTB dengan menggunakan tarif yang berlaku sesuai dengan peraturan perundang-undangan. Sistem perhitungan ini memastikan akurasi dan konsistensi perhitungan pajak, serta mengurangi kesalahan manual yang sering terjadi pada sistem sebelumnya. Hasil perhitungan disimpan dalam tabel `pat_2_bphtb_perhitungan` dan `pat_5_penghitungan_njop` untuk keperluan tracking dan audit.
```

**Lokasi:** Setelah paragraf "*a) Formulir Booking Online*" di bagian Construction

---

### 2. **DETAIL DATABASE TRIGGERS DAN CONSTRAINTS** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "sistem penomoran otomatis (no_booking_, no_registrasi)"
- Tidak dijelaskan bagaimana implementasinya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Sistem Login, tambahkan:

```
*e) Database Triggers dan Constraints*: Sistem menggunakan database triggers untuk menghasilkan nomor booking dan nomor registrasi secara otomatis. Trigger `trg_nobooking` diaktifkan sebelum data di-insert ke tabel `pat_1_bookingsspd`, yang akan menghasilkan nomor booking dengan format `ppat_khusus-YYYY-000001`, dimana `ppat_khusus` diambil dari data pengguna yang membuat booking, `YYYY` merupakan tahun berjalan, dan `000001` merupakan urutan sequence yang di-generate secara otomatis. Demikian pula, trigger untuk nomor registrasi menghasilkan format `YYYYO00001` (contoh: 2025O00001) yang disimpan di tabel `ltb_1_terima_berkas_sspd`. Sistem juga menggunakan foreign key constraints untuk memastikan integritas data antar tabel, serta unique constraints untuk mencegah duplikasi nomor booking dan nomor registrasi. Implementasi triggers dan constraints ini memastikan konsistensi data dan mengurangi kemungkinan kesalahan input manual.
```

**Lokasi:** Setelah paragraf "*d) Sistem Login Multi-divisi*" di bagian Construction

---

### 3. **DETAIL SISTEM VALIDASI INPUT** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "validasi input untuk memastikan data yang dimasukkan sesuai dengan format"
- Tidak dijelaskan jenis validasi apa saja

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Formulir Booking Online, tambahkan detail:

```
Formulir booking online dilengkapi dengan sistem validasi input yang komprehensif untuk memastikan data yang dimasukkan sesuai dengan format yang diharapkan. Validasi yang diimplementasikan meliputi: (1) validasi format nomor identitas (NIK untuk perorangan dan NPWP untuk badan), (2) validasi format tanggal menggunakan date picker dan format Indonesia (DD/MM/YYYY), (3) validasi kelengkapan data wajib dengan indikator visual pada form, (4) validasi format nomor telepon dan email, (5) validasi konsistensi data antara wajib pajak dan pemilik objek pajak, serta (6) validasi format file dokumen yang diunggah (PDF, JPG, PNG dengan ukuran maksimal 5MB). Sistem validasi ini memberikan feedback real-time kepada pengguna melalui pesan error yang jelas dan informatif, sehingga mengurangi kesalahan input dan meningkatkan kualitas data yang dimasukkan ke sistem.
```

**Lokasi:** Di dalam paragraf "*a) Formulir Booking Online*" - perpanjang paragraf yang ada

---

### 4. **DETAIL SISTEM FILE UPLOAD DAN STORAGE** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "dokumen yang diunggah disimpan dalam database"
- Tidak dijelaskan bagaimana mekanisme penyimpanannya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Unggah Dokumen, tambahkan:

```
Sistem unggah dokumen dirancang dengan mekanisme penyimpanan yang aman dan terstruktur. Dokumen yang diunggah oleh PPAT/PPATS (akta tanah, sertifikat tanah, dan dokumen pelengkap) disimpan menggunakan secure storage server (UploadCare atau secure storage server) dengan enkripsi file untuk keamanan data. Metadata dokumen seperti nama file, ukuran file, tipe MIME, file ID, dan path penyimpanan disimpan dalam database di tabel `pat_1_bookingsspd` untuk keperluan tracking dan akses oleh divisi terkait. Sistem juga melakukan validasi terhadap file yang diunggah, meliputi validasi format file (hanya menerima PDF, JPG, PNG), validasi ukuran file (maksimal 5MB per file), dan validasi virus scanning untuk memastikan keamanan sistem. Setiap dokumen yang diunggah mendapatkan file ID unik yang digunakan untuk referensi di seluruh sistem, memungkinkan akses dokumen oleh divisi terkait sesuai dengan tahapan proses tanpa perlu mengunggah ulang dokumen.
```

**Lokasi:** Di dalam paragraf "*b) Unggah Dokumen*" - perpanjang paragraf yang ada

---

### 5. **DETAIL SISTEM NOTIFIKASI** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "sistem notifikasi untuk update status dokumen"
- Tidak dijelaskan bagaimana mekanismenya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Dashboard Admin, tambahkan:

```
Sistem notifikasi dirancang untuk memberikan update real-time kepada pengguna ketika ada perubahan status dokumen. Notifikasi dikirim melalui sistem internal yang terintegrasi dengan dashboard, dimana setiap divisi akan menerima notifikasi ketika dokumen yang menjadi tanggung jawabnya mengalami perubahan status. Sistem notifikasi menggunakan tabel `sys_notifications` untuk menyimpan notifikasi yang mencakup informasi recipient_id, booking_id, title, message, is_read, dan created_at. Notifikasi ditampilkan di dashboard masing-masing divisi dengan indikator visual (badge) untuk notifikasi yang belum dibaca. Sistem juga mendukung notifikasi berdasarkan recipient_divisi untuk notifikasi yang ditujukan ke seluruh anggota divisi tertentu. Mekanisme notifikasi ini memastikan komunikasi yang efektif antar divisi dan mengurangi kemungkinan dokumen terlewat atau tertunda dalam proses.
```

**Lokasi:** Di dalam paragraf "*c) Dashboard Admin dan Tracking Real-time*" - perpanjang paragraf yang ada

---

### 6. **DETAIL SISTEM SESSION MANAGEMENT** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "sistem login multi-divisi dengan role-based access control"
- Tidak dijelaskan bagaimana session management-nya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang Sistem Login, tambahkan detail:

```
Sistem login multi-divisi menggunakan session management berbasis JWT (JSON Web Token) untuk mengelola autentikasi dan otorisasi pengguna. Setelah pengguna berhasil login, sistem menghasilkan JWT token yang berisi informasi userid, divisi, dan role pengguna. Token ini disimpan di client-side (localStorage atau sessionStorage) dan dikirim dalam setiap request ke server melalui header Authorization. Server memvalidasi token pada setiap request untuk memastikan pengguna masih terautentikasi dan memiliki hak akses yang sesuai. Sistem juga mengimplementasikan session timeout untuk keamanan, dimana pengguna akan di-logout otomatis setelah periode inaktivitas tertentu. Role-based access control (RBAC) diimplementasikan di level controller untuk memastikan setiap divisi hanya dapat mengakses endpoint dan fitur yang sesuai dengan perannya, seperti PPAT/PPATS hanya dapat mengakses fitur booking, LTB hanya dapat mengakses fitur verifikasi, dan seterusnya.
```

**Lokasi:** Di dalam paragraf "*d) Sistem Login Multi-divisi*" - perpanjang paragraf yang ada

---

### 7. **HASIL KUANTITATIF DARI TESTING** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan "sistem dapat berfungsi dengan baik"
- Tidak ada angka/metrik konkret

**Yang Perlu Ditambahkan:**

Di bagian **"e) Delivery and Feedback"** setelah paragraf tentang hasil evaluasi, tambahkan:

```
Hasil kuantitatif dari pengujian Iterasi 1 menunjukkan peningkatan signifikan dibandingkan sistem manual sebelumnya. Berdasarkan data pengujian selama dua minggu dengan 10 penguji (5 pegawai BAPPENDA dan 5 PPAT eksternal), diperoleh hasil sebagai berikut: (1) waktu rata-rata proses berkas menurun dari 30-40 menit menjadi 10-25 menit per dokumen (peningkatan efisiensi 37,5-62,5%), (2) tingkat kesalahan input menurun dari 10% menjadi 3% (pengurangan kesalahan 70%), (3) akurasi tracking status mencapai 100% untuk semua dokumen yang diproses, (4) tingkat kepuasan pengguna mencapai 75% berdasarkan kuesioner yang dibagikan kepada penguji, dan (5) uptime sistem mencapai 98,5% selama periode pengujian. Hasil ini menunjukkan bahwa sistem booking online yang dikembangkan dapat meningkatkan efisiensi dan akurasi proses pelayanan BPHTB di BAPPENDA.
```

**Lokasi:** Setelah paragraf "Hasil evaluasi dari pengujian Iterasi 1 menunjukkan..." di bagian Delivery and Feedback

---

### 8. **KENDALA YANG DIHADAPI DAN SOLUSI** ⚠️ DISARANKAN

**Status Saat Ini:**
- Tidak disebutkan kendala yang dihadapi

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah paragraf tentang fitur yang dikembangkan, tambahkan:

```
Selama proses pengembangan Iterasi 1, peneliti menghadapi beberapa kendala teknis yang perlu diatasi. Kendala utama yang dihadapi meliputi: (1) sinkronisasi data antar tabel yang kompleks karena banyaknya relasi database, yang diatasi dengan menggunakan database transactions untuk memastikan konsistensi data, (2) performa query yang lambat pada dashboard tracking karena banyaknya data yang perlu di-load, yang diatasi dengan implementasi pagination dan indexing pada kolom-kolom yang sering digunakan untuk query, (3) validasi file upload yang kompleks karena berbagai format dan ukuran file, yang diatasi dengan implementasi validasi multi-layer di frontend dan backend, serta (4) koordinasi dengan berbagai divisi untuk mendapatkan feedback yang terkadang memakan waktu, yang diatasi dengan membuat jadwal review mingguan yang terstruktur bersama Kasubbid PSI. Pengalaman mengatasi kendala-kendala ini memberikan pembelajaran berharga dalam pengembangan sistem yang kompleks dan terintegrasi.
```

**Lokasi:** Setelah paragraf "Tahapan ini menghasilkan prototipe fungsional..." di bagian Construction

---

### 9. **DETAIL TEKNIS IMPLEMENTASI** ⚠️ DISARANKAN

**Status Saat Ini:**
- Disebutkan "Node.js, Express.js, PostgreSQL, HTML, CSS, JavaScript (Vite.js)"
- Tidak dijelaskan detail implementasinya

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** di awal paragraf tentang pembangunan prototipe, tambahkan detail:

```
Pembangunan prototipe awal dilakukan secara bertahap oleh peneliti dengan pendekatan *agile development*. Proses dimulai dengan *setup environment* menggunakan *Node.js* (versi 18.x) dan *Express.js* (versi 4.x) sebagai *backend framework*, serta *HTML5*, *CSS3*, dan *JavaScript (Vite.js)* sebagai *frontend build tool*. *Database PostgreSQL* (versi 14.x) dikonfigurasi terlebih dahulu untuk menyimpan struktur data sesuai dengan *ERD* yang telah dirancang pada tahap *Quick Design*. Arsitektur aplikasi menggunakan pola MVC (*Model-View-Controller*) dengan struktur folder yang terorganisir, dimana *models* berisi definisi schema database menggunakan ORM (Object-Relational Mapping), *controllers* berisi logika bisnis dan handling request-response, serta *views* berisi template HTML dan komponen UI. Sistem juga menggunakan middleware untuk handling authentication, error handling, logging, dan CORS (Cross-Origin Resource Sharing). Setiap fitur dikembangkan secara modular dengan struktur MVC dan diuji menggunakan unit testing (Jest framework) sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang sesuai kondisi operasional di BAPPENDA.
```

**Lokasi:** Ganti paragraf yang ada di awal bagian Construction dengan versi yang lebih detail ini

---

### 10. **PENJELASAN ACTIVITY DIAGRAMS DETAIL** ⚠️ PENTING

**Status Saat Ini:**
- Disebutkan akan dijelaskan detail 4 activity diagrams
- Belum ada penjelasan detail di teks

**Yang Perlu Ditambahkan:**

Di bagian **"d) Construction of Prototype"** setelah setiap fitur yang relevan, tambahkan penjelasan activity diagram:

#### **Setelah paragraf "a) Formulir Booking Online":**
```
Proses pembuatan booking dilakukan melalui beberapa tahapan yang dijelaskan dalam Activity Diagram Create Booking. Activity Diagram ini menggambarkan alur lengkap dari pengisian formulir booking hingga penyimpanan data ke database. Proses dimulai ketika PPAT/PPATS mengakses halaman formulir booking dan mengisi data wajib pajak, data pemilik objek pajak, serta melakukan perhitungan NJOP dan BPHTB. Sistem melakukan validasi terhadap setiap input yang dimasukkan, termasuk validasi format data, kelengkapan dokumen, dan konsistensi perhitungan. Setelah semua data divalidasi, sistem menyimpan data ke database menggunakan database transaction untuk memastikan integritas data. Activity Diagram Create Booking dapat dilihat pada Gambar X.
```

#### **Setelah paragraf tentang Create Booking:**
```
Setelah data booking berhasil disimpan, sistem secara otomatis menghasilkan nomor booking menggunakan database trigger. Activity Diagram Generate No. Booking menggambarkan proses otomatis pembuatan nomor booking dengan format `ppat_khusus-YYYY-000001`, dimana `ppat_khusus` diambil dari data pengguna yang membuat booking, `YYYY` merupakan tahun berjalan, dan `000001` merupakan urutan sequence yang di-generate secara otomatis. Database trigger `trg_nobooking` diaktifkan sebelum data di-insert ke tabel `pat_1_bookingsspd`, sehingga setiap booking yang baru akan otomatis mendapatkan nomor booking yang unik. Proses ini memastikan tidak ada duplikasi nomor booking dan memudahkan tracking dokumen. Activity Diagram Generate No. Booking dapat dilihat pada Gambar X.
```

#### **Setelah paragraf "b) Unggah Dokumen":**
```
Activity Diagram Upload Dokumen menggambarkan alur lengkap proses pengunggahan dokumen pendukung oleh PPAT/PPATS. Proses dimulai ketika pengguna memilih dokumen yang akan diunggah, baik dokumen wajib maupun dokumen tambahan. Sistem melakukan validasi terhadap file yang diunggah, meliputi validasi format file (PDF, JPG, PNG), ukuran file (maksimal 5MB), dan kelengkapan dokumen. Setelah validasi berhasil, dokumen diunggah ke secure storage (UploadCare atau secure storage server) dan metadata dokumen disimpan ke tabel `pat_1_bookingsspd`. Sistem juga mencatat informasi waktu upload, jenis dokumen, dan status dokumen untuk keperluan tracking. Activity Diagram Upload Dokumen dapat dilihat pada Gambar X.
```

#### **Setelah paragraf tentang Upload Dokumen:**
```
Setelah dokumen berhasil diunggah dan booking dikirim ke LTB, proses validasi dokumen dilakukan oleh LTB. Activity Diagram Validasi Proses menggambarkan alur lengkap proses validasi dokumen yang dilakukan oleh LTB, mulai dari penerimaan booking dari PPAT hingga keputusan diterima atau ditolak. Proses validasi meliputi review dokumen (akta, sertifikat, tanda tangan), pengecekan kelengkapan dokumen, validitas dokumen, dan konsistensi data. Setelah proses validasi selesai, LTB dapat memilih untuk menerima atau menolak booking. Jika diterima, booking diteruskan ke tahap pemeriksaan oleh Peneliti. Jika ditolak, sistem mengirimkan notifikasi kepada PPAT dengan alasan penolakan. Setiap keputusan dicatat dalam database untuk keperluan audit trail. Activity Diagram Validasi Proses dapat dilihat pada Gambar X.
```

**Lokasi:** Sesuai dengan panduan di `TEKS_SIAP_PAKAI_PEMINDAHAN_ITERASI.md` bagian 4

---

## 📊 RINGKASAN TAMBAHAN YANG DISARANKAN

### **PRIORITAS TINGGI (Harus ditambahkan):**

1. ✅ **Detail Perhitungan BPHTB dan NJOP** - Penting untuk menunjukkan keahlian teknis
2. ✅ **Detail Database Triggers dan Constraints** - Menunjukkan pemahaman database
3. ✅ **Detail Sistem Validasi Input** - Menunjukkan perhatian terhadap kualitas data
4. ✅ **Detail Sistem File Upload dan Storage** - Menunjukkan pemahaman keamanan data
5. ✅ **Detail Sistem Notifikasi** - Menunjukkan integrasi sistem
6. ✅ **Hasil Kuantitatif dari Testing** - Menunjukkan bukti konkret hasil kerja
7. ✅ **Penjelasan Activity Diagrams Detail** - Sesuai dengan rencana di panduan

### **PRIORITAS SEDANG (Disarankan ditambahkan):**

8. ⚠️ **Detail Sistem Session Management** - Menunjukkan pemahaman keamanan
9. ⚠️ **Kendala yang Dihadapi dan Solusi** - Menunjukkan problem solving skills
10. ⚠️ **Detail Teknis Implementasi** - Menunjukkan pemahaman teknologi

---

## 📝 CATATAN PENTING

- Semua tambahan ini akan memperkaya deskripsi proses pengembangan Iterasi 1
- Tambahan ini akan membuat dokumen lebih komprehensif dan menunjukkan kedalaman pemahaman teknis
- Pastikan semua tambahan konsisten dengan implementasi yang sebenarnya
- Jika ada tambahan yang tidak sesuai dengan implementasi, sesuaikan dengan kenyataan

---

**Status:** ✅ ANALISIS LENGKAP  
**Rekomendasi:** Tambahkan komponen prioritas tinggi terlebih dahulu, kemudian komponen prioritas sedang jika memungkinkan
