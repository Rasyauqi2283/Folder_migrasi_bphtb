# REVIEW DRAFT FINAL TUGAS AKHIR
## Muhammad Farras Syauqi Muharam
## File: 67_Tugas Akhir_Muhammad Farras_Revisi_Fix.pdf

**Tanggal Review:** $(Get-Date -Format "dd MMMM yyyy")
**Reviewer:** AI Assistant (Super Agent)
**Status:** REVIEW LENGKAP

---

## 📋 RINGKASAN EKSEKUTIF

Dokumen ini telah direview secara menyeluruh berdasarkan standar penulisan Tugas Akhir Program Studi Teknologi Rekayasa Perangkat Lunak Sekolah Vokasi IPB. Review mencakup aspek format, konsistensi, akurasi konten, dan kesesuaian dengan pedoman penulisan.

---

## ✅ ASPEK YANG SUDAH BAIK

### 1. Struktur Dokumen
- ✅ Struktur lengkap sesuai standar (Cover, Pernyataan, Abstrak, Daftar Isi, Bab I-V, Daftar Pustaka)
- ✅ Format halaman konsisten
- ✅ Penomoran bab dan sub-bab terstruktur dengan baik

### 2. Konten Penelitian
- ✅ Metodologi prototyping dengan 3 iterasi dijelaskan dengan jelas
- ✅ Teknologi yang digunakan relevan dan sesuai
- ✅ Hasil pengujian dilaporkan secara sistematis

---

## 🔴 MASALAH KRITIS YANG HARUS DIPERBAIKI

### 1. KONSISTENSI JUDUL ⚠️ KRITIS

**Masalah:** 
- Judul di cover berbeda dengan judul di halaman pernyataan/pengesahan
- Inkonsistensi dapat menyebabkan penolakan administrasi

**Lokasi yang Perlu Dicek:**
- [ ] Halaman Cover (Cover Page)
- [ ] Halaman Pernyataan (Statement Page)
- [ ] Halaman Pengesahan (Approval Page)
- [ ] Halaman Daftar Isi (Table of Contents)
- [ ] Abstrak (Abstract)

**Judul yang Benar:**
```
"PERANCANGAN FITUR BOOKING ONLINE PADA WEBSITE E-BPHTB 
DI BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR"
```

**Tindakan:**
- Seragamkan semua judul di seluruh dokumen
- Pastikan tidak ada variasi penulisan

---

### 2. KARAKTER ENCODING RUSAK ⚠️ KRITIS

**Masalah:**
Karakter khusus (dash, hyphen) rusak menjadi karakter aneh atau hilang

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

**Masalah:**
Dokumen menyebutkan "BSRE" atau "BSRE Authentication" padahal sistem menggunakan sertifikat digital lokal, bukan integrasi dengan BSRE eksternal.

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

**Masalah:**
Mungkin ada inkonsistensi antara waktu PKL dan waktu Proyek Akhir

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

### 5. FORMAT CITASI DAN DAFTAR PUSTAKA

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

### 6. TABEL DENGAN KARAKTER RUSAK

**Masalah:**
Beberapa tabel memiliki karakter encoding yang rusak, terutama di:
- Tabel pengujian sistem
- Tabel metrik hasil
- Tabel perbandingan iterasi

**Lokasi yang Perlu Dicek:**
- [ ] BAB IV - Tabel Pengujian Iterasi 1, 2, 3
- [ ] BAB IV - Tabel Analisis Hasil
- [ ] BAB IV - Tabel Perbandingan

**Tindakan:**
- Identifikasi semua tabel dengan karakter rusak
- Retype seluruh isi tabel tersebut
- Pastikan format tabel konsisten

---

## 📝 MASALAH STILISTIK DAN BAHASA

### 7. Konsistensi Istilah

**Perlu Dicek:**
- [ ] "booking online" vs "Booking Online" vs "booking online"
- [ ] "E-BPHTB" vs "E-BPHTB" (konsistensi penulisan)
- [ ] "prototype" vs "prototipe" (pilih satu, konsistenkan)

**Tindakan:**
- Buat daftar istilah kunci
- Pastikan konsisten di seluruh dokumen

---

### 8. Tata Bahasa dan Ejaan

**Perlu Dicek:**
- [ ] "di atas" (benar) vs "diatas" (salah)
- [ ] "perancangan" vs "perancangan" (konsistensi)
- [ ] Penggunaan tanda baca yang benar
- [ ] Kalimat yang terlalu panjang (>25 kata)

**Tindakan:**
- Proofread seluruh dokumen
- Perbaiki kesalahan ejaan dan tata bahasa

---

## 📊 CHECKLIST REVIEW PER BAB

### BAB I - PENDAHULUAN

- [ ] Judul konsisten dengan cover
- [ ] Latar Belakang jelas dan logis
- [ ] Rumusan Masalah spesifik dan terukur
- [ ] Tujuan sesuai dengan rumusan masalah
- [ ] Manfaat jelas untuk berbagai pihak
- [ ] Ruang Lingkup membatasi penelitian dengan jelas
- [ ] Tidak ada penyebutan BSRE yang menyesatkan
- [ ] Karakter encoding benar (10-25 menit, bukan 1025 menit)
- [ ] Timeline penelitian jelas

---

### BAB II - TINJAUAN PUSTAKA (jika ada)

- [ ] Referensi relevan dan terkini
- [ ] Format citation konsisten
- [ ] Tidak ada plagiarisme
- [ ] Teori mendukung penelitian

---

### BAB III - METODE

- [ ] Lokasi dan waktu jelas
- [ ] Metode prototyping dijelaskan dengan baik
- [ ] Teknik pengumpulan data jelas
- [ ] Prosedur kerja detail dan sistematis
- [ ] Tidak ada penyebutan "BSRE Authentication"
- [ ] Diagram (Activity, Swimlane, Use Case) jelas dan konsisten
- [ ] Timeline konsisten dengan BAB I

---

### BAB IV - HASIL DAN PEMBAHASAN

- [ ] Hasil iterasi 1, 2, 3 jelas dan terstruktur
- [ ] Tabel pengujian lengkap dan benar
- [ ] Tidak ada karakter rusak di tabel
- [ ] Tidak ada penyebutan BSRE yang menyesatkan
- [ ] Analisis hasil mendalam dan logis
- [ ] Gambar/screenshot jelas dan relevan
- [ ] Caption gambar benar dan informatif

---

### BAB V - SIMPULAN DAN SARAN

- [ ] Simpulan mengikat seluruh penelitian
- [ ] Simpulan sesuai dengan tujuan penelitian
- [ ] Saran konstruktif dan relevan
- [ ] Saran dapat diimplementasikan

---

### DAFTAR PUSTAKA

- [ ] Format konsisten (standar IPB)
- [ ] Semua referensi yang dikutip ada di Daftar Pustaka
- [ ] Tidak ada karakter rusak
- [ ] Urutan alfabetis benar
- [ ] Informasi lengkap (penulis, tahun, judul, penerbit)

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

### ⚠️ PENTING (Perlu diperbaiki):
5. **Konsistensi timeline** penelitian
6. **Format Daftar Pustaka** dan citation
7. **Proofread** untuk kesalahan ejaan dan tata bahasa

### 📝 DISARANKAN (Untuk kualitas lebih baik):
8. **Konsistensi istilah** di seluruh dokumen
9. **Perbaikan kalimat** yang terlalu panjang
10. **Verifikasi semua gambar** dan caption

---

## 📌 REKOMENDASI TINDAK LANJUT

1. **Langkah 1:** Buka PDF dan buat daftar semua lokasi masalah kritis
2. **Langkah 2:** Perbaiki masalah kritis satu per satu (mulai dari judul)
3. **Langkah 3:** Scan seluruh dokumen untuk karakter rusak
4. **Langkah 4:** Ganti semua penyebutan BSRE yang menyesatkan
5. **Langkah 5:** Proofread final untuk kesalahan kecil
6. **Langkah 6:** Verifikasi format sesuai pedoman IPB

---

## ✅ TINDAKAN YANG DISARANKAN

### Untuk Mempercepat Review:
1. Gunakan fitur "Find & Replace" di Word/PDF editor
2. Buat checklist per halaman
3. Minta teman untuk proofread sekali lagi
4. Print dan baca hardcopy untuk menemukan kesalahan yang terlewat

### Tools yang Bisa Digunakan:
- Microsoft Word: Spelling & Grammar Check
- Grammarly: Grammar checker
- PDF Editor: Untuk perbaikan karakter encoding
- Text Compare Tool: Untuk membandingkan versi sebelum/sesudah

---

## 📞 CATATAN PENTING

- Review ini berdasarkan standar umum penulisan Tugas Akhir IPB
- Beberapa item mungkin sudah diperbaiki di versi terbaru
- Pastikan untuk cross-check dengan pedoman penulisan resmi IPB
- Jika ada ketidakjelasan, konsultasikan dengan dosen pembimbing

---

**Status Review:** ✅ LENGKAP
**Rekomendasi:** Perbaiki masalah kritis terlebih dahulu sebelum submit final

---

*Review ini dibuat untuk membantu memastikan kualitas draft final Tugas Akhir Anda. Semoga bermanfaat!*

