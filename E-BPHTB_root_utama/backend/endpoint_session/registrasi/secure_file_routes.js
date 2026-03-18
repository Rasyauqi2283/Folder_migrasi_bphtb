import express from 'express';
import { getSecureKTP } from '../../config/uploads/secure_upload_ktp.js';
import { logFileAccess } from '../../config/secure_storage.js';

const router = express.Router();

// Middleware untuk validasi role admin
const requireAdmin = (req, res, next) => {
    const userRole = req.session?.user?.role;
    const userStatus = req.session?.user?.statuspengguna;
    
    // Cek apakah user adalah admin atau super admin
    if (userRole === 'admin' || userRole === 'super_admin' || userStatus === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Hanya admin yang dapat mengakses file KTP'
        });
    }
};

// Endpoint untuk mendapatkan file KTP (hanya admin)
router.get('/ktp/:fileId', requireAdmin, getSecureKTP);

// Endpoint untuk mendapatkan daftar file KTP user (hanya admin)
router.get('/ktp-list/:userId', requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Import fungsi secara dinamis
        const { SECURE_STORAGE_PATH } = await import('../../config/secure_storage.js');
        const path = (await import('path')).default;
        const fs = (await import('fs')).default;
        
        const userDir = path.join(SECURE_STORAGE_PATH, 'ktp', userId);
        
        if (!fs.existsSync(userDir)) {
            return res.json({
                success: true,
                files: []
            });
        }
        
        // Baca semua metadata file
        const files = fs.readdirSync(userDir)
            .filter(file => file.endsWith('_metadata.json'))
            .map(file => {
                const metadataPath = path.join(userDir, file);
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                
                // Hapus informasi sensitif dari response
                return {
                    fileId: metadata.fileId,
                    originalName: metadata.originalName,
                    mimeType: metadata.mimeType,
                    size: metadata.size,
                    timestamp: metadata.timestamp
                };
            });
        
        // Log akses
        await logFileAccess('LIST_FILES', userId, req.session?.user?.role || 'admin', 'LIST');
        
        res.json({
            success: true,
            files
        });
        
    } catch (error) {
        console.error('🔒 [SECURE] Error getting KTP list:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil daftar file'
        });
    }
});

// Endpoint untuk audit log akses file (hanya super admin)
router.get('/audit-logs', async (req, res) => {
    try {
        const userRole = req.session?.user?.role;
        const userStatus = req.session?.user?.statuspengguna;
        
        // Hanya super admin yang bisa akses audit log
        if (userRole !== 'super_admin' && userStatus !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Hanya super admin yang dapat mengakses audit log'
            });
        }
        
        // Import fungsi secara dinamis
        const { SECURE_STORAGE_PATH } = await import('../../config/secure_storage.js');
        const path = (await import('path')).default;
        const fs = (await import('fs')).default;
        
        const logDir = path.join(SECURE_STORAGE_PATH, 'logs');
        
        if (!fs.existsSync(logDir)) {
            return res.json({
                success: true,
                logs: []
            });
        }
        
        // Baca semua log files
        const logFiles = fs.readdirSync(logDir)
            .filter(file => file.startsWith('file_access_') && file.endsWith('.log'))
            .sort()
            .reverse(); // Terbaru dulu
        
        let allLogs = [];
        
        // Baca log dari 7 hari terakhir
        for (let i = 0; i < Math.min(logFiles.length, 7); i++) {
            const logFile = path.join(logDir, logFiles[i]);
            const content = fs.readFileSync(logFile, 'utf8');
            
            const logs = content.trim().split('\n')
                .filter(line => line.trim())
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch (e) {
                        return null;
                    }
                })
                .filter(log => log !== null);
            
            allLogs = allLogs.concat(logs);
        }
        
        // Sort by timestamp (terbaru dulu)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limit to 1000 entries
        allLogs = allLogs.slice(0, 1000);
        
        res.json({
            success: true,
            logs: allLogs,
            total: allLogs.length
        });
        
    } catch (error) {
        console.error('🔒 [SECURE] Error getting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil audit log'
        });
    }
});

export default router;
