# 📡 REKOMENDASI PENEMPATAN ENDPOINT API DI BAB IV

## 🎯 STRATEGI PENEMPATAN

Berdasarkan analisis struktur BAB IV dan endpoint yang ada, berikut rekomendasi penempatan:

---

## 📍 LOKASI PENEMPATAN: **4.1.1 Hasil Iterasi 1**

### **Alasan:**
1. ✅ Semua endpoint (GET, POST, PUT, DELETE) adalah fitur **core** dari sistem booking online
2. ✅ Endpoint ini mendukung fitur utama yang dijelaskan di Iterasi 1 (Create Booking, Upload Document, dll)
3. ✅ Cocok ditempatkan setelah penjelasan tentang "Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js"
4. ✅ Memberikan bukti teknis konkret tentang implementasi backend

---

## 📋 STRUKTUR PENEMPATAN YANG DISARANKAN

### **4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar**

[Paragraf eksisting tentang database, pengujian, dll...]

Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai. Interface pengguna berhasil dikembangkan menggunakan HTML, CSS, dan JavaScript dengan custom CSS framework yang responsif dan *user-friendly* untuk PPAT/PPATS.

#### **4.1.1.1 Implementasi Backend API**

Sistem backend mengimplementasikan RESTful API untuk komunikasi antara frontend dan database. Berikut adalah contoh endpoint utama yang digunakan dalam fitur booking online:

**Tabel X: Daftar Endpoint API Fitur Booking**

| No | Method | Endpoint | Deskripsi | Fitur |
|----|--------|----------|-----------|-------|
| 1 | GET | `/api/ppat/booking/:nobooking` | Mengambil detail booking berdasarkan nomor booking | View Booking |
| 2 | POST | `/api/ppat_create-booking-and-bphtb` | Membuat booking baru beserta data BPHTB, objek pajak, dan NJOP | Create Booking |
| 3 | PUT | `/api/ppat/booking/:nobooking/trackstatus` | Mengupdate status tracking booking | Update Status |
| 4 | DELETE | `/api/ppat/booking/:nobooking` | Menghapus booking berdasarkan nomor booking | Delete Booking |

**1. GET - Mengambil Data Booking**

Endpoint `GET /api/ppat/booking/:nobooking` digunakan untuk mengambil detail lengkap booking berdasarkan nomor booking. Endpoint ini memerlukan autentikasi session dan hanya mengembalikan data booking milik user yang sedang login.

**Request:**
```http
GET /api/ppat/booking/20008-2025-000025
Authorization: Session Cookie
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "nobooking": "20008-2025-000025",
    "nop": "84.30.482.308.980.8787.9",
    "nama_wajib_pajak": "Yang wajib mah shalat",
    "alamat_wajib_pajak": "Jalan dulu",
    "trackstatus": "Diserahkan",
    "jenis_wajib_pajak": "Badan Usaha",
    "created_at": "2025-12-18T21:52:51.733Z",
    "updated_at": "2025-12-18T22:58:16.026Z"
  }
}
```

Endpoint ini melakukan query JOIN ke beberapa tabel (`pat_1_bookingsspd`, `pat_4_objek_pajak`, `pat_5_penghitungan_njop`, `a_2_verified_users`) untuk mengembalikan data lengkap booking dalam satu response.

---

**2. POST - Membuat Booking Baru**

Endpoint `POST /api/ppat_create-booking-and-bphtb` digunakan untuk membuat booking baru beserta data BPHTB, objek pajak, dan perhitungan NJOP dalam satu transaksi database. Endpoint ini menggunakan database transaction untuk memastikan konsistensi data.

**Request:**
```http
POST /api/ppat_create-booking-and-bphtb
Content-Type: application/json
Authorization: Session Cookie

{
  "noppbb": "84.30.482.308.980.8787.9",
  "jenis_wajib_pajak": "Badan Usaha",
  "namawajibpajak": "Yang wajib mah shalat",
  "alamatwajibpajak": "Jalan dulu",
  "trackstatus": "Draft",
  "nilaiPerolehanObjekPajakTidakKenaPajak": 300000000.00,
  "hargatransaksi": 2000000000,
  "luas_tanah": 100000.00,
  "njop_tanah": 20000.00
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "nobooking": "20008-2025-000025",
    "userid": "PAT06",
    "trackstatus": "Draft",
    "created_at": "2025-12-18T21:52:51.733Z"
  }
}
```

**Catatan:** No. booking `20008-2025-000025` di-generate otomatis oleh database trigger berdasarkan `ppat_khusus` (20008) dari userid PAT06 dan tahun (2025). Format nomor: `{ppat_khusus}-{tahun}-{urutan}`.

Endpoint ini melakukan insert ke empat tabel secara bersamaan dalam satu transaction:
- `pat_1_bookingsspd`: Data utama booking
- `pat_2_bphtb_perhitungan`: Data perhitungan BPHTB
- `pat_4_objek_pajak`: Data objek pajak
- `pat_5_penghitungan_njop`: Data perhitungan NJOP

---

**3. PUT - Update Status Booking**

Endpoint `PUT /api/ppat/booking/:nobooking/trackstatus` digunakan untuk mengupdate status tracking booking. Status dapat diubah sesuai alur workflow sistem (Draft → Diajukan → Diterima → Diverifikasi → Diserahkan).

**Request:**
```http
PUT /api/ppat/booking/20008-2025-000025/trackstatus
Content-Type: application/json
Authorization: Session Cookie

{
  "trackstatus": "Dikirim ke LTB"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "nobooking": "20008-2025-000025",
    "trackstatus": "Dikirim ke LTB",
    "updated_at": "2025-12-18T23:00:00.000Z"
  }
}
```

Endpoint ini melakukan update pada tabel `pat_1_bookingsspd` dengan menambahkan timestamp `updated_at` secara otomatis.

---

**4. DELETE - Menghapus Booking**

Endpoint `DELETE /api/ppat/booking/:nobooking` digunakan untuk menghapus booking berdasarkan nomor booking. Endpoint ini hanya dapat menghapus booking milik user yang sedang login dan hanya dapat menghapus booking dengan status tertentu (misalnya hanya "Draft").

**Request:**
```http
DELETE /api/ppat/booking/20008-2025-000025
Authorization: Session Cookie
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Booking deleted successfully",
  "data": {
    "nobooking": "20008-2025-000025",
    "userid": "PAT06",
    "trackstatus": "Diserahkan"
  }
}
```

**Catatan Keamanan:**
- Semua endpoint memerlukan autentikasi session (cookie-based)
- User hanya dapat mengakses booking yang mereka buat sendiri (dicek melalui `userid`)
- Endpoint POST menggunakan database transaction untuk memastikan konsistensi data
- Semua endpoint memiliki error handling yang proper dengan status code yang sesuai

---

[Lanjutkan dengan paragraf eksisting tentang pengujian, metrik, dll...]

---

## 📝 ALTERNATIF PENEMPATAN (Jika ingin lebih ringkas)

Jika ingin lebih ringkas, bisa menggunakan format tabel dengan penjelasan singkat:

### **4.1.1.1 Implementasi Backend API**

Sistem backend mengimplementasikan RESTful API untuk komunikasi antara frontend dan database. Berikut adalah endpoint utama yang digunakan:

**Tabel X: Daftar Endpoint API Fitur Booking**

| No | Method | Endpoint | Deskripsi | Request Body | Response |
|----|--------|----------|-----------|--------------|----------|
| 1 | GET | `/api/ppat/booking/:nobooking` | Mengambil detail booking berdasarkan nomor booking | - | JSON data booking lengkap |
| 2 | POST | `/api/ppat_create-booking-and-bphtb` | Membuat booking baru beserta data BPHTB, objek pajak, dan NJOP dalam satu transaksi | JSON data booking | JSON dengan nobooking yang di-generate otomatis |
| 3 | PUT | `/api/ppat/booking/:nobooking/trackstatus` | Mengupdate status tracking booking | JSON `{"trackstatus": "..."}` | JSON data booking terupdate |
| 4 | DELETE | `/api/ppat/booking/:nobooking` | Menghapus booking berdasarkan nomor booking | - | JSON data booking yang dihapus |

**Karakteristik Implementasi:**
- Semua endpoint memerlukan autentikasi session (cookie-based)
- Endpoint POST menggunakan database transaction untuk memastikan konsistensi data
- No. booking di-generate otomatis oleh database trigger dengan format: `{ppat_khusus}-{tahun}-{urutan}`
- Semua endpoint memiliki error handling yang proper dengan status code yang sesuai (200, 400, 401, 404, 500)

**Contoh Data Percontohan:**
- No. Booking: `20008-2025-000025`
- User ID: `PAT06`
- PPAT Khusus: `20008`
- Status: `Diserahkan` (sudah selesai proses)

[Detail lengkap endpoint dapat dilihat di Lampiran X]

---

## 📍 LOKASI DI LAMPIRAN (Opsional)

Jika ingin lebih detail, bisa:
1. **Di BAB IV:** Tabel ringkas + penjelasan singkat (seperti alternatif di atas)
2. **Di Lampiran:** Dokumentasi lengkap dengan request/response lengkap, kode backend, dll

**Format Lampiran:**
- **Lampiran X: Dokumentasi Lengkap Endpoint API**
  - Detail setiap endpoint dengan request/response lengkap
  - Contoh kode backend (simplified)
  - Error handling
  - Data percontohan

---

## ✅ REKOMENDASI FINAL

**Pilihan 1: Detail di BAB IV (Disarankan)**
- Letakkan di **4.1.1.1 Implementasi Backend API**
- Gunakan format lengkap dengan request/response untuk setiap endpoint
- Cocok untuk menunjukkan implementasi teknis yang konkret

**Pilihan 2: Ringkas di BAB IV + Detail di Lampiran**
- Di BAB IV: Tabel ringkas + penjelasan singkat
- Di Lampiran: Dokumentasi lengkap dengan semua detail

**Saya merekomendasikan Pilihan 1** karena:
1. ✅ Memberikan bukti teknis konkret di bagian hasil
2. ✅ Menunjukkan implementasi backend yang profesional
3. ✅ Mendukung klaim "Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js"
4. ✅ Tidak terlalu panjang jika disusun dengan baik

---

## 📋 CHECKLIST IMPLEMENTASI

- [ ] Tentukan format (Detail di BAB IV atau Ringkas + Lampiran)
- [ ] Siapkan Tabel X: Daftar Endpoint API
- [ ] Siapkan penjelasan untuk setiap endpoint (4 endpoint)
- [ ] Siapkan contoh request/response untuk setiap endpoint
- [ ] Sertakan catatan keamanan dan karakteristik implementasi
- [ ] Jika menggunakan Lampiran, siapkan dokumentasi lengkap
- [ ] Pastikan konsistensi format dengan bagian lain di BAB IV

---

**Dibuat untuk:** Revisi Draft Final Tugas Akhir  
**Tanggal:** Desember 2025

