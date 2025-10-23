# ACTIVITY DIAGRAM - ITERASI 1 (PART 2)
## Peneliti → Clear to Paraf Process (Halaman 2)

```mermaid
flowchart TD
    Start([Lanjut dari Part 1]) --> PEN1[Peneliti Receive from LTB]
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
    
    CTP4 --> End1([Lanjut ke Part 3])
    
    %% Database Connections - Part 2
    PEN5 --> DB1[("p_2_verif_sign")]
    PEN6 --> DB2[("p_1_verifikasi")]
    CTP3 --> DB3[("p_3_clear_to_paraf")]
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class Start,End1 startEnd
    class PEN1,PEN2,PEN3,PEN4,PEN5,PEN6,PEN7,CTP1,CTP2,CTP3,CTP4 process
    class DB1,DB2,DB3 database
```

## WORKFLOW PART 2 - PENELITI → CLEAR TO PARAF:

### 🎯 **Peneliti Process (7 langkah):**
1. **Peneliti Receive from LTB** - Terima dari LTB
2. **Verify Documents** - Verifikasi dokumen
3. **Add Manual Signature** - Tambahkan tanda tangan manual
4. **Drop Gambar Tanda Tangan** - Drop gambar tanda tangan
5. **Update p_2_verif_sign** - Update database tanda tangan
6. **Update p_1_verifikasi** - Update database verifikasi
7. **Send to Clear to Paraf** - Kirim ke Clear to Paraf

### 🎯 **Clear to Paraf Process (4 langkah):**
1. **Clear to Paraf Receive** - Terima dari peneliti
2. **Give Paraf and Stempel** - Berikan paraf dan stempel
3. **Update p_3_clear_to_paraf** - Update database clear to paraf
4. **Send to Peneliti Validasi** - Kirim ke peneliti validasi

## DATABASE TABLES - PART 2 (3 TABEL):

### 🎯 **Process Tables:**
1. **p_2_verif_sign** - Tanda tangan peneliti
2. **p_1_verifikasi** - Verifikasi peneliti
3. **p_3_clear_to_paraf** - Clear to paraf

## KEY FEATURES - PART 2:

### ✅ **Peneliti Features:**
- **Document Verification** - Verifikasi dokumen
- **Manual Signature** - Tanda tangan manual
- **Drop Gambar** - Drop gambar tanda tangan
- **Database Updates** - Update 2 database tables

### ✅ **Clear to Paraf Features:**
- **Paraf and Stempel** - Berikan paraf dan stempel
- **Database Update** - Update p_3_clear_to_paraf
- **Process Continuation** - Lanjut ke peneliti validasi

### ✅ **Database Integration:**
- **3 Database Tables** - Terintegrasi dengan proses
- **Real-time Updates** - Update database di setiap tahap
- **Status Management** - Management status verifikasi

## WORKFLOW SUMMARY - PART 2:

### 📋 **Total Steps: 11 Langkah**
- **Peneliti Process**: 7 langkah
- **Clear to Paraf Process**: 4 langkah
- **Database Updates**: 3 tables
- **No Decision Points** - Sequential flow

### 📋 **Process Flow:**
- **Sequential**: Peneliti → Clear to Paraf
- **Manual Processes** - Tanda tangan manual di setiap tahap
- **Database** - 3 tables terintegrasi
- **Continuation** - Lanjut ke Part 3

### 📋 **Manual Signature Process:**
- **Peneliti** - Drop gambar tanda tangan
- **Clear to Paraf** - Paraf dan stempel manual
- **Database Updates** - Update database di setiap tahap
- **Process Control** - Kontrol proses verifikasi
