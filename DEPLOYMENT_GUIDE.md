# 🚀 BAPPENDA PING NOTIFICATION SYSTEM - DEPLOYMENT GUIDE

## 📋 **OVERVIEW**

Panduan lengkap untuk menjalankan sistem ping notification BAPPENDA dengan backend API dan WebSocket real-time.

## 🛠️ **LANGKAH-LANGKAH DEPLOYMENT**

### **1. Setup Backend Server**

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Setup environment
cp env.example .env
# Edit .env dengan konfigurasi database Anda

# Jalankan database migration
npm run migrate

# Start server
npm start
# atau untuk development: npm run dev
```

### **2. Setup Database**

```sql
-- Pastikan database bappenda_db sudah dibuat
CREATE DATABASE bappenda_db;

-- Jalankan migration
\i database/migrations/001_create_ping_tables.sql
```

### **3. Konfigurasi Environment**

Edit file `.env`:
```env
# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bappenda_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# WebSocket
WS_CORS_ORIGIN=*
```

### **4. Test API Endpoints**

```bash
# Health check
curl http://localhost:3000/health

# Test ping notification
curl -X POST http://localhost:3000/api/admin/notification-warehouse/send-ping \
  -H "Content-Type: application/json" \
  -d '{
    "nobooking": "PPATK0012025001",
    "no_registrasi": "2025O001", 
    "target_divisions": ["ltb", "bank"]
  }'

# Test notification count
curl http://localhost:3000/api/admin/notification-warehouse/ppat-ltb?count_only=true
```

## 🔌 **WEBSOCKET TESTING**

### **Browser Console Test**
```javascript
// Buka browser console di halaman LTB atau Bank
// Test WebSocket connection
console.log('WebSocket Status:', window.bappendaWS.getStatus());

// Test ping notification (simulasi)
window.bappendaWS.emit('ping_notification', {
  ping_id: 1,
  nobooking: 'TEST001',
  no_registrasi: '2025O001',
  division: 'ltb',
  message: 'Test ping notification'
});
```

## 📱 **FRONTEND INTEGRATION**

### **1. Admin Page (admin-status-ppat.html)**
- ✅ Button "Kirim Ping" sudah terintegrasi
- ✅ Real-time monitoring sudah aktif
- ✅ Error handling sudah diimplementasi

### **2. LTB Page (terima-berkas-sspd.html)**
- ✅ WebSocket client sudah terintegrasi
- ✅ Ping notification UI sudah siap
- ✅ Real-time data monitoring aktif

### **3. Bank Page (hasil_transaksi.html)**
- ✅ WebSocket client sudah terintegrasi
- ✅ Ping notification UI sudah siap
- ✅ Real-time data monitoring aktif

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: Admin → LTB Ping**
1. Buka halaman Admin (`admin-status-ppat.html`)
2. Pilih kategori "PPAT → LTB"
3. Klik tombol "Kirim Ping" pada salah satu booking
4. Buka halaman LTB (`terima-berkas-sspd.html`)
5. Verifikasi notifikasi ping muncul

### **Scenario 2: Real-time Data Updates**
1. Buka halaman LTB dan Bank secara bersamaan
2. Pastikan real-time monitoring aktif (indikator hijau)
3. Tambah data baru di database
4. Verifikasi tabel otomatis ter-update

### **Scenario 3: WebSocket Connection**
1. Buka browser console
2. Check status: `window.bappendaWS.getStatus()`
3. Verifikasi `isConnected: true`
4. Test disconnect/reconnect

## 🔧 **TROUBLESHOOTING**

### **Error: "Endpoint API tidak ditemukan"**
**Solusi:**
- Pastikan backend server sudah running
- Check URL endpoint di browser network tab
- Verifikasi route sudah terdaftar di server.js

### **Error: "WebSocket connection failed"**
**Solusi:**
- Check firewall settings
- Verifikasi CORS configuration
- Pastikan Socket.IO server sudah running

### **Error: "Database connection failed"**
**Solusi:**
- Check database credentials di .env
- Pastikan PostgreSQL service running
- Verifikasi database bappenda_db sudah dibuat

### **Real-time monitoring tidak berfungsi**
**Solusi:**
- Check browser console untuk error
- Verifikasi API endpoint mengembalikan JSON
- Pastikan polling interval tidak terblokir

## 📊 **MONITORING & LOGS**

### **Server Logs**
```bash
# Monitor server logs
tail -f logs/app.log

# Check WebSocket connections
# Buka browser console dan lihat connection logs
```

### **Database Monitoring**
```sql
-- Check ping notifications
SELECT * FROM ping_notifications ORDER BY created_at DESC LIMIT 10;

-- Check activity logs
SELECT * FROM ping_activity_log ORDER BY created_at DESC LIMIT 10;

-- Check real-time sessions
SELECT * FROM real_time_sessions WHERE is_active = true;
```

### **Performance Monitoring**
```sql
-- Ping statistics
SELECT * FROM ping_statistics;

-- Division activity
SELECT * FROM division_activity;
```

## 🚀 **PRODUCTION DEPLOYMENT**

### **1. PM2 Setup**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "bappenda-ping-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### **2. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **3. SSL Certificate**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📈 **PERFORMANCE OPTIMIZATION**

### **Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY idx_ping_notifications_created_at ON ping_notifications(created_at);
CREATE INDEX CONCURRENTLY idx_ping_activity_log_ping_id ON ping_activity_log(ping_id);
```

### **Server Optimization**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js

# Use cluster mode
pm2 start server.js -i max --name "bappenda-ping-api"
```

## 🔒 **SECURITY CHECKLIST**

- ✅ Rate limiting enabled
- ✅ CORS properly configured
- ✅ Input validation implemented
- ✅ SQL injection protection
- ✅ Error handling secure
- ✅ Environment variables protected
- ✅ Database credentials secure

## 📞 **SUPPORT & MAINTENANCE**

### **Daily Tasks**
- Monitor server logs
- Check database performance
- Verify WebSocket connections
- Monitor ping notification delivery

### **Weekly Tasks**
- Clean up old ping notifications
- Update dependencies
- Check security patches
- Review performance metrics

### **Monthly Tasks**
- Database optimization
- Security audit
- Backup verification
- Performance review

---

## 🎉 **SELAMAT!**

Sistem ping notification BAPPENDA sudah siap digunakan! 

**Fitur yang sudah aktif:**
- ✅ Admin dapat mengirim ping ke LTB dan Bank
- ✅ Real-time notifications via WebSocket
- ✅ Fallback system dengan polling
- ✅ Error handling yang robust
- ✅ Database logging dan monitoring
- ✅ UI yang user-friendly

**Next Steps:**
1. Test semua fitur dengan data real
2. Monitor performance dan logs
3. Gather user feedback
4. Optimize berdasarkan usage patterns

**Happy Coding! 🚀**
