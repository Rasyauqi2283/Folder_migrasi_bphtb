// =====================================================
// AUTO DELETE SERVICE
// Service untuk mengelola auto-delete data yang ditolak
// =====================================================

import { pool } from '../../../db.js';

class AutoDeleteService {
    
    /**
     * Menambahkan data ke tracker saat ditolak
     * @param {string} nobooking - Nomor booking yang ditolak
     * @param {string} rejectionSource - Sumber penolakan ('LTB' atau 'PV')
     * @param {string} rejectionReason - Alasan penolakan
     * @param {string} rejectedBy - User ID yang menolak
     * @returns {Promise<boolean>} - Success status
     */
    static async addRejectedBooking(nobooking, rejectionSource, rejectionReason = null, rejectedBy = null) {
        try {
            const result = await pool.query(
                'SELECT add_rejected_booking($1, $2, $3, $4) as success',
                [nobooking, rejectionSource, rejectionReason, rejectedBy]
            );
            
            const success = result.rows[0].success;
            
            if (success) {
                console.log('Rejected booking added to tracker', {
                    nobooking,
                    rejectionSource,
                    rejectionReason,
                    rejectedBy
                });
            } else {
                console.error('Failed to add rejected booking to tracker', {
                    nobooking,
                    rejectionSource,
                    rejectionReason,
                    rejectedBy
                });
            }
            
            return success;
        } catch (error) {
            console.error('Error adding rejected booking to tracker', {
                error: error.message,
                nobooking,
                rejectionSource,
                rejectionReason,
                rejectedBy
            });
            return false;
        }
    }
    
    /**
     * Mengeksekusi auto-delete untuk data yang sudah 10 hari
     * @returns {Promise<number>} - Jumlah data yang berhasil dihapus
     */
    static async executeAutoDelete() {
        try {
            const result = await pool.query('SELECT auto_delete_rejected_data() as deleted_count');
            const deletedCount = result.rows[0].deleted_count;
            
            console.log('Auto-delete executed', {
                deletedCount,
                timestamp: new Date().toISOString()
            });
            
            return deletedCount;
        } catch (error) {
            console.error('Error executing auto-delete', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return 0;
        }
    }
    
    /**
     * Mengecek apakah nobooking sudah pernah digunakan
     * @param {string} nobooking - Nomor booking yang akan dicek
     * @returns {Promise<boolean>} - True jika sudah pernah digunakan
     */
    static async isNobookingUsed(nobooking) {
        try {
            const result = await pool.query(
                'SELECT is_nobooking_used($1) as is_used',
                [nobooking]
            );
            
            return result.rows[0].is_used;
        } catch (error) {
            console.error('Error checking nobooking usage', {
                error: error.message,
                nobooking
            });
            return false; // Default to false untuk keamanan
        }
    }
    
    /**
     * Mendapatkan daftar data yang akan dihapus
     * @returns {Promise<Array>} - Array data yang pending delete
     */
    static async getPendingDeletions() {
        try {
            const result = await pool.query('SELECT * FROM v_rejected_bookings_pending');
            return result.rows;
        } catch (error) {
            console.error('Error getting pending deletions', {
                error: error.message
            });
            return [];
        }
    }
    
    /**
     * Mendapatkan summary nobooking yang sudah pernah digunakan
     * @returns {Promise<Array>} - Summary data
     */
    static async getUsedNobookingSummary() {
        try {
            const result = await pool.query('SELECT * FROM v_used_nobooking_summary');
            return result.rows;
        } catch (error) {
            console.error('Error getting used nobooking summary', {
                error: error.message
            });
            return [];
        }
    }
    
    /**
     * Manual cleanup untuk testing
     * @returns {Promise<Array>} - Hasil cleanup
     */
    static async manualCleanup() {
        try {
            const result = await pool.query('SELECT * FROM manual_cleanup_rejected_data()');
            return result.rows;
        } catch (error) {
            console.error('Error in manual cleanup', {
                error: error.message
            });
            return [];
        }
    }
    
    /**
     * Mendapatkan detail data yang ditolak berdasarkan nobooking
     * @param {string} nobooking - Nomor booking
     * @returns {Promise<Object|null>} - Detail data atau null
     */
    static async getRejectedBookingDetail(nobooking) {
        try {
            const result = await pool.query(
                'SELECT * FROM rejected_bookings_tracker WHERE nobooking = $1',
                [nobooking]
            );
            
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error getting rejected booking detail', {
                error: error.message,
                nobooking
            });
            return null;
        }
    }
    
    /**
     * Membatalkan penjadwalan delete (jika data diterima kembali)
     * @param {string} nobooking - Nomor booking
     * @returns {Promise<boolean>} - Success status
     */
    static async cancelScheduledDelete(nobooking) {
        try {
            const result = await pool.query(
                'UPDATE rejected_bookings_tracker SET is_deleted = TRUE, deleted_at = NOW() WHERE nobooking = $1 AND is_deleted = FALSE',
                [nobooking]
            );
            
            const success = result.rowCount > 0;
            
            if (success) {
                console.log('Scheduled delete cancelled', { nobooking });
            }
            
            return success;
        } catch (error) {
            console.error('Error cancelling scheduled delete', {
                error: error.message,
                nobooking
            });
            return false;
        }
    }
}

export default AutoDeleteService;
