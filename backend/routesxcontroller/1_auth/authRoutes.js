import express from 'express';
import bcrypt from 'bcrypt';
import { secureUploadKTP, processKTPUpload } from '../../config/uploads/secure_upload_ktp.js';
import { pool } from '../../../db.js';
import { generateOTP, sendOTP, sendOTPWithRetry, sendOTPAsync } from '../../services/emailservice.js';

const router = express.Router();

// 1. Login endpoint
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Cari user berdasarkan userid ATAU username
    const query = `
        SELECT 
            userid, password, nama, email, divisi, 
            fotoprofil, statuspengguna, verifiedstatus,
            username, nip, special_field, special_parafv, pejabat_umum,
            tanda_tangan_mime, tanda_tangan_path, telepon, gender
        FROM a_2_verified_users 
        WHERE (email = $1 OR userid = $1 OR username = $1)
        AND verifiedstatus = 'complete'
    `;
    const result = await client.query(query, [identifier]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'UserID/Username tidak ditemukan atau belum terverifikasi.' 
      });
    }

    // Verifikasi password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Password salah.' 
      });
    }

    // Cek kelengkapan profil berdasarkan divisi
    let isProfileComplete = false;
    if (user.divisi === 'Wajib Pajak') {
      isProfileComplete = !!user.username;
    } else if (user.divisi === 'PPAT' || user.divisi === 'PPATS') {
      isProfileComplete = !!user.username && !!user.special_field && !!user.pejabat_umum;
    } else if (user.divisi === 'Peneliti Validasi') {
      isProfileComplete = !!user.username && !!user.nip && !!user.special_parafv;
    } else {
      isProfileComplete = !!user.nip && !!user.username;
    }

    // Update status & last_active jadi online saat login
    await client.query(
      `UPDATE a_2_verified_users 
       SET statuspengguna = $1, last_active = NOW() 
       WHERE userid = $2`,
      ['online', user.userid]
    );

    await client.query('COMMIT');

    // Simpan data user di session
    req.session.user = {
      userid: user.userid,
      divisi: user.divisi,
      nama: user.nama,
      email: user.email,
      telepon: user.telepon,
      fotoprofil: user.fotoprofil,
      username: user.username,
      nip: user.nip,
      special_field: user.special_field,
      special_parafv: user.special_parafv,
      pejabat_umum: user.pejabat_umum,
      is_profile_complete: isProfileComplete,
      statuspengguna: user.statuspengguna,
      tanda_tangan_mime: user.tanda_tangan_mime,
      tanda_tangan_path: user.tanda_tangan_path,
      gender: user.gender
    };

    console.log('🍪 Session saved:', {
      sessionID: req.sessionID,
      hasUser: !!req.session.user,
      userid: req.session.user.userid
    });

    // Debug cookie settings
    console.log('🍪 Cookie settings:', {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
      sameSite: 'lax'
    });

    // Kirim response ke frontend
    res.status(200).json({
      success: true,
      message: `Login berhasil, ${user.username || user.userid}!`,
      userid: user.userid,
      divisi: user.divisi,
      nama: user.nama,
      email: user.email,
      telepon: user.telepon,
      foto: user.fotoprofil,
      username: user.username,
      nip: user.nip,
      special_field: user.special_field,
      special_parafv: user.special_parafv,
      pejabat_umum: user.pejabat_umum,
      is_profile_complete: isProfileComplete,
      statuspengguna: user.statuspengguna,
      tanda_tangan_mime: user.tanda_tangan_mime,
      tanda_tangan_path: user.tanda_tangan_path,
      gender: user.gender
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saat login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server.' 
    });
  } finally {
    client.release();
  }
});

// Middleware untuk menangani multer errors
const handleMulterError = (err, req, res, next) => {
  console.error('🔒 [MULTER_ERROR] Multer error occurred:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File KTP terlalu besar. Maksimal 3MB diperbolehkan.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Hanya satu file KTP yang diperbolehkan.'
    });
  }
  
  if (err.message === 'INVALID_MIME_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Format file tidak didukung. Hanya JPEG dan PNG yang diperbolehkan.'
    });
  }
  
  if (err.message === 'INVALID_FILE_EXTENSION') {
    return res.status(400).json({
      success: false,
      message: 'Ekstensi file tidak valid. Gunakan .jpg, .jpeg, atau .png'
    });
  }
  
  if (err.message === 'FILE_VALIDATION_ERROR') {
    return res.status(400).json({
      success: false,
      message: 'File KTP gagal validasi. Silakan coba dengan file lain.'
    });
  }
  
  // Default multer error
  return res.status(400).json({
    success: false,
    message: 'File KTP gagal diupload. Silakan coba lagi dengan file yang lebih kecil atau format yang berbeda.'
  });
};

// 2. Register endpoint (check ✔)
router.post('/register', secureUploadKTP.single('fotoktp'), handleMulterError, processKTPUpload, async (req, res) => {
  const { nama, nik, telepon, email, password, gender } = req.body;
  const secureFile = req.secureFile;  // File yang sudah dienkripsi

  console.log(`📧 [REGISTER] Processing registration for: ${email}`);
  console.log(`📁 [REGISTER] Secure file info:`, {
    hasSecureFile: !!secureFile,
    fileId: secureFile?.fileId,
    userEmail: email
  });

  // Validasi input
  if (!nama || !nik || !telepon || !email || !password || !gender || !secureFile) {
    return res.status(400).json({ 
      success: false,
      message: 'Semua data harus diisi dengan benar' 
    });
  }

  // Validasi gender
  const validGenders = ['Perempuan', 'Laki-laki'];
  if (!validGenders.includes(gender)) {
    return res.status(400).json({ 
      success: false,
      message: 'Pilihan gender tidak valid' 
    });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Format email tidak valid' 
    });
  }

  // Validasi panjang password
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password minimal 6 karakter' 
    });
  }

  try {
    console.log('🔍 [REGISTER] Starting registration process:', {
      email: email,
      nama: nama,
      nik: nik,
      gender: gender,
      hasSecureFile: !!secureFile,
      timestamp: new Date().toISOString()
    });

    // 🔒 DATABASE CHECK: Cek apakah email sudah ada di verified_users
    console.log('🔍 [REGISTER] Checking email in verified_users table:', email);
    const checkEmailQueryVerified = 'SELECT userid, email, nama, divisi FROM a_2_verified_users WHERE email = $1';
    const resultEmailVerified = await pool.query(checkEmailQueryVerified, [email]);

    if (resultEmailVerified.rows.length > 0) {
      const existingUser = resultEmailVerified.rows[0];
      console.log('🚫 [REGISTER] Email already exists in verified_users:', {
        email: email,
        existingUserid: existingUser.userid,
        existingNama: existingUser.nama,
        existingDivisi: existingUser.divisi,
        action: 'BLOCKED'
      });
      return res.status(400).json({ 
        success: false,
        message: 'Email ini sudah terdaftar dengan status yang valid. Anda tidak bisa mendaftar ulang.',
        existingUser: {
          userid: existingUser.userid,
          nama: existingUser.nama,
          divisi: existingUser.divisi
        }
      });
    }

    console.log('✅ [REGISTER] Email is available for registration:', email);

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const otp = generateOTP();
    console.log('🔐 [REGISTER] Password hashed, OTP generated:', { otpLength: otp.length });

    // Cek apakah email sudah ada di unverified_users
    const checkEmailQuery = 'SELECT * FROM a_1_unverified_users WHERE email = $1';
    const resultEmail = await pool.query(checkEmailQuery, [email]);

    if (resultEmail.rows.length > 0) {
      console.log('🔄 [REGISTER] Email exists in unverified, updating data:', email);
      
      // Jika ada, update semua data pengguna termasuk OTP yang baru
      const updateQuery = `
      UPDATE a_1_unverified_users
      SET
          nama = $1,
          nik = $2,
          telepon = $3,
          email = $4,
          password = $5,
          foto = $6,
          otp = $7,
          verifiedstatus = $8,
          fotoprofil = $9,
          gender = $10,
          created_at = NOW()
      WHERE email = $11
      RETURNING *;
      `;
      const updateValues = [
      nama, nik, telepon, email, hashedPassword, secureFile.fileId, otp, 'unverified', '', gender, email
      ];

      // Update data pengguna yang ada di unverified_users
      const updatedUser = await pool.query(updateQuery, updateValues);
      console.log('✅ [REGISTER] User data updated successfully');

      // Kirim OTP baru secara async (tidak menghalangi response)
      try {
        await sendOTPAsync(email, otp);
        console.log('📧 [REGISTER] OTP sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ [REGISTER] Failed to send OTP:', emailError.message);
        // Jangan gagalkan registrasi jika email gagal, user bisa request ulang
      }

      res.status(200).json({
        success: true,
        message: 'Registrasi berhasil! Silakan cek email Anda untuk kode OTP dan masukkan di halaman verifikasi.',
        redirectTo: '/verifikasi-otp.html'
      });
    } else {
      console.log('🆕 [REGISTER] New email, creating new user:', email);
      
      // Jika email tidak ada, insert data baru
      const insertQuery = `
      INSERT INTO a_1_unverified_users (nama, nik, telepon, email, password, foto, otp, verifiedstatus, fotoprofil, gender, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *;
      `;
      const insertValues = [
      nama, nik, telepon, email, hashedPassword, secureFile.fileId, otp, 'unverified', '', gender
      ];

      // Insert data pengguna baru
      const newUser = await pool.query(insertQuery, insertValues);
      console.log('✅ [REGISTER] New user created successfully:', newUser.rows[0].id);

      // Kirim OTP baru secara async (tidak menghalangi response)
      try {
        await sendOTPAsync(email, otp);
        console.log('📧 [REGISTER] OTP sent successfully to:', email);
      } catch (emailError) {
        console.error('❌ [REGISTER] Failed to send OTP:', emailError.message);
        // Jangan gagalkan registrasi jika email gagal, user bisa request ulang
      }

      res.status(200).json({
        success: true,
        message: 'Registrasi berhasil! Silakan cek email Anda untuk kode OTP dan masukkan di halaman verifikasi.',
        redirectTo: '/verifikasi-otp.html'
      });
    }

  } catch (err) {
    console.error('❌ [REGISTER] Registration failed:', {
      error: err.message,
      stack: err.stack,
      email: email,
      timestamp: new Date().toISOString()
    });
    
    // Clean up secure file if registration fails
    if (secureFile && secureFile.fileId) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        // Gunakan email sebagai userId untuk path yang benar
        const userDir = path.join(process.cwd(), 'secure_storage', 'ktp', email);
        const encryptedFilePath = path.join(userDir, `${secureFile.fileId}_encrypted.bin`);
        const metadataPath = path.join(userDir, `${secureFile.fileId}_metadata.json`);
        
        // Hapus file terenkripsi dan metadata
        await fs.unlink(encryptedFilePath);
        await fs.unlink(metadataPath);
        console.log('🧹 [REGISTER] Cleaned up secure files for user:', email);
      } catch (cleanupError) {
        console.error('⚠️ [REGISTER] Failed to cleanup secure file:', cleanupError.message);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Gagal melakukan registrasi. Silakan coba lagi atau hubungi administrator.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// 3. Verify OTP endpoint (check ✔)
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  // Validasi input
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false,
      message: "Email dan OTP harus diisi" 
    });
  }

  try {
    // 1. Cek email di unverified_users
    const query = 'SELECT * FROM a_1_unverified_users WHERE email = $1';
    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Email tidak ditemukan" 
      });
    }

    // 2. Verifikasi OTP
    if (user.otp.trim() !== otp.trim()) {
      console.log(`OTP mismatch: DB(${user.otp.trim()}) vs Input(${otp.trim()})`);
      return res.status(400).json({ 
        success: false,
        message: "Kode OTP salah" 
      });
    }

    console.log(`Email yang diterima untuk verifikasi: ${email}`);
    console.log(`OTP yang dikirim: ${user.otp.trim()}`);
    console.log(`OTP yang dimasukkan: ${otp.trim()}`);

    // 3. Cek duplikasi di verified_users
    const checkVerifiedQuery = 'SELECT * FROM a_2_verified_users WHERE email = $1';
    const verifiedResult = await pool.query(checkVerifiedQuery, [email]);

    if (verifiedResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Akun sudah terverifikasi.' 
      });
    }

    // 4. Pindahkan ke verified_users
    const insertQuery = `
        INSERT INTO a_2_verified_users (
            nama, nik, telepon, email, password, foto, 
            otp, verifiedstatus, fotoprofil, userid, divisi, 
            statuspengguna, ppatk_khusus, gender
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        RETURNING *;
    `;
    
    const insertValues = [
        user.nama, user.nik, user.telepon, user.email, 
        user.password, user.foto, otp.trim(), 'verified_pending', 
        '', '', '', 'offline', '', user.gender
    ];

    // Gunakan transaction untuk operasi move-delete
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertResult = await client.query(insertQuery, insertValues);
      await client.query('DELETE FROM a_1_unverified_users WHERE email = $1', [email]);
      
      await client.query('COMMIT');
      
      console.log(`✅ Verifikasi berhasil untuk ${email}`);
      return res.json({ 
        success: true,
        message: "Verifikasi berhasil! Akun Anda sedang diproses.",
        data: {
          email: insertResult.rows[0].email,
          status: insertResult.rows[0].verifiedstatus
        }
      });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("❌ Error verifikasi OTP:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat verifikasi",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 4. Resend OTP endpoint (check ✔)
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  try {
    // Ambil data pengguna dari PostgreSQL
    const query = 'SELECT * FROM a_1_unverified_users WHERE email = $1';
    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

    if (user.status === "verified_pending") {
      return res.status(400).json({ message: "Akun sudah terverifikasi" });
    }

    // Generate OTP baru
    const otp = generateOTP();

    // Update OTP di PostgreSQL (gunakan unverified_users)
    const updateQuery = 'UPDATE a_1_unverified_users SET otp = $1 WHERE email = $2 RETURNING *';
    await pool.query(updateQuery, [otp, email]);

    // Kirim OTP baru
    await sendOTPWithRetry(email, otp);

    res.json({ message: "OTP baru telah dikirim ke email Anda." });

  } catch (error) {
    console.error("❌ Gagal mengirim ulang OTP:", error.message);
    res.status(500).json({ message: "Gagal mengirim ulang OTP." });
  }
});

// 5. Complete profile endpoint (check ✔)
router.post('/complete-profile', async (req, res) => {
  const { userid, nip, username, special_field, special_parafv, pejabat_umum } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Dapatkan data user lengkap untuk validasi
    const userQuery = await client.query(
      'SELECT divisi, username FROM a_2_verified_users WHERE userid = $1 FOR UPDATE',
      [userid]
    );
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User tidak ditemukan.' 
      });
    }
    if (!username) {
      return res.status(400).json({ 
        success: false,
        message: 'Username wajib diisi.' 
      });
    }
    if (username !== user.username) {
      const existingUser = await client.query(
        'SELECT userid FROM a_2_verified_users WHERE username = $1',
        [username]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Username sudah digunakan oleh user lain.' 
        });
      }
    }

    if ((user.divisi !== 'Wajib Pajak' && user.divisi !== 'PPAT' && user.divisi !== 'PPATS')  && !nip) {
      return res.status(400).json({ 
        success: false,
        message: 'NIP wajib diisi untuk divisi ini.' 
      });
    }
    if ((user.divisi === 'PPAT' || user.divisi === 'PPATS') && (!special_field || !pejabat_umum)) {
      return res.status(400).json({ 
        success: false,
        message: 'Nama PPAT dan Gelar Pejabat wajib diisi untuk PPAT/PPATS.' 
      });
    }
    if ((user.divisi === 'Peneliti Validasi') && !special_parafv) {
      return res.status(400).json({ 
        success: false,
        message: 'Keseluruhan data wajib diisi untuk Peneliti Validasi.' 
      });
    }

    // Update profil user (dengan RETURNING seperti di update-profile)
    const updateResult = await client.query(
      `UPDATE a_2_verified_users 
       SET nip = $1, username = $2, special_field = $3, pejabat_umum = $4, special_parafv = $6 
       WHERE userid = $5
       RETURNING username, nip, special_field, pejabat_umum, special_parafv`,
      [nip, username, special_field, pejabat_umum || null, userid, special_parafv]
    );

    const updatedUser = updateResult.rows[0];
    await client.query('COMMIT');

    // Response lebih detail seperti di update-profile
    const responseData = {
      success: true,
      message: 'Profil berhasil dilengkapi!',
      username: updatedUser.username,
      nip: updatedUser.nip
    };
    // Tambahkan field khusus sesuai divisi
    if (user.divisi === 'PPAT' || user.divisi === 'PPATS') {
      responseData.special_field = updatedUser.special_field;
      responseData.pejabat_umum = updatedUser.pejabat_umum;
    } else if (user.divisi === 'Peneliti Validasi') {
      responseData.special_parafv = updatedUser.special_parafv;
    }
    res.status(200).json(responseData);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saat melengkapi profil:', error);

    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false,
        message: 'Username sudah digunakan oleh user lain.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Gagal menyimpan profil.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// 6. Logout endpoint (check ✔)
router.post('/logout', async (req, res) => {
  const { userid } = req.body;

  try {
    await pool.query(
      `UPDATE a_2_verified_users 
       SET statuspengguna = 'offline', last_active = NULL 
       WHERE userid = $1`,
      [userid]
    );

    res.status(200).json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Error saat logout:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan saat logout.' });
  }
});

// 7. Ping endpoint (check ✔)
router.post('/ping', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as current_time');
    
    res.status(200).json({
      success: true,
      message: 'Pong! API is working',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        current_time: dbTest.rows[0].current_time
      },
      server: {
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Error in ping endpoint:', error.message);
    res.status(500).json({
      success: false,
      message: 'Ping failed',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      },
      server: {
        node_version: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
});

export default router;
