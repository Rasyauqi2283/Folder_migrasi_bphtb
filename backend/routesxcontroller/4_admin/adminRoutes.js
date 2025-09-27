// backend/routesxcontroller/4_admin/adminRoutes.js
import express from 'express';
import { pool } from '../../../db.js';
import { sendEmail } from '../../services/emailservice.js';

const router = express.Router();

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
    await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.text, mailOptions.html);
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
    
    await sendEmail(mailOptions.to, mailOptions.subject, mailOptions.text, mailOptions.html);
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

export default router;
