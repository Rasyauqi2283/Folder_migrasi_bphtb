# TEKS UNTUK BAGIAN HASIL ITERASI 1 - TABEL ACTIVITY DIAGRAM

## Posisi: Di 4.1.1.2 Hasil Implementasi Iterasi 1
## Letak: Setelah paragraf pembuka, sebelum Tabel Struktur Database

---

### 4.1.1.2 Hasil Implementasi Iterasi 1

Iterasi pertama berhasil membangun fondasi sistem *booking online* yang fungsional dengan implementasi 13 tabel database utama yang mencakup pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop, ltb_1_terima_berkas_sspd, p_1_verifikasi, p_3_clear_to_paraf, pv_1_paraf_validate, lsb_1_serah_berkas, pat_6_sign, pat_8_validasi_tambahan, dan p_2_verif_sign, serta a_1_unverified_users dan a_2_verified_users untuk manajemen pengguna.

Selain empat activity diagram utama yang telah dijelaskan secara detail pada bagian Proses Pengembangan Iterasi 1 (Activity Diagram Create Booking, Generate No. Booking, Upload Document, dan PPAT Send to LTB), sistem juga memiliki 37 activity diagram tambahan yang menggambarkan proses-proses pendukung dalam sistem booking online. Activity diagram tambahan ini mencakup proses login dan registrasi, penambahan tanda tangan manual, validasi tambahan, proses penerimaan dan pengiriman dokumen antar divisi, serta proses update status. Untuk menjaga fokus pembahasan, seluruh 41 activity diagram (termasuk 4 yang telah dijelaskan sebelumnya) disajikan secara ringkas dalam Tabel 5 berikut, sedangkan diagram lengkapnya dapat dilihat pada Lampiran sesuai nomor yang tercantum.

**Tabel 5: Daftar Activity Diagram Iterasi 1**

| No | Nama Activity Diagram | Deskripsi Lengkap | Lampiran |
|----|----------------------|-------------------|----------|
| 1 | Login dan Register | **Aktor:** User, Sistem. **Alur:** Proses login dan registrasi dengan OTP verification, validasi password, serta session management. | Lampiran 1 - Activity Diagram Login & Register<br>Lampiran 2 - Halaman Login<br>Lampiran 3 - Halaman Registrasi |
| 2 | Create Booking | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Pembuatan booking SSPD melalui pengisian data wajib pajak, pemilik objek pajak, perhitungan NJOP, data objek pajak, validasi input, dan penyimpanan data. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 4 - Form Create Booking<br>Lampiran 5 - Detail Objek Pajak |
| 3 | Generate No. Booking | **Aktor:** Database Trigger, Sistem. **Alur:** Generate nomor booking otomatis menggunakan trigger (BEFORE INSERT) dengan format ppat_khusus-YYYY-000001. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)* |
| 4 | Add Manual Signature | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Upload tanda tangan manual, validasi file (JPG/PNG maksimal 2MB), preview, dan penyimpanan. | Lampiran 6 - Activity Diagram Add Manual Signature<br>Lampiran 7 - Halaman Upload Tanda Tangan |
| 5 | Upload Document | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Upload dokumen pendukung (Akta, Sertifikat, Pelengkap), validasi tipe dokumen dan ukuran file, penyimpanan dengan metadata. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 8 - Halaman Upload Dokumen Pendukung |
| 6 | PPAT Delete Document | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Penghapusan dokumen yang sudah diupload dengan validasi ownership dan status booking (hanya status Draft yang bisa dihapus), hapus dari storage dan database. | Lampiran 9 - Activity Diagram PPAT Delete Document<br>Lampiran 10 - Halaman Delete Document |
| 7 | PPAT View Document (Uploaded) | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Melihat dokumen yang sudah diupload (Akta, Sertifikat, Pelengkap) dengan preview di browser. | Lampiran 11 - Activity Diagram PPAT View Document (Uploaded)<br>Lampiran 12 - Halaman View Uploaded Document |
| 8 | PPAT View Generated PDF SSPD | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Melihat dokumen SSPD yang digenerate oleh sistem dalam format PDF melalui endpoint generate-pdf-bookingsspd. | Lampiran 13 - Activity Diagram PPAT View Generated PDF SSPD<br>Lampiran 14 - Halaman View PDF SSPD |
| 9 | PPAT View Generated PDF Permohonan Validasi | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Melihat dokumen Permohonan Validasi yang digenerate oleh sistem dalam format PDF melalui endpoint generate-pdf-mohon-validasi. | Lampiran 15 - Activity Diagram PPAT View Generated PDF Permohonan Validasi<br>Lampiran 16 - Halaman View PDF Permohonan Validasi |
| 10 | PPAT Fill Form Permohonan Validasi | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Mengisi formulir permohonan validasi (data alamat pemohon, kampung OP, kelurahan OP, kecamatan OP, keterangan), validasi form, dan menyimpan ke pat_8_validasi_tambahan. | Lampiran 17 - Activity Diagram PPAT Fill Form Permohonan Validasi<br>Lampiran 18 - Halaman Fill Form Permohonan Validasi |
| 11 | PPAT Send to LTB | **Aktor:** PPAT/PPATS, Sistem. **Alur:** PPAT mengirim booking ke LTB dengan validasi ownership & status (Draft), generate no_registrasi, insert ke ltb_1_terima_berkas_sspd, update pat_1_bookingsspd (trackstatus='Dikirim ke LTB'), commit transaction, dan notifikasi real-time ke LTB. **Catatan:** Tanpa sistem kuotasi (kuotasi ditambahkan di Iterasi 3). | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 19 - Halaman Kirim ke LTB (Button Kirim ke Bappenda) |
| 12 | LTB Receive from PPAT | **Aktor:** LTB, Sistem. **Alur:** LTB menerima notifikasi dari PPAT, membuka dashboard LTB, melihat daftar booking dengan status 'Diolah' dan trackstatus 'Diterima' dari ltb_1_terima_berkas_sspd, memilih booking, dan melihat detail booking lengkap. | Lampiran 20 - Activity Diagram LTB Receive from PPAT<br>Lampiran 21 - Dashboard LTB<br>Lampiran 22 - Tampilan Laman LTB Receive Doc |
| 13 | LTB Generate No. Registrasi | **Aktor:** LTB, Sistem. **Alur:** Generate nomor registrasi otomatis dengan format YYYYO00001 menggunakan query MAX sequence. | Lampiran 23 - Activity Diagram LTB Generate No. Registrasi |
| 14 | LTB Validate Document | **Aktor:** LTB, Sistem. **Alur:** Review dokumen (Akta, Sertifikat, Tanda Tangan), cek kelengkapan dan konsistensi data sebelum Accept/Reject. | Lampiran 24 - Activity Diagram LTB Validate Document<br>Lampiran 25 - Halaman Validasi Dokumen LTB |
| 15 | LTB Accept | **Aktor:** LTB, Sistem. **Alur:** Penentuan status diterima, insert ke p_1_verifikasi, update status di ltb_1_terima_berkas_sspd dan pat_1_bookingsspd, dan notifikasi ke Peneliti. | Lampiran 26 - Activity Diagram LTB Accept<br>Lampiran 27 - Halaman Status Accept |
| 16 | LTB Reject | **Aktor:** LTB, Sistem. **Alur:** Penentuan status ditolak, penyimpanan alasan penolakan, update status, dan notifikasi ke PPAT. | Lampiran 28 - Activity Diagram LTB Reject<br>Lampiran 29 - Halaman Status Reject |
| 17 | Peneliti Receive from LTB | **Aktor:** Peneliti, Sistem. **Alur:** Peneliti menerima notifikasi dari LTB, membuka booking yang diterima, melihat booking yang perlu diverifikasi. | Lampiran 30 - Activity Diagram Peneliti Receive from LTB<br>Lampiran 31 - Dashboard Peneliti Verifikasi<br>Lampiran 32 - Halaman Receive from LTB |
| 18 | Peneliti View Document | **Aktor:** Peneliti, Sistem. **Alur:** Melihat dokumen yang perlu diverifikasi (dokumen uploaded, generated PDF SSPD) dengan preview di browser. | Lampiran 33 - Activity Diagram Peneliti View Document<br>Lampiran 34 - Halaman View Document Peneliti |
| 19 | Peneliti Verifikasi | **Aktor:** Peneliti, Sistem. **Alur:** Memverifikasi dokumen, menambahkan tanda tangan manual, drop gambar tanda tangan, update p_2_verif_sign dan p_1_verifikasi, dan mengirim ke Clear to Paraf. | Lampiran 35 - Activity Diagram Peneliti Verifikasi<br>Lampiran 36 - Halaman Verifikasi Peneliti<br>Lampiran 37 - Tampilan Laman Peneliti tahap Verifikasi |
| 20 | Peneliti Persetujuan Paraf | **Aktor:** Peneliti, Sistem. **Alur:** Memilih radio button "Setujui Paraf" setelah verifikasi dokumen selesai, validasi tanda tangan sudah ada, update p_1_verifikasi. | Lampiran 38 - Activity Diagram Peneliti Persetujuan Paraf<br>Lampiran 39 - Halaman Persetujuan Paraf |
| 21 | Peneliti Pemilihan | **Aktor:** Peneliti, Sistem. **Alur:** Memilih opsi pemilihan (Penghitung Wajib Pajak, STPD Kurang Bayar, Dihitung Sendiri, Lainnya Penghitung WP), update p_1_verifikasi. | Lampiran 40 - Activity Diagram Peneliti Pemilihan<br>Lampiran 41 - Halaman Pemilihan Peneliti |
| 22 | Peneliti Send to Clear to Paraf | **Aktor:** Peneliti, Sistem. **Alur:** Mengirim hasil verifikasi ke Clear to Paraf dengan validasi kelengkapan data (persetujuan & pemilihan), update p_2_verif_sign, p_1_verifikasi, insert ke p_3_clear_to_paraf, update pat_1_bookingsspd. | Lampiran 42 - Activity Diagram Peneliti Send to Clear to Paraf<br>Lampiran 43 - Halaman Send to Clear to Paraf |
| 23 | Peneliti Reject | **Aktor:** Peneliti, Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update p_1_verifikasi dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 44 - Activity Diagram Peneliti Reject<br>Lampiran 45 - Halaman Peneliti Reject |
| 24 | Generate No. Validasi | **Aktor:** Sistem. **Alur:** Generate nomor validasi otomatis dengan format 8acak-3acak ketika Clear to Paraf mengirim ke Peneliti Validasi, update pat_7_validasi_surat. | Lampiran 46 - Activity Diagram Generate No. Validasi |
| 25 | Peneliti Paraf Receive | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Peneliti Paraf menerima notifikasi dari Peneliti, membuka booking, melihat booking yang diterima dari p_3_clear_to_paraf (Status: Pending). | Lampiran 47 - Activity Diagram Peneliti Paraf Receive<br>Lampiran 48 - Dashboard Peneliti Paraf<br>Lampiran 49 - Halaman Receive Peneliti Paraf |
| 26 | Peneliti Paraf View Document | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Melihat dokumen yang sudah diverifikasi (dokumen uploaded, generated PDF SSPD) dengan preview di browser. | Lampiran 50 - Activity Diagram Peneliti Paraf View Document<br>Lampiran 51 - Halaman View Document Peneliti Paraf |
| 27 | Peneliti Paraf Give Paraf | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Upload paraf dan stempel (drop gambar), validasi file (JPG/PNG maksimal 2MB), penyimpanan ke secure storage, dan update p_3_clear_to_paraf. | Lampiran 52 - Activity Diagram Peneliti Paraf Give Paraf<br>Lampiran 53 - Halaman Give Paraf<br>Lampiran 54 - Proses Paraf |
| 28 | Peneliti Paraf Send to Validasi | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Mengirim ke Peneliti Validasi dengan validasi kelengkapan paraf, update p_3_clear_to_paraf, insert ke pv_1_paraf_validate, update pat_1_bookingsspd, dan notifikasi. | Lampiran 55 - Activity Diagram Peneliti Paraf Send to Validasi<br>Lampiran 56 - Halaman Send to Peneliti Validasi |
| 29 | Peneliti Paraf Reject | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update p_3_clear_to_paraf dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 57 - Activity Diagram Peneliti Paraf Reject<br>Lampiran 58 - Halaman Peneliti Paraf Reject |
| 30 | Peneliti Validasi Receive | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Peneliti Validasi menerima notifikasi dari Clear to Paraf, membuka booking, melihat booking yang diterima dari pv_1_paraf_validate (Status: Pending). | Lampiran 59 - Activity Diagram Peneliti Validasi Receive<br>Lampiran 60 - Dashboard Peneliti Validasi<br>Lampiran 61 - Halaman Receive Peneliti Validasi |
| 31 | Peneliti Validasi View Document | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melihat dokumen yang sudah diparaf (dokumen uploaded, generated PDF SSPD) dengan preview di browser. | Lampiran 62 - Activity Diagram Peneliti Validasi View Document<br>Lampiran 63 - Halaman View Document Peneliti Validasi |
| 32 | Peneliti Validasi Final Validation | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melakukan final validation dengan mereview dokumen yang sudah diparaf, menentukan valid/tidak valid, dan menyimpan hasil validasi ke pv_1_paraf_validate. | Lampiran 64 - Activity Diagram Peneliti Validasi Final Validation<br>Lampiran 65 - Halaman Final Validation<br>Lampiran 66 - Tampilan Laman tahap Pejabat |
| 33 | Peneliti Validasi Manual Signature | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Menambahkan tanda tangan manual, drop gambar tanda tangan, validasi file (JPG/PNG maksimal 2MB), penyimpanan ke secure storage, dan update pv_1_paraf_validate. | Lampiran 67 - Activity Diagram Peneliti Validasi Manual Signature<br>Lampiran 68 - Halaman Upload Tanda Tangan Peneliti Validasi |
| 34 | Peneliti Validasi View QR Code | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melihat QR Code (hanya pajangan - tidak fungsional di Iterasi 1, tidak ada generate QR code). | Lampiran 68 - Activity Diagram Peneliti Validasi View QR Code<br>Lampiran 69 - Halaman View QR Code (Pajangan) |
| 35 | Peneliti Validasi Send to LSB | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Mengirim ke LSB dengan validasi kelengkapan data (validasi & tanda tangan), update pv_1_paraf_validate, insert ke lsb_1_serah_berkas, update pat_1_bookingsspd, dan notifikasi. | Lampiran 70 - Activity Diagram Peneliti Validasi Send to LSB<br>Lampiran 71 - Halaman Send to LSB |
| 36 | Peneliti Validasi Reject | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update pv_1_paraf_validate dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 72 - Activity Diagram Peneliti Validasi Reject<br>Lampiran 73 - Halaman Peneliti Validasi Reject |
| 37 | LSB Receive from Peneliti Validasi | **Aktor:** Peneliti Validasi (Pejabat), LSB, Sistem. **Alur:** Peneliti Validasi mengirim dokumen ke LSB, dilakukan validasi akhir sebelum pengiriman, update status proses, insert ke lsb_1_serah_berkas dengan status 'Pending Handover', update pv_1_paraf_validate dan pat_1_bookingsspd. | Lampiran 74 - Activity Diagram LSB Receive from Peneliti Validasi<br>Lampiran 75 - Halaman Pengiriman ke LSB<br>Lampiran 76 - Tampilan Laman LSB Receive Doc |
| 38 | LSB Manual Handover | **Aktor:** LSB, PPAT/PPATS, Sistem. **Alur:** Serah terima dokumen dari LSB ke PPAT, verifikasi identitas PPAT dan dokumen fisik, update lsb_1_serah_berkas dan pat_1_bookingsspd. | Lampiran 77 - Activity Diagram LSB Manual Handover<br>Lampiran 78 - Halaman Serah Terima Dokumen |
| 39 | LSB Update Status | **Aktor:** LSB, Sistem. **Alur:** Update status pasca handover menjadi Diserahkan, update lsb_1_serah_berkas dan pat_1_bookingsspd (trackstatus='Diserahkan'), update pv_1_paraf_validate, dan notifikasi ke PPAT. | Lampiran 79 - Activity Diagram LSB Update Status<br>Lampiran 80 - Halaman Status Diserahkan |
| 40 | Admin Monitor Process | **Aktor:** Admin, Sistem. **Alur:** Admin memantau seluruh proses melalui dashboard, melihat status booking, statistik, dan analytics. | Lampiran 81 - Activity Diagram Admin Monitor Process<br>Lampiran 82 - Dashboard Admin |
| 41 | Admin Send Ping Notifications | **Aktor:** Admin, Sistem. **Alur:** Admin mengirim notifikasi pengingat melalui sistem (long polling) dan email kepada pengguna terkait dengan pemilihan penerima dan penyusunan pesan. | Lampiran 83 - Activity Diagram Admin Send Ping Notifications<br>Lampiran 84 - Halaman Kirim Notifikasi |

**Keterangan Tabel 5:**
- **Total Activity Diagram Iterasi 1:** 41 Activity Diagram
- **Activity Diagram yang dijelaskan detail di Proses Pengembangan (4.1.1.1):** 4 Activity Diagram (No 2: Create Booking, No 3: Generate No. Booking, No 5: Upload Document, No 11: PPAT Send to LTB). Activity diagram ini tidak dicetak ulang di Lampiran karena sudah dijelaskan secara detail di bagian Proses Pengembangan.
- **Activity Diagram yang dicetak di Lampiran:** 36 Activity Diagram (Activity Diagram lengkap dapat dilihat di Lampiran 1, 6, 9, 11, 13, 15, 17, 20, 23, 24, 26, 28, 30, 33, 35, 38, 40, 42, 44, 46, 47, 50, 52, 55, 57, 59, 62, 64, 67, 70, 72, 74, 77, 79, 81, 83)
- **Tampilan Website di Lampiran:** 48 Lampiran (dapat dilihat pada Lampiran sesuai nomor yang tercantum di kolom Lampiran)
- **Total Lampiran Iterasi 1:** 84 Lampiran (Lampiran 1-84)

Berikutnya, sistem booking online yang dikembangkan pada Iterasi 1 memiliki struktur database yang terdiri dari 13 tabel utama untuk mendukung seluruh aktivitas booking online. Struktur database ini dirancang untuk memfasilitasi tracking status real-time, manajemen dokumen, dan koordinasi antar divisi yang telah dijelaskan melalui activity diagram di atas.

**Tabel 6 Struktur Database Iterasi 1**

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

Pengujian sistem Iterasi 1 dilakukan dengan pendekatan *black box testing* selama 2 minggu dengan melibatkan 5 penguji yang terdiri dari admin, LTB, peneliti, peneliti Validasi, dan LSB. Setiap butir uji mewakili satu skenario yang menguji interaksi pengguna dengan sistem berdasarkan fungsi yang ada. Evaluasi dilakukan dengan membandingkan kondisi yang diharapkan dan hasil aktual yang diperoleh saat pengujian. Jika statusnya "Berhasil", berarti sistem telah memenuhi spesifikasi yang diharapkan. Hasil pengujian sistem Iterasi 1 menunjukkan bahwa seluruh 15 butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan, yang mencakup pengujian fitur login, pembuatan booking SSPD, verifikasi LTB, pemeriksaan peneliti, validasi, hingga serah terima LSB. Detail lengkap hasil pengujian untuk setiap butir uji dapat dilihat pada Tabel 7 berikut.

**Tabel 7 Hasil Pengujian Iterasi 1**

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

Hasil pengujian dengan *black box testing* menunjukkan bahwa seluruh 15 butir uji berhasil dijalankan sesuai dengan kondisi yang diharapkan, menandakan sistem booking online dasar telah berfungsi dengan baik. Mulai dari login, pembuatan booking SSPD, verifikasi LTB, pemeriksaan peneliti, validasi, hingga serah terima LSB, berjalan sesuai harapan tanpa error.

Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai. Implementasi backend API ini mendukung seluruh fitur booking online yang dijelaskan pada iterasi pertama, memungkinkan komunikasi yang efisien antara frontend dan database, serta memastikan keamanan dan konsistensi data melalui mekanisme autentikasi, autorisasi, dan transaction.

Interface pengguna berhasil dikembangkan menggunakan HTML, CSS, dan JavaScript dengan custom CSS framework yang responsif dan *user-friendly* untuk PPAT/PPATS. Desain antarmuka dirancang dengan pendekatan *user-centered design* untuk memastikan tampilan yang intuitif dan mudah digunakan, sehingga pengguna dapat melakukan proses booking online dengan efisien.

Untuk melihat perbandingan metrik sistem sebelum dan sesudah implementasi Iterasi 1, dapat dilihat pada Tabel 8 berikut.

**Tabel 8: Perbandingan Metrik Sistem Sebelum dan Sesudah Iterasi 1**

| Aspek | Sebelum (Manual) | Sesudah (Digital) | Peningkatan |
|-------|------------------|-------------------|-------------|
| Waktu Proses Per Berkas | 30-40 menit (normal)<br>Hingga 2 jam (kompleks/penumpukan) | 10-25 menit | 33-87% lebih cepat |
| Akurasi Data | 85% | 95% | +10% |
| Tingkat Kesalahan | ~10% | ~5% | -5% |
| Kepuasan Pengguna | 65% | 80% | +15% |
| Efisiensi Pelayanan | Baseline | +40% | Signifikan |
