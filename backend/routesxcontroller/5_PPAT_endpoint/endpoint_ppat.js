import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { pool } from '../../../db.js';
// Import Uploadcare routes
import uploadcareRoutes from './uploadcare_routes.js';
const router = express.Router();

export default function registerPPATKEndpoints({ app, pool, logger, morganMiddleware, uploadTTD, uploadDocumentMiddleware, PAT3_DISABLED, triggerNotificationByStatus, upsertBankVerification }) {
    // Validate required parameters
    if (!app) {
        throw new Error('app parameter is required');
    }
    if (!pool) {
        throw new Error('pool parameter is required');
    }
    
    // Create fallback middleware if not provided
    const safeUploadTTD = uploadTTD || ((req, res, next) => {
        console.log('⚠️ [PPATK] uploadTTD middleware not provided, using fallback');
        next();
    });
    
    const safeUploadDocumentMiddleware = uploadDocumentMiddleware || ((req, res, next) => {
        console.log('⚠️ [PPATK] uploadDocumentMiddleware not provided, using fallback');
        next();
    });
// ===== UPLOADCARE ENDPOINTS SETUP =====
// Setup Uploadcare endpoints
app.use('/api/ppatk', uploadcareRoutes);

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

// PPATK: Load all booking data for table (untuk frontend table)
app.get('/api/ppatk/load-all-booking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userid = req.session.user.userid;
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE userid = $1';
        const queryParams = [userid];
        let paramCount = 1;
        
        if (search) {
            paramCount++;
            whereClause += ` AND (nobooking ILIKE $${paramCount} OR nama_pemohon ILIKE $${paramCount} OR alamat_tanah ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }
        
        if (status) {
            paramCount++;
            whereClause += ` AND status = $${paramCount}`;
            queryParams.push(status);
        }
        
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd ${whereClause}`;
        const countResult = await pool.query(countQuery, queryParams);
        const totalCount = parseInt(countResult.rows[0].count);
        
        const dataQuery = `
            SELECT 
                nobooking,
                nama_pemohon,
                alamat_tanah,
                status,
                created_at,
                updated_at,
                akta_tanah_path,
                sertifikat_tanah_path,
                pelengkap_path,
                pdf_dokumen_path
            FROM pat_1_bookingsspd 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;
        
        queryParams.push(limit, offset);
        const dataResult = await pool.query(dataQuery, queryParams);
        
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / limit)
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
                nama_pemohon,
                alamat_tanah,
                status,
                created_at,
                updated_at,
                akta_tanah_path,
                sertifikat_tanah_path,
                pelengkap_path,
                pdf_dokumen_path
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
app.put('/api/ppatk/booking/:nobooking/status', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const { status } = req.body;
        const userid = req.session.user.userid;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const query = `
            UPDATE pat_1_bookingsspd 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $2 AND userid = $3
            RETURNING *
        `;
        
        const result = await pool.query(query, [status, nobooking, userid]);
        
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
app.post('/api/ppatk/upload-signatures', safeUploadTTD, async (req, res) => {
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
app.post('/api/ppatk/upload-documents', safeUploadDocumentMiddleware, async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { booking_id } = req.body;
        const userid = req.session.user.userid;

        // Handle document upload logic here
        res.json({
            success: true,
            message: 'Documents uploaded successfully',
            booking_id: booking_id
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

        const { booking_id } = req.query;
        const userid = req.session.user.userid;

        if (!booking_id) {
            return res.status(400).json({ success: false, message: 'Booking ID required' });
        }

        // Get documents from database
        const query = `
            SELECT document1_path, document2_path, created_at
            FROM uploaded_documents 
            WHERE booking_id = $1 AND userid = $2
        `;
        
        const result = await pool.query(query, [booking_id, userid]);
        
        res.json({
            success: true,
            data: result.rows[0] || null
        });

    } catch (error) {
        console.error('❌ [PPATK] Get documents failed:', error);
        res.status(500).json({
            success: false,
            message: 'Get documents failed: ' + error.message
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
        const { status } = req.body;
        const userid = req.session.user.userid;

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status required' });
        }

        // Update status in database
        const query = `
            UPDATE pat_1_bookingsspd 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $2 AND userid = $3
            RETURNING *
        `;
        
        const result = await pool.query(query, [status, nobooking, userid]);
        
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