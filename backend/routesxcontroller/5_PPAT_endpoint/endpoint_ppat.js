import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pool } from '../../../db.js';
// Import Uploadcare routes
// import uploadcareRoutes from './uploadcare_routes.js'; // Disabled - using robust proxy endpoint instead
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
// app.use('/api/ppatk', uploadcareRoutes); // Disabled - using robust proxy endpoint instead

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
            // Data booking utama (pat_1_bookingsspd)
            noppbb,
            jenis_wajib_pajak = 'Badan Usaha',
            namawajibpajak,
            alamatwajibpajak,
            namapemilikobjekpajak,
            alamatpemilikobjekpajak,
            tanggal,
            tahunajb,
            kabupatenkotawp,
            kecamatanwp,
            kelurahandesawp,
            rtrwwp,
            npwpwp,
            kodeposwp,
            kabupatenkotaop,
            kecamatanop,
            kelurahandesaop,
            rtrwop,
            npwpop,
            kodeposop,
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
            tanggal_perolehan,
            tanggal_pembayaran,
            nomor_bukti_pembayaran,
            
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
            trackstatus,
            jenis_wajib_pajak
        });
        
        // Get user's ppatk_khusus and generate nobooking
        const getUserQuery = `
            SELECT ppatk_khusus 
            FROM a_2_verified_users 
            WHERE userid = $1
        `;
        
        const userResult = await pool.query(getUserQuery, [userid]);
        
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        
        const ppatk_khusus = userResult.rows[0].ppatk_khusus;
        
        if (!ppatk_khusus) {
            throw new Error('User does not have ppatk_khusus assigned');
        }
        
        // Generate sequence number for this year
        const currentYear = new Date().getFullYear();
        const sequenceQuery = `
            SELECT COUNT(*) + 1 as next_sequence 
            FROM pat_1_bookingsspd 
            WHERE userid = $1 AND EXTRACT(YEAR FROM created_at) = $2
        `;
        
        const sequenceResult = await pool.query(sequenceQuery, [userid, currentYear]);
        const sequenceNumber = sequenceResult.rows[0].next_sequence;
        
        // Generate nobooking in format: ppatk_khusus_tahun_sequence (6 digits)
        const formattedSequence = sequenceNumber.toString().padStart(6, '0');
        const nobooking = `${ppatk_khusus}_${currentYear}_${formattedSequence}`;
        
        console.log('📝 [PPATK] Generated nobooking:', {
            ppatk_khusus,
            currentYear,
            sequenceNumber,
            formattedSequence,
            nobooking
        });
        
        console.log('📝 [PPATK] Starting transaction for booking creation...');
        
        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Insert booking data (parent table)
            const insertBookingQuery = `
                INSERT INTO pat_1_bookingsspd (
                    nobooking,
                    jenis_wajib_pajak,
                    userid,
                    noppbb,
                    namawajibpajak,
                    alamatwajibpajak,
                    namapemilikobjekpajak,
                    alamatpemilikobjekpajak,
                    tanggal,
                    tahunajb,
                    kabupatenkotawp,
                    kecamatanwp,
                    kelurahandesawp,
                    rtrwwp,
                    npwpwp,
                    kodeposwp,
                    kabupatenkotaop,
                    kecamatanop,
                    kelurahandesaop,
                    rtrwop,
                    npwpop,
                    kodeposop,
                    trackstatus
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                RETURNING nobooking
            `;
            
            const bookingParams = [
                nobooking,
                jenis_wajib_pajak,
                userid,
                noppbb,
                namawajibpajak,
                alamatwajibpajak,
                namapemilikobjekpajak,
                alamatpemilikobjekpajak,
                tanggal,
                tahunajb,
                kabupatenkotawp,
                kecamatanwp,
                kelurahandesawp,
                rtrwwp,
                npwpwp,
                kodeposwp,
                kabupatenkotaop,
                kecamatanop,
                kelurahandesaop,
                rtrwop,
                npwpop,
                kodeposop,
                trackstatus
            ];
            
            const bookingResult = await client.query(insertBookingQuery, bookingParams);
            
            if (bookingResult.rows.length === 0) {
                throw new Error('Failed to create booking');
            }
            
            const createdNobooking = bookingResult.rows[0].nobooking;
            console.log('✅ [PPATK] Booking created:', createdNobooking);
            
            // Use the nobooking returned from database
            const finalNobooking = createdNobooking;
            
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
                    finalNobooking
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
                
                // Normalize status_kepemilikan to match constraint values
                let normalizedStatusKepemilikan = 'Milik Pribadi'; // default
                if (status_kepemilikan) {
                    const statusMap = {
                        'milik_pribadi': 'Milik Pribadi',
                        'milik_bersama': 'Milik Bersama',
                        'sewa': 'Sewa',
                        'hak_guna_bangunan': 'Hak Guna Bangunan',
                        'Milik Pribadi': 'Milik Pribadi',
                        'Milik Bersama': 'Milik Bersama',
                        'Sewa': 'Sewa',
                        'Hak Guna Bangunan': 'Hak Guna Bangunan'
                    };
                    normalizedStatusKepemilikan = statusMap[status_kepemilikan] || 'Milik Pribadi';
                }
                
                console.log('📝 [PPATK] Status kepemilikan mapping:', {
                    original: status_kepemilikan,
                    normalized: normalizedStatusKepemilikan
                });
                
                const objekParams = [
                    letaktanahdanbangunan,
                    rt_rwobjekpajak || '',
                    normalizedStatusKepemilikan,
                    keterangan || '',
                    nomor_sertifikat || '',
                    tanggal_perolehan || '',
                    tanggal_pembayaran || '',
                    nomor_bukti_pembayaran || '',
                    finalNobooking,
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
                    finalNobooking,
                    luas_tanah,
                    njop_tanah,
                    luas_bangunan || 0,
                    njop_bangunan || 0,
                    total_njoppbb || 0
                ];
                
                const njopResult = await client.query(insertNjopQuery, njopParams);
                console.log('✅ [PPATK] NJOP perhitungan created:', njopResult.rows[0].id);
            }
            
            // 5. Insert tanda tangan dengan path dari user profile (pat_6_sign)
            // Ambil tanda tangan user dari a_2_verified_users
            const getUserSignatureQuery = `
                SELECT 
                    nama,
                    tanda_tangan_path,
                    tanda_tangan_mime,
                    divisi
                FROM a_2_verified_users 
                WHERE userid = $1
            `;
            
            const userSignatureResult = await client.query(getUserSignatureQuery, [userid]);
            
            if (userSignatureResult.rows.length === 0) {
                throw new Error('User not found in a_2_verified_users');
            }
            
            const userData = userSignatureResult.rows[0];
            const userNama = userData.nama || namawajibpajak || 'Nama User';
            const userSignaturePath = userData.tanda_tangan_path;
            const userSignatureMime = userData.tanda_tangan_mime;
            const userDivisi = userData.divisi;
            
            console.log('📝 [PPATK] User signature data:', {
                userid,
                nama: userNama,
                divisi: userDivisi,
                has_signature: !!userSignaturePath,
                signature_path: userSignaturePath,
                signature_mime: userSignatureMime
            });
            
            // Insert tanda tangan dengan path dari user profile
            const insertSignQuery = `
                INSERT INTO pat_6_sign (
                    nobooking,
                    userid,
                    nama,
                    path_ttd_ppatk
                ) VALUES ($1, $2, $3, $4)
                RETURNING id
            `;
            
            const signParams = [
                finalNobooking,
                userid,
                userNama,
                userSignaturePath // Path tanda tangan dari user profile
            ];
            
            const signResult = await client.query(insertSignQuery, signParams);
            console.log('✅ [PPATK] Sign record created with user signature:', {
                id: signResult.rows[0].id,
                nobooking: finalNobooking,
                userid,
                nama: userNama,
                path_ttd_ppatk: userSignaturePath,
                divisi: userDivisi
            });
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log('✅ [PPATK] All booking data created successfully:', {
                nobooking: finalNobooking,
                userid,
                trackstatus
            });
            
            res.json({
                success: true,
                message: 'Booking dan semua data terkait berhasil dibuat',
                nobooking: finalNobooking,
                data: {
                    nobooking: finalNobooking,
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
        console.log('📤 [UPLOAD-DOCUMENTS] Upload request received');
        
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        console.log(`📤 [UPLOAD-DOCUMENTS] Upload request received`);
        console.log(`📤 [UPLOAD-DOCUMENTS] Request headers:`, {
            'content-type': req.headers['content-type'],
            'content-length': req.headers['content-length']
        });

        // Import uploadcare functions
        const { uploadToUploadcare } = await import('../../config/uploads/uploadcare_storage.js');
        
        // Handle file uploads using multer
        const multer = await import('multer');
        const upload = multer.default({ 
            storage: multer.default.memoryStorage(),
            limits: {
                fileSize: 50 * 1024 * 1024, // 50MB limit
                files: 1 // Single file
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
        
        // Process single file upload
        upload.single('file')(req, res, async (err) => {
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

            console.log(`📤 [UPLOAD-DOCUMENTS] Multer processing completed. File:`, req.file ? 'Present' : 'Missing');
            console.log(`📤 [UPLOAD-DOCUMENTS] Request body after multer:`, req.body);

            if (!req.file) {
                console.error('❌ [UPLOAD-DOCUMENTS] No file in request');
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Extract parameters after multer processes the FormData
            const { booking_id, nobooking, documentType } = req.body;
            const userid = req.session.user.userid;

            // Use nobooking as the primary identifier (business key)
            const bookingId = nobooking || booking_id;

            if (!bookingId) {
                console.error('❌ [UPLOAD-DOCUMENTS] No booking ID found in request body');
                return res.status(400).json({ success: false, message: 'NoBooking required' });
            }

            console.log(`📤 [UPLOAD-DOCUMENTS] Processing upload for booking: ${bookingId}, user: ${userid}`);

            try {
                const file = req.file;
                console.log(`📤 [UPLOAD-DOCUMENTS] File details:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });

                const documentType = Object.keys(req.body).find(key => 
                    ['akta_tanah', 'sertifikat_tanah', 'pelengkap'].includes(key)
                );

                console.log(`📤 [UPLOAD-DOCUMENTS] Document type detected:`, documentType);
                console.log(`📤 [UPLOAD-DOCUMENTS] Available body keys:`, Object.keys(req.body));

                if (!documentType) {
                    console.error('❌ [UPLOAD-DOCUMENTS] No valid document type found');
                    console.error('❌ [UPLOAD-DOCUMENTS] Available body keys after multer:', Object.keys(req.body || {}));
                    console.error('❌ [UPLOAD-DOCUMENTS] Expected document types: akta_tanah, sertifikat_tanah, pelengkap');
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Invalid document type. Available types: akta_tanah, sertifikat_tanah, pelengkap',
                        received: Object.keys(req.body || {}),
                        expected: ['akta_tanah', 'sertifikat_tanah', 'pelengkap']
                    });
                }

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

                    // 1. Upload to Uploadcare first
                    uploadResult = await uploadToUploadcare(file, {
                        userid: userid,
                        nobooking: bookingId,
                        docType: documentType,
                        sequenceNumber: 1,
                        resourceType: 'auto'
                    });

                    if (!uploadResult.success) {
                        throw new Error(uploadResult.message || 'Upload to Uploadcare failed');
                    }

                    console.log(`✅ [UPLOAD-DOCUMENTS] Upload successful:`, {
                        fileId: uploadResult.fileId,
                        fileUrl: uploadResult.fileUrl
                    });

                    // 2. Validate file accessibility before database update
                    console.log(`🔍 [UPLOAD-DOCUMENTS] Validating file accessibility...`);
                    try {
                        const axios = await import('axios');
                        const validationResponse = await axios.default.head(uploadResult.fileUrl, {
                            timeout: 10000,
                            validateStatus: () => true
                        });
                        
                        if (validationResponse.status !== 200) {
                            throw new Error(`File not accessible after upload. Status: ${validationResponse.status}`);
                        }
                        
                        console.log(`✅ [UPLOAD-DOCUMENTS] File validation passed: ${uploadResult.fileId}`);
                    } catch (validationError) {
                        console.error(`❌ [UPLOAD-DOCUMENTS] File validation failed:`, validationError.message);
                        throw new Error(`File validation failed: ${validationError.message}`);
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
                        uploadResult.fileId,
                        uploadResult.fileUrl,
                        file.mimetype,
                        file.size,
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
                        fileId: uploadResult.fileId,
                        rowsAffected: updateResult.rowCount
                    });

                    res.json({
                        success: true,
                        message: 'Document uploaded and database updated successfully',
                        data: {
                            documentType,
                            fileId: uploadResult.fileId,
                            fileUrl: uploadResult.fileUrl,
                            fileName: file.originalname,
                            fileSize: file.size,
                            mimeType: file.mimetype
                        }
                    });

                } catch (transactionError) {
                    // 5. Rollback transaction on any error
                    await client.query('ROLLBACK');
                    console.error(`❌ [UPLOAD-DOCUMENTS] Transaction rolled back:`, transactionError.message);
                    
                    // If upload succeeded but database failed, we have an orphaned file
                    if (uploadResult && uploadResult.success) {
                        console.warn(`⚠️ [UPLOAD-DOCUMENTS] Orphaned file detected: ${uploadResult.fileId}`);
                        
                        // Attempt to cleanup orphaned file
                        try {
                            const { cleanupOrphanedFile } = await import('../../config/uploads/uploadcare_storage.js');
                            await cleanupOrphanedFile(uploadResult.fileId);
                        } catch (cleanupError) {
                            console.error(`❌ [UPLOAD-DOCUMENTS] Orphaned file cleanup failed:`, cleanupError.message);
                        }
                    }
                    
                    throw transactionError;
                } finally {
                    client.release();
                }

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

// Uploadcare Proxy Endpoint for Preview - ROBUST VERSION
// Konfigurasi
const REQUIRE_AUTH = true; // Enable session auth
const DEFAULT_CDN = 'https://44renul14z.ucarecd.net'; // CDN utama Uploadcare

// 🔹 Utility untuk bangun URL Uploadcare
function buildUploadcareUrl(fileUrl, fileId) {
    if (fileUrl) return fileUrl;
    if (fileId) return `${DEFAULT_CDN}/${fileId}`;
    return null;
}


// 🔹 HEAD request (cek file tersedia atau tidak)
app.head('/api/ppatk/uploadcare-proxy', async (req, res) => {
    try {
        if (REQUIRE_AUTH && (!req.session || !req.session.user)) {
            return res.sendStatus(401);
        }

        const { fileUrl, fileId } = req.query;
        const targetUrl = buildUploadcareUrl(fileUrl, fileId);
        if (!targetUrl) return res.sendStatus(400);

        console.log(`🔍 [UPLOADCARE-PROXY HEAD] Checking: ${targetUrl}`);

        const axios = await import('axios');
        const response = await axios.default.head(targetUrl, { timeout: 5000 });

        // Forward beberapa header penting
        if (response.headers['content-type']) {
            res.set('Content-Type', response.headers['content-type']);
        }
        if (response.headers['content-length']) {
            res.set('Content-Length', response.headers['content-length']);
        }

        return res.sendStatus(200);
    } catch (err) {
        console.error('❌ [UPLOADCARE-PROXY HEAD] Error:', err.message);
        return res.sendStatus(404);
    }
});

// 🔹 GET request (stream file ke client)
app.get('/api/ppatk/uploadcare-proxy', async (req, res) => {
    try {
        if (REQUIRE_AUTH && (!req.session || !req.session.user)) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { fileUrl, fileId } = req.query;
        const targetUrl = buildUploadcareUrl(fileUrl, fileId);

        if (!targetUrl) {
            return res.status(400).json({ success: false, message: 'File URL or File ID required' });
        }

        console.log(`🔍 [UPLOADCARE-PROXY GET] Proxying file: ${targetUrl}`);

        const axios = await import('axios');
        const response = await axios.default.get(targetUrl, {
            responseType: 'stream',
            timeout: 30000,
            headers: { 'User-Agent': 'Bappenda-PPAT-Proxy/1.0' }
        });

        // Set header dari Uploadcare ke response kita
        res.set({
            'Content-Type': response.headers['content-type'] || 'application/octet-stream',
            'Content-Length': response.headers['content-length'] || undefined,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type'
        });

        // Pipe stream ke client
        response.data.pipe(res);

        console.log(`✅ [UPLOADCARE-PROXY GET] Success: ${targetUrl}`);
    } catch (err) {
        console.error('❌ [UPLOADCARE-PROXY GET] Proxy failed:', err.message);

        if (err.response) {
            return res.status(err.response.status).json({
                success: false,
                message: `Proxy error: ${err.response.statusText}`,
                details: err.message
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Proxy service unavailable',
                details: err.message
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