# 🎨 Dropdown Table Styling Guide

## 📁 File yang Dibuat/Diupdate

### 1. ✅ CSS Styling (Baru)
- **File**: `public/design-n-script/style-backend/dropdown-table.css`
- **Fungsi**: Styling konsisten untuk semua dropdown tabel

### 2. ✅ JavaScript Files (Diupdate)
- **LTB**: `public/design-n-script/script-backend/tb_ppatksspd.js`
- **Peneliti Verifikasi**: `public/design-n-script/script-backend/peneliti_verifikasi.js`
- **Peneliti Paraf**: `public/design-n-script/script-backend/peneliti_paraf.js`

## 🎯 Design Features

### ✨ Visual Design
- **Background**: Linear gradient `#111827` → `#0b0f1a`
- **Border**: Subtle border dengan `#374151`
- **Border Radius**: `12px` untuk tampilan modern
- **Box Shadow**: Layered shadow untuk depth
- **Padding**: `24px` untuk spacing yang nyaman

### 🏗️ Layout Structure
```
┌─────────────────────────────────────┐
│ Document Info Section               │
│ - No. Booking, Status, dll          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Signature Section                   │
│ - Approval checkbox                 │
│ - Signature preview                 │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Calculation Section (Verifikasi)    │
│ - Radio options                     │
│ - Sub-inputs dengan indentasi       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Action Buttons                      │
│ - Simpan button dengan loading      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Document Links Section              │
│ - Grid layout untuk links           │
└─────────────────────────────────────┘
```

### 🎨 Color Scheme
- **Primary Background**: `#111827` (Dark gray)
- **Secondary Background**: `#1f2937` (Lighter gray)
- **Text**: `#e5e7eb` (Light gray)
- **Borders**: `#4b5563` (Medium gray)
- **Accent**: `#3b82f6` (Blue)
- **Success**: `#22c55e` (Green)
- **Warning**: `#fbbf24` (Yellow)
- **Error**: `#ef4444` (Red)

## 📋 Cara Implementasi

### 1. Include CSS di HTML
```html
<!-- Di head section atau sebelum closing body -->
<link rel="stylesheet" href="../../design-n-script/style-backend/dropdown-table.css">
```

### 2. Struktur HTML yang Diharapkan
```html
<div class="dropdown-content-wrapper">
    <!-- Document Info Section -->
    <div class="document-info-section">
        <p><strong>Label:</strong> Value</p>
    </div>
    
    <!-- Signature Section -->
    <div class="signature-section">
        <div class="form-group">
            <label>
                <input type="radio" name="approval" value="yes">
                Setujui
            </label>
        </div>
        <div class="signature-preview">
            <img src="..." class="signature-image">
        </div>
    </div>
    
    <!-- Calculation Section (Hanya untuk Verifikasi) -->
    <div class="calculation-section">
        <h6 class="section-title">Title</h6>
        <div class="form-group">
            <label>
                <input type="radio" name="option" value="value">
                Option Label
            </label>
            <div class="sub-inputs">
                <input type="text" placeholder="Placeholder">
            </div>
        </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="action-buttons">
        <button class="btn-simpaninput">
            <span class="btn-text">Simpan</span>
            <span class="spinner" hidden>Loading...</span>
        </button>
    </div>
    
    <!-- Document Links -->
    <div class="document-links-section">
        <h6 class="document-links-title">Dokumen Terkait:</h6>
        <div class="document-links-list">
            <a href="..." class="document-link">
                <i class="fas fa-file"></i>
                Document Name
            </a>
        </div>
    </div>
</div>
```

## 🚀 Features

### ✨ Interactive Elements
- **Hover Effects**: Smooth transitions pada buttons dan links
- **Focus States**: Accessibility-friendly focus indicators
- **Loading States**: Spinner animation untuk buttons
- **Responsive**: Mobile-friendly grid layout

### 🎯 Form Controls
- **Radio Buttons**: Custom styling dengan accent color
- **Input Fields**: Dark theme dengan focus states
- **Sub-inputs**: Indented dengan border accent
- **Labels**: Consistent typography

### 📱 Responsive Design
- **Mobile**: Single column layout
- **Tablet**: Adaptive grid untuk document links
- **Desktop**: Full multi-column layout

## 🔧 Customization

### Warna Custom
```css
.dropdown-content-wrapper {
    background: linear-gradient(180deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### Spacing Custom
```css
.dropdown-content-wrapper {
    padding: 32px; /* Ubah dari 24px */
    margin: 20px 0; /* Ubah dari 16px 0 */
}
```

### Border Radius Custom
```css
.dropdown-content-wrapper {
    border-radius: 16px; /* Ubah dari 12px */
}
```

## 📊 Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🎨 Animation
- **Slide Down**: Dropdown muncul dengan smooth animation
- **Hover**: Transform dan shadow effects
- **Loading**: Spinner rotation animation

## 📝 Notes
- CSS menggunakan CSS Grid dan Flexbox untuk layout modern
- Semua colors menggunakan CSS custom properties untuk kemudahan maintenance
- Responsive design dengan mobile-first approach
- Accessibility features dengan proper focus states dan ARIA labels
