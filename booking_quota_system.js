// Sistem Kuotasi Booking dengan Antrian Global
import { pool } from './E-BPHTB_root_utama/db.js';

class BookingQuotaSystem {
    constructor() {
        this.dailyLimit = 80;
        this.systemStartYear = 2025;
    }

    /**
     * Generate booking number dengan sistem antrian global
     * @param {Date} targetDate - Tanggal target booking
     * @param {string} userId - ID user yang membuat booking
     * @returns {Object} Booking number dan metadata
     */
    async generateBookingNumber(targetDate, userId) {
        try {
            console.log('📅 [QUOTA] Generating booking for date:', targetDate.toISOString().split('T')[0]);
            
            // 1. Validasi tanggal tidak boleh di masa lalu
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            targetDate.setHours(0, 0, 0, 0);
            
            if (targetDate < today) {
                throw new Error('Tidak dapat membuat booking untuk tanggal yang sudah lewat');
            }

            // 2. Hitung hari sejak awal tahun
            const year = targetDate.getFullYear();
            const startOfYear = new Date(year, 0, 1);
            const dayOfYear = Math.floor((targetDate - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
            
            // 3. Cek kuota harian
            const dailyBookings = await this.getDailyBookingCount(targetDate);
            
            if (dailyBookings >= this.dailyLimit) {
                throw new Error(`Kuota harian sudah terpenuhi (${this.dailyLimit} booking)`);
            }

            // 4. Generate nomor booking
            const globalSequence = ((dayOfYear - 1) * this.dailyLimit) + dailyBookings + 1;
            const bookingNumber = `${year}O${String(globalSequence).padStart(5, '0')}`;
            const dailySequence = dailyBookings + 1;

            // 5. Simpan counter untuk tracking
            await this.saveBookingCounter(targetDate, dailySequence, bookingNumber, userId);

            const result = {
                bookingNumber,
                dailySequence,
                globalSequence,
                targetDate: targetDate.toISOString().split('T')[0],
                remainingQuota: this.dailyLimit - dailyBookings - 1,
                isLastBooking: dailySequence === this.dailyLimit
            };

            console.log('✅ [QUOTA] Booking generated:', result);
            return result;

        } catch (error) {
            console.error('❌ [QUOTA] Error generating booking:', error.message);
            throw error;
        }
    }

    /**
     * Hitung berapa booking yang sudah dibuat untuk tanggal tertentu
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
     * Simpan counter booking untuk tracking
     */
    async saveBookingCounter(targetDate, dailySequence, bookingNumber, userId) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        // Insert atau update counter
        await pool.query(`
            INSERT INTO booking_daily_counters (date, daily_sequence, booking_number, user_id, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (date) DO UPDATE SET
                daily_sequence = EXCLUDED.daily_sequence,
                booking_number = EXCLUDED.booking_number,
                user_id = EXCLUDED.user_id,
                updated_at = NOW()
        `, [dateStr, dailySequence, bookingNumber, userId]);
    }

    /**
     * Cek kuota yang tersisa untuk tanggal tertentu
     */
    async getRemainingQuota(targetDate) {
        const dailyBookings = await this.getDailyBookingCount(targetDate);
        return {
            date: targetDate.toISOString().split('T')[0],
            used: dailyBookings,
            limit: this.dailyLimit,
            remaining: this.dailyLimit - dailyBookings,
            percentage: Math.round((dailyBookings / this.dailyLimit) * 100)
        };
    }

    /**
     * Get booking statistics untuk dashboard
     */
    async getBookingStatistics(startDate, endDate) {
        const result = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as daily_count,
                MIN(nobooking) as first_booking,
                MAX(nobooking) as last_booking
            FROM pat_1_bookingsspd 
            WHERE DATE(created_at) BETWEEN $1 AND $2
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [startDate, endDate]);

        return result.rows;
    }

    /**
     * Validasi apakah masih bisa membuat booking untuk tanggal tertentu
     */
    async canCreateBooking(targetDate, userId) {
        try {
            const quota = await this.getRemainingQuota(targetDate);
            
            if (quota.remaining <= 0) {
                return {
                    canCreate: false,
                    reason: 'Kuota harian sudah terpenuhi',
                    quota
                };
            }

            return {
                canCreate: true,
                quota
            };
        } catch (error) {
            return {
                canCreate: false,
                reason: error.message,
                quota: null
            };
        }
    }
}

// Export singleton instance
export const bookingQuota = new BookingQuotaSystem();

// Helper function untuk integrasi dengan form
export async function generateBookingNumberForForm(targetDate, userId) {
    return await bookingQuota.generateBookingNumber(targetDate, userId);
}

// Helper function untuk validasi kuota
export async function checkQuotaAvailability(targetDate) {
    return await bookingQuota.canCreateBooking(targetDate);
}
