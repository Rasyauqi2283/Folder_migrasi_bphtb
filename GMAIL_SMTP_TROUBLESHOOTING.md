# 🔧 Gmail SMTP Troubleshooting Guide

## 🚨 **Masalah yang Ditemukan:**

```
❌ Attempt 1/2 failed: Connection timeout
❌ Attempt 2/2 failed: Connection timeout
❌ Semua percobaan gagal untuk mengirim OTP ke: rainkuliah@gmail.com
```

## 🔍 **Kemungkinan Penyebab:**

### **1. Gmail App Password Issues:**
- **2FA belum diaktifkan** di akun Gmail
- **App Password tidak dikonfigurasi** dengan benar
- **EMAIL_PASS bukan App Password** tapi password biasa

### **2. Railway Environment Issues:**
- **Environment variables** tidak terset dengan benar
- **Firewall/Railway** memblokir koneksi SMTP Gmail
- **Network restrictions** di Railway

### **3. Gmail Security Settings:**
- **"Less secure app access"** tidak diaktifkan (deprecated)
- **Google security** memblokir koneksi dari Railway

## ✅ **Solusi yang Diimplementasikan:**

### **1. Enhanced Email Service dengan Fallback:**

```javascript
// Test koneksi sebelum kirim email
export const testEmailConnection = async () => {
    try {
        await gmailTransporter.verify();
        return true;
    } catch (error) {
        console.error('❌ Gmail SMTP connection failed:', error.message);
        return false;
    }
};

// Fallback mechanism dengan logging
export const sendEmailWithFallback = async (mailOptions, maxRetries = 2) => {
    // Test koneksi dulu
    const isConnected = await testEmailConnection();
    if (!isConnected) {
        throw new Error('SMTP connection failed');
    }
    // ... retry logic
};
```

### **2. OTP Logging untuk Manual Verification:**

```javascript
// Jika email gagal, log OTP ke database
await pool.query(
    'INSERT INTO otp_logs (email, otp, created_at, status) VALUES ($1, $2, NOW(), $3)',
    [email, otp, 'failed_to_send']
);
```

### **3. Script untuk Cek Failed OTP:**

```bash
# Cek OTP yang gagal dikirim
node check_failed_otp.js rainkuliah@gmail.com
```

## 🔧 **Setup Gmail App Password:**

### **Step 1: Aktifkan 2FA**
1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Klik **"2-Step Verification"**
3. Ikuti langkah untuk mengaktifkan 2FA

### **Step 2: Generate App Password**
1. Di halaman Security, klik **"App passwords"**
2. Pilih **"Mail"** dan **"Other (custom name)"**
3. Masukkan nama: **"BAPPENDA Email Service"**
4. Copy **16-character password** yang dihasilkan

### **Step 3: Update Railway Environment**
```
EMAIL_USER = companyarras@gmail.com
EMAIL_PASS = your_16_character_app_password_here
```

## 🧪 **Testing Email Connection:**

### **Test Koneksi SMTP:**
```bash
# Test koneksi email (akan ditambahkan ke endpoint)
curl https://bphtb-bappenda.up.railway.app/api/test-email
```

### **Cek Failed OTP Logs:**
```bash
# Cek OTP yang gagal dikirim
node check_failed_otp.js

# Cek OTP untuk email tertentu
node check_failed_otp.js rainkuliah@gmail.com
```

## 📋 **Checklist untuk Fix Gmail SMTP:**

### **✅ Gmail Configuration:**
- [ ] 2FA sudah diaktifkan di akun Gmail
- [ ] App Password sudah dibuat untuk "BAPPENDA Email Service"
- [ ] EMAIL_USER = companyarras@gmail.com
- [ ] EMAIL_PASS = 16-character app password (bukan password biasa)

### **✅ Railway Configuration:**
- [ ] Environment variables sudah di-update di Railway
- [ ] Aplikasi sudah di-deploy ulang setelah update env vars
- [ ] Network tidak memblokir port 587/465

### **✅ Database Setup:**
- [ ] Tabel otp_logs sudah dibuat
- [ ] Script check_failed_otp.js bisa dijalankan

## 🚀 **Testing Setelah Fix:**

### **Test 1: Registrasi**
1. Buka `https://bphtb-bappenda.up.railway.app/registrasi.html`
2. Upload KTP dan isi form dengan email yang valid
3. Submit form

### **Expected Results:**
```
📧 Testing email connection...
✅ Gmail SMTP connection successful
📧 Email attempt 1/2 to [email]
✅ Email sent successfully to [email]
```

### **Test 2: Cek Email**
1. Buka Gmail (inbox dan spam)
2. Cari email dari companyarras@gmail.com
3. Subject: "OTP untuk Registrasi"

### **Test 3: Fallback Mechanism**
Jika email masih gagal:
```bash
node check_failed_otp.js [email]
```

**Expected Output:**
```
📋 Found 1 OTP log(s):
1. Email: rainkuliah@gmail.com
   OTP: 123456
   Time: 2024-01-15 10:30:00
   Status: failed_to_send
```

## 🆘 **Troubleshooting Steps:**

### **Jika Masih Timeout:**
1. **Cek App Password** - pastikan 16 karakter, bukan password biasa
2. **Cek 2FA** - pastikan sudah aktif
3. **Test di Local** - coba kirim email dari local machine
4. **Cek Railway Logs** - lihat error message yang lebih detail

### **Jika Email Masih Tidak Masuk:**
1. **Cek Spam Folder** di Gmail
2. **Cek Failed OTP Logs** untuk manual verification
3. **Coba Email Lain** untuk test

## 🎉 **Expected Final Result:**

**✅ Gmail SMTP connection successful**
**✅ OTP terkirim ke email dalam 5-10 detik**
**✅ User bisa verifikasi dengan OTP yang diterima**

**📧 Email service robust dengan fallback mechanism!**
