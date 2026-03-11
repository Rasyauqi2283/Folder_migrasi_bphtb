/**
 * Smooth Real-Time Update System
 * 
 * Fitur:
 * - Update data tanpa reload penuh (hanya tambahkan row baru)
 * - Smooth animation untuk data baru
 * - Tidak mengganggu user yang sedang mengedit
 * - Preserve scroll position
 * - Diff-based updates (hanya update yang berubah)
 */

class SmoothRealTimeUpdater {
    constructor(options = {}) {
        this.tableId = options.tableId || 'dataTable';
        this.tbodySelector = options.tbodySelector || 'tbody.data-masuk';
        this.apiEndpoint = options.apiEndpoint;
        this.dataKey = options.dataKey || 'nobooking'; // Unique identifier untuk setiap row
        this.renderRowFunction = options.renderRowFunction; // Function untuk render row
        this.interval = options.interval || 5000; // Polling interval (ms)
        this.enabled = true;
        this.lastDataMap = new Map(); // Store last data untuk diff comparison
        this.isUserInteracting = false;
        this.lastUserActivity = Date.now();
        this.updateTimer = null;
    }

    /**
     * Track user activity untuk pause updates saat user sedang aktif
     */
    trackUserActivity() {
        this.lastUserActivity = Date.now();
        this.isUserInteracting = true;
        
        // Reset setelah 3 detik tidak ada aktivitas
        setTimeout(() => {
            if (Date.now() - this.lastUserActivity >= 3000) {
                this.isUserInteracting = false;
            }
        }, 3000);
    }

    /**
     * Fetch data dari API
     */
    async fetchData() {
        if (!this.apiEndpoint) {
            console.warn('⚠️ API endpoint not configured');
            return null;
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.success ? (data.data || data.rows || []) : [];
        } catch (error) {
            console.error('❌ Error fetching data:', error);
            return null;
        }
    }

    /**
     * Compare data baru dengan data lama untuk menemukan data baru
     */
    findNewData(newData, oldDataMap) {
        const newItems = [];
        
        newData.forEach(item => {
            const key = item[this.dataKey];
            if (!oldDataMap.has(key)) {
                // Data baru ditemukan
                newItems.push(item);
            }
        });

        return newItems;
    }

    /**
     * Find data yang dihapus atau diupdate
     */
    findRemovedOrUpdatedData(newData, oldDataMap) {
        const newDataKeys = new Set(newData.map(item => item[this.dataKey]));
        const removedKeys = [];
        
        oldDataMap.forEach((oldItem, key) => {
            if (!newDataKeys.has(key)) {
                removedKeys.push(key);
            }
        });

        return removedKeys;
    }

    /**
     * Insert row baru dengan smooth animation
     */
    insertRowSmooth(item, position = 'top') {
        const tbody = document.querySelector(this.tbodySelector);
        if (!tbody) return;

        // Render row baru
        const newRow = this.renderRowFunction(item);
        if (!newRow) return;

        // Add animation class
        newRow.classList.add('new-row-animation');
        newRow.style.opacity = '0';
        newRow.style.transform = 'translateY(-20px)';

        // Insert row
        if (position === 'top') {
            tbody.insertBefore(newRow, tbody.firstChild);
        } else {
            tbody.appendChild(newRow);
        }

        // Trigger animation
        requestAnimationFrame(() => {
            newRow.style.transition = 'all 0.4s ease-out';
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateY(0)';
        });

        // Remove animation class setelah animasi selesai
        setTimeout(() => {
            newRow.classList.remove('new-row-animation');
            newRow.style.transition = '';
        }, 400);

        // Highlight effect
        newRow.classList.add('row-highlight');
        setTimeout(() => {
            newRow.classList.remove('row-highlight');
        }, 2000);
    }

    /**
     * Remove row dengan smooth animation
     */
    removeRowSmooth(key) {
        const tbody = document.querySelector(this.tbodySelector);
        if (!tbody) return;

        const row = tbody.querySelector(`tr[data-${this.dataKey}="${key}"]`);
        if (!row) return;

        // Animate out
        row.style.transition = 'all 0.3s ease-out';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        row.style.maxHeight = row.offsetHeight + 'px';

        setTimeout(() => {
            row.style.maxHeight = '0';
            row.style.padding = '0';
            row.style.margin = '0';
        }, 100);

        setTimeout(() => {
            if (row.parentNode) {
                row.remove();
            }
        }, 300);
    }

    /**
     * Update existing row tanpa reload penuh
     */
    updateRowSmooth(item) {
        const tbody = document.querySelector(this.tbodySelector);
        if (!tbody) return;

        const key = item[this.dataKey];
        const existingRow = tbody.querySelector(`tr[data-${this.dataKey}="${key}"]`);
        
        if (!existingRow) {
            // Row tidak ada, insert baru
            this.insertRowSmooth(item);
            return;
        }

        // Update row dengan highlight effect
        existingRow.classList.add('row-update-highlight');
        
        // Update cell values jika diperlukan
        const cells = existingRow.querySelectorAll('td');
        // Implementasi update cell sesuai kebutuhan
        
        setTimeout(() => {
            existingRow.classList.remove('row-update-highlight');
        }, 1000);
    }

    /**
     * Check for updates dan apply changes
     */
    async checkAndUpdate() {
        if (!this.enabled || this.isUserInteracting) {
            return;
        }

        const newData = await this.fetchData();
        if (!newData || !Array.isArray(newData)) {
            return;
        }

        // Convert new data to Map untuk comparison
        const newDataMap = new Map();
        newData.forEach(item => {
            const key = item[this.dataKey];
            if (key) {
                newDataMap.set(key, item);
            }
        });

        // Find new data
        const newItems = this.findNewData(newData, this.lastDataMap);
        
        // Find removed data
        const removedKeys = this.findRemovedOrUpdatedData(newData, this.lastDataMap);

        // Apply changes
        if (newItems.length > 0) {
            console.log(`🆕 Found ${newItems.length} new items`);
            
            // Preserve scroll position
            const tbody = document.querySelector(this.tbodySelector);
            const scrollContainer = tbody.closest('.table-scroll') || window;
            const scrollTop = scrollContainer === window ? window.scrollY : scrollContainer.scrollTop;
            
            // Insert new rows
            newItems.forEach(item => {
                this.insertRowSmooth(item, 'top'); // Insert di atas
            });

            // Restore scroll position
            requestAnimationFrame(() => {
                if (scrollContainer === window) {
                    window.scrollTo({ top: scrollTop, behavior: 'auto' });
                } else {
                    scrollContainer.scrollTop = scrollTop;
                }
            });
        }

        // Remove deleted rows
        if (removedKeys.length > 0) {
            console.log(`🗑️ Found ${removedKeys.length} removed items`);
            removedKeys.forEach(key => {
                this.removeRowSmooth(key);
            });
        }

        // Update data map
        this.lastDataMap = newDataMap;
    }

    /**
     * Start real-time monitoring
     */
    start() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Initial load
        this.checkAndUpdate();

        // Start polling
        this.updateTimer = setInterval(() => {
            this.checkAndUpdate();
        }, this.interval);

        console.log('🔄 Smooth real-time monitoring started');
    }

    /**
     * Stop real-time monitoring
     */
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        console.log('⏹️ Smooth real-time monitoring stopped');
    }

    /**
     * Toggle monitoring
     */
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.start();
        } else {
            this.stop();
        }
        return this.enabled;
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmoothRealTimeUpdater;
} else {
    window.SmoothRealTimeUpdater = SmoothRealTimeUpdater;
}

