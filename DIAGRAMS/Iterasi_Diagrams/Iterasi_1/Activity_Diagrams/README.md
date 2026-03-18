# 📊 ACTIVITY DIAGRAMS - ITERASI 1

Folder ini berisi Activity Diagram untuk Iterasi 1: **Booking hingga Pengiriman** (November 2024 - Januari 2025)

## 📋 Rencana Pembuatan Activity Diagram

**Total Activity Diagram:** 19 diagram

### ✅ **SESI 1 - Selesai (6 Activity Diagram)**

1. ✅ **Activity_01_Login_Register.xml** - Alur proses Login dan Register
2. ✅ **Activity_02_Create_Booking.xml** - Alur proses Create Booking SSPD
3. ✅ **Activity_03_Generate_No_Booking.xml** - Alur proses Generate No. Booking (Database Trigger)
4. ✅ **Activity_04_Add_Manual_Signature.xml** - Alur proses Add Manual Signature
5. ✅ **Activity_05_Upload_Document.xml** - Alur proses Upload Document
6. ✅ **Activity_06_Add_Validasi_Tambahan.xml** - Alur proses Add Validasi Tambahan

### ✅ **SESI 2 - Selesai (7 Activity Diagram)**

7. ✅ **Activity_07_LTB_Receive_from_PPAT.xml** - Alur proses PPAT Kirim Booking ke LTB
8. ✅ **Activity_08_LTB_Generate_No_Registrasi.xml** - Alur proses Generate No. Registrasi (2025O00001)
9. ✅ **Activity_09_LTB_Validate_Document.xml** - Alur proses LTB Validasi Dokumen
10. ✅ **Activity_10_LTB_Accept_Reject.xml** - Alur proses LTB Memilih Diterima/Ditolak
11. ✅ **Activity_11_LSB_Receive_from_Peneliti_Validasi.xml** - Alur proses LSB Menerima dari Peneliti Validasi
12. ✅ **Activity_12_LSB_Manual_Handover.xml** - Alur proses Manual Handover di LSB
13. ✅ **Activity_13_LSB_Update_Status.xml** - Alur proses Update Status setelah Handover

### 📝 **SESI 3 - Rencana (Activity 13-19)**

13. ⏳ **Activity_13_Peneliti_Receive.xml** - Alur proses Peneliti Menerima Dokumen
14. ⏳ **Activity_14_Peneliti_Verify.xml** - Alur proses Peneliti Verifikasi Dokumen
15. ⏳ **Activity_15_Peneliti_Paraf.xml** - Alur proses Peneliti Paraf Manual
16. ⏳ **Activity_16_Clear_to_Paraf.xml** - Alur proses Clear to Paraf
17. ⏳ **Activity_17_Peneliti_Validasi_Receive.xml** - Alur proses Peneliti Validasi Menerima
18. ⏳ **Activity_18_Peneliti_Validasi_Final.xml** - Alur proses Peneliti Validasi Final
19. ⏳ **Activity_19_LSB_Serah_Berkas.xml** - Alur proses LSB Serah Berkas

---

## 📁 Struktur File

```
Activity_Diagrams/
├── README.md (file ini)
├── Activity_01_Login_Register.xml
├── Activity_02_Create_Booking.xml
├── Activity_03_Generate_No_Booking.xml
├── Activity_04_Add_Manual_Signature.xml
├── Activity_05_Upload_Document.xml
├── Activity_06_Add_Validasi_Tambahan.xml
├── Activity_07_Send_to_LTB.xml (akan dibuat)
├── Activity_08_LTB_Receive.xml (akan dibuat)
├── ... (hingga Activity 19)
└── Activity_19_LSB_Serah_Berkas.xml (akan dibuat)
```

---

## 🎯 Deskripsi Activity Diagram yang Sudah Dibuat

### **Format Diagram:**
Semua activity diagram menggunakan format **Swimlane** yang jelas membedakan:
- **Aktor/User** (kolom kiri) - Aktivitas yang dilakukan oleh user
- **Sistem** (kolom kanan) - Aktivitas yang dilakukan oleh sistem
- Setiap aktivitas ditempatkan di swimlane yang sesuai dengan aktor yang melakukan

### **Activity 01: Login + Register**
- **Swimlane:** User | Sistem
- **Deskripsi:** Alur lengkap proses login dan registrasi pengguna
- **Fitur:**
  - Register dengan OTP verification
  - Login dengan validasi password
  - Session management
  - Profile completeness check
  - Error handling untuk setiap tahap

### **Activity 02: Create Booking**
- **Swimlane:** PPAT/PPATS | Sistem
- **Deskripsi:** Alur pembuatan booking SSPD baru
- **Fitur:**
  - Validasi signature upload
  - Input data wajib pajak
  - Input data pemilik objek pajak
  - Perhitungan NJOP
  - Perhitungan BPHTB
  - Insert ke database dengan transaction

### **Activity 03: Generate No. Booking**
- **Swimlane:** Database Trigger | Database
- **Deskripsi:** Alur generate nomor booking otomatis via database trigger
- **Format:** `ppat_khusus-YYYY-000001`
- **Fitur:**
  - Database trigger `trg_nobooking` (BEFORE INSERT)
  - Query ppat_khusus dari user
  - Generate sequence number
  - Format dengan LPAD
  - Error handling jika ppat_khusus NULL

### **Activity 04: Add Manual Signature**
- **Swimlane:** PPAT/PPATS | Sistem
- **Deskripsi:** Alur upload tanda tangan manual
- **Fitur:**
  - Upload signature image (JPG/PNG, maks 2MB)
  - Preview signature
  - Validasi file
  - Save to secure storage
  - Insert ke `pat_6_sign`

### **Activity 05: Upload Document**
- **Swimlane:** PPAT/PPATS | Sistem
- **Deskripsi:** Alur upload dokumen pendukung
- **Fitur:**
  - Upload dokumen wajib/tambahan
  - Validasi file (format, size, maks 5MB)
  - Upload ke storage (UploadCare/Secure Storage)
  - Insert ke `pat_7_validasi_surat`

### **Activity 06: Add Validasi Tambahan**
- **Swimlane:** PPAT/PPATS | Sistem
- **Deskripsi:** Alur menambahkan validasi tambahan
- **Fitur:**
  - Input keterangan tambahan
  - Upload dokumen tambahan (optional)
  - Insert ke `pat_8_validasi_tambahan`
  - Database transaction untuk konsistensi data

### **Activity 07: LTB Receive from PPAT**
- **Swimlane:** PPAT/PPATS | Sistem
- **Deskripsi:** Alur PPAT mengirim booking ke LTB
- **Fitur:**
  - Validasi kelengkapan booking
  - Insert ke `ltb_1_terima_berkas_sspd`
  - Update status booking ke "Dikirim ke LTB"
  - Notifikasi ke LTB

### **Activity 08: LTB Generate No. Registrasi**
- **Swimlane:** LTB | Sistem
- **Deskripsi:** Alur generate nomor registrasi otomatis
- **Format:** `YYYYO00001` (contoh: 2025O00001)
- **Fitur:**
  - Query MAX sequence dari database
  - Format dengan LPAD
  - Update `ltb_1_terima_berkas_sspd`

### **Activity 09: LTB Validate Document**
- **Swimlane:** LTB | Sistem
- **Deskripsi:** Alur validasi dokumen oleh LTB
- **Fitur:**
  - Review dokumen (akta, sertifikat, tanda tangan)
  - Cek kelengkapan dokumen
  - Cek validitas dokumen
  - Cek konsistensi data
  - Simpan catatan validasi

### **Activity 10: LTB Accept/Reject**
- **Swimlane:** LTB | Sistem
- **Deskripsi:** Alur LTB memilih diterima atau ditolak
- **Fitur:**
  - Pilihan diterima → kirim ke Peneliti
  - Pilihan ditolak → beri alasan, notifikasi PPAT
  - Update status di `ltb_1_terima_berkas_sspd` dan `pat_1_bookingsspd`
  - Insert ke `p_1_verifikasi` jika diterima

### **Activity 11: LSB Receive from Peneliti Validasi**
- **Swimlane:** Peneliti Validasi (Pejabat) | Sistem
- **Deskripsi:** Alur Peneliti Validasi mengirim dokumen ke LSB
- **Fitur:**
  - Validasi data sebelum kirim
  - Insert ke `lsb_1_serah_berkas`
  - Update `pv_1_paraf_validate` dan `pat_1_bookingsspd`
  - Notifikasi ke LSB

### **Activity 12: LSB Manual Handover**
- **Swimlane:** LSB | Sistem
- **Deskripsi:** Alur serah terima manual di LSB
- **Fitur:**
  - Verifikasi dokumen fisik
  - Verifikasi identitas PPAT
  - Serah terima manual
  - Dapatkan tanda tangan PPAT
  - Update status di database

### **Activity 13: LSB Update Status**
- **Swimlane:** LSB | Sistem
- **Deskripsi:** Alur update status setelah handover
- **Fitur:**
  - Update `lsb_1_serah_berkas`
  - Update `pat_1_bookingsspd` (trackstatus='Diserahkan')
  - Update `pv_1_paraf_validate`
  - Notifikasi ke PPAT

---

## 🛠️ Cara Menggunakan

### **Membuka File XML:**
1. Buka [draw.io](https://app.diagrams.net/) atau install aplikasi DrawIO
2. File → Open → Pilih file `.xml`
3. File akan terbuka dan bisa diedit

### **Format File:**
- Format: XML (DrawIO compatible)
- Bisa dibuka dengan:
  - Draw.io (online/desktop)
  - Visual Paradigm
  - Enterprise Architect
  - StarUML
  - Tool UML lainnya yang support XML

---

## 📊 Progress

- ✅ **Selesai:** 13/19 (68.4%)
- ⏳ **Rencana:** 6/19 (31.6%)

---

## 📝 Catatan

- Semua activity diagram dibuat dalam format **Swimlane XML** yang kompatibel dengan DrawIO
- Setiap diagram mencakup:
  - **Swimlane** untuk membedakan aktor dan sistem
  - Initial node (Start)
  - Activity nodes (ditempatkan di swimlane yang sesuai)
  - Decision nodes (diamond shape)
  - Final node (End)
  - Error handling nodes
  - Database operations (jika ada)
  - Flow control dengan label yang jelas

- **Format Swimlane:**
  - Kolom kiri: Aktor/User yang melakukan aktivitas
  - Kolom kanan: Sistem yang memproses aktivitas
  - Setiap aktivitas jelas menunjukkan siapa yang melakukan

- Diagram akan dilanjutkan di sesi berikutnya hingga mencapai 19 activity diagram lengkap

---

**Update Terakhir:** Desember 2025  
**Status:** Sesi 1 & 2 Selesai (13/19 diagram)

