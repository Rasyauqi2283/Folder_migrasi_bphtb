import PDFKitDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

/////Buat PDF Booking Badan Usaha/////
// Register route to generate PDF for PPAT booking (Badan Usaha)
export default function registerGeneratePdfBooking(app, pool) {
    app.get('/api/ppat_generate-pdf-badan/:nobooking', async (req, res) => {
        const { nobooking } = req.params;

        try {
            console.log('📄 [PDF-BADAN] Generating PDF for nobooking:', nobooking);
            
            // Get user data from verified_users table instead of pat_1_bookingsspd
            const trackingresult = await pool.query(`
                SELECT 
                    pb.userid,
                    vu.nama
                FROM pat_1_bookingsspd pb
                LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
                WHERE pb.nobooking = $1
            `, [nobooking]);

            if (trackingresult.rows.length === 0) {
                return res.status(404).json({ message: 'Data untuk nobooking ini tidak ditemukan' });
            }

            const creator = trackingresult.rows[0];
            const { userid, nama } = creator;
            
            console.log('📄 [PDF-BADAN] Creator data:', { userid, nama });

            if (!userid || !nama) {
                console.error('❌ [PDF-BADAN] Missing userid or nama:', { userid, nama });
                return res.status(400).json({ success: false, message: 'User ID dan nama pembuat is required' });
            }

            // Test simple query first
            const testQuery = await pool.query(`
                SELECT COUNT(*) as count FROM pat_1_bookingsspd 
                WHERE userid = $1 AND nobooking = $2
            `, [userid, nobooking]);
            console.log('📄 [PDF-BADAN] Test query result:', testQuery.rows[0].count, 'records found');

            const result = await pool.query(`
                SELECT DISTINCT
                pb.nobooking, pb.noppbb, pb.userid, pb.jenis_wajib_pajak, pb.namawajibpajak, pb.alamatwajibpajak, 
                pb.namapemilikobjekpajak, pb.alamatpemilikobjekpajak, pb.tanggal, pb.tahunajb, 
                pb.kabupatenkotawp, pb.kecamatanwp, pb.kelurahandesawp, pb.rtrwwp, 
                pb.npwpwp, pb.kodeposwp, pb.kabupatenkotaop, pb.kecamatanop, pb.kelurahandesaop, pb.rtrwop, 
                pb.npwpop, pb.kodeposop, pb.akta_tanah_path, pb.sertifikat_tanah_path, pb.pelengkap_path, 
                pb.trackstatus, 
                bp.nilaiperolehanobjekpajaktidakkenapajak, bp.bphtb_yangtelah_dibayar, 
                o.harga_transaksi, o.letaktanahdanbangunan, o.rt_rwobjekpajak, o.status_kepemilikan, o.keterangan, 
                o.nomor_sertifikat, o.tanggal_perolehan, o.tanggal_pembayaran, o.nomor_bukti_pembayaran, o.kelurahandesalp, o.kecamatanlp, o.jenis_perolehan,
                vb.nama, vb.special_field, vb.tanda_tangan_path,
                pp.luas_tanah, pp.njop_tanah, pp.luas_bangunan, pp.njop_bangunan, pp.luasxnjop_tanah, pp.luasxnjop_bangunan, pp.total_njoppbb,
                ps.path_ttd_ppat, ps.path_ttd_wp,
                substring(ps.path_ttd_wp from '\\.([^\\.]*)$') as wp_ext,
                substring(ps.path_ttd_ppat from '\\.([^\\.]*)$') as ppat_ext
            FROM 
                pat_1_bookingsspd pb
            LEFT JOIN 
                pat_2_bphtb_perhitungan bp ON pb.nobooking = bp.nobooking
            LEFT JOIN 
                pat_4_objek_pajak o ON pb.nobooking = o.nobooking
            LEFT JOIN
                a_2_verified_users vb ON pb.userid = vb.userid
            LEFT JOIN
                pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking 
            LEFT JOIN
                pat_6_sign ps ON pb.nobooking = ps.nobooking
            WHERE 
                pb.userid = $1 AND pb.nobooking = $2`, [userid, nobooking]);

            console.log('📄 [PDF-BADAN] Main data query result:', result.rows.length, 'rows found');
            
            if (result.rows.length === 0) {
                console.error('❌ [PDF-BADAN] No main data found for userid:', userid, 'nobooking:', nobooking);
                return res.status(404).json({ message: 'Data not found' });
            }
            const data = result.rows[0];

            const doc = new PDFKitDocument({ margin: 30, size: 'A4' });
            doc.font('Helvetica');
            res.setHeader('Content-Type', 'application/pdf');
            const disposition = req.query.download ? 'attachment' : 'inline';
            res.setHeader('Content-Disposition', `${disposition}; filename="${nobooking}_document.pdf"`);
            doc.pipe(res);

            const logoPath = path.resolve(process.cwd(), 'public', 'asset', 'Logobappenda_pdf.png');
            const pageWidth = 595;
            const logoWidth = pageWidth * 0.11;
            try { doc.image(logoPath, 35, 30, { width: logoWidth }); } catch(_) {}

            doc.font('Helvetica-Bold').fontSize(16).text('SURAT SETORAN PAJAK DAERAH', 200, 40, { width: 450 });
            doc.font('Helvetica-Bold').fontSize(16).text('BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN', 130, 60, { width: 450 });
            doc.font('Helvetica-Bold').fontSize(16).text('(SSPD - BPHTB)', 260, 80, { width: 450 });
            doc.moveTo(0, 105).lineTo(700, 105).stroke();
            doc.font('Helvetica-Bold').fontSize(9).text('Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor', 40, 110, { width: 450 });
            const leftX = 50;
            const rightX = 150;
            doc.moveTo(30, 120).lineTo(30, 545).stroke();
            doc.moveTo(560, 120).lineTo(560, 545).stroke();
            doc.moveTo(0, 120).lineTo(700, 120).stroke();
            doc.font('Helvetica-Bold').fontSize(10)
                .text('No. Booking', leftX, 125)
                .text('No. NPWP', leftX, 140)
                .text('Nama Wajib Pajak', leftX, 155)
                .text('Alamat Wajib Pajak', leftX, 170)
                .text('Kabupaten/Kota', leftX, 195)
                .text('Kecamatan', leftX, 210)
                .text('Tahun AJB', leftX, 225)
                .text('Kelurahan/Desa', 320, 195)
                .text('RT/RW', 320, 210)
                .text('Kodepos', 320, 225);
            doc.font('Helvetica').fontSize(10)
                .text(':', rightX - 10, 125).text(data.nobooking, rightX, 125)
                .text(':', rightX - 10, 140).text(data.npwpwp, rightX, 140)
                .text(':', rightX - 10, 155).text(data.namawajibpajak, rightX, 155)
                .text(':', rightX - 10, 170).text(data.alamatwajibpajak, rightX, 170)
                .text(':', rightX - 10, 195).text(data.kabupatenkotawp, rightX, 195)
                .text(':', rightX - 10, 210).text(data.kecamatanwp, rightX, 210)
                .text(':', rightX - 10, 225).text(data.tahunajb, rightX, 225)
                .text(':', 420 - 10, 195).text(data.kelurahandesawp, 420, 195)
                .text(':', 420 - 10, 210).text(data.rtrwwp, 420, 210)
                .text(':', 420 - 10, 225).text(data.kodeposwp, 420, 225);
            doc.fontSize(10).text(`Jenis Wajib Pajak     : Badan Usaha`, 320, 125);

            function formatTanggal(tanggalString) {
                const [day, month, year] = (tanggalString || '').split('-');
                const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
                if (!day || !month || !year) return tanggalString || '';
                return `${day} ${bulan[parseInt(month) - 1]} ${year}`;
            }

            const tanggalPembayaran = data.tanggal_pembayaran;
            const tanggalPerolehan = data.tanggal_perolehan;
            const tanggalFormattedB = formatTanggal(tanggalPembayaran);
            const tanggalFormattedO = formatTanggal(tanggalPerolehan);

            doc.moveTo(30, 235).lineTo(560, 235).stroke();
            doc.font('Helvetica-Bold').fontSize(10)
                .text('Nomor Objek Pajak(NOP) PBB', leftX, 245)
                .text('Objek Tanah dan/atau Bangunan', leftX, 260)
                .text('Keterangan', leftX, 295)
                .text('RT/RW', leftX, 310)
                .text('Status Kepemilikan', leftX, 325)
                .text('Nomor Bukti Pembayaran', 320, 295)
                .text('Tanggal Perolehan', 320, 310)
                .text('Tanggal Pembayaran', 320, 325);
            doc.font('Helvetica').fontSize(10)
                .text(':', 230 - 10, 245).text(data.noppbb, 230, 245)
                .text(':', 230 - 10, 260).text(data.letaktanahdanbangunan, 230, 260)
                .text(':', rightX - 10, 295).text(data.keterangan, rightX, 295)
                .text(':', rightX - 10, 310).text(data.rt_rwobjekpajak, rightX, 310)
                .text(':', rightX - 10, 325).text(data.status_kepemilikan, rightX, 325)
                .text(':', 460 - 10, 295).text(data.nomor_bukti_pembayaran, 460, 295)
                .text(':', 460 - 10, 310).text(`${tanggalFormattedO}`, 460, 310)
                .text(':', 460 - 10, 325).text(`${tanggalFormattedB}`, 460, 325);

            doc.font('Helvetica-Bold').fontSize(10).text('Nomor Sertifikat', 320, 350)
                .text(':', 410 - 10, 350)
                .text(data.nomor_sertifikat, 410, 350);

            function formatCurrency(amount) {
                if (amount == null) return 'Rp 0.00';
                const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
                if (Number.isNaN(num)) return 'Rp 0.00';
                return 'Rp ' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            }
            function formatNumber(num) {
                if (num == null) return '0.00';
                const number = typeof num === 'string' ? parseFloat(num) : Number(num);
                if (Number.isNaN(number)) return '0.00';
                return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }

            const tableData = [['BPHTB', 'Luas/m²', 'NJOP PBB', 'Luas × NJOP PBB/m²'],
                ['Tanah (Bumi)', formatNumber(data.luas_tanah), formatCurrency(data.njop_tanah), formatCurrency(data.luasxnjop_tanah)],
                ['Bangunan', formatNumber(data.luas_bangunan), formatCurrency(data.njop_bangunan), formatCurrency(data.luasxnjop_bangunan)]
            ];

            const totalTanah = parseFloat(data.luasxnjop_tanah) || 0;
            const totalBangunan = parseFloat(data.luasxnjop_bangunan) || 0;
            const grandTotal = totalBangunan + totalTanah;

            function createTable(doc, dataArr, options = {}) {
                const config = { startX: 40, startY: 360, cellPadding: 4, rowHeight: 20, colWidths: [100, 80, 120, 180], ...options };
                let currentY = config.startY;
                const tableWidth = config.colWidths.reduce((a, b) => a + b, 0);
                doc.moveTo(config.startX, currentY).lineTo(config.startX + tableWidth, currentY).stroke();
                doc.font('Helvetica-Bold');
                dataArr[0].forEach((cell, i) => {
                    doc.text(cell, config.startX + config.colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY + config.cellPadding, { width: config.colWidths[i], align: 'center' });
                });
                currentY += config.rowHeight;
                doc.moveTo(config.startX, currentY).lineTo(config.startX + tableWidth, currentY).stroke();
                doc.font('Helvetica');
                for (let i = 1; i < dataArr.length; i++) {
                    dataArr[i].forEach((cell, j) => {
                        doc.text(cell, config.startX + config.colWidths.slice(0, j).reduce((a, b) => a + b, 0) + 5, currentY + config.cellPadding, { width: config.colWidths[j] - 10, align: j === 0 ? 'left' : 'right' });
                    });
                    currentY += config.rowHeight;
                }
                let currentX = config.startX;
                const dataEndY = currentY;
                doc.moveTo(currentX, config.startY).lineTo(currentX, dataEndY).stroke();
                currentX += config.colWidths[0];
                doc.moveTo(currentX, config.startY).lineTo(currentX, dataEndY).stroke();
                if (options.totals) {
                    const col3StartX = config.startX + config.colWidths[0] + config.colWidths[1];
                    const col4EndX = config.startX + tableWidth;
                    doc.moveTo(col3StartX, currentY).lineTo(col4EndX, currentY).stroke();
                    doc.font('Helvetica-Bold')
                        .text('TOTAL NILAI', col3StartX + 5, currentY + config.cellPadding, { width: config.colWidths[2], align: 'center' })
                        .text(formatCurrency(options.totals.grandTotal), col3StartX + config.colWidths[2] + 5, currentY + config.cellPadding, { width: config.colWidths[3] - 10, align: 'right' });
                    currentY += config.rowHeight;
                    doc.moveTo(520, 360).lineTo(520, 440).stroke();
                    doc.moveTo(40, 420).lineTo(520, 420).stroke();
                    currentX = col3StartX;
                    doc.moveTo(currentX, config.startY).lineTo(currentX, currentY).stroke();
                    currentX += config.colWidths[2];
                    doc.moveTo(currentX, config.startY).lineTo(currentX, currentY).stroke();
                    doc.moveTo(col3StartX, currentY).lineTo(config.startX + tableWidth, currentY).stroke();
                }
                doc.y = currentY + 20;
                return { endY: currentY };
            }

            createTable(doc, tableData, { totals: { tanah: totalTanah, bangunan: totalBangunan, grandTotal } });

            const hargaTransaksi = parseFloat(data.harga_transaksi) || 0;
            function getNilaiTerbesar(grand, harga) {
                const cleanGrand = typeof grand === 'string' ? parseFloat(grand.replace(/[^\d]/g, '')) : grand;
                const cleanHarga = typeof harga === 'string' ? parseFloat(harga.replace(/[^\d]/g, '')) : harga;
                return Math.max(cleanGrand || 0, cleanHarga || 0);
            }
            const nilaiTerbesar = getNilaiTerbesar(grandTotal, hargaTransaksi);
            const npoptkp = parseFloat(data.nilaiperolehanobjekpajaktidakkenapajak) || 0;
            const nilaidata_NPOPKP = Math.max(0, nilaiTerbesar - npoptkp);
            const pajakTerutang = nilaidata_NPOPKP * 0.05;
            const kurangBayar = Math.max(0, pajakTerutang - (data.bphtb_yangtelah_dibayar || 0));

            doc.font('Helvetica-Bold').fontSize(10).text('Penghitungan BPHTB', 40, 470);
            doc.font('Helvetica').fontSize(8).text('(Harga diisi berdasarkan penghitungan Wajib Pajak)', 145, 471.5);
            doc.moveTo(30, 480).lineTo(560, 480).moveTo(405, 480).lineTo(405, 545).moveTo(415, 480).lineTo(415, 545).stroke();
            doc.fontSize(9)
                .text('1. Nilai Perolehan Objek Pajak (NPOP) ', 40, 485)
                .text('2. Nilai Perolehan Objek Pajak Tidak Kena Pajak (NPOPTKP)', 40, 495)
                .text('3. Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP)', 40, 505)
                .text('4. Bea Perolehan Hak atas Tanah dan Bangunan yang terutang', 40, 515)
                .text('5. Bea Perolehan Hak atas Tanah dan Bangunan yang telah dibayar', 40, 525)
                .text('6. Bea Perolehan Hak atas Tanah dan Bangunan yang kurang dibayar', 40, 535);
            doc.fontSize(9)
                .text(`${formatCurrency(nilaiTerbesar)}`, 420, 485)
                .text(`${formatCurrency(data.nilaiperolehanobjekpajaktidakkenapajak)}`, 420, 495)
                .text(`${formatCurrency(nilaidata_NPOPKP)}`, 420, 505)
                .text(`${formatCurrency(pajakTerutang)}`, 420, 515)
                .text(`${formatCurrency(data.bphtb_yangtelah_dibayar)}`, 420, 525)
                .text(`${formatCurrency(kurangBayar)}`, 420, 535);
            doc.fontSize(8).text('1', 407, 485).text('2', 407, 495).text('3', 407, 505).text('4', 407, 515).text('5', 407, 525).text('6', 407, 535);
            doc.moveTo(320, 480).lineTo(320,545).moveTo(320, 493).lineTo(560,493).moveTo(320, 503).lineTo(560,503).moveTo(320, 513).lineTo(560,513).moveTo(320, 523).lineTo(560,523).moveTo(320, 533).lineTo(560,533).stroke();
            doc.fontSize(9).text('angka 1 - angka 2', 323, 505).text('5% x angka 3', 323, 515).text('angka 4 - angka 5', 323, 535);
            doc.moveTo(0, 545).lineTo(700,545).stroke();

            const selectionStartY = 550;
            doc.font('Helvetica-Bold').fontSize(10).text('Jumlah Setoran Berdasarkan:', 40, selectionStartY).moveTo(0, selectionStartY + 10).lineTo(700, selectionStartY + 10).stroke();

            function drawCheckbox(x, y, checked) {
                doc.rect(x, y, 12, 12).stroke();
                if (checked) { doc.font('ZapfDingbats').text('4', x + 2, y).font('Helvetica'); }
            }
            const pemilihan = data.pemilihan;
            const options = [
                { label: 'a. Penghitungan Wajib Pajak', value: 'penghitung_wajib_pajak', yPos: selectionStartY + 20, details: null },
                { label: 'b. STPD BPHTB/SKPDB KURANG BAYAR*)', value: 'stpd_kurangbayar', yPos: selectionStartY + 35, details: { nomor: data.nomorstpd, tanggal: data.tanggalstpd } },
                { label: 'c. Pengurangan dihitung sendiri menjadi:', value: 'dihitungsendiri', yPos: selectionStartY + 50, details: { persen: data.angkapersen, keterangan: data.keterangandihitungsendiri } },
                { label: 'd. ' + (data.isiketeranganlainnya || '.........'), value: 'lainnyapenghitungwp', yPos: selectionStartY + 65, details: null }
            ];
            options.forEach(opt => {
                const isChecked = pemilihan === opt.value;
                drawCheckbox(40, opt.yPos, isChecked);
                doc.font('Helvetica').fontSize(9).text(opt.label, 60, opt.yPos - 2);
                if (isChecked && opt.details) {
                    if (opt.value === 'stpd_kurangbayar') {
                        doc.text(`Nomor: ${opt.details.nomor || '______'}`, 300, opt.yPos + 35).text(`Tanggal: ${opt.details.tanggal || '______'}`, 400, opt.yPos + 35);
                    } else if (opt.value === 'dihitungsendiri') {
                        doc.text(`${opt.details.persen || '___'}% berdasarkan ${opt.details.keterangan || '......'}`, 300, opt.yPos + 50);
                    }
                }
            });
            doc.text('Nomor: ______', 300, selectionStartY + 35).text('Tanggal: ______', 400, selectionStartY + 35).text('% berdasarkan ......', 300, selectionStartY + 50);

            const startY = 630;
            doc.font('Helvetica').fontSize(10).text('Jumlah Yang Disetorkan:', 40, 630);
            function terbilang(angka) {
                if (angka === 0 || !angka) return 'Nol';
                const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
                const belasan = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
                function convertLessThanMillion(num) {
                    if (num < 10) return satuan[num];
                    if (num < 20) return belasan[num - 10];
                    if (num < 100) { const puluhan = Math.floor(num / 10); const sisa = num % 10; return satuan[puluhan] + ' Puluh ' + (sisa > 0 ? satuan[sisa] : ''); }
                    if (num < 200) return 'Seratus ' + convertLessThanMillion(num - 100);
                    if (num < 1000) { const ratusan = Math.floor(num / 100); const sisa = num % 100; return satuan[ratusan] + ' Ratus ' + convertLessThanMillion(sisa); }
                    if (num < 2000) return 'Seribu ' + convertLessThanMillion(num - 1000);
                    if (num < 1000000) { const ribuan = Math.floor(num / 1000); const sisa = num % 1000; return convertLessThanMillion(ribuan) + ' Ribu ' + convertLessThanMillion(sisa); }
                    return '';
                }
                let result = '';
                const triliun = Math.floor(angka / 1000000000000);
                const sisaTriliun = angka % 1000000000000;
                if (triliun > 0) result += convertLessThanMillion(triliun) + ' Triliun ';
                const milyar = Math.floor(sisaTriliun / 1000000000);
                const sisaMilyar = sisaTriliun % 1000000000;
                if (milyar > 0) result += convertLessThanMillion(milyar) + ' Milyar ';
                const juta = Math.floor(sisaMilyar / 1000000);
                const sisaJuta = sisaMilyar % 1000000;
                if (juta > 0) result += convertLessThanMillion(juta) + ' Juta ';
                result += convertLessThanMillion(sisaJuta);
                return result.replace(/\s+/g, ' ').trim();
            }
            function terbilangRupiah(angka) { if (angka === 0 || !angka) return 'Nol Rupiah'; return terbilang(angka) + ' Rupiah'; }
            const nilaiBea = parseFloat(data.bphtb_yangtelah_dibayar) || 0;
            doc.font('Helvetica').fontSize(10)
                .text(`${formatCurrency(nilaiBea)}`, 45, 645, { width: 250 })
                .text(`Dengan huruf:`, 250, 630, { width: 500 })
                .text(`${terbilangRupiah(nilaiBea)}`, 255, startY + 15);
            doc.moveTo(40, 640).lineTo(230,640).moveTo(40, 655).lineTo(230,655).moveTo(40, 640).lineTo(40,655).moveTo(230, 640).lineTo(230,655).stroke();
            doc.moveTo(250, 640).lineTo(590,640).moveTo(250, 655).lineTo(590,655).moveTo(250, 640).lineTo(250,655).moveTo(590, 640).lineTo(590,655).stroke();
            doc.moveTo(0, 660).lineTo(700,660).stroke();

            const signatureYPosition = 670;
            const leftMargin = 30;
            const signatureWidth = 80;
            const gapBetween = 24;
            const columnWidth = signatureWidth + 30;
            const fontSize = 8;
            const lineHeight = 10;
            function drawCenteredText(docObj, text, x, y, colWidth) {
                docObj.fontSize(fontSize);
                const textWidth = docObj.widthOfString(text);
                const startX = x + (colWidth - textWidth) / 2;
                docObj.text(text, startX, y);
            }
            const col1X = leftMargin;

            try {
                const toAbsolutePublicPath = (p) => {
                    if (!p || typeof p !== 'string') return null;
                    let normalized = p.replace(/\\/g, '/');
                    if (normalized.startsWith('/')) normalized = normalized.slice(1);
                    if (normalized.startsWith('public/')) normalized = normalized.substring(7);
                    return path.resolve(process.cwd(), 'public', normalized);
                };

                const wpSignaturePath = data.path_ttd_wp;
                
                console.log('🔍 [PDF] WP Signature debug - RAW DATA:', {
                    userid: userid,
                    path_ttd_wp: wpSignaturePath
                });
                
                // Handle different path formats for WP signature
                let wpAbs = null;
                if (wpSignaturePath) {
                    // If path starts with /, it's absolute path from root
                    if (wpSignaturePath.startsWith('/')) {
                        // Convert to absolute path by removing leading slash and joining with public
                        const relativePath = wpSignaturePath.substring(1);
                        wpAbs = path.resolve(process.cwd(), 'public', relativePath);
                    } else {
                        // Use existing function for relative paths
                        wpAbs = toAbsolutePublicPath(wpSignaturePath);
                    }
                }
                
                console.log('🔍 [PDF] WP Signature debug - PROCESSED:', {
                    originalPath: wpSignaturePath,
                    absolutePath: wpAbs,
                    fileExists: wpAbs ? fs.existsSync(wpAbs) : false,
                    directoryExists: wpAbs ? fs.existsSync(path.dirname(wpAbs)) : false
                });
                
                if (wpAbs && fs.existsSync(wpAbs)) {
                    // Render WP signature clean (tanpa border) dan pastikan tidak menyentuh garis pembatas bawah.
                    // Kita batasi ke "signature box" agar tinggi terkontrol (mirip feel PPAT, tapi tidak nabrak line bawah).
                    const sigBoxW = 100;
                    const sigBoxH = 45;
                    const sigY = signatureYPosition + 35; // di bawah nama WP (y+20) dan tetap di atas garis pembatas (y+85)

                    const processedWPImage = await sharp(wpAbs)
                        .trim()
                        .resize(600, 300, {
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 0 }
                        })
                        .png({
                            compressionLevel: 9,
                            adaptiveFiltering: true,
                            palette: true,
                            quality: 100
                        })
                        .toBuffer();

                    doc.image(
                        processedWPImage,
                        col1X + (columnWidth - sigBoxW) / 2,
                        sigY,
                        { fit: [sigBoxW, sigBoxH] }
                    );
                    console.log('✅ [PDF] WP Signature rendered successfully (clean & bounded)');
                } else {
                    // Kalau ttd WP tidak ada, biarkan kosong (jangan gambar garis placeholder agar tidak terlihat seperti border).
                    console.warn('⚠️ [PDF] WP Signature file not found; leaving blank');
                }
            } catch (err) {
                console.warn('❌ [PDF] Failed to render WP signature:', err?.message || err);
                // Jangan gambar garis fallback agar area tanda tangan tetap clean.
            }

            drawCenteredText(doc, `${data.kabupatenkotawp}, tgl ${data.tanggal}`, col1X, signatureYPosition, columnWidth);
            drawCenteredText(doc, 'WAJIB PAJAK/PENYETOR', col1X, signatureYPosition + lineHeight, columnWidth);
            drawCenteredText(doc, `${data.namawajibpajak || '........................'}`, col1X, signatureYPosition + 20, columnWidth);

            drawCenteredText(doc, 'Nomor Validasi', col1X, signatureYPosition + 90, columnWidth);
            drawCenteredText(doc, '...............', col1X, signatureYPosition + 105, columnWidth);

            const col2X = col1X + columnWidth + gapBetween;
            drawCenteredText(doc, 'PPAT/PPATS/NOTARIS', col2X, signatureYPosition, columnWidth);

            try {
                const toAbsolutePublicPath = (p) => {
                    if (!p || typeof p !== 'string') return null;
                    let normalized = p.replace(/\\/g, '/');
                    if (normalized.startsWith('/')) normalized = normalized.slice(1);
                    if (normalized.startsWith('public/')) normalized = normalized.substring(7);
                    return path.resolve(process.cwd(), 'public', normalized);
                };
            
                // Prioritas: gunakan tanda_tangan_path dari user profile, fallback ke pat_6_sign
                const signaturePath = data.tanda_tangan_path || data.path_ttd_ppat;
                
                console.log('🔍 [PDF] Signature debug - RAW DATA:', {
                    userid: userid,
                    tanda_tangan_path: data.tanda_tangan_path,
                    path_ttd_ppat: data.path_ttd_ppat,
                    finalPath: signaturePath
                });
                
                // Handle different path formats
                let ppatAbs = null;
                if (signaturePath) {
                    // If path starts with /, it's absolute path from root
                    if (signaturePath.startsWith('/')) {
                        // Convert to absolute path by removing leading slash and joining with public
                        const relativePath = signaturePath.substring(1);
                        ppatAbs = path.resolve(process.cwd(), 'public', relativePath);
                        
                        // Fix for incorrect folder name in database
                        // Database has: /penting_F_simpan/folderttd/folderttd_ppat/ttd-PAT02.png
                        // Actual path: /penting_F_simpan/folderttd/ppat_sign/ttd-PAT02.png
                        if (!fs.existsSync(ppatAbs) && signaturePath.includes('folderttd_ppat')) {
                            const correctedPath = signaturePath.replace('folderttd_ppat', 'ppat_sign');
                            const correctedRelativePath = correctedPath.substring(1);
                            ppatAbs = path.resolve(process.cwd(), 'public', correctedRelativePath);
                            console.log('🔧 [PDF] Corrected PPAT signature path:', correctedPath);
                        }
                    } else {
                        // Use existing function for relative paths
                        ppatAbs = toAbsolutePublicPath(signaturePath);
                    }
                }
                
                console.log('🔍 [PDF] Signature debug - PROCESSED:', {
                    originalPath: signaturePath,
                    absolutePath: ppatAbs,
                    fileExists: ppatAbs ? fs.existsSync(ppatAbs) : false,
                    directoryExists: ppatAbs ? fs.existsSync(path.dirname(ppatAbs)) : false
                });
                
                if (ppatAbs && fs.existsSync(ppatAbs)) {
                    // Use medium size (400x400) for PPAT signature
                    const mediumSignatureWidth = 100; // Adjusted for PDF layout
                    
                    // Pre-process gambar dengan sharp untuk medium size
                    const processedImage = await sharp(ppatAbs)
                        .trim() // Otomatis trim background transparan
                        .resize(400, 400, {
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        })
                        .png({ 
                            compressionLevel: 9,
                            adaptiveFiltering: true,
                            palette: true,
                            quality: 100
                        })
                        .toBuffer();
                        
                    doc.image(processedImage, col2X + (columnWidth - mediumSignatureWidth)/2, signatureYPosition + 10, { 
                        width: mediumSignatureWidth
                    });
                    console.log('✅ [PDF] PPAT Signature rendered successfully with medium size (400x400) for user:', userid);
                } else {
                    console.warn('⚠️ [PDF] Signature file not found for user:', userid, 'Path:', signaturePath);
                }
            } catch (err) {
                console.warn('❌ [PDF] Failed to render PPAT signature for user:', userid, 'Error:', err?.message || err);
            }

            drawCenteredText(doc, `${data.nama || '........................'}`, col2X, signatureYPosition + 10, columnWidth);
            drawCenteredText(doc, `${data.special_field || '........................'}`, col2X, signatureYPosition + 70, columnWidth);

            const col3X = col2X + columnWidth + gapBetween;
            drawCenteredText(doc, 'DITERIMA OLEH:', col3X, signatureYPosition, columnWidth);
            drawCenteredText(doc, 'TEMPAT PEMBAYARAN BPHTB', col3X, signatureYPosition + 10, columnWidth);
            drawCenteredText(doc, 'tanggal : .........', col3X, signatureYPosition + 20, columnWidth);
            doc.moveTo(col3X + (columnWidth - signatureWidth)/2, signatureYPosition + 50)
                .lineTo(col3X + (columnWidth - signatureWidth)/2 + signatureWidth, signatureYPosition + 50)
                .stroke();
            drawCenteredText(doc, '(................................)', col3X, signatureYPosition + 70, columnWidth);

            const col4X = col3X + columnWidth + gapBetween + 20;
            drawCenteredText(doc, 'Telah Diverifikasi', col4X, signatureYPosition, columnWidth);
            drawCenteredText(doc, 'BADAN PENDAPATAN DAERAH', col4X, signatureYPosition + 10, columnWidth);
            const stampWidth = signatureWidth + 30;
            doc.rect(col4X + (columnWidth - stampWidth)/2, signatureYPosition + 30, stampWidth, 50).stroke();
            drawCenteredText(doc, '(................................)', col4X, signatureYPosition + 70, columnWidth);

            doc.moveTo(0, signatureYPosition + 85).lineTo(700, signatureYPosition + 85).stroke();
            doc.end();
        } catch (error) {
            console.error('❌ [PDF-BADAN] Error generating PDF:', error);
            console.error('❌ [PDF-BADAN] Error stack:', error.stack);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal menghasilkan dokumen PDF',
                error: error.message,
                nobooking: nobooking
            });
        }
    });

    // Permohonan Validasi (mohon validasi) PDF
app.get('/api/ppat/generate-pdf-mohon-validasi/:nobooking', async (req, res) => {
        const { nobooking } = req.params; // Ambil nobooking dari URL parameter
        const { pengirim } = req.query;
        console.log('📄 [PDF] Generating mohon validasi PDF for nobooking:', nobooking);
        console.log('📄 [PDF] Request headers:', req.headers);
        try {
            const bookingQuery = await pool.query(`
                SELECT 
                    pb.*, 
                    vu.nama AS nama_pembuat,
                    vu.userid AS id_pembuat,
                    ps.path_ttd_ppat
                FROM pat_1_bookingsspd pb
                LEFT JOIN a_2_verified_users vu ON pb.userid = vu.userid
                LEFT JOIN pat_6_sign ps ON pb.nobooking = ps.nobooking
                WHERE pb.nobooking = $1
            `, [nobooking]);

            console.log('📄 [PDF] Booking query result:', bookingQuery.rows.length, 'rows found');
            
            if (bookingQuery.rows.length === 0) {
                console.error('❌ [PDF] No data found for nobooking:', nobooking);
                return res.status(404).json({ message: 'Data tidak ditemukan' });
            }

            const bookingData = bookingQuery.rows[0];
            console.log('📄 [PDF] Booking data found:', bookingData.nobooking, bookingData.nama_pembuat);
            console.log('📄 [PDF] Available fields:', Object.keys(bookingData).filter(key => bookingData[key] !== null));
            const pengirimData = {
                nama: pengirim || bookingData.nama_pembuat || '',
                userid: bookingData.id_pembuat || ''
            };
            
            // Use data from the first query instead of doing a separate query
            const userid = bookingData.id_pembuat || bookingData.userid;
            const nama = bookingData.nama_pembuat || bookingData.namawajibpajak;
            
            console.log('📄 [PDF] Creator data:', { userid, nama });
            
            if (!userid || !nama) {
                console.error('❌ [PDF] Missing userid or nama:', { userid, nama });
                console.error('❌ [PDF] Available booking data fields:', Object.keys(bookingData));
                return res.status(400).json({ success: false, message: 'User ID dan nama pembuat is required' });
            }
            const result = await pool.query(`
                SELECT DISTINCT
                pb.nobooking,pb.tanggal, pb.namawajibpajak, pb. alamatwajibpajak, pb.kelurahandesawp, pb.kecamatanwp, pb.kabupatenkotawp, pb.noppbb, pb.namapemilikobjekpajak,
                vu.special_field, vu.telepon, vu.nama, vu.userid,
                po.letaktanahdanbangunan, po.keterangan,
                pp.luas_tanah, pp.luas_bangunan,
                vt.alamat_pemohon, vt.kampungop, vt.kelurahanop, vt.kecamatanopj,
                pv.nama_pengirim,
                ps.path_ttd_ppat
            FROM 
                pat_1_bookingsspd pb
            LEFT JOIN 
                a_2_verified_users vu ON  vu.userid = pb.userid
            LEFT JOIN 
                pat_4_objek_pajak po ON pb.nobooking = po.nobooking
            LEFT JOIN
                pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking 
            LEFT JOIN
                pat_8_validasi_tambahan vt ON pb.nobooking = vt.nobooking
            LEFT JOIN
                p_1_verifikasi pv ON pb.nobooking = pv.nobooking
            LEFT JOIN
                pat_6_sign ps ON pb.nobooking = ps.nobooking
            WHERE 
                pb.userid = $1 AND pb.nobooking = $2`, [userid, nobooking]);

            console.log('📄 [PDF] Main data query result:', result.rows.length, 'rows found');
            
            if (result.rows.length === 0) {
                console.error('❌ [PDF] No main data found for userid:', userid, 'nobooking:', nobooking);
                return res.status(404).json({ message: 'Data not found' });
            }
            const data = result.rows[0];
            data.parafv = req.session?.user?.special_parafv;

            const doc = new PDFKitDocument({ margin: 30, size: 'A4' });
            doc.font('Helvetica');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="Permohonan_Validasi_${nobooking}.pdf"`);

            doc.pipe(res);

            const leftColumnX = 20;
            const middleColumnX = 150;
            const rightColumnX = 200;
            let currentY = 50;
            const boldFont = 'Helvetica-Bold';
            const normalFont = 'Helvetica';
            const fontSize = 12;

            const headerHeight = 60;
            const footerHeight = 30;
            doc.fillColor('#696969').rect(0, headerHeight - 10, 612, footerHeight).fill();
            doc.fillColor('black');
            doc.font(boldFont).fontSize(14).text('FORMULIR PERMOHONAN PENELITIAN SSPD BPHTB',leftColumnX, 60, {align: 'center',width: 500});
            currentY = headerHeight + footerHeight + 10;

            doc.font(normalFont).fontSize(fontSize)
                .text('Lamp  : 1 (satu) set', leftColumnX, currentY)
                .text('Perihal : Penyampaian SSPD BPHTB untuk Diteliti', leftColumnX, currentY + 10);
            currentY += 50;

            doc.text(`Yth. Kepala Dinas ${data.parafv || '______'}`, leftColumnX, currentY)
                .text('Kabupaten Bogor', leftColumnX, currentY + 10);
            currentY += 30;

            doc.text('Yang bertanda tangan di bawah ini :', leftColumnX, currentY);
            currentY += 20;

            doc.font(normalFont).text('Nama Pemohon', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(nama || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Alamat', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.alamat_pemohon || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('No. Telepon', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.telepon || '______', middleColumnX, currentY);
            currentY += 30;

            doc.font(normalFont).text('Nama Wajib Pajak', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.namawajibpajak || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Alamat', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.alamatwajibpajak || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Desa / Kelurahan', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.kelurahandesawp || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Kecamatan', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.kecamatanwp || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Kabupaten/Kota', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.kabupatenkotawp || '______', middleColumnX, currentY);
            currentY += 20;

            doc.text('Bersama ini disampaikan SSPD BPHTB untuk diteliti atas perolehan hak atas tanah dan/atau bangunan sebagai berikut :', 
                leftColumnX, currentY, { width: 500 });
            currentY += 40;

            doc.font(normalFont).text('NOP', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.noppbb || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Atas Nama', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.namapemilikobjekpajak || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Luas', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(`Tanah ${data.luas_tanah || '______'}m²   Bangunan ${data.luas_bangunan || '______'}m²`, middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Alamat', leftColumnX, currentY)
                .font(normalFont).text(':', middleColumnX - 10, currentY)
                .text(data.letaktanahdanbangunan || '______', middleColumnX, currentY);
            currentY += 12;

            doc.font(normalFont).text('Kampung', 150, currentY)
                .font(normalFont).text(':', 250 - 10, currentY)
                .text(data.kampungop || '_______________', 250, currentY);
            currentY += 12;

            doc.font(normalFont).text('Desa/Kelurahan', 150, currentY)
                .font(normalFont).text(':', 250 - 10, currentY)
                .text(data.kelurahanop || '_______________', 250, currentY);
            currentY += 12;

            doc.font(normalFont).text('Kecamatan', 150, currentY)
                .font(normalFont).text(':', 250 - 10, currentY)
                .text(`${data.kecamatanopj || '_______________'} Kabupaten Bogor`, 250, currentY);
            currentY += 20;

            doc.font(boldFont).text('Terlampir dokumen sebagai berikut :', leftColumnX, currentY);
            currentY += 15;

            doc.font(normalFont).fontSize(12)
            .text('a.', 20, 475)
            .text('SSPD BPHTB yang telah diregistrasi.', 32, 475)
            .text('b.', 20, 488)
            .text('Fotocopy KTP Pemohon/Wajib Pajak, apabila dikuasakan disertakan Surat Kuasa dan fotocopy KTP', 32, 488)
            .text('penerima kuasa.', 32, 501)
            .text('c.', 20, 514)
            .text('Foto Copy SPPT PBB dan STTS Terakhir.', 32, 514)
            .text('d.', 20, 527)
            .text('Surat Setoran Bank/bukti penerimaan bank.', 32, 527)
            .text('e.', 20, 540)
            .text('Dokumen yang membuktikan/menunjukan terjadinya perolehan hak atas tanah dan/atau bangunan', 32, 540)
            .text('yang dijadikan dasar pembuatan akta.', 32, 553)
            .text('f.', 20, 566)
            .text('Bukti tidak memiliki tunggakan PBB.', 32, 566)
            .text('g.', 20, 579)
            .text('Fotocopy Sertifikat Tanah.', 32, 579)
            .text('h.', 20, 592).text(data.keterangan || '______', 32, 592);
            currentY += 140;
            function formatTanggal(tanggalString) {
                const [day, month, year] = tanggalString.split('-');
                const bulan = [
                    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ];
                return `${day} ${bulan[parseInt(month) - 1]} ${year}`;
            }

// Setting posisi dasar kiri & kanan
const baseY = currentY + 40;   // jarak ke bawah sebelum blok tanda tangan
const leftX = 80;              // posisi kolom kiri (Petugas Penerima Berkas)
const rightX = 350;            // posisi kolom kanan (Pemohon, TTD)

// Tanggal & Lokasi
doc.fontSize(12)
   .text('Cibinong,', rightX + 20, baseY - 25) // agak di atas
   .text(formatTanggal(data.tanggal) || '______ 20__', rightX + 70, baseY - 25);

// Label "Petugas Penerima Berkas" & "Pemohon"
doc.text('Petugas Penerima Berkas,', leftX - 35, baseY)
   .text('Pemohon', rightX + 60, baseY);

// Render tanda tangan Pemohon (jika ada)
try {
    const toAbsolutePublicPath = (p) => {
        if (!p || typeof p !== 'string') return null;
        let normalized = p.replace(/\\/g, '/');
        if (normalized.startsWith('/')) normalized = normalized.slice(1);
        if (normalized.startsWith('public/')) normalized = normalized.substring(7);
        return path.resolve(process.cwd(), 'public', normalized);
    };
    
    console.log('🔍 [PDF] Pemohon Signature debug - RAW DATA:', {
            path_ttd_ppat: data.path_ttd_ppat
    });
    
    // Handle different path formats for Pemohon signature
    let ppatAbs = null;
    if (data.path_ttd_ppat) {
        // If path starts with /, it's absolute path from root
        if (data.path_ttd_ppat.startsWith('/')) {
            // Convert to absolute path by removing leading slash and joining with public
            const relativePath = data.path_ttd_ppat.substring(1);
            ppatAbs = path.resolve(process.cwd(), 'public', relativePath);
            
            // Fix for incorrect folder name in database
            // Database has: /penting_F_simpan/folderttd/folderttd_ppat/ttd-PAT02.png
            // Actual path: /penting_F_simpan/folderttd/ppat_sign/ttd-PAT02.png
            if (!fs.existsSync(ppatAbs) && data.path_ttd_ppat.includes('folderttd_ppat')) {
                const correctedPath = data.path_ttd_ppat.replace('folderttd_ppat', 'ppat_sign');
                const correctedRelativePath = correctedPath.substring(1);
                ppatAbs = path.resolve(process.cwd(), 'public', correctedRelativePath);
                console.log('🔧 [PDF] Corrected Pemohon signature path:', correctedPath);
            }
        } else {
            // Use existing function for relative paths
            ppatAbs = toAbsolutePublicPath(data.path_ttd_ppat);
        }
    }
    
    console.log('🔍 [PDF] Pemohon Signature debug - PROCESSED:', {
        originalPath: data.path_ttd_ppat,
        absolutePath: ppatAbs,
        fileExists: ppatAbs ? fs.existsSync(ppatAbs) : false,
        directoryExists: ppatAbs ? fs.existsSync(path.dirname(ppatAbs)) : false
    });
    
    if (ppatAbs && fs.existsSync(ppatAbs)) {
        // Use medium size (400x400) for signature
        const mediumSignatureWidth = 100; // Adjusted for PDF layout
        
        // Pre-process gambar dengan sharp untuk medium size
        const processedImage = await sharp(ppatAbs)
            .trim() // Otomatis trim background transparan
            .resize(400, 400, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png({ 
                compressionLevel: 9,
                adaptiveFiltering: true,
                palette: true,
                quality: 100
            })
            .toBuffer();
            
        doc.image(processedImage, rightX + 40, baseY + 20, { width: mediumSignatureWidth });
        console.log('✅ [PDF] Pemohon Signature rendered successfully with medium size (400x400)');
    } else {
        console.warn('⚠️ [PDF] Signature file not found for pemohon');
    }

} catch (err) {
  console.warn('❌ [PDF] Failed to render PPAT signature:', err?.message || err);
}

// Naikkan posisi Y untuk nama di bawah garis tanda tangan
const nameY = baseY + 100;

// Nama Petugas & Pemohon
doc.text(data.nama_pengirim || '_____________________', leftX - 60, nameY, { width: 200, align: 'center' })
   .text(data.special_field || '_____________________', rightX, nameY, { width: 200, align: 'center' });

            doc.end();

        } catch (error) {
            console.error('❌ [PDF] Error generating mohon validasi PDF:', error);
            console.error('❌ [PDF] Error stack:', error.stack);
            res.status(500).json({ 
                success: false, 
                message: 'Gagal menghasilkan dokumen PDF',
                error: error.message,
                nobooking: nobooking
            });
        }
    });
}


