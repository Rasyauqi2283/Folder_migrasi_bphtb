# ANALISIS URUTAN LAMPIRAN vs TABEL

## ITERASI 1 (42 Activity Diagrams)

### ❌ MASALAH URUTAN YANG DITEMUKAN:

#### 1. **No 4: Upload Document**
- **Tabel**: Lampiran 8 – Halaman Upload dan View Dokumen Pendukung
- **File**: 
  - Lampiran 8: Activity Diagram View Document Process ❌
  - Lampiran 9: Halaman Upload dan View Uploaded Document ❌
  - Lampiran 12: Activity Diagram View Document Process ❌ (duplikat)
  - Lampiran 13: Halaman Upload dan View Uploaded Document ❌ (duplikat)
- **Seharusnya**: 
  - Lampiran 8: Halaman Upload dan View Dokumen Pendukung ✅

#### 2. **No 5: PPAT Delete Document**
- **Tabel**: Lampiran 9 – Activity Diagram PPAT Delete Document, Lampiran 10 – Halaman Delete Document
- **File**: 
  - Lampiran 10: Activity Diagram PPAT Delete Document ✅
  - Lampiran 11: Halaman Delete Document ✅
- **Masalah**: Nomor lampiran salah, seharusnya 9-10, bukan 10-11

#### 3. **No 6: PPAT View Document (Uploaded)**
- **Tabel**: Lampiran 11 – Activity Diagram PPAT View Document (Uploaded) *(Halaman sama dengan Lampiran 8)*
- **File**: 
  - Lampiran 12: Activity Diagram View Document Process ❌ (salah nama)
  - Lampiran 13: Halaman Upload dan View Uploaded Document ❌ (duplikat dengan Lampiran 8)
- **Seharusnya**: 
  - Lampiran 11: Activity Diagram PPAT View Document (Uploaded) ✅
  - *(Halaman sama dengan Lampiran 8)*

#### 4. **No 7: PPAT View Generated PDF SSPD**
- **Tabel**: Lampiran 13 – Activity Diagram PPAT View Generated PDF SSPD, Lampiran 14 – Halaman View PDF SSPD
- **File**: 
  - Lampiran 14: Activity Diagram PPAT View Generated PDF SSPD ✅
  - Lampiran 15: Halaman View PDF SSPD ✅
- **Masalah**: Nomor lampiran salah, seharusnya 13-14, bukan 14-15

#### 5. **No 8: PPAT View Generated PDF Permohonan Validasi**
- **Tabel**: Lampiran 15 – Activity Diagram PPAT View Generated PDF Permohonan Validasi, Lampiran 16 – Halaman View PDF Permohonan Validasi
- **File**: 
  - Lampiran 18: Activity Diagram PPAT View Generated PDF Permohonan Validasi ❌ (salah urutan)
  - Lampiran 19: Halaman View PDF Permohonan Validasi ❌ (salah urutan)
- **Seharusnya**: Lampiran 15-16 (bukan 18-19)

#### 6. **No 9: PPAT Fill Form Permohonan Validasi**
- **Tabel**: Lampiran 17 – Activity Diagram PPAT Fill Form Permohonan Validasi, Lampiran 18 – Halaman Fill Form Permohonan Validasi
- **File**: 
  - Lampiran 16: Activity Diagram Fill Form Permohonan Validasi ❌ (salah urutan)
  - Lampiran 17: Halaman Pengisian Permohonan Validasi ❌ (salah urutan)
- **Seharusnya**: Lampiran 17-18 (bukan 16-17)

#### 7. **No 10: PPAT Send to LTB**
- **Tabel**: Lampiran 19 – Halaman Kirim ke LTB
- **File**: 
  - Lampiran 20: Activity Diagram Send to LTB ❌ (tidak ada di tabel)
  - Lampiran 21: Button Fungsi Mengirim ke LTB ✅
- **Masalah**: Lampiran 20 tidak ada di tabel (hanya halaman yang ada)

#### 8. **No 11: LTB Receive from PPAT**
- **Tabel**: Lampiran 20 – Activity Diagram LTB Receive from PPAT, Lampiran 21 – Dashboard LTB, Lampiran 22 – LTB Receive Doc
- **File**: 
  - Lampiran 24: Activity Diagram LTB Receive Document ❌ (salah nama)
  - Lampiran 25: Tampilan Dokumen Diterima ❌ (salah nama)
  - Lampiran 23: Tampilan Laman Dashboard LTB ✅ (tapi salah urutan)
- **Seharusnya**: 
  - Lampiran 20: Activity Diagram LTB Receive from PPAT
  - Lampiran 21: Dashboard LTB
  - Lampiran 22: LTB Receive Doc

#### 9. **No 12: LTB Generate No. Registrasi**
- **Tabel**: Lampiran 23 – Activity Diagram LTB Generate No. Registrasi
- **File**: 
  - Lampiran 22: Activity Diagram Pembuatan Nomor Registrasi ✅ (tapi salah urutan, seharusnya setelah LTB Receive)
- **Seharusnya**: Lampiran 23

#### 10. **No 13: LTB Validate Document**
- **Tabel**: Lampiran 24 – Activity Diagram LTB Validate Document, Lampiran 25 – Halaman Validasi Dokumen LTB
- **File**: 
  - Lampiran 26: Activity Diagram Validasi Dokumen ✅ (tapi salah urutan)
- **Seharusnya**: Lampiran 24-25

---

## ITERASI 2 (22 Activity Diagrams)

### ❌ MASALAH URUTAN YANG DITEMUKAN:

#### 1. **No 4: Generate Sertifikat Digital Lokal**
- **Tabel**: Lampiran 88 – Activity Diagram Generate Sertifikat Digital Lokal, Lampiran 89 – Halaman Generate Sertifikat Digital
- **File**: 
  - Lampiran 63: Activity Diagram Generate Sertifikat Lokal ❌ (salah nomor)
  - Lampiran 64: Tampilan Laman Generate Sertifikat Lokal ❌ (salah nomor)
- **Seharusnya**: Lampiran 88-89

#### 2. **No 5: Generate QR Code**
- **Tabel**: Lampiran 90 – Activity Diagram Generate QR Code, Lampiran 91 – Halaman Generate QR Code
- **File**: 
  - Lampiran 65: Activity Diagram Generate QR Code ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 90-91

#### 3. **No 6: Display QR Code di Dokumen**
- **Tabel**: Lampiran 92 – Activity Diagram Display QR Code di Dokumen, Lampiran 93 – Halaman Dokumen dengan QR Code
- **File**: 
  - Lampiran 66: Activity Diagram Display QR Code by Document ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 92-93

#### 4. **No 7: Integrasi Bank dengan LTB Parallel Workflow**
- **Tabel**: Lampiran 94 – Activity Diagram Integrasi Bank dengan LTB Parallel Workflow, Lampiran 95 – Halaman Parallel Workflow
- **File**: 
  - Lampiran 67: Activity Diagram Intergrasi Bank dengan System ❌ (salah nomor, kurang halaman, nama berbeda)
- **Seharusnya**: Lampiran 94-95

#### 5. **No 8: Verifikasi Digital Signature**
- **Tabel**: Lampiran 96 – Activity Diagram Verifikasi Digital Signature, Lampiran 97 – Halaman Verifikasi Digital Signature
- **File**: 
  - Lampiran 68: Activity Diagram Verifikasi Digital Signature ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 96-97

#### 6. **No 9: PPAT Auto Fill Signature**
- **Tabel**: Lampiran 98 – Activity Diagram PPAT Auto Fill Signature, Lampiran 99 – Halaman Auto Fill Signature PPAT
- **File**: 
  - Lampiran 69: Activity Diagram PPAT auto Fill Signature ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 98-99

#### 7. **No 10: Generate Nomor Validasi**
- **Tabel**: Lampiran 100 – Activity Diagram Generate Nomor Validasi, Lampiran 101 – Halaman Nomor Validasi
- **File**: 
  - Lampiran 70: Activity Diagram Generate Nomor Validasi ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 100-101

#### 8. **No 11: Select Reusable Signature**
- **Tabel**: Lampiran 102 – Activity Diagram Select Reusable Signature, Lampiran 103 – Halaman Select Reusable Signature
- **File**: 
  - Lampiran 71: Activity Diagram Select Reusable Signature ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 102-103

#### 9. **No 12: Real-time Notifications**
- **Tabel**: Lampiran 104 – Activity Diagram Real-time Notifications, Lampiran 105 – Halaman Real-time Notifications
- **File**: 
  - Lampiran 72: Activity Diagram Real-time Notifications ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 104-105

#### 10. **No 13: Bank Cek Validasi Pembayaran Detail**
- **Tabel**: Lampiran 106 – Activity Diagram Bank Cek Validasi Pembayaran Detail, Lampiran 107 – Halaman Validasi Pembayaran Bank
- **File**: 
  - Lampiran 80: Activity Diagram Bank Cek Validasi Pembayaran ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 106-107

#### 11. **No 14: Bank Hasil Transaksi**
- **Tabel**: Lampiran 108 – Activity Diagram Bank Hasil Transaksi, Lampiran 109 – Halaman Hasil Transaksi Bank
- **File**: 
  - Lampiran 81: Activity Diagram Bank Hasil Transaksi ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 108-109

#### 12. **No 15: Sinkronisasi Bank-LTB**
- **Tabel**: Lampiran 110 – Activity Diagram Sinkronisasi Bank-LTB, Lampiran 111 – Halaman Sinkronisasi Bank-LTB
- **File**: 
  - Lampiran 82: Activity Diagram Sinkronisasi Bank-LTB ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 110-111

#### 13. **No 16: Bank Login**
- **Tabel**: Lampiran 112 – Activity Diagram Bank Login, Lampiran 113 – Halaman Login Bank
- **File**: 
  - Lampiran 73: Activity Diagram Bank Login Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 112-113

#### 14. **No 17: Bank View Dashboard**
- **Tabel**: Lampiran 114 – Activity Diagram Bank View Dashboard, Lampiran 115 – Dashboard Bank
- **File**: 
  - Lampiran 74: Activity Diagram Bank View Dashboard ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 114-115

#### 15. **No 18: Bank View Booking List**
- **Tabel**: Lampiran 116 – Activity Diagram Bank View Booking List, Lampiran 117 – Halaman Daftar Booking Bank
- **File**: 
  - Lampiran 75: Activity Diagram Bank View Booking List Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 116-117

#### 16. **No 19: Bank View Booking Detail**
- **Tabel**: Lampiran 118 – Activity Diagram Bank View Booking Detail, Lampiran 119 – Halaman Detail Booking Bank
- **File**: 
  - Lampiran 76: Activity Diagram Bank View Booking Detail ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 118-119

#### 17. **No 20: Bank Input Payment Data**
- **Tabel**: Lampiran 120 – Activity Diagram Bank Input Payment Data, Lampiran 121 – Halaman Input Data Pembayaran Bank
- **File**: 
  - Lampiran 77: Activity Diagram Bank Input Payment Data Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 120-121

#### 18. **No 21: Bank Verify Payment**
- **Tabel**: Lampiran 122 – Activity Diagram Bank Verify Payment, Lampiran 123 – Halaman Verifikasi Pembayaran Bank
- **File**: 
  - Lampiran 78: Activity Diagram Bank Verify Payment ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 122-123

#### 19. **No 22: Bank Save Verification**
- **Tabel**: Lampiran 124 – Activity Diagram Bank Save Verification, Lampiran 125 – Halaman Simpan Verifikasi Bank
- **File**: 
  - Lampiran 79: Activity Diagram Bank Save Verification ❌ (salah nomor, kurang halaman)
- **Seharusnya**: Lampiran 124-125

---

## ITERASI 3 (9 Activity Diagrams)

### ❌ MASALAH URUTAN YANG DITEMUKAN:

#### 1. **No 1: PPAT Kirim Berkas**
- **Tabel**: Lampiran 126 – Activity Diagram PPAT Kirim Berkas, Lampiran 127 – Halaman Kirim Berkas
- **File**: **TIDAK ADA** ❌

#### 2. **No 2: LTB Cek Daily Counter**
- **Tabel**: Lampiran 128 – Activity Diagram LTB Cek Daily Counter, Lampiran 129 – Halaman Cek Daily Counter
- **File**: 
  - Lampiran 83: Activity Diagram LTB Check Daily Counter ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 128-129

#### 3. **No 3: Peneliti Proses Berkas Langsung**
- **Tabel**: Lampiran 130 – Activity Diagram Peneliti Proses Berkas Langsung, Lampiran 131 – Halaman Proses Berkas
- **File**: 
  - Lampiran 84: Activity Diagram Peneliti Process Document ❌ (salah nomor, kurang halaman, nama berbeda)
- **Seharusnya**: Lampiran 130-131

#### 4. **No 4: Admin Masuk Antrian**
- **Tabel**: Lampiran 132 – Activity Diagram Admin Masuk Antrian, Lampiran 133 – Halaman Masuk Antrian
- **File**: 
  - Lampiran 85: Activity Diagram Admin Check Queue Process ❌ (salah nomor, kurang halaman, nama berbeda)
- **Seharusnya**: Lampiran 132-133

#### 5. **No 5: System Schedule Next Day**
- **Tabel**: Lampiran 134 – Activity Diagram System Schedule Next Day, Lampiran 135 – Halaman Schedule
- **File**: **TIDAK ADA** ❌

#### 6. **No 6: Admin Monitor Quota**
- **Tabel**: Lampiran 136 – Activity Diagram Admin Monitor Quota, Lampiran 137 – Halaman Monitor Quota
- **File**: 
  - Lampiran 86: Activity Diagram Admin Monitor Quota Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 136-137

#### 7. **No 7: Admin View Queue Status**
- **Tabel**: Lampiran 138 – Activity Diagram Admin View Queue Status, Lampiran 139 – Halaman Queue Status
- **File**: 
  - Lampiran 87: Activity Diagram Admin View Status Process ❌ (salah nomor, kurang halaman, nama berbeda)
- **Seharusnya**: Lampiran 138-139

#### 8. **No 8: System Auto Reset Counter**
- **Tabel**: Lampiran 140 – Activity Diagram System Auto Reset Counter, Lampiran 141 – Halaman Auto Reset
- **File**: 
  - Lampiran 88: Activity Diagram System Auto Reset Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 140-141

#### 9. **No 9: LTB Queue Management**
- **Tabel**: Lampiran 142 – Activity Diagram LTB Queue Management, Lampiran 143 – Halaman Queue Management
- **File**: 
  - Lampiran 89: Activity Diagram LTB Queue Management Process ❌ (salah nomor, kurang halaman, nama sedikit berbeda)
- **Seharusnya**: Lampiran 142-143

---

## RINGKASAN MASALAH

### ITERASI 1:
1. ❌ Lampiran 8-13: Urutan dan nama salah, ada duplikasi
2. ❌ Lampiran 20: Tidak ada di tabel (hanya halaman yang ada)
3. ❌ Lampiran 22-26: Urutan salah (seharusnya 20-25)

### ITERASI 2:
1. ❌ Semua nomor lampiran salah (63-82 seharusnya 88-125)
2. ❌ Banyak yang kurang halaman pendukung
3. ❌ Beberapa nama sedikit berbeda

### ITERASI 3:
1. ❌ Lampiran 126-127: PPAT Kirim Berkas - TIDAK ADA
2. ❌ Lampiran 134-135: System Schedule Next Day - TIDAK ADA
3. ❌ Semua nomor lampiran salah (83-89 seharusnya 128-143)
4. ❌ Semua kurang halaman pendukung
5. ❌ Beberapa nama sedikit berbeda

---

## REKOMENDASI PERBAIKAN

1. **Perbaiki urutan Iterasi 1** sesuai tabel
2. **Perbaiki nomor lampiran Iterasi 2** dari 63-82 menjadi 88-125
3. **Tambahkan halaman pendukung** untuk semua Activity Diagram Iterasi 2
4. **Perbaiki nomor lampiran Iterasi 3** dari 83-89 menjadi 128-143
5. **Tambahkan lampiran yang hilang** (PPAT Kirim Berkas, System Schedule Next Day)
6. **Tambahkan halaman pendukung** untuk semua Activity Diagram Iterasi 3
7. **Sesuaikan nama** agar sesuai dengan tabel
