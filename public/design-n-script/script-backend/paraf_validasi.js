// Constants
const API_ENDPOINT = '/api/paraf/get-berkas-pending'; // API baru untuk dokumen status "Menunggu"
const API_MONITORING_ENDPOINT = '/api/paraf/get-monitoring-documents'; // API untuk monitoring dokumen "Ditolak" dan "Sudah Divalidasi"
const REQUEST_TIMEOUT = 10000;
const REQUIRED_FIELDS = [
    // Kolom yang ditampilkan pada tabel PV (ringkas)
    'no_validasi', 'no_registrasi', 'nobooking', 'tahunajb',
    'status_display', 'pembuat_gelar'
];

// State
let selectedNoBooking = null;

// Main Function
async function loadTableDataParafValidasi() {
    try {
        await validateUserAccess();
        console.debug('[PV][FE] fetchData:start');
        const response = await fetchData();
        const data = response.data || [];
        console.debug('[PV][FE] fetchData:done', { count: Array.isArray(data) ? data.length : null });
        
        // Handle empty data case
        if (data.length === 0) {
            console.log('[PV][FE] No data found - showing empty state');
            const tbody = document.querySelector('.data-masuk');
            if (tbody) {
                clearTableBody(tbody);
                showEmptyState(tbody, 'Tidak ada data "Menunggu" saat ini yang masuk');
            }
            return;
        }
        
        const mapped = Array.isArray(data) ? data.map((r,i)=>{ try{ const m=transformOldEndpointRow(r); return m; }catch(e){ console.warn('[PV][FE] transform error at', i, e?.message); throw e;} }) : [];
        console.debug('[PV][FE] map:done', { count: mapped.length });
        renderTable(mapped);
        try { if (typeof setupPVPagination === 'function') setupPVPagination(); } catch(_) {}
        console.debug('[PV][FE] renderTable:done');
    } catch (error) {
        console.error('[PV][FE] loadTableDataParafValidasi:error', error);
        handleMainError(error);
    }
}

// Helper Functions
async function validateUserAccess() {
    const userDivisi = getUserDivisi();
    
    if (typeof userDivisi !== 'string') {
        throw new Error('Invalid user division data');
    }
    
    if (userDivisi !== 'Peneliti Validasi') {
        throw new Error('Anda tidak memiliki akses ke data Peneliti Validasi');
    }
}

async function fetchData() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
        const response = await fetch(API_ENDPOINT, {
            signal: controller.signal,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            console.warn('[PV][FE] API_ENDPOINT not ok', { status: response.status, errorData });
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.debug('[PV][FE] API_ENDPOINT json', { success: responseData?.success, hasData: Array.isArray(responseData?.data) });
        
        if (!responseData?.success) {
            throw new Error(responseData.message || 'Server returned unsuccessful response');
        }

        if (!Array.isArray(responseData.data)) {
            throw new Error('Expected array data not found in response');
        }

        // Handle empty data case - return empty array instead of throwing error
        if (responseData.data.length === 0) {
            console.log('[PV][FE] No data found - returning empty array');
            return { success: true, data: [] };
        }

        return responseData;
    } catch (error) {
        clearTimeout(timeout);
        console.error('[PV][FE] fetchData:error', error);
        throw new Error(`Gagal memuat data: ${error.message}`);
    }
}

function parseErrorResponse(response) {
    return response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
    }));
}

function renderTable(data) {
    const tbody = document.querySelector('.data-masuk');
    if (!tbody) throw new Error('Target table body element not found');

    clearTableBody(tbody);

    if (!data || data.length === 0) {
        showEmptyState(tbody, 'Tidak ada data "Menunggu" saat ini yang masuk');
        return;
    }

    data.forEach((item, idx) => {
        try {
            validateItemFields(item, REQUIRED_FIELDS);
            renderTableRow(tbody, item);
        } catch (itemError) {
            console.error('[PV][FE] renderTable item error', { idx, err: itemError?.message, item });
            appendErrorRow(tbody, `Gagal memuat data item: ${itemError.message}`);
        }
    });

    setupTableEventListeners();
}

function renderTableRow(tbody, item) {
    const row = tbody.insertRow();
    row.setAttribute('data-nobooking', item.nobooking);
    row.setAttribute('data-novalidasi', item.no_validasi || '');

    // Add data cells (ringkas)
    REQUIRED_FIELDS.forEach(field => {
        const cell = row.insertCell();
        cell.textContent = item[field] || '-';
        cell.setAttribute('data-field', field);
    });

    // Action column removed - approval is now handled through the PV actions panel

    // Add dropdown row
    const dropdownRow = createDropdownRow(item);
    tbody.appendChild(dropdownRow);
}

// Action button functions removed - approval is now handled through the PV actions panel
// The send-to-LSB functionality is now integrated into the approval process

function createDropdownRow(item) {
    const row = document.createElement('tr');
    row.className = 'dropdown-row';
    
    const cell = document.createElement('td');
    cell.colSpan = REQUIRED_FIELDS.length; // Removed +1 since we removed the action column
    cell.style.display = 'none';
    cell.innerHTML = generateDropdownContent(item);
    
    row.appendChild(cell);
    return row;
}

function setupTableEventListeners() {
    const tbody = document.querySelector('.data-masuk');
    if (!tbody) return;

    // Event delegation for row clicks
    tbody.addEventListener('click', (event) => {
        const row = event.target.closest('tr:not(.dropdown-row)');
        if (!row) return;

        const nobooking = row.getAttribute('data-nobooking');
        const novalidasi = row.getAttribute('data-novalidasi');
        if (!nobooking) return;

        selectedNoBooking = nobooking;
        console.log(`Selected No Booking: ${selectedNoBooking}`);

        toggleDropdown(row);
        handleRowSelection(nobooking);
        try {
            const el = document.getElementById('pv-no-validasi');
            if (el && novalidasi) el.value = novalidasi;
        } catch(_) {}
    });
}

function toggleDropdown(row) {
    const dropdownRow = row.nextElementSibling;
    if (!dropdownRow || !dropdownRow.classList.contains('dropdown-row')) return;

    const dropdownCell = dropdownRow.querySelector('td');
    if (!dropdownCell) return;

    const isVisible = dropdownCell.style.display === 'table-cell';
    dropdownCell.style.display = isVisible ? 'none' : 'table-cell';
    
    // Update dropdown buttons when opening dropdown
    if (!isVisible) {
        const novalidasi = row.getAttribute('data-novalidasi');
        if (novalidasi && typeof window.gateActions === 'function') {
            // Update input field first
            const input = document.getElementById('pv-no-validasi');
            if (input) input.value = novalidasi;
            // Then update button states
            setTimeout(() => window.gateActions(), 100);
        }
    }

    if (!isVisible && typeof enableViewDocumentButton === 'function') {
        enableViewDocumentButton(selectedNoBooking);
    }
}

function handleRowSelection(nobooking) {
    // Additional handling when a row is selected
    // Can be extended for BSRE integration or other features
}

// UI Helper Functions
function clearTableBody(tbody) {
    tbody.innerHTML = '';
}

function showEmptyState(tbody, message) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = REQUIRED_FIELDS.length; // Removed +1 since we removed the action column
    cell.className = 'empty-state';
    cell.textContent = message;
}

function appendErrorRow(tbody, message) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = REQUIRED_FIELDS.length; // Removed +1 since we removed the action column
    cell.className = 'error-row';
    cell.textContent = message;
}

function handleMainError(error) {
    console.error('Main Function Error:', error);
    
    const errorContainer = document.querySelector('.data-masuk') || document.body;
    
    // Check if it's a "no data found" error
    if (error.message && (error.message.includes('Tidak ada data yang ditemukan') || error.message.includes('Tidak ada data "Menunggu"'))) {
        errorContainer.innerHTML = `
            <tr>
                <td colspan="${REQUIRED_FIELDS.length}" style="text-align: center; padding: 20px; color: #6b7280;">
                    Tidak ada data "Menunggu" saat ini yang masuk
                </td>
            </tr>
        `;
    } else {
        errorContainer.innerHTML = `
            <tr>
                <td colspan="${REQUIRED_FIELDS.length}" style="text-align: center; padding: 20px; color: #ef4444;">
                    <h3>Terjadi Kesalahan</h3>
                    <p>${error.message}</p>
                    <button onclick="loadTableDataParafValidasi()" style="margin-top: 10px; padding: 8px 16px; background: #1d4ed8; color: white; border: none; border-radius: 6px; cursor: pointer;">Coba Lagi</button>
                </td>
            </tr>
        `;
    }
}

// Utility Functions
function validateItemFields(item, requiredFields) {
    const missingFields = requiredFields.filter(field => !item[field]);
    if (missingFields.length > 0) {
        throw new Error(`Data yang diperlukan tidak lengkap. Field yang hilang: ${missingFields.join(', ')}`);
    }
}

function transformOldEndpointRow(r){
    const safe = (v)=> (v===null||v===undefined)?'':v;
    const no_validasi = safe(r.no_validasi || r.noValidasi || r.novalidasi);
    const no_registrasi = safe(r.no_registrasi || r.noRegistrasi || r.noregistrasi);
    const nobooking = safe(r.nobooking || r.no_booking || r.bookingid || r.booking_id);
    const tahunajb = safe(r.tahunajb || r.tahun_ajb || r.tahun || '');
    const namawajibpajak = safe(r.namawajibpajak || r.nama_wajib_pajak || r.wp_nama || '');
    const namapemilikobjekpajak = safe(r.namapemilikobjekpajak || r.nama_pemilik_objek_pajak || r.nama_pemilik || '');
    // Status tampilan mengikuti pv_1_paraf_validate.status_tertampil (Menunggu, Sudah Divalidasi, Ditolak)
    const rawDisplay = String(r.status_tertampil || '').trim();
    let status_display = 'Menunggu';
    if (/^sudah\s*divalidasi$/i.test(rawDisplay)) status_display = 'Sudah Divalidasi';
    else if (/^ditolak$/i.test(rawDisplay)) status_display = 'Ditolak';
    else if (/^menunggu$/i.test(rawDisplay)) status_display = 'Menunggu';
    // Fallback lama (untuk kompatibilitas data historis)
    else if (/^(approved|accept)$/i.test(rawDisplay)) status_display = 'Sudah Divalidasi';
    else if (/^(cancelled|rejected)$/i.test(rawDisplay)) status_display = 'Ditolak';
    const divisi = String(r.creator_divisi || r.divisi || r.pembuat_divisi || '').toLowerCase();
    const userid = String(r.userid || r.creator_userid || '').toUpperCase();
    const isPPAT = divisi==='ppat' || divisi==='ppats' || 
                  userid.startsWith('PAT') || userid.startsWith('PATS');
    const sf = safe(r.special_field || r.namapembuat || r.pembuat_nama || '');
    const pu = safe(r.pejabat_umum || r.gelar_pembuat || '');
    const baseNama = safe(r.namapembuat || r.pembuat_nama || r.creator_nama || r.nama || r.nama_pembuat || r.userid || '');
    const pembuat_gelar = isPPAT ? `${sf}/${pu}` : (baseNama || '-');
    const keterangan = safe(r.keterangan || (status_display==='Sudah Divalidasi' ? 'Sudah diparaf' : (status_display==='Ditolak' ? 'Data tidak lengkap' : '')));
    const item = { 
        no_validasi, no_registrasi, nobooking, tahunajb, namawajibpajak, namapemilikobjekpajak, status_display, pembuat_gelar, keterangan 
    };
    
    // bawa informasi penting lain untuk dropdown/aksi
    item.userid = r.userid || r.creator_userid || '';
    item.peneliti_tanda_tangan_path = r.peneliti_tanda_tangan_path || r.tanda_tangan_path || '';
    // dokumen terkait (fallback beberapa nama field)
    item.akta_tanah_path = safe(r.akta_tanah_path || r.akta_tanah || r.path_akta_tanah || r.akta_path || '');
    item.sertifikat_tanah_path = safe(r.sertifikat_tanah_path || r.sertifikat_tanah || r.path_sertifikat_tanah || r.sertifikat_path || '');
    item.pelengkap_path = safe(r.pelengkap_path || r.file_pelengkap_path || r.path_pelengkap || '');
    item.open_dokumen = safe(r.open_dokumen || r.dokumen_validasi_path || r.validasi_pdf || r.source_pdf_path || '');
    
    return item;
}

function getUserDivisi() {
    return localStorage.getItem('divisi') || sessionStorage.getItem('divisi');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Jika halaman ini menggunakan renderer khusus (mis. PV dashboard),
    // biarkan script ini hanya menyediakan helper dan event listener tambahan.
    if (window && window.PV_DISABLE_AUTO_RENDER) {
        try { setupDropdownEventListeners(); } catch(_) {}
        return;
    }
    loadTableDataParafValidasi().catch(error => {
        console.error('Initialization Error:', error);
        handleMainError(error);
    });
});
/////
// =====================
// DROPDOWN CONTENT GENERATOR
// =====================
function generateDropdownContent(item) {

    return `
        <div class="dropdown-content-wrapper">
            <!-- Document Info Section -->
            <div class="document-info-section">
                <p><strong>No. Booking:</strong> ${item.nobooking || 'N/A'}</p>
                <p><strong>Nama Wajib Pajak:</strong> ${item.namawajibpajak || 'N/A'}</p>
                <p><strong>Nama Pemilik Objek Pajak:</strong> ${item.namapemilikobjekpajak || 'N/A'}</p>
                ${item.keterangan ? `<p><strong>Keterangan:</strong> ${item.keterangan}</p>` : ''}
            </div>

                <div class="action-buttons">
                    <div>
                        <h5>Dokumen Permohonan</h5>
                        <div class="form-actions">
                            <button class="btn-view" data-nobooking="${item.nobooking}" onclick="viewPDF('${item.nobooking}')">
                                <i class="fas fa-file-pdf"></i> Lihat Dokumen Permohonan
                            </button>
                        </div>
                    </div>
                    <div>
                        <h5>Dokumen Booking</h5>
                        <div class="form-actions">
                            <button class="btn-view" data-nobooking="${item.nobooking}" onclick="viewDocument('${item.nobooking}')">
                                <i class="fas fa-file-pdf"></i> Lihat Dokumen Booking
                            </button>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 8px; padding: 8px; background: #F0FDF4; border: 1px solid #A7F3D0; border-radius: 6px; color: #065F46; font-size: 14px;">
                    <strong>Info:</strong> Untuk menyetujui atau menolak dokumen, gunakan tombol di bawah ini.
                </div>

            <!-- Document Links Section -->
            <div class="document-links-section">
                <h6 class="document-links-title">Dokumen Terkait:</h6>
                <div class="document-links-list">
                    ${generateDocumentLinks(item)}
                </div>
            </div>

                <!-- PV Action Buttons Section -->
                <div class="pv-action-buttons-dropdown" style="margin-top: 16px; padding: 16px; background: #0b0f1a; border: 1px solid #1f2937; border-radius: 10px;">
                    <h6 style="color: #e5e7eb; margin: 0 0 12px 0; font-weight: 600; font-size: 14px;">Aksi Validasi:</h6>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="pv-verify-dropdown-${item.no_validasi}" class="pv-btn-verify-dropdown" data-no-validasi="${item.no_validasi}" style="padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                            Verify
                        </button>
                        <button id="pv-approve-dropdown-${item.no_validasi}" class="pv-btn-approve-dropdown" data-no-validasi="${item.no_validasi}" disabled style="padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: not-allowed; transition: all 0.3s ease; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3); opacity: 0.6;">
                            Setujui & Kirim ke LSB
                        </button>
                        <button id="pv-reject-dropdown-${item.no_validasi}" class="pv-btn-reject-dropdown" data-no-validasi="${item.no_validasi}" disabled style="padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: not-allowed; transition: all 0.3s ease; background: linear-gradient(135deg, #DC2626 0%, #b91c1c 100%); color: white; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3); opacity: 0.6;">
                            Tolak
                        </button>
                    </div>
                </div>
        </div>
    `;
}

function generateDocumentLinks(item) {
    const toHref = (p)=>{ if(!p) return ''; return p.startsWith('/')? p : ('/'+p); };
    const docs = [];
    if (item.akta_tanah_path) {
        const p = item.akta_tanah_path;
        const href = toHref(p);
        const isPdf = /\.pdf($|\?)/i.test(p);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Akta Tanah:</span>
                ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                        : `<a href="${href}" target="_blank"><img src="${href}" alt="Akta Tanah" style="max-width:100px; max-height:100px;" onerror="this.onerror=null;this.src='/asset/notfound.png'"></a>`}
            </div>`);
    }
    if (item.sertifikat_tanah_path) {
        const p = item.sertifikat_tanah_path; const href = toHref(p); const isPdf = /\.pdf($|\?)/i.test(p);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Sertifikat Tanah:</span>
                ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                        : `<a href="${href}" target="_blank"><img src="${href}" alt="Sertifikat Tanah" style="max-width:100px; max-height:100px;" onerror="this.onerror=null;this.src='/asset/notfound.png'"></a>`}
            </div>`);
    }
    if (item.pelengkap_path) {
        const p = item.pelengkap_path; const href = toHref(p); const isPdf = /\.pdf($|\?)/i.test(p);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Dokumen Pelengkap:</span>
                ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                        : `<a href="${href}" target="_blank"><img src="${href}" alt="Pelengkap" style="max-width:100px; max-height:100px;" onerror="this.onerror=null;this.src='/asset/notfound.png'"></a>`}
            </div>`);
    }
    if (item.open_dokumen) {
        const href = toHref(item.open_dokumen);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Dokumen Validasi:</span>
                <a href="${href}" target="_blank"><button class="btn-view">Buka</button></a>
            </div>`);
    }
    return docs.join('');
}

async function viewPDFValidasi(nobooking) {
    try {
        // Buka jendela baru
        const pdfWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        // Tampilkan loading state
        pdfWindow.document(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Loading Dokumen Validasi - ${nobooking}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0; 
                        background: #f5f5f5;
                    }
                    .loading-container {
                        text-align: center;
                    }
                    .spinner {
                        font-size: 3rem;
                        color: #007bff;
                        margin-bottom: 1rem;
                    }
                </style>
            </head>
            <body>
                <div class="loading-container">
                    <div class="spinner"><i class="fas fa-spinner fa-spin"></i></div>
                    <h2>Memuat Dokumen Validasi...</h2>
                    <p>No. Booking: ${nobooking}</p>
                </div>
            </body>
            </html>
        `);

        // Fetch PDF
        const response = await fetch(`/api/Validasi/generate-pdf/${nobooking}`);
        if (!response.ok) throw new Error('Gagal memuat dokumen');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Render PDF di jendela baru
        pdfWindow.location.href = url;
        
        // Simpan reference window untuk nanti
        window.pdfViewerWindows = window.pdfViewerWindows || {};
        window.pdfViewerWindows[nobooking] = pdfWindow;

    } catch (error) {
        console.error('PDF View Error:', error);
        
        // Jika window masih terbuka, tampilkan error
        if (pdfWindow && !pdfWindow.closed) {
            pdfWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Error - Dokumen Validasi</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            margin: 0; 
                            background: #f5f5f5;
                        }
                        .error-container {
                            text-align: center;
                            color: #dc3545;
                        }
                        .error-icon {
                            font-size: 3rem;
                            margin-bottom: 1rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <h2>Gagal Memuat Dokumen</h2>
                        <p>${error.message}</p>
                        <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 1rem;">
                            Coba Lagi
                        </button>
                    </div>
                </body>
                </html>
            `);
        } else {
            alert(`Gagal memuat dokumen: ${error.message}`);
        }
    }
}
// ===== \\
async function processDigitalSignature(nobooking) {
    try {
        // 1. Dapatkan PDF untuk ditandatangani dari jendela preview
        const pdfWindow = window.pdfViewerWindows?.[nobooking];
        if (pdfWindow && !pdfWindow.closed) {
            // Beri tahu user untuk tidak menutup jendela preview
            alert('Harap tutup jendela preview dokumen sebelum melanjutkan proses tanda tangan');
            return { success: false, message: 'Jendela preview masih terbuka' };
        }

        // 2. Tampilkan konfirmasi final
        const confirmed = await showConfirmationDialog(
            'Konfirmasi Tanda Tangan Digital',
            'Anda yakin ingin menandatangani dokumen ini secara digital?'
        );
        if (!confirmed) return { success: false, message: 'Proses dibatalkan' };

        // 3. Proses tanda tangan via BSRE
        const API_URL = 'https://bphtb-bappenda.up.railway.app';
        const response = await fetch(`${API_URL}/api/Validasi/sign-document`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nobooking,
                signature_type: 'DIGITAL',
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal memproses tanda tangan digital');
        }

        // 4. Tampilkan dokumen yang sudah ditandatangani
        if (result.signed_url) {
            const signedWindow = window.open(result.signed_url, '_blank');
            window.signedViewerWindows = window.signedViewerWindows || {};
            window.signedViewerWindows[nobooking] = signedWindow;
        }

        return result;

    } catch (error) {
        console.error('Signature Process Error:', error);
        return { success: false, message: error.message };
    }
}
// ===== View PDF validasi valid\\
async function viewPDF_validasi(nobooking, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        // Show loading state
        container.innerHTML = '<div class="pdf-loading-state"><i class="fas fa-spinner fa-spin"></i> Memuat dokumen...</div>';

        // Fetch PDF as blob
        const response = await fetch(`/api/Validasi/generate-pdf/${nobooking}`);
        if (!response.ok) throw new Error('Gagal memuat dokumen');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create iframe for preview
        container.innerHTML = `
            <iframe src="${url}" 
                    class="pdf-iframe" 
                    frameborder="0" 
                    allowfullscreen></iframe>
            <div class="pdf-actions">
                <button class="btn btn-sm btn-outline-secondary zoom-in">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary zoom-out">
                    <i class="fas fa-search-minus"></i>
                </button>
            </div>
        `;

        // Setup zoom controls
        setupPDFZoomControls(container);
    } catch (error) {
        console.error('PDF Preview Error:', error);
        container.innerHTML = `
            <div class="pdf-error-state">
                <i class="fas fa-exclamation-circle"></i> Gagal memuat dokumen
            </div>
        `;
    }
}
/////////////////////////////==================== View PDF permohonan Validasi \\
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
        const response = await fetch(`/api/ppat/generate-pdf-mohon-validasi/${nobooking}`);
        if (!response.ok) {
            throw new Error(response.statusText || 'Gagal mengambil PDF');
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

// Expose viewPDF globally for dropdown onclick
window.viewPDF = viewPDF;
///////////===================\\\\
function setupPDFZoomControls(container) {
    const iframe = container.querySelector('.pdf-iframe');
    const zoomInBtn = container.querySelector('.zoom-in');
    const zoomOutBtn = container.querySelector('.zoom-out');
    
    let scale = 1;
    const ZOOM_FACTOR = 0.25;

    zoomInBtn.addEventListener('click', () => {
        scale += ZOOM_FACTOR;
        iframe.style.transform = `scale(${scale})`;
    });

    zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(0.5, scale - ZOOM_FACTOR);
        iframe.style.transform = `scale(${scale})`;
    });
}
//////////
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
    try {
        // Gunakan generator baru (generatepdfverif_paraf.js)
        const pdfUrl = `/api/Validasi_lanjutan-generate-pdf-bookingsspd/${encodeURIComponent(nobooking)}`;
        const w = window.open(pdfUrl, '_blank');
        if (!w || w.closed || typeof w.closed === 'undefined') {
            // Popup terblokir, fallback ke anchor
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Error fetching the PDF:', error);
        alert('Terjadi kesalahan saat mengambil dokumen PDF.');
    }
}

// Expose viewDocument globally for dropdown onclick
window.viewDocument = viewDocument;
///////
// =======
///////
async function handleApprovalSubmission(button) {
    const nobooking = button.dataset.nobooking;
    if (!nobooking) return;

    try {
        // Show loading state
        button.disabled = true;
        const spinner = button.querySelector('.spinner-border');
        const btnText = button.querySelector('.btn-text');
        spinner.hidden = false;
        btnText.textContent = 'Memproses...';

        // Verify approval selection
        const approvalRadio = document.querySelector(`input[name="approval-${nobooking}"]:checked`);
        if (!approvalRadio) {
            throw new Error('Harap pilih persetujuan terlebih dahulu');
        }

        // Process with BSRE
        const result = await processDigitalSignature(nobooking);
        
        if (result.success) {
            showUserNotification('Berhasil', 'Dokumen telah divalidasi dan ditandatangani', 'success');
            
            // Update UI and reload preview
            const previewContainer = document.getElementById(`pdf-preview-${nobooking}`);
            if (previewContainer) {
                await loadPDFPreview(nobooking, `pdf-preview-${nobooking}`);
            }
        } else {
            throw new Error(result.message || 'Proses validasi gagal');
        }
    } catch (error) {
        console.error('Approval Error:', error);
        showUserNotification('Gagal', error.message, 'error');
    } finally {
        // Reset button state
        button.disabled = false;
        const spinner = button.querySelector('.spinner-border');
        const btnText = button.querySelector('.btn-text');
        spinner.hidden = true;
        btnText.textContent = 'Proses Validasi';
    }
}

async function processDigitalSignature(nobooking) {
    // Implementasi BSRE akan dibahas lebih detail
    try {
        const API_URL = 'https://bphtb-bappenda.up.railway.app';
        const response = await fetch(`${API_URL}/api/Validasi/sign-document`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nobooking,
                signature_type: 'DIGITAL',
                timestamp: new Date().toISOString()
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal memproses tanda tangan digital');
        }

        return result;
    } catch (error) {
        console.error('BSRE Process Error:', error);
        return { success: false, message: error.message };
    }
}

// Generate QR dengan nomor validasi untuk keunikan
async function generateQrWithValidasi(nomorValidasi) {
    try {
        const API_URL = 'https://bphtb-bappenda.up.railway.app';
        const response = await fetch(`${API_URL}/api/pv/generate-qr-with-validasi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                nomor_validasi: nomorValidasi
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal generate QR dengan nomor validasi');
        }

        console.log(`[QR-GENERATED] QR dengan nomor validasi ${nomorValidasi}:`, result);
        return result;
    } catch (error) {
        console.error('QR Generation Error:', error);
        return { success: false, message: error.message };
    }
}
// =====================
// DROPDOWN EVENT HANDLERS
// =====================
function setupDropdownEventListeners() {
    document.addEventListener('click', (e) => {
        // Handle simpan persetujuan
        if (e.target.closest('.btn-simpan')) {
            const button = e.target.closest('.btn-simpan');
            handleApprovalSubmission(button);
        }
        
        // Handle radio button selection
        if (e.target.classList.contains('approval-radio')) {
            const radio = e.target;
            toggleSaveButton(radio);
        }
    });
}

async function handleApprovalSubmission(button) {
    const nobooking = button.dataset.nobooking;
    if (!nobooking) return;

    try {
        // Tampilkan loading state
        button.disabled = true;
        const spinner = button.querySelector('.spinner-border');
        const btnText = button.querySelector('.btn-text');
        spinner.hidden = false;
        btnText.textContent = 'Menyimpan...';

        // Dapatkan nilai persetujuan
        const approvalRadio = document.querySelector(`input[name="approval-${nobooking}"]:checked`);
        if (!approvalRadio) {
            throw new Error('Harap pilih persetujuan terlebih dahulu');
        }

        // Proses persetujuan (akan diganti dengan BSRE integration nanti)
        const result = await submitApprovalToServer(nobooking, approvalRadio.value);
        
        if (result.success) {
            showUserNotification('Berhasil', 'Persetujuan tanda tangan berhasil disimpan', 'success');
            // Refresh data atau update UI sesuai kebutuhan
            loadTableDataParafValidasi();
        } else {
            throw new Error(result.message || 'Gagal menyimpan persetujuan');
        }
    } catch (error) {
        console.error('Approval Error:', error);
        showUserNotification('Gagal', error.message, 'error');
    } finally {
        // Reset button state
        button.disabled = false;
        const spinner = button.querySelector('.spinner-border');
        const btnText = button.querySelector('.btn-text');
        spinner.hidden = true;
        btnText.textContent = 'Simpan Persetujuan';
    }
}

function toggleSaveButton(radio) {
    const container = radio.closest('.dropdown-content-wrapper');
    if (!container) return;
    
    const saveButton = container.querySelector('.btn-simpan');
    if (saveButton) {
        saveButton.disabled = !radio.checked;
    }
}

// =====================
// SUPPORTING FUNCTIONS
// =====================

async function submitApprovalToServer(nobooking, approvalStatus) {
    // Ini adalah placeholder untuk integrasi dengan BSRE
    // Akan diimplementasikan nanti setelah pembahasan BSRE
    
    try {
        const API_URL = 'https://bphtb-bappenda.up.railway.app';
        const response = await fetch(`${API_URL}/api/approve-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nobooking,
                status: approvalStatus,
                approval_time: new Date().toISOString()
            })
        });

        return await response.json();
    } catch (error) {
        console.error('Approval API Error:', error);
        return { success: false, message: 'Gagal menyimpan persetujuan' };
    }
}

// Initialize dropdown event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupDropdownEventListeners();
});

// =====================
// FALLBACK HELPERS (UI)
// =====================
// Definisikan fallback jika halaman ini tidak memuat helper global lain
if (typeof window.showUserNotification !== 'function') {
    window.showUserNotification = function(title, message, type) {
        try { console.log('[NOTIFY]', type || 'info', title, message); } catch(_) {}
        alert(`${title}: ${message}`);
    };
}

if (typeof window.showConfirmationDialog !== 'function') {
    window.showConfirmationDialog = async function(title, message) {
        return Promise.resolve(confirm(`${title}\n${message}`));
    };
}