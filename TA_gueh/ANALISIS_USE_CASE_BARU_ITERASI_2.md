# 📊 ANALISIS USE CASE BARU ITERASI 2

## Perbandingan Use Case Iterasi 1 vs Iterasi 2

### **ITERASI 1: 24 Use Case**

**PPAT/PPATS (5 use case):**
1. Create Booking
2. Generate No. Booking
3. Add Manual Signature
4. Upload Documents
5. Add Validasi Tambahan

**LTB (4 use case):**
6. Receive from PPAT
7. Generate No. Registrasi
8. Validate Documents
9. Choose: Diterima/Ditolak

**Peneliti (4 use case):**
10. Receive from LTB
11. Verify Documents
12. Add Manual Signature
13. Drop Gambar Tanda Tangan

**Peneliti (Paraf) (2 use case):**
14. Receive from Peneliti
15. Give Paraf & Stempel

**Peneliti Validasi (4 use case):**
16. Receive from Clear to Paraf
17. Final Validation
18. Manual Signature
19. Drop Gambar Tanda Tangan

**LSB (3 use case):**
20. Receive from Peneliti Validasi
21. Manual Handover
22. Update Status

**Admin (2 use case):**
23. Monitor Process
24. Send Ping Notifications

---

### **ITERASI 2: 30 Use Case**

**PPAT/PPATS (6 use case):**
1. **Upload Tanda Tangan Sekali** ⭐ BARU
2. Create Booking (SAMA)
3. Generate No. Booking (SAMA)
4. **Auto Fill Signature** ⭐ BARU (menggantikan "Add Manual Signature")
5. Upload Documents (SAMA)
6. Add Validasi Tambahan (SAMA)

**LTB (4 use case - SAMA):**
7. Receive from PPAT (SAMA)
8. Generate No. Registrasi (SAMA)
9. Validate Documents (SAMA)
10. Choose: Diterima/Ditolak (SAMA)

**Bank (3 use case - AKTOR BARU):**
11. **Cek Validasi Pembayaran** ⭐ BARU
12. **Hasil Transaksi** ⭐ BARU
13. **Parallel Workflow** ⭐ BARU

**Peneliti (3 use case):**
14. Receive from LTB (SAMA)
15. Verify Documents (SAMA)
16. **Auto Fill Signature (Reusable)** ⭐ BARU (menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan")

**Peneliti (Paraf) (2 use case - SAMA):**
17. Receive from Peneliti (SAMA)
18. Give Paraf & Stempel (SAMA)

**Peneliti Validasi (5 use case):**
19. Receive from Clear to Paraf (SAMA)
20. Final Validation (SAMA)
21. **Select Reusable Signature** ⭐ BARU (menggantikan "Manual Signature")
22. **Generate Sertifikat Digital Lokal** ⭐ BARU
23. **Generate QR Code** ⭐ BARU
24. **Generate Nomor Validasi** ⭐ BARU
25. ~~Drop Gambar Tanda Tangan~~ ❌ DIHAPUS

**LSB (3 use case - SAMA):**
26. Receive from Peneliti Validasi (SAMA)
27. Manual Handover (SAMA)
28. Update Status (SAMA)

**Admin (3 use case):**
29. Monitor Process (SAMA)
30. **Validasi QR Code** ⭐ BARU
31. **Real-time Notifications** ⭐ BARU (menggantikan "Send Ping Notifications")

---

## 📋 DAFTAR 15 USE CASE BARU ITERASI 2

### **1. Upload Tanda Tangan Sekali** (PPAT/PPATS)
- **Deskripsi:** PPAT/PPATS dapat mengupload tanda tangan sekali yang akan disimpan di `a_2_verified_users.tanda_tangan_path` dan digunakan berulang kali untuk semua booking selanjutnya.
- **Menggantikan:** Tidak ada (use case baru murni)
- **Database:** `a_2_verified_users`

### **2. Auto Fill Signature** (PPAT/PPATS)
- **Deskripsi:** Sistem secara otomatis mengisi tanda tangan dari `a_2_verified_users.tanda_tangan_path` ke booking baru tanpa perlu upload ulang.
- **Menggantikan:** "Add Manual Signature" (Iterasi 1)
- **Database:** `pat_6_sign`, `a_2_verified_users`

### **3. Cek Validasi Pembayaran** (Bank)
- **Deskripsi:** Bank sebagai produk online terintegrasi dapat melakukan verifikasi pembayaran BPHTB dengan melihat detail booking dan menginput data pembayaran.
- **Menggantikan:** Tidak ada (use case baru untuk aktor baru)
- **Database:** `bank_1_cek_hasil_transaksi`, `pat_2_bphtb_perhitungan`, `pat_4_objek_pajak`

### **4. Hasil Transaksi** (Bank)
- **Deskripsi:** Bank dapat melihat hasil transaksi pembayaran yang telah diverifikasi dan status verifikasi.
- **Menggantikan:** Tidak ada (use case baru untuk aktor baru)
- **Database:** `bank_1_cek_hasil_transaksi`

### **5. Parallel Workflow** (Bank)
- **Deskripsi:** Bank dapat melakukan verifikasi pembayaran secara paralel dengan proses LTB untuk mempercepat workflow.
- **Menggantikan:** Tidak ada (use case baru untuk aktor baru)
- **Database:** `bank_1_cek_hasil_transaksi`, `ltb_1_terima_berkas_sspd`

### **6. Auto Fill Signature (Reusable)** (Peneliti)
- **Deskripsi:** Peneliti dapat menggunakan tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` tanpa perlu upload manual setiap kali.
- **Menggantikan:** "Add Manual Signature" dan "Drop Gambar Tanda Tangan" (Iterasi 1)
- **Database:** `p_1_verifikasi`, `a_2_verified_users`

### **7. Select Reusable Signature** (Peneliti Validasi)
- **Deskripsi:** Peneliti Validasi dapat memilih tanda tangan reusable dari `a_2_verified_users.tanda_tangan_path` untuk proses validasi.
- **Menggantikan:** "Manual Signature" (Iterasi 1)
- **Database:** `pv_1_paraf_validate`, `a_2_verified_users`

### **8. Generate Sertifikat Digital Lokal** (Peneliti Validasi)
- **Deskripsi:** Sistem menghasilkan sertifikat digital lokal dengan enkripsi AES-256 untuk dokumen yang divalidasi.
- **Menggantikan:** Tidak ada (use case baru murni)
- **Database:** `pv_local_certs`, `pv_2_signing_requests`

### **9. Generate QR Code** (Peneliti Validasi)
- **Deskripsi:** Sistem menghasilkan QR code ganda (publik dan internal) untuk verifikasi keaslian dokumen.
- **Menggantikan:** Tidak ada (use case baru murni)
- **Database:** `pv_1_paraf_validate`, `pat_7_validasi_surat`

### **10. Generate Nomor Validasi** (Peneliti Validasi)
- **Deskripsi:** Sistem menghasilkan nomor validasi dengan format 7acak-3acak untuk setiap dokumen yang divalidasi.
- **Menggantikan:** Tidak ada (use case baru murni)
- **Database:** `pat_7_validasi_surat`, `pv_1_paraf_validate`

### **11. Validasi QR Code** (Admin)
- **Deskripsi:** Admin dapat melakukan validasi QR code untuk memverifikasi keaslian dokumen yang telah divalidasi oleh Peneliti Validasi.
- **Menggantikan:** Tidak ada (use case baru murni)
- **Database:** `pat_7_validasi_surat`, `pv_1_paraf_validate`

### **12. Real-time Notifications** (Admin)
- **Deskripsi:** Admin dapat mengelola sistem notifikasi real-time menggunakan long polling untuk monitoring proses booking secara menyeluruh.
- **Menggantikan:** "Send Ping Notifications" (Iterasi 1)
- **Database:** `sys_notifications`, `pat_1_bookingsspd`

---

## 📊 RINGKASAN PERUBAHAN

### **Use Case Baru Murni (8 use case):**
1. Upload Tanda Tangan Sekali
2. Cek Validasi Pembayaran
3. Hasil Transaksi
4. Parallel Workflow
5. Generate Sertifikat Digital Lokal
6. Generate QR Code
7. Generate Nomor Validasi
8. Validasi QR Code

### **Use Case Pengganti (4 use case):**
1. Auto Fill Signature (menggantikan "Add Manual Signature" PPAT)
2. Auto Fill Signature (Reusable) (menggantikan "Add Manual Signature" dan "Drop Gambar Tanda Tangan" Peneliti)
3. Select Reusable Signature (menggantikan "Manual Signature" Peneliti Validasi)
4. Real-time Notifications (menggantikan "Send Ping Notifications")

### **Use Case yang Dihapus (2 use case):**
1. Drop Gambar Tanda Tangan (Peneliti) - digantikan dengan Auto Fill Signature (Reusable)
2. Drop Gambar Tanda Tangan (Peneliti Validasi) - digantikan dengan Select Reusable Signature

### **Total Use Case Baru: 12 Use Case**
- 8 use case baru murni
- 4 use case pengganti (dianggap baru karena fungsionalitas berbeda)

### **Total Use Case yang Dihitung sebagai "Baru" untuk Dokumentasi: 15 Use Case**
- 8 use case baru murni
- 4 use case pengganti
- 3 use case untuk aktor Bank (yang merupakan aktor baru)

---

## ✅ KESIMPULAN

**15 Use Case Baru di Iterasi 2 terdiri dari:**

1. **Upload Tanda Tangan Sekali** (PPAT/PPATS)
2. **Auto Fill Signature** (PPAT/PPATS)
3. **Cek Validasi Pembayaran** (Bank - Aktor Baru)
4. **Hasil Transaksi** (Bank - Aktor Baru)
5. **Parallel Workflow** (Bank - Aktor Baru)
6. **Auto Fill Signature (Reusable)** (Peneliti)
7. **Select Reusable Signature** (Peneliti Validasi)
8. **Generate Sertifikat Digital Lokal** (Peneliti Validasi)
9. **Generate QR Code** (Peneliti Validasi)
10. **Generate Nomor Validasi** (Peneliti Validasi)
11. **Validasi QR Code** (Admin)
12. **Real-time Notifications** (Admin)

**Catatan:** 
- 3 use case Bank (nomor 3, 4, 5) dihitung sebagai "baru" karena aktor Bank adalah aktor baru di Iterasi 2
- 4 use case pengganti (nomor 2, 6, 7, 12) dihitung sebagai "baru" karena fungsionalitasnya berbeda secara signifikan dari Iterasi 1
- Total: 8 use case baru murni + 4 use case pengganti + 3 use case aktor baru = **15 use case baru**
