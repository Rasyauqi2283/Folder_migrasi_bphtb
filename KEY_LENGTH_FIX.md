# 🔧 Perbaikan Error "Invalid key length"

## 🚨 **Error yang Diperbaiki:**

```
RangeError: Invalid key length
at Cipheriv.createCipherBase (node:internal/crypto/cipher:121:19)
```

## 🔍 **Penyebab Error:**

1. **AES-256-GCM memerlukan key 32 bytes** (256 bits)
2. **Environment variable** mungkin tidak dalam format yang benar
3. **Key validation** tidak ada saat startup
4. **Format key** tidak sesuai dengan yang diharapkan crypto

## ✅ **Solusi yang Diimplementasikan:**

### **1. Validasi Key saat Startup:**

```javascript
// Validasi dan generate key yang tepat untuk AES-256-GCM
let ENCRYPTION_KEY;

try {
    // Coba parse sebagai hex string
    if (ENCRYPTION_KEY_RAW.length === 64) {
        // 64 hex characters = 32 bytes
        ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_RAW, 'hex');
    } else {
        // Jika bukan hex atau panjang tidak tepat, gunakan PBKDF2
        console.log('🔒 [SECURE] Generating key from string using PBKDF2');
        const salt = crypto.createHash('sha256').update('KTP_ENCRYPTION_SALT').digest();
        ENCRYPTION_KEY = crypto.pbkdf2Sync(ENCRYPTION_KEY_RAW, salt, 10000, 32, 'sha256');
    }
    
    // Pastikan key panjangnya 32 bytes untuk AES-256
    if (ENCRYPTION_KEY.length !== 32) {
        throw new Error(`Invalid key length: ${ENCRYPTION_KEY.length} bytes. Expected 32 bytes for AES-256.`);
    }
    
    console.log('🔒 [SECURE] Encryption key initialized successfully');
} catch (error) {
    console.error('🔒 [SECURE] Error initializing encryption key:', error);
    throw new Error('Failed to initialize encryption key');
}
```

### **2. Script Generate Key yang Diperbaiki:**

```bash
# Generate key yang benar untuk AES-256-GCM
node generate_encryption_key.js
```

**Output:**
```
✅ Generated 32-byte encryption key (256 bits):
FILE_ENCRYPTION_KEY=36bf4700775365c877f2fccfcb15579b0afd2e5979d22395e7a29eaf319af078

🔍 Key Validation:
   Length: 64 characters
   Bytes: 32 bytes
   Format: Valid hex
```

### **3. Script Validasi Key:**

```bash
# Validasi key yang ada
node validate_encryption_key.js [your_key]
```

**Output:**
```
✅ Format: Valid hex
✅ Length: Correct (64 chars)
✅ Buffer: 32 bytes
✅ Crypto Test: Key works with AES-256-GCM
🎉 Key validation successful!
```

## 🔑 **Format Key yang Benar:**

### **✅ Key yang Valid:**
- **Panjang:** 64 karakter hex
- **Bytes:** 32 bytes (256 bits)
- **Format:** Hexadecimal (0-9, a-f)
- **Contoh:** `36bf4700775365c877f2fccfcb15579b0afd2e5979d22395e7a29eaf319af078`

### **❌ Key yang Tidak Valid:**
- **Panjang salah:** `casePassword_Khusus_Ini_password` (bukan hex, bukan 64 chars)
- **Format salah:** `12345` (terlalu pendek)
- **Bukan hex:** `ghijklmnop` (mengandung karakter non-hex)

## 🚀 **Setup untuk Railway:**

### **1. Generate Key Baru:**
```bash
node generate_encryption_key.js
```

### **2. Update Railway Environment Variable:**
```
FILE_ENCRYPTION_KEY = 36bf4700775365c877f2fccfcb15579b0afd2e5979d22395e7a29eaf319af078
```

### **3. Deploy Ulang:**
- Railway akan otomatis redeploy
- Cek logs untuk memastikan key berhasil diinisialisasi

## 🔍 **Testing:**

### **Test Upload KTP:**
1. Buka `https://bphtb-bappenda.up.railway.app/registrasi.html`
2. Upload file KTP
3. Submit form
4. Cek apakah berhasil

### **Expected Results:**
- ✅ **Tidak ada error** "Invalid key length"
- ✅ **Log sukses:** "🔒 [SECURE] Encryption key initialized successfully"
- ✅ **File KTP terenkripsi** dengan AES-256-GCM
- ✅ **Database menyimpan** `fileId`

## 📋 **Checklist:**

- [ ] Environment variable FILE_ENCRYPTION_KEY sudah di-set di Railway
- [ ] Key panjangnya 64 karakter hex (32 bytes)
- [ ] Key sudah di-validasi dengan script
- [ ] Aplikasi sudah di-deploy ulang
- [ ] Logs menunjukkan key berhasil diinisialisasi
- [ ] Test upload KTP berhasil

## 🎉 **Hasil Akhir:**

**✅ Error "Invalid key length" telah diperbaiki!**

**🔒 Sistem enkripsi KTP sekarang menggunakan key yang valid untuk AES-256-GCM**

**🚀 Ready untuk testing di Railway production!**
