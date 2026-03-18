# USE CASE DIAGRAM ITERASI 3: SISTEM KUOTASI HARIAN

## 📋 **OVERVIEW USE CASE DIAGRAM**

**Fokus:** Aktor dan use cases untuk sistem kuotasi harian  
**Tujuan:** Mendefinisikan interaksi antar aktor dengan sistem  
**Database:** 2 tabel (`ppat_daily_quota`, `ppat_send_queue`)  
**Aktor:** 5 aktor utama  
**Use Cases:** 9 use cases yang diimplementasikan  

---

## 👥 **AKTOR SISTEM**

### **1. PPAT/PPATS (Hijau)**
- **Role:** Pengirim berkas
- **Color:** #2E7D32 (Hijau)
- **Use Cases:** Kirim Berkas

### **2. LTB (Biru)**
- **Role:** Penerima dan pengelola berkas
- **Color:** #1976D2 (Biru)
- **Use Cases:** Cek Daily Counter, Queue Management

### **3. Peneliti (Orange)**
- **Role:** Pemroses berkas
- **Color:** #F57C00 (Orange)
- **Use Cases:** Proses Berkas Langsung

### **4. Admin (Coklat)**
- **Role:** Administrator sistem
- **Color:** #5D4037 (Coklat)
- **Use Cases:** Masuk Antrian, Monitor Quota, View Queue Status

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
- **Database:** `ppat_daily_quota`
- **Flow:** LTB → Cek Daily Counter → Database

#### **3. Queue Management**
- **Description:** Mengelola antrian berkas
- **Actor:** LTB
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Antrian terkelola
- **Database:** `ppat_send_queue`
- **Flow:** LTB → Queue Management → Database

### **Peneliti Use Cases:**

#### **4. Proses Berkas Langsung**
- **Description:** Memproses berkas dalam kuota harian
- **Actor:** Peneliti
- **Precondition:** Counter < 80
- **Postcondition:** Berkas diproses
- **Flow:** Peneliti → Proses Berkas Langsung → System

### **Admin Use Cases:**

#### **5. Masuk Antrian**
- **Description:** Memasukkan berkas ke antrian
- **Actor:** Admin
- **Precondition:** Counter ≥ 80
- **Postcondition:** Berkas masuk antrian
- **Database:** `ppat_send_queue`
- **Flow:** Admin → Masuk Antrian → Database

#### **6. Monitor Quota**
- **Description:** Monitoring kuota harian
- **Actor:** Admin
- **Precondition:** Sistem berjalan
- **Postcondition:** Kuota terpantau
- **Database:** `ppat_daily_quota`
- **Flow:** Admin → Monitor Quota → Database

#### **7. View Queue Status**
- **Description:** Melihat status antrian berkas
- **Actor:** Admin
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Status antrian ditampilkan
- **Database:** `ppat_send_queue`
- **Flow:** Admin → View Queue Status → Database

### **System Use Cases:**

#### **8. Auto Reset Counter**
- **Description:** Reset otomatis counter setiap hari
- **Actor:** System
- **Precondition:** Hari kerja baru
- **Postcondition:** Counter direset ke 0
- **Database:** `ppat_daily_quota`
- **Flow:** System → Auto Reset Counter → Database

#### **9. Schedule Next Day**
- **Description:** Penjadwalan otomatis untuk hari berikutnya
- **Actor:** System
- **Precondition:** Ada berkas di antrian
- **Postcondition:** Berkas terjadwal otomatis
- **Database:** `ppat_send_queue`
- **Flow:** System → Schedule Next Day → Database

---

## 🗄️ **DATABASE TABLES**

### **1. ppat_daily_quota**
- **Purpose:** Tracking kuota harian
- **Fields:** quota_date (date), used_count (int), limit_count (int), updated_at (timestamp)
- **Default Limit:** 80 dokumen per hari
- **Use Cases:** Cek Daily Counter, Monitor Quota, Auto Reset Counter

### **2. ppat_send_queue**
- **Purpose:** Antrian berkas
- **Fields:** id (bigserial), nobooking (varchar), userid (varchar), scheduled_for (date), requested_at (timestamp), status (varchar), sent_at (timestamp)
- **Use Cases:** Masuk Antrian, Schedule Next Day, Queue Management, View Queue Status

---

## 🔗 **RELATIONSHIPS**

### **Actor-Use Case Relationships:**
- **PPAT/PPATS** → Kirim Berkas
- **LTB** → Cek Daily Counter, Queue Management
- **Peneliti** → Proses Berkas Langsung
- **Admin** → Masuk Antrian, Monitor Quota, View Queue Status
- **System** → Auto Reset Counter, Schedule Next Day

### **Use Case-Database Relationships:**
- **Cek Daily Counter** → `ppat_daily_quota`
- **Masuk Antrian** → `ppat_send_queue`
- **Auto Reset Counter** → `ppat_daily_quota`
- **Schedule Next Day** → `ppat_send_queue`
- **Monitor Quota** → `ppat_daily_quota`
- **Queue Management** → `ppat_send_queue`
- **View Queue Status** → `ppat_send_queue`

---

## 📊 **STATISTIK USE CASE**

| **Aktor** | **Jumlah Use Cases** | **Warna** |
|-----------|---------------------|-----------|
| **PPAT/PPATS** | 1 | Hijau (#2E7D32) |
| **LTB** | 2 | Biru (#1976D2) |
| **Peneliti** | 1 | Orange (#F57C00) |
| **Admin** | 3 | Coklat (#5D4037) |
| **System** | 2 | Ungu (#7B1FA2) |
| **Total** | **9** | - |

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
2. **9 use cases** yang diimplementasikan
3. **2 database tables** yang terintegrasi (`ppat_daily_quota` dan `ppat_send_queue`)
4. **Relationships** yang jelas antar komponen

**Catatan:** Use Case Diagram ini hanya mencakup use cases yang benar-benar diimplementasikan. Use cases seperti Break Reminder, Stress Prevention, Workload Distribution, Generate Reports, dan Dashboard Analytics tidak diimplementasikan sebagai fitur spesifik, melainkan sebagai manfaat implicit dari sistem kuotasi.

Sistem kuotasi harian berhasil **mendefinisikan interaksi** yang efisien dan berkelanjutan antara aktor dan sistem.

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*