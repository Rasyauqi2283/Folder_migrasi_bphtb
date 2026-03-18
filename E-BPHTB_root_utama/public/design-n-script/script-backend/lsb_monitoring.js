// LSB Monitoring Script
let allMonitoringData = [];
let currentMonthData = [];
let currentPage = 1;
let totalPages = 1;
let totalRecords = 0;
const PAGE_SIZE = 5; // Same as Bank pagination

// Format date to Indonesian locale
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format month label (backend already returns Indonesian format)
function formatMonthLabel(bulanLabel) {
    // Backend already returns Indonesian format, just trim and return
    return bulanLabel ? bulanLabel.trim() : '';
}

// Load monitoring data
async function loadMonitoringData() {
    try {
        const response = await fetch('/api/LSB_monitoring-penyerahan', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Gagal memuat data monitoring');
        }
        
        allMonitoringData = data.months || [];
        
        renderCards();
        
        // Show empty state if no data
        const emptyState = document.getElementById('emptyState');
        const cardsGrid = document.getElementById('monitoringCardsGrid');
        if (allMonitoringData.length === 0) {
            emptyState.style.display = 'block';
            cardsGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            cardsGrid.style.display = 'grid';
        }
        
    } catch (error) {
        console.error('Error loading monitoring data:', error);
        const cardsGrid = document.getElementById('monitoringCardsGrid');
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Gagal memuat data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Render cards for each month
function renderCards() {
    const cardsGrid = document.getElementById('monitoringCardsGrid');
    cardsGrid.innerHTML = '';
    
    if (allMonitoringData.length === 0) {
        return;
    }
    
    allMonitoringData.forEach((month, index) => {
        const card = document.createElement('div');
        card.className = 'monitoring-card';
        card.dataset.monthKey = month.bulan_key;
        card.dataset.monthIndex = index;
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-month">${formatMonthLabel(month.bulan_label)}</div>
                <div class="card-icon">
                    <i class="fa fa-calendar"></i>
                </div>
            </div>
            <div class="card-body">
                <div class="card-count">${month.count}</div>
                <div class="card-label">Dokumen Diserahkan</div>
            </div>
            <div class="card-footer">
                <span class="card-badge">${month.count} item</span>
                <span class="card-arrow">→</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            openMonthTable(month);
        });
        
        cardsGrid.appendChild(card);
    });
}

// Open table for selected month
function openMonthTable(month) {
    currentMonthData = month.data || [];
    totalRecords = currentMonthData.length;
    totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
    currentPage = 1;
    
    // Update UI
    document.querySelectorAll('.monitoring-card').forEach(card => {
        card.classList.remove('active');
    });
    const activeCard = document.querySelector(`[data-month-key="${month.bulan_key}"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
    
    // Show table section
    const tableSection = document.getElementById('tableSection');
    const tableMonthTitle = document.getElementById('tableMonthTitle');
    tableMonthTitle.textContent = `Data Penyerahan - ${formatMonthLabel(month.bulan_label)}`;
    tableSection.classList.add('active');
    
    // Scroll to table
    tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Render table
    renderTable();
}

// Close table
function closeTable() {
    const tableSection = document.getElementById('tableSection');
    tableSection.classList.remove('active');
    
    // Remove active class from cards
    document.querySelectorAll('.monitoring-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make closeTable globally available
window.closeTable = closeTable;

// Render table with pagination
function renderTable() {
    const tbody = document.getElementById('monitoringTableBody');
    tbody.innerHTML = '';
    
    if (currentMonthData.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="11" style="text-align:center;color:#6b7280">Tidak ada data</td>`;
        tbody.appendChild(tr);
        renderPagination();
        return;
    }
    
    // Calculate pagination
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageData = currentMonthData.slice(start, end);
    
    // Calculate starting number
    const startNumber = start + 1;
    
    pageData.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${startNumber + idx}</td>
            <td>${item.nobooking || '-'}</td>
            <td>${item.noppbb || '-'}</td>
            <td>${item.tahunajb || '-'}</td>
            <td>${item.userid || '-'}</td>
            <td>${item.namawajibpajak || '-'}</td>
            <td>${item.namapemilikobjekpajak || '-'}</td>
            <td>${item.status || '-'}</td>
            <td>${item.trackstatus || '-'}</td>
            <td>${item.keterangan || '-'}</td>
            <td>${formatDate(item.updated_at)}</td>
        `;
        tbody.appendChild(tr);
    });
    
    renderPagination();
}

// Render pagination controls
function renderPagination() {
    const container = document.getElementById('monitoringPagination');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Always show pagination if we have data and (totalPages > 1 OR current page > 1 OR we got full page)
    const hasData = currentMonthData.length > 0;
    const gotFullPage = currentMonthData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).length === PAGE_SIZE;
    const shouldShowPagination = hasData && (totalPages > 1 || currentPage > 1 || gotFullPage);
    
    if (!shouldShowPagination) {
        return;
    }
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination-controls';
    pagination.innerHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPageMonitoring(${currentPage - 1})">
            <i class="fa fa-chevron-left"></i> Prev
        </button>
        <div class="page-numbers">
            ${generatePageNumbers(totalPages)}
        </div>
        <button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPageMonitoring(${currentPage + 1})">
            Next <i class="fa fa-chevron-right"></i>
        </button>
        <div class="page-info">
            Halaman ${currentPage} dari ${totalPages}${totalRecords > 0 ? ` (Total: ${totalRecords} data)` : ''}
        </div>
    `;
    
    container.appendChild(pagination);
}

// Generate page numbers with ellipsis
function generatePageNumbers(maxPages = totalPages) {
    let pages = [];
    const maxVisible = 5;
    const effectiveTotalPages = Math.max(maxPages, totalPages, currentPage);
    
    if (effectiveTotalPages <= maxVisible) {
        for (let i = 1; i <= effectiveTotalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                pages.push(i);
            }
            pages.push('ellipsis');
            pages.push(effectiveTotalPages);
        } else if (currentPage >= effectiveTotalPages - 2) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = effectiveTotalPages - 3; i <= effectiveTotalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('ellipsis');
            pages.push(effectiveTotalPages);
        }
    }
    
    return pages.map(page => {
        if (page === 'ellipsis') {
            return '<span class="page-ellipsis">...</span>';
        }
        const isActive = page === currentPage;
        return `<button class="page-number ${isActive ? 'active' : ''}" onclick="goToPageMonitoring(${page})">${page}</button>`;
    }).join('');
}

// Go to page
function goToPageMonitoring(page) {
    if (page < 1 || page === currentPage) return;
    if (page > totalPages) {
        console.warn('⚠️ [LSB Monitoring] Page exceeds totalPages, but allowing navigation');
    }
    currentPage = Math.min(Math.max(1, page), totalPages);
    renderTable();
    
    // Scroll to top of table
    const tableSection = document.getElementById('tableSection');
    if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Make goToPageMonitoring globally available
window.goToPageMonitoring = goToPageMonitoring;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMonitoringData();
});

