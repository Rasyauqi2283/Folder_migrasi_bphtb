# Referensi Admin: Legacy vs TSX/Go

Dokumen ini memetakan kesesuaian halaman referensi (Pemutakhiran PPAT, Status PPAT, Validasi QR) antara legacy HTML dan migrasi TSX/Go.

## 1. Pemutakhiran Data PPAT (`admin-pemutakhiranppat.html` → `referensi/pemutakhiran-ppat/page.tsx`)

| Fitur Legacy | Status TSX | Keterangan |
|--------------|------------|------------|
| Rekap: jangkawaktu (6/12 bulan) + tahun | ✅ | Header Rekap dengan dropdown 6 Bulan / 1 Tahun + tahun |
| Nilai transaksi pajak (Rp total) | ✅ | Total Nilai BPHTB di summary chart |
| Chart bulanan (Batang/Garis) | ✅ (Batang) | Chart bar; toggle Garis opsional |
| Data rekap by nobooking table | ✅ | Kolom: Nama PPAT, UserID, PPAT Khusus, Nilai, Aksi |
| Export CSV | ✅ | Tombol Export, unduh CSV |
| Show 10/25/50/100 entries | ✅ | Dropdown limit entries |
| Pagination (Showing X to Y of Z) | ✅ | Menampilkan start–end dari total |
| Link "Lihat" → detail per user | ✅ | Ke `/admin/referensi/pemutakhiran-ppat/[userid]` |
| Notifikasi container (sidebar) | ⚠️ | Legacy pakai script terpisah; bisa ditambah jika diperlukan |

## 2. Detail Pemutakhiran per User (`admin-datauser-pemutakhiranppat.html` → `referensi/pemutakhiran-ppat/[userid]/page.tsx`)

| Fitur Legacy | Status TSX | Keterangan |
|--------------|------------|------------|
| Foto profil | ✅ | `user.fotoprofil` atau default |
| Nama Panjang | ✅ | Label & value |
| Nama + Title | ✅ | `special_field` |
| PPAT Khusus, Pejabat | ✅ | |
| Booking yang dikerjakan, Nilai Pajak Total | ✅ | Summary section |
| Cari (filter tabel) | ✅ | Filter client-side |
| Tabel: NoBooking, Tanggal, UserId, NOPPBB, Jenis Pajak, Nilai Pajak, Nama WP | ✅ | 7 kolom sesuai legacy |
| Pagination tabel | ✅ | |

## 3. Status PPAT (`admin-status-ppat.html` → `referensi/status-ppat/page.tsx`)

| Fitur Legacy | Status TSX | Keterangan |
|--------------|------------|------------|
| Gudang Notifikasi: tab PPAT→LTB, LTB→LSB, LSB→PPAT | ✅ | Tabs ada; data dari API proxy ke Node |
| Tabel notifikasi per kategori | 🔄 | Endpoint `/api/admin/notification-warehouse/ppat-ltb` (dan ltb-lsb, lsb-ppat) dipanggil dari TSX; response dari Node via proxy |
| Kolom: No.Registrasi, NoBooking, UserID, Special Field, PPAT Khusus, NOPPBB, Jenis WP, Updated, Aksi | 🔄 | Sesuai response backend |
| Real-time toggle (Pause/Play) | ⚠️ | Opsional; legacy pakai polling |
| Status PPAT/PPATS: filter status, search, list user, edit status | ✅ | Panel status + modal edit |

## 4. Validasi QR (`admin-validasi-qr.html` → `referensi/validasi-qr/page.tsx`)

| Fitur Legacy | Status TSX | Keterangan |
|--------------|------------|------------|
| Input nomor validasi + tombol Validasi | ✅ | Cek nomor validasi |
| Hasil: info validasi, dokumen, PPAT, peneliti, keaslian | ✅ | InfoSection components |
| Section Scan QR Code (kamera) | 🔄 | Section UI ada; scan kamera tergantung library/browser |
| Section Upload dokumen (gambar/PDF) untuk scan QR | 🔄 | Section UI ada; ekstraksi QR dari file tergantung backend |
| Pencarian data validasi (filter status, pagination) | ✅ | Search + tabel hasil |

---
*Terakhir diperbarui: penyesuaian agar referensi TSX/Go selaras dengan legacy.*
