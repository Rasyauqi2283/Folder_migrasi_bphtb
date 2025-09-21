// backend/endpoint_notifications/notification_routes.js
import express from 'express';
import * as notificationModel from './notification_model.js';
import { addPollingConnection, removePollingConnection } from './notification_poller.js';
import { pool } from '../../../db.js';

const router = express.Router();

// Helper: resolve numeric user id from either numeric id or string userid
async function resolveUserId(userIdRaw) {
    const value = String(userIdRaw || '').trim();
    if (!value) return null;
    if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
    }
    try {
        const result = await pool.query('SELECT * FROM a_2_verified_users WHERE userid = $1 LIMIT 1', [value]);
        return result.rows[0]?.id || null;
    } catch (e) {
        console.error('resolveUserId error:', e);
        return null;
    }
}

// Long polling endpoint
router.get('/poll', async (req, res) => {
    try {
        const userIdRaw = (req.user && (req.user.id || req.user.userid)) || req.query.user_id;
        const userDivisi = (req.user && req.user.divisi) || req.query.divisi;
        const userIdResolved = await resolveUserId(userIdRaw);

        if (!userIdResolved) {
            return res.status(400).json({ success: false, error: 'Missing or invalid user_id' });
        }
        
        // Cek notifikasi unread
        const unreadNotifications = await notificationModel.getUnreadNotifications(userIdResolved);

        // Derive type/badge/target for better UX without changing DB schema
        function derive(meta) {
            const title = String(meta.title || '');
            const message = String(meta.message || '');
            const text = (title + ' ' + message).toLowerCase();
            let _type = '';
            if (/(paraf|kasie)/.test(text)) _type = 'paraf_kasie';
            else if (/(siap dicek|verifikasi)/.test(text)) _type = 'verifikasi';
            const isPeneliti = String(userDivisi || '').toLowerCase() === 'peneliti';
            let _badge_label = '';
            let _badge_class = '';
            let _target_href = '';
            if (isPeneliti) {
                if (_type === 'paraf_kasie') {
                    _badge_label = 'Paraf Kasie';
                    _badge_class = 'notif-badge--paraf';
                    _target_href = '/Peneliti/ParafKasie-sspd/paraf-kasie.html';
                } else if (_type === 'verifikasi') {
                    _badge_label = 'Verifikasi';
                    _badge_class = 'notif-badge--verifikasi';
                    _target_href = '/Peneliti/Verifikasi_sspd/verifikasi-data.html';
                }
            }
            return { _type, _badge_label, _badge_class, _target_href };
        }
        
        if (unreadNotifications.length > 0) {
            // Filter berdasarkan status terkini per divisi (sesuai konteks)
            async function filterByCurrentStatus(notifs) {
                // Kelompokkan nobooking per divisi
                const ltb = new Set();
                const peneliti = new Set();
                const penelitiValidasi = new Set();
                const lsb = new Set();
                const administrator = new Set();
                for (const n of notifs) {
                    const nb = n.nobooking;
                    const div = String(n.recipient_divisi || '').toLowerCase();
                    if (!nb) continue;
                    if (div === 'ltb' || div === 'loket terima berkas') ltb.add(nb);
                    else if (div === 'peneliti') peneliti.add(nb);
                    else if (div === 'peneliti validasi') penelitiValidasi.add(nb);
                    else if (div === 'lsb' || div === 'loket serah berkas') lsb.add(nb);
                    else if (div === 'administrator' || div === 'admin') administrator.add(nb);
                }
                const okLtb = new Set();
                const okPen = new Set();
                const okPv = new Set();
                const okLsb = new Set();
                const okBank = new Set();
                try {
                    if (ltb.size) {
                        const { rows } = await pool.query(
                            `SELECT nobooking FROM ltb_1_terima_berkas_sspd 
                             WHERE nobooking = ANY($1::text[]) 
                               AND COALESCE(status,'Diajukan') IN ('Diajukan','Dilanjutkan','Diterima','Diolah')`,
                            [Array.from(ltb)]
                        );
                        rows.forEach(r => okLtb.add(r.nobooking));
                    }
                    if (peneliti.size) {
                        const { rows } = await pool.query(
                            `SELECT nobooking FROM p_1_verifikasi 
                             WHERE nobooking = ANY($1::text[]) 
                               AND COALESCE(status,'Diajukan') IN ('Diajukan','Dianalisis','Diolah')`,
                            [Array.from(peneliti)]
                        );
                        rows.forEach(r => okPen.add(r.nobooking));
                    }
                    // BANK gating untuk Peneliti & Administrator: harus Disetujui & Tercheck
                    if (peneliti.size || administrator.size) {
                        const union = Array.from(new Set([ ...peneliti, ...administrator ]));
                        if (union.length) {
                            const { rows } = await pool.query(
                                `SELECT nobooking FROM bank_1_cek_hasil_transaksi 
                                 WHERE nobooking = ANY($1::text[])
                                   AND COALESCE(status_verifikasi,'Pending') = 'Disetujui'
                                   AND COALESCE(status_dibank,'Dicheck') = 'Tercheck'`,
                                [union]
                            );
                            rows.forEach(r => okBank.add(r.nobooking));
                        }
                    }
                    if (penelitiValidasi.size) {
                        const { rows } = await pool.query(
                            `SELECT nobooking FROM pv_1_paraf_validate 
                             WHERE nobooking = ANY($1::text[]) 
                               AND COALESCE(status,'Dianalisis') IN ('Dianalisis','Disetujui') 
                               AND COALESCE(trackstatus,'Terverifikasi') IN ('Terverifikasi')`,
                            [Array.from(penelitiValidasi)]
                        );
                        rows.forEach(r => okPv.add(r.nobooking));
                    }
                    if (lsb.size) {
                        const { rows } = await pool.query(
                            `SELECT nobooking FROM lsb_1_serah_berkas WHERE nobooking = ANY($1::text[]) AND status = 'Terselesaikan'`,
                            [Array.from(lsb)]
                        );
                        rows.forEach(r => okLsb.add(r.nobooking));
                    }
                } catch (e) {
                    // Jika query gagal, jangan filter agresif agar notifikasi tetap muncul
                    return notifs;
                }
                return notifs.filter(n => {
                    const div = String(n.recipient_divisi || '').toLowerCase();
                    const nb = n.nobooking;
                    if (!nb) return true;
                    if (div === 'ltb' || div === 'loket terima berkas') return okLtb.has(nb);
                    if (div === 'peneliti') {
                        const titleLower = String(n.title || '').toLowerCase();
                        const isProcessedNotif = titleLower.startsWith('booking siap dicek');
                        // Untuk notifikasi processed (Siap Dicek), wajib lolos gate BANK
                        if (isProcessedNotif) return okPen.has(nb) && okBank.has(nb);
                        return okPen.has(nb);
                    }
                    if (div === 'administrator' || div === 'admin') {
                        const textLower = (String(n.title||'') + ' ' + String(n.message||'')).toLowerCase();
                        const isStage1 = /booking baru|ppat|ltb|bank/.test(textLower);
                        const isStage2 = /siap dicek|ke peneliti|paraf kasie|verifikasi/.test(textLower);
                        const isStage3 = /terverifikasi|lsb|selesai|diserahkan/.test(textLower);
                        if (isStage1) return true; // selalu tampil
                        if (isStage2) return okBank.has(nb); // butuh gate bank (double-clear)
                        if (isStage3) return true; // akhir selalu tampil
                        return true;
                    }
                    if (div === 'peneliti validasi') return okPv.has(nb);
                    if (div === 'lsb' || div === 'loket serah berkas') return okLsb.has(nb);
                    return true;
                });
            }

            const enrichedRaw = unreadNotifications.map(n => ({ ...n, ...derive(n) }));
            const enriched = await filterByCurrentStatus(enrichedRaw);
            return res.json({
                success: true,
                notifications: enriched,
                total_unread: enriched.length
            });
        }
        
        // Long polling setup
        const timeout = setTimeout(() => {
            removePollingConnection(userIdResolved);
            res.json({ success: true, notifications: [], total_unread: 0 });
        }, 25000);
        
        addPollingConnection(userIdResolved, { res, timeout, divisi: userDivisi, createdAt: Date.now() });
        
        req.on('close', () => {
            removePollingConnection(userIdResolved);
        });
        
    } catch (error) {
        console.error('Polling error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Tandai notifikasi sebagai dibaca
router.post('/mark-read', async (req, res) => {
    try {
        const { notification_id, booking_id, user_id } = req.body;
        if (notification_id) {
            await notificationModel.markAsRead(notification_id);
            return res.json({ success: true });
        }
        if (booking_id && user_id) {
            // Mark all for this user + booking as read (dedup cleanup)
            const resolved = await resolveUserId(user_id);
            if (!resolved) return res.status(400).json({ success:false, error:'Invalid user_id' });
            await notificationModel.markAsReadByRecipientAndBooking(resolved, booking_id);
            return res.json({ success: true });
        }
        res.status(400).json({ success: false, error: 'Missing parameters' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Dapatkan riwayat notifikasi
router.get('/history', async (req, res) => {
    try {
        const userIdRaw = (req.user && (req.user.id || req.user.userid)) || req.query.user_id;
        const userId = await resolveUserId(userIdRaw);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        const query = `
            SELECT n.*, b.nobooking, b.namawajibpajak 
            FROM sys_notifications n
            JOIN pat_1_bookingsspd b ON n.booking_id = b.bookingid
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [userId, limit, offset]);
        const enriched = result.rows.map(n => {
            const title = String(n.title || '');
            const message = String(n.message || '');
            const text = (title + ' ' + message).toLowerCase();
            let _type = '';
            if (/(paraf|kasie)/.test(text)) _type = 'paraf_kasie';
            else if (/(siap dicek|verifikasi)/.test(text)) _type = 'verifikasi';
            const isPeneliti = String(req.query.divisi || '').toLowerCase() === 'peneliti';
            let _badge_label = '';
            let _badge_class = '';
            let _target_href = '';
            if (isPeneliti) {
                if (_type === 'paraf_kasie') {
                    _badge_label = 'Paraf Kasie';
                    _badge_class = 'notif-badge--paraf';
                    _target_href = '/Peneliti/ParafKasie-sspd/paraf-kasie.html';
                } else if (_type === 'verifikasi') {
                    _badge_label = 'Verifikasi';
                    _badge_class = 'notif-badge--verifikasi';
                    _target_href = '/Peneliti/Verifikasi_sspd/verifikasi-data.html';
                }
            }
            return { ...n, _type, _badge_label, _badge_class, _target_href };
        });
        res.json({ success: true, notifications: enriched });
        
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;