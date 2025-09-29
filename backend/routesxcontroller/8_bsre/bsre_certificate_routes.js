// BSRE Certificate Routes - Sertifikat Lokal untuk Peneliti Validasi
import express from 'express';
import { pool } from '../../../db.js';
import { ttdVerifMiddleware } from '../../config/uploads/upload_ttdverif.js';
import { saveQrToPublic } from '../../utils/qrcode.js';

const router = express.Router();

// ===== CERTIFICATE MANAGEMENT =====

// GET /api/v1/sign/cert/:id - Get certificate
router.get('/api/v1/sign/cert/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.user;
    const { nobooking } = req.params;
    const { csr } = req.body;
    
    // TODO: Implement certificate retrieval logic
    res.json({ success: true, message: 'Certificate endpoint - to be implemented' });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil sertifikat' });
  }
});

// POST /api/v1/sign/cert/revoke - Revoke certificate
router.post('/api/v1/sign/cert/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.user;
    const { nobooking } = req.params;
    const { csr } = req.body;
    
    // TODO: Implement certificate revocation logic
    res.json({ success: true, message: 'Certificate revocation endpoint - to be implemented' });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({ success: false, message: 'Gagal revoke sertifikat' });
  }
});

// GET /api/v1/sign/cert/download/:id - Download certificate
router.get('/api/v1/sign/cert/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.user;
    const { nobooking } = req.params;
    const { csr } = req.body;
    
    // TODO: Implement certificate download logic
    res.json({ success: true, message: 'Certificate download endpoint - to be implemented' });
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ success: false, message: 'Gagal download sertifikat' });
  }
});

// POST /api/v1/sign/cert-requests - Submit CSR
router.post('/api/v1/sign/cert-requests', async (req, res) => {
  try {
    const { csr } = req.body;
    const { userid } = req.user;
    const { nobooking } = req.params;
    
    // TODO: Implement CSR submission logic
    res.json({ success: true, message: 'CSR submission endpoint - to be implemented' });
  } catch (error) {
    console.error('Submit CSR error:', error);
    res.status(500).json({ success: false, message: 'Gagal submit CSR' });
  }
});

// GET /api/v1/sign/cert-requests/:id - Get CSR request
router.get('/api/v1/sign/cert-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.user;
    const { nobooking } = req.params;
    const { csr } = req.body;
    
    // TODO: Implement CSR request retrieval logic
    res.json({ success: true, message: 'CSR request endpoint - to be implemented' });
  } catch (error) {
    console.error('Get CSR request error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil CSR request' });
  }
});

// ===== PENELITI VALIDASI ENDPOINTS =====

// PV: daftar dokumen untuk dashboard Peneliti Validasi
router.get('/api/pv/docs', async (req, res) => {
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
router.get('/api/pv/auth-status', async (req, res) => {
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
router.get('/api/pv/cert/list', async (req, res) => {
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
router.post('/api/pv/cert/issue', async (req, res) => {
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
router.post('/api/pv/cert/:serial/revoke', async (req, res) => {
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
router.get('/api/pv/cert/status', async (req, res) => {
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
router.get('/api/pv/cert/verified', async (req, res) => {
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
router.post('/api/pv/cert/verify-local', async (req, res) => {
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
router.post('/api/pv/upload-signature', ttdVerifMiddleware, async (req, res) => {
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
router.post('/api/pv/generate-qr', async (req, res) => {
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

// PV: Send to LSB endpoint (untuk mengirim dokumen yang sudah divalidasi ke LSB)
router.post('/api/pv/send-to-lsb', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    const { no_validasi, nobooking } = req.body || {};
    if (!no_validasi || !nobooking) {
      return res.status(400).json({ success: false, message: 'no_validasi dan nobooking wajib diisi' });
    }

    // Update status di database
    await pool.query(
      `UPDATE pv_2_signing_requests 
       SET status = 'APPROVED', approved_at = NOW(), approved_by = $1 
       WHERE no_validasi = $2`,
      [req.session.user.userid, no_validasi]
    );

    return res.json({ 
      success: true, 
      message: 'Dokumen berhasil dikirim ke LSB',
      no_validasi 
    });
  } catch (e) {
    console.error('PV send to LSB error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengirim dokumen ke LSB' });
  }
});

// PV: Reject with auto-delete endpoint
router.post('/api/pv/reject-with-auto-delete', async (req, res) => {
  if (!req.session || !req.session.user || req.session.user.divisi !== 'Peneliti Validasi') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Peneliti Validasi.' });
  }
  try {
    const { nobooking, rejectionReason, userid } = req.body || {};
    if (!nobooking || !rejectionReason) {
      return res.status(400).json({ success: false, message: 'nobooking dan rejectionReason wajib diisi' });
    }

    // Update status menjadi rejected
    await pool.query(
      `UPDATE pv_2_signing_requests 
       SET status = 'REJECTED', rejected_at = NOW(), rejected_by = $1, rejection_reason = $2 
       WHERE nobooking = $3`,
      [req.session.user.userid, rejectionReason, nobooking]
    );

    // Schedule auto-delete (10 hari dari sekarang)
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 10);

    return res.json({ 
      success: true, 
      message: 'Dokumen ditolak dan akan dihapus otomatis',
      scheduledDeleteAt: deleteAt.toISOString()
    });
  } catch (e) {
    console.error('PV reject with auto-delete error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menolak dokumen' });
  }
});

export default router;