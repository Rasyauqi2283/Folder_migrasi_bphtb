# Panduan Migrasi Booking SSPD Badan

Panduan scope dan tahapan perakitan halaman **Booking SSPD Badan** di folder migrasi agar paritas fungsional dengan legacy.

---

## 1. Ringkasan

| Aspek | Keterangan |
|-------|------------|
| **Legacy** | `E-BPHTB_root_utama/public/html_folder/PPAT/BOOKING-SSPD/bookingsspd-badan.html` |
| **Migrasi** | `E-BPHTB_MIgration/frontend-next/app/(protected)/ppat/booking-sspd/badan/page.tsx` |
| **Target** | Paritas fungsional dengan legacy |

---

## 2. Daftar Endpoint

| Endpoint | Fungsi | Status |
|----------|--------|--------|
| `GET /api/ppat/load-all-booking` | Load tabel booking | Go |
| `POST /api/ppat_create-booking-and-bphtb` | Create booking badan | Go |
| `GET /api/ppat/booking/{nobooking}` | Detail booking | Go |
| `PUT /api/ppat/update-trackstatus/{nobooking}` | Update status (termasuk Dihapus) | Go |
| `POST /api/ppat/send-now` | Kirim ke Bappenda sekarang | Go |
| `GET /api/ppat/quota` | Cek kuota harian | Go |
| `DELETE /api/ppat/booking/{nobooking}` | Hapus permanen | Go |
| `POST /api/ppat/schedule-send` | Jadwalkan pengiriman | Proxy |
| `GET /api/check-my-signature` | Cek tanda tangan user (guard form) | Proxy |
| `POST /api/ppat/upload-signatures` | Upload TTD | Proxy |
| `POST /api/ppat/upload-documents` | Upload dokumen (akta, sertifikat, pelengkap) | Proxy |
| `GET /api/ppat/get-documents` | List dokumen per booking | Proxy |
| `GET /api/ppat/file-proxy` | View/download file | Proxy |
| `POST /api/ppat/update-file-urls` | Update URL dokumen | Proxy |
| `POST /api/ppat/update-file-id` | Update ID file | Proxy |
| `GET /api/ppat_generate-pdf-badan/{nobooking}` | PDF booking (buka tab baru) | Proxy |
| `GET /api/ppat/generate-pdf-mohon-validasi/{nobooking}` | PDF permohonan validasi | Proxy |

---

## 3. Scope Per Fitur

### 3.1 Action Buttons (Atas)

| Tombol | Legacy | Migrasi | Keterangan |
|--------|--------|---------|------------|
| Tambah Data | Ada, toggle form inline | Ada, link ke halaman form | Migrasi: halaman terpisah `/ppat/booking-sspd/badan/tambah` |
| Tambah Tanda Tangan | Ada, modal | Ada, modal | Sudah |
| Lihat Dokumen | Ada, butuh baris terpilih | Ada, buka PDF bila baris terpilih | Sudah |
| Hapus Data | Ada, butuh baris terpilih | Ada, modal pilih nobooking | Sudah |

### 3.2 Form Tambah

| Aspek | Legacy | Migrasi |
|-------|--------|---------|
| Lokasi | Inline (hidden, toggle) | Halaman terpisah |
| Guard signature | Cek `check-my-signature` sebelum buka | Sudah |
| Field | Lengkap (NOP split, NPWP split, WP, objek, NJOP, perhitungan pajak) | Ada di halaman tambah |

### 3.3 Tabel

| Fitur | Legacy | Migrasi |
|-------|--------|---------|
| Kolom | No Booking, NOP PBB, Tahun AJB, Nama WP, Nama Pemilik Objek, NPWP WP, Status, Kirim | Sama |
| Search | Ada | Sudah |
| Pagination | Ada | Ada |
| Path dokumen di response | `akta_tanah_path`, `sertifikat_tanah_path`, `pelengkap_path`, dll. | Sudah |

### 3.4 Expand Row (Dropdown per Baris)

| Fitur | Legacy | Migrasi |
|-------|--------|---------|
| Isi Form Permohonan | Link ke form | Link ke `/ppat/permohonan-validasi/[nobooking]` |
| Lihat Dokumen Validasi | Tombol, buka PDF permohonan validasi | Sudah |
| Dokumen Wajib (Akta, Sertifikat, Pelengkap) | Kartu upload per tipe, drag-drop, preview | Sudah |

### 3.5 Kirim ke Bappenda

| Aspek | Legacy | Migrasi |
|-------|--------|---------|
| Flow | Klik per baris → modal kuota + jadwal → Kirim Sekarang atau Jadwalkan | Langsung `send-now` tanpa modal |
| Modal kuota | Ada | Belum |
| Schedule-send | Ada | Belum |

### 3.6 PDF

| Jenis | Endpoint | Legacy | Migrasi |
|-------|----------|--------|---------|
| PDF Booking | `ppat_generate-pdf-badan` | Tombol Lihat Dokumen buka di tab baru | Belum |
| PDF Permohonan Validasi | `generate-pdf-mohon-validasi` | Tombol di expand row | Belum |

---

## 4. Empat Tahap (25% per Tahap)

### Tahap 1 (25%) — Fondasi Data + Aksi Dasar

**Tujuan:** Response `load-all-booking` lengkap dan aksi Lihat PDF berfungsi.

| No | Task | Detail |
|----|------|--------|
| 1 | Path dokumen di load-all-booking | Tambah `akta_tanah_path`, `sertifikat_tanah_path`, `pelengkap_path`, `pdf_dokumen_path`, `file_withstempel_path` di response Go |
| 2 | Tombol Lihat Dokumen (utama) | Setelah baris terpilih, tombol buka `/api/ppat_generate-pdf-badan/{nobooking}` di tab baru |
| 3 | Tombol Lihat Dokumen Validasi di expand row | Tombol di expand row panggil `/api/ppat/generate-pdf-mohon-validasi/{nobooking}` (blob/baru tab) |

**Kriteria Selesai:**
- Response tabel mengandung path dokumen
- Klik Lihat Dokumen buka PDF booking
- Klik Lihat Dokumen Validasi di expand row buka PDF permohonan validasi

---

### Tahap 2 (25%) — Search + Guard + UX

**Tujuan:** Search tabel dan guard signature pada alur Tambah Data.

| No | Task | Detail |
|----|------|--------|
| 1 | Search di tabel | Input search + parameter `q` atau `search` ke `load-all-booking` |
| 2 | Guard signature | Sebelum redirect ke form Tambah, cek `GET /api/check-my-signature`; jika `has_signature: false`, konfirmasi ke profil |

**Kriteria Selesai:**
- Search memfilter hasil tabel
- Klik Tambah Data: jika belum punya TTD, user diarahkan/konfirmasi ke profil

---

### Tahap 3 (25%) — Modal Kuota & Jadwal Kirim

**Tujuan:** Tombol Kirim buka modal dengan opsi Kirim Sekarang atau Jadwalkan.

| No | Task | Detail |
|----|------|--------|
| 1 | Modal Kirim | Saat klik "Kirim ke Bappenda", buka modal (bukan langsung POST) |
| 2 | Fetch quota | `GET /api/ppat/quota?date=` tampilkan sisa kuota |
| 3 | Opsi Kirim Sekarang | Tombol panggil `POST /api/ppat/send-now` |
| 4 | Opsi Jadwalkan | Input tanggal + `POST /api/ppat/schedule-send` dengan `nobooking` dan `scheduled_for` |

**Kriteria Selesai:**
- Modal menampilkan kuota
- Kirim Sekarang dan Jadwalkan berfungsi

---

### Tahap 4 (25%) — Upload Dokumen per Booking

**Tujuan:** Di expand row, tampil kartu dokumen dan upload Akta/Sertifikat/Pelengkap.

| No | Task | Detail |
|----|------|--------|
| 1 | Kartu dokumen di expand row | Tampilkan Akta, Sertifikat, Pelengkap; preview jika path ada |
| 2 | Upload per tipe | Input file + `POST /api/ppat/upload-documents` dengan `nobooking` dan field yang sesuai |
| 3 | Update URL/ID jika perlu | `update-file-urls` atau `update-file-id` sesuai alur legacy |

**Kriteria Selesai:**
- Upload dan preview dokumen dari expand row berjalan end-to-end

---

## 5. Checklist per Tahap

### Tahap 1
- [x] Go `LoadAllBookingRow` dan query SELECT include path dokumen
- [x] Handler/response `load-all-booking` return path dokumen
- [x] Tombol Lihat Dokumen (utama) aktif setelah baris terpilih, buka PDF booking
- [x] Tombol Lihat Dokumen Validasi di expand row, buka PDF permohonan validasi

### Tahap 2
- [x] Input search di atas tabel
- [x] Parameter `search`/`q` diteruskan ke `load-all-booking`
- [x] Sebelum ke form Tambah, fetch `check-my-signature`
- [x] Jika belum punya TTD, tampilkan konfirmasi dan link ke profil

### Tahap 3
- [x] Modal Kirim (bukan langsung POST)
- [x] Fetch dan tampilkan quota
- [x] Tombol Kirim Sekarang → send-now
- [x] Input tanggal + Tombol Jadwalkan → schedule-send

### Tahap 4
- [x] Expand row tampil kartu Akta, Sertifikat, Pelengkap
- [x] Preview file jika path ada (via file-proxy)
- [x] Upload ke upload-documents
- [x] Refresh/update tampilan setelah upload sukses
