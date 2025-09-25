# 🚀 Railway Database URL Setup

## 🔍 **Masalah yang Ditemukan**

**Konflik Konfigurasi Database:**
- **DATABASE_URL**: `postgresql://postgres:...@postgres.railway.internal:5432/railway`
- **Individual vars**: `shortline.proxy.rlwy.net:17519/bappenda_restore`

**Database yang berbeda:**
- DATABASE_URL → `railway`
- PG_DATABASE → `bappenda_restore`

## 🛠️ **Solusi: Tambahkan DATABASE_URL ke Railway**

### **Step 1: Tambahkan DATABASE_URL ke Railway**

**Gunakan Railway CLI:**
```bash
# Tambahkan DATABASE_URL ke Railway
railway variables set DATABASE_URL="postgresql://postgres:ifRMbliILazTJaLOcHhKXmgnhinHuJbO@postgres.railway.internal:5432/railway"
```

**Atau melalui Railway Dashboard:**
1. **Buka Railway Dashboard**
2. **Pilih project `observant-youth`**
3. **Pilih service `bphtb-bappenda-kabbogor`**
4. **Klik tab "Variables"**
5. **Klik "New Variable"**
6. **Key**: `DATABASE_URL`
7. **Value**: `postgresql://postgres:ifRMbliILazTJaLOcHhKXmgnhinHuJbO@postgres.railway.internal:5432/railway`
8. **Klik "Add"**

### **Step 2: Verifikasi Database yang Benar**

**Cek database yang aktif:**
```bash
# Cek database yang ada di PostgreSQL
railway run psql -c "\l"
```

**Expected output:**
```
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
-----------+----------+----------+-------------+-------------+-----------------------
 railway   | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | UTF8        | UTF8        | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
```

### **Step 3: Pilih Database yang Benar**

**Option A: Gunakan database `railway` (Recommended)**
```bash
# Update DATABASE_URL untuk menggunakan database 'railway'
railway variables set DATABASE_URL="postgresql://postgres:ifRMbliILazTJaLOcHhKXmgnhinHuJbO@postgres.railway.internal:5432/railway"
```

**Option B: Gunakan database `bappenda_restore`**
```bash
# Update DATABASE_URL untuk menggunakan database 'bappenda_restore'
railway variables set DATABASE_URL="postgresql://postgres:ifRMbliILazTJaLOcHhKXmgnhinHuJbO@postgres.railway.internal:5432/bappenda_restore"
```

### **Step 4: Deploy dan Test**

```bash
# Deploy aplikasi
git add .
git commit -m "Fix database configuration to use DATABASE_URL"
git push origin main

# Monitor logs
railway logs
```

### **Step 5: Verifikasi Koneksi**

**Cek logs aplikasi:**
```bash
# Cek logs untuk memastikan koneksi berhasil
railway logs --follow
```

**Expected logs:**
```
🌐 DB URL yang dipakai backend: postgresql://postgres:...@postgres.railway.internal:5432/railway
🌐 DB host: postgres.railway.internal
🌐 DB port: 5432
🌐 DB database: railway
🟢 Berhasil terhubung ke database
```

## 🔧 **Troubleshooting**

### **Jika Database `railway` Kosong:**

**Migrasi data dari `bappenda_restore` ke `railway`:**
```bash
# Backup database bappenda_restore
railway run pg_dump -h postgres.railway.internal -U postgres -d bappenda_restore > backup.sql

# Restore ke database railway
railway run psql -h postgres.railway.internal -U postgres -d railway < backup.sql
```

### **Jika Database `bappenda_restore` yang Benar:**

**Update DATABASE_URL:**
```bash
railway variables set DATABASE_URL="postgresql://postgres:ifRMbliILazTJaLOcHhKXmgnhinHuJbO@postgres.railway.internal:5432/bappenda_restore"
```

### **Jika Masih Ada Error:**

**Cek koneksi manual:**
```bash
# Test koneksi ke database
railway run psql -h postgres.railway.internal -U postgres -d railway -c "SELECT version();"
```

## 📊 **Expected Results**

### **Setelah Setup:**
- ✅ **DATABASE_URL** terkonfigurasi dengan benar
- ✅ **Aplikasi** menggunakan DATABASE_URL sebagai prioritas
- ✅ **Koneksi database** stabil
- ✅ **Checkpoint logs** berkurang
- ✅ **Performance** meningkat

### **Logs yang Diharapkan:**
```
🌐 DB URL yang dipakai backend: postgresql://postgres:...@postgres.railway.internal:5432/railway
🌐 DB host: postgres.railway.internal
🌐 DB port: 5432
🌐 DB database: railway
🟢 Berhasil terhubung ke database
📊 PostgreSQL Checkpoint Configuration:
  checkpoint_timeout: 15min
  max_wal_size: 2GB
  checkpoint_completion_target: 0.9
```

## 🎯 **Next Steps**

1. **Tambahkan DATABASE_URL** ke Railway
2. **Deploy aplikasi** dengan konfigurasi baru
3. **Monitor logs** untuk memastikan koneksi berhasil
4. **Jalankan PostgreSQL optimization** script
5. **Test aplikasi** untuk memastikan semuanya berfungsi

---

**Status:** 🔄 **Ready for Implementation**
**Priority:** 🔴 **High** (mengatasi konflik konfigurasi database)
**Impact:** 🚀 **High** (menyelesaikan masalah koneksi database)
