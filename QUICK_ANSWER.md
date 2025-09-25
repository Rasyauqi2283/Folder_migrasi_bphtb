# 🔐 Jawaban Cepat: Enkripsi KTP

## ❓ **Apakah KTP akan di-enkripsi?**

**✅ YA, KTP akan di-enkripsi otomatis!**

Setelah Anda push ke git dan coba registrasi:

1. **File KTP di-upload** → Otomatis ter-enkripsi dengan AES-256-GCM
2. **File asli dihapus** → Hanya tersimpan file ter-enkripsi
3. **Tidak bisa diakses via URL** → File tidak ada di folder `public/`
4. **Hanya admin yang bisa akses** → Dengan role dan session yang valid
5. **Audit log tercatat** → Semua akses file dicatat

## ⚙️ **Setup FILE_ENCRYPTION_KEY**

### **1. Generate Key:**
```bash
node generate_encryption_key.js
```

### **2. Tambahkan ke .env:**
```bash
FILE_ENCRYPTION_KEY=921ee962cd31cb826fdd73cf186c9237df2231318c80d488119d43e398f089eb
```

### **3. Untuk Railway:**
Di Railway dashboard, tambahkan environment variable:
```
FILE_ENCRYPTION_KEY = 921ee962cd31cb826fdd73cf186c9237df2231318c80d488119d43e398f089eb
```

## 🚨 **PENTING:**
- **Backup key ini!** Jika hilang, semua file KTP tidak bisa dibuka
- **Jangan commit key ke git!** 
- **Simpan di password manager**

## 🔍 **Test Enkripsi:**
1. Upload KTP via registrasi
2. Cek file di `secure_storage/ktp/` (akan ter-enkripsi)
3. Coba akses via URL → Error (tidak bisa diakses)
4. Login admin → Bisa akses file

**KTP Anda sekarang AMAN! 🔒**
