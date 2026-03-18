# DAFTAR PERBAIKAN TUGAS AKHIR - Per Bab

## Status: REVIEW DIMULAI
**File yang di-review:** `05_Tugas Akhir_Muhammad Farras_Revisi_Fix.htm` (HTML dari Word)
**Tujuan:** Memastikan konsistensi dan akurasi konten antar bab

---

# BAB I - PENDAHULUAN

## Lokasi di HTML: Baris 1840-2050

### ✅ HAL-HAL YANG SUDAH BENAR:
1. Struktur lengkap: Latar Belakang, Rumusan Masalah, Tujuan, Manfaat, Ruang Lingkup
2. Metode prototyping sudah disebutkan dengan benar
3. Tiga iterasi pengembangan sudah dijelaskan
4. Teknologi yang digunakan sudah lengkap dan benar

---

## 🔴 YANG PERLU DIPERBAIKI:

### **1. Inkonsistensi Judul** ⚠️ KRITIS
**Lokasi:** 
- Baris 891: Cover page → "PERANCANGAN FITUR BOOKING ONLINE..."
- Baris 944 & 1081: Pernyataan & Halaman Persetujuan → "Perancangan Cek Status Dokumen..."

**Masalah:** Dua judul berbeda dalam satu dokumen

**Perbaikan yang diperlukan:**
```
SERAGAMKAN SEMUA JUDUL MENJADI:
"PERANCANGAN FITUR BOOKING ONLINE PADA WEBSITE E-BPHTB DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR"

Periksa dan ubah di:
- Halaman Cover
- Halaman Pernyataan
- Halaman Persetujuan
- Halaman Daftar Isi
```

---

### **2. Karakter Encoding Rusak** ⚠️ PENTING
**Lokasi:** Baris 1894

**Text yang salah:**
```
menjadi sekitar 1025 menit
```

**Perbaikan yang diperlukan:**
```
UBAH MENJADI:
"menjadi sekitar 10-25 menit"

(Character diganti dengan dash/hyphen: -)
```

**Karakter rusak lainnya yang perlu dicek:**
- Baris 1932: "1015%" → "10-15%"
- Baris 2093: "23 hari" → "2-3 hari"
- Scan seluruh dokumen untuk pattern

---

### **3. Penyebutan BSRE yang Menyesatkan** ⚠️ KRITIS
**Lokasi:** Baris 2045-2046

**Text yang salah:**
```
Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital, 
QR Code untuk validasi, dan integrasi dengan sistem BSRE.
```

**Perbaikan yang diperlukan:**
```
UBAH MENJADI:
"Sistem juga mengintegrasikan fitur keamanan dokumen melalui sertifikat digital 
lokal, QR Code untuk validasi, dan enkripsi AES-256."
```

**Alasan:** 
- Sistem sertifikat digital adalah **lokal BAPPENDA** (bukan integrasi BSRE eksternal)
- Sudah dikonfirmasi di BAB IV Baris 6584-6585 dan 7757-7760
- Jangan menyatakan "integrasi BSRE" karena menyesatkan dan tidak akurat

---

### **4. Konsistensi Data Kuantitatif dengan BAB IV** ⚠️ PENTING
**Lokasi:** Latar Belakang, Ruang Lingkup

**Masalah:** Beberapa angka/statistik di BAB I perlu dicek konsistensi dengan hasil implementasi di BAB IV

**Perlu diverifikasi:**
```
1. Jumlah Tabel Database:
   - BAB I Ruang Lingkup: "12 tabel database" (tidak disebutkan eksplisit)
   - BAB IV Iterasi 1: "13 tabel database"
   - PERLU DISERAGAMKAN

2. Waktu Pengembangan:
   - BAB I: "sekitar 9 bulan"
   - BAB IV: "sekitar 10 bulan (November 2024 - September 2025)"
   - PERLU DISERAGAMKAN

3. Simulasi Waktu Pelayanan:
   - BAB I: "50 menit → 10-25 menit"
   - BAB IV: "30-40 menit (hingga 2 jam) → 10-25 menit → 15 menit"
   - SUDAH KONSISTEN (iterasi berbeda)
```

**Rekomendasi Perbaikan:**
```
Di BAB I Ruang Lingkup, perjelas atau hapus penyebutan "12 tabel" jika memang 
tidak eksplisit. Atau sebutkan "13 tabel database" jika mengacu Iterasi 1.
```

---

### **5. Ketelitian Data Statistik** 💡 PERLU DITINGKATKAN
**Lokasi:** Latar Belakang

**Masalah:** Beberapa klaim statistik perlu sumber yang lebih spesifik

**Perlu diperjelas:**
```
1. "Digitalisasi mampu meningkatkan efisiensi pelayanan hingga 40%" (Fachri, A 2023)
   → Apakah angka ini umum atau spesifik untuk E-BPHTB?

2. "mengurangi waktu tunggu hingga 60%" (dalam konteks internasional)
   → Apakah hasil ini relevan dengan konteks Kabupaten Bogor?

3. "15.000 berkas per tahun" (data BAPPENDA 2022)
   → Perlu cek apakah data ini masih aktual untuk tahun penelitian
```

**Rekomendasi:**
```
✅ Tingkatkan ketelitian dengan menambahkan catatan atau mempertimbangkan 
konteks lokal Indonesia untuk angka-angka komparatif internasional.
```

---

### **6. Tambahan Detail pada Ruang Lingkup** 💡 OPTIONAL
**Lokasi:** Setelah baris 2049

**Usulan penambahan kalimat:**
```
Tambahkan kalimat berikut untuk memperjelas:
"Pengembangan dilakukan dengan bimbingan Kasubbid PSI (Hendri Aji Sulistiyanto, ST) 
sebagai mentor dan validator teknis, dengan review kode dan validasi alur sistem 
setiap minggu selama periode pengembangan."
```

**Alasan:**
- Memperjelas peran Kasubbid PSI yang disebutkan di BAB IV tapi belum ada di Pendahuluan
- Menunjukkan metodologi penelitian yang sistematis

---

## 📋 CHECKLIST PERBAIKAN BAB I:
- [ ] Seragamkan judul di semua halaman
- [ ] Perbaiki karakter rusak "" menjadi "-"
- [ ] Ganti "integrasi sistem BSRE" → "sertifikat digital lokal dan AES-256"
- [ ] Verifikasi dan seragamkan jumlah tabel database (12 vs 13)
- [ ] Verifikasi dan seragamkan waktu pengembangan (9 vs 10 bulan)
- [ ] (Optional) Perjelas konteks angka statistik komparatif
- [ ] (Optional) Tambahkan detail tentang Kasubbid PSI di Ruang Lingkup

---

# BAB II - TINJAUAN PUSTAKA

## Lokasi di HTML: Baris 2057-2223

### ✅ HAL-HAL YANG SUDAH BENAR:
1. Struktur lengkap: E-BPHTB, Metode Prototype, Booking Online, Web Development, UI/UX Tools
2. Referensi sudah lengkap dengan citation
3. Konten relevan dengan penelitian

---

## 🔴 YANG PERLU DIPERBAIKI:

### **1. Cek Karakter Rusak di Paragraph**
**Perlu dicek:** Scan seluruh BAB II untuk karakter "" yang rusak

---

## 📋 CHECKLIST PERBAIKAN BAB II:
- [ ] Scan dan perbaiki karakter rusak

---

# BAB III - METODE

## Lokasi di HTML: Baris 2223-4999

### ✅ HAL-HAL YANG SUDAH BENAR:
1. Struktur lengkap sesuai dengan prototiping
2. Tiga iterasi sudah detail
3. Teknologi dan tools sudah dicantumkan

---

## 🔴 YANG PERLU DIPERBAIKI:

### **1. Penyebutan BSRE di Iterasi 2** ⚠️ PENTING
**Lokasi:**
- Baris 3753-3754: Swimlane Diagram → "validasi akhir dengan BSRE Authentication"
- Baris 3758: "Peneliti Validasi melakukan proses BSRE Authentication"
- Baris 3794-3795: Use Case Diagram → "BSRE Authentication"
- Baris 6316: Tabel Pengujian → "BSRE authentication"
- Baris 6377: Kesimpulan Hasil → "integrasi dengan Bank dan BSRE"

**Perbaikan yang diperlukan:**
```
UBAH SEMUA "BSRE Authentication" MENJADI:
"Generate Certificate Digital" atau "Validasi Sertifikat Digital Lokal"

Kecuali:
- Baris 6585: "bukan integrasi dengan sistem BSRE eksternal" → SUDAH BENAR
- Baris 7757-7758: "bukan integrasi dengan BSRE eksternal" → SUDAH BENAR
```

---

### **2. Konsistensi Waktu Pengembangan** ⚠️ PERLU DICEK
**Lokasi:** Baris 2229-2238

**Teks saat ini:**
```
"Penelitian dilakukan selama masa Praktik Kerja Lapangan (PKL) yang berlangsung 
dari 22 Juli 2024 hingga 20 Desember 2024"
```

**Perlu diverifikasi:**
- Apakah tanggal ini konsisten dengan BAB IV yang menyebut "November 2024 - September 2025"?
- Apakah ada perbedaan antara PKL dan Proyek Akhir?

---

## 📋 CHECKLIST PERBAIKAN BAB III:
- [ ] Ganti semua "BSRE Authentication" → "Generate Certificate Digital"
- [ ] Verifikasi dan seragamkan timeline PKL vs Proyek Akhir
- [ ] Scan dan perbaiki karakter rusak

---

# BAB IV - HASIL DAN PEMBAHASAN

## Lokasi di HTML: Baris 5000-8390

### ✅ HAL-HAL YANG SUDAH BENAR:
1. Struktur tiga iterasi sudah detail dan lengkap
2. Tabel database, pengujian, dan metrik sudah tersedia
3. Penjelasan sertifikat digital lokal sudah benar (Baris 6584-6585, 7757-7760)

---

## 🔴 YANG PERLU DIPERBAIKI:

### **1. Penyebutan BSRE yang Masih Tersisa** ⚠️ PENTING
**Lokasi:**
- Baris 6316: "BSRE authentication" → UBAH ke "Validasi Sertifikat Digital"
- Baris 6377: "integrasi dengan Bank dan BSRE" → UBAH ke "integrasi dengan Bank"

---

### **2. Cek Karakter Rusak di Tabel** ⚠️ PENTING
**Lokasi:** Baris 8305-8311, 8345-8346

**Text yang rusak:**
```
Baris 8305:  Tinggi (AES-256)
Baris 8310:  Signifikan
Baris 8322:  -
Baris 8327:  99,7%
Baris 8333:  Baru diterapkan
Baris 8346:  Tidak ada
Baris 8351:  100% tercatat
Baris 8357:  Baru diterapkan
```

**Perbaikan yang diperlukan:**
```
Ini adalah karakter encoding rusak di tabel. Perlu di-retype seluruh isi tabel 
tersebut karena karakter tidak bisa diperbaiki otomatis.
```

---

## 📋 CHECKLIST PERBAIKAN BAB IV:
- [ ] Ganti "BSRE authentication" di tabel pengujian
- [ ] Ganti "integrasi dengan Bank dan BSRE" di kesimpulan
- [ ] Retype seluruh tabel yang memiliki karakter rusak (Baris 8305-onwards)

---

# BAB V - SIMPULAN DAN SARAN

## Lokasi di HTML: Baris 8390-8442

### ✅ HAL-HAL YANG SUDAH BENAR:
1. Simpulan mengikat tiga iterasi dengan baik
2. Saran konstruktif dan relevan

---

## 📋 CHECKLIST PERBAIKAN BAB V:
- [ ] Scan dan perbaiki karakter rusak (jika ada)

---

# DAFTAR PUSTAKA

## Lokasi di HTML: Baris 8445-8518

### 🔴 YANG PERLU DIPERBAIKI:

**1. Cek Format Citation** ⚠️ PERLU DICEK
**Lokasi:** Baris 8480

**Text yang mencurigakan:**
```
Pressman, R. S. (2010). Software Engineering: A Practitioners Approach
```

**Perbaikan yang diperlukan:**
```
Ganti dengan apostrophe (')
"Practitioner's Approach"
```

---

## 📋 CHECKLIST DAFTAR PUSTAKA:
- [ ] Scan seluruh Daftar Pustaka untuk karakter rusak
- [ ] Perbaiki karakter menjadi apostrophe atau dash sesuai konteks
- [ ] Verifikasi format citation sudah benar

---

# PRIORITAS PERBAIKAN

## 🚨 KRITIS (Harus diperbaiki):
1. **Seragamkan judul** di cover, pernyataan, dan persetujuan
2. **Ganti semua "BSRE"** menjadi "sertifikat digital lokal" atau "Generate Certificate Digital"
3. **Perbaiki encoding karakter** rusak () di seluruh dokumen

## ⚠️ PENTING:
4. **Retype tabel** yang memiliki karakter rusak
5. **Verifikasi timeline** konsistensi PKL vs Proyek Akhir

## 💡 OPTIONAL:
6. Tambahkan detail Kasubbid PSI di Ruang Lingkup

---

# CATATAN TAMBAHAN

## BAGIAN YANG SUDAH SELARAS ANTAR BAB:
- ✅ Metodologi prototyping dengan 3 iterasi sudah konsisten
- ✅ Teknologi yang digunakan sudah sama di semua bab
- ✅ Peran Kasubbid PSI sudah dijelaskan di BAB IV
- ✅ Penjelasan sertifikat digital lokal sudah benar di BAB IV (bukan integrasi BSRE)

## REKOMENDASI ALUR PERBAIKAN:
1. **Step 1:** Buka Word dengan file asli (sebelum di-convert HTML)
2. **Step 2:** Lakukan Find & Replace untuk:
   - "BSRE" → "sertifikat digital lokal" (kecuali yang sudah benar di BAB IV)
   - "BSRE Authentication" → "Generate Certificate Digital"
   - Karakter → Cari secara manual dan ganti sesuai konteks
3. **Step 3:** Verifikasi semua tabel database (13, 9, 2 tabel)
4. **Step 4:** Re-export ke HTML untuk review ulang

---

**Dibuat:** [Tanggal]
**Last Update:** [Tanggal]
**Status:** In Progress

