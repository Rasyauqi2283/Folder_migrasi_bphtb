let selectedNoBooking = null;

async function loadTableLSB() {
    try {
        // Validate user division
        const userDivisi = getUserDivisi();
        if (typeof userDivisi !== 'string') {
            throw new Error('Invalid user division data');
        }

        if (userDivisi !== 'LSB') {
            alert('Anda tidak memiliki akses ke data LSB');
            return;
        }

	// Siapkan variabel data lebih awal untuk menghindari TDZ
	let data;
	// Fetch data with timeout + fallback endpoint
	let response;
	try {
		const endpoints = ['/api/LSB_berkas-complete', '/api/LSB_berkas_complete'];
		for (let i = 0; i < endpoints.length; i++) {
			try {
				response = await Promise.race([
					fetch(endpoints[i], { credentials: 'include' }),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout: Server took too long to respond')), 10000))
				]);
				if (response.ok) break;
				if (response.status === 404 && i < endpoints.length - 1) {
					continue; // coba alias berikutnya
				}
				if (response.status === 404) {
					// Tidak ada data: treat as empty list
					data = { success: true, data: [] };
					break;
				}
				if (response.status === 403) {
					throw new Error('Akses ditolak. Pastikan Anda login sebagai LSB.');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			} catch (inner) {
				if (i === endpoints.length - 1) throw inner;
			}
		}
	} catch (fetchError) {
		console.error('Fetch Error:', fetchError);
		throw new Error(`Gagal memuat data: ${fetchError.message}`);
	}
	// Parse JSON data
        try {
		if (!data) {
                data = await response.json();
            }
            
            console.log('📦 [LSB-Frontend] Received data:', {
                success: data?.success,
                dataLength: Array.isArray(data?.data) ? data.data.length : 'not an array',
                status: response.status
            });
            
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format received from server');
            }
            
			if (!data.success) {
                throw new Error(data.message || 'Server returned unsuccessful response');
            }
            
            if (!Array.isArray(data.data)) {
                console.error('❌ [LSB-Frontend] Data is not an array:', data);
                throw new Error('Expected array data not found in response');
            }
            
            console.log(`✅ [LSB-Frontend] Successfully parsed ${data.data.length} records`);
        } catch (parseError) {
            console.error('❌ [LSB-Frontend] Parse Error:', parseError);
            throw new Error(`Gagal memproses data: ${parseError.message}`);
        }

		// DOM refs
		const table = document.getElementById('LSBTable');
		const tbody = document.querySelector('.data-masuk');
		if (!tbody) throw new Error('Target table body element not found');
		// Ensure pagination container exists
		let pager = document.getElementById('paginationLSB');
		if (!pager) {
			pager = document.createElement('div');
			pager.id = 'paginationLSB';
			pager.className = 'pagination-container';
			// Insert after the table-scroll container
			const tableScroll = document.querySelector('.table-scroll');
			if (tableScroll && tableScroll.parentNode) {
				tableScroll.parentNode.insertBefore(pager, tableScroll.nextSibling);
			} else if (table && table.parentNode) {
				table.parentNode.appendChild(pager);
			}
		}

		const PAGE_SIZE = 5; // Changed to match Bank pagination
		let currentPage = 1;
		let totalPages = 1;
		let totalRecords = 0;
		// Filter out items that are already sent (trackstatus = 'Diserahkan')
		// Note: API sudah filter di backend, jadi seharusnya tidak ada item dengan trackstatus = 'Diserahkan'
		let allItems = Array.isArray(data.data) ? data.data.filter(item => {
			const track = String(item.trackstatus || '').toLowerCase();
			const shouldInclude = track !== 'diserahkan';
			if (!shouldInclude) {
				console.log(`⚠️ [LSB-Frontend] Filtering out item with trackstatus='Diserahkan':`, item.nobooking);
			}
			return shouldInclude;
		}) : [];
		
		console.log(`📊 [LSB-Frontend] Filtered items: ${allItems.length} (from ${data.data.length} total)`);
		totalRecords = allItems.length;
		totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

		function renderRows(items) {
			tbody.innerHTML = '';
			if (!items.length) {
				const emptyRow = tbody.insertRow();
				const emptyCell = emptyRow.insertCell(0);
				emptyCell.colSpan = 10;
				emptyCell.textContent = 'Tidak ada data';
				emptyCell.style.textAlign = 'center';
				emptyCell.style.color = '#6b7280';
				renderPagination(); // Still render pagination even if no data
				return;
			}
			items.forEach(item => {
				try {
					const row = tbody.insertRow();
					row.setAttribute('data-nobooking', item.nobooking || '');
					const displayValues = [
						item.nobooking || '-',
						item.noppbb || '-',
						item.tahunajb || '-',
						item.userid || '-',
						item.namawajibpajak || '-',
						item.namapemilikobjekpajak || '-',
						item.status || '-',
						item.trackstatus || '-',
						item.keterangan || '-'
					];
					displayValues.forEach((val, idx) => {
						const cell = row.insertCell(idx);
						cell.textContent = val;
					});

					// Action cell (Kirim)
					const actionCell = row.insertCell(9);
					const sendBtn = document.createElement('button');
					sendBtn.textContent = 'Kirim';
					sendBtn.className = 'btn-kirim-document';
					const statusOk = String(item.status||'').toLowerCase() === 'terselesaikan';
					const track = String(item.trackstatus||'');
					const alreadySent = /^diserahkan$/i.test(track);
					const canSend = statusOk && !alreadySent;
					if (!canSend) {
						sendBtn.disabled = true;
						sendBtn.title = alreadySent ? 'Sudah Diserahkan' : 'Belum Terselesaikan';
						sendBtn.textContent = alreadySent ? 'Terkirim' : 'Kirim';
					}
					sendBtn.addEventListener('click', async (ev) => {
						ev.stopPropagation();
						try {
							if (!confirm('Serahkan berkas ini ke PPAT/PPATS?')) return;
							sendBtn.disabled = true;
							sendBtn.textContent = 'Mengirim...';
                            const res = await sendToPPAT_complete({ nobooking: item.nobooking, keterangan: item.keterangan||'' });
							if (res && res.success) {
								// Remove item from allItems array
								allItems = allItems.filter(i => i.nobooking !== item.nobooking);
								
								// Update pagination
								totalRecords = allItems.length;
								totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
								
								// If current page is empty after removal, go to previous page
								if (allItems.length > 0 && (currentPage - 1) * PAGE_SIZE >= allItems.length && currentPage > 1) {
									currentPage--;
								}
								
								// Re-render with updated data (this will remove the row from UI)
								const start = (currentPage - 1) * PAGE_SIZE;
								const end = start + PAGE_SIZE;
								renderRows(allItems.slice(start, end));
								renderPagination();
								
                                try { if (window.playSendSound) window.playSendSound(); } catch(_) {}
							} else {
								throw new Error(res?.message || 'Gagal menyerahkan');
							}
						} catch (e) {
							alert(e.message);
							sendBtn.disabled = false;
							sendBtn.textContent = 'Kirim';
						}
					});
					actionCell.appendChild(sendBtn);

					const dropdownRow = document.createElement('tr');
					const dropdownContent = document.createElement('td');
					dropdownContent.colSpan = 10;
					dropdownContent.style.display = 'none';
					try {
						dropdownContent.innerHTML = generateDropdownContent(item);
					} catch (dropdownError) {
						console.error('Dropdown Creation Error:', dropdownError);
						dropdownContent.innerHTML = '<p>Gagal memuat detail data</p>';
					}
					dropdownRow.appendChild(dropdownContent);
					tbody.appendChild(dropdownRow);

					row.addEventListener('click', function() {
						try {
							selectedNoBooking = item.nobooking;
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
					const errorRow = tbody.insertRow();
					const errorCell = errorRow.insertCell(0);
					errorCell.colSpan = 10;
					errorCell.textContent = `Gagal memuat data item: ${itemError.message}`;
					errorCell.style.color = 'red';
				}
			});
		}

		function generatePageNumbers(maxPages = totalPages) {
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
				return `<button class="page-number ${isActive ? 'active' : ''}" onclick="goToPageLSB(${page})">${page}</button>`;
			}).join('');
		}

		function renderPagination() {
			pager.innerHTML = '';
			
			// Always show pagination if we have data and (totalPages > 1 OR current page > 1 OR we got full page)
			const hasData = tbody.children.length > 0;
			const gotFullPage = tbody.children.length === PAGE_SIZE;
			const shouldShowPagination = hasData && (totalPages > 1 || currentPage > 1 || gotFullPage);
			
			if (!shouldShowPagination) {
				return;
			}
			
			const pagination = document.createElement('div');
			pagination.className = 'pagination-controls';
			pagination.innerHTML = `
				<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPageLSB(${currentPage - 1})">
					<i class="fa fa-chevron-left"></i> Prev
				</button>
				<div class="page-numbers">
					${generatePageNumbers(totalPages)}
				</div>
				<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPageLSB(${currentPage + 1})">
					Next <i class="fa fa-chevron-right"></i>
				</button>
				<div class="page-info">
					Halaman ${currentPage} dari ${totalPages}${totalRecords > 0 ? ` (Total: ${totalRecords} data)` : ''}
				</div>
			`;
			
			pager.appendChild(pagination);
		}

		function goToPageLSB(page) {
			if (page < 1 || page === currentPage) return;
			if (page > totalPages) {
				console.warn('⚠️ [LSB] Page exceeds totalPages, but allowing navigation');
			}
			currentPage = Math.min(Math.max(1, page), totalPages);
			const start = (currentPage - 1) * PAGE_SIZE;
			const end = start + PAGE_SIZE;
			renderRows(allItems.slice(start, end));
			renderPagination();
			// Scroll to top of table
			const tableScroll = document.querySelector('.table-scroll');
			if (tableScroll) {
				tableScroll.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}

		// Make goToPageLSB globally available
		window.goToPageLSB = goToPageLSB;

		function goTo(page) {
			// Legacy function for backward compatibility
			goToPageLSB(page);
		}

		// initial render
		goToPageLSB(1);

	} catch (mainError) {
		console.error('Main Function Error:', mainError);
		// Render error sebagai baris tabel (bukan <div> di dalam <tbody>)
		const tbody = document.querySelector('.data-masuk');
		if (tbody) {
			tbody.innerHTML = '';
			const errorRow = tbody.insertRow();
			const errorCell = errorRow.insertCell(0);
			errorCell.colSpan = 10;
			errorCell.textContent = `Gagal memuat data: ${mainError.message}`;
		} else {
			alert(`Gagal memuat data: ${mainError.message}`);
		}
	}
}
function generateDropdownContent(item) {
    return `
        <div class="dropdown-content-wrapper">
            <!-- Document Info Section -->
            <div class="document-info-section">
                <p><strong>No. Registrasi:</strong> ${item.nobooking || 'N/A'}</p>
            </div>

            <!-- Download Section -->
            <div class="download-section">
                <h6 class="section-title">Unduh Dokumen Booking:</h6>
                <div class="document-links-list">
                    ${generateFileLink(item.file_booking_path, 'Dokumen Booking')}
                </div>
            </div>

            <!-- Upload Section -->
            <div class="upload-section">
                <h6 class="section-title">Upload File dengan Stempel:</h6>
                ${item.file_withstempel_path ? 
                    `<div class="uploaded-file-info">
                        <p><strong>File yang sudah di stempel:</strong></p>
                        <a href="${item.file_withstempel_path}" target="_blank" class="btn-view">${item.file_withstempel_path.split('/').pop()}</a>
                    </div>` : 
                    `<div class="file-upload-area">
                        <label for="FileStempel-${item.nobooking}">Upload File dengan stempel (PDF):</label>
                        <input type="file" id="FileStempel-${item.nobooking}" name="FileStempel" accept="application/pdf">
                    </div>`}
                
                <!-- Action Button -->
                <div class="action-buttons">
                    <button onclick="uploadFilesStempel('${item.nobooking}')" class="btn-upload-stempel">
                        <i class="fas fa-upload"></i> Upload Files (with stempel)
                    </button>
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
document.querySelectorAll('#LSBTable tbody tr').forEach(row => {
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
localStorage.setItem('divisi', 'LSB');
// Atau
sessionStorage.setItem('divisi', 'LSB');
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
/////////////////////////////////////////////

////////////////////// END VN   ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
            const pdfUrl = `/api/validasi_lanjutan-generate-pdf-bookingsspd/${encodeURIComponent(nobooking)}?userid=${encodeURIComponent(creatorUserid)}&nama=${encodeURIComponent(data.nama)}`;

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

//
// Fungsi untuk mengirim data ke peneliti
async function sendToPPAT_complete(item) {
    try {
        const response = await fetch('/api/LSB_send-to-ppat', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nobooking: item.nobooking,
                userid: item.userid,
                namawajibpajak: item.namawajibpajak,
                namapemilikobjekpajak: item.namapemilikobjekpajak,
                tanggal_terima: item.tanggal_terima,
                status: 'Terselesaikan',  // Status yang dikirim dari frontend
                trackstatus: 'Diserahkan',  // Trackstatus yang dikirim dari frontend
                keterangan: item.keterangan,
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Data berhasil dikirim ke PPAT Terkait!');
        } else {
            alert('Gagal mengirim data ke PPAT Terkait.');
        }
        return result;
    } catch (error) {
        console.error('Error sending data to PPAT:', error);
        alert('Terjadi kesalahan saat mengirim data.');
    }
}
////

  ///
// Expose function to global scope for real-time script
window.loadLSBData = loadTableLSB;
window.onload = loadTableLSB;