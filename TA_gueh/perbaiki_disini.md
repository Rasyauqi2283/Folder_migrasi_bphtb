# BAB I - PENDAHULUAN

## 1.1 Latar Belakang

Perkembangan teknologi informasi telah mendorong transformasi digital di berbagai sektor pemerintahan, termasuk dalam bidang pelayanan pajak daerah. Salah satu bentuk transformasi tersebut adalah implementasi sistem Elektronik Bea Perolehan Hak atas Tanah dan Bangunan (E-BPHTB) yang diterapkan oleh Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Sistem ini berfungsi sebagai sarana digital untuk memproses, mencatat, dan memverifikasi dokumen pajak BPHTB secara daring dengan tujuan meningkatkan efisiensi administrasi dan mengurangi ketergantungan terhadap proses manual.

Secara global, digitalisasi pelayanan publik telah menjadi bagian penting di era revolusi industri 4.0, di mana berbagai negara termasuk Indonesia, berupaya memanfaatkan teknologi informasi dan komunikasi (TIK) guna memperbaiki kualitas layanan pemerintah kepada masyarakat. Di Indonesia, penerapan layanan berbasis elektronik didukung oleh Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik serta Peraturan Pemerintah Nomor 11 Tahun 2019 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE). Khusus di Kabupaten Bogor, yang memiliki tingkat pertumbuhan ekonomi dan jumlah penduduk yang tinggi, sistem E-BPHTB menjadi langkah penting dalam upaya modernisasi pelayanan pajak daerah. Namun demikian, tantangan dalam pengelolaan waktu dan sumber daya manusia masih menjadi kendala utama dalam pelaksanaannya.

Berdasarkan hasil observasi lapangan, proses pelayanan masih menghadapi kendala dalam pengaturan jadwal pemeriksaan berkas, yang menyebabkan antrean panjang serta waktu tunggu yang lama. Hal ini umumnya terjadi karena wajib pajak tidak dapat menyesuaikan waktu pelayanan secara fleksibel, sehingga terjadi penumpukan berkas pada jam tertentu. Kondisi tersebut berdampak pada menurunnya efisiensi kerja dan tingkat kepuasan masyarakat. Oleh karena itu, inovasi berbasis teknologi seperti fitur pemesanan jadwal (booking online) diperlukan untuk memberikan kemudahan kepada wajib pajak dalam menentukan waktu pemeriksaan tanpa harus datang langsung ke kantor BAPPENDA. Fitur booking online menjadi solusi potensial untuk mengatasi permasalahan tersebut, dengan memberikan kemudahan kepada wajib pajak dalam melakukan pemesanan jadwal pemeriksaan dokumen tanpa harus datang langsung ke kantor. Digitalisasi proses administrasi publik mampu meningkatkan efisiensi pelayanan hingga 40% dengan mengurangi ketergantungan terhadap interaksi manual (Fachri, A 2023). Metode prototyping dalam rekayasa perangkat lunak memungkinkan pengembang menyesuaikan sistem secara cepat berdasarkan kebutuhan pengguna, sehingga hasil akhir lebih sesuai dengan ekspektasi fungsional (Siswidiyanto et al. 2021).

Dari simulasi internal yang dilakukan penulis, penerapan fitur booking online pada website E-BPHTB terbukti mampu memangkas waktu pelayanan dari rata-rata 50 menit per berkas menjadi sekitar 10-25 menit. Hal ini menunjukkan adanya peningkatan efisiensi signifikan dalam proses pelayanan publik. Efisiensi dan transparansi merupakan dua prinsip utama dalam manajemen keuangan daerah yang harus dijaga agar pelayanan publik dapat berjalan optimal dan akuntabel (Adzkia et al. 2024).

Selain itu, sejak pandemi COVID-19 pada tahun 2020, keberadaan layanan berbasis daring menjadi semakin penting. Pemerintah Indonesia, melalui Instruksi Presiden Nomor 3 Tahun 2020 tentang Kebijakan Percepatan Penanganan COVID-19, mendorong percepatan penerapan e-government guna mengurangi kontak langsung dan risiko penularan. Berdasarkan data BAPPENDA Kabupaten Bogor tahun 2022, jumlah transaksi BPHTB mencapai lebih dari 15.000 berkas per tahun, dengan lonjakan signifikan di akhir tahun akibat meningkatnya aktivitas jual beli properti. Tanpa adanya sistem pemesanan daring, antrean fisik dapat mencapai 50 hingga 100 orang per hari, yang tidak hanya memperlambat pelayanan tetapi juga meningkatkan risiko kesehatan. Fitur booking online menjadi solusi efektif untuk mengatur distribusi waktu pelayanan agar lebih merata dan efisien.

Secara teoritis, konsep e-government yang dikemukakan oleh Asmuddin (2025) menekankan bahwa transformasi digital harus berorientasi pada pengguna (user-centric). Layanan seperti sistem pemesanan daring tidak hanya bertujuan untuk efisiensi, tetapi juga inklusivitas. Beberapa negara seperti Singapura dan Estonia telah membuktikan bahwa sistem serupa mampu mengurangi waktu tunggu hingga 60% dan meningkatkan kepuasan pengguna sebesar 30%. Di Indonesia sendiri, contoh penerapan teknologi seperti e-KTP dan e-Samsat menunjukkan bahwa digitalisasi dapat memperkuat transparansi dan akuntabilitas pemerintah daerah. Dengan demikian, penelitian ini memiliki relevansi praktis dan teoretis dalam mendukung terwujudnya good governance, sekaligus sejalan dengan visi Kabupaten Bogor untuk menjadi daerah yang maju berbasis teknologi.

BPHTB merupakan salah satu sumber Pendapatan Asli Daerah (PAD) yang berperan penting dalam mendukung pembangunan daerah, sebagaimana diatur dalam Undang-Undang Nomor 28 Tahun 2009 tentang Pajak Daerah dan Retribusi Daerah. Di Kabupaten Bogor, kontribusi BPHTB terhadap PAD mencapai sekitar 10-15% per tahun. Namun, proses yang masih dilakukan secara manual kerap menimbulkan inefisiensi, seperti kesalahan pencatatan dan keterlambatan pembayaran. Penerapan sistem pemesanan daring diharapkan tidak hanya memperbaiki proses operasional, tetapi juga mendukung pencapaian Tujuan Pembangunan Berkelanjutan (SDGs), khususnya SDG 9 (Industri, Inovasi, dan Infrastruktur) dan SDG 16 (Keadilan, Perdamaian, dan Institusi yang Kuat).

Dari sisi sosial dan ekonomi, Kabupaten Bogor sebagai wilayah penyangga dengan aktivitas properti yang tinggi menghadapi tantangan dalam pengelolaan mobilitas masyarakat. Sebagian besar wajib pajak yang terdiri dari individu, pengembang, dan notaris (PPAT) sering kali memiliki keterbatasan waktu untuk mengurus administrasi secara langsung. Berdasarkan penelitian World Bank (2021), kemudahan akses terhadap layanan pajak dapat meningkatkan kepatuhan wajib pajak hingga 25%, yang pada akhirnya berkontribusi pada pembangunan infrastruktur seperti jalan, sekolah, dan fasilitas kesehatan. Dengan demikian, pengembangan fitur booking online bukan hanya inovasi teknis, tetapi juga strategi untuk memperkuat pelayanan publik dan mendukung pertumbuhan ekonomi berkelanjutan di Kabupaten Bogor. Oleh karena itu, penelitian ini berfokus pada perancangan dan pengembangan fitur booking online pada website E-BPHTB sebagai langkah untuk mendukung digitalisasi layanan pajak daerah di Kabupaten Bogor.

## 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah dipaparkan, maka urgensi penelitian ini difokuskan pada bagaimana perancangan fitur booking online pada Website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor. Adapun rumusan masalah secara spesifik adalah sebagai berikut:

1) Bagaimana **🟢 perancangan dan pengembangan** (❌ sebelumnya: penerapan) fitur booking online pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor?

2) Bagaimana tingkat efektivitas fitur booking online dalam meningkatkan efisiensi proses pelayanan pajak daerah?

## 1.3 Tujuan Penelitian

Berdasarkan rumusan masalah **🟢 di atas** (❌ sebelumnya: diatas), tujuan dalam penelitian ini yang ingin dicapai, yaitu:

1) **🟢 Merancang dan mengembangkan** (❌ sebelumnya: Mengembangkan dan mengimplementasikan) fitur booking online pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor.

2) Menganalisis tingkat efektivitas fitur booking online dalam meningkatkan efisiensi waktu dan akurasi pelayanan pajak daerah.

## 1.4 Manfaat Penelitian

Berdasarkan tujuan penelitian yang telah diuraikan, maka hasil penelitian ini diharapkan dapat memberikan manfaat bagi **🟢 berbagai pihak** (❌ sebelumnya: bagi, yaitu - tidak ada kata "berbagai pihak"), yaitu:

1) Bagi BAPPENDA Kabupaten Bogor: membantu mengurangi kepadatan antrian di loket serta mempermudah pengelolaan jadwal layanan.

2) Bagi masyarakat/PPAT: memberikan kemudahan dalam memesan jadwal layanan tanpa harus menunggu antrian panjang secara manual.

3) Bagi akademik/penelitian: menjadi referensi dalam implementasi e-government berbasis layanan digital, khususnya dalam penerapan fitur booking online.

## 1.5 Ruang Lingkup

Penelitian ini berfokus pada pengembangan dan implementasi fitur booking online pada website E-BPHTB di Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor. Ruang lingkup penelitian mencakup pengembangan sistem pemesanan jadwal pemeriksaan dokumen BPHTB secara daring, yang meliputi fitur pembuatan booking oleh PPAT/PPATS, validasi dokumen oleh LTB, pemeriksaan oleh Peneliti dan Peneliti Validasi, serta penyerahan dokumen oleh LSB. Sistem ini juga mencakup pengembangan fitur upload dokumen (akta tanah, sertifikat tanah, dokumen pelengkap), sistem tanda tangan digital, notifikasi real-time antar divisi, dan sistem kuotasi untuk manajemen beban kerja pegawai.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js untuk backend, HTML, CSS, JavaScript, dan Vite.js untuk frontend, serta PostgreSQL sebagai database. Sistem juga mengintegrasikan fitur keamanan dokumen melalui **🟢 sertifikat digital lokal** (❌ sebelumnya: sertifikat digital), QR Code untuk validasi, dan enkripsi AES-256. Pengujian sistem dilakukan melalui tiga iterasi prototyping dengan melibatkan pegawai BAPPENDA dari berbagai divisi, tanpa melibatkan pengujian langsung dengan masyarakat luas dalam skala besar. Pengembangan dilakukan dengan bimbingan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) sebagai mentor dan validator teknis, dengan review kode dan validasi alur sistem setiap minggu selama periode pengembangan **🟢 sekitar 10 bulan (November 2024 - September 2025)** (❌ sebelumnya: tidak ada informasi durasi).

---

## 📊 RINGKASAN PERUBAHAN YANG DILAKUKAN:

### 🔴 PERBAIKAN KRITIS (2):

**PERUBAHAN 1:**
- **Lokasi:** Bagian 1.5 Ruang Lingkup (kalimat terakhir paragraf 2)
- **Sebelum:** "Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital, QR Code untuk validasi, dan enkripsi AES-256."
- **Sesudah:** "Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital lokal, QR Code untuk validasi, dan enkripsi AES-256."
- **Alasan:** Akurasi; menegaskan sistem lokal BAPPENDA (bukan integrasi BSRE).

**PERUBAHAN 2:**
- **Lokasi:** Bagian 1.5 Ruang Lingkup (akhir kalimat terakhir)
- **Sebelum:** "...selama periode pengembangan."
- **Sesudah:** "...selama periode pengembangan sekitar 10 bulan (November 2024 - September 2025)."
- **Alasan:** Konsistensi dengan BAB IV.

---

### 🟡 PERBAIKAN STILISTIK (4):

**PERUBAHAN 3:**
- **Lokasi:** Bagian 1.2 Rumusan Masalah (butir 1)
- **Sebelum:** "Bagaimana penerapan fitur booking online..."
- **Sesudah:** "Bagaimana perancangan dan pengembangan fitur booking online..."
- **Alasan:** Konsistensi dengan fokus perancangan.

**PERUBAHAN 4:**
- **Lokasi:** Bagian 1.3 Tujuan Penelitian
- **Sebelum:** "Berdasarkan rumusan masalah diatas..."
- **Sesudah:** "Berdasarkan rumusan masalah di atas..."
- **Alasan:** Penulisan baku.

**PERUBAHAN 5:**
- **Lokasi:** Bagian 1.3 Tujuan Penelitian (butir 1)
- **Sebelum:** "Mengembangkan dan mengimplementasikan fitur booking online..."
- **Sesudah:** "Merancang dan mengembangkan fitur booking online..."
- **Alasan:** Konsistensi dengan judul.

**PERUBAHAN 6:**
- **Lokasi:** Bagian 1.4 Manfaat Penelitian
- **Sebelum:** "maka hasil penelitian ini diharapkan dapat memberikan manfaat bagi, yaitu:"
- **Sesudah:** "maka hasil penelitian ini diharapkan dapat memberikan manfaat bagi berbagai pihak, yaitu:"
- **Alasan:** Struktur kalimat lebih jelas.

---

## ✅ TIDAK ADA MASALAH:
- ✅ Karakter encoding (10-25 menit, 10-15%, dll) sudah benar
- ✅ Struktur dan alur logis BAB I sudah baik
- ✅ Konsistensi dengan metodologi prototyping sudah tepat
- ✅ Teknologi yang disebutkan sudah sesuai dengan BAB IV
