# 📊 ANALISIS: ACTIVITY DIAGRAM BANK DAN PENELITI VALIDASI ITERASI 1

## 🎯 PERTANYAAN

**Apakah perlu Activity Diagram untuk Bank dan Peneliti Validasi di Iterasi 1 (sistem konvensional/manual)?**

---

## ✅ JAWABAN SINGKAT

### **1. Bank di Iterasi 1** ❌ **TIDAK PERLU**

**Alasan:**
- Bank **belum terintegrasi** dengan sistem di Iterasi 1
- Proses verifikasi pembayaran masih dilakukan **manual di luar sistem**
- Tidak ada interaksi Bank dengan sistem digital
- Activity Diagram khusus untuk **sistem digital**, bukan proses manual di luar sistem

**Kesimpulan:** ❌ **TIDAK PERLU** Activity Diagram Bank untuk Iterasi 1

---

### **2. Peneliti Validasi di Iterasi 1** ⚠️ **PERLU DIPERJELAS**

**Status Saat Ini:**
- ✅ Ada di **Activity Diagram Complex Part 3** (Activity_Diagram_Complex_Iterasi1_Part3.xml)
  - Proses: Peneliti Validasi Receive → Final Validation → Manual Signature → Drop Gambar Tanda Tangan → Update pv_1_paraf_validate → Send to LSB
- ✅ Ada di **Activity_11_LSB_Receive_from_Peneliti_Validasi.xml** (dari sisi LSB)
- ❌ **TIDAK ADA** Activity Diagram terpisah khusus untuk "Peneliti Validasi Final Validation" di Iterasi 1

**Perbedaan Iterasi 1 vs Iterasi 2:**
- **Iterasi 1:** Manual Signature, Drop Gambar Tanda Tangan (manual)
- **Iterasi 2:** Tanda Tangan Reusable, Generate Sertifikat Digital Lokal, Generate QR Code (digital)

**Kesimpulan:** ⚠️ **PERLU DIPERJELAS** - Apakah perlu Activity Diagram terpisah untuk Peneliti Validasi Iterasi 1 (manual) atau cukup di Activity Diagram Complex?

---

## 📋 REKOMENDASI

### **Opsi 1: Tidak Perlu Activity Diagram Terpisah** ✅ **DIREKOMENDASIKAN**

**Alasan:**
1. **Activity Diagram Complex Part 3** sudah mencakup proses Peneliti Validasi Iterasi 1 (manual)
2. **Activity_11_LSB_Receive_from_Peneliti_Validasi.xml** sudah menunjukkan alur dari sisi LSB
3. **Perbedaan manual vs digital** sudah jelas dijelaskan di Activity Diagram Complex
4. **Tidak perlu duplikasi** - cukup jelaskan perbedaan di dokumentasi

**Yang Perlu Dilakukan:**
- ✅ Pastikan Activity Diagram Complex Part 3 sudah lengkap dengan proses manual
- ✅ Jelaskan di dokumentasi bahwa Iterasi 1 menggunakan proses manual
- ✅ Bandingkan dengan Iterasi 2 untuk menunjukkan evolusi

---

### **Opsi 2: Buat Activity Diagram Terpisah** ⚠️ **OPSIONAL**

**Alasan (jika diperlukan):**
1. Untuk **konsistensi** dengan Activity Diagram lainnya (setiap proses punya diagram sendiri)
2. Untuk **detail lebih lengkap** proses manual Peneliti Validasi
3. Untuk **mudah dibandingkan** dengan Iterasi 2

**Yang Perlu Dibuat:**
- `Activity_16_Peneliti_Validasi_Final_Validation_Iterasi1.xml` (manual)
- Proses: Receive → Final Validation → Manual Signature → Drop Gambar → Update → Send to LSB

**Catatan:** Activity 16 sebelumnya sudah dipindahkan ke Iterasi 2, jadi perlu dibuat versi manual untuk Iterasi 1 jika diperlukan.

---

## 🎯 KESIMPULAN DAN REKOMENDASI FINAL

### **Bank di Iterasi 1:**
❌ **TIDAK PERLU** Activity Diagram
- Bank belum terintegrasi
- Proses manual di luar sistem
- Activity Diagram khusus untuk sistem digital

### **Peneliti Validasi di Iterasi 1:**
⚠️ **OPSIONAL** - Tergantung kebutuhan dokumentasi

**Rekomendasi:**
- ✅ **Cukup gunakan Activity Diagram Complex Part 3** yang sudah ada
- ✅ **Jelaskan perbedaan manual vs digital** di dokumentasi
- ⚠️ **Jika perlu detail lebih**, buat Activity Diagram terpisah untuk konsistensi

**Yang Sudah Ada:**
- ✅ Activity Diagram Complex Part 3 (mencakup Peneliti Validasi manual)
- ✅ Activity_11_LSB_Receive_from_Peneliti_Validasi (dari sisi LSB)

**Yang Bisa Ditambahkan (Opsional):**
- ⚠️ Activity_16_Peneliti_Validasi_Final_Validation_Iterasi1.xml (jika perlu detail terpisah)

---

## 📝 CATATAN PENTING

**Prinsip Activity Diagram:**
- Activity Diagram menggambarkan **alur kerja dalam sistem digital**
- Proses **manual di luar sistem** tidak perlu Activity Diagram (kecuali jika ada interaksi dengan sistem)
- **Bank di Iterasi 1** = proses manual di luar sistem → TIDAK PERLU
- **Peneliti Validasi di Iterasi 1** = ada interaksi dengan sistem (update database) → BISA ADA (tapi sudah ada di Complex Diagram)

**Konsistensi:**
- Jika semua proses punya Activity Diagram terpisah → Buat untuk Peneliti Validasi Iterasi 1
- Jika cukup dengan Complex Diagram → Tidak perlu terpisah

---

*Analisis ini dibuat untuk menjawab pertanyaan tentang kebutuhan Activity Diagram Bank dan Peneliti Validasi di Iterasi 1*
