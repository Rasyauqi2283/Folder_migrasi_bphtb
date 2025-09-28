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

  // Global variables untuk data users
  let pendingUsers = [];
  let completeUsers = [];
  let currentEmail = '';
  let currentUserName = '';
  let currentUserEmail = '';

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

    const [completeUsersData, pendingUsersData] = await Promise.all([
      completeUsersResponse.json(),
      pendingUsersResponse.json()
    ]);
    
    // Assign to global variables
    completeUsers = completeUsersData;
    pendingUsers = pendingUsersData;
    
    console.log('📊 Loaded pending users:', pendingUsers);
    console.log('📊 Loaded complete users:', completeUsers);

    // Initialize Preview KTP button as disabled
    const previewButton = document.querySelector('.btn-preview');
    console.log('🔍 Initial preview button check:', previewButton);
    
    if (previewButton) {
      previewButton.disabled = true;
      previewButton.style.opacity = '0.5';
      previewButton.style.cursor = 'not-allowed';
      previewButton.textContent = 'Preview KTP (Pilih user terlebih dahulu)';
      console.log('✅ Preview button initialized as disabled');
    } else {
      console.error('❌ Preview button not found during initialization');
      // Try again after a short delay
      setTimeout(() => {
        const retryButton = document.querySelector('.btn-preview');
        if (retryButton) {
          retryButton.disabled = true;
          retryButton.style.opacity = '0.5';
          retryButton.style.cursor = 'not-allowed';
          retryButton.textContent = 'Preview KTP (Pilih user terlebih dahulu)';
          console.log('✅ Preview button initialized on retry');
        } else {
          console.error('❌ Preview button still not found after retry');
        }
      }, 100);
    }
    
    // Initialize preview image as hidden
    const previewImg = document.getElementById('PreviewKTP');
    if (previewImg) {
      previewImg.style.display = 'none';
      previewImg.src = '';
      previewImg.alt = 'Preview KTP';
      console.log('✅ Preview image initialized as hidden');
    } else {
      console.error('❌ Preview image element not found');
    }

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
              <button class="showFormButton" data-email="${user.email}" data-name="${user.nama || ''}">
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
        currentUserName = e.target.getAttribute('data-name') || '';
        currentUserEmail = e.target.getAttribute('data-email') || '';
        
        console.log('🔍 Assign ID clicked for email:', currentEmail);
        console.log('👤 User name:', currentUserName);
        console.log('📧 User email:', currentUserEmail);
        
        // Isi input nama dan email
        const namaInput = document.getElementById('namadipilih');
        const emailInput = document.getElementById('emaildipilih');
        
        if (namaInput) namaInput.value = currentUserName;
        if (emailInput) emailInput.value = currentUserEmail;
        
        // Aktifkan button Preview KTP dan set data-id
        activatePreviewButton(currentEmail);
        
        document.getElementById("userForm").classList.add("show");
        document.getElementById("userForm").scrollIntoView({ 
          behavior: 'smooth' 
        });
      }
    });

    // Reset Preview KTP button when form is cancelled or completed
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('cancel-button') || e.target.id === 'cancelButton') {
        resetPreviewButton();
      }
    });

    // Function to activate Preview KTP button
    function activatePreviewButton(email) {
      console.log('🔍 Activating preview button for email:', email);
      
      // Try multiple selectors to find the button
      let previewButton = document.querySelector('.btn-preview');
      if (!previewButton) {
        previewButton = document.querySelector('button.btn-preview');
      }
      if (!previewButton) {
        previewButton = document.querySelector('button[class*="btn-preview"]');
      }
      
      console.log('🔍 Preview button found:', previewButton);
      
      if (previewButton) {
        // Ambil user ID dari data yang sedang diproses
        const currentUser = pendingUsers.find(user => user.email === email);
        console.log('🔍 Current user found:', currentUser);
        
        if (currentUser && currentUser.id) {
          console.log('🔍 Setting preview button for user ID:', currentUser.id);
          
          // Set attributes
          previewButton.setAttribute('data-id', currentUser.id);
          previewButton.disabled = false;
          previewButton.removeAttribute('disabled'); // Double check
          
          // Set styles
          previewButton.style.opacity = '1';
          previewButton.style.cursor = 'pointer';
          previewButton.style.pointerEvents = 'auto';
          
          // Set text
          previewButton.textContent = 'Preview KTP';
          
          // Force re-render
          previewButton.style.display = 'none';
          previewButton.offsetHeight; // Trigger reflow
          previewButton.style.display = 'inline-block';
          
          console.log('✅ Preview button activated successfully');
          console.log('🔍 Final button state:', {
            disabled: previewButton.disabled,
            dataId: previewButton.dataset.id,
            text: previewButton.textContent,
            opacity: previewButton.style.opacity
          });
        } else {
          console.error('❌ User not found or missing ID:', currentUser);
        }
      } else {
        console.error('❌ Preview button not found with any selector');
      }
    }

    // Function to reset Preview KTP button
    function resetPreviewButton() {
      const previewButton = document.querySelector('.btn-preview');
      if (previewButton) {
        previewButton.disabled = true;
        previewButton.style.opacity = '0.5';
        previewButton.style.cursor = 'not-allowed';
        previewButton.textContent = 'Preview KTP (Pilih user terlebih dahulu)';
        previewButton.removeAttribute('data-id');
        currentEmail = '';
        currentUserName = '';
        currentUserEmail = '';
      }
      
      // Reset input nama dan email
      const namaInput = document.getElementById('namadipilih');
      const emailInput = document.getElementById('emaildipilih');
      if (namaInput) namaInput.value = '';
      if (emailInput) emailInput.value = '';
      
      // Reset preview image
      const previewImg = document.getElementById('PreviewKTP');
      if (previewImg) {
        previewImg.src = '';
        previewImg.alt = 'Preview KTP';
        previewImg.style.display = 'none';
        previewImg.style.border = '';
        previewImg.style.background = '';
        previewImg.style.color = '';
        previewImg.style.padding = '';
        previewImg.style.textAlign = '';
        previewImg.innerHTML = '';
      }
      
      // Hide loading indicator
      const loadingDiv = document.querySelector('.ktp-loading');
      if (loadingDiv) {
        loadingDiv.style.display = 'none';
      }
    }

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
            nama: currentUserName,
            user_email: currentUserEmail,
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

        // Reset Preview KTP button
        resetPreviewButton();

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