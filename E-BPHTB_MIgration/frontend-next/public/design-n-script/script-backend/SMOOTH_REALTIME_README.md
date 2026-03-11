# Smooth Real-Time Update System

Sistem update real-time yang smooth tanpa reload penuh, data baru akan muncul dengan animasi halus tanpa mengganggu user yang sedang mengedit.

## 🎯 Fitur Utama

- ✅ **Update tanpa reload** - Hanya tambahkan row baru, tidak reload seluruh tabel
- ✅ **Smooth animation** - Data baru muncul dengan animasi slide-in yang halus
- ✅ **Non-intrusive** - Tidak mengganggu user yang sedang mengedit/menginteraksi
- ✅ **Preserve scroll position** - Posisi scroll tetap terjaga saat update
- ✅ **Diff-based updates** - Hanya update data yang berubah
- ✅ **User activity detection** - Pause updates saat user sedang aktif

## 📦 File yang Dibutuhkan

1. `smooth-realtime-update.js` - Core class untuk real-time updates
2. `smooth-realtime-animations.css` - CSS untuk animasi
3. File implementasi sesuai kebutuhan (contoh: `lsb_smooth_realtime_example.js`)

## 🚀 Cara Penggunaan

### 1. Include File CSS dan JS

```html
<!-- CSS untuk animasi -->
<link rel="stylesheet" href="../../../design-n-script/design_css/design_variant/Main-design_isi/smooth-realtime-animations.css">

<!-- Core class -->
<script src="../../../design-n-script/script-backend/smooth-realtime-update.js"></script>

<!-- Implementasi untuk tabel Anda -->
<script src="../../../design-n-script/script-backend/lsb_smooth_realtime_example.js"></script>
```

### 2. Buat Fungsi Render Row

Fungsi ini akan dipanggil untuk membuat row baru saat data baru masuk:

```javascript
function renderLSBRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-nobooking', item.nobooking || '');
    
    // Buat cells sesuai struktur tabel Anda
    const cells = [
        item.nobooking || '-',
        item.namawajibpajak || '-',
        // ... cells lainnya
    ];
    
    cells.forEach((text, idx) => {
        const cell = row.insertCell(idx);
        cell.textContent = text;
    });
    
    // Tambahkan button/action jika perlu
    const actionCell = row.insertCell(cells.length);
    // ... action buttons
    
    return row;
}
```

### 3. Initialize Smooth Real-Time Updater

```javascript
const updater = new SmoothRealTimeUpdater({
    tableId: 'LSBTable',                    // ID tabel
    tbodySelector: '#LSBTable tbody',      // Selector tbody
    apiEndpoint: '/api/LSB_berkas-complete', // Endpoint API
    dataKey: 'nobooking',                   // Unique identifier
    renderRowFunction: renderLSBRow,         // Fungsi render row
    interval: 5000                          // Interval polling (ms)
});

// Start monitoring
updater.start();
```

## ⚙️ Konfigurasi Options

| Option | Type | Default | Deskripsi |
|--------|------|---------|-----------|
| `tableId` | string | `'dataTable'` | ID dari tabel |
| `tbodySelector` | string | `'tbody.data-masuk'` | CSS selector untuk tbody |
| `apiEndpoint` | string | - | Endpoint API untuk fetch data |
| `dataKey` | string | `'nobooking'` | Key unik untuk setiap row |
| `renderRowFunction` | function | - | Fungsi untuk render row baru |
| `interval` | number | `5000` | Interval polling dalam milliseconds |

## 🎨 Animasi yang Tersedia

### 1. New Row Animation
Row baru akan muncul dengan animasi slide-in dari atas:
- Fade in (opacity 0 → 1)
- Slide down (translateY -20px → 0)
- Highlight effect (border biru)

### 2. Update Highlight
Row yang diupdate akan memiliki highlight kuning sementara

### 3. Remove Animation
Row yang dihapus akan fade out dan slide ke kiri

## 🔧 Method yang Tersedia

### `start()`
Mulai real-time monitoring

```javascript
updater.start();
```

### `stop()`
Hentikan real-time monitoring

```javascript
updater.stop();
```

### `toggle()`
Toggle monitoring on/off

```javascript
const isEnabled = updater.toggle();
```

### `trackUserActivity()`
Mark bahwa user sedang aktif (pause updates)

```javascript
updater.trackUserActivity();
```

### `checkAndUpdate()`
Manual check untuk updates (biasanya dipanggil otomatis)

```javascript
await updater.checkAndUpdate();
```

## 📝 Contoh Implementasi Lengkap

Lihat file `lsb_smooth_realtime_example.js` untuk contoh implementasi lengkap untuk tabel LSB.

## 🎯 Best Practices

### 1. Track User Activity
Pastikan untuk track user activity saat user sedang mengedit:

```javascript
// Saat user klik button
button.addEventListener('click', () => {
    updater.trackUserActivity();
    // ... action
});

// Saat user input
input.addEventListener('input', () => {
    updater.trackUserActivity();
});
```

### 2. Preserve User State
Jika user sedang mengedit row, jangan update row tersebut:

```javascript
// Mark row sebagai sedang diedit
row.classList.add('user-editing');

// Di renderRowFunction, skip update jika row sedang diedit
if (row.classList.contains('user-editing')) {
    return; // Skip update
}
```

### 3. Handle Initial Load
Pastikan initial load selesai sebelum start real-time:

```javascript
// Load data pertama kali
await loadTableLSB();

// Setelah selesai, initialize lastDataMap
const existingRows = document.querySelectorAll('tr[data-nobooking]');
existingRows.forEach(row => {
    const key = row.getAttribute('data-nobooking');
    updater.lastDataMap.set(key, { nobooking: key });
});

// Baru start real-time
updater.start();
```

## 🐛 Troubleshooting

### Data tidak muncul
- Pastikan `apiEndpoint` benar
- Check console untuk error
- Pastikan `renderRowFunction` return valid `<tr>` element

### Animasi tidak smooth
- Pastikan CSS `smooth-realtime-animations.css` sudah di-include
- Check browser support untuk CSS transitions

### Update terlalu sering
- Increase `interval` value
- Pastikan `trackUserActivity()` dipanggil saat user aktif

### Scroll position berubah
- System sudah preserve scroll position secara otomatis
- Jika masih bermasalah, check apakah ada CSS yang override

## 🔄 Perbedaan dengan System Lama

| Fitur | System Lama | Smooth Real-Time |
|-------|-------------|------------------|
| Update method | Reload seluruh tabel | Hanya tambah row baru |
| Animation | Tidak ada | Smooth slide-in |
| User interruption | Bisa mengganggu | Non-intrusive |
| Performance | Reload semua data | Diff-based updates |
| Scroll position | Ter-reset | Terjaga |

## 📚 Referensi

- [MDN: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

