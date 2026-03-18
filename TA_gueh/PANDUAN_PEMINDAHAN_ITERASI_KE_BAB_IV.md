# 📋 PANDUAN PEMINDAHAN BAHASAN ITERASI DARI BAB METODE KE BAB HASIL DAN PEMBAHASAN

## 🎯 TUJUAN
Memindahkan bahasan detail iterasi dari **BAB III: METODE** ke **BAB IV: HASIL DAN PEMBAHASAN**, karena bahasan iterasi merupakan hasil dan pembahasan dari penelitian, bukan bagian dari metodologi.

---

## 📍 STRUKTUR YANG PERLU DIPINDAHKAN

### **Dari BAB III: METODE**
Bagian yang perlu dipindahkan:
- **1.5 Iterasi 1: Pembuatan Fitur Booking hingga Pengiriman** (dengan sub-sub: Communication, Quick Plan, Quick Design, Construction, Delivery and Feedback)
- **1.6 Iterasi 2: Optimasi dan Efisiensi Sistem** (dengan sub-sub: Communication, Quick Plan, Quick Design, Construction, Delivery and Feedback)
- **1.7 Iterasi 3: Implementasi Sistem Kuotasi** (dengan sub-sub: Communication, Quick Plan, Quick Design, Construction, Delivery and Feedback)

### **Yang Tetap di BAB III: METODE**
Hanya penjelasan **materi tentang iterasi** secara konseptual:
- Penjelasan bahwa penelitian menggunakan metode prototyping dengan 3 iterasi
- Penjelasan bahwa setiap iterasi mengikuti tahapan: Communication → Quick Plan → Quick Design → Construction → Delivery & Feedback
- Penjelasan bahwa iterasi dilakukan untuk mendapatkan feedback dan perbaikan sistem secara bertahap

---

## 📝 STRUKTUR BARU BAB III: METODE

### **Bagian yang Harus Tetap (Tidak Berubah):**
1. 1.1 Lokasi dan Waktu Penelitian
2. 1.2 Daftar Teknologi yang Digunakan
3. 1.3 Teknik Pengumpulan Data dan Analisis Data
4. 1.4 Prosedur Kerja (dengan penjelasan metode prototyping)

### **Bagian yang Perlu Diubah:**

#### **1.4 Prosedur Kerja (Disederhanakan)**
Setelah penjelasan metode prototyping, tambahkan paragraf singkat tentang iterasi:

```
Penelitian ini menggunakan pendekatan pengembangan berbasis metode prototyping. Metode prototyping merupakan pendekatan pengembangan perangkat lunak yang menekankan pembuatan model awal sistem untuk memperoleh umpan balik langsung dari pengguna. Siswidiyanto et al. (2021) menjelaskan bahwa prototyping membantu pengembang memahami kebutuhan secara lebih akurat melalui proses iteratif, di mana rancangan diuji, dievaluasi, dan disempurnakan secara berkala.

Tahapan metode prototyping dalam penelitian ini adalah sebagai berikut:

1. Communication – Pengumpulan kebutuhan melalui diskusi dengan stakeholder dan observasi lapangan.
2. Quick Plan – Perencanaan cepat untuk menetapkan lingkup, prioritas fungsionalitas, dan jadwal pengembangan.
3. Quick Design – Pembuatan desain awal (wireframe) dan diagram UML menggunakan Figma dan Draw.io.
4. Prototype Construction – Pembangunan prototipe fungsional menggunakan Node.js, Express.js, dan PostgreSQL.
5. Delivery and Feedback – Pengujian prototipe dan perbaikan berdasarkan umpan balik dari pengguna.

Pengembangan sistem dilakukan melalui tiga iterasi yang berkelanjutan, dimana setiap iterasi mengikuti tahapan prototyping di atas. Iterasi pertama (November 2024 – Januari 2025) difokuskan pada pembuatan fitur booking online dasar dengan tracking status. Iterasi kedua (Maret – Agustus 2025) difokuskan pada optimasi dan efisiensi sistem melalui implementasi tanda tangan digital reusable, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi. Iterasi ketiga (Agustus – September 2025) difokuskan pada implementasi sistem kuotasi dinamis untuk mengelola kapasitas booking harian. Setiap iterasi menghasilkan feedback yang digunakan untuk perbaikan pada iterasi berikutnya, sehingga sistem yang dihasilkan sesuai dengan kebutuhan operasional di BAPPENDA Kabupaten Bogor.

[Gambar 1: Proses Tahapan Metode Prototype - tetap di sini]
```

**Hapus:**
- Semua detail iterasi 1, 2, dan 3 (1.5, 1.6, 1.7)
- Semua sub-sub Communication, Quick Plan, Quick Design, Construction, Delivery and Feedback dari setiap iterasi
- Semua tabel hasil wawancara, diagram activity, use case, swimlane dari bagian iterasi

**Tetap:**
- Gambar 1: Proses Tahapan Metode Prototype
- Penjelasan konseptual tentang tahapan prototyping

---

## 📝 STRUKTUR BARU BAB IV: HASIL DAN PEMBAHASAN

### **Struktur yang Sudah Ada (Tetap):**
- 4.1 Hasil
  - 4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar
  - 4.1.2 Hasil Iterasi 2: Sistem Otomatis dan Keamanan
  - 4.1.3 Hasil Iterasi 3: Sistem Kuotasi Cerdas
- 4.2 Pembahasan

### **Yang Perlu Ditambahkan di BAB IV:**

#### **4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar**

**Tambahkan sebelum "Tabel 1 Struktur Database Iterasi 1":**

```
**4.1.1.1 Proses Pengembangan Iterasi 1**

Iterasi pertama dilakukan dari November 2024 hingga Januari 2025 dengan fokus pada pembuatan fitur booking online dasar dengan tracking status real-time. Proses pengembangan mengikuti tahapan metode prototyping sebagai berikut:

**a) Communication (Komunikasi)**

Tahap komunikasi dilakukan melalui wawancara semi-terstruktur dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) pada November 2024 untuk memahami alur kerja sistem yang berjalan dan mengidentifikasi kebutuhan fungsional fitur booking online. Observasi dilakukan secara non-partisipatif selama masa magang dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak.

Dari hasil wawancara dan observasi, teridentifikasi bahwa sistem BPHTB saat ini hanya berupa website yang dapat diakses secara publik, namun alur bisnis internal seperti proses booking jadwal pemeriksaan, penandatanganan dokumen, dan koordinasi antar divisi masih dilakukan secara manual menggunakan berkas fisik. Proses penanganan dokumen memerlukan tanda tangan manual di atas kertas dan pengiriman fisik antar divisi. Dalam kondisi normal, proses dapat diselesaikan dalam 30-40 menit per berkas, namun pada kondisi kompleks atau saat terjadi penumpukan, proses dapat memakan waktu hingga 2 jam karena harus menunggu antrean di setiap divisi dengan tingkat kesalahan sekitar 10%.

Hasil wawancara dengan Kasubbid PSI dapat dilihat pada Tabel X berikut ini.

[Tabel X: Hasil Wawancara - pindahkan dari BAB III]

**b) Quick Plan (Perencanaan Cepat)**

Berdasarkan hasil wawancara dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem booking online tahap awal dengan fokus pada pembuatan fitur booking online dasar dengan tracking status. Proses perencanaan dilakukan melalui diskusi teknis berulang dengan Kasubbid PSI sebagai mentor dan validator dalam merancang alur sistem.

Output perencanaan yang dihasilkan meliputi:
- Fokus Iterasi Pertama: sistem booking online dasar dengan tracking status real-time
- Activity Diagram Iterasi 1: untuk memvisualisasikan alur kerja yang akan dikerjakan
- Struktur Database: dirancang struktur database yang mencakup 13 tabel utama
- Alur Kerja Sistem: mengikuti tahapan yang terstruktur sesuai dengan Activity Diagram

[Gambar X: Activity Diagram Iterasi 1 - pindahkan dari BAB III]

**c) Quick Design (Desain Cepat)**

Pada tahap pemodelan desain cepat, aktivitas berfokus merepresentasikan tampilan dan struktur aplikasi secara visual, seperti perancangan sketsa antarmuka aplikasi, pembuatan wireframe dan mock-up, serta pembuatan Activity Diagram, Use Case Diagram, dan Entity Relationship Diagram secara lebih detail.

Output desain yang dihasilkan meliputi:
- Wireframe: desain awal sistem dibuat menggunakan Figma dengan rancangan wireframe untuk tiap divisi
- Swimlane Diagram: diagram ini dirancang untuk mengilustrasikan pembagian tanggung jawab dan alur kerja antar divisi
- Use Case Diagram: dibuat untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia
- Activity Diagram Kompleks: dibuat untuk menggambarkan detail interaksi pengguna dengan sistem secara menyeluruh
- Struktur Database Relasional: dirancang menggunakan draw.io

[Gambar X: Wireframe, Swimlane Diagram, Use Case Diagram, Activity Diagram Kompleks - pindahkan dari BAB III]

**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan. Implementasi dimulai dengan pembuatan models untuk merepresentasikan struktur dan relasi basis data, dilanjutkan dengan controller yang mengatur logika bisnis dan pengolahan data, serta view sebagai antarmuka pengguna.

Pembangunan prototipe awal dilakukan secara bertahap oleh peneliti dengan pendekatan agile development. Proses dimulai dengan setup environment menggunakan Node.js dan Express.js sebagai backend, serta HTML, CSS, dan JavaScript (Vite.js) sebagai frontend. Database PostgreSQL dikonfigurasi terlebih dahulu untuk menyimpan struktur data sesuai dengan ERD yang telah dirancang pada tahap Quick Design.

Fitur yang dikembangkan pada iterasi pertama adalah sebagai berikut:
- Formulir Booking Online: dirancang untuk memungkinkan PPAT/PPATS melakukan pemesanan jadwal pemeriksaan secara daring
- Unggah Dokumen: sistem unggah dokumen memungkinkan pengguna untuk mengunggah dokumen pendukung
- Dashboard Admin dan Tracking Real-time: dirancang untuk memberikan overview status semua dokumen yang sedang diproses
- Sistem Login Multi-divisi: dirancang dengan berbasis hak akses (role-based access control)

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap Deployment, Delivery & Feedback dilakukan black box testing untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna. Dalam penelitian ini, uji coba dilakukan selama dua minggu dengan koordinasi dari Kasubbid PSI yang memfasilitasi akses ke sistem staging bagi berbagai divisi di BAPPENDA.

Mekanisme pengujian yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur sesuai dengan skenario kasus nyata sesuai dengan alur kerja BPHTB di BAPPENDA. Pengujian dilakukan secara bertahap, dimana pada minggu pertama fokus pada pengujian fitur booking online dan tracking status, sedangkan pada minggu kedua dilakukan pengujian integrasi antar modul dan pengujian di kondisi beban normal.

Hasil evaluasi dari pengujian Iterasi 1 menunjukkan bahwa sistem booking online yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, antara lain: (1) waktu unggah tanda tangan yang masih relatif lama, (2) belum tersedianya sertifikat digital maupun QR code untuk validasi keaslian dokumen, dan (3) proses pengiriman antar divisi masih memerlukan beberapa langkah manual.
```

**Lanjutkan dengan struktur yang sudah ada:**
- Tabel 1 Struktur Database Iterasi 1
- Tabel 2 Hasil Pengujian Iterasi 1
- Tabel 3 Perbandingan Metrik Sistem
- dll.

---

#### **4.1.2 Hasil Iterasi 2: Sistem Otomatis dan Keamanan**

**Tambahkan sebelum "Tabel 4 Struktur Database Tambahan Iterasi 2":**

```
**4.1.2.1 Proses Pengembangan Iterasi 2**

Iterasi kedua dilakukan dari Maret hingga Agustus 2025 setelah memperoleh feedback dari pengujian Iterasi 1, dimana berdasarkan action plan yang telah disepakati, fokus pengembangan dialihkan pada peningkatan keamanan dokumen dan efisiensi proses melalui implementasi tanda tangan digital reusable, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi.

**a) Communication (Komunikasi)**

Tahap komunikasi kedua dilakukan untuk menggali kebutuhan pengembangan fitur keamanan dan efisiensi dokumen berdasarkan hasil evaluasi Iterasi 1. Diskusi dilakukan dengan Kasubbid PSI yang berkoordinasi dengan Kepala Bidang TI dan Keamanan Dokumen untuk merancang sistem validasi berbasis sertifikat digital.

Hasil komunikasi menunjukkan bahwa iterasi kedua perlu fokus pada peningkatan keamanan dokumen dan efisiensi proses untuk mengatasi kekurangan yang ditemukan pada Iterasi 1. Sistem keamanan yang direncanakan akan mengintegrasikan teknologi sertifikat digital dan QR code yang akan dikembangkan khusus untuk sistem ini.

**b) Quick Plan (Perencanaan Cepat)**

Selama tahap perencanaan cepat, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem keamanan dan efisiensi untuk Iterasi 2.

Output perencanaan yang dihasilkan meliputi:
- Modifikasi Database: tahap perencanaan mencakup penambahan 9 tabel Database baru untuk mendukung fitur keamanan
- Arsitektur Keamanan 4 Lapisan: Certificate Generation, QR Code Embedding, Encrypted Storage, Audit Logging
- Integrasi Sistem: sistem juga dirancang untuk terintegrasi dengan divisi Bank untuk verifikasi pembayaran

**c) Quick Design (Desain Cepat)**

Pada tahap pemodelan desain cepat untuk Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru yang telah direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti dengan melakukan presentasi wireframe dan mockup kepada Kasubbid PSI untuk mendapatkan feedback dan validasi terhadap fitur keamanan yang kompleks.

Output desain yang dihasilkan meliputi:
- Komponen Keamanan: panel pengelolaan sertifikat digital dan modul verifikasi QR code
- Diagram Alur Validasi: dirancang menggunakan Draw.io
- Antarmuka Pengguna: dashboard pemantauan status dokumen dan notifikasi otomatis
- Activity Diagram: menggambarkan alur kerja sistem secara komprehensif dengan penambahan fitur keamanan
- Swimlane Diagram: menggambarkan alur kerja sistem yang telah dikembangkan menjadi lebih terintegrasi
- Use Case Diagram: menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi

[Gambar X: Activity Diagram, Swimlane Diagram, Use Case Diagram Iterasi 2 - pindahkan dari BAB III]

**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan untuk fitur keamanan dan efisiensi. Implementasi dimulai dengan pengembangan modul keamanan yang meliputi pembuatan sertifikat digital, integrasi QR code, dan implementasi enkripsi AES-256.

Fitur yang dikembangkan pada iterasi kedua adalah sebagai berikut:
- Otomasi Tanda Tangan Digital: sistem dirancang agar pengguna cukup mengunggah tanda tangan sekali (reusable signature)
- Sertifikat Digital Lokal: sistem menghasilkan sertifikat digital secara lokal untuk setiap dokumen yang divalidasi
- Validasi QR Code Ganda: sistem dirancang untuk menghasilkan dan memvalidasi QR code ganda untuk publik dan internal
- Sistem Notifikasi Real-time: dirancang untuk mempercepat komunikasi dan koordinasi dalam setiap tahapan proses
- Integrasi Divisi Bank: sistem terintegrasi dengan divisi Bank agar verifikasi pembayaran dapat dilakukan secara paralel

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap Deployment, Delivery & Feedback untuk Iterasi 2, dilakukan black box testing untuk memastikan fitur keamanan dan efisiensi yang telah dikembangkan siap rilis dan berfungsi dengan baik. Dalam penelitian ini, pengujian dilakukan selama empat minggu dengan 5 pegawai dari bidang PSI dan 5 pengguna eksternal (PPAT).

Hasil evaluasi dari pengujian Iterasi 2 menunjukkan bahwa sistem booking online dengan fitur keamanan digital yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil menunjukkan bahwa validasi QR code mencapai akurasi 99,8%, waktu validasi menurun dari 15 menit menjadi 2 menit per dokumen, dan efisiensi meningkat 70% dibandingkan dengan sistem manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, yaitu masih diperlukan penambahan sistem kuotasi untuk mencegah penumpukan booking.
```

**Lanjutkan dengan struktur yang sudah ada:**
- Tabel 4 Struktur Database Tambahan Iterasi 2
- Tabel 5 Hasil Pengujian Iterasi 2
- Tabel 6 Perbandingan Metrik Sistem
- dll.

---

#### **4.1.3 Hasil Iterasi 3: Sistem Kuotasi Cerdas**

**Tambahkan sebelum "Tabel 7 Struktur Database Tambahan Iterasi 3":**

```
**4.1.3.1 Proses Pengembangan Iterasi 3**

Iterasi ketiga dilakukan dari Agustus hingga September 2025 setelah memperoleh feedback dari pengujian Iterasi 2, dimana berdasarkan action plan yang telah disepakati, fokus pengembangan dialihkan pada pengembangan sistem kuotasi dinamis untuk mengelola kapasitas booking harian yang mengalami peningkatan signifikan setelah implementasi sistem yang lebih efisien.

**a) Communication (Komunikasi)**

Tahap komunikasi ketiga dilakukan untuk menggali kebutuhan pengembangan sistem kuotasi berdasarkan hasil evaluasi Iterasi 2 yang menunjukkan peningkatan jumlah booking yang signifikan. Diskusi dilakukan dengan Kasubbid PSI untuk menganalisis beban kerja pegawai dan merancang sistem kuotasi yang realistis dan adil.

Diskusi dengan Kasubbid PSI menunjukkan tingginya beban kerja pegawai mencapai rata-rata 100-200 booking per hari untuk BPHTB, sementara kapasitas optimal hanya 80-100 booking karena keterbatasan jumlah peneliti. Hasil komunikasi menunjukkan bahwa diperlukan sistem kuotasi yang realistis dan adil untuk mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna.

**b) Quick Plan (Perencanaan Cepat)**

Selama tahap perencanaan cepat untuk Iterasi 3, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem kuotasi untuk mengelola kapasitas booking harian.

Output perencanaan yang dihasilkan meliputi:
- Modifikasi Database: dirancang dua tabel baru (daily_counter dan ppatk_send_queue) untuk mengelola kapasitas harian dan antrean booking
- Algoritma Kuotasi Dinamis: sistem kuotasi menggunakan algoritma dynamic quota dengan fitur-fitur seperti kuota harian dinamis, priority queue, load balancing, predictive scheduling, notifikasi multi-level, dan distribusi UPT
- Activity Diagram: untuk memvisualisasikan alur kerja sistem kuotasi

[Gambar X: Activity Diagram Iterasi 3 - pindahkan dari BAB III]

**c) Quick Design (Desain Cepat)**

Sementara itu, pada tahap pemodelan desain cepat untuk Iterasi 3, aktivitas berfokus pada perancangan dashboard monitoring dan implementasi algoritma kuotasi berdasarkan kebutuhan yang telah direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti dengan melakukan presentasi wireframe dashboard dan algoritma kuotasi kepada Kasubbid PSI untuk mendapatkan feedback dan validasi.

Output desain yang dihasilkan meliputi:
- Dashboard Monitoring Real-time: desain antarmuka berupa dashboard monitoring real-time yang menampilkan beban kerja pegawai, grafik kapasitas harian, dan sistem notifikasi multi-channel
- Algoritma Kuotasi: algoritma kuotasi dirancang agar mampu menyesuaikan jumlah booking dengan kapasitas pegawai dan urgensi dokumen
- Swimlane Diagram: untuk menggambarkan alur kerja sistem kuotasi yang melibatkan berbagai aktor
- Use Case Diagram: untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia pada sistem kuotasi

[Gambar X: Swimlane Diagram, Use Case Diagram Iterasi 3 - pindahkan dari BAB III]

**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan untuk fitur sistem kuotasi. Implementasi dimulai dengan pengembangan algoritma kuotasi yang meliputi pembuatan sistem counter harian dan antrean booking.

Fitur yang dikembangkan pada iterasi ketiga adalah sebagai berikut:
- Sistem Counter Harian: dirancang untuk menghitung jumlah booking yang telah diproses dalam satu hari kerja
- Antrean Booking: sistem antrean booking dirancang untuk mengelola booking yang melebihi kuota harian 80 dokumen
- Dashboard Monitoring: dirancang untuk menampilkan metrik kinerja seperti waktu rata-rata pemrosesan, kapasitas per divisi, dan status kuota harian
- Sistem Notifikasi: dirancang untuk mengirimkan peringatan otomatis kepada admin dan PPAT ketika kuota harian hampir terpenuhi

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap Deployment, Delivery & Feedback untuk Iterasi 3, dilakukan hybrid testing (black box dan white box) untuk memastikan sistem kuotasi yang telah dikembangkan siap rilis dan berfungsi dengan baik sebelum go live. Dalam penelitian ini, pengujian dilakukan dengan melibatkan 5 pegawai dari bidang PSI dan 5 pengguna eksternal (PPAT).

Hasil evaluasi dari pengujian Iterasi 3 menunjukkan bahwa sistem kuotasi yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Sistem telah terintegrasi dengan baik dengan sistem booking eksisting dan siap untuk evaluasi performa dan user acceptance testing. Berdasarkan hasil evaluasi tersebut, keputusan untuk go live adalah sistem dinyatakan siap untuk go live setelah seluruh testing dan feedback terakomodasi dengan baik.
```

**Lanjutkan dengan struktur yang sudah ada:**
- Tabel 7 Struktur Database Tambahan Iterasi 3
- Tabel 8 Hasil Pengujian Iterasi 3
- Tabel 9 Perbandingan Metrik Sistem
- dll.

---

## ✅ LANGKAH-LANGKAH IMPLEMENTASI

1. **Buka file Word TA** (`Draft_Final_Tugas Akhir_Muhammad Farras_terbaru_281225.docx`)

2. **Untuk BAB III: METODE:**
   - Buka bagian 1.4 Prosedur Kerja
   - **Hapus** semua bagian 1.5, 1.6, 1.7 (semua detail iterasi)
   - **Ganti** dengan penjelasan singkat tentang iterasi (gunakan teks yang sudah disediakan di atas)
   - **Tetap** Gambar 1: Proses Tahapan Metode Prototype

3. **Untuk BAB IV: HASIL DAN PEMBAHASAN:**
   - Buka bagian 4.1.1 Hasil Iterasi 1
   - **Tambahkan** bagian 4.1.1.1 Proses Pengembangan Iterasi 1 (dengan sub-sub a, b, c, d, e)
   - **Pindahkan** semua konten detail dari BAB III bagian 1.5 ke sini
   - **Pindahkan** semua tabel, gambar, diagram dari BAB III ke sini
   - **Ulangi** untuk 4.1.2 dan 4.1.3

4. **Update Referensi:**
   - Pastikan semua referensi tetap ada
   - Update nomor gambar dan tabel yang berubah
   - Pastikan konsistensi penomoran

5. **Update Daftar Isi:**
   - Pastikan struktur baru tercermin di daftar isi

---

## 📌 CATATAN PENTING

- **BAB III: METODE** sekarang hanya berisi **penjelasan konseptual** tentang metode prototyping dan iterasi
- **BAB IV: HASIL DAN PEMBAHASAN** berisi **detail implementasi** setiap iterasi dengan semua tahapan, diagram, dan hasil
- Penempatan ini **selaras** dengan:
  - Penempatan GET, POST, PUT, DELETE (yang juga di BAB IV)
  - Penempatan 4 poin Activity Diagram yang akan dimasukkan ke BAB IV
  - Prinsip bahwa hasil dan pembahasan adalah tempat untuk menjelaskan apa yang telah dilakukan, bukan metodologi

---

## 🎯 HASIL AKHIR

Setelah pemindahan:
- **BAB III** menjadi lebih ringkas dan fokus pada metodologi
- **BAB IV** menjadi lebih lengkap dengan detail implementasi setiap iterasi
- Struktur lebih logis: metodologi di BAB III, hasil dan pembahasan di BAB IV

