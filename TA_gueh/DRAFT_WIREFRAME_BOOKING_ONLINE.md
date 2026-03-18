# 📐 DRAFT WIREFRAME - FITUR BOOKING ONLINE E-BPHTB

## 🎯 LINGKUP WIREFRAME

**Judul TA:** PERANCANGAN FITUR BOOKING ONLINE PADA WEBSITE E-BPHTB  
**Fokus:** Hanya halaman yang terkait dengan proses booking online  
**Tidak termasuk:** Halaman pengaturan sistem, manajemen user, laporan keuangan, dll

---

## 📋 DAFTAR WIREFRAME YANG PERLU DIBUAT

### **ROLE: PPAT/PPATS (4 halaman)**

#### **1. Login PPAT/PPATS** ⚠️ OPSIONAL
- **Deskripsi:** Halaman login untuk PPAT/PPATS
- **Komponen:**
  - Form login (username/email, password)
  - Tombol "Masuk"
  - Link "Lupa Password?"
- **Prioritas:** ⭐⭐ (bisa skip, cukup umum)

#### **2. Dashboard Booking PPAT/PPATS** ✅ PENTING
- **Deskripsi:** Halaman utama PPAT untuk melihat daftar booking
- **Komponen:**
  - Header: Logo, Nama User, Logout
  - Sidebar/Menu: Dashboard, Buat Booking Baru, Data Booking
  - Content Area:
    - Card "Buat Booking Baru" (tombol besar)
    - Section "Data Booking Tercetak" (list booking dengan status)
    - Filter: Status (Semua, Menunggu, Diproses, Selesai, Ditolak)
    - Search bar
  - Status badge untuk setiap booking
- **Prioritas:** ⭐⭐⭐⭐⭐ (WAJIB - ini yang ada di gambar kamu)

#### **3. Form Create Booking** ✅ SANGAT PENTING
- **Deskripsi:** Form untuk membuat booking baru
- **Komponen:**
  - Header: Judul "Buat Booking Baru", tombol "Kembali"
  - Form Sections (dalam tabs atau accordion):
    - Tab 1: Data Wajib Pajak (Nama, NIK, Alamat, NPWP, dll)
    - Tab 2: Data Pemilik Objek Pajak (Nama, NIK, Alamat, dll)
    - Tab 3: Data Objek Pajak (Letak Tanah, Harga Transaksi, dll)
    - Tab 4: Perhitungan NJOP (Luas Tanah, NJOP Tanah, Luas Bangunan, NJOP Bangunan)
    - Tab 5: Perhitungan BPHTB (NPOPTKP, BPHTB yang telah dibayar)
  - Tombol: "Simpan Draft", "Lanjutkan", "Simpan dan Kirim"
  - Progress indicator
- **Prioritas:** ⭐⭐⭐⭐⭐ (WAJIB - core feature)

#### **4. Upload Dokumen** ✅ PENTING
- **Deskripsi:** Halaman untuk upload dokumen pendukung
- **Komponen:**
  - Header: "Upload Dokumen - [No. Booking]"
  - Upload sections:
    - Akta Tanah (drag & drop atau browse)
    - Sertifikat Tanah
    - Dokumen Pelengkap
  - Preview dokumen yang sudah diupload
  - Tombol: "Kembali", "Simpan", "Kirim ke LTB"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

#### **5. Tracking Status Booking** ✅ PENTING
- **Deskripsi:** Halaman untuk melihat status tracking booking
- **Komponen:**
  - Header: "Tracking Booking - [No. Booking]"
  - Timeline/Progress bar: PPAT → LTB → Peneliti → Peneliti Paraf → Peneliti Validasi → LSB
  - Detail status di setiap tahap
  - Tombol "Lihat Detail Dokumen"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

---

### **ROLE: LTB (3 halaman)**

#### **6. Dashboard LTB - Terima Berkas** ✅ PENTING
- **Deskripsi:** Halaman utama LTB untuk melihat booking yang masuk
- **Komponen:**
  - Header: Logo, Nama User (LTB), Logout
  - Sidebar: Dashboard, Terima Berkas, Riwayat
  - Content Area:
    - Card statistik: Total Masuk, Menunggu Validasi, Diterima, Ditolak
    - Tabel/List booking yang masuk (dari PPAT)
    - Filter: Status, Tanggal
    - Action: "Lihat Detail", "Validasi"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

#### **7. Validasi Dokumen LTB** ✅ SANGAT PENTING
- **Deskripsi:** Halaman untuk validasi dokumen dari PPAT
- **Komponen:**
  - Header: "Validasi Dokumen - [No. Booking]"
  - Section: Preview dokumen (akta, sertifikat, pelengkap)
  - Form validasi:
    - Checklist kelengkapan dokumen
    - Input catatan/alasan (jika ditolak)
    - Tombol: "Terima", "Tolak"
  - Auto-generate No. Registrasi setelah diterima
- **Prioritas:** ⭐⭐⭐⭐⭐ (WAJIB - core feature)

#### **8. Generate No. Registrasi** ⚠️ OPSIONAL
- **Deskripsi:** Bisa digabung dengan halaman validasi
- **Prioritas:** ⭐⭐ (bisa skip, otomatis)

---

### **ROLE: PENELITI (2 halaman)**

#### **9. Dashboard Peneliti - Verifikasi** ✅ PENTING
- **Deskripsi:** Halaman utama Peneliti untuk melihat booking yang perlu diverifikasi
- **Komponen:**
  - Header: Logo, Nama User (Peneliti), Logout
  - Sidebar: Dashboard, Verifikasi, Riwayat
  - Content Area:
    - List booking dari LTB yang perlu diverifikasi
    - Filter: Status, Tanggal
    - Action: "Lihat Detail", "Verifikasi"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

#### **10. Verifikasi Dokumen Peneliti** ✅ PENTING
- **Deskripsi:** Halaman untuk verifikasi dokumen
- **Komponen:**
  - Header: "Verifikasi Dokumen - [No. Registrasi]"
  - Section: Preview dokumen yang sudah divalidasi LTB
  - Form verifikasi:
    - Checklist verifikasi data
    - Upload tanda tangan manual (drop gambar)
    - Input catatan
    - Tombol: "Setujui", "Tolak", "Kembali"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

---

### **ROLE: PENELITI PARAF (2 halaman)**

#### **11. Dashboard Peneliti Paraf** ✅ PENTING
- **Deskripsi:** Halaman untuk melihat booking yang perlu diparaf
- **Komponen:**
  - Similar dengan Dashboard Peneliti
  - List booking dari Peneliti yang perlu diparaf
- **Prioritas:** ⭐⭐⭐ (BISA DIGABUNG dengan Peneliti)

#### **12. Paraf Dokumen** ✅ PENTING
- **Deskripsi:** Halaman untuk memberikan paraf dan stempel
- **Komponen:**
  - Header: "Paraf Dokumen - [No. Registrasi]"
  - Preview dokumen yang sudah diverifikasi
  - Form paraf:
    - Upload paraf/stempel (drop gambar)
    - Input catatan
    - Tombol: "Berikan Paraf", "Kembali"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

---

### **ROLE: PENELITI VALIDASI (2 halaman)**

#### **13. Dashboard Peneliti Validasi** ✅ PENTING
- **Deskripsi:** Halaman untuk melihat booking yang perlu divalidasi final
- **Komponen:**
  - Similar dengan dashboard lainnya
  - List booking dari Clear to Paraf yang perlu divalidasi
- **Prioritas:** ⭐⭐⭐ (BISA DIGABUNG)

#### **14. Final Validation** ✅ SANGAT PENTING
- **Deskripsi:** Halaman validasi final oleh pejabat
- **Komponen:**
  - Header: "Validasi Final - [No. Registrasi]"
  - Preview dokumen lengkap
  - Form validasi:
    - Upload tanda tangan manual (drop gambar)
    - Input catatan
    - Tombol: "Setujui", "Tolak", "Kembali"
  - **Note:** Iterasi 1 - Manual signature only
- **Prioritas:** ⭐⭐⭐⭐⭐ (WAJIB - core feature)

---

### **ROLE: LSB (2 halaman)**

#### **15. Dashboard LSB - Serah Berkas** ✅ PENTING
- **Deskripsi:** Halaman untuk melihat booking yang siap diserahkan
- **Komponen:**
  - List booking dari Peneliti Validasi yang siap diserahkan
  - Action: "Lihat Detail", "Serah Terima"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

#### **16. Serah Terima Berkas** ✅ PENTING
- **Deskripsi:** Halaman untuk serah terima dokumen ke PPAT
- **Komponen:**
  - Header: "Serah Terima Berkas - [No. Booking]"
  - Detail dokumen yang akan diserahkan
  - Form:
    - Konfirmasi identitas PPAT
    - Input catatan
    - Tombol: "Konfirmasi Serah Terima", "Kembali"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

---

### **ROLE: ADMIN (1 halaman)**

#### **17. Dashboard Admin - Monitoring Booking** ✅ PENTING
- **Deskripsi:** Halaman monitoring semua booking untuk admin
- **Komponen:**
  - Header: Logo, Nama User (Admin), Logout
  - Sidebar: Dashboard, Monitoring, Notifikasi
  - Content Area:
    - Statistik: Total Booking, Status Breakdown, Grafik
    - Tabel semua booking dengan filter lengkap
    - Action: "Lihat Detail", "Send Notification"
- **Prioritas:** ⭐⭐⭐⭐ (PENTING)

---

## 🎯 REKOMENDASI WIREFRAME UNTUK DITAMPILKAN DI TA

### **WAJIB DITAMPILKAN (5-6 wireframe):**

1. ✅ **Dashboard Booking PPAT/PPATS** - Halaman utama user
2. ✅ **Form Create Booking** - Core feature booking online
3. ✅ **Validasi Dokumen LTB** - Proses validasi pertama
4. ✅ **Final Validation Peneliti Validasi** - Proses validasi akhir
5. ✅ **Dashboard Admin Monitoring** - Overview sistem

### **PENTING TAPI BISA DIKURANGI (3-4 wireframe):**

6. ⚠️ **Upload Dokumen** - Bisa digabung dengan Form Create Booking
7. ⚠️ **Tracking Status** - Bisa digabung dengan Dashboard PPAT
8. ⚠️ **Verifikasi Peneliti** - Bisa digabung dengan Validasi LTB
9. ⚠️ **Paraf Dokumen** - Bisa digabung dengan Verifikasi

### **OPSIONAL (Bisa skip):**

10. ❌ **Login** - Terlalu umum, tidak spesifik booking online
11. ❌ **Generate No. Registrasi** - Otomatis, tidak perlu wireframe terpisah
12. ❌ **Dashboard LSB** - Bisa dijelaskan dengan teks saja

---

## 📊 STRUKTUR WIREFRAME YANG DISARANKAN

### **Template Base (Gunakan untuk semua halaman):**

```
┌─────────────────────────────────────────┐
│ HEADER (Logo, Nama User, Logout)       │
├─────────────────────────────────────────┤
│ SIDEBAR │ CONTENT AREA                  │
│         │                                │
│ Menu    │ [Main Content]                 │
│ Items   │                                │
│         │                                │
└─────────┴────────────────────────────────┘
```

### **Color Scheme (Sesuai gambar kamu):**
- Background: Dark Purple (#4A148C atau similar)
- Header: Dark Reddish-Brown
- Content Area: Light Gray
- Accent: Dark Green (untuk CTA buttons)
- Text: White untuk dark background, Black untuk light background

---

## 💡 TIPS MEMBUAT WIREFRAME CEPAT

1. **Buat Template Base dulu** - Header + Sidebar + Content Area
2. **Duplikasi template** untuk setiap halaman
3. **Ganti kontennya saja** - struktur tetap sama
4. **Gunakan Components** di Figma untuk:
   - Button (Primary, Secondary)
   - Input Field
   - Card/Container
   - Status Badge
5. **Auto Layout** untuk spacing konsisten

---

## 📝 KESIMPULAN

**Total Wireframe yang Perlu Dibuat:** 17 halaman  
**Wireframe Wajib untuk TA:** 5-6 halaman (Dashboard PPAT, Form Booking, Validasi LTB, Final Validation, Dashboard Admin)  
**Wireframe Penting:** 3-4 halaman tambahan  
**Wireframe Opsional:** Bisa skip atau gabung dengan halaman lain

**Rekomendasi Final:**
- **Minimal:** 5 wireframe (wajib)
- **Ideal:** 8-9 wireframe (wajib + penting)
- **Maksimal:** 12 wireframe (jika mau lengkap)

**Untuk TA, 5-6 wireframe sudah cukup** karena:
1. Menunjukkan core features booking online
2. Mencakup semua role penting
3. Tidak terlalu banyak (membuat dokumen terlalu tebal)
4. Fokus pada fitur yang relevan dengan judul TA

---

*Draft ini dibuat berdasarkan analisis fitur booking online yang relevan dengan judul TA*
