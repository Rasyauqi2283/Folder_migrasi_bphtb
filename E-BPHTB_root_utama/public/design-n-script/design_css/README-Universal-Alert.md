# Universal Alert System

Sistem notifikasi yang konsisten dan reusable untuk semua halaman aplikasi BAPPENDA.

## 🚀 Fitur

- **Design Konsisten**: Alert dengan design modern dan responsive
- **Posisi Tengah**: Overlay di tengah layar dengan backdrop blur
- **Auto Close**: Alert otomatis hilang setelah 5 detik (dapat disesuaikan)
- **Click Outside**: Klik di luar overlay untuk menutup alert
- **Progress Bar**: Bar progress menunjukkan waktu tersisa
- **Multiple Types**: Success, Error, Warning, Info
- **Custom Buttons**: Tombol custom sesuai kebutuhan
- **Loading Alert**: Alert khusus untuk proses loading
- **Confirmation Dialog**: Dialog konfirmasi yang lebih baik dari confirm()

## 📁 File Structure

```
public/design-n-script/
├── design_css/
│   ├── universal-alert.css          # CSS untuk design alert
│   └── README-Universal-Alert.md    # Dokumentasi ini
└── script_backend/
    ├── universal-alert.js           # JavaScript utama
    └── alert-examples.js            # Contoh penggunaan
```

## 🎨 Design Features

### Visual Elements
- **Overlay**: Background gelap dengan blur effect
- **Container**: Card putih dengan border radius dan shadow
- **Icon**: Icon FontAwesome dengan background gradient
- **Typography**: Font hierarchy yang jelas
- **Colors**: Color scheme yang konsisten
- **Animation**: Smooth slide-in/out animation

### Responsive Design
- **Mobile**: Layout menyesuaikan ukuran layar
- **Tablet**: Optimized untuk tablet
- **Desktop**: Full featured untuk desktop

## 📖 Cara Penggunaan

### 1. Include CSS dan JavaScript

```html
<!-- Di head -->
<link rel="stylesheet" href="design-n-script/design_css/universal-alert.css">

<!-- Di body sebelum closing tag -->
<script src="design-n-script/script_backend/universal-alert.js"></script>
```

### 2. Penggunaan Dasar

```javascript
// Alert sukses
window.universalAlert.success('Data berhasil disimpan!');

// Alert error
window.universalAlert.error('Terjadi kesalahan!');

// Alert warning
window.universalAlert.warning('Peringatan!');

// Alert info
window.universalAlert.info('Informasi penting');
```

### 3. Penggunaan Lanjutan

```javascript
// Alert dengan opsi custom
window.universalAlert.show({
    type: 'success',
    title: 'Berhasil',
    message: 'Data berhasil disimpan!',
    duration: 3000,
    onClose: () => console.log('Alert ditutup')
});

// Alert loading
const loadingId = window.universalAlert.loading('Memproses...');
// Tutup setelah selesai
window.universalAlert.close(loadingId);

// Konfirmasi
const confirmed = await window.universalAlert.confirm(
    'Yakin ingin menghapus data?',
    'Konfirmasi Penghapusan'
);
```

### 4. Alert dengan Tombol Custom

```javascript
window.universalAlert.show({
    type: 'warning',
    title: 'Konfirmasi',
    message: 'Apakah Anda yakin?',
    buttons: [
        {
            text: 'Batal',
            class: 'alert-btn alert-btn-secondary',
            icon: 'fa-times',
            onclick: 'window.universalAlert.closeAll()'
        },
        {
            text: 'Ya',
            class: 'alert-btn alert-btn-primary',
            icon: 'fa-check',
            onclick: 'deleteData()'
        }
    ]
});
```

## 🔧 API Reference

### `universalAlert.show(options)`

Menampilkan alert dengan konfigurasi lengkap.

**Parameters:**
- `type` (string): 'success', 'error', 'warning', 'info'
- `title` (string): Judul alert
- `message` (string): Pesan alert
- `duration` (number): Durasi auto close dalam ms (default: 5000)
- `buttons` (array): Array tombol custom
- `onClose` (function): Callback saat alert ditutup
- `clickOutsideToClose` (boolean): Allow click outside to close (default: true)
- `showProgress` (boolean): Show progress bar (default: true)
- `showCloseButton` (boolean): Show close button (default: true)

### Quick Methods

```javascript
universalAlert.success(message, title, options)
universalAlert.error(message, title, options)
universalAlert.warning(message, title, options)
universalAlert.info(message, title, options)
universalAlert.loading(message, title)
```

### Utility Methods

```javascript
universalAlert.close(alertId)        // Tutup alert tertentu
universalAlert.closeAll()            // Tutup semua alert
universalAlert.confirm(message, title, options)  // Dialog konfirmasi
```

## 🎯 Contoh Implementasi

### Replace Alert Biasa

```javascript
// Sebelum
alert('Data berhasil disimpan!');

// Sesudah
window.universalAlert.success('Data berhasil disimpan!');
```

### Replace Confirm

```javascript
// Sebelum
const ok = confirm('Yakin hapus data?');

// Sesudah
const ok = await window.universalAlert.confirm('Yakin hapus data?');
```

### Error Handling

```javascript
try {
    await uploadData();
    window.universalAlert.success('Upload berhasil!');
} catch (error) {
    window.universalAlert.error('Upload gagal: ' + error.message);
}
```

### Loading State

```javascript
const loadingId = window.universalAlert.loading('Mengupload file...');

try {
    await uploadFile();
    window.universalAlert.close(loadingId);
    window.universalAlert.success('File berhasil diupload!');
} catch (error) {
    window.universalAlert.close(loadingId);
    window.universalAlert.error('Upload gagal: ' + error.message);
}
```

## 🎨 Customization

### CSS Variables

```css
:root {
    --alert-success-color: #10b981;
    --alert-error-color: #ef4444;
    --alert-warning-color: #f59e0b;
    --alert-info-color: #3b82f6;
    --alert-overlay-bg: rgba(0, 0, 0, 0.5);
    --alert-border-radius: 12px;
    --alert-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### Custom Themes

```javascript
// Dark theme
document.documentElement.setAttribute('data-theme', 'dark');

// Custom colors
document.documentElement.style.setProperty('--alert-success-color', '#custom-color');
```

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🔄 Migration Guide

### Dari Alert Lama ke Universal Alert

1. **Include CSS dan JS** di halaman yang menggunakan alert
2. **Replace fungsi showAlert** yang sudah ada
3. **Update alert() calls** menjadi universal alert
4. **Update confirm() calls** menjadi universal confirm
5. **Test di berbagai browser**

### Contoh Migration

```javascript
// File lama
function showAlert(type, message) {
    // Implementation lama
}

// File baru
function showAlert(type, message, title = null) {
    if (window.universalAlert) {
        return window.universalAlert.show({
            type,
            title: title || getDefaultTitle(type),
            message,
            duration: 5000
        });
    } else {
        // Fallback
        alert(message);
    }
}
```

## 🐛 Troubleshooting

### Alert tidak muncul
- Pastikan CSS dan JS sudah diinclude
- Check console untuk error
- Pastikan `window.universalAlert` sudah terdefinisi

### Styling tidak sesuai
- Pastikan CSS universal-alert.css dimuat
- Check conflict dengan CSS lain
- Pastikan FontAwesome tersedia untuk icon

### Animation tidak smooth
- Pastikan browser support CSS animation
- Check performance dengan DevTools
- Disable animation jika diperlukan

## 📝 Notes

- Alert akan otomatis terhapus setelah 5 detik
- Klik di luar overlay akan menutup alert
- Progress bar menunjukkan waktu tersisa
- Multiple alert bisa muncul bersamaan
- Alert responsive untuk semua ukuran layar

## 🤝 Contributing

Untuk berkontribusi pada Universal Alert System:

1. Fork repository
2. Buat feature branch
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## 📄 License

Universal Alert System adalah bagian dari project BAPPENDA dan mengikuti license yang sama.
