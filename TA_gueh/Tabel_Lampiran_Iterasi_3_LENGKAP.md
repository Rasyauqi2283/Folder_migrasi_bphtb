# TABEL LAMPIRAN ITERASI 3 - LENGKAP

| No | Nama Activity Diagram | Deskripsi Lengkap | Lampiran |
|----|----------------------|-------------------|----------|
| 1 | PPAT Kirim Berkas (Iterasi 3) | **Aktor:** PPAT/PPATS, Sistem. **Alur:** Proses pengiriman berkas dengan pengecekan kuota harian. PPAT memilih booking yang akan dikirim, sistem memulai transaction, upsert ppat_daily_quota (quota_date=today, limit_count=80), cek kuota (used_count < limit_count?), jika kuota tersedia: insert ke ppat_send_queue (status='sent', sent_at=now()), increment used_count, update pat_1_bookingsspd (trackstatus='Diolah'), insert ke ltb_1_terima_berkas_sspd, commit transaction, dan notifikasi real-time ke LTB. Jika kuota penuh: return error 409 (Kuota Hari Ini Penuh). **Catatan:** Dengan sistem kuotasi harian (beda dengan Iterasi 1 yang tanpa kuotasi). | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 126 - Halaman Kirim Berkas dengan Kuotasi |
| 2 | LTB Cek Daily Counter | **Aktor:** LTB, Sistem. **Alur:** LTB memeriksa kuota harian yang tersisa. Proses meliputi LTB membuka dashboard LTB, request quota info (GET /api/ppat/quota?date=today), sistem validasi authentication, normalize date parameter, query ppat_daily_quota (SELECT quota_date, used_count, limit_count WHERE quota_date=$1), return JSON response {date, used, limit, remaining} dengan default used=0 dan limit=80 jika belum ada data, dan LTB melihat info kuota (used_count, limit_count, remaining). | Lampiran 127 - Activity Diagram LTB Cek Daily Counter<br>Lampiran 128 - Halaman Cek Daily Counter LTB |
| 3 | Peneliti Proses Berkas Langsung | **Aktor:** Peneliti, Sistem. **Alur:** Peneliti memproses berkas yang masuk dalam kuota harian dan increment counter. Proses meliputi Peneliti menerima berkas dari LTB (trackstatus='Diolah'), membuka booking untuk diverifikasi, memverifikasi dokumen (Akta, Sertifikat, Tanda Tangan), increment counter (POST /api/peneliti/counter/:userid/increment), sistem call increment_peneliti_counter($1, $2), get updated counter info, return JSON response {success, message, data: {userid, counter, ...}}, dan Peneliti melihat hasil (Counter Updated, New Counter Value). | Lampiran 129 - Activity Diagram Peneliti Proses Berkas Langsung<br>Lampiran 130 - Halaman Proses Berkas Langsung Peneliti |
| 4 | Admin Masuk Antrian | **Aktor:** Admin, Sistem. **Alur:** Admin memasukkan berkas ke antrian dengan penjadwalan untuk hari tertentu. Proses meliputi Admin membuka dashboard Admin, memilih booking yang akan dimasukkan ke antrian, cek status booking (trackstatus: Draft/Pending?), schedule send (POST /api/ppat/schedule-send) {nobooking, scheduled_for}, sistem validasi authentication & input, cek status booking, mulai transaction, upsert ppat_daily_quota untuk tanggal scheduled_for, cek kuota (used_count < limit_count?), jika kuota tersedia: insert ke ppat_send_queue (status='queued'), update pat_1_bookingsspd (trackstatus='Pending'), increment used_count, commit transaction, return JSON response {success, scheduled_for, used, limit, remaining}. Jika kuota penuh: return error 409. | Lampiran 131 - Activity Diagram Admin Masuk Antrian<br>Lampiran 132 - Halaman Masuk Antrian Admin |
| 5 | System Schedule Next Day | **Aktor:** System (Cron/Worker), Sistem. **Alur:** Sistem otomatis memproses antrian berkas yang terjadwal untuk hari ini selama jam kerja (09:00-16:00). Proses meliputi cron job triggered (POST /api/ppat/process-pending-queue), cek jam kerja (currentHour >= 9 && currentHour < 16?), jika outside hours: return {processed: 0}, jika within hours: mulai transaction, get pending queue untuk hari ini (SELECT FROM ppat_send_queue WHERE scheduled_for=today AND status='queued' ORDER BY requested_at ASC LIMIT 10), cek ada berkas di antrian?, loop proses setiap berkas: update ppat_send_queue (status='sent', sent_at=now()), update pat_1_bookingsspd (trackstatus='Diolah'), insert ke ltb_1_terima_berkas_sspd (generate no_registrasi), increment processed counter, commit transaction, dan return JSON response {success, processed, message}. | *(Activity Diagram dijelaskan di Bab Hasil & Pembahasan - Tidak Masuk Lampiran)*<br>Lampiran 133 - Halaman Schedule Next Day (System) |
| 6 | Admin Monitor Quota | **Aktor:** Admin, Sistem. **Alur:** Admin memantau kuota harian, melihat used_count, limit_count, dan remaining. Proses meliputi Admin membuka dashboard Admin, request quota info (GET /api/ppat/quota?date=today), sistem validasi authentication, normalize date parameter, query ppat_daily_quota, return JSON response {date, used, limit, remaining}, Admin melihat info kuota (used_count, limit_count, remaining, progress bar), dan monitor trend kuota (refresh periodik, alert jika > 80%). | Lampiran 134 - Activity Diagram Admin Monitor Quota<br>Lampiran 135 - Halaman Monitor Quota Admin |
| 7 | Admin View Queue Status | **Aktor:** Admin, Sistem. **Alur:** Admin melihat status antrian berkas yang terjadwal. Proses meliputi Admin membuka dashboard Admin, request queue status (GET /api/ppat/my-schedules), sistem validasi authentication, query ppat_send_queue (SELECT id, nobooking, scheduled_for, status, requested_at, sent_at WHERE userid=$1 ORDER BY scheduled_for, requested_at), return JSON response {success, data: [{id, nobooking, scheduled_for, status, requested_at, sent_at}]}, Admin melihat status antrian (id, nobooking, scheduled_for, status, requested_at, sent_at), dan filter & sort antrian (By Date, Status, Priority). | Lampiran 136 - Activity Diagram Admin View Queue Status<br>Lampiran 137 - Halaman View Queue Status Admin |
| 8 | System Auto Reset Counter | **Aktor:** System (Cron Job), Sistem. **Alur:** Sistem otomatis mereset counter harian pada pukul 00:00 setiap hari. Proses meliputi cron job triggered (Scheduled: 00:00 Daily, POST /api/peneliti/counter/auto-reset), cek tanggal hari ini (Hari Kerja Baru?), call auto_reset_daily_counters() (database function), reset peneliti_daily_counter (UPDATE counter = 0 WHERE date = today), reset ppat_daily_quota (UPDATE used_count = 0 WHERE quota_date = today), dan return JSON response {success, message: 'Auto-reset completed successfully'}. | Lampiran 138 - Activity Diagram System Auto Reset Counter<br>Lampiran 139 - Halaman Auto Reset Counter (System) |
| 9 | LTB Queue Management | **Aktor:** LTB, Sistem. **Alur:** LTB mengelola antrian berkas dengan memproses berkas yang terjadwal untuk hari ini. Proses meliputi LTB membuka dashboard LTB, melihat daftar antrian (Queue Status, Scheduled For, Requested At), cek kuota hari ini (GET /api/ppat/quota), proses antrian (POST /api/ppat/process-pending-queue), sistem cek jam kerja (currentHour >= 9 && currentHour < 16?), jika within hours: mulai transaction, get pending queue untuk hari ini, cek ada berkas di antrian?, loop proses setiap berkas: update ppat_send_queue (status='sent'), update pat_1_bookingsspd (trackstatus='Diolah'), insert ke ltb_1_terima_berkas_sspd, increment processed counter, commit transaction, return JSON response {success, processed, message}, dan LTB melihat hasil (processed count, status updates). | Lampiran 140 - Activity Diagram LTB Queue Management<br>Lampiran 141 - Halaman Queue Management LTB |

---

## RINGKASAN LAMPIRAN

### **Total Activity Diagram Iterasi 3: 9 Activity Diagram** (2 Activity Diagram dijelaskan di Bab Hasil & Pembahasan, 7 Activity Diagram masuk lampiran)
### **Total Lampiran Iterasi 3: 16 Lampiran** (Lampiran 126-141)

**Rincian:**
- **Activity Diagram di Lampiran:** 7 lampiran (Lampiran 127, 129, 131, 134, 136, 138, 140)
- **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):** 2 Activity Diagram
  - No 1: PPAT Kirim Berkas (Iterasi 3) - Activity 46
  - No 5: System Schedule Next Day - Activity 50
- **Tampilan Website:** 9 lampiran (Lampiran 126, 128, 130, 132, 133, 135, 137, 139, 141)

---

## CATATAN

1. **Format Lampiran:**
   - Activity Diagram selalu ditempatkan terlebih dahulu (Lampiran ganjil mulai dari 127, 129, 131, dst.)
   - Tampilan Website mengikuti setelah Activity Diagram terkait (Lampiran genap/berturut-turut)
   - 2 Activity Diagram (PPAT Kirim Berkas Iterasi 3, System Schedule Next Day) dijelaskan di Bab Hasil & Pembahasan, tidak masuk lampiran
   - Untuk Activity Diagram yang dijelaskan di Bab, hanya tampilan website yang masuk lampiran (Lampiran 126, 133)

2. **Pemisahan Fitur:**
   - Setiap fitur memiliki Activity Diagram terpisah sesuai prinsip "1 fitur = 1 Activity Diagram"
   - Sistem kuotasi harian dipisah menjadi 9 Activity Diagram individual
   - Setiap aktor memiliki Activity Diagram terpisah sesuai perannya

3. **Activity Diagram di Bab Hasil & Pembahasan (Tidak Masuk Lampiran):**
   - **No 1: PPAT Kirim Berkas (Iterasi 3)** - Activity 46 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 126: Hanya Tampilan Website)
   - **No 5: System Schedule Next Day** - Activity 50 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 134: Hanya Tampilan Website)

4. **Mapping Nomor Activity Diagram:**
   - No 1: Activity 46 - PPAT Kirim Berkas (Iterasi 3) - **Dijelaskan di Bab Hasil & Pembahasan**
   - No 2: Activity 47 - LTB Cek Daily Counter - Lampiran 127-128
   - No 3: Activity 48 - Peneliti Proses Berkas Langsung - Lampiran 129-130
   - No 4: Activity 49 - Admin Masuk Antrian - Lampiran 131-132
   - No 5: Activity 50 - System Schedule Next Day - **Dijelaskan di Bab Hasil & Pembahasan**
   - No 6: Activity 51 - Admin Monitor Quota - Lampiran 134-135
   - No 7: Activity 52 - Admin View Queue Status - Lampiran 136-137
   - No 8: Activity 53 - System Auto Reset Counter - Lampiran 138-139
   - No 9: Activity 54 - LTB Queue Management - Lampiran 140-141

5. **File Activity Diagram:**
   - Semua Activity Diagram tersedia di folder `DIAGRAMS/Iterasi_Diagrams/Iterasi_3/Activity_Diagrams/`
   - Format file: XML (Draw.io compatible)

6. **File Tampilan Website:**
   - Screenshot/wireframe tampilan website tersedia sesuai struktur halaman yang ada di sistem
   - File HTML tersedia di folder `public/html_folder/` sesuai struktur role

---

**Versi:** Lengkap - Sistem Kuotasi Harian Iterasi 3 (Total 9 Activity Diagram, 2 di Bab Hasil & Pembahasan, 7 di Lampiran)  
**Tanggal:** 2025  
**Status:** ✅ Semua Activity Diagram Sudah Terpisah Sesuai Prinsip 1 Fitur = 1 Activity Diagram

---

## CATATAN PENTING TENTANG 2 ACTIVITY DIAGRAM DI BAB HASIL & PEMBAHASAN

**Activity Diagram berikut dijelaskan secara detail di Bab Hasil & Pembahasan dan TIDAK masuk ke Lampiran:**

1. **No 1: PPAT Kirim Berkas (Iterasi 3)** - Activity 46 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 126: Hanya Tampilan Website)
   - **Alasan:** Activity diagram ini merupakan inti dari sistem kuotasi harian dan menunjukkan perbedaan utama dengan Iterasi 1. Penjelasan detail diperlukan untuk menunjukkan evolusi sistem dan mekanisme pengecekan kuota.

2. **No 5: System Schedule Next Day** - Activity 50 - Dijelaskan di Bab Hasil & Pembahasan (Lampiran 133: Hanya Tampilan Website)
   - **Alasan:** Activity diagram ini menggambarkan proses otomatis yang merupakan fitur baru penting dalam sistem kuotasi. Penjelasan detail diperlukan untuk menunjukkan mekanisme batch processing dan integrasi dengan sistem lain.

**Activity Diagram ini tetap ada dan dijelaskan di Bab Hasil & Pembahasan, hanya tidak dicetak ulang di Lampiran.**

---

## KETERKAITAN DENGAN ITERASI SEBELUMNYA

- **Lampiran Iterasi 1:** Lampiran 1-84 (Total 84 Lampiran)
- **Lampiran Iterasi 2:** Lampiran 85-125 (Total 41 Lampiran)
- **Lampiran Iterasi 3:** Lampiran 126-141 (Total 16 Lampiran)
- **Total Lampiran Gabungan:** Lampiran 1-141 (Total 141 Lampiran)

---

## PERBEDAAN ITERASI 3 DENGAN ITERASI SEBELUMNYA

### **Iterasi 1:**
- **PPAT Send to LTB:** Tanpa sistem kuotasi, langsung dikirim ke LTB
- **Tidak ada antrian:** Berkas langsung diproses

### **Iterasi 3:**
- **PPAT Kirim Berkas:** Dengan sistem kuotasi harian (limit 80 dokumen/hari)
- **Ada antrian:** Berkas yang melebihi kuota masuk ke antrian (ppat_send_queue)
- **Auto processing:** Sistem otomatis memproses antrian selama jam kerja (09:00-16:00)
- **Auto reset:** Counter direset otomatis setiap pukul 00:00

### **Fitur Baru Iterasi 3:**
1. **Sistem Kuotasi Harian:** Limit 80 dokumen per hari
2. **Antrian Berkas:** ppat_send_queue untuk penjadwalan
3. **Auto Reset Counter:** Reset otomatis setiap hari
4. **Schedule Next Day:** Penjadwalan untuk hari berikutnya
5. **Queue Management:** Pengelolaan antrian oleh LTB
6. **Monitor Quota:** Monitoring kuota harian oleh Admin

---

## DATABASE TABLES ITERASI 3

### **1. ppat_daily_quota**
- **Purpose:** Tracking kuota harian PPAT
- **Fields:** quota_date (date), used_count (int), limit_count (int), updated_at (timestamp)
- **Default Limit:** 80 dokumen per hari
- **Used in:** Activities 46, 47, 49, 51, 53

### **2. ppat_send_queue**
- **Purpose:** Antrian berkas yang terjadwal
- **Fields:** id (bigserial), nobooking (varchar), userid (varchar), scheduled_for (date), requested_at (timestamp), status (varchar), sent_at (timestamp)
- **Status Values:** 'queued', 'sent'
- **Used in:** Activities 46, 49, 50, 52, 54

### **3. peneliti_daily_counter**
- **Purpose:** Counter harian per peneliti
- **Fields:** userid (varchar), date (date), counter (int)
- **Used in:** Activities 48, 53

---

## ALUR UTAMA SISTEM KUOTASI HARIAN

1. **PPAT Kirim Berkas** → Cek Kuota → Jika Tersedia: Proses Langsung | Jika Penuh: Masuk Antrian
2. **Admin Masuk Antrian** → Schedule untuk Tanggal Tertentu → Cek Kuota Tanggal Tersebut
3. **System Schedule Next Day** → Proses Antrian Hari Ini (09:00-16:00) → Update Status ke LTB
4. **LTB Queue Management** → Proses Antrian → Update Status Booking
5. **Peneliti Proses Berkas** → Increment Counter → Update Status
6. **System Auto Reset** → Reset Counter Harian (00:00) → Siap untuk Hari Baru

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*
