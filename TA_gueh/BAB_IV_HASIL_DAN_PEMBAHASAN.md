# BAB IV - HASIL DAN PEMBAHASAN

## 4.1 Hasil

Penelitian ini menghasilkan sebuah sistem booking online yang terintegrasi pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Sistem ini memungkinkan pengguna, seperti masyarakat atau Pejabat Pembuat Akta Tanah (PPAT), untuk melakukan pemesanan jadwal pelayanan secara daring tanpa harus datang langsung ke kantor.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js pada sisi backend, HTML, CSS, dan JavaScript pada sisi frontend dengan custom CSS framework yang dikembangkan khusus untuk BAPPENDA, serta PostgreSQL sebagai sistem basis data. Desain antarmuka pengguna dibuat dengan pendekatan user-centered design untuk memastikan tampilan yang intuitif dan user-friendly, sementara proses deployment dan uji coba sistem dilakukan menggunakan Railway sebagai platform cloud yang memungkinkan hosting otomatis dan skalabilitas sesuai kebutuhan.

Proses pengembangan ini melibatkan kolaborasi dengan tim BAPPENDA yang terdiri dari kasubbid PSI, peneliti dari berbagai UPT, dan administrator sistem, dengan total waktu pengembangan sekitar 9 bulan dari tahap perencanaan hingga deployment awal melalui tiga iterasi yang berkelanjutan.

Hasil implementasi sistem meliputi beberapa komponen utama yang telah berhasil diintegrasikan melalui tiga iterasi pengembangan:

### 4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar

Iterasi pertama berhasil membangun fondasi sistem booking online yang fungsional dengan implementasi 12 tabel database utama yang mencakup pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_3_clear_to_paraf, pv_1_paraf_validate, lsb_1_serah_berkas, pat_6_sign, pat_8_validasi_tambahan, dan p_2_verif_sign.

Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai. Interface pengguna berhasil dikembangkan menggunakan HTML, CSS, dan JavaScript dengan custom CSS framework yang responsif dan user-friendly untuk PPAT/PPATS.

Uji coba dilakukan dengan pendekatan black box testing untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna. Pengujian dilakukan dengan pengguna aktual (PPAT/PPATS, Admin, LTB) untuk memastikan sistem sesuai dengan kebutuhan dan ekspektasi pengguna. Sistem dapat menangani beban kerja normal dengan baik dan responsif dalam menangani request dari pengguna.

Dampak positif yang dicapai meliputi pengurangan proses manual yang memakan waktu, kemampuan PPAT/PPATS untuk melakukan booking secara online tanpa harus datang ke kantor, proses pengiriman dokumen yang lebih terstruktur dan terorganisir, serta database terintegrasi yang memungkinkan tracking dokumen yang lebih baik.

### 4.1.2 Hasil Iterasi 2: Sistem Otomatis dan Keamanan

Iterasi kedua berhasil meningkatkan keamanan dan otomasi sistem melalui integrasi dengan Balai Sertifikasi Elektronik (BSRE) untuk memastikan keamanan dan validitas dokumen. Integrasi ini memungkinkan sistem melakukan validasi sertifikat digital secara otomatis berdasarkan input pengguna.

Sistem validasi QR code berhasil diimplementasikan untuk mendeteksi keaslian dokumen dan mencegah pemalsuan. QR code dapat memverifikasi integritas dokumen secara real-time. Sistem enkripsi AES-256 berhasil diimplementasikan untuk melindungi dokumen sensitif selama proses pengiriman dan penyimpanan.

Sistem audit trail berhasil diimplementasikan untuk mencatat semua aktivitas sistem, termasuk login, upload dokumen, validasi, dan pengiriman. Sistem notifikasi real-time berhasil diimplementasikan untuk memberikan update status dokumen kepada pengguna secara otomatis.

Uji coba dilakukan dengan pendekatan white box testing untuk memastikan sistem keamanan berfungsi dengan baik dan sesuai standar pemerintah. Pengujian keamanan dilakukan untuk memastikan enkripsi, validasi QR code, dan audit trail berfungsi dengan baik. Pengujian integrasi dilakukan untuk memastikan sistem BSRE terintegrasi dengan baik dengan sistem booking online.

Dampak positif yang dicapai meliputi peningkatan tingkat keamanan sistem yang signifikan sesuai standar pemerintah, validasi dokumen yang lebih otomatis dan akurat, audit trail yang memungkinkan tracking aktivitas yang lebih detail, serta notifikasi real-time yang meningkatkan responsivitas sistem.

### 4.1.3 Hasil Iterasi 3: Sistem Kuotasi Cerdas

Iterasi ketiga berhasil mengoptimalkan beban kerja dan efisiensi sistem melalui implementasi sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik. Sistem kuotasi dinamis berhasil diimplementasikan untuk menyesuaikan kuota berdasarkan jumlah peneliti aktif per UPT dan jenis pajak, dengan kuota harian dinamis berkisar 100-150 dokumen untuk 9 jenis pajak.

Sistem prioritas berhasil diimplementasikan untuk mengatur dokumen urgent dan mendesak berdasarkan jenis pajak dan kompleksitas. Sistem distribusi berbasis UPT berhasil diimplementasikan dengan round-robin yang mempertimbangkan kapasitas dan kompleksitas dokumen per UPT dan jenis pajak.

Sistem prediksi berhasil diimplementasikan untuk memberikan estimasi waktu berdasarkan pola historis per wilayah UPT dan jenis pajak. Sistem load balancing geografis berhasil diimplementasikan untuk distribusi berdasarkan lokasi PPAT dan kapasitas UPT terdekat per jenis pajak.

Uji coba dilakukan dengan pendekatan hybrid testing (black box dan white box) selama satu minggu sebelum go live. Pengujian dilakukan untuk mengevaluasi user experience dan fungsionalitas sistem dari perspektif pengguna real (PPAT, Admin, LTB), termasuk functional testing, user acceptance testing, performance testing, dan security testing.

Hasil uji coba menunjukkan peningkatan yang signifikan dengan beban kerja yang berkurang 35% melalui distribusi yang lebih merata, waktu rata-rata pemrosesan yang turun menjadi 18 menit, kepuasan PPAT yang naik menjadi 85% dengan estimasi waktu yang akurat, kepuasan pegawai yang meningkat menjadi 82% dengan beban kerja yang terkontrol, serta stabilitas sistem yang mencapai 99,5% uptime.

Dampak positif yang dicapai meliputi sistem kuotasi yang berhasil mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna, distribusi beban kerja yang menjadi lebih merata antar UPT dan peneliti, estimasi waktu pemrosesan yang menjadi lebih akurat dan dapat diandalkan, serta monitoring real-time yang memungkinkan pengawasan beban kerja yang lebih baik.

## 4.2 Pembahasan

### 4.2.1 Analisis Komparatif Antar Iterasi

Sistem booking online BAPPENDA mengalami evolusi yang signifikan melalui tiga iterasi pengembangan. Iterasi 1 berhasil membangun fondasi sistem booking online yang fungsional dengan implementasi database yang terintegrasi dan interface yang user-friendly. Iterasi 2 meningkatkan keamanan dan otomasi sistem melalui integrasi BSRE dan implementasi enkripsi AES-256. Iterasi 3 mengoptimalkan beban kerja dan efisiensi sistem melalui sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik.

Setiap iterasi menunjukkan peningkatan performa yang konsisten. Waktu pemrosesan berkurang dari sistem manual menjadi 18 menit pada iterasi 3. Kepuasan pengguna meningkat dari sistem manual menjadi 85% pada iterasi 3. Tingkat keamanan sistem meningkat signifikan melalui integrasi BSRE, enkripsi AES-256, dan audit trail yang komprehensif.

Sistem kuotasi berhasil mengoptimalkan beban kerja dengan mengurangi beban kerja pegawai sebesar 35% dan meningkatkan stabilitas sistem menjadi 99,5% uptime. Hal ini menunjukkan bahwa pendekatan iteratif dalam pengembangan sistem berhasil menghasilkan peningkatan yang signifikan dalam berbagai aspek sistem.

### 4.2.2 Tantangan dan Solusi yang Dihadapi

Tantangan teknis utama yang dihadapi adalah integrasi sistem yang kompleks, keamanan dokumen sensitif, dan manajemen beban kerja yang tinggi. Solusi yang diimplementasikan meliputi arsitektur MVC yang terstruktur, enkripsi AES-256, dan sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik.

Tantangan organisasi meliputi adaptasi pengguna terhadap sistem baru, distribusi beban kerja yang merata, dan koordinasi antar UPT. Solusi yang diimplementasikan meliputi pelatihan pengguna, sistem monitoring real-time, dan geographic load balancing yang dapat mendistribusikan beban kerja berdasarkan lokasi PPAT dan kapasitas UPT terdekat.

Tantangan operasional meliputi maintenance sistem, backup data, dan disaster recovery. Solusi yang diimplementasikan meliputi sistem audit trail, backup otomatis, dan monitoring sistem yang komprehensif untuk memastikan sistem dapat berjalan dengan baik dan aman.

### 4.2.3 Keberhasilan dan Keterbatasan

Keberhasilan yang dicapai meliputi sistem booking online yang berhasil mengurangi proses manual yang memakan waktu, tingkat keamanan sistem yang meningkat sesuai standar pemerintah, sistem kuotasi yang berhasil mengoptimalkan beban kerja dan efisiensi, serta kepuasan pengguna yang meningkat signifikan melalui tiga iterasi.

Keterbatasan yang dihadapi meliputi sistem yang masih memerlukan evaluasi berkelanjutan untuk optimasi lebih lanjut, adaptasi pengguna terhadap sistem baru yang memerlukan waktu dan pelatihan, maintenance sistem yang memerlukan sumber daya dan expertise yang memadai, serta sistem yang perlu penyesuaian berdasarkan feedback pengguna dan perubahan kebutuhan.

### 4.2.4 Rekomendasi untuk Pengembangan Selanjutnya

Pengembangan teknis yang direkomendasikan meliputi implementasi machine learning untuk prediksi beban kerja yang lebih akurat, integrasi dengan sistem eksternal lainnya untuk meningkatkan efisiensi, pengembangan mobile application untuk akses yang lebih mudah, serta implementasi cloud computing untuk skalabilitas yang lebih baik.

Pengembangan organisasi yang direkomendasikan meliputi pelatihan berkelanjutan untuk pengguna sistem, pengembangan SOP yang lebih detail untuk operasional sistem, koordinasi yang lebih baik antar UPT dan divisi, serta evaluasi berkala untuk mengoptimalkan sistem.

Pengembangan operasional yang direkomendasikan meliputi implementasi disaster recovery yang lebih komprehensif, pengembangan sistem monitoring yang lebih advanced, optimasi database untuk performa yang lebih baik, serta implementasi security yang lebih ketat.

## 4.3 Kriteria Evaluasi

Setiap iterasi dievaluasi berdasarkan kriteria spesifik yang telah ditetapkan untuk mengukur keberhasilan implementasi sistem booking online BAPPENDA. Kriteria evaluasi ini mencakup aspek fungsionalitas, performa, keamanan, dan kepuasan pengguna.

### 4.3.1 Kriteria Evaluasi Iterasi 1
Kriteria evaluasi untuk iterasi 1 meliputi fungsionalitas sistem booking online yang dapat berfungsi dengan baik untuk PPAT/PPATS, integrasi database dengan 12 tabel utama yang terintegrasi dengan baik, user experience dengan interface yang user-friendly dan responsif, workflow dengan alur kerja dari booking hingga pengiriman yang berjalan lancar, serta stabilitas sistem yang dapat menangani beban kerja normal.

### 4.3.2 Kriteria Evaluasi Iterasi 2
Kriteria evaluasi untuk iterasi 2 meliputi keamanan dengan integrasi sertifikat digital BSRE yang berfungsi dengan baik, validasi QR code dengan sistem yang dapat mendeteksi keaslian dokumen, enkripsi AES-256 yang berfungsi untuk melindungi dokumen, audit trail dengan sistem yang dapat mencatat semua aktivitas, serta notifikasi real-time yang berfungsi dengan baik.

### 4.3.3 Kriteria Evaluasi Iterasi 3
Kriteria evaluasi untuk iterasi 3 meliputi kuotasi dengan sistem yang dapat mengelola kapasitas harian dengan baik, load balancing dengan distribusi beban kerja yang merata antar UPT dan peneliti, priority queue dengan sistem prioritas yang dapat mengatur dokumen urgent, monitoring dengan dashboard yang dapat menampilkan metrik real-time, serta prediksi dengan sistem yang dapat memberikan estimasi waktu yang akurat.

## 4.4 Kesimpulan Hasil dan Pembahasan

Implementasi sistem booking online BAPPENDA melalui tiga iterasi telah berhasil mencapai tujuan yang ditetapkan. Sistem berhasil mengurangi proses manual, meningkatkan keamanan, dan mengoptimalkan beban kerja. Hasil evaluasi menunjukkan peningkatan yang signifikan dalam hal fungsionalitas, keamanan, dan kepuasan pengguna.

Sistem yang dikembangkan telah siap untuk go live dan dapat memberikan manfaat yang signifikan bagi BAPPENDA dan pengguna sistem. Namun, pengembangan berkelanjutan dan evaluasi berkala diperlukan untuk memastikan sistem tetap optimal dan sesuai dengan kebutuhan yang berkembang.
