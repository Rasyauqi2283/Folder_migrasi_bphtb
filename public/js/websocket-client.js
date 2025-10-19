/**
 * WEBSOCKET CLIENT - BAPPENDA PING NOTIFICATION SYSTEM
 * Client-side WebSocket untuk real-time notifications
 */

class BappendaWebSocket {
  constructor() {
    this.socket = null;
    this.division = null;
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.listeners = new Map();
    
    this.init();
  }

  /**
   * Initialize WebSocket connection
   */
  init() {
    try {
      // Get server URL from current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}`;
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ WebSocket initialization error:', error);
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join division room if set
      if (this.division) {
        this.joinDivision(this.division);
      }
      
      this.emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.emit('connection_error', { error });
    });

    // Ping notification events
    this.socket.on('ping_notification', (data) => {
      console.log('🔔 Ping notification received:', data);
      this.handlePingNotification(data);
    });

    this.socket.on('ping_acknowledged', (data) => {
      console.log('✅ Ping acknowledged:', data);
      this.emit('ping_acknowledged', data);
    });

    // Real-time data updates
    this.socket.on('data_updated', (data) => {
      console.log('📊 Data updated:', data);
      this.emit('data_updated', data);
    });

    // System notifications
    this.socket.on('system_notification', (data) => {
      console.log('📢 System notification:', data);
      this.showSystemNotification(data);
    });
  }

  /**
   * Join a division room
   */
  joinDivision(division) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Cannot join division: WebSocket not connected');
      return;
    }

    this.division = division;
    this.socket.emit('join_division', division);
    console.log(`👥 Joined division: ${division}`);
  }

  /**
   * Send ping acknowledgment
   */
  acknowledgePing(pingId, division) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Cannot acknowledge ping: WebSocket not connected');
      return;
    }

    this.socket.emit('ping_acknowledged', {
      ping_id: pingId,
      division: division,
      user_id: this.userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle ping notification
   */
  handlePingNotification(data) {
    const { ping_id, nobooking, no_registrasi, division, message } = data;
    
    // Show visual notification
    this.showPingNotification(data);
    
    // Play sound if enabled
    this.playNotificationSound();
    
    // Auto-acknowledge after 5 seconds
    setTimeout(() => {
      this.acknowledgePing(ping_id, division);
    }, 5000);
    
    // Emit event for other components
    this.emit('ping_received', data);
  }

  /**
   * Show ping notification UI
   */
  showPingNotification(data) {
    const { nobooking, no_registrasi, message } = data;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'websocket-ping-notification';
    notification.innerHTML = `
      <div class="ping-notification-content">
        <div class="ping-header">
          <i class="fa fa-bell" style="color: #007bff; margin-right: 8px;"></i>
          <span class="ping-title">Ping Notification</span>
          <button class="ping-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
        </div>
        <div class="ping-body">
          <p><strong>No. Booking:</strong> ${nobooking}</p>
          <p><strong>No. Registrasi:</strong> ${no_registrasi}</p>
          <p><strong>Pesan:</strong> ${message}</p>
        </div>
        <div class="ping-footer">
          <small>Dari Admin • ${new Date().toLocaleTimeString()}</small>
        </div>
      </div>
    `;
    
    // Add styles if not already added
    this.addNotificationStyles();
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Show system notification
   */
  showSystemNotification(data) {
    const { type, title, message, duration = 5000 } = data;
    
    const notification = document.createElement('div');
    notification.className = `system-notification system-notification-${type}`;
    notification.innerHTML = `
      <div class="system-notification-content">
        <i class="fa fa-${this.getNotificationIcon(type)}" style="margin-right: 8px;"></i>
        <div>
          <strong>${title}</strong>
          <p>${message}</p>
        </div>
        <button class="system-notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    
    this.addSystemNotificationStyles();
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('⚠️ Could not play notification sound:', error);
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type) {
    const icons = {
      info: 'info-circle',
      success: 'check-circle',
      warning: 'exclamation-triangle',
      error: 'times-circle'
    };
    return icons[type] || 'info-circle';
  }

  /**
   * Add notification styles
   */
  addNotificationStyles() {
    if (document.getElementById('websocket-notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'websocket-notification-styles';
    style.textContent = `
      .websocket-ping-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border: 1px solid #007bff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        min-width: 300px;
      }
      
      .ping-notification-content {
        padding: 16px;
      }
      
      .ping-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e9ecef;
      }
      
      .ping-title {
        font-weight: 600;
        color: #007bff;
      }
      
      .ping-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6c757d;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ping-close:hover {
        color: #dc3545;
      }
      
      .ping-body p {
        margin: 4px 0;
        font-size: 14px;
      }
      
      .ping-footer {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid #e9ecef;
        color: #6c757d;
        font-size: 12px;
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Add system notification styles
   */
  addSystemNotificationStyles() {
    if (document.getElementById('system-notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'system-notification-styles';
    style.textContent = `
      .system-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
        min-width: 250px;
      }
      
      .system-notification-info {
        border-left: 4px solid #17a2b8;
      }
      
      .system-notification-success {
        border-left: 4px solid #28a745;
      }
      
      .system-notification-warning {
        border-left: 4px solid #ffc107;
      }
      
      .system-notification-error {
        border-left: 4px solid #dc3545;
      }
      
      .system-notification-content {
        padding: 12px 16px;
        display: flex;
        align-items: flex-start;
      }
      
      .system-notification-content i {
        margin-top: 2px;
        margin-right: 8px;
      }
      
      .system-notification-content div {
        flex: 1;
      }
      
      .system-notification-content strong {
        display: block;
        margin-bottom: 4px;
      }
      
      .system-notification-content p {
        margin: 0;
        font-size: 13px;
        color: #6c757d;
      }
      
      .system-notification-close {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #6c757d;
        padding: 0;
        margin-left: 8px;
      }
      
      .system-notification-close:hover {
        color: #dc3545;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.init();
      }
    }, delay);
  }

  /**
   * Event emitter functionality
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      division: this.division,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Global instance
window.bappendaWS = new BappendaWebSocket();

// Auto-join division based on current page
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  let division = null;
  
  if (path.includes('/LTB/')) {
    division = 'ltb';
  } else if (path.includes('/Bank/')) {
    division = 'bank';
  } else if (path.includes('/Peneliti/')) {
    division = 'peneliti';
  } else if (path.includes('/LSB/')) {
    division = 'lsb';
  } else if (path.includes('/Admin/')) {
    division = 'admin';
  }
  
  if (division) {
    window.bappendaWS.joinDivision(division);
    console.log(`🎯 Auto-joined division: ${division}`);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BappendaWebSocket;
}
