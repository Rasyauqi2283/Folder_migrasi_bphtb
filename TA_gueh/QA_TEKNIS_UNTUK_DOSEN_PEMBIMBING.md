# 📋 PERTANYAAN DAN JAWABAN TEKNIS UNTUK DOSEN PEMBIMBING

## 🎯 METODOLOGI PENGUJIAN

### **Q1: Apa itu Black Box Testing?**

**A:** Black box testing adalah metode pengujian perangkat lunak yang dilakukan tanpa mengetahui struktur internal program. Penguji hanya fokus pada input dan output sistem berdasarkan spesifikasi fungsional. Dalam penelitian ini, black box testing digunakan pada Iterasi 1 untuk memastikan aplikasi siap rilis dan berfungsi dengan baik dari perspektif pengguna tanpa perlu memahami kode program.

**Karakteristik:**
- Tidak memerlukan pengetahuan tentang struktur kode
- Fokus pada fungsionalitas sistem dari sudut pandang pengguna
- Menguji apakah sistem memenuhi requirement yang telah ditetapkan
- Efektif untuk menemukan bug yang mengganggu pengalaman pengguna

**Contoh dalam penelitian:** Penguji diberikan akses ke sistem staging dan diminta menguji semua fitur sesuai skenario kasus nyata (login, booking, upload dokumen, tracking status) tanpa mengetahui bagaimana kode diimplementasikan.

---

### **Q2: Apa itu White Box Testing?**

**A:** White box testing adalah metode pengujian perangkat lunak yang dilakukan dengan memeriksa struktur internal program, logika algoritma, dan alur kode. Penguji memiliki akses penuh terhadap kode sumber untuk memastikan implementasi keamanan dan logika bisnis berfungsi dengan benar. Dalam penelitian ini, white box testing digunakan pada Iterasi 2 untuk memvalidasi algoritma enkripsi AES-256, logika pembuatan sertifikat digital lokal, dan mekanisme audit trail.

**Karakteristik:**
- Memerlukan pengetahuan tentang struktur kode dan algoritma
- Fokus pada validasi logika internal dan implementasi teknis
- Menguji jalur eksekusi kode (code coverage)
- Efektif untuk memastikan keamanan dan integritas algoritma

**Contoh dalam penelitian:** Pengujian dilakukan dengan memeriksa kode untuk memastikan enkripsi AES-256 diimplementasikan dengan benar, sertifikat digital di-generate sesuai algoritma yang dirancang, dan audit trail mencatat semua aktivitas dengan akurat.

---

### **Q3: Apa itu Hybrid Testing?**

**A:** Hybrid testing adalah kombinasi antara black box testing dan white box testing dalam satu siklus pengujian. White box testing digunakan untuk validasi algoritma dan logic flow, sedangkan black box testing digunakan untuk validasi fungsionalitas end-to-end dari perspektif pengguna. Dalam penelitian ini, hybrid testing digunakan pada Iterasi 3 untuk memastikan sistem kuotasi yang kompleks berfungsi dengan baik sebelum go live.

**Karakteristik:**
- Menggabungkan kelebihan black box dan white box testing
- White box: validasi algoritma, logika, dan implementasi teknis
- Black box: validasi fungsionalitas dan user experience
- Memberikan coverage pengujian yang lebih komprehensif

**Contoh dalam penelitian:** 
- **White box:** Memvalidasi algoritma kuotasi dinamis, logika priority queue, dan mekanisme load balancing
- **Black box:** Memastikan sistem dapat mengelola kuota harian 80 dokumen dengan baik, booking yang melebihi kuota masuk ke antrean dengan benar, dan dashboard monitoring menampilkan informasi akurat

---

### **Q4: Apa itu Staging Environment?**

**A:** Staging environment adalah lingkungan pengujian yang menyerupai lingkungan produksi (production) namun terpisah dan digunakan khusus untuk pengujian sebelum sistem di-deploy ke produksi. Staging environment memiliki konfigurasi yang sama dengan produksi, termasuk database, server, dan infrastruktur, sehingga dapat menguji sistem dalam kondisi yang mendekati real.

**Karakteristik:**
- **Mirip dengan produksi:** Konfigurasi server, database, dan infrastruktur sama dengan produksi
- **Terpisah dari produksi:** Data dan operasi di staging tidak mempengaruhi sistem produksi
- **Untuk pengujian:** Digunakan untuk pengujian fungsional, integrasi, dan user acceptance testing
- **Data uji:** Menggunakan data dummy atau copy data produksi untuk pengujian

**Kegunaan dalam penelitian:**
1. **Pengujian aman:** Menguji sistem tanpa risiko mengganggu operasional produksi
2. **Validasi end-to-end:** Menguji seluruh alur kerja dari booking hingga serah terima dokumen
3. **User acceptance testing:** Pengguna (PPAT, LTB, Peneliti, dll) dapat menguji sistem sebelum go live
4. **Identifikasi bug:** Menemukan dan memperbaiki bug sebelum deploy ke produksi

**Implementasi dalam penelitian:** Sistem di-deploy ke staging environment menggunakan Railway sebagai platform cloud. Penguji diberikan akses ke staging untuk menguji semua fitur sesuai skenario kasus nyata. Setelah semua pengujian dan feedback terakomodasi, sistem baru di-deploy ke produksi.

**Perbedaan dengan Development dan Production:**
- **Development:** Lingkungan untuk development dan testing awal (lokal)
- **Staging:** Lingkungan untuk pengujian final sebelum produksi (mirip produksi)
- **Production:** Lingkungan live yang digunakan pengguna akhir (sistem operasional)

---

### **Q38: Mengapa Iterasi 1 menggunakan Black Box Testing, Iterasi 2 menggunakan White Box Testing, dan Iterasi 3 menggunakan Hybrid Testing?**

**A:** Pemilihan metodologi pengujian untuk setiap iterasi didasarkan pada karakteristik dan kompleksitas fitur yang dikembangkan di masing-masing iterasi:

**1. Iterasi 1: Black Box Testing**

**Alasan pemilihan:**
- **Fokus pada fungsionalitas dasar:** Iterasi 1 mengembangkan fondasi sistem dengan fitur-fitur dasar seperti booking online, upload dokumen, tracking status, dan workflow antar divisi. Fitur-fitur ini bersifat fungsional dan dapat diuji dari perspektif pengguna tanpa perlu memahami implementasi teknis.
- **Validasi requirement:** Tujuan utama adalah memastikan sistem memenuhi requirement fungsional yang telah ditetapkan. Black box testing efektif untuk memvalidasi apakah sistem berfungsi sesuai dengan spesifikasi dari sudut pandang pengguna akhir.
- **Kesederhanaan implementasi:** Fitur-fitur di Iterasi 1 relatif sederhana dan tidak memerlukan validasi algoritma kompleks atau mekanisme keamanan tingkat lanjut. Pengujian dari perspektif pengguna sudah cukup untuk memastikan sistem berfungsi dengan baik.
- **Efisiensi waktu:** Black box testing lebih cepat dilakukan karena tidak memerlukan analisis kode. Penguji dapat langsung menguji sistem sesuai skenario kasus nyata tanpa perlu memahami struktur internal program.
- **User-centric validation:** Iterasi 1 adalah iterasi pertama yang akan digunakan oleh pengguna aktual (PPAT, LTB, Peneliti, dll). Black box testing memastikan sistem mudah digunakan dan intuitif dari perspektif pengguna.

**Hasil:** Black box testing berhasil mengidentifikasi 15 butir uji dengan 100% success rate, memastikan semua fitur dasar berfungsi dengan baik dan siap untuk digunakan oleh pengguna.

---

**2. Iterasi 2: White Box Testing**

**Alasan pemilihan:**
- **Fokus pada keamanan dan algoritma kompleks:** Iterasi 2 mengembangkan fitur-fitur keamanan tingkat lanjut seperti enkripsi AES-256, sertifikat digital lokal (ECDSA-P256), QR code ganda dengan HMAC-SHA256, dan mekanisme audit trail. Fitur-fitur ini memerlukan validasi implementasi teknis dan algoritma yang tidak dapat diuji hanya dari perspektif pengguna.
- **Validasi keamanan:** Keamanan sistem adalah prioritas utama di Iterasi 2. White box testing memungkinkan penguji memeriksa kode untuk memastikan enkripsi diimplementasikan dengan benar, tidak ada vulnerability, dan mekanisme keamanan berfungsi sesuai standar.
- **Validasi algoritma:** Algoritma seperti ECDSA-P256 untuk sertifikat digital, scrypt untuk enkripsi passphrase, dan HMAC-SHA256 untuk QR payload signing memerlukan validasi bahwa implementasinya sesuai dengan spesifikasi algoritma yang dirancang.
- **Code coverage:** White box testing memastikan semua jalur eksekusi kode (code coverage) telah diuji, termasuk edge case dan error handling yang mungkin tidak terdeteksi oleh black box testing.
- **Integritas data:** Sistem audit trail dan mekanisme validasi memerlukan verifikasi bahwa semua aktivitas dicatat dengan akurat dan data tidak dapat dimanipulasi.

**Contoh pengujian:**
- Memeriksa implementasi enkripsi AES-256 untuk memastikan kunci 256-bit digunakan dengan benar
- Memvalidasi algoritma generate sertifikat digital lokal (serial number, fingerprint, validitas)
- Memastikan audit trail mencatat semua aktivitas penting dengan timestamp dan user information
- Memverifikasi mekanisme validasi QR code dan digital signature

**Hasil:** White box testing berhasil mengidentifikasi 11 butir uji dengan 100% success rate, memastikan semua fitur keamanan dan algoritma kompleks diimplementasikan dengan benar dan aman.

---

**3. Iterasi 3: Hybrid Testing**

**Alasan pemilihan:**
- **Kompleksitas sistem kuotasi:** Iterasi 3 mengembangkan sistem kuotasi dinamis yang melibatkan algoritma kompleks (priority queue, load balancing, predictive scheduling) dan interaksi dengan pengguna. Sistem ini memerlukan validasi baik dari sisi teknis (algoritma) maupun fungsionalitas (user experience).
- **Kombinasi validasi:** 
  - **White box:** Memvalidasi algoritma kuotasi dinamis, logika priority queue, mekanisme load balancing, dan distribusi UPT
  - **Black box:** Memastikan sistem dapat mengelola kuota harian 80 dokumen dengan baik, booking yang melebihi kuota masuk ke antrean dengan benar, dan dashboard monitoring menampilkan informasi akurat dari perspektif pengguna
- **Validasi end-to-end:** Sistem kuotasi mempengaruhi seluruh alur kerja dari booking hingga serah terima dokumen. Hybrid testing memastikan algoritma bekerja dengan benar (white box) dan pengalaman pengguna tetap baik (black box).
- **Coverage komprehensif:** Hybrid testing memberikan coverage pengujian yang lebih komprehensif dengan menggabungkan kelebihan black box (validasi fungsionalitas) dan white box (validasi algoritma).
- **Sistem kritis:** Sistem kuotasi adalah fitur kritis yang mempengaruhi operasional harian BAPPENDA. Pengujian yang komprehensif diperlukan untuk memastikan sistem berfungsi dengan baik sebelum go live.

**Contoh pengujian:**
- **White box:** 
  - Memvalidasi algoritma round-robin dengan bobot untuk distribusi UPT
  - Memastikan counter harian direset otomatis setiap pukul 00:00
  - Memverifikasi logika priority queue untuk dokumen urgent
- **Black box:**
  - Memastikan booking yang melebihi kuota 80 dokumen masuk ke antrean dengan benar
  - Memverifikasi notifikasi multi-level (70%, 85%, 95%) dikirim tepat waktu
  - Memvalidasi dashboard monitoring menampilkan informasi akurat (kuota terpakai, antrean, distribusi UPT)

**Hasil:** Hybrid testing berhasil mengidentifikasi 8 butir uji dengan 100% success rate, memastikan sistem kuotasi berfungsi dengan baik baik dari sisi algoritma maupun fungsionalitas pengguna.

---

**Kesimpulan:**

Pemilihan metodologi pengujian untuk setiap iterasi didasarkan pada prinsip **"right testing method for the right complexity"**:

- **Iterasi 1 (Black Box):** Fitur dasar → Validasi fungsionalitas dari perspektif pengguna
- **Iterasi 2 (White Box):** Fitur keamanan dan algoritma kompleks → Validasi implementasi teknis dan keamanan
- **Iterasi 3 (Hybrid):** Sistem kompleks dengan algoritma dan interaksi pengguna → Validasi komprehensif (teknis + fungsional)

Pendekatan ini memastikan setiap iterasi diuji dengan metodologi yang paling sesuai dengan karakteristik fitur yang dikembangkan, menghasilkan coverage pengujian yang optimal dan efisien.

---

### **Q39: Mengapa harus PPAT (Pejabat Pembuat Akta Tanah) yang mengajukan booking BPHTB? Mengapa tidak bisa langsung datang ke samsat seperti pajak kendaraan?**

**A:** PPAT (Pejabat Pembuat Akta Tanah) atau Notaris memiliki peran krusial dalam proses BPHTB karena konteks legal dan bisnis yang berbeda dengan pajak kendaraan. Berikut penjelasan lengkapnya:

**1. Konteks Legal dan Peraturan:**

- **BPHTB adalah Pajak atas Peralihan Hak atas Tanah dan/atau Bangunan:** BPHTB dikenakan ketika terjadi peralihan hak atas tanah dan/atau bangunan melalui jual beli, hibah, waris, atau peralihan hak lainnya. Proses ini memerlukan dokumen legal yang sah, yaitu Akta PPAT.
- **Akta PPAT adalah Dokumen Legal Wajib:** Menurut Undang-Undang No. 2 Tahun 2014 tentang Perubahan atas UU No. 4 Tahun 1996 tentang Hak Tanggungan, setiap peralihan hak atas tanah dan/atau bangunan harus dibuatkan Akta PPAT oleh Pejabat Pembuat Akta Tanah (PPAT) atau Notaris yang berwenang.
- **PPAT adalah Pejabat Berwenang:** PPAT adalah pejabat umum yang diangkat oleh Badan Pertanahan Nasional (BPN) untuk membuat akta peralihan hak atas tanah dan/atau bangunan. Hanya PPAT yang berwenang membuat akta jual beli tanah, hibah, waris, dan peralihan hak lainnya.

**2. Perbedaan dengan Pajak Kendaraan (PKB/STNK):**

- **Pajak Kendaraan (PKB):** 
  - Wajib pajak dapat langsung datang ke samsat dengan membawa dokumen kendaraan (BPKB, STNK lama)
  - Proses relatif sederhana: cek data kendaraan, hitung pajak, bayar, selesai
  - Tidak memerlukan dokumen legal khusus atau perantara
  - Data kendaraan sudah terdaftar di sistem samsat

- **BPHTB:**
  - Memerlukan Akta PPAT sebagai dokumen legal yang membuktikan terjadinya peralihan hak
  - Proses kompleks: melibatkan verifikasi dokumen tanah, perhitungan NJOP, validasi data wajib pajak dan pemilik objek pajak
  - Memerlukan dokumen pendukung lengkap (Sertifikat Tanah, Akta Jual Beli, dll)
  - Data belum terdaftar di sistem BAPPENDA, harus diinput dari awal

**3. Fungsi PPAT dalam Proses BPHTB:**

- **Membuat Akta Peralihan Hak:** PPAT membuat Akta PPAT yang membuktikan terjadinya peralihan hak atas tanah dan/atau bangunan. Akta ini adalah dokumen legal yang wajib ada sebelum proses BPHTB dapat dilakukan.
- **Mengumpulkan dan Memverifikasi Dokumen:** PPAT bertanggung jawab mengumpulkan dan memverifikasi kelengkapan dokumen yang diperlukan:
  - Sertifikat Tanah (SHM/SHGB/SHGU)
  - KTP dan NPWP wajib pajak dan pemilik objek pajak
  - Surat-surat pendukung lainnya
- **Menghitung dan Menyiapkan Data BPHTB:** PPAT menghitung BPHTB berdasarkan:
  - Nilai transaksi (harga jual beli)
  - Nilai NJOP (Nilai Jual Objek Pajak)
  - Tarif BPHTB yang berlaku
- **Mengajukan Booking ke BAPPENDA:** PPAT mengajukan booking ke BAPPENDA untuk proses validasi dan persetujuan BPHTB. PPAT bertindak sebagai perantara antara wajib pajak dan BAPPENDA.
- **Mengikuti Proses Validasi:** PPAT mengikuti proses validasi dari LTB, Peneliti, Peneliti Validasi, hingga LSB, dan menerima dokumen yang telah divalidasi untuk diserahkan kepada wajib pajak.

**4. Mengapa Tidak Bisa Langsung ke BAPPENDA (Seperti Samsat)?**

- **Kompleksitas Dokumen:** Proses BPHTB memerlukan banyak dokumen yang harus diverifikasi dan divalidasi oleh berbagai divisi (LTB, Peneliti, Peneliti Validasi). Proses ini tidak dapat dilakukan secara instan seperti di samsat.
- **Perhitungan Kompleks:** Perhitungan BPHTB melibatkan NJOP, nilai transaksi, tarif, dan berbagai faktor lainnya yang memerlukan verifikasi dan validasi oleh peneliti.
- **Proses Multi-Divisi:** Proses BPHTB melibatkan beberapa divisi:
  - LTB: Verifikasi kelengkapan dokumen
  - Bank: Verifikasi pembayaran
  - Peneliti: Pemeriksaan data dan perhitungan
  - Peneliti Validasi: Validasi final dan pemberian nomor validasi
  - LSB: Serah terima dokumen
- **Akurasi dan Validasi:** Sistem memastikan akurasi data dan validasi dokumen sebelum BPHTB disetujui. Proses ini memerlukan waktu dan tidak dapat dilakukan secara instan.
- **Tracking dan Audit Trail:** Sistem memerlukan tracking lengkap dari booking hingga serah terima dokumen untuk audit dan compliance.

**5. Keuntungan Sistem Booking Online dengan PPAT:**

- **Efisiensi:** PPAT dapat mengajukan booking secara online tanpa harus datang ke BAPPENDA
- **Tracking Real-time:** PPAT dapat melacak status booking secara real-time melalui sistem
- **Transparansi:** Proses menjadi lebih transparan dengan tracking status di setiap tahap
- **Pengurangan Waktu:** Waktu proses berkurang dari 30-40 menit menjadi 10-25 menit
- **Akurasi:** Sistem memastikan data yang diinput PPAT akurat dan lengkap sebelum diproses

**6. Peran PPAT dalam Konteks Penelitian:**

- **PPAT sebagai User Utama:** PPAT adalah user utama yang menggunakan sistem booking online untuk mengajukan BPHTB
- **PPAT sebagai Perantara:** PPAT bertindak sebagai perantara antara wajib pajak (pemilik tanah) dan BAPPENDA
- **PPAT sebagai Validator Awal:** PPAT melakukan validasi awal dengan mengumpulkan dan memverifikasi dokumen sebelum mengajukan booking
- **PPAT sebagai Penerima Dokumen:** PPAT menerima dokumen yang telah divalidasi dari LSB untuk diserahkan kepada wajib pajak

**Kesimpulan:**

PPAT adalah pihak yang wajib terlibat dalam proses BPHTB karena:
1. **Legal requirement:** Akta PPAT adalah dokumen legal wajib untuk peralihan hak
2. **Kompleksitas proses:** Proses BPHTB memerlukan verifikasi dan validasi multi-divisi yang tidak dapat dilakukan secara instan
3. **Peran sebagai perantara:** PPAT bertindak sebagai perantara yang memahami proses legal dan dapat membantu wajib pajak
4. **Akurasi data:** PPAT memastikan data yang diinput akurat dan lengkap sebelum diproses

Sistem booking online ini tidak menggantikan peran PPAT, melainkan mempermudah proses pengajuan BPHTB oleh PPAT dengan mengurangi waktu proses dan meningkatkan efisiensi.

---

## 🔐 KEAMANAN DAN SERTIFIKAT DIGITAL

### **Q5: Mengapa menggunakan sertifikat digital lokal, bukan integrasi dengan BSRE?**

**A:** Sistem menggunakan sertifikat digital lokal yang dikembangkan khusus untuk BAPPENDA karena:

1. **Kebutuhan spesifik:** BAPPENDA memerlukan sistem validasi dokumen yang disesuaikan dengan alur kerja internal, bukan standar eksternal
2. **Kontrol penuh:** Sistem lokal memberikan kontrol penuh terhadap proses validasi dan keamanan data
3. **Keterbatasan integrasi:** Integrasi dengan BSRE eksternal memerlukan koordinasi dengan pihak ketiga dan mungkin tidak sesuai dengan kebutuhan operasional BAPPENDA
4. **Implementasi cepat:** Sistem lokal dapat dikembangkan dan diimplementasikan lebih cepat sesuai dengan timeline penelitian

**Implementasi:** Sertifikat digital di-generate secara lokal di server BAPPENDA menggunakan algoritma enkripsi AES-256, dan hanya dapat divalidasi oleh pejabat yang berwenang (Kabid Pelayanan).

---

### **Q6: Bagaimana mekanisme enkripsi AES-256 bekerja dalam sistem?**

**A:** AES-256 (Advanced Encryption Standard dengan kunci 256-bit) digunakan untuk mengenkripsi dokumen sensitif selama proses pengiriman dan penyimpanan. Mekanisme kerjanya:

1. **Enkripsi saat upload:** Dokumen yang diunggah oleh PPAT/PPATS dienkripsi menggunakan kunci 256-bit sebelum disimpan ke database
2. **Penyimpanan terenkripsi:** Dokumen tersimpan dalam bentuk terenkripsi di database PostgreSQL
3. **Dekripsi saat akses:** Hanya pengguna yang memiliki hak akses (role-based) yang dapat mendekripsi dan mengakses dokumen
4. **Keamanan kunci:** Kunci enkripsi dikelola secara terpusat dan hanya dapat diakses oleh sistem dengan otentikasi yang tepat

**Alasan pemilihan:** AES-256 adalah standar enkripsi yang diakui secara internasional dan memenuhi standar keamanan data pemerintah daerah.

---

### **Q7: Bagaimana sistem QR Code ganda (publik dan internal) bekerja?**

**A:** Sistem menghasilkan dua jenis QR code untuk setiap dokumen yang divalidasi:

1. **QR Code Publik:**
   - Dapat diakses oleh pihak eksternal (PPAT, wajib pajak, dll)
   - Berisi informasi dasar: nomor dokumen, tanggal validasi, validator
   - Digunakan untuk verifikasi keaslian dokumen secara cepat
   - Dapat di-scan menggunakan aplikasi QR code reader standar

2. **QR Code Internal:**
   - Hanya dapat diakses oleh peneliti validasi dan admin BAPPENDA
   - Berisi informasi lengkap: detail dokumen, audit trail, sertifikat digital
   - Digunakan untuk validasi internal dan tracking dokumen
   - Di-scan melalui sistem internal BAPPENDA dengan autentikasi

**Keuntungan:** Pemisahan ini memungkinkan verifikasi publik tanpa membuka informasi sensitif, sementara validasi internal tetap memiliki akses ke data lengkap untuk audit dan tracking.

---

## 🔄 METODE PROTOTYPING DAN ITERASI

### **Q8: Mengapa menggunakan metode prototyping dengan 3 iterasi?**

**A:** Metode prototyping dengan 3 iterasi dipilih karena:

1. **Sifat iteratif:** Memungkinkan perbaikan sistem secara bertahap berdasarkan feedback pengguna
2. **Fleksibilitas:** Dapat menyesuaikan fitur sesuai kebutuhan operasional BAPPENDA yang terus berkembang
3. **Validasi langsung:** Setiap iterasi menghasilkan prototipe fungsional yang dapat diuji langsung oleh pengguna
4. **Efisiensi waktu:** Fokus pada fitur prioritas di setiap iterasi, bukan membangun semua fitur sekaligus

**Alur 3 iterasi:**
- **Iterasi 1:** Fondasi sistem (booking online dasar, tracking status)
- **Iterasi 2:** Integrasi layanan (Bank dan Peneliti Validasi terintegrasi online), peningkatan keamanan (sertifikat digital, QR code, enkripsi), dan otomatisasi proses
- **Iterasi 3:** Optimasi beban kerja (sistem kuotasi dinamis)

---

### **Q9: Bagaimana tahapan prototyping (Communication, Quick Plan, Quick Design, Construction, Delivery & Feedback) diterapkan?**

**A:** Setiap iterasi mengikuti 5 tahapan prototyping:

1. **Communication:** 
   - Wawancara dengan Kasubbid PSI untuk menggali kebutuhan
   - Observasi proses manual yang ada
   - Identifikasi masalah dan kebutuhan fungsional

2. **Quick Plan:**
   - Menyusun draft awal sistem berdasarkan kebutuhan
   - Identifikasi requirement fungsional
   - Validasi alur bisnis dengan stakeholder

3. **Quick Design:**
   - Pembuatan wireframe menggunakan Figma
   - Perancangan diagram UML (Activity, Use Case, Swimlane, ERD)
   - Presentasi dan validasi desain dengan Kasubbid PSI (2-3 iterasi desain)

4. **Construction:**
   - Implementasi kode menggunakan Node.js, Express.js, PostgreSQL
   - Pengembangan modular dengan struktur MVC
   - Unit testing sebelum integrasi
   - Review kode mingguan oleh Kasubbid PSI

5. **Delivery & Feedback:**
   - Pengujian sistem (black box/white box/hybrid sesuai iterasi)
   - Pengumpulan feedback dari pengguna
   - Evaluasi dan penyusunan action plan untuk iterasi berikutnya

---

## 📊 DIAGRAM UML DAN PEMODELAN

### **Q35: Apa itu Activity Diagram dan bagaimana penggunaannya dalam penelitian ini?**

**A:** Activity Diagram adalah diagram UML yang menggambarkan alur kerja (workflow) dan aktivitas yang dilakukan oleh aktor atau sistem dalam menyelesaikan suatu proses bisnis. Activity Diagram menggunakan simbol-simbol seperti activity (aktivitas), decision (keputusan), fork/join (paralel), dan swimlane (pembagian tanggung jawab).

**Karakteristik:**
- Menggambarkan alur kerja dari awal hingga akhir
- Menunjukkan urutan aktivitas dan kondisi decision
- Dapat menggunakan swimlane untuk menunjukkan pembagian tanggung jawab antar aktor
- Menggunakan simbol standar UML (oval untuk start/end, rounded rectangle untuk activity, diamond untuk decision)

**Penggunaan dalam penelitian:**
1. **Iterasi 1:** Dibuat 18 Activity Diagram yang menggambarkan alur kerja setiap use case utama:
   - Activity 1: Login/Register
   - Activity 2: Create Booking
   - Activity 3: Generate No. Booking
   - Activity 4: Add Manual Signature
   - Activity 5: Upload Document
   - Activity 6: Add Validasi Tambahan
   - Activity 7-13: Proses LTB, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB
   - Activity 14-17: Proses tambahan (Peneliti Receive, Paraf, Admin Monitor)
   - Activity Diagram Kompleks (3 bagian) yang menggabungkan seluruh alur dari PPAT hingga LSB

2. **Iterasi 2:** Dibuat 1 Activity Diagram baru:
   - Activity: Peneliti Validasi Final Validation (Iterasi 2) - menggambarkan proses validasi dengan sertifikat digital lokal, QR code, dan tanda tangan reusable

3. **Format:** Activity Diagram dibuat menggunakan Draw.io dengan format swimlane untuk menunjukkan pembagian tanggung jawab antar divisi (PPAT, LTB, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB, System)

**Kegunaan:**
- Sebagai blueprint untuk implementasi kode
- Memudahkan komunikasi dengan stakeholder (Kasubbid PSI) untuk validasi alur kerja
- Dokumentasi yang jelas untuk maintenance dan pengembangan selanjutnya
- Memastikan tidak ada aktivitas yang terlewat dalam implementasi

**Contoh dalam penelitian:** Activity Diagram "Create Booking" menggambarkan alur dari PPAT mengisi form booking, sistem melakukan validasi input, generate nomor booking, hingga menyimpan data ke database dengan semua decision point (valid/invalid input, success/error).

---

### **Q36: Apa itu Use Case Diagram dan bagaimana penggunaannya dalam penelitian ini?**

**A:** Use Case Diagram adalah diagram UML yang menggambarkan interaksi antara aktor (pengguna atau sistem eksternal) dengan fungsi-fungsi (use case) yang tersedia dalam sistem. Use Case Diagram menunjukkan siapa yang dapat melakukan apa dalam sistem.

**Karakteristik:**
- Menggambarkan fungsionalitas sistem dari perspektif pengguna
- Menunjukkan aktor (actor) dan use case (fungsi sistem)
- Menggunakan simbol standar UML (stick figure untuk aktor, oval untuk use case, garis untuk relasi)
- Dapat menunjukkan relasi include, extend, dan generalization

**Penggunaan dalam penelitian:**
1. **Iterasi 1:** Use Case Diagram menggambarkan:
   - **7 aktor utama:** PPAT/PPATS, LTB, Bank, Peneliti, Peneliti Paraf, Peneliti Validasi, LSB, Admin
   - **24 use case** yang mencakup seluruh proses booking online dari pendaftaran hingga serah terima dokumen
   - Use case utama: Create Booking, Upload Document, Validate Document, Verify Document, Give Paraf, Final Validation, Handover Document, dll.

2. **Iterasi 2:** Use Case Diagram diperbarui dengan tiga fokus utama:
   - **Integrasi Bank:** Penambahan use case untuk Bank sebagai produk online terintegrasi: Verify Payment Online, Check Payment Status, Update Payment Status, View Booking List
   - **Integrasi Peneliti Validasi:** Penambahan use case untuk Peneliti Validasi sebagai produk online terintegrasi: Final Validation Online, Generate Digital Certificate, Generate QR Code, Generate Validation Number, Select Reusable Signature, Send to LSB Online
   - **Keamanan dan Otomatisasi:** Penambahan use case: Validate QR Code, Encrypt Document, Audit Trail, Reusable Signature Management, Automated Notification

3. **Iterasi 3:** Use Case Diagram diperbarui dengan:
   - Penambahan use case: Manage Daily Quota, Queue Booking, Monitor Dashboard, Send Notification

**Kegunaan:**
- Memberikan gambaran umum fungsionalitas sistem
- Memastikan semua kebutuhan fungsional tercakup
- Sebagai acuan awal dalam proses pengembangan perangkat lunak
- Memudahkan komunikasi dengan stakeholder tentang fitur yang akan dikembangkan

**Contoh dalam penelitian:** Use Case Diagram menunjukkan bahwa aktor "PPAT/PPATS" dapat melakukan use case "Create Booking", "Upload Document", "Track Status", dan "Download Validated Document", sementara aktor "Peneliti Validasi" dapat melakukan use case "Final Validation", "Generate Digital Certificate", dan "Generate QR Code".

---

### **Q37: Apa itu Diagram Proses Bisnis (Business Process Diagram) dan bagaimana penggunaannya dalam penelitian ini?**

**A:** Diagram Proses Bisnis (Business Process Diagram) adalah diagram yang menggambarkan alur kerja bisnis secara menyeluruh, menunjukkan pembagian tanggung jawab dan alur kerja antar divisi dalam suatu organisasi. Diagram ini mirip dengan Swimlane Diagram namun lebih fokus pada proses bisnis secara keseluruhan daripada detail teknis.

**Karakteristik:**
- Menggambarkan alur kerja bisnis dari awal hingga akhir
- Menunjukkan pembagian tanggung jawab antar divisi (swimlane)
- Fokus pada proses bisnis, bukan detail implementasi teknis
- Menunjukkan urutan kegiatan yang dilakukan oleh masing-masing aktor secara berkesinambungan

**Penggunaan dalam penelitian:**
1. **Iterasi 1:** Diagram Proses Bisnis menggambarkan:
   - **6 divisi utama:** PPAT (pengajuan dan upload), LTB (verifikasi berkas), Peneliti/Paraf (pemeriksaan data persetujuan digital), Peneliti Validasi (validasi akhir), LSB (serah terima)
   - **Alur kerja lengkap:** Dari pendaftaran booking hingga dokumen dinyatakan sah dan diterima
   - **13 tabel database** yang mendukung proses bisnis
   - **Estimasi waktu:** 10-25 menit per dokumen

2. **Format:** Diagram dibuat menggunakan Draw.io dengan format horizontal flow (kiri ke kanan) atau vertikal (atas ke bawah), dengan setiap divisi sebagai kolom/lane

**Kegunaan:**
- Meningkatkan efisiensi proses bisnis
- Mengurangi kemungkinan terjadinya overlapping antar divisi
- Memfasilitasi pengembangan sistem yang berorientasi pada kebutuhan pengguna (user-centric design)
- Sebagai dokumentasi proses bisnis yang jelas untuk semua stakeholder

**Perbedaan dengan Activity Diagram:**
- **Diagram Proses Bisnis:** Fokus pada alur bisnis secara menyeluruh, menunjukkan divisi dan tanggung jawab, lebih high-level
- **Activity Diagram:** Fokus pada detail aktivitas teknis, menunjukkan decision point dan alur sistem, lebih detail dan teknis

**Contoh dalam penelitian:** 
- **Iterasi 1:** Diagram Proses Bisnis menunjukkan bahwa proses dimulai dari PPAT membuat booking dan upload dokumen, kemudian dokumen dikirim ke LTB untuk verifikasi. Jika diterima, dokumen dikirim ke Peneliti untuk pemeriksaan, kemudian ke Peneliti Paraf untuk paraf, lalu ke Peneliti Validasi untuk validasi final (masih manual), dan akhirnya ke LSB untuk serah terima. Setiap divisi memiliki tanggung jawab yang jelas dan urutan kegiatan yang terstruktur.

- **Iterasi 2:** Diagram Proses Bisnis diperbarui untuk mencerminkan integrasi Bank dan Peneliti Validasi sebagai produk online terintegrasi:
  - **Bank terintegrasi:** Bank dapat mengakses sistem untuk verifikasi pembayaran secara online dan real-time, terintegrasi dengan alur LTB
  - **Peneliti Validasi terintegrasi:** Peneliti Validasi melakukan validasi final secara online dengan sertifikat digital lokal, QR code, dan tanda tangan reusable, terintegrasi dengan alur dari Clear to Paraf ke LSB
  - **Otomatisasi:** Proses pengiriman antar divisi menjadi lebih otomatis dengan notifikasi real-time
  - **Keamanan:** Setiap dokumen yang divalidasi memiliki sertifikat digital dan QR code untuk validasi keaslian

**Relevansi:** Diagram Proses Bisnis memiliki relevansi penting dalam tahapan prototyping karena mampu meningkatkan efisiensi proses bisnis, mengurangi kemungkinan terjadinya overlapping antar divisi, serta memfasilitasi pengembangan sistem yang berorientasi pada kebutuhan pengguna. Diagram Proses Bisnis Iterasi 2 menunjukkan evolusi sistem dari proses manual menjadi proses digital terintegrasi dengan Bank dan Peneliti Validasi sebagai produk online.

---

## 📊 SISTEM KUOTASI

### **Q10: Bagaimana algoritma kuotasi dinamis bekerja?**

**A:** Algoritma kuotasi dinamis mengelola kapasitas booking harian dengan 6 komponen utama:

1. **Kuota Harian Dinamis:** 
   - Ditetapkan 80 dokumen untuk BPHTB berdasarkan analisis kapasitas peneliti (85-115 orang untuk 9 jenis pajak)
   - Counter harian direset otomatis setiap pukul 00:00

2. **Priority Queue:**
   - Dokumen urgent mendapat prioritas tinggi
   - Prioritas berdasarkan jenis pajak dan kompleksitas

3. **Load Balancing:**
   - Distribusi merata antar UPT (Unit Pelaksana Teknis)
   - Round-robin dengan bobot berdasarkan kapasitas per UPT

4. **Predictive Scheduling:**
   - Estimasi waktu berdasarkan pola historis per wilayah UPT
   - Prediksi beban kerja berdasarkan data historis

5. **Notifikasi Multi-level:**
   - Peringatan otomatis saat kuota mencapai 70%, 85%, dan 95%
   - Notifikasi dikirim ke admin dan PPAT

6. **Distribusi UPT:**
   - Distribusi berbasis lokasi PPAT dan kapasitas UPT terdekat
   - Memastikan pelayanan merata di seluruh wilayah

**Implementasi:** Algoritma diimplementasikan menggunakan round-robin dengan bobot, dan booking yang melebihi kuota masuk ke antrean (ppatk_send_queue) untuk diproses hari berikutnya.

---

### **Q11: Mengapa kuota harian ditetapkan 80 dokumen untuk BPHTB?**

**A:** Kuota 80 dokumen ditetapkan berdasarkan analisis kapasitas BAPPENDA:

1. **Total kapasitas peneliti:** 85-115 orang (dari 10-13 UPT dengan 5-7 peneliti per UPT + kantor pusat)
2. **Jenis pajak:** BAPPENDA mengelola 9 jenis pajak (BPHTB, PBB, Perhotelan, Burung Walet, Hiburan, Reklame, Penerangan Jalan, Parkir, Air Tanah)
3. **Alokasi proporsional:** Kapasitas peneliti dibagi untuk semua jenis pajak, sehingga untuk BPHTB dialokasikan kuota harian 80 dokumen
4. **Kapasitas optimal:** Analisis menunjukkan kapasitas optimal 80-100 booking per hari, namun ditetapkan 80 untuk memberikan buffer dan mencegah overload

**Dampak:** Dengan kuota ini, beban kerja pegawai berkurang 40% dan waktu rata-rata pemrosesan turun dari 20 menit menjadi 15 menit per dokumen.

---

## 🗄️ DATABASE DAN ARSITEKTUR

### **Q12: Mengapa menggunakan PostgreSQL sebagai database, bukan MySQL atau Oracle?**

**A:** PostgreSQL dipilih setelah mempertimbangkan kebutuhan sistem dan perbandingan dengan alternatif lain. Selain faktor open source (gratis) yang sesuai dengan kebutuhan BAPPENDA, PostgreSQL dipilih karena:

1. **ACID Compliance yang Ketat:**
   - PostgreSQL memiliki implementasi ACID yang lebih ketat dibandingkan MySQL, terutama untuk transaksi kompleks
   - Menurut penelitian oleh Kumar et al. (2022), PostgreSQL menunjukkan konsistensi data 99.9% pada transaksi concurrent, lebih tinggi dibandingkan MySQL (98.5%)
   - Untuk sistem pemerintahan yang memerlukan integritas data tinggi, ACID compliance yang ketat sangat penting

2. **Advanced Features untuk Data Kompleks:**
   - PostgreSQL mendukung fitur advanced seperti JSON, array, dan full-text search yang tidak tersedia di MySQL
   - Menurut Sari dan Wijaya (2023), PostgreSQL lebih unggul dalam menangani data terstruktur kompleks dengan relasi many-to-many yang banyak
   - Sistem ini memiliki 13+ tabel dengan relasi foreign key yang kompleks, sehingga memerlukan database yang mendukung fitur advanced

3. **Performance pada Concurrent Access:**
   - PostgreSQL menggunakan MVCC (Multi-Version Concurrency Control) yang lebih efisien untuk concurrent read/write
   - Penelitian oleh Pratama et al. (2024) menunjukkan PostgreSQL memiliki throughput 40% lebih tinggi dibandingkan MySQL pada beban concurrent tinggi
   - Sistem ini akan menangani 80 booking per hari dengan multiple user concurrent, sehingga performa concurrent sangat penting

4. **Perbandingan dengan Oracle:**
   - **Oracle:** Enterprise-grade dengan fitur lengkap, namun memerlukan biaya lisensi tinggi (tidak sesuai dengan kebutuhan BAPPENDA)
   - **PostgreSQL:** Fitur yang hampir setara dengan Oracle untuk kebutuhan aplikasi web, namun open source
   - Menurut Dewi dan Hidayat (2021), PostgreSQL dapat menjadi alternatif yang efektif untuk Oracle dalam aplikasi pemerintahan dengan budget terbatas

5. **Perbandingan dengan MySQL:**
   - **MySQL:** Lebih ringan dan cepat untuk aplikasi sederhana, namun kurang optimal untuk transaksi kompleks
   - **PostgreSQL:** Lebih robust untuk aplikasi enterprise dengan transaksi kompleks dan data integrity yang tinggi
   - Untuk sistem pemerintahan yang memerlukan audit trail lengkap dan integritas data, PostgreSQL lebih sesuai

6. **Stabilitas dan Maturity:**
   - PostgreSQL telah digunakan selama lebih dari 30 tahun dan memiliki komunitas yang besar
   - Menurut Nugroho (2023), PostgreSQL memiliki track record yang baik dalam aplikasi pemerintahan dengan uptime 99.7%+
   - Database yang mature dan terpercaya untuk aplikasi enterprise

7. **Compliance dan Security:**
   - PostgreSQL memiliki fitur security yang lebih lengkap dibandingkan MySQL (row-level security, encryption at rest)
   - Untuk data pemerintahan yang sensitif, fitur security yang lengkap sangat penting
   - Mendukung compliance dengan standar keamanan data pemerintah daerah

**Kesimpulan:** PostgreSQL dipilih karena kombinasi fitur advanced, performa concurrent yang baik, ACID compliance yang ketat, dan open source. Meskipun MySQL lebih ringan, PostgreSQL lebih sesuai untuk aplikasi enterprise dengan transaksi kompleks. Meskipun Oracle lebih lengkap, PostgreSQL memberikan value yang lebih baik untuk kebutuhan BAPPENDA dengan budget terbatas.

**Struktur:** Database dirancang dengan 13 tabel utama pada Iterasi 1, ditambah 9 tabel baru pada Iterasi 2, dan 2 tabel baru pada Iterasi 3, dengan relasi foreign key yang memastikan integritas referensial. PostgreSQL mendukung semua fitur ini dengan performa optimal.

---

### **Q13: Bagaimana struktur MVC (Model-View-Controller) diterapkan?**

**A:** Struktur MVC diterapkan untuk memisahkan concern dan memudahkan maintenance:

1. **Model:**
   - Mewakili struktur data dan relasi database
   - Menangani query ke PostgreSQL
   - Validasi data sebelum disimpan

2. **View:**
   - Antarmuka pengguna (HTML, CSS, JavaScript dengan Vite.js)
   - Menampilkan data dari controller
   - Menangani interaksi pengguna

3. **Controller:**
   - Menghubungkan Model dan View
   - Menangani logika bisnis
   - Memproses request dari frontend dan mengirim response

**Keuntungan:** Pemisahan ini memudahkan pengembangan modular, testing, dan maintenance. Setiap komponen dapat dikembangkan dan diuji secara independen.

---

## 🔍 VALIDASI DAN AUDIT TRAIL

### **Q14: Bagaimana sistem audit trail bekerja?**

**A:** Sistem audit trail mencatat semua aktivitas yang terjadi pada dokumen dalam tabel `pv_7_audit_log`:

1. **Aktivitas yang dicatat:**
   - Login/logout pengguna
   - Upload dokumen
   - Perubahan status dokumen
   - Validasi dan persetujuan
   - Pengiriman antar divisi

2. **Informasi yang disimpan:**
   - User ID dan role
   - Timestamp aktivitas
   - Jenis aktivitas
   - ID dokumen terkait
   - Status sebelum dan sesudah

3. **Kegunaan:**
   - Tracking history perubahan dokumen
   - Audit keamanan
   - Troubleshooting masalah
   - Compliance dan accountability

**Implementasi:** Setiap perubahan status atau aktivitas penting otomatis dicatat ke audit log dengan timestamp dan user information.

---

### **Q15: Bagaimana validasi dokumen dilakukan oleh Peneliti Validasi di Iterasi 2?**

**A:** Di Iterasi 2, Peneliti Validasi didaftarkan menjadi produk online yang terintegrasi dengan layanan sistem. Proses validasi dilakukan secara digital dan terintegrasi dengan langkah-langkah berikut:

1. **Konteks integrasi (Iterasi 2):**
   - **Sebelum Iterasi 2:** Peneliti Validasi melakukan validasi secara manual dengan tanda tangan manual dan drop gambar tanda tangan
   - **Iterasi 2:** Peneliti Validasi terintegrasi sebagai produk online dengan antarmuka khusus dan proses validasi digital yang otomatis
   - Peneliti Validasi menjadi bagian dari alur kerja digital yang terhubung dengan sistem booking online

2. **Proses validasi terintegrasi:**
   - **Akses dokumen:** Peneliti Validasi mengakses dokumen yang sudah melalui tahap verifikasi dan paraf melalui antarmuka online
   - **Pemeriksaan akhir:** Memeriksa kelengkapan dan keakuratan data melalui sistem online
   - **Pilih tanda tangan reusable:** Sistem menggunakan tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` (tidak perlu upload manual setiap kali)
   - **Generate sertifikat digital lokal:** Sistem menghasilkan sertifikat digital lokal yang dienkripsi dengan AES-256 secara otomatis
   - **Generate QR code ganda:** Sistem menghasilkan QR code ganda (publik dan internal) secara otomatis
   - **Generate nomor validasi:** Sistem menghasilkan nomor validasi dengan format 7acak-3acak
   - **Embed ke dokumen:** QR code dan sertifikat digital disisipkan ke dokumen validasi secara otomatis
   - **Update status:** Status dokumen diubah menjadi "terverifikasi" dan siap diserahkan ke LSB
   - **Notifikasi otomatis:** Sistem mengirim notifikasi ke LSB dan email ke PPAT secara otomatis

3. **Database dan integrasi:**
   - `pv_1_paraf_validate`: Tabel utama untuk validasi dengan kolom `created_at` dan catatan "Iterasi 2 - Digital Certificate Integration"
   - `pv_2_signing_requests`: Menyimpan request penandatanganan dengan relasi ke `pv_1_paraf_validate`
   - `pv_local_certs`: Menyimpan sertifikat digital lokal dengan relasi ke `a_2_verified_users`
   - `pv_7_audit_log`: Menyimpan audit trail untuk semua aktivitas validasi
   - `pat_7_validasi_surat`: Menyimpan nomor validasi dan status validasi

4. **Keuntungan integrasi:**
   - Proses validasi menjadi lebih cepat dan efisien (dari 15 menit menjadi 2 menit)
   - Tanda tangan reusable mengurangi waktu upload
   - Sertifikat digital dan QR code dihasilkan otomatis
   - Notifikasi otomatis ke LSB dan PPAT
   - Audit trail lengkap untuk semua aktivitas
   - Transparansi proses validasi

5. **Dampak pada proses bisnis:**
   - Peneliti Validasi menjadi bagian dari alur kerja digital yang terstruktur
   - Proses validasi menjadi lebih efisien dan terintegrasi
   - Mengurangi waktu tunggu dan koordinasi manual
   - Meningkatkan akurasi dan keamanan dokumen

**Keamanan:** Hanya pejabat yang berwenang (dengan role Peneliti Validasi) yang dapat melakukan proses ini, dan semua aktivitas dicatat dalam audit trail. Integrasi Peneliti Validasi ini merupakan salah satu dari tiga fokus utama Iterasi 2, bersama dengan integrasi Bank dan peningkatan keamanan sistem.

---

## 📈 HASIL DAN METRIK

### **Q16: Apa perbedaan metrik sebelum dan sesudah implementasi sistem?**

**A:** Perbandingan metrik menunjukkan peningkatan signifikan:

| Aspek | Sebelum (Manual) | Sesudah (Digital) | Peningkatan |
|-------|------------------|-------------------|-------------|
| Waktu proses per berkas | 30-40 menit (normal)<br>Hingga 2 jam (kompleks) | 10-25 menit | 33-87% lebih cepat |
| Validasi dokumen | 15 menit | 2 menit | 87% lebih cepat |
| Akurasi data | 85% | 95% | +10% |
| Akurasi QR code | - | 99,8% | Baru diterapkan |
| Tingkat kesalahan | ~10% | ~5% | -5% |
| Kepuasan PPAT | 65% | 88% | +23% |
| Kepuasan pegawai | 60% | 85% | +25% |
| Uptime sistem | - | 99,7% | Baru diterapkan |
| Beban kerja pegawai | 100% | 60% | -40% |

**Faktor peningkatan:** Otomatisasi proses, tracking real-time, validasi digital, dan sistem kuotasi yang mengelola beban kerja secara efisien.

---

## 🛠️ TEKNOLOGI DAN TOOLS

### **Q17: Mengapa menggunakan Node.js dan Express.js untuk backend?**

**A:** Node.js dan Express.js dipilih karena:

1. **JavaScript full-stack:** Konsistensi bahasa dengan frontend (JavaScript), memudahkan pengembangan
2. **Non-blocking I/O:** Efisien untuk aplikasi yang banyak melakukan operasi database dan file handling
3. **Ekosistem luas:** Banyak library dan package yang tersedia (npm)
4. **Express.js:** Framework ringan dan fleksibel untuk RESTful API
5. **Performance:** Cukup cepat untuk aplikasi web dengan concurrent users

**Implementasi:** Backend menggunakan Express.js untuk routing dan middleware, dengan koneksi ke PostgreSQL menggunakan library `pg` (node-postgres).

---

### **Q18: Mengapa menggunakan Vite.js untuk frontend?**

**A:** Vite.js dipilih karena:

1. **Development speed:** Hot Module Replacement (HMR) yang sangat cepat
2. **Build optimization:** Optimasi build yang lebih baik dibandingkan webpack tradisional
3. **Modern tooling:** Mendukung ES modules dan modern JavaScript features
4. **Lightweight:** Lebih ringan dan cepat dibandingkan bundler tradisional

**Implementasi:** Frontend menggunakan Vite.js untuk development dan build, dengan HTML, CSS, dan vanilla JavaScript (tanpa framework seperti React/Vue) untuk menjaga kesederhanaan dan performa.

---

## ✅ KESIMPULAN

### **Q19: Apa kontribusi utama dari penelitian ini?**

**A:** Kontribusi utama penelitian ini:

1. **Digitalisasi proses manual:** Mengubah proses booking dan validasi dokumen BPHTB dari manual menjadi digital end-to-end
2. **Integrasi layanan online:** Bank dan Peneliti Validasi didaftarkan menjadi produk online terintegrasi dengan sistem, memungkinkan verifikasi pembayaran dan validasi dokumen secara real-time dan terintegrasi
3. **Sistem keamanan komprehensif:** Implementasi sertifikat digital lokal, QR code ganda, dan enkripsi AES-256 untuk validasi keaslian dokumen
4. **Otomatisasi proses:** Tanda tangan reusable, notifikasi otomatis, dan pengiriman antar divisi yang terotomatisasi
5. **Optimasi beban kerja:** Sistem kuotasi dinamis yang mengelola kapasitas harian dan mengurangi beban kerja pegawai 40%
6. **Peningkatan efisiensi:** Waktu proses berkas berkurang 33-87%, validasi dokumen 87% lebih cepat
7. **Metodologi terstruktur:** Penerapan metode prototyping dengan 3 iterasi yang terdokumentasi dengan baik

**Dampak:** Sistem yang dihasilkan meningkatkan efisiensi pelayanan publik, transparansi proses, dan kepuasan pengguna (PPAT dan pegawai BAPPENDA). Integrasi Bank dan Peneliti Validasi sebagai produk online terintegrasi memungkinkan koordinasi yang lebih efisien dan real-time antara semua divisi yang terlibat dalam proses booking dan validasi dokumen.

---

## ⚠️ KETERBATASAN DAN TANTANGAN

### **Q20: Apa keterbatasan penelitian ini?**

**A:** Keterbatasan penelitian ini meliputi:

1. **Lingkup terbatas:** Sistem hanya dikembangkan untuk BPHTB di BAPPENDA Kabupaten Bogor, belum mencakup semua jenis pajak daerah
2. **Sertifikat digital lokal:** Menggunakan sistem sertifikat digital lokal, bukan integrasi dengan BSRE eksternal yang memiliki standar nasional
3. **Periode pengujian:** Pengujian dilakukan dalam periode terbatas (2-4 minggu per iterasi), belum mencakup pengujian jangka panjang
4. **Jumlah penguji:** Pengujian melibatkan 5-10 penguji per iterasi, belum mencakup semua 600 PPAT di Kabupaten Bogor
5. **Infrastruktur:** Sistem bergantung pada infrastruktur BAPPENDA dan platform Railway, belum diuji dengan beban maksimal

**Penjelasan:** Keterbatasan ini wajar dalam konteks penelitian tugas akhir dengan timeline dan sumber daya terbatas. Sistem dirancang untuk dapat dikembangkan lebih lanjut sesuai kebutuhan.

---

### **Q21: Bagaimana validitas dan reliabilitas data pengujian?**

**A:** Validitas dan reliabilitas data pengujian dijaga melalui:

1. **Validitas:**
   - **Content validity:** Test case dirancang berdasarkan requirement fungsional yang telah divalidasi dengan Kasubbid PSI
   - **Construct validity:** Pengujian dilakukan sesuai dengan skenario kasus nyata di BAPPENDA
   - **Face validity:** Penguji adalah pengguna aktual (pegawai BAPPENDA dan PPAT) yang memahami konteks operasional

2. **Reliabilitas:**
   - **Test-retest:** Pengujian dilakukan berulang pada kondisi yang sama untuk memastikan konsistensi hasil
   - **Inter-rater reliability:** Beberapa penguji menguji fitur yang sama untuk memastikan hasil konsisten
   - **Dokumentasi:** Semua hasil pengujian didokumentasikan dengan jelas (tabel pengujian dengan ID butir uji)

3. **Triangulasi:**
   - Kombinasi black box, white box, dan hybrid testing
   - Feedback dari berbagai divisi (LTB, Peneliti, Admin, PPAT)
   - Validasi oleh Kasubbid PSI sebagai expert

**Hasil:** Semua butir uji menunjukkan success rate 100%, menandakan sistem berfungsi dengan baik dan konsisten.

---

## 🔒 KEAMANAN DAN AKSES

### **Q22: Bagaimana sistem role-based access control (RBAC) diimplementasikan?**

**A:** Sistem RBAC diimplementasikan dengan 8 role utama:

1. **PPAT/PPATS:**
   - Akses: Membuat booking, upload dokumen, tracking status, download dokumen validasi
   - Tidak dapat: Mengubah status dokumen, mengakses dokumen milik PPAT lain

2. **LTB (Loket Terima Berkas):**
   - Akses: Melihat daftar booking masuk, verifikasi dokumen, generate nomor registrasi, update status
   - Tidak dapat: Melakukan validasi final, mengubah data perhitungan BPHTB

3. **Bank:**
   - Akses: Verifikasi pembayaran, update status pembayaran
   - Tidak dapat: Mengubah data dokumen, melakukan validasi

4. **Peneliti:**
   - Akses: Melihat dokumen yang sudah diverifikasi LTB, melakukan pemeriksaan, update status verifikasi
   - Tidak dapat: Melakukan validasi final, generate sertifikat digital

5. **Peneliti Validasi (Pejabat):**
   - Akses: Validasi final, generate sertifikat digital lokal, generate QR code
   - Tidak dapat: Mengubah data booking, mengakses data pembayaran

6. **LSB (Loket Serah Berkas):**
   - Akses: Melihat dokumen yang sudah terverifikasi, menyerahkan dokumen ke PPAT
   - Tidak dapat: Mengubah status sebelum validasi, mengakses data perhitungan

7. **Admin:**
   - Akses: Dashboard monitoring, validasi QR code, mengelola notifikasi, monitoring sistem
   - Tidak dapat: Mengubah data booking, melakukan validasi dokumen

8. **System:**
   - Akses: Auto reset counter, generate reports, monitoring kuota
   - Otomatis tanpa intervensi manual

**Implementasi:** Setiap user memiliki credential unik dengan role yang ditetapkan di database. Middleware di backend memvalidasi role sebelum mengizinkan akses ke endpoint tertentu.

---

## 📊 SKALABILITAS DAN PERFORMANCE

### **Q23: Bagaimana sistem menangani skalabilitas dan beban tinggi?**

**A:** Sistem dirancang untuk skalabilitas melalui:

1. **Database optimization:**
   - Indexing pada kolom yang sering di-query (no_booking, trackstatus, tanggal)
   - Foreign key untuk integritas data tanpa mengorbankan performa
   - Connection pooling untuk mengelola koneksi database

2. **Load balancing:**
   - Sistem kuotasi dengan distribusi berbasis UPT
   - Round-robin untuk distribusi beban kerja
   - Priority queue untuk mengelola dokumen urgent

3. **Caching strategy:**
   - Session management untuk mengurangi query berulang
   - Cache untuk data yang jarang berubah (daftar UPT, jenis pajak)

4. **Asynchronous processing:**
   - Notifikasi real-time menggunakan sistem event-driven
   - Background job untuk generate sertifikat dan QR code

5. **Platform cloud (Railway):**
   - Auto-scaling berdasarkan beban
   - CDN untuk static assets

**Kapasitas:** Sistem dirancang untuk menangani 80 booking per hari untuk BPHTB, dengan kemampuan ekspansi untuk jenis pajak lain dan peningkatan kapasitas jika diperlukan.

---

### **Q24: Bagaimana sistem menangani backup dan disaster recovery?**

**A:** Strategi backup dan disaster recovery:

1. **Database backup:**
   - PostgreSQL memiliki fitur backup otomatis melalui Railway
   - Backup harian untuk data penting
   - Backup sebelum deploy major update

2. **File storage:**
   - Dokumen yang diunggah disimpan di cloud storage (Railway)
   - Replikasi data untuk redundancy

3. **Audit trail:**
   - Semua aktivitas dicatat di audit log
   - Memungkinkan recovery data melalui audit trail jika terjadi kehilangan data

4. **Version control:**
   - Kode sumber di version control (Git)
   - Memungkinkan rollback jika terjadi masalah

**Keterbatasan:** Dalam konteks penelitian, disaster recovery belum diuji secara menyeluruh. Untuk produksi, diperlukan strategi backup yang lebih komprehensif.

---

## 🔄 MAINTENANCE DAN SUSTAINABILITY

### **Q25: Bagaimana maintenance dan sustainability sistem setelah penelitian selesai?**

**A:** Rencana maintenance dan sustainability:

1. **Dokumentasi:**
   - Dokumentasi kode yang lengkap (inline comments, README)
   - Dokumentasi API endpoint
   - User manual untuk setiap role

2. **Training:**
   - Sosialisasi kepada 600 PPAT/PPATS di Kabupaten Bogor
   - Training untuk admin dan pegawai BAPPENDA
   - Sesi tanya jawab dan troubleshooting

3. **Support structure:**
   - Tim PSI BAPPENDA yang telah terlatih
   - Kasubbid PSI sebagai technical lead
   - Escalation path untuk masalah teknis

4. **Update dan improvement:**
   - Sistem dirancang modular untuk memudahkan update
   - Feedback mechanism untuk improvement berkelanjutan
   - Roadmap pengembangan untuk fitur tambahan

5. **Cost management:**
   - Platform Railway dengan pricing yang terjangkau
   - Monitoring penggunaan resource
   - Optimasi untuk mengurangi cost

**Sustainability:** Sistem dirancang untuk dapat di-maintain oleh tim BAPPENDA dengan dukungan teknis minimal, mengingat teknologi yang digunakan (Node.js, PostgreSQL) adalah teknologi yang umum dan mudah dipelajari.

---

## 📈 ANALISIS DAN PERBANDINGAN

### **Q26: Bagaimana sistem ini dibandingkan dengan sistem sejenis?**

**A:** Perbandingan dengan sistem sejenis:

1. **Sistem manual (sebelum penelitian):**
   - **Waktu proses:** 30-40 menit → 10-25 menit (33-87% lebih cepat)
   - **Akurasi:** 85% → 95% (+10%)
   - **Tracking:** Manual → Real-time digital
   - **Keamanan:** Dokumen fisik → Enkripsi AES-256 + sertifikat digital

2. **Sistem E-BPHTB lain (jika ada):**
   - **Kelebihan penelitian ini:**
     - Sistem kuotasi dinamis yang mengelola beban kerja
     - Sertifikat digital lokal yang disesuaikan kebutuhan
     - QR code ganda (publik dan internal)
     - Audit trail lengkap
   - **Kekurangan:**
     - Belum terintegrasi dengan BSRE nasional
     - Scope terbatas pada BPHTB (belum semua jenis pajak)

3. **Sistem booking online umum:**
   - **Kelebihan:** Disesuaikan dengan alur kerja BPHTB yang kompleks
   - **Kekurangan:** Tidak dapat digunakan untuk booking umum (spesifik BPHTB)

**Kesimpulan:** Sistem ini dirancang khusus untuk kebutuhan BAPPENDA Kabupaten Bogor dengan fitur yang tidak tersedia di sistem umum.

---

### **Q27: Apakah ada cost-benefit analysis dari implementasi sistem ini?**

**A:** Cost-benefit analysis:

**Cost (Biaya):**
1. **Development:** Waktu penelitian (10 bulan), tidak ada biaya langsung
2. **Infrastructure:** Platform Railway (pricing terjangkau, ~$5-20/bulan)
3. **Training:** Waktu pegawai untuk training dan sosialisasi
4. **Maintenance:** Waktu tim PSI untuk maintenance

**Benefit (Manfaat):**
1. **Efisiensi waktu:**
   - Pengurangan waktu proses 33-87%
   - Pengurangan waktu validasi 87%
   - Total penghematan waktu: ~20-30 menit per dokumen × 80 dokumen/hari = 26-40 jam/hari

2. **Pengurangan kesalahan:**
   - Tingkat kesalahan turun dari 10% → 5%
   - Mengurangi waktu rework dan komplain

3. **Peningkatan kapasitas:**
   - Sistem kuotasi memungkinkan pengelolaan beban kerja yang lebih baik
   - Beban kerja pegawai berkurang 40%

4. **Kepuasan pengguna:**
   - PPAT: 65% → 88% (+23%)
   - Pegawai: 60% → 85% (+25%)

**ROI:** Meskipun tidak dihitung secara finansial, benefit dalam bentuk efisiensi waktu, pengurangan kesalahan, dan peningkatan kepuasan sangat signifikan dibandingkan dengan cost yang relatif kecil.

---

## 🚀 PENGEMBANGAN SELANJUTNYA

### **Q28: Apa rencana pengembangan sistem selanjutnya?**

**A:** Rencana pengembangan (future work):

1. **Ekspansi scope:**
   - Integrasi dengan 8 jenis pajak lainnya (PBB, Perhotelan, dll)
   - Sistem terpadu untuk semua jenis pajak daerah

2. **Integrasi eksternal:**
   - Integrasi dengan sistem BSRE nasional (jika diperlukan)
   - Integrasi dengan sistem pembayaran online
   - Integrasi dengan sistem perpajakan nasional

3. **Fitur tambahan:**
   - Mobile app untuk PPAT
   - Dashboard analytics yang lebih advanced
   - Predictive analytics untuk estimasi waktu lebih akurat
   - Sistem notifikasi multi-channel (SMS, WhatsApp)

4. **Optimasi:**
   - Performance optimization untuk beban lebih tinggi
   - Machine learning untuk prediksi beban kerja
   - Auto-scaling yang lebih cerdas

5. **Compliance:**
   - Sertifikasi keamanan data
   - Compliance dengan regulasi pemerintah daerah
   - ISO certification (jika diperlukan)

**Prioritas:** Ekspansi ke jenis pajak lain dan optimasi performa untuk beban lebih tinggi adalah prioritas utama setelah go live.

---

## 👥 USER ACCEPTANCE TESTING

### **Q29: Bagaimana User Acceptance Testing (UAT) dilakukan?**

**A:** User Acceptance Testing dilakukan dengan:

1. **Peserta UAT:**
   - **Iterasi 1:** 5 pegawai PSI (admin, LTB, peneliti, peneliti Validasi, LSB)
   - **Iterasi 2:** 5 pegawai PSI + 5 pengguna eksternal (PPAT)
   - **Iterasi 3:** 5 pegawai PSI + 5 pengguna eksternal (PPAT)

2. **Metodologi:**
   - Penguji diberikan akses ke sistem staging
   - Menguji semua fitur sesuai skenario kasus nyata
   - Pengujian di jam sibuk untuk kondisi riil
   - Pengumpulan feedback melalui diskusi langsung dengan Kasubbid PSI

3. **Kriteria keberhasilan:**
   - Semua butir uji berhasil (success rate 100%)
   - Feedback positif dari pengguna
   - Tidak ada bug critical yang menghambat operasional
   - Sistem dapat digunakan untuk operasional harian

4. **Hasil UAT:**
   - **Iterasi 1:** 15 butir uji, 100% success rate
   - **Iterasi 2:** 11 butir uji, 100% success rate
   - **Iterasi 3:** 8 butir uji, 100% success rate
   - Total: 34 butir uji, 100% success rate

**Kesimpulan:** UAT menunjukkan sistem siap untuk go live dengan semua fitur berfungsi dengan baik dan sesuai kebutuhan pengguna.

---

## 📋 METODOLOGI PENGUMPULAN DATA

### **Q30: Bagaimana metodologi pengumpulan data dalam penelitian ini?**

**A:** Metodologi pengumpulan data menggunakan dua teknik utama:

1. **Wawancara:**
   - **Jenis:** Semi-terstruktur
   - **Narasumber:** Kasubbid PSI (Hendri Aji Sulistiyanto, ST)
   - **Waktu:** November 2024 (Iterasi 1), Maret 2025 (Iterasi 2), Agustus 2025 (Iterasi 3)
   - **Tujuan:** Menggali kebutuhan fungsional, identifikasi masalah, validasi requirement
   - **Hasil:** Tabel hasil wawancara dengan 7 poin utama

2. **Observasi:**
   - **Jenis:** Non-partisipatif
   - **Durasi:** Selama masa magang (22 Juli - 20 Desember 2024) dan pengembangan
   - **Fokus:** Proses pengelolaan pelayanan BPHTB, penjadwalan pemeriksaan berkas
   - **Tujuan:** Memahami alur kerja manual, identifikasi titik inefisiensi
   - **Hasil:** Identifikasi 4 keluhan utama dan masalah operasional

3. **Pengujian sistem:**
   - **Black box testing:** 2 minggu (Iterasi 1)
   - **White box testing:** 4 minggu (Iterasi 2)
   - **Hybrid testing:** 1 minggu (Iterasi 3)
   - **Data:** Hasil pengujian, feedback pengguna, metrik performa

**Triangulasi:** Kombinasi wawancara, observasi, dan pengujian sistem memastikan validitas dan reliabilitas data yang dikumpulkan.

---

## 🔗 INTEGRASI SISTEM

### **Q31: Bagaimana sistem terintegrasi dengan divisi Bank di Iterasi 2?**

**A:** Integrasi dengan divisi Bank merupakan salah satu fokus utama Iterasi 2, dimana Bank didaftarkan menjadi produk online yang terintegrasi dengan layanan sistem. Integrasi ini dilakukan untuk verifikasi pembayaran secara real-time:

1. **Konteks integrasi (Iterasi 2):**
   - **Sebelum Iterasi 2:** Bank belum terintegrasi dengan sistem, verifikasi pembayaran dilakukan secara manual dan terpisah
   - **Iterasi 2:** Bank terintegrasi sebagai produk online yang dapat mengakses sistem untuk verifikasi pembayaran secara langsung
   - Bank menjadi bagian dari alur kerja digital yang terhubung dengan sistem booking online

2. **Mekanisme integrasi:**
   - Bank memiliki akses ke sistem melalui antarmuka khusus untuk divisi Bank
   - Bank dapat melihat daftar booking yang memerlukan verifikasi pembayaran secara real-time
   - Bank dapat menginput nomor pembayaran dan melakukan verifikasi langsung melalui sistem
   - Hasil verifikasi dikirim kembali ke sistem dan terintegrasi dengan alur LTB secara otomatis
   - Status pembayaran terupdate secara real-time dan terlihat oleh LTB dan divisi terkait

3. **Proses verifikasi terintegrasi:**
   - PPAT melakukan pembayaran di bank/UPT (masih manual, belum digital)
   - Bank memverifikasi pembayaran melalui sistem online (terintegrasi)
   - Status pembayaran terupdate di sistem secara real-time dan terlihat oleh LTB
   - Verifikasi pembayaran dilakukan secara paralel dengan pemeriksaan berkas oleh LTB
   - Koordinasi antara LTB dan Bank menjadi lebih efisien karena terintegrasi dalam satu sistem

4. **Tabel database:**
   - `bank_1_cek_hasil_transaksi`: Menyimpan hasil verifikasi transaksi bank dengan kolom `nama_pengecek` dan catatan "Iterasi 2 - Bank Integration"
   - Relasi dengan `pat_2_bphtb_perhitungan` dan `pat_4_objek_pajak` melalui foreign key
   - Relasi one-to-one dengan `ltb_1_terima_berkas_sspd` untuk sinkronisasi data

5. **Keuntungan integrasi:**
   - Verifikasi pembayaran lebih cepat dan real-time
   - Sinkronisasi data otomatis antara Bank dan LTB
   - Mengurangi koordinasi manual antara LTB dan Bank
   - Transparansi status pembayaran untuk semua divisi terkait
   - Audit trail lengkap untuk verifikasi pembayaran

6. **Dampak pada proses bisnis:**
   - Bank menjadi bagian dari alur kerja digital yang terstruktur
   - Proses verifikasi pembayaran menjadi lebih efisien dan terintegrasi
   - Mengurangi waktu tunggu dan koordinasi manual
   - Meningkatkan akurasi data pembayaran

**Catatan:** Pembayaran oleh wajib pajak masih dilakukan secara manual di bank/UPT. Integrasi di Iterasi 2 fokus pada verifikasi pembayaran secara online, bukan pada proses pembayaran itu sendiri. Integrasi Bank ini merupakan salah satu dari tiga fokus utama Iterasi 2, bersama dengan integrasi Peneliti Validasi dan peningkatan keamanan sistem.

---

## ⚡ PERFORMANCE DAN OPTIMASI

### **Q32: Bagaimana performa sistem diukur dan dioptimasi?**

**A:** Performa sistem diukur dan dioptimasi melalui:

1. **Metrik performa:**
   - **Waktu respons:** Waktu dari request hingga response (< 2 detik untuk operasi normal)
   - **Throughput:** Jumlah request per detik yang dapat ditangani
   - **Uptime:** 99,7% (sistem tersedia hampir sepanjang waktu)
   - **Waktu pemrosesan dokumen:** 10-25 menit per dokumen (turun dari 30-40 menit)

2. **Optimasi yang dilakukan:**
   - **Database indexing:** Index pada kolom yang sering di-query
   - **Query optimization:** Optimasi query SQL untuk mengurangi waktu eksekusi
   - **Connection pooling:** Mengelola koneksi database secara efisien
   - **Caching:** Cache untuk data yang jarang berubah
   - **Code optimization:** Refactoring kode untuk meningkatkan efisiensi

3. **Monitoring:**
   - Dashboard monitoring real-time untuk memantau performa
   - Logging untuk tracking error dan bottleneck
   - Alert system untuk notifikasi jika terjadi masalah

4. **Load testing:**
   - Pengujian di jam sibuk untuk menguji performa di kondisi riil
   - Pengujian dengan beban normal (80 booking/hari) dan beban tinggi

**Hasil:** Sistem dapat menangani beban kerja harian dengan baik tanpa degradasi performa yang signifikan.

---

## 🛡️ RISK MANAGEMENT

### **Q33: Apa risiko yang diidentifikasi dan bagaimana mitigasinya?**

**A:** Risiko yang diidentifikasi dan mitigasinya:

1. **Risiko teknis:**
   - **Risiko:** Server down atau database error
   - **Mitigasi:** Platform cloud (Railway) dengan auto-scaling, backup database harian, monitoring real-time

2. **Risiko keamanan:**
   - **Risiko:** Data breach atau akses tidak sah
   - **Mitigasi:** Enkripsi AES-256, role-based access control, audit trail lengkap, validasi input

3. **Risiko operasional:**
   - **Risiko:** Sistem tidak digunakan karena user tidak memahami
   - **Mitigasi:** Sosialisasi menyeluruh, training, user manual, support dari tim PSI

4. **Risiko beban kerja:**
   - **Risiko:** Overload sistem jika booking melebihi kapasitas
   - **Mitigasi:** Sistem kuotasi dinamis, antrean booking, notifikasi multi-level

5. **Risiko data:**
   - **Risiko:** Kehilangan data atau korupsi data
   - **Mitigasi:** Backup database, audit trail, foreign key untuk integritas data

**Status:** Semua risiko telah diidentifikasi dan dimitigasi dengan strategi yang sesuai. Tidak ada insiden kritis selama pengujian.

---

## 📚 DOKUMENTASI SISTEM

### **Q34: Bagaimana dokumentasi sistem disusun?**

**A:** Dokumentasi sistem mencakup:

1. **Dokumentasi teknis:**
   - **Code documentation:** Inline comments di kode, README untuk setiap modul
   - **API documentation:** Dokumentasi endpoint (GET, POST, PUT, DELETE) dengan contoh request/response
   - **Database schema:** ERD diagram, dokumentasi tabel dan relasi
   - **Architecture documentation:** Diagram arsitektur sistem, alur data

2. **Dokumentasi pengguna:**
   - **User manual:** Panduan penggunaan untuk setiap role (PPAT, LTB, Peneliti, dll)
   - **FAQ:** Frequently Asked Questions untuk masalah umum
   - **Video tutorial:** (Rencana) untuk memudahkan pengguna

3. **Dokumentasi penelitian:**
   - **Laporan tugas akhir:** Dokumentasi lengkap proses penelitian
   - **Diagram UML:** Activity, Use Case, Swimlane, ERD
   - **Tabel pengujian:** Dokumentasi hasil pengujian setiap iterasi

4. **Dokumentasi maintenance:**
   - **Deployment guide:** Panduan deploy ke staging dan produksi
   - **Troubleshooting guide:** Panduan mengatasi masalah umum
   - **Update log:** Dokumentasi perubahan dan update sistem

**Tujuan:** Dokumentasi memastikan sistem dapat di-maintain dan dikembangkan lebih lanjut oleh tim BAPPENDA setelah penelitian selesai.

---

## 📝 CATATAN PENTING

- Semua pengujian dilakukan di lingkungan staging sebelum go live
- Review kode dilakukan setiap minggu oleh Kasubbid PSI sebagai mentor dan validator teknis
- Sistem menggunakan role-based access control untuk keamanan
- Sertifikat digital adalah sistem lokal BAPPENDA, bukan integrasi dengan BSRE eksternal
- Database menggunakan foreign key untuk memastikan integritas referensial
- Audit trail mencatat 100% aktivitas penting untuk compliance dan accountability
- Timeline penelitian: November 2024 - September 2025 (10 bulan)
- Total iterasi: 3 iterasi dengan 34 butir uji (100% success rate)
- Platform deployment: Railway (cloud platform)

---

## 📑 INDEKS PERTANYAAN

### **Metodologi Pengujian**
- Q1: Black Box Testing
- Q2: White Box Testing
- Q3: Hybrid Testing
- Q4: Staging Environment
- Q38: Alasan Pemilihan Metodologi Pengujian untuk Setiap Iterasi
- Q39: Mengapa PPAT yang Mengajukan Booking BPHTB? (Perbedaan dengan Samsat)

### **Keamanan dan Sertifikat Digital**
- Q5: Sertifikat Digital Lokal vs BSRE
- Q6: Enkripsi AES-256
- Q7: QR Code Ganda

### **Metode Prototyping**
- Q8: Prototyping dengan 3 Iterasi
- Q9: Tahapan Prototyping

### **Diagram UML dan Pemodelan**
- Q35: Activity Diagram
- Q36: Use Case Diagram
- Q37: Diagram Proses Bisnis

### **Sistem Kuotasi**
- Q10: Algoritma Kuotasi Dinamis
- Q11: Kuota Harian 80 Dokumen

### **Database dan Arsitektur**
- Q12: PostgreSQL
- Q13: Struktur MVC

### **Validasi dan Audit**
- Q14: Audit Trail
- Q15: Validasi Dokumen

### **Hasil dan Metrik**
- Q16: Perbandingan Metrik

### **Teknologi**
- Q17: Node.js dan Express.js
- Q18: Vite.js

### **Kesimpulan**
- Q19: Kontribusi Penelitian

### **Keterbatasan dan Tantangan**
- Q20: Keterbatasan Penelitian
- Q21: Validitas dan Reliabilitas Data

### **Keamanan dan Akses**
- Q22: Role-Based Access Control

### **Skalabilitas dan Performance**
- Q23: Skalabilitas dan Beban Tinggi
- Q24: Backup dan Disaster Recovery
- Q32: Performance dan Optimasi

### **Maintenance dan Sustainability**
- Q25: Maintenance dan Sustainability

### **Analisis dan Perbandingan**
- Q26: Perbandingan dengan Sistem Sejenis
- Q27: Cost-Benefit Analysis

### **Pengembangan Selanjutnya**
- Q28: Rencana Pengembangan

### **User Acceptance Testing**
- Q29: User Acceptance Testing

### **Metodologi Pengumpulan Data**
- Q30: Metodologi Pengumpulan Data

### **Integrasi Sistem**
- Q31: Integrasi dengan Divisi Bank

### **Risk Management**
- Q33: Risk Management

### **Dokumentasi**
- Q34: Dokumentasi Sistem

---

**Dokumen ini disusun untuk memfasilitasi diskusi teknis dengan dosen pembimbing dan memastikan semua aspek teknis penelitian dapat dijelaskan dengan jelas dan akurat.**

**Total Pertanyaan:** 39 pertanyaan teknis yang mencakup semua aspek penelitian dari metodologi, implementasi, pengujian, hingga maintenance dan pengembangan selanjutnya.

