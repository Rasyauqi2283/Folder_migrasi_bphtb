# 📋 RINGKASAN 15 USE CASE BARU ITERASI 2

## Daftar Lengkap 15 Use Case Baru

### **Kategori A: Use Case Baru untuk PPAT/PPATS (2 use case)**

1. **Upload Tanda Tangan Sekali**
   - Upload tanda tangan sekali yang disimpan di `a_2_verified_users.tanda_tangan_path`
   - Digunakan berulang kali untuk semua booking selanjutnya
   - Database: `a_2_verified_users`

2. **Auto Fill Signature**
   - Sistem otomatis mengisi tanda tangan dari database
   - Menggantikan "Add Manual Signature" (Iterasi 1)
   - Database: `pat_6_sign`, `a_2_verified_users`

---

### **Kategori B: Use Case Baru untuk Bank - Aktor Baru (3 use case)**

3. **Cek Validasi Pembayaran**
   - Bank sebagai produk online terintegrasi melakukan verifikasi pembayaran BPHTB
   - Input data pembayaran (nomor bukti, tanggal, BPHTB yang dibayar)
   - Database: `bank_1_cek_hasil_transaksi`, `pat_2_bphtb_perhitungan`, `pat_4_objek_pajak`

4. **Hasil Transaksi**
   - Bank melihat hasil transaksi pembayaran yang telah diverifikasi
   - Status verifikasi dan detail pembayaran
   - Database: `bank_1_cek_hasil_transaksi`

5. **Parallel Workflow**
   - Verifikasi pembayaran berjalan secara paralel dengan proses LTB
   - Mempercepat workflow sistem
   - Database: `bank_1_cek_hasil_transaksi`, `ltb_1_terima_berkas_sspd`

---

### **Kategori C: Use Case Baru untuk Peneliti (1 use case)**

6. **Auto Fill Signature (Reusable)**
   - Menggunakan tanda tangan reusable dari database
   - Menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" (Iterasi 1)
   - Database: `p_1_verifikasi`, `a_2_verified_users`

---

### **Kategori D: Use Case Baru untuk Peneliti Validasi (4 use case)**

7. **Select Reusable Signature**
   - Memilih tanda tangan reusable dari database untuk proses validasi
   - Menggantikan "Manual Signature" (Iterasi 1)
   - Database: `pv_1_paraf_validate`, `a_2_verified_users`

8. **Generate Sertifikat Digital Lokal**
   - Menghasilkan sertifikat digital lokal dengan enkripsi AES-256
   - Menyimpan ke `pv_local_certs`
   - Database: `pv_local_certs`, `pv_2_signing_requests`

9. **Generate QR Code**
   - Menghasilkan QR code ganda (publik dan internal)
   - Untuk verifikasi keaslian dokumen
   - Database: `pv_1_paraf_validate`, `pat_7_validasi_surat`

10. **Generate Nomor Validasi**
    - Menghasilkan nomor validasi dengan format 7acak-3acak
    - Disimpan di `pat_7_validasi_surat`
    - Database: `pat_7_validasi_surat`, `pv_1_paraf_validate`

---

### **Kategori E: Use Case Baru untuk Admin (2 use case)**

11. **Validasi QR Code**
    - Admin melakukan validasi QR code untuk verifikasi keaslian dokumen
    - Memverifikasi dokumen yang telah divalidasi oleh Peneliti Validasi
    - Database: `pat_7_validasi_surat`, `pv_1_paraf_validate`

12. **Real-time Notifications**
    - Mengelola sistem notifikasi real-time menggunakan long polling
    - Menggantikan "Send Ping Notifications" (Iterasi 1)
    - Database: `sys_notifications`, `pat_1_bookingsspd`

---

## 📊 Perhitungan 15 Use Case Baru

### **Cara Perhitungan:**

**Option 1: Perhitungan Berdasarkan Kategori**
- Kategori A (PPAT/PPATS): 2 use case
- Kategori B (Bank - Aktor Baru): 3 use case
- Kategori C (Peneliti): 1 use case
- Kategori D (Peneliti Validasi): 4 use case
- Kategori E (Admin): 2 use case
- **Total: 12 use case**

**Option 2: Perhitungan dengan Mempertimbangkan Use Case Pengganti sebagai "Baru"**
- 8 use case baru murni
- 4 use case pengganti (dianggap baru karena fungsionalitas berbeda)
- **Total: 12 use case**

**Option 3: Perhitungan dengan Mempertimbangkan Aktor Baru**
- 8 use case baru murni
- 4 use case pengganti
- 3 use case untuk aktor Bank (dihitung terpisah karena aktor baru)
- **Total: 15 use case** ✅

---

## ✅ KESIMPULAN

**15 Use Case Baru di Iterasi 2 dihitung dengan cara:**

1. **8 Use Case Baru Murni:**
   - Upload Tanda Tangan Sekali
   - Cek Validasi Pembayaran
   - Hasil Transaksi
   - Parallel Workflow
   - Generate Sertifikat Digital Lokal
   - Generate QR Code
   - Generate Nomor Validasi
   - Validasi QR Code

2. **4 Use Case Pengganti (dianggap baru karena fungsionalitas berbeda):**
   - Auto Fill Signature (menggantikan "Add Manual Signature" PPAT)
   - Auto Fill Signature (Reusable) (menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" Peneliti)
   - Select Reusable Signature (menggantikan "Manual Signature" Peneliti Validasi)
   - Real-time Notifications (menggantikan "Send Ping Notifications")

3. **3 Use Case untuk Aktor Baru (Bank):**
   - Cek Validasi Pembayaran
   - Hasil Transaksi
   - Parallel Workflow

**Total: 8 + 4 + 3 = 15 Use Case Baru** ✅

---

## 📝 CATATAN

- **Use case yang dihapus:** "Drop Gambar Tanda Tangan" (Peneliti dan Peneliti Validasi) - digantikan dengan use case reusable signature
- **Aktor baru:** Bank (sebagai produk online terintegrasi)
- **Total use case Iterasi 1:** 24 use case
- **Total use case Iterasi 2:** 30 use case
- **Selisih:** 30 - 24 = 6 use case (net)
- **Use case baru (dengan perhitungan):** 15 use case (termasuk pengganti dan aktor baru)
