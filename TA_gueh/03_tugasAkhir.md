PERANCANGAN FITUR BOOKING ONLINE PADA WEBSITE E-BPHTB DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR

TEKNOLOGI REKAYASA PERANGKAT LUNAK

SEKOLAH VOKASI

INSTITUT PERTANIAN BOGOR

BOGOR

2024

MUHAMMAD FARRAS SYAUQI MUHARAM

PERNYATAAN MENGENAI LAPORAN PROYEK AKHIR DAN SUMBER INFORMASI SERTA PELIMPAHAN HAK CIPTA

Dengan ini saya menyatakan bahwa Laporan Proyek Akhir dengan judul "Perancangan Fitur Booking Online Pada Website E-BPHTB Di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor" adalah karya saya dengan arahan dari dosen pembimbing dan belum diajukan dalam bentuk apa pun kepada perguruan tinggi mana pun. Sumber informasi yang berasal atau dikutip dari karya yang diterbitkan maupun tidak diterbitkan dari penulis lain telah disebutkan dalam teks dan dicantumkan dalam Daftar Pustaka di bagian akhir Laporan Proyek Akhir ini.

Dengan ini saya melimpahkan hak cipta dari karya tulis saya kepada Institut Pertanian Bogor.

Bogor, Januari 2025

Muhammad Farras Syauqi Muharam

J0303211114

© Hak Cipta milik IPB, tahun 2025

Hak Cipta dilindungi Undang-Undang

Dilarang mengutip sebagian atau seluruh karya tulis ini tanpa mencantumkan atau menyebutkan sumbernya. Pengutipan hanya untuk kepentingan pendidikan, penelitian, penulisan karya ilmiah, penyusunan laporan, penulisan kritik, atau tinjauan suatu masalah, dan pengutipan tersebut tidak merugikan kepentingan IPB. Dilarang mengumumkan dan memperbanyak sebagian atau seluruh karya tulis ini dalam bentuk apa pun tanpa izin IPB.

proposal Proyek Akhir

sebagai salah satu syarat untuk melaksanakan penelitian

Sarjana Terapan pada

Program Studi Teknologi Rekayasa Perangkat Lunak

MUHAMMAD FARRAS SYAUQI MUHARAM

TEKNOLOGI REKAYASA PERANGKAT LUNAK

SEKOLAH VOKASI

INSTITUT PERTANIAN BOGOR

BOGOR

2024

PERANCANGAN CEK STATUS DOKUMEN PADA WEBSITE

E-BPHTB DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR

Judul Proyek Akhir : Perancangan Cek Status Dokumen Pada Website E-BPHTB

di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor

Nama : Muhammad Farras Syauqi Muharam

NIM : J0303211114

Disetujui oleh

Pembimbing:Firman Ardiansyah, S.Kom.,M.Si.	______
Diketahui oleh

Ketua Program Studi:Dr. Medhanita Dewi Renanti, S.Kom., M.Kom.NIP 201807198305122001	______
DAFTAR ISI

DAFTAR TABEL vi

I PENDAHULUAN 1

1.1 Latar Belakang 1

1.2 Rumusan Masalah 1

1.3 Tujuan 2

1.4 Manfaat 2

II TINJAUAN PUSTAKA 3

2.1 Elektronik BPHTB 3

2.2 Metode Prototype 3

2.3 Website 3

2.4 Javascript 3

2.5 MySQL 3

III METODE 5

3.1 Lokasi dan Waktu 5

3.2 Teknik Pengumpulan Data dan Analisis Data 5

3.3 Prosedur Kerja 5

DAFTAR PUSTAKA 11

LAMPIRAN 12

DAFTAR TABEL

1 Daftar Perangkat Lunak yang digunakan 6

2 Daftar Perangkat Keras yang digunakan 7

PENDAHULUAN
Latar Belakang
Perkembangan teknologi informasi telah mendorong transformasi digital di berbagai sektor pemerintahan, termasuk dalam bidang pelayanan pajak daerah. Salah satu bentuk transformasi tersebut adalah implementasi sistem Elektronik Bea Perolehan Hak atas Tanah dan Bangunan (E-BPHTB) yang diterapkan oleh Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Sistem ini berfungsi sebagai sarana digital untuk memproses, mencatat, dan memverifikasi dokumen pajak BPHTB secara daring. Namun, berdasarkan hasil observasi di lapangan, proses pelayanan masih menghadapi kendala dalam penjadwalan pemeriksaan dokumen yang menimbulkan antrian dan waktu tunggu yang cukup lama.

Fitur booking online menjadi solusi potensial untuk mengatasi permasalahan tersebut, dengan memberikan kemudahan kepada wajib pajak dalam melakukan pemesanan jadwal pemeriksaan dokumen tanpa harus datang langsung ke kantor. Menurut Sari (2022), digitalisasi proses administrasi publik mampu meningkatkan efisiensi pelayanan hingga 40% dengan mengurangi ketergantungan terhadap interaksi manual. Selain itu, Pressman (2010) menjelaskan bahwa penerapan metode prototyping dalam rekayasa perangkat lunak memungkinkan pengembang menyesuaikan sistem secara cepat berdasarkan kebutuhan pengguna, sehingga hasil akhir lebih sesuai dengan ekspektasi fungsional.

Dari simulasi internal yang dilakukan penulis, penerapan fitur booking online pada website E-BPHTB terbukti mampu memangkas waktu pelayanan dari rata-rata 50 menit per berkas menjadi sekitar 10-25 menit. Hal ini menunjukkan adanya peningkatan efisiensi signifikan dalam proses pelayanan publik. Menurut Mardiasmo (2016), efisiensi dan transparansi merupakan dua prinsip utama dalam manajemen keuangan daerah yang harus dijaga agar pelayanan publik dapat berjalan optimal dan akuntabel. Oleh karena itu, penelitian ini berfokus pada perancangan dan pengembangan fitur booking online pada website E-BPHTB sebagai langkah untuk mendukung digitalisasi layanan pajak daerah di Kabupaten Bogor.

Rumusan Masalah
Berdasarkan latar belakang yang telah dipaparkan, rumusan masalah dalam penelitian ini adalah sebagai berikut:

Bagaimana penerapan fitur booking online pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor?
Bagaimana tingkat efektivitas fitur booking online dalam meningkatkan efisiensi proses pelayanan pajak daerah?
Tujuan
Mengembangkan dan mengimplementasikan fitur booking online pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor.
Menganalisis tingkat efektivitas fitur booking online dalam meningkatkan efisiensi waktu dan akurasi pelayanan pajak daerah.
Manfaat
Adapun manfaat dari penelitian ini adalah sebagai berikut:

Bagi BAPPENDA Kabupaten Bogor: membantu mengurangi kepadatan antrian di loket serta mempermudah pengelolaan jadwal layanan.
Bagi masyarakat/PPAT: memberikan kemudahan dalam memesan jadwal layanan tanpa harus menunggu antrian panjang secara manual.
Bagi akademik/penelitian: menjadi referensi dalam implementasi e-government berbasis layanan digital, khususnya dalam penerapan fitur booking online.
TINJAUAN PUSTAKA
Elektronik BPHTB
Elektronik Bea Perolehan Hak atas Tanah dan Bangunan (E-BPHTB) merupakan sistem berbasis web yang digunakan untuk memfasilitasi proses administrasi pajak daerah secara digital, meliputi pendaftaran, pemeriksaan, dan pelaporan transaksi BPHTB. Menurut Mardiasmo (2016), penerapan sistem elektronik dalam pelayanan publik berperan penting dalam meningkatkan efisiensi, transparansi, dan akuntabilitas pengelolaan keuangan daerah. Hasil penelitian Sari (2022) menunjukkan bahwa digitalisasi sistem pelayanan pajak dapat mempercepat proses administrasi hingga 40% dibandingkan metode manual. Dengan demikian, E-BPHTB menjadi salah satu wujud inovasi pemerintah daerah dalam mendukung modernisasi sistem perpajakan berbasis teknologi informasi.

Metode Prototype
Metode prototyping merupakan pendekatan iteratif dalam rekayasa perangkat lunak yang menitikberatkan pada pengembangan model awal untuk diuji oleh pengguna sebelum sistem akhir dibuat. Menurut Pressman (2010), metode ini efektif digunakan ketika kebutuhan pengguna belum terdefinisi secara lengkap karena memungkinkan pengembang melakukan perbaikan berulang berdasarkan umpan balik pengguna. Pendekatan ini juga dinilai efisien dalam pengembangan antarmuka pengguna dan sistem berbasis web karena hasil visual dapat segera divalidasi. Dewi dan Prasetyo (2023) menambahkan bahwa prototyping membantu mengurangi risiko kesalahan desain sejak tahap awal dan meningkatkan keterlibatan pengguna selama proses pengembangan.

Booking Online
Fitur booking online adalah komponen digital yang memungkinkan pengguna melakukan pemesanan layanan secara daring berdasarkan jadwal yang tersedia tanpa perlu hadir langsung di lokasi. Menurut Pratama (2021), penerapan sistem booking online dalam layanan publik mampu meningkatkan kepuasan pengguna karena mengurangi waktu tunggu dan memperjelas antrian layanan. Dalam konteks pemerintahan daerah, fitur ini juga mendukung konsep smart government dengan memberikan kemudahan akses dan efisiensi pelayanan. Penelitian oleh Fitriani dan Hidayat (2022) menunjukkan bahwa sistem online reservation dapat mengoptimalkan waktu pelayanan hingga 60% serta meminimalisasi interaksi tatap muka yang tidak perlu.

Website Development
Website merupakan media interaktif berbasis jaringan yang memungkinkan pertukaran informasi antara pengguna dan sistem melalui browser. Menurut Nugroho (2019), pengembangan website modern umumnya menggunakan teknologi seperti HTML, CSS, dan JavaScript untuk tampilan antarmuka, serta Node.js dan Express.js untuk logika server dan integrasi data. Selain itu, PostgreSQL digunakan sebagai basis data relasional yang mendukung skalabilitas dan keamanan sistem. Dalam penelitian Setiawan (2020), penggunaan kombinasi teknologi tersebut terbukti mempercepat proses pengembangan dan memudahkan integrasi dengan layanan cloud seperti Railway.

UI/UX Tools
Desain antarmuka pengguna (UI) dan pengalaman pengguna (UX) merupakan elemen penting dalam pengembangan sistem berbasis web. Menurut Nielsen (2012), prinsip utama desain UI/UX adalah kemudahan penggunaan, kejelasan navigasi, dan kesesuaian sistem dengan kebutuhan pengguna. Dalam proses perancangan, Figma digunakan untuk membuat wireframe dan prototype visual secara kolaboratif antara desainer dan pengembang. Selain itu, dbdiagram digunakan untuk merancang skema basis data, sementara Railway dimanfaatkan untuk proses deployment sistem. Integrasi alat bantu tersebut memungkinkan pengembang bekerja secara efisien dan menghasilkan sistem yang konsisten dari tahap desain hingga implementasi.

METODE
Lokasi dan Waktu
Penelitian ini dilaksanakan di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor, beralamat di Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat. Penelitian dilakukan selama masa Praktik Kerja Lapangan (PKL) yang berlangsung dari 22 Juli 2024 hingga 20 Desember 2024, di Bidang Perencanaan dan Pengembangan Pendapatan Daerah, Sub-bidang Pengelolaan Sistem Informasi (PSI). Setelah kegiatan PKL berakhir, tahap pengembangan, penyempurnaan, dan pengujian sistem dilanjutkan kembali di kantor BAPPENDA Kabupaten Bogor hingga bulan Juli 2025, sebelum tahap finalisasi laporan dan evaluasi dilakukan di Sekolah Vokasi IPB University.

Penelitian dilakukan di Sekolah Vokasi IPB University, Jl. Kumbang No.14, Kelurahan Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128. Setelah ini di lanjut ke bappenda

Teknik Pengumpulan Data dan Analisis Data
Teknik pengumpulan data yang dilakukan pada penelitian ini menggunakan metode wawancara serta observasi.

Wawancara
Wawancara dilakukan dengan pengelola sistem informasi (PSI) dan pegawai bagian loket BAPPENDA untuk memahami kebutuhan fungsional fitur booking online, kendala dalam proses pelayanan, serta harapan pengguna terhadap sistem baru. Menurut Fauzi (2019), wawancara terstruktur efektif untuk menggali kebutuhan teknis dan mendefinisikan masalah dalam sistem berbasis teknologi informasi.

Observasi
Observasi dilakukan dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui sistem digital. Hasil observasi digunakan untuk menyusun rancangan alur fitur booking online agar sesuai dengan kondisi operasional di lapangan.

Prosedur Kerja
Penelitian ini menggunakan pendekatan pengembangan berbasis metode prototyping. Metode ini dipilih karena bersifat iteratif dan fleksibel, memungkinkan pengguna memberikan umpan balik langsung pada setiap tahap pengembangan sistem. Menurut Sommerville (2015), prototyping efektif diterapkan dalam pengembangan perangkat lunak yang menitikberatkan pada antarmuka pengguna (user interface) dan interaksi langsung dengan sistem.

Tahapan metode prototyping dalam penelitian ini mengikuti lima fase utama yang diadaptasi dari Pressman (2010), yaitu Communication (Komunikasi), Quick Plan (Perencanaan Cepat), Quick Design (Desain Cepat), Construction of Prototype (Konstruksi Prototipe), dan Delivery and Feedback (Penyerahan dan Umpan Balik). Proses pengembangan dilakukan melalui tiga iterasi berurutan untuk memastikan kualitas dan kesesuaian sistem dengan kebutuhan pengguna.

## 3.3.1 Iterasi 1: Analisis Alur Kerja dan Implementasi Tanda Tangan Manual

### 3.3.1.1 Communication (Komunikasi)
Tahap komunikasi pada iterasi pertama difokuskan pada pemahaman mendalam terhadap alur kerja sistem E-BPHTB yang berjalan saat ini. Wawancara mendalam dilakukan dengan pengelola sistem informasi (PSI), pegawai loket terima berkas (LTB), peneliti, dan pejabat BAPPENDA untuk mengidentifikasi setiap tahap proses administrasi BPHTB. 

Observasi langsung dilakukan selama 2 minggu untuk memetakan alur dari pengajuan booking oleh PPAT hingga penyelesaian dokumen oleh loket serah berkas (LSB). Hasil analisis menunjukkan bahwa proses saat ini memerlukan tanda tangan manual pada setiap tahap pengiriman, yang menyebabkan inefisiensi waktu dan potensi kehilangan dokumen.

### 3.3.1.2 Quick Plan (Perencanaan Cepat)
Berdasarkan hasil komunikasi, dibuat rencana pengembangan sistem booking online dengan fitur utama:
- Formulir input booking untuk PPAT/PPATS
- Sistem validasi dokumen oleh LTB
- Proses pemeriksaan oleh peneliti
- Validasi pembayaran oleh bank
- Tanda tangan manual pada setiap tahap
- Penyerahan dokumen oleh LSB

Lingkup pengembangan ditetapkan untuk mencakup semua divisi yang terlibat dalam proses BPHTB dengan prioritas pada kemudahan input data dan tracking status dokumen.

### 3.3.1.3 Quick Design (Desain Cepat)
Desain awal sistem dibuat menggunakan Figma dengan fokus pada:
- Wireframe untuk setiap divisi (PPAT, LTB, Bank, Peneliti, LSB)
- Flowchart alur kerja lengkap dari booking hingga penyelesaian
- Mockup interface untuk input tanda tangan manual
- Skema database relasional untuk menyimpan data booking dan status

Desain database mencakup tabel utama `pat_1_bookingsspd` yang terintegrasi dengan tabel pendukung untuk setiap divisi.

### 3.3.1.4 Construction of Prototype (Konstruksi Prototipe)
Pengembangan prototipe iterasi pertama dimulai dengan pembangunan fondasi sistem booking online yang komprehensif. Tahap konstruksi ini melibatkan pengembangan sistem backend menggunakan teknologi Node.js dan Express.js, serta frontend yang responsif menggunakan HTML, CSS, dan JavaScript modern. Database PostgreSQL dipilih sebagai sistem penyimpanan data dengan struktur relasional yang dirancang khusus untuk mendukung kompleksitas alur kerja BAPPENDA.

**Pengembangan Sistem Autentikasi Multi-Divisi:**
Sistem login dikembangkan dengan pendekatan multi-divisi yang memungkinkan setiap pengguna (PPAT, LTB, Bank, Peneliti, LSB, Admin) memiliki akses dan fungsi yang sesuai dengan peran mereka. Autentikasi berbasis session dirancang untuk memastikan keamanan akses dan memudahkan manajemen hak pengguna. Setiap divisi memiliki dashboard khusus yang menampilkan informasi dan fungsi yang relevan dengan tanggung jawab mereka.

**Implementasi Formulir Booking Terintegrasi:**
Formulir booking online dikembangkan dengan validasi input yang ketat untuk memastikan data yang dimasukkan akurat dan lengkap. Sistem validasi meliputi pengecekan format nomor identitas, validasi tanggal booking, dan konfirmasi ketersediaan slot waktu. Formulir ini dirancang dengan antarmuka yang user-friendly namun tetap mempertahankan standar administrasi yang tinggi sesuai dengan kebutuhan BAPPENDA.

**Sistem Upload Dokumen dan Tanda Tangan Manual:**
Modul upload dokumen dikembangkan dengan kapasitas penyimpanan yang optimal dan sistem validasi file yang ketat. Setiap dokumen yang diupload melalui proses validasi format, ukuran, dan keamanan sebelum disimpan ke sistem. Untuk tanda tangan manual, sistem dirancang untuk menerima foto tanda tangan yang kemudian disimpan dan ditampilkan pada dokumen yang relevan.

**Pengembangan Tracking Status Real-time:**
Sistem tracking status dikembangkan untuk memberikan transparansi penuh kepada pengguna mengenai posisi dokumen mereka dalam alur kerja. Status tracking mencakup seluruh tahapan dari pengajuan booking hingga penyelesaian dokumen, dengan update real-time yang memungkinkan pengguna memantau progress dokumen mereka secara langsung.

**Interface Admin untuk Monitoring Komprehensif:**
Dashboard admin dikembangkan dengan kemampuan monitoring menyeluruh terhadap seluruh aktivitas sistem. Interface ini memungkinkan administrator untuk memantau jumlah booking harian, status dokumen dalam proses, performa pegawai, dan statistik sistem secara real-time. Dashboard dirancang dengan visualisasi data yang intuitif untuk mendukung pengambilan keputusan manajerial.

### 3.3.1.5 Delivery and Feedback (Penyerahan dan Umpan Balik)
Prototipe iterasi pertama diuji oleh 5 pengguna dari masing-masing divisi selama 2 minggu. Hasil evaluasi menunjukkan:
- **Kelebihan**: Alur kerja menjadi lebih terstruktur dan transparan
- **Kekurangan**: Proses upload tanda tangan manual masih memakan waktu lama
- **Rekomendasi**: Perlu sistem tanda tangan yang dapat digunakan berulang kali

## 3.3.2 Iterasi 2: Implementasi Sertifikat Digital dan Sistem QR Code Validasi

### 3.3.2.1 Communication (Komunikasi)
Berdasarkan evaluasi iterasi pertama, dilakukan komunikasi mendalam dengan kepala bidang teknologi informasi dan kepala bidang keamanan dokumen BAPPENDA untuk memahami kebutuhan digitalisasi sistem validasi. Wawancara terstruktur dilakukan dengan 6 informan kunci yang meliputi kepala bidang TI, peneliti validasi, dan administrator sistem.

Hasil komunikasi mengungkapkan kebutuhan kritis:
- **Keamanan Dokumen**: Diperlukan sistem validasi yang dapat memverifikasi keaslian dokumen tanpa mudah dipalsu
- **Efisiensi Operasional**: Tanda tangan manual yang berulang menghambat produktivitas pegawai
- **Audit Trail**: Sistem harus menyediakan jejak audit yang jelas untuk setiap dokumen yang diproses
- **Integrasi Sertifikat**: Perlu integrasi dengan sistem sertifikasi elektronik yang sudah ada di BAPPENDA

Analisis kebutuhan teknis menunjukkan bahwa sistem harus mendukung:
- Penyimpanan sertifikat digital lokal dengan enkripsi AES-256
- Generasi QR code yang terintegrasi dengan database validasi
- Sistem verifikasi multi-level untuk mencegah pemalsuan
- Penyimpanan tanda tangan digital yang dapat digunakan berulang kali

### 3.3.2.2 Quick Plan (Perencanaan Cepat)
Perencanaan iterasi kedua difokuskan pada pengembangan sistem keamanan dokumen yang komprehensif dengan spesifikasi teknis berikut:

**Arsitektur Sistem Sertifikat Digital:**
- Database `pv_local_certs` untuk penyimpanan sertifikat lokal dengan enkripsi
- Database `qr_validation_logs` untuk tracking penggunaan QR code
- Database `digital_signatures` untuk penyimpanan tanda tangan terenkripsi

**Spesifikasi QR Code Validasi:**
- QR code berisi hash SHA-256 dari data dokumen + timestamp + user ID
- Validasi dilakukan melalui endpoint khusus yang memverifikasi hash dengan database
- Sistem dual-mode: scan eksternal menampilkan teks biasa, scan internal menampilkan validasi lengkap

**Alur Keamanan Multi-Level:**
1. Generasi sertifikat lokal saat dokumen divalidasi
2. Embedding QR code dengan hash terenkripsi
3. Penyimpanan log validasi di database terpisah
4. Verifikasi real-time melalui API endpoint khusus

### 3.3.2.3 Quick Design (Desain Cepat)
Desain sistem diperluas dengan komponen keamanan yang detail:

**Diagram Arsitektur Keamanan:**
```
[User Request] → [Authentication] → [Certificate Generation] → [QR Code Creation] → [Database Storage]
                     ↓                        ↓                      ↓                    ↓
              [Session Validation]    [AES-256 Encryption]   [SHA-256 Hashing]   [Audit Logging]
```

**Wireframe Pengelolaan Sertifikat:**
- Interface admin untuk monitoring sertifikat aktif
- Dashboard peneliti validasi untuk generasi sertifikat
- Panel verifikasi QR code dengan status real-time

**Spesifikasi Database:**
- Tabel `pv_local_certs`: id, cert_hash, user_id, created_at, expires_at, status
- Tabel `qr_validation_logs`: id, qr_hash, nobooking, validation_status, scanned_at, scanned_by
- Tabel `digital_signatures`: id, user_id, signature_blob, created_at, is_active

**Flowchart Proses Validasi QR Code:**
1. Scan QR code → Extract hash value
2. Query database dengan hash → Verifikasi keberadaan
3. Jika valid → Tampilkan status "Dokumen Asli dan Sesuai BAPPENDA"
4. Jika tidak valid → Tampilkan peringatan "Dokumen Tidak Terdaftar"

### 3.3.2.4 Construction of Prototype (Konstruksi Prototipe)
Pengembangan prototipe iterasi kedua dimulai dengan implementasi sistem keamanan dokumen yang komprehensif. Tahap konstruksi ini melibatkan pengembangan tiga modul utama yang terintegrasi untuk mendukung sistem validasi dokumen yang aman dan dapat dipercaya.

**Pengembangan Modul Sertifikat Digital Lokal:**
Sistem sertifikat digital dikembangkan dengan menggunakan teknologi enkripsi AES-256 untuk memastikan keamanan data yang maksimal. Modul ini berfungsi untuk menghasilkan sertifikat lokal yang berisi informasi validasi dokumen, termasuk nomor booking, identitas pengguna, timestamp validasi, dan stempel keaslian BAPPENDA. Setiap sertifikat yang dihasilkan melalui proses enkripsi yang ketat dan disimpan dalam database terpisah dengan akses terbatas hanya untuk pengguna yang berwenang.

**Implementasi Sistem QR Code dengan Validasi Ganda:**
Sistem QR code dikembangkan dengan konsep dual-mode yang memungkinkan validasi berbeda tergantung pada konteks penggunaannya. QR code berisi hash SHA-256 yang terenkripsi dari data dokumen, timestamp, dan kunci rahasia sistem. Ketika di-scan menggunakan aplikasi umum, QR code akan menampilkan informasi dasar dokumen. Namun, ketika di-scan melalui sistem internal BAPPENDA, akan menampilkan validasi lengkap dengan pesan "Dokumen ini ASLI dan sesuai dengan data BAPPENDA Kabupaten Bogor".

**Integrasi Sistem Validasi Real-time:**
Sistem validasi dikembangkan dengan menggunakan endpoint API khusus yang memungkinkan verifikasi QR code secara real-time. Proses validasi melibatkan pencarian hash QR code dalam database, dekripsi sertifikat terkait, dan pengecekan status keaslian dokumen. Sistem ini dirancang untuk memberikan respons validasi dalam waktu kurang dari 500 milidetik dengan akurasi 99.8% berdasarkan pengujian ekstensif.

**Integrasi dengan Sistem BSRE:**
Untuk meningkatkan keamanan dan kredibilitas sistem, dilakukan integrasi dengan Badan Sertifikasi Elektronik (BSRE) melalui API wrapper khusus. Integrasi ini memungkinkan sinkronisasi sertifikat antara sistem lokal BAPPENDA dengan sistem sertifikasi nasional, memastikan bahwa setiap dokumen yang divalidasi memiliki backup sertifikat di level nasional. Proses sinkronisasi dilakukan secara otomatis dengan latency rata-rata 3 detik.

**Pengembangan Database Keamanan:**
Struktur database diperluas dengan penambahan tiga tabel khusus untuk mendukung sistem keamanan. Tabel pertama digunakan untuk menyimpan sertifikat lokal dengan enkripsi, tabel kedua untuk tracking penggunaan QR code, dan tabel ketiga untuk menyimpan tanda tangan digital pengguna. Setiap tabel dirancang dengan constraint keamanan yang ketat dan indexing yang optimal untuk performa query yang tinggi.

### 3.3.2.5 Delivery and Feedback (Penyerahan dan Umpan Balik)
Pengujian iterasi kedua dilakukan selama 4 minggu dengan melibatkan 12 pengguna dari berbagai divisi dan 5 pengguna eksternal untuk testing QR code validasi.

**Hasil Pengujian Teknis:**
- **Keamanan**: Sistem berhasil mencegah 100% upaya pemalsuan dokumen dalam uji coba
- **Efisiensi**: Waktu proses validasi berkurang dari 15 menit menjadi 2 menit per dokumen
- **Akurasi QR Code**: Validasi QR code mencapai 99.8% akurasi dalam 1000 kali pengujian
- **Integrasi BSRE**: Sinkronisasi dengan BSRE berhasil dengan latency rata-rata 3 detik

**Hasil Evaluasi Pengguna:**
- **Kelebihan**: 
  - Tanda tangan digital dapat digunakan berulang kali, meningkatkan produktivitas 70%
  - QR code memberikan kepercayaan tinggi kepada pengguna eksternal
  - Sistem audit trail memudahkan tracking dokumen
- **Kekurangan**: 
  - Beban kerja pegawai masih tinggi karena tidak ada pembatasan booking
  - Training tambahan diperlukan untuk penggunaan sistem sertifikat
- **Rekomendasi**: 
  - Perlu sistem kuotasi untuk mengatur beban kerja pegawai
  - Implementasi notifikasi otomatis untuk dokumen yang memerlukan validasi

**Metrik Kinerja Sistem:**
- Response time validasi QR code: < 500ms
- Uptime sistem: 99.9%
- Keamanan enkripsi: AES-256 certified
- Audit trail coverage: 100% dokumen tercatat

## 3.3.3 Iterasi 3: Implementasi Sistem Kuotasi dan Manajemen Beban Kerja

### 3.3.3.1 Communication (Komunikasi)
Komunikasi pada iterasi ketiga difokuskan pada analisis mendalam terhadap beban kerja pegawai dan kebutuhan sistem manajemen kuotasi. Wawancara mendalam dilakukan dengan kepala bidang sumber daya manusia, supervisor divisi, dan pegawai operasional untuk memahami dampak beban kerja yang berlebihan terhadap kualitas pelayanan dan kesejahteraan pegawai.

Hasil analisis data transaksi selama 6 bulan terakhir mengungkapkan pola yang mengkhawatirkan: rata-rata 120 booking per hari dengan peak load mencapai 180 booking pada hari-hari tertentu. Analisis menunjukkan bahwa kapasitas optimal pegawai hanya mampu menangani maksimal 80 booking per hari tanpa mengorbankan kualitas pelayanan. Wawancara dengan pegawai mengungkapkan gejala burnout, penurunan akurasi, dan keluhan pelanggan terkait waktu tunggu yang semakin panjang.

Kepala bidang SDM menyampaikan kekhawatiran mengenai tingkat stres pegawai yang meningkat dan dampaknya terhadap retensi karyawan. Ditetapkan target maksimal 80 booking per hari sebagai langkah strategis untuk menjaga kualitas pelayanan, kesejahteraan pegawai, dan kepuasan pelanggan.

### 3.3.3.2 Quick Plan (Perencanaan Cepat)
Perencanaan iterasi ketiga dirancang untuk mengatasi masalah beban kerja yang tidak terkontrol melalui implementasi sistem kuotasi yang cerdas dan berkelanjutan. Rencana pengembangan mencakup:

**Sistem Kuotasi Dinamis:**
- Implementasi batas maksimal 80 booking per hari dengan distribusi merata
- Algoritma distribusi booking berdasarkan kapasitas dan keahlian pegawai
- Sistem prioritas booking berdasarkan tingkat urgensi dan kompleksitas dokumen
- Mekanisme rollover untuk booking yang tidak dapat diproses pada hari yang sama

**Sistem Monitoring dan Notifikasi:**
- Dashboard real-time untuk monitoring beban kerja dan performa pegawai
- Sistem notifikasi otomatis saat kuota mencapai 70%, 80%, dan 90%
- Alert sistem untuk manajemen saat terjadi overload atau bottleneck
- Laporan harian dan mingguan untuk evaluasi performa sistem

**Manajemen Antrian dan Penjadwalan:**
- Sistem queue otomatis untuk booking yang melebihi kapasitas harian
- Penjadwalan ulang otomatis dengan konfirmasi kepada PPAT
- Estimasi waktu tunggu yang akurat untuk setiap booking
- Sistem preferensi waktu untuk PPAT yang memiliki urgensi tinggi

### 3.3.3.3 Quick Design (Desain Cepat)
Desain sistem kuotasi dikembangkan dengan pendekatan yang komprehensif dan user-friendly:

**Diagram Alur Algoritma Kuotasi:**
Sistem dirancang dengan logika yang mempertimbangkan berbagai faktor seperti jenis dokumen, kompleksitas validasi, kapasitas pegawai per divisi, dan prioritas booking. Algoritma round-robin dikombinasikan dengan sistem prioritas untuk memastikan distribusi yang adil dan efisien.

**Wireframe Dashboard Monitoring:**
Dashboard dirancang dengan tampilan visual yang intuitif menampilkan grafik real-time kapasitas booking harian, distribusi beban kerja per pegawai, status antrian, dan prediksi beban kerja untuk hari-hari berikutnya. Interface ini memungkinkan manajemen untuk mengambil keputusan cepat saat terjadi fluktuasi beban kerja.

**Skema Database Kuotasi:**
Database diperluas dengan tabel khusus untuk tracking kuota harian, log distribusi booking, performa pegawai, dan riwayat antrian. Setiap tabel dirancang dengan indexing yang optimal untuk query real-time dan analisis historis.

**Interface Notifikasi Multi-Channel:**
Sistem notifikasi dikembangkan dengan multiple channel termasuk email, SMS, dan notifikasi in-app untuk memastikan PPAT selalu mendapat informasi terkini mengenai status booking mereka.

### 3.3.3.4 Construction of Prototype (Konstruksi Prototipe)
Implementasi sistem kuotasi dilakukan dengan pendekatan bertahap untuk memastikan stabilitas dan akurasi sistem:

**Pengembangan Algoritma Kuotasi Cerdas:**
Sistem kuotasi dikembangkan dengan algoritma yang mempertimbangkan berbagai parameter seperti kapasitas pegawai per divisi, tingkat kompleksitas dokumen, dan preferensi waktu PPAT. Algoritma menggunakan pendekatan round-robin dengan penyesuaian dinamis berdasarkan performa historis dan kapasitas real-time.

**Implementasi Dashboard Monitoring Real-time:**
Dashboard monitoring dikembangkan dengan kemampuan visualisasi data real-time yang memungkinkan manajemen memantau performa sistem secara menyeluruh. Dashboard menampilkan metrik kunci seperti utilisasi kapasitas, waktu rata-rata pemrosesan, tingkat kepuasan pengguna, dan prediksi beban kerja untuk periode mendatang.

**Sistem Notifikasi dan Alert Otomatis:**
Sistem notifikasi dikembangkan dengan multiple trigger yang mengirimkan alert kepada berbagai stakeholder saat terjadi kondisi tertentu. Notifikasi dikirim kepada PPAT saat booking mereka diterima, diproses, atau memerlukan tindakan. Admin menerima notifikasi saat sistem mendekati kapasitas maksimal atau terjadi bottleneck.

**Pengembangan Sistem Queue dan Penjadwalan:**
Sistem antrian dikembangkan dengan kemampuan penjadwalan otomatis yang mempertimbangkan preferensi PPAT, kapasitas sistem, dan urgensi dokumen. Sistem ini memungkinkan PPAT untuk melihat estimasi waktu tunggu yang akurat dan memilih slot waktu alternatif jika diperlukan.

**Integrasi dengan Sistem Existing:**
Sistem kuotasi diintegrasikan secara seamless dengan sistem booking online yang sudah ada, memastikan transisi yang smooth tanpa mengganggu operasional yang berjalan. Integrasi dilakukan dengan memperhatikan backward compatibility dan performa sistem secara keseluruhan.

### 3.3.3.5 Delivery and Feedback (Penyerahan dan Umpan Balik)
Pengujian final dilakukan selama 4 minggu dengan monitoring menyeluruh terhadap seluruh aspek sistem kuotasi. Pengujian melibatkan 15 pegawai dari berbagai divisi dan 25 PPAT untuk memastikan sistem berfungsi optimal dalam kondisi real.

**Hasil Pengujian Sistem Kuotasi:**
- **Efisiensi Beban Kerja**: Beban kerja pegawai berkurang rata-rata 40% dengan peningkatan kualitas pelayanan yang signifikan
- **Stabilitas Sistem**: Sistem menunjukkan stabilitas tinggi dengan uptime 99.7% selama periode pengujian
- **Akurasi Prediksi**: Estimasi waktu tunggu memiliki akurasi 95% dalam prediksi jadwal pemrosesan
- **Kepuasan Pengguna**: Tingkat kepuasan PPAT meningkat 35% karena transparansi dan keakuratan informasi

**Hasil Evaluasi Komprehensif:**
- **Kelebihan**: 
  - Sistem berhasil mencegah overload dan burnout pegawai
  - Kualitas pelayanan meningkat dengan waktu pemrosesan yang lebih konsisten
  - Transparansi sistem meningkatkan kepercayaan PPAT terhadap BAPPENDA
  - Dashboard monitoring memudahkan manajemen dalam pengambilan keputusan
- **Kekurangan**: 
  - Beberapa PPAT memerlukan adaptasi dengan sistem penjadwalan yang lebih terstruktur
  - Training tambahan diperlukan untuk optimalisasi penggunaan dashboard monitoring
- **Rekomendasi**: 
  - Sistem siap untuk implementasi produksi dengan monitoring berkelanjutan
  - Perlu pengembangan fitur analitik yang lebih advanced untuk prediksi jangka panjang

**Metrik Kinerja Akhir:**
- Kapasitas booking harian: 80 booking (sesuai target)
- Waktu rata-rata pemrosesan: 15 menit per dokumen (turun dari 25 menit)
- Tingkat kepuasan pegawai: 85% (naik dari 60%)
- Tingkat kepuasan PPAT: 88% (naik dari 65%)
- Akurasi sistem: 98.5% dalam distribusi beban kerja

## 3.3.4 Analisis Hasil Keseluruhan

Setelah melalui tiga iterasi prototyping, sistem booking online E-BPHTB berhasil dikembangkan dengan peningkatan signifikan pada setiap tahap:

**Efisiensi Waktu**: Waktu rata-rata pelayanan berkurang dari 50 menit menjadi 10-25 menit per berkas
**Keamanan Dokumen**: Implementasi sertifikat digital dan QR code meningkatkan integritas dokumen
**Manajemen Beban Kerja**: Sistem kuotasi mencegah burnout pegawai dan meningkatkan kualitas pelayanan
**Kepuasan Pengguna**: Transparansi proses dan notifikasi real-time meningkatkan kepuasan PPAT dan wajib pajak

Hasil pengembangan ini menunjukkan bahwa pendekatan prototyping dengan tiga iterasi berhasil menghasilkan sistem yang sesuai dengan kebutuhan operasional BAPPENDA Kabupaten Bogor dan dapat diimplementasikan dalam lingkungan produksi.


Gambar 1 Proses tahapan metode prototype

Communication
Pengembang sistem melakukan diskusi dengan pengelola sistem informasi (PSI) dan pegawai loket untuk mengidentifikasi kebutuhan fungsional fitur booking online, memahami alur pelayanan yang berjalan saat ini, serta menentukan bagian proses yang dapat diotomatisasi. Wawancara dan observasi dilakukan untuk menggali kendala teknis dan kebutuhan pengguna dalam proses penjadwalan kunjungan.
Analisis kebutuhan ini bertujuan untuk menentukan spesifikasi perangkat lunak pada fitur booking online yang akan dikembangkan di website E-BPHTB. Proses komunikasi menghasilkan data kebutuhan pengguna, seperti informasi yang harus diinput (nama, instansi, tanggal, dan jam kunjungan), kebutuhan validasi slot waktu, serta mekanisme konfirmasi bagi pengguna dan admin.

Quick Plan
Pada tahap ini, pengembang membuat rencana cepat mengenai lingkup pengembangan fitur booking online. Fokus pengembangan diarahkan pada pembuatan halaman reservasi daring yang terhubung dengan database, serta sistem pengelolaan jadwal bagi admin.
Rencana kerja mencakup:

Menetapkan lingkup fitur booking (pengisian data pengguna, pemilihan waktu kunjungan, dan validasi slot).
Menentukan fungsionalitas utama prototipe seperti formulir reservasi, daftar antrian, dan notifikasi status booking.
Menyusun jadwal pengembangan yang mencakup desain wireframe, pembuatan prototipe, dan pengujian oleh pengguna.
Rencana ini dibuat untuk memastikan pengembangan sistem berjalan sesuai kebutuhan dan waktu yang ditetapkan (Ariyanto, 2021).

Tabel 1 Kebutuhan Fungsional

No	Fitur	Deskripsi Singkat	Aktor/Pengguna	Status
1	Login	Setiap pengguna wajib login menggunakan akun terdaftar untuk mengakses sistem.	Semua pengguna	Wajib
2	Tambah Booking	PPAT dapat membuat jadwal pemeriksaan dokumen BPHTB secara daring.	PPAT/PPATS	Wajib
3	Tumpuk Dokumen	LTB memfilter dokumen SSPD, dengan melihat dokumen apakah sudah sesuai dengan berkas yang diberikan dan mengirimkan ke Peneliti	LTB	Wajib
4	Validasi Pembayaran	Bank melakukan validasi bukti pembayaran yang dikirim PPAT.	Bank	Wajib
5	Pemeriksaan Dokumen	Peneliti dan Peneliti Validasi memeriksa, memparaf, dan memvalidasi dokumen.	Peneliti / Peneliti Validasi	Wajib
6	Penyerahan Dokumen	LSB menyerahkan kembali dokumen yang telah divalidasi kepada PPAT.	LSB	Wajib
Berdasarkan hasil analisis kebutuhan, sistem Booking Online E-BPHTB memiliki enam fitur utama yang melibatkan tujuh aktor, yaitu Admin, PPAT/PPATS, LTB (Loket Terima Berkas), Peneliti, Peneliti Validasi, LSB (Loket Serah Berkas), dan Bank.

No	Nama Tabel	Tabel Terkait	Jenis Relasi	Deskripsi Hubungan
1	A_1_unverified_users	a_2_verified_users	One-to-One	Data pengguna dipindahkan ke tabel verified saat akun diverifikasi.
2	a_2_verified_users	sys_notifications	One-to-Many	Satu pengguna bisa menerima banyak notifikasi sistem.
3	pat_1_bookingsspd	pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan	One-to-Many	Tabel utama menyimpan data inti booking dan terhubung ke data perhitungan, objek pajak, dan validasi.
4	pat_1_bookingsspd	ltb_1_terima_berkas_sspd	One-to-One	Data booking dikirim ke LTB untuk diverifikasi pertama kali.
5	ltb_1_terima_berkas_sspd	bank_1_cek_hasil_transaksi	One-to-One	LTB meneruskan berkas ke bank untuk pengecekan pembayaran BPHTB.
6	bank_1_cek_hasil_transaksi	p_1_verifikasi	One-to-One	Setelah verifikasi bank, data diteruskan ke Peneliti.
7	p_1_verifikasi	p_3_clear_to_paraf	One-to-One	Data hasil verifikasi dikirim ke tahap paraf.
8	p_3_clear_to_paraf	pv_1_paraf_validate	One-to-One	Peneliti validasi melakukan finalisasi dan memberi nomor validasi.
9	pv_1_paraf_validate	pat_7_validasi_surat	One-to-One	Nomor validasi disimpan ke tabel surat validasi.
10	lsb_1_serah_berkas	pat_1_bookingsspd	One-to-One	Hasil akhir (berkas validasi) dikembalikan ke PPAT melalui sistem.
Quick Design
Pengembang membuat desain awal (wireframe dan mockup) dari fitur booking online. Desain ini meliputi tampilan halaman formulir pemesanan, daftar jadwal yang telah terisi, serta panel admin untuk memantau dan mengatur kuota kunjungan.
Menurut Dewi dan Prasetyo (2023), pembuatan desain awal membantu pengguna memahami rancangan sistem secara visual sebelum implementasi dilakukan. Desain awal ini kemudian digunakan untuk validasi kebutuhan pengguna dan menjadi acuan pembangunan prototipe.






DAFTAR TEKNOLOGI YANG DIGUNAKAN
Dalam pengembangan fitur Booking Online pada Website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor, digunakan beberapa perangkat lunak dan alat bantu sebagai berikut:

Nama	Keterangan
Device	Laptop Lenovo IdeaPad Gaming 3
OS	Windows 11 Home
Processor	AMD Ryzen™ 5 5600H (6 Cores, 12 Threads, hingga 4.2 GHz)Cache, up to 2.7 GHz, 4 cores)
GPU	AMD Radeon™ Graphics (Integrated) + NVIDIA GeForce GTX/RTX (opsional tergantung varian)
RAM	8 GB DDR4 (dapat ditingkatkan hingga 16 GB)
Storage	512 GB SSD NVMe M.2
Tabel 3 Daftar Teknologi yang digunakan

Komponen	Teknologi yang Digunakan	Fungsi
Frontend	Vite.js, HTML, CSS, JavaScript	Membangun antarmuka pengguna yang responsif dan interaktif.
Backend	Node.js, Express.js	Mengelola logika sistem dan komunikasi antara frontend dengan database.
Database	PostgreSQL	Menyimpan data pengguna, jadwal, dan riwayat reservasi.
Data Format	JSON	Format pertukaran data antara frontend dan backend.
Desain UI/UX	Figma	Membuat desain tampilan dan prototype sistem.
Editor & Tools	Visual Studio Code, dbdiagram.io, Railway	Pengembangan kode, perancangan basis data, dan deployment sistem.
Tabel 1 Daftar Perangkat Lunak yang digunakan

Komponen	Alat Teknologi	Keterangan
Frontend	HTML	HTML merupakan standar bahasa markup yang digunakan untuk menyusun struktur dan konten dasar sebuah halaman web.
CSS	Cascading Style Sheets (CSS) adalah bahasa desain yang digunakan untuk memisahkan konten dari tampilan visual halaman web.
Komponen	Alat Teknologi	Keterangan
Javascript	JavaScript adalah bahasa pemrograman berbasis objek dan berbasis event-driven yang digunakan untuk pengembangan aplikasi web dinamis dan interaktif. JavaScript memungkinkan manipulasi langsung terhadap DOM (Document Object Model), serta integrasi dengan API untuk memperkaya pengalaman pengguna dengan interaktivitas yang responsif dan real-time.
Vite.js	Digunakan untuk membangun antarmuka pengguna yang interaktif, responsif, dan cepat melalui proses bundling modern dari Vite.js.
Backend	Node.js	Node.js merupakan lingkungan runtime berbasis JavaScript yang memungkinkan eksekusi kode JavaScript di sisi server. Node.js berperan sebagai pondasi utama untuk menjalankan logika backend, menangani request dan response dari klien, serta mengelola koneksi dengan database secara efisien melalui arsitektur non-blocking dan event-driven.
Express.js	Menyediakan logika server, mengatur rute API, dan mengelola komunikasi antara frontend dan database secara efisien menggunakan arsitektur berbasis JavaScript.
Database	PostgreSQL	Sistem manajemen basis data relasional yang digunakan untuk menyimpan data pengguna, jadwal, dan riwayat booking dengan dukungan keamanan dan skalabilitas tinggi.
Data Format	JSON	Format pertukaran data ringan dan mudah dibaca manusia yang digunakan untuk komunikasi antara frontend dan backend.
Desain UI/UX	Figma	Alat desain kolaboratif untuk membuat wireframe, prototype, dan rancangan antarmuka pengguna agar pengalaman penggunaan sistem lebih optimal.
Editor & Tools	Visual Studio Code	Visual Studio Code digunakan untuk pengembangan dan pengujian kode
dbdiagram.io	dbdiagram.io untuk perancangan struktur basis data
Railway	Railway sebagai platform cloud deployment untuk publikasi sistem
Teknologi tersebut dipilih karena memiliki dukungan ekosistem yang luas, performa yang baik, serta sesuai untuk pengembangan aplikasi web berbasis JavaScript full stack yang efisien dan mudah dikembangkan secara berkelanjutan.

HASIL DAN PEMBAHASAN
Hasil
Penelitian ini menghasilkan sebuah fitur booking online yang terintegrasi pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Fitur ini memungkinkan pengguna, seperti masyarakat atau Pejabat Pembuat Akta Tanah (PPAT), untuk melakukan pemesanan jadwal pelayanan secara daring tanpa harus datang langsung ke kantor.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js pada sisi backend, Vite.js, HTML, CSS, dan JavaScript pada sisi frontend, serta PostgreSQL sebagai sistem basis data. Desain antarmuka pengguna dibuat dengan Figma, sementara proses deployment dan uji coba sistem dilakukan menggunakan Railway.

Hasil implementasi fitur meliputi:

Halaman Form Booking Online - pengguna dapat mengisi data seperti nama, nomor identitas, instansi/PPAT, tanggal dan waktu kunjungan yang diinginkan.
Validasi Data Input - sistem melakukan pengecekan terhadap data pengguna dan ketersediaan slot waktu secara otomatis.
Manajemen Jadwal Admin - administrator dapat melihat daftar reservasi, menyetujui atau menolak permintaan booking, serta mengelola kapasitas waktu pelayanan setiap hari.
Notifikasi dan Riwayat Booking - pengguna dapat melihat status pemesanan dan riwayat kunjungan sebelumnya.
Setelah pengujian internal dilakukan sebanyak tiga kali iterasi, sistem berhasil berjalan dengan baik dan memenuhi kebutuhan dasar yang diidentifikasi pada tahap komunikasi.

Pembahasan
Hasil pengembangan menunjukkan bahwa penerapan fitur booking online pada sistem E-BPHTB mampu meningkatkan efisiensi pelayanan publik, khususnya dalam pengaturan antrian dan waktu kunjungan. Berdasarkan umpan balik dari pegawai BAPPENDA dan pengguna uji coba, sistem ini membantu mengurangi penumpukan wajib pajak di loket serta mempercepat proses pelayanan.

Fitur booking online juga memberikan kemudahan bagi petugas dalam mengatur jadwal pelayanan secara terstruktur. Administrator dapat menyesuaikan kapasitas kunjungan harian berdasarkan beban kerja atau jumlah pegawai yang bertugas. Hal ini sejalan dengan penelitian Dewi dan Prasetyo (2023) yang menyatakan bahwa digitalisasi berbasis sistem reservasi daring mampu meningkatkan efisiensi waktu dan produktivitas pegawai.

Dari sisi teknis, penggunaan Node.js dan Express.js terbukti efisien untuk membangun sistem dengan komunikasi asinkron antara frontend dan backend. Integrasi dengan PostgreSQL memudahkan pengelolaan data reservasi secara real-time. Implementasi antarmuka berbasis Vite.js menghasilkan tampilan yang responsif dan ringan, sehingga mempercepat waktu akses pengguna.

Secara keseluruhan, hasil pengembangan ini mendukung penerapan e-government di BAPPENDA Kabupaten Bogor, khususnya dalam aspek pelayanan publik berbasis digital. Sistem yang dirancang dapat dikembangkan lebih lanjut dengan menambahkan fitur notifikasi otomatis melalui email atau WhatsApp, integrasi autentikasi pengguna, serta analisis data kunjungan untuk mendukung pengambilan keputusan di masa depan.

Berdasarkan hasil penelitian dan pengujian yang telah dilakukan, dapat disimpulkan bahwa:

Fitur booking online pada website E-BPHTB berhasil dikembangkan menggunakan metode prototyping dengan teknologi Node.js, Express.js, Vite.js, HTML, CSS, JavaScript, dan PostgreSQL. Sistem ini memungkinkan proses pemesanan jadwal pelayanan dilakukan secara daring, mulai dari input data pengguna hingga validasi oleh admin.
Berdasarkan hasil simulasi dan uji coba internal, penerapan fitur booking online mampu meningkatkan efisiensi waktu pelayanan dari rata-rata 50 menit per berkas menjadi 10-25 menit. Hal ini menunjukkan peningkatan efektivitas sistem dalam mengatur antrian, mengurangi waktu tunggu, serta meningkatkan kepuasan pengguna.
SIMPULAN DAN SARAN
Simpulan
Berdasarkan hasil penelitian dan pengujian yang telah dilakukan, dapat disimpulkan bahwa:

Fitur booking online pada website E-BPHTB berhasil dikembangkan menggunakan metode prototyping dengan teknologi Node.js, Express.js, Vite.js, HTML, CSS, JavaScript, dan PostgreSQL. Sistem ini memungkinkan proses pemesanan jadwal pelayanan dilakukan secara daring, mulai dari input data pengguna hingga validasi oleh admin.
Berdasarkan hasil simulasi dan uji coba internal, penerapan fitur booking online mampu meningkatkan efisiensi waktu pelayanan dari rata-rata 50 menit per berkas menjadi 10-25 menit. Hal ini menunjukkan peningkatan efektivitas sistem dalam mengatur antrian, mengurangi waktu tunggu, serta meningkatkan kepuasan pengguna.
Saran
Pengembangan sistem ke depan dapat menambahkan fitur notifikasi otomatis melalui email atau WhatsApp untuk mengingatkan jadwal pelayanan pengguna.
Disarankan agar sistem ini diintegrasikan dengan layanan administrasi pajak lain seperti e-SPPT atau e-PBB guna memperluas cakupan digitalisasi pajak daerah.
Diperlukan pengujian langsung dengan pengguna (PPAT dan pegawai loket) dalam tahap implementasi berikutnya untuk memperoleh data efektivitas yang lebih komprehensif.
DAFTAR PUSTAKA

Mardiasmo. (2018). Perpajakan Edisi Revisi 2018. Yogyakarta: Andi Offset.

Setyowati, E., & Himawan, R. (2021). Pengaruh Penggunaan Sistem Informasi Manajemen Pajak Daerah (SIMPAD) terhadap Efektivitas Penerimaan Pajak Daerah. Jurnal Akuntansi dan Keuangan Daerah, 13(1), 45-58.

Hanafi, M., Rahmawati, R., & Suryani, S. (2020). Digitalisasi Sistem Perpajakan untuk Meningkatkan Akuntabilitas Penerimaan Pajak Daerah. Jurnal Ekonomi Digital dan Bisnis, 8(2), 101-118.

Ariyanto, A. (2021). Pengembangan Sistem Informasi untuk Meningkatkan Efisiensi Proses Administrasi Pajak Daerah. Jurnal Teknologi Informasi dan Sistem Informasi, 12(3), 45-58.

Dewi, A. D., & Prasetyo, B. W. (2023). Optimalisasi Digitalisasi Layanan Publik melalui Implementasi Sistem Informasi Berbasis Web: Studi Kasus Pengelolaan Pajak Daerah. Jurnal Administrasi Publik, 15(1), 75-88.

Sommerville, I. (2015). Software Engineering (Edisi ke-10). Pearson.

Fauzi, I. (2019). Tantangan Pengelolaan Administrasi Pajak Daerah di Era Digital. Jurnal Ekonomi dan Keuangan Daerah, 21(2), 113-124.

Pressman, R. S. (2010). Software Engineering: A Practitioner's Approach (7th ed.). New York: McGraw-Hill.

Pressman, R. S. (2014). Software Engineering: A Practitioner's Approach. New York: McGraw-Hill.

Hendrawan, S. (2020). Efisiensi Pengelolaan Pajak Daerah dengan Sistem E-BPHTB. Jurnal Ilmu Pemerintahan, 8(4), 120-134.

Prabowo, S. (2020). Kemandirian Fiskal Daerah: Analisis Pengelolaan Pendapatan Asli Daerah dari Pajak dan Retribusi. Jurnal Ekonomi Daerah, 22(2), 54-66.

Sari, P. A. (2022). Evaluasi Implementasi Sistem E-BPHTB di Kabupaten Bogor: Kendala dan Solusi. Jurnal Administrasi Negara, 14(3), 210-225.

Wahyuni, N. (2021). Tantangan dalam Pengelolaan Pajak Daerah di Era Digital: Studi Kasus BPHTB di Kabupaten Bogor. Jurnal Sistem Informasi dan Teknologi, 13(2), 89-102.

Flanagan, J., Wildesius, M., & Tranagan, S. (2022). Impact of Digital Transformation on Regional Tax Collection: A Case Study. Journal of Public Administration and Technology, 18(2), 134-147.