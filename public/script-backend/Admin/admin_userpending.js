document.addEventListener("DOMContentLoaded", async () => {
  // 1. Utility Functions
  const setLoading = (isLoading) => {
    document.getElementById('loadingIndicator').style.display = 
      isLoading ? 'block' : 'none';
  };

  const showError = (message) => {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => errorEl.style.display = 'none', 5000);
  };

  // 2. Configuration - Konsisten dengan backend
  const divisiOptions = {
    "PAT": "PPAT",
    "PATS": "PPATS",
    "A": "Administrator",
    "CS": "Customer Service",
    "LTB": "LTB",
    "LSB": "LSB",
    "P": "Peneliti",
    "PV": "Peneliti Validasi",
    "BANK": "BANK",
    "WP": "Wajib Pajak"
  };

  // 3. Load Initial Data
  try {
    setLoading(true);
    
    const [completeUsersResponse, pendingUsersResponse] = await Promise.all([
      fetch("/api/users/complete"),
      fetch("/api/users/pending")
    ]);
    
    if (!completeUsersResponse.ok || !pendingUsersResponse.ok) {
      throw new Error('Gagal memuat data pengguna');
    }

    const [completeUsers, pendingUsers] = await Promise.all([
      completeUsersResponse.json(),
      pendingUsersResponse.json()
    ]);

    // Pagination state
    let PENDING_PAGE_SIZE = 20;
    let currentPagePending = 1;

    const renderTable = (data, tableBodyId, isComplete = false) => {
      const tableBody = document.getElementById(tableBodyId);
      if (!tableBody) return;
      tableBody.innerHTML = data.map(user => `
        <tr>
          <td>${user.nama}</td>
          <td>${user.email}</td>
          <td>${user.nik}</td>
          <td>${user.telepon}</td>
          <td>${user.userid || '-'}</td>
          <td>${user.divisi || '-'}</td>
          <td>${user.ppatk_khusus || '-'}</td>
          <td>
            ${isComplete ? 'Selesai' : `
              <button class="showFormButton" data-email="${user.email}">
                Assign ID
              </button>`}
          </td>
        </tr>
      `).join('');
    };

    function renderPaginationControls(total, containerId, onPage) {
      const totalPages = Math.max(1, Math.ceil(total / PENDING_PAGE_SIZE));
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';
      if (totalPages <= 1) return;
      const mkBtn = (label, disabled, page) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.className = 'page-btn';
        if (disabled) b.disabled = true;
        b.addEventListener('click', () => onPage(page));
        return b;
      };
      container.appendChild(mkBtn('«', currentPagePending === 1, 1));
      container.appendChild(mkBtn('‹', currentPagePending === 1, currentPagePending - 1));
      const windowSize = 3;
      const start = Math.max(1, currentPagePending - windowSize);
      const end = Math.min(totalPages, currentPagePending + windowSize);
      for (let p = start; p <= end; p++) {
        const btn = mkBtn(String(p), false, p);
        if (p === currentPagePending) btn.classList.add('active');
        container.appendChild(btn);
      }
      container.appendChild(mkBtn('›', currentPagePending === totalPages, currentPagePending + 1));
      container.appendChild(mkBtn('»', currentPagePending === totalPages, totalPages));
    }

    function renderPendingPage(page) {
      const total = pendingUsers.length;
      const totalPages = Math.max(1, Math.ceil(total / PENDING_PAGE_SIZE));
      currentPagePending = Math.min(Math.max(1, page), totalPages);
      const startIdx = (currentPagePending - 1) * PENDING_PAGE_SIZE;
      const slice = pendingUsers.slice(startIdx, startIdx + PENDING_PAGE_SIZE);
      renderTable(slice, "pendingUsersTableBody");
      renderPaginationControls(total, 'paginationControlsPending', renderPendingPage);
    }

    renderPendingPage(1);

    // 5. Form Handling
    const userIDDropdown = document.getElementById("userIDDropdown");
    const userIDInput = document.getElementById("userIDInput");
    const divisiInput = document.getElementById("divisiInput");
    const ppatSpecialContainer = document.getElementById("ppatSpecialContainer");
    const urutKhusus = document.getElementById("urutKhusus");
    let currentEmail = '';

    // Isi dropdown divisi
    userIDDropdown.innerHTML = `
      <option value="-">Pilih Divisi</option>
      ${Object.entries(divisiOptions).map(([code, name]) => 
        `<option value="${code}">${name}</option>`
      ).join('')}
    `;

    // Tampilkan form ketika tombol Assign diklik
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('showFormButton')) {
        currentEmail = e.target.getAttribute('data-email');
        document.getElementById("userForm").classList.add("show");
        document.getElementById("userForm").scrollIntoView({ 
          behavior: 'smooth' 
        });
      }
    });

    // Handle perubahan divisi
    userIDDropdown.addEventListener('change', async function() {
      const selectedCode = this.value;
      
      // Reset form
      userIDInput.value = '';
      divisiInput.value = '';
      ppatSpecialContainer.style.display = 'none';
      urutKhusus.value = '';
      
      if (selectedCode === '-') return;

      try {
        setLoading(true);
        
        const response = await fetch("/api/users/generate-userid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ divisi: selectedCode })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Respon server tidak valid');
        }

        // Update form
        userIDInput.value = result.newUserID;
        divisiInput.value = divisiOptions[selectedCode];
        
        // Tampilkan field PPAT khusus jika diperlukan
        if (selectedCode === 'PAT' || selectedCode === 'PATS') {
          ppatSpecialContainer.style.display = 'block';
          urutKhusus.value = result.ppatk_khusus || '20001';
        }

      } catch (error) {
        console.error('Error:', error);
        showError(`Gagal generate ID: ${error.message}`);
        userIDDropdown.value = '-';
      } finally {
        setLoading(false);
      }
    });

    // Handle simpan
    document.getElementById("saveButton").addEventListener('click', async () => {
      if (!userIDInput.value || !divisiInput.value) {
        showError("Harap pilih UserID dan Divisi");
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch("/api/users/assign-userid-and-divisi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: currentEmail,
            divisi: userIDDropdown.value // Kirim kode divisi (PAT, A, CS, dll)
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.status || data.status !== 'success') {
          throw new Error(data.message || 'Respon server tidak valid');
        }

        // [PERBAIKAN 3] Tampilkan notifikasi sukses
        showSuccessNotification(data.message || 'Data berhasil disimpan');

        updateUserTable(currentEmail, {
          userid: data.user.userid,
          divisi: data.user.divisi,
          ppatk_khusus: data.user.ppatk_khusus,
          status: 'complete'
        });
        // Reload halaman untuk update data
        window.location.reload();

      } catch (error) {
        console.error('Error:', error);
        showError(`Gagal menyimpan: ${error.message}`);
      } finally {
        setLoading(false);
      }
    });

    // Handle batal
    document.getElementById("cancelButton").addEventListener('click', () => {
      document.getElementById("userForm").classList.remove("show");
    });

  } catch (error) {
    console.error("Error:", error);
    showError(`Terjadi kesalahan sistem: ${error.message}`);
  } finally {
    setLoading(false);
  }
});

// Fungsi baru untuk update UI
function updateUserTable(email, updatedData) {
  const row = document.querySelector(`button[data-email="${email}"]`)?.closest('tr');
  if (row) {
    row.cells[4].textContent = updatedData.userid || '-';
    row.cells[5].textContent = updatedData.divisi || '-';
    row.cells[6].textContent = updatedData.ppatk_khusus || '-';
    row.cells[7].innerHTML = 'Selesai';
  }
}

// Fungsi notifikasi sukses
function showSuccessNotification(message) {
  const successEl = document.createElement('div');
  successEl.className = 'notification success';
  successEl.textContent = message;
  document.body.appendChild(successEl);
  setTimeout(() => successEl.remove(), 3000);
}