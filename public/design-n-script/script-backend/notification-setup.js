// frontend/js/notification-setup.js
// Satu pintu untuk inisialisasi Notification UI + Poller + Panel (untuk dipakai di banyak halaman)

import NotificationPoller from './notification-poller.js';
import NotificationUI from './notification-ui.js';
import NotificationPanel from './notification-panel.js';
import { isAdminDivisi, isPollerOnlyDivisi, logNotificationSetup } from './notification-config.js';

export async function initNotifications(options = {}) {
    const {
        containerId = 'notificationContainer',
        createPanel = null, // null = auto-detect based on divisi
        panelOptions = { width: '360px', top: '130px', right: '24px', maxItems: 200 },
        historyLimit = 50
    } = options;

    try {
        // Ambil profil user
        const res = await fetch('/api/v1/auth/profile');
        if (!res.ok) throw new Error('Gagal memuat profil');
        const user = await res.json();
        const userId = user.id || user.userid;
        const divisi = user.divisi || '';

        // Check if we're on admin-status-ppat.html page
        const isAdminStatusPage = window.location.pathname.includes('admin-status-ppat.html');
        
        // Determine if user should have notification panel
        // Panel only enabled for admin-status-ppat.html page
        const shouldCreatePanel = createPanel !== null ? createPanel : (isAdminDivisi(divisi) && isAdminStatusPage);
        
        // Log notification setup for debugging
        logNotificationSetup(divisi, userId);

        // UI pop card (muncul kanan atas, auto-create jika container tidak ada)
        NotificationUI.init(containerId);

        // Panel persisten (kanan) - HANYA untuk admin-status-ppat.html
        let panel = null;
        if (shouldCreatePanel) {
            panel = NotificationPanel.init(panelOptions);
            await panel.loadHistory(userId, historyLimit);
            console.log('✅ Notification panel created for admin-status-ppat.html page');
        } else {
            console.log('ℹ️ Notification panel disabled - not on admin-status-ppat.html page');
        }

        // Poller (long polling)
        const poller = new NotificationPoller(userId, divisi);

        // Cache untuk dedup per booking
        const seenBookings = new Set();
        
        // Store divisi in global scope for notification handling
        window.notificationBootstrap = { user: { divisi, userId } };

        // Override agar push masuk ke UI card + Panel persisten + dedup/auto-hide
        const originalShow = poller.showNotification.bind(poller);
        poller.showNotification = async (notif) => {
            try {
                const bookingId = notif.booking_id || notif.bookingId;
                const key = `${bookingId || ''}|${notif._type || ''}`;
                if (bookingId && seenBookings.has(key)) {
                    return; // dedup per booking+type (sesi)
                }
                if (bookingId) seenBookings.add(key);
            } catch (_) {}

            // Different behavior based on divisi and page
            if (isAdminDivisi(divisi) && isAdminStatusPage) {
                // Admin on admin-status-ppat.html: Show in UI card + Panel
                if (window.notificationUI) {
                    window.notificationUI.showNotification({
                        id: notif.id,
                        title: notif.title,
                        message: notif.message,
                        type: 'info',
                        booking_id: notif.booking_id
                    });
                }
                if (window.notificationPanel) {
                    window.notificationPanel.addNotification(notif);
                }
                console.log('🔔 Admin notification on admin-status-ppat.html: UI card + Panel');
            } else if (isAdminDivisi(divisi)) {
                // Admin on other pages: Show in UI card only (no panel)
                if (window.notificationUI) {
                    window.notificationUI.showNotification({
                        id: notif.id,
                        title: notif.title,
                        message: notif.message,
                        type: 'info',
                        booking_id: notif.booking_id
                    });
                }
                console.log('🔔 Admin notification on other pages: UI card only');
            } else if (isPollerOnlyDivisi(divisi)) {
                // Poller-only divisi: Show in UI card only (no panel)
                if (window.notificationUI) {
                    window.notificationUI.showNotification({
                        id: notif.id,
                        title: notif.title,
                        message: notif.message,
                        type: 'info',
                        booking_id: notif.booking_id
                    });
                }
                console.log('🔔 Poller-only notification: UI card only');
            } else {
                // Other divisi: Use original behavior
                originalShow(notif);
                console.log('🔔 Other divisi notification: Original behavior');
            }
        };

        // Auto-hide logic: check booking status then mark read + remove
        async function shouldHideForPeneliti(notif) {
            try {
                const divisi = String((window.notificationBootstrap?.user?.divisi || '')).toLowerCase();
                if (divisi !== 'peneliti') return false;
                const type = notif?._type || '';
                const bookingId = notif?.booking_id;
                if (!bookingId) return false;
                // Fetch booking by bookingId -> get nobooking/status via lightweight endpoint (reuse existing analytics not available; fall back to server detail page if exists)
                // As we may not have a direct endpoint, skip network-heavy checks; rely on type-based auto-expiry window instead.
                return false;
            } catch { return false; }
        }

        // Hook panel add to auto-hide items after a delay if status progresses
        const originalAdd = window.notificationPanel?.addNotification?.bind(window.notificationPanel);
        if (originalAdd) {
            window.notificationPanel.addNotification = (notif) => {
                originalAdd(notif);
                // Auto hide after 20s (UI) regardless; real status check can be added when endpoint available
                setTimeout(() => {
                    try {
                        const list = document.querySelector('.notif-panel-list');
                        if (!list) return;
                        const items = Array.from(list.querySelectorAll('.notif-item'));
                        const match = items.find(el => String(el.dataset.bookingId||'') === String(notif.booking_id||''));
                        if (match && list.contains(match)) match.remove();
                        const counter = document.getElementById('notif-panel-count');
                        if (counter) counter.textContent = String(list.querySelectorAll('.notif-item').length);
                    } catch {}
                }, 20000);
            };
        }

        // Ekspor global opsional
        window.notificationBootstrap = { poller, panel, user }; 
        // Global resolver untuk tujuan navigasi tombol "Lihat"
        window.resolveNotificationTarget = function(notif) {
            try {
                const divisi = String((window.notificationBootstrap?.user?.divisi || window.currentUserDivisi || '')).toLowerCase();
                const bookingId = notif?.booking_id || notif?.bookingId || notif?.id || null;
                if (divisi === 'ltb' || divisi === 'loket terima berkas') {
                    return '/LTB/TerimaBerkas-SSPD/terima-berkas-sspd.html';
                }
                if (divisi === 'lsb' || divisi === 'loket serah berkas') {
                    return '/LSB/Pelayanan_Penyerahan_SSPD/pelayanan_penyerahansspd.html';
                }
                if (divisi === 'administrator' || divisi === 'admin') {
                    return '/admin-dashboard.html';
                }
                if (divisi === 'peneliti' || divisi === 'peneliti validasi') {
                    // Gunakan meta type/badge jika tersedia
                    const type = (notif && (notif._type || '')) || '';
                    if (type === 'paraf_kasie') return '/Peneliti/ParafKasie-sspd/paraf-kasie.html';
                    if (type === 'verifikasi') return '/Peneliti/Verifikasi_sspd/verifikasi-data.html';
                    return '/Peneliti/Verifikasi_sspd/verifikasi-data.html';
                }
                return bookingId ? `/booking/detail/${bookingId}` : '/';
            } catch (_) {
                return '/';
            }
        };
        // Global helper: bunyi konfirmasi pengiriman
        if (!window.playSendSound) {
            window.playSendSound = async function() {
                try {
                    if (window.notificationUI && typeof window.notificationUI.playSound === 'function') {
                        await window.notificationUI.playSound();
                        return;
                    }
                } catch(_) {}
                try {
                    const audio = document.createElement('audio');
                    audio.preload = 'auto';
                    const s1 = document.createElement('source'); s1.src = '/sound/notifikasi_kirimbooking.ogg'; s1.type = 'audio/ogg'; audio.appendChild(s1);
                    const s2 = document.createElement('source'); s2.src = '/sound/notifikasi_kirimbooking.mp3'; s2.type = 'audio/mpeg'; audio.appendChild(s2);
                    audio.currentTime = 0; await audio.play();
                } catch(_) {}
            };
        }
        poller.startPolling();
        // Jika panel aktif, pastikan suara juga diputar saat panel menerima item
        try {
            const originalAdd2 = window.notificationPanel?.addNotification?.bind(window.notificationPanel);
            if (originalAdd2) {
                window.notificationPanel.addNotification = (notif) => {
                    originalAdd2(notif);
                    try { if (window.notificationUI) window.notificationUI.playSound(); } catch(_) {}
                };
            }
        } catch(_) {}
        return { poller, panel, user };
    } catch (e) {
        console.error('[notification-setup] Inisialisasi gagal:', e);
        return null;
    }
}

// Re-export helper functions for backward compatibility
export { isAdminDivisi, isPollerOnlyDivisi, logNotificationSetup };

export default { initNotifications };


