# ANALISIS DUPLIKASI GAMBAR LAMPIRAN

**Catatan Penting**: Semua screenshot diambil dari sistem Iterasi 3 (tahap final), sehingga kemungkinan ada gambar yang sama digunakan untuk beberapa lampiran yang berbeda.

---

## DUPLIKASI YANG SUDAH DIIDENTIFIKASI

### 1. **Lampiran 8 dan Lampiran 11 (Iterasi 1)**
- **Lampiran 8**: Halaman Upload dan View Dokumen Pendukung
- **Lampiran 11**: Activity Diagram PPAT View Document (Uploaded) - *(Halaman sama dengan Lampiran 8)*
- **Status**: ✅ **SUDAH DICATAT** - Tidak perlu duplikasi gambar

---

## POTENSI DUPLIKASI YANG PERLU DIPERHATIKAN

### 2. **Dashboard yang Sama di Beberapa Activity Diagram**

#### Dashboard LTB:
- **Lampiran 21** (Iterasi 1): Dashboard LTB - LTB Receive from PPAT
- **Potensi duplikasi**: Jika ada Activity Diagram Iterasi 2 atau 3 yang juga menampilkan Dashboard LTB

#### Dashboard Peneliti:
- **Lampiran 31** (Iterasi 1): Dashboard Peneliti - Peneliti Receive from LTB
- **Potensi duplikasi**: Jika ada Activity Diagram Iterasi 2 atau 3 yang juga menampilkan Dashboard Peneliti

#### Dashboard Admin:
- **Lampiran 88** (Iterasi 1): Dashboard Admin - Admin Monitor Process
- **Potensi duplikasi**: Jika ada Activity Diagram Iterasi 2 atau 3 yang juga menampilkan Dashboard Admin

#### Dashboard Bank:
- **Lampiran 115** (Iterasi 2): Dashboard Bank - Bank View Dashboard
- **Status**: ✅ **UNIK** - Hanya ada di Iterasi 2

#### Dashboard Paraf:
- **Lampiran 53** (Iterasi 1): Dashboard Paraf - Peneliti Paraf Receive
- **Status**: ✅ **UNIK** - Hanya ada di Iterasi 1

---

### 3. **Halaman Upload Tanda Tangan**

#### Iterasi 1:
- **Lampiran 7**: Halaman Upload Tanda Tangan (Manual) - Add Manual Signature

#### Iterasi 2:
- **Lampiran 85**: Halaman Upload Tanda Tangan Sekali - Upload Tanda Tangan Sekali (Iterasi 2)
- **Lampiran 98-99**: Halaman Auto Fill Signature PPAT - PPAT Auto Fill Signature (Iterasi 2)
- **Lampiran 102-103**: Halaman Select Reusable Signature - Select Reusable Signature Peneliti Validasi (Iterasi 2)

**Pertanyaan**: Apakah halaman upload tanda tangan di Iterasi 1 dan Iterasi 2 menggunakan screenshot yang sama? (Karena di Iterasi 3 sudah final, kemungkinan UI-nya sama)

---

### 4. **Halaman View Document**

#### Iterasi 1:
- **Lampiran 34**: Halaman View Document - Peneliti View Document
- **Lampiran 56**: Halaman View - Peneliti Paraf View Document
- **Lampiran 68**: Halaman View - Peneliti Validasi View Document

**Pertanyaan**: Apakah ketiga halaman view document ini menggunakan screenshot yang sama? (Karena mungkin UI-nya sama, hanya konteks berbeda)

---

### 5. **Halaman Send/Reject**

#### Halaman Send:
- **Lampiran 48** (Iterasi 1): Halaman Send - Peneliti Send to Clear to Paraf
- **Lampiran 61** (Iterasi 1): Halaman Send - Peneliti Paraf Send to Validasi
- **Lampiran 77** (Iterasi 1): Halaman Send - Peneliti Validasi Send to LSB
- **Lampiran 105** (Iterasi 2): Halaman Real-time Notifications - Real-time Notifications

**Pertanyaan**: Apakah halaman "Send" menggunakan UI yang sama? (Mungkin hanya berbeda konteks/teks)

#### Halaman Reject:
- **Lampiran 50** (Iterasi 1): Halaman Reject - Peneliti Reject
- **Lampiran 63** (Iterasi 1): Halaman Reject - Peneliti Paraf Reject
- **Lampiran 79** (Iterasi 1): Halaman Reject - Peneliti Validasi Reject

**Pertanyaan**: Apakah halaman "Reject" menggunakan UI yang sama? (Mungkin hanya berbeda konteks/teks)

---

### 6. **Halaman Status/Accept**

#### Iterasi 1:
- **Lampiran 27**: Halaman Status Accept - LTB Accept
- **Lampiran 29**: Halaman Status Reject - LTB Reject
- **Lampiran 86**: Halaman Status - LSB Update Status

**Pertanyaan**: Apakah halaman status menggunakan UI yang sama? (Mungkin hanya berbeda status: Accept/Reject/Update)

---

### 7. **Halaman Kirim**

#### Iterasi 1:
- **Lampiran 19**: Halaman Kirim ke LTB - PPAT Send to LTB
- **Lampiran 81**: Halaman Kirim - LSB Receive from Peneliti Validasi
- **Lampiran 90**: Halaman Kirim - Admin Send Ping Notifications

**Pertanyaan**: Apakah halaman "Kirim" menggunakan UI yang sama? (Mungkin hanya berbeda konteks)

---

### 8. **Halaman Upload (Manual Signature)**

#### Iterasi 1:
- **Lampiran 7**: Halaman Upload Tanda Tangan - Add Manual Signature (PPAT)
- **Lampiran 38**: Halaman Add Manual Signature Peneliti - Peneliti Add Manual Signature
- **Lampiran 73**: Halaman Upload - Peneliti Validasi Manual Signature

**Pertanyaan**: Apakah ketiga halaman upload tanda tangan manual ini menggunakan screenshot yang sama? (Karena mungkin UI-nya sama, hanya role berbeda: PPAT vs Peneliti vs Peneliti Validasi)

---

## REKOMENDASI

### 1. **Identifikasi Duplikasi Aktual**
Perlu dicek secara manual apakah screenshot berikut ini benar-benar sama:
- Dashboard yang sama (LTB, Peneliti, Admin)
- Halaman View Document yang sama
- Halaman Send/Reject yang sama
- Halaman Upload Tanda Tangan yang sama

### 2. **Konsolidasi Lampiran**
Jika ada screenshot yang benar-benar sama, pertimbangkan untuk:
- Menggunakan satu lampiran untuk beberapa activity diagram
- Menambahkan catatan: "Halaman sama dengan Lampiran X"
- Menghindari duplikasi gambar yang tidak perlu

### 3. **Format Catatan**
Untuk lampiran yang menggunakan gambar yang sama, gunakan format:
```
Lampiran X – [Nama] (Iterasi Y)
*(Halaman sama dengan Lampiran Z)*
```

### 4. **Verifikasi Manual**
**PENTING**: Perlu verifikasi manual untuk memastikan:
- Apakah screenshot benar-benar sama?
- Apakah ada perbedaan kecil yang perlu ditampilkan?
- Apakah perlu screenshot terpisah untuk setiap activity diagram?

---

## CONTOH KONSOLIDASI YANG MUNGKIN

### Jika Dashboard LTB Sama:
- **Lampiran 21**: Dashboard LTB *(Digunakan untuk: LTB Receive from PPAT - Iterasi 1)*
- **Catatan**: Dashboard LTB yang sama mungkin digunakan di Activity Diagram Iterasi 2 atau 3

### Jika Halaman View Document Sama:
- **Lampiran 34**: Halaman View Document *(Digunakan untuk: Peneliti View Document - Iterasi 1)*
- **Lampiran 56**: Halaman View *(Digunakan untuk: Peneliti Paraf View Document - Iterasi 1)*
- **Lampiran 68**: Halaman View *(Digunakan untuk: Peneliti Validasi View Document - Iterasi 1)*
- **Pertanyaan**: Apakah ketiganya menggunakan screenshot yang sama?

---

## KESIMPULAN

**Ya, kemungkinan besar ada duplikasi gambar lampiran**, terutama untuk:
1. Dashboard yang sama (LTB, Peneliti, Admin)
2. Halaman View Document yang sama
3. Halaman Send/Reject yang sama
4. Halaman Upload Tanda Tangan yang sama

**Langkah selanjutnya**:
1. Verifikasi manual screenshot yang ada
2. Identifikasi duplikasi aktual
3. Konsolidasi lampiran yang menggunakan gambar yang sama
4. Update daftar lampiran dengan catatan "Halaman sama dengan Lampiran X"
