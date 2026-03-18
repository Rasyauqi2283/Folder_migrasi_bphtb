# 📡 TEKS ENDPOINT API - SIAP PAKAI UNTUK BAB IV

## 📍 LOKASI: **4.1.1 Hasil Iterasi 1: Sistem Booking Online Dasar**

### **Tempatkan SETELAH paragraf:**
"Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai."

---

## 📝 TEKS SIAP PAKAI

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

Endpoint `GET /api/ppat/booking/:nobooking` digunakan untuk mengambil detail lengkap booking berdasarkan nomor booking. Endpoint ini memerlukan autentikasi session dan hanya mengembalikan data booking milik user yang sedang login. Sistem melakukan query JOIN ke beberapa tabel (`pat_1_bookingsspd`, `pat_4_objek_pajak`, `pat_5_penghitungan_njop`, `a_2_verified_users`) untuk mengembalikan data lengkap booking dalam satu response.

**Contoh Request:**
```http
GET /api/ppat/booking/20008-2025-000025
Authorization: Session Cookie
```

**Contoh Response Success (200):**
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

---

**2. POST - Membuat Booking Baru**

Endpoint `POST /api/ppat_create-booking-and-bphtb` digunakan untuk membuat booking baru beserta data BPHTB, objek pajak, dan perhitungan NJOP dalam satu transaksi database. Endpoint ini menggunakan database transaction untuk memastikan konsistensi data. Sistem melakukan insert ke empat tabel secara bersamaan dalam satu transaction: `pat_1_bookingsspd` (data utama booking), `pat_2_bphtb_perhitungan` (data perhitungan BPHTB), `pat_4_objek_pajak` (data objek pajak), dan `pat_5_penghitungan_njop` (data perhitungan NJOP).

**Contoh Request:**
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

**Contoh Response Success (200):**
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

---

**3. PUT - Update Status Booking**

Endpoint `PUT /api/ppat/booking/:nobooking/trackstatus` digunakan untuk mengupdate status tracking booking. Status dapat diubah sesuai alur workflow sistem (Draft → Diajukan → Diterima → Diverifikasi → Diserahkan). Endpoint ini melakukan update pada tabel `pat_1_bookingsspd` dengan menambahkan timestamp `updated_at` secara otomatis.

**Contoh Request:**
```http
PUT /api/ppat/booking/20008-2025-000025/trackstatus
Content-Type: application/json
Authorization: Session Cookie

{
  "trackstatus": "Dikirim ke LTB"
}
```

**Contoh Response Success (200):**
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

---

**4. DELETE - Menghapus Booking**

Endpoint `DELETE /api/ppat/booking/:nobooking` digunakan untuk menghapus booking berdasarkan nomor booking. Endpoint ini hanya dapat menghapus booking milik user yang sedang login dan hanya dapat menghapus booking dengan status tertentu (misalnya hanya "Draft").

**Contoh Request:**
```http
DELETE /api/ppat/booking/20008-2025-000025
Authorization: Session Cookie
```

**Contoh Response Success (200):**
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

---

**Karakteristik Implementasi Backend API:**

1. **Autentikasi dan Autorisasi:** Semua endpoint memerlukan autentikasi session (cookie-based). User hanya dapat mengakses booking yang mereka buat sendiri (dicek melalui `userid`).

2. **Database Transaction:** Endpoint POST menggunakan database transaction untuk memastikan konsistensi data. Jika salah satu insert gagal, seluruh transaksi di-rollback.

3. **Auto-Generation:** No. booking di-generate otomatis oleh database trigger dengan format: `{ppat_khusus}-{tahun}-{urutan}`. Contoh: `20008-2025-000025` (ppat_khusus: 20008, tahun: 2025, urutan: 000025).

4. **Error Handling:** Semua endpoint memiliki error handling yang proper dengan status code yang sesuai:
   - `200`: Success
   - `400`: Bad Request (data tidak valid)
   - `401`: Unauthorized (tidak terautentikasi)
   - `404`: Not Found (booking tidak ditemukan)
   - `500`: Internal Server Error (error server)

5. **Data Percontohan:** Dokumentasi menggunakan data real dari sistem dengan no. booking `20008-2025-000025` milik userid `PAT06` yang sudah melalui proses lengkap hingga status "Diserahkan".

Implementasi backend API ini mendukung seluruh fitur booking online yang dijelaskan pada iterasi pertama, memungkinkan komunikasi yang efisien antara frontend dan database, serta memastikan keamanan dan konsistensi data melalui mekanisme autentikasi, autorisasi, dan transaction.

---

## 📋 INSTRUKSI PENGGUNAAN

1. **Buka file Word TA** (`Draft_Final_Tugas Akhir_Muhammad Farras.docx`)

2. **Buka BAB IV → 4.1.1 Hasil Iterasi 1**

3. **Cari paragraf:**
   "Sistem backend berhasil dikembangkan menggunakan Node.js dan Express.js dengan struktur MVC yang terorganisir dengan baik. Controller dapat menangani request dari PPAT/PPATS dengan baik dan merespons dengan data yang sesuai."

4. **Setelah paragraf tersebut, tambahkan:**
   - Sub-bagian **4.1.1.1 Implementasi Backend API**
   - Copy seluruh teks dari bagian "#### **4.1.1.1 Implementasi Backend API**" sampai akhir

5. **Update nomor tabel:**
   - Ganti "Tabel X" dengan nomor tabel yang sesuai (misalnya "Tabel 4" atau sesuai urutan tabel di dokumen)

6. **Pastikan format konsisten:**
   - Format kode (HTTP, JSON) menggunakan font monospace
   - Format tabel konsisten dengan tabel lain di dokumen
   - Penomoran gambar (jika ada) disesuaikan

---

## ⚠️ CATATAN PENTING

- **Format Kode:** Pastikan kode HTTP dan JSON menggunakan font monospace (Courier New atau Consolas)
- **Nomor Tabel:** Sesuaikan nomor tabel dengan urutan tabel di dokumen
- **Konsistensi:** Pastikan format penulisan konsisten dengan bagian lain di BAB IV
- **Data Real:** Semua contoh menggunakan data real dari sistem (nobooking: 20008-2025-000025, userid: PAT06)

---

**Dibuat untuk:** Revisi Draft Final Tugas Akhir  
**Tanggal:** Desember 2025

