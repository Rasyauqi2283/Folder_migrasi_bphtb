# 📝 TEKS SIAP PAKAI UNTUK PEMINDAHAN ITERASI

## 🎯 BAGIAN 1: TEKS UNTUK BAB III - METODE (1.4 Prosedur Kerja)

### **Ganti bagian 1.5, 1.6, 1.7 dengan teks berikut:**

---

**1.4 Prosedur Kerja**

Penelitian menggunakan pendekatan pengembangan berbasis metode *prototyping*. Metode ini dipilih karena bersifat iteratif dan fleksibel, memungkinkan pengguna memberikan umpan balik langsung pada setiap tahap pengembangan sistem. Menurut Siswidiyanto et al. (2021), prototyping efektif diterapkan dalam pengembangan perangkat lunak yang menitikberatkan pada antarmuka pengguna dan interaksi langsung dengan sistem. Dalam konteks magang di BAPPENDA, metode ini memungkinkan peneliti mengumpulkan masukan secara langsung dari pengguna untuk menyesuaikan fitur sistem dengan ekspektasi dan kebutuhan aktual.

Metode prototyping merupakan pendekatan pengembangan perangkat lunak yang menekankan pembuatan model awal sistem untuk memperoleh umpan balik langsung dari pengguna. Siswidiyanto et al. (2021) menjelaskan bahwa prototyping membantu pengembang memahami kebutuhan secara lebih akurat melalui proses iteratif, di mana rancangan diuji, dievaluasi, dan disempurnakan secara berkala. Menurut Dewi dan Prasetyo (2023), metode ini meningkatkan komunikasi antara pengembang dan pengguna melalui visualisasi sistem yang lebih konkret, sehingga risiko miskomunikasi dapat dikurangi. Terdapat dua jenis prototyping yang umum digunakan, yaitu throwaway prototyping yang digunakan untuk eksplorasi awal, dan evolutionary prototyping yang dikembangkan secara bertahap hingga mencapai sistem akhir.

[Gambar 1: Proses Tahapan Metode Prototype]

Tahapan metode *prototyping* dalam penelitian ini adalah sebagai berikut:

1. **Communication** – Pengumpulan kebutuhan melalui diskusi dengan stakeholder dan observasi lapangan.
2. **Quick Plan** – Perencanaan cepat untuk menetapkan lingkup, prioritas fungsionalitas, dan jadwal pengembangan.
3. **Quick Design** – Pembuatan desain awal (wireframe) dan diagram UML menggunakan Figma dan Draw.io.
4. **Prototype Construction** – Pembangunan prototipe fungsional menggunakan Node.js, Express.js, dan PostgreSQL.
5. **Delivery and Feedback** – Pengujian prototipe dan perbaikan berdasarkan umpan balik dari pengguna.

Pengembangan sistem dilakukan melalui tiga iterasi yang berkelanjutan, dimana setiap iterasi mengikuti tahapan prototyping di atas. Iterasi pertama (November 2024 – Januari 2025) difokuskan pada pembuatan fitur booking online dasar dengan tracking status real-time. Iterasi kedua (Maret – Agustus 2025) difokuskan pada optimasi dan efisiensi sistem melalui implementasi tanda tangan digital reusable, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi. Iterasi ketiga (Agustus – September 2025) difokuskan pada implementasi sistem kuotasi dinamis untuk mengelola kapasitas booking harian. Setiap iterasi menghasilkan feedback yang digunakan untuk perbaikan pada iterasi berikutnya, sehingga sistem yang dihasilkan sesuai dengan kebutuhan operasional di BAPPENDA Kabupaten Bogor.

Detail proses pengembangan, hasil, dan pembahasan dari setiap iterasi akan dijelaskan secara lengkap pada Bab IV: Hasil dan Pembahasan.

---

## 🎯 BAGIAN 2: TEKS UNTUK BAB IV - HASIL DAN PEMBAHASAN

### **Tambahkan sebelum "Tabel 1 Struktur Database Iterasi 1" di 4.1.1:**

---

**4.1.1.1 Proses Pengembangan Iterasi 1**

Iterasi pertama dilakukan dari November 2024 hingga Januari 2025 dengan fokus pada pembuatan fitur booking online dasar dengan tracking status real-time. Proses pengembangan mengikuti tahapan metode prototyping sebagai berikut:

**a) Communication (Komunikasi)**

Tahap komunikasi merupakan tahap yang krusial karena melibatkan diskusi menyeluruh dengan *stakeholder* untuk menggali kebutuhan dan tantangan spesifik dalam proses pelayanan BPHTB. Tahapan ini membantu dalam mengidentifikasi perumusan kebutuhan menjadi lebih jelas dan penting untuk kelanjutan proyek agar perancangan dapat sesuai dengan kebutuhan pengguna (Ekasari et al. 2024). Dalam penelitian ini, komunikasi dilakukan melalui wawancara dan observasi.

Wawancara adalah prosedur yang bertujuan untuk memperoleh informasi dari seseorang melalui jawaban lisan atas pertanyaan lisan (Setiawan et al. 2025). Teknik ini dilakukan secara langsung dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) pada November 2024 dengan pendekatan semi-terstruktur untuk memahami alur kerja sistem yang berjalan dan mengidentifikasi kebutuhan fungsional fitur *booking online*. Observasi dilakukan secara non-partisipatif selama masa magang dengan mengamati langsung proses pengelolaan pelayanan BPHTB, khususnya pada bagian penjadwalan pemeriksaan berkas wajib pajak. Menurut Hendrawan (2020), observasi langsung memberikan pemahaman mendalam terhadap alur kerja dan memungkinkan peneliti mengidentifikasi titik-titik inefisiensi yang dapat diotomatisasi melalui sistem digital.

Dari hasil wawancara dan observasi, teridentifikasi bahwa sistem BPHTB saat ini hanya berupa website yang dapat diakses secara publik, namun alur bisnis internal seperti proses booking jadwal pemeriksaan, penandatanganan dokumen, dan koordinasi antar divisi masih dilakukan secara manual menggunakan berkas fisik. Proses penanganan dokumen memerlukan tanda tangan manual di atas kertas dan pengiriman fisik antar divisi. Dalam kondisi normal, proses dapat diselesaikan dalam 30-40 menit per berkas, namun pada kondisi kompleks atau saat terjadi penumpukan, proses dapat memakan waktu hingga 2 jam karena harus menunggu antrean di setiap divisi dengan tingkat kesalahan sekitar 10%. Keluhan utama yang diidentifikasi meliputi: (1) proses penandatanganan dokumen secara fisik yang memerlukan waktu perpindahan berkas, (2) sulitnya tracking status dokumen secara real-time, (3) koordinasi antar divisi yang memakan waktu karena harus mengantarkan berkas fisik, dan (4) tidak adanya sistem validasi digital untuk memastikan keamanan dokumen. Hasil identifikasi ini menjadi dasar pengembangan fitur *booking online* yang mengubah proses manual menjadi sistem digital yang dapat dilakukan secara daring dari awal hingga akhir proses. Hasil wawancara dengan Kasubbid PSI dapat dilihat pada Tabel X berikut ini.

[Tabel X: Hasil Wawancara - pindahkan dari BAB III 1.5.1]

**b) Quick Plan (Perencanaan Cepat)**

Selama tahap perencanaan cepat, fokus utama adalah menyusun draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi sebelumnya dengan stakeholder (Ekasari et al. 2024). Berdasarkan hasil wawancara dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem *booking online* tahap awal dengan fokus pada pembuatan fitur booking online dasar dengan tracking status. Proses perencanaan dilakukan melalui diskusi teknis berulang dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) sebagai mentor dan validator dalam merancang alur sistem. Diskusi meliputi identifikasi requirement fungsional, validasi alur bisnis yang akan diimplementasikan berdasarkan kondisi operasional di BAPPENDA, serta kesepakatan mengenai scope pengembangan pada iterasi pertama.

Output perencanaan yang dihasilkan adalah sebagai berikut:

a) Fokus Iterasi Pertama: Berdasarkan masukan dari Kasubbid PSI, iterasi pertama difokuskan pada sistem booking online dasar dengan tracking status real-time. Fitur-fitur yang direncanakan meliputi: (1) sistem pemesanan jadwal pemeriksaan secara daring, (2) dashboard tracking untuk memantau status dokumen secara real-time, (3) integrasi modul antar divisi (PPAT/PPATS, LTB, Peneliti, dan LSB), dan (4) sistem notifikasi untuk update status dokumen.

Sebelum menjelaskan diagram UML yang akan dibuat, terlebih dahulu perlu dijelaskan simbol-simbol yang digunakan untuk memudahkan pemahaman pembaca. Simbol-simbol yang digunakan dalam diagram penelitian ini dapat dilihat pada Tabel X sebagai berikut.

[Tabel X: Simbol-simbol Diagram - pindahkan dari BAB III 1.5.2]

b) *Activity Diagram* Iterasi 1: Untuk memvisualisasikan perencanaan alur kerja yang akan dikerjakan, dibuat *Activity Diagram* Iterasi 1 yang menunjukkan proses transformasi dari sistem manual menjadi digital. Diagram ini menggambarkan alur dari pengajuan booking hingga penyelesaian dokumen, dan menjadi panduan teknis dalam pengembangan sistem. *Activity Diagram* dapat dilihat pada Gambar X.

[Gambar X: Activity Diagram Iterasi 1 - pindahkan dari BAB III 1.5.2]

*Activity Diagram* ini menggambarkan transformasi alur kerja manual menjadi sistem digital yang terintegrasi untuk pengelolaan Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB). Proses dimulai ketika Pejabat Pembuat Akta Tanah (PPAT) atau Pejabat Pembuat Akta Tanah Sementara (PPATS) melakukan pengajuan *booking* melalui sistem *online*, yang kemudian diteruskan ke Loket Terima Berkas (LTB) untuk verifikasi kelengkapan dokumen, di mana data seperti identitas dan surat perjanjian diperiksa secara digital guna memastikan kepatuhan awal. Setelah verifikasi selesai, dokumen masuk ke tahap pemeriksaan oleh Peneliti untuk memastikan keakuratan data dan kelengkapan persyaratan.

Proses selanjutnya melibatkan Bank dalam penanganan pembayaran BPHTB, yang terintegrasi langsung dengan sistem untuk memastikan sinkronisasi data keuangan. Tahap akhir adalah serah terima dokumen oleh Loket Serah Berkas (LSB) kepada PPAT/PPATS yang telah menyelesaikan seluruh proses. Seluruh alur kerja ini dapat dipantau secara *real-time* oleh semua pihak terkait, memberikan transparansi dan efisiensi yang signifikan dibandingkan dengan sistem manual sebelumnya. Dengan demikian, diagram ini menekankan bagaimana integrasi teknologi mendukung modernisasi pelayanan publik dan meningkatkan kepuasan pengguna.

c) Struktur Database: Berdasarkan analisis kebutuhan sistem, dirancang struktur database yang mencakup 13 tabel utama, antara lain: pat_1_booking_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf, pv_1_paraf_validate, dan lsb_1_serah_berkas. Setiap tabel dirancang untuk menyimpan data spesifik dari setiap tahapan proses, dimana relasi antar tabel dirancang untuk memastikan integritas data dan memfasilitasi tracking real-time status dokumen.

d) Alur Kerja Sistem: Alur kerja sistem mengikuti tahapan yang terstruktur sesuai dengan *Activity Diagram* yang telah direncanakan. Proses dimulai dari pengajuan *booking* oleh PPAT/PPATS melalui sistem online, kemudian verifikasi kelengkapan dokumen oleh LTB, dilanjutkan dengan pemeriksaan oleh Peneliti, dan tahap akhir adalah proses serah berkas di LSB. Setiap tahapan direkam dalam database sehingga status dokumen dapat dilacak secara real-time melalui dashboard tracking.

**c) Quick Design (Desain Cepat)**

Pada tahap pemodelan desain cepat, aktivitas berfokus merepresentasikan tampilan dan struktur aplikasi secara visual, seperti perancangan sketsa antarmuka aplikasi, pembuatan *wireframe* dan *mock-up*, serta pembuatan *Activity Diagram*, *Use Case Diagram*, dan *Entity Relationship Diagram* secara lebih detail untuk mendeskripsikan alur sistem dan struktur basis data yang akan digunakan sebagai dasar pembangunan prototipe (Allacsta dan Hadiwandra 2024). Proses desain dilakukan oleh peneliti dengan pendekatan *user-centric design*, dimana setiap *wireframe* ditampilkan kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan *feedback* dan validasi kelayakan alur sistem. Kasubbid PSI berperan sebagai validator yang memahami kebutuhan semua divisi karena posisinya sebagai pemegang alur pemrosesan dan integrasi design alur di BAPPENDA. Iterasi desain dilakukan sebanyak 3 kali sampai mendapatkan persetujuan final dari Kasubbid PSI. Output desain yang dihasilkan adalah sebagai berikut:

*a) Wireframe*: Desain awal sistem dibuat menggunakan *Figma* dengan rancangan *wireframe* untuk tiap divisi (PPAT/PPATS, LTB, Bank, Peneliti, dan LSB). *Wireframe* dirancang untuk mengilustrasikan *layout* dan navigasi dasar dari setiap halaman pada sistem *booking online*. Setelah *wireframe* disetujui Kasubbid PSI, implementasi *visual interface* langsung dikembangkan menggunakan *HTML*, *CSS*, dan *JavaScript* dalam tahap konstruksi prototipe untuk meningkatkan efisiensi proses pengembangan.

[Gambar X: Wireframe - pindahkan dari BAB III 1.5.3]

*b) Diagram Proses Bisnis*: Diagram proses bisnis dirancang untuk mengilustrasikan pembagian tanggung jawab dan alur kerja antar divisi dalam proses booking online E-BPHTB. Diagram proses bisnis dapat dilihat pada Gambar X. Diagram ini menggambarkan proses bisnis yang terbagi menjadi enam divisi utama yaitu PPAT (pengajuan dan upload), LTB (verifikasi berkas), Peneliti/Paraf (pemeriksaan data persetujuan digital), Peneliti Validasi (validasi akhir), dan LSB (serah terima) yang dimana setiap divisi menggambarkan urutan kegiatan yang dilakukan oleh masing-masing aktor secara berkesinambungan, mulai dari pendaftaran hingga dokumen dinyatakan sah dan diterima. Diagram ini didukung oleh 13 tabel database yang berfungsi untuk menyimpan dan mengelola data transaksi secara sistematis, dengan estimasi waktu pemrosesan 10-25 menit per dokumen. Diagram proses bisnis ini memiliki relevansi penting dalam tahapan prototyping iterasi pertama, karena mampu meningkatkan efisiensi proses bisnis, mengurangi kemungkinan terjadinya overlapping antar divisi, serta memfasilitasi pengembangan sistem yang berorientasi pada kebutuhan pengguna (user-centric design).

[Gambar X: Diagram Proses Bisnis Iterasi 1 - pindahkan dari BAB III 1.5.3]

*c) Use Case Diagram*: Use case diagram dibuat untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia. Use Case Diagram dapat dilihat pada Gambar X. Diagram ini menunjukkan 7 aktor utama (PPAT/PPATS, LTB, Bank, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB, dan Admin) yang berinteraksi dengan 24 use case yang mencakup booking, verifikasi, dan penyelesaian dokumen atau seluruh proses booking online. Menggunakan simbol UML standar dan warna untuk aktor, diagram ini relevan dalam prototyping untuk efisiensi dan validasi di BAPPENDA. Use Case Diagram ini tidak hanya memberikan gambaran umum mengenai fungsionalitas sistem, tetapi juga menjadi acuan awal dalam proses pengembangan perangkat lunak. Melalui diagram tersebut, pengembang dapat memahami kebutuhan pengguna dengan lebih jelas serta memastikan bahwa setiap fungsi yang dirancang mampu mendukung tujuan utama sistem secara keseluruhan.

[Gambar X: Usecase Diagram Iterasi 1 - pindahkan dari BAB III 1.5.3]

d. Struktur Database Relasional: Struktur database relasional dirancang menggunakan *draw.io*, yang mendukung sistem penomoran otomatis (no_booking_, no_registrasi) dan keterhubungan antar tabel. Database dirancang untuk mendukung semua fungsi yang telah direncanakan dalam Activity Diagram dan Use Case Diagram, dimana setiap tabel memiliki relasi yang jelas dengan tabel lainnya untuk memastikan integritas data dan memfasilitasi tracking real-time status dokumen.

[Gambar X: Struktur Database - pindahkan dari BAB III 1.5.3]

**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap *modelling quick design* menjadi kode program yang dapat dijalankan. Implementasi dimulai dengan pembuatan *models* untuk merepresentasikan struktur dan relasi basis data, dilanjutkan dengan *controller* yang mengatur logika bisnis dan pengolahan data, serta *view* sebagai antarmuka pengguna untuk menampilkan data dan interaksi secara visual. Ketiga komponen ini terintegrasi membentuk aplikasi yang utuh dan dapat digunakan sesuai tujuan perancangan awal.

Pembangunan prototipe awal dilakukan secara bertahap oleh peneliti dengan pendekatan *agile development*. Proses dimulai dengan *setup environment* menggunakan *Node.js* dan *Express.js* sebagai *backend*, serta *HTML*, *CSS*, dan *JavaScript (Vite.js)* sebagai *frontend*. *Database PostgreSQL* dikonfigurasi terlebih dahulu untuk menyimpan struktur data sesuai dengan *ERD* yang telah dirancang pada tahap *Quick Design*. Setiap fitur dikembangkan secara modular dengan struktur MVC (*Model-View-Controller*) dan diuji menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang sesuai kondisi operasional di BAPPENDA. Fitur yang dikembangkan pada iterasi pertama adalah sebagai berikut:

*a) Formulir Booking Online*: Formulir booking online dirancang untuk memungkinkan PPAT/PPATS melakukan pemesanan jadwal pemeriksaan secara daring dari mana saja. Formulir ini dilengkapi dengan validasi input untuk memastikan data yang dimasukkan sesuai dengan format yang diharapkan, seperti format nomor identitas, format tanggal, dan validasi kelengkapan data.

*b) Unggah Dokumen*: Sistem unggah dokumen memungkinkan pengguna untuk mengunggah dokumen pendukung seperti akta tanah, sertifikat, dan dokumen pelengkap lainnya. Dokumen yang diunggah disimpan dalam database dan dapat diakses oleh divisi terkait sesuai dengan tahapan proses.

*c) Dashboard Admin dan Tracking Real-time*: Dashboard admin dirancang untuk memberikan overview status semua dokumen yang sedang diproses. Dashboard ini menampilkan status tracking secara real-time, dimana setiap divisi dapat melihat status dokumen pada tahap tertentu dan melakukan update status sesuai dengan tahapan proses yang telah ditentukan.

*d) Sistem Login Multi-divisi*: Sistem login multi-divisi dirancang dengan berbasis hak akses (role-based access control) untuk memastikan bahwa setiap divisi hanya dapat mengakses fitur yang sesuai dengan perannya. Setiap pengguna memiliki credential yang berbeda dan hanya dapat melihat dan mengedit data yang sesuai dengan hak aksesnya.

Tahapan ini menghasilkan prototipe fungsional yang mencerminkan proses bisnis BAPPENDA secara digital, dimana sistem booking online dapat digunakan untuk mengurangi antrean dan mempercepat proses pemrosesan dokumen BPHTB.

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap *Deployment, Delivery* & *Feedback* dilakukan *black box testing* untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna. Pengujian ini dilakukan dari sudut pandang pengguna tanpa mengetahui struktur internal program, sehingga membantu menemukan dan memperbaiki bug yang dapat mengganggu pengalaman pengguna, agar rilis optimal serta memperoleh umpan balik konstruktif (Salim & Rusdiansyah 2024). Dalam penelitian ini, uji coba dilakukan selama dua minggu dengan koordinasi dari Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang memfasilitasi akses ke sistem *staging* bagi berbagai divisi di BAPPENDA.

Mekanisme pengujian yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur sesuai dengan skenario kasus nyata sesuai dengan alur kerja BPHTB di BAPPENDA. Pengujian dilakukan secara bertahap, dimana pada minggu pertama fokus pada pengujian fitur booking online dan tracking status, sedangkan pada minggu kedua dilakukan pengujian integrasi antar modul dan pengujian di kondisi beban normal. Mekanisme pengumpulan feedback dilakukan melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum feedback dan menentukan action plan untuk iterasi berikutnya.

Hasil evaluasi dari pengujian Iterasi 1 menunjukkan bahwa sistem booking online yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil evaluasi menunjukkan alur kerja menjadi lebih transparan dan efisien dibandingkan sistem manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, antara lain: (1) waktu unggah tanda tangan yang masih relatif lama karena pengguna harus mengunggah tanda tangan untuk setiap dokumen, (2) belum tersedianya sertifikat digital maupun *QR code* untuk validasi keaslian dokumen, dan (3) proses pengiriman antar divisi masih memerlukan beberapa langkah manual. Berdasarkan hasil evaluasi tersebut, *action plan* untuk Iterasi 2 mencakup: (1) penerapan tanda tangan digital berulang (*reusable signature*) agar pengguna hanya perlu mengunggah tanda tangan sekali dan dapat digunakan untuk beberapa dokumen, (2) integrasi sertifikat digital untuk memastikan keamanan dan keaslian dokumen, (3) implementasi *QR code* untuk validasi dokumen, dan (4) otomatisasi pengiriman antar divisi untuk mengurangi langkah manual yang masih diperlukan.

---

**Lanjutkan dengan struktur yang sudah ada:**

- Tabel 1 Struktur Database Iterasi 1
- Tabel 2 Hasil Pengujian Iterasi 1
- Tabel 3 Perbandingan Metrik Sistem
- dll.

---

### **Tambahkan sebelum "Tabel 4 Struktur Database Tambahan Iterasi 2" di 4.1.2:**

---

**4.1.2.1 Proses Pengembangan Iterasi 2**

Iterasi kedua dilakukan dari Maret hingga Agustus 2025 setelah memperoleh feedback dari pengujian Iterasi 1, dimana berdasarkan action plan yang telah disepakati, fokus pengembangan dialihkan pada peningkatan keamanan dokumen dan efisiensi proses melalui implementasi tanda tangan digital reusable, integrasi sertifikat digital, serta otomatisasi pengiriman antar divisi. Proses pengembangan mengikuti tahapan metode prototyping sebagai berikut:

**a) Communication (Komunikasi)**

Tahap komunikasi kedua dilakukan untuk menggali kebutuhan pengembangan fitur keamanan dan efisiensi dokumen berdasarkan hasil evaluasi Iterasi 1. Diskusi dilakukan dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berkoordinasi dengan Kepala Bidang TI dan Keamanan Dokumen untuk merancang sistem validasi berbasis sertifikat digital. Analisis kebutuhan menunjukkan sistem harus mendukung: (1) enkripsi dokumen dengan AES-256, (2) validasi keaslian menggunakan QR code, (3) audit trail lengkap untuk setiap proses dokumen, dan (4) pembuatan sertifikat digital sebagai tanda keaslian dokumen.

Hasil komunikasi dari diskusi dengan Kasubbid PSI menunjukkan bahwa iterasi kedua perlu fokus pada peningkatan keamanan dokumen dan efisiensi proses untuk mengatasi kekurangan yang ditemukan pada Iterasi 1. Sistem keamanan yang direncanakan akan mengintegrasikan teknologi sertifikat digital dan QR code yang akan dikembangkan khusus untuk sistem ini, dimana sebelumnya BAPPENDA belum memiliki sistem sertifikat digital untuk validasi dokumen. Implementasi sistem sertifikat digital ini diharapkan dapat memastikan keaslian dan keamanan dokumen yang diproses melalui sistem booking online.

**b) Quick Plan (Perencanaan Cepat)**

Selama tahap perencanaan cepat, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem keamanan dan efisiensi untuk Iterasi 2. Proses perencanaan dilakukan melalui diskusi teknis dengan Kasubbid PSI sebagai mentor dan validator dalam merancang solusi keamanan yang komprehensif. Output perencanaan yang dihasilkan adalah sebagai berikut:

a) Modifikasi Database: Tahap perencanaan mencakup penambahan 9 tabel *Database* baru untuk mendukung fitur keamanan, seperti pv_local_certs, pv_4_signing_audit_event, pv_7_audit_log, sys_notifications, dan bank_1_cek_hasil_transaksi. Modifikasi juga dilakukan pada beberapa tabel eksisting (a_2_verified_users, p_1_verifikasi, dan p_3_clear_to_paraf) untuk menambahkan kolom tanda tangan digital. Penambahan tabel dan kolom ini dirancang untuk mendukung arsitektur keamanan dengan empat lapisan utama.

b) Arsitektur Keamanan 4 Lapisan:

1. *Certificate Generation*: Sistem akan menghasilkan sertifikat digital untuk setiap dokumen yang divalidasi, dimana sertifikat ini berfungsi sebagai tanda keaslian dan keamanan dokumen.
2. *QR Code Embedding*: Sistem akan menambahkan *QR code* ke setiap dokumen yang telah divalidasi, dimana *QR code* ini dapat digunakan untuk verifikasi keaslian dokumen secara cepat.
3. *Encrypted Storage*: Dokumen yang disimpan di database akan dienkripsi menggunakan *AES-256* untuk memastikan keamanan data dari akses yang tidak sah.
4. *Audit Logging*: Sistem akan mencatat semua aktivitas yang terjadi pada dokumen dalam tabel *audit log*, dimana catatan ini berfungsi untuk *tracking* dan *audit trail* setiap proses yang dilakukan.

c) Integrasi Sistem: Sistem juga dirancang untuk terintegrasi dengan divisi Bank untuk verifikasi pembayaran, dimana integrasi ini memungkinkan verifikasi pembayaran dilakukan secara paralel dengan pemeriksaan berkas untuk meningkatkan efisiensi proses.

**c) Quick Design (Desain Cepat)**

Pada tahap pemodelan desain cepat untuk Iterasi 2, aktivitas berfokus pada integrasi keamanan digital dan komponen baru yang telah direncanakan pada tahap *Quick Plan*. Proses desain dilakukan oleh peneliti dengan melakukan presentasi *wireframe* dan *mockup* kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan *feedback* dan validasi terhadap fitur keamanan yang kompleks seperti sistem sertifikat digital dan *QR code*. Kasubbid PSI berperan sebagai validator yang melakukan *review* terhadap desain untuk memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid PSI. Output desain yang dihasilkan adalah sebagai berikut:

a) Komponen Keamanan: Desain iterasi kedua menambahkan komponen keamanan seperti panel pengelolaan sertifikat digital dan modul verifikasi *QR code*. Panel pengelolaan sertifikat dirancang untuk memungkinkan admin mengelola sertifikat digital yang dihasilkan oleh sistem, sedangkan modul verifikasi *QR code* dirancang untuk validasi keaslian dokumen secara cepat.

b) Diagram Alur Validasi: Diagram alur validasi dirancang menggunakan *Draw.io* yang terdiri atas tahap: *User Request* → *Authentication* → *Certificate Generation* → *QR Code Creation* → *Verification*. Alur ini menggambarkan proses validasi dokumen yang memastikan keamanan dan keaslian dokumen melalui sertifikat digital dan *QR code*.

c) Antarmuka Pengguna: Antarmuka pengguna dirancang agar mudah digunakan oleh petugas validasi, dengan *dashboard* pemantauan status dokumen dan notifikasi otomatis. *Dashboard* ini dirancang untuk memberikan *overview* status dokumen yang mencakup informasi validasi sertifikat digital dan *QR code*.


**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan untuk fitur keamanan dan efisiensi. Implementasi dimulai dengan pengembangan modul keamanan yang meliputi pembuatan sertifikat digital, integrasi *QR code*, dan implementasi enkripsi *AES-256*. Proses pembangunan dilakukan secara bertahap dengan prioritas pada modul keamanan dan efisiensi yang telah direncanakan pada tahap *Quick Plan*.

Pembangunan prototipe pada Iterasi 2 dilakukan secara bertahap oleh peneliti dengan pendekatan *agile development*. Proses dimulai dengan pengembangan sistem sertifikat digital lokal yang akan diimplementasikan di server BAPPENDA dengan koordinasi teknis dan supervisi dari Kasubbid PSI. Pengembangan algoritma enkripsi *AES-256* dilakukan dengan mengikuti standar keamanan yang telah ditetapkan. Setiap fitur keamanan dikembangkan secara modular dan diuji menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang. Uji coba integrasi dilakukan di lingkungan staging sebelum diimplementasikan ke sistem produksi. Fitur yang dikembangkan pada iterasi kedua adalah sebagai berikut:

a) Otomasi Tanda Tangan Digital: Sistem dirancang agar pengguna cukup mengunggah tanda tangan sekali (*reusable signature*) dan dapat digunakan untuk beberapa dokumen, sehingga mengurangi waktu unggah tanda tangan yang merupakan salah satu kekurangan pada Iterasi 1.

b) Sertifikat Digital Lokal: Sistem menghasilkan sertifikat digital secara lokal untuk setiap dokumen yang divalidasi oleh pejabat (Kabid Pelayanan). Sertifikat digital dienkripsi menggunakan enkripsi *AES-256* untuk memastikan keamanan data dari akses yang tidak sah. Sistem sertifikat digital ini berjalan di server lokal BAPPENDA dan hanya digunakan oleh pejabat yang berwenang untuk melakukan validasi dokumen.

c) Validasi *QR Code* Ganda: Sistem dirancang untuk menghasilkan dan memvalidasi *QR code* ganda untuk publik dan internal BAPPENDA. *QR code* publik dapat digunakan untuk verifikasi dokumen oleh pihak eksternal, sedangkan *QR code* internal digunakan untuk validasi internal oleh peneliti validasi.

d) Sistem Notifikasi *Real-time*: Sistem notifikasi *real-time* antar divisi dirancang untuk mempercepat komunikasi dan koordinasi dalam setiap tahapan proses, dimana notifikasi akan dikirim secara otomatis ketika ada perubahan status dokumen.

e) Integrasi Divisi Bank: Sistem terintegrasi dengan divisi Bank agar verifikasi pembayaran dapat dilakukan secara paralel dengan pemeriksaan berkas, sehingga meningkatkan efisiensi proses dan mengurangi waktu tunggu.

Tahapan ini menghasilkan prototipe yang lebih aman dan efisien dengan integrasi keamanan digital yang komprehensif.

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap Deployment, Delivery & Feedback untuk Iterasi 2, dilakukan *white box testing* untuk memastikan fitur keamanan dan efisiensi yang telah dikembangkan siap rilis dan berfungsi dengan baik. Pengujian white box dilakukan dengan memeriksa struktur internal program, logika algoritma, dan alur kode untuk memastikan implementasi keamanan seperti enkripsi AES-256, validasi QR code, dan audit trail berfungsi dengan benar. Dalam penelitian ini, pengujian dilakukan selama empat minggu dengan 5 pegawai dari bidang PSI yang berperan sebagai admin, LTB, peneliti, peneliti Validasi (Pejabat), dan LSB, serta 5 pengguna eksternal (PPAT) untuk menguji sistem dari perspektif pengguna end-to-end.

Mekanisme pengujian yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur keamanan dan efisiensi sesuai dengan skenario kasus nyata. Pengujian dilakukan di jam sibuk untuk menguji performa sistem di kondisi riil sesuai dengan beban kerja harian di BAPPENDA. Pengujian white box dilakukan untuk memvalidasi algoritma enkripsi, logika pembuatan sertifikat digital, dan mekanisme audit trail. Mekanisme pengumpulan *feedback* dilakukan melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum *feedback* dan menentukan *action plan* untuk iterasi berikutnya.

Hasil evaluasi dari pengujian Iterasi 2 menunjukkan bahwa sistem booking online dengan fitur keamanan digital yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Hasil menunjukkan bahwa validasi *QR code* mencapai akurasi 99,8%, waktu validasi menurun dari 15 menit menjadi 2 menit per dokumen, dan efisiensi meningkat 70% dibandingkan dengan sistem manual sebelumnya. Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, yaitu masih diperlukan penambahan sistem kuotasi untuk mencegah penumpukan booking karena dengan sistem yang lebih efisien, jumlah booking mengalami peningkatan yang signifikan. Berdasarkan hasil evaluasi tersebut, *action plan* untuk Iterasi 3 mencakup: (1) pengembangan sistem kuotasi dinamis untuk mengelola kapasitas booking harian, (2) implementasi *priority queue* untuk mengatur prioritas pemrosesan dokumen berdasarkan urgensi, dan (3) penambahan dashboard monitoring untuk memantau beban kerja divisi secara real-time.

Tahapan ini menghasilkan sistem yang lebih aman dan efisien dengan integrasi keamanan digital yang komprehensif.

---

**Lanjutkan dengan struktur yang sudah ada:**

- Tabel 4 Struktur Database Tambahan Iterasi 2
- Tabel 5 Hasil Pengujian Iterasi 2
- Tabel 6 Perbandingan Metrik Sistem
- dll.

---

### **Tambahkan sebelum "Tabel 7 Struktur Database Tambahan Iterasi 3" di 4.1.3:**

---

**4.1.3.1 Proses Pengembangan Iterasi 3**

Iterasi ketiga dilakukan dari Agustus hingga September 2025 setelah memperoleh feedback dari pengujian Iterasi 2, dimana berdasarkan action plan yang telah disepakati, fokus pengembangan dialihkan pada pengembangan sistem kuotasi dinamis untuk mengelola kapasitas booking harian yang mengalami peningkatan signifikan setelah implementasi sistem yang lebih efisien. Proses pengembangan mengikuti tahapan metode prototyping sebagai berikut:

**a) Communication (Komunikasi)**

Tahap komunikasi ketiga dilakukan untuk menggali kebutuhan pengembangan sistem kuotasi berdasarkan hasil evaluasi Iterasi 2 yang menunjukkan peningkatan jumlah booking yang signifikan. Diskusi dilakukan dengan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk menganalisis beban kerja pegawai dan merancang sistem kuotasi yang realistis dan adil.

Diskusi dengan Kasubbid PSI menunjukkan tingginya beban kerja pegawai mencapai rata-rata 100-200 booking per hari untuk BPHTB, sementara kapasitas optimal hanya 80-100 booking karena keterbatasan jumlah peneliti. Dampaknya adalah penurunan akurasi dan meningkatnya waktu tunggu pengguna. Analisis mendalam menunjukkan bahwa dengan 600 PPAT di Kabupaten Bogor dan struktur organisasi BAPPENDA yang terdiri dari 10-13 UPT (Unit Pelaksana Teknis) dengan 5-7 peneliti per UPT plus kantor pusat BAPPENDA, total kapasitas peneliti mencapai 85-115 orang. BAPPENDA mengelola 9 jenis pajak (BPHTB, PBB, Perhotelan, Burung Walet, Hiburan, Reklame, Penerangan Jalan, Parkir, dan Air Tanah), sehingga kapasitas peneliti harus dibagi untuk semua jenis pajak tersebut.

Hasil komunikasi dari diskusi dengan Kasubbid PSI menunjukkan bahwa diperlukan sistem kuotasi yang realistis dan adil untuk mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna. Sistem kuotasi yang direncanakan akan mengimplementasikan algoritma dinamis untuk mengatur kapasitas booking harian berdasarkan jumlah peneliti aktif dan beban kerja per UPT.

**b) Quick Plan (Perencanaan Cepat)**

Selama tahap perencanaan cepat untuk Iterasi 3, dilakukan penyusunan draft awal sistem aplikasi yang disiapkan berdasarkan kebutuhan fungsional dari hasil komunikasi dengan stakeholder. Berdasarkan hasil diskusi dengan Kasubbid PSI, peneliti menyusun perencanaan pengembangan sistem kuotasi untuk mengelola kapasitas booking harian. Proses perencanaan dilakukan melalui diskusi teknis dengan Kasubbid PSI sebagai mentor dan validator dalam merancang algoritma kuotasi yang realistis dan adil. Output perencanaan yang dihasilkan adalah sebagai berikut:

a) Modifikasi Database: Dirancang dua tabel baru (`ppat_daily_quota` dan `ppat_send_queue`) untuk mengelola kapasitas harian dan antrean booking. Tabel `ppat_daily_quota` menyimpan informasi kuota harian (quota_date, used_count, limit_count dengan default limit 80 dokumen per hari) untuk tracking jumlah booking yang telah diproses, sedangkan tabel `ppat_send_queue` menyimpan informasi antrean booking (nobooking, userid, scheduled_for, status) yang akan diproses pada hari berikutnya jika kuota harian telah terpenuhi.

b) Algoritma Kuotasi Dinamis: Sistem kuotasi menggunakan algoritma dynamic quota dengan fitur-fitur sebagai berikut:

1. Kuota Harian Dinamis: Sistem akan menetapkan kuota harian sebesar 80 dokumen untuk BPHTB berdasarkan kapasitas optimal yang telah dianalisis dari struktur organisasi BAPPENDA. Kuota ini ditetapkan berdasarkan total kapasitas peneliti 85-115 orang untuk 9 jenis pajak, dimana untuk BPHTB dialokasikan kuota harian 80 dokumen.
2. Priority Queue: Sistem menggunakan priority queue untuk mengatur prioritas pemrosesan dokumen urgent dan mendesak berdasarkan jenis pajak.
3. Load Balancing: Sistem menggunakan load balancing untuk distribusi merata antar UPT dan peneliti per jenis pajak.
4. Predictive Scheduling: Sistem menggunakan predictive scheduling berdasarkan historis pemrosesan per UPT dan jenis pajak.
5. Notifikasi Multi-level: Sistem akan mengirimkan notifikasi multi-level saat kuota mencapai 70%, 85%, dan 95% per jenis pajak.
6. Distribusi UPT: Sistem menggunakan distribusi berbasis UPT dan jenis pajak untuk memastikan pelayanan merata di seluruh wilayah.

c) Activity Diagram: Untuk memvisualisasikan alur kerja sistem kuotasi, dibuat Activity Diagram Iterasi 3 yang menggambarkan proses pengelolaan kuota harian dan antrean booking. Activity Diagram dapat dilihat pada Gambar X. Diagram ini menggambarkan alur dimulai dari reset daily counter (0/80) di awal hari kerja, kemudian pengecekan counter terhadap kuota harian, proses langsung untuk booking yang tidak melebihi kuota, dan antrean untuk booking yang melebihi kuota.

[Gambar X: Activity Diagram Iterasi 3 - pindahkan dari BAB III 1.7.2]

**c) Quick Design (Desain Cepat)**

Sementara itu, pada tahap pemodelan desain cepat untuk Iterasi 3, aktivitas berfokus pada perancangan dashboard monitoring dan implementasi algoritma kuotasi berdasarkan kebutuhan yang telah direncanakan pada tahap Quick Plan. Proses desain dilakukan oleh peneliti dengan melakukan presentasi wireframe dashboard dan algoritma kuotasi kepada Kasubbid PSI (Hendri Aji Sulistiyanto, ST) untuk mendapatkan feedback dan validasi terhadap sistem monitoring dan algoritma kuotasi. Kasubbid PSI berperan sebagai validator yang melakukan review terhadap desain untuk memastikan kelayakan implementasi dan kesesuaian dengan kebutuhan operasional di BAPPENDA. Iterasi desain dilakukan sebanyak 2 kali sampai mendapatkan persetujuan final dari Kasubbid PSI. *Output* desain yang dihasilkan adalah sebagai berikut:

a) Dashboard Monitoring Real-time: Desain antarmuka berupa dashboard monitoring real-time yang menampilkan beban kerja pegawai, grafik kapasitas harian, dan sistem notifikasi multi-channel. Dashboard ini dirancang untuk memberikan overview status kuota harian, antrean booking, dan metrik kinerja sistem.

b) Algoritma Kuotasi: Algoritma kuotasi dirancang dengan pendekatan sederhana namun efektif untuk mengelola kapasitas booking harian. Algoritma kuotasi dirancang dengan pendekatan:

- Daily Quota System: Sistem kuota harian ditetapkan sebesar 80 dokumen untuk BPHTB berdasarkan analisis kapasitas optimal peneliti. Counter harian akan direset otomatis setiap awal hari kerja (08:45) dan akan bertambah setiap ada booking yang diproses, dengan batas maksimal 80 booking per hari.

- Round-robin Processing: Sistem menggunakan algoritma round-robin sederhana untuk memproses booking secara berurutan. Booking yang masuk akan diproses langsung jika counter harian masih di bawah 80, dan akan masuk ke antrean jika counter sudah mencapai atau melebihi 80.

- Queue Management: Booking yang melebihi kuota harian akan masuk ke dalam antrean (ppat_send_queue) dan akan diproses pada hari berikutnya sesuai dengan urutan masuk (first-in-first-out). Sistem antrean dirancang untuk memastikan tidak ada booking yang hilang atau terlewat.

- Notification System: Sistem notifikasi multi-level dirancang untuk memberikan peringatan otomatis kepada admin dan PPAT ketika kuota harian mencapai 70% (56 dokumen), 85% (68 dokumen), dan 95% (76 dokumen) untuk memberikan kesempatan persiapan yang cukup.

c) *Diagram Proses Bisnis*: Untuk menggambarkan alur kerja sistem kuotasi yang melibatkan berbagai aktor, dibuat Diagram Proses Bisnis Iterasi 3 yang menggambarkan pembagian tanggung jawab dan alur kerja antar divisi dalam proses pengelolaan kuota harian. Diagram proses bisnis dapat dilihat pada Gambar X. Diagram ini terbagi menjadi 5 divisi utama yaitu PPAT/PPATS (kirim berkas), LTB (terima berkas dan cek daily counter), Peneliti (proses berkas langsung dan counter +1), Admin (masuk antrean dan monitor quota), dan System (auto reset counter). Proses dimulai dari PPAT/PPATS yang mengirim berkas, kemudian LTB melakukan pengecekan counter harian menggunakan tabel `ppat_daily_quota`. Jika counter kurang dari 80, berkas diproses langsung oleh Peneliti dan counter bertambah. Jika counter sudah mencapai 80 atau lebih, berkas masuk ke dalam antrean yang dikelola oleh Admin menggunakan tabel `ppat_send_queue`. System bertanggung jawab untuk auto reset counter di awal hari kerja. Diagram ini menunjukkan bagaimana sistem kuotasi mengintegrasikan alur kerja antar divisi untuk mengelola kapasitas booking harian secara efisien dengan limit 80 dokumen per hari.

[Gambar X: Diagram Proses Bisnis Iterasi 3 - pindahkan dari BAB III 1.7.4]

d) Use Case Diagram: Untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia pada sistem kuotasi, dibuat Use Case Diagram Iterasi 3 yang menunjukkan 5 aktor utama (PPAT/PPATS, LTB, Peneliti, Admin, dan System) yang berinteraksi dengan 9 use case yang diimplementasikan. Use Case Diagram dapat dilihat pada Gambar X. Use case yang tersedia meliputi kirim berkas (PPAT/PPATS), cek daily counter dan queue management (LTB), proses berkas langsung (Peneliti), masuk antrean, monitor quota, dan view queue status (Admin), serta auto reset counter dan schedule next day (System). Diagram ini menunjukkan bahwa sistem kuotasi dirancang untuk mengoptimalkan pengelolaan kuota harian dengan melibatkan berbagai aktor secara sinergis, dimana PPAT/PPATS dapat mengirim berkas, LTB dapat mengecek kuota dan mengelola antrean, Peneliti dapat memproses berkas langsung jika kuota masih tersedia, Admin dapat memantau kuota dan status antrean, dan System melakukan auto reset counter setiap hari dan penjadwalan otomatis untuk hari berikutnya counter serta generate reports secara otomatis.

[Gambar X: Usecase Diagram Iterasi 3 - pindahkan dari BAB III 1.7.4]

**d) Construction of Prototype (Konstruksi Prototipe)**

Tahap ini merupakan proses penerjemahan rancangan konseptual dari tahap modelling quick design menjadi kode program yang dapat dijalankan untuk fitur sistem kuotasi. Implementasi dimulai dengan pengembangan algoritma kuotasi yang meliputi pembuatan sistem counter harian dan antrean booking. Proses pembangunan dilakukan secara bertahap dengan prioritas pada modul kuotasi yang telah direncanakan pada tahap Quick Plan.

Pembangunan prototipe pada Iterasi 3 dilakukan secara bertahap oleh peneliti dengan pendekatan agile development. Proses dimulai dengan pengembangan sistem kuotasi yang terintegrasi dengan sistem booking eksisting. Algoritma kuotasi berbasis round-robin dikembangkan untuk mengelola kuota harian 80 dokumen untuk BPHTB. Setiap fitur kuotasi dikembangkan secara modular dan diuji menggunakan unit testing sebelum diintegrasikan dengan modul lainnya. Review kode dan validasi alur sistem dilakukan oleh Kasubbid PSI (Hendri Aji Sulistiyanto, ST) yang berperan sebagai mentor dan validator teknis setiap minggu untuk memastikan kualitas kode dan kesesuaian dengan alur bisnis yang telah dirancang. Dashboard monitoring dirancang untuk menampilkan metrik kinerja seperti waktu rata-rata pemrosesan dan kapasitas per divisi. Fitur yang dikembangkan pada iterasi ketiga adalah sebagai berikut:

a) Sistem Counter Harian: Sistem counter harian dirancang untuk menghitung jumlah booking yang telah diproses dalam satu hari kerja. Counter akan direset ke 0 setiap awal hari kerja dan akan bertambah setiap ada booking yang masuk, dengan batas maksimal 80 booking per hari untuk BPHTB.

b) Antrean Booking: Sistem antrean booking dirancang untuk mengelola booking yang melebihi kuota harian 80 dokumen. Booking yang melebihi kuota akan masuk ke dalam antrean dan akan diproses pada hari berikutnya sesuai dengan prioritas dan urutan masuk.

c) Dashboard Monitoring: Dashboard monitoring dirancang untuk menampilkan metrik kinerja seperti waktu rata-rata pemrosesan, kapasitas per divisi, dan status kuota harian. Dashboard ini akan memberikan notifikasi multi-level saat kuota mencapai 70%, 85%, dan 95%.

d) Sistem Notifikasi: Sistem notifikasi dirancang untuk mengirimkan peringatan otomatis kepada admin dan PPAT ketika kuota harian hampir terpenuhi atau ketika booking masuk ke dalam antrean.

Tahapan ini menghasilkan sistem kuotasi yang realistis dan adil, mampu mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna.

**e) Delivery and Feedback (Penyerahan dan Umpan Balik)**

Pada tahap *Deployment, Delivery* & *Feedback* untuk Iterasi 3, dilakukan hybrid testing (black box dan white box) untuk memastikan sistem kuotasi yang telah dikembangkan siap rilis dan berfungsi dengan baik sebelum go live. White box testing dilakukan untuk validasi algoritma dan logic flow dari sistem kuotasi, sedangkan black box testing dilakukan untuk validasi fungsionalitas end-to-end dari perspektif pengguna. Dalam penelitian ini, pengujian dilakukan dengan melibatkan 5 pegawai dari bidang PSI yang berperan sebagai admin, LTB, peneliti, peneliti Validasi (Pejabat), dan LSB untuk menguji sistem dari perspektif pengguna *end-to-end*.

Mekanisme pengujian yang dilakukan adalah sebagai berikut: Setiap penguji diberikan akses ke sistem staging dan diminta untuk menguji semua fitur sistem kuotasi sesuai dengan skenario kasus nyata. Pengujian white box dilakukan untuk memvalidasi algoritma kuotasi dinamis, logika priority queue, dan mekanisme load balancing. Pengujian black box dilakukan untuk memastikan bahwa sistem dapat mengelola kuota harian 80 dokumen dengan baik, booking yang melebihi kuota masuk ke dalam antrean dengan benar, dan dashboard monitoring menampilkan informasi yang akurat. Mekanisme pengumpulan feedback dilakukan melalui diskusi langsung dengan Kasubbid PSI selama masa pengujian untuk mendapatkan masukan dari berbagai divisi mengenai kelebihan dan kekurangan sistem. Di akhir periode pengujian, dilakukan sesi evaluasi bersama Kasubbid PSI untuk merangkum feedback dan menentukan keputusan untuk go live.

Hasil evaluasi dari pengujian Iterasi 3 menunjukkan bahwa sistem kuotasi yang telah dikembangkan dapat berfungsi dengan baik dan sesuai dengan kebutuhan operasional di BAPPENDA. Sistem telah terintegrasi dengan baik dengan sistem *booking eksisting* dan siap untuk evaluasi performa dan *user acceptance testing*. Berdasarkan hasil evaluasi tersebut, keputusan untuk *go live* adalah sistem dinyatakan siap untuk *go live* setelah seluruh *testing* dan *feedback* terakomodasi dengan baik, dimana Kasubbid PSI telah meminta pembuatan website domain dengan nama `bphtb.bogorkab.go.id` sebagai *website* yang akan digunakan nantinya untuk akses sistem *booking online E-BPHTB*.

**Rencana sosialisasi sistem** akan dilakukan secara menyeluruh kepada 600 PPAT/PPATS di Kabupaten Bogor untuk mengajarkan cara penggunaan sistem booking online yang baru dengan fokus pada pemrosesan alur kerja sistem kuotasi. Sosialisasi direncanakan dilakukan melalui beberapa tahap yaitu: (1) pembuatan panduan penggunaan sistem yang komprehensif, (2) presentasi sistem kepada PPAT/PPATS dalam sesi kelompok, (3) demonstrasi live sistem untuk menunjukkan alur kerja booking online dan sistem kuotasi, dan (4) sesi tanya jawab untuk menjawab pertanyaan dan kekhawatiran PPAT/PPATS terkait sistem baru. Sosialisasi akan dilakukan dengan koordinasi Kasubbid PSI untuk memastikan seluruh PPAT/PPATS memahami cara kerja sistem dan dapat mengoperasikan sistem dengan baik sebelum go live. Tahap sosialisasi ini direncanakan untuk dilakukan setelah iterasi ketiga selesai dan penting untuk memastikan successful adoption sistem oleh seluruh pengguna.

Tahapan ini menghasilkan sistem kuotasi yang realistis dan adil, mampu mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna. Dengan sistem kuotasi ini, beban kerja pegawai dapat dikelola dengan lebih baik dan peningkatan jumlah booking yang signifikan setelah implementasi sistem yang lebih efisien dapat ditangani dengan efektif.

---

**Lanjutkan dengan struktur yang sudah ada:**

- Tabel 7 Struktur Database Tambahan Iterasi 3
- Tabel 8 Hasil Pengujian Iterasi 3
- Tabel 9 Perbandingan Metrik Sistem
- dll.

---

## 📌 CATATAN PENTING

1. **Untuk Iterasi 2 dan 3**, gunakan struktur yang sama seperti Iterasi 1 di atas
2. **Pindahkan semua konten** dari BAB III bagian 1.6 dan 1.7 ke BAB IV bagian 4.1.2.1 dan 4.1.3.1
3. **Update nomor gambar dan tabel** sesuai dengan urutan baru di BAB IV
4. **Pastikan konsistensi** penomoran dan referensi

---

## 🎯 BAGIAN 3: PENEMPATAN TABEL DAN GAMBAR DI BAB IV

### **PENEMPATAN TABEL DAN GAMBAR ITERASI 1 (4.1.1.1)**

#### **Di bagian "b) Quick Plan (Perencanaan Cepat)":**

**Setelah paragraf:** "Sebelum menjelaskan diagram UML yang akan dibuat, terlebih dahulu perlu dijelaskan simbol-simbol yang digunakan untuk memudahkan pemahaman pembaca. Simbol-simbol yang digunakan dalam diagram penelitian ini dapat dilihat pada Tabel X sebagai berikut."

**Tempatkan:**
- **Tabel 3: Simbol-Simbol Diagram** (pindahkan dari BAB III 1.5.2)

**Setelah paragraf:** "b) *Activity Diagram* Iterasi 1: Untuk memvisualisasikan perencanaan alur kerja yang akan dikerjakan, dibuat *Activity Diagram* Iterasi 1 yang menunjukkan proses transformasi dari sistem manual menjadi digital. Diagram ini menggambarkan alur dari pengajuan booking hingga penyelesaian dokumen, dan menjadi panduan teknis dalam pengembangan sistem. *Activity Diagram* dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 2: Activity Diagram Iterasi 1** (pindahkan dari BAB III 1.5.2)

#### **Di bagian "c) Quick Design (Desain Cepat)":**

**Setelah paragraf:** "*b) Diagram Proses Bisnis*: Diagram proses bisnis dirancang untuk mengilustrasikan pembagian tanggung jawab dan alur kerja antar divisi dalam proses booking online E-BPHTB. Diagram proses bisnis dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 3: Diagram Proses Bisnis Iterasi 1** (pindahkan dari BAB III 1.5.3)

**Setelah paragraf:** "*c) Use Case Diagram*: Use case diagram dibuat untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia. Use Case Diagram dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 4: Usecase Diagram Iterasi 1** (pindahkan dari BAB III 1.5.3)

**Setelah paragraf:** "d. Struktur Database Relasional: Struktur database relasional dirancang menggunakan *draw.io*, yang mendukung sistem penomoran otomatis (no_booking_, no_registrasi) dan keterhubungan antar tabel."

**Tempatkan:**
- **Gambar 5: Struktur Database** (pindahkan dari BAB III 1.5.3)

#### **Setelah bagian "4.1.1.1 Proses Pengembangan Iterasi 1" (sebelum tabel struktur database):**

**Tempatkan:**
- **Tabel 1: Struktur Database Iterasi 1** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 2: Hasil Pengujian Iterasi 1** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 3: Perbandingan Metrik Sistem** (jika sudah ada di BAB IV, tetap di posisi ini)

**Setelah tabel-tabel di atas, tambahkan:**

**Tabel 4: Analisis Hasil**

| Aspek | Sebelum | Setelah |
|-------|---------|---------|
| Waktu proses berkas | ±30-40 menit | 10–25 menit |
| Validasi dokumen | 10 menit | 2 menit |
| Akurasi QR code | – | 99,8% |
| Kepuasan pegawai | 60% | 85% |
| Kepuasan PPAT | 65% | 88% |
| Uptime sistem | – | 99,7% |

**Tabel 5: Kebutuhan Fungsional**

| No | Fitur | Deskripsi Singkat | Aktor/Pengguna | Status |
|----|-------|-------------------|----------------|--------|
| 1 | Login | Setiap pengguna wajib login menggunakan akun terdaftar untuk mengakses sistem. | Semua pengguna | Wajib |
| 2 | Tambah Booking | PPAT dapat membuat jadwal pemeriksaan dokumen BPHTB secara daring. | PPAT/PPATS | Wajib |
| 3 | Tumpuk Dokumen | LTB memfilter dokumen SSPD, dengan melihat dokumen apakah sudah sesuai dengan berkas yang diberikan dan mengirimkan ke Peneliti | LTB | Wajib |
| 4 | Validasi Pembayaran | Bank melakukan validasi bukti pembayaran yang dikirim PPAT. | Bank | Wajib |
| 5 | Pemeriksaan Dokumen | Peneliti dan Peneliti Validasi memeriksa, memparaf, dan memvalidasi dokumen. | Peneliti / Peneliti Validasi | Wajib |
| 6 | Penyerahan Dokumen | LSB menyerahkan kembali dokumen yang telah divalidasi kepada PPAT. | LSB | Wajib |

**Tabel 6: Relasi Database**

| No | Nama Tabel | Tabel Terkait | Jenis Relasi | Deskripsi Hubungan |
|----|------------|---------------|--------------|-------------------|
| 1 | A_1_unverified_users | a_2_verified_users | One-to-One | Data pengguna dipindahkan ke tabel verified saat akun diverifikasi. |
| 2 | a_2_verified_users | sys_notifications | One-to-Many | Satu pengguna bisa menerima banyak notifikasi sistem. |
| 3 | pat_1_bookingsspd | pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, pat_6_sign, pat_7_validasi_surat, pat_8_validasi_tambahan | One-to-Many | Tabel utama menyimpan data inti booking dan terhubung ke data perhitungan, objek pajak, dan validasi. |
| 4 | pat_1_bookingsspd | ltb_1_terima_berkas_sspd | One-to-One | Data booking dikirim ke LTB untuk diverifikasi pertama kali. |
| 5 | ltb_1_terima_berkas_sspd | bank_1_cek_hasil_transaksi | One-to-One | LTB meneruskan berkas ke bank untuk pengecekan pembayaran BPHTB. |
| 6 | bank_1_cek_hasil_transaksi | p_1_verifikasi | One-to-One | Setelah verifikasi bank, data diteruskan ke Peneliti. |
| 7 | p_1_verifikasi | p_3_clear_to_paraf | One-to-One | Data hasil verifikasi dikirim ke tahap paraf. |
| 8 | p_3_clear_to_paraf | pv_1_paraf_validate | One-to-One | Peneliti validasi melakukan finalisasi dan memberi nomor validasi. |
| 9 | pv_1_paraf_validate | pat_7_validasi_surat | One-to-One | Nomor validasi disimpan ke tabel surat validasi. |
| 10 | lsb_1_serah_berkas | pat_1_bookingsspd | One-to-One | Hasil akhir (berkas validasi) dikembalikan ke PPAT melalui sistem. |

---

### **PENEMPATAN TABEL DAN GAMBAR ITERASI 2 (4.1.2.1)**

#### **Di bagian "c) Quick Design (Desain Cepat)":**

**Setelah paragraf:** "d) *Activity Diagram*: *Activity Diagram* Iterasi 2 menggambarkan alur kerja sistem *booking online E-BPHTB* secara komprehensif dengan penambahan fitur keamanan. *Activity Diagram* dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 6: Activity Diagram Iterasi 2** (pindahkan dari BAB III 1.6.3)

**Setelah paragraf:** "e) *Diagram Proses Bisnis*: Diagram proses bisnis Iterasi 2 menggambarkan alur kerja sistem *booking online E-BPHTB* yang telah dikembangkan menjadi lebih terintegrasi dengan penambahan divisi BANK dan sistem notifikasi *real-time*. Diagram proses bisnis dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 7: Diagram Proses Bisnis Iterasi 2** (pindahkan dari BAB III 1.6.3)

**Setelah paragraf:** "f) Use Case Diagram: Use Case Diagram Iterasi 2 menggambarkan evolusi sistem dari Iterasi 1 dengan penambahan fitur keamanan dan otomasi. Use Case Diagram dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 8: Usecase Diagram Iterasi 2** (pindahkan dari BAB III 1.6.3)

#### **Setelah bagian "4.1.2.1 Proses Pengembangan Iterasi 2" (sebelum tabel struktur database):**

**Tempatkan:**
- **Tabel 4: Struktur Database Tambahan Iterasi 2** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 5: Hasil Pengujian Iterasi 2** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 6: Perbandingan Metrik Sistem** (jika sudah ada di BAB IV, tetap di posisi ini)

---

### **PENEMPATAN TABEL DAN GAMBAR ITERASI 3 (4.1.3.1)**

#### **Di bagian "c) Quick Design (Desain Cepat)":**

**Setelah paragraf:** "c) Use Case Diagram: Untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia pada sistem kuotasi, dibuat Use Case Diagram Iterasi 3 yang menunjukkan 5 aktor utama (PPAT/PPATS, LTB, Peneliti, Admin, dan System) yang berinteraksi dengan berbagai use case. Use Case Diagram dapat dilihat pada Gambar X."

#### **Di bagian "b) Quick Plan (Perencanaan Cepat)":**

**Setelah paragraf:** "c) Activity Diagram: Untuk memvisualisasikan alur kerja sistem kuotasi, dibuat Activity Diagram Iterasi 3 yang menggambarkan proses pengelolaan kuota harian dan antrean booking. Activity Diagram dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 9: Activity Diagram Iterasi 3** (pindahkan dari BAB III 1.7.2)

#### **Di bagian "c) Quick Design (Desain Cepat)":**

**Setelah paragraf:** "c) *Diagram Proses Bisnis*: Untuk menggambarkan alur kerja sistem kuotasi yang melibatkan berbagai aktor, dibuat Diagram Proses Bisnis Iterasi 3 yang menggambarkan pembagian tanggung jawab dan alur kerja antar divisi dalam proses pengelolaan kuota harian. Diagram proses bisnis dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 10: Diagram Proses Bisnis Iterasi 3** (pindahkan dari BAB III 1.7.4)

**Setelah paragraf:** "d) Use Case Diagram: Untuk menggambarkan interaksi antara aktor-aktor sistem dengan fungsi-fungsi yang tersedia pada sistem kuotasi, dibuat Use Case Diagram Iterasi 3 yang menunjukkan 5 aktor utama (PPAT/PPATS, LTB, Peneliti, Admin, dan System) yang berinteraksi dengan berbagai use case. Use Case Diagram dapat dilihat pada Gambar X."

**Tempatkan:**
- **Gambar 11: Usecase Diagram Iterasi 3** (pindahkan dari BAB III 1.7.4)

#### **Setelah bagian "4.1.3.1 Proses Pengembangan Iterasi 3" (sebelum tabel struktur database):**

**Tempatkan:**
- **Tabel 7: Struktur Database Tambahan Iterasi 3** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 8: Hasil Pengujian Iterasi 3** (jika sudah ada di BAB IV, tetap di posisi ini)
- **Tabel 9: Perbandingan Metrik Sistem** (jika sudah ada di BAB IV, tetap di posisi ini)

---

## 🎯 BAGIAN 4: PENEMPATAN ACTIVITY DIAGRAM DETAIL (24 USE CASE)

### **KONTEKS:**
Dosen meminta semua 24 use case dibuat menjadi masing-masing 1 activity diagram. Saat ini sudah ada 13 activity diagram yang dibuat. Dari 13 activity diagram tersebut:

- **4 Activity Diagram** akan dijelaskan **DETAIL** di BAB IV Hasil dan Pembahasan
- **9 Activity Diagram** akan dimasukkan ke **LAMPIRAN** dan dijelaskan **SINGKAT** di BAB IV dengan tabel deskripsi

---

### **ACTIVITY DIAGRAM YANG DIJELASKAN DETAIL DI BAB IV (4.1.1.1)**

#### **1. Create Booking (Activity_02_Create_Booking.xml)**

**Tempatkan di bagian:** "4.1.1.1 Proses Pengembangan Iterasi 1" → **"d) Construction of Prototype (Konstruksi Prototipe)"**

**Setelah paragraf:** "*a) Formulir Booking Online*: Formulir booking online dirancang untuk memungkinkan PPAT/PPATS melakukan pemesanan jadwal pemeriksaan secara daring dari mana saja. Formulir ini dilengkapi dengan validasi input untuk memastikan data yang dimasukkan sesuai dengan format yang diharapkan, seperti format nomor identitas, format tanggal, dan validasi kelengkapan data."

**Tambahkan teks berikut:**

Proses pembuatan booking dilakukan melalui beberapa tahapan yang dijelaskan dalam Activity Diagram Create Booking. Activity Diagram ini menggambarkan alur lengkap dari pengisian formulir booking hingga penyimpanan data ke database. Proses dimulai ketika PPAT/PPATS mengakses halaman formulir booking dan mengisi data wajib pajak, data pemilik objek pajak, serta melakukan perhitungan NJOP dan BPHTB. Sistem melakukan validasi terhadap setiap input yang dimasukkan, termasuk validasi format data, kelengkapan dokumen, dan konsistensi perhitungan. Setelah semua data divalidasi, sistem menyimpan data ke database menggunakan database transaction untuk memastikan integritas data. Activity Diagram Create Booking dapat dilihat pada Gambar X.

**Tempatkan:**
- **Gambar X: Activity Diagram Create Booking** (Activity_02_Create_Booking.xml)

---

#### **2. Generate No. Booking (Activity_03_Generate_No_Booking.xml)**

**Tempatkan di bagian:** "4.1.1.1 Proses Pengembangan Iterasi 1" → **"d) Construction of Prototype (Konstruksi Prototipe)"**

**Setelah paragraf tentang Create Booking, tambahkan teks berikut:**

Setelah data booking berhasil disimpan, sistem secara otomatis menghasilkan nomor booking menggunakan database trigger. Activity Diagram Generate No. Booking menggambarkan proses otomatis pembuatan nomor booking dengan format `ppat_khusus-YYYY-000001`, dimana `ppat_khusus` diambil dari data pengguna yang membuat booking, `YYYY` merupakan tahun berjalan, dan `000001` merupakan urutan sequence yang di-generate secara otomatis. Database trigger `trg_nobooking` diaktifkan sebelum data di-insert ke tabel `pat_1_bookingsspd`, sehingga setiap booking yang baru akan otomatis mendapatkan nomor booking yang unik. Proses ini memastikan tidak ada duplikasi nomor booking dan memudahkan tracking dokumen. Activity Diagram Generate No. Booking dapat dilihat pada Gambar X.

**Tempatkan:**
- **Gambar X: Activity Diagram Generate No. Booking** (Activity_03_Generate_No_Booking.xml)

---

#### **3. Upload Dokumen (Activity_05_Upload_Document.xml)**

**Tempatkan di bagian:** "4.1.1.1 Proses Pengembangan Iterasi 1" → **"d) Construction of Prototype (Konstruksi Prototipe)"**

**Setelah paragraf:** "*b) Unggah Dokumen*: Sistem unggah dokumen memungkinkan pengguna untuk mengunggah dokumen pendukung seperti akta tanah, sertifikat, dan dokumen pelengkap lainnya. Dokumen yang diunggah disimpan dalam database dan dapat diakses oleh divisi terkait sesuai dengan tahapan proses."

**Tambahkan teks berikut:**

Activity Diagram Upload Dokumen menggambarkan alur lengkap proses pengunggahan dokumen pendukung oleh PPAT/PPATS. Proses dimulai ketika pengguna memilih dokumen yang akan diunggah, baik dokumen wajib maupun dokumen tambahan. Sistem melakukan validasi terhadap file yang diunggah, meliputi validasi format file (PDF, JPG, PNG), ukuran file (maksimal 5MB), dan kelengkapan dokumen. Setelah validasi berhasil, dokumen diunggah ke secure storage (UploadCare atau secure storage server) dan metadata dokumen disimpan ke tabel `pat_7_validasi_surat`. Sistem juga mencatat informasi waktu upload, jenis dokumen, dan status dokumen untuk keperluan tracking. Activity Diagram Upload Dokumen dapat dilihat pada Gambar X.

**Tempatkan:**
- **Gambar X: Activity Diagram Upload Dokumen** (Activity_05_Upload_Document.xml)

---

#### **4. Validasi Proses (Activity_09_LTB_Validate_Document.xml atau Activity_10_LTB_Accept_Reject.xml)**

**Tempatkan di bagian:** "4.1.1.1 Proses Pengembangan Iterasi 1" → **"d) Construction of Prototype (Konstruksi Prototipe)"**

**Setelah paragraf tentang Upload Dokumen, tambahkan teks berikut:**

Setelah dokumen berhasil diunggah dan booking dikirim ke LTB, proses validasi dokumen dilakukan oleh LTB. Activity Diagram Validasi Proses menggambarkan alur lengkap proses validasi dokumen yang dilakukan oleh LTB, mulai dari penerimaan booking dari PPAT hingga keputusan diterima atau ditolak. Proses validasi meliputi review dokumen (akta, sertifikat, tanda tangan), pengecekan kelengkapan dokumen, validitas dokumen, dan konsistensi data. Setelah proses validasi selesai, LTB dapat memilih untuk menerima atau menolak booking. Jika diterima, booking diteruskan ke tahap pemeriksaan oleh Peneliti. Jika ditolak, sistem mengirimkan notifikasi kepada PPAT dengan alasan penolakan. Setiap keputusan dicatat dalam database untuk keperluan audit trail. Activity Diagram Validasi Proses dapat dilihat pada Gambar X.

**Tempatkan:**
- **Gambar X: Activity Diagram Validasi Proses** (Activity_09_LTB_Validate_Document.xml atau Activity_10_LTB_Accept_Reject.xml)

---

### **ACTIVITY DIAGRAM YANG MASUK LAMPIRAN (Dijelaskan Singkat dengan Tabel)**

**Tempatkan di bagian:** "4.1.1.1 Proses Pengembangan Iterasi 1" → **Setelah bagian "e) Delivery and Feedback"** atau **sebelum Tabel 1 Struktur Database Iterasi 1**

**Tambahkan teks berikut:**

Selain empat activity diagram utama yang telah dijelaskan di atas, sistem juga memiliki sembilan activity diagram tambahan yang menggambarkan proses-proses pendukung dalam sistem booking online. Activity diagram tambahan ini mencakup proses login dan registrasi, penambahan tanda tangan manual, validasi tambahan, proses penerimaan dan pengiriman dokumen antar divisi, serta proses update status. Untuk menjaga fokus pembahasan, activity diagram tambahan ini dijelaskan secara singkat dalam Tabel X berikut, sedangkan diagram lengkapnya dapat dilihat pada Lampiran.

**Tempatkan Tabel berikut:**

**Tabel X: Deskripsi Activity Diagram Tambahan**

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 1 | Login dan Register | User, Sistem | Alur lengkap proses login dan registrasi pengguna dengan OTP verification, validasi password, dan session management. | `a_1_unverified_users`, `a_2_verified_users` | Lampiran X |
| 2 | Add Manual Signature | PPAT/PPATS, Sistem | Alur upload tanda tangan manual dengan validasi file (JPG/PNG, maks 2MB), preview signature, dan penyimpanan ke secure storage. | `pat_6_sign` | Lampiran X |
| 3 | Add Validasi Tambahan | PPAT/PPATS, Sistem | Alur menambahkan validasi tambahan dengan input keterangan dan upload dokumen tambahan (optional). | `pat_8_validasi_tambahan` | Lampiran X |
| 4 | LTB Receive from PPAT | PPAT/PPATS, Sistem | Alur PPAT mengirim booking ke LTB dengan validasi kelengkapan booking dan update status. | `ltb_1_terima_berkas_sspd`, `pat_1_bookingsspd` | Lampiran X |
| 5 | LTB Generate No. Registrasi | LTB, Sistem | Alur generate nomor registrasi otomatis dengan format `YYYYO00001` (contoh: 2025O00001) menggunakan query MAX sequence. | `ltb_1_terima_berkas_sspd` | Lampiran X |
| 6 | LTB Accept/Reject | LTB, Sistem | Alur LTB memilih diterima atau ditolak dengan pilihan diterima → kirim ke Peneliti, atau ditolak → beri alasan dan notifikasi PPAT. | `ltb_1_terima_berkas_sspd`, `pat_1_bookingsspd`, `p_1_verifikasi` | Lampiran X |
| 7 | LSB Receive from Peneliti Validasi | Peneliti Validasi (Pejabat), Sistem | Alur Peneliti Validasi mengirim dokumen ke LSB dengan validasi data sebelum kirim dan update status. | `lsb_1_serah_berkas`, `pv_1_paraf_validate`, `pat_1_bookingsspd` | Lampiran X |
| 8 | LSB Manual Handover | LSB, Sistem | Alur serah terima dokumen oleh LSB kepada PPAT dengan verifikasi dokumen dan identitas PPAT, serta update status di database. | `lsb_1_serah_berkas`, `pat_1_bookingsspd` | Lampiran X |
| 9 | LSB Update Status | LSB, Sistem | Alur update status setelah handover dengan update `lsb_1_serah_berkas`, `pat_1_bookingsspd` (trackstatus='Diserahkan'), dan notifikasi ke PPAT. | `lsb_1_serah_berkas`, `pat_1_bookingsspd`, `pv_1_paraf_validate` | Lampiran X |

**Catatan:** 
- Nomor tabel (X) dan nomor lampiran (X) disesuaikan dengan urutan di dokumen final
- Semua activity diagram XML tersedia di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/`
- **Activity diagram yang masuk lampiran:** Activity_01, Activity_04, Activity_06, Activity_07, Activity_08, Activity_10 (atau Activity_09 jika Activity_10 dipilih untuk detail), Activity_11, Activity_12, Activity_13
- **Activity diagram yang masih menyusul (akan ditambahkan ke lampiran):** Activity_13_Peneliti_Receive, Activity_14_Peneliti_Verify, Activity_15_Peneliti_Paraf, Activity_16_Clear_to_Paraf, Activity_17_Peneliti_Validasi_Receive, Activity_18_Peneliti_Validasi_Final, Activity_19_LSB_Serah_Berkas
- Setelah semua 24 activity diagram selesai dibuat, semua activity diagram tambahan (selain 4 yang detail) akan dimasukkan ke lampiran dengan penjelasan singkat menggunakan format tabel yang sama

---

## ✅ CHECKLIST PEMINDAHAN

- [ ] Hapus bagian 1.5, 1.6, 1.7 dari BAB III
- [ ] Ganti dengan teks singkat di 1.4 Prosedur Kerja
- [ ] Tambahkan 4.1.1.1 Proses Pengembangan Iterasi 1 di BAB IV
- [ ] Tambahkan 4.1.2.1 Proses Pengembangan Iterasi 2 di BAB IV
- [ ] Tambahkan 4.1.3.1 Proses Pengembangan Iterasi 3 di BAB IV
- [ ] **Pindahkan Tabel 3: Simbol-Simbol Diagram** ke 4.1.1.1 bagian Quick Plan
- [ ] **Pindahkan Gambar 2: Activity Diagram Iterasi 1** ke 4.1.1.1 bagian Quick Plan
- [ ] **Pindahkan Gambar 3: Diagram Proses Bisnis Iterasi 1** ke 4.1.1.1 bagian Quick Design
- [ ] **Pindahkan Gambar 4: Usecase Diagram Iterasi 1** ke 4.1.1.1 bagian Quick Design
- [ ] **Pindahkan Gambar 5: Struktur Database** ke 4.1.1.1 bagian Quick Design
- [ ] **Pindahkan Tabel 4: Analisis Hasil** setelah 4.1.1.1 (sebelum tabel struktur database)
- [ ] **Pindahkan Tabel 5: Kebutuhan Fungsional** setelah Tabel 4
- [ ] **Pindahkan Tabel 6: Relasi Database** setelah Tabel 5
- [ ] **Pindahkan Gambar 6: Activity Diagram Iterasi 2** ke 4.1.2.1 bagian Quick Design
- [ ] **Pindahkan Gambar 7: Diagram Proses Bisnis Iterasi 2** ke 4.1.2.1 bagian Quick Design
- [ ] **Pindahkan Gambar 8: Usecase Diagram Iterasi 2** ke 4.1.2.1 bagian Quick Design
- [ ] **Pindahkan Gambar 9: Activity Diagram Iterasi 3** ke 4.1.3.1 bagian Quick Plan
- [ ] **Pindahkan Gambar 10: Diagram Proses Bisnis Iterasi 3** ke 4.1.3.1 bagian Quick Design
- [ ] **Pindahkan Gambar 11: Usecase Diagram Iterasi 3** ke 4.1.3.1 bagian Quick Design
- [ ] **Tambahkan Activity Diagram Create Booking (Activity_02)** di 4.1.1.1 bagian Construction dengan penjelasan detail
- [ ] **Tambahkan Activity Diagram Generate No. Booking (Activity_03)** di 4.1.1.1 bagian Construction dengan penjelasan detail
- [ ] **Tambahkan Activity Diagram Upload Dokumen (Activity_05)** di 4.1.1.1 bagian Construction dengan penjelasan detail
- [ ] **Tambahkan Activity Diagram Validasi Proses (Activity_09 atau Activity_10)** di 4.1.1.1 bagian Construction dengan penjelasan detail
- [ ] **Tambahkan Tabel Deskripsi Activity Diagram Tambahan** di 4.1.1.1 setelah bagian Delivery and Feedback
- [ ] **Pindahkan 9 Activity Diagram ke Lampiran:**
  - [ ] Activity_01_Login_Register.xml
  - [ ] Activity_04_Add_Manual_Signature.xml
  - [ ] Activity_06_Add_Validasi_Tambahan.xml
  - [ ] Activity_07_LTB_Receive_from_PPAT.xml
  - [ ] Activity_08_LTB_Generate_No_Registrasi.xml
  - [ ] Activity_10_LTB_Accept_Reject.xml (atau Activity_09 jika Activity_10 dipilih untuk detail)
  - [ ] Activity_11_LSB_Receive_from_Peneliti_Validasi.xml
  - [ ] Activity_12_LSB_Manual_Handover.xml
  - [ ] Activity_13_LSB_Update_Status.xml
- [ ] Update nomor gambar dan tabel sesuai urutan baru di BAB IV
- [ ] Update nomor lampiran untuk activity diagram
- [ ] Update daftar isi
- [ ] Cek konsistensi referensi antara teks, tabel, dan lampiran
