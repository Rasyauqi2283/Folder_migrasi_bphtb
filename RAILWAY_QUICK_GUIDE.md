# 🚀 Railway Production - Setup Enkripsi KTP

## 🌐 **Untuk Aplikasi yang Sudah di up.railway.app**

### **1. Generate Encryption Key**
```bash
node generate_encryption_key.js
```

**Output:**
```
FILE_ENCRYPTION_KEY=921ee962cd31cb826fdd73cf186c9237df2231318c80d488119d43e398f089eb
```

### **2. Setup di Railway Dashboard**
1. Buka [railway.app](https://railway.app)
2. Login → Pilih project Anda
3. Klik tab **"Variables"**
4. Klik **"New Variable"**
5. Tambahkan:
   ```
   Name: FILE_ENCRYPTION_KEY
   Value: 921ee962cd31cb826fdd73cf186c9237df2231318c80d488119d43e398f089eb
   ```

### **3. Deploy Ulang**
- Railway otomatis redeploy setelah tambah environment variable
- Atau trigger manual deploy

### **4. Test di Production**
1. Buka `https://your-app.up.railway.app/registrasi.html`
2. Upload KTP via registrasi
3. Cek apakah berhasil

### **5. Cek Keamanan**
```bash
# URL ini TIDAK BISA diakses (harus error 404)
https://your-app.up.railway.app/penting_F_simpan/uploads_ktp/ktp-123.jpg

# URL ini BISA diakses (hanya admin)
https://your-app.up.railway.app/api/secure-files/ktp/{fileId}?userId={userId}
```

## 🔒 **Hasil Akhir**

✅ **File KTP terenkripsi** di Railway production  
✅ **Tidak bisa diakses** via URL langsung  
✅ **Hanya admin** yang bisa akses  
✅ **Audit trail** lengkap  
✅ **Keamanan maksimal** untuk data pribadi  

**🎉 KTP Anda sekarang AMAN di Railway Production!**
