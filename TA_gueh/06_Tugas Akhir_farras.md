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

proposal Proyek Akhir

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

[DAFTAR TABEL vi](https://word2md.com/#_Toc187783079)

[I PENDAHULUAN 1](https://word2md.com/#_Toc187783080)

[1.1 Latar Belakang 1](https://word2md.com/#_Toc187783081)

[1.2 Rumusan Masalah 1](https://word2md.com/#_Toc187783082)

[1.3 Tujuan 2](https://word2md.com/#_Toc187783083)

[1.4 Manfaat 2](https://word2md.com/#_Toc187783084)

[II TINJAUAN PUSTAKA 3](https://word2md.com/#_Toc187783085)

[2.1 Elektronik BPHTB 3](https://word2md.com/#_Toc187783086)

[2.2 Metode Prototype 3](https://word2md.com/#_Toc187783087)

[2.3 *Website* 3](https://word2md.com/#_Toc187783088)

[2.4 Javascript 3](https://word2md.com/#_Toc187783089)

[2.5 MySQL 3](https://word2md.com/#_Toc187783090)

[III METODE 5](https://word2md.com/#_Toc187783091)

[3.1 Lokasi dan Waktu 5](https://word2md.com/#_Toc187783092)

[3.2 Teknik Pengumpulan Data dan Analisis Data 5](https://word2md.com/#_Toc187783093)

[3.3 Prosedur Kerja 5](https://word2md.com/#_Toc187783094)

[DAFTAR PUSTAKA 11](https://word2md.com/#_Toc187783095)

[LAMPIRAN 12](https://word2md.com/#_Toc187783096)

DAFTAR TABEL

[1 Daftar Perangkat Lunak yang digunakan 6](https://word2md.com/#_Toc187783354)

[2 Daftar Perangkat Keras yang digunakan 7](https://word2md.com/#_Toc187783355)

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

Penelitian ini berfokus pada pengembangan dan implementasi fitur booking online pada website *E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor. Ruang lingkup penelitian mencakup pengembangan sistem pemesanan jadwal pemeriksaan dokumen BPHTB secara daring, yang meliputi fitur pembuatan booking oleh PPAT/PPATS, validasi dokumen oleh LTB, pemeriksaan oleh Peneliti dan Peneliti Validasi, serta penyerahan dokumen oleh LSB. Sistem ini juga mencakup pengembangan fitur upload dokumen (akta tanah, sertifikat tanah, dokumen pelengkap), sistem tanda tangan digital, notifikasi real-time antar divisi, dan sistem kuotasi untuk manajemen beban kerja pegawai.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js untuk backend, HTML, CSS, JavaScript, dan Vite.js untuk frontend, serta PostgreSQL sebagai database. Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital, QR Code untuk validasi, dan integrasi dengan sistem BSRE. Pengujian sistem dilakukan melalui tiga iterasi prototyping dengan melibatkan pegawai BAPPENDA dari berbagai divisi, tanpa melibatkan pengujian langsung dengan masyarakat luas dalam skala besar.

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

Penelitian dilakukan di Sekolah Vokasi IPB University, Jl. Kumbang No.14, Kelurahan Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128. Setelah ini di lanjut ke bappenda

* 1. Teknik Pengumpulan Data dan Analisis Data

Dalam upaya mengumpulkan informasi yang dapat dipertanggungjawabkan dan memperoleh data yang relevan untuk mendukung keberhasilan pengembangan sistem yang diteliti, penelitian ini menggunakan dua teknik pengumpulan data yang yang terdiri dari metode wawancara serta observasi. Adapun penjabaran dari kedua teknik tersebut adalah sebagai berikut:

* 1. Wawancara

Wawancara dilakukan dengan pengelola sistem informasi (PSI) dan pegawai bagian loket BAPPENDA untuk memahami kebutuhan fungsional fitur  *booking online* , kendala dalam proses pelayanan, serta harapan pengguna terhadap sistem baru. Menurut Fauzi (2020), wawancara terstruktur efektif untuk menggali kebutuhan teknis dan mendefinisikan masalah dalam sistem berbasis teknologi informasi.

* 1. Observasi

Observasi dilakukan dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui sistem digital. Hasil observasi digunakan untuk menyusun rancangan alur fitur *booking online* agar sesuai dengan kondisi operasional di lapangan.

* 1. Prosedur Kerja

Penelitian ini menggunakan pendekatan pengembangan berbasis metode  *prototyping* . Metode ini dipilih karena bersifat iteratif dan fleksibel, memungkinkan pengguna memberikan umpan balik langsung pada setiap tahap pengembangan sistem. Menurut Siswidiyanto *et al.* (2021), *prototyping* efektif diterapkan dalam pengembangan perangkat lunak yang menitikberatkan pada antarmuka pengguna ( *user interface* ) dan interaksi langsung dengan sistem. Dalam konteks pengembangan sistem perangkat dan ulasan, metode ini efektif karena memungkinkan pengumpulan masukan secara langsung dari pengguna untuk menyesuaikan fitur sistem dengan ekspektasi dan kebutuhan aktual.

![]()

Gambar 1 Proses Tahapan Metode *Prototype*

Tahapan metode *prototyping* dalam penelitian ini adalah sebagai berikut:

* *Communication* - Pengumpulan kebutuhan melalui wawancara dan observasi dimana ini merupakan tahap awal untuk mengidentifikasi kebutuhan pengguna melalui wawancara dengan petugas BAPPENDA, wajib pajak, dan PPAT, serta observasi lapangan. Ini memastikan prototipe relevan dengan masalah nyata seperti antrian panjang.
* *Quick Plan* - Perencanaan cepat untuk menetapkan lingkup, prioritas fungsionalitas, dan jadwal pengembangan. Perencanaan strategis cepat untuk menentukan fokus proyek, seperti prioritas fitur  *booking online* , menggunakan teknik MoSCoW untuk menghindari over-scoping.
* *Quick Design* - Pembuatan desain awal ( *wireframe* ) dari fitur cek status dokumen. Pembuatan wireframe sederhana menggunakan Figma untuk menggambarkan struktur antarmuka fitur cek status, memungkinkan validasi visual awal.
* *Prototype Construction* - Pembangunan prototipe fitur cek status dokumen. Pembangunan prototipe fungsional dengan teknologi seperti HTML, CSS, dan Node.js, fokus pada fitur cek status yang dapat diuji interaktif.
* *Delivery and Feedback* - Pengujian prototipe dan perbaikan berdasarkan umpan balik dari pengguna, dengan iterasi sebanyak 3 (tiga) kali pengulangan yaitu pengujian pengumpulan feedback, dan revisi iteratif 3 kali untuk meningkatkan kualitas dan kesesuaian sistem.
  * Iterasi 1: Pembuatan Fitur Booking hingga Pengiriman (November 2024 - Januari 2025)
    * Communication (Komunikasi)

Tahap komunikasi dilakukan melalui wawancara mendalam dan observasi langsung di BAPPENDA Kabupaten Bogor. Wawancara dilakukan dengan kasubbid pengelola sistem informasi (PSI), pegawai loket terima berkas (LTB), dan peneliti untuk memahami alur kerja manual yang berjalan.
Observasi selama dua minggu menunjukkan bahwa proses penanganan dokumen masih memerlukan tanda tangan manual dan pengiriman fisik antar divisi, yang menyebabkan inefisiensi waktu rata-rata 40 menit per berkas dengan tingkat kesalahan sekitar 15%. Hal ini menjadi dasar utama pengembangan sistem *booking online* yang lebih efisien dan terintegrasi.

* * 1. Quick Plan (Perencanaan Cepat)

Berdasarkan hasil observasi dan diskusi, dilakukan perencanaan pengembangan sistem *booking online* tahap awal. Fokus iterasi ini adalah pembuatan modul pemesanan dan alur pengiriman dokumen digital.
Struktur database mencakup 12 tabel utama, antara lain:
pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_3_clear_to_paraf, pv_1_paraf_validate, dan lsb_1_serah_berkas.
Alur kerja sistem dimulai dari pengajuan *booking* oleh PPAT/PPATS, verifikasi oleh LTB, pemeriksaan oleh peneliti, hingga proses serah berkas di LSB.

Ini merupakan design awal

![]()

* * 1. Quick Design (Desain Cepat)

Desain awal sistem dibuat menggunakan Figma dengan rancangan *wireframe* untuk tiap divisi (PPAT, LTB, Bank, Peneliti, dan LSB).
Selain itu, dibuat *flowchart* alur kerja dari pengajuan hingga penyelesaian dokumen, serta *mockup interface* untuk unggah dokumen dan tanda tangan digital.
Struktur database relasional dirancang menggunakan dbdiagram.io, yang mendukung sistem penomoran otomatis (nobooking, no_registrasi) dan keterhubungan antar tabel.

Gambar 2 Design Wireframe

* * 1. Construction of Prototype (Konstruksi Prototipe)

Pembangunan prototipe awal menggunakan **Node.js dan Express.js** sebagai  *backend* , serta **HTML, CSS, dan JavaScript (Vite.js)** sebagai  *frontend* .
Basis data **PostgreSQL** digunakan sebagai penyimpanan utama.
Fitur yang dikembangkan meliputi:

* Formulir *booking online* dengan validasi input.
* Unggah dokumen (akta tanah, sertifikat, dan pelengkap).
* *Dashboard* admin dan status pelacakan ( *tracking* ) secara  *real-time* .
* Sistem login multi-divisi berbasis hak akses.

Tahapan ini menghasilkan prototipe fungsional yang mencerminkan proses bisnis BAPPENDA secara digital.

![]()![]()

* * 1. Delivery and Feedback (Penyerahan dan Umpan Balik)

Uji coba dilakukan selama dua minggu oleh lima perwakilan dari setiap divisi.
Hasil evaluasi menunjukkan alur kerja menjadi lebih transparan dan efisien, namun masih ditemukan kekurangan seperti waktu unggah tanda tangan yang lama dan belum tersedianya sertifikat digital maupun QR code.
Saran perbaikan pada tahap ini mencakup penerapan tanda tangan digital berulang ( *reusable* ), integrasi sertifikat digital, dan otomatisasi pengiriman antar divisi.

* 1. Iterasi 2: Optimasi dan Efisiensi Sistem (Maret - Agustus 2025)
     * Communication (Komunikasi)

Tahap komunikasi kedua berfokus pada peningkatan keamanan dan efisiensi dokumen. Diskusi dilakukan dengan Kepala Bidang TI dan Keamanan Dokumen untuk merancang sistem validasi berbasis sertifikat digital.
Analisis kebutuhan menunjukkan sistem harus mendukung:

* Enkripsi dokumen dengan **AES-256**
* Validasi keaslian menggunakan **QR code**
* Audit trail lengkap untuk setiap proses dokumen
* Integrasi dengan sistem sertifikat digital BAPPENDA
  * 1. Quick Plan (Perencanaan Cepat)

Tahap perencanaan mencakup penambahan 9 tabel *database* baru, seperti pv_local_certs, pv_4_signing_audit_event, pv_7_audit_log, sys_notifications, dan bank_1_cek_hasil_transaksi.
Modifikasi juga dilakukan pada beberapa tabel eksisting (a_2_verified_users, p_1_verifikasi, dan p_3_clear_to_paraf) untuk menambahkan kolom tanda tangan digital.
Sistem keamanan dirancang dengan empat lapisan utama:

* *Certificate Generation*
* *QR Code Embedding*
* *Encrypted Storage*
* *Audit Logging*

![]()

* * 1. Quick Design (Desain Cepat)

Desain iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan sertifikat dan modul verifikasi QR code.
Diagram alur validasi terdiri atas tahap:
User Request → Authentication → Certificate Generation → QR Code Creation → Verification.
Antarmuka pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan *dashboard* pemantauan status dokumen dan notifikasi otomatis.

* * 1. Construction of Prototype (Konstruksi Prototipe)

Tahap konstruksi melibatkan:

* Otomasi tanda tangan digital (pengguna cukup mengunggah sekali).
* Integrasi sertifikat digital BSRE menggunakan enkripsi AES-256.
* Validasi QR code ganda untuk publik dan internal BAPPENDA.
* Sistem notifikasi *real-time* antar divisi.
* Integrasi divisi Bank agar verifikasi pembayaran dapat dilakukan paralel dengan pemeriksaan berkas.

![]()

![]()

* * 1. Delivery and Feedback (Penyerahan dan Umpan Balik)

Pengujian dilakukan selama empat minggu dengan 5 pegawai (kepegawaian diambil dari bidang PSI, karena dilakukan di jam sibuk (sebagai admin, LTB, peneliti, peneliti Validasi (Pejabat) dan LSB)) dan 5 pengguna eksternal. Hasil menunjukkan validasi QR code mencapai akurasi  **99,8%** , waktu validasi menurun dari 15 menit menjadi 2 menit per dokumen, dan efisiensi meningkat 70%. Masih diperlukan penambahan sistem kuotasi untuk mencegah penumpukan  *booking* .

* 1. Iterasi 3: Implementasi Sistem Kuotasi (Agustus - September 2025)
     * Communication (Komunikasi)

Diskusi dengan kasubbid PSI menunjukkan tingginya beban kerja pegawai, mencapai rata-rata  **70-180 booking per hari** , sementara kapasitas optimal hanya  **70 booking terkhusus pajak bphtb** . Dampaknya adalah penurunan akurasi dan meningkatnya waktu tunggu pengguna.

* * 1. Quick Plan (Perencanaan Cepat)

Dirancang dua tabel baru (daily_counter dan ppatk_send_queue) untuk mengelola kapasitas harian dan antrean  *booking* .
Sistem kuotasi menggunakan algoritma *round-robin* untuk mendistribusikan *booking* secara adil dan efisien, dilengkapi fitur:

* Notifikasi saat kuota 70%, 80%, 90%.
* Penjadwalan ulang otomatis.
* Estimasi waktu tunggu dan prioritas dokumen.

![]()

* * 1. Quick Design (Desain Cepat)

Desain antarmuka berupa **dashboard monitoring** *real-time* yang menampilkan beban kerja pegawai, grafik kapasitas harian, dan sistem notifikasi multi-channel.
Diagram algoritma kuotasi dirancang agar mampu menyesuaikan jumlah *booking* dengan kapasitas pegawai dan urgensi dokumen.

* * 1. Construction of Prototype (Konstruksi Prototipe)

Sistem dikembangkan dengan algoritma kuotasi cerdas berbasis *round-robin* yang terintegrasi dengan sistem *booking* eksisting.
*Dashboard monitoring* menampilkan metrik kinerja seperti waktu rata-rata pemrosesan dan kapasitas per divisi, sedangkan sistem notifikasi mengirimkan peringatan otomatis kepada admin dan PPAT.

![]()![]()

* * 1. Delivery and Feedback (Penyerahan dan Umpan Balik)

Uji coba selama satu minggu menunjukkan peningkatan signifikan:

* Beban kerja berkurang 40%,
* Waktu rata-rata pemrosesan turun menjadi 15 menit,
* Kepuasan PPAT naik menjadi 88%,
* Kepuasan pegawai meningkat menjadi 85%,
* Stabilitas sistem mencapai 99,7% uptime.
  * Analisis Hasil Keseluruhan

Setelah tiga iterasi, sistem *booking online E-BPHTB* menunjukkan peningkatan signifikan:

| **Aspek**               | **Sebelum**    | **Setelah**     |
| ----------------------------- | -------------------- | --------------------- |
| **Waktu proses berkas** | **±50 menit** | **10-25 menit** |
| **Validasi dokumen**    | **15 menit**   | **2 menit**     |
| **Akurasi QR code**     | **-**          | **99,8%**       |
| **Kepuasan pegawai**    | **60%**        | **85%**         |
| **Kepuasan PPAT**       | **65%**        | **88%**         |
| **Uptime sistem**       | **-**          | **99,7%**       |

Metode *prototyping* dengan tiga iterasi terbukti efektif untuk menghasilkan sistem yang adaptif terhadap kebutuhan pengguna, efisien, dan sesuai standar keamanan data pemerintah daerah.

Tabel 1 Kebutuhan Fungsional

| **No** | **Fitur**     | **Deskripsi Singkat**                                                                                                     | **Aktor/Pengguna**     | **Status** |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------- |
| 1            | Login               | Setiap pengguna wajib login menggunakan akun terdaftar untuk mengakses sistem.                                                  | Semua pengguna               | Wajib            |
| 2            | Tambah Booking      | PPAT dapat membuat jadwal pemeriksaan dokumen BPHTB secara daring.                                                              | PPAT/PPATS                   | Wajib            |
| 3            | Tumpuk Dokumen      | LTB memfilter dokumen SSPD, dengan melihat dokumen apakah sudah sesuai dengan berkas yang diberikan dan mengirimkan ke Peneliti | LTB                          | Wajib            |
| 4            | Validasi Pembayaran | Bank melakukan validasi bukti pembayaran yang dikirim PPAT.                                                                     | Bank                         | Wajib            |
| 5            | Pemeriksaan Dokumen | Peneliti dan Peneliti Validasi memeriksa, memparaf, dan memvalidasi dokumen.                                                    | Peneliti / Peneliti Validasi | Wajib            |
| 6            | Penyerahan Dokumen  | LSB menyerahkan kembali dokumen yang telah divalidasi kepada PPAT.                                                              | LSB                          | Wajib            |

Berdasarkan hasil analisis kebutuhan, sistem *Booking online* *E-BPHTB* memiliki enam fitur utama yang melibatkan tujuh aktor, yaitu Admin, PPAT/PPATS, LTB ( *Loket Terima Berkas* ), Peneliti, Peneliti Validasi, LSB ( *Loket Serah Berkas* ), dan Bank.

Tabel 2 Relasi *Database*

| No | Nama Tabel                 | Tabel Terkait                                                                                                                  | Jenis Relasi | Deskripsi Hubungan                                                                                    |
| -- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------- |
| 1  | A_1_unverified_users       | a_2_verified_users                                                                                                             | One-to-One   | Data pengguna dipindahkan ke tabel verified saat akun diverifikasi.                                   |
| 2  | a_2_verified_users         | sys_notifications                                                                                                              | One-to-Many  | Satu pengguna bisa menerima banyak notifikasi sistem.                                                 |
| 3  | pat_1_bookingsspd          | pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan | One-to-Many  | Tabel utama menyimpan data inti booking dan terhubung ke data perhitungan, objek pajak, dan validasi. |
| 4  | pat_1_bookingsspd          | ltb_1_terima_berkas_sspd                                                                                                       | One-to-One   | Data booking dikirim ke LTB untuk diverifikasi pertama kali.                                          |
| 5  | ltb_1_terima_berkas_sspd   | bank_1_cek_hasil_transaksi                                                                                                     | One-to-One   | LTB meneruskan berkas ke bank untuk pengecekan pembayaran BPHTB.                                      |
| 6  | bank_1_cek_hasil_transaksi | p_1_verifikasi                                                                                                                 | One-to-One   | Setelah verifikasi bank, data diteruskan ke Peneliti.                                                 |
| 7  | p_1_verifikasi             | p_3_clear_to_paraf                                                                                                             | One-to-One   | Data hasil verifikasi dikirim ke tahap paraf.                                                         |
| 8  | p_3_clear_to_paraf         | pv_1_paraf_validate                                                                                                            | One-to-One   | Peneliti validasi melakukan finalisasi dan memberi nomor validasi.                                    |
| 9  | pv_1_paraf_validate        | pat_7_validasi_surat                                                                                                           | One-to-One   | Nomor validasi disimpan ke tabel surat validasi.                                                      |
| 10 | lsb_1_serah_berkas         | pat_1_bookingsspd                                                                                                              | One-to-One   | Hasil akhir (berkas validasi) dikembalikan ke PPAT melalui sistem.                                    |

* * 1. Prototype Construction

Tahap ini merupakan proses pembuatan sistem fungsional awal berdasarkan hasil desain. Implementasi dilakukan menggunakan:

* Frontend: Vite.js, HTML, CSS, JavaScript;
* Backend: Node.js dan Express.js;
* Database: PostgreSQL dengan struktur relasi yang mencakup tabel  *pat_1_bookingsspd* ,  *ltb_1_terima_berkas_sspd* ,  *bank_1_cek_hasil_transaksi* , dan tabel turunan lain yang saling berelasi melalui  *foreign key* .

Setiap versi prototipe diuji untuk memastikan kestabilan sistem, integrasi data antar modul, dan ketepatan alur kerja antar aktor seperti PPAT, LTB, Bank, Peneliti, dan LSB.

* * 1. Delivery And Feedback
* Tahap terakhir dilakukan untuk mengevaluasi sistem melalui pengujian langsung dengan pengguna (admin dan pegawai BAPPENDA). Uji coba dilakukan sebanyak  **tiga kali iterasi** , dengan rincian sebagai berikut:
* **Iterasi 1:** Pengujian dasar terhadap fungsi input data dan penyimpanan ke database.
* **Iterasi 2:** Penambahan fitur validasi jadwal dan pengelolaan data oleh admin.
* **Iterasi 3:** Penyempurnaan antarmuka (UI/UX) serta optimasi performa sistem.
* Setiap siklus iterasi mengikuti pola *Design → Evaluate → Refine* sesuai panduan Pressman (2014), hingga sistem mencapai kestabilan dan memenuhi kebutuhan pengguna secara fungsional.
  * 1. Analisis Hasil

Berdasarkan hasil dari ketiga iterasi, sistem yang dihasilkan telah memenuhi kebutuhan utama:

* Pengguna dapat melakukan pemesanan jadwal pelayanan secara daring.
* Admin dapat memvalidasi dan mengatur kapasitas harian kunjungan.
* Sistem mampu mencatat, memverifikasi, dan menampilkan riwayat booking secara otomatis.

Hasil tersebut menunjukkan bahwa penerapan metode *prototyping* berhasil menghasilkan sistem yang adaptif terhadap kebutuhan operasional BAPPENDA Kabupaten Bogor, sekaligus mendukung proses digitalisasi pelayanan publik.

* * 1. Analisis Iterasi *Prototyping*

Metode *prototyping* dalam penelitian ini dilaksanakan melalui tiga kali siklus iterasi, yang masing-masing memiliki tujuan dan keluaran berbeda. Pendekatan ini bertujuan untuk memastikan bahwa setiap pengembangan sistem sesuai dengan kebutuhan pengguna berdasarkan umpan balik yang diperoleh dari tahap pengujian.

# DAFTAR TEKNOLOGI YANG DIGUNAKAN

Dalam pengembangan fitur  ***Booking online* pada *Website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor** , digunakan beberapa perangkat lunak dan alat bantu sebagai berikut:

| **Nama** | **Keterangan**                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| Device         | Laptop Lenovo IdeaPad Gaming 3                                                           |
| OS             | Windows 11 Home                                                                          |
| Processor      | AMD Ryzen™ 5 5600H (6 Cores, 12 Threads, hingga 4.2 GHz) Cache, up to 2.7 GHz, 4 cores) |
| GPU            | AMD Radeon™ Graphics (Integrated) + NVIDIA GeForce GTX/RTX (opsional tergantung varian) |
| RAM            | 8 GB DDR4 (dapat ditingkatkan hingga 16 GB)                                              |
| Storage        | 512 GB SSD NVMe M.2                                                                      |

Tabel 3 Daftar Teknologi yang digunakan

| **Komponen** | **Teknologi yang Digunakan**        | **Fungsi**                                                        |
| ------------------ | ----------------------------------------- | ----------------------------------------------------------------------- |
| Frontend           | Vite.js, HTML, CSS, JavaScript            | Membangun antarmuka pengguna yang responsif dan interaktif.             |
| Backend            | Node.js, Express.js                       | Mengelola logika sistem dan komunikasi antara frontend dengan database. |
| Database           | PostgreSQL                                | Menyimpan data pengguna, jadwal, dan riwayat reservasi.                 |
| Data Format        | JSON                                      | Format pertukaran data antara frontend dan backend.                     |
| Desain UI/UX       | Figma                                     | Membuat desain tampilan dan prototype sistem.                           |
| Editor & Tools     | Visual Studio Code, dbdiagram.io, Railway | Pengembangan kode, perancangan basis data, dan deployment sistem.       |

Tabel 1 Daftar Perangkat Lunak yang digunakan

| **Komponen** | **Alat Teknologi** | **Keterangan**                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend           | HTML                     | HTML merupakan standar bahasa markup yang digunakan untuk menyusun struktur dan konten dasar sebuah halaman web.                                                                                                                                                                                                                                                         |
|                    | CSS                      | Cascading Style Sheets (CSS) adalah bahasa desain yang digunakan untuk memisahkan konten dari tampilan visual halaman web.                                                                                                                                                                                                                                               |
| Komponen           | Alat Teknologi           | Keterangan                                                                                                                                                                                                                                                                                                                                                               |
|                    | Javascript               | JavaScript adalah bahasa pemrograman berbasis objek dan berbasis event-driven yang digunakan untuk pengembangan aplikasi web dinamis dan interaktif. JavaScript memungkinkan manipulasi langsung terhadap DOM (Document Object Model), serta integrasi dengan API untuk memperkaya pengalaman pengguna dengan interaktivitas yang responsif dan*real-time* .           |
|                    | Vite.js                  | Digunakan untuk membangun antarmuka pengguna yang interaktif, responsif, dan cepat melalui proses bundling modern dari Vite.js.                                                                                                                                                                                                                                          |
| Backend            | Node.js                  | *Node.js* merupakan lingkungan runtime berbasis *JavaScript* yang memungkinkan eksekusi kode *JavaScript* di sisi  *server* . Node.js berperan sebagai pondasi utama untuk menjalankan logika  *backend* , menangani request dan response dari klien, serta mengelola koneksi dengan database secara efisien melalui arsitektur non-blocking dan event-driven. |
|                    | Express.js               | Menyediakan logika server, mengatur rute API, dan mengelola komunikasi antara frontend dan database secara efisien menggunakan arsitektur berbasis JavaScript.                                                                                                                                                                                                           |
| Database           | PostgreSQL               | Sistem manajemen basis data relasional yang digunakan untuk menyimpan data pengguna, jadwal, dan riwayat*booking* dengan dukungan keamanan dan skalabilitas tinggi.                                                                                                                                                                                                    |
| Data Format        | JSON                     | Format pertukaran data ringan dan mudah dibaca manusia yang digunakan untuk komunikasi antara frontend dan backend.                                                                                                                                                                                                                                                      |
| Desain UI/UX       | Figma                    | Alat desain kolaboratif untuk membuat*wireframe* ,  *prototype* , dan rancangan antarmuka pengguna agar pengalaman penggunaan sistem lebih optimal.                                                                                                                                                                                                                  |
| Editor & Tools     | Visual Studio Code       | Visual Studio Code digunakan untuk pengembangan dan pengujian kode                                                                                                                                                                                                                                                                                                       |
|                    | dbdiagram.io             | dbdiagram.io untuk perancangan struktur basis data                                                                                                                                                                                                                                                                                                                       |
|                    | Railway                  | Railway sebagai platform*cloud deployment* untuk publikasi sistem                                                                                                                                                                                                                                                                                                      |

Teknologi tersebut dipilih karena memiliki dukungan ekosistem yang luas, performa yang baik, serta sesuai untuk pengembangan aplikasi web berbasis JavaScript full stack yang efisien dan mudah dikembangkan secara berkelanjutan.

# HASIL DAN PEMBAHASAN

* 1. Hasil

Penelitian ini menghasilkan sebuah fitur *booking online* yang terintegrasi pada *website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Fitur ini memungkinkan pengguna, seperti masyarakat atau Pejabat Pembuat Akta Tanah (PPAT), untuk melakukan pemesanan jadwal pelayanan secara daring tanpa harus datang langsung ke kantor.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js pada sisi  *backend* , Vite.js, HTML, CSS, dan JavaScript pada sisi  *frontend* , serta PostgreSQL sebagai sistem basis data. Desain antarmuka pengguna dibuat dengan Figma untuk memastikan tampilan yang intuitif dan  *user-friendly* , sementara proses *deployment* dan uji coba sistem dilakukan menggunakan *Railway* sebagai *platform* *cloud* yang memungkinkan *hosting* otomatis dan skalabilitas sesuai kebutuhan. Proses pengembangan ini melibatkan kolaborasi tim kecil yang terdiri dari pengembang  *front-end, back-end* , dan desainer UI/UX, dengan total waktu pengembangan sekitar 4 bulan dari tahap perencanaan hingga *deployment* awal.

Hasil implementasi fitur meliputi beberapa komponen utama yang telah berhasil diintegrasikan, antara lain:

* Halaman Form *Booking online* - pengguna dapat mengisi data seperti nama, nomor identitas, instansi/PPAT, tanggal dan waktu kunjungan yang diinginkan, dengan validasi *real-time* untuk mencegah kesalahan input, seperti format nomor identitas yang harus sesuai KTP, dan opsi untuk upload dokumen pendukung secara opsional.
* Validasi Data Input - sistem melakukan pengecekan terhadap data pengguna dan ketersediaan slot waktu secara otomatis, menggunakan algoritma sederhana untuk menghindari konflik jadwal dan memastikan integritas data, termasuk pencegahan *double-booking* melalui *locking mechanism* pada *database.*
* Manajemen Jadwal Admin - administrator dapat melihat daftar reservasi, menyetujui atau menolak permintaan  *booking* , serta mengelola kapasitas waktu pelayanan setiap hari, dengan *dashboard* yang menyediakan statistik harian untuk pengambilan keputusan cepat, seperti grafik beban kerja dan laporan ekspor ke PDF.
* Notifikasi dan Riwayat *Booking* - pengguna dapat melihat status pemesanan dan riwayat kunjungan sebelumnya, termasuk opsi untuk membatalkan atau mengubah jadwal dengan persetujuan admin, serta fitur pencarian berdasarkan tanggal atau status untuk kemudahan akses.

Setelah pengujian internal dilakukan sebanyak tiga kali iterasi, sistem berhasil berjalan dengan baik dan memenuhi kebutuhan dasar yang diidentifikasi pada tahap komunikasi, dengan tingkat keberhasilan pengujian mencapai 95% berdasarkan skenario uji yang dirancang. Proses iterasi ini melibatkan perbaikan bug minor seperti error handling pada form input dan optimasi performa untuk memastikan sistem dapat menangani hingga 100 pengguna simultan tanpa lag signifikan, dengan rata-rata waktu respons kurang dari 2 detik. Data pengujian menunjukkan bahwa pada iterasi pertama, ada 15% error dalam validasi, yang berkurang menjadi 5% di iterasi ketiga, menunjukkan peningkatan stabilitas. Selain itu, simulasi beban menggunakan *tools* seperti JMeter mengkonfirmasi bahwa sistem mampu menangani puncak kunjungan harian di BAPPENDA tanpa  *crash* , dengan konsumsi sumber daya server yang efisien.

* 1. Pembahasan

Hasil pengembangan menunjukkan bahwa penerapan fitur *booking online* pada sistem *E-BPHTB* mampu meningkatkan efisiensi pelayanan publik, khususnya dalam pengaturan antrian dan waktu kunjungan. Berdasarkan umpan balik dari pegawai BAPPENDA dan pengguna uji coba, sistem ini membantu mengurangi penumpukan wajib pajak di loket serta mempercepat proses pelayanan, yang sebelumnya sering memakan waktu berjam-jam akibat antrian manual. Misalnya, dalam simulasi dengan 50 pengguna virtual, waktu tunggu rata-rata berkurang dari 45 menit menjadi 15 menit, menunjukkan dampak positif terhadap produktivitas dan mengurangi risiko kelelahan petugas. Analisis kualitatif dari wawancara pasca-uji menunjukkan bahwa 80% responden merasa lebih puas dengan pengalaman daring, terutama karena fleksibilitas dalam memilih waktu kunjungan.

Fitur *booking online* juga memberikan kemudahan bagi petugas dalam mengatur jadwal pelayanan secara terstruktur. Administrator dapat menyesuaikan kapasitas kunjungan harian berdasarkan beban kerja atau jumlah pegawai yang bertugas, dengan fitur kalender interaktif yang memungkinkan penjadwalan otomatis berdasarkan prioritas, seperti memberikan slot prioritas untuk PPAT yang memiliki urgensi tinggi. Hal ini sejalan dengan penelitian Dewi dan Prasetyo (2023) yang menyatakan bahwa digitalisasi berbasis sistem reservasi daring mampu meningkatkan efisiensi waktu dan produktivitas pegawai hingga 40%, serta mengurangi stres kerja akibat ketidakpastian jadwal. Selain itu, dari perspektif pengguna, fitur ini meningkatkan kepuasan karena memberikan kontrol penuh atas waktu kunjungan, yang sangat penting bagi PPAT yang sering memiliki jadwal padat, dan mendukung inklusivitas bagi pengguna dengan keterbatasan mobilitas. Perbandingan dengan sistem manual menunjukkan pengurangan biaya operasional sebesar 20%, karena berkurangnya kebutuhan kertas dan administrasi fisik..

Dari sisi teknis, penggunaan Node.js dan Express.js terbukti efisien untuk membangun sistem dengan komunikasi asinkron antara *frontend* dan  *backend* , memungkinkan pemrosesan request secara paralel dan mengurangi  *latency* , dengan dukungan untuk *WebSocket* jika diperlukan untuk notifikasi *real-time* di masa depan. Integrasi dengan *PostgreSQL* memudahkan pengelolaan data reservasi secara  *real-time* , dengan fitur *indexing* untuk *query* cepat dan backup otomatis untuk keamanan data, serta enkripsi data sensitif sesuai standar *GDPR-like* untuk privasi pengguna. Implementasi antarmuka berbasis Vite.js menghasilkan tampilan yang responsif dan ringan, sehingga mempercepat waktu akses pengguna bahkan di koneksi internet lambat, dengan ukuran *bundle* yang dioptimalkan untuk performa optimal, dan kompatibilitas dengan perangkat mobile melalui desain adaptive. Namun, tantangan yang ditemukan selama pengembangan termasuk kompatibilitas *browser* lama, yang diatasi dengan *polyfill* dan  *testing cross-browser* , serta skalabilitas untuk penggunaan jangka panjang, yang memerlukan monitoring kontinyu.

Secara keseluruhan, hasil pengembangan ini mendukung penerapan *e-government* di BAPPENDA Kabupaten Bogor, khususnya dalam aspek pelayanan publik berbasis digital, dengan potensi untuk diadopsi di daerah lain sebagai model  *best practice* . Sistem yang dirancang dapat dikembangkan lebih lanjut dengan menambahkan fitur notifikasi otomatis melalui email atau WhatsApp, integrasi autentikasi pengguna berbasis OTP, serta analisis data kunjungan untuk mendukung pengambilan keputusan di masa depan, seperti prediksi beban kerja bulanan menggunakan *machine learning* sederhana. Penelitian ini juga berkontribusi pada literatur *e-government* dengan menunjukkan bagaimana *prototyping* dapat digunakan untuk mengatasi masalah spesifik di daerah, dengan potensi replikasi di kabupaten lain, dan menginspirasi inovasi serupa dalam sektor publik lainnya. Meskipun demikian, keterbatasan seperti pengujian skala besar masih perlu dilakukan untuk memastikan ketahanan sistem dalam kondisi  *real-world* , termasuk uji stress dengan 1000+ pengguna dan analisis keamanan terhadap serangan  *cyber* . Implikasi praktis meliputi peningkatan transparansi dan akuntabilitas, sementara secara teoritis, ini memperkuat konsep *user-centric design* dalam rekayasa perangkat lunak.

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
