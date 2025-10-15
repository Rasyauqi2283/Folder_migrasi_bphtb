// Sistem Booking dengan Akumulasi Global (Bukan Per Tanggal Terpisah)
import { pool } from './db.js';

class GlobalAccumulationBookingSystem {
    constructor() {
        this.dailyLimit = 80;
        this.systemStartYear = 2025;
    }

    /**
     * Generate booking number dengan sistem akumulasi global
     * @param {Date} targetDate - Tanggal target booking
     * @param {string} userId - ID user
     * @returns {Promise<Object>} Booking number dan metadata
     */
    async generateGlobalAccumulationBooking(targetDate, userId) {
        try {
            console.log('📅 [GLOBAL] Generating booking for:', {
                targetDate: targetDate.toISOString().split('T')[0],
                userId
            });

            // 1. Validasi tanggal
            await this.validateTargetDate(targetDate);

            // 2. Hitung total booking dari awal tahun sampai tanggal target (tidak termasuk)
            const totalPreviousBookings = await this.getTotalBookingsUpToDate(targetDate);
            
            // 3. Hitung booking di tanggal target hari ini
            const dailyBookings = await this.getDailyBookingCount(targetDate);
            
            // 4. Validasi kuota harian
            if (dailyBookings >= this.dailyLimit) {
                throw new Error(`Kuota harian sudah terpenuhi (${this.dailyLimit} booking)`);
            }

            // 5. Generate nomor booking dengan akumulasi global
            const globalSequence = totalPreviousBookings + dailyBookings + 1;
            const bookingNumber = `${this.systemStartYear}O${String(globalSequence).padStart(5, '0')}`;
            const dailySequence = dailyBookings + 1;

            // 6. Simpan booking
            await this.saveBookingRecord(targetDate, bookingNumber, userId, globalSequence, dailySequence);

            const result = {
                bookingNumber,
                globalSequence,
                dailySequence,
                totalPreviousBookings,
                dailyBookings,
                targetDate: targetDate.toISOString().split('T')[0],
                remainingQuota: this.dailyLimit - dailyBookings - 1,
                isLastBooking: dailySequence === this.dailyLimit
            };

            console.log('✅ [GLOBAL] Booking generated:', result);
            return result;

        } catch (error) {
            console.error('❌ [GLOBAL] Error generating booking:', error.message);
            throw error;
        }
    }

    /**
     * Hitung total booking dari awal tahun sampai tanggal tertentu (tidak termasuk)
     */
    async getTotalBookingsUpToDate(targetDate) {
        const startOfYear = new Date(this.systemStartYear, 0, 1);
        const endDate = new Date(targetDate);
        endDate.setHours(0, 0, 0, 0);

        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM pat_1_bookingsspd 
            WHERE created_at >= $1 
            AND DATE(created_at) < $2
        `, [startOfYear, endDate.toISOString().split('T')[0]]);

        return parseInt(result.rows[0].count);
    }

    /**
     * Hitung booking di tanggal target hari ini
     */
    async getDailyBookingCount(targetDate) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM pat_1_bookingsspd 
            WHERE DATE(created_at) = $1
        `, [dateStr]);
        
        return parseInt(result.rows[0].count);
    }

    /**
     * Simpan booking record ke database
     */
    async saveBookingRecord(targetDate, bookingNumber, userId, globalSequence, dailySequence) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        // Simpan ke tabel booking counter untuk tracking
        await pool.query(`
            INSERT INTO booking_global_tracking (
                target_date, 
                booking_number, 
                user_id, 
                global_sequence, 
                daily_sequence,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
        `, [dateStr, bookingNumber, userId, globalSequence, dailySequence]);

        // Update daily quota tracking
        await this.updateDailyQuotaTracking(targetDate, bookingNumber, dailySequence);
    }

    /**
     * Update daily quota tracking
     */
    async updateDailyQuotaTracking(targetDate, bookingNumber, dailySequence) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        await pool.query(`
            INSERT INTO daily_quota_tracking (
                date, 
                total_bookings, 
                quota_limit, 
                first_booking_number, 
                last_booking_number,
                updated_at
            ) VALUES ($1, 1, $2, $3, $3, NOW())
            ON CONFLICT (date) DO UPDATE SET
                total_bookings = daily_quota_tracking.total_bookings + 1,
                last_booking_number = EXCLUDED.last_booking_number,
                updated_at = NOW()
        `, [dateStr, this.dailyLimit, bookingNumber]);
    }

    /**
     * Validasi tanggal target
     */
    async validateTargetDate(targetDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        if (targetDate < today) {
            throw new Error('Tidak dapat membuat booking untuk tanggal yang sudah lewat');
        }

        // Validasi tidak boleh lebih dari 30 hari ke depan
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 30);
        
        if (targetDate > maxDate) {
            throw new Error('Booking maksimal 30 hari ke depan');
        }
    }

    /**
     * Get statistics untuk monitoring
     */
    async getBookingStatistics(startDate, endDate) {
        const result = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as daily_count,
                MIN(nobooking) as first_booking,
                MAX(nobooking) as last_booking,
                -- Hitung akumulasi global
                (
                    SELECT COUNT(*) 
                    FROM pat_1_bookingsspd b2 
                    WHERE DATE(b2.created_at) <= DATE(pb.created_at)
                ) as cumulative_count
            FROM pat_1_bookingsspd pb
            WHERE DATE(created_at) BETWEEN $1 AND $2
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [startDate, endDate]);

        return result.rows;
    }

    /**
     * Get global booking summary
     */
    async getGlobalBookingSummary() {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_bookings,
                MIN(created_at) as first_booking_date,
                MAX(created_at) as last_booking_date,
                MIN(nobooking) as first_booking_number,
                MAX(nobooking) as last_booking_number
            FROM pat_1_bookingsspd 
            WHERE EXTRACT(YEAR FROM created_at) = $1
        `, [this.systemStartYear]);

        return result.rows[0];
    }

    /**
     * Cek kuota untuk tanggal tertentu
     */
    async checkQuotaForDate(targetDate) {
        const dailyBookings = await this.getDailyBookingCount(targetDate);
        const totalPrevious = await this.getTotalBookingsUpToDate(targetDate);
        
        return {
            date: targetDate.toISOString().split('T')[0],
            dailyBookings,
            totalPrevious,
            remainingDailyQuota: this.dailyLimit - dailyBookings,
            nextGlobalSequence: totalPrevious + dailyBookings + 1,
            isQuotaFull: dailyBookings >= this.dailyLimit
        };
    }
}

// Export singleton
export const globalBookingSystem = new GlobalAccumulationBookingSystem();

// Helper functions
export async function generateGlobalBookingNumber(targetDate, userId) {
    return await globalBookingSystem.generateGlobalAccumulationBooking(targetDate, userId);
}

export async function checkGlobalQuota(targetDate) {
    return await globalBookingSystem.checkQuotaForDate(targetDate);
}
