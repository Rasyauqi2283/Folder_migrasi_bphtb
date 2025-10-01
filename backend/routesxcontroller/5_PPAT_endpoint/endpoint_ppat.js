import fs from 'fs';
import path from 'path';

export default function registerPPATKEndpoints({ app, pool, logger, morganMiddleware, mixedDUpload, pdfDUpload, uploadTTD, uploadDocumentMiddleware, PAT3_DISABLED, triggerNotificationByStatus, upsertBankVerification, mixedCloudinaryUpload, renameCloudinaryFile, deleteCloudinaryFile, extractPublicIdFromUrl, generateSignedUrl, generatePublicUrl }) {
// ===== CLOUDINARY PROXY ENDPOINT =====
// Endpoint untuk serve files dari Cloudinary via Railway server
app.get('/api/files/cloudinary-proxy', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({ success: false, message: 'URL parameter required' });
        }

        console.log('🔄 [PROXY] Fetching file from Cloudinary:', url);

        // Decode URL
        const decodedUrl = decodeURIComponent(url);
        
        // Extract public_id dari URL
        const publicIdMatch = decodedUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (!publicIdMatch) {
            return res.status(400).json({ success: false, message: 'Invalid Cloudinary URL format' });
        }
        
        const publicIdWithExt = publicIdMatch[1];
        const isPdf = publicIdWithExt.toLowerCase().endsWith('.pdf');
        
        console.log('📁 [PROXY] Extracted public_id:', publicIdWithExt);
        
        // Import cloudinary SDK
        const cloudinaryModule = await import('cloudinary');
        const cloudinary = cloudinaryModule.v2;
        
        // Configure cloudinary dengan credentials dari env
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        console.log('🔐 [PROXY] Cloudinary config check:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? `${process.env.CLOUDINARY_API_KEY.substring(0, 5)}...` : 'NOT SET',
            api_secret: process.env.CLOUDINARY_API_SECRET ? '***exists***' : 'NOT SET'
        });
        
        // SOLUSI: Gunakan Cloudinary API untuk download file (bukan generate URL)
        // Cloudinary.api.resource() akan return download URL dengan authentication
        const resourceType = isPdf ? 'raw' : 'image';
        
        console.log('📥 [PROXY] Downloading file via Cloudinary API...');
        
        // Untuk RAW files, public_id INCLUDE extension
        // Untuk IMAGE files, public_id EXCLUDE extension
        const publicIdForApi = isPdf ? 
            publicIdWithExt :  // RAW: include .pdf
            publicIdWithExt.replace(/\.[^.]+$/, ''); // IMAGE: remove extension
        
        console.log('📋 [PROXY] Public ID for API:', {
            original: publicIdWithExt,
            forApi: publicIdForApi,
            resourceType: resourceType
        });
        
        // Download file menggunakan cloudinary.api
        const downloadStream = await new Promise((resolve, reject) => {
            cloudinary.api.resource(publicIdForApi, {
                resource_type: resourceType,
                type: 'upload'
            }, (error, result) => {
                if (error) {
                    console.error('❌ [CLOUDINARY API] Error:', error);
                    reject(error);
                } else {
                    console.log('✅ [CLOUDINARY API] Resource info:', {
                        secure_url: result.secure_url,
                        format: result.format,
                        bytes: result.bytes
                    });
                    resolve(result.secure_url);
                }
            });
        });

        // Import axios untuk fetch file
        const axios = (await import('axios')).default;
        
        let response;
        
        // Untuk RAW files (PDF), gunakan authenticated request dengan API key
        if (isPdf) {
            console.log('🔐 [PROXY] Fetching RAW file with authentication...');
            
            // Generate authenticated download URL
            const authUrl = `https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicIdWithExt}`;
            
            response = await axios({
                method: 'GET',
                url: authUrl,
                responseType: 'arraybuffer',
                timeout: 50000,
                headers: {
                    'User-Agent': 'Railway-Proxy/1.0'
                }
            });
        } else {
            // Untuk images, gunakan public URL
            console.log('🖼️ [PROXY] Fetching IMAGE file (public)...');
            
            response = await axios({
                method: 'GET',
                url: downloadStream,
                responseType: 'arraybuffer',
                timeout: 50000,
                headers: {
                    'User-Agent': 'Railway-Proxy/1.0'
                }
            });
        }

        // Get content type dari Cloudinary response
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        
        console.log('✅ [PROXY] File fetched successfully:', {
            contentType: contentType,
            size: response.data.length,
            isPdf: isPdf
        });

        // Set headers yang benar
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', response.data.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 year
        
        // Untuk PDF, tambahkan header agar bisa dibuka di browser
        if (contentType === 'application/pdf' || isPdf) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline'); // Open in browser, bukan download
        }
        
        // Send file content
        res.send(Buffer.from(response.data));
        
    } catch (error) {
        console.error('❌ [PROXY] Error fetching file from Cloudinary:', error.message);
        console.error('❌ [PROXY] Error details:', error.response?.data || error);
        
        if (error.response?.status === 401) {
            return res.status(401).json({ 
                success: false, 
                message: 'Cloudinary authentication failed - check credentials' 
            });
        }
        
        if (error.response?.status === 404) {
            return res.status(404).json({ 
                success: false, 
                message: 'File not found in Cloudinary' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch file from Cloudinary',
            error: error.message
        });
    }
});

// ini
// Start PPATK Endpoint // (belum selesai)
// Cek apakah user (PPAT/PPATS/others) sudah memiliki tanda tangan
// PPATK: daftar berkas yang sudah Diserahkan (untuk unduh berkas tervalidasi)
app.get('/api/ppatk/lsb_send/rekap/diserahkan', async (req, res) => {
    try {
        const { page = 1, limit = 20, q } = req.query;
        const lim = Math.min(parseInt(limit) || 20, 100);
        const off = (parseInt(page) - 1) * lim;
        const params = [];
        let where = `trackstatus = 'Diserahkan'`;
        if (q && String(q).trim().length) {
            params.push(`%${String(q).trim().toLowerCase()}%`);
            where += ` AND (lower(nobooking) LIKE $${params.length} OR lower(namawajibpajak) LIKE $${params.length} OR lower(namapemilikobjekpajak) LIKE $${params.length})`;
        }
        params.push(lim, off);
        const sql = `
            SELECT nobooking, noppbb, tahunajb, namawajibpajak, namapemilikobjekpajak, npwpwajibpajak,
                   status, trackstatus, updated_at,
                   -- paths that may be needed for download
                   file_withstempel_path, file_booking_path
            FROM lsb_1_serah_berkas
            WHERE ${where}
            ORDER BY updated_at DESC NULLS LAST
            LIMIT $${params.length-1} OFFSET $${params.length}
        `;
        const rows = await pool.query(sql, params);
        return res.json({ success:true, page: parseInt(page), limit: lim, rows: rows.rows });
    } catch (e) {
        console.error('ppatk rekap diserahkan error:', e);
        return res.status(500).json({ success:false, message:'Internal server error' });
    }
});

app.get('/api/check-my-signature', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1`,
      [req.session.user.userid]
    );
    const pathVal = rows[0]?.tanda_tangan_path;
    const hasSignature = !!(pathVal && String(pathVal).trim() !== '');
    return res.json({ success: true, has_signature: hasSignature });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal memeriksa tanda tangan' });
  }
});

// Endpoint untuk menyimpan booking dan perhitungan BPHTB
app.post('/api/ppatk_create-booking-and-bphtb', morganMiddleware,async (req, res) => {
    const userid = req.session.user ? req.session.user.userid : null;
    const nama = req.session.user ? req.session.user.nama : null;
    // Pastikan user sudah login dan session ada
    if (!userid || !nama) {
        logger.warn('Unauthorized access attempt', { endpoint: req.originalUrl });
        return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
    }

    // Validasi Divisi
    if (!['PPAT', 'PPATS'].includes(req.session.user.divisi)) {
        logger.warn('Forbidden access attempt', { user: userid, divisi: req.session.user.divisi });
        return res.status(403).json({ message: 'Hanya pengguna dengan divisi PPAT dan PPATS yang bisa membuat booking' });
    }

    const client = await pool.connect();
    const { 
        jenis_wajib_pajak, noppbb, namawajibpajak, alamatwajibpajak, 
        namapemilikobjekpajak, alamatpemilikobjekpajak, tahunajb, 
        kabupatenkotawp, kecamatanwp ,kelurahandesawp, rtrwwp, npwpwp, kodeposwp, 
        kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, status_kepemilikan,

        // Penghitungan NJOP
        luas_tanah, njop_tanah, luas_bangunan, njop_bangunan,
        
        // Data perhitungan BPHTB
        nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar,
        
        // Data Objek Pajak
        hargatransaksi, letaktanahdanbangunan, rt_rwobjekpajak,  kelurahandesalp, kecamatanlp, jenisPerolehan,
        keterangan, nomor_sertifikat, tanggal_perolehan, tanggal_pembayaran, 
        nomor_bukti_pembayaran
    } = req.body;
        const tanggal = req.body.tanggal;  // Misalnya 01052025
        console.log("Tanggal AJB yang diterima di backend:", tanggal);


        // Mapping value ke tampilan yang lebih baik
        const statusKepemilikanMap = {
            'milik_pribadi': 'Milik Pribadi',
            'milik_bersama': 'Milik Bersama',
            'sewa': 'Sewa',
            'hgb': 'Hak Guna Bangunan'
        };

        const statusKepemilikanFormatted = statusKepemilikanMap[status_kepemilikan] || null;


    try {
        await client.query('BEGIN');  // Memulai transaksi

        // 1. Simpan data booking ke tabel pat_1_bookingsspd
        const bookingQuery = `
            INSERT INTO pat_1_bookingsspd (userid, jenis_wajib_pajak, noppbb, namawajibpajak, 
                                           alamatwajibpajak, namapemilikobjekpajak, alamatpemilikobjekpajak, 
                                           tanggal, tahunajb, kabupatenkotawp, kecamatanwp, kelurahandesawp, 
                                           rtrwwp, npwpwp, kodeposwp, kabupatenkotaop, kecamatanop, kelurahandesaop, 
                                           rtrwop, npwpop, kodeposop, trackstatus, nama)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, 'Draft', $22)
            RETURNING bookingid, nobooking;
        `;
        const bookingValues = [
            userid, jenis_wajib_pajak, noppbb, namawajibpajak, alamatwajibpajak,
            namapemilikobjekpajak, alamatpemilikobjekpajak, tanggal, tahunajb,
            kabupatenkotawp, kecamatanwp, kelurahandesawp, rtrwwp, npwpwp, kodeposwp,
            kabupatenkotaop, kecamatanop, kelurahandesaop, rtrwop, npwpop, kodeposop, nama
        ];

        const bookingResult = await client.query(bookingQuery, bookingValues);
        if (!bookingResult.rows[0] || !bookingResult.rows[0].nobooking) {
            return res.status(500).json({ message: 'Gagal mendapatkan booking ID.' });
        }
        const nobooking = bookingResult.rows[0].nobooking;  // Mendapatkan nobooking setelah data disimpan
        const Bookingid = bookingResult.rows[0].bookingid;  // Mendapatkan bookingid setelah data disimpan

        if (!nobooking) {
            await client.query('ROLLBACK');
            return res.status(500).json({ message: 'Gagal mendapatkan nobooking.' });
        }

        console.log('Nobooking berhasil diambil:', nobooking);
        console.log('Bookingid berhasil diambil:', Bookingid);

        const penghitunganquery = `
            INSERT INTO pat_5_penghitungan_njop (nobooking, luas_tanah, njop_tanah, luas_bangunan, njop_bangunan)
            VALUES ($1, $2, $3, $4, $5);`;
        const penghitunganvalues = [nobooking, luas_tanah, njop_tanah, luas_bangunan, njop_bangunan];

        await client.query(penghitunganquery, penghitunganvalues);

        // 2. Simpan data perhitungan BPHTB ke tabel pat_2_bphtb_perhitungan
        const bphtbQuery = `
            INSERT INTO pat_2_bphtb_perhitungan (nobooking, nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar)
            VALUES ($1, $2, $3);
        `;
        const bphtbValues = [
            nobooking, nilaiPerolehanObjekPajakTidakKenaPajak, bphtb_yangtelah_dibayar
        ];

        await client.query(bphtbQuery, bphtbValues);  // Menyimpan perhitungan BPHTB

        // 3. Simpan data objek pajak ke tabel pat_4_objek_pajak
        const objekPajakQuery = `
            INSERT INTO pat_4_objek_pajak (nobooking, harga_transaksi, letaktanahdanbangunan, rt_rwobjekpajak, status_kepemilikan, 
                                          keterangan, nomor_sertifikat, tanggal_perolehan, 
                                          tanggal_pembayaran, nomor_bukti_pembayaran, kelurahandesalp, kecamatanlp, jenis_perolehan)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
        `;
        const objekPajakValues = [
            nobooking, hargatransaksi, letaktanahdanbangunan, rt_rwobjekpajak, statusKepemilikanFormatted, keterangan, nomor_sertifikat,
            tanggal_perolehan, tanggal_pembayaran, nomor_bukti_pembayaran, kelurahandesalp, kecamatanlp, jenisPerolehan 
        ];

        await client.query(objekPajakQuery, objekPajakValues);  // Menyimpan data objek pajak

        const ValidasiQuery = `
            INSERT INTO pat_8_validasi_tambahan (nobooking)
            VALUES ($1);
        `;
        const ValidasiValues = [
            nobooking
        ];

        await client.query(ValidasiQuery, ValidasiValues);  // Menyimpan data objek pajak

        // 4. (Opsional) Siapkan baris awal dokumen, tanda tangan, dan validasi surat
        // Gunakan savepoint agar jika tabel/kolom tidak cocok, transaksi utama tetap lanjut
        if (!PAT3_DISABLED) {
            try {
                await client.query('SAVEPOINT sp_docs');
                const insertDocs = `
                    INSERT INTO pat_3_documents (userid, nama, path_document1, path_document2, booking_id, upload_date)
                    VALUES ($1, $2, NULL, NULL, $3, NOW())
                `;
                await client.query(insertDocs, [userid, nama, Bookingid]);
            } catch (e) {
                await client.query('ROLLBACK TO SAVEPOINT sp_docs');
                console.warn('Skip init pat_3_documents:', e.message);
            }
        } else {
            console.log('Lewati init pat_3_documents (dinonaktifkan)');
        }

        try {
            await client.query('SAVEPOINT sp_sign');
            // Ambil path tanda tangan dari profil pengguna (boleh null jika belum ada)
            const sigRes = await client.query(
                'SELECT tanda_tangan_path FROM a_2_verified_users WHERE userid = $1',
                [userid]
            );
            const sigPath = sigRes.rows[0]?.tanda_tangan_path || null;

            const insertSign = `
                INSERT INTO pat_6_sign (nobooking, userid, nama, path_ttd_wp, path_ttd_ppatk)
                VALUES ($1, $2, $3, NULL, $4)
            `;
            await client.query(insertSign, [nobooking, userid, nama, sigPath]);

            // Debug: log path tanda tangan yang ditautkan (jika ada)
            try {
                const { rows: linked } = await client.query(
                    'SELECT path_ttd_ppatk FROM pat_6_sign WHERE nobooking = $1',
                    [nobooking]
                );
                console.log('PPAT signature linked to booking:', linked[0]?.path_ttd_ppatk || '(none)');
            } catch (_) {}
        } catch (e) {
            await client.query('ROLLBACK TO SAVEPOINT sp_sign');
            console.warn('Skip init pat_6_sign:', e.message);
        }

        try {
            await client.query('SAVEPOINT sp_valsurat');
            const insertValSurat = `
                INSERT INTO pat_7_validasi_surat (nobooking, status_surat, created_at)
                VALUES ($1, 'pending', NOW())
            `;
            await client.query(insertValSurat, [nobooking]);
        } catch (e) {
            await client.query('ROLLBACK TO SAVEPOINT sp_valsurat');
            console.warn('Skip init pat_7_validasi_surat:', e.message);
        }
        await client.query('COMMIT');  // Commit transaksi

        // Mengirimkan response sukses
        res.status(201).json({ 
            success: true, 
            message: 'Booking, perhitungan BPHTB, dan objek pajak berhasil disimpan.',
            nobooking: nobooking
        });

    } catch (error) {
        await client.query('ROLLBACK');  // Rollback transaksi jika terjadi error
        console.error('Error during booking, BPHTB calculation, and objek pajak creation:', error);
        res.status(500).json({
            success: false, 
            message: 'Gagal menyimpan booking, perhitungan BPHTB, dan objek pajak.'
        });
    } finally {
        client.release();  // Melepaskan koneksi setelah operasi selesai
    }
});

//
// Endpoint untuk mengambil data booking
// Tambahkan validasi lebih ketat
app.get('/api/ppatk_get-booking-data', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid } = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Query utama dengan optimasi
        const query = `
            SELECT
                b.nobooking, b.noppbb, b.tanggal, b.tahunajb,
                b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp,
                b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
                o.letaktanahdanbangunan AS alamat_objek, pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.userid = $1 AND b.trackstatus IN ('Draft','Diolah','Ditolak','Dilanjutkan','Diverifikasi','Terverifikasi')
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const result = await pool.query(query, [userid, limit, offset]);

        // Query count terpisah untuk performa lebih baik
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd WHERE userid = $1`;
        const countResult = await pool.query(countQuery, [userid]);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
///
app.get('/api/ppatk_get-booking-data/:nobooking', async (req, res) => {
    const { nobooking } = req.params;
    const { userid } = req.session.user;

    if (!userid) {
        return res.status(401).json({
            success: false,
            message: 'User tidak terautentikasi'
        });
    }

    try {
        // Query lengkap dengan JOIN ke semua tabel terkait
        const query = `
            SELECT 
            b.nobooking, b.userid, b.jenis_wajib_pajak, b.nobooking, b.noppbb, b.namawajibpajak, b.alamatwajibpajak,
            b.namapemilikobjekpajak, b.alamatpemilikobjekpajak, b.tanggal, b.tahunajb, b.kabupatenkotawp, b.kecamatanwp,
            b.kelurahandesawp, b.rtrwwp, b.npwpwp, b.kodeposwp, b.kabupatenkotaop, b.kecamatanop, b.kelurahandesaop,
            b.rtrwop, b.npwpop, b.kodeposop, b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path, b.nama, b.created_at,
                o.letaktanahdanbangunan, o.rt_rwobjekpajak, o.status_kepemilikan, 
                o.keterangan, o.nomor_sertifikat, o.tanggal_perolehan,
                o.tanggal_pembayaran, o.nomor_bukti_pembayaran,
                pp.luas_tanah, pp.luas_bangunan,
                vu.special_field, vu.telepon,
                pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_5_penghitungan_njop pp ON b.nobooking = pp.nobooking
            LEFT JOIN a_2_verified_users vu ON vu.userid = b.userid
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.nobooking = $1 AND b.userid = $2
            LIMIT 1;
        `;

        const result = await pool.query(query, [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data booking tidak ditemukan atau tidak memiliki akses'
            });
        }

        const bookingData = result.rows[0];

        // Format data sesuai kebutuhan form
        const responseData = {
            success: true,
            booking: {
                // Data pemohon (dari verified_users)
                nama_pemohon: bookingData.special_field,
                no_telepon: bookingData.telepon,
                // Data wajib pajak (dari pat_1_bookingsspd)
                nama_wajib_pajak: bookingData.namawajibpajak,
                kelurahan: bookingData.kelurahandesawp,
                kecamatan: bookingData.kecamatanwp,
                kabupaten_kota: bookingData.kabupatenkotawp,
                alamat_wajib_pajak: bookingData.alamatwajibpajak,
                nop: bookingData.noppbb,
                atas_nama: bookingData.namapemilikobjekpajak,
                // Data objek pajak
                Alamatop: bookingData.letaktanahdanbangunan,
                lainnya: bookingData.keterangan,
                // Data NJOP
                luas_tanah: bookingData.luas_tanah || 0,
                luas_bangunan: bookingData.luas_bangunan || 0
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Error fetching booking data:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server saat mengambil data booking' 
        });
    }
});
///
// API UNTUK STATUS VALIDASI PPATK //
app.post('/api/save-ppatk-additional-data', async (req, res) => {
    try {
        const { userid } = req.session.user;
        const { 
            nobooking,
            alamat_pemohon,
            kampungop,
            kelurahanop,
            kecamatanopj,
        } = req.body;

        if (!userid) {
            return res.status(401).json({ 
                success: false, 
                message: 'User tidak terautentikasi' 
            });
        }

        // Check if booking belongs to user
        const bookingCheck = await pool.query(
            'SELECT userid FROM pat_1_bookingsspd WHERE nobooking = $1',
            [nobooking]
        );

        if (bookingCheck.rows.length === 0 || bookingCheck.rows[0].userid !== userid) {
            return res.status(403).json({ 
                success: false, 
                message: 'Tidak memiliki akses ke data ini' 
            });
        }

        // Save to additional data table
        const result = await pool.query(`
        UPDATE pat_8_validasi_tambahan SET
                alamat_pemohon = $1,
                kampungop = $2,
                kelurahanop = $3,
                kecamatanopj = $4,
                updated_at = NOW()
            WHERE nobooking = $5
            RETURNING *
        `, [alamat_pemohon, kampungop,
            kelurahanop, kecamatanopj, nobooking ]);

        res.json({ 
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error saving additional data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Gagal menyimpan data tambahan' 
        });
    }
});
//

// ENDPOINT BARU: Upload ke Cloudinary
app.post('/api/ppatk_upload-cloudinary',
  (req, res, next) => {
    console.log('🌐 [CLOUDINARY] Starting file upload process...');
    
    // Gunakan Cloudinary storage
    mixedCloudinaryUpload.fields([
      { name: 'aktaTanah', maxCount: 1 },
      { name: 'sertifikatTanah', maxCount: 1 },
      { name: 'pelengkap', maxCount: 1 }
    ])(req, res, (uploadErr) => {
      if (uploadErr) {
        console.error('❌ [CLOUDINARY] Upload error:', uploadErr);
        return res.status(400).json({ 
          success: false, 
          message: uploadErr.message || 'Error uploading files to Cloudinary' 
        });
      }
      
      console.log('✅ [CLOUDINARY] Files uploaded successfully:', req.files);
      next();
    });
  }, async (req, res) => {
    const { userid } = req.session.user;

    if (!userid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Memastikan ada file yang di-upload
    if (!req.files || !req.files.aktaTanah || !req.files.sertifikatTanah || !req.files.pelengkap) {
        return res.status(400).json({ success: false, message: 'Dokumen wajib belum lengkap (akta, sertifikat, pelengkap).' });
    }

    const { nobooking } = req.body;

    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'No booking selected' });
    }

    try {
        // Extract year and serial from nobooking
        let year = '0000';
        let serial = '000000';
        if (typeof nobooking === 'string' && nobooking.includes('-')) {
            const parts = nobooking.split('-');
            if (parts.length >= 3) {
                year = parts[1].replace(/[^0-9]/g, '').padStart(4, '0').slice(-4);
                serial = parts[2].replace(/[^0-9]/g, '').padStart(6, '0').slice(-6);
            }
        }

        // Process uploaded files - TIDAK PERLU RENAME, langsung gunakan URL dari Cloudinary
        const fileMapping = {
            aktaTanah: 'Akta',
            sertifikatTanah: 'SertifikatTanah',
            pelengkap: 'DokumenP'
        };

        const uploadedFiles = {};

        for (const [fieldName, docType] of Object.entries(fileMapping)) {
            if (req.files[fieldName] && req.files[fieldName][0]) {
                const file = req.files[fieldName][0];
                const isPdf = file.mimetype === 'application/pdf';
                
                console.log(`📁 [CLOUDINARY] File uploaded:`, {
                    field: fieldName,
                    filename: file.filename,
                    cloudinaryUrl: file.path,
                    mimetype: file.mimetype,
                    isPdf: isPdf
                });

                // Simpan metadata: cloudinary_url dan proxy_path
                uploadedFiles[fieldName] = {
                    cloudinary_url: file.path.replace('http://', 'https://'), // Cloudinary URL (untuk internal)
                    proxy_path: `/api/files/cloudinary-proxy?url=${encodeURIComponent(file.path)}`, // Railway proxy URL
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size,
                    isPdf: isPdf
                };
            }
        }

        // Simpan Railway proxy URLs ke database (untuk user access)
        const aktaTanahUrl = uploadedFiles.aktaTanah?.proxy_path || null;
        const sertifikatTanahUrl = uploadedFiles.sertifikatTanah?.proxy_path || null;
        const pelengkapUrl = uploadedFiles.pelengkap?.proxy_path || null;

        console.log('📁 [CLOUDINARY] Final URLs for database:', {
            akta: aktaTanahUrl,
            sertifikat: sertifikatTanahUrl,
            pelengkap: pelengkapUrl
        });

        // Cek apakah nobooking ada di database
        const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking not found in database' });
        }

        // Simpan PROXY URLs ke database (Railway URLs, bukan Cloudinary direct)
        // Format: /api/files/cloudinary-proxy?url=CLOUDINARY_URL
        // User akan akses via Railway, Railway fetch dari Cloudinary
        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET 
                akta_tanah_path = $1,
                sertifikat_tanah_path = $2,
                pelengkap_path = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE nobooking = $4
            RETURNING *;
        `;

        const values = [aktaTanahUrl, sertifikatTanahUrl, pelengkapUrl, nobooking];

        console.log('💾 [DB] Updating booking with proxy URLs:', {
            nobooking: nobooking,
            akta: aktaTanahUrl,
            sertifikat: sertifikatTanahUrl,
            pelengkap: pelengkapUrl
        });
        
        const resultUpdate = await pool.query(updateQuery, values);

        if (resultUpdate.rowCount > 0) {
            console.log('✅ [DB] Cloudinary URLs saved to database');
            
            res.json({ 
                success: true, 
                message: 'Files uploaded to Cloudinary successfully',
                data: {
                    akta_tanah_url: aktaTanahUrl,
                    sertifikat_tanah_url: sertifikatTanahUrl,
                    pelengkap_url: pelengkapUrl,
                    nobooking: nobooking
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'Failed to update database' });
        }
    } catch (error) {
        console.error('❌ [ERROR] Upload to Cloudinary failed:', error);
        res.status(500).json({ success: false, message: 'Failed to save files: ' + error.message });
    }
});

// ENDPOINT LAMA: Upload ke Local Storage (DEPRECATED - untuk backward compatibility)
app.post('/api/ppatk_upload-input_validasisspd',
  (req, res, next) => {
    console.log('⚠️ [LOCAL] Using local storage (deprecated)...');
    
    // Middleware untuk menangani PDF atau Gambar (max 5MB)
    mixedDUpload.fields([
      { name: 'aktaTanah', maxCount: 1 },
      { name: 'sertifikatTanah', maxCount: 1 },
      { name: 'pelengkap', maxCount: 1 }
    ])(req, res, (uploadErr) => {
      if (uploadErr) {
        console.error('Mixed upload error:', uploadErr);
        return res.status(400).json({ 
          success: false, 
          message: uploadErr.message || 'Error uploading files' 
        });
      }
      
      console.log('Files uploaded successfully:', req.files);
      next();
    });
  }, async (req, res) => {
    const { userid } = req.session.user; // Ambil userId dari session atau body request (sesuai implementasi frontend)

    if (!userid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Memastikan ada file yang di-upload (semua wajib sesuai UI dropdown)
    if (!req.files || !req.files.aktaTanah || !req.files.sertifikatTanah || !req.files.pelengkap) {
        return res.status(400).json({ success: false, message: 'Dokumen wajib belum lengkap (akta, sertifikat, pelengkap).' });
    }

    // Pastikan nobooking yang dikirim dari frontend ada di body
    const { nobooking } = req.body;  // Menarik nobooking yang dipilih dari frontend

    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'No booking selected' });
    }

    // Menyimpan jalur file ke dalam database (relative dari folder public)
    const toRelativePublicPath = (filePath) => {
        if (!filePath) return null;
        const normalized = filePath.replace(/\\/g, '/');
        const idx = normalized.toLowerCase().lastIndexOf('/public/');
        if (idx !== -1) {
            const relativePath = normalized.substring(idx + '/public/'.length);
            // Pastikan path tidak dimulai dengan '/' untuk relative path
            return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        }
        // fallback: jika tidak ditemukan segmen public
        const fallbackPath = normalized.replace(/^public\//i, '');
        return fallbackPath.startsWith('/') ? fallbackPath.substring(1) : fallbackPath;
    };

    // FUNGSI RENAME FILE dengan format yang benar
    const renameUploadedFile = (uploadedFile, nobooking, docType) => {
        if (!uploadedFile) return null;
        
        const oldPath = uploadedFile.path;
        const ext = path.extname(uploadedFile.filename);
        const userid = req.session.user.userid;
        
        // Extract year and serial from nobooking
        let year = '0000';
        let serial = '000000';
        if (typeof nobooking === 'string' && nobooking.includes('-')) {
            const parts = nobooking.split('-');
            if (parts.length >= 3) {
                year = (parts[1] || '').replace(/[^0-9]/g, '').padStart(4, '0').slice(-4);
                serial = (parts[2] || '').replace(/[^0-9]/g, '').padStart(6, '0').slice(-6);
            }
        }
        
        // Generate new filename: USERID_DocType_SERIAL_YEAR.ext
        const newFilename = `${userid}_${docType}_${serial}_${year}${ext}`;
        const dirPath = path.dirname(oldPath);
        const newPath = path.join(dirPath, newFilename);
        
        try {
            // Rename file
            fs.renameSync(oldPath, newPath);
            console.log(`✅ [RENAME] ${path.basename(oldPath)} → ${newFilename}`);
            return newPath;
        } catch (err) {
            console.error(`❌ [RENAME] Error renaming file:`, err);
            return oldPath; // Return old path if rename fails
        }
    };

    // Rename files dengan format yang benar
    const aktaTanahRenamedPath = req.files.aktaTanah ? 
        renameUploadedFile(req.files.aktaTanah[0], nobooking, 'Akta') : null;
    const sertifikatTanahRenamedPath = req.files.sertifikatTanah ? 
        renameUploadedFile(req.files.sertifikatTanah[0], nobooking, 'SertifikatTanah') : null;
    const pelengkapRenamedPath = req.files.pelengkap ? 
        renameUploadedFile(req.files.pelengkap[0], nobooking, 'DokumenP') : null;

    // Convert ke relative path
    const aktaTanahPath = aktaTanahRenamedPath ? toRelativePublicPath(aktaTanahRenamedPath) : null;
    const sertifikatTanahPath = sertifikatTanahRenamedPath ? toRelativePublicPath(sertifikatTanahRenamedPath) : null;
    const pelengkapPath = pelengkapRenamedPath ? toRelativePublicPath(pelengkapRenamedPath) : null;

    // Debugging: Console log untuk melihat apakah file path sudah benar
    console.log('📁 [UPLOAD] Final file paths after rename:');
    console.log('📁 [UPLOAD] Akta Tanah Path:', aktaTanahPath);
    console.log('📁 [UPLOAD] Sertifikat Tanah Path:', sertifikatTanahPath);
    console.log('📁 [UPLOAD] File Pelengkap Path:', pelengkapPath)

    try {
        // Cek apakah nobooking yang dipilih ada di pat_1_bookingsspd
        const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking not found in database' });
        }

        // Menyimpan file paths ke dalam database
        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET 
                akta_tanah_path = $1,
                sertifikat_tanah_path = $2,
                pelengkap_path = $3
            WHERE nobooking = $4
            RETURNING *;
        `;

        const values = [aktaTanahPath, sertifikatTanahPath, pelengkapPath, nobooking];

        // Debugging: Console log untuk melihat query dan values yang digunakan
        console.log('Updating booking with No. Booking:', nobooking);
        console.log('Update Query:', updateQuery);
        console.log('Values to update:', values);

        const resultUpdate = await pool.query(updateQuery, values);

        // Debugging: Cek apakah data berhasil di-update di database
        if (resultUpdate.rowCount > 0) {
            console.log('✅ [UPLOAD] File paths successfully updated in the database:', resultUpdate.rows[0]);
            console.log('✅ [UPLOAD] Updated paths in DB:');
            console.log('✅ [UPLOAD] - akta_tanah_path:', resultUpdate.rows[0].akta_tanah_path);
            console.log('✅ [UPLOAD] - sertifikat_tanah_path:', resultUpdate.rows[0].sertifikat_tanah_path);
            console.log('✅ [UPLOAD] - pelengkap_path:', resultUpdate.rows[0].pelengkap_path);
            // Bangun URL web-friendly (pastikan diawali slash dan relatif ke root static 'public')
            const buildPublicUrl = (storedRelPath) => {
                if (!storedRelPath) return null;
                // Pastikan path dimulai dengan '/' untuk absolute path
                return storedRelPath.startsWith('/') ? storedRelPath : `/${storedRelPath}`;
            };

            // Build URLs untuk response
            const aktaUrl = buildPublicUrl(resultUpdate.rows[0].akta_tanah_path);
            const sertifikatUrl = buildPublicUrl(resultUpdate.rows[0].sertifikat_tanah_path);
            const pelengkapUrl = buildPublicUrl(resultUpdate.rows[0].pelengkap_path);
            
            console.log('🌐 [UPLOAD] Built URLs:');
            console.log('🌐 [UPLOAD] - akta_tanah_url:', aktaUrl);
            console.log('🌐 [UPLOAD] - sertifikat_tanah_url:', sertifikatUrl);
            console.log('🌐 [UPLOAD] - pelengkap_url:', pelengkapUrl);

            res.json({ success: true, message: 'Files uploaded and paths saved in database.',
                data:{
                    akta_tanah_path: resultUpdate.rows[0].akta_tanah_path,
                    akta_tanah_url: aktaUrl,
                    sertifikat_tanah_path: resultUpdate.rows[0].sertifikat_tanah_path,
                    sertifikat_tanah_url: sertifikatUrl,
                    pelengkap_path: resultUpdate.rows[0].pelengkap_path,
                    pelengkap_url: pelengkapUrl
                }
             });
        } else {
            console.log('No booking found for the given NoBooking.');
            res.status(404).json({ success: false, message: 'No booking found for the given NoBooking.' });
        }
    } catch (error) {
        console.error('Error saving file paths to database:', error);
        res.status(500).json({ success: false, message: 'Failed to save file paths.' });
    }
});

// Endpoint untuk upload PDF dokumen
app.post('/api/ppatk_upload-pdf',
  (req, res, next) => {
    console.log('Starting PDF upload process...');
    
    // Middleware untuk menangani PDF
    pdfDUpload.single('pdfDokumen')(req, res, (err) => {
      if (err) {
        console.error('PDF upload error:', err);
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error uploading PDF file' 
        });
      }
      
      console.log('PDF uploaded successfully:', req.file);
      next();
    });
  }, async (req, res) => {
    const { userid } = req.session.user;

    if (!userid) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
    }

    const { nobooking } = req.body;

    if (!nobooking) {
        return res.status(400).json({ success: false, message: 'No booking selected' });
    }

    const normalizePath = (filePath) => filePath ? filePath.replace(/\\/g, '/') : null;
    const pdfDokumenPath = normalizePath(req.file.path);

    console.log('PDF file path:', pdfDokumenPath);

    try {
        const result = await pool.query('SELECT * FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', [nobooking, userid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No booking found in database' });
        }

        const updateQuery = `
            UPDATE pat_1_bookingsspd 
            SET pdf_dokumen_path = $1
            WHERE nobooking = $2
            RETURNING *;
        `;

        const values = [pdfDokumenPath, nobooking];

        console.log('Updating booking with No. Booking:', nobooking);
        console.log('Update Query:', updateQuery);
        console.log('Values to update:', values);

        const resultUpdate = await pool.query(updateQuery, values);

        if (resultUpdate.rowCount > 0) {
            console.log('PDF path successfully updated in the database:', resultUpdate.rows[0]);
            res.json({ 
                success: true, 
                message: 'PDF uploaded and path saved in database.',
                data: {
                    pdf_dokumen_path: resultUpdate.rows[0].pdf_dokumen_path
                }
            });
        } else {
            console.log('No booking found for the given NoBooking.');
            res.status(404).json({ success: false, message: 'No booking found for the given NoBooking.' });
        }
    } catch (error) {
        console.error('Error saving PDF path to database:', error);
        res.status(500).json({ success: false, message: 'Failed to save PDF path.' });
    }
});

///
//

app.post('/api/ppatk_upload-signatures', uploadTTD.fields([
    { name: 'signature1', maxCount: 1 },  // TTD Wajib Pajak (opsional)
]), async (req, res) => {
    // Logger yang lebih terstruktur
    const logger = {
        info: (...args) => console.log('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args)
    };

    logger.info('Memulai proses upload tanda tangan...');
    
    try {
        // 1. Validasi Session dan User
        logger.debug('Session data:', req.session);
        const { userid } = req.session.user || {};
        
        if (!userid) {
            logger.error('UserID tidak ditemukan di session');
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan' 
            });
        }

        // 2. Validasi Request Body
        logger.debug('Request body:', req.body);
        const { nobooking } = req.body;
        
        if (!nobooking) {
            logger.error('NoBooking tidak ditemukan di request body');
            return res.status(400).json({ 
                success: false, 
                message: 'Nomor Booking diperlukan',
                error_code: 'MISSING_BOOKING_NUMBER'
            });
        }

        // 3. Validasi File Upload
        logger.debug('Files yang diterima:', req.files);
        
        if (!req.files) {
            logger.error('File tanda tangan tidak lengkap', {
                signature1: !!req.files?.signature1,
            });
            
            return res.status(400).json({ 
                success: false, 
                message: 'Tanda tangan wajib pajak harus diunggah',
                error_code: 'INCOMPLETE_SIGNATURES'
            });
        }

        // 4. Normalisasi Path File (cross-platform)
        const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
        
        const signature1Path = req.files.signature1 
            ? normalizePath(req.files.signature1[0].path) 
            : null; // opsional
        
        logger.debug('Detail file upload:', {
            ttd_wp: req.files.signature1?.[0] ? {
                path: signature1Path,
                name: req.files.signature1[0].originalname,
                size: req.files.signature1[0].size
            } : null,
        });

        // 5. Verifikasi Data di Database
        logger.debug('Memverifikasi booking dan user...');
        
        const [bookingCheck, userData] = await Promise.all([
            pool.query(
                'SELECT 1 FROM pat_1_bookingsspd WHERE nobooking = $1 AND userid = $2', 
                [nobooking, userid]
            ),
            pool.query(
                'SELECT userid, nama FROM a_2_verified_users WHERE userid = $1', 
                [userid]
            )
        ]);

        if (bookingCheck.rows.length === 0) {
            logger.error('Booking tidak valid', { nobooking, userid });
            return res.status(404).json({
                success: false,
                message: 'Nomor Booking tidak valid',
                error_code: 'INVALID_BOOKING'
            });
        }

        if (userData.rows.length === 0) {
            logger.error('User tidak ditemukan', { userid });
            return res.status(404).json({
                success: false,
                message: 'Data user tidak ditemukan',
                error_code: 'USER_NOT_FOUND'
            });
        }

        const { nama } = userData.rows[0];
        logger.debug('Data valid:', { nobooking, userid, nama });

        // 6. Simpan ke Database (update-then-insert agar tidak butuh constraint unik)
        logger.debug('Menyimpan tanda tangan ke database...');

        const updateQuery = `
            UPDATE pat_6_sign
            SET nama = $3,
                path_ttd_wp = $4
            WHERE nobooking = $1 AND userid = $2
            RETURNING *;
        `;
        const upsertParams = [nobooking, userid, nama, signature1Path];
        logger.debug('Executing UPDATE for upsert:', { query: updateQuery, params: upsertParams });
        let row;
        const updateResult = await pool.query(updateQuery, upsertParams);
        if (updateResult.rows.length > 0) {
            row = updateResult.rows[0];
            logger.info('Tanda tangan berhasil diperbarui', { id: row.id, nobooking });
        } else {
            const insertQuery = `
                INSERT INTO pat_6_sign (
                    nobooking,
                    userid,
                    nama,
                    path_ttd_wp
                ) VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            logger.debug('Executing INSERT for upsert:', { query: insertQuery, params: upsertParams });
            const insertResult = await pool.query(insertQuery, upsertParams);
            if (insertResult.rows.length === 0) {
                logger.error('Gagal menyimpan data tanda tangan (INSERT)');
                throw new Error('INSERT operation failed');
            }
            row = insertResult.rows[0];
            logger.info('Tanda tangan berhasil disimpan', { id: row.id, nobooking });
        }

        // 7. Response Sukses
        // Bangun URL publik berdasarkan path di bawah /public
        const publicUrl = signature1Path
            ? '/' + signature1Path.replace(/^(.*?)[\\/]?public[\\/]/i, '').replace(/\\/g, '/')
            : null;

        return res.json({ 
            success: true, 
            message: 'Tanda tangan berhasil diunggah',
            data: {
                nobooking,
                user: { userid, nama },
                signatures: {
                    wajib_pajak: signature1Path ? {
                        path: signature1Path,
                        url: publicUrl
                    } : null,
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Error proses upload:', {
            message: error.message,
            stack: error.stack,
            ...(error.code && { code: error.code })
        });

        // Cleanup file jika error terjadi setelah upload
        if (req.files) {
            try {
                logger.debug('Cleaning up uploaded files...');
                const cleanupPromises = [
                    req.files.signature1?.[0]?.path && fs.promises.unlink(req.files.signature1[0].path),
                ].filter(Boolean);
                
                await Promise.all(cleanupPromises);
            } catch (cleanupError) {
                logger.error('Gagal membersihkan file:', cleanupError);
            }
        }

        const errorResponse = {
            success: false,
            message: 'Terjadi kesalahan sistem',
            error_code: 'SERVER_ERROR'
        };

        if (process.env.NODE_ENV === 'development') {
            errorResponse.debug = {
                message: error.message,
                ...(error.code && { code: error.code }),
                stack: error.stack
            };
        }

        return res.status(500).json(errorResponse);
    }
});
// ============================ \\
///
async function generateRegistrationNumber() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // January is 0
        
        // [OPTIMASI DATABASE] - Pastikan index sudah dibuat
        // CREATE INDEX idx_reg_year ON ltb_1_terima_berkas_sspd (no_registrasi) 
        // WHERE no_registrasi ~ '^[0-9]{4}O[0-9]{5}$';

        // Cek tahun terakhir dari data created_at
        console.log('🔍 [REG-NUMBER] Checking last entry...');
        const lastEntry = await pool.query('SELECT created_at FROM ltb_1_terima_berkas_sspd ORDER BY created_at DESC LIMIT 1');
        const lastEntryYear = lastEntry.rows[0] ? new Date(lastEntry.rows[0].created_at).getFullYear() : currentYear;
        
        // Logika tahun berganti
        if (lastEntryYear < currentYear) {
            console.log(`[SYSTEM] Tahun berganti dari ${lastEntryYear} ke ${currentYear}. Nomor registrasi direset.`);
        }

        // Cari nomor registrasi terakhir dari tahun yang sama
        console.log('🔍 [REG-NUMBER] Checking last registration number...');
        const lastRegQuery = `
            SELECT no_registrasi 
            FROM ltb_1_terima_berkas_sspd 
            WHERE no_registrasi ~ $1
            ORDER BY no_registrasi DESC 
            LIMIT 1
        `;
        const regexPattern = `^${currentYear}O[0-9]{5}$`;
        const lastRegResult = await pool.query(lastRegQuery, [regexPattern]);
        console.log('📊 [REG-NUMBER] Last registration result:', lastRegResult.rows.length, 'rows found');
        
        let nextNumber = 1; // Reset setiap tahun baru
        
        if (lastRegResult.rows.length > 0) {
            const lastReg = lastRegResult.rows[0].no_registrasi;
            const lastNumber = parseInt(lastReg.match(/O(\d{5})$/)[1]);
            nextNumber = lastNumber + 1;
            
            // Peringatan akhir tahun jika nomor hampir habis
            if (currentMonth === 12 && nextNumber >= 99900) {
                console.warn(`[WARNING] Nomor registrasi tahun ${currentYear} hampir penuh. Terakhir: ${nextNumber}`);
            }

            if (nextNumber > 99999) {
                throw new Error(`Nomor registrasi tahun ${currentYear} sudah penuh (${nextNumber-1}/99999). Hubungi administrator.`);
            }
        }
        
        const newRegNumber = `${currentYear}O${nextNumber.toString().padStart(5, '0')}`;
        console.log(`[INFO] Generated new registration number: ${newRegNumber}`);
        return newRegNumber;
    } catch (error) {
        console.error('[ERROR] Error generating registration number:', error);
        throw new Error('Gagal menghasilkan nomor registrasi. Silakan coba lagi atau hubungi administrator.');
    }
}
//
app.post('/api/ppatk_ltb-process', async (req, res) => {
    const { nobooking, trackstatus, userid, nama } = req.body;

    // Log request untuk debugging
    console.log('🔍 [LTB-PROCESS] Request received:', { nobooking, trackstatus, userid, nama });

    // Set timeout untuk response
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({ 
                success: false, 
                message: 'Request timeout - proses terlalu lama. Silakan coba lagi.' 
            });
        }
    }, 30000); // 30 detik timeout

    try {
        // Validasi input dengan cepat
        if (!nobooking || !trackstatus || !userid || !nama) {
            clearTimeout(timeout);
            console.log('❌ [LTB-PROCESS] Validation failed - missing required fields');
            return res.status(400).json({ success: false, message: 'Data yang diperlukan tidak lengkap.' });
        }
        
        const allowedStatuses = ['Diolah', 'Diterima', 'Ditolak'];
        if (!allowedStatuses.includes(trackstatus)) {
            clearTimeout(timeout);
            console.log('❌ [LTB-PROCESS] Validation failed - invalid trackstatus:', trackstatus);
            return res.status(400).json({ success: false, message: 'Status tidak valid.' });
        }

        // Optimasi: Gunakan client connection untuk transaction
        console.log('🔗 [LTB-PROCESS] Connecting to database...');
        const client = await pool.connect();
        
        try {
            console.log('🔄 [LTB-PROCESS] Starting transaction...');
            await client.query('BEGIN');

            // Optimasi: Query yang lebih efisien - pisahkan query untuk menghindari FOR UPDATE dengan LEFT JOIN
            console.log('🔍 [LTB-PROCESS] Checking booking:', nobooking);
            
            // 1. Query utama dengan FOR UPDATE (tanpa LEFT JOIN)
            const checkNobookingQuery = `
                SELECT 
                    pb.nobooking, pb.trackstatus, pb.namawajibpajak, pb.namapemilikobjekpajak, pb.nama,
                    pb.akta_tanah_path, pb.sertifikat_tanah_path, pb.pelengkap_path
                FROM pat_1_bookingsspd pb
                WHERE pb.nobooking = $1
                FOR UPDATE;
            `;
            
            const checkResult = await client.query(checkNobookingQuery, [nobooking]);
            console.log('📊 [LTB-PROCESS] Booking check result:', checkResult.rows.length, 'rows found');
            
            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                clearTimeout(timeout);
                console.log('❌ [LTB-PROCESS] Booking not found:', nobooking);
                return res.status(400).json({ success: false, message: 'No Booking tidak ditemukan.' });
            }

            const rowData = checkResult.rows[0];
            
            // 2. Query tambahan untuk data validasi (tanpa FOR UPDATE)
            const validasiQuery = `
                SELECT 
                    alamat_pemohon, kampungop, kelurahanop, kecamatanopj
                FROM pat_8_validasi_tambahan
                WHERE nobooking = $1;
            `;
            
            const validasiResult = await client.query(validasiQuery, [nobooking]);
            const validasiData = validasiResult.rows[0] || {};
            
            console.log('📊 [LTB-PROCESS] Validasi data result:', validasiResult.rows.length, 'rows found');
            console.log('📊 [LTB-PROCESS] Validasi data:', validasiData);
            
            // Merge data
            const mergedData = {
                ...rowData,
                alamat_pemohon: validasiData.alamat_pemohon,
                kampungop: validasiData.kampungop,
                kelurahanop: validasiData.kelurahanop,
                kecamatanopj: validasiData.kecamatanopj
            };
            
            console.log('📊 [LTB-PROCESS] Merged data:', mergedData);

            // Guard: hanya boleh kirim dari status Draft -> Diolah
            const currentStatus = (mergedData.trackstatus || '').toLowerCase();
            if (currentStatus !== 'draft') {
                await client.query('ROLLBACK');
                clearTimeout(timeout);
                return res.status(409).json({
                    success: false,
                    message: `Tidak dapat mengirim. Status saat ini '${mergedData.trackstatus}' (bukan Draft).`
                });
            }

            // Validasi file yang diperlukan
            if (!mergedData.akta_tanah_path || !mergedData.sertifikat_tanah_path || !mergedData.pelengkap_path) {
                await client.query('ROLLBACK');
                clearTimeout(timeout);
                return res.status(400).json({
                    success: false,
                    message: 'File yang diperlukan belum di-upload atau tidak lengkap. Pastikan Akta Tanah, Sertifikat Tanah, dan File Pelengkap telah di-upload.'
                });
            }

            // Validasi alamat pemohon
            if (!mergedData.alamat_pemohon || !mergedData.kampungop || !mergedData.kelurahanop || !mergedData.kecamatanopj) {
                const missingFields = [];
                if (!mergedData.alamat_pemohon) missingFields.push("alamat_pemohon");
                if (!mergedData.kampungop) missingFields.push("kampungop");
                if (!mergedData.kelurahanop) missingFields.push("kelurahanop");
                if (!mergedData.kecamatanopj) missingFields.push("kecamatanopj");
                await client.query('ROLLBACK');
                clearTimeout(timeout);
                return res.status(400).json({
                    success: false,
                    message: `Data alamat pemohon belum lengkap. Field yang wajib diisi: ${missingFields.join(', ')}`
                });
            }

            // Generate nomor registrasi
            console.log('🔢 [LTB-PROCESS] Generating registration number...');
            const noRegistrasi = await generateRegistrationNumber();
            console.log('✅ [LTB-PROCESS] Registration number generated:', noRegistrasi);

            // 2. Update trackstatus menjadi status yang baru pada pat_1_bookingsspd
            const updateQuery = 'UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2 RETURNING *';
            const updateValues = [trackstatus, nobooking];
            const updateResult = await client.query(updateQuery, updateValues);

            if (updateResult.rows.length > 0) {
                // 3. Menyimpan data ke tabel ltb_1_terima_berkas_sspd setelah status diperbarui
                const insertQuery = `
                    INSERT INTO ltb_1_terima_berkas_sspd 
                    (nobooking, tanggal_terima, status, trackstatus, userid, namawajibpajak, namapemilikobjekpajak, divisi, nama, jenis_wajib_pajak, no_registrasi)
                    VALUES 
                    ($1, CURRENT_DATE, 'Diterima', $2, $3, $4, $5, 'LTB', $6, 'Badan Usaha', $7);
                `;
                const insertValues = [
                    nobooking, 
                    trackstatus, 
                    userid, 
                    mergedData.namawajibpajak, 
                    mergedData.namapemilikobjekpajak,
                    mergedData.nama,
                    noRegistrasi
                ];
                const insertResult = await client.query(insertQuery, insertValues);

                if (insertResult.rowCount > 0) {
                    // Buat entry verifikasi BANK (status awal Pending) menggunakan no_registrasi
                    try {
                        await upsertBankVerification(nobooking, 'Pending', null, null, noRegistrasi);
                    } catch (bankErr) {
                        console.warn('Gagal membuat entri verifikasi BANK:', bankErr?.message);
                    }
                    
                    // Trigger notification dengan timeout
                    try {
                        const bookingId = updateResult.rows[0]?.bookingid;
                        const actedBy = userid;
                        if (bookingId) {
                            // Set timeout untuk notification
                            const notificationTimeout = new Promise((_, reject) => {
                                setTimeout(() => reject(new Error('Notification timeout')), 5000); // 5 detik timeout
                            });
                            
                            await Promise.race([
                                triggerNotificationByStatus(bookingId, 'pending_ltb', actedBy),
                                notificationTimeout
                            ]);
                        }
                    } catch (notifyErr) {
                        console.warn('⚠️ [LTB-PROCESS] Gagal mengirim notifikasi LTB/Admin:', notifyErr.message);
                        // Jangan throw error, biarkan proses lanjut
                    }
                    
                    // Commit transaction
                    await client.query('COMMIT');
                    clearTimeout(timeout);
                    
                    console.log(`✅ [LTB-PROCESS] Data dengan No. Booking ${nobooking} telah diproses oleh LTB dan status diubah menjadi ${trackstatus}.`);

                    // Check if response already sent
                    if (!res.headersSent) {
                        return res.status(200).json({
                            success: true,
                            message: `Data dengan No. Booking ${nobooking} berhasil diproses oleh LTB.`,
                            no_registrasi: noRegistrasi
                        });
                    } else {
                        console.log('⚠️ [LTB-PROCESS] Response already sent, skipping response');
                    }
                } else {
                    await client.query('ROLLBACK');
                    clearTimeout(timeout);
                    if (!res.headersSent) {
                        return res.status(400).json({ success: false, message: 'Gagal menyimpan data ke tabel ltb_1_terima_berkas_sspd.' });
                    }
                }
            } else {
                await client.query('ROLLBACK');
                clearTimeout(timeout);
                if (!res.headersSent) {
                    return res.status(400).json({ success: false, message: 'Gagal mengubah status data.' });
                }
            }
        } catch (error) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('❌ [LTB-PROCESS] Error during rollback:', rollbackErr);
            }
            clearTimeout(timeout);
            console.error('❌ [LTB-PROCESS] Error processing data:', error.message);
            console.error('❌ [LTB-PROCESS] Error stack:', error.stack);
            if (!res.headersSent) {
                return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses data.' });
            }
        } finally {
            client.release();
        }
    } catch (error) {
        clearTimeout(timeout);
        console.error('❌ [LTB-PROCESS] Error in ppatk_ltb-process:', error.message);
        console.error('❌ [LTB-PROCESS] Error stack:', error.stack);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
        }
    }
});

////
/////////////////////////////////////////////////////////////////////////////////////////////
// API untuk mengupdate trackstatus menjadi 'Dihapus'
app.put('/api/ppatk_update-trackstatus/:nobooking', async (req, res) => {
    const { nobooking } = req.params;

    try {
        // Update status track menjadi 'Dihapus'
        const result = await pool.query('UPDATE pat_1_bookingsspd SET trackstatus = $1 WHERE nobooking = $2', ['Dihapus', nobooking]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Data not found' });
        }

        res.json({ success: true, message: 'Data status berhasil diubah menjadi Dihapus' });
    } catch (error) {
        console.error('Error updating trackstatus:', error);
        res.status(500).json({ message: 'Error updating trackstatus' });
    }
});

///
// (belum selesai)
app.get('/api/admin/ltb-processed', async (_req, res) => {
    try {
        // Query untuk mendapatkan data dengan status "Diolah" dari LTB yang ada di tabel ltb_1_terima_berkas_sspd
        const query = `
            SELECT 
                pb.nobooking, 
                pb.userid, 
                vu.nama AS nama_wajib_pajak, 
                tbs.tanggal_terima, 
                tbs.status, 
                tbs.trackstatus, 
                tbs.pengirim_ltb
            FROM pat_1_bookingsspd pb
            JOIN a_2_verified_users vu ON pb.userid = vu.userid
            LEFT JOIN ltb_1_terima_berkas_sspd tbs ON pb.nobooking = tbs.nobooking
            WHERE tbs.trackstatus = 'Diproses'  -- Hanya mengambil data yang sudah diproses
        `;

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            res.status(200).json({
                success: true,
                bookingData: result.rows
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Tidak ada data yang diproses oleh LTB.'
            });
        }
    } catch (error) {
        console.error('Error fetching processed data:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat data yang diproses oleh LTB.' });
    }
});
//

app.get('/api/ppatk_get-booking-data-completed', async (req, res) => {
    try {
        // Validasi session
        if (!req.session.user || !req.session.user.userid) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { userid } = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        // Query utama dengan optimasi
        const query = `
            SELECT
                b.nobooking, b.noppbb, b.tanggal, b.tahunajb,
                b.namawajibpajak, b.namapemilikobjekpajak, b.npwpwp,
                b.trackstatus, b.akta_tanah_path, b.sertifikat_tanah_path, b.pelengkap_path,
                o.letaktanahdanbangunan AS alamat_objek, pv.*
            FROM pat_1_bookingsspd b
            LEFT JOIN pat_4_objek_pajak o ON b.nobooking = o.nobooking
            LEFT JOIN pat_8_validasi_tambahan pv ON b.nobooking = pv.nobooking
            WHERE b.userid = $1 AND b.trackstatus IN ('Diserahkan')
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3;
        `;

        const result = await pool.query(query, [userid, limit, offset]);

        // Query count terpisah untuk performa lebih baik
        const countQuery = `SELECT COUNT(*) FROM pat_1_bookingsspd WHERE userid = $1`;
        const countResult = await pool.query(countQuery, [userid]);
        
        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                page,
                totalPages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Endpoint untuk upload dokumen PPATK
app.post('/api/ppatk_upload-documents', uploadDocumentMiddleware.fields([
    { name: 'document1', maxCount: 1 },  // Dokumen wajib
    { name: 'document2', maxCount: 1 }   // Dokumen tambahan (opsional)
]), async (req, res) => {
    const logger = {
        info: (...args) => console.log('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args)
    };

    logger.info('Memulai proses upload dokumen...');
    
    try {
        // 1. Validasi Session dan User
        logger.debug('Session data:', req.session);
        
        // Check if session exists
        if (!req.session) {
            logger.error('Session tidak ditemukan');
            return res.status(401).json({ 
                success: false, 
                message: 'Session tidak valid. Silakan login ulang.' 
            });
        }
        
        const { userid } = req.session.user || {};
        
        if (!userid) {
            logger.error('UserID tidak ditemukan di session');
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan. Silakan login ulang.' 
            });
        }

        // 2. Validasi File Upload
        logger.debug('Files yang diterima:', req.files);
        
        if (!req.files || !req.files.document1) {
            logger.error('Dokumen wajib tidak ditemukan');
            return res.status(400).json({ 
                success: false, 
                message: 'Dokumen wajib harus diupload',
                error_code: 'MISSING_REQUIRED_DOCUMENT'
            });
        }

        // 3. Normalisasi Path File (cross-platform)
        const normalizePath = (filePath) => filePath.replace(/\\/g, '/');
        
        const document1Path = normalizePath(req.files.document1[0].path);
        const document2Path = req.files.document2 
            ? normalizePath(req.files.document2[0].path) 
            : null;
        
        logger.debug('Detail file upload:', {
            document1: {
                path: document1Path,
                name: req.files.document1[0].originalname,
                size: req.files.document1[0].size,
                type: req.files.document1[0].mimetype
            },
            document2: req.files.document2 ? {
                path: document2Path,
                name: req.files.document2[0].originalname,
                size: req.files.document2[0].size,
                type: req.files.document2[0].mimetype
            } : null
        });

        // 4. Verifikasi User di Database
        logger.debug('Memverifikasi user...');
        
        let userData;
        try {
            userData = await pool.query(
                'SELECT userid, nama FROM a_2_verified_users WHERE userid = $1', 
                [userid]
            );
        } catch (dbError) {
            logger.error('Database error saat verifikasi user:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error database saat verifikasi user',
                error_code: 'DATABASE_ERROR'
            });
        }

        if (userData.rows.length === 0) {
            logger.error('User tidak ditemukan', { userid });
            return res.status(404).json({
                success: false,
                message: 'Data user tidak ditemukan',
                error_code: 'USER_NOT_FOUND'
            });
        }

        const { nama } = userData.rows[0];
        logger.debug('Data user valid:', { userid, nama });

        // 5. Simpan ke Database dengan booking_id jika ada
        if (PAT3_DISABLED) {
            return res.status(503).json({ success: false, message: 'Fitur dokumen dinonaktifkan' });
        }
        logger.debug('Menyimpan dokumen ke database...');
        
        const insertQuery = `
            INSERT INTO pat_3_documents (
                userid, 
                nama, 
                path_document1, 
                path_document2,
                booking_id,
                upload_date
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const insertParams = [
            userid,
            nama,
            document1Path,
            document2Path,
            req.body.booking_id || null, // Associate with booking if provided
            new Date()
        ];

        logger.debug('Executing query:', { query: insertQuery, params: insertParams });
        
        let insertResult;
        try {
            insertResult = await pool.query(insertQuery, insertParams);
        } catch (dbError) {
            logger.error('Database error saat menyimpan dokumen:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error database saat menyimpan dokumen',
                error_code: 'DATABASE_ERROR'
            });
        }

        if (insertResult.rows.length === 0) {
            logger.error('Gagal menyimpan data dokumen');
            throw new Error('INSERT operation failed');
        }

        logger.info('Dokumen berhasil disimpan', { 
            id: insertResult.rows[0].id,
            userid 
        });

        // 6. Response Sukses
        return res.json({ 
            success: true, 
            message: 'Dokumen berhasil diunggah',
            data: {
                user: { userid, nama },
                documents: {
                    document1: {
                        path: document1Path,
                        name: req.files.document1[0].originalname,
                        url: `/uploads/documents/${userid}/${path.basename(document1Path)}`
                    },
                    document2: document2Path ? {
                        path: document2Path,
                        name: req.files.document2[0].originalname,
                        url: `/uploads/documents/${userid}/${path.basename(document2Path)}`
                    } : null
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        logger.error('Error proses upload dokumen:', {
            message: error.message,
            stack: error.stack,
            ...(error.code && { code: error.code })
        });

        // Cleanup file jika error terjadi setelah upload
        if (req.files) {
            try {
                logger.debug('Cleaning up uploaded files...');
                const cleanupPromises = [
                    req.files.document1?.[0]?.path && fs.promises.unlink(req.files.document1[0].path),
                    req.files.document2?.[0]?.path && fs.promises.unlink(req.files.document2[0].path)
                ].filter(Boolean);
                
                await Promise.all(cleanupPromises);
                logger.debug('File cleanup completed');
            } catch (cleanupError) {
                logger.error('Error during file cleanup:', cleanupError);
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengupload dokumen',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Endpoint untuk mengambil dokumen yang sudah diupload
app.get('/api/ppatk_get-documents', async (req, res) => {
  // Jika PAT3_DISABLED, return empty data instead of 503 error
  if (PAT3_DISABLED) {
    return res.json({ 
      success: true, 
      data: [], 
      message: 'Fitur dokumen dinonaktifkan - mengembalikan data kosong' 
    });
  }
    try {
        // Validasi session
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Session tidak valid. Silakan login ulang.'
            });
        }

        const { userid } = req.session.user;
        const { booking_id } = req.query;

        let query = `
            SELECT id, userid, nama, path_document1, path_document2, booking_id, upload_date
            FROM pat_3_documents 
            WHERE userid = $1
        `;
        let params = [userid];

        // Jika booking_id diberikan, filter berdasarkan booking_id
        if (booking_id) {
            query += ' AND (booking_id = $2 OR booking_id IS NULL)';
            params.push(booking_id);
        }

        query += ' ORDER BY upload_date DESC';

        const result = await pool.query(query, params);

        // Transform data untuk response
        const documents = result.rows.map(row => ({
            id: row.id,
            userid: row.userid,
            nama: row.nama,
            documents: {
                document1: row.path_document1 ? {
                    path: row.path_document1,
                    name: path.basename(row.path_document1),
                    url: `/uploads/documents/${row.userid}/${path.basename(row.path_document1)}`
                } : null,
                document2: row.path_document2 ? {
                    path: row.path_document2,
                    name: path.basename(row.path_document2),
                    url: `/uploads/documents/${row.userid}/${path.basename(row.path_document2)}`
                } : null
            },
            booking_id: row.booking_id,
            upload_date: row.upload_date
        }));

        res.json({
            success: true,
            data: documents
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil dokumen'
        });
    }
});

// End PPATK Endpoint //
}