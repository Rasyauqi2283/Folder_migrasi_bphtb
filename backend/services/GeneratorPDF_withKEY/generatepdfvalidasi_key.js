// clean code generator pdf validasi key
// 1 api /api/generatepdfvalidasi_key
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { saveQrToPublic, generateQrWithValidasi, generateQrPayload, generateQrWithValidasiFromDB, generateQrPayloadFromDB } from '../../utils/qrcode.js';

function formatNumber(num) {
    const n = Number(num || 0);
    return n.toLocaleString('id-ID');
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
}

export async function buildValidasiPdf({ pool, nobooking, noValidasi, outputPath, pvName, pvNip, pvTitle, pvCn, qrImageAbsPath, passphrase, pvUserid = null }) {
    // 1) Ambil data booking dan objek pajak dari DB
    const { rows } = await pool.query(
        `SELECT 
            pb.*, bp.*, pp.*, 
            o.letaktanahdanbangunan, o.rt_rwobjekpajak, o.status_kepemilikan, o.keterangan,
            o.nomor_sertifikat, o.tanggal_perolehan, o.tanggal_pembayaran, o.nomor_bukti_pembayaran,
            o.harga_transaksi, o.kelurahandesalp, o.kecamatanlp, o.jenis_perolehan,
            -- Data pembuat booking (PPAT/Notaris)
            vu.nama AS ppat_nama, vu.special_field AS ppat_special_field, 
            vu.pejabat_umum AS ppat_pejabat_umum, vu.nip AS ppat_nip,
            pav.no_validasi
        FROM pat_1_bookingsspd pb
        LEFT JOIN pat_2_bphtb_perhitungan bp ON pb.nobooking = bp.nobooking
        LEFT JOIN pat_4_objek_pajak o ON pb.nobooking = o.nobooking
        LEFT JOIN pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking
        LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
        LEFT JOIN pv_1_paraf_validate pav ON pb.nobooking = pav.nobooking
        WHERE pb.nobooking = $1
        LIMIT 1`,
        [nobooking]
    );
    if (rows.length === 0) {
        throw new Error('Data tidak ditemukan untuk nobooking ' + nobooking);
    }
    const data = rows[0];
    
    // 2) Ambil data PV user (yang melakukan validasi) secara terpisah
    let pvUserData = { nip: '', special_parafv: '', subject_cn: '', cert_created_at: null };
    if (pvUserid) {
        try {
            // Get PV user profile
            const pvUserQ = await pool.query(
                `SELECT nip, special_parafv FROM a_2_verified_users WHERE userid = $1 LIMIT 1`,
                [pvUserid]
            );
            if (pvUserQ.rows.length > 0) {
                pvUserData.nip = pvUserQ.rows[0].nip || '';
                pvUserData.special_parafv = pvUserQ.rows[0].special_parafv || '';
            }
            
            // Get PV user's active certificate
            const pvCertQ = await pool.query(
                `SELECT subject_cn, created_at FROM pv_local_certs 
                 WHERE userid = $1 AND status = 'active' 
                 ORDER BY valid_to DESC LIMIT 1`,
                [pvUserid]
            );
            if (pvCertQ.rows.length > 0) {
                pvUserData.subject_cn = pvCertQ.rows[0].subject_cn || '';
                pvUserData.cert_created_at = pvCertQ.rows[0].created_at || null;
            }
            
            console.log('[PDF-PV] PV User data fetched:', pvUserData);
        } catch (e) {
            console.warn('[PDF-PV] Failed to fetch PV user data:', e.message);
        }
    }
    
    // Use provided params as fallback, then fetched data
    const finalPvNip = pvUserData.nip || pvNip || '';
    const finalPvSpecialParafv = pvUserData.special_parafv || pvTitle || '';
    const finalPvSubjectCn = pvUserData.subject_cn || pvCn || 'Kepala Bidang Pelayanan dan Penetapan';
    const certCreatedAt = pvUserData.cert_created_at || new Date();

    // 2) Siapkan stream file
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const writeStream = fs.createWriteStream(outputPath);

    // 3) Bangun PDF meniru layout /api/contoh-noval (posisi sama, data dari DB)
    const doc = new PDFDocument({ 
      margin: 40, 
      size: 'A4',
      security: {
          ownerPassword: passphrase, // Ganti dengan kata sandi yang kuat
          permissions: {
              modifying: false,
              copying: false,
              printing: 'highResolution'
          }
      }
    });
    doc.pipe(writeStream);

    // === HEADER ===
    doc.moveTo(50, 35).lineTo(550, 35).stroke();
    const logoPath = path.join(process.cwd(), 'public', 'asset', 'Logobappenda_pdf.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60 });
    }
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('BUKTI VALIDASI', 120, 50, { align: 'center', width: 400 })
      .fontSize(12)
      .font('Helvetica')
      .text('PELAPORAN SURAT SETORAN PAJAK DAERAH', 120, 70, { align: 'center', width: 400 })
      .text('BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN', 120, 85, { align: 'center', width: 400 })
      .text('(SSPD-BPHTB)', 120, 100, { align: 'center', width: 400 });

    // Garis pemisah
    doc.moveTo(115, 35).lineTo(115, 115).stroke();
    doc.moveTo(50, 115).lineTo(550, 115).stroke();
    doc.moveTo(50, 35).lineTo(50, 570).stroke();
    doc.moveTo(550, 35).lineTo(550, 570).stroke();
    doc.fontSize(7)
      .text('BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR', 55, 117.5, { align: 'left' });
    doc.moveTo(50, 125).lineTo(550, 125).stroke();

    // === BAGIAN A - DATA WAJIB PAJAK ===
    const boxA_Y = 127;
    doc.fontSize(9)
      .font('Helvetica-Bold')
      .text('A. DATA WAJIB PAJAK', 55, boxA_Y + 5)
      .font('Helvetica')
      .text('1. Nama Wajib Pajak', 55, boxA_Y + 15)
      .text('2. NPWPD/KTP', 55, boxA_Y + 25)
      .text('3. Alamat Wajib Pajak', 55, boxA_Y + 35)
      .text('4. Kode Pos', 55, boxA_Y + 45)
      .text(': ' + (data.namawajibpajak || ''), 205, boxA_Y + 15)
      .text(': ' + (data.npwpwp || ''), 205, boxA_Y + 25)
      .text(': ' + (data.alamatwajibpajak || ''), 205, boxA_Y + 35)
      .text(': ' + (data.kodeposwp || ''), 205, boxA_Y + 45)
      .text('5. RT / RW', 355, boxA_Y + 15)
      .text('6. Desa / Kelurahan', 355, boxA_Y + 25)
      .text('7. Kecamatan', 355, boxA_Y + 35)
      .text('8. Kabupaten / Kota', 355, boxA_Y + 45)
      .text(': ' + (data.rtrwwp || ''), 455, boxA_Y + 15)
      .text(': ' + (data.kelurahandesawp || ''), 455, boxA_Y + 25)
      .text(': ' + (data.kecamatanwp || ''), 455, boxA_Y + 35)
      .text(': ' + (data.kabupatenkotawp || ''), 455, boxA_Y + 45);
    doc.moveTo(50, boxA_Y + 65).lineTo(550, boxA_Y + 65).stroke();

    // === BAGIAN B - DATA OBJEK PAJAK ===
    const boxB_Y = boxA_Y + 70;
    doc.font('Helvetica-Bold')
      .text('B. DATA OBJEK PAJAK', 55, boxB_Y + 5)
      .font('Helvetica')
      .text('1. NOP PBB', 55, boxB_Y + 20)
      .text('2. Objek Lokasi Pajak', 55, boxB_Y + 30)
      .text('4. Desa / Kelurahan', 55, boxB_Y + 40)
      .text(': ' + (data.noppbb || ''), 205, boxB_Y + 20)
      .text(': ' + (data.letaktanahdanbangunan || ''), 205, boxB_Y + 30)
      .text(': ' + (data.kelurahandesalp || ''), 205, boxB_Y + 40)
      .text('3. RT / RW', 355, boxB_Y + 20)
      .text('5. Kecamatan', 355, boxB_Y + 30)
      .text('6. Kabupaten', 355, boxB_Y + 40)
      .text('7. Kode Pos', 355, boxB_Y + 50)
      .text(': ' + (data.rt_rwobjekpajak || ''), 455, boxB_Y + 20)
      .text(': ' + (data.kecamatanlp || ''), 455, boxB_Y + 30)
      .text(': BOGOR', 455, boxB_Y + 40)
      .text(': ' + (data.kodeposop || ''), 455, boxB_Y + 50);

    // === TABEL PERHITUNGAN NJOP ===
    const njopTop = boxB_Y + 65;
    doc.font('Helvetica-Bold')
      .text('Perhitungan NJOP PBB :', 55, njopTop - 10);

    // Header tabel NJOP
    doc.rect(50, njopTop, 500, 20).stroke();
    doc.moveTo(120, njopTop).lineTo(120, njopTop + 20).stroke();
    doc.moveTo(250, njopTop).lineTo(250, njopTop + 20).stroke();
    doc.moveTo(380, njopTop).lineTo(380, njopTop + 20).stroke();
    doc.font('Helvetica')
      .text('Objek Pajak', 60, njopTop + 5)
      .text('Luas/m2', 180, njopTop + 5)
      .text('NJOP PBB / m2', 280, njopTop + 5)
      .text('Luas x NJOP PBB /m2', 400, njopTop + 5);

    // Baris data NJOP
    const luasTanah = Number(data.luas_tanah || 0);
    const njopTanah = Number(data.njop_tanah || 0);
    const luasBangunan = Number(data.luas_bangunan || 0);
    const njopBangunan = Number(data.njop_bangunan || 0);
    const tanahVal = luasTanah * njopTanah;
    const bangunanVal = luasBangunan * njopBangunan;
    const totalNJOP = tanahVal + bangunanVal;

    const njopRows = [
        { objek: 'Tanah (Bumi)', no: '8.', luas: `${luasTanah} m2`, no2: '10.', njop: `Rp ${formatNumber(njopTanah)}`, no3: '12.', total: `Rp ${formatNumber(tanahVal)}` },
        { objek: 'Bangunan', no: '9.', luas: `${luasBangunan} m2`, no2: '11.', njop: `Rp ${formatNumber(njopBangunan)}`, no3: '13.', total: `Rp ${formatNumber(bangunanVal)}` }
    ];
    njopRows.forEach((row, index) => {
        const y = njopTop + 20 + (index * 20);
        doc.rect(50, y, 500, 20).stroke();
        doc.moveTo(120, y).lineTo(120, y + 20).stroke();
        doc.moveTo(140, y).lineTo(140, y + 20).stroke();
        doc.moveTo(250, y).lineTo(250, y + 20).stroke();
        doc.moveTo(270, y).lineTo(270, y + 20).stroke();
        doc.moveTo(380, y).lineTo(380, y + 35).stroke();
        doc.moveTo(400, y).lineTo(400, y + 35).stroke();

        doc.font('Helvetica')
          .text(row.objek, 55, y + 5)
          .text(row.no, 125, y + 5)
          .text(row.luas, 150, y + 5)
          .text(row.no2, 255, y + 5)
          .text(row.njop, 275, y + 5)
          .text(row.no3, 385, y + 5)
          .text(row.total, 410, y + 5);
    });
    const totalY = njopTop + 60;
    doc.rect(380, totalY, 170, 15).stroke();
    doc.font('Helvetica')
      .text('14.', 385, totalY + 5)
      .font('Helvetica-Bold')
      .text(`Rp ${formatNumber(totalNJOP)}`, 410, totalY + 5);

    // Informasi tambahan 15-17

    // Buat mapping dari kode ke teks jenis perolehan
const jenisPerolehanMap = {
    '01': 'Jual Beli',
    '02': 'Tukar Menukar',
    '03': 'Hibah',
    '04': 'Pemasukan dalam Perseroan',
    '05': 'Pemisahan Hak',
    '06': 'Pelepasan Hak',
    '07': 'Penunjukan Pembeli dalam Lelang',
    '08': 'Pelaksanaan Putusan Hakim',
    '09': 'Penggabungan Usaha',
    '10': 'Pemekaran Usaha',
    '11': 'Hadiah',
    '12': 'Warisan',
    '13': 'Pemberian Hak Baru',
    '14': 'Kelanjutan Pelepasan Hak',
    '15': 'Pemindahan Hak',
    // ... tambahkan sesuai kebutuhan sampai 33
    '33': 'Lainnya'
  };
  
  // Ambil kode dan teks dari database
  const kodePerolehan = String(data.jenis_perolehan || '').padStart(2, '0'); // pastikan 2 digit
  const teksPerolehan = jenisPerolehanMap[kodePerolehan] || 'Tidak Diketahui';
  
    //
    doc.font('Helvetica')
      .text('15. Jenis Perolehan hak atas tanah dan/atau bangunan :', 55, totalY + 5)
      .rect(70, totalY + 15, 20, 15).stroke()
      .text(kodePerolehan, 75, totalY + 18)  // Kode angka di dalam kotak
      .text(teksPerolehan, 95, totalY + 18) // Teks di sebelah kanan kotak
      .text('16. Harga transaksi / Nilai pasar', 55, totalY + 35)
      .text(':', 190, totalY + 35)
      .text('Rp', 200, totalY + 35)
      .rect(213, totalY + 30, 160, 15).stroke()
      .text(formatNumber(data.harga_transaksi || 0), 215, totalY + 35, { align: 'left' })
      .text('17. Nomor Sertifikat Tanah', 55, totalY + 50)
      .text(':', 190, totalY + 50)
      .text(String(data.nomor_sertifikat || ''), 200, totalY + 50);

    // === BAGIAN C - PERHITUNGAN BPHTB ===
    const bphtbTop = totalY + 60;
    doc.font('Helvetica-Bold')
      .text('C. PENGHITUNGAN BPHTB', 55, bphtbTop + 5)
      .text('Dalam Rupiah', 420, bphtbTop + 5);
    doc.moveTo(50, bphtbTop).lineTo(550, bphtbTop).stroke();
    doc.moveTo(375, bphtbTop).lineTo(375, bphtbTop + 150).stroke();

    // Perhitungan NPOP: bandingkan harga_transaksi vs total_njoppbb, ambil yang lebih besar
    const hargaTransaksi = Number(data.harga_transaksi || 0);
    const totalNJOPPBB = totalNJOP; // Sudah dihitung di atas
    const npop = Math.max(hargaTransaksi, totalNJOPPBB);
    
    const npoptkp = Number(data.npop_tkp || data.nilaiPerolehanObjekPajakTidakKenaPajak || 60000000);
    const npopkp = Math.max(0, npop - npoptkp);
    const bphtbTerutang = Math.round(0.05 * npopkp);
    const pengurangan = 0;
    const denda = 0;
    const harusDibayar = bphtbTerutang - pengurangan - denda;
    const telahDibayar = Number(data.bphtb_yangtelah_dibayar || 0);
    const kurangDibayar = Math.max(0, harusDibayar - telahDibayar);

    const bphtbData = [
        { label: '1. Nilai Perolehan Objek Pajak (NPOP)', formula: '', code: '1', value: formatNumber(npop) },
        { label: '2. Nilai Perolehan Objek Pajak Tidak Kena Pajak (NPOPTKP)', formula: '', code: '2', value: formatNumber(npoptkp) },
        { label: '3. Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP)', formula: '1 - 2', code: '3', value: formatNumber(npopkp) },
        { label: '4. Bea Perolehan Hak atas Tanah dan Bangunan yang terutang', formula: '5 % x 3', code: '4', value: formatNumber(bphtbTerutang) },
        { label: '5. Pengurangan  0,00    %', formula: '% x angka', code: '5', value: String(pengurangan) },
        { label: '6. Denda  0,00', formula: '', code: '', value: '0,00' },
        { label: '7. Bea Perolehan Hak atas Tanah dan Bangunan yang harus dibayar', formula: '4 - 6', code: '6', value: formatNumber(harusDibayar) },
        { label: '8. Bea Perolehan Hak atas Tanah dan Bangunan yang telah dibayar', formula: '7', code: '7', value: formatNumber(telahDibayar) },
        { label: '9. Bea Perolehan Hak atas Tanah dan Bangunan yang kurang dibayar', formula: '7 - 8', code: '9', value: formatNumber(kurangDibayar) }
    ];
    const colX = [50, 330, 430, 450, 550];
    bphtbData.forEach((row, index) => {
        const y = bphtbTop + 15 + (index * 15);
        doc.rect(colX[0], y, colX[4] - colX[0], 15).stroke();
        doc.moveTo(colX[2], y).lineTo(colX[2], y + 15).stroke();
        doc.moveTo(colX[3], y).lineTo(colX[3], y + 15).stroke();
        doc.font('Helvetica')
          .text(row.label, colX[0] + 5, y + 3, { width: colX[1] - colX[0] + 20, align: 'left' })
          .text(row.formula, colX[1] + 50, y + 3, { width: colX[2] - colX[1] - 10, align: 'left' })
          .text(row.code, colX[2] + 5, y + 3, { width: colX[3] - colX[2] - 10, align: 'center' })
          .text(row.value, colX[3] + 5, y + 3, { width: colX[4] - colX[3] - 10, align: 'right' });
    });
    doc.moveTo(colX[0], bphtbTop + 15).lineTo(colX[4], bphtbTop + 15).stroke();

    // === BAGIAN D - JUMLAH SETORAN ===
    const boxD_Y = bphtbTop + (bphtbData.length * 16) + 5;
    doc.moveTo(50, boxD_Y + 40).lineTo(550, boxD_Y + 40).stroke();
    doc.font('Helvetica-Bold')
      .text('D. Jumlah Setoran berdasarkan Perhitungan WP dan :', 55, boxD_Y + 5)
      .font('Helvetica')
      .text('Nomor SKPDKB:', 55, boxD_Y + 25)
      .text('Tanggal:', 380, boxD_Y + 25);

    // === FOOTER ===
    const footerY = boxD_Y + 50;
    
    // LEFT SIDE: Booking info + PPAT info
    doc.text('No Booking', 55, footerY);
    doc.text(String(data.nobooking || ''), 55, footerY + 10);
    
    doc.text('Tgl Bayar', 55, footerY + 30);
    // tanggal_pembayaran dari pat_4_objek_pajak
    const tglBayar = data.tanggal_pembayaran;
    let tglBayarFormatted = 'Invalid Date';
    if (tglBayar) {
        // Handle berbagai format tanggal
        if (typeof tglBayar === 'string' && tglBayar.includes('-')) {
            // Format: DD-MM-YYYY atau YYYY-MM-DD
            const parts = tglBayar.split('-');
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                tglBayarFormatted = formatDate(new Date(tglBayar));
            } else {
                // DD-MM-YYYY
                const [day, month, year] = parts;
                tglBayarFormatted = formatDate(new Date(`${year}-${month}-${day}`));
            }
        } else if (tglBayar instanceof Date) {
            tglBayarFormatted = formatDate(tglBayar);
        } else {
            tglBayarFormatted = String(tglBayar);
        }
    }
    doc.text(tglBayarFormatted, 55, footerY + 40);
    
    doc.text('No Validasi', 55, footerY + 60);
    const nv = String(noValidasi || data.no_validasi || '').trim();
    doc.text(nv || '-', 55, footerY + 70);
    
    // PPAT/PPATS/NOTARIS: pejabat_umum dari a_2_verified_users (pembuat booking)
    doc.text('PPAT / PPATS / NOTARIS', 55, footerY + 90);
    const ppatJenis = data.ppat_pejabat_umum || data.pejabat_umum || 'Tidak diketahui';
    doc.text(ppatJenis, 55, footerY + 100);

    // RIGHT SIDE: Tanda tangan PV + QR
    const rightX = 350;
    doc.text('Cibinong, ' + formatDate(new Date()), rightX, footerY, { align: 'center' });
    doc.text('Mengetahui,', rightX, footerY + 15, { align: 'center' });
    
    // subject_cn dari pv_local_certs (sertifikat aktif PV user)
    doc.text(finalPvSubjectCn, rightX, footerY + 25, { align: 'center' });
    
    // Generate QR dengan format: NIP/DD/MM/YYYY/special_parafv//E-BPHTB BAPPENDA KAB BOGOR|nomor_validasi
    console.log(`[QR-DEBUG] Starting QR generation for nobooking: ${nobooking}`);
    console.log(`[QR-DEBUG] nv (final): ${nv}`);
    console.log(`[QR-DEBUG] pvUserid: ${pvUserid}`);
    console.log(`[QR-DEBUG] finalPvNip: ${finalPvNip}`);
    console.log(`[QR-DEBUG] finalPvSpecialParafv: ${finalPvSpecialParafv}`);
    console.log(`[QR-DEBUG] certCreatedAt: ${certCreatedAt}`);
    
    let qrAbsPath = qrImageAbsPath;
    
    // If QR path already provided and exists, use it
    if (qrAbsPath && fs.existsSync(qrAbsPath)) {
      console.log(`[QR-DEBUG] Using provided QR path: ${qrAbsPath}`);
    } else if (nv) {
      // Generate QR with proper format: NIP/DD/MM/YYYY/special_parafv//E-BPHTB BAPPENDA KAB BOGOR|nomor_validasi
      try {
        // Format tanggal sertifikat: DD/MM/YYYY
        const certDate = certCreatedAt instanceof Date ? certCreatedAt : new Date(certCreatedAt);
        const dd = String(certDate.getDate()).padStart(2, '0');
        const mm = String(certDate.getMonth() + 1).padStart(2, '0');
        const yyyy = certDate.getFullYear();
        const formattedCertDate = `${dd}/${mm}/${yyyy}`;
        
        // Build QR payload: NIP/DD/MM/YYYY/special_parafv//E-BPHTB BAPPENDA KAB BOGOR|nomor_validasi
        const qrPayload = `${finalPvNip}/${formattedCertDate}/${finalPvSpecialParafv}//E-BPHTB BAPPENDA KAB BOGOR|${nv}`;
        
        console.log(`[QR-PAYLOAD] Generated QR payload: ${qrPayload}`);
        
        const saved = await saveQrToPublic({ 
          filename: `validasi_${nv}`, 
          text: qrPayload, 
          size: 256 
        });
        qrAbsPath = saved.abs;
        console.log(`[QR-GENERATED] QR saved to: ${saved.path}`);
      } catch (qrError) {
        console.warn('[QR-WARN] Failed to generate QR:', qrError.message);
        qrAbsPath = null;
      }
    } else {
      console.warn('[QR-WARN] No validasi number, skipping QR generation');
      qrAbsPath = null;
    }

    if (qrAbsPath && fs.existsSync(qrAbsPath)) {
        doc.image(qrAbsPath, rightX + 50, footerY + 35, { width: 100 });
    } else {
        doc.text('Tempat QR CODE', rightX, footerY + 30, { align: 'center' });
    }
    
    // Di bawah QR: special_parafv dan nip dari a_2_verified_users (PV user)
    doc.text(finalPvSpecialParafv || 'Tidak diketahui', rightX, footerY + 160, { align: 'center' });
    doc.text(finalPvNip ? `NIP ${finalPvNip}` : 'NIP Tidak Diketahui', rightX, footerY + 170, { align: 'center' });

      doc.end();
      
    // 4) Tunggu selesai
    await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}
