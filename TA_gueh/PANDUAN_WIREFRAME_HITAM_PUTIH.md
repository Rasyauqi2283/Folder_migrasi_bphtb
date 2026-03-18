# 📐 PANDUAN WIREFRAME HITAM PUTIH - BOOKING ONLINE

## 🎯 KONSEP

**Wireframe Hitam Putih (Low-Fidelity):**
- Fokus pada struktur dan layout
- Tidak perlu warna atau detail visual
- Cepat dibuat
- Untuk dokumentasi TA di bagian Quick Design
- Mockup detail akan dibuat di tahap Construction (prototype)

---

## 📋 WIREFRAME YANG PERLU DIBUAT (5-6 Halaman)

### **1. Dashboard Booking PPAT/PPATS** ✅ WAJIB

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: Logo | Nama User | Logout          │
├─────────────────────────────────────────────┤
│ SIDEBAR │ CONTENT AREA                      │
│         │                                    │
│ - Dashboard│ ┌──────────────────────────┐  │
│ - Buat     │ │ [Buat Booking Baru]      │  │
│   Booking  │ │ (Button Besar)           │  │
│ - Data     │ └──────────────────────────┘  │
│   Booking  │                                │
│            │ ┌──────────────────────────┐  │
│            │ │ Data Booking Tercetak    │  │
│            │ │ ┌────┐ ┌────┐ ┌────┐    │  │
│            │ │ │Card│ │Card│ │Card│    │  │
│            │ │ └────┘ └────┘ └────┘    │  │
│            │ │ [Filter] [Search]        │  │
│            │ └──────────────────────────┘  │
└────────────┴──────────────────────────┘
```

**Komponen:**
- Header bar (rectangle)
- Sidebar navigation (rectangle dengan list)
- Card "Buat Booking Baru" (rectangle besar)
- List cards untuk data booking (beberapa rectangle)
- Filter dan search bar (rectangle kecil)

---

### **2. Form Create Booking** ✅ WAJIB

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: [Kembali] | Buat Booking Baru      │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ TAB 1: Data Wajib Pajak             │   │
│ ├─────────────────────────────────────┤   │
│ │ Nama: [_____________]               │   │
│ │ NIK:  [_____________]               │   │
│ │ Alamat: [_________________]         │   │
│ │ NPWP: [_____________]               │   │
│ │ ...                                 │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ TAB 2: Data Pemilik Objek Pajak     │   │
│ │ TAB 3: Data Objek Pajak             │   │
│ │ TAB 4: Perhitungan NJOP             │   │
│ │ TAB 5: Perhitungan BPHTB            │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Simpan Draft] [Lanjutkan] [Simpan & Kirim]│
└─────────────────────────────────────────────┘
```

**Komponen:**
- Header dengan tombol kembali
- Tabs navigation (rectangle dengan label)
- Form fields (rectangle dengan label di kiri)
- Input fields (rectangle horizontal)
- Buttons di bawah (rectangle dengan text)

---

### **3. Upload Dokumen** ✅ PENTING

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: Upload Dokumen - [No. Booking]      │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Akta Tanah                          │   │
│ │ ┌───────────────────────────────┐   │   │
│ │ │  [Drag & Drop Area]           │   │   │
│ │ │  atau [Browse File]            │   │   │
│ │ └───────────────────────────────┘   │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Sertifikat Tanah                    │   │
│ │ [Upload Area]                       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Dokumen Pelengkap                   │   │
│ │ [Upload Area]                       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Kembali] [Simpan] [Kirim ke LTB]          │
└─────────────────────────────────────────────┘
```

**Komponen:**
- Header
- Upload sections (rectangle besar untuk drop area)
- Preview area (rectangle untuk dokumen yang sudah diupload)
- Action buttons

---

### **4. Validasi Dokumen LTB** ✅ WAJIB

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: Validasi Dokumen - [No. Booking]    │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Preview Dokumen                     │   │
│ │ ┌────┐ ┌────┐ ┌────┐               │   │
│ │ │Akta│ │Sert│ │Pelg│               │   │
│ │ └────┘ └────┘ └────┘               │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Checklist Validasi                  │   │
│ │ ☐ Dokumen Lengkap                  │   │
│ │ ☐ Data Sesuai                      │   │
│ │ ☐ Tanda Tangan Valid               │   │
│ │                                     │   │
│ │ Catatan: [_________________]       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Terima] [Tolak]                           │
└─────────────────────────────────────────────┘
```

**Komponen:**
- Header
- Preview area (beberapa rectangle untuk dokumen)
- Checklist (list dengan checkbox)
- Input catatan (rectangle text area)
- Action buttons

---

### **5. Final Validation Peneliti Validasi** ✅ WAJIB

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: Validasi Final - [No. Registrasi]   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Preview Dokumen Lengkap             │   │
│ │ [Dokumen yang sudah diparaf]        │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ Upload Tanda Tangan Manual          │   │
│ │ ┌───────────────────────────────┐   │   │
│ │ │  [Drop Gambar Tanda Tangan]  │   │   │
│ │ └───────────────────────────────┘   │   │
│ │                                     │   │
│ │ Catatan: [_________________]       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ [Setujui] [Tolak] [Kembali]                │
└─────────────────────────────────────────────┘
```

**Komponen:**
- Header
- Preview dokumen
- Upload area untuk tanda tangan
- Input catatan
- Action buttons

---

### **6. Dashboard Admin Monitoring** ✅ WAJIB

**Struktur Wireframe:**
```
┌─────────────────────────────────────────────┐
│ HEADER: Logo | Admin | Logout               │
├─────────────────────────────────────────────┤
│ SIDEBAR │ CONTENT AREA                      │
│         │                                    │
│ - Dashboard│ ┌────┐ ┌────┐ ┌────┐         │
│ - Monitoring││Stat│ │Stat│ │Stat│         │
│ - Notifikasi│└────┘ └────┘ └────┘         │
│            │                                │
│            │ ┌──────────────────────────┐  │
│            │ │ Grafik/Chart Area          │  │
│            │ └──────────────────────────┘  │
│            │                                │
│            │ ┌──────────────────────────┐  │
│            │ │ Tabel Semua Booking      │  │
│            │ │ [Filter] [Search]        │  │
│            │ │ ┌────────────────────┐   │  │
│            │ │ │ Row 1              │   │  │
│            │ │ │ Row 2              │   │  │
│            │ │ │ Row 3              │   │  │
│            │ │ └────────────────────┘   │  │
│            │ └──────────────────────────┘  │
└────────────┴───────────────────────────────┘
```

**Komponen:**
- Header
- Sidebar
- Statistik cards (beberapa rectangle kecil)
- Grafik area (rectangle besar)
- Tabel (rectangle dengan rows)

---

## 🎨 STYLE GUIDE WIREFRAME HITAM PUTIH

### **Elemen Dasar:**
- **Rectangle** untuk semua container, card, button
- **Line** untuk divider, border
- **Text** untuk label, placeholder
- **Tidak ada warna** - hanya hitam, putih, abu-abu

### **Hierarki Visual:**
- **Hitam tebal** untuk border utama, header
- **Abu-abu gelap** untuk border sekunder
- **Abu-abu terang** untuk background area
- **Putih** untuk content area

### **Typography:**
- **Bold** untuk heading, label penting
- **Regular** untuk text biasa
- **Placeholder text:** "Label" atau "Input Text" atau "..."

### **Spacing:**
- Konsisten antar elemen
- Padding: 16px atau 20px
- Margin antar section: 24px atau 32px

---

## 💡 TIPS MEMBUAT WIREFRAME CEPAT DI FIGMA

### **1. Setup Template Base:**
- Buat 1 frame dengan Header + Sidebar + Content
- Simpan sebagai Component
- Duplikasi untuk setiap halaman

### **2. Komponen Reusable:**
- **Button:** Rectangle dengan text di tengah
- **Input Field:** Rectangle dengan label di atas
- **Card:** Rectangle dengan border
- **Table:** Rectangle dengan rows (garis horizontal)

### **3. Shortcuts Cepat:**
- **R** = Rectangle tool
- **T** = Text tool
- **L** = Line tool
- **Auto Layout** untuk spacing otomatis

### **4. Workflow:**
1. Buat frame (F)
2. Paste template base
3. Tambahkan komponen sesuai kebutuhan
4. Label dengan text
5. Selesai!

---

## 📊 CHECKLIST WIREFRAME

### **Setiap Wireframe Harus Punya:**
- [ ] Header (logo, user, logout)
- [ ] Navigation/Sidebar (jika ada)
- [ ] Content area dengan komponen utama
- [ ] Action buttons
- [ ] Label yang jelas

### **Tidak Perlu:**
- [ ] Warna (kecuali hitam, putih, abu-abu)
- [ ] Icon detail
- [ ] Shadow atau efek visual
- [ ] Gambar/foto real
- [ ] Font fancy

---

## 🎯 HASIL AKHIR

**Wireframe hitam putih akan:**
- Cepat dibuat (1-2 jam untuk 5-6 wireframe)
- Fokus pada struktur dan layout
- Mudah dipahami untuk dokumentasi TA
- Profesional untuk bagian Quick Design

**Mockup detail akan dibuat di tahap Construction:**
- Dengan warna sesuai design system
- Icon dan visual detail
- Lebih mirip hasil akhir
- Untuk implementasi prototype

---

*Panduan ini untuk membuat wireframe hitam putih yang efisien dan sesuai kebutuhan TA*
