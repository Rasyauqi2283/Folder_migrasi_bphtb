let selectedNoBooking = null;
// Fungsi UTAMA untuk memuat data ke dalam tabel
async function loadTableDataPenelitiV() {
    try {
        // Validate user division
        const userDivisi = getUserDivisi();
        if (typeof userDivisi !== 'string') {
            throw new Error('Invalid user division data');
        }

        if (userDivisi !== 'Peneliti') {
            alert('Anda tidak memiliki akses ke data Peneliti');
            return;
        }

        // Fetch data with timeout
        let response;
        try {
            response = await Promise.race([
                fetch('/api/peneliti_get-berkas-fromltb', { credentials: 'include' }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout: Server took too long to respond')), 10000))
            ]);

            // Jika 404, perlakukan sebagai tidak ada data (bukan error)
            if (!response.ok && response.status !== 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (fetchError) {
            console.error('Fetch Error:', fetchError);
            throw new Error(`Gagal memuat data: ${fetchError.message}`);
        }

        // Parse JSON data
        let data;
        try {
            if (response.status === 404) {
                // Graceful empty state
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

        // DOM manipulation
        const tbody = document.querySelector('.data-masuk');
        if (!tbody) {
            throw new Error('Target table body element not found');
        }

        // Clear existing content
        tbody.innerHTML = '';

        // Process each item
        data.data.forEach(item => {
            try {
                // Validate required fields (relaxed)
                const requiredFields = ['no_registrasi','nobooking', 'noppbb', 'userid', 
                                      'namawajibpajak', 'namapemilikobjekpajak', 'tanggal_terima', 'creator_special_field', 'jenis_wajib_pajak'];
                // Only enforce truly critical fields so rows still render
                const criticalFields = ['no_registrasi','nobooking'];
                const missingCritical = criticalFields.filter(field => !item[field]);
                if (missingCritical.length > 0) {
                    console.warn(`Skipping row missing critical fields for nobooking ${item.nobooking || 'unknown'}:`, missingCritical);
                    return;
                }

                // Create table row
                const row = tbody.insertRow();
                
                // Add basic data cells
                requiredFields.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    const value = (item[field] === undefined || item[field] === null || item[field] === '') ? '-' : item[field];
                    cell.textContent = value;
                });

                // Add action button
                const sendCell = row.insertCell(9);
                const sendButton = document.createElement('button');
                sendButton.textContent = 'Kirim';
                sendButton.classList.add('btn-kirim-document');
                
                sendButton.addEventListener('click', async () => {
                    try {
                        const confirmation = window.confirm("Apakah kamu yakin ingin mengirim data ini? Sudah diperiksa?");
                        
                        if (confirmation) {
                            // Hanya wajib: nobooking (opsional: no_registrasi)
                            if (!item || !item.nobooking) {
                                throw new Error("Data yang diperlukan tidak lengkap (nobooking).");
                            }

                            const result = await sendToParafKasie(item);
                            if (result && result.success) {
                                sendButton.disabled = true;
                                sendButton.textContent = 'Data Terkirim';
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
                
                sendCell.appendChild(sendButton);

                // Create dropdown row - PRESERVED FROM ORIGINAL CODE
                // data html akan tertampil menggunakan fungsi dropdown di dalam baris tabel
                const dropdownRow = document.createElement('tr');
                const dropdownContent = document.createElement('td');
                dropdownContent.colSpan = 10;
                dropdownContent.style.display = 'none';
                
                try {
                    // Pesan status ringkas untuk kepegawaian
                    const sudahSetuju = String(item.persetujuan||'').toLowerCase()==='true';
                    const adaPemilihan = !!item.pemilihan; // tetap, karena pemilihan hanya ada di p_1_verifikasi
                    const pesan1 = (sudahSetuju && adaPemilihan) ? `<p>Booking ini telah diberi persetujuan dan pemilihan (${item.pemilihan}).</p>` : '<p>Booking ini belum diberi persetujuan dan pemilihan.</p>';
                    // Tampilkan penandatangan berdasarkan paraf (p_3_clear_to_paraf.tanda_paraf_path -> a_2_verified_users)
                    // Backend kini mengirim pc.tanda_paraf_path dan signer_userid
                    const signerUser = item.signer_userid || (String(item.tanda_tangan_path||'').match(/ttd-([^\/\\]+)\.(png|jpg|jpeg|webp)$/i)?.[1]) || '—';
                    
                    // Cek apakah sudah ada tanda tangan/paraf - gunakan tanda_paraf_path atau peneliti_tanda_tangan_path
                    const hasSignature = item.peneliti_tanda_tangan_path || item.signer_userid;
                    
                    // Debug logging
                    console.log('🔍 [PENELITI-VERIF] Signature check for booking:', item.nobooking);
                    console.log('🔍 [PENELITI-VERIF] - tanda_paraf_path:', item.tanda_paraf_path);
                    console.log('🔍 [PENELITI-VERIF] - peneliti_tanda_tangan_path:', item.peneliti_tanda_tangan_path);
                    console.log('🔍 [PENELITI-VERIF] - signer_userid:', item.signer_userid);
                    console.log('🔍 [PENELITI-VERIF] - hasSignature:', hasSignature);
                    console.log('🔍 [PENELITI-VERIF] - signerUser:', signerUser);
                    
                    const pesan2 = hasSignature ? `<p>Pemberi tanda tangan/paraf (${signerUser})</p>` : '<p>Belum diberikan tanda tangan/paraf</p>';
                    dropdownContent.innerHTML = `
                        <div class="dropdown-content-wrapper">
                            <!-- Document Info Section -->
                            <div class="document-info-section">
                                <p><strong>No. Registrasi:</strong> ${item.nobooking || 'N/A'}</p>
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
                                            <img src="${item.peneliti_tanda_tangan_path}"  // Langsung gunakan path dari API
                                                alt="Tanda Tangan" 
                                                class="signature-image"
                                                onerror="this.style.display='none'">
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="alert alert-warning">
                                    Tidak dapat memberikan persetujuan - tanda tangan belum diunggah
                                </div>
                                <input type="hidden" name="ParafVerif-${item.nobooking}" value="null">
                            `}

                        <!-- Calculation Form Section -->
                        <div class="calculation-section">
                            <h6 class="section-title">Jumlah Setoran Berdasarkan:</h6>
                            ${item.pemilihan ? `
                                <div class="form-group">
                                    <input type="radio" class="penghitungwajibpajak" name="pemilihan-${item.nobooking}" value="penghitung_wajib_pajak" ${item.pemilihan === 'penghitung_wajib_pajak' ? 'checked' : ''}>
                                    <label>Penghitungan wajib pajak</label>
                                </div>
                            <div class="form-group">
                                <input type="radio" class="stpdkurangbayar" name="pemilihan-${item.nobooking}" value="stpd_kurangbayar" ${item.pemilihan === 'stpd_kurangbayar' ? 'checked' : ''}>
                                <label>STPD kurang bayar</label>
                                <div class="sub-inputs stpdkurangbayar-sub-input" data-parent="stpdkurangbayar">
                                    <input type="text" class="nomorstpd" name="nomorstpd" placeholder="Nomor STPD" value="${item.nomorstpd || ''}">
                                    <input type="date" class="tanggalstpd" name="tanggalstpd" value="${item.tanggalstpd || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <input type="radio" class="dihitungsendiri" name="pemilihan-${item.nobooking}" value="dihitungsendiri" ${item.pemilihan === 'dihitungsendiri' ? 'checked' : ''}>
                                <label>Pengurangan dihitung sendiri</label>
                                <div class="sub-inputs dihitungsendiri-sub-input" data-parent="dihitungsendiri">
                                    <input type="number" class="angkapersen" name="angkapersen" placeholder="0-100" min="0" max="100" step="0.01" value="${item.angkapersen || ''}">
                                    <span>%</span>
                                    <input type="text" class="keterangandihitungSendiri" name="keteranganhitungsendiri" placeholder="Berdasarkan..." value="${item.keterangandihitungSendiri || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <input type="radio" class="lainnyapenghitungwp" name="pemilihan-${item.nobooking}" value="lainnyapenghitungwp" ${item.pemilihan === 'lainnyapenghitungwp' ? 'checked' : ''}>
                                <label>Lainnya</label>
                                <div class="sub-inputs lainnyapenghitungwp-sub-input" data-parent="lainnyapenghitungwp">
                                    <input type="text" class="isiketeranganlainnya" name="isiketeranganlainnya" placeholder="Isikan disini..." value="${item.isiketeranganlainnya || ''}">
                                </div>
                            </div>
                        ` : `
                            <input type="radio" class="penghitungwajibpajak" name="pemilihan-${item.nobooking}" value="penghitung_wajib_pajak">
                            <label>Penghitungan wajib pajak</label>
                            <input type="radio" class="stpdkurangbayar" name="pemilihan-${item.nobooking}" value="stpd_kurangbayar">
                            <label>STPD kurang bayar</label>
                            <div class="sub-inputs stpdkurangbayar-sub-input" data-parent="stpdkurangbayar">
                                <input type="text" class="nomorstpd" name="nomorstpd-${item.nobooking}" placeholder="Nomor STPD">
                                <input type="date" class="tanggalstpd" name="tanggalstpd-${item.nobooking}">
                            </div>
                            <input type="radio" class="dihitungsendiri" name="pemilihan-${item.nobooking}" value="dihitungsendiri">
                            <label>Pengurangan dihitung sendiri</label>
                            <div class="sub-inputs dihitungsendiri-sub-input" data-parent="dihitungsendiri">
                                <input type="number" class="angkapersen" name="angkapersen-${item.nobooking}" placeholder="0-100" min="0" max="100" step="0.01">
                                <span>%</span>
                                <input type="text" class="keterangandihitungSendiri" name="keteranganhitungsendiri-${item.nobooking}" placeholder="Berdasarkan...">
                            </div>
                            <input type="radio" class="lainnyapenghitungwp" name="pemilihan-${item.nobooking}" value="lainnyapenghitungwp">
                            <label>Lainnya</label>
                            <div class="sub-inputs lainnyapenghitungwp-sub-input" data-parent="lainnyapenghitungwp">
                                <input type="text" class="isiketeranganlainnya" name="isiketeranganlainnya-${item.nobooking}" placeholder="Isikan disini...">
                            </div>
                        `}
                        </div>

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

                // Row click handler for dropdown toggle
                row.addEventListener('click', function() {
                    try {
                        selectedNoBooking = item.nobooking;
                        console.log(`Selected No Booking: ${selectedNoBooking}`);
    
                        if (typeof enableViewDocumentButton === 'function') {
                            enableViewDocumentButton(item.nobooking);
                        }                    
                        const isVisible = dropdownContent.style.display === 'table-cell';
                        dropdownContent.style.display = isVisible ? 'none' : 'table-cell';
                        
                        
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

            } catch (itemError) {
                console.error('Error processing item:', itemError);
                // Create error row for failed items
                const errorRow = tbody.insertRow();
                const errorCell = errorRow.insertCell(0);
                errorCell.colSpan = 10;
                errorCell.textContent = `Gagal memuat data item: ${itemError.message}`;
                errorCell.style.color = 'red';
            }
        });

        // Show empty state if no valid data
        if (tbody.children.length === 0) {
            const emptyRow = tbody.insertRow();
            const emptyCell = emptyRow.insertCell(0);
            emptyCell.colSpan = 10;
            emptyCell.textContent = 'tidak ada data saat ini, 0 dari 0 data';
        }

    } catch (mainError) {
        console.error('Main Function Error:', mainError);
        
        // Show error to user
        const errorContainer = document.querySelector('.data-masuk') || document.body;
        errorContainer.innerHTML = `
            <div class="error-message">
                <h3>Terjadi Kesalahan</h3>
                <p>${mainError.message}</p>
                <button onclick="location.reload()">Coba Lagi</button>
            </div>
        `;
    }
}
// Menambahkan event listener untuk setiap baris dalam tabel
document.querySelectorAll('#penelitiverifikasiTable tbody tr').forEach(row => {
    row.addEventListener('click', function() {
        // Mendapatkan nilai noBooking dari kolom pertama
        selectedNoBooking = row.cells[0].textContent.trim();  // Kolom pertama adalah No. Booking
        console.log(`No Booking yang dipilih: ${selectedNoBooking}`);  // Debugging
    });
});
function getUserDivisi() {
    return localStorage.getItem('divisi') || sessionStorage.getItem('divisi');
}
localStorage.setItem('divisi', 'Peneliti');
// Atau
sessionStorage.setItem('divisi', 'Peneliti');
/// end fungsi utama
////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////////////////
function resetSignatureForm() {
    document.getElementById('signature_verif').value = '';
    document.getElementById('preview').style.display = 'none';
}//
function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;
    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showAlert('error', 'Hanya file JPG/PNG yang diperbolehkan!');
        event.target.value = ''; // Reset input
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById(previewId);
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}
// Helper functions
function toggleLoading(show) {
    const btn = document.getElementById('uploadttd');
    const loadingIndicator = document.getElementById('loadingIndicator') || createLoadingIndicator();
    if (show) {
        btn.disabled = true;
        loadingIndicator.style.display = 'inline-block';
    } else {
        btn.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}
function createLoadingIndicator() {
    const indicator = document.createElement('span');
    indicator.id = 'loadingIndicator';
    indicator.style.display = 'none';
    indicator.innerHTML = ' &nbsp;<i class="fa fa-spinner fa-spin"></i>';
    document.getElementById('uploadttd').appendChild(indicator);
    return indicator;
}
function showAlert(type, message) {
    // Ganti dengan library notifikasi atau custom alert Anda
    alert(`${type.toUpperCase()}: ${message}`);
}

//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        const { has_signature } = await signatureCheck.json();
        if (!has_signature) {
            throw new Error('Anda belum mengunggah tanda tangan!');
        }

        const persetujuanVerif = document.querySelector(`input[name="ParafVerif-${nobooking}"]:checked`)?.value;
        if (!persetujuanVerif) {
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
        const tandaTanganResponse = await fetch(`/api/v1/auth/get-tanda-tangan?userid=${userData.userid}`, { credentials: 'include' });  // Ganti `userid` -> `userData.userid`
        if (!tandaTanganResponse.ok) {
            throw new Error('Gagal mengambil tanda tangan');
        }

        const blob = await tandaTanganResponse.blob();
        const base64TandaTangan = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });

        // 6. Proses pilihan
        let pemilihan = '';
        let nomorstpd = null;
        let tanggalstpd = null;
        let angkapersen = null;
        let keterangandihitungSendiri = null;
        let isiketeranganlainnya = null;

        const radioButtons = document.querySelectorAll(`input[name="pemilihan-${nobooking}"]`);
        for (let radioButton of radioButtons) {
            if (radioButton.checked) {
                pemilihan = radioButton.value;
                break;
            }
        }

        // Validasi berdasarkan pilihan
        if (!pemilihan) {
            throw new Error("Harap pilih salah satu opsi.");
        }

        if (pemilihan === 'stpd_kurangbayar') {
            nomorstpd = document.querySelector(`input[name="nomorstpd-${nobooking}"]`)?.value || document.querySelector(`input[name="nomorstpd"]`)?.value;
            tanggalstpd = document.querySelector(`input[name="tanggalstpd-${nobooking}"]`)?.value || document.querySelector(`input[name="tanggalstpd"]`)?.value;
            if (!nomorstpd || !tanggalstpd) {
                throw new Error("Harap isi nomor STPD dan tanggal STPD.");
            }
        } 
        else if (pemilihan === 'dihitungsendiri') {
            angkapersen = parseFloat(document.querySelector(`input[name="angkapersen-${nobooking}"]`)?.value || document.querySelector(`input[name="angkapersen"]`)?.value);
            if (isNaN(angkapersen) || angkapersen < 0 || angkapersen > 100) {
                throw new Error("Persen harus antara 0-100");
            }
            keterangandihitungSendiri = document.querySelector(`input[name="keteranganhitungsendiri-${nobooking}"]`)?.value || document.querySelector(`input[name="keteranganhitungsendiri"]`)?.value;
            if (!keterangandihitungSendiri) {
                throw new Error("Harap isi keterangan penghitungan");
            }
        } 
        else if (pemilihan === 'lainnyapenghitungwp') {
            isiketeranganlainnya = document.querySelector(`input[name="isiketeranganlainnya-${nobooking}"]`)?.value || document.querySelector(`input[name="isiketeranganlainnya"]`)?.value;
            if (!isiketeranganlainnya) {
                throw new Error("Harap isi keterangan lainnya");
            }
        }

        // 7. Siapkan data untuk dikirim
        const data = {
            userid: userData.userid,
            nobooking: nobooking, // Gunakan variabel nobooking yang sudah didefinisikan
            pemilihan: pemilihan,
            nomorstpd: nomorstpd,
            tanggalstpd: tanggalstpd,
            angkapersen: angkapersen,
            keterangandihitungSendiri: keterangandihitungSendiri,
            isiketeranganlainnya: isiketeranganlainnya,
            persetujuanVerif: persetujuanVerif,
            pemberi_persetujuan: userData.userid, // Tambahkan pemberi persetujuan dari session user
            tanda_tangan_blob: base64TandaTangan
        };
        
        // Log data yang akan dikirim untuk debugging
        console.log('📤 Data yang akan dikirim ke API:', {
            ...data,
            tanda_tangan_blob: '[BLOB_DATA]' // Jangan log blob data yang besar
        });
        console.log('👤 Pemberi Persetujuan (UserID):', userData.userid);

        // 8. Kirim data ke backend dengan timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const saveResponse = await fetch('/api/peneliti_update-berdasarkan-pemilihan', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);

        if (!saveResponse.ok) {
            throw new Error(await saveResponse.text());
        }
        
        if (persetujuanVerif === 'ya') {
            await fetch('/api/peneliti/transfer-signature', {
                method: 'POST',
                credentials: 'include'
            });
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
//////
// Fungsi untuk generate PDF
// pada bagian ini masih ada tracking
async function generatePDF(nobooking, base64TandaTangan) {
    try {
        const response = await fetch(`/api/peneliti_lanjutan-generate-pdf-badan/${nobooking}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                signature: base64TandaTangan
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${nobooking}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert(`Gagal generate PDF: ${error.message}`);
    }
}
////
function resetNamaPemverifikasi(nobooking) {
    fetch('/api/reset-nama-pemverifikasi', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nobooking: nobooking })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Nama Pemverifikasi berhasil di-reset!');
            location.reload(); // Reload halaman untuk melihat perubahan
            // Update tampilan di frontend jika perlu, misalnya mengosongkan input field atau mengubah tampilan di tabel
        } else {
            alert('Gagal mereset nama pemverifikasi.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mereset nama pemverifikasi.');
    });
}
////
///
//
////
///
//
// Fungsi untuk mengirim data ke peneliti
async function sendToParafKasie(item) {
    try {
        // userid pada tabel p_3_clear_to_paraf:
        // - userid   -> userid pembuat/pengirim nobooking (PPAT/PPATS) -> berasal dari item.userid
        // - pemverifikasi -> userid peneliti (user yang sedang login)
        const verifierUserid = sessionStorage.getItem('userid') || localStorage.getItem('userid');
        if (!verifierUserid) {
            alert('User peneliti tidak ditemukan. Silakan login ulang.');
            return { success: false, message: 'Tidak ada session peneliti' };
        }
        const response = await fetch('/api/peneliti_send-to-paraf', {
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
                status: 'Dikerjakan',  // Status yang dikirim dari frontend
                trackstatus: 'Diverifikasi',  // Trackstatus yang dikirim dari frontend
                keterangan: item.keterangan,
                no_registrasi: item.no_registrasi
            }),
        });

        const result = await response.json().catch(() => ({ success: false, message: 'Response tidak valid' }));
        if (!response.ok) {
            return { success: false, message: result.message || `HTTP ${response.status}` };
        }
        if (result.success) {
            alert('Data berhasil dikirim ke peneliti!');
        } else {
            alert('Gagal mengirim data ke peneliti.');
        }
        return result;
    } catch (error) {
        console.error('Error sending data to peneliti:', error);
        alert('Terjadi kesalahan saat mengirim data.');
        return { success: false, message: error?.message || 'Unknown error' };
    }
}


  ///
// Helper function untuk generate document links
function generateDocumentLinks(item) {
    const toHref = (p) => { if(!p) return ''; return p.startsWith('/') ? p : ('/' + p); };
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
        const p = item.sertifikat_tanah_path;
        const href = toHref(p);
        const isPdf = /\.pdf($|\?)/i.test(p);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Sertifikat Tanah:</span>
                ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                        : `<a href="${href}" target="_blank"><img src="${href}" alt="Sertifikat Tanah" style="max-width:100px; max-height:100px;" onerror="this.onerror=null;this.src='/asset/notfound.png'"></a>`}
            </div>`);
    }
    
    if (item.pelengkap_path) {
        const p = item.pelengkap_path;
        const href = toHref(p);
        const isPdf = /\.pdf($|\?)/i.test(p);
        docs.push(`
            <div class="document-link-item">
                <span class="document-label">Dokumen Pelengkap:</span>
                ${isPdf ? `<a href="${href}" target="_blank"><button class="btn-view">View PDF</button></a>`
                        : `<a href="${href}" target="_blank"><img src="${href}" alt="Pelengkap" style="max-width:100px; max-height:100px;" onerror="this.onerror=null;this.src='/asset/notfound.png'"></a>`}
            </div>`);
    }
    
    return docs.join('');
}

window.onload = loadTableDataPenelitiV;

// ===== Refactor: Signature flow using stored profile signature =====
document.addEventListener('DOMContentLoaded', () => {
    const showSignatureBtn = document.getElementById('showSignatureModal');
    const overlay = document.getElementById('overlay-sign');
    const overlayConfirmed = document.getElementById('overlay-sign-confirmed');
    const overlayMsg = overlay?.querySelector('.overlay-content-sign p');
    const btnCloseOverlay = document.getElementById('close_batal_overlay');
    const btnAddSignature = document.getElementById('Tambahkan_tandatangan');
    const btnCancelConfirm = document.getElementById('Tambahkan_tandatangan_batal_overlay');
    const btnConfirm = document.getElementById('Tambahkan_tandatangan_confirmed');

    if (showSignatureBtn) {
        showSignatureBtn.addEventListener('click', async () => {
            try {
                // 1) Pastikan nobooking sudah dipilih
                if (!selectedNoBooking) {
                    alert('tidak bisa menandatangani dokumen disebabkan dokumen belum dipilih');
                    return;
                }

                // 2) Pastikan user sudah punya tanda tangan di profil
                const sigResp = await fetch('/api/v1/auth/peneliti/check-signature', { credentials: 'include' });
                const sigJson = await sigResp.json().catch(() => ({}));
                if (!sigResp.ok || !sigJson.has_signature) {
                    alert('Anda belum mengunggah tanda tangan di Profil. Silakan unggah terlebih dahulu.');
                    return;
                }

                // 3) Pastikan dokumen sudah disimpan/diatur (tercantum di pv_1_clear_to_paraf)
                const vResp = await fetch(`/api/validate-nobooking/${encodeURIComponent(selectedNoBooking)}`, { credentials: 'include' });
                const vJson = await vResp.json().catch(() => ({}));
                if (!vResp.ok || !vJson.success || !vJson.isValid) {
                    alert('tidak bisa menandatangani dokumen disebabkan dokumen belum diatur sebagai dokumen yang disetujui.');
                    return;
                }

                // 4) Semua valid → buka overlay konfirmasi penambahan tanda tangan
                if (overlay) {
                    overlay.style.display = 'flex';
                    if (overlayMsg) {
                        overlayMsg.textContent = `Dokumen Booking dengan No. Booking ${selectedNoBooking} telah dikirim oleh PPAT untuk verifikasi`;
                    }
                }
            } catch (err) {
                console.error('showSignatureModal error:', err);
                alert('Terjadi kesalahan saat memeriksa status dokumen.');
            }
        });
    }

    if (btnCloseOverlay && overlay) {
        btnCloseOverlay.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }

    if (btnAddSignature && overlayConfirmed) {
        btnAddSignature.addEventListener('click', () => {
            overlayConfirmed.style.display = 'flex';
        });
    }

    if (btnCancelConfirm && overlayConfirmed) {
        btnCancelConfirm.addEventListener('click', () => {
            overlayConfirmed.style.display = 'none';
        });
    }

    if (btnConfirm) {
        btnConfirm.addEventListener('click', async () => {
            try {
                if (!selectedNoBooking) {
                    throw new Error('Parameter nobooking diperlukan');
                }
                // Transfer tanda tangan profil ke dokumen yang sudah disetujui dan belum memiliki tanda tangan
                const resp = await fetch('/api/peneliti/transfer-signature', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nobooking: selectedNoBooking })
                });
                const json = await resp.json().catch(() => ({}));
                if (!resp.ok || json.success === false) {
                    throw new Error(json.message || 'Gagal menambahkan tanda tangan');
                }

                alert('Tanda tangan berhasil ditambahkan pada dokumen yang memenuhi syarat.');
            } catch (e) {
                console.error('transfer-signature error:', e);
                alert(`Gagal menandatangani dokumen: ${e.message}`);
            } finally {
                if (overlayConfirmed) overlayConfirmed.style.display = 'none';
                if (overlay) overlay.style.display = 'none';
            }
        });
    }
});