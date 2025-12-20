let selectedNoBooking = null;
const API_ENDPOINT = '/api/peneliti/get-berkas-till-verif';
const REQUEST_TIMEOUT = 10000; // 10 seconds
let penParafRows = [];

// Pagination and search variables
let allData = [];
let filteredData = []; // Store filtered data for search
let searchQuery = ''; // Store current search query
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
        
        // Initialize filtered data
        filteredData = allData;

        // Get table body
        const tbody = document.querySelector('#peneliti_paraf_kasie_Table tbody.data-masuk');
        if (!tbody) {
            throw new Error('Table body tidak ditemukan');
        }

        // Clear existing content
        tbody.innerHTML = '';

        // Create search and pagination controls
        createSearchAndPaginationControls();

        if (!Array.isArray(data) || data.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 10;
            cell.className = 'empty-message';
            cell.textContent = 'Tidak ada data berkas yang ditemukan';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            return;
        }

        // Filter data and display first page
        filterData(searchQuery);
        displayPage(1);

    } catch (error) {
        console.error('Main Function Error:', error);
        showUserNotification('Error', `Gagal memuat data: ${error.message}`, 'error');
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
        const nobooking = String(item.nobooking || '').toLowerCase();
        const noRegistrasi = String(item.no_registrasi || '').toLowerCase();
        const namawajibpajak = String(item.namawajibpajak || '').toLowerCase();
        const creatorSpecialField = String(item.creator_special_field || item.special_field || '').toLowerCase();
        
        return noppbb.includes(searchTerm) ||
               nobooking.includes(searchTerm) ||
               noRegistrasi.includes(searchTerm) ||
               namawajibpajak.includes(searchTerm) ||
               creatorSpecialField.includes(searchTerm);
    });
}

// Function to create search and pagination controls
function createSearchAndPaginationControls() {
    // Check if controls already exist
    const existingControls = document.querySelector('.search-pagination-controls');
    if (existingControls && existingControls.querySelector('#paraf-search-input')) {
        return; // Already exists
    }
    
    // Find the main content area
    const mainContent = document.querySelector('#paraf_kasie_design');
    if (!mainContent) return;
    
    // Find the controls row (where search controls should be)
    let controlsRow = mainContent.querySelector('div[style*="justify-content: space-between"]');
    if (!controlsRow) {
        // Create controls row if it doesn't exist
        controlsRow = document.createElement('div');
        controlsRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 30px; margin-bottom: 20px; gap: 20px; flex-wrap: wrap;';
        
        // Find where to insert (before the table)
        const table = mainContent.querySelector('#peneliti_paraf_kasie_Table');
        if (table && table.parentElement) {
            table.parentElement.insertBefore(controlsRow, table);
        } else {
            mainContent.insertBefore(controlsRow, mainContent.firstChild);
        }
    }
    
    // Create controls container
    const controlsContainer = document.querySelector('.search-pagination-controls');
    if (!controlsContainer) {
        // If the container doesn't exist in the row, create it
        const newContainer = document.createElement('div');
        newContainer.className = 'search-pagination-controls';
        newContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            gap: 20px;
            flex-wrap: wrap;
            flex: 1;
            min-width: 300px;
        `;
        controlsRow.appendChild(newContainer);
    }
    
    const controlsContainerToUse = document.querySelector('.search-pagination-controls');
    if (!controlsContainerToUse) return;
    
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
    searchInput.id = 'paraf-search-input';
    searchInput.placeholder = 'Cari berdasarkan NOP PBB, No. Booking, No. Registrasi, Nama Wajib Pajak, atau User ID...';
    searchInput.className = 'paraf-search-input';
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
    
    // Insert search container into controls container
    controlsContainerToUse.appendChild(searchContainer);
    controlsContainerToUse.appendChild(resultsInfo);
    
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

// Display page function for pagination
function displayPage(page) {
    try {
        const tbody = document.querySelector('#peneliti_paraf_kasie_Table tbody.data-masuk');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Calculate pagination based on filtered data
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = filteredData.slice(startIndex, endIndex);
        
        console.log(`📄 [PAGINATION] Displaying page ${page}:`, {
            startIndex: startIndex,
            endIndex: endIndex,
            pageDataLength: currentData.length,
            totalFilteredData: filteredData.length,
            totalData: allData.length
        });

        if (currentData.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 10;
            cell.className = 'empty-message';
            cell.textContent = 'Tidak ada data';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            return;
        }

        // Render table rows for current page
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

    } catch (error) {
        console.error('Display Page Error:', error);
        showUserNotification('Error', `Gagal menampilkan halaman: ${error.message}`, 'error');
    }
}

// Helper function to create pagination container if it doesn't exist
function createPaginationContainer() {
    const mainContent = document.querySelector('#paraf_kasie_design');
    if (!mainContent) return null;
    
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        mainContent.appendChild(paginationContainer);
    }
    return paginationContainer;
}

// Create table row function
function createTableRow(tbody, item) {
    try {
        const criticalFields = ['no_registrasi', 'nobooking'];
        const missingCritical = criticalFields.filter(field => !item[field]);
        if (missingCritical.length > 0) {
            console.warn(`Skipping row missing critical fields for nobooking ${item.nobooking || 'unknown'}:`, missingCritical);
            return;
        }

        const formatValue = (value) => {
            return (value === undefined || value === null || value === '' || value === '-') ? 'Belum diisi' : value;
        };
        
        // Create main table row
        const row = tbody.insertRow();
        
        // Insert cells for each column
        const cellNoReg = row.insertCell(0);
        const cellNoBooking = row.insertCell(1);
        const cellNOPPBB = row.insertCell(2);
        const cellNamaWP = row.insertCell(3);
        const cellNamaPemilik = row.insertCell(4);
        const cellTahunAJB = row.insertCell(5);
        const cellPembuat = row.insertCell(6);
        const cellParaf = row.insertCell(7);
        const cellTanggal = row.insertCell(8);
        const cellAksi = row.insertCell(9);
        
        // Fill cells with data
        cellNoReg.textContent = formatValue(item.no_registrasi);
        cellNoBooking.textContent = formatValue(item.nobooking);
        cellNOPPBB.textContent = formatValue(item.noppbb);
        cellNamaWP.textContent = formatValue(item.namawajibpajak);
        cellNamaPemilik.textContent = formatValue(item.namapemilikobjekpajak);
        cellTahunAJB.textContent = formatValue(item.tahunajb);
        cellPembuat.textContent = formatValue(item.creator_special_field || item.special_field);
        
        // Paraf status
        const parafStatus = item.tanda_paraf_path ? 'Sudah' : 'Belum';
        cellParaf.innerHTML = `<span class="status-badge ${item.tanda_paraf_path ? 'success' : 'warning'}">${parafStatus}</span>`;
        
        // Tanggal
        const tanggal = item.tanggal_masuk || item.tanggal_terima || item.created_at;
        cellTanggal.textContent = tanggal ? new Date(tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Belum diisi';
        
        // Create action button container - only "Kirim ke Kabid" button
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';
        actionContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%;';
        
        // Kirim ke Kabid button
        const kirimKabidBtn = document.createElement('button');
        kirimKabidBtn.className = 'btn-kirim-kabid';
        kirimKabidBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim ke Kabid';
        kirimKabidBtn.style.cssText = 'padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; pointer-events: auto; z-index: 10; position: relative;';
        kirimKabidBtn.onclick = async (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Kirim ke Kabid button clicked for nobooking:', item.nobooking);
            try {
                const result = await sendToPejabatValidation(item);
                if (result && result.success) {
                    if (typeof showAlert === 'function') {
                        showAlert('success', 'Data berhasil dikirim ke Kabid!');
                    } else {
                        alert('Data berhasil dikirim ke Kabid!');
                    }
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else {
                    throw new Error(result?.message || 'Gagal mengirim data ke Kabid');
                }
            } catch (error) {
                console.error('Kirim ke Kabid Error:', error);
                if (typeof showAlert === 'function') {
                    showAlert('error', `Gagal mengirim: ${error.message}`);
                } else {
                    alert(`Gagal mengirim: ${error.message}`);
                }
            }
        };
        actionContainer.appendChild(kirimKabidBtn);
        
        // Ensure cellAksi is properly set up
        cellAksi.style.cssText = 'text-align: center; padding: 10px;';
        cellAksi.appendChild(actionContainer);
        
        console.log('Action button created for nobooking:', item.nobooking, 'Button element:', kirimKabidBtn);
        
        // Create dropdown row
        const dropdownRow = document.createElement('tr');
        dropdownRow.className = 'dropdown-row';
        const dropdownContent = document.createElement('td');
        dropdownContent.colSpan = 10;
        dropdownContent.style.display = 'none';
        dropdownContent.className = 'dropdown-content';
        
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

                    <!-- Action Buttons Section -->
                    <div class="action-buttons" style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
                        <button type="button" class="btn-view-document" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button type="button" class="btn-paraf-prominent" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; ${item.tanda_paraf_path ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${item.tanda_paraf_path ? 'disabled' : ''}>
                            <i class="fas fa-pen"></i> Paraf
                        </button>
                        <button type="button" class="btn-reject" data-nobooking="${item.nobooking}" style="flex: 1; min-width: 120px; padding: 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; ${item.tanda_paraf_path ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${item.tanda_paraf_path ? 'disabled' : ''}>
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
        // IMPORTANT: Append dropdown row immediately after main row (not at end of tbody)
        // Use insertAdjacentElement to ensure dropdown is right after the main row
        try {
            row.insertAdjacentElement('afterend', dropdownRow);
        } catch (e) {
            // Fallback: insert before next sibling or append to end
            console.warn('insertAdjacentElement failed, using fallback:', e);
            if (row.nextSibling) {
                tbody.insertBefore(dropdownRow, row.nextSibling);
            } else {
                tbody.appendChild(dropdownRow);
            }
        }

        // Add click handler to toggle dropdown - use capture phase to ensure it fires
        row.addEventListener('click', function(e) {
            // Don't toggle if clicking on buttons, inputs, labels, or form elements
            const clickedElement = e.target;
            if (clickedElement.closest('button') || 
                clickedElement.closest('input') || 
                clickedElement.closest('label') ||
                clickedElement.closest('select') ||
                clickedElement.closest('textarea') ||
                clickedElement.closest('.dropdown-content') ||
                clickedElement.closest('.dropdown-content-wrapper') ||
                clickedElement.closest('.action-container') ||
                clickedElement.closest('.btn-kirim-kabid')) {
                console.log('Click blocked - interactive element:', clickedElement);
                return;
            }
            
            console.log('Row clicked, toggling dropdown for nobooking:', item.nobooking);
            
            // Check if dropdown is currently visible
            // Check both inline style and computed style
            const inlineDisplay = dropdownContent.style.display;
            const computedDisplay = window.getComputedStyle(dropdownContent).display;
            const isVisible = inlineDisplay === 'table-cell' || (inlineDisplay === '' && computedDisplay === 'table-cell');
            
            console.log('Dropdown visibility check:', {
                inlineDisplay,
                computedDisplay,
                isVisible,
                dropdownElement: dropdownContent,
                dropdownRow: dropdownRow
            });
            
            // Toggle dropdown
            if (isVisible) {
                // Close this dropdown
                console.log('Closing dropdown');
                dropdownContent.style.display = 'none';
                dropdownContent.style.visibility = 'hidden';
            } else {
                // Close all other dropdowns first
                document.querySelectorAll('#peneliti_paraf_kasie_Table .dropdown-content').forEach(dd => {
                    if (dd !== dropdownContent) {
                        dd.style.display = 'none';
                        dd.style.visibility = 'hidden';
                    }
                });
                // Show this dropdown
                console.log('Opening dropdown');
                dropdownContent.style.display = 'table-cell';
                dropdownContent.style.visibility = 'visible';
                
                // Force reflow to ensure CSS is applied
                void dropdownContent.offsetHeight;
            }
        });
        
        // Ensure row is clickable and has proper styling
        row.style.cursor = 'pointer';
        row.style.position = 'relative';
        row.setAttribute('data-nobooking', item.nobooking);

        // Setup form interactions
        setupParafFormInteractionsFromRow(dropdownContent, item);

    } catch (itemError) {
        console.error('Error processing item:', itemError);
        // Create error row
        const errorRow = tbody.insertRow();
        const errorCell = errorRow.insertCell(0);
        errorCell.colSpan = 10;
        errorCell.className = 'empty-message';
        errorCell.textContent = `Error: ${itemError.message}`;
        errorCell.style.color = '#ef4444';
        errorCell.style.textAlign = 'center';
        errorCell.style.padding = '20px';
    }
}

// Helper function to setup form interactions from dropdown row
function setupParafFormInteractionsFromRow(dropdownContent, item) {
    // View button
    const viewButton = dropdownContent.querySelector('.btn-view-document');
    if (viewButton) {
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            viewDocument(item.nobooking);
        });
    }

    // Paraf button
    const parafButton = dropdownContent.querySelector('.btn-paraf-prominent');
    if (parafButton && !item.tanda_paraf_path) {
        parafButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const confirmation = window.confirm("Apakah kamu yakin ingin memberikan paraf pada data ini?");
                if (confirmation) {
                    const result = await saveParafData(item);
                    if (result && result.success) {
                        try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                        showAlert('success', "Paraf berhasil diberikan!");
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    } else {
                        throw new Error(result?.message || "Gagal memberikan paraf.");
                    }
                }
            } catch (buttonError) {
                console.error('Button Action Error:', buttonError);
                showAlert('error', `Terjadi kesalahan: ${buttonError.message}`);
            }
        });
    }

    // Reject button
    const rejectButton = dropdownContent.querySelector('.btn-reject');
    if (rejectButton && !item.tanda_paraf_path) {
        rejectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showRejectModal(item.nobooking);
        });
    }
}

// Setup form interactions (kept for backward compatibility)
function setupParafFormInteractions(dropdownContent, item) {
    setupParafFormInteractionsFromRow(dropdownContent, item);
}

// Create pagination function
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
    nextButton.innerHTML = 'Selanjutnya ›';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
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

// View Document function (same as verifikasi)
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
// Initialize on DOM ready
(function() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 [FRONTEND] Peneliti Paraf Cards initialized');
            loadTableDataPenelitiP();
        });
    } else {
        console.log('🚀 [FRONTEND] Peneliti Paraf Cards initialized (DOM already ready)');
        loadTableDataPenelitiP();
    }
})();

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
    fetch(`/api/Validasi_lanjutan-generate-pdf-bookingsspd/${nobooking}?stempelStatus=${stempelStatusP}`, { credentials: 'include' })
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
            // Buat URL untuk mengakses PDF menggunakan API yang benar
            const pdfUrl = `/api/Validasi_lanjutan-generate-pdf-bookingsspd/${encodeURIComponent(nobooking)}`;

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
// Removed duplicate window.onload - already handled by DOMContentLoaded