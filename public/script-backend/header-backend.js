document.addEventListener("DOMContentLoaded", () => {

      // Tombol profile akan mengarahkan ke halaman profil
      document.getElementById("profileButton").addEventListener("click", () => {
        window.location.href = "profile.html"; // Arahkan ke profile.html
      });
    //
    //
    const memberList = document.getElementById('member-list');
    const memberOverlay = document.getElementById('member-overlay');
    const memberCount = document.getElementById('divisiMemberCount');

    memberCount.addEventListener('click', function() {
        memberOverlay.classList.toggle('active');
        fetchMemberList();
    });
    // Close overlay jika klik di luar area overlay
    document.addEventListener('click', function (event) {
        if (!memberOverlay.contains(event.target) && !memberCount.contains(event.target)) {
            memberOverlay.classList.remove('active');
        }
    }, true);
 
    async function fetchMemberList() {
        try {
            const API_URL = 'https://bphtb-bappenda.up.railway.app';
            const response = await fetch(`${API_URL}/api/members-header`, { credentials: 'include' });
            const data = await response.json();

            if (data && data.usersm) {
                memberList.innerHTML = '';  // Clear current member list
                data.usersm.forEach(user => {
                    const memberItem = document.createElement('li');
                    
                    // Tambahkan kelas berdasarkan status (online/offline)
                    const statusClass = user.statuspengguna === 'online' ? 'online' : 'offline';
                    memberItem.classList.add('member-item', statusClass);

                    // Profile picture
                    const profileImg = document.createElement('img');
                    profileImg.src = user.fotoprofil || 'default-avatar.png';
                    profileImg.alt = `${user.username}'s photo`;
                    profileImg.onerror = () => { 
                        this.src = 'fallback-avatar.png'; 
                    };

                    // Name element
                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = user.nama;
                    nameSpan.classList.add('member-name');

                    // Status indicator
                    const statusSpan = document.createElement('span');
                    statusSpan.classList.add('status');
                    statusSpan.title = user.statuspengguna === 'online' ? 'Online' : 'Offline';

                    // Append elements
                    memberItem.appendChild(profileImg);
                    memberItem.appendChild(nameSpan);
                    memberItem.appendChild(statusSpan);

                    memberList.appendChild(memberItem);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            memberList.innerHTML = `
                <li class="error-message">
                    Gagal memuat daftar anggota. 
                    <button onclick="fetchMemberList()">Coba Lagi</button>
                </li>
            `;
        }
    }
});
//
//
// Mengambil data profil pengguna dari API
const API_URL = 'https://bphtb-bappenda.up.railway.app';
console.log('🌐 Using Production API URL:', API_URL);
console.log('🔍 Starting profile data fetch...');

// Cek cookies sebelum fetch profile
console.log("🍪 Document cookies before profile fetch:", document.cookie);

// Load profile data
fetch(`${API_URL}/api/profile`, {credentials: 'include'})
.then(response => {
    console.log('📊 Profile API Response Status:', response.status);
    console.log('📋 Profile API Response Headers:', response.headers);
    
    if (!response.ok) {
        console.log('❌ Profile API failed with status:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('✅ Profile API response OK, parsing JSON...');
    return response.json();
})
.then(user => {
    // Validasi data user sebelum diproses
    if (!user || typeof user !== 'object') {
        console.warn('Data user tidak valid atau kosong');
        return;
    }

    console.log('Data pengguna diperoleh', user);
    console.log('Data userID:', user.userid);
    console.log('Data pengguna:', user.statuspengguna);

    // Ekspos divisi & userid secara global untuk komponen lain (poller/notification UI)
    try {
        window.currentUserDivisi = user.divisi || null;
        window.currentUserId = user.userid || user.id || null;
    } catch (_) {}

    // Mengubah textContent atau value untuk semua elemen dengan class yang sesuai
    if (user.userid) {
        document.querySelectorAll('.userid').forEach(element => {
            element.value = user.userid;
            element.textContent = user.userid;
        });
    }
    
    if (user.nama) {
        document.querySelectorAll('.nama').forEach(element => {
            element.value = user.nama;
            element.textContent = user.nama;
        });
    }

    // Memperbaiki path gambar untuk src dengan null check
    if (user.fotoprofil && typeof user.fotoprofil === 'string') {
        try {
            const fotoProfilUrl = decodeURIComponent(user.fotoprofil.replace(/\\/g, '/'));
            // Pastikan path dimulai dengan '/' untuk absolute path dari root server
            const absoluteFotoProfilUrl = fotoProfilUrl.startsWith('/') ? fotoProfilUrl : `/${fotoProfilUrl}`;
            
            // Pilih semua elemen dengan class 'fotoprofil' dan perbarui src-nya
            const fotoProfilElements = document.querySelectorAll('.fotoprofil');
            fotoProfilElements.forEach(element => {
                element.src = absoluteFotoProfilUrl;
                element.onerror = function() {
                    // Fallback image dengan absolute path
                    this.src = '/asset/men_dashboard-removebg-preview.png';
                };
            });
            console.log('Foto Profil yang Ditampilkan:', absoluteFotoProfilUrl);
        } catch (e) {
            console.warn('Gagal memproses foto profil:', e?.message || e);
            // Set default avatar jika error dengan absolute path
            document.querySelectorAll('.fotoprofil').forEach(element => {
                element.src = '/asset/men_dashboard-removebg-preview.png';
            });
        }
    } else {
        // Set default avatar jika fotoprofil tidak ada dengan absolute path
        document.querySelectorAll('.fotoprofil').forEach(element => {
            element.src = '/asset/men_dashboard-removebg-preview.png';
        });
    }

    // Log tanda tangan untuk debugging overlay paraf
    try {
        const signatureUrl = user.tanda_tangan_path ? 
            decodeURIComponent(String(user.tanda_tangan_path).replace(/\\/g, '/')) : null;
        
        // Pastikan path tanda tangan juga menggunakan absolute path
        const absoluteSignatureUrl = signatureUrl && !signatureUrl.startsWith('/') ? `/${signatureUrl}` : signatureUrl;
        
        // Ekspos agar modul lain bisa pakai bila perlu
        window.currentSignaturePath = absoluteSignatureUrl || null;
        if (absoluteSignatureUrl) {
            try { localStorage.setItem('signature_path', absoluteSignatureUrl); } catch(_) {}
        }
    } catch (e) {
        console.warn('Gagal memproses path tanda tangan:', e?.message || e);
    }
})
.catch(err => {
    console.error('Gagal mengambil data profil:', err);
    // Set default values jika gagal mengambil data
    document.querySelectorAll('.userid').forEach(element => {
        element.textContent = 'N/A';
    });
    document.querySelectorAll('.nama').forEach(element => {
        element.textContent = 'User';
    });
    document.querySelectorAll('.fotoprofil').forEach(element => {
        element.src = '/asset/men_dashboard-removebg-preview.png';
    });
});
//
//
