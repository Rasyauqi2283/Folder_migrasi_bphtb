# 🗑️ AUTO DELETE SYSTEM

Sistem otomatis untuk menghapus data yang ditolak setelah 10 hari dengan perlindungan nobooking.

## 📋 Overview

Sistem ini dirancang untuk:
- ✅ Menghapus data yang ditolak secara otomatis setelah 10 hari
- ✅ Mencegah nobooking yang sudah ditolak digunakan kembali
- ✅ Melindungi integritas alur pembuatan nobooking
- ✅ Menyediakan monitoring dan logging yang komprehensif

## 🏗️ Arsitektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│                 │    │                  │    │                 │
│ - LTB Reject    │───▶│ - Auto Delete    │───▶│ - Tracker Table │
│ - PV Reject     │    │   Service        │    │ - History Table │
│ - Validation    │    │ - Scheduled Job  │    │ - Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Struktur File

```
├── database/
│   └── auto_delete_system.sql          # Database schema & functions
├── backend/
│   ├── auto_delete_service.js          # Core service logic
│   ├── auto_delete_endpoints.js        # API endpoints
│   ├── scheduled_cleanup.js            # Scheduled job
│   └── integration_guide.md            # Integration guide
├── test/
│   └── auto_delete_test.js             # Test suite
└── README_AUTO_DELETE.md               # This file
```

## 🚀 Quick Start

### 1. Setup Database
```bash
# Jalankan script SQL
psql -d your_database -f database/auto_delete_system.sql
```

### 2. Install Dependencies
```bash
npm install node-cron
```

### 3. Integrasi ke Aplikasi
```javascript
// Di index.js
const autoDeleteEndpoints = require('./backend/auto_delete_endpoints');
const scheduledCleanup = require('./backend/scheduled_cleanup');

app.use('/api', autoDeleteEndpoints);
scheduledCleanup.start();
```

### 4. Test Sistem
```bash
node test/auto_delete_test.js
```

## 📊 Database Schema

### Tabel `rejected_bookings_tracker`
```sql
CREATE TABLE rejected_bookings_tracker (
    id BIGSERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL UNIQUE,
    rejection_source VARCHAR(20) NOT NULL, -- 'LTB' atau 'PV'
    rejection_reason TEXT,
    rejected_by VARCHAR(50),
    rejected_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_delete_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 days'),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabel `used_nobooking_history`
```sql
CREATE TABLE used_nobooking_history (
    id BIGSERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL UNIQUE,
    original_userid VARCHAR(50),
    original_created_at TIMESTAMPTZ,
    rejection_reason TEXT,
    status VARCHAR(20) DEFAULT 'rejected',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 API Endpoints

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
```

## ⏰ Scheduled Jobs

### Daily Cleanup
- **Schedule**: `0 19 * * *` (02:00 WIB)
- **Purpose**: Cleanup utama setiap hari

### Frequent Cleanup  
- **Schedule**: `0 */6 * * *` (Setiap 6 jam)
- **Purpose**: Memastikan tidak ada data yang terlewat

## 📈 Monitoring

### Database Views
```sql
-- Data yang akan dihapus
SELECT * FROM v_rejected_bookings_pending;

-- Summary nobooking yang sudah digunakan
SELECT * FROM v_used_nobooking_summary;
```

### Logs
Sistem mencatat semua aktivitas dengan level:
- `INFO`: Operasi normal
- `ERROR`: Kesalahan sistem
- `WARN`: Peringatan

## 🧪 Testing

### Manual Testing
```javascript
const AutoDeleteService = require('./backend/auto_delete_service');

// Test add rejected booking
await AutoDeleteService.addRejectedBooking('TEST001', 'LTB', 'Test reason', 'testuser');

// Test check usage
const isUsed = await AutoDeleteService.isNobookingUsed('TEST001');

// Test manual cleanup
const results = await AutoDeleteService.manualCleanup();
```

### Automated Testing
```bash
# Jalankan semua test
node test/auto_delete_test.js

# Test database functions
psql -d your_database -c "SELECT add_rejected_booking('TEST001', 'LTB', 'Test', 'user');"
```

## 🔒 Security

### Input Validation
- Semua input divalidasi sebelum diproses
- SQL injection protection dengan parameterized queries
- XSS protection dengan proper escaping

### Access Control
- Admin endpoints memerlukan autentikasi
- Session validation untuk semua operasi
- Audit trail untuk semua perubahan

### Data Protection
- Soft delete untuk data penting
- Backup sebelum cleanup
- Rollback capability

## 🚨 Troubleshooting

### Common Issues

#### 1. Cron Job Tidak Berjalan
```bash
# Cek status
ps aux | grep node

# Cek log
tail -f logs/application.log | grep "cleanup"
```

#### 2. Data Tidak Terhapus
```sql
-- Cek data yang pending
SELECT * FROM rejected_bookings_tracker 
WHERE is_deleted = FALSE 
AND scheduled_delete_at <= NOW();

-- Manual cleanup
SELECT auto_delete_rejected_data();
```

#### 3. Nobooking Masih Bisa Digunakan
```sql
-- Cek history
SELECT * FROM used_nobooking_history 
WHERE nobooking = 'YOUR_BOOKING';

-- Cek function
SELECT is_nobooking_used('YOUR_BOOKING');
```

### Debug Commands
```sql
-- Cek semua data yang akan dihapus
SELECT nobooking, rejection_source, scheduled_delete_at, 
       EXTRACT(EPOCH FROM (scheduled_delete_at - NOW())) / 86400 as days_left
FROM rejected_bookings_tracker 
WHERE is_deleted = FALSE 
ORDER BY scheduled_delete_at;

-- Cek performa
EXPLAIN ANALYZE SELECT * FROM rejected_bookings_tracker 
WHERE scheduled_delete_at <= NOW();
```

## 📊 Performance

### Optimization
- Index pada kolom yang sering diquery
- Batch processing untuk cleanup
- Connection pooling untuk database

### Monitoring
- Query execution time
- Memory usage
- Database connection count

## 🔄 Maintenance

### Daily Tasks
- Monitor log files
- Check pending deletions
- Verify scheduled jobs

### Weekly Tasks  
- Review performance metrics
- Check database size
- Update documentation

### Monthly Tasks
- Archive old logs
- Optimize database
- Review security

## 📞 Support

### Logs Location
- Application logs: `logs/application.log`
- Error logs: `logs/error.log`
- Access logs: `logs/access.log`

### Contact
- Technical Support: support@bappenda.go.id
- Database Admin: dba@bappenda.go.id

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Initial release
- ✅ Auto-delete after 10 days
- ✅ Nobooking protection
- ✅ Scheduled cleanup jobs
- ✅ Admin monitoring endpoints
- ✅ Comprehensive testing suite

---

**⚠️ Important Notes:**
- Pastikan backup database sebelum menjalankan cleanup
- Test di environment development terlebih dahulu
- Monitor performa database saat cleanup berjalan
- Dokumentasikan semua perubahan konfigurasi
