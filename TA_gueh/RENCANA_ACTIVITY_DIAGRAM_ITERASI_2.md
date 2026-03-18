# 📋 RENCANA ACTIVITY DIAGRAM ITERASI 2

## Status Activity Diagram yang Sudah Ada

### ✅ **Activity Diagram yang SUDAH ADA (2 diagram):**

1. **Activity_Bank_Integration_Iterasi2.xml**
   - Mencakup: Cek Validasi Pembayaran, Hasil Transaksi, Parallel Workflow
   - Status: ✅ SUDAH ADA

2. **Activity_Peneliti_Validasi_Iterasi2.xml**
   - Mencakup: Select Reusable Signature, Generate Sertifikat Digital Lokal, Generate QR Code, Generate Nomor Validasi
   - Status: ✅ SUDAH ADA

---

## 📊 Rencana Activity Diagram Baru

### **3-4 Activity Diagram yang Dijelaskan Secara Rinci:**

#### **1. Upload Tanda Tangan Sekali (PPAT/PPATS)** ⭐ PRIORITAS TINGGI
- **Use Case:** Upload Tanda Tangan Sekali
- **Deskripsi:** PPAT/PPATS mengupload tanda tangan sekali yang disimpan di `a_2_verified_users.tanda_tangan_path` untuk digunakan berulang kali
- **Database:** `a_2_verified_users`
- **Format:** Swimlane (PPAT/PPATS, Sistem)
- **File:** `Activity_18_Upload_Tanda_Tangan_Sekali_Iterasi2.xml`
- **Status:** ❌ PERLU DIBUAT

#### **2. Auto Fill Signature (Reusable) - Peneliti** ⭐ PRIORITAS TINGGI
- **Use Case:** Auto Fill Signature (Reusable)
- **Deskripsi:** Peneliti menggunakan tanda tangan reusable dari database tanpa upload manual
- **Database:** `p_1_verifikasi`, `a_2_verified_users`
- **Format:** Swimlane (Peneliti, Sistem)
- **File:** `Activity_19_Peneliti_Auto_Fill_Signature_Reusable_Iterasi2.xml`
- **Status:** ❌ PERLU DIBUAT
- **Catatan:** Modifikasi dari Activity_14_Peneliti_Receive_from_LTB.xml

#### **3. Validasi QR Code (Admin)** ⭐ PRIORITAS TINGGI
- **Use Case:** Validasi QR Code
- **Deskripsi:** Admin melakukan validasi QR code untuk verifikasi keaslian dokumen
- **Database:** `pat_7_validasi_surat`, `pv_1_paraf_validate`
- **Format:** Swimlane (Admin, Sistem)
- **File:** `Activity_20_Admin_Validasi_QR_Code_Iterasi2.xml`
- **Status:** ❌ PERLU DIBUAT

#### **4. Auto Fill Signature (PPAT/PPATS)** ⭐ OPSIONAL
- **Use Case:** Auto Fill Signature
- **Deskripsi:** Sistem otomatis mengisi tanda tangan dari database ke booking baru
- **Database:** `pat_6_sign`, `a_2_verified_users`
- **Format:** Swimlane (PPAT/PPATS, Sistem)
- **File:** `Activity_21_PPAT_Auto_Fill_Signature_Iterasi2.xml`
- **Status:** ❌ PERLU DIBUAT (OPSIONAL - bisa digabung dengan Create Booking)
- **Catatan:** Bisa diintegrasikan ke Activity_02_Create_Booking.xml atau dibuat terpisah

---

## 📋 Activity Diagram yang Dimasukkan ke Tabel (Lampiran)

### **Activity Diagram yang Sudah Ada (2 diagram):**

1. **Activity Diagram Bank Integration - Verifikasi Pembayaran (Iterasi 2)**
   - Use Case: Cek Validasi Pembayaran, Hasil Transaksi, Parallel Workflow
   - Aktor: Bank, Sistem
   - Database: `bank_1_cek_hasil_transaksi`, `pat_2_bphtb_perhitungan`, `pat_4_objek_pajak`, `ltb_1_terima_berkas_sspd`
   - Lokasi: `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Bank_Integration_Iterasi2.xml`

2. **Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**
   - Use Case: Select Reusable Signature, Generate Sertifikat Digital Lokal, Generate QR Code, Generate Nomor Validasi
   - Aktor: Peneliti Validasi, Sistem
   - Database: `pv_1_paraf_validate`, `pv_local_certs`, `pv_2_signing_requests`, `pat_7_validasi_surat`, `a_2_verified_users`
   - Lokasi: `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Peneliti_Validasi_Iterasi2.xml`

### **Activity Diagram yang Tidak Perlu Dibuat Terpisah (3 use case):**

3. **Real-time Notifications (Admin)**
   - Use Case: Real-time Notifications
   - Aktor: Admin, Sistem
   - Database: `sys_notifications`, `pat_1_bookingsspd`
   - Catatan: Modifikasi dari Activity_17_Admin_Monitor_and_Notifications.xml (Iterasi 1), cukup masuk tabel

4. **Auto Fill Signature (PPAT/PPATS)** - Jika tidak dibuat terpisah
   - Use Case: Auto Fill Signature
   - Aktor: PPAT/PPATS, Sistem
   - Database: `pat_6_sign`, `a_2_verified_users`
   - Catatan: Bisa diintegrasikan ke Create Booking atau masuk tabel

---

## 📊 RINGKASAN

### **Activity Diagram yang Dijelaskan Rinci (3-4 diagram):**
1. ✅ Upload Tanda Tangan Sekali (PPAT/PPATS)
2. ✅ Auto Fill Signature (Reusable) - Peneliti
3. ✅ Validasi QR Code (Admin)
4. ⚠️ Auto Fill Signature (PPAT/PPATS) - OPSIONAL

### **Activity Diagram yang Masuk Tabel (Lampiran):**
1. ✅ Bank Integration - Verifikasi Pembayaran (SUDAH ADA)
2. ✅ Peneliti Validasi Final Validation (SUDAH ADA)
3. ✅ Real-time Notifications (modifikasi dari Activity 17)
4. ⚠️ Auto Fill Signature (PPAT) - jika tidak dibuat terpisah

### **Total Activity Diagram Iterasi 2:**
- **Dijelaskan rinci:** 3-4 diagram
- **Masuk tabel:** 2-4 diagram
- **Total:** 5-8 diagram

---

## ✅ TINDAKAN SELANJUTNYA

1. ✅ Buat Activity Diagram: Upload Tanda Tangan Sekali
2. ✅ Buat Activity Diagram: Auto Fill Signature (Reusable) - Peneliti
3. ✅ Buat Activity Diagram: Validasi QR Code (Admin)
4. ⚠️ Buat Activity Diagram: Auto Fill Signature (PPAT) - OPSIONAL
5. ✅ Buat Tabel Activity Diagram Iterasi 2 untuk Lampiran
6. ✅ Update dokumentasi Quick Design Iterasi 2
