// =====================================================
// AUTO DELETE ENDPOINTS
// Endpoint API untuk mengelola auto-delete system
// =====================================================

import express from 'express';
const AutoDeleteService = import('./auto_delete_service');
const { pool } = import('../../../db.js');

const router = express.Router();

// =====================================================
// ENDPOINT UNTUK LTB REJECTION
// =====================================================

/**
 * Endpoint untuk menolak data dari LTB
 * POST /api/ltb/reject-with-auto-delete
 */
router.post('/ltb/reject-with-auto-delete', async (req, res) => {
    try {
        const { nobooking, rejectionReason, userid } = req.body;
        
        // Validasi input
        if (!nobooking || !rejectionReason || !userid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: nobooking, rejectionReason, userid'
            });
        }
        
        // Cek apakah nobooking sudah pernah digunakan
        const isUsed = await AutoDeleteService.isNobookingUsed(nobooking);
        if (isUsed) {
            return res.status(400).json({
                success: false,
                message: 'Nomor booking sudah pernah digunakan dan tidak dapat digunakan kembali'
            });
        }
        
        // Tambahkan ke tracker untuk auto-delete
        const addedToTracker = await AutoDeleteService.addRejectedBooking(
            nobooking,
            'LTB',
            rejectionReason,
            userid
        );
        
        if (!addedToTracker) {
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan data ke sistem auto-delete'
            });
        }
        
        // Update status di database utama (sesuai dengan kode yang ada)
        await pool.query(
            'UPDATE ltb_1_terima_berkas_sspd SET trackstatus = $1 WHERE nobooking = $2',
            ['Ditolak', nobooking]
        );
        
        console.log('LTB data rejected and added to auto-delete tracker', {
            nobooking,
            rejectionReason,
            userid
        });
        
        res.json({
            success: true,
            message: 'Data berhasil ditolak dan akan otomatis dihapus setelah 10 hari',
            nobooking,
            scheduledDeleteAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        });
        
    } catch (error) {
        console.error('Error in LTB rejection endpoint', {
            error: error.message,
            body: req.body
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

// =====================================================
// ENDPOINT UNTUK PENELITI VALIDASI REJECTION
// =====================================================

/**
 * Endpoint untuk menolak data dari Peneliti Validasi
 * POST /api/pv/reject-with-auto-delete
 */
router.post('/pv/reject-with-auto-delete', async (req, res) => {
    try {
        const { nobooking, rejectionReason, userid } = req.body;
        
        // Validasi input
        if (!nobooking || !rejectionReason || !userid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: nobooking, rejectionReason, userid'
            });
        }
        
        // Cek apakah nobooking sudah pernah digunakan
        const isUsed = await AutoDeleteService.isNobookingUsed(nobooking);
        if (isUsed) {
            return res.status(400).json({
                success: false,
                message: 'Nomor booking sudah pernah digunakan dan tidak dapat digunakan kembali'
            });
        }
        
        // Tambahkan ke tracker untuk auto-delete
        const addedToTracker = await AutoDeleteService.addRejectedBooking(
            nobooking,
            'PV',
            rejectionReason,
            userid
        );
        
        if (!addedToTracker) {
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan data ke sistem auto-delete'
            });
        }
        
        // Update status di database utama (sesuai dengan kode yang ada)
        await pool.query(
            'UPDATE p_1_verifikasi SET trackstatus = $1 WHERE nobooking = $2',
            ['Ditolak', nobooking]
        );
        
        console.log('PV data rejected and added to auto-delete tracker', {
            nobooking,
            rejectionReason,
            userid
        });
        
        res.json({
            success: true,
            message: 'Data berhasil ditolak dan akan otomatis dihapus setelah 10 hari',
            nobooking,
            scheduledDeleteAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
        });
        
    } catch (error) {
        console.error('Error in PV rejection endpoint', {
            error: error.message,
            body: req.body
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
});

// =====================================================
// ENDPOINT UNTUK ADMIN/MONITORING
// =====================================================

/**
 * Endpoint untuk menjalankan auto-delete manual (admin only)
 * POST /api/admin/execute-auto-delete
 */
router.post('/admin/execute-auto-delete', async (req, res) => {
    try {
        // TODO: Tambahkan validasi admin session jika diperlukan
        
        const deletedCount = await AutoDeleteService.executeAutoDelete();
        
        res.json({
            success: true,
            message: `Auto-delete berhasil dijalankan`,
            deletedCount,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error executing manual auto-delete', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menjalankan auto-delete'
        });
    }
});

/**
 * Endpoint untuk melihat data yang pending delete
 * GET /api/admin/pending-deletions
 */
router.get('/admin/pending-deletions', async (req, res) => {
    try {
        const pendingData = await AutoDeleteService.getPendingDeletions();
        
        res.json({
            success: true,
            data: pendingData,
            count: pendingData.length
        });
        
    } catch (error) {
        console.error('Error getting pending deletions', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data pending'
        });
    }
});

/**
 * Endpoint untuk melihat summary nobooking yang sudah digunakan
 * GET /api/admin/used-nobooking-summary
 */
router.get('/admin/used-nobooking-summary', async (req, res) => {
    try {
        const summary = await AutoDeleteService.getUsedNobookingSummary();
        
        res.json({
            success: true,
            data: summary
        });
        
    } catch (error) {
        console.error('Error getting used nobooking summary', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil summary'
        });
    }
});

/**
 * Endpoint untuk mengecek apakah nobooking sudah pernah digunakan
 * GET /api/check-nobooking-usage/:nobooking
 */
router.get('/check-nobooking-usage/:nobooking', async (req, res) => {
    try {
        const { nobooking } = req.params;
        
        if (!nobooking) {
            return res.status(400).json({
                success: false,
                message: 'Nomor booking tidak valid'
            });
        }
        
        const isUsed = await AutoDeleteService.isNobookingUsed(nobooking);
        const detail = await AutoDeleteService.getRejectedBookingDetail(nobooking);
        
        res.json({
            success: true,
            nobooking,
            isUsed,
            detail: detail ? {
                rejectionSource: detail.rejection_source,
                rejectionReason: detail.rejection_reason,
                rejectedAt: detail.rejected_at,
                scheduledDeleteAt: detail.scheduled_delete_at
            } : null
        });
        
    } catch (error) {
        console.error('Error checking nobooking usage', {
            error: error.message,
            nobooking: req.params.nobooking
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengecek nobooking'
        });
    }
});

/**
 * Endpoint untuk manual cleanup (testing)
 * POST /api/admin/manual-cleanup
 */
router.post('/admin/manual-cleanup', async (req, res) => {
    try {
        const results = await AutoDeleteService.manualCleanup();
        
        res.json({
            success: true,
            message: 'Manual cleanup completed',
            results,
            count: results.length
        });
        
    } catch (error) {
        console.error('Error in manual cleanup', {
            error: error.message
        });
        
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat manual cleanup'
        });
    }
});

export default router;
