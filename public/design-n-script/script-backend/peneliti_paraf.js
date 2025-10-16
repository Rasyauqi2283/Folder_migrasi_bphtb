let selectedNoBooking = null;
const API_ENDPOINT = '/api/peneliti/get-berkas-till-verif';
const REQUEST_TIMEOUT = 10000; // 10 seconds
let penParafRows = [];

// Pagination variables
let allData = [];
let currentPage = 1;
const itemsPerPage = 6;

async function loadTableDataPenelitiP() {
    try {
        console.log('🔍 [FRONTEND] ===== PENELITI PARAF LOADING =====');
        console.log('🔍 [FRONTEND] Timestamp:', new Date().toISOString());
        console.log('🔍 [FRONTEND] URL:', window.location.href);

        const userDivisi = getUserDivisi();
        if (typeof userDivisi !== 'string') {
            throw new Error('Data divisi pengguna tidak valid');
        }

        if (userDivisi !== 'Peneliti') {
            showUserNotification('Akses Ditolak', 'Anda tidak memiliki akses ke data Peneliti', 'error');
            return;
        }

        console.log('🔍 [FRONTEND] User division check:', {
            userDivisi: userDivisi,
            userDivisiType: typeof userDivisi,
            isString: typeof userDivisi === 'string',
            isPeneliti: userDivisi === 'Peneliti'
        });

        console.log('✅ [FRONTEND] User division validated, proceeding with API call...');
        console.log('🔍 [FRONTEND] Making API request to', API_ENDPOINT, '...');

        const response = await fetchWithTimeout(
            API_ENDPOINT,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            },
            REQUEST_TIMEOUT
        );

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new Error(errorData.message || `Error ${response.status}: Gagal memuat data`);
        }

        const { success, data, metadata } = await parseJSONResponse(response);

        if (!success) {
            throw new Error('Respon server menunjukkan operasi gagal');
        }

        console.log('✅ [FRONTEND] API response received:', {
            success: success,
            dataLength: Array.isArray(data) ? data.length : 0,
            metadata: metadata
        });

        // Store all data for pagination
        allData = Array.isArray(data) ? data : [];
        penParafRows = allData;

        // Create cards container and pagination container
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            throw new Error('Main content container tidak ditemukan');
        }

        // Remove existing table and create cards container
        const existingTable = document.querySelector('#peneliti_paraf_kasie_Table');
        if (existingTable) {
            existingTable.style.display = 'none';
        }

        // Create cards container
        let cardsContainer = document.querySelector('.paraf-cards-container');
        if (!cardsContainer) {
            cardsContainer = document.createElement('div');
            cardsContainer.className = 'paraf-cards-container';
            cardsContainer.style.display = 'none'; // Initially hidden
            mainContent.appendChild(cardsContainer);
        }

        // Create pagination container
        let paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container';
            paginationContainer.style.display = 'none'; // Initially hidden
            mainContent.appendChild(paginationContainer);
        }

        if (!Array.isArray(data) || data.length === 0) {
            showEmptyStateCards(cardsContainer, 'Tidak ada data berkas yang ditemukan');
            return;
        }

        // Display first page
        displayPage(currentPage);

    } catch (error) {
        console.error('Main Function Error:', error);
        showUserNotification('Error', `Gagal memuat data: ${error.message}`, 'error');
    }
}

// Display page function for pagination
function displayPage(page) {
    try {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = allData.slice(startIndex, endIndex);
        
        console.log(`📄 [PAGINATION] Displaying page ${page}:`, {
            startIndex: startIndex,
            endIndex: endIndex,
            pageDataLength: pageData.length,
            totalData: allData.length
        });

        // Clear existing cards
        const cardsContainer = document.querySelector('.paraf-cards-container');
        const paginationContainer = document.querySelector('.pagination-container');
        
        if (cardsContainer) {
            cardsContainer.innerHTML = '';
            cardsContainer.style.display = 'grid';
        }

        // Render cards for current page
        pageData.forEach(item => {
            createCard(cardsContainer, item);
        });

        // Create pagination controls
        if (allData.length > itemsPerPage) {
            createPagination(paginationContainer, page, Math.ceil(allData.length / itemsPerPage));
            if (paginationContainer) {
                paginationContainer.style.display = 'flex';
            }
        } else if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

    } catch (error) {
        console.error('Display Page Error:', error);
        showUserNotification('Error', `Gagal menampilkan halaman: ${error.message}`, 'error');
    }
}

// Create card function
function createCard(container, item) {
    try {
        const criticalFields = ['no_registrasi', 'nobooking'];
        const missingCritical = criticalFields.filter(field => !item[field]);
        if (missingCritical.length > 0) {
            console.warn(`Skipping row missing critical fields for nobooking ${item.nobooking || 'unknown'}:`, missingCritical);
            return;
        }

        const card = document.createElement('div');
        card.className = 'paraf-card';
        
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
                    <span class="info-label">Tahun AJB</span>
                    <span class="info-value ${formatValue(item.tahunajb) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.tahunajb)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status</span>
                    <span class="info-value ${formatValue(item.status) === 'Belum diisi' ? 'empty' : ''}">${formatValue(item.status)}</span>
                </div>
            </div>
            
            <div class="card-footer">
                <div class="tanggal-info">${formatValue(item.tanggal_terima || item.created_at)}</div>
                
                <!-- Row 1: View Button (same as Verifikasi) -->
                <div class="card-actions-below-date">
                    <button class="btn-view-document" onclick="viewDocument('${item.nobooking}')" title="Lihat Dokumen">
                        <span>📄</span> View
                    </button>
                </div>
                
                <!-- Row 2: Paraf + Tolak buttons (same as Verifikasi) -->
                <div class="footer-actions">
                    <span class="status-badge ${statusClass}">${formatValue(item.trackstatus)}</span>
                    <button class="btn-paraf-prominent" data-nobooking="${item.nobooking}">
                        <span>✍️</span> Paraf
                    </button>
                    <button class="btn-reject" onclick="showRejectModal('${item.nobooking}')" title="Tolak dengan Alasan">
                        <span>❌</span> Tolak
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to paraf button
        const parafButton = card.querySelector('.btn-paraf-prominent');
        parafButton.addEventListener('click', async () => {
            try {
                const confirmation = window.confirm("Apakah kamu yakin ingin memberikan paraf pada data ini?");
                
                if (confirmation) {
                    if (!item || !item.nobooking) {
                        throw new Error("Data yang diperlukan tidak lengkap (nobooking).");
                    }

                    const result = await saveParafData(item);
                    if (result && result.success) {
                        parafButton.disabled = true;
                        parafButton.innerHTML = '<span>✅</span> Berhasil';
                        parafButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                        showAlert('success', "Paraf berhasil diberikan!");
                    } else {
                        const msg = (result && result.message) ? result.message : "Gagal memberikan paraf.";
                        throw new Error(msg);
                    }
                } else {
                    showAlert('info', "Paraf tidak jadi diberikan.");
                }
            } catch (buttonError) {
                console.error('Button Action Error:', buttonError);
                showAlert('error', `Terjadi kesalahan: ${buttonError.message}`);
            }
        });

        // Button "Kirim ke Pejabat" removed - functionality moved to dropdown
        
        container.appendChild(card);

        // Add dropdown content for detailed view
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'card-dropdown-content';
        dropdownContent.style.display = 'none';
        
        try {
            dropdownContent.innerHTML = `
                <div class="dropdown-content-wrapper">
                    <!-- Document Info Section -->
                    <div class="document-info-section">
                        <p><strong>No. Registrasi:</strong> ${item.no_registrasi || 'N/A'}</p>
                        <p><strong>Nama Wajib Pajak:</strong> ${item.namawajibpajak || 'N/A'}</p>
                        <p><strong>Nama Pemilik Objek:</strong> ${item.namapemilikobjekpajak || 'N/A'}</p>
                        <p><strong>Tahun AJB:</strong> ${item.tahunajb || 'N/A'}</p>
                        <p><strong>Status:</strong> ${item.status || 'N/A'}</p>
                    </div>

                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="form-group approval-section">
                            <label>
                                <input type="checkbox" name="ParafApproval-${item.nobooking}" value="approved"> Setujui untuk Paraf
                            </label>
                        </div>
                    </div>

                    <!-- Action Buttons Section -->
                    <div class="action-buttons">
                        <button type="button" class="btn-save-paraf" data-nobooking="${item.nobooking}">
                            <i class="fas fa-save"></i> Simpan Paraf
                        </button>
                        <button type="button" class="btn-pejabat-validation" data-nobooking="${item.nobooking}" title="Kirim ke Pejabat untuk Validasi & QR Code">
                            <span>🏛️</span> Kirim ke Pejabat
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

        card.appendChild(dropdownContent);

        // Add click event for dropdown toggle
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return;
            
            const dropdown = this.querySelector('.card-dropdown-content');
            if (dropdown) {
                const isVisible = dropdown.style.display !== 'none';
                dropdown.style.display = isVisible ? 'none' : 'block';
                
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

        setupParafFormInteractions(card, item);

            } catch (itemError) {
                console.error('Error processing item:', itemError);
        const errorCard = document.createElement('div');
        errorCard.className = 'paraf-card';
        errorCard.style.border = '1px solid #ef4444';
        errorCard.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="primary-info">Error</h3>
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

// Create pagination function
function createPagination(container, currentPage, totalPages) {
    container.innerHTML = '';
    
    // Pagination info
    const paginationInfo = document.createElement('div');
    paginationInfo.className = 'pagination-info';
    paginationInfo.textContent = `Halaman ${currentPage} dari ${totalPages} (${allData.length} data)`;
    container.appendChild(paginationInfo);
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button';
    prevButton.textContent = '← Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });
    container.appendChild(prevButton);
    
    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'pagination-numbers';
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'pagination-number';
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayPage(currentPage);
        });
        pageNumbers.appendChild(pageButton);
    }
    
    container.appendChild(pageNumbers);
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button';
    nextButton.textContent = 'Next →';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });
    container.appendChild(nextButton);
}

// Show empty state for cards
function showEmptyStateCards(container, message) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📄</div>
            <h3>Tidak Ada Data</h3>
            <p>${message}</p>
        </div>
    `;
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.minHeight = '300px';
}

// View Document function (reuse from verifikasi)
function viewDocument(nobooking) {
    try {
        if (!nobooking) {
            showAlert('error', 'No booking tidak ditemukan');
            return;
        }

        console.log('📄 [VIEW DOCUMENT] Opening PDF for nobooking:', nobooking);
        
        // Open PDF in new tab
        const pdfUrl = `/api/peneliti_lanjutan-generate-pdf-badan/${nobooking}`;
        window.open(pdfUrl, '_blank');
        
        showAlert('success', 'Dokumen berhasil dibuka');
    } catch (error) {
        console.error('View Document Error:', error);
        showAlert('error', `Gagal membuka dokumen: ${error.message}`);
    }
}

// Save Paraf Data function
async function saveParafData(item) {
    try {
        if (!item || !item.nobooking) {
            throw new Error('Data yang diperlukan tidak lengkap');
        }

        console.log('✍️ [PARAF] Saving paraf data for nobooking:', item.nobooking);

        // First, check signature and get user data
        const signatureCheck = await fetch('/api/v1/auth/peneliti/check-signature', { 
            credentials: 'include' 
        });
        
        if (!signatureCheck.ok) {
            throw new Error('Signature check failed');
        }
        
        const signatureData = await signatureCheck.json();
        if (!signatureData.has_signature) {
            throw new Error('Anda belum mengunggah tanda tangan!');
        }

        // Get user profile
        const userResponse = await fetch('/api/v1/auth/profile', { 
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to get user profile');
        }
        
        const userData = await userResponse.json();
        if (!userData?.userid) {
            throw new Error('User data incomplete');
        }

        // Get signature blob
        const tandaTanganResponse = await fetch(`/api/v1/auth/get-tanda-tangan?userid=${userData.userid}`, {
            credentials: 'include',
            cache: 'force-cache'
        });
        
        if (!tandaTanganResponse.ok) {
            throw new Error('Failed to get signature');
        }

        const blob = await tandaTanganResponse.blob();
        const base64TandaTangan = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        // Send paraf data
        const response = await fetch('/api/peneliti_update-ttd-paraf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                data: {
                    userid: userData.userid,
                    nobooking: item.nobooking,
                    persetujuanParaf: 'approve',
                    tanda_tangan_blob: base64TandaTangan
                }
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ [PARAF] Paraf data saved successfully:', result);
        
        // Transfer signature to paraf table
        try {
            console.log('🔄 [PARAF] Transferring signature...');
            const transferResponse = await fetch('/api/peneliti/paraf-transfer-signature', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nobooking: item.nobooking })
            });
            
            if (transferResponse.ok) {
                const transferResult = await transferResponse.json();
                console.log('✅ [PARAF] Signature transferred successfully:', transferResult);
            } else {
                console.warn('⚠️ [PARAF] Signature transfer failed, but paraf data saved');
            }
        } catch (transferError) {
            console.warn('⚠️ [PARAF] Signature transfer error:', transferError);
        }
        
        return result;
    } catch (error) {
        console.error('Save Paraf Data Error:', error);
        throw error;
    }
}

// Send to Pejabat Validation function
async function sendToPejabatValidation(item) {
    try {
        if (!item || !item.nobooking) {
            throw new Error('Data yang diperlukan tidak lengkap');
        }

        console.log('🏛️ [PEJABAT] Sending to pejabat validation for nobooking:', item.nobooking);

        const response = await fetch('/api/peneliti_send-to-ParafValidate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nobooking: item.nobooking,
                userid: item.userid,
                namawajibpajak: item.namawajibpajak,
                namapemilikobjekpajak: item.namapemilikobjekpajak,
                status: 'Terverifikasi',
                trackstatus: 'Terverifikasi',
                keterangan: item.keterangan || 'Dikirim ke Pejabat untuk validasi'
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ [PEJABAT] Successfully sent to pejabat validation:', result);
        return result;
    } catch (error) {
        console.error('Send to Pejabat Validation Error:', error);
        throw error;
    }
}

// Setup form interactions for paraf
function setupParafFormInteractions(card, item) {
    const saveButton = card.querySelector('.btn-save-paraf');
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            try {
                const checkbox = card.querySelector(`input[name="ParafApproval-${item.nobooking}"]`);
                const isApproved = checkbox ? checkbox.checked : false;
                
                if (!isApproved) {
                    showAlert('warning', 'Harap centang "Setujui untuk Paraf" terlebih dahulu');
                    return;
                }
                
                const result = await saveParafData(item);
                if (result && result.success) {
                    showAlert('success', 'Paraf berhasil disimpan');
                    setTimeout(() => {
                        loadTableDataPenelitiP();
                    }, 1000);
                } else {
                    throw new Error(result?.message || 'Gagal menyimpan paraf');
                }
            } catch (error) {
                console.error('Save Paraf Error:', error);
                showAlert('error', `Gagal menyimpan paraf: ${error.message}`);
            }
        });
    }
    
    // Add event listener for "Kirim ke Pejabat" button in dropdown
    const pejabatButton = card.querySelector('.btn-pejabat-validation');
    if (pejabatButton) {
        pejabatButton.addEventListener('click', async () => {
            try {
                const confirmation = window.confirm("Apakah kamu yakin ingin mengirim data ini ke Pejabat untuk validasi dan pembuatan QR Code?");
                
                if (confirmation) {
                    if (!item || !item.nobooking) {
                        throw new Error("Data yang diperlukan tidak lengkap (nobooking).");
                    }

                    const result = await sendToPejabatValidation(item);
                    if (result && result.success) {
                        pejabatButton.disabled = true;
                        pejabatButton.innerHTML = '<span>✅</span> Terkirim';
                        pejabatButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                        showAlert('success', `Data berhasil dikirim ke Pejabat! No. Validasi: ${result.no_validasi || 'N/A'}`);
                    } else {
                        const msg = (result && result.message) ? result.message : "Gagal mengirim data ke Pejabat.";
                        throw new Error(msg);
                    }
                } else {
                    showAlert('info', "Data tidak jadi dikirim ke Pejabat.");
                }
            } catch (buttonError) {
                console.error('Pejabat Button Action Error:', buttonError);
                showAlert('error', `Terjadi kesalahan: ${buttonError.message}`);
            }
        });
    }
}

// Generate document links (reuse from verifikasi)
function generateDocumentLinks(item) {
    const links = [];
    
    if (item.akta_tanah_path) {
        links.push(`<a href="${item.akta_tanah_path}" target="_blank" class="document-link">📄 Akta Tanah</a>`);
    }
    
    if (item.sertifikat_tanah_path) {
        links.push(`<a href="${item.sertifikat_tanah_path}" target="_blank" class="document-link">📄 Sertifikat Tanah</a>`);
    }
    
    if (item.pelengkap_path) {
        links.push(`<a href="${item.pelengkap_path}" target="_blank" class="document-link">📄 Dokumen Pelengkap</a>`);
    }
    
    return links.length > 0 ? links.join('') : '<p class="no-documents">Tidak ada dokumen tersedia</p>';
}

// Show reject modal (reuse from verifikasi)
function showRejectModal(nobooking) {
    const reason = prompt('Masukkan alasan penolakan:');
    
    if (reason === null) {
        return;
    }
    
    if (reason.trim() === '') {
        showAlert('error', 'Alasan penolakan tidak boleh kosong');
        return;
    }
    
    const confirmation = confirm(`Apakah Anda yakin ingin menolak data ini?\n\nAlasan: ${reason}`);
    
    if (confirmation) {
        rejectWithReason(nobooking, reason);
    }
}

// Reject with reason function (reuse from verifikasi)
async function rejectWithReason(nobooking, reason) {
    try {
        if (!nobooking) {
            showAlert('error', 'No booking tidak ditemukan');
            return;
        }

        if (!reason || reason.trim() === '') {
            showAlert('error', 'Alasan penolakan harus diisi');
            return;
        }

        console.log('❌ [REJECT] Rejecting nobooking:', nobooking, 'Reason:', reason);

        const response = await fetch('/api/peneliti_reject-with-reason', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nobooking: nobooking,
                reason: reason.trim()
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        showAlert('success', 'Data berhasil ditolak');
        
        // Reload data to reflect changes
        setTimeout(() => {
            loadTableDataPenelitiP();
        }, 1000);
        
        return result;
    } catch (error) {
        console.error('Reject Error:', error);
        showAlert('error', `Gagal menolak data: ${error.message}`);
        throw error;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [FRONTEND] Peneliti Paraf Cards initialized');
    loadTableDataPenelitiP();
});

async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Timeout: Server tidak merespon dalam ${timeout/1000} detik`);
        }
        throw error;
    }
}

async function parseErrorResponse(response) {
    try {
        return await response.json();
    } catch {
        return { message: `HTTP error! status: ${response.status}` };
    }
}

async function parseJSONResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        throw new Error('Gagal memproses data dari server');
    }
}

function validateItemFields(item, requiredFields) {
    const missingFields = requiredFields.filter(field => !item[field]);
    if (missingFields.length > 0) {
        throw new Error(`Data tidak lengkap. Field yang hilang: ${missingFields.join(', ')}`);
    }
}

function createTableRow(tbody, item) {
    const row = tbody.insertRow();
    row.setAttribute('data-nobooking', item.nobooking);
    
    const fieldsToDisplay = [
        'no_registrasi', 'nobooking', 'noppbb', 'tahunajb', 'userid',
        'namawajibpajak', 'namapemilikobjekpajak', 'status', 'trackstatus'
    ];
    
    fieldsToDisplay.forEach((field, index) => {
        const cell = row.insertCell(index);
        cell.textContent = item[field] || '-';
        cell.setAttribute('data-field', field);
    });
    
    return row;
}

function addActionButton(row, item) {
    const actionCell = row.insertCell(9);
    const sendButton = document.createElement('button');
    sendButton.className = 'btn-kirim-document';
    sendButton.textContent = 'Kirim';
    
    sendButton.addEventListener('click', async () => {
        try {
            const confirmed = await showConfirmationDialog(
                'Konfirmasi Pengiriman',
                'Apakah Anda yakin ingin mengirim data ini? Pastikan sudah diperiksa.'
            );
            
            if (confirmed) {
                const result = await sendToParafValidate(item);
                if (result && result.success) {
                    updateUIAfterSuccess(sendButton, actionCell, result.no_validasi, item.nobooking);
                    try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                } else {
                    const msg = (result && result.message) ? result.message : 'Gagal mengirim data';
                    throw new Error(msg);
                }
            }
        } catch (error) {
            console.error('Send Error:', error);
            showUserNotification('Gagal Mengirim', error.message, 'error');
        }
    });
    
    actionCell.appendChild(sendButton);
}

function addDropdownRow(tbody, item) {
    const dropdownRow = document.createElement('tr');
    dropdownRow.className = 'dropdown-row';
    
    const dropdownCell = document.createElement('td');
    dropdownCell.colSpan = 10;
    dropdownCell.style.display = 'none';
    
    try {
        dropdownCell.innerHTML = generateDropdownContent(item);
    } catch (error) {
        console.error('Dropdown Error:', error);
        dropdownCell.innerHTML = '<div class="dropdown-error">Gagal memuat detail data</div>';
    }
    
    dropdownRow.appendChild(dropdownCell);
    tbody.appendChild(dropdownRow);
}

function setupRowClickHandler(row, item) {
    row.addEventListener('click', () => {
        selectedNoBooking = item.nobooking;
        console.log(`Selected booking: ${selectedNoBooking}`);
        
        const dropdownRow = row.nextElementSibling;
        if (dropdownRow && dropdownRow.classList.contains('dropdown-row')) {
            const dropdownCell = dropdownRow.querySelector('td');
            if (dropdownCell) {
                const isVisible = dropdownCell.style.display === 'table-cell';
                dropdownCell.style.display = isVisible ? 'none' : 'table-cell';
                
                if (!isVisible && typeof enableViewDocumentButton === 'function') {
                    enableViewDocumentButton(item.nobooking);
                }
            }
        }
    });
}

// =====================
// UI HELPER FUNCTIONS
// =====================

function showUserNotification(title, message, type = 'info') {
    // Implement your notification system here
    alert(`${title}: ${message}`);
}

// Helper function to show alerts (reuse from verifikasi)
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

async function showConfirmationDialog(title, message) {
    return confirm(`${title}\n${message}`);
}

function updateUIAfterSuccess(button, container, validationNumber, bookingId) {
    button.disabled = true;
    button.textContent = 'Terkirim';
    
    const validationElement = document.createElement('div');
    validationElement.className = 'validation-info';
    validationElement.textContent = `Nomor Validasi: ${validationNumber}`;
    container.appendChild(validationElement);
    
    localStorage.setItem(`validation_${bookingId}`, validationNumber);
                    showAlert('success', `Data terkirim. Nomor Validasi: ${validationNumber}`);
}

function clearTableBody(tbody) {
    tbody.innerHTML = '';
}

function showEmptyState(tbody, message) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 10;
    cell.className = 'empty-state';
    cell.textContent = message;
}

function appendErrorRow(tbody, message) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 10;
    cell.className = 'error-row';
    cell.textContent = message;
}

function showErrorUI(errorMessage) {
    const errorContainer = document.querySelector('.data-masuk') || document.body;
    errorContainer.innerHTML = `
        <div class="error-state">
            <h3>Terjadi Kesalahan</h3>
            <p>${errorMessage}</p>
            <button class="retry-button" onclick="loadTableDataPenelitiP()">Coba Lagi</button>
        </div>
    `;
}

// Initialize on page load or when needed
document.addEventListener('DOMContentLoaded', () => {
    loadTableDataPenelitiP().catch(error => {
        console.error('Initialization Error:', error);
        showErrorUI('Gagal memuat data awal');
    });

    // ===== Tanda tangan otomatis ditambahkan saat simpan data =====
    // Modal overlay dihapus - tanda tangan ditambahkan secara otomatis melalui persetujuan
});
//////
//////
function generateDropdownContent(item) {
 const hasSignature = !!(item.tanda_paraf_path || item.tanda_tangan_path || item.tanda_tangan_url);
 const adaStempel = !!(item.stempel_booking_path) && (String(item.persetujuan||'').toLowerCase()==='true');
 const pesan1 = adaStempel ? '<p>Booking ini telah diberikan stempel</p>' : '<p>Booking ini belum diberikan stempel</p>';
 const pemberi = item.signer_userid || (String(item.tanda_paraf_path||'').match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i)?.[1]) || '—';
 const pesan2 = hasSignature ? `<p>Pemberi tanda tangan/paraf (${pemberi})</p>` : '<p>Belum diberikan tanda tangan/paraf</p>';
    return `
        <div class="dropdown-content-wrapper">
            <!-- Document Info Section -->
            <div class="document-info-section">
                <p><strong>No. Booking:</strong> ${item.nobooking || 'N/A'}</p>
                <p><strong>No. Registrasi:</strong> ${item.no_registrasi || 'N/A'}</p>
                <p><strong>Nama Wajib Pajak:</strong> ${item.namawajibpajak || 'N/A'}</p>
                <p><strong>Nama Pemilik Objek:</strong> ${item.namapemilikobjekpajak || 'N/A'}</p>
                ${pesan1}
                ${pesan2}
            </div>

            <!-- Signature Section -->
            ${hasSignature ? `
                <div class="signature-section">
                    <div class="form-group">
                        <label>
                            <input type="radio" name="ParafVerif-${item.nobooking}" value="approve" required>
                            Setujui Dokumen
                        </label>
                    </div>
                    <div class="signature-preview">
                        <p>Tanda Tangan Terverifikasi:</p>
                        <img src="${item.tanda_tangan_path}"
                             alt="Tanda Tangan Peneliti"
                             class="signature-image"
                             onerror="this.onerror=null;this.src='/assets/img/signature-placeholder.png'">
                    </div>
                </div>
            ` : `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Tidak dapat menyetujui - tanda tangan belum diunggah
                </div>
            `}

            <!-- Action Button -->
            <div class="action-buttons">
                <button type="button" class="btn-simpaninput" data-nobooking="${item.nobooking}" onclick="simpanData(this)">
                    <span class="btn-text">Simpan</span>
                    <span class="spinner" hidden>
                        <i class="fa fa-spinner fa-spin"></i>
                    </span>
                </button>
            </div>

            <!-- Document Links Section -->
            <div class="document-links-section">
                <h6 class="document-links-title">Dokumen Terkait:</h6>
                <div class="document-links-list">
                    ${generateFileLink(item.akta_tanah_path, 'Akta Tanah')}
                    ${generateFileLink(item.sertifikat_tanah_path, 'Sertifikat Tanah')}
                    ${generateFileLink(item.pelengkap_path, 'File Pelengkap')}
                    ${generateFileLink(item.file_withstempel_path, 'Unduh file stempel')}
                </div>
            </div>
        </div>
    `;

}
function generateFileLink(path, label) {
    if (!path) return '';
    
    const toHref = (p) => { return p.startsWith('/') ? p : ('/' + p); };
    const href = toHref(path);
    const isPdf = /\.pdf($|\?)/i.test(path);
    
    return `
        <div class="document-link-item">
            <span class="document-label">${label}:</span>
            ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                    : `<a href="${href}" target="_blank"><button class="btn-view">View</button></a>`}
        </div>`;
}
document.querySelectorAll('#penelitikasieTable tbody tr').forEach(row => {
    row.addEventListener('click', function() {
        try {
            // Menyimpan nobooking yang dipilih
            selectedNoBooking = row.cells[0].textContent.trim();  // Kolom pertama adalah No. Booking
            console.log(`No Booking yang dipilih: ${selectedNoBooking}`);  // Debugging

            // Memastikan form dan input terkait ditangani
            const item = data.data.find(item => item.nobooking === selectedNoBooking);  // Cari item berdasarkan nobooking
            if (item) {
                // Memanggil fungsi untuk menambahkan event listeners ke form dan input terkait
                addEventListenersForItem(item);
            }

            // Menangani tampilan dropdown
            const dropdownContent = row.nextElementSibling.querySelector('td');
            const isVisible = dropdownContent.style.display === 'table-cell';
            dropdownContent.style.display = isVisible ? 'none' : 'table-cell';

            // Memberikan margin top pada baris berikutnya jika dropdown dibuka
            if (!isVisible) {
                let nextRow = row.nextElementSibling;
                while (nextRow) {
                    nextRow.style.marginTop = '20px';
                    nextRow = nextRow.nextElementSibling;
                }
            }

        } catch (clickError) {
            console.error('Row Click Handler Error:', clickError);
        }
    });
});
// Fungsi untuk mendapatkan divisi pengguna
function getUserDivisi() {
    return localStorage.getItem('divisi') || sessionStorage.getItem('divisi');
}
localStorage.setItem('divisi', 'Peneliti');
// Atau
sessionStorage.setItem('divisi', 'Peneliti');
/// end fungsi utama
////////////////////// END FU   ///////////////////////////////////////////////////////////////////
async function validateNoBooking(nobooking) {
    try {
        const response = await fetch(`/api/validate-nobooking/${nobooking}`, { credentials: 'include' });
        const result = await response.json();
        return result.isValid;  // Mengembalikan status validasi
    } catch (error) {
        console.error('Error validating nobooking:', error);
        return false;
    }
}
////////////////////// END VN   ///////////////////////////////////////////////////////////////////
// Fungsi untuk generate PDF
function generatePDF(nobooking, stempelStatusP) {
    fetch(`/api/peneliti_lanjutan-generate-pdf-badan/${nobooking}?stempelStatus=${stempelStatusP}`, { credentials: 'include' })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${nobooking}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error generating PDF:', error);
        alert("Gagal generate PDF");
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function enableViewDocumentButton(nobooking) {
    // Temukan tombol "View Dokumen" dan aktifkan
    const viewPdfButton = document.querySelector('.btn.viewpdf');
    
    // Jika tombol ditemukan, aktifkan dan set onclick dengan nobooking yang dipilih
    if (viewPdfButton) {
        viewPdfButton.disabled = false; // Pastikan tombol bisa diklik
        viewPdfButton.onclick = () => viewDocument(nobooking); // Pasangkan nobooking yang dipilih
    }
}
async function viewDocument(nobooking) {
    // Pastikan nobooking tersedia
    if (!nobooking) {
        alert('No Booking tidak valid!');
        return;
    }
    // Ambil userid dan nama dari session atau localStorage
    const userid = sessionStorage.getItem('userid') || localStorage.getItem('userid');
    const nama = sessionStorage.getItem('nama') || localStorage.getItem('nama');
    if (!userid || !nama) {
        alert('User ID atau Nama tidak ditemukan.');
        return;
    }
    try {
        const response = await fetch(`/api/getCreatorByBooking/${encodeURIComponent(nobooking)}`, { credentials: 'include' });
        const data = await response.json();  // Mengonversi respons ke JSON

        if (response.ok && data && data.userid) {
            const creatorUserid = data.userid;  // Ambil userid pembuat berdasarkan nobooking
            // Buat URL untuk mengakses PDF menggunakan userid pembuat
            const pdfUrl = `/api/peneliti_lanjutan-generate-pdf-badan/${encodeURIComponent(nobooking)}?userid=${encodeURIComponent(creatorUserid)}&nama=${encodeURIComponent(data.nama)}`;

            // Jika response sukses, buka PDF
            window.open(pdfUrl, '_blank');
        } else {
            alert('Gagal memuat dokumen PDF.');
        }
    } catch (error) {
        console.error('Error fetching the PDF:', error);
        alert('Terjadi kesalahan saat mengambil dokumen PDF.');
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////
async function simpanData(buttonElement) {
    const nobooking = buttonElement.dataset.nobooking;
    if (!nobooking) {
        alert("Data nobooking tidak valid!");
        return;
    }
    const submitButton = buttonElement;
    const btnText = submitButton.querySelector('.btn-text');
    const spinner = submitButton.querySelector('.spinner');
    btnText.hidden = true;
    spinner.hidden = false;
    submitButton.disabled = true;

    try {
        console.log('Memproses No Booking:', nobooking);
        const signatureCheck = await fetch('/api/v1/auth/peneliti/check-signature', { credentials: 'include' });
        if (!signatureCheck.ok) {
            throw new Error(`Signature check failed: HTTP ${signatureCheck.status}`);
        }
        const signatureData = await signatureCheck.json().catch(() => ({ has_signature: false }));
        const { has_signature } = signatureData;
        if (!has_signature) {
            throw new Error('Anda belum mengunggah tanda tangan!');
        }

        const persetujuanParaf = document.querySelector(`input[name="ParafVerif-${nobooking}"]:checked`)?.value;
        if (!persetujuanParaf) {
            throw new Error('Harap pilih setujui agar dapat mengetahui dokumen telah di cek');
        }
        let userData;
        try {
            const userResponse = await fetch('/api/v1/auth/profile', { 
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!userResponse.ok) {
                throw new Error(`HTTP ${userResponse.status} - ${userResponse.statusText}`);
            }
            userData = await userResponse.json();
            if (!userData?.userid) {
                throw new Error('Data user tidak lengkap');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error(`Gagal memuat profil: ${error.message}`);
        }
        if (userData.divisi !== 'Peneliti') {  // Ganti `divisi` -> `userData.divisi`
            throw new Error('Hanya divisi Peneliti yang dapat menyetujui');
        }
        const tandaTanganResponse = await fetch(`/api/v1/auth/get-tanda-tangan?userid=${userData.userid}`, {
            credentials: 'include',
            cache: 'force-cache'
        });  // Ganti `userid` -> `userData.userid`
        if (!tandaTanganResponse.ok) {
            const errorText = await tandaTanganResponse.text().catch(() => 'Unknown error');
            throw new Error(`Gagal mengambil tanda tangan: HTTP ${tandaTanganResponse.status} - ${errorText}`);
        }

        const blob = await tandaTanganResponse.blob();
        const base64TandaTangan = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        const data = {
            userid: userData.userid,
            nobooking: nobooking,
            persetujuanParaf: persetujuanParaf,
            tanda_tangan_blob: base64TandaTangan
        };

        // 8. Kirim data ke backend dengan timeout (diperpanjang untuk transfer tanda tangan)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 detik untuk transfer tanda tangan

        const saveResponse = await fetch('/api/peneliti_update-ttd-paraf', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);

        if (!saveResponse.ok) {
            const errorText = await saveResponse.text();
            console.error('Save response error:', errorText);
            throw new Error(`HTTP ${saveResponse.status}: ${errorText}`);
        }
        
        // Transfer tanda tangan otomatis jika persetujuan = 'approve'
        if (persetujuanParaf === 'approve') {
            try {
                const transferResponse = await fetch('/api/peneliti/paraf-transfer-signature', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nobooking: nobooking })
                });
                
                if (!transferResponse.ok) {
                    console.warn('Gagal transfer tanda tangan, tetapi data tetap tersimpan');
                } else {
                    console.log('Tanda tangan berhasil ditransfer');
                }
            } catch (transferError) {
                console.warn('Error transfer tanda tangan:', transferError);
                // Jangan throw error, biarkan proses lanjut
            }
        }

        alert("Data berhasil disimpan!");
        location.reload();

    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'AbortError') {
            alert('Request timeout, silakan coba lagi');
        } else {
            alert(`Error: ${error.message}`);
        }
    } finally {
        if (submitButton) {
            btnText.hidden = false;
            spinner.hidden = true;
            submitButton.disabled = false;
        }
    }
}
//
// Fungsi untuk mengirim data ke peneliti
async function sendToParafValidate(item) {
    try {
        const response = await fetch('/api/peneliti_send-to-ParafValidate', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nobooking: item.nobooking,
                namawajibpajak: item.namawajibpajak,
                namapemilikobjekpajak: item.namapemilikobjekpajak,
                tanggal_terima: item.tanggal_terima,
                status: 'Dianalisis',
                trackstatus: 'Terverifikasi',
                keterangan: item.keterangan
            }),
        });

        const result = await response.json().catch(() => ({ success: false, message: `HTTP ${response.status}` }));
        if (!response.ok) {
            return { success: false, message: result.message || `HTTP ${response.status}` };
        }
        if (result && result.success) {
            alert('Data berhasil dikirim ke Paraf Validasi!');
        } else {
            alert('Gagal mengirim data ke Paraf Validasi.');
        }
        return result;
    } catch (error) {
        console.error('Error sending data to ParafValidate:', error);
        alert('Terjadi kesalahan saat mengirim data.');
        return { success: false, message: error?.message || 'Unknown error' };
    }
}
////

  ///
window.onload = loadTableDataPenelitiP;