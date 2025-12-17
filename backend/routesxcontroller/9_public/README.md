# Public Validation Routes

Endpoint publik untuk validasi keaslian dokumen E-BPHTB tanpa memerlukan authentication.

## 📋 Overview

Modul ini menyediakan API publik yang memungkinkan masyarakat umum untuk memvalidasi keaslian dokumen BPHTB mereka menggunakan:
- Nomor Validasi (input manual)
- QR Code Scanner (kamera)
- Upload File (PDF/Gambar)

## 🔗 Endpoints

### 1. Validasi QR Code
```
GET /api/public/validate-qr/:no_validasi
```

**Parameters:**
- `no_validasi` (path) - Nomor validasi dari QR code

**Response Success (200):**
```json
{
  "success": true,
  "message": "Dokumen asli dan terverifikasi oleh sistem E-BPHTB Kabupaten Bogor",
  "validation_info": {
    "no_validasi": "ABCD1234-XYZ",
    "status": "Divalidasi",
    "trackstatus": "Diserahkan",
    "status_tertampil": "Sudah Divalidasi",
    "tanggal_validasi": "2025-01-15T10:30:00.000Z"
  },
  "document_info": {
    "nobooking": "PPAT0012025001",
    "no_registrasi": "2025O001",
    "noppbb": "32.71.XXX.XXX.XXX-XXXX.X",
    "tanggal": "2025-01-15",
    "tahunajb": "2025",
    "namawajibpajak": "John Doe",
    "namapemilikobjekpajak": "Jane Doe",
    "booking_trackstatus": "Diserahkan"
  },
  "ppat_info": {
    "nama": "PPAT Name",
    "special_field": "Special Field Info",
    "divisi": "PPAT"
  },
  "peneliti_info": {
    "nama": "Peneliti Name",
    "special_parafv": "Paraf Code",
    "nip": "199001012020012001"
  },
  "authenticity": {
    "verified": true,
    "verified_by": "BAPPENDA Kabupaten Bogor",
    "verified_at": "2025-01-15T10:30:00.000Z",
    "verification_method": "QR Code Digital Certificate",
    "institution": "Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Nomor validasi tidak ditemukan atau dokumen belum divalidasi",
  "no_validasi": "INVALID123"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Nomor validasi tidak valid"
}
```

### 2. Health Check
```
GET /api/public/health
```

**Response:**
```json
{
  "success": true,
  "message": "Public validation API is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🔒 Security Features

### 1. Data Limiting
Endpoint publik hanya mengembalikan informasi terbatas:
- ✅ Informasi validasi (status, tanggal)
- ✅ Informasi dokumen (nomor, nama)
- ✅ Informasi PPAT & Peneliti (nama, NIP)
- ❌ TIDAK ada NPWP
- ❌ TIDAK ada nilai BPHTB
- ❌ TIDAK ada path file
- ❌ TIDAK ada keterangan internal

### 2. Status Filtering
Hanya dokumen dengan status `Divalidasi` yang dapat diakses publik.

### 3. Audit Logging
Setiap akses dicatat ke `log_file_access` untuk audit trail:
- IP address
- User agent
- Timestamp
- Nomor validasi yang diakses

### 4. No Authentication Required
Endpoint ini tidak memerlukan session/cookie untuk akses publik.

## 📱 Frontend Integration

### Halaman Publik
File: `public/public-validasi-qr.html`

**Fitur:**
1. Input manual nomor validasi
2. Scan QR Code dengan kamera
3. Upload file (PDF/Image) untuk scan QR
4. Display hasil validasi yang user-friendly

**Akses:**
- Dari halaman utama: button "Cek Keaslian Dokumen"
- Direct URL: `/public-validasi-qr.html`

## 🧪 Testing

### Manual Testing
```bash
# Test dengan nomor validasi valid
curl http://localhost:3000/api/public/validate-qr/ABCD1234-XYZ

# Test dengan nomor validasi invalid
curl http://localhost:3000/api/public/validate-qr/INVALID

# Health check
curl http://localhost:3000/api/public/health
```

### QR Code Format
QR Code dapat berisi:
1. **Plain text:** `ABCD1234-XYZ`
2. **URL dengan query:** `https://example.com?no_validasi=ABCD1234-XYZ`
3. **JSON:** `{"no_validasi": "ABCD1234-XYZ"}`

## 📊 Database Tables

### Primary Table
- `pv_1_paraf_validate` - Data validasi dokumen

### Joined Tables
- `pat_1_bookingsspd` - Data booking
- `a_2_verified_users` - Data PPAT & Peneliti
- `log_file_access` - Audit log

## 🚀 Deployment Notes

### Environment Variables
Tidak ada environment variable khusus untuk modul ini.

### Database Requirements
Pastikan tabel berikut tersedia:
- `pv_1_paraf_validate`
- `pat_1_bookingsspd`
- `a_2_verified_users`
- `log_file_access`

### CORS Configuration
Pastikan CORS sudah dikonfigurasi untuk mengizinkan akses dari domain publik.

## 📝 Changelog

### v1.0.0 (2025-01-15)
- ✅ Initial release
- ✅ Public QR validation endpoint
- ✅ Health check endpoint
- ✅ Audit logging
- ✅ Security measures (data limiting, status filtering)

## 🔧 Maintenance

### Monitoring
- Monitor `log_file_access` untuk unusual activity
- Track response times
- Monitor error rates

### Performance
- Query sudah dioptimasi dengan LEFT JOIN
- Index pada `no_validasi` kolom disarankan
- Limit 1 untuk prevent over-fetching

## 📞 Support

Untuk pertanyaan atau issue terkait modul ini:
- Email: support@bappenda.go.id
- Internal: Tim PSI BAPPENDA

---

**Created by:** Muhammad Farras Syauqi Muharam
**Date:** January 2025
**Purpose:** Tugas Akhir - E-BPHTB System

