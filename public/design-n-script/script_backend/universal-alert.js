/**
 * UNIVERSAL ALERT SYSTEM
 * Sistem notifikasi yang konsisten dan reusable
 * untuk semua halaman aplikasi
 */

class UniversalAlert {
    constructor() {
        this.activeAlerts = new Set();
        this.autoCloseTimeouts = new Map();
        this.init();
    }

    /**
     * Initialize the alert system
     */
    init() {
        // Create CSS if not already loaded
        if (!document.getElementById('universal-alert-css')) {
            const link = document.createElement('link');
            link.id = 'universal-alert-css';
            link.rel = 'stylesheet';
            link.href = '/design-n-script/design_css/universal-alert.css';
            document.head.appendChild(link);
        }
    }

    /**
     * Show alert with overlay design
     * @param {Object} options - Alert configuration
     * @param {string} options.type - Alert type: 'success', 'error', 'warning', 'info'
     * @param {string} options.title - Alert title
     * @param {string} options.message - Alert message
     * @param {number} options.duration - Auto close duration in ms (default: 5000)
     * @param {Array} options.buttons - Custom buttons array
     * @param {Function} options.onClose - Callback when alert closes
     * @param {boolean} options.clickOutsideToClose - Allow click outside to close (default: true)
     * @param {boolean} options.showProgress - Show progress bar (default: true)
     */
    show(options = {}) {
        const {
            type = 'info',
            title = 'Notifikasi',
            message = '',
            duration = 5000,
            buttons = null,
            onClose = null,
            clickOutsideToClose = true,
            showProgress = true,
            showCloseButton = true
        } = options;

        // Validate type
        const validTypes = ['success', 'error', 'warning', 'info'];
        if (!validTypes.includes(type)) {
            console.warn(`Invalid alert type: ${type}. Using 'info' instead.`);
            type = 'info';
        }

        // Create alert ID
        const alertId = this.generateId();

        // Create overlay
        const overlay = this.createOverlay(alertId, clickOutsideToClose, onClose);
        
        // Create alert container
        const container = this.createAlertContainer(alertId, type, title, message, buttons, showCloseButton, showProgress);
        
        // Add to DOM
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Add to active alerts
        this.activeAlerts.add(alertId);

        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            container.classList.add('slide-in');
        });

        // Auto close
        if (duration > 0) {
            const timeoutId = setTimeout(() => {
                this.close(alertId);
            }, duration);
            this.autoCloseTimeouts.set(alertId, timeoutId);
        }

        return alertId;
    }

    /**
     * Create overlay element
     */
    createOverlay(alertId, clickOutsideToClose, onClose) {
        const overlay = document.createElement('div');
        overlay.className = 'alert-overlay';
        overlay.id = `alert-overlay-${alertId}`;
        
        if (clickOutsideToClose) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(alertId, onClose);
                }
            });
        }

        return overlay;
    }

    /**
     * Create alert container
     */
    createAlertContainer(alertId, type, title, message, buttons, showCloseButton, showProgress) {
        const container = document.createElement('div');
        container.className = `alert-container ${type}`;
        container.id = `alert-container-${alertId}`;

        // Get icon for type
        const icon = this.getIcon(type);

        // Create buttons
        const buttonsHTML = buttons ? this.createButtonsHTML(buttons, alertId) : this.createDefaultButtonsHTML(alertId);

        container.innerHTML = `
            ${showCloseButton ? `<button class="alert-btn-close" onclick="window.universalAlert.close('${alertId}')">&times;</button>` : ''}
            
            <div class="alert-header">
                <div class="alert-icon ${type}">
                    <i class="fas ${icon}"></i>
                </div>
                <h3 class="alert-title">${this.escapeHtml(title)}</h3>
            </div>
            
            <div class="alert-body">
                <p class="alert-message">${this.escapeHtml(message)}</p>
            </div>
            
            ${buttonsHTML}
            
            ${showProgress ? `<div class="alert-progress ${type}"></div>` : ''}
        `;

        return container;
    }

    /**
     * Get FontAwesome icon for alert type
     */
    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Create default buttons HTML
     */
    createDefaultButtonsHTML(alertId) {
        return `
            <div class="alert-actions">
                <button class="alert-btn alert-btn-primary" onclick="window.universalAlert.close('${alertId}')">
                    <i class="fas fa-check"></i> OK
                </button>
            </div>
        `;
    }

    /**
     * Create custom buttons HTML
     */
    createButtonsHTML(buttons, alertId) {
        const buttonsHTML = buttons.map(button => {
            const classes = button.class || 'alert-btn alert-btn-secondary';
            const icon = button.icon ? `<i class="fas ${button.icon}"></i>` : '';
            const onclick = button.onclick ? `onclick="${button.onclick}"` : `onclick="window.universalAlert.close('${alertId}')"`;
            
            return `<button class="${classes}" ${onclick}>${icon} ${this.escapeHtml(button.text)}</button>`;
        }).join('');

        return `<div class="alert-actions">${buttonsHTML}</div>`;
    }

    /**
     * Close alert
     */
    close(alertId, onClose = null) {
        const overlay = document.getElementById(`alert-overlay-${alertId}`);
        const container = document.getElementById(`alert-container-${alertId}`);

        if (!overlay || !container) return;

        // Clear timeout if exists
        const timeoutId = this.autoCloseTimeouts.get(alertId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.autoCloseTimeouts.delete(alertId);
        }

        // Remove from active alerts
        this.activeAlerts.delete(alertId);

        // Animate out
        container.classList.add('slide-out');
        overlay.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // Call onClose callback
            if (onClose && typeof onClose === 'function') {
                onClose();
            }
        }, 300);
    }

    /**
     * Close all alerts
     */
    closeAll() {
        this.activeAlerts.forEach(alertId => {
            this.close(alertId);
        });
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Quick methods for common alert types
     */
    success(message, title = 'Berhasil', options = {}) {
        return this.show({ type: 'success', title, message, ...options });
    }

    error(message, title = 'Error', options = {}) {
        return this.show({ type: 'error', title, message, duration: 7000, ...options });
    }

    warning(message, title = 'Peringatan', options = {}) {
        return this.show({ type: 'warning', title, message, ...options });
    }

    info(message, title = 'Informasi', options = {}) {
        return this.show({ type: 'info', title, message, ...options });
    }

    /**
     * Loading alert
     */
    loading(message = 'Memproses...', title = 'Mohon Tunggu') {
        return this.show({
            type: 'info',
            title,
            message,
            duration: 0, // Don't auto close
            showProgress: false,
            clickOutsideToClose: false,
            buttons: [] // No buttons
        });
    }

    /**
     * Confirmation dialog
     */
    confirm(message, title = 'Konfirmasi', options = {}) {
        return new Promise((resolve) => {
            const buttons = [
                {
                    text: options.cancelText || 'Batal',
                    class: 'alert-btn alert-btn-secondary',
                    icon: 'fa-times',
                    onclick: `window.universalAlert.close('${this.generateId()}'); window.universalAlert._resolveConfirm(false);`
                },
                {
                    text: options.confirmText || 'Ya',
                    class: 'alert-btn alert-btn-primary',
                    icon: 'fa-check',
                    onclick: `window.universalAlert.close('${this.generateId()}'); window.universalAlert._resolveConfirm(true);`
                }
            ];

            // Store resolve function
            this._resolveConfirm = resolve;

            this.show({
                type: 'warning',
                title,
                message,
                buttons,
                duration: 0,
                showProgress: false,
                clickOutsideToClose: false
            });
        });
    }
}

// Initialize global instance
window.universalAlert = new UniversalAlert();

// Legacy compatibility functions
window.showAlert = function(type, message, title = null) {
    const titles = {
        success: 'Berhasil',
        error: 'Error',
        warning: 'Peringatan',
        info: 'Informasi'
    };
    
    return window.universalAlert.show({
        type,
        title: title || titles[type] || 'Notifikasi',
        message
    });
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalAlert;
}
