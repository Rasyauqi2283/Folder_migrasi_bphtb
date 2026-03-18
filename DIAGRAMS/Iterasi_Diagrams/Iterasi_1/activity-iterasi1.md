# ACTIVITY DIAGRAM - ITERASI 1
## Pembuatan Booking hingga Pengiriman (November 2024 - Januari 2025)

```mermaid
flowchart TD
    Start([Mulai]) --> PPAT1[PPAT/PPATS Login]
    PPAT1 --> PPAT2[Create Booking]
    PPAT2 --> PPAT3[Generate No. Booking<br/>ppat_khusus+2025+urut]
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
    
    LTB5 --> PEN1[Peneliti Receive from LTB]
    PEN1 --> PEN2[Verify Documents]
    PEN2 --> PEN3[Add Manual Signature]
    PEN3 --> PEN4[Drop Gambar Tanda Tangan]
    PEN4 --> PEN5[Update p_2_verif_sign]
    PEN5 --> PEN6[Update p_1_verifikasi]
    PEN6 --> PEN7[Send to Clear to Paraf]
    
    PEN7 --> CTP1[Clear to Paraf Receive]
    CTP1 --> CTP2[Give Paraf and Stempel]
    CTP2 --> CTP3[Update p_3_clear_to_paraf]
    CTP3 --> CTP4[Send to Peneliti Validasi]
    
    CTP4 --> PV1[Peneliti Validasi Receive]
    PV1 --> PV2[Final Validation]
    PV2 --> PV3[Manual Signature]
    PV3 --> PV4[Drop Gambar Tanda Tangan]
    PV4 --> PV5[Update pv_1_paraf_validate]
    PV5 --> PV6[Send to LSB]
    
    PV6 --> LSB1[LSB Receive from PV]
    LSB1 --> LSB2[Manual Handover]
    LSB2 --> LSB3[Update lsb_1_serah_berkas]
    LSB3 --> LSB4[Update pat_1_bookingsspd]
    LSB4 --> End2([Selesai - Berhasil])
    
    %% Database Connections
    PPAT2 --> DB1[("pat_1_bookingsspd")]
    PPAT3 --> DB2[("pat_2_bphtb_perhitungan")]
    PPAT3 --> DB3[("pat_4_objek_pajak")]
    PPAT3 --> DB4[("pat_5_penghitungan_njop")]
    PPAT4 --> DB5[("pat_6_sign")]
    PPAT6 --> DB6[("pat_8_validasi_tambahan")]
    LTB2 --> DB7[("ltb_1_terima_berkas_sspd")]
    PEN5 --> DB8[("p_2_verif_sign")]
    PEN6 --> DB9[("p_1_verifikasi")]
    CTP3 --> DB10[("p_3_clear_to_paraf")]
    PV5 --> DB11[("pv_1_paraf_validate")]
    LSB3 --> DB12[("lsb_1_serah_berkas")]
    LSB4 --> DB1
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef database fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class Start,End1,End2 startEnd
    class PPAT1,PPAT2,PPAT3,PPAT4,PPAT5,PPAT6,PPAT7,LTB1,LTB2,LTB3,LTB5,LTB6,PEN1,PEN2,PEN3,PEN4,PEN5,PEN6,PEN7,CTP1,CTP2,CTP3,CTP4,PV1,PV2,PV3,PV4,PV5,PV6,LSB1,LSB2,LSB3,LSB4 process
    class LTB4 decision
    class DB1,DB2,DB3,DB4,DB5,DB6,DB7,DB8,DB9,DB10,DB11,DB12 database
```

## WORKFLOW ITERASI 1 - ACTIVITY DIAGRAM:

### 🎯 **Tahap 1: PPAT/PPATS Process**
1. **PPAT/PPATS Login** - Login ke sistem
2. **Create Booking** - Membuat booking baru
3. **Generate No. Booking** - Generate nomor booking (ppat_khusus+2025+urut)
4. **Add Manual Signature** - Tambahkan tanda tangan manual
5. **Upload Documents** - Upload akta, sertifikat, dokumen pelengkap
6. **Add Validasi Tambahan** - Tambahkan validasi tambahan
7. **Send to LTB** - Kirim ke Loket Terima Berkas

### 🎯 **Tahap 2: LTB Process**
1. **LTB Receive from PPAT** - Terima dari PPAT
2. **Generate No. Registrasi** - Generate nomor registrasi (2025+O+urut)
3. **Validate Documents** - Validasi dokumen
4. **Choose Status** - Pilih status (Diterima/Ditolak)
5. **Send to Peneliti** - Kirim ke peneliti (jika diterima)
6. **Reject Booking** - Tolak booking (jika ditolak)

### 🎯 **Tahap 3: Peneliti Process**
1. **Peneliti Receive from LTB** - Terima dari LTB
2. **Verify Documents** - Verifikasi dokumen
3. **Add Manual Signature** - Tambahkan tanda tangan manual
4. **Drop Gambar Tanda Tangan** - Drop gambar tanda tangan
5. **Update p_2_verif_sign** - Update database tanda tangan
6. **Update p_1_verifikasi** - Update database verifikasi
7. **Send to Clear to Paraf** - Kirim ke Clear to Paraf

### 🎯 **Tahap 4: Clear to Paraf Process**
1. **Clear to Paraf Receive** - Terima dari peneliti
2. **Give Paraf and Stempel** - Berikan paraf dan stempel
3. **Update p_3_clear_to_paraf** - Update database clear to paraf
4. **Send to Peneliti Validasi** - Kirim ke peneliti validasi

### 🎯 **Tahap 5: Peneliti Validasi Process**
1. **Peneliti Validasi Receive** - Terima dari Clear to Paraf
2. **Final Validation** - Validasi akhir
3. **Manual Signature** - Tanda tangan manual
4. **Drop Gambar Tanda Tangan** - Drop gambar tanda tangan
5. **Update pv_1_paraf_validate** - Update database validasi
6. **Send to LSB** - Kirim ke Loket Serah Berkas

### 🎯 **Tahap 6: LSB Process**
1. **LSB Receive from PV** - Terima dari peneliti validasi
2. **Manual Handover** - Serah terima manual
3. **Update lsb_1_serah_berkas** - Update database serah berkas
4. **Update pat_1_bookingsspd** - Update status booking utama
5. **Selesai - Berhasil** - Proses selesai

## DATABASE TABLES (12 TABEL):

### 🎯 **Booking Tables:**
1. **pat_1_bookingsspd** - Data booking utama
2. **pat_2_bphtb_perhitungan** - Perhitungan BPHTB
3. **pat_4_objek_pajak** - Data objek pajak
4. **pat_5_penghitungan_njop** - Perhitungan NJOP
5. **pat_6_sign** - Tanda tangan PPAT dan WP
6. **pat_8_validasi_tambahan** - Validasi tambahan

### 🎯 **Process Tables:**
7. **ltb_1_terima_berkas_sspd** - Penerimaan berkas LTB
8. **p_2_verif_sign** - Tanda tangan peneliti
9. **p_1_verifikasi** - Verifikasi peneliti
10. **p_3_clear_to_paraf** - Clear to paraf
11. **pv_1_paraf_validate** - Validasi peneliti validasi
12. **lsb_1_serah_berkas** - Serah berkas LSB

## DECISION POINTS:

### 🎯 **LTB Decision:**
- **Diterima** → Lanjut ke Peneliti
- **Ditolak** → Proses selesai (ditolak)

### 🎯 **Process Flow:**
- **Sequential** - PPAT → LTB → Peneliti → Clear to Paraf → Peneliti Validasi → LSB
- **Database Updates** - Setiap tahap update database yang sesuai
- **Manual Processes** - Tanda tangan manual di setiap tahap

## KEY FEATURES:

### ✅ **Manual Signature Process:**
- **PPAT** - Tanda tangan manual
- **Peneliti** - Drop gambar tanda tangan
- **Peneliti Validasi** - Drop gambar tanda tangan
- **Clear to Paraf** - Paraf dan stempel

### ✅ **Document Management:**
- **Upload Documents** - Akta, sertifikat, pelengkap
- **Validation** - Validasi dokumen di setiap tahap
- **Status Tracking** - Tracking status di setiap tahap

### ✅ **Database Integration:**
- **12 Database Tables** - Terintegrasi dengan proses
- **Real-time Updates** - Update database di setiap tahap
- **Status Management** - Management status booking

## WORKFLOW SUMMARY:

### 📋 **Total Steps: 24 Langkah**
- **PPAT Process**: 7 langkah
- **LTB Process**: 6 langkah (termasuk decision)
- **Peneliti Process**: 7 langkah
- **Clear to Paraf**: 4 langkah
- **Peneliti Validasi**: 6 langkah
- **LSB Process**: 5 langkah

### 📋 **Database Updates: 12 Tables**
- **Booking Tables**: 6 tables
- **Process Tables**: 6 tables
- **Real-time Integration**: Setiap tahap

### 📋 **Manual Processes: 4 Manual Steps**
- **Manual Signature**: PPAT, Peneliti, Peneliti Validasi
- **Manual Handover**: LSB
- **Drop Gambar**: Peneliti dan Peneliti Validasi
