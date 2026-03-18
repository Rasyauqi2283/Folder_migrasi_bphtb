// frontend/js/notification-ui.js
export class NotificationUI {
    constructor(containerId = 'notificationContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.createNotificationContainer(containerId);
        }
        this.notificationCount = 0;
        this.maxNotifications = 5;
        this.audio = null;
        this.audioReady = false;
        this.initStyles();
        this.initAudio();
    }

    // Buat container notifikasi jika belum ada
    createNotificationContainer(containerId) {
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(container);
        this.container = container;
    }

    // Inject CSS styles jika belum ada
    initStyles() {
        if (document.getElementById('notification-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                padding: 16px;
                animation: notificationSlideIn 0.3s ease-out;
                position: relative;
                overflow: hidden;
                border-left: 4px solid #3498db;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 250px;
            }

            .notification-success {
                border-left-color: #27ae60;
            }

            .notification-warning {
                border-left-color: #f39c12;
            }

            .notification-error {
                border-left-color: #e74c3c;
            }

            .notification-info {
                border-left-color: #3498db;
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
                font-weight: 600;
                color: #2c3e50;
                font-size: 14px;
                line-height: 1.3;
            }

            .notif-badge { display:inline-block; padding:2px 6px; border-radius:6px; font-size:11px; margin-left:8px; font-weight:600; }
            .notif-badge--verifikasi { background:#e0f2fe; color:#075985; border:1px solid #7dd3fc; }
            .notif-badge--paraf { background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd; }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #95a5a6;
                padding: 0;
                margin-left: 10px;
                line-height: 1;
            }

            .notification-close:hover {
                color: #7f8c8d;
            }

            .notification-content {
                margin-bottom: 12px;
                color: #34495e;
                font-size: 13px;
                line-height: 1.4;
            }

            .notification-footer {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
            }

            .notification-btn {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s;
            }

            .notification-btn-primary {
                background-color: #3498db;
                color: white;
            }

            .notification-btn-primary:hover {
                background-color: #2980b9;
            }

            .notification-btn-outline {
                background-color: transparent;
                border: 1px solid #bdc3c7;
                color: #7f8c8d;
            }

            .notification-btn-outline:hover {
                background-color: #f8f9fa;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background-color: #3498db;
                animation: notificationProgress 30s linear forwards;
            }

            .notification-success .notification-progress {
                background-color: #27ae60;
            }

            .notification-warning .notification-progress {
                background-color: #f39c12;
            }

            .notification-error .notification-progress {
                background-color: #e74c3c;
            }

            @keyframes notificationSlideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes notificationSlideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes notificationProgress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }

            .notification-hidden {
                animation: notificationSlideOut 0.3s ease-in forwards;
            }

            /* Badge untuk jumlah notifikasi */
            .notification-badge {
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: #e74c3c;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                z-index: 10001;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;

        document.head.appendChild(style);
    }

    // Inisialisasi audio notifikasi
    initAudio() {
        try {
            // Gunakan <audio> dengan multiple sources agar fallback otomatis
            const audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.volume = 0.8;

            const srcOgg = document.createElement('source');
            srcOgg.src = '/sound/notifikasi_kirimbooking.ogg';
            srcOgg.type = 'audio/ogg';
            audio.appendChild(srcOgg);

            const srcMp3 = document.createElement('source');
            srcMp3.src = '/sound/notifikasi_kirimbooking.mp3';
            srcMp3.type = 'audio/mpeg';
            audio.appendChild(srcMp3);

            audio.load();

            // Siapkan fallback jika gagal play karena autoplay policy
            const unlock = () => {
                this.audioReady = true;
                document.removeEventListener('click', unlock);
                document.removeEventListener('keydown', unlock);
            };
            document.addEventListener('click', unlock, { once: true });
            document.addEventListener('keydown', unlock, { once: true });

            this.audio = audio;
        } catch (e) {
            console.warn('Gagal inisialisasi audio notifikasi:', e);
        }
    }

    // Putar suara notifikasi dengan penanganan autoplay
    async playSound() {
        try {
            if (!this.audio) {
                this.initAudio();
            }
            if (!this.audio) return;

            // Reset ke awal supaya bunyi setiap kali
            this.audio.currentTime = 0;
            await this.audio.play();
        } catch (err) {
            // Jika kena autoplay policy, tunggu user interaction berikutnya
            console.warn('Autoplay diblokir, menunggu interaksi pengguna untuk memutar suara');
            const oncePlay = async () => {
                try {
                    this.audio.currentTime = 0;
                    await this.audio.play();
                } catch (_) { /* abaikan */ }
            };
            document.addEventListener('click', oncePlay, { once: true });
            document.addEventListener('keydown', oncePlay, { once: true });
        }
    }

    // Suara khusus fallback: dipakai untuk Admin/LTB saat menerima kiriman (server event tertentu)
    async playFallbackSound() {
        try {
            const audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.volume = 0.9;

            const srcOgg = document.createElement('source');
            srcOgg.src = '/sound/notifikasi_fallback.ogg';
            srcOgg.type = 'audio/ogg';
            audio.appendChild(srcOgg);

            const srcMp3 = document.createElement('source');
            srcMp3.src = '/sound/notifikasi_fallback.mp3';
            srcMp3.type = 'audio/mpeg';
            audio.appendChild(srcMp3);

            audio.currentTime = 0;
            await audio.play();
        } catch (_) {
            // abaikan error autoplay
        }
    }

    // Tampilkan notifikasi
    showNotification(notificationData) {
        if (this.notificationCount >= this.maxNotifications) {
            this.removeOldestNotification();
        }

        const notification = this.createNotificationElement(notificationData);
        this.container.appendChild(notification);
        this.notificationCount++;

        // Putar suara setiap ada notifikasi masuk
        this.playSound();

        // Update badge
        this.updateNotificationBadge();

        // Auto remove setelah 30 detik
        const autoRemoveTimeout = setTimeout(() => {
            this.removeNotification(notification);
        }, 30000);

        // Simpan timeout ID untuk bisa di-cancel jika user menutup manual
        notification.dataset.timeoutId = autoRemoveTimeout;

        return notification;
    }

    // Buat elemen notifikasi
    createNotificationElement(notificationData) {
        const notification = document.createElement('div');
        const type = notificationData.type || 'info';
        
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span>${this.escapeHtml(notificationData.title)}${notificationData._badge_label ? ` <span class=\"notif-badge ${this.escapeHtml(notificationData._badge_class || '')}\">${this.escapeHtml(notificationData._badge_label)}</span>` : ''}</span>
                <button class="notification-close" onclick="window.notificationUI.removeNotification(this.parentElement.parentElement)">
                    &times;
                </button>
            </div>
            <div class="notification-content">
                ${this.escapeHtml(notificationData.message)}
            </div>
            <div class="notification-footer">
                <button class="notification-btn notification-btn-outline" onclick="(async () => { try { const notifEl = this.parentElement.parentElement; const id = notifEl?.dataset?.notificationId; const bookingId = notifEl?.dataset?.bookingId; const user = window.notificationBootstrap?.user; await fetch('/api/notifications/mark-read', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ notification_id: id || null, booking_id: bookingId || null, user_id: (user?.id || user?.userid) || null }) }); } catch(_) {} window.notificationUI.removeNotification(this.parentElement.parentElement); })()">
                    Abaikan
                </button>
                <button class="notification-btn notification-btn-primary" 
                    onclick="window.notificationUI.handleAction(this.parentElement.parentElement, 'view')">
                    Lihat
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        // Simpan data notifikasi untuk aksi
        notification.dataset.notificationId = notificationData.id;
        notification.dataset.bookingId = notificationData.booking_id;

        return notification;
    }

    // Hapus notifikasi
    removeNotification(notificationElement) {
        if (!notificationElement || !notificationElement.parentNode) return;

        // Clear timeout jika masih ada
        if (notificationElement.dataset.timeoutId) {
            clearTimeout(parseInt(notificationElement.dataset.timeoutId));
        }

        notificationElement.classList.add('notification-hidden');
        
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
                this.notificationCount--;
                this.updateNotificationBadge();
            }
        }, 300);
    }

    // Hapus notifikasi tertua
    removeOldestNotification() {
        const notifications = this.container.querySelectorAll('.notification');
        if (notifications.length > 0) {
            this.removeNotification(notifications[0]);
        }
    }

    // Handle aksi notifikasi
    async handleAction(notificationElement, action) {
        const notificationId = notificationElement.dataset.notificationId;
        const bookingId = notificationElement.dataset.bookingId;

        switch(action) {
            case 'view':
                this.viewBooking(bookingId);
                break;
            case 'dismiss':
                this.removeNotification(notificationElement);
                break;
        }

        // Tandai sebagai dibaca di server (id atau by booking)
        try {
            const user = window.notificationBootstrap?.user;
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_id: notificationId || null, booking_id: bookingId || null, user_id: (user?.id || user?.userid) || null })
            });
        } catch (_) {}

        this.removeNotification(notificationElement);
    }

    // Lihat detail booking / arahkan sesuai divisi melalui resolver global
    viewBooking(bookingId) {
        try {
            const notif = { booking_id: bookingId };
            if (typeof window.resolveNotificationTarget === 'function') {
                const href = window.resolveNotificationTarget(notif);
                if (href) { window.location.href = href; return; }
            }
        } catch (_) {}
        // Fallback lama
        window.location.href = bookingId ? `/booking/detail/${bookingId}` : '/';
    }

    // Tandai notifikasi sebagai dibaca
    async markAsRead(notificationId) {
        try {
            const response = await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notification_id: notificationId })
            });

            if (!response.ok) {
                console.error('Gagal menandai notifikasi sebagai dibaca');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Update badge notifikasi
    updateNotificationBadge() {
        let badge = document.getElementById('global-notification-badge');
        
        if (this.notificationCount > 0) {
            if (!badge) {
                badge = document.createElement('div');
                badge.id = 'global-notification-badge';
                badge.className = 'notification-badge';
                document.body.appendChild(badge);
            }
            badge.textContent = this.notificationCount;
        } else if (badge) {
            badge.remove();
        }
    }

    // Clear semua notifikasi
    clearAll() {
        const notifications = this.container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    // Utility: Escape HTML untuk prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize
    static init(containerId = 'notificationContainer') {
        if (!window.notificationUI) {
            window.notificationUI = new NotificationUI(containerId);
        }
        return window.notificationUI;
    }
}

// Auto-initialize ketika DOM ready
document.addEventListener('DOMContentLoaded', function() {
    NotificationUI.init();
});

// Export untuk module system
export default NotificationUI;