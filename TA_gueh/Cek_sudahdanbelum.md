| No | Nama Activity Diagram                       | Deskripsi Lengkap                                                                                                                                                                                                                                                                                             | Lampiran                                                                                                                                                                   |
| -- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1  | Login dan Register                          | Aktor:User, Sistem.Alur:Proses login dan registrasi dengan OTP verification, validasi password, serta session management.                                                                                                                                                                                     | Lampiran 1 – Activity Diagram Login & Register<br />Lampiran 2 – Halaman Login<br />Lampiran 3 – Halaman Registrasi                                                     |
| 2  | Create Booking                              | Aktor:PPAT/PPATS, Sistem.Alur:Pembuatan booking SSPD melalui pengisian data wajib pajak, pemilik objek pajak, perhitungan NJOP, data objek pajak, validasi input, dan penyimpanan data.(Activity Diagram dijelaskan di Bab Hasil & Pembahasan – Tidak Masuk Lampiran)                                        | Lampiran 4 – Form Create Booking<br />Lampiran 5 – Detail Objek Pajak                                                                                                    |
| 3  | Add Manual Signature                        | Aktor:PPAT/PPATS, Sistem.Alur:Upload tanda tangan manual, validasi file (JPG/PNG maksimal 2MB), preview, dan penyimpanan.                                                                                                                                                                                     | Lampiran 6 – Activity Diagram Add Manual Signature<br />Lampiran 7 – Halaman Upload Tanda Tangan                                                                         |
| 4  | Upload Document                             | Aktor:PPAT/PPATS, Sistem.Alur:Upload dokumen pendukung (Akta, Sertifikat, Pelengkap), validasi tipe dokumen dan ukuran file, penyimpanan dengan metadata.(Activity Diagram dijelaskan di Bab Hasil & Pembahasan – Tidak Masuk Lampiran)                                                                      | **(Lampiran 8 – Halaman Upload dan View Dokumen Pendukung)**                                                                                                                    |
| 5  | PPAT Delete Document                        | Aktor:PPAT/PPATS, Sistem.Alur:Penghapusan dokumen yang sudah diupload dengan validasi ownership dan status booking (hanya status Draft yang bisa dihapus), hapus dari storage dan database.                                                                                                                   | **(Lampiran 9 – Activity Diagram PPAT Delete Document Lampiran 10 – Halaman Delete Document)**                                                                                 |
| 6  | PPAT View Document (Uploaded)               | Aktor:PPAT/PPATS, Sistem.Alur:Melihat dokumen yang sudah diupload (Akta, Sertifikat, Pelengkap) dengan preview di browser.                                                                                                                                                                                    | **(Lampiran 11 – Activity Diagram PPAT View Document (Uploaded) *(Halaman sama dengan Lampiran 8)*)**                                                                          |
| 7  | PPAT View Generated PDF SSPD                | Aktor:PPAT/PPATS, Sistem.Alur:Melihat dokumen SSPD yang digenerate oleh sistem dalam format PDF melalui endpoint generate-pdf-bookingsspd.                                                                                                                                                                    | Lampiran 13 – Activity Diagram PPAT View Generated PDF SSPDLampiran 14 – Halaman View PDF SSPD                                                                           |
| 8  | PPAT View Generated PDF Permohonan Validasi | Aktor:PPAT/PPATS, Sistem.Alur:Melihat dokumen Permohonan Validasi yang digenerate oleh sistem dalam format PDF melalui endpoint generate-pdf-mohon-validasi.                                                                                                                                                  | Lampiran 15 – Activity Diagram PPAT View Generated PDF Permohonan Validasi Lampiran 16 – Halaman View PDF Permohonan Validasi                                            |
| 9  | PPAT Fill Form Permohonan Validasi          | Aktor:PPAT/PPATS, Sistem.Alur:Mengisi formulir permohonan validasi (alamat pemohon, kampung OP, kelurahan OP, kecamatan OP, keterangan), validasi form, dan menyimpan ke pat_8_validasi_tambahan.                                                                                                             | Lampiran 17 – Activity Diagram PPAT Fill Form Permohonan ValidasiLampiran 18 – Halaman Fill Form Permohonan Validasi                                                     |
| 10 | PPAT Send to LTB                            | Aktor:PPAT/PPATS, Sistem.Alur:PPAT mengirim booking ke LTB dengan validasi ownership & status (Draft), generate no_registrasi, insert ke ltb_1_terima_berkas_sspd, update pat_1_bookingsspd (trackstatus='Dikirim ke LTB'), commit transaction, dan notifikasi real-time ke LTB.Catatan:Tanpa sistem kuotasi. | Lampiran 19 – Halaman Kirim ke LTB                                                                                                                                        |
| 11 | LTB Receive from PPAT                       | Aktor:LTB, Sistem.Alur:LTB menerima notifikasi dari PPAT, membuka dashboard, melihat booking status 'Diolah', dan melihat detail booking.                                                                                                                                                                     | Lampiran 20 – Activity Diagram LTB Receive from PPATLampiran 21 – Dashboard LTBLampiran 22 – LTB Receive Doc                                                            |
| 12 | LTB Generate No. Registrasi                 | Aktor:LTB, Sistem.Alur:Generate nomor registrasi otomatis format YYYYO00001 dengan query MAX sequence.                                                                                                                                                                                                        | Lampiran 23 – Activity Diagram LTB Generate No. Registrasi                                                                                                                |
| 13 | LTB Validate Document                       | Aktor:LTB, Sistem.Alur:Review dokumen, cek kelengkapan dan konsistensi sebelum Accept/Reject.                                                                                                                                                                                                                 | Lampiran 24 – Activity Diagram LTB Validate DocumentLampiran 25 – Halaman Validasi Dokumen LTB                                                                           |
| 14 | LTB Accept                                  | Aktor:LTB, Sistem.Alur:Status diterima, insert ke p_1_verifikasi, update status, notifikasi ke Peneliti.                                                                                                                                                                                                      | Lampiran 26 – Activity Diagram LTB AcceptLampiran 27 – Halaman Status Accept                                                                                             |
| 15 | LTB Reject                                  | Aktor:LTB, Sistem.Alur:Status ditolak, simpan alasan, update status, notifikasi ke PPAT.                                                                                                                                                                                                                      | Lampiran 28 – Activity Diagram LTB RejectLampiran 29 – Halaman Status Reject                                                                                             |
| 16 | Peneliti Receive from LTB                   | Aktor:Peneliti, Sistem.Alur:Peneliti menerima notifikasi dan melihat booking untuk diverifikasi.                                                                                                                                                                                                              | Lampiran 30 – Activity Diagram Peneliti Receive from LTBLampiran 31 – Dashboard PenelitiLampiran 32 – Receive from LTB                                                  |
| 17 | Peneliti View Document                      | Aktor:Peneliti, Sistem.Alur:Melihat dokumen dan PDF SSPD untuk diverifikasi.                                                                                                                                                                                                                                  | Lampiran 33 – Activity Diagram Peneliti View DocumentLampiran 34 – Halaman View Document                                                                                 |
| 18 | Peneliti Verify Document                    | Aktor:Peneliti, Sistem.Alur:Memverifikasi dokumen dengan melakukan review dokumen, validasi data, cek kelengkapan dokumen, dan menentukan status verifikasi (Valid/Tidak Valid, Lengkap/Tidak Lengkap).                                                                                                       | **(Lampiran 35 – Activity Diagram Peneliti Verify Document Lampiran 36 – Halaman Verifikasi Dokumen Peneliti)**                                                                |
| 19 | Peneliti Add Manual Signature               | Aktor:Peneliti, Sistem.Alur:Menambahkan tanda tangan manual dengan upload/drop gambar tanda tangan (JPG/PNG, maksimal 2MB), validasi file, preview tanda tangan, proses image (resize dan optimize), penyimpanan ke secure storage, dan update p_2_verif_sign.                                                | **(Lampiran 37 – Activity Diagram Peneliti Add Manual Signature Lampiran 38 – Halaman Add Manual Signature Peneliti Lampiran 39 – Tampilan Laman Peneliti tahap Verifikasi)** |
| 20 | Peneliti Verifikasi                         | Aktor:Peneliti, Sistem.Alur:Verifikasi, tanda tangan, update p_2_verif_sign dan p_1_verifikasi, kirim ke Clear to Paraf.                                                                                                                                                                                      | Lampiran 40 – Activity Diagram VerifikasiLampiran 41 – Halaman VerifikasiLampiran 42 – Laman Verifikasi                                                                 |
| 21 | Peneliti Persetujuan Paraf                  | Aktor:Peneliti, Sistem.Alur:Setujui paraf dan validasi tanda tangan.                                                                                                                                                                                                                                          | Lampiran 43 – Activity Diagram ParafLampiran 44 – Halaman Paraf                                                                                                          |
| 22 | Peneliti Pemilihan                          | Aktor:Peneliti, Sistem.Alur:Pilih metode penghitungan pajak.                                                                                                                                                                                                                                                  | Lampiran 45 – Activity Diagram PemilihanLampiran 46 – Halaman Pemilihan                                                                                                  |
| 23 | Peneliti Send to Clear to Paraf             | Aktor:Peneliti, Sistem.Alur:Kirim ke Clear to Paraf, update tabel proses dan booking.                                                                                                                                                                                                                         | Lampiran 47 – Activity Diagram SendLampiran 48 – Halaman Send                                                                                                            |
| 24 | Peneliti Reject                             | Aktor:Peneliti, Sistem.Alur:Tolak booking dan kirim notifikasi ke PPAT.                                                                                                                                                                                                                                       | Lampiran 49 – Activity Diagram RejectLampiran 50 – Halaman Reject                                                                                                        |
| 25 | Peneliti Paraf Receive                      | Aktor:Peneliti Paraf, Sistem.Alur:Terima booking status Pending dari p_3_clear_to_paraf.                                                                                                                                                                                                                      | Lampiran 52 – Activity Diagram ReceiveLampiran 53 – Dashboard ParafLampiran 54 – Receive                                                                                |
| 26 | Peneliti Paraf View Document                | Aktor:Peneliti Paraf, Sistem.Alur:Lihat dokumen terverifikasi.                                                                                                                                                                                                                                                | Lampiran 55 – Activity Diagram ViewLampiran 56 – Halaman View                                                                                                            |
| 27 | Peneliti Paraf Give Paraf                   | Aktor:Peneliti Paraf, Sistem.Alur:Upload paraf dan update p_3_clear_to_paraf.                                                                                                                                                                                                                                 | Lampiran 57 – Activity Diagram GiveLampiran 58 – Halaman GiveLampiran 59 – Proses                                                                                       |
| 28 | Peneliti Paraf Send to Validasi             | Aktor:Peneliti Paraf, Sistem.Alur:Kirim ke Peneliti Validasi.                                                                                                                                                                                                                                                 | Lampiran 60 – Activity Diagram SendLampiran 61 – Halaman Send                                                                                                            |
| 29 | Peneliti Paraf Reject                       | Aktor:Peneliti Paraf, Sistem.Alur:Tolak booking dan notifikasi ke PPAT.                                                                                                                                                                                                                                       | Lampiran 62 – Activity Diagram RejectLampiran 63 – Halaman Reject                                                                                                        |
| 30 | Generate No. Validasi                       | Aktor:Sistem.Alur:Generate nomor validasi format 8acak-3acak dan simpan ke pat_7_validasi_surat.                                                                                                                                                                                                              | Lampiran 51 – Activity Diagram Generate                                                                                                                                   |
| 31 | Peneliti Validasi Receive                   | Aktor:Peneliti Validasi, Sistem.Alur:Terima booking dari pv_1_paraf_validate.                                                                                                                                                                                                                                 | Lampiran 64 – Activity Diagram ReceiveLampiran 65 – DashboardLampiran 66 – Receive                                                                                      |
| 32 | Peneliti Validasi View Document             | Aktor:Peneliti Validasi, Sistem.Alur:Lihat dokumen terparaf.                                                                                                                                                                                                                                                  | Lampiran 67 – Activity Diagram ViewLampiran 68 – Halaman View                                                                                                            |
| 33 | Peneliti Validasi Final Validation          | Aktor:Peneliti Validasi, Sistem.Alur:Final validasi dan simpan hasil.                                                                                                                                                                                                                                         | Lampiran 69 – Activity Diagram FinalLampiran 70 – Halaman FinalLampiran 71 – Laman Pejabat                                                                              |
| 34 | Peneliti Validasi Manual Signature          | Aktor:Peneliti Validasi, Sistem.Alur:Upload tanda tangan pejabat.                                                                                                                                                                                                                                             | Lampiran 72 – Activity Diagram SignatureLampiran 73 – Halaman Upload                                                                                                     |
| 35 | Peneliti Validasi View QR Code              | Aktor:Peneliti Validasi, Sistem.Alur:Menampilkan QR Code (pajangan).                                                                                                                                                                                                                                          | Lampiran 74 – Activity Diagram QRLampiran 75 – Halaman QR                                                                                                                |
| 36 | Peneliti Validasi Send to LSB               | Aktor:Peneliti Validasi, Sistem.Alur:Kirim dokumen ke LSB.                                                                                                                                                                                                                                                    | Lampiran 76 – Activity Diagram SendLampiran 77 – Halaman Send                                                                                                            |
| 37 | Peneliti Validasi Reject                    | Aktor:Peneliti Validasi, Sistem.Alur:Tolak booking.                                                                                                                                                                                                                                                           | Lampiran 78 – Activity Diagram RejectLampiran 79 – Halaman Reject                                                                                                        |
| 38 | LSB Receive from Peneliti Validasi          | Aktor:LSB, Sistem.Alur:Terima dokumen dari pejabat.                                                                                                                                                                                                                                                           | Lampiran 80 – Activity Diagram ReceiveLampiran 81 – Halaman KirimLampiran 82 – Receive                                                                                  |
| 39 | LSB Manual Handover                         | Aktor:LSB, PPAT/PPATS, Sistem.Alur:Serah terima fisik dokumen.                                                                                                                                                                                                                                                | Lampiran 83 – Activity Diagram HandoverLampiran 84 – Halaman Handover                                                                                                    |
| 40 | LSB Update Status                           | Aktor:LSB, Sistem.Alur:Update status menjadi Diserahkan.                                                                                                                                                                                                                                                      | Lampiran 85 – Activity Diagram UpdateLampiran 86 – Halaman Status                                                                                                        |
| 41 | Admin Monitor Process                       | Aktor:Admin, Sistem.Alur:Monitoring proses dan statistik.                                                                                                                                                                                                                                                     | Lampiran 87 – Activity Diagram MonitorLampiran 88 – Dashboard                                                                                                            |
| 42 | Admin Send Ping Notifications               | Aktor:Admin, Sistem.Alur:Kirim notifikasi pengingat via sistem dan email.                                                                                                                                                                                                                                     | Lampiran 89 – Activity Diagram NotifikasiLampiran 90 – Halaman Kirim                                                                                                     |

| No | Nama Activity Diagram                                      | Deskripsi Lengkap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Lampiran                                                                                                              |
| -- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1  | Upload Tanda Tangan Sekali (Iterasi 2)                     | Aktor:PPAT/PPATS, Sistem.Alur:Upload tanda tangan sekali untuk digunakan berulang kali. Proses meliputi upload tanda tangan (JPG/PNG maksimal 2MB), validasi file, preview signature, simpan ke secure storage, update a_2_verified_users.tanda_tangan_path dengan reusable flag, dan menampilkan konfirmasi tanda tangan tersimpan.(Activity Diagram dijelaskan di Bab Hasil & Pembahasan – Tidak Masuk Lampiran)                                                                                                                   | Lampiran 85 – Halaman Upload Tanda Tangan Sekali                                                                     |
| 2  | Peneliti Auto Fill Signature Reusable (Iterasi 2)          | Aktor:Peneliti, Sistem.Alur:Sistem otomatis mengisi tanda tangan reusable dari database ke booking baru. Proses meliputi mengambil tanda tangan reusable dari a_2_verified_users.tanda_tangan_path berdasarkan userid Peneliti, cek tanda tangan ada, auto fill signature ke pat_6_sign (copy tanda_tangan_path ke signature_path, signature_type='reusable'), update pat_1_bookingsspd jika diperlukan, dan menampilkan tanda tangan otomatis terisi.(Activity Diagram dijelaskan di Bab Hasil & Pembahasan – Tidak Masuk Lampiran) | Lampiran 86 – Halaman Auto Fill Signature Peneliti                                                                   |
| 3  | Admin Validasi QR Code (Iterasi 2)                         | Aktor:Admin, Sistem.Alur:Admin melakukan validasi QR code pada dokumen validasi. Sistem membaca payload QR code (NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR\|nomor_validasi), memverifikasi dengan database (pat_7_validasi_surat, pv_1_paraf_validate), cek validitas sertifikat digital, menampilkan hasil (valid/tidak valid) dan mencatat audit trail.(Activity Diagram dijelaskan di Bab Hasil & Pembahasan – Tidak Masuk Lampiran)                                                                                 | Lampiran 87 – Halaman Validasi QR Code Admin                                                                         |
| 4  | Generate Sertifikat Digital Lokal (Iterasi 2)              | Aktor:Peneliti Validasi (Pejabat), Sistem.Alur:Generate sertifikat digital lokal menggunakan ECDSA-P256, enkripsi passphrase dengan scrypt (N=16384, r=8, p=1), generate serial number 8 byte hex, fingerprint SHA-256, revoke sertifikat lama, insert ke pv_local_certs dengan status active dan validitas 365 hari.                                                                                                                                                                                                                 | Lampiran 88 – Activity Diagram Generate Sertifikat Digital Lokal Lampiran 89 – Halaman Generate Sertifikat Digital  |
| 5  | Generate QR Code (Iterasi 2)                               | Aktor:Peneliti Validasi (Pejabat), Sistem.Alur:Generate QR code publik & internal dengan payload NIP/tanggal/special_parafv//E-BPHTB BAPPENDA KAB BOGOR\|nomor_validasi, generate image 256×256, simpan ke /penting_F_simpan/qr_code_place/, update database.                                                                                                                                                                                                                                                                        | Lampiran 90 – Activity Diagram Generate QR Code Lampiran 91 – Halaman Generate QR Code                              |
| 6  | Display QR Code di Dokumen (Iterasi 2)                     | Aktor:Sistem.Alur:Ambil QR code dari database, load image, bangun PDF validasi via PDFKit, embed QR (100×100, margin 50px), tampilkan info tanda tangan (NIP, special_parafv), simpan ke /penting_F_simpan/pdf_validasi/, update database.                                                                                                                                                                                                                                                                                           | Lampiran 92 – Activity Diagram Display QR Code di Dokumen Lampiran 93 – Halaman Dokumen dengan QR Code              |
| 7  | Integrasi Bank dengan LTB Parallel Workflow (Iterasi 2)    | Aktor:PPAT/PPATS, LTB, Bank, Sistem.Alur:PPAT mengirim booking ke LTB & Bank secara paralel. LTB memverifikasi berkas dan Bank memverifikasi pembayaran. Setelah keduanya selesai, sistem melakukan sinkronisasi data (ltb_1_terima_berkas_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak), update status booking, dan kirim notifikasi.                                                                                                                                                                                            | Lampiran 94 – Activity Diagram Integrasi Bank dengan LTB Parallel Workflow Lampiran 95 – Halaman Parallel Workflow  |
| 8  | Verifikasi Digital Signature (Iterasi 2)                   | Aktor:Peneliti Validasi (Pejabat), Sistem.Alur:Ambil sertifikat dari pv_local_certs, input passphrase, verifikasi dengan scrypt & timingSafeEqual, set session pv_local_cert, tampilkan hasil verifikasi.                                                                                                                                                                                                                                                                                                                             | Lampiran 96 – Activity Diagram Verifikasi Digital Signature Lampiran 97 – Halaman Verifikasi Digital Signature      |
| 9  | PPAT Auto Fill Signature (Iterasi 2)                       | Aktor:PPAT/PPATS, Sistem.Alur:Sistem mengambil tanda tangan reusable dari a_2_verified_users, mengisi ke pat_6_sign (signature_type='reusable'), update pat_1_bookingsspd, dan menampilkan tanda tangan otomatis.                                                                                                                                                                                                                                                                                                                     | Lampiran 98 – Activity Diagram PPAT Auto Fill Signature Lampiran 99 – Halaman Auto Fill Signature PPAT              |
| 10 | Generate Nomor Validasi (Iterasi 2)                        | Aktor:Sistem.Alur:Generate nomor validasi format 7acak-3acak, cek unik di pat_7_validasi_surat, simpan nomor validasi dengan status dan timestamp.                                                                                                                                                                                                                                                                                                                                                                                    | Lampiran 100 – Activity Diagram Generate Nomor Validasi Lampiran 101 – Halaman Nomor Validasi                       |
| 11 | Select Reusable Signature – Peneliti Validasi (Iterasi 2) | Aktor:Peneliti Validasi, Sistem.Alur:Ambil tanda tangan reusable dari a_2_verified_users, load image, simpan ke pv_1_paraf_validate.tanda_tangan_path, tampilkan preview.                                                                                                                                                                                                                                                                                                                                                             | Lampiran 102 – Activity Diagram Select Reusable Signature Lampiran 103 – Halaman Select Reusable Signature          |
| 12 | Real-time Notifications (Iterasi 2)                        | Aktor:Admin, Sistem.Alur:Long polling tiap 5 detik, ambil notifikasi sys_notifications status unread, push ke client, Admin kirim notifikasi baru & email opsional.                                                                                                                                                                                                                                                                                                                                                                   | Lampiran 104 – Activity Diagram Real-time Notifications Lampiran 105 – Halaman Real-time Notifications              |
| 13 | Bank Cek Validasi Pembayaran Detail (Iterasi 2)            | Aktor:Bank, Sistem.Alur:Bank melihat detail booking, input data pembayaran, verifikasi, update bank_1_cek_hasil_transaksi, update pat_2_bphtb_perhitungan & pat_4_objek_pajak.                                                                                                                                                                                                                                                                                                                                                        | Lampiran 106 – Activity Diagram Bank Cek Validasi Pembayaran Detail Lampiran 107 – Halaman Validasi Pembayaran Bank |
| 14 | Bank Hasil Transaksi (Iterasi 2)                           | Aktor:Bank, Sistem.Alur:Bank melihat transaksi terverifikasi, join dengan pat_1_bookingsspd, dan export laporan.                                                                                                                                                                                                                                                                                                                                                                                                                      | Lampiran 108 – Activity Diagram Bank Hasil Transaksi Lampiran 109 – Halaman Hasil Transaksi Bank                    |
| 15 | Sinkronisasi Bank-LTB (Iterasi 2)                          | Aktor:Sistem.Alur:Ambil data dari Bank & LTB, update ltb_1_terima_berkas_sspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_1_bookingsspd, kirim notifikasi dan commit transaction.                                                                                                                                                                                                                                                                                                                                                | Lampiran 110 – Activity Diagram Sinkronisasi Bank-LTB Lampiran 111 – Halaman Sinkronisasi Bank-LTB                  |
| 16 | Bank Login (Iterasi 2)                                     | Aktor:Bank, Sistem.Alur:Validasi kredensial a_2_verified_users role Bank, set session dan redirect ke dashboard.                                                                                                                                                                                                                                                                                                                                                                                                                      | Lampiran 112 – Activity Diagram Bank Login Lampiran 113 – Halaman Login Bank                                        |
| 17 | Bank View Dashboard (Iterasi 2)                            | Aktor:Bank, Sistem.Alur:Menampilkan statistik booking, daftar pending, grafik pembayaran dan refresh real-time.                                                                                                                                                                                                                                                                                                                                                                                                                       | Lampiran 114 – Activity Diagram Bank View Dashboard Lampiran 115 – Dashboard Bank                                   |
| 18 | Bank View Booking List (Iterasi 2)                         | Aktor:Bank, Sistem.Alur:Menampilkan daftar booking pending verifikasi dari bank_1_cek_hasil_transaksi, filter & search.                                                                                                                                                                                                                                                                                                                                                                                                               | Lampiran 116 – Activity Diagram Bank View Booking List Lampiran 117 – Halaman Daftar Booking Bank                   |
| 19 | Bank View Booking Detail (Iterasi 2)                       | Aktor:Bank, Sistem.Alur:Menampilkan detail booking (pat_1_bookingsspd, pat_4_objek_pajak, pat_2_bphtb_perhitungan) dan dokumen.                                                                                                                                                                                                                                                                                                                                                                                                       | Lampiran 118 – Activity Diagram Bank View Booking Detail Lampiran 119 – Halaman Detail Booking Bank                 |
| 20 | Bank Input Payment Data (Iterasi 2)                        | Aktor:Bank, Sistem.Alur:Input data pembayaran, validasi format, preview dan simpan sementara.                                                                                                                                                                                                                                                                                                                                                                                                                                         | Lampiran 120 – Activity Diagram Bank Input Payment Data Lampiran 121 – Halaman Input Data Pembayaran Bank           |
| 21 | Bank Verify Payment (Iterasi 2)                            | Aktor:Bank, Sistem.Alur:Validasi nomor bukti, tanggal, jumlah BPHTB dan tampilkan hasil verifikasi.                                                                                                                                                                                                                                                                                                                                                                                                                                   | Lampiran 122 – Activity Diagram Bank Verify Payment Lampiran 123 – Halaman Verifikasi Pembayaran Bank               |
| 22 | Bank Save Verification (Iterasi 2)                         | Aktor:Bank, Sistem.Alur:Simpan hasil verifikasi ke bank_1_cek_hasil_transaksi, update pat_2_bphtb_perhitungan & pat_4_objek_pajak, trigger sinkronisasi dengan LTB, commit dan tampilkan sukses.                                                                                                                                                                                                                                                                                                                                      | Lampiran 124 – Activity Diagram Bank Save Verification Lampiran 125 – Halaman Simpan Verifikasi Bank                |

LAMPIRAN

ITERASI 1

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c69eff61-a482-40ee-924c-50e3f88480bb)

Lampiran 1Activity Diagram Masuk dan Registrasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/e8131b33-a728-4a37-9c35-ce0db9e8407a)

Lampiran 2 Halaman Login

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/72acc984-410c-4edd-9665-cc1b3ae5038f)

Lampiran 3 Halaman Registrasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c5bb48c7-216c-481c-8fb1-8db92b504d82)

Lampiran 4 Halaman Pembuatan Form Booking

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/423e5f7c-5905-4578-a3a1-ba3890a8b389)

Lampiran 5 Detail Objek Pajak

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/b0a92391-cffc-4530-83f8-ad125fc78490)

Lampiran 6 Activity Diagram Upload Tanda Tangan (Manual)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/45dde2db-87b9-4639-b335-3a9e91c8eb99)

Lampiran 7 Tampilan Upload Tanda Tangan (Manual)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/64920467-9887-4619-b0b5-5bdf296911af)

**(Lampiran 8 Halaman Upload dan View Dokumen Pendukung)**

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/22c81707-f646-44e1-af54-5bdb58b5d8c6)

**(Lampiran 9 Activity Diagram PPAT Delete Document)**

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a0be2c68-4792-46da-a012-4bff4d50e37f)

**(Lampiran 10 Halaman Delete Document)**

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/7f33c541-16d4-4122-8017-aa685f73a94f)

**(Lampiran 11 Activity Diagram PPAT View Document (Uploaded))**

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/90aa898f-560d-4dbd-873f-ce188e77ce2b)

Lampiran 12 Activity Diagram PPAT View Generated PDF SSPD

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/73b22a56-e722-4ef7-93e8-03be67cd9f85)

Lampiran 13Halaman View PDF SSPD

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/adb9072c-ac90-4b6a-b1da-ff70da092e6c)

Lampiran 14Activity Diagram Fill Form Permohonan Validasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/ff7170c8-6b79-4c9d-8ca0-66cd75b3620c)

Lampiran 15Halaman Pengisian Permohonan Validasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/28caf4eb-fe1c-4e13-a09f-ba84a8c8a9a5)

Lampiran 16 Activity Diagram PPAT View Generated PDF Permohonan Validasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/08914bb4-81ca-41f8-be15-53558a36b9dc)

Lampiran 17Halaman View PDF Permohonan Validasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/55663022-1d34-464d-9a4d-d1c6d785b110)

Lampiran 18Activity Diagram Send to LTB

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/7a972476-5774-4354-876c-e974c64bedb9)

Lampiran 19 Button Fungsi Mengirim ke LTB (Verse final)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/3252d5b9-e177-41f7-a670-7d5ac98291f1)

Lampiran 20Activity Diagram Pembuatan Nomor Registrasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/13a6ca3d-daf0-476e-99bb-9fd3354421d4)

Lampiran 21 Tampilan Laman Dashboard LTB

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/0f3fc7e0-b05e-4449-9033-dcf006224053)

Lampiran 22Activity Diagram LTB Receive Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/3a99243e-2e04-4698-a50e-cf1253e8a8b1)

Lampiran 23 Tampilan Dokumen Diterima

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c450324b-0d49-4865-af6f-0f549bcfe189)

Lampiran 24Activity Diagram Validasi Dokumen

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/04238aa3-d784-4d74-a945-8c625bf5fa94)

Lampiran 25Activity Diagram Accept Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/fb39da3d-4014-40b6-a27b-6cb513b5da62)

Lampiran 26 Tampilan Ketika Document Accept

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/ce211e53-f57c-436d-95dc-aae13745f3df)

Lampiran 27Activity Diagram Reject Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/7a967935-53a1-4f2c-b95c-ef94e052773c)

Lampiran 28 Tampilan Dokumen ditolak LTB

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/7555de30-4c5c-4765-9fdd-b0507741ab1d)

Lampiran 29Activity Diagram Proses Peneliti Menerima Dokumen dari LTB

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/6857a206-e6cc-44e7-a610-f23359669483)

Lampiran 30 Halaman Dashboard Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/07e0824d-f040-4643-a38c-f0ce790bd052)

Lampiran 31Activity Diagram Peneliti View Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/bd87df7c-7212-4126-90db-fcf280f4c547)

Lampiran 32 Fitur View Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/e8cb1e3b-da13-4bc7-bea6-05ebc3d31ccb)

Lampiran 33Activity Diagram Persetujuan Paraf Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/6bf18c27-ce7f-489f-9bd5-58720e0d4be3)

Lampiran 34Activiy Diagram Pemilihan Jenis Pajak

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/b6fe2121-f588-4b05-9090-c39a3976a3f8)

Lampiran 35 Fitur Persetujuan dan Pemilihan Jenis Pajak

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/9eec87bb-dfdf-44e8-9cf8-7f067441d782)

Lampiran 36Activity Diagram Send to Paraf Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/fe1b2f9f-6fad-43cd-98a0-35ac2ec7f664)

Lampiran 37 Tampilan Laman Mengirim Booking ke Paraf Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/41202b86-8181-4d37-8c7b-2b285ca4c5f6)

Lampiran 38Activity Diagram Reject Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a30a9778-b621-4be5-8bf5-1051a28e6756)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/cb3291a5-38ce-49fd-ad4a-01dbbe84a7f9)

Lampiran 39Activity Diagram Paraf Receive From Peneliti

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/9c48b660-4b7b-4814-9302-c1c28c975a64)

Lampiran 40 Tampilan Laman Paraf Receive From Peneliti

s

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/60423a9a-4608-436b-bdad-70bc469a5e70)

Lampiran 41Activity Diagram View Document Paraf

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/d303798b-4c67-40bd-abc6-eeddc24d642f)

Lampiran 42 Tampilan View Document Paraf

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/449380d1-7cc3-444e-9a6a-378b7cd884ee)

Lampiran 43Activity Diagram Give Paraf

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/1c5be3dc-c553-4b9b-95bf-c4e52a34d14e)

Lampiran 44 Tampilan Give Paraf

Lampiran46

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/d47033b1-216d-4e54-8e7b-2070ae529135)

Lampiran 45Activity Diagram Paraf View Document

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/59be1120-88fb-4554-b057-68768ad6ba84)

Lampiran 46 Activity Diagram Paraf Penerimaan Berkas

Lampiran47

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/560f6fcd-ae46-4457-83f2-adc91cf39862)

Lampiran 47 Activity Diagram Paraf Give paraf

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/874f526e-f690-4568-93eb-597748d0a96e)

Lampiran 48 Activity Diagram Paraf Send to Peneliti Validasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/08d77b2a-33a6-4104-8f17-d610cc8f0204)

Lampiran50ActivityDiagramParafRejectDocument

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/1085b91f-e050-4af4-b07d-f1e8ee94e85b)

Lampiran51ActivityDiagramGenerateNoValidasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/1cbf91f0-603d-4618-8544-da91ec493656)

Lampiran52ActivityDiagramPejabatReceiveDocument

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/9dfee807-c2a7-410c-991f-2b3099dc2950)

Lampiran53ActivityDiagramPejabatViewDocument

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/91ec9da5-8f32-4e14-8a3a-2224c22d6c2b)

Lampiran54ActivityDiagramFinalValidationProcess

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/775a5ee3-c5e0-40bd-96eb-8e2561d453f8)

Lampiran55ActivityDiagramPejabatManualSignature

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/fcbb9d92-a9f4-4d10-ac5a-776d02714b29)

Lampiran56GeneratedanViewQRCode

______)))))))))))))((((((((((((+________

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c8f336f6-842c-47a8-b96b-ab89826adadf)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/f1a4a011-6cdd-4c93-9a54-74254ae59e1a)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/23ec9797-cc6a-4273-b975-a65f9a63d859)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/348504dd-d08f-43d5-970b-1ab03e80539c)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a8dbede3-1511-4e30-aa99-1d8656c4bf84)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/078c102f-c63a-40b8-95c0-9f306f751557)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/285d8c1b-0bd6-4b04-8bbb-b927b86d4df6)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/759d2d4a-4a20-4eab-be20-28e22b39e8de)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/3e5db578-e484-4de4-8846-06209c93b12d)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/7ac43108-5f09-4924-ad0d-01c5385319e6)

Lampiran 54Activity Diagram Proses di Peneliti Validasi

ITERASI 2

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a86868e5-3447-451f-8bdd-71964f2e7534)

1 Halaman awal website

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/d75b978c-c4c9-418e-af85-ea0ceb17d798)

2 Halaman masuk website E-BPHTB

3 Halaman awal pembuatan form booking online

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/1e4ece7c-b2df-46e4-92bc-24fc57bea635)

4 Fitur tambah form booking online

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/2739a0b4-904e-47c4-9b44-bbe42d76b607)

5 Tempat berkas ppat masuk ke loket terima berkas

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c99e60b8-b210-41d3-9323-61d8f2c7a461)

6 Tempat berkas masuk ke bagian check nomor bukti pembayaran bank

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/b24e07e0-3920-4862-9dd1-38eb4accae3f)

7 Laman peneliti verifikasi berkas masuk tahap pertama

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a07db905-5402-498c-969e-15242e82ba79)

8 Laman peneliti kasieverifikasi berkas lanjutan tahap kedua

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/d7c06408-5fdd-4989-b611-483df617cb73)

9 Laman pejabat bappenda verifikasi berkas tahap akhir

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/4ff990d9-9ebe-4e66-9a9b-45200b1d03ea)

10Laman pejabat membuat sertifikasi digital untuk bisa digunakan dalam verifikasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/b72349fc-23d3-481c-becd-beb4b9a9e9a6)

11 Laman pejabat membuat dan menyimpan tanda tangan digital

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/f71f6d87-7738-45dc-ae1c-1627f55a8304)

12 Laman dari loket penyerahan berkas yang sudah diselesaikan

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/0a6e4187-9db8-407c-9961-20c9bc8f2fdb)

13 Laman PPAT terkait laporan rekap tahunan

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/3a8235ca-ff20-4660-b88b-6024ee1ebb9b)

14 Halaman awal mengecek keaslian dokumen verifikasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/2c6b96ab-89b8-41ea-931e-f53065545e00)

15  Tampilan email penerimaan dokumen tervalidasi

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/4178fd42-1d1b-4b83-bed5-5502ef7f14a8)

Activity diagram lampiran section process

Deskripsi singkat (activity diagram): activity ini merupakan cara pengguna untuk masuk maupun mendaftar di dalam laman Website E-BPHTB, dimana kedua langkah ini penting untuk memverifikasi dan mendapatkan autentikasi pengguna (semacam cookiess) agar pengguna terkonfirmasi sebagai peserta/member dalam website tersebut, karena website ini bukan website open world melainkan deep web yang mana harus memiliki akses pengguna untuk bisa berlalu lalang di dalam website

De

Bagian ini (create dan generate, upload dan validasi proses akan diletakan di bab 3)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/062d822c-3be1-4340-a33a-91dfdfe43bba)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/09100b1b-0ff7-4c83-a88f-d37d11357446)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/305fd985-570a-4929-9e50-9e4531f51d13)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/2158abec-967b-4fd1-9ab4-4f3a0eb961c4)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/ef1956f5-bf50-4cbc-97a4-501ce5da060a)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/8fa388f4-900b-40bb-8912-977b9011c3e3)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/86e2b69f-8cd0-4a15-83ea-a33994ba22e9)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/61d79b72-25cb-44cc-ba9e-653daf1c6939)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/c929ef1a-3b20-412c-be19-5446be113c66)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/3f430a67-49c3-4adb-8493-ecfd8847621d)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/9561190b-0293-4706-a1c0-faa81416dadc)

ITERASI 3

(9-2=7 di sini)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/052e0fdc-74ff-4ff2-8eb2-ff02cd745241)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/a3b6f3f0-76f3-481d-a810-75e44b0541a4)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/6a95b754-ff81-4bb5-a114-59482ac23cce)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/72d8e015-c61f-446c-ba4b-200c5a79bbad)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/97146d9f-0aba-4f38-99fd-7472b59b3851)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/e7415f0d-6844-4ab8-8f9b-fdf632c5384e)

![](blob:vscode-webview://1r5739at96d3rfrupmh0gh3bi15otsmbp9f5j6vi045pijm2jp75/38b3742a-2b59-4a1e-85d9-d38162b6fa19)

* 
* [•••]()
* [•••]()
* 
* Go to[ ] Page
