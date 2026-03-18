# 📊 TABEL ACTIVITY DIAGRAM ITERASI 1 (VERSI RINGKAS)

## 💡 Rekomendasi: Gunakan Versi Ini untuk Word

**Kolom dikurangi dari 6 menjadi 4 kolom** dengan menggabungkan beberapa informasi agar muat di lebar kertas A4 portrait.

---

## Tabel 1: Activity Diagram - Proses PPAT dan LTB (Activity 1-10)

| No | Nama Activity Diagram | Deskripsi (Aktor + Alur) | Tabel Database Terkait |
|----|----------------------|-------------------------|------------------------|
| 1 | Login dan Register | **Aktor:** User, Sistem<br>**Alur:** Proses login dan registrasi dengan OTP verification, validasi password, session management. | a_1_unverified_users, a_2_verified_users |
| 2 | Create Booking | **Aktor:** PPAT/PPATS, Sistem<br>**Alur:** Pembuatan booking SSPD: pengisian data wajib pajak, pemilik objek pajak, perhitungan NJOP, data objek pajak, validasi input, penyimpanan. | pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, pat_5_penghitungan_njop |
| 3 | Generate No. Booking | **Aktor:** Database Trigger, Sistem<br>**Alur:** Generate nomor booking otomatis via trigger (BEFORE INSERT), format: ppat_khusus-YYYY-000001 (contoh: PAT01-2025-000001) menggunakan MAX sequence dan LPAD. | pat_1_bookingsspd |
| 4 | Add Manual Signature | **Aktor:** PPAT/PPATS, Sistem<br>**Alur:** Upload tanda tangan manual, validasi file (JPG/PNG, max 2MB), preview signature, penyimpanan ke secure storage. | pat_6_sign |
| 5 | Upload Document | **Aktor:** PPAT/PPATS, Sistem<br>**Alur:** Upload dokumen pendukung, validasi tipe (Wajib/Tambahan), validasi file (PDF, JPG, PNG, max 5MB), penyimpanan dengan metadata. | pat_1_bookingsspd (relasi dokumen) |
| 6 | Add Validasi Tambahan | **Aktor:** PPAT/PPATS, Sistem<br>**Alur:** Penambahan validasi tambahan: input keterangan dan upload dokumen pendukung (opsional). | pat_8_validasi_tambahan |
| 7 | LTB Receive from PPAT | **Aktor:** PPAT/PPATS, LTB, Sistem<br>**Alur:** PPAT mengirim booking ke LTB, validasi kelengkapan berkas, update status proses. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd |
| 8 | LTB Generate No. Registrasi | **Aktor:** LTB, Sistem<br>**Alur:** Generate nomor registrasi otomatis, format: YYYYO00001 (contoh: 2025O00001) menggunakan MAX sequence. | ltb_1_terima_berkas_sspd |
| 9 | LTB Validate Document | **Aktor:** LTB, Sistem<br>**Alur:** Validasi dokumen: review (Akta, Sertifikat, Tanda Tangan), cek kelengkapan, validitas, tanda tangan, konsistensi data sebelum Accept/Reject. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd |
| 10 | LTB Accept / Reject | **Aktor:** LTB, Sistem<br>**Alur:** LTB menentukan status diterima/ditolak. Jika diterima → kirim ke Peneliti. Jika ditolak → simpan alasan, kirim notifikasi ke PPAT. | ltb_1_terima_berkas_sspd, pat_1_bookingsspd, p_1_verifikasi |

**Lokasi di Lampiran:** Semua Activity Diagram 1-10 terdapat di Lampiran X

---

## Tabel 2: Activity Diagram - Proses Peneliti, LSB, dan Admin (Activity 11-17)

| No | Nama Activity Diagram | Deskripsi (Aktor + Alur) | Tabel Database Terkait |
|----|----------------------|-------------------------|------------------------|
| 11 | LSB Receive from Peneliti Validasi | **Aktor:** Peneliti Validasi (Pejabat), LSB, Sistem<br>**Alur:** Peneliti Validasi mengirim dokumen ke LSB, validasi data sebelum pengiriman, update status proses. | lsb_1_serah_berkas, pv_1_paraf_validate, pat_1_bookingsspd |
| 12 | LSB Manual Handover | **Aktor:** LSB, PPAT/PPATS, Sistem<br>**Alur:** Serah terima dokumen LSB ke PPAT, verifikasi dokumen dan identitas PPAT, update status. | lsb_1_serah_berkas, pat_1_bookingsspd |
| 13 | LSB Update Status | **Aktor:** LSB, Sistem<br>**Alur:** Update status pasca handover, perubahan data di lsb_1_serah_berkas dan pat_1_bookingsspd (trackstatus = 'Diserahkan'), notifikasi ke PPAT. | lsb_1_serah_berkas, pat_1_bookingsspd |
| 14 | Peneliti Receive from LTB | **Aktor:** Peneliti, Sistem<br>**Alur:** Peneliti menerima notifikasi dari LTB, buka booking, lihat dokumen, verifikasi dokumen, tambah tanda tangan manual, drop gambar tanda tangan, kirim ke Clear to Paraf. | p_1_verifikasi, p_2_verif_sign, p_3_clear_to_paraf, pat_1_bookingsspd |
| 15 | Peneliti Paraf Receive and Give Paraf | **Aktor:** Peneliti (Paraf), Sistem<br>**Alur:** Peneliti Paraf menerima notifikasi dari Peneliti, buka booking, lihat dokumen terverifikasi, berikan paraf dan stempel, kirim ke Peneliti Validasi. | p_3_clear_to_paraf, pv_1_paraf_validate, pat_1_bookingsspd |
| 16 | Peneliti Validasi Final Validation (Iterasi 1) | **Aktor:** Peneliti Validasi (Pejabat), Sistem<br>**Alur:** Peneliti Validasi menerima notifikasi dari Clear to Paraf, buka booking, lihat dokumen terparaf, final validation, tambah tanda tangan manual, drop gambar tanda tangan, lihat QR code (pajangan - tidak fungsional), kirim ke LSB. | p_3_clear_to_paraf, pv_1_paraf_validate, lsb_1_serah_berkas, pat_1_bookingsspd |
| 17 | Admin Monitor Process and Send Ping Notifications | **Aktor:** Admin, Sistem<br>**Alur:** Admin login, akses dashboard, pilih aksi (Monitor Process atau Send Ping), lihat daftar booking, status proses, analytics/statistik, pilih penerima, susun pesan, kirim notifikasi (long polling + email). | pat_1_bookingsspd, sys_notifications, semua tabel terkait untuk monitoring |

**Lokasi di Lampiran:** Semua Activity Diagram 11-17 terdapat di Lampiran X

---

## 📝 Catatan

- **Total Activity Diagram:** 17 diagram (Activity 1-17)
- **Activity 16:** Peneliti Validasi Final Validation (Iterasi 1) - Manual signature dan QR code pajangan
- **Format:** Semua Activity Diagram menggunakan format Swimlane untuk menunjukkan pembagian tanggung jawab antar aktor
- **Lokasi File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/`
- **Format File:** XML (Draw.io format)

---

## 💡 Tips untuk Word

**Cara menggunakan tabel versi ringkas ini:**

1. **Copy Tabel 1** → Paste ke Word → Format sebagai tabel Word
2. **Copy Tabel 2** → Paste di halaman baru atau setelah Tabel 1 → Format sebagai tabel Word
3. **Atur format tabel di Word:**
   - **Font:** Times New Roman 10pt (atau sesuai style TA)
   - **AutoFit:** AutoFit to Window
   - **Column Width:** 
     - Kolom 1 (No): 0.8 cm
     - Kolom 2 (Nama): 3.5 cm
     - Kolom 3 (Deskripsi): 8 cm
     - Kolom 4 (Tabel Database): 3.5 cm
   - **Row Height:** Auto (atau atur minimum 0.8 cm)
   - **Text Wrapping:** Wrap text untuk semua kolom
   - **Cell Alignment:** Top untuk kolom deskripsi
4. **Jika masih tidak muat:**
   - Kurangi font menjadi 9pt
   - Atau gunakan landscape orientation untuk halaman tabel
   - Atau buat versi lebih ringkas (3 kolom) dengan menghapus kolom "Tabel Database"

---

*Tabel ini disusun untuk dokumentasi Activity Diagram Iterasi 1 dalam Tugas Akhir - Versi Ringkas untuk Word*
