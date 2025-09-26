// backend/endpoint_notifications/notification_model.js
import { pool } from '../../../db.js';

export const createNotification = async (notificationData) => {
    try {
    const query = `
        INSERT INTO sys_notifications 
        (recipient_id, recipient_divisi, title, message, booking_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const values = [
        notificationData.recipient_id,
        notificationData.recipient_divisi,
        notificationData.title,
        notificationData.message,
        notificationData.booking_id
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
        FROM sys_notifications n
        JOIN pat_1_bookingsspd b ON n.booking_id = b.bookingid
        WHERE n.recipient_id = $1 AND n.is_read = FALSE
        ORDER BY n.created_at DESC
        LIMIT 10
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

export const markAsRead = async (notificationId) => {
    const query = `
        UPDATE sys_notifications 
        SET is_read = TRUE 
        WHERE id = $1
    `;
    await pool.query(query, [notificationId]);
};

// Mark all unread notifications for a specific recipient and booking as read
export const markAsReadByRecipientAndBooking = async (recipientId, bookingId) => {
    try {
        const query = `
            UPDATE sys_notifications
            SET is_read = TRUE
            WHERE recipient_id = $1 AND booking_id = $2 AND is_read = FALSE
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
            UPDATE sys_notifications n
            SET is_read = TRUE
            WHERE n.booking_id = $2
              AND n.is_read = FALSE
              AND n.recipient_id IN (
                  SELECT id FROM a_2_verified_users WHERE lower(divisi) = lower($1)
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