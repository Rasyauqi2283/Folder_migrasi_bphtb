// Lightweight wrapper for sending LTB notifications from various places
import { triggerNotificationByStatus, notifyDivisi } from './notification_service.js';

export async function sendNotificationToLtb(messageOrBooking, opts = {}) {
  try {
    if (typeof messageOrBooking === 'object' && messageOrBooking !== null) {
      const { bookingId, nobooking, actedBy } = messageOrBooking;
      if (bookingId) {
        // This will notify Administrator, LTB, and BANK for initial booking
        await triggerNotificationByStatus(bookingId, 'pending_ltb', actedBy);
        return true;
      }
      if (nobooking) {
        const title = `Booking Baru: ${nobooking}`;
        const msg = `Booking ${nobooking} telah dikirim ke LTB untuk verifikasi awal`;
        await Promise.all([
          notifyDivisi('Administrator', title, msg, null),
          notifyDivisi('LTB', title, msg, null),
          notifyDivisi('BANK', title, msg, null)
        ]);
        return true;
      }
    }

    if (typeof messageOrBooking === 'string' && messageOrBooking.trim()) {
      const title = 'Informasi Booking';
      const msg = messageOrBooking.trim();
      await Promise.all([
        notifyDivisi('Administrator', title, msg, null),
        notifyDivisi('LTB', title, msg, null),
        notifyDivisi('BANK', title, msg, null)
      ]);
      return true;
    }
  } catch (e) {
    console.warn('sendNotificationToLtb wrapper failed:', e.message);
  }
  return false;
}

export default {
  sendNotificationToLtb
};


