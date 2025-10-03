// Railway Storage Service for Signatures
// /backend/config/RailwayStorageService.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RAILWAY_STORAGE_CONFIG = {
    // Storage paths
    signaturesPath: './storage/signatures',
    publicPath: './public/signatures',
    
    // File configuration
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
        'image/png',
        'image/jpeg',
        'image/jpg'
    ],
    
    // URL configuration
    baseUrl: process.env.RAILWAY_PUBLIC_DOMAIN || 'https://bphtb-bappenda.up.railway.app',
    signaturesUrl: '/signatures'
};

// Ensure storage directories exist
const ensureDirectories = () => {
    try {
        if (!fs.existsSync(RAILWAY_STORAGE_CONFIG.signaturesPath)) {
            fs.mkdirSync(RAILWAY_STORAGE_CONFIG.signaturesPath, { recursive: true });
            console.log('📁 [RAILWAY-STORAGE] Created signatures directory');
        }
        
        if (!fs.existsSync(RAILWAY_STORAGE_CONFIG.publicPath)) {
            fs.mkdirSync(RAILWAY_STORAGE_CONFIG.publicPath, { recursive: true });
            console.log('📁 [RAILWAY-STORAGE] Created public signatures directory');
        }
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] Directory creation failed:', error.message);
    }
};

// Generate filename for signature
const generateSignatureFilename = (userid, originalName) => {
    const timestamp = Date.now();
    const extension = path.extname(originalName || '.png');
    const filename = `ttd-${userid}_${timestamp}${extension}`;
    return filename;
};

// Save signature file to Railway storage
export const saveSignatureToRailway = async (file, userid) => {
    try {
        console.log('💾 [RAILWAY-STORAGE] Saving signature for user:', userid);
        
        // Ensure directories exist
        ensureDirectories();
        
        // Validate file
        if (!file || !file.buffer) {
            throw new Error('Invalid file object');
        }
        
        if (file.size > RAILWAY_STORAGE_CONFIG.maxFileSize) {
            throw new Error(`File too large: ${file.size} bytes (max: ${RAILWAY_STORAGE_CONFIG.maxFileSize} bytes)`);
        }
        
        if (!RAILWAY_STORAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`File type not allowed: ${file.mimetype}`);
        }
        
        // Generate filename
        const filename = generateSignatureFilename(userid, file.originalname);
        const storagePath = path.join(RAILWAY_STORAGE_CONFIG.signaturesPath, filename);
        const publicPath = path.join(RAILWAY_STORAGE_CONFIG.publicPath, filename);
        
        console.log('📤 [RAILWAY-STORAGE] Saving file:', {
            filename,
            userid,
            size: file.size,
            mimeType: file.mimetype,
            storagePath,
            publicPath
        });
        
        // Save to storage directory
        fs.writeFileSync(storagePath, file.buffer);
        
        // Create public symlink/copy for web access
        fs.copyFileSync(storagePath, publicPath);
        
        // Generate URLs
        const fileUrl = `${RAILWAY_STORAGE_CONFIG.baseUrl}${RAILWAY_STORAGE_CONFIG.signaturesUrl}/${filename}`;
        const storageUrl = storagePath;
        
        console.log('✅ [RAILWAY-STORAGE] Signature saved successfully:', {
            filename,
            fileUrl,
            storageUrl
        });
        
        return {
            success: true,
            filename: filename,
            fileUrl: fileUrl,
            storageUrl: storageUrl,
            size: file.size,
            mimeType: file.mimetype,
            uploadDate: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] Save signature failed:', error.message);
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};

// Get signature file info
export const getSignatureInfo = async (filename) => {
    try {
        const storagePath = path.join(RAILWAY_STORAGE_CONFIG.signaturesPath, filename);
        
        if (!fs.existsSync(storagePath)) {
            return {
                success: false,
                error: 'File not found'
            };
        }
        
        const stats = fs.statSync(storagePath);
        const fileUrl = `${RAILWAY_STORAGE_CONFIG.baseUrl}${RAILWAY_STORAGE_CONFIG.signaturesUrl}/${filename}`;
        
        return {
            success: true,
            filename: filename,
            fileUrl: fileUrl,
            storageUrl: storagePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        };
        
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] Get signature info failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete signature file
export const deleteSignature = async (filename) => {
    try {
        const storagePath = path.join(RAILWAY_STORAGE_CONFIG.signaturesPath, filename);
        const publicPath = path.join(RAILWAY_STORAGE_CONFIG.publicPath, filename);
        
        // Delete from storage
        if (fs.existsSync(storagePath)) {
            fs.unlinkSync(storagePath);
        }
        
        // Delete from public
        if (fs.existsSync(publicPath)) {
            fs.unlinkSync(publicPath);
        }
        
        console.log('✅ [RAILWAY-STORAGE] Signature deleted:', filename);
        
        return {
            success: true,
            message: 'Signature deleted successfully'
        };
        
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] Delete signature failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// List signature files
export const listSignatures = async () => {
    try {
        ensureDirectories();
        
        const files = fs.readdirSync(RAILWAY_STORAGE_CONFIG.signaturesPath);
        const signatures = files.map(filename => {
            const storagePath = path.join(RAILWAY_STORAGE_CONFIG.signaturesPath, filename);
            const stats = fs.statSync(storagePath);
            const fileUrl = `${RAILWAY_STORAGE_CONFIG.baseUrl}${RAILWAY_STORAGE_CONFIG.signaturesUrl}/${filename}`;
            
            return {
                filename,
                fileUrl,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
        });
        
        return {
            success: true,
            signatures: signatures
        };
        
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] List signatures failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Test Railway storage
export const testRailwayStorage = async () => {
    try {
        console.log('🧪 [RAILWAY-STORAGE] Testing Railway storage...');
        
        // Test directory creation
        ensureDirectories();
        
        // Test file operations
        const testFile = {
            buffer: Buffer.from('Test signature file'),
            originalname: 'test-signature.png',
            mimetype: 'image/png',
            size: 20
        };
        
        const result = await saveSignatureToRailway(testFile, 'TEST_USER');
        
        if (result.success) {
            console.log('✅ [RAILWAY-STORAGE] Test successful');
            
            // Clean up test file
            await deleteSignature(result.filename);
            
            return {
                success: true,
                message: 'Railway storage test successful'
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
        
    } catch (error) {
        console.error('❌ [RAILWAY-STORAGE] Test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Initialize storage on module load
ensureDirectories();

export default {
    saveSignatureToRailway,
    getSignatureInfo,
    deleteSignature,
    listSignatures,
    testRailwayStorage,
    RAILWAY_STORAGE_CONFIG
};
