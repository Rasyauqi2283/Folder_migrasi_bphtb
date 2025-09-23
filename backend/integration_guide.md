# INTEGRASI AUTO-DELETE SYSTEM

## Langkah-langkah Integrasi

### 1. Setup Database
```sql
-- Jalankan script SQL untuk membuat tabel dan function
\i database/auto_delete_system.sql
```

### 2. Install Dependencies
```bash
npm install node-cron
```

### 3. Integrasi ke index.js

Tambahkan kode berikut ke file `index.js`:

```javascript
// Import modules
const autoDeleteEndpoints = require('./backend/auto_delete_endpoints');
const scheduledCleanup = require('./backend/scheduled_cleanup');

// Tambahkan routes
app.use('/api', autoDeleteEndpoints);

// Start scheduled cleanup
scheduledCleanup.start();

// Endpoint untuk monitoring (opsional)
app.get('/api/admin/cleanup-status', (req, res) => {
    const status = scheduledCleanup.getStatus();
    res.json({
        success: true,
        status
    });
});
```

### 4. Update Booking Creation

Tambahkan validasi nobooking di fungsi pembuatan booking:

```javascript
// Di endpoint pembuatan booking, tambahkan validasi
const AutoDeleteService = require('./backend/auto_delete_service');

// Sebelum membuat booking baru, cek apakah nobooking sudah pernah digunakan
const isUsed = await AutoDeleteService.isNobookingUsed(nobooking);
if (isUsed) {
    return res.status(400).json({
        success: false,
        message: 'Nomor booking sudah pernah digunakan dan tidak dapat digunakan kembali'
    });
}
```

### 5. Environment Variables

Tambahkan ke `.env`:
```
AUTO_DELETE_ENABLED=true
AUTO_DELETE_RETENTION_DAYS=10
CLEANUP_SCHEDULE_DAILY=0 19 * * *
CLEANUP_SCHEDULE_FREQUENT=0 */6 * * *
```

## API Endpoints

### LTB Rejection
```
POST /api/ltb/reject-with-auto-delete
Body: {
    nobooking: "string",
    rejectionReason: "string", 
    userid: "string"
}
```

### PV Rejection
```
POST /api/pv/reject-with-auto-delete
Body: {
    nobooking: "string",
    rejectionReason: "string",
    userid: "string"
}
```

### Check Nobooking Usage
```
GET /api/check-nobooking-usage/:nobooking
```

### Admin Endpoints
```
POST /api/admin/execute-auto-delete
GET /api/admin/pending-deletions
GET /api/admin/used-nobooking-summary
POST /api/admin/manual-cleanup
```

## Monitoring

### Database Views
- `v_rejected_bookings_pending` - Data yang akan dihapus
- `v_used_nobooking_summary` - Summary nobooking yang sudah digunakan

### Logs
Sistem akan mencatat semua aktivitas auto-delete di log dengan level INFO dan ERROR.

## Testing

### Manual Testing
```javascript
// Test auto-delete
const AutoDeleteService = require('./backend/auto_delete_service');

// Tambahkan data test
await AutoDeleteService.addRejectedBooking('TEST001', 'LTB', 'Test rejection', 'testuser');

// Jalankan cleanup manual
const results = await AutoDeleteService.manualCleanup();
console.log('Cleanup results:', results);
```

### Database Testing
```sql
-- Lihat data yang pending delete
SELECT * FROM v_rejected_bookings_pending;

-- Lihat summary nobooking yang sudah digunakan
SELECT * FROM v_used_nobooking_summary;

-- Test function
SELECT add_rejected_booking('TEST002', 'PV', 'Test reason', 'testuser');
SELECT auto_delete_rejected_data();
```

## Troubleshooting

### Common Issues

1. **Cron job tidak berjalan**
   - Pastikan timezone sudah benar
   - Cek log untuk error messages

2. **Data tidak terhapus**
   - Cek apakah scheduled_delete_at sudah lewat
   - Cek apakah is_deleted masih FALSE

3. **Nobooking masih bisa digunakan**
   - Pastikan fungsi is_nobooking_used dipanggil
   - Cek tabel used_nobooking_history

### Debug Commands
```sql
-- Cek data yang akan dihapus
SELECT * FROM rejected_bookings_tracker WHERE is_deleted = FALSE;

-- Cek nobooking yang sudah digunakan
SELECT * FROM used_nobooking_history;

-- Manual cleanup
SELECT * FROM manual_cleanup_rejected_data();
```

## Security Considerations

1. **Admin Access**: Pastikan endpoint admin hanya bisa diakses oleh admin
2. **Input Validation**: Semua input harus divalidasi
3. **Logging**: Semua aktivitas harus dicatat di log
4. **Backup**: Pastikan ada backup sebelum menjalankan cleanup

## Performance

1. **Indexes**: Pastikan index sudah dibuat untuk performa optimal
2. **Batch Processing**: Cleanup dilakukan dalam batch untuk efisiensi
3. **Monitoring**: Monitor performa database saat cleanup berjalan
