/**
 * Booking Quota Manager
 * 
 * Sistem untuk mengelola kuotasi booking harian dengan rate limiting
 * untuk mencegah server overload saat hari baru dimulai.
 * 
 * Fitur:
 * - Daily quota management (80 booking/hari)
 * - Rate limiting (throttling) saat hari baru
 * - Queue system untuk handle spike traffic
 * - Continuous numbering (tahun-O-urutan)
 */

const { pool } = require('../config/database');

class BookingQuotaManager {
    constructor(options = {}) {
        this.dailyQuota = options.dailyQuota || 80;
        this.rateLimitMs = options.rateLimitMs || 2000; // 2 detik per booking
        this.queue = [];
        this.processing = false;
        this.currentDate = new Date().toDateString();
        this.quotaCache = new Map(); // Cache untuk quota per hari
    }

    /**
     * Check apakah hari baru
     */
    isNewDay() {
        const today = new Date().toDateString();
        if (today !== this.currentDate) {
            this.currentDate = today;
            this.quotaCache.clear(); // Clear cache saat hari baru
            return true;
        }
        return false;
    }

    /**
     * Get atau create quota record untuk hari ini
     */
    async getDailyQuota(dateKey = null) {
        if (!dateKey) {
            dateKey = new Date().toDateString();
        }

        // Check cache dulu
        if (this.quotaCache.has(dateKey)) {
            return this.quotaCache.get(dateKey);
        }

        try {
            const result = await pool.query(
                `SELECT * FROM booking_quota_daily WHERE date_key = $1`,
                [dateKey]
            );

            let quota;
            if (result.rows.length === 0) {
                // Create new quota record
                await pool.query(
                    `INSERT INTO booking_quota_daily (date_key, quota_total, quota_used)
                     VALUES ($1, $2, 0)
                     ON CONFLICT (date_key) DO NOTHING`,
                    [dateKey, this.dailyQuota]
                );
                quota = {
                    date_key: dateKey,
                    quota_total: this.dailyQuota,
                    quota_used: 0,
                    quota_remaining: this.dailyQuota
                };
            } else {
                quota = result.rows[0];
                quota.quota_remaining = quota.quota_total - quota.quota_used;
            }

            // Cache result
            this.quotaCache.set(dateKey, quota);
            return quota;
        } catch (error) {
            console.error('Error getting daily quota:', error);
            throw error;
        }
    }

    /**
     * Check apakah masih ada kuota
     */
    async checkQuotaAvailable(dateKey = null) {
        const quota = await this.getDailyQuota(dateKey);
        return {
            available: quota.quota_remaining > 0,
            remaining: quota.quota_remaining,
            used: quota.quota_used,
            total: quota.quota_total
        };
    }

    /**
     * Increment quota used (atomic operation)
     */
    async incrementQuotaUsed(dateKey = null) {
        if (!dateKey) {
            dateKey = new Date().toDateString();
        }

        try {
            const result = await pool.query(
                `UPDATE booking_quota_daily
                 SET quota_used = quota_used + 1,
                     updated_at = NOW()
                 WHERE date_key = $1
                   AND quota_used < quota_total
                 RETURNING *`,
                [dateKey]
            );

            if (result.rows.length === 0) {
                // Quota penuh atau record tidak ada
                const quota = await this.getDailyQuota(dateKey);
                return {
                    success: false,
                    quota: quota,
                    message: 'Kuota harian sudah penuh'
                };
            }

            const updatedQuota = result.rows[0];
            updatedQuota.quota_remaining = updatedQuota.quota_total - updatedQuota.quota_used;

            // Update cache
            this.quotaCache.set(dateKey, updatedQuota);

            return {
                success: true,
                quota: updatedQuota
            };
        } catch (error) {
            console.error('Error incrementing quota:', error);
            throw error;
        }
    }

    /**
     * Get next booking number (tahun-O-urutan)
     * Urutan tidak reset per hari, lanjut terus
     */
    async getNextBookingNumber() {
        try {
            const year = new Date().getFullYear();
            const prefix = `${year}-O-`;

            // Get last booking number untuk tahun ini
            const result = await pool.query(
                `SELECT nobooking 
                 FROM pat_1_bookingsspd 
                 WHERE nobooking LIKE $1
                 ORDER BY nobooking DESC 
                 LIMIT 1`,
                [`${prefix}%`]
            );

            let nextNumber = 1;
            if (result.rows.length > 0) {
                const lastBooking = result.rows[0].nobooking;
                // Extract number dari format: 2025-O-000001
                const match = lastBooking.match(/-O-(\d+)$/);
                if (match) {
                    nextNumber = parseInt(match[1]) + 1;
                }
            }

            // Format dengan leading zeros (6 digits)
            const formattedNumber = String(nextNumber).padStart(6, '0');
            return `${prefix}${formattedNumber}`;
        } catch (error) {
            console.error('Error getting next booking number:', error);
            throw error;
        }
    }

    /**
     * Add booking request ke queue
     */
    async addToQueue(bookingData) {
        return new Promise((resolve, reject) => {
            const queueItem = {
                id: Date.now() + Math.random(),
                data: bookingData,
                resolve,
                reject,
                timestamp: Date.now(),
                status: 'pending'
            };

            this.queue.push(queueItem);

            // Start processing jika belum
            if (!this.processing) {
                this.startProcessingQueue();
            }

            // Return queue position
            return {
                queuePosition: this.queue.length,
                estimatedWaitTime: this.queue.length * (this.rateLimitMs / 1000)
            };
        });
    }

    /**
     * Process queue dengan rate limiting
     */
    async startProcessingQueue() {
        if (this.processing) {
            return; // Already processing
        }

        this.processing = true;
        console.log(`🔄 [Quota Manager] Starting queue processing. Queue length: ${this.queue.length}`);

        while (this.queue.length > 0) {
            const item = this.queue[0]; // Get first item (FIFO)

            try {
                // Check quota dulu
                const quotaCheck = await this.checkQuotaAvailable();
                
                if (!quotaCheck.available) {
                    // Quota penuh, reject semua item di queue
                    console.log(`⚠️ [Quota Manager] Quota full. Rejecting ${this.queue.length} items in queue`);
                    
                    while (this.queue.length > 0) {
                        const rejectedItem = this.queue.shift();
                        rejectedItem.reject(new Error('Kuota harian sudah penuh. Silakan coba lagi besok.'));
                    }
                    
                    break;
                }

                // Process booking
                item.status = 'processing';
                const result = await this.processBooking(item.data);
                item.status = 'completed';
                
                // Remove from queue
                this.queue.shift();
                
                // Resolve promise
                item.resolve(result);
                
                console.log(`✅ [Quota Manager] Booking processed. Queue remaining: ${this.queue.length}`);

            } catch (error) {
                console.error(`❌ [Quota Manager] Error processing booking:`, error);
                item.status = 'failed';
                
                // Remove from queue
                this.queue.shift();
                
                // Reject promise
                item.reject(error);
            }

            // Rate limiting: tunggu sebelum process berikutnya
            if (this.queue.length > 0) {
                await this.sleep(this.rateLimitMs);
            }
        }

        this.processing = false;
        console.log(`⏹️ [Quota Manager] Queue processing stopped.`);
    }

    /**
     * Process booking (create booking dengan quota check)
     */
    async processBooking(bookingData) {
        const dateKey = new Date().toDateString();

        // Check quota
        const quotaCheck = await this.checkQuotaAvailable(dateKey);
        if (!quotaCheck.available) {
            throw new Error('Kuota harian sudah penuh');
        }

        // Increment quota (atomic)
        const incrementResult = await this.incrementQuotaUsed(dateKey);
        if (!incrementResult.success) {
            throw new Error(incrementResult.message || 'Gagal mendapatkan kuota');
        }

        // Get next booking number
        const nobooking = await this.getNextBookingNumber();

        // Create booking (ini harus diimplementasikan sesuai kebutuhan)
        // Contoh:
        // const booking = await createBookingInDatabase({
        //     ...bookingData,
        //     nobooking: nobooking
        // });

        return {
            success: true,
            nobooking: nobooking,
            quota: incrementResult.quota
        };
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            estimatedWaitTime: this.queue.length * (this.rateLimitMs / 1000)
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check apakah perlu rate limiting (saat hari baru)
     */
    async shouldApplyRateLimit() {
        const isNewDay = this.isNewDay();
        const quota = await this.getDailyQuota();
        
        // Apply rate limit jika:
        // 1. Hari baru DAN
        // 2. Masih ada kuota tersisa DAN
        // 3. Ada item di queue
        return isNewDay && quota.quota_remaining > 0 && this.queue.length > 0;
    }
}

// Singleton instance
let quotaManagerInstance = null;

function getQuotaManager(options = {}) {
    if (!quotaManagerInstance) {
        quotaManagerInstance = new BookingQuotaManager(options);
    }
    return quotaManagerInstance;
}

module.exports = {
    BookingQuotaManager,
    getQuotaManager
};

