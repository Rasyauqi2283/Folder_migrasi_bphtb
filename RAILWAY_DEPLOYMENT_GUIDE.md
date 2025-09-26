# 🚀 Railway Deployment Guide

## 🔧 **Environment Variables Setup**

### **Required Environment Variables di Railway:**

```bash
# Database Configuration
PG_USER=your_db_user
PG_HOST=your_db_host
PG_DATABASE=your_db_name
PG_PASSWORD=your_db_password
PG_PORT=5432

# Session Configuration
SESSION_SECRET=your_very_secure_session_secret_key_here

# Email Configuration (SendGrid - Recommended)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Email Configuration (Gmail SMTP - Fallback)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# File Encryption
FILE_ENCRYPTION_KEY=your_32_character_encryption_key_here

# CORS Configuration
CORS_ORIGIN=https://your-app-name.up.railway.app

# Security Settings
NODE_ENV=production
```

## 📋 **Step-by-Step Deployment:**

### **1. Setup Environment Variables di Railway:**
1. Buka Railway dashboard
2. Pilih project Anda
3. Klik "Variables" tab
4. Add semua environment variables di atas

### **2. Generate Encryption Key:**
```bash
node generate_encryption_key.js
```

### **3. Deploy Application:**
```bash
git add .
git commit -m "Implement SendGrid email service"
git push origin main
```

### **4. Test Deployment:**
1. Buka `https://your-app-name.up.railway.app/registrasi.html`
2. Test registrasi dengan email yang valid
3. Cek logs untuk memastikan SendGrid bekerja

## 🔒 **Security Best Practices:**

### **✅ DO:**
- Gunakan environment variables untuk semua secrets
- Generate encryption key yang unik
- Test email service sebelum production
- Monitor logs untuk error

### **❌ DON'T:**
- Jangan commit API keys ke repository
- Jangan hardcode secrets di source code
- Jangan share API keys di chat/email
- Jangan gunakan default passwords

## 🧪 **Testing Checklist:**

- [ ] Environment variables sudah di-set di Railway
- [ ] SendGrid API key valid dan terkonfigurasi
- [ ] Database connection berhasil
- [ ] File encryption key sudah di-generate
- [ ] Registrasi berhasil tanpa timeout
- [ ] OTP terkirim dalam 15 detik
- [ ] File KTP terenkripsi dengan aman

## 🆘 **Troubleshooting:**

### **Jika Push Diblokir GitHub:**
- GitHub mendeteksi API key di commit
- Hapus API key dari dokumentasi
- Gunakan template placeholder saja
- API key hanya di environment variables

### **Jika Email Gagal:**
```bash
# Test SendGrid connection
node test_sendgrid.js your-email@example.com

# Cek failed OTP logs
node check_failed_otp.js your-email@example.com
```

## 🎉 **Expected Results:**

```
✅ SendGrid API key configured
🚀 Using SendGrid API...
✅ Email sent via SendGrid to user@example.com
✅ Async OTP sent successfully to user@example.com
```

**🎯 Deployment siap untuk production!**
