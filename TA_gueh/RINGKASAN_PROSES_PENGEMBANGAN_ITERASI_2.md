# 📊 RINGKASAN PROSES PENGEMBANGAN ITERASI 2

## ✅ STATUS DIAGRAM YANG DIPERLUKAN

### **1. Struktur Database Versi 2 (ERD Iterasi 2)** ✅ **SUDAH ADA**

**File:** `storage/disini/ERD_Database_E-BPHTB_Iterasi2.xml`

**Penambahan Tabel Database Baru:**
- ✅ `bank_1_cek_hasil_transaksi` - Tabel verifikasi pembayaran Bank (Iterasi 2 - Bank Integration)
- ✅ `pv_1_debug_log` - Log debugging untuk proses penandatanganan
- ✅ `pv_2_signing_requests` - Request penandatanganan dengan sertifikat digital
- ✅ `pv_4_signing_audit_event` - Audit event untuk penandatanganan
- ✅ `pv_7_audit_log` - Audit trail lengkap untuk validasi
- ✅ `pv_local_certs` - Sertifikat digital lokal (bukan BSRE)
- ✅ `pat_7_validasi_surat` - Validasi surat dengan nomor validasi
- ✅ `sys_notifications` - Sistem notifikasi real-time

**Tabel yang Diupdate:**
- ✅ `pv_1_paraf_validate` - Ditambahkan `created_at` dan catatan "Iterasi 2 - Digital Certificate Integration"
- ✅ `a_2_verified_users` - Ditambahkan `tanda_tangan_path` untuk tanda tangan reusable

**Status:** ✅ **SIAP DIGUNAKAN**

---

### **2. Activity Diagram Bank Integration** ✅ **SUDAH ADA**

**File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Bank_Integration_Iterasi2.xml`

**Proses yang Dicakup:**
- ✅ Bank login ke sistem (sebagai produk online terintegrasi)
- ✅ Bank melihat daftar booking yang memerlukan verifikasi pembayaran
- ✅ Bank memilih booking untuk diverifikasi
- ✅ Bank menginput data pembayaran (nomor bukti pembayaran, tanggal pembayaran, BPHTB yang telah dibayar)
- ✅ Bank melakukan verifikasi pembayaran
- ✅ Sistem update `bank_1_cek_hasil_transaksi`
- ✅ Sistem sinkronisasi dengan LTB (parallel workflow)
- ✅ Notifikasi ke LTB dan PPAT

**Tabel Database Terkait:**
- `bank_1_cek_hasil_transaksi`
- `pat_2_bphtb_perhitungan`
- `pat_4_objek_pajak`
- `ltb_1_terima_berkas_sspd`

**Status:** ✅ **SIAP DIGUNAKAN**

---

### **3. Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)** ✅ **SUDAH ADA**

**File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/Activity_Diagrams/Activity_Peneliti_Validasi_Iterasi2.xml`

**Proses yang Dicakup:**
- ✅ Peneliti Validasi menerima notifikasi dari Clear to Paraf
- ✅ Peneliti Validasi membuka booking dan melihat dokumen yang sudah diparaf
- ✅ Peneliti Validasi melakukan final validation
- ✅ **Pilih tanda tangan reusable** (dari `a_2_verified_users.tanda_tangan_path`)
- ✅ **Generate sertifikat digital lokal** (ke `pv_local_certs`)
- ✅ **Generate QR Code ganda** (publik dan internal)
- ✅ **Generate nomor validasi** (format 7acak-3acak)
- ✅ Update `pv_1_paraf_validate` dengan status 'Validated' dan nomor validasi
- ✅ Insert ke `pv_2_signing_requests` untuk tracking penandatanganan
- ✅ Insert ke `pat_7_validasi_surat` dengan nomor validasi
- ✅ Insert ke `lsb_1_serah_berkas` dengan status 'Pending Handover'
- ✅ Update `pat_1_bookingsspd` dengan trackstatus 'Dikirim ke LSB' dan nomor validasi
- ✅ Mengirim notifikasi ke LSB dan email ke PPAT

**Tabel Database Terkait:**
- `pv_1_paraf_validate`
- `pv_2_signing_requests`
- `pv_local_certs`
- `pv_7_audit_log`
- `pat_7_validasi_surat`
- `a_2_verified_users`
- `lsb_1_serah_berkas`
- `pat_1_bookingsspd`

**Status:** ✅ **SIAP DIGUNAKAN**

---

### **4. Diagram Proses Bisnis Iterasi 2 (dengan Role Bank)** ⚠️ **PERLU DICEK/DIBUAT**

**Yang Diperlukan:**
- Diagram proses bisnis yang menunjukkan perubahan dari Iterasi 1
- **Penambahan role Bank** sebagai produk online terintegrasi
- Alur proses bisnis dengan Bank terintegrasi
- Parallel workflow antara Bank dan LTB
- Proses Peneliti Validasi dengan sertifikat digital lokal

**File yang Perlu Dicek:**
- Apakah ada diagram proses bisnis Iterasi 2 di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/`?
- Jika belum ada, perlu dibuat diagram proses bisnis dengan swimlane yang mencakup:
  - PPAT/PPATS
  - LTB
  - **Bank (BARU - Iterasi 2)**
  - Peneliti
  - Peneliti Paraf
  - Peneliti Validasi (dengan proses digital)
  - LSB

**Status:** ⚠️ **PERLU DICEK/DIBUAT**

---

## 📋 RINGKASAN UNTUK DOKUMEN TA

### **Gambar yang Perlu Ditambahkan di Bagian "4.1.2.1 Proses Pengembangan Iterasi 2":**

#### **1. Struktur Database Versi 2 (ERD Iterasi 2)**
- **Gambar X: ERD Database E-BPHTB - Iterasi 2**
- **Lokasi:** Setelah paragraf tentang struktur database Iterasi 2
- **Deskripsi:** "Struktur database Iterasi 2 menunjukkan penambahan tabel baru untuk integrasi Bank dan sistem sertifikat digital lokal. Tabel `bank_1_cek_hasil_transaksi` digunakan untuk verifikasi pembayaran online, sedangkan tabel `pv_local_certs`, `pv_2_signing_requests`, dan `pv_7_audit_log` digunakan untuk sistem sertifikat digital lokal dan audit trail."

#### **2. Activity Diagram Bank Integration**
- **Gambar Y: Activity Diagram Bank Integration - Verifikasi Pembayaran (Iterasi 2)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah paragraf tentang Activity Diagram
- **Deskripsi:** "Activity Diagram Bank Integration menggambarkan proses verifikasi pembayaran oleh Bank sebagai produk online terintegrasi. Proses dimulai ketika Bank login ke sistem, melihat daftar booking yang memerlukan verifikasi, menginput data pembayaran, melakukan verifikasi, dan sistem melakukan sinkronisasi dengan LTB secara paralel."

#### **3. Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**
- **Gambar Z: Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah Activity Diagram Bank
- **Deskripsi:** "Activity Diagram Peneliti Validasi Final Validation (Iterasi 2) menggambarkan proses validasi final yang telah terintegrasi dengan sistem digital. Proses mencakup penggunaan tanda tangan reusable, generate sertifikat digital lokal, generate QR code ganda, dan generate nomor validasi format 7acak-3acak."

#### **4. Diagram Proses Bisnis Iterasi 2 (dengan Role Bank)**
- **Gambar W: Diagram Proses Bisnis Iterasi 2 (dengan Penambahan Role Bank)**
- **Lokasi:** Di bagian "c) Quick Design (Desain Cepat)" setelah paragraf tentang Diagram Proses Bisnis
- **Deskripsi:** "Diagram Proses Bisnis Iterasi 2 menggambarkan alur kerja sistem booking online E-BPHTB yang telah dikembangkan menjadi lebih terintegrasi dengan penambahan divisi Bank sebagai produk online terintegrasi. Diagram menunjukkan parallel workflow antara Bank dan LTB, serta proses Peneliti Validasi dengan sertifikat digital lokal."

---

## ✅ CHECKLIST KELENGKAPAN

### **Diagram yang Sudah Ada:**
- ✅ ERD Database Iterasi 2
- ✅ Activity Diagram Bank Integration
- ✅ Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)

### **Diagram yang Perlu Dicek/Dibuat:**
- ⚠️ Diagram Proses Bisnis Iterasi 2 (dengan Role Bank)

---

## 📝 CATATAN PENTING

1. **ERD Iterasi 2** sudah lengkap dengan semua tabel baru untuk Bank dan sertifikat digital lokal
2. **Activity Diagram Bank** sudah lengkap dengan proses verifikasi pembayaran online
3. **Activity Diagram Peneliti Validasi** sudah lengkap dengan proses digital (reusable signature, sertifikat digital lokal, QR code)
4. **Diagram Proses Bisnis Iterasi 2** perlu dicek apakah sudah ada atau perlu dibuat

---

**Dibuat untuk:** Proses Pengembangan Iterasi 2 di BAB IV  
**Tanggal:** Desember 2025  
**Status:** 3 dari 4 diagram sudah siap, 1 diagram perlu dicek/dibuat
