let selectedNoBooking = null;
// Fungsi untuk memuat data ke dalam tabel
async function loadTableDataLTB() {
    try {
        console.log('🔍 [FRONTEND] ===== LTB LOADING =====');
        console.log('🔍 [FRONTEND] Timestamp:', new Date().toISOString());
        console.log('🔍 [FRONTEND] URL:', window.location.href);

        const userDivisi = getUserDivisi();
        console.log('🔍 [FRONTEND] User division check:', {
            userDivisi: userDivisi,
            userDivisiType: typeof userDivisi,
            isString: typeof userDivisi === 'string',
            isLTB: userDivisi === 'LTB'
        });

        // Cek apakah divisi adalah LTB
        if (userDivisi !== 'LTB') {
            console.log('❌ [FRONTEND] Invalid divisi:', userDivisi);
            alert('Anda tidak memiliki akses ke data LTB.');
            return;  // Menghentikan eksekusi jika divisi bukan LTB
        }

        console.log('✅ [FRONTEND] User division validated, proceeding with API call...');
        console.log('🔍 [FRONTEND] Making API request to /api/ltb_get-ltb-berkas...');
        console.log('🔍 [FRONTEND] Request details:', {
            url: '/api/ltb_get-ltb-berkas',
            credentials: 'include',
            timestamp: new Date().toISOString()
        });

        const response = await fetch('/api/ltb_get-ltb-berkas', { credentials: 'include' }); // Endpoint API untuk mendapatkan data berkas LTB
        
        console.log('📡 [FRONTEND] Raw HTTP Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            contentType: response.headers.get('content-type')
        });

        // Check if response is OK before parsing
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [FRONTEND] HTTP Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Try to parse JSON
        let data;
        try {
            const responseText = await response.text();
            console.log('📄 [FRONTEND] Response text (first 500 chars):', responseText.substring(0, 500));
            
            data = JSON.parse(responseText);
            console.log('✅ [FRONTEND] JSON parsed successfully');
        } catch (parseError) {
            console.error('❌ [FRONTEND] JSON Parse Error:', {
                error: parseError.message,
                stack: parseError.stack
            });
            throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }

        console.log('✅ [FRONTEND] API response received:', {
            success: data.success,
            dataLength: Array.isArray(data.data) ? data.data.length : 0,
            dataType: typeof data.data,
            hasData: !!data.data,
            isArray: Array.isArray(data.data),
            debug: data.debug || 'No debug info',
            fullResponseKeys: Object.keys(data),
            firstDataItem: Array.isArray(data.data) && data.data.length > 0 ? {
                keys: Object.keys(data.data[0]),
                sample: data.data[0]
            } : 'No data items'
        });

        if (data.success) {
            console.log('✅ [FRONTEND] Success response received, processing data...');
            console.log('📊 [FRONTEND] Data structure analysis:', {
                hasData: !!data.data,
                isArray: Array.isArray(data.data),
                dataLength: Array.isArray(data.data) ? data.data.length : 'Not an array',
                dataType: typeof data.data,
                debugInfo: data.debug || 'No debug info'
            });
            
            const tbody = document.querySelector('.data-masuk');
            if (!tbody) {
                console.error('❌ [FRONTEND] Table body element not found!');
                console.error('❌ [FRONTEND] Searching for selector: .data-masuk');
                console.error('❌ [FRONTEND] Available tbody elements:', document.querySelectorAll('tbody'));
                throw new Error('Table body element not found');
            }
            console.log('✅ [FRONTEND] Table body found:', {
                element: tbody,
                tagName: tbody.tagName,
                className: tbody.className,
                id: tbody.id,
                parentElement: tbody.parentElement?.tagName
            });

            // Pagination setup
            const PAGE_SIZE = 8;
            const rows = Array.isArray(data.data) ? data.data : [];
            let currentPage = 1;
            let totalPages = 1;
            let totalRecords = rows.length;

            console.log('📊 [FRONTEND] Data processing:', {
                pageSize: PAGE_SIZE,
                totalRows: rows.length,
                rowsType: Array.isArray(rows) ? 'Array' : typeof rows,
                rowsIsArray: Array.isArray(rows),
                rowsConstructor: rows.constructor?.name,
                firstRowSample: rows.length > 0 ? {
                    no_registrasi: rows[0].no_registrasi,
                    nobooking: rows[0].nobooking,
                    noppbb: rows[0].noppbb,
                    namawajibpajak: rows[0].namawajibpajak,
                    trackstatus: rows[0].trackstatus,
                    status: rows[0].status,
                    allKeys: Object.keys(rows[0])
                } : 'No data',
                allRowsPreview: rows.length > 0 ? rows.slice(0, 3).map((r, i) => ({
                    index: i,
                    no_registrasi: r.no_registrasi,
                    nobooking: r.nobooking,
                    trackstatus: r.trackstatus,
                    status: r.status
                })) : []
            });

            if (rows.length === 0) {
                console.warn('⚠️ [FRONTEND] No rows to display!');
                console.warn('⚠️ [FRONTEND] This could mean:');
                console.warn('  1. Database query returned no results');
                console.warn('  2. WHERE clause filters are too strict');
                console.warn('  3. Data structure mismatch');
                console.warn('⚠️ [FRONTEND] Check backend logs for query results');
            }

            function renderPage(page) {
                // Update totalPages and totalRecords
                totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
                totalRecords = rows.length;
                
                console.log(`📄 [PAGINATION] Rendering page ${page}:`, {
                    start: (page - 1) * PAGE_SIZE,
                    end: (page - 1) * PAGE_SIZE + PAGE_SIZE,
                    totalRows: rows.length,
                    totalPages: totalPages,
                    totalRecords: totalRecords
                });
                
                currentPage = page;
                tbody.innerHTML = '';
                const start = (page - 1) * PAGE_SIZE;
                const end = start + PAGE_SIZE;
                const pageRows = rows.slice(start, end);

                console.log(`📄 [PAGINATION] Page data:`, {
                    pageRowsLength: pageRows.length,
                    pageRowsSample: pageRows.slice(0, 2).map(item => ({
                        no_registrasi: item.no_registrasi,
                        nobooking: item.nobooking,
                        noppbb: item.noppbb,
                        namawajibpajak: item.namawajibpajak,
                        trackstatus: item.trackstatus
                    }))
                });

                pageRows.forEach((item, index) => {
                    try {
                        console.log(`🔧 [ROW ${index + 1}] Processing item:`, {
                            no_registrasi: item.no_registrasi,
                            nobooking: item.nobooking,
                            noppbb: item.noppbb,
                            namawajibpajak: item.namawajibpajak,
                            namapemilikobjekpajak: item.namapemilikobjekpajak,
                            tanggal_terima: item.tanggal_terima,
                            trackstatus: item.trackstatus,
                            status: item.status
                        });

                        // Check for critical null values
                        const criticalFields = ['no_registrasi', 'nobooking', 'noppbb', 'namawajibpajak'];
                        const nullFields = criticalFields.filter(field => !item[field]);
                        if (nullFields.length > 0) {
                            console.warn(`⚠️ [ROW ${index + 1}] Missing critical fields:`, nullFields);
                        }

                        const row = tbody.insertRow();
                        console.log(`🔧 [ROW ${index + 1}] Row created, inserting cells...`);

                // Menambahkan data ke dalam setiap sel
                row.insertCell(0).textContent = item.no_registrasi || 'N/A';
                row.insertCell(1).textContent = item.nobooking || 'N/A';
                row.insertCell(2).textContent = item.noppbb || 'N/A';
                row.insertCell(3).textContent = item.namawajibpajak || 'N/A';
                row.insertCell(4).textContent = item.namapemilikobjekpajak || 'N/A';
                row.insertCell(5).textContent = item.tanggal_terima || 'N/A';
                row.insertCell(6).textContent = item.trackstatus || 'N/A';

                console.log(`🔧 [ROW ${index + 1}] Cells inserted:`, {
                    no_registrasi: item.no_registrasi || 'N/A',
                    nobooking: item.nobooking || 'N/A',
                    noppbb: item.noppbb || 'N/A',
                    namawajibpajak: item.namawajibpajak || 'N/A',
                    namapemilikobjekpajak: item.namapemilikobjekpajak || 'N/A',
                    tanggal_terima: item.tanggal_terima || 'N/A',
                    trackstatus: item.trackstatus || 'N/A'
                });

                // Kolom Keterangan, ditambah dengan tombol "View Document"
                const sendCell = row.insertCell(7);
                const sendButton = document.createElement('button');
                sendButton.textContent = 'Kirim';
                sendButton.classList.add('btn-kirim-document'); // Berikan kelas CSS untuk styling (optional)
                
                console.log(`🔧 [ROW ${index + 1}] Button created and added to cell`);
                // Menambahkan event listener pada tombol
                sendButton.addEventListener('click', async () => {
                    const confirmation = window.confirm("Apakah kamu yakin ingin mengirim data ini? Sudah diperiksa?");

                    if (confirmation) {
                        // Validasi data yang diperlukan - gunakan userid_ppat jika userid tidak ada
                        const useridToUse = item.userid_ppat || item.userid;
                        if (!item || !item.nobooking || !useridToUse || !item.no_registrasi) {
                            console.error('❌ [KIRIM] Data tidak lengkap:', {
                                nobooking: item?.nobooking,
                                userid: useridToUse,
                                no_registrasi: item?.no_registrasi,
                                userid_ppat: item?.userid_ppat,
                                allKeys: item ? Object.keys(item) : []
                            });
                            alert("Data yang diperlukan tidak lengkap. Pastikan No. Booking, No. Registrasi, dan User ID tersedia.");
                            return;
                        }
                        // Jika pengguna mengklik "OK", maka kirim data
                        try {
                            // Pastikan userid ada di item
                            const itemWithUserid = { ...item, userid: useridToUse };
                            const result = await sendToPeneliti(itemWithUserid);
                            if (result.success) {
                                // Ubah status tombol setelah sukses (misalnya menonaktifkan tombol)
                                sendButton.disabled = true;
                                sendButton.textContent = 'Data Terkirim';
                                try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
                                showAlert('success', "Data berhasil dikirim ke peneliti!");
                            } else {
                                showAlert('error', `Gagal mengirim data ke peneliti: ${result.message || 'Terjadi kesalahan'}`);
                            }
                        } catch (error) {
                            console.error("❌ [KIRIM] Terjadi kesalahan:", error);
                            showAlert('error', `Terjadi kesalahan saat mengirim data: ${error.message}`);
                        }
                    } else {
                        // Jika pengguna mengklik "Batal", tampilkan notifikasi
                        showAlert('info', "Data tidak jadi dikirim.");
                    }
                });
                
                // Menambahkan tombol ke dalam sel di tabel
                sendCell.appendChild(sendButton);

                // Membuat dropdown row di bawah baris ini
                const dropdownRow = document.createElement('tr');
                const dropdownContent = document.createElement('td');
                dropdownContent.colSpan = 8;
                dropdownContent.style.display = 'none'; // Dropdown akan disembunyikan pertama kali
                dropdownContent.innerHTML = `
                    <div class="dropdown-content-wrapper">
                        <!-- Document Info Section -->
                        <div class="document-info-section">
                            <p><strong>No. Booking:</strong> ${item.nobooking || 'N/A'}</p>
                            <p><strong>Status:</strong> ${item.status || 'N/A'}</p>
                            <p><strong>Nama Wajib Pajak:</strong> ${item.namawajibpajak || 'N/A'}</p>
                            <p><strong>Nama Pemilik Objek:</strong> ${item.namapemilikobjekpajak || 'N/A'}</p>
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
                
                dropdownRow.appendChild(dropdownContent);

                // Menambahkan event listener untuk klik pada baris tabel
                row.addEventListener('click', function() {
                    enableViewDocumentButton(item.nobooking);
                    selectedNoBooking = item.nobooking;
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
                });

                // Menambahkan baris dropdown ke dalam tabel
                tbody.appendChild(dropdownRow);
                console.log(`🔧 [ROW ${index + 1}] Row and dropdown completed`);
                
                    } catch (itemError) {
                        console.error(`❌ [ROW ${index + 1}] Error processing item:`, itemError);
                        // Create error row
                        const errorRow = tbody.insertRow();
                        const errorCell = errorRow.insertCell(0);
                        errorCell.colSpan = 8;
                        errorCell.textContent = `Error loading data: ${itemError.message}`;
                        errorCell.style.color = '#ef4444';
                        errorCell.style.textAlign = 'center';
                    }
                });
                
                console.log(`✅ [PAGINATION] Page ${page} rendered successfully`);
                renderPagination();
            }

            function renderPagination() {
                totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
                totalRecords = rows.length;
                
                const container = document.getElementById('ltbPagination');
                if (!container) {
                    console.warn('⚠️ [LTB] Pagination container not found!');
                    return;
                }
                
                container.innerHTML = '';
                
                // Always show pagination if we have data and (totalPages > 1 OR current page > 1 OR we got full page)
                const hasData = tbody.children.length > 0;
                const gotFullPage = tbody.children.length === PAGE_SIZE;
                const shouldShowPagination = hasData && (totalPages > 1 || currentPage > 1 || gotFullPage);
                
                if (!shouldShowPagination) {
                    console.log('📄 [LTB] Pagination not shown:', {
                        hasData,
                        totalPages,
                        currentPage,
                        rowCount: tbody.children.length,
                        pageSize: PAGE_SIZE,
                        gotFullPage
                    });
                    return;
                }
                
                console.log('📄 [LTB] Rendering pagination:', {
                    totalPages,
                    currentPage,
                    totalRecords,
                    rowCount: tbody.children.length
                });
                
                // Ensure totalPages is at least currentPage + 1 if we got full page
                const displayTotalPages = Math.max(totalPages, gotFullPage ? currentPage + 1 : currentPage);
                const displayTotalRecords = totalRecords > 0 ? totalRecords : (displayTotalPages * PAGE_SIZE);
                
                const pagination = document.createElement('div');
                pagination.className = 'pagination-controls';
                pagination.innerHTML = `
                    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPageLTB(${currentPage - 1})">
                        <i class="fa fa-chevron-left"></i> Prev
                    </button>
                    <div class="page-numbers">
                        ${generatePageNumbersLTB(displayTotalPages)}
                    </div>
                    <button class="page-btn" ${currentPage >= displayTotalPages ? 'disabled' : ''} onclick="goToPageLTB(${currentPage + 1})">
                        Next <i class="fa fa-chevron-right"></i>
                    </button>
                    <div class="page-info">
                        Halaman ${currentPage} dari ${displayTotalPages}${totalRecords > 0 ? ` (Total: ${totalRecords} data)` : ''}
                    </div>
                `;
                
                container.appendChild(pagination);
            }
            
            function generatePageNumbersLTB(maxPages = totalPages) {
                let pages = [];
                const maxVisible = 5; // Maximum visible page numbers
                const effectiveTotalPages = Math.max(maxPages, totalPages, currentPage);
                
                if (effectiveTotalPages <= maxVisible) {
                    // Show all pages if total pages is small
                    for (let i = 1; i <= effectiveTotalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    // Show pages with ellipsis
                    if (currentPage <= 3) {
                        // Show first pages
                        for (let i = 1; i <= 4; i++) {
                            pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(effectiveTotalPages);
                    } else if (currentPage >= effectiveTotalPages - 2) {
                        // Show last pages
                        pages.push(1);
                        pages.push('ellipsis');
                        for (let i = effectiveTotalPages - 3; i <= effectiveTotalPages; i++) {
                            pages.push(i);
                        }
                    } else {
                        // Show middle pages
                        pages.push(1);
                        pages.push('ellipsis');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i);
                        }
                        pages.push('ellipsis');
                        pages.push(effectiveTotalPages);
                    }
                }
                
                return pages.map(page => {
                    if (page === 'ellipsis') {
                        return '<span class="page-ellipsis">...</span>';
                    }
                    const isActive = page === currentPage;
                    return `<button class="page-number ${isActive ? 'active' : ''}" onclick="goToPageLTB(${page})">${page}</button>`;
                }).join('');
            }
            
            function goToPageLTB(page) {
                if (page < 1 || page === currentPage) return;
                // Allow going to next page even if totalPages is not known yet
                if (totalPages > 0 && page > totalPages) {
                    console.warn('⚠️ [LTB] Page exceeds totalPages, but allowing navigation');
                }
                renderPage(page);
                // Scroll to top of table
                const table = document.querySelector('.table-scroll') || document.querySelector('table');
                if (table) {
                    table.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            
            // Make goToPageLTB globally available
            window.goToPageLTB = goToPageLTB;

            // Search/filter
            const searchInput = document.getElementById('ltbSearch');
            console.log('🔍 [SEARCH] Search input element:', {
                found: !!searchInput,
                element: searchInput
            });
            
            window.filterTableLTB = function () {
                const q = (searchInput?.value || '').toLowerCase();
                console.log('🔍 [SEARCH] Filtering with query:', q);
                
                const filtered = rows.filter((r) => {
                    return (
                        String(r.no_registrasi || '').toLowerCase().includes(q) ||
                        String(r.nobooking || '').toLowerCase().includes(q) ||
                        String(r.noppbb || '').toLowerCase().includes(q) ||
                        String(r.namawajibpajak || '').toLowerCase().includes(q) ||
                        String(r.namapemilikobjekpajak || '').toLowerCase().includes(q) ||
                        String(r.trackstatus || '').toLowerCase().includes(q)
                    );
                });
                
                console.log('🔍 [SEARCH] Filter results:', {
                    originalCount: rows.length,
                    filteredCount: filtered.length,
                    query: q
                });
                
                // Re-render with filtered dataset
                const backup = rows.slice();
                rows.length = 0; Array.prototype.push.apply(rows, filtered);
                renderPage(1);
                // Restore rows for future filter clears
                rows.length = 0; Array.prototype.push.apply(rows, backup);
            }

            console.log('🚀 [FRONTEND] Starting initial page render...');
            renderPage(1);
            console.log('✅ [FRONTEND] Initial render completed');
        } else {
            console.log('❌ [FRONTEND] API returned success: false');
            console.log('❌ [FRONTEND] Response data:', data);
            console.log('❌ [FRONTEND] Full response object:', JSON.stringify(data, null, 2));
            console.log('❌ [FRONTEND] Response keys:', Object.keys(data));
            alert(`No data available. ${data.message || 'Please check console for details.'}`);
        }
    } catch (error) {
        console.error('❌ [FRONTEND] Main Function Error:', error);
        console.error('❌ [FRONTEND] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause,
            timestamp: new Date().toISOString()
        });
        console.error('❌ [FRONTEND] Error occurred at:', {
            url: window.location.href,
            userAgent: navigator.userAgent,
            divisi: getUserDivisi()
        });
        alert(`An error occurred while fetching data: ${error.message}`);
    }
}

function getUserDivisi() {
    // Ensure LTB divisi is set for LTB pages
    const divisi = localStorage.getItem('divisi') || sessionStorage.getItem('divisi');
    if (!divisi) {
        localStorage.setItem('divisi', 'LTB');
        return 'LTB';
    }
    return divisi;
}

// Initialize LTB divisi
localStorage.setItem('divisi', 'LTB');
// Menambahkan event listener untuk setiap baris dalam tabel
document.querySelectorAll('#ltbBerkasTable tbody tr').forEach(row => {
    row.addEventListener('click', function() {
        // Mendapatkan nilai noBooking dari kolom pertama
        selectedNoBooking = row.cells[0].textContent.trim();  // Kolom pertama adalah No. Booking
        console.log(`No Booking yang dipilih: ${selectedNoBooking}`);  // Debugging
    });
});
///
//
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
            // Gunakan endpoint yang sesuai dengan backend (ppat_)
            const pdfUrl = `/api/ppat_generate-pdf-badan/${encodeURIComponent(nobooking)}?userid=${encodeURIComponent(creatorUserid)}&nama=${encodeURIComponent(data.nama)}`;

            // Jika response sukses, buka PDF
            window.open(pdfUrl, '_blank');
        } else {
            alert('Gagal memuat dokumen PDF SSPD.');
        }
    } catch (error) {
        console.error('Error fetching the PDF:', error);
        alert('Terjadi kesalahan saat mengambil dokumen PDF.');
    }
}
////////////    ///////////////////////////
async function viewPDF(nobooking) {
    // Validasi nobooking
    if (!nobooking) {
        alert('No Booking tidak valid!');
        return;
    }

    // Ambil user credentials
    const userid = sessionStorage.getItem('userid') || localStorage.getItem('userid');
    const nama = sessionStorage.getItem('nama') || localStorage.getItem('nama');

    if (!userid || !nama) {
        alert('User ID atau Nama tidak ditemukan.');
        return;
    }

    try {
        // 1. Fetch data creator
        const creatorResponse = await fetch(`/api/getCreatorMohonValidasi/${encodeURIComponent(nobooking)}`, { credentials: 'include' });
        
        if (!creatorResponse.ok) {
            const errorData = await creatorResponse.json().catch(() => null);
            throw new Error(errorData?.error || 'Gagal memuat data pembuat dokumen');
        }

        const { success, data, error } = await creatorResponse.json();
        if (!success || !data?.userid) {
            throw new Error(error || 'Data pembuat tidak valid');
        }

        // 2. Siapkan URL PDF dengan parameter title
        const pdfTitle = `Permohonan Validasi ${nobooking}`;
        const pdfUrl = `/api/ppat/generate-pdf-mohon-validasi/${
            encodeURIComponent(nobooking)
        }?userid=${
            encodeURIComponent(data.userid)
        }&nama=${
            encodeURIComponent(data.nama)
        }&title=${
            encodeURIComponent(pdfTitle)
        }#title=${encodeURIComponent(pdfTitle)}`;

        // 3. Buka PDF dengan tiga lapis solusi:
        // - Solusi #3: Iframe dengan judul custom (paling reliable)
        const pdfViewerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${pdfTitle}</title>
            <style>body,embed{margin:0;padding:0;overflow:hidden;height:100vh;width:100%}</style>
        </head>
        <body>
            <embed 
                src="${pdfUrl}" 
                type="application/pdf" 
                width="100%" 
                height="100%" 
            />
        </body>
        </html>`;

        const newWindow = window.open('', '_blank');
        
        // Fallback untuk browser yang memblokir document.write
        try {
            newWindow.document.write(pdfViewerHTML);
            newWindow.document.close();
        } catch (e) {
            console.warn('Gagal menggunakan iframe, fallback ke direct open');
            newWindow.location.href = pdfUrl;
            newWindow.document.title = pdfTitle;
        }

    } catch (error) {
        console.error('Error:', error);
        alert(`Gagal memuat dokumen: ${error.message}`);
    }
}
////////////////////////           /////////////////////////
// Fungsi untuk mengonfirmasi penolakan dengan auto-delete
async function confirmReject() {
    const rejectionReason = document.getElementById('rejectionReason').value;
    if (!rejectionReason) {
        alert('Harap masukkan alasan penolakan!');
        return;
    }

    // Pastikan noBooking yang dipilih ada
    if (!selectedNoBooking) {
        alert('Silakan pilih dokumen yang akan ditolak.');
        return;
    }

    const userid = localStorage.getItem('userid') || sessionStorage.getItem('userid'); // Ambil userId yang valid

    if (!userid) {
        alert('User ID tidak ditemukan!');
        return;
    }
    
    try {
        console.log('🔍 [TOLAK] Starting rejection process:', {
            nobooking: selectedNoBooking,
            userid: userid,
            hasReason: !!rejectionReason
        });
        
        // Kirim data penolakan ke backend
        const response = await fetch('/api/ltb_ltb-reject', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nobooking: selectedNoBooking,
                trackstatus: 'Ditolak',
                rejectionReason: rejectionReason,
                userid: userid
            })
        });
        
        console.log('📡 [TOLAK] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [TOLAK] HTTP Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ [TOLAK] Rejection response:', data);
        
        if (data.success) {
            alert(`Dokumen berhasil ditolak.\n${data.message || 'Data telah dihapus dari sistem.'}`);
            // Menutup overlay setelah konfirmasi
            document.getElementById('overlay').style.display = 'none';
            // Reload halaman untuk refresh data
            location.reload();
        } else {
            alert(`Gagal menolak dokumen: ${data.message || 'Terjadi kesalahan'}`);
        }
        
    } catch (error) {
        console.error('❌ [TOLAK] Terjadi kesalahan:', error);
        console.error('❌ [TOLAK] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert(`Terjadi kesalahan saat menolak dokumen: ${error.message || 'Coba lagi nanti.'}`);
    }
}

function showRejectOverlay() {
    document.getElementById('overlay').style.display = 'flex';  // Menampilkan overlay
}
function cancelReject() {
    document.getElementById('overlay').style.display = 'none';  // Menutup overlay
}
document.getElementById('tolakdokument').addEventListener('click', showRejectOverlay);

// Fungsi untuk mengirim data ke peneliti
async function sendToPeneliti(item) {
    try {
        console.log('🔍 [KIRIM] Starting send to peneliti:', {
            nobooking: item.nobooking,
            no_registrasi: item.no_registrasi,
            userid: item.userid,
            userid_ppat: item.userid_ppat,
            allKeys: Object.keys(item)
        });

        const namaPengirim = sessionStorage.getItem('nama') || localStorage.getItem('nama');
        
        // Gunakan userid_ppat jika userid tidak ada (untuk kompatibilitas)
        const useridToSend = item.userid_ppat || item.userid;
        
        if (!useridToSend) {
            throw new Error('User ID tidak ditemukan. Pastikan data lengkap.');
        }

        if (!item.no_registrasi) {
            throw new Error('No. Registrasi tidak ditemukan. Pastikan data lengkap.');
        }

        if (!item.nobooking) {
            throw new Error('No. Booking tidak ditemukan. Pastikan data lengkap.');
        }

        const requestBody = {
            no_registrasi: item.no_registrasi,
            nobooking: item.nobooking,
            userid: useridToSend,
            nama_pengirim: namaPengirim,
            namawajibpajak: item.namawajibpajak || '',
            namapemilikobjekpajak: item.namapemilikobjekpajak || '',
            tanggal_terima: item.tanggal_terima || new Date().toISOString().split('T')[0],
            status: 'Diajukan',
            trackstatus: 'Dilanjutkan',
            pengirim_ltb: `Dikirim oleh: ${namaPengirim} Loket Terima Berkas`
        };

        console.log('📤 [KIRIM] Sending request:', requestBody);

        const response = await fetch('/api/ltb_send-to-peneliti', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 [KIRIM] Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [KIRIM] HTTP Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ [KIRIM] Response data:', result);
        
        if (result.success) {
            alert('Data berhasil dikirim ke peneliti!');
            window.location.reload(); 
        } else {
            alert(`Gagal: ${result.message || 'Terjadi kesalahan'}`);
        }
        return result;

    } catch (error) {
        console.error('❌ [KIRIM] Error:', error);
        console.error('❌ [KIRIM] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert(`Koneksi gagal: ${error.message || 'Coba lagi atau hubungi admin.'}`);
        throw error;
    }
}

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

// Expose function globally for real-time monitoring
window.loadLTBData = loadTableDataLTB;
window.loadTableDataLTB = loadTableDataLTB;

// Auto-load on page load
window.onload = loadTableDataLTB;