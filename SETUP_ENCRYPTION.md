# 🔐 Setup Enkripsi KTP - Panduan Lengkap

## ❓ **Apakah KTP Akan Di-enkripsi?**

**YA, KTP akan di-enkripsi secara otomatis!** Berikut penjelasannya:

### ✅ **Yang Terjadi Setelah Push ke Git:**

1. **File KTP di-upload** → Sistem otomatis mengenkripsi dengan AES-256-GCM
2. **File asli dihapus** → Hanya tersimpan file terenkripsi
3. **Tidak bisa diakses via URL** → File tidak ada di folder `public/`
4. **Hanya admin yang bisa akses** → Dengan role dan session yang valid
5. **Audit log tercatat** → Semua akses file dicatat

### 🔒 **Contoh Proses Enkripsi:**

```
User upload KTP → File temporary → Enkripsi AES-256-GCM → Simpan di secure_storage/ → Hapus file temporary
```

## ⚙️ **Setup Environment Variables**

### **1. Generate Encryption Key**

Jalankan command ini untuk generate key yang aman:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Contoh output:**
```
a39a0ef62d8467cd7c74616a1fe48b2fd051a4fa2cbed04553abf5bc9ef223ee
```

### **2. Update File .env**

Tambahkan ke file `.env` Anda:

```bash
# File Encryption Key (32 karakter hex)
FILE_ENCRYPTION_KEY=a39a0ef62d8467cd7c74616a1fe48b2fd051a4fa2cbed04553abf5bc9ef223ee

# Environment lainnya...
PG_USER=your_db_user
PG_HOST=your_db_host
PG_DATABASE=your_db_name
PG_PASSWORD=your_db_password
PG_PORT=5432
SESSION_SECRET=your_very_secure_session_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CORS_ORIGIN=http://localhost:3000
API_URL=https://your-domain.com
VITE_API_URI=https://your-domain.com
NODE_ENV=production
```

### **3. Untuk Railway/Production**

Di Railway dashboard, tambahkan environment variable:

```
FILE_ENCRYPTION_KEY = a39a0ef62d8467cd7c74616a1fe48b2fd051a4fa2cbed04553abf5bc9ef223ee
```

## 🚨 **PENTING: Backup Encryption Key**

### ⚠️ **Jika kehilangan key:**
- **SEMUA file KTP tidak bisa dibuka lagi!**
- **Tidak ada cara recovery!**
- **Data akan hilang permanen!**

### 💾 **Cara Backup:**
1. **Simpan key di password manager** (1Password, Bitwarden, dll)
2. **Print dan simpan fisik** di tempat aman
3. **Backup di multiple location** (USB, cloud terpisah)
4. **Share dengan admin lain** secara aman

## 🔍 **Testing Enkripsi**

### **1. Test Upload KTP:**
```bash
# Upload file KTP via registrasi
curl -X POST http://localhost:3000/api/auth/register \
  -F "nama=Test User" \
  -F "nik=1234567890123456" \
  -F "telepon=08123456789" \
  -F "email=test@example.com" \
  -F "password=password123" \
  -F "fotoktp=@/path/to/ktp.jpg"
```

### **2. Cek File Terenkripsi:**
```bash
# File akan tersimpan di:
ls -la secure_storage/ktp/{userId}/
# Output: fileId_encrypted.bin (file terenkripsi)
# Output: fileId_metadata.json (metadata)
```

### **3. Test Akses Admin:**
```bash
# Login sebagai admin dulu, lalu:
curl -X GET "http://localhost:3000/api/secure-files/ktp/{fileId}?userId={userId}" \
  -H "Cookie: session_cookie_here"
```

## 📁 **Struktur File Setelah Enkripsi**

```
secure_storage/
├── ktp/
│   └── user123/
│       ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890_encrypted.bin
│       └── a1b2c3d4-e5f6-7890-abcd-ef1234567890_metadata.json
└── logs/
    └── file_access_2024-01-15.log
```

### **File Metadata (JSON):**
```json
{
  "fileId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "originalName": "ktp_user.jpg",
  "mimeType": "image/jpeg",
  "size": 245760,
  "iv": "a1b2c3d4e5f67890",
  "authTag": "f1e2d3c4b5a69780",
  "timestamp": 1705123456789,
  "userId": "user123"
}
```

## 🔐 **Keamanan yang Dicapai**

### ✅ **File KTP:**
- **Terenkripsi** dengan AES-256-GCM
- **Tidak bisa dibuka** tanpa key
- **Tidak bisa diakses** via URL langsung
- **Hanya admin** yang bisa akses
- **Audit trail** lengkap

### ✅ **Database:**
- **Menyimpan fileId** alih-alih path file
- **Tidak ada path** yang bisa diexploit
- **Metadata terpisah** dari file

### ✅ **Server:**
- **File tidak di public/** folder
- **Direktori terpisah** untuk file sensitif
- **Logging** semua akses file

## 🚀 **Deployment Checklist**

### **Sebelum Deploy:**
- [ ] Generate FILE_ENCRYPTION_KEY
- [ ] Set environment variable
- [ ] Backup encryption key
- [ ] Test upload di local
- [ ] Test akses admin

### **Setelah Deploy:**
- [ ] Cek environment variable di production
- [ ] Test upload KTP
- [ ] Cek file terenkripsi
- [ ] Test akses admin
- [ ] Monitor audit logs

## 🆘 **Troubleshooting**

### **Error: "Gagal mengenkripsi file"**
```bash
# Cek environment variable
echo $FILE_ENCRYPTION_KEY

# Pastikan key 32 karakter hex
node -e "console.log(process.env.FILE_ENCRYPTION_KEY?.length)"
```

### **Error: "Akses ditolak"**
```bash
# Pastikan user login sebagai admin
# Cek session di browser dev tools
```

### **Error: "File tidak ditemukan"**
```bash
# Cek fileId di database
# Pastikan file belum terhapus
```

## 📞 **Support**

Jika ada masalah:
1. **Cek logs** di `secure_storage/logs/`
2. **Cek environment** variables
3. **Test encryption** key
4. **Cek permissions** file
5. **Hubungi developer** dengan error log lengkap

---

**🔒 KTP Anda sekarang AMAN dan TERENKRIPSI!**
