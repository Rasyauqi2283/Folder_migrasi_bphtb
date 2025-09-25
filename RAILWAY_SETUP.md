# 🚀 Setup Enkripsi KTP di Railway Production

## 🌐 **Untuk Aplikasi yang Sudah Push ke up.railway.app**

Karena aplikasi Anda sudah di Railway, berikut cara setup enkripsi KTP di production:

## ⚙️ **1. Setup Environment Variables di Railway**

### **Login ke Railway Dashboard:**
1. Buka [railway.app](https://railway.app)
2. Login dengan akun GitHub Anda
3. Pilih project aplikasi Anda

### **Tambahkan Environment Variable:**
1. Klik pada project Anda
2. Klik tab **"Variables"**
3. Klik **"New Variable"**
4. Tambahkan:

```
Name: FILE_ENCRYPTION_KEY
Value: [KEY_YANG_DIGENERATE]
```

### **Generate Key untuk Production:**
```bash
# Jalankan di local
node generate_encryption_key.js
```

**Contoh key yang di-generate:**
```
FILE_ENCRYPTION_KEY=921ee962cd31cb826fdd73cf186c9237df2231318c80d488119d43e398f089eb
```

## 🔄 **2. Deploy Ulang Aplikasi**

Setelah menambahkan environment variable:

1. **Push perubahan ke GitHub** (jika ada)
2. **Railway otomatis redeploy** dengan environment variable baru
3. **Atau trigger manual deploy** di Railway dashboard

## 🔒 **3. Testing Enkripsi di Production**

### **Test Upload KTP:**
1. Buka aplikasi di `https://your-app.up.railway.app`
2. Lakukan registrasi dengan upload KTP
3. Cek apakah registrasi berhasil

### **Cek Logs Railway:**
1. Di Railway dashboard, klik tab **"Deployments"**
2. Klik pada deployment terbaru
3. Lihat logs untuk memastikan tidak ada error enkripsi

**Log yang harus muncul:**
```
🔒 [SECURE] Secure storage directory created: /app/secure_storage
🔒 [SECURE] File saved securely: [fileId]
```

## 📁 **4. Struktur File di Railway**

Di Railway production, file KTP akan tersimpan di:

```
/app/secure_storage/
├── ktp/
│   └── {userId}/
│       ├── {fileId}_encrypted.bin    # File terenkripsi
│       └── {fileId}_metadata.json    # Metadata
└── logs/
    └── file_access_YYYY-MM-DD.log    # Audit logs
```

## 🔐 **5. Keamanan di Production**

### ✅ **Yang Sudah Terlindungi:**
- **File KTP terenkripsi** dengan AES-256-GCM
- **Tidak bisa diakses via URL** langsung
- **Hanya admin yang bisa akses** dengan session valid
- **Audit trail lengkap** semua akses
- **Environment variable** aman di Railway

### ✅ **URL yang Aman:**
```
❌ https://your-app.up.railway.app/penting_F_simpan/uploads_ktp/ktp-123.jpg (TIDAK ADA)
✅ https://your-app.up.railway.app/api/secure-files/ktp/{fileId}?userId={userId} (ADMIN ONLY)
```

## 🧪 **6. Testing Lengkap di Production**

### **Test 1: Upload KTP**
```bash
# Via browser
1. Buka https://your-app.up.railway.app/registrasi.html
2. Isi form registrasi dengan upload KTP
3. Submit form
4. Cek apakah berhasil
```

### **Test 2: Cek File Tidak Bisa Diakses Langsung**
```bash
# Coba akses URL langsung (harus error)
https://your-app.up.railway.app/penting_F_simpan/uploads_ktp/ktp-123.jpg
# Expected: 404 Not Found atau error
```

### **Test 3: Login Admin dan Akses File**
```bash
# Login sebagai admin
1. Login ke aplikasi sebagai admin
2. Akses endpoint secure files
3. Cek apakah bisa download KTP
```

## 🚨 **7. Troubleshooting di Production**

### **Error: "Gagal mengenkripsi file"**
```bash
# Cek environment variable di Railway
1. Buka Railway dashboard
2. Klik tab "Variables"
3. Pastikan FILE_ENCRYPTION_KEY ada dan benar
```

### **Error: "File tidak ditemukan"**
```bash
# Cek logs Railway
1. Klik tab "Deployments"
2. Lihat logs deployment terbaru
3. Cari error terkait file storage
```

### **Error: "Akses ditolak"**
```bash
# Pastikan user login sebagai admin
1. Cek session user
2. Cek role user di database
3. Pastikan endpoint secure files sudah terdaftar
```

## 📊 **8. Monitoring di Production**

### **Cek Audit Logs:**
```bash
# Via Railway logs
1. Buka Railway dashboard
2. Klik tab "Deployments"
3. Lihat logs untuk melihat akses file
```

### **Cek File Storage:**
```bash
# Via Railway console (jika ada)
1. Buka Railway dashboard
2. Klik tab "Settings"
3. Akses console untuk cek file system
```

## 🔄 **9. Update Aplikasi untuk Railway**

Pastikan aplikasi sudah menggunakan sistem secure storage:

### **File yang Perlu Diupdate:**
1. **`index.js`** - Tambahkan route secure files
2. **`registrasi_endpoint.js`** - Sudah diupdate untuk secure storage
3. **Environment variables** - Sudah ditambahkan FILE_ENCRYPTION_KEY

### **Tambahkan Route di index.js:**
```javascript
import secureFileRoutes from './backend/endpoint_session/registrasi/secure_file_routes.js';
app.use('/api/secure-files', secureFileRoutes);
```

## ✅ **10. Checklist Production**

- [ ] Environment variable FILE_ENCRYPTION_KEY sudah ditambahkan di Railway
- [ ] Aplikasi sudah di-deploy ulang
- [ ] Test upload KTP berhasil
- [ ] File tidak bisa diakses via URL langsung
- [ ] Admin bisa akses file KTP
- [ ] Logs tidak ada error enkripsi
- [ ] Audit trail berjalan

## 🎉 **Hasil Akhir**

Setelah setup lengkap:

1. **File KTP terenkripsi** di Railway production
2. **Tidak bisa diakses** via URL langsung
3. **Hanya admin** yang bisa akses
4. **Audit trail** lengkap
5. **Keamanan maksimal** untuk data pribadi

**🔒 KTP Anda sekarang AMAN di Railway Production!**
