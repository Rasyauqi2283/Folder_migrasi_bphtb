let selectedNoBooking = null;
const API_ENDPOINT = '/api/peneliti/get-berkas-till-verif';
const REQUEST_TIMEOUT = 10000; // 10 seconds
let penParafRows = [];

async function loadTableDataPenelitiP() {
    try {
        const userDivisi = getUserDivisi();
        if (typeof userDivisi !== 'string') {
            throw new Error('Data divisi pengguna tidak valid');
        }

        if (userDivisi !== 'Peneliti') {
            showUserNotification('Akses Ditolak', 'Anda tidak memiliki akses ke data Peneliti', 'error');
            return;
        }
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
        const tbody = document.querySelector('.data-masuk');
        if (!tbody) {
            throw new Error('Elemen tabel target tidak ditemukan');
        }

        clearTableBody(tbody);

        // Simpan dataset untuk akses overlay (cek persetujuan dsb.)
        penParafRows = Array.isArray(data) ? data : [];

        if (!Array.isArray(data) || data.length === 0) {
            showEmptyState(tbody, 'Tidak ada data berkas yang ditemukan');
            return;
        }
        data.forEach(item => {
            try {
                validateItemFields(item, [
                    'no_registrasi', 'nobooking', 'noppbb', 'tahunajb', 'userid',
                    'namawajibpajak', 'namapemilikobjekpajak', 'status', 'trackstatus'
                ]);

                const row = createTableRow(tbody, item);
                addActionButton(row, item);
                addDropdownRow(tbody, item);
                setupRowClickHandler(row, item);

            } catch (itemError) {
                console.error('Error processing item:', itemError);
                appendErrorRow(tbody, `Gagal memuat data: ${itemError.message}`);
            }
        });
        if (metadata) {
            console.log(`Data loaded successfully. Count: ${metadata.count}, Generated at: ${metadata.generatedAt}`);
        }

    } catch (error) {
        console.error('Main Error:', error);
        showErrorUI(error.message);
    }
}
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
                ${pesan1}
                ${pesan2}
            </div>

            <!-- Signature Section -->
            ${hasSignature ? `
                <div class="signature-section">
                    <div class="form-check">
                        <input class="form-check-input" 
                               type="radio" 
                               name="ParafVerif-${item.nobooking}" 
                               id="approve-${item.nobooking}"
                               value="approve" required>
                        <label class="form-check-label" for="approve-${item.nobooking}">
                            Setujui Dokumen
                        </label>
                    </div>
                    <div class="signature-preview mt-2">
                        <p class="mb-1"><small>Tanda Tangan Terverifikasi:</small></p>
                        <img src="${item.tanda_tangan_path}"
                             alt="Tanda Tangan Peneliti"
                             class="img-thumbnail signature-image"
                             style="max-height: 100px;"
                             onerror="this.onerror=null;this.src='/assets/img/signature-placeholder.png'">
                    </div>
                </div>
            ` : `
                <div class="alert alert-warning py-2">
                    <i class="fas fa-exclamation-triangle me-2"></i>
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