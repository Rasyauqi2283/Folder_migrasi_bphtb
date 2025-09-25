# 🔒 Panduan Keamanan Penyimpanan KTP

## Overview
Sistem penyimpanan KTP telah ditingkatkan dengan multiple layer security untuk melindungi data pribadi dari penyalahgunaan.

## 🛡️ Lapisan Keamanan yang Diimplementasikan

### 1. **Enkripsi File**
- **Algoritma**: AES-256-GCM (Advanced Encryption Standard)
- **Key**: 32-byte encryption key yang disimpan di environment variable
- **Authentication**: Setiap file memiliki authentication tag untuk memastikan integritas
- **IV**: Random initialization vector untuk setiap file

### 2. **Penyimpanan Aman**
- **Lokasi**: File disimpan di `secure_storage/` (di luar folder `public/`)
- **Struktur**: `secure_storage/ktp/{userId}/{fileId}_encrypted.bin`
- **Metadata**: Informasi file disimpan terpisah dalam format JSON
- **Temp Cleanup**: File temporary otomatis dihapus setelah enkripsi

### 3. **Kontrol Akses**
- **Role-based**: Hanya admin dan super_admin yang dapat mengakses file
- **Session Validation**: Validasi session user sebelum memberikan akses
- **File Ownership**: User hanya dapat mengakses file mereka sendiri (untuk admin)

### 4. **Validasi File**
- **Magic Number**: Deteksi file header untuk memastikan file adalah gambar
- **MIME Type**: Validasi tipe MIME file
- **Extension Check**: Validasi ekstensi file
- **Size Limit**: Maksimal 5MB per file
- **File Type**: Hanya JPEG dan PNG yang diperbolehkan

### 5. **Audit Logging**
- **Access Log**: Setiap akses file dicatat dengan timestamp
- **User Tracking**: Mencatat user ID dan role yang mengakses
- **Action Logging**: Mencatat aksi (READ, LIST, dll)
- **Log Rotation**: Log harian untuk efisiensi penyimpanan

## 🔧 Konfigurasi yang Diperlukan

### Environment Variables
```bash
# File Encryption Key (32 karakter)
FILE_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Session Secret
SESSION_SECRET=your_very_secure_session_secret_key_here

# Database & Email config...
```

### Generate Encryption Key
```bash
# Generate random 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📁 Struktur File

```
secure_storage/
├── ktp/
│   └── {userId}/
│       ├── {fileId}_encrypted.bin    # File terenkripsi
│       └── {fileId}_metadata.json    # Metadata file
└── logs/
    └── file_access_YYYY-MM-DD.log    # Audit logs
```

## 🔐 API Endpoints

### 1. Upload KTP (Registrasi)
```http
POST /api/auth/register
Content-Type: multipart/form-data

Body:
- nama: string
- nik: string
- telepon: string
- email: string
- password: string
- fotoktp: file (JPEG/PNG, max 5MB)
```

### 2. Get KTP File (Admin Only)
```http
GET /api/secure-files/ktp/{fileId}?userId={userId}
Headers:
- Cookie: session cookie
```

### 3. List KTP Files (Admin Only)
```http
GET /api/secure-files/ktp-list/{userId}
Headers:
- Cookie: session cookie
```

### 4. Audit Logs (Super Admin Only)
```http
GET /api/secure-files/audit-logs
Headers:
- Cookie: session cookie
```

## ⚠️ Keamanan Tambahan

### 1. **Hapus Akses Langsung ke Public Folder**
- Folder `public/penting_F_simpan/uploads_ktp/` tidak lagi di-expose
- File KTP tidak dapat diakses via URL langsung

### 2. **Rate Limiting**
- Implementasi rate limiting untuk upload file
- Maksimal 10 upload per menit per user

### 3. **File Cleanup**
- File temporary otomatis dihapus setelah enkripsi
- Implementasi cleanup job untuk file yang tidak terpakai

### 4. **Monitoring**
- Log semua akses file untuk monitoring
- Alert untuk akses yang mencurigakan

## 🚨 Best Practices

### Untuk Developer:
1. **Jangan hardcode encryption key** di source code
2. **Gunakan environment variables** untuk semua secret
3. **Validasi input** di setiap endpoint
4. **Log semua akses** untuk audit trail
5. **Test security** secara berkala

### Untuk Admin:
1. **Monitor audit logs** secara berkala
2. **Rotate encryption keys** setiap 6 bulan
3. **Backup secure storage** dengan aman
4. **Update dependencies** untuk patch security
5. **Review access permissions** secara berkala

### Untuk User:
1. **Upload file yang valid** (JPEG/PNG)
2. **Jangan share session** dengan orang lain
3. **Logout setelah selesai** menggunakan aplikasi
4. **Gunakan password yang kuat**

## 🔍 Troubleshooting

### Error: "File tidak ditemukan"
- Pastikan fileId valid dan user memiliki akses
- Cek apakah file sudah terhapus atau corrupt

### Error: "Akses ditolak"
- Pastikan user memiliki role admin/super_admin
- Cek session user masih valid

### Error: "Gagal mengenkripsi file"
- Cek FILE_ENCRYPTION_KEY sudah di-set
- Pastikan file tidak corrupt

### Error: "File tidak valid"
- Pastikan file adalah JPEG/PNG
- Cek ukuran file tidak melebihi 5MB
- Validasi magic number file

## 📞 Support
Jika mengalami masalah dengan sistem keamanan, hubungi tim development dengan menyertakan:
- Error message lengkap
- Timestamp error
- User ID (jika relevan)
- Steps to reproduce
