# PENGEMBANGAN SISTEM INFORMASI PEMESANAN JASA
# BERBASIS WEB DENGAN INTEGRASI PAYMENT GATEWAY
# DI PT. XYZ

Nama : Muhammad Hafidz Sidqi Riupassa
NIM : J
Hari/Tanggal : Kamis, 12 Maret 2026
Dosen Pembimbing : Prof. Dr. Ir. Sri Nurdiati, M.Sc.
Dosen Moderator : Dr. Medhanita Dewi Renanti, S.Kom., M.Kom.

**Menyetujui**

**Prof. Dr. Ir. Sri Nurdiati, M.Sc. : ____________________**

## PENDAHULUAN

Perkembangan teknologi informasi saat ini telah mendorong terjadinya transformasi
digital yang secara mendasar memengaruhi pertumbuhan ekonomi di Indonesia. Di era ini,
kapabilitas digital bukan lagi sekadar keunggulan kompetitif, melainkan telah bergeser menjadi
suatu prasyarat mutlak bagi keberlangsungan operasional sebuah perusahaan. Proses adopsi
digital ini mengalami akselerasi yang signifikan akibat pandemi COVID-19 yang berdampak
pada perubahan permanen perilaku konsumen ke arah transaksi daring ( _online_ ). Fenomena
tersebut didukung oleh tingginya tingkat penetrasi internet di Indonesia yang mencapai 79,5%
pada tahun 2024 (APJII 2024), yang menegaskan bahwa adaptasi teknologi merupakan
keharusan bagi pelaku usaha agar dapat tetap bersaing dan relevan di pasar yang semakin
dinamis.
PT. XYZ, sebagai perusahaan penyedia jasa pemasaran digital, saat ini masih
menghadapi kendala operasional karena proses transaksi penjualan jasanya masih
mengandalkan sistem pembayaran konvensional melalui transfer bank manual. Sistem ini
diidentifikasi sebagai sumber inefisiensi utama karena mengharuskan pelanggan melalui
beberapa tahapan pembayaran serta memerlukan proses verifikasi manual oleh staf, sehingga
sangat rentan terhadap risiko _human error_. Kondisi tersebut menciptakan kesenjangan besar
dengan preferensi mayoritas konsumen _e-commerce_ di Indonesia, yang mana data
menunjukkan sekitar 81% transaksi telah menggunakan _e-wallet_ dan 60% menggunakan
_virtual account_ pada tahun 2022 (Afista _et al._ 2024). Keterbatasan pilihan metode pembayaran
ini berisiko menyebabkan PT. XYZ kehilangan pelanggan potensial dan mengalami penurunan
pendapatan akibat ketidakmampuan memenuhi ekspektasi pasar.
Urgensi perbaikan sistem ini dipertegas oleh hasil survei pendahuluan terhadap 35
responden pelanggan aktif yang menunjukkan adanya kesenjangan signifikan antara harapan
pengguna dan kinerja aktual _website_. Mengacu pada total populasi klien PT. XYZ yang
berjumlah 52 klien, pemilihan responden dilakukan secara _purposive sampling_ , yaitu hanya
melibatkan pengguna yang telah melakukan transaksi minimal dua kali dalam tiga bulan
terakhir pada periode penelitian. Jumlah 35 responden tersebut berhasil merepresentasikan
sekitar 67% dari total keseluruhan klien PT. XYZ pada periode tersebut. Secara metodologis,
ukuran sampel ini telah memenuhi kriteria kelayakan untuk penelitian deskriptif menurut
Roscoe (1975) dalam Sekaran dan Bougie (2016), yang menyatakan bahwa jumlah sampel
antara 30 hingga 500 responden dianggap memadai.


Melalui pengolahan data survei menggunakan analisis _Importance Performance Analysis_
(IPA), ditemukan bahwa atribut kritis seperti ‘Kemudahan melakukan proses pembayaran’
(A9), ‘Kejelasan instruksi pembayaran’ (A8), dan ‘Kecepatan waktu verifikasi pembayaran’
(A10) memiliki tingkat kesesuaian kinerja yang rendah, masing-masing hanya sebesar 45,73%,
47,5%, dan 49,69%. Kesenjangan ini dipertegas oleh perbandingan nilai rata-rata, yang mana
tingkat kepentingan atribut kemudahan pembayaran (A9) dinilai sangat tinggi oleh pengguna
(4,68 dari 5), namun tingkat kinerjanya dinilai sangat rendah (2,14 dari 5). Data ini memberikan
bukti empiris bahwa sistem pembayaran yang ada saat ini menjadi sumber utama
ketidakpuasan pelanggan dan merupakan area kritis yang memerlukan perbaikan segera.
Berdasarkan permasalahan yang telah diuraikan, penelitian ini merumuskan masalah
pada bagaimana merancang sebuah sistem informasi pemesanan jasa berbasis _website_ yang
mampu mengatasi inefisiensi alur transaksi pada PT. XYZ. Selain itu, penelitian ini berfokus
pada bagaimana mengintegrasikan fitur pembayaran digital menggunakan _payment gateway_
untuk meningkatkan variasi metode pembayaran dan kepuasan pelanggan. Sejalan dengan hal
tersebut, tujuan utama dari penelitian ini adalah merancang sistem informasi pemesanan yang
fungsional serta mengimplementasikan teknologi pembayaran yang otomatis, aman, dan
selaras dengan kebutuhan pengguna.
Pendekatan penyelesaian masalah dilakukan melalui pengembangan sistem dengan
integrasi _payment gateway_ yang berfungsi sebagai perantara otomatis untuk memproses
transaksi antara pelanggan, perusahaan, dan lembaga keuangan secara aman. Penerapan
teknologi ini diharapkan dapat memberikan manfaat nyata berupa peningkatan kecepatan
pemrosesan transaksi, penjaminan akurasi pencatatan data penjualan, serta peningkatan
keamanan transaksi secara keseluruhan. Dari sisi pelanggan, implementasi ini bertujuan untuk
menyediakan berbagai alternatif metode pembayaran yang sesuai dengan preferensi pengguna
saat ini, sehingga mampu memberikan pengalaman transaksi yang lebih baik dan efisien
(Djuwitaningrum dan Jati 2025).

**WAKTU PELAKSANAAN**

Penelitian ini dilaksanakan pada dua lokasi utama. Proses pengambilan data dan studi
kasus difokuskan pada PT. XYZ, sebuah perusahaan pemasaran digital yang berlokasi di Kota
Bogor, Jawa Barat. Sementara itu, proses pengolahan, analisis data, perancangan, hingga
pengembangan dilakukan di Sekolah Vokasi IPB University, Jl. Kumbang No. 14, Kota Bogor.
Adapun keseluruhan rangkaian kegiatan penelitian ini berlangsung mulai bulan September
2025 hingga Maret 2026.

**METODE**

Pengembangan sistem dalam penelitian ini mengadopsi metode _prototyping_. Metode
ini memiliki pendekatan yang bersifat iteratif, yang mana proses pengembangan terdiri dari
siklus berulang yang mencakup tahapan: komunikasi untuk pengumpulan kebutuhan,
perencanaan, pemodelan desain, pembangunan prototipe, serta evaluasi oleh pengguna. Setiap
siklus bertujuan untuk menyempurnakan sistem hingga produk akhir benar-benar memenuhi
kebutuhan fungsional pengguna. Alur kerja dari model _prototyping_ ini divisualisasikan pada
Gambar 1.


```
Gambar 1 Prototyping process model (Pressman dan Maxim 2020)
```
**1.** **_Communication_**
    Tahap awal dilakukan untuk mengidentifikasi kendala pada proses transaksi manual di
PT. XYZ melalui observasi dan wawancara. Pada tahap ini juga dilakukan analisis
kebutuhan pengguna melalui survei pendahuluan untuk memetakan fitur-fitur prioritas yang
dibutuhkan oleh pelanggan, terutama yang berkaitan dengan sistem pembayaran.
**2.** **_Quick Plan_**
    Berdasarkan hasil komunikasi, disusun rencana kerja singkat yang berfokus pada
aspek-aspek yang akan terlihat oleh pengguna ( _user-visible aspects_ ). Perencanaan ini
memprioritaskan pengembangan modul katalog jasa dan skema integrasi _payment gateway_
sebagai solusi atas inefisiensi transaksi manual.
**3.** **_Modeling Quick Design_**
    Dilakukan pembuatan representasi desain yang difokuskan pada aspek antarmuka
pengguna, alur transaksi, serta arsitektur penyimpanan data sistem. Pemodelan fungsional
dan logika proses bisnis dipetakan menggunakan diagram UML ( _Use Case_ dan _Activity
Diagram_ ), sementara rancangan struktur _database_ relasional dimodelkan melalui _Entity
Relationship Diagram_ (ERD).
**4.** **_Construction of prototype_**
    Desain cepat yang telah dibuat direalisasikan ke dalam bentuk prototipe fungsional
(perangkat lunak yang dapat dioperasikan). Pengodean dilakukan menggunakan bahasa
pemrograman PHP dan _database_ MySQL, serta pengintegrasian API _payment gateway_
untuk menciptakan modul pembayaran otomatis yang menjadi inti dari sistem.
**5.** **_Deployment, Delivery, and Feedback_**
    Prototipe diserahkan kepada pihak PT. XYZ untuk dievaluasi melalui demonstrasi
sistem dan simulasi transaksi pada lingkungan _sandbox_. Pada tahap ini, pengujian kelayakan
fungsi sistem juga dilakukan menggunakan metode _Black Box Testing_ untuk memastikan
seluruh fitur berjalan sesuai spesifikasi. Umpan balik yang diperoleh dari pengguna
kemudian digunakan sebagai dasar untuk menyempurnakan kebutuhan sistem pada iterasi
berikutnya, guna memastikan hasil akhir selaras dengan ekspektasi operasional perusahaan.


## HASIL DAN PEMBAHASAN

**1.** **_Communication_**
    Pada tahap ini, dilakukan identifikasi kebutuhan melalui diskusi dengan manajemen
PT. XYZ dan analisis terhadap kendala operasional. Selain kebutuhan dari sisi pelanggan
untuk mempermudah transaksi (mengatasi skor 45,73%), diidentifikasi pula kebutuhan dari
sisi admin untuk mempermudah pengelolaan data. Hasil dari proses ini dirumuskan ke
dalam daftar kebutuhan fungsional sistem yang disajikan pada Tabel 1.

```
Tabel 1 Kebutuhan fungsional sistem
```
**2.** **_Quick Plan_**
    Berdasarkan hasil tahap komunikasi, disusun rencana pengembangan prototipe yang
berfokus pada aspek _user-visible_ sesuai dengan model _prototyping_ yang dikemukakan oleh
Pressman dan Maxim (2020). Pada tahap ini, ditetapkan strategi perancangan antarmuka
dengan pendekatan _Mobile-Oriented Interface_. Keputusan strategis ini didasarkan pada
tingginya penetrasi perangkat seluler di Indonesia, sebagaimana dipaparkan oleh Huda et al.
(2024) yang mencatat jumlah pengguna ponsel telah mencapai 214,5 juta jiwa pada tahun
2023. Data tersebut mengindikasikan bahwa perangkat _mobile_ telah bertransformasi
menjadi sarana primer masyarakat dalam mengakses layanan digital.
Hal ini diperkuat oleh Ariawan et al. (2020), yang menjelaskan bahwa perubahan
perilaku pengguna di era digital mendorong preferensi yang kuat terhadap akses informasi
dan aktivitas daring melalui gawai. Merujuk pada fakta empiris tersebut, antarmuka sistem
dirancang menggunakan struktur satu kolom ( _single-column layout_ ) agar proses pemesanan
jasa dapat dilakukan secara lebih terfokus, sistematis, dan nyaman pada layar berukuran
terbatas. Guna memitigasi rendahnya skor kemudahan pembayaran (45,73%), prioritas

```
Aktor Kebutuhan Fungsional Deskripsi
User
Melihat katalog jasa
```
```
Melakukan booking
```
```
Melihat riwayat booking
```
```
Melakukan pembayaran
otomatis
```
```
Notifikasi email
```
```
Pencarian & filtering
```
```
User dapat melihat layanan pemasaran digital yang
tersedia beserta detail deskripsi dan juga harganya.
User dapat melakukan pemesanan layanan dengan
mengisi formulir informasi pelanggan (Nama,
Nomor Telepon, Email ) serta memilih paket jasa
yang diinginkan.
User dapat melihat detail pesanan dan status
pembayaran yang telah dilakukan.
User dapat melakukan pembayaran secara otomatis
tanpa perlu unggah bukti pembayaran (VA, E-
Walle t, dsb.)
User menerima email notifikasi saat booking
berhasil dibuat dan saat booking telah dibayarkan.
User dapat mencari layanan menggunakan kata
kunci ( search ) serta melakukan penyaringan
( filter ) berdasarkan kategori dan bidang industri.
Admin Melakukan log in
Monitoring pesanan &
pembayaran
```
```
Notifikasi email
```
```
Mengelola data
```
```
Admin dapat masuk ke halaman dashboard admin.
Admin dapat memantau detail pesanan pelanggan
serta status pembayaran yang telah diperbarui
secara otomatis oleh sistem.
Admin mendapat email notifikasi saat ada
transaksi yang berhasil dibuat dan transaksi sukses.
Admin dapat mengelola ( Create, Read, Update,
Delete ) data katalog, industri, kategori.
```

```
utama diberikan pada implementasi fitur pembayaran otomatis di sisi user dan verifikasi
otomatis di sisi admin sebagai solusi inti otomasi transaksi. Untuk mendukung
fungsionalitas tersebut, fitur pencarian & filtering , katalog jasa, serta pemesanan
dikembangkan secara bersamaan agar alur transaksi dapat berjalan secara utuh.
Selanjutnya, fitur notifikasi email bagi pelanggan dikembangkan sebagai instrumen
transparansi status transaksi, sementara fitur monitoring pesanan dan manajemen data
diposisikan sebagai fungsi operasional pendukung. Fitur riwayat booking direncanakan
pada tahap akhir sebagai penyempurnaan layanan. Realisasi seluruh rencana ini didukung
oleh penggunaan framework Laravel, database MySQL, dan integrasi API Midtrans untuk
menjamin keamanan serta kecepatan transaksi digital.
```
**3.** **_Modeling Quick Design_**
    Tahap _modeling quick design_ merepresentasikan perancangan fungsionalitas, alur
proses, dan arsitektur data sistem secara terintegrasi. Interaksi antara aktor _User_ dan Admin
dipetakan melalui _Use Case Diagram_ (Gambar 2) untuk memastikan seluruh kebutuhan
fungsional terakomodasi secara sistematis. Guna mendetailkan mekanisme otomasi
transaksi, disusun _Activity Diagram_ (Gambar 3) yang memvisualisasikan alur integrasi
_payment gateway_ Midtrans dalam melakukan verifikasi status pesanan dan distribusi
notifikasi _email_ secara otomatis. Selanjutnya, arsitektur penyimpanan data
direpresentasikan melalui _Entity Relationship Diagram_ (ERD) pada Gambar 4 yang
menerapkan skema _guest checkout_. Struktur ini secara strategis memisahkan data
autentikasi pengelola dengan identitas pemesan guna mengoptimalkan kecepatan transaksi
tanpa kewajiban pendaftaran akun. Hal ini sejalan dengan riset yang dilakukan oleh
Baymard (2025), yang menyatakan bahwa kewajiban registrasi merupakan salah satu
hambatan prosedural utama yang memicu pembatalan transaksi hingga 19% karena
dianggap terlalu menyita waktu dan mengganggu privasi pengguna. Selain itu, perancangan
arsitektur data ini juga bertujuan untuk menjamin konsistensi informasi agar status
pembayaran pada sistem selalu sinkron dengan transaksi aktual di layanan pembayaran.

```
Gambar 2 Use case diagram
```

```
Gambar 3 Activity diagram
```
Gambar 4 _Entity Relationship Diagram_


**4.** **_Construction of Prototype_**
    Pada tahap ini, rancangan desain yang telah dimodelkan sebelumnya
diimplementasikan ke dalam kode program fungsional menggunakan _framework_ Laravel
dan _database_ MySQL. Konstruksi sistem ini menghasilkan _Web Application_ dengan
karakteristik _Mobile-Oriented Interface_. Tata letak antarmuka dioptimalkan pada resolusi
vertikal ( _portrait_ ) untuk menjamin konsistensi pengalaman pengguna ( _User Experience_ )
lintas perangkat. Desain ini mengedepankan prinsip ergonomi navigasi yang mendukung
aksesibilitas sentuh ( _touch-friendly_ ) pada perangkat seluler, sekaligus meningkatkan
efisiensi fokus visual ( _visual focus_ ) saat diakses melalui layar desktop.
Selanjutnya, proses pengembangan berfokus pada integrasi _Application Programming
Interface_ (API) Midtrans sebagai solusi otomatisasi pembayaran dan verifikasi transaksi
secara _real-time_. Konstruksi sistem ini menghasilkan prototipe aplikasi berbasis _web_ yang
responsif, mencakup modul katalog layanan, sistem pengisian data pelanggan, hingga
modul manajemen transaksi dan verifikasi pembayaran otomatis bagi admin. Berikut
merupakan hasil antarmuka dari prototipe sistem yang telah dibangun:

```
Gambar 5 Antarmuka katalog layanan Gambar 6 Antarmuka pengisian data
```

```
Gambar 7 Antarmuka ringkasan booking Gambar 8 Antarmuka snap midtrans
```
```
Gambar 9 Antarmuka manajemen transaksi admin
```
**5.** **_Deployment, Delivery, & Feedback_**
    Pada tahap akhir siklus _prototyping_ ini, sistem diserahkan kepada pengguna untuk
dievaluasi fungsionalitasnya melalui skenario penggunaan nyata. Penyerahan ( _delivery_ )
mencakup seluruh antarmuka fungsional, dimulai dari halaman katalog layanan yang
menyajikan pilihan jasa digital. Pelanggan kemudian diarahkan untuk mengisi data
identitas pada formulir informasi yang tersedia, yang selanjutnya divalidasi oleh sistem


melalui halaman ringkasan pemesanan sebelum pembayaran dilakukan. Proses transaksi
dijalankan melalui integrasi jendela pembayaran pihak ketiga yang menyediakan berbagai
opsi metode pembayaran otomatis.
Evaluasi dilakukan melalui pengujian _black box_ untuk memastikan seluruh unit
fungsional berjalan sesuai spesifikasi tanpa adanya hambatan teknis. Berikut adalah detail
hasil pengujian _black box testing_ yang disajikan pada Tabel 2.

```
Tabel 2 Hasil pengujian Black Box
Fungsi yang diuji Skenario Hasil yang diharapkan Status
Katalog Layanan Memilih kategori jasa
dan paket yang tersedia
pada antarmuka utama.
```
```
Sistem menampilkan rincian
paket, harga, dan deskripsi
secara akurat.
```
```
Berhasil
```
```
Informasi
Pelanggan
```
```
Menginput data
identitas diri, email, dan
kontak pada formulir
pemesanan.
```
```
Sistem memvalidasi
kelengkapan input dan
menyimpan data ke dalam
database.
```
```
Berhasil
```
```
Ringkasan Booking Meninjau rincian biaya
dan data identitas pada
halaman konfirmasi.
```
```
Sistem menyajikan rincian
biaya dan informasi
pelanggan yang sinkron
dengan tahap sebelumnya.
```
```
Berhasil
```
```
Integrasi
Pembayaran
```
```
Menekan tombol
pemicu pembayaran
untuk memanggil
antarmuka payment
gateway.
```
```
Muncul jendela integrasi
pembayaran yang
menyajikan berbagai
metode bayar digital.
```
```
Berhasil
```
```
Transaksi Digital Memilih metode
pembayaran otomatis
dan menyelesaikan
instruksi transaksi.
```
```
Sistem memproses transaksi
secara aman dan
meneruskan data ke
penyedia layanan.
```
```
Berhasil
```
```
Verifikasi Otomatis Sistem menerima
notifikasi otomatis
( callback ) setelah
transaksi dinyatakan
sukses.
```
```
Status transaksi pada sisi
admin secara otomatis
diperbarui tanpa intervensi
manual.
```
```
Berhasil
```
```
Notifikasi Email Memeriksa pengiriman
email otomatis ke
alamat pelanggan
setelah pembayaran
sukses.
```
```
Sistem mengirimkan detail
pesanan dan bukti
pembayaran ke email
pelanggan
```
```
Berhasil
```
```
Keamanan Admin Mencoba mengakses
halaman dashboard
tanpa melalui proses
otentikasi ( login ).
```
```
Sistem menolak akses dan
mengarahkan pengguna
kembali ke halaman utama
login.
```
```
Berhasil
```
```
Pencarian
Transaksi
```
```
Admin melakukan filter
atau pencarian data pada
daftar transaksi.
```
```
Sistem menampilkan data
pesanan yang spesifik
secara cepat dan akurat.
```
```
Berhasil
```
```
Histori Admin Pemantauan seluruh log
aktivitas transaksi yang
masuk ke sistem.
```
```
Seluruh informasi pesanan
tercatat secara kronologis
dengan atribut data yang
lengkap.
```
```
Berhasil
```

## SIMPULAN DAN SARAN

Berdasarkan hasil perancangan dan implementasi sistem informasi pemesanan jasa
berbasis _web_ , dapat ditarik simpulan bahwa sistem berhasil mengotomatisasi alur transaksi
melalui integrasi _Payment Gateway_ (Midtrans). Implementasi ini secara signifikan
menggantikan proses verifikasi manual, sehingga pembaruan status pesanan menjadi ' _Success_ '
dapat terjadi secara _real-time_ dan presisi. Dari sisi antarmuka, penerapan pendekatan _Mobile-
Oriented Interface_ secara teoretis terbukti efektif dalam menyajikan pengalaman pengguna
yang ergonomis dan konsisten, baik pada perangkat seluler maupun _desktop_ , sesuai dengan
karakteristik mayoritas pengguna yang mengakses layanan melalui gawai. Selain itu, fitur
notifikasi otomatis via _email_ dan _dashboard monitoring_ bagi admin telah menciptakan
transparansi informasi yang meminimalisir risiko kesalahan pencatatan data ( _human error_ )
dalam operasional bisnis.
Sebagai upaya penyempurnaan sistem di masa mendatang, terdapat beberapa aspek
strategis yang disarankan untuk dikembangkan. Pengembangan modul manajemen promosi
melalui fitur kode _voucher_ dan diskon direkomendasikan untuk mendukung strategi pemasaran
digital perusahaan dalam meningkatkan retensi pelanggan. Selain itu, fitur Ulasan dan Rating
perlu diperluas aksesibilitasnya dari pengelolaan manual oleh admin menjadi penilaian mandiri
oleh pelanggan ( _User-Generated Content_ ) guna menjamin otentisitas testimoni pasca-transaksi.
Guna mendukung akuntabilitas administrasi, sistem juga perlu dilengkapi dengan fitur Ekspor
Rekapitulasi Transaksi dalam format standar seperti PDF atau Excel. Fitur ini akan
mempermudah pengarsipan data secara berkala dan mendukung efisiensi penyusunan laporan
internal tanpa perlu melakukan penyalinan data secara berulang dari _dashboard_ sistem.

**DAFTAR PUSTAKA**

```
Afista TL, Fuadina AL, Aldi R, Nofirda FA. 2024. Analisis Perilaku Konsumtif Gen-Z
Terhadap Digital E-wallet DANA. Jurnal Pendidikan Tambusai. 8:3344–3350.
```
```
APJII. 2024 Feb 7. APJII Jumlah Pengguna Internet Indonesia Tembus 221 Juta Orang.
APJII ., siap terbit.
```
```
Ariawan MD, Triayudi A, Sholihati ID. 2020. Perancangan User Interface Design dan
User Experience Mobile Responsive Pada Website Perusahaan. JURNAL MEDIA
INFORMATIKA BUDIDARMA. 4(1):161. doi:10.30865/mib.v4i1.1896.
```
```
Baymard I. 2025. Reasons for Abandoning Online Purchases at Checkout. Institute
Baymard ., siap terbit.
```
```
Djuwitaningrum ER, Jati IBW. 2025. Implementasi Payment Gateway Midtrans pada
Website E-commerce Toko Buah dan Sayur Shop. Jurnal IPTEK. 9:19–24.
```
```
Huda N, Ayu D, Septyarini R. 2024. Outlook Ekonomi Digital 2025. Adhinegara BY,
editor. Center of Economic and Law Studies (Celios). http://www.celios.co.id.
```
```
Pressman RS, Maxim BR. 2020. SOFTWARE ENGINEERING: A PRACTITIONER’S
APPROACH. Ninth Edition. McGraw-Hill Education.
```
```
Sekaran U, Bougie R. 2016. Research Methods for Business: A Skill-Building Approach.
Ed ke-7th. John Wiley & Sons Ltd. http://www.wileypluslearningspace.com.
```

