# 🔗 INTEGRASI AUTO DELETE SYSTEM

## Langkah-langkah Integrasi ke index.js

### 1. Import Auto Delete System

Tambahkan kode berikut di bagian atas file `index.js`:

```javascript
// Import auto-delete system
const { router: autoDeleteRouter, scheduledCleanup } = require('./backend/endpoint_session/PPAT_endpoint');
```

### 2. Mount Endpoints

Tambahkan setelah deklarasi app:

```javascript
// Mount auto-delete endpoints
app.use('/api', autoDeleteRouter);
```

### 3. Start Scheduled Cleanup

Tambahkan setelah server start:

```javascript
// Start scheduled cleanup
scheduledCleanup.start();

// Optional: Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    scheduledCleanup.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    scheduledCleanup.stop();
    process.exit(0);
});
```

### 4. Update Frontend Code

#### LTB Rejection (tb_ppatksspd.js)
```javascript
// Ganti endpoint dari:
// '${API_BASE_URL}/api/ltb_ltb-reject'
// Menjadi:
'${API_BASE_URL}/api/ltb/reject-with-auto-delete'
```

#### PV Rejection (Validasi_berkas.html)
```javascript
// Ganti endpoint dari:
// '/api/validasi/${encodeURIComponent(noVal())}/decision'
// Menjadi:
'/api/pv/reject-with-auto-delete'
```

### 5. Setup Database

Jalankan script SQL:

```bash
psql -d your_database -f database/auto_delete_system.sql
```

### 6. Install Dependencies

```bash
npm install node-cron
```

## Contoh Integrasi Lengkap

```javascript
// index.js
const express = require('express');
const app = express();

// Import auto-delete system
const { router: autoDeleteRouter, scheduledCleanup } = require('./backend/endpoint_session/PPAT_endpoint');

// ... other middleware and routes ...

// Mount auto-delete endpoints
app.use('/api', autoDeleteRouter);

// ... other routes ...

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start scheduled cleanup
    scheduledCleanup.start();
    console.log('Auto-delete system started');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    scheduledCleanup.stop();
    process.exit(0);
});
```

## Testing Integrasi

### 1. Test Database Connection
```bash
node backend/endpoint_session/PPAT_endpoint/test_auto_delete.js
```

### 2. Test Endpoints
```bash
# Test LTB rejection
curl -X POST ${API_BASE_URL}/api/ltb/reject-with-auto-delete \
  -H "Content-Type: application/json" \
  -d '{"nobooking":"TEST001","rejectionReason":"Test rejection","userid":"testuser"}'

# Test PV rejection
curl -X POST ${API_BASE_URL}/api/pv/reject-with-auto-delete \
  -H "Content-Type: application/json" \
  -d '{"nobooking":"TEST002","rejectionReason":"Test rejection","userid":"testuser"}'

# Check nobooking usage
curl ${API_BASE_URL}/api/check-nobooking-usage/TEST001

# Get pending deletions
curl ${API_BASE_URL}/api/admin/pending-deletions

# Get cleanup status
curl ${API_BASE_URL}/api/admin/cleanup-status
```

### 3. Test Scheduled Cleanup
```bash
# Manual cleanup
curl -X POST ${API_BASE_URL}/api/admin/manual-cleanup

# Start cleanup
curl -X POST ${API_BASE_URL}/api/admin/start-cleanup

# Stop cleanup
curl -X POST ${API_BASE_URL}/api/admin/stop-cleanup
```

## Monitoring

### 1. Database Monitoring
```sql
-- Cek data yang akan dihapus
SELECT * FROM v_rejected_bookings_pending;

-- Cek summary nobooking
SELECT * FROM v_used_nobooking_summary;

-- Cek status cleanup
SELECT 
    COUNT(*) as total_pending,
    COUNT(CASE WHEN scheduled_delete_at <= NOW() THEN 1 END) as ready_to_delete
FROM rejected_bookings_tracker 
WHERE is_deleted = FALSE;
```

### 2. Application Monitoring
```javascript
// Cek status cleanup
const status = scheduledCleanup.getStatus();
console.log('Cleanup status:', status);
```

## Troubleshooting

### 1. Endpoint Tidak Berfungsi
- Pastikan router sudah di-mount dengan benar
- Cek path endpoint di frontend
- Verifikasi database connection

### 2. Scheduled Cleanup Tidak Berjalan
- Cek status dengan `/api/admin/cleanup-status`
- Restart dengan `/api/admin/start-cleanup`
- Cek log untuk error messages

### 3. Database Error
- Pastikan script SQL sudah dijalankan
- Cek permissions database user
- Verifikasi tabel dan function sudah dibuat

## Environment Variables

Tambahkan ke `.env`:

```env
# Auto Delete Configuration
AUTO_DELETE_ENABLED=true
AUTO_DELETE_RETENTION_DAYS=10
CLEANUP_SCHEDULE_DAILY=0 19 * * *
CLEANUP_SCHEDULE_FREQUENT=0 */6 * * *
```

## Security Considerations

1. **Admin Endpoints**: Tambahkan middleware autentikasi untuk endpoint admin
2. **Input Validation**: Semua input sudah divalidasi
3. **SQL Injection**: Menggunakan parameterized queries
4. **Logging**: Semua aktivitas tercatat di log

## Performance

1. **Database Indexes**: Sudah dibuat untuk performa optimal
2. **Batch Processing**: Cleanup dilakukan dalam batch
3. **Connection Pooling**: Menggunakan pool yang sudah ada
4. **Monitoring**: Monitor performa dengan endpoint status

---

**✅ Checklist Integrasi:**
- [ ] Import auto-delete system
- [ ] Mount endpoints
- [ ] Start scheduled cleanup
- [ ] Update frontend endpoints
- [ ] Setup database
- [ ] Install dependencies
- [ ] Test integrasi
- [ ] Monitor sistem
