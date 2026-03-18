# TEKS PENJELASAN ACTIVITY DIAGRAM ITERASI 3 - BAB HASIL & PEMBAHASAN

## Posisi: Di 4.1.3.2 Hasil Implementasi Iterasi 3
## Letak: Setelah paragraf pembuka, sebelum Tabel Struktur Database

---

### 4.1.3.2 Hasil Implementasi Iterasi 3

Iterasi ketiga berhasil mengimplementasikan sistem kuotasi harian yang mengatur alur kerja pemrosesan berkas dengan batasan 80 dokumen per hari. Sistem ini menggunakan 2 tabel database baru yaitu `ppat_daily_quota` untuk tracking kuota harian dan `ppat_send_queue` untuk mengelola antrian berkas yang terjadwal, serta memanfaatkan tabel `peneliti_daily_counter` untuk tracking counter harian per peneliti.

Selain tujuh activity diagram tambahan yang akan dijelaskan secara ringkas dalam tabel lampiran, sistem juga memiliki dua activity diagram utama yang menggambarkan inti dari sistem kuotasi harian. Activity diagram utama ini mencakup proses pengiriman berkas dengan pengecekan kuota (PPAT Kirim Berkas) dan proses otomatis pemrosesan antrian (System Schedule Next Day). Untuk menjaga fokus pembahasan, kedua activity diagram utama ini dijelaskan secara detail pada bagian berikut, sedangkan tujuh activity diagram tambahan disajikan secara ringkas dalam Tabel X berikut, dan diagram lengkapnya dapat dilihat pada Lampiran sesuai nomor yang tercantum.

---

## 1. Activity Diagram: PPAT Kirim Berkas (Iterasi 3)

### 1.1 Deskripsi Umum

Activity Diagram PPAT Kirim Berkas (Iterasi 3) menggambarkan proses pengiriman berkas dari PPAT/PPATS ke sistem dengan implementasi sistem kuotasi harian. Activity diagram ini merupakan evolusi dari Activity Diagram PPAT Send to LTB di Iterasi 1, dengan penambahan mekanisme pengecekan dan pengelolaan kuota harian yang membatasi jumlah dokumen yang dapat diproses per hari.

**Perbedaan Utama dengan Iterasi 1:**
- **Iterasi 1:** Berkas langsung dikirim ke LTB tanpa pengecekan kuota
- **Iterasi 3:** Berkas dikirim dengan pengecekan kuota harian (limit 80 dokumen/hari)
- **Iterasi 3:** Jika kuota tersedia, berkas langsung diproses; jika penuh, masuk ke antrian

### 1.2 Aktor

1. **PPAT/PPATS (Hijau - #E8F5E8)**
   - Peran: Pengirim berkas
   - Tindakan: Memilih booking, mengirim berkas, melihat hasil

2. **Sistem (Ungu - #F3E5F5)**
   - Peran: Pengelola kuota dan pemrosesan berkas
   - Tindakan: Validasi, cek kuota, update database, notifikasi

### 1.3 Alur Proses Detail

#### **Tahap 1: Persiapan (PPAT/PPATS)**
1. **Membuka Halaman Booking**
   - PPAT/PPATS mengakses halaman daftar booking
   - Sistem menampilkan daftar booking dengan status Draft atau Pending

2. **Cek Kelengkapan Booking**
   - Sistem melakukan validasi kelengkapan:
     - Dokumen pendukung (Akta, Sertifikat, Pelengkap)
     - Tanda tangan (manual atau reusable)
     - Data objek pajak lengkap
   - **Jika tidak lengkap:** Tampilkan error "Booking Belum Lengkap", proses berakhir
   - **Jika lengkap:** Lanjut ke tahap berikutnya

3. **Memilih Booking yang Akan Dikirim**
   - PPAT/PPATS memilih booking dari daftar
   - Sistem menampilkan detail booking yang dipilih

4. **Menekan Tombol "Kirim Sekarang"**
   - PPAT/PPATS mengklik tombol "Kirim Sekarang"
   - Sistem menerima request `POST /api/ppat/send-now` dengan parameter `nobooking` dan `userid`

#### **Tahap 2: Validasi dan Pengecekan Kuota (Sistem)**

5. **Validasi Ownership & Status**
   - Sistem memvalidasi:
     - Ownership: `userid` sesuai dengan `nobooking` di `pat_1_bookingsspd`
     - Status: `trackstatus` harus 'Draft' atau 'Pending'
   - **Jika tidak valid:** Return error, proses berakhir
   - **Jika valid:** Lanjut ke tahap berikutnya

6. **Memulai Database Transaction**
   - Sistem memulai database transaction (`BEGIN`)
   - Semua operasi database dilakukan dalam satu transaction untuk menjaga konsistensi data

7. **Upsert ppat_daily_quota**
   - Sistem melakukan upsert (insert jika belum ada, tidak melakukan apa-apa jika sudah ada) ke tabel `ppat_daily_quota`
   - Query: `INSERT INTO ppat_daily_quota (quota_date, used_count, limit_count) VALUES (today, 0, 80) ON CONFLICT (quota_date) DO NOTHING`
   - Parameter:
     - `quota_date`: Tanggal hari ini (format: YYYY-MM-DD)
     - `used_count`: 0 (default jika baru dibuat)
     - `limit_count`: 80 (batas maksimal dokumen per hari)

8. **Cek Kuota Harian**
   - Sistem melakukan query dengan `FOR UPDATE` untuk locking row:
     - `SELECT used_count, limit_count FROM ppat_daily_quota WHERE quota_date=today FOR UPDATE`
   - Sistem membandingkan: `used_count < limit_count?`
   - **Jika kuota penuh (used_count >= 80):**
     - Rollback transaction
     - Return error 409: "Kuota Hari Ini Penuh"
     - PPAT melihat error dan proses berakhir
   - **Jika kuota tersedia (used_count < 80):**
     - Lanjut ke tahap pemrosesan

#### **Tahap 3: Pemrosesan Berkas (Sistem)**

9. **Insert ke ppat_send_queue**
   - Sistem insert ke tabel `ppat_send_queue`:
     - `nobooking`: Nomor booking yang dikirim
     - `userid`: User ID PPAT/PPATS
     - `scheduled_for`: Tanggal hari ini
     - `status`: 'sent' (karena langsung diproses, bukan antrian)
     - `sent_at`: Timestamp saat ini
   - Query: `INSERT INTO ppat_send_queue (nobooking, userid, scheduled_for, status, sent_at) VALUES ($1, $2, $3, 'sent', now()) ON CONFLICT (nobooking) DO UPDATE SET status='sent', sent_at=now(), scheduled_for=$3`

10. **Increment Used Count**
    - Sistem update `ppat_daily_quota`:
      - `used_count = used_count + 1`
      - `updated_at = now()`
    - Query: `UPDATE ppat_daily_quota SET used_count = used_count + 1, updated_at = now() WHERE quota_date=today`

11. **Update Status Booking**
    - Sistem update `pat_1_bookingsspd`:
      - `trackstatus = 'Diolah'` (berkas masuk ke LTB untuk diproses)
      - `updated_at = now()`
    - Query: `UPDATE pat_1_bookingsspd SET trackstatus='Diolah', updated_at=now() WHERE nobooking=$1 AND userid=$2`

12. **Insert ke ltb_1_terima_berkas_sspd**
    - Sistem generate nomor registrasi otomatis (format: 2025O00001)
    - Sistem insert ke `ltb_1_terima_berkas_sspd`:
      - `nobooking`: Nomor booking
      - `no_registrasi`: Nomor registrasi yang digenerate
      - `tanggal_terima`: Tanggal hari ini
      - `status`: 'Diterima'
      - `trackstatus`: 'Diolah'

13. **COMMIT Transaction**
    - Sistem melakukan commit transaction
    - Semua perubahan database disimpan secara permanen

#### **Tahap 4: Notifikasi dan Hasil (Sistem & PPAT/PPATS)**

14. **Mengirim Notifikasi Real-time ke LTB**
    - Sistem mengirim notifikasi real-time ke LTB menggunakan long polling atau WebSocket
    - Notifikasi berisi informasi: booking baru masuk, nomor registrasi, status 'Diolah'

15. **Return Success Response ke PPAT**
    - Sistem return JSON response:
      ```json
      {
        "success": true,
        "message": "Berkas berhasil dikirim",
        "data": {
          "nobooking": "...",
          "status": "Diolah",
          "quota_info": {
            "used": 45,
            "limit": 80,
            "remaining": 35
          }
        }
      }
      ```

16. **PPAT Melihat Hasil Pengiriman**
    - PPAT/PPATS melihat:
      - Notifikasi sukses real-time
      - Status booking: 'Diolah'
      - Info kuota: used, limit, remaining
    - Tabel booking di-refresh untuk menampilkan status terbaru

### 1.4 Database Tables Terkait

1. **ppat_daily_quota**
   - Purpose: Tracking kuota harian
   - Operations: INSERT (upsert), SELECT FOR UPDATE, UPDATE (increment)

2. **ppat_send_queue**
   - Purpose: Antrian berkas yang terjadwal
   - Operations: INSERT (dengan status 'sent')

3. **pat_1_bookingsspd**
   - Purpose: Tabel utama booking
   - Operations: SELECT (validasi), UPDATE (status)

4. **ltb_1_terima_berkas_sspd**
   - Purpose: Penerimaan berkas oleh LTB
   - Operations: INSERT (dengan generate no_registrasi)

### 1.5 Error Handling

1. **Error: Booking Belum Lengkap**
   - Kondisi: Dokumen, tanda tangan, atau data objek pajak tidak lengkap
   - Response: Error message, proses berakhir

2. **Error: Kuota Hari Ini Penuh (Status 409)**
   - Kondisi: `used_count >= limit_count` (80 dokumen)
   - Response: HTTP 409 Conflict dengan message "Kuota Hari Ini Penuh"
   - Saran: PPAT dapat menggunakan fitur "Schedule Send" untuk menjadwalkan di hari berikutnya

3. **Error: Status Tidak Valid**
   - Kondisi: `trackstatus` bukan 'Draft' atau 'Pending'
   - Response: Error message, proses berakhir

### 1.6 Keunggulan Sistem Kuotasi

1. **Kontrol Beban Kerja:** Membatasi jumlah dokumen yang diproses per hari untuk menjaga kualitas
2. **Transparansi:** PPAT dapat melihat kuota tersisa sebelum mengirim berkas
3. **Fleksibilitas:** Jika kuota penuh, berkas dapat dijadwalkan untuk hari berikutnya
4. **Konsistensi Data:** Menggunakan database transaction untuk menjaga integritas data

---

## 2. Activity Diagram: System Schedule Next Day

### 2.1 Deskripsi Umum

Activity Diagram System Schedule Next Day menggambarkan proses otomatis pemrosesan antrian berkas yang terjadwal untuk hari ini. Activity diagram ini merupakan fitur baru di Iterasi 3 yang memungkinkan sistem secara otomatis memproses berkas-berkas yang masuk ke antrian selama jam kerja (09:00-16:00). Proses ini dijalankan oleh cron job atau worker yang berjalan secara periodik.

**Tujuan:**
- Memproses berkas yang terjadwal untuk hari ini secara otomatis
- Mengurangi beban manual LTB dalam memproses antrian
- Memastikan berkas yang terjadwal diproses tepat waktu
- Mengintegrasikan berkas dari antrian ke alur kerja LTB

### 2.2 Aktor

1. **System (Cron/Worker) (Ungu - #F3E5F5)**
   - Peran: Pemroses otomatis antrian
   - Tindakan: Trigger cron job, proses antrian, update status

### 2.3 Alur Proses Detail

#### **Tahap 1: Trigger dan Validasi Jam Kerja**

1. **Cron Job Triggered**
   - Cron job atau worker di-trigger secara periodik (misalnya setiap 5-10 menit)
   - Endpoint: `POST /api/ppat/process-pending-queue`
   - Sistem menerima request untuk memproses antrian

2. **Cek Jam Kerja**
   - Sistem memeriksa waktu saat ini:
     - `currentHour >= 9 && currentHour < 16?`
   - **Jika di luar jam kerja (sebelum 09:00 atau setelah 16:00):**
     - Return JSON response: `{success: true, message: 'Outside business hours (09:00-16:00)', processed: 0, currentHour: ...}`
     - Proses berakhir (tidak ada berkas yang diproses)
   - **Jika dalam jam kerja (09:00-16:00):**
     - Lanjut ke tahap pemrosesan

#### **Tahap 2: Pengambilan Antrian**

3. **Memulai Database Transaction**
   - Sistem memulai database transaction (`BEGIN`)
   - Semua operasi dilakukan dalam satu transaction

4. **Get Pending Queue untuk Hari Ini**
   - Sistem melakukan query untuk mengambil berkas yang terjadwal hari ini:
     ```sql
     SELECT sq.id, sq.nobooking, sq.userid, sq.scheduled_for
     FROM ppat_send_queue sq
     WHERE sq.scheduled_for = today 
       AND sq.status = 'queued'
     ORDER BY sq.requested_at ASC
     LIMIT 10
     ```
   - Parameter:
     - `scheduled_for`: Tanggal hari ini
     - `status`: 'queued' (masih dalam antrian)
     - `ORDER BY requested_at ASC`: Prioritas berdasarkan waktu request (FIFO)
     - `LIMIT 10`: Maksimal 10 berkas per batch untuk menghindari overload

5. **Cek Ada Berkas di Antrian?**
   - Sistem memeriksa hasil query:
     - **Jika tidak ada berkas (pending.rows.length === 0):**
       - Commit transaction (kosong)
       - Return: `{success: true, processed: 0, message: 'No pending queue for today'}`
       - Proses berakhir
     - **Jika ada berkas:**
       - Lanjut ke tahap pemrosesan loop

#### **Tahap 3: Pemrosesan Loop (Per Berkas)**

6. **Loop: Proses Setiap Berkas**
   - Sistem melakukan loop untuk setiap item dalam `pending.rows`
   - Setiap berkas diproses secara berurutan (sequential processing)

7. **Update ppat_send_queue**
   - Untuk setiap berkas, sistem update status:
     - `status = 'sent'` (berkas sudah diproses)
     - `sent_at = now()` (timestamp saat diproses)
   - Query: `UPDATE ppat_send_queue SET status='sent', sent_at=now() WHERE id=$1`

8. **Update pat_1_bookingsspd**
   - Sistem update status booking:
     - `trackstatus = 'Diolah'` (berkas masuk ke LTB)
     - `updated_at = now()`
   - Query: `UPDATE pat_1_bookingsspd SET trackstatus='Diolah', updated_at=now() WHERE nobooking=$1 AND userid=$2`

9. **Insert ke ltb_1_terima_berkas_sspd**
   - Sistem generate nomor registrasi otomatis (format: 2025O00001)
   - Sistem insert ke `ltb_1_terima_berkas_sspd`:
     - `nobooking`: Nomor booking
     - `no_registrasi`: Nomor registrasi yang digenerate
     - `tanggal_terima`: Tanggal hari ini
     - `status`: 'Diterima'
     - `trackstatus`: 'Diolah'
   - Sistem juga insert ke `bank_1_cek_hasil_transaksi` jika diperlukan

10. **Increment Processed Counter**
    - Sistem increment counter untuk tracking jumlah berkas yang diproses
    - Counter digunakan untuk response akhir

#### **Tahap 4: Commit dan Response**

11. **COMMIT Transaction**
    - Setelah semua berkas dalam batch diproses, sistem melakukan commit transaction
    - Semua perubahan database disimpan secara permanen

12. **Return JSON Response**
    - Sistem return JSON response:
      ```json
      {
        "success": true,
        "processed": 5,
        "message": "Successfully processed 5 bookings from queue"
      }
      ```
    - Parameter:
      - `processed`: Jumlah berkas yang berhasil diproses
      - `message`: Pesan konfirmasi

### 2.4 Database Tables Terkait

1. **ppat_send_queue**
   - Purpose: Antrian berkas yang terjadwal
   - Operations: SELECT (pending queue), UPDATE (status to 'sent')

2. **pat_1_bookingsspd**
   - Purpose: Tabel utama booking
   - Operations: UPDATE (status to 'Diolah')

3. **ltb_1_terima_berkas_sspd**
   - Purpose: Penerimaan berkas oleh LTB
   - Operations: INSERT (dengan generate no_registrasi)

### 2.5 Karakteristik Proses Otomatis

1. **Jam Kerja Terbatas:**
   - Proses hanya berjalan selama jam kerja (09:00-16:00)
   - Di luar jam kerja, sistem tidak memproses antrian
   - Alasan: Menyesuaikan dengan jam operasional BAPPENDA

2. **Batch Processing:**
   - Maksimal 10 berkas per batch untuk menghindari overload
   - Jika ada lebih dari 10 berkas, batch berikutnya akan diproses pada trigger berikutnya
   - Alasan: Menjaga performa sistem dan stabilitas database

3. **FIFO (First In First Out):**
   - Berkas diproses berdasarkan `requested_at ASC` (yang request lebih dulu diproses lebih dulu)
   - Alasan: Keadilan dalam pemrosesan antrian

4. **Transaction Safety:**
   - Semua operasi dalam satu transaction
   - Jika terjadi error, semua perubahan di-rollback
   - Alasan: Menjaga konsistensi data

### 2.6 Integrasi dengan Sistem Lain

1. **Notifikasi ke LTB:**
   - Setelah berkas diproses, sistem mengirim notifikasi real-time ke LTB
   - LTB dapat melihat berkas baru yang masuk di dashboard

2. **Notifikasi ke PPAT:**
   - PPAT menerima notifikasi bahwa berkas yang terjadwal sudah diproses
   - Status booking berubah dari 'Pending' menjadi 'Diolah'

3. **Tracking History:**
   - Semua perubahan status dicatat dalam audit trail
   - PPAT dapat melihat history perubahan status booking

### 2.7 Keunggulan Sistem Otomatis

1. **Efisiensi:** Mengurangi beban manual LTB dalam memproses antrian
2. **Ketepatan Waktu:** Berkas yang terjadwal diproses tepat waktu sesuai jadwal
3. **Konsistensi:** Proses otomatis mengurangi human error
4. **Skalabilitas:** Sistem dapat menangani banyak berkas secara otomatis

---

## 3. Perbandingan dengan Iterasi Sebelumnya

### 3.1 Perbedaan dengan Iterasi 1

| Aspek | Iterasi 1 | Iterasi 3 |
|-------|-----------|-----------|
| **Pengecekan Kuota** | Tidak ada | Ada (limit 80/hari) |
| **Antrian** | Tidak ada | Ada (ppat_send_queue) |
| **Proses Otomatis** | Tidak ada | Ada (cron job) |
| **Status Booking** | Langsung 'Dikirim ke LTB' | Bisa 'Pending' atau 'Diolah' |
| **Fleksibilitas** | Harus langsung dikirim | Bisa dijadwalkan |

### 3.2 Manfaat Sistem Kuotasi

1. **Kontrol Beban Kerja:** Membatasi jumlah dokumen per hari untuk menjaga kualitas
2. **Perencanaan:** PPAT dapat merencanakan pengiriman berkas
3. **Transparansi:** Semua pihak dapat melihat kuota dan antrian
4. **Otomasi:** Proses antrian berjalan otomatis tanpa intervensi manual

---

*Penjelasan ini merupakan bagian dari dokumentasi Tugas Akhir - Sistem Booking Online BAPPENDA Kabupaten Bogor*
