# TABEL LAMPIRAN ITERASI 1 - LENGKAP

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
| 19 | Peneliti Verify Document | **Aktor:** Peneliti, Sistem. **Alur:** Memverifikasi dokumen dengan melakukan review dokumen, validasi data, cek kelengkapan dokumen, dan menentukan status verifikasi (Valid/Tidak Valid, Lengkap/Tidak Lengkap). | Lampiran 35 - Activity Diagram Peneliti Verify Document<br>Lampiran 36 - Halaman Verifikasi Dokumen Peneliti |
| 20 | Peneliti Add Manual Signature | **Aktor:** Peneliti, Sistem. **Alur:** Menambahkan tanda tangan manual dengan upload/drop gambar tanda tangan (JPG/PNG, maksimal 2MB), validasi file, preview tanda tangan, proses image (resize dan optimize), penyimpanan ke secure storage, dan update p_2_verif_sign. | Lampiran 37 - Activity Diagram Peneliti Add Manual Signature<br>Lampiran 38 - Halaman Add Manual Signature Peneliti<br>Lampiran 39 - Tampilan Laman Peneliti tahap Verifikasi |
| 21 | Peneliti Persetujuan Paraf | **Aktor:** Peneliti, Sistem. **Alur:** Memilih radio button "Setujui Paraf" setelah verifikasi dokumen selesai, validasi tanda tangan sudah ada, update p_1_verifikasi. | Lampiran 40 - Activity Diagram Peneliti Persetujuan Paraf<br>Lampiran 41 - Halaman Persetujuan Paraf |
| 22 | Peneliti Pemilihan | **Aktor:** Peneliti, Sistem. **Alur:** Memilih opsi pemilihan (Penghitung Wajib Pajak, STPD Kurang Bayar, Dihitung Sendiri, Lainnya Penghitung WP), update p_1_verifikasi. | Lampiran 42 - Activity Diagram Peneliti Pemilihan<br>Lampiran 43 - Halaman Pemilihan Peneliti |
| 23 | Peneliti Send to Clear to Paraf | **Aktor:** Peneliti, Sistem. **Alur:** Mengirim hasil verifikasi ke Clear to Paraf dengan validasi kelengkapan data (persetujuan & pemilihan), update p_2_verif_sign, p_1_verifikasi, insert ke p_3_clear_to_paraf, update pat_1_bookingsspd. | Lampiran 44 - Activity Diagram Peneliti Send to Clear to Paraf<br>Lampiran 45 - Halaman Send to Clear to Paraf |
| 24 | Peneliti Reject | **Aktor:** Peneliti, Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update p_1_verifikasi dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 46 - Activity Diagram Peneliti Reject<br>Lampiran 47 - Halaman Peneliti Reject |
| 25 | Generate No. Validasi | **Aktor:** Sistem. **Alur:** Generate nomor validasi otomatis dengan format 8acak-3acak ketika Clear to Paraf mengirim ke Peneliti Validasi, update pat_7_validasi_surat. | Lampiran 48 - Activity Diagram Generate No. Validasi |
| 26 | Peneliti Paraf Receive | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Peneliti Paraf menerima notifikasi dari Peneliti, membuka booking, melihat booking yang diterima dari p_3_clear_to_paraf (Status: Pending). | Lampiran 49 - Activity Diagram Peneliti Paraf Receive<br>Lampiran 50 - Dashboard Peneliti Paraf<br>Lampiran 51 - Halaman Receive Peneliti Paraf |
| 27 | Peneliti Paraf View Document | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Melihat dokumen yang sudah diverifikasi (dokumen uploaded, generated PDF SSPD) dengan preview di browser. | Lampiran 52 - Activity Diagram Peneliti Paraf View Document<br>Lampiran 53 - Halaman View Document Peneliti Paraf |
| 28 | Peneliti Paraf Give Paraf | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Upload paraf dan stempel (drop gambar), validasi file (JPG/PNG maksimal 2MB), penyimpanan ke secure storage, dan update p_3_clear_to_paraf. | Lampiran 54 - Activity Diagram Peneliti Paraf Give Paraf<br>Lampiran 55 - Halaman Give Paraf<br>Lampiran 56 - Proses Paraf |
| 29 | Peneliti Paraf Send to Validasi | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Mengirim ke Peneliti Validasi dengan validasi kelengkapan paraf, update p_3_clear_to_paraf, insert ke pv_1_paraf_validate, update pat_1_bookingsspd, dan notifikasi. | Lampiran 57 - Activity Diagram Peneliti Paraf Send to Validasi<br>Lampiran 58 - Halaman Send to Peneliti Validasi |
| 30 | Peneliti Paraf Reject | **Aktor:** Peneliti (Paraf), Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update p_3_clear_to_paraf dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 59 - Activity Diagram Peneliti Paraf Reject<br>Lampiran 60 - Halaman Peneliti Paraf Reject |
| 31 | Peneliti Validasi Receive | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Peneliti Validasi menerima notifikasi dari Clear to Paraf, membuka booking, melihat booking yang diterima dari pv_1_paraf_validate (Status: Pending). | Lampiran 61 - Activity Diagram Peneliti Validasi Receive<br>Lampiran 62 - Dashboard Peneliti Validasi<br>Lampiran 63 - Halaman Receive Peneliti Validasi |
| 32 | Peneliti Validasi View Document | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melihat dokumen yang sudah diparaf (dokumen uploaded, generated PDF SSPD) dengan preview di browser. | Lampiran 64 - Activity Diagram Peneliti Validasi View Document<br>Lampiran 65 - Halaman View Document Peneliti Validasi |
| 33 | Peneliti Validasi Final Validation | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melakukan final validation dengan mereview dokumen yang sudah diparaf, menentukan valid/tidak valid, dan menyimpan hasil validasi ke pv_1_paraf_validate. | Lampiran 66 - Activity Diagram Peneliti Validasi Final Validation<br>Lampiran 67 - Halaman Final Validation<br>Lampiran 68 - Tampilan Laman tahap Pejabat |
| 34 | Peneliti Validasi Manual Signature | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Menambahkan tanda tangan manual, drop gambar tanda tangan, validasi file (JPG/PNG maksimal 2MB), penyimpanan ke secure storage, dan update pv_1_paraf_validate. | Lampiran 69 - Activity Diagram Peneliti Validasi Manual Signature<br>Lampiran 70 - Halaman Upload Tanda Tangan Peneliti Validasi |
| 35 | Peneliti Validasi View QR Code | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Melihat QR Code (hanya pajangan - tidak fungsional di Iterasi 1, tidak ada generate QR code). | Lampiran 71 - Activity Diagram Peneliti Validasi View QR Code<br>Lampiran 72 - Halaman View QR Code (Pajangan) |
| 36 | Peneliti Validasi Send to LSB | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Mengirim ke LSB dengan validasi kelengkapan data (validasi & tanda tangan), update pv_1_paraf_validate, insert ke lsb_1_serah_berkas, update pat_1_bookingsspd, dan notifikasi. | Lampiran 73 - Activity Diagram Peneliti Validasi Send to LSB<br>Lampiran 74 - Halaman Send to LSB |
| 37 | Peneliti Validasi Reject | **Aktor:** Peneliti Validasi (Pejabat), Sistem. **Alur:** Menolak booking dengan mengisi alasan penolakan, update pv_1_paraf_validate dan pat_1_bookingsspd, dan notifikasi ke PPAT. | Lampiran 75 - Activity Diagram Peneliti Validasi Reject<br>Lampiran 76 - Halaman Peneliti Validasi Reject |
| 38 | LSB Receive from Peneliti Validasi | **Aktor:** Peneliti Validasi (Pejabat), LSB, Sistem. **Alur:** Peneliti Validasi mengirim dokumen ke LSB, dilakukan validasi akhir sebelum pengiriman, update status proses, insert ke lsb_1_serah_berkas dengan status 'Pending Handover', update pv_1_paraf_validate dan pat_1_bookingsspd. | Lampiran 77 - Activity Diagram LSB Receive from Peneliti Validasi<br>Lampiran 78 - Halaman Pengiriman ke LSB<br>Lampiran 79 - Tampilan Laman LSB Receive Doc |
| 39 | LSB Manual Handover | **Aktor:** LSB, PPAT/PPATS, Sistem. **Alur:** Serah terima dokumen dari LSB ke PPAT, verifikasi identitas PPAT dan dokumen fisik, update lsb_1_serah_berkas dan pat_1_bookingsspd. | Lampiran 80 - Activity Diagram LSB Manual Handover<br>Lampiran 81 - Halaman Serah Terima Dokumen |
| 40 | LSB Update Status | **Aktor:** LSB, Sistem. **Alur:** Update status pasca handover menjadi Diserahkan, update lsb_1_serah_berkas dan pat_1_bookingsspd (trackstatus='Diserahkan'), update pv_1_paraf_validate, dan notifikasi ke PPAT. | Lampiran 82 - Activity Diagram LSB Update Status<br>Lampiran 83 - Halaman Status Diserahkan |
| 41 | Admin Monitor Process | **Aktor:** Admin, Sistem. **Alur:** Admin memantau seluruh proses melalui dashboard, melihat status booking, statistik, dan analytics. | Lampiran 84 - Activity Diagram Admin Monitor Process<br>Lampiran 85 - Dashboard Admin |
| 42 | Admin Send Ping Notifications | **Aktor:** Admin, Sistem. **Alur:** Admin mengirim notifikasi pengingat melalui sistem (long polling) dan email kepada pengguna terkait dengan pemilihan penerima dan penyusunan pesan. | Lampiran 86 - Activity Diagram Admin Send Ping Notifications<br>Lampiran 87 - Halaman Kirim Notifikasi |

---

## RINGKASAN LAMPIRAN

### **Total Activity Diagram: 42 Activity Diagram** (4 Activity Diagram dijelaskan di Bab Hasil & Pembahasan, tidak masuk lampiran)
### **Total Lampiran: 87 Lampiran**

**Rincian:**
- **Activity Diagram di Lampiran:** 38 lampiran (Lampiran 1, 6, 9, 11, 13, 15, 17, 20, 23, 24, 26, 28, 30, 33, 35, 37, 40, 42, 44, 46, 48, 49, 52, 54, 57, 59, 61, 64, 66, 69, 71, 73, 75, 77, 80, 82, 84, 86)
- **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):** 4 Activity Diagram
  - No 2: Create Booking
  - No 3: Generate No. Booking
  - No 5: Upload Document
  - No 11: PPAT Send to LTB
- **Tampilan Website:** 49 lampiran (Lampiran 2-3, 4-5, 7-8, 10, 12, 14, 16, 18, 19, 21-22, 25, 27, 29, 31-32, 34, 36, 38-39, 41, 43, 45, 47, 50-51, 53, 55-56, 58, 60, 62-63, 65, 67-68, 70, 72, 74, 76, 78-79, 81, 83, 85, 87)

---

## CATATAN

1. **Format Lampiran:**
   - Activity Diagram selalu ditempatkan terlebih dahulu (Lampiran ganjil) **KECUALI** yang dijelaskan di Bab Hasil & Pembahasan
   - Tampilan Website mengikuti setelah Activity Diagram terkait (Lampiran genap/berturut-turut)
   - 4 Activity Diagram (Create Booking, Generate No. Booking, Upload Document, LTB Receive from PPAT) dijelaskan di Bab Hasil & Pembahasan, tidak masuk lampiran

2. **Pemisahan Fitur:**
   - Setiap fitur memiliki Activity Diagram terpisah sesuai prinsip "1 fitur = 1 Activity Diagram"
   - **Peneliti umum dibagi menjadi 3 Activity Diagram terpisah:**
     - No 17: Peneliti Receive from LTB (Activity_14_Peneliti_Receive_from_LTB.xml)
     - No 19: Peneliti Verify Document (Activity_14A_Peneliti_Verify_Document.xml)
     - No 20: Peneliti Add Manual Signature (Activity_14B_Peneliti_Add_Manual_Signature.xml)
   - Accept dan Reject dipisah menjadi Activity Diagram terpisah (LTB, Peneliti, Peneliti Paraf, Peneliti Validasi)
   - View Document dipisah berdasarkan jenis dokumen (Uploaded, Generated PDF SSPD, Generated PDF Permohonan Validasi)

3. **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):**
   - **No 2: Create Booking** - Activity Diagram dijelaskan di Bab Hasil & Pembahasan (Lampiran 4-5: Tampilan Form Create Booking & Detail Objek Pajak)
   - **No 3: Generate No. Booking** - Activity Diagram dijelaskan di Bab Hasil & Pembahasan (Tidak ada lampiran tampilan - sistem otomatis)
   - **No 5: Upload Document** - Activity Diagram dijelaskan di Bab Hasil & Pembahasan (Lampiran 8: Tampilan Halaman Upload Dokumen Pendukung)
   - **No 11: PPAT Send to LTB** - Activity Diagram dijelaskan di Bab Hasil & Pembahasan (Lampiran 19: Tampilan Button Kirim ke Bappenda di Halaman Booking)

4. **File Activity Diagram:**
   - Semua Activity Diagram tersedia di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/`
   - Format file: XML (Draw.io compatible)

5. **File Tampilan Website:**
   - Screenshot/wireframe tampilan website tersedia sesuai struktur halaman yang ada di sistem
   - File HTML tersedia di folder `public/html_folder/` sesuai struktur role

---

**Versi:** Lengkap - Setelah Perombakan Menyeluruh Iterasi 1 (Update: 4 Activity Diagram di Bab Hasil & Pembahasan, Peneliti Umum Dibagi Menjadi 3 Diagram Terpisah)  
**Tanggal:** 2025  
**Status:** ✅ Semua Activity Diagram Sudah Terpisah Sesuai Prinsip 1 Fitur = 1 Activity Diagram  
**Catatan Khusus:** Peneliti umum (Iterasi 1) yang awalnya 1 file XML kompleks telah dibagi menjadi 3 file XML terpisah: Receive, Verify, dan Add Manual Signature

---

## CATATAN PENTING TENTANG 4 ACTIVITY DIAGRAM DI BAB HASIL & PEMBAHASAN

**Activity Diagram berikut dijelaskan secara detail di Bab Hasil & Pembahasan dan TIDAK masuk ke Lampiran:**

1. **No 2: Create Booking** - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 4-5: Hanya Tampilan Website)
2. **No 3: Generate No. Booking** - Dijelaskan di Bab Hasil & Pembahasan (Tidak ada Lampiran Tampilan - sistem otomatis)
3. **No 5: Upload Document** - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 8: Hanya Tampilan Website)
4. **No 11: PPAT Send to LTB** - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 19: Hanya Tampilan Website - Button "Kirim ke Bappenda" di tabel booking)

**Activity Diagram ini tetap ada dan dijelaskan di Bab Hasil & Pembahasan, hanya tidak dicetak ulang di Lampiran.**
