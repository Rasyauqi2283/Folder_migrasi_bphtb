/**
 * MAIN SERVER FILE - BAPPENDA PING NOTIFICATION SYSTEM
 * Server utama yang mengintegrasikan semua fitur ping notification
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeWebSocket } = require('./ping-notification-api');

const app = express();
const server = http.createServer(app);

// =====================================================
// MIDDLEWARE SETUP
// =====================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Terlalu banyak request. Silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// =====================================================
// STATIC FILES
// =====================================================

// Serve static files from public directory
app.use(express.static('public'));

// =====================================================
// API ROUTES
// =====================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ping notification API routes
const pingApiRoutes = require('./ping-notification-api');
app.use('/api/admin/notification-warehouse', pingApiRoutes.router);

// LTB API routes
app.get('/api/ltb/berkas-sspd', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'bappenda_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query(`
      SELECT 
        ltb.no_registrasi,
        ltb.nobooking,
        ltb.nop_pbb,
        ltb.nama_wajib_pajak,
        ltb.nama_pemilik_objek_pajak,
        ltb.tanggal_terima,
        ltb.track_status,
        ltb.keterangan,
        ltb.created_at,
        ltb.updated_at
      FROM ltb_1_terima_berkas_sspd ltb
      ORDER BY ltb.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error fetching LTB data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data LTB: ' + error.message
    });
  }
});

// Bank API routes
app.get('/api/bank/transaksi', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'bappenda_db',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    const { tab = 'pending', page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = '';
    switch (tab) {
      case 'pending':
        whereClause = "WHERE status_verifikasi = 'Pending'";
        break;
      case 'verified':
        whereClause = "WHERE status_verifikasi = 'Verified'";
        break;
      case 'rejected':
        whereClause = "WHERE status_verifikasi = 'Rejected'";
        break;
      default:
        whereClause = '';
    }

    const result = await pool.query(`
      SELECT 
        no_registrasi,
        nobooking,
        namawajibpajak,
        nomor_bukti_pembayaran,
        nominal,
        tanggal_pembayaran,
        status_verifikasi,
        created_at,
        updated_at
      FROM bank_transactions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), offset]);

    // Get total count
    const countResult = await pool.query(`
      SELECT COUNT(*) as total FROM bank_transactions ${whereClause}
    `);

    res.json({
      success: true,
      rows: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total)
      }
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error fetching Bank data:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Bank: ' + error.message
    });
  }
});

// =====================================================
// ERROR HANDLING MIDDLEWARE
// =====================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Terjadi kesalahan internal server',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =====================================================
// WEBSOCKET INITIALIZATION
// =====================================================

// Initialize WebSocket
initializeWebSocket(server);

// =====================================================
// SERVER STARTUP
// =====================================================

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('🚀 Server started successfully!');
  console.log(`📡 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready for connections`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📁 Static files served from: ./public`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server };
