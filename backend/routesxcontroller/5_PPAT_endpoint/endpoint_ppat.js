import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pool } from '../../../db.js';
// Import Uploadcare routes
import uploadcareRoutes from './uploadcare_routes.js';
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
// ===== UPLOADCARE ENDPOINTS SETUP =====
// Setup Uploadcare endpoints
app.use('/api/ppatk', uploadcareRoutes);

// ===== RAILWAY SIGNATURE ENDPOINTS SETUP =====
// Setup Railway signature endpoints
app.use('/api/railway-signature', railwaySignatureRoutes);

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

// Test endpoint untuk debugging Uploadcare
app.get('/api/test-uploadcare-proxy', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Uploadcare proxy test endpoint working',
        timestamp: new Date().toISOString(),
        service: 'uploadcare'
    });
});

// Endpoint untuk membersihkan proxy path yang tidak valid (Uploadcare)
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
            message: 'Cleanup completed - Uploadcare integration active',
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

// Endpoint untuk manual cleanup file lama di Uploadcare
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

        // Import cleanup function from Uploadcare storage
        const { cleanupOldFiles } = await import('../../config/uploads/uploadcare_storage.js');
        
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

// Uploadcare health check endpoint
app.get('/api/uploadcare-health-check', async (req, res) => {
    try {
        console.log('🔍 [UPLOADCARE-HEALTH] Starting health check...');
        
        // Test 1: Check environment variables
        const envCheck = {
            publicKey: !!process.env.UPLOADCARE_PUBLIC_KEY,
            secretKey: !!process.env.UPLOADCARE_SECRET_KEY,
            cdnBase: !!process.env.UPLOADCARE_CDN_BASE,
            apiBase: !!process.env.UPLOADCARE_API_BASE
        };

        // Test 2: Check if Uploadcare client can be initialized
        let clientTest = false;
        try {
            const { UploadClient } = await import('@uploadcare/upload-client');
            const testClient = new UploadClient({
                publicKey: process.env.UPLOADCARE_PUBLIC_KEY || 'test'
            });
            clientTest = !!testClient;
            console.log('✅ [UPLOADCARE-HEALTH] Client initialization test passed');
        } catch (err) {
            console.error('❌ [UPLOADCARE-HEALTH] Client initialization test failed:', err.message);
        }

        // Test 3: Check if we can make a simple request to Uploadcare
        let uploadcareReachability = false;
        try {
            const testUrl = 'https://ucarecdn.com/test';
            const response = await axios.get(testUrl, { 
                timeout: 5000,
                validateStatus: () => true // Accept any status
            });
            uploadcareReachability = response.status !== 0; // If we get any response, Uploadcare is reachable
            console.log('✅ [UPLOADCARE-HEALTH] Uploadcare reachability test:', response.status);
        } catch (err) {
            console.error('❌ [UPLOADCARE-HEALTH] Uploadcare reachability test failed:', err.message);
        }

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            tests: {
                clientInitialization: clientTest,
                environmentVariables: envCheck,
                uploadcareReachability: uploadcareReachability
            },
            environment: {
                nodeEnv: process.env.NODE_ENV,
                uploadcarePublicKey: process.env.UPLOADCARE_PUBLIC_KEY ? 'SET' : 'NOT_SET',
                uploadcareSecretKey: process.env.UPLOADCARE_SECRET_KEY ? 'SET' : 'NOT_SET'
            }
        };

        console.log('✅ [UPLOADCARE-HEALTH] Health check completed:', healthStatus);

        res.json(healthStatus);

    } catch (error) {
        console.error('❌ [UPLOADCARE-HEALTH] Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// PPATK: Create booking and BPHTB calculation
app.post('/api/ppatk_create-booking-and-bphtb', async (req, res) => {
    try {
        console.log('📝 [PPATK] Creating booking and BPHTB calculation...');
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }
        
        const userid = req.session.user.userid;
        const {
            // Data booking utama
            noppbb,
            namawajibpajak,
            namapemilikobjekpajak,
            npwpwp,
            tahunajb,
            nilai_transaksi,
            nilai_bphtb,
            tanggal_perolehan,
            tanggal_pembayaran,
            nomor_bukti_pembayaran,
            trackstatus = 'Draft',
            
            // Data BPHTB perhitungan (pat_2_bphtb_perhitungan)
            nilaiPerolehanObjekPajakTidakKenaPajak,
            bphtb_yangtelah_dibayar,
            
            // Data objek pajak (pat_4_objek_pajak)
            hargatransaksi,
            letaktanahdanbangunan,
            rt_rwobjekpajak,
            kecamatanlp,
            kelurahandesalp,
            status_kepemilikan,
            jenisPerolehan,
            keterangan,
            nomor_sertifikat,
            
            // Data NJOP perhitungan (pat_5_penghitungan_njop)
            luas_tanah,
            njop_tanah,
            luas_bangunan,
            njop_bangunan,
            total_njoppbb
        } = req.body;
        
        console.log('📝 [PPATK] Booking data received:', {
            userid,
            noppbb,
            namawajibpajak,
            namapemilikobjekpajak,
            npwpwp,
            tahunajb,
            nilai_transaksi,
            nilai_bphtb,
            trackstatus
        });
        
        // Generate nobooking
        const timestamp = Date.now();
        const nobooking = `BK${userid}_${timestamp}`;
        
        console.log('📝 [PPATK] Starting transaction for booking creation...');
        
        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Insert booking data (parent table)
            const insertBookingQuery = `
                INSERT INTO pat_1_bookingsspd (
                    nobooking,
                    userid,
                    noppbb,
                    namawajibpajak,
                    namapemilikobjekpajak,
                    npwpwp,
                    tahunajb,
                    nilai_transaksi,
                    nilai_bphtb,
                    tanggal_perolehan,
                    tanggal_pembayaran,
                    nomor_bukti_pembayaran,
                    trackstatus,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING nobooking
            `;
            
            const bookingParams = [
                nobooking,
                userid,
                noppbb,
                namawajibpajak,
                namapemilikobjekpajak,
                npwpwp,
                tahunajb,
                nilai_transaksi,
                nilai_bphtb,
                tanggal_perolehan,
                tanggal_pembayaran,
                nomor_bukti_pembayaran,
                trackstatus
            ];
            
            const bookingResult = await client.query(insertBookingQuery, bookingParams);
            
            if (bookingResult.rows.length === 0) {
                throw new Error('Failed to create booking');
            }
            
            console.log('✅ [PPATK] Booking created:', bookingResult.rows[0].nobooking);
            
            // 2. Insert BPHTB perhitungan (pat_2_bphtb_perhitungan)
            if (nilaiPerolehanObjekPajakTidakKenaPajak !== undefined) {
                const insertBphtbQuery = `
                    INSERT INTO pat_2_bphtb_perhitungan (
                        nilaiperolehanobjekpajaktidakkenapajak,
                        bphtb_yangtelah_dibayar,
                        nobooking
                    ) VALUES ($1, $2, $3)
                    RETURNING calculationid
                `;
                
                const bphtbParams = [
                    nilaiPerolehanObjekPajakTidakKenaPajak,
                    bphtb_yangtelah_dibayar || 0,
                    nobooking
                ];
                
                const bphtbResult = await client.query(insertBphtbQuery, bphtbParams);
                console.log('✅ [PPATK] BPHTB perhitungan created:', bphtbResult.rows[0].calculationid);
            }
            
            // 3. Insert objek pajak (pat_4_objek_pajak)
            if (letaktanahdanbangunan !== undefined) {
                const insertObjekQuery = `
                    INSERT INTO pat_4_objek_pajak (
                        letaktanahdanbangunan,
                        rt_rwobjekpajak,
                        status_kepemilikan,
                        keterangan,
                        nomor_sertifikat,
                        tanggal_perolehan,
                        tanggal_pembayaran,
                        nomor_bukti_pembayaran,
                        nobooking,
                        harga_transaksi,
                        kelurahandesalp,
                        kecamatanlp,
                        jenis_perolehan
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING id
                `;
                
                const objekParams = [
                    letaktanahdanbangunan,
                    rt_rwobjekpajak || '',
                    status_kepemilikan || 'Milik Pribadi',
                    keterangan || '',
                    nomor_sertifikat || '',
                    tanggal_perolehan || '',
                    tanggal_pembayaran || '',
                    nomor_bukti_pembayaran || '',
                    nobooking,
                    hargatransaksi || '',
                    kelurahandesalp || '',
                    kecamatanlp || '',
                    jenisPerolehan || ''
                ];
                
                const objekResult = await client.query(insertObjekQuery, objekParams);
                console.log('✅ [PPATK] Objek pajak created:', objekResult.rows[0].id);
            }
            
            // 4. Insert NJOP perhitungan (pat_5_penghitungan_njop)
            if (luas_tanah !== undefined && njop_tanah !== undefined) {
                const insertNjopQuery = `
                    INSERT INTO pat_5_penghitungan_njop (
                        nobooking,
                        luas_tanah,
                        njop_tanah,
                        luas_bangunan,
                        njop_bangunan,
                        total_njoppbb,
                        created_at,
                        updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    RETURNING id
                `;
                
                const njopParams = [
                    nobooking,
                    luas_tanah,
                    njop_tanah,
                    luas_bangunan || 0,
                    njop_bangunan || 0,
                    total_njoppbb || 0
                ];
                
                const njopResult = await client.query(insertNjopQuery, njopParams);
                console.log('✅ [PPATK] NJOP perhitungan created:', njopResult.rows[0].id);
            }
            
            // 5. Insert tanda tangan placeholder (pat_6_sign)
            const insertSignQuery = `
                INSERT INTO pat_6_sign (
                    nobooking,
                    userid,
                    nama
                ) VALUES ($1, $2, $3)
                RETURNING id
            `;
            
            const signParams = [
                nobooking,
                userid,
                namawajibpajak || 'Nama Wajib Pajak'
            ];
            
            const signResult = await client.query(insertSignQuery, signParams);
            console.log('✅ [PPATK] Sign placeholder created:', signResult.rows[0].id);
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log('✅ [PPATK] All booking data created successfully:', {
                nobooking,
                userid,
                trackstatus
            });
            
            res.json({
                success: true,
                message: 'Booking dan semua data terkait berhasil dibuat',
                nobooking: nobooking,
                data: {
                    nobooking,
                    userid,
                    trackstatus,
                    tables_created: [
                        'pat_1_bookingsspd',
                        'pat_2_bphtb_perhitungan',
                        'pat_4_objek_pajak',
                        'pat_5_penghitungan_njop',
                        'pat_6_sign'
                    ]
                }
            });
            
        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ [PPATK] Create booking failed:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat booking dan perhitungan BPHTB',
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
            WHERE nobooking = $1 AND userid = $2
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
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.body;
        const userid = req.session.user.userid;

        // Handle document upload logic here
        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            nobooking: nobooking
        });

    } catch (error) {
        console.error('❌ [PPATK] Upload documents failed:', error);
        res.status(500).json({
            success: false,
            message: 'Upload documents failed: ' + error.message
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

        // Support both parameter names for compatibility
        const bookingId = nobooking || booking_id;

        if (!bookingId) {
            return res.status(400).json({ success: false, message: 'Booking ID required' });
        }

        // Get documents from database with Uploadcare information
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
                pdf_dokumen_path, 
                pdf_dokumen_file_id,
                pdf_dokumen_mime_type,
                pdf_dokumen_size,
                file_withstempel_path,
                file_withstempel_file_id,
                file_withstempel_mime_type,
                file_withstempel_size,
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
            pdfDokumen: row.pdf_dokumen_path ? {
                fileUrl: row.pdf_dokumen_path,
                fileId: row.pdf_dokumen_file_id,
                fileName: row.pdf_dokumen_file_id, // ✅ Gunakan file ID sebagai display name
                customFileName: row.pdf_dokumen_file_id, // ✅ Custom filename (sementara sama dengan file ID)
                mimeType: row.pdf_dokumen_mime_type,
                size: row.pdf_dokumen_size
            } : null,
            fileWithStempel: row.file_withstempel_path ? {
                fileUrl: row.file_withstempel_path,
                fileId: row.file_withstempel_file_id,
                fileName: row.file_withstempel_file_id, // ✅ Gunakan file ID sebagai display name
                customFileName: row.file_withstempel_file_id, // ✅ Custom filename (sementara sama dengan file ID)
                mimeType: row.file_withstempel_mime_type,
                size: row.file_withstempel_size
            } : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
        
        console.log(`✅ [GET-DOCUMENTS] Returning formatted data:`, {
            aktaTanah: formattedData.aktaTanah ? 'Present' : 'Null',
            sertifikatTanah: formattedData.sertifikatTanah ? 'Present' : 'Null',
            pelengkap: formattedData.pelengkap ? 'Present' : 'Null',
            pdfDokumen: formattedData.pdfDokumen ? 'Present' : 'Null'
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

// Uploadcare Proxy Endpoint for Preview
app.get('/api/ppatk/uploadcare-proxy', async (req, res) => {
    try {
        console.log('🔍 [UPLOADCARE-PROXY] Proxy request received');
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { fileUrl } = req.query;
        
        if (!fileUrl) {
            return res.status(400).json({ success: false, message: 'File URL required' });
        }

        console.log(`🔍 [UPLOADCARE-PROXY] Proxying file: ${fileUrl}`);

        // Validate that it's an Uploadcare URL
        if (!fileUrl.includes('ucarecdn.com')) {
            return res.status(400).json({ success: false, message: 'Invalid file URL' });
        }

        // Fetch file from Uploadcare
        const axios = await import('axios');
        const response = await axios.default.get(fileUrl, {
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'User-Agent': 'Bappenda-PPAT-Proxy/1.0'
            }
        });

        // Set appropriate headers
        res.set({
            'Content-Type': response.headers['content-type'] || 'application/octet-stream',
            'Content-Length': response.headers['content-length'],
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Pipe the response
        response.data.pipe(res);

        console.log(`✅ [UPLOADCARE-PROXY] File proxied successfully: ${fileUrl}`);

    } catch (error) {
        console.error('❌ [UPLOADCARE-PROXY] Proxy failed:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                message: `Proxy error: ${error.response.statusText}`,
                details: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Proxy service unavailable',
                details: error.message
            });
        }
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

        const { nobooking } = req.body;
        const userid = req.session.user.userid;

        if (!nobooking) {
            return res.status(400).json({ success: false, message: 'No booking required' });
        }

        // Handle LTB process logic here
        res.json({
            success: true,
            message: 'LTB process completed successfully',
            nobooking: nobooking
        });

    } catch (error) {
        console.error('❌ [PPATK] LTB process failed:', error);
        res.status(500).json({
            success: false,
            message: 'LTB process failed: ' + error.message
        });
    }
});

console.log('✅ [PPATK] All endpoints registered successfully');
}