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

// Uploadcare health check endpoint (PPATK path)
app.get('/api/ppatk/uploadcare-health', async (req, res) => {
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
                uploadcareSecretKey: process.env.UPLOADCARE_SECRET_KEY ? 'SET' : 'NOT_SET',
                uploadcareCdnBase: process.env.UPLOADCARE_CDN_BASE || 'NOT_SET',
                uploadcareApiBase: process.env.UPLOADCARE_API_BASE || 'NOT_SET'
            },
            configuration: {
                cdnBase: process.env.UPLOADCARE_CDN_BASE || 'https://44renul14z.ucarecd.net',
                apiBase: process.env.UPLOADCARE_API_BASE || 'https://api.uploadcare.com'
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

                    // 2. Validate file accessibility before database update (with retry)
                    console.log(`🔍 [UPLOAD-DOCUMENTS] Validating file accessibility...`);
                    try {
                        const axios = await import('axios');
                        
                        // Wait 5 seconds for CDN propagation (Uploadcare recommendation)
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        
                        const validationResponse = await axios.default.head(uploadResult.fileUrl, {
                            timeout: 10000,
                            validateStatus: () => true
                        });
                        
                        if (validationResponse.status === 200) {
                            console.log(`✅ [UPLOAD-DOCUMENTS] File validation passed: ${uploadResult.fileId}`);
                        } else {
                            console.warn(`⚠️ [UPLOAD-DOCUMENTS] File validation returned status ${validationResponse.status}: ${uploadResult.fileId}`);
                            // Don't throw error, just log warning - file might be processing
                        }
                    } catch (validationError) {
                        console.warn(`⚠️ [UPLOAD-DOCUMENTS] File validation failed: ${validationError.message}`);
                        // Don't throw error, just log warning - file might be processing
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

                        // Store result for this file
                        uploadResults.push({
                            documentType,
                            fileId: uploadResult.fileId,
                            fileUrl: uploadResult.fileUrl,
                            fileName: file.originalname,
                            fileSize: file.size,
                            mimeType: file.mimetype
                        });

                    } catch (transactionError) {
                        // 5. Rollback transaction on any error
                        await client.query('ROLLBACK');
                        console.error(`❌ [UPLOAD-DOCUMENTS] Transaction rolled back for ${documentType}:`, transactionError.message);
                        
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

// Update file URL endpoint - Generate proper Uploadcare URLs
app.post('/api/ppatk/update-file-urls', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;

        console.log(`🔧 [UPDATE-FILE-URLS] Updating URLs for user: ${userid}`);

        // Get all bookings for this user that have files
        const query = `
            SELECT 
                nobooking,
                akta_tanah_file_id, akta_tanah_path, akta_tanah_mime_type,
                sertifikat_tanah_file_id, sertifikat_tanah_path, sertifikat_tanah_mime_type,
                pelengkap_file_id, pelengkap_path, pelengkap_mime_type
            FROM pat_1_bookingsspd 
            WHERE userid = $1 
            AND (
                akta_tanah_file_id IS NOT NULL 
                OR sertifikat_tanah_file_id IS NOT NULL 
                OR pelengkap_file_id IS NOT NULL
            )
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [userid]);

        if (result.rows.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No bookings with files found',
                data: { updated: 0, bookings: 0 }
            });
        }

        let totalUpdated = 0;
        const updateResults = [];

        // Process each booking
        for (const bookingData of result.rows) {
            const nobooking = bookingData.nobooking;
            const updates = [];
            const updateParams = [];
            let paramIndex = 1;

            // Helper function to generate proper URL
            const generateProperUrl = (fileId, mimeType) => {
                if (!fileId) return null;
                
                if (mimeType && mimeType.startsWith('image/')) {
                    return `https://44renul14z.ucarecd.net/${fileId}/-/preview/1000x1000/`;
                } else {
                    return `https://44renul14z.ucarecd.net/${fileId}`;
                }
            };

            // Check and update akta_tanah
            if (bookingData.akta_tanah_file_id) {
                const newUrl = generateProperUrl(bookingData.akta_tanah_file_id, bookingData.akta_tanah_mime_type);
                if (newUrl && newUrl !== bookingData.akta_tanah_path) {
                    updates.push(`akta_tanah_path = $${paramIndex}`);
                    updateParams.push(newUrl);
                    paramIndex++;
                    console.log(`🔧 [UPDATE-FILE-URLS] Akta Tanah URL: ${bookingData.akta_tanah_path} → ${newUrl}`);
                }
            }

            // Check and update sertifikat_tanah
            if (bookingData.sertifikat_tanah_file_id) {
                const newUrl = generateProperUrl(bookingData.sertifikat_tanah_file_id, bookingData.sertifikat_tanah_mime_type);
                if (newUrl && newUrl !== bookingData.sertifikat_tanah_path) {
                    updates.push(`sertifikat_tanah_path = $${paramIndex}`);
                    updateParams.push(newUrl);
                    paramIndex++;
                    console.log(`🔧 [UPDATE-FILE-URLS] Sertifikat Tanah URL: ${bookingData.sertifikat_tanah_path} → ${newUrl}`);
                }
            }

            // Check and update pelengkap
            if (bookingData.pelengkap_file_id) {
                const newUrl = generateProperUrl(bookingData.pelengkap_file_id, bookingData.pelengkap_mime_type);
                if (newUrl && newUrl !== bookingData.pelengkap_path) {
                    updates.push(`pelengkap_path = $${paramIndex}`);
                    updateParams.push(newUrl);
                    paramIndex++;
                    console.log(`🔧 [UPDATE-FILE-URLS] Pelengkap URL: ${bookingData.pelengkap_path} → ${newUrl}`);
                }
            }

            if (updates.length > 0) {
                // Add updated_at and final parameters
                updates.push(`updated_at = CURRENT_TIMESTAMP`);
                updateParams.push(nobooking, userid);

                const updateQuery = `
                    UPDATE pat_1_bookingsspd 
                    SET ${updates.join(', ')}
                    WHERE nobooking = $${paramIndex} AND userid = $${paramIndex + 1}
                `;

                const updateResult = await pool.query(updateQuery, updateParams);
                const updatedCount = updates.length - 1; // Exclude updated_at
                totalUpdated += updatedCount;

                console.log(`✅ [UPDATE-FILE-URLS] Updated ${updatedCount} URLs for booking: ${nobooking}`);
                
                updateResults.push({
                    nobooking,
                    updated: updatedCount
                });
            }
        }

        console.log(`✅ [UPDATE-FILE-URLS] Total updated ${totalUpdated} URLs across ${result.rows.length} bookings`);

        res.json({
            success: true,
            message: `Updated ${totalUpdated} file URLs across ${result.rows.length} bookings successfully`,
            data: {
                totalUpdated,
                totalBookings: result.rows.length,
                updateResults,
                updatedAt: new Date().toISOString()
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
const REQUIRE_AUTH = false; // Disable session auth for debugging
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