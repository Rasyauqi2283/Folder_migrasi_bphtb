# 📋 TABEL ACTIVITY DIAGRAM - SIAP PAKAI

## 🎯 TABEL UNTUK BAB IV (Daftar Activity Diagram)

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

## 📝 DESKRIPSI SINGKAT UNTUK LAMPIRAN

### **Lampiran 1: Activity Diagram Login/Register**

**Gambar L1: Activity Diagram Login/Register**

**Deskripsi:**
Activity Diagram Login/Register menggambarkan proses autentikasi pengguna dalam sistem E-BPHTB. Proses dimulai ketika pengguna memilih aksi login atau registrasi. Untuk registrasi, pengguna mengisi form (nama, email, NIK, password, KTP), sistem melakukan validasi email di database, hash password menggunakan bcrypt, generate OTP 6 digit, menyimpan ke tabel a_1_unverified_users, dan mengirim OTP via email. Setelah pengguna memasukkan OTP yang valid, data dipindahkan ke tabel a_2_verified_users dan akun aktif. Untuk login, pengguna memasukkan credentials (email/userid/username + password), sistem mencari user di database, memverifikasi password dengan bcrypt.compare, mengecek kelengkapan profil, update status ke 'online', membuat session, dan redirect ke dashboard sesuai peran pengguna.

**Tabel Database:**
- `a_1_unverified_users`: Menyimpan data user yang belum verifikasi OTP
- `a_2_verified_users`: Menyimpan data user yang sudah terverifikasi dan aktif

**Teknologi:**
- Password Hashing: bcrypt
- OTP Generation: 6 digit random
- Session Management: Express-session

---

### **Lampiran 2: Activity Diagram Add Manual Signature**

**Gambar L2: Activity Diagram Add Manual Signature**

**Deskripsi:**
Activity Diagram Add Manual Signature menggambarkan proses upload tanda tangan manual oleh PPAT/PPATS. PPAT mengakses halaman upload signature, memilih file gambar tanda tangan, sistem melakukan validasi format (JPG, PNG) dan ukuran file, menampilkan preview tanda tangan, PPAT mengkonfirmasi, sistem menyimpan file ke storage dengan path `/storage/ppat/signature/{userid}_{timestamp}.{ext}`, dan menyimpan referensi path ke tabel pat_6_sign dengan userid dan timestamp. Tanda tangan ini dapat digunakan berulang kali untuk dokumen berikutnya.

**Tabel Database:**
- `pat_6_sign`: Menyimpan path file tanda tangan dan metadata

**Validasi:**
- Format file: JPG, PNG
- Ukuran maksimal: 2 MB
- Dimensi: Minimal 200x100 pixel

---

### **Lampiran 3: Activity Diagram Add Validasi Tambahan**

**Gambar L3: Activity Diagram Add Validasi Tambahan**

**Deskripsi:**
Activity Diagram Add Validasi Tambahan menggambarkan proses penambahan data validasi tambahan oleh PPAT/PPATS. PPAT mengakses form validasi tambahan pada booking yang sudah dibuat, mengisi data tambahan (keterangan, catatan khusus, dll), sistem melakukan validasi input, dan menyimpan data ke tabel pat_8_validasi_tambahan dengan referensi ke bookingid. Data ini digunakan sebagai informasi tambahan untuk proses validasi oleh LTB dan Peneliti.

**Tabel Database:**
- `pat_8_validasi_tambahan`: Menyimpan data validasi tambahan per booking

---

### **Lampiran 4: Activity Diagram LTB Receive from PPAT**

**Gambar L4: Activity Diagram LTB Receive from PPAT**

**Deskripsi:**
Activity Diagram LTB Receive from PPAT menggambarkan proses penerimaan booking dari PPAT oleh LTB. Sistem menampilkan daftar booking dengan status "Diajukan" atau "Diserahkan" di dashboard LTB. LTB dapat melihat detail booking, dokumen yang diupload, dan informasi lengkap booking. Booking yang diterima akan masuk ke proses validasi dokumen oleh LTB.

**Tabel Database:**
- `pat_1_bookingsspd`: Status booking "Diajukan"
- `ltb_1_terima_berkas_sspd`: Data penerimaan berkas oleh LTB

---

### **Lampiran 5: Activity Diagram Generate No. Registrasi**

**Gambar L5: Activity Diagram Generate No. Registrasi**

**Deskripsi:**
Activity Diagram Generate No. Registrasi menggambarkan proses generate nomor registrasi oleh LTB. Setelah LTB menerima booking dari PPAT, sistem secara otomatis generate nomor registrasi dengan format: tahun-O-urut (contoh: 2025-O-00001) untuk booking online. Nomor registrasi disimpan di tabel ltb_1_terima_berkas_sspd dengan referensi ke bookingid. Nomor registrasi ini digunakan untuk tracking dokumen di tahap selanjutnya.

**Format Nomor:**
- Online: `{tahun}-O-{urut}` (contoh: 2025-O-00001)
- Offline: `{tahun}-L-{urut}` (contoh: 2025-L-00001)

**Tabel Database:**
- `ltb_1_terima_berkas_sspd`: Menyimpan nomor registrasi

---

### **Lampiran 6: Activity Diagram LTB Accept/Reject**

**Gambar L6: Activity Diagram LTB Accept/Reject**

**Deskripsi:**
Activity Diagram LTB Accept/Reject menggambarkan proses keputusan LTB untuk menerima atau menolak booking. Setelah LTB melakukan validasi dokumen, LTB dapat memilih status "Diterima" atau "Ditolak". Jika diterima, trackstatus di pat_1_bookingsspd diupdate menjadi "Diterima" dan booking diteruskan ke Peneliti. Jika ditolak, trackstatus diupdate menjadi "Ditolak", booking diakhiri, dan notifikasi penolakan dikirim ke PPAT dengan alasan penolakan.

**Status yang Dapat Dipilih:**
- Diterima: Booking diteruskan ke tahap pemeriksaan Peneliti
- Ditolak: Booking diakhiri, PPAT mendapat notifikasi

---

### **Lampiran 7: Activity Diagram LSB Receive from Peneliti Validasi**

**Gambar L7: Activity Diagram LSB Receive from Peneliti Validasi**

**Deskripsi:**
Activity Diagram LSB Receive from Peneliti Validasi menggambarkan proses penerimaan dokumen yang sudah divalidasi oleh LSB. Sistem menampilkan daftar dokumen dengan status "Terverifikasi" di dashboard LSB. LSB dapat melihat detail dokumen, nomor validasi, dan informasi lengkap. Dokumen yang diterima siap untuk diserahkan ke PPAT melalui proses manual handover.

**Tabel Database:**
- `pv_1_paraf_validate`: Status "Terverifikasi"
- `lsb_1_serah_berkas`: Data penerimaan oleh LSB

---

### **Lampiran 8: Activity Diagram LSB Manual Handover**

**Gambar L8: Activity Diagram LSB Manual Handover**

**Deskripsi:**
Activity Diagram LSB Manual Handover menggambarkan proses penyerahan dokumen secara manual oleh LSB kepada PPAT. LSB melakukan konfirmasi handover dengan mengisi form konfirmasi (tanggal handover, nama PPAT yang menerima, tanda tangan), sistem menyimpan data handover ke tabel lsb_1_serah_berkas, dan update status booking menjadi "Diserahkan". Notifikasi dikirim ke PPAT bahwa dokumen sudah siap diambil.

**Tabel Database:**
- `lsb_1_serah_berkas`: Menyimpan data handover (tanggal, penerima, tanda tangan)

---

### **Lampiran 9: Activity Diagram LSB Update Status**

**Gambar L9: Activity Diagram LSB Update Status**

**Deskripsi:**
Activity Diagram LSB Update Status menggambarkan proses update status booking setelah LSB melakukan handover. Sistem mengupdate trackstatus di pat_1_bookingsspd menjadi "Diserahkan", mengupdate status di lsb_1_serah_berkas dengan timestamp handover, dan mengirim notifikasi ke PPAT bahwa dokumen sudah diserahkan. Booking dinyatakan selesai dan dapat ditutup.

**Status Update:**
- `pat_1_bookingsspd.trackstatus`: "Diserahkan"
- `lsb_1_serah_berkas.status`: "Selesai"
- Notifikasi: Dikirim ke PPAT

---

## ✅ RINGKASAN PENGGUNAAN

### **Di BAB IV:**
- Gunakan **Tabel X** untuk daftar semua Activity Diagram
- Jelaskan **4 Activity Diagram** secara detail:
  1. Create Booking
  2. Generate No. Booking
  3. Upload Document
  4. LTB Validate Document

### **Di LAMPIRAN:**
- Letakkan **9 Activity Diagram** lainnya dengan deskripsi singkat
- Format: Gambar + Deskripsi singkat (seperti contoh di atas)

---

**Dibuat untuk:** Revisi Draft Final Tugas Akhir  
**Tanggal:** Desember 2025

