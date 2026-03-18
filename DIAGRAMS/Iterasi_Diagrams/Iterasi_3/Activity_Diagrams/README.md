# ACTIVITY DIAGRAMS ITERASI 3: SISTEM KUOTASI HARIAN

## 📋 **OVERVIEW**

Activity Diagrams untuk **9 Use Cases** pada Iterasi 3: Sistem Kuotasi Harian.

**Total Activity Diagrams:** 9  
**Format:** XML (draw.io/diagrams.net)  
**Struktur:** Swimlane dengan aktor dan sistem

---

## 📊 **DAFTAR ACTIVITY DIAGRAMS**

### **1. Activity 46: PPAT Kirim Berkas**
- **File:** `Activity_46_PPAT_Kirim_Berkas.xml`
- **Aktor:** PPAT/PPATS
- **Use Case:** Kirim Berkas
- **Deskripsi:** Proses pengiriman berkas dengan pengecekan kuota harian. Jika kuota tersedia, berkas langsung diproses. Jika kuota penuh, masuk ke antrian.
- **Endpoint:** `POST /api/ppat/send-now`
- **Database:** `ppat_daily_quota`, `ppat_send_queue`, `pat_1_bookingsspd`, `ltb_1_terima_berkas_sspd`

### **2. Activity 47: LTB Cek Daily Counter**
- **File:** `Activity_47_LTB_Cek_Daily_Counter.xml`
- **Aktor:** LTB
- **Use Case:** Cek Daily Counter
- **Deskripsi:** LTB memeriksa kuota harian yang tersisa untuk mengetahui kapasitas pemrosesan hari ini.
- **Endpoint:** `GET /api/ppat/quota`
- **Database:** `ppat_daily_quota`

### **3. Activity 48: Peneliti Proses Berkas Langsung**
- **File:** `Activity_48_Peneliti_Proses_Berkas_Langsung.xml`
- **Aktor:** Peneliti
- **Use Case:** Proses Berkas Langsung
- **Deskripsi:** Peneliti memproses berkas yang masuk dalam kuota harian dan increment counter peneliti.
- **Endpoint:** `POST /api/peneliti/counter/:userid/increment`
- **Database:** `peneliti_daily_counter`

### **4. Activity 49: Admin Masuk Antrian**
- **File:** `Activity_49_Admin_Masuk_Antrian.xml`
- **Aktor:** Admin
- **Use Case:** Masuk Antrian
- **Deskripsi:** Admin memasukkan berkas ke antrian dengan penjadwalan untuk hari tertentu. Sistem mengecek kuota untuk tanggal yang dipilih.
- **Endpoint:** `POST /api/ppat/schedule-send`
- **Database:** `ppat_daily_quota`, `ppat_send_queue`, `pat_1_bookingsspd`

### **5. Activity 50: System Schedule Next Day**
- **File:** `Activity_50_System_Schedule_Next_Day.xml`
- **Aktor:** System (Cron/Worker)
- **Use Case:** Schedule Next Day
- **Deskripsi:** Sistem otomatis memproses antrian berkas yang terjadwal untuk hari ini selama jam kerja (09:00-16:00). Berkas diproses dan masuk ke LTB.
- **Endpoint:** `POST /api/ppat/process-pending-queue`
- **Database:** `ppat_send_queue`, `pat_1_bookingsspd`, `ltb_1_terima_berkas_sspd`

### **6. Activity 51: Admin Monitor Quota**
- **File:** `Activity_51_Admin_Monitor_Quota.xml`
- **Aktor:** Admin
- **Use Case:** Monitor Quota
- **Deskripsi:** Admin memantau kuota harian, melihat used_count, limit_count, dan remaining. Dapat memantau trend dan mendapatkan alert jika kuota > 80%.
- **Endpoint:** `GET /api/ppat/quota`
- **Database:** `ppat_daily_quota`

### **7. Activity 52: Admin View Queue Status**
- **File:** `Activity_52_Admin_View_Queue_Status.xml`
- **Aktor:** Admin
- **Use Case:** View Queue Status
- **Deskripsi:** Admin melihat status antrian berkas yang terjadwal, termasuk scheduled_for, status, requested_at, dan sent_at. Dapat melakukan filter dan sort.
- **Endpoint:** `GET /api/ppat/my-schedules`
- **Database:** `ppat_send_queue`

### **8. Activity 53: System Auto Reset Counter**
- **File:** `Activity_53_System_Auto_Reset_Counter.xml`
- **Aktor:** System (Cron Job)
- **Use Case:** Auto Reset Counter
- **Deskripsi:** Sistem otomatis mereset counter harian pada pukul 00:00 setiap hari. Reset dilakukan untuk `peneliti_daily_counter` dan `ppat_daily_quota`.
- **Endpoint:** `POST /api/peneliti/counter/auto-reset`
- **Database:** `peneliti_daily_counter`, `ppat_daily_quota`

### **9. Activity 54: LTB Queue Management**
- **File:** `Activity_54_LTB_Queue_Management.xml`
- **Aktor:** LTB
- **Use Case:** Queue Management
- **Deskripsi:** LTB mengelola antrian berkas dengan memproses berkas yang terjadwal untuk hari ini. Proses dilakukan selama jam kerja (09:00-16:00).
- **Endpoint:** `POST /api/ppat/process-pending-queue`
- **Database:** `ppat_send_queue`, `pat_1_bookingsspd`, `ltb_1_terima_berkas_sspd`

---

## 🎨 **WARNA AKTOR**

| Aktor | Warna | Hex Code |
|-------|-------|----------|
| **PPAT/PPATS** | Hijau | #E8F5E8 / #2E7D32 |
| **LTB** | Biru | #E3F2FD / #1976D2 |
| **Peneliti** | Orange | #FFF3E0 / #F57C00 |
| **Admin** | Coklat | #EFEBE9 / #5D4037 |
| **System** | Ungu | #F3E5F5 / #7B1FA2 |

---

## 🗄️ **DATABASE TABLES**

### **1. ppat_daily_quota**
- **Purpose:** Tracking kuota harian PPAT
- **Fields:** quota_date, used_count, limit_count, updated_at
- **Default Limit:** 80 dokumen per hari
- **Used in:** Activities 46, 47, 49, 51, 53

### **2. ppat_send_queue**
- **Purpose:** Antrian berkas yang terjadwal
- **Fields:** id, nobooking, userid, scheduled_for, requested_at, status, sent_at
- **Used in:** Activities 46, 49, 50, 52, 54

### **3. peneliti_daily_counter**
- **Purpose:** Counter harian per peneliti
- **Fields:** userid, date, counter
- **Used in:** Activities 48, 53

### **4. pat_1_bookingsspd**
- **Purpose:** Tabel utama booking SSPD
- **Used in:** Activities 46, 49, 50, 54

### **5. ltb_1_terima_berkas_sspd**
- **Purpose:** Tabel penerimaan berkas oleh LTB
- **Used in:** Activities 46, 50, 54

---

## 🔄 **ALUR UTAMA SISTEM**

1. **PPAT Kirim Berkas** → Cek Kuota → Jika Tersedia: Proses Langsung | Jika Penuh: Masuk Antrian
2. **Admin Masuk Antrian** → Schedule untuk Tanggal Tertentu → Cek Kuota Tanggal Tersebut
3. **System Schedule Next Day** → Proses Antrian Hari Ini (09:00-16:00) → Update Status ke LTB
4. **LTB Queue Management** → Proses Antrian → Update Status Booking
5. **Peneliti Proses Berkas** → Increment Counter → Update Status
6. **System Auto Reset** → Reset Counter Harian (00:00) → Siap untuk Hari Baru

---

## 📝 **CATATAN PENTING**

1. **Jam Kerja:** Sistem hanya memproses antrian selama jam kerja (09:00-16:00)
2. **Kuota Harian:** Default limit 80 dokumen per hari
3. **Auto Reset:** Counter direset otomatis setiap pukul 00:00
4. **Queue Status:** 
   - `queued`: Masih dalam antrian
   - `sent`: Sudah diproses dan dikirim ke LTB
5. **Booking Status:**
   - `Draft`: Belum dikirim
   - `Pending`: Terjadwal di antrian
   - `Diolah`: Sedang diproses di LTB

---

## 🎯 **KESIMPULAN**

Activity Diagrams Iterasi 3 menunjukkan **alur lengkap sistem kuotasi harian** dengan:

- ✅ **9 Activity Diagrams** yang mencakup semua use cases
- ✅ **5 Aktor** dengan peran yang jelas
- ✅ **5 Database Tables** yang terintegrasi
- ✅ **Alur bisnis** yang jelas dari pengiriman hingga pemrosesan
- ✅ **Sistem otomatis** untuk reset dan penjadwalan

Sistem kuotasi harian berhasil **mengatur alur kerja** yang efisien dan berkelanjutan.

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*
