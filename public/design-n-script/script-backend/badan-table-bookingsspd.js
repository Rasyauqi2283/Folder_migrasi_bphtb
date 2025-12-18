//masih banyak perbaikan
/// (complete)

// ===== HELPER FUNCTIONS untuk URL handling =====
/**
 * Get proper file URL - support Railway storage URLs
 */
function getFileUrl(pathOrUrl) {
    if (!pathOrUrl) return '';
    
    // Jika sudah URL lengkap, return as-is
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        return pathOrUrl;
    }
    
    // Jika Railway storage path, gunakan proxy endpoint
    if (pathOrUrl.includes('/') && !pathOrUrl.startsWith('http')) {
// Strip /storage/ppat/ prefix untuk mendapatkan relative path
        const relativePath = pathOrUrl.replace(/^\/storage\/ppat\//, '');
        return `/api/ppat/file-proxy?relativePath=${encodeURIComponent(relativePath)}`;
    }
    
    // Jika local path, tambahkan prefix /
    return '/' + pathOrUrl.replace(/^\/+/, ''); // Remove leading slashes then add one
}

/**
 * Get filename dari path atau URL
 */
function getFileName(pathOrUrl) {
    if (!pathOrUrl) return 'Unknown';
    
    // Extract filename dari URL atau path
    const parts = pathOrUrl.split('/');
    const filename = parts[parts.length - 1];
    
    // Remove version prefix jika ada (v1234567890)
    return filename.replace(/^v\d+_/, '');
}

// ===== END HELPER FUNCTIONS =====

async function loadTableData(page = 1) {
    try {
        // Menggunakan parameter page jika ada
    const url = `/api/ppat/load-all-booking?page=${page}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.querySelector('.data-tabel-badan');
            
            // Menghapus baris lama jika ada
            tbody.innerHTML = '';
            
            // Loop melalui data dan menambahkannya ke dalam tabel
            data.data.forEach(async (item) => {
                const row = tbody.insertRow();

                // Membuat sel untuk data
                const cellNoBooking = row.insertCell(0);
                const cellNoppbb = row.insertCell(1);
                const cellTanggalAjb = row.insertCell(2);
                const cellTahunAjb = row.insertCell(3);
                const cellNamaWajibPajak = row.insertCell(4);
                const cellNamaPemilikObjek = row.insertCell(5);
                const cellNpwp = row.insertCell(6);
                const celltrackingstats = row.insertCell(7);
                const cellkirim = row.insertCell(8);
                
                // Menambahkan data ke dalam sel
                cellNoBooking.textContent = item.nobooking;
                cellNoppbb.textContent = item.noppbb;
                
                const formattedTanggalAjb = item.tanggal;
                cellTanggalAjb.textContent = formattedTanggalAjb;
                // Menampilkan data lainnya
                cellTahunAjb.textContent = item.tahunajb;
                cellNamaWajibPajak.textContent = item.namawajibpajak;
                cellNamaPemilikObjek.textContent = item.namapemilikobjekpajak;
                cellNpwp.textContent = item.npwpwp;
                celltrackingstats.textContent = item.trackstatus;

                // [1] PEMBUATAN TOMBOL SEDERHANA (dengan guard status)
                const sendButton = document.createElement('button');
                sendButton.textContent = 'Kirim ke Bappenda';
                sendButton.classList.add('btn-send-to-ltb');
                sendButton.dataset.nobooking = item.nobooking;
                const status = (item.trackstatus || '').toLowerCase();
                const isDraft = status === 'draft';
                const isPending = status === 'pending';
                const isDiolah = status === 'diolah';
                
                if (isDiolah) {
                    sendButton.disabled = true;
                    sendButton.textContent = 'Sedang Diolah';
                    sendButton.title = 'Booking sudah masuk proses LTB (Diolah)';
                    try { sendButton.style.opacity = '0.5'; sendButton.style.cursor = 'not-allowed'; } catch(_) {}
                } else if (isPending) {
                    sendButton.disabled = true;
                    sendButton.textContent = 'Menunggu Kirim';
                    sendButton.title = 'Booking dalam antrian pengiriman';
                    try { sendButton.style.opacity = '0.5'; sendButton.style.cursor = 'not-allowed'; } catch(_) {}
                } else if (!isDraft) {
                    sendButton.disabled = true;
                    sendButton.title = 'Aksi dinonaktifkan: status bukan Draft';
                    try { sendButton.style.opacity = '0.5'; sendButton.style.cursor = 'not-allowed'; } catch(_) {}
                }
                sendButton.onclick = () => {
                    if (sendButton.disabled) return;
                    openScheduleModal(item.nobooking);
                };

                cellkirim.appendChild(sendButton);
                // Membuat dropdown row di bawah baris ini
                const dropdownRow = document.createElement('tr');
                const dropdownContent = document.createElement('td');
                dropdownContent.colSpan = 9;
                dropdownContent.style.display = 'none'; // Dropdown akan disembunyikan pertama kali
dropdownContent.innerHTML = `
<div id='dropdown-case-bookingsspd' class="dropdown-container">
    <div class="header-section">
        <h4>Detail No. Booking: ${item.nobooking}</h4>
    </div>

        <div class="address-section">
        <h5>Pengisian Data Alamat Permohonan Validasi</h5>

                   <button class="btn-form" onclick="gotoform('${item.nobooking}')">
                <i class="fas fa-file-alt"></i> Isi Form Permohonan
            </button>
    </div>
    
    <div class="action-buttons">
        <h5>Dokumen Permohonan</h5>
        <div class="form-actions">
 
            <button class="btn-view" data-nobooking="${item.nobooking}" onclick="viewPDF('${item.nobooking}')">
                <i class="fas fa-file-pdf"></i> Lihat Dokumen Validasi
            </button>
        </div>
    </div>
    
<div class="document-section" id="document-${item.nobooking}">
        <h5>Dokumen Wajib</h5>
        <div id="file-info-${item.nobooking}" class="file-grid">
            <!-- Akta -->
            <div class="file-upload-card" id="aktaTanahContainer-${item.nobooking}"
                ondragover="handleDragOver(event)"
                ondragleave="handleDragLeave(event)"
                ondrop="handleDrop(event, 'aktaTanahInput-${item.nobooking}')">
                <label for="aktaTanahInput-${item.nobooking}" class="file-upload-label">
                    <span class="label-text">Akta:</span>
                    <span class="file-input-wrapper">
                        <i class="fas fa-cloud-upload-alt upload-icon"></i>
                        <span class="file-input-text">Pilih File</span>
                        <input type="file" id="aktaTanahInput-${item.nobooking}" 
                            accept="application/pdf,image/jpeg,image/png" class="file-input"
                            aria-label="Upload akta tanah">
                    </span>
                    <small class="file-hint">
                        Format: PDF/JPEG/PNG (Max 5MB)
                        <span class="tooltip">
                            <i class="fas fa-info-circle"></i>
                            <span class="tooltip-text">Dokumen harus jelas dan terbaca</span>
                        </span>
                    </small>
                </label>
                <div class="file-preview" id="aktaTanahPreview-${item.nobooking}">
                    ${item.akta_tanah_path ? `
                        <div class="file-preview-item">
                            <div class="file-content">
                                ${item.akta_tanah_path.toLowerCase().endsWith('.pdf') ? 
                                    '<i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>' : 
                                    `<img src="${getFileUrl(item.akta_tanah_path)}" class="file-thumbnail" alt="Preview">`}
                                <div class="file-info">
                                    <span class="file-name">${getFileName(item.akta_tanah_path)}</span>
                                    <span class="file-size">(Uploaded)</span>
                                </div>
                            </div>
                            <a href="${getFileUrl(item.akta_tanah_path)}" target="_blank" class="btn-view">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Sertifikat Tanah -->
            <div class="file-upload-card" id="sertifikatTanahContainer-${item.nobooking}"
                ondragover="handleDragOver(event)"
                ondragleave="handleDragLeave(event)"
                ondrop="handleDrop(event, 'sertifikatTanahInput-${item.nobooking}')">
                <label for="sertifikatTanahInput-${item.nobooking}" class="file-upload-label">
                    <span class="label-text">Sertifikat Tanah:</span>
                    <span class="file-input-wrapper">
                        <i class="fas fa-cloud-upload-alt upload-icon"></i>
                        <span class="file-input-text">Pilih File</span>
                        <input type="file" id="sertifikatTanahInput-${item.nobooking}" 
                            accept="application/pdf,image/jpeg,image/png" class="file-input"
                            aria-label="Upload sertifikat tanah">
                    </span>
                    <small class="file-hint">Format: PDF/JPEG/PNG (Max 5MB)</small>
                </label>
                <div class="file-preview" id="sertifikatTanahPreview-${item.nobooking}">
                    ${item.sertifikat_tanah_path ? `
                        <div class="file-preview-item">
                            <div class="file-content">
                                ${item.sertifikat_tanah_path.toLowerCase().endsWith('.pdf') ? 
                                    '<i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>' : 
                                    `<img src="${getFileUrl(item.sertifikat_tanah_path)}" class="file-thumbnail" alt="Preview">`}
                                <div class="file-info">
                                    <span class="file-name">${getFileName(item.sertifikat_tanah_path)}</span>
                                    <span class="file-size">(Uploaded)</span>
                                </div>
                            </div>
                            <a href="${getFileUrl(item.sertifikat_tanah_path)}" target="_blank" class="btn-view">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Dokumen Pelengkap -->
            <div class="file-upload-card" id="pelengkapContainer-${item.nobooking}"
                ondragover="handleDragOver(event)"
                ondragleave="handleDragLeave(event)"
                ondrop="handleDrop(event, 'pelengkapInput-${item.nobooking}')">
                <label for="pelengkapInput-${item.nobooking}" class="file-upload-label">
                    <span class="label-text">Dokumen Pelengkap:</span>
                    <span class="file-input-wrapper">
                        <i class="fas fa-cloud-upload-alt upload-icon"></i>
                        <span class="file-input-text">Pilih File</span>
                        <input type="file" id="pelengkapInput-${item.nobooking}" 
                            accept="application/pdf,image/jpeg,image/png" class="file-input"
                            aria-label="Upload dokumen pelengkap">
                    </span>
                    <small class="file-hint">Format: PDF/JPEG/PNG (Max 5MB)</small>
                </label>
                <div class="file-preview" id="pelengkapPreview-${item.nobooking}">
                    ${item.pelengkap_path ? `
                        <div class="file-preview-item">
                            <div class="file-content">
                                ${item.pelengkap_path.toLowerCase().endsWith('.pdf') ? 
                                    '<i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>' : 
                                    `<img src="${getFileUrl(item.pelengkap_path)}" class="file-thumbnail" alt="Preview">`}
                                <div class="file-info">
                                    <span class="file-name">${getFileName(item.pelengkap_path)}</span>
                                    <span class="file-size">(Uploaded)</span>
                                </div>
                            </div>
                            <a href="${getFileUrl(item.pelengkap_path)}" target="_blank" class="btn-view">
                                <i class="fas fa-eye"></i>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <div class="upload-actions">
            <button class="btn-upload" onclick="uploadFiles('${item.nobooking}')" aria-label="Upload semua dokumen">
                <i class="fas fa-upload"></i> Upload Semua Dokumen
            </button>
            <div id="uploadProgress-${item.nobooking}" class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div id="fileStatus-${item.nobooking}" class="status-message" role="status" aria-live="polite"></div>
        </div>
    </div>

    

</div>
`;

function renderAddressField(item, field, label) {
    return `
        <div class="address-field ${!item[field] ? 'missing' : ''}">
            <span class="address-label">${label}:</span>
            <span class="address-value">${item[field] || 'Belum diisi'}</span>
        </div>
    `;
}

    dropdownRow.appendChild(dropdownContent);

        // Menambahkan event listener untuk klik pada baris tabel
        row.addEventListener('click', function() {
            window.lastClickedRow = row;
            // upload ttd
            console.log('clicked:', item.nobooking); 
            enableUploadTTD(item.nobooking);
            // view documen
            enableViewDocumentButton(item.nobooking);
            //
            selectedRow = row; // Simpan baris yang dipilih
            row.style.backgroundColor = '#e0e0e0';
            // Menyimpan nobooking yang dipilih
            const selectedNoBooking = item.nobooking; 
            if (validateNoBooking(selectedNoBooking)) { // Validasi nobooking yang dipilih
                console.log(`Selected No Booking: ${selectedNoBooking}`);
                // Toggle tampilan dropdown
                const isVisible = dropdownContent.style.display === 'table-cell';
                dropdownContent.style.display = isVisible ? 'none' : 'table-cell';
                
                // Geser baris-baris berikutnya jika dropdown ditampilkan
                if (!isVisible) {
                    let nextRow = row.nextElementSibling;
                    while (nextRow) {
                        nextRow.style.marginTop = '20px'; // Memberikan ruang antara baris
                        nextRow = nextRow.nextElementSibling;
                    }
                }
            } else {
                toggleSignatureButton(false);
                alert('No Booking yang dipilih tidak valid!');
            }
        });

        // Menambahkan baris dropdown ke dalam tabel
                tbody.appendChild(dropdownRow);
                
                // Load and display uploaded documents for this booking
                try {
                    const uploadedDocs = await loadUploadedDocuments(item.nobooking);
                    if (uploadedDocs) {
                        displayUploadedDocuments(item.nobooking, uploadedDocs);
                    }
                } catch (error) {
                    console.error('Error loading uploaded documents for booking:', item.nobooking, error);
                }
            });

            // Menampilkan tombol pagination
            displayPagination(data.pagination.page, data.totalPages, true);
        }
    } catch (error) {
        console.error('Error loading table data:', error);
    }
}
////////////////////////                        /////////////////////////////////////////
function displayPagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.list-button');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';  // Clear existing pagination buttons
    
    // Set default jika tidak ada data
    if (!totalPages || totalPages < 1) {
        totalPages = 1;
    }

    // First Page Button - disabled jika di halaman pertama
    const firstButton = createPaginationButton('first', '<<', currentPage === 1, () => loadTableData(1));
    paginationContainer.appendChild(firstButton);

    // Previous Button - disabled jika di halaman pertama
    const prevButton = createPaginationButton('prev', '<', currentPage === 1, () => loadTableData(currentPage - 1));
    paginationContainer.appendChild(prevButton);

    // Page Numbers dengan smart pagination
    const pageButtons = generatePageNumbers(currentPage, totalPages);
    pageButtons.forEach(pageInfo => {
        if (pageInfo.type === 'number') {
            const pageButton = createPaginationButton(
                'number',
                pageInfo.number,
                false, // Page number tidak pernah disabled
                () => loadTableData(pageInfo.number),
                pageInfo.number === currentPage ? 'active' : '',
                pageInfo.hideOnMobile ? 'hide-mobile' : ''
            );
            paginationContainer.appendChild(pageButton);
        } else if (pageInfo.type === 'ellipsis') {
            const ellipsisButton = createPaginationButton('ellipsis', '...', true, null, 'ellipsis');
            paginationContainer.appendChild(ellipsisButton);
        }
    });

    // Next Button - disabled jika di halaman terakhir ATAU hanya ada 1 halaman
    const nextButton = createPaginationButton('next', '>', currentPage >= totalPages, () => loadTableData(currentPage + 1));
    paginationContainer.appendChild(nextButton);

    // Last Page Button - disabled jika di halaman terakhir ATAU hanya ada 1 halaman
    const lastButton = createPaginationButton('last', '>>', currentPage >= totalPages, () => loadTableData(totalPages));
    paginationContainer.appendChild(lastButton);

    // Add page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'pagination-info';
    paginationContainer.appendChild(pageInfo);
}

function createPaginationButton(type, text, disabled, onClick, extraClass = '', mobileClass = '') {
    const button = document.createElement('button');
    button.className = `pagination-btn ${type === 'first' || type === 'prev' || type === 'next' || type === 'last' ? 'nav-btn' : ''} ${type === 'number' ? 'page-number' : ''} ${extraClass} ${mobileClass}`.trim();
    button.innerHTML = text;
    button.disabled = disabled;
    
    // Add disabled class for styling
    if (disabled) {
        button.classList.add('disabled');
        button.style.cursor = 'not-allowed';
        button.style.opacity = '0.5';
    }
    
    if (onClick && !disabled) {
        button.onclick = onClick;
    }
    
    // Add accessibility attributes
    button.setAttribute('aria-label', getButtonLabel(type, text));
    button.setAttribute('role', 'button');
    if (disabled) {
        button.setAttribute('aria-disabled', 'true');
    }
    
    // Add ripple effect only if not disabled
    if (!disabled) {
        button.classList.add('ripple');
    }
    
    return button;
}

function getButtonLabel(type, text) {
    const labels = {
        'first': 'Halaman Pertama',
        'prev': 'Halaman Sebelumnya',
        'next': 'Halaman Berikutnya',
        'last': 'Halaman Terakhir',
        'number': `Halaman ${text}`,
        'ellipsis': 'Halaman lainnya'
    };
    return labels[type] || text;
}

function generatePageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxVisiblePages = 7; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
            pages.push({ type: 'number', number: i });
        }
    } else {
        // Smart pagination logic
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        // Always show first page
        if (startPage > 1) {
            pages.push({ type: 'number', number: 1 });
            if (startPage > 2) {
                pages.push({ type: 'ellipsis' });
            }
        }
        
        // Show pages around current page
        for (let i = startPage; i <= endPage; i++) {
            pages.push({ 
                type: 'number', 
                number: i,
                hideOnMobile: (i > startPage + 1 && i < endPage - 1)
            });
        }
        
        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push({ type: 'ellipsis' });
            }
            pages.push({ type: 'number', number: totalPages });
        }
    }
    
    return pages;
}
////////////////////                ////////////////////////////////
function deleteSelectedRow() {
    if (selectedRow) {
        const nobooking = selectedRow.cells[0].textContent.trim();
        const isConfirmed = confirm(`Apakah Anda yakin ingin menghapus data booking "${nobooking}" ini?`);

        if (isConfirmed) {
            // Backend butuh trackstatus dalam body
            fetch(`/api/ppat/update-trackstatus/${nobooking}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trackstatus: 'Dihapus' })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`data booking "${nobooking}" telah dihapus secara permanen`);
                    location.reload(); // Refresh halaman sesuai request
                } else {
                    alert('Gagal mengubah status data menjadi Dihapus: ' + (data.message || 'Error tidak diketahui'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mengubah status data');
            });
        } else {
            console.log('Penghapusan dibatalkan');
        }
    } else {
        alert('Silakan pilih baris yang ingin dihapus terlebih dahulu.');
    }
}
// Menambahkan event listener pada tombol "Hapus"
document.querySelector('.btn-action.hapus').addEventListener('click', deleteSelectedRow);
function validateNoBooking(nobooking) {
    console.log(`Sementara validasi dinonaktifkan. NoBooking: ${nobooking}`);
    return true; // Disable validasi sementara untuk debugging
}

///////////////////     //////      ////////////////////////////////
function enableViewDocumentButton(nobooking) {
    // Temukan tombol "View Dokumen" dan aktifkan
    const viewPdfButton = document.querySelector('.btn-action.viewpdf');
    
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

    // Buat URL untuk mengakses PDF - menggunakan endpoint yang benar (ppat_)
    const pdfUrl = `/api/ppat_generate-pdf-badan/${encodeURIComponent(nobooking)}`;
    
    // Membuka PDF di jendela baru
    window.open(pdfUrl, '_blank');
}
async function viewPDF(nobooking) {
    console.log("nobooking:", nobooking)
    const viewBtn = document.querySelector(`button[data-nobooking="${nobooking}"]`);
    const originalText = viewBtn ? viewBtn.textContent : ''; // Cek jika viewBtn ditemukan   
    if (!viewBtn) {
        console.error('Tombol tidak ditemukan!');
        return;
    }
    try {
        viewBtn.textContent = 'Loading...';
        viewBtn.disabled = true;
const response = await fetch(`/api/ppat/generate-pdf-mohon-validasi/${nobooking}`, { credentials: 'include' });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl, '_blank');
        
        // Jika popup diblokir, beri alternatif
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.download = `document-${nobooking}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Gagal membuka dokumen: ${error.message}`);
    } finally {
        if (viewBtn) {
            viewBtn.textContent = originalText;
            viewBtn.disabled = false;
        }
    }
}
////
function downloadPDF(url, filename, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Timeout: Dokumen terlalu lama diproses'));
        }, timeout);

        fetch(url, { credentials: 'include' })
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.blob();
            })
            .then(blob => {
                clearTimeout(timer);
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(blobUrl);
                    resolve();
                }, 100);
            })
            .catch(error => {
                clearTimeout(timer);
                reject(error);
            });
    });
}
//////////////////////////////          TANDA TANGAN WAJIB PAJAK          ////////////////////////////////////////////////////////////////////////////////////
// Fungsi utama yang tetap sama
function enableUploadTTD(nobooking) {
    sessionStorage.setItem('selectedNoBooking', nobooking);
    const uploadTTDButton = document.getElementById('showSignatureModal');
    if (uploadTTDButton) {
        uploadTTDButton.onclick = () => showSignatureForm(nobooking);
    }
}

// Fungsi yang diperbarui untuk upload tanda tangan
async function processSignature(file) {
    return new Promise((resolve, reject) => {
        try {
            // Validasi file terlebih dahulu
            if (!file) {
                reject(new Error('File tidak ditemukan'));
                return;
            }

            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            if (!validTypes.includes(file.type)) {
                reject(new Error('Format file tidak didukung. Gunakan JPG atau PNG.'));
                return;
            }

            if (file.size > maxSize) {
                reject(new Error('Ukuran file terlalu besar. Maksimal 2MB.'));
                return;
            }

            // Jika file sudah dalam format yang benar, gunakan langsung
            if (file.type === 'image/png') {
                resolve(file);
                return;
            }

            // Konversi ke PNG jika diperlukan
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Gagal memproses gambar'));
                            }
                        }, 'image/png', 0.9);
                    } catch (error) {
                        reject(new Error('Gagal memproses gambar: ' + error.message));
                    }
                };
                img.onerror = () => {
                    reject(new Error('Gagal memuat gambar'));
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };
            reader.readAsDataURL(file);
        } catch (error) {
            reject(new Error('Error memproses file: ' + error.message));
        }
    });
}

// Fungsi yang diperbarui
function showSignatureForm(nobooking) {
    if (!nobooking) {
        showAlert('error', 'No Booking tidak valid!');
        return;
    }
    
    const modal = document.getElementById('signatureModal');
    if (!modal) {
        showAlert('error', 'Modal tidak ditemukan!');
        return;
    }
    
    modal.style.display = 'flex';
    setupSignatureForm(nobooking);
}

function setupSignatureForm(nobooking) {
    const modal = document.getElementById('signatureModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelUploadBtn');
    const uploadBtn = document.getElementById('uploadttd');
    
    if (!modal || !closeBtn || !cancelBtn || !uploadBtn) {
        showAlert('error', 'Elemen modal tidak lengkap!');
        return;
    }
    
    // Hapus event listener lama jika ada
    closeBtn.removeEventListener('click', closeModal);
    cancelBtn.removeEventListener('click', closeModal);
    uploadBtn.removeEventListener('click', handleUpload);
    modal.removeEventListener('click', handleModalClick);
    
    // Tambahkan event listener baru
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    uploadBtn.addEventListener('click', handleUpload);
    modal.addEventListener('click', handleModalClick);
    
    // Setup preview
    setupFilePreview('signature1', 'preview1', 'previewImage1');
    
    async function handleUpload() {
        try {
            console.log('Memulai proses upload...');
            
            const signature1Input = document.getElementById('signature1');
            
            if (!signature1Input) {
                showAlert('error', 'Input file tanda tangan wajib pajak tidak ditemukan!');
                return;
            }
            
            if (!signature1Input.files.length) {
                showAlert('error', 'Harap upload tanda tangan wajib pajak!');
                return;
            }
            
            const signature1 = signature1Input.files[0];
            
            // Validasi file
            if (signature1 && !validateFile(signature1)) return;
            
            toggleLoading(true);
            showAlert('info', 'Memproses file...');
            
            // Proses file dengan error handling yang lebih baik
            let processedSig1 = null;
            
            try {
                if (signature1) {
                    processedSig1 = await processSignature(signature1);
                }
            } catch (error) {
                console.error('Error processing files:', error);
                showAlert('error', 'Gagal memproses file: ' + error.message);
                toggleLoading(false);
                return;
            }

            // Kirim ke backend
            await uploadSignatures(nobooking, processedSig1);
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('error', error.message || 'Terjadi kesalahan saat upload');
        } finally {
            toggleLoading(false);
        }
    }
    
    function handleModalClick(e) {
        if (e.target === modal) {
            closeModal();
        }
    }
}

function validateFile(file) {
    if (!file) {
        showAlert('error', 'File tidak ditemukan!');
        return false;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
        showAlert('error', 'Format file tidak didukung. Gunakan JPG atau PNG!');
        return false;
    }
    
    if (file.size > maxSize) {
        showAlert('error', 'Ukuran file terlalu besar. Maksimal 2MB!');
        return false;
    }
    
    return true;
}

// Fungsi setup preview yang diperbarui
function setupFilePreview(inputId, previewContainerId, previewImageId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewContainerId);
    const previewImage = document.getElementById(previewImageId);
    
    if (!input || !previewContainer || !previewImage) {
        console.error('Preview elements not found:', { inputId, previewContainerId, previewImageId });
        return;
    }
    
    const clearBtn = previewContainer.querySelector('.clear-btn');
    
    // Hapus event listener lama
    input.removeEventListener('change', handleFileChange);
    if (clearBtn) {
        clearBtn.removeEventListener('click', handleClear);
    }
    
    // Tambahkan event listener baru
    input.addEventListener('change', handleFileChange);
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!validateFile(file)) {
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.onerror = () => {
            showAlert('error', 'Gagal membaca file!');
            input.value = '';
        };
        reader.readAsDataURL(file);
    }
    
    function handleClear() {
        input.value = '';
        previewContainer.style.display = 'none';
    }
}

// Fungsi upload yang diperbarui
async function uploadSignatures(nobooking, signature1Blob) {
    try {
        console.log('Menyiapkan data untuk upload...', { nobooking });
        
        if (!nobooking) {
            throw new Error('No Booking tidak ditemukan! Silakan pilih data kembali.');
        }

        const formData = new FormData();
        formData.append('nobooking', nobooking);
        
        if (signature1Blob) {
            formData.append('signature1', signature1Blob, 'signature1.png');
        }
        
        console.log('Mengirim request ke server...', { endpoint: '/api/ppat/upload-signatures' });
        
        const response = await fetch('/api/ppat/upload-signatures', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Gagal mengupload tanda tangan');
        }
        
        showAlert('success', 'Tanda tangan berhasil diupload!');
        closeModal();
        
        if (typeof refreshData === 'function') {
            refreshData();
        }
    } catch (error) {
        console.error('Upload Error:', error);
        showAlert('error', error.message || 'Terjadi kesalahan saat mengupload tanda tangan');
        throw error;
    }
}

function closeModal() {
    const modal = document.getElementById('signatureModal');
    if (modal) {
        modal.style.display = 'none';
        resetSignatureForm();
    }
}

function resetSignatureForm() {
    const signature1 = document.getElementById('signature1');
    const preview1 = document.getElementById('preview1');
    
    if (signature1) signature1.value = '';
    if (preview1) preview1.style.display = 'none';
}

function toggleLoading(show) {
    const btn = document.getElementById('uploadttd');
    const loadingIndicator = document.getElementById('modalLoadingIndicator');
    
    if (btn) {
        btn.disabled = show;
    }
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'inline-block' : 'none';
    }
}

// Fungsi showAlert menggunakan Universal Alert System
function showAlert(type, message, title = null) {
    // Pastikan Universal Alert System sudah dimuat
    if (window.universalAlert) {
        return window.universalAlert.show({
            type,
            title: title || (type === 'success' ? 'Berhasil' : type === 'error' ? 'Error' : type === 'warning' ? 'Peringatan' : 'Informasi'),
            message,
            duration: 5000,
            clickOutsideToClose: true,
            showProgress: true
        });
    } else {
        // Fallback ke alert biasa jika Universal Alert System belum dimuat
        console.warn('Universal Alert System not loaded, using fallback alert');
        alert(message);
    }
    
    // Add styles for selected file preview
    const selectedFileStyle = document.createElement('style');
    selectedFileStyle.textContent = `
        .selected-file-info {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .file-input-wrapper {
            transition: opacity 0.3s ease;
        }
        
        .file-input-wrapper.hidden {
            display: none !important;
        }
        
        .file-info-uploaded {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
            padding: 10px;
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 8px;
        }
        
        .uploaded-file-preview {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex: 1;
        }
        
        .file-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
        }
        
        .file-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
        }
        
        .file-name {
            font-weight: 500;
            color: #333;
            font-size: 14px;
            word-break: break-word;
        }
        
        .file-size {
            font-size: 12px;
            color: #666;
        }
        
        .btn-replace {
            margin-top: 8px;
            padding: 6px 12px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background-color 0.3s;
        }
        
        .btn-replace:hover {
            background: #5a6268;
        }
        
        .file-preview-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            margin-top: 8px;
        }
        
        .file-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        }
        
        .file-thumbnail {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .selected-file-info .file-thumbnail {
            width: 60px;
            height: 60px;
        }
        
        .pdf-icon {
            font-size: 24px;
            color: #dc3545;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .selected-file-info .pdf-icon {
            font-size: 40px;
            width: 60px;
            height: 60px;
        }
        
        /* Error States */
        .file-error {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            font-size: 14px;
        }
        
        .image-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            color: #6c757d;
            font-size: 12px;
            text-align: center;
        }
        
        .pdf-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 20px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            color: #721c24;
            text-align: center;
        }
        
        .pdf-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 20px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            color: #6c757d;
        }
        
        .video-icon {
            font-size: 24px;
            color: #28a745;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .btn-view {
            padding: 4px 8px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            transition: background-color 0.3s;
        }
        
        .btn-view:hover {
            background: #0056b3;
            color: white;
        }
        

        
        .btn-remove {
            padding: 2px 6px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 10px;
            transition: background-color 0.3s;
            margin-left: auto;
        }
        
        .selected-file-info .btn-remove {
            padding: 4px 8px;
            font-size: 12px;
        }
        
        .btn-remove:hover {
            background: #c82333;
        }
    `;
    document.head.appendChild(selectedFileStyle);
}
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
// ======================
        // GLOBAL CONFIGURATION Railway Storage
        // ======================
        const config = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    apiEndpoint: '/api/ppat/upload-documents',  // ✅ Railway storage multiple files
    proxyEndpoint: '/api/ppat/file-proxy',  // ✅ Railway storage proxy
    updateUrlEndpoint: '/api/ppat/update-file-urls'  // ✅ Update file URLs
        };

        function initializeFileUploads() {
            document.querySelectorAll('.document-section').forEach(section => {
                const nobooking = section.id.replace('document-', '');
                if (!nobooking) return;

                // Setup event listeners for all file inputs
                initFileInputs(nobooking);
            });
        }
        function initFileInputs(nobooking) {
            const fileInputs = [
                { id: `aktaTanahInput-${nobooking}`, previewId: `aktaTanahPreview-${nobooking}` },
                { id: `sertifikatTanahInput-${nobooking}`, previewId: `sertifikatTanahPreview-${nobooking}` },
                { id: `pelengkapInput-${nobooking}`, previewId: `pelengkapPreview-${nobooking}` }
            ];

            fileInputs.forEach(({ id, previewId }) => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('change', function() {
                        const previewElement = document.getElementById(previewId);
                        if (previewElement) {
                            handleFilePreview(this, previewElement, nobooking);
                        }
                    });
                }
            });
        }
        function handleFilePreview(input, previewElement, nobooking) {
            if (!previewElement) return;

            previewElement.innerHTML = '';
            const file = input.files?.[0];
            if (!file) return;

            // Validate file
            if (!validateFile(file, nobooking)) {
                input.value = '';
                return;
            }

            // Create preview
            createFilePreview(file, previewElement);
            setupFileRemoval(input, previewElement);
            
            // Update the upload area to show selected file info
            updateUploadAreaDisplay(input, file, nobooking);
        }
        function validateFile(file, nobooking) {
            // Size validation
            if (file.size > config.maxFileSize) {
                showStatus(`File ${file.name} terlalu besar (maksimal 5MB)!`, 'error', nobooking);
                return false;
            }

            // Type validation
            if (!config.allowedFileTypes.includes(file.type)) {
                showStatus(`File ${file.name} harus berupa PDF, JPEG, atau PNG!`, 'error', nobooking);
                return false;
            }

            return true;
        }
        function createFilePreview(file, previewElement) {
            const container = document.createElement('div');
            container.className = 'file-preview-item';

            if (file.type === 'application/pdf') {
                container.innerHTML = `
                    <div class="file-content">
                        <i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">(${(file.size/1024/1024).toFixed(2)} MB)</span>
                        </div>
                    </div>
                `;
            } else if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    container.innerHTML = `
                        <div class="file-content">
                            <img src="${e.target.result}" class="file-thumbnail" alt="Preview ${file.name}">
                            <div class="file-info">
                                <span class="file-name">${file.name}</span>
                                <span class="file-size">(${(file.size/1024/1024).toFixed(2)} MB)</span>
                            </div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }

            previewElement.appendChild(container);
        }
        function setupFileRemoval(input, previewElement) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove';
            removeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
            removeBtn.setAttribute('aria-label', 'Hapus file');
            removeBtn.onclick = () => {
                input.value = '';
                previewElement.innerHTML = '';
                
                // Clear upload area display and show upload button again
                const nobooking = input.id.split('-').pop();
                const fieldName = input.id.replace(`Input-${nobooking}`, '');
                const container = document.getElementById(`${fieldName}Container-${nobooking}`);
                if (container) {
                    const fileInfoDisplay = container.querySelector('.selected-file-info');
                    if (fileInfoDisplay) {
                        fileInfoDisplay.remove();
                    }
                    
                    const uploadWrapper = container.querySelector('.file-input-wrapper');
                    if (uploadWrapper) {
                        uploadWrapper.classList.remove('hidden');
                    }
                }
            };

            previewElement.querySelector('.file-preview-item')?.appendChild(removeBtn);
        }
        async function uploadFiles(selectedNoBooking) {
            // Confirm before upload
            if (!confirm('Anda yakin ingin mengupload dokumen?')) {
                return;
            }

            const fileInputs = {
                aktaTanah: document.getElementById(`aktaTanahInput-${selectedNoBooking}`),
                sertifikatTanah: document.getElementById(`sertifikatTanahInput-${selectedNoBooking}`),
                pelengkap: document.getElementById(`pelengkapInput-${selectedNoBooking}`)
            };

            const fileStatus = document.getElementById(`fileStatus-${selectedNoBooking}`);
            const progressBar = document.getElementById(`uploadProgress-${selectedNoBooking}`);
            const btnUpload = document.querySelector(`button[onclick="uploadFiles('${selectedNoBooking}')"]`);

            // Validate required files
            for (const [type, input] of Object.entries(fileInputs)) {
                if (!input.files[0] && !document.querySelector(`#${type}Container-${selectedNoBooking} .file-info-uploaded`)) {
                    showStatus(`File ${type.replace(/([A-Z])/g, ' $1')} wajib diunggah!`, 'error', selectedNoBooking);
                    return;
                }
            }

            // Railway storage is always available (local filesystem)
            console.log('✅ [UPLOAD] Railway storage is ready for upload');

            // Prepare form data
            const formData = new FormData();
            formData.append('nobooking', selectedNoBooking);

            for (const [type, input] of Object.entries(fileInputs)) {
                if (input.files[0]) {
                    formData.append(type, input.files[0]);
                }
            }

            try {
                // UI updates
                btnUpload.disabled = true;
                btnUpload.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload dokumen...';
                progressBar.style.display = 'block';
                showStatus("Mengupload dokumen...", 'info', selectedNoBooking);

                // Upload with progress tracking
                const xhr = new XMLHttpRequest();
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        const progressFill = document.querySelector(`#uploadProgress-${selectedNoBooking} .progress-fill`);
                        if (progressFill) {
                            progressFill.style.width = `${percent}%`;
                        }
                    }
                };

                const response = await fetch(config.apiEndpoint, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.success) {
                    showStatus("Dokumen berhasil diupload!", 'success', selectedNoBooking);
                    
                    // Log cleanup results if available
                    if (result.cleanup_status) {
                        console.log('🧹 Cleanup results:', result.cleanup_status);
                    }
                    
                    updateDocumentDisplay(selectedNoBooking, result.data);
                    resetFileInputs(selectedNoBooking);
                    
                    // Update file URLs to proper format
                const updateResult = await updateFileUrls(selectedNoBooking);
                if (updateResult && updateResult.updated > 0) {
                    console.log(`✅ [UPLOAD] Updated ${updateResult.updated} file URLs`);
                }

                // 🧩 Validate uploaded files using proxy endpoint
                console.log(`🧩 [UPLOAD] Starting proxy validation for uploaded files`);
                
                // Extract upload results from backend response
                const uploadResults = result.uploadResults || [];
                
                for (const upload of uploadResults) {
                    if (upload.success && upload.relativePath) {
                        console.log(`🧩 [UPLOAD] Validating file: ${upload.relativePath}`);
                        const validationResult = await validateFileWithRailwayFrontend(upload.relativePath, upload.mimeType);
                        
                        if (validationResult.ready) {
                            console.log(`✅ [UPLOAD] File validation passed via Railway: ${upload.relativePath}`);
                        } else {
                            console.warn(`⚠️ [UPLOAD] File validation via Railway failed: ${validationResult.message}`);
                        }
                    }
                }
                    
                    // Reload after a short delay to show success message
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    showStatus(result.message || "Gagal mengupload dokumen", 'error', selectedNoBooking);
                }
            } catch (error) {
                console.error('Upload error:', error);
                
                let errorMessage = "Terjadi kesalahan saat mengupload dokumen.";
                
                if (error.message.includes('HTTP 413')) {
                    errorMessage = "File terlalu besar. Maksimal 5MB per file.";
                } else if (error.message.includes('HTTP 415')) {
                    errorMessage = "Format file tidak didukung. Gunakan PDF, JPG, atau PNG.";
                } else if (error.message.includes('HTTP 500')) {
                    errorMessage = "Server error. Silakan coba lagi nanti.";
                } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                    errorMessage = "Koneksi bermasalah. Periksa internet Anda.";
                }
                
                showStatus(errorMessage, 'error', selectedNoBooking);
            } finally {
                btnUpload.disabled = false;
                btnUpload.innerHTML = '<i class="fas fa-upload"></i> Upload Semua Dokumen';
                setTimeout(() => {
                    progressBar.style.display = 'none';
                    const progressFill = document.querySelector(`#uploadProgress-${selectedNoBooking} .progress-fill`);
                    if (progressFill) {
                        progressFill.style.width = '0%';
                    }
                }, 1000);
            }
        }
        function updateDocumentDisplay(nobooking, data) {
            // Helper function to create uploaded file display
            const createUploadedFileDisplay = (type, fileData) => {
                const container = document.getElementById(`${type}Container-${nobooking}`);
                if (!container || !fileData) return;

                // Gunakan fileUrl dari Railway storage dengan validasi
                const displayUrl = fileData.fileUrl || fileData.url || fileData.publicUrl;
                const fileName = fileData.fileName || 'Unknown file';
                const mimeType = fileData.mimeType || '';
                const fileSize = fileData.size || 0;
                
                // Validasi URL
                if (!displayUrl || displayUrl === 'null' || displayUrl === 'undefined' || !displayUrl.startsWith('http')) {
                    console.warn(`Invalid display URL for ${type}:`, displayUrl);
                    container.innerHTML = `
                        <label>${type === 'aktaTanah' ? 'Akta Tanah' : type === 'sertifikatTanah' ? 'Sertifikat Tanah' : 'Dokumen Pelengkap'}:</label>
                        <div class="file-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>File tidak tersedia atau URL tidak valid</span>
                        </div>
                    `;
                    return;
                }
                
                // Deteksi file type yang lebih robust
                const isPdf = mimeType === 'application/pdf' || 
                              displayUrl.toLowerCase().endsWith('.pdf') || 
                              fileName.toLowerCase().endsWith('.pdf');
                              
                const isImage = mimeType.startsWith('image/') || 
                                ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].some(ext => 
                                    fileName.toLowerCase().endsWith('.' + ext)
                                );
                                
                const isVideo = mimeType.startsWith('video/') || 
                                ['mp4', 'avi', 'mov', 'wmv'].some(ext => 
                                    fileName.toLowerCase().endsWith('.' + ext)
                                );

                // Format file size
                const formatFileSize = (bytes) => {
                    if (bytes === 0) return '0 Bytes';
                    const k = 1024;
                    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                container.innerHTML = `
                    <label>${type === 'aktaTanah' ? 'Akta Tanah' : type === 'sertifikatTanah' ? 'Sertifikat Tanah' : 'Dokumen Pelengkap'}:</label>
                    <div class="file-info-uploaded">
                        <div class="uploaded-file-preview">
                            <div class="file-content">
                                ${isPdf ? 
                                    '<i class="fas fa-file-pdf pdf-icon" aria-hidden="true"></i>' : 
                                    isImage ? 
                                        `<img src="${displayUrl}" class="file-thumbnail" alt="Preview" 
                                              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                                              onload="this.nextElementSibling.style.display='none';">
                                         <div class="image-error" style="display:none;">
                                             <i class="fas fa-image"></i>
                                             <span>Preview tidak tersedia</span>
                                         </div>` :
                                    isVideo ?
                                        '<i class="fas fa-file-video video-icon" aria-hidden="true"></i>' :
                                        '<i class="fas fa-file-alt file-icon" aria-hidden="true"></i>'}
                                <div class="file-details">
                                    <span class="file-name" title="${fileName}">${fileName}</span>
                                    <span class="file-size">${formatFileSize(fileSize)}</span>
                                    <span class="file-type">${isPdf ? 'PDF' : isImage ? 'Image' : isVideo ? 'Video' : 'File'}</span>
                                </div>
                            </div>
                            <div class="file-actions">
                                <a href="${displayUrl}" target="_blank" class="btn-view" aria-label="Lihat dokumen">
                                    <i class="fas fa-eye"></i> Lihat
                                </a>
                                ${isPdf ? `
                                    <button class="btn-preview" onclick="previewPDF('${displayUrl}', '${fileName}')" aria-label="Preview PDF">
                                        <i class="fas fa-expand"></i> Preview
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <button class="btn-replace" onclick="replaceFile('${type}', '${nobooking}')" aria-label="Ganti file">
                        <i class="fas fa-sync-alt"></i> Ganti File
                    </button>
                    <input type="file" id="${type}Input-${nobooking}" 
                        accept="application/pdf,image/jpeg,image/png" class="file-input hidden">
                    <div class="file-preview" id="${type}Preview-${nobooking}"></div>
                `;

                // Reinitialize event listeners
                const input = document.getElementById(`${type}Input-${nobooking}`);
                if (input) {
                    input.addEventListener('change', function() {
                        const previewElement = document.getElementById(`${type}Preview-${nobooking}`);
                        if (previewElement) {
                            handleFilePreview(this, previewElement, nobooking);
                        }
                    });
                }
            };

            // Update each file type if available using Railway storage data
            if (data.fileDetails) {
                if (data.fileDetails.aktaTanah) createUploadedFileDisplay('aktaTanah', data.fileDetails.aktaTanah);
                if (data.fileDetails.sertifikatTanah) createUploadedFileDisplay('sertifikatTanah', data.fileDetails.sertifikatTanah);
                if (data.fileDetails.pelengkap) createUploadedFileDisplay('pelengkap', data.fileDetails.pelengkap);
            } else {
                // Fallback untuk data lama
                if (data.akta_tanah_path) createUploadedFileDisplay('aktaTanah', { 
                    fileUrl: data.akta_tanah_path, 
                    fileName: data.akta_tanah_path.split('/').pop() 
                });
                if (data.sertifikat_tanah_path) createUploadedFileDisplay('sertifikatTanah', { 
                    fileUrl: data.sertifikat_tanah_path, 
                    fileName: data.sertifikat_tanah_path.split('/').pop() 
                });
                if (data.pelengkap_path) createUploadedFileDisplay('pelengkap', { 
                    fileUrl: data.pelengkap_path, 
                    fileName: data.pelengkap_path.split('/').pop() 
                });
            }
        }
        function replaceFile(type, nobooking) {
            const input = document.getElementById(`${type}Input-${nobooking}`);
            if (input) {
                // Clear any existing previews
                const container = document.getElementById(`${type}Container-${nobooking}`);
                if (container) {
                    const fileInfoUploaded = container.querySelector('.file-info-uploaded');
                    if (fileInfoUploaded) {
                        fileInfoUploaded.remove();
                    }
                    
                    const btnReplace = container.querySelector('.btn-replace');
                    if (btnReplace) {
                        btnReplace.remove();
                    }
                    
                    const preview = container.querySelector('.file-preview');
                    if (preview) {
                        preview.innerHTML = '';
                    }
                    
                    // Show upload area again
                    const uploadWrapper = container.querySelector('.file-input-wrapper');
                    if (uploadWrapper) {
                        uploadWrapper.classList.remove('hidden');
                    }
                    
                    // Clear selected file info
                    const selectedFileInfo = container.querySelector('.selected-file-info');
                    if (selectedFileInfo) {
                        selectedFileInfo.remove();
                    }
                }
                
                input.click();
            }
        }
        // Function to update file URLs to proper Railway storage format
        async function updateFileUrls(nobooking) {
            try {
                console.log(`🔧 [UPDATE-URLS] Updating file URLs for user`);
                
                const response = await fetch(config.updateUrlEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                    // No body needed - endpoint gets nobooking from database
                });

                const result = await response.json();

                if (result.success) {
                    console.log(`✅ [UPDATE-URLS] URLs updated successfully:`, result.data);
                    return result.data;
                } else {
                    console.error(`❌ [UPDATE-URLS] Update failed:`, result.message);
                    return null;
                }
            } catch (error) {
                console.error(`❌ [UPDATE-URLS] Update error:`, error);
                return null;
            }
        }

        // 🧩 Function to validate file with proxy endpoint (Frontend Integration)
        async function validateFileWithRailwayFrontend(relativePath, mimeType = null) {
            try {
                console.log(`🧩 [VALIDATE-RAILWAY-FRONTEND] Starting Railway validation for file: ${relativePath}`);
                
const proxyUrl = `/api/ppat/file-proxy?relativePath=${encodeURIComponent(relativePath)}`;
                
                // Use HEAD request for validation (faster than GET)
                const response = await fetch(proxyUrl, {
                    method: 'HEAD',
                    credentials: 'include',
                    timeout: 10000 // Railway storage is immediate, shorter timeout
                });
                
                if (response.status === 200) {
                    console.log(`✅ [VALIDATE-RAILWAY-FRONTEND] File sudah tersedia di Railway: ${relativePath}`);
                    return {
                        success: true,
                        message: 'File sudah tersedia di Railway',
                        status: response.status,
                        ready: true
                    };
                } else {
                    console.log(`⚠️ [VALIDATE-RAILWAY-FRONTEND] File tidak ditemukan: ${relativePath}`);
                    return {
                        success: false,
                        message: 'File tidak ditemukan di Railway',
                        status: response.status,
                        ready: false
                    };
                }
            } catch (error) {
                console.warn(`⚠️ [VALIDATE-RAILWAY-FRONTEND] Validation failed: ${error.message}`);
                return {
                    success: false,
                    message: 'Validation failed',
                    error: error.message,
                    ready: false
                };
            }
        }

        function resetFileInputs(nobooking) {
            const inputs = [
                `aktaTanahInput-${nobooking}`,
                `sertifikatTanahInput-${nobooking}`,
                `pelengkapInput-${nobooking}`
            ];

            inputs.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.value = '';
                    
                    // Clear previews and show upload area
                    const fieldName = id.replace(`Input-${nobooking}`, '');
                    const container = document.getElementById(`${fieldName}Container-${nobooking}`);
                    if (container) {
                        const preview = container.querySelector('.file-preview');
                        if (preview) {
                            preview.innerHTML = '';
                        }
                        
                        const selectedFileInfo = container.querySelector('.selected-file-info');
                        if (selectedFileInfo) {
                            selectedFileInfo.remove();
                        }
                        
                        const uploadWrapper = container.querySelector('.file-input-wrapper');
                        if (uploadWrapper) {
                            uploadWrapper.classList.remove('hidden');
                        }
                    }
                }
            });
        }

// Function to preview PDF in modal
function previewPDF(pdfUrl, fileName) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'pdf-preview-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePDFPreview()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${fileName}</h3>
                    <div class="preview-options">
                        <button class="btn-option active" onclick="switchPreviewMode('cdn', '${pdfUrl}')" id="cdnBtn">
                            <i class="fas fa-cloud"></i> CDN Direct
                        </button>
                        <button class="btn-option" onclick="switchPreviewMode('proxy', '${pdfUrl}')" id="proxyBtn">
                            <i class="fas fa-server"></i> Railway Proxy
                        </button>
                    </div>
                    <button class="close-btn" onclick="closePDFPreview()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="pdf-container">
                        <div class="pdf-loading" id="pdfLoading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Memuat PDF...</span>
                        </div>
                        <iframe id="pdfFrame" src="${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1" type="application/pdf" width="100%" height="600px" 
                               sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                               onload="document.getElementById('pdfLoading').style.display='none';"
                               onerror="this.style.display='none'; document.getElementById('pdfLoading').style.display='none'; this.nextElementSibling.style.display='block';" />
                        <div class="pdf-error" style="display:none;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h4>PDF tidak dapat dimuat</h4>
                            <p>File PDF mungkin rusak atau tidak dapat diakses.</p>
                            <a href="${pdfUrl}" target="_blank" class="btn-download">
                                <i class="fas fa-download"></i> Download PDF
                            </a>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <a href="${pdfUrl}" target="_blank" class="btn-download">
                            <i class="fas fa-download"></i> Download
                        </a>
                        <button onclick="closePDFPreview()" class="btn-close">
                            <i class="fas fa-times"></i> Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .pdf-preview-modal {
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
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-content {
            background: white;
            border-radius: 8px;
            max-width: 90%;
            max-height: 90%;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            background: #f8f9fa;
        }
        .preview-options {
            display: flex;
            gap: 10px;
            margin: 0 20px;
        }
        .btn-option {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.3s ease;
        }
        .btn-option:hover {
            background: #f0f0f0;
        }
        .btn-option.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
        .btn-option i {
            margin-right: 5px;
        }
        .modal-header h3 {
            margin: 0;
            color: #333;
            font-size: 18px;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
            padding: 5px;
        }
        .close-btn:hover {
            color: #333;
        }
        .modal-body {
            padding: 0;
        }
        .modal-body embed {
            border: none;
            display: block;
        }
        .modal-actions {
            padding: 15px 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        .btn-download, .btn-close {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            font-size: 14px;
        }
        .btn-download {
            background: #007bff;
            color: white;
        }
        .btn-download:hover {
            background: #0056b3;
        }
        .btn-close {
            background: #6c757d;
            color: white;
        }
        .btn-close:hover {
            background: #545b62;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Store current URL for switching modes
    window.currentPreviewUrl = pdfUrl;
    window.currentPreviewFileName = fileName;
}

// Function to switch preview mode
function switchPreviewMode(mode, pdfUrl) {
    const cdnBtn = document.getElementById('cdnBtn');
    const proxyBtn = document.getElementById('proxyBtn');
    const pdfFrame = document.getElementById('pdfFrame');
    const loading = document.getElementById('pdfLoading');
    
    if (!pdfFrame || !loading) {
        console.error('Preview elements not found');
        return;
    }
    
    // Update button states
    cdnBtn.classList.toggle('active', mode === 'cdn');
    proxyBtn.classList.toggle('active', mode === 'proxy');
    
    // Show loading
    loading.style.display = 'block';
    
    if (mode === 'cdn') {
        // Direct CDN preview
        console.log(`🔄 [PREVIEW] Switching to CDN mode: ${pdfUrl}`);
        pdfFrame.src = `${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`;
    } else if (mode === 'proxy') {
        // Railway storage proxy preview
const relativePath = pdfUrl.replace('/storage/ppat/', '');
const proxyUrl = `/api/ppat/file-proxy?relativePath=${encodeURIComponent(relativePath)}`;
        console.log(`🔄 [PREVIEW] Switching to Proxy mode: ${proxyUrl}`);
        pdfFrame.src = proxyUrl;
    }
}

// Function to close PDF preview modal
function closePDFPreview() {
    const modal = document.querySelector('.pdf-preview-modal');
    if (modal) {
        modal.remove();
    }
}

        // ======================
        // DRAG & DROP HANDLERS
        // ======================

        function handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('dragover');
        }

        function handleDragLeave(e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('dragover');
        }

        function handleDrop(e, inputId) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('dragover');

            const input = document.getElementById(inputId);
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                const event = new Event('change');
                input.dispatchEvent(event);
            }
        }

        // ======================
        // UTILITY FUNCTIONS
        // ======================

        /**
         * Show status message
         */
        function showStatus(message, type, nobooking) {
            const statusEl = document.getElementById(`fileStatus-${nobooking}`);
            if (!statusEl) return;

            statusEl.textContent = message;
            statusEl.style.color = 
                type === 'error' ? 'var(--danger)' :
                type === 'success' ? 'var(--success)' : 'var(--primary)';

            statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Auto-hide for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    if (statusEl.textContent === message) {
                        statusEl.textContent = '';
                    }
                }, 5000);
            }
        }

        // ======================
        // INITIALIZATION
        // ======================

        document.addEventListener('DOMContentLoaded', initializeFileUploads);
/////////////      FUNGSI VALIDASI SEBELUM PENGIRIMAN         ///////////////////////
function validateBeforeSend(nobooking) {
    const row = findTableRow(nobooking);
    if (!row) return false;

    // Cache validation config
    const validationConfig = window.validationConfig || 
          (window.validationConfig = getValidationConfig());
    
    // Parallel validation jika memungkinkan
    const validationPromises = Object.entries(validationConfig).map(([key, validator]) => 
        validator.validate(row)
    );
    
    return Promise.all(validationPromises)
        .then(results => results.every(Boolean))
        .catch(() => false);
}

// Helper functions
function escapeForSelector(value) {
    // Simplified escape for our specific case (handles only what we need)
    return value.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

function findTableRow(nobooking) {
    if (!nobooking) return null;
    
    // 1. Normalisasi input (tanpa CSS.escape)
    const cleanNoBooking = String(nobooking).trim();
    
    // 2. Cari dengan selector aman tanpa escaping problem
    // Gunakan selector attribute exact match
    const selector = `tr[data-nobooking="${cleanNoBooking.replace(/"/g, '\\"')}"]`;
    
    try {
        // 3. Coba langsung dengan querySelector
        const row = document.querySelector(selector);
        if (row) return row;
        
        // 4. Fallback: Cari manual jika selector gagal
        const rows = document.querySelectorAll('tr[data-nobooking]');
        for (const row of rows) {
            if (row.dataset.nobooking === cleanNoBooking) {
                return row;
            }
        }
        
        // 5. Log debug jika tidak ditemukan
        console.debug('Available rows:', 
            Array.from(rows).map(r => r.dataset.nobooking));
        return null;
        
    } catch (e) {
        console.error('Selector error:', e);
        return null;
    }
}
//
function getValidationConfig() {
    return {
        dokumen: [
            { 
                selector: '[data-field="akta_tanah_path"]', 
                label: "Akta Tanah",
                validate: (value) => !value || value === 'NULL'
            },
            { 
                selector: '[data-field="sertifikat_tanah_path"]', 
                label: "Sertifikat Tanah",
                validate: (value) => !value || value === 'NULL'
            },
            { 
                selector: '[data-field="pelengkap_path"]', 
                label: "Dokumen Pelengkap",
                validate: (value) => !value || value === 'NULL'
            }
        ],
        alamat: [
            { 
                selector: '[data-field="alamat_pemohon"]', 
                label: "Alamat Pemohon",
                validate: (value) => !value || value === 'NULL'
            },
            { 
                selector: '[data-field="kampungop"]', 
                label: "Kampung",
                validate: (value) => !value || value === 'NULL'
            },
            { 
                selector: '[data-field="kelurahanop"]', 
                label: "Kelurahan",
                validate: (value) => !value || value === 'NULL'
            },
            { 
                selector: '[data-field="kecamatanopj"]', 
                label: "Kecamatan",
                validate: (value) => !value || value === 'NULL'
            }
        ]
    };
}

function performValidations(row, config) {
    const results = {
        dokumen: { missing: [], elements: [] },
        alamat: { missing: [], elements: [] }
    };

    Object.entries(config).forEach(([category, fields]) => {
        fields.forEach(({ selector, label, validate }) => {
            const element = row.querySelector(selector);
            const value = element?.textContent.trim() || '';
            
            if (validate(value)) {
                results[category].missing.push(label);
                results[category].elements.push(element);
            }
        });
    });

    return results;
}

function handleValidationResults(results) {
    const { dokumen, alamat } = results;
    let isValid = true;
    let errorMessage = '';

    if (dokumen.missing.length > 0) {
        errorMessage += `Dokumen wajib belum lengkap:\n• ${dokumen.missing.join("\n• ")}\n\n`;
        isValid = false;
        
        // Highlight missing document fields
        dokumen.elements.forEach(el => {
            if (el) el.classList.add('missing-field');
        });
    }

    if (alamat.missing.length > 0) {
        errorMessage += `Data alamat belum lengkap:\n• ${alamat.missing.join("\n• ")}`;
        isValid = false;
        
        // Highlight missing address fields
        alamat.elements.forEach(el => {
            if (el) el.classList.add('missing-field');
        });
    }

    if (!isValid) {
        showValidationAlert(errorMessage);
    }

    return isValid;
}

function showValidationAlert(message) {
    // Create more user-friendly alert
    const alertBox = document.createElement('div');
    alertBox.className = 'validation-alert';
    alertBox.innerHTML = `
        <h4>Data Belum Lengkap</h4>
        <div class="alert-content">${message.replace(/\n/g, '<br>')}</div>
        <button onclick="this.parentElement.remove()">OK</button>
    `;
    document.body.appendChild(alertBox);
}


///////////////
// Helper functions
function checkDataCompleteness(item) {
    const requiredDocs = ['akta_tanah_path', 'sertifikat_tanah_path', 'pelengkap_path'];
    const requiredAddressFields = ['alamat_pemohon', 'kampungop', 'kelurahanop', 'kecamatanopj'];
    
    const hasAllDocs = requiredDocs.every(doc => item[doc]);
    const hasCompleteAddress = requiredAddressFields.every(field => item[field]);
    
    return hasAllDocs && hasCompleteAddress;
}
function renderFileSection(item, fieldName, label) {
    if (item[fieldName]) {
        return `
            <div class="file-item">
                <span>${label}: ${item[fieldName].split('/').pop()}</span>
                <a href="${item[fieldName]}" target="_blank" class="view-btn">
                    <i class="fas fa-eye"></i> View
                </a>
            </div>
        `;
    } else {
        return `
            <div class="file-upload missing-file">
                <label for="${fieldName}Input-${item.nobooking}">Pilih ${label}:</label>
                <input type="file" id="${fieldName}Input-${item.nobooking}" 
                       name="${fieldName}Input" accept="application/pdf,image/*">
            </div>
        `;
    }
}
///////////////
// Fungsi untuk mengirim data ke LTB (complete)
async function sendToLtb(nobooking) {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 detik
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Tampilkan loading indicator
            const sendButton = document.querySelector(`[data-booking="${nobooking}"] .btn-send-to-ltb`);
            if (sendButton) {
                sendButton.disabled = true;
                sendButton.textContent = `Mengirim... (${attempt}/${maxRetries})`;
            }

            // Set timeout untuk request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 detik timeout

            // ✅ UPDATED: Use send-now endpoint instead of old ltb-process
const response = await fetch(`/api/ppat/send-now?nobooking=${encodeURIComponent(nobooking)}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nobooking }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Reset button state
                const sendButton = document.querySelector(`[data-booking="${nobooking}"] .btn-send-to-ltb`);
                if (sendButton) {
                    sendButton.disabled = false;
                    sendButton.textContent = 'Kirim ke LTB';
                }

                // Tampilkan overlay notifikasi 1-2 detik setelah pengiriman
                try {
                    const overlay_send = document.getElementById('ltb-overlay-send');
                    const messageEl = document.getElementById('ltb-overlay-message');
                    const closeBtn = document.getElementById('ltb-overlay-close');
                    const audioEl = document.getElementById('ltb-success-audio');
                    if (overlay_send && messageEl) {
                        const nob = nobooking;
                        const noreg = result.no_registrasi || '-';
                        messageEl.textContent = `Nobooking anda ${nob} telah masuk ke dalam daftar antrian di Loket Terima Berkas dengan antrian ${noreg}, dan sedang di olah`;
                        setTimeout(() => {
                            overlay_send.style.display = 'block';
                            // Coba play audio notifikasi (beberapa browser hanya mengizinkan setelah user interaction)
                            try { audioEl && audioEl.play && audioEl.play().catch(() => {}); } catch(_) {}
                        }, 1000);
                        if (closeBtn) {
                            closeBtn.onclick = () => {
                                overlay_send.style.display = 'none';
                                location.reload();
                            };
                        }
                    } else {
                        showAlert('success', `Sukses! Data berhasil dikirim ke LTB. No Registrasi: ${result.no_registrasi}`);
                        setTimeout(() => location.reload(), 2000);
                    }
                } catch (_) {
                    showAlert('success', `Sukses! Data berhasil dikirim ke LTB. No Registrasi: ${result.no_registrasi}`);
                    setTimeout(() => location.reload(), 2000);
                }
                return; // Berhasil, keluar dari loop retry
            } else {
                throw new Error(result.message || 'Gagal mengirim data');
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            
            // Reset button state
            const sendButton = document.querySelector(`[data-booking="${nobooking}"] .btn-send-to-ltb`);
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.textContent = 'Kirim ke LTB';
            }

            if (attempt === maxRetries) {
                // Semua percobaan gagal
                if (error.name === 'AbortError') {
                    showAlert('error', 'Request timeout - proses terlalu lama. Silakan coba lagi.');
                } else {
                    showAlert('error', `Gagal mengirim data setelah ${maxRetries} percobaan. Error: ${error.message}`);
                }
                return;
            } else {
                // Tunggu sebelum retry
                console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
}
///////////////////         END             //////////////////////////////
// Add keyboard navigation for pagination
function addPaginationKeyboardSupport() {
    document.addEventListener('keydown', function(e) {
        const paginationContainer = document.querySelector('.list-button');
        if (!paginationContainer) return;
        
        // Only handle keyboard navigation when pagination is visible
        if (paginationContainer.children.length === 0) return;
        
        // Get current page info from pagination info
        const pageInfo = document.querySelector('.pagination-info');
        if (!pageInfo) return;
        
        const currentPageMatch = pageInfo.textContent.match(/Halaman (\d+)/);
        const totalPagesMatch = pageInfo.textContent.match(/dari (\d+)/);
        
        if (!currentPageMatch || !totalPagesMatch) return;
        
        const currentPage = parseInt(currentPageMatch[1]);
        const totalPages = parseInt(totalPagesMatch[1]);
        
        let shouldNavigate = false;
        let newPage = currentPage;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                if (currentPage > 1) {
                    newPage = currentPage - 1;
                    shouldNavigate = true;
                }
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                if (currentPage < totalPages) {
                    newPage = currentPage + 1;
                    shouldNavigate = true;
                }
                break;
            case 'Home':
                if (currentPage > 1) {
                    newPage = 1;
                    shouldNavigate = true;
                }
                break;
            case 'End':
                if (currentPage < totalPages) {
                    newPage = totalPages;
                    shouldNavigate = true;
                }
                break;
        }
        
        if (shouldNavigate) {
            e.preventDefault();
            loadTableData(newPage);
        }
    });
}

// Add loading state to pagination buttons
function setPaginationLoading(isLoading) {
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            // Re-enable buttons based on their original state
            const currentPageMatch = document.querySelector('.pagination-info')?.textContent.match(/Halaman (\d+)/);
            const totalPagesMatch = document.querySelector('.pagination-info')?.textContent.match(/dari (\d+)/);
            
            if (currentPageMatch && totalPagesMatch) {
                const currentPage = parseInt(currentPageMatch[1]);
                const totalPages = parseInt(totalPagesMatch[1]);
                
                if (button.innerHTML === '<<' || button.innerHTML === '<') {
                    button.disabled = currentPage === 1;
                } else if (button.innerHTML === '>>' || button.innerHTML === '>') {
                    button.disabled = currentPage === totalPages;
                } else if (!isNaN(parseInt(button.innerHTML))) {
                    button.disabled = parseInt(button.innerHTML) === currentPage;
                }
            }
        }
    });
}

// Enhanced loadTableData with loading states
const originalLoadTableData = loadTableData;
loadTableData = async function(page = 1) {
    try {
        setPaginationLoading(true);
        await originalLoadTableData(page);
    } catch (error) {
        console.error('Error loading table data:', error);
        if (window.universalAlert) {
            window.universalAlert.error('Gagal memuat data tabel');
        }
    } finally {
        setPaginationLoading(false);
    }
};

// Initialize keyboard support when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    addPaginationKeyboardSupport();
});

// Panggil fungsi saat halaman dimuat
window.onload = loadTableData;
//////////////////////////////////////                  //////////////////////////////////////////
// ======================
// Scheduling quota modal
// ======================
function openScheduleModal(nobooking){
    try {
        const overlay = document.createElement('div');
        overlay.className = 'quota-modal-overlay';
        overlay.innerHTML = `
        <div class="quota-modal">
            <div class="qm-header">
                <h3>Jadwalkan Pengiriman</h3>
                <button class="qm-close" aria-label="Tutup">×</button>
            </div>
            <div class="qm-body">
                <div class="qm-counter">
                    <span id="qmDateLabel">Hari ini</span>
                    <span id="qmCounter">0/80</span>
                </div>
                <div class="qm-options">
                    <button id="qmSendNow" class="qm-option primary">Kirim Sekarang</button>
                    <div class="qm-datepick">
                        <input type="date" id="qmDate" />
                        <button id="qmSchedule" class="qm-option">Tentukan Tanggal</button>
                    </div>
                </div>
                <div class="qm-confirm" id="qmConfirm" style="display:none">
                    <div class="qm-confirm-text" id="qmConfirmText"></div>
                    <div class="qm-confirm-actions">
                        <button id="qmYes" class="qm-option primary">Iya</button>
                        <button id="qmNo" class="qm-option">Batal</button>
                    </div>
                </div>
                <div id="qmStatus" class="qm-status"></div>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        const close = () => overlay.remove();
        overlay.querySelector('.qm-close').onclick = close;
        overlay.onclick = (e)=>{ if (e.target === overlay) close(); };

        // Style (scoped)
        const style = document.createElement('style');
        style.textContent = `
        .quota-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:9999}
        .quota-modal{background:#fff;border-radius:8px;min-width:320px;max-width:420px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,.15)}
        .qm-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #eee}
        .qm-header h3{margin:0;font-size:16px}
        .qm-close{background:transparent;border:none;font-size:20px;cursor:pointer}
        .qm-body{padding:16px;display:flex;flex-direction:column;gap:12px}
        .qm-counter{display:flex;align-items:center;justify-content:space-between;font-weight:600}
        .qm-options{display:flex;flex-direction:column;gap:8px}
        .qm-option{padding:10px 12px;border:1px solid #ddd;border-radius:6px;background:#f8f9fa;cursor:pointer;text-align:center}
        .qm-option.primary{background:#007bff;color:#fff;border-color:#007bff}
        .qm-option:disabled{opacity:.5;cursor:not-allowed}
        .qm-datepick{display:flex;gap:8px;align-items:center}
        .qm-status{min-height:18px;color:#555;font-size:12px}
        `;
        document.head.appendChild(style);

        // Set date configuration
        const t = new Date();
        const pad = (n)=>String(n).padStart(2,'0');
        const dateInput = overlay.querySelector('#qmDate');
        dateInput.value = `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`;
        // Set min date to today
        dateInput.min = dateInput.value;

        const statusEl = overlay.querySelector('#qmStatus');
        const setStatus = (msg,type='info')=>{ statusEl.textContent = msg; statusEl.style.color = type==='error'?'#c00':'#555'; };

        async function fetchQuota(yyyy_mm_dd){
            try{
const r = await fetch(`/api/ppat/quota?date=${yyyy_mm_dd}`,{credentials:'include'});
                const j = await r.json();
                if(!r.ok || !j.success){ throw new Error(j.message||'Gagal mengambil kuota'); }
                const { used, limit } = j.data;
                overlay.querySelector('#qmCounter').textContent = `${used}/${limit}`;
                return j.data;
            }catch(e){ setStatus(e.message,'error'); return { used: 0, limit: 80, remaining:80 }; }
        }

        function iso(d){ return d.toISOString().slice(0,10); }
        const todayIso = iso(new Date());
        fetchQuota(todayIso);

        const confirmBox = overlay.querySelector('#qmConfirm');
        const confirmText = overlay.querySelector('#qmConfirmText');
        const btnYes = overlay.querySelector('#qmYes');
        const btnNo = overlay.querySelector('#qmNo');
        let pendingAction = null; // {type:'now'|'tomorrow'|'date', date}

        function showConfirm(msg, action){
            confirmText.textContent = msg;
            pendingAction = action;
            confirmBox.style.display = 'block';
        }

        btnNo.onclick = ()=>{ confirmBox.style.display = 'none'; pendingAction = null; setStatus(''); };
        btnYes.onclick = async () => {
            if(!pendingAction) return;
            try{
                setStatus('Memproses...');
                if (pendingAction.type === 'now') {
const url = `/api/ppat/send-now?nobooking=${encodeURIComponent(nobooking)}`;
                    const r = await fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({nobooking})});
                    const j = await r.json();
                    if(!r.ok || !j.success){ throw new Error(j.message||'Gagal mengirim'); }
                } else {
                    const yyyy_mm_dd = pendingAction.date;
const url = `/api/ppat/schedule-send?nobooking=${encodeURIComponent(nobooking)}&scheduled_for=${encodeURIComponent(yyyy_mm_dd)}`;
                    const r = await fetch(url,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({nobooking, scheduled_for: yyyy_mm_dd})});
                    const j = await r.json();
                    if(!r.ok || !j.success){ throw new Error(j.message||'Gagal menjadwalkan'); }
                }
                setStatus('Berhasil.');
                setTimeout(()=>location.reload(),800);
            }catch(e){ setStatus(e.message,'error'); }
        };

        overlay.querySelector('#qmSendNow').onclick = async () => {
            try{
                const now = new Date();
                const day = now.getDay(); // 0: Sunday, 6: Saturday
                if (day === 0 || day === 6) {
                    setStatus('Maaf, pengiriman tidak tersedia pada hari libur (Sabtu/Minggu).', 'error');
                    return;
                }
                const d = await fetchQuota(todayIso);
                showConfirm(`Kirim sekarang? Kuota hari ini ${d.used}/${d.limit}.`, {type:'now'});
            }catch(e){ setStatus(e.message,'error'); }
        };

        overlay.querySelector('#qmSchedule').onclick = async () => {
            try{
                const yyyy_mm_dd = dateInput.value;
                if(!yyyy_mm_dd){ setStatus('Pilih tanggal terlebih dahulu','error'); return; }
                
                // Validasi weekend untuk tanggal yang dipilih
                const selectedDate = new Date(yyyy_mm_dd);
                const day = selectedDate.getDay();
                if (day === 0 || day === 6) {
                    setStatus('Maaf, Bappenda libur pada hari Sabtu dan Minggu. Silakan pilih hari kerja.', 'error');
                    return;
                }

                const d = await fetchQuota(yyyy_mm_dd);
                showConfirm(`Jadwalkan tanggal ${yyyy_mm_dd}? Kuota ${d.used}/${d.limit}.`, {type:'date', date: yyyy_mm_dd});
            }catch(e){ setStatus(e.message,'error'); }
        };

        // Update counter saat tanggal berubah
        dateInput.addEventListener('change', async ()=>{
            const val = dateInput.value;
            if(!val) return;
            
            const selectedDate = new Date(val);
            const day = selectedDate.getDay();
            if (day === 0 || day === 6) {
                setStatus('Bappenda libur pada hari Sabtu & Minggu.', 'error');
                overlay.querySelector('#qmDateLabel').textContent = 'Hari Libur';
                overlay.querySelector('#qmCounter').textContent = '-/-';
                return;
            }

            overlay.querySelector('#qmDateLabel').textContent = 'Tanggal terpilih';
            await fetchQuota(val);
        });
    } catch(err){
        console.error('Open schedule modal failed:', err);
        alert('Gagal membuka jadwal pengiriman');
    }
}

// Fungsi untuk navigasi ke halaman form dengan data dari database
async function gotoform(nobooking) {
    console.log(`[DEBUG] Starting gotoform function with nobooking: ${nobooking}`);
    
    try {
        console.log('[DEBUG] Attempting to open new window');
        const newWindow = window.open('', '_blank');
        
        if (!newWindow) {
            console.error('[ERROR] Failed to open new window (might be blocked by popup blocker)');
            throw new Error('Failed to open new window. Please allow popups for this site.');
        }
        console.log('[DEBUG] New window opened successfully');

        // Buka halaman baru
        console.log('[DEBUG] Preparing user input data');
        const userInput = {
            alamat_pemohon: "",
            kampungop: "",
            kelurahanop: "",
            kecamatanopj: ""
        };
        console.log('[DEBUG] User input prepared:', userInput);

        console.log('[DEBUG] Attempting to fetch data from database');
        const formData = await fetchDataFromDatabase(nobooking, userInput);
        console.log('[DEBUG] Data fetched successfully:', formData);

        console.log('[DEBUG] Starting to generate HTML content');
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Formulir Validasi PPAT - ${nobooking}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
                <link rel="icon" href="asset/TitleE-bphtb.png" type="image/png">
                <style>
                :root {
                    --navy-blue: #001f3f;
                    --gold-accent: #d4af37;
                    --light-blue: #0074d9;
                    --light-gray: #f8f9fa;
                    --dark-gray: #333;
                    --white: #ffffff;
                    --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                /* Action Buttons */
                .action-buttons {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .form-wrapper {
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: var(--white);
                    border-radius: 10px;
                    box-shadow: var(--shadow);
                    font-family: 'Montserrat', sans-serif;
                }
                .form-title {
                    text-align: center;
                    color: var(--navy-blue);
                    margin-bottom: 2rem;
                    font-size: 2rem;
                    position: relative;
                    padding-bottom: 1rem;
                }
                .form-title::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 3px;
                    background: var(--gold-accent);
                }
                .form-header-decoration {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .tax-icon {
                    display: inline-block;
                    padding: 1rem;
                    background: var(--navy-blue);
                    border-radius: 50%;
                    color: var(--gold-accent);
                    font-size: 2rem;
                    width: 60px;
                    height: 60px;
                    margin-bottom: 1rem;
                }
                .tax-icon svg {
                    width: 100%;
                    height: 100%;
                }
                .elegant-section {
                    margin-bottom: 2rem;
                }

                .elegant-card {
                    background: var(--white);
                    border-radius: 8px;
                    box-shadow: var(--shadow);
                    padding: 1.5rem;
                    border-top: 4px solid var(--navy-blue);
                    position: relative;
                    overflow: hidden;
                }
                .elegant-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 5px;
                    height: 100%;
                    background: var(--gold-accent);
                }
                .section-header-decor h2 {
                    color: var(--navy-blue);
                    margin-top: 0;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(0, 31, 63, 0.1);
                    font-size: 1.3rem;
                    display: flex;
                    align-items: center;
                }
                .section-header-decor h2 i {
                    margin-right: 10px;
                    color: var(--gold-accent);
                }
                /****************************/
                .dual-column-section {
                    display: flex;
                    gap: 2rem;
                }
                .form-column {
                    flex: 1;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.2rem;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: var(--navy-blue);
                    font-size: 0.95rem;
                }
                .elegant-input {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    background-color: var(--light-gray);
                }
                .elegant-input:focus {
                    border-color: var(--light-blue);
                    box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.1);
                    outline: none;
                }
                .elegant-textarea {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    min-height: 100px;
                    resize: vertical;
                    font-family: inherit;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    background-color: var(--light-gray);
                }
                .elegant-textarea:focus {
                    border-color: var(--light-blue);
                    box-shadow: 0 0 0 3px rgba(0, 116, 217, 0.1);
                    outline: none;
                }
                /****************************/
                .label-with-icon {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.4rem;
                }
                .label-with-icon i {
                    margin-right: 8px;
                    color: var(--gold-accent);
                    font-size: 0.9rem;
                    width: 16px;
                    text-align: center;
                }

                /****************************/
                .form-section-collapsible .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    padding: 1rem 1.5rem;
                    background: var(--navy-blue);
                    color: white;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                .form-section-collapsible .section-header:hover {
                    background: #002a56;
                }
                .form-section-collapsible .section-header h2 {
                    margin: 0;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                }
                .form-section-collapsible .section-header h2 i {
                    margin-right: 10px;
                    color: var(--gold-accent);
                }
                .toggle-icon {
                    transition: transform 0.3s ease;
                }
                .section-content {
                    padding-top: 1.5rem;
                }
                /****************************/
                /****************************/
                /****************************/
                .two-column-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }
                .full-width-container {
                    grid-column: 1 / -1;
                    margin-top: 1.5rem;
                }
                .elegant-actions {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 2rem;
                }
                .elegant-btn {
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .elegant-btn i {
                    margin-right: 8px;
                }
                .btn-submit {
                    background: var(--navy-blue);
                    color: white;
                }
                .btn-submit:hover {
                    background: #002a56;
                    transform: translateY(-2px);
                }
                .btn-reset {
                    background: #f0f0f0;
                    color: var(--dark-gray);
                }
                .btn-reset:hover {
                    background: #e0e0e0;
                    transform: translateY(-2px);
                }
                .btn-simpan {
                    background: var(--gold-accent);
                    color: var(--navy-blue);
                }
                .btn-simpan:hover {
                    background: #e6c260;
                    transform: translateY(-2px);
                }
                .elegant-result {
                    background: var(--white);
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    margin-top: 2rem;
                    box-shadow: var(--shadow);
                    border-top: 4px solid var(--gold-accent);
                }
                .result-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .success-icon {
                    font-size: 3rem;
                    color: #28a745;
                    margin-bottom: 1rem;
                }
                .validation-code {
                    font-size: 1.8rem;
                    font-weight: bold;
                    letter-spacing: 2px;
                    color: var(--navy-blue);
                    background: #f8f9fa;
                    padding: 1rem;
                    border-radius: 4px;
                    margin: 1rem 0;
                    font-family: 'Courier New', monospace;
                }
                .result-footer {
                    color: #666;
                    font-size: 0.9rem;
                    margin-top: 1rem;
                }

                @media (max-width: 768px) {
                    .dual-column-section {
                        flex-direction: column;
                    }
                    .two-column-grid {
                        grid-template-columns: 1fr;
                    }
                    .form-wrapper {
                        padding: 1rem;
                    }
                    .elegant-actions {
                        flex-direction: column;
                    }   
                    .elegant-btn {
                        width: 100%;
                    }
                }
                /* Animation for toggle */
                .rotate-icon {
                    transform: rotate(180deg);
                }
                /**********************************/
                .status-badge {
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .badge-warning {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .badge-success {
                    background-color: #d4edda;
                    color: #155724;
                }

                .badge-danger {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .badge-info {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }

                .data-row:hover {
                    background-color: #f8f9fa;
                }
                </style>
            </head>
            <body>
                <script>
                    // Expose nobooking to this popup context so it's not lost inside nested template strings
                    window.NOBOOKING = '` + nobooking + `';
                </script>
                <div class="form-wrapper">
                    <h1 class="form-title">Formulir Validasi PPAT - ` + nobooking + `</h1>
                    
                    <form id="ppatForm" class="validation-form">
                        <input type="hidden" id="nobooking" name="nobooking" value="` + nobooking + `">
                        <!-- Form sections with pre-filled data -->
                        <div class="form-header-decoration">
                            <div class="tax-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 14V20H5V14H2V22H22V14H19Z"/>
                                    <path d="M12 2L22 12H18V17H6V12H2L12 2ZM8 12H16V15H8V12Z"/>
                                </svg>
                            </div>
                        </div>

                        <!-- Data Pemohon -->
                        <div class="dual-column-section">
                            <div class="form-column">
                                <div class="form-section elegant-card">
                                    <div class="section-header-decor">
                                        <h2><i class="fas fa-user-tie"></i> Data Pemohon</h2>
                                    </div>
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-user"></i>
                                                <label for="nama_pemohon">Nama Lengkap Pemohon</label>
                                            </div>
                                            <input type="text" id="nama_pemohon" name="nama_pemohon" 
                                                   class="elegant-input" value="` + (formData.nama_pemohon || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-phone-alt"></i>
                                                <label for="no_telepon">Nomor Telepon/HP</label>
                                            </div>
                                            <input type="tel" id="no_telepon" name="no_telepon" 
                                                   class="elegant-input" value="` + (formData.no_telepon || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <label for="alamat_pemohon">Alamat Pemohon</label>
                                            </div>
                                            <textarea id="alamat_pemohon" name="alamat_pemohon" rows="3" 
                                                      class="elegant-textarea" placeholder="Tolong diisikan" required>` + (formData.alamat_pemohon || '') + `</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Data Wajib Pajak -->
                            <div class="form-column">
                                <div class="form-section elegant-card">
                                    <div class="section-header-decor">
                                        <h2><i class="fas fa-file-invoice-dollar"></i> Data Wajib Pajak</h2>
                                    </div>
                                    <div class="form-grid">
                                        <div class="form-group">    
                                            <div class="label-with-icon">
                                                <i class="fas fa-user"></i>
                                                <label for="nama_wajib_pajak">Nama Wajib Pajak</label>
                                            </div>
                                            <input type="text" id="nama_wajib_pajak" name="nama_wajib_pajak" 
                                                   class="elegant-input" value="` + (formData.nama_wajib_pajak || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-signs"></i>
                                                <label for="kelurahan">Desa/Kelurahan</label>
                                            </div>
                                            <input type="text" id="kelurahan" name="kelurahan" 
                                                   class="elegant-input" value="` + (formData.kelurahan || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-pin"></i>
                                                <label for="kecamatan">Kecamatan</label>
                                            </div>
                                            <input type="text" id="kecamatan" name="kecamatan" 
                                                   class="elegant-input" value="` + (formData.kecamatan || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-city"></i>
                                                <label for="kabupaten_kota">Kabupaten/Kota</label>
                                            </div>
                                            <input type="text" id="kabupaten_kota" name="kabupaten_kota" 
                                                   class="elegant-input" value="` + (formData.kabupaten_kota || '') + `" required readonly>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <label for="alamat_wajib_pajak">Alamat Wajib Pajak</label>
                                            </div>
                                            <textarea id="alamat_wajib_pajak" name="alamat_wajib_pajak" rows="3" 
                                                      class="elegant-textarea" required readonly>` + (formData.alamat_wajib_pajak || '') + `</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Data Properti -->
                        <div class="form-container elegant-section">
                            <div class="form-section-collapsible elegant-card">
                                <div class="section-header" onclick="toggleSection('lokasi-properti')">
                                    <h2><i class="fas fa-building"></i> Lokasi Dan Data Properti</h2>
                                    <span class="toggle-icon" id="icon-lokasi-properti">
                                        <i class="fas fa-chevron-down"></i>
                                    </span>
                                </div>
                                <div class="section-content" id="content-lokasi-properti" style="display:none">
                                    <div class="two-column-grid">
                                        <div class="column">
                                            <div class="form-grid">
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-map-marker-alt"></i>
                                                        <label for="Alamatop">Alamat Objek Pajak</label>
                                                    </div>
                                                    <input type="text" id="Alamatop" name="Alamatop" 
                                                           class="elegant-input" value="` + (formData.Alamatop || '') + `" required readonly>
                                                </div>
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-map-marked-alt"></i>
                                                        <label for="kampungop">Kampung</label>
                                                    </div>
                                                    <input type="text" id="kampungop" name="kampungop" 
                                                           class="elegant-input" placeholder="Tolong diisikan" value="` + (formData.kampungop || '') + `" required>
                                                </div>
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-map-signs"></i>
                                                        <label for="kelurahanop">Kelurahan/Desa</label>
                                                    </div>
                                                    <input type="text" id="kelurahanop" name="kelurahanop" 
                                                           class="elegant-input" placeholder="Tolong diisikan" value="` + (formData.kelurahanop || '') + `" required>
                                                </div>
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-map-pin"></i>
                                                        <label for="kecamatanopj">Kecamatan</label>
                                                    </div>
                                                    <input type="text" id="kecamatanopj" name="kecamatanopj" 
                                                           class="elegant-input" placeholder="Tolong diisikan" value="` + (formData.kecamatanopj || '') + `" required>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="column">
                                            <div class="form-grid">
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-hashtag"></i>
                                                        <label for="nop">Nomor Objek Pajak (NOP)</label>
                                                    </div>
                                                    <input type="text" id="nop" name="nop" 
                                                           class="elegant-input" value="` + (formData.nop || '') + `" readonly>
                                                </div>                    
                                                <div class="form-group">      
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-user-check"></i>
                                                        <label for="atas_nama">Atas Nama (Sertifikat)</label>
                                                    </div>
                                                    <input type="text" id="atas_nama" name="atas_nama" 
                                                           class="elegant-input" value="` + (formData.atas_nama || '') + `" readonly>
                                                </div>
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-vector-square"></i>
                                                        <label for="luas_tanah">Luas Tanah (m²)</label>
                                                    </div>
                                                    <input type="number" id="luas_tanah" name="luas_tanah" min="0" step="0.01" 
                                                           value="` + (formData.luas_tanah || 0) + `" class="elegant-input" readonly>
                                                </div>
                                                <div class="form-group">
                                                    <div class="label-with-icon">
                                                        <i class="fas fa-ruler-combined"></i>
                                                        <label for="luas_bangunan">Luas Bangunan (m²)</label>
                                                    </div>
                                                    <input type="number" id="luas_bangunan" name="luas_bangunan" min="0" step="0.01" 
                                                           value="` + (formData.luas_bangunan || 0) + `" class="elegant-input" readonly>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Keterangan Tambahan -->
                                    <div class="full-width-container">
                                        <div class="form-group full-width">
                                            <div class="label-with-icon">
                                                <i class="fas fa-edit"></i>
                                                <label for="lainnya">Keterangan Tambahan</label>
                                            </div>
                                        <textarea id="lainnya" name="lainnya" rows="3" 
                                                      class="keterangan-textarea elegant-textarea">` + (formData.keterangan || '') + `</textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tanggal Validasi -->
                        <div class="form-section elegant-card">
                            <div class="form-group">
                                <label for="tanggal_validasi">Tanggal Validasi</label>
                                <div class="input-with-icon">
                                    <input type="date" id="tanggal_validasi" name="tanggal_validasi" class="elegant-input" required>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tombol Simpan -->
                        <div class="form-actions elegant-actions" id="saveButtonContainer">
                            <button type="button" class="btn-simpan elegant-btn">
                                <i class="fas fa-save"></i> Simpan Permohonan
                            </button>
                        </div>
                    </form>
                </div>

                <script>
                    console.log('[DEBUG] New window script loaded');
                    
                    // Fungsi untuk toggle section
                    function toggleSection(sectionId) {
                        console.log('[DEBUG] Toggling section: ' + sectionId);
                        const content = document.getElementById('content-' + sectionId);
                        const icon = document.getElementById('icon-' + sectionId);
                        
                        if (content.style.display === 'none') {
                            content.style.display = 'block';
                            icon.innerHTML = '<i class="fas fa-chevron-up"></i>';
                        } else {
                            content.style.display = 'none';
                            icon.innerHTML = '<i class="fas fa-chevron-down"></i>';
                        }
                    }
                </script>
                <script>
                    document.addEventListener('DOMContentLoaded', function() {
                        // Set default date to today
                        const today = new Date().toISOString().split('T')[0];
                        document.getElementById('tanggal_validasi').value = today;
                        
                        // Single event listener for save button
                        document.querySelector('.btn-simpan').addEventListener('click', async function() {
                            try {
                                // Prepare data first
                                const resolvedNoBooking = (typeof window !== 'undefined' && window.NOBOOKING) ? window.NOBOOKING : (document.getElementById('nobooking')?.value || '').trim();

                                if (!resolvedNoBooking) {
                                    throw new Error('NoBooking tidak ditemukan di halaman');
                                }

                                const formData = {
                                    nobooking: resolvedNoBooking,
                                    alamat_pemohon: document.getElementById('alamat_pemohon').value.trim(),
                                    kampungop: document.getElementById('kampungop').value.trim(),
                                    kelurahanop: document.getElementById('kelurahanop').value.trim(),
                                    kecamatanopj: document.getElementById('kecamatanopj').value.trim(),
                                    keterangan: (document.getElementById('lainnya')?.value || '').trim()
                                };
                                
                                // Validate required fields using the same data that will be sent
                                const requiredFields = [
                                    'alamat_pemohon',
                                    'kampungop',
                                    'kelurahanop',
                                    'kecamatanopj'
                                ];
                                
                                const missingFields = requiredFields.filter(field => {
                                    const value = formData[field];
                                    console.log('[VALIDATION] Field ' + field + ': "' + value + '" (length: ' + value.length + ')');
                                    return !value;
                                });
                                
                                if (missingFields.length > 0) {
                                    console.log('[VALIDATION] Missing required fields:', missingFields);
                                    alert('Mohon lengkapi field yang wajib diisi: ' + missingFields.join(', '));
                                    return;
                                }

                                
                                console.log('[SAVE] Form data prepared:', formData);
                                console.log('[SAVE] Field values before trim:', {
                                    alamat_pemohon: document.getElementById('alamat_pemohon').value,
                                    kampungop: document.getElementById('kampungop').value,
                                    kelurahanop: document.getElementById('kelurahanop').value,
                                    kecamatanopj: document.getElementById('kecamatanopj').value
                                });
                                console.log('[SAVE] Field values after trim:', {
                                    alamat_pemohon: formData.alamat_pemohon,
                                    kampungop: formData.kampungop,
                                    kelurahanop: formData.kelurahanop,
                                    kecamatanopj: formData.kecamatanopj
                                });
                                console.log('[SAVE] Field lengths:', {
                                    alamat_pemohon_length: formData.alamat_pemohon.length,
                                    kampungop_length: formData.kampungop.length,
                                    kelurahanop_length: formData.kelurahanop.length,
                                    kecamatanopj_length: formData.kecamatanopj.length
                                });

                                // Show loading state
                                const saveBtn = this;
                                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
                                saveBtn.disabled = true;

                                // Send to server
                                const baseOrigin = (window.opener && !window.opener.closed) ? window.opener.location.origin : window.location.origin;
                                const apiUrl = baseOrigin + '/api/save-ppat-additional-data?nobooking=' + encodeURIComponent(resolvedNoBooking);
                                console.log('[SAVE] nobooking, apiUrl, formData:', { resolvedNoBooking, apiUrl, formData });
                                
                                // Send JSON data
                                const jsonString = JSON.stringify(formData);
                                
                                const response = await fetch(apiUrl, {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: jsonString
                                });

                                const result = await response.json();
                                console.log('[SAVE] Response received:', result);
                                console.log('[SAVE] Response status:', response.status);

                                if (!response.ok || !result.success) {
                                    console.error('[SAVE] Error response:', result);
                                    throw new Error(result.message || 'Gagal menyimpan data');
                                }

                                alert('Data berhasil disimpan!');
                                
                                // Refresh parent window and close this window
                                if (window.opener && !window.opener.closed) {
                                    window.opener.location.reload();
                                }
                                window.close();

                            } catch (error) {
                                console.error('Error:', error);
                                
                                // Reset button state
                                const saveBtn = document.querySelector('.btn-simpan');
                                saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Permohonan';
                                saveBtn.disabled = false;
                                
                                alert('Error: ' + error.message);
                            }
                        });
                    });
                </script>
            </body>
            </html>
        `;
        
        console.log('[DEBUG] HTML content generated, writing to new window');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        console.log('[DEBUG] New window document closed');
        
    } catch (error) {
        console.error('[ERROR] in gotoform:', error);
        const errorMessage = error.message || 'Unknown error occurred';
        console.error('[ERROR] Error details:', error.stack);
        
        const errorWindow = window.open('', '_blank');
        if (errorWindow) {
            errorWindow.document.write(`
                <h1>Error</h1>
                <p><strong>Message:</strong> ${errorMessage}</p>
                <p><strong>Details:</strong> ${error.stack || 'No stack trace available'}</p>
                <p>Please check the console for more details.</p>
            `);
            errorWindow.document.close();
        } else {
            console.error('[ERROR] Failed to open error window');
            alert('Error: ' + errorMessage + '\n\nAlso failed to open error window');
        }
    } finally {
        console.log('[DEBUG] gotoform function completed');
    }
}

// Fungsi untuk generate form HTML dengan data yang sudah diisi
function generateFormHTML(data) {
    return `
        <div class="form-wrapper">
            <h1 class="form-title">Formulir Validasi PPAT</h1>
            
            <form id="ppatForm" class="validation-form">
                <!-- Header Decoration -->
                <div class="form-header-decoration">
                    <div class="tax-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 14V20H5V14H2V22H22V14H19Z"/>
                            <path d="M12 2L22 12H18V17H6V12H2L12 2ZM8 12H16V15H8V12Z"/>
                        </svg>
                    </div>
                </div>

                <!-- Section 1: Dual Column Data -->
                <div class="form-section-container elegant-section">
                    <div class="dual-column-section">
                        <!-- Left Column - Applicant Data -->
                        <div class="form-column">
                            <div class="form-section elegant-card">
                                <div class="section-header-decor">
                                    <h2><i class="fas fa-user-tie"></i> Data Pemohon</h2>
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-user"></i>
                                            <label for="nama_pemohon">Nama Lengkap Pemohon</label>
                                        </div>
                                        <input type="text" id="nama_pemohon" name="nama_pemohon" class="elegant-input" value="` + (data.nama_pemohon || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-phone-alt"></i>
                                            <label for="no_telepon">Nomor Telepon/HP</label>
                                        </div>
                                            <input type="tel" id="no_telepon" name="no_telepon" class="elegant-input" value="` + (data.no_telepon || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <label for="alamat_pemohon">Alamat Pemohon</label>
                                        </div>
                                            <textarea id="alamat_pemohon" name="alamat_pemohon" rows="3" class="elegant-textarea" required>` + (data.alamat_pemohon || '') + `</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Right Column - Taxpayer Data -->
                        <div class="form-column">
                            <div class="form-section elegant-card">
                                <div class="section-header-decor">
                                    <h2><i class="fas fa-file-invoice-dollar"></i> Data Wajib Pajak</h2>
                                </div>
                                <div class="form-grid">
                                    <div class="form-group">    
                                        <div class="label-with-icon">
                                            <i class="fas fa-user"></i>
                                            <label for="nama_wajib_pajak">Nama Wajib Pajak</label>
                                        </div>
                                        <input type="text" id="nama_wajib_pajak" name="nama_wajib_pajak" class="elegant-input" value="` + (data.nama_wajib_pajak || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-map-signs"></i>
                                            <label for="kelurahan">Desa/Kelurahan</label>
                                        </div>
                                            <input type="text" id="kelurahan" name="kelurahan" class="elegant-input" value="` + (data.kelurahan || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-map-pin"></i>
                                            <label for="kecamatan">Kecamatan</label>
                                        </div>
                                        <input type="text" id="kecamatan" name="kecamatan" class="elegant-input" value="` + (data.kecamatan || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-city"></i>
                                            <label for="kabupaten_kota">Kabupaten/Kota</label>
                                        </div>
                                            <input type="text" id="kabupaten_kota" name="kabupaten_kota" class="elegant-input" value="` + (data.kabupaten_kota || '') + `" required>
                                    </div>
                                    <div class="form-group">
                                        <div class="label-with-icon">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <label for="alamat_wajib_pajak">Alamat Wajib Pajak</label>
                                        </div>
                                        <textarea id="alamat_wajib_pajak" name="alamat_wajib_pajak" rows="3" class="elegant-textarea" required>` + (data.alamat_wajib_pajak || '') + `</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>            
                </div>

                <!-- Property Section - Collapsible -->
                <div class="form-container elegant-section">
                    <div class="form-section-collapsible elegant-card">
                        <div class="section-header" onclick="toggleSection('lokasi-properti')">
                            <h2><i class="fas fa-building"></i> Lokasi Dan Data Properti</h2>
                            <span class="toggle-icon" id="icon-lokasi-properti">
                                <i class="fas fa-chevron-down"></i>
                            </span>
                        </div>
                        <div class="section-content" id="content-lokasi-properti" style="display:none">
                            <div class="two-column-grid">
                                <div class="column">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-marker-alt"></i>
                                                <label for="Alamatop">Alamat Objek Pajak</label>
                                            </div>
                                                <input type="text" id="Alamatop" name="Alamatop" class="elegant-input" value="` + (data.Alamatop || '') + `" required>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-marked-alt"></i>
                                                <label for="kampungop">Kampung</label>
                                            </div>
                                                <input type="text" id="kampungop" name="kampungop" class="elegant-input" value="` + (data.kampungop || '') + `" required>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-signs"></i>
                                                <label for="kelurahanop">Kelurahan/Desa</label>
                                            </div>
                                                <input type="text" id="kelurahanop" name="kelurahanop" class="elegant-input" value="` + (data.kelurahanop || '') + `" required>
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-map-pin"></i>
                                                <label for="kecamatan">Kecamatan</label>
                                            </div>
                                            <input type="text" id="kecamatanopj" name="kecamatanopj" class="elegant-input" value="` + (data.kecamatanopj || '') + `" required>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="column">
                                    <div class="form-grid">
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-hashtag"></i>
                                                <label for="nop">Nomor Objek Pajak (NOP)</label>
                                            </div>

                                            <div class="input-with-icon">
                                                <input type="text" id="nop" name="nop" class="elegant-input" value="` + (data.nop || '') + `">
                                            </div>
                                        </div>                    
                                        <div class="form-group">      
                                            <div class="label-with-icon">
                                                <i class="fas fa-user-check"></i>
                                                <label for="atas_nama">Atas Nama (Sertifikat)</label>
                                            </div>
                                                <input type="text" id="atas_nama" name="atas_nama" class="elegant-input" value="` + (data.atas_nama || '') + `">
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-vector-square"></i>
                                                <label for="luas_tanah">Luas Tanah (m²)</label>
                                            </div>
                                                <input type="number" id="luas_tanah" name="luas_tanah" min="0" step="0.01" value="` + (data.luas_tanah || 0) + `" class="elegant-input">
                                        </div>
                                        <div class="form-group">
                                            <div class="label-with-icon">
                                                <i class="fas fa-ruler-combined"></i>
                                                <label for="luas_bangunan">Luas Bangunan (m²)</label>
                                            </div>
                                                <input type="number" id="luas_bangunan" name="luas_bangunan" min="0" step="0.01" value="` + (data.luas_bangunan || 0) + `" class="elegant-input">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Additional Notes Textarea -->
                            <div class="full-width-container">
                                <div class="form-group full-width">
                                    <div class="label-with-icon">
                                        <i class="fas fa-edit"></i>
                                        <label for="lainnya">Keterangan Tambahan</label>
                                    </div>
                                        <textarea id="lainnya" name="lainnya" rows="3" class="keterangan-textarea elegant-textarea">` + (data.keterangan || '') + `</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Validation Date Section -->
                <div class="form-section elegant-card">
                    <div class="form-group">
                        <label for="tanggal_validasi">Tanggal Validasi</label>
                        <div class="input-with-icon">
                            <input type="date" id="tanggal_validasi" name="tanggal_validasi" class="elegant-input" required>
                        </div>
                    </div>
                </div>
                <!-- Save Button (hidden initially) -->
                <div class="form-actions elegant-actions" id="saveButtonContainer">
                    <button type="button" class="btn-simpan elegant-btn">
                        <i class="fas fa-save"></i> Simpan Permohonan
                    </button>
                </div>
            </form>
        </div>
    `;
}

async function fetchDataFromDatabase(nobooking, userInput = {}) {
    try {
const response = await fetch(`/api/ppat/booking/${nobooking}`, {
            credentials: 'include' // Untuk mengirim session cookie jika diperlukan
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
            throw new Error('Data booking tidak ditemukan');
        }

        const bookingData = result.data;

        // Gabungkan dengan input manual user
        return {
            ...bookingData, // Data dari database
            alamat_pemohon: userInput.alamat_pemohon || '',
            kampungop: userInput.kampungop || '',
            kelurahanop: userInput.kelurahanop || '',
            kecamatanopj: userInput.kecamatanopj || ''
        };
    } catch (error) {
        console.error('Error fetching booking data:', error);
        throw error;
    }
}

// Fungsi untuk button View (jika diperlukan)
function clickform() {
    alert('Fungsi view form akan diimplementasikan di sini');
    // Tambahkan logika untuk view form di sini
}

// Validasi dokumen
function validateDocument(file) {
    console.log('Validating document:', { name: file?.name, size: file?.size, type: file?.type });
    
    if (!file) {
        console.log('File is null or undefined');
        showAlert('error', 'File tidak ditemukan!');
        return false;
    }
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    console.log('File validation:', {
        type: file.type,
        isValidType: validTypes.includes(file.type),
        size: file.size,
        maxSize: maxSize,
        isValidSize: file.size <= maxSize
    });
    
    if (!validTypes.includes(file.type)) {
        console.log('Invalid file type:', file.type);
        showAlert('error', 'Format file tidak didukung. Gunakan PDF, JPG, atau PNG!');
        return false;
    }
    
    if (file.size > maxSize) {
        console.log('File too large:', file.size, '>', maxSize);
        showAlert('error', 'Ukuran file terlalu besar. Maksimal 5MB!');
        return false;
    }
    
    console.log('Document validation passed');
    return true;
}

// Setup preview dokumen
function setupDocumentPreview(inputId, previewContainerId, previewImageId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewContainerId);
    const previewImage = document.getElementById(previewImageId);
    
    if (!input || !previewContainer || !previewImage) {
        console.error('Document preview elements not found:', { inputId, previewContainerId, previewImageId });
        return;
    }
    
    const clearBtn = previewContainer.querySelector('.clear-btn');
    
    // Hapus event listener lama
    input.removeEventListener('change', handleDocFileChange);
    if (clearBtn) {
        clearBtn.removeEventListener('click', handleDocClear);
    }
    
    // Tambahkan event listener baru
    input.addEventListener('change', handleDocFileChange);
    if (clearBtn) {
        clearBtn.addEventListener('click', handleDocClear);
    }
    
    function handleDocFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!validateDocument(file)) {
            input.value = '';
            return;
        }
        
        // Tampilkan preview untuk gambar
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewContainer.style.display = 'block';
            };
            reader.onerror = () => {
                showAlert('error', 'Gagal membaca file!');
                input.value = '';
            };
            reader.readAsDataURL(file);
        } else {
            // Untuk PDF, tampilkan nama file
            previewImage.src = '';
            previewContainer.style.display = 'block';
            const fileName = document.createElement('div');
            fileName.textContent = file.name;
            fileName.style.cssText = 'padding: 10px; background: #f8f9fa; border-radius: 4px; margin: 5px 0;';
            previewContainer.appendChild(fileName);
        }
    }
    
    function handleDocClear() {
        input.value = '';
        previewContainer.style.display = 'none';
        // Hapus elemen tambahan yang dibuat untuk PDF
        const additionalElements = previewContainer.querySelectorAll('div');
        additionalElements.forEach(el => {
            if (el !== clearBtn.parentNode) {
                el.remove();
            }
        });
    }
}

// Upload dokumen ke Railway storage
async function uploadDocuments(doc1, doc2, bookingId = null) {
    try {
        console.log('Menyiapkan data dokumen untuk upload ke Railway storage...');
        
        // Railway storage is always available (local filesystem)
        console.log('✅ Railway storage is ready for upload');
        
        const formData = new FormData();
        
        if (doc1) {
            formData.append('document1', doc1);
            console.log('Document1 added:', doc1.name, doc1.size, doc1.type);
        }
        
        if (doc2) {
            formData.append('document2', doc2);
            console.log('Document2 added:', doc2.name, doc2.size, doc2.type);
        }
        
        // Add booking_id if provided
        if (bookingId) {
            formData.append('nobooking', bookingId);
            console.log('Booking ID added:', bookingId);
        }
        
        console.log('Mengirim request dokumen ke Railway storage...');
        
const response = await fetch('/api/ppat/upload-documents', {
            method: 'POST',
            credentials: 'include',
            body: formData,
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            let errorMessage = data.message || 'Gagal mengupload dokumen';
            
            // Handle specific error codes
            if (data.error_code === 'MISSING_REQUIRED_DOCUMENT') {
                errorMessage = 'Dokumen wajib harus diupload';
            } else if (data.error_code === 'USER_NOT_FOUND') {
                errorMessage = 'Data user tidak ditemukan. Silakan login ulang.';
            } else if (data.error_code === 'DATABASE_ERROR') {
                errorMessage = 'Error database. Silakan coba lagi.';
            } else if (data.error_code === 'STORAGE_ERROR') {
                errorMessage = 'Error storage service. Silakan coba lagi.';
            } else if (response.status === 413) {
                errorMessage = 'File terlalu besar. Maksimal 5MB per file.';
            } else if (response.status === 415) {
                errorMessage = 'Format file tidak didukung. Gunakan PDF, JPG, atau PNG.';
            }
            
            throw new Error(errorMessage);
        }
        
        showAlert('success', 'Dokumen berhasil diupload!');
        
        // Log cleanup results if available
        if (data.cleanup_status) {
            console.log('🧹 Cleanup results:', data.cleanup_status);
        }
        
        closeDocModal();
        
        // Refresh table data to show uploaded documents
        if (typeof loadTableData === 'function') {
            loadTableData();
        }
        
        return data;
    } catch (error) {
        console.error('Document Upload Error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showAlert('error', 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else if (error.message.includes('service tidak tersedia')) {
            showAlert('error', 'Storage service tidak tersedia. Silakan coba lagi nanti.');
        } else {
            showAlert('error', error.message || 'Terjadi kesalahan saat mengupload dokumen');
        }
        
        throw error;
    }
}

// Function to load uploaded documents for a specific booking
async function loadUploadedDocuments(bookingId) {
    try {
        console.log(`🔍 [LOAD-DOCUMENTS] Loading documents for booking: ${bookingId}`);
        
const response = await fetch(`/api/ppat/get-documents?nobooking=${bookingId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        console.log(`🔍 [LOAD-DOCUMENTS] Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`🔍 [LOAD-DOCUMENTS] Response data:`, data);
        
        if (data.success && data.data) {
            console.log(`✅ [LOAD-DOCUMENTS] Documents loaded successfully:`, {
                aktaTanah: data.data.aktaTanah ? 'Present' : 'Null',
                sertifikatTanah: data.data.sertifikatTanah ? 'Present' : 'Null',
                pelengkap: data.data.pelengkap ? 'Present' : 'Null'
            });
            return data.data;
        }
        
        console.log(`⚠️ [LOAD-DOCUMENTS] No documents found or data is null`);
        return null;
    } catch (error) {
        console.error('Error loading uploaded documents:', error);
        return null;
    }
}

// Function to display uploaded documents in the table
function displayUploadedDocuments(bookingId, documentData) {
    const documentSection = document.getElementById(`document-${bookingId}`);
    if (!documentSection) return;
    
    console.log('📝 [DISPLAY-DOCUMENTS] Received document data:', documentData);
    
    // Create uploaded documents display
    let uploadedDocsHTML = `
        <div class="uploaded-documents-section">
            <h5>Dokumen yang Sudah Diupload</h5>
            <div class="uploaded-docs-grid">
    `;
    
    // Check for aktaTanah document
    if (documentData.aktaTanah) {
        uploadedDocsHTML += `
            <div class="uploaded-doc-item">
                <div class="doc-info">
                    <i class="fas fa-file-pdf doc-icon"></i>
                    <span class="doc-name">Akta Tanah - ${documentData.aktaTanah.fileName || 'Document'}</span>
                </div>
                <div class="doc-actions">
                    <button onclick="smartPreviewDocument('${documentData.aktaTanah.fileUrl}', 'Akta Tanah')" class="btn-view-doc">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="btn-replace-doc" onclick="replaceUploadedDocument('${bookingId}', 'akta_tanah')">
                        <i class="fas fa-sync-alt"></i> Ganti
                    </button>
                </div>
            </div>
        `;
    }
    
    // Check for sertifikatTanah document
    if (documentData.sertifikatTanah) {
        uploadedDocsHTML += `
            <div class="uploaded-doc-item">
                <div class="doc-info">
                    <i class="fas fa-file-pdf doc-icon"></i>
                    <span class="doc-name">Sertifikat Tanah - ${documentData.sertifikatTanah.fileName || 'Document'}</span>
                </div>
                <div class="doc-actions">
                    <button onclick="smartPreviewDocument('${documentData.sertifikatTanah.fileUrl}', 'Sertifikat Tanah')" class="btn-view-doc">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="btn-replace-doc" onclick="replaceUploadedDocument('${bookingId}', 'sertifikat_tanah')">
                        <i class="fas fa-sync-alt"></i> Ganti
                    </button>
                </div>
            </div>
        `;
    }
    
    // Check for pelengkap document
    if (documentData.pelengkap) {
        uploadedDocsHTML += `
            <div class="uploaded-doc-item">
                <div class="doc-info">
                    <i class="fas fa-file-pdf doc-icon"></i>
                    <span class="doc-name">Dokumen Pelengkap - ${documentData.pelengkap.fileName || 'Document'}</span>
                </div>
                <div class="doc-actions">
                    <button onclick="smartPreviewDocument('${documentData.pelengkap.fileUrl}', 'Dokumen Pelengkap')" class="btn-view-doc">
                        <i class="fas fa-eye"></i> Lihat
                    </button>
                    <button class="btn-replace-doc" onclick="replaceUploadedDocument('${bookingId}', 'pelengkap')">
                        <i class="fas fa-sync-alt"></i> Ganti
                    </button>
                </div>
            </div>
        `;
    }
    
    
    uploadedDocsHTML += `
            </div>
        </div>
    `;
    
    // Insert uploaded documents section at the beginning
    documentSection.insertAdjacentHTML('afterbegin', uploadedDocsHTML);
}

// Function to preview documents using proxy to avoid sandbox issues
async function previewDocument(fileUrl, documentName) {
    console.log('🔍 [PREVIEW] Opening document:', { fileUrl, documentName });
    
    // Use getFileUrl() to properly handle Railway storage paths
    const processedUrl = getFileUrl(fileUrl);
    console.log('🔍 [PREVIEW] Processed URL:', processedUrl);
    
    // Check if it's a Railway storage URL (relative path)
if (processedUrl.includes('/api/ppat/file-proxy')) {
        // Use Railway storage proxy endpoint
        console.log('🔍 [PREVIEW] Using Railway proxy URL:', processedUrl);
        
        // Open in new window with proper iframe sandbox attributes
        const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Preview: ${documentName}</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                        .header { background: #f8f9fa; padding: 10px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
                        .header h3 { margin: 0; color: #495057; }
                        .header .actions { display: flex; gap: 10px; }
                        .header button { background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; }
                        .header button:hover { background: #0056b3; }
                        .content { height: calc(100vh - 60px); }
                        iframe { width: 100%; height: 100%; border: none; }
                        .error { padding: 20px; text-align: center; color: #dc3545; }
                        .loading { padding: 20px; text-align: center; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h3>Preview: ${documentName}</h3>
                        <div class="actions">
                            <button onclick="window.open('${fileUrl}', '_blank')">Buka Langsung</button>
                            <button onclick="window.close()">Tutup</button>
                        </div>
                    </div>
                    <div class="content">
                        <div class="loading" id="loading">
                            <i class="fas fa-spinner fa-spin"></i> Memuat dokumen...
                        </div>
                        <iframe src="${processedUrl}" 
                                title="Document Preview"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
                                style="display: none;"
                                onload="document.getElementById('loading').style.display='none'; this.style.display='block'; console.log('Document loaded successfully');"
                                onerror="document.getElementById('loading').style.display='none'; document.getElementById('error').style.display='block'; console.error('Document failed to load');">
                        </iframe>
                        <div class="error" id="error" style="display:none;">
                            <h4>Dokumen tidak dapat dimuat</h4>
                            <p>Silakan coba lagi atau hubungi administrator.</p>
                            <div style="margin-top: 10px;">
                                <button onclick="window.location.reload()" style="margin-right: 10px; background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Coba Lagi</button>
                                <button onclick="window.open('${processedUrl}', '_blank')" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Buka Langsung</button>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `);
            newWindow.document.close();
        } else {
            // Fallback: direct link
            window.open(processedUrl, '_blank');
        }
    } else {
        // For other URLs (HTTP/HTTPS), open directly
        window.open(processedUrl, '_blank');
    }
}

// Helper function to extract booking ID from current context
function getCurrentBookingId() {
    // Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('nobooking');
    if (bookingId) return bookingId;
    
    // Try to get from selected row in table
    const selectedRow = document.querySelector('#badanUsahaTable tbody tr.selected');
    if (selectedRow) {
        return selectedRow.dataset.nobooking;
    }
    
    // Try to get from active document section
    const activeSection = document.querySelector('.document-section.active');
    if (activeSection) {
        return activeSection.id.replace('document-', '');
    }
    
    // Try to get from any document section
    const documentSection = document.querySelector('.document-section');
    if (documentSection) {
        return documentSection.id.replace('document-', '');
    }
    
    // Try to get from table rows
    const tableRows = document.querySelectorAll('#badanUsahaTable tbody tr');
    if (tableRows.length > 0) {
        // Get the first row with nobooking data
        for (const row of tableRows) {
            if (row.dataset.nobooking) {
                return row.dataset.nobooking;
            }
        }
    }
    
    // Fallback: try to extract from file URL if it contains booking info
    // This is a last resort and may not always work
    console.warn('⚠️ [HELPER] Could not determine booking ID from context, using fallback');
    return '20011-2025-000001'; // Default fallback for testing
}

// Helper function to extract document type from file URL
function getDocumentTypeFromUrl(fileUrl, documentName = null) {
    if (!fileUrl) return null;
    
    // Extract file ID from URL
    const fileIdMatch = fileUrl.match(/([a-f0-9-]{36})/);
    if (!fileIdMatch) return null;
    
    const fileId = fileIdMatch[1];
    
    // First priority: use documentName if provided
    if (documentName) {
        const name = documentName.toLowerCase();
        if (name.includes('akta')) return 'akta_tanah';
        if (name.includes('sertifikat')) return 'sertifikat_tanah';
        if (name.includes('pelengkap')) return 'pelengkap';
        if (name.includes('pdf dokumen')) return 'pdf_dokumen';
        if (name.includes('stempel')) return 'file_withstempel';
    }
    
    // Try to determine document type from current context
    // Check which document section is active or which button was clicked
    const activeSection = document.querySelector('.document-section.active');
    if (activeSection) {
        const sectionId = activeSection.id;
        if (sectionId.includes('akta')) return 'akta_tanah';
        if (sectionId.includes('sertifikat')) return 'sertifikat_tanah';
        if (sectionId.includes('pelengkap')) return 'pelengkap';
    }
    
    // Try to determine from any document section
    const documentSection = document.querySelector('.document-section');
    if (documentSection) {
        const sectionId = documentSection.id;
        if (sectionId.includes('akta')) return 'akta_tanah';
        if (sectionId.includes('sertifikat')) return 'sertifikat_tanah';
        if (sectionId.includes('pelengkap')) return 'pelengkap';
    }
    
    // Fallback: try to determine from button context
    const clickedButton = document.activeElement;
    if (clickedButton) {
        const buttonText = clickedButton.textContent.toLowerCase();
        if (buttonText.includes('akta')) return 'akta_tanah';
        if (buttonText.includes('sertifikat')) return 'sertifikat_tanah';
        if (buttonText.includes('pelengkap')) return 'pelengkap';
    }
    
    // Try to determine from button onclick attribute
    const buttons = document.querySelectorAll('button[onclick*="smartPreviewDocument"]');
    for (const button of buttons) {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
            if (onclickAttr.includes('Akta Tanah')) return 'akta_tanah';
            if (onclickAttr.includes('Sertifikat Tanah')) return 'sertifikat_tanah';
            if (onclickAttr.includes('Dokumen Pelengkap')) return 'pelengkap';
        }
    }
    
    // Last resort: try to determine from document name in the onclick
    // This is a fallback and may not always work
    console.warn('⚠️ [HELPER] Could not determine document type from context, using fallback');
    return 'pelengkap'; // Default fallback for testing
}

// Function to test proxy endpoint - ROBUST VERSION with RETRY MECHANISM
async function testProxyEndpoint(fileUrl, maxAttempts = 3) {
    try {
        // Extract file ID from URL for more efficient testing
        const fileIdMatch = fileUrl.match(/([a-f0-9-]{36})/);
        const fileId = fileIdMatch ? fileIdMatch[1] : null;
        
        // Use Railway storage proxy endpoint
const relativePath = fileUrl.replace('/storage/ppat/', '');
const proxyUrl = `/api/ppat/file-proxy?relativePath=${encodeURIComponent(relativePath)}`;
            
        console.log('🧪 [TEST-PROXY] Testing:', proxyUrl);
        
        let attempts = 0;
        let lastError = null;
        
        // Retry mechanism dengan maksimal 3 attempts
        while (attempts < maxAttempts) {
            try {
                attempts++;
                console.log(`🔄 [TEST-PROXY] Attempt ${attempts}/${maxAttempts}: ${proxyUrl}`);
                
                const response = await fetch(proxyUrl, {
                    method: 'HEAD', // Use HEAD request for efficiency
                    credentials: 'include',
                    timeout: 10000
                });
                
                console.log(`🧪 [TEST-PROXY] Response status: ${response.status}`);
                
                // Success cases
                if (response.status === 200) {
                    console.log(`✅ [TEST-PROXY] Success on attempt ${attempts}`);
                    return true;
                }
                
                // Consider 404 as "working" (file not found, but proxy is working)
                if (response.status === 404) {
                    console.log('🧪 [TEST-PROXY] File not found (404) - proxy working but file missing');
                    return true; // Proxy is working, file just doesn't exist
                }
                
                // For other status codes, try again
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ [TEST-PROXY] Attempt ${attempts} failed: ${error.message}`);
            }
            
            // If not the last attempt, wait before retry
            if (attempts < maxAttempts) {
                console.log(`⏳ [TEST-PROXY] Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // All attempts failed
        console.error(`❌ [TEST-PROXY] All attempts failed after ${attempts} tries: ${lastError?.message}`);
        return false;
        
    } catch (error) {
        console.error('❌ [TEST-PROXY] Error:', error);
        return false;
    }
}

// Function to find alternative file ID if current one is invalid
async function findAlternativeFileId(bookingId, documentType) {
    try {
        console.log(`🔍 [FIND-ALTERNATIVE] Looking for alternative file ID for ${documentType} in booking ${bookingId}`);
        
        // First, try to get latest file info from database
const response = await fetch(`/api/ppat/get-documents?nobooking=${bookingId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch documents: ${response.status}`);
        }
        
        const data = await response.json();
        
        
        if (data.success && data.data) {
            // Map document types to data structure
            const documentMap = {
                'akta_tanah': data.data.aktaTanah,
                'sertifikat_tanah': data.data.sertifikatTanah,
                'pelengkap': data.data.pelengkap
            };
            
            const documentData = documentMap[documentType];
            
            if (documentData && documentData.fileId) {
                console.log(`🔍 [FIND-ALTERNATIVE] Found file ID in database: ${documentData.fileId}`);
                
                // Test if this file ID is valid
                const testUrl = `https://44renul14z.ucarecd.net/${documentData.fileId}`;
                const isValid = await testProxyEndpoint(testUrl);
                
                if (isValid) {
                    console.log(`✅ [FIND-ALTERNATIVE] File ID is valid: ${documentData.fileId}`);
                    return {
                        fileId: documentData.fileId,
                        fileUrl: documentData.fileUrl,
                        source: 'database'
                    };
                } else {
                    console.log(`❌ [FIND-ALTERNATIVE] File ID in database is also invalid: ${documentData.fileId}`);
                }
            }
        }
        
        // If database file ID is also invalid, no alternative available for Railway storage
        console.log(`🔍 [FIND-ALTERNATIVE] No alternative files available for Railway storage...`);
        
        // Railway storage doesn't have file versioning, so no alternatives
        console.warn(`⚠️ [FIND-ALTERNATIVE] No valid alternative file found for ${documentType}`);
        return null;
        
    } catch (error) {
        console.error('❌ [FIND-ALTERNATIVE] Error finding alternative file ID:', error);
        return null;
    }
}

// Function to update database with new file ID
async function updateDatabaseWithNewFileId(bookingId, documentType, newFileId, newFileUrl) {
    try {
        console.log(`🔄 [UPDATE-DB] Updating database with new file ID for ${documentType}: ${newFileId}`);
        
const response = await fetch('/api/ppat/update-file-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                nobooking: bookingId,
                documentType: documentType,
                fileId: newFileId,
                fileUrl: newFileUrl
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update database: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ [UPDATE-DB] Database updated successfully for ${documentType}`);
            return true;
        } else {
            console.error(`❌ [UPDATE-DB] Database update failed: ${result.message}`);
            return false;
        }
        
    } catch (error) {
        console.error('❌ [UPDATE-DB] Error updating database:', error);
        return false;
    }
}

// Smart preview function with auto-sync mechanism
async function smartPreviewDocument(fileUrl, documentName) {
    try {
        console.log('🧠 [SMART-PREVIEW] Starting smart preview:', { fileUrl, documentName });
        
        // Extract context information
        const bookingId = getCurrentBookingId();
        const documentType = getDocumentTypeFromUrl(fileUrl, documentName);
        
        if (!bookingId || !documentType) {
            console.warn('⚠️ [SMART-PREVIEW] Missing context information, falling back to regular preview');
            return await previewDocument(fileUrl, documentName);
        }
        
        console.log('🧠 [SMART-PREVIEW] Context:', { bookingId, documentType });
        
        // Test current file ID
        const proxyWorking = await testProxyEndpoint(fileUrl);
        
        if (proxyWorking) {
            console.log('✅ [SMART-PREVIEW] Current file ID is valid, proceeding with preview');
            return await previewDocument(fileUrl, documentName);
        } else {
            console.log('🔄 [SMART-PREVIEW] Current file ID is invalid, searching for alternative...');
            
            // Find alternative file ID
            const alternativeFile = await findAlternativeFileId(bookingId, documentType);
            
            if (alternativeFile) {
                console.log('✅ [SMART-PREVIEW] Found alternative file:', alternativeFile);
                
                // Update database with new file ID
                const updateSuccess = await updateDatabaseWithNewFileId(
                    bookingId, 
                    documentType, 
                    alternativeFile.fileId, 
                    alternativeFile.fileUrl
                );
                
                if (updateSuccess) {
                    console.log('✅ [SMART-PREVIEW] Database updated, previewing with new file ID');
                    return await previewDocument(alternativeFile.fileUrl, documentName);
                } else {
                    console.warn('⚠️ [SMART-PREVIEW] Database update failed, previewing with alternative file anyway');
                    return await previewDocument(alternativeFile.fileUrl, documentName);
                }
            } else {
                console.error('❌ [SMART-PREVIEW] No alternative file found');
                
                // Show user-friendly error message
                const errorMessage = `
                    <div style="padding: 20px; text-align: center; color: #dc3545;">
                        <h4>Dokumen tidak dapat dimuat</h4>
                        <p>File ${documentName} tidak ditemukan di storage.</p>
                        <p>Silakan upload ulang dokumen ini.</p>
                        <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                            Tutup
                        </button>
                    </div>
                `;
                
                const newWindow = window.open('', '_blank', 'width=600,height=400');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Error - ${documentName}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                            </style>
                        </head>
                        <body>
                            ${errorMessage}
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                }
                
                return false;
            }
        }
        
    } catch (error) {
        console.error('❌ [SMART-PREVIEW] Smart preview failed:', error);
        
        // Fallback to regular preview
        console.log('🔄 [SMART-PREVIEW] Falling back to regular preview');
        return await previewDocument(fileUrl, documentName);
    }
}

// Function to populate booking dropdown
async function populateBookingDropdown() {
    try {
        const bookingSelect = document.getElementById('bookingSelect');
        if (!bookingSelect) return;
        
        // Get booking data from the current table
        const tableRows = document.querySelectorAll('#badanUsahaTable tbody tr');
        const bookings = [];
        
        tableRows.forEach(row => {
            const cells = row.cells;
            if (cells.length >= 1) {
                const bookingId = cells[0].textContent.trim();
                if (bookingId && bookingId !== 'Memuat data...') {
                    bookings.push({
                        id: bookingId,
                        name: `Booking ${bookingId}`
                    });
                }
            }
        });
        
        // Clear existing options
        bookingSelect.innerHTML = '<option value="">-- Pilih Booking (Opsional) --</option>';
        
        // Add booking options
        bookings.forEach(booking => {
            const option = document.createElement('option');
            option.value = booking.id;
            option.textContent = booking.name;
            bookingSelect.appendChild(option);
        });
        
        console.log('Booking dropdown populated with', bookings.length, 'options');
    } catch (error) {
        console.error('Error populating booking dropdown:', error);
    }
}

// Function to replace uploaded document
async function replaceUploadedDocument(bookingId, documentType) {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!validateDocument(file)) {
                return;
            }
            
            showAlert('info', 'Mengupload dokumen baru...');
            
            const formData = new FormData();
            // Map documentType to correct field name for multer
            const fieldName = documentType === 'akta_tanah' ? 'aktaTanah' : 
                             documentType === 'sertifikat_tanah' ? 'sertifikatTanah' : 
                             documentType === 'pelengkap' ? 'pelengkap' : documentType;
            formData.append(fieldName, file);
            formData.append('nobooking', bookingId);
            
            console.log('📤 [FRONTEND] Sending FormData:', {
                file: file.name,
                fieldName: fieldName,
                documentType: documentType,
                bookingId: bookingId
            });
            
const response = await fetch('/api/ppat/upload-documents', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            console.log('📤 [FRONTEND] Response status:', response.status);
            console.log('📤 [FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('📤 [FRONTEND] Response data:', data);
            
            if (data.success) {
                showAlert('success', 'Dokumen berhasil diperbarui!');
                // Refresh the document display
                const newDocData = await loadUploadedDocuments(bookingId);
                if (newDocData) {
                    // Remove old display and show new one
                    const uploadedSection = document.querySelector(`#document-${bookingId} .uploaded-documents-section`);
                    if (uploadedSection) {
                        uploadedSection.remove();
                    }
                    displayUploadedDocuments(bookingId, newDocData);
                }
            } else {
                showAlert('error', data.message || 'Gagal memperbarui dokumen');
            }
        };
        
        input.click();
    } catch (error) {
        console.error('Error replacing document:', error);
        showAlert('error', 'Terjadi kesalahan saat mengganti dokumen');
    }
}

// Close modal dokumen
function closeDocModal() {
    const modal = document.getElementById('documentUploadModal');
    if (modal) {
        modal.style.display = 'none';
        resetDocumentForm();
    }
}

// Reset form dokumen
function resetDocumentForm() {
    const doc1 = document.getElementById('document1');
    const doc2 = document.getElementById('document2');
    const preview1 = document.getElementById('docPreview1');
    const preview2 = document.getElementById('docPreview2');
    
    if (doc1) doc1.value = '';
    if (doc2) doc2.value = '';
    if (preview1) preview1.style.display = 'none';
    if (preview2) preview2.style.display = 'none';
}

// Toggle loading dokumen
function toggleDocLoading(show) {
    const btn = document.getElementById('uploadDocs');
    const loadingIndicator = document.getElementById('docModalLoadingIndicator');
    
    if (btn) {
        btn.disabled = show;
    }
    
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'inline-block' : 'none';
    }
}

// Function to update upload area display when file is selected
function updateUploadAreaDisplay(input, file, nobooking) {
    const fieldName = input.id.replace(`Input-${nobooking}`, '');
    const container = document.getElementById(`${fieldName}Container-${nobooking}`);
    if (!container) return;

    // Find the label element
    const label = container.querySelector('.file-upload-label');
    if (!label) return;

    // Create or update the file info display
    let fileInfoDisplay = container.querySelector('.selected-file-info');
    if (!fileInfoDisplay) {
        fileInfoDisplay = document.createElement('div');
        fileInfoDisplay.className = 'selected-file-info';
        label.appendChild(fileInfoDisplay);
    }

    if (file.type === 'application/pdf') {
            fileInfoDisplay.innerHTML = `
                <div class="file-preview-item">
                    <div class="file-content">
                        <i class="fas fa-file-pdf pdf-icon"></i>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">(${(file.size/1024/1024).toFixed(2)} MB)</span>
                        </div>
                    </div>
                    <button class="btn-remove" onclick="removeSelectedFile('${input.id}')" aria-label="Hapus file">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
    } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
                reader.onload = (e) => {
                    fileInfoDisplay.innerHTML = `
                        <div class="file-preview-item">
                            <div class="file-content">
                                <img src="${e.target.result}" class="file-thumbnail" alt="Preview ${file.name}">
                                <div class="file-info">
                                    <span class="file-name">${file.name}</span>
                                    <span class="file-size">(${(file.size/1024/1024).toFixed(2)} MB)</span>
                                </div>
                            </div>
                            <button class="btn-remove" onclick="removeSelectedFile('${input.id}')" aria-label="Hapus file">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                };
        reader.readAsDataURL(file);
    }

    // Hide the original upload wrapper
    const uploadWrapper = label.querySelector('.file-input-wrapper');
    if (uploadWrapper) {
        uploadWrapper.classList.add('hidden');
    }
}

// Function to remove selected file
function removeSelectedFile(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = '';
        
        const nobooking = inputId.split('-').pop();
        const fieldName = inputId.replace(`Input-${nobooking}`, '');
        const container = document.getElementById(`${fieldName}Container-${nobooking}`);
        if (container) {
            const fileInfoDisplay = container.querySelector('.selected-file-info');
            if (fileInfoDisplay) {
                fileInfoDisplay.remove();
            }
            
            const uploadWrapper = container.querySelector('.file-input-wrapper');
            if (uploadWrapper) {
                uploadWrapper.classList.remove('hidden');
            }
            
            const preview = container.querySelector('.file-preview');
            if (preview) {
                preview.innerHTML = '';
            }
        }
    }
}

function setupFileRemoval(input, previewElement) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
    removeBtn.setAttribute('aria-label', 'Hapus file');
    removeBtn.onclick = () => {
        input.value = '';
        previewElement.innerHTML = '';
        
        // Clear upload area display and show upload button again
        const nobooking = input.id.split('-').pop();
        const fieldName = input.id.replace(`Input-${nobooking}`, '');
        const container = document.getElementById(`${fieldName}Container-${nobooking}`);
        if (container) {
            const fileInfoDisplay = container.querySelector('.selected-file-info');
            if (fileInfoDisplay) {
                fileInfoDisplay.remove();
            }
            
            const uploadWrapper = container.querySelector('.file-input-wrapper');
            if (uploadWrapper) {
                uploadWrapper.classList.remove('hidden');
            }
        }
    };

    previewElement.querySelector('.file-preview-item')?.appendChild(removeBtn);
}