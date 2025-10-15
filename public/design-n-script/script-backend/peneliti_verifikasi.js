let selectedNoBooking = null;
let allData = []; // Store all data
let currentPage = 1;
const itemsPerPage = 6; // 6 items per page

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

        // Store all data for pagination
        allData = data.data;
        
        // Clear existing content and create cards container
        tbody.innerHTML = '';
        
        // Create cards container
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'verification-cards-container';
        tbody.appendChild(cardsContainer);

        // Create pagination container
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        tbody.appendChild(paginationContainer);

        // Display current page
        displayPage(currentPage);
        
        // Show success message
        if (allData.length > 0) {
            console.log('✅ [FRONTEND] SUCCESS: Cards loaded successfully');
            showAlert('success', `Berhasil memuat ${allData.length} data verifikasi`);
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

// Function to display specific page
function displayPage(page) {
    const cardsContainer = document.querySelector('.verification-cards-container');
    const paginationContainer = document.querySelector('.pagination-container');
    
    if (!cardsContainer || !paginationContainer) return;
    
    // Clear existing cards
    cardsContainer.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = allData.slice(startIndex, endIndex);
    
    // Create cards for current page
    currentData.forEach(item => {
        createCard(cardsContainer, item);
    });
    
    // Create pagination controls
    createPagination(paginationContainer, page, totalPages);
    
    // Update current page
    currentPage = page;
}

// Function to create individual card
function createCard(container, item) {
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
                
                container.appendChild(card);

                // Create dropdown content for each card
                const dropdownContent = document.createElement('div');
                dropdownContent.className = 'card-dropdown-content';
                dropdownContent.style.display = 'none';
                
                try {
                    // Pesan status ringkas untuk kepegawaian
                    const sudahSetuju = String(item.persetujuan||'').toLowerCase()==='true';
                    const adaPemilihan = !!item.pemilihan;
                    const pesan1 = (sudahSetuju && adaPemilihan) ? `<p>Booking ini telah diberi persetujuan dan pemilihan (${item.pemilihan}).</p>` : '<p>Booking ini belum diberi persetujuan dan pemilihan.</p>';
                    
                    const signerUser = item.signer_userid || (String(item.tanda_tangan_path||'').match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i)?.[1]) || '—';
                    const hasSignature = item.peneliti_tanda_tangan_path || item.signer_userid;
                    const pesan2 = hasSignature ? `<p>Pemberi tanda tangan/paraf (${signerUser})</p>` : '<p>Belum diberikan tanda tangan/paraf</p>';
                    
                    dropdownContent.innerHTML = `
                        <div class="dropdown-content-wrapper">
                            <!-- Document Info Section -->
                            <div class="document-info-section">
                                <p><strong>No. Registrasi:</strong> ${item.no_registrasi || 'N/A'}</p>
                                <p><strong>Nama Wajib Pajak:</strong> ${item.namawajibpajak || 'N/A'}</p>
                                <p><strong>Nama Pemilik Objek:</strong> ${item.namapemilikobjekpajak || 'N/A'}</p>
                                ${pesan1}
                                ${pesan2}
                            </div>

                            <!-- Signature Section -->
                            ${item.peneliti_tanda_tangan_path ? `
                                <div class="signature-section">
                                    <div class="form-group approval-section">
                                        <label>
                                            <input type="radio" name="ParafVerif-${item.nobooking}" value="ya" required> Setujui Paraf
                                        </label>
                                        <div class="signature-preview">
                                            <p>Tanda Tangan Saat Ini:</p>
                                            <img src="${item.peneliti_tanda_tangan_path}"
                                                alt="Tanda Tangan" 
                                                class="signature-image"
                                                onerror="this.style.display='none'">
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="alert alert-warning">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Tidak dapat memberikan persetujuan - tanda tangan belum diunggah
                                </div>
                                <input type="hidden" name="ParafVerif-${item.nobooking}" value="null">
                            `}

                            <!-- Calculation Form Section -->
                            <div class="calculation-section">
                                <h6 class="section-title">Jumlah Setoran Berdasarkan:</h6>
                                ${item.pemilihan ? `
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="penghitungwajibpajak" name="pemilihan-${item.nobooking}" value="penghitung_wajib_pajak" ${item.pemilihan === 'penghitung_wajib_pajak' ? 'checked' : ''}>
                                            Penghitungan wajib pajak
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="stpdkurangbayar" name="pemilihan-${item.nobooking}" value="stpd_kurangbayar" ${item.pemilihan === 'stpd_kurangbayar' ? 'checked' : ''}>
                                            STPD kurang bayar
                                        </label>
                                        <div class="sub-inputs stpdkurangbayar-sub-input" data-parent="stpdkurangbayar">
                                            <input type="text" class="nomorstpd" name="nomorstpd" placeholder="Nomor STPD" value="${item.nomorstpd || ''}">
                                            <input type="date" class="tanggalstpd" name="tanggalstpd" value="${item.tanggalstpd || ''}">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="dihitungsendiri" name="pemilihan-${item.nobooking}" value="dihitungsendiri" ${item.pemilihan === 'dihitungsendiri' ? 'checked' : ''}>
                                            Pengurangan dihitung sendiri
                                        </label>
                                        <div class="sub-inputs dihitungsendiri-sub-input" data-parent="dihitungsendiri">
                                            <input type="number" class="angkapersen" name="angkapersen" placeholder="0-100" min="0" max="100" step="0.01" value="${item.angkapersen || ''}">
                                            <span>%</span>
                                            <input type="text" class="keterangandihitungSendiri" name="keteranganhitungsendiri" placeholder="Berdasarkan..." value="${item.keterangandihitungSendiri || ''}">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="lainnyapenghitungwp" name="pemilihan-${item.nobooking}" value="lainnyapenghitungwp" ${item.pemilihan === 'lainnyapenghitungwp' ? 'checked' : ''}>
                                            Lainnya
                                        </label>
                                        <div class="sub-inputs lainnyapenghitungwp-sub-input" data-parent="lainnyapenghitungwp">
                                            <input type="text" class="isiketeranganlainnya" name="isiketeranganlainnya" placeholder="Isikan disini..." value="${item.isiketeranganlainnya || ''}">
                                        </div>
                                    </div>
                                ` : `
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="penghitungwajibpajak" name="pemilihan-${item.nobooking}" value="penghitung_wajib_pajak">
                                            Penghitungan wajib pajak
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="stpdkurangbayar" name="pemilihan-${item.nobooking}" value="stpd_kurangbayar">
                                            STPD kurang bayar
                                        </label>
                                        <div class="sub-inputs stpdkurangbayar-sub-input" data-parent="stpdkurangbayar" style="display:none;">
                                            <input type="text" class="nomorstpd" name="nomorstpd" placeholder="Nomor STPD">
                                            <input type="date" class="tanggalstpd" name="tanggalstpd">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="dihitungsendiri" name="pemilihan-${item.nobooking}" value="dihitungsendiri">
                                            Pengurangan dihitung sendiri
                                        </label>
                                        <div class="sub-inputs dihitungsendiri-sub-input" data-parent="dihitungsendiri" style="display:none;">
                                            <input type="number" class="angkapersen" name="angkapersen" placeholder="0-100" min="0" max="100" step="0.01">
                                            <span>%</span>
                                            <input type="text" class="keterangandihitungSendiri" name="keteranganhitungsendiri" placeholder="Berdasarkan...">
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="radio" class="lainnyapenghitungwp" name="pemilihan-${item.nobooking}" value="lainnyapenghitungwp">
                                            Lainnya
                                        </label>
                                        <div class="sub-inputs lainnyapenghitungwp-sub-input" data-parent="lainnyapenghitungwp" style="display:none;">
                                            <input type="text" class="isiketeranganlainnya" name="isiketeranganlainnya" placeholder="Isikan disini...">
                                        </div>
                                    </div>
                                `}
                            </div>

                            <!-- Action Buttons Section -->
                            <div class="action-buttons">
                                <button type="button" class="btn-save-verification" data-nobooking="${item.nobooking}">
                                    <i class="fas fa-save"></i> Simpan Verifikasi
                                </button>
                                <button type="button" class="btn-send-to-paraf" data-nobooking="${item.nobooking}">
                                    <i class="fas fa-paper-plane"></i> Kirim ke Paraf
                                </button>
                            </div>

                            <!-- Document Links Section -->
                            <div class="document-links-section">
                                <h6 class="document-links-title">Dokumen Terkait:</h6>
                                <div class="document-links-list">
                                    ${generateDocumentLinks(item)}
                                </div>
                            </div>
                        </div>
                    `;
                    
                } catch (dropdownError) {
                    console.error('Dropdown Creation Error:', dropdownError);
                    dropdownContent.innerHTML = '<p>Gagal memuat detail data</p>';
                }

                // Add dropdown to card
                card.appendChild(dropdownContent);

                // Add click handler to toggle dropdown
                card.addEventListener('click', function(e) {
                    // Don't toggle if clicking on buttons
                    if (e.target.closest('button')) return;
                    
                    const dropdown = this.querySelector('.card-dropdown-content');
                    if (dropdown) {
                        const isVisible = dropdown.style.display !== 'none';
                        dropdown.style.display = isVisible ? 'none' : 'block';
                        
                        // Smooth animation
                        if (!isVisible) {
                            dropdown.style.opacity = '0';
                            dropdown.style.transform = 'translateY(-10px)';
                            setTimeout(() => {
                                dropdown.style.transition = 'all 0.3s ease';
                                dropdown.style.opacity = '1';
                                dropdown.style.transform = 'translateY(0)';
                            }, 10);
                        }
                    }
                });

                // Add event listeners for form interactions
                setupFormInteractions(card, item);

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
        container.appendChild(errorCard);
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

// Setup form interactions for dropdown
function setupFormInteractions(card, item) {
    // Radio button interactions for sub-inputs
    const radioButtons = card.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            const parentType = this.className;
            const subInputs = card.querySelectorAll('.sub-inputs');
            
            // Hide all sub-inputs
            subInputs.forEach(subInput => {
                subInput.style.display = 'none';
            });
            
            // Show relevant sub-input
            const targetSubInput = card.querySelector(`.${parentType}-sub-input`);
            if (targetSubInput && this.checked) {
                targetSubInput.style.display = 'block';
            }
        });
    });

    // Save verification button
    const saveButton = card.querySelector('.btn-save-verification');
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            try {
                await saveVerificationData(card, item);
            } catch (error) {
                console.error('Save Verification Error:', error);
                showAlert('error', `Gagal menyimpan: ${error.message}`);
            }
        });
    }

    // Send to paraf button
    const sendToParafButton = card.querySelector('.btn-send-to-paraf');
    if (sendToParafButton) {
        sendToParafButton.addEventListener('click', async () => {
            try {
                await sendToParafKasie(item);
            } catch (error) {
                console.error('Send to Paraf Error:', error);
                showAlert('error', `Gagal mengirim: ${error.message}`);
            }
        });
    }
}

// Save verification data function
async function saveVerificationData(card, item) {
    try {
        // Collect form data
        const formData = {
            userid: item.userid,
            nobooking: item.nobooking,
            pemilihan: card.querySelector(`input[name="pemilihan-${item.nobooking}"]:checked`)?.value,
            nomorstpd: card.querySelector('.nomorstpd')?.value || null,
            tanggalstpd: card.querySelector('.tanggalstpd')?.value || null,
            angkapersen: card.querySelector('.angkapersen')?.value || null,
            keterangandihitungSendiri: card.querySelector('.keterangandihitungSendiri')?.value || null,
            isiketeranganlainnya: card.querySelector('.isiketeranganlainnya')?.value || null,
            persetujuanVerif: card.querySelector(`input[name="ParafVerif-${item.nobooking}"]:checked`)?.value === 'ya'
        };

        console.log('Saving verification data:', formData);

        const response = await fetch('/api/peneliti_update-berdasarkan-pemilihan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ data: formData })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        showAlert('success', 'Data verifikasi berhasil disimpan!');
        return result;
    } catch (error) {
        console.error('Save Verification Error:', error);
        throw error;
    }
}

// Generate document links function
function generateDocumentLinks(item) {
    const links = [];
    
    if (item.akta_tanah_path) {
        links.push(`<a href="${item.akta_tanah_path}" target="_blank" class="document-link">
            <i class="fas fa-file-alt"></i> Akta Tanah
        </a>`);
    }
    
    if (item.sertifikat_tanah_path) {
        links.push(`<a href="${item.sertifikat_tanah_path}" target="_blank" class="document-link">
            <i class="fas fa-certificate"></i> Sertifikat Tanah
        </a>`);
    }
    
    if (item.pelengkap_path) {
        links.push(`<a href="${item.pelengkap_path}" target="_blank" class="document-link">
            <i class="fas fa-file-pdf"></i> Dokumen Pelengkap
        </a>`);
    }
    
    return links.length > 0 ? links.join('') : '<p class="no-documents">Tidak ada dokumen tersedia</p>';
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
        
        showAlert('success', 'Data berhasil dikirim ke peneliti paraf!');
        return result;
    } catch (error) {
        console.error('Send to Paraf Error:', error);
        throw error;
    }
}

// Function to create pagination controls
function createPagination(container, currentPage, totalPages) {
    container.innerHTML = '';
    
    if (totalPages <= 1) return; // No pagination needed
    
    // Pagination info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, allData.length);
    
    const info = document.createElement('div');
    info.className = 'pagination-info';
    info.textContent = `Menampilkan ${startItem}-${endItem} dari ${allData.length} data`;
    container.appendChild(info);
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button';
    prevButton.innerHTML = '‹ Sebelumnya';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    });
    container.appendChild(prevButton);
    
    // Page numbers
    const numbersContainer = document.createElement('div');
    numbersContainer.className = 'pagination-numbers';
    
    // Calculate page range
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Adjust range if we're near the beginning or end
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            displayPage(i);
        });
        numbersContainer.appendChild(pageButton);
    }
    
    container.appendChild(numbersContainer);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button';
    nextButton.innerHTML = 'Selanjutnya ›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    });
    container.appendChild(nextButton);
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
