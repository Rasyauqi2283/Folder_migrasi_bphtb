# Progress Migrasi — 10 Maret 2025

Catatan progress migrasi dari **E-BPHTB_root_utama** (legacy) ke **E-BPHTB_MIgration** (Next.js + Go). Dokumen ini menandakan bagian mana yang sudah dipindah dan mana yang masih bergantung pada file/backend utama agar target **100% tidak bergantung pada root_utama** tercapai.

---

## Ringkasan Hari Ini

| Aspek | Legacy (root_utama) | Migrasi (E-BPHTB_MIgration) | Ket. |
|-------|---------------------|------------------------------|------|
| **Role PPAT (UI)** | HTML + JS di `public/html_folder/PPAT/` | Next.js TSX di `(protected)/ppat/` | Paritas halaman |
| **API PPAT** | Node (`endpoint_ppat.js`, `index.js`, dll.) | Go **proxy** ke Node | Belum port ke Go |
| **Dashboard PPAT** | `ppat-dashboard.html` | `/ppat` (page.tsx) + fetch API | Count dari API |
| **Booking SSPD Badan** | `BOOKING-SSPD/bookingsspd-badan.html` | `/ppat/booking-sspd/badan` | Tabel + aksi |
| **Booking SSPD Perorangan** | `BOOKING-SSPD/bookingsspd-perorangan.html` | `/ppat/booking-sspd/perorangan` | Tabel + aksi |
| **Laporan Rekap** | `LAPORAN-PPAT/laporan_rekap.html` | `/ppat/laporan/rekap` | Tabel + search + pagination |
| **Laporan Rincian** | `LAPORAN-PPAT/rincian_laporan_bulanan.html` | `/ppat/laporan/rincian` | Sumber data sama (rekap/diserahkan) |
| **Monitoring Keterlambatan** | `monitoring_keteralmbatan_dokumen_ppat.html` (kosong) | `/ppat/laporan/monitoring-keterlambatan` | Placeholder |
| **Permohonan Validasi** | `Monitoring_SSPD/permohonan_validasi.html` | `/ppat/permohonan-validasi/[nobooking]` | Placeholder |

---

## Yang Sudah Dipindah / Dibangun di Migrasi

### Backend Go
- **Handler Go-native PPAT (Tahap 1–3):**  
  `GET /api/ppat/load-all-booking`, `GET /api/ppat/rekap/diserahkan`, `POST /api/ppat/send-now`,  
  `POST /api/ppat_create-booking-and-bphtb`, `POST /api/ppat_create-booking-and-bphtb-perorangan`,  
  `GET /api/ppat/booking/{nobooking}`, `PUT /api/ppat/update-trackstatus/{nobooking}`,  
  `DELETE /api/ppat/booking/{nobooking}`, `GET /api/ppat/quota` — semuanya di Go (repository PPAT + handler), auth via cookie `ebphtb_userid`.
- **Proxy PPAT (sisa):** `POST /api/ppat/upload-signatures`, `POST /api/ppat/upload-documents`, `GET /api/ppat/get-documents`, `GET /api/ppat/file-proxy`, `POST /api/ppat/create-permohonan-validasi`, `POST /api/ppat/schedule-send`, `/api/ppat_generate-pdf-badan/{nobooking}` dan endpoint PPAT lain yang belum di-port → masih diteruskan ke Node.

### Frontend Next.js (PPAT)
| No | Route | File | Keterangan |
|----|--------|------|------------|
| 1 | `/ppat` | `(protected)/ppat/page.tsx` | Dashboard: greeting, kalender, card ringkasan (count dari API) |
| 2 | `/ppat/booking-sspd/badan` | `ppat/booking-sspd/badan/page.tsx` | Tabel booking badan, modal TTD/Dokumen/Hapus, Kirim, expand row, link Permohonan Validasi |
| 3 | `/ppat/booking-sspd/badan/tambah` | `ppat/booking-sspd/badan/tambah/page.tsx` | Form lengkap tambah booking badan → API Go |
| 4 | `/ppat/booking-sspd/perorangan` | `ppat/booking-sspd/perorangan/page.tsx` | Tabel booking perorangan + modal TTD/Dokumen/Hapus |
| 5 | `/ppat/booking-sspd/perorangan/tambah` | `ppat/booking-sspd/perorangan/tambah/page.tsx` | Form lengkap tambah booking perorangan → API Go |
| 6 | `/ppat/laporan/rekap` | `ppat/laporan/rekap/page.tsx` | Tabel rekap diserahkan (API `rekap/diserahkan`), search, pagination |
| 7 | `/ppat/laporan/rincian` | `ppat/laporan/rincian/page.tsx` | Tabel rincian (sumber data sama) |
| 8 | `/ppat/laporan/monitoring-keterlambatan` | `ppat/laporan/monitoring-keterlambatan/page.tsx` | Placeholder (legacy kosong) |
| 9 | `/ppat/permohonan-validasi/[nobooking]` | `ppat/permohonan-validasi/[nobooking]/page.tsx` | Form permohonan validasi (prefill dari GET booking), generate kode, submit ke API Node (proxy) |

### Komponen & Layout
- **Layout PPAT:** `(protected)/ppat/layout.tsx` — guard role PPAT/PPATS/Notaris, sidebar + main + footer.
- **PPATSidebar:** `components/ppat/PPATSidebar.tsx` — menu Dashboard, Booking SSPD (Badan/Perorangan), Laporan PPAT (Rekap, Monitoring, Rincian), FAQ, Logout.

### Alur Login & Redirect
- Login sukses → redirect ke `/dashboard` (Next); dashboard redirect PPAT/PPATS/Notaris ke `/ppat`.
- Profil: "Ke Dashboard" untuk PPAT/PPATS/Notaris → `/ppat`.

---

## Ketergantungan ke Legacy (root_utama) — Perlu Dibenahi

Agar **100% tidak bergantung pada file utama**, berikut yang masih mengandalkan Node/root_utama:

### 1. API PPAT
| Endpoint | Status |
|----------|--------|
| `GET /api/ppat/load-all-booking`, `GET /api/ppat/rekap/diserahkan`, `POST /api/ppat/send-now`, `POST /api/ppat_create-booking-and-bphtb`, `POST /api/ppat_create-booking-and-bphtb-perorangan`, `GET /api/ppat/booking/{nobooking}`, `PUT /api/ppat/update-trackstatus/{nobooking}`, `DELETE /api/ppat/booking/{nobooking}`, `GET /api/ppat/quota` | **Go-native** (repository + handler, auth cookie) |
| `POST /api/ppat/upload-signatures`, `POST /api/ppat/upload-documents`, `GET /api/ppat/get-documents`, `GET /api/ppat/file-proxy`, `POST /api/ppat/create-permohonan-validasi`, `POST /api/ppat/schedule-send`, `GET /api/ppat_generate-pdf-badan/{nobooking}` | Masih **proxy** ke Node |

**Tindakan:** Port endpoint sisa (upload, dokumen, permohonan-validasi, schedule-send, PDF) ke Go bila ingin cutover penuh; hingga itu proxy tetap dipakai.

### 2. Session / Auth untuk PPAT
- Node memakai `req.session.user` untuk filter data per user (userid, divisi). Saat request di-proxy dari Go ke Node, session bisa tidak ikut (cookie/domain berbeda).
- **Tindakan:** Entah samakan session (shared store) atau kirim identitas user (token/header) dari Go ke Node saat proxy; idealnya auth 100% di Go dan API PPAT di Go baca user dari token/session Go.

### 3. Form & Fitur
| Halaman | Keterangan |
|---------|------------|
| Tambah Booking Badan/Perorangan | Form lengkap (WP, objek, NOP, dll.) ada; submit ke API Go. |
| Permohonan Validasi | Form lengkap; prefill dari GET booking (Go); submit ke API Node (create-permohonan-validasi) via proxy. |
| Tambah Tanda Tangan / Lihat Dokumen / Hapus Data | Modal + aksi terhubung ke API (upload-signatures, get-documents, update-trackstatus Dihapus) via proxy. |
| Laporan Rekap (form "Tambah Laporan Rekap Bulanan") | Di legacy pakai localStorage; di migrasi belum (opsional). |

### 4. Lain-lain yang Masih di root_utama
- **Admin:** Semua API admin masih proxy ke Node (lihat `MIGRASI_ADMIN.md`).
- **Login/OTP:** Masih bisa lewat Node (atau sudah di Go, tergantung konfigurasi).
- **PDF generate:** `ppat_generate-pdf-badan`, `generate-pdf-mohon-validasi`, dll. di Node; belum di Go.
- **File storage (dokumen, tanda tangan):** Upload dan proxy file masih mengandalkan Node/Railway logic.

---

## Checklist Menuju 100% Tanpa Bergantung root_utama

- [ ] **API PPAT di Go:** Implementasi `load-all-booking`, `rekap/diserahkan`, `send-now`, `create-booking` (badan + perorangan), `booking/:nobooking`, `get-documents`, `file-proxy`, `upload-signatures`, `upload-documents`, `quota`, `schedule-send` di backend Go; hapus proxy ke Node untuk PPAT.
- [ ] **Session/Auth PPAT:** Pastikan request dari Next ke Go membawa identitas user; API Go tidak bergantung pada session Node.
- [ ] **Form Tambah Booking Badan/Perorangan:** Halaman form lengkap + submit ke API (Go).
- [ ] **Form Permohonan Validasi:** Halaman/form lengkap + integrasi API.
- [ ] **Aksi Booking:** Modal Tanda Tangan, Lihat Dokumen, Hapus Data terhubung ke API (Go).
- [ ] **PDF & file:** Generate PDF dan layanan file PPAT di Go (atau layanan terpisah) agar tidak panggil Node.
- [ ] **Admin 100% di Go:** Semua endpoint admin di-port ke Go (lihat `MIGRASI_ADMIN.md`).
- [ ] **Monitoring Keterlambatan:** Definisikan requirement lalu implementasi (backend + frontend) di migrasi.

---

## Jumlah Ringkas (Hari Ini)

| Dari Legacy | Ke Migrasi |
|-------------|------------|
| 1 dashboard HTML | 1 dashboard TSX (`/ppat`) |
| 2 halaman booking HTML (badan, perorangan) | 2 halaman booking TSX + 2 placeholder form (tambah) |
| 3 halaman laporan HTML (rekap, monitoring, rincian) | 3 halaman laporan TSX (rekap & rincian pakai API; monitoring placeholder) |
| 1 form permohonan validasi HTML | 1 route placeholder TSX (dynamic) |
| — | 1 layout PPAT + 1 sidebar komponen |
| — | Proxy Go untuk seluruh `/api/ppat/*` dan beberapa `/api/ppat_*` |

**Kesimpulan:** UI dan alur halaman PPAT (PPAT/PPATS/Notaris) sudah dipindah ke Next.js dengan paritas tampilan dan alur utama; **backend PPAT masih 100% bergantung pada Node** via proxy. Untuk tidak bergantung lagi pada file utama, semua endpoint PPAT dan layanan terkait perlu di-port ke Go dan form/aksi yang belum paritas perlu dilengkapi.
