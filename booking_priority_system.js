// Sistem Prioritas Booking untuk Handle Multiple Scenarios
import { pool } from './E-BPHTB_root_utama/db.js';

class BookingPrioritySystem {
    constructor() {
        this.dailyLimit = 80;
        this.reservationTimeout = 30 * 60 * 1000; // 30 menit
    }

    /**
     * Handle booking submission dengan sistem prioritas
     * @param {Date} targetDate - Tanggal target booking
     * @param {string} userId - ID user
     * @param {Date} submissionTime - Waktu submit (default: sekarang)
     * @returns {Promise<Object>} Result booking
     */
    async handleBookingSubmission(targetDate, userId, submissionTime = new Date()) {
        try {
            console.log('📅 [PRIORITY] Processing booking:', {
                targetDate: targetDate.toISOString().split('T')[0],
                userId,
                submissionTime: submissionTime.toISOString()
            });

            // 1. Validasi dasar
            await this.validateBookingRequest(targetDate, userId);

            // 2. Tentukan prioritas
            const priority = this.calculatePriority(targetDate, submissionTime);
            
            // 3. Cek kuota dengan prioritas
            const quotaCheck = await this.checkQuotaWithPriority(targetDate, priority);
            
            if (!quotaCheck.canBook) {
                // Masukkan ke waiting list jika tidak dapat slot langsung
                return await this.addToWaitingList(targetDate, userId, submissionTime, priority);
            }

            // 4. Generate booking number
            const bookingNumber = await this.generateBookingNumber(targetDate, userId, priority, submissionTime);

            // 5. Simpan booking
            await this.saveBooking(targetDate, bookingNumber, userId, priority, submissionTime);

            return {
                success: true,
                bookingNumber,
                status: 'CONFIRMED',
                priority,
                targetDate: targetDate.toISOString().split('T')[0],
                message: this.getConfirmationMessage(targetDate, priority),
                quota: quotaCheck
            };

        } catch (error) {
            console.error('❌ [PRIORITY] Error processing booking:', error.message);
            return {
                success: false,
                error: error.message,
                status: 'FAILED'
            };
        }
    }

    /**
     * Hitung prioritas berdasarkan tanggal target dan waktu submit
     */
    calculatePriority(targetDate, submissionTime) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const isToday = targetDate.getTime() === today.getTime();
        const isPast = targetDate < today;
        const isFuture = targetDate > today;

        if (isPast) {
            throw new Error('Tidak dapat booking untuk tanggal yang sudah lewat');
        }

        if (isToday) {
            // Booking hari ini mendapat prioritas tertinggi
            return {
                level: 'HIGH',
                score: 1000,
                reason: 'Same day booking'
            };
        }

        if (isFuture) {
            // Booking masa depan berdasarkan jarak hari
            const daysDiff = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 1) {
                return {
                    level: 'MEDIUM',
                    score: 500,
                    reason: 'Next day booking'
                };
            } else if (daysDiff <= 7) {
                return {
                    level: 'NORMAL',
                    score: 300 - (daysDiff * 10),
                    reason: `Future booking (${daysDiff} days ahead)`
                };
            } else {
                return {
                    level: 'LOW',
                    score: 100 - daysDiff,
                    reason: `Long term booking (${daysDiff} days ahead)`
                };
            }
        }

        return {
            level: 'UNKNOWN',
            score: 0,
            reason: 'Unknown date'
        };
    }

    /**
     * Cek kuota dengan mempertimbangkan prioritas
     */
    async checkQuotaWithPriority(targetDate, priority) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        // Hitung booking yang sudah confirmed
        const confirmedBookings = await this.getConfirmedBookingsCount(targetDate);
        
        // Hitung booking yang masih reserved (belum expired)
        const reservedBookings = await this.getReservedBookingsCount(targetDate);
        
        const totalUsed = confirmedBookings + reservedBookings;
        const remaining = this.dailyLimit - totalUsed;

        return {
            date: dateStr,
            confirmed: confirmedBookings,
            reserved: reservedBookings,
            totalUsed,
            remaining,
            canBook: remaining > 0,
            priority: priority.level
        };
    }

    /**
     * Tambahkan ke waiting list jika kuota penuh
     */
    async addToWaitingList(targetDate, userId, submissionTime, priority) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        // Simpan ke waiting list
        await pool.query(`
            INSERT INTO booking_waiting_list (target_date, user_id, submission_time, priority_level, priority_score, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'WAITING', NOW())
        `, [dateStr, userId, submissionTime, priority.level, priority.score]);

        // Hitung posisi dalam waiting list
        const position = await this.getWaitingListPosition(targetDate, userId);

        return {
            success: true,
            status: 'WAITING',
            waitingPosition: position,
            priority: priority.level,
            targetDate: dateStr,
            message: `Booking dimasukkan ke waiting list. Posisi: ${position}. Anda akan mendapat notifikasi jika ada slot tersedia.`,
            estimatedWaitTime: this.calculateEstimatedWait(position)
        };
    }

    /**
     * Generate booking number dengan sistem prioritas
     */
    async generateBookingNumber(targetDate, userId, priority, submissionTime) {
        const year = targetDate.getFullYear();
        const dayOfYear = Math.floor((targetDate - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)) + 1;
        
        // Hitung booking yang sudah dibuat (confirmed)
        const confirmedCount = await this.getConfirmedBookingsCount(targetDate);
        
        // Generate sequence number
        const globalSequence = ((dayOfYear - 1) * this.dailyLimit) + confirmedCount + 1;
        
        return {
            bookingNumber: `${year}O${String(globalSequence).padStart(5, '0')}`,
            globalSequence,
            dailySequence: confirmedCount + 1,
            priority: priority.level
        };
    }

    /**
     * Simpan booking ke database
     */
    async saveBooking(targetDate, bookingData, userId, priority, submissionTime) {
        const dateStr = targetDate.toISOString().split('T')[0];
        
        await pool.query(`
            INSERT INTO booking_reservations (
                target_date, 
                booking_number, 
                user_id, 
                priority_level, 
                priority_score, 
                submission_time, 
                status, 
                expires_at,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'RESERVED', $7, NOW())
        `, [
            dateStr,
            bookingData.bookingNumber,
            userId,
            priority.level,
            priority.score,
            submissionTime,
            new Date(submissionTime.getTime() + this.reservationTimeout)
        ]);

        // Update daily quota tracking
        await this.updateDailyQuota(targetDate, bookingData);
    }

    /**
     * Helper methods
     */
    async validateBookingRequest(targetDate, userId) {
        // Validasi tanggal
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        if (targetDate < today) {
            throw new Error('Tidak dapat booking untuk tanggal yang sudah lewat');
        }

        // Validasi user
        if (!userId) {
            throw new Error('User ID tidak valid');
        }
    }

    async getConfirmedBookingsCount(targetDate) {
        const dateStr = targetDate.toISOString().split('T')[0];
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM pat_1_bookingsspd 
            WHERE DATE(created_at) = $1
        `, [dateStr]);
        return parseInt(result.rows[0].count);
    }

    async getReservedBookingsCount(targetDate) {
        const dateStr = targetDate.toISOString().split('T')[0];
        const now = new Date();
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM booking_reservations 
            WHERE target_date = $1 
            AND status = 'RESERVED' 
            AND expires_at > $2
        `, [dateStr, now]);
        return parseInt(result.rows[0].count);
    }

    async getWaitingListPosition(targetDate, userId) {
        const dateStr = targetDate.toISOString().split('T')[0];
        const result = await pool.query(`
            SELECT COUNT(*) + 1 as position
            FROM booking_waiting_list 
            WHERE target_date = $1 
            AND submission_time < (
                SELECT submission_time 
                FROM booking_waiting_list 
                WHERE target_date = $1 AND user_id = $2
                LIMIT 1
            )
        `, [dateStr, userId]);
        return parseInt(result.rows[0].position);
    }

    async updateDailyQuota(targetDate, bookingData) {
        const dateStr = targetDate.toISOString().split('T')[0];
        await pool.query(`
            INSERT INTO daily_quota_tracking (date, total_bookings, quota_limit, last_booking_number, updated_at)
            VALUES ($1, 1, $2, $3, NOW())
            ON CONFLICT (date) DO UPDATE SET
                total_bookings = daily_quota_tracking.total_bookings + 1,
                last_booking_number = EXCLUDED.last_booking_number,
                updated_at = NOW()
        `, [dateStr, this.dailyLimit, bookingData.bookingNumber]);
    }

    calculateEstimatedWait(position) {
        if (position <= 5) return 'Kurang dari 1 jam';
        if (position <= 20) return '1-3 jam';
        if (position <= 50) return '3-6 jam';
        return 'Lebih dari 6 jam';
    }

    getConfirmationMessage(targetDate, priority) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        if (targetDate.getTime() === today.getTime()) {
            return 'Booking hari ini berhasil dikonfirmasi dengan prioritas tinggi!';
        } else {
            return `Booking untuk ${targetDate.toLocaleDateString('id-ID')} berhasil dikonfirmasi.`;
        }
    }
}

// Export singleton
export const bookingPriority = new BookingPrioritySystem();
