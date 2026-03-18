import express from 'express';
import { pool } from '../../../db.js';

const router = express.Router();

// =============================================
// PENELITI DAILY COUNTER API ROUTES
// =============================================

/**
 * GET /api/peneliti/counter/:userid
 * Mendapatkan counter peneliti tertentu
 */
router.get('/counter/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        const { date } = req.query;
        
        const query = `
            SELECT * FROM get_peneliti_counter($1, $2)
        `;
        
        const result = await pool.query(query, [userid, date || new Date().toISOString().split('T')[0]]);
        
        if (result.rows.length === 0) {
            // Jika belum ada data, buat record baru
            await pool.query(
                'INSERT INTO peneliti_daily_counter (userid, date, counter) VALUES ($1, $2, 0) ON CONFLICT (userid, date) DO NOTHING',
                [userid, date || new Date().toISOString().split('T')[0]]
            );
            
            // Query lagi untuk mendapatkan data
            const newResult = await pool.query(query, [userid, date || new Date().toISOString().split('T')[0]]);
            return res.json({
                success: true,
                data: newResult.rows[0]
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error getting peneliti counter:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting peneliti counter',
            error: error.message
        });
    }
});

/**
 * POST /api/peneliti/counter/:userid/increment
 * Increment counter peneliti
 */
router.post('/counter/:userid/increment', async (req, res) => {
    try {
        const { userid } = req.params;
        const { date } = req.body;
        
        const query = 'SELECT increment_peneliti_counter($1, $2)';
        const result = await pool.query(query, [userid, date || new Date().toISOString().split('T')[0]]);
        
        const newCounter = result.rows[0].increment_peneliti_counter;
        
        // Get updated counter info
        const counterInfo = await pool.query('SELECT * FROM get_peneliti_counter($1, $2)', [
            userid, 
            date || new Date().toISOString().split('T')[0]
        ]);
        
        res.json({
            success: true,
            message: 'Counter incremented successfully',
            data: {
                userid,
                counter: newCounter,
                ...counterInfo.rows[0]
            }
        });
    } catch (error) {
        console.error('Error incrementing peneliti counter:', error);
        res.status(500).json({
            success: false,
            message: 'Error incrementing peneliti counter',
            error: error.message
        });
    }
});

/**
 * GET /api/peneliti/counter/team/summary
 * Mendapatkan summary tim harian
 */
router.get('/counter/team/summary', async (req, res) => {
    try {
        const { date } = req.query;
        
        const query = 'SELECT * FROM get_team_daily_summary()';
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting team summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting team summary',
            error: error.message
        });
    }
});

/**
 * GET /api/peneliti/counter/daily-summary
 * Mendapatkan summary harian dari view
 */
router.get('/counter/daily-summary', async (req, res) => {
    try {
        const { date } = req.query;
        
        const query = `
            SELECT * FROM v_peneliti_daily_summary
            WHERE date = $1
        `;
        
        const result = await pool.query(query, [date || new Date().toISOString().split('T')[0]]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting daily summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting daily summary',
            error: error.message
        });
    }
});

/**
 * POST /api/peneliti/counter/reset
 * Reset semua counter harian
 */
router.post('/counter/reset', async (req, res) => {
    try {
        await pool.query('SELECT reset_daily_counters()');
        
        res.json({
            success: true,
            message: 'All daily counters reset successfully'
        });
    } catch (error) {
        console.error('Error resetting counters:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting counters',
            error: error.message
        });
    }
});

/**
 * POST /api/peneliti/counter/auto-reset
 * Auto-reset counter untuk hari baru
 */
router.post('/counter/auto-reset', async (req, res) => {
    try {
        await pool.query('SELECT auto_reset_daily_counters()');
        
        res.json({
            success: true,
            message: 'Auto-reset completed successfully'
        });
    } catch (error) {
        console.error('Error auto-resetting counters:', error);
        res.status(500).json({
            success: false,
            message: 'Error auto-resetting counters',
            error: error.message
        });
    }
});

/**
 * GET /api/peneliti/counter/history/:userid
 * Mendapatkan history counter peneliti
 */
router.get('/counter/history/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        const { days = 7 } = req.query;
        
        const query = `
            SELECT 
                userid,
                date,
                counter,
                ROUND((counter::DECIMAL / 80) * 100, 2) as percentage_complete,
                (80 - counter) as remaining_slots,
                CASE 
                    WHEN counter >= 80 THEN 'LIMIT REACHED'
                    WHEN counter >= 60 THEN 'HIGH'
                    WHEN counter >= 40 THEN 'MEDIUM'
                    WHEN counter >= 20 THEN 'LOW'
                    ELSE 'VERY LOW'
                END as workload_status,
                created_at,
                updated_at
            FROM peneliti_daily_counter 
            WHERE userid = $1 
            AND date >= CURRENT_DATE - INTERVAL '${days} days'
            ORDER BY date DESC
        `;
        
        const result = await pool.query(query, [userid]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error getting peneliti history:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting peneliti history',
            error: error.message
        });
    }
});

export default router;
