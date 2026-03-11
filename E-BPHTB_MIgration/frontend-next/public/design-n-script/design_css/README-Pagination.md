# Modern Pagination System

Sistem pagination modern dengan design yang menarik dan fungsionalitas lengkap untuk aplikasi BAPPENDA.

## 🚀 Fitur

- **Smart Pagination**: Menampilkan nomor halaman dengan ellipsis untuk halaman yang banyak
- **Navigation Buttons**: First (<<), Previous (<), Next (>), Last (>>)
- **Responsive Design**: Menyesuaikan dengan ukuran layar
- **Keyboard Navigation**: Navigasi menggunakan keyboard (Arrow keys, Home, End)
- **Loading States**: Visual feedback saat loading data
- **Accessibility**: ARIA labels dan keyboard support
- **Modern UI**: Design yang clean dan modern dengan hover effects

## 📁 File Structure

```
public/design-n-script/
├── design_css/
│   ├── pagination-design.css         # CSS untuk design pagination
│   └── README-Pagination.md          # Dokumentasi ini
└── script_backend/
    ├── pagination-examples.js        # Contoh penggunaan dan utilities
    └── badan-table-bookingsspd.js    # Implementasi utama
```

## 🎨 Design Features

### Visual Elements
- **Modern Buttons**: Rounded corners dengan gradient effects
- **Hover Effects**: Smooth transitions dan shadow effects
- **Active State**: Highlight untuk halaman aktif
- **Disabled State**: Visual feedback untuk tombol yang tidak aktif
- **Loading Animation**: Spinner untuk loading state

### Responsive Behavior
- **Desktop**: Menampilkan semua elemen pagination
- **Tablet**: Menyembunyikan beberapa nomor halaman
- **Mobile**: Hanya menampilkan elemen essential

## 📖 Cara Penggunaan

### 1. Include CSS

```html
<!-- Di head -->
<link rel="stylesheet" href="design-n-script/design_css/pagination-design.css">
```

### 2. HTML Structure

```html
<div class="table-footer">
    <div class="buttonPage">
        <div class="list-button"></div>  <!-- Pagination buttons akan muncul di sini -->
    </div>
</div>
```

### 3. JavaScript Implementation

```javascript
// Fungsi utama untuk menampilkan pagination
function displayPagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.list-button');
    // Implementation akan mengisi container dengan buttons
}

// Contoh penggunaan
displayPagination(1, 10); // Halaman 1 dari 10
```

## 🔧 API Reference

### `displayPagination(currentPage, totalPages)`

Menampilkan pagination dengan nomor halaman.

**Parameters:**
- `currentPage` (number): Halaman yang sedang aktif
- `totalPages` (number): Total jumlah halaman

**Example:**
```javascript
displayPagination(5, 25);
// Hasil: << < 1 ... 3 4 [5] 6 7 ... 25 > >>
```

### `createPaginationButton(type, text, disabled, onClick, extraClass, mobileClass)`

Membuat tombol pagination individual.

**Parameters:**
- `type` (string): 'first', 'prev', 'next', 'last', 'number', 'ellipsis'
- `text` (string): Text yang ditampilkan
- `disabled` (boolean): Apakah tombol disabled
- `onClick` (function): Function yang dipanggil saat klik
- `extraClass` (string): Class CSS tambahan
- `mobileClass` (string): Class untuk mobile responsive

### `generatePageNumbers(currentPage, totalPages)`

Generate array nomor halaman dengan smart pagination logic.

**Returns:**
```javascript
[
    { type: 'number', number: 1 },
    { type: 'ellipsis' },
    { type: 'number', number: 5, hideOnMobile: true },
    { type: 'number', number: 10 }
]
```

## 🎯 Contoh Implementasi

### Basic Pagination

```javascript
// Pagination sederhana
function loadTableData(page = 1) {
    // Load data dari API
    fetch(`/api/data?page=${page}`)
        .then(response => response.json())
        .then(data => {
            // Update table
            updateTable(data.items);
            
            // Update pagination
            displayPagination(data.currentPage, data.totalPages);
        });
}
```

### Advanced Pagination with Loading

```javascript
async function loadTableData(page = 1) {
    try {
        setPaginationLoading(true);
        
        const response = await fetch(`/api/data?page=${page}`);
        const data = await response.json();
        
        updateTable(data.items);
        displayPagination(data.currentPage, data.totalPages);
        
    } catch (error) {
        console.error('Error:', error);
        if (window.universalAlert) {
            window.universalAlert.error('Gagal memuat data');
        }
    } finally {
        setPaginationLoading(false);
    }
}
```

### Pagination dengan Jump to Page

```javascript
function createAdvancedPagination(currentPage, totalPages) {
    const container = createPaginationWithJump(
        currentPage, 
        totalPages,
        (page) => loadTableData(page),           // onPageChange
        (page) => loadTableData(page)            // onJumpToPage
    );
    
    document.querySelector('.pagination-container').appendChild(container);
}
```

## 🎨 Customization

### CSS Variables

```css
:root {
    --pagination-btn-size: 40px;
    --pagination-btn-border-radius: 8px;
    --pagination-primary-color: #3b82f6;
    --pagination-hover-color: #2563eb;
    --pagination-disabled-color: #9ca3af;
}
```

### Custom Colors

```css
.pagination-btn.active {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
    border-color: #your-color-1;
}
```

## ⌨️ Keyboard Navigation

### Supported Keys

- **Arrow Left/Up**: Previous page
- **Arrow Right/Down**: Next page  
- **Home**: First page
- **End**: Last page

### Implementation

```javascript
document.addEventListener('keydown', function(e) {
    // Keyboard navigation logic
    // Automatically handled by addPaginationKeyboardSupport()
});
```

## 📱 Responsive Behavior

### Desktop (> 768px)
- Menampilkan semua nomor halaman yang relevan
- Full navigation buttons (<<, <, >, >>)

### Tablet (≤ 768px)
- Menyembunyikan beberapa nomor halaman (hide-mobile class)
- Tetap menampilkan navigation buttons

### Mobile (≤ 480px)
- Hanya menampilkan nomor halaman essential
- Tombol menjadi lebih kecil
- Layout vertikal jika diperlukan

## 🔄 Loading States

### Visual Feedback

```javascript
// Set loading state
setPaginationLoading(true);

// Load data
await loadData();

// Remove loading state
setPaginationLoading(false);
```

### Loading Animation

```css
.pagination-btn.loading {
    position: relative;
    color: transparent;
}

.pagination-btn.loading::after {
    /* Spinner animation */
}
```

## ♿ Accessibility Features

### ARIA Labels

```html
<button aria-label="Halaman Pertama" role="button"><<</button>
<button aria-label="Halaman 5" role="button">5</button>
```

### Keyboard Support

- Tab navigation antara buttons
- Enter/Space untuk activate
- Arrow keys untuk navigate

### Screen Reader Support

- Proper ARIA labels
- Role attributes
- Semantic HTML structure

## 🐛 Troubleshooting

### Pagination tidak muncul
- Pastikan CSS sudah diinclude
- Check apakah `.list-button` element ada di HTML
- Pastikan `totalPages > 1`

### Styling tidak sesuai
- Pastikan CSS pagination-design.css dimuat
- Check conflict dengan CSS lain
- Pastikan class names sesuai

### Keyboard navigation tidak bekerja
- Pastikan `addPaginationKeyboardSupport()` dipanggil
- Check apakah pagination container ada
- Pastikan tidak ada event listener conflict

## 📝 Migration Guide

### Dari Pagination Lama

```javascript
// Sebelum
function displayPagination(currentPage, totalPages) {
    // Simple prev/next implementation
}

// Sesudah
function displayPagination(currentPage, totalPages) {
    // Modern pagination dengan nomor halaman
    // Smart pagination logic
    // Responsive design
}
```

### Update HTML

```html
<!-- Sebelum -->
<div class="list-button">
    <!-- Buttons akan diisi oleh JavaScript -->
</div>

<!-- Sesudah - sama, tapi dengan CSS yang lebih baik -->
<div class="list-button">
    <!-- Buttons akan diisi oleh JavaScript -->
</div>
```

## 🎯 Best Practices

### Performance
- Gunakan `requestAnimationFrame` untuk smooth animations
- Debounce pagination clicks jika diperlukan
- Lazy load data untuk halaman yang besar

### UX
- Tampilkan loading state saat loading data
- Gunakan smooth transitions
- Provide visual feedback untuk semua interactions

### Accessibility
- Selalu include ARIA labels
- Test dengan keyboard navigation
- Ensure proper color contrast

## 🤝 Contributing

Untuk berkontribusi pada Modern Pagination System:

1. Fork repository
2. Buat feature branch
3. Implement perubahan
4. Test di berbagai browser dan device
5. Update dokumentasi
6. Buat Pull Request

## 📄 License

Modern Pagination System adalah bagian dari project BAPPENDA dan mengikuti license yang sama.
