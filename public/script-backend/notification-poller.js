// frontend/js/notification-poller.js
export default class NotificationPoller {
    constructor(userId, userDivisi) {
        this.userId = userId;
        this.userDivisi = userDivisi;
        this.isPolling = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.audio = null;
        this._ensureAudio();
    }
    
    startPolling() {
        this.isPolling = true;
        this.poll();
    }
    
    stopPolling() {
        this.isPolling = false;
    }
    
    async poll() {
        if (!this.isPolling) return;
        
        try {
            const response = await fetch(
                `/api/notifications/poll?user_id=${encodeURIComponent(String(this.userId))}&divisi=${encodeURIComponent(String(this.userDivisi || ''))}`
            );
            const data = await response.json();
            
            if (data.success && data.notifications.length > 0) {
                data.notifications.forEach(notif => {
                    this.showNotification(notif);
                    this.markAsRead(notif.id);
                });
                this._playSound();
            }
            
            this.retryCount = 0;
            setTimeout(() => this.poll(), 1000);
            
        } catch (error) {
            console.error('Polling error:', error);
            this.retryCount++;
            
            if (this.retryCount <= this.maxRetries) {
                setTimeout(() => this.poll(), 3000 * this.retryCount);
            } else {
                console.error('Max retries reached');
                this.stopPolling();
            }
        }
    }
    
    showNotification(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        notificationEl.innerHTML = `
            <div class="notification-header">
                <span>${notification.title}</span>
                <span class="close">&times;</span>
            </div>
            <div class="notification-content">
                ${notification.message}
            </div>
            <div class="notification-footer">
                <button class="btn-outline">Abaikan</button>
                <button class="btn-primary">Lihat</button>
            </div>
            <div class="progress-bar"></div>
        `;
        
        document.getElementById('notificationContainer').appendChild(notificationEl);
        
        // Auto remove setelah 30 detik
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 30000);
    }

    _ensureAudio() {
        try {
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
            this.audio = audio;
        } catch (e) {
            console.warn('Gagal inisialisasi audio di poller:', e);
        }
    }

    async _playSound() {
        try {
            if (!this.audio) this._ensureAudio();
            if (!this.audio) return;
            this.audio.currentTime = 0;
            await this.audio.play();
        } catch (err) {
            // diamkan, UI juga akan mencoba memutar suara
        }
    }
    
    async markAsRead(notificationId) {
        try {
            await fetch('/api/notifications/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notification_id: notificationId })
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }
}