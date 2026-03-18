# 🔧 JAWABAN TEKNIS: "Form Booking Ini Untuk Apa?" - Untuk Dosen Teknik

## 🎯 KONTEKS

Dosen dari jurusan Teknologi Rekayasa Perangkat Lunak meminta penjelasan teknis mendalam tentang form booking dalam sistem E-BPHTB.

---

## 📋 PENJELASAN TEKNIS KOMPREHENSIF

### **1. DEFINISI DAN KONTEKS SISTEM**

**Form Booking** adalah komponen utama dalam sistem **E-BPHTB (Elektronik Bea Perolehan Hak atas Tanah dan Bangunan)** yang dikembangkan untuk BAPPENDA Kabupaten Bogor. Sistem ini merupakan **workflow management system** berbasis web untuk mengelola administrasi pajak BPHTB secara digital.

**BPHTB** adalah pajak daerah yang dikenakan atas perolehan hak atas tanah dan/atau bangunan, diatur dalam UU No. 28 Tahun 2009. Proses administrasinya melibatkan:
- **Wajib Pajak** (pembeli tanah/bangunan)
- **PPAT/PPATS** (Pejabat Pembuat Akta Tanah - notaris)
- **BAPPENDA** dengan divisi: LTB, Bank, Peneliti, Peneliti Validasi, LSB

---

### **2. ARSITEKTUR SISTEM**

#### **2.1 Technology Stack**

**Backend:**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (MVC pattern)
- **Database:** PostgreSQL (relational database)
- **Session Management:** express-session dengan cookie-based authentication
- **File Storage:** Local filesystem dengan struktur folder terorganisir

**Frontend:**
- **HTML5** dengan semantic markup
- **CSS3** dengan custom framework untuk BAPPENDA
- **JavaScript (ES6+)** dengan Vite.js untuk bundling
- **AJAX/Fetch API** untuk komunikasi dengan backend

**Deployment:**
- **Platform:** Railway (cloud hosting)
- **Database:** PostgreSQL managed service
- **File Storage:** Persistent volume di Railway

#### **2.2 Arsitektur Aplikasi**

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   PPAT/PPATS │  │     LTB     │  │   Peneliti   │   │
│  │   Dashboard  │  │  Dashboard  │  │  Dashboard   │   │
│  └──────┬───────┘  └──────┬──────┘  └──────┬───────┘   │
│         │                 │                 │            │
│         └─────────────────┼─────────────────┘            │
│                           │                              │
└───────────────────────────┼────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API GATEWAY   │
                    │  (Express.js)  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│  CONTROLLER    │  │   MIDDLEWARE   │  │   VALIDATION   │
│   LAYER        │  │   (Auth, Log)  │  │     LAYER      │
└───────┬────────┘  └────────────────┘  └────────────────┘
        │
┌───────▼────────┐
│   SERVICE      │
│   LAYER        │
│  (Business     │
│   Logic)       │
└───────┬────────┘
        │
┌───────▼────────┐
│   DATA ACCESS  │
│   LAYER        │
│  (PostgreSQL   │
│   Queries)     │
└───────┬────────┘
        │
┌───────▼────────┐
│   DATABASE     │
│  (PostgreSQL)  │
└────────────────┘
```

---

### **3. FORM BOOKING: KOMPONEN DAN FUNGSI**

#### **3.1 Definisi Form Booking**

Form booking adalah **interface pengguna (UI component)** yang memungkinkan PPAT/PPATS untuk:
1. **Input data transaksi BPHTB** (wajib pajak, objek pajak, perhitungan)
2. **Upload dokumen pendukung** (akta tanah, sertifikat, dokumen pelengkap)
3. **Submit booking request** ke sistem untuk diproses oleh BAPPENDA

#### **3.2 Struktur Data Form Booking**

Form booking mengumpulkan data ke dalam **4 entitas database utama**:

**A. Data Booking Utama (`pat_1_bookingsspd`)**
```sql
- bookingid (PK, auto-increment)
- nobooking (unique, auto-generated via trigger)
- userid (FK → a_2_verified_users)
- jenis_wajib_pajak (Perorangan/Badan Usaha)
- noppbb (Nomor Objek Pajak PBB)
- namawajibpajak, alamatwajibpajak
- namapemilikobjekpajak, alamatpemilikobjekpajak
- tanggal, tahunajb
- trackstatus (Draft → Diajukan → Diterima → Diverifikasi → Diserahkan)
- created_at, updated_at
```

**B. Data Perhitungan BPHTB (`pat_2_bphtb_perhitungan`)**
```sql
- id (PK)
- nobooking (FK → pat_1_bookingsspd)
- nilaiperolehanobjekpajaktidakkenapajak (NPOPTKP)
- bphtb_yangtelah_dibayar
- hargatransaksi
```

**C. Data Objek Pajak (`pat_4_objek_pajak`)**
```sql
- id (PK)
- nobooking (FK → pat_1_bookingsspd)
- letaktanahdanbangunan
- rt_rwobjekpajak
- kecamatanlp, kelurahandesalp
- status_kepemilikan
- jenisPerolehan
- nomor_sertifikat
- tanggal_perolehan
```

**D. Data Perhitungan NJOP (`pat_5_penghitungan_njop`)**
```sql
- id (PK)
- nobooking (FK → pat_1_bookingsspd)
- luas_tanah, njop_tanah
- luas_bangunan, njop_bangunan
- total_njoppbb
```

#### **3.3 Auto-Generation Nomor Booking**

Sistem menggunakan **PostgreSQL Trigger** untuk auto-generate nomor booking:

```sql
CREATE OR REPLACE FUNCTION generate_nobooking()
RETURNS TRIGGER AS $$
DECLARE
    v_ppat_khusus VARCHAR;
    v_tahun INTEGER;
    v_urut INTEGER;
    v_nobooking VARCHAR;
BEGIN
    -- Ambil ppat_khusus dari user
    SELECT ppat_khusus INTO v_ppat_khusus
    FROM a_2_verified_users
    WHERE userid = NEW.userid;
    
    -- Ambil tahun dari tahunajb atau tahun saat ini
    v_tahun := COALESCE(NEW.tahunajb, EXTRACT(YEAR FROM CURRENT_DATE));
    
    -- Hitung urutan booking untuk tahun tersebut
    SELECT COALESCE(MAX(CAST(SUBSTRING(nobooking FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO v_urut
    FROM pat_1_bookingsspd
    WHERE ppat_khusus = v_ppat_khusus
      AND tahunajb = v_tahun;
    
    -- Format: {ppat_khusus}-{tahun}-{urut dengan padding 6 digit}
    v_nobooking := v_ppat_khusus || '-' || v_tahun || '-' || LPAD(v_urut::TEXT, 6, '0');
    
    NEW.nobooking := v_nobooking;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_nobooking
BEFORE INSERT ON pat_1_bookingsspd
FOR EACH ROW
WHEN (NEW.nobooking IS NULL)
EXECUTE FUNCTION generate_nobooking();
```

**Contoh Output:** `20008-2025-000025`
- `20008` = ppat_khusus dari user PAT06
- `2025` = tahun AJB
- `000025` = urutan booking ke-25 untuk PPAT tersebut di tahun 2025

---

### **4. ALUR PROSES BISNIS (BUSINESS PROCESS)**

#### **4.1 Workflow Lengkap Sistem**

```
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 1: CREATE BOOKING (PPAT/PPATS)                       │
├─────────────────────────────────────────────────────────────┤
│  1. PPAT login ke sistem                                     │
│  2. Akses form booking                                       │
│  3. Input data:                                              │
│     - Data wajib pajak (nama, alamat, NPWP)                 │
│     - Data objek pajak (alamat, luas, sertifikat)          │
│     - Perhitungan BPHTB (nilai perolehan, tarif)            │
│     - Perhitungan NJOP (NJOP tanah, NJOP bangunan)          │
│  4. Upload dokumen:                                          │
│     - Akta tanah (JPG/PNG/PDF)                              │
│     - Sertifikat tanah (JPG/PNG/PDF)                        │
│     - Dokumen pelengkap (PDF)                                │
│  5. Upload tanda tangan manual (opsional)                   │
│  6. Submit form → Database transaction                      │
│  7. Trigger generate nobooking otomatis                      │
│  8. Status: "Draft"                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 2: SEND TO LTB (PPAT/PPATS)                          │
├─────────────────────────────────────────────────────────────┤
│  1. PPAT review booking yang sudah dibuat                    │
│  2. Pastikan dokumen lengkap                                 │
│  3. Update trackstatus: "Diajukan"                          │
│  4. Sistem insert ke ltb_1_terima_berkas_sspd                │
│  5. Generate no_registrasi: "2025-O-00001"                  │
│  6. Notifikasi real-time ke LTB                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 3: VALIDASI LTB                                       │
├─────────────────────────────────────────────────────────────┤
│  1. LTB melihat daftar booking masuk                         │
│  2. Validasi kelengkapan dokumen                             │
│  3. Pilih status:                                            │
│     - "Diterima" → Lanjut ke Peneliti                        │
│     - "Ditolak" → Kembali ke PPAT dengan alasan              │
│  4. Update trackstatus di pat_1_bookingsspd                  │
│  5. Notifikasi ke PPAT                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 4: VERIFIKASI BANK (Paralel dengan LTB)              │
├─────────────────────────────────────────────────────────────┤
│  1. Sistem otomatis kirim ke Bank untuk verifikasi pembayaran│
│  2. Bank cek bukti pembayaran BPHTB                          │
│  3. Update status_verifikasi: "Disetujui"/"Ditolak"          │
│  4. Data tersimpan di bank_1_cek_hasil_transaksi            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 5: PEMERIKSAAN PENELITI                               │
├─────────────────────────────────────────────────────────────┤
│  1. Peneliti melihat daftar booking yang diterima LTB        │
│  2. Pemeriksaan dokumen dan perhitungan BPHTB                │
│  3. Input checklist verifikasi                               │
│  4. Upload tanda tangan manual                                │
│  5. Update p_1_verifikasi dan p_2_verif_sign                 │
│  6. Trackstatus: "Diverifikasi"                               │
│  7. Kirim ke Clear to Paraf                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 6: CLEAR TO PARAF                                     │
├─────────────────────────────────────────────────────────────┤
│  1. Clear to Paraf menerima dari Peneliti                    │
│  2. Beri paraf dan stempel                                   │
│  3. Update p_3_clear_to_paraf                                │
│  4. Kirim ke Peneliti Validasi (Pejabat)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 7: VALIDASI FINAL (Peneliti Validasi/Pejabat)        │
├─────────────────────────────────────────────────────────────┤
│  1. Peneliti Validasi melakukan validasi final               │
│  2. Generate nomor validasi (contoh: "KIWXLJRN-1NM")         │
│  3. Upload tanda tangan digital                              │
│  4. Generate QR code untuk validasi                          │
│  5. Update pv_1_paraf_validate                               │
│  6. Trackstatus: "Terverifikasi"                             │
│  7. Kirim ke LSB                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  TAHAP 8: SERAH TERIMA (LSB)                                 │
├─────────────────────────────────────────────────────────────┤
│  1. LSB melihat daftar dokumen yang sudah terverifikasi       │
│  2. Manual handover ke PPAT                                   │
│  3. Update lsb_1_serah_berkas                                 │
│  4. Trackstatus: "Diserahkan"                                │
│  5. Notifikasi ke PPAT                                        │
│  6. Selesai                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

### **5. IMPLEMENTASI TEKNIS**

#### **5.1 API Endpoint untuk Create Booking**

**Endpoint:** `POST /api/ppat_create-booking-and-bphtb`

**Request Flow:**
```javascript
1. Client (Frontend) → POST request dengan JSON payload
2. Express.js Middleware:
   - Authentication check (session validation)
   - Authorization check (user role = PPAT/PPATS)
   - Input validation (Joi atau express-validator)
3. Controller Layer:
   - Extract data dari request body
   - Validate business rules
   - Call service layer
4. Service Layer:
   - Get user's ppat_khusus from database
   - Prepare transaction data
   - Call data access layer
5. Data Access Layer:
   - Begin database transaction
   - Insert ke 4 tabel secara sequential:
     a. pat_1_bookingsspd (trigger akan generate nobooking)
     b. pat_2_bphtb_perhitungan
     c. pat_4_objek_pajak
     d. pat_5_penghitungan_njop
   - Commit transaction (atau rollback jika error)
6. Response:
   - Success: Return nobooking yang di-generate
   - Error: Return error message dengan status code
```

**Database Transaction:**
```javascript
const client = await pool.connect();
try {
    await client.query('BEGIN');
    
    // 1. Insert booking (trigger generate nobooking)
    const bookingResult = await client.query(insertBookingQuery, [...]);
    const nobooking = bookingResult.rows[0].nobooking;
    
    // 2. Insert BPHTB perhitungan
    await client.query(insertBPHTBQuery, [nobooking, ...]);
    
    // 3. Insert objek pajak
    await client.query(insertObjekPajakQuery, [nobooking, ...]);
    
    // 4. Insert NJOP perhitungan
    await client.query(insertNJOPQuery, [nobooking, ...]);
    
    await client.query('COMMIT');
    return { success: true, nobooking };
} catch (error) {
    await client.query('ROLLBACK');
    throw error;
} finally {
    client.release();
}
```

#### **5.2 File Upload Mechanism**

**Storage Structure:**
```
/storage/
  └── ppat/
      └── ppat/
          └── {tahun}/
              └── {userid}/
                  └── {nobooking}/
                      ├── akta_tanah/
                      │   └── {userid}_akta_tanah_{index}_{timestamp}.{ext}
                      ├── sertifikat_tanah/
                      │   └── {userid}_sertifikat_tanah_{index}_{timestamp}.{ext}
                      └── pelengkap/
                          └── {userid}_pelengkap_{index}_{timestamp}.{ext}
```

**Upload Process:**
```javascript
1. Client upload file via FormData (multipart/form-data)
2. Backend menggunakan multer middleware untuk handle file upload
3. Validasi:
   - File type (JPG, PNG, PDF)
   - File size (max 10MB per file)
   - File count (max 5 files per category)
4. Generate unique filename dengan timestamp
5. Save file ke storage dengan struktur folder di atas
6. Save file path ke database:
   - pat_1_bookingsspd.akta_tanah_path
   - pat_1_bookingsspd.sertifikat_tanah_path
   - pat_1_bookingsspd.pelengkap_path
```

#### **5.3 Real-time Status Tracking**

**Mechanism:**
- **Polling:** Frontend melakukan AJAX request setiap 5 detik ke endpoint `/api/ppat/booking/:nobooking`
- **WebSocket (Future):** Untuk real-time update tanpa polling
- **Notification System:** Database table `sys_notifications` untuk store notification, kemudian di-fetch oleh frontend

---

### **6. KEAMANAN DAN VALIDASI**

#### **6.1 Authentication & Authorization**

```javascript
// Session-based authentication
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware untuk check authentication
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
}

// Middleware untuk check authorization (role-based)
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        next();
    };
}
```

#### **6.2 Input Validation**

```javascript
// Server-side validation menggunakan Joi
const bookingSchema = Joi.object({
    noppbb: Joi.string().required(),
    namawajibpajak: Joi.string().min(3).max(100).required(),
    alamatwajibpajak: Joi.string().required(),
    npwpwp: Joi.string().pattern(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/),
    hargatransaksi: Joi.number().min(0).required(),
    // ... other validations
});
```

#### **6.3 SQL Injection Prevention**

- Menggunakan **parameterized queries** dengan `$1, $2, ...` (PostgreSQL)
- Tidak ada string concatenation untuk SQL query
- Input sanitization untuk semua user input

---

### **7. DATABASE SCHEMA DAN RELASI**

#### **7.1 Entity Relationship**

```
pat_1_bookingsspd (1) ──┐
                         │
pat_2_bphtb_perhitungan (N) ──┼──→ One-to-Many
                         │
pat_4_objek_pajak (N) ───┘
                         │
pat_5_penghitungan_njop (N) ──┘

pat_1_bookingsspd (1) ──→ (1) ltb_1_terima_berkas_sspd
pat_1_bookingsspd (1) ──→ (1) p_1_verifikasi
pat_1_bookingsspd (1) ──→ (1) pv_1_paraf_validate
pat_1_bookingsspd (1) ──→ (1) lsb_1_serah_berkas

a_2_verified_users (1) ──→ (N) pat_1_bookingsspd
```

#### **7.2 Indexing Strategy**

```sql
-- Index untuk performa query
CREATE INDEX idx_bookingsspd_userid ON pat_1_bookingsspd(userid);
CREATE INDEX idx_bookingsspd_nobooking ON pat_1_bookingsspd(nobooking);
CREATE INDEX idx_bookingsspd_trackstatus ON pat_1_bookingsspd(trackstatus);
CREATE INDEX idx_bookingsspd_created_at ON pat_1_bookingsspd(created_at);
```

---

### **8. KESIMPULAN TEKNIS**

**Form booking adalah:**
1. **UI Component** untuk input data transaksi BPHTB
2. **Entry Point** ke workflow management system E-BPHTB
3. **Data Collection Interface** yang mengumpulkan data ke 4+ tabel database
4. **Trigger Mechanism** untuk auto-generate nomor booking
5. **File Upload Handler** untuk dokumen pendukung
6. **Transaction Initiator** yang memulai proses bisnis multi-tahap

**Sistem ini mengimplementasikan:**
- **MVC Architecture** dengan separation of concerns
- **RESTful API** untuk komunikasi client-server
- **Database Transactions** untuk data consistency
- **Trigger-based Auto-generation** untuk nomor booking
- **Role-based Access Control** untuk security
- **Real-time Status Tracking** untuk transparency
- **File Management System** untuk dokumen storage

**Teknologi yang digunakan:**
- **Backend:** Node.js + Express.js (JavaScript runtime, web framework)
- **Database:** PostgreSQL (relational database dengan trigger support)
- **Frontend:** HTML/CSS/JavaScript dengan Vite.js (modern bundler)
- **Deployment:** Railway (cloud platform dengan PostgreSQL managed service)

---

**Dibuat untuk:** Menjawab pertanyaan dosen dengan penjelasan teknis komprehensif  
**Tanggal:** Desember 2025

