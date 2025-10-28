// 🔔 Notification Endpoints for PPAT System
import { pool } from '../../../db.js';

export default function registerNotificationEndpoints({ app }) {
    
    // GET /api/notifications/unread - Get unread notifications for current user
    app.get('/api/notifications/unread', async (req, res) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }

            const userid = req.session.user.userid;
            const limit = parseInt(req.query.limit) || 10;

            console.log('🔔 [NOTIFICATION] Fetching unread notifications for user:', userid);

            const query = `
                SELECT 
                    id,
                    title,
                    message,
                    type,
                    related_booking,
                    trackstatus,
                    is_read,
                    created_at
                FROM notifications 
                WHERE userid = $1 
                AND is_read = false 
                ORDER BY created_at DESC 
                LIMIT $2
            `;

            const result = await pool.query(query, [userid, limit]);

            // Mark notifications as read
            if (result.rows.length > 0) {
                const notificationIds = result.rows.map(n => n.id);
                await pool.query(
                    `UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = ANY($1)`,
                    [notificationIds]
                );
            }

            console.log('🔔 [NOTIFICATION] Found', result.rows.length, 'unread notifications');

            res.json({
                success: true,
                notifications: result.rows,
                count: result.rows.length
            });

        } catch (error) {
            console.error('❌ [NOTIFICATION] Failed to fetch notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // GET /api/notifications/all - Get all notifications for current user
    app.get('/api/notifications/all', async (req, res) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }

            const userid = req.session.user.userid;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            console.log('🔔 [NOTIFICATION] Fetching all notifications for user:', userid, 'page:', page);

            const query = `
                SELECT 
                    id,
                    title,
                    message,
                    type,
                    related_booking,
                    trackstatus,
                    is_read,
                    created_at,
                    updated_at
                FROM notifications 
                WHERE userid = $1 
                ORDER BY created_at DESC 
                LIMIT $2 OFFSET $3
            `;

            const countQuery = `
                SELECT COUNT(*) as total 
                FROM notifications 
                WHERE userid = $1
            `;

            const [result, countResult] = await Promise.all([
                pool.query(query, [userid, limit, offset]),
                pool.query(countQuery, [userid])
            ]);

            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);

            console.log('🔔 [NOTIFICATION] Found', result.rows.length, 'notifications (total:', total, ')');

            res.json({
                success: true,
                notifications: result.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('❌ [NOTIFICATION] Failed to fetch all notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/notifications/mark-read - Mark specific notifications as read
    app.post('/api/notifications/mark-read', async (req, res) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }

            const userid = req.session.user.userid;
            const { notificationIds } = req.body;

            if (!notificationIds || !Array.isArray(notificationIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'notificationIds array is required'
                });
            }

            console.log('🔔 [NOTIFICATION] Marking notifications as read:', notificationIds);

            const query = `
                UPDATE notifications 
                SET is_read = true, updated_at = NOW() 
                WHERE id = ANY($1) AND userid = $2
                RETURNING id
            `;

            const result = await pool.query(query, [notificationIds, userid]);

            console.log('🔔 [NOTIFICATION] Marked', result.rows.length, 'notifications as read');

            res.json({
                success: true,
                markedCount: result.rows.length,
                notificationIds: result.rows.map(r => r.id)
            });

        } catch (error) {
            console.error('❌ [NOTIFICATION] Failed to mark notifications as read:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notifications as read',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/notifications/clear-all - Clear all notifications for current user
    app.post('/api/notifications/clear-all', async (req, res) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }

            const userid = req.session.user.userid;

            console.log('🔔 [NOTIFICATION] Clearing all notifications for user:', userid);

            const query = `
                DELETE FROM notifications 
                WHERE userid = $1
                RETURNING id
            `;

            const result = await pool.query(query, [userid]);

            console.log('🔔 [NOTIFICATION] Cleared', result.rows.length, 'notifications');

            res.json({
                success: true,
                clearedCount: result.rows.length
            });

        } catch (error) {
            console.error('❌ [NOTIFICATION] Failed to clear notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear notifications',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // GET /api/notifications/sound-toggle - Toggle sound preference
    app.get('/api/notifications/sound-toggle', async (req, res) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }

            const userid = req.session.user.userid;
            const soundEnabled = req.query.enabled === 'true';

            console.log('🔔 [NOTIFICATION] Sound toggle for user:', userid, 'enabled:', soundEnabled);

            // Store preference in user profile or separate table
            // For now, we'll use localStorage on frontend
            res.json({
                success: true,
                soundEnabled,
                message: soundEnabled ? 'Suara notifikasi diaktifkan' : 'Suara notifikasi dinonaktifkan'
            });

        } catch (error) {
            console.error('❌ [NOTIFICATION] Failed to toggle sound:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle sound',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    console.log('🔔 [NOTIFICATION] Notification endpoints registered');
}
