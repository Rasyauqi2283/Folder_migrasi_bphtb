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
            
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format received from server');
            }
            
			if (!data.success) {
                throw new Error(data.message || 'Server returned unsuccessful response');
            }
            
            if (!Array.isArray(data.data)) {
                throw new Error('Expected array data not found in response');
            }
        } catch (parseError) {
            console.error('Parse Error:', parseError);
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
			pager.style.marginTop = '12px';
			pager.style.display = 'flex';
			pager.style.justifyContent = 'space-between';
			pager.style.alignItems = 'center';
			table.parentNode.appendChild(pager);
		}

		const PAGE_SIZE = 10;
		let currentPage = 1;
		const allItems = Array.isArray(data.data) ? data.data : [];

		function renderRows(items) {
			tbody.innerHTML = '';
			if (!items.length) {
				const emptyRow = tbody.insertRow();
				const emptyCell = emptyRow.insertCell(0);
				emptyCell.colSpan = 10;
				emptyCell.textContent = 'Tidak ada Data masuk, 0 to 0 Data Pages';
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
								// Update UI
								row.cells[7].textContent = 'Diserahkan';
								sendBtn.textContent = 'Terkirim';
								sendBtn.title = 'Sudah Diserahkan';
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

		function renderPagination(total, pageSize, page) {
			const totalPages = Math.max(1, Math.ceil(total / pageSize));
			pager.innerHTML = '';
			const info = document.createElement('div');
			const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
			const end = Math.min(total, page * pageSize);
			info.textContent = `Showing ${start} to ${end} of ${total} entries`;
			const controls = document.createElement('div');
			controls.style.display = 'flex';
			controls.style.gap = '8px';
			function mkBtn(label, disabled, onClick) {
				const btn = document.createElement('button');
				btn.textContent = label;
				btn.disabled = !!disabled;
				btn.addEventListener('click', onClick);
				return btn;
			}
			controls.appendChild(mkBtn('<', page <= 1, () => goTo(page - 1)));
			for (let p = 1; p <= totalPages; p++) {
				const b = mkBtn(String(p), p === page, () => goTo(p));
				if (p === page) b.style.fontWeight = '700';
				controls.appendChild(b);
			}
			controls.appendChild(mkBtn('>', page >= totalPages, () => goTo(page + 1)));
			pager.appendChild(info);
			pager.appendChild(controls);
		}

		function goTo(page) {
			const total = allItems.length;
			const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
			currentPage = Math.min(Math.max(1, page), totalPages);
			const start = (currentPage - 1) * PAGE_SIZE;
			const end = start + PAGE_SIZE;
			renderRows(allItems.slice(start, end));
			renderPagination(total, PAGE_SIZE, currentPage);
		}

		// initial render
		goTo(1);

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
        <p>No. registrasi: ${item.nobooking}</p>
        <br />
        <!--File complete di unduh dan di upload-->
        <p>Unduh dokumen ini (Dokumen Booking)</p>
        <div id="file-info-${item.nobooking}">
            ${generateFileLink(item.file_booking_path, 'Dokumen Booking')}
        </div>
        <p>Upload Files yang di unduh serta sudah diberikan stempel, letakkan disini</p>
        ${item.file_withstempel_path ? 
            `<p>File yang sudah di stempel: <a href="${item.file_withstempel_path}" target="_blank">${item.file_withstempel_path.split('/').pop()}</a></p>` : 
            `<label for="FileStempel-${item.nobooking}">Upload File dengan stempel (PDF):</label>
            <input type="file" id="FileStempel-${item.nobooking}" name="FileStempel" accept="application/pdf"><br>`}
        <button onclick="uploadFilesStempel('${item.nobooking}')">Upload Files (with stempel)</button>

    `;

}
function generateFileLink(path, label) {
    return path ? 
        `<p>${label}: <a href="${path}" target="_blank"><button class="btn-view">View</button></a></p>` : '';
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
                trackstatus: 'Terselesaikan',  // Trackstatus yang dikirim dari frontend
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
window.onload = loadTableLSB;