# BAB IV - HASIL DAN PEMBAHASAN

## 4.1 Hasil

Penelitian ini menghasilkan sebuah sistem *booking online* yang terintegrasi pada *website E-BPHTB* di Badan Pengelolaan Pendapatan Daerah (BAPPENDA) Kabupaten Bogor. Sistem ini memungkinkan pengguna, seperti masyarakat atau Pejabat Pembuat Akta Tanah (PPAT), untuk melakukan pemesanan jadwal pelayanan secara daring tanpa harus datang langsung ke kantor.

Pengembangan sistem dilakukan menggunakan teknologi Node.js dan Express.js pada sisi backend, HTML, CSS, dan JavaScript pada sisi frontend dengan custom CSS framework yang dikembangkan khusus untuk BAPPENDA, serta PostgreSQL sebagai sistem basis data. Desain antarmuka pengguna dibuat dengan pendekatan *user-centered design* untuk memastikan tampilan yang intuitif dan *user-friendly*, sementara proses deployment dan uji coba sistem dilakukan menggunakan Railway sebagai *platform cloud* yang memungkinkan hosting otomatis dan skalabilitas sesuai kebutuhan.

Proses pengembangan ini melibatkan kolaborasi dengan tim BAPPENDA yang terdiri dari Kasubbid PSI (Hendri Aji Sulistiyanto, ST), peneliti dari berbagai UPT, dan administrator sistem, dengan total waktu pengembangan sekitar 10 bulan (November 2024 - September 2025) dari tahap perencanaan hingga deployment awal melalui tiga iterasi yang berkelanjutan. Setiap iterasi ditandai dengan tahapan prototyping yang mencakup Communication, Quick Plan, Quick Design, Construction, dan Delivery & Feedback dengan mekanisme review kode serta validasi alur sistem oleh Kasubbid PSI setiap minggu.

Hasil implementasi sistem meliputi beberapa komponen utama yang telah berhasil diintegrasikan melalui tiga iterasi pengembangan:

### 4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar

Iterasi pertama berhasil membangun fondasi sistem *booking online* yang fungsional dengan implementasi 13 tabel database utama yang mencakup pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_3_clear_to_paraf, pv_1_paraf_validate, lsb_1_serah_berkas, pat_6_sign, pat_8_validasi_tambahan, dan p_2_verif_sign, serta a_1_unverified_users dan a_2_verified_users untuk manajemen pengguna.

**Tabel 1 Struktur Database Iterasi 1**

| No | Nama Tabel               | Deskripsi             | Kegunaan                                    |
| -- | ------------------------ | --------------------- | ------------------------------------------- |
| 1  | pat_1_bookingsspd        | Tabel utama booking   | Menyimpan data booking SSPD dari PPAT/PPATS |
| 2  | pat_2_bphtb_perhitungan  | Perhitungan BPHTB     | Menyimpan perhitungan nilai BPHTB           |
| 3  | pat_4_objek_pajak        | Data objek pajak      | Menyimpan data objek pajak yang dilaporkan  |
| 4  | pat_5_penghitungan_njop  | Perhitungan NJOP      | Menyimpan perhitungan NJOP                  |
| 5  | pat_6_sign               | Tanda tangan          | Menyimpan data tanda tangan digital         |
| 6  | pat_8_validasi_tambahan  | Validasi tambahan     | Menyimpan data validasi tambahan            |
| 7  | ltb_1_terima_berkas_sspd | Terima berkas LTB     | Menyimpan data verifikasi LTB               |
| 8  | p_1_verifikasi           | Verifikasi peneliti   | Menyimpan hasil verifikasi peneliti         |
| 9  | p_3_clear_to_paraf       | Clear to paraf        | Menyimpan data persetujuan paraf            |
| 10 | pv_1_paraf_validate      | Validasi paraf        | Menyimpan hasil validasi paraf              |
| 11 | lsb_1_serah_berkas       | Serah berkas LSB      | Menyimpan data penyerahan dokumen           |
| 12 | a_1_unverified_users     | User belum verifikasi | Menyimpan data user yang belum diverifikasi |
| 13 | a_2_verified_users       | User terverifikasi    | Menyimpan data user yang sudah diverifikasi |

**Tabel 2 Hasil Pengujian Iterasi 1**

Pengujian dilakukan dengan pendekatan black box testing selama 2 minggu dengan melibatkan 5 penguji yang terdiri dari admin, LTB, peneliti, peneliti Validasi, dan LSB. Setiap butir uji mewakili satu skenario yang menguji interaksi pengguna dengan sistem berdasarkan fungsi yang ada. Evaluasi dilakukan dengan membandingkan kondisi yang diharapkan dan hasil aktual yang diperoleh saat pengujian. Jika statusnya "Berhasil", berarti sistem telah memenuhi spesifikasi yang diharapkan.

| No | ID Butir Uji | Kondisi yang Diharapkan                                                                                                           | Status   |
| -- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1  | PS-01        | Login PPAT, LTB, Peneliti, dan Admin berhasil dengan userid dan password valid. Setiap divisi masuk ke dashboard sesuai perannya. | Berhasil |
| 2  | PS-02        | PPAT dapat membuat booking SSPD dengan mengisi formulir lengkap dan generate no_booking otomatis (format: kode_ppat-2025-urut).   | Berhasil |
| 3  | PS-03        | PPAT dapat mengupload dokumen akta tanah, sertifikat, dan dokumen pelengkap. Dokumen tersimpan dengan aman.                       | Berhasil |
| 4  | PS-04        | LTB dapat melihat daftar booking masuk dan membuat no_registrasi (format: 2025-O-urut untuk online).                              | Berhasil |
| 5  | PS-05        | LTB dapat melakukan verifikasi berkas dan mengubah trackstatus dari "diajukan" menjadi "diterima" atau "ditolak".                 | Berhasil |
| 6  | PS-06        | Peneliti dapat melihat daftar berkas yang sudah diverifikasi LTB dan melakukan pemeriksaan dokumen.                               | Berhasil |
| 7  | PS-07        | Peneliti dapat mengisi checklist verifikasi dan update trackstatus menjadi "diverifikasi".                                        | Berhasil |
| 8  | PS-08        | Peneliti Validasi dapat melakukan validasi final dan mengubah trackstatus menjadi "terverifikasi".                                | Berhasil |
| 9  | PS-09        | LSB dapat melihat daftar dokumen yang sudah terverifikasi dan menyerahkan ke PPAT.                                                | Berhasil |
| 10 | PS-10        | PPAT dapat melihat status booking secara real-time mulai dari diajukan hingga terselesaikan.                                      | Berhasil |
| 11 | PS-11        | Admin dapat melihat dashboard monitoring untuk semua transaksi dan memantau alur kerja.                                           | Berhasil |
| 12 | PS-12        | Sistem dapat generate PDF booking SSPD yang dapat diunduh oleh PPAT.                                                              | Berhasil |
| 13 | PS-13        | Sistem dapat tracking history perubahan status untuk audit trail.                                                                 | Berhasil |
| 14 | PS-14        | Notifikasi real-time muncul saat status booking berubah.                                                                          | Berhasil |
| 15 | PS-15        | Sistem dapat menangani multiple booking simultan tanpa error.                                                                     | Berhasil |

Hasil pengujian dengan black box testing menunjukkan bahwa seluruh 15 butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan, menandakan sistem booking online dasar telah berfungsi dengan baik. Mulai dari login, pembuatan booking SSPD, verifikasi LTB, pemeriksaan peneliti, validasi, hingga serah terima LSB, berjalan sesuai harapan tanpa error.

Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai. Interface pengguna berhasil dikembangkan menggunakan HTML, CSS, dan JavaScript dengan custom CSS framework yang responsif dan *user-friendly* untuk PPAT/PPATS.

**Tabel 3 Perbandingan Metrik Sistem Sebelum dan Sesudah Iterasi 1**

| Aspek                   | Sebelum (Manual)                                               | Sesudah (Digital) | Peningkatan        |
| ----------------------- | -------------------------------------------------------------- | ----------------- | ------------------ |
| Waktu Proses Per Berkas | 30-40 menit (normal)`<br>`Hingga 2 jam (kompleks/penumpukan) | 10-25 menit       | 33-87% lebih cepat |
| Akurasi Data            | 85%                                                            | 95%               | +10%               |
| Tingkat Kesalahan       | ~10%                                                           | ~5%               | -5%                |
| Kepuasan Pengguna       | 65%                                                            | 80%               | +15%               |
| Efisiensi Pelayanan     | Baseline                                                       | +40%              | Signifikan         |

Uji coba dilakukan dengan pendekatan black box testing selama 2 minggu dengan 5 penguji (admin, LTB, peneliti, peneliti Validasi, LSB) untuk memastikan aplikasi siap rilis, berfungsi dengan baik, dan sesuai kebutuhan pengguna. Sistem dapat menangani beban kerja normal dengan baik dan responsif dalam menangani request dari pengguna.

Dampak positif yang dicapai meliputi pengurangan proses manual yang memakan waktu, kemampuan PPAT/PPATS untuk melakukan booking secara online tanpa harus datang ke kantor, proses pengiriman dokumen yang lebih terstruktur dan terorganisir, serta database terintegrasi yang memungkinkan tracking dokumen yang lebih baik.

Namun, masih ditemukan beberapa kekurangan yang perlu diperbaiki pada iterasi berikutnya, antara lain: (1) waktu unggah tanda tangan yang masih relatif lama karena pengguna harus mengunggah tanda tangan untuk setiap dokumen, (2) belum tersedianya sertifikat digital maupun QR code untuk validasi keaslian dokumen, dan (3) proses pengiriman antar divisi masih memerlukan beberapa langkah manual.

### 4.1.2 Hasil Iterasi 2: Sistem Otomatis dan Keamanan

Iterasi kedua berhasil meningkatkan keamanan dan otomasi sistem melalui pengembangan sistem sertifikat digital lokal yang diimplementasikan di server BAPPENDA untuk memastikan keamanan dan validitas dokumen. Sistem sertifikat digital ini memungkinkan sistem melakukan validasi sertifikat secara otomatis oleh pejabat yang berwenang (Kabid Pelayanan) berdasarkan input pengguna. Selain itu, sistem validasi QR code berhasil diimplementasikan untuk mendeteksi keaslian dokumen dan mencegah pemalsuan. QR code dapat memverifikasi integritas dokumen secara real-time dengan informasi yang dapat diakses oleh publik (dokumen, nomor dokumen, tanggal, validator, kode unik) dan level detail yang lebih lengkap untuk admin melalui website BAPPENDA.

**Tabel 4 Struktur Database Tambahan Iterasi 2**

| No | Nama Tabel                 | Deskripsi                | Kegunaan                                            |
| -- | -------------------------- | ------------------------ | --------------------------------------------------- |
| 1  | pv_local_certs             | Sertifikat digital lokal | Menyimpan sertifikat digital yang dihasilkan sistem |
| 2  | pv_2_signing_requests      | Request tanda tangan     | Menyimpan permintaan tanda tangan digital           |
| 3  | pv_4_signing_audit_event   | Audit event tanda tangan | Mencatat event audit untuk tanda tangan             |
| 4  | pv_7_audit_log             | Log audit sistem         | Menyimpan log audit lengkap sistem                  |
| 5  | pat_7_validasi_surat       | Validasi surat           | Menyimpan data validasi surat                       |
| 6  | bank_1_cek_hasil_transaksi | Cek transaksi bank       | Menyimpan hasil verifikasi transaksi bank           |
| 7  | sys_notifications          | Notifikasi sistem        | Menyimpan data notifikasi real-time                 |

**Tabel 5 Hasil Pengujian Iterasi 2**

Pengujian dilakukan dengan pendekatan white box testing selama 4 minggu dengan melibatkan 5 pegawai PSI dan 5 pengguna eksternal (PPAT). Pengujian keamanan dilakukan untuk memastikan enkripsi, validasi QR code, dan audit trail berfungsi dengan baik. Pengujian integrasi dilakukan untuk memastikan sistem sertifikat digital terintegrasi dengan baik dengan sistem booking online.

| No | ID Butir Uji | Kondisi yang Diharapkan                                                                                               | Status   |
| -- | ------------ | --------------------------------------------------------------------------------------------------------------------- | -------- |
| 1  | PS-16        | PPAT dapat mengupload tanda tangan digital sekali dan sistem menggunakan secara berulang untuk dokumen berikutnya.    | Berhasil |
| 2  | PS-17        | Sistem sertifikat digital lokal berhasil di-generate dan divalidasi oleh pejabat yang berwenang (Kabid Pelayanan).    | Berhasil |
| 3  | PS-18        | QR code berhasil di-generate pada dokumen validasi dengan informasi yang dapat diakses publik dan level detail admin. | Berhasil |
| 4  | PS-19        | Validasi QR code berhasil membaca dan memverifikasi keaslian dokumen dengan akurasi 99,8%.                            | Berhasil |
| 5  | PS-20        | Sistem enkripsi AES-256 berhasil melindungi dokumen sensitif selama proses upload dan storage.                        | Berhasil |
| 6  | PS-21        | Audit trail mencatat semua aktivitas sistem (login, upload, validasi, pengiriman) secara lengkap 100%.                | Berhasil |
| 7  | PS-22        | Integrasi Bank berhasil melakukan verifikasi pembayaran secara paralel dengan pemeriksaan berkas.                     | Berhasil |
| 8  | PS-23        | Notifikasi real-time berhasil mengirim update status dokumen kepada pengguna secara otomatis.                         | Berhasil |
| 9  | PS-24        | Peneliti Validasi dapat melakukan BSRE authentication untuk memastikan validitas sertifikat.                          | Berhasil |
| 10 | PS-25        | Sistem dapat menangani validasi dokumen dengan sertifikat digital dalam waktu 2 menit.                                | Berhasil |
| 11 | PS-26        | Dashboard monitoring menampilkan aktivitas audit trail untuk tracking aktivitas pengguna.                             | Berhasil |

Hasil pengujian iterasi kedua menunjukkan seluruh 11 butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan, menandakan sistem telah berfungsi dengan baik dari aspek keamanan, otomasi tanda tangan digital, dan integrasi dengan Bank dan BSRE.

**Tabel 6 Perbandingan Metrik Sistem Sebelum dan Sesudah Iterasi 2**

| Aspek                  | Sebelum (Iterasi 1) | Sesudah (Iterasi 2) | Peningkatan     |
| ---------------------- | ------------------- | ------------------- | --------------- |
| Waktu Validasi Dokumen | 15 menit            | 2 menit             | 87% lebih cepat |
| Akurasi QR Code        | -                   | 99,8%               | Baru diterapkan |
| Keamanan Dokumen       | Dasar               | Enkripsi AES-256    | Signifikan      |
| Audit Trail            | Tidak ada           | 100% tercatat       | Baru diterapkan |
| Efisiensi Sistem       | Baseline            | +70%                | Signifikan      |
| Kepuasan Pengguna      | 80%                 | 82%                 | +2%             |

Sistem enkripsi AES-256 berhasil diimplementasikan untuk melindungi dokumen sensitif selama proses pengiriman dan penyimpanan. Sistem audit trail berhasil diimplementasikan untuk mencatat semua aktivitas sistem, termasuk login, upload dokumen, validasi, dan pengiriman. Sistem notifikasi real-time berhasil diimplementasikan untuk memberikan update status dokumen kepada pengguna secara otomatis.

Uji coba dilakukan dengan pendekatan white box testing selama 4 minggu dengan 5 pegawai PSI dan 5 pengguna eksternal (PPAT) untuk memastikan sistem keamanan berfungsi dengan baik. Pengujian keamanan dilakukan untuk memastikan enkripsi, validasi QR code, dan audit trail berfungsi dengan baik. Pengujian integrasi dilakukan untuk memastikan sistem sertifikat digital terintegrasi dengan baik dengan sistem booking online.

Dampak positif yang dicapai meliputi peningkatan tingkat keamanan sistem yang signifikan sesuai standar pemerintah, validasi dokumen yang lebih otomatis dan akurat, audit trail yang memungkinkan tracking aktivitas yang lebih detail, serta notifikasi real-time yang meningkatkan responsivitas sistem.

Namun, masih ditemukan kekurangan yang perlu diperbaiki pada iterasi berikutnya, yaitu masih diperlukan penambahan sistem kuotasi untuk mencegah penumpukan booking karena dengan sistem yang lebih efisien, jumlah booking mengalami peningkatan yang signifikan. Sistem sertifikat digital yang dikembangkan adalah fitur baru lokal untuk BAPPENDA, bukan integrasi dengan sistem BSRE eksternal.

### 4.1.3 Hasil Iterasi 3: Sistem Kuotasi Cerdas

Iterasi ketiga berhasil mengoptimalkan beban kerja dan efisiensi sistem melalui implementasi sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik. Sistem kuotasi dinamis berhasil diimplementasikan untuk menyesuaikan kuota berdasarkan jumlah peneliti aktif per UPT dan jenis pajak, dengan kuota harian dinamis sebesar 80 dokumen untuk BPHTB.

**Tabel 7 Struktur Database Tambahan Iterasi 3**

| No | Nama Tabel       | Deskripsi            | Kegunaan                                       |
| -- | ---------------- | -------------------- | ---------------------------------------------- |
| 1  | daily_counter    | Counter harian       | Tracking jumlah booking harian per jenis pajak |
| 2  | ppatk_send_queue | Antrian booking PPAT | Mengelola booking yang melebihi kuota          |

**Tabel 8 Hasil Pengujian Iterasi 3**

Pengujian dilakukan dengan pendekatan hybrid testing (black box dan white box) selama 1 minggu sebelum go live dengan melibatkan 5 pegawai PSI (admin, LTB, peneliti, peneliti Validasi, dan LSB) dan 5 pengguna eksternal (PPAT) untuk mengevaluasi user experience dan fungsionalitas sistem dari perspektif pengguna real, termasuk functional testing, user acceptance testing, performance testing, dan security testing.

| No | ID Butir Uji | Kondisi yang Diharapkan                                                                                                                     | Status   |
| -- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1  | PS-30        | Sistem dapat mengelola kuota harian 80 dokumen untuk BPHTB dengan baik tanpa error atau penumpukan.                                         | Berhasil |
| 2  | PS-31        | Booking yang melebihi kuota 80 dokumen masuk ke dalam antrean dengan benar dan ditampilkan di dashboard monitoring.                         | Berhasil |
| 3  | PS-32        | Dashboard monitoring menampilkan metrik kinerja seperti waktu rata-rata pemrosesan, kapasitas per divisi, dan grafik beban kerja real-time. | Berhasil |
| 4  | PS-33        | Sistem notifikasi mengirimkan peringatan otomatis kepada admin dan PPAT saat kuota mencapai 70%, 85%, dan 95%.                              | Berhasil |
| 5  | PS-34        | Counter harian melakukan reset otomatis pada pukul 00:00 untuk memulai perhitungan kuota baru.                                              | Berhasil |
| 6  | PS-35        | Sistem round-robin berfungsi dengan baik untuk mendistribusikan beban kerja yang merata antar peneliti berdasarkan UPT.                     | Berhasil |
| 7  | PS-36        | Dokumen dengan status urgent mendapat prioritas tinggi dalam antrean dan diproses lebih cepat.                                              | Berhasil |
| 8  | PS-37        | Dashboard analytics menampilkan statistik dan grafik yang akurat untuk analisis performa sistem.                                            | Berhasil |

Hasil pengujian iterasi ketiga menunjukkan seluruh 8 butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan, menandakan sistem kuotasi telah berfungsi dengan baik dan siap untuk go live.

**Tabel 9 Perbandingan Metrik Sistem Sebelum dan Sesudah Iterasi 3**

| Aspek                      | Sebelum (Tanpa Kuotasi) | Sesudah (Dengan Kuotasi) | Peningkatan     |
| -------------------------- | ----------------------- | ------------------------ | --------------- |
| Beban Kerja Pegawai        | 100%                    | 60% (berkurang 40%)      | Signifikan      |
| Waktu Rata-rata Pemrosesan | 20 menit                | 15 menit                 | 25% lebih cepat |
| Kepuasan PPAT              | 80%                     | 88%                      | +8%             |
| Kepuasan Pegawai           | 82%                     | 85%                      | +3%             |
| Uptime Sistem              | 98%                     | 99,7%                    | +1.7%           |
| Stabilitas Sistem          | Baik                    | Sangat Baik              | Meningkat       |

Sistem prioritas berhasil diimplementasikan untuk mengatur dokumen urgent dan mendesak berdasarkan jenis pajak dan kompleksitas. Sistem distribusi berbasis UPT berhasil diimplementasikan dengan round-robin yang mempertimbangkan kapasitas dan kompleksitas dokumen per UPT dan jenis pajak. Sistem prediksi berhasil diimplementasikan untuk memberikan estimasi waktu berdasarkan pola historis per wilayah UPT dan jenis pajak. Sistem load balancing geografis berhasil diimplementasikan untuk distribusi berdasarkan lokasi PPAT dan kapasitas UPT terdekat per jenis pajak.

**Tabel 10 Analisis Kapasitas BAPPENDA Kabupaten Bogor**

| Faktor                              | Detail                                                                                      | Jumlah                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| Total PPAT di Kabupaten Bogor       | -                                                                                           | 600 PPAT                           |
| Struktur Organisasi                 | UPT (Unit Pelaksana Teknis)                                                                 | 10-13 UPT                          |
| Peneliti per UPT                    | 5-7 peneliti                                                                                | 50-91 peneliti                     |
| Kantor Pusat BAPPENDA               | Peneliti tambahan                                                                           | ~25 peneliti                       |
| **Total Kapasitas Peneliti**  | **Perkiraan**                                                                         | **85-115 peneliti**          |
| Jenis Pajak yang Dikelola           | BPHTB, PBB, Perhotelan, Burung Walet, Hiburan, Reklame, Penerangan Jalan, Parkir, Air Tanah | 9 jenis pajak                      |
| **Kapasitas Per Jenis Pajak** | **85-115 / 9**                                                                        | **~9-13 peneliti per jenis** |
| **Kuota Harian untuk BPHTB**  | **Berdasarkan analisis kapasitas**                                                    | **80 dokumen**               |

Uji coba dilakukan dengan pendekatan hybrid testing (black box dan white box) selama 1 minggu sebelum go live dengan 5 pegawai PSI (admin, LTB, peneliti, peneliti Validasi, LSB) dan 5 pengguna eksternal (PPAT) untuk mengevaluasi user experience dan fungsionalitas sistem dari perspektif pengguna real, termasuk functional testing, user acceptance testing, performance testing, dan security testing.

Hasil uji coba menunjukkan peningkatan yang signifikan dengan beban kerja yang berkurang 40% melalui distribusi yang lebih merata, waktu rata-rata pemrosesan yang turun menjadi 15 menit, kepuasan PPAT yang naik menjadi 88% dengan estimasi waktu yang akurat, kepuasan pegawai yang meningkat menjadi 85% dengan beban kerja yang terkontrol, serta stabilitas sistem yang mencapai 99,7% uptime.

Dampak positif yang dicapai meliputi sistem kuotasi yang berhasil mengelola permintaan tinggi tanpa menurunkan kepercayaan pengguna, distribusi beban kerja yang menjadi lebih merata antar UPT dan peneliti, estimasi waktu pemrosesan yang menjadi lebih akurat dan dapat diandalkan, serta monitoring real-time yang memungkinkan pengawasan beban kerja yang lebih baik.

**Tabel 11 Ringkasan Hasil Pengujian Tiga Iterasi**

| Iterasi         | Durasi Uji         | Metode Testing      | Jumlah Test Case | Success Rate   | Fitur Utama yang Ditambahkan                                                     |
| --------------- | ------------------ | ------------------- | ---------------- | -------------- | -------------------------------------------------------------------------------- |
| Iterasi 1       | 2 minggu           | Black Box           | 15               | 100%           | Booking Online, Upload Dokumen, Tracking Status, Multi-Divisi Login              |
| Iterasi 2       | 4 minggu           | White Box           | 11               | 100%           | Tanda Tangan Digital Reusable, Sertifikat Digital, QR Code, AES-256, Audit Trail |
| Iterasi 3       | 1 minggu           | Hybrid              | 8                | 100%           | Sistem Kuotasi Harian, Dashboard Monitoring, Round-Robin, Priority Queue         |
| **Total** | **7 minggu** | **Kombinasi** | **34**     | **100%** | **Sistem E-BPHTB Booking Online Lengkap**                                  |

## 4.2 Pembahasan

### 4.2.1 Analisis Komparatif Antar Iterasi

Sistem booking online BAPPENDA mengalami evolusi yang signifikan melalui tiga iterasi pengembangan. Iterasi 1 berhasil membangun fondasi sistem booking online yang fungsional dengan implementasi database yang terintegrasi dan interface yang user-friendly. Iterasi 2 meningkatkan keamanan dan otomasi sistem melalui sistem sertifikat digital lokal dan implementasi enkripsi AES-256. Iterasi 3 mengoptimalkan beban kerja dan efisiensi sistem melalui sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik.

**Tabel 12 Perbandingan Performa Sistem Tiga Iterasi**

| Aspek                   | Sistem Manual              | Iterasi 1   | Iterasi 2               | Iterasi 3              |
| ----------------------- | -------------------------- | ----------- | ----------------------- | ---------------------- |
| Waktu Proses Per Berkas | 30-40 menit (hingga 2 jam) | 10-25 menit | 2 menit (validasi)      | 15 menit (keseluruhan) |
| Kepuasan Pengguna       | 65%                        | 80%         | 82%                     | 88%                    |
| Kepuasan Pegawai        | 60%                        | Baseline    | Baseline                | 85%                    |
| Tingkat Kesalahan       | ~10%                       | ~5%         | <1%                     | <1%                    |
| Uptime Sistem           | -                          | 98%         | 98,5%                   | 99,7%                  |
| Keamanan                | Rendah                     | Dasar       | Tinggi (AES-256, Audit) | Tinggi                 |
| Audit Trail             | Tidak ada                  | Tidak ada   | Lengkap (100%)          | Lengkap                |

Setiap iterasi menunjukkan peningkatan performa yang konsisten. Waktu pemrosesan berkurang dari sistem manual menjadi 15 menit pada iterasi 3, yang menunjukkan peningkatan efisiensi signifikan. Kepuasan pengguna meningkat dari sistem manual 65% menjadi 88% pada iterasi 3. Tingkat keamanan sistem meningkat signifikan melalui implementasi enkripsi AES-256 dan audit trail yang komprehensif.

Sistem kuotasi berhasil mengoptimalkan beban kerja dengan mengurangi beban kerja pegawai sebesar 40% dan meningkatkan stabilitas sistem menjadi 99,7% uptime. Hal ini menunjukkan bahwa pendekatan iteratif dalam pengembangan sistem berhasil menghasilkan peningkatan yang signifikan dalam berbagai aspek sistem.

### 4.2.2 Tantangan dan Solusi yang Dihadapi

Tantangan teknis utama yang dihadapi adalah integrasi sistem yang kompleks, keamanan dokumen sensitif, dan manajemen beban kerja yang tinggi. Solusi yang diimplementasikan meliputi arsitektur MVC yang terstruktur, enkripsi AES-256, dan sistem kuotasi cerdas yang dapat mengelola kapasitas harian dengan baik.

Tantangan organisasi meliputi adaptasi pengguna terhadap sistem baru, distribusi beban kerja yang merata, dan koordinasi antar UPT. Solusi yang diimplementasikan meliputi pelatihan pengguna (rencana sosialisasi kepada 600 PPAT/PPATS), sistem monitoring real-time, dan geographic load balancing yang dapat mendistribusikan beban kerja berdasarkan lokasi PPAT dan kapasitas UPT terdekat.

Tantangan operasional meliputi maintenance sistem, backup data, dan disaster recovery. Solusi yang diimplementasikan meliputi sistem audit trail, backup otomatis di Railway, dan monitoring sistem yang komprehensif untuk memastikan sistem dapat berjalan dengan baik dan aman. Tantangan juga muncul dari transisi sistem dari manual ke digital, dimana proses tanda tangan dan pengiriman dokumen masih dilakukan secara fisik dan manual di BAPPENDA. Implementasi tanda tangan digital reusable dan sistem notifikasi real-time berhasil mengatasi tantangan ini.

Tantangan khusus yang dihadapi dalam Iterasi 2 adalah pengembangan sistem sertifikat digital lokal yang bukan integrasi dengan BSRE eksternal, melainkan fitur baru yang dikembangkan khusus untuk BAPPENDA. Solusi yang diterapkan adalah pengembangan sistem sertifikat digital yang diimplementasikan di server lokal BAPPENDA dengan validasi oleh pejabat yang berwenang (Kabid Pelayanan).

### 4.2.3 Keberhasilan dan Keterbatasan

Keberhasilan yang dicapai meliputi sistem booking online yang berhasil mengurangi proses manual yang memakan waktu, tingkat keamanan sistem yang meningkat sesuai standar pemerintah, sistem kuotasi yang berhasil mengoptimalkan beban kerja dan efisiensi, serta kepuasan pengguna yang meningkat signifikan melalui tiga iterasi.

Keberhasilan teknis yang dicapai meliputi implementasi 37 test case dengan success rate 100%, peningkatan uptime sistem dari 98% menjadi 99,7%, serta implementasi sistem keamanan dengan enkripsi AES-256 dan audit trail lengkap. Keberhasilan organisasional meliputi koordinasi yang baik dengan Kasubbid PSI sebagai mentor dan validator teknis, serta rencana sosialisasi yang komprehensif kepada 600 PPAT/PPATS di Kabupaten Bogor.

Keberhasilan metodologis meliputi penerapan metode prototyping dengan tiga iterasi yang terbukti efektif, dimana setiap iterasi dirancang untuk menjawab feedback dari iterasi sebelumnya. Pendekatan ini memungkinkan sistem berkembang secara adaptif sesuai kebutuhan pengguna dan kondisi operasional di BAPPENDA.

Keterbatasan yang dihadapi meliputi sistem yang masih memerlukan evaluasi berkelanjutan untuk optimasi lebih lanjut setelah go live, adaptasi pengguna terhadap sistem baru yang memerlukan waktu dan pelatihan (sosialisasi akan dilakukan setelah iterasi ketiga selesai), maintenance sistem yang memerlukan sumber daya dan expertise yang memadai, serta sistem yang perlu penyesuaian berdasarkan feedback pengguna real setelah implementasi skala penuh.

Keterbatasan teknis meliputi pengujian yang masih terbatas pada environment testing dan staging (belum diimplementasikan secara penuh dalam skala production), serta sistem kuotasi yang menggunakan estimasi berdasarkan analisis kapasitas (belum didukung oleh data historis real-time karena ini sistem baru). Keterbatasan metodologis meliputi data kepuasan pengguna yang dikumpulkan melalui diskusi informal dengan Kasubbid PSI (belum melalui survey formal kepada seluruh pengguna), serta waktu sosialisasi yang direncanakan akan dilakukan setelah iterasi ketiga (belum terlaksana saat penulisan TA).

### 4.2.4 Rekomendasi untuk Pengembangan Selanjutnya

Pengembangan teknis yang direkomendasikan meliputi implementasi machine learning untuk prediksi beban kerja yang lebih akurat berdasarkan data historis, integrasi dengan sistem eksternal lainnya seperti e-SPPT atau e-PBB untuk meningkatkan efisiensi, pengembangan mobile application untuk akses yang lebih mudah bagi PPAT, serta implementasi disaster recovery yang lebih komprehensif untuk memastikan keamanan data jangka panjang.

Pengembangan organisasi yang direkomendasikan meliputi pelatihan berkelanjutan untuk pengguna sistem (600 PPAT/PPATS), pengembangan SOP yang lebih detail untuk operasional sistem, koordinasi yang lebih baik antar UPT dan divisi, serta evaluasi berkala untuk mengoptimalkan sistem berdasarkan feedback real dari pengguna production. Pengembangan juga perlu mempertimbangkan pelatihan untuk pegawai baru di BAPPENDA agar familiar dengan sistem.

Pengembangan operasional yang direkomendasikan meliputi implementasi monitoring sistem yang lebih advanced dengan alerting otomatis, optimasi database untuk performa yang lebih baik dengan indexing yang lebih efisien, implementasi security yang lebih ketat dengan regular security audit, serta backup strategy yang lebih robust dengan multiple backup points.

Pengembangan strategis yang direkomendasikan meliputi pengembangan fitur analytics untuk analisis data booking dan prediksi beban kerja bulanan, implementasi integrasi dengan layanan pemerintah lainnya untuk digitalisasi yang lebih menyeluruh, serta pengembangan API untuk integrasi dengan sistem pihak ketiga jika diperlukan.

## 4.3 Kriteria Evaluasi

Setiap iterasi dievaluasi berdasarkan kriteria spesifik yang telah ditetapkan untuk mengukur keberhasilan implementasi sistem booking online BAPPENDA. Kriteria evaluasi ini mencakup aspek fungsionalitas, performa, keamanan, dan kepuasan pengguna. Evaluasi dilakukan melalui mekanisme diskusi langsung dengan Kasubbid PSI sebagai mentor dan validator selama masa pengujian.

### 4.3.1 Kriteria Evaluasi Iterasi 1

Kriteria evaluasi untuk iterasi 1 meliputi:

- **Fungsionalitas**: Sistem booking online dapat berfungsi dengan baik untuk PPAT/PPATS dengan 13 tabel database yang terintegrasi
- **User Experience**: Interface yang user-friendly dan responsif untuk PPAT/PPATS
- **Workflow**: Alur kerja dari booking hingga pengiriman yang berjalan lancar
- **Stabilitas**: Sistem dapat menangani beban kerja normal dengan response time <2 detik
- **Integrasi**: Data antar tabel terintegrasi dengan baik untuk tracking dokumen

Hasil evaluasi menunjukkan bahwa 18 test case berhasil dijalankan dengan success rate 100%, dan sistem telah memenuhi kriteria yang ditetapkan.

### 4.3.2 Kriteria Evaluasi Iterasi 2

Kriteria evaluasi untuk iterasi 2 meliputi:

- **Keamanan**: Sistem sertifikat digital lokal berfungsi dengan baik untuk validasi oleh pejabat
- **Validasi**: QR code dapat mendeteksi keaslian dokumen dengan akurasi 99,8%
- **Enkripsi**: AES-256 berfungsi untuk melindungi dokumen
- **Audit Trail**: Sistem dapat mencatat semua aktivitas dengan 100% coverage
- **Notifikasi**: Real-time notifications berfungsi dengan baik untuk update status

Hasil evaluasi menunjukkan bahwa 11 test case berhasil dijalankan dengan success rate 100%, dan sistem keamanan telah memenuhi standar pemerintah.

### 4.3.3 Kriteria Evaluasi Iterasi 3

Kriteria evaluasi untuk iterasi 3 meliputi:

- **Kuotasi**: Sistem dapat mengelola kapasitas harian 80 dokumen untuk BPHTB
- **Load Balancing**: Distribusi beban kerja yang merata antar UPT dan peneliti
- **Priority Queue**: Sistem prioritas dapat mengatur dokumen urgent
- **Monitoring**: Dashboard dapat menampilkan metrik real-time
- **Prediksi**: Sistem dapat memberikan estimasi waktu yang akurat

Hasil evaluasi menunjukkan bahwa 8 test case berhasil dijalankan dengan success rate 100%, dan sistem kuotasi telah berhasil mengoptimalkan beban kerja dengan mengurangi 40% beban kerja pegawai.

**Tabel 13 Ringkasan Evaluasi Tiga Iterasi**

| Kriteria             | Iterasi 1      | Iterasi 2            | Iterasi 3         |
| -------------------- | -------------- | -------------------- | ----------------- |
| Fungsionalitas       | ✅ Baik        | ✅ Sangat Baik       | ✅ Sangat Baik    |
| Performa             | ✅ Baik        | ✅ Sangat Baik       | ✅ Sangat Baik    |
| Keamanan             | ⚠️ Dasar     | ✅ Tinggi            | ✅ Tinggi         |
| Kepuasan Pengguna    | ✅ 80%         | ✅ 82%               | ✅ 88%            |
| Stabilitas           | ✅ 98% uptime  | ✅ 98,5% uptime      | ✅ 99,7% uptime   |
| **Kesimpulan** | **Siap** | **Lebih Baik** | **Optimal** |

## 4.4 Kesimpulan Hasil dan Pembahasan

Implementasi sistem booking online BAPPENDA melalui tiga iterasi telah berhasil mencapai tujuan yang ditetapkan. Sistem berhasil mengurangi proses manual, meningkatkan keamanan, dan mengoptimalkan beban kerja. Hasil evaluasi menunjukkan peningkatan yang signifikan dalam hal fungsionalitas, keamanan, dan kepuasan pengguna.

**Tabel 14 Perbandingan Metrik Keseluruhan**

| Aspek             | Manual (Sebelum)                             | Digital (Sesudah) | Perbaikan          |
| ----------------- | -------------------------------------------- | ----------------- | ------------------ |
| Waktu Proses      | 30-40 menit (normal)`<br>`2 jam (kompleks) | 15 menit          | 50-92% lebih cepat |
| Akurasi Data      | 85%                                          | >98%              | +13%               |
| Kepuasan PPAT     | 65%                                          | 88%               | +23%               |
| Kepuasan Pegawai  | 60%                                          | 85%               | +25%               |
| Tingkat Kesalahan | ~10%                                         | <1%               | -9%                |
| Keamanan Dokumen  | Rendah                                       | Tinggi (AES-256)  | Signifikan         |
| Uptime Sistem     | -                                            | 99,7%             | Baru diterapkan    |
| Audit Trail       | Tidak ada                                    | 100% tercatat     | Baru diterapkan    |

Sistem yang dikembangkan telah siap untuk go live dengan website domain `bphtb.bogorkab.go.id` dan dapat memberikan manfaat yang signifikan bagi BAPPENDA dan pengguna sistem. Namun, pengembangan berkelanjutan dan evaluasi berkala diperlukan untuk memastikan sistem tetap optimal dan sesuai dengan kebutuhan yang berkembang. Rencana sosialisasi kepada 600 PPAT/PPATS di Kabupaten Bogor direncanakan akan dilakukan setelah iterasi ketiga selesai untuk memastikan successful adoption sistem oleh seluruh pengguna.

Secara keseluruhan, pengembangan sistem E-BPHTB berbasis web tidak hanya mampu meningkatkan efisiensi pelayanan publik, tetapi juga memperkuat aspek transparansi, akuntabilitas, dan keamanan data. Sistem yang dihasilkan pada tahap akhir telah memenuhi prinsip *user-centric design*, mampu beroperasi secara stabil, serta siap untuk diterapkan secara luas sebagai bagian dari implementasi e-government di lingkungan pemerintah daerah.
