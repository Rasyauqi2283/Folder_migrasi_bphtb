/**
 * Contoh Endpoint untuk Booking dengan Quota Management
 * 
 * Endpoint ini menggunakan BookingQuotaManager untuk:
 * - Check kuota harian
 * - Handle queue system
 * - Rate limiting saat hari baru
 */

const express = require('express');
const router = express.Router();
const { getQuotaManager } = require('../../services/booking_quota_manager');

// Get quota manager instance
const quotaManager = getQuotaManager({
    dailyQuota: 80,
    rateLimitMs: 2000 // 2 detik per booking
});

/**
 * POST /api/booking/create-with-quota
 * Create booking dengan quota check dan queue system
 */
router.post('/create-with-quota', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Check quota availability
        const quotaCheck = await quotaManager.checkQuotaAvailable();
        
        if (!quotaCheck.available) {
            await client.query('ROLLBACK');
            return res.status(429).json({
                success: false,
                message: 'Kuota harian sudah penuh',
                quota: quotaCheck,
                suggestion: 'Silakan coba lagi besok atau gunakan pre-booking untuk hari besok'
            });
        }

        // Check apakah perlu masuk queue (jika hari baru dan ada antrian)
        const shouldQueue = await quotaManager.shouldApplyRateLimit();
        
        if (shouldQueue || quotaManager.getQueueStatus().queueLength > 0) {
            // Masukkan ke queue
            const queueStatus = quotaManager.getQueueStatus();
            
            // Add to queue (async processing)
            const queuePromise = quotaManager.addToQueue({
                ...req.body,
                userid: req.session.user?.userid
            });

            // Return response dengan queue info
            return res.json({
                success: true,
                message: 'Booking request masuk ke antrian',
                queue: {
                    position: queueStatus.queueLength + 1,
                    estimatedWaitTime: (queueStatus.queueLength + 1) * 2, // detik
                    status: 'pending'
                },
                // Process in background
                promise: queuePromise.then(result => {
                    console.log('✅ Booking processed from queue:', result);
                }).catch(error => {
                    console.error('❌ Booking failed from queue:', error);
                })
            });
        }

        // Process langsung (tidak perlu queue)
        const result = await quotaManager.processBooking({
            ...req.body,
            userid: req.session.user?.userid
        });

        await client.query('COMMIT');

        return res.json({
            success: true,
            message: 'Booking berhasil dibuat',
            data: result
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating booking:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal membuat booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
});

/**
 * GET /api/booking/quota-status
 * Get status kuota hari ini
 */
router.get('/quota-status', async (req, res) => {
    try {
        const quota = await quotaManager.getDailyQuota();
        const queueStatus = quotaManager.getQueueStatus();
        
        return res.json({
            success: true,
            quota: {
                total: quota.quota_total,
                used: quota.quota_used,
                remaining: quota.quota_remaining,
                percentage: (quota.quota_used / quota.quota_total * 100).toFixed(2)
            },
            queue: queueStatus,
            date: new Date().toDateString()
        });
    } catch (error) {
        console.error('Error getting quota status:', error);
        return res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan status kuota'
        });
    }
});

/**
 * GET /api/booking/queue-status
 * Get status antrian
 */
router.get('/queue-status', async (req, res) => {
    try {
        const queueStatus = quotaManager.getQueueStatus();
        return res.json({
            success: true,
            queue: queueStatus
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan status antrian'
        });
    }
});

module.exports = router;

