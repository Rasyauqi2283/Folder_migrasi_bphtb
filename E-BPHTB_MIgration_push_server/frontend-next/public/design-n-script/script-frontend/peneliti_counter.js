/**
 * PENELITI DAILY COUNTER FRONTEND INTEGRATION
 * JavaScript untuk mengintegrasikan counter harian peneliti dengan UI
 */

class PenelitiCounter {
    constructor() {
        this.userid = this.getCurrentUserid();
        this.apiBaseUrl = '/api/peneliti';
        this.counterData = null;
        this.updateInterval = null;
        this.init();
    }

    /**
     * Mendapatkan userid peneliti dari session atau localStorage
     */
    getCurrentUserid() {
        // Coba dari session storage
        const sessionUserid = sessionStorage.getItem('userid');
        if (sessionUserid && sessionUserid.startsWith('P')) {
            return sessionUserid;
        }

        // Coba dari localStorage
        const localUserid = localStorage.getItem('userid');
        if (localUserid && localUserid.startsWith('P')) {
            return localUserid;
        }

        // Coba dari profile overlay
        const profileUserid = document.querySelector('.userid');
        if (profileUserid && profileUserid.textContent.startsWith('P')) {
            return profileUserid.textContent;
        }

        // Default fallback
        return 'P01';
    }

    /**
     * Inisialisasi counter
     */
    async init() {
        try {
            await this.loadCounterData();
            this.createCounterUI();
            this.startAutoUpdate();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing peneliti counter:', error);
        }
    }

    /**
     * Load data counter dari API
     */
    async loadCounterData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/counter/${this.userid}`);
            const result = await response.json();
            
            if (result.success) {
                this.counterData = result.data;
                return this.counterData;
            } else {
                throw new Error(result.message || 'Failed to load counter data');
            }
        } catch (error) {
            console.error('Error loading counter data:', error);
            // Fallback data
            this.counterData = {
                userid: this.userid,
                counter: 0,
                percentage_complete: 0,
                remaining_slots: 80,
                workload_status: 'VERY LOW'
            };
            return this.counterData;
        }
    }

    /**
     * Membuat UI counter
     */
    createCounterUI() {
        // Cari container yang tepat
        const container = this.findCounterContainer();
        if (!container) {
            console.warn('Counter container not found');
            return;
        }

        // Hapus counter lama jika ada
        const existingCounter = container.querySelector('.peneliti-counter');
        if (existingCounter) {
            existingCounter.remove();
        }

        // Buat counter baru
        const counterHTML = this.generateCounterHTML();
        container.insertAdjacentHTML('beforeend', counterHTML);

        // Update display
        this.updateCounterDisplay();
    }

    /**
     * Mencari container untuk counter
     */
    findCounterContainer() {
        // Coba beberapa lokasi yang mungkin
        const selectors = [
            '.header-right',
            '.profile-pic-container',
            '.members-count',
            '.real-time-controls',
            'main .main-content'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }

        // Jika tidak ditemukan, buat di header
        const header = document.querySelector('header');
        if (header) {
            const counterDiv = document.createElement('div');
            counterDiv.className = 'peneliti-counter-container';
            header.appendChild(counterDiv);
            return counterDiv;
        }

        return null;
    }

    /**
     * Generate HTML untuk counter
     */
    generateCounterHTML() {
        return `
            <div class="peneliti-counter">
                <div class="counter-header">
                    <i class="fa fa-chart-line"></i>
                    <span class="counter-title">Produktivitas Hari Ini</span>
                </div>
                <div class="counter-display">
                    <span class="current-counter">0</span>
                    <span class="separator">/</span>
                    <span class="limit-counter">80</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
                <div class="counter-status">
                    <span class="status-text">Siap bekerja</span>
                    <span class="remaining-slots">80 slot tersisa</span>
                </div>
                <div class="counter-actions">
                    <button class="btn-refresh-counter" title="Refresh Counter">
                        <i class="fa fa-refresh"></i>
                    </button>
                    <button class="btn-view-history" title="Lihat History">
                        <i class="fa fa-history"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Update display counter
     */
    updateCounterDisplay() {
        if (!this.counterData) return;

        const counter = this.counterData;
        
        // Update counter display
        const currentCounter = document.querySelector('.current-counter');
        const limitCounter = document.querySelector('.limit-counter');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const statusText = document.querySelector('.status-text');
        const remainingSlots = document.querySelector('.remaining-slots');

        if (currentCounter) currentCounter.textContent = counter.counter || 0;
        if (limitCounter) limitCounter.textContent = '80';
        if (progressFill) progressFill.style.width = `${counter.percentage_complete || 0}%`;
        if (progressText) progressText.textContent = `${counter.percentage_complete || 0}%`;
        if (remainingSlots) remainingSlots.textContent = `${counter.remaining_slots || 80} slot tersisa`;

        // Update status text dan warna
        if (statusText) {
            statusText.textContent = this.getStatusText(counter.workload_status);
            statusText.className = `status-text ${counter.workload_status.toLowerCase().replace(' ', '-')}`;
        }

        // Update warna progress bar
        if (progressFill) {
            progressFill.className = `progress-fill ${this.getProgressColor(counter.percentage_complete)}`;
        }
    }

    /**
     * Mendapatkan teks status berdasarkan workload
     */
    getStatusText(workloadStatus) {
        const statusMap = {
            'VERY LOW': 'Siap bekerja',
            'LOW': 'Sedang bekerja',
            'MEDIUM': 'Produktif',
            'HIGH': 'Sangat produktif',
            'LIMIT REACHED': 'Target tercapai!'
        };
        return statusMap[workloadStatus] || 'Siap bekerja';
    }

    /**
     * Mendapatkan warna progress bar
     */
    getProgressColor(percentage) {
        if (percentage >= 100) return 'limit-reached';
        if (percentage >= 75) return 'high';
        if (percentage >= 50) return 'medium';
        if (percentage >= 25) return 'low';
        return 'very-low';
    }

    /**
     * Increment counter
     */
    async incrementCounter() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/counter/${this.userid}/increment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: new Date().toISOString().split('T')[0]
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.counterData = result.data;
                this.updateCounterDisplay();
                this.showIncrementNotification();
                return true;
            } else {
                throw new Error(result.message || 'Failed to increment counter');
            }
        } catch (error) {
            console.error('Error incrementing counter:', error);
            this.showErrorNotification('Gagal update counter');
            return false;
        }
    }

    /**
     * Start auto-update counter
     */
    startAutoUpdate() {
        // Update setiap 30 detik
        this.updateInterval = setInterval(async () => {
            await this.loadCounterData();
            this.updateCounterDisplay();
        }, 30000);
    }

    /**
     * Stop auto-update counter
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Bind events
     */
    bindEvents() {
        // Refresh button
        const refreshBtn = document.querySelector('.btn-refresh-counter');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadCounterData();
                this.updateCounterDisplay();
                this.showSuccessNotification('Counter diupdate');
            });
        }

        // History button
        const historyBtn = document.querySelector('.btn-view-history');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showHistoryModal();
            });
        }

        // Auto-increment saat tanda tangan diberikan
        this.bindSignatureEvents();
    }

    /**
     * Bind events untuk tanda tangan
     */
    bindSignatureEvents() {
        // Cari tombol tanda tangan
        const signatureButtons = document.querySelectorAll('button[id*="tandatangan"], button[id*="signature"], button[id*="paraf"]');
        
        signatureButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Delay sedikit untuk memastikan proses selesai
                setTimeout(async () => {
                    const success = await this.incrementCounter();
                    if (success) {
                        console.log('✅ Counter incremented after signature');
                    }
                }, 1000);
            });
        });

        // Bind untuk overlay buttons
        const overlayButtons = document.querySelectorAll('#overlay-sign button, #overlay-sign-confirmed button');
        overlayButtons.forEach(btn => {
            if (btn.textContent.includes('Tambahkan') || btn.textContent.includes('Iya')) {
                btn.addEventListener('click', async () => {
                    setTimeout(async () => {
                        await this.incrementCounter();
                    }, 1500);
                });
            }
        });
    }

    /**
     * Show increment notification
     */
    showIncrementNotification() {
        this.showNotification('Counter +1! Produktivitas meningkat', 'success');
    }

    /**
     * Show success notification
     */
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.peneliti-counter-notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = `peneliti-counter-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        if (!document.getElementById('peneliti-counter-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'peneliti-counter-notification-styles';
            style.textContent = `
                .peneliti-counter-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    animation: slideInRight 0.3s ease-out;
                    border-left: 4px solid #28a745;
                }
                
                .peneliti-counter-notification.success {
                    border-left-color: #28a745;
                }
                
                .peneliti-counter-notification.error {
                    border-left-color: #dc3545;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
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

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    /**
     * Show history modal
     */
    async showHistoryModal() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/counter/history/${this.userid}?days=7`);
            const result = await response.json();
            
            if (result.success) {
                this.createHistoryModal(result.data);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showErrorNotification('Gagal memuat history');
        }
    }

    /**
     * Create history modal
     */
    createHistoryModal(historyData) {
        // Remove existing modal
        const existing = document.querySelector('.peneliti-history-modal');
        if (existing) existing.remove();

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'peneliti-history-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>History Produktivitas (7 Hari Terakhir)</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="history-list">
                            ${historyData.map(day => `
                                <div class="history-item">
                                    <div class="history-date">${new Date(day.date).toLocaleDateString('id-ID')}</div>
                                    <div class="history-counter">${day.counter}/80</div>
                                    <div class="history-percentage">${day.percentage_complete}%</div>
                                    <div class="history-status ${day.workload_status.toLowerCase().replace(' ', '-')}">${day.workload_status}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal styles
        if (!document.getElementById('peneliti-history-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'peneliti-history-modal-styles';
            style.textContent = `
                .peneliti-history-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80%;
                    overflow: hidden;
                }
                
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                }
                
                .modal-body {
                    padding: 20px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .history-item:last-child {
                    border-bottom: none;
                }
                
                .history-date {
                    font-weight: 500;
                }
                
                .history-counter {
                    font-weight: bold;
                    color: #007bff;
                }
                
                .history-percentage {
                    font-size: 12px;
                    color: #666;
                }
                
                .history-status {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .history-status.limit-reached {
                    background: #dc3545;
                    color: white;
                }
                
                .history-status.high {
                    background: #fd7e14;
                    color: white;
                }
                
                .history-status.medium {
                    background: #ffc107;
                    color: black;
                }
                
                .history-status.low {
                    background: #28a745;
                    color: white;
                }
                
                .history-status.very-low {
                    background: #6c757d;
                    color: white;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        // Close modal events
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }

    /**
     * Destroy counter
     */
    destroy() {
        this.stopAutoUpdate();
        const counter = document.querySelector('.peneliti-counter');
        if (counter) counter.remove();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a peneliti page
    const isPenelitiPage = window.location.pathname.includes('peneliti') || 
                          document.querySelector('.peneliti-counter') ||
                          document.querySelector('[class*="peneliti"]');
    
    if (isPenelitiPage) {
        window.penelitiCounter = new PenelitiCounter();
        console.log('✅ Peneliti Counter initialized');
    }
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PenelitiCounter;
}
