/**
 * Contoh Implementasi Smooth Real-Time Update untuk LSB Table
 * 
 * Cara penggunaan:
 * 1. Include smooth-realtime-update.js dan smooth-realtime-animations.css
 * 2. Buat instance SmoothRealTimeUpdater dengan konfigurasi
 * 3. Start monitoring
 */

// Fungsi untuk render row (sesuai dengan struktur tabel LSB)
function renderLSBRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-nobooking', item.nobooking || '');
    
    // Sesuaikan dengan struktur tabel LSB Anda
    const cells = [
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
    
    cells.forEach((text, idx) => {
        const cell = row.insertCell(idx);
        cell.textContent = text;
    });
    
    // Action cell (Kirim button)
    const actionCell = row.insertCell(9);
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Kirim';
    sendBtn.className = 'btn-kirim-document';
    
    const statusOk = String(item.status || '').toLowerCase() === 'terselesaikan';
    const track = String(item.trackstatus || '');
    const alreadySent = /^diserahkan$/i.test(track);
    const canSend = statusOk && !alreadySent;
    
    if (!canSend) {
        sendBtn.disabled = true;
        sendBtn.title = alreadySent ? 'Sudah Diserahkan' : 'Belum Terselesaikan';
        sendBtn.textContent = alreadySent ? 'Terkirim' : 'Kirim';
    }
    
    sendBtn.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        // Mark row sebagai sedang diedit
        row.classList.add('user-editing');
        
        try {
            if (!confirm('Serahkan berkas ini ke PPAT/PPATS?')) {
                row.classList.remove('user-editing');
                return;
            }
            
            sendBtn.disabled = true;
            sendBtn.textContent = 'Mengirim...';
            
            // Pause real-time updates saat user sedang mengirim
            if (window.lsbRealtimeUpdater) {
                window.lsbRealtimeUpdater.trackUserActivity();
            }
            
            const res = await sendToPPAT_complete({ 
                nobooking: item.nobooking, 
                keterangan: item.keterangan || '' 
            });
            
            if (res && res.success) {
                // Remove row dengan smooth animation
                row.style.transition = 'all 0.3s ease-out';
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    row.remove();
                }, 300);
                
                try { 
                    if (window.playSendSound) window.playSendSound(); 
                } catch(_) {}
            } else {
                throw new Error(res?.message || 'Gagal menyerahkan');
            }
        } catch (e) {
            alert(e.message);
            sendBtn.disabled = false;
            sendBtn.textContent = 'Kirim';
            row.classList.remove('user-editing');
        }
    });
    
    actionCell.appendChild(sendBtn);
    
    return row;
}

// Initialize Smooth Real-Time Updater
function initSmoothRealTimeLSB() {
    // Buat instance updater
    const updater = new SmoothRealTimeUpdater({
        tableId: 'LSBTable',
        tbodySelector: '#LSBTable tbody.data-masuk',
        apiEndpoint: '/api/LSB_berkas-complete',
        dataKey: 'nobooking',
        renderRowFunction: renderLSBRow,
        interval: 5000 // Check every 5 seconds
    });
    
    // Expose ke global scope
    window.lsbRealtimeUpdater = updater;
    
    // Track user interactions
    const table = document.querySelector('#LSBTable');
    if (table) {
        // Track clicks
        table.addEventListener('click', () => {
            updater.trackUserActivity();
        });
        
        // Track input changes
        table.addEventListener('input', () => {
            updater.trackUserActivity();
        });
        
        // Track mouse movements (kurang agresif)
        let mouseMoveTimeout;
        table.addEventListener('mousemove', () => {
            clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = setTimeout(() => {
                updater.trackUserActivity();
            }, 1000); // Debounce mouse move
        });
    }
    
    // Start monitoring setelah initial load
    // Pastikan loadTableLSB() sudah selesai
    if (typeof loadTableLSB === 'function') {
        // Wait for initial load
        setTimeout(() => {
            // Initialize lastDataMap dengan data yang sudah ada
            const tbody = document.querySelector('#LSBTable tbody.data-masuk');
            if (tbody) {
                const existingRows = tbody.querySelectorAll('tr[data-nobooking]');
                existingRows.forEach(row => {
                    const nobooking = row.getAttribute('data-nobooking');
                    if (nobooking) {
                        // Extract data dari row (atau fetch dari API)
                        updater.lastDataMap.set(nobooking, { nobooking });
                    }
                });
            }
            
            // Start smooth real-time updates
            updater.start();
        }, 2000);
    } else {
        // Start immediately
        updater.start();
    }
    
    // Toggle button (optional)
    const toggleBtn = document.getElementById('realtimeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isEnabled = updater.toggle();
            toggleBtn.textContent = isEnabled ? '⏸️ Pause' : '▶️ Resume';
        });
    }
    
    console.log('✅ Smooth real-time updater initialized for LSB');
}

// Initialize saat DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothRealTimeLSB);
} else {
    initSmoothRealTimeLSB();
}

