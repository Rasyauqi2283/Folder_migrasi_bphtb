// Menampilkan logout box saat mencapai akhir halaman
document.addEventListener('scroll', function() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolledPosition = window.scrollY;
    logoutBox.classList.toggle('visible', scrolledPosition >= scrollableHeight);  // Menampilkan logout box saat scroll di akhir halaman
});


document.addEventListener("DOMContentLoaded", () => {
    // Ambil data pengguna dari API (dari session backend)
    fetch('/api/user/dashboard')
        .then(response => response.json())
        .then(data => {
            // Update elemen-elemen HTML dengan data pengguna
            const usernameElement = document.querySelector('.Username');
            const divisiElement = document.querySelector('.Divisi');

            // Update Username: gunakan username jika ada, jika tidak gunakan userid sebagai fallback
            if (usernameElement) {
                // Validasi username: harus ada, tidak null, tidak undefined, tidak string kosong, dan bukan string "null"/"undefined"
                const hasValidUsername = data.username && 
                                        data.username !== null && 
                                        data.username !== undefined && 
                                        String(data.username).trim() !== '' && 
                                        String(data.username).trim().toLowerCase() !== 'null' && 
                                        String(data.username).trim().toLowerCase() !== 'undefined';
                
                if (hasValidUsername) {
                    // Username sudah ada dan valid, gunakan username
                    usernameElement.textContent = String(data.username).trim();
                } else if (data.userid) {
                    // Username belum ada atau tidak valid, gunakan userid sebagai fallback
                    usernameElement.textContent = String(data.userid);
                } else {
                    // Fallback jika userid juga tidak ada
                    usernameElement.textContent = 'Pengguna';
                }
            }

            // Update Divisi: selalu update jika ada (karena pasti ada dari awal login)
            if (divisiElement) {
                // Validasi divisi: harus ada dan tidak kosong
                const hasValidDivisi = data.divisi && 
                                      data.divisi !== null && 
                                      data.divisi !== undefined && 
                                      String(data.divisi).trim() !== '';
                
                if (hasValidDivisi) {
                    divisiElement.textContent = String(data.divisi).trim();
                } else {
                    // Fallback jika divisi tidak ada (seharusnya tidak terjadi karena divisi wajib dari awal login)
                    console.warn('⚠️ Divisi tidak ditemukan, menggunakan fallback');
                    divisiElement.textContent = 'Sistem';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            // Fallback jika API error
            const usernameElement = document.querySelector('.Username');
            const divisiElement = document.querySelector('.Divisi');
            if (usernameElement) usernameElement.textContent = 'Pengguna';
            if (divisiElement) divisiElement.textContent = 'Sistem';
        });
});

//
//
const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

let currentMonthIndex = new Date().getMonth(); // Get current month index (0-11)
let currentYear = new Date().getFullYear();

const monthElement = document.getElementById('calendar-month');
const calendarGrid = document.getElementById('calendar-grid');
const monthDropdown = document.getElementById('monthDropdown');

// Show current month and year
monthElement.textContent = `${months[currentMonthIndex]} ${currentYear}`;

// Toggle month dropdown visibility
monthElement.addEventListener('click', () => {
    monthDropdown.style.display = monthDropdown.style.display === 'none' ? 'block' : 'none';
});

// Set the selected month
const monthOptions = document.querySelectorAll('.month-option');
monthOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        currentMonthIndex = index;
        updateCalendar();
        monthDropdown.style.display = 'none';
    });
});

// Generate and display the calendar days
function updateCalendar() {
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0=Sunday, 6=Saturday
    const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate(); // Get total days in month

    // Clear the previous calendar grid
    calendarGrid.innerHTML = `
        <div class="day">Mo</div>
        <div class="day">Tu</div>
        <div class="day">We</div>
        <div class="day">Th</div>
        <div class="day">Fr</div>
        <div class="day weekend">Sa</div>
        <div class="day weekend">Su</div>
    `;

    // Create empty spaces before the first day of the month
    for (let i = 0; i < firstDayOfMonth - 1; i++) {
        calendarGrid.innerHTML += '<div class="empty"></div>';
    }

    // Get today's date for highlighting
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonthIndex && today.getFullYear() === currentYear;
    const todayDate = isCurrentMonth ? today.getDate() : null;

    // Generate days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('date');
        dayElement.textContent = day;

        // Calculate the day of week for weekend detection
        // firstDayOfMonth: 0=Sunday, 1=Monday, ..., 6=Saturday
        // Calendar starts with Monday, so we need to adjust
        // Convert Sunday-based to Monday-based: Sunday (0) becomes 6, Monday (1) becomes 0
        const mondayBasedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        const dayOfWeek = (mondayBasedFirstDay + day - 1) % 7;
        // Now: 0=Monday, 1=Tuesday, ..., 5=Saturday, 6=Sunday

        // Highlight weekend days (Saturday=5, Sunday=6)
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            dayElement.classList.add('weekend');
        }

        // Highlight today's date
        if (isCurrentMonth && day === todayDate) {
            dayElement.classList.add('today');
            dayElement.classList.add('current-day');
        }

        calendarGrid.appendChild(dayElement);
    }

    // Update the month/year in the calendar header
    monthElement.textContent = `${months[currentMonthIndex]} ${currentYear}`;
}

// Initialize the calendar with the current month
updateCalendar();