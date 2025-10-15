// Frontend integration untuk sistem kuota booking
class BookingQuotaFrontend {
    constructor() {
        this.apiBase = '/api/booking-quota';
    }

    /**
     * Generate booking number dengan validasi kuota
     * @param {Date} targetDate - Tanggal target booking
     * @param {string} userId - ID user
     * @returns {Promise<Object>} Booking number dan metadata
     */
    async generateBookingNumber(targetDate, userId) {
        try {
            const response = await fetch(`${this.apiBase}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    targetDate: targetDate.toISOString().split('T')[0],
                    userId: userId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal generate booking number');
            }

            return await response.json();
        } catch (error) {
            console.error('Error generating booking number:', error);
            throw error;
        }
    }

    /**
     * Cek ketersediaan kuota untuk tanggal tertentu
     * @param {Date} targetDate - Tanggal target
     * @returns {Promise<Object>} Status kuota
     */
    async checkQuotaAvailability(targetDate) {
        try {
            const response = await fetch(`${this.apiBase}/check?date=${targetDate.toISOString().split('T')[0]}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Gagal cek kuota');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking quota:', error);
            throw error;
        }
    }

    /**
     * Tampilkan widget kuota di form booking
     * @param {HTMLElement} container - Container untuk widget
     * @param {Date} targetDate - Tanggal target
     */
    async showQuotaWidget(container, targetDate) {
        try {
            const quota = await this.checkQuotaAvailability(targetDate);
            
            const widget = document.createElement('div');
            widget.className = 'quota-widget';
            widget.innerHTML = `
                <div class="quota-header">
                    <h4>📅 Kuota Booking - ${this.formatDate(targetDate)}</h4>
                </div>
                <div class="quota-content">
                    <div class="quota-progress">
                        <div class="quota-bar">
                            <div class="quota-fill" style="width: ${quota.percentage}%"></div>
                        </div>
                        <div class="quota-text">
                            ${quota.used}/${quota.limit} booking (${quota.percentage}%)
                        </div>
                    </div>
                    <div class="quota-status ${this.getQuotaStatusClass(quota.remaining)}">
                        <i class="fas ${this.getQuotaStatusIcon(quota.remaining)}"></i>
                        ${this.getQuotaStatusText(quota.remaining)}
                    </div>
                </div>
            `;

            container.innerHTML = '';
            container.appendChild(widget);
            
            return quota;
        } catch (error) {
            container.innerHTML = `
                <div class="quota-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    Gagal memuat data kuota: ${error.message}
                </div>
            `;
            throw error;
        }
    }

    /**
     * Update form dengan informasi booking number
     * @param {string} bookingNumber - Nomor booking yang dihasilkan
     * @param {Object} metadata - Metadata booking
     */
    updateFormWithBookingNumber(bookingNumber, metadata) {
        // Update input field
        const nobookingInput = document.getElementById('nobooking');
        if (nobookingInput) {
            nobookingInput.value = bookingNumber;
            nobookingInput.readOnly = true;
        }

        // Update display
        const bookingDisplay = document.getElementById('booking-display');
        if (bookingDisplay) {
            bookingDisplay.innerHTML = `
                <div class="booking-info">
                    <h3>📋 Nomor Booking: ${bookingNumber}</h3>
                    <div class="booking-details">
                        <p><strong>Tanggal:</strong> ${metadata.targetDate}</p>
                        <p><strong>Urutan Hari:</strong> ${metadata.dailySequence}</p>
                        <p><strong>Urutan Global:</strong> ${metadata.globalSequence}</p>
                        <p><strong>Kuota Tersisa:</strong> ${metadata.remainingQuota} booking</p>
                    </div>
                    ${metadata.isLastBooking ? '<div class="alert alert-warning">⚠️ Ini adalah booking terakhir untuk hari ini!</div>' : ''}
                </div>
            `;
        }
    }

    /**
     * Format tanggal untuk display
     */
    formatDate(date) {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Get CSS class untuk status kuota
     */
    getQuotaStatusClass(remaining) {
        if (remaining <= 0) return 'quota-full';
        if (remaining <= 5) return 'quota-critical';
        if (remaining <= 20) return 'quota-warning';
        return 'quota-normal';
    }

    /**
     * Get icon untuk status kuota
     */
    getQuotaStatusIcon(remaining) {
        if (remaining <= 0) return 'fa-ban';
        if (remaining <= 5) return 'fa-exclamation-triangle';
        if (remaining <= 20) return 'fa-exclamation-circle';
        return 'fa-check-circle';
    }

    /**
     * Get text untuk status kuota
     */
    getQuotaStatusText(remaining) {
        if (remaining <= 0) return 'Kuota Penuh';
        if (remaining <= 5) return `Kritis (${remaining} tersisa)`;
        if (remaining <= 20) return `Perhatian (${remaining} tersisa)`;
        return `Normal (${remaining} tersisa)`;
    }
}

// CSS untuk widget kuota
const quotaWidgetCSS = `
<style>
.quota-widget {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
}

.quota-header h4 {
    margin: 0 0 10px 0;
    color: #495057;
    font-size: 16px;
}

.quota-progress {
    margin-bottom: 10px;
}

.quota-bar {
    width: 100%;
    height: 20px;
    background-color: #e9ecef;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 5px;
}

.quota-fill {
    height: 100%;
    background: linear-gradient(90deg, #28a745, #ffc107, #dc3545);
    transition: width 0.3s ease;
}

.quota-text {
    font-size: 12px;
    color: #6c757d;
    text-align: center;
}

.quota-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
}

.quota-normal {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.quota-warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.quota-critical {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.quota-full {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.quota-error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}

.booking-info {
    background: #e7f3ff;
    border: 1px solid #b8daff;
    border-radius: 8px;
    padding: 15px;
    margin: 10px 0;
}

.booking-details p {
    margin: 5px 0;
    font-size: 14px;
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', quotaWidgetCSS);

// Export untuk penggunaan
window.BookingQuotaFrontend = BookingQuotaFrontend;
