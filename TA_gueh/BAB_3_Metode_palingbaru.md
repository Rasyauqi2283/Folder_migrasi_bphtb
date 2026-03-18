# [

I
METODE]()

[]()[1.1  Lokasi dan Waktu]()

Penelitian
ini dilaksanakan di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten
Bogor, beralamat di Jl. Tegar Beriman, Cibinong, Kabupaten Bogor, Jawa Barat.
Penelitian dilakukan selama masa Praktik Kerja Lapangan (PKL) yang berlangsung
dari 22 Juli 2024 hingga 20 Desember 2024, di Bidang Perencanaan dan
Pengembangan Pendapatan Daerah, Sub-bidang Pengelolaan Sistem Informasi (PSI).
Setelah kegiatan PKL berakhir, tahap pengembangan, penyempurnaan, dan pengujian
sistem dilanjutkan kembali di kantor BAPPENDA Kabupaten Bogor hingga bulan Juli
2025, sebelum tahap finalisasi laporan dan evaluasi dilakukan di Sekolah Vokasi
IPB University.

Penelitian
dimulai di Sekolah Vokasi IPB University, Jl. Kumbang No.14, Kelurahan Babakan,
Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128, untuk tahap perencanaan
dan analisis kebutuhan. Setelah tahap perencanaan selesai, penelitian
dilanjutkan dengan implementasi dan pengujian sistem di BAPPENDA Kabupaten
Bogor.

1.2  Daftar Teknologi yang Digunakan

Dalam pengembangan fitur  ***Booking online* pada
*Website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor** ,
digunakan beberapa perangkat lunak dan alat bantu sebagai berikut:

Tabel 1 Perangkat Keras

| **Nama**          | **Keterangan**                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| *Device*              | Laptop Lenovo IdeaPad Gaming 3                                        |
| *OS*                  | *Windows 11 Home*                                                   |
| *Processor*           | AMD Ryzen™ 5 5600H (6 Cores, 12 Threads, hingga 4.2 GHz)Cache,       |
| up to 2.7 GHz, 4 cores) |                                                                       |
| *GPU*                 | AMD Radeon™ Graphics (Integrated) + NVIDIA GeForce GTX/RTX (opsional |
| tergantung varian)      |                                                                       |
| *RAM*                 | 8 GB DDR4 (dapat ditingkatkan hingga 16 GB)                           |
| *Storage*             | 512 GB SSD NVMe M.2                                                   |

[Tabel 2 Daftar
Teknologi yang digunakan]()

| **Komponen**                                  | **Teknologi yang Digunakan** | **Fungsi**         |
| --------------------------------------------------- | ---------------------------------- | ------------------------ |
| *Frontend*                                        | Vite.js, HTML, CSS,                |                          |
| JavaScript                                          | Membangun antarmuka                |                          |
| pengguna yang responsif dan interaktif.             |                                    |                          |
| *Backend*                                         | Node.js, Express.js                | Mengelola logika sistem  |
| dan komunikasi antara frontend dengand*atabase* . |                                    |                          |
| *Database*                                        | PostgreSQL                         | Menyimpan data pengguna, |
| jadwal, dan riwayat reservasi.                      |                                    |                          |
| *Desain UI/UX*                                    | Figma                              | Membuat desain tampilan  |
| dan prototype sistem.                               |                                    |                          |
| **Komponen**                                  | **Teknologi yang Digunakan** | **Fungsi**         |
| *Data Format*                                     | JSON                               | Format pertukaran data   |
| antara frontend dan backend.                        |                                    |                          |
| *Editor & Tools*                                  | Visual Studio Code, draw.io,       |                          |
| Railway                                             | Pengembangan kode,                 |                          |
| perancangan basis data, dan deployment sistem.      |                                    |                          |

  Teknologi
tersebut dipilih karena memiliki dukungan ekosistem yang luas, performa yang
baik, serta sesuai untuk pengembangan aplikasi web berbasis JavaScript full
stack yang efisien dan mudah dikembangkan secara berkelanjutan.

[]()[1.3  Teknik Pengumpulan Data dan Analisis Data]()

Dalam upaya
mengumpulkan informasi yang dapat dipertanggungjawabkan dan memperoleh data
yang relevan untuk mendukung keberhasilan pengembangan sistem yang diteliti,
penelitian ini menggunakan dua teknik pengumpulan data yang yang terdiri dari metode wawancara serta observasi. Adapun penjabaran dari kedua teknik tersebut adalah sebagai berikut:

[1.3.1
Wawancara]()

    [Wawancara dilakukan dengan pengelola sistem informasi
(PSI) dan pegawai bagian loket BAPPENDA untuk memahami kebutuhan fungsional
fitur  *booking online* , kendala dalam proses pelayanan, serta harapan
pengguna terhadap sistem baru. Menurut Fauzi (2020), wawancara terstruktur
efektif untuk menggali kebutuhan teknis dan mendefinisikan masalah dalam sistem
berbasis teknologi informasi.]()

Peneliti melaksanakan wawancara semi-terstruktur
dengan tiga narasumber inti di Bidang PSI—Kasubbid yang menjadi mentor proyek
serta dua staf PSI—untuk memetakan kebutuhan fungsional sistem berdasarkan
pengalaman operasional mereka.

[1.3.2
Observasi]()

    [Observasi dilakukan dengan mengamati langsung proses
pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan
berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan
pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti
mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui
sistem digital. Hasil observasi digunakan untuk menyusun rancangan alur fitur *booking
online* agar sesuai dengan kondisi operasional di lapangan.]()

[1.3.3
Analisis Data]()

    [Analisis data dilakukan dengan pendekatan kualitatif dan
kuantitatif berdasarkan data yang tersedia:]()

a)     Analisis Kualitatif

- Analisis Diskusi Rapat: Identifikasi
  kebutuhan fungsional dari diskusi dengan PSI, LTB, dan Peneliti
- Observasi Lapangan: Dokumentasi pola kerja
  dan titik inefisiensi dari pengamatan langsung
- Kategorisasi Kebutuhan: Pengelompokan
  kebutuhan berdasarkan prioritas dan urgensi
- Identifikasi Masalah: Dokumentasi kendala
  yang ditemukan dalam proses manual

b)     Analisis Kuantitatif

- Pengukuran Performa Sistem: Waktu respons,
  throughput, dan efisiensi sistem
- Analisis Statistik Kepuasan: Survey
  kepuasan pengguna setelah implementasi
- Pengukuran Efisiensi: Perbandingan waktu
  proses sebelum dan sesudah implementasi
- Metrik Teknis: Uptime sistem, akurasi
  validasi, dan stabilitas aplikasi

c)     Catatan Metodologi

    Karena tugas akhir ini merupakan hasil
magang dan fokus pada implementasi praktis, analisis kebutuhan dilakukan
melalui:

- *Learning by Doing* : Pemahaman kebutuhan melalui proses pengembangan
  sistem
- *User Feedback* : Validasi sistem melalui pengujian langsung
  dengan pengguna
- *Iterative Improvement* : Perbaikan sistem berdasarkan pengalaman
  implementasi
- *Practical Validation* : Pengujian sistem dalam lingkungan kerja
  yang sesungguhnya

[]()[1.4  Prosedur Kerja]()

Penelitian
menggunakan pendekatan pengembangan berbasis metode  *prototyping* . Metode
ini dipilih karena bersifat iteratif dan fleksibel, memungkinkan pengguna
memberikan umpan balik langsung pada setiap tahap pengembangan sistem. Menurut
Siswidiyanto et al. (2021), prototyping efektif diterapkan dalam pengembangan
perangkat lunak yang menitikberatkan pada antarmuka pengguna dan interaksi
langsung dengan sistem. Dalam konteks magang di BAPPENDA, metode ini
memungkinkan peneliti mengumpulkan masukan secara langsung dari pengguna untuk
menyesuaikan fitur sistem dengan ekspektasi dan kebutuhan aktual

[]()[Gambar ]()1Proses Tahapan Metode *P**rototype*

Tahapan metode *prototyping*
dalam penelitian ini adalah sebagai berikut:

*Communication

* – Pengumpulan kebutuhan melalui diskusi dengan
  stakeholder dan observasi lapangan.

 *Quick
Plan* – Perencanaan cepat untuk
menetapkan lingkup, prioritas fungsionalitas, dan jadwal pengembangan.

 *Quick
Design * – Pembuatan desain awal
(wireframe) dan diagram UML menggunakan Figma dan Draw.io.

*Prototype
Construction* – Pembangunan prototipe fungsional menggunakan
Node.js, Express.js, dan PostgreSQL.

*Delivery
and Feedback* – Pengujian
prototipe dan perbaikan berdasarkan umpan balik dari pengguna.

[1.5  Iterasi 1: Pembuatan Fitur *Booking* hingga Pengiriman (November
2024 – Januari 2025)]()

[1.5.1   *Communication * (Komunikasi)]()

Tahap komunikasi
merupakan tahap yang krusial karena melibatkan diskusi menyeluruh dengan *stakeholder*
untuk menggali kebutuhan dan tantangan spesifik dalam proses pelayanan BPHTB.
Tahapan ini membantu dalam mengidentifikasi perumusan kebutuhan menjadi lebih
jelas dan penting untuk kelanjutan proyek agar perancangan dapat sesuai dengan
kebutuhan pengguna (Ekasari et al. 2024). Dalam penelitian ini, komunikasi
dilakukan melalui wawancara dan observasi.

Wawancara adalah
prosedur yang bertujuan untuk memperoleh informasi dari seseorang melalui
jawaban lisan atas pertanyaan lisan (Setiawan et al. 2025). Teknik ini
dilakukan secara langsung dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST)
pada November 2024 dengan pendekatan semi-terstruktur untuk memahami alur kerja
sistem yang berjalan dan mengidentifikasi kebutuhan fungsional fitur  *booking
online* . Observasi dilakukan secara non-partisipatif selama masa magang
dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada
bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020),
observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan
memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat
diotomatisasi melalui sistem digital.

Dari hasil
wawancara dan observasi, teridentifikasi bahwa sistem BPHTB saat ini hanya
berupa website yang dapat diakses secara publik, namun alur bisnis internal
seperti proses booking jadwal pemeriksaan, penandatanganan dokumen, dan
koordinasi antar divisi masih dilakukan secara manual dengan menggunakan berkas fisik yang harus ditandatangani di atas kertas dan dikirimkan secara fisik antar divisi. Dalam kondisi normal, proses dapat diselesaikan
dalam 30-40 menit per berkas, namun pada kondisi kompleks atau saat terjadi
penumpukan, proses dapat memakan waktu hingga 2 jam karena harus menunggu
antrean di setiap divisi dengan tingkat kesalahan sekitar 10%. Keluhan utama
yang diidentifikasi meliputi: (1) proses penandatanganan dokumen secara fisik
yang memerlukan waktu perpindahan berkas, (2) sulitnya tracking status dokumen
secara real-time, (3) koordinasi antar divisi yang memakan waktu karena harus
mengantarkan berkas fisik, dan (4) tidak adanya sistem validasi digital untuk
memastikan keamanan dokumen. Hasil identifikasi ini menjadi dasar pengembangan
fitur *booking online* yang mengubah proses manual menjadi sistem digital
yang dapat dilakukan secara daring dari awal hingga akhir proses. Hasil
wawancara dengan Kasubbid PSI dapat dilihat pada Tabel 1 berikut ini.

Tabel 3
Hasil Wawancara

|  No  |  Tujuan                                                  |  Pertanyaan

| dan Jawaban                                                                  |                                               |                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1                                                                            | Menggali alur proses BPHTB saat ini           | **Peneliti:**"Bagaimana sistem BPHTB berjalan di BAPPENDA saat ini?" **Kasubbid          |
| PSI:**"Saat ini kami memiliki website BPHTB yang bisa diakses publik         |                                               |                                                                                                |
| untuk melihat informasi, namun untuk proses booking jadwal pemeriksaan masih |                                               |                                                                                                |
| dilakukan secara manual. PPAT/PPATS datang langsung ke kantor untuk          |                                               |                                                                                                |
| mengajukan booking, kemudian kami catat secara manual."                      |                                               |                                                                                                |
| 2                                                                            | Mengidentifikasi masalah dalam sistem booking |                                                                                                |
| manual                                                                       | **Peneliti:**"Apa                       |                                                                                                |
| kendala yang dihadapi dalam sistem booking manual saat ini?" **Kasubbid      |                                               |                                                                                                |
| PSI:**"Masalah utamanya adalah antrean panjang karena semua PPAT             |                                               |                                                                                                |
| datang di jam yang sama, sekitar 60-100 booking per hari untuk bphtb tapi    |                                               |                                                                                                |
| kami hanya punya kapasitas peneliti sekitar 85-105 orang yang harus dibagi   |                                               |                                                                                                |
| untuk 9 jenis pajak. Jadi sering terjadi penumpukan dan waktu tunggu yang    |                                               |                                                                                                |
| lama."                                                                       |                                               |                                                                                                |
| 3                                                                            | Menggali proses penandatanganan dokumen       | **Peneliti:**"Bagaimana                                                                  |
| proses penandatanganan dokumen di BAPPENDA?" **Kasubbid                      |                                               |                                                                                                |
| PSI:**"Penandatanganan masih dilakukan manual di atas kertas. Setiap         |                                               |                                                                                                |
| divisi harus menandatangani secara fisik, lalu berkas dipindahkan secara     |                                               |                                                                                                |
| manual antar divisi. Ini memakan waktu rata-rata 40 menit per berkas."       |                                               |                                                                                                |
| 4                                                                            | Identifikasi kebutuhan tracking status        | **Peneliti:**"Bagaimana                                                                  |
| PPAT mengetahui status dokumen mereka?" **Kasubbid                           |                                               |                                                                                                |
| PSI:**"Saat ini PPAT harus menanyakan langsung secara manual, apakah         |                                               |                                                                                                |
| datang ke kantor atau menghubungi via telepon. Tidak ada sistem tracking     |                                               |                                                                                                |
| real-time. Kadang ada kesalahan sekitar 10% karena dokumen tertukar atau     |                                               |                                                                                                |
| hilang dalam proses perpindahan fisik antar divisi."                         |                                               |                                                                                                |
| 5                                                                            | Fokus pengembangan iterasi pertama            | **Peneliti:**"Untuk iterasi pertama, fokus pengembangan apa yang diinginkan?" **Kasubbid |
| PSI:**"Pada fitur booking online dasar dengan tracking status. Tanda         |                                               |                                                                                                |
| tangan digital bisa ditambahkan di iterasi selanjutnya. Yang penting sistem  |                                               |                                                                                                |
| bisa digunakan untuk mengurangi antrean dan mempercepat proses."             |                                               |                                                                                                |
| 6                                                                            | Menilai urgensi digitalisasi                  | **Peneliti:**"Apakah                                                                     |
| digitalisasi proses booking dan tracking penting untuk BAPPENDA?" **Kasubbid |                                               |                                                                                                |
| PSI:**"Sangat penting. Dengan sistem online, PPAT bisa booking dari          |                                               |                                                                                                |
| mana saja tanpa harus datang ke kantor. Tracking real-time juga akan         |                                               |                                                                                                |
| mengurangi beban kerja pegawai yang harus menjawab pertanyaan status dokumen |                                               |                                                                                                |
| secara manual. Sistem digital juga akan mengurangi kesalahan karena data     |                                               |                                                                                                |
| tersimpan di database."                                                      |                                               |                                                                                                |
| 7                                                                            | Validasi kebutuhan fitur                      | **Peneliti:**"Fitur apa yang paling penting untuk sistem booking online                  |
| E-BPHTB?"**Kasubbid PSI:** "Yang paling penting adalah sistem          |                                               |                                                                                                |
| booking online agar PPAT bisa membuat jadwal dari rumah, tracking real-time  |                                               |                                                                                                |
| agar PPAT tahu posisi dokumen, dan tanda tangan digital agar tidak perlu     |                                               |                                                                                                |
| tanda tangan manual. Sistem juga harus terintegrasi dengan divisi Bank untuk |                                               |                                                                                                |
| verifikasi pembayaran, dan harus ada sistem validasi dokumen digital untuk   |                                               |                                                                                                |
| keamanan."                                                                   |                                               |                                                                                                |
|                                                                              |                                               |                                                                                                |

[1.5.2    *Quick Plan * (Perencanaan Cepat)]()

Selama tahap perencanaan cepat, fokus utama
adalah menyusun draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan
fungsional dari hasil komunikasi sebelumnya dengan stakeholder (Ekasari et al.
2024). Berdasarkan hasil wawancara dengan Kasubbid PSI (Tabel 1 No. 7),
peneliti menyusun perencanaan pengembangan sistem *booking online* tahap
awal dengan fokus pada pembuatan fitur booking online dasar dengan tracking
status. Proses perencanaan dilakukan melalui diskusi teknis berulang dengan
Kasubbid PSI (Hendri Aji Sulistiyanto, ST) sebagai mentor dan validator dalam
merancang alur sistem. Diskusi meliputi identifikasi requirement fungsional,
validasi alur bisnis yang akan diimplementasikan berdasarkan kondisi
operasional di BAPPENDA, serta kesepakatan mengenai scope pengembangan pada
iterasi pertama. Output
perencanaan yang dihasilkan adalah sebagai berikut:

a)
Fokus Iterasi Pertama: Berdasarkan masukan dari Kasubbid PSI, iterasi
pertama difokuskan pada sistem booking online dasar dengan tracking status
real-time. Fitur-fitur yang direncanakan meliputi: (1) sistem pemesanan jadwal
pemeriksaan secara daring, (2) dashboard tracking untuk memantau status dokumen
secara real-time, (3) integrasi modul antar divisi (PPAT/PPATS, LTB, Peneliti,
dan LSB), dan (4) sistem notifikasi untuk update status dokumen.

Sebelum
menjelaskan diagram UML yang akan dibuat, terlebih dahulu perlu dijelaskan
simbol-simbol yang digunakan untuk memudahkan pemahaman pembaca. Simbol-simbol
yang digunakan dalam diagram penelitian ini dapat dilihat pada Tabel 4 sebagai
berikut.

Tabel 4 Simbol-simbol Diagram

|  Nama            |  Simbol  |  Deskripsi / Legenda

| Visual                                                                       |  |                                                      |
| ---------------------------------------------------------------------------- | - | ---------------------------------------------------- |
| Status Awal                                                                  |  | Menyatakan awal mulainya proses aktivitas (Start).   |
| Aktivitas                                                                    |  | Menggambarkan aktivitas atau tindakan yang dilakukan |
| sistem atau aktor (Process Step).                                            |  |                                                      |
| Transisi                                                                     |  | Menghubungkan satu elemen aktivitas ke elemen        |
| lainnya, menunjukkan arah alur (Flow Line).                                  |  |                                                      |
| Keputusan                                                                    |  | Menyatakan percabangan alur berdasarkan kondisi      |
| tertentu (Decision / Conditional Branch).                                    |  |                                                      |
| Basis Data                                                                   |  | Mengindikasikan proses penyimpanan atau pengambilan  |
| data dari sistem penyimpanan (Database).                                     |  |                                                      |
| Status Akhir                                                                 |  | Menandai akhir dari proses suatu aktivitas (End).    |
| Actor                                                                        |  | Menggambarkan                                        |
| entitas (orang/proses/sistem) yang melakukan interaksi dengan sistem.        |  |                                                      |
| Use Case                                                                     |  | Menggambarkan                                        |
| fungsi sistem sebagai unit-unit yang saling bertukar pesan dengan aktor, dan |  |                                                      |
| biasanya diberi awal nama dengan kata kerja.                                 |  |                                                      |
| Association                                                                  |  | Menggambarkan                                        |
| komunikasi antara aktor dan use case.                                        |  |                                                      |
| Generalization                                                               |  | Menggambarkan                                        |
| hubungan umum-khusus antara dua case, di mana fungsi yang satu lebih umum    |  |                                                      |
| dari lainnya.                                                                |  |                                                      |
| Extend                                                                       |  | Menunjukkan                                          |
| fungsi lain yang bersifat opsional dan dapat berdiri sendiri.                |  |                                                      |
| Include                                                                      |  | Menunjukkan                                          |
| bahwa use case utama wajib menjalankan use case lain sebagai bagian dari     |  |                                                      |
| prosesnya.                                                                   |  |                                                      |

b)      *Activity Diagram* Iterasi 1: Untuk memvisualisasikan
perencanaan alur kerja yang akan dikerjakan, dibuat *Activity Diagram*
Iterasi 1 yang menunjukkan proses transformasi dari sistem manual menjadi
digital. Diagram ini menggambarkan alur dari pengajuan booking hingga
penyelesaian dokumen, dan menjadi panduan teknis dalam pengembangan sistem. *Activity
Diagram* dapat dilihat pada Gambar 2.

[]()[Gambar ]()2*Activity* *Diagram* Iterasi 1

*Activity
Diagram* ini menggambarkan
transformasi alur kerja manual menjadi sistem digital yang terintegrasi untuk
pengelolaan Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB). Proses dimulai
ketika Pejabat Pembuat Akta Tanah (PPAT) atau Pejabat Pembuat Akta Tanah Sementara
(PPATS) melakukan pengajuan *booking* melalui sistem  *online* , yang
kemudian diteruskan ke Loket Terima Berkas (LTB) untuk verifikasi kelengkapan
dokumen, di mana data seperti identitas dan surat perjanjian diperiksa secara
digital guna memastikan kepatuhan awal. Setelah verifikasi selesai, dokumen
masuk ke tahap pemeriksaan oleh Peneliti untuk memastikan keakuratan data dan
kelengkapan persyaratan.

Proses
selanjutnya melibatkan Bank dalam penanganan pembayaran BPHTB, yang
terintegrasi langsung dengan sistem untuk memastikan sinkronisasi data
keuangan. Tahap akhir adalah serah terima dokumen oleh Loket Serah Berkas (LSB)
kepada PPAT/PPATS yang telah menyelesaikan seluruh proses. Seluruh alur kerja
ini dapat dipantau secara *real-time* oleh semua pihak terkait, memberikan
transparansi dan efisiensi yang signifikan dibandingkan dengan sistem manual
sebelumnya. Dengan demikian, diagram ini menekankan bagaimana integrasi
teknologi mendukung modernisasi pelayanan publik dan meningkatkan kepuasan
pengguna (Berdasarkan Tabel 3 poin No. 5 dan No. 6).

c)
Struktur
Database: Berdasarkan analisis kebutuhan sistem, dirancang struktur database
yang mencakup 13 tabel utama, antara lain: pat_1_booking_sspd,
pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop,
pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan,
ltb_1_terima_berkas_sspd, p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf,
pv_1_paraf_validate, dan lsb_1_serah_berkas. Setiap tabel dirancang untuk
menyimpan data spesifik dari setiap tahapan proses, dimana relasi antar tabel dirancang
untuk memastikan integritas data dan memfasilitasi tracking real-time status
dokumen.

d)
Alur Kerja Sistem: Alur kerja
sistem mengikuti tahapan yang terstruktur sesuai dengan *Activity Diagram*
yang telah direncanakan. Proses dimulai dari pengajuan *booking* oleh
PPAT/PPATS melalui sistem online, kemudian verifikasi kelengkapan dokumen oleh
LTB, dilanjutkan dengan pemeriksaan oleh Peneliti, dan tahap akhir adalah
proses serah berkas di LSB. Setiap tahapan direkam dalam database sehingga
status dokumen dapat dilacak secara real-time melalui dashboard tracking
(Berdasarkan Tabel 3 No. 2 dan 4).

[1.5.3    *Quick Design * (Desain Cepat)]()

Pada tahap pemodelan desain cepat,
aktivitas berfokus merepresentasikan tampilan dan struktur aplikasi secara
visual, seperti perancangan sketsa antarmuka aplikasi, pembuatan *wireframe*
dan  *mock-up* , serta pembuatan  *Activity Diagram* ,  *Use Case
Diagram* , dan *Entity Relationship Diagram* secara lebih detail untuk
mendeskripsikan alur sistem dan struktur basis data yang akan digunakan sebagai
dasar pembangunan prototipe (Allacsta dan Hadiwandra 2024). Proses desain
dilakukan oleh peneliti dengan pendekatan  *user-centric design* , dimana
setiap *wireframe* ditampilkan kepada Kasubbid PSI (Hendri Aji
Sulistiyanto, ST) untuk mendapatkan *feedback* dan validasi kelayakan alur
sistem. Kasubbid PSI berperan sebagai validator yang memahami kebutuhan semua
divisi karena posisinya sebagai pemegang alur pemrosesan dan integrasi design
alur di BAPPENDA. Iterasi desain dilakukan sebanyak 3 kali sampai mendapatkan
persetujuan final dari Kasubbid PSI. Output desain yang dihasilkan adalah
sebagai berikut:

*a)

* *Wireframe* :  Desain awal sistem dibuat
  menggunakan *Figma* dengan rancangan *wireframe* untuk tiap divisi
  (PPAT/PPATS, LTB, Bank, Peneliti, dan LSB). *Wireframe* dirancang untuk
  mengilustrasikan *layout* dan navigasi dasar dari setiap halaman pada
  sistem  *booking online* . Setelah *wireframe* disetujui Kasubbid PSI,
  implementasi *visual interface* langsung dikembangkan menggunakan  *HTML* ,
  *CSS* , dan *JavaScript* dalam tahap konstruksi prototipe untuk
  meningkatkan efisiensi proses pengembangan.

Gambar 3 Wireframe

*b)

* *Swimlane Diagram* : Diagram ini dirancang untuk mengilustrasikan pembagian tanggung
  jawab dan alur kerja antar divisi dalam proses booking online E-BPHTB. Swimlane
  Diagram dapat dilihat pada Gambar 5. Proses diagram ini terbagi menjadi enam
  lane utama yaitu PPAT (pengajuan dan upload), LTB (verifikasi berkas), Peneliti/Paraf
  (pemeriksaan data persetujuan digital), Peneliti Validasi (validasi akhir), dan
  LSB (serah terima) yang dimana setiap *lane* menggambarkan urutan kegiatan
  yang dilakukan oleh masing-masing aktor secara berkesinambungan, mulai dari
  pendaftaran hingga dokumen dinyatakan sah dan diterima. Diagram ini didukung
  oleh 13 tabel database yang berfungsi untuk menyimpan dan mengelola data
  transaksi secara sistematis, dengan estimasi waktu pemrosesan 10-25 menit per dokumen.
  Swimlane Diagram ini memiliki relevansi penting dalam tahapan prototyping
  iterasi pertama, karena mampu meningkatkan efisiensi proses bisnis, mengurangi
  kemungkinan terjadinya overlapping antar divisi, serta memfasilitasi
  pengembangan sistem yang berorientasi pada kebutuhan pengguna (user-centric
  design).

[]()[Gambar 5]()*Swimlane
Diagram* Iterasi 1

*c)
*Use
Case Diagram: Use case diagram dibuat untuk menggambarkan interaksi antara
aktor-aktor sistem dengan fungsi-fungsi yang tersedia. Use Case Diagram dapat
dilihat pada Gambar 6. Diagram ini menunjukkan 7 aktor utama (PPAT/PPATS, LTB,
Bank, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB, dan Admin) yang
berinteraksi dengan 24 use case yang mencakup booking, verifikasi, dan
penyelesaian dokumen atau seluruh proses booking online. Menggunakan simbol UML
standar dan warna untuk aktor, diagram ini relevan dalam prototyping untuk
efisiensi dan validasi di BAPPENDA. Use Case Diagram ini tidak hanya memberikan
gambaran umum mengenai fungsionalitas sistem, tetapi juga menjadi acuan awal
dalam proses pengembangan perangkat lunak. Melalui diagram tersebut, pengembang
dapat memahami kebutuhan pengguna dengan lebih jelas serta memastikan bahwa
setiap fungsi yang dirancang mampu mendukung tujuan utama sistem secara
keseluruhan.

[]()[Gambar 6]()*Usecase
Diagram* Iterasi 1

d)       *Activity Diagram* Kompleks: *Activity Diagram* kompleks dibuat
untuk menggambarkan detail interaksi pengguna dengan sistem secara menyeluruh.
Diagram ini merupakan detail kompleks dari pengguna yang mencakup seluruh alur
kerja dari *booking* hingga penyelesaian dokumen. *Activity Diagram*
kompleks dapat dilihat pada Gambar 7, 8, dan 9. Diagram ini menggambarkan
detail interaksi pengguna dengan sistem yang terbagi menjadi tiga bagian utama.
Part 1 mencakup proses booking oleh PPAT/PPATS dengan generate nomor booking
(`ppat_khusus+2025+urut`) dan validasi dokumen oleh LTB dengan generate nomor
registrasi (`2025+O+urut`). Part 2 meliputi pemeriksaan dokumen oleh Peneliti
dan proses paraf serta stempel oleh peneliti paraf. Part 3 mencakup validasi
akhir oleh Peneliti Validasi dan serah terima dokumen oleh LSB hingga
penyelesaian proses booking.

[]()[Gambar 7](), 8, 9  *Activity
Diagram * (Kompleks) Iterasi 1

e. Struktur
Database Relasional: Struktur database relasional dirancang menggunakan  *draw.io* ,
yang mendukung sistem penomoran otomatis (no_booking_, no_registrasi) dan
keterhubungan antar tabel. Database dirancang untuk mendukung semua fungsi yang
telah direncanakan dalam Activity Diagram dan Use Case Diagram, dimana setiap
tabel memiliki relasi yang jelas dengan tabel lainnya untuk memastikan
integritas data dan memfasilitasi tracking real-time status dokumen.

Gambar 10 Struktur Database

[1.5.4   *Construction of Prototype* (Konstruksi
Prototipe)]()

Tahap ini merupakan
proses penerjemahan rancangan konseptual dari tahap *modelling quick design*
menjadi kode program yang dapat dijalankan. Implementasi dimulai dengan
pembuatan *models* untuk merepresentasikan struktur dan relasi basis data,
dilanjutkan dengan *controller* yang mengatur logika bisnis dan pengolahan
data, serta *view* sebagai antarmuka pengguna untuk menampilkan data dan
interaksi secara visual. Ketiga komponen ini terintegrasi membentuk aplikasi
yang utuh dan dapat digunakan sesuai tujuan perancangan awal.

Pembangunan prototipe
awal dilakukan secara bertahap oleh peneliti dengan pendekatan  *agile
development* . Proses dimulai dengan *setup environment* menggunakan *Node.js*
dan *Express.js* sebagai  *backend* , serta  *HTML* ,  *CSS* ,
dan *JavaScript (Vite.js)* sebagai  *frontend* . *Database PostgreSQL*
dikonfigurasi terlebih dahulu untuk menyimpan struktur data sesuai dengan *ERD*
yang telah dirancang pada tahap  *Quick Design* . Setiap fitur dikembangkan
secara modular dengan struktur MVC ( *Model-View-Controller* ) dan diuji
menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review
kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji
Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap
minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang
telah dirancang sesuai kondisi operasional di BAPPENDA. Fitur yang dikembangkan
pada iterasi pertama adalah sebagai berikut:

*a)

* Formulir Booking Online: Formulir booking
  online dirancang untuk memungkinkan PPAT/PPATS melakukan pemesanan jadwal
  pemeriksaan secara daring dari mana saja. Formulir ini dilengkapi dengan
  validasi input untuk memastikan data yang dimasukkan sesuai dengan format yang
  diharapkan, seperti format nomor identitas, format tanggal, dan validasi
  kelengkapan data.

*b)
*Unggah
Dokumen: Sistem unggah dokumen memungkinkan pengguna untuk mengunggah dokumen
pendukung seperti akta tanah, sertifikat, dan dokumen pelengkap lainnya.
Dokumen yang diunggah disimpan dalam database dan dapat diakses oleh divisi
terkait sesuai dengan tahapan proses.

*c)
*Dashboard
Admin dan Tracking Real-time: Dashboard admin dirancang untuk memberikan
overview status semua dokumen yang sedang diproses. Dashboard ini menampilkan
status tracking secara real-time, dimana setiap divisi dapat melihat status
dokumen pada tahap tertentu dan melakukan update status sesuai dengan tahapan
proses yang telah ditentukan (Berdasarkan Tabel X No. 4).

*d)
*Sistem
Login Multi-divisi: Sistem login multi-divisi dirancang dengan berbasis hak
akses (role-based access control) untuk memastikan bahwa setiap divisi hanya
dapat mengakses fitur yang sesuai dengan perannya. Setiap pengguna memiliki
credential yang berbeda dan hanya dapat melihat dan mengedit data yang sesuai
dengan hak aksesnya.

Tahapan ini
menghasilkan prototipe fungsional yang mencerminkan proses bisnis BAPPENDA
secara digital, dimana sistem booking online dapat digunakan untuk mengurangi
antrean dan mempercepat proses pemrosesan dokumen BPHTB (Berdasarkan Tabel X
No. 2 dan 7).

[1.5.5   *Delivery and Feedback* (Penyerahan dan Umpan
Balik)]()

Pada tahap *Deployment, Delivery*
& *Feedback* dilakukan *black box testing* untuk memastikan
aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna.
Pengujian ini dilakukan dari sudut pandang pengguna tanpa mengetahui struktur
internal program, sehingga membantu menemukan dan memperbaiki bug yang dapat
mengganggu pengalaman pengguna, agar rilis optimal serta memperoleh umpan balik
konstruktif (Salim & Rusdiansyah 2024). Dalam penelitian ini, uji coba
dilakukan selama dua minggu dengan koordinasi dari Kasubbid PSI (Hendri Aji
Sulistiyanto, ST) yang memfasilitasi akses ke sistem *staging* bagi
berbagai divisi di BAPPENDA.

Mekanisme pengujian yang dilakukan adalah
sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta
untuk menguji semua fitur sesuai dengan skenario kasus nyata sesuai dengan alur
kerja BPHTB di BAPPENDA. Pengujian dilakukan secara bertahap, dimana pada
minggu pertama fokus pada pengujian fitur booking online dan tracking status,
sedangkan pada minggu kedua dilakukan pengujian integrasi antar modul dan
pengujian di kondisi beban normal. Mekanisme pengumpulan feedback dilakukan
melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk
mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan
sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid
PSI untuk merangkum feedback dan menentukan action plan untuk iterasi
berikutnya.

Hasil evaluasi dari pengujian Iterasi 1
menunjukkan bahwa sistem booking online yang telah dikembangkan dapat berfungsi
dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil evaluasi
menunjukkan alur kerja menjadi lebih transparan dan efisien dibandingkan sistem
manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu
diperbaiki pada iterasi berikutnya, antara lain: (1) waktu unggah tanda tangan
yang masih relatif lama karena pengguna harus mengunggah tanda tangan untuk setiap
dokumen, (2) belum tersedianya sertifikat digital maupun *QR code* untuk
validasi keaslian dokumen, dan (3) proses pengiriman antar divisi masih
memerlukan beberapa langkah manual. Berdasarkan hasil evaluasi tersebut, *action
plan* untuk Iterasi 2 mencakup: (1) penerapan tanda tangan digital berulang
( *reusable signature* ) agar pengguna hanya perlu mengunggah tanda tangan
sekali dan dapat digunakan untuk beberapa dokumen, (2) integrasi sertifikat
digital untuk memastikan keamanan dan keaslian dokumen, (3) implementasi *QR
code* untuk validasi dokumen, dan (4) otomatisasi pengiriman antar divisi
untuk mengurangi langkah manual yang masih diperlukan.

[1.6  Iterasi 2: Optimasi dan Efisiensi Sistem (Maret – Agustus 2025)]()

Iterasi kedua dilakukan setelah memperoleh
feedback dari pengujian Iterasi 1, dimana berdasarkan action plan yang telah
disepakati, fokus pengembangan dialihkan pada peningkatan keamanan dokumen dan
efisiensi proses melalui implementasi tanda tangan digital reusable, integrasi
sertifikat digital, serta otomatisasi pengiriman antar divisi.

[1.6.1   *Communication * (Komunikasi)]()

Tahap komunikasi kedua
dilakukan untuk menggali kebutuhan pengembangan fitur keamanan dan efisiensi
dokumen berdasarkan hasil evaluasi Iterasi 1. Diskusi dilakukan dengan Kasubbid
PSI (Hendri Aji Sulistiyanto, ST) yang berkoordinasi dengan Kepala Bidang TI
dan Keamanan Dokumen untuk merancang sistem validasi berbasis sertifikat
digital. Analisis kebutuhan menunjukkan sistem harus mendukung:

* Enkripsi
  dokumen dengan **AES-256**
* Validasi
  keaslian menggunakan **QR code**
* Audit trail
  lengkap untuk setiap proses dokumen

·
Pembuatan
sertifikat digital sebagai tanda keaslian dokumen

Hasil komunikasi dari
diskusi dengan Kasubbid PSI menunjukkan bahwa iterasi kedua perlu fokus pada
peningkatan keamanan dokumen dan efisiensi proses untuk mengatasi kekurangan
yang ditemukan pada Iterasi 1. Sistem keamanan yang direncanakan akan mengintegrasikan
teknologi sertifikat digital dan QR code yang akan dikembangkan khusus untuk
sistem ini, dimana sebelumnya BAPPENDA belum memiliki sistem sertifikat digital
untuk validasi dokumen. Implementasi sistem sertifikat digital ini diharapkan
dapat memastikan keaslian dan keamanan dokumen yang diproses melalui sistem
booking online.

[1.6.2    *Quick Plan * (Perencanaan Cepat)]()

Selama tahap
perencanaan cepat, dilakukan penyusunan draft awal sistem aplikasi yang
disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan
stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun
perencanaan pengembangan sistem keamanan dan efisiensi untuk Iterasi 2. Proses
perencanaan dilakukan melalui diskusi teknis dengan Kasubbid PSI sebagai mentor
dan validator dalam merancang solusi keamanan yang komprehensif. Output
perencanaan yang dihasilkan adalah sebagai berikut:

a)     Modifikasi Database: Tahap perencanaan mencakup
penambahan 9 tabel *Database* baru untuk mendukung fitur keamanan, seperti
pv_local_certs, pv_4_signing_audit_event, pv_7_audit_log, sys_notifications,
dan bank_1_cek_hasil_transaksi. Modifikasi juga dilakukan pada beberapa tabel
eksisting (a_2_verified_users, p_1_verifikasi, dan p_3_clear_to_paraf) untuk
menambahkan kolom tanda tangan digital. Penambahan tabel dan kolom ini
dirancang untuk mendukung arsitektur keamanan dengan empat lapisan utama.

b)      Arsitektur Keamanan 4 Lapisan:

1. *Certificate Generation* : Sistem akan menghasilkan sertifikat digital
   untuk setiap dokumen yang divalidasi, dimana sertifikat ini berfungsi sebagai
   tanda keaslian dan keamanan dokumen.
2. *QR Code Embedding* : Sistem akan menambahkan *QR code* ke
   setiap dokumen yang telah divalidasi, dimana *QR code* ini dapat digunakan
   untuk verifikasi keaslian dokumen secara cepat.
3. *Encrypted Storage* : Dokumen yang disimpan di database akan
   dienkripsi menggunakan *AES-256* untuk memastikan keamanan data dari akses
   yang tidak sah.
4. *Audit Logging* : Sistem akan mencatat semua aktivitas yang terjadi pada dokumen dalam
   tabel  *audit log* , dimana catatan ini berfungsi untuk *tracking* dan *audit
   trail* setiap proses yang dilakukan.

c)      Integrasi Sistem: Sistem juga dirancang untuk
terintegrasi dengan divisi Bank untuk verifikasi pembayaran, dimana integrasi
ini memungkinkan verifikasi pembayaran dilakukan secara paralel dengan
pemeriksaan berkas untuk meningkatkan efisiensi proses.

[1.6.3    *Quick Design * (Desain Cepat)]()

Pada tahap pemodelan desain cepat untuk
Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru
yang telah direncanakan pada tahap  *Quick Plan* . Proses desain dilakukan
oleh peneliti dengan melakukan presentasi *wireframe* dan *mockup*
kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan *feedback*
dan validasi terhadap fitur keamanan yang kompleks seperti sistem sertifikat
digital dan  *QR code* . Kasubbid PSI berperan sebagai validator yang
melakukan *review* terhadap desain untuk memastikan kelayakan implementasi
dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain
dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid
PSI. Output desain yang dihasilkan adalah sebagai berikut:

a)
Komponen Keamanan: Desain
iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan
sertifikat digital dan modul verifikasi  *QR code* . Panel pengelolaan
sertifikat dirancang untuk memungkinkan admin mengelola sertifikat digital yang
dihasilkan oleh sistem, sedangkan modul verifikasi *QR code* dirancang
untuk validasi keaslian dokumen secara cepat.

b)
Diagram Alur Validasi: Diagram
alur validasi dirancang menggunakan *Draw.io* yang terdiri atas tahap: *User
Request* → *Authentication* → *Certificate Generation* → *QR
Code Creation* →  *Verification* . Alur ini menggambarkan proses validasi
dokumen yang memastikan keamanan dan keaslian dokumen melalui sertifikat
digital dan  *QR code* .

c)
Antarmuka Pengguna: Antarmuka
pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan *dashboard*
pemantauan status dokumen dan notifikasi otomatis. *Dashboard* ini
dirancang untuk memberikan *overview* status dokumen yang mencakup
informasi validasi sertifikat digital dan  *QR code* .

d)
 *Activity Diagram* : *Activity Diagram* Iterasi 2 menggambarkan alur kerja sistem *booking
online E-BPHTB* secara komprehensif dengan penambahan fitur keamanan. *Activity
Diagram* dapat dilihat pada Gambar 11.

[]()[Gambar 11]()*Activity
Diagram* Iterasi 2

Proses dimulai dari " *All user* "
yang dapat "Masuk/Keluar" sistem, dan "PPAT/PPATS" yang
melakukan "Buat  *Booking* " dan memasukkan data ke "Tabel
Tersetujui". Secara paralel, "Admin" memantau "Cek
Notifikasi" dan " *Ping* " untuk memastikan kelancaran
sistem. Dokumen yang masuk akan melalui "LTB" untuk "Tabel
Terima Berkas", dengan integrasi "BANK" untuk "Tabel
Validasi Nomor pembayaran" yang hasilnya dikirim kembali ke LTB. Keputusan
"Tolak" pada tahap LTB, BANK atau "Peneliti Validasi" akan
memicu pengiriman "Email Pesan Penolakan" kepada PPAT/PPATS. Jika
diterima, dokumen diteruskan ke "Peneliti" untuk "Tabel
Verifikasi" dan "Tabel Paraf". Tahap krusial Iterasi 2 adalah
proses "Peneliti Validasi" yang melibatkan "Tabel
Validasi". Setelah disetujui, sistem akan menghasilkan "Berkas
Validasi Terbuat" dan menyisipkan "QR Code dan Sertifikat".
Proses ini memastikan keaslian dan keamanan dokumen. Akhirnya, dokumen yang
"Siap Diserahkan" akan dikelola oleh "LSB" melalui
"Tabel Penyerahan Berkas", menandai selesainya seluruh alur booking
online. Diagram ini menunjukkan peningkatan efisiensi dan keamanan melalui
otomatisasi dan integrasi antar divisi.

e)      *Swimlane Diagram* : *Swimlane Diagram* Iterasi 2 menggambarkan
alur kerja sistem *booking online E-BPHTB* yang telah dikembangkan menjadi
lebih terintegrasi dengan penambahan divisi BANK dan sistem notifikasi  *real-time* .
*Swimlane Diagram* dapat dilihat pada Gambar 12.

[]()[Gambar 12]()*Swimlane
Diagram* 2

Diagram ini
membagi keseluruhan proses menjadi tujuh lane utama yaitu PPAT (pengajuan dan
upload), LTB (verifikasi berkas), BANK (verifikasi pembayaran), Peneliti
(pemeriksaan data), Clear to Paraf (persetujuan digital), Peneliti Validasi
(validasi akhir dengan BSRE Authentication dan Generate QR Code), dan LSB
(serah terima). Swimlane Diagram ini menggambarkan workflow yang lebih efisien
dengan integrasi BANK yang memungkinkan verifikasi pembayaran paralel dengan
pemeriksaan berkas. PPAT/PPATS dapat mengunggah tanda tangan sekali untuk
digunakan berulang kali, sementara Peneliti Validasi melakukan proses BSRE
Authentication dan Generate QR Code untuk keamanan dokumen. Sistem notifikasi
real-time memungkinkan komunikasi yang lebih efektif antar divisi, dengan Admin
yang mengelola validasi QR code dan monitoring sistem secara menyeluruh.

f)      Use Case Diagram: Use Case Diagram Iterasi
2 menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan
dan otomasi. Use Case Diagram dapat dilihat pada Gambar 10.

[]()[Gambar 13]()*Usecase
Diagram* Iterasi 2

Pada gambar 13
merupakan *Use Case Diagram* Iterasi 2 dimana diagram ini menggambarkan
signifikan pada sistem *E-BPHTB* melalui penambahan fitur keamanan,
otomasi proses, serta peningkatan efisiensi kerja antar divisi. Diagram ini
menampilkan tujuh aktor utama, yaitu PPAT/PPATS, LTB, BANK, Peneliti, Peneliti
Validasi, Sistem, dan Admin, yang berinteraksi dengan 22 *use case* yang
mencakup berbagai fungsi penting seperti otomasi tanda tangan digital,
validasi  *QR Code* , serta
integrasi sistem bank.

*Use Case
Diagram* ini menggambarkan
evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi.
PPAT/PPATS dapat melakukan "*Upload* Tanda Tangan Sekali" dan "*PPAT Auto Fill Signature*" yang
akan digunakan berulang kali, sementara Peneliti dapat melakukan "*Peneliti Auto Fill Signature Reusable*". BANK terintegrasi langsung dengan berbagai fungsi seperti "*Bank Login*", "*Bank View Dashboard*", "*Bank View Booking List*", "*Bank View Booking Detail*", "*Bank Cek Validasi Pembayaran Detail*", "*Bank Hasil Transaksi*", "*Bank Input Payment Data*", "*Bank Verify Payment*", dan "*Bank Save Verification*". Peneliti
Validasi memiliki akses ke "*Generate Sertifikat Digital Lokal*", "*Generate QR Code*", "*Verifikasi Digital Signature*", dan "*Select Reusable Signature*" untuk proses validasi
yang lebih aman. Admin dapat melakukan "*Admin Validasi QR Code*" dan
mengelola "*Real-time Notifications*" untuk monitoring sistem
secara menyeluruh. Sistem secara otomatis melakukan "*Display QR Code di Dokumen*", "*Generate Nomor Validasi*", "*Sinkronisasi Bank-LTB*", dan "*Integrasi Bank dengan LTB Parallel Workflow*" untuk mendukung efisiensi proses.

*Use Case
Diagram* Iterasi 2 ini
tidak hanya berfungsi sebagai representasi visual dari hubungan antar aktor dan
fungsi sistem, tetapi juga menjadi panduan penting dalam tahap pengembangan
lanjutan. Peningkatan fitur otomasi, keamanan, dan integrasi lintas divisi
menunjukkan komitmen pengembang dalam menghadirkan sistem *E-BPHTB* yang
lebih efisien, transparan, dan adaptif terhadap perkembangan teknologi
informasi dalam pelayanan publik.

[1.6.4   *Construction of Prototype* (Konstruksi
Prototipe)]()

Tahap ini merupakan
proses penerjemahan rancangan konseptual dari tahap modelling quick design
menjadi kode program yang dapat dijalankan untuk fitur keamanan dan efisiensi.
Implementasi dimulai dengan pengembangan modul keamanan yang meliputi pembuatan
sertifikat digital, integrasi  *QR code* , dan implementasi enkripsi  *AES-256* .
Proses pembangunan dilakukan secara bertahap dengan prioritas pada modul
keamanan dan efisiensi yang telah direncanakan pada tahap  *Quick Plan* .

Pembangunan prototipe
pada Iterasi 2 dilakukan secara bertahap oleh peneliti dengan pendekatan  *agile
development* . Proses dimulai dengan pengembangan sistem sertifikat digital
lokal yang akan diimplementasikan di server BAPPENDA dengan koordinasi teknis
dan supervisi dari Kasubbid PSI. Pengembangan algoritma enkripsi *AES-256*
dilakukan dengan mengikuti standar keamanan yang telah ditetapkan. Setiap fitur
keamanan dikembangkan secara modular dan diuji menggunakan unit testing sebelum
diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem
dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai
mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan
kesesuaian dengan alur bisnis yang telah dirancang. Uji coba integrasi
dilakukan di lingkungan staging sebelum diimplementasikan ke sistem produksi.

Fitur yang
dikembangkan pada iterasi kedua adalah sebagai berikut:

a)      Otomasi
Tanda Tangan Digital: Sistem dirancang agar pengguna cukup mengunggah tanda
tangan sekali ( *reusable signature* ) dan dapat digunakan untuk beberapa
dokumen, sehingga mengurangi waktu unggah tanda tangan yang merupakan salah
satu kekurangan pada Iterasi 1.

b)     Sertifikat Digital Lokal: Sistem menghasilkan
sertifikat digital secara lokal untuk setiap dokumen yang divalidasi oleh
pejabat (Kabid Pelayanan). Sertifikat digital dienkripsi menggunakan enkripsi *AES-256*
untuk memastikan keamanan data dari akses yang tidak sah. Sistem sertifikat
digital ini berjalan di server lokal BAPPENDA dan hanya digunakan oleh pejabat
yang berwenang untuk melakukan validasi dokumen.

c)     Validasi *QR Code* Ganda: Sistem dirancang
untuk menghasilkan dan memvalidasi *QR code* ganda untuk publik dan
internal BAPPENDA. *QR code* publik dapat digunakan untuk verifikasi
dokumen oleh pihak eksternal, sedangkan *QR code* internal digunakan untuk
validasi internal oleh peneliti validasi.

d)     Sistem Notifikasi  *Real-time* : Sistem
notifikasi *real-time* antar divisi dirancang untuk mempercepat komunikasi
dan koordinasi dalam setiap tahapan proses, dimana notifikasi akan dikirim
secara otomatis ketika ada perubahan status dokumen.

e)     Integrasi Divisi Bank: Sistem terintegrasi
dengan divisi Bank agar verifikasi pembayaran dapat dilakukan secara paralel
dengan pemeriksaan berkas, sehingga meningkatkan efisiensi proses dan
mengurangi waktu tunggu.

Tahapan ini
menghasilkan prototipe yang lebih aman dan efisien dengan integrasi keamanan
digital yang komprehensif.

[1.6.5   *Delivery and Feedback* (Penyerahan dan Umpan
Balik)]()

Pada tahap Deployment, Delivery &
Feedback untuk Iterasi 2, dilakukan black box testing untuk memastikan fitur
keamanan dan efisiensi yang telah dikembangkan siap rilis dan berfungsi dengan
baik. Pengujian ini dilakukan dari sudut pandang pengguna tanpa mengetahui
struktur internal program, sehingga membantu menemukan dan memperbaiki bug yang
dapat mengganggu pengalaman pengguna. Dalam penelitian ini, pengujian dilakukan
selama empat minggu dengan 5 pegawai dari bidang PSI yang berperan sebagai admin,
LTB, peneliti, peneliti Validasi (Pejabat), dan LSB, serta 5 pengguna eksternal
(PPAT) untuk menguji sistem dari perspektif pengguna end-to-end.

Mekanisme pengujian yang dilakukan adalah
sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta
untuk menguji semua fitur keamanan dan efisiensi sesuai dengan skenario kasus
nyata. Pengujian dilakukan di jam sibuk untuk menguji performa sistem di
kondisi riil sesuai dengan beban kerja harian di BAPPENDA. Mekanisme
pengumpulan *feedback* dilakukan melalui diskusi langsung dengan Kasubbid
PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi
mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan
sesi evaluasi bersama Kasubbid PSI untuk merangkum *feedback* dan
menentukan *action plan* untuk iterasi berikutnya.

Hasil evaluasi dari pengujian Iterasi 2
menunjukkan bahwa sistem booking online dengan fitur keamanan digital yang
telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan
operasional di BAPPENDA. Hasil menunjukkan bahwa validasi *QR code*
mencapai akurasi 99,8%, waktu validasi menurun dari 15 menit menjadi 2 menit
per dokumen, dan efisiensi meningkat 70% dibandingkan dengan sistem manual
sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki
pada iterasi berikutnya, yaitu masih diperlukan penambahan sistem kuotasi untuk
mencegah penumpukan booking karena dengan sistem yang lebih efisien, jumlah
booking mengalami peningkatan yang signifikan. Berdasarkan hasil evaluasi
tersebut, *action plan* untuk Iterasi 3 mencakup: (1) pengembangan sistem
kuotasi dinamis untuk mengelola kapasitas booking harian, (2) implementasi *priority
queue* untuk mengatur prioritas pemrosesan dokumen berdasarkan urgensi, dan
(3) penambahan dashboard monitoring untuk memantau beban kerja divisi secara real-time.

Tahapan ini menghasilkan sistem yang lebih
aman dan efisien dengan integrasi keamanan digital yang komprehensif.

[1.7  Iterasi 3: Implementasi Sistem Kuotasi (Agustus – September 2025)]()

Iterasi ketiga dilakukan setelah memperoleh
feedback dari pengujian Iterasi 2, dimana berdasarkan action plan yang telah
disepakati, fokus pengembangan dialihkan pada pengembangan sistem kuotasi
dinamis untuk mengelola kapasitas booking harian yang mengalami peningkatan
signifikan setelah implementasi sistem yang lebih efisien.

[1.7.1   *Communication * (Komunikasi)]()

Tahap komunikasi ketiga dilakukan untuk
menggali kebutuhan pengembangan sistem kuotasi berdasarkan hasil evaluasi
Iterasi 2 yang menunjukkan peningkatan jumlah booking yang signifikan. Diskusi
dilakukan dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk menganalisis
beban kerja pegawai dan merancang sistem kuotasi yang realistis dan adil.

Diskusi dengan Kasubbid PSI menunjukkan
tingginya beban kerja pegawai mencapai rata-rata 100-200 booking per hari untuk
BPHTB, sementara kapasitas optimal hanya 80-100 booking karena keterbatasan
jumlah peneliti. Dampaknya adalah penurunan akurasi dan meningkatnya waktu
tunggu pengguna. Analisis mendalam menunjukkan bahwa dengan 600 PPAT di
Kabupaten Bogor dan struktur organisasi BAPPENDA yang terdiri dari 10-13 UPT
(Unit Pelaksana Teknis) dengan 5-7 peneliti per UPT plus kantor pusat BAPPENDA,
total kapasitas peneliti mencapai 85-115 orang. BAPPENDA mengelola 9 jenis
pajak (BPHTB, PBB, Perhotelan, Burung Walet, Hiburan, Reklame, Penerangan
Jalan, Parkir, dan Air Tanah), sehingga kapasitas peneliti harus dibagi untuk
semua jenis pajak tersebut.

Hasil komunikasi dari diskusi dengan
Kasubbid PSI menunjukkan bahwa diperlukan sistem kuotasi yang realistis dan
adil untuk mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna.
Sistem kuotasi yang direncanakan akan mengimplementasikan algoritma dinamis
untuk mengatur kapasitas booking harian berdasarkan jumlah peneliti aktif dan
beban kerja per UPT.

[1.7.2    *Quick Plan * (Perencanaan Cepat)]()

Selama tahap
perencanaan cepat untuk Iterasi 3, dilakukan penyusunan draft awal sistem
aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi
dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti
menyusun perencanaan pengembangan sistem kuotasi untuk mengelola kapasitas
booking harian. Proses perencanaan dilakukan melalui diskusi teknis dengan
Kasubbid PSI sebagai mentor dan validator dalam merancang algoritma kuotasi
yang realistis dan adil.

Output perencanaan yang dihasilkan adalah sebagai berikut:

a)      Modifikasi Database: Dirancang dua tabel baru
(daily_counter dan ppatk_send_queue) untuk mengelola kapasitas harian dan
antrean booking. Tabel daily_counter menyimpan informasi counter harian untuk
tracking jumlah booking yang telah diproses, sedangkan tabel ppatk_send_queue
menyimpan informasi antrean booking yang akan diproses pada hari berikutnya
jika kuota harian telah terpenuhi.

b)      Algoritma Kuotasi Dinamis: Sistem kuotasi
menggunakan algoritma dynamic quota dengan fitur-fitur sebagai berikut:

1. Kuota Harian Dinamis: Sistem akan
   menetapkan kuota harian sebesar 80 dokumen untuk BPHTB berdasarkan kapasitas
   optimal yang telah dianalisis dari struktur organisasi BAPPENDA. Kuota ini
   ditetapkan berdasarkan total kapasitas peneliti 85-115 orang untuk 9 jenis
   pajak, dimana untuk BPHTB dialokasikan kuota harian 80 dokumen.
2. Priority Queue: Sistem menggunakan
   priority queue untuk mengatur prioritas pemrosesan dokumen urgent dan mendesak
   berdasarkan jenis pajak.
3. Load Balancing: Sistem menggunakan load
   balancing untuk distribusi merata antar UPT dan peneliti per jenis pajak.
4. Predictive Scheduling: Sistem menggunakan
   predictive scheduling berdasarkan historis pemrosesan per UPT dan jenis pajak.
5. Notifikasi Multi-level: Sistem akan
   mengirimkan notifikasi multi-level saat kuota mencapai 70%, 85%, dan 95% per
   jenis pajak.
6. Distribusi UPT: Sistem menggunakan
   distribusi berbasis UPT dan jenis pajak untuk memastikan pelayanan merata di
   seluruh wilayah.

c)     Activity Diagram: Untuk memvisualisasikan
alur kerja sistem kuotasi, dibuat Activity Diagram Iterasi 3 yang menggambarkan
proses pengelolaan kuota harian dan antrean booking. Activity Diagram dapat
dilihat pada Gambar 14. Diagram ini menggambarkan alur dimulai dari reset daily
counter (0/80) di awal hari kerja, kemudian pengecekan counter terhadap kuota
harian, proses langsung untuk booking yang tidak melebihi kuota, dan antrean
untuk booking yang melebihi kuota.

[]()[Gambar ]()14
Activity Diagram Iterasi 3

[1.7.3    *Quick Design * (Desain Cepat)]()

Sementara itu, pada tahap pemodelan desain
cepat untuk Iterasi 3, aktivitas berfokus pada perancangan dashboard monitoring
dan implementasi algoritma kuotasi berdasarkan kebutuhan yang telah
direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti
dengan melakukan presentasi wireframe dashboard dan algoritma kuotasi kepada
Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan feedback dan
validasi terhadap sistem monitoring dan algoritma kuotasi. Kasubbid PSI
berperan sebagai validator yang melakukan review terhadap desain untuk
memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional
di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan
persetujuan final dari Kasubbid PSI. *Output* desain yang dihasilkan
adalah sebagai berikut:

a)
Dashboard Monitoring Real-time:
Desain antarmuka berupa dashboard monitoring real-time yang menampilkan beban
kerja pegawai, grafik kapasitas harian, dan sistem notifikasi multi-channel.
Dashboard ini dirancang untuk memberikan overview status kuota harian, antrean
booking, dan metrik kinerja sistem.

b)
Algoritma Kuotasi: Algoritma
kuotasi dirancang agar mampu menyesuaikan jumlah booking dengan kapasitas
pegawai dan urgensi dokumen. Algoritma kuotasi dirancang dengan pendekatan:

Dynamic Capacity Management:
Menyesuaikan kuota berdasarkan jumlah peneliti aktif per UPT dan jenis pajak.

Priority-based Scheduling:
Dokumen urgent mendapat prioritas tinggi berdasarkan jenis pajak dan
kompleksitas.

UPT-based Distribution:
Round-robin dengan bobot berdasarkan kapasitas dan kompleksitas dokumen per UPT
dan jenis pajak.

Predictive Analytics: Estimasi
waktu berdasarkan pola historis per wilayah UPT dan jenis pajak.

Geographic Load Balancing:
Distribusi berdasarkan lokasi PPAT dan kapasitas UPT terdekat per jenis pajak.

Multi-tax Allocation: Alokasi
kuota yang proporsional untuk 9 jenis pajak berdasarkan volume dan
kompleksitas.

[1.7.4   *Construction of Prototype* (Konstruksi
Prototipe)]()

Tahap ini merupakan proses penerjemahan
rancangan konseptual dari tahap modelling quick design menjadi kode program
yang dapat dijalankan untuk fitur sistem kuotasi. Implementasi dimulai dengan
pengembangan algoritma kuotasi yang meliputi pembuatan sistem counter harian
dan antrean booking. Proses pembangunan dilakukan secara bertahap dengan
prioritas pada modul kuotasi yang telah direncanakan pada tahap Quick Plan.

Pembangunan prototipe pada Iterasi 3
dilakukan secara bertahap oleh peneliti dengan pendekatan agile development.
Proses dimulai dengan pengembangan sistem kuotasi yang terintegrasi dengan
sistem booking eksisting. Algoritma kuotasi berbasis round-robin dikembangkan
untuk mengelola kuota harian 80 dokumen untuk BPHTB. Setiap fitur kuotasi
dikembangkan secara modular dan diuji menggunakan unit testing sebelum
diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem
dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai
mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan
kesesuaian dengan alur bisnis yang telah dirancang. Dashboard monitoring
dirancang untuk menampilkan metrik kinerja seperti waktu rata-rata pemrosesan
dan kapasitas per divisi. Fitur yang dikembangkan pada iterasi ketiga adalah
sebagai berikut:

a)
 Sistem Counter Harian: Sistem counter harian
dirancang untuk menghitung jumlah booking yang telah diproses dalam satu hari
kerja. Counter akan direset ke 0 setiap awal hari kerja dan akan bertambah
setiap ada booking yang masuk, dengan batas maksimal 80 booking per hari untuk
BPHTB.

b)
Antrean Booking: Sistem antrean
booking dirancang untuk mengelola booking yang melebihi kuota harian 80
dokumen. Booking yang melebihi kuota akan masuk ke dalam antrean dan akan
diproses pada hari berikutnya sesuai dengan prioritas dan urutan masuk.

c)
Dashboard Monitoring: Dashboard
monitoring dirancang untuk menampilkan metrik kinerja seperti waktu rata-rata
pemrosesan, kapasitas per divisi, dan status kuota harian. Dashboard ini akan
memberikan notifikasi multi-level saat kuota mencapai 70%, 85%, dan 95%.

d)
Sistem Notifikasi: Sistem
notifikasi dirancang untuk mengirimkan peringatan otomatis kepada admin dan
PPAT ketika kuota harian hampir terpenuhi atau ketika booking masuk ke dalam
antrean.

e)
Swimlane Diagram: Untuk
menggambarkan alur kerja sistem kuotasi yang melibatkan berbagai aktor, dibuat
Swimlane Diagram Iterasi 3 yang menggambarkan pembagian tanggung jawab dan alur
kerja antar divisi dalam proses pengelolaan kuota harian. Swimlane Diagram
dapat dilihat pada Gambar 12. Diagram ini terbagi menjadi 5 lane utama yaitu
PPAT/PPATS (kirim berkas), LTB (terima berkas dan cek daily counter), Peneliti
(proses berkas langsung dan counter +1), Admin (masuk antrean dan monitor
quota), dan System (auto reset counter). Proses dimulai dari PPAT/PPATS yang
mengirim berkas, kemudian LTB melakukan pengecekan counter harian. Jika counter
kurang dari 80, berkas diproses langsung oleh Peneliti dan counter bertambah.
Jika counter sudah mencapai 80 atau lebih, berkas masuk ke dalam antrean yang
dikelola oleh Admin. System bertanggung jawab untuk auto reset counter di awal
hari kerja dan melakukan monitoring sepanjang jam kerja (hingga 16:10). Diagram
ini menunjukkan bagaimana sistem kuotasi mengintegrasikan alur kerja antar
divisi untuk mengelola kapasitas booking harian secara efisien.

Gambar 15
Swimlane Diagram Iterasi 3

f)
Use Case Diagram: Untuk
menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang
tersedia pada sistem kuotasi, dibuat Use Case Diagram Iterasi 3 yang
menunjukkan 5 aktor utama (PPAT/PPATS, LTB, Peneliti, Admin, dan System) yang
berinteraksi dengan berbagai use case. Use Case Diagram dapat dilihat pada
Gambar 13. Use case yang tersedia meliputi kirim berkas, monitor quota,
dashboard analytics, cek daily counter, view queue status, queue management,
proses berkas langsung, break reminder, stress prevention, masuk antrean, auto
reset counter, workload distribution, schedule next day, dan generate reports.
Diagram ini menunjukkan bahwa sistem kuotasi dirancang untuk mengoptimalkan
pengelolaan kuota harian dengan melibatkan berbagai aktor secara sinergis,
dimana PPAT/PPATS dapat melakukan monitoring quota, LTB dan Admin dapat
mengelola antrean, Peneliti dapat memproses berkas langsung dengan sistem break
reminder untuk mencegah kelelahan, dan System melakukan auto reset counter
serta generate reports secara otomatis.

[]()[Gambar ]()16
Usecase Diagram Iterasi 3

[1.7.5   *Delivery and Feedback* (Penyerahan dan Umpan
Balik)]()

Pada tahap  *Deployment,
Delivery * &* Feedback* untuk Iterasi 3, dilakukan hybrid testing
(black box dan white box) untuk memastikan sistem kuotasi yang telah
dikembangkan siap rilis dan berfungsi dengan baik sebelum go live. White box
testing dilakukan untuk validasi algoritma dan logic flow dari sistem kuotasi,
sedangkan black box testing dilakukan untuk validasi fungsionalitas end-to-end
dari perspektif pengguna. Dalam penelitian ini, pengujian dilakukan dengan
melibatkan 5 pegawai dari bidang PSI yang berperan sebagai admin, LTB,
peneliti, peneliti Validasi (Pejabat), dan LSB untuk menguji sistem dari
perspektif pengguna  *end-to-end* .

Mekanisme pengujian
yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem
staging dan diminta untuk menguji semua fitur sistem kuotasi sesuai dengan
skenario kasus nyata. Pengujian dilakukan untuk memastikan bahwa sistem dapat mengelola
kuota harian 80 dokumen dengan baik, booking yang melebihi kuota masuk ke dalam
antrean dengan benar, dan dashboard monitoring menampilkan informasi yang
akurat. Mekanisme pengumpulan feedback dilakukan melalui diskusi langsung
dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari
berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode
pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum
feedback dan menentukan keputusan untuk go live.

Hasil evaluasi dari
pengujian Iterasi 3 menunjukkan bahwa sistem kuotasi yang telah dikembangkan
dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di
BAPPENDA. Sistem telah terintegrasi dengan baik dengan sistem *booking
eksisting* dan siap untuk evaluasi performa dan  *user acceptance testing* .
Berdasarkan hasil evaluasi tersebut, keputusan untuk *go live* adalah
sistem dinyatakan siap untuk *go live* setelah seluruh *testing* dan *feedback*
terakomodasi dengan baik, dimana Kasubbid PSI telah meminta pembuatan website
domain dengan nama `bphtb.bogorkab.go.id` sebagai *website* yang akan
digunakan nantinya untuk akses sistem  *booking online E-BPHTB* .

**Rencana sosialisasi
sistem** akan dilakukan secara menyeluruh kepada 600 PPAT/PPATS di Kabupaten
Bogor untuk mengajarkan cara penggunaan sistem booking online yang baru dengan
fokus pada pemrosesan alur kerja sistem kuotasi. Sosialisasi direncanakan dilakukan
melalui beberapa tahap yaitu: (1) pembuatan panduan penggunaan sistem yang
komprehensif, (2) presentasi sistem kepada PPAT/PPATS dalam sesi kelompok, (3)
demonstrasi live sistem untuk menunjukkan alur kerja booking online dan sistem
kuotasi, dan (4) sesi tanya jawab untuk menjawab pertanyaan dan kekhawatiran
PPAT/PPATS terkait sistem baru. Sosialisasi akan dilakukan dengan koordinasi
Kasubbid PSI untuk memastikan seluruh PPAT/PPATS memahami cara kerja sistem dan
dapat mengoperasikan sistem dengan baik sebelum go live. Tahap sosialisasi ini
direncanakan untuk dilakukan setelah iterasi ketiga selesai dan penting untuk
memastikan successful adoption sistem oleh seluruh pengguna.

Tahapan ini
menghasilkan sistem kuotasi yang realistis dan adil, mampu mengelola permintaan
tinggi tanpa menurunkan kepercayaan pengguna. Dengan sistem kuotasi ini, beban
kerja pegawai dapat dikelola dengan lebih baik dan peningkatan jumlah booking
yang signifikan setelah implementasi sistem yang lebih efisien dapat ditangani
dengan efektif.

[1.8  Analisis Hasil Keseluruhan]()

Setelah tiga iterasi, sistem *booking
online E-BPHTB* menunjukkan peningkatan signifikan:

| **Aspek**     | **Sebelum** | **Setelah** |
| ------------------- | ----------------- | ----------------- |
| Waktu proses berkas | ±30-40 menit     | 10–25 menit      |
| Validasi dokumen    | 10 menit          | 2 menit           |
| Akurasi*QR code*  | –                | 99,8%             |
| Kepuasan pegawai    | 60%               | 85%               |
| Kepuasan PPAT       | 65%               | 88%               |
| Uptime sistem       | –                | 99,7%             |

Metode *prototyping* dengan tiga
iterasi terbukti efektif untuk menghasilkan sistem yang adaptif terhadap
kebutuhan pengguna, efisien, dan sesuai standar keamanan data pemerintah
daerah.

[Tabel ]()1Kebutuhan Fungsional

| **No**                                                                | **Fitur**              | **Deskripsi Singkat**                   | **Aktor/Pengguna** | **Status** |
| --------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------- | ------------------------ | ---------------- |
| 1                                                                           | *Login*                    | Setiap pengguna wajib login menggunakan akun  |                          |                  |
| terdaftar untuk mengakses sistem.                                           | Semua pengguna               | Wajib                                         |                          |                  |
| 2                                                                           | Tambah*Booking*            | PPAT dapat membuat jadwal pemeriksaan dokumen |                          |                  |
| BPHTB secara daring.                                                        | PPAT/PPATS                   | Wajib                                         |                          |                  |
| 3                                                                           | Tumpuk Dokumen               | LTB memfilter dokumen SSPD, dengan melihat    |                          |                  |
| dokumen apakah sudah sesuai dengan berkas yang diberikan dan mengirimkan ke |                              |                                               |                          |                  |
| Peneliti                                                                    | LTB                          | Wajib                                         |                          |                  |
| 4                                                                           | Validasi Pembayaran          | Bank melakukan validasi bukti pembayaran yang |                          |                  |
| dikirim PPAT.                                                               | Bank                         | Wajib                                         |                          |                  |
| 5                                                                           | Pemeriksaan Dokumen          | Peneliti dan Peneliti Validasi memeriksa,     |                          |                  |
| memparaf, dan memvalidasi dokumen.                                          | Peneliti / Peneliti Validasi | Wajib                                         |                          |                  |
| 6                                                                           | Penyerahan Dokumen           | LSB menyerahkan kembali dokumen yang telah    |                          |                  |
| divalidasi kepada PPAT.                                                     | LSB                          | Wajib                                         |                          |                  |

Berdasarkan
hasil analisis kebutuhan, sistem *Booking online* *E-BPHTB* memiliki enam
fitur utama yang melibatkan tujuh aktor, yaitu Admin, PPAT/PPATS, LTB (Loket
Terima Berkas), Peneliti, Peneliti Validasi, LSB (Loket Serah Berkas), dan
Bank.

[Tabel ]()2  Relasi *Database*

| **No**                            | **Nama Tabel**       | **Tabel Terkait**                                                                                                            | **Jenis Relasi** | **Deskripsi Hubungan**                                        |
| --------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------- |
| 1                                       | A_1_*unverified_users*   | a_2_*verified_users*                                                                                                             | *One-to-One*         | Data pengguna dipindahkan ke tabel verified saat akun diverifikasi. |
| 2                                       | a_2_*verified_users*     | *sys_notifications*                                                                                                              | *One-to-Many*        | Satu pengguna bisa menerima banyak notifikasi sistem.               |
| 3                                       | pat_1_*booking*sspd      | pat_2_bphtb_perhitungan, pat_4_objek _pajak, pat_5_peng hitunga_njop, pat_6 _sign, pat_7_valid asi_surat, pat_8_va lidasi_tambahan | *One-to-Many*        | Tabel utama menyimpan data inti*booking*dan terhubung ke data     |
| perhitungan, objek pajak, dan validasi. |                            |                                                                                                                                    |                        |                                                                     |
| 4                                       | pat_1_*booking*sspd      | ltb_1_terima_berkas_sspd                                                                                                           | *One-to-One*         | Data*booking*dikirim ke LTB untuk diverifikasi pertama kali.      |
| 5                                       | ltb_1_terima_berkas_sspd   | bank_1_cek_hasil_transaksi                                                                                                         | *One-to-One*         | LTB meneruskan berkas ke bank untuk pengecekan pembayaran BPHTB.    |
| 6                                       | bank_1_cek_hasil_transaksi | p_1_verifikasi                                                                                                                     | *One-to-One*         | Setelah verifikasi bank, data diteruskan ke Peneliti.               |
| 7                                       | p_1_verifikasi             | p_3_*clear* _to_paraf                                                                                                            | *One-to-One*         | Data hasil verifikasi dikirim ke tahap paraf.                       |
| 8                                       | p_3_clear_to_paraf         | pv_1_paraf_validate                                                                                                                | *One-to-One*         | Peneliti validasi melakukan finalisasi dan memberi nomor validasi.  |
| 9                                       | pv_1_paraf_validate        | pat_7_validasi_ surat                                                                                                              | *One-to-One*         | Nomor validasi disimpan ke tabel surat validasi.                    |
| 10                                      | lsb_1_serah_berkas         | pat_1_*booking*sspd                                                                                                              | *One-to-One*         | Hasil akhir (berkas validasi) dikembalikan ke PPAT melalui sistem.  |

[1.8.1   *Prototype Construction*]()

Tahap ini merupakan
proses pembuatan sistem fungsional awal berdasarkan hasil desain. Implementasi
dilakukan menggunakan:

·
 *Frontend* : Vite.js, HTML, CSS, JavaScript;

·
 *Backend* : Node.js dan Express.js;

·
 *Database* : PostgreSQL dengan struktur relasi yang
mencakup table *pat_1_ * *bookingsspd* ,  *ltb_1_terima_berkas_sspd* ,  *bank_1_cek_hasil_transaksi* ,
dan tabel turunan lain yang saling berelasi melalui  *foreign key* .

Setiap versi prototipe
diuji untuk memastikan kestabilan sistem, integrasi data antar modul, dan
ketepatan alur kerja antar aktor seperti PPAT, LTB, Bank, Peneliti, dan LSB.

[1.8.2   *Delivery and Feedback*]()

Tahap
terakhir dilakukan untuk mengevaluasi sistem melalui pengujian langsung dengan
pengguna (admin dan pegawai BAPPENDA). Uji coba dilakukan sebanyak  **tiga kali
iterasi** , dengan rincian sebagai berikut:

**Iterasi
1:** Pengujian dasar terhadap
fungsi input data dan penyimpanan ke *d* *atabase* .

**Iterasi
2:** Penambahan fitur validasi
jadwal dan pengelolaan data oleh admin.

**Iterasi
3:** Penyempurnaan antarmuka
(UI/UX) serta optimasi performa sistem.

Setiap
siklus iterasi mengikuti pola *Design → Evaluate → Refine* sesuai panduan
Pressman dan Maxim (2019), hingga sistem mencapai kestabilan dan memenuhi kebutuhan
pengguna secara fungsional.

[1.8.3   Analisis Hasil]()

Berdasarkan hasil dari
ketiga iterasi, sistem yang dihasilkan telah memenuhi kebutuhan utama:

Pengguna
dapat melakukan pemesanan jadwal pelayanan secara daring.

Admin
dapat memvalidasi dan mengatur kapasitas harian kunjungan.

Sistem
mampu mencatat, memverifikasi, dan menampilkan riwayat *booking* secara
otomatis.

Hasil tersebut
menunjukkan bahwa penerapan metode *prototyping* berhasil menghasilkan
sistem yang adaptif terhadap kebutuhan operasional BAPPENDA Kabupaten Bogor,
sekaligus mendukung proses digitalisasi pelayanan publik.

[1.8.4   Analisis Iterasi *Prototyping*]()

Metode
*prototyping* dalam penelitian ini dilaksanakan melalui tiga kali siklus
iterasi, yang masing-masing memiliki tujuan dan keluaran berbeda. Pendekatan
ini bertujuan untuk memastikan bahwa setiap pengembangan sistem sesuai dengan
kebutuhan pengguna berdasarkan umpan balik yang diperoleh dari tahap pengujian.
