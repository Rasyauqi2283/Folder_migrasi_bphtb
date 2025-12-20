# 📧 RINGKASAN EMAIL YANG DIKIRIM KE PPAT

## 📊 TOTAL: **7 Jenis Email** (dalam berbagai skenario workflow)

---

## 🎯 EMAIL DALAM WORKFLOW BOOKING (5 email)

### **1. 📤 Email Pengiriman Dokumen** 
- **Fungsi**: `sendDocumentSubmissionEmail()`
- **Trigger**: Ketika PPAT mengirim booking ke LTB (Draft → Diolah)
- **Subject**: `Dokumen Permohonan Telah Dikirim - {nobooking}`
- **Isi**: 
  - Nomor Booking
  - Nomor Registrasi (baru di-generate)
  - Status: "Sedang Diolah"
  - Informasi proses selanjutnya
- **Lokasi**: `backend/routesxcontroller/5_PPAT_endpoint/endpoint_ppat.js:2081`
- **Status**: ✅ **SELALU TERKIRIM** saat booking dikirim

---

### **2. ✅ Email Persetujuan ke Peneliti**
- **Fungsi**: `sendPenelitiNotificationEmail()` (type: 'approval')
- **Trigger**: Ketika **KEDUA** LTB dan BANK sudah approve, booking dikirim ke Peneliti
- **Subject**: `[PPAT] Status Berkas {nobooking}`
- **Isi**:
  - Status: "Diajukan"
  - Track Status: "Dilanjutkan"
  - Keterangan: "Berkas telah disetujui oleh LTB dan BANK"
  - Informasi bahwa dokumen diteruskan ke tim peneliti
- **Lokasi**: `index.js:632` (BANK approve endpoint)
- **Kondisi**: ⚠️ **Hanya terkirim jika KEDUA LTB & BANK approve**

---

### **3. ❌ Email Penolakan oleh LTB**
- **Fungsi**: `sendPenelitiNotificationEmail()` (type: 'rejection') atau `sendRejectionEmail()`
- **Trigger**: Ketika LTB menolak booking
- **Subject**: `[PPAT] Status Berkas {nobooking}` atau `Dokumen Permohonan Ditolak - {nobooking}`
- **Isi**:
  - Status: "Ditolak"
  - Track Status: "LTB"
  - Alasan penolakan
  - Instruksi untuk perbaikan
- **Lokasi**: 
  - `index.js:1192` (menggunakan sendPenelitiNotificationEmail)
  - `backend/routesxcontroller/5_PPAT_endpoint/auto_delete_endpoints.js:83` (menggunakan sendRejectionEmail)
- **Status**: ⚠️ **Hanya jika booking ditolak oleh LTB**

---

### **4. ❌ Email Penolakan oleh BANK**
- **Fungsi**: `sendPenelitiNotificationEmail()` (type: 'rejection')
- **Trigger**: Ketika BANK menolak booking
- **Subject**: `[PPAT] Status Berkas {nobooking}`
- **Isi**:
  - Status: "Ditolak"
  - Track Status: "BANK"
  - Alasan penolakan dari BANK
  - Instruksi untuk perbaikan
- **Lokasi**: `index.js:686` (BANK reject endpoint)
- **Status**: ⚠️ **Hanya jika booking ditolak oleh BANK**

---

### **5. 🎉 Email Penyelesaian Dokumen** (dengan 2 PDF attachment)
- **Fungsi**: `sendDocumentCompletionEmail()`
- **Trigger**: Ketika Paraf Validasi menyetujui dokumen (Diolah → Diserahkan)
- **Subject**: `Dokumen Permohonan Telah Selesai - {nobooking}`
- **Isi**:
  - Nomor Booking
  - Nomor Registrasi
  - **Nomor Validasi** (penting!)
  - Status: "Diserahkan"
  - **📎 2 PDF terlampir**:
    1. PDF Validasi (Bukti Validasi SSPD-BPHTB)
    2. PDF Verif Paraf (SSPD-BPHTB Terstempel)
  - Public download URL (jika PDF terlalu besar untuk attachment)
- **Lokasi**: `index.js:4271` (PV decision approve endpoint)
- **Status**: ✅ **SELALU TERKIRIM** saat dokumen disetujui oleh PV

---

## 🔐 EMAIL DI LUAR WORKFLOW BOOKING (2 email)

### **6. 📧 Email Notifikasi Akun Aktif**
- **Fungsi**: `sendEmailNotification()`
- **Trigger**: Ketika admin membuatkan akun PPAT baru
- **Subject**: `UserID Anda Telah Aktif - Sistem BAPPENDA`
- **Isi**:
  - User ID
  - Nomor PPAT
  - Divisi
  - Informasi login
- **Lokasi**: `backend/routesxcontroller/userController.js:125`
- **Status**: ✅ **SELALU TERKIRIM** saat akun dibuat oleh admin

---

### **7. 🔑 Email Reset Password**
- **Fungsi**: `sendResetEmail()`
- **Trigger**: Ketika PPAT meminta reset password
- **Subject**: `Reset Password - E-BPHTB`
- **Isi**:
  - Link reset password
  - Expiry: 1 jam
- **Lokasi**: `backend/endpoint_session/password_service.js:53`
- **Status**: ✅ **SELALU TERKIRIM** saat reset password diminta

---

## 📈 SKENARIO WORKFLOW & JUMLAH EMAIL

### ✅ **SKENARIO SUKSES (Normal Flow)**
1. PPAT kirim booking → **Email #1** (Pengiriman)
2. LTB & BANK approve → **Email #2** (Persetujuan ke Peneliti)
3. PV approve → **Email #5** (Penyelesaian dengan 2 PDF)

**Total: 3 Email**

---

### ❌ **SKENARIO DITOLAK OLEH LTB**
1. PPAT kirim booking → **Email #1** (Pengiriman)
2. LTB tolak → **Email #3** (Penolakan LTB)

**Total: 2 Email**

---

### ❌ **SKENARIO DITOLAK OLEH BANK**
1. PPAT kirim booking → **Email #1** (Pengiriman)
2. BANK tolak → **Email #4** (Penolakan BANK)

**Total: 2 Email**

---

### ❌ **SKENARIO DITOLAK AUTO-DELETE**
1. PPAT kirim booking → **Email #1** (Pengiriman)
2. Auto-delete setelah 10 hari → **Email #3** (Penolakan via sendRejectionEmail)

**Total: 2 Email**

---

## 🎯 KESIMPULAN

### **Dalam 1 Siklus Booking yang SUKSES:**
**PPAT menerima MINIMAL 3 EMAIL**:
1. ✅ Email pengiriman (selalu)
2. ✅ Email persetujuan ke peneliti (jika LTB & BANK approve)
3. ✅ Email penyelesaian dengan 2 PDF (jika PV approve)

### **Jika Booking DITOLAK:**
**PPAT menerima MINIMAL 2 EMAIL**:
1. ✅ Email pengiriman (selalu)
2. ❌ Email penolakan (dari LTB atau BANK)

### **Catatan Penting:**
- Email #1 **SELALU** dikirim saat booking dikirim ke LTB
- Email #2 **HANYA** jika KEDUA LTB & BANK approve
- Email #5 **SELALU** dikirim saat PV approve (dengan 2 PDF attachment)
- Email penolakan **HANYA** jika booking ditolak

---

**Dibuat oleh:** AI Assistant  
**Berdasarkan analisis codebase**  
**Update:** $(date)

