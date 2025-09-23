// =====================================================
// PPAT ENDPOINT INDEX
// File utama untuk mengelola semua endpoint PPAT
// =====================================================

import express from 'express';
const autoDeleteEndpoints = import('./auto_delete_endpoints');
const scheduledCleanup = import('./scheduled_cleanup');

const router = express.Router();

// =====================================================
// AUTO DELETE ENDPOINTS
// =====================================================

// Mount auto-delete endpoints
router.use('/', autoDeleteEndpoints);

// =====================================================
// ENDPOINT UNTUK STATUS CLEANUP
// =====================================================

/**
 * Endpoint untuk melihat status scheduled cleanup
 * GET /api/admin/cleanup-status
 */
router.get('/admin/cleanup-status', (req, res) => {
    try {
        const status = scheduledCleanup.getStatus();
        res.json({
            success: true,
            status
        });
    } catch (error) {
        console.error('Error getting cleanup status', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil status cleanup'
        });
    }
});

/**
 * Endpoint untuk memulai scheduled cleanup
 * POST /api/admin/start-cleanup
 */
router.post('/admin/start-cleanup', (req, res) => {
    try {
        scheduledCleanup.start();
        res.json({
            success: true,
            message: 'Scheduled cleanup started successfully'
        });
    } catch (error) {
        console.error('Error starting cleanup', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memulai scheduled cleanup'
        });
    }
});

/**
 * Endpoint untuk menghentikan scheduled cleanup
 * POST /api/admin/stop-cleanup
 */
router.post('/admin/stop-cleanup', (req, res) => {
    try {
        scheduledCleanup.stop();
        res.json({
            success: true,
            message: 'Scheduled cleanup stopped successfully'
        });
    } catch (error) {
        console.error('Error stopping cleanup', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghentikan scheduled cleanup'
        });
    }
});

// =====================================================
// EXPORT ROUTER DAN SCHEDULED CLEANUP
// =====================================================

export {
    router,
    scheduledCleanup
};
