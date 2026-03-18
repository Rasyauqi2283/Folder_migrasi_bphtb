// backend/endpoint_notifications/notification_model.js
import { pool } from '../../../db.js';

export const createNotification = async (notificationData) => {
    try {
    const query = `
        INSERT INTO notifications 
        (userid, nobooking, title, message, type, is_read)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    const values = [
        notificationData.userid,
        notificationData.nobooking,
        notificationData.title,
        notificationData.message,
        notificationData.type || 'info',
        notificationData.is_read || false
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const getUnreadNotifications = async (userId) => {
    const query = `
        SELECT n.*, b.nobooking, b.namawajibpajak 
        FROM notifications n
        LEFT JOIN pat_1_bookingsspd b ON n.nobooking = b.nobooking
        WHERE n.userid = $1 AND n.is_read = FALSE
        ORDER BY n.created_at DESC
        LIMIT 10
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const markAsRead = async (notificationId) => {
    const query = `
        UPDATE notifications 
        SET is_read = TRUE 
        WHERE id = $1
    `;
    await pool.query(query, [notificationId]);
};

// Mark all unread notifications for a specific recipient and booking as read
export const markAsReadByRecipientAndBooking = async (recipientId, bookingId) => {
    try {
        const query = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE userid = $1 AND nobooking = $2 AND is_read = FALSE
        `;
        await pool.query(query, [recipientId, bookingId]);
        return true;
    } catch (e) {
        console.error('Error markAsReadByRecipientAndBooking:', e);
        return false;
    }
};

export const markAsReadByDivisiAndBooking = async (divisi, bookingId) => {
    try {
        const query = `
            UPDATE notifications n
            SET is_read = TRUE
            WHERE n.nobooking = $2
              AND n.is_read = FALSE
              AND n.userid IN (
                  SELECT userid FROM a_2_verified_users WHERE lower(divisi) = lower($1)
              )
        `;
        await pool.query(query, [divisi, bookingId]);
        return true;
    } catch (e) {
        console.error('Error markAsReadByDivisiAndBooking:', e);
        return false;
    }
};

export const getUsersByDivisi = async (divisi) => {
    // Normalisasi + sinonim umum agar tidak sensitif huruf/variasi penamaan
    const raw = String(divisi || '').trim().toLowerCase();
    const synonyms = new Set([raw]);
    if (raw === 'ltb' || raw === 'loket terima berkas') {
        synonyms.add('ltb');
        synonyms.add('loket terima berkas');
    }
    if (raw === 'lsb' || raw === 'loket serah berkas') {
        synonyms.add('lsb');
        synonyms.add('loket serah berkas');
    }
    if (raw === 'admin' || raw === 'administrator') {
        synonyms.add('administrator');
    }
    // Gunakan ANY(array) supaya parameter tetap aman
    const query = `
        SELECT id, nama, divisi, userid
        FROM a_2_verified_users
        WHERE lower(divisi) = ANY($1::text[])
    `;
    const result = await pool.query(query, [[...synonyms]]);
    return result.rows;
};

// Helper untuk memetakan divisi ke set user id; fallback jika tidak ada user
export const getAnyUserIdByDivisi = async (divisi) => {
    const users = await getUsersByDivisi(divisi);
    if (users.length > 0) return users[0].id;
    return null;
};