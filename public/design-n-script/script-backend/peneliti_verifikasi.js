let selectedNoBooking = null;
let allData = []; // Store all data
let filteredData = []; // Store filtered data for search
let currentPage = 1;
const itemsPerPage = 6; // 6 items per page
let searchQuery = ''; // Store current search query

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

        // DOM manipulation - Create table-based layout
        const tbody = document.querySelector('.data-masuk');
        if (!tbody) {
            throw new Error('Target table body element not found');
        }

        // Store all data for pagination
        allData = data.data;
        filteredData = data.data; // Initialize filtered data
        
        // Log sample data to verify persetujuan and pemilihan fields
        if (allData.length > 0) {
            console.log('🔍 [FRONTEND] Sample data verification:', {
                totalItems: allData.length,
                sampleItem: {
                    nobooking: allData[0].nobooking,
                    no_registrasi: allData[0].no_registrasi,
                    persetujuan: allData[0].persetujuan,
                    persetujuan_type: typeof allData[0].persetujuan,
                    pemilihan: allData[0].pemilihan,
                    pemilihan_type: typeof allData[0].pemilihan,
                    pemberi_persetujuan: allData[0].pemberi_persetujuan,
                    pemberi_persetujuan_type: typeof allData[0].pemberi_persetujuan,
                    tanda_tangan_path: allData[0].peneliti_tanda_tangan_path,
                    signer_userid: allData[0].signer_userid
                }
            });
        }
        
        // Clear existing content
        tbody.innerHTML = '';

        // Create search and pagination controls container
        createSearchAndPaginationControls();

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

// Function to filter data based on search query
function filterData(query) {
    if (!query || query.trim() === '') {
        filteredData = allData;
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    filteredData = allData.filter(item => {
        const noppbb = String(item.noppbb || '').toLowerCase();
        const specialField = String(item.creator_special_field || '').toLowerCase();
        const nobooking = String(item.nobooking || '').toLowerCase();
        const noRegistrasi = String(item.no_registrasi || '').toLowerCase();
        
        return noppbb.includes(searchTerm) ||
               specialField.includes(searchTerm) ||
               nobooking.includes(searchTerm) ||
               noRegistrasi.includes(searchTerm);
    });
}

// Function to display specific page
function displayPage(page) {
    const tbody = document.querySelector('.data-masuk');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Calculate pagination based on filtered data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);
    
    if (currentData.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.className = 'empty-message';
        cell.textContent = 'Tidak ada data';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    // Create table rows for current page
    currentData.forEach(item => {
        createTableRow(tbody, item);
    });
    
    // Create pagination controls
    const paginationContainer = document.querySelector('.pagination-container') || createPaginationContainer();
    createPagination(paginationContainer, page, totalPages);
    
    // Update current page
    currentPage = page;
    
    // Update search results info
    updateSearchResultsInfo();
}

// Helper function to create pagination container if it doesn't exist
function createPaginationContainer() {
    const mainContent = document.querySelector('#verifikasi_p1_design');
    if (!mainContent) return null;
    
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        mainContent.appendChild(paginationContainer);
    }
    return paginationContainer;
}

// Function to create search and pagination controls
function createSearchAndPaginationControls() {
    // Check if controls already exist
    const existingControls = document.querySelector('.search-pagination-controls');
    if (existingControls && existingControls.querySelector('#verification-search-input')) {
        return; // Already exists
    }
    
    // Find the main content area
    const mainContent = document.querySelector('#verifikasi_p1_design');
    if (!mainContent) return;
    
    // Find the controls row (where real-time controls are)
    let controlsRow = mainContent.querySelector('div[style*="justify-content: space-between"]');
    if (!controlsRow) {
        // Create controls row if it doesn't exist
        controlsRow = document.createElement('div');
        controlsRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; flex-wrap: wrap;';
        
        // Find where to insert (before the table)
        const table = mainContent.querySelector('#penelitiverifikasiTable');
        if (table && table.parentElement) {
            table.parentElement.insertBefore(controlsRow, table);
        } else {
            mainContent.insertBefore(controlsRow, mainContent.firstChild);
        }
    }
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'search-pagination-controls';
    controlsContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        gap: 20px;
        flex-wrap: wrap;
    `;
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 300px;
    `;
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'verification-search-input';
    searchInput.placeholder = 'Cari berdasarkan NOP PBB, Pembuat Booking, No. Booking, atau No. Registrasi...';
    searchInput.className = 'verification-search-input';
    searchInput.value = searchQuery;
    searchInput.style.cssText = `
        flex: 1;
        padding: 10px 16px;
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        border: 1px solid #374151;
        border-radius: 8px;
        color: #e5e7eb;
        font-size: 14px;
        transition: all 0.3s ease;
    `;
    
    // Add focus styles
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#8b5cf6';
        this.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = '#374151';
        this.style.boxShadow = 'none';
    });
    
    // Search functionality with debounce
    let searchTimeout;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        searchQuery = query;
        
        searchTimeout = setTimeout(() => {
            filterData(query);
            currentPage = 1; // Reset to first page on new search
            displayPage(1);
        }, 300); // 300ms debounce
    });
    
    // Create search icon
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fa fa-search';
    searchIcon.style.cssText = `
        color: #9ca3af;
        font-size: 16px;
    `;
    
    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'clear-search-btn';
    clearButton.innerHTML = '<i class="fa fa-times"></i>';
    clearButton.title = 'Hapus pencarian';
    clearButton.style.cssText = `
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        display: ${searchQuery ? 'block' : 'none'};
    `;
    
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        searchQuery = '';
        filterData('');
        currentPage = 1;
        displayPage(1);
        this.style.display = 'none';
    });
    
    clearButton.addEventListener('mouseenter', function() {
        this.style.color = '#ef4444';
        this.style.background = 'rgba(239, 68, 68, 0.1)';
    });
    
    clearButton.addEventListener('mouseleave', function() {
        this.style.color = '#9ca3af';
        this.style.background = 'transparent';
    });
    
    // Update clear button visibility when typing
    searchInput.addEventListener('input', function() {
        clearButton.style.display = this.value ? 'block' : 'none';
    });
    
    // Assemble search container
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearButton);
    
    // Create results info container
    const resultsInfo = document.createElement('div');
    resultsInfo.className = 'search-results-info';
    resultsInfo.style.cssText = `
        color: #9ca3af;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
    `;
    
    // Insert search container into controls row (left side)
    if (controlsRow) {
        // Check if search container already exists
        const existingSearch = controlsRow.querySelector('.search-container');
        if (!existingSearch) {
            controlsRow.insertBefore(searchContainer, controlsRow.firstChild);
        }
        
        // Insert results info after search container
        const existingResults = controlsRow.querySelector('.search-results-info');
        if (!existingResults) {
            controlsRow.insertBefore(resultsInfo, controlsRow.querySelector('.real-time-controls'));
        }
    } else {
        // Fallback: create standalone container
        controlsContainer.appendChild(searchContainer);
        controlsContainer.appendChild(resultsInfo);
        
        // Insert before the table
        const table = mainContent.querySelector('#penelitiverifikasiTable');
        if (table && table.parentElement) {
            table.parentElement.insertBefore(controlsContainer, table);
        } else {
            mainContent.insertBefore(controlsContainer, mainContent.firstChild);
        }
    }
    
    // Store reference for updating
    window.updateSearchResultsInfo = function() {
        const resultsInfoEl = document.querySelector('.search-results-info');
        if (!resultsInfoEl) return;
        
        const total = filteredData.length;
        const all = allData.length;
        if (searchQuery && searchQuery.trim() !== '') {
            resultsInfoEl.textContent = `Menampilkan ${total} dari ${all} hasil`;
            resultsInfoEl.style.color = total === 0 ? '#ef4444' : '#10b981';
        } else {
            resultsInfoEl.textContent = `Total: ${all} data`;
            resultsInfoEl.style.color = '#9ca3af';
        }
    };
    
    // Initial update
    updateSearchResultsInfo();
}

// Function to update search results info
function updateSearchResultsInfo() {
    if (window.updateSearchResultsInfo) {
        window.updateSearchResultsInfo();
    }
}

// Function to create individual table row
function createTableRow(tbody, item) {
    try {
        // Validate required fields
        const criticalFields = ['no_registrasi','nobooking'];
        const missingCritical = criticalFields.filter(field => !item[field]);
        if (missingCritical.length > 0) {
            console.warn(`Skipping row missing critical fields for nobooking ${item.nobooking || 'unknown'}:`, missingCritical);
            return;
        }

        // Format data for display
        const formatValue = (value) => {
            return (value === undefined || value === null || value === '' || value === '-') ? 'Belum diisi' : value;
        };
        
        // Create main table row
        const row = tbody.insertRow();
        
        // Insert cells for each column
        const cellNoReg = row.insertCell(0);
        const cellNoBooking = row.insertCell(1);
        const cellNOPPBB = row.insertCell(2);
        const cellPembuat = row.insertCell(3);
        const cellJenisWP = row.insertCell(4);
        const cellTanggal = row.insertCell(5);
        const cellAksi = row.insertCell(6);
        
        // Fill cells with data
        cellNoReg.textContent = formatValue(item.no_registrasi);
        cellNoBooking.textContent = formatValue(item.nobooking);
        cellNOPPBB.textContent = formatValue(item.noppbb);
        cellPembuat.textContent = formatValue(item.creator_special_field);
        cellJenisWP.textContent = formatValue(item.jenis_wajib_pajak);
        cellTanggal.textContent = formatValue(item.tanggal_terima);
        
        // Create action button container - only "Kirim Kasie" button
        const actionContainer = document.createElement('div');
        actionContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; justify-content: center;';
        
        // Kirim Kasie button
        const kirimKasieBtn = document.createElement('button');
        kirimKasieBtn.className = 'btn-kirim-kasie';
        kirimKasieBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Kasie';
        kirimKasieBtn.style.cssText = 'padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;';
        kirimKasieBtn.onclick = async (e) => {
            e.stopPropagation();
            try {
                await sendToParafKasie(item);
            } catch (error) {
                console.error('Kirim Kasie Error:', error);
                showAlert('error', `Gagal mengirim: ${error.message}`);
            }
        };
        actionContainer.appendChild(kirimKasieBtn);
        
        cellAksi.appendChild(actionContainer);
        
        // Create dropdown row
        const dropdownRow = document.createElement('tr');
        dropdownRow.className = 'dropdown-row';
        const dropdownContent = document.createElement('td');
        dropdownContent.colSpan = 7;
        dropdownContent.style.display = 'none';
        dropdownContent.className = 'dropdown-content';
        
        try {
            // Debug logging for dropdown creation
            console.log(`🔍 [FRONTEND] Creating dropdown for nobooking ${item.nobooking}:`, {
                persetujuan: item.persetujuan,
                persetujuan_type: typeof item.persetujuan,
                pemilihan: item.pemilihan,
                pemilihan_type: typeof item.pemilihan,
                pemberi_persetujuan: item.pemberi_persetujuan,
                pemberi_persetujuan_type: typeof item.pemberi_persetujuan,
                peneliti_tanda_tangan_path: item.peneliti_tanda_tangan_path,
                signer_userid: item.signer_userid
            });
            
            // Pesan status ringkas untuk kepegawaian
            const sudahSetuju = String(item.persetujuan||'').toLowerCase()==='true';
            const adaPemilihan = !!item.pemilihan;
            const pesan1 = (sudahSetuju && adaPemilihan) ? `<p>Booking ini telah diberi persetujuan dan pemilihan (${item.pemilihan}).</p>` : '<p>Booking ini belum diberi persetujuan dan pemilihan.</p>';
            
            // Use pemberi_persetujuan from database as the primary source
            const signerUser = item.pemberi_persetujuan || item.signer_userid || (String(item.tanda_tangan_path||'').match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i)?.[1]) || '—';
            const hasSignature = item.peneliti_tanda_tangan_path || item.pemberi_persetujuan || item.signer_userid;
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
                    <div class="action-buttons" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
                        <button type="button" class="btn-view-document" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button type="button" class="btn-save-verification" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-save"></i> Simpan
                        </button>
                        <button type="button" class="btn-reject" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-times"></i> Tolak
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

        dropdownRow.appendChild(dropdownContent);
        tbody.appendChild(dropdownRow);

        // Add click handler to toggle dropdown
        row.addEventListener('click', function(e) {
            // Don't toggle if clicking on buttons, inputs, labels, or form elements
            if (e.target.closest('button') || 
                e.target.closest('input') || 
                e.target.closest('label') ||
                e.target.closest('select') ||
                e.target.closest('textarea') ||
                e.target.closest('.dropdown-content') ||
                e.target.closest('.dropdown-content-wrapper')) {
                return;
            }
            
            // Check if dropdown is currently visible
            // Check both inline style and computed style
            const inlineDisplay = dropdownContent.style.display;
            const computedDisplay = window.getComputedStyle(dropdownContent).display;
            const isVisible = inlineDisplay === 'table-cell' || computedDisplay === 'table-cell';
            
            // Toggle dropdown
            if (isVisible) {
                // Close this dropdown
                dropdownContent.style.display = 'none';
            } else {
                // Close all other dropdowns first
                document.querySelectorAll('#penelitiverifikasiTable .dropdown-content').forEach(dd => {
                    if (dd !== dropdownContent) {
                        dd.style.display = 'none';
                    }
                });
                // Show this dropdown
                dropdownContent.style.display = 'table-cell';
            }
        });

        // Setup form interactions
        setupFormInteractionsFromRow(dropdownContent, item);

    } catch (itemError) {
        console.error('Error processing item:', itemError);
        // Create error row
        const errorRow = tbody.insertRow();
        const errorCell = errorRow.insertCell(0);
        errorCell.colSpan = 7;
        errorCell.className = 'empty-message';
        errorCell.textContent = `Error: ${itemError.message}`;
        errorCell.style.color = '#ef4444';
        errorCell.style.textAlign = 'center';
        errorCell.style.padding = '20px';
    }
}

// Helper function to setup form interactions from dropdown row
function setupFormInteractionsFromRow(dropdownContent, item) {
    // Radio button interactions for sub-inputs
    const radioButtons = dropdownContent.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            const parentType = this.className;
            const subInputs = dropdownContent.querySelectorAll('.sub-inputs');
            
            // Hide all sub-inputs
            subInputs.forEach(subInput => {
                subInput.style.display = 'none';
            });
            
            // Show relevant sub-input
            const targetSubInput = dropdownContent.querySelector(`.${parentType}-sub-input`);
            if (targetSubInput && this.checked) {
                targetSubInput.style.display = 'block';
            }
        });
    });

    // View button
    const viewButton = dropdownContent.querySelector('.btn-view-document');
    if (viewButton) {
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            viewDocument(item.nobooking);
        });
    }

    // Save button
    const saveButton = dropdownContent.querySelector('.btn-save-verification');
    if (saveButton) {
        saveButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const row = dropdownContent.closest('tr')?.previousElementSibling;
                if (row) {
                    await saveVerificationDataFromRow(row, item);
                } else {
                    throw new Error('Could not find table row');
                }
            } catch (error) {
                console.error('Save Verification Error:', error);
                showAlert('error', `Gagal menyimpan: ${error.message}`);
            }
        });
    }

    // Reject button
    const rejectButton = dropdownContent.querySelector('.btn-reject');
    if (rejectButton) {
        rejectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showRejectModal(item.nobooking);
        });
    }
}

// Helper function to save verification data from table row
async function saveVerificationDataFromRow(row, item) {
    const dropdownContent = row.nextElementSibling?.querySelector('.dropdown-content');
    if (!dropdownContent) {
        throw new Error('Dropdown content not found');
    }
    
    try {
        // Collect form data
        const formData = {
            userid: item.userid,
            nobooking: item.nobooking,
            pemilihan: dropdownContent.querySelector(`input[name="pemilihan-${item.nobooking}"]:checked`)?.value,
            nomorstpd: dropdownContent.querySelector('.nomorstpd')?.value || null,
            tanggalstpd: dropdownContent.querySelector('.tanggalstpd')?.value || null,
            angkapersen: dropdownContent.querySelector('.angkapersen')?.value || null,
            keterangandihitungSendiri: dropdownContent.querySelector('.keterangandihitungSendiri')?.value || null,
            isiketeranganlainnya: dropdownContent.querySelector('.isiketeranganlainnya')?.value || null,
            persetujuanVerif: dropdownContent.querySelector(`input[name="ParafVerif-${item.nobooking}"]:checked`)?.value === 'ya'
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
        
        console.log('✅ [FRONTEND] Data saved successfully, refreshing UI...');
        showAlert('success', 'Data verifikasi berhasil disimpan!');
        
        // Refresh data to show updated information
        setTimeout(async () => {
            try {
                console.log('🔄 [FRONTEND] Refreshing data after save...');
                await loadTableDataPenelitiV();
            } catch (refreshError) {
                console.error('❌ [FRONTEND] Error refreshing data:', refreshError);
            }
        }, 1000);
        
        return result;
    } catch (error) {
        console.error('Save Verification Error:', error);
        throw error;
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

// Setup form interactions for dropdown (kept for backward compatibility, but now uses setupFormInteractionsFromRow)
function setupFormInteractions(dropdownContent, item) {
    setupFormInteractionsFromRow(dropdownContent, item);
}

// Save verification data function (kept for backward compatibility, redirects to new function)
async function saveVerificationData(dropdownContent, item) {
    // This function is now redirected to saveVerificationDataFromRow
    // But we need to find the row from dropdownContent
    const row = dropdownContent.closest('tr')?.previousElementSibling;
    if (row) {
        return await saveVerificationDataFromRow(row, item);
    }
    throw new Error('Could not find table row');
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
        console.log('🔍 [FRONTEND] Sending to paraf:', {
            nobooking: item.nobooking,
            no_registrasi: item.no_registrasi,
            trackstatus: 'Diverifikasi',
            status: 'Dikerjakan'
        });

        const response = await fetch('/api/peneliti_send-to-paraf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nobooking: item.nobooking,
                no_registrasi: item.no_registrasi,
                trackstatus: 'Diverifikasi',
                status: 'Dikerjakan'
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        console.log('✅ [FRONTEND] Data sent to paraf successfully, refreshing UI...');
        showAlert('success', 'Data berhasil dikirim ke peneliti paraf!');
        
        // Refresh data to show updated information
        setTimeout(async () => {
            try {
                console.log('🔄 [FRONTEND] Refreshing data after send to paraf...');
                await loadTableDataPenelitiV();
            } catch (refreshError) {
                console.error('❌ [FRONTEND] Error refreshing data:', refreshError);
            }
        }, 1000); // Wait 1 second before refresh
        
        return result;
    } catch (error) {
        console.error('Send to Paraf Error:', error);
        throw error;
    }
}

// Function to create pagination controls
function createPagination(container, currentPage, totalPages) {
    container.innerHTML = '';
    
    if (totalPages <= 1) {
        container.style.display = 'none';
        return; // No pagination needed
    }
    
    container.style.display = 'flex';
    
    // Pagination info
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
    
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const totalItems = filteredData.length;
    if (searchQuery && searchQuery.trim() !== '') {
        info.textContent = `Menampilkan ${startItem}-${endItem} dari ${totalItems} hasil pencarian`;
    } else {
        info.textContent = `Menampilkan ${startItem}-${endItem} dari ${totalItems} data`;
    }
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

// View Document function
function viewDocument(nobooking) {
    try {
        if (!nobooking) {
            showAlert('error', 'No booking tidak ditemukan');
            return;
        }

        console.log('📄 [VIEW DOCUMENT] Opening PDF for nobooking:', nobooking);
        
        const encodedBooking = encodeURIComponent(String(nobooking).trim());
        const pdfUrl = `/api/Validasi_lanjutan-generate-pdf-bookingsspd/${encodedBooking}`;

        // Try opening directly; fallback to blob if the popup is blocked
        const newWindow = window.open(pdfUrl, '_blank', 'noopener');

        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Popup blocked, fetch and open via blob
            fetch(pdfUrl, { credentials: 'include' })
                .then(async (res) => {
                    if (!res.ok) {
                        const errText = await res.text();
                        throw new Error(errText || `Gagal membuka dokumen (${res.status})`);
                    }
                    return res.blob();
                })
                .then((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank', 'noopener');
                    showAlert('success', 'Dokumen berhasil dibuka');
                })
                .catch((err) => {
                    console.error('View Document Fetch Error:', err);
                    showAlert('error', `Gagal membuka dokumen: ${err.message}`);
                });
        } else {
            showAlert('success', 'Dokumen berhasil dibuka');
        }
    } catch (error) {
        console.error('View Document Error:', error);
        showAlert('error', `Gagal membuka dokumen: ${error.message}`);
    }
}

// Reject with reason function
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
            loadTableDataPenelitiV();
        }, 1000);
        
        return result;
    } catch (error) {
        console.error('Reject Error:', error);
        showAlert('error', `Gagal menolak data: ${error.message}`);
        throw error;
    }
}

// Show reject modal
function showRejectModal(nobooking) {
    const reason = prompt('Masukkan alasan penolakan:');
    
    if (reason === null) {
        // User cancelled
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [FRONTEND] Peneliti Verifikasi Cards initialized');
    loadTableDataPenelitiV();
    
    // Expose loadTableDataPenelitiV globally for real-time refresh
    window.loadPenelitiData = loadTableDataPenelitiV;
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
