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
                t.trackstatus as ltb_trackstatus
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
        console.log('🔍 [ADMIN] PPAT-LTB query result rows:', result.rows.length);
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
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data notifikasi PPAT → LTB',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        console.log('🔍 [ADMIN] Query result rows:', result.rows.length);
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
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pengguna PPAT/PPATS',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

// GET /api/admin/notification-warehouse/ltb-lsb - Get LTB → LSB notifications
router.get('/peneliti-lsb', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        console.log(`🔍 [ADMIN] Fetching Peneliti → LSB notifications, page: ${page}, limit: ${limit}, search: "${search}"`);

        // Query untuk mendapatkan data alur peneliti yang benar:
        // p_1_verifikasi → p_3_clear_to_paraf → pv_1_paraf_validate
        let query = `
            SELECT DISTINCT ON (pv1.nobooking)
                pv1.nobooking,
                pv1.no_registrasi,
                vu.special_field,
                vu.ppatk_khusus,
                b.noppbb,
                b.jenis_wajib_pajak,
                vu.userid,
                vu.nama as ppat_nama,
                vu.divisi as ppat_divisi,
                -- Status dari p_1_verifikasi
                pv1.status as p_verifikasi_status,
                pv1.trackstatus as p_verifikasi_trackstatus,
                pv1.pemberi_persetujuan as p_verifikasi_pemberi,
                COALESCE(pv1.updated_at, pv1.created_at) as p_verifikasi_updated,
                -- Status dari p_3_clear_to_paraf
                p3.status as p_clear_status,
                p3.trackstatus as p_clear_trackstatus,
                p3.pemverifikasi as p_clear_pemverifikasi,
                p3.updated_at as p_clear_updated,
                -- Status dari pv_1_paraf_validate
                pv1_val.status as pv_validasi_status,
                pv1_val.trackstatus as pv_validasi_trackstatus,
                pv1_val.pemverifikasi as pv_validasi_pemverifikasi,
                pv1_val.pemparaf as pv_validasi_pemparaf,
                pv1_val.updated_at as pv_validasi_updated
            FROM p_1_verifikasi pv1
            LEFT JOIN pat_1_bookingsspd b ON pv1.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            LEFT JOIN p_3_clear_to_paraf p3 ON pv1.nobooking = p3.nobooking
            LEFT JOIN pv_1_paraf_validate pv1_val ON pv1.nobooking = pv1_val.nobooking
            WHERE pv1.status IS NOT NULL
        `;

        const queryParams = [];
        let paramCount = 0;

        // Add search filter if provided
        if (search.trim()) {
            paramCount++;
            query += ` AND (
                pv1.no_registrasi ILIKE $${paramCount} OR 
                pv1.nobooking ILIKE $${paramCount} OR 
                vu.userid ILIKE $${paramCount} OR 
                vu.nama ILIKE $${paramCount} OR
                b.noppbb ILIKE $${paramCount} OR
                b.jenis_wajib_pajak ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
        }

        // Add ordering and pagination - ORDER BY harus match dengan DISTINCT ON
        query += ` ORDER BY pv1.nobooking ASC, COALESCE(pv1.updated_at, pv1.created_at) DESC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        console.log('🔍 [ADMIN] Executing Peneliti-LSB query:', query);
        console.log('🔍 [ADMIN] Query params:', queryParams);

        const result = await pool.query(query, queryParams);
        console.log('🔍 [ADMIN] Peneliti-LSB query result rows:', result.rows.length);
        const notifications = result.rows;

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT pv1.nobooking) as total
            FROM p_1_verifikasi pv1
            LEFT JOIN pat_1_bookingsspd b ON pv1.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            LEFT JOIN p_3_clear_to_paraf p3 ON pv1.nobooking = p3.nobooking
            LEFT JOIN pv_1_paraf_validate pv1_val ON pv1.nobooking = pv1_val.nobooking
            WHERE pv1.status IS NOT NULL
        `;

        const countParams = [];
        if (search.trim()) {
            countQuery += ` AND (
                pv1.no_registrasi ILIKE $1 OR 
                pv1.nobooking ILIKE $1 OR 
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
            // Status dari p_1_verifikasi
            p_verifikasi_status: notif.p_verifikasi_status,
            p_verifikasi_trackstatus: notif.p_verifikasi_trackstatus,
            p_verifikasi_pemberi: notif.p_verifikasi_pemberi,
            p_verifikasi_updated: notif.p_verifikasi_updated,
            // Status dari p_3_clear_to_paraf
            p_clear_status: notif.p_clear_status,
            p_clear_trackstatus: notif.p_clear_trackstatus,
            p_clear_pemverifikasi: notif.p_clear_pemverifikasi,
            p_clear_updated: notif.p_clear_updated,
            // Status dari pv_1_paraf_validate
            pv_validasi_status: notif.pv_validasi_status,
            pv_validasi_trackstatus: notif.pv_validasi_trackstatus,
            pv_validasi_pemverifikasi: notif.pv_validasi_pemverifikasi,
            pv_validasi_pemparaf: notif.pv_validasi_pemparaf,
            pv_validasi_updated: notif.pv_validasi_updated,
            updated_at: notif.updated_at,
            // Additional fields for display
            special_field: notif.special_field || '-',
            updated: notif.updated_at ? 
                new Date(notif.updated_at).toLocaleDateString('id-ID') : 
                '-'
        }));

        console.log(`✅ [ADMIN] Found ${formattedNotifications.length} Peneliti → LSB notifications (total: ${total})`);

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
        console.error('❌ [ADMIN] Error fetching Peneliti → LSB notifications:', error);
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data notifikasi Peneliti → LSB',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/lsb-ppat - Get LSB → PPAT notifications
router.get('/lsb-ppat', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        console.log(`🔍 [ADMIN] Fetching LSB → PPAT notifications, page: ${page}, limit: ${limit}, search: "${search}"`);

        // Query untuk mendapatkan data LSB → PPAT dengan status terselesaikan
        let query = `
            SELECT DISTINCT ON (lsb.no_registrasi)
                lsb.no_registrasi,
                lsb.nobooking,
                lsb.updated_at,
                vu.special_field,
                vu.ppatk_khusus,
                b.noppbb,
                b.jenis_wajib_pajak,
                vu.userid,
                vu.nama as ppat_nama,
                vu.divisi as ppat_divisi,
                lsb.status as lsb_status,
                lsb.trackstatus as lsb_trackstatus
            FROM lsb_1_serah_berkas lsb
            LEFT JOIN pat_1_bookingsspd b ON lsb.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE lsb.status = 'Terselesaikan'
        `;

        const queryParams = [];
        let paramCount = 0;

        // Add search filter if provided
        if (search.trim()) {
            paramCount++;
            query += ` AND (
                lsb.no_registrasi ILIKE $${paramCount} OR 
                lsb.nobooking ILIKE $${paramCount} OR 
                vu.userid ILIKE $${paramCount} OR 
                vu.nama ILIKE $${paramCount} OR
                b.noppbb ILIKE $${paramCount} OR
                b.jenis_wajib_pajak ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
        }

        // Add ordering and pagination
        query += ` ORDER BY lsb.no_registrasi ASC, lsb.updated_at DESC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        console.log('🔍 [ADMIN] Executing LSB-PPAT query:', query);
        console.log('🔍 [ADMIN] Query params:', queryParams);

        const result = await pool.query(query, queryParams);
        console.log('🔍 [ADMIN] LSB-PPAT query result rows:', result.rows.length);
        const notifications = result.rows;

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT lsb.no_registrasi) as total
            FROM lsb_1_serah_berkas lsb
            LEFT JOIN pat_1_bookingsspd b ON lsb.nobooking = b.nobooking
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE lsb.status = 'Terselesaikan'
        `;

        const countParams = [];
        if (search.trim()) {
            countQuery += ` AND (
                lsb.no_registrasi ILIKE $1 OR 
                lsb.nobooking ILIKE $1 OR 
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
            lsb_status: notif.lsb_status,
            lsb_trackstatus: notif.lsb_trackstatus,
            lsb_penerima: notif.lsb_penerima,
            lsb_tanggal_serah: notif.lsb_tanggal_serah,
            updated_at: notif.updated_at,
            // Additional fields for display
            special_field: notif.special_field || '-',
            updated: notif.updated_at ? 
                new Date(notif.updated_at).toLocaleDateString('id-ID') : 
                '-'
        }));

        console.log(`✅ [ADMIN] Found ${formattedNotifications.length} LSB → PPAT notifications (total: ${total})`);

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
        console.error('❌ [ADMIN] Error fetching LSB → PPAT notifications:', error);
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data notifikasi LSB → PPAT',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-renewal - Get PPAT renewal data with filters
router.get('/ppat-renewal', verifyAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const jangkaWaktu = req.query.jangka_waktu || '6'; // 6 or 12 months
        const tahun = req.query.tahun || new Date().getFullYear();
        const offset = (page - 1) * limit;

        console.log(`🔍 [ADMIN] Fetching PPAT renewal data, page: ${page}, limit: ${limit}, search: "${search}", jangka_waktu: ${jangkaWaktu}, tahun: ${tahun}`);

        // Calculate date range based on jangka_waktu
        const startDate = new Date(tahun, 0, 1); // January 1st of selected year
        const endDate = new Date(tahun, 11, 31); // December 31st of selected year
        
        if (jangkaWaktu === '6') {
            // Last 6 months from current date or last 6 months of selected year
            const currentDate = new Date();
            if (tahun == currentDate.getFullYear()) {
                startDate.setMonth(currentDate.getMonth() - 5);
                startDate.setDate(1);
            } else {
                startDate.setMonth(6); // July 1st
            }
        }

        console.log(`🔍 [ADMIN] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // Query untuk mendapatkan data PPAT renewal dengan filter
        let query = `
            SELECT 
                b.nobooking,
                b.userid,
                b.ppatk_khusus,
                b.nilai_bphtb,
                b.tanggal_booking,
                b.status,
                b.trackstatus,
                vu.nama as user_nama,
                vu.divisi,
                vu.special_field
            FROM pat_1_bookingsspd b
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE b.status = 'Diserahkan'
            AND b.tanggal_booking >= $1
            AND b.tanggal_booking <= $2
        `;

        const queryParams = [startDate.toISOString(), endDate.toISOString()];
        let paramCount = 2;

        // Add search filter if provided
        if (search.trim()) {
            paramCount++;
            query += ` AND (
                b.nobooking ILIKE $${paramCount} OR 
                b.userid ILIKE $${paramCount} OR 
                b.ppatk_khusus ILIKE $${paramCount} OR
                vu.nama ILIKE $${paramCount} OR
                vu.special_field ILIKE $${paramCount}
            )`;
            queryParams.push(`%${search}%`);
        }

        // Add ordering and pagination
        query += ` ORDER BY b.nobooking ASC, b.tanggal_booking DESC`;
        
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        queryParams.push(limit);
        
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        queryParams.push(offset);

        console.log('🔍 [ADMIN] Executing PPAT renewal query:', query);
        console.log('🔍 [ADMIN] Query params:', queryParams);

        const result = await pool.query(query, queryParams);
        console.log('🔍 [ADMIN] PPAT renewal query result rows:', result.rows.length);
        const bookings = result.rows;

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(b.nobooking) as total
            FROM pat_1_bookingsspd b
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE b.status = 'Diserahkan'
            AND b.tanggal_booking >= $1
            AND b.tanggal_booking <= $2
        `;

        const countParams = [startDate.toISOString(), endDate.toISOString()];
        if (search.trim()) {
            countQuery += ` AND (
                b.nobooking ILIKE $3 OR 
                b.userid ILIKE $3 OR 
                b.ppatk_khusus ILIKE $3 OR
                vu.nama ILIKE $3 OR
                vu.special_field ILIKE $3
            )`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        // Calculate total nilai bphtb for the filtered data
        let sumQuery = `
            SELECT COALESCE(SUM(b.nilai_bphtb), 0) as total_bphtb
            FROM pat_1_bookingsspd b
            LEFT JOIN a_2_verified_users vu ON b.userid = vu.userid
            WHERE b.status = 'Diserahkan'
            AND b.tanggal_booking >= $1
            AND b.tanggal_booking <= $2
        `;

        const sumParams = [startDate.toISOString(), endDate.toISOString()];
        if (search.trim()) {
            sumQuery += ` AND (
                b.nobooking ILIKE $3 OR 
                b.userid ILIKE $3 OR 
                b.ppatk_khusus ILIKE $3 OR
                vu.nama ILIKE $3 OR
                vu.special_field ILIKE $3
            )`;
            sumParams.push(`%${search}%`);
        }

        const sumResult = await pool.query(sumQuery, sumParams);
        const totalBphtb = parseFloat(sumResult.rows[0].total_bphtb || 0);

        // Format response
        const formattedBookings = bookings.map(booking => ({
            nobooking: booking.nobooking,
            userid: booking.userid,
            ppatk_khusus: booking.ppatk_khusus || '-',
            nilai_bphtb: booking.nilai_bphtb || 0,
            tanggal_booking: booking.tanggal_booking,
            status: booking.status,
            trackstatus: booking.trackstatus,
            user_nama: booking.user_nama || '-',
            divisi: booking.divisi || '-',
            special_field: booking.special_field || '-',
            // Formatted values for display
            nilai_formatted: booking.nilai_bphtb ? 
                `Rp ${Number(booking.nilai_bphtb).toLocaleString('id-ID')}` : 
                'Rp 0',
            tanggal_formatted: booking.tanggal_booking ? 
                new Date(booking.tanggal_booking).toLocaleDateString('id-ID') : 
                '-'
        }));

        console.log(`✅ [ADMIN] Found ${formattedBookings.length} PPAT renewal bookings (total: ${total})`);

        res.json({
            success: true,
            data: formattedBookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            summary: {
                total_bphtb: totalBphtb,
                total_bphtb_formatted: `Rp ${totalBphtb.toLocaleString('id-ID')}`,
                jangka_waktu: jangkaWaktu,
                tahun: tahun,
                date_range: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString()
                }
            },
            search: search
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT renewal data:', error);
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pemutakhiran PPAT',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET /api/admin/notification-warehouse/test - Test endpoint untuk debugging
router.get('/test', verifyAdmin, async (req, res) => {
    try {
        console.log('🔍 [ADMIN] Testing database connection...');
        
        // Test basic connection
        const testQuery = await pool.query('SELECT NOW() as current_time');
        console.log('✅ [ADMIN] Database connection OK:', testQuery.rows[0]);
        
        // Test table existence
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('ltb_1_terima_berkas_sspd', 'pat_1_bookingsspd', 'a_2_verified_users')
        `);
        console.log('🔍 [ADMIN] Available tables:', tableCheck.rows);
        
        // Test simple query
        const simpleQuery = await pool.query('SELECT COUNT(*) as count FROM a_2_verified_users WHERE divisi IN (\'PPAT\', \'PPATS\')');
        console.log('🔍 [ADMIN] PPAT/PPATS users count:', simpleQuery.rows[0]);
        
        res.json({
            success: true,
            message: 'Database test successful',
            data: {
                current_time: testQuery.rows[0].current_time,
                available_tables: tableCheck.rows,
                ppat_users_count: simpleQuery.rows[0].count
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Database test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: error.message,
            stack: error.stack
        });
    }
});

// GET /api/admin/notification-warehouse/ppat-chart-data - Get chart data for PPAT renewal based on booking completion dates
router.get('/ppat-chart-data', verifyAdmin, async (req, res) => {
    try {
        const tahun = req.query.tahun || new Date().getFullYear();
        
        console.log(`🔍 [ADMIN] Fetching PPAT chart data for year: ${tahun}`);

        // Query untuk mendapatkan data chart berdasarkan bulan penyelesaian
        const query = `
            SELECT 
                EXTRACT(MONTH FROM b.tanggal_booking) as bulan,
                COUNT(b.nobooking) as jumlah_transaksi,
                COALESCE(SUM(b.nilai_bphtb), 0) as total_bphtb
            FROM pat_1_bookingsspd b
            WHERE b.status = 'Diserahkan'
            AND EXTRACT(YEAR FROM b.tanggal_booking) = $1
            GROUP BY EXTRACT(MONTH FROM b.tanggal_booking)
            ORDER BY bulan ASC
        `;

        const result = await pool.query(query, [tahun]);
        
        // Initialize data for all 12 months
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthName: new Date(tahun, i).toLocaleDateString('id-ID', { month: 'short' }),
            jumlah_transaksi: 0,
            total_bphtb: 0
        }));

        // Fill in actual data
        result.rows.forEach(row => {
            const monthIndex = row.bulan - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyData[monthIndex].jumlah_transaksi = parseInt(row.jumlah_transaksi);
                monthlyData[monthIndex].total_bphtb = parseFloat(row.total_bphtb || 0);
            }
        });

        console.log(`✅ [ADMIN] Found chart data for ${tahun}:`, monthlyData);

        res.json({
            success: true,
            data: monthlyData,
            tahun: tahun,
            summary: {
                total_transaksi: monthlyData.reduce((sum, month) => sum + month.jumlah_transaksi, 0),
                total_bphtb: monthlyData.reduce((sum, month) => sum + month.total_bphtb, 0),
                total_bphtb_formatted: `Rp ${monthlyData.reduce((sum, month) => sum + month.total_bphtb, 0).toLocaleString('id-ID')}`
            }
        });

    } catch (error) {
        console.error('❌ [ADMIN] Error fetching PPAT chart data:', error);
        console.error('❌ [ADMIN] Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data chart PPAT',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;
