# 📋 REVIEW DRAFT TERBARU TUGAS AKHIR
## Muhammad Farras Syauqi Muharam
## File: Draft_Final_Tugas Akhir_Muhammad Farras_terbaru_281225.docx

**Tanggal Review:** 28 Desember 2025  
**Status:** REVIEW KOMPREHENSIF  
**Catatan:** Tinjauan Pustaka sudah dilebur, beberapa kesalahan kecil sudah diperbaiki

---

## 🎯 RINGKASAN EKSEKUTIF

Dokumen ini direview berdasarkan:
- ✅ Perbaikan yang sudah dilakukan (Tinjauan Pustaka dilebur)
- ⚠️ Masalah yang masih perlu diperbaiki
- 📝 Konteks yang perlu diperjelas

---

## ✅ HAL-HAL YANG SUDAH DIPERBAIKI

### 1. Struktur Dokumen
- ✅ Tinjauan Pustaka sudah dilebur ke bab-bab lain
- ✅ Penomoran bab sudah disesuaikan (III menjadi II, IV menjadi III, dst)
- ✅ Daftar Isi sudah diupdate

### 2. Integrasi Tinjauan Pustaka
- ✅ 2.1 Elektronik BPHTB → sudah diintegrasikan ke BAB I
- ✅ 2.2 Metode Prototype → sudah diintegrasikan ke BAB III
- ✅ 2.3 Booking Online → sudah diintegrasikan ke BAB I
- ✅ 2.4 Website Development → sudah diintegrasikan ke Daftar Teknologi
- ✅ 2.5 UI/UX Tools → sudah diintegrasikan ke Daftar Teknologi

---

## 🔴 MASALAH KRITIS YANG PERLU DIPERBAIKI

### 1. KONSISTENSI JUDUL ⚠️ KRITIS

**Masalah:** Judul harus sama di semua halaman

**Lokasi yang Perlu Dicek:**
- [ ] Halaman Cover
- [ ] Halaman Pernyataan
- [ ] Halaman Pengesahan/Persetujuan
- [ ] Daftar Isi
- [ ] Abstrak

**Judul yang Benar:**
```
PERANCANGAN FITUR BOOKING ONLINE PADA WEBSITE E-BPHTB 
DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR
```

**Tindakan:**
- Gunakan Find & Replace di Word untuk memastikan konsistensi
- Pastikan tidak ada variasi penulisan

---

### 2. KARAKTER ENCODING RUSAK ⚠️ KRITIS

**Masalah:** Karakter khusus (dash, hyphen, apostrophe) rusak

**Contoh yang Perlu Dicek:**
- [ ] "1025 menit" → seharusnya "10-25 menit"
- [ ] "1015%" → seharusnya "10-15%"
- [ ] "23 hari" → seharusnya "2-3 hari"
- [ ] "Practitioners Approach" → seharusnya "Practitioner's Approach"

**Lokasi yang Perlu Diperiksa:**
- [ ] Seluruh BAB I (Pendahuluan)
- [ ] Seluruh BAB III (Metode)
- [ ] Seluruh BAB IV (Hasil dan Pembahasan)
- [ ] Daftar Pustaka
- [ ] Tabel-tabel (terutama tabel pengujian)

**Tindakan:**
- Scan seluruh dokumen untuk karakter rusak
- Ganti dengan karakter yang benar
- Retype tabel yang memiliki banyak karakter rusak

---

### 3. PENYEBUTAN BSRE YANG MENYESATKAN ⚠️ KRITIS

**Masalah:** Dokumen mungkin masih menyebutkan "BSRE" atau "BSRE Authentication" padahal sistem menggunakan sertifikat digital lokal.

**Lokasi yang Perlu Diperbaiki:**
- [ ] BAB I - Latar Belakang/Tujuan (jika ada)
- [ ] BAB III - Metode (diagram, deskripsi iterasi 2)
- [ ] BAB IV - Hasil dan Pembahasan (tabel pengujian, kesimpulan)

**Perbaikan yang Diperlukan:**

| Sebelum | Sesudah |
|---------|---------|
| "integrasi dengan sistem BSRE" | "sertifikat digital lokal" atau "Generate Certificate Digital" |
| "BSRE Authentication" | "Validasi Sertifikat Digital Lokal" |
| "validasi akhir dengan BSRE" | "validasi sertifikat digital" |

**Kecuali:**
- ✅ Jika ada kalimat: "bukan integrasi dengan sistem BSRE eksternal" → SUDAH BENAR
- ✅ Jika menjelaskan bahwa sistem lokal (bukan BSRE) → SUDAH BENAR

---

## ⚠️ MASALAH PENTING YANG PERLU DIPERBAIKI

### 4. KONSISTENSI TIMELINE PENELITIAN

**Masalah:** Perlu dicek konsistensi antara waktu PKL dan waktu Proyek Akhir

**Lokasi yang Perlu Dicek:**
- [ ] BAB III - Lokasi dan Waktu
- [ ] BAB IV - Timeline pengembangan
- [ ] Prakata/Pendahuluan

**Yang Perlu Diverifikasi:**
- Apakah PKL: "22 Juli 2024 - 20 Desember 2024"?
- Apakah Proyek Akhir: "November 2024 - September 2025"?
- Apakah ada perbedaan yang perlu dijelaskan?

**Tindakan:**
- Pastikan timeline konsisten atau jelaskan perbedaannya
- Jika berbeda, tambahkan penjelasan mengapa berbeda

---

### 5. KONSISTENSI DATA KUANTITATIF

**Masalah:** Beberapa angka/statistik perlu dicek konsistensi antar bab

**Perlu Diverifikasi:**
- [ ] Jumlah Tabel Database:
  - BAB I Ruang Lingkup: "12 tabel database" atau "13 tabel database"?
  - BAB IV Iterasi 1: "13 tabel database"
  - PERLU DISERAGAMKAN

- [ ] Waktu Pengembangan:
  - BAB I: "sekitar 9 bulan" atau "sekitar 10 bulan"?
  - BAB IV: "sekitar 10 bulan (November 2024 - September 2025)"
  - PERLU DISERAGAMKAN

- [ ] Simulasi Waktu Pelayanan:
  - BAB I: "50 menit → 10-25 menit"
  - BAB IV: "30-40 menit (hingga 2 jam) → 10-25 menit → 15 menit"
  - SUDAH KONSISTEN (iterasi berbeda)

**Tindakan:**
- Seragamkan semua angka di seluruh dokumen
- Pastikan konsistensi antara BAB I, III, dan IV

---

### 6. FORMAT CITASI DAN DAFTAR PUSTAKA

**Masalah:**
- Karakter khusus dalam judul buku mungkin rusak
- Format citation mungkin tidak konsisten

**Lokasi yang Perlu Dicek:**
- [ ] Seluruh Daftar Pustaka
- [ ] In-text citations di seluruh bab

**Contoh yang Perlu Diperbaiki:**
- [ ] "Practitioners Approach" → "Practitioner's Approach"
- [ ] Cek penggunaan apostrophe (') vs dash (-)
- [ ] Format tahun, penulis, judul konsisten

**Tindakan:**
- Scan seluruh Daftar Pustaka
- Perbaiki karakter rusak
- Pastikan format mengikuti standar IPB

---

### 7. TABEL DENGAN KARAKTER RUSAK

**Masalah:** Beberapa tabel memiliki karakter encoding yang rusak

**Lokasi yang Perlu Dicek:**
- [ ] BAB IV - Tabel Pengujian Iterasi 1, 2, 3
- [ ] BAB IV - Tabel Analisis Hasil
- [ ] BAB IV - Tabel Perbandingan

**Tindakan:**
- Identifikasi semua tabel dengan karakter rusak
- Retype seluruh isi tabel tersebut
- Pastikan format tabel konsisten

---

## 📝 MASALAH KONTEKS YANG PERLU DIPERJELAS

### 8. Integrasi Tinjauan Pustaka - Perlu Dicek Alur

**Masalah:** Setelah dilebur, perlu dicek apakah alur paragraf masih logis

**Lokasi yang Perlu Dicek:**

#### **BAB I - 1.1 Latar Belakang**
- [ ] Setelah paragraf pertama tentang E-BPHTB → Apakah sudah ada paragraf tentang perkembangan E-BPHTB (dari 2.1)?
- [ ] Setelah paragraf tentang masalah antrian → Apakah sudah ada paragraf tentang booking online (dari 2.3)?
- [ ] Apakah alur paragraf mengalir dengan baik?

#### **BAB III - 3.3 Prosedur Kerja**
- [ ] Di awal bagian → Apakah sudah ada penjelasan tentang metode prototyping (dari 2.2)?
- [ ] Apakah penjelasan prototyping mengalir dengan baik ke tahapan selanjutnya?

#### **Daftar Teknologi**
- [ ] Sebelum/sesudah Tabel 3 → Apakah sudah ada paragraf tentang Website Development (dari 2.4)?
- [ ] Setelah Tabel 3 → Apakah sudah ada paragraf tentang UI/UX Tools (dari 2.5)?
- [ ] Apakah penjelasan teknologi mengalir dengan baik?

**Tindakan:**
- Baca ulang setiap bagian yang diintegrasikan
- Pastikan alur paragraf logis dan tidak terputus
- Perbaiki transisi antar paragraf jika perlu

---

### 9. Konsistensi Istilah

**Perlu Dicek:**
- [ ] "booking online" vs "Booking Online" vs "booking online"
- [ ] "E-BPHTB" vs "E-BPHTB" (konsistensi penulisan)
- [ ] "prototype" vs "prototipe" (pilih satu, konsistenkan)
- [ ] "PPAT" vs "PPAT/Notaris" vs "PPATS" (konsistensi penyebutan)

**Tindakan:**
- Buat daftar istilah kunci
- Pastikan konsisten di seluruh dokumen
- Gunakan Find & Replace untuk konsistensi

---

### 10. Tata Bahasa dan Ejaan

**Perlu Dicek:**
- [ ] "di atas" (benar) vs "diatas" (salah)
- [ ] "perancangan" vs "perancangan" (konsistensi)
- [ ] Penggunaan tanda baca yang benar
- [ ] Kalimat yang terlalu panjang (>25 kata)

**Tindakan:**
- Proofread seluruh dokumen
- Perbaiki kesalahan ejaan dan tata bahasa
- Gunakan fitur Spelling & Grammar Check di Word

---

## 📊 CHECKLIST REVIEW PER BAB

### BAB I - PENDAHULUAN

- [ ] Judul konsisten dengan cover
- [ ] Latar Belakang jelas dan logis
- [ ] **Integrasi Tinjauan Pustaka 2.1 (E-BPHTB) sudah mengalir dengan baik**
- [ ] **Integrasi Tinjauan Pustaka 2.3 (Booking Online) sudah mengalir dengan baik**
- [ ] Rumusan Masalah spesifik dan terukur
- [ ] Tujuan sesuai dengan rumusan masalah
- [ ] Manfaat jelas untuk berbagai pihak
- [ ] Ruang Lingkup membatasi penelitian dengan jelas
- [ ] Tidak ada penyebutan BSRE yang menyesatkan
- [ ] Karakter encoding benar (10-25 menit, bukan 1025 menit)
- [ ] Timeline penelitian jelas
- [ ] Data kuantitatif konsisten dengan BAB IV

---

### BAB II - METODE (Sebelumnya BAB III)

- [ ] Lokasi dan waktu jelas
- [ ] **Integrasi Tinjauan Pustaka 2.2 (Metode Prototype) sudah mengalir dengan baik**
- [ ] Metode prototyping dijelaskan dengan baik
- [ ] Teknik pengumpulan data jelas
- [ ] Prosedur kerja detail dan sistematis
- [ ] Tidak ada penyebutan "BSRE Authentication"
- [ ] Diagram (Activity, Swimlane, Use Case) jelas dan konsisten
- [ ] Timeline konsisten dengan BAB I
- [ ] Daftar Teknologi lengkap
- [ ] **Integrasi Tinjauan Pustaka 2.4 (Website Development) sudah mengalir dengan baik**
- [ ] **Integrasi Tinjauan Pustaka 2.5 (UI/UX Tools) sudah mengalir dengan baik**

---

### BAB III - HASIL DAN PEMBAHASAN (Sebelumnya BAB IV)

- [ ] Hasil iterasi 1, 2, 3 jelas dan terstruktur
- [ ] Tabel pengujian lengkap dan benar
- [ ] Tidak ada karakter rusak di tabel
- [ ] Tidak ada penyebutan BSRE yang menyesatkan
- [ ] Analisis hasil mendalam dan logis
- [ ] Gambar/screenshot jelas dan relevan
- [ ] Caption gambar benar dan informatif
- [ ] Data kuantitatif konsisten dengan BAB I
- [ ] Jumlah tabel database konsisten

---

### BAB IV - SIMPULAN DAN SARAN (Sebelumnya BAB V)

- [ ] Simpulan mengikat seluruh penelitian
- [ ] Simpulan sesuai dengan tujuan penelitian
- [ ] Saran konstruktif dan relevan
- [ ] Saran dapat diimplementasikan
- [ ] Tidak ada karakter rusak

---

### DAFTAR PUSTAKA

- [ ] Format konsisten (standar IPB)
- [ ] Semua referensi yang dikutip ada di Daftar Pustaka
- [ ] Tidak ada karakter rusak
- [ ] Urutan alfabetis benar
- [ ] Informasi lengkap (penulis, tahun, judul, penerbit)
- [ ] **Semua referensi dari Tinjauan Pustaka yang dilebur masih ada**

---

### LAMPIRAN

- [ ] Lampiran relevan dan mendukung
- [ ] Penomoran lampiran benar
- [ ] Referensi ke lampiran di teks benar

---

## 🎯 PRIORITAS PERBAIKAN

### 🚨 KRITIS (Harus diperbaiki sebelum submit):

1. **Seragamkan judul** di seluruh dokumen
2. **Perbaiki semua karakter encoding rusak** (dash, hyphen, apostrophe)
3. **Ganti semua penyebutan BSRE** yang menyesatkan
4. **Retype tabel** yang memiliki karakter rusak
5. **Cek alur paragraf** setelah integrasi Tinjauan Pustaka

### ⚠️ PENTING (Perlu diperbaiki):

6. **Konsistensi timeline** penelitian
7. **Konsistensi data kuantitatif** antar bab
8. **Format Daftar Pustaka** dan citation
9. **Konsistensi istilah** di seluruh dokumen
10. **Proofread** untuk kesalahan ejaan dan tata bahasa

### 📝 DISARANKAN (Untuk kualitas lebih baik):

11. **Perbaikan kalimat** yang terlalu panjang
12. **Verifikasi semua gambar** dan caption
13. **Perbaikan transisi** antar paragraf

---

## 📌 REKOMENDASI TINDAK LANJUT

### **Langkah 1: Perbaikan Kritis**
1. Buka dokumen Word
2. Gunakan Find & Replace untuk:
   - Cek konsistensi judul
   - Cari karakter rusak ("" → "-")
   - Ganti "BSRE Authentication" → "Generate Certificate Digital"
3. Scan seluruh dokumen untuk karakter rusak

### **Langkah 2: Verifikasi Integrasi Tinjauan Pustaka**
1. Baca ulang BAB I - 1.1 Latar Belakang
   - Cek apakah paragraf tentang E-BPHTB dan Booking Online mengalir dengan baik
2. Baca ulang BAB III - 3.3 Prosedur Kerja
   - Cek apakah paragraf tentang metode prototyping mengalir dengan baik
3. Baca ulang Daftar Teknologi
   - Cek apakah paragraf tentang Website Development dan UI/UX Tools mengalir dengan baik

### **Langkah 3: Konsistensi Data**
1. Buat daftar semua angka/statistik yang disebutkan
2. Bandingkan antar bab
3. Seragamkan yang tidak konsisten

### **Langkah 4: Proofread Final**
1. Baca seluruh dokumen dari awal sampai akhir
2. Perbaiki kesalahan ejaan dan tata bahasa
3. Perbaiki transisi antar paragraf

---

## ✅ TINDAKAN YANG DISARANKAN

### **Tools yang Bisa Digunakan:**
- Microsoft Word: Spelling & Grammar Check
- Find & Replace: Untuk konsistensi istilah dan judul
- Grammarly: Grammar checker (optional)
- Text Compare Tool: Untuk membandingkan versi sebelum/sesudah

### **Tips Efektif:**
1. Print dan baca hardcopy untuk menemukan kesalahan yang terlewat
2. Minta teman untuk proofread sekali lagi
3. Baca dokumen dari belakang ke depan untuk fokus pada ejaan
4. Gunakan checklist ini secara sistematis

---

## 📞 CATATAN PENTING

- Review ini berdasarkan standar umum penulisan Tugas Akhir IPB
- Beberapa item mungkin sudah diperbaiki di versi terbaru
- Pastikan untuk cross-check dengan pedoman penulisan resmi IPB
- Jika ada ketidakjelasan, konsultasikan dengan dosen pembimbing

---

## 🔍 FOKUS REVIEW KONTEKS

Karena user menyebutkan "konteks masih ada beberapa yang perlu diperbaiki", berikut fokus khusus:

### **1. Alur Paragraf Setelah Integrasi**
- Pastikan paragraf yang diintegrasikan dari Tinjauan Pustaka mengalir dengan baik
- Tidak ada "loncat" atau "terputus" dalam alur logika
- Transisi antar paragraf harus halus

### **2. Konsistensi Penyebutan**
- Pastikan istilah yang sama digunakan di seluruh dokumen
- Contoh: "PPAT" vs "PPAT/Notaris" vs "PPATS"
- Contoh: "booking online" vs "Booking Online"

### **3. Konsistensi Data**
- Pastikan angka yang sama disebutkan di seluruh dokumen
- Contoh: jumlah tabel database, waktu pengembangan, dll

### **4. Konteks Teknis**
- Pastikan penjelasan teknis sesuai dengan implementasi
- Tidak ada klaim yang tidak sesuai dengan kenyataan
- Contoh: "BSRE" vs "sertifikat digital lokal"

---

**Status Review:** ✅ LENGKAP  
**Rekomendasi:** Perbaiki masalah kritis terlebih dahulu, kemudian fokus pada konteks dan alur paragraf

---

*Review ini dibuat untuk membantu memastikan kualitas draft terbaru Tugas Akhir Anda. Semoga bermanfaat!*

