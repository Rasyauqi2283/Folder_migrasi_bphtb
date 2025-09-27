// backend/routesxcontroller/4_admin/notification_warehouse_routes.js
import express from 'express';
import { pool } from '../../../db.js';

const router = express.Router();

// Helper function untuk verify admin
const verifyAdmin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const userDivisi = req.session.user.divisi?.toLowerCase();
    if (!['administrator', 'admin', 'a'].includes(userDivisi)) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    next();
};

// GET /api/admin/notification-warehouse/ppat-ltb - Get PPAT → LTB notifications
router.get('/ppat-ltb', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        console.log(`🔍 [ADMIN] Fetching PPAT → LTB notifications, page: ${page}, limit: ${limit}, search: "${search}"`);

        // Query untuk mendapatkan data PPAT → LTB dengan trackstatus 'Diolah'
        // Menggunakan struktur yang sama dengan terima_berkas_sspd.html
        let query = `
            SELECT DISTINCT ON (t.no_registrasi)
                t.no_registrasi,
                t.nobooking,
                t.updated_at,
                vu.special_field,
                vu.ppatk_khusus,
                b.noppbb,
                b.jenis_wajib_pajak,
                vu.userid,
                vu.nama as ppat_nama,
                vu.divisi as ppat_divisi,
                t.status as ltb_status,
                t.trackstatus as ltb_trackstatus,
                t.nama_pengirim as ltb_pengirim
            FROM ltb_1_terima_berkas_sspd t
            LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE t.trackstatus = 'Diolah' AND t.status = 'Diterima'
        `;

        const queryParams = [];
        let paramCount = 0;

        // Add search filter if provided
        if (search.trim()) {
            paramCount++;
            query += ` AND (
                t.no_registrasi ILIKE $${paramCount} OR 
                t.nobooking ILIKE $${paramCount} OR 
                vu.userid ILIKE $${paramCount} OR 
                vu.nama ILIKE $${paramCount} OR
                b.noppbb ILIKE $${paramCount} OR
                b.jenis_wajib_pajak ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
        }

        // Add ordering and pagination
        query += ` ORDER BY t.no_registrasi ASC, t.updated_at DESC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        console.log('🔍 [ADMIN] Executing query:', query);
        console.log('🔍 [ADMIN] Query params:', queryParams);

        const result = await pool.query(query, queryParams);
        const notifications = result.rows;

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT t.no_registrasi) as total
            FROM ltb_1_terima_berkas_sspd t
            LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE t.trackstatus = 'Diolah' AND t.status = 'Diterima'
        `;

        const countParams = [];
        if (search.trim()) {
            countQuery += ` AND (
                t.no_registrasi ILIKE $1 OR 
                t.nobooking ILIKE $1 OR 
                vu.userid ILIKE $1 OR 
                vu.nama ILIKE $1 OR
                b.noppbb ILIKE $1 OR
                b.jenis_wajib_pajak ILIKE $1
            )`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        // Format response
        const formattedNotifications = notifications.map(notif => ({
            no_registrasi: notif.no_registrasi,
            nobooking: notif.nobooking,
            userid: notif.userid,
            ppat_nama: notif.ppat_nama,
            ppat_divisi: notif.ppat_divisi,
            ppatk_khusus: notif.ppatk_khusus,
            jenis_wajib_pajak: notif.jenis_wajib_pajak,
            noppbb: notif.noppbb,
            ltb_status: notif.ltb_status,
            ltb_trackstatus: notif.ltb_trackstatus,
            ltb_pengirim: notif.ltb_pengirim,
            updated_at: notif.updated_at,
            // Additional fields for display
            special_field: notif.special_field || '-',
            updated: notif.updated_at ? 
                new Date(notif.updated_at).toLocaleDateString('id-ID') : 
                '-'
        }));

        console.log(`✅ [ADMIN] Found ${formattedNotifications.length} PPAT → LTB notifications (total: ${total})`);

        res.json({
            success: true,
            data: formattedNotifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            search: search
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT → LTB notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data notifikasi PPAT → LTB',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-ltb/:bookingId - Get detail notification
router.get('/ppat-ltb/:bookingId', verifyAdmin, async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        console.log(`🔍 [ADMIN] Fetching detail for PPAT → LTB notification: ${bookingId}`);

        const query = `
            SELECT DISTINCT ON (t.no_registrasi)
                t.no_registrasi,
                t.nobooking,
                t.updated_at,
                vu.special_field,
                vu.ppatk_khusus,
                b.noppbb,
                b.jenis_wajib_pajak,
                vu.userid,
                vu.nama as ppat_nama,
                vu.divisi as ppat_divisi,
                t.status as ltb_status,
                t.trackstatus as ltb_trackstatus,
                t.nama_pengirim as ltb_pengirim,
                t.catatan as ltb_catatan
            FROM ltb_1_terima_berkas_sspd t
            LEFT JOIN pat_1_bookingsspd b ON t.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE t.no_registrasi = $1 AND t.trackstatus = 'Diolah' AND t.status = 'Diterima'
        `;

        const result = await pool.query(query, [bookingId]);
        
        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Notifikasi tidak ditemukan'
            });
        }

        const notification = result.rows[0];
        
        console.log(`✅ [ADMIN] Found detail for notification: ${bookingId}`);

        res.json({
            success: true,
            data: {
                no_registrasi: notification.no_registrasi,
                nobooking: notification.nobooking,
                userid: notification.userid,
                ppat_nama: notification.ppat_nama,
                ppat_divisi: notification.ppat_divisi,
                ppatk_khusus: notification.ppatk_khusus,
                special_field: notification.special_field,
                jenis_wajib_pajak: notification.jenis_wajib_pajak,
                noppbb: notification.noppbb,
                ltb_status: notification.ltb_status,
                ltb_trackstatus: notification.ltb_trackstatus,
                ltb_pengirim: notification.ltb_pengirim,
                ltb_catatan: notification.ltb_catatan,
                updated_at: notification.updated_at
            }
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching notification detail:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail notifikasi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/stats - Get notification statistics
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Fetching notification warehouse statistics');

        // Get counts for each segment
        const queries = {
            ppat_ltb: `
                SELECT COUNT(*) as count
                FROM pat_1_bookingsspd b
                JOIN a_2_verified_users u ON b.userid = u.userid
                LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
                WHERE ltb.trackstatus = 'Diolah'
            `,
            ltb_lsb: `
                SELECT COUNT(*) as count
                FROM pat_1_bookingsspd b
                JOIN a_2_verified_users u ON b.userid = u.userid
                LEFT JOIN ltb_1_terima_berkas_sspd ltb ON b.nobooking = ltb.nobooking
                WHERE ltb.trackstatus = 'Diterima' AND ltb.status = 'Dilanjutkan'
            `,
            lsb_ppat: `
                SELECT COUNT(*) as count
                FROM pat_1_bookingsspd b
                JOIN a_2_verified_users u ON b.userid = u.userid
                LEFT JOIN lsb_1_serah_berkas lsb ON b.nobooking = lsb.nobooking
                WHERE lsb.status = 'Terselesaikan'
            `
        };

        const stats = {};
        for (const [key, query] of Object.entries(queries)) {
            const result = await pool.query(query);
            stats[key] = parseInt(result.rows[0].count);
        }

        console.log('✅ [ADMIN] Notification statistics:', stats);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching notification statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik notifikasi',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-users - Get PPAT/PPATS users data
router.get('/ppat-users', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        console.log(`🔍 [ADMIN] Fetching PPAT/PPATS users, page: ${page}, limit: ${limit}, search: "${search}", status: "${status}"`);

        // Query untuk mendapatkan data PPAT/PPATS users
        let query = `
            SELECT 
                id,
                nama,
                special_field,
                userid,
                divisi,
                status_ppat,
                ppatk_khusus,
                email,
                created_at,
                updated_at
            FROM a_2_verified_users
            WHERE divisi IN ('PPAT', 'PPATS')
        `;

        const queryParams = [];
        let paramCount = 0;

        // Add status filter if provided
        if (status.trim()) {
            paramCount++;
            query += ` AND status_ppat = $${paramCount}`;
            queryParams.push(status);
        }

        // Add search filter if provided
        if (search.trim()) {
            paramCount++;
            query += ` AND (
                nama ILIKE $${paramCount} OR 
                userid ILIKE $${paramCount} OR 
                special_field ILIKE $${paramCount} OR 
                email ILIKE $${paramCount} OR
                ppatk_khusus::text ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
        }

        // Add ordering and pagination
        query += ` ORDER BY updated_at DESC, created_at DESC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        console.log('🔍 [ADMIN] Executing PPAT users query:', query);
        console.log('🔍 [ADMIN] Query params:', queryParams);

        const result = await pool.query(query, queryParams);
        const users = result.rows;

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM a_2_verified_users
            WHERE divisi IN ('PPAT', 'PPATS')
        `;

        const countParams = [];
        if (status.trim()) {
            countQuery += ` AND status_ppat = $1`;
            countParams.push(status);
        }
        if (search.trim()) {
            const searchParamIndex = status.trim() ? 2 : 1;
            countQuery += ` AND (
                nama ILIKE $${searchParamIndex} OR 
                userid ILIKE $${searchParamIndex} OR 
                special_field ILIKE $${searchParamIndex} OR 
                email ILIKE $${searchParamIndex} OR
                ppatk_khusus::text ILIKE $${searchParamIndex}
            )`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        // Format response
        const formattedUsers = users.map(user => ({
            id: user.id,
            nama: user.nama,
            special_field: user.special_field || '-',
            userid: user.userid,
            divisi: user.divisi,
            status_ppat: user.status_ppat,
            ppatk_khusus: user.ppatk_khusus,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at,
            // Additional fields for display
            status: user.status_ppat === 'aktif' ? 'Aktif' : 
                   user.status_ppat === 'non-aktif' ? 'Nonaktif' : 
                   user.status_ppat || 'Unknown'
        }));

        console.log(`✅ [ADMIN] Found ${formattedUsers.length} PPAT/PPATS users (total: ${total})`);

        res.json({
            success: true,
            data: formattedUsers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            search: search,
            status: status
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT/PPATS users:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pengguna PPAT/PPATS',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-users/:userId - Get specific PPAT user detail
router.get('/ppat-users/:userId', verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log(`🔍 [ADMIN] Fetching detail for PPAT user: ${userId}`);

        const query = `
            SELECT 
                id,
                nama,
                special_field,
                userid,
                divisi,
                status_ppat,
                ppatk_khusus,
                email,
                created_at,
                updated_at
            FROM a_2_verified_users
            WHERE (id = $1 OR userid = $1) AND divisi IN ('PPAT', 'PPATS')
        `;

        const result = await pool.query(query, [userId]);
        
        if (!result.rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna PPAT/PPATS tidak ditemukan'
            });
        }

        const user = result.rows[0];
        
        console.log(`✅ [ADMIN] Found PPAT user detail: ${user.userid}`);

        res.json({
            success: true,
            data: {
                id: user.id,
                nama: user.nama,
                special_field: user.special_field || '-',
                userid: user.userid,
                divisi: user.divisi,
                status_ppat: user.status_ppat,
                ppatk_khusus: user.ppatk_khusus,
                email: user.email,
                created_at: user.created_at,
                updated_at: user.updated_at,
                status: user.status_ppat === 'aktif' ? 'Aktif' : 
                       user.status_ppat === 'non-aktif' ? 'Nonaktif' : 
                       user.status_ppat || 'Unknown'
            }
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT user detail:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail pengguna PPAT/PPATS',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-users-stats - Get PPAT users statistics
router.get('/ppat-users-stats', verifyAdmin, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Fetching PPAT/PPATS users statistics');

        // Get counts by status
        const statusQuery = `
            SELECT 
                status_ppat,
                COUNT(*) as count
            FROM a_2_verified_users
            WHERE divisi IN ('PPAT', 'PPATS')
            GROUP BY status_ppat
        `;

        const statusResult = await pool.query(statusQuery);
        const statusStats = {};
        statusResult.rows.forEach(row => {
            statusStats[row.status_ppat] = parseInt(row.count);
        });

        // Get counts by divisi
        const divisiQuery = `
            SELECT 
                divisi,
                COUNT(*) as count
            FROM a_2_verified_users
            WHERE divisi IN ('PPAT', 'PPATS')
            GROUP BY divisi
        `;

        const divisiResult = await pool.query(divisiQuery);
        const divisiStats = {};
        divisiResult.rows.forEach(row => {
            divisiStats[row.divisi] = parseInt(row.count);
        });

        // Get total count
        const totalResult = await pool.query(`
            SELECT COUNT(*) as total
            FROM a_2_verified_users
            WHERE divisi IN ('PPAT', 'PPATS')
        `);
        const total = parseInt(totalResult.rows[0].total);

        const stats = {
            total,
            by_status: statusStats,
            by_divisi: divisiStats
        };

        console.log('✅ [ADMIN] PPAT/PPATS users statistics:', stats);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT users statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik pengguna PPAT/PPATS',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
