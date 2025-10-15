let selectedNoBooking = null;

// Fungsi UTAMA untuk memuat data ke dalam card layout
async function loadTableDataPenelitiV() {
    try {
        console.log('🔍 [FRONTEND] ===== PENELITI VERIFIKASI LOADING (CARD LAYOUT) =====');
        console.log('🔍 [FRONTEND] Timestamp:', new Date().toISOString());
        console.log('🔍 [FRONTEND] URL:', window.location.href);
        
        // Validate user division
        const userDivisi = getUserDivisi();
        console.log('🔍 [FRONTEND] User division check:', {
            userDivisi: userDivisi,
            userDivisiType: typeof userDivisi,
            isString: typeof userDivisi === 'string',
            isPeneliti: userDivisi === 'Peneliti'
        });
        
        if (typeof userDivisi !== 'string') {
            throw new Error('Invalid user division data');
        }

        if (userDivisi !== 'Peneliti') {
            console.log('❌ [FRONTEND] BLOCKED: User divisi is not Peneliti:', userDivisi);
            alert('Anda tidak memiliki akses ke data Peneliti');
            return;
        }
        
        console.log('✅ [FRONTEND] User division validated, proceeding with API call...');

        // Fetch data with timeout
        let response;
        console.log('🔍 [FRONTEND] Making API request to /api/peneliti_get-berkas-fromltb...');
        try {
            response = await Promise.race([
                fetch('/api/peneliti_get-berkas-fromltb', { credentials: 'include' }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout: Server took too long to respond')), 10000))
            ]);

            console.log('🔍 [FRONTEND] API Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok && response.status !== 404) {
                console.log('❌ [FRONTEND] API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (fetchError) {
            console.error('❌ [FRONTEND] Fetch Error:', {
                errorMessage: fetchError.message,
                errorName: fetchError.name,
                errorStack: fetchError.stack,
                timestamp: new Date().toISOString()
            });
            throw new Error(`Gagal memuat data: ${fetchError.message}`);
        }

        // Parse JSON data
        let data;
        try {
            if (response.status === 404) {
                data = { success: true, data: [] };
            } else {
                data = await response.json();
                
                if (!data || typeof data !== 'object') {
                    throw new Error('Invalid data format received from server');
                }
                
                if (!data.success) {
                    throw new Error(data.message || 'Server returned unsuccessful response');
                }
                
                if (!Array.isArray(data.data)) {
                    throw new Error('Expected array data not found in response');
                }
            }
        } catch (parseError) {
            console.error('Parse Error:', parseError);
            throw new Error(`Gagal memproses data: ${parseError.message}`);
        }

        // DOM manipulation - Create card-based layout
        const tbody = document.querySelector('.data-masuk');
        if (!tbody) {
            throw new Error('Target table body element not found');
        }

        // Clear existing content and create cards container
        tbody.innerHTML = '';
        
        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'verification-cards-container';
        tbody.appendChild(cardsContainer);

        // Process each item and create cards
        data.data.forEach(item => {
            try {
                // Validate required fields
                const criticalFields = ['no_registrasi','nobooking'];
                const missingCritical = criticalFields.filter(field => !item[field]);
                if (missingCritical.length > 0) {
                    console.warn(`Skipping row missing critical fields for nobooking ${item.nobooking || 'unknown'}:`, missingCritical);
                    return;
                }

                // Create verification card
                const card = document.createElement('div');
                card.className = 'verification-card';
                
                // Format data for display
                const formatValue = (value) => {
                    return (value === undefined || value === null || value === '' || value === '-') ? 'Belum diisi' : value;
                };
                
                const statusClass = (item.trackstatus || '').toLowerCase().replace(/\s+/g, '');
                
                card.innerHTML = `
                    <div class="card-header">
                        <div>
                            <h3 class="primary-info">${formatValue(item.no_registrasi)}</h3>
                            <p class="secondary-info">${formatValue(item.nobooking)}</p>
                        </div>
                        <button class="btn-kirim-prominent" data-nobooking="${item.nobooking}">
                            <span>📤</span> Kirim
                        </button>
                    </div>
                    
                    <div class="card-content">
                        <div class="info-item">
                            <span class="info-label">NOP PBB</span>
                            <span class="info-value ${formatValue(item.noppbb) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.noppbb)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">User ID</span>
                            <span class="info-value ${formatValue(item.userid) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.userid)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nama Wajib Pajak</span>
                            <span class="info-value ${formatValue(item.namawajibpajak) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.namawajibpajak)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Pemilik Objek</span>
                            <span class="info-value ${formatValue(item.namapemilikobjekpajak) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.namapemilikobjekpajak)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Special Field</span>
                            <span class="info-value ${formatValue(item.creator_special_field) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.creator_special_field)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Jenis Wajib Pajak</span>
                            <span class="info-value ${formatValue(item.jenis_wajib_pajak) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.jenis_wajib_pajak)}</span>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <div class="tanggal-info">${formatValue(item.tanggal_terima)}</div>
                        <span class="status-badge ${statusClass}">${formatValue(item.trackstatus)}</span>
                    </div>
                `;
                
                // Add event listener to send button
                const sendButton = card.querySelector('.btn-kirim-prominent');
                sendButton.addEventListener('click', async () => {
                    try {
                        const confirmation = window.confirm("Apakah kamu yakin ingin mengirim data ini? Sudah diperiksa?");
                        
                        if (confirmation) {
                            if (!item || !item.nobooking) {
                                throw new Error("Data yang diperlukan tidak lengkap (nobooking).");
                            }

                            const result = await sendToParafKasie(item);
                            if (result && result.success) {
                                sendButton.disabled = true;
                                sendButton.innerHTML = '<span>✅</span> Terkirim';
                                sendButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                                showAlert('success', "Data berhasil dikirim ke peneliti paraf!");
                            } else {
                                const msg = (result && result.message) ? result.message : "Gagal mengirim data ke peneliti.";
                                throw new Error(msg);
                            }
                        } else {
                            showAlert('info', "Data tidak jadi dikirim.");
                        }
                    } catch (buttonError) {
                        console.error('Button Action Error:', buttonError);
                        showAlert('error', `Terjadi kesalahan: ${buttonError.message}`);
                    }
                });
                
                cardsContainer.appendChild(card);

            } catch (itemError) {
                console.error('Error processing item:', itemError);
                // Create error card for failed items
                const errorCard = document.createElement('div');
                errorCard.className = 'verification-card';
                errorCard.style.border = '1px solid #ef4444';
                errorCard.innerHTML = `
                    <div class="card-header">
                        <div>
                            <h3 class="primary-info" style="color: #ef4444;">Error</h3>
                            <p class="secondary-info">Gagal memuat data</p>
                        </div>
                    </div>
                    <div class="card-content">
                        <p style="color: #ef4444;">${itemError.message}</p>
                    </div>
                `;
                cardsContainer.appendChild(errorCard);
            }
        });

        // Show success message
        if (data.data.length > 0) {
            console.log('✅ [FRONTEND] SUCCESS: Cards loaded successfully');
            showAlert('success', `Berhasil memuat ${data.data.length} data verifikasi`);
        } else {
            console.log('⚠️ [FRONTEND] NO DATA: No verification data found');
            showAlert('info', 'Tidak ada data verifikasi yang ditemukan');
        }

    } catch (mainError) {
        console.error('❌ [FRONTEND] Main Function Error:', {
            errorMessage: mainError.message,
            errorName: mainError.name,
            errorStack: mainError.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        const errorContainer = document.querySelector('.data-masuk') || document.body;
        errorContainer.innerHTML = `
            <div class="error-message" style="
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                border: 1px solid #ef4444;
                border-radius: 12px;
                padding: 24px;
                margin: 20px;
                color: #f3f4f6;
                text-align: center;
            ">
                <h3 style="color: #ef4444; margin-bottom: 16px;">❌ Terjadi Kesalahan</h3>
                <p style="margin-bottom: 20px;">${mainError.message}</p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">🔄 Coba Lagi</button>
            </div>
        `;
    }
}

// Helper function to get user division
function getUserDivisi() {
    try {
        // Try to get from window object first
        if (window.userDivisi && typeof window.userDivisi === 'string') {
            return window.userDivisi;
        }
        
        // Try to get from session storage
        const sessionDivisi = sessionStorage.getItem('userDivisi');
        if (sessionDivisi && typeof sessionDivisi === 'string') {
            return sessionDivisi;
        }
        
        // Try to get from localStorage
        const localDivisi = localStorage.getItem('userDivisi');
        if (localDivisi && typeof localDivisi === 'string') {
            return localDivisi;
        }
        
        // Default fallback
        return 'Peneliti';
    } catch (error) {
        console.warn('Error getting user division:', error);
        return 'Peneliti';
    }
}

// Helper function to show alerts
function showAlert(type, message) {
    try {
        // Create alert element
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        // Set background based on type
        switch(type) {
            case 'success':
                alert.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                break;
            case 'error':
                alert.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                break;
            case 'warning':
                alert.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                break;
            default:
                alert.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        }
        
        alert.textContent = message;
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error showing alert:', error);
        alert(message); // Fallback to browser alert
    }
}

// Send to Paraf Kasie function
async function sendToParafKasie(item) {
    try {
        const response = await fetch('/api/peneliti_send-to-paraf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nobooking: item.nobooking,
                no_registrasi: item.no_registrasi
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('Send to Paraf Error:', error);
        throw error;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [FRONTEND] Peneliti Verifikasi Cards initialized');
    loadTableDataPenelitiV();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
