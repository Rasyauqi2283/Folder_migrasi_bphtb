// PPATK: Create booking and BPHTB calculation endpoint
// This endpoint uses JSON body, so it must be registered AFTER express.json() middleware

export default function registerCreateBookingEndpoints({ app, pool, logger }) {
    
    // PPATK: Create booking and BPHTB calculation
    app.post('/api/ppatk_create-booking-and-bphtb', async (req, res) => {
        try {
            console.log('📝 [PPATK] Creating booking and BPHTB calculation...');
            
            // Check authentication
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized' 
                });
            }
            
            const userid = req.session.user.userid;
            const {
                // Data booking utama (pat_1_bookingsspd)
                noppbb,
                jenis_wajib_pajak = 'Badan Usaha',
                namawajibpajak,
                alamatwajibpajak,
                namapemilikobjekpajak,
                alamatpemilikobjekpajak,
                tanggal,
                tahunajb,
                kabupatenkotawp,
                kecamatanwp,
                kelurahandesawp,
                rtrwwp,
                npwpwp,
                kodeposwp,
                kabupatenkotaop,
                kecamatanop,
                kelurahandesaop,
                rtrwop,
                npwpop,
                kodeposop,
                trackstatus = 'Draft',
                
                // Data BPHTB perhitungan (pat_2_bphtb_perhitungan)
                nilaiPerolehanObjekPajakTidakKenaPajak,
                bphtb_yangtelah_dibayar,
                
                // Data objek pajak (pat_4_objek_pajak)
                hargatransaksi,
                letaktanahdanbangunan,
                rt_rwobjekpajak,
                kecamatanlp,
                kelurahandesalp,
                status_kepemilikan,
                jenisPerolehan,
                keterangan,
                nomor_sertifikat,
                tanggal_perolehan,
                tanggal_pembayaran,
                nomor_bukti_pembayaran,
                
                // Data NJOP perhitungan (pat_5_penghitungan_njop)
                luas_tanah,
                njop_tanah,
                luas_bangunan,
                njop_bangunan,
                total_njoppbb
            } = req.body;
            
            console.log('📝 [PPATK] Booking data received:', {
                userid,
                noppbb,
                namawajibpajak,
                namapemilikobjekpajak,
                npwpwp,
                tahunajb,
                trackstatus,
                jenis_wajib_pajak
            });
            
            // Get user's ppatk_khusus and generate nobooking
            const getUserQuery = `
                SELECT ppatk_khusus 
                FROM a_2_verified_users 
                WHERE userid = $1
            `;
            
            const userResult = await pool.query(getUserQuery, [userid]);
            
            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }
            
            const ppatk_khusus = userResult.rows[0].ppatk_khusus;
            
            if (!ppatk_khusus) {
                throw new Error('User does not have ppatk_khusus assigned');
            }
            
            // Let database trigger generate nobooking automatically
            // Trigger trg_nobooking will handle nobooking generation based on ppatk_khusus and year
            console.log('📝 [PPATK] Letting database trigger generate nobooking for ppatk_khusus:', ppatk_khusus);
            
            console.log('📝 [PPATK] Starting transaction for booking creation...');
            
            // Start transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                
                // 1. Insert booking data (parent table) - let trigger generate nobooking
                const insertBookingQuery = `
                    INSERT INTO pat_1_bookingsspd (
                        jenis_wajib_pajak,
                        userid,
                        noppbb,
                        namawajibpajak,
                        alamatwajibpajak,
                        namapemilikobjekpajak,
                        alamatpemilikobjekpajak,
                        tanggal,
                        tahunajb,
                        kabupatenkotawp,
                        kecamatanwp,
                        kelurahandesawp,
                        rtrwwp,
                        npwpwp,
                        kodeposwp,
                        kabupatenkotaop,
                        kecamatanop,
                        kelurahandesaop,
                        rtrwop,
                        npwpop,
                        kodeposop,
                        trackstatus
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                    RETURNING nobooking
                `;
                
                const bookingParams = [
                    jenis_wajib_pajak,
                    userid,
                    noppbb,
                    namawajibpajak,
                    alamatwajibpajak,
                    namapemilikobjekpajak,
                    alamatpemilikobjekpajak,
                    tanggal,
                    tahunajb,
                    kabupatenkotawp,
                    kecamatanwp,
                    kelurahandesawp,
                    rtrwwp,
                    npwpwp,
                    kodeposwp,
                    kabupatenkotaop,
                    kecamatanop,
                    kelurahandesaop,
                    rtrwop,
                    npwpop,
                    kodeposop,
                    trackstatus
                ];
                
                const bookingResult = await client.query(insertBookingQuery, bookingParams);
                
                if (bookingResult.rows.length === 0) {
                    throw new Error('Failed to create booking');
                }
                
                const createdNobooking = bookingResult.rows[0].nobooking;
                console.log('✅ [PPATK] Booking created:', createdNobooking);
                
                // Use the nobooking returned from database
                const finalNobooking = createdNobooking;
                
                // 2. Insert BPHTB perhitungan (pat_2_bphtb_perhitungan)
                if (nilaiPerolehanObjekPajakTidakKenaPajak !== undefined) {
                    const insertBphtbQuery = `
                        INSERT INTO pat_2_bphtb_perhitungan (
                            nilaiperolehanobjekpajaktidakkenapajak,
                            bphtb_yangtelah_dibayar,
                            nobooking
                        ) VALUES ($1, $2, $3)
                        RETURNING calculationid
                    `;
                    
                    const bphtbParams = [
                        nilaiPerolehanObjekPajakTidakKenaPajak,
                        bphtb_yangtelah_dibayar || 0,
                        finalNobooking
                    ];
                    
                    const bphtbResult = await client.query(insertBphtbQuery, bphtbParams);
                    console.log('✅ [PPATK] BPHTB perhitungan created:', bphtbResult.rows[0].calculationid);
                }
                
                // 3. Insert objek pajak (pat_4_objek_pajak)
                if (letaktanahdanbangunan !== undefined) {
                    const insertObjekQuery = `
                        INSERT INTO pat_4_objek_pajak (
                            letaktanahdanbangunan,
                            rt_rwobjekpajak,
                            status_kepemilikan,
                            keterangan,
                            nomor_sertifikat,
                            tanggal_perolehan,
                            tanggal_pembayaran,
                            nomor_bukti_pembayaran,
                            nobooking,
                            harga_transaksi,
                            kelurahandesalp,
                            kecamatanlp,
                            jenis_perolehan
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        RETURNING id
                    `;
                    
                    // Normalize status_kepemilikan to match constraint values
                    let normalizedStatusKepemilikan = 'Milik Pribadi'; // default
                    if (status_kepemilikan) {
                        const statusMap = {
                            'milik_pribadi': 'Milik Pribadi',
                            'milik_bersama': 'Milik Bersama',
                            'sewa': 'Sewa',
                            'hak_guna_bangunan': 'Hak Guna Bangunan',
                            'Milik Pribadi': 'Milik Pribadi',
                            'Milik Bersama': 'Milik Bersama',
                            'Sewa': 'Sewa',
                            'Hak Guna Bangunan': 'Hak Guna Bangunan'
                        };
                        normalizedStatusKepemilikan = statusMap[status_kepemilikan] || 'Milik Pribadi';
                    }
                    
                    console.log('📝 [PPATK] Status kepemilikan mapping:', {
                        original: status_kepemilikan,
                        normalized: normalizedStatusKepemilikan
                    });
                    
                    const objekParams = [
                        letaktanahdanbangunan,
                        rt_rwobjekpajak || '',
                        normalizedStatusKepemilikan,
                        keterangan || '',
                        nomor_sertifikat || '',
                        tanggal_perolehan || '',
                        tanggal_pembayaran || '',
                        nomor_bukti_pembayaran || '',
                        finalNobooking,
                        hargatransaksi || '',
                        kelurahandesalp || '',
                        kecamatanlp || '',
                        jenisPerolehan || ''
                    ];
                    
                    const objekResult = await client.query(insertObjekQuery, objekParams);
                    console.log('✅ [PPATK] Objek pajak created:', objekResult.rows[0].id);
                }
                
                // 4. Insert NJOP perhitungan (pat_5_penghitungan_njop)
                if (luas_tanah !== undefined && njop_tanah !== undefined) {
                    const insertNjopQuery = `
                        INSERT INTO pat_5_penghitungan_njop (
                            nobooking,
                            luas_tanah,
                            njop_tanah,
                            luas_bangunan,
                            njop_bangunan,
                            total_njoppbb,
                            created_at,
                            updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id
                    `;
                    
                    const njopParams = [
                        finalNobooking,
                        luas_tanah,
                        njop_tanah,
                        luas_bangunan || 0,
                        njop_bangunan || 0,
                        total_njoppbb || 0
                    ];
                    
                    const njopResult = await client.query(insertNjopQuery, njopParams);
                    console.log('✅ [PPATK] NJOP perhitungan created:', njopResult.rows[0].id);
                }
                
                // 5. Insert tanda tangan dengan path dari user profile (pat_6_sign)
                // Ambil tanda tangan user dari a_2_verified_users
                const getUserSignatureQuery = `
                    SELECT 
                        nama,
                        tanda_tangan_path,
                        tanda_tangan_mime,
                        divisi
                    FROM a_2_verified_users 
                    WHERE userid = $1
                `;
                
                const userSignatureResult = await client.query(getUserSignatureQuery, [userid]);
                
                if (userSignatureResult.rows.length === 0) {
                    throw new Error('User not found in a_2_verified_users');
                }
                
                const userData = userSignatureResult.rows[0];
                const userNama = userData.nama || namawajibpajak || 'Nama User';
                const userSignaturePath = userData.tanda_tangan_path;
                const userSignatureMime = userData.tanda_tangan_mime;
                const userDivisi = userData.divisi;
                
                console.log('📝 [PPATK] User signature data:', {
                    userid,
                    nama: userNama,
                    divisi: userDivisi,
                    has_signature: !!userSignaturePath,
                    signature_path: userSignaturePath,
                    signature_mime: userSignatureMime
                });
                
                // Insert tanda tangan dengan path dari user profile
                const insertSignQuery = `
                    INSERT INTO pat_6_sign (
                        nobooking,
                        userid,
                        nama,
                        path_ttd_ppatk
                    ) VALUES ($1, $2, $3, $4)
                    RETURNING id
                `;
                
                const signParams = [
                    finalNobooking,
                    userid,
                    userNama,
                    userSignaturePath // Path tanda tangan dari user profile
                ];
                
                const signResult = await client.query(insertSignQuery, signParams);
                console.log('✅ [PPATK] Sign record created with user signature:', {
                    id: signResult.rows[0].id,
                    nobooking: finalNobooking,
                    userid,
                    nama: userNama,
                    path_ttd_ppatk: userSignaturePath,
                    divisi: userDivisi
                });
                
                // Commit transaction
                await client.query('COMMIT');
                
                console.log('✅ [PPATK] All booking data created successfully:', {
                    nobooking: finalNobooking,
                    userid,
                    trackstatus
                });
                
                res.json({
                    success: true,
                    message: 'Booking dan semua data terkait berhasil dibuat',
                    nobooking: finalNobooking,
                    data: {
                        nobooking: finalNobooking,
                        userid,
                        trackstatus,
                        tables_created: [
                            'pat_1_bookingsspd',
                            'pat_2_bphtb_perhitungan',
                            'pat_4_objek_pajak',
                            'pat_5_penghitungan_njop',
                            'pat_6_sign'
                        ]
                    }
                });
                
            } catch (error) {
                // Rollback transaction on error
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
            
        } catch (error) {
            console.error('❌ [PPATK] Create booking failed:', error);
            res.status(500).json({
                success: false,
                message: 'Gagal membuat booking dan perhitungan BPHTB',
                error: error.message
            });
        }
    });
}
