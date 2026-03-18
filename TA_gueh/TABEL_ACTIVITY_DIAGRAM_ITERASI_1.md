# 📊 TABEL ACTIVITY DIAGRAM ITERASI 1

## Tabel 1: Activity Diagram - Proses PPAT dan LTB (Activity 1-10)

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 1 | Login dan Register | User, Sistem | Alur lengkap proses login dan registrasi pengguna dengan OTP verification, validasi password, serta session management. | a_1_unverified_users, a_2_verified_users | Lampiran X |
| 2 | Create Booking | PPAT/PPATS, Sistem | Alur lengkap pembuatan booking SSPD mulai dari pengisian data wajib pajak, data pemilik objek pajak, perhitungan NJOP, data objek pajak, hingga validasi input dan penyimpanan ke database. | pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop | Lampiran X |
| 3 | Generate No. Booking | Database Trigger, Sistem | Alur generate nomor booking otomatis menggunakan database trigger (BEFORE INSERT) dengan format ppat_khusus-YYYY-000001 (contoh: PAT01-2025-000001) menggunakan query MAX sequence dan LPAD. | pat_1_bookingsspd | Lampiran X |
| 4 | Add Manual Signature | PPAT/PPATS, Sistem | Alur upload tanda tangan manual dengan validasi file (JPG/PNG, maksimal 2MB), preview signature, dan penyimpanan ke secure storage. | pat_6_sign | Lampiran X |
| 5 | Upload Document | PPAT/PPATS, Sistem | Alur upload dokumen pendukung dengan validasi tipe dokumen (Wajib/Tambahan), validasi file (PDF, JPG, PNG, maks 5MB), dan penyimpanan ke secure storage dengan metadata. | pat_1_bookingsspd (relasi dokumen) | Lampiran X |
| 6 | Add Validasi Tambahan | PPAT/PPATS, Sistem | Alur penambahan validasi tambahan berupa input keterangan dan upload dokumen pendukung (opsional). | pat_8_validasi_tambahan | Lampiran X |
| 7 | LTB Receive from PPAT | PPAT/PPATS, LTB, Sistem | Alur PPAT mengirim booking ke LTB dengan validasi kelengkapan berkas booking serta update status proses. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd | Lampiran X |
| 8 | LTB Generate No. Registrasi | LTB, Sistem | Alur generate nomor registrasi otomatis dengan format YYYYO00001 (contoh: 2025O00001) menggunakan query MAX sequence. | ltb_1_terima_berkas_sspd | Lampiran X |
| 9 | LTB Validate Document | LTB, Sistem | Alur validasi dokumen oleh LTB meliputi review dokumen (Akta, Sertifikat, Tanda Tangan), cek kelengkapan dokumen, cek validitas dokumen, cek tanda tangan, dan cek konsistensi data sebelum proses Accept/Reject. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd | Lampiran X |
| 10 | LTB Accept / Reject | LTB, Sistem | Alur LTB menentukan status diterima atau ditolak. Jika diterima, berkas dikirim ke Peneliti. Jika ditolak, sistem menyimpan alasan penolakan dan mengirim notifikasi ke PPAT. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd, p_1_verifikasi | Lampiran X |

---

## Tabel 2: Activity Diagram - Proses Peneliti, LSB, dan Admin (Activity 11-17)

| No | Nama Activity Diagram | Aktor Utama | Deskripsi Singkat | Tabel Database Terkait | Lokasi di Lampiran |
|----|----------------------|-------------|-------------------|------------------------|-------------------|
| 11 | LSB Receive from Peneliti Validasi | Peneliti Validasi (Pejabat), LSB, Sistem | Alur Peneliti Validasi mengirim dokumen ke LSB dengan validasi data sebelum pengiriman serta update status proses. | lsb_1_serah_berkas, pv_1_paraf_validate, pat_1_bookingsspd | Lampiran X |
| 12 | LSB Manual Handover | LSB, PPAT/PPATS, Sistem | Alur serah terima dokumen oleh LSB kepada PPAT dengan verifikasi dokumen dan identitas PPAT serta update status pada sistem. | lsb_1_serah_berkas, pat_1_bookingsspd | Lampiran X |
| 13 | LSB Update Status | LSB, Sistem | Alur update status pasca handover dengan perubahan data pada lsb_1_serah_berkas dan pat_1_bookingsspd (trackstatus = 'Diserahkan') serta notifikasi ke PPAT. | lsb_1_serah_berkas, pat_1_bookingsspd | Lampiran X |
| 14 | Peneliti Receive from LTB | Peneliti, Sistem | Alur Peneliti menerima notifikasi dari LTB, membuka booking yang diterima, melihat dokumen booking, memverifikasi dokumen, menambahkan tanda tangan manual, drop gambar tanda tangan, dan mengirim ke Clear to Paraf dengan update status. | p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf, pat_1_bookingsspd | Lampiran X |
| 15 | Peneliti Paraf Receive and Give Paraf | Peneliti (Paraf), Sistem | Alur Peneliti Paraf menerima notifikasi dari Peneliti, membuka booking, melihat dokumen yang sudah diverifikasi, memberikan paraf dan stempel, kemudian mengirim ke Peneliti Validasi dengan update status. | p_3_clear_to_paraf, pv_1_paraf_validate, pat_1_bookingsspd | Lampiran X |
| 16 | Peneliti Validasi Final Validation (Iterasi 1) | Peneliti Validasi (Pejabat), Sistem | Alur Peneliti Validasi menerima notifikasi dari Clear to Paraf, membuka booking, melihat dokumen yang sudah diparaf, melakukan final validation, menambahkan tanda tangan manual, drop gambar tanda tangan, melihat QR code (hanya pajangan - tidak fungsional), dan mengirim ke LSB dengan update status. | p_3_clear_to_paraf, pv_1_paraf_validate, lsb_1_serah_berkas, pat_1_bookingsspd | Lampiran X |
| 17 | Admin Monitor Process and Send Ping Notifications | Admin, Sistem | Alur Admin login ke sistem, mengakses dashboard admin, memilih aksi (Monitor Process atau Send Ping Notifications), melihat daftar booking, melihat status proses, melihat analytics/statistik, memilih penerima notifikasi, menyusun pesan, dan mengirim notifikasi dengan long polling dan email. | pat_1_bookingsspd, sys_notifications, semua tabel terkait untuk monitoring | Lampiran X |

---

## 💡 Tips untuk Word

**Cara menggunakan tabel ini di Microsoft Word:**

1. **Copy Tabel 1** → Paste ke Word → Format sebagai tabel Word
2. **Copy Tabel 2** → Paste di halaman baru atau setelah Tabel 1 → Format sebagai tabel Word
3. **Atur format tabel:**
   - Font: Times New Roman atau sesuai style TA (biasanya 10-11pt)
   - AutoFit: AutoFit to Window atau AutoFit to Contents
   - Border: All borders untuk kejelasan
   - Header row: Bold dan bisa diwarnai (opsional)
4. **Jika masih tidak muat:**
   - Kurangi font size header menjadi 9pt
   - Gunakan landscape orientation untuk halaman tabel
   - Atau bagi menjadi 3 tabel (Activity 1-6, 7-12, 13-17)

**Alternatif:** Jika Word masih kesulitan, gunakan format landscape (A4 landscape) untuk halaman yang berisi tabel.

---

## 📝 Catatan

- **Total Activity Diagram:** 17 diagram (Activity 1-17)
- **Activity 16:** Peneliti Validasi Final Validation (Iterasi 1) - Manual signature dan QR code pajangan
- **Format:** Semua Activity Diagram menggunakan format Swimlane untuk menunjukkan pembagian tanggung jawab antar aktor
- **Lokasi File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/`
- **Format File:** XML (Draw.io format)

---

## 🔗 Keterkaitan dengan Proses Bisnis

Activity Diagram ini menggambarkan alur kerja lengkap dari:
1. **PPAT/PPATS:** Create Booking → Add Signature → Upload Document → Add Validasi Tambahan → Send to LTB
2. **LTB:** Receive from PPAT → Generate No. Registrasi → Validate Document → Accept/Reject → Send to Peneliti
3. **Peneliti:** Receive from LTB → Verify Document → Add Signature → Send to Clear to Paraf
4. **Peneliti Paraf:** Receive from Peneliti → Give Paraf → Send to Peneliti Validasi
5. **Peneliti Validasi:** (Iterasi 1 - Manual, Iterasi 2 - Digital) → Send to LSB
6. **LSB:** Receive from Peneliti Validasi → Manual Handover → Update Status
7. **Admin:** Monitor Process → Send Notifications

---

*Tabel ini disusun untuk dokumentasi Activity Diagram Iterasi 1 dalam Tugas Akhir*
