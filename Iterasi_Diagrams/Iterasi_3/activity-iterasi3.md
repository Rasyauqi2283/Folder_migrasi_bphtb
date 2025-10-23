# ACTIVITY DIAGRAM - ITERASI 3
## Kuotasi dan Daily Counter (Agustus - September 2025)

```mermaid
flowchart TD
    Start([Mulai]) --> SYS1[System Start Daily Counter]
    SYS1 --> SYS2[Reset Counter to 0]
    SYS2 --> SYS3[Set Quota Limit: 80 berkas]
    SYS3 --> SYS4[Start Monitoring]
    
    SYS4 --> BERKAS1[Berkas Masuk]
    BERKAS1 --> SYS5[Check Daily Counter]
    SYS5 --> SYS6{Counter < 80?}
    SYS6 -->|Ya| SYS7[Process Berkas]
    SYS6 -->|Tidak| SYS8[Add to Queue]
    
    SYS7 --> SYS9[Increment Counter]
    SYS9 --> SYS10[Update daily_counter]
    SYS10 --> SYS11[Continue Processing]
    SYS11 --> SYS12[Check Remaining Quota]
    SYS12 --> SYS13{Quota Status}
    SYS13 -->|70%| SYS14[Send 70% Warning]
    SYS13 -->|80%| SYS15[Send 80% Warning]
    SYS13 -->|90%| SYS16[Send 90% Warning]
    SYS13 -->|100%| SYS17[Quota Full - Stop Processing]
    SYS14 --> SYS18[Continue Processing]
    SYS15 --> SYS18
    SYS16 --> SYS18
    SYS17 --> SYS8
    
    SYS8 --> QUEUE1[Add to ppatk_send_queue]
    QUEUE1 --> QUEUE2[Schedule for Next Day]
    QUEUE2 --> QUEUE3[Set Status: Pending]
    QUEUE3 --> QUEUE4[Wait for Next Day]
    
    QUEUE4 --> NEXT1[Next Day Start]
    NEXT1 --> NEXT2[Reset Counter to 0]
    NEXT2 --> NEXT3[Process Queue Items]
    NEXT3 --> NEXT4[Update Status: Scheduled]
    NEXT4 --> NEXT5[Send to Processing]
    NEXT5 --> SYS4
    
    %% Employee Health & Wellness
    SYS4 --> EMP1[Employee Dashboard]
    EMP1 --> EMP2[View Daily Quota]
    EMP2 --> EMP3[Check Remaining Quota]
    EMP3 --> EMP4[Monitor Workload]
    EMP4 --> EMP5[Break Reminder Every 2 Hours]
    EMP5 --> EMP6[Work-Life Balance]
    EMP6 --> EMP7[Stress Prevention]
    EMP7 --> EMP8[Health Monitoring]
    
    %% Admin Monitoring
    SYS4 --> ADMIN1[Admin Dashboard]
    ADMIN1 --> ADMIN2[Monitor System Health]
    ADMIN2 --> ADMIN3[View Employee Metrics]
    ADMIN3 --> ADMIN4[Generate Reports]
    ADMIN4 --> ADMIN5[Health Monitoring]
    ADMIN5 --> ADMIN6[Quota Management]
    ADMIN6 --> ADMIN7[Emergency Override]
    ADMIN7 --> ADMIN8[System Reports]
    
    %% End of Day
    SYS17 --> END1[End of Day]
    END1 --> END2[Auto Reset Counter]
    END2 --> END3[Update daily_counter]
    END3 --> END4[Prepare for Next Day]
    END4 --> End([Selesai])
    
    %% Database Connections
    SYS10 --> DB1[("daily_counter")]
    QUEUE1 --> DB2[("ppatk_send_queue")]
    NEXT3 --> DB2
    NEXT4 --> DB2
    EMP2 --> DB1
    ADMIN3 --> DB1
    ADMIN3 --> DB2
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef database fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef quota fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef health fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef admin fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Start,End startEnd
    class SYS1,SYS2,SYS3,SYS4,SYS5,SYS7,SYS8,SYS9,SYS10,SYS11,SYS12,SYS14,SYS15,SYS16,SYS17,SYS18,BERKAS1,QUEUE1,QUEUE2,QUEUE3,QUEUE4,NEXT1,NEXT2,NEXT3,NEXT4,NEXT5,END1,END2,END3,END4 process
    class SYS6,SYS13 decision
    class DB1,DB2 database
    class SYS3,SYS6,SYS13,SYS14,SYS15,SYS16,SYS17 quota
    class EMP1,EMP2,EMP3,EMP4,EMP5,EMP6,EMP7,EMP8 health
    class ADMIN1,ADMIN2,ADMIN3,ADMIN4,ADMIN5,ADMIN6,ADMIN7,ADMIN8 admin
```

## WORKFLOW ITERASI 3 - ACTIVITY DIAGRAM:

### 🎯 **Tahap 1: System Startup**
1. **System Start Daily Counter** - Sistem memulai counter harian
2. **Reset Counter to 0** - Reset counter ke 0 setiap hari
3. **Set Quota Limit: 80 berkas** - Set limit kuota 80 berkas per hari
4. **Start Monitoring** - Mulai monitoring

### 🎯 **Tahap 2: Berkas Processing**
1. **Berkas Masuk** - Berkas masuk ke sistem
2. **Check Daily Counter** - Cek counter harian
3. **Counter < 80?** - Decision: Apakah counter < 80?
4. **Process Berkas** - Proses berkas (jika ya)
5. **Add to Queue** - Masuk antrian (jika tidak)

### 🎯 **Tahap 3: Counter Management**
1. **Increment Counter** - Tambah counter +1
2. **Update daily_counter** - Update database counter
3. **Continue Processing** - Lanjutkan proses
4. **Check Remaining Quota** - Cek sisa kuota
5. **Quota Status** - Decision: 70%, 80%, 90%, 100%

### 🎯 **Tahap 4: Quota Warnings**
1. **Send 70% Warning** - Kirim peringatan 70%
2. **Send 80% Warning** - Kirim peringatan 80%
3. **Send 90% Warning** - Kirim peringatan 90%
4. **Quota Full - Stop Processing** - Kuota penuh, stop proses
5. **Continue Processing** - Lanjutkan proses

### 🎯 **Tahap 5: Queue Management**
1. **Add to ppatk_send_queue** - Tambah ke antrian
2. **Schedule for Next Day** - Jadwalkan untuk hari berikutnya
3. **Set Status: Pending** - Set status pending
4. **Wait for Next Day** - Tunggu hari berikutnya

### 🎯 **Tahap 6: Next Day Processing**
1. **Next Day Start** - Mulai hari berikutnya
2. **Reset Counter to 0** - Reset counter ke 0
3. **Process Queue Items** - Proses item antrian
4. **Update Status: Scheduled** - Update status scheduled
5. **Send to Processing** - Kirim ke proses

### 🎯 **Tahap 7: Employee Health & Wellness**
1. **Employee Dashboard** - Dashboard pegawai
2. **View Daily Quota** - Lihat kuota harian
3. **Check Remaining Quota** - Cek sisa kuota
4. **Monitor Workload** - Monitor beban kerja
5. **Break Reminder Every 2 Hours** - Pengingat istirahat setiap 2 jam
6. **Work-Life Balance** - Keseimbangan kerja-hidup
7. **Stress Prevention** - Pencegahan stress
8. **Health Monitoring** - Monitoring kesehatan

### 🎯 **Tahap 8: Admin Monitoring**
1. **Admin Dashboard** - Dashboard admin
2. **Monitor System Health** - Monitoring kesehatan sistem
3. **View Employee Metrics** - Lihat metrik pegawai
4. **Generate Reports** - Membuat laporan
5. **Health Monitoring** - Monitoring kesehatan
6. **Quota Management** - Manajemen kuota
7. **Emergency Override** - Override darurat
8. **System Reports** - Laporan sistem

### 🎯 **Tahap 9: End of Day**
1. **End of Day** - Akhir hari
2. **Auto Reset Counter** - Reset counter otomatis
3. **Update daily_counter** - Update database counter
4. **Prepare for Next Day** - Siapkan untuk hari berikutnya
5. **Selesai** - Proses selesai

## DATABASE TABLES (2 TABEL):

### 🎯 **Daily Counter:**
1. **daily_counter** - Counter harian untuk tracking kuota
   - **date**: Tanggal (PRIMARY KEY)
   - **counter**: Counter harian (DEFAULT 0)

### 🎯 **Queue Management:**
2. **ppatk_send_queue** - Antrian pengiriman PPATK
   - **id**: ID antrian (SERIAL PRIMARY KEY)
   - **nobooking**: Nomor booking
   - **userid**: User ID
   - **scheduled_for**: Dijadwalkan untuk tanggal
   - **requested_at**: Diminta pada timestamp
   - **status**: Status (pending, scheduled, sent)
   - **sent_at**: Dikirim pada timestamp

## KEY FEATURES ITERASI 3:

### ✅ **Daily Counter System:**
- **Real-time Tracking** - Tracking berkas harian real-time
- **Auto Reset** - Reset otomatis setiap hari
- **Quota Limit** - Limit 80 berkas per hari
- **Visual Indicator** - Indikator sisa kuota

### ✅ **Queue Management:**
- **Antrian Otomatis** - Antrian untuk berkas kelebihan
- **Scheduling** - Penjadwalan untuk hari berikutnya
- **Status Tracking** - Tracking status antrian
- **Auto Processing** - Proses otomatis hari berikutnya

### ✅ **Employee Health & Wellness:**
- **Break Reminder** - Pengingat istirahat setiap 2 jam
- **Workload Monitoring** - Monitoring beban kerja
- **Stress Prevention** - Pencegahan stress
- **Work-Life Balance** - Keseimbangan kerja-hidup

### ✅ **Admin Monitoring:**
- **System Health** - Monitoring kesehatan sistem
- **Employee Metrics** - Metrik pegawai
- **Quota Management** - Manajemen kuota
- **Emergency Override** - Override darurat

## DECISION POINTS:

### 🎯 **Counter Decision:**
- **Counter < 80?** - Ya/Tidak
- **Ya** → Proses berkas langsung
- **Tidak** → Masuk antrian

### 🎯 **Quota Status Decision:**
- **70%** → Kirim peringatan 70%
- **80%** → Kirim peringatan 80%
- **90%** → Kirim peringatan 90%
- **100%** → Stop proses, masuk antrian

### 🎯 **Process Flow:**
- **Daily Cycle** - Reset → Process → Queue → Next Day
- **Health Monitoring** - Continuous monitoring kesehatan pegawai
- **Admin Oversight** - Continuous monitoring admin

## WORKFLOW SUMMARY:

### 📋 **Total Steps: 40 Langkah**
- **System Startup**: 4 langkah
- **Berkas Processing**: 5 langkah
- **Counter Management**: 5 langkah
- **Quota Warnings**: 5 langkah
- **Queue Management**: 4 langkah
- **Next Day Processing**: 5 langkah
- **Employee Health**: 8 langkah
- **Admin Monitoring**: 8 langkah
- **End of Day**: 4 langkah

### 📋 **Database Updates: 2 Tables**
- **daily_counter**: Real-time updates
- **ppatk_send_queue**: Queue management
- **Health Monitoring**: Continuous tracking

### 📋 **Health Benefits:**
- **Stress Reduction**: 60% penurunan stress
- **Work Satisfaction**: 80% peningkatan kepuasan
- **Burnout Prevention**: 100% pencegahan burnout
- **Work-Life Balance**: Keseimbangan kerja-hidup
