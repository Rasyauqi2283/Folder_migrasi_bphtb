# Analisis Sistem Kuotasi Booking dengan Rate Limiting

## 📋 Masalah yang Dihadapi

### Karakteristik Sistem:
1. **Format Kode Booking**: `tahun-O-urutan` (contoh: `2025-O-000001`)
2. **Urutan Kontinyu**: Tidak reset per hari, lanjut terus dari hari kemarin → hari ini → besok
3. **Kuotasi Harian**: Misal 80 booking per hari
4. **Masalah**: 
   - Hari ini penuh (80 booking tercapai)
   - Besok pagi ada 50 antrian yang langsung masuk saat jadwal berubah
   - Server bisa down karena beban tinggi (spike traffic)

### Skenario Masalah:
```
Hari ini (2025-01-15):
- Booking 1-80: ✅ Terpenuhi
- Status: KUOTA PENUH

Besok pagi (2025-01-16, 00:00:01):
- 50 user langsung klik "Booking" bersamaan
- Semua request masuk ke server dalam waktu bersamaan
- Server overload → Down
```

## 🎯 Solusi yang Diinginkan

**Jeda pengiriman (throttling/rate limiting)** ketika jadwal hari esok berubah menjadi hari ini, sehingga:
- Request tidak masuk bersamaan
- Server tidak overload
- User tetap bisa booking dengan antrian yang teratur

---

## 💡 Pendekatan Solusi

### **Pendekatan 1: Time-Based Rate Limiting dengan Queue**

#### Konsep:
- Saat hari baru dimulai (00:00), aktifkan rate limiting
- Request masuk ke queue, diproses secara bertahap
- Misal: 1 booking per 2 detik = 30 booking/menit = 1800 booking/jam

#### Implementasi:

```javascript
// Backend: Queue Manager
class BookingQueueManager {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.rateLimit = 2000; // 2 detik per booking
        this.dailyQuota = 80;
        this.currentDate = new Date().toDateString();
    }

    // Check apakah hari baru
    isNewDay() {
        const today = new Date().toDateString();
        if (today !== this.currentDate) {
            this.currentDate = today;
            return true;
        }
        return false;
    }

    // Add booking ke queue
    async addToQueue(bookingData) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                data: bookingData,
                resolve,
                reject,
                timestamp: Date.now()
            });

            // Start processing jika belum
            if (!this.processing) {
                this.startProcessing();
            }
        });
    }

    // Process queue dengan rate limiting
    async startProcessing() {
        this.processing = true;

        while (this.queue.length > 0) {
            const item = this.queue.shift();

            try {
                // Process booking
                const result = await this.processBooking(item.data);
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }

            // Rate limiting: tunggu sebelum process berikutnya
            await this.sleep(this.rateLimit);
        }

        this.processing = false;
    }

    async processBooking(data) {
        // Logic untuk create booking
        // Check kuota, generate kode, dll
        return await createBooking(data);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

#### Kelebihan:
- ✅ Mencegah spike traffic
- ✅ Server tidak overload
- ✅ User tetap bisa submit (masuk queue)

#### Kekurangan:
- ⚠️ User harus menunggu (bisa lama jika antrian banyak)
- ⚠️ Perlu feedback ke user tentang posisi antrian

---

### **Pendekatan 2: Distributed Rate Limiting dengan Redis**

#### Konsep:
- Gunakan Redis untuk distributed rate limiting
- Sliding window atau token bucket algorithm
- Multiple server bisa share rate limit

#### Implementasi:

```javascript
// Backend: Redis-based Rate Limiter
const redis = require('redis');
const client = redis.createClient();

class RedisRateLimiter {
    constructor(dailyQuota = 80) {
        this.dailyQuota = dailyQuota;
        this.windowSize = 24 * 60 * 60 * 1000; // 24 jam dalam ms
    }

    // Check dan increment counter
    async checkAndIncrement(userId, dateKey) {
        const key = `booking:quota:${dateKey}`;
        
        // Get current count
        const current = await client.get(key) || 0;
        
        if (parseInt(current) >= this.dailyQuota) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: this.getResetTime(dateKey)
            };
        }

        // Increment counter
        const newCount = await client.incr(key);
        
        // Set expiry (reset besok)
        if (newCount === 1) {
            await client.expire(key, this.windowSize / 1000);
        }

        return {
            allowed: true,
            remaining: this.dailyQuota - newCount,
            resetTime: this.getResetTime(dateKey)
        };
    }

    // Rate limiting per detik (untuk throttle)
    async checkRateLimit(userId) {
        const key = `booking:rate:${userId}:${Date.now()}`;
        const count = await client.incr(key);
        
        if (count === 1) {
            await client.expire(key, 1); // 1 detik
        }

        // Max 1 request per 2 detik per user
        return count <= 1;
    }

    getResetTime(dateKey) {
        const tomorrow = new Date(dateKey);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }
}
```

#### Kelebihan:
- ✅ Distributed (bisa dipakai multiple server)
- ✅ Accurate (tidak ada race condition)
- ✅ Scalable

#### Kekurangan:
- ⚠️ Perlu Redis infrastructure
- ⚠️ Tambahan dependency

---

### **Pendekatan 3: Gradual Release dengan Time Windows**

#### Konsep:
- Bagi waktu dalam window-window kecil
- Release kuota secara bertahap per window
- Contoh: 80 booking/hari = 10 booking per 3 jam

#### Implementasi:

```javascript
class GradualQuotaRelease {
    constructor(dailyQuota = 80) {
        this.dailyQuota = dailyQuota;
        this.windows = [
            { start: 0, end: 3, quota: 10 },   // 00:00 - 03:00
            { start: 3, end: 6, quota: 10 },   // 03:00 - 06:00
            { start: 6, end: 9, quota: 10 },   // 06:00 - 09:00
            { start: 9, end: 12, quota: 10 },  // 09:00 - 12:00
            { start: 12, end: 15, quota: 10 }, // 12:00 - 15:00
            { start: 15, end: 18, quota: 10 }, // 15:00 - 18:00
            { start: 18, end: 21, quota: 10 }, // 18:00 - 21:00
            { start: 21, end: 24, quota: 10 }  // 21:00 - 24:00
        ];
    }

    getCurrentWindow() {
        const now = new Date();
        const hour = now.getHours();

        return this.windows.find(w => hour >= w.start && hour < w.end);
    }

    async checkQuota(dateKey) {
        const window = this.getCurrentWindow();
        if (!window) {
            return { allowed: false, reason: 'Outside booking hours' };
        }

        const key = `booking:window:${dateKey}:${window.start}-${window.end}`;
        const current = await client.get(key) || 0;

        if (parseInt(current) >= window.quota) {
            // Check next window
            const nextWindow = this.getNextWindow();
            return {
                allowed: false,
                reason: 'Window quota full',
                nextWindow: nextWindow,
                waitTime: this.getWaitTime(nextWindow)
            };
        }

        await client.incr(key);
        if (parseInt(current) === 0) {
            await client.expire(key, (window.end - window.start) * 3600);
        }

        return { allowed: true, remaining: window.quota - parseInt(current) - 1 };
    }

    getNextWindow() {
        const now = new Date();
        const hour = now.getHours();
        const currentIndex = this.windows.findIndex(w => hour >= w.start && hour < w.end);
        
        if (currentIndex === -1 || currentIndex === this.windows.length - 1) {
            return this.windows[0]; // Next day first window
        }
        
        return this.windows[currentIndex + 1];
    }

    getWaitTime(window) {
        const now = new Date();
        const targetHour = window.start;
        const targetTime = new Date(now);
        targetTime.setHours(targetHour, 0, 0, 0);
        
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        return targetTime.getTime() - now.getTime();
    }
}
```

#### Kelebihan:
- ✅ Smooth distribution sepanjang hari
- ✅ Tidak ada spike di pagi hari
- ✅ Predictable untuk user

#### Kekurangan:
- ⚠️ User harus menunggu window berikutnya
- ⚠️ Perlu komunikasi jelas ke user

---

### **Pendekatan 4: Pre-booking dengan Reservation Slot**

#### Konsep:
- User bisa "reserve" slot untuk hari besok
- Saat hari baru dimulai, slot yang sudah di-reserve diproses secara bertahap
- User yang tidak reserve harus menunggu

#### Implementasi:

```javascript
class PreBookingSystem {
    constructor() {
        this.reservationSlots = new Map(); // date -> [userIds]
        this.processingRate = 2000; // 2 detik per booking
    }

    // User reserve slot untuk besok
    async reserveSlot(userId, targetDate) {
        const dateKey = targetDate.toDateString();
        
        if (!this.reservationSlots.has(dateKey)) {
            this.reservationSlots.set(dateKey, []);
        }

        const slots = this.reservationSlots.get(dateKey);
        
        if (slots.length >= 80) {
            return { success: false, message: 'Slot penuh' };
        }

        slots.push({
            userId,
            reservedAt: Date.now(),
            priority: slots.length + 1
        });

        return { 
            success: true, 
            position: slots.length,
            estimatedTime: this.estimateProcessingTime(slots.length)
        };
    }

    // Process reserved slots saat hari baru
    async processReservedSlots(dateKey) {
        const slots = this.reservationSlots.get(dateKey) || [];
        
        for (const slot of slots) {
            try {
                await this.processBooking(slot.userId);
            } catch (error) {
                console.error(`Failed to process slot for ${slot.userId}:`, error);
            }

            // Rate limiting
            await this.sleep(this.processingRate);
        }

        // Clear processed slots
        this.reservationSlots.delete(dateKey);
    }

    estimateProcessingTime(position) {
        // Position 1 = 2 detik, Position 50 = 100 detik
        return position * (this.processingRate / 1000);
    }
}
```

#### Kelebihan:
- ✅ User tahu posisi mereka
- ✅ Tidak ada surprise di pagi hari
- ✅ Fair (first come first served)

#### Kekurangan:
- ⚠️ Perlu sistem reservation
- ⚠️ User harus reserve dulu

---

## 🔄 Hybrid Approach (Rekomendasi)

### Kombinasi beberapa pendekatan:

1. **Gradual Release** untuk distribusi sepanjang hari
2. **Queue System** untuk handle spike di pagi hari
3. **Rate Limiting** per user untuk prevent abuse
4. **Pre-booking** untuk user yang mau booking besok

```javascript
class HybridQuotaSystem {
    constructor() {
        this.gradualRelease = new GradualQuotaRelease(80);
        this.queue = new BookingQueueManager();
        this.rateLimiter = new RedisRateLimiter(80);
        this.preBooking = new PreBookingSystem();
    }

    async handleBookingRequest(userId, bookingData) {
        // 1. Check rate limit per user
        const rateLimitOk = await this.rateLimiter.checkRateLimit(userId);
        if (!rateLimitOk) {
            return {
                success: false,
                message: 'Terlalu banyak request. Tunggu sebentar.',
                retryAfter: 2000
            };
        }

        // 2. Check gradual quota
        const quotaCheck = await this.gradualRelease.checkQuota(new Date().toDateString());
        
        if (!quotaCheck.allowed) {
            // Masukkan ke queue atau suggest pre-booking
            if (quotaCheck.nextWindow) {
                return {
                    success: false,
                    message: 'Kuota window ini penuh',
                    suggestion: 'pre-booking',
                    nextWindow: quotaCheck.nextWindow,
                    waitTime: quotaCheck.waitTime
                };
            }
        }

        // 3. Process booking (langsung atau via queue)
        if (this.queue.queue.length > 10) {
            // Queue panjang, masukkan ke queue
            return await this.queue.addToQueue(bookingData);
        } else {
            // Process langsung
            return await this.processBooking(bookingData);
        }
    }
}
```

---

## 📊 Perbandingan Pendekatan

| Pendekatan | Complexity | User Experience | Server Load | Scalability |
|------------|-----------|-----------------|-------------|-------------|
| **Queue System** | Medium | ⭐⭐⭐ (harus tunggu) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Redis Rate Limiting** | High | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gradual Release** | Medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Pre-booking** | High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Hybrid** | Very High | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Rekomendasi Implementasi

### **Fase 1: Quick Win (Implementasi Cepat)**
1. **Queue System** dengan rate limiting sederhana
2. Frontend: Show "Sedang memproses..." dengan progress
3. Backend: Process 1 booking per 2-3 detik

### **Fase 2: Optimization (Jangka Menengah)**
1. **Gradual Release** dengan 8 window per hari
2. Redis untuk distributed rate limiting
3. Better user feedback (posisi antrian, estimasi waktu)

### **Fase 3: Advanced (Jangka Panjang)**
1. **Pre-booking system** untuk hari besok
2. **Hybrid approach** dengan semua fitur
3. Analytics dan monitoring

---

## 🔧 Database Schema untuk Support

```sql
-- Tabel untuk tracking kuota harian
CREATE TABLE booking_quota_daily (
    date_key DATE PRIMARY KEY,
    quota_total INT DEFAULT 80,
    quota_used INT DEFAULT 0,
    quota_remaining INT GENERATED ALWAYS AS (quota_total - quota_used) STORED,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk queue booking
CREATE TABLE booking_queue (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    booking_data JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    priority INT DEFAULT 0,
    position INT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Index untuk performance
CREATE INDEX idx_booking_queue_status ON booking_queue(status, created_at);
CREATE INDEX idx_booking_queue_user ON booking_queue(user_id, created_at);
```

---

## 📝 Next Steps

1. **Pilih pendekatan** yang sesuai dengan kebutuhan
2. **Prototype** dengan pendekatan sederhana dulu (Queue System)
3. **Test** dengan load testing
4. **Iterate** berdasarkan feedback dan monitoring
5. **Scale** dengan pendekatan yang lebih advanced

---

## 🤔 Diskusi Terbuka

**Pertanyaan untuk diskusi:**
1. Berapa banyak user yang biasanya booking di pagi hari?
2. Apakah acceptable untuk user menunggu beberapa detik?
3. Apakah ada budget untuk Redis infrastructure?
4. Apakah perlu pre-booking system atau cukup queue?
5. Berapa tolerance untuk server load?

**Mari diskusikan pendekatan mana yang paling sesuai dengan kebutuhan Anda!** 🚀

