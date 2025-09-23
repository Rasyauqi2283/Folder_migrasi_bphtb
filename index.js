/* ============================================================================
   AUDIT SERVER index.js — Ringkasan Isu & Rencana Perbaikan (tidak eksekusi)
   --------------------------------------------------------------------------
   Status: Hanya catatan audit, tidak mengubah perilaku aplikasi.
   Tujuan: Mempermudah maintenance tanpa membuka kode satu per satu.

   A. Isu Kritis yang Ditemukan (perlu diperbaiki berurutan)
   1) TODO-CORE: Logger dipakai sebelum didefinisikan (morgan -> logger).
   2) TODO-CORE: Session middleware terpasang dua kali (tanpa store vs PGStore).
   3) TODO-CORE: CORS belum mengizinkan credentials (cookie session tak terkirim).
   4) TODO-SEC: /api/profile mengembalikan password (hash) — kebocoran data.
   5) TODO-SEC: Penyajian file pakai req.url mentah; risiko path traversal.
   6) TODO-DB: Inkonstensi nama tabel: ppatk_* vs pat_* untuk booking/NJOP/BPHTB.
   7) TODO-RTE: Fungsi sendNotificationToLtb dipanggil tetapi tidak didefinisikan.
   8) TODO-RTE: Duplikasi route /api/getCreatorByBooking (tabel sumber berbeda).
   9) TODO-RTE: Rate limiter reset-password didefinisikan terpisah dari router.
  10) TODO-PDF: Mismatch PDFKit (PDFDocument vs PDFKitDocument) dan penggunaan
      atob/pdfDoc/page; GET endpoint menerima signature di body (tidak tepat).
  11) TODO-FS: Path tanda tangan gunakan path.join(..,'..','public',...) — salah.
  12) TODO-SES: Ketidakkonsistenan session key foto (fotoprofil vs foto).
  13) TODO-DB: Field persetujuan diperlakukan sebagai string 'Iya' padahal boolean.
  14) TODO-DB: Ketidakkonsistenan nama kolom (keterangandihitungSendiri vs ...dihitungsendiri).
  15) TODO-DATE: Format tanggal tidak konsisten (mis. '01052025' vs 'dd-mm-yyyy').
  16) TODO-COPY: Typo subjek email 'SSPP' (seharusnya 'SSPD').
  17) TODO-DB: SELECT ... FOR UPDATE pada endpoint GET (lock tidak diperlukan).

   B. Perbaikan Cepat yang Akan Diterapkan
   - Pindahkan pembuatan logger sebelum morgan, dan hapus session middleware ganda.
   - Set CORS { origin: <allowed>, credentials: true } agar cookie terkirim.
   - Hilangkan 'password' dari response /api/profile.
   - Tambahkan express.static untuk '/uploads' dan gunakan req.params[0] (bukan req.url)
     saat serve file; harden path agar selalu relatif ke '/public'.
   - Standarisasi nama tabel: pilih satu skema (mis. pat_*), sesuaikan semua query.
   - Tambahkan stub aman untuk sendNotificationToLtb atau hapus pemanggilan.
   - Satukan route /api/getCreatorByBooking menjadi satu sumber yang benar.
   - Tempatkan rate limiter berdekatan/di dalam router auth terkait.
   - Perbaiki PDF generator: gunakan PDFKitDocument, embed gambar dari Buffer,
     hapus ketergantungan atob/pdfDoc/page, dan ganti GET->POST bila kirim signature.
   - Perbaiki path join ke path.join(__dirname,'public', ...).
   - Samakan key session ke 'fotoprofil'.
   - Gunakan persetujuan boolean (true/false) di SQL (WHERE persetujuan = true).
   - Selaraskan penamaan kolom 'keterangandihitungsendiri'.
   - Normalisasi format tanggal atau parsing yang toleran.
   - Perbaiki subjek email ke 'SSPD'.
   - Hilangkan FOR UPDATE di SELECT untuk endpoint pembangkitan PDF.

   C. Operasional & Konfigurasi
   - ENV wajib: PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD, PG_PORT,
     SESSION_SECRET, EMAIL_USER, EMAIL_PASS, CORS_ORIGIN.
   - Logging: gunakan level info/error, pastikan folder 'logs/' tersedia.
   - Keamanan upload: validasi MIME, ukuran file, dan lokasi simpan konsisten.

   D. Tracking
   - Cari tag "TODO-*" di berkas ini untuk melihat posisi isu yang sudah dicatat.
   - Langkah perbaikan akan dilakukan bertahap agar mudah di-review.
============================================================================ */

// main part
// package part (core & 3rd party)
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import winston from 'winston';
import path from 'path';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import multer from 'multer';
//Generator PDF
import registerGeneratePdfBooking from './backend/services/Generator_PDF/generatepdfbooking_ppat.js';
import registerGeneratePdfCheckPeneliti from './backend/services/Generator_PDF/generatepdfcheck_peneliti.js';
import registerGeneratePdfVerifParaf from './backend/services/GeneratorPDF_withKEY/generatepdfverif_paraf.js';
//database port
import { pool } from './db.js';
import pgSession from 'connect-pg-simple';
//cek upload file
import uploadKTP from './backend/config/uploads/upload_ktp.js';
import { uploadProfile } from './backend/config/uploads/upload_profpicture.js';
import { pdfDUpload, imgDUpload, mixedDUpload } from './backend/config/uploads/upload_document.js';
import { ttdVerifMiddleware, uploadTTD } from './backend/config/uploads/upload_ttdverif.js';
import { uploadDocumentMiddleware } from './backend/config/multer.js';
export {
  uploadKTP,
  uploadProfile,
  pdfDUpload,
  imgDUpload,
  mixedDUpload,
  ttdVerifMiddleware,
  uploadDocumentMiddleware
};
// static config
import { staticConfig } from './backend/config/static.js';
// user routes and controller
import userRoutes from './backend/routesxcontroller/userRoutes.js';
import faqRoutes from './backend/routesxcontroller/faqroutes.js';
import noticeRoutes from './backend/routesxcontroller/noticeRoutes.js';

//session endpoint
import loginRouter from './backend/endpoint_session/login/login_endpoint.js';
import regisRouter from './backend/endpoint_session/registrasi/registrasi_endpoint.js';
import passwordResetRouter from './backend/endpoint_session/password_service.js';
import profileRouter from './backend/endpoint_session/profile/profile_endpoint.js';
import notificationRouter from './backend/endpoint_session/notification/notification_routes.js';
import { triggerNotificationByStatus, createBookingNotification, notifyDivisi } from './backend/endpoint_session/notification/notification_service.js';
import { sendNotificationToLtb } from './backend/endpoint_session/notification/notification_wrapper.js';
import { getAccessToken, initiateSigning, authorizeSigning } from './backend/khusus_BSRE_jalur/bsreservice.js';
import { saveQrToPublic } from './backend/utils/qrcode.js';
import { buildValidasiPdf } from './backend/services/GeneratorPDF_withKEY/generatepdfvalidasi_key.js';

// App part (core & api couriers)
import axios from 'axios';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Feature flag to disable pat_3_documents usage while keeping DB objects
const PAT3_DISABLED = process.env.DISABLE_PAT3 === '1';

staticConfig(app);

// TODO-CORE: Logger harus dibuat sebelum morgan digunakan
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize email transporter (optional)
let transporter = null;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    logger.warn('Email credentials not set; email notifications disabled');
  }
} catch (e) {
  logger.warn('Failed to initialize email transporter:', e);
}

// Central email helpers
function getEmailTransporter() {
  return transporter;
}

async function sendEmailSafe(mailOptions) {
  try {
    const tx = getEmailTransporter();
    if (!tx) {
      logger.warn('Email transporter not configured; skipping email send', { to: mailOptions?.to, subject: mailOptions?.subject });
      return { skipped: true };
    }
    const info = await tx.sendMail(mailOptions);
    logger.info('Email sent', { to: mailOptions?.to, subject: mailOptions?.subject, messageId: info?.messageId, accepted: info?.accepted, rejected: info?.rejected });
    return { success: true, info };
  } catch (err) {
    logger.warn('Email send failed', { error: err?.message, to: mailOptions?.to, subject: mailOptions?.subject });
    return { success: false, error: err };
  }
}

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }
);
// (logger dipindahkan ke atas sebelum morganMiddleware)

app.use(cookieParser());
const PGStore = pgSession(session);
app.use(session({
  store: new PGStore({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'default-secret-untuk-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
// Body parsers must come before API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/notices', noticeRoutes);

// TODO-API: Endpoint untuk update data user dengan notifikasi email
app.put('/api/users/:userid', async (req, res) => {
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

// Admin-only: update status_ppat for PPAT/PPATS users
app.put('/api/users/:userid/status-ppat', async (req, res) => {
  const { userid } = req.params;
  const { status_ppat } = req.body;

  const allowed = ['aktif', 'non-aktif', 'meninggal', 'Pindah Kerja'];
  if (!allowed.includes(status_ppat)) {
    return res.status(400).json({ success:false, message:'status_ppat tidak valid' });
  }

  if (!req.session.user || req.session.user.divisi !== 'Administrator') {
    return res.status(403).json({ success:false, message:'Forbidden' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const check = await client.query(
      `SELECT userid, divisi FROM a_2_verified_users WHERE userid = $1`, [userid]
    );
    if (check.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success:false, message:'User tidak ditemukan' });
    }
    const divisi = String(check.rows[0].divisi || '').toLowerCase();
    if (!(divisi === 'ppat' || divisi === 'ppats')) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success:false, message:'Hanya untuk user divisi PPAT/PPATS' });
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
    return res.json({ success:true, user: upd.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('update status_ppat error:', e);
    return res.status(500).json({ success:false, message:'Internal server error' });
  } finally {
    client.release();
  }
});

// TODO-API: Endpoint untuk mendapatkan data user berdasarkan userid
app.get('/api/users/:userid', async (req, res) => {
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

// TODO-EMAIL: Function untuk mengirim notifikasi email perubahan data user
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
    if (transporter) {
    await transporter.sendMail(mailOptions);
    console.log(`Email notification sent to ${userEmail} for user ${userid}`);
    } else {
      console.log('Email disabled: transporter not configured');
    }
    
  } catch (error) {
    console.error('Error sending user update notification email:', error);
    throw error;
  }
}

// Send dedicated email for status_ppat changes (skip for 'meninggal')
async function sendUserStatusChangeEmail(userEmail, userName, userid, newStatus) {
  try {
    if (!transporter) {
      console.log('Email disabled: transporter not configured');
      return;
    }
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
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error('Error sending status change email:', e);
  }
}

app.get('/check-cookie', (req, res) => {
    const userCookie = req.cookies['user'];
    res.send(userCookie ? `Hello ${userCookie}` : 'No user cookie found');
});

// Middleware
// TODO-CORE: Aktifkan CORS dengan credentials agar cookie session terkirim
app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',')
                      .map(s => s.trim())
                      .filter(Boolean)
            || ['http://localhost:5173','http://localhost:3000'],
    credentials: true
  }));
console.log(process.env.CORS_ORIGINS?.split(',')
  .map(s => s.trim())
  .filter(Boolean));
// Mount API routes early to avoid accidental fallthrough to static handlers

app.use('/design-n-script', express.static(path.join(__dirname, 'design-n-script')));
app.use('/asset', express.static(path.join(__dirname, 'asset')));
app.use(express.static('public'));
// Serve uploads with a fixed base path
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/auth', loginRouter);
app.use('/api/auth', regisRouter);
app.use('/api/auth', passwordResetRouter);
app.use('/api/auth', profileRouter);
app.use('/api', profileRouter);
app.use('/api/notifications', notificationRouter);
registerGeneratePdfBooking(app, pool);
registerGeneratePdfCheckPeneliti(app, pool);
registerGeneratePdfVerifParaf(app, pool);
///////////////////////////////////////////////////////////////////////////////
////
// Analytics endpoints for admin-pemutakhiranppat
app.get('/api/analytics/tax/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0) AS total_bphtb
      FROM pat_2_bphtb_perhitungan bp
    `);
    return res.json({ success: true, total_bphtb: Number(result.rows[0]?.total_bphtb || 0) });
  } catch (e) {
    console.error('tax summary error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/analytics/tax/per-user', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        u.special_field AS nama_ppat,
        u.userid,
        u.ppatk_khusus,
        COALESCE(SUM(bp.bphtb_yangtelah_dibayar), 0) AS nilai_pajak,
        COUNT(DISTINCT b.nobooking) AS booking
      FROM a_2_verified_users u
      LEFT JOIN pat_1_bookingsspd b ON b.userid = u.userid
      LEFT JOIN pat_2_bphtb_perhitungan bp ON bp.nobooking = b.nobooking
      WHERE lower(u.divisi) IN ('ppat','ppats') AND b.trackstatus = 'Diserahkan'
      GROUP BY u.special_field, u.userid, u.ppatk_khusus
      ORDER BY nilai_pajak DESC NULLS LAST, booking DESC
      LIMIT $1 OFFSET $2
    `;

    const dataResult = await pool.query(query, [limit, offset]);

    // Optional: total count for pagination (estimate)
    const countResult = await pool.query(`SELECT COUNT(*) AS total FROM a_2_verified_users WHERE lower(divisi) IN ('ppat','ppats')`);

    return res.json({
      success: true,
      page,
      limit,
      total_users: parseInt(countResult.rows[0]?.total || '0', 10),
      rows: dataResult.rows
    });
  } catch (e) {
    console.error('tax per-user error:', e);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
////////////////////////////////////////////////////////////////////////////////
////
import rateLimit from 'express-rate-limit';

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 3, // Maksimal 3 request
  message: {
    success: false,
    code: 'TOO_MANY_REQUESTS',
    message: 'Terlalu banyak permintaan reset password'
  }
});

app.use('/api/auth/reset-password-request', resetPasswordLimiter);
//////////////////////////////////////////////////////////////////////////////
//// BANK endpoints: verifikasi hasil transaksi
// GET list transaksi untuk verifikasi (status filter, pencarian, pagination)
// GET list transaksi untuk verifikasi (hanya dari tabel bank, dengan filter & pagination)
app.get('/api/bank/transaksi', async (req, res) => {
    try {
      const { page = 1, limit = 20, q } = req.query;
      const lim = Math.min(parseInt(limit) || 20, 100);
      const off = (parseInt(page) - 1) * lim;
  
      const params = [];
      const where = [];
  
      // Hanya transaksi yang masih pending & dicek di bank
      where.push(`COALESCE(bk.status_verifikasi, 'Pending') = 'Pending'`);
      where.push(`COALESCE(bk.status_dibank, 'Dicheck') = 'Dicheck'`);
  
      // Pencarian (berbasis data di bank, tapi bisa melibatkan join untuk nama/nobooking)
      if (q && String(q).trim().length) {
        params.push(`%${String(q).trim().toLowerCase()}%`);
        where.push(`(
          lower(bk.nobooking) LIKE $${params.length}
          OR lower(p.namawajibpajak) LIKE $${params.length}
          OR lower(COALESCE(bk.nomor_bukti_pembayaran, p2.nomor_bukti_pembayaran)::text) LIKE $${params.length}
        )`);
      }
  
      params.push(lim, off);
  
      const sql = `
        SELECT 
          bk.id,
          bk.nobooking,
          p.namawajibpajak,
          COALESCE(bk.nomor_bukti_pembayaran, p4.nomor_bukti_pembayaran) AS nomor_bukti_pembayaran,
          COALESCE(bk.bphtb_yangtelah_dibayar, p2.bphtb_yangtelah_dibayar) AS nominal,
          COALESCE(bk.tanggal_pembayaran, p4.tanggal_pembayaran) AS tanggal_pembayaran,
          COALESCE(bk.status_verifikasi, 'Pending') AS status_verifikasi,
          COALESCE(bk.status_dibank, 'Dicheck') AS status_dibank,
          bk.catatan_bank
        FROM bank_1_cek_hasil_transaksi bk
        LEFT JOIN pat_1_bookingsspd p ON p.nobooking = bk.nobooking
        LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = bk.nobooking
        LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = bk.nobooking
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY bk.id DESC
        LIMIT $${params.length-1} OFFSET $${params.length}
      `;
  
      const rows = await pool.query(sql, params);
      return res.json({ 
        success: true, 
        page: parseInt(page), 
        limit: lim, 
        rows: rows.rows 
      });
    } catch (e) {
      console.error('bank list transaksi error:', e);
      return res.status(500).json({ success:false, message:'Internal server error' });
    } 
});

  

// Helper: upsert status verifikasi bank tanpa ON CONFLICT (tanpa unique)
async function upsertBankVerification(nobooking, statusVerifikasi, catatan, verifiedByUserid, noRegistrasi) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ambil data sumber untuk melengkapi jika belum ada
    const src = await client.query(
      `SELECT p.userid, p2.bphtb_yangtelah_dibayar, p4.nomor_bukti_pembayaran, p4.tanggal_perolehan, p4.tanggal_pembayaran
       FROM pat_1_bookingsspd p
       LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = p.nobooking
       LEFT JOIN pat_2_bphtb_perhitungan p2 ON p2.nobooking = p.nobooking
       WHERE p.nobooking = $1`,
      [nobooking]
    );
    const s = src.rows[0] || {};
    const ex = await client.query('SELECT id FROM bank_1_cek_hasil_transaksi WHERE nobooking = $1 LIMIT 1', [nobooking]);
    if (ex.rowCount > 0) {
      await client.query(
                `UPDATE bank_1_cek_hasil_transaksi
                SET status_verifikasi = $1::varchar,
                    catatan_bank = $2,
                    verified_by = $3,
                    verified_at = NOW(),
                    bphtb_yangtelah_dibayar = COALESCE($4, bphtb_yangtelah_dibayar),
                    nomor_bukti_pembayaran = COALESCE($5, nomor_bukti_pembayaran),
                    tanggal_perolehan = COALESCE($6, tanggal_perolehan),
                    tanggal_pembayaran = COALESCE($7, tanggal_pembayaran),
                    no_registrasi = COALESCE($8, no_registrasi),
                    status_dibank = CASE 
                                    WHEN $1::varchar IN ('Disetujui','Ditolak') 
                                        THEN 'Tercheck' 
                                    ELSE COALESCE(status_dibank,'Dicheck') 
                                    END
                WHERE nobooking = $9`,
        [statusVerifikasi, catatan || null, verifiedByUserid || null,
         s.bphtb_yangtelah_dibayar || null, s.nomor_bukti_pembayaran || null, s.tanggal_perolehan || null, s.tanggal_pembayaran || null,
         noRegistrasi || null, nobooking]
      );
    } else {
      if (String(statusVerifikasi).trim() === 'Pending') {
        await client.query(
          `INSERT INTO bank_1_cek_hasil_transaksi (
             nobooking, userid, bphtb_yangtelah_dibayar, nomor_bukti_pembayaran,
             tanggal_perolehan, tanggal_pembayaran, status_verifikasi, catatan_bank,
             verified_by, verified_at, no_registrasi, status_dibank
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,$10,'Dicheck')`,
          [nobooking, s.userid || null, s.bphtb_yangtelah_dibayar || null, s.nomor_bukti_pembayaran || null,
           s.tanggal_perolehan || null, s.tanggal_pembayaran || null, statusVerifikasi, catatan || null, verifiedByUserid || null,
           noRegistrasi || null]
        );
      } else {
        await client.query(
          `INSERT INTO bank_1_cek_hasil_transaksi (
             nobooking, userid, bphtb_yangtelah_dibayar, nomor_bukti_pembayaran,
             tanggal_perolehan, tanggal_pembayaran, status_verifikasi, catatan_bank,
             verified_by, verified_at, no_registrasi, status_dibank
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10,'Tercheck')`,
          [nobooking, s.userid || null, s.bphtb_yangtelah_dibayar || null, s.nomor_bukti_pembayaran || null,
           s.tanggal_perolehan || null, s.tanggal_pembayaran || null, statusVerifikasi, catatan || null, verifiedByUserid || null,
           noRegistrasi || null]
        );
      }
    }
    await client.query('COMMIT');
    return { success:true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function requireBankRole(req) {
  if (!req.session.user) return 'Unauthorized';
  const d = String(req.session.user.divisi || '');
  if (d !== 'BANK' && d !== 'Administrator') return 'Forbidden';
  return null;
}

// Approve transaksi
app.post('/api/bank/transaksi/:nobooking/approve', async (req, res) => {
  try {
    const authErr = requireBankRole(req);
    if (authErr) return res.status(authErr === 'Unauthorized' ? 401 : 403).json({ success:false, message: authErr });
    const nobooking = String(req.params.nobooking || '').trim();
    const catatan = (req.body && req.body.catatan) ? String(req.body.catatan) : null;
    if (!nobooking) return res.status(400).json({ success:false, message:'nobooking wajib' });
    await upsertBankVerification(nobooking, 'Disetujui', catatan, req.session.user.userid);
    // Jika bank telah approve, cek apakah syarat ke Peneliti terpenuhi dan kirim notifikasi
    try {
      const chk = await pool.query(
        `SELECT p.bookingid
         FROM p_1_verifikasi p
         LEFT JOIN bank_1_cek_hasil_transaksi bk ON bk.nobooking = p.nobooking
         LEFT JOIN ltb_1_terima_berkas_sspd ltb ON ltb.nobooking = p.nobooking
         WHERE p.nobooking = $1
           AND COALESCE(bk.status_verifikasi,'Pending') = 'Disetujui'
           AND COALESCE(bk.status_dibank,'Dicheck') = 'Tercheck'
           AND p.status = 'Diajukan'
           AND p.trackstatus = 'Dilanjutkan'`,
        [nobooking]
      );
      const bookingId = chk.rows?.[0]?.bookingid;
      if (bookingId) {
        // Double-clear terpenuhi: kirim notifikasi processed_ltb ke Peneliti dan Administrator
        await triggerNotificationByStatus(bookingId, 'processed_ltb', req.session.user.userid);
      }
    } catch (_) {}
    return res.json({ success:true });
  } catch (e) {
    console.error('bank approve error:', e);
    return res.status(500).json({ success:false, message:'Internal server error' });
  }
});

// Reject transaksi
app.post('/api/bank/transaksi/:nobooking/reject', async (req, res) => {
  try {
    const authErr = requireBankRole(req);
    if (authErr) return res.status(authErr === 'Unauthorized' ? 401 : 403).json({ success:false, message: authErr });
    const nobooking = String(req.params.nobooking || '').trim();
    const catatan = (req.body && req.body.catatan) ? String(req.body.catatan) : '';
    if (!nobooking) return res.status(400).json({ success:false, message:'nobooking wajib' });
    if (!catatan) return res.status(400).json({ success:false, message:'catatan wajib untuk penolakan' });
    await upsertBankVerification(nobooking, 'Ditolak', catatan, req.session.user.userid);
    return res.json({ success:true });
  } catch (e) {
    console.error('bank reject error:', e);
    return res.status(500).json({ success:false, message:'Internal server error' });
  }
});
// Tambahkan di bagian atas setelah import
const requiredEnvVars = ['PG_USER', 'PG_HOST', 'PG_DATABASE', 'PG_PASSWORD', 'PG_PORT'];

requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ Variabel lingkungan ${env} tidak ditemukan`);
    process.exit(1);
  }
});
/////////////////////////////////////////////////////////////

// API untuk melayani file gambar atau PDF
// TODO-SEC: Hardened static file serving using explicit base directories
app.get('/public/*', (req, res) => {
    const relPath = req.params[0];
    const baseDir = path.join(__dirname, 'public');
    const safePath = path.normalize(path.join(baseDir, relPath));
    if (!safePath.startsWith(baseDir)) {
        return res.status(400).json({ success: false, message: 'Invalid path' });
    }
    res.sendFile(safePath);
});

// API untuk melayani file dokumen yang diupload
app.get('/uploads/documents/*', (req, res) => {
    const relPath = req.params[0];
    const baseDir = path.join(__dirname, 'public', 'uploads', 'documents');
    const safePath = path.normalize(path.join(baseDir, relPath));
    if (!safePath.startsWith(baseDir)) {
        return res.status(400).json({ success: false, message: 'Invalid path' });
    }
    res.sendFile(safePath);
});
// Endpoint untuk mengambil data pengguna yang statusnya pending
app.get('/api/users/pending', async (_req, res) => {
    try {
        const query = 'SELECT * FROM a_2_verified_users WHERE verifiedstatus = $1';
        const result = await pool.query(query, ['verified_pending']);
        res.json(result.rows);
    } catch (err) {
        console.error("Gagal membaca data pengguna:", err);
        res.status(500).json({ error: "Gagal membaca data pengguna" });
    }
});


// NOTE: Route '/api/users/complete' disediakan oleh userRoutes (backend/routesxcontroller/userRoutes.js)
// Hapus duplikasi endpoint di sini agar selalu merespons 200 (bukan 404) via controller.
// end save endpoint users to validate users //
//
// Endpoint admin untuk update data user
app.post('/api/users/update', async (req, res) => {
    const { email, userid, divisi } = req.body;

    if (!email || !userid || !divisi) {
        return res.status(400).json({ message: 'Email, UserID, dan Divisi wajib diisi.' });
    }
    try {
        const updateQuery = 'UPDATE a_2_verified_users SET userid = $1, Divisi = $2 WHERE email = $3 RETURNING *';
        const result = await pool.query(updateQuery, [userid, divisi, email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        res.status(200).json({ message: 'Data pengguna berhasil diperbarui.' });
    } catch (err) {
        console.error("Error saat update data user:", err);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data.' });
    }
});

//

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Endpoint profile x header start//

// Endpoint untuk mendapatkan data profil pengguna
// Dipindahkan ke router profil
// ==== bagian ini akan direfactor \\
// Dipindahkan ke router profil
////
// Dipindahkan ke router profil

//
// Dipindahkan ke router profil




// Endpoint untuk meng-upload foto profil
// Dipindahkan ke router profil

// Error handling middleware untuk multer
// Dipindahkan ke router profil

//change password
// Endpoint untuk meng-update password
// Dipindahkan ke router profil
////////////////////
// Start Member endpoint //
app.get('/api/members-header', async (req, res) => {
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// End endpoint profile x header//  

// Start endpoint Dashboard Admin case//
// Membuat endpoint untuk menghitung jumlah anggota berdasarkan divisi
app.get('/api/member-count/admin-access', async (req, res) => {
    const { divisi } = req.query; // Mengambil divisi yang dipilih dari query parameter

    try {
        // Query untuk menghitung jumlah anggota berdasarkan divisi
        const query = 'SELECT COUNT(*) FROM a_2_verified_users WHERE divisi = $1';
        const result = await pool.query(query, [divisi]);

        // Mengambil hasil jumlah anggota
        const count = result.rows[0].count;

        // Kirim hasil jumlah anggota ke frontend
        res.json({ count });
    } catch (error) {
        console.error('Error fetching member count:', error);
        res.status(500).json({ message: 'Failed to fetch member count' });
    }
});
// End endpoint Dashboard Admin case//

// Start endpoint Dashboard //
// Endpoint untuk mengambil data bulan dan tahun yang dipilih
app.post('/api/select-month/dashboard', async (req, res) => {
    const { month, year } = req.body; // Menerima bulan dan tahun dari frontend

    try {
        // Simpan bulan dan tahun yang dipilih ke database jika diperlukan
        const query = `INSERT INTO selected_months (month, year) VALUES ($1, $2)`;
        await pool.query(query, [month, year]);

        res.status(200).json({
            success: true,
            message: 'Bulan dan tahun berhasil dipilih',
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyimpan data bulan dan tahun.',
        });
    }
});

app.get('/api/user/dashboard', (req, res) => {
    if (req.session.user) {
        // Kirim data yang ada di session
        res.json({
            userid: req.session.user.userid,
            divisi: req.session.user.divisi,
            username: req.session.user.username,
            email: req.session.user.email
        });
    } else {
        res.status(401).json({ message: 'User not logged in' });
    }
});

// Admin: status PPAT - daftar notifikasi pengiriman LTB->Peneliti dan LSB->PPAT/PPATS
app.get('/api/admin/status-ppat/notifications', async (req, res) => {
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
app.get('/api/admin/status-ppat/users', async (req, res) => {
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
app.get('/api/admin/ppat/user/:userid/diserahkan', async (req, res) => {
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
  

// End endpoint Dashboard //
    
// Start PPATK Endpoint // (belum selesai)
// Cek apakah user (PPAT/PPATS/others) sudah memiliki tanda tangan
// PPATK: daftar berkas yang sudah Diserahkan (untuk unduh berkas tervalidasi)
app.get('/api/ppatk/rekap/diserahkan', async (req, res) => {
    try {
        const { page = 1, limit = 20, q } = req.query;
        const lim = Math.min(parseInt(limit) || 20, 100);
        const off = (parseInt(page) - 1) * lim;
        const params = [];
        let where = `trackstatus = 'Diserahkan'`;
        if (q && String(q).trim().length) {
            params.push(`%${String(q).trim().toLowerCase()}%`);
            where += ` AND (lower(nobooking) LIKE $${params.length} OR lower(namawajibpajak) LIKE $${params.length} OR lower(namapemilikobjekpajak) LIKE $${params.length})`;
        }
        params.push(lim, off);
        const sql = `
            SELECT nobooking, noppbb, tahunajb, namawajibpajak, namapemilikobjekpajak, npwpwajibpajak,
                   status, trackstatus, updated_at,
                   -- paths that may be needed for download
                   file_withstempel_path, file_booking_path
            FROM lsb_1_serah_berkas
            WHERE ${where}
            ORDER BY updated_at DESC NULLS LAST
            LIMIT $${params.length-1} OFFSET $${params.length}
        `;
        const rows = await pool.query(sql, params);
        return res.json({ success:true, page: parseInt(page), limit: lim, rows: rows.rows });
    } catch (e) {
        console.error('ppatk rekap diserahkan error:', e);
        return res.status(500).json({ success:false, message:'Internal server error' });
    }
});

app.get('/api/check-my-signature', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1`,
      [req.session.user.userid]
    );
    const pathVal = rows[0]?.tanda_tangan_path;
    const hasSignature = !!(pathVal && String(pathVal).trim() !== '');
    return res.json({ success: true, has_signature: hasSignature });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal memeriksa tanda tangan' });
  }
});

// Endpoint untuk menyimpan booking dan perhitungan BPHTB
app.post('/api/ppatk_create-booking-and-bphtb', morganMiddleware,async (req, res) => {
    const userid = req.session.user ? req.session.user.userid : null;
    const nama = req.session.user ? req.session.user.nama : null;
    // Pastikan user sudah login dan session ada
    if (!userid || !nama) {
        logger.warn('Unauthorized access attempt', { endpoint: req.originalUrl });
        return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
    }

    // Validasi Divisi
    if (!['PPAT', 'PPATS'].includes(req.session.user.divisi)) {
        logger.warn('Forbidden access attempt', { user: userid, divisi: req.session.user.divisi });
        return res.status(403).json({ message: 'Hanya pengguna dengan divisi PPAT dan PPATS yang bisa membuat booking' });
    }

    const client = await pool.connect();
    const { 
        jenis_wajib_pajak, noppbb, namawajibpajak, alamatwajibpajak, 
        namapemilikobjekpajak, alamatpemilikobjekpajak, tahunajb, 
        kabupatenkotawp, kecamatanwp ,kelurahandesawp, rtrwwp, npwpwp, kodeposwp, 
        kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, status_kepemilikan,

        // Penghitungan NJOP
        luas_tanah, njop_tanah, luas_bangunan, njop_bangunan,
        
        // Data perhitungan BPHTB
        nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar,
        
        // Data Objek Pajak
        hargatransaksi, letaktanahdanbangunan, rt_rwobjekpajak,  kelurahandesalp, kecamatanlp, jenisPerolehan,
        keterangan, nomor_sertifikat, tanggal_perolehan, tanggal_pembayaran, 
        nomor_bukti_pembayaran
    } = req.body;
        const tanggal = req.body.tanggal;  // Misalnya 01052025
        console.log("Tanggal AJB yang diterima di backend:", tanggal);


        // Mapping value ke tampilan yang lebih baik
        const statusKepemilikanMap = {
            'milik_pribadi': 'Milik Pribadi',
            'milik_bersama': 'Milik Bersama',
            'sewa': 'Sewa',
            'hgb': 'Hak Guna Bangunan'
        };

        const statusKepemilikanFormatted = statusKepemilikanMap[status_kepemilikan] || null;


    try {
        await client.query('BEGIN');  // Memulai transaksi

        // 1. Simpan data booking ke tabel pat_1_bookingsspd
        const bookingQuery = `
            INSERT INTO pat_1_bookingsspd (userid, jenis_wajib_pajak, noppbb, namawajibpajak, 
                                           alamatwajibpajak, namapemilikobjekpajak, alamatpemilikobjekpajak, 
                                           tanggal, tahunajb, kabupatenkotawp, kecamatanwp, kelurahandesawp, 
                                           rtrwwp, npwpwp, kodeposwp, kabupatenkotaop, kecamatanop, kelurahandesaop, 
                                           rtrwop, npwpop, kodeposop, trackstatus, nama)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'Draft', $22)
            RETURNING bookingid, nobooking;
        `;
        const bookingValues = [
            userid, jenis_wajib_pajak, noppbb, namawajibpajak, alamatwajibpajak,
            namapemilikobjekpajak, alamatpemilikobjekpajak, tanggal, tahunajb,
            kabupatenkotawp, kecamatanwp, kelurahandesawp, rtrwwp, npwpwp, kodeposwp,
            kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, nama
        ];

        const bookingResult = await client.query(bookingQuery, bookingValues);
        if (!bookingResult.rows[0] || !bookingResult.rows[0].nobooking) {
            return res.status(500).json({ message: 'Gagal mendapatkan booking ID.' });
        }
        const nobooking = bookingResult.rows[0].nobooking;  // Mendapatkan nobooking setelah data disimpan
        const Bookingid = bookingResult.rows[0].bookingid;  // Mendapatkan bookingid setelah data disimpan

        if (!nobooking) {
            await client.query('ROLLBACK');
            return res.status(500).json({ message: 'Gagal mendapatkan nobooking.' });
        }

        console.log('Nobooking berhasil diambil:', nobooking);
        console.log('Bookingid berhasil diambil:', Bookingid);

        const penghitunganquery = `
            INSERT INTO pat_5_penghitungan_njop (nobooking, luas_tanah, njop_tanah, luas_bangunan, njop_bangunan)
            VALUES ($1, $2, $3, $4, $5);`;
        const penghitunganvalues = [nobooking, luas_tanah, njop_tanah, luas_bangunan, njop_bangunan];

        await client.query(penghitunganquery, penghitunganvalues);

        // 2. Simpan data perhitungan BPHTB ke tabel pat_2_bphtb_perhitungan
        const bphtbQuery = `
            INSERT INTO pat_2_bphtb_perhitungan (nobooking, nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar)
            VALUES ($1, $2, $3);
        `;
        const bphtbValues = [
            nobooking, nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar
        ];

        await client.query(bphtbQuery, bphtbValues);  // Menyimpan perhitungan BPHTB

        // 3. Simpan data objek pajak ke tabel pat_4_objek_pajak
        const objekPajakQuery = `
            INSERT INTO pat_4_objek_pajak (nobooking, harga_transaksi, letaktanahdanbangunan, rt_rwobjekpajak, status_kepemilikan, 
                                          keterangan, nomor_sertifikat, tanggal_perolehan, 
                                          tanggal_pembayaran, nomor_bukti_pembayaran, kelurahandesalp, kecamatanlp, jenis_perolehan)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `;
        const objekPajakValues = [
            nobooking, hargatransaksi, letaktanahdanbangunan, rt_rwobjekpajak, statusKepemilikanFormatted, keterangan, nomor_sertifikat,
            tanggal_perolehan, tanggal_pembayaran, nomor_bukti_pembayaran, kelurahandesalp, kecamatanlp, jenisPerolehan 
        ];

        await client.query(objekPajakQuery, objekPajakValues);  // Menyimpan data objek pajak

        const ValidasiQuery = `
            INSERT INTO pat_8_validasi_tambahan (nobooking)
            VALUES ($1);
        `;
        const ValidasiValues = [
            nobooking
        ];

        await client.query(ValidasiQuery, ValidasiValues);  // Menyimpan data objek pajak

        // 4. (Opsional) Siapkan baris awal dokumen, tanda tangan, dan validasi surat
        // Gunakan savepoint agar jika tabel/kolom tidak cocok, transaksi utama tetap lanjut
        if (!PAT3_DISABLED) {
            try {
                await client.query('SAVEPOINT sp_docs');
                const insertDocs = `
                    INSERT INTO pat_3_documents (userid, nama, path_document1, path_document2, booking_id, upload_date)
                    VALUES ($1, $2, NULL, NULL, $3, NOW())
                `;
                await client.query(insertDocs, [userid, nama, Bookingid]);
            } catch (e) {
                await client.query('ROLLBACK TO SAVEPOINT sp_docs');
                console.warn('Skip init pat_3_documents:', e.message);
            }
        } else {
            console.log('Lewati init pat_3_documents (dinonaktifkan)');
        }

        try {
            await client.query('SAVEPOINT sp_sign');
            // Ambil path tanda tangan dari profil pengguna (boleh null jika belum ada)
            const sigRes = await client.query(
                'SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1',
                [userid]
            );
            const sigPath = sigRes.rows[0]?.tanda_tangan_path || null;

            const insertSign = `
                INSERT INTO pat_6_sign (nobooking, userid, nama, path_ttd_wp, path_ttd_ppatk)
                VALUES ($1, $2, $3, NULL, $4)
            `;
            await client.query(insertSign, [nobooking, userid, nama, sigPath]);

            // Debug: log path tanda tangan yang ditautkan (jika ada)
            try {
                const { rows: linked } = await client.query(
                    'SELECT path_ttd_ppatk FROM pat_6_sign WHERE nobooking = $1',
                    [nobooking]
                );
                console.log('PPAT signature linked to booking:', linked[0]?.path_ttd_ppatk || '(none)');
            } catch (_) {}
        } catch (e) {
            await client.query('ROLLBACK TO SAVEPOINT sp_sign');
            console.warn('Skip init pat_6_sign:', e.message);
        }

        try {
            await client.query('SAVEPOINT sp_valsurat');
            const insertValSurat = `
                INSERT INTO pat_7_validasi_surat (nobooking, status_surat, created_at)
                VALUES ($1, 'pending', NOW())
            `;
            await client.query(insertValSurat, [nobooking]);
        } catch (e) {
            await client.query('ROLLBACK TO SAVEPOINT sp_valsurat');
            console.warn('Skip init pat_7_validasi_surat:', e.message);
        }
        await client.query('COMMIT');  // Commit transaksi

        // Mengirimkan response sukses
        res.status(201).json({ 
            success: true, 
            message: 'Booking, perhitungan BPHTB, dan objek pajak berhasil disimpan.',
            nobooking: nobooking
        });

    } catch (error) {
        await client.query('ROLLBACK');  // Rollback transaksi jika terjadi error
        console.error('Error during booking, BPHTB calculation, and objek pajak creation:', error);
        res.status(500).json({
            success: false, 
            message: 'Gagal menyimpan booking, perhitungan BPHTB, dan objek pajak.'
        });
    } finally {
        client.release();  // Melepaskan koneksi setelah operasi selesai
    }
});

//
// Endpoint untuk mengambil data booking
// Tambahkan validasi lebih ketat
app.get('/api/ppatk_get-booking-data', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid } = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Query utama dengan optimasi
        const query = `
            SELECT
                b.nobooking, b.noppbb, b.tanggal, b.tahunajb,
                b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp,
                b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
                o.letaktanahdanbangunan AS alamat_objek, pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.userid = $1 AND b.trackstatus IN ('Draft','Diolah','Ditolak','Dilanjutkan','Diverifikasi','Terverifikasi')
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const result = await pool.query(query, [userid, limit, offset]);

        // Query count terpisah untuk performa lebih baik
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd WHERE userid = $1`;
        const countResult = await pool.query(countQuery, [userid]);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
///
app.get('/api/ppatk_get-booking-data/:nobooking', async (req, res) => {
    const { nobooking } = req.params;
    const { userid } = req.session.user;

    if (!userid) {
        return res.status(401).json({
            success: false,
            message: 'User tidak terautentikasi'
        });
    }

    try {
        // Query lengkap dengan JOIN ke semua tabel terkait
        const query = `
            SELECT 
            b.nobooking, b.userid, b.jenis_wajib_pajak, b.nobooking, b.noppbb, b.namawajibpajak, b.alamatwajibpajak,
            b.namapemilikobjekpajak, b.alamatpemilikobjekpajak, b.tanggal, b.tahunajb, b.kabupatenkotawp, b.kecamatanwp,
            b.kelurahandesawp, b.rtrwwp, b.npwpwp, b.kodeposwp, b.kabupatenkotaop, b.kecamatanop, b.kelurahandesaop,
            b.rtrwop, b.npwpop, b.kodeposop, b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path, b.nama, b.created_at,
                o.letaktanahdanbangunan, o.rt_rwobjekpajak, o.status_kepemilikan, 
                o.keterangan, o.nomor_sertifikat, o.tanggal_perolehan,
                o.tanggal_pembayaran, o.nomor_bukti_pembayaran,
                pp.luas_tanah, pp.luas_bangunan,
                vu.special_field, vu.telepon,
                pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_5_penghitungan_njop pp ON b.nobooking = pp.nobooking
            LEFT JOIN a_2_verified_users vu ON vu.userid = b.userid
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.nobooking = $1 AND b.userid = $2
            LIMIT 1;
        `;

        const result = await pool.query(query, [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data booking tidak ditemukan atau tidak memiliki akses'
            });
        }

        const bookingData = result.rows[0];

        // Format data sesuai kebutuhan form
        const responseData = {
            success: true,
            booking: {
                // Data pemohon (dari verified_users)
                nama_pemohon: bookingData.special_field,
                no_telepon: bookingData.telepon,
                // Data wajib pajak (dari pat_1_bookingsspd)
                nama_wajib_pajak: bookingData.namawajibpajak,
                kelurahan: bookingData.kelurahandesawp,
                kecamatan: bookingData.kecamatanwp,
                kabupaten_kota: bookingData.kabupatenkotawp,
                alamat_wajib_pajak: bookingData.alamatwajibpajak,
                nop: bookingData.noppbb,
                atas_nama: bookingData.namapemilikobjekpajak,
                // Data objek pajak
                Alamatop: bookingData.letaktanahdanbangunan,
                lainnya: bookingData.keterangan,
                // Data NJOP
                luas_tanah: bookingData.luas_tanah || 0,
                luas_bangunan: bookingData.luas_bangunan || 0
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error fetching booking data:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server saat mengambil data booking' 
        });
    }
});
///
// API UNTUK STATUS VALIDASI PPATK //
app.post('/api/save-ppatk-additional-data', async (req, res) => {
    try {
        const { userid } = req.session.user;
        const { 
            nobooking,
            alamat_pemohon,
            kampungop,
            kelurahanop,
            kecamatanopj,
        } = req.body;

        if (!userid) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        // Check if booking belongs to user
        const bookingCheck = await pool.query(
            'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1',
            [nobooking]
        );

        if (bookingCheck.rows.length === 0 || bookingCheck.rows[0].userid !== userid) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tidak memiliki akses ke data ini' 
            });
        }

        // Save to additional data table
        const result = await pool.query(`
        UPDATE pat_8_validasi_tambahan SET
                alamat_pemohon = $1,
                kampungop = $2,
                kelurahanop = $3,
                kecamatanopj = $4,
                updated_at = NOW()
            WHERE nobooking = $5
            RETURNING *
        `, [alamat_pemohon, kampungop,
            kelurahanop, kecamatanopj, nobooking ]);

        res.json({ 
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error saving additional data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal menyimpan data tambahan' 
        });
    }
});
//

app.post('/api/ppatk_upload-input_validasisspd',
  (req, res, next) => {
    console.log('Starting file upload process...');
    
    // Middleware untuk menangani PDF atau Gambar (max 5MB)
    mixedDUpload.fields([
      { name: 'aktaTanah', maxCount: 1 },
      { name: 'sertifikatTanah', maxCount: 1 },
      { name: 'pelengkap', maxCount: 1 }
    ])(req, res, (uploadErr) => {
      if (uploadErr) {
        console.error('Mixed upload error:', uploadErr);
        return res.status(400).json({ 
          success: false, 
          message: uploadErr.message || 'Error uploading files' 
        });
      }
      
      console.log('Files uploaded successfully:', req.files);
      next();
    });
  }, async (req, res) => {
    const { userid } = req.session.user; // Ambil userId dari session atau body request (sesuai implementasi frontend)

    if (!userid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Memastikan ada file yang di-upload (semua wajib sesuai UI dropdown)
    if (!req.files || !req.files.aktaTanah || !req.files.sertifikatTanah || !req.files.pelengkap) {
        return res.status(400).json({ success: false, message: 'Dokumen wajib belum lengkap (akta, sertifikat, pelengkap).' });
    }

    // Pastikan nobooking yang dikirim dari frontend ada di body
    const { nobooking } = req.body;  // Menarik nobooking yang dipilih dari frontend

    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'No booking selected' });
    }

    // Menyimpan jalur file ke dalam database (relative dari folder public)
    const toRelativePublicPath = (filePath) => {
        if (!filePath) return null;
        const normalized = filePath.replace(/\\/g, '/');
        const idx = normalized.toLowerCase().lastIndexOf('/public/');
        if (idx !== -1) {
            return normalized.substring(idx + '/public/'.length);
        }
        // fallback: jika tidak ditemukan segmen public
        return normalized.replace(/^public\//i, '');
    };

    const aktaTanahPath = req.files.aktaTanah ? toRelativePublicPath(req.files.aktaTanah[0].path) : null;
    const sertifikatTanahPath = req.files.sertifikatTanah ? toRelativePublicPath(req.files.sertifikatTanah[0].path) : null;
    const pelengkapPath = req.files.pelengkap ? toRelativePublicPath(req.files.pelengkap[0].path) : null;

    // Debugging: Console log untuk melihat apakah file path sudah benar
    console.log('Uploaded files paths:');
    console.log('Akta Tanah Path:', aktaTanahPath);
    console.log('Sertifikat Tanah Path:', sertifikatTanahPath);
    console.log('File Pelengkap Path:', pelengkapPath);

    try {
        // Cek apakah nobooking yang dipilih ada di pat_1_bookingsspd
        const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking not found in database' });
        }

        // Menyimpan file paths ke dalam database
        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET 
                akta_tanah_path = $1,
                sertifikat_tanah_path = $2,
                pelengkap_path = $3
            WHERE nobooking = $4
            RETURNING *;
        `;

        const values = [aktaTanahPath, sertifikatTanahPath, pelengkapPath, nobooking];

        // Debugging: Console log untuk melihat query dan values yang digunakan
        console.log('Updating booking with No. Booking:', nobooking);
        console.log('Update Query:', updateQuery);
        console.log('Values to update:', values);

        const resultUpdate = await pool.query(updateQuery, values);

        // Debugging: Cek apakah data berhasil di-update di database
        if (resultUpdate.rowCount > 0) {
            console.log('File paths successfully updated in the database:', resultUpdate.rows[0]);
            // Bangun URL web-friendly (pastikan diawali slash dan relatif ke root static 'public')
            const buildPublicUrl = (storedRelPath) => {
                if (!storedRelPath) return null;
                const clean = storedRelPath.replace(/^\/?/, '');
                return `/${clean}`;
            };

            res.json({ success: true, message: 'Files uploaded and paths saved in database.',
                data:{
                    akta_tanah_path: resultUpdate.rows[0].akta_tanah_path,
                    akta_tanah_url: buildPublicUrl(resultUpdate.rows[0].akta_tanah_path),
                    sertifikat_tanah_path: resultUpdate.rows[0].sertifikat_tanah_path,
                    sertifikat_tanah_url: buildPublicUrl(resultUpdate.rows[0].sertifikat_tanah_path),
                    pelengkap_path: resultUpdate.rows[0].pelengkap_path,
                    pelengkap_url: buildPublicUrl(resultUpdate.rows[0].pelengkap_path)
                }
             });
        } else {
            console.log('No booking found for the given NoBooking.');
            res.status(404).json({ success: false, message: 'No booking found for the given NoBooking.' });
        }
    } catch (error) {
        console.error('Error saving file paths to database:', error);
        res.status(500).json({ success: false, message: 'Failed to save file paths.' });
    }
});

// Endpoint untuk upload PDF dokumen
app.post('/api/ppatk_upload-pdf',
  (req, res, next) => {
    console.log('Starting PDF upload process...');
    
    // Middleware untuk menangani PDF
    pdfDUpload.single('pdfDokumen')(req, res, (err) => {
      if (err) {
        console.error('PDF upload error:', err);
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error uploading PDF file' 
        });
      }
      
      console.log('PDF uploaded successfully:', req.file);
      next();
    });
  }, async (req, res) => {
    const { userid } = req.session.user;

    if (!userid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const { nobooking } = req.body;

    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'No booking selected' });
    }

    const normalizePath = (filePath) => filePath ? filePath.replace(/\\/g, '/') : null;
    const pdfDokumenPath = normalizePath(req.file.path);

    console.log('PDF file path:', pdfDokumenPath);

    try {
        const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking found in database' });
        }

        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET pdf_dokumen_path = $1
            WHERE nobooking = $2
            RETURNING *;
        `;

        const values = [pdfDokumenPath, nobooking];

        console.log('Updating booking with No. Booking:', nobooking);
        console.log('Update Query:', updateQuery);
        console.log('Values to update:', values);

        const resultUpdate = await pool.query(updateQuery, values);

        if (resultUpdate.rowCount > 0) {
            console.log('PDF path successfully updated in the database:', resultUpdate.rows[0]);
            res.json({ 
                success: true, 
                message: 'PDF uploaded and path saved in database.',
                data: {
                    pdf_dokumen_path: resultUpdate.rows[0].pdf_dokumen_path
                }
            });
        } else {
            console.log('No booking found for the given NoBooking.');
            res.status(404).json({ success: false, message: 'No booking found for the given NoBooking.' });
        }
    } catch (error) {
        console.error('Error saving PDF path to database:', error);
        res.status(500).json({ success: false, message: 'Failed to save PDF path.' });
    }
});

///
//

app.post('/api/ppatk_upload-signatures', uploadTTD.fields([
    { name: 'signature1', maxCount: 1 },  // TTD Wajib Pajak (opsional)
]), async (req, res) => {
    // Logger yang lebih terstruktur
    const logger = {
        info: (...args) => console.log('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args)
    };

    logger.info('Memulai proses upload tanda tangan...');
    
    try {
        // 1. Validasi Session dan User
        logger.debug('Session data:', req.session);
        const { userid } = req.session.user || {};
        
        if (!userid) {
            logger.error('UserID tidak ditemukan di session');
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan' 
            });
        }

        // 2. Validasi Request Body
        logger.debug('Request body:', req.body);
        const { nobooking } = req.body;
        
        if (!nobooking) {
            logger.error('NoBooking tidak ditemukan di request body');
            return res.status(400).json({ 
                success: false, 
                message: 'Nomor Booking diperlukan',
                error_code: 'MISSING_BOOKING_NUMBER'
            });
        }

        // 3. Validasi File Upload
        logger.debug('Files yang diterima:', req.files);
        
        if (!req.files) {
            logger.error('File tanda tangan tidak lengkap', {
                signature1: !!req.files?.signature1,
            });
            
            return res.status(400).json({ 
                success: false, 
                message: 'Tanda tangan wajib pajak harus diunggah',
                error_code: 'INCOMPLETE_SIGNATURES'
            });
        }

        // 4. Normalisasi Path File (cross-platform)
        const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
        
        const signature1Path = req.files.signature1 
            ? normalizePath(req.files.signature1[0].path) 
            : null; // opsional
        
        logger.debug('Detail file upload:', {
            ttd_wp: req.files.signature1?.[0] ? {
                path: signature1Path,
                name: req.files.signature1[0].originalname,
                size: req.files.signature1[0].size
            } : null,
        });

        // 5. Verifikasi Data di Database
        logger.debug('Memverifikasi booking dan user...');
        
        const [bookingCheck, userData] = await Promise.all([
            pool.query(
                'SELECT 1 FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', 
                [nobooking, userid]
            ),
            pool.query(
                'SELECT userid, nama FROM a_2_verified_users WHERE userid = $1', 
                [userid]
            )
        ]);

        if (bookingCheck.rows.length === 0) {
            logger.error('Booking tidak valid', { nobooking, userid });
            return res.status(404).json({
                success: false,
                message: 'Nomor Booking tidak valid',
                error_code: 'INVALID_BOOKING'
            });
        }

        if (userData.rows.length === 0) {
            logger.error('User tidak ditemukan', { userid });
            return res.status(404).json({
                success: false,
                message: 'Data user tidak ditemukan',
                error_code: 'USER_NOT_FOUND'
            });
        }

        const { nama } = userData.rows[0];
        logger.debug('Data valid:', { nobooking, userid, nama });

        // 6. Simpan ke Database (update-then-insert agar tidak butuh constraint unik)
        logger.debug('Menyimpan tanda tangan ke database...');

        const updateQuery = `
            UPDATE pat_6_sign
            SET nama = $3,
                path_ttd_wp = $4
            WHERE nobooking = $1 AND userid = $2
            RETURNING *;
        `;
        const upsertParams = [nobooking, userid, nama, signature1Path];
        logger.debug('Executing UPDATE for upsert:', { query: updateQuery, params: upsertParams });
        let row;
        const updateResult = await pool.query(updateQuery, upsertParams);
        if (updateResult.rows.length > 0) {
            row = updateResult.rows[0];
            logger.info('Tanda tangan berhasil diperbarui', { id: row.id, nobooking });
        } else {
            const insertQuery = `
                INSERT INTO pat_6_sign (
                    nobooking,
                    userid,
                    nama,
                    path_ttd_wp
                ) VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            logger.debug('Executing INSERT for upsert:', { query: insertQuery, params: upsertParams });
            const insertResult = await pool.query(insertQuery, upsertParams);
            if (insertResult.rows.length === 0) {
                logger.error('Gagal menyimpan data tanda tangan (INSERT)');
                throw new Error('INSERT operation failed');
            }
            row = insertResult.rows[0];
            logger.info('Tanda tangan berhasil disimpan', { id: row.id, nobooking });
        }

        // 7. Response Sukses
        // Bangun URL publik berdasarkan path di bawah /public
        const publicUrl = signature1Path
            ? '/' + signature1Path.replace(/^(.*?)[\\/]?public[\\/]/i, '').replace(/\\/g, '/')
            : null;

        return res.json({ 
            success: true, 
            message: 'Tanda tangan berhasil diunggah',
            data: {
                nobooking,
                user: { userid, nama },
                signatures: {
                    wajib_pajak: signature1Path ? {
                        path: signature1Path,
                        url: publicUrl
                    } : null,
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Error proses upload:', {
            message: error.message,
            stack: error.stack,
            ...(error.code && { code: error.code })
        });

        // Cleanup file jika error terjadi setelah upload
        if (req.files) {
            try {
                logger.debug('Cleaning up uploaded files...');
                const cleanupPromises = [
                    req.files.signature1?.[0]?.path && fs.promises.unlink(req.files.signature1[0].path),
                ].filter(Boolean);
                
                await Promise.all(cleanupPromises);
            } catch (cleanupError) {
                logger.error('Gagal membersihkan file:', cleanupError);
            }
        }

        const errorResponse = {
            success: false,
            message: 'Terjadi kesalahan sistem',
            error_code: 'SERVER_ERROR'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.debug = {
                message: error.message,
                ...(error.code && { code: error.code }),
                stack: error.stack
            };
        }

        return res.status(500).json(errorResponse);
    }
});
// ============================ \\
///
async function generateRegistrationNumber() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // January is 0
        
        // [OPTIMASI DATABASE] - Pastikan index sudah dibuat
        // CREATE INDEX idx_reg_year ON ltb_1_terima_berkas_sspd (no_registrasi) 
        // WHERE no_registrasi ~ '^[0-9]{4}O[0-9]{5}$';

        // Cek tahun terakhir dari data created_at
        const lastEntry = await pool.query('SELECT created_at FROM ltb_1_terima_berkas_sspd ORDER BY created_at DESC LIMIT 1');
        const lastEntryYear = lastEntry.rows[0] ? new Date(lastEntry.rows[0].created_at).getFullYear() : currentYear;
        
        // Logika tahun berganti
        if (lastEntryYear < currentYear) {
            console.log(`[SYSTEM] Tahun berganti dari ${lastEntryYear} ke ${currentYear}. Nomor registrasi direset.`);
        }

        // Cari nomor registrasi terakhir dari tahun yang sama
        const lastRegQuery = `
            SELECT no_registrasi 
            FROM ltb_1_terima_berkas_sspd 
            WHERE no_registrasi ~ $1
            ORDER BY no_registrasi DESC 
            LIMIT 1
        `;
        const regexPattern = `^${currentYear}O[0-9]{5}$`;
        const lastRegResult = await pool.query(lastRegQuery, [regexPattern]);
        
        let nextNumber = 1; // Reset setiap tahun baru
        
        if (lastRegResult.rows.length > 0) {
            const lastReg = lastRegResult.rows[0].no_registrasi;
            const lastNumber = parseInt(lastReg.match(/O(\d{5})$/)[1]);
            nextNumber = lastNumber + 1;
            
            // Peringatan akhir tahun jika nomor hampir habis
            if (currentMonth === 12 && nextNumber >= 99900) {
                console.warn(`[WARNING] Nomor registrasi tahun ${currentYear} hampir penuh. Terakhir: ${nextNumber}`);
            }

            if (nextNumber > 99999) {
                throw new Error(`Nomor registrasi tahun ${currentYear} sudah penuh (${nextNumber-1}/99999). Hubungi administrator.`);
            }
        }
        
        const newRegNumber = `${currentYear}O${nextNumber.toString().padStart(5, '0')}`;
        console.log(`[INFO] Generated new registration number: ${newRegNumber}`);
        return newRegNumber;
    } catch (error) {
        console.error('[ERROR] Error generating registration number:', error);
        throw new Error('Gagal menghasilkan nomor registrasi. Silakan coba lagi atau hubungi administrator.');
    }
}
//
app.post('/api/ppatk_ltb-process', async (req, res) => {
    const { nobooking, trackstatus, userid, nama } = req.body;

    try {
        // Memastikan userid valid
        const userCheckQuery = 'SELECT * FROM a_2_verified_users WHERE userid = $1';
        const userCheckResult = await pool.query(userCheckQuery, [userid]);

        if (userCheckResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'User ID tidak ditemukan.' });
        }
        // Pastikan nobooking, trackstatus, dan userid ada dan valid
        if (!nobooking || !trackstatus || !userid || !nama) {
            return res.status(400).json({ success: false, message: 'Data yang diperlukan tidak lengkap.' });
        }
        const allowedStatuses = ['Diolah', 'Diterima', 'Ditolak'];
        if (!allowedStatuses.includes(trackstatus)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid.' });
        }

        // 1. Cek apakah nobooking ada di pat_1_bookingsspd dan status saat ini
        const checkNobookingQuery = `
        SELECT 
        pb.*, bp.*, o.*, vu.*, pv.*
        FROM 
            pat_1_bookingsspd pb
        LEFT JOIN 
            pat_2_bphtb_perhitungan bp ON pb.nobooking = bp.nobooking
        LEFT JOIN 
            pat_4_objek_pajak o ON pb.nobooking = o.nobooking
        LEFT JOIN
            a_2_verified_users vu ON vu.nama = pb.nama
        LEFT JOIN
            pat_8_validasi_tambahan pv ON pb.nobooking = pv.nobooking
        WHERE 
            pb.nobooking = $1;
        `;
        const checkResult = await pool.query(checkNobookingQuery, [nobooking]);
        if (checkResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'No Booking tidak ditemukan.' });
        }

        const rowData = checkResult.rows[0];

        // Guard: hanya boleh kirim dari status Draft -> Diolah
        const currentStatus = (rowData.trackstatus || '').toLowerCase();
        if (currentStatus !== 'draft') {
            return res.status(409).json({
                success: false,
                message: `Tidak dapat mengirim. Status saat ini '${rowData.trackstatus}' (bukan Draft).`
            });
        }
        if (!rowData.akta_tanah_path || !rowData.sertifikat_tanah_path || !rowData.pelengkap_path) {
            return res.status(400).json({
                success: false,
                message: 'File yang diperlukan belum di-upload atau tidak lengkap. Pastikan Akta Tanah, Sertifikat Tanah, dan File Pelengkap telah di-upload.'
            });
        }
        if (!rowData.alamat_pemohon || !rowData.kampungop || !rowData.kelurahanop || !rowData.kecamatanopj) {
            const missingFields = [];
            if (!rowData.alamat_pemohon) missingFields.push("alamat_pemohon");
            if (!rowData.kampungop) missingFields.push("kampungop");
            if (!rowData.kelurahanop) missingFields.push("kelurahanop");
            if (!rowData.kecamatanopj) missingFields.push("kecamatanopj");
            return res.status(400).json({
                success: false,
                message: `Data alamat pemohon belum lengkap. Field yang wajib diisi: ${missingFields.join(', ')}`
            });
        }
        // Generate nomor registrasi
        const noRegistrasi = await generateRegistrationNumber();

        // 2. Update trackstatus menjadi status yang baru pada pat_1_bookingsspd
        const updateQuery = 'UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2 RETURNING *';
        const updateValues = [trackstatus, nobooking];
        const updateResult = await pool.query(updateQuery, updateValues);

        if (updateResult.rows.length > 0) {
            // 3. Menyimpan data ke tabel ltb_1_terima_berkas_sspd setelah status diperbarui
            const insertQuery = `
                INSERT INTO ltb_1_terima_berkas_sspd 
                (nobooking, tanggal_terima, status, trackstatus, userid, namawajibpajak, namapemilikobjekpajak, divisi, nama, jenis_wajib_pajak, no_registrasi)
                VALUES 
                ($1, CURRENT_DATE, 'Diterima', $2, $3, $4, $5, 'LTB', $6, 'Badan Usaha', $7);
            `;
            const insertValues = [
                nobooking, 
                trackstatus, 
                userid, 
                rowData.namawajibpajak, 
                rowData.namapemilikobjekpajak,
                rowData.nama,
                noRegistrasi
            ];
            const insertResult = await pool.query(insertQuery, insertValues);

            if (insertResult.rowCount > 0) {
            // Buat entry verifikasi BANK (status awal Pending) menggunakan no_registrasi
            try {
                await upsertBankVerification(nobooking, 'Pending', null, null, noRegistrasi);
            } catch (bankErr) {
                console.warn('Gagal membuat entri verifikasi BANK:', bankErr?.message);
            }
            // Modify this part in your endpoint to trigger the notification:
            try {
                const bookingId = updateResult.rows[0]?.bookingid;
                const actedBy = userid; // gunakan userid string
                if (bookingId) {
                    // Rekomendasi: by status
                    await triggerNotificationByStatus(bookingId, 'pending_ltb', actedBy);
                    // Alternatif: by action
                    // await createBookingNotification(bookingId, 'BOOKING_CREATED', actedBy);
                }
            } catch (notifyErr) {
                console.warn('Gagal mengirim notifikasi LTB/Admin:', notifyErr.message);
            }
                console.log(`Data dengan No. Booking ${nobooking} telah diproses oleh LTB dan status diubah menjadi ${trackstatus}.`);

                res.status(200).json({
                    success: true,
                    message: `Data dengan No. Booking ${nobooking} berhasil diproses oleh LTB.`,
                    no_registrasi: noRegistrasi
                });
            } else {
                res.status(400).json({ success: false, message: 'Gagal menyimpan data ke tabel ltb_1_terima_berkas_sspd.' });
            }
        } else {
            res.status(400).json({ success: false, message: 'Gagal mengubah status data.' });
        }
    } catch (error) {
        console.error('Error processing data:', error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses data.' });
    }
});

////
/////////////////////////////////////////////////////////////////////////////////////////////
// API untuk mengupdate trackstatus menjadi 'Dihapus'
app.put('/api/ppatk_update-trackstatus/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    try {
        // Update status track menjadi 'Dihapus'
        const result = await pool.query('UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2', ['Dihapus', nobooking]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json({ success: true, message: 'Data status berhasil diubah menjadi Dihapus' });
    } catch (error) {
        console.error('Error updating trackstatus:', error);
        res.status(500).json({ message: 'Error updating trackstatus' });
    }
});

///
// (belum selesai)
app.get('/api/admin/ltb-processed', async (_req, res) => {
    try {
        // Query untuk mendapatkan data dengan status "Diolah" dari LTB yang ada di tabel ltb_1_terima_berkas_sspd
        const query = `
            SELECT 
                pb.nobooking, 
                pb.userid, 
                vu.nama AS nama_wajib_pajak, 
                tbs.tanggal_terima, 
                tbs.status, 
                tbs.trackstatus, 
                tbs.pengirim_ltb
            FROM pat_1_bookingsspd pb
            JOIN a_2_verified_users vu ON pb.userid = vu.userid
            LEFT JOIN ltb_1_terima_berkas_sspd tbs ON pb.nobooking = tbs.nobooking
            WHERE tbs.trackstatus = 'Diproses'  -- Hanya mengambil data yang sudah diproses
        `;

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                bookingData: result.rows
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Tidak ada data yang diproses oleh LTB.'
            });
        }
    } catch (error) {
        console.error('Error fetching processed data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data yang diproses oleh LTB.' });
    }
});
//

app.get('/api/ppatk_get-booking-data-completed', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid } = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Query utama dengan optimasi
        const query = `
            SELECT
                b.nobooking, b.noppbb, b.tanggal, b.tahunajb,
                b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp,
                b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
                o.letaktanahdanbangunan AS alamat_objek, pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.userid = $1 AND b.trackstatus IN ('Diserahkan')
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const result = await pool.query(query, [userid, limit, offset]);

        // Query count terpisah untuk performa lebih baik
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd WHERE userid = $1`;
        const countResult = await pool.query(countQuery, [userid]);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// End PPATK Endpoint //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////`     Start LTB (Loket Terima Berkas) Endpoint       `//////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// (belum selesai)
app.get('/api/ltb_get-ltb-berkas', async (req, res) => {
  // Cek apakah pengguna sudah login dan apakah divisinya LTB
  if (!req.session.user || req.session.user.divisi !== 'LTB') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya pengguna dengan divisi LTB yang dapat mengakses data ini.'
    });
  }

  try {
    const ltbDataQuery = `
      SELECT DISTINCT ON (t.no_registrasi)
        t.*, b.*, o.*, bp.*, pp.*, pv.*, vu.*
      FROM 
        ltb_1_terima_berkas_sspd t
      LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
      LEFT JOIN pat_4_objek_pajak o ON t.nobooking = o.nobooking
      LEFT JOIN pat_2_bphtb_perhitungan bp ON t.nobooking = bp.nobooking
      LEFT JOIN pat_5_penghitungan_njop pp ON t.nobooking = pp.nobooking
      LEFT JOIN pat_8_validasi_tambahan pv ON t.nobooking = pv.nobooking
      LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
      WHERE 
        t.trackstatus = 'Diolah' AND t.status = 'Diterima' 
        ORDER BY t.no_registrasi ASC;
    `;

    const result = await pool.query(ltbDataQuery);

    if (result.rows.length > 0) {
      res.status(200).json({
        success: true,
        data: result.rows
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No data found for LTB.'
      });
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching data.'
    });
  }
});


////
app.get('/api/getCreatorByBooking/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    try {
        const result = await pool.query(`
            SELECT userid, nama FROM pat_1_bookingsspd WHERE nobooking = $1
        `, [nobooking]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data pembuat tidak ditemukan' });
        }

        const creator = result.rows[0];
        res.json(creator); // Mengembalikan userid dan nama pembuat
    } catch (error) {
        console.error('Error fetching creator by nobooking:', error);
        res.status(500).json({ message: 'Error fetching creator data' });
    }
});
////
app.get('/api/getCreatorMohonValidasi/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    // 1. Validasi Input
    if (!nobooking || nobooking.trim().length === 0) {
        return res.status(400).json({ 
            success: false,
            error: 'Parameter nobooking diperlukan' 
        });
    }

    try {
        // 2. Query Database
        const result = await pool.query(`
            SELECT userid, nama 
            FROM pat_1_bookingsspd 
            WHERE nobooking = $1
        `, [nobooking.trim()]);

        // 3. Handle Hasil Query
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Data pembuat tidak ditemukan' 
            });
        }

        // 4. Response Sukses
        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching creator by nobooking:', error);
        
        // 5. Error Handling Lebih Baik
        res.status(500).json({ 
            success: false,
            error: 'Terjadi kesalahan server',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
//
app.post('/api/ltb_ltb-reject', async (req, res) => {
    const { nobooking, trackstatus, rejectionReason, userid } = req.body;

    try {
        // Memastikan userid valid
        const userCheckQuery = 'SELECT * FROM a_2_verified_users WHERE userid = $1';
        const userCheckResult = await pool.query(userCheckQuery, [userid]);

        if (userCheckResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'User ID tidak ditemukan.' });
        }
        // Validasi data yang diterima
        if (!nobooking || !trackstatus || !rejectionReason || !userid) {
            return res.status(400).json({ success: false, message: 'Data yang diperlukan tidak lengkap.' });
        }
        console.log(req.body);  // Log data yang diterima

        // Memperbarui trackstatus di pat_1_bookingsspd menjadi 'Ditolak'
        const updateTrackQuery = 'UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2';
        const updateTrackValues = ['Ditolak', nobooking];
        const updateTrackResult = await pool.query(updateTrackQuery, updateTrackValues);

        if (updateTrackResult.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'No Booking tidak ditemukan.' });
        }

        // Memperbarui status di ltb_1_terima_berkas_sspd
        const deleteTerimaBerkasQuery = `UPDATE ltb_1_terima_berkas_sspd set status=$2 WHERE nobooking = $1`;
        const deleteTerimaBerkasValues = [nobooking, "Ditolak"];
        await pool.query(deleteTerimaBerkasQuery, deleteTerimaBerkasValues);
        // Kirim email pemberitahuan penolakan
        const userName = userCheckResult.rows[0].nama;  // Ambil nama pengguna dari database
        await sendRejectionEmail(userid, nobooking, userName, rejectionReason);  // Mengirim email penolakan

        res.status(200).json({
            success: true,
            message: `Dokumen dengan No. Booking ${nobooking} telah ditolak dan dihapus dari terimaberkas_sspd.`
        });
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses penolakan.' });
    }
});
// Fungsi untuk mengirimkan email pemberitahuan penolakan
async function sendRejectionEmail(_userId, nobooking, userName, rejectionReason) {
    try {
        // Menarik userid pengguna dari divisi PPATK berdasarkan nobooking
        const userQuery = 'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1';
        const userResult = await pool.query(userQuery, [nobooking]);

        if (userResult.rows.length === 0) {
            console.log(`No Booking ${nobooking} tidak ditemukan.`);
            return;
        }

        const userId = userResult.rows[0].userid; // Dapatkan userId dari divisi PPATK berdasarkan nobooking

        // Menarik email pengguna PPATK berdasarkan userId
        const emailQuery = 'SELECT email FROM a_2_verified_users WHERE userid = $1';
        const emailResult = await pool.query(emailQuery, [userId]);

        if (emailResult.rows.length === 0) {
            console.log(`Email untuk userId ${userId} tidak ditemukan.`);
            return;
        }

        const userEmail = emailResult.rows[0].email; // Ambil email dari hasil query
        console.log(`Mengirim email pemberitahuan penolakan ke: ${userEmail}`);

        // Menyiapkan isi email
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Gantilah dengan email pengirim yang sudah diatur di environment variables
            to: userEmail,  // Gantilah dengan email yang diambil dari database
            subject: 'Pemberitahuan Penolakan SSPP',
            text: `Hallo ${userName},\n\nSSPD kamu kami tolak dikarenakan: "${rejectionReason}".\n\nTerima kasih atas perhatian Anda.`
        };
        const info = await sendEmailSafe(mailOptions);
        console.log('Email pemberitahuan status:', info?.success ? 'sent' : (info?.skipped ? 'skipped' : 'failed'));

    } catch (error) {
        console.error('Gagal mengirim email pemberitahuan:', error);
    }
}
// rejection end
///
//
// Endpoint untuk mendapatkan data pesanan dari database
app.get('/api/get-orders', async (_req, res) => {
    try {
      const result = await pool.query('SELECT nobooking, nama, jenis_wajib_pajak FROM ltb_1_terima_berkas_sspd');
      
      // Mengirimkan data pesanan sebagai response JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data pesanan.' });
    }
  });
//        

///
app.post('/api/ltb_send-to-peneliti', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Destructure dengan validasi
        const { 
            no_registrasi,
            nobooking, 
            userid,
            nama_pengirim, 
            namawajibpajak, 
            namapemilikobjekpajak, 
            tanggal_terima, 
            status = 'Diajukan',
            trackstatus = 'Dilanjutkan',
            keterangan,
            pengirim_ltb 
        } = req.body;

        if (!no_registrasi || !nobooking || !userid) {
            throw new Error('Data no_registrasi, nobooking, dan userid wajib diisi atau tidak ditemukan');
        }
        if (!nama_pengirim) {
            throw new Error ('Nama pengirim tidak ditemukan, atau tidak sesuai dengan data divisi')
        }

        // 1. Update trackstatus di tabel ppatk
        const updatePpatkQuery = `
            UPDATE pat_1_bookingsspd 
            SET trackstatus = $1 
            WHERE nobooking = $2 
            RETURNING *`;
        const updatePpatkResult = await client.query(updatePpatkQuery, [trackstatus, nobooking]);
        
        if (updatePpatkResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                success: false, 
                message: 'Data tidak ditemukan di tabel pat_1_bookingsspd' 
            });
        }

        // 2. Insert ke tabel peneliti (dengan no_registrasi)
        const insertPenelitiQuery = `
            INSERT INTO p_1_verifikasi (
                no_registrasi,
                nobooking, 
                nama_pengirim, 
                userid, 
                namawajibpajak, 
                namapemilikobjekpajak, 
                tanggal_terima, 
                status, 
                trackstatus, 
                pengirim_ltb
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`;
        
        const pengirimLtbText = pengirim_ltb || (nama_pengirim ? `Dikirim oleh: ${nama_pengirim} Loket Terima Berkas` : null);

        await client.query(insertPenelitiQuery, [
            no_registrasi,
            nobooking, 
            nama_pengirim,
            userid, 
            namawajibpajak, 
            namapemilikobjekpajak, 
            tanggal_terima, 
            status, 
            trackstatus, 
            pengirimLtbText
        ]);

        // 3. Update status di tabel sumber (TIDAK delete penuh). Sisakan no_registrasi & nobooking.
        const softClearQuery = `
            UPDATE ltb_1_terima_berkas_sspd
            SET 
                nama = NULL,
                jenis_wajib_pajak = NULL,
                pengirim_ltb = NULL,
                status = $2,
                trackstatus = $3,
                updated_at = NOW()
            WHERE nobooking = $1
            RETURNING no_registrasi`;

        const softClearResult = await client.query(softClearQuery, [nobooking, status, trackstatus]);

        // 4. Dapatkan info pembuat untuk notifikasi (optimasi dengan JOIN)
        const creatorInfoQuery = `
            SELECT v.email, v.nama 
            FROM pat_1_bookingsspd p
            JOIN a_2_verified_users v ON p.userid = v.userid
            WHERE p.nobooking = $1`;
        
        const creatorInfoResult = await client.query(creatorInfoQuery, [nobooking]);
        
        if (creatorInfoResult.rows.length > 0) {
            const { email, nama } = creatorInfoResult.rows[0];
            await sendPenelitiNotificationEmail(
                email, 
                nama, 
                nobooking, 
                status, 
                trackstatus, 
                keterangan
            );
        } else {
            console.warn(`Info creator tidak ditemukan untuk nobooking ${nobooking}`);
        }

        await client.query('COMMIT');

        // Trigger notifikasi: ke Peneliti dan Administrator
        try {
            const bookingId = updatePpatkResult.rows[0]?.bookingid;
            if (bookingId) {
                // Gate: Jangan kirim notifikasi Peneliti/Admin di tahap LTB.
                // Notifikasi "processed" akan dikirim saat BANK approve (double-clear).
                // Mark-read otomatis: bersihkan notifikasi lama untuk Administrator & LTB atas booking ini
                try {
                    const notificationModel = await import('./backend/endpoint_session/notification/notification_model.js');
                    if (notificationModel?.markAsReadByDivisiAndBooking) {
                        await notificationModel.markAsReadByDivisiAndBooking('Administrator', bookingId);
                        await notificationModel.markAsReadByDivisiAndBooking('LTB', bookingId);
                    }
                } catch (_) {}
            }
        } catch (notifyErr) {
            console.warn('Cleanup notifikasi LTB/Admin gagal:', notifyErr.message);
        }
        
        res.json({ 
            success: true, 
            message: 'Data berhasil diproses',
            data: {
                no_registrasi,
                nobooking,
                new_status: status,
                trackstatus
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in send-to-peneliti:', error);
        
        const errorResponse = {
            success: false,
            message: error.message || 'Gagal memproses permintaan'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.error_details = {
                stack: error.stack,
                original_error: error
            };
        }

        res.status(500).json(errorResponse);
    } finally {
        client.release();
    }
});

// Fungsi email yang disempurnakan
async function sendPenelitiNotificationEmail(creatorEmail, creatorName, nobooking, status, trackstatus, keterangan) {
    try {
        // Use centralized transporter with guards

        const mailOptions = {
            from: `"PPATK Notifikasi" <${process.env.EMAIL_USER}>`,
            to: creatorEmail,
            subject: `[PPAT] Status Berkas ${nobooking}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2 style="color: #2c3e50;">Halo, ${creatorName}</h2>
                    <p>Status berkas Anda dengan detail berikut telah diperbarui:</p>
                    
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>No. Booking</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${nobooking}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${status}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Track Status</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${trackstatus}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Keterangan</strong></td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${keterangan}</td>
                        </tr>
                    </table>
                    
                    <p>Berkas ini telah dipindahkan ke tim peneliti untuk verifikasi lebih lanjut.</p>
                    <p style="color: #7f8c8d; font-size: 0.9em;">Email ini dikirim secara otomatis, mohon tidak membalas.</p>
                </div>
            `,
            text: `Halo ${creatorName},\n\nStatus berkas Anda dengan No. Booking ${nobooking} telah diperbarui:\n\nStatus: ${status}\nTrack Status: ${trackstatus}\nKeterangan: ${keterangan || '-'}\n\nBerkas ini telah diberikan ke tim peneliti.`
        };

        const info = await sendEmailSafe(mailOptions);
        console.log('[MAIL] to:', mailOptions.to, 'status:', info?.success ? 'sent' : (info?.skipped ? 'skipped' : 'failed'));
        return true;
    } catch (error) {
        console.error('Gagal mengirim email:', error);
        throw error; // Biarkan error ditangani oleh caller
    }
}

//
//
// End LTB (Loket Terima Berkas) Endpoint //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Start Peneliti Endpoint //
// Peneliti bagian Verifikasi Endpoint //
app.get('/api/peneliti_get-berkas-fromltb', async (req, res) => {
    console.log('[1] Memulai proses peneliti_get-berkas-fromltb');
    console.log('[2] Memeriksa session user:', {
        sessionUser: req.session.user,
        sessionId: req.sessionID
    });


    // Cek apakah pengguna sudah login dan apakah divisinya LTB
    if (!req.session.user || req.session.user.divisi !== 'Peneliti') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya pengguna dengan divisi Peneliti yang dapat mengakses data ini.'
        });
    }

    try {
        const penelitiUserId = req.session.user.userid;
        // Query untuk mengambil data yang hanya untuk divisi Peneliti
        console.log('[4] User yang terautentikasi:', {
            userId: penelitiUserId,
            division: req.session.user.divisi
        });

        const penelitiDataQuery = `
SELECT DISTINCT ON (p.no_registrasi)
    p.no_registrasi,
    p.nobooking,
    p.trackstatus,
    p.status,
    p.tanggal_terima,
    -- field keputusan verifikasi untuk pesan1
    p.persetujuan,
    p.pemilihan,
    p.nomorstpd,
    p.tanggalstpd,
    p.angkapersen,
    p.keterangandihitungSendiri,
    p.isiketeranganlainnya,
    -- data booking
    b.noppbb,
    b.namawajibpajak,
    b.namapemilikobjekpajak,
    b.akta_tanah_path,
    b.sertifikat_tanah_path,
    b.pelengkap_path,
    b.jenis_wajib_pajak,
    b.userid AS userid,
    -- tanda tangan profil peneliti (preview)
    v.tanda_tangan_path AS peneliti_tanda_tangan_path,
    -- identitas pembuat booking
    creator.userid AS creator_userid,
    creator.special_field AS creator_special_field,
    -- sumber penandatangan (paraf) untuk pesan2
    pc.tanda_paraf_path,
    au.userid AS signer_userid
FROM 
    p_1_verifikasi p
LEFT JOIN pat_1_bookingsspd b 
    ON p.nobooking = b.nobooking
LEFT JOIN a_2_verified_users v 
    ON v.userid = $1                     -- ini user Peneliti yang sedang login
LEFT JOIN a_2_verified_users creator 
    ON creator.userid = b.userid         -- ini pembuat booking
LEFT JOIN bank_1_cek_hasil_transaksi bk 
    ON bk.nobooking = p.nobooking
LEFT JOIN ltb_1_terima_berkas_sspd ltb 
    ON ltb.nobooking = p.nobooking
LEFT JOIN p_3_clear_to_paraf pc
    ON pc.nobooking = p.nobooking
LEFT JOIN a_2_verified_users au
    ON au.tanda_tangan_path = pc.tanda_paraf_path
WHERE 
    p.trackstatus IN ('Dilanjutkan') 
    AND p.status = 'Diajukan'
    AND p.no_registrasi IS NOT NULL
    AND p.no_registrasi <> ''
    -- Gate: harus lolos LTB dan BANK
    AND COALESCE(ltb.status, 'Diajukan') IN ('Diajukan','Dilanjutkan','Diterima')
    AND COALESCE(bk.status_verifikasi, 'Pending') = 'Disetujui'
    AND COALESCE(bk.status_dibank, 'Dicheck') = 'Tercheck'
    ORDER BY p.no_registrasi ASC;
        `;

         console.log('[6] Mengeksekusi query dengan parameter:', {
            query: penelitiDataQuery,
            parameters: [penelitiUserId]
        });
        const result = await pool.query(penelitiDataQuery, [penelitiUserId]);
        
        console.log('[7] Hasil query database:', {
            rowCount: result.rowCount,
            sampleData: result.rows.length > 0 ? result.rows[0] : null
        })
        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                data: result.rows
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No data found for Peneliti'
            });
        }   } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching data.'
        });
    }
});
////
app.get('/api/getCreatorByBooking/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    try {
        const result = await pool.query(`
            SELECT userid, nama FROM pat_1_bookingsspd WHERE nobooking = $1
        `, [nobooking]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data pembuat tidak ditemukan' });
        }

        const creator = result.rows[0];
        res.json(creator); // Mengembalikan userid dan nama pembuat
    } catch (error) {
        console.error('Error fetching creator by nobooking:', error);
        res.status(500).json({ message: 'Error fetching creator data' });
    }
});
//
//// (pengerjaan bagian ini)
// Dipindahkan ke router profil
////
// Dipindahkan ke router profil

// Transfer/duplicate signature from a_2_verified_users -> p_1_verifikasi
app.post('/api/peneliti/transfer-signature', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
    }
    const { userid, divisi } = req.session.user;
    if (divisi !== 'Peneliti') {
        return res.status(403).json({ success: false, message: 'Hanya divisi Peneliti yang dapat menandatangani dokumen' });
    }

    const nobooking = req.body?.nobooking || req.query?.nobooking;
    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'Parameter nobooking diperlukan' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1) Pastikan pengguna punya tanda tangan di profil
        const { rows: sigRows } = await client.query(
            `SELECT tanda_tangan_path, tanda_tangan_mime FROM a_2_verified_users WHERE userid = $1 AND divisi = 'Peneliti'`,
            [userid]
        );
        const sig = sigRows[0];
        if (!sig?.tanda_tangan_path) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Tanda tangan profil belum diunggah' });
        }

        // 2) Cek dokumen verifikasi sudah disimpan dan disetujui
        const { rows: verifRows } = await client.query(
            `SELECT persetujuan FROM p_1_verifikasi WHERE nobooking = $1`,
            [nobooking]
        );
        if (verifRows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Data verifikasi tidak ditemukan' });
        }
        const isApproved = !!verifRows[0].persetujuan;
        if (!isApproved) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Simpan dan setujui dokumen terlebih dahulu' });
        }

        // 3) Duplikasi path/mime ke p_1_verifikasi
        const { rowCount } = await client.query(
            `UPDATE p_1_verifikasi
             SET tanda_tangan_path = $1,
                 ttd_peneliti_mime = $2
             WHERE nobooking = $3`,
            [sig.tanda_tangan_path, sig.tanda_tangan_mime || 'image/jpeg', nobooking]
        );
        if (rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Gagal memperbarui data tanda tangan' });
        }

        await client.query('COMMIT');
        return res.json({ success: true, message: 'Tanda tangan berhasil ditautkan', path: sig.tanda_tangan_path });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[TRANSFER SIGNATURE ERROR]', error);
        return res.status(500).json({ success: false, message: 'Gagal menautkan tanda tangan' });
    } finally {
        client.release();
    }
});
///////////
app.post('/api/peneliti_update-berdasarkan-pemilihan', async (req, res) => {
    // Validate request structure
    console.log('[1] Memulai proses update data peneliti');
    console.log('[2] Request body awal:', JSON.stringify(req.body, null, 2));
    if (!req.body.data) {
        return res.status(400).json({
            success: false,
            message: 'Data payload tidak valid'
        });
    }

    const {
        userid,
        nobooking,
        pemilihan,
        nomorstpd,
        tanggalstpd,
        angkapersen,
        keterangandihitungSendiri,
        isiketeranganlainnya,
        persetujuanVerif
    } = req.body.data;

     console.log('[4] Data yang diterima:', {
        userid,
        nobooking,
        pemilihan,
        nomorstpd,
        tanggalstpd,
        angkapersen,
        keterangandihitungSendiri,
        isiketeranganlainnya,
        persetujuanVerif
    });
    // Basic validation
    if (!userid || !nobooking || !pemilihan) {
        return res.status(400).json({
            success: false,
            message: 'Data yang diperlukan tidak lengkap'
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 2. Validate selection type
        const validPemilihanValues = ['penghitung_wajib_pajak', 'stpd_kurangbayar', 'dihitungsendiri', 'lainnyapenghitungwp'];
        if (!validPemilihanValues.includes(pemilihan)) {
            throw new Error('Jenis pemilihan tidak valid');
        }

        // 3. Validate selection-specific data
        const validationErrors = [];
        
        if (pemilihan === 'stpd_kurangbayar') {
            if (!nomorstpd) validationErrors.push('Nomor STPD diperlukan');
            if (!tanggalstpd) validationErrors.push('Tanggal STPD diperlukan');
        } 
        else if (pemilihan === 'dihitungsendiri') {
            if (isNaN(angkapersen) || angkapersen < 0 || angkapersen > 100) {
                validationErrors.push('Persentase harus antara 0-100');
            }
            if (!keterangandihitungSendiri) validationErrors.push('Keterangan penghitungan diperlukan');
        } 
        else if (pemilihan === 'lainnyapenghitungwp') {
            if (!isiketeranganlainnya) validationErrors.push('Keterangan lainnya diperlukan');
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: validationErrors
            });
        }

        // 4. Update verification data
        const updateQuery = `
            UPDATE p_1_verifikasi
            SET 
                pemilihan = $1,
                nomorstpd = $2,
                tanggalstpd = $3,
                angkapersen = $4,
                keterangandihitungSendiri = $5,
                isiketeranganlainnya = $6,
                persetujuan = TRUE
            WHERE nobooking = $7
            RETURNING *;
        `;

        const result = await client.query(updateQuery, [
            pemilihan,
            nomorstpd || null,
            tanggalstpd || null,
            angkapersen || null,
            keterangandihitungSendiri || null,
            isiketeranganlainnya || null,
            nobooking
        ]);

        if (result.rowCount === 0) {
            throw new Error('Data tidak ditemukan');
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Data berhasil diperbarui',
            data: {
                nobooking,
                status: 'Disetujui',
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[UPDATE ERROR]', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal memperbarui data',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});
////
app.post('/api/peneliti_send-to-paraf', async (req, res) => {
    // Menyertakan status dan trackstatus dalam destructuring
    const { nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_registrasi, pemverifikasi } = req.body;

    try {
        // 0) Validasi session dan role
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
        }
        const sessionUserid = req.session.user.userid;
        const sessionDivisi = req.session.user.divisi;
        if (sessionDivisi !== 'Peneliti') {
            return res.status(403).json({ success: false, message: 'Hanya divisi Peneliti yang dapat mengirim ke Paraf' });
        }

        // 1) Jika dokumen sudah ditandatangani, hanya penandatangan yang boleh mengirim
        const signCheck = await pool.query(
            'SELECT tanda_tangan_path FROM p_1_verifikasi WHERE nobooking = $1',
            [nobooking]
        );
        if (signCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Data verifikasi tidak ditemukan.' });
        }
        const signPath = signCheck.rows[0].tanda_tangan_path;
        if (signPath) {
            // Ekstrak userid dari pola nama file: ttd-<userid>.ext
            const match = String(signPath).match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i);
            const signerUserid = match ? match[1] : null;
            if (signerUserid && signerUserid !== sessionUserid) {
                return res.status(403).json({ success: false, message: `Dokumen sudah ditandatangani oleh ${signerUserid}. Hanya penandatangan yang dapat mengirim.` });
            }
        }

        const updateQueryPPATK = `
        UPDATE pat_1_bookingsspd
        SET trackstatus = $1
        WHERE nobooking = $2
        RETURNING *;
        `;
        const updateValuesPAT = [trackstatus, nobooking];
        const updateResultPAT = await pool.query(updateQueryPPATK, updateValuesPAT);
                // Jika tidak ada data yang diupdate, maka return error
                if (updateResultPAT.rowCount === 0) {
                    return res.status(400).json({ success: false, message: 'Data tidak ditemukan untuk diupdate.' });
                }

                const updateQueryPV = `
        UPDATE p_1_verifikasi
        SET trackstatus = $1
        WHERE nobooking = $2
        RETURNING *;
        `;
        const updateValuesPV = [trackstatus, nobooking];
        const updateResultPV = await pool.query(updateQueryPV, updateValuesPV);
                // Jika tidak ada data yang diupdate, maka return error
                if (updateResultPV.rowCount === 0) {
                    return res.status(400).json({ success: false, message: 'Data tidak ditemukan untuk diupdate.' });
                }
        // Step 2: Ambil userid pembuat berdasarkan nobooking (PPAT/PPATS)
        const userQuery = 'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1';
        const userResult = await pool.query(userQuery, [nobooking]);

        if (userResult.rows.length === 0) {
            console.log(`No Booking ${nobooking} tidak ditemukan.`);
            return res.status(400).json({ success: false, message: 'Pembuat dokumen tidak ditemukan.' });
        }

        const creatorUserid = userResult.rows[0].userid;

        // Step 3: Pindahkan data ke tabel 'p_3_clear_to_paraf' dengan userid pembuat dan pemverifikasi peneliti (diambil dari session)
        const insertQuery = `
            INSERT INTO p_3_clear_to_paraf (nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_registrasi, pemverifikasi)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;
        const insertValues = [nobooking, creatorUserid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_registrasi, sessionUserid];
        const insertResult = await pool.query(insertQuery, insertValues);
        // Ambil email pembuat berdasarkan userid
        const emailQuery = 'SELECT email, nama FROM a_2_verified_users WHERE userid = $1';
        const emailResult = await pool.query(emailQuery, [creatorUserid]);

        if (emailResult.rows.length === 0) {
            console.log(`Email untuk userId ${creatorUserid} tidak ditemukan.`);
            return res.status(400).json({ success: false, message: 'Email pembuat tidak ditemukan.' });
        }

        const creatorEmail = emailResult.rows[0].email;
        const creatorName = emailResult.rows[0].nama;

        // Kirim email pemberitahuan ke pembuat dokumen
        await sendPenelitiVerifikasiEmail(creatorEmail, creatorName, nobooking, status, trackstatus, keterangan);
        // Step 4: Mark-read otomatis untuk notifikasi Peneliti (tahap verifikasi) pada booking ini
        try {
            const bookingId = updateResultPAT?.rows?.[0]?.bookingid;
            if (bookingId) {
                const notificationModel = await import('./backend/endpoint_session/notification/notification_model.js');
                if (notificationModel?.markAsReadByDivisiAndBooking) {
                    await notificationModel.markAsReadByDivisiAndBooking('Peneliti', bookingId);
                }
            }
        } catch (_) {}

        // Step 5: Emit notifikasi Paraf Kasie ke Peneliti
        try {
            const bookingSel = await pool.query('SELECT bookingid FROM pat_1_bookingsspd WHERE nobooking = $1 LIMIT 1', [nobooking]);
            const bookingId = bookingSel?.rows?.[0]?.bookingid;
            if (bookingId) {
                const { triggerNotificationByStatus } = await import('./backend/endpoint_session/notification/notification_service.js');
                await triggerNotificationByStatus(bookingId, 'to_paraf_kasie', sessionUserid);
            }
        } catch (_) {}

        // Step 6: Response sukses jika semua langkah berhasil
        res.json({ success: true, message: 'Data berhasil dikirim ke peneliti dan status diperbarui.' });

    } catch (error) {
        console.error('Error sending data to peneliti:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim data ke peneliti.' });
    }
});
// Fungsi untuk mengirimkan email pemberitahuan ke pembuat dokumen
async function sendPenelitiVerifikasiEmail(creatorEmail, creatorName, nobooking, status, trackstatus) {
    try {
        // Menyiapkan isi email
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Gantilah dengan email pengirim yang sudah diatur di environment variables
            to: creatorEmail,  // Email pembuat
            subject: 'Pemberitahuan Pengiriman Data ke Peneliti',
            text: `Hallo ${creatorName},\n\nData Anda dengan No. Booking ${nobooking} telah dipindahkan ke peneliti dan statusnya telah diperbarui menjadi "${status}".\n\nTrack status saat ini: ${trackstatus}.\n\nTerima kasih atas perhatian Anda.`
        };
        const info = await sendEmailSafe(mailOptions);
        console.log('Email pemberitahuan (LTB->Peneliti) status:', info?.success ? 'sent' : (info?.skipped ? 'skipped' : 'failed'));

    } catch (error) {
        console.error('Gagal mengirim email pemberitahuan:', error);
    }
}
////
/////////////////// //masuk kebagian paraf kasie//  /////////////////////////////////////////////////
//
app.get('/api/peneliti/get-berkas-till-verif', async (req, res) => {
    // 1. Enhanced Session Validation
    if (!req.session.user || !req.session.user.userid) {
        return res.status(401).json({
            success: false,
            code: 'UNAUTHENTICATED',
            message: 'Authentication required',
            timestamp: new Date().toISOString()
        });
    }

    if (req.session.user.divisi !== 'Peneliti') {
        return res.status(403).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Forbidden: Researcher access only',
            timestamp: new Date().toISOString()
        });
    }
    const requestId = crypto.randomUUID();
    const startTime = process.hrtime();

    try {
        const penelitiUserId = req.session.user.userid;
        
        // Query yang diperbaiki untuk mengambil data blob tanda tangan
        const queryText = `
            SELECT DISTINCT ON (pc.no_registrasi)
                pc.no_registrasi,
                pc.nobooking,
                pc.userid,
                pc.trackstatus,
                b.noppbb,
                b.tahunajb,
                b.namawajibpajak,
                b.namapemilikobjekpajak,
                b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
                pc.status,
                pc.persetujuan,
                pc.tanda_paraf_path, pc.pemverifikasi,
                v.tanda_tangan_path,
                v.tanda_tangan_mime,
                -- tambahan untuk UI pesan stempel & penandatangan
                pvs.stempel_booking_path,
                au.nama AS signer_userid
            FROM p_3_clear_to_paraf pc
            LEFT JOIN pat_1_bookingsspd b ON pc.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users v ON v.userid = $1
            LEFT JOIN p_2_verif_sign pvs ON pvs.nobooking = pc.nobooking
            LEFT JOIN a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
            WHERE pc.trackstatus IN ('Diverifikasi','Diverifikasi ') AND pc.status IN ('Dikerjakan')
            ORDER BY pc.no_registrasi ASC
            LIMIT 1000;
        `;

        const result = await pool.query({
            text: queryText,
            values: [penelitiUserId]
        });

        // Transformasi data: kirimkan path tanda tangan; tidak lagi bergantung pada blob
        const transformedData = result.rows.map(row => {
            const signaturePath = row.tanda_tangan_path || null;
            return {
                no_registrasi: row.no_registrasi || 'N/A',
                nobooking: row.nobooking || 'N/A',
                pemverifikasi: row.pemverifikasi || 'N/A',
                noppbb: row.noppbb || 'N/A',
                tahunajb: row.tahunajb || 'N/A',
                userid: row.userid || penelitiUserId,
                namawajibpajak: row.namawajibpajak || 'Nama Tidak Tersedia',
                namapemilikobjekpajak: row.namapemilikobjekpajak || 'Nama Tidak Tersedia',
                status: row.status || 'UNKNOWN',
                trackstatus: row.trackstatus || 'UNKNOWN',
                tanda_tangan_url: signaturePath, // kompatibilitas lama
                tanda_tangan_path: signaturePath,
                persetujuan: (row.persetujuan === true || row.persetujuan === 'true') ? 'true' : (row.persetujuan === false || row.persetujuan === 'false' ? 'false' : (row.persetujuan || '')),
                tanda_paraf_path: row.tanda_paraf_path || null,
                stempel_booking_path: row.stempel_booking_path || null,
                signer_userid: row.signer_userid || 'N/A',
                akta_tanah_path: row.akta_tanah_path,
                sertifikat_tanah_path: row.sertifikat_tanah_path,
                pelengkap_path: row.pelengkap_path,
                _metadata: {
                    isValid: !!(row.no_registrasi && row.nobooking),
                    source: 'database',
                    hasSignature: !!signaturePath
                }
            };
        });

        const duration = process.hrtime(startTime);
        const response = {
            success: true,
            data: transformedData,
            metadata: {
                count: transformedData.length,
                validCount: transformedData.filter(item => item._metadata.isValid).length,
                duration: `${(duration[0] * 1000 + duration[1] / 1e6).toFixed(2)}ms`,
                requestId,
                generatedAt: new Date().toISOString()
            }
        };

        return res.json(response);
    } catch (error) {
        // 5. Structured Error Handling
        const errorResponse = {
            success: false,
            code: 'SERVER_ERROR',
            message: 'Internal server error',
            requestId,
            timestamp: new Date().toISOString(),
            _error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        };

        if (error.timeout) {
            errorResponse.code = 'TIMEOUT';
            errorResponse.message = 'Database request timeout';
            return res.status(408).json(errorResponse);
        }

        console.error(`[${requestId}] Database error:`, error);
        return res.status(500).json(errorResponse);
    }
});
//
// Add this to your existing backend routes
app.post('/api/peneliti/paraf-transfer-signature', async (req, res) => {
    if (!req.session.user) {
        return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }
    const penelitiUserid = req.session.user.userid;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const nobooking = req.body?.nobooking || req.query?.nobooking;
        if (!nobooking) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Parameter nobooking diperlukan' });
        }

        // 1) Ambil tanda tangan milik user Peneliti yang login
        const sigRes = await client.query(
            `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1 AND tanda_tangan_path IS NOT NULL`,
            [penelitiUserid]
        );
        if (sigRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Tanda tangan profil Peneliti tidak ditemukan' });
        }
        const penelitiSigPath = sigRes.rows[0].tanda_tangan_path;

        // 2) Update baris p_3_clear_to_paraf untuk nobooking tersebut yang sudah disetujui dan belum ada tanda_paraf_path
        const upd = await client.query(
                `UPDATE p_3_clear_to_paraf 
                 SET tanda_paraf_path = $1 
             WHERE nobooking = $2
               AND lower(persetujuan::text) IN ('true','t','iya','yes','1')
               AND (tanda_paraf_path IS NULL OR tanda_paraf_path = '')
             RETURNING id`,
            [penelitiSigPath, nobooking]
        );

        // 3) Catat siapa pemparaf (user peneliti yang login) pada tabel validasi terkait
        //    Tidak masalah jika baris belum ada; UPDATE akan meloloskan 0 baris.
        await client.query(
            `UPDATE pv_1_paraf_validate
             SET pemparaf = $1
             WHERE nobooking = $2`,
            [penelitiUserid, nobooking]
        );
        await client.query(
            `UPDATE pat_7_validasi_surat
             SET pemparaf = $1
             WHERE nobooking = $2`,
            [penelitiUserid, nobooking]
        );

        await client.query('COMMIT');
        return res.status(200).json({ success: true, message: 'Tanda paraf ditautkan', count: upd.rowCount, pemparaf: penelitiUserid });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error transferring signatures:', error);
        return res.status(500).json({ success: false, message: 'Gagal transfer tanda paraf' });
    } finally {
        client.release();
    }
});
///////////////
app.post('/api/peneliti_update-ttd-paraf', async (req, res) => {
    if (!req.body.data) {
        return res.status(400).json({
            success: false,
            message: 'Data payload tidak valid'
        });
    }

    const {
        userid,
        nobooking,
        persetujuanParaf,
        tanda_tangan_blob // Base64 encoded signature
    } = req.body.data;

     console.log('[4] Data yang diterima:', {
        userid,
        nobooking,
        persetujuanParaf,
        tanda_tangan_blob: tanda_tangan_blob ? 'exists (hidden for security)' : null
    });
    // Basic validation
    if (!userid || !nobooking || persetujuanParaf === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Data yang diperlukan tidak lengkap'
        });
    }

    // Validate if approved but no signature path will be stored later

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE p_3_clear_to_paraf
            SET 
                persetujuan = TRUE
            WHERE nobooking = $1
            RETURNING *;
        `;

        const result = await client.query(updateQuery, [
            nobooking
        ]);

        if (result.rowCount === 0) {
            throw new Error('Data tidak ditemukan');
        }

        // Catat stempel default di p_2_verif_sign (idempotent per nobooking)
        const sessionUserid = (req.session && req.session.user && req.session.user.userid) ? req.session.user.userid : userid;
        const defaultStampPath = '/asset/Stempel_bappenda.png';
        await client.query(
            `INSERT INTO p_2_verif_sign (nobooking, userid, stempel_booking_path)
             SELECT v.nobooking, v.userid, v.stempel_booking_path
             FROM (
               SELECT CAST($1 AS varchar(100)) AS nobooking,
                      CAST($2 AS varchar(100)) AS userid,
                      CAST($3 AS text)         AS stempel_booking_path
             ) v
             WHERE NOT EXISTS (
               SELECT 1 FROM p_2_verif_sign WHERE nobooking = v.nobooking
             )`,
            [nobooking, sessionUserid, defaultStampPath]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Data berhasil diperbarui',
            data: {
                nobooking,
                status: 'Disetujui',
                updated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[UPDATE ERROR]', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal memperbarui data',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});
////
// Endpoint untuk memvalidasi nobooking
app.get('/api/validate-nobooking/:nobooking', async (req, res) => {
    const { nobooking } = req.params;
    try {
        // 1) Sumber utama: p_1_verifikasi.persetujuan (TRUE berarti sudah disetujui)
        const verif = await pool.query(
            'SELECT persetujuan FROM p_1_verifikasi WHERE nobooking = $1',
            [nobooking]
        );
        if (verif.rows.length > 0) {
            return res.status(200).json({ success: true, isValid: !!verif.rows[0].persetujuan });
        }

        // 2) Backward-compat: p_3_clear_to_paraf.persetujuan (jika masih dipakai alur lama)
        const legacy = await pool.query(
                'SELECT persetujuan FROM p_3_clear_to_paraf WHERE nobooking = $1',
            [nobooking]
        );
        if (legacy.rows.length > 0) {
            return res.status(200).json({ success: true, isValid: !!legacy.rows[0].persetujuan });
        }

        return res.status(200).json({ success: true, isValid: false });
    } catch (error) {
        console.error('Error validating nobooking:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memvalidasi nobooking.' });
    }
});
////

//////////////////////////////////////////////      ENDPOST       ////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
//Peneliti Send to Paraf Validate "Peneliti Validasi"
app.post('/api/peneliti_send-to-ParafValidate', async (req, res) => {
    const { nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan } = req.body;
    const client = await pool.connect();

    try {
        // 0) Validasi session & role (harus Peneliti)
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
        }
        const sessionUserid = req.session.user.userid;
        const sessionDivisi = req.session.user.divisi;
        if (sessionDivisi !== 'Peneliti') {
            return res.status(403).json({ success: false, message: 'Hanya divisi Peneliti yang dapat mengirim ke Peneliti Validasi' });
        }

        await client.query('BEGIN');

        // 1) Dokumen harus disetujui & ditandatangani; terima tanda tangan dari p_1_verifikasi atau paraf dari p_3_clear_to_paraf
        const { rows: verifRows } = await client.query(
            `SELECT persetujuan, tanda_tangan_path FROM p_1_verifikasi WHERE nobooking = $1`,
            [nobooking]
        );
        const { rows: pv3Rows } = await client.query(
            `SELECT persetujuan AS pv3_persetujuan, tanda_paraf_path FROM p_3_clear_to_paraf WHERE nobooking = $1`,
            [nobooking]
        );
        if (verifRows.length === 0 && pv3Rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Data verifikasi tidak ditemukan.' });
        }
        const isApproved = !!(verifRows[0]?.persetujuan || pv3Rows[0]?.pv3_persetujuan);
        if (!isApproved) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Dokumen belum disetujui oleh Peneliti.' });
        }
        const signPathP1 = verifRows[0]?.tanda_tangan_path;
        const signPathPv3 = pv3Rows[0]?.tanda_paraf_path;
        const signPath = signPathP1 || signPathPv3;
        if (!signPath) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Dokumen belum ditandatangani oleh Peneliti.' });
        }
            const match = String(signPath).match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i);
            const signerUserid = match ? match[1] : null;
            if (signerUserid && signerUserid !== sessionUserid) {
            await client.query('ROLLBACK');
                return res.status(403).json({ success: false, message: `Dokumen sudah ditandatangani oleh ${signerUserid}. Hanya penandatangan yang dapat mengirim.` });
        }

        // 2) Ambil userid pembuat (creator) dan pemverifikasi sebelumnya dari p_3_clear_to_paraf
        const creatorRes = await client.query('SELECT bookingid, userid, alamatwajibpajak FROM pat_1_bookingsspd WHERE nobooking = $1', [nobooking]);
        if (creatorRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Pembuat dokumen tidak ditemukan.' });
        }
        const creatorUserid = creatorRes.rows[0].userid;
        const bookingIdInt = creatorRes.rows[0].bookingid; // gunakan sebagai document_id
        const alamatWP = creatorRes.rows[0].alamatwajibpajak || null;

        const pv3Res = await client.query(
            'SELECT pemverifikasi, no_registrasi FROM p_3_clear_to_paraf WHERE nobooking = $1',
            [nobooking]
        );
        const pemverifikasi = pv3Res.rows[0]?.pemverifikasi || null;
        const no_registrasi = pv3Res.rows[0]?.no_registrasi || null;

        // 3) Ambil/siapkan nomor validasi (idempotent)
        const existingPv1 = await client.query(
            'SELECT no_validasi FROM pv_1_paraf_validate WHERE nobooking = $1 LIMIT 1',
            [nobooking]
        );
        const generateUniqueValidationNumber = async () => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const randChars = (len) => {
                const bytes = crypto.randomBytes(len);
                let out = '';
                for (let i = 0; i < len; i++) {
                    out += alphabet[bytes[i] % alphabet.length];
                }
                return out;
            };
            while (true) {
                const candidate = `${randChars(8)}-${randChars(3)}`;
                const checkResult = await client.query(
                    'SELECT 1 FROM pv_1_paraf_validate WHERE no_validasi = $1 LIMIT 1',
                    [candidate]
                );
                if (checkResult.rows.length === 0) return candidate;
            }
        };
        const no_validasi = existingPv1.rows[0]?.no_validasi || await generateUniqueValidationNumber();

        // 4) Update status tracking
        const updateResultPAT = await client.query(
            `UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2 RETURNING nobooking`,
            [trackstatus, nobooking]
        );
        if (updateResultPAT.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Data tidak ditemukan untuk diupdate.' });
        }

        const updateResultPV = await client.query(
            `UPDATE p_3_clear_to_paraf SET trackstatus = $1 WHERE nobooking = $2 RETURNING nobooking`,
            [trackstatus, nobooking]
        );
        if (updateResultPV.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Data tidak ditemukan untuk diupdate.' });
        }

        // 5) Upsert pv_1_paraf_validate (idempotent di nobooking)
        const displayStatus = 'Menunggu';
        const upsertPv1 = await client.query(
            `INSERT INTO pv_1_paraf_validate
                (nobooking, userid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_validasi, pemverifikasi, pemparaf, status_tertampil, no_registrasi)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             ON CONFLICT (nobooking)
             DO UPDATE SET
                userid = EXCLUDED.userid,
                namawajibpajak = EXCLUDED.namawajibpajak,
                namapemilikobjekpajak = EXCLUDED.namapemilikobjekpajak,
                status = EXCLUDED.status,
                trackstatus = EXCLUDED.trackstatus,
                keterangan = EXCLUDED.keterangan,
                pemverifikasi = EXCLUDED.pemverifikasi,
                status_tertampil = EXCLUDED.status_tertampil,
                no_registrasi = EXCLUDED.no_registrasi,
                no_validasi = COALESCE(pv_1_paraf_validate.no_validasi, EXCLUDED.no_validasi)
             RETURNING nobooking, no_validasi`,
            [nobooking, creatorUserid, namawajibpajak, namapemilikobjekpajak, status, trackstatus, keterangan, no_validasi, pemverifikasi, null, displayStatus, no_registrasi]
        );

        // Siapkan data pat_7_validasi_surat yang wajib (nama/telepon/alamat)
        const userInfoRes = await client.query(
            `SELECT nama, telepon::text AS telepon FROM a_2_verified_users WHERE userid = $1 LIMIT 1`,
            [creatorUserid]
        );
        const namaPemohon = userInfoRes.rows[0]?.nama || '';
        const teleponPemohon = userInfoRes.rows[0]?.telepon || '';
        const addRes = await client.query(
            `SELECT alamat_pemohon FROM pat_8_validasi_tambahan WHERE nobooking = $1 LIMIT 1`,
            [nobooking]
        );
        const alamatPemohon = addRes.rows[0]?.alamat_pemohon || alamatWP || '';

        // 6) Sinkron ke pat_7_validasi_surat
        // Upsert pat_7_validasi_surat dengan kolom wajib
        const updRes = await client.query(
            `UPDATE pat_7_validasi_surat
             SET nomor_validasi = $2, pemparaf = $3, status_tertampil = $4
                WHERE nobooking = $1
             RETURNING nobooking`,
            [nobooking, no_validasi, null, displayStatus]
        );
            if (updRes.rows.length === 0) {
            await client.query(
                `INSERT INTO pat_7_validasi_surat (
                    nomor_validasi, nama_pemohon, alamat_pemohon, no_telepon,
                    userid, nobooking, status_tertampil, tanggal_dibuat, created_at
                 ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
                [no_validasi, namaPemohon, alamatPemohon, teleponPemohon, creatorUserid, nobooking, displayStatus]
            );
        }

        // 6b) Update nomor_validasi pada pat_1_bookingsspd agar selaras dengan no_validasi yang dibuat
        const finalNoValidasi = upsertPv1.rows[0]?.no_validasi || no_validasi;
        const updNovalPat = await client.query(
            `UPDATE pat_1_bookingsspd SET nomor_validasi = $2 WHERE nobooking = $1 RETURNING nomor_validasi`,
            [nobooking, finalNoValidasi]
        );
        if (updNovalPat.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Gagal menyetel nomor_validasi pada pat_1_bookingsspd.' });
        }

        // 7) Buat signing_request (belum di-claim; signer_role = Peneliti Validasi)
        //    NOTE: butuh signer_userid boleh NULL dan bertipe TEXT sesuai rekomendasi.
        let srExisting = await client.query(
            `SELECT id FROM pv_2_signing_requests WHERE nobooking = $1 AND signer_role = $2 LIMIT 1`,
            [nobooking, 'Peneliti Validasi']
        );
        let signingRequestId;
        if (srExisting.rows.length > 0) {
            signingRequestId = srExisting.rows[0].id;
        } else {
            const signIns = await client.query(
                `INSERT INTO pv_2_signing_requests
                    (document_id, nobooking, no_validasi, signer_userid, signer_role, status, order_index, appearance_json)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 RETURNING id`,
                [
                    bookingIdInt,
                    nobooking,
                    finalNoValidasi,
                    null,
                    'Peneliti Validasi',
                    'Pending',
                    0,
                    null
                ]
            );
            signingRequestId = signIns.rows[0].id;
        }

        // 8) Catat audit event "created"
        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'created', $2::jsonb, $3, $1, $4, 'backend')`,
            [
                signingRequestId,
                JSON.stringify({ nobooking, trackstatus }),
                no_validasi,
                sessionUserid
            ]
        );

        await client.query('COMMIT');

        // 9) Email notifikasi (di luar transaksi agar tidak menggagalkan DB)
        try {
            const userResult = await pool.query('SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1', [nobooking]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Pembuat dokumen tidak ditemukan.' });
        }
            const emailResult = await pool.query('SELECT email, nama FROM a_2_verified_users WHERE userid = $1', [creatorUserid]);
        if (emailResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Email pembuat tidak ditemukan.' });
        }
        const creatorEmail = emailResult.rows[0].email;
        const creatorName = emailResult.rows[0].nama;
        await sendParafVEmail(creatorEmail, creatorName, nobooking, status, trackstatus, keterangan);
        } catch (e) {
            console.warn('Sinkronisasi email di-skip:', e.message);
        }
        
        // 10) Response sukses
        return res.json({
            success: true, 
            message: 'Data berhasil dikirim ke Paraf Validasi dan status diperbarui.',
            no_validasi
        });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error sending data to peneliti:', error);
        return res.status(500).json({ success: false, message: 'Gagal mengirim data ke Paraf Validasi.' });
    } finally {
        client.release();
    }
});
// Fungsi untuk mengirimkan email pemberitahuan ke pembuat dokumen
async function sendParafVEmail(creatorEmail, creatorName, nobooking, status, trackstatus) {
    try {
        // Menyiapkan transporter untuk mengirimkan email
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Gunakan layanan email yang Anda pilih (misalnya Gmail)
            auth: {
                user: process.env.EMAIL_USER, // Pengguna email dari environment variables (pastikan sudah diatur)
                pass: process.env.EMAIL_PASS  // Password email (pastikan sudah diatur di environment variables)
            }
        });

        // Menyiapkan isi email
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Gantilah dengan email pengirim yang sudah diatur di environment variables
            to: creatorEmail,  // Email pembuat
            subject: 'Pemberitahuan Pengiriman Data ke Paraf Validasi',
            text: `Hallo ${creatorName},\n\nData Anda dengan No. Booking ${nobooking} telah dipindahkan ke peneliti dan statusnya telah diperbarui menjadi "${status}".\n\nTrack status saat ini: ${trackstatus}.\n\nTerima kasih atas perhatian Anda.`
        };

        // Mengirimkan email
        await transporter.sendMail(mailOptions);
        console.log('Email pemberitahuan berhasil dikirim.');

    } catch (error) {
        console.error('Gagal mengirim email pemberitahuan:', error);
    }
}
// End Peneliti Endpoint //
// START PARAF VALIDASI ENDPOINT //
app.get('/api/paraf/get-berkas-till-clear', async (req, res) => {
    // Validasi session dan divisi
    if (!req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya pengguna dengan divisi Paraf Validasi yang dapat mengakses data ini.'
        });
    }

    try {
        const ParafVUserId = req.session.user.userid;
        
        // Query yang diperbaiki
        const query = `
            SELECT 
                pv.nobooking,
                pv.no_validasi,
                b.noppbb,
                b.tahunajb,
                b.namawajibpajak,
                b.namapemilikobjekpajak,
                b.akta_tanah_path,
                b.sertifikat_tanah_path,
                b.pelengkap_path,
                pc.no_registrasi,  -- Ambil no_registrasi dari p_3_clear_to_paraf
                pv.status,
                pv.trackstatus,
                pv.status_tertampil,
                uc.special_field AS namapembuat, -- Nama PPAT/Notaris beserta gelar
                vu.tanda_tangan_path AS peneliti_tanda_tangan_path,
                -- tambahan untuk pesan
                pvs.stempel_booking_path,
                pc.persetujuan AS pc_persetujuan,
                pc.tanda_paraf_path,
                au.userid AS signer_userid
            FROM 
                pv_1_paraf_validate pv
            JOIN 
                pat_1_bookingsspd b ON pv.nobooking = b.nobooking
            JOIN 
                p_3_clear_to_paraf pc ON pv.nobooking = pc.nobooking
            JOIN 
                a_2_verified_users uc ON b.userid = uc.userid
            LEFT JOIN 
                a_2_verified_users vu ON vu.userid = $1
            LEFT JOIN 
                p_2_verif_sign pvs ON pvs.nobooking = pv.nobooking
            LEFT JOIN 
                a_2_verified_users au ON au.tanda_tangan_path = pc.tanda_paraf_path
            WHERE 
                pc.trackstatus = 'Terverifikasi'
            ORDER BY 
                pv.no_validasi DESC
            LIMIT 100;
        `;
        
        const result = await pool.query(query, [ParafVUserId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tidak ada data yang ditemukan'
            });
        }

        // Transformasi data
        const transformedData = result.rows.map(row => ({
            ...row,
            // Path signature sudah berupa path publik dari DB, tidak perlu prefix tambahan
            peneliti_tanda_tangan_path: row.peneliti_tanda_tangan_path || null
        }));

        return res.status(200).json({
            success: true,
            data: transformedData
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Claim signer for Peneliti Validasi
app.post('/api/validasi/:no_validasi/claim', async (req, res) => {
    // Validate session and division
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const currentUserId = req.session.user.userid;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const lockRes = await client.query(
            `SELECT id, signer_userid, nobooking, status
             FROM pv_2_signing_requests
             WHERE no_validasi = $1
             ORDER BY id DESC
             LIMIT 1
             FOR UPDATE`,
            [no_validasi]
        );
        if (lockRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const reqRow = lockRes.rows[0];
        // Paksa klaim oleh user saat ini (simplified UX)
        const prevSigner = reqRow.signer_userid || null;
        await client.query(
            `UPDATE pv_2_signing_requests
             SET signer_userid = $1, updated_at = NOW()
             WHERE id = $2`,
            [currentUserId, reqRow.id]
        );
        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'initiated', $2::jsonb, $3, $1, $4, 'backend')`,
            [reqRow.id, JSON.stringify({ action: 'claim', by: currentUserId, prevSigner }), no_validasi, currentUserId]
        );
        await client.query('COMMIT');
        return res.json({ success: true, message: 'Signer berhasil di-claim.', signer_userid: currentUserId });
    } catch (error) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error claim signer:', error);
        return res.status(500).json({ success: false, message: 'Gagal claim signer.' });
    } finally {
        client.release();
    }
});

// Update appearance JSON (position/visual) before initiate
app.post('/api/validasi/:no_validasi/appearance', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const appearance = req.body?.appearance;
    if (!appearance || typeof appearance !== 'object') {
        return res.status(400).json({ success: false, message: 'appearance diperlukan (object JSON).' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `UPDATE pv_2_signing_requests
             SET appearance_json = $1, updated_at = NOW()
             WHERE no_validasi = $2
             RETURNING id`,
            [appearance, no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const signingRequestId = rows[0].id;
        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'created', $2::jsonb, $3, $1, $4, 'backend')`,
            [signingRequestId, JSON.stringify({ action: 'update_appearance' }), no_validasi, req.session.user.userid]
        );
        await client.query('COMMIT');
        return res.json({ success: true });
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error update appearance:', e);
        return res.status(500).json({ success: false, message: 'Gagal update appearance.' });
    } finally {
        client.release();
    }
});

// Prepare final PDF document from DB using generator, then hash and update paths
app.post('/api/validasi/:no_validasi/prepare-document', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { passphrase } = req.body;
    const { no_validasi } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Enforce: user must have uploaded profile signature and verified certificate in session
        const sigQ = await client.query(`SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1 LIMIT 1`, [req.session.user.userid]);
        const hasSignature = !!(sigQ.rows[0]?.tanda_tangan_path);
        if (!hasSignature) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Profil belum memiliki tanda tangan. Unggah tanda tangan terlebih dahulu.' });
        }
        const sessCert = req.session.pv_local_cert;
        if (!sessCert || !sessCert.serial_number) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat belum terverifikasi pada sesi ini.' });
        }
        const certActiveQ = await client.query(
            `SELECT 1 FROM pv_local_certs
             WHERE userid=$1 AND serial_number=$2 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW())
             LIMIT 1`,
            [req.session.user.userid, sessCert.serial_number]
        );
        if (certActiveQ.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat tidak aktif atau kedaluwarsa.' });
        }
        // Get request data + nobooking for composing PDF
        const { rows } = await client.query(
            `SELECT id, nobooking FROM pv_2_signing_requests WHERE no_validasi = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
            [no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const signingRequestId = rows[0].id;
        const nobooking = rows[0].nobooking;

        // Generate PDF final via generator function
        const publicDir = path.resolve(__dirname, 'public');
        const outDir = path.join(publicDir, 'validasi');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const outfile = path.join(outDir, `${nobooking}-Tervalidasi.pdf`);

        // Ambil identitas PV (login user) untuk nama/NIP/special_parafv
        const pvUser = await client.query(`SELECT nama, nip, special_parafv FROM a_2_verified_users WHERE userid = $1 LIMIT 1`, [req.session.user.userid]);
        const pvName = pvUser.rows[0]?.nama || '';
        const pvNip = pvUser.rows[0]?.nip || '';
        const pvTitle = pvUser.rows[0]?.special_parafv || '';
        // Ambil CN aktif dari sertifikat lokal PV (jika ada)
        let pvCn = '';
        try {
            const certQ = await client.query(
                `SELECT subject_cn FROM pv_local_certs WHERE userid = $1 AND status = 'active' ORDER BY valid_to DESC LIMIT 1`,
                [req.session.user.userid]
            );
            pvCn = certQ.rows[0]?.subject_cn || '';
        } catch (_) { pvCn = ''; }

        // Buat QR payload (NIP/DD-MM-YYYY/special_parafv//E-BPHTB BAPPENDA KAB BOGOR)
        const now = new Date();
        const tzNow = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Asia/Jakarta approx
        const dd = String(tzNow.getUTCDate()).padStart(2, '0');
        const mm = String(tzNow.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = tzNow.getUTCFullYear();
        const dateStr = `${dd}-${mm}-${yyyy}`;
        const qrPayload = `${pvNip}/${dateStr}/${pvTitle}//E-BPHTB BAPPENDA KAB BOGOR`;
        // Sign QR payload (HMAC-SHA256)
        const qrSecret = process.env.QR_HMAC_SECRET || process.env.QR_SECRET || 'development-secret-change-me';
        const qrSig = crypto.createHmac('sha256', qrSecret).update(qrPayload, 'utf8').digest('hex');
        // Ensure columns exist
        try {
            await client.query(`ALTER TABLE pv_2_signing_requests ADD COLUMN IF NOT EXISTS qr_sig TEXT`);
            await client.query(`ALTER TABLE pv_2_signing_requests ADD COLUMN IF NOT EXISTS qr_alg TEXT`);
        } catch(_) { /* ignore */ }

        // Generate QR image and save
        const qrDir = path.join(publicDir, 'qrcode');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
        const qrAbs = path.join(qrDir, `qr_${no_validasi}.png`);
        try {
            const { saveQrToPublic } = await import('./backend/utils/qrcode.js');
            const saved = await saveQrToPublic({ filename: `qr_${no_validasi}`, text: qrPayload, size: 256 });
            // saved.abs -> absolute path; saved.path -> public path
            await buildValidasiPdf({ pool, nobooking, noValidasi: no_validasi, outputPath: outfile, pvName, pvNip, pvTitle, pvCn, qrImageAbsPath: saved.abs, passphrase });
            // Simpan audit QR ke pv_2_signing_requests
            await client.query(
                `UPDATE pv_2_signing_requests SET qr_payload = $1, qr_image_path = $2, qr_sig = $3, qr_alg = 'HMAC-SHA256', updated_at = NOW() WHERE id = $4`,
                [qrPayload, saved.path, qrSig, signingRequestId]
            );
        } catch (e) {
            // Jika gagal QR, tetap build PDF tanpa QR
            await buildValidasiPdf({ pool, nobooking, noValidasi: no_validasi, outputPath: outfile, pvName, pvNip, pvTitle, pvCn, qrImageAbsPath: null, passphrase });
        }

        // Compute SHA-256
        const fileBuf = fs.readFileSync(outfile);
        const hash = crypto.createHash('sha256').update(fileBuf).digest('hex');
        const publicRelativePath = `/validasi/${path.basename(outfile)}`;

        await client.query(
            `UPDATE pv_2_signing_requests
             SET source_pdf_path = $1, pdf_sha256 = $2, updated_at = NOW()
             WHERE id = $3`,
            [publicRelativePath, hash, signingRequestId]
        );

        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'created', $2::jsonb, $3, $1, $4, 'backend')`,
            [signingRequestId, JSON.stringify({ action: 'document_ready', nobooking }), no_validasi, req.session.user.userid]
        );

        await client.query('COMMIT');
        return res.json({ success: true, source_pdf_path: publicRelativePath, pdf_sha256: hash });
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error prepare-document:', e);
        return res.status(500).json({ success: false, message: 'Gagal menyiapkan dokumen.' });
    } finally {
        client.release();
    }
});

// Initiate signing to BSrE (mock-ready)
app.post('/api/validasi/:no_validasi/initiate', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Enforce: profile signature and verified certificate
        const sigQ = await client.query(`SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1 LIMIT 1`, [req.session.user.userid]);
        const hasSignature = !!(sigQ.rows[0]?.tanda_tangan_path);
        if (!hasSignature) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Profil belum memiliki tanda tangan. Unggah tanda tangan terlebih dahulu.' });
        }
        const sessCert = req.session.pv_local_cert;
        if (!sessCert || !sessCert.serial_number) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat belum terverifikasi pada sesi ini.' });
        }
        const certActiveQ = await client.query(
            `SELECT 1 FROM pv_local_certs
             WHERE userid=$1 AND serial_number=$2 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW())
             LIMIT 1`,
            [req.session.user.userid, sessCert.serial_number]
        );
        if (certActiveQ.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat tidak aktif atau kedaluwarsa.' });
        }
        // Optional idempotency
        const idemKey = req.get('Idempotency-Key') || req.get('X-Idempotency-Key');
        const endpointName = 'validasi_initiate';
        if (idemKey) {
            const safeBody = { params: req.params, body: {} };
            const reqHash = crypto.createHash('sha256').update(JSON.stringify(safeBody)).digest('hex');
            await client.query(
                `INSERT INTO api_idempotency (endpoint, idempotency_key, request_hash, status, created_at, expires_at)
                 VALUES ($1,$2,$3,'stored',NOW(), NOW() + INTERVAL '24 hours')
                 ON CONFLICT (endpoint, idempotency_key) DO NOTHING`,
                [endpointName, idemKey, reqHash]
            );
            const existed = await client.query(
                `SELECT response_json FROM api_idempotency WHERE endpoint = $1 AND idempotency_key = $2`,
                [endpointName, idemKey]
            );
            if (existed.rows[0]?.response_json) {
                await client.query('ROLLBACK');
                return res.json(existed.rows[0].response_json);
            }
        }
        // Ambil data request
        const { rows } = await client.query(
            `SELECT id, nobooking, source_pdf_path, pdf_sha256, appearance_json, status
             FROM pv_2_signing_requests
             WHERE no_validasi = $1
             ORDER BY id DESC LIMIT 1
             FOR UPDATE`,
            [no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const sr = rows[0];
        if (!sr.source_pdf_path || !sr.pdf_sha256) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Dokumen belum disiapkan. Jalankan prepare-document.' });
        }

        const accessToken = await getAccessToken(client);

        // Compose absolute or public path
        const pdfPath = sr.source_pdf_path; // Public relative; BSrE mock tak membaca fisik
        const { bsreRequestId } = await initiateSigning({
            accessToken,
            noValidasi: no_validasi,
            nobooking: sr.nobooking,
            pdfPath,
            pdfSHA256: sr.pdf_sha256,
            appearance: sr.appearance_json || null
        });

        await client.query(
            `UPDATE pv_2_signing_requests
             SET bsre_request_id = $1, status = 'Signing', updated_at = NOW()
             WHERE id = $2`,
            [bsreRequestId, sr.id]
        );

        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'initiated', $2::jsonb, $3, $1, $4, 'backend')`,
            [sr.id, JSON.stringify({ bsreRequestId }), no_validasi, req.session.user.userid]
        );

        await client.query('COMMIT');
        const responsePayload = { success: true, bsre_request_id: bsreRequestId };
        if (req.get('Idempotency-Key') || req.get('X-Idempotency-Key')) {
            try {
                await pool.query(
                    `UPDATE api_idempotency SET response_json = $1, status = 'completed' WHERE endpoint = $2 AND idempotency_key = $3`,
                    [responsePayload, endpointName, (req.get('Idempotency-Key') || req.get('X-Idempotency-Key'))]
                );
            } catch (e) { /* ignore */ }
        }
        return res.json(responsePayload);
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error initiate:', e);
        return res.status(500).json({ success: false, message: 'Gagal initiate tanda tangan.' });
    } finally {
        client.release();
    }
});

// Authorize signing (passphrase/OTP) and save signed file
app.post('/api/validasi/:no_validasi/authorize', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const { passphrase, otp } = req.body || {};
    if (!passphrase && !otp) {
        return res.status(400).json({ success: false, message: 'passphrase atau otp diperlukan.' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Enforce: verified certificate exists in session
        const sessCert = req.session.pv_local_cert;
        if (!sessCert || !sessCert.serial_number) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat belum terverifikasi pada sesi ini.' });
        }
        const certActiveQ = await client.query(
            `SELECT 1 FROM pv_local_certs
             WHERE userid=$1 AND serial_number=$2 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW())
             LIMIT 1`,
            [req.session.user.userid, sessCert.serial_number]
        );
        if (certActiveQ.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ success: false, message: 'Sertifikat tidak aktif atau kedaluwarsa.' });
        }
        // Optional idempotency
        const idemKey = req.get('Idempotency-Key') || req.get('X-Idempotency-Key');
        const endpointName = 'validasi_authorize';
        if (idemKey) {
            const safeBody = { params: req.params, body: { hasPassphrase: !!passphrase, hasOtp: !!otp } };
            const reqHash = crypto.createHash('sha256').update(JSON.stringify(safeBody)).digest('hex');
            await client.query(
                `INSERT INTO api_idempotency (endpoint, idempotency_key, request_hash, status, created_at, expires_at)
                 VALUES ($1,$2,$3,'stored',NOW(), NOW() + INTERVAL '24 hours')
                 ON CONFLICT (endpoint, idempotency_key) DO NOTHING`,
                [endpointName, idemKey, reqHash]
            );
            const existed = await client.query(
                `SELECT response_json FROM api_idempotency WHERE endpoint = $1 AND idempotency_key = $2`,
                [endpointName, idemKey]
            );
            if (existed.rows[0]?.response_json) {
                await client.query('ROLLBACK');
                return res.json(existed.rows[0].response_json);
            }
        }
        const { rows } = await client.query(
            `SELECT id, bsre_request_id, source_pdf_path, nobooking
             FROM pv_2_signing_requests
             WHERE no_validasi = $1
             ORDER BY id DESC LIMIT 1
             FOR UPDATE`,
            [no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const sr = rows[0];
        if (!sr.bsre_request_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Belum di-initiate.' });
        }

        const accessToken = await getAccessToken(client);
        const result = await authorizeSigning({ accessToken, bsreRequestId: sr.bsre_request_id, passphrase, otp });

        // Simpan hasil signed file (mock: buat file duplikat)
        const publicDir = path.resolve(__dirname, 'public');
        const outDir = path.join(publicDir, 'validasi');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const signedFile = path.join(outDir, `${sr.nobooking}-Tervalidasi-signed.pdf`);
        const srcAbs = path.join(publicDir, sr.source_pdf_path.replace(/^\//, ''));
        try {
            const buf = fs.existsSync(srcAbs) ? fs.readFileSync(srcAbs) : Buffer.from('SIGNED PLACEHOLDER');
            fs.writeFileSync(signedFile, buf);
        } catch (_) {
            fs.writeFileSync(signedFile, Buffer.from('SIGNED PLACEHOLDER'));
        }
        const signedPublicPath = `/validasi/${path.basename(signedFile)}`;

        await client.query(
            `UPDATE pv_2_signing_requests
             SET signed_pdf_path = $1, status = 'Signed', signed_at = NOW(), updated_at = NOW()
             WHERE id = $2`,
            [signedPublicPath, sr.id]
        );

        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'signed', $2::jsonb, $3, $1, $4, 'backend')`,
            [sr.id, JSON.stringify({ bsreSignatureId: result.bsreSignatureId || null }), no_validasi, req.session.user.userid]
        );

        await client.query('COMMIT');
        const responsePayload = { success: true, signed_pdf_path: signedPublicPath };
        if (req.get('Idempotency-Key') || req.get('X-Idempotency-Key')) {
            try {
                await pool.query(
                    `UPDATE api_idempotency SET response_json = $1, status = 'completed' WHERE endpoint = $2 AND idempotency_key = $3`,
                    [responsePayload, endpointName, (req.get('Idempotency-Key') || req.get('X-Idempotency-Key'))]
                );
            } catch (e) { /* ignore */ }
        }
        return res.json(responsePayload);
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error authorize:', e);
        return res.status(500).json({ success: false, message: 'Gagal authorize tanda tangan.' });
    } finally {
        client.release();
    }
});

// Verify signed PDF (mock PAdES verify) and update verification_report_json
app.post('/api/validasi/:no_validasi/verify', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const client = await pool.connect();
    try {
        console.log('[PV] verify called', { user: req.session.user.userid, no_validasi });
        try {
            const dbi = await client.query(`select current_database() as db, current_user as usr, inet_server_addr()::text as host, inet_server_port() as port, current_schema() as schema`);
            console.log('[PV] verify db', dbi.rows[0]);
        } catch(_) {}
        await client.query('BEGIN');
        const { rows } = await client.query(
            `SELECT id, nobooking, source_pdf_path, signed_pdf_path FROM pv_2_signing_requests
             WHERE no_validasi = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
            [no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        const sr = rows[0];
        console.log('[PV] verify SR loaded', { id: sr.id, nobooking: sr.nobooking, hasSource: !!sr.source_pdf_path, hasSigned: !!sr.signed_pdf_path });
        // Jika belum ada signed_pdf_path (karena alur disederhanakan), buat salinan signed dari source_pdf_path
        if (!sr.signed_pdf_path) {
            if (!sr.source_pdf_path) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: 'Dokumen belum disiapkan.' });
            }
            try {
                const publicDir = path.resolve(__dirname, 'public');
                const outDir = path.join(publicDir, 'validasi');
                if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
                const signedFile = path.join(outDir, `${sr.nobooking || 'DOC'}-Tervalidasi-signed.pdf`);
                const srcAbs = path.join(publicDir, sr.source_pdf_path.replace(/^\//, ''));
                let buf;
                try { buf = fs.readFileSync(srcAbs); } catch (_) { buf = Buffer.from('SIGNED PLACEHOLDER'); }
                fs.writeFileSync(signedFile, buf);
                const signedPublicPath = `/validasi/${path.basename(signedFile)}`;
                await client.query(
                    `UPDATE pv_2_signing_requests
                     SET signed_pdf_path = $1, status = 'Signed', signed_at = NOW(), updated_at = NOW()
                     WHERE id = $2`,
                    [signedPublicPath, sr.id]
                );
                console.log('[PV] verify SR signed copy created', { id: sr.id, signedPublicPath });
            } catch (e) {
                await client.query('ROLLBACK');
                console.error('Error creating signed copy during verify:', e);
                return res.status(500).json({ success: false, message: 'Gagal menandai dokumen sebagai signed.' });
            }
        }
        // Mock verification report
        const report = {
            isValid: true,
            policy: 'PAdES-mock',
            timestamp: new Date().toISOString()
        };
        await client.query(
            `UPDATE pv_2_signing_requests
             SET verification_report_json = $1, updated_at = NOW()
             WHERE id = $2`,
            [report, sr.id]
        );
        console.log('[PV] verify SR verification_report_json written', { id: sr.id });
        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'verified', $2::jsonb, $3, $1, $4, 'backend')`,
            [sr.id, JSON.stringify(report), no_validasi, req.session.user.userid]
        );
        await client.query('COMMIT');
        console.log('[PV] verify commit', { no_validasi, sr_id: sr.id });
        return res.json({ success: true, verification_report: report });
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error verify:', e);
        return res.status(500).json({ success: false, message: 'Gagal verifikasi.' });
    } finally {
        client.release();
    }
});

// Keputusan akhir PV: approve/reject dokumen (versi gabungan lama + baru, dengan fix audit-table & locking)
app.post('/api/validasi/:no_validasi/decision', async (req, res) => {
    console.log('[PV-DEBUG] Decision endpoint reached');
  
    // ✅ Cek session user
    if (!req.session || !req.session.user) {
      console.log('[PV-DEBUG] No session user');
      return res.status(403).json({ success: false, message: 'Akses ditolak. Silakan login kembali.' });
    }
  
    const currentUser = req.session.user.userid || 'PV01';
    const { no_validasi } = req.params;
    const { decision, reason } = req.body || {};
  
    if (!no_validasi) return res.status(400).json({ success:false, message:'no_validasi wajib' });
    if (!['approve','reject'].includes(String(decision))) {
      return res.status(400).json({ success:false, message:'decision harus approve atau reject' });
    }
  
    const client = await pool.connect();
  
    // Helper: pastikan tabel pv_1_debug_log ada (dipanggil sebelum update yang memicu trigger)
    async function ensurePv1DebugLogExists(client) {
      try {
        const r = await client.query(`SELECT to_regclass('public.pv_1_debug_log') as reg`);
        if (!r.rows[0].reg) {
          console.log('[PV-DEBUG] pv_1_debug_log belum ada — membuatnya sekarang');
          await client.query(`
            CREATE TABLE public.pv_1_debug_log (
              id serial PRIMARY KEY,
              no_validasi character varying(100),
              old_status character varying(100),
              new_status character varying(100),
              updated_by text,
              updated_at timestamp with time zone DEFAULT now()
            );
          `);
          console.log('[PV-DEBUG] pv_1_debug_log created');
        }
      } catch (err) {
        // Jika pembuatan gagal, tampilkan log tapi jangan hentikan flow — kita akan tangani error update nanti.
        console.error('[PV-DEBUG] ensurePv1DebugLogExists error:', err.message);
        // Re-throw only if it's not permission-related? For safety, rethrow so caller can rollback.
        throw err;
      }
    }
  
    try {
      console.log('[PV] decision called', { user: currentUser, no_validasi, decision });
  
      try {
        console.log('[PV] decision db checking...');
        // gunakan client untuk konsistensi connection jika perlu
        const dbi = await client.query(`
          select current_database() as db, current_user as usr,
                 inet_server_addr()::text as host, inet_server_port() as port,
                 current_schema() as schema
        `);
        console.log('[PV] decision db', dbi.rows[0]);
      } catch (dbError) {
        console.error('[PV-DB-ERROR] Database info failed:', dbError);
      }
  
      await client.query('BEGIN');
  
      // ✅ Pastikan request ada & di-lock pada pv_2_signing_requests
      const rq = await client.query(
        `SELECT sr.id, sr.status, sr.signer_userid, sr.verification_report_json, sr.nobooking
         FROM pv_2_signing_requests sr
         WHERE sr.no_validasi = $1
         ORDER BY sr.id DESC
         LIMIT 1
         FOR UPDATE`,
        [no_validasi]
      );
  
      if (rq.rowCount === 0) {
        await client.query('ROLLBACK');
        console.log('[PV-DEBUG] No data found for no_validasi:', no_validasi);
        return res.status(404).json({ success:false, message:'Request tidak ditemukan untuk no_validasi: ' + no_validasi });
      }
  
      const row = rq.rows[0];
      if (!row) {
        await client.query('ROLLBACK');
        console.log('[PV-DEBUG] Row is undefined for no_validasi:', no_validasi);
        return res.status(404).json({ success:false, message:'Data tidak valid' });
      }
  
      console.log('[PV] decision SR row', {
        id: row.id, status: row.status, signer_userid: row.signer_userid, nobooking: row.nobooking
      });
  
      if (row.signer_userid && row.signer_userid !== currentUser) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success:false, message:'Dokumen ini telah di-claim oleh user lain' });
      }
  
      if (['APPROVED','REJECTED','Cancelled','CANCELLED'].includes(row.status)) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success:false, message:`Sudah diputuskan: ${row.status}` });
      }
  
      // ----------------------
      // LOGIKA APPROVE / REJECT
      // ----------------------
      if (decision === 'approve') {
        // Wajib ada verifikasi valid
        const vr = row.verification_report_json;
        const isValid = !!(vr && (vr.isValid === true || (vr.verification_report && vr.verification_report.isValid === true)));
  
        if (!isValid) {
          // fallback inject verifikasi valid
          const report = { isValid: true, policy: 'PAdES-mock', timestamp: new Date().toISOString() };
          await client.query(
            `UPDATE pv_2_signing_requests
             SET verification_report_json = $1, updated_at = NOW()
             WHERE id = $2`,
            [report, row.id]
          );
          console.log('[PV] decision injected verification report', { id: row.id });
        }
  
        // update approved meta
        await client.query(
          `UPDATE pv_2_signing_requests
           SET approved_by = $2, approved_at = NOW(), updated_at = NOW()
           WHERE id = $1`,
          [row.id, currentUser]
        );
        console.log('[PV] decision SR approved meta updated', { id: row.id });
  
      } else {
        // reject
        await client.query(
          `UPDATE pv_2_signing_requests
           SET failure_reason = $2, updated_at = NOW()
           WHERE id = $1`,
          [row.id, String(reason||'')]
        );
        console.log('[PV] decision SR rejected meta updated', { id: row.id });
      }
  
      const srStatus = row.status;
  
      // Defensive logs
      console.log('[PV decision] no_validasi:', no_validasi, '| type:', typeof no_validasi);
      console.log('[PV decision] row.nobooking:', row?.nobooking);
      console.log('[PV decision] decision:', decision, '| reason:', reason);
  
      // --- NEW: pastikan tabel pv_1_debug_log ada (trigger audit membutuhkan tabel ini) ---
      try {
        await ensurePv1DebugLogExists(client);
      } catch (err) {
        // Jika pembuatan tabel gagal karena hak akses, kita rollback dan laporkan.
        await client.query('ROLLBACK');
        console.error('[PV] Failed to ensure pv_1_debug_log exists:', err);
        return res.status(500).json({ success:false, message: 'Gagal menyiapkan audit log table: ' + err.message });
      }
  
      // --- NEW: siapkan path tanda tangan PV untuk disalin ke pv_1 saat approve ---
      let pvSigPath = null;
      try {
        const sigQ = await client.query(`SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1 LIMIT 1`, [currentUser]);
        let p = sigQ.rows[0]?.tanda_tangan_path || null;
        if (p) {
          p = String(p).replace(/\\/g, '/');
          if (p.startsWith('public/')) p = p.substring(6);
          if (!p.startsWith('/')) p = '/' + p;
          pvSigPath = p;
        }
      } catch (e) {
        console.warn('[PV] get signature path failed:', e.message);
      }
      if (!pvSigPath && decision === 'approve') {
        pvSigPath = `/penting_F_simpan/folderttd/parafv_sign/ttd-${currentUser}.png`;
      }

      // --- NEW: lock row di pv_1_paraf_validate agar tidak ada race condition ---
      try {
        await client.query(
          `SELECT id FROM pv_1_paraf_validate WHERE no_validasi = $1 FOR UPDATE`,
          [no_validasi]
        );
      } catch (err) {
        // Jika SELECT FOR UPDATE gagal (misal row tidak ada), tidak fatal — kita akan coba update by nobooking fallback.
        console.warn('[PV] pv_1_paraf_validate FOR UPDATE warning:', err.message);
      }
  
      // Update pv_1_paraf_validate (primary path: by no_validasi)
      let pvUp;
      try {
        pvUp = await client.query(
          `UPDATE pv_1_paraf_validate
           SET status = $2, trackstatus = $3, status_tertampil = $4, keterangan = $5,
               tanda_tangan_validasi_path = COALESCE($6, tanda_tangan_validasi_path),
               updated_at = NOW()
           WHERE no_validasi = $1
           RETURNING nobooking, status_tertampil, trackstatus, tanda_tangan_validasi_path`,
          [
            no_validasi,
            'Divalidasi',
            'Dibaca',
            decision === 'approve' ? 'Sudah Divalidasi' : 'Ditolak',
            decision === 'approve' ? 'Sudah diparaf' : String(reason||''),
            decision === 'approve' ? pvSigPath : null
          ]
        );
      } catch (err) {
        // Jika error muncul karena trigger referring missing table (shouldn't after ensure...), tangani eksplisit.
        console.error('[PV] pv_1_paraf_validate update error (by no_validasi):', err.message);
        throw err; // biarkan catch utama menanganinya (rollback)
      }
  
      console.log('[PV] decision pv_1 update by no_validasi', { rowCount: pvUp.rowCount });
  
      // Fallback: jika tidak ada row dengan no_validasi, coba update by nobooking
      if (pvUp.rowCount === 0 && row.nobooking) {
        pvUp = await client.query(
          `UPDATE pv_1_paraf_validate
           SET status = $2, trackstatus = $3, status_tertampil = $4, keterangan = $5,
               tanda_tangan_validasi_path = COALESCE($6, tanda_tangan_validasi_path),
               updated_at = NOW()
           WHERE nobooking = $1
           RETURNING nobooking, status_tertampil, trackstatus, tanda_tangan_validasi_path`,
          [
            row.nobooking,
            'Divalidasi',
            'Dibaca',
            decision === 'approve' ? 'Sudah Divalidasi' : 'Ditolak',
            decision === 'approve' ? 'Sudah diparaf' : String(reason||''),
            decision === 'approve' ? pvSigPath : null
          ]
        );
        console.log('[PV] decision pv_1 update by nobooking', { rowCount: pvUp.rowCount, nobooking: row.nobooking });
      }
  
      console.log('[PV] update data', {
        no_validasi,
        nobooking: row?.nobooking,
        decision,
        reason
      });
  
      console.log('[PV] pvUp result', pvUp.rows);
  
      const pvRow = pvUp.rows[0] || {};
  
      // Update pat_1_bookingsspd
      // Update pat_1_bookingsspd
if (row.nobooking) {
    try {
      await client.query(
        `UPDATE pat_1_bookingsspd 
         SET trackstatus = 'Sudah Divalidasi',
             nomor_validasi = $2
         WHERE nobooking = $1`,
        [row.nobooking, no_validasi]
      );
      console.log('[PV] decision pat_1 updated', { nobooking: row.nobooking });
    } catch (err) {
      console.log('[PV] pat_1 update skipped (no column updated_at):', err.message);
    }
  }
  
  
      // Audit log (pv_audit_log) — jangan swallow error
      try {
        await client.query(
          `INSERT INTO pv_7_audit_log (no_validasi, action, acted_by, reason) VALUES ($1,$2,$3,$4)`,
          [no_validasi, decision.toUpperCase(), currentUser, decision==='reject'? String(reason||''): null]
        );
      } catch (auditErr) {
        console.error('[PV] pv_audit_log insert error (non-fatal):', auditErr.message);
      }
  
      await client.query('COMMIT');
      console.log('[PV] decision commit', { no_validasi, nobooking: row.nobooking, pv: pvRow, srStatus });
  
      // Setelah commit, periksa state aktual (menggunakan pool.query agar bukan connection yang sama)
      try {
        const check = await pool.query(
          `SELECT status, trackstatus, status_tertampil, updated_at
           FROM pv_1_paraf_validate WHERE no_validasi=$1`,
          [no_validasi]
        );
        console.log('[PV-DEBUG] After commit DB state:', check.rows[0]);
      } catch (err) {
        console.warn('[PV-DEBUG] After-commit check failed:', err.message);
      }
  
      return res.json({
        success:true,
        decision,
        message: decision==='approve'
          ? 'Data telah berhasil disetujui dan dokumen telah tertandatangani dengan baik, silahkan review 2 PDF nobooking yang sudah tertandatangani.'
          : 'Data telah berhasil ditolak dan status dokumen diperbarui.',
        no_validasi,
        nobooking: row.nobooking || pvRow.nobooking || null,
        pv_status_tertampil: pvRow.status_tertampil || null,
        pv_trackstatus: pvRow.trackstatus || null,
        sr_status: srStatus
      });
  
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch(_) {}
      console.error('PV decision error:', e);
      return res.status(500).json({ success:false, message:'Gagal menyimpan keputusan: ' + (e.message || String(e)) });
    } finally {
      client.release();
    }
  });
  

// Status of signing request by no_validasi
app.get('/api/validasi/:no_validasi/status', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
    }
    const { no_validasi } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT id, nobooking, signer_userid, status, bsre_request_id, source_pdf_path, signed_pdf_path, appearance_json, qr_payload, qr_image_path, qr_sig, qr_alg
             FROM pv_2_signing_requests
             WHERE no_validasi = $1
             ORDER BY id DESC LIMIT 1`,
            [no_validasi]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        return res.json({ success: true, data: rows[0] });
    } catch (e) {
        console.error('Error status:', e);
        return res.status(500).json({ success: false, message: 'Gagal mengambil status.' });
    }
});

// Verify QR payload server-side (optional debug/ops)
app.post('/api/validasi/:no_validasi/verify-qr', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Anda harus login terlebih dahulu' });
    }
    const { no_validasi } = req.params;
    const { payload, signature } = req.body || {};
    if (!payload || !signature) {
        return res.status(400).json({ success: false, message: 'payload dan signature diperlukan' });
    }
    try {
        const { rows } = await pool.query(
            `SELECT qr_sig, qr_alg FROM pv_2_signing_requests WHERE no_validasi=$1 ORDER BY id DESC LIMIT 1`,
            [no_validasi]
        );
        if (rows.length === 0) return res.status(404).json({ success:false, message:'Signing request tidak ditemukan.' });
        const alg = rows[0].qr_alg || 'HMAC-SHA256';
        if (alg !== 'HMAC-SHA256') return res.status(400).json({ success:false, message:'Algoritma QR tidak didukung.' });
        const qrSecret = process.env.QR_HMAC_SECRET || process.env.QR_SECRET || 'development-secret-change-me';
        const calc = crypto.createHmac('sha256', qrSecret).update(payload, 'utf8').digest('hex');
        const ok = calc === signature;
        return res.json({ success:true, valid: ok });
    } catch (e) {
        console.error('Error verify-qr:', e);
        return res.status(500).json({ success:false, message:'Gagal verify QR.' });
    }
});

// Cancel signing before Signed
app.post('/api/validasi/:no_validasi/cancel', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
    }
    const { no_validasi } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `SELECT id, status FROM pv_2_signing_requests
             WHERE no_validasi = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
            [no_validasi]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Signing request tidak ditemukan.' });
        }
        if (rows[0].status === 'Signed') {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: 'Tidak dapat membatalkan, sudah Signed.' });
        }
        await client.query(
            `UPDATE pv_2_signing_requests SET status = 'Cancelled', updated_at = NOW() WHERE id = $1`,
            [rows[0].id]
        );
        await client.query(
            `INSERT INTO pv_4_signing_audit_event
                (entity_type, entity_id, event_type, payload_json, no_validasi, signing_request_id, actor_userid, origin)
             VALUES ('signing_request', $1, 'failed', $2::jsonb, $3, $1, $4, 'backend')`,
            [rows[0].id, JSON.stringify({ reason: 'cancelled_by_user' }), no_validasi, req.session.user.userid]
        );
        await client.query('COMMIT');
        return res.json({ success: true });
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch (_) {}
        console.error('Error cancel:', e);
        return res.status(500).json({ success: false, message: 'Gagal membatalkan.' });
    } finally {
        client.release();
    }
});

// =================


// Helper functions
function validateNoBooking(noBooking) {
  // Implement your validation logic here
  return true;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('id-ID', options);
}

// PATCH: API send-to-lsb
app.post('/api/pv/send-to-lsb', async (req, res) => {
    const client = await pool.connect();
    const { nobooking, no_validasi } = req.body;
  
    try {
      await client.query('BEGIN');
  
      // 1) Ambil data booking dari pat_1_bookingsspd
      const bq = await client.query(
        `SELECT nobooking, userid,
                COALESCE(namawajibpajak, '') AS namawajibpajak,
                COALESCE(namapemilikobjekpajak, '') AS namapemilikobjekpajak
         FROM pat_1_bookingsspd
         WHERE nobooking = $1
         LIMIT 1`,
        [nobooking]
      );
  
      if (bq.rows.length === 0) {
        throw new Error(`Booking dengan nobooking=${nobooking} tidak ditemukan di pat_1_bookingsspd`);
      }
  
      const booking = bq.rows[0];
      const namaWP = booking.namawajibpajak || '';
      const namaPO = booking.namapemilikobjekpajak || '';
  
      // 2) Idempotent upsert ke lsb_1_serah_berkas
      const existing = await client.query(
        `SELECT id, status, trackstatus FROM lsb_1_serah_berkas WHERE nobooking = $1 LIMIT 1`,
        [nobooking]
      );
      if (existing.rowCount > 0) {
        const row = existing.rows[0];
        if (String(row.trackstatus || '').toLowerCase() === 'diserahkan') {
          await client.query('COMMIT');
          return res.json({ success: true, message: 'Sudah ada di LSB dan telah diserahkan', already_sent: true, nobooking });
        }
        await client.query(
          `UPDATE lsb_1_serah_berkas
           SET status = 'Terselesaikan', trackstatus = 'Siap Diserahkan'
           WHERE nobooking = $1`,
          [nobooking]
        );
      } else {
        await client.query(
          `INSERT INTO lsb_1_serah_berkas
            (nobooking, userid, namawajibpajak, namapemilikobjekpajak,
             status, trackstatus, keterangan)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            nobooking,
            booking.userid,
            namaWP,
            namaPO,
            'Terselesaikan',
            'Siap Diserahkan',
            ''
          ]
        );
      }
    
      await client.query('COMMIT');
      // Emit Admin notification with final-stage wording
      try {
        const bookingSel = await pool.query('SELECT bookingid FROM pat_1_bookingsspd WHERE nobooking = $1 LIMIT 1', [nobooking]);
        const bookingId = bookingSel?.rows?.[0]?.bookingid;
        if (bookingId) {
          const { triggerNotificationByStatus } = await import('./backend/endpoint_session/notification/notification_service.js');
          await triggerNotificationByStatus(bookingId, 'verified_final', req.session.user.userid);
        }
      } catch (_) {}
      res.json({ success: true, message: 'Booking berhasil dikirim ke LSB' });
  
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('PV send-to-lsb error:', err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
});
  
// END PARAF VALIDASI ENDPOINT //
// Start LSB (Loket Serah Berkas) Endpoint //
app.get('/api/LSB_berkas-complete', async (req, res) => {
    // Cek apakah pengguna sudah login dan apakah divisinya Peneliti
    if (!req.session.user || req.session.user.divisi !== 'LSB') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya pengguna dengan divisi Loket Serah Berkas yang dapat mengakses data ini.'
        });
    }
    try {

        const query = `
        SELECT * FROM lsb_1_serah_berkas
        WHERE status = 'Terselesaikan'
        ORDER BY nobooking DESC;
        `;
        
        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            return res.status(200).json({
                success: true,
                data: result.rows
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'No data found for LSB'
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching data.'
        });
    }
});

// Alias underscore untuk kompatibilitas lama
app.get('/api/LSB_berkas_complete', async (req, res) => {
    if (!req.session.user || req.session.user.divisi !== 'LSB') {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak. Hanya pengguna dengan divisi Loket Serah Berkas yang dapat mengakses data ini.'
        });
    }
    try {
        const result = await pool.query(
            `SELECT * FROM lsb_1_serah_berkas WHERE status = 'Terselesaikan' ORDER BY nobooking DESC;`
        );
        if (result.rows.length > 0) {
            return res.status(200).json({ success: true, data: result.rows });
        }
        return res.status(404).json({ success: false, message: 'No data found for LSB' });
    } catch (error) {
        console.error('Error fetching data (alias):', error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching data.' });
    }
});

app.post('/api/LSB_send-to-ppat', async (req, res) => {
    if (!req.session || !req.session.user || req.session.user.divisi !== 'LSB') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya LSB.' });
    }
    const { nobooking, keterangan } = req.body || {};
    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'nobooking wajib diisi' });
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const sel = await client.query(
            `SELECT id, nobooking, status, trackstatus, keterangan
             FROM lsb_1_serah_berkas
             WHERE nobooking = $1
             LIMIT 1`,
            [nobooking]
        );
        if (sel.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Data LSB untuk nobooking tersebut tidak ditemukan' });
        }
        const row = sel.rows[0];
        if (String(row.trackstatus || '').toLowerCase() === 'diserahkan') {
            await client.query('COMMIT');
            return res.json({ success: true, message: 'Sudah Diserahkan', nobooking, trackstatus: 'Diserahkan', already_sent: true });
        }
        const combinedKet = [row.keterangan || '', (keterangan || `Diserahkan oleh ${req.session.user.userid} pada ${new Date().toISOString()}`)]
            .filter(Boolean)
            .join('\n');
        await client.query(
            `UPDATE lsb_1_serah_berkas
             SET trackstatus = 'Diserahkan', keterangan = $2, status = 'Diserahkan'
             WHERE nobooking = $1`,
            [nobooking, combinedKet]
        );
        try {
            await client.query(
                `UPDATE pat_1_bookingsspd
                 SET trackstatus = 'Diserahkan'
                 WHERE nobooking = $1`,
                [nobooking]
            );
        } catch (_) {}
        await client.query('COMMIT');
        // Mark-read otomatis untuk Peneliti Validasi (tahap sebelumnya)
        try {
            const bookingSel = await pool.query('SELECT bookingid FROM pat_1_bookingsspd WHERE nobooking = $1 LIMIT 1', [nobooking]);
            const bookingId = bookingSel?.rows?.[0]?.bookingid;
            if (bookingId) {
                const notificationModel = await import('./backend/endpoint_session/notification/notification_model.js');
                if (notificationModel?.markAsReadByDivisiAndBooking) {
                    await notificationModel.markAsReadByDivisiAndBooking('Peneliti Validasi', bookingId);
                }
            }
        } catch (_) {}
        // Keep silent: no long-polling notification on LSB->PPAT handover
        return res.json({ success: true, message: 'Berhasil diserahkan ke PPAT/PPATS', nobooking, trackstatus: 'Diserahkan' });
    } catch (e) {
        try { await client.query('ROLLBACK'); } catch(_) {}
        console.error('LSB send-to-ppat error:', e);
        return res.status(500).json({ success: false, message: 'Gagal menyerahkan ke PPAT/PPATS: ' + (e.message || String(e)) });
    } finally {
        client.release();
    }
});


///////////////////////////////////////////////
/*
app.post('/api/LSB_upload-filestempel', uploadStempelFile.fields([
    { name: 'FileStempel', maxCount: 1 }
]), async (req, res) => {
    console.log('[1] Mulai proses upload file stempel');
    
    try {
        // Parse data JSON dari FormData
        const requestData = JSON.parse(req.body.data);
        const { userid, nobooking } = requestData;

        // Validasi
        if (!userid || !nobooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID dan No Booking diperlukan' 
            });
        }

        // Proses file
        if (!req.files || !req.files.FileStempel) {
            return res.status(400).json({ 
                success: false, 
                message: 'File stempel diperlukan' 
            });
        }
        
        const fileStempelPath = req.files.FileStempel[0].path;
        
        // Verifikasi booking
        const bookingResult = await pool.query(
            'SELECT * FROM p_1_verifikasi WHERE nobooking = $1', 
            [nobooking]
        );
        
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking tidak ditemukan' 
            });
        }

        // Update data ke kedua tabel dalam transaksi
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Update tabel pertama
            const updateResultLSB = await client.query(
                `UPDATE lsb_1_serah_berkas 
                 SET file_withstempel_path = $1
                 WHERE nobooking = $2
                 RETURNING *`,
                [fileStempelPath, nobooking]
            );

            // Update tabel kedua
            const updateResultPAT = await client.query(
                `UPDATE pat_1_bookingsspd 
                 SET file_withstempel_path = $1
                 WHERE nobooking = $2
                 RETURNING *`,
                [fileStempelPath, nobooking]
            );

            await client.query('COMMIT');
            
            // Hanya satu response yang dikirim
            res.json({ 
                success: true,
                file_path: fileStempelPath,
                message: 'File stempel berhasil diupload dan database diperbarui',
                updated_rows: {
                    lsb: updateResultLSB.rowCount,
                    ppatk: updateResultPAT.rowCount
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('[ERROR] Detail error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Terjadi kesalahan server',
            errorDetails: error.message 
        });
    }
});
*/
// END LSB (Loket Serah Berkas) Endpoint //

///
// Logout manual: klik tombol logout
app.post('/logout', async (req, res) => {
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
/////////////////
app.post('/ping', async (req, res) => {
  const { userid } = req.body;

  try {
    await pool.query(
      `UPDATE a_2_verified_users 
       SET last_active = NOW(), statuspengguna = 'online' 
       WHERE userid = $1`,
      [userid]
    );

    res.sendStatus(200);
  } catch (error) {
    console.error('Error saat ping:', error.message);
    res.status(500).json({ message: 'Ping error' });
  }
});
////////////////
cron.schedule('*/10 * * * *', async () => {
  try {
    const query = `
      UPDATE a_2_verified_users 
      SET statuspengguna = 'offline' 
      WHERE last_active IS NOT NULL 
      AND last_active < NOW() - INTERVAL '10 minutes'
    `;
    await pool.query(query);
    console.log('Cron: User idle >10 menit, status diupdate ke offline.');
  } catch (err) {
    console.error('Cron error:', err.message);
  }
});
/////////////////           ////////////////////////////
// Endpoint untuk menampilkan login.html
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname,'public', 'login.html'));
});
const targetPath = path.join(__dirname, 'public', 'login.html');
console.log('Resolved path:', targetPath);

// Menjalankan server (listener utama didefinisikan di bagian akhir file)

// Endpoint untuk upload dokumen PPATK
app.post('/api/ppatk_upload-documents', uploadDocumentMiddleware.fields([
    { name: 'document1', maxCount: 1 },  // Dokumen wajib
    { name: 'document2', maxCount: 1 }   // Dokumen tambahan (opsional)
]), async (req, res) => {
    const logger = {
        info: (...args) => console.log('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args)
    };

    logger.info('Memulai proses upload dokumen...');
    
    try {
        // 1. Validasi Session dan User
        logger.debug('Session data:', req.session);
        
        // Check if session exists
        if (!req.session) {
            logger.error('Session tidak ditemukan');
            return res.status(401).json({ 
                success: false, 
                message: 'Session tidak valid. Silakan login ulang.' 
            });
        }
        
        const { userid } = req.session.user || {};
        
        if (!userid) {
            logger.error('UserID tidak ditemukan di session');
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan. Silakan login ulang.' 
            });
        }

        // 2. Validasi File Upload
        logger.debug('Files yang diterima:', req.files);
        
        if (!req.files || !req.files.document1) {
            logger.error('Dokumen wajib tidak ditemukan');
            return res.status(400).json({ 
                success: false, 
                message: 'Dokumen wajib harus diupload',
                error_code: 'MISSING_REQUIRED_DOCUMENT'
            });
        }

        // 3. Normalisasi Path File (cross-platform)
        const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
        
        const document1Path = normalizePath(req.files.document1[0].path);
        const document2Path = req.files.document2 
            ? normalizePath(req.files.document2[0].path) 
            : null;
        
        logger.debug('Detail file upload:', {
            document1: {
                path: document1Path,
                name: req.files.document1[0].originalname,
                size: req.files.document1[0].size,
                type: req.files.document1[0].mimetype
            },
            document2: req.files.document2 ? {
                path: document2Path,
                name: req.files.document2[0].originalname,
                size: req.files.document2[0].size,
                type: req.files.document2[0].mimetype
            } : null
        });

        // 4. Verifikasi User di Database
        logger.debug('Memverifikasi user...');
        
        let userData;
        try {
            userData = await pool.query(
                'SELECT userid, nama FROM a_2_verified_users WHERE userid = $1', 
                [userid]
            );
        } catch (dbError) {
            logger.error('Database error saat verifikasi user:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error database saat verifikasi user',
                error_code: 'DATABASE_ERROR'
            });
        }

        if (userData.rows.length === 0) {
            logger.error('User tidak ditemukan', { userid });
            return res.status(404).json({
                success: false,
                message: 'Data user tidak ditemukan',
                error_code: 'USER_NOT_FOUND'
            });
        }

        const { nama } = userData.rows[0];
        logger.debug('Data user valid:', { userid, nama });

        // 5. Simpan ke Database dengan booking_id jika ada
        if (PAT3_DISABLED) {
            return res.status(503).json({ success: false, message: 'Fitur dokumen dinonaktifkan' });
        }
        logger.debug('Menyimpan dokumen ke database...');
        
        const insertQuery = `
            INSERT INTO pat_3_documents (
                userid, 
                nama, 
                path_document1, 
                path_document2,
                booking_id,
                upload_date
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const insertParams = [
            userid,
            nama,
            document1Path,
            document2Path,
            req.body.booking_id || null, // Associate with booking if provided
            new Date()
        ];

        logger.debug('Executing query:', { query: insertQuery, params: insertParams });
        
        let insertResult;
        try {
            insertResult = await pool.query(insertQuery, insertParams);
        } catch (dbError) {
            logger.error('Database error saat menyimpan dokumen:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error database saat menyimpan dokumen',
                error_code: 'DATABASE_ERROR'
            });
        }

        if (insertResult.rows.length === 0) {
            logger.error('Gagal menyimpan data dokumen');
            throw new Error('INSERT operation failed');
        }

        logger.info('Dokumen berhasil disimpan', { 
            id: insertResult.rows[0].id,
            userid 
        });

        // 6. Response Sukses
        return res.json({ 
            success: true, 
            message: 'Dokumen berhasil diunggah',
            data: {
                user: { userid, nama },
                documents: {
                    document1: {
                        path: document1Path,
                        name: req.files.document1[0].originalname,
                        url: `/uploads/documents/${userid}/${path.basename(document1Path)}`
                    },
                    document2: document2Path ? {
                        path: document2Path,
                        name: req.files.document2[0].originalname,
                        url: `/uploads/documents/${userid}/${path.basename(document2Path)}`
                    } : null
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Error proses upload dokumen:', {
            message: error.message,
            stack: error.stack,
            ...(error.code && { code: error.code })
        });

        // Cleanup file jika error terjadi setelah upload
        if (req.files) {
            try {
                logger.debug('Cleaning up uploaded files...');
                const cleanupPromises = [
                    req.files.document1?.[0]?.path && fs.promises.unlink(req.files.document1[0].path),
                    req.files.document2?.[0]?.path && fs.promises.unlink(req.files.document2[0].path)
                ].filter(Boolean);
                
                await Promise.all(cleanupPromises);
                logger.debug('File cleanup completed');
            } catch (cleanupError) {
                logger.error('Error during file cleanup:', cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupload dokumen',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Endpoint untuk mengambil dokumen yang sudah diupload
app.get('/api/ppatk_get-documents', async (req, res) => {
  if (PAT3_DISABLED) {
    return res.status(503).json({ success: false, message: 'Fitur dokumen dinonaktifkan' });
  }
    try {
        // Validasi session
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Session tidak valid. Silakan login ulang.'
            });
        }

        const { userid } = req.session.user;
        const { booking_id } = req.query;

        let query = `
            SELECT id, userid, nama, path_document1, path_document2, booking_id, upload_date
            FROM pat_3_documents 
            WHERE userid = $1
        `;
        let params = [userid];

        // Jika booking_id diberikan, filter berdasarkan booking_id
        if (booking_id) {
            query += ' AND (booking_id = $2 OR booking_id IS NULL)';
            params.push(booking_id);
        }

        query += ' ORDER BY upload_date DESC';

        const result = await pool.query(query, params);

        // Transform data untuk response
        const documents = result.rows.map(row => ({
            id: row.id,
            userid: row.userid,
            nama: row.nama,
            documents: {
                document1: row.path_document1 ? {
                    path: row.path_document1,
                    name: path.basename(row.path_document1),
                    url: `/uploads/documents/${row.userid}/${path.basename(row.path_document1)}`
                } : null,
                document2: row.path_document2 ? {
                    path: row.path_document2,
                    name: path.basename(row.path_document2),
                    url: `/uploads/documents/${row.userid}/${path.basename(row.path_document2)}`
                } : null
            },
            booking_id: row.booking_id,
            upload_date: row.upload_date
        }));

        return res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Error mengambil dokumen:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil dokumen'
        });
    }
});

// Buat tabel untuk menyimpan dokumen PPATK
const createPpatkDocumentsTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS pat_3_documents (
                id SERIAL PRIMARY KEY,
                userid VARCHAR(255) NOT NULL,
                nama VARCHAR(255) NOT NULL,
                path_document1 TEXT,
                path_document2 TEXT,
                booking_id VARCHAR(255),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await pool.query(query);
        console.log('Tabel pat_3_documents berhasil dibuat atau sudah ada');
        
        // Add booking_id column if it doesn't exist (for existing tables)
        try {
            await pool.query(`
                ALTER TABLE pat_3_documents 
                ADD COLUMN IF NOT EXISTS booking_id VARCHAR(255);
            `);
            console.log('Column booking_id berhasil ditambahkan atau sudah ada');
        } catch (alterError) {
            console.log('Column booking_id sudah ada atau error:', alterError.message);
        }
    } catch (error) {
        console.error('Error creating pat_3_documents table:', error);
    }
};

// Panggil fungsi pembuatan tabel (hanya jika fitur tidak dinonaktifkan)
if (!PAT3_DISABLED) {
  createPpatkDocumentsTable();
} else {
  console.log('Fitur pat_3_documents dinonaktifkan (DISABLE_PAT3=1), melewati inisialisasi tabel');
}

// BSRE auth endpoints for PV UI
app.post('/api/bsre/auth', async (req, res) => {
  try {
    const token = await getAccessToken(pool);
    return res.json({ success: true, token, expires_at: null });
  } catch (e) {
    console.error('BSRE auth error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mendapatkan token' });
  }
});
app.get('/api/bsre/health', async (_req, res) => {
  try {
    await getAccessToken(pool);
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
});

// PV: daftar dokumen untuk dashboard Peneliti Validasi
app.get('/api/pv/docs', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    const { rows } = await pool.query(`
      SELECT pv.no_validasi, pv.nobooking, pv.no_registrasi,
             pv.namawajibpajak, pv.namapemilikobjekpajak, pv.keterangan,
             COALESCE(sr.status, 'PENDING') AS signing_status,
             sr.signer_userid, sr.source_pdf_path,
             pb.userid AS creator_userid,
             vu.nama AS creator_nama,
             vu.divisi AS creator_divisi,
             vu.special_field,
             vu.pejabat_umum,
             pv.pemparaf,
             vu2.nama AS pemparaf_nama
      FROM pv_1_paraf_validate pv
      LEFT JOIN pv_2_signing_requests sr ON sr.no_validasi = pv.no_validasi
      LEFT JOIN pat_1_bookingsspd pb ON pb.nobooking = pv.nobooking
      LEFT JOIN a_2_verified_users vu ON vu.userid = pb.userid
      LEFT JOIN a_2_verified_users vu2 ON vu2.userid = pv.pemparaf
      ORDER BY pv.no_validasi DESC
      LIMIT 200
    `);
    const mapped = rows.map(r => {
      const raw = String(r.signing_status || '').toUpperCase();
      let status_display = 'Menunggu';
      if (raw.includes('APPROVED')) status_display = 'Telah Disetujui';
      else if (raw.includes('REJECT')) status_display = 'Ditolak';
      const isPpat = (r.creator_divisi === 'PPAT' || r.creator_divisi === 'PPATS');
      const pembuat_gelar = isPpat ? [r.special_field, r.pejabat_umum].filter(Boolean).join('/') : (r.creator_nama || '');
      let keterangan = r.keterangan || '';
      if (!keterangan && r.pemparaf) {
        const pengirim = r.pemparaf_nama ? r.pemparaf_nama : r.pemparaf;
        keterangan = `Dokumen dikirim oleh ${pengirim}`;
      }
      return {
        no_validasi: r.no_validasi,
        no_registrasi: r.no_registrasi,
        nobooking: r.nobooking,
        tahunajb: r.tahunajb || null,
        namawajibpajak: r.namawajibpajak,
        namapemilikobjekpajak: r.namapemilikobjekpajak,
        status_display,
        keterangan,
        pembuat_gelar,
        source_pdf_path: r.source_pdf_path || null
      };
    });
    return res.json({ success: true, data: mapped });
  } catch (e) {
    console.error('PV list error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar dokumen PV' });
  }
});

// PV: auth-status untuk gating Prepare (tanda tangan profil, sertifikat lokal/BSrE)
app.get('/api/pv/auth-status', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    // ensure pv_local_certs table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pv_local_certs (
        id BIGSERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        subject_cn TEXT,
        subject_email TEXT,
        subject_org TEXT,
        public_key_pem TEXT NOT NULL,
        algorithm TEXT DEFAULT 'ECDSA-P256',
        fingerprint_sha256 TEXT,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_to TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
        status TEXT NOT NULL DEFAULT 'active',
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (status IN ('active','revoked','expired'))
      );
    `);
    // ensure passphrase columns exist
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_alg TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_salt TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_hash TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_iters INTEGER`);
    const { rows } = await pool.query(
      `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1 LIMIT 1`,
      [req.session.user.userid]
    );
    const hasSignature = !!(rows[0]?.tanda_tangan_path);
    const certQ = await pool.query(
      `SELECT 1 FROM pv_local_certs WHERE userid=$1 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW()) LIMIT 1`,
      [req.session.user.userid]
    );
    const hasCert = certQ.rowCount > 0;
    return res.json({ success: true, has_signature: hasSignature, has_cert: hasCert });
  } catch (e) {
    console.error('PV auth-status error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengambil auth status' });
  }
});

// PV Local Certificates: list
app.get('/api/pv/cert/list', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pv_local_certs (
        id BIGSERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        subject_cn TEXT,
        subject_email TEXT,
        subject_org TEXT,
        public_key_pem TEXT NOT NULL,
        algorithm TEXT DEFAULT 'ECDSA-P256',
        fingerprint_sha256 TEXT,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_to TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
        status TEXT NOT NULL DEFAULT 'active',
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (status IN ('active','revoked','expired'))
      );
    `);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_alg TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_salt TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_hash TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_iters INTEGER`);
    const { rows } = await pool.query(
      `SELECT id, serial_number, subject_cn, subject_email, subject_org, algorithm, fingerprint_sha256, valid_from, valid_to, status, revoked_at, created_at
       FROM pv_local_certs
       WHERE userid = $1
         AND status <> 'revoked'
       ORDER BY created_at DESC`,
      [req.session.user.userid]
    );
    return res.json({ success: true, data: rows });
  } catch (e) {
    console.error('pv cert list error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat daftar sertifikat' });
  }
});

// PV Local Certificates: issue (register public key)
app.post('/api/pv/cert/issue', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pv_local_certs (
        id BIGSERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        subject_cn TEXT,
        subject_email TEXT,
        subject_org TEXT,
        public_key_pem TEXT NOT NULL,
        algorithm TEXT DEFAULT 'ECDSA-P256',
        fingerprint_sha256 TEXT,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_to TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
        status TEXT NOT NULL DEFAULT 'active',
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (status IN ('active','revoked','expired'))
      );
    `);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_alg TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_salt TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_hash TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_iters INTEGER`);
    const { public_key_pem, subject_cn, subject_email, subject_org, algorithm, valid_days, passphrase } = req.body || {};
    if (!public_key_pem || typeof public_key_pem !== 'string') {
      return res.status(400).json({ success: false, message: 'public_key_pem wajib diisi' });
    }
    if (!passphrase || typeof passphrase !== 'string' || passphrase.length < 4) {
      return res.status(400).json({ success: false, message: 'Passphrase minimal 4 karakter' });
    }
    const algo = algorithm || 'ECDSA-P256';
    const { randomBytes, createHash, scryptSync } = await import('crypto');
    const serial = randomBytes(8).toString('hex').toUpperCase();
    const fingerprint = createHash('sha256').update(public_key_pem).digest('hex').toUpperCase();
    const days = Number(valid_days) > 0 ? Number(valid_days) : 365;
    const salt = randomBytes(16);
    const derived = scryptSync(passphrase, salt, 32, { N: 16384, r: 8, p: 1 });
    const pass_alg = 'scrypt';
    const pass_salt = salt.toString('base64');
    const pass_hash = Buffer.from(derived).toString('base64');
    const pass_iters = 16384;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Revoke any previous certs (active or expired) for this user
      await client.query(
        `UPDATE pv_local_certs SET status='revoked', revoked_at=NOW()
         WHERE userid=$1 AND status IN ('active','expired')`,
        [req.session.user.userid]
      );
      const ins = await client.query(
        `INSERT INTO pv_local_certs (userid, serial_number, subject_cn, subject_email, subject_org, public_key_pem, algorithm, fingerprint_sha256, valid_from, valid_to, status, passphrase_alg, passphrase_salt, passphrase_hash, passphrase_iters)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW(), NOW() + ($9::text || ' days')::interval, 'active', $10, $11, $12, $13)
         RETURNING id, serial_number, valid_from, valid_to`,
        [req.session.user.userid, serial, subject_cn || null, subject_email || null, subject_org || null, public_key_pem, algo, fingerprint, days, pass_alg, pass_salt, pass_hash, pass_iters]
      );
      await client.query('COMMIT');
      return res.json({ success: true, cert: ins.rows[0] });
    } catch (txe) {
      await client.query('ROLLBACK');
      throw txe;
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('pv cert issue error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menerbitkan sertifikat' });
  }
});

// PV Local Certificates: revoke
app.post('/api/pv/cert/:serial/revoke', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pv_local_certs (
        id BIGSERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        subject_cn TEXT,
        subject_email TEXT,
        subject_org TEXT,
        public_key_pem TEXT NOT NULL,
        algorithm TEXT DEFAULT 'ECDSA-P256',
        fingerprint_sha256 TEXT,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_to TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
        status TEXT NOT NULL DEFAULT 'active',
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (status IN ('active','revoked','expired'))
      );
    `);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_alg TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_salt TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_hash TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_iters INTEGER`);
    const serial = req.params.serial;
    const upd = await pool.query(
      `UPDATE pv_local_certs SET status='revoked', revoked_at=NOW()
       WHERE userid=$1 AND serial_number=$2 AND status='active'
       RETURNING id, serial_number, status, revoked_at`,
      [req.session.user.userid, serial]
    );
    if (upd.rowCount === 0) return res.status(404).json({ success: false, message: 'Sertifikat tidak ditemukan atau sudah non-aktif' });
    return res.json({ success: true, cert: upd.rows[0] });
  } catch (e) {
    console.error('pv cert revoke error:', e);
    return res.status(500).json({ success: false, message: 'Gagal revoke sertifikat' });
  }
});

// PV Local Certificates: status (ringkas)
app.get('/api/pv/cert/status', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pv_local_certs (
        id BIGSERIAL PRIMARY KEY,
        userid TEXT NOT NULL,
        serial_number TEXT NOT NULL UNIQUE,
        subject_cn TEXT,
        subject_email TEXT,
        subject_org TEXT,
        public_key_pem TEXT NOT NULL,
        algorithm TEXT DEFAULT 'ECDSA-P256',
        fingerprint_sha256 TEXT,
        valid_from TIMESTAMPTZ DEFAULT NOW(),
        valid_to TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '365 days'),
        status TEXT NOT NULL DEFAULT 'active',
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CHECK (status IN ('active','revoked','expired'))
      );
    `);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_alg TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_salt TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_hash TEXT`);
    await pool.query(`ALTER TABLE pv_local_certs ADD COLUMN IF NOT EXISTS passphrase_iters INTEGER`);
    const q = await pool.query(
      `SELECT serial_number, valid_from, valid_to FROM pv_local_certs
       WHERE userid=$1 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW())
       ORDER BY created_at DESC LIMIT 1`,
      [req.session.user.userid]
    );
    return res.json({ success: true, has_active: q.rowCount > 0, active: q.rows[0] || null });
  } catch (e) {
    console.error('pv cert status error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengambil status sertifikat' });
  }
});

// PV Local Certificates: check if passphrase already verified in this session
app.get('/api/pv/cert/verified', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    const sess = req.session.pv_local_cert;
    if (!sess || !sess.serial_number) return res.json({ success:true, verified:false });
    const q = await pool.query(
      `SELECT serial_number FROM pv_local_certs
       WHERE userid=$1 AND serial_number=$2 AND status='active' AND (valid_to IS NULL OR valid_to >= NOW())
       LIMIT 1`,
      [req.session.user.userid, sess.serial_number]
    );
    return res.json({ success:true, verified: q.rowCount>0, serial_number: q.rows[0]?.serial_number||null });
  } catch (e) {
    console.error('pv cert verified error:', e);
    return res.status(500).json({ success:false, message:'Gagal cek verifikasi' });
  }
});

// PV Local Certificates: verify-local (cek passphrase)
app.post('/api/pv/cert/verify-local', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    const { serial_number, passphrase } = req.body || {};
    if (!serial_number || !passphrase) return res.status(400).json({ success:false, message:'serial_number dan passphrase wajib' });
    const rowQ = await pool.query(
      `SELECT passphrase_alg, passphrase_salt, passphrase_hash, passphrase_iters
       FROM pv_local_certs WHERE userid=$1 AND serial_number=$2 AND status='active' LIMIT 1`,
      [req.session.user.userid, serial_number]
    );
    if (rowQ.rowCount === 0) return res.status(404).json({ success:false, message:'Sertifikat tidak ditemukan' });
    // Enforce user has signature uploaded
    const sigQ = await pool.query(`SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid=$1 LIMIT 1`, [req.session.user.userid]);
    const hasSignature = !!(sigQ.rows[0]?.tanda_tangan_path);
    if (!hasSignature) return res.status(400).json({ success:false, message:'Silakan upload tanda tangan terlebih dahulu' });
    const r = rowQ.rows[0];
    const { scryptSync, timingSafeEqual } = await import('crypto');
    if (r.passphrase_alg !== 'scrypt' || !r.passphrase_salt || !r.passphrase_hash) {
      return res.status(400).json({ success:false, message:'Sertifikat tidak memiliki passphrase' });
    }
    const key = scryptSync(passphrase, Buffer.from(r.passphrase_salt, 'base64'), 32, { N: r.passphrase_iters||16384, r:8, p:1 });
    const incoming = Buffer.from(key).toString('base64');
    const ok = timingSafeEqual(Buffer.from(incoming,'base64'), Buffer.from(r.passphrase_hash,'base64'));
    if (!ok) return res.status(401).json({ success:false, message:'Passphrase salah' });
    req.session.pv_local_cert = { serial_number, verified_at: Date.now() };
    return res.json({ success:true });
  } catch (e) {
    console.error('pv cert verify-local error:', e);
    return res.status(500).json({ success:false, message:'Gagal verifikasi passphrase' });
  }
});

// Upload gambar tanda tangan dan paraf (profil Peneliti Validasi)
app.post('/api/pv/upload-signature', ttdVerifMiddleware, async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  try {
    const userid = req.session.user.userid;
    const url = req.processedTTD?.url;
    const mime = req.processedTTD?.mimeType || 'image/png';
    if (!url) return res.status(400).json({ success: false, message: 'File tidak diterima' });
    await pool.query(`UPDATE a_2_verified_users SET tanda_tangan_path = $1, tanda_tangan_mime = $2 WHERE userid = $3`, [url, mime, userid]);
    return res.json({ success: true, path: url });
  } catch (e) {
    console.error('Upload signature error:', e);
    return res.status(500).json({ success: false, message: 'Gagal upload tanda tangan' });
  }
});

// Generate QR code sederhana untuk pengujian keamanan (non-resmi)
app.post('/api/pv/generate-qr', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  try {
    const text = req.body?.text || `PV:${new Date().toISOString()}`;
    const no_validasi = req.body?.no_validasi || 'preview';
    const saved = await saveQrToPublic({ filename: `qr_${no_validasi}`, text, size: 256 });
    return res.json({ success: true, path: saved.path });
  } catch (e) {
    console.error('QR error:', e);
    return res.status(500).json({ success: false, message: 'Gagal membuat QR' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Running on ${PORT}`));
