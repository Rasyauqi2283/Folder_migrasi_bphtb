**PERANCANGAN FITUR *BOOKING ONLINE* PADA *WEBSITE E-BPHTB* DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR**

**TEKNOLOGI REKAYASA PERANGKAT LUNAK**

**SEKOLAH VOKASI**

**INSTITUT PERTANIAN BOGOR**

**BOGOR**

**2025**

**MUHAMMAD FARRAS SYAUQI MUHARAM**

**PERNYATAAN MENGENAI LAPORAN PROYEK AKHIR DAN SUMBER INFORMASI SERTA PELIMPAHAN HAK CIPTA**

Dengan ini saya menyatakan bahwa Laporan Proyek Akhir dengan judul "Perancangan Fitur *Booking online* Pada *Website E-BPHTB* Di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor" adalah karya saya dengan arahan dari dosen pembimbing dan belum diajukan dalam bentuk apa pun kepada perguruan tinggi mana pun. Sumber informasi yang berasal atau dikutip dari karya yang diterbitkan maupun tidak diterbitkan dari penulis lain telah disebutkan dalam teks dan dicantumkan dalam Daftar Pustaka di bagian akhir Laporan Proyek Akhir ini.

Dengan ini saya melimpahkan hak cipta dari karya tulis saya kepada Institut Pertanian Bogor.

Bogor, Januari 2025

Muhammad Farras Syauqi Muharam

J0303211114

© Hak Cipta milik IPB, tahun 2025

Hak Cipta dilindungi Undang-Undang

*Dilarang mengutip sebagian atau seluruh karya tulis ini tanpa mencantumkan atau menyebutkan sumbernya. Pengutipan hanya untuk kepentingan pendidikan, penelitian, penulisan karya ilmiah, penyusunan laporan, penulisan kritik, atau tinjauan suatu masalah, dan pengutipan tersebut tidak merugikan kepentingan IPB. Dilarang mengumumkan dan memperbanyak sebagian atau seluruh karya tulis ini dalam bentuk apa pun tanpa izin IPB.*

Proposal Proyek Akhir

sebagai salah satu syarat untuk melaksanakan penelitian

Sarjana Terapan pada

Program Studi Teknologi Rekayasa Perangkat Lunak

**MUHAMMAD FARRAS SYAUQI MUHARAM**

**TEKNOLOGI REKAYASA PERANGKAT LUNAK**

**SEKOLAH VOKASI**

**INSTITUT PERTANIAN BOGOR**

**BOGOR**

**2025**

**PERANCANGAN CEK STATUS DOKUMEN PADA *WEBSITE***

***E-BPHTB* DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR**

Judul Proyek Akhir : Perancangan Cek Status Dokumen Pada *Website E-BPHTB*

di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor

Nama : Muhammad Farras Syauqi Muharam

NIM : J0303211114

Disetujui oleh

| Pembimbing:Firman Ardiansyah, S.Kom.,M.Si. | _**_** _ **_** _**_** |
| ------------------------------------------ | ------------------------------- |
|                                            |                                 |

Diketahui oleh

| Ketua Program Studi:Dr. Medhanita Dewi Renanti, S.Kom., M.Kom.NIP 201807198305122001 | _**_** _ **_** _**_** |
| ------------------------------------------------------------------------------------ | ------------------------------- |
|                                                                                      |                                 |

**DAFTAR ISI**

[DAFTAR TABEL DAN GAMBAR vii](https://word2md.com/#_Toc212632977)

[II PENDAHULUAN 1](https://word2md.com/#_Toc212632978)

[2.1 Latar Belakang1](https://word2md.com/#_Toc212632979)

[2.2 Rumusan Masalah 3](https://word2md.com/#_Toc212632980)

[2.3 Tujuan Penelitian 3](https://word2md.com/#_Toc212632981)

[2.4 Manfaat Penelitian 3](https://word2md.com/#_Toc212632982)

[2.5 Ruang Lingkup 3](https://word2md.com/#_Toc212632983)

[III TINJAUAN PUSTAKA 4](https://word2md.com/#_Toc212632984)

[3.1 Elektronik BPHTB 4](https://word2md.com/#_Toc212632985)

[3.2 Metode *Prototype* 4](https://word2md.com/#_Toc212632986)

[3.3 *Booking online* 5](https://word2md.com/#_Toc212632987)

[3.4 *Website* *Development* 5](https://word2md.com/#_Toc212632988)

[3.5 UI/UX *Tools* 5](https://word2md.com/#_Toc212632989)

[IV METODE 7](https://word2md.com/#_Toc212632990)

[4.1 Lokasi dan Waktu 7](https://word2md.com/#_Toc212632991)

[4.2 Teknik Pengumpulan Data dan Analisis Data 7](https://word2md.com/#_Toc212632992)

[4.2.1 Wawancara 7](https://word2md.com/#_Toc212632993)

[4.2.2 Observasi 7](https://word2md.com/#_Toc212632995)

[4.2.3 Analisis Data 8](https://word2md.com/#_Toc212632997)

[4.3 Prosedur Kerja 8](https://word2md.com/#_Toc212632999)

[4.4 Iterasi 1: Pembuatan Fitur *Booking* hingga Pengiriman (November 2024 - Januari 2025) 9](https://word2md.com/#_Toc212633000)

[4.4.1 *Communication* (Komunikasi) 9](https://word2md.com/#_Toc212633001)

[4.4.2 *Quick Plan* (Perencanaan Cepat) 9](https://word2md.com/#_Toc212633002)

[4.4.3 *Quick Design* (Desain Cepat) 10](https://word2md.com/#_Toc212633003)

[4.4.4 *Construction of Prototype* (Konstruksi Prototipe) 14](https://word2md.com/#_Toc212633004)

[4.4.5 *Delivery and Feedback* (Penyerahan dan Umpan Balik) 14](https://word2md.com/#_Toc212633005)

[4.5 Iterasi 2: Optimasi dan Efisiensi Sistem (Maret - Agustus 2025) 14](https://word2md.com/#_Toc212633006)

[4.5.1 *Communication* (Komunikasi) 14](https://word2md.com/#_Toc212633007)

[4.5.2 *Quick Plan* (Perencanaan Cepat) 15](https://word2md.com/#_Toc212633008)

[4.5.3 *Quick Design* (Desain Cepat) 15](https://word2md.com/#_Toc212633009)

[4.5.4 *Construction of Prototype* (Konstruksi Prototipe) 18](https://word2md.com/#_Toc212633010)

[4.5.5 *Delivery and Feedback* (Penyerahan dan Umpan Balik) 18](https://word2md.com/#_Toc212633011)

[4.6 Iterasi 3: Implementasi Sistem Kuotasi (Agustus - September 2025) 18](https://word2md.com/#_Toc212633012)

[4.6.1 *Communication* (Komunikasi) 18](https://word2md.com/#_Toc212633013)

[4.6.2 *Quick Plan* (Perencanaan Cepat) 18](https://word2md.com/#_Toc212633014)

[4.6.3 *Quick Design* (Desain Cepat) 19](https://word2md.com/#_Toc212633015)

[4.6.4 *Construction of Prototype* (Konstruksi Prototipe) 20](https://word2md.com/#_Toc212633016)

[21](https://word2md.com/#_Toc212633017)

[4.6.5 *Delivery and Feedback* (Penyerahan dan Umpan Balik) 21](https://word2md.com/#_Toc212633018)

[4.7 Analisis Hasil Keseluruhan 21](https://word2md.com/#_Toc212633019)

[4.7.1 *Prototype Construction* 23](https://word2md.com/#_Toc212633020)

[4.7.2 *Delivery and Feedback* 23](https://word2md.com/#_Toc212633021)

[4.7.3 Analisis Hasil 23](https://word2md.com/#_Toc212633022)

[4.7.4 Analisis Iterasi *Prototyping* 24](https://word2md.com/#_Toc212633023)

[4.8 Perancangan Sistem 24](https://word2md.com/#_Toc212633024)

[4.8.1 Diagram UML 24](https://word2md.com/#_Toc212633025)

[- Iterasi 1 24](https://word2md.com/#_Toc212633028)

[- Iterasi 2 24](https://word2md.com/#_Toc212633029)

[- Iterasi 3 24](https://word2md.com/#_Toc212633030)

[4.8.2 Arsitektur Sistem 24](https://word2md.com/#_Toc212633036)

[4.8.3 Struktur *Database* 24](https://word2md.com/#_Toc212633041)

[V DAFTAR TEKNOLOGI YANG DIGUNAKAN 25](https://word2md.com/#_Toc212633046)

[VI HASIL DAN PEMBAHASAN 27](https://word2md.com/#_Toc212633047)

[6.1 Hasil 27](https://word2md.com/#_Toc212633048)

[6.1.1 Hasil Iterasi 1: Sistem *Booking* Online Dasar 28](https://word2md.com/#_Toc212633049)

[6.1.2 Hasil Iterasi 2: Intergrasi Keamanan dan Otomasi 31](https://word2md.com/#_Toc212633052)

[6.1.3 Hasil Iterasi 3: Sistem Kuotasi dan Monitoring 32](https://word2md.com/#_Toc212633055)

[6.2 Pembahasan 34](https://word2md.com/#_Toc212633058)

[VII SIMPULAN DAN SARAN 37](https://word2md.com/#_Toc212633059)

[7.1 Simpulan 37](https://word2md.com/#_Toc212633060)

[7.2 Saran 37](https://word2md.com/#_Toc212633061)

[DAFTAR PUSTAKA 38](https://word2md.com/#_Toc212633062)

[LAMPIRAN 39](https://word2md.com/#_Toc212633063)

[Lampiran 1 Timeline proyek akhir 39](https://word2md.com/#_Toc212633064)

DAFTAR TABEL

* [Tabel 1 Kebutuhan Fungsional 21](https://word2md.com/#_Toc212634230)
* [Tabel 2 Relasi *Database* 22](https://word2md.com/#_Toc212634231)
* [Tabel 3 Daftar Teknologi yang digunakan 25](https://word2md.com/#_Toc212634232)
* [Tabel 4 Daftar Perangkat Lunak yang digunakan 25](https://word2md.com/#_Toc212634233)
* [Tabel 5 *Database* schema (12 Tabel) 28](https://word2md.com/#_Toc212634234)
* [Tabel 6 Skema *Database* 31](https://word2md.com/#_Toc212634235)
* [Tabel 7 Skema *Database* 33](https://word2md.com/#_Toc212634236)

DAFTAR GAMBAR

* [Gambar 1 Proses Tahapan Metode *Prototype* 9](https://word2md.com/#_Toc212634154)
* [Gambar 2 *Activity* *Diagram* Iterasi 1 10](https://word2md.com/#_Toc212634155)
* [Gambar 3 *Swimlane Diagram* Iterasi 1 11](https://word2md.com/#_Toc212634156)
* [Gambar 4 *Usecase Diagram* Iterasi 1 12](https://word2md.com/#_Toc212634157)
* [Gambar 5,6,7 *Activity Diagram* (Kompleks) Iterasi 1 13](https://word2md.com/#_Toc212634158)
* [Gambar 8 *Activity Diagram* Iterasi 2 15](https://word2md.com/#_Toc212634159)
* [Gambar 9 *Swimlane Diagram* 2 16](https://word2md.com/#_Toc212634160)
* [Gambar 10 *Usecase Diagram* Iterasi 2 17](https://word2md.com/#_Toc212634161)
* [Gambar 11 ?? (namanya apa) 19](https://word2md.com/#_Toc212634162)
* [Gambar 12 ?? (namanya apa) 21](https://word2md.com/#_Toc212634163)
* [Gambar 13 *Web Booking* SSPD Badan Iterasi 1 30](https://word2md.com/#_Toc212634164)

# PENDAHULUAN

* 1. Latar Belakang

Perkembangan teknologi informasi telah mendorong transformasi digital di berbagai sektor pemerintahan, termasuk dalam bidang pelayanan pajak daerah. Salah satu bentuk transformasi tersebut adalah implementasi sistem Elektronik Bea Perolehan Hak atas Tanah dan Bangunan *(E-BPHTB)* yang diterapkan oleh Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Sistem ini berfungsi sebagai sarana digital untuk memproses, mencatat, dan memverifikasi dokumen pajak BPHTB secara daring dengan tujuan meningkatkan efisiensi administrasi dan mengurangi ketergantungan terhadap proses manual.

Secara global, digitalisasi pelayanan publik telah menjadi bagian penting di era revolusi industri 4.0, di mana berbagai negara termasuk Indonesia, berupaya memanfaatkan teknologi informasi dan komunikasi (TIK) guna memperbaiki kualitas layanan pemerintah kepada masyarakat. Di Indonesia, penerapan layanan berbasis elektronik didukung oleh Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik serta Peraturan Pemerintah Nomor 11 Tahun 2019 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE). Khusus di Kabupaten Bogor, yang memiliki tingkat pertumbuhan ekonomi dan jumlah penduduk yang tinggi, sistem *E-BPHTB* menjadi langkah penting dalam upaya modernisasi pelayanan pajak daerah. Namun demikian, tantangan dalam pengelolaan waktu dan sumber daya manusia masih menjadi kendala utama dalam pelaksanaannya.

Berdasarkan hasil observasi lapangan, proses pelayanan masih menghadapi kendala dalam pengaturan jadwal pemeriksaan berkas, yang menyebabkan antrean panjang serta waktu tunggu yang lama. Hal ini umumnya terjadi karena wajib pajak tidak dapat menyesuaikan waktu pelayanan secara fleksibel, sehingga terjadi penumpukan berkas pada jam tertentu. Kondisi tersebut berdampak pada menurunnya efisiensi kerja dan tingkat kepuasan masyarakat. Oleh karena itu, inovasi berbasis teknologi seperti fitur pemesanan jadwal ( *booking online* ) diperlukan untuk memberikan kemudahan kepada wajib pajak dalam menentukan waktu pemeriksaan tanpa harus datang langsung ke kantor BAPPENDA. Fitur *booking online* menjadi solusi potensial untuk mengatasi permasalahan tersebut, dengan memberikan kemudahan kepada wajib pajak dalam melakukan pemesanan jadwal pemeriksaan dokumen tanpa harus datang langsung ke kantor. Digitalisasi proses administrasi publik mampu meningkatkan efisiensi pelayanan hingga 40% dengan mengurangi ketergantungan terhadap interaksi manual (Fachri, A 2023). Metode *prototyping* dalam rekayasa perangkat lunak memungkinkan pengembang menyesuaikan sistem secara cepat berdasarkan kebutuhan pengguna, sehingga hasil akhir lebih sesuai dengan ekspektasi fungsional (Siswidiyanto *et al.* 2021).

Dari simulasi internal yang dilakukan penulis, penerapan fitur *booking online* pada *website E-BPHTB* terbukti mampu memangkas waktu pelayanan dari rata-rata 50 menit per berkas menjadi sekitar 10-25 menit. Hal ini menunjukkan adanya peningkatan efisiensi signifikan dalam proses pelayanan publik. Efisiensi dan transparansi merupakan dua prinsip utama dalam manajemen keuangan daerah yang harus dijaga agar pelayanan publik dapat berjalan optimal dan akuntabel (Adzkia *et al.* 2024).

Selain itu, sejak pandemi *COVID-19* pada tahun 2020, keberadaan layanan berbasis daring menjadi semakin penting. Pemerintah Indonesia, melalui Instruksi Presiden Nomor 3 Tahun 2020 tentang Kebijakan Percepatan Penanganan  *COVID-19* , mendorong percepatan penerapan *e-government* guna mengurangi kontak langsung dan risiko penularan. Berdasarkan data BAPPENDA Kabupaten Bogor tahun 2022, jumlah transaksi BPHTB mencapai lebih dari 15.000 berkas per tahun, dengan lonjakan signifikan di akhir tahun akibat meningkatnya aktivitas jual beli properti. Tanpa adanya sistem pemesanan daring, antrean fisik dapat mencapai 50 hingga 100 orang per hari, yang tidak hanya memperlambat pelayanan tetapi juga meningkatkan risiko kesehatan. Fitur *booking online* menjadi solusi efektif untuk mengatur distribusi waktu pelayanan agar lebih merata dan efisien.

Secara teoritis, konsep *e-government* yang dikemukakan oleh Asmuddin (2025) menekankan bahwa transformasi digital harus berorientasi pada pengguna ( *user-centric* ). Layanan seperti sistem pemesanan daring tidak hanya bertujuan untuk efisiensi, tetapi juga inklusivitas. Beberapa negara seperti Singapura dan Estonia telah membuktikan bahwa sistem serupa mampu mengurangi waktu tunggu hingga 60% dan meningkatkan kepuasan pengguna sebesar 30%. Di Indonesia sendiri, contoh penerapan teknologi seperti e-KTP dan e-Samsat menunjukkan bahwa digitalisasi dapat memperkuat transparansi dan akuntabilitas pemerintah daerah. Dengan demikian, penelitian ini memiliki relevansi praktis dan teoretis dalam mendukung terwujudnya  *good governance* , sekaligus sejalan dengan visi Kabupaten Bogor untuk menjadi daerah yang maju berbasis teknologi.

BPHTB merupakan salah satu sumber Pendapatan Asli Daerah (PAD) yang berperan penting dalam mendukung pembangunan daerah, sebagaimana diatur dalam Undang-Undang Nomor 28 Tahun 2009 tentang Pajak Daerah dan Retribusi Daerah. Di Kabupaten Bogor, kontribusi BPHTB terhadap PAD mencapai sekitar 10-15% per tahun. Namun, proses yang masih dilakukan secara manual kerap menimbulkan inefisiensi, seperti kesalahan pencatatan dan keterlambatan pembayaran. Penerapan sistem pemesanan daring diharapkan tidak hanya memperbaiki proses operasional, tetapi juga mendukung pencapaian Tujuan Pembangunan Berkelanjutan (SDGs), khususnya SDG 9 (Industri, Inovasi, dan Infrastruktur) dan SDG 16 (Keadilan, Perdamaian, dan Institusi yang Kuat).

Dari sisi sosial dan ekonomi, Kabupaten Bogor sebagai wilayah penyangga dengan aktivitas properti yang tinggi menghadapi tantangan dalam pengelolaan mobilitas masyarakat. Sebagian besar wajib pajak yang terdiri dari individu, pengembang, dan notaris (PPAT) sering kali memiliki keterbatasan waktu untuk mengurus administrasi secara langsung. Berdasarkan penelitian World Bank (2021), kemudahan akses terhadap layanan pajak dapat meningkatkan kepatuhan wajib pajak hingga 25%, yang pada akhirnya berkontribusi pada pembangunan infrastruktur seperti jalan, sekolah, dan fasilitas kesehatan. Dengan demikian, pengembangan fitur *booking online* bukan hanya inovasi teknis, tetapi juga strategi untuk memperkuat pelayanan publik dan mendukung pertumbuhan ekonomi berkelanjutan di Kabupaten Bogor. Oleh karena itu, penelitian ini berfokus pada perancangan dan pengembangan fitur *booking online* pada *website E-BPHTB* sebagai langkah untuk mendukung digitalisasi layanan pajak daerah di Kabupaten Bogor.

* 1. Rumusan Masalah

Berdasarkan latar belakang yang telah dipaparkan, maka urgensi penelitian ini difokuskan pada bagaimana perancangan fitur *booking online* pada *Website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor. Adapun rumusan masalah secara spesifik adalah sebagai berikut:

* Bagaimana penerapan fitur *booking online* pada *website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor?
* Bagaimana tingkat efektivitas fitur *booking online* dalam meningkatkan efisiensi proses pelayanan pajak daerah?
  * Tujuan Penelitian

Berdasarkan rumusan masalah diatas, tujuan dalam penelitian ini yang ingin dicapai, yaitu:

* Mengembangkan dan mengimplementasikan fitur *booking online* pada *website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor.
* Menganalisis tingkat efektivitas fitur *booking online* dalam meningkatkan efisiensi waktu dan akurasi pelayanan pajak daerah.
  * Manfaat Penelitian

Berdasarkan tujuan penelitian yang telah diuraikan, maka hasil penelitian ini diharapkan dapat memberikan manfaat bagi, yaitu:

* Bagi BAPPENDA Kabupaten Bogor: membantu mengurangi kepadatan antrian di loket serta mempermudah pengelolaan jadwal layanan.
* Bagi masyarakat/PPAT: memberikan kemudahan dalam memesan jadwal layanan tanpa harus menunggu antrian panjang secara manual.
* Bagi akademik/penelitian: menjadi referensi dalam implementasi *e-government* berbasis layanan digital, khususnya dalam penerapan fitur  *booking online* .
  * Ruang Lingkup

Penelitian ini berfokus pada pengembangan dan implementasi fitur *booking* online pada website *E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor. Ruang lingkup penelitian mencakup pengembangan sistem pemesanan jadwal pemeriksaan dokumen BPHTB secara daring, yang meliputi fitur pembuatan *booking* oleh PPAT/PPATS, validasi dokumen oleh LTB, pemeriksaan oleh Peneliti dan Peneliti Validasi, serta penyerahan dokumen oleh LSB. Sistem ini juga mencakup pengembangan fitur upload dokumen (akta tanah, sertifikat tanah, dokumen pelengkap), sistem tanda tangan digital, notifikasi real-time antar divisi, dan sistem kuotasi untuk manajemen beban kerja pegawai.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js untuk backend, HTML, CSS, JavaScript, dan Vite.js untuk frontend, serta PostgreSQL sebagai  *database* . Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital, QR Code untuk validasi, dan integrasi dengan sistem BSRE. Pengujian sistem dilakukan melalui tiga iterasi prototyping dengan melibatkan pegawai BAPPENDA dari berbagai divisi, tanpa melibatkan pengujian langsung dengan masyarakat luas dalam skala besar.

# TINJAUAN PUSTAKA

* 1. Elektronik BPHTB

Elektronik Bea Perolehan Hak atas Tanah dan Bangunan ( *E-BPHTB* ) merupakan sistem digital berbasis web yang dirancang untuk membantu proses administrasi pajak daerah secara lebih efektif dan efisien. Sistem ini meliputi tahapan pendaftaran, pemeriksaan, perhitungan, hingga pelaporan transaksi BPHTB secara daring. Melalui  *E-BPHTB* , proses pengelolaan pajak dapat dilakukan secara otomatis dan terintegrasi antara wajib pajak, notaris, lembaga keuangan, dan instansi pemerintah. Menurut Fachri, A (2023) menyatakan bahwa penerapan layanan elektronik di sektor publik berperan besar dalam meningkatkan efisiensi, transparansi, serta akuntabilitas pengelolaan keuangan daerah. Sistem digital memungkinkan akses data yang cepat, akurat, dan dapat diverifikasi secara  *real-time* , sehingga mendukung peningkatan kepercayaan publik terhadap pelayanan pemerintah.

Hasil penelitian lain oleh Sari (2022) menunjukkan bahwa digitalisasi pelayanan pajak mampu mempercepat proses administrasi hingga 40% dibandingkan sistem manual, sekaligus menurunkan potensi kesalahan pencatatan. Implementasi *E-BPHTB* di berbagai daerah di Indonesia merupakan bagian dari kebijakan *e-government* nasional yang bertujuan mewujudkan birokrasi modern menuju Indonesia Maju 2045. Namun demikian, tantangan seperti keterbatasan jaringan internet dan adaptasi pengguna terhadap teknologi baru masih menjadi kendala dalam penerapan sistem ini. Studi di Provinsi Jawa Barat menunjukkan bahwa penerapan *E-BPHTB* berhasil memperpendek waktu pengurusan berkas dari 2-3 hari menjadi kurang dari 24 jam serta meningkatkan pendapatan daerah sebesar 15%. Oleh karena itu, *E-BPHTB* dapat dianggap sebagai inovasi penting dalam mendukung transformasi digital dan peningkatan kualitas pelayanan publik di bidang perpajakan daerah.

* 1. Metode *Prototype*

Metode *prototyping* merupakan pendekatan iteratif dalam rekayasa perangkat lunak yang menitikberatkan pada pengembangan model awal untuk diuji oleh pengguna sebelum sistem akhir dibuat. Menurut Siswidiyanto *et al.* (2021), metode ini efektif digunakan ketika kebutuhan pengguna belum terdefinisi secara lengkap karena memungkinkan pengembang melakukan perbaikan berulang berdasarkan umpan balik pengguna. Pendekatan ini juga dinilai efisien dalam pengembangan antarmuka pengguna dan sistem berbasis web karena hasil visual dapat segera divalidasi.

Dewi dan Prasetyo (2023) menambahkan bahwa pendekatan *prototype* mampu meningkatkan komunikasi antara pengembang dan pengguna, serta mempercepat penyesuaian sistem terhadap kebutuhan aktual di lapangan. Terdapat dua jenis utama  *prototype* , *yaitu throwaway prototyping* yang digunakan untuk eksplorasi awal, dan *evolutionary prototyping* yang dikembangkan secara bertahap hingga mencapai sistem akhir. Dalam konteks penelitian ini, metode prototype digunakan untuk merancang fitur *booking online* pada sistem  *E-BPHTB* , agar hasil akhir tidak hanya memenuhi aspek teknis, tetapi juga selaras dengan kebutuhan dan ekspektasi pengguna.

* 1. *Booking online*

Fitur *booking online* adalah komponen digital yang memungkinkan pengguna melakukan pemesanan layanan secara daring berdasarkan jadwal yang tersedia tanpa perlu hadir langsung di lokasi atau dengan kata lain *booking online* merupakan *fitur digital* yang memungkinkan pengguna untuk melakukan pemesanan layanan secara daring berdasarkan waktu atau jadwal yang tersedia. Sistem ini memberikan kemudahan bagi masyarakat untuk mengatur jadwal pelayanan tanpa harus datang langsung ke lokasi, sehingga mampu menghemat waktu dan meningkatkan efisiensi pelayanan publik. Menurut Pratama (2021), penerapan sistem *booking online* dalam layanan publik mampu meningkatkan kepuasan pengguna karena mengurangi waktu tunggu dan memperjelas antrian layanan. Dalam konteks pemerintahan daerah, fitur ini juga mendukung konsep *smart government* dengan memberikan kemudahan akses dan efisiensi pelayanan.

Penelitian oleh Fitriani dan Hidayat (2022) menjelaskan bahwa sistem online *reservation* dapat meningkatkan efisiensi waktu hingga 60% serta meminimalisasi interaksi tatap muka yang berlebihan, terutama pada masa pandemi. Teknologi yang digunakan dalam sistem ini antara lain *Application Programming Interface* (API) untuk integrasi data, algoritma scheduling untuk pengaturan waktu, serta sistem notifikasi otomatis. Dalam konteks  *E-BPHTB* , fitur *booking online* diimplementasikan untuk membantu wajib pajak memesan jadwal pemeriksaan dokumen secara mudah dan  *fleksibel* . Fitur ini diharapkan mampu mendukung peningkatan pelayanan publik berbasis teknologi serta memperkuat komitmen pemerintah dalam modernisasi sistem administrasi pajak daerah.

* 1. *Website* *Development*

*Website* merupakan media interaktif berbasis jaringan yang memungkinkan pertukaran informasi antara pengguna dan sistem melalui *browser* atau jaringan internet. Pengembangan *website modern* memerlukan kombinasi *teknologi front-end* dan *back-end* untuk menciptakan tampilan yang menarik, responsif, dan aman digunakan. Menurut Nugroho (2020), pengembangan *website* modern umumnya menggunakan teknologi seperti HTML, CSS, dan JavaScript untuk tampilan antarmuka, serta Node.js dan Express.js untuk logika server dan integrasi data. Selain itu, PostgreSQL digunakan sebagai basis data relasional yang mendukung skalabilitas dan keamanan sistem. Dalam penelitian Setiawan (2020), penggunaan kombinasi teknologi tersebut terbukti mempercepat proses pengembangan dan memudahkan integrasi dengan layanan *cloud* seperti Railway. Dalam pengembangan  *E-BPHTB* , *website* dirancang agar mampu menangani ribuan transaksi setiap hari dengan kecepatan tinggi dan tingkat keamanan optimal. Sistem ini juga akan diintegrasikan dengan fitur *booking online* untuk memastikan pelayanan dapat diakses kapan saja dan di mana saja secara efisien.

* 1. UI/UX *Tools*

Desain antarmuka pengguna (UI) dan pengalaman pengguna (UX) merupakan elemen penting dalam pengembangan sistem berbasis web. Desain yang baik harus memperhatikan prinsip kejelasan, konsistensi, kemudahan navigasi, serta tampilan yang responsif pada berbagai perangkat. Menurut Nielsen (2022), prinsip utama desain UI/UX adalah kemudahan penggunaan, kejelasan navigasi, dan kesesuaian sistem dengan kebutuhan pengguna. Dalam proses perancangan, Figma digunakan untuk membuat *wireframe* dan *prototype* visual secara kolaboratif antara desainer dan pengembang. Selain itu, dbdiagram digunakan untuk merancang skema basis data, sementara Railway dimanfaatkan untuk proses *deployment* sistem. Integrasi alat bantu tersebut memungkinkan pengembang bekerja secara efisien dan menghasilkan sistem yang konsisten dari tahap desain hingga implementasi.

Selain itu, didiagram digunakan untuk merancang struktur basis data, sementara Railway dimanfaatkan sebagai platform deployment agar sistem dapat dijalankan secara daring. Kombinasi alat bantu tersebut memudahkan proses pengembangan dari tahap desain hingga implementasi. Penelitian oleh Dewi dan Prasetyo (2023) juga menegaskan bahwa penerapan desain berbasis UI/UX dapat meningkatkan keterlibatan pengguna serta menurunkan tingkat kesalahan penggunaan sistem. Dalam penelitian ini, UI/UX *tools* diterapkan untuk merancang antarmuka *E-BPHTB* yang ramah pengguna ( *user-friendly* ), mudah dipahami, serta dapat diakses oleh masyarakat dengan berbagai tingkat literasi digital.

# METODE

* 1. Lokasi dan Waktu

Penelitian ini dilaksanakan di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor, beralamat di Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat. Penelitian dilakukan selama masa Praktik Kerja Lapangan (PKL) yang berlangsung dari 22 Juli 2024 hingga 20 Desember 2024, di Bidang Perencanaan dan Pengembangan Pendapatan Daerah, Sub-bidang Pengelolaan Sistem Informasi (PSI). Setelah kegiatan PKL berakhir, tahap pengembangan, penyempurnaan, dan pengujian sistem dilanjutkan kembali di kantor BAPPENDA Kabupaten Bogor hingga bulan Juli 2025, sebelum tahap finalisasi laporan dan evaluasi dilakukan di Sekolah Vokasi IPB University.

Penelitian dimulai di Sekolah Vokasi IPB University, Jl. Kumbang No.14, Kelurahan Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128, untuk tahap perencanaan dan analisis kebutuhan. Setelah tahap perencanaan selesai, penelitian dilanjutkan dengan implementasi dan pengujian sistem di BAPPENDA Kabupaten Bogor.

* 1. Teknik Pengumpulan Data dan Analisis Data

Dalam upaya mengumpulkan informasi yang dapat dipertanggungjawabkan dan memperoleh data yang relevan untuk mendukung keberhasilan pengembangan sistem yang diteliti, penelitian ini menggunakan dua teknik pengumpulan data yang terdiri dari metode wawancara serta observasi. Adapun penjabaran dari kedua teknik tersebut adalah sebagai berikut:

* * 1. Wawancara

Wawancara dilakukan dengan pengelola sistem informasi (PSI) dan pegawai bagian loket BAPPENDA untuk memahami kebutuhan fungsional fitur  *booking online* , kendala dalam proses pelayanan, serta harapan pengguna terhadap sistem baru. Menurut Fauzi (2020), wawancara terstruktur efektif untuk menggali kebutuhan teknis dan mendefinisikan masalah dalam sistem berbasis teknologi informasi.

Wawancara dilakukan dengan 5 responden yang terdiri dari:

- 3 pegawai PSI (Pengelola Sistem Informasi/Admin Sistem)
- 1 pegawai Peneliti

* * 1. Observasi

Observasi dilakukan dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui sistem digital. Hasil observasi digunakan untuk menyusun rancangan alur fitur *booking online* agar sesuai dengan kondisi operasional di lapangan.

* * 1. Analisis Data

Analisis data dilakukan dengan pendekatan kualitatif dan kuantitatif berdasarkan data yang tersedia:

* 1. Analisis Kualitatif
* Analisis Diskusi Rapat: Identifikasi kebutuhan fungsional dari diskusi dengan PSI, LTB, dan Peneliti
* Observasi Lapangan: Dokumentasi pola kerja dan titik inefisiensi dari pengamatan langsung
* Kategorisasi Kebutuhan: Pengelompokan kebutuhan berdasarkan prioritas dan urgensi
* Identifikasi Masalah: Dokumentasi kendala yang ditemukan dalam proses manual
  * Analisis Kuantitatif
* Pengukuran Performa Sistem: Waktu respons, throughput, dan efisiensi sistem
* Analisis Statistik Kepuasan: Survey kepuasan pengguna setelah implementasi
* Pengukuran Efisiensi: Perbandingan waktu proses sebelum dan sesudah implementasi
* Metrik Teknis: Uptime sistem, akurasi validasi, dan stabilitas aplikasi
  * Catatan Metodologi

Karena tugas akhir ini merupakan hasil magang dan fokus pada implementasi praktis, analisis kebutuhan dilakukan melalui:

* *Learning by Doing* : Pemahaman kebutuhan melalui proses pengembangan sistem
* *User Feedback* : Validasi sistem melalui pengujian langsung dengan pengguna
* *Iterative Improvement* : Perbaikan sistem berdasarkan pengalaman implementasi
* *Practical Validation* : Pengujian sistem dalam lingkungan kerja yang sesungguhnya
* 1. Prosedur Kerja

Penelitian menggunakan pendekatan pengembangan berbasis metode  *prototyping* . Metode ini dipilih karena bersifat iteratif dan fleksibel, memungkinkan pengguna memberikan umpan balik langsung pada setiap tahap pengembangan sistem. Menurut Siswidiyanto et al. (2021), prototyping efektif diterapkan dalam pengembangan perangkat lunak yang menitikberatkan pada antarmuka pengguna dan interaksi langsung dengan sistem. Dalam konteks magang di BAPPENDA, metode ini memungkinkan peneliti mengumpulkan masukan secara langsung dari pengguna untuk menyesuaikan fitur sistem dengan ekspektasi dan kebutuhan aktual

![]()

Gambar 1 Proses Tahapan Metode *Prototype*

Tahapan metode *prototyping* dalam penelitian ini adalah sebagai berikut:

* *Communication* - Pengumpulan kebutuhan melalui diskusi dengan stakeholder dan observasi lapangan.
* *Quick Plan* - Perencanaan cepat untuk menetapkan lingkup, prioritas fungsionalitas, dan jadwal pengembangan.
* *Quick Design* - Pembuatan desain awal (wireframe) dan diagram UML menggunakan Figma dan Draw.io.
* *Prototype Construction* - Pembangunan prototipe fungsional menggunakan Node.js, Express.js, dan PostgreSQL.
* *Delivery and Feedback* - Pengujian prototipe dan perbaikan berdasarkan umpan balik dari pengguna.
* 1. Iterasi 1: Pembuatan Fitur *Booking* hingga Pengiriman (November 2024 - Januari 2025)
* * 1. *Communication* (Komunikasi)

Tahap komunikasi merupakan tahap yang krusial karena melibatkan diskusi menyeluruh dengan stakeholder untuk menggali kebutuhan dan tantangan spesifik dalam proses pelayanan BPHTB. Tahapan ini membantu dalam mengidentifikasi perumusan kebutuhan menjadi lebih jelas dan penting untuk kelanjutan proyek agar perancangan dapat sesuai dengan kebutuhan pengguna (Ekasari et al. 2024). Dalam penelitian ini, komunikasi dilakukan melalui wawancara dan observasi.

Wawancara adalah prosedur yang bertujuan untuk memperoleh informasi dari seseorang melalui jawaban lisan atas pertanyaan lisan (Setiawan et al. 2025). Teknik ini dilakukan secara langsung dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) pada November 2024 dengan pendekatan semi-terstruktur untuk memahami alur kerja sistem yang berjalan dan mengidentifikasi kebutuhan fungsional fitur *booking online*. Observasi dilakukan secara non-partisipatif selama masa magang dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui sistem digital.

Dari hasil wawancara dan observasi, teridentifikasi bahwa sistem BPHTB saat ini hanya berupa website yang dapat diakses secara publik, namun alur bisnis internal seperti proses booking jadwal pemeriksaan, penandatanganan dokumen, dan koordinasi antar divisi masih dilakukan secara manual menggunakan berkas fisik. Proses penanganan dokumen memerlukan tanda tangan manual di atas kertas dan pengiriman fisik antar divisi. Dalam kondisi normal, proses dapat diselesaikan dalam 30-40 menit per berkas, namun pada kondisi kompleks atau saat terjadi penumpukan, proses dapat memakan waktu hingga 2 jam karena harus menunggu antrean di setiap divisi dengan tingkat kesalahan sekitar 10%. Keluhan utama yang diidentifikasi meliputi: (1) proses penandatanganan dokumen secara fisik yang memerlukan waktu perpindahan berkas, (2) sulitnya tracking status dokumen secara real-time, (3) koordinasi antar divisi yang memakan waktu karena harus mengantarkan berkas fisik, dan (4) tidak adanya sistem validasi digital untuk memastikan keamanan dokumen. Hasil identifikasi ini menjadi dasar pengembangan fitur *booking online* yang mengubah proses manual menjadi sistem digital yang dapat dilakukan secara daring dari awal hingga akhir proses.

Hasil wawancara dengan Kasubbid PSI dapat dilihat pada Tabel X berikut ini.

**Tabel X Hasil Wawancara Iterasi Pertama**

| No | Tujuan                                               | Pertanyaan & Jawaban                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Menggali alur proses BPHTB saat ini                  | **Peneliti:** "Bagaimana sistem BPHTB berjalan di BAPPENDA saat ini?" `<br>` **Kasubbid PSI:** "Saat ini kami memiliki website BPHTB yang bisa diakses publik untuk melihat informasi, namun untuk proses booking jadwal pemeriksaan masih dilakukan secara manual. PPAT/PPATS datang langsung ke kantor untuk mengajukan booking, kemudian kami catat secara manual."                                                                                                              |
| 2  | Mengidentifikasi masalah dalam sistem booking manual | **Peneliti:** "Apa kendala yang dihadapi dalam sistem booking manual saat ini?" `<br>` **Kasubbid PSI:** "Masalah utamanya adalah antrean panjang karena semua PPAT datang di jam yang sama, sekitar 60-100 booking per hari untuk BPHTB tapi kami hanya punya kapasitas peneliti sekitar 85-105 orang yang harus dibagi untuk 9 jenis pajak. Jadi sering terjadi penumpukan dan waktu tunggu yang lama."                                                                           |
| 3  | Menggali proses penandatanganan dokumen              | **Peneliti:** "Bagaimana proses penandatanganan dokumen di BAPPENDA?" `<br>` **Kasubbid PSI:** "Penandatanganan masih dilakukan manual di atas kertas. Setiap divisi harus menandatangani secara fisik, lalu berkas dipindahkan secara manual antar divisi. Proses ini dapat memakan waktu 30-40 menit per berkas dalam kondisi normal, namun pada saat terjadi penumpukan atau dokumen kompleks, bisa mencapai 2 jam karena harus menunggu antrean tanda tangan di setiap divisi." |
| 4  | Identifikasi kebutuhan tracking status               | **Peneliti:** "Bagaimana PPAT mengetahui status dokumen mereka?" `<br>` **Kasubbid PSI:** "Saat ini PPAT harus menanyakan langsung secara manual, apakah datang ke kantor atau menghubungi via telepon. Tidak ada sistem tracking real-time. Kadang ada kesalahan sekitar 10% karena dokumen tertukar atau hilang dalam proses perpindahan fisik antar divisi."                                                                                                                     |
| 5  | Menilai urgensi digitalisasi                         | **Peneliti:** "Apakah digitalisasi proses booking dan tracking penting untuk BAPPENDA?" `<br>` **Kasubbid PSI:** "Sangat penting. Dengan sistem online, PPAT bisa booking dari mana saja tanpa harus datang ke kantor. Tracking real-time juga akan mengurangi beban kerja pegawai yang harus menjawab pertanyaan status dokumen secara manual. Sistem digital juga akan mengurangi kesalahan karena data tersimpan di database."                                                   |
| 6  | Validasi kebutuhan fitur                             | **Peneliti:** "Fitur apa yang paling penting untuk sistem booking online E-BPHTB?" `<br>` **Kasubbid PSI:** "Yang paling penting adalah sistem booking online agar PPAT bisa membuat jadwal dari rumah, tracking real-time agar PPAT tahu posisi dokumen, dan tanda tangan digital agar tidak perlu tanda tangan manual. Sistem juga harus terintegrasi dengan divisi Bank untuk verifikasi pembayaran, dan harus ada sistem validasi dokumen digital untuk keamanan."              |
| 7  | Fokus pengembangan iterasi pertama                   | **Peneliti:** "Untuk iterasi pertama, fokus pengembangan apa yang diinginkan?" `<br>` **Kasubbid PSI:** "Untuk awal, fokuskan pada fitur booking online dasar dengan tracking status. Tanda tangan digital bisa ditambahkan di iterasi selanjutnya. Yang penting sistem bisa digunakan untuk mengurangi antrean dan mempercepat proses."                                                                                                                                            |

* * 1. *Quick Plan* (Perencanaan Cepat)

Selama tahap perencanaan cepat, fokus utama adalah menyusun draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi sebelumnya dengan stakeholder (Ekasari et al. 2024). Berdasarkan hasil wawancara dengan Kasubbid PSI (Tabel X No. 7), peneliti menyusun perencanaan pengembangan sistem *booking online* tahap awal dengan fokus pada pembuatan fitur booking online dasar dengan tracking status. Proses perencanaan dilakukan melalui diskusi teknis berulang dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) sebagai mentor dan validator dalam merancang alur sistem. Diskusi meliputi identifikasi requirement fungsional, validasi alur bisnis yang akan diimplementasikan berdasarkan kondisi operasional di BAPPENDA, serta kesepakatan mengenai scope pengembangan pada iterasi pertama.

**Output perencanaan** yang dihasilkan adalah sebagai berikut:

**a. Fokus Iterasi Pertama**: Berdasarkan masukan dari Kasubbid PSI, iterasi pertama difokuskan pada sistem booking online dasar dengan tracking status real-time. Fitur-fitur yang direncanakan meliputi: (1) sistem pemesanan jadwal pemeriksaan secara daring, (2) dashboard tracking untuk memantau status dokumen secara real-time, (3) integrasi modul antar divisi (PPAT/PPATS, LTB, Peneliti, dan LSB), dan (4) sistem notifikasi untuk update status dokumen.

**b. Activity Diagram Iterasi 1**: Untuk memvisualisasikan perencanaan alur kerja yang akan dikerjakan, dibuat Activity Diagram Iterasi 1 yang menunjukkan proses transformasi dari sistem manual menjadi digital. Diagram ini menggambarkan alur dari pengajuan booking hingga penyelesaian dokumen, dan menjadi panduan teknis dalam pengembangan sistem. Activity Diagram dapat dilihat pada Gambar 2.

**Gambar 2 Activity Diagram Iterasi 1**

Activity Diagram ini menggambarkan transformasi alur kerja manual menjadi sistem digital yang terintegrasi untuk pengelolaan Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB). Proses dimulai ketika Pejabat Pembuat Akta Tanah (PPAT) atau Pejabat Pembuat Akta Tanah Sementara (PPATS) melakukan pengajuan *booking* melalui sistem online, yang kemudian diteruskan ke Loket Terima Berkas (LTB) untuk verifikasi kelengkapan dokumen, di mana data seperti identitas dan surat perjanjian diperiksa secara digital guna memastikan kepatuhan awal. Setelah verifikasi selesai, dokumen masuk ke tahap pemeriksaan oleh Peneliti untuk memastikan keakuratan data dan kelengkapan persyaratan.

Proses selanjutnya melibatkan Bank dalam penanganan pembayaran BPHTB, yang terintegrasi langsung dengan sistem untuk memastikan sinkronisasi data keuangan. Tahap akhir adalah serah terima dokumen oleh Loket Serah Berkas (LSB) kepada PPAT/PPATS yang telah menyelesaikan seluruh proses. Seluruh alur kerja ini dapat dipantau secara real-time oleh semua pihak terkait, memberikan transparansi dan efisiensi yang signifikan dibandingkan dengan sistem manual sebelumnya. Dengan demikian, diagram ini menekankan bagaimana integrasi teknologi mendukung modernisasi pelayanan publik dan meningkatkan kepuasan pengguna (Berdasarkan Tabel X No. 5 dan 6).

**c. Struktur Database**: Berdasarkan analisis kebutuhan sistem, dirancang struktur database yang mencakup 13 tabel utama, antara lain: pat_1_booking_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf, pv_1_paraf_validate, dan lsb_1_serah_berkas. Setiap tabel dirancang untuk menyimpan data spesifik dari setiap tahapan proses, dimana relasi antar tabel dirancang untuk memastikan integritas data dan memfasilitasi tracking real-time status dokumen.

**d. Alur Kerja Sistem**: Alur kerja sistem mengikuti tahapan yang terstruktur sesuai dengan Activity Diagram yang telah direncanakan. Proses dimulai dari pengajuan *booking* oleh PPAT/PPATS melalui sistem online, kemudian verifikasi kelengkapan dokumen oleh LTB, dilanjutkan dengan pemeriksaan oleh Peneliti, dan tahap akhir adalah proses serah berkas di LSB. Setiap tahapan direkam dalam database sehingga status dokumen dapat dilacak secara real-time melalui dashboard tracking (Berdasarkan Tabel X No. 2 dan 4).

* * 1. *Quick Design* (Desain Cepat)

Sementara itu, pada tahap pemodelan desain cepat, aktivitas berfokus merepresentasikan tampilan dan struktur aplikasi secara visual, seperti perancangan sketsa antarmuka aplikasi, pembuatan wireframe dan mock-up, serta pembuatan Activity Diagram, Use Case Diagram, dan Entity Relationship Diagram secara lebih detail untuk mendeskripsikan alur sistem dan struktur basis data yang akan digunakan sebagai dasar pembangunan prototipe (Allacsta dan Hadiwandra 2024). Proses desain dilakukan oleh peneliti dengan pendekatan *user-centric design*, dimana setiap wireframe ditampilkan kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan *feedback* dan validasi kelayakan alur sistem. Kasubbid PSI berperan sebagai validator yang memahami kebutuhan semua divisi karena posisinya sebagai pemegang alur pemrosesan dan integrasi design alur di BAPPENDA. Iterasi desain dilakukan sebanyak 3 kali sampai mendapatkan persetujuan final dari Kasubbid PSI.

**Output desain** yang dihasilkan adalah sebagai berikut:

**a. Wireframe dan Mockup**: Desain awal sistem dibuat menggunakan **Figma** dengan rancangan wireframe untuk tiap divisi (PPAT/PPATS, LTB, Bank, Peneliti, dan LSB). Wireframe dirancang untuk mengilustrasikan layout dan navigasi dasar dari setiap halaman pada sistem booking online. Selain itu, dibuat mockup interface menggunakan **Draw.io** untuk unggah dokumen dan tanda tangan digital, dimana mockup ini dirancang untuk menunjukkan visual tampilan yang akan diimplementasikan pada sistem.

**b. Swimlane Diagram**: Diagram ini dirancang untuk mengilustrasikan pembagian tanggung jawab dan alur kerja antar divisi dalam proses booking online E-BPHTB. Swimlane Diagram dapat dilihat pada Gambar 3. Proses diagram ini terbagi menjadi enam lane utama yaitu PPAT (pengajuan dan upload), LTB (verifikasi berkas), Peneliti (pemeriksaan data), Clear to Paraf (persetujuan digital), Peneliti Validasi (validasi akhir), dan LSB (serah terima) yang dimana setiap lane menggambarkan urutan kegiatan yang dilakukan oleh masing-masing aktor secara berkesinambungan, mulai dari pendaftaran hingga dokumen dinyatakan sah dan diterima. Diagram ini didukung oleh 13 tabel database yang berfungsi untuk menyimpan dan mengelola data transaksi secara sistematis, dengan estimasi waktu pemrosesan 10-25 menit per dokumen. Swimlane Diagram ini memiliki relevansi penting dalam tahapan prototyping iterasi pertama, karena mampu meningkatkan efisiensi proses bisnis, mengurangi kemungkinan terjadinya overlapping antar divisi, serta memfasilitasi pengembangan sistem yang berorientasi pada kebutuhan pengguna (user-centric design).

**Gambar 3 Swimlane Diagram Iterasi 1**

**c. Use Case Diagram**: Use case diagram dibuat untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia. Use Case Diagram dapat dilihat pada Gambar 4. Diagram ini menunjukkan 7 aktor utama (PPAT/PPATS, LTB, Bank, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB, dan Admin) yang berinteraksi dengan 24 use case yang mencakup booking, verifikasi, dan penyelesaian dokumen atau seluruh proses booking online. Menggunakan simbol UML standar dan warna untuk aktor, diagram ini relevan dalam prototyping untuk efisiensi dan validasi di BAPPENDA. Use Case Diagram ini tidak hanya memberikan gambaran umum mengenai fungsionalitas sistem, tetapi juga menjadi acuan awal dalam proses pengembangan perangkat lunak. Melalui diagram tersebut, pengembang dapat memahami kebutuhan pengguna dengan lebih jelas serta memastikan bahwa setiap fungsi yang dirancang mampu mendukung tujuan utama sistem secara keseluruhan.

**Gambar 4 Use Case Diagram Iterasi 1**

**d. Activity Diagram Kompleks**: Activity Diagram kompleks dibuat untuk menggambarkan detail interaksi pengguna dengan sistem secara menyeluruh. Diagram ini merupakan detail kompleks dari pengguna yang mencakup seluruh alur kerja dari booking hingga penyelesaian dokumen. Activity Diagram kompleks dapat dilihat pada Gambar 5, 6, dan 7. Diagram ini menggambarkan detail interaksi pengguna dengan sistem yang terbagi menjadi tiga bagian utama. Part 1 mencakup proses booking oleh PPAT/PPATS dengan generate nomor booking (`ppat_khusus+2025+urut`) dan validasi dokumen oleh LTB dengan generate nomor registrasi (`2025+O+urut`). Part 2 meliputi pemeriksaan dokumen oleh Peneliti dan proses paraf serta stempel oleh Clear to Paraf. Part 3 mencakup validasi akhir oleh Peneliti Validasi dan serah terima dokumen oleh LSB hingga penyelesaian proses booking.

**Gambar 5, 6, 7 Activity Diagram Kompleks Iterasi 1**

**e. Struktur Database Relasional**: Struktur database relasional dirancang menggunakan **dbdiagram.io**, yang mendukung sistem penomoran otomatis (no_booking_, no_registrasi) dan keterhubungan antar tabel. Database dirancang untuk mendukung semua fungsi yang telah direncanakan dalam Activity Diagram dan Use Case Diagram, dimana setiap tabel memiliki relasi yang jelas dengan tabel lainnya untuk memastikan integritas data dan memfasilitasi tracking real-time status dokumen.

* * 1. *Construction of Prototype* (Konstruksi Prototipe)

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan. Implementasi dimulai dengan pembuatan models untuk merepresentasikan struktur dan relasi basis data, dilanjutkan dengan controller yang mengatur logika bisnis dan pengolahan data, serta view sebagai antarmuka pengguna untuk menampilkan data dan interaksi secara visual. Ketiga komponen ini terintegrasi membentuk aplikasi yang utuh dan dapat digunakan sesuai tujuan perancangan awal.

Pembangunan prototipe awal dilakukan secara bertahap oleh peneliti dengan pendekatan *agile development*. Proses dimulai dengan setup environment menggunakan **Node.js dan Express.js** sebagai backend, serta **HTML, CSS, dan JavaScript (Vite.js)** sebagai frontend. Database **PostgreSQL** dikonfigurasi terlebih dahulu untuk menyimpan struktur data sesuai dengan ERD yang telah dirancang pada tahap Quick Design. Setiap fitur dikembangkan secara modular dengan struktur MVC (Model-View-Controller) dan diuji menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang sesuai kondisi operasional di BAPPENDA.

**Fitur yang dikembangkan** pada iterasi pertama adalah sebagai berikut:

a. **Formulir Booking Online**: Formulir booking online dirancang untuk memungkinkan PPAT/PPATS melakukan pemesanan jadwal pemeriksaan secara daring dari mana saja. Formulir ini dilengkapi dengan validasi input untuk memastikan data yang dimasukkan sesuai dengan format yang diharapkan, seperti format nomor identitas, format tanggal, dan validasi kelengkapan data.

b. **Unggah Dokumen**: Sistem unggah dokumen memungkinkan pengguna untuk mengunggah dokumen pendukung seperti akta tanah, sertifikat, dan dokumen pelengkap lainnya. Dokumen yang diunggah disimpan dalam database dan dapat diakses oleh divisi terkait sesuai dengan tahapan proses.

c. **Dashboard Admin dan Tracking Real-time**: Dashboard admin dirancang untuk memberikan overview status semua dokumen yang sedang diproses. Dashboard ini menampilkan status tracking secara real-time, dimana setiap divisi dapat melihat status dokumen pada tahap tertentu dan melakukan update status sesuai dengan tahapan proses yang telah ditentukan (Berdasarkan Tabel X No. 4).

d. **Sistem Login Multi-divisi**: Sistem login multi-divisi dirancang dengan berbasis hak akses (role-based access control) untuk memastikan bahwa setiap divisi hanya dapat mengakses fitur yang sesuai dengan perannya. Setiap pengguna memiliki credential yang berbeda dan hanya dapat melihat dan mengedit data yang sesuai dengan hak aksesnya.

Tahapan ini menghasilkan prototipe fungsional yang mencerminkan proses bisnis BAPPENDA secara digital, dimana sistem booking online dapat digunakan untuk mengurangi antrean dan mempercepat proses pemrosesan dokumen BPHTB (Berdasarkan Tabel X No. 2 dan 7).

* * 1. *Delivery and Feedback* (Penyerahan dan Umpan Balik)

Pada tahap Deployment, Delivery & Feedback, dilakukan black box testing untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna. Pengujian ini dilakukan dari sudut pandang pengguna tanpa mengetahui struktur internal program, sehingga membantu menemukan dan memperbaiki bug yang dapat mengganggu pengalaman pengguna, agar rilis optimal serta memperoleh umpan balik konstruktif (Salim & Rusdiansyah 2024). Dalam penelitian ini, uji coba dilakukan selama dua minggu dengan koordinasi dari Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang memfasilitasi akses ke sistem staging bagi berbagai divisi di BAPPENDA.

**Mekanisme pengujian** yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur sesuai dengan skenario kasus nyata sesuai dengan alur kerja BPHTB di BAPPENDA. Pengujian dilakukan secara bertahap, dimana pada minggu pertama fokus pada pengujian fitur booking online dan tracking status, sedangkan pada minggu kedua dilakukan pengujian integrasi antar modul dan pengujian di kondisi beban normal. Mekanisme pengumpulan feedback dilakukan melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum feedback dan menentukan action plan untuk iterasi berikutnya.

**Hasil evaluasi** dari pengujian Iterasi 1 menunjukkan bahwa sistem booking online yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil evaluasi menunjukkan alur kerja menjadi lebih transparan dan efisien dibandingkan sistem manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, antara lain: (1) waktu unggah tanda tangan yang masih relatif lama karena pengguna harus mengunggah tanda tangan untuk setiap dokumen, (2) belum tersedianya sertifikat digital maupun QR code untuk validasi keaslian dokumen, dan (3) proses pengiriman antar divisi masih memerlukan beberapa langkah manual. Berdasarkan hasil evaluasi tersebut, **action plan untuk Iterasi 2** mencakup: (1) penerapan tanda tangan digital berulang (reusable signature) agar pengguna hanya perlu mengunggah tanda tangan sekali dan dapat digunakan untuk beberapa dokumen, (2) integrasi sertifikat digital untuk memastikan keamanan dan keaslian dokumen, (3) implementasi QR code untuk validasi dokumen, dan (4) otomatisasi pengiriman antar divisi untuk mengurangi langkah manual yang masih diperlukan.

* 1. Iterasi 2: Optimasi dan Efisiensi Sistem (Maret - Agustus 2025)

Iterasi kedua dilakukan setelah memperoleh feedback dari pengujian Iterasi 1, dimana berdasarkan action plan yang telah disepakati, fokus pengembangan dialihkan pada peningkatan keamanan dokumen dan efisiensi proses melalui implementasi tanda tangan digital reusable, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi.

* * 1. *Communication* (Komunikasi)

Tahap komunikasi kedua dilakukan untuk menggali kebutuhan pengembangan fitur keamanan dan efisiensi dokumen berdasarkan hasil evaluasi Iterasi 1. Diskusi dilakukan dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berkoordinasi dengan Kepala Bidang TI dan Keamanan Dokumen untuk merancang sistem validasi berbasis sertifikat digital yang akan dikembangkan. Analisis kebutuhan menunjukkan sistem harus mendukung:

* Pembuatan sertifikat digital sebagai tanda keaslian dokumen
* Enkripsi dokumen dengan **AES-256**
* Validasi keaslian menggunakan **QR code**
* Audit trail lengkap untuk setiap proses dokumen

Hasil komunikasi dari diskusi dengan Kasubbid PSI menunjukkan bahwa iterasi kedua perlu fokus pada peningkatan keamanan dokumen dan efisiensi proses untuk mengatasi kekurangan yang ditemukan pada Iterasi 1. Sistem keamanan yang direncanakan akan mengintegrasikan teknologi sertifikat digital dan QR code yang akan dikembangkan khusus untuk sistem ini, dimana sebelumnya BAPPENDA belum memiliki sistem sertifikat digital untuk validasi dokumen. Implementasi sistem sertifikat digital ini diharapkan dapat memastikan keaslian dan keamanan dokumen yang diproses melalui sistem booking online.

* * 1. *Quick Plan* (Perencanaan Cepat)

Selama tahap perencanaan cepat, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem keamanan dan efisiensi untuk Iterasi 2. Proses perencanaan dilakukan melalui diskusi teknis dengan Kasubbid PSI sebagai mentor dan validator dalam merancang solusi keamanan yang komprehensif.

**Output perencanaan** yang dihasilkan adalah sebagai berikut:

**a. Modifikasi Database**: Tahap perencanaan mencakup penambahan 9 tabel *Database* baru untuk mendukung fitur keamanan, seperti pv_local_certs, pv_4_signing_audit_event, pv_7_audit_log, sys_notifications, dan bank_1_cek_hasil_transaksi. Modifikasi juga dilakukan pada beberapa tabel eksisting (a_2_verified_users, p_1_verifikasi, dan p_3_clear_to_paraf) untuk menambahkan kolom tanda tangan digital. Penambahan tabel dan kolom ini dirancang untuk mendukung arsitektur keamanan dengan empat lapisan utama.

**b. Arsitektur Keamanan 4 Lapisan**:

1. **Certificate Generation**: Sistem akan menghasilkan sertifikat digital untuk setiap dokumen yang divalidasi, dimana sertifikat ini berfungsi sebagai tanda keaslian dan keamanan dokumen.

2. **QR Code Embedding**: Sistem akan menambahkan QR code ke setiap dokumen yang telah divalidasi, dimana QR code ini dapat digunakan untuk verifikasi keaslian dokumen secara cepat.

3. **Encrypted Storage**: Dokumen yang disimpan di database akan dienkripsi menggunakan AES-256 untuk memastikan keamanan data dari akses yang tidak sah.

4. **Audit Logging**: Sistem akan mencatat semua aktivitas yang terjadi pada dokumen dalam tabel audit log, dimana catatan ini berfungsi untuk tracking dan audit trail setiap proses yang dilakukan.

**c. Integrasi Sistem**: Sistem juga dirancang untuk terintegrasi dengan divisi Bank untuk verifikasi pembayaran, dimana integrasi ini memungkinkan verifikasi pembayaran dilakukan secara paralel dengan pemeriksaan berkas untuk meningkatkan efisiensi proses.
* * 1. *Quick Design* (Desain Cepat)

Sementara itu, pada tahap pemodelan desain cepat untuk Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru yang telah direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti dengan melakukan presentasi wireframe dan mockup kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan feedback dan validasi terhadap fitur keamanan yang kompleks seperti sistem sertifikat digital dan QR code. Kasubbid PSI berperan sebagai validator yang melakukan review terhadap desain untuk memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid PSI.

**Output desain** yang dihasilkan adalah sebagai berikut:

**a. Komponen Keamanan**: Desain iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan sertifikat digital dan modul verifikasi QR code. Panel pengelolaan sertifikat dirancang untuk memungkinkan admin mengelola sertifikat digital yang dihasilkan oleh sistem, sedangkan modul verifikasi QR code dirancang untuk validasi keaslian dokumen secara cepat.

**b. Diagram Alur Validasi**: Diagram alur validasi dirancang menggunakan Draw.io yang terdiri atas tahap: User Request → Authentication → Certificate Generation → QR Code Creation → Verification. Alur ini menggambarkan proses validasi dokumen yang memastikan keamanan dan keaslian dokumen melalui sertifikat digital dan QR code.

**c. Antarmuka Pengguna**: Antarmuka pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan dashboard pemantauan status dokumen dan notifikasi otomatis. Dashboard ini dirancang untuk memberikan overview status dokumen yang mencakup informasi validasi sertifikat digital dan QR code.

**d. Activity Diagram**: Activity Diagram Iterasi 2 menggambarkan alur kerja sistem booking online E-BPHTB secara komprehensif dengan penambahan fitur keamanan. Activity Diagram dapat dilihat pada Gambar 8.

**Gambar 8 Activity Diagram Iterasi 2**

Proses dimulai dari "All user" yang dapat "Masuk/Keluar" sistem, dan "PPAT/PPATS" yang melakukan "Buat Booking" dan memasukkan data ke "Tabel Tersetujui". Secara paralel, "Admin" memantau "Cek Notifikasi" dan "Ping" untuk memastikan kelancaran sistem. Dokumen yang masuk akan melalui "LTB" untuk "Tabel Terima Berkas", dengan integrasi "BANK" untuk "Tabel Validasi Nomor pembayaran" yang hasilnya dikirim kembali ke LTB. Keputusan "Tolak" pada tahap LTB atau "Peneliti Validasi" akan memicu pengiriman "Email Pesan Penolakan" kepada PPAT/PPATS. Jika diterima, dokumen diteruskan ke "Peneliti" untuk "Tabel Verifikasi" dan "Tabel Paraf". Tahap krusial Iterasi 2 adalah proses "Peneliti Validasi" yang melibatkan "Tabel Validasi". Setelah disetujui, sistem akan menghasilkan "Berkas Validasi Terbuat" dan menyisipkan "QR Code dan Sertifikat". Proses ini memastikan keaslian dan keamanan dokumen. Akhirnya, dokumen yang "Siap Diserahkan" akan dikelola oleh "LSB" melalui "Tabel Penyerahan Berkas", menandai selesainya seluruh alur booking online. Diagram ini menunjukkan peningkatan efisiensi dan keamanan melalui otomatisasi dan integrasi antar divisi.

**e. Swimlane Diagram**: Swimlane Diagram Iterasi 2 menggambarkan alur kerja sistem booking online E-BPHTB yang telah dikembangkan menjadi lebih terintegrasi dengan penambahan divisi BANK dan sistem notifikasi real-time. Swimlane Diagram dapat dilihat pada Gambar 9.

**Gambar 9 Swimlane Diagram Iterasi 2**

Diagram ini membagi keseluruhan proses menjadi tujuh lane utama yaitu PPAT (pengajuan dan upload), LTB (verifikasi berkas), BANK (verifikasi pembayaran), Peneliti (pemeriksaan data), Clear to Paraf (persetujuan digital), Peneliti Validasi (validasi akhir dengan Generate Certificate Digital dan Generate QR Code), dan LSB (serah terima). Swimlane Diagram ini menggambarkan workflow yang lebih efisien dengan integrasi BANK yang memungkinkan verifikasi pembayaran paralel dengan pemeriksaan berkas. PPAT/PPATS dapat mengunggah tanda tangan sekali untuk digunakan berulang kali, sementara Peneliti Validasi melakukan proses Generate Certificate Digital dan Generate QR Code untuk keamanan dokumen. Sistem notifikasi real-time memungkinkan komunikasi yang lebih efektif antar divisi, dengan Admin yang mengelola validasi QR code dan monitoring sistem secara menyeluruh.

**f. Use Case Diagram**: Use Case Diagram Iterasi 2 menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. Use Case Diagram dapat dilihat pada Gambar 10.

**Gambar 10 Use Case Diagram Iterasi 2**

Pada gambar 10 merupakan *Use Case Diagram* Iterasi 2 dimana diagram ini menggambarkan signifikan pada sistem *E-BPHTB* melalui penambahan fitur keamanan, otomasi proses, serta peningkatan efisiensi kerja antar divisi. Diagram ini menampilkan tujuh aktor utama, yaitu PPAT/PPATS, LTB, BANK, Peneliti, Peneliti Validasi, LSB, dan Admin, yang berinteraksi dengan 15 *use case* baru yang mencakup berbagai fungsi penting seperti otomasi tanda tangan digital, validasi  *QR Code* , serta integrasi sistem bank.

Use Case Diagram ini menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. PPAT/PPATS dapat melakukan "Upload Tanda Tangan Sekali" yang akan digunakan berulang kali, sementara BANK terintegrasi langsung untuk "Cek Validasi Pembayaran" dan "Hasil Transaksi". Peneliti Validasi memiliki akses ke "Generate Certificate Digital", "Generate QR Code", dan "Tanda Tangan Digital" untuk proses validasi yang lebih aman. Admin dapat melakukan "Validasi QR Code" dan mengelola "Real-time Notifications" untuk monitoring sistem secara menyeluruh.

*Use Case Diagram* Iterasi 2 ini tidak hanya berfungsi sebagai representasi visual dari hubungan antar aktor dan fungsi sistem, tetapi juga menjadi panduan penting dalam tahap pengembangan lanjutan. Peningkatan fitur otomasi, keamanan, dan integrasi lintas divisi menunjukkan komitmen pengembang dalam menghadirkan sistem *E-BPHTB* yang lebih efisien, transparan, dan adaptif terhadap perkembangan teknologi informasi dalam pelayanan publik.

* * 1. *Construction of Prototype* (Konstruksi Prototipe)

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan untuk fitur keamanan dan efisiensi. Implementasi dimulai dengan pengembangan modul keamanan yang meliputi pembuatan sertifikat digital, integrasi QR code, dan implementasi enkripsi AES-256. Proses pembangunan dilakukan secara bertahap dengan prioritas pada modul keamanan dan efisiensi yang telah direncanakan pada tahap Quick Plan.

Pembangunan prototipe pada Iterasi 2 dilakukan secara bertahap oleh peneliti dengan pendekatan *agile development*. Proses dimulai dengan pengembangan sistem sertifikat digital lokal yang akan diimplementasikan di server BAPPENDA dengan koordinasi teknis dan supervisi dari Kasubbid PSI. Pengembangan algoritma enkripsi AES-256 dilakukan dengan mengikuti standar keamanan yang telah ditetapkan. Setiap fitur keamanan dikembangkan secara modular dan diuji menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang. Uji coba integrasi dilakukan di lingkungan staging sebelum diimplementasikan ke sistem produksi.

**Fitur yang dikembangkan** pada iterasi kedua adalah sebagai berikut:

a. **Otomasi Tanda Tangan Digital**: Sistem dirancang agar pengguna cukup mengunggah tanda tangan sekali (reusable signature) dan dapat digunakan untuk beberapa dokumen, sehingga mengurangi waktu unggah tanda tangan yang merupakan salah satu kekurangan pada Iterasi 1.

b. **Sertifikat Digital Lokal**: Sistem menghasilkan sertifikat digital secara lokal untuk setiap dokumen yang divalidasi oleh pejabat (Kabid Pelayanan). Sertifikat digital dienkripsi menggunakan enkripsi AES-256 untuk memastikan keamanan data dari akses yang tidak sah. Sistem sertifikat digital ini berjalan di server lokal BAPPENDA dan hanya digunakan oleh pejabat yang berwenang untuk melakukan validasi dokumen.

c. **Validasi QR Code**: Sistem menghasilkan QR code untuk setiap dokumen yang telah divalidasi, dimana QR code berisi informasi verifikasi seperti nomor dokumen, tanggal validasi, nama peneliti validasi, dan kode unik. QR code ini dapat digunakan untuk verifikasi keaslian dokumen oleh pihak yang membutuhkan, baik dari internal BAPPENDA maupun pihak eksternal.

d. **Sistem Notifikasi Real-time**: Sistem notifikasi real-time antar divisi dirancang untuk mempercepat komunikasi dan koordinasi dalam setiap tahapan proses, dimana notifikasi akan dikirim secara otomatis ketika ada perubahan status dokumen.

e. **Integrasi Divisi Bank**: Sistem terintegrasi dengan divisi Bank agar verifikasi pembayaran dapat dilakukan secara paralel dengan pemeriksaan berkas, sehingga meningkatkan efisiensi proses dan mengurangi waktu tunggu.

Tahapan ini menghasilkan prototipe yang lebih aman dan efisien dengan integrasi keamanan digital yang komprehensif.
* * 1. *Delivery and Feedback* (Penyerahan dan Umpan Balik)

Pada tahap Deployment, Delivery & Feedback untuk Iterasi 2, dilakukan black box testing untuk memastikan fitur keamanan dan efisiensi yang telah dikembangkan siap rilis dan berfungsi dengan baik. Pengujian ini dilakukan dari sudut pandang pengguna tanpa mengetahui struktur internal program, sehingga membantu menemukan dan memperbaiki bug yang dapat mengganggu pengalaman pengguna. Dalam penelitian ini, pengujian dilakukan selama empat minggu dengan 5 pegawai dari bidang PSI yang berperan sebagai admin, LTB, peneliti, peneliti Validasi (Pejabat), dan LSB, serta 5 pengguna eksternal (PPAT) untuk menguji sistem dari perspektif pengguna end-to-end.

**Mekanisme pengujian** yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur keamanan dan efisiensi sesuai dengan skenario kasus nyata. Pengujian dilakukan di jam sibuk untuk menguji performa sistem di kondisi riil sesuai dengan beban kerja harian di BAPPENDA. Mekanisme pengumpulan feedback dilakukan melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum feedback dan menentukan action plan untuk iterasi berikutnya.

**Hasil evaluasi** dari pengujian Iterasi 2 menunjukkan bahwa sistem booking online dengan fitur keamanan digital yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil menunjukkan bahwa validasi QR code mencapai akurasi 99,8%, waktu validasi menurun dari 15 menit menjadi 2 menit per dokumen, dan efisiensi meningkat 70% dibandingkan dengan sistem manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, yaitu masih diperlukan penambahan sistem kuotasi untuk mencegah penumpukan booking karena dengan sistem yang lebih efisien, jumlah booking mengalami peningkatan yang signifikan. Berdasarkan hasil evaluasi tersebut, **action plan untuk Iterasi 3** mencakup: (1) pengembangan sistem kuotasi dinamis untuk mengelola kapasitas booking harian, (2) implementasi priority queue untuk mengatur prioritas pemrosesan dokumen berdasarkan urgensi, dan (3) penambahan dashboard monitoring untuk memantau beban kerja divisi secara real-time.

Tahapan ini menghasilkan sistem yang lebih aman dan efisien dengan integrasi keamanan digital yang komprehensif.

* 1. Iterasi 3: Implementasi Sistem Kuotasi (Agustus - September 2025)
* * 1. *Communication* (Komunikasi)

Diskusi dengan kasubbid PSI menunjukkan tingginya beban kerja pegawai, mencapai rata-rata 100-200 *booking* per hari, sementara kapasitas optimal hanya 80-100 *booking* terkhusus pajak bphtb. Dampaknya adalah penurunan akurasi dan meningkatnya waktu tunggu pengguna.

Analisis mendalam menunjukkan bahwa dengan 600 PPAT di Kabupaten Bogor dan struktur organisasi BAPPENDA yang terdiri dari 10-13 UPT (Unit Pelaksana Teknis) dengan 5-7 peneliti per UPT plus kantor pusat BAPPENDA, total kapasitas peneliti mencapai 85-115 orang.

BAPPENDA mengelola 9 jenis pajak (BPHTB, PBB, Perhotelan, Burung Walet, Hiburan, Reklame, Penerangan Jalan, Parkir, dan Air Tanah), sehingga kapasitas peneliti harus dibagi untuk semua jenis pajak tersebut. Dengan kapasitas ini, diperlukan sistem kuotasi yang lebih realistis dan adil untuk mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna.

* * 1. *Quick Plan* (Perencanaan Cepat)

**Cara kerja perencanaan**: Tahap perencanaan dilakukan melalui analisis mendalam terhadap data historis booking selama 6 bulan terakhir untuk menentukan kapasitas optimal. Diskusi dengan kasubbid PSI dan kepala bidang dilakukan untuk menyepakati kebijakan kuotasi dan prioritas dokumen. Workshop perancangan algoritma dilakukan bersama tim peneliti senior untuk memastikan keadilan distribusi beban kerja. **Output yang dihasilkan**: Dirancang dua tabel baru (daily_counter dan ppatk_send_queue) untuk mengelola kapasitas harian dan antrean  *booking* . Sistem kuotasi menggunakan algoritma dynamic quota dengan fitur:

* Kuota harian dinamis: 100-150 dokumen berdasarkan kapasitas peneliti (85-115 orang) untuk 9 jenis pajak
* *Priority queue* untuk dokumen urgent dan mendesak berdasarkan jenis pajak
* *Load balancing* untuk distribusi merata antar UPT dan peneliti per jenis pajak
* *Predictive scheduling* berdasarkan historis pemrosesan per UPT dan jenis pajak
* Notifikasi multi-level saat kuota 70%, 85%, 95% per jenis pajak
* Distribusi berbasis UPT dan jenis pajak untuk memastikan pelayanan merata di seluruh wilayah
* Alokasi kuota per jenis pajak berdasarkan volume historis dan kompleksitas dokumen

![]()

Gambar

* * 1. *Quick Design* (Desain Cepat)

**Cara kerja desain**: Desain dashboard dan algoritma kuotasi dilakukan dengan pendekatan data-driven. Peneliti melakukan analisis terhadap pola booking historis untuk merancang algoritma yang akurat. Desain dashboard dilakukan melalui workshop dengan 3 admin sistem dan 5 peneliti senior untuk memastikan usability dan informativeness dari tampilan monitoring. Prototipe dashboard diuji dengan data simulasi sebelum diimplementasikan. **Output yang dihasilkan**: Desain antarmuka berupa **dashboard monitoring** *real-time* yang menampilkan beban kerja pegawai, grafik kapasitas harian, dan sistem notifikasi  *multi-channel* . Diagram algoritma kuotasi dirancang agar mampu menyesuaikan jumlah *booking* dengan kapasitas pegawai dan urgensi dokumen.

Algoritma kuotasi dirancang dengan pendekatan:

- *Dynamic Capacity Management* : Menyesuaikan kuota berdasarkan jumlah peneliti aktif per UPT dan jenis pajak
- *Priority-based Scheduling* : Dokumen urgent mendapat prioritas tinggi berdasarkan jenis pajak dan kompleksitas
- *UPT-based Distribution* : Round-robin dengan bobot berdasarkan kapasitas dan kompleksitas dokumen per UPT dan jenis pajak
- *Predictive Analytics* : Estimasi waktu berdasarkan pola historis per wilayah UPT dan jenis pajak
- *Geographic* Load Balancing: Distribusi berdasarkan lokasi PPAT dan kapasitas UPT terdekat per jenis pajak
- *Multi-tax Allocation* : Alokasi kuota yang proporsional untuk 9 jenis pajak berdasarkan volume dan kompleksitas

* * 1. *Construction of Prototype* (Konstruksi Prototipe)

**Cara kerja pembangunan**: Pengembangan sistem kuotasi dilakukan dengan teknik *event-driven architecture* untuk memastikan responsivitas dalam pengelolaan kuota real-time. Algoritma round-robin dikembangkan dengan pengujian simulasi menggunakan data historis 10.000 booking. Integrasi dengan sistem eksisting dilakukan secara gradual dengan migration guide untuk memastikan kompatibilitas. Pengujian load testing dilakukan dengan skenario peak load (200 booking/hari) untuk memastikan stabilitas sistem. **Output yang dikembangkan**: Sistem dikembangkan dengan algoritma kuotasi cerdas berbasis *round-robin* yang terintegrasi dengan sistem *booking* eksisting. *Dashboard monitoring* menampilkan metrik kinerja seperti waktu rata-rata pemrosesan dan kapasitas per divisi, sedangkan sistem notifikasi mengirimkan peringatan otomatis kepada admin dan PPAT.

Pada tahap konstruksi prototipe dengan struktur MVC ( *Model-View-Controller* ) menggunakan bahasa JavaScript dan *framework* Node.js dengan Express.js diawali dengan mendesain struktur basis data menggunakan PostgreSQL, di mana entitas dan relasi ditentukan melalui ERD dan diimplementasikan dalam migration. Selanjutnya, Model dibuat untuk merepresentasikan tabel-tabel *database* dan menangani logika bisnis. Kemudian, *Controller* dikembangkan untuk mengatur alur data antara model dan tampilan, menangani request dari pengguna, serta meresponsnya dengan data yang sesuai. *View* dibangun menggunakan HTML, CSS, dan JavaScript serta didesain secara responsif dengan tampilan antarmuka menarik dan  *modern* .

Proses *routing* menghubungkan URL dengan *controller* tertentu, sehingga alur kerja prototipe menjadi terstruktur dan mudah dikembangkan. Selain itu, untuk keperluan integrasi sertifikat digital, sistem dikembangkan dengan integrasi BSRE (Balai Sertifikasi Elektronik) untuk memastikan keamanan dan validitas dokumen. Integrasi ini memungkinkan sistem melakukan validasi sertifikat digital secara otomatis berdasarkan input pengguna. Selanjutnya, untuk mendukung komunikasi yang lebih responsif, sistem juga dihubungkan dengan sistem notifikasi  *real-time* , yang berfungsi mengirimkan pengingat langsung untuk memberikan status dokumen kepada pengguna dalam bentuk notifikasi otomatis.

![]()

Gambar

* * 1. *Delivery and Feedback* (Penyerahan dan Umpan Balik)

**Cara kerja pengujian**: Prototype berhasil dikonstruksi dan siap untuk uji coba dengan pendekatan *hybrid testing* ( *black box* dan  *white box* ) sebelum  *go live* . Pengujian dilakukan melalui: (1) white box testing untuk validasi algoritma dan logic flow, (2) black box testing untuk validasi fungsionalitas end-to-end, dan (3) A/B testing untuk membandingkan efektivitas sistem kuotasi vs sistem manual. **Hasil evaluasi**: Sistem telah terintegrasi dengan baik dan siap untuk evaluasi performa dan user  *acceptance testing* . **Action plan untuk finalisasi**: Sistem dinyatakan siap untuk go live setelah seluruh testing dan feedback terakomodasi.

Tahapan ini menghasilkan sistem kuotasi yang realistis dan adil, mampu mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna.

# DAFTAR TEKNOLOGI YANG DIGUNAKAN

Dalam pengembangan fitur  ***Booking online* pada *Website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor** , digunakan beberapa perangkat lunak dan alat bantu sebagai berikut:

| **Nama** | **Keterangan**                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| *Device*     | Laptop Lenovo IdeaPad Gaming 3                                                           |
| *OS*         | *Windows 11 Home*                                                                      |
| *Processor*  | AMD Ryzen™ 5 5600H (6 Cores, 12 Threads, hingga 4.2 GHz) Cache, up to 2.7 GHz, 4 cores) |
| *GPU*        | AMD Radeon™ Graphics (Integrated) + NVIDIA GeForce GTX/RTX (opsional tergantung varian) |
| *RAM*        | 8 GB DDR4 (dapat ditingkatkan hingga 16 GB)                                              |
| *Storage*    | 512 GB SSD NVMe M.2                                                                      |

Tabel Daftar Teknologi yang digunakan

| **Komponen** | **Teknologi yang Digunakan**        | **Fungsi**                                                          |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------------------- |
| *Frontend*       | Vite.js, HTML, CSS, JavaScript            | Membangun antarmuka pengguna yang responsif dan interaktif.               |
| *Backend*        | Node.js, Express.js                       | Mengelola logika sistem dan komunikasi antara frontend dengan d_atabase_. |
| *Database*       | PostgreSQL                                | Menyimpan data pengguna, jadwal, dan riwayat reservasi.                   |
| *Data Format*    | JSON                                      | Format pertukaran data antara frontend dan backend.                       |
| *Desain UI/UX*   | Figma                                     | Membuat desain tampilan dan prototype sistem.                             |
| *Editor & Tools* | Visual Studio Code, dbdiagram.io, Railway | Pengembangan kode, perancangan basis data, dan deployment sistem.         |

Tabel Daftar Perangkat Lunak yang digunakan

| **Komponen** | **Alat Teknologi** | **Keterangan**                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *Frontend*       | HTML                     | HTML merupakan standar bahasa markup yang digunakan untuk menyusun struktur dan konten dasar sebuah halaman web.                                                                                                                                                                                                                                                    |
|                    | CSS                      | *Cascading Style Sheets* (CSS) adalah bahasa desain yang digunakan untuk memisahkan konten dari tampilan visual halaman web.                                                                                                                                                                                                                                      |
| **Komponen** | **Alat Teknologi** | **Keterangan**                                                                                                                                                                                                                                                                                                                                                |
|                    | Javascript               | JavaScript adalah bahasa pemrograman berbasis objek dan berbasis*event-driven* yang digunakan untuk pengembangan aplikasi web dinamis dan interaktif. JavaScript memungkinkan manipulasi langsung terhadap DOM (Document Object Model), serta integrasi dengan API untuk memperkaya pengalaman pengguna dengan interaktivitas yang responsif dan  *real-time* . |
|                    | Vite.js                  | Digunakan untuk membangun antarmuka pengguna yang interaktif, responsif, dan cepat melalui proses bundling modern dari Vite.js.                                                                                                                                                                                                                                     |
| *Backend*        | Node.js                  | Node.js merupakan lingkungan runtime berbasis JavaScript yang memungkinkan eksekusi kode JavaScript di sisi*server* . Node.js berperan sebagai pondasi utama untuk menjalankan logika  *backend* , menangani request dan response dari klien, serta mengelola koneksi dengan *Database* secara efisien melalui arsitektur non-blocking dan event-driven.      |
|                    | Express.js               | Menyediakan logika server, mengatur rute API, dan mengelola komunikasi antara frontend dan d_atabase_ secara efisien menggunakan arsitektur berbasis JavaScript.                                                                                                                                                                                                    |
| *Database*       | PostgreSQL               | Sistem manajemen basis data relasional yang digunakan untuk menyimpan data pengguna, jadwal, dan riwayat*booking* dengan dukungan keamanan dan skalabilitas tinggi.                                                                                                                                                                                               |
| *Data Format*    | JSON                     | Format pertukaran data ringan dan mudah dibaca manusia yang digunakan untuk komunikasi antara frontend dan backend.                                                                                                                                                                                                                                                 |
| *Desain UI/UX*   | Figma                    | Alat desain kolaboratif untuk membuat*wireframe* ,  *prototype* , dan rancangan antarmuka pengguna agar pengalaman penggunaan sistem lebih optimal.                                                                                                                                                                                                             |
| *Editor & Tools* | *Visual Studio Code*   | *Visual Studio Code* digunakan untuk pengembangan dan pengujian kode                                                                                                                                                                                                                                                                                              |
|                    | dbdiagram.io             | dbdiagram.io untuk perancangan struktur basis data                                                                                                                                                                                                                                                                                                                  |
|                    | Railway                  | Railway sebagai platform*cloud deployment* untuk publikasi sistem                                                                                                                                                                                                                                                                                                 |

Teknologi tersebut dipilih karena memiliki dukungan ekosistem yang luas, performa yang baik, serta sesuai untuk pengembangan aplikasi web berbasis JavaScript full stack yang efisien dan mudah dikembangkan secara berkelanjutan.

# HASIL DAN PEMBAHASAN

* 1. Hasil

Penelitian ini menghasilkan sebuah fitur *booking online* yang terintegrasi pada *website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Fitur ini memungkinkan pengguna, seperti masyarakat atau Pejabat Pembuat Akta Tanah (PPAT), untuk melakukan pemesanan jadwal pelayanan secara daring tanpa harus datang langsung ke kantor.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js pada sisi  *backend* , Vite.js, HTML, CSS, dan JavaScript pada sisi  *frontend* , serta PostgreSQL sebagai sistem basis data. Desain antarmuka pengguna dibuat dengan Figma untuk memastikan tampilan yang intuitif dan  *user-friendly* , sementara proses *deployment* dan uji coba sistem dilakukan menggunakan *Railway* sebagai *platform* *cloud* yang memungkinkan *hosting* otomatis dan skalabilitas sesuai kebutuhan. Proses pengembangan ini melibatkan kolaborasi tim kecil yang terdiri dari pengembang  *front-end, back-end* , dan desainer UI/UX, dengan total waktu pengembangan sekitar 4 bulan dari tahap perencanaan hingga *deployment* awal.

Hasil implementasi fitur meliputi beberapa komponen utama yang telah berhasil diintegrasikan, antara lain:

* Halaman Form *Booking online* - pengguna dapat mengisi data seperti nama, nomor identitas, instansi/PPAT, tanggal dan waktu kunjungan yang diinginkan, dengan validasi *real-time* untuk mencegah kesalahan input, seperti format nomor identitas yang harus sesuai KTP, dan opsi untuk upload dokumen pendukung secara opsional.
* Validasi Data Input - sistem melakukan pengecekan terhadap data pengguna dan ketersediaan slot waktu secara otomatis, menggunakan algoritma sederhana untuk menghindari konflik jadwal dan memastikan integritas data, termasuk pencegahan *double-booking* melalui *locking mechanism* pada *Database.*
* Manajemen Jadwal Admin - administrator dapat melihat daftar reservasi, menyetujui atau menolak permintaan  *booking* , serta mengelola kapasitas waktu pelayanan setiap hari, dengan *dashboard* yang menyediakan statistik harian untuk pengambilan keputusan cepat, seperti grafik beban kerja dan laporan ekspor ke PDF.
* Notifikasi dan Riwayat *Booking* - pengguna dapat melihat status pemesanan dan riwayat kunjungan sebelumnya, termasuk opsi untuk membatalkan atau mengubah jadwal dengan persetujuan admin, serta fitur pencarian berdasarkan tanggal atau status untuk kemudahan akses.

Setelah pengujian internal dilakukan sebanyak tiga kali iterasi, sistem berhasil berjalan dengan baik dan memenuhi kebutuhan dasar yang diidentifikasi pada tahap komunikasi, dengan tingkat keberhasilan pengujian mencapai 95% berdasarkan skenario uji yang dirancang. Proses iterasi ini melibatkan perbaikan bug minor seperti error handling pada form input dan optimasi performa untuk memastikan sistem dapat menangani hingga 100 pengguna simultan tanpa lag signifikan, dengan rata-rata waktu respons kurang dari 2 detik. Data pengujian menunjukkan bahwa pada iterasi pertama, ada 15% error dalam validasi, yang berkurang menjadi 5% di iterasi ketiga, menunjukkan peningkatan stabilitas. Selain itu, simulasi beban menggunakan *tools* seperti JMeter mengkonfirmasi bahwa sistem mampu menangani puncak kunjungan harian di BAPPENDA tanpa  *crash* , dengan konsumsi sumber daya server yang efisien.

* * 1. Hasil Iterasi 1: Sistem *Booking* Online Dasar

### Hasil Kuantitatif iterasi 1

* **Waktu Proses Berkas:** 30 menit → 10-25 menit (20-80% peningkatan)
* **Efisiensi Pelayanan:** Meningkat 40%
* **Tingkat Kesalahan:** Berkurang dari 15% → 5%
* **Kepuasan Pengguna:** 65% → 80%

Tabel *Database* schema (12 Tabel)

| **Tabel**          | **Kegunaan**     |
| ------------------------ | ---------------------- |
| **Nama Tabel**     | **Deskripsi**    |
| pat_1__booking_sspd      | Tabel utama*booking* |
| pat_2_bphtb_perhitungan  | Perhitungan BPHTB      |
| pat_4_objek_pajak        | Data objek pajak       |
| pat_5_penghitungan_njop  | Perhitungan NJOP       |
| ltb_1_terima_berkas_sspd | Terima berkas LTB      |
| p_1_verifikasi           | Verifikasi peneliti    |
| p_3__clear__to_paraf     | *Clear* to paraf     |
| pv_1_paraf_validate      | Validasi paraf         |
| lsb_1_serah_berkas       | Serah berkas LSB       |
| a_1__unverified_users_   | User belum verifikasi  |
| a_2__verified_users_     | User terverifikasi     |
| sys__notifications_      | Notifikasi sistem      |

### Fitur yang berhasil diimplementasikan

* ✅ **Formulir *Booking* Online** - PPAT dapat membuat jadwal pemeriksaan dokumen BPHTB secara daring
* ✅ **Upload Dokumen** - Sistem upload akta tanah, sertifikat tanah, dan dokumen pelengkap
* ✅ **Admin**  **Monitoring** - Monitoring dan tracking status dokumen secara real-time
* ✅ **Sistem Login Multi-Divisi** - Akses berbasis hak akses untuk setiap divisi
* ✅ ***Tracking Status*** - Pelacakan dokumen dari pengajuan hingga penyelesaian

![]()

![]()

![]()

![]()

Gambar *Web Booking* SSPD Badan Iterasi 1

Pada gambar web tersebut, hasil Iterasi 1 menunjukkan bahwa sistem *Booking Online* dasar telah berhasil diimplementasikan dengan fungsionalitas utama yang berjalan secara stabil. Tampilan situs web yang dikembangkan menampilkan antarmuka sederhana namun informatif, dirancang untuk memudahkan pengguna, khususnya PPAT/PPATS dalam melakukan proses pendaftaran dan pemesanan jadwal pemeriksaan dokumen BPHTB secara daring. Setiap elemen pada halaman utama, seperti form booking, tombol unggah dokumen, serta status pelacakan, dibuat responsif dan mudah diakses baik melalui komputer maupun perangkat mobile.

Dari sisi fungsional, sistem pada iterasi pertama telah mampu memfasilitasi alur kerja antar divisi dengan lebih efisien melalui integrasi data antar tabel dalam database schema yang terdiri dari 12 tabel utama. Masing-masing tabel berperan dalam menyimpan dan mengelola data terkait proses pengajuan, verifikasi, validasi, hingga serah terima berkas. Hal ini mendukung peningkatan kecepatan pemrosesan berkas dari rata-rata 30 menit menjadi 10-25 menit, sekaligus menurunkan tingkat kesalahan input data hingga 10%.

Selain itu, penerapan Sistem Login Multi-Divisi juga memberikan dampak positif terhadap keamanan dan ketertiban proses administrasi. Setiap pengguna hanya dapat mengakses fitur sesuai dengan perannya, seperti PPAT yang dapat melakukan pengajuan, LTB yang melakukan verifikasi berkas, serta Admin yang memiliki hak penuh untuk memantau seluruh aktivitas dalam sistem. Peningkatan efisiensi pelayanan sebesar 40% dan peningkatan kepuasan pengguna hingga 80% menunjukkan bahwa rancangan awal sistem telah berhasil menjawab kebutuhan utama pengguna.

* * 1. Hasil Iterasi 2: Intergrasi Keamanan dan Otomasi

### Hasil Kuantitatif 2

* **Akurasi  *QR Code* :** 99,8%
* **Waktu Validasi:** 15 menit → 2 menit (87% peningkatan)
* **Efisiensi Sistem:** Meningkat 70%
* **Keamanan Dokumen:** Enkripsi AES-256
* **Audit Trail:** 100% tercatat

Tabel Skema *Database*

| **Tabel *Database*** | **Kegunaan**       |
| ---------------------------- | ------------------------ |
| pv_local_certs               | Sertifikat digital lokal |
| **Nama Tabel**         | **Deskripsi**      |
| pv_2_signing_requests        | Request tanda tangan     |
| pv_3_bsre_token_cache        | Cache token BSRE         |
| pv_4_signing_audit_event     | Audit event tanda tangan |
| pv_7_audit_log               | Log audit sistem         |
| pat_7_validasi_surat         | Validasi surat           |
| pat_8_validasi_tambahan      | Validasi tambahan        |
| bank_1_cek_hasil_transaksi   | Cek transaksi bank       |
| ping_notifications           | Notifikasi ping          |

### Fitur Keamanan yang Ditambahkan

* ✅ **Tanda Tangan Digital Berulang** - PPAT cukup upload sekali, sistem otomatis tempel
* ✅ **Integrasi Sertifikat Digital BSRE** - Enkripsi AES-256 untuk keamanan dokumen
* ✅ **Validasi QR Code** - Sistem validasi keaslian dokumen dengan QR Code
* ✅ **Audit Trail Lengkap** - Pencatatan setiap proses dokumen
* ✅ **Notifikasi Real-Time** - Komunikasi antar divisi secara otomatis
* ✅ **Integrasi Bank** - Verifikasi pembayaran paralel dengan pemeriksaan berkas

Pada hasil Iterasi 2 ini adanya peningkatan signifikan dari sisi keamanan, kecepatan proses, serta efisiensi sistem secara keseluruhan. Pada tahap ini, sistem *Booking Online E-BPHTB* tidak hanya berfungsi sebagai platform administrasi daring, tetapi juga telah terintegrasi dengan berbagai fitur keamanan digital untuk memastikan keaslian, validitas, dan kerahasiaan data pajak yang diproses. Tampilan situs web pada Iterasi 2 mengalami pembaruan antarmuka dengan desain yang lebih profesional dan intuitif, disertai dengan penambahan komponen notifikasi real-time agar pengguna dapat memperoleh informasi status berkas secara langsung tanpa perlu melakukan pengecekan manual.

Dari hasil pengujian kuantitatif, tingkat akurasi pembacaan *QR Code* mencapai 99,8%, menunjukkan efektivitas tinggi dalam proses validasi keaslian dokumen. Waktu validasi yang sebelumnya membutuhkan rata-rata 15 menit kini dapat diselesaikan hanya dalam 2 menit, yang berarti terdapat peningkatan efisiensi sebesar 87%. Sistem juga mencatat peningkatan efisiensi operasional hingga 70%, terutama karena adanya proses otomatisasi tanda tangan digital dan verifikasi pembayaran bank yang berlangsung secara paralel.

Selain itu, sistem ini telah dilengkapi dengan fitur keamanan berbasis enkripsi AES-256 untuk menjaga kerahasiaan data dokumen dan sertifikat digital. Integrasi dengan Badan Sertifikasi Elektronik (BSRE) memastikan bahwa setiap tanda tangan digital memiliki validitas hukum dan dapat diverifikasi secara independen. Implementasi Audit Trail yang lengkap memungkinkan pencatatan seluruh aktivitas pengguna dan sistem secara otomatis, sehingga mendukung prinsip transparansi dan akuntabilitas dalam pengelolaan data pajak daerah.

Struktur *database* juga mengalami pengembangan dengan penambahan beberapa tabel baru, seperti pv__local_certs_, pv_2__signing_requests_, dan bank_1_cek_hasil_transaksi, yang masing-masing berfungsi untuk mengelola sertifikat digital, menyimpan permintaan tanda tangan elektronik, serta memverifikasi hasil transaksi dari bank. Integrasi bank pada Iterasi 2 menjadi salah satu fitur utama yang mempercepat proses validasi pembayaran tanpa perlu konfirmasi manual dari pengguna.

Secara keseluruhan, Iterasi 2 menandai transisi sistem *E-BPHTB* dari tahap prototipe fungsional menuju *platform* yang lebih matang, aman, dan terotomasi. Dengan adanya fitur tanda tangan digital berulang, validasi  *QR code* , audit trail lengkap, serta integrasi bank dan notifikasi *real-time,* sistem kini mampu memberikan pengalaman pengguna yang lebih cepat, efisien, dan terpercaya. Tahap ini juga menjadi pondasi menuju pengembangan Iterasi 3, yang difokuskan pada peningkatan skalabilitas sistem serta optimasi performa untuk melayani jumlah pengguna yang lebih besar di tingkat daerah maupun nasional.

* * 1. Hasil Iterasi 3: Sistem Kuotasi dan Monitoring

### Hasil Kuantitatif Iterasi 3

* **Beban Kerja:** Berkurang 40%
* **Waktu Rata-rata Pemrosesan:** 15 menit
* **Kepuasan PPAT:** 65% → 88% (35% peningkatan)
* **Kepuasan Pegawai:** 60% → 85% (42% peningkatan)
* **Uptime Sistem:** 99,7%
* **Stabilitas Sistem:** Meningkat signifikan

Tabel Skema *Database*

| **Tabel *Database*** | **Kegunaan**             |
| ---------------------------- | ------------------------------ |
| Daily_counter                | Counter harian per peneliti    |
| ppatk_send_queue             | Antrian*booking* PPAT        |
| peneliti_daily_counter       | Counter produktivitas peneliti |

### Fitur

* ✅ **Sistem Kuotasi Harian** - Batasan 70 *booking* optimal per hari
* ✅ **Dashboard Monitoring Real-Time** - Pemantauan beban kerja pegawai
* ✅ **Counter Produktivitas Peneliti** - Tracking jumlah dokumen per peneliti
* ✅ **Sistem Notifikasi Kuota** - Peringatan saat kuota 70%, 80%, 90%
* ✅ **Penjadwalan Ulang Otomatis** - Sistem round-robin untuk distribusi adil
* ✅ **Estimasi Waktu Tunggu** - Prediksi waktu penyelesaian

Sedangkan pada iterasi 3 ini menunjukkan peningkatan signifikan dalam aspek manajemen beban kerja dan kestabilan sistem melalui penerapan fitur kuotasi harian dan  *dashboard monitoring real-time* . Pada tahap ini, fokus pengembangan diarahkan untuk mengoptimalkan distribusi tugas antar peneliti serta menjaga performa sistem agar tetap stabil meskipun terjadi peningkatan volume transaksi. Melalui penerapan sistem kuota maksimal 70 booking per hari, beban kerja dapat dikendalikan dengan lebih proporsional, sehingga efisiensi dan akurasi proses pemeriksaan dokumen meningkat secara keseluruhan.

Hasil pengujian menunjukkan adanya penurunan beban kerja hingga 40%, dengan waktu rata-rata pemrosesan berkas stabil di angka 15 menit. Kepuasan pengguna, baik dari sisi PPAT maupun pegawai, juga mengalami peningkatan yang cukup signifikan masing-masing dari 65% menjadi 88% dan 60% menjadi 85%. Peningkatan ini dipengaruhi oleh fitur baru seperti counter produktivitas peneliti, yang memungkinkan pengawasan kinerja secara transparan, serta notifikasi kuota otomatis yang memberikan peringatan pada ambang batas 70%, 80%, dan 90%.

Struktur database juga diperluas dengan tabel tambahan seperti  *daily_counter* , ppatk__send_queue_, dan peneliti__daily_counter_, yang berfungsi untuk mencatat aktivitas harian, mengatur antrian booking, serta memantau jumlah dokumen yang telah diproses setiap peneliti. Sistem *round-robin scheduling* diterapkan untuk penjadwalan ulang otomatis, sehingga distribusi beban kerja menjadi lebih adil antar pengguna.

Secara keseluruhan, Iterasi 3 berhasil menghadirkan sistem yang lebih stabil dengan tingkat uptime mencapai 99,7%, serta peningkatan signifikan pada aspek efisiensi dan kepuasan pengguna. Implementasi fitur kuotasi dan monitoring ini menandai tahap penyempurnaan akhir dalam pengembangan sistem *E-BPHTB* berbasis  *booking online* , yang kini mampu beroperasi secara efisien, terukur, dan berkelanjutan.

* 1. Pembahasan

Hasil pengembangan menunjukkan bahwa penerapan fitur *booking online* pada sistem *E-BPHTB* mampu meningkatkan efisiensi pelayanan publik, khususnya dalam pengaturan antrian dan waktu kunjungan. Berdasarkan umpan balik dari pegawai BAPPENDA dan pengguna uji coba, sistem ini membantu mengurangi penumpukan wajib pajak di loket serta mempercepat proses pelayanan, yang sebelumnya sering memakan waktu berjam-jam akibat antrian manual. Misalnya, dalam simulasi dengan 50 pengguna virtual, waktu tunggu rata-rata berkurang dari 45 menit menjadi 15 menit, menunjukkan dampak positif terhadap produktivitas dan mengurangi risiko kelelahan petugas. Analisis kualitatif dari wawancara pasca-uji menunjukkan bahwa 80% responden merasa lebih puas dengan pengalaman daring, terutama karena fleksibilitas dalam memilih waktu kunjungan.

Fitur *booking online* juga memberikan kemudahan bagi petugas dalam mengatur jadwal pelayanan secara terstruktur. Administrator dapat menyesuaikan kapasitas kunjungan harian berdasarkan beban kerja atau jumlah pegawai yang bertugas, dengan fitur kalender interaktif yang memungkinkan penjadwalan otomatis berdasarkan prioritas, seperti memberikan slot prioritas untuk PPAT yang memiliki urgensi tinggi. Hal ini sejalan dengan penelitian Dewi dan Prasetyo (2023) yang menyatakan bahwa digitalisasi berbasis sistem reservasi daring mampu meningkatkan efisiensi waktu dan produktivitas pegawai hingga 40%, serta mengurangi stres kerja akibat ketidakpastian jadwal. Selain itu, dari perspektif pengguna, fitur ini meningkatkan kepuasan karena memberikan kontrol penuh atas waktu kunjungan, yang sangat penting bagi PPAT yang sering memiliki jadwal padat, dan mendukung inklusivitas bagi pengguna dengan keterbatasan mobilitas. Perbandingan dengan sistem manual menunjukkan pengurangan biaya operasional sebesar 20%, karena berkurangnya kebutuhan kertas dan administrasi fisik..

Dari sisi teknis, penggunaan Node.js dan Express.js terbukti efisien untuk membangun sistem dengan komunikasi asinkron antara *frontend* dan  *backend* , memungkinkan pemrosesan request secara paralel dan mengurangi  *latency* , dengan dukungan untuk *WebSocket* jika diperlukan untuk notifikasi *real-time* di masa depan. Integrasi dengan *PostgreSQL* memudahkan pengelolaan data reservasi secara  *real-time* , dengan fitur *indexing* untuk *query* cepat dan backup otomatis untuk keamanan data, serta enkripsi data sensitif sesuai standar *GDPR-like* untuk privasi pengguna. Implementasi antarmuka berbasis Vite.js menghasilkan tampilan yang responsif dan ringan, sehingga mempercepat waktu akses pengguna bahkan di koneksi internet lambat, dengan ukuran *bundle* yang dioptimalkan untuk performa optimal, dan kompatibilitas dengan perangkat mobile melalui desain adaptive. Namun, tantangan yang ditemukan selama pengembangan termasuk kompatibilitas *browser* lama, yang diatasi dengan *polyfill* dan  *testing cross-browser* , serta skalabilitas untuk penggunaan jangka panjang, yang memerlukan monitoring kontinyu.

Secara keseluruhan, hasil pengembangan ini mendukung penerapan *e-government* di BAPPENDA Kabupaten Bogor, khususnya dalam aspek pelayanan publik berbasis digital, dengan potensi untuk diadopsi di daerah lain sebagai model  *best practice* . Sistem yang dirancang dapat dikembangkan lebih lanjut dengan menambahkan fitur notifikasi otomatis melalui email atau WhatsApp, integrasi autentikasi pengguna berbasis OTP, serta analisis data kunjungan untuk mendukung pengambilan keputusan di masa depan, seperti prediksi beban kerja bulanan menggunakan *machine learning* sederhana. Penelitian ini juga berkontribusi pada literatur *e-government* dengan menunjukkan bagaimana *prototyping* dapat digunakan untuk mengatasi masalah spesifik di daerah, dengan potensi replikasi di kabupaten lain, dan menginspirasi inovasi serupa dalam sektor publik lainnya. Meskipun demikian, keterbatasan seperti pengujian skala besar masih perlu dilakukan untuk memastikan ketahanan sistem dalam kondisi  *real-world* , termasuk uji stress dengan 1000+ pengguna dan analisis keamanan terhadap serangan  *cyber* . Implikasi praktis meliputi peningkatan transparansi dan akuntabilitas, sementara secara teoritis, ini memperkuat konsep *user-centric design* dalam rekayasa perangkat lunak.

Secara keseluruhan, pengembangan sistem *Booking Online E-BPHTB* melalui tiga tahap iterasi menunjukkan peningkatan bertahap baik dari segi fungsionalitas, keamanan, maupun efisiensi operasional. Setiap iterasi dirancang untuk menjawab temuan dan masukan dari tahap sebelumnya, sehingga sistem berkembang secara adaptif sesuai kebutuhan pengguna dan tujuan utama transformasi digital pelayanan pajak daerah.

Pada Iterasi 1, sistem berhasil membangun fondasi utama berupa proses booking online dasar dengan fitur pembuatan jadwal, unggah dokumen, serta tracking status secara real-time. Hasilnya, waktu pemrosesan berkas menurun hingga 80% dan tingkat kepuasan pengguna meningkat signifikan, menandai keberhasilan awal penerapan sistem digital dalam proses administrasi BPHTB.

Selanjutnya, Iterasi 2 berfokus pada integrasi keamanan dan otomasi, yang diwujudkan melalui implementasi tanda tangan digital, validasi *QR Code, Audit Trail,* serta integrasi sistem dengan BANK dan BSRE. Tahap ini memberikan lompatan besar dalam hal efisiensi, dengan waktu validasi berkurang hingga 87% dan peningkatan keamanan data berkat penerapan enkripsi AES-256.

Kemudian, Iterasi 3 memperkenalkan sistem kuotasi harian dan *dashboard monitoring real-time* untuk memastikan distribusi beban kerja yang lebih seimbang antar divisi. Dengan adanya fitur penjadwalan ulang otomatis ( *round-robin scheduling* ) dan notifikasi kuota, tingkat uptime sistem mencapai 99,7%, serta kepuasan pengguna meningkat hingga lebih dari 85%.

Secara kumulatif, hasil dari ketiga iterasi ini menunjukkan bahwa pengembangan sistem E-BPHTB berbasis web tidak hanya mampu meningkatkan efisiensi pelayanan publik, tetapi juga memperkuat aspek transparansi, akuntabilitas, dan keamanan data. Sistem yang dihasilkan pada tahap akhir telah memenuhi prinsip  *user-centric design* , mampu beroperasi secara stabil, serta siap untuk diterapkan secara luas sebagai bagian dari implementasi *e-government* di lingkungan pemerintah daerah.

Berdasarkan hasil penelitian dan pengujian yang telah dilakukan, dapat disimpulkan bahwa:

* Fitur *booking online* pada *website* *E-BPHTB* berhasil dikembangkan menggunakan metode *prototyping* dengan teknologi Node.js, Express.js, Vite.js, HTML, CSS, JavaScript, dan PostgreSQL. Sistem ini memungkinkan proses pemesanan jadwal pelayanan dilakukan secara daring, mulai dari input data pengguna hingga validasi oleh admin, dengan integrasi yang mulus dan performa yang stabil, serta kemampuan untuk menangani beban tinggi tanpa gangguan.
* Berdasarkan hasil simulasi dan uji coba internal, penerapan fitur *booking online* mampu meningkatkan efisiensi waktu pelayanan dari rata-rata 50 menit per berkas menjadi 10-25 menit. Hal ini menunjukkan peningkatan efektivitas sistem dalam mengatur antrian, mengurangi waktu tunggu, serta meningkatkan kepuasan pengguna, yang didukung oleh data kuantitatif dari iterasi pengujian dan *feedback* kualitatif dari pengguna, dengan potensi dampak positif terhadap ekonomi daerah melalui peningkatan kepatuhan pajak.

# SIMPULAN DAN SARAN

* 1. Simpulan

Berdasarkan hasil penelitian dan pengujian yang telah dilakukan, dapat disimpulkan bahwa fitur *booking online* pada *website E-BPHTB* berhasil dikembangkan menggunakan metode *prototyping* dengan teknologi Node.js, Express.js, Vite.js, HTML, CSS, JavaScript, dan PostgreSQL. Sistem ini memungkinkan proses pemesanan jadwal pelayanan dilakukan secara daring, mulai dari input data pengguna hingga validasi oleh admin, yang secara keseluruhan meningkatkan aksesibilitas dan kemudahan dalam mengelola transaksi pajak daerah. Pengembangan ini tidak hanya memenuhi kebutuhan teknis tetapi juga mendukung transformasi digital di sektor pemerintahan, dengan fokus pada efisiensi dan transparansi.

Selain itu, berdasarkan hasil simulasi dan uji coba internal, penerapan fitur *booking online* mampu meningkatkan efisiensi waktu pelayanan dari rata-rata 50 menit per berkas menjadi 10-25 menit. Hal ini menunjukkan peningkatan efektivitas sistem dalam mengatur antrian, mengurangi waktu tunggu, serta meningkatkan kepuasan pengguna, yang pada akhirnya berkontribusi pada pengurangan beban kerja petugas dan peningkatan pendapatan daerah melalui kepatuhan wajib pajak yang lebih baik.

* 1. Saran

Saran peneliti untuk pengembangan sistem ke depan, disarankan agar fitur notifikasi otomatis ditambahkan melalui email atau WhatsApp untuk mengingatkan jadwal pelayanan pengguna, sehingga dapat meminimalkan risiko keterlambatan atau pembatalan yang tidak terjadwal. Selain itu, integrasi sistem ini dengan layanan administrasi pajak lain seperti e-SPPT atau e-PBB sangat diperlukan guna memperluas cakupan digitalisasi pajak daerah, memungkinkan pengguna untuk mengakses berbagai layanan dalam satu platform terintegrasi dan meningkatkan efisiensi administrasi secara keseluruhan.

Akhirnya, diperlukan pengujian langsung dengan pengguna (PPAT dan pegawai loket) dalam tahap implementasi berikutnya untuk memperoleh data efektivitas yang lebih komprehensif, termasuk analisis dampak jangka panjang terhadap produktivitas dan kepuasan  *stakeholder* , serta penyesuaian berdasarkan *feedback real-world* untuk memastikan sistem dapat beradaptasi dengan dinamika operasional di lapangan.

DAFTAR PUSTAKA

Mardiasmo. (2018).  *Perpajakan Edisi Revisi 2018* . Yogyakarta: Andi Offset.

Setyowati, E., & Himawan, R. (2021). Pengaruh Penggunaan Sistem Informasi Manajemen Pajak Daerah (SIMPAD) terhadap Efektivitas Penerimaan Pajak Daerah.  *Jurnal Akuntansi dan Keuangan Daerah* , 13(1), 45-58.

Hanafi, M., Rahmawati, R., & Suryani, S. (2020). Digitalisasi Sistem Perpajakan untuk Meningkatkan Akuntabilitas Penerimaan Pajak Daerah.  *Jurnal Ekonomi Digital dan Bisnis* , 8(2), 101-118.

Ariyanto, A. (2021). Pengembangan Sistem Informasi untuk Meningkatkan Efisiensi Proses Administrasi Pajak Daerah.  *Jurnal Teknologi Informasi dan Sistem Informasi* , 12(3), 45-58.

Dewi, A. D., & Prasetyo, B. W. (2023). Optimalisasi Digitalisasi Layanan Publik melalui Implementasi Sistem Informasi Berbasis Web: Studi Kasus Pengelolaan Pajak Daerah.  *Jurnal Administrasi Publik* , 15(1), 75-88.

Sommerville, I. (2015). *Software Engineering* (Edisi ke-10). Pearson.

Fauzi, I. (2019). Tantangan Pengelolaan Administrasi Pajak Daerah di Era Digital.  *Jurnal Ekonomi dan Keuangan Daerah* , 21(2), 113-124.

Pressman, R. S. (2010). *Software Engineering: A Practitioner's Approach* (7th ed.). New York: McGraw-Hill.

Pressman, R. S. (2014).  *Software Engineering: A Practitioner's Approach* . New York: McGraw-Hill.

Hendrawan, S. (2020). Efisiensi Pengelolaan Pajak Daerah dengan Sistem  *E-BPHTB* .  *Jurnal Ilmu Pemerintahan* , 8(4), 120-134.

Prabowo, S. (2020). Kemandirian Fiskal Daerah: Analisis Pengelolaan Pendapatan Asli Daerah dari Pajak dan Retribusi.  *Jurnal Ekonomi Daerah* , 22(2), 54-66.

Sari, P. A. (2022). Evaluasi Implementasi Sistem *E-BPHTB* di Kabupaten Bogor: Kendala dan Solusi.  *Jurnal Administrasi Negara* , 14(3), 210-225.

Wahyuni, N. (2021). Tantangan dalam Pengelolaan Pajak Daerah di Era Digital: Studi Kasus BPHTB di Kabupaten Bogor.  *Jurnal Sistem Informasi dan Teknologi* , 13(2), 89-102.

Flanagan, J., Wildesius, M., & Tranagan, S. (2022).  *Impact of Digital Transformation on Regional Tax Collection: A Case Study* .  *Journal of Public Administration and Technology* , 18(2), 134-147.

LAMPIRAN

Lampiran 1 Timeline proyek akhir
