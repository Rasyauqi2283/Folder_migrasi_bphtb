# BAPPENDA PING NOTIFICATION SYSTEM - BACKEND

## 📋 **OVERVIEW**

Sistem ping notification untuk BAPPENDA yang memungkinkan Admin mengirim notifikasi real-time ke divisi lain (LTB, Bank, Peneliti, LSB) dengan fitur WebSocket dan polling.

## 🚀 **FITUR UTAMA**

- ✅ **Ping Notification**: Admin dapat mengirim ping ke divisi target
- ✅ **Real-time Updates**: WebSocket untuk notifikasi instant
- ✅ **Fallback System**: Polling sebagai backup jika WebSocket gagal
- ✅ **Activity Logging**: Log semua aktivitas ping
- ✅ **Rate Limiting**: Proteksi dari spam
- ✅ **Error Handling**: Penanganan error yang robust
- ✅ **Database Integration**: PostgreSQL dengan optimasi

## 📁 **STRUKTUR FILE**

```
backend/
├── server.js                          # Server utama
├── ping-notification-api.js           # API routes untuk ping
├── package.json                       # Dependencies
├── env.example                        # Environment variables
├── README.md                          # Dokumentasi ini
└── database/
    └── migrations/
        └── 001_create_ping_tables.sql # Database migration
```

## 🛠️ **INSTALASI**

### **1. Clone Repository**
```bash
git clone <repository-url>
cd backend
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Setup Environment**
```bash
cp env.example .env
# Edit .env dengan konfigurasi database Anda
```

### **4. Setup Database**
```bash
# Jalankan migration
npm run migrate

# Atau manual:
psql -U postgres -d bappenda_db -f database/migrations/001_create_ping_tables.sql
```

### **5. Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 **KONFIGURASI**

### **Environment Variables**
```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bappenda_db
DB_USER=postgres
DB_PASSWORD=your_password

# WebSocket
WS_CORS_ORIGIN=*
WS_PING_TIMEOUT=60000
WS_PING_INTERVAL=25000
```

### **Database Configuration**
Pastikan PostgreSQL sudah terinstall dan database `bappenda_db` sudah dibuat.

## 📡 **API ENDPOINTS**

### **1. Send Ping Notification**
```http
POST /api/admin/notification-warehouse/send-ping
Content-Type: application/json

{
  "nobooking": "PPAT0012025001",
  "no_registrasi": "2025O001",
  "target_divisions": ["ltb", "bank"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ping berhasil dikirim",
  "data": {
    "ping_id": 1,
    "nobooking": "PPAT0012025001",
    "no_registrasi": "2025O001",
    "target_divisions": ["ltb", "bank"],
    "sent_at": "2025-01-XX 10:30:00"
  }
}
```

### **2. Get Notification Count (Real-time Monitoring)**
```http
GET /api/admin/notification-warehouse/ppat-ltb?count_only=true
GET /api/admin/notification-warehouse/peneliti-lsb?count_only=true
GET /api/admin/notification-warehouse/lsb-ppat?count_only=true
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### **3. Get Full Notification Data**
```http
GET /api/admin/notification-warehouse/ppat-ltb?page=1&limit=50&search=PPAT001
```

### **4. Get Ping History**
```http
GET /api/admin/notification-warehouse/ping-history?page=1&limit=20&division=ltb
```

### **5. Acknowledge Ping**
```http
PUT /api/admin/notification-warehouse/ping/1/acknowledge
Content-Type: application/json

{
  "division": "ltb",
  "user_id": "ltb_001"
}
```

### **6. LTB Data**
```http
GET /api/ltb/berkas-sspd
```

### **7. Bank Data**
```http
GET /api/bank/transaksi?tab=pending&page=1&limit=50
```

## 🔌 **WEBSOCKET EVENTS**

### **Client → Server**
```javascript
// Join division room
socket.emit('join_division', 'ltb');

// Acknowledge ping
socket.emit('ping_acknowledged', {
  ping_id: 1,
  division: 'ltb',
  user_id: 'ltb_001'
});
```

### **Server → Client**
```javascript
// Ping notification
socket.on('ping_notification', (data) => {
  console.log('Ping received:', data);
});

// Data update
socket.on('data_updated', (data) => {
  console.log('Data updated:', data);
});

// System notification
socket.on('system_notification', (data) => {
  console.log('System notification:', data);
});
```

## 🗄️ **DATABASE SCHEMA**

### **ping_notifications**
```sql
CREATE TABLE ping_notifications (
    id SERIAL PRIMARY KEY,
    nobooking VARCHAR(50) NOT NULL,
    no_registrasi VARCHAR(50) NOT NULL,
    target_divisions JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **ping_activity_log**
```sql
CREATE TABLE ping_activity_log (
    id SERIAL PRIMARY KEY,
    ping_id INTEGER REFERENCES ping_notifications(id),
    action VARCHAR(50) NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### **real_time_sessions**
```sql
CREATE TABLE real_time_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    division VARCHAR(20) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

## 🔒 **SECURITY FEATURES**

- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **CORS Protection**: Konfigurasi CORS yang aman
- ✅ **Helmet Security**: Security headers
- ✅ **Input Validation**: Validasi semua input
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **Error Handling**: Tidak expose sensitive information

## 📊 **MONITORING & LOGGING**

### **Health Check**
```http
GET /health
```

### **Logs**
- Connection logs
- Error logs
- Activity logs
- Performance metrics

### **Database Views**
```sql
-- Ping statistics
SELECT * FROM ping_statistics;

-- Division activity
SELECT * FROM division_activity;
```

## 🧪 **TESTING**

```bash
# Run tests
npm test

# Test specific endpoint
curl -X POST http://localhost:3000/api/admin/notification-warehouse/send-ping \
  -H "Content-Type: application/json" \
  -d '{"nobooking":"TEST001","no_registrasi":"2025O001","target_divisions":["ltb"]}'
```

## 🚀 **DEPLOYMENT**

### **Production Setup**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "bappenda-ping-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

1. **WebSocket Connection Failed**
   - Check firewall settings
   - Verify CORS configuration
   - Check network connectivity

2. **Database Connection Error**
   - Verify database credentials
   - Check PostgreSQL service
   - Verify database exists

3. **Rate Limit Exceeded**
   - Increase rate limit in .env
   - Check for spam requests
   - Monitor request patterns

### **Debug Mode**
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check WebSocket connections
# Open browser console and check for WebSocket errors
```

## 📈 **PERFORMANCE OPTIMIZATION**

- ✅ **Database Indexing**: Optimized queries
- ✅ **Connection Pooling**: PostgreSQL connection pool
- ✅ **Caching**: In-memory caching for frequent queries
- ✅ **Compression**: Gzip compression enabled
- ✅ **Rate Limiting**: Prevents abuse

## 🤝 **CONTRIBUTING**

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 **LICENSE**

MIT License - see LICENSE file for details

## 📞 **SUPPORT**

- Email: support@bappenda.go.id
- Documentation: [Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

---

**Dibuat dengan ❤️ untuk BAPPENDA**
