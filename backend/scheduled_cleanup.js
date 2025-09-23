// =====================================================
// SCHEDULED CLEANUP JOB
// Job untuk menjalankan auto-delete secara otomatis
// =====================================================

import cron from 'node-cron';
import AutoDeleteService from './auto_delete_service';
import logger from './logger';

class ScheduledCleanup {
    constructor() {
        this.isRunning = false;
        this.lastRun = null;
        this.nextRun = null;
    }
    
    /**
     * Memulai scheduled job
     */
    start() {
        // Jalankan setiap hari pada jam 02:00 WIB (UTC+7)
        // Cron: 0 19 * * * (19:00 UTC = 02:00 WIB)
        this.cronJob = cron.schedule('0 19 * * *', async () => {
            await this.executeCleanup();
        }, {
            scheduled: false,
            timezone: "Asia/Jakarta"
        });
        
        // Jalankan juga setiap 6 jam untuk memastikan tidak ada data yang terlewat
        this.cronJob6h = cron.schedule('0 */6 * * *', async () => {
            await this.executeCleanup();
        }, {
            scheduled: false,
            timezone: "Asia/Jakarta"
        });
        
        // Start the jobs
        this.cronJob.start();
        this.cronJob6h.start();
        
        logger.info('Scheduled cleanup jobs started', {
            dailySchedule: '02:00 WIB',
            frequentSchedule: 'Every 6 hours',
            timezone: 'Asia/Jakarta'
        });
        
        // Jalankan sekali saat startup untuk cleanup data yang mungkin terlewat
        setTimeout(() => {
            this.executeCleanup();
        }, 30000); // Tunggu 30 detik setelah startup
    }
    
    /**
     * Menghentikan scheduled job
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
        }
        if (this.cronJob6h) {
            this.cronJob6h.stop();
        }
        
        logger.info('Scheduled cleanup jobs stopped');
    }
    
    /**
     * Menjalankan cleanup
     */
    async executeCleanup() {
        if (this.isRunning) {
            logger.warn('Cleanup already running, skipping this execution');
            return;
        }
        
        this.isRunning = true;
        const startTime = new Date();
        
        try {
            logger.info('Starting scheduled cleanup', {
                startTime: startTime.toISOString()
            });
            
            // Jalankan auto-delete
            const deletedCount = await AutoDeleteService.executeAutoDelete();
            
            // Ambil data pending untuk monitoring
            const pendingData = await AutoDeleteService.getPendingDeletions();
            
            // Ambil summary untuk monitoring
            const summary = await AutoDeleteService.getUsedNobookingSummary();
            
            const endTime = new Date();
            const duration = endTime - startTime;
            
            logger.info('Scheduled cleanup completed', {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                duration: `${duration}ms`,
                deletedCount,
                pendingCount: pendingData.length,
                summary
            });
            
            // Update tracking
            this.lastRun = endTime;
            this.nextRun = new Date(endTime.getTime() + 6 * 60 * 60 * 1000); // Next run in 6 hours
            
        } catch (error) {
            logger.error('Error in scheduled cleanup', {
                error: error.message,
                stack: error.stack,
                startTime: startTime.toISOString()
            });
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Mendapatkan status scheduled job
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            nextRun: this.nextRun,
            cronJobActive: this.cronJob ? this.cronJob.running : false,
            cronJob6hActive: this.cronJob6h ? this.cronJob6h.running : false
        };
    }
    
    /**
     * Menjalankan cleanup manual
     */
    async manualCleanup() {
        logger.info('Manual cleanup requested');
        await this.executeCleanup();
    }
}

// Singleton instance
const scheduledCleanup = new ScheduledCleanup();

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping scheduled cleanup...');
    scheduledCleanup.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, stopping scheduled cleanup...');
    scheduledCleanup.stop();
    process.exit(0);
});

module.exports = scheduledCleanup;
