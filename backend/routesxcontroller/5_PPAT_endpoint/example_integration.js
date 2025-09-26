// =====================================================
// CONTOH INTEGRASI AUTO DELETE SYSTEM KE INDEX.JS
// Copy kode ini ke file index.js utama Anda
// =====================================================

// 1. Import auto-delete system (tambahkan di bagian atas file)
const { router: autoDeleteRouter, scheduledCleanup } = import('./backend/endpoint_session/PPAT_endpoint');

// 2. Mount auto-delete endpoints (tambahkan setelah deklarasi app)
app.use('/api', autoDeleteRouter);

// 3. Start scheduled cleanup (tambahkan setelah server start)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start auto-delete system
    scheduledCleanup.start();
    console.log('✅ Auto-delete system started successfully');
});

// 4. Graceful shutdown (tambahkan di akhir file)
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    scheduledCleanup.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    scheduledCleanup.stop();
    process.exit(0);
});

// =====================================================
// CONTOH PENGGUNAAN ENDPOINT
// =====================================================

// LTB Rejection dengan auto-delete
app.post('/api/ltb/reject-with-auto-delete', async (req, res) => {
    // Endpoint ini sudah tersedia di autoDeleteRouter
    // Tidak perlu menambahkan lagi
});

// PV Rejection dengan auto-delete
app.post('/api/pv/reject-with-auto-delete', async (req, res) => {
    // Endpoint ini sudah tersedia di autoDeleteRouter
    // Tidak perlu menambahkan lagi
});

// Check nobooking usage
app.get('/api/check-nobooking-usage/:nobooking', async (req, res) => {
    // Endpoint ini sudah tersedia di autoDeleteRouter
    // Tidak perlu menambahkan lagi
});

// Admin endpoints
app.get('/api/admin/pending-deletions', async (req, res) => {
    // Endpoint ini sudah tersedia di autoDeleteRouter
    // Tidak perlu menambahkan lagi
});

app.post('/api/admin/execute-auto-delete', async (req, res) => {
    // Endpoint ini sudah tersedia di autoDeleteRouter
    // Tidak perlu menambahkan lagi
});

// =====================================================
// CONTOH UPDATE FRONTEND
// =====================================================

// Di file tb_ppatksspd.js, ganti:
// const response = await fetch('/api/ltb_ltb-reject', {
// Menjadi:
// const response = await fetch('/api/ltb/reject-with-auto-delete', {

// Di file Validasi_berkas.html, ganti:
// const js = await callPV(`/api/validasi/${encodeURIComponent(noVal())}/decision`, {
// Menjadi:
// const js = await callPV(`/api/pv/reject-with-auto-delete`, {

// =====================================================
// CONTOH TESTING
// =====================================================

// Test database connection
async function testAutoDelete() {
    try {
        const AutoDeleteTest = require('./backend/endpoint_session/PPAT_endpoint/test_auto_delete');
        await AutoDeleteTest.runAllTests();
        console.log('✅ Auto-delete system test passed');
    } catch (error) {
        console.error('❌ Auto-delete system test failed:', error.message);
    }
}

// Test endpoints
async function testEndpoints() {
    const baseUrl = process.env.API_BASE_URL || '';
    
    try {
        // Test LTB rejection
        const ltbResponse = await fetch(`${baseUrl}/api/ltb/reject-with-auto-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nobooking: 'TEST001',
                rejectionReason: 'Test rejection',
                userid: 'testuser'
            })
        });
        console.log('LTB Rejection:', await ltbResponse.json());
        
        // Test check nobooking
        const checkResponse = await fetch(`${baseUrl}/api/check-nobooking-usage/TEST001`);
        console.log('Check Nobooking:', await checkResponse.json());
        
        // Test pending deletions
        const pendingResponse = await fetch(`${baseUrl}/api/admin/pending-deletions`);
        console.log('Pending Deletions:', await pendingResponse.json());
        
    } catch (error) {
        console.error('Endpoint test failed:', error.message);
    }
}

// =====================================================
// CONTOH MONITORING
// =====================================================

// Monitor cleanup status
async function monitorCleanup() {
    try {
        const response = await fetch(`${baseUrl}/api/admin/cleanup-status`);
        const status = await response.json();
        console.log('Cleanup Status:', status);
        
        if (status.success) {
            const { isRunning, lastRun, nextRun } = status.status;
            console.log(`Cleanup running: ${isRunning}`);
            console.log(`Last run: ${lastRun}`);
            console.log(`Next run: ${nextRun}`);
        }
    } catch (error) {
        console.error('Monitor failed:', error.message);
    }
}

// =====================================================
// CONTOH DATABASE QUERIES
// =====================================================

// Cek data yang akan dihapus
const checkPendingDeletions = `
    SELECT * FROM v_rejected_bookings_pending 
    ORDER BY scheduled_delete_at ASC;
`;

// Cek summary nobooking
const checkNobookingSummary = `
    SELECT * FROM v_used_nobooking_summary;
`;

// Manual cleanup
const manualCleanup = `
    SELECT * FROM manual_cleanup_rejected_data();
`;

// =====================================================
// CONTOH ENVIRONMENT VARIABLES
// =====================================================

// Tambahkan ke .env file:
/*
AUTO_DELETE_ENABLED=true
AUTO_DELETE_RETENTION_DAYS=10
CLEANUP_SCHEDULE_DAILY=0 19 * * *
CLEANUP_SCHEDULE_FREQUENT=0 */

// =====================================================
// CONTOH LOGGING
// =====================================================

// Log auto-delete activities
function logAutoDelete(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AUTO-DELETE] [${level}] ${message}`, data);
}

// Usage:
// logAutoDelete('INFO', 'Cleanup started', { deletedCount: 5 });
// logAutoDelete('ERROR', 'Cleanup failed', { error: error.message });

// =====================================================
// CONTOH ERROR HANDLING
// =====================================================

// Error handling untuk auto-delete
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception in auto-delete system:', error);
    scheduledCleanup.stop();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection in auto-delete system:', reason);
    scheduledCleanup.stop();
    process.exit(1);
});

// =====================================================
// CONTOH BACKUP STRATEGY
// =====================================================

// Backup sebelum cleanup
async function backupBeforeCleanup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupQuery = `
            CREATE TABLE rejected_bookings_backup_${timestamp} AS 
            SELECT * FROM rejected_bookings_tracker 
            WHERE is_deleted = FALSE;
        `;
        
        await pool.query(backupQuery);
        console.log(`✅ Backup created: rejected_bookings_backup_${timestamp}`);
    } catch (error) {
        console.error('❌ Backup failed:', error.message);
    }
}

// =====================================================
// CONTOH PERFORMANCE MONITORING
// =====================================================

// Monitor performa cleanup
async function monitorPerformance() {
    const startTime = Date.now();
    
    try {
        const deletedCount = await AutoDeleteService.executeAutoDelete();
        const duration = Date.now() - startTime;
        
        console.log(`Cleanup completed in ${duration}ms, deleted ${deletedCount} records`);
        
        // Alert jika terlalu lama
        if (duration > 30000) { // 30 detik
            console.warn(`⚠️ Cleanup took longer than expected: ${duration}ms`);
        }
        
    } catch (error) {
        console.error('Performance monitoring failed:', error.message);
    }
}
