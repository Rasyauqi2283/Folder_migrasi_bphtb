# Email Service Troubleshooting Guide

## 🔧 Masalah "Connection timeout" pada Email Notifikasi

### **Masalah yang Diperbaiki:**

#### **1. Fungsi `sendEmailNotification` yang Bermasalah:**
- ❌ **Sebelum:** Menggunakan `transporter.sendMail()` yang lama
- ✅ **Sesudah:** Menggunakan `sendEmailSafe()` dengan error handling robust

#### **2. Error Handling yang Tidak Konsisten:**
- ❌ **Sebelum:** Error tidak ditangani dengan baik
- ✅ **Sesudah:** Response yang konsisten dengan `{ success: boolean, error?: string }`

#### **3. Timeout Configuration:**
- ✅ **SendGrid:** 15 detik timeout
- ✅ **SMTP:** 20 detik timeout
- ✅ **Connection:** 5 detik timeout
- ✅ **Greeting:** 3 detik timeout
- ✅ **Socket:** 10 detik timeout

### **🔍 Cara Testing Email Service:**

#### **1. Test via Endpoint:**
```bash
GET /test-email
```

#### **2. Response yang Diharapkan:**
```json
{
  "success": true,
  "message": "Email service is working",
  "service": "sendgrid" // atau "smtp"
}
```

#### **3. Test Manual di Code:**
```javascript
import { testEmailService } from './backend/services/emailservice.js';

const result = await testEmailService();
console.log(result);
```

### **📧 Fungsi Email yang Diperbaiki:**

#### **1. `sendEmailNotification`:**
- ✅ Menggunakan `sendEmailSafe()` untuk error handling
- ✅ HTML template yang lebih menarik
- ✅ Response yang konsisten
- ✅ Logging yang detail

#### **2. `sendOTPAsync`:**
- ✅ Menggunakan `sendEmailSafe()` untuk retry mechanism
- ✅ Timeout handling yang proper

#### **3. `sendResetEmail`:**
- ✅ Menggunakan `sendEmailSafe()` untuk error handling
- ✅ Logging yang informatif

### **🚨 Troubleshooting Steps:**

#### **1. Cek Environment Variables:**
```bash
# SendGrid (Primary)
SENDGRID_API_KEY=your_sendgrid_key

# SMTP (Fallback)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### **2. Cek Logs:**
```bash
# Cari log email service
grep "Email service" logs/combined.log
grep "sendEmailSafe" logs/combined.log
grep "Connection timeout" logs/error.log
```

#### **3. Test Koneksi:**
```bash
# Test endpoint
curl https://your-domain.com/test-email

# Test di browser
https://your-domain.com/test-email
```

### **🔧 Konfigurasi Email Service:**

#### **SendGrid (Primary):**
```javascript
// Otomatis menggunakan SendGrid jika SENDGRID_API_KEY tersedia
if (process.env.SENDGRID_API_KEY) {
    emailService = 'sendgrid';
}
```

#### **SMTP Fallback:**
```javascript
// Fallback ke SMTP jika SendGrid tidak tersedia
else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailService = 'smtp';
}
```

### **📊 Monitoring Email Service:**

#### **1. Logs yang Perlu Dimonitor:**
- `✅ Email service initialized`
- `📧 Email attempt X/Y to email@example.com`
- `✅ Email sent successfully`
- `❌ Email attempt X failed`
- `🔄 Trying SMTP fallback...`

#### **2. Error Patterns:**
- `Connection timeout` → Cek koneksi internet/server
- `Authentication failed` → Cek credentials
- `Rate limit exceeded` → Tunggu atau upgrade plan
- `Invalid email` → Cek format email

### **🎯 Best Practices:**

#### **1. Error Handling:**
```javascript
const result = await sendEmailSafe(mailOptions);
if (result.success) {
    console.log('✅ Email sent successfully');
} else {
    console.error('❌ Email failed:', result.error);
}
```

#### **2. Retry Mechanism:**
- ✅ Otomatis retry 2x dengan delay
- ✅ Fallback dari SendGrid ke SMTP
- ✅ Timeout handling yang proper

#### **3. Logging:**
- ✅ Detail logging untuk debugging
- ✅ Error tracking yang konsisten
- ✅ Performance monitoring

### **🚀 Deployment Checklist:**

#### **Environment Variables:**
- [ ] `SENDGRID_API_KEY` (jika menggunakan SendGrid)
- [ ] `EMAIL_USER` (untuk SMTP)
- [ ] `EMAIL_PASS` (untuk SMTP)
- [ ] `SMTP_HOST` (default: smtp.gmail.com)
- [ ] `SMTP_PORT` (default: 587)
- [ ] `SMTP_SECURE` (default: false)

#### **Testing:**
- [ ] Test endpoint `/test-email` berhasil
- [ ] Test registrasi dengan email notifikasi
- [ ] Test OTP email
- [ ] Test reset password email

### **📞 Support:**

Jika masih mengalami masalah:
1. Cek logs di `logs/error.log`
2. Test endpoint `/test-email`
3. Verifikasi environment variables
4. Cek koneksi internet server
5. Kontak support email service provider
