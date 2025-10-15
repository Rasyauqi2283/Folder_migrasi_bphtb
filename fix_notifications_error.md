# 🔧 Fix Notifications Table Error

## ❌ Error yang Terjadi
```
Get unread notifications error: error: relation "notifications" does not exist
```

## 🔍 Analisis Masalah
- Tabel `notifications` tidak ada di database
- Kode menggunakan `notifications` tapi database hanya memiliki `sys_notifications`
- Perlu membuat tabel `notifications` atau mengubah kode

## ✅ Solusi 1: Buat Tabel Notifications (Recommended)

### Jalankan SQL ini di database:
```sql
-- Create notifications table for PPATK system
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(50) NOT NULL,
    nobooking VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_userid ON notifications(userid);
CREATE INDEX IF NOT EXISTS idx_notifications_nobooking ON notifications(nobooking);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Cara Menjalankan:
1. **Via pgAdmin/Adminer**: Copy-paste SQL di atas dan jalankan
2. **Via psql command line**:
   ```bash
   psql -h localhost -U postgres -d bappenda -f create_notifications_table.sql
   ```
3. **Via Railway/Production**: Jalankan di SQL editor di dashboard

## ✅ Solusi 2: Update Kode untuk Menggunakan sys_notifications

Jika ingin menggunakan tabel `sys_notifications` yang sudah ada, update file `notification_model.js`:

```javascript
export const getUnreadNotifications = async (userId) => {
    const query = `
        SELECT n.*, b.nobooking, b.namawajibpajak 
        FROM sys_notifications n
        LEFT JOIN pat_1_bookingsspd b ON n.booking_id = b.bookingid
        WHERE n.recipient_id = $1 AND n.is_read = FALSE
        ORDER BY n.created_at DESC
        LIMIT 10
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};
```

## 🎯 Rekomendasi
**Gunakan Solusi 1** karena:
- Struktur tabel `notifications` lebih sesuai dengan kode yang sudah ada
- Field `userid` dan `nobooking` lebih konsisten
- Lebih mudah untuk maintenance

## 🧪 Testing
Setelah tabel dibuat, test endpoint:
```bash
curl -X GET http://localhost:3000/api/notifications/unread \
     -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

Expected response:
```json
{
  "success": true,
  "notifications": [],
  "total_unread": 0
}
```

## 📝 Sample Data (Optional)
Untuk testing, bisa insert sample data:
```sql
INSERT INTO notifications (userid, nobooking, title, message, type, is_read) VALUES
('PAT09', '20011-2025-000009', 'Booking Siap Dicek', 'Booking telah siap untuk diverifikasi', 'success', false),
('P01', '20011-2025-000010', 'Paraf Kasie Tersedia', 'Dokumen siap untuk diparaf', 'warning', false);
```
