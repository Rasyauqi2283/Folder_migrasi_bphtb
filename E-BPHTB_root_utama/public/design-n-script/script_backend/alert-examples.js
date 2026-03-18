/**
 * CONTOH PENGGUNAAN UNIVERSAL ALERT SYSTEM
 * File ini berisi contoh-contoh penggunaan untuk memudahkan implementasi
 */

// ========================================
// CONTOH PENGGUNAAN DASAR
// ========================================

// Alert sukses
function contohAlertSuccess() {
    window.universalAlert.success('Data berhasil disimpan!');
    
    // Atau dengan opsi tambahan
    window.universalAlert.success('Data berhasil disimpan!', 'Berhasil', {
        duration: 3000,
        onClose: () => console.log('Alert ditutup')
    });
}

// Alert error
function contohAlertError() {
    window.universalAlert.error('Terjadi kesalahan saat menyimpan data');
}

// Alert warning
function contohAlertWarning() {
    window.universalAlert.warning('Data akan dihapus secara permanen');
}

// Alert info
function contohAlertInfo() {
    window.universalAlert.info('Proses sedang berjalan, mohon tunggu');
}

// ========================================
// CONTOH PENGGUNAAN LANJUTAN
// ========================================

// Alert dengan tombol custom
function contohAlertCustomButtons() {
    window.universalAlert.show({
        type: 'warning',
        title: 'Konfirmasi Penghapusan',
        message: 'Apakah Anda yakin ingin menghapus data ini?',
        duration: 0, // Tidak auto close
        buttons: [
            {
                text: 'Batal',
                class: 'alert-btn alert-btn-secondary',
                icon: 'fa-times',
                onclick: `window.universalAlert.close('${window.universalAlert.generateId()}')`
            },
            {
                text: 'Hapus',
                class: 'alert-btn alert-btn-primary',
                icon: 'fa-trash',
                onclick: 'deleteData(); window.universalAlert.closeAll();'
            }
        ]
    });
}

// Alert loading
function contohAlertLoading() {
    const loadingAlertId = window.universalAlert.loading('Menyimpan data...');
    
    // Simulasi proses
    setTimeout(() => {
        window.universalAlert.close(loadingAlertId);
        window.universalAlert.success('Data berhasil disimpan!');
    }, 3000);
}

// Alert konfirmasi
async function contohAlertConfirm() {
    const confirmed = await window.universalAlert.confirm(
        'Apakah Anda yakin ingin menghapus data ini?',
        'Konfirmasi Penghapusan'
    );
    
    if (confirmed) {
        // Proses penghapusan
        console.log('Data dihapus');
    } else {
        console.log('Penghapusan dibatalkan');
    }
}

// ========================================
// CONTOH INTEGRASI DENGAN FUNGSI EXISTING
// ========================================

// Replace alert() biasa
function contohReplaceAlert() {
    // Sebelum
    // alert('Data berhasil disimpan!');
    
    // Sesudah
    window.universalAlert.success('Data berhasil disimpan!');
}

// Replace confirm() biasa
async function contohReplaceConfirm() {
    // Sebelum
    // const ok = confirm('Yakin hapus data?');
    
    // Sesudah
    const ok = await window.universalAlert.confirm('Yakin hapus data?');
    
    return ok;
}

// Replace prompt() biasa (perlu implementasi custom)
function contohReplacePrompt() {
    // Untuk prompt, bisa menggunakan alert dengan input field
    window.universalAlert.show({
        type: 'info',
        title: 'Input Data',
        message: `
            <div style="margin-top: 15px;">
                <input type="text" id="userInput" placeholder="Masukkan data..." 
                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        `,
        duration: 0,
        buttons: [
            {
                text: 'Batal',
                class: 'alert-btn alert-btn-secondary',
                onclick: `window.universalAlert.close('${window.universalAlert.generateId()}')`
            },
            {
                text: 'OK',
                class: 'alert-btn alert-btn-primary',
                onclick: `
                    const input = document.getElementById('userInput');
                    if (input.value.trim()) {
                        console.log('Input:', input.value);
                        window.universalAlert.closeAll();
                    }
                `
            }
        ]
    });
}

// ========================================
// CONTOH UNTUK BERBAGAI SKENARIO
// ========================================

// Upload file
async function contohUploadFile() {
    const loadingId = window.universalAlert.loading('Mengupload file...');
    
    try {
        // Simulasi upload
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        window.universalAlert.close(loadingId);
        window.universalAlert.success('File berhasil diupload!');
    } catch (error) {
        window.universalAlert.close(loadingId);
        window.universalAlert.error('Gagal mengupload file: ' + error.message);
    }
}

// Form validation
function contohFormValidation() {
    const errors = [];
    
    if (!document.getElementById('nama').value) {
        errors.push('Nama harus diisi');
    }
    
    if (!document.getElementById('email').value) {
        errors.push('Email harus diisi');
    }
    
    if (errors.length > 0) {
        window.universalAlert.error(
            'Terdapat kesalahan dalam form:\n• ' + errors.join('\n• '),
            'Validasi Form'
        );
        return false;
    }
    
    return true;
}

// Network error handling
function contohNetworkError(error) {
    let message = 'Terjadi kesalahan';
    
    if (error.name === 'TypeError') {
        message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (error.status === 404) {
        message = 'Data tidak ditemukan';
    } else if (error.status === 500) {
        message = 'Terjadi kesalahan pada server';
    }
    
    window.universalAlert.error(message, 'Kesalahan Koneksi', {
        duration: 7000
    });
}

// Success dengan auto redirect
function contohSuccessRedirect() {
    window.universalAlert.success(
        'Data berhasil disimpan! Anda akan diarahkan ke halaman utama.',
        'Berhasil',
        {
            duration: 3000,
            onClose: () => {
                window.location.href = '/dashboard';
            }
        }
    );
}

// ========================================
// CONTOH INTEGRASI DENGAN SISTEM EXISTING
// ========================================

// Untuk mengganti fungsi showAlert yang sudah ada
window.showAlert = function(type, message, title = null) {
    const titles = {
        success: 'Berhasil',
        error: 'Error',
        warning: 'Peringatan',
        info: 'Informasi'
    };
    
    return window.universalAlert.show({
        type,
        title: title || titles[type] || 'Notifikasi',
        message,
        duration: 5000,
        clickOutsideToClose: true,
        showProgress: true
    });
};

// Untuk mengganti fungsi showUserNotification
window.showUserNotification = function(type, message, title = 'Notifikasi') {
    return window.universalAlert.show({
        type: type === 'success' ? 'success' : type === 'error' ? 'error' : 'info',
        title,
        message,
        duration: 5000
    });
};

// Export functions untuk testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        contohAlertSuccess,
        contohAlertError,
        contohAlertWarning,
        contohAlertInfo,
        contohAlertCustomButtons,
        contohAlertLoading,
        contohAlertConfirm,
        contohReplaceAlert,
        contohReplaceConfirm,
        contohReplacePrompt,
        contohUploadFile,
        contohFormValidation,
        contohNetworkError,
        contohSuccessRedirect
    };
}
