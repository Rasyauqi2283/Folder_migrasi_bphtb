No Nama Activity Diagram Deskripsi Lengkap Lampiran 1 Login dan Register
Aktor: User, Sistem. Alur: Proses login dan registrasi dengan OTP
verification, validasi password, serta session management. Lampiran 1 --
Activity Diagram Login & Register Lampiran 2 -- Halaman Login Lampiran 3
-- Halaman Registrasi 2 Create Booking Aktor: PPAT/PPATS, Sistem. Alur:
Pembuatan booking SSPD melalui pengisian data wajib pajak, pemilik objek
pajak, perhitungan NJOP, data objek pajak, validasi input, dan
penyimpanan data. (Activity Diagram dijelaskan di Bab Hasil & Pembahasan
-- Tidak Masuk Lampiran) Lampiran 4 -- Form Create Booking Lampiran 5 --
Detail Objek Pajak 3 Add Manual Signature Aktor: PPAT/PPATS, Sistem.
Alur: Upload tanda tangan manual, validasi file (JPG/PNG maksimal 2MB),
preview, dan penyimpanan. Lampiran 6 -- Activity Diagram Add Manual
Signature Lampiran 7 -- Halaman Upload Tanda Tangan 4 Upload Document
Aktor: PPAT/PPATS, Sistem. Alur: Upload dokumen pendukung (Akta,
Sertifikat, Pelengkap), validasi tipe dokumen dan ukuran file,
penyimpanan dengan metadata. (Activity Diagram dijelaskan di Bab Hasil &
Pembahasan -- Tidak Masuk Lampiran) Lampiran 8 -- Halaman Upload Dokumen
Pendukung 5 PPAT Delete Document Aktor: PPAT/PPATS, Sistem. Alur:
Penghapusan dokumen yang sudah diupload dengan validasi ownership dan
status booking (hanya status Draft yang bisa dihapus), hapus dari
storage dan database. Lampiran 9 -- Activity Diagram PPAT Delete
Document Lampiran 10 -- Halaman Delete Document 6 PPAT View Document
(Uploaded) Aktor: PPAT/PPATS, Sistem. Alur: Melihat dokumen yang sudah
diupload (Akta, Sertifikat, Pelengkap) dengan preview di browser.
Lampiran 11 -- Activity Diagram PPAT View Document (Uploaded) Lampiran
12 -- Halaman View Uploaded Document 7 PPAT View Generated PDF SSPD
Aktor: PPAT/PPATS, Sistem. Alur: Melihat dokumen SSPD yang digenerate
oleh sistem dalam format PDF melalui endpoint generate-pdf-bookingsspd.
Lampiran 13 -- Activity Diagram PPAT View Generated PDF SSPD Lampiran 14
-- Halaman View PDF SSPD 8 PPAT View Generated PDF Permohonan Validasi
Aktor: PPAT/PPATS, Sistem. Alur: Melihat dokumen Permohonan Validasi
yang digenerate oleh sistem dalam format PDF melalui endpoint
generate-pdf-mohon-validasi. Lampiran 15 -- Activity Diagram PPAT View
Generated PDF Permohonan Validasi Lampiran 16 -- Halaman View PDF
Permohonan Validasi 9 PPAT Fill Form Permohonan Validasi Aktor:
PPAT/PPATS, Sistem. Alur: Mengisi formulir permohonan validasi (alamat
pemohon, kampung OP, kelurahan OP, kecamatan OP, keterangan), validasi
form, dan menyimpan ke pat_8_validasi_tambahan. Lampiran 17 -- Activity
Diagram PPAT Fill Form Permohonan Validasi Lampiran 18 -- Halaman Fill
Form Permohonan Validasi 10 PPAT Send to LTB Aktor: PPAT/PPATS, Sistem.
Alur: PPAT mengirim booking ke LTB dengan validasi ownership & status
(Draft), generate no_registrasi, insert ke ltb_1_terima_berkas_sspd,
update pat_1_bookingsspd (trackstatus=\'Dikirim ke LTB\'), commit
transaction, dan notifikasi real-time ke LTB. Catatan: Tanpa sistem
kuotasi. Lampiran 19 -- Halaman Kirim ke LTB 11 LTB Receive from PPAT
Aktor: LTB, Sistem. Alur: LTB menerima notifikasi dari PPAT, membuka
dashboard, melihat booking status \'Diolah\', dan melihat detail
booking. Lampiran 20 -- Activity Diagram LTB Receive from PPAT Lampiran
21 -- Dashboard LTB Lampiran 22 -- LTB Receive Doc 12 LTB Generate No.
Registrasi Aktor: LTB, Sistem. Alur: Generate nomor registrasi otomatis
format YYYYO00001 dengan query MAX sequence. Lampiran 23 -- Activity
Diagram LTB Generate No. Registrasi 13 LTB Validate Document Aktor: LTB,
Sistem. Alur: Review dokumen, cek kelengkapan dan konsistensi sebelum
Accept/Reject. Lampiran 24 -- Activity Diagram LTB Validate Document
Lampiran 25 -- Halaman Validasi Dokumen LTB 14 LTB Accept Aktor: LTB,
Sistem. Alur: Status diterima, insert ke p_1_verifikasi, update status,
notifikasi ke Peneliti. Lampiran 26 -- Activity Diagram LTB Accept
Lampiran 27 -- Halaman Status Accept 15 LTB Reject Aktor: LTB, Sistem.
Alur: Status ditolak, simpan alasan, update status, notifikasi ke PPAT.
Lampiran 28 -- Activity Diagram LTB Reject Lampiran 29 -- Halaman Status
Reject 16 Peneliti Receive from LTB Aktor: Peneliti, Sistem. Alur:
Peneliti menerima notifikasi dan melihat booking untuk diverifikasi.
Lampiran 30 -- Activity Diagram Peneliti Receive from LTB Lampiran 31 --
Dashboard Peneliti Lampiran 32 -- Receive from LTB 17 Peneliti View
Document Aktor: Peneliti, Sistem. Alur: Melihat dokumen dan PDF SSPD
untuk diverifikasi. Lampiran 33 -- Activity Diagram Peneliti View
Document Lampiran 34 -- Halaman View Document 18 Peneliti Verify
Document Aktor: Peneliti, Sistem. Alur: Memverifikasi dokumen dengan
melakukan review dokumen, validasi data, cek kelengkapan dokumen, dan
menentukan status verifikasi (Valid/Tidak Valid, Lengkap/Tidak Lengkap).
Lampiran 35 -- Activity Diagram Peneliti Verify Document Lampiran 36 --
Halaman Verifikasi Dokumen Peneliti 19 Peneliti Add Manual Signature
Aktor: Peneliti, Sistem. Alur: Menambahkan tanda tangan manual dengan
upload/drop gambar tanda tangan (JPG/PNG, maksimal 2MB), validasi file,
preview tanda tangan, proses image (resize dan optimize), penyimpanan ke
secure storage, dan update p_2_verif_sign. Lampiran 37 -- Activity
Diagram Peneliti Add Manual Signature Lampiran 38 - Halaman Add Manual
Signature Peneliti Lampiran 39 - Tampilan Laman Peneliti tahap
Verifikasi 20 Peneliti Verifikasi Aktor: Peneliti, Sistem. Alur:
Verifikasi, tanda tangan, update p_2_verif_sign dan p_1_verifikasi,
kirim ke Clear to Paraf. Lampiran 40 -- Activity Diagram
VerifikasiLampiran 41 -- Halaman VerifikasiLampiran 42 -- Laman
Verifikasi 21 Peneliti Persetujuan Paraf Aktor: Peneliti, Sistem. Alur:
Setujui paraf dan validasi tanda tangan. Lampiran 43 -- Activity Diagram
ParafLampiran 44 -- Halaman Paraf 22 Peneliti Pemilihan Aktor: Peneliti,
Sistem. Alur: Pilih metode penghitungan pajak. Lampiran 45 -- Activity
Diagram PemilihanLampiran 46 -- Halaman Pemilihan 23 Peneliti Send to
Clear to Paraf Aktor: Peneliti, Sistem. Alur: Kirim ke Clear to Paraf,
update tabel proses dan booking. Lampiran 47 -- Activity Diagram
SendLampiran 48 -- Halaman Send 24 Peneliti Reject Aktor: Peneliti,
Sistem. Alur: Tolak booking dan kirim notifikasi ke PPAT. Lampiran 49 --
Activity Diagram RejectLampiran 50 -- Halaman Reject 25 Generate No.
Validasi Aktor: Sistem. Alur: Generate nomor validasi format 8acak-3acak
dan simpan ke pat_7_validasi_surat. Lampiran 51 -- Activity Diagram
Generate 26 Peneliti Paraf Receive Aktor: Peneliti Paraf, Sistem. Alur:
Terima booking status Pending dari p_3_clear_to_paraf. Lampiran 52 --
Activity Diagram ReceiveLampiran 53 -- Dashboard ParafLampiran 54 --
Receive 27 Peneliti Paraf View Document Aktor: Peneliti Paraf, Sistem.
Alur: Lihat dokumen terverifikasi. Lampiran 55 -- Activity Diagram
ViewLampiran 56 -- Halaman View 28 Peneliti Paraf Give Paraf Aktor:
Peneliti Paraf, Sistem. Alur: Upload paraf dan update
p_3_clear_to_paraf. Lampiran 57 -- Activity Diagram GiveLampiran 58 --
Halaman GiveLampiran 59 -- Proses 29 Peneliti Paraf Send to Validasi
Aktor: Peneliti Paraf, Sistem. Alur: Kirim ke Peneliti Validasi.
Lampiran 60 -- Activity Diagram SendLampiran 61 -- Halaman Send 30
Peneliti Paraf Reject Aktor: Peneliti Paraf, Sistem. Alur: Tolak booking
dan notifikasi ke PPAT. Lampiran 62 -- Activity Diagram RejectLampiran
63 -- Halaman Reject 31 Peneliti Validasi Receive Aktor: Peneliti
Validasi, Sistem. Alur: Terima booking dari pv_1_paraf_validate.
Lampiran 64 -- Activity Diagram ReceiveLampiran 65 -- DashboardLampiran
66 -- Receive 32 Peneliti Validasi View Document Aktor: Peneliti
Validasi, Sistem. Alur: Lihat dokumen terparaf. Lampiran 67 -- Activity
Diagram ViewLampiran 68 -- Halaman View 33 Peneliti Validasi Final
Validation Aktor: Peneliti Validasi, Sistem. Alur: Final validasi dan
simpan hasil. Lampiran 69 -- Activity Diagram FinalLampiran 70 --
Halaman FinalLampiran 71 -- Laman Pejabat 34 Peneliti Validasi Manual
Signature Aktor: Peneliti Validasi, Sistem. Alur: Upload tanda tangan
pejabat. Lampiran 72 -- Activity Diagram SignatureLampiran 73 -- Halaman
Upload 35 Peneliti Validasi View QR Code Aktor: Peneliti Validasi,
Sistem. Alur: Menampilkan QR Code (pajangan). Lampiran 74 -- Activity
Diagram QRLampiran 75 -- Halaman QR 36 Peneliti Validasi Send to LSB
Aktor: Peneliti Validasi, Sistem. Alur: Kirim dokumen ke LSB. Lampiran
76 -- Activity Diagram SendLampiran 77 -- Halaman Send 37 Peneliti
Validasi Reject Aktor: Peneliti Validasi, Sistem. Alur: Tolak booking.
Lampiran 78 -- Activity Diagram RejectLampiran 79 -- Halaman Reject 38
LSB Receive from Peneliti Validasi Aktor: LSB, Sistem. Alur: Terima
dokumen dari pejabat. Lampiran 80 -- Activity Diagram ReceiveLampiran 81
-- Halaman KirimLampiran 82 -- Receive 39 LSB Manual Handover Aktor:
LSB, PPAT/PPATS, Sistem. Alur: Serah terima fisik dokumen. Lampiran 83
-- Activity Diagram HandoverLampiran 84 -- Halaman Handover 40 LSB
Update Status Aktor: LSB, Sistem. Alur: Update status menjadi
Diserahkan. Lampiran 85 -- Activity Diagram UpdateLampiran 86 -- Halaman
Status 41 Admin Monitor Process Aktor: Admin, Sistem. Alur: Monitoring
proses dan statistik. Lampiran 87 -- Activity Diagram MonitorLampiran 88
-- Dashboard 42 Admin Send Ping Notifications Aktor: Admin, Sistem.
Alur: Kirim notifikasi pengingat via sistem dan email. Lampiran 89 --
Activity Diagram NotifikasiLampiran 90 -- Halaman Kirim
