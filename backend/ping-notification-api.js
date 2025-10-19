/**
 * PING NOTIFICATION API - BACKEND IMPLEMENTATION
 * Sistem notifikasi ping untuk Admin ke LTB dan Bank
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'bappenda_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// WebSocket untuk real-time notifications
const { Server } = require('socket.io');
let io;

// Initialize WebSocket
function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);
    
    // Join divisi room
    socket.on('join_division', (division) => {
      socket.join(division);
      console.log(`👥 User ${socket.id} joined division: ${division}`);
    });
    
    // Handle ping acknowledgment
    socket.on('ping_acknowledged', (data) => {
      console.log(`✅ Ping acknowledged by ${data.division}:`, data.nobooking);
      // Update database status
      updatePingStatus(data.ping_id, 'acknowledged');
    });
    
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
}

/**
 * POST /api/admin/notification-warehouse/send-ping
 * Mengirim ping notification ke divisi target
 */
router.post('/send-ping', async (req, res) => {
  try {
    const { nobooking, no_registrasi, target_divisions } = req.body;
    
    // Validasi input
    if (!nobooking || !no_registrasi || !target_divisions || !Array.isArray(target_divisions)) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Diperlukan: nobooking, no_registrasi, target_divisions'
      });
    }
    
    // Validasi target divisions
    const validDivisions = ['ltb', 'bank', 'peneliti', 'lsb'];
    const invalidDivisions = target_divisions.filter(div => !validDivisions.includes(div));
    if (invalidDivisions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Divisi tidak valid: ${invalidDivisions.join(', ')}. Divisi yang valid: ${validDivisions.join(', ')}`
      });
    }
    
    // Simpan ping notification ke database
    const pingResult = await pool.query(`
      INSERT INTO ping_notifications (nobooking, no_registrasi, target_divisions, created_at, status)
      VALUES ($1, $2, $3, NOW(), 'sent')
      RETURNING id
    `, [nobooking, no_registrasi, JSON.stringify(target_divisions)]);
    
    const pingId = pingResult.rows[0].id;
    
    // Kirim notifikasi real-time ke divisi target
    if (io) {
      target_divisions.forEach(division => {
        io.to(division).emit('ping_notification', {
          ping_id: pingId,
          nobooking,
          no_registrasi,
          division,
          message: `Ping dari Admin untuk No. Booking: ${nobooking}`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`📡 Ping sent to ${division}: ${nobooking}`);
      });
    }
    
    // Log aktivitas
    await pool.query(`
      INSERT INTO ping_activity_log (ping_id, action, details, created_at)
      VALUES ($1, 'sent', $2, NOW())
    `, [pingId, JSON.stringify({
      nobooking,
      no_registrasi,
      target_divisions,
      sent_by: req.user?.id || 'admin'
    })]);
    
    res.json({
      success: true,
      message: 'Ping berhasil dikirim',
      data: {
        ping_id: pingId,
        nobooking,
        no_registrasi,
        target_divisions,
        sent_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error sending ping:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim ping: ' + error.message
    });
  }
});

/**
 * GET /api/admin/notification-warehouse/:category?count_only=true
 * Mendapatkan jumlah notifikasi untuk real-time monitoring
 */
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { count_only, page = 1, limit = 50, search } = req.query;
    
    let query = '';
    let countQuery = '';
    let params = [];
    
    // Build query berdasarkan kategori
    switch (category) {
      case 'ppat-ltb':
        countQuery = `
          SELECT COUNT(*) as total 
          FROM ltb_1_terima_berkas_sspd ltb
          JOIN pat_1_bookingsspd pat ON ltb.nobooking = pat.nobooking
          WHERE ltb.status = 'Diolah'
        `;
        query = `
          SELECT ltb.*, pat.nobooking, pat.namawajibpajak, pat.no_registrasi
          FROM ltb_1_terima_berkas_sspd ltb
          JOIN pat_1_bookingsspd pat ON ltb.nobooking = pat.nobooking
          WHERE ltb.status = 'Diolah'
        `;
        break;
        
      case 'peneliti-lsb':
        countQuery = `
          SELECT COUNT(*) as total 
          FROM p_3_clear_to_paraf p3
          JOIN pat_1_bookingsspd pat ON p3.nobooking = pat.nobooking
          WHERE p3.status = 'Ready'
        `;
        query = `
          SELECT p3.*, pat.nobooking, pat.namawajibpajak, pat.no_registrasi
          FROM p_3_clear_to_paraf p3
          JOIN pat_1_bookingsspd pat ON p3.nobooking = pat.nobooking
          WHERE p3.status = 'Ready'
        `;
        break;
        
      case 'lsb-ppat':
        countQuery = `
          SELECT COUNT(*) as total 
          FROM lsb_1_serah_berkas lsb
          JOIN pat_1_bookingsspd pat ON lsb.nobooking = pat.nobooking
          WHERE lsb.status = 'Terselesaikan'
        `;
        query = `
          SELECT lsb.*, pat.nobooking, pat.namawajibpajak, pat.no_registrasi
          FROM lsb_1_serah_berkas lsb
          JOIN pat_1_bookingsspd pat ON lsb.nobooking = pat.nobooking
          WHERE lsb.status = 'Terselesaikan'
        `;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Kategori tidak valid. Gunakan: ppat-ltb, peneliti-lsb, atau lsb-ppat'
        });
    }
    
    // Add search filter if provided
    if (search) {
      const searchFilter = ` AND (pat.nobooking ILIKE $1 OR pat.namawajibpajak ILIKE $1 OR pat.no_registrasi ILIKE $1)`;
      countQuery += searchFilter;
      query += searchFilter;
      params.push(`%${search}%`);
    }
    
    // Get total count
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // If count_only is requested, return only count
    if (count_only === 'true') {
      return res.json({
        success: true,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    }
    
    // Get paginated data
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY ltb.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);
    
    const dataResult = await pool.query(query, params);
    
    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data: ' + error.message
    });
  }
});

/**
 * GET /api/admin/notification-warehouse/ppat-ltb/:no_registrasi
 * Mendapatkan detail notifikasi PPAT → LTB
 */
router.get('/ppat-ltb/:no_registrasi', async (req, res) => {
  try {
    const { no_registrasi } = req.params;
    
    const result = await pool.query(`
      SELECT 
        ltb.*,
        pat.nobooking,
        pat.namawajibpajak,
        pat.no_registrasi,
        pat.special_field,
        pat.ppatk_khusus,
        pat.noppbb,
        pat.jenis_wajib_pajak,
        pat.updated_at
      FROM ltb_1_terima_berkas_sspd ltb
      JOIN pat_1_bookingsspd pat ON ltb.nobooking = pat.nobooking
      WHERE pat.no_registrasi = $1
    `, [no_registrasi]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error fetching detail:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail: ' + error.message
    });
  }
});

/**
 * GET /api/admin/notification-warehouse/ping-history
 * Mendapatkan riwayat ping notifications
 */
router.get('/ping-history', async (req, res) => {
  try {
    const { page = 1, limit = 20, division } = req.query;
    
    let query = `
      SELECT 
        pn.*,
        pal.action,
        pal.details,
        pal.created_at as activity_time
      FROM ping_notifications pn
      LEFT JOIN ping_activity_log pal ON pn.id = pal.ping_id
      WHERE 1=1
    `;
    
    let params = [];
    
    if (division) {
      query += ` AND pn.target_divisions::text ILIKE $1`;
      params.push(`%${division}%`);
    }
    
    query += ` ORDER BY pn.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching ping history:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat ping: ' + error.message
    });
  }
});

/**
 * PUT /api/admin/notification-warehouse/ping/:id/acknowledge
 * Acknowledge ping notification
 */
router.put('/ping/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const { division, user_id } = req.body;
    
    // Update ping status
    await pool.query(`
      UPDATE ping_notifications 
      SET status = 'acknowledged', acknowledged_at = NOW()
      WHERE id = $1
    `, [id]);
    
    // Log activity
    await pool.query(`
      INSERT INTO ping_activity_log (ping_id, action, details, created_at)
      VALUES ($1, 'acknowledged', $2, NOW())
    `, [id, JSON.stringify({
      division,
      acknowledged_by: user_id || 'unknown'
    })]);
    
    res.json({
      success: true,
      message: 'Ping berhasil di-acknowledge'
    });
    
  } catch (error) {
    console.error('❌ Error acknowledging ping:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal acknowledge ping: ' + error.message
    });
  }
});

// Helper function untuk update ping status
async function updatePingStatus(pingId, status) {
  try {
    await pool.query(`
      UPDATE ping_notifications 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `, [status, pingId]);
  } catch (error) {
    console.error('❌ Error updating ping status:', error);
  }
}

module.exports = {
  router,
  initializeWebSocket
};
