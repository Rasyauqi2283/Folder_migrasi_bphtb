# REKAP PEKERJAAN 10 OBROLAN TERAKHIR

**Tanggal:** 2025
**Status:** File TA tidak tersave dengan benar, perlu rekap untuk memastikan semua perubahan sudah dilakukan

---

## 📋 DAFTAR PEKERJAAN YANG TELAH DILAKUKAN

### **1. PERBAIKAN ACTIVITY DIAGRAM ITERASI 3**

#### **a) Perbaikan Activity_49_Admin_Masuk_Antrian.xml**

- **Masalah:** Path/garis tarikan simbol sangat kusut dan membingungkan
- **Solusi:** Reorganisasi posisi elemen, meluruskan path, memastikan alur logis
- **File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_3/Activity_Diagrams/Activity_49_Admin_Masuk_Antrian.xml`

#### **b) Pembuatan Tabel Lampiran Iterasi 3**

- **File:** `TA_gueh/Tabel_Lampiran_Iterasi_3_LENGKAP.md`
- **Isi:** Daftar lengkap 9 Activity Diagram Iterasi 3 dengan lampiran
- **Catatan:** 2 Activity Diagram dijelaskan di Bab Hasil & Pembahasan (PPAT Kirim Berkas dan System Schedule Next Day)

#### **c) Pembuatan Teks Penjelasan Activity Diagram Iterasi 3**

- **File:** `TA_gueh/TEKS_PENJELASAN_ACTIVITY_DIAGRAM_ITERASI_3.md`
- **Isi:** Penjelasan detail untuk 2 Activity Diagram yang dijelaskan di Bab Hasil & Pembahasan

---

### **2. PERBAIKAN ACTIVITY DIAGRAM ITERASI 1**

#### **a) Split Activity_14_Peneliti_Receive_from_LTB.xml**

- **Masalah:** Diagram terlalu kompleks, seharusnya 1 fitur = 1 Activity Diagram
- **Solusi:** Dibagi menjadi 3 diagram terpisah:
  1. `Activity_14_Peneliti_Receive_from_LTB.xml` (disederhanakan, fokus pada receive & open booking)
  2. `Activity_14A_Peneliti_Verify_Document.xml` (BARU - untuk verifikasi dokumen)
  3. `Activity_14B_Peneliti_Add_Manual_Signature.xml` (BARU - untuk menambah tanda tangan manual)

#### **b) Perbaikan Decision Node di Activity_14A**

- **Masalah:** Decision node hanya memiliki 1 path output (seharusnya 2 path)
- **Solusi:**
  - Menambahkan path "Tidak Valid" untuk `sys_validate_data` decision node
  - Memastikan `sys_check_completeness` decision node memiliki 2 path (Lengkap/Tidak Lengkap)
- **File:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/Activity_14A_Peneliti_Verify_Document.xml`

#### **c) Update Tabel Lampiran Iterasi 1**

- **File:** `TA_gueh/Tabel_Lampiran_Iterasi_1_LENGKAP.md`
- **Perubahan:**
  - Total Activity Diagram: 40 → 42
  - Total Lampiran: 84 → 87
  - Menambahkan Activity 14A dan 14B

---

### **3. PERBAIKAN USE CASE DIAGRAM ITERASI 2**

#### **a) Update Jumlah Use Case**

- **Sebelum:** 15 use case
- **Sesudah:** 22 use case
- **File yang diupdate:**
  - `TA_gueh/BAB_3_Metode_palingbaru.md`
  - `TA_gueh/BAB_III_METODE_REKOMENDASI_PERBAIKAN.md`
  - `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`

#### **b) Perbaikan Daftar Aktor**

- **Sebelum:** PPAT/PPATS, LTB, BANK, Peneliti, Peneliti Validasi, LSB, Admin
- **Sesudah:** PPAT/PPATS, LTB, Bank (Produk Online Terintegrasi), Peneliti, Peneliti Validasi, Sistem, Admin
- **Perubahan:**
  - "LSB" dihapus (diganti dengan "Sistem")
  - "BANK" → "Bank (Produk Online Terintegrasi)"

#### **c) Perbaikan Nama Use Case**

- **Sebelum:** "Select Reusable Signature"
- **Sesudah:** "Select Reusable Signature - Peneliti Validasi"

#### **d) Migrasi Konten dari Bab Metode ke Bab Hasil & Pembahasan**

- **Konteks:** Diskusi Use Case Diagram Iterasi 2 dipindahkan dari Bab Metode ke Bab Hasil & Pembahasan
- **File:** `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`

---

### **4. PERBAIKAN STRUKTUR DATABASE ITERASI 2**

#### **a) Perbaikan Jumlah Tabel Baru**

- **Sebelum:** 8 tabel baru
- **Sesudah:** 7 tabel baru
- **Alasan:** `pat_7_validasi_surat` sudah ada di Iterasi 1, bukan tabel baru
- **File yang diupdate:**
  - `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
  - `TA_gueh/PROSES_PENGEMBANGAN_ITERASI_2_REVISI.md`

#### **b) Tabel Baru yang Benar (7 tabel):**

1. `ppat_daily_quota`
2. `ppat_send_queue`
3. `peneliti_daily_counter`
4. `pv_local_certs`
5. `pv_2_signing_requests`
6. `pv_4_signing_audit_event`
7. `pv_7_audit_log`
8. `bank_1_cek_hasil_transaksi`
9. `sys_notifications`
10. `a_2_verified_users` (update, bukan baru)

**Catatan:** Perlu dicek ulang apakah benar 7 atau 8 tabel baru.

---

### **5. PERBAIKAN REFERENSI GAMBAR ITERASI 2**

#### **a) Perbaikan "Gambar Y"**

- **Masalah:** Ada referensi "Gambar Y" yang tidak jelas
- **Solusi:** Diubah menjadi nomor gambar yang benar:
  - **Sertifikat Digital Lokal:** "Gambar 12" dan "Activity 4 (Generate Sertifikat Digital Lokal) di lampiran"
  - **Validasi QR Code Ganda:** "Gambar 12" dan "Activity 5 (Generate QR Code) di lampiran"

#### **b) Perbaikan Referensi Activity di Lampiran**

- **Sebelum:** "Activity 21", "Activity 22", "Activity 24"
- **Sesudah:**
  - "Activity 4 (Generate Sertifikat Digital Lokal) di lampiran"
  - "Activity 5 (Generate QR Code) di lampiran"
  - "Activity 7 (Integrasi Bank dengan LTB Parallel Workflow) di lampiran"

#### **c) Mapping Gambar yang Benar:**

- **Gambar 11:** Activity Diagram Bank Integration (Iterasi 2)
- **Gambar 12:** Activity Diagram Final Peneliti Validasi (Iterasi 2)
- **Gambar 13:** Activity Diagram Upload Tanda Tangan Sekali (Iterasi 2)
- **Gambar 14:** Activity Diagram Peneliti Auto Fill Signature (Reusable) - Iterasi 2
- **Gambar 15:** Activity Diagram Admin Validasi QR Code (Iterasi 2)

#### **d) Perbaikan Referensi Gambar 11**

- **Sebelum:** "Gambar 11" untuk Peneliti Auto Fill Signature
- **Sesudah:** "Gambar 14" untuk Peneliti Auto Fill Signature

---

### **6. PERBAIKAN FORMAT TEKS**

#### **a) Perbaikan Format List**

- **Masalah:** Format list menggunakan `(1)`, `(2)`, `(3)`
- **Solusi:** Diubah menjadi `1)`, `2)`, `3)` sesuai KBBI
- **File:** `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
- **Lokasi:** Bagian "Fokus Iterasi Pertama"

#### **b) Konversi List Database ke Tabel**

- **Masalah:** List database sulit dibaca
- **Solusi:** Dikonversi menjadi tabel seperti tampilan MySQL
- **File:** `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
- **Lokasi:** Bagian "Quick Plan" - "Struktur Database"

#### **c) Penghapusan Duplikat**

- **Masalah:** Ada duplikat "Struktur Database" di bagian "Hasil Iterasi 1"
- **Solusi:** Dihapus, hanya disimpan di bagian "Quick Plan"
- **File:** `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`

---

### **7. PERBAIKAN TEKS REPETITIF**

#### **a) Simplifikasi Kalimat di Bagian Communication**

- **Sebelum:**

  > "penandatanganan dokumen, dan koordinasi antar divisi masih dilakukan secara manual menggunakan berkas fisik. Proses penanganan dokumen memerlukan tanda tangan manual di atas kertas dan pengiriman fisik antar divisi."
  >

  - **Sesudah:**
    > "penandatanganan dokumen, dan koordinasi antar divisi masih dilakukan secara manual dengan menggunakan berkas fisik yang harus ditandatangani di atas kertas dan dikirimkan secara fisik antar divisi."
    >
- **File yang diupdate:**

  - `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
  - `TA_gueh/BAB_3_Metode_palingbaru.md`
  - `TA_gueh/BAB_IV_HASIL_DAN_PEMBAHASAN_LENGKAP.md`

---

### **8. PERBAIKAN REFERENSI PRESSMAN**

#### **a) Update Edisi Pressman**

- **Sebelum:**
  - Pressman, R. S. (2010). *Software Engineering: A Practitioner's Approach* (7th ed.)
  - Pressman, R. S. (2014). *Software Engineering: A Practitioner's Approach*
- **Sesudah:**
  - Pressman, R. S., & Maxim, B. R. (2019). *Software Engineering: A Practitioner's Approach* (9th ed.). New York: McGraw-Hill Education.
- **Alasan:** Batas penggunaan referensi wajib sebelum 5 tahun (2019 masih dalam batas)
- **File yang diupdate:**
  - `TA_gueh/06_Tugas Akhir_farras.md`
  - `TA_gueh/03_tugasAkhir.md`
  - `TA_gueh/BAB_3_Metode_palingbaru.md`

#### **b) Update Referensi dalam Teks**

- **Sebelum:** "Pressman (2010)", "Pressman (2014)"
- **Sesudah:** "Pressman dan Maxim (2019)"
- **File yang diupdate:**
  - `TA_gueh/03_tugasAkhir.md` (3 tempat)
  - `TA_gueh/06_Tugas Akhir_farras.md` (1 tempat)
  - `TA_gueh/BAB_3_Metode_palingbaru.md` (1 tempat)

---

### **9. PEMBUATAN FILE BARU**

#### **a) PROSES_PENGEMBANGAN_ITERASI_2_REVISI.md**

- **Tujuan:** File markdown baru untuk perbandingan dengan versi lama
- **Isi:** Ekstraksi dan format ulang bagian "Proses Pengembangan Iterasi 2"
- **File:** `TA_gueh/PROSES_PENGEMBANGAN_ITERASI_2_REVISI.md`

#### **b) CEK_22_ACTIVITY_DIAGRAM_ITERASI_2.md**

- **Tujuan:** Analisis dan perbandingan 22 Activity Diagram Iterasi 2
- **Isi:** Mapping antara daftar user dengan Tabel 9, identifikasi yang kurang
- **File:** `TA_gueh/CEK_22_ACTIVITY_DIAGRAM_ITERASI_2.md`

---

### **10. PERBAIKAN KONSISTENSI DOKUMENTASI**

#### **a) Konsistensi Use Case Diagram**

- **File referensi:** `DIAGRAMS/Iterasi_Diagrams/Iterasi_2/usecase-iterasi2.md`
- **File yang diupdate:** `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
- **Perubahan:** Memastikan teks sesuai dengan diagram XML

#### **b) Konsistensi Nomor Lampiran**

- **Masalah:** Ada perbedaan penomoran lampiran antara daftar user dan file resmi
- **Catatan:** Perlu disesuaikan antara Lampiran 62-74 (user) dengan Lampiran 88-125 (resmi)

---

## 📝 CHECKLIST FILE YANG PERLU DICEK ULANG

### **File Utama:**

- [ ] `TA_gueh/Bab_4_hasilPembahasan_pbaru.md` - File utama Bab Hasil & Pembahasan
- [ ] `TA_gueh/03_tugasAkhir.md` - File TA utama
- [ ] `TA_gueh/06_Tugas Akhir_farras.md` - File TA alternatif
- [ ] `TA_gueh/BAB_3_Metode_palingbaru.md` - Bab Metode
- [ ] `TA_gueh/BAB_IV_HASIL_DAN_PEMBAHASAN_LENGKAP.md` - Bab Hasil & Pembahasan lengkap

### **File Tabel Lampiran:**

- [ ] `TA_gueh/Tabel_Lampiran_Iterasi_1_LENGKAP.md` - Sudah diupdate (42 Activity Diagram)
- [ ] `TA_gueh/Tabel_Lampiran_Iterasi_2_LENGKAP.md` - Perlu dicek konsistensi
- [ ] `TA_gueh/Tabel_Lampiran_Iterasi_3_LENGKAP.md` - Sudah dibuat

### **File Activity Diagram:**

- [ ] `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/Activity_14_Peneliti_Receive_from_LTB.xml` - Sudah disederhanakan
- [ ] `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/Activity_14A_Peneliti_Verify_Document.xml` - BARU, sudah diperbaiki decision node
- [ ] `DIAGRAMS/Iterasi_Diagrams/Iterasi_1/Activity_Diagrams/Activity_14B_Peneliti_Add_Manual_Signature.xml` - BARU
- [ ] `DIAGRAMS/Iterasi_Diagrams/Iterasi_3/Activity_Diagrams/Activity_49_Admin_Masuk_Antrian.xml` - Sudah diperbaiki path

---

## ⚠️ HAL-HAL YANG PERLU DIPERHATIKAN

1. **Perbedaan Penomoran Lampiran:**

   - Daftar user menggunakan Lampiran 62-74
   - File resmi menggunakan Lampiran 88-125
   - **Perlu disesuaikan**
2. **Jumlah Tabel Baru Iterasi 2:**

   - Sudah diperbaiki dari 8 menjadi 7
   - **Perlu dicek ulang** apakah benar 7 atau ada yang terlewat
3. **22 Activity Diagram Iterasi 2:**

   - 5 di Bab Hasil & Pembahasan (Gambar 11-15)
   - 17 di Lampiran (Lampiran 88-125)
   - **Daftar user hanya menyebutkan 12, kurang 7 diagram Bank**
4. **File yang Mungkin Belum Tersave:**

   - Semua perubahan di `Bab_4_hasilPembahasan_pbaru.md`
   - Update referensi Pressman di semua file
   - Update Use Case Diagram dari 15 menjadi 22

---

## 🔍 LANGKAH VERIFIKASI

1. **Cek File Utama:**

   - Buka `TA_gueh/Bab_4_hasilPembahasan_pbaru.md`
   - Cek apakah Use Case Diagram sudah 22 (bukan 15)
   - Cek apakah aktor sudah benar (tidak ada LSB, ada Sistem)
   - Cek apakah struktur database Iterasi 2 sudah 7 tabel (bukan 8)
2. **Cek Referensi Pressman:**

   - Cari "Pressman (2010)" atau "Pressman (2014)"
   - Pastikan sudah diganti menjadi "Pressman dan Maxim (2019)"
   - Cek daftar pustaka sudah menggunakan edisi 9 (2019)
3. **Cek Referensi Gambar:**

   - Cari "Gambar Y" - pastikan sudah diganti
   - Cek mapping gambar 11-15 sudah benar
   - Cek referensi Activity di lampiran sudah benar
4. **Cek Format Teks:**

   - Cek format list sudah `1)`, `2)`, `3)` (bukan `(1)`, `(2)`)
   - Cek struktur database sudah dalam bentuk tabel
   - Cek tidak ada duplikat "Struktur Database"
5. **Cek Activity Diagram:**

   - Pastikan Activity_14 sudah di-split menjadi 3 file
   - Pastikan Activity_14A sudah memiliki 2 path untuk decision node
   - Pastikan Activity_49 sudah diperbaiki path-nya

---

## 📌 REKOMENDASI

1. **Backup File Sebelumnya:**

   - Simpan versi lama sebagai backup
   - Buat folder `TA_gueh/backup/` jika belum ada
2. **Verifikasi Satu per Satu:**

   - Gunakan checklist di atas
   - Tandai yang sudah dicek
   - Catat yang masih perlu diperbaiki
3. **Gunakan File Rekap:**

   - File ini sebagai panduan
   - File `CEK_22_ACTIVITY_DIAGRAM_ITERASI_2.md` untuk verifikasi Activity Diagram
   - File `PROSES_PENGEMBANGAN_ITERASI_2_REVISI.md` untuk referensi Iterasi 2

---

**Catatan:** Jika ada perubahan yang tidak tersave, gunakan file-file di folder `TA_gueh/` sebagai referensi untuk memastikan semua perubahan sudah dilakukan.
