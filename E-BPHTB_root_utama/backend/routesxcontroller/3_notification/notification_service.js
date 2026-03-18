// backend/endpoint_notifications/notification_service.js
import * as notificationModel from './notification_model.js';
import { sendToPollingClients } from './notification_poller.js';
import { pool } from '../../../db.js';
// (no cross-imports here; helper wrappers live in separate modules)

// Helper function untuk mendapatkan detail booking
async function getBookingDetail(bookingId) {
    const query = `
        SELECT 
            b.*, 
            u.special_field AS ppat_nama, 
            u.divisi AS ppat_divisi, 
                u.ppat_khusus,
            v.nama_pengirim
        FROM pat_1_bookingsspd b
        JOIN a_2_verified_users u ON b.userid = u.userid
        LEFT JOIN p_1_verifikasi v ON b.nobooking = v.nobooking
        WHERE b.bookingid = $1
    `;

    const result = await pool.query(query, [bookingId]);
    return result.rows[0];
}

// Helper function untuk mendapatkan detail user
async function getUserDetail(userId) {
    const val = String(userId || '').trim();
    let result;
    if (/^\d+$/.test(val)) {
        result = await pool.query(
            `SELECT id, userid, nama, divisi, ppat_khusus FROM a_2_verified_users WHERE id = $1`,
            [parseInt(val, 10)]
        );
    } else {
        result = await pool.query(
            `SELECT id, userid, nama, divisi, ppat_khusus FROM a_2_verified_users WHERE userid = $1`,
            [val]
        );
    }
    return result.rows[0];
}

// Function utama untuk trigger notifikasi berdasarkan status booking
export const triggerNotificationByStatus = async (bookingId, newStatus, performedByUserId) => {
    try {
        const booking = await getBookingDetail(bookingId);
        const performedByUser = await getUserDetail(performedByUserId);
        // Resolve numeric id untuk pemilik booking (PPAT/PPATS)
        let bookingOwnerId = null;
        try {
            const owner = await getUserDetail(booking.userid);
            bookingOwnerId = owner?.id || null;
        } catch (_) { bookingOwnerId = null; }
        
        let notifications = [];
        
        switch(newStatus) {
            case 'pending_ltb': // Booking baru dibuat oleh PPAT (1)
                notifications = [
                    {
                        recipient_divisi: 'Administrator',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama}, Jenis: ${booking.jenis_wajib_pajak}, WP: ${booking.namawajibpajak}, No. PPAT: ${booking.ppat_khusus}`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'LTB',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama} (${booking.ppat_khusus}) perlu verifikasi awal - WP: ${booking.namawajibpajak}`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'BANK',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama} (${booking.ppat_khusus}) memerlukan pengecekan transaksi di BANK - WP: ${booking.namawajibpajak}`,
                        booking_id: bookingId
                    }
                ];
                break;
                            
            case 'processed_ltb': // LTB sudah memproses (2)
                notifications = [
                    {
                        recipient_divisi: 'Peneliti',
                        title: `Booking Siap Dicek: ${booking.nobooking}`,
                        message: `Booking ${booking.nobooking} dari ${booking.ppat_nama} sudah difilter LTB (yang dikirim oleh ${booking.nama_pengirim}) dan siap untuk pengecekan menyeluruh`,
                        nama_pengirim: booking.nama_pengirim,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'Administrator',
                        title: `Booking ke Peneliti: ${booking.nobooking}`,
                        message: `Booking ${booking.nobooking} telah dikirim LTB ke Peneliti untuk pengecekan menyeluruh`,
                        nama_pengirim: booking.nama_pengirim,
                        booking_id: bookingId
                    }
                ];
                break;

            case 'to_paraf_kasie': // Verifikasi -> Paraf Kasie (3)
                notifications = [
                    {
                        recipient_divisi: 'Peneliti',
                        title: `Paraf Kasie: ${booking.nobooking}`,
                        message: `Booking ${booking.nobooking} dari ${booking.ppat_nama} siap diparaf Kasie Verifikasi`,
                        booking_id: bookingId
                    }
                ];
                break;

            case 'researched': // Peneliti sudah paraf (4)
                notifications = [{
                    recipient_divisi: 'Peneliti Validasi',
                    title: `Booking Siap Verifikasi: ${booking.nobooking}`,
                    message: `Booking ${booking.nobooking} dari ${booking.ppat_nama} sudah diparaf Peneliti dan siap untuk verifikasi akhir`,
                    booking_id: bookingId
                }];
                break;
                
            case 'verified_final': // Peneliti Validasi sudah setuju (5)
                notifications = [
                    {
                        recipient_divisi: 'LSB',
                        title: `Booking Terverifikasi: ${booking.nobooking}`,
                        message: `Booking ${booking.nobooking} dari ${booking.ppat_nama} sudah diverifikasi akhir dan siap diproses`,
                        booking_id: bookingId
                    },
                    {
                        recipient_id: bookingOwnerId, // numeric id PPAT pembuat
                        recipient_divisi: booking.ppat_divisi || null,
                        title: `Booking Disetujui: ${booking.nobooking}`,
                        message: `Booking Anda telah disetujui oleh Peneliti Validasi dan sedang diproses LSB`,
                        booking_id: bookingId
                    }
                ];
                break;
                
            case 'rejected': // Ditolak oleh siapa saja (6)
                const rejector = await getUserDetail(performedByUserId);
                notifications = [{
                    recipient_id: bookingOwnerId,
                    recipient_divisi: booking.ppat_divisi || null,
                    title: `Booking Dikembalikan: ${booking.nobooking}`,
                    message: `Booking Anda perlu perbaikan oleh ${rejector.divisi}: ${rejector.nama}. Silakan periksa dan kirim ulang.`,
                    booking_id: bookingId
                }];
                break;
                
            case 'completed': // Selesai oleh LSB (7)
                notifications = [
                    {
                        recipient_id: bookingOwnerId,
                        recipient_divisi: booking.ppat_divisi || null,
                        title: `Booking Selesai: ${booking.nobooking}`,
                        message: `Booking Anda telah selesai diproses dengan nomor validasi: ${booking.nomor_validasi || 'Belum tersedia'}`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'Administrator',
                        title: `Booking Selesai: ${booking.nobooking}`,
                        message: `Booking dari ${booking.ppat_nama} (${booking.ppat_khusus}) telah selesai diproses oleh LSB`,
                        booking_id: bookingId
                    }
                ];
                break;
                
            default:
                console.log(`Status ${newStatus} tidak memerlukan notifikasi`);
                return;
        }
        
        // Simpan notifikasi ke database dan kirim ke client
        for (const notif of notifications) {
            // Jika notifikasi untuk user spesifik, buat 1 row untuk user tersebut
            if (notif.recipient_id) {
                const saved = await notificationModel.createNotification({
                    recipient_id: notif.recipient_id,
                    recipient_divisi: notif.recipient_divisi || null,
                    title: notif.title,
                    message: notif.message,
                    booking_id: notif.booking_id
                });
                sendToPollingClients(notif.recipient_id, saved);
            }
            // Jika notifikasi untuk divisi, buat 1 row per user di divisi tsb (recipient_id wajib)
            else if (notif.recipient_divisi) {
                const usersInDivisi = await notificationModel.getUsersByDivisi(notif.recipient_divisi);
                for (const user of usersInDivisi) {
                    const saved = await notificationModel.createNotification({
                        recipient_id: user.id,
                        recipient_divisi: notif.recipient_divisi,
                        title: notif.title,
                        message: notif.message,
                        booking_id: notif.booking_id
                    });
                    sendToPollingClients(user.id, saved);
                }
            }
        }
        
        console.log(`Notifikasi untuk status ${newStatus} berhasil dikirim`);
        
    } catch (error) {
        console.error('Error dalam triggerNotificationByStatus:', error);
        throw error;
    }
};

// Function alternatif untuk trigger notifikasi berdasarkan action
export const createBookingNotification = async (bookingId, triggerAction, performedBy) => {
    try {
        const booking = await getBookingDetail(bookingId);
        const performedByUser = await getUserDetail(performedBy);
        
        let notifications = [];
        
        switch(triggerAction) {
            case 'BOOKING_CREATED':
                notifications = [
                    {
                        recipient_divisi: 'Administrator',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama} (${booking.ppat_khusus}) membuat booking baru - WP: ${booking.namawajibpajak}, Jenis: ${booking.jenis_wajib_pajak}`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'LTB',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama} perlu verifikasi awal - ${booking.namawajibpajak}`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'BANK',
                        title: `Booking Baru: ${booking.nobooking}`,
                        message: `PPAT: ${booking.ppat_nama} memerlukan pengecekan transaksi di BANK - ${booking.namawajibpajak}`,
                        booking_id: bookingId
                    }
                ];
                break;
                
            case 'BOOKING_VERIFIED_LTB':
                notifications = [{
                    recipient_divisi: 'Peneliti',
                    title: `Booking Siap Dicek: ${booking.nobooking}`,
                    message: `Booking dari ${booking.ppat_nama} sudah difilter LTB dan siap untuk pengecekan menyeluruh`,
                    booking_id: bookingId
                }];
                break;
                
            case 'BOOKING_RESEARCHED':
                notifications = [{
                    recipient_divisi: 'Peneliti Validasi',
                    title: `Booking Siap Verifikasi: ${booking.nobooking}`,
                    message: `Booking dari ${booking.ppat_nama} sudah diparaf Peneliti dan siap untuk verifikasi akhir`,
                    booking_id: bookingId
                }];
                break;
                
            case 'BOOKING_VERIFIED_FINAL':
                notifications = [
                    {
                        recipient_divisi: 'LSB',
                        title: `Booking Terverifikasi: ${booking.nobooking}`,
                        message: `Booking dari ${booking.ppat_nama} sudah diverifikasi akhir dan siap diproses`,
                        booking_id: bookingId
                    },
                    {
                        recipient_id: booking.userid,
                        recipient_divisi: booking.ppat_divisi,
                        title: `Booking Disetujui: ${booking.nobooking}`,
                        message: `Booking Anda telah disetujui dan sedang diproses LSB`,
                        booking_id: bookingId
                    }
                ];
                break;
                
            case 'BOOKING_REJECTED':
                notifications = [{
                    recipient_id: booking.userid,
                    recipient_divisi: booking.ppat_divisi,
                    title: `Booking Dikembalikan: ${booking.nobooking}`,
                    message: `Booking Anda perlu perbaikan. Silakan periksa dan kirim ulang.`,
                    booking_id: bookingId
                }];
                break;
                
            case 'BOOKING_COMPLETED':
                notifications = [
                    {
                        recipient_id: booking.userid,
                        recipient_divisi: booking.ppat_divisi,
                        title: `Booking Selesai: ${booking.nobooking}`,
                        message: `Booking Anda telah selesai diproses dan diterima`,
                        booking_id: bookingId
                    },
                    {
                        recipient_divisi: 'Administrator',
                        title: `Booking Selesai: ${booking.nobooking}`,
                        message: `Booking dari ${booking.ppat_nama} telah selesai diproses`,
                        booking_id: bookingId
                    }
                ];
                break;
                
            default:
                console.log(`Action ${triggerAction} tidak dikenali`);
                return;
        }
        
        // Simpan dan kirim notifikasi
        for (const notif of notifications) {
            const savedNotification = await notificationModel.createNotification(notif);
            
            if (notif.recipient_id) {
                sendToPollingClients(notif.recipient_id, savedNotification);
            } else if (notif.recipient_divisi) {
                const usersInDivisi = await notificationModel.getUsersByDivisi(notif.recipient_divisi);
                for (const user of usersInDivisi) {
                    sendToPollingClients(user.id, savedNotification);
                }
            }
        }
        
        console.log(`Notifikasi untuk action ${triggerAction} berhasil dikirim`);
        
    } catch (error) {
        console.error('Error dalam createBookingNotification:', error);
        throw error;
    }
};

// Function untuk mengirim notifikasi ke semua user dalam divisi
export const notifyDivisi = async (divisi, title, message, bookingId) => {
    try {
        const users = await notificationModel.getUsersByDivisi(divisi);
        
        for (const user of users) {
            const notification = await notificationModel.createNotification({
                recipient_id: user.id,
                recipient_divisi: divisi,
                title: title,
                message: message,
                booking_id: bookingId
            });
            
            sendToPollingClients(user.id, notification);
        }
        
        console.log(`Notifikasi ke divisi ${divisi} berhasil dikirim`);
        
    } catch (error) {
        console.error('Error dalam notifyDivisi:', error);
        throw error;
    }
};

// Function untuk mengirim notifikasi ke user spesifik
export const notifyUser = async (userId, title, message, bookingId) => {
    try {
        const user = await getUserDetail(userId);
        const notification = await notificationModel.createNotification({
            recipient_id: userId,
            recipient_divisi: user.divisi,
            title: title,
            message: message,
            booking_id: bookingId
        });
        
        sendToPollingClients(userId, notification);
        console.log(`Notifikasi ke user ${userId} berhasil dikirim`);
        
    } catch (error) {
        console.error('Error dalam notifyUser:', error);
        throw error;
    }
};