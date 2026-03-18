/**
 * PAGINATION EXAMPLES & UTILITIES
 * Contoh penggunaan dan utility functions untuk pagination
 */

// ========================================
// CONTOH PENGGUNAAN DASAR
// ========================================

/**
 * Contoh pagination sederhana
 */
function contohPaginationSederhana() {
    const currentPage = 1;
    const totalPages = 10;
    
    displayPagination(currentPage, totalPages);
}

/**
 * Contoh pagination dengan banyak halaman
 */
function contohPaginationBanyakHalaman() {
    const currentPage = 5;
    const totalPages = 25;
    
    displayPagination(currentPage, totalPages);
    // Hasil: << < 1 ... 3 4 [5] 6 7 ... 25 > >>
}

/**
 * Contoh pagination di halaman pertama
 */
function contohPaginationHalamanPertama() {
    const currentPage = 1;
    const totalPages = 15;
    
    displayPagination(currentPage, totalPages);
    // Hasil: [<<] [<] [1] 2 3 4 5 ... 15 > >>
}

/**
 * Contoh pagination di halaman terakhir
 */
function contohPaginationHalamanTerakhir() {
    const currentPage = 20;
    const totalPages = 20;
    
    displayPagination(currentPage, totalPages);
    // Hasil: << < 1 ... 16 17 18 19 [20] [>>] [>]
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate pagination info
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} itemsPerPage - Items per page
 * @param {number} totalItems - Total items
 * @returns {Object} Pagination info
 */
function calculatePaginationInfo(currentPage, totalPages, itemsPerPage = 10, totalItems = 0) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return {
        currentPage,
        totalPages,
        itemsPerPage,
        totalItems,
        startItem,
        endItem,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
        isFirst: currentPage === 1,
        isLast: currentPage === totalPages
    };
}

/**
 * Generate pagination data for API
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination parameters
 */
function generatePaginationParams(page = 1, limit = 10) {
    return {
        page: Math.max(1, page),
        limit: Math.max(1, Math.min(100, limit)), // Max 100 items per page
        offset: (Math.max(1, page) - 1) * Math.max(1, Math.min(100, limit))
    };
}

/**
 * Calculate total pages
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page
 * @returns {number} Total pages
 */
function calculateTotalPages(totalItems, itemsPerPage) {
    return Math.ceil(totalItems / itemsPerPage);
}

// ========================================
// ADVANCED PAGINATION FEATURES
// ========================================

/**
 * Pagination dengan jump to page
 */
function createPaginationWithJump(currentPage, totalPages, onPageChange, onJumpToPage) {
    const container = document.createElement('div');
    container.className = 'pagination-with-jump';
    
    // Regular pagination
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'list-button';
    
    // Generate pagination buttons (using existing function)
    const pageButtons = generatePageNumbers(currentPage, totalPages);
    
    // First and Previous buttons
    const firstBtn = createPaginationButton('first', '<<', currentPage === 1, () => onPageChange(1));
    const prevBtn = createPaginationButton('prev', '<', currentPage === 1, () => onPageChange(currentPage - 1));
    paginationDiv.appendChild(firstBtn);
    paginationDiv.appendChild(prevBtn);
    
    // Page numbers
    pageButtons.forEach(pageInfo => {
        if (pageInfo.type === 'number') {
            const pageButton = createPaginationButton(
                'number',
                pageInfo.number,
                pageInfo.number === currentPage,
                () => onPageChange(pageInfo.number),
                pageInfo.number === currentPage ? 'active' : ''
            );
            paginationDiv.appendChild(pageButton);
        } else if (pageInfo.type === 'ellipsis') {
            const ellipsisButton = createPaginationButton('ellipsis', '...', false, null, 'ellipsis');
            paginationDiv.appendChild(ellipsisButton);
        }
    });
    
    // Next and Last buttons
    const nextBtn = createPaginationButton('next', '>', currentPage === totalPages, () => onPageChange(currentPage + 1));
    const lastBtn = createPaginationButton('last', '>>', currentPage === totalPages, () => onPageChange(totalPages));
    paginationDiv.appendChild(nextBtn);
    paginationDiv.appendChild(lastBtn);
    
    // Jump to page input
    const jumpDiv = document.createElement('div');
    jumpDiv.className = 'pagination-jump';
    jumpDiv.innerHTML = `
        <input type="number" min="1" max="${totalPages}" value="${currentPage}" 
               placeholder="Halaman" class="jump-input">
        <button class="jump-btn pagination-btn" onclick="jumpToPage()">Go</button>
    `;
    
    // Add jump functionality
    window.jumpToPage = function() {
        const input = jumpDiv.querySelector('.jump-input');
        const page = parseInt(input.value);
        if (page >= 1 && page <= totalPages) {
            onJumpToPage(page);
        }
    };
    
    container.appendChild(paginationDiv);
    container.appendChild(jumpDiv);
    
    return container;
}

/**
 * Pagination dengan items per page selector
 */
function createPaginationWithItemsPerPage(currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange) {
    const container = document.createElement('div');
    container.className = 'pagination-with-items-per-page';
    
    // Items per page selector
    const itemsPerPageDiv = document.createElement('div');
    itemsPerPageDiv.className = 'items-per-page-selector';
    itemsPerPageDiv.innerHTML = `
        <label for="itemsPerPage">Items per page:</label>
        <select id="itemsPerPage" onchange="changeItemsPerPage(this.value)">
            <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
            <option value="25" ${itemsPerPage === 25 ? 'selected' : ''}>25</option>
            <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
        </select>
    `;
    
    // Items info
    const itemsInfo = document.createElement('div');
    itemsInfo.className = 'items-info';
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    itemsInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} items`;
    
    // Regular pagination
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'list-button';
    
    // Add pagination buttons here (similar to above)
    
    // Add change items per page functionality
    window.changeItemsPerPage = function(newItemsPerPage) {
        onItemsPerPageChange(parseInt(newItemsPerPage));
    };
    
    container.appendChild(itemsPerPageDiv);
    container.appendChild(itemsInfo);
    container.appendChild(paginationDiv);
    
    return container;
}

// ========================================
// PAGINATION STYLES ENHANCEMENT
// ========================================

/**
 * Add custom pagination styles
 */
function addCustomPaginationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .pagination-with-jump {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        
        .pagination-jump {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .jump-input {
            width: 60px;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            text-align: center;
        }
        
        .jump-btn {
            min-width: 40px;
            height: 40px;
            padding: 0 12px;
        }
        
        .pagination-with-items-per-page {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            margin: 20px 0;
        }
        
        .items-per-page-selector {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .items-per-page-selector label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .items-per-page-selector select {
            padding: 6px 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
        }
        
        .items-info {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        @media (max-width: 768px) {
            .pagination-with-jump {
                flex-direction: column;
                gap: 15px;
            }
            
            .pagination-with-items-per-page {
                gap: 10px;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize pagination system
 */
function initPaginationSystem() {
    // Add custom styles
    addCustomPaginationStyles();
    
    // Add keyboard navigation
    addPaginationKeyboardSupport();
    
    console.log('Pagination system initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPaginationSystem);
} else {
    initPaginationSystem();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        contohPaginationSederhana,
        contohPaginationBanyakHalaman,
        contohPaginationHalamanPertama,
        contohPaginationHalamanTerakhir,
        calculatePaginationInfo,
        generatePaginationParams,
        calculateTotalPages,
        createPaginationWithJump,
        createPaginationWithItemsPerPage,
        initPaginationSystem
    };
}
