// Railway Signature Routes
// /backend/routesxcontroller/5_PPAT_endpoint/RailwaySignatureRoutes.js
import express from 'express';
import multer from 'multer';
import { pool } from '../../../db.js';
import { 
    saveSignatureToRailway, 
    getSignatureInfo, 
    deleteSignature, 
    listSignatures,
    testRailwayStorage 
} from '../../../backend/config/RailwayStorageService.js';

const router = express.Router();

// Configure multer for signature uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`), false);
        }
    }
});

// Test Railway storage
router.get('/test-storage', async (req, res) => {
    try {
        console.log('🧪 [RAILWAY-SIGNATURE-API] Testing Railway storage...');
        
        const result = await testRailwayStorage();
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Railway storage test successful',
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Railway storage test failed',
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-API] Test error:', error);
        res.status(500).json({
            success: false,
            message: 'Storage test failed',
            error: error.message
        });
    }
});

// Upload signature to Railway storage
router.post('/upload-signature', upload.single('signature'), async (req, res) => {
    try {
        console.log('📤 [RAILWAY-SIGNATURE-API] Upload signature request received');
        
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }
        
        const userid = req.session.user.userid;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No signature file uploaded'
            });
        }
        
        console.log('📤 [RAILWAY-SIGNATURE-API] Uploading signature for user:', userid);
        
        // Save to Railway storage
        const uploadResult = await saveSignatureToRailway(file, userid);
        
        if (uploadResult.success) {
            // Update database
            await pool.query(
                `UPDATE a_2_verified_users 
                 SET 
                     tanda_tangan_path = $1,
                     tanda_tangan_mime = $2,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE userid = $3`,
                [
                    uploadResult.fileUrl,
                    uploadResult.mimeType,
                    userid
                ]
            );
            
            console.log('✅ [RAILWAY-SIGNATURE-API] Signature uploaded and database updated');
            
            res.json({
                success: true,
                message: 'Signature uploaded successfully',
                data: {
                    filename: uploadResult.filename,
                    fileUrl: uploadResult.fileUrl,
                    size: uploadResult.size,
                    mimeType: uploadResult.mimeType
                }
            });
            
        } else {
            console.error('❌ [RAILWAY-SIGNATURE-API] Upload failed:', uploadResult.error);
            res.status(500).json({
                success: false,
                message: 'Upload failed',
                error: uploadResult.error
            });
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-API] Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: error.message
        });
    }
});

// Get signature info
router.get('/signature-info/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        console.log('🔍 [RAILWAY-SIGNATURE-API] Getting signature info for:', filename);
        
        const result = await getSignatureInfo(filename);
        
        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Signature not found',
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-API] Get signature info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get signature info',
            error: error.message
        });
    }
});

// List signatures
router.get('/list-signatures', async (req, res) => {
    try {
        console.log('📋 [RAILWAY-SIGNATURE-API] Listing signatures...');
        
        const result = await listSignatures();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.signatures
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to list signatures',
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-API] List signatures error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to list signatures',
            error: error.message
        });
    }
});

// Delete signature
router.delete('/delete-signature/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        
        console.log('🗑️ [RAILWAY-SIGNATURE-API] Deleting signature:', filename);
        
        const result = await deleteSignature(filename);
        
        if (result.success) {
            // Update database - clear signature path
            await pool.query(
                `UPDATE a_2_verified_users 
                 SET 
                     tanda_tangan_path = NULL,
                     tanda_tangan_mime = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE tanda_tangan_path LIKE $1`,
                [`%${filename}%`]
            );
            
            res.json({
                success: true,
                message: 'Signature deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to delete signature',
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-SIGNATURE-API] Delete signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete signature',
            error: error.message
        });
    }
});

// Check user signature status
router.get('/check-signature', async (req, res) => {
    try {
        console.log('🔍 [RAILWAY-SIGNATURE-API] Checking signature status');
        
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
        
        console.log(`✅ [RAILWAY-SIGNATURE-API] Signature status for ${userid}:`, {
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
        console.error('❌ [RAILWAY-SIGNATURE-API] Check signature error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check signature status',
            error: error.message
        });
    }
});

export default router;
