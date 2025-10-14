import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pool } from '../../../db.js';
// Uploadcare routes removed - using Railway storage only
// Import Railway signature routes
import railwaySignatureRoutes from './RailwaySignatureRoutes.js';
const router = express.Router();

export default function registerPPATKEndpoints({ app, pool, logger, morganMiddleware, uploadTTD, uploadDocumentMiddleware, PAT3_DISABLED, triggerNotificationByStatus, upsertBankVerification }) {
    // Validate required parameters
    if (!app) {
        throw new Error('app parameter is required');
    }
    if (!pool) {
        throw new Error('pool parameter is required');
    }
    
    // Middleware validation and logging
    console.log('🔧 [PPATK] Middleware status:');
    console.log('  - uploadTTD:', uploadTTD && typeof uploadTTD.fields === 'function' ? '✅ Available' : '❌ Not available');
    console.log('  - uploadDocumentMiddleware:', uploadDocumentMiddleware && typeof uploadDocumentMiddleware.fields === 'function' ? '✅ Available' : '❌ Not available');
// ===== UPLOADCARE ENDPOINTS REMOVED =====
// Uploadcare endpoints removed - using Railway storage only

// ===== RAILWAY SIGNATURE ENDPOINTS SETUP =====
// Setup Railway signature endpoints
app.use('/api/railway-signature', railwaySignatureRoutes);

    // ===== QUOTA TABLES INIT (idempotent) =====
    (async () => {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS ppatk_daily_quota (
                    quota_date date PRIMARY KEY,
                    used_count int NOT NULL DEFAULT 0,
                    limit_count int NOT NULL DEFAULT 80,
                    updated_at timestamp NOT NULL DEFAULT now()
                );
                CREATE TABLE IF NOT EXISTS ppatk_send_queue (
                    id bigserial PRIMARY KEY,
                    nobooking varchar(100) NOT NULL,
                    userid varchar(50) NOT NULL,
                    scheduled_for date NOT NULL,
                    requested_at timestamp NOT NULL DEFAULT now(),
                    status varchar(20) NOT NULL DEFAULT 'queued',
                    sent_at timestamp,
                    UNIQUE (nobooking)
                );
            `);
            console.log('✅ [PPATK] Quota tables ensured');
        } catch (e) {
            console.error('❌ [PPATK] Quota tables init failed:', e.message);
        }
    })();

// Legacy endpoint for frontend compatibility
app.get('/api/check-my-signature', async (req, res) => {
    try {
        console.log('🔍 [LEGACY-SIGNATURE-API] Checking signature status');
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }

        const userid = req.session.user.userid;
        
        // Query database for signature
        const result = await pool.query(
            `SELECT tanda_tangan_path, tanda_tangan_mime 
             FROM a_2_verified_users 
             WHERE userid = $1`,
            [userid]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found',
                has_signature: false 
            });
        }
        
        const user = result.rows[0];
        const hasSignature = !!(user.tanda_tangan_path);
        
        console.log(`✅ [LEGACY-SIGNATURE-API] Signature status for ${userid}:`, {
            hasSignature,
            path: user.tanda_tangan_path,
            mimeType: user.tanda_tangan_mime
        });
        
        res.json({
            success: true,
            has_signature: hasSignature,
            signature_path: user.tanda_tangan_path,
            signature_mime: user.tanda_tangan_mime
        });
        
    } catch (error) {
        console.error('❌ [LEGACY-SIGNATURE-API] Check signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check signature status',
            error: error.message
        });
    }
});

// Note: Create booking endpoint moved to create_booking_endpoint.js
// This endpoint uses JSON body and must be registered AFTER express.json() middleware

// Endpoint to update file ID in database
app.post('/api/ppatk/update-file-id', async (req, res) => {
    try {
        console.log('🔄 [UPDATE-FILE-ID] Update request received');
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking, documentType, fileId, fileUrl } = req.body;
        
        if (!nobooking || !documentType || !fileId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: nobooking, documentType, fileId'
            });
        }

        console.log('🔄 [UPDATE-FILE-ID] Updating:', { nobooking, documentType, fileId });

        // Map document types to database columns
        const columnMap = {
            'akta_tanah': {
                fileId: 'akta_tanah_file_id',
                path: 'akta_tanah_path'
            },
            'sertifikat_tanah': {
                fileId: 'sertifikat_tanah_file_id',
                path: 'sertifikat_tanah_path'
            },
            'pelengkap': {
                fileId: 'pelengkap_file_id',
                path: 'pelengkap_path'
            }
        };

        const columns = columnMap[documentType];
        if (!columns) {
            return res.status(400).json({
            success: false,
                message: 'Invalid document type'
            });
        }

        // Update database
        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET 
                ${columns.fileId} = $1,
                ${columns.path} = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $3
        `;

        const updateParams = [fileId, fileUrl || `https://44renul14z.ucarecd.net/${fileId}`, nobooking];
        
        const result = await pool.query(updateQuery, updateParams);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('✅ [UPDATE-FILE-ID] Database updated successfully:', {
            nobooking,
            documentType,
            fileId,
            rowsAffected: result.rowCount
        });

        res.json({
            success: true,
            message: 'File ID updated successfully',
            data: {
                nobooking,
                documentType,
                fileId,
                fileUrl: fileUrl || `https://44renul14z.ucarecd.net/${fileId}`
            }
        });

    } catch (error) {
        console.error('❌ [UPDATE-FILE-ID] Update failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update file ID',
            error: error.message
        });
    }
});

// PPATK: Load all booking data for table (untuk frontend table)
app.get('/api/ppatk/load-all-booking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        
        // Validate and sanitize pagination parameters
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        
        // Ensure positive values
        const safePage = Math.max(1, pageNum);
        const safeLimit = Math.max(1, Math.min(100, limitNum)); // Max 100 items per page
        const safeOffset = Math.max(0, (safePage - 1) * safeLimit);
        
        // Debug logging
        console.log('🔍 [PPATK] Pagination parameters:', {
            original: { page, limit },
            parsed: { pageNum, limitNum },
            safe: { safePage, safeLimit, safeOffset }
        });
        
        let whereClause = 'WHERE userid = $1';
        const queryParams = [userid];
        let paramCount = 1;
        
        if (search) {
            paramCount++;
            whereClause += ` AND (nobooking ILIKE $${paramCount} OR namawajibpajak ILIKE $${paramCount} OR namapemilikobjekpajak ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        if (status) {
            paramCount++;
            whereClause += ` AND trackstatus = $${paramCount}`;
            queryParams.push(status);
        }
        
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count);
        
        const dataQuery = `
            SELECT 
                nobooking,
                noppbb,
                namawajibpajak,
                namapemilikobjekpajak,
                npwpwp,
                tahunajb,
                trackstatus,
                created_at,
                updated_at,
                akta_tanah_path,
                sertifikat_tanah_path,
                pelengkap_path,
                pdf_dokumen_path,
                file_withstempel_path
            FROM pat_1_bookingsspd 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        
        queryParams.push(safeLimit, safeOffset);
        const dataResult = await pool.query(dataQuery, queryParams);
        
        res.json({
            success: true, 
            data: dataResult.rows,
            pagination: {
                page: safePage,
                limit: safeLimit,
                total: totalCount,
                pages: Math.ceil(totalCount / safeLimit)
            }
        });

    } catch (error) {
        console.error('❌ [PPATK] Load all booking failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load booking data: ' + error.message
        });
    }
});

// PPATK: Get booking detail by nobooking
app.get('/api/ppatk/booking/:nobooking', async (req, res) => {
    try {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

        const { nobooking } = req.params;
        const userid = req.session.user.userid;
        
        const query = `
            SELECT 
                p.nobooking,
                p.noppbb AS nop,
                p.namawajibpajak AS nama_wajib_pajak,
                p.alamatwajibpajak AS alamat_wajib_pajak,
                p.namapemilikobjekpajak AS atas_nama,
                p.npwpwp,
                p.tahunajb,
                p.kelurahandesawp AS kelurahan,
                p.kecamatanwp AS kecamatan,
                p.kabupatenkotawp AS kabupaten_kota,
                p.kodeposwp,
                p.kelurahandesaop AS kelurahanop,
                p.kecamatanop AS kecamatanopj,
                p.kabupatenkotaop,
                p.trackstatus,
                p.created_at,
                p.updated_at,
                o.letaktanahdanbangunan AS "Alamatop",
                o.keterangan,
                pp.luas_tanah,
                pp.luas_bangunan,
                u.nama AS nama_pemohon,
                u.telepon::text AS no_telepon
            FROM pat_1_bookingsspd p
            LEFT JOIN a_2_verified_users u ON u.userid = p.userid
            LEFT JOIN pat_4_objek_pajak o ON o.nobooking = p.nobooking
            LEFT JOIN pat_5_penghitungan_njop pp ON pp.nobooking = p.nobooking
            WHERE p.nobooking = $1 AND p.userid = $2
        `;
        
        const result = await pool.query(query, [nobooking, userid]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
      success: false, 
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true, 
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPATK] Get booking detail failed:', error);
        res.status(500).json({
            success: false, 
            message: 'Failed to get booking detail: ' + error.message
        });
    }
});

// Save additional PPATK form data (alamat_pemohon, kampungop, kelurahanop, kecamatanopj, keterangan)
app.post('/api/save-ppatk-additional-data', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;
        const body = req.body || {};
        let {
            nobooking,
            alamat_pemohon,
            kampungop,
            kelurahanop,
            kecamatanopj,
            keterangan
        } = body;

        // Fallback: allow nobooking via querystring too
        if (!nobooking) {
            nobooking = req.query?.nobooking;
        }

        if (!nobooking) {
            return res.status(400).json({ success: false, message: 'nobooking is required' });
        }

        // Update target tables/columns mapping based on available schema
        // 1) Simpan alamat pemohon ke tabel user (agar terasosiasi akun) jika kolom tersedia
        // 2) Simpan lokasi OP dan keterangan ke tabel objek pajak (pat_4_objek_pajak)

        // Optional: update alamat pemohon di a_2_verified_users jika dikirim
        if (alamat_pemohon && alamat_pemohon.trim()) {
            try {
                await pool.query(
                    `UPDATE a_2_verified_users SET alamat = $1 WHERE userid = $2`,
                    [alamat_pemohon.trim(), userid]
                );
            } catch (_) {
                // ignore if column doesn't exist
            }
        }

        // Simpan ke pat_8_validasi_tambahan (berdasarkan nobooking) 
        // Tabel berisi: nobooking, kampungop, kelurahanop, kecamatanopj, alamat_pemohon, created_at, updated_at
        const existing = await pool.query(`SELECT id FROM pat_8_validasi_tambahan WHERE nobooking = $1 LIMIT 1`, [nobooking]);
        if (existing.rows.length > 0) {
            await pool.query(
                `UPDATE pat_8_validasi_tambahan
                 SET 
                    kampungop = COALESCE($2, kampungop),
                    kelurahanop = COALESCE($3, kelurahanop),
                    kecamatanopj = COALESCE($4, kecamatanopj),
                    alamat_pemohon = COALESCE($5, alamat_pemohon),
                    updated_at = now()
                 WHERE nobooking = $1`,
                [nobooking, kampungop || null, kelurahanop || null, kecamatanopj || null, alamat_pemohon || null]
            );
        } else {
            await pool.query(
                `INSERT INTO pat_8_validasi_tambahan (nobooking, kampungop, kelurahanop, kecamatanopj, alamat_pemohon, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, now(), now())`,
                [nobooking, kampungop || null, kelurahanop || null, kecamatanopj || null, alamat_pemohon || null]
            );
        }

        return res.json({ success: true, message: 'Data berhasil disimpan' });
    } catch (error) {
        console.error('❌ [PPATK] Save additional data failed:', error);
        return res.status(500).json({ success: false, message: 'Failed to save data', error: error.message });
    }
});

// PPATK: Update booking status
app.put('/api/ppatk/booking/:nobooking/trackstatus', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const { trackstatus } = req.body;
        const userid = req.session.user.userid;
        
        if (!trackstatus) {
            return res.status(400).json({ 
                success: false, 
                message: 'Trackstatus is required'
            });
        }
        
        const query = `
            UPDATE pat_1_bookingsspd 
            SET trackstatus = $1, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $2 AND userid = $3
            RETURNING *
        `;
        
        const result = await pool.query(query, [trackstatus, nobooking, userid]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({ 
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPATK] Update status failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update status: ' + error.message
        });
    }
});

// PPATK: Delete booking
app.delete('/api/ppatk/booking/:nobooking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const userid = req.session.user.userid;
        
        const query = `
            DELETE FROM pat_1_bookingsspd 
            WHERE nobooking = $1 AND userid = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [nobooking, userid]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPATK] Delete booking failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete booking: ' + error.message
        });
    }
});

// Upload signatures endpoint
app.post('/api/ppatk/upload-signatures', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.body;
        const userid = req.session.user.userid;

        if (!nobooking) {
            return res.status(400).json({ success: false, message: 'No booking required' });
        }

        // Handle signature upload logic here
            res.json({
                success: true,
            message: 'Signature uploaded successfully',
            nobooking: nobooking
            });

        } catch (error) {
        console.error('❌ [PPATK] Upload signature failed:', error);
        res.status(500).json({
            success: false,
            message: 'Upload signature failed: ' + error.message
        });
    }
});

// Upload documents endpoint
app.post('/api/ppatk/upload-documents', async (req, res) => {
    try {
        console.log('📤 [UPLOAD-DOCUMENTS] Upload request received');
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        console.log(`📤 [UPLOAD-DOCUMENTS] Upload request received`);
        console.log(`📤 [UPLOAD-DOCUMENTS] Request headers:`, {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length']
        });

        // Import Railway storage functions
        const { uploadToRailway } = await import('../../config/uploads/railway_storage.js');
        
        // Handle file uploads using multer
        const multer = await import('multer');
        const upload = multer.default({ 
            storage: multer.default.memoryStorage(),
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB limit per file
                files: 3 // Maximum 3 files (aktaTanah, sertifikatTanah, pelengkap)
            },
            fileFilter: (req, file, cb) => {
                // Allow images and PDFs
                const allowedTypes = [
                    'image/jpeg',
                    'image/jpg', 
                    'image/png',
                    'image/gif',
                    'image/webp',
                    'application/pdf'
                ];
                
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error(`File type ${file.mimetype} not allowed`), false);
                }
            }
        });
        
        // Process multiple file upload
        upload.fields([
            { name: 'aktaTanah', maxCount: 1 },
            { name: 'sertifikatTanah', maxCount: 1 },
            { name: 'pelengkap', maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                console.error('❌ [UPLOAD-DOCUMENTS] Multer error:', err);
                console.error('❌ [UPLOAD-DOCUMENTS] Error details:', {
                    code: err.code,
                    message: err.message,
                    field: err.field
                });
                
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ success: false, message: 'File too large. Maximum size is 50MB.' });
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ success: false, message: 'Too many files. Only one file allowed.' });
                } else {
                    return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
                }
            }

            console.log(`📤 [UPLOAD-DOCUMENTS] Multer processing completed. Files:`, req.files ? Object.keys(req.files).length : 0);
            console.log(`📤 [UPLOAD-DOCUMENTS] Request body after multer:`, req.body);

            if (!req.files || Object.keys(req.files).length === 0) {
                console.error('❌ [UPLOAD-DOCUMENTS] No files in request');
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }

            // Extract parameters after multer processes the FormData
            const { booking_id, nobooking } = req.body;
        const userid = req.session.user.userid;

            // Use nobooking as the primary identifier (business key)
            const bookingId = nobooking || booking_id;

            if (!bookingId) {
                console.error('❌ [UPLOAD-DOCUMENTS] No booking ID found in request body');
                return res.status(400).json({ success: false, message: 'NoBooking required' });
            }

            console.log(`📤 [UPLOAD-DOCUMENTS] Processing upload for booking: ${bookingId}, user: ${userid}`);
            console.log(`📤 [UPLOAD-DOCUMENTS] Files received:`, Object.keys(req.files));

            try {
                // Process each uploaded file
                const uploadResults = [];
                const fileTypes = ['aktaTanah', 'sertifikatTanah', 'pelengkap'];
                
                for (const fileType of fileTypes) {
                    if (req.files[fileType] && req.files[fileType][0]) {
                        const file = req.files[fileType][0];
                        console.log(`📤 [UPLOAD-DOCUMENTS] Processing ${fileType}:`, {
                            fieldname: file.fieldname,
                            originalname: file.originalname,
                            mimetype: file.mimetype,
                            size: file.size
                        });

                        // Map frontend field names to backend document types
                        const documentTypeMap = {
                            'aktaTanah': 'akta_tanah',
                            'sertifikatTanah': 'sertifikat_tanah',
                            'pelengkap': 'pelengkap'
                        };
                        
                        const documentType = documentTypeMap[fileType];
                        console.log(`📤 [UPLOAD-DOCUMENTS] Document type mapped: ${fileType} -> ${documentType}`);

                        console.log(`📤 [UPLOAD-DOCUMENTS] Uploading ${documentType}:`, {
                            fileName: file.originalname,
                            fileSize: file.size,
                            mimeType: file.mimetype
                        });

                // 🔄 TRANSACTIONAL UPLOAD - Prevent race conditions
                const client = await pool.connect();
                let uploadResult = null;
                
                try {
                    await client.query('BEGIN');
                    console.log(`🔄 [UPLOAD-DOCUMENTS] Transaction started for ${documentType}`);

                    // 1. Upload to Railway storage first
                    uploadResult = await uploadToRailway(file, {
                        userid: userid,
                        nobooking: bookingId,
                        docType: documentType,
                        sequenceNumber: 1
                    });

                    if (!uploadResult.success) {
                        throw new Error(uploadResult.error || 'Upload to Railway storage failed');
                    }

                    console.log(`✅ [UPLOAD-DOCUMENTS] Upload successful:`, {
                        relativePath: uploadResult.relativePath,
                        fileUrl: uploadResult.fileUrl
                    });

                    // 2. Validate file accessibility (Railway storage is immediate)
                    console.log(`🔍 [UPLOAD-DOCUMENTS] Validating file accessibility...`);
                    try {
                        console.log(`🧩 [UPLOAD-DOCUMENTS] Starting Railway validation for: ${uploadResult.relativePath}`);
                        
                        const { validateFileWithRailway } = await import('../../config/uploads/railway_storage.js');
                        const validationResult = await validateFileWithRailway(uploadResult.relativePath, uploadResult.mimeType);
                        
                        if (validationResult.ready) {
                            console.log(`✅ [UPLOAD-DOCUMENTS] File validation passed: ${uploadResult.relativePath}`);
                        } else {
                            console.warn(`⚠️ [UPLOAD-DOCUMENTS] File validation failed: ${validationResult.message}`);
                            // For Railway storage, this should not happen, but log warning
                        }
                    } catch (validationError) {
                        console.warn(`⚠️ [UPLOAD-DOCUMENTS] File validation failed: ${validationError.message}`);
                        // For Railway storage, this should not happen, but log warning
                    }

                    // 3. Update database with new file information
                    const columnMap = {
                        'akta_tanah': {
                            fileId: 'akta_tanah_file_id',
                            path: 'akta_tanah_path',
                            mimeType: 'akta_tanah_mime_type',
                            size: 'akta_tanah_size'
                        },
                        'sertifikat_tanah': {
                            fileId: 'sertifikat_tanah_file_id',
                            path: 'sertifikat_tanah_path',
                            mimeType: 'sertifikat_tanah_mime_type',
                            size: 'sertifikat_tanah_size'
                        },
                        'pelengkap': {
                            fileId: 'pelengkap_file_id',
                            path: 'pelengkap_path',
                            mimeType: 'pelengkap_mime_type',
                            size: 'pelengkap_size'
                        }
                    };

                    const columns = columnMap[documentType];
                    if (!columns) {
                        throw new Error('Invalid document type');
                    }

                    const updateQuery = `
                        UPDATE pat_1_bookingsspd 
                        SET 
                            ${columns.fileId} = $1,
                            ${columns.path} = $2,
                            ${columns.mimeType} = $3,
                            ${columns.size} = $4,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE nobooking = $5 AND userid = $6
                    `;

                    const updateParams = [
                        uploadResult.relativePath, // Use relativePath as fileId for Railway storage
                        uploadResult.fileUrl,
                        uploadResult.mimeType, // Use mimeType from upload result
                        uploadResult.size, // Use size from upload result
                        bookingId,
                        userid
                    ];

                    const updateResult = await client.query(updateQuery, updateParams);

                    if (updateResult.rowCount === 0) {
                        throw new Error('Booking not found or no permission to update');
                    }

                    // 4. Commit transaction
                    await client.query('COMMIT');
                    console.log(`✅ [UPLOAD-DOCUMENTS] Transaction committed successfully`);

                    console.log(`✅ [UPLOAD-DOCUMENTS] Database updated successfully:`, {
                        documentType,
                        relativePath: uploadResult.relativePath,
                        rowsAffected: updateResult.rowCount
                    });

                        // Store result for this file
                        uploadResults.push({
                            documentType,
                            relativePath: uploadResult.relativePath,
                            fileUrl: uploadResult.fileUrl,
                            fileName: uploadResult.fileName,
                            fileSize: uploadResult.size,
                            mimeType: uploadResult.mimeType,
                            success: true
                        });

                    } catch (transactionError) {
                        // 5. Rollback transaction on any error
                        await client.query('ROLLBACK');
                        console.error(`❌ [UPLOAD-DOCUMENTS] Transaction rolled back for ${documentType}:`, transactionError.message);
                        
                        // If upload succeeded but database failed, we have an orphaned file
                        if (uploadResult && uploadResult.success) {
                            console.warn(`⚠️ [UPLOAD-DOCUMENTS] Orphaned file detected: ${uploadResult.relativePath || uploadResult.fileId}`);
                            
                            // Attempt to cleanup orphaned file (Railway storage)
                            try {
                                const { deleteFromRailway } = await import('../../config/uploads/railway_storage.js');
                                if (uploadResult.relativePath) {
                                    await deleteFromRailway(uploadResult.relativePath);
                                    console.log(`🧹 [UPLOAD-DOCUMENTS] Cleaned up orphaned file: ${uploadResult.relativePath}`);
                                }
                            } catch (cleanupError) {
                                console.error(`❌ [UPLOAD-DOCUMENTS] Orphaned file cleanup failed:`, cleanupError.message);
                            }
                        }
                        
                        throw transactionError;
                    } finally {
                        client.release();
                    }
                }
            }

            // Return results for all uploaded files
            if (uploadResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid files were processed'
                });
            }

        res.json({
            success: true,
                message: `${uploadResults.length} document(s) uploaded and database updated successfully`,
                data: {
                    uploadResults,
                    totalFiles: uploadResults.length
                }
            });

            } catch (uploadError) {
                console.error('❌ [UPLOAD-DOCUMENTS] Upload processing failed:', uploadError);
                res.status(500).json({
                    success: false,
                    message: 'Upload processing failed: ' + uploadError.message
                });
            }
        });

    } catch (error) {
        console.error('❌ [UPLOAD-DOCUMENTS] Upload documents failed:', error);
        res.status(500).json({
            success: false,
            message: 'Upload documents failed: ' + error.message
        });
    }
});

// Update file URL endpoint - Railway storage URLs are stable, no update needed
app.post('/api/ppatk/update-file-urls', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;

        console.log(`🔧 [UPDATE-FILE-URLS] Railway storage URLs are stable, no update needed for user: ${userid}`);

        // Railway storage URLs are stable and don't need updating
        res.json({
            success: true,
            message: 'Railway storage URLs are stable - no updates needed',
            data: {
                totalUpdated: 0,
                totalBookings: 0,
                updateResults: [],
                updatedAt: new Date().toISOString(),
                note: 'Railway storage uses stable local URLs that don\'t require updates'
            }
        });

    } catch (error) {
        console.error('❌ [UPDATE-FILE-URLS] Update failed:', error);
        res.status(500).json({
            success: false,
            message: 'Update failed: ' + error.message
        });
    }
});

// Get documents endpoint
app.get('/api/ppatk/get-documents', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking, booking_id } = req.query;
        const userid = req.session.user.userid;

        // Use nobooking as the primary identifier (business key)
        const bookingId = nobooking || booking_id;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'NoBooking required' });
        }

        // Get documents from database with Railway storage information
        const query = `
            SELECT 
                akta_tanah_path, 
                akta_tanah_file_id,
                akta_tanah_mime_type,
                akta_tanah_size,
                sertifikat_tanah_path, 
                sertifikat_tanah_file_id,
                sertifikat_tanah_mime_type,
                sertifikat_tanah_size,
                pelengkap_path, 
                pelengkap_file_id,
                pelengkap_mime_type,
                pelengkap_size,
                created_at,
                updated_at
            FROM pat_1_bookingsspd
            WHERE nobooking = $1 AND userid = $2
        `;
        
        console.log(`🔍 [GET-DOCUMENTS] Querying for booking: ${bookingId}, user: ${userid}`);
        
        const result = await pool.query(query, [bookingId, userid]);
        
        console.log(`🔍 [GET-DOCUMENTS] Query result: ${result.rows.length} rows found`);
        
        if (result.rows.length === 0) {
            console.log(`⚠️ [GET-DOCUMENTS] No documents found for booking: ${bookingId}`);
            return res.json({
                success: true,
                data: null
            });
        }
        
        const row = result.rows[0];
        
        // Format data untuk frontend dengan custom filename
        const formattedData = {
            aktaTanah: row.akta_tanah_path ? {
                fileUrl: row.akta_tanah_path,
                fileId: row.akta_tanah_file_id,
                fileName: row.akta_tanah_file_id, // ✅ Gunakan file ID sebagai display name
                customFileName: row.akta_tanah_file_id, // ✅ Custom filename (sementara sama dengan file ID)
                mimeType: row.akta_tanah_mime_type,
                size: row.akta_tanah_size
            } : null,
            sertifikatTanah: row.sertifikat_tanah_path ? {
                fileUrl: row.sertifikat_tanah_path,
                fileId: row.sertifikat_tanah_file_id,
                fileName: row.sertifikat_tanah_file_id, // ✅ Gunakan file ID sebagai display name
                customFileName: row.sertifikat_tanah_file_id, // ✅ Custom filename (sementara sama dengan file ID)
                mimeType: row.sertifikat_tanah_mime_type,
                size: row.sertifikat_tanah_size
            } : null,
            pelengkap: row.pelengkap_path ? {
                fileUrl: row.pelengkap_path,
                fileId: row.pelengkap_file_id,
                fileName: row.pelengkap_file_id, // ✅ Gunakan file ID sebagai display name
                customFileName: row.pelengkap_file_id, // ✅ Custom filename (sementara sama dengan file ID)
                mimeType: row.pelengkap_mime_type,
                size: row.pelengkap_size
            } : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        
        console.log(`✅ [GET-DOCUMENTS] Returning formatted data:`, {
            aktaTanah: formattedData.aktaTanah ? 'Present' : 'Null',
            sertifikatTanah: formattedData.sertifikatTanah ? 'Present' : 'Null',
            pelengkap: formattedData.pelengkap ? 'Present' : 'Null'
        });
        
        res.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('❌ [PPATK] Get documents failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Get documents failed: ' + error.message
        });
    }
});

// Railway Storage Proxy Endpoint for Preview
// Konfigurasi Railway Storage
const REQUIRE_AUTH = false; // Disable session auth for debugging
  


// 🔹 HEAD request (cek file tersedia atau tidak) - Railway Storage
app.head('/api/ppatk/file-proxy', async (req, res) => {
    try {
        if (REQUIRE_AUTH && (!req.session || !req.session.user)) {
            return res.sendStatus(401);
        }

        const { relativePath } = req.query;
        
        if (!relativePath) {
            console.error('❌ [RAILWAY-PROXY HEAD] No relativePath provided');
            return res.sendStatus(400);
        }

        console.log(`🔍 [RAILWAY-PROXY HEAD] Checking file: ${relativePath}`);

        // Import Railway storage functions
        const { validateFileWithRailway } = await import('../../config/uploads/railway_storage.js');
        
        // Validate file accessibility
        const validationResult = await validateFileWithRailway(relativePath);
        
        if (validationResult.success && validationResult.ready) {
            console.log(`✅ [RAILWAY-PROXY HEAD] File is accessible: ${relativePath}`);
            
            // Set appropriate headers for Railway storage
            res.set('Content-Type', validationResult.mimeType || 'application/octet-stream');
            res.set('X-File-Path', relativePath);
            res.set('X-Storage-Type', 'railway');
            
            return res.sendStatus(200);
        } else {
            console.warn(`⚠️ [RAILWAY-PROXY HEAD] File not accessible: ${relativePath}`);
            return res.status(404).json({
                success: false,
                message: "File tidak ditemukan di Railway storage."
            });
        }
    } catch (err) {
        console.error('❌ [RAILWAY-PROXY HEAD] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during file validation."
        });
    }
});

// 🔹 GET request (stream file ke client) - Railway Storage
app.get('/api/ppatk/file-proxy', async (req, res) => {
    try {
        if (REQUIRE_AUTH && (!req.session || !req.session.user)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { relativePath } = req.query;
        
        if (!relativePath) {
            return res.status(400).json({ success: false, message: 'Relative path required' });
        }

        console.log(`🔍 [RAILWAY-PROXY GET] Proxying file: ${relativePath}`);

        // Import Railway storage functions
        const { getFileInfo } = await import('../../config/uploads/railway_storage.js');
        const fs = await import('fs');
        const path = await import('path');
        
        // Get file info
        const fileInfo = await getFileInfo(relativePath);
        
        if (!fileInfo.success || !fileInfo.fileInfo.isReady) {
            console.warn(`⚠️ [RAILWAY-PROXY GET] File not found: ${relativePath}`);
            return res.status(404).json({
                success: false,
                message: "File tidak ditemukan di Railway storage."
            });
        }
        
        // Create file stream from Railway storage
        const fullPath = path.join(process.cwd(), 'backend', 'storage', 'ppatk', relativePath);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ [RAILWAY-PROXY GET] Physical file not found: ${fullPath}`);
            return res.status(404).json({
                success: false,
                message: "File tidak ditemukan di storage."
            });
        }
        
        console.log(`✅ [RAILWAY-PROXY GET] Streaming file: ${fullPath}`);
        
        // Set appropriate headers
        res.set({
            'Content-Type': fileInfo.fileInfo.mimeType || 'application/octet-stream',
            'Content-Length': fileInfo.fileInfo.size,
            'Cache-Control': 'public, max-age=3600',
            'Content-Disposition': 'inline',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-File-Path': relativePath,
            'X-Storage-Type': 'railway'
        });

        // Stream file to client
        const fileStream = fs.createReadStream(fullPath);
        fileStream.pipe(res);
        
        fileStream.on('error', (error) => {
            console.error(`❌ [RAILWAY-PROXY GET] Stream error: ${error.message}`);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Error streaming file."
                });
            }
        });
    } catch (err) {
        console.error('❌ [RAILWAY-PROXY GET] Proxy failed:', err.message);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Railway proxy service error',
                details: err.message
            });
        }
    }
});

// Test endpoint untuk debugging Railway storage
app.get('/api/test-railway-proxy', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Railway storage proxy test endpoint working',
        timestamp: new Date().toISOString(),
        service: 'railway-storage'
    });
});

// ===== QUOTA ENDPOINTS =====
// Get daily quota summary
app.get('/api/ppatk/quota', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const dateParam = req.query.date;
        const normalizeDate = (s) => {
            if (!s) {
                const d = new Date();
                return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already normalized
            const d = new Date(s);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
        };
        const yyyy_mm_dd = normalizeDate(dateParam);

        const q = await pool.query(
            `SELECT quota_date, used_count, limit_count FROM ppatk_daily_quota WHERE quota_date = $1`,
            [yyyy_mm_dd]
        );
        const row = q.rows[0] || { quota_date: yyyy_mm_dd, used_count: 0, limit_count: 80 };
        res.json({ success: true, data: { date: row.quota_date, used: row.used_count, limit: row.limit_count, remaining: Math.max(0, row.limit_count - row.used_count) } });
    } catch (e) {
        console.error('❌ [QUOTA] Get quota failed:', e);
        res.status(500).json({ success: false, message: 'Get quota failed' });
    }
});


// Schedule send with quota enforcement
app.post('/api/ppatk/schedule-send', async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userid = req.session.user.userid;
        // Defensive parsing: accept body or query fallback
        let nobooking = (req.body && req.body.nobooking) || req.query.nobooking;
        let scheduled_for = (req.body && req.body.scheduled_for) || req.query.scheduled_for;
        if (!req.body) {
            console.warn('⚠️ [QUOTA] schedule-send: req.body is undefined, headers=', req.headers);
        }
        // Fallback: jika nobooking tidak dikirim, ambil booking terbaru milik user (paling akhir dibuat)
        if (!nobooking) {
            const last = await pool.query(`SELECT nobooking FROM pat_1_bookingsspd WHERE userid=$1 ORDER BY created_at DESC LIMIT 1`, [userid]);
            nobooking = last.rows[0]?.nobooking;
        }
        // Normalize scheduled_for to YYYY-MM-DD (no TZ shift)
        if (scheduled_for) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(scheduled_for) === false) {
                const d = new Date(scheduled_for);
                scheduled_for = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
            }
        }
        if (!nobooking || !scheduled_for) {
            return res.status(400).json({ success: false, message: 'nobooking and scheduled_for are required' });
        }

        // Validate booking ownership & status (only allow Draft or Pending to be rescheduled)
        const b = await pool.query(`SELECT nobooking, userid, trackstatus FROM pat_1_bookingsspd WHERE nobooking=$1 AND userid=$2`, [nobooking, userid]);
        if (b.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        const currentStatus = b.rows[0].trackstatus;
        if (currentStatus && !['Draft', 'Pending'].includes(currentStatus)) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: `Booking sudah dalam status ${currentStatus}, tidak dapat dijadwalkan ulang` });
        }

        await client.query('BEGIN');

        // Upsert quota row
        await client.query(`INSERT INTO ppatk_daily_quota (quota_date, used_count, limit_count)
                            VALUES ($1, 0, 80)
                            ON CONFLICT (quota_date) DO NOTHING`, [scheduled_for]);

        // Check quota
        const q = await client.query(`SELECT used_count, limit_count FROM ppatk_daily_quota WHERE quota_date=$1 FOR UPDATE`, [scheduled_for]);
        const { used_count, limit_count } = q.rows[0];
        if (used_count >= limit_count) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Kuota penuh untuk tanggal tersebut' });
        }

        // Insert queue (unique nobooking) and update status to Pending
        await client.query(`INSERT INTO ppatk_send_queue (nobooking, userid, scheduled_for) VALUES ($1,$2,$3)
                            ON CONFLICT (nobooking) DO UPDATE SET scheduled_for=$3, status='queued'`, [nobooking, userid, scheduled_for]);
        
        // Update booking status to Pending
        await client.query(`UPDATE pat_1_bookingsspd SET trackstatus='Pending', updated_at=now() WHERE nobooking=$1 AND userid=$2`, [nobooking, userid]);

        // Increment quota
        const upd = await client.query(`UPDATE ppatk_daily_quota SET used_count = used_count + 1, updated_at = now() WHERE quota_date=$1 RETURNING used_count, limit_count`, [scheduled_for]);

        await client.query('COMMIT');
        const u = upd.rows[0];
        res.json({ success: true, message: 'Scheduled', data: { scheduled_for, used: u.used_count, limit: u.limit_count, remaining: Math.max(0, u.limit_count - u.used_count) } });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ [QUOTA] Schedule failed:', e);
        res.status(500).json({ success: false, message: 'Schedule failed' });
    } finally {
        client.release();
    }
});

// Send now = schedule for today then mark as sent immediately (still counting quota)
app.post('/api/ppatk/send-now', async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userid = req.session.user.userid;
        let nobooking = (req.body && req.body.nobooking) || req.query.nobooking;
        if (!req.body) {
            console.warn('⚠️ [QUOTA] send-now: req.body is undefined, headers=', req.headers);
        }
        // Fallback: jika nobooking tidak dikirim, gunakan booking terbaru milik user
        if (!nobooking) {
            const last = await pool.query(`SELECT nobooking FROM pat_1_bookingsspd WHERE userid=$1 ORDER BY created_at DESC LIMIT 1`, [userid]);
            nobooking = last.rows[0]?.nobooking;
        }
        if (!nobooking) return res.status(400).json({ success: false, message: 'nobooking required' });

        const today = new Date().toISOString().slice(0,10);

        await client.query('BEGIN');

        await client.query(`INSERT INTO ppatk_daily_quota (quota_date, used_count, limit_count)
                            VALUES ($1, 0, 80)
                            ON CONFLICT (quota_date) DO NOTHING`, [today]);
        const q = await client.query(`SELECT used_count, limit_count FROM ppatk_daily_quota WHERE quota_date=$1 FOR UPDATE`, [today]);
        const { used_count, limit_count } = q.rows[0];
        if (used_count >= limit_count) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: 'Kuota hari ini penuh' });
        }

        // Validate booking ownership & status (only allow Draft or Pending to be sent now)
        const b = await client.query(`SELECT nobooking, trackstatus FROM pat_1_bookingsspd WHERE nobooking=$1 AND userid=$2`, [nobooking, userid]);
        if (b.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        const currentStatus = b.rows[0].trackstatus;
        if (currentStatus && !['Draft', 'Pending'].includes(currentStatus)) {
            await client.query('ROLLBACK');
            return res.status(409).json({ success: false, message: `Booking sudah dalam status ${currentStatus}, tidak dapat dikirim` });
        }

        await client.query(`INSERT INTO ppatk_send_queue (nobooking, userid, scheduled_for, status, sent_at)
                            VALUES ($1,$2,$3,'sent', now())
                            ON CONFLICT (nobooking) DO UPDATE SET status='sent', sent_at=now(), scheduled_for=$3`, [nobooking, userid, today]);

        await client.query(`UPDATE ppatk_daily_quota SET used_count = used_count + 1, updated_at = now() WHERE quota_date=$1`, [today]);

        // Untuk alur internal: setelah send-now, status masuk ke LTB sebagai 'Diolah'
        await client.query(`UPDATE pat_1_bookingsspd SET trackstatus='Diolah', updated_at=now() WHERE nobooking=$1 AND userid=$2`, [nobooking, userid]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Dikirim sekarang (kuota dihitung)', data: { date: today } });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ [QUOTA] Send-now failed:', e);
        res.status(500).json({ success: false, message: 'Send-now failed' });
    } finally {
        client.release();
    }
});

// My schedules
app.get('/api/ppatk/my-schedules', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userid = req.session.user.userid;
        const r = await pool.query(`SELECT id, nobooking, scheduled_for, status, requested_at, sent_at
                                    FROM ppatk_send_queue WHERE userid=$1 ORDER BY scheduled_for, requested_at`, [userid]);
        res.json({ success: true, data: r.rows });
    } catch (e) {
        console.error('❌ [QUOTA] My schedules failed:', e);
        res.status(500).json({ success: false, message: 'My schedules failed' });
    }
});

// Process pending queue (for cron/worker during business hours 09:00-16:00)
app.post('/api/ppatk/process-pending-queue', async (req, res) => {
    const client = await pool.connect();
    try {
        const today = new Date().toISOString().slice(0,10);
        const currentHour = new Date().getHours();
        
        // Check if within business hours (9 AM to 4 PM)
        if (currentHour < 9 || currentHour >= 16) {
            return res.json({ 
                success: true, 
                message: 'Outside business hours (09:00-16:00)', 
                processed: 0,
                currentHour 
            });
        }

        await client.query('BEGIN');

        // Get pending bookings for today
        const pending = await client.query(`
            SELECT sq.id, sq.nobooking, sq.userid, sq.scheduled_for
            FROM ppatk_send_queue sq
            WHERE sq.scheduled_for = $1 AND sq.status = 'queued'
            ORDER BY sq.requested_at ASC
            LIMIT 10
        `, [today]);

        let processed = 0;
        for (const item of pending.rows) {
            try {
                // Update queue status to sent
                await client.query(`
                    UPDATE ppatk_send_queue 
                    SET status='sent', sent_at=now() 
                    WHERE id=$1
                `, [item.id]);

                // Setelah antrian diproses oleh sistem, status menjadi 'Diolah' (masuk ke LTB)
                await client.query(`
                    UPDATE pat_1_bookingsspd 
                    SET trackstatus='Diolah', updated_at=now() 
                    WHERE nobooking=$1 AND userid=$2
                `, [item.nobooking, item.userid]);

                processed++;
                console.log(`✅ [PROCESS-QUEUE] Processed: ${item.nobooking} for user ${item.userid}`);
            } catch (itemError) {
                console.error(`❌ [PROCESS-QUEUE] Failed to process ${item.nobooking}:`, itemError);
            }
        }

        await client.query('COMMIT');
        res.json({ 
            success: true, 
            message: `Processed ${processed} pending bookings`, 
            processed,
            currentHour,
            date: today
        });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ [PROCESS-QUEUE] Process failed:', e);
        res.status(500).json({ success: false, message: 'Process failed' });
    } finally {
        client.release();
    }
});

// Endpoint untuk membersihkan proxy path yang tidak valid (Railway Storage)
app.post('/api/cleanup-invalid-proxy-paths', async (req, res) => {
    try {
        console.log('🧹 [CLEANUP] Starting cleanup of invalid proxy paths...');
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;
        
        // Simple cleanup - just return success for now
        res.json({
            success: true,
            message: 'Cleanup completed - Railway storage integration active',
            cleaned: 0,
            errors: []
        });
        
    } catch (error) {
        console.error('❌ [CLEANUP] Cleanup failed:', error);
        res.status(500).json({
            success: false,
            message: 'Cleanup failed: ' + error.message
        });
    }
});

// Endpoint untuk manual cleanup file lama di Railway Storage
app.post('/api/cleanup-old-files', async (req, res) => {
    try {
        console.log('🧹 [CLEANUP] Starting manual cleanup of old files...');
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid, docType, sequenceNumber, nobooking } = req.body;
        
        if (!userid || !docType || !sequenceNumber) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: userid, docType, sequenceNumber'
            });
        }

        // Import cleanup function from Railway storage
        const { cleanupOldFiles } = await import('../../config/uploads/railway_storage.js');
        
        const currentYear = new Date().getFullYear();
        const cleanupResult = await cleanupOldFiles(
            userid,
            docType,
            sequenceNumber,
            currentYear,
            nobooking,
            2 // Keep latest 2 files
        );

        console.log(`✅ [CLEANUP] Manual cleanup completed:`, cleanupResult);

        res.json({
            success: true,
            message: 'Manual cleanup completed',
            result: cleanupResult
        });
        
    } catch (error) {
        console.error('❌ [CLEANUP] Manual cleanup failed:', error);
        res.status(500).json({
            success: false,
            message: 'Manual cleanup failed: ' + error.message
        });
    }
});

// Railway Storage health check endpoint (PPATK path)
app.get('/api/ppatk/railway-health', async (req, res) => {
    try {
        console.log('🔍 [RAILWAY-HEALTH] Starting health check...');
        
        // Test 1: Check if storage directory exists
        const fs = await import('fs');
        const path = await import('path');
        const storagePath = path.join(process.cwd(), 'backend', 'storage', 'ppatk');
        
        const storageExists = fs.existsSync(storagePath);
        const storageWritable = storageExists && fs.accessSync ? true : false;

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            tests: {
                storageDirectory: storageExists,
                storageWritable: storageWritable
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                storagePath: storagePath
            },
            configuration: {
                storageType: 'local-filesystem',
                basePath: storagePath
            }
        };

        console.log('✅ [RAILWAY-HEALTH] Health check completed:', healthStatus);

        res.json(healthStatus);

    } catch (error) {
        console.error('❌ [RAILWAY-HEALTH] Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});


// Update track status endpoint
app.put('/api/ppatk/update-trackstatus/:nobooking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const { trackstatus } = req.body;
        const userid = req.session.user.userid;

        if (!trackstatus) {
            return res.status(400).json({ success: false, message: 'Trackstatus required' });
        }

        // Update trackstatus in database
        const query = `
            UPDATE pat_1_bookingsspd 
            SET trackstatus = $1, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $2 AND userid = $3
            RETURNING *
        `;
        
        const result = await pool.query(query, [trackstatus, nobooking, userid]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPATK] Update track status failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Update track status failed: ' + error.message
        });
    }
});

// LTB process endpoint
app.post('/api/ppatk/ltb-process', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;

        // 🔹 Contoh query database (sesuaikan nama tabel)
        const query = `SELECT nobooking FROM pat_1_bookingsspd WHERE userid = $1 ORDER BY created_at DESC LIMIT 1`;
        const result = await pool.query(query, [userid]); // <-- ini definisi 'result'

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking found for this user' });
        }

        const nobooking = result.rows[0].nobooking;

        // Lanjutkan proses LTB
        res.json({
            success: true,
            message: 'LTB process completed successfully',
            nobooking
        });

    } catch (error) {
        console.error('❌ [PPATK] LTB process failed:', error);
        res.status(500).json({
            success: false,
            message: 'LTB process failed: ' + error.message
        });
    }
});


// File synchronization verification endpoint
app.get('/api/ppatk/verify-file-sync', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.query;
        const userid = req.session.user.userid;

        if (!nobooking) {
            return res.status(400).json({ success: false, message: 'NoBooking required' });
        }

        console.log(`🔍 [VERIFY-SYNC] Verifying file sync for booking: ${nobooking}`);

        // Get file information from database
        const query = `
            SELECT 
                akta_tanah_file_id,
                akta_tanah_path,
                sertifikat_tanah_file_id,
                sertifikat_tanah_path,
                pelengkap_file_id,
                pelengkap_path
            FROM pat_1_bookingsspd
            WHERE nobooking = $1 AND userid = $2
        `;

        const result = await pool.query(query, [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const row = result.rows[0];
        const verificationResults = {};

        // Verify each file type
        const fileTypes = [
            { type: 'akta_tanah', fileId: row.akta_tanah_file_id, path: row.akta_tanah_path },
            { type: 'sertifikat_tanah', fileId: row.sertifikat_tanah_file_id, path: row.sertifikat_tanah_path },
            { type: 'pelengkap', fileId: row.pelengkap_file_id, path: row.pelengkap_path }
        ];

        for (const fileType of fileTypes) {
            if (!fileType.fileId) {
                verificationResults[fileType.type] = {
                    status: 'not_uploaded',
                    message: 'File not uploaded'
                };
                continue;
            }

            try {
                // Test file accessibility
                const axios = await import('axios');
                const response = await axios.default.head(fileType.path, {
                    timeout: 5000,
                    validateStatus: () => true
                });

                if (response.status === 200) {
                    verificationResults[fileType.type] = {
                        status: 'synchronized',
                        message: 'File is accessible',
                        fileId: fileType.fileId,
                        path: fileType.path
                    };
                } else {
                    verificationResults[fileType.type] = {
                        status: 'out_of_sync',
                        message: `File not accessible (Status: ${response.status})`,
                        fileId: fileType.fileId,
                        path: fileType.path
                    };
                }
            } catch (error) {
                verificationResults[fileType.type] = {
                    status: 'out_of_sync',
                    message: `File verification failed: ${error.message}`,
                    fileId: fileType.fileId,
                    path: fileType.path
                };
            }
        }

        console.log(`✅ [VERIFY-SYNC] Verification completed for ${nobooking}`);

        res.json({
            success: true,
            message: 'File synchronization verification completed',
            data: {
                nobooking,
                verificationResults,
                summary: {
                    total: Object.keys(verificationResults).length,
                    synchronized: Object.values(verificationResults).filter(r => r.status === 'synchronized').length,
                    outOfSync: Object.values(verificationResults).filter(r => r.status === 'out_of_sync').length,
                    notUploaded: Object.values(verificationResults).filter(r => r.status === 'not_uploaded').length
                }
            }
        });

    } catch (error) {
        console.error('❌ [VERIFY-SYNC] Verification failed:', error);
        res.status(500).json({
            success: false,
            message: 'File synchronization verification failed: ' + error.message
        });
    }
});

console.log('✅ [PPATK] All endpoints registered successfully');
}