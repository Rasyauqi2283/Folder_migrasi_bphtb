# BACKEND API REQUIREMENTS - REAL-TIME SYSTEM

## 📋 **ENDPOINT YANG DIPERLUKAN**

### **1. Admin Ping Notification**
```
POST /api/admin/notification-warehouse/send-ping
```

**Request Body:**
```json
{
  "nobooking": "string",
  "no_registrasi": "string", 
  "target_divisions": ["ltb", "bank"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ping berhasil dikirim",
  "data": {
    "nobooking": "string",
    "target_divisions": ["ltb", "bank"],
    "sent_at": "2025-01-XX 10:30:00"
  }
}
```

### **2. Admin Notification Count (untuk real-time monitoring)**
```
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

### **3. LTB Data Endpoint**
```
GET /api/ltb/berkas-sspd
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "no_registrasi": "string",
      "nobooking": "string",
      "nop_pbb": "string",
      "nama_wajib_pajak": "string",
      "nama_pemilik_objek_pajak": "string",
      "tanggal_terima": "string",
      "track_status": "string",
      "keterangan": "string"
    }
  ]
}
```

### **4. Bank Transaction Endpoint**
```
GET /api/bank/transaksi?tab=pending&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "rows": [
    {
      "no_registrasi": "string",
      "nobooking": "string",
      "namawajibpajak": "string",
      "nomor_bukti_pembayaran": "string",
      "nominal": 1000000,
      "tanggal_pembayaran": "string",
      "status_verifikasi": "Pending"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10
  }
}
```

## 🔧 **IMPLEMENTASI BACKEND**

### **Node.js/Express.js Example:**

```javascript
// Ping notification endpoint
app.post('/api/admin/notification-warehouse/send-ping', async (req, res) => {
  try {
    const { nobooking, no_registrasi, target_divisions } = req.body;
    
    // Simpan notifikasi ping ke database
    await db.query(`
      INSERT INTO ping_notifications (nobooking, no_registrasi, target_divisions, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [nobooking, no_registrasi, JSON.stringify(target_divisions)]);
    
    // Kirim notifikasi ke divisi target (WebSocket/SSE)
    target_divisions.forEach(division => {
      io.to(division).emit('ping_notification', {
        nobooking,
        no_registrasi,
        message: `Ping dari Admin untuk No. Booking: ${nobooking}`
      });
    });
    
    res.json({
      success: true,
      message: 'Ping berhasil dikirim',
      data: {
        nobooking,
        target_divisions,
        sent_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Count-only endpoint untuk real-time monitoring
app.get('/api/admin/notification-warehouse/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { count_only } = req.query;
    
    let query = '';
    switch (category) {
      case 'ppat-ltb':
        query = 'SELECT COUNT(*) FROM ltb_1_terima_berkas_sspd WHERE status = "Diolah"';
        break;
      case 'peneliti-lsb':
        query = 'SELECT COUNT(*) FROM p_3_clear_to_paraf WHERE status = "Ready"';
        break;
      case 'lsb-ppat':
        query = 'SELECT COUNT(*) FROM lsb_1_serah_berkas WHERE status = "Terselesaikan"';
        break;
    }
    
    const result = await db.query(query);
    const total = parseInt(result.rows[0].count);
    
    if (count_only === 'true') {
      res.json({
        success: true,
        pagination: {
          total,
          page: 1,
          limit: 50,
          totalPages: Math.ceil(total / 50)
        }
      });
    } else {
      // Return full data
      // ... implementasi lengkap
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## 🗄️ **DATABASE TABLES YANG DIPERLUKAN**

### **1. Ping Notifications Table**
```sql
CREATE TABLE ping_notifications (
  id SERIAL PRIMARY KEY,
  nobooking VARCHAR(50) NOT NULL,
  no_registrasi VARCHAR(50) NOT NULL,
  target_divisions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent'
);
```

### **2. Real-time Sessions Table**
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

## 🔔 **WEBSOCKET/SSE IMPLEMENTASI**

### **WebSocket Server (Socket.io)**
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join divisi room
  socket.on('join_division', (division) => {
    socket.join(division);
    console.log(`User ${socket.id} joined division: ${division}`);
  });
  
  // Handle ping notifications
  socket.on('ping_received', (data) => {
    // Update database
    // Notify other users in same division
    socket.to(data.division).emit('new_ping', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

### **Client-side WebSocket Connection**
```javascript
// Di halaman LTB dan Bank
const socket = io();

socket.emit('join_division', 'ltb'); // atau 'bank'

socket.on('new_ping', (data) => {
  showPingNotification(data);
});

socket.on('ping_notification', (data) => {
  showNotification(data.message);
});
```

## 📝 **CATATAN PENTING**

1. **Error Handling**: Semua endpoint harus mengembalikan JSON, bukan HTML
2. **CORS**: Pastikan CORS dikonfigurasi untuk frontend
3. **Authentication**: Implementasikan session/authentication yang sesuai
4. **Rate Limiting**: Tambahkan rate limiting untuk mencegah spam
5. **Logging**: Log semua aktivitas ping untuk audit trail

## 🚀 **PRIORITAS IMPLEMENTASI**

1. **High Priority**: Endpoint count-only untuk real-time monitoring
2. **Medium Priority**: Ping notification endpoint
3. **Low Priority**: WebSocket/SSE untuk notifikasi real-time

## ⚠️ **FALLBACK BEHAVIOR**

Saat ini frontend sudah menangani error dengan:
- Menampilkan notifikasi fallback jika endpoint tidak ada
- Real-time monitoring tetap berjalan dengan table-based detection
- User experience tidak terganggu meskipun backend belum lengkap
