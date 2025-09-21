// frontend/js/notification-panel.js
// Panel notifikasi persistent (kanan) untuk Admin/role lain

export default class NotificationPanel {
    constructor(options = {}) {
        this.width = options.width || '340px';
        this.right = options.right || '20px';
        this.maxItems = options.maxItems || 100;
        this.container = null;
        this.listEl = null;
        this.countEl = null;
        this.initStyles();
        this.createPanel();
    }

    initStyles() {
        if (document.getElementById('notification-panel-styles')) return;
        const style = document.createElement('style');
        style.id = 'notification-panel-styles';
        style.textContent = `
            .notif-panel {
                position: fixed;
                top: 525px;
                right: ${this.right};
                width: ${this.width};
                height: calc(100vh - 520px);
                background: #fff;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.08);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                z-index: 9999;
            }
            .notif-panel-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 12px 14px; border-bottom: 1px solid #f0f0f0;
                background: #fafafa; font-weight: 600; color: #2c3e50;
            }
            .notif-panel-counter { font-size: 12px; color: #6b7280; }
            .notif-panel-list {
                padding: 8px; overflow: auto; flex: 1;
            }
            .notif-item {
                border: 1px solid #eef2f7; border-radius: 8px; padding: 10px 12px;
                margin-bottom: 8px; background: #fff; transition: background 0.2s;
            }
            .notif-item:hover { background: #f9fafb; }
            .notif-item-title { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px; }
            .notif-badge { display:inline-block; padding:2px 6px; border-radius:6px; font-size:11px; margin-left:6px; font-weight:600; vertical-align: middle; }
            .notif-badge--verifikasi { background:#e0f2fe; color:#075985; border:1px solid #7dd3fc; }
            .notif-badge--paraf { background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd; }
            .notif-item-msg { font-size: 12px; color: #4b5563; }
            .notif-item-meta { margin-top: 6px; display: flex; gap: 8px; font-size: 11px; color: #9ca3af; }
            .notif-item-actions { margin-top: 8px; display: flex; gap: 8px; }
            .notif-item-btn { font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb; background:#fff; cursor:pointer; }
            .notif-item-btn:hover { background:#f3f4f6; }
        `;
        document.head.appendChild(style);
    }

    createPanel() {
        const panel = document.createElement('aside');
        panel.className = 'notif-panel';
        panel.innerHTML = `
            <div class="notif-panel-header">
                <span>Notifikasi</span>
                <span class="notif-panel-counter" id="notif-panel-count">0</span>
            </div>
            <div class="notif-panel-list" id="notif-panel-list"></div>
        `;
        document.body.appendChild(panel);
        this.container = panel;
        this.listEl = panel.querySelector('#notif-panel-list');
        this.countEl = panel.querySelector('#notif-panel-count');
    }

    async loadHistory(userId, limit = 30) {
        try {
            const url = `/api/notifications/history?user_id=${encodeURIComponent(String(userId))}&limit=${limit}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data?.success && Array.isArray(data.notifications)) {
                this.listEl.innerHTML = '';
                data.notifications.forEach(n => this._appendItem(n));
                this._updateCount();
            }
        } catch (e) {
            // silent fail
        }
    }

    addNotification(notification) {
        // prepend
        const itemEl = this._buildItem(notification);
        this.listEl.insertBefore(itemEl, this.listEl.firstChild);
        // trim list
        const items = this.listEl.querySelectorAll('.notif-item');
        if (items.length > this.maxItems) {
            this.listEl.removeChild(this.listEl.lastChild);
        }
        this._updateCount();
    }

    _appendItem(notification) {
        this.listEl.appendChild(this._buildItem(notification));
    }

    _buildItem(n) {
        const el = document.createElement('div');
        el.className = 'notif-item';
        el.dataset.notificationId = n.id;
        el.dataset.bookingId = n.booking_id;
        el.innerHTML = `
            <div class="notif-item-title">${this._escape(n.title || 'Notifikasi')}${n._badge_label ? ` <span class=\"notif-badge ${this._escape(n._badge_class || '')}\">${this._escape(n._badge_label)}</span>` : ''}</div>
            <div class="notif-item-msg">${this._escape(n.message || '')}</div>
            <div class="notif-item-meta">
                <span>${n.nobooking ? this._escape(n.nobooking) : ''}</span>
                <span>${this._formatTime(n.created_at)}</span>
            </div>
            <div class="notif-item-actions">
                <button class="notif-item-btn" data-action="view">Lihat</button>
                <button class="notif-item-btn" data-action="dismiss">Tutup</button>
            </div>
        `;
        el.querySelector('[data-action="view"]').addEventListener('click', () => {
            const bookingId = el.dataset.bookingId;
            try {
                const notif = { booking_id: bookingId };
                if (typeof window.resolveNotificationTarget === 'function') {
                    const href = window.resolveNotificationTarget(notif);
                    if (href) { window.location.href = href; return; }
                }
            } catch (_) {}
            if (bookingId) window.location.href = `/booking/detail/${bookingId}`; else window.location.href = '/';
        });
        el.querySelector('[data-action="dismiss"]').addEventListener('click', async () => {
            try {
                const user = window.notificationBootstrap?.user;
                await fetch('/api/notifications/mark-read', {
                    method:'POST', headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({ notification_id: n.id || null, booking_id: n.booking_id || null, user_id: (user?.id || user?.userid) || null })
                });
            } catch (_) {}
            el.remove();
            this._updateCount();
        });
        return el;
    }

    _updateCount() {
        if (!this.countEl) return;
        const count = this.listEl.querySelectorAll('.notif-item').length;
        this.countEl.textContent = String(count);
        if (count === 0 && this.container) {
            this.container.style.display = 'none';
        } else if (this.container) {
            this.container.style.display = '';
        }
    }

    _formatTime(ts) {
        try {
            const d = ts ? new Date(ts) : new Date();
            return d.toLocaleString('id-ID', { hour12: false });
        } catch { return ''; }
    }

    _escape(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }

    static init(options) {
        if (!window.notificationPanel) {
            window.notificationPanel = new NotificationPanel(options);
        }
        return window.notificationPanel;
    }
}


