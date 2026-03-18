# 🗑️ AUTO DELETE SYSTEM - PPAT ENDPOINT

Sistem otomatis untuk menghapus data yang ditolak setelah 10 hari dengan perlindungan nobooking.

## 📁 Struktur File

```
backend/endpoint_session/PPAT_endpoint/
├── index.js                    # File utama untuk mengelola semua endpoint
├── auto_delete_service.js      # Core service logic
├── auto_delete_endpoints.js    # API endpoints
├── scheduled_cleanup.js        # Scheduled job
├── test_auto_delete.js         # Test suite
└── README.md                   # Dokumentasi ini
```

## 🚀 Cara Penggunaan

### 1. Integrasi ke index.js utama

Tambahkan kode berikut ke file `index.js` utama:

```javascript
// Import auto-delete system
const { router: autoDeleteRouter, scheduledCleanup } = require('./backend/endpoint_session/PPAT_endpoint');

// Mount auto-delete endpoints
app.use('/api', autoDeleteRouter);

// Start scheduled cleanup
scheduledCleanup.start();
```

### 2. Setup Database

Jalankan script SQL untuk membuat tabel dan function:

```bash
psql -d your_database -f database/auto_delete_system.sql
```

### 3. Install Dependencies

```bash
npm install node-cron
```

### 4. Test Sistem

```bash
node backend/endpoint_session/PPAT_endpoint/test_auto_delete.js
```

## 📊 API Endpoints

### LTB Rejection
```http
POST /api/ltb/reject-with-auto-delete
Content-Type: application/json

{
    "nobooking": "BOOKING001",
    "rejectionReason": "Dokumen tidak lengkap",
    "userid": "user123"
}
```

### PV Rejection
```http
POST /api/pv/reject-with-auto-delete
Content-Type: application/json

{
    "nobooking": "BOOKING002", 
    "rejectionReason": "Data tidak valid",
    "userid": "pvuser456"
}
```

### Check Nobooking Usage
```http
GET /api/check-nobooking-usage/BOOKING001
```

### Admin Endpoints
```http
POST /api/admin/execute-auto-delete
GET /api/admin/pending-deletions
GET /api/admin/used-nobooking-summary
POST /api/admin/manual-cleanup
GET /api/admin/cleanup-status
POST /api/admin/start-cleanup
POST /api/admin/stop-cleanup
```

## ⏰ Scheduled Jobs

### Daily Cleanup
- **Schedule**: `0 19 * * *` (02:00 WIB)
- **Purpose**: Cleanup utama setiap hari

### Frequent Cleanup  
- **Schedule**: `0 */6 * * *` (Setiap 6 jam)
- **Purpose**: Memastikan tidak ada data yang terlewat

## 🔧 Service Methods

### AutoDeleteService

```javascript
const AutoDeleteService = require('./auto_delete_service');

// Menambahkan data ke tracker
await AutoDeleteService.addRejectedBooking(nobooking, 'LTB', reason, userid);

// Mengeksekusi auto-delete
const deletedCount = await AutoDeleteService.executeAutoDelete();

// Cek nobooking usage
const isUsed = await AutoDeleteService.isNobookingUsed(nobooking);

// Manual cleanup
const results = await AutoDeleteService.manualCleanup();
```

## 📈 Monitoring

### Database Views
```sql
-- Data yang akan dihapus
SELECT * FROM v_rejected_bookings_pending;

-- Summary nobooking yang sudah digunakan
SELECT * FROM v_used_nobooking_summary;
```

### Status Endpoint
```http
GET /api/admin/cleanup-status
```

Response:
```json
{
    "success": true,
    "status": {
        "isRunning": false,
        "lastRun": "2024-01-15T02:00:00.000Z",
        "nextRun": "2024-01-15T08:00:00.000Z",
        "cronJobActive": true,
        "cronJob6hActive": true
    }
}
```

## 🧪 Testing

### Manual Testing
```javascript
const AutoDeleteTest = require('./test_auto_delete');

// Jalankan semua test
await AutoDeleteTest.runAllTests();

// Test individual
await AutoDeleteTest.testDatabaseConnection();
await AutoDeleteTest.testAddRejectedBooking();
```

### Database Testing
```sql
-- Test function
SELECT add_rejected_booking('TEST001', 'LTB', 'Test reason', 'testuser');
SELECT is_nobooking_used('TEST001');
SELECT auto_delete_rejected_data();
```

## 🔒 Security

### Input Validation
- Semua input divalidasi sebelum diproses
- SQL injection protection dengan parameterized queries
- Session validation untuk operasi admin

### Access Control
- Admin endpoints memerlukan autentikasi
- Audit trail untuk semua perubahan
- Graceful error handling

## 🚨 Troubleshooting

### Common Issues

#### 1. Cron Job Tidak Berjalan
```bash
# Cek status
GET /api/admin/cleanup-status

# Restart cleanup
POST /api/admin/start-cleanup
```

#### 2. Data Tidak Terhapus
```sql
-- Cek data yang pending
SELECT * FROM rejected_bookings_tracker 
WHERE is_deleted = FALSE 
AND scheduled_delete_at <= NOW();

-- Manual cleanup
POST /api/admin/manual-cleanup
```

#### 3. Nobooking Masih Bisa Digunakan
```sql
-- Cek history
SELECT * FROM used_nobooking_history 
WHERE nobooking = 'YOUR_BOOKING';

-- Test function
SELECT is_nobooking_used('YOUR_BOOKING');
```

## 📝 Logs

Sistem mencatat semua aktivitas dengan console.log:
- `INFO`: Operasi normal
- `ERROR`: Kesalahan sistem
- `WARN`: Peringatan

## 🔄 Maintenance

### Daily Tasks
- Monitor status cleanup
- Check pending deletions
- Verify scheduled jobs

### Weekly Tasks  
- Review performance metrics
- Check database size
- Update documentation

## 📞 Support

### Files Location
- Service: `auto_delete_service.js`
- Endpoints: `auto_delete_endpoints.js`
- Scheduled Job: `scheduled_cleanup.js`
- Tests: `test_auto_delete.js`

### Database
- Schema: `database/auto_delete_system.sql`
- Views: `v_rejected_bookings_pending`, `v_used_nobooking_summary`

---

**⚠️ Important Notes:**
- Pastikan backup database sebelum menjalankan cleanup
- Test di environment development terlebih dahulu
- Monitor performa database saat cleanup berjalan
- Dokumentasikan semua perubahan konfigurasi
