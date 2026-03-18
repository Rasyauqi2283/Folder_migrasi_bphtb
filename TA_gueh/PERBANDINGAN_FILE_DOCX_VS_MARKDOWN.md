# PERBANDINGAN FILE .DOCX vs MARKDOWN YANG SUDAH DIPERBAIKI

## PERBEDAAN YANG DITEMUKAN

### **1. Bagian Iterasi 1 - Duplikasi Penjelasan**

**File .docx (Ini_yangperludibaca.md):**
- Baris 5: Menyebutkan "37 activity diagram tambahan" (total 40)
- Baris 7: Menyebutkan "38 activity diagram tambahan" (total 42) - **DUPLIKASI**

**File Markdown yang Sudah Diperbaiki:**
- Hanya ada 1 penjelasan yang menyebutkan "37 activity diagram tambahan" (total 40) - **SALAH, harusnya 38**
- Atau seharusnya: "38 activity diagram tambahan" (total 42) - **BENAR**

**Perbaikan yang Diperlukan:**
- Hapus duplikasi (baris 5 atau 7)
- Pastikan menyebutkan "38 activity diagram tambahan" (total 42)

---

### **2. Bagian Iterasi 2 - Posisi Tabel 9**

**File .docx (Ini_yangperludibaca.md):**
- Tabel 9 berada **SEBELUM** bagian "Hasil Iterasi 2" (baris 58-83)
- Bagian "Hasil Iterasi 2" dimulai di baris 85
- **TIDAK ADA** penjelasan sebelum Tabel 9 yang menyebutkan "5 activity diagram utama"

**File Markdown yang Sudah Diperbaiki:**
- Tabel 9 berada **DI DALAM** bagian "Hasil Iterasi 2" (setelah penjelasan hasil)
- Ada penjelasan sebelum Tabel 9:
  > "Selain lima activity diagram utama yang telah dijelaskan secara detail pada bagian Proses Pengembangan Iterasi 2 (*Activity Diagram Bank Integration*, *Activity Diagram Peneliti Validasi Final Validation (Iterasi 2)*, *Activity Diagram Upload Tanda Tangan Sekali*, *Activity Diagram Peneliti Auto Fill Signature (Reusable)*, dan *Activity Diagram Admin Validasi QR Code*), sistem juga memiliki 17 activity diagram tambahan yang menggambarkan proses-proses pendukung dalam sistem keamanan dan otomasi..."

**Perbaikan yang Diperlukan:**
- Pindahkan Tabel 9 ke dalam bagian "Hasil Iterasi 2" (setelah penjelasan hasil)
- Tambahkan penjelasan sebelum Tabel 9 yang menyebutkan 5 activity diagram utama dan 17 activity diagram tambahan

---

### **3. Format Tabel**

**File .docx (Ini_yangperludibaca.md):**
- Tabel menggunakan format markdown sederhana dengan `| -- |` untuk header separator
- Beberapa spasi hilang (misalnya: "Tabel 10Struktur Database" tanpa spasi)

**File Markdown yang Sudah Diperbaiki:**
- Tabel menggunakan format markdown standar dengan `| ------------ |` untuk header separator
- Spasi sudah benar (misalnya: "Tabel 10 Struktur Database Tambahan Iterasi 2")

**Perbaikan yang Diperlukan:**
- Perbaiki format tabel agar konsisten
- Perbaiki spasi yang hilang

---

## RINGKASAN PERBAIKAN YANG PERLU DILAKUKAN

### **Prioritas Tinggi:**
1. ✅ **Hapus duplikasi penjelasan di Iterasi 1** (baris 5 atau 7)
2. ✅ **Pindahkan Tabel 9 ke dalam bagian "Hasil Iterasi 2"** (setelah baris 87)
3. ✅ **Tambahkan penjelasan sebelum Tabel 9** yang menyebutkan 5 activity diagram utama dan 17 activity diagram tambahan

### **Prioritas Sedang:**
4. ✅ **Perbaiki format tabel** agar konsisten dengan markdown standar
5. ✅ **Perbaiki spasi yang hilang** (misalnya: "Tabel 10Struktur Database" → "Tabel 10 Struktur Database")

---

## REKOMENDASI

**Gunakan file `Bab_4_hasilPembahasan_pbaru.md` sebagai referensi utama** karena:
- ✅ Tabel 9 sudah dipindahkan ke bagian "Hasil Iterasi 2" dengan benar
- ✅ Penjelasan sebelum Tabel 9 sudah lengkap
- ✅ Format tabel sudah konsisten
- ✅ Spasi sudah benar

**Copy-paste bagian yang sudah diperbaiki dari `Bab_4_hasilPembahasan_pbaru.md` ke file .docx Anda.**
