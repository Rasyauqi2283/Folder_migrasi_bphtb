import express from 'express';
import fs from 'fs';
import path from 'path';
import { pool } from '../../../db.js';
import { 
    createCloudinaryProxyRouter, 
    createCloudinaryProxyEndpoint, 
    createRefreshSignedUrlEndpoint,
    createCloudinaryUploadHandler,
    createCloudinaryPDFUploadHandler
} from './cloudinary_ppat.js';
const router = express.Router();

export default function registerPPATKEndpoints({ app, pool, logger, morganMiddleware, uploadTTD, uploadDocumentMiddleware, PAT3_DISABLED, triggerNotificationByStatus, upsertBankVerification, mixedCloudinaryUpload, renameCloudinaryFile, deleteCloudinaryFile, extractPublicIdFromUrl, generateSignedUrl, generatePublicUrl }) {
// ===== CLOUDINARY ENDPOINTS SETUP =====
// Setup Cloudinary endpoints from cloudinary_ppat.js
const cloudinaryProxyRouter = createCloudinaryProxyRouter({ generateSignedUrl });
app.use('/api/ppatk', cloudinaryProxyRouter);

// Test endpoint untuk debugging 502 error
app.get('/api/test-cloudinary-proxy', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Cloudinary proxy test endpoint working',
        timestamp: new Date().toISOString(),
        hasGenerateSignedUrl: typeof generateSignedUrl === 'function'
    });
});

app.get('/api/files/cloudinary-proxy', createCloudinaryProxyEndpoint({ generateSignedUrl }));
app.get('/api/files/refresh-signed-url', createRefreshSignedUrlEndpoint({ generateSignedUrl }));
app.post('/api/ppatk_upload-cloudinary', ...createCloudinaryUploadHandler({ mixedCloudinaryUpload, extractPublicIdFromUrl }));
app.post('/api/ppatk_upload-pdf', ...createCloudinaryPDFUploadHandler({ mixedCloudinaryUpload, extractPublicIdFromUrl }));

// PPATK: Load all booking data for table (untuk frontend table)
app.get('/api/ppatk_get-booking-data', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Session required' 
            });
        }

        const { page = 1, limit = 20, q } = req.query;
        const userid = req.session.user.userid;
        
        // Validasi dan sanitasi parameter pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const lim = Math.min(Math.max(limitNum, 1), 100); // antara 1-100
        const off = Math.max((pageNum - 1) * lim, 0); // minimal 0
        
        console.log(`🔍 [PPATK-GET-BOOKING-DATA] Pagination params:`, {
            page: page,
            limit: limit,
            pageNum: pageNum,
            limitNum: limitNum,
            lim: lim,
            off: off
        });
        
        console.log(`🔍 [PPATK-GET-BOOKING-DATA] Request from user: ${userid}, page: ${page}`);
        
        const params = [userid];
        let where = `b.userid = $1`;
        
        if (q && String(q).trim().length) {
            params.push(`%${String(q).trim().toLowerCase()}%`);
            where += ` AND (lower(b.nobooking) LIKE $${params.length} OR lower(b.namawajibpajak) LIKE $${params.length} OR lower(b.namapemilikobjekpajak) LIKE $${params.length})`;
        }
        
        params.push(lim, off);
        
        const sql = `
            SELECT 
                b.nobooking, b.noppbb, b.tahunajb, b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp, b.trackstatus, b.updated_at,
                b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path
            FROM pat_1_bookingsspd b
            WHERE ${where}
            ORDER BY b.updated_at DESC NULLS LAST
            LIMIT $${params.length-1} OFFSET $${params.length}
        `;
        
        const result = await pool.query(sql, params);
        
        // Count total records for pagination
        const countSql = `
            SELECT COUNT(*) as total
            FROM pat_1_bookingsspd b
            WHERE ${where.replace(/\$(\d+)/g, (match, num) => {
                const paramIndex = parseInt(num);
                if (paramIndex <= params.length - 2) { // Exclude limit and offset params
                    return match;
                }
                return '1=1'; // Remove limit/offset from count query
            })}
        `;
        const countParams = params.slice(0, -2); // Remove limit and offset
        const countResult = await pool.query(countSql, countParams);
        const totalRecords = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalRecords / lim);
        
        console.log(`✅ [PPATK-GET-BOOKING-DATA] Found ${result.rows.length} bookings for user: ${userid}, total: ${totalRecords}, pages: ${totalPages}`);
        
        return res.json({ 
            success: true, 
            page: pageNum, 
            limit: lim,
            pagination: {
                page: pageNum,
                totalPages: totalPages,
                totalRecords: totalRecords
            },
            totalPages: totalPages, // For backward compatibility
            data: result.rows 
        });
    } catch (error) {
        console.error('❌ [PPATK-GET-BOOKING-DATA] Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// PPATK: Get documents endpoint (untuk kompatibilitas dengan frontend)
app.get('/api/ppatk_get-documents', async (req, res) => {
    try {
        // Jika PAT3_DISABLED, return empty data instead of 503 error
        if (PAT3_DISABLED) {
            return res.json({ 
                success: true, 
                data: [], 
                message: 'Fitur dokumen dinonaktifkan - mengembalikan data kosong' 
            });
        }

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
            query += ` AND booking_id = $2`;
            params.push(booking_id);
        }

        query += ` ORDER BY upload_date DESC`;

        const result = await pool.query(query, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// PPATK: daftar berkas yang sudah Diserahkan (untuk unduh berkas tervalidasi)
app.get('/api/ppatk/lsb_send/rekap/diserahkan', async (req, res) => {
    try {
        const { page = 1, limit = 20, q } = req.query;
        
        // Validasi dan sanitasi parameter pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const lim = Math.min(Math.max(limitNum, 1), 100); // antara 1-100
        const off = Math.max((pageNum - 1) * lim, 0); // minimal 0
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
        return res.json({ success:true, page: pageNum, limit: lim, rows: rows.rows });
    } catch (e) {
        console.error('ppatk rekap diserahkan error:', e);
        return res.status(500).json({ success:false, error: e.message });
    }
});

// Cek apakah user (PPAT/PPATS/others) sudah memiliki tanda tangan
app.get('/api/ppatk/check-signature', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1`,
      [req.session.user.userid]
    );
    return res.json({ 
      success: true, 
      hasSignature: !!rows[0]?.tanda_tangan_path,
      signaturePath: rows[0]?.tanda_tangan_path || null
    });
  } catch (error) {
    console.error('Error checking signature:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint untuk save additional data PPATK
app.post('/api/save-ppatk-additional-data', async (req, res) => {
    try {
        const { userid } = req.session.user;
        const { 
            nobooking, 
            noppbb, 
            tahunajb, 
            namawajibpajak, 
            namapemilikobjekpajak, 
            npwpwajibpajak,
            status = 'Pending'
        } = req.body;

        // Validasi input
        if (!nobooking || !noppbb || !tahunajb || !namawajibpajak || !namapemilikobjekpajak || !npwpwajibpajak) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semua field wajib diisi' 
            });
        }

        // Gunakan transaksi untuk memastikan konsistensi data
        const client = await pool.connect();
        
    try {
        await client.query('BEGIN');  // Memulai transaksi

        // 1. Insert ke tabel lsb_1_serah_berkas
        const insertQuery = `
            INSERT INTO lsb_1_serah_berkas 
            (nobooking, noppbb, tahunajb, namawajibpajak, namapemilikobjekpajak, npwpwajibpajak, status, trackstatus, userid, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (nobooking) 
            DO UPDATE SET 
                noppbb = EXCLUDED.noppbb,
                tahunajb = EXCLUDED.tahunajb,
                namawajibpajak = EXCLUDED.namawajibpajak,
                namapemilikobjekpajak = EXCLUDED.namapemilikobjekpajak,
                npwpwajibpajak = EXCLUDED.npwpwajibpajak,
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        const result = await client.query(insertQuery, [
            nobooking, noppbb, tahunajb, namawajibpajak, namapemilikobjekpajak, npwpwajibpajak, status, userid
        ]);

        // 2. Insert ke tabel pat_6_sign (jika ada tanda tangan)
        if (!PAT3_DISABLED) {
            try {
                await client.query('SAVEPOINT sp_docs');
                const insertDocs = `
                    INSERT INTO pat_3_documents (nobooking, userid, created_at, updated_at)
                    VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (nobooking) DO NOTHING
                `;
                await client.query(insertDocs, [nobooking, userid]);
                await client.query('RELEASE SAVEPOINT sp_docs');
            } catch (docsErr) {
                console.warn('Warning: Could not insert into pat_3_documents:', docsErr.message);
                await client.query('ROLLBACK TO SAVEPOINT sp_docs');
            }
        }

        try {
            await client.query('SAVEPOINT sp_sign');
            // Ambil path tanda tangan dari profil pengguna (boleh null jika belum ada)
            const { rows: userRows } = await client.query(
                'SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1',
                [userid]
            );
            const signaturePath = userRows[0]?.tanda_tangan_path || null;

            const insertSign = `
                INSERT INTO pat_6_sign (nobooking, userid, path_ttd_ppatk, created_at, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (nobooking) 
                DO UPDATE SET 
                    path_ttd_ppatk = EXCLUDED.path_ttd_ppatk,
                    updated_at = CURRENT_TIMESTAMP
            `;
            await client.query(insertSign, [nobooking, userid, signaturePath]);
            await client.query('RELEASE SAVEPOINT sp_sign');

            // Debug: log path tanda tangan yang ditautkan (jika ada)
            try {
                const { rows: linked } = await client.query(
                    'SELECT path_ttd_ppatk FROM pat_6_sign WHERE nobooking = $1',
                    [nobooking]
                );
                if (linked[0]?.path_ttd_ppatk) {
                    console.log(`✅ Tanda tangan PPATK ditautkan untuk ${nobooking}: ${linked[0].path_ttd_ppatk}`);
                } else {
                    console.log(`ℹ️  Tidak ada tanda tangan PPATK untuk ${nobooking} (user belum upload tanda tangan)`);
                }
            } catch (debugErr) {
                console.warn('Warning: Could not debug signature linking:', debugErr.message);
            }
        } catch (signErr) {
            console.warn('Warning: Could not insert into pat_6_sign:', signErr.message);
            await client.query('ROLLBACK TO SAVEPOINT sp_sign');
        }

        try {
            await client.query('SAVEPOINT sp_valsurat');
            const insertValSurat = `
                INSERT INTO pat_7_validasi_surat (nobooking, userid, status, created_at, updated_at)
                VALUES ($1, $2, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (nobooking) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    updated_at = CURRENT_TIMESTAMP
            `;
            await client.query(insertValSurat, [nobooking, userid]);
            await client.query('RELEASE SAVEPOINT sp_valsurat');
        } catch (valErr) {
            console.warn('Warning: Could not insert into pat_7_validasi_surat:', valErr.message);
            await client.query('ROLLBACK TO SAVEPOINT sp_valsurat');
        }

        await client.query('COMMIT');  // Commit transaksi
        client.release();

        res.json({ 
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
    }

    } catch (error) {
        console.error('Error saving additional data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal menyimpan data tambahan' 
        });
    }
});

// Endpoint untuk get specific booking data by nobooking
app.get('/api/ppatk_get-booking-detail', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Session required' 
            });
        }

        const { nobooking } = req.query;
        
        if (!nobooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'nobooking parameter is required' 
            });
        }

        // Validasi format nobooking
        if (typeof nobooking !== 'string' || nobooking.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid nobooking format' 
            });
        }

        const userid = req.session.user.userid;
        
        console.log(`🔍 [PPATK-GET-BOOKING-DETAIL] Request from user: ${userid}, nobooking: ${nobooking}`);

        // Query lengkap dengan JOIN ke semua tabel terkait
        const query = `
            SELECT 
                b.*,
                d.path_akta_tanah, d.path_sertifikat_tanah, d.path_pelengkap,
                s.path_ttd_ppatk,
                v.status as validasi_status,
                l.noppbb, l.tahunajb, l.namawajibpajak, l.namapemilikobjekpajak, l.npwpwajibpajak, l.trackstatus as lsb_trackstatus
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_3_documents d ON b.nobooking = d.nobooking
            LEFT JOIN pat_6_sign s ON b.nobooking = s.nobooking  
            LEFT JOIN pat_7_validasi_surat v ON b.nobooking = v.nobooking
            LEFT JOIN lsb_1_serah_berkas l ON b.nobooking = l.nobooking
            WHERE b.nobooking = $1 AND b.userid = $2
        `;
        
        const result = await pool.query(query, [nobooking.trim(), userid]);
        
        if (result.rows.length === 0) {
            console.log(`❌ [PPATK-GET-BOOKING-DETAIL] No booking found for: ${nobooking} (user: ${userid})`);
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or access denied' 
            });
        }

        const bookingData = result.rows[0];
        console.log(`✅ [PPATK-GET-BOOKING-DETAIL] Found booking: ${nobooking}`);
        
        res.json({
            success: true,
            data: bookingData
        });

    } catch (error) {
        console.error(`❌ [PPATK-GET-BOOKING-DETAIL] Error:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Endpoint untuk update trackstatus menjadi "Diolah"
app.post('/api/ppatk/ltb-process/:nobooking', async (req, res) => {
    const { nobooking } = req.params;
    const { trackstatus, userid, nama } = req.body;

    console.log(`🔄 [LTB-PROCESS] Starting LTB process for ${nobooking}`);
    console.log(`🔄 [LTB-PROCESS] Track status: ${trackstatus}, User: ${userid}`);

    // Set timeout untuk request ini
    const timeoutId = setTimeout(() => {
        console.error(`⏰ [LTB-PROCESS] Timeout for ${nobooking}`);
        return res.status(408).json({ 
            success: false, 
            message: 'Request timeout - process taking too long' 
        });
    }, 30000); // 30 detik timeout

    try {
        // Validasi input dengan cepat
        if (!nobooking || !trackstatus || !userid || !nama) {
            clearTimeout(timeoutId);
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required parameters: nobooking, trackstatus, userid, nama' 
            });
        }

        console.log(`🔄 [LTB-PROCESS] Validating booking ${nobooking}...`);
        
        // Validasi bahwa booking ada dan user berhak akses
        const bookingCheck = await pool.query(
            'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1',
            [nobooking]
        );
        
        if (bookingCheck.rows.length === 0) {
            clearTimeout(timeoutId);
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }

        const client = await pool.connect();
        
    try {
            console.log('🔄 [LTB-PROCESS] Starting transaction...');
            await client.query('BEGIN');

            // 1. Update status di pat_1_bookingsspd
            const updateQuery = `
                UPDATE pat_1_bookingsspd 
                SET trackstatus = $1, updated_at = CURRENT_TIMESTAMP
                WHERE nobooking = $2
                RETURNING bookingid
            `;
            
            const updateResult = await client.query(updateQuery, [trackstatus, nobooking]);
            
            if (updateResult.rows.length === 0) {
                throw new Error('Failed to update booking status');
            }

            // 2. Generate no_registrasi jika belum ada
            let noRegistrasi = null;
            try {
                noRegistrasi = await generateRegistrationNumber();
                console.log(`🔄 [LTB-PROCESS] Generated no_registrasi: ${noRegistrasi}`);
            } catch (genErr) {
                console.warn('⚠️ [LTB-PROCESS] Failed to generate registration number:', genErr.message);
                // Continue without registration number
            }

            // 3. Insert ke lsb_1_terima_berkas_sspd jika belum ada
            const insertLtbQuery = `
                INSERT INTO lsb_1_terima_berkas_sspd 
                (nobooking, no_registrasi, userid, nama_ppatk, trackstatus, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (nobooking) 
                DO UPDATE SET 
                    trackstatus = EXCLUDED.trackstatus,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            
            const insertResult = await client.query(insertLtbQuery, [
                nobooking, noRegistrasi, userid, nama, trackstatus
            ]);

            console.log(`✅ [LTB-PROCESS] Inserted/updated LTB record for ${nobooking}`);

            // 4. Insert ke lsb_1_serah_berkas jika belum ada
            const insertLsbQuery = `
                INSERT INTO lsb_1_serah_berkas 
                (nobooking, no_registrasi, userid, nama_ppatk, trackstatus, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (nobooking) 
                DO UPDATE SET 
                    trackstatus = EXCLUDED.trackstatus,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `;
            
            await client.query(insertLsbQuery, [
                nobooking, noRegistrasi, userid, nama, trackstatus
            ]);

            console.log(`✅ [LTB-PROCESS] Inserted/updated LSB record for ${nobooking}`);

            await client.query('COMMIT');
            console.log(`✅ [LTB-PROCESS] Transaction committed for ${nobooking}`);

            // 5. Insert ke bank verification jika insert berhasil
            if (insertResult.rowCount > 0) {
                // Buat entry verifikasi BANK (status awal Pending) menggunakan no_registrasi
                try {
                    await upsertBankVerification(nobooking, 'Pending', null, null, noRegistrasi);
                    console.log(`✅ [LTB-PROCESS] Bank verification entry created for ${nobooking}`);
                } catch (bankErr) {
                    console.warn(`⚠️ [LTB-PROCESS] Failed to create bank verification: ${bankErr.message}`);
                    // Continue - this is not critical
                }
                
                // Trigger notification dengan timeout
                try {
                    const bookingId = updateResult.rows[0]?.bookingid;
                    const actedBy = userid;
                    
                    console.log(`🔔 [LTB-PROCESS] Triggering notification for ${nobooking}...`);
                    
                    // Trigger notification dengan timeout 5 detik
                    const notificationPromise = triggerNotificationByStatus(nobooking, trackstatus, actedBy);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Notification timeout')), 5000)
                    );
                    
                    await Promise.race([notificationPromise, timeoutPromise]);
                    console.log(`✅ [LTB-PROCESS] Notification sent for ${nobooking}`);
                    
                } catch (notifErr) {
                    console.warn(`⚠️ [LTB-PROCESS] Notification failed: ${notifErr.message}`);
                    // Continue - notification failure should not break the process
                }
            }

            clearTimeout(timeoutId);
            res.json({
                success: true,
                message: `Booking ${nobooking} successfully processed`,
                data: {
                    nobooking,
                    trackstatus,
                    noRegistrasi,
                    processedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ [LTB-PROCESS] Error processing ${nobooking}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to process booking',
            error: error.message
        });
    }
});

// Endpoint untuk hapus booking (soft delete)
app.delete('/api/ppatk/delete-booking/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    try {
        // Update status track menjadi 'Dihapus'
        const result = await pool.query('UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2', ['Dihapus', nobooking]);

        if (result.rowCount > 0) {
            res.json({ success: true, message: 'Booking berhasil dihapus' });
        } else {
            res.status(404).json({ success: false, message: 'Booking tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus booking' });
    }
});

// (belum selesai)
app.get('/api/admin/ltb-processed', async (_req, res) => {
    try {
        // Query untuk mendapatkan data dengan status "Diolah" dari LTB yang ada di tabel ltb_1_terima_berkas_sspd
        const query = `
            SELECT 
                ltb.nobooking,
                ltb.no_registrasi,
                ltb.userid,
                ltb.nama_ppatk,
                ltb.trackstatus,
                ltb.created_at,
                ltb.updated_at,
                b.namawajibpajak,
                b.namapemilikobjekpajak,
                b.noppbb,
                b.tahunajb
            FROM lsb_1_terima_berkas_sspd ltb
            LEFT JOIN lsb_1_serah_berkas b ON ltb.nobooking = b.nobooking
            WHERE ltb.trackstatus = 'Diolah'
            ORDER BY ltb.updated_at DESC
            LIMIT 100
        `;
        
        const result = await pool.query(query);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching LTB processed data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch processed data'
        });
    }
});

app.get('/api/ppatk_get-booking-data-completed', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Session required' 
            });
        }

        const { nobooking } = req.query;
        
        if (!nobooking) {
            return res.status(400).json({ 
                success: false, 
                message: 'nobooking parameter is required' 
            });
        }

        const userid = req.session.user.userid;
        
        console.log(`🔍 [PPATK-GET-BOOKING-COMPLETED] Request from user: ${userid}, nobooking: ${nobooking}`);

        // Query untuk data booking yang sudah completed
        const query = `
            SELECT 
                b.*,
                d.path_akta_tanah, d.path_sertifikat_tanah, d.path_pelengkap,
                s.path_ttd_ppatk,
                v.status as validasi_status,
                l.noppbb, l.tahunajb, l.namawajibpajak, l.namapemilikobjekpajak, l.npwpwajibpajak, l.trackstatus as lsb_trackstatus,
                ltb.no_registrasi, ltb.trackstatus as ltb_trackstatus
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_3_documents d ON b.nobooking = d.nobooking
            LEFT JOIN pat_6_sign s ON b.nobooking = s.nobooking  
            LEFT JOIN pat_7_validasi_surat v ON b.nobooking = v.nobooking
            LEFT JOIN lsb_1_serah_berkas l ON b.nobooking = l.nobooking
            LEFT JOIN lsb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
            WHERE b.nobooking = $1 AND b.userid = $2
        `;
        
        const result = await pool.query(query, [nobooking.trim(), userid]);
        
        if (result.rows.length === 0) {
            console.log(`❌ [PPATK-GET-BOOKING-COMPLETED] No booking found for: ${nobooking} (user: ${userid})`);
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found or access denied' 
            });
        }

        const bookingData = result.rows[0];
        console.log(`✅ [PPATK-GET-BOOKING-COMPLETED] Found booking: ${nobooking}`);
        
        res.json({
            success: true,
            data: bookingData
        });

    } catch (error) {
        console.error(`❌ [PPATK-GET-BOOKING-COMPLETED] Error:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Endpoint untuk upload dokumen dengan validasi lebih ketat
app.post('/api/ppatk_upload-documents', uploadDocumentMiddleware.fields([
    { name: 'aktaTanah', maxCount: 1 },
    { name: 'sertifikatTanah', maxCount: 1 },
    { name: 'pelengkap', maxCount: 1 }
]), async (req, res) => {
    logger.info('Memulai proses upload dokumen...');
    
    try {
        // 1. Validasi Session dan User
        logger.debug('Session data:', req.session);
        
        if (!req.session || !req.session.user) {
            logger.warn('Upload dokumen gagal: Tidak ada session atau user');
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized - Session required' 
            });
        }

        const { userid } = req.session.user;
        logger.info(`Upload dokumen dimulai oleh user: ${userid}`);

        // 2. Validasi Input
        const { nobooking } = req.body;
        
        if (!nobooking) {
            logger.warn('Upload dokumen gagal: Missing nobooking');
            return res.status(400).json({ 
                success: false, 
                message: 'nobooking is required' 
            });
        }

        // 3. Validasi Files
        if (!req.files || Object.keys(req.files).length === 0) {
            logger.warn('Upload dokumen gagal: No files uploaded');
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            });
        }

        // 4. Validasi Booking Exists dan User Access
        const bookingCheck = await pool.query(
            'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1',
            [nobooking]
        );
        
        if (bookingCheck.rows.length === 0) {
            logger.warn(`Upload dokumen gagal: Booking ${nobooking} not found`);
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found' 
            });
        }

        if (bookingCheck.rows[0].userid !== userid) {
            logger.warn(`Upload dokumen gagal: User ${userid} tidak memiliki akses ke booking ${nobooking}`);
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied - Booking belongs to different user' 
            });
        }

        logger.info(`✅ Validasi berhasil untuk booking: ${nobooking}`);

        // 5. Ambil data user untuk logging
        let userData;
        try {
            userData = await pool.query(
                'SELECT userid, nama FROM a_2_verified_users WHERE userid = $1', 
                [userid]
            );
        } catch (userErr) {
            logger.warn('Warning: Could not fetch user data:', userErr.message);
            userData = { rows: [{ userid, nama: 'Unknown' }] };
        }

        const userName = userData.rows[0]?.nama || userid;
        logger.info(`📁 Uploading files for user: ${userName} (${userid})`);

        // 6. Process Files dan Simpan ke Database
        const fileMapping = {
            aktaTanah: 'akta_tanah_path',
            sertifikatTanah: 'sertifikat_tanah_path', 
            pelengkap: 'pelengkap_path'
        };

        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        for (const [fieldName, dbColumn] of Object.entries(fileMapping)) {
            if (req.files[fieldName] && req.files[fieldName][0]) {
                const file = req.files[fieldName][0];
                const filePath = file.path;
                
                updateFields.push(`${dbColumn} = $${paramCount}`);
                updateValues.push(filePath);
                paramCount++;
                
                logger.info(`📄 ${fieldName}: ${file.originalname} -> ${filePath}`);
            }
        }

        if (updateFields.length === 0) {
            logger.warn('Upload dokumen gagal: No valid files to process');
            return res.status(400).json({ 
                success: false, 
                message: 'No valid files to process' 
            });
        }

        // Add nobooking and userid to update values
        updateValues.push(nobooking, userid);
        
        const insertQuery = `
            UPDATE pat_1_bookingsspd 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $${paramCount} AND userid = $${paramCount + 1}
            RETURNING *
        `;
        
        let insertResult;
        try {
            insertResult = await pool.query(insertQuery, updateValues);
        } catch (dbError) {
            logger.error('Database error during file upload:', dbError);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error occurred' 
            });
        }

        if (insertResult.rowCount === 0) {
            logger.warn(`Upload dokumen gagal: Failed to update booking ${nobooking}`);
            return res.status(404).json({ 
                success: false, 
                message: 'Failed to update booking - booking not found or access denied' 
            });
        }

        // 7. Insert ke pat_3_documents jika belum ada
        try {
            const insertDocsQuery = `
                INSERT INTO pat_3_documents (nobooking, userid, created_at, updated_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (nobooking) DO NOTHING
            `;
            await pool.query(insertDocsQuery, [nobooking, userid]);
            logger.info(`✅ Document record created/updated for ${nobooking}`);
        } catch (docsErr) {
            logger.warn('Warning: Could not insert into pat_3_documents:', docsErr.message);
        }

        logger.info(`✅ Upload dokumen berhasil untuk booking: ${nobooking}`);
        
        res.json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
                nobooking,
                uploadedFiles: Object.keys(req.files),
                updatedAt: new Date().toISOString()
            }
        });

        // Cleanup file jika error terjadi setelah upload
        if (req.files) {
            try {
                logger.debug('Cleaning up uploaded files...');
                const cleanupPromises = [
                    // Add cleanup logic here if needed
                ];
                await Promise.all(cleanupPromises);
                logger.debug('File cleanup completed');
            } catch (cleanupErr) {
                logger.warn('Warning: File cleanup failed:', cleanupErr.message);
            }
        }

    } catch (error) {
        logger.error('❌ Upload dokumen error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during file upload',
            error: error.message 
        });
    }
});

// Endpoint untuk upload tanda tangan
app.post('/api/ppatk_upload-signature', uploadTTD.single('signature'), async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized - Session required' 
        });
    }
    try {
        // Validasi session
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid } = req.session.user;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No signature file uploaded.' });
        }

        const signaturePath = req.file.path;

        // Update tanda tangan di database
        await pool.query(
            'UPDATE a_2_verified_users SET tanda_tangan_path = $1 WHERE userid = $2',
            [signaturePath, userid]
        );

        res.json({
            success: true,
            message: 'Signature uploaded successfully',
            signaturePath: signaturePath
        });
    } catch (error) {
        console.error('Error uploading signature:', error);
        res.status(500).json({ success: false, message: 'Failed to upload signature' });
    }
});

// Function untuk generate nomor registrasi
async function generateRegistrationNumber() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentDay = String(currentDate.getDate()).padStart(2, '0');
        
        // Format: REG-YYYYMMDD-XXXXXX (6 digit sequence)
        const datePrefix = `REG-${currentYear}${currentMonth}${currentDay}`;
        
        // Cari nomor terakhir untuk hari ini
        const result = await pool.query(
            `SELECT no_registrasi FROM lsb_1_terima_berkas_sspd 
             WHERE no_registrasi LIKE $1 
             ORDER BY no_registrasi DESC 
             LIMIT 1`,
            [`${datePrefix}-%`]
        );
        
        let sequenceNumber = 1;
        
        if (result.rows.length > 0) {
            const lastNumber = result.rows[0].no_registrasi;
            const lastSequence = parseInt(lastNumber.split('-')[2]);
            sequenceNumber = lastSequence + 1;
        }
        
        const registrationNumber = `${datePrefix}-${String(sequenceNumber).padStart(6, '0')}`;
        
        console.log(`📋 Generated registration number: ${registrationNumber}`);
        return registrationNumber;
        
    } catch (error) {
        console.error('Error generating registration number:', error);
        throw error;
    }
}

// Export router untuk digunakan di file lain jika diperlukan
// export { router };
}
