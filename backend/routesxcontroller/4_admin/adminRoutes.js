// backend/routesxcontroller/4_admin/adminRoutes.js
import express from 'express';
import { pool } from '../../../db.js';
import { sendEmail, sendEmailSafe } from '../../services/emailservice.js';

const router = express.Router();

//== CASE URGENT ADMIN, PREVIEW KTP ==//
import { getSecureFile } from '../../config/secure_storage.js';
import { addWatermark } from '../../utils/watermark.js';

// Middleware untuk verifikasi admin
const verifyAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const userRole = String(req.session.user.divisi || '').trim();
  // Allow common admin role variants
  const allowed = new Set(['Admin', 'Administrator', 'Super Admin']);
  if (!allowed.has(userRole)) {
    return res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }

  next();
};

// GET /api/admin/test-pending-users - Test endpoint untuk debug
router.get('/test-pending-users', verifyAdmin, async (req, res) => {
  try {
    console.log('🔍 [TEST] Testing pending users endpoint...');
    
    // Test query untuk pending users
    const { rows } = await pool.query(`
      SELECT id, nama, email, foto, verifiedstatus, created_at 
      FROM a_2_verified_users 
      WHERE verifiedstatus = 'verified_pending'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log(`✅ [TEST] Found ${rows.length} pending users:`, rows);
    
    // Test secure storage untuk setiap user
    const testResults = [];
    for (const user of rows) {
      if (user.foto) {
        try {
          // Test apakah file secure storage ada
          const { SECURE_STORAGE_PATH } = await import('../../config/secure_storage.js');
          const path = (await import('path')).default;
          const fs = (await import('fs')).default;
          
          const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', user.email);
          const metadataPath = path.join(userDir, `${user.foto}_metadata.json`);
          const encryptedFilePath = path.join(userDir, `${user.foto}_encrypted.bin`);
          
          const hasMetadata = fs.existsSync(metadataPath);
          const hasEncryptedFile = fs.existsSync(encryptedFilePath);
          
          testResults.push({
            user: user.nama,
            email: user.email,
            fileId: user.foto,
            hasMetadata,
            hasEncryptedFile,
            secureStoragePath: userDir
          });
        } catch (error) {
          testResults.push({
            user: user.nama,
            email: user.email,
            fileId: user.foto,
            error: error.message
          });
        }
      }
    }
    
    return res.json({
      success: true,
      message: `Found ${rows.length} pending users`,
      data: rows,
      secureStorageTest: testResults,
      debug: {
        table: 'a_2_verified_users',
        status: 'verified_pending',
        count: rows.length
      }
    });
    
  } catch (error) {
    console.error('❌ [TEST] Error testing pending users:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// GET /api/admin/ktp-preview/:userId - Preview KTP dengan watermark dan audit log
router.get('/ktp-preview/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUser = req.session.user;

    console.log(`🔍 [ADMIN] KTP preview request by ${adminUser.nama} (${adminUser.userid}) for user ${userId}`);

    // 1. Ambil data KTP dari tabel verified_users dengan status verified_pending
    const { rows } = await pool.query(
      'SELECT foto, nama, email FROM a_2_verified_users WHERE id = $1 AND verifiedstatus = $2',
      [userId, 'verified_pending']
    );
    
    if (!rows.length || !rows[0].foto) {
      return res.status(404).json({ success: false, message: 'KTP tidak ditemukan' });
    }

    const userData = rows[0];
    console.log(`📄 [ADMIN] Found KTP for user: ${userData.nama} (${userData.email})`);

    // 2. Ambil file KTP terenkripsi dan dekripsi
    // userData.foto berisi fileId (UUID), userId adalah email dari form saat registrasi
    const secureFile = await getSecureFile(userData.foto, userData.email, 'admin', req);
    const buffer = secureFile.data;

    // 3. Tambahkan watermark dengan informasi admin
    const timestamp = new Date().toLocaleString('id-ID', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const wmText = `Akses Admin: ${adminUser.nama} | ${timestamp} | IP: ${req.ip}`;
    const watermarked = await addWatermark(buffer, wmText);

    // 4. Kirim image dengan header yang tepat
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="ktp_${userData.nama}_preview.png"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.send(watermarked);

    // 5. Catat log akses untuk audit trail
    try {
      await pool.query(
        'INSERT INTO log_file_access(admin_name, userid, ip, user_agent, access_time) VALUES($1, $2, $3, $4, NOW())',
        [
          adminUser.nama,
          userId,
          req.ip || req.connection.remoteAddress,
          req.headers['user-agent'] || 'Unknown'
        ]
      );
      console.log(`📝 [AUDIT] KTP access logged for admin ${adminUser.nama} viewing user ${userId}`);
    } catch (logError) {
      console.error('❌ [AUDIT] Failed to log KTP access:', logError);
      // Jangan gagal request jika logging gagal
    }

  } catch (error) {
    console.error('❌ [ADMIN] KTP preview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menampilkan KTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// Helper function untuk mengirim notifikasi email perubahan data user
async function sendUserUpdateNotificationEmail(userEmail, userName, userid, oldData, newData) {
  try {
    // Create email content showing what changed
    const changes = [];
    if (oldData.nama !== newData.nama) changes.push(`Nama: ${oldData.nama} → ${newData.nama}`);
    if (oldData.email !== newData.email) changes.push(`Email: ${oldData.email} → ${newData.email}`);
    if (oldData.telepon !== newData.telepon) changes.push(`Telepon: ${oldData.telepon || '-'} → ${newData.telepon || '-'}`);
    if (oldData.username !== newData.username) changes.push(`Username: ${oldData.username || '-'} → ${newData.username || '-'}`);
    if (oldData.nip !== newData.nip) changes.push(`NIP: ${oldData.nip || '-'} → ${newData.nip || '-'}`);
    if (oldData.divisi !== newData.divisi) changes.push(`Divisi: ${oldData.divisi} → ${newData.divisi}`);
    
    const changesText = changes.length > 0 ? changes.join('\n') : 'Tidak ada perubahan data';
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Notifikasi Perubahan Data User - E-BPHTB BAPPENDA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a6cf7; color: white; padding: 20px; text-align: center;">
            <h2>E-BPHTB BAPPENDA Kabupaten Bogor</h2>
            <p>Notifikasi Perubahan Data User</p>
          </div>
          
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3>Halo ${userName} (${userid})</h3>
            <p>Data profil Anda telah diperbarui oleh administrator sistem.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #4a6cf7; margin-top: 0;">Detail Perubahan:</h4>
              <pre style="background-color: #f8f9fa; padding: 10px; border-radius: 3px; white-space: pre-wrap;">${changesText}</pre>
            </div>
            
            <p>Jika Anda tidak melakukan perubahan ini atau ada kesalahan, silakan hubungi administrator sistem.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                Email ini dikirim otomatis oleh sistem E-BPHTB BAPPENDA Kabupaten Bogor.<br>
                Jangan balas email ini.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    // Send email using existing email configuration
    await sendEmailSafe(mailOptions);
    console.log(`✅ Email notification sent to ${userEmail} for user ${userid}`);
    
  } catch (error) {
    console.error('Error sending user update notification email:', error);
    throw error;
  }
}

// Send dedicated email for status_ppat changes (skip for 'meninggal')
async function sendUserStatusChangeEmail(userEmail, userName, userid, newStatus) {
  try {
    // Skip sending for 'meninggal'
    if (String(newStatus).toLowerCase() === 'meninggal') {
      console.log(`Skip email for status 'meninggal' for ${userid}`);
      return;
    }
    
    const subjectMap = {
      'aktif': 'Status Akun PPAT Anda Telah Diaktifkan',
      'non-aktif': 'Status Akun PPAT Anda Dinonaktifkan',
      'Pindah Kerja': 'Status Akun PPAT Anda: Pindah Kerja'
    };
    const subject = subjectMap[newStatus] || 'Perubahan Status Akun PPAT';
    
    const messageMap = {
      'aktif': 'Akun Anda telah diaktifkan kembali. Anda dapat mengakses sistem seperti biasa.',
      'non-aktif': 'Akun Anda saat ini dinonaktifkan. Hubungi admin jika ini tidak sesuai.',
      'Pindah Kerja': 'Status akun Anda tercatat Pindah Kerja. Hubungi admin untuk informasi lebih lanjut.'
    };
    const infoText = messageMap[newStatus] || `Status akun Anda diperbarui menjadi: ${newStatus}.`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4a6cf7; color: white; padding: 20px; text-align: center;">
            <h2>E-BPHTB BAPPENDA Kabupaten Bogor</h2>
            <p>Pemberitahuan Perubahan Status Akun</p>
          </div>
          <div style="padding: 20px; background-color: #f8f9fa;">
            <h3>Halo ${userName} (${userid})</h3>
            <p>${infoText}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #6c757d; font-size: 14px;">
                Email ini dikirim otomatis oleh sistem E-BPHTB BAPPENDA Kabupaten Bogor.<br>
                Jangan balas email ini.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await sendEmailSafe(mailOptions);
    console.log(`✅ Status change email sent to ${userEmail}`);
    
  } catch (e) {
    console.error('Error sending status change email:', e);
  }
}

// ===== ADMIN USER MANAGEMENT ENDPOINTS =====

// PUT /api/admin/users/:userid - Update user data with email notification
router.put('/users/:userid', async (req, res) => {
  const { userid } = req.params;
  const { nama, email, telepon, username, nip, divisi } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current user data for comparison
    const currentUserQuery = await client.query(
      'SELECT nama, email, telepon, username, nip, divisi, status_ppat FROM a_2_verified_users WHERE userid = $1',
      [userid]
    );
    
    if (currentUserQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    const currentUser = currentUserQuery.rows[0];
    
    // Update user data
    const updateQuery = `
      UPDATE a_2_verified_users 
      SET nama = $1, email = $2, telepon = $3, username = $4, nip = $5, divisi = $6
      WHERE userid = $7
      RETURNING *
    `;
    
    const updateResult = await client.query(updateQuery, [
      nama, email, telepon, username, nip, divisi, userid
    ]);
    
    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ success: false, message: 'Gagal mengupdate data' });
    }
    
    const updatedUser = updateResult.rows[0];
    
    // Send email notification to user about the changes
    try {
      await sendUserUpdateNotificationEmail(
        updatedUser.email,
        updatedUser.nama,
        userid,
        currentUser,
        { nama, email, telepon, username, nip, divisi }
      );
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the update if email fails
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: 'Data user berhasil diupdate',
      user: updatedUser
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengupdate data' 
    });
  } finally {
    client.release();
  }
});

// PUT /api/admin/users/:userid/status-ppat - Update PPAT status (Admin only)
router.put('/users/:userid/status-ppat', async (req, res) => {
  const { userid } = req.params;
  const { status_ppat } = req.body;

  const allowed = ['aktif', 'non-aktif', 'meninggal', 'Pindah Kerja'];
  if (!allowed.includes(status_ppat)) {
    return res.status(400).json({ success: false, message: 'status_ppat tidak valid' });
  }

  if (!req.session.user || req.session.user.divisi !== 'Administrator') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query(
      `SELECT userid, divisi FROM a_2_verified_users WHERE userid = $1`, [userid]
    );
    if (check.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    const divisi = String(check.rows[0].divisi || '').toLowerCase();
    if (!(divisi === 'ppat' || divisi === 'ppats')) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Hanya untuk user divisi PPAT/PPATS' });
    }

    const upd = await client.query(
      `UPDATE a_2_verified_users SET status_ppat = $1 WHERE userid = $2 RETURNING userid, status_ppat, email, nama`,
      [status_ppat, userid]
    );
    await client.query('COMMIT');
    
    // Fire-and-forget email (skip for 'meninggal')
    try {
      await sendUserStatusChangeEmail(upd.rows[0].email, upd.rows[0].nama, userid, status_ppat);
    } catch (e) {
      console.warn('sendUserStatusChangeEmail failed:', e?.message);
    }
    
    return res.json({ success: true, user: upd.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('update status_ppat error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/admin/users/:userid - Get user data by userid
router.get('/users/:userid', async (req, res) => {
  const { userid } = req.params;
  
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query(
      'SELECT userid, nama, email, telepon, username, nip, divisi, nik, status_ppat FROM a_2_verified_users WHERE userid = $1',
      [userid]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mengambil data user' 
    });
  }
});

// Admin: status PPAT - daftar notifikasi pengiriman LTB->Peneliti dan LSB->PPAT/PPATS
router.get('/status-ppat/notifications', verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const lim = Math.min(parseInt(limit) || 20, 100);
        const off = (parseInt(page) - 1) * lim;
        // Ambil dari ltb_1_terima_berkas_sspd (ke Peneliti) dan lsb_1_serah_berkas (ke PPAT)
        // Diperkaya dengan data user dan booking
        const ltb = await pool.query(
            `SELECT l.nobooking, b.noppbb, b.namawajibpajak, b.namapemilikobjekpajak, b.jenis_wajib_pajak,
                    l.userid, u.special_field, u.ppatk_khusus,
                    l.status, l.trackstatus, l.updated_at,
                    'LTB' AS source
             FROM ltb_1_terima_berkas_sspd l
             LEFT JOIN pat_1_bookingsspd b ON b.nobooking = l.nobooking
             LEFT JOIN a_2_verified_users u ON u.userid = b.userid
             WHERE l.status = 'Diolah' AND l.trackstatus = 'Diterima' AND u.divisi IN ('PPAT', 'PPATS')
             ORDER BY l.updated_at DESC NULLS LAST
             LIMIT $1 OFFSET $2`,
            [lim, off]
        );
        const lsb = await pool.query(
            `SELECT s.nobooking, b.noppbb, b.namawajibpajak, b.namapemilikobjekpajak, b.jenis_wajib_pajak,
                    s.userid, u.special_field, u.ppatk_khusus,
                    s.status, s.trackstatus, s.updated_at,
                    'LSB' AS source
             FROM lsb_1_serah_berkas s
             LEFT JOIN pat_1_bookingsspd b ON b.nobooking = s.nobooking
             LEFT JOIN a_2_verified_users u ON u.userid = s.userid
             WHERE s.status = 'Terselesaikan' AND s.trackstatus = 'Siap Diserahkan' AND u.divisi IN ('PPAT', 'PPATS')
             ORDER BY s.updated_at DESC NULLS LAST
             LIMIT $1 OFFSET $2`,
            [lim, off]
        );
        let rows = [...ltb.rows, ...lsb.rows];
        if (typeof status === 'string' && status.length) {
            const s = status.toLowerCase();
            rows = rows.filter(r => String(r.status||'').toLowerCase() === s);
        }
        return res.json({ success:true, page: parseInt(page), limit: lim, rows });
    } catch (e) {
        console.error('admin status-ppat notifications error:', e);
        return res.status(500).json({ success:false, message:'Internal server error' });
    }
});

// Admin: daftar PPAT/PPATS by status (aktif/nonaktif/meninggal/dll)
router.get('/status-ppat/users', verifyAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, q: search } = req.query;
        const lim = Math.min(parseInt(limit) || 20, 100);
        const off = (parseInt(page) - 1) * lim;
        const statuses = Array.isArray(status) ? status : (status ? [status] : []);
        const where = ["lower(divisi) IN ('ppat','ppats')"]; 
        const params = [];
        if (statuses.length) {
            where.push(`lower(COALESCE(status_ppat, verifiedstatus, 'aktif')) = ANY($${params.length+1}::text[])`);
            params.push(statuses.map(s=>String(s).toLowerCase()));
        }
        if (search && String(search).trim().length) {
            params.push(`%${String(search).trim().toLowerCase()}%`);
            where.push(`(lower(userid) LIKE $${params.length} OR lower(nama) LIKE $${params.length})`);
        }
        params.push(lim, off);
        const sql = `
            SELECT id, userid, nama, divisi, COALESCE(status_ppat, verifiedstatus, 'aktif') AS status,
                   ppatk_khusus, special_field
            FROM a_2_verified_users
            WHERE ${where.join(' AND ')}
            ORDER BY nama ASC
            LIMIT $${params.length-1} OFFSET $${params.length}
        `;
        const rows = await pool.query(sql, params);
        return res.json({ success:true, page: parseInt(page), limit: lim, rows: rows.rows });
    } catch (e) {
        console.error('admin status-ppat users error:', e);
        return res.status(500).json({ success:false, message:'Internal server error' });
    }
});

// Admin: detail user PPAT + daftar nobooking Diserahkan (dipakai oleh admin-datauser-pemutakhiranppat.html)
router.get('/ppat/user/:userid/diserahkan', verifyAdmin, async (req, res) => {
    try {
      const userid = String(req.params.userid || '').trim();
      if (!userid) return res.status(400).json({ success:false, message:'userid wajib' });
  
      // Ambil data user
      const userRes = await pool.query(
        `SELECT id, userid, nama, divisi, ppatk_khusus, special_field, pejabat_umum, fotoprofil
         FROM a_2_verified_users
         WHERE userid = $1 LIMIT 1`, [userid]
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({ success:false, message:'User tidak ditemukan' });
      }
  
      // Ambil daftar booking
      const bookings = await pool.query(
        `SELECT b.bookingid, b.nobooking, b.noppbb, b.tanggal, b.tahunajb, b.namawajibpajak, b.namapemilikobjekpajak,
                b.npwpwp, b.trackstatus, b.file_withstempel_path, b.jenis_wajib_pajak, p2.bphtb_yangtelah_dibayar,
                u.nama as nama_ppat, u.ppatk_khusus, u.special_field, u.pejabat_umum, u.fotoprofil, u.userid
         FROM pat_1_bookingsspd b
         LEFT JOIN a_2_verified_users u ON u.userid = b.userid
         LEFT JOIN pat_2_bphtb_perhitungan p2 ON b.nobooking = p2.nobooking
         WHERE b.userid = $1 AND b.trackstatus = 'Diserahkan'`, [userid]
      );
  
      // Ambil summary count + sum
      const summaryRes = await pool.query(
        `SELECT COUNT(*)::int as total_booking,
                COALESCE(SUM(p2.bphtb_yangtelah_dibayar),0)::bigint as total_nilai
         FROM pat_1_bookingsspd b
         LEFT JOIN pat_2_bphtb_perhitungan p2 ON b.nobooking = p2.nobooking
         WHERE b.userid = $1 AND b.trackstatus = 'Diserahkan'`, [userid]
      );
  
      return res.json({
        success: true,
        user: userRes.rows[0],
        rows: bookings.rows,
        summary: summaryRes.rows[0]   // <-- tambahkan summary
      });
    } catch (e) {
      console.error('admin ppat user diserahkan error:', e);
      return res.status(500).json({ success:false, message:'Internal server error' });
    }
});

// ===== QR CODE VALIDATION ENDPOINTS =====

// GET /api/admin/validate-qr/:no_validasi - Validasi nomor validasi QR code
router.get('/validate-qr/:no_validasi', verifyAdmin, async (req, res) => {
  try {
    const { no_validasi } = req.params;
    const adminUser = req.session.user;

    console.log(`🔍 [ADMIN] QR validation request by ${adminUser.nama} (${adminUser.userid}) for no_validasi: ${no_validasi}`);

    // Validasi format no_validasi (harus alfanumerik dan tidak kosong)
    if (!no_validasi || typeof no_validasi !== 'string' || no_validasi.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nomor validasi tidak valid' 
      });
    }

    // Query untuk mendapatkan data validasi lengkap
    const validationQuery = `
      SELECT 
        pv.no_validasi,
        pv.nobooking,
        pv.no_registrasi,
        pv.namawajibpajak,
        pv.namapemilikobjekpajak,
        pv.status,
        pv.trackstatus,
        pv.status_tertampil,
        pv.keterangan,
        pv.created_at,
        pv.updated_at,
        pv.tanda_tangan_validasi_path,
        -- Data booking
        pb.noppbb,
        pb.tanggal,
        pb.tahunajb,
        pb.npwpwp,
        pb.trackstatus as booking_trackstatus,
        pb.file_withstempel_path,
        pb.pdf_dokumen_path,
        -- Data user PPAT
        vu.nama as ppat_nama,
        vu.special_field as ppat_special_field,
        vu.divisi as ppat_divisi,
        -- Data peneliti validasi
        avpv.nama as peneliti_nama,
        avpv.special_parafv as peneliti_special_parafv,
        avpv.nip as peneliti_nip
      FROM pv_1_paraf_validate pv
      LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
      LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
      LEFT JOIN a_2_verified_users avpv ON avpv.tanda_tangan_path = pv.tanda_tangan_validasi_path
      WHERE pv.no_validasi = $1
      LIMIT 1
    `;

    const result = await pool.query(validationQuery, [no_validasi.trim()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nomor validasi tidak ditemukan dalam sistem',
        no_validasi: no_validasi
      });
    }

    const validationData = result.rows[0];

    // Catat log akses validasi untuk audit trail
    try {
      await pool.query(
        'INSERT INTO log_file_access(admin_name, userid, ip, user_agent, access_time) VALUES($1, $2, $3, $4, NOW())',
        [
          adminUser.nama,
          `QR_VALIDATION_${no_validasi}`,
          req.ip || req.connection.remoteAddress,
          req.headers['user-agent'] || 'Unknown'
        ]
      );
      console.log(`📝 [AUDIT] QR validation logged for admin ${adminUser.nama} validating ${no_validasi}`);
    } catch (logError) {
      console.error('❌ [AUDIT] Failed to log QR validation access:', logError);
      // Jangan gagal request jika logging gagal
    }

    // Format response dengan informasi keaslian
    const response = {
      success: true,
      message: 'Nomor validasi ini asli sesuai ketentuan BAPPENDA Kabupaten Bogor',
      validation_info: {
        no_validasi: validationData.no_validasi,
        status: validationData.status,
        trackstatus: validationData.trackstatus,
        status_tertampil: validationData.status_tertampil,
        keterangan: validationData.keterangan,
        created_at: validationData.created_at,
        updated_at: validationData.updated_at
      },
      document_info: {
        nobooking: validationData.nobooking,
        no_registrasi: validationData.no_registrasi,
        noppbb: validationData.noppbb,
        tanggal: validationData.tanggal,
        tahunajb: validationData.tahunajb,
        namawajibpajak: validationData.namawajibpajak,
        namapemilikobjekpajak: validationData.namapemilikobjekpajak,
        npwpwp: validationData.npwpwp,
        booking_trackstatus: validationData.booking_trackstatus
      },
      ppat_info: {
        nama: validationData.ppat_nama,
        special_field: validationData.ppat_special_field,
        divisi: validationData.ppat_divisi
      },
      peneliti_info: {
        nama: validationData.peneliti_nama,
        special_parafv: validationData.peneliti_special_parafv,
        nip: validationData.peneliti_nip
      },
      authenticity: {
        verified: true,
        verified_by: adminUser.nama,
        verified_at: new Date().toISOString(),
        verification_method: 'QR_CODE_VALIDATION',
        institution: 'BAPPENDA Kabupaten Bogor'
      }
    };

    console.log(`✅ [ADMIN] QR validation successful for ${no_validasi} by ${adminUser.nama}`);
    return res.json(response);

  } catch (error) {
    console.error('❌ [ADMIN] QR validation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat memvalidasi nomor validasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/admin/validate-qr-search - Search validasi dengan filter
router.get('/validate-qr-search', verifyAdmin, async (req, res) => {
  try {
    const { q: search, page = 1, limit = 20, status } = req.query;
    const adminUser = req.session.user;
    const lim = Math.min(parseInt(limit) || 20, 100);
    const off = (parseInt(page) - 1) * lim;

    console.log(`🔍 [ADMIN] QR search request by ${adminUser.nama} - search: "${search}", status: "${status}"`);

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filter berdasarkan pencarian
    if (search && search.trim().length > 0) {
      paramCount++;
      whereConditions.push(`(
        pv.no_validasi ILIKE $${paramCount} OR 
        pv.nobooking ILIKE $${paramCount} OR 
        pv.namawajibpajak ILIKE $${paramCount} OR
        pv.namapemilikobjekpajak ILIKE $${paramCount} OR
        pb.noppbb ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search.trim()}%`);
    }

    // Filter berdasarkan status
    if (status && status.trim().length > 0) {
      paramCount++;
      whereConditions.push(`pv.status = $${paramCount}`);
      queryParams.push(status.trim());
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query utama
    const searchQuery = `
      SELECT 
        pv.no_validasi,
        pv.nobooking,
        pv.namawajibpajak,
        pv.namapemilikobjekpajak,
        pv.status,
        pv.trackstatus,
        pv.status_tertampil,
        pv.created_at,
        pv.updated_at,
        pb.noppbb,
        pb.tanggal,
        pb.tahunajb,
        vu.nama as ppat_nama,
        vu.special_field as ppat_special_field
      FROM pv_1_paraf_validate pv
      LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
      LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
      ${whereClause}
      ORDER BY pv.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(lim, off);
    const result = await pool.query(searchQuery, queryParams);

    // Query untuk total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM pv_1_paraf_validate pv
      LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
      LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
      ${whereClause}
    `;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    const countResult = await pool.query(countQuery, countParams);

    const response = {
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total: parseInt(countResult.rows[0].total),
        total_pages: Math.ceil(countResult.rows[0].total / lim)
      },
      search_params: {
        search: search || '',
        status: status || '',
        admin: adminUser.nama
      }
    };

    console.log(`✅ [ADMIN] QR search completed - found ${result.rows.length} results`);
    return res.json(response);

  } catch (error) {
    console.error('❌ [ADMIN] QR search error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan saat mencari data validasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
