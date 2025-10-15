# 📊 Sistem Booking dengan Akumulasi Global

## 🎯 Konsep Utama

Sistem ini menggunakan **akumulasi global** untuk penomoran booking, bukan per tanggal terpisah. Setiap nomor booking mencerminkan total akumulasi dari semua booking yang pernah dibuat sejak awal sistem.

## 📈 Contoh Skenario

### Data Booking Sebelumnya:
- **15 Okt 2025:** 30 booking → `2025O00001 - 2025O00030`
- **16 Okt 2025:** 28 booking → `2025O00031 - 2025O00058` 
- **17 Okt 2025:** 40 booking → `2025O00059 - 2025O00098`
- **18 Okt 2025:** 0 booking
- **19 Okt 2025:** 18 booking → `2025O00099 - 2025O00116`

### User A Booking untuk 19 Okt:
- **Total Previous:** 30 + 28 + 40 + 0 = 98
- **Daily Sequence:** 18 (urutan ke-18 di tanggal 19 Okt)
- **Global Sequence:** 98 + 18 + 1 = 117
- **Booking Number:** `2025O00117` ✅

## 🔧 Formula Akumulasi

```javascript
totalPreviousBookings = Σ(booking_hari_1 + hari_2 + hari_3 + ... + hari_sebelumnya)
globalSequence = totalPreviousBookings + dailySequence
bookingNumber = YEAR + 'O' + padLeft(globalSequence, 5)
```

## 📊 Struktur Database

### 1. Tabel Tracking Global
```sql
CREATE TABLE booking_global_tracking (
    id SERIAL PRIMARY KEY,
    target_date DATE NOT NULL,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    global_sequence INTEGER NOT NULL,
    daily_sequence INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tabel Kuota Harian
```sql
CREATE TABLE daily_quota_tracking (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_bookings INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 80,
    first_booking_number VARCHAR(50),
    last_booking_number VARCHAR(50),
    is_quota_full BOOLEAN DEFAULT FALSE
);
```

## 🚀 Cara Penggunaan

### 1. Generate Booking Number
```javascript
import { generateGlobalBookingNumber } from './booking_global_accumulation_system.js';

const targetDate = new Date('2025-10-19');
const userId = 'USER-A';

const result = await generateGlobalBookingNumber(targetDate, userId);
console.log(result);
// Output:
// {
//   bookingNumber: '2025O00117',
//   globalSequence: 117,
//   dailySequence: 18,
//   totalPreviousBookings: 98,
//   dailyBookings: 17,
//   remainingQuota: 62
// }
```

### 2. Cek Kuota
```javascript
import { checkGlobalQuota } from './booking_global_accumulation_system.js';

const quotaStatus = await checkGlobalQuota(targetDate);
console.log(quotaStatus);
// Output:
// {
//   date: '2025-10-19',
//   dailyBookings: 17,
//   totalPrevious: 98,
//   remainingDailyQuota: 63,
//   nextGlobalSequence: 117,
//   isQuotaFull: false
// }
```

### 3. Statistik Booking
```javascript
const stats = await globalBookingSystem.getBookingStatistics('2025-10-15', '2025-10-19');
console.log(stats);
// Output:
// [
//   { date: '2025-10-15', daily_count: 30, cumulative_count: 30 },
//   { date: '2025-10-16', daily_count: 28, cumulative_count: 58 },
//   { date: '2025-10-17', daily_count: 40, cumulative_count: 98 },
//   { date: '2025-10-18', daily_count: 0, cumulative_count: 98 },
//   { date: '2025-10-19', daily_count: 18, cumulative_count: 116 }
// ]
```

## 🔍 Monitoring dan Views

### 1. View Monitoring Global
```sql
SELECT * FROM v_global_booking_monitoring 
WHERE booking_date >= '2025-10-15' 
ORDER BY booking_date DESC;
```

### 2. View Summary Global
```sql
SELECT * FROM v_global_booking_summary 
WHERE year = 2025;
```

### 3. Function Statistik Per Tanggal
```sql
SELECT * FROM get_booking_stats_by_date_range('2025-10-15', '2025-10-19');
```

## ⚡ Keunggulan Sistem

### ✅ **Akumulasi Global**
- Setiap nomor booking unik dan berurutan
- Mudah tracking total booking sistem
- Tidak ada konflik nomor antar tanggal

### ✅ **Kuota Harian**
- Batas 80 booking per hari
- Monitoring real-time kuota tersisa
- Validasi otomatis sebelum booking

### ✅ **Prioritas Berdasarkan Tanggal**
- Booking hari ini = prioritas tinggi
- Booking masa depan = prioritas normal
- Booking masa lalu = ditolak

### ✅ **Monitoring Lengkap**
- Statistik harian dan global
- Tracking akumulasi real-time
- Alert kuota penuh

## 🧪 Testing

### Jalankan Test Script
```bash
node test_global_accumulation_system.js
```

### Test Scenario
1. **Simulasi Data Sebelumnya:** 30+28+40+0 = 98 booking
2. **Booking Hari Ini:** 18 booking
3. **User A Booking:** Harus dapat `2025O00117`
4. **Validasi Kuota:** Sisa 62 slot
5. **Test Quota Full:** Hingga 80 booking

## 🔧 Konfigurasi

### Environment Variables
```javascript
const config = {
    dailyLimit: 80,           // Kuota harian
    systemStartYear: 2025,    // Tahun awal sistem
    maxAdvanceDays: 30,       // Maksimal booking ke depan
    minAdvanceDays: 0         // Minimal booking (hari ini)
};
```

## 📋 Checklist Implementasi

- [ ] Buat tabel database dengan script SQL
- [ ] Import sistem ke aplikasi utama
- [ ] Update endpoint booking untuk menggunakan sistem baru
- [ ] Update frontend untuk menampilkan kuota real-time
- [ ] Test dengan data real
- [ ] Deploy ke production
- [ ] Monitor performa dan error

## 🚨 Catatan Penting

1. **Backup Database** sebelum implementasi
2. **Test dengan data real** sebelum production
3. **Monitor performa** query dengan index yang tepat
4. **Validasi tanggal** untuk mencegah booking masa lalu
5. **Handle error** dengan graceful fallback

## 📞 Support

Jika ada pertanyaan atau error, silakan:
1. Cek log error di console
2. Validasi data input
3. Cek koneksi database
4. Test dengan script testing

---

**Sistem ini memastikan setiap booking mendapat nomor unik dengan akumulasi global yang konsisten! 🎯**
