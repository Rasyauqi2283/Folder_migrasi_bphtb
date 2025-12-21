// Fungsi untuk menampilkan pesan error
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + 'Error');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.className = 'error-message';
    }
    
    if (input) {
        input.classList.add('error');
    }
}

// Fungsi untuk menyembunyikan pesan error
function hideError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + 'Error');
    
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
    
    if (input) {
        input.classList.remove('error');
    }
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(inputId + 'Error');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.className = 'success-message';
    }
    
    if (input) {
        input.classList.remove('error');
    }
}

// Validasi NIK real-time
function validateNIK(input) {
    const nik = input.value;
    const nikError = document.getElementById('nikError');
    
    if (nik.length === 0) {
        hideError('nik');
        return;
    }
    
    if (!/^\d+$/.test(nik)) {
        showError('nik', 'NIK hanya boleh berisi angka');
        return;
    }
    
    if (nik.length < 16) {
        showError('nik', `NIK harus 16 digit (${nik.length}/16)`);
        return;
    }
    
    if (nik.length > 16) {
        showError('nik', 'NIK tidak boleh lebih dari 16 digit');
        return;
    }
    
    // Validasi format NIK Indonesia
    if (nik.length === 16) {
        const provinsi = nik.substring(0, 2);
        const kabupaten = nik.substring(2, 4);
        const kecamatan = nik.substring(4, 6);
        const tanggal = nik.substring(6, 8);
        const bulan = nik.substring(8, 10);
        const tahun = nik.substring(10, 12);
        
        // Validasi tanggal
        if (parseInt(tanggal) > 40) {
            showError('nik', 'Format tanggal pada NIK tidak valid');
            return;
        }
        
        // Validasi bulan
        if (parseInt(bulan) > 12 || parseInt(bulan) < 1) {
            showError('nik', 'Format bulan pada NIK tidak valid');
            return;
        }
        
        showSuccess('nik', '✓ NIK valid');
    }
}

// Validasi Email real-time
function validateEmail(input) {
    const email = input.value;
    const emailError = document.getElementById('emailError');
    
    if (email.length === 0) {
        hideError('email');
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        showError('email', 'Format email tidak valid (contoh: user@domain.com)');
        return;
    }
    
    // Validasi domain email yang umum
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'ymail.com'];
    const domain = email.split('@')[1];
    
    if (domain && domain.length < 4) {
        showError('email', 'Domain email terlalu pendek');
        return;
    }
    
    showSuccess('email', '✓ Format email valid');
}

// Validasi Telepon real-time
function validateTelepon(input) {
    const telepon = input.value;
    const teleponError = document.getElementById('teleponError');
    const teleponInfo = document.getElementById('teleponInfo');
    
    if (telepon.length === 0) {
        hideError('telepon');
        if (teleponInfo) {
            teleponInfo.textContent = 'Contoh: 08123456789';
            teleponInfo.style.color = '#666';
        }
        return;
    }
    
    // Hanya izinkan angka
    if (!/^\d+$/.test(telepon)) {
        showError('telepon', 'Nomor telepon hanya boleh berisi angka');
        return;
    }
    
    // Pastikan dimulai dengan 08
    if (!telepon.startsWith('08')) {
        showError('telepon', 'Nomor telepon harus dimulai dengan 08');
        return;
    }
    
    // Validasi panjang
    if (telepon.length < 11) {
        showError('telepon', `Nomor telepon terlalu pendek (${telepon.length}/11-13 digit)`);
        return;
    }
    
    if (telepon.length > 13) {
        showError('telepon', 'Nomor telepon tidak boleh lebih dari 13 digit');
        return;
    }
    
    // Validasi operator seluler Indonesia
    const operatorCodes = {
        '0811': 'Telkomsel (Halo)',
        '0812': 'Telkomsel (Simpati)',
        '0813': 'Telkomsel (As)',
        '0821': 'Telkomsel (Simpati)',
        '0822': 'Telkomsel (As)',
        '0823': 'Telkomsel (As)',
        '0851': 'Telkomsel (As)',
        '0852': 'Telkomsel (As)',
        '0853': 'Telkomsel (As)',
        '0855': 'Indosat (IM3)',
        '0856': 'Indosat (IM3)',
        '0857': 'Indosat (IM3)',
        '0858': 'Indosat (IM3)',
        '0859': 'Indosat (IM3)',
        '0868': 'Indosat (Mentari)',
        '0877': 'XL',
        '0878': 'XL',
        '0881': 'Smartfren',
        '0882': 'Smartfren',
        '0883': 'Smartfren',
        '0884': 'Smartfren',
        '0885': 'Smartfren',
        '0886': 'Smartfren',
        '0887': 'Smartfren',
        '0888': 'Smartfren',
        '0889': 'Smartfren',
        '0895': 'Three',
        '0896': 'Three',
        '0897': 'Three',
        '0898': 'Three',
        '0899': 'Three'
    };
    
    const prefix = telepon.substring(0, 4);
    
    if (!operatorCodes[prefix]) {
        showError('telepon', 'Kode operator tidak valid untuk Indonesia');
        return;
    }
    
    // Show operator info
    if (teleponInfo && telepon.length >= 4) {
        teleponInfo.textContent = `Operator: ${operatorCodes[prefix]}`;
        teleponInfo.style.color = '#28a745';
    }
    
    showSuccess('telepon', '✓ Nomor telepon valid');
}

// Validasi Password real-time
function validatePassword(input) {
    const password = input.value;
    const passwordError = document.getElementById('passwordError');
    
    if (password.length === 0) {
        hideError('password');
        return;
    }
    
    if (password.length < 8) {
        showError('password', `Password minimal 8 karakter (${password.length}/8)`);
        return;
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
        showError('password', 'Password harus mengandung minimal 1 huruf besar');
        return;
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
        showError('password', 'Password harus mengandung minimal 1 huruf kecil');
        return;
    }
    
    if (!/(?=.*\d)/.test(password)) {
        showError('password', 'Password harus mengandung minimal 1 angka');
        return;
    }
    
    showSuccess('password', '✓ Password kuat');
}

// Validasi Konfirmasi Password real-time
function validateConfirmPassword(input) {
    const password = document.getElementById('password').value;
    const confirmPassword = input.value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (confirmPassword.length === 0) {
        hideError('repeatpassword');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('repeatpassword', 'Konfirmasi password tidak cocok');
        return;
    }
    
    showSuccess('repeatpassword', '✓ Password cocok');
}

// Fungsi untuk toggle password visibility
function togglePasswordVisibility(toggleIcon) {
    const targetId = toggleIcon.getAttribute("data-target");
    const targetInput = document.getElementById(targetId);
    
    if (!targetInput) {
        console.error(`Input dengan ID '${targetId}' tidak ditemukan`);
        return;
    }
    
        const isPassword = targetInput.getAttribute("type") === "password";

        // Toggle jenis input antara 'password' dan 'text'
        targetInput.setAttribute("type", isPassword ? "text" : "password");

        // Ubah ikon mata (fa-eye) menjadi mata dicoret (fa-eye-slash)
    if (isPassword) {
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
        toggleIcon.title = "Sembunyikan password";
    } else {
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
        toggleIcon.title = "Tampilkan password";
    }
}

// Validasi Nama real-time
function validateNama(input) {
    const nama = input.value.trim();
    
    if (nama.length === 0) {
        hideError('nama');
        return;
    }
    
    if (nama.length < 2) {
        showError('nama', 'Nama lengkap minimal 2 karakter');
        return;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(nama)) {
        showError('nama', 'Nama hanya boleh berisi huruf dan spasi');
        return;
    }
    
    showSuccess('nama', '✓ Nama valid');
}

// Validasi Gender real-time
function validateGender(select) {
    const gender = select.value;
    const genderError = document.getElementById('genderError');
    
    if (!gender || gender === '') {
        if (genderError) {
            genderError.textContent = 'Pilih jenis kelamin Anda';
            genderError.style.display = 'block';
            genderError.className = 'error-message';
        }
        select.classList.add('error');
        return;
    }
    
    if (!['Perempuan', 'Laki-laki'].includes(gender)) {
        if (genderError) {
            genderError.textContent = 'Pilihan gender tidak valid';
            genderError.style.display = 'block';
            genderError.className = 'error-message';
        }
        select.classList.add('error');
        return;
    }
    
    if (genderError) {
        genderError.style.display = 'none';
    }
    select.classList.remove('error');
}

// Event listener untuk input real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Setup toggle password functionality
    document.querySelectorAll(".toggle-password").forEach((toggle) => {
        // Set initial title
        toggle.title = "Tampilkan password";
        
        toggle.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility(this);
        });
        
        // Add hover effect
        toggle.addEventListener('mouseenter', function() {
            this.style.opacity = '0.7';
        });
        
        toggle.addEventListener('mouseleave', function() {
            this.style.opacity = '1';
        });
    });
    
    // Nama validation
    const namaInput = document.getElementById('nama');
    if (namaInput) {
        namaInput.addEventListener('input', function() {
            validateNama(this);
        });
        namaInput.addEventListener('blur', function() {
            validateNama(this);
        });
    }
    
    // NIK validation
    const nikInput = document.getElementById('nik');
    if (nikInput) {
        nikInput.addEventListener('input', function() {
            // Hanya izinkan angka dan batasi 16 digit
            this.value = this.value.replace(/[^0-9]/g, '').substring(0, 16);
            // Update counter
            const counter = document.getElementById('nikCounter');
            if (counter) {
                counter.textContent = `${this.value.length}/16 digit`;
                counter.style.color = this.value.length === 16 ? '#28a745' : '#666';
            }
            validateNIK(this);
        });
        nikInput.addEventListener('blur', function() {
            validateNIK(this);
        });
        nikInput.addEventListener('paste', function(e) {
            // Handle paste event
            setTimeout(() => {
                this.value = this.value.replace(/[^0-9]/g, '').substring(0, 16);
                // Update counter
                const counter = document.getElementById('nikCounter');
                if (counter) {
                    counter.textContent = `${this.value.length}/16 digit`;
                    counter.style.color = this.value.length === 16 ? '#28a745' : '#666';
                }
                validateNIK(this);
            }, 10);
        });
    }
    
    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }
    
    // Telepon validation
    const teleponInput = document.getElementById('telepon');
    if (teleponInput) {
        teleponInput.addEventListener('input', function() {
            // Format input otomatis
            let value = this.value.replace(/[^0-9]/g, '');
            if (!value.startsWith('08') && value.length > 0) {
                value = '08' + value.substring(2);
        }
        if (value.length > 13) {
                value = value.substring(0, 13);
            }
            this.value = value;
            
            validateTelepon(this);
        });
        teleponInput.addEventListener('blur', function() {
            validateTelepon(this);
        });
    }
    
    // Password validation
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this);
            // Re-validate confirm password if it has value
            const confirmPassword = document.getElementById('repeatpassword');
            if (confirmPassword.value) {
                validateConfirmPassword(confirmPassword);
            }
        });
    }
    
    // Confirm Password validation
    const confirmPasswordInput = document.getElementById('repeatpassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validateConfirmPassword(this);
        });
    }
});

// Fungsi untuk memvalidasi seluruh form
function validateForm() {
    const nama = document.getElementById('nama').value.trim();
    const nik = document.getElementById('nik').value;
    const email = document.getElementById('email').value;
    const telepon = document.getElementById('telepon').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('repeatpassword').value;
    const gender = document.getElementById('gender').value;
    const fotoktp = document.getElementById('fotoktp').files[0];

    let isValid = true;

    // Validasi Nama
    if (!nama || nama.length < 2) {
        showError('nama', 'Nama lengkap minimal 2 karakter');
        isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(nama)) {
        showError('nama', 'Nama hanya boleh berisi huruf dan spasi');
        isValid = false;
    } else {
        hideError('nama');
    }

    // Validasi NIK
    if (!/^\d{16}$/.test(nik)) {
        showError('nik', 'NIK harus 16 digit');
        isValid = false;
    }

    // Validasi Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showError('email', 'Format email tidak valid');
        isValid = false;
    }

    // Validasi Telepon
    if (!/^08\d{9,11}$/.test(telepon)) {
        showError('telepon', 'Nomor telepon tidak valid');
        isValid = false;
    }

    // Validasi Password
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
        showError('password', 'Password tidak memenuhi kriteria');
        isValid = false;
    }

    // Validasi Konfirmasi Password
    if (password !== confirmPassword) {
        showError('repeatpassword', 'Konfirmasi password tidak cocok');
        isValid = false;
    }

    // Validasi Gender
    if (!gender || gender === '') {
        alert('Pilih jenis kelamin Anda!');
        isValid = false;
    } else if (!['Perempuan', 'Laki-laki'].includes(gender)) {
        alert('Pilihan gender tidak valid!');
        isValid = false;
    }

    // Validasi file KTP
    if (!fotoktp || fotoktp.size === 0) {
        alert("Foto KTP harus diupload!");
        isValid = false;
    } else if (fotoktp.size > 3 * 1024 * 1024) {
        alert("Ukuran file KTP tidak boleh lebih dari 3MB!");
        isValid = false;
    } else {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(fotoktp.type)) {
            alert("Format file KTP tidak didukung! Gunakan JPG atau PNG.");
            isValid = false;
        }
    }

    return isValid;
}

// Variabel global untuk tracking upload status
let ktpUploadStatus = {
    isUploaded: false,
    isUploading: false,
    uploadId: null,
    error: null
};

// Fungsi untuk upload KTP & Simulasi Verifikasi (E-KYC)
async function uploadKTPFile(file) {
    if (ktpUploadStatus.isUploading) {
        console.log("⏳ [KTP_UPLOAD] Simulation already in progress");
        return;
    }

    const autoFill = document.getElementById("autoFillSuggestion");
    if (autoFill) {
        autoFill.style.display = "block";
        autoFill.innerHTML = `
            <div style="padding: 15px; text-align: center; color: #3b82f6; background: rgba(59,130,246,0.1); border-radius: 8px;">
                <i class="fas fa-spinner fa-spin"></i> 
                Sedang memverifikasi KTP ke database kependudukan...
            </div>
        `;
    }

    ktpUploadStatus.isUploading = true;
    ktpUploadStatus.isUploaded = false;
    ktpUploadStatus.error = null;

    try {
        console.log("📤 [SIMULASI] Memulai verifikasi KTP...");
        
        // Panggil endpoint simulasi baru
        const response = await fetch('/api/v1/auth/simulate-ktp-verification', { 
            method: 'POST',
            credentials: 'include'
        });
        const result = await response.json();

        console.log("📥 [SIMULASI] Response:", result);

        if (response.ok && result.success) {
            if (autoFill) {
                autoFill.innerHTML = `
                    <div style="border-left: 4px solid #22c55e; padding: 12px; background: rgba(34,197,94,0.1); border-radius: 8px;">
                        <p style="color: #22c55e; font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle"></i> KTP Terverifikasi (Sistem Bappenda)
                        </p>
                        <div style="font-size: 13px; color: #fff;">
                            <p style="margin: 2px 0;">NIK: <strong id="detectedNIK" style="color: #00c8ff;">${result.data.nik}</strong></p>
                            <p style="margin: 2px 0;">Nama: <strong id="detectedNama" style="color: #00c8ff;">${result.data.nama}</strong></p>
                        </div>
                        <button type="button" class="auto-fill-btn" onclick="applyAutoFill()" 
                                style="margin-top: 12px; background: #22c55e; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; width: 100%; font-weight: 600; transition: background 0.2s;">
                            Gunakan Data Terverifikasi
                        </button>
                    </div>
                `;
            }
            
            ktpUploadStatus.isUploaded = true;
            ktpUploadStatus.uploadId = "SIMULATION_ID_" + Date.now();
            updateKTPUploadStatus('success', 'KTP Terverifikasi Otomatis');
            return { success: true };
        } else {
            throw new Error(result.message || 'Verifikasi gagal');
        }
    } catch (error) {
        console.error("❌ [SIMULASI] Error:", error);
        ktpUploadStatus.error = error.message;
        ktpUploadStatus.isUploaded = false;
        if (autoFill) {
            autoFill.innerHTML = `<p style="color: #ef4444; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 8px;">Gagal memverifikasi KTP otomatis. Silakan isi data manual.</p>`;
        }
        updateKTPUploadStatus('error', error.message);
        throw error;
    } finally {
        ktpUploadStatus.isUploading = false;
    }
}

// Fungsi untuk mengisi form otomatis dari hasil deteksi
window.applyAutoFill = function() {
    const detectedNama = document.getElementById('detectedNama')?.textContent;
    const detectedNIK = document.getElementById('detectedNIK')?.textContent;
    
    if (detectedNama && detectedNIK) {
        const namaInput = document.getElementById('nama');
        const nikInput = document.getElementById('nik');
        
        if (namaInput) {
            namaInput.value = detectedNama;
            validateNama(namaInput);
        }
        
        if (nikInput) {
            nikInput.value = detectedNIK;
            validateNIK(nikInput);
            // Update counter
            const counter = document.getElementById('nikCounter');
            if (counter) {
                counter.textContent = `${detectedNIK.length}/16 digit`;
                counter.style.color = '#28a745';
            }
        }
        
        const autoFill = document.getElementById("autoFillSuggestion");
        if (autoFill) autoFill.style.display = "none";
        
        alert("Data KTP berhasil disalin ke formulir!");
    }
};

// Make uploadKTPFile available globally
window.uploadKTPFile = uploadKTPFile;

// Fungsi untuk update status upload di UI
function updateKTPUploadStatus(type, message) {
    const fileInput = document.getElementById('fotoktp');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'ktp-upload-status';
    statusDiv.className = `upload-status ${type}`;
    statusDiv.innerHTML = `
        <div class="status-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'spinner fa-spin'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Hapus status lama jika ada
    const existingStatus = document.getElementById('ktp-upload-status');
    if (existingStatus) {
        existingStatus.remove();
    }

    // Tambahkan status baru setelah file input
    fileInput.parentNode.insertBefore(statusDiv, fileInput.nextSibling);

    // Auto remove success message setelah 3 detik
    if (type === 'success') {
        setTimeout(() => {
            const status = document.getElementById('ktp-upload-status');
            if (status && status.classList.contains('success')) {
                status.remove();
            }
        }, 3000);
    }
}

// Event listener untuk submit form
document.querySelector("form").addEventListener("submit", async (event) => {
    console.log("🚀 [FRONTEND] Form submit event triggered");
    
    // Validasi form terlebih dahulu
    console.log("🔍 [FRONTEND] Starting form validation...");
    const validationResult = validateForm();
    console.log("🔍 [FRONTEND] Form validation result:", validationResult);
    
    if (!validationResult) {
        console.log("❌ [FRONTEND] Form validation failed, stopping submission");
        event.preventDefault();
        return;
    }

    // Validasi upload KTP
    const fileInput = document.getElementById('fotoktp');
    const ktpFile = fileInput?.files?.[0];
    
    if (!ktpFile) {
        console.log("❌ [FRONTEND] No KTP file selected");
        event.preventDefault();
        updateKTPUploadStatus('error', 'Pilih file KTP terlebih dahulu');
        return;
    }

    // Jika KTP belum diupload, upload terlebih dahulu
    if (!ktpUploadStatus.isUploaded) {
        console.log("📤 [FRONTEND] KTP not uploaded yet, uploading first...");
        event.preventDefault();
        
        try {
            updateKTPUploadStatus('loading', 'Mengupload KTP...');
            await uploadKTPFile(ktpFile);
            
            // Setelah upload berhasil, submit form
            setTimeout(() => {
                document.querySelector("form").dispatchEvent(new Event('submit'));
            }, 1000);
            
            return;
        } catch (error) {
            console.error("❌ [FRONTEND] KTP upload failed:", error);
            event.preventDefault();
            return;
        }
    }
    
    console.log("✅ [FRONTEND] Form validation passed, KTP uploaded, proceeding with submission");

    // Prevent default form submission
    event.preventDefault();
    
    // Create FormData manually to ensure all data is captured
    const formData = new FormData();
    
    // Add all form fields manually
    formData.append('nama', document.getElementById('nama').value);
    formData.append('nik', document.getElementById('nik').value);
    formData.append('telepon', document.getElementById('telepon').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('repeatpassword', document.getElementById('repeatpassword').value);
    formData.append('gender', document.getElementById('gender').value);
    
    // Add uploadId dari KTP yang sudah diupload
    if (ktpUploadStatus.uploadId) {
        formData.append('ktpUploadId', ktpUploadStatus.uploadId);
        console.log("🔧 [FRONTEND] Adding KTP upload ID to FormData:", ktpUploadStatus.uploadId);
    } else {
        console.error("❌ [FRONTEND] No KTP upload ID available");
        event.preventDefault();
        updateKTPUploadStatus('error', 'KTP belum diupload dengan benar');
        return;
    }
    
    // Debug FormData contents
    console.log("📋 [FRONTEND] Form Data Keys:", Array.from(formData.keys()));
    console.log("📋 [FRONTEND] Form Data Values:", Object.fromEntries(formData));
    
    // Debug file khusus
    const fotoktpFileAfter = formData.get('fotoktp');
    console.log("📁 [FRONTEND] KTP File Details (after manual FormData creation):", {
        hasFile: !!fotoktpFileAfter,
        fileName: fotoktpFileAfter?.name,
        fileSize: fotoktpFileAfter?.size,
        fileType: fotoktpFileAfter?.type
    });

    // Disable submit button untuk mencegah double submission
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    // Jika semua validasi berhasil, submit form
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Mengirim data...";
    messageDiv.style.color = "blue";

    // Submit form ke backend
    try {
        console.log('📤 [FRONTEND] Sending registration data...');
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            body: formData
        });

        console.log('📥 [FRONTEND] Response status:', response.status);
        
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('❌ [FRONTEND] Failed to parse response:', parseError);
            throw new Error('Server response tidak valid');
        }

        console.log('📋 [FRONTEND] Response data:', data);
        messageDiv.textContent = data.message || 'Terjadi kesalahan tidak diketahui';

        if (response.ok) {
            messageDiv.style.color = "green";
            console.log('✅ [FRONTEND] Registration successful');
            // Simpan email di localStorage setelah registrasi berhasil
            localStorage.setItem("email", formData.get("email"));
            setTimeout(() => {
                // Mengarahkan pengguna ke halaman verifikasi OTP
                window.location.href = data.redirectTo || 'login.html';
            }, 2000);
        } else {
            messageDiv.style.color = "red";
            console.error('❌ [FRONTEND] Registration failed:', {
                status: response.status,
                message: data.message,
                success: data.success
            });
            
            // Re-enable submit button jika ada error
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error("❌ [FRONTEND] Network or parsing error:", error);
        messageDiv.textContent = "Terjadi kesalahan koneksi. Periksa koneksi internet Anda dan coba lagi.";
        messageDiv.style.color = "red";
        // Re-enable submit button jika ada error
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});