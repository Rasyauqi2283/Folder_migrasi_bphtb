// Script untuk Booking SSPD Perorangan
// Menggunakan jenis_wajib_pajak = "Perorangan"

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 [PERORANGAN] Booking SSPD Perorangan script loaded');
    
    // Set jenis_wajib_pajak untuk perorangan
    window.jenisWajibPajak = 'Perorangan';
    
    // Override form submission untuk perorangan
    const form = document.getElementById('formBadanUsaha_Bphtb');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📋 [PERORANGAN] Form submission started');
            
            try {
                // Collect form data
                const formData = new FormData(form);
                
                // Add jenis_wajib_pajak = "Perorangan"
                formData.append('jenis_wajib_pajak', 'Perorangan');
                
                // Convert FormData to JSON
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                console.log('📋 [PERORANGAN] Submitting data:', data);
                
                // Submit to perorangan API
                const response = await fetch('/api/ppatk/create-booking-perorangan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('✅ [PERORANGAN] Booking created successfully:', result);
                    alert('Booking SSPD Perorangan berhasil dibuat!');
                    
                    // Reload table data
                    if (window.loadTableData) {
                        window.loadTableData();
                    }
                    
                    // Reset form
                    form.reset();
                    toggleForm(); // Hide form
                } else {
                    console.error('❌ [PERORANGAN] Booking creation failed:', result);
                    alert('Gagal membuat booking: ' + result.message);
                }
                
            } catch (error) {
                console.error('❌ [PERORANGAN] Form submission error:', error);
                alert('Terjadi kesalahan: ' + error.message);
            }
        });
    }
    
    // Load table data for perorangan
    window.loadTableData = async function() {
        try {
            console.log('📋 [PERORANGAN] Loading table data...');
            
            const response = await fetch('/api/ppatk/load-booking-perorangan', {
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ [PERORANGAN] Table data loaded:', result.data);
                renderTable(result.data);
            } else {
                console.error('❌ [PERORANGAN] Failed to load table data:', result);
            }
            
        } catch (error) {
            console.error('❌ [PERORANGAN] Error loading table data:', error);
        }
    };
    
    // Render table function
    function renderTable(data) {
        const tbody = document.getElementById('table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-message">Tidak ada data booking perorangan</td></tr>';
            return;
        }
        
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nobooking || '-'}</td>
                <td>${item.noppbb || '-'}</td>
                <td>${item.tanggal || '-'}</td>
                <td>${item.tahunajb || '-'}</td>
                <td>${item.namawajibpajak || '-'}</td>
                <td>${item.namapemilikobjekpajak || '-'}</td>
                <td>${item.npwpwp || '-'}</td>
                <td>${item.trackstatus || 'Draft'}</td>
                <td>
                    <button onclick="sendBooking('${item.nobooking}')" class="btn-send">Kirim</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Send booking function
    window.sendBooking = async function(nobooking) {
        try {
            console.log('📋 [PERORANGAN] Sending booking:', nobooking);
            
            const response = await fetch('/api/ppatk/send-now', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ nobooking })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ [PERORANGAN] Booking sent successfully:', result);
                alert('Booking berhasil dikirim!');
                
                // Reload table data
                window.loadTableData();
            } else {
                console.error('❌ [PERORANGAN] Failed to send booking:', result);
                alert('Gagal mengirim booking: ' + result.message);
            }
            
        } catch (error) {
            console.error('❌ [PERORANGAN] Error sending booking:', error);
            alert('Terjadi kesalahan: ' + error.message);
        }
    };
    
    // Toggle form function
    window.toggleForm = function() {
        const form = document.getElementById('formBadanUsaha_Bphtb');
        if (form) {
            form.classList.toggle('hidden-form');
        }
    };
    
    // View document function
    window.viewDocument = function() {
        alert('Fitur view dokumen akan segera tersedia');
    };
    
    // Load initial data
    window.loadTableData();
    
    console.log('✅ [PERORANGAN] Booking SSPD Perorangan script initialized');
});
