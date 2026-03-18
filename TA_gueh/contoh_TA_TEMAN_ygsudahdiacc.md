## PENGEMBANGAN SISTEM PERINGKAT DAN ULASAN

## KATALOG DENGAN PENYARINGAN KOMENTAR

## TOKSIK DAN VISUALISASI KLASIFIKASI SENTIMEN

## OTOMATIS PADA WEBSITE PEMESANAN PT AGFI

## NISRINA ISHMAH MAHIRA

## TEKNOLOGI REKAYASA PERANGKAT LUNAK

## SEKOLAH VOKASI

## INSTITUT PERTANIAN BOGOR

## BOGOR

## 2025

## PERNYATAAN MENGENAI LAPORAN AKHIR DAN

## SUMBER INFORMASI SERTA PELIMPAHAN HAK CIPTA

Dengan ini saya menyatakan bahwa laporan akhir dengan judul
“Pengembangan Sistem Peringkat dan Ulasan Katalog dengan Penyaringan
Komentar Toksik dan Visualisasi Klasifikasi Sentimen Otomatis pada Website
Pemesanan PT AGFI” adalah karya saya dengan arahan dari dosen pembimbing
dan belum diajukan dalam bentuk apa pun kepada perguruan tinggi mana pun.
Sumber informasi yang berasal atau dikutip dari karya yang diterbitkan maupun
tidak diterbitkan dari penulis lain telah disebutkan dalam teks dan dicantumkan
dalam Daftar Pustaka di bagian akhir laporan akhir ini.
Dengan ini saya melimpahkan hak cipta dari karya tulis saya kepada Institut
Pertanian Bogor.

```
Bogor, Juli 2025
```

```
Nisrina Ishmah Mahira
J0 303211111
```

## ABSTRAK

NISRINA ISHMAH MAHIRA. Pengembangan Sistem Peringkat dan Ulasan
Katalog dengan Penyaringan Komentar Toksik dan Visualisasi Klasifikasi
Sentimen Otomatis pada Website Pemesanan PT AGFI. Dibimbing oleh KARLISA
PRIANDANA.

Peringkat dan ulasan pelanggan daring berperan penting dalam membentuk
persepsi publik terhadap produk kuliner, namun komentar toksik dapat merusak
reputasi dan pengalaman pengguna. Penelitian ini mengembangkan sistem
peringkat dan ulasan pada website pemesanan PT Ayam Goreng Fatmawati (AGFI)
dengan integrasi penyaringan komentar toksik dan visualisasi klasifikasi sentimen
otomatis. Sistem dikembangkan melalui metode prototipe. Penyaringan berbasis
aturan diterapkan untuk mendeteksi konten toksik, sementara klasifikasi sentimen
memanfaatkan pendekatan NLP menggunakan NLTK, TF-IDF, dan algoritma
Logistic Regression. Komentar dikategorikan ke dalam tiga jenis: positif, negatif
konstruktif, dan negatif non-konstruktif (toksik). Penyaringan komentar toksik
diterapkan pada halaman detail katalog sisi pelanggan, sedangkan visualisasi
klasifikasi sentimen tersedia di dashboard penilaian sisi admin untuk mendukung
pengambilan keputusan berbasis data dan menjaga kualitas interaksi digital.

Kata kunci: klasifikasi sentimen, komentar toksik, peringkat, prototipe, ulasan.

## ABSTRACT

NISRINA ISHMAH MAHIRA. Development of a Catalog Rating and Review
System Featuring Toxic Comment Filtering and Automated Sentiment
Classification Visualization on the PT AGFI Ordering Website. Supervised by
KARLISA PRIANDANA.

Online customer ratings and online customer reviews (OCRs) are crucial in
shaping public perception of culinary products, but toxic comments can damage
reputation and user experience. This research develops a rating and review system
for the PT Ayam Goreng Fatmawati (AGFI) ordering website, integrating toxic
comment filtering and automated sentiment classification visualization. The system
was developed through the prototype method. Rule-based filtering was applied to
detect toxic content, while sentiment classification utilized an NLP approach using
NLTK, TF-IDF, and the Logistic Regression algorithm. Comments were
categorized into three types: positive, constructive negative, and non-constructive
negative (toxic). Toxic comment filtering was applied on the customer-side catalog
detail page, while sentiment classification visualization was provided on the admin-
side review dashboard page to supports data driven decisions making and maintain
the quality of digital interactions.

Keywords: prototype, rating, review, sentiment classification, toxic comment.

## HALAMAN HAK CIPTA LAPORAN AKHIR

## © Hak Cipta milik IPB, tahun 202 5

## Hak Cipta dilindungi Undang-Undang

Dilarang mengutip sebagian atau seluruh karya tulis ini tanpa
mencantumkan atau menyebutkan sumbernya. Pengutipan hanya untuk
kepentingan pendidikan, penelitian, penulisan karya ilmiah, penyusunan laporan,
penulisan kritik, atau tinjauan suatu masalah, dan pengutipan tersebut tidak
merugikan kepentingan IPB.
Dilarang mengumumkan dan memperbanyak sebagian atau seluruh karya
tulis ini dalam bentuk apa pun tanpa izin IPB.

## PENGEMBANGAN SISTEM PERINGKAT DAN ULASAN

## KATALOG DENGAN PENYARINGAN KOMENTAR

## TOKSIK DAN VISUALISASI KLASIFIKASI SENTIMEN

## OTOMATIS PADA WEBSITE PEMESANAN PT AGFI

## NISRINA ISHMAH MAHIRA

```
Laporan Akhir
sebagai salah satu syarat untuk memperoleh gelar
Sarjana Terapan pada
Program Studi Teknologi Rekayasa Perangkat Lunak
```

## TEKNOLOGI REKAYASA PERANGKAT LUNAK

## SEKOLAH VOKASI

## INSTITUT PERTANIAN BOGOR

## BOGOR

## 2025

## HALAMAN PENGUJI PADA UJIAN LAPORAN AKHIR

Penguji pada ujian Laporan Akhir: Dr. Shelvie Nidya Neyman, S.Kom., M.Si.

Judul Laporan : Pengembangan Sistem Peringkat dan Ulasan Katalog dengan
Penyaringan Komentar Toksik dan Visualisasi Klasifikasi
Sentimen Otomatis pada Website Pemesanan PT AGFI.
Nama : Nisrina Ishmah Mahira
NIM : J0 303211111

## HALAMAN PENGESAHAN LAPORAN AKHIR

Disetujui oleh
Pembimbing:
Dr. Karlisa Priandana S.T., M.Eng.

```
Diketahui oleh
```

Ketua Program Studi:
Medhanita Dewi Renanti, S.Kom., M.Kom.
NPI 201807198305122001

Dekan Sekolah Vokasi:
Dr. Ir. Aceng Hidayat, M.T.
NIP 196607171992031003

Tanggal Ujian:
29 Juli 2025

```
Tanggal Lulus:
```

## PRAKATA

Puji syukur penulis panjatkan ke hadirat Allah Subhanahu wa Ta’ala atas
limpahan rahmat dan karunia-Nya sehingga penulisan laporan akhir ini dapat
diselesaikan dengan baik. Penelitian berjudul “Pengembangan Sistem Peringkat
dan Ulasan Katalog dengan Penyaringan Komentar Toksik dan Visualisasi
Klasifikasi Sentimen Otomatis pada Website Pemesanan PT AGFI” ini telah
dilaksanakan sejak bulan Januari hingga Mei 2025 berlokasi di Sekolah Vokasi IPB
University.
Penyusunan laporan akhir ini tidak lepas dari kontribusi berbagai pihak.
Penulis menyampaikan terima kasih yang sebesar-besarnya kepada Ibu Dr. Karlisa
Priandana, S.T., M.Eng., selaku dosen pembimbing, atas pembelajaran hidup,
arahan dan masukan konstruktif yang sangat berharga selama seluruh proses
magang dan penelitian. Ucapan terima kasih juga ditujukan kepada Ibu Faldiena
Marcelita, S.T., M.Kom., selaku dosen moderator saat pelaksanaan kolokium dan
Ibu Shelvie Nidya Neyman, S.Kom., M.Si, selaku dosen moderator saat
pelaksanaan seminar hasil sekaligus dosen penguji sidang akhir, atas waktu,
perhatian, dan kesempatan yang telah diberikan dalam evaluasi hasil penelitian ini.
Tidak lupa, penulis juga berterima kasih kepada Ibu Medhanita Dewi Renanti,
S.Kom., M.Kom., selaku Ketua Program Studi Teknologi Rekayasa Perangkat
Lunak, yang telah memberikan dukungan penuh serta memfasilitasi penulis dalam
memperoleh kesempatan magang di PT AGFI. Penghargaan juga penulis
sampaikan kepada Bapak Joni selaku Direktur, Bapak Muslih Jaelani selaku
Koordinator Admin sekaligus Pembimbing Lapang, Bapak Bibeng selaku Sales
Marketing, Ibu Yessi Leoni selaku HRD Manajer, Kak Tati selaku Sekretaris
Koordinator, serta seluruh staff PT AGFI yang telah memberikan pendampingan,
wawasan dan akses informasi selama proses pengumpulan data sampai
implementasi sistem di lingkungan kerja nyata. Selain itu, penulis juga berterima
kasih kepada keluarga tercinta atas doa, dukungan moral, dan kasih sayang yang
tak pernah putus dalam setiap langkah. Penulis juga menghargai kebersamaan dan
kontribusi teman-teman D4 Program Studi Teknologi Rekayasa Perangkat Lunak
Sekolah Vokasi IPB angkatan 2021. Secara khusus, penulis menyampaikan
apresiasi kepada Iswi Nur Pratiwi sebagai rekan kolaboratif selama magang, serta
Hasan Abdurrahman sebagai pembahas yang suportif selama kolokium dan seminar
hasil.
Penulis menyadari bahwa karya ini masih memiliki keterbatasan, namun
besar harapan penulis bahwa laporan akhir ini dapat memberikan kontribusi nyata
dalam pengembangan teknologi sistem peringkat dan ulasan digital yang lebih
informatif, khususnya di industri kuliner.

```
Bogor, Juli 2025
```

```
Nisrina Ishmah Mahira
```

## DAFTAR ISI

DAFTAR ISI xiii

DAFTAR TABEL xiv

DAFTAR GAMBAR xv

* I. PENDAHULUAN DAFTAR LAMPIRAN xvii
  * 1.1 Latar Belakang
  * 1.2 Rumusan Masalah
  * 1.3 Tujuan
  * 1.4 Manfaat
  * 1.5 Ruang Lingkup
* II. METODE
  * 2.1 Lokasi dan Waktu PKL
  * 2.2 Tahapan Penelitian
  * 2.3 Teknik Pengumpulan Data dan Analisis Data
  * 2.4 Prosedur Kerja
* III. HASIL DAN PEMBAHASAN
  * 3. 1 Hasil Iterasi Pertama
  * 3.2 Hasil Iterasi Kedua
* IV. SIMPULAN DAN SARAN
  * 4.1 Simpulan
  * 4.2 Saran
* DAFTAR PUSTAKA
* LAMPIRAN
* RIWAYAT HIDUP
* 1 Simbol-simbol use case diagram DAFTAR TABEL
* 2 Simbol-simbol Activity Diagram
* 3 Hasil Wawancara Iterasi Pertama
* 4 Kebutuhan Fungsional Iterasi Pertama
* 5 Relasi antar Entitas Website Pemesanan AGFI
* 6 Pengujian Sistem Iterasi Pertama
* 7 Hasil Wawancara Iterasi Kedua
* 8 Aspek-aspek penilaian pelanggan
* 9 Kebutuhan Fungsional Iterasi Kedua
* 10 Kata Kunci Komentar Non-Konstruktif
* 11 Contoh Dataset Dummy Komentar Pelanggan
* 12 Pengujian Sistem Iterasi Kedua
* 1 Tahapan Penelitian Fase PKL DAFTAR GAMBAR
* 2 Tahapan Penelitian Fase Proyek Lapoan Akhir
* 3 Analisis Data
* 4 Metode prototipe
* 5 Notasi Kardinalitas Crow’s Foot
* 6 Arsitektur Sistem Laravel
* 7 Pembagian Pengerjaan Website Pemesanan AGFI
* 8 Sketsa Rancangan Antarmuka Pengguna
* 9 Mock Up Rancangan Antarmuka Pengguna
* 10 Use case diagram peringkat dan ulasan bagian pelanggan
* 11 Use case diagram peringkat dan ulasan bagian admin
* 12 Activity diagram Iterasi Pertama
* 13 Entity Relationship Diagram sistem peringkat dan ulasan
* 14 Halaman Riwayat Pemesanan pada Akun Pelanggan
* 15 Halaman Pesanan pada Manajemen Order
* 16 Proses Menampilkan Seluruh Pesanan Pelanggan
* 17 Nilai Produk pada Halaman Riwayat Pemesanan
* 18 Beri Ulasan pada Halaman Riwayat Pemesanan
* 19 Menampilkan Satu Detail Pesanan Pelanggan
* 20 Halaman Penilaian Bagian Menunggu Penilaian
* 21 Halaman Penilaian Bagian Penilaian Saya
* 22 Lihat Detail pada Bagian Penilaian Saya
* 23 Cek Ulasan pada Bagian Penilaian Saya
* 24 Edit pada Bagian Penilaian Saya
* 25 Edit Ulasan pada Bagian Penilaian Saya
* 26 Halaman Penilaian Bagian Tanggapan Penjual
* 27 Cek Tanggapan Bagian Tanggapan Penjual
* 28 Lihat Detail Bagian Tanggapan Penjual
* 29 Edit Ulasan Bagian Tanggapan Penjual
* 30 Balas Bagian Tanggapan Penjual
* 31 Tampilan Menu Status Penilaian Masuk
* 32 Tampilan Menu Status Penilaian Tertunda
* 33 Tampilan Menu Status Penilaian Diubah
* 34 Tampilan Balas Penilaian oleh Admin
* 35 Tampilan Tanggapan Penjual oleh Admin
* 36 Implementasi Kode Program Status Penilaian
* 37 Implementasi Kode Program Status Penilaian Lanjutan
* 38 Pengambilan Token Fonnte untuk Integrasi API
* 39 Implementasi Kode Program Ingatkan dengan FonteeService
* 40 Tampilan Pesan Pengingat yang Terkirim dalam WhatsApp
* 41 Tampilan Menu Penilaian Produk
* 42 Lihat Penilaian Admin per Periode
* 43 Atur Penilaian Customer per Periode
* 44 Detail Penilaian Setiap Produk
* 45 Export Excel Rekap Penilaian Produk Per Periode Waktu
* 46 Tampilan Menu Rincian Penilaian
* 47 Implementasi Perhitungan Rata-rata Rating
* 48 Menu Terlaris halaman Beranda
* 49 Halaman Penilaian Admin
* 50 Lihat Detail Penilaian Admin
* 51 Detail Review Penilaian Admin
* 52 Implementasi Kode Program Penilaian Admin
* 53 Halaman Detail Katalog
* 54 Entity Relationship Diagram Iterasi Kedua
* 55 Activity Diagram Iterasi Kedua
* 56 Tahap Data Labeling
* 57 Implementasi Data Pre-Processing
* 58 Contoh Hasil Tahap Data Pre-Processing
* 59 Teknik TF-IDF dalam program klasifikasi sentimen
* 60 Pelatihan Model
* 61 Hasil Evaluasi Model Sentimen
* 62 Hasil Evaluasi Model Aspek
* 63 Menyimpan Model ke dalam file Joblib
* 64 Testing Model dengan Gradio
* 65 Implementasi Rule-Based Filtering
* 66 Testing Rule Based Filtering dengan Gradio
* 67 Alert Notifikasi Penyaringan Ulasan
* 68 Dashboard Penilaian Klasifikasi Aspek dan Sentimen
* 69 Database Probabilitas Aspek dan Sentimen
* 70 Integrasi Model dalam Sistem Peringkat dan Ulasan
* Lampiran 1 Timeline Proyek Akhir DAFTAR LAMPIRAN
* Lampiran 2 Dokumentasi Wawancara dengan Klien
* Lampiran 3 Proses Design Thinking & Pembuatan Bussines Model Canvas
* Lampiran 4 Tabel dalam database website pemesanan AGFI
* Lampiran 5 WordCloud Frekuensi Komentar Positif
* Lampiran 6 WordCloud Frekuensi Komentar Negatif Konstruktif
* Lampiran 7 WordCloud Frekuensi Komentar Negatif Non-Konstruktif
* Lampiran 8 Alur Sistem Pemesanan Website AGFI
* Lampiran 9 Alur Sistem Pemesanan Website AGFI Bagian Kedua
* Lampiran 10 Alur Autentikasi Pelanggan Sistem Website Pemesanan AGFI
* Lampiran 11 Alert Ulasan Tersimpan
* Lampiran 12 Alert Mengirim Ulasan
* Lampiran 13 Alert Berhasil Mengirim Ulasan
* Lampiran 14 Alert Kelengkapan Rating
* Lampiran 15 Alert Kelengkapan Ulasan
* Lampiran 16 Alert Konfirmasi Submit Ulasan
* Lampiran 17 Alert Edit Penilaian Saya
* Lampiran 18 Alert Berhasil Edit Penilaian Saya
* Lampiran 19 Berhasil Edit Ulasan Setelah Ditanggapi Penjual

## I. PENDAHULUAN

### 1.1 Latar Belakang

Kenyamanan telah menjadi mata uang baru dalam perilaku konsumsi
masyarakat modern. Di tengah ritme kehidupan yang serba cepat, konsumen
cenderung memilih layanan yang menawarkan kemudahan. Menurut data Asosiasi
Pelanggaran Jasa Internet Indonesia (APJII), tingkat penetrasi internet di Indonesia
pada tahun 2024 mencapai 79,5%, dengan 221.563.479 jiwa terhubung ke internet
dari total 278.696.200 jiwa. Tingginya penetrasi ini mendorong masyarakat beralih
dari belanja konvensional ke digital melalui e-commerce dan marketplace
(Febriyani et al. 2025). Kebiasaan bertransaksi langsung di meja kasir tergeser oleh
transaksi daring hanya dengan beberapa ketukan jari. Menurut Kementerian
Perdagangan, pengguna belanja daring diperkirakan naik 11,9%, dari 58,63 juta
orang pada 2023 menjadi 65,65 juta orang pada 2024. Nilai transaksinya mencapai
Rp 487 triliun, naik dari Rp 453 triliun pada 2023 (Arinda et al. 2025). Realitas ini
mendorong transformasi terutama industri makanan dan minuman dalam mengelola
dan menyesuaikan produk dan layanannya (Chatterjee et al. 2024). Pelaku usaha
tidak hanya dituntut mempertahankan kualitas cita rasa, tetapi juga beradaptasi
dengan pola konsumsi digital yang terus berkembang (Raysharie et al. 2025).
Menyajikan menu lezat saja tidak cukup. Keunggulan bisnis kuliner kini dinilai dari
kemudahan konsumen dalam memesan dan memperoleh makanan kapan pun dan
dari mana pun. Kemampuan merespons ekspektasi digital ini menjadi faktor
penting dalam keberlanjutan usaha kuliner.
Perubahan perilaku konsumsi ini dapat dijelaskan melalui perspektif
Baudrillard dkk. Menurut mereka, konsumsi tidak hanya didorong oleh kebutuhan
fungsional, tetapi juga dikendalikan oleh makna yang terkandung pada objek yang
dikonsumsi. Dalam konteks kuliner, makna ini dapat tercermin melalui penilaian
dan pengalaman konsumen sebelumnya. Di sisi lain, keputusan konsumsi juga tetap
dipengaruhi oleh faktor produksi seperti cita rasa, penyajian, kemasan, dan harga
yang ditawarkan. Selain itu, dalam perspektif struktural, konsumsi juga berkaitan
dengan simbol dan nilai yang merepresentasikan citra tertentu, termasuk bagaimana
layanan digital ditampilkan, penyajian katalog produk, hingga interaksi daring yang
membentuk pengalaman konsumen secara keseluruhan (Firmansyah dan
Subandiyah 2025).
Salah satu inovasi yang paling berkembang adalah platform e-commerce. E-
commerce atau perdagangan elektronik, merujuk pada proses jual beli barang dan
jasa melalui internet, yang memungkinkan transaksi dilakukan secara online tanpa
perlu tatap muka langsung (Tabaku et al. 2024). Dengan semakin berkembangnya
platform e-commerce, restoran kini mulai memanfaatkan teknologi digital untuk
meningkatkan pengalaman pelanggan serta memperluas jangkauan pasar (Lukita
2024). PT Ayam Goreng Fatmawati cabang Curugmekar, Bogor, yang telah
beroperasi sejak 1990, resmi meluncurkan platform e-commerce pada akhir tahun

2024. Kehadiran platform ini tidak hanya memudahkan pelanggan untuk
      melakukan pemesanan secara online, tetapi juga membantu pemilik restoran dalam
      mengelola pesanan dengan lebih terorganisir (Histiarini et al. 2024).
      Saat pertama kali mendigitalisasi restorannya, PT Ayam Goreng Fatmawati
      memilih website sebagai platform untuk menjalankan e-commerce mereka karena
      fleksibilitasnya dalam mengelola konten, serta kemudahan dalam mengintegrasikan

berbagai sistem, seperti katalog produk, dan pemesanan. Website memberikan
pengalaman pengguna yang dapat disesuaikan dengan kebutuhan konsumen
maupun operasional restoran. Desain website yang baik berkontribusi pada

## peningkatan pemasaran dan penjualan (Ali et al. 2024). Selain itu, website memiliki

keunggulan dapat diakses melalui berbagai browser tanpa memerlukan unduhan
aplikasi tambahan, sehingga lebih hemat memori perangkat pengguna (Fichte dan
York 2024). Pilihan ini juga dianggap lebih praktis, karena pengguna tidak perlu
khawatir tentang pembaruan aplikasi atau kendala kompatibilitas perangkat.
Pengelolaan dan pembaruan website relatif lebih sederhana dibandingkan dengan
aplikasi mobile, yang memerlukan pengembangan dan pemeliharaan dengan lebih
kompleks. Meskipun website menawarkan berbagai peluang dalam pemasaran
daring, seperti pemberdayaan, penghapusan batasan geografis, ketersediaan 24/7,
efektivitas biaya, keterlacakan, dan personalisasi. Namun, penggunaan website juga
menghadirkan tantangan, termasuk isu integritas, kurangnya interaksi langsung,
rendahnya tingkat kepercayaan, serta masalah keamanan dan privasi (Parviainen
2024).
Halaman detail katalog produk pada sistem pelanggan website Ayam Goreng
Fatmawati telah dirancang dengan baik dan menyajikan informasi lengkap
mengenai menu produk. Meskipun demikian, pelanggan masih sering mengalami
ketidakpastian saat memilih produk yang akan dipesan. Keraguan ini terutama
dirasakan saat mencoba menu baru dalam sistem pemesanan online, karena
kurangnya referensi atau umpan balik (feedback) yang cukup dari pelanggan lain
yang telah berpengalaman mencicipi produk tersebut sebelumnya (Acintya dan
Mirzanti 2024). Menurut Greene et al. (2024), strategi berbasis popularitas atau
popularity-based strategy menunjukkan bahwa pelanggan sering mencari menu
yang paling populer, seperti 'best seller' atau 'quick seller', untuk meminimalkan
risiko ketidakpuasan. Selain itu, keputusan pelanggan juga sering dipengaruhi
secara sosial atau socially influenced strategies, baik melalui rekomendasi teman,
keluarga, atau pelanggan lain. Hal ini berpotensi mengurangi tingkat konversi
pembelian dan menurunkan loyalitas pelanggan.
Keputusan pembelian secara penuh merupakan suatu proses yang berasal dari
semua pengalaman mereka dan pembelajaran, memilih yang paling sesuai dengan
preferensi, menggunakan, dan bahkan menyingkirkan suatu produk (Rahmawati
2025). Faktor-faktor seperti customer review, customer rating, dan promosi
penjualan berperan besar dalam mempengaruhi keputusan pembelian. Online
customer reviews (OCRs) adalah ulasan yang ditulis konsumen berdasarkan
pengalaman mereka setelah membeli produk. Ulasan ini membantu calon pembeli
menilai kualitas produk dari perspektif pengguna sebelumnya. Online customer
rating merupakan bagian dari online customer review yang mewakili pendapat
pelanggan pada skala tertentu dalam bentuk simbol bukan menggunakan kalimat.
Simbol yang digunakan biasanya adalah simbol bintang. Semakin tinggi atau
banyak simbol rating menunjukkan semakin baik nilai produk tersebut dan dapat
mempengaruhi konsumen untuk membelinya (Santika et al. 2025).
Konsumen sangat mengandalkan penilaian sebagai pertimbangan dalam
pengambilan keputusan, sehingga dapat menjadi peluang dan juga ancaman bagi
perusahaan (Fachrudin et al. 2022). Oleh karena itu, pengembangan sistem
penilaian yang mencakup peringkat (rating) dan ulasan (review) menjadi solusi
potensial, karena memungkinkan pelanggan untuk berbagi pengalaman,

memberikan penilaian terhadap produk, serta memberikan rekomendasi yang dapat
membantu calon pembeli merasa lebih yakin dalam memilih menu sehingga
membuat keputusan yang lebih tepat.
Keberadaan sistem peringkat dan ulasan pada website Ayam Goreng
Fatmawati berpotensi besar menjadi electronic Word of Mouth (eWOM) untuk
meningkatkan kepercayaan dan keyakinan pelanggan. eWOM menciptakan
pernyataan positif atau negatif dari konsumen yang dapat diakses melalui internet,
menjadi sumber informasi penting dalam menilai kualitas produk, sekaligus
referensi utama dalam pengambilan keputusan pembelian. Dalam konteks ini,
pengalaman positif pelanggan menghasilkan promosi gratis yang didasarkan pada
perceived benefits, yaitu persepsi kualitas dan manfaat produk yang sesuai harapan
(Setiyawan, 2022). Ketika pelanggan merasa puas dengan produk dan sesuai
ekspektasi, mereka cenderung memberikan ulasan positif. Perceived benefits yang
tinggi mendorong kepuasan, keputusan pembelian, dan loyalitas pelanggan,
menjadikan sistem ini sebagai alat strategis untuk meningkatkan transparansi,
kepercayaan, dan reputasi produk secara berkelanjutan.
Namun, potensi besar sistem peringkat dan ulasan sebagai eWOM tersebut
belum sepenuhnya dimanfaatkan karena belum diterapkannya pengelolaan ulasan
pelanggan yang efektif oleh pihak admin. Meskipun pelanggan memiliki hak untuk
memberikan ulasan, admin restoran belum memiliki alat yang tepat untuk
mengelola dan menindaklanjuti umpan balik yang masuk, sehingga ketidakpuasan
pelanggan tidak segera mendapatkan perhatian dan solusi yang sesuai (Alnoor et
al. 2024). Ketidaksiapan dalam pengelolaan ini tidak hanya menyebabkan peluang
peningkatan layanan terlewatkan, tetapi juga membuka celah bagi masuknya
konten yang tidak valid, termasuk ulasan palsu yang dapat mencemari integritas
sistem ulasan dan menyesatkan arah pengambilan keputusan.
Ulasan palsu dapat berupa muatan positif atau negatif, masing-masing dengan
tujuan tertentu. Ulasan positif palsu biasanya berisi pujian yang dirancang untuk
mempromosikan barang atau jasa melalui jasa buzzer demi meningkatkan brand
awareness. Banyak bisnis menggunakan testimoni pelanggan sebagai strategi
branding digital, namun testimoni yang tidak otentik berpotensi menyesatkan calon
pelanggan. Testimoni yang palsu atau direkayasa akan berdampak buruk terhadap
reputasi merek dalam jangka panjang. Oleh karena itu, pelaku bisnis perlu
menjunjung tinggi etika dalam penggunaan testimoni digital, termasuk dengan
tidak memberi ulasan palsu atau menggunakan akun palsu yang justru dapat
merusak kepercayaan konsumen (Oswari dan Asari 2025). Alih-alih menciptakan
ulasan palsu, pelaku usaha dapat mendorong pelanggan yang pernah membeli atau
bahkan sudah sering berlangganan untuk memberikan ulasan yang jujur. Selain
lebih kredibel, pendekatan ini juga membangun hubungan jangka panjang dengan
pelanggan dan meningkatkan reputasi secara berkelanjutan.
Sebaliknya, ulasan negatif palsu cenderung berisi hinaan, hoaks, atau
informasi yang dibuat-buat tanpa riset, dengan tujuan merusak reputasi,
menurunkan kepercayaan konsumen, dan mengalihkan pembelian ke pesaing.
Ulasan seperti ini sering muncul akibat persaingan tidak sehat atau kecemburuan
sosial, yang dapat menyebabkan kerugian materiil dan immateriil bagi pelaku
usaha. Dalam konteks e-commerce, ulasan negatif yang tidak konstruktif bahkan
sering kali mengandung kata-kata toksik, ujaran kebencian, atau provokasi yang
dapat membuat pelanggan lain merasa tidak nyaman saat membacanya karena

menciptakan kesan buruk yang menurunkan pengalaman pengguna secara
keseluruhan (Gerdt et al. 2019). Selain itu, ulasan negatif palsu juga bisa termasuk
dalam black campaign yang menjadi ancaman serius di platform digital, karena satu
ulasan saja dapat memengaruhi persepsi calon pelanggan (Purnama dan Ciptorukmi
2024). Jika dibiarkan, hal ini dapat mengurangi minat calon pembeli untuk
melanjutkan transaksi sehingga menurunkan penjualan dan merusak citra
profesionalitas sebuah brand di platform digital.
Untuk mengatasi tingginya risiko dari ulasan negatif yang tidak konstruktif,
sistem dilengkapi dengan dua pendekatan metode analisis. Pendekatan pertama
menggunakan Logistic Regression, karena mampu menangani klasifikasi biner
maupun multikelas serta memberikan interpretasi yang jelas mengenai hubungan
antara fitur teks dengan kategori sentimen. Pendekatan ini juga dikenal sederhana
dan efektif pada analisis teks, sehingga sesuai digunakan dalam konteks sistem
ulasan pelanggan yang memerlukan pemrosesan cepat tanpa kompleksitas model
yang berlebihan. Hasil klasifikasi ini kemudian dimanfaatkan untuk menyajikan
visualisasi sentimen secara otomatis pada dashboard admin, sehingga dapat
mendukung pemantauan tren ulasan pelanggan berdasarkan aspek tertentu secara
secara lebih objektif. Pendekatan kedua, digunakan Rule-Based Filtering untuk
menyaring komentar dengan kata-kata kasar atau toksik, sehingga konten yang
tidak pantas dapat langsung terdeteksi. Dengan pertimbangan tersebut, penelitian
ini menerapkan dua kombinasi metode analisis utama yang akan dibahas lebih
lanjut pada bab berikutnya. Kombinasi kedua pendekatan ini diharapkan dapat
meningkatkan keandalan sistem dalam menyajikan ulasan yang informatif
sekaligus mendukung pengambilan keputusan berbasis data.
Dengan adanya sistem peringkat dan ulasan, admin dapat segera mengambil
langkah-langkah yang diperlukan seperti menanggapi setiap penilaian secara lebih
praktis dan sistematis. Hal ini memungkinkan pengambilan keputusan yang lebih
cepat dalam upaya peningkatan kualitas produk dan pelayanan. Kemudian
pelanggan dapat merasakan pengalaman yang lebih kondusif dan positif karena
merasa didengar dan dihargai pendapatnya, serta memiliki keyakinan bahwa
masukan mereka berkontribusi nyata terhadap peningkatan layanan. Meski begitu,
implementasi sistem ini membutuhkan perencanaan alur yang matang, termasuk
integrasi sistem yang lancar, desain antarmuka yang ramah pengguna, serta
pengelolaan data pengguna dan penilaian yang aman. Sistem ini tidak hanya
meningkatkan kualitas dan daya saing restoran, tetapi juga berpotensi menjadi studi
kasus yang bermanfaat bagi industri kuliner lainnya.

### 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah dipaparkan, maka urgensi penelitian
ini difokuskan pada bagaimana merancang dan mengembangkan sistem insentif
serta fitur pendukung yang dapat mendorong penggunaan sistem pemesanan
website Ayam Goreng Fatmawati. Adapun rumusan masalah secara spesifik adalah
sebagai berikut:

1. Bagaimana merancang dan mengembangkan sistem peringkat dan ulasan yang
   efektif?
2. Bagaimana mengidentifikasi dan mengintegrasikan penyaringan komentar
   toksik pada halaman detail katalog pelanggan guna menjaga kualitas interaksi
   digital?
3. Bagaimana menampilkan hasil klasifikasi sentimen kategori positif, negatif
   konstruktif, dan negatif non-konstruktif (toksik) secara otomatis pada
   dashboard admin untuk mendukung pengambilan keputusan berbasis data?

### 1.3 Tujuan

Berdasarkan rumusan masalah yang disampaikan, maka tujuan dari penelitian
ini adalah:

1. Merancang dan mengembangkan sistem peringkat dan ulasan yang efektif
   untuk meningkatkan keterlibatan pengguna sebagai referensi yang kredibel
   dalam proses pemesanan pada website PT Ayam Goreng Fatmawati.
2. Mengidentifikasi dan mengintegrasikan mekanisme penyaringan komentar
   toksik guna menjaga kualitas interaksi digital yang sehat dan kondusif pada
   halaman detail katalog pelanggan pada website Ayam Goreng Fatmawati.
3. Menampilkan visualisasi hasil klasifikasi sentimen secara otomatis dalam
   dashboard admin untuk membedakan kategori positif, negatif konstruktif, dan
   negatif non-konstruktif (toksik) sehingga mendukung pengambilan keputusan
   berbasis data pada website Ayam Goreng Fatmawati.

### 1.4 Manfaat

Penelitian ini diharapkan memberikan manfaat secara teoritis dan praktis.
Secara teoritis, penelitian ini berkontribusi dalam pengembangan ilmu pengetahuan
di bidang teknologi informasi, khususnya dalam implementasi sistem peringkat dan
ulasan dengan penerapan analisis sentimen serta deteksi komentar toksik pada
platform e-commerce digital menggunakan pendekatan penyaringan berbasis
aturan dan pemrosesan bahasa alami. Temuan dalam penelitian ini juga dapat
dijadikan referensi bagi studi lanjutan yang berkaitan dengan klasifikasi sentimen
dan manajemen interaksi pengguna.
Secara praktis, penelitian ini bermanfaat bagi PT Ayam Goreng Fatmawati
dalam menyediakan solusi digital yang dapat meningkatkan kepercayaan dan
kepuasan pelanggan melalui sistem peringkat dan ulasan yang lebih terstruktur,
bersih dari komentar toksik, transparan, dan informatif bagi calon pembeli. Bagi
admin atau pengelola website, sistem ini memudahkan dalam memantau kualitas
interaksi pelanggan serta mendukung pengambilan keputusan untuk evaluasi
produk dan layanan yang lebih cepat juga tepat melalui tampilan visualisasi data
klasifikasi sentimen otomatis pada dashboard.

### 1.5 Ruang Lingkup

Penelitian ini berfokus pada pengembangan sistem peringkat dan ulasan
katalog pada website pemesanan PT Ayam Goreng Fatmawati Indonesia (PT AGFI)
cabang Curug Mekar. Ruang lingkup sistem mencakup fitur pemberian nilai produk
oleh pelanggan, pengelolaan ulasan oleh admin, serta penyajian statistik rating dan
ulasan per produk.
Pengembangan juga mencakup fitur penyaringan komentar toksik dengan
teknik Rule-Based Filtering dan pembuatan dashboard klasifikasi sentimen dengan
NLP menggunakan algoritma Logistic Regression dan teknik TF-IDF. Model
dikembangkan berdasarkan dataset dummy yang disusun manual untuk
merepresentasikan variasi komentar pelanggan. Pelatihan dilakukan sepenuhnya
pada data teks tanpa mempertimbangkan faktor eksternal seperti waktu, profil

pelanggan, atau histori pemesanan. Selain itu, pengujian sistem difokuskan pada
evaluasi fungsionalitas dan alur kerja sistem secara internal bersama tim restoran,
tanpa melibatkan uji coba langsung oleh pelanggan umum dalam skala besar.

## II. METODE

### 2.1 Lokasi dan Waktu PKL

Pengerjaan proyek akhir ini memiliki durasi pelaksanaan selama 8 bulan,
terhitung dari November 2024 hingga Juni 2025. Lokasi penelitian ini dilaksanakan
di dua tempat yakni, Sekolah Vokasi IPB University, yang berlokasi di Jl. Kumbang
No.14, RT.02/RW.06, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat 16128 dan
PT Ayam Goreng Fatmawati Indonesia yang berlokasi di Jl. Yasmin Raya No.17
A, RT.01/RW.04, Curugmekar, Kec. Bogor Bar., Kota Bogor, Jawa Barat 16113.
Selanjutnya, untuk waktu penyusunan pengerjaan proyek akhir dapat dilihat pada
Lampiran 1.

### 2.2 Tahapan Penelitian

Metodologi berperan penting dalam membantu desain produk dengan
mengidentifikasi kebutuhan pengguna, mengatasi tantangan, mengoptimalkan
sumber daya, dan mengurangi jangka waktu proyek (Susilawati 2025). Untuk
mewujudkan peran tersebut secara efektif, diperlukan tahapan penelitian yang
disusun sebagai serangkaian langkah sistematis yang ditempuh peneliti untuk
mencapai tujuan penelitian (Harpizon et al. 2022). Di bawah ini merupakan
tahapan-tahapan penelitian yang dapat dilihat pada Gambar 1 dan Gambar 2.

```
2.2.1 Fase Praktik Kerja Lapangan (Agustus hingga Desember)
```

```
Gambar 1 Tahapan Penelitian Fase PKL
```

```
a. Identifikasi Masalah
Tahapan pertama dari penelitian ini adalah tahapan di identifikasinya
masalah restoran. Pada tahapan ini peneliti melakukan kegiatan wawancara
dan observasi untuk menemukan permasalahan awal yang nantinya dapat
dijadikan topik laporan magang oleh peneliti. Permasalahan yang
diidentifikasi berfokus pada permasalahan mengenai klien (restoran PT
Ayam Goreng Fatmawati) yang masih melalukan proses pemesanan
menggunakan WhatsApp sehingga dibutuhkan pengembangan sistem yang
dapat membantu meminimalkan kesalahan, mempercepat proses, serta
meningkatkan pemesanan digital.
```

b. Studi Literatur
Tahapan selanjutnya adalah studi literatur. Pada tahapan ini peneliti
melakukan kegiatan pembelajaran serta pengumpulan bahan sebagai data
pendukung kegiatan dan pedoman dalam mengembangkan sistem
informasi untuk PKL di PT AGFI. Studi dilakukan dengan membaca serta
menganalisis berbagai sumber relevan seperti jurnal, artikel, paper, atau
ebook. Selain itu, peneliti juga melakukan peninjauan terhadap website-
website pemesanan milik franchise restoran lainnya, untuk memperoleh
inspirasi desain, alur pemesanan, serta fitur-fitur yang dapat diadaptasi dan
disesuaikan dengan kebutuhan sistem.
c. Permodelan Proses Bisnis
Pada tahapan ini peneliti menyusun alur bisnis yang sesuai dengan
meninjau kembali hasil observasi pada tahapan identifikasi masalah,
khususnya terkait bagaimana proses pemesanan yang berjalan mulai dari
pelanggan, kasir hingga ke pihak dapur guna memastikan bahwa sistem
yang akan dikembangkan dapat mencakup seluruh kebutuhan operasional.
d. Eksplorasi dan Perencanaan
Mengumpulkan kebutuhan keseluruhan sistem terkait fitur yang akan
diimplementasikan. Output dari tahapan ini seperti data konten, data
katalog, data pemesanan, dan data penjualan yang akan menjadi bahan
untuk tahapan perencanaan pengembangan. Selain itu, masukan dari
pengguna sistem baik dari sisi pelanggan maupun admin juga dihimpun
untuk melengkapi identifikasi fitur yang dibutuhkan. Selanjutnya,
dilakukan tahap menyusun kebutuhan fungsional dan teknis berdasarkan
hasil eksplorasi untuk mendukung pengembangan sistem.
e. Pengembangan
Pada tahapan pengembangan sistem, peneliti menggunakan metode Agile
untuk melakukan implementasi ke dalam kode program PHP dengan
menggunakan bantuan framework Laravel. Untuk pengujian akhir pada
setiap iterasi, digunakan metode blackbox testing serta evaluasi dari pihak
klien. Setelah seluruh pengujian dinyatakan berhasil, sistem pemesanan
diunggah ke layanan hosting sehingga dapat diakses secara daring dan siap
digunakan oleh masyarakat umum.
f. Pembuatan Laporan PKL
Tahapan terakhir adalah tahapan membuat laporan PKL. Pada tahapan ini
peneliti melakukan penarikan kesimpulan berdasarkan hasil pengujian
yang menunjukan kelayakan sistem untuk digunakan, kelebihan dan
kekurangan sistem yang dapat menjadi referensi dan saran untuk
pengembangan selanjutnya.

2.2.2 Fase Proyek Laporan Akhir (November hingga Juni)

```
Gambar 2 Tahapan Penelitian Fase Proyek Laporan Akhir
```

a. Identifikasi Masalah
Penelitian dimulai dengan mengidentifikasi masalah pada website
pemesanan PT AGFI melalui wawancara dan observasi. Dari hasil
wawancara, ditemukan permasalahan utama yaitu belum tersedianya fitur
peringkat dan ulasan pada sistem pemesanan. Kondisi ini menyebabkan
pelanggan tidak dapat memberikan umpan balik dan pihak admin tidak
memiliki rekapan memadai untuk melakukan evaluasi produk dan layanan.
b. Pemilihan Topik
Pada tahap ini, ditentukan topik awal penelitian berdasarkan hasil
identifikasi masalah yang ditemukan pada sistem pemesanan PT AGFI.
Topik awal yang dipilih adalah pengembangan sistem peringkat dan ulasan
pada website pemesanan. Dari topik tersebut, kemudian dirumuskan judul
penelitian awal: "Pengembangan fitur Peringkat dan Ulasan Katalog pada
Modul Pelanggan dan Admin Website Pemesanan PT AGFI.” Seiring
berjalannya proses pengembangan dan masuknya kebutuhan baru dari klien
pada iterasi kedua, ruang lingkup topik penelitian selanjutnya diperluas
untuk mencakup analisis ulasan pelanggan, termasuk penyaringan
komentar toksik dan klasifikasi sentimen. Judul penelitian pun disesuaikan
menjadi "Pengembangan Sistem Peringkat dan Ulasan Katalog dengan
Penyaringan Komentar Toksik dan Visualisasi Klasifikasi Sentimen
Otomatis pada Website Pemesanan PT AGFI."
c. Studi Literatur
Pada fase penelitian, studi literatur difokuskan pada pengembangan sistem
peringkat dan ulasan katalog yang dilengkapi fitur penyaringan komentar
toksik dan klasifikasi sentimen otomatis. Peneliti mengkaji sumber ilmiah
seperti jurnal, artikel, dan ebook terkait konsep eWOM dalam e-commerce,
metode berbasis aturan, pembuatan model dengan TF-IDF dan algoritma

```
logistic regression. Selain itu, dipelajari pula teknologi pendukung seperti
framework Laravel dan integrasinya dengan modul analisis teks.
d. Perumusan Fokus dan Masalah
Tahap ini menetapkan ruang lingkup, tujuan, dan arah pengembangan
sistem. Fokus penelitian adalah menampilkan penilaian pelanggan secara
terstruktur pada halaman katalog, profile pelanggan, dan dashboard admin.
e. Pemodelan Proses Bisnis
Pada tahapan ini peneliti menyusun alur bisnis untuk pengembangan sistem
peringkat dan ulasan dengan meninjau hasil observasi serta kebutuhan
tambahan yang disampaikan oleh klien pada iterasi kedua. Pemodelan
proses ini mencakup interaksi antara pelanggan dan admin mulai dari
pemberian penilaian terhadap katalog (sub-produk) yang telah selesai
dipesan, pengelolaan ulasan oleh admin, hingga penyediaan fitur
penyaringan komentar toksik dan visualisasi klasifikasi sentimen otomatis.
f. Eksplorasi & Perencanaan
Pada tahap Eksplorasi dan Perancangan, peneliti menerjemahkan hasil
pemodelan proses bisnis menjadi spesifikasi teknis untuk pengembangan.
Kegiatan meliputi pengumpulan detail kebutuhan fungsional, pembuatan
wireframe/mock-up antarmuka, perancangan skema basis data, persiapan
dataset awal, pemilihan metode analisis dan alur integrasi modul analisis
teks, sampai menyusun rencana pengujian. Peneliti menggunakan metode
prototipe untuk merancang sistem.
g. Pengembangan
Berdasarkan output sebelumnya, pada tahap pengembangan, peneliti
mengimplementasikan fitur menggunakan laravel dan melakukan
pengujian dengan blackbox testing serta evaluasi klien. Pada iterasi kedua,
dilakukan proses analisis data, mengintegrasikan modul penyaringan
komentar toksik dan klasifikasi sentimen, lalu sistem diuji kembali.
h. Membuat Laporan Akhir
Seluruh proses dari identifikasi hingga iterasi kedua didokumentasikan
dalam laporan akhir. Laporan ini juga memuat kesimpulan, saran serta
rekomendasi pengembangan lebih lanjut berdasarkan temuan penelitian.
```

### 2.3 Teknik Pengumpulan Data dan Analisis Data

```
2.3.1 Teknik Pengumpulan Data
Dalam upaya mengumpulkan informasi yang dapat
dipertanggungjawabkan dan memperoleh data yang relevan untuk mendukung
keberhasilan pengembangan sistem yang diteliti, penelitian ini menggunakan
tiga teknik pengumpulan data, yaitu wawancara, observasi, dan studi literatur.
Adapun penjabaran dari ketiga teknik tersebut adalah sebagai berikut.
a. Wawancara
Wawancara adalah prosedur yang bertujuan untuk memperoleh informasi
dari seseorang melalui jawaban lisan atas pertanyaan lisan (Setiawan et al.
2025). Teknik ini dilakukan secara langsung dengan pihak operasional
restoran dalam tahap komunikasi saat iterasi pertama dan kedua. Tujuannya
untuk menggali permasalahan yang dihadapi dalam pengelolaan penilaian
pelanggan serta ekspektasi terhadap sistem yang dikembangkan.
b. Observasi
```

Observasi adalah teknik pengumpulan yang mengharuskan peneliti turun
ke lapangan mengamati hal-hal yang berkaitan dengan ruang, tempat,
pelaku, kegiatan, waktu, peristiwa, tujuan dan perasaan (Khoiriyah 2025).
Observasi dilakukan secara non-partisipatif melalui pengamatan langsung
tanpa keterlibatan peneliti (Romdona et al. 2025). Teknik ini dilakukan
dengan mengamati arsip interaksi pelanggan melalui chat WhatsApp dan
catatan staf kasir terkait interaksi pasca-transaksi. Tujuannya adalah
memahami perilaku pengguna saat memberi penilaian dan alur
pemberiannya.
c. Studi Literatur
Studi pustaka atau studi literatur adalah teknik pengumpulan informasi dari
berbagai referensi tertulis seperti buku, artikel ilmiah, dan laporan
penelitian sebelumnya (Baihaqi 2025). Hasilnya berupa kumpulan
referensi relevan yang mendukung perumusan masalah terkait kebutuhan
sistem peringkat dan ulasan, pengembangan sistem berbasis teknologi,
serta penerapan machine learning dalam pengolahan ulasan pelanggan.

2.3.2 Analisis Data
Analisis data adalah proses mengolah, menafsirkan, dan menarik
kesimpulan dari data yang telah dikumpulkan agar dapat menjawab rumusan
masalah penelitian. Tujuannya adalah untuk menemukan makna dalam data agar
bisa digunakan untuk mendukung pengambilan keputusan (Waruwu 2024).
Proses analisis data dilakukan pada iterasi kedua prosedur kerja, yaitu
tahap modelling quick design. Iterasi kedua ini dilakukan setelah menerima
masukan dari hasil pengujian pada iterasi pertama, yang dilaksanakan setelah
fitur peringkat dan ulasan diimplementasikan pada sistem pemesanan website PT
AGFI, seperti ditunjukkan pada Gambar 3.

Gambar 3 Analisis Data
Persiapan Data

a. Data Collection
Pengumpulan data adalah langkah strategis dalam penelitian karena
menentukan validitas dan kualitas hasil akhir yang diperoleh (Romdona et
al. 2025). Dalam penelitian ini, dataset pelanggan dibuat secara manual
menggunakan data dummy karena pihak restoran hanya memiliki sebagian
data dari hasil interaksi arsip chat WhatsApp, yang mana sisanya tidak
masuk ke rekapan. Sehingga diperlukan simulasi data untuk mencukupi
kebutuhan pelatihan model.
b. Data Labeling
Labeling data adalah proses untuk mengklasifikasikan setiap data (dalam
hal ini komentar pelanggan) ke dalam kategori sentimen tertentu, seperti
positif, negatif konstruktif, atau negatif non-konstruktif (Fathoni et al.
2024). Proses ini penting karena digunakan sebagai acuan saat melatih
model analisis sentimen. Labeling dilakukan secara manual dengan
membaca dan menafsirkan makna dari setiap komentar berdasarkan
konteks dan kata-kata yang digunakan. Tujuannya agar model dapat belajar
mengenali pola bahasa dan menentukan jenis sentimen secara otomatis di
masa mendatang.

Training Data
a. Data Preprocessing
Preprocessing data adalah tahap awal dalam pengolahan data yang
bertujuan untuk menyiapkan data mentah menjadi dataset yang siap
digunakan oleh model (Ristyawan 2025). Proses ini mencakup beberapa
langkah seperti casefolding (mengubah huruf besar menjadi kecil), remove
punctuation (menghilangkan tanda baca), tokenize (memecah kalimat
menjadi kata-kata), dan remove stopword (menghapus kata umum tidak
bermakna).
b. Feature Extraction
Feature Extraction adalah tahap mengubah teks menjadi representasi
numerik yang dapat diproses oleh algoritma (Jelita 2025). Tahapan ini
dapat dilakukan secara berulang dan tidak selalu berurutan, tergantung pada
kebutuhan analisis (Karunarathna dan Rupasingha 2022 ). Teknik
representasi numerik yang digunakan dalam model untuk klasifikasi
sentimen disini adalah TF-IDF.
c. Logistic Regression
Logistic Regression adalah algoritma sederhana namun efektif untuk
klasifikasi. Dengan pendekatan berbasis probabilitas sehingga memberikan
hasil yang mudah diinterpretasikan, menjadikannya ideal untuk analisis
awal, terutama dengan data dummy dan dataset yang masih terbatas. Selain
itu, kecepatan pelatihannya menjadikannya pilihan efisien, terutama untuk
dataset besar tanpa memerlukan sumber daya komputasi tinggi (Wahid et
al. 2025).

Testing Data
a. Model Evaluation
Model Evaluation adalah proses untuk mengukur kinerja model machine
learning atau mengukur seberapa baik peforma untuk mengetahui seberapa

```
akurat dan efektif model dalam memprediksi label yang benar berdasarkan
data uji. Evaluasi dilakukan menggunakan confussion matrix dengan empat
metrik utama, yaitu accuracy, precision, recall, dan F1-score (Finesti et al.
2025).
b. Rule-Based Filtering
Pendekatan rule-based adalah metode pemrosesan data yang mengandalkan
seperangkat aturan dalam mengambil keputusan atau pilihan yang dirancang
secara eksplisit untuk mengenali atau mengklasifikasikan suatu informasi
berdasarkan pola, kata kunci, atau karakteristik tertentu yang telah ditentukan
sebelumnya. Pendekatan ini menggunakan pola yang telah ditentukan
sebelumnya akan mencocokkan input pengguna dengan respons yang sesuai
dengan memanfaatkan daftar referensi terkurasi (seperti kamus kata, lexicon,
blacklist, atau whitelist) dan aturan logika untuk memutuskan tindakan atau
label yang diberikan pada data. Keunggulan pendekatan ini terletak pada
kemampuannya beroperasi tanpa memerlukan data latih berskala besar
seperti pada machine learning atau deep learning, sehingga efisien dalam
konteks dengan sumber daya terbatas (Ananta et al. 2025). Namun demikian,
tingkat akurasi dan cakupan deteksinya sangat dipengaruhi oleh kualitas,
kelengkapan, dan relevansi aturan maupun daftar referensi yang digunakan.
Teori Rule-Based menggunakan teknik sederhana dengan menyusun
pengetahuan terkait permasalahan ke dalam aturan if-then yang memuat
fakta. Sistem akan menjalankan perintah pada bagian then jika kondisi if
terpenuhi, dan proses ini berulang hingga aturan yang sesuai ditemukan atau
proses dihentikan (terminate) jika aturan tidak ditemukan (Juanda dan Yadi
2020 ).
Rule Based System terdiri dari tiga komponen utama:
1) Kumpulan fakta, fakta dapat berupa pernyataan, data atau kondisi.
2) Kumpulan aturan, aturan ini menentukan semua langkah yang harus
diambil ketika diberikan sekumpulan fakta.
3) Standar penghentian, yaitu kondisi yang menentukan apakah solusi
berhasil ditemukan atau tidak untuk menghindari terjadinya infinite loop
(Aldrin 2017).
Rule-Based Filtering adalah metode penyaringan dengan menggunakan
seperangkat aturan yang telah ditentukan sebelumnya untuk mendeteksi dan
memblokir komentar yang mengandung kata atau frasa tertentu. Pendekatan
ini tidak memerlukan pelatihan model, melainkan mengandalkan daftar kata
terlarang (blacklist) dan aturan logika yang dirancang secara manual.
Prosesnya bekerja dengan mencocokkan kata atau frasa dalam komentar
dengan daftar kata kunci yang telah ditetapkan. Jika ditemukan kecocokan,
sistem akan mengklasifikasikan komentar sebagai toksik dan melakukan
tindakan yang telah ditentukan, seperti memblokir.
c. Model Deployment
Deployment adalah proses penempatan model yang telah dilatih dan
dievaluasi ke dalam lingkungan produksi agar dapat digunakan oleh aplikasi
atau pengguna akhir secara langsung. Dalam konteks penelitian ini, berarti
mengintegrasikan model analisis sentimen ke sistem pelanggan dan admin
(Ningsih et al. 2024)
```

### 2.4 Prosedur Kerja

Penelitian ini menggunakan pendekatan metode prototipe karena metode ini
memungkinkan pengembangan sistem secara iteratif dengan melibatkan pengguna
secara aktif dalam setiap tahapan proses pengembangan (Ekasari et al. 2024).
Metode prototipe cocok digunakan ketika kebutuhan pengguna belum sepenuhnya
dipahami atau ketika sistem memerlukan umpan balik berulang untuk
penyempurnaan antarmuka dan fungsionalitas (Wardhana et al. 2024). Dalam
konteks pengembangan sistem peringkat dan ulasan, metode ini efektif karena
memungkinkan pengumpulan masukan secara langsung dari pengguna untuk
menyesuaikan fitur sistem dengan ekspektasi dan kebutuhan aktual. Tahapan
metode prototipe dapat dilihat pada Gambar 4.

```
Gambar 4 Metode prototipe
```

```
2.4.1 Communication
Tahap komunikasi merupakan tahap yang krusial karena melibatkan
diskusi menyeluruh dengan stakeholder, seperti manajer, staff, dan pelanggan
untuk menggali kebutuhan dan tantangan spesifik perusahaan. Tahap ini
membantu dalam mengidentifikasi perumusan kebutuhan menjadi lebih jelas
dan penting untuk kelanjutan proyek agar perancangan dapat sesuai dengan
kebutuhan pengguna.
```

```
2.4.2 Quick Plan
Selama tahap perencanaan cepat, fokus utama adalah menyusun draft
awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari
hasil komunikasi sebelumnya dengan stakeholder.
```

```
2.4.3 Modelling Quick Desain
Sementara itu, pada tahap pemodelan desain cepat, aktivitas berfokus
merepresentasikan tampilan dan struktur aplikasi secara visual, seperti
perancangan sketsa antarmuka aplikasi, pembuatan wireframe dan mock-up,
Selain itu, tahap ini juga mencakup pembuatan Activity Diagram, Use Case
Diagram, dan Entity Relationship Diagram secara lebih detail untuk
mendeskripsikan alur sistem dan struktur basis data yang akan digunakan
sebagai dasar pembangunan prototipe (Allacsta dan Hadiwandra 2024).
```

1. Use Case Diagram
   Use case diagram merupakan model hasil dari analisis perancangan sistem
   untuk menggambarkan kebutuhan sistem yang digunakan oleh pengguna,
   sehingga rancangan sistem dapat terlihat dengan jelas. Diagram ini dapat
   dilihat pada Tabel 1 yang menunjukkan bentuk interaksi sistem dan aktor.

```
Tabel 1 Simbol-simbol use case diagram
Nama Simbol Deskripsi
Use Case
Menggambarkan fungsi sistem sebagai
unit-unit yang saling bertukar pesan
dengan aktor, dan biasanya diberi awal
nama dengan kata kerja.
```

```
Actor
Menggambarkan entitas (orang/ proses/
sistem) yang melakukan interaksi.
```

```
Association Menggambarkan komunikasi antara aktor
dan use case.
```

```
Generalization Menggambarkan hubungan umum –
khusus antara 2 case dimana fungsi yang
satu lebih umum dari lainnya.
```

```
Extend
Menunjukkan fungsi lain yang bersifat
opsional dan dapat berdiri sendiri.
```

```
Include
Menunjukkan bahwa use case utama
wajib menjalankan use case lain sebagai
bagian dari prosesnya
```

2. Activity Diagram
   Activity diagram berfungsi untuk memvisualisasikan urutan aktivitas
   dalam suatu sistem, menampilkan alur dari awal hingga akhir proses.
   Diagram ini membantu memahami proses bisnis atau sistem kerja secara
   menyeluruh melalui perpindahan antar aktivitas. Simbol-simbol activity
   diagram dapat dilihat pada Tabel 2 (Ramdany et al. 2024).

```
Tabel 2 Simbol-simbol Activity Diagram
```

Nama (^) Simbol Deskripsi
Status
Awal (^)
Menyatakan awal mulainya proses aktivitas.
Aktivitas
Menggambarkan aktivitas atau tindakan
langsung yang dilakukan sistem atau aktor.
Transisi Menghubungkan satu elemen aktivitas ke
elemen lainnya.

```
Keputusan
Menyatakan percabangan alur berdasarkan
suatu kondisi tertentu.
```

```
Basis data
Mengindikasikan adanya proses penyimpanan
atau pengambilan data dari sistem
penyimpanan
```

```
Status
```

Akhir (^)
Menandai akhir dari proses suatu aktivitas.

3. Entity Relationship Diagram
   Entity Relationship Diagram (ERD) adalah diagram yang digunakan untuk
   memodelkan struktur data dan hubungan antar data dalam suatu sistem.
   ERD menggambarkan bagaimana entitas (seperti objek atau tabel dalam
   database), atribut (informasi yang dimiliki oleh entitas), dan relasi saling
   berinteraksi. ERD membantu pengembang memahami kebutuhan data,
   mengorganisasikan hubungan antar data terdefinisi dengan jelas sebelum
   database dibangun secara fisik (Mbanugo 2025). Aspek penting dalam
   ERD adalah cardinalities, yaitu batasan jumlah minimum dan maksimum
   hubungan yang dapat terjadi antara entitas satu dengan entitas lainnya.
   Dalam penelitian ini digunakan *Crow’s Foot Notation* yang dapat dilihat
   pada Gambar 5 yaitu One untuk tepat satu entitas, Many untuk banyak
   entitas, One and only one untuk hubungan yang wajib tepat satu, Zero or
   One untuk hubungan opsional satu atau tidak sama sekali, One or Many
   untuk hubungan minimal satu hingga banyak, serta Zero or Many untuk
   hubungan opsional banyak atau tidak sama sekali.
   Gambar 5 Notasi Kardinalitas C *row’s Foot*
   (^)
   2.4.4 Contruction of Prototype
   Pada tahap konstruksi prototipe dengan struktur MVC (Model-View-
   Controller) menggunakan bahasa PHP dan framework Laravel diawali dengan
   mendesain struktur basis data menggunakan MySQL, di mana entitas dan relasi
   ditentukan melalui ERD dan diimplementasikan dalam migration. Selanjutnya,
   Model dibuat untuk merepresentasikan tabel-tabel database dan menangani
   logika bisnis. Kemudian, Controller dikembangkan untuk mengatur alur data
   antara model dan tampilan (view), menangani request dari pengguna, serta
   meresponsnya dengan data yang sesuai. View dibangun menggunakan Blade
   templating engine laravel dan didesain secara responsif dengan bantuan
   Tailwind CSS agar tampilan antarmuka menarik dan modern (Necula 2024).

Proses routing menghubungkan URL dengan controller tertentu, sehingga alur
kerja prototipe menjadi terstruktur dan mudah dikembangkan. Keseluruhan
dari proses MVC dapat dilihat pada Gambar 6.

```
Gambar 6 Arsitektur Sistem Laravel
```

Selain itu, untuk keperluan analisis sentimen, model yang dikembangkan
dengan Python diintegrasikan ke dalam aplikasi laravel menggunakan library
joblib untuk memuat model yang telah dilatih sebelumnya. Proses analisis ini
juga memanfaatkan stopwords dari library NLTK, yang disimpan secara lokal
agar sistem tetap dapat berjalan meskipun tidak terhubung ke internet. Integrasi
ini memungkinkan sistem melakukan prediksi sentimen secara otomatis
berdasarkan input pengguna. Selanjutnya, untuk mendukung komunikasi yang
lebih responsif, sistem juga dihubungkan dengan API Fonnte, yang berfungsi
mengirimkan pengingat langsung untuk memberikan penilaian terhadap
pesanannya ke nomor WhatsApp pelanggan dalam bentuk pesan otomatis.

2.4.5 Deployment, Delivery & Feedback
Pada tahap Deployment, Delivery & Feedback, dilakukan black box
testing untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai
kebutuhan pengguna. Pengujian ini dilakukan dari sudut pandang pengguna
tanpa mengetahui struktur internal program, sehingga membantu menemukan
dan memperbaiki bug yang dapat mengganggu pengalaman pengguna, agar
rilis optimal serta memperoleh umpan balik konstruktif (Salim & Rusdiansyah,
2024).

## III. HASIL DAN PEMBAHASAN

### 3. 1 Hasil Iterasi Pertama

```
3.1.1 Communication
Arsitektur website pemesanan Ayam Goreng Fatmawati terdiri dari dua
sisi utama, yaitu sisi Admin dan sisi Customer, yang terhubung melalui satu
pusat sistem berbasis database MySQL. Pada sisi Admin, frontend dibangun
menggunakan Bootstrap oleh rekan, sedangkan backend dibagi antara peneliti
yang fokus pada manajemen konten, nilai, dan klasifikasi sentimen, serta rekan
yang mengelola auth, manajemen pengguna, katalog, pesanan, poin cashback
dan prediksi. Di sisi Customer, frontend menggunakan Tailwind oleh peneliti,
dengan backend yang ditangani oleh peneliti untuk fitur seperti auth
menggunakan OTP, beranda, tentang, galeri, kontak, pengaturan, penilaian,
dan penyaringan komentar menggunakan Rule-Based Filtering. Kemudian,
rekan untuk fitur profil, riwayat, checkout, poin cashback dan penggolongan
pelanggan menggunakan RFM. Sistem ini diperkuat dengan integrasi API
seperti Fonnte oleh rekan dan peneliti, FastAPI Prediksi oleh rekan, dan REST
API Sentimen oleh peneliti, serta pemanfaatan model seperti Logistic
Regression dan TF-IDF oleh peneliti juga model Prophet dan XGBoost oleh
rekan untuk mendukung analisis dan prediksi lanjutan dalam sistem. Arsitektur
website dapat dilihat pada Gambar 7.
```

```
Gambar 7 Pembagian Pengerjaan Website Pemesanan AGFI
```

```
Pada alur sistem sebelum pengembangan, pelanggan memulai dengan
membuka website AGFI, lalu menjelajahi katalog, memilih produk dan sub
produk, serta melihat detail sub produk. Pelanggan dapat menambahkan menu
tambahan dan pilihan, menyesuaikan jumlah, serta membagikan sub produk ke
```

media sosial. Setelah memilih, pelanggan dapat menambahkan ke keranjang
atau membeli langsung (beli sekarang). Di halaman keranjang, pelanggan dapat
menghapus atau menambah jumlah sub produk lalu checkout. Saat checkout,
sistem memverifikasi apakah pelanggan sudah login. Jika belum, pelanggan
diminta login terlebih dahulu. Selanjutnya, pelanggan mengisi form order yang
mencakup sales, catatan, tanggal, waktu, dan tipe order, lalu mengirim pesanan
yang datanya disimpan ke database. Setelah pesanan dikirim, ditampilkan
halaman "terima kasih" dan pelanggan bisa membuka kontak WhatsApp AGFI.
Proses selanjutnya mencakup pengecekan status, menerima tagihan, mengirim
bukti pembayaran via WhatsApp, dan mengunduh struk pemesanan. Di sisi
admin, setelah login dan mengakses manajemen order, admin akan menginput
biaya pengiriman/diskon, mengirim tagihan ke WhatsApp pelanggan,
mengirim detail ke dapur, memperbarui status pembayaran dan pesanan, status
pembayaran terdapat dua opsi yaitu sudah atau belum. Sedangkan status
pesanan terdapat lima opsi yaitu dari status diterima, diproses, diantar, hingga
selesai. Status pesanan opsi kelima adalah dibatalkan jika pelanggan tidak
membayar pesanan, ingin mengubah pesanan, atau tidak jadi membeli. Alur
sistem sebelum pengembangan dapat dilihat pada Lampiran 8 dan Lampiran 9.
Dalam tahap komunikasi ini dilakukan proses wawancara, yang hasilnya
diketahui bahwa klien menginginkan adanya sistem yang dapat meningkatkan
kepercayaan dan minat pelanggan dalam melakukan pemesanan yang dapat
dilihat pada Tabel 3. Sementara itu, hasil observasi saat melihat arsip chat
pelanggan dan catatan komentar dari kasir menunjukkan perlunya sistem yang
mampu membantu admin atau klien (PT Ayam Goreng Fatmawati) dalam
memahami tingkat kepuasan pelanggan terhadap setiap katalog yang
ditawarkan. Berdasarkan komunikasi tersebut, muncul ide awal untuk
mengintegrasikan sistem peringkat dan ulasan ke dalam website pemesanan,
ide tersebut dituangkan ke dalam alur sistem pemesanan sebagai dasar
perancangan sistem tambahan yang dapat dilihat pada Gambar 1 2.

```
Tabel 3 Hasil Wawancara Iterasi Pertama
```

```
No. Tujuan Pertanyaan & Jawaban
```

#### 1

```
Menggali proses
penilaian saat ini
```

```
Peneliti: “Bagaimana cara pelanggan
memberikan pujian, keluhan, atau masukan
terhadap produk dan layanan saat ini?”
Informan: “Pelanggan menyampaikan secara
daring melalui WhatsApp, secara langsung
kepada pihak kasir atau pelayan saat di restoran,
atau kepada kurir pengantar pesanan. ”
```

#### 2

```
Mengidentifikasi
masalah pengelolaan
penilaian
```

```
Peneliti: “Apakah ada kendala dalam merekap
atau mengelola penilaian pelanggan secara
manual?”
Informan: “Penilaian sering dicatat secara
informal dan tercecer, sehingga tidak
terdokumentasi dengan baik.”
```

```
3
Menilai partisipasi
pelanggan
```

```
Peneliti: “Apakah pelanggan sering memberikan
penilaian secara sukarela?”
```

```
No. Tujuan Pertanyaan & Jawaban
Informan: “Penilaian sukarela tergolong jarang
dan biasanya muncul saat pengalaman sangat
memuaskan atau mengecewakan.”
```

#### 4

```
Menilai informasi
halaman detail katalog
website pemesanan
```

```
Peneliti: “Apakah format detail katalog saat ini
sudah cukup jelas bagi pelanggan?”
Informan: “Beberapa pelanggan merasa
informasi dalam halaman tersebut kurang
meyakinkan karena tidak dilengkapi penilaian
dari pelanggan lai nnya.”
```

#### 5

```
Mengetahui
keterkaitan dengan
website dan validasi
kebutuhan fitur
penilaian
```

```
Peneliti: “Apakah Anda merasa bahwa fitur
penilaian pelanggan penting untuk disediakan?”
Informan: “Fitur ini penting disediakan untuk
pengambilan keputusan seperti membangun
kepercayaan pelanggan, serta membantu evaluasi
kualitas produk dan layanan.”
```

3.1.2 Quick Plan
Hasil dari tahap perencanaan cepat ini berupa perumusan kebutuhan
fungsional sistem yang disusun berdasarkan temuan dari proses komunikasi
sebelumnya. Kebutuhan ini mencakup fungsi utama yang harus dimiliki sistem
untuk memenuhi harapan pengguna. Daftar kebutuhan fungsional tersebut
dirangkum pada Tabel 4.

```
Tabel 4 Kebutuhan Fungsional Iterasi Pertama
ID Nama
Fungsi
```

```
Deskripsi
```

PU- 01 Mengubah
Status
Pesanan

```
Admin dapat mengubah status pesanan menjadi “Selesai”
untuk memicu fungsi Nilai Produk.
```

```
PU- 02 Nilai Produk Pelanggan memberikan peringkat 1 – 5, ulasan teks, opsi
anonim, unggah media (foto dan video) sesuai dengan
sub-produk yang telah dipesan.
PU- 03 Menunggu
Penilaian
```

```
Sistem menampilkan pesanan selesai yang belum
dinilai, beserta sisa hari, batas waktu dan akses untuk
memberi Nilai Produk.
PU- 04 Penilaian
Saya
```

```
Sistem menampilkan pesanan selesai yang sudah
dinilai, memberi akses untuk lihat detail penilaian yang
diberikan, dan akses edit penilaian sebelum ditanggapi
admin sebanyak satu kali.
PU- 05 Tanggapan
Penjual
```

```
Sistem menampilkan akses untuk lihat detail
tanggapan penjual, akses untuk edit penilaian setelah
ditanggapi admin sebanyak satu kali, dan akses untuk
membalas tanggapan admin sebanyak satu kali.
PU- 06 Penilaian
Masuk
```

```
Sistem menampilkan pesanan yang baru dinilai
pelanggan, dengan akses hapus dan balas sebanyak
satu kali oleh admin.
```

PU- 07 Penilaian
Diubah

Sistem menampilkan penilaian yang telah diedit
pelanggan, dengan akses hapus dan balas sebanyak
satu kali oleh admin, informasi tanggal diubahnya,
status tanggapan, jumlah edit, dan versi penilaian.
PU- 08 Penilaian
Tertunda

Sistem menampilkan pesanan yang belum dinilai
pelanggan, dengan opsi akses kirim pengingat melalui
WhatsApp.
PU- 09 Penilaian
Produk

Sistem menampilkan penilaian setiap sub-produk,
dengan informasi pesanan dan akses untuk lihat detail
penilaian, filter untuk menampilkan penilaian halaman
penilaian produk di website admin dan filter untuk
menampilkan penilaian halaman detail katalog di
website customer berdasarkan periode waktu tertentu,
serta akses untuk export penilaian ke excel
berdasarkan periode waktu tertentu.
PU- 10 Rincian
Penilaian

Menampilkan rata-rata peringkat dan total ulasan
setiap sub-produk.
PU- 11 Penilaian
Admin

Menampilkan penilaian yang telah ditindaklanjuti
admin.
PU- 12 Penilaian
Detail
Katalog

Menampilkan rata-rata peringkat, daftar penilaian dari
pelanggan lain, dan filter penilaian (jumlah peringkat,
tipe order, foto atau video) di halaman detail katalog.
PU- 13 Menu
Terlaris

```
Menampilkan carousel sub-produk di beranda
berdasarkan total ulasan dan rata-rata rating
```

3.1.3 Modelling Quick Design
a) Rancangan Antarmuka
Antarmuka pengguna dirancang untuk memudahkan pelanggan
memberikan peringkat dan ulasan melalui riwayat pemesanan serta
penilaian. Sementara itu, admin mendapat antarmuka manajemen penilaian
untuk memantau, menyaring, dan menanggapi ulasan secara terstruktur.
Rancangan awal digambar menggunakan Apple Notes pada Gambar 8 dan
mock-up dibuat menggunakan Figma pada Gambar 9.

```
Gambar 8 Sketsa Rancangan Antarmuka Pengguna
```

```
Gambar 9 Mock Up Rancangan Antarmuka Pengguna
```

b) Use Case Diagram
Use case diagram menunjukkan interaksi antara dua aktor utama, yaitu
pelanggan dan admin, dengan sistem berdasarkan fungsionalitas yang telah
dirumuskan, sebagaimana ditampilkan pada Gambar 10. Gambar tersebut
menunjukkan bahwa pelanggan dapat memberikan penilaian setelah
melakukan login dan pemesanan.

```
Gambar 10 Use case diagram peringkat dan ulasan bagian pelanggan
```

```
Use case diagram ini menggambarkan interaksi Pelanggan dengan sistem
e-commerce, dimulai dari opsi Register untuk membuat akun baru atau
Login bagi pengguna terdaftar, yang kemudian memungkinkan akses ke
berbagai fitur seperti Account, Checkout, Penilaian, dan Riwayat.
Pelanggan dapat mengakses Beranda untuk menjelajahi Katalog (Produk),
```

```
melihat Sub Katalog (Sub Produk), dan membuka Detail Sub Katalog
(Detail Sub Produk), yang selanjutnya dapat menambahkan katalog ke
Keranjang. Pelanggan yang belum login hanya dapat melihat katalog dan
menambahkannya ke keranjang tanpa bisa melakukan checkout, sedangkan
proses checkout hanya dapat dilakukan oleh pelanggan yang sudah login.
Hal ini direpresentasikan dengan relasi <<include>> dari use case Login
menuju Checkout, yang berarti setiap kali sistem menjalankan proses
checkout, proses login menjadi prasyarat wajib sebelum checkout, sehingga
pelanggan yang belum login akan diarahkan untuk login atau mendaftar
terlebih dahulu. Proses Checkout otomatis tercatat di Riwayat, yang juga
menjadi pintu untuk memberikan Penilaian. Fitur Penilaian mencakup
akses ke Penilaian Saya, Menunggu Penilaian, dan Tanggapan Penjual,
sementara Menunggu Penilaian akan mengarah pada proses Nilai Produk.
Relasi <<include>> menunjukkan bahwa beberapa proses selalu dijalankan
bersama, misalnya melihat katalog selalu mencakup sub katalog. Diagram
ini mengilustrasikan alur lengkap mulai dari pendaftaran, pencarian
katalog, transaksi, hingga evaluasi pengalaman belanja.
```

```
Gambar 11Use case diagram peringkat dan ulasan bagian admin
```

Gambar 11 pada bagian admin menunjukkan proses dimulai dari Login,
yang menjadi prasyarat untuk mengakses sistem backend. Setelah login,
admin diarahkan ke Dashboard yang menjadi pusat kontrol. Dari
dashboard, admin dapat mengakses Manajemen Nilai untuk mengelola
seluruh aktivitas penilaian dalam sistem. Manajemen ini terdiri dari
beberapa komponen: Penilaian Admin yang mencakup tanggapan atas
penilaian pelanggan, Riwayat Penilaian berisi Rincian Penilaian dan
Penilaian Produk. Selain itu, admin juga dapat melihat Status Penilaian
yang terbagi menjadi tiga kategori, yaitu Penilaian Tertunda, Penilaian
Masuk, dan Penilaian Diubah. Semua fitur tersebut saling berkaitan dan
mendukung peran admin dalam mengontrol dan menilai kualitas masukan
dari pelanggan, serta menjaga integritas sistem penilaian.
.
c) Activity Diagram
Activity diagram menggambarkan rangkaian aktivitas yang dimulai dari
proses pemesanan hingga pemberian penilaian oleh pelanggan. Ilustrasi
alur proses secara menyeluruh dapat dilihat pada Gambar 1 2. Pada diagram

tersebut, alur sistem menjadi lebih interaktif dengan tambahan fitur
peringkat dan ulasan. Pelanggan yang belum login dapat melihat detail sub
produk, tetapi perlu login untuk mengakses profil dan riwayat pemesanan.
Sistem menampilkan status pemesanan secara lengkap (diterima, diproses,
diantar, selesai, dibatalkan) yang dikelola admin pada manajemen order
pesanan, dan hanya pesanan berstatus "selesai" yang dapat diberikan nilai
oleh pelanggan. Setelah mengisi nilai produk, data disimpan ke tabel
product_reviews. Pelanggan dapat melihat dan mengedit penilaian (data
akan disimpan ke tabel product_reviews_update), selain itu juga dapat
membalas tanggapan admin sebanyak satu kali. Admin setelah login dapat
mengakses status penilaian untuk melihat list penilaian tertunda, masuk,
atau yang sudah diubah. Admin juga dapat menghapus atau membalas
penilaian, mengirim pengingat WhatsApp ke pelanggan yang belum
menilai, dan mengetahui rata-rata rating setiap sub produk. Pelanggan juga
dapat memfilter penilaian di halaman detail sub produk (sub katalog)
berdasarkan rating, media (foto/video), dan tipe order. Proses ini
memberikan pengalaman yang lebih transparan, interaktif, dan informatif
bagi pelanggan maupun admin.

Gambar 12 Activity diagram Iterasi Pertama

d) Entity Relationship Diagram

```
Gambar 13 Entity Relationship Diagram sistem peringkat dan ulasan
```

```
Entity Relationship Diagram menggambarkan hubungan antar entitas
dalam sistem, sebagaimana ditampilkan pada Gambar 1 3. Dalam sistem ini,
berbagai entitas saling berhubungan untuk membentuk alur proses
manajemen produk dan pengguna, pemesanan, hingga penilaian. Setiap
entitas memiliki peran serta keterkaitan logis satu sama lain, yang
direpresentasikan melalui relasi berbasis kardinalitas seperti penjelasan
pada Gambar 5. Berikut ini adalah penjelasan mengenai hubungan antar
entitas utama dalam sistem yang dapat dilihat pada Tabel 5.
```

```
Tabel 5 Relasi antar Entitas Website Pemesanan AGFI
No. Entitas Relasi
```

```
1 User dan Order
```

```
Setiap Order harus dimiliki oleh tepat satu User.
Setiap User boleh tidak memiliki Order sama
sekali, atau bisa memiliki banyak Order.
```

#### 2

```
User dan Customer
Address
```

```
Setiap Customer Address harus dimiliki oleh
tepat satu User. Setiap User boleh tidak
memiliki Customer Address, atau bisa memiliki
banyak Customer Address.
```

```
3 User dan Review
```

```
Setiap Review harus ditulis oleh tepat satu User.
Setiap User boleh tidak menulis Review, atau
bisa menulis banyak Review.
```

No. Entitas Relasi

4 User dan Order

```
Setiap Order harus dimiliki oleh tepat satu
User. Setiap User boleh tidak memiliki Order
sama sekali, atau bisa memiliki banyak Order.
```

#### 5

```
User dan Customer
Address
```

```
Setiap Customer Address harus dimiliki oleh
tepat satu User. Setiap User boleh tidak
memiliki Customer Address, atau bisa memiliki
banyak Customer Address.
```

#### 6

```
User dan Product
Review
```

```
Setiap Product Review harus dibuat oleh tepat
satu User. Setiap User boleh tidak membuat
Product Review, atau bisa membuat banyak
Product Review.
```

#### 7

```
Order dan Order
Item
```

```
Setiap Order Item harus termasuk dalam tepat
satu Order. Setiap Order harus memiliki
setidaknya satu Order Item, dan bisa memiliki
banyak Order Item.
```

8
Order dan Order
Status

```
Setiap Order harus memiliki tepat satu Order
Status. Setiap Order Status dapat digunakan
oleh satu atau lebih Order.
```

9
Order dan Order
Detail

```
Setiap Order Detail harus terhubung ke tepat
satu Order. Setiap Order dapat memiliki satu
atau lebih Order Detail.
```

10 Order dan Review

```
Setiap Review ditulis untuk tepat satu Order.
Setiap Order dapat memiliki nol atau lebih
Review dari User.
```

11
Order Item dan Sub
Produk

```
Setiap Order Item berasal dari tepat satu Sub
Produk. Setiap Sub Produk dapat menjadi
bagian dari banyak Order Item.
```

12
Order Item dan
Order Item Choices

```
Setiap Order Item Choice harus terhubung ke
tepat satu Order Item. Setiap Order Item bisa
memiliki nol atau lebih Order Item Choices.
```

13

```
Order Item dan
Order Item
Additions
```

```
Setiap Order Item Addition harus terhubung ke
tepat satu Order Item. Setiap Order Item bisa
memiliki nol atau lebih Order Item Additions.
```

14
Order Item dan
Product Review

```
Setiap Product Review terkait dengan tepat satu
Order Item. Setiap Order Item dapat memiliki
maksimal satu Product Review atau tidak ada.
```

#### 15

```
Order Item Choices
dan Pilihan/Sub
Pilihan
```

```
Setiap Order Item Choice mengaitkan satu
Order Item, satu Pilihan, dan satu Sub Pilihan.
Relasi ini menunjukkan pilihan spesifik yang
dipilih untuk satu Order Item.
```

#### 16

```
Order Item
Additions dan
Pelengkap
```

```
Setiap Order Item Addition mengaitkan satu
Order Item dengan satu Pelengkap. Relasi ini
digunakan untuk menambahkan komponen
tambahan ke pesanan.
```

17 Produk dan Sub
Produk

```
Setiap Sub Produk berasal dari tepat satu
Produk. Setiap Produk dapat memiliki banyak
Sub Produk.
```

```
No. Entitas Relasi
```

```
18
Sub Produk dan
Order Item.
```

```
Setiap Order Item merujuk pada tepat satu Sub
Produk. Setiap Sub Produk bisa muncul dalam
banyak Order Item.
```

```
19
Sub Produk dan
Pilihan
```

```
Setiap Pilihan dapat digunakan oleh satu atau
lebih Sub Produk. Setiap Sub Produk dapat
memiliki banyak Pilihan yang terkait.
```

```
20
Pilihan dan Sub
Pilihan
```

```
Setiap Sub Pilihan merupakan turunan dari tepat
satu Pilihan. Setiap Pilihan dapat memiliki
banyak Sub Pilihan.
```

```
21
Sub Produk dan
Pelengkap
```

```
Setiap Pelengkap bisa ditautkan ke satu atau
lebih Sub Produk. Setiap Sub Produk bisa
memiliki banyak Pelengkap.
```

#### 22

```
Sub Produk dan
Perlengkapan Sub
Produk
```

```
Setiap entri dalam Perlengkapan Sub Produk
mengaitkan satu Sub Produk dengan satu
Pelengkap. Relasi ini menunjukkan pelengkap
default dari sebuah sub produk.
```

#### 23

```
Sub Produk dan
PilihanSubProduk
```

```
Setiap entri Pilihan SubProduk mengaitkan satu
Pilihan dengan satu Sub Produk. Ini
memungkinkan satu Sub Produk memiliki
banyak Pilihan.
```

#### 24

```
Product Review dan
Product Review
Update
```

```
Setiap Product Review Update mengacu pada
satu Product Review. Setiap Product Review
dapat memiliki nol atau lebih Update sebagai
histori perubahannya.
```

3.1.4 Construction of Prototype
Tahap ini merupakan proses penerjemahan rancangan konseptual dari
tahap modelling quick design menjadi kode program yang dapat dijalankan.
Implementasi dimulai dengan pembuatan models untuk merepresentasikan
struktur dan relasi basis data, dilanjutkan dengan controller yang mengatur
logika bisnis dan pengolahan data, serta view sebagai antarmuka pengguna
untuk menampilkan data dan interaksi secara visual. Ketiga komponen ini
terintegrasi membentuk aplikasi yang utuh dan dapat digunakan sesuai tujuan
perancangan awal.
Dalam proses pengembangan sistem ini, telah dibuat halaman yang
menampilkan riwayat pemesanan pada website pelanggan. Halaman ini hanya
dapat diakses oleh pelanggan yang telah melakukan login. Gambar 1 4
memperlihatkan tampilan halaman riwayat pemesanan yang tersedia setelah
pelanggan berhasil masuk ke dalam akun mereka. Melalui halaman ini,
pelanggan dapat melihat berbagai informasi terkait pesanan yang telah
dilakukan, seperti Order ID, Tanggal, Total, Struk, serta Status. Terdapat lima
jenis status pesanan yang digunakan dalam sistem, yaitu: Diterima, Diproses,
Diantar, Selesai, dan Dibatalkan. Setelah proses pemesanan dan transaksi
dinyatakan selesai, admin akan memperbarui status pesanan menjadi Selesai
melalui panel admin pada menu Manajemen Order halaman pesanan,
sebagaimana ditampilkan pada Gambar 1 5.

```
Gambar 14 Halaman Riwayat Pemesanan pada Akun Pelanggan
```

```
Gambar 15 Halaman Pesanan pada Manajemen Order
```

Gambar 1 6 menunjukkan kode program yang mengatur logika untuk
menampilkan list daftar seluruh pesanan pelanggan (user) yang sedang login
dalam bentuk view pada halaman riwayat pemesanan. List dibagi menjadi
terdapat 5 baris data per halaman dan diurutkan dari yang terbaru ke yang
terlama. Data pesanan yang dimuat terdapat informasi item pesanan, status
pesanan, dan penilaian pesanan.

```
Gambar 16 Proses Menampilkan Seluruh Pesanan Pelanggan
```

Jika status pesanan pelanggan telah berubah menjadi Selesai, maka pada
halaman riwayat pemesanan akan muncul tombol aksi "Nilai Produk", yang
dapat diklik untuk memberikan penilaian terhadap sub produk yang dipesan.

Ketika tombol "Nilai Produk" diklik, akan muncul jendela pop-up (modal)
berisi fitur "Beri Ulasan", seperti yang ditunjukkan pada Gambar 1 7. Pada fitur
ini, pelanggan dapat memberikan penilaian secara anonim maupun tidak
anonim, dengan memberikan rating dalam bentuk simbol bintang yang
terkandung nilai 1 (Sangat Buruk), 2 (Buruk), 3 (Biasa), 4 (Baik), hingga 5
(Sangat Baik), review dalam bentuk teks, media foto dan video (opsional).
Seluruh fitur penilaian tersebut ditampilkan secara lengkap pada Gambar 1 8.
Setelah penilaian dikirim, tombol aksi akan berubah menjadi “Cek Penilaian”
untuk diarahkan ke halaman Penilaian. Tombol aksi juga dapat berubah
menjadi “Penilaian Kadaluwarsa” jika pelanggan terlambat memberi penilaian
dari batas waktu yang telah ditentukan (30 hari setelah pesanan selesai).

```
Gambar 17 Nilai Produk pada Halaman Riwayat Pemesanan
```

```
Gambar 18 Beri Ulasan pada Halaman Riwayat Pemesanan
```

Gambar 1 9 menunjukkan kode program untuk mengambil dan
menampilkan detail satu pesanan pada halaman riwayat pemesanan secara
dinamis dalam format JSON berdasarkan ID, termasuk informasi umum seperti
status pesanan, tanggal, total, jumlah dan daftar item yang dipesan beserta
gambarnya. Alert dalam nilai produk ditampilkan pada Lampiran 11 hingga 16.

```
Gambar 19 Menampilkan Satu Detail Pesanan Pelanggan
```

Selanjutnya untuk tampilan halaman penilaian pada sisi pelanggan dibagi
menjadi tiga tab navigasi bagian / section yaitu Menunggu Penilaian, Penilaian
Saya, dan Tanggapan Penjual. Pertama, melalui section Menunggu Penilaian,
pelanggan dapat melihat daftar pesanan yang telah berstatus selesai namun
belum diberikan penilaian. Setiap baris dalam tabel menampilkan informasi
seperti Order ID, total transaksi, batas waktu penilaian, sisa hari untuk
memberikan penilaian, dan aksi untuk menghadirkan tombol “Nilai Produk”.
Apabila batas waktu penilaian telah lewat, maka akan muncul keterangan
seperti “Terlambat 101 hari” dengan teks berwarna merah. Sebaliknya, jika
masih tersedia waktu, akan tampil informasi “Sisa 11 hari” dengan teks
berwarna hijau. Tombol aksi “Nilai Produk” hanya aktif untuk pesanan yang
masih berada dalam masa penilaian. Fitur ini memudahkan pelanggan untuk
mengetahui produk mana yang perlu segera dinilai sebelum waktu berakhir.
Pesanan yang telah dinilai akan masuk ke section Penilaian Saya dan
dihilangkan dari daftar Menunggu Penilaian. Tampilan ini dapat dilihat pada
Gambar 20.

```
Gambar 20 Halaman Penilaian Bagian Menunggu Penilaian
```

Selanjutnya, pada section Penilaian Saya, ditampilkan daftar produk
yang telah dinilai oleh pelanggan. Setiap baris berisi informasi tentang Order
ID, total transaksi, tanggal penilaian, dan aksi berupa tombol “Lihat Detail”
dan “Edit”. Tombol “Lihat Detail” memungkinkan pelanggan untuk melihat

kembali penilaian yang telah mereka berikan, sedangkan tombol “Edit”
memungkinkan pelanggan melakukan perubahan atau pembaruan terhadap
penilaian tersebut sebanyak satu kali sebelum admin memberikan tanggapan.
Fitur ini memberikan fleksibilitas bagi pelanggan dalam menyampaikan
pengalamannya secara lebih akurat. Tampilan ini disajikan pada Gambar 21.

```
Gambar 21 Halaman Penilaian Bagian Penilaian Saya
```

Pada aksi "Lihat Detail" dan "Edit" di halaman Penilaian Saya, sistem
akan menyediakan tampilan pop-up yang memperlihatkan detail pesanan
secara menyeluruh, termasuk daftar produk yang telah dibeli dan dinilai. Pada
pop-up tersebut, pengguna dapat memilih tombol “Cek Ulasan” untuk melihat
kembali penilaian yang telah mereka berikan secara lebih lengkap, mulai dari
peringkat, komentar, hingga foto dan video yang diunggah seperti yang
ditampilkan pada Gambar 2 2 dan Gambar 2 3.

```
Gambar 22 Lihat Detail pada Bagian Penilaian Saya
```

```
Gambar 23 Cek Ulasan pada Bagian Penilaian Saya
```

Jika pengguna ingin melakukan perubahan terhadap ulasan tersebut,
tersedia pula tombol “Edit Ulasan” yang mengarahkan ke formulir pembaruan
penilaian. Alert dalam fitur ini terdapat dalam Lampiran 17 dan Lampiran 18.
Di dalam formulir tersebut, pengguna dapat memperbarui peringkat, isi
komentar, serta mengganti media berupa foto dan video yang telah dikirimkan
sebelumnya yang ditampilkan pada Gambar 2 4 dan Gambar 2 5. Tampilan
antarmuka yang interaktif ini memudahkan pengguna untuk memberikan
penilaian yang lebih akurat dan relevan terhadap produk yang mereka beli.

```
Gambar 24 Edit pada Bagian Penilaian Saya
```

```
Gambar 25 Edit Ulasan pada Bagian Penilaian Saya
```

Terakhir, pada section Tanggapan Penjual, pelanggan dapat melihat
daftar penilaian yang telah ditanggapi oleh pihak penjual. Informasi pada tabel
ini meliputi Order ID, total transaksi, tanggal penilaian diberi tanggapan oleh
penjual, serta aksi berupa tombol “Cek Tanggapan” dan “Balas”. Tampilan
antarmuka fitur ini dapat dilihat pada Gambar 2 6. Fitur “Cek Tanggapan”
digunakan untuk membaca balasan dari penjual terhadap penilaian yang telah
diberikan pelanggan, sebagaimana ditunjukkan pada Gambar 2 7. Pada
tampilan ini juga tersedia tombol “Edit Ulasan” dan “Lihat Detail” untuk
memberikan keleluasaan kepada pelanggan dalam meninjau kembali penilaian
yang mereka buat seperti yang ditunjukkan pada Gambar 28, serta melakukan
pengeditan jika diperlukan. Sementara itu, fitur “Balas” memungkinkan
pelanggan memberikan respons lanjutan atas tanggapan penjual.

```
Gambar 26 Halaman Penilaian Bagian Tanggapan Penjual
```

```
Gambar 27 Cek Tanggapan Bagian Tanggapan Penjual
```

```
Gambar 28 Lihat Detail Bagian Tanggapan Penjual
```

Adanya fitur “Edit Ulasan” pada pop-up “Cek Tanggapan” sebagaimana
ditampilkan pada Gambar 2 9 meskipun penjual sudah memberikan tanggapan
didasarkan pada tujuan menjaga fleksibilitas dan keadilan bagi pelanggan,
pelanggan diberikan kesempatan maksimal dua kali untuk mengedit penilaian:
a. Satu kali sebelum ditanggapi oleh admin, untuk memperbaiki kata-kata
atau mengubah peringkat apabila ada kekeliruan.
b. Satu kali setelah ditanggapi oleh admin, sebagai bentuk tanggapan balik
terhadap balasan admin atau untuk mengoreksi ulang isi penilaian.
Jadi, apabila pelanggan sudah menggunakan kesempatan edit sebelum
ditanggapi, maka edit yang dilakukan setelah ditanggapi akan menggantikan
isi dari update penilaian sebelumnya.
Sementara itu, admin hanya dapat memberikan satu kali tanggapan
terhadap setiap penilaian pelanggan, dan pelanggan juga hanya dapat
membalas tanggapan admin sebanyak satu kali sebagaimana ditampilkan
dalam Gambar 30. Balasan pelanggan ini tidak ditampilkan pada halaman
detail katalog (detail sub produk), tetapi menjadi bagian dari riwayat interaksi.
Pembatasan bahwa admin hanya dapat memberi satu tanggapan untuk
menjaga profesionalitas dan menghindari perdebatan terbuka. Pelanggan juga
hanya dapat membalas satu kali untuk memberi respons atau klarifikasi
tambahan. Jika perlu diskusi lebih lanjut, admin akan menginformasikan
bahwa komunikasi dialihkan ke WhatsApp dan admin yang menjadi pihak
pertama dalam menghubungi pelanggan berdasarkan data pemesanan. Alert
pada section tanggapan penjual ditampilkan dalam Lampiran 19 hingga 23.

```
Gambar 29 Edit Ulasan Bagian Tanggapan Penjual
```

```
Gambar 30 Balas Bagian Tanggapan Penjual
```

Sementara itu, menu manajemen penilaian pada sisi admin bagian status
penilaian terbagi menjadi tiga tab, yaitu Penilaian Masuk, Penilaian Tertunda,
dan Penilaian Diubah. Gambar 31 menunjukkan daftar penilaian yang baru
masuk dengan informasi nomor pesanan, tanggal masuk, nama pelanggan, total
pembayaran, dan tombol aksi untuk membalas atau menghapus penilaian.
Gambar 32 menampilkan daftar penilaian yang tertunda, dilengkapi informasi
tanggal tertunda, nama pelanggan, total pembayaran, serta tombol aksi
“Ingatkan” untuk mengirim pesan pengingat ke kontak WhatsApp pelanggan.
Sementara itu, Gambar 33 memperlihatkan daftar penilaian yang sudah diubah,
menampilkan data tanggal diubah, status tanggapan (menunggu balasan admin,
menunggu balasan pelanggan, dan selesai interaksi), jumlah edit, versi
penilaian, nama pelanggan, total pembayaran, dan tombol aksi balas penilaian
oleh admin, sehingga ketiga tampilan ini berfungsi memudahkan admin
memantau dan mengelola seluruh status penilaian pelanggan secara terstruktur.

```
Gambar 31 Tampilan Menu Status Penilaian Masuk
```

```
Gambar 32 Tampilan Menu Status Penilaian Tertunda
```

```
Gambar 33 Tampilan Menu Status Penilaian Diubah
```

Setelah admin mengklik tombol "Balas" pada kolom Aksi. Pada gambar
34 ditampilkan informasi lengkap pesanan dengan Order ID, data pelanggan
termasuk nama, nomor telepon, tanggal, waktu pemesanan, tipe order, status
pesanan sudah pasti Selesai, menu yang dipesan beserta rating, ulasan teks,
foto, serta status video dan balasan admin.

```
Gambar 34 Tampilan Balas Penilaian oleh Admin
```

Selanjutnya, jika admin klik icon pensil maka akan muncul pop-up
"Tanggapan Penjual" yang memberi kesempatan admin untuk merespons
penilaian pelanggan sebanyak satu kali saja. Di dalam pop-up ini, admin dapat
mengisi balasan dalam bentuk teks, mengunggah foto (format JPG, PNG, JPEG
maksimal 2MB), atau mengunggah video (format MP4, AVI, MOV maksimal
10MB). Tersedia tombol Batal untuk menutup pop-up tanpa mengirimkan
balasan, dan tombol Kirim Balasan untuk mengirim respons kepada pelanggan.
Alert membalas penilaian ditunjukkan pada Lampiran 24 dan Lampiran 25.

```
Gambar 35 Tampilan Tanggapan Penjual oleh Admin
```

Fungsi status() digunakan untuk menampilkan daftar penilaian
pelanggan di halaman admin dengan tiga kategori tab yaitu masuk (penilaian
baru tanpa balasan penjual dan belum pernah diedit), tertunda (pesanan selesai

namun belum ada penilaian sama sekali), dan diubah (penilaian yang sudah
diperbarui pelanggan). Masing-masing query dapat difilter berdasarkan kata
kunci nama pelanggan dan hanya mengambil pesanan dengan order_status_id
bernilai 4 (selesai), serta memuat relasi dengan orderItems.reviews dan
productUpdates. Hasil tiap kategori dipaginasi 5 data per halaman dengan
pengaturan tab aktif sesuai request. Sementara itu, fungsi destroy($orderId)
berfungsi untuk menghapus semua penilaian pesanan berdasarkan orderId
terkait, dengan cara mengambil order beserta relasi orderItems.reviews lalu
menghapus setiap penilaian di dalamnya, dan setelah itu mengembalikan
admin ke halaman sebelumnya dengan pesan sukses. Proses implementasi
fungsi status dapat dilihat pada Gambar 36 dan 37.

```
Gambar 36 Implementasi Kode Program Status Penilaian
```

```
Gambar 37 Implementasi Kode Program Status Penilaian Lanjutan
```

Selain implementasi di atas, terdapat juga implementasi API Fonnte
untuk keperluan fitur notifikasi pengingat pada halaman penilaian tertunda.
Pada pengembangan sebelumnya, Fonnte telah digunakan untuk keperluan
autentikasi pelanggan, saat ini fungsi ingatkan digunakan untuk mengirim
pesan WhatsApp kepada pelanggan setelah mereka melakukan pemesanan di
Ayam Goreng Fatmawati. Pertama, fungsi mencari data pesanan dan pelanggan
berdasarkan $id, lalu mengambil nomor telepon pelanggan. Nomor telepon ini
dibersihkan dari tanda hubung, kemudian diformat agar sesuai dengan format
internasional Indonesia (62). Jika diawali 08, diganti menjadi 62; jika diawali
62, langsung digunakan; dan jika tidak sesuai, dipaksa menggunakan 62 di
depannya. Setelah itu, dibuat URL menuju halaman penilaian dan pesan ucapan
terima kasih yang berisi ajakan untuk memberikan review. Fungsi kemudian
memanggil metode sendMessage dari $fonteeService untuk mengirimkan
pesan tersebut. Jika pengiriman berhasil, pengguna diarahkan kembali dengan
notifikasi sukses. Jika gagal, akan dikembalikan dengan pesan error yang berisi
alasan kegagalan. Proses tersebut dapat dilihat pada Gambar 38 dan Gambar
39 yang merupakan pondasi implementasi fonteeservice.

```
Gambar 38 Pengambilan Token Fonnte untuk Integrasi API
```

```
Gambar 39 Implementasi Kode Program Ingatkan dengan FonteeService
```

Kemudian, untuk tampilan pesan yang terkirim dalam WhatsApp
pelanggan dapat dilihat pada Gambar 40. Di mana sistem secara otomatis
mengirimkan pesan personalisasi ke nomor WhatsApp pelanggan yang berisi
ucapan terima kasih atas pemesanan, informasi bahwa pesanan telah selesai,
serta ajakan untuk memberikan penilaian sebelum batas waktu yang ditentukan
(30 hari sejak pesanan selesai). Pesan ini juga dilengkapi dengan tautan
langsung menuju halaman penilaian agar pelanggan dapat dengan mudah
memberikan rating dan review. Pada contoh di gambar, pelanggan merespons
positif dengan ucapan terima kasih dan mengirimkan stiker apresiasi, yang
kemudian dibalas oleh admin sebagai bentuk interaksi dan menjaga hubungan
baik dengan pelanggan. Hal ini menunjukkan bahwa implementasi API Fonnte
tidak hanya berfungsi sebagai pengingat, tetapi juga menjadi sarana
komunikasi dua arah yang meningkatkan keterlibatan pelanggan (customer
engagement) dan berpotensi memperbaiki tingkat partisipasi dalam pemberian
penilaian.

```
Gambar 40 Tampilan Pesan Pengingat yang Terkirim dalam WhatsApp
```

Selanjutnya, dalam menu Riwayat Penilaian pada tab Penilaian Produk
dapat dilihat pada Gambar 41, ditampilkan tabel daftar penilaian dari pelanggan
yang memuat informasi seperti Order ID, Nama Sub Produk, Tanggal, Nama
Customer, Total Pesanan, Rating berbentuk bintang, teks Review, dan tombol
aksi Detail untuk melihat penilaian seperti pada Gambar 44. Admin juga
memiliki opsi untuk melihat penilaian berdasarkan periode waktu tertentu
melalui fitur Lihat Penilaian Admin per Periode dan mengatur tampilan penilaian
yang ditampilkan kepada pelanggan di halaman detail katalog (sub produk)
melalui Kontrol Tampilan Customer, mencari data berdasarkan kata kunci,
memfilter rating dengan tombol angka bintang, serta mengekspor data penilaian
produk ke dalam file excel melalui tombol Export Penilaian Produk yang hasil
rekanannya dapat dilihat pada Gambar 45.

```
Gambar 41 Tampilan Menu Penilaian Produk
```

Pada Gambar 42 dan Gambar 43, diperlihatkan penggunaan fitur filter
periode waktu di bagian Pilih Periode dan Kontrol Tampilan Customer, yang
menyediakan opsi seperti Hari Ini, 1 Minggu Terakhir, 1 Bulan Terakhir, 3 Bulan
Terakhir, 6 Bulan Terakhir, 1 Tahun Terakhir, maupun Semua Waktu, sehingga
admin dapat menyaring daftar penilaian sesuai jangka waktu yang diinginkan.

```
Gambar 42 Lihat Penilaian Admin per Periode
```

```
Gambar 43 Atur Penilaian Customer per Periode
```

```
Gambar 44 Detail Penilaian Setiap Produk
```

```
Gambar 45 Export Excel Rekap Penilaian Produk Per Periode Waktu
```

Selain halaman Penilaian Produk, terdapat juga halaman Rincian
Penilaian yang muncul setelah admin mengklik tab section tersebut di menu
Riwayat Penilaian yang dapat dilihat pada Gambar 46. Pada tampilan ini, data
disajikan dalam bentuk tabel yang merangkum performa setiap sub produk
berdasarkan ulasan pelanggan. Tabel memuat kolom Nomor, Foto Menu,
Nama Sub Produk, Kategori, Total Ulasan, dan Rata-Rata Rating. Setiap baris
merepresentasikan satu menu yang dijual, disertai gambar sub produk untuk
memudahkan identifikasi visual. Informasi Total Ulasan menunjukkan jumlah
penilaian yang diterima, sedangkan Rata-Rata Rating dihitung dari seluruh
penilaian yang masuk. Di bagian atas, tersedia kolom pencarian untuk
memfilter produk berdasarkan nama atau kategori, serta tombol filter
berdasarkan rating (bintang 1 hingga 5). Di bagian bawah, terdapat pagination
untuk berpindah halaman data produk yang memiliki banyak entri. Tampilan
ini membantu admin dalam memantau kualitas setiap menu berdasarkan
masukan pelanggan secara ringkas dan terukur. Pada Gambar 47 ditampilkan
proses implementasi perhitungan rata-rata rating. Dalam kode tersebut
berfungsi untuk menampilkan data penilaian setiap sub produk dengan
menghitung jumlah ulasan, total rating, rata-rata rating, dan tanggal penilaian
terbaru yang diterima.

```
Gambar 46 Tampilan Menu Rincian Penilaian
```

```
Gambar 47 Implementasi Perhitungan Rata-rata Rating
```

Contoh pada Tabel 6 menunjukkan cara menghitung statistik penilaian (review)
ketika setiap orang hanya bisa memberi rating bulat 1–5, di mana setiap review bisa
saja memiliki pembaruan (update) yang mengganti rating dan tanggalnya jika
ditandai (is_displayed = true), rating dan tanggal dari pembaruan itu yang
digunakan, jika tidak maka dipakai rating dan tanggal review asli.
Setiap rating dikumpulkan untuk dihitung jumlah review (totalReviews), total
semua nilai rating (totalRating), rata-rata rating dibulatkan 2 desimal
(averageRating), dan tanggal review terbaru (latestReviewDate). Hasil per item
kemudian disimpan di $subProduk sebelum dikembalikan. Pada kasus ini, empat
review yang terhitung adalah rating 4 (update), 3 (asli), 4 (update), dan 4 (asli)
sehingga total review menjadi 4, total rating 15, dan rata-rata rating diperoleh
dengan membagi total rating 15 dengan jumlah review 4, menghasilkan 3.75.
Tanggal review terbaru ditentukan dengan membandingkan semua tanggal
yang dipakai (baik dari update maupun dari review asli) dan mengambil yang paling
terakhir, yaitu 2025- 07 - 20. latestReviewDate berguna untuk ditampilkan di
halaman produk, diurutkan berdasarkan yang terbaru, atau dipantau aktivitasnya.

```
Tabel 6 Contoh Perhitungan Statistik Penilaian
Review Rating
Asli
```

```
Tanggal
Asli
```

```
Update
Rating
```

```
Tanggal
Update
```

```
is_displayed
```

```
# 1 2 2025 - 07 - 01 4 2025 - 07 - 10 True
```

#### # 2 3 2025 - 07 - 15 - - -

```
# 3 5 2025 - 07 - 05 4 2025 - 07 - 20 True
```

```
# 4 4 2025 - 07 - 18 - - -
```

a. Proses per review:

* Review #1 → ada update → rating 4, tanggal 2025- 07 - 10
* Review #2 → tanpa update → rating 3, tanggal 2025- 07 - 15
* Review #3 → ada update → rating 4, tanggal 2025- 07 - 20
* Review #4 → tanpa update → rating 4, tanggal 2025- 07 - 18

b. Kumpulan rating = [4, 3, 4, 4]

* totalReviews = 4
* totalRating = 4 + 3 + 4 + 4 = 15
* averageRating = 15 ÷ 4 = 3.75

c. Tanggal terbaru:

* Review #1 = 2025- 07 - 10 paling lama → update ke Review #2,
* Review #2 (2025- 07 - 15) lebih baru → update ke Review #3,
* Review #3 (2025- 07 - 20) lebih baru → update ke Review #4,
* Review #4 (2025- 07 - 18) tidak lebih baru dari 2025- 07 - 20 (Review #3)

d. Hasil akhir:

* totalReviews = 4
* totalRating = 15
* averageRating = 3.75
* latestReviewDate = 2025- 07 - 20

Menu sub produk yang telah masuk ke data halaman rincian penilaian
pada Gambar 46 akan ditampilkan pada halaman beranda website pelanggan
dengan fungsi Menu Terlaris yang dapat dilihat pada Gambar 48. Pada bagian
atas terlihat judul Cita Rasa Juara sebagai penegasan kualitas menu yang
ditawarkan. Di bawahnya terdapat empat cards menu yang masing-masing
menampilkan foto hidangan, nama menu, harga, rata-rata rating, serta jumlah
ulasan yang sudah masuk. Penempatan rating bintang dan jumlah ulasan secara
visual berfungsi untuk memberikan bukti sosial (social proof) kepada
pengunjung bahwa menu tersebut populer dan disukai pelanggan sebelumnya,
sehingga dapat mempengaruhi keputusan pembelian. Setiap kartu menu
dilengkapi tombol Pesan yang memudahkan pengguna melakukan pembelian

langsung. Desain antarmuka menggunakan skema warna kuning dan oranye
yang konsisten dengan identitas merek. Di bagian bawah, terdapat teks ajakan
yang memperkuat pesan pemasaran.

```
Gambar 48 Menu Terlaris halaman Beranda
```

Pada fungsi terakhir terdapat menu Penilaian Admin, yang menampilkan
daftar penilaian pelanggan dalam tabel berisi order, tanggal balas, nama
customer, total pesanan, dan aksi untuk melihat detail yang ditampilkan pada
Gambar 4 9. Saat admin mengklik Lihat Detail (berwarna kuning), muncul
halaman Detail Tanggapan Admin yang memuat informasi pesanan seperti ID
order, status pesanan selesai, catatan, tipe order, serta daftar sub produk yang
dipesan lengkap dengan rating, review, status media, dan tombol untuk melihat
detail per sub produk yang dapat dilihat pada Gambar 50 dan Gambar 51. Jika
tombol Lihat Detail (berwarna biru) dibuka, akan muncul pop-up Detail Review
yang memperlihatkan isi penilaian, balasan admin, dan media pendukung dari
pelanggan maupun admin, sehingga memudahkan admin dalam menelusuri
penilaian dari tingkat daftar hingga detail per sub produk untuk memeriksa
kembali tanggapan yang telah diberikannya pada halaman status penilaian
bagian penilaian masuk dan diubah.

```
Gambar 49 Halaman Penilaian Admin
```

```
Gambar 50 Lihat Detail Penilaian Admin
```

```
Gambar 51 Detail Review Penilaian Admin
```

Secara teknis, fungsi penilaianAdmin() ditampilkan pada Gambar 52
menggunakan model Order untuk mengambil data pesanan yang sudah
memiliki balasan admin dengan memanfaatkan relasi with(['orderItems',
'orderItems.reviews']) agar data item pesanan dan penilaiannya diload
sekaligus, lalu difilter menggunakan whereHas('orderItems.reviews', ...) untuk
menampilkan item yang kolom date_sellernya tidak bernilai null, yang berarti
penilaian tersebut sudah dibalas. Data hasil filter diurutkan berdasarkan kolom
orders.created_at secara menurun (desc) sehingga yang terbaru muncul di atas,
kemudian dibatasi per halaman menggunakan paginate(5) untuk memudahkan
navigasi pada tabel. Hasil query tersebut disimpan ke variabel
$penilaianAdmin dan diteruskan ke view admin.penilaian.admin melalui fungsi
compact() sehingga dapat ditampilkan antarmuka sesuai format tabel yang ada.

```
Gambar 52 Implementasi Kode Program Penilaian Admin
```

```
Gambar 53 Halaman Detail Katalog
```

Halaman detail katalog ini menampilkan informasi lengkap produk, mulai
dari foto, deskripsi singkat, harga, pilihan menu tambahan, serta opsi varian.
Pelanggan dapat menambahkan produk ke keranjang atau membeli langsung, dan
melihat ulasan pelanggan lainnya yang berisi rating, ulasan, media pengalaman
mereka, dan tanggapan admin. Tampilan ini memudahkan untuk mengetahui detail
hidangan dan mempertimbangkan pilih selera dan pengalaman sebelum memesan.

3.1.5 Deployment, Delivery and Feedback
Pada tahap terakhir, dilakukan pengujian dengan blackbox testing
dimana setiap butir uji mewakili satu skenario yang menguji interaksi
pengguna dengan sistem berdasarkan fungsi yang ada. Hasil pengujian
disajikan pada Tabel 7. Evaluasi dilakukan dengan membandingkan kondisi
yang diharapkan dan hasil aktual yang diperoleh saat pengujian. Jika statusnya
"Berhasil", berarti sistem telah memenuhi spesifikasi yang diharapkan. Sebagai
contoh pada butir uji PS- 0 4 "Nilai Produk", pelanggan diharapkan dapat
mengisi peringkat, ulasan, foto, dan video, agar setelah itu akses nilai produk
dapat berubah menjadi "cek penilaian". Saat pengujian, kondisi ini berhasil
dicapai sehingga status pada tabel adalah berhasil.
Hasil pengujian dengan blackbox testing menunjukkan bahwa seluruh 1 8
butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan,
menandakan sistem telah berfungsi dengan baik. Mulai dari login, pemesanan,
hingga manajemen penilaian oleh admin dan pelanggan, berjalan sesuai
harapan tanpa error. Alur penilaian dirancang secara lengkap dan terintegrasi
dengan proses pemesanan, akses penilaian setelah pesanan selesai, input
ulasan, peringkat, teks, foto, video hingga pengelolaan oleh admin yang dapat
memantau, menanggapi, dan menghapus penilaian, termasuk fitur filter,
reminder, dan rekapitulasi data penilaian yang dapat memperkuat kontrol dan
pengalaman pengguna. Sistem ini selain memungkinkan interaksi dua arah
antara pelanggan dan admin, juga menyediakan data rekapitulasi yang
bermanfaat untuk evaluasi performa produk dan pengambilan keputusan bisnis.
Pengujian ini mencakup alur end-to-end dan membuktikan kesiapan sistem.

```
Tabel 7 Pengujian Sistem Iterasi Pertama
ID Butir Uji Kondisi yang diharapkan Status
PS- 01 Login Admin dan Pelanggan masuk dengan email dan
password valid. Admin masuk ke dashboard
dan Pelanggan masuk ke beranda.
```

```
Berhasil
```

```
PS- 02 Pemesanan Pelanggan melakukan pemesanan dan sistem
mencatat detail transaksi dikirim ke admin.
```

```
Berhasil
```

```
PS- 03 Mengubah
Status
pesanan
```

```
Admin ubah status pesanan menjadi
"selesai"agar akses nilai produk muncul.
```

```
Berhasil
```

```
PS- 04 Nilai
Produk
```

```
Pelanggan mengisi peringkat, ulasan, media,
perubahan akses nilai produk menjadi cek
penilaian.
```

```
Berhasil
```

```
PS- 05 Menu
Penilaian
```

```
Pelanggan mengakses tab: Menunggu Penilaian,
Penilaian Saya, dan Tanggapan Penjual.
```

```
Berhasil
```

```
PS- 06 Menunggu
Penilaian
```

```
Pelanggan melihat daftar pesanan selesai yang
belum dinilai, batas waktu penilaian, sisa hari
dan akses nilai produk.
```

```
Berhasil
```

```
PS- 07 Penilaian
Saya
```

```
Pelanggan melihat daftar pesanan selesai yang
telah dinilai, akses untuk lihat detail, dan akses
untuk edit sebanyak satu kali.
```

```
Berhasil
```

```
PS- 08 Tanggapan
Penjual
```

```
Pelanggan melihat tanggapan admin terhadap
penilaian yang sudah diberikan, membalas
tanggapan sebanyak satu kali, dan mengedit
penilaian sebanyak satu kali.
```

```
Berhasil
```

```
PS- 09 Manajemen
Penilaian
```

```
Admin melihat sub menu: Status Penilaian,
Riwayat Penilaian, dan Penilaian Admin.
```

```
Berhasil
```

```
PS- 10 Status
Penilaian
```

```
Admin mengakses sub menu Status Penilaian
dengan tab Penilaian Masuk, Penilaian
Tertunda, dan Penilaian Diubah.
```

```
Berhasil
```

```
PS- 11 Penilaian
Masuk
```

```
Admin melihat daftar yang masuk, mencari,
membalas, ataumenghapus penilaian.
```

```
Berhasil
```

```
PS- 12 Penilaian
Tertunda
```

```
Admin melihat daftar pesanan selesai yang
belum diberi penilaian dan bisa mengirim
pengingat ke WhatsApp.
```

```
Berhasil
```

```
PS- 13 Penilaian
Diubah
```

```
Admin melihat daftar penilaian yang sudah
diedit dan bisa melihat detail.
```

```
Berhasil
```

```
PS- 14 Penilaian
Produk
```

```
Admin melihat daftar pesanan per sub produk
yang sudah dinilai, akses untuk lihat detail,
filter tampilan penilaian produk dan detail
katalog berdasarkan periode waktu, export
rekapan penilaian berdasarkan periode waktu.
```

```
Berhasil
```

```
PS- 15 Rincian
Penilaian
```

```
Admin melihat data rekap per sub produk
dengan total ulasan dan rata-rata peringkat.
```

```
Berhasil
```

```
PS- 16 Penilaian
Admin
```

```
Admin melihat daftar penilaian dan akses untuk
lihat detail penilaian yang telah ditanggapi.
```

```
Berhasil
```

```
PS- 17 Menu
Terlaris
```

```
Pelanggan memilih sub produk yang paling
banyak dibeli, direview dan rata-rata rating
tinggi di beranda.
```

```
Berhasil
```

```
PS- 18 Penilaian
Detail
Katalog
```

```
Pelanggan dapat melihat penilaian dari
pelanggan lainnya, memfilter penilaian
berdasarkan jumlah peringkat, foto, video, dan
tipe order di halaman detail katalog (detail sub
produk).
```

```
Berhasil
```

Meskipun pengujian blackbox testing terhadap fitur-fitur yang telah
dikembangkan menunjukkan hasil yang sesuai dengan kebutuhan awal,
terutama pada pada butir uji nomor 18 yaitu “Penilaian Detail Katalog” yang
berhasil menampilkan penilaian dari pelanggan di halaman detail katalog,
ternyata masih terdapat masukan dari pihak admin (klien) untuk menambahkan
fitur baru yang sebelumnya tidak tercantum dalam list kebutuhan. Perubahan
ini menyatakan bahwa sistem belum mampu menyaring komentar tidak pantas
sehingga dikhawatirkan dapat memengaruhi kenyamanan pengguna lain saat
membaca penilaian. Klien juga menyampaikan kebutuhannya terkait keinginan
untuk memperoleh wawasan penilaian dengan cepat dan terstruktur mengenai
persepsi pelanggan terhadap setiap sub produk, yang diperoleh tidak dengan
membaca ulasan satu per satu. Oleh karena itu, dibutuhkan iterasi kedua yang
fokus pengembangannya dialihkan pada perancangan dan integrasi fitur
tambahan berupa penyaringan komentar toksik dan klasifikasi sentimen.

### 3.2 Hasil Iterasi Kedua

Pada iterasi kedua prosedur kerja dilakukan metode penelitian analisis data
terhadap ulasan/review pelanggan, tanpa memperhatikan peringkat/rating. Karena
sistem peringkat dan ulasan telah selesai diimplementasikan ke sistem pemesanan
dalam website PT AGFI pada iterasi pertama, maka fokus utama pada iterasi kedua
ini menjelaskan perancangan dataset serta model awal dari fitur tambahan yang
akan diintegrasikan ke dalam sistem peringkat dan ulasan. Pada modelling quick
design dilakukan Data Collection, Data labeling, Data Preprocessing, Feature
Extraction, Classifier Model menggunakan Logistic Regression, Model Training,
dan Model Evaluation.

```
3.2.1 Communication
Pada iterasi kedua ini, dilakukan komunikasi lanjutan dengan pihak klien
menggunakan teknik wawancara untuk mengevaluasi dan mengembangkan
sistem peringkat dan ulasan yang telah dirancang dapat dilihat tujuh pertanyaan
utama yang diajukan oleh peneliti berserta jawaban dari klien pada Tabel 8.
Klien disini adalah Bapak Muslih Jaelani selaku Koordinator Admin. Dalam
diskusi tersebut, klien menyampaikan kebutuhan akan adanya fitur yang dapat
memberikan gambaran umum terhadap persebaran persentase sentimen dari
komentar pelanggan. Hal ini diharapkan dapat membantu pihak manajemen
dalam memantau kualitas produk dan layanan juga merespons umpan balik
pelanggan secara lebih cepat dan praktis.
```

```
Tabel 8 Hasil Wawancara Iterasi Kedua
No Tujuan Pertanyaan dan Jawaban
```

#### 1

```
Mengetahui
pengalaman
menerima
komentar toksik
```

```
Peneliti: “Pernahkah menerima komentar yang tidak
pantas?”
Informan: “Pernah menerima komentar pelanggan
yang tidak pantas, biasanya saat keterlambatan atau
kesalahan pengiriman.”
```

#### 2

```
Menilai urgensi
penyaringan
komentar toksik
```

```
Peneliti: “Apakah penting menyaring komentar tidak
pantas?”
Informan: “Penting agar tidak memicu
kesalahpahaman publik karena suatu masalah
sebaiknya diselesaikan dengan baik.”
```

```
3 Mengidentifikasi
jenis kata toksik
```

```
Peneliti: “Kata seperti apa yang tergolong tidak
pantas?”
Informan: “Kata seperti goblok, anjing, hinaan
berlebihan tergolong toksik dan menyakitkan.”
```

#### 4

```
Mengetahui
manfaat statistik
komentar
otomatis
```

```
Peneliti: “Apakah informasi persentase komentar
bermanfaat?”
Informan: “Bermanfaat untuk memudahkan
identifikasi produk atau layanan bermasalah tanpa
perlu membaca semua komentar.”
```

```
5
```

```
Mengetahui
preferensi
visualisasi data
```

```
Peneliti: “Visual seperti apa yang mudah dipahami
untuk menginformasikan persentase kategori
komentar?”
```

```
Informan: “Grafik dengan perbedaan warna seperti
merah untuk komentar negatif dan hijau untuk
komentar positif.”
```

#### 6

```
Mengetahui
pandangan dan
manfaat
pemisahan
komentar negatif
```

```
Peneliti; “Bagaimana jika komentar negatif
dipisahkan menjadi yang bersifat membangun dan
yang tidak membangun?”
Informan: “Belum pernah memikirkan sebelumnya,
namun sepertinya akan bermanfaat untuk
memisahkan kritik yang bisa digunakan sebagai
masukan dari komentar dan hanya berisi hinaan atau
emosi, sehingga fokus perbaikan lebih jelas.”
```

#### 7

```
Mengonfirmasi
kegunaan
klasifikasi
komentar
```

```
Peneliti: “Apakah klasifikasi komentar (positif,
negatif konstruktif, dan negatif tidak konstruktif)
dapat membantu?”
Informan: “Sangat membantu. Dapat memfokuskan
perhatian pada kritik yang membangun.”
```

#### 8

```
Mengidentifikasi
topik komentar
umum
```

```
Peneliti: “Topik apakah yang sering dinilai
pelanggan?”
Informan: “Produk, layanan, pengiriman, suasana
restoran, serta masukan terhadap website.”
```

Selain kebutuhan visualisasi persebaran sentimen, klien juga
menyampaikan kekhawatiran terkait keberadaan komentar negatif yang
bersifat tidak pantas atau toksik dalam halaman detail katalog. Klien ingin
memastikan bahwa sistem yang dikembangkan mampu memfilter komentar-
komentar tersebut agar tidak merusak citra restoran. Hal ini dianggap penting
supaya suasana diskusi tetap kondusif dan bermanfaat, sehingga manajemen
dapat fokus pada kritik yang konstruktif dan relevan untuk perbaikan produk
dan layanan. Klien juga menginginkan agar dataset komentar yang digunakan
dalam pengembangan sistem berupa aspek penting yang menggambarkan
pengalaman pelanggan. Aspek-aspek tersebut terbagi dalam empat kategori
utama yang dapat dilihat pada Tabel 9 berikut.

```
Tabel 9 Aspek-aspek penilaian pelanggan
No Kategori Aspek-aspek penilaian pelanggan
1 Produk Cita Rasa, Kematangan atau Tekstur, Porsi atau
Kecukupan, Harga dibanding Kualitas, Penyajian atau
Pengemasan, Pelengkap, dan Kehigienisan.
2 Pelayanan Waktu Penyajian dan Pengiriman, Sikap Pelayan dan
Kurir, dan Akurasi Pesanan.
3 Restoran Kebersihan Tempat, Suasana, dan Fasilitas.
```

(^4) Pengalaman Kepuasan Total, Rekomendasi ke Orang Lain, Keinginan
Pesan Lagi.
5 Website Kesesuaian Informasi Menu (Deskripsi, Foto, Harga,
Ketersediaan), Kemudahan Navigasi, Kecepatan Akses,
Keamanan Pembayaran, serta Desain Tampilan website.

Disamping itu, target pasar utama website pemesanan ini adalah generasi
Z dan milenial. Berdasarkan observasi terhadap arsip chat WhatsApp, didapati
informasi bahwa gaya bahasa komentar juga diharapkan autentik dan variatif,
seperti mencerminkan percakapan sehari-hari dari kalangan pelajar,
mahasiswa, pekerja kantoran, hingga orang tua. Dengan pendekatan ini, dataset
ulasan diharapkan lebih representatif dan membantu dalam pengembangan
fitur ulasan yang aman untuk semua pengguna.

3.2.2 Quick Plan
Dari hasil tahap komunikasi di atas, perancangan secara cepat dari iterasi
kedua ini adalah kebutuhan fungsional untuk mengembangkan fitur tambahan
dalam sistem peringkat dan ulasan yang dapat dilihat pada Tabel 10.
Pada tahapan ini juga mulai diputuskan untuk melakukan klasifikasi
komentar ke dalam tiga kategori utama, yaitu: (1) komentar positif, (2)
komentar negatif konstruktif, dan (3) komentar negatif non-konstruktif
(toksik). Klasifikasi ini diharapkan dapat mempermudah proses analisis dan
respons terhadap umpan balik pelanggan. Komentar positif dan negatif
konstruktif akan menjadi landasan perbaikan dan penguatan layanan,
sedangkan komentar negatif non-konstruktif akan difilter secara otomatis agar
tidak mengganggu persepsi publik maupun proses evaluasi internal. Untuk
membantu identifikasi komentar toksik, telah disusun daftar kata kunci yang
digunakan dapat dilihat lebih lanjut pada Tabel 11 (Azzahra dan Majid 2025).

```
Tabel 10 Kebutuhan Fungsional Iterasi Kedua
ID Nama
Fungsi
```

```
Deskripsi
```

```
PU- 19 API
Sentimen
```

```
REST API untuk melakukan prediksi sentimen
komentar, dan menentukan apakah komentar tersebut
lolos atau diblokir, berdasarkan hasil klasifikasi.
PU- 20 Dashboard
Penilaian
```

```
Menyediakan halaman dashboard yang
menampilkan visualisasi hasil persentase klasifikasi
sentimen ke dalam tiga kategori dalam bentuk pie
chart untuk masing-masing katalog yang ada.
```

```
Tabel 11 Kata Kunci Komentar Non-Konstruktif
No Kategori Kata Kunci Komentar Non-Konstruktif
1 Rasisme "hitam", "bule", "cina", "pribumi", "etnis", "ras", "melayu",
"yahudi", "turunan", "minoritas", "negro", "kulit hitam",
"arab", "keling", "non-pribumi", "keturunan."
2 Fisik "gendut", "gemuk", "kurus", "cungkring", "pendek", "botak",
"jelek", "cacat", "pincang", "pesek", "sipit", "dower",
"jenggot", "item", "jerawatan", "bengep", "sumbing",
"ompong", "panuan", "belang", "bungkuk."
```

(^3) Obscene "asu", "haid", "kontol", "memek", "pentil", "ngentot",
"ngewe", "jembut", "fuck", "penis", "vagina", "peler", "puki",
"lonte", "silit", "pelacur", "coli", "bokep", "gay", "homo",
"mesum", "cabul", "ngangkang", "blowjob", "titit."

(^4) Hewan "babi", "anjing", "monyet", "anjir", "anjas", "anjrit",
"cebong", "kampret", "bangsat", "bajingan", "keparat",
"kodok", "tikus", "lintah", "kambing", "cacing", "kecoa."
5 Agama "kafir", "munafik", "sesat", "atheis", "haram", "fanatic",
"bid’ah", "murtad", "dukun", "musyrik", "najis", "najong",
"syirik."
6 Keluarga "yatim", "piatu", "janda", "duda", "haram", "durhaka",
"cerai", "anak haram", "anak zina", "anak setan."
7 Provokasi "usir", "perang", "adu domba", "jangan beli di sini", "jangan
pesan di sini", "boikot", "jangan percaya", "propaganda",
"fitnah", "hoaks", "hoax", "provokator", "ga halal", "fake
review", "penipu."
8 Ancaman "bunuh", "mati", "bacok", "tusuk", "kubakar", "ludahi",
"ancurin", "cekik", "kutusuk", "tembak", "pukul", "hantam",
"racunin", "racun", "bom", "laporin BPOM", "hancurin",
"rusuhin", "bongkar."
9 Umum "goblok", "tolol", "bodoh", "bangsat", "brengsek",
"mampus", "tai", "bego", "edan", "gila", "sinting", "norak",
"sialan."
3.2.3 Modelling Quick Design
Tahap ini merupakan langkah awal dalam merancang model analisis data
yang akan digunakan untuk mengelola dan memproses ulasan pelanggan.
Ditampilkan erd dan activity diagram untuk memvisualisasikan alur sistem
penambahan fitur dan perubahan isi database yang direncanakan dalam
pengembangan lanjutan sistem peringkat dan ulasan pada Gambar 5 4 dan 5 5.
Gambar 54 Entity Relationship Diagram Iterasi Kedua

Gambar 55 Activity Diagram Iterasi Kedua

Pada tahap ini, dilakukan serangkaian proses teknis yang bertujuan untuk
membangun model klasifikasi, yang akan mendukung pengembangan fitur
tambahan pada sistem peringkat dan ulasan. Kegiatan ini menjadi bagian
penting dalam iterasi kedua karena berperan sebagai jembatan antara data
ulasan pelanggan yang telah dikumpulkan dan rencana pengembangan lebih
lanjut menggunakan pendekatan analitik. Terdapat tujuh tahapan analisis data
yang akan dijabarkan sebagai berikut :

1. Data Collection
   Data collection merupakan tahap awal dalam membangun sistem analisis
   sentimen, di mana data dikumpulkan sebagai bahan utama untuk proses
   analisis dan pelatihan model. Pada kasus ini, data berupa komentar
   pelanggan mengenai sub produk AGFI seperti "Paket Timbel Komplit" dan
   "Paket Timbel Empal". Komentar tersebut mencakup berbagai aspek
   penilaian seperti cita rasa, penyajian, kebersihan, pelayanan, dan harga.
   Variasi komentar juga dibuat menggunakan bahasa Indonesia baku &
   gaul, campuran bahasa Inggris, salah ketik atau singkatan (contoh: "bgs
   bgt", "enak mntp", “gurih jg nih”), dengan tambahan emoji atau simbol.
   Meskipun menyerupai data asli, seluruh dataset ini merupakan data dummy
   yang dibuat untuk keperluan simulasi pengujian dan penelitian.
   Pembuatan data dummy bertujuan untuk meniru gaya komentar yang
   diberikan oleh pelanggan asli. Hal ini mencakup penggunaan bahasa sehari-
   hari yang umum digunakan oleh konsumen, termasuk ekspresi positif
   maupun negatif yang mencerminkan pengalaman mereka terhadap produk
   dan layanan. Setiap baris data terdiri dari nama paket, isi komentar, dan label
   sentimen. Penyusunan data dilakukan dalam format CSV agar mudah dibaca
   oleh library pandas untuk diubah menjadi tabel (DataFrame) dan diproses
   menggunakan bahasa pemrograman seperti Python.
   Dalam pembuatan dataset dummy ini, total dikumpulkan sebanyak 6. 172
   data komentar. Rinciannya terdiri dari 2.0 65 komentar positif, 2.0 63
   komentar negatif konstruktif, dan 2.0 44 komentar negatif non konstruktif.
   Meskipun bukan berasal dari data asli, distribusi ini dirancang sedemikian
   rupa untuk mencerminkan proporsi yang wajar dan mencukupi dalam
   pelatihan model klasifikasi sentimen. Data dummy yang tersusun dengan
   baik dapat membantu peneliti menguji efektivitas preprocessing hingga
   performa model analisis sebelum diterapkan pada data nyata.
2. Data Labeling
   Setelah data dikumpulkan, proses berikutnya adalah data labeling,
   yaitu memberi label sentimen pada setiap komentar. Dalam dataset ini, label
   diklasifikasikan menjadi tiga jenis: positif, negatif konstruktif, dan negatif
   non konstruktif. Label “positif” menunjukkan bahwa komentar berisi pujian
   atau kesan baik terhadap produk dan layanan, sementara “negatif
   konstruktif” mencerminkan keluhan atau kritik tentang kekurangan yang
   disampaikan secara membangun, disertai alasan atau saran. Sebaliknya,
   “negatif non konstruktif” mencakup komentar negatif yang bersifat tidak
   jelas konteksnya, atau tidak menyertakan masukan yang berarti dan
   seringkali mengandung kata kunci kata-kata toksik.
   Proses pelabelan pertama dilakukan secara manual dalam file CSV.
   Karena dataset bersifat dummy, komentar dipisahkan ke dalam tiga file

```
sesuai kategori sentimen. Contohnya ditunjukkan pada Tabel 12 dan
Gambar 56. Tujuan dari labeling ini adalah agar data bisa digunakan untuk
melatih model analisis sentimen secara terarah. Dengan adanya label, sistem
machine learning dapat mempelajari pola bahasa dalam tiap kategori
sentimen, sehingga mampu mengklasifikasikan komentar-komentar baru
secara otomatis. Labeling yang tepat akan sangat menentukan keakuratan
model dalam mengidentifikasi opini pelanggan di masa mendatang.
```

```
Tabel 12 Contoh Dataset Dummy Pelanggan
No Kategori
Sentimen
```

```
Aspek Komentar
```

```
1 Positif Cita Rasa “Ayamnya empuk banget, gampang
disuwir. Rasanya meresap sampai ke
tulang, juara deh!”
2 Negatif
Konstruktif
```

```
Pelengkap "Oseng sayurnya terlihat segar di foto,
tapi saat diterima sudah agak layu dan
kurang segar. Tolong diperhatikan
kesegaran sayur supaya makin nikmat."
3 Negatif
Non-
konstruktif
```

```
Kehigienisan “Bungkusnya kotor berminyak jorok
mana bau amis ih pokoknya kecewa bgt,
dasar goblok!”
```

```
Gambar 56 Tahap Data Labeling
```

Setelah masing-masing file CSV dimuat ke dalam DataFrame yaitu
df_pos, df_neg_kon, dan df_neg_nonkon, dilakukan proses pelabelan
yakni setiap baris komentar diberi kolom baru bernama label yang nilainya
ditentukan secara manual berdasarkan asal file: komentar dari file positif
diberi label 'positif', dari file negatif konstruktif diberi label
'negatif_konstruktif', dan dari file negatif non-konstruktif diberi label
'negatif_nonkonstruktif'.

3. Data Preprocessing
   Tahap data preprocessing dalam pemrosesan teks bertujuan untuk

membersihkan dan mempersiapkan data agar lebih mudah dianalisis.
a. Case Folding
Proses ini dimulai dengan case folding, yaitu mengubah semua huruf
yang masih kapital (uppercase) menjadi menjadi huruf kecil (lowercase)
untuk menjaga konsistensi data, agar kata yang secara makna sama tapi
penulisannya beda tidak dianggap berbeda oleh mesin. Komputer
membedakan huruf besar dan kecil. Misalnya: "Ayam" ≠ "ayam" Jika
tidak diubah ke huruf kecil, maka: "Ayam" dan "ayam" dianggap dua
kata berbeda, padahal maksudnya sama. Ini akan mempengaruhi hasil
fitur TF-IDF dan model jadi belajar hal yang salah. Komputer yang
dimaksud disini adalah computer virtual (VM) di cloud yaitu IDE Google
Colab.
b. Punctuation Removal
Selanjutnya, dilakukan penghapusan tanda baca (punctuation removal)
untuk menghilangkan simbol atau karakter non-alfabet, seperti :

. ,!? ; : - ( ) [ ] " ' ... (titik, koma, tanda tanya, tanda seru, titik koma, titik
dua, strip, kurung, kurung siku, dll) yang tidak memiliki makna penting
dalam analisis teks.
c. Tokenizing
Setelah itu, dilakukan tokenizing, yaitu memecah kalimat menjadi kata-
kata individu atau daftar kata (list of tokens). Tahap ini penting karena
memungkinkan sistem untuk menganalisis setiap kata secara terpisah.
Model NLP tidak bekerja langsung pada kalimat penuh, tapi pada kata-
kata agar setiap kata bisa dianalisis secara terpisah sebagai fiturs. Fitur
disini berupa representasi numerik dari data yang digunakan oleh model
agar komputer bisa mempelajari pola.
d. Stopword Removal
Menghapus kata-kata umum (stopwords) yang tidak penting secara
informasi dan tidak membantu analisis dalam membedakan sentimen
diperoleh dari library nltk, misalnya: "dan", "yang", "di", "ke", "dari",
"adalah", "itu", "ini", "saya", "kamu", "mereka", dll. Untuk mengurangi
"noise" dan hanya fokus pada kata penting yang bermakna utama. Jika
tidak dibuang, kata ini bisa mendistorsi hasil TF-IDF dan membuat
model bias, karena terlalu sering muncul. Jika sebuah kata muncul terlalu
sering di semua dokumen, maka nilai IDF-nya kecil, artinya kata itu tidak
informatif. Jadi dengan menghapus stopwords, dapat meningkatkan
akurasi representasi fitur.
Hasil akhir dari preprocessing adalah teks yang sudah bersih dan siap
dianalisis lebih lanjut. Dalam contoh ini, teks akhir menjadi “juara ayamnya
gurih banget sambalnya nendang”, yang lebih ringkas namun tetap
mengandung makna utama. Tahapan pre-processing dalam kode program
dapat dilihat pada Gambar 57 dan hasilnya pada Gambar 5 8.

```
Gambar 57 Implementasi Data Pre-Processing
```

```
Gambar 58 Contoh Hasil Tahap Data Pre-Processing
```

4. Feature Extraction
   Feature Extraction (Ekstraksi Fitur) adalah proses mengubah data
   mentah (dalam hal ini: teks komentar) menjadi representasi numerik (fitur)
   yang dapat diproses oleh model machine learning. Representasi numerik ini
   dapat berbentuk matriks atau vektor. Dalam konteks Natural Language
   Processing (NLP), data teks perlu diubah ke bentuk numerik terlebih dahulu
   agar dapat diproses oleh algoritma machine learning. Dalam program
   menentukan klasifikasi sentimen, proses ini menggunakan library scikit-
   learn (sklearn) dengan mengimport class TfidfVectorizer untuk mengubah
   teks menjadi representasi numerik berdasarkan nilai TF-IDF. TF-IDF adalah
   metode atau teknik representasi numerik yang diimplementasikan pada
   TfidfVectorizer. Implementasi ekstraksi fitur ditampilkan pada Gambar 5 9.
   Parameter max_features = 20 00 digunakan untuk membatasi jumlah
   fitur (kata atau frasa) yang diambil menjadi 20 00 saja, dipilih berdasarkan
   nilai tertinggi atau paling informatif. Sementara itu, ngram_range = (1, 2)
   berarti model akan mempertimbangkan baik unigram (kata tunggal seperti
   "ayam", "enak") maupun bigram (dua kata berurutan seperti "ayam goreng",
   "goreng enak"). N-gram sendiri adalah urutan sejumlah kata yang muncul
   secara berurutan dalam teks, di mana unigram cocok untuk menganalisis

```
frekuensi kata secara individual, sedangkan bigram lebih baik untuk
menangkap konteks dan makna antar kata. Frekuensi sentimen ditunjukkan
menggunakan visualisasi WordCloud pada Lampiran 5 hingga Lampiran 7.
```

```
Gambar 59 Teknik TF-IDF dalam program klasifikasi sentimen
```

```
Setelah teks pada variabel `X` dikonversi menjadi representasi
numerik menggunakan TfidfVectorizer, hasilnya disimpan dalam `X_tfidf`,
yaitu matriks sparse yang merepresentasikan bobot TF-IDF untuk setiap
fitur (kata atau frasa) di setiap dokumen.
```

5. Classifier Model (Logistic Regression)
   Setelah fitur teks dikonversi menjadi representasi numerik
   menggunakan metode TF-IDF, tahap selanjutnya adalah melakukan
   pelatihan untuk membuat model klasifikasi. Dalam program ini, digunakan
   algoritma Logistic Regression yang diimplementasikan dari library scikit-
   learn melalui class Logistic Regression. Logistic Regression adalah salah
   satu algoritma klasifikasi yang efisien untuk teks, karena mampu menangani
   input dalam bentuk vektor fitur dan menghasilkan prediksi kelas
   berdasarkan probabilitas dapat dilihat pada Gambar 60.
   Dalam tahap ini berisi dua bagian utama untuk melatih dan
   mengevaluasi model klasifikasi. Kedua model dilatih secara terpisah untuk
   tugas yang berbeda yaitu klasifikasi aspek dan klasifikasi sentimen. Bagian
   pertama digunakan untuk memproses model aspek. Data fitur (X_tfidf) dan
   label aspek (y_aspect) dibagi menjadi data latih dan data uji menggunakan
   train_test_split dengan proporsi 80% data latih dan 20% data uji, serta
   parameter stratify untuk menjaga distribusi kelas. Model yang digunakan
   adalah Logistic Regression dengan pengaturan multi_class='ovr' (one-vs-
   rest) dan solver liblinear. Bagian kedua melakukan proses serupa tetapi
   untuk model sentimen. Di sini, label yang digunakan adalah y_sentiment.
   Data juga dibagi menggunakan train_test_split dengan parameter yang
   sama, kemudian dilatih menggunakan model Logistic Regression yang
   konfigurasinya identik dengan model aspek.
   Dalam kode, model dilatih menggunakan data latih yang telah dibagi
   sebelumnya. Parameter penting yang digunakan dalam Logistic Regression
   antara lain multi_class='ovr', yang berarti pendekatan one-vs-rest diterapkan
   untuk menangani kasus klasifikasi multi-kelas (positif, negatif konstruktif,
   dan negatif non-konstruktif) dan multi-model yaitu model aspek dan model
   sentimen. Selain itu, digunakan class_weight='balanced' untuk mengatasi
   ketidakseimbangan jumlah data pada masing-masing label, agar model tidak
   bias terhadap kelas mayoritas. Solver yang dipilih adalah 'liblinear', yang

```
cocok untuk dataset kecil hingga menengah, serta C=1.0 sebagai parameter
regularisasi untuk mencegah overfitting. Overfitting adalah kondisi saat
model terlalu menghafal data latih, sehingga bagus di data latih tetapi buruk
di data uji. Parameter `random_state = 42` digunakan untuk memastikan
bahwa proses pembagian data dilakukan secara acak namun tetap bisa
direproduksi (dapat mengulang eksperimen dan hasilnya tetap sama).
Sementara itu, `stratify = y` memastikan bahwa proporsi label dalam data
pelatihan dan pengujian tetap seimbang, sehingga distribusi kelas pada data
tidak bias dan hasil evaluasi model lebih akurat. Parameter `test_size=0.2`
menunjukkan bahwa 20% data akan digunakan untuk pengujian, sedangkan
80% sisanya digunakan untuk pelatihan model.
```

```
Gambar 60 Pelatihan Model
```

6. Model Evaluation
   Setelah model dilatih menggunakan data latih aspect_model.fit dan
   sentiment_model.fit, hasil prediksi pada data uji aspect_model.predict dan
   sentiment_model.predict performa model diukur menggunakan
   classification_report dan divisualisasikan menggunakan confusion matrix
   untuk menampilkan metrik seperti precision, recall, dan f1-score yang dapat
   dilihat pada Gambar 61. Evaluasi dilakukan untuk mengukur seberapa baik
   model mampu memprediksi label komentar yang belum pernah dilihat
   sebelumnya. Precision untuk mengetahui seberapa akurat prediksi positif
   model. Recall untuk mengetahui seberapa banyak data aktual yang berhasil
   diprediksi dengan benar. F1-score untuk mengetahui rata-rata dari precision
   dan recall.

```
Gambar 61 Hasil Evaluasi Model Sentimen
```

Pada evaluasi model pertama yaitu model sentimen terdapat
classification report dan confusion_matrix untuk melihat jumlah prediksi
yang benar dan salah dari masing-masing kategori (positif, negatif
konstruktif, negatif non-konstruktif). Hasil confusion matrix
divisualisasikan menggunakan heatmap dari library seaborn agar lebih
mudah dianalisis. Visualisasi ini membantu untuk melihat jenis kesalahan
yang dilakukan model (misalnya, apakah sering salah klasifikasi komentar
negatif sebagai positif). Mengetahui seberapa seimbang kemampuan model
dalam membedakan antar kelas. Hasil evaluasi model sentiment dapat
dilihat pada Gambar 6 2.
Hasil evaluasi ini menunjukkan bahwa model bekerja hampir
sempurna dalam membedakan tiga jenis ulasan, yaitu negatif_konstruktif,
negatif_nonkonstruktif, dan positif. Untuk ulasan negatif_konstruktif,
model benar memprediksi semua data (recall 100%) dengan ketepatan
prediksi 97% (precision), artinya ada sedikit saja prediksi yang keliru.
Untuk negatif_nonkonstruktif, ketepatan prediksi mencapai 100%, tapi ada
sekitar 3% data yang seharusnya termasuk kategori ini malah dikira
negatif_konstruktif. Sedangkan untuk positif, model benar-benar sempurna
(precision, recall, dan F1-score semuanya 100%). Secara keseluruhan,
tingkat akurasi model mencapai 99% dari 1.235 data yang diuji, sehingga
hanya ada sedikit sekali kesalahan klasifikasi, terutama pada perbedaan
antara dua jenis ulasan negatif.

```
Gambar 62 Hasil Evaluasi Model Aspek
```

Classification report dan confusion matrix model kedua adalah
ringkasan kinerja model klasifikasi dalam memprediksi 24 kategori aspek
ulasan pelanggan. Setiap baris menunjukkan hasil untuk satu kategori,
dengan tiga metrik utama. Misalnya, aspek Cita Rasa memiliki precision
1.00 dan recall 0.95, artinya semua prediksi yang dikatakan “Cita Rasa”
memang benar, dan 95% dari semua data “Cita Rasa” berhasil ditemukan
model. Kolom support menunjukkan jumlah data aktual untuk tiap aspek.
Nilai mendekati 1.00 menunjukkan performa sangat baik, sedangkan nilai
rendah (seperti Sikap Pelayan & Kurir yang 0.00) menunjukkan model tidak
mampu mengenali kelas tersebut sama sekali.
Bagian bawah tabel menampilkan metrik keseluruhan: accuracy
(tingkat ketepatan total model), macro avg (rata-rata metrik untuk semua
kelas, tanpa memperhitungkan jumlah datanya), dan weighted avg (rata-rata
yang memperhitungkan proporsi jumlah data tiap kelas). Pada laporan ini,

accuracy model adalah 0.97 (97%), artinya dari semua prediksi, 97% tepat
sasaran. Namun, macro avg lebih rendah (precision 0.83, recall 0.86, f1-
score 0.84) karena ada beberapa kelas dengan performa buruk yang ikut
mempengaruhi rata-rata, terutama kelas dengan data sangat sedikit atau
kelas yang tidak terdeteksi sama sekali.
Meskipun performa kedua model sentimen sudah cukup baik, namun
saat dilakukan pengujian langsung melalui Gradio dengan input komentar
baru, model masih sering keliru mengenali kategori komentar terutama
komentar negatif_nonkonstruktif. Oleh karena itu, diperlukan tambahan
metode/teknik untuk membantu menyaring komentar negatif nonkonstruktif
secara lebih tepat sebelum diproses oleh model.
Untuk memastikan model dapat digunakan secara praktis, model yang
telah dilatih ulang menggunakan seluruh dataset disimpan ke dalam file
.joblib menggunakan library joblib yang dapat dilihat pada Gambar 63 ,
bersama dengan objek vectorizer TF-IDF. Ketiga file tersebut adalah
aspect_model.joblib, sentiment_model_insight.joblib, dan
insight_vectorizer.joblib. Sehingga dapat digunakan kembali dalam aplikasi
atau sistem interaktif seperti Gradio tanpa perlu pelatihan ulang seperti yang
ditunjukkan pada Gambar 64. Bagian confidence dalam kode ini
menunjukkan tingkat keyakinan (probabilitas) model terhadap hasil prediksi
untuk suatu komentar dengan rentang 0-1.

```
Gambar 63 Menyimpan Model ke dalam file Joblib
```

```
Gambar 64 Testing Model dengan Gradio
```

7. Rule-Based Filtering
   Rule-Based Filtering adalah teknik tambahan untuk mendeteksi
   komentar negatif non-konstruktif berdasarkan aturan keberadaan kata-kata
   terlarang dalam komentar pengguna. Sistem menggunakan pendekatan rule-
   based (berbasis aturan) dengan daftar kata pada Tabel 11 yaitu Kata Kunci
   Komentar Non-Konstruktif (Toksik).
   Komentar dibersihkan terlebih dahulu melalui preprocessing (case
   folding, remove punctuation, tokenizing, dan remove stopwords), agar
   pencocokan kata blacklist lebih akurat. Komentar yang telah dibersihkan
   dipecah menjadi kata-kata (token), lalu dilakukan pemeriksaan apakah salah
   satu token tersebut terdapat di dalam daftar CURATED_BLACKLIST dapat
   dilihat pada Gambar 6 5. Fungsi any() akan mengembalikan True jika ada
   satu saja kata toksik yang ditemukan. Teknik ini memungkinkan deteksi
   cepat terhadap komentar yang mengandung kata tidak pantas. Jika komentar
   mengandung kata dalam blacklist, maka komentar langsung diblokir, tanpa
   perlu melalui prediksi model. Selanjutnya dilakukan test menggunakan
   Gradio yang dapat dilihat pada Gambar 66.

```
Gambar 65 Implementasi Rule-Based Filtering
```

```
Gambar 66 Testing Rule Based Filtering dengan Gradio
```

3.2.4 Construction Of Prototype
Dalam proses penambahan fitur untuk sistem peringkat dan ulasan pada
iterasi kedua ini, telah dibuat notifikasi yang ditampilkan pada halaman riwayat
pemesanan website pelanggan setelah pelanggan mengirimkan penilaian
produk. Ketika pelanggan mengirimkan penilaian, sistem secara otomatis
memeriksa isi teks ulasan dan mencocokkannya dengan daftar kata kunci yang
telah ditentukan. Jika ditemukan indikasi toksik, ulasan tersebut akan
dikategorikan sebagai negatif non-konstruktif. Proses ini berjalan secara real-
time sehingga penyaringan dapat dilakukan sebelum ulasan ditampilkan ke
publik, menjaga agar konten di platform tetap aman, sopan, dan nyaman dibaca
semua pengguna.
Jika ulasan terdeteksi toksik, sistem akan menampilkan notifikasi yang
menginformasikan bahwa ulasan telah berhasil diterima tetapi tidak akan
muncul di halaman detail katalog karena alasan pembatasan konten. Notifikasi
ini berbentuk alert, seperti yang terlihat pada Gambar 67 memberikan
transparansi kepada pelanggan bahwa masukan mereka tetap tersimpan di
sistem meskipun tidak dipublikasikan secara terbuka. Dengan begitu,
pelanggan tetap merasa bahwa pendapatnya dihargai dan tidak dihapus begitu
saja, meskipun ada pembatasan penayangan demi menjaga kualitas platform.
Walaupun diblokir dari halaman detail katalog seperti yang terlihat
pada Gambar 53, ulasan toksik tersebut tetap tersimpan di database dan dapat
dilihat oleh pihak-pihak tertentu. Pelanggan yang menulisnya masih dapat
mengecek ulasannya melalui halaman Penilaian Saya di akun mereka seperti
pada Gambar 21. Sementara admin memiliki akses penuh untuk melihat ulasan
tersebut di menu Manajemen Penilaian bagian Penilaian Masuk seperti pada
Gambar 31. Hal ini memungkinkan admin untuk melakukan tindak lanjut, baik
berupa teguran, klarifikasi, atau respons resmi, sehingga sistem tidak hanya
memfilter tetapi juga memfasilitasi proses penyelesaian masalah secara
profesional.

```
Gambar 67 Alert Notifikasi Penyaringan Ulasan
```

Penambahan fitur selanjutnya yaitu pada Gambar 6 8 yang menampilkan
pop-up “Insight Sentimen untuk Gurame Bakar” pada menu dashboard

penilaian yang memuat distribusi ulasan pelanggan. Di sisi kiri, terdapat
diagram pie “Distribusi Sentimen” yang membagi komentar ke dalam tiga
kategori yaitu Positif (hijau, 50%), Negatif Konstruktif (oranye, 37,1%), dan
Negatif Non-Konstruktif (kuning, 12,9%). Setengah lingkaran menunjukkan
separuh ulasan bersifat positif, sedangkan sisanya terdiri dari kritik yang
membangun dan kritik tanpa saran.
Di sisi kanan, panel “Aspek Teratas” menunjukkan topik ulasan yang paling
sering muncul dari setiap sentiment yang dipilih, dalam Gambar 68 dipilih
sentiment positif yang terdapat aspek Kesesuaian Informasi Menu (62,5%)
sebagai aspek tertinggi, disusul Kematangan/Tekstur (12,5%), Pelengkap
(12,5%), dan Akan Pesan Lagi? (12,5%). Kolom “Contoh Komentar”
menampilkan kutipan pelanggan yang mayoritas memuji kesesuaian antara
foto atau deskripsi di website dengan produk yang diterima. Informasi ini
memberi gambaran bahwa kejujuran informasi menu menjadi kekuatan utama,
sementara aspek lain seperti tekstur dan kelengkapan masih bisa diperhatikan
untuk peningkatan kualitas. Tampilan visual ini memudahkan admin dalam
membaca proporsi kepuasan pelanggan secara cepat untuk pengambilan
keputusan evaluasi tanpa meninjau satu per satu komentar.

```
Gambar 68 Dashboard Penilaian Klasifikasi Aspek dan Sentimen
```

Probabilitas distribusi setiap sentiment dapat dilihat dalam tabel
database pada Gambar 69 berisi data ulasan pelanggan. Setiap baris mewakili
satu review, dengan kolom-kolom yang menyimpan informasi penting seperti
rating, teks ulasan (review), status persetujuan, sentiment (positif atau negatif
konstruktif), aspect yang dikomentari (misalnya “Kesesuaian Informasi Menu”
atau “Harga vs Kualitas”), serta sentiment_probabilities yang memuat skor
probabilitas dari tiap kategori sentimen. Data inilah yang diolah sistem untuk
menghitung persentase distribusi sentimen dan mengidentifikasi topik ulasan
yang paling sering muncul.

```
Gambar 69 Database Probabilitas Aspek dan Sentimen
```

3.2.5 Deployment, Delivery and Feedback
Tahap terakhir pengembangan adalah deployment dan testing, yaitu
mengintegrasikan model analisis sentimen ke dalam aplikasi Laravel. Model
yang telah dilatih dan dievaluasi disimpan dalam format .joblib bersama file
TF-IDF vectorizer dan daftar stopword NLTK yang disesuaikan, sehingga
dapat digunakan kembali tanpa pelatihan ulang. Integrasi dilakukan melalui
RESTful API berbasis Flask, di mana model dijalankan sebagai layanan
backend terpisah. Aplikasi Laravel mengirim komentar pelanggan ke endpoint
Flask dengan HTTP POST, kemudian Flask melakukan preprocessing teks,
konversi ke vektor TF-IDF, dan prediksi sentimen serta aspek. Hasil prediksi
dalam format JSON dikirim kembali ke Laravel untuk ditampilkan secara real-
time. Pendekatan ini membuat sistem lebih fleksibel, modular, dan mudah di-
scale karena frontend dan backend dapat dikembangkan terpisah namun tetap
terhubung.
Proses integrasi dapat dilihat pada Gambar 70 , dimana aplikasi Flask
memuat model sentimen dan TF-IDF vectorizer lama untuk analisis sentimen,
serta model aspek dan vectorizer baru untuk memprediksi topik komentar.
Sebelum dianalisis, komentar dibersihkan menggunakan fungsi
preprocess_text yang mengubah teks menjadi huruf kecil, menghapus karakter
non-huruf, dan membuang stopword bahasa Indonesia. Endpoint / predict
menerima data JSON berisi comment, lalu menghasilkan label sentimen, label
aspek, dan probabilitas setiap kategori sentimen. Sistem juga memeriksa
komentar terhadap daftar kata kasar (CURATED_BLACKLIST); jika
terdeteksi negatif_nonkonstruktif atau mengandung kata kasar, statusnya
menjadi "DIBLOKIR", jika tidak maka "LOLOS". Seluruh hasil dikembalikan
dalam format JSON berisi status, label, dan probabilitas sentimen.
Setelah proses integrasi selesai, langkah selanjutnya adalah melakukan
pengujian menggunakan metode blackbox testing terhadap 11 butir uji yang
telah disusun. Pengujian ini dilakukan oleh peneliti bersama pihak klien untuk
memastikan setiap fungsi sistem berjalan sesuai dengan kebutuhan yang telah

ditentukan. Namun, tahap pengujian ini belum melibatkan pengguna akhir atau
pelanggan secara langsung, sehingga hasil evaluasi yang diperoleh masih
bersifat terbatas dan hanya mencerminkan masukan dari pihak klien saja.

```
Gambar 70 Integrasi Model dalam Sistem Peringkat dan Ulasan
```

```
Tabel 13 Pengujian Sistem Iterasi Kedua
No Butir Uji Kondisi yang Diharapkan Status
PS- 19 Analisis
Sentimen dengan
Aturan Tambahan
```

```
Sistem mendeteksi ulasan yang
mengandung kata kunci toksik
menggunakan rule-based filtering,
lalu mengkategorikannya sebagai
negatif non-konstruktif.
```

```
Berhasil
```

```
PS- 20 Alert Notifikasi
Penyaringan
Ulasan
```

```
Setelah pelanggan mengirim ulasan
yang terdeteksi toksik, sistem
menampilkan pesan notifikasi bahwa
ulasan diterima tetapi tidak
ditampilkan di halaman katalog karena
alasan pembatasan konten.
```

```
Berhasil
```

```
PS- 21 Blokir Ulasan
Toksik dari
Halaman Detail
Katalog
```

```
Ulasan yang terdeteksi toksik oleh
sistem tidak akan ditampilkan di
halaman detail katalog (sub-produk),
namun tetap disimpan di sistem.
```

```
Berhasil
```

```
PS- 22 Tampilkan
Ulasan Toksik di
```

```
Ulasan yang diblokir oleh sistem dari
halaman detail katalog tetap dapat
dilihat pelanggan yang menulisnya di
```

```
Berhasil
```

```
Penilaian halaman^ penilaian akun miliknya.^
```

```
PS- 23 Tampilkan
Ulasan Toksik di
Manajemen
Penilaian.
```

```
Admin dapat melihat ulasan toksik
yang terdeteksi untuk dilakukan tindak
lanjut atau diberi tanggapan.
```

```
Berhasil
```

```
PS- 24 Analisis
Sentimen
Otomatis
```

```
Sistem mendeteksi ulasan dan
mengklasifikasikan sentimen menjadi
kategori Positif, Negatif Konstruktif,
dan Negatif Non-Konstruktif, serta
menghitung persentase distribusinya.
```

```
Berhasil
```

```
PS- 25 Visualisasi
Distribusi
Sentimen
```

```
Menampilkan diagram lingkaran (pie
chart) yang menggambarkan
persentase setiap kategori sentimen,
lengkap dengan tooltip detail saat
pointer diarahkan ke bagian chart.
```

```
Berhasil
```

```
PS- 26 Identifikasi
Aspek Teratas
```

```
Menganalisis ulasan untuk
menemukan aspek yang paling sering
disebut, menampilkan daftar aspek
beserta persentase kemunculannya,
dan memberi highlight pada aspek
yang dipilih.
```

```
Berhasil
```

```
PS- 27 Filter Ulasan
Berdasarkan
Aspek
```

```
Menampilkan contoh ulasan
(komentar) relevan dengan aspek yang
dipilih, serta mendukung scroll.
```

```
Berhasil
```

```
PS- 28 Sembunyikan /
Tampilkan
Visualisasi
Kategori
Sentimen
```

```
Memberikan opsi bagi pengguna untuk
menutup atau menyembunyikan
kategori tertentu di pie chart, sehingga
visualisasi hanya menampilkan
kategori yang dipilih. Diagram akan
otomatis menyesuaikan proporsinya.
```

```
Berhasil
```

```
PS- 29 Perbarui
Visualisasi
Dinamis
```

```
Pie chart secara otomatis memperbarui
bentuk dan persentase ketika satu atau
lebih kategori disembunyikan, tanpa
perlu memuat ulang halaman.
```

```
Berhasil
```

Pengujian iterasi kedua terhadap 11 butir uji (PS-19 hingga PS-29) menunjukkan
seluruh fitur, mulai dari deteksi dan pengelolaan ulasan toksik hingga analisis serta
visualisasi sentimen dan aspek, berfungsi sesuai harapan. Keberhasilan ini
menunjukkan bahwa sistem telah memenuhi kebutuhan dan spesifikasi yang
dirancang sesuai permintaan klien.

## IV. SIMPULAN DAN SARAN

### 4.1 Simpulan

Penelitian ini berhasil mengembangkan sistem peringkat dan ulasan
pelanggan yang dilengkapi dengan penyaringan komentar tidak pantas dan
visualisasi klasifikasi sentimen otomatis pada website pemesanan PT Ayam Goreng
Fatmawati (PT AGFI). Melalui prosedur prototipe, sistem ini diintegrasikan secara
end-to-end mulai dari proses pemesanan, penilaian produk, hingga manajemen
penilaian, serta telah diuji melalui 29 butir pengujian blackbox testing yang
dinyatakan berhasil dan berguna dalam meningkatkan interaksi dua arah. Fitur
penyaringan komentar dan klasifikasi komentar dikembangkan dengan
mengintegrasikan model analisis yang memiliki tingkat akurasi tinggi (99% untuk
sentimen dan 97% untuk aspek), meskipun masih terdapat kendala pada beberapa
kelas minor. Untuk mengatasi kelemahan model, terutama dalam mendeteksi
komentar negatif non-konstruktif, ditambahkan rule-based filtering dengan curated
blacklist yang mampu menyaring komentar toksik secara real-time sebelum
ditampilkan ke publik pada halaman detail katalog. Dengan demikian, kualitas
konten tetap terjaga, sementara komentar yang terblokir tetap tersimpan dalam
database sehingga dapat diakses oleh pelanggan dan admin untuk menjaga
transparansi sekaligus memberi ruang tindak lanjut profesional. Selain itu,
visualisasi dashboard interaktif yang menampilkan distribusi sentimen, aspek
teratas, dan contoh komentar terbukti memudahkan admin dalam menganalisis
kepuasan pelanggan secara cepat dan kemudahan evaluasi performa produk dengan
insight yang lebih relevan dalam pengambilan keputusan bisnis.

### 4.2 Saran

Sebagai saran pengembangan, model yang digunakan saat ini masih terbatas
pada pendekatan Logistic Regression, yang cukup efektif untuk klasifikasi awal,
namun memiliki keterbatasan dalam menangkap konteks kalimat yang kompleks
atau ambigu. Oleh karena itu, pengembangan sistem ke depannya dapat
mempertimbangkan pemanfaatan model yang lebih canggih berbasis deep learning,
seperti LSTM (Long Short-Term Memory) atau transformer-based models seperti
BERT, untuk meningkatkan akurasi dan pemahaman konteks komentar.
Selain itu, dalam halaman detail katalog dapat ditingkatkan lagi dengan
membuat pelanggan menjadi lebih partisipatif untuk dapat memberikan opsi like
pada komentar yang dirasa membantu, sehingga komentar bermanfaat dapat lebih
menonjol dan menjadi referensi bagi pengguna lain. Di sisi lain, sistem juga perlu
menyediakan opsi report atau pelaporan penyalahgunaan terhadap komentar yang
mengandung kata-kata tidak pantas, hoax dan ofensif. Laporan ini dapat menjadi
masukan berharga bagi pengembang untuk memperbarui dan memperluas daftar
kata kunci terlarang pada mekanisme rule-based filtering, sehingga kemampuan
sistem dalam menyaring komentar dapat terus ditingkatkan secara adaptif.
Untuk mendorong loyalitas pelanggan, sistem juga disarankan menambahkan
fitur poin bagi pemberi penilaian, dengan bobot lebih tinggi jika ulasan dilengkapi
foto dan video. Mekanisme ini mendorong pelanggan memberikan ulasan yang
jujur dan berkualitas, sekaligus memperkaya data untuk evaluasi produk.

## DAFTAR PUSTAKA

Aldrin, M. 2017. Sistem Pakar Untuk Mendiagnosis Penyakit Autisme.
Acintya IJ, Mirzanti IR, 2024. Navigating consumer behavior in the niche market
of artisan tea blends: Insight from Indonesia’s e-commerce sector.
International Journal of Current Science Research and Review. 7(10): 7539 -

Ali F, Ali L, Gao Z, Terrah A, Turktarhan G. 2024. Determinants of user's intentions
to book hotels: a comparison of websites and mobile apps. Aslib Journal of
Information Management. 76(1): 16 - 41.
Allacsta AL, Hadiwandra TY. 2024. Implementation of an Android-based
attendance application with GEOFENCE method for employee monitoring
efficiency. International Journal of Electrical, Energy and Power System
Engineering. 7(3):190–200.
Ananta YE, Yuniati D, Rolliawati D, Kunaefi A, Permadi A. 2025. Pengembangan
Aplikasi Sido Chatbot sebagai Aplikasi Pengenalan Objek Wisata Kediri
Menggunakan Rule-Based Pattern Matching. Jurnal Teknologi dan

## Informasi. 15 (1): 40 - 53.

Arinda Y, Alam IA, Sanida N. 2025. Pengaruh Online Customer Review dan Online
Customer Rating terhadap Purchase Decision di Tiktok Shop: Studi Kasus
Pada Generasi Z di Bandar Lampung. EKONOMIKA45: Jurnal Ilmiah
Manajemen, Ekonomi Bisnis, Kewirausahaan. 12(2):1273–1287.
Alnoor A, Tiberius V, Atiyah AG, Khaw KW, Yin TS, Chew X, Abbas S. 2024.
How positive and negative electronic word of mouth (eWOM) affects
customers’ intention to use social commerce? A dual-stage multi group-SEM
and ANN analysis. International Journal of Human *–* Computer Interaction,
40(3): 808 - 837.
Azzahra SA, Majid NWA. 2025. Klasifikasi dan Analisis Semantik Cyberbullying
Sosial Media X: Integrasi Web Scraping dan Natural Language Processing
(NLP). Jurnal Educatio FKIP UNMA. 11 (2).
Baihaqi FN, Maksum A, Aruwiyantoko A. 2025. Studi Literatur: Analisis
Penggunaan E-Comic Sebagai Media Pembelajaran Bahasa Indonesia
Terhadap Kemampuan Membaca Pemahaman Di Sekolah Dasar. Pendas:

# Jurnal Ilmiah Pendidikan Dasar. 10 (02): 379 - 387.

Chatterjee S, Chaudhuri R, Vrontis D, Galati A. 2024. Digital transformation using
industry 4.0 technology by food and beverage companies in post COVID- 19
period: from DCV and IDT perspective. European Journal of Innovation
Management. 27(5):1475–1495.
Ekasari MH, Lusita MD, Diana D. 2024. Penerapan Metode Prototype dalam
Merancang Sistem Informasi Portal Warga Berbasis Web. Di dalam:
Prosiding Seminar SeNTIK. 8(1):215–224.
Fachrudin KA, Tarigan DL, Iman MF. 2022. Analisis Rating dan Harga Kamar
Hotel Bintang Lima di Indonesia (Analysis of Ratings and Room Rates for
Five-Star Hotels in Indonesia).
Fathoni MFN, Puspaningrum EY, Sihananto AN. 2024. Perbandingan Performa
Labeling Lexicon InSet dan VADER pada Analisa Sentimen Rohingya di
Aplikasi X dengan SVM. Modem: Jurnal Informatika dan Sains Teknologi.
2(3):62–76.

Febriyani RE, Halisa NN, Utomo S. 2025. Pengaruh Online Customer Review dan
Online Customer Rating terhadap Keputusan Pembelian Sunscreen Wardah
Marketplace Shopee di Kota Banjarmasin. Smart Business Journal (SBJ).
5(1).
Fichte L, York C. 2024. How do smartphone users access the internet? An
exploratory analysis of mobile web browser use. Mobile Media &
Communication. 20501579241274781.
Finesti I, Ningtyas MU, Apriyani T, Firdaus T. 2025. Implementasi Model Hybrid
Machine Learning untuk Prediksi Kelulusan Peserta Pelatihan Komputer di
LKP Mittra Prestasi. Jurnal Riset Teknik Komputer. 2(2):42–52.
Firmansyah W, Subandiyah H. 2025. Gaya Hidup Konsumerisme dan Simulakra
Tokoh dalam Novel Home Sweet Loan Karya Almira Bastari: Kajian Jean
Baudrillard. BAPALA. 12(2):305–315.
Greene D, Nguyen M, Dolnicar S. 2024. How do you choose your meal when you
dine out? A mixed methods study in consumer food-choice strategies in the
restaurant context. Appetite. 203 :107683.
Gerdt SO, Wagner E, Schewe G. 2019. The relationship between sustainability and
customer satisfaction in hospitality: An explorative investigation using
eWOM as a data source. Tourism Management. 74 : 155 - 172.
Harpizon HAR, Kurniawan R, Iskandar I, Salambue R, Budianita E, Syafria F.

2022. Analisis Sentimen Komentar Di YouTube Tentang Ceramah Ustadz
      Abdul Somad Menggunakan Algoritma Naïve Bayes. 5(1): 131 - 140.
      Histiarini AR, Rachmadhani MM, Supriatna II, Pariama Y. 2024. Analysis of
      utilization of E-commerce technology as a supporting media in adding
      marketing and improving SME services. In E3S Web of Conferences (Vol.
      517, p. 11001). EDP Sciences.
      Jelita HP, Sa'ad MI. 2025. Penerapan Algoritma Naïve Bayes Dalam Analisis
      sentiment Masyarakat Terhadap STMIK Widya Cipta Dharma. Bulletin of
      Information Technology (BIT). 6(2): 148 - 160.
      Juanda R, Yadi IZ. 2020. Penerapan Rule Based Dengan Algoritma Viterbi Untuk
      Deteksi Kesalahan Huruf Kapital Pada Karya Ilmiah. Journal of Computer
      and Information Systems Ampera. 1 (1): 53 - 62.
      Karunarathna KMGS, Rupasingha RAHM. 2022. Learning to use normalization
      techniques for preprocessing and classification of text documents.
      International Journal of Multidisciplinary Studies. 9(2):69–81.
      Khoiriyah A. 2025. Implementasi program perlindungan hak anak jalanan dalam
      meningkatkan keberfungsian sosial di Yayasan Swara Peduli Indonesia
      Jakarta [Skripsi]. Universitas Islam Negeri Syarif Hidayatullah Jakarta.
      Lukita FA. 2024. Transformasi Digital Melalui Digitalisasi Menu dan Ordering
      dalam Peningkatan Kualitas Pelayanan Kepada Pelanggan: Studi Kasus Cozy
      Coffee & Resto [Tesis]. Universitas Islam Indonesia.
      Mbanugo OJ, Taylor A, Sneha S. 2025. Buttressing the power of entity relationships
      model in database structure and information visualization: Insights from the
      Technology Association of Georgia’s Digital Health Ecosystem. World
      Journal of Advanced Research and Reviews. 25(2):1294–1313.
      Necula S. 2024. Exploring the model-view-controller (MVC) architecture: A broad
      analysis of market and technological applications.
      Ningsih N, Ramadhani AD, Santoso D, Ramadhani BD, El Ghofiqi IA. 2024.

Penggunaan Metode Deep Learning untuk Pengembangan Sistem
Komunikasi Cerdas bagi Penyandang Disabilitas. MIND (Multimedia
Artificial Intelligent Networking Database) Journal. 9(2):206–219.
Oswari T, Asari A. 2025. Strategi branding dan komunikasi pemasaran di era media
sosial. Solok (ID): PT Mafy Media Literasi Indonesia. 94 p. ISBN: 978- 634 -
220 - 238 - 8.
Parviainen I. 2024. “Simple and reliable Waterdrop”: Analysis of the brand identity
construction on Waterdrop’s European website.
Purnama OS, Ciptorukmi AS. 2024. Perlindungan Hukum Untuk Pelaku Usaha
Terhadap Tindakan Konsumen Yang Melakukan Fake Review Negatif Dalam
Transaksi E-Commerce. Indonesian Journal of Law. 1(5): 92 - 106.
Rahmawati IN. 2025. Pengaruh Kualitas Produk, Online Customer Review, dan
Online Customer Rating Terhadap Keputusan Pembelian Dengan
Kepercayaan Konsumen Sebagai Variabel Mediasi. Jurnal Impresi
Indonesia. 4(5):1799–1818.
Raysharie PI, Harto B, Judijanto L, Apriyanto H, Riyanto J, Gumilang RR,
Purnamasari N, Muchayatin M, Kusumastuti SY. 2025. UMKM: Pengelolaan
Usaha dari Kecil Menjadi Besar. PT. Sonpedia Publishing Indonesia.
Ristyawan A, Nugroho A, Amarya TK. 2025. Optimasi Preprocessing Model
Random Forest untuk Prediksi Stroke. JATISI (Jurnal Teknik Informatika dan
Sistem Informasi). 12(1).
Romdona S, Junista SS, Gunawan A. 2025. Teknik Pengumpulan Data: Observasi,
Wawancara dan Kuesioner. JISOSEPOL: Jurnal Ilmu Sosial Ekonomi dan
Politik. 3(1):39–47.
Salim A, Rusdiansyah R. 2024. Implementasi Black Box Testing pada Website E-
Commerce Shopee Menggunakan State Transition Testing. Jurnal
Informatika dan Bisnis. 13(2):161–170.
Santika N, Palilati A, Tangalayuk A. 2025. Pengaruh Customer Review, Customer
Rating, dan Promosi Penjualan terhadap Keputusan Pembelian pada
Marketplace Shopee di Kecamatan Tongauna. Jurnal HOMANIS: Halu Oleo
Manajemen dan Bisnis. 2(2):458–470.
Setiawan HB, Sukamto RA, Hambali YA. 2025. Rancang Bangun Visual Novel
Game Sebagai Media Pengenalan Interview Kerja. Jurnal Sistem Informasi
dan Sistem Komputer. 10(1):87–100.
Setiyawan, E., 2022. The mediating effect importance of trust in the relationship
between perceived application quality, ewom and perceived benefits on
consumer attitude toward online food delivery. JURNAL GANESHWARA.
3(1).
Susilawati, A, Al-Obaidi ASM, Abduh A, Irwansyah FS, Nandiyanto ABD, 2025.
How to do research methodology: From literature review, bibliometric, step-
by-step research stages, to practical examples in science and engineering
education. Indonesian Journal of Science and Technology, 10 (1): 1 - 40.
Tabaku E, Duçi E, Lazaj A. 2024. From Physical Stores to Virtual Marketplaces:
The Evolution of Shopping. Interdisciplinary Journal of Research and
Development. 11(3):175–175.
Wahid AMA, Turino KAN, Nugroho KA, Maharani TS, Darmono D, Utomo FS.

2024. Optimasi Logistic Regression dan Random Forest untuk Deteksi Berita
      Hoax Berbasis TF-IDF. Jurnal Pendidikan dan Teknologi Indonesia. 4(8).

Wardhana, F.K., Jati, N.S., Seto, B.R. and Saputro, I.A., 2024, December.
Perancangan UI/UX Aplikasi Bengkel Online Pitlaner dengan Fitur
Geolokasi untuk Panggilan Darurat. In Prosiding Seminar Nasional Amikom
Surakarta (Vol. 2, pp. 659-670).
Waruwu M. 2024. Pendekatan Penelitian Kualitatif: Konsep, Prosedur, Kelebihan
dan Peran di Bidang Pendidikan. Afeksi: Jurnal Penelitian dan Evaluasi
Pendidikan. 5(2):198–211.

## LAMPIRAN

Lampiran 1 Timeline Proyek Akhir

## Lampiran 2 Dokumentasi Wawancara dengan Klien

Lampiran 3 Proses Design Thinking & Pembuatan Bussines Model Canvas saat
Tahapan Penelitian Fase PKL untuk Pembuatan Website Pemesanan

## Lampiran 4 Tabel dalam database website pemesanan AGFI

## Lampiran 5 WordCloud Frekuensi Komentar Positif

## Lampiran 6 WordCloud Frekuensi Komentar Negatif Konstruktif

## Lampiran 7 WordCloud Frekuensi Komentar Negatif Non-Konstruktif

## Lampiran 8 Alur Sistem Pemesanan Website AGFI

## Lampiran 9 Alur Sistem Pemesanan Website AGFI Bagian Kedua

## Lampiran 10 Alur Autentikasi Pelanggan Sistem Website Pemesanan AGFI

## Lampiran 11 Alert Ulasan Tersimpan

## Lampiran 12 Alert Mengirim Ulasan

## Lampiran 13 Alert Berhasil Mengirim Ulasan

Lampiran 14 Alert Diperlukan Kelengkapan Rating Sebelum Kirim Penilaian

Lampiran 15 Alert Diperlukan Kelengkapan Ulasan Sebelum Kirim Penilaian

## Lampiran 16 Alert Konfirmasi Submit Ulasan

## Lampiran 17 Alert Edit Penilaian Saya

## Lampiran 18 Alert Berhasil Edit Penilaian Saya

## Lampiran 19 Berhasil Edit Ulasan Setelah Ditanggapi Penjual

## RIWAYAT HIDUP

Penulis dilahirkan di kota Jakarta pada 19 Mei 2003 sebagai anak kedua dari
pasangan bapak Sriyadi dan ibu Yuni Warwanti. Pendidikan sekolah menengah atas
(SMA) ditempuh di SMA Negeri 21 Jakarta, dan lulus pada tahun 2021. Pada tahun
yang sama, penulis diterima sebagai mahasiswa program diploma 4 (D-4) di
Program Studi Teknologi Rekayasa Perangkat Lunak Sekolah Vokasi di IPB
University.
Selama mengikuti program Sarjana Terapan, penulis aktif menjadi anggota
dari himpunan mahasiswa vokasi (HIMAVO) Micro IT pada divisi web master
periode 2021-2022, menjadi panitia dari kegiatan open recruitment MICRO IT
2022, menjadi panitia dari kegiatan INF EXPO sebagai anggota divisi acara pada
tahun 2021, menjadi panitia dari kegiatan TECH TALK sebagai anggota divisi
humas pada tahun 2023, menjadi bagian dari organisasi rohani islam (ROHIS)
sebagai panitia SAPA SAHABAT periode 2021- 2023 , menjadi panitia dari
kegiatan JELAJAH IPB sebagai anggota divisi desain logistik pada bulan Agustus

* Oktober 2024.
  Penulis juga pernah mengikuti lomba kompetisi SAINS & ICT dengan nama
  kegiatan “Agricultural Day Competition (AGRIDATION)” pada tahun 2023 untuk
  bidang videografi tingkat nasional yang berhasil mendapat juara ketiga. Penulis
  juga pernah mempublish jurnal ilmiah tingkat nasionalnya yang berjudul
  “Penerapan Artificial Intelligence Brand Crowd dalam Pembelajaran Desain Grafis
  pada Pembuatan Logo Desa Kembanglimus” pada tahun 2023, “Pengaruh
  Tampilan Visualisasi Alat Sistem IoT Forest Fire dalam Mendukung
  Penggunaannya untuk Mendeteksi Kebakaran Hutan” pada tahun 2023 dan jurnal
  ilmiah tingkat internasionalnya yang berjudul “Enriching Grammatical
  Understanding of Using Japanese Part of Speech in Dokkai Learning with the AI-
  Powered Oyomi Application” pada tahun 2024. Pada tahun 2024, penulis
  melaksanakan kegiatan Merdeka Belajar - Kampus Merdeka (MBKM) di Studi
  Independen IBM Academy : Advance AI dan Praktik Kerja Lapangan (PKL) di PT
  Ayam Goreng Fatmawati sebagai Full Stack Developer Intern.
