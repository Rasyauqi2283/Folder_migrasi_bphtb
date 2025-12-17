import { Router } from 'express';

const router = Router();

/**
 * Public QR Code Validation Routes
 * Endpoint untuk validasi dokumen oleh publik (tanpa authentication)
 */

export default function registerPublicValidationRoutes({ pool, logger }) {
  
  // GET /api/public/validate-qr/:no_validasi - Validasi nomor validasi QR code (Public)
  router.get('/validate-qr/:no_validasi', async (req, res) => {
    try {
      const { no_validasi } = req.params;
      const clientIp = req.ip || req.connection.remoteAddress;

      console.log(`🔍 [PUBLIC] QR validation request from ${clientIp} for no_validasi: ${no_validasi}`);

      // Validasi format no_validasi
      if (!no_validasi || typeof no_validasi !== 'string' || no_validasi.trim().length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nomor validasi tidak valid' 
        });
      }

      // Query untuk mendapatkan data validasi lengkap (public version)
      const validationQuery = `
        SELECT 
          pv.no_validasi,
          pv.nobooking,
          pv.no_registrasi,
          pv.namawajibpajak,
          pv.namapemilikobjekpajak,
          pv.status,
          pv.trackstatus,
          pv.status_tertampil,
          pv.created_at,
          pv.updated_at,
          -- Data booking (limited info for public)
          pb.noppbb,
          pb.tanggal,
          pb.tahunajb,
          pb.trackstatus as booking_trackstatus,
          -- Data user PPAT (limited)
          vu.nama as ppat_nama,
          vu.special_field as ppat_special_field,
          vu.divisi as ppat_divisi,
          -- Data peneliti validasi (limited)
          avpv.nama as peneliti_nama,
          avpv.special_parafv as peneliti_special_parafv,
          avpv.nip as peneliti_nip
        FROM pv_1_paraf_validate pv
        LEFT JOIN pat_1_bookingsspd pb ON pv.nobooking = pb.nobooking
        LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
        LEFT JOIN a_2_verified_users avpv ON avpv.tanda_tangan_path = pv.tanda_tangan_validasi_path
        WHERE pv.no_validasi = $1 
          AND pv.status = 'Divalidasi'
        LIMIT 1
      `;

      const result = await pool.query(validationQuery, [no_validasi.trim()]);

      if (result.rows.length === 0) {
        console.log(`❌ [PUBLIC] Validation not found for no_validasi: ${no_validasi}`);
        return res.status(404).json({ 
          success: false, 
          message: 'Nomor validasi tidak ditemukan atau dokumen belum divalidasi',
          no_validasi: no_validasi
        });
      }

      const validationData = result.rows[0];

      // Catat log akses validasi publik untuk audit trail
      try {
        await pool.query(
          'INSERT INTO log_file_access(admin_name, userid, ip, user_agent, access_time) VALUES($1, $2, $3, $4, NOW())',
          [
            'PUBLIC_ACCESS',
            `QR_VALIDATION_PUBLIC_${no_validasi}`,
            clientIp,
            req.headers['user-agent'] || 'Unknown'
          ]
        );
        console.log(`📝 [AUDIT] Public QR validation logged for no_validasi: ${no_validasi}`);
      } catch (logError) {
        console.error('❌ [AUDIT] Failed to log public QR validation access:', logError);
        // Don't fail request if logging fails
      }

      // Format response dengan informasi keaslian (public version - limited info)
      const response = {
        success: true,
        message: 'Dokumen asli dan terverifikasi oleh sistem E-BPHTB Kabupaten Bogor',
        validation_info: {
          no_validasi: validationData.no_validasi,
          status: validationData.status,
          trackstatus: validationData.trackstatus,
          status_tertampil: validationData.status_tertampil,
          tanggal_validasi: validationData.updated_at || validationData.created_at
        },
        document_info: {
          nobooking: validationData.nobooking,
          no_registrasi: validationData.no_registrasi,
          noppbb: validationData.noppbb,
          tanggal: validationData.tanggal,
          tahunajb: validationData.tahunajb,
          namawajibpajak: validationData.namawajibpajak,
          namapemilikobjekpajak: validationData.namapemilikobjekpajak,
          booking_trackstatus: validationData.booking_trackstatus
        },
        ppat_info: {
          nama: validationData.ppat_nama,
          special_field: validationData.ppat_special_field,
          divisi: validationData.ppat_divisi
        },
        peneliti_info: {
          nama: validationData.peneliti_nama,
          special_parafv: validationData.peneliti_special_parafv,
          nip: validationData.peneliti_nip
        },
        authenticity: {
          verified: true,
          verified_by: 'BAPPENDA Kabupaten Bogor',
          verified_at: validationData.updated_at || validationData.created_at,
          verification_method: 'QR Code Digital Certificate',
          institution: 'Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor'
        }
      };

      console.log(`✅ [PUBLIC] QR validation successful for no_validasi: ${no_validasi}`);
      return res.json(response);

    } catch (error) {
      console.error('❌ [PUBLIC] QR validation error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Terjadi kesalahan saat memvalidasi nomor validasi'
      });
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Public validation API is running',
      timestamp: new Date().toISOString()
    });
  });

  return router;
}

