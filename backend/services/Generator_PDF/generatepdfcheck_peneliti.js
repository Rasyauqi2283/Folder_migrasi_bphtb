import PDFKitDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Helper: convert web/public path -> absolute filesystem path under /public
function toAbsolutePublicPath(p) {
    if (!p || typeof p !== 'string') return null;
    let normalized = p.replace(/\\/g, '/');
    if (normalized.startsWith('/')) normalized = normalized.slice(1);
    if (normalized.startsWith('public/')) normalized = normalized.substring(7);
    return path.resolve(process.cwd(), 'public', normalized);
}

export default function registerGeneratePdfCheckPeneliti(app, pool) {
    // GET /api/peneliti_lanjutan-generate-pdf-badan/:nobooking
    app.get('/api/peneliti_lanjutan-generate-pdf-badan/:nobooking', async (req, res) => {
        const { nobooking } = req.params;

        try {
            // Ambil pembuat
            const tracking = await pool.query(
                'SELECT userid, nama FROM pat_1_bookingsspd WHERE nobooking = $1',
                [nobooking]
            );
            if (tracking.rows.length === 0) {
                return res.status(404).json({ message: 'Data untuk nobooking ini tidak ditemukan' });
            }
            const { userid, nama } = tracking.rows[0];
            if (!userid || !nama) {
                return res.status(400).json({ success: false, message: 'User ID dan nama pembuat is required' });
            }

            // Query utama data PDF
            const q = `
                SELECT DISTINCT
                    pb.*, bp.*, o.*,
                    vb.nama,
                    pp.*,
                    ps.path_ttd_ppat, ps.path_ttd_wp,
                    substring(ps.path_ttd_wp from '\\._?([^\\.]*)$') as wp_ext,
                    substring(ps.path_ttd_ppat from '\\._?([^\\.]*)$') as ppat_ext,
                    pv.pemilihan, pv.tanggal_terima, pv.nomorstpd, pv.tanggalstpd, pv.angkapersen, pv.keterangandihitungsendiri,
                    pv.isiketeranganlainnya, pv.ttd_peneliti_mime,
                    pv.tanda_tangan_path AS peneliti_tanda_tangan_path,
                    vb.tanda_tangan_path,
                    pvs.stempel_booking_path,
                    tpk.sign_paraf, tpk.signfile_path,
                    vb.special_parafv,
                    pc.tanda_paraf_path AS peneliti_tanda_paraf_path
                FROM pat_1_bookingsspd pb
                LEFT JOIN pat_2_bphtb_perhitungan bp ON pb.nobooking = bp.nobooking
                LEFT JOIN pat_4_objek_pajak o ON pb.nobooking = o.nobooking
                LEFT JOIN a_2_verified_users vb ON vb.nama = pb.nama AND pb.userid = vb.userid
                LEFT JOIN pat_5_penghitungan_njop pp ON pb.nobooking = pp.nobooking 
                LEFT JOIN pat_6_sign ps ON pb.nobooking = ps.nobooking
                LEFT JOIN p_1_verifikasi pv ON pb.nobooking = pv.nobooking
                LEFT JOIN p_2_verif_sign pvs ON pb.nobooking = pvs.nobooking
                LEFT JOIN p_3_clear_to_paraf pc ON pb.nobooking = pc.nobooking
                LEFT JOIN ttd_paraf_kasie tpk ON pb.nobooking = tpk.nobooking
                WHERE pb.userid = $1 AND vb.nama = $2 AND pb.nobooking = $3
            `;
            const r = await pool.query(q, [userid, nama, nobooking]);
            if (r.rows.length === 0) {
                return res.status(404).json({ message: 'Data not found' });
            }
            const data = r.rows[0];
            data.special_parafv = req.session?.user?.special_parafv;

            const doc = new PDFKitDocument({ margin: 30, size: 'A4' });
            res.setHeader('Content-Type', 'application/pdf');
            const disposition = req.query.download ? 'attachment' : 'inline';
            res.setHeader('Content-Disposition', `${disposition}; filename="${nobooking}_Terstempel.pdf"`);
            doc.pipe(res);

            // Logo
            try {
                const logoAbs = path.resolve(process.cwd(), 'public', 'asset', 'Logobappenda_pdf.png');
                const pageWidth = 595;
                const logoWidth = pageWidth * 0.11;
                doc.image(logoAbs, 35, 30, { width: logoWidth });
            } catch (_) {}

            // Header
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

                        // Tanda paraf (p_3_clear_to_paraf.tanda_paraf_path) tepat di batas antara kotak "Dengan huruf" dan kolom "DITERIMA OLEH"
            // Letakkan terpusat di atas kolom "DITERIMA OLEH" (col3), dengan dasar gambar rata pada garis y=660
            try {
                const penelitiSigAbs = toAbsolutePublicPath(data.peneliti_tanda_paraf_path);
                if (penelitiSigAbs && fs.existsSync(penelitiSigAbs)) {
                    const sigWidth = 80;
                    const sigHeight = 38;
                    const boundaryY = 690; // garis batas bawah kotak "Dengan huruf"
                    const leftMargin = 30;
                    const columnWidth = sigWidth + 30; // selaras dengan perhitungan kolom bawah
                    const gapBetween = 24;
                    // col3X = col1X + columnWidth + gap + columnWidth + gap
                    const col3X = leftMargin + columnWidth + gapBetween + columnWidth + gapBetween - 30; // ≈ 298
                    const sigX = col3X + (columnWidth - sigWidth) / 2;
                    const sigY = boundaryY - sigHeight - 2; // sedikit di atas garis batas
                    doc.image(penelitiSigAbs, sigX, sigY, { width: sigWidth, height: sigHeight });
                }
            } catch (_) {}

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

            // Tanda tangan Peneliti di sisi kanan, di atas "Dengan huruf:", tidak melewati garis bawah tanggal
            try {
                const penelitiSigAbs = toAbsolutePublicPath(data.peneliti_tanda_tangan_path);
                if (penelitiSigAbs && fs.existsSync(penelitiSigAbs)) {
                    const sigWidth = 80;
                    const sigHeight = 38;
                    const sigX = 455; // kanan, sebelum batas 590
                    const sigY = 600; // di atas teks "Dengan huruf:" (630) dan di bawah area tanggal (~585-600)
                    doc.image(penelitiSigAbs, sigX, sigY, { width: sigWidth, height: sigHeight });
                }
            } catch (_) {}

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

                const ppatAbs = toAbsolutePublicPath(data.path_ttd_wp);
                if (ppatAbs && fs.existsSync(ppatAbs)) {
                    doc.image(ppatAbs, col1X + (columnWidth - signatureWidth)/2, signatureYPosition + 15, { width: signatureWidth });
                } else {
                    doc.moveTo(col1X + (columnWidth - signatureWidth)/2, signatureYPosition + 40)
                        .lineTo(col1X + (columnWidth - signatureWidth)/2 + signatureWidth, signatureYPosition + 40)
                        .stroke();
                }
            } catch (err) {
                console.warn('Failed to render WP signature:', err?.message || err);
                doc.moveTo(col1X + (columnWidth - signatureWidth)/2, signatureYPosition + 40)
                    .lineTo(col1X + (columnWidth - signatureWidth)/2 + signatureWidth, signatureYPosition + 40)
                    .stroke();
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

                const ppatAbs = toAbsolutePublicPath(data.path_ttd_ppat);
                if (ppatAbs && fs.existsSync(ppatAbs)) {
                    doc.image(ppatAbs, col2X + (columnWidth - signatureWidth)/2, signatureYPosition + 10, { width: signatureWidth });
                } else {
                    doc.moveTo(col2X + (columnWidth - signatureWidth)/2, signatureYPosition + 40)
                        .lineTo(col2X + (columnWidth - signatureWidth)/2 + signatureWidth, signatureYPosition + 40)
                        .stroke();
                }
            } catch (err) {
                console.warn('Failed to render PPAT signature:', err?.message || err);
                doc.moveTo(col2X + (columnWidth - signatureWidth)/2, signatureYPosition + 40)
                    .lineTo(col2X + (columnWidth - signatureWidth)/2 + signatureWidth, signatureYPosition + 40)
                    .stroke();
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

// Stempel BAPPENDA di sisi kiri kolom "TEMPAT PEMBAYARAN BPHTB" (lebih besar 1.5x dari sebelumnya, proporsi asli)
try {
    const stampAbs = toAbsolutePublicPath(data.stempel_booking_path || '/asset/Stempel_bappenda.png');
    if (stampAbs && fs.existsSync(stampAbs)) {
        const stampWidth = 90; // 1.5x lebih besar dari sebelumnya (60)
        const stampX = col3X - 46;
        const stampY = signatureYPosition + 21;

        const processedStamp = await sharp(stampAbs).toBuffer(); // pertahankan rasio asli

        // Rotasi 20 derajat, pusatkan rotasi di tengah stempel
        doc.save();
        doc.rotate(20, { origin: [stampX + stampWidth / 2, stampY + stampWidth / 2] });
        doc.image(processedStamp, stampX, stampY, { width: stampWidth });
        doc.restore();
    }
} catch (err) {
    console.warn("Failed to render stamp:", err?.message || err);
}

            const col4X = col3X + columnWidth + gapBetween + 20;
            drawCenteredText(doc, 'Telah Diverifikasi', col4X, signatureYPosition, columnWidth);
            drawCenteredText(doc, 'BADAN PENDAPATAN DAERAH', col4X, signatureYPosition + 10, columnWidth);
            const stampWidth = signatureWidth + 30;
            // Kolom 4 di tahap peneliti check tidak perlu stempel, hanya kotak kosong
            doc.rect(col4X + (columnWidth - stampWidth)/2, signatureYPosition + 30, stampWidth, 50).stroke();
            drawCenteredText(doc, '(................................)', col4X, signatureYPosition + 70, columnWidth);

            doc.moveTo(0, signatureYPosition + 85).lineTo(700, signatureYPosition + 85).stroke();
            // Tutup dokumen
            doc.end();
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ message: 'Error generating PDF' });
        }
    });
}
