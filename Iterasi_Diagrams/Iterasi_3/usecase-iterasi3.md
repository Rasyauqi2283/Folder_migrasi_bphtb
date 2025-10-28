# USE CASE DIAGRAM ITERASI 3: SISTEM KUOTASI HARIAN

## 📋 **OVERVIEW USE CASE DIAGRAM**

**Fokus:** Aktor dan use cases untuk sistem kuotasi harian  
**Tujuan:** Mendefinisikan interaksi antar aktor dengan sistem  
**Database:** 2 tabel (`daily_counter`, `ppatk_send_queue`)  
**Aktor:** 5 aktor utama  

---

## 👥 **AKTOR SISTEM**

### **1. PPAT/PPATS (Hijau)**
- **Role:** Pengirim berkas
- **Color:** #2E7D32 (Hijau)
- **Use Cases:** Kirim Berkas

### **2. LTB (Biru)**
- **Role:** Penerima dan pengelola berkas
- **Color:** #1976D2 (Biru)
- **Use Cases:** Cek Daily Counter, Dashboard Analytics, Queue Management

### **3. Peneliti (Orange)**
- **Role:** Pemroses berkas
- **Color:** #F57C00 (Orange)
- **Use Cases:** Proses Berkas Langsung, Break Reminder, Stress Prevention, Workload Distribution

### **4. Admin (Coklat)**
- **Role:** Administrator sistem
- **Color:** #5D4037 (Coklat)
- **Use Cases:** Masuk Antrian, Schedule Next Day, Monitor Quota, View Queue Status, Generate Reports

### **5. System (Ungu)**
- **Role:** Sistem otomatis
- **Color:** #7B1FA2 (Ungu)
- **Use Cases:** Auto Reset Counter, Schedule Next Day

---

## 📋 **USE CASES DETAILED**

### **PPAT/PPATS Use Cases:**

#### **1. Kirim Berkas**
- **Description:** Mengirim berkas ke sistem
- **Actor:** PPAT/PPATS
- **Precondition:** PPAT memiliki berkas yang siap dikirim
- **Postcondition:** Berkas masuk ke sistem
- **Flow:** PPAT → Kirim Berkas → Sistem

### **LTB Use Cases:**

#### **2. Cek Daily Counter**
- **Description:** Memeriksa kuota harian yang tersisa
- **Actor:** LTB
- **Precondition:** Ada berkas masuk
- **Postcondition:** Counter terupdate
- **Database:** `daily_counter`
- **Flow:** LTB → Cek Daily Counter → Database

#### **3. Dashboard Analytics**
- **Description:** Melihat statistik dan analisis kuota
- **Actor:** LTB
- **Precondition:** Sistem berjalan
- **Postcondition:** Data analytics ditampilkan
- **Flow:** LTB → Dashboard Analytics → System

#### **4. Queue Management**
- **Description:** Mengelola antrian berkas
- **Actor:** LTB
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Antrian terkelola
- **Database:** `ppatk_send_queue`
- **Flow:** LTB → Queue Management → Database

### **Peneliti Use Cases:**

#### **5. Proses Berkas Langsung**
- **Description:** Memproses berkas dalam kuota harian
- **Actor:** Peneliti
- **Precondition:** Counter < 80
- **Postcondition:** Berkas diproses
- **Flow:** Peneliti → Proses Berkas Langsung → System

#### **6. Break Reminder**
- **Description:** Pengingat istirahat setiap 2 jam
- **Actor:** Peneliti
- **Precondition:** Sistem berjalan
- **Postcondition:** Reminder ditampilkan
- **Flow:** System → Break Reminder → Peneliti

#### **7. Stress Prevention**
- **Description:** Pencegahan stress melalui limit kuota harian
- **Actor:** Peneliti
- **Precondition:** Sistem berjalan
- **Postcondition:** Stress level terkontrol
- **Flow:** Peneliti → Stress Prevention → System

#### **8. Workload Distribution**
- **Description:** Distribusi beban kerja yang merata
- **Actor:** Peneliti
- **Precondition:** Ada multiple peneliti
- **Postcondition:** Beban kerja terdistribusi
- **Flow:** Peneliti → Workload Distribution → System

### **Admin Use Cases:**

#### **9. Masuk Antrian**
- **Description:** Memasukkan berkas ke antrian
- **Actor:** Admin
- **Precondition:** Counter ≥ 80
- **Postcondition:** Berkas masuk antrian
- **Database:** `ppatk_send_queue`
- **Flow:** Admin → Masuk Antrian → Database

#### **10. Schedule Next Day**
- **Description:** Menjadwalkan berkas untuk hari berikutnya
- **Actor:** Admin
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Berkas terjadwal
- **Database:** `ppatk_send_queue`
- **Flow:** Admin → Schedule Next Day → Database

#### **11. Monitor Quota**
- **Description:** Monitoring kuota harian
- **Actor:** Admin
- **Precondition:** Sistem berjalan
- **Postcondition:** Kuota terpantau
- **Database:** `daily_counter`
- **Flow:** Admin → Monitor Quota → Database

#### **12. View Queue Status**
- **Description:** Melihat status antrian berkas
- **Actor:** Admin
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Status antrian ditampilkan
- **Database:** `ppatk_send_queue`
- **Flow:** Admin → View Queue Status → Database

#### **13. Generate Reports**
- **Description:** Membuat laporan sistem
- **Actor:** Admin
- **Precondition:** Data tersedia
- **Postcondition:** Laporan dibuat
- **Flow:** Admin → Generate Reports → System

### **System Use Cases:**

#### **14. Auto Reset Counter**
- **Description:** Reset otomatis counter setiap hari
- **Actor:** System
- **Precondition:** Hari kerja baru
- **Postcondition:** Counter direset ke 0
- **Database:** `daily_counter`
- **Flow:** System → Auto Reset Counter → Database

#### **15. Schedule Next Day**
- **Description:** Penjadwalan otomatis untuk hari berikutnya
- **Actor:** System
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Berkas terjadwal otomatis
- **Database:** `ppatk_send_queue`
- **Flow:** System → Schedule Next Day → Database

---

## 🗄️ **DATABASE TABLES**

### **1. daily_counter**
- **Purpose:** Tracking kuota harian
- **Fields:** date, counter
- **Use Cases:** Cek Daily Counter, Monitor Quota, Auto Reset Counter

### **2. ppatk_send_queue**
- **Purpose:** Antrian berkas
- **Fields:** nobooking, userid, scheduled_for, status
- **Use Cases:** Masuk Antrian, Schedule Next Day, Queue Management, View Queue Status

---

## 🔗 **RELATIONSHIPS**

### **Actor-Use Case Relationships:**
- **PPAT/PPATS** → Kirim Berkas
- **LTB** → Cek Daily Counter, Dashboard Analytics, Queue Management
- **Peneliti** → Proses Berkas Langsung, Break Reminder, Stress Prevention, Workload Distribution
- **Admin** → Masuk Antrian, Schedule Next Day, Monitor Quota, View Queue Status, Generate Reports
- **System** → Auto Reset Counter, Schedule Next Day

### **Use Case-Database Relationships:**
- **Cek Daily Counter** → `daily_counter`
- **Masuk Antrian** → `ppatk_send_queue`
- **Auto Reset Counter** → `daily_counter`
- **Schedule Next Day** → `ppatk_send_queue`
- **Monitor Quota** → `daily_counter`
- **Queue Management** → `ppatk_send_queue`
- **View Queue Status** → `ppatk_send_queue`

---

## 📊 **STATISTIK USE CASE**

| **Aktor** | **Jumlah Use Cases** | **Warna** |
|-----------|---------------------|-----------|
| **PPAT/PPATS** | 1 | Hijau (#2E7D32) |
| **LTB** | 3 | Biru (#1976D2) |
| **Peneliti** | 4 | Orange (#F57C00) |
| **Admin** | 5 | Coklat (#5D4037) |
| **System** | 2 | Ungu (#7B1FA2) |
| **Total** | **15** | - |

---

## 🎯 **HASIL CAPAIAN**

### **✅ Use Case Coverage:**
- **100%** aktor terdefinisi dengan jelas
- **100%** use cases memiliki database integration
- **100%** relationships terdefinisi

### **✅ System Integration:**
- **Database integration** untuk semua use cases
- **Actor separation** yang jelas
- **Use case granularity** yang tepat

### **✅ User Experience:**
- **Clear responsibilities** untuk setiap aktor
- **Intuitive workflows** untuk setiap use case
- **Comprehensive coverage** semua fitur sistem

---

## 🔮 **RENCANA PENGEMBANGAN**

### **Iterasi 4 (Rencana):**
- **AI-powered** workload prediction
- **Advanced analytics** dashboard
- **Mobile app** for queue management
- **Integration** dengan sistem eksternal
- **Advanced reporting** dan forecasting

---

## 🎯 **KESIMPULAN**

Use Case Diagram Iterasi 3 menunjukkan **struktur yang jelas** dengan:

1. **5 aktor** dengan peran yang terdefinisi
2. **15 use cases** yang komprehensif
3. **2 database tables** yang terintegrasi
4. **Relationships** yang jelas antar komponen

Sistem kuotasi harian berhasil **mendefinisikan interaksi** yang manusiawi dan berkelanjutan antara aktor dan sistem.

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*