# 🗑️ Database Cleanup - Booking Data

## 📋 Overview
Script untuk menghapus semua data booking kecuali yang sudah selesai (`trackstatus = 'Diserahkan'`).

## 🛡️ Safety Features
- **Automatic Backup**: Semua data dibackup sebelum dihapus
- **Verification**: Script memverifikasi hasil cleanup
- **Rollback Ready**: Data bisa dikembalikan dari backup jika diperlukan

## 📁 Files Created

### 1. `backup_before_cleanup.sql`
- Backup semua data sebelum cleanup
- Backup data yang akan dipertahankan
- Backup data yang akan dihapus
- Menampilkan statistik

### 2. `cleanup_booking_data.sql`
- Script utama untuk cleanup
- Backup otomatis
- Hapus data yang tidak diperlukan
- Verifikasi hasil

### 3. `run_cleanup.bat` (Windows)
- Script otomatis untuk Windows
- Menjalankan backup dan cleanup
- Verifikasi hasil

### 4. `run_cleanup.sh` (Linux/Mac)
- Script otomatis untuk Linux/Mac
- Menjalankan backup dan cleanup
- Verifikasi hasil

## 🚀 How to Run

### Windows:
```bash
cd database
run_cleanup.bat
```

### Linux/Mac:
```bash
cd database
chmod +x run_cleanup.sh
./run_cleanup.sh
```

### Manual:
```bash
# 1. Backup
psql -h localhost -U postgres -d railway -f backup_before_cleanup.sql

# 2. Cleanup
psql -h localhost -U postgres -d railway -f cleanup_booking_data.sql
```

## 📊 Backup Tables Created

1. **`pat_1_bookingsspd_backup_20251003`**
   - Backup lengkap semua data sebelum cleanup

2. **`pat_1_bookingsspd_keep_20251003`**
   - Data yang dipertahankan (trackstatus = 'Diserahkan')

3. **`pat_1_bookingsspd_delete_20251003`**
   - Data yang dihapus (untuk referensi)

## 🔄 Rollback (Jika Diperlukan)

```sql
-- Kembalikan semua data dari backup
TRUNCATE TABLE pat_1_bookingsspd;
INSERT INTO pat_1_bookingsspd SELECT * FROM pat_1_bookingsspd_backup_20251003;
```

## ⚠️ Important Notes

1. **Backup First**: Selalu backup data sebelum cleanup
2. **Verify Results**: Script akan menampilkan statistik sebelum dan sesudah
3. **Test Environment**: Disarankan test di environment development dulu
4. **Monitor Logs**: Perhatikan output untuk memastikan tidak ada error

## 📈 Expected Results

- **Before**: Semua data booking (berbagai trackstatus)
- **After**: Hanya data dengan `trackstatus = 'Diserahkan'`
- **Backup**: 3 tabel backup untuk safety

## 🎯 Success Criteria

✅ Script berjalan tanpa error  
✅ Backup tables terbuat  
✅ Hanya data 'Diserahkan' yang tersisa  
✅ Verifikasi menunjukkan hasil yang benar  
