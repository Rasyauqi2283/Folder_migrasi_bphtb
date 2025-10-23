# ACTIVITY DIAGRAM - ITERASI 1 (PART 1)
## PPAT/PPATS → LTB Process (Halaman 1)

```mermaid
flowchart TD
    Start([Mulai]) --> PPAT1[PPAT/PPATS Login]
    PPAT1 --> PPAT2[Create Booking]
    PPAT2 --> PPAT3[Generate No. Booking<br/>ppatk_khusus+2025+urut]
    PPAT3 --> PPAT4[Add Manual Signature]
    PPAT4 --> PPAT5[Upload Documents<br/>Akta, Sertifikat, Pelengkap]
    PPAT5 --> PPAT6[Add Validasi Tambahan]
    PPAT6 --> PPAT7[Send to LTB]
    
    PPAT7 --> LTB1[LTB Receive from PPAT]
    LTB1 --> LTB2[Generate No. Registrasi<br/>2025+O+urut]
    LTB2 --> LTB3[Validate Documents]
    LTB3 --> LTB4{Choose Status}
    LTB4 -->|Diterima| LTB5[Send to Peneliti]
    LTB4 -->|Ditolak| LTB6[Reject Booking]
    LTB6 --> End1([Selesai - Ditolak])
    
    %% Database Connections - Part 1
    PPAT2 --> DB1[("pat_1_bookingsspd")]
    PPAT3 --> DB2[("pat_2_bphtb_perhitungan")]
    PPAT3 --> DB3[("pat_4_objek_pajak")]
    PPAT3 --> DB4[("pat_5_penghitungan_njop")]
    PPAT4 --> DB5[("pat_6_sign")]
    PPAT6 --> DB6[("pat_8_validasi_tambahan")]
    LTB2 --> DB7[("ltb_1_terima_berkas_sspd")]
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef database fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class Start,End1 startEnd
    class PPAT1,PPAT2,PPAT3,PPAT4,PPAT5,PPAT6,PPAT7,LTB1,LTB2,LTB3,LTB5,LTB6 process
    class LTB4 decision
    class DB1,DB2,DB3,DB4,DB5,DB6,DB7 database
```

## WORKFLOW PART 1 - PPAT/PPATS → LTB:

### 🎯 **PPAT/PPATS Process (7 langkah):**
1. **PPAT/PPATS Login** - Login ke sistem
2. **Create Booking** - Membuat booking baru
3. **Generate No. Booking** - Generate nomor booking (ppatk_khusus+2025+urut)
4. **Add Manual Signature** - Tambahkan tanda tangan manual
5. **Upload Documents** - Upload akta, sertifikat, dokumen pelengkap
6. **Add Validasi Tambahan** - Tambahkan validasi tambahan
7. **Send to LTB** - Kirim ke Loket Terima Berkas

### 🎯 **LTB Process (6 langkah):**
1. **LTB Receive from PPAT** - Terima dari PPAT
2. **Generate No. Registrasi** - Generate nomor registrasi (2025+O+urut)
3. **Validate Documents** - Validasi dokumen
4. **Choose Status** - Pilih status (Diterima/Ditolak)
5. **Send to Peneliti** - Kirim ke peneliti (jika diterima)
6. **Reject Booking** - Tolak booking (jika ditolak)

## DATABASE TABLES - PART 1 (7 TABEL):

### 🎯 **Booking Tables:**
1. **pat_1_bookingsspd** - Data booking utama
2. **pat_2_bphtb_perhitungan** - Perhitungan BPHTB
3. **pat_4_objek_pajak** - Data objek pajak
4. **pat_5_penghitungan_njop** - Perhitungan NJOP
5. **pat_6_sign** - Tanda tangan PPAT dan WP
6. **pat_8_validasi_tambahan** - Validasi tambahan

### 🎯 **Process Tables:**
7. **ltb_1_terima_berkas_sspd** - Penerimaan berkas LTB

## KEY FEATURES - PART 1:

### ✅ **PPAT Features:**
- **Manual Signature** - Tanda tangan manual PPAT
- **Document Upload** - Upload dokumen lengkap
- **Validation** - Validasi tambahan
- **Booking Generation** - Generate nomor booking

### ✅ **LTB Features:**
- **Document Validation** - Validasi dokumen
- **Status Decision** - Pilih diterima/ditolak
- **Registration** - Generate nomor registrasi
- **Process Control** - Kontrol proses

### ✅ **Database Integration:**
- **7 Database Tables** - Terintegrasi dengan proses
- **Real-time Updates** - Update database di setiap tahap
- **Status Management** - Management status booking

## WORKFLOW SUMMARY - PART 1:

### 📋 **Total Steps: 13 Langkah**
- **PPAT Process**: 7 langkah
- **LTB Process**: 6 langkah (termasuk decision)
- **Database Updates**: 7 tables
- **Decision Point**: 1 (Diterima/Ditolak)

### 📋 **Process Flow:**
- **Sequential**: PPAT → LTB
- **Decision**: LTB memilih Diterima/Ditolak
- **Database**: 7 tables terintegrasi
- **End Points**: 2 (Selesai - Ditolak, Lanjut ke Part 2)
