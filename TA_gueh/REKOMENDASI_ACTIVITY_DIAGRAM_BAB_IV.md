# 📊 REKOMENDASI PENEMPATAN ACTIVITY DIAGRAM DI BAB IV

## 🎯 STRATEGI PENEMPATAN

### **Fitur yang Dijelaskan DETAIL di BAB IV (Hasil dan Pembahasan):**
✅ **Fitur Core Business Logic** - Fitur utama yang menjadi inti sistem

1. **✅ Create Booking (Activity_02)** - **DETAIL**
   - Alasan: Fitur utama sistem, inti dari penelitian
   - Penjelasan: Alur lengkap dari input form hingga penyimpanan ke database
   - Diagram: Activity Diagram lengkap dengan penjelasan step-by-step
   - Lokasi: BAB IV - 4.1.1 Hasil Iterasi 1

2. **✅ Generate No. Booking (Activity_03)** - **DETAIL** 
   - Alasan: Mekanisme unik sistem (database trigger)
   - Penjelasan: Cara kerja trigger, format nomor, logika auto-generate
   - Diagram: Activity Diagram dengan penjelasan teknis
   - Lokasi: BAB IV - 4.1.1 Hasil Iterasi 1

3. **✅ Upload Document (Activity_05)** - **DETAIL**
   - Alasan: Fitur penting untuk kelengkapan dokumen
   - Penjelasan: Proses upload, validasi file, penyimpanan ke storage
   - Diagram: Activity Diagram dengan penjelasan
   - Lokasi: BAB IV - 4.1.1 Hasil Iterasi 1

4. **✅ LTB Validate Document (Activity_09)** - **DETAIL**
   - Alasan: Proses validasi penting dalam workflow
   - Penjelasan: Alur validasi, pengecekan dokumen, keputusan diterima/ditolak
   - Diagram: Activity Diagram dengan penjelasan
   - Lokasi: BAB IV - 4.1.1 Hasil Iterasi 1

---

### **Fitur yang CUKUP di LAMPIRAN (dengan Tabel Deskripsi Singkat):**
📋 **Fitur Pendukung/Standard** - Fitur yang sudah umum dan tidak perlu penjelasan detail

1. **📋 Login/Register (Activity_01)** - **LAMPIRAN + TABEL**
   - Alasan: Fitur standar, bukan fokus penelitian
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran
   - Format: Tabel dengan deskripsi singkat

2. **📋 Add Manual Signature (Activity_04)** - **LAMPIRAN + TABEL**
   - Alasan: Fitur pendukung, prosesnya sederhana
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

3. **📋 Add Validasi Tambahan (Activity_06)** - **LAMPIRAN + TABEL**
   - Alasan: Fitur pendukung, prosesnya sederhana
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

4. **📋 LTB Receive from PPAT (Activity_07)** - **LAMPIRAN + TABEL**
   - Alasan: Proses sederhana (hanya menerima)
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

5. **📋 Generate No. Registrasi (Activity_08)** - **LAMPIRAN + TABEL**
   - Alasan: Mirip dengan Generate No. Booking (sudah dijelaskan)
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

6. **📋 LTB Accept/Reject (Activity_10)** - **LAMPIRAN + TABEL**
   - Alasan: Proses sederhana (hanya pilihan)
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

7. **📋 LSB Activities (Activity_11, 12, 13)** - **LAMPIRAN + TABEL**
   - Alasan: Proses sederhana (menerima dan update status)
   - Penjelasan: Deskripsi singkat dalam tabel
   - Diagram: Activity Diagram di Lampiran

---

## 📋 FORMAT TABEL UNTUK ACTIVITY DIAGRAM (LAMPIRAN)

### **Tabel X: Daftar Activity Diagram Sistem Booking Online**

| No | Nama Activity Diagram | Deskripsi Singkat | Aktor | Lokasi Diagram |
|----|----------------------|-------------------|-------|----------------|
| 1 | Login/Register | Proses autentikasi pengguna melalui login dengan email/userid dan password, serta registrasi baru dengan verifikasi OTP 6 digit melalui email. Sistem menggunakan bcrypt untuk hashing password dan menyimpan data user di tabel a_1_unverified_users (belum verifikasi) dan a_2_verified_users (sudah verifikasi). | User, Sistem | Lampiran 1 |
| 2 | Create Booking | Proses pembuatan booking SSPD oleh PPAT/PPATS dengan mengisi formulir lengkap data wajib pajak, objek pajak, dan perhitungan BPHTB. Data disimpan ke tabel pat_1_bookingsspd, pat_2_bphtb_perhitungan, pat_4_objek_pajak, dan pat_5_penghitungan_njop. | PPAT/PPATS, Sistem | BAB IV - 4.1.1 |
| 3 | Generate No. Booking | Proses otomatis generate nomor booking menggunakan database trigger berdasarkan format: ppat_khusus-tahun-urut (contoh: 20008-2025-000025). Trigger diaktifkan saat insert data baru ke pat_1_bookingsspd. | Database Trigger | BAB IV - 4.1.1 |
| 4 | Add Manual Signature | Proses upload tanda tangan manual oleh PPAT/PPATS. Tanda tangan diunggah sebagai gambar, divalidasi format dan ukuran, kemudian disimpan ke storage dan referensi path disimpan di tabel pat_6_sign. | PPAT/PPATS, Sistem | Lampiran 2 |
| 5 | Upload Document | Proses upload dokumen pendukung (akta tanah, sertifikat tanah, dokumen pelengkap) oleh PPAT/PPATS. Dokumen divalidasi format dan ukuran, disimpan ke storage dengan struktur folder berdasarkan tahun, userid, dan nobooking, kemudian referensi path disimpan di tabel pat_7_validasi_surat. | PPAT/PPATS, Sistem | BAB IV - 4.1.1 |
| 6 | Add Validasi Tambahan | Proses penambahan data validasi tambahan oleh PPAT/PPATS. Data tambahan diinput melalui form, divalidasi, kemudian disimpan ke tabel pat_8_validasi_tambahan. | PPAT/PPATS, Sistem | Lampiran 3 |
| 7 | LTB Receive from PPAT | Proses penerimaan booking dari PPAT oleh LTB. Sistem menampilkan daftar booking dengan status "Diajukan" untuk ditinjau oleh LTB. | LTB, Sistem | Lampiran 4 |
| 8 | Generate No. Registrasi | Proses otomatis generate nomor registrasi oleh LTB dengan format: tahun-O-urut (contoh: 2025-O-00001) untuk booking online. Nomor registrasi disimpan di tabel ltb_1_terima_berkas_sspd. | LTB, Sistem | Lampiran 5 |
| 9 | LTB Validate Document | Proses validasi dokumen oleh LTB dengan mengecek kelengkapan dan kesesuaian dokumen yang diupload PPAT. LTB dapat memilih status "Diterima" atau "Ditolak" berdasarkan hasil validasi. Status disimpan di tabel ltb_1_terima_berkas_sspd dan trackstatus di pat_1_bookingsspd diupdate. | LTB, Sistem | BAB IV - 4.1.1 |
| 10 | LTB Accept/Reject | Proses keputusan LTB untuk menerima atau menolak booking. Jika diterima, booking diteruskan ke Peneliti. Jika ditolak, booking diakhiri dan PPAT mendapat notifikasi penolakan. | LTB, Sistem | Lampiran 6 |
| 11 | LSB Receive from Peneliti Validasi | Proses penerimaan dokumen yang sudah divalidasi oleh LSB. Sistem menampilkan daftar dokumen dengan status "Terverifikasi" untuk diserahkan ke PPAT. | LSB, Sistem | Lampiran 7 |
| 12 | LSB Manual Handover | Proses penyerahan dokumen secara manual oleh LSB kepada PPAT. LSB melakukan konfirmasi handover dan update status di sistem. | LSB, Sistem | Lampiran 8 |
| 13 | LSB Update Status | Proses update status booking menjadi "Diserahkan" setelah LSB melakukan handover. Status diupdate di tabel lsb_1_serah_berkas dan pat_1_bookingsspd, serta notifikasi dikirim ke PPAT. | LSB, Sistem | Lampiran 9 |

---

## 📍 STRUKTUR PENEMPATAN DI BAB IV

### **4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar**

#### **4.1.1.1 Fitur Create Booking**

[Penjelasan detail tentang Create Booking dengan Activity Diagram lengkap]

**Gambar X: Activity Diagram Create Booking**
[Activity Diagram Activity_02_Create_Booking]

**Penjelasan:**
Proses pembuatan booking dimulai ketika PPAT/PPATS mengakses halaman form booking setelah login. PPAT mengisi formulir yang mencakup:
1. Data wajib pajak (nama, alamat, NPWP, dll)
2. Data objek pajak (alamat, luas tanah/bangunan, dll)
3. Perhitungan BPHTB (nilai perolehan, tarif, dll)
4. Perhitungan NJOP (NJOP tanah, NJOP bangunan, total NJOP)

Setelah formulir diisi, sistem melakukan validasi input untuk memastikan data lengkap dan sesuai format. Data yang valid kemudian disimpan ke empat tabel database secara bersamaan dalam satu transaksi:
- `pat_1_bookingsspd`: Data utama booking
- `pat_2_bphtb_perhitungan`: Data perhitungan BPHTB
- `pat_4_objek_pajak`: Data objek pajak
- `pat_5_penghitungan_njop`: Data perhitungan NJOP

Setelah data tersimpan, sistem akan memicu database trigger untuk generate nomor booking secara otomatis (lihat 4.1.1.2). PPAT kemudian dapat melanjutkan ke tahap upload dokumen dan tanda tangan.

---

#### **4.1.1.2 Fitur Generate No. Booking**

[Penjelasan detail tentang Generate No. Booking dengan Activity Diagram]

**Gambar Y: Activity Diagram Generate No. Booking**
[Activity Diagram Activity_03_Generate_No_Booking]

**Penjelasan:**
Sistem menggunakan database trigger PostgreSQL untuk generate nomor booking secara otomatis. Trigger diaktifkan saat terjadi INSERT pada tabel `pat_1_bookingsspd`. Logika generate:
1. Sistem mengambil `ppat_khusus` dari user yang login
2. Sistem mengambil tahun dari field `tahunajb` atau tahun saat ini
3. Sistem menghitung urutan booking untuk tahun tersebut
4. Format nomor: `{ppat_khusus}-{tahun}-{urut}` (contoh: 20008-2025-000025)

[Penjelasan teknis lebih detail tentang trigger, query, dll]

---

#### **4.1.1.3 Fitur Upload Document**

[Penjelasan detail tentang Upload Document dengan Activity Diagram]

**Gambar Z: Activity Diagram Upload Document**
[Activity Diagram Activity_05_Upload_Document]

**Penjelasan:**
[Penjelasan detail proses upload, validasi, penyimpanan, dll]

---

#### **4.1.1.4 Fitur LTB Validate Document**

[Penjelasan detail tentang LTB Validate Document dengan Activity Diagram]

**Gambar AA: Activity Diagram LTB Validate Document**
[Activity Diagram Activity_09_LTB_Validate_Document]

**Penjelasan:**
[Penjelasan detail proses validasi, pengecekan, keputusan, dll]

---

### **4.1.1.5 Daftar Activity Diagram Lainnya**

Untuk activity diagram lainnya yang merupakan fitur pendukung, dapat dilihat pada Tabel X di Lampiran beserta Activity Diagram lengkapnya.

**Tabel X: Daftar Activity Diagram Sistem Booking Online**

[Copy tabel dari atas]

---

## 📍 STRUKTUR PENEMPATAN DI LAMPIRAN

### **Lampiran 1: Activity Diagram Login/Register**

**Gambar L1: Activity Diagram Login/Register**
[Activity Diagram Activity_01_Login_Register]

**Deskripsi:**
Proses autentikasi pengguna melalui login dengan email/userid dan password, serta registrasi baru dengan verifikasi OTP 6 digit melalui email. Sistem menggunakan bcrypt untuk hashing password dan menyimpan data user di tabel a_1_unverified_users (belum verifikasi) dan a_2_verified_users (sudah verifikasi).

[Detail lebih lanjut jika diperlukan]

---

### **Lampiran 2: Activity Diagram Add Manual Signature**

[Activity Diagram + Deskripsi singkat]

---

### **Lampiran 3-9: Activity Diagram Lainnya**

[Activity Diagram lainnya dengan deskripsi singkat]

---

## ✅ KESIMPULAN REKOMENDASI

### **Yang Dijelaskan DETAIL di BAB IV:**
1. ✅ Create Booking (Activity_02)
2. ✅ Generate No. Booking (Activity_03)
3. ✅ Upload Document (Activity_05)
4. ✅ LTB Validate Document (Activity_09)

**Total: 4 Activity Diagram dengan penjelasan detail**

### **Yang Cukup di LAMPIRAN dengan Tabel:**
1. 📋 Login/Register (Activity_01)
2. 📋 Add Manual Signature (Activity_04)
3. 📋 Add Validasi Tambahan (Activity_06)
4. 📋 LTB Receive from PPAT (Activity_07)
5. 📋 Generate No. Registrasi (Activity_08)
6. 📋 LTB Accept/Reject (Activity_10)
7. 📋 LSB Activities (Activity_11, 12, 13)

**Total: 9 Activity Diagram di Lampiran dengan deskripsi singkat dalam tabel**

---

**Dibuat untuk:** Revisi Draft Final Tugas Akhir  
**Tanggal:** Desember 2025

