// 🔔 Enhanced Notification System with Sound Alerts
// Frontend notification system that handles real-time notifications with sound

class NotificationSystem {
    constructor() {
        this.notificationContainer = null;
        this.soundEnabled = true;
        this.notificationQueue = [];
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        // Create notification container
        this.createNotificationContainer();
        
        // Load user preferences
        this.loadUserPreferences();
        
        // Start polling for new notifications
        this.startNotificationPolling();
        
        console.log('🔔 [NOTIFICATION] System initialized');
    }

    createNotificationContainer() {
        // Remove existing container if any
        const existingContainer = document.getElementById('notification-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
        this.notificationContainer = container;
    }

    loadUserPreferences() {
        // Load sound preference from localStorage
        const soundPref = localStorage.getItem('notification_sound_enabled');
        this.soundEnabled = soundPref !== 'false'; // Default to true
        
        console.log('🔔 [NOTIFICATION] Sound enabled:', this.soundEnabled);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('notification_sound_enabled', this.soundEnabled.toString());
        
        // Show toggle notification
        this.showNotification({
            title: this.soundEnabled ? '🔊 Suara Notifikasi Aktif' : '🔇 Suara Notifikasi Nonaktif',
            message: this.soundEnabled ? 'Notifikasi akan memutar suara' : 'Notifikasi tanpa suara',
            type: 'info',
            duration: 2000
        });
        
        return this.soundEnabled;
    }

    // Play notification sound based on type
    playNotificationSound(type = 'info') {
        if (!this.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Different sound patterns for different notification types
            let frequencies = [];
            let duration = 200;
            
            switch (type) {
                case 'success':
                case 'Diolah':
                    // Success sound: ascending chord
                    frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
                    duration = 300;
                    break;
                case 'Pending':
                    // Pending sound: gentle ping
                    frequencies = [440, 554.37]; // A4, C#5
                    duration = 200;
                    break;
                case 'error':
                    // Error sound: descending tone
                    frequencies = [523.25, 392.00]; // C5, G4
                    duration = 400;
                    break;
                default:
                    // Default info sound: simple beep
                    frequencies = [440]; // A4
                    duration = 150;
            }

            // Play the sound
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration / 1000);
                }, index * 50);
            });

            console.log('🔔 [NOTIFICATION] Played sound:', type);
        } catch (error) {
            console.warn('🔔 [NOTIFICATION] Could not play sound:', error);
        }
    }

    // Show notification with sound and visual
    showNotification(notification) {
        const {
            title = 'Notifikasi',
            message = '',
            type = 'info',
            duration = 5000,
            sound = true,
            soundType = type,
            nobooking = null,
            trackstatus = null
        } = notification;

        // Add to queue
        this.notificationQueue.push(notification);
        
        if (!this.isProcessing) {
            this.processNotificationQueue();
        }
    }

    processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const notification = this.notificationQueue.shift();
        this.displayNotification(notification);
        
        // Process next notification after a delay
        setTimeout(() => {
            this.processNotificationQueue();
        }, 500);
    }

    displayNotification(notification) {
        const {
            title,
            message,
            type,
            duration,
            sound,
            soundType,
            nobooking,
            trackstatus
        } = notification;

        // Play sound if enabled
        if (sound && this.soundEnabled) {
            this.playNotificationSound(soundType);
        }

        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${type}`;
        notificationEl.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            pointer-events: auto;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        `;

        // Add notification content
        notificationEl.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 13px; opacity: 0.9;">${message}</div>
                    ${nobooking ? `<div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Booking: ${nobooking}</div>` : ''}
                    ${trackstatus ? `<div style="font-size: 12px; opacity: 0.8;">Status: ${trackstatus}</div>` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255,255,255,0.3);
                animation: progress ${duration}ms linear forwards;
            "></div>
        `;

        // Add progress bar animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);

        // Add to container
        this.notificationContainer.appendChild(notificationEl);

        // Animate in
        setTimeout(() => {
            notificationEl.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notificationEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificationEl.parentElement) {
                    notificationEl.remove();
                }
            }, 300);
        }, duration);

        console.log('🔔 [NOTIFICATION] Displayed:', { title, type, trackstatus });
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success':
            case 'Diolah':
                return 'linear-gradient(135deg, #4CAF50, #45a049)';
            case 'Pending':
                return 'linear-gradient(135deg, #FF9800, #F57C00)';
            case 'error':
                return 'linear-gradient(135deg, #f44336, #d32f2f)';
            case 'warning':
                return 'linear-gradient(135deg, #FF9800, #F57C00)';
            default:
                return 'linear-gradient(135deg, #2196F3, #1976D2)';
        }
    }

    // Poll for new notifications
    async startNotificationPolling() {
        const pollInterval = 5000; // Poll every 5 seconds
        
        setInterval(async () => {
            try {
                await this.checkForNewNotifications();
            } catch (error) {
                console.warn('🔔 [NOTIFICATION] Polling error:', error);
            }
        }, pollInterval);
        
        console.log('🔔 [NOTIFICATION] Started polling for notifications');
    }

    async checkForNewNotifications() {
        try {
            const response = await fetch('/api/notifications/unread', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) return;

            const data = await response.json();
            
            if (data.success && data.notifications) {
                data.notifications.forEach(notification => {
                    this.showNotification({
                        title: notification.title,
                        message: notification.message,
                        type: notification.type,
                        nobooking: notification.related_booking,
                        trackstatus: notification.trackstatus,
                        duration: 6000
                    });
                });
            }
        } catch (error) {
            console.warn('🔔 [NOTIFICATION] Failed to check notifications:', error);
        }
    }

    // Manual trigger for testing
    testNotification(type = 'success') {
        this.showNotification({
            title: `🧪 Test ${type} Notification`,
            message: 'Ini adalah notifikasi test dengan suara',
            type: type,
            duration: 3000,
            sound: true,
            soundType: type
        });
    }
}

// Initialize notification system when DOM is ready
let notificationSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
    
    // Add keyboard shortcut for testing (Ctrl+Shift+N)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            notificationSystem.testNotification('success');
        }
    });
    
    console.log('🔔 [NOTIFICATION] System ready. Press Ctrl+Shift+N to test.');
});

// Export for global access
window.NotificationSystem = NotificationSystem;
window.notificationSystem = notificationSystem;
