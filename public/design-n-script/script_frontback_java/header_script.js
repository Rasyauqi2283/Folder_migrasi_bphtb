const userId = localStorage.getItem('userid'); // Ambil dari session/local storage

window.addEventListener('unload', function () {
if (userId) {
    navigator.sendBeacon('/api/v1/auth/logout', JSON.stringify({ userid: userId }));
}
});
///////////////
setInterval(() => {
if (userId) {
    fetch('/ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userid: userId }),
    });
}
}, 120000); // Setiap 2 menit
////////////////            //////////////////////////          ////////////////

// Profile and Member Overlays
const profileOverlay = document.getElementById('profile-overlay');
const profilePic = document.querySelector('.profile-pic');
// Event listener untuk klik pada profilePic dan membersCount untuk overlay
profilePic.addEventListener('click', function() {
    profileOverlay.classList.toggle('active');
});
// Close overlay jika klik di luar area overlay
document.addEventListener('click', function (event) {
    if (!profileOverlay.contains(event.target) && !profilePic.contains(event.target)) {
        profileOverlay.classList.remove('active');
    }
}, true);
////
// pindah ke laman profile
const profileButton = document.querySelector('.profile-btn');
// Deteksi base path secara otomatis

// Tambahkan event listener untuk klik
profileButton.addEventListener('click', function () {
// Cek apakah di local file system
    if (window.location.protocol === 'file:') {
        const currentDir = window.location.pathname.split('/').slice(0, -1).join('/');
        window.location.href = `${currentDir}/../../profile.html`;
    } else {
        // Jika di server web
        window.location.href = '/profile.html';
    }
});
//
// out overlay
const outButtons = document.querySelectorAll('.AUT');
const logoutOverlay = document.getElementById('logout-overlay');
const confirmLogoutButton = document.getElementById('confirm-logout');
const cancelLogoutButton = document.getElementById('cancel-logout');

// Menambahkan event listener ke setiap tombol logout
outButtons.forEach(button => {
    button.addEventListener('click', function () {
        logoutOverlay.classList.add('active');  // Menambahkan class 'active' untuk menampilkan overlay
    });
});

// Navigasi keluar saat tombol logout dikonfirmasi
confirmLogoutButton.addEventListener('click', function () {
    console.log("Tombol konfirmasi logout diklik");
    window.location.href = '/login.html';  // Redirect ke halaman login
});

// Menutup overlay logout saat tombol batal diklik
cancelLogoutButton.addEventListener('click', function () {
    console.log("Tombol batal logout diklik");
    logoutOverlay.classList.remove('active');  // Menghapus class 'active' untuk menyembunyikan overlay
});

// Menutup overlay jika klik di luar overlay (bukan di dalam area konfirmasi)
window.addEventListener('click', function (event) {
    if (event.target === logoutOverlay) {  // Cek jika klik di luar area konfirmasi
        logoutOverlay.classList.remove('active');  // Menghapus class 'active' untuk menyembunyikan overlay
    }
});


// Hide member section for specific divisions (PPAT, PPATS, Wajib Pajak)
(function() {
    const membersCountEl = document.getElementById('divisiMemberCount');
    const memberOverlayEl = document.getElementById('member-overlay');
    if (!membersCountEl && !memberOverlayEl) return;

    const getDivision = async () => {
        const localDiv = localStorage.getItem('divisi') || sessionStorage.getItem('divisi');
        if (localDiv) return localDiv;
        try {
            const resp = await fetch('/api/profile', { credentials: 'include', headers: { 'Accept': 'application/json' } });
            if (!resp.ok) return null;
            const data = await resp.json();
            return data?.divisi || null;
        } catch (_) {
            return null;
        }
    };

    const applyVisibility = (divisi) => {
        if (!divisi) return;
        const d = String(divisi).trim().toLowerCase();
        const shouldHide = d === 'ppat' || d === 'ppats' || d === 'wajib pajak';
        if (shouldHide) {
            if (membersCountEl) membersCountEl.style.display = 'none';
            if (memberOverlayEl) memberOverlayEl.style.display = 'none';
            const headerEl = document.querySelector('header');
            if (headerEl) headerEl.classList.add('member-hidden');
        } else {
            const headerEl = document.querySelector('header');
            if (headerEl) headerEl.classList.remove('member-hidden');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            getDivision().then(applyVisibility);
        });
    } else {
        getDivision().then(applyVisibility);
    }
})();

