# 📡 CONTOH ENDPOINT API - FITUR UTAMA

Dokumen ini berisi contoh endpoint untuk setiap HTTP method (GET, POST, PUT, DELETE) yang digunakan dalam fitur utama sistem.

**Data Percontohan:**  
- **No. Booking:** `20008-2025-000025`  
- **User ID:** `PAT06`  
- **Status:** Diserahkan (Sudah selesai proses)  
- **Tabel:** `pat_1_bookingsspd`

---

## 1. GET - Mengambil Data Booking

**Endpoint:** `GET /api/ppat/booking/:nobooking`

**Deskripsi:** Mengambil detail lengkap booking berdasarkan nomor booking.

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
    "atas_nama": "Ini nama Pemilik",
    "npwpwp": "43.848.230.4-834.838",
    "npwpop": "43.984.028.3-984.023",
    "tahunajb": 2025,
    "kelurahan": "Nah lurah",
    "kecamatan": "Ini camat",
    "kabupaten_kota": "Kabupaten gasih",
    "kodeposwp": "3482",
    "kelurahanop": "Kelurahan",
    "kecamatanopj": "Kecamatan",
    "kabupatenkotaop": "Kabupaten sih",
    "trackstatus": "Diserahkan",
    "jenis_wajib_pajak": "Badan Usaha",
    "created_at": "2025-12-18T21:52:51.733Z",
    "updated_at": "2025-12-18T22:58:16.026Z",
    "Alamatop": null,
    "keterangan": null,
    "luas_tanah": null,
    "luas_bangunan": null,
    "nama_pemohon": "Rasya Indehouse",
    "no_telepon": "483094839410"
  },
  "jenis_wajib_pajak": "Badan Usaha"
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

**Kode Backend:**
```javascript
app.get('/api/ppat/booking/:nobooking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const userid = req.session.user.userid;
        
        const query = `
            SELECT 
                p.nobooking,
                p.noppbb AS nop,
                p.namawajibpajak AS nama_wajib_pajak,
                p.alamatwajibpajak AS alamat_wajib_pajak,
                p.namapemilikobjekpajak AS atas_nama,
                p.npwpwp,
                p.npwpop,
                p.tahunajb,
                p.kelurahandesawp AS kelurahan,
                p.kecamatanwp AS kecamatan,
                p.kabupatenkotawp AS kabupaten_kota,
                p.kodeposwp,
                p.kelurahandesaop AS kelurahanop,
                p.kecamatanop AS kecamatanopj,
                p.kabupatenkotaop,
                p.trackstatus,
                p.jenis_wajib_pajak,
                p.created_at,
                p.updated_at,
                o.letaktanahdanbangunan AS "Alamatop",
                o.keterangan,
                pp.luas_tanah,
                pp.luas_bangunan,
                u.nama AS nama_pemohon,
                u.telepon::text AS no_telepon
            FROM pat_1_bookingsspd p
            LEFT JOIN a_2_verified_users u ON u.userid = p.userid
            LEFT JOIN pat_4_objek_pajak o ON o.nobooking = p.nobooking
            LEFT JOIN pat_5_penghitungan_njop pp ON pp.nobooking = p.nobooking
            WHERE p.nobooking = $1 AND p.userid = $2
        `;
        
        // Contoh: query untuk nobooking '20008-2025-000025' dan userid 'PAT06'
        const result = await pool.query(query, ['20008-2025-000025', 'PAT06']);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false, 
                message: 'Booking not found'
            });
        }
        
        const bookingData = result.rows[0];
        
        res.json({
            success: true, 
            data: bookingData,
            jenis_wajib_pajak: bookingData.jenis_wajib_pajak
        });

    } catch (error) {
        console.error('❌ [PPAT] Get booking detail failed:', error);
        res.status(500).json({
            success: false, 
            message: 'Failed to get booking detail: ' + error.message
        });
    }
});
```

---

## 2. POST - Membuat Booking Baru

**Endpoint:** `POST /api/ppat_create-booking-and-bphtb`

**Deskripsi:** Membuat booking baru beserta data BPHTB, objek pajak, dan perhitungan NJOP dalam satu transaksi.

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
  "namapemilikobjekpajak": "Ini nama Pemilik",
  "alamatpemilikobjekpajak": "Alamat Pemilik",
  "tanggal": "19-12-2025",
  "tahunajb": 2025,
  "kabupatenkotawp": "Kabupaten gasih",
  "kecamatanwp": "Ini camat",
  "kelurahandesawp": "Nah lurah",
  "rtrwwp": "002",
  "npwpwp": "43.848.230.4-834.838",
  "kodeposwp": "3482",
  "kabupatenkotaop": "Kabupaten sih",
  "kecamatanop": "Kecamatan",
  "kelurahandesaop": "Kelurahan",
  "rtrwop": "001",
  "npwpop": "43.984.028.3-984.023",
  "kodeposop": "48311",
  "trackstatus": "Draft",
  "nilaiPerolehanObjekPajakTidakKenaPajak": 300000000.00,
  "bphtb_yangtelah_dibayar": 1000000000,
  "hargatransaksi": 2000000000,
  "letaktanahdanbangunan": "Jl. Objek Pajak No. 789",
  "rt_rwobjekpajak": "005/006",
  "kecamatanlp": "Kecamatan Lokasi Pajak",
  "kelurahandesalp": "Kelurahan Lokasi Pajak",
  "status_kepemilikan": "Milik Pribadi",
  "jenisPerolehan": "Jual Beli",
  "keterangan": "Keterangan objek pajak",
  "nomor_sertifikat": "SHM-12345",
  "tanggal_perolehan": "20-02-2025",
  "tanggal_pembayaran": "20-01-2024",
  "nomor_bukti_pembayaran": "41344143414",
  "luas_tanah": 100000.00,
  "njop_tanah": 20000.00,
  "luas_bangunan": 200000.00,
  "njop_bangunan": 100000.00,
  "total_njoppbb": 2000000000
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
    "noppbb": "84.30.482.308.980.8787.9",
    "namawajibpajak": "Yang wajib mah shalat",
    "trackstatus": "Draft",
    "created_at": "2025-12-18T21:52:51.733Z"
  }
}
```

**Catatan:** No. booking `20008-2025-000025` di-generate otomatis oleh database trigger berdasarkan `ppat_khusus` (20008) dari userid PAT06 dan tahun (2025).

**Response Error (400):**
```json
{
  "success": false,
  "message": "User does not have ppat_khusus assigned"
}
```

**Kode Backend (Simplified):**
```javascript
app.post('/api/ppat_create-booking-and-bphtb', async (req, res) => {
    try {
        // Check authentication
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized' 
            });
        }
        
        const userid = req.session.user.userid;
        const {
            noppbb,
            jenis_wajib_pajak = 'Badan Usaha',
            namawajibpajak,
            alamatwajibpajak,
            // ... other fields
            trackstatus = 'Draft'
        } = req.body;
        
        // Get user's ppat_khusus
        const getUserQuery = `
            SELECT ppat_khusus 
            FROM a_2_verified_users 
            WHERE userid = $1
        `;
        
        const userResult = await pool.query(getUserQuery, [userid]);
        
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        
        const ppat_khusus = userResult.rows[0].ppat_khusus;
        
        if (!ppat_khusus) {
            throw new Error('User does not have ppat_khusus assigned');
        }
        
        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // 1. Insert booking (trigger akan generate nobooking)
            const insertBookingQuery = `
                INSERT INTO pat_1_bookingsspd (
                    jenis_wajib_pajak, userid, noppbb, namawajibpajak,
                    alamatwajibpajak, namapemilikobjekpajak, 
                    alamatpemilikobjekpajak, tanggal, tahunajb,
                    kabupatenkotawp, kecamatanwp, kelurahandesawp,
                    rtrwwp, npwpwp, kodeposwp, kabupatenkotaop,
                    kecamatanop, kelurahandesaop, rtrwop, npwpop,
                    kodeposop, trackstatus
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                         $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                         $20, $21, $22)
                RETURNING nobooking
            `;
            
            const bookingResult = await client.query(insertBookingQuery, [
                jenis_wajib_pajak, userid, noppbb, namawajibpajak,
                alamatwajibpajak, namapemilikobjekpajak,
                alamatpemilikobjekpajak, tanggal, tahunajb,
                kabupatenkotawp, kecamatanwp, kelurahandesawp,
                rtrwwp, npwpwp, kodeposwp, kabupatenkotaop,
                kecamatanop, kelurahandesaop, rtrwop, npwpop,
                kodeposop, trackstatus
            ]);
            
            const createdNobooking = bookingResult.rows[0].nobooking;
            
            // 2. Insert BPHTB perhitungan
            if (nilaiPerolehanObjekPajakTidakKenaPajak !== undefined) {
                await client.query(`
                    INSERT INTO pat_2_bphtb_perhitungan (
                        nilaiperolehanobjekpajaktidakkenapajak,
                        bphtb_yangtelah_dibayar,
                        nobooking
                    ) VALUES ($1, $2, $3)
                `, [nilaiPerolehanObjekPajakTidakKenaPajak, 
                    bphtb_yangtelah_dibayar || 0, 
                    createdNobooking]);
            }
            
            // 3. Insert objek pajak
            // 4. Insert perhitungan NJOP
            // ... (similar pattern)
            
            await client.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Booking created successfully',
                data: {
                    nobooking: createdNobooking,
                    userid: userid,
                    trackstatus: trackstatus
                }
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('❌ [PPAT] Create booking failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking: ' + error.message
        });
    }
});
```

---

## 3. PUT - Update Status Booking

**Endpoint:** `PUT /api/ppat/booking/:nobooking/trackstatus`

**Deskripsi:** Mengupdate status tracking booking.

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
    "bookingid": 253,
    "nobooking": "20008-2025-000025",
    "userid": "PAT06",
    "jenis_wajib_pajak": "Badan Usaha",
    "noppbb": "84.30.482.308.980.8787.9",
    "namawajibpajak": "Yang wajib mah shalat",
    "alamatwajibpajak": "Jalan dulu",
    "trackstatus": "Dikirim ke LTB",
    "updated_at": "2025-12-18T23:00:00.000Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

**Kode Backend:**
```javascript
app.put('/api/ppat/booking/:nobooking/trackstatus', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const { trackstatus } = req.body;
        const userid = req.session.user.userid;
        
        if (!trackstatus) {
            return res.status(400).json({ 
                success: false, 
                message: 'Trackstatus is required'
            });
        }
        
        const query = `
            UPDATE pat_1_bookingsspd 
            SET trackstatus = $1, updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $2 AND userid = $3
            RETURNING *
        `;
        
        // Contoh: update trackstatus untuk nobooking '20008-2025-000025' milik userid 'PAT06'
        const result = await pool.query(query, ['Dikirim ke LTB', '20008-2025-000025', 'PAT06']);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({ 
            success: true,
            message: 'Status updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPAT] Update status failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update status: ' + error.message
        });
    }
});
```

---

## 4. DELETE - Menghapus Booking

**Endpoint:** `DELETE /api/ppat/booking/:nobooking`

**Deskripsi:** Menghapus booking berdasarkan nomor booking.

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
    "bookingid": 253,
    "nobooking": "20008-2025-000025",
    "userid": "PAT06",
    "jenis_wajib_pajak": "Badan Usaha",
    "noppbb": "84.30.482.308.980.8787.9",
    "namawajibpajak": "Yang wajib mah shalat",
    "alamatwajibpajak": "Jalan dulu",
    "namapemilikobjekpajak": "Ini nama Pemilik",
    "alamatpemilikobjekpajak": "Alamat Pemilik",
    "tanggal": "19-12-2025",
    "tahunajb": 2025,
    "trackstatus": "Diserahkan",
    "nomor_validasi": "KIWXLJRN-1NM",
    "created_at": "2025-12-18T21:52:51.733Z",
    "updated_at": "2025-12-18T22:58:16.026Z"
  }
}
```

**Response Error (404):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

**Kode Backend:**
```javascript
app.delete('/api/ppat/booking/:nobooking', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { nobooking } = req.params;
        const userid = req.session.user.userid;
        
        const query = `
            DELETE FROM pat_1_bookingsspd 
            WHERE nobooking = $1 AND userid = $2
            RETURNING *
        `;
        
        // Contoh: delete booking dengan nobooking '20008-2025-000025' milik userid 'PAT06'
        const result = await pool.query(query, ['20008-2025-000025', 'PAT06']);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ [PPAT] Delete booking failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete booking: ' + error.message
        });
    }
});
```

---

## 📝 Catatan

1. **Authentication:** Semua endpoint memerlukan session authentication (cookie-based).
2. **Authorization:** User hanya dapat mengakses booking yang mereka buat sendiri (dicek melalui `userid`).
3. **Database Transaction:** Endpoint POST menggunakan transaction untuk memastikan konsistensi data.
4. **Error Handling:** Semua endpoint memiliki error handling yang proper dengan status code yang sesuai.
5. **No. Booking Generation:** No. booking di-generate otomatis oleh database trigger berdasarkan `ppat_khusus` dan tahun.
   - Format: `{ppat_khusus}-{tahun}-{urutan}`
   - Contoh: `20008-2025-000025` (ppat_khusus: 20008, tahun: 2025, urutan: 000025)

---

## 📊 Data Percontohan

**Informasi Booking:**
- **Booking ID:** 253
- **No. Booking:** `20008-2025-000025`
- **User ID:** `PAT06`
- **Nama Pemohon:** Rasya Indehouse
- **PPAT Khusus:** 20008
- **Jenis Wajib Pajak:** Badan Usaha
- **Status:** Diserahkan (Sudah selesai proses)
- **No. Validasi:** KIWXLJRN-1NM
- **Tabel Database:** `pat_1_bookingsspd`
- **Tanggal Dibuat:** 2025-12-18 21:52:51
- **Tanggal Update:** 2025-12-18 22:58:16

**Data Booking:**
- **Nama Wajib Pajak:** Yang wajib mah shalat
- **Alamat Wajib Pajak:** Jalan dulu
- **Nama Pemilik Objek Pajak:** Ini nama Pemilik
- **Alamat Pemilik Objek Pajak:** Alamat Pemilik
- **No. PBB:** 84.30.482.308.980.8787.9
- **NPWP WP:** 43.848.230.4-834.838
- **NPWP OP:** 43.984.028.3-984.023
- **Tanggal:** 19-12-2025
- **Tahun AJB:** 2025

**Informasi User:**
- **User ID:** PAT06
- **Nama:** Rasya Indehouse
- **Email:** anginbom75@gmail.com
- **Telepon:** 483094839410
- **Divisi:** PPAT
- **PPAT Khusus:** 20008

---

**File Location:** `backend/routesxcontroller/5_PPAT_endpoint/`

**Dibuat untuk:** Dokumentasi Tugas Akhir  
**Tanggal:** Desember 2025

