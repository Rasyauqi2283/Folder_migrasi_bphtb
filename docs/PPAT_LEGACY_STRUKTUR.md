# Role PPAT (Legacy) — Struktur & Pemetaan

Role PPAT dipakai oleh **3 tipe akun** yang serupa, hanya beda nama: **PPAT**, **PPATS**, **Notaris**. Semua memakai halaman yang sama di folder `html_folder/PPAT/`.

---

## 1. Struktur Folder Legacy

```
E-BPHTB_root_utama/public/html_folder/PPAT/
├── ppat-dashboard.html          ← Dashboard utama (menu lengkap)
├── ppatk-dashboard.html        ← Variant dashboard (link LAPORAN beda/partial)
├── BOOKING-SSPD/
│   ├── bookingsspd-badan.html      ← Booking SSPD Badan
│   └── bookingsspd-perorangan.html ← Booking SSPD Perorangan
├── LAPORAN-PPAT/
│   ├── laporan_rekap.html              ← Laporan Rekap PPAT
│   ├── monitoring_keteralmbatan_dokumen_ppat.html  ← Monitoring Keterlambatan (file kosong di legacy)
│   └── rincian_laporan_bulanan.html   ← Rincian Laporan Bulanan PPAT
└── Monitoring_SSPD/
    ├── permohonan_validasi.html   ← Permohonan Validasi SSPD (form validasi)
    └── Status_validasi.html       ← Status Validasi (tabel track status)
```

---

## 2. Menu Sidebar (dari ppat-dashboard.html)

| Menu | Submenu | Target HTML |
|------|---------|-------------|
| **Dashboard** | — | `ppat-dashboard.html` |
| **Booking SSPD** | Booking SSPD Badan | `BOOKING-SSPD/bookingsspd-badan.html` |
| | Booking SSPD Perorangan | `BOOKING-SSPD/bookingsspd-perorangan.html` |
| **Laporan PPAT** | Laporan Rekap PPAT | `LAPORAN-PPAT/laporan_rekap.html` |
| | Monitoring Keterlambatan | `LAPORAN-PPAT/monitoring_keteralmbatan_dokumen_ppat.html` |
| | Rincian Laporan Bulanan PPAT | `LAPORAN-PPAT/rincian_laporan_bulanan.html` |
| **FAQ** | — | `../FAQ/faq_page.html` |
| **Log Out** | — | (script logout) |

**Catatan:** Halaman di **Monitoring_SSPD** (Permohonan Validasi, Status Validasi) **tidak** ada di sidebar `ppat-dashboard.html`. Sidebar di **permohonan_validasi.html** dan **Status_validasi.html** punya menu tambahan **Validasi BPHTB** dengan submenu:
- Permohonan Validasi SSPD  
- Status Validasi  

Jadi ada dua “varian” menu: satu tanpa Validasi BPHTB (dashboard utama), satu dengan Validasi BPHTB (halaman Monitoring SSPD). Bisa jadi untuk PPAT tertentu (misalnya PPAT Khusus) atau flow yang berbeda.

---

## 3. Ringkasan Per Halaman

### 3.1 Dashboard
- **ppat-dashboard.html**: Welcome banner, kalender, summary cards (link ke validasi/laporan). Script: `dashboard.js`, `header_script.js`, `fungsi.js`, `header-backend.js`.
- **ppatk-dashboard.html**: Mirip, tapi link Laporan ke `LAPORAN-BULANAN-PPAT/Laporan-rekap_ppat.html` dan beberapa href kosong (Monitoring/Rincian).

### 3.2 BOOKING-SSPD
- **bookingsspd-badan.html**: Form + tabel Booking SSPD Badan. Tombol: Tambah Data, Tambah Tanda Tangan, Lihat Dokumen, Hapus Data. Modal upload tanda tangan. CSS: `form_design.css`, `dropdown-table.css`, `pagination-design.css`, `universal-alert.css`.
- **bookingsspd-perorangan.html**: Struktur sama untuk Booking SSPD Perorangan (form + tabel, tombol aksi sama).

### 3.3 LAPORAN-PPAT
- **laporan_rekap.html**: Form filter + tabel Laporan Rekap Bulanan. Form container (grid), table controls, pagination.
- **monitoring_keteralmbatan_dokumen_ppat.html**: File kosong di legacy (perlu isi/refactor).
- **rincian_laporan_bulanan.html**: Rincian laporan bulanan: header, cards grid, tabel, tombol PDF.

### 3.4 Monitoring_SSPD
- **permohonan_validasi.html**: Formulir Validasi PPAT (Form Permohonan). Section: Data Pemohon, dll. Tombol: Cari, Tambah, View Dokumen. CSS: `form_permohonan_design.css`, `tabel_ppatsspd.css`.
- **Status_validasi.html**: Tabel Status Validasi (No. Booking, NOP PBB, Tahun AJB, User ID, Nama WP, Nama Pemilik Objek, NPWP WP, Track Status). Script: `ppat_statusvalidasi.js`, `frontend_bookingsspd.js`.

---

## 4. Redirect di Migrasi (saat ini)

Di `(protected)/dashboard/page.tsx`, untuk **PPAT**, **PPATS**, **Notaris**:

- Redirect ke **legacy**:  
  `getLegacyBaseUrl() + "/html_folder/PPAT/ppat-dashboard.html"`

Belum ada route **TSX/Next** khusus role PPAT di folder migrasi; semua masih mengandalkan legacy HTML.

---

## 5. Rekomendasi untuk Migrasi Role PPAT

1. **Satu layout/sidebar** untuk PPAT, PPATS, Notaris (nama role bisa tampil di header saja).
2. **Route TSX** (contoh):
   - `/ppat` atau `/dashboard` (untuk PPAT) → dashboard TSX
   - `/ppat/booking-sspd/badan` → Booking SSPD Badan
   - `/ppat/booking-sspd/perorangan` → Booking SSPD Perorangan
   - `/ppat/laporan/rekap` → Laporan Rekap PPAT
   - `/ppat/laporan/monitoring-keterlambatan` → Monitoring Keterlambatan
   - `/ppat/laporan/rincian-bulanan` → Rincian Laporan Bulanan
   - `/ppat/validasi/permohonan` → Permohonan Validasi SSPD
   - `/ppat/validasi/status` → Status Validasi
3. **Backend**: Identifikasi endpoint API yang dipanggil tiap halaman legacy (fetch/script backend) lalu pindah ke Go atau proxy.
4. **Monitoring Keterlambatan**: Legacy file kosong; definisikan requirement lalu implementasi di TSX + API.

---

*Dibuat dari pembacaan legacy: PPAT, BOOKING-SSPD, LAPORAN-PPAT, Monitoring_SSPD.*
