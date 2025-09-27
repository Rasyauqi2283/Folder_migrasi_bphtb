import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import { promises as fs } from 'fs';
import { pool } from '../../../db.js';
import { ttdVerifMiddleware } from '../../config/uploads/upload_ttdverif.js';
import { uploadProfile, processImage } from '../../config/uploads/upload_profpicture.js';

const router = express.Router();

// Patch 1 (check  ✔️)
// Endpoint untuk mendapatkan data profil pengguna
router.get('/profile', async (req, res) => {
    console.log('🔍 Profile API called:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasUser: !!req.session?.user,
        cookies: req.headers.cookie
    });
    
    if (!req.session.user) {
        console.log('❌ No user in session');
        return res.status(401).json({ 
            success: false,
            message: 'User belum login.',
            error: 'UNAUTHORIZED'
        });
    }
    
    try {
        let user = {
            userid: req.session.user.userid,
            nama: req.session.user.nama,
            email: req.session.user.email,
            telepon: req.session.user.telepon,
            divisi: req.session.user.divisi,
            fotoprofil: req.session.user.fotoprofil,
            username: req.session.user.username,
            nip: req.session.user.nip,
            special_field: req.session.user.special_field,
            special_parafv: req.session.user.special_parafv,
            pejabat_umum: req.session.user.pejabat_umum,
            statuspengguna: req.session.user.statuspengguna,
            tanda_tangan_path: req.session.user.tanda_tangan_path,
            tanda_tangan_mime: req.session.user.tanda_tangan_mime
        };
        
        // Jika data penting tidak ada, ambil dari DB
        if (!user.nama || !user.email) {
            const dbUser = await pool.query(
                'SELECT * FROM a_2_verified_users WHERE userid = $1',
                [user.userid]
            );
            if (dbUser.rows[0]) {
                user = { ...user, ...dbUser.rows[0] }; // Gabungkan data
                req.session.user = user; // Update session
            }
        }

        // Pastikan semua field memiliki nilai default jika null/undefined
        const responseData = {
            userid: user.userid || null,
            nama: user.nama || 'N/A',
            email: user.email || null,
            telepon: user.telepon || null,
            divisi: user.divisi || null,
            fotoprofil: user.fotoprofil || '/penting_F_simpan/profile-photo/default-foto-profile.png',
            username: user.username || null,
            nip: user.nip || null,
            special_field: user.special_field || null,
            special_parafv: user.special_parafv || null,
            pejabat_umum: user.pejabat_umum || null,
            statuspengguna: user.statuspengguna || 'offline',
            tanda_tangan_path: user.tanda_tangan_path || null,
            tanda_tangan_mime: user.tanda_tangan_mime || null
        };

        res.json({
            success: true,
            ...responseData
        });
        
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal memuat profil',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Patch 2 (check  ✔️)
// Endpoint untuk update tanda tangan
router.post('/update-profile-paraf', 
  ttdVerifMiddleware,
  async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userDivisi = req.session?.user?.divisi;
        // Validasi session dan divisi
        const allowedDivisi = ['Peneliti', 'Peneliti Validasi', 'PPAT', 'PPATS'];
        if (!req.session.user || !allowedDivisi.includes(userDivisi)) {
          return res.status(403).json({ 
            success: false, 
            message: 'Hanya divisi Tertentu yang boleh upload tanda tangan' 
          });
        }

        if (!req.processedTTD) {
          return res.status(400).json({ 
            success: false, 
            message: 'File tanda tangan wajib diupload' 
          });
        }
        // Tidak perlu hapus manual: nama file sama (overwrite). Pastikan folder ada.

        // Update database
        const updateQuery = `
          UPDATE a_2_verified_users 
          SET 
            tanda_tangan_path = $1, tanda_tangan_mime = $2
          WHERE userid = $3
          RETURNING tanda_tangan_path, tanda_tangan_mime
        `;
        const result = await pool.query(updateQuery, [
          req.processedTTD.url,
          req.processedTTD.mimeType,
          req.session.user.userid
        ]);

        // Update session
        req.session.user.tanda_tangan_path = result.rows[0].tanda_tangan_path;
        req.session.user.tanda_tangan_mime = result.rows[0].tanda_tangan_mime;
        await client.query('COMMIT');
        res.json({ 
          success: true,
          message: 'Tanda tangan berhasil diupload',
          data: {
            path: req.processedTTD.url,
            mimeType: req.processedTTD.mimeType,
            size_kb: Math.round(req.processedTTD.size / 1024)
          }
        });
    } catch (error) {
        await client.query('ROLLBACK');
      console.error('[TTD UPLOAD ERROR]', error);
      res.status(500).json({ 
        success: false, 
        message: 'Gagal mengupload tanda tangan',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
);

// Hapus tanda tangan yang sudah tersimpan
router.delete('/update-profile-paraf', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!req.session.user) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userId = req.session.user.userid;
    const result = await client.query(
      'SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1',
      [userId]
    );
    const currentPath = result.rows[0]?.tanda_tangan_path;

    // Hapus file di disk jika ada
    if (currentPath) {
      try {
        const fullPath = path.join(process.cwd(), 'public', currentPath);
        await fs.unlink(fullPath).catch(() => {});
      } catch (e) {
        // ignore
      }
    }

    await client.query(
      'UPDATE a_2_verified_users SET tanda_tangan_path = NULL, tanda_tangan_mime = NULL WHERE userid = $1',
      [userId]
    );

    // Update session
    req.session.user.tanda_tangan_path = null;
    req.session.user.tanda_tangan_mime = null;

    await client.query('COMMIT');
    return res.json({ success: true, message: 'Tanda tangan direset' });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, message: 'Gagal mereset tanda tangan' });
  } finally {
    client.release();
  }
});

// Patch 3 (check  ✔️)
// Endpoint untuk mendapatkan file tanda tangan
router.get('/tanda-tangan/:userid', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tanda_tangan_path, tanda_tangan_mime 
       FROM a_2_verified_users WHERE userid = $1`,
      [req.params.userid]
    );

    if (!result.rows[0]?.tanda_tangan_path) {
      return res.status(404).json({ message: 'Tanda tangan tidak ditemukan' });
    }

    const filePath = path.join(
      process.cwd(),
      'public',
      result.rows[0].tanda_tangan_path
    );

    // Cek apakah file ada
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'File tanda tangan tidak ditemukan' });
    }

    // Set header dan stream file
    res.setHeader('Content-Type', result.rows[0].tanda_tangan_mime);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 hari
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil tanda tangan' });
  }
});
//

// Patch 4 (check  ✔️)
// Tambahan: cek tanda tangan peneliti (digunakan di frontend)
router.get('/peneliti/check-signature', async (req, res) => {
  if (!req.session.user) {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  try {
    const result = await pool.query(
      `SELECT tanda_tangan_path IS NOT NULL AS has_signature 
       FROM a_2_verified_users 
       WHERE userid = $1`,
      [req.session.user.userid]
    );
    res.status(200).json({
      success: true,
      has_signature: result.rows[0]?.has_signature || false
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memeriksa tanda tangan.' });
  }
});

// Tambahan: get tanda tangan user (khusus peneliti untuk verifikasi)
router.get('/get-tanda-tangan', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
  }
  const { userid, divisi } = req.session.user;
  if (divisi !== 'Peneliti') {
    return res.status(403).json({ success: false, message: 'Hanya divisi Peneliti yang dapat mengakses tanda tangan' });
  }
  try {
    const query = `
      SELECT tanda_tangan_path, tanda_tangan_mime
      FROM a_2_verified_users 
      WHERE userid = $1 AND divisi = 'Peneliti'
    `;
    const result = await pool.query(query, [userid]);
    const row = result.rows[0];
    const hasSignature = !!(row && row.tanda_tangan_path);
    return res.json({
      success: true,
      has_signature: hasSignature,
      tanda_tangan_path: row?.tanda_tangan_path || null,
      tanda_tangan_mime: row?.tanda_tangan_mime || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memeriksa tanda tangan' });
  }
});

// Patch 5 (check  ✔️)
// Endpoint untuk upload foto profil
router.post('/profile/upload', 
  uploadProfile.single('fotoprofil'),
  processImage,
  async (req, res) => {
    const client = await pool.connect(); // Gunakan client yang sama untuk transaksi
    try {
      await client.query('BEGIN'); // Mulai transaksi

      // 1. Dapatkan path foto lama dari database
      const oldPhoto = await client.query(
        'SELECT fotoprofil FROM a_2_verified_users WHERE userid = $1',
        [req.session.user.userid]
      );
      const oldPhotoPath = oldPhoto.rows[0]?.fotoprofil;

      // 2. Update database dengan path baru (nama file unik dengan timestamp)
      const newFotoPath = '/penting_F_simpan/profile-photo/' + req.file.filename;
      await client.query(
        'UPDATE a_2_verified_users SET fotoprofil = $1 WHERE userid = $2',
        [newFotoPath, req.session.user.userid]
      );

      // 3. Hapus file lama JIKA BUKAN DEFAULT (aman: abaikan jika sudah dihapus di storage)
      if (oldPhotoPath && !oldPhotoPath.includes('default-foto-profile')) {
        const fullOldPath = path.join(process.cwd(), 'public', oldPhotoPath);
        await fs.unlink(fullOldPath).catch(() => {});
      }

      await client.query('COMMIT'); // Commit transaksi

      // 4. Update session
      req.session.user.fotoprofil = newFotoPath;

      res.json({ 
        success: true,
        message: 'Foto profil berhasil diperbarui.',
        foto_path: newFotoPath,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback jika error
      
      // Hapus file yang baru diupload jika gagal
      if (req.file?.path) {
        await fs.unlink(req.file.path).catch(console.warn);
      }

      res.status(500).json({ 
        success: false, 
        message: 'Gagal update foto profil',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    } finally {
      client.release(); // Lepas client
    }
  }
);

// Patch 6 (check  ✔️)
// Endpoint untuk update password
import rateLimit from 'express-rate-limit';

// Tambahkan rate limiting (5x percobaan per 15 menit)
const updatePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  message: 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.'
});

router.post('/update-password', updatePasswordLimiter, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  // Validasi password baru
  if (newPassword.length < 8) {
    return res.status(400).json({ 
      success: false,
      message: 'Password minimal 8 karakter' 
    });
  }

  if (newPassword === oldPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'Password baru tidak boleh sama dengan password lama' 
    });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Verifikasi password lama
      const dbUser = await client.query(
        'SELECT password FROM a_2_verified_users WHERE userid = $1',
        [req.session.user.userid]
      );
      const match = await bcrypt.compare(oldPassword, dbUser.rows[0].password);
      if (!match) {
        return res.status(400).json({ 
          success: false,
          message: 'Password lama salah' 
        });
      }

      // 2. Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 3. Update database
      await client.query(
        'UPDATE a_2_verified_users SET password = $1 WHERE userid = $2',
        [hashedNewPassword, req.session.user.userid]
      );

      await client.query('COMMIT');

      // 4. Update session (pastikan di-hash)
      req.session.user.password = hashedNewPassword;

      res.json({ 
        success: true,
        message: 'Password berhasil diperbarui' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Gagal memperbarui password' 
    });
  }
});

// Debug endpoint untuk reset password (hanya untuk development)
router.post('/reset-password-debug', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      success: false, 
      message: 'Endpoint ini hanya tersedia di development' 
    });
  }

  const { userid, newPassword } = req.body;
  
  if (!userid || !newPassword) {
    return res.status(400).json({ 
      success: false,
      message: 'UserID dan password baru wajib diisi' 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await pool.query(
      'UPDATE a_2_verified_users SET password = $1 WHERE userid = $2',
      [hashedPassword, userid]
    );

    res.json({ 
      success: true,
      message: `Password untuk user ${userid} berhasil direset`,
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal reset password' 
    });
  }
});
// Start Member endpoint //
router.get('/members-header', async (req, res) => {
  // Pastikan user sudah login dan session ada
  if (!req.session.user) {
      return res.status(401).json({ message: 'User not logged in' });
  }

  try {
      const { divisi } = req.session.user; // Ambil divisi dari session user

      const query = 'SELECT fotoprofil, nama, statuspengguna, username FROM a_2_verified_users WHERE divisi = $1';
      const result = await pool.query(query, [divisi]);

      const usersm = result.rows.map(row => ({
          fotoprofil: row.fotoprofil,
          nama: row.nama,
          statuspengguna: row.statuspengguna,
          username: row.username
      }));

      res.json({ usersm });
  } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Failed to fetch members' });
  }
});
// End Member endpoint //

export default router;