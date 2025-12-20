# 📧 ANALISIS FUNGSI EMAIL - BAPPENDA TA

## 📊 RINGKASAN EKSEKUTIF

**Total Fungsi Email yang Ditemukan: 20 Fungsi**

- **Di `emailservice.js`**: 18 fungsi (semua exported)
- **Di `index.js`**: 2 fungsi (internal helper)

---

## 📁 KATEGORISASI FUNGSI EMAIL

### 🔧 **A. Core Email Service Functions** (7 fungsi)

1. **`getEmailService()`** 
   - Mengembalikan status email service yang aktif (sendgrid/smtp/null)

2. **`sendEmailViaSendGrid(to, subject, text, html)`**
   - Mengirim email langsung via SendGrid API
   - Timeout: 15 detik
   - Return: response dari SendGrid

3. **`sendEmailViaSMTP(to, subject, text, html)`**
   - Mengirim email via SMTP (fallback)
   - Timeout: 20 detik
   - Menggunakan smtpTransporter

4. **`sendEmail(to, subject, text, html, maxRetries)`**
   - Universal email function dengan retry mechanism
   - Auto fallback: SendGrid → SMTP
   - Max retries: 2 (default)
   - Timeout: 30 detik per attempt

5. **`sendEmailSafe(mailOptions)`**
   - Wrapper aman untuk semua email
   - Support attachments (memanggil sendEmailWithFallback)
   - Error handling yang robust
   - Return: `{ success: boolean, info/error }`

6. **`sendEmailWithFallback(mailOptions, maxRetries)`**
   - Email dengan attachment support
   - SendGrid primary, SMTP fallback
   - Max retries: 2 (default)
   - Support base64 attachments

7. **`testEmailConnection()`**
   - Test koneksi email service
   - Verify SendGrid atau SMTP

8. **`testEmailService()`**
   - Test lengkap email service dengan kirim email test

---

### 🔐 **B. OTP Functions** (5 fungsi)

9. **`generateOTP()`**
   - Generate 6-digit OTP
   - Return: string (100000-999999)

10. **`validateOTPFormat(otp)`**
    - Validasi format OTP (6 digit angka)
    - Return: boolean

11. **`sendOTP(email, otp)`**
    - Kirim OTP via email (sync)
    - Menggunakan sendEmailSafe

12. **`sendOTPAsync(email, otp)`**
    - Kirim OTP secara async (non-blocking)
    - Menggunakan setImmediate
    - Fallback: log ke database jika gagal

13. **`sendOTPWithRetry(email, otp, retries)`**
    - Kirim OTP dengan retry mechanism
    - Exponential backoff (2s, 4s, 8s)
    - Default retries: 3
    - HTML template included

---

### 👤 **C. User Account Functions** (2 fungsi)

14. **`sendEmailNotification(email, userID, ppatNumber)`**
    - Notifikasi akun aktif setelah registrasi
    - HTML template dengan gradient header
    - Include: UserID, PPAT Number, Divisi

15. **`sendResetEmail(to, link)`**
    - Email reset password
    - Include reset link dengan expiry 1 jam
    - HTML template dengan button

---

### 📄 **D. Document Workflow Functions** (4 fungsi)

16. **`sendDocumentSubmissionEmail(email, nobooking, noRegistrasi, userType)`**
    - Notifikasi dokumen dikirim (Draft → Diolah)
    - Include: nomor booking, registrasi, user type
    - HTML template dengan status badge

17. **`sendDocumentCompletionEmail(email, nobooking, noRegistrasi, noValidasi, userType, options)`**
    - Notifikasi dokumen selesai (Diolah → Diserahkan)
    - Support attachments & public download URL
    - Include: nomor validasi, status "Lulus"

18. **`sendRejectionEmail(email, nobooking, rejectionReason, rejectedBy, documentType)`**
    - Notifikasi penolakan dokumen
    - Include: alasan penolakan, rejected by
    - HTML template dengan warning style

---

### 🔔 **E. Internal Helper Functions** (di index.js - 2 fungsi)

19. **`sendPenelitiNotificationEmail(creatorEmail, creatorName, nobooking, status, trackstatus, keterangan, emailType)`**
    - Notifikasi khusus untuk peneliti workflow
    - Validasi: hanya kirim jika LTB & BANK approve
    - Email type: 'approval' atau lainnya

20. **`sendParafVEmail(creatorEmail, creatorName, nobooking, status, trackstatus)`**
    - Notifikasi paraf validasi
    - Pemberitahuan pengiriman data ke paraf validasi

---

## 🏗️ ARSITEKTUR EMAIL SERVICE

### **Configuration Layer**
```
┌─────────────────────────────────┐
│  Email Service Initialization   │
│  - SendGrid (Primary)           │
│  - SMTP/Gmail (Fallback)        │
└─────────────────────────────────┘
```

### **Core Functions Layer**
```
┌─────────────────┐    ┌──────────────────┐
│ sendEmail       │───→│ sendEmailSafe    │
│ (Universal)     │    │ (Wrapper)        │
└─────────────────┘    └──────────────────┘
         │                      │
         ├─→ SendGrid           ├─→ With Attachments
         └─→ SMTP               └─→ Error Handling
```

### **Business Logic Layer**
```
┌─────────────────────────────────────────┐
│  Application-Specific Email Functions   │
│  - OTP Functions                        │
│  - User Account Functions               │
│  - Document Workflow Functions          │
│  - Notification Functions               │
└─────────────────────────────────────────┘
```

---

## 📍 LOKASI PENGGUNAAN FUNGSI EMAIL

### **Backend Routes yang Menggunakan Email:**

1. **`backend/routesxcontroller/1_auth/authRoutes.js`**
   - `sendOTPAsync()` - Registrasi & login
   - `sendOTPWithRetry()` - Resend OTP

2. **`backend/routesxcontroller/userController.js`**
   - `sendEmailNotification()` - Notifikasi akun aktif

3. **`backend/routesxcontroller/4_admin/adminRoutes.js`**
   - `sendEmailSafe()` - Admin notifications

4. **`backend/routesxcontroller/5_PPAT_endpoint/endpoint_ppat.js`**
   - `sendDocumentSubmissionEmail()` - Submit dokumen
   - `sendDocumentCompletionEmail()` - Complete dokumen

5. **`backend/routesxcontroller/5_PPAT_endpoint/auto_delete_endpoints.js`**
   - `sendRejectionEmail()` - Auto delete rejected

6. **`backend/endpoint_session/password_service.js`**
   - `sendResetEmail()` - Reset password

7. **`index.js`**
   - `sendEmail()` - Peneliti & Paraf notifications
   - `sendPenelitiNotificationEmail()` - Internal helper
   - `sendParafVEmail()` - Internal helper

---

## ⚠️ TEMUAN & REKOMENDASI

### **1. Duplikasi Fungsi**
- ❌ Ada 2 fungsi `sendRejectionEmail`: 
  - Satu di `emailservice.js` (exported, proper)
  - Satu di `index.js` (internal, legacy)
- ✅ **Rekomendasi**: Gunakan hanya yang di `emailservice.js`, hapus yang di `index.js`

### **2. Inconsistent Error Handling**
- ⚠️ Beberapa fungsi menggunakan `sendEmail()` langsung
- ✅ Beberapa sudah menggunakan `sendEmailSafe()` (lebih robust)
- ✅ **Rekomendasi**: Standardisasi semua ke `sendEmailSafe()`

### **3. Timeout Configuration**
- ⚠️ SendGrid: 15 detik
- ⚠️ SMTP: 20 detik  
- ⚠️ Universal: 30 detik
- ✅ **Rekomendasi**: Standardisasi timeout menjadi configurable via ENV

### **4. Missing Features**
- ⚠️ No email queue system (semua langsung send)
- ⚠️ No email delivery tracking/logging
- ⚠️ No rate limiting untuk email sending
- ✅ **Rekomendasi**: Pertimbangkan email queue untuk production

### **5. Attachment Handling**
- ✅ Support base64 attachments
- ✅ Support buffer attachments
- ⚠️ Tidak ada validasi ukuran file
- ✅ **Rekomendasi**: Tambahkan validasi max size untuk attachments

---

## 🧪 TESTING CHECKLIST

Untuk memverifikasi semua fungsi email berfungsi:

- [ ] ✅ SendGrid API key configured
- [ ] ✅ SMTP credentials configured (fallback)
- [ ] ✅ Test `testEmailConnection()`
- [ ] ✅ Test `testEmailService()`
- [ ] ✅ Test OTP sending (sync & async)
- [ ] ✅ Test user notification email
- [ ] ✅ Test reset password email
- [ ] ✅ Test document submission email
- [ ] ✅ Test document completion email (with attachments)
- [ ] ✅ Test rejection email
- [ ] ✅ Test peneliti notification email
- [ ] ✅ Test paraf validation email
- [ ] ✅ Test fallback mechanism (SendGrid → SMTP)
- [ ] ✅ Test retry mechanism
- [ ] ✅ Test timeout handling

---

## 📊 STATISTIK FUNGSI EMAIL

| Kategori | Jumlah Fungsi | Status |
|----------|--------------|--------|
| Core Service | 8 | ✅ Active |
| OTP | 5 | ✅ Active |
| User Account | 2 | ✅ Active |
| Document Workflow | 3 | ✅ Active |
| Internal Helper | 2 | ⚠️ Review |
| **TOTAL** | **20** | |

---

**Dibuat oleh:** AI Assistant (UI/UX, Backend, Database Analyst)  
**Tanggal:** $(date)  
**File Analisis:** `EMAIL_FUNCTIONS_ANALYSIS.md`

