# ✅ CHECKLIST DIAGRAM ITERASI 2 UNTUK PROSES PENGEMBANGAN

## 📊 STATUS DIAGRAM YANG DIPERLUKAN

### **1. Struktur Database Versi 2 (ERD Iterasi 2)** ✅ **SIAP**

**File:** `storage/disini/ERD_Database_E-BPHTB_Iterasi2.xml`

**Status:** ✅ **SUDAH ADA DAN SIAP DIGUNAKAN**

**Penambahan Tabel Baru:**
- ✅ `bank_1_cek_hasil_transaksi` - Verifikasi pembayaran Bank
- ✅ `pv_1_debug_log` - Log debugging
- ✅ `pv_2_signing_requests` - Request penandatanganan
- ✅ `pv_4_signing_audit_event` - Audit event
- ✅ `pv_7_audit_log` - Audit trail
- ✅ `pv_local_certs` - Sertifikat digital lokal
- ✅ `pat_7_validasi_surat` - Validasi surat dengan nomor validasi
- ✅ `sys_notifications` - Sistem notifikasi

**Untuk Dokumen TA:**
- **Gambar X: ERD Database E-BPHTB - Iterasi 2**
- **Lokasi:** Setelah paragraf tentang struktur database Iterasi 2 di bagian "4.1.2.1 Proses Pengembangan Iterasi 2"

---

### **2. Activity Diagram Bank Integration** ✅ **SIAP**

**File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Bank_Integration_Iterasi2.xml`

**Status:** ✅ **SUDAH ADA DAN SIAP DIGUNAKAN**

**Proses yang Dicakup:**
- Bank login sebagai produk online terintegrasi
- Verifikasi pembayaran online
- Parallel workflow dengan LTB
- Update database `bank_1_cek_hasil_transaksi`

**Untuk Dokumen TA:**
- **Gambar Y: Activity Diagram Bank Integration - Verifikasi Pembayaran (Iterasi 2)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah paragraf tentang Activity Diagram

---

### **3. Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)** ✅ **SIAP**

**File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Peneliti_Validasi_Iterasi2.xml`

**Status:** ✅ **SUDAH ADA DAN SIAP DIGUNAKAN**

**Proses yang Dicakup:**
- Tanda tangan reusable
- Generate sertifikat digital lokal
- Generate QR code ganda
- Generate nomor validasi (7acak-3acak)

**Untuk Dokumen TA:**
- **Gambar Z: Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah Activity Diagram Bank

---

### **4. Diagram Proses Bisnis Iterasi 2 (dengan Role Bank)** ⚠️ **PERLU DICEK**

**File yang Mungkin Relevan:**
- `DIAGRAMS/iterasi_2swimlane.xml` (perlu dicek isinya)
- `DIAGRAMS/E-BPHTB_Swimlane.drawio_edited_2.xml` (perlu dicek apakah ada role Bank)

**Status:** ⚠️ **PERLU DICEK/DIBUAT**

**Yang Diperlukan:**
- Diagram proses bisnis dengan swimlane yang mencakup:
  - PPAT/PPATS
  - LTB
  - **Bank (BARU - Iterasi 2)** ← **PENTING**
  - Peneliti
  - Peneliti Paraf
  - Peneliti Validasi (dengan proses digital)
  - LSB
- Parallel workflow antara Bank dan LTB
- Proses Peneliti Validasi dengan sertifikat digital lokal

**Untuk Dokumen TA:**
- **Gambar W: Diagram Proses Bisnis Iterasi 2 (dengan Penambahan Role Bank)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah paragraf tentang Diagram Proses Bisnis

---

## 📋 RINGKASAN UNTUK PENEMPATAN DI DOKUMEN TA

### **Bagian: "4.1.2.1 Proses Pengembangan Iterasi 2"**

#### **Struktur yang Disarankan:**

1. **Paragraf Pendahuluan** - Penjelasan iterasi 2
2. **a) Communication (Komunikasi)** - Diskusi dengan stakeholder
3. **b) Quick Plan (Perencanaan Cepat)** - Perencanaan fitur
4. **c) Quick Design (Desain Cepat)** - Desain sistem
   - **Paragraf tentang ERD** → **Gambar X: ERD Database Iterasi 2**
   - **Paragraf tentang Activity Diagram** → **Gambar Y: Activity Diagram Bank** → **Gambar Z: Activity Diagram Peneliti Validasi**
   - **Paragraf tentang Diagram Proses Bisnis** → **Gambar W: Diagram Proses Bisnis Iterasi 2**
5. **d) Prototype Construction** - Pembangunan prototipe
6. **e) Delivery and Feedback** - Pengujian dan feedback

---

## ✅ CHECKLIST FINAL

### **Diagram yang Sudah Siap:**
- ✅ ERD Database Iterasi 2
- ✅ Activity Diagram Bank Integration
- ✅ Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)

### **Diagram yang Perlu Dicek:**
- ⚠️ Diagram Proses Bisnis Iterasi 2 (dengan Role Bank)

---

## 📝 TINDAK LANJUT

1. **Verifikasi Diagram Proses Bisnis Iterasi 2:**
   - Buka file `DIAGRAMS/iterasi_2swimlane.xml` atau `DIAGRAMS/E-BPHTB_Swimlane.drawio_edited_2.xml`
   - Pastikan ada swimlane untuk **Bank**
   - Pastikan menunjukkan parallel workflow dengan LTB
   - Jika belum ada, buat diagram proses bisnis baru dengan role Bank

2. **Siapkan untuk Dokumen TA:**
   - Export semua diagram ke format gambar (PNG/JPG) dengan resolusi tinggi
   - Pastikan semua diagram memiliki caption yang sesuai
   - Pastikan nomor gambar konsisten dengan dokumen TA

---

**Dibuat untuk:** Proses Pengembangan Iterasi 2 di BAB IV  
**Tanggal:** Desember 2025  
**Status:** 3 dari 4 diagram sudah siap, 1 diagram perlu dicek
