# ITERASI 1: SISTEM BOOKING ONLINE BAPPENDA
## Pembuatan Booking hingga Pengiriman

---

## 📋 **OVERVIEW ITERASI PERTAMA**

**Periode Pengembangan:** November 2024 - Januari 2025  
**Metodologi:** Wawancara dan Observasi  
**Tools:** Figma (UI/UX Design) → Implementation  
**Scope:** Pembuatan booking hingga pengiriman ke LSB  

---

## 🎯 **TAHAPAN PENGEMBANGAN**

### **1. Analisis Kebutuhan (November 2024 - Januari 2025)**
- **Wawancara** dengan stakeholder BAPPENDA
- **Observasi** alur kerja manual yang ada
- **Identifikasi** kebutuhan sistem yang diperlukan
- **Pemahaman** kinerja dan proses bisnis

### **2. Desain UI/UX (Figma)**
- Perancangan interface pengguna
- Wireframe dan mockup sistem
- User experience flow
- Design system dan komponen

### **3. Implementasi Sistem**
- Backend API development
- Frontend HTML/CSS/JavaScript
- Database design dan implementation
- Integration testing

---

## 🔄 **ALUR KERJA ITERASI PERTAMA**

### **Tahap 1: Pembuatan Booking**
```
PPAT/PPATS → Membuat Booking Baru
```

**Database Tables yang Terlibat:**
1. `pat_1_bookingsspd` - Data booking utama
2. `pat_2_bphtb_perhitungan` - Perhitungan BPHTB
3. `pat_4_objek_pajak` - Data objek pajak
4. `pat_5_penghitungan_njop` - Perhitungan NJOP

**Generate Booking Number:** `ppat_khusus + 2025 + urut`

### **Tahap 2: Penambahan Fitur Lanjutan**
```
Booking Terbuat → Penambahan Data Tambahan
```

**Database Tables Tambahan:**
5. `pat_6_sign` - Tanda tangan (PPAT dan WP opsional)
6. `pat_8_validasi_tambahan` - Data tambahan untuk permohonan validasi

**Upload Dokumen ke `pat_1_bookingsspd`:**
- Akta
- Sertifikat tanah
- Dokumen pelengkap

### **Tahap 3: Pengiriman ke LTB**
```
Booking Lengkap → Kirim ke LTB
```

**Database Table:**
7. `ltb_1_terima_berkas_sspd` - Data penerimaan berkas LTB

**Generate No. Registrasi:** `2025 + O + urut`

**Status Options:**
- Diajukan ke peneliti
- Ditolak

### **Tahap 4: Proses Peneliti**
```
LTB → Peneliti → Verifikasi
```

**Database Tables:**
8. `p_2_verif_sign` - Tanda tangan manual peneliti (drop gambar)
9. `p_1_verifikasi` - Data verifikasi peneliti

**Proses:**
- Peneliti menambahkan tanda tangan manual
- Drop gambar di area "tambahkan tanda tangan"
- Pemberian status verifikasi

### **Tahap 5: Clear to Paraf**
```
Peneliti → Clear to Paraf
```

**Database Table:**
10. `p_3_clear_to_paraf` - Data clear untuk paraf

**Proses:**
- Pemberian paraf dan stempel
- Persetujuan untuk lanjut ke peneliti validasi

### **Tahap 6: Peneliti Validasi (Pejabat)**
```
Clear to Paraf → Peneliti Validasi
```

**Database Table:**
11. `pv_1_paraf_validate` - Data validasi pejabat

**Proses:**
- Pejabat memberikan persetujuan/tolak
- **TANPA** sertifikat dan autentikasi (iterasi 1)
- Tanda tangan wajib dilakukan manual (drop gambar)
- Sama seperti proses peneliti

### **Tahap 7: Pengiriman ke LSB**
```
Peneliti Validasi → LSB (Manual)
```

**Database Table:**
12. `lsb_1_serah_berkas` - Data serah berkas LSB

**Proses:**
- Pengiriman manual ke LSB
- Update status di sistem

### **Tahap 8: Finalisasi**
```
LSB → Update Booking
```

**Proses:**
- LSB mengupdate `pat_1_bookingsspd`
- Penyelesaian proses booking

---

## 🗄️ **DATABASE TABLES ITERASI PERTAMA**

| **No** | **Table Name** | **Purpose** | **Stage** |
|--------|----------------|-------------|-----------|
| 1 | `pat_1_bookingsspd` | Data booking utama + dokumen | Booking Creation |
| 2 | `pat_2_bphtb_perhitungan` | Perhitungan BPHTB | Booking Creation |
| 3 | `pat_4_objek_pajak` | Data objek pajak | Booking Creation |
| 4 | `pat_5_penghitungan_njop` | Perhitungan NJOP | Booking Creation |
| 5 | `pat_6_sign` | Tanda tangan PPAT & WP | Feature Addition |
| 6 | `pat_8_validasi_tambahan` | Data tambahan validasi | Feature Addition |
| 7 | `ltb_1_terima_berkas_sspd` | Penerimaan berkas LTB | LTB Process |
| 8 | `p_2_verif_sign` | Tanda tangan peneliti | Peneliti Process |
| 9 | `p_1_verifikasi` | Data verifikasi peneliti | Peneliti Process |
| 10 | `p_3_clear_to_paraf` | Clear untuk paraf | Clear Process |
| 11 | `pv_1_paraf_validate` | Validasi pejabat | Peneliti Validasi |
| 12 | `lsb_1_serah_berkas` | Serah berkas LSB | LSB Process |

**Total Database Tables:** **12 Tables** (dari 14 yang disebutkan, 2 tables lainnya mungkin untuk sistem pendukung)

---

## 🎨 **FITUR UTAMA ITERASI PERTAMA**

### **1. Booking Management**
- ✅ Pembuatan booking baru
- ✅ Generate nomor booking otomatis
- ✅ Upload dokumen (akta, sertifikat, pelengkap)
- ✅ Perhitungan BPHTB dan NJOP otomatis

### **2. Document Management**
- ✅ Upload dan penyimpanan dokumen
- ✅ Tanda tangan manual (drop gambar)
- ✅ Validasi dokumen

### **3. Workflow Management**
- ✅ Alur kerja dari PPAT → LTB → Peneliti → LSB
- ✅ Status tracking di setiap tahap
- ✅ Notifikasi sistem

### **4. User Interface**
- ✅ Dashboard PPAT/PPATS
- ✅ Form booking (Badan & Perorangan)
- ✅ Monitoring dan tracking
- ✅ Responsive design

---

## 🚫 **LIMITASI ITERASI PERTAMA**

### **Fitur yang BELUM diimplementasikan:**
- ❌ Sertifikat digital dan autentikasi BSRE
- ❌ QR Code generation
- ❌ Tanda tangan digital
- ❌ Integrasi bank otomatis
- ❌ Notifikasi real-time
- ❌ Dashboard admin lengkap

### **Proses Manual:**
- 🔄 Tanda tangan dilakukan dengan drop gambar
- 🔄 Pengiriman ke LSB masih manual
- 🔄 Validasi pejabat tanpa sertifikat digital

---

## 📊 **STATISTIK ITERASI PERTAMA**

| **Metric** | **Value** |
|------------|-----------|
| **Database Tables** | 12 tables |
| **HTML Pages** | 5 halaman (PPAT/PPATS) |
| **API Endpoints** | ~30 endpoints |
| **Development Time** | 3 bulan (Nov-Jan) |
| **User Roles** | PPAT, PPATS, LTB, Peneliti, LSB |
| **Document Types** | Akta, Sertifikat, Pelengkap |

---

## 🎯 **HASIL CAPAIAN ITERASI PERTAMA**

### **✅ Berhasil Diimplementasikan:**
1. **Sistem booking online** yang fungsional
2. **Database structure** yang solid
3. **Workflow management** dari booking hingga LSB
4. **User interface** yang user-friendly
5. **Document management** system
6. **Status tracking** di setiap tahap

### **📈 Dampak Positif:**
- Mengurangi proses manual
- Meningkatkan efisiensi kerja
- Standardisasi proses booking
- Tracking yang lebih baik
- Dokumentasi yang terstruktur

---

## 🔮 **RENCANA ITERASI SELANJUTNYA**

### **Iterasi 2 (Rencana):**
- Implementasi sertifikat digital BSRE
- QR Code generation
- Tanda tangan digital
- Integrasi bank
- Notifikasi real-time
- Dashboard admin lengkap

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*
