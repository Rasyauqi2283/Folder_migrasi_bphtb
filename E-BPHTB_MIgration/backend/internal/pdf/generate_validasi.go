package pdf

import (
	"bytes"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"
	"time"

	"ebphtb/backend/internal/repository"

	"github.com/jung-kurt/gofpdf/v2"
	qrcode "github.com/skip2/go-qrcode"
)

// GenerateValidasiPDF renders "BUKTI VALIDASI" (SSPD-BPHTB) with legacy pixel-perfect coordinates (ported from Node/pdfkit).
// IMPORTANT: This uses gofpdf unit "pt" so coordinates match JS (PDF points).
func GenerateValidasiPDF(w io.Writer, data *repository.ValidasiPDFData, logoPath string) error {
	if data == nil {
		return fmt.Errorf("data is nil")
	}

	pdf := gofpdf.New("P", "pt", "A4", "")
	pdf.SetMargins(40, 40, 40)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	// Watermark (diagonal) — do this early so all content is above it.
	addValidasiWatermark(pdf, "SUDAH DIVALIDASI")

	// === HEADER ===
	pdf.Line(50, 35, 550, 35)
	if strings.TrimSpace(logoPath) != "" {
		pdf.Image(logoPath, 50, 40, 60, 0, false, "", 0, "")
	}

	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetXY(120, 50)
	pdf.CellFormat(400, 18, "BUKTI VALIDASI", "", 0, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 12)
	pdf.SetXY(120, 70)
	pdf.CellFormat(400, 14, "PELAPORAN SURAT SETORAN PAJAK DAERAH", "", 0, "C", false, 0, "")
	pdf.SetXY(120, 85)
	pdf.CellFormat(400, 14, "BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN", "", 0, "C", false, 0, "")
	pdf.SetXY(120, 100)
	pdf.CellFormat(400, 14, "(SSPD-BPHTB)", "", 0, "C", false, 0, "")

	// Garis pemisah
	pdf.Line(115, 35, 115, 115)
	pdf.Line(50, 115, 550, 115)
	pdf.Line(50, 35, 50, 570)
	pdf.Line(550, 35, 550, 570)

	pdf.SetFont("Helvetica", "", 7)
	pdf.Text(55, 124, "BADAN PENGELOLAAN PENDAPATAN DAERAH KABUPATEN BOGOR")
	pdf.Line(50, 125, 550, 125)

	// === BAGIAN A - DATA WAJIB PAJAK ===
	boxA := 127.0
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(55, boxA+12, "A. DATA WAJIB PAJAK")
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, boxA+22, "1. Nama Wajib Pajak")
	pdf.Text(55, boxA+32, "2. NPWPD/KTP")
	pdf.Text(55, boxA+42, "3. Alamat Wajib Pajak")
	pdf.Text(55, boxA+52, "4. Kode Pos")
	pdf.Text(205, boxA+22, ": "+val(data.Namawajibpajak))
	pdf.Text(205, boxA+32, ": "+val(data.Npwpwp))
	pdf.Text(205, boxA+42, ": "+val(data.Alamatwajibpajak))
	pdf.Text(205, boxA+52, ": "+val(data.Kodeposwp))
	pdf.Text(355, boxA+22, "5. RT / RW")
	pdf.Text(355, boxA+32, "6. Desa / Kelurahan")
	pdf.Text(355, boxA+42, "7. Kecamatan")
	pdf.Text(355, boxA+52, "8. Kabupaten / Kota")
	pdf.Text(455, boxA+22, ": "+val(data.Rtrwwp))
	pdf.Text(455, boxA+32, ": "+val(data.Kelurahandesawp))
	pdf.Text(455, boxA+42, ": "+val(data.Kecamatanwp))
	pdf.Text(455, boxA+52, ": "+val(data.Kabupatenkotawp))
	pdf.Line(50, boxA+65, 550, boxA+65)

	// === BAGIAN B - DATA OBJEK PAJAK ===
	boxB := boxA + 70
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(55, boxB+12, "B. DATA OBJEK PAJAK")
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, boxB+27, "1. NOP PBB")
	pdf.Text(55, boxB+37, "2. Objek Lokasi Pajak")
	pdf.Text(55, boxB+47, "4. Desa / Kelurahan")
	pdf.Text(205, boxB+27, ": "+val(data.Noppbb))
	pdf.Text(205, boxB+37, ": "+val(data.Letaktanahdanbangunan))
	pdf.Text(205, boxB+47, ": "+val(data.Kelurahandesalp))
	pdf.Text(355, boxB+27, "3. RT / RW")
	pdf.Text(355, boxB+37, "5. Kecamatan")
	pdf.Text(355, boxB+47, "6. Kabupaten")
	pdf.Text(355, boxB+57, "7. Kode Pos")
	pdf.Text(455, boxB+27, ": "+val(data.RtRwobjekpajak))
	pdf.Text(455, boxB+37, ": "+val(data.Kecamatanlp))
	pdf.Text(455, boxB+47, ": BOGOR")
	pdf.Text(455, boxB+57, ": "+val(data.Kodeposop))

	// === TABEL PERHITUNGAN NJOP ===
	njopTop := boxB + 65
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(55, njopTop-2, "Perhitungan NJOP PBB :")

	// Header tabel NJOP
	pdf.Rect(50, njopTop, 500, 20, "")
	pdf.Line(120, njopTop, 120, njopTop+20)
	pdf.Line(250, njopTop, 250, njopTop+20)
	pdf.Line(380, njopTop, 380, njopTop+20)
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(60, njopTop+13, "Objek Pajak")
	pdf.Text(180, njopTop+13, "Luas/m\xb2")
	pdf.Text(280, njopTop+13, "NJOP PBB / m\xb2")
	pdf.Text(400, njopTop+13, "Luas \xd7 NJOP PBB /m\xb2")

	luasTanah := data.LuasTanah
	njopTanah := data.NjopTanah
	luasBangunan := data.LuasBangunan
	njopBangunan := data.NjopBangunan
	tanahVal := luasTanah * njopTanah
	bangunanVal := luasBangunan * njopBangunan
	totalNJOP := tanahVal + bangunanVal

	rowY1 := njopTop + 20
	drawNjopRow(pdf, rowY1, "Tanah (Bumi)", "8.", luasTanah, "10.", njopTanah, "12.", tanahVal)
	drawNjopRow(pdf, rowY1+20, "Bangunan", "9.", luasBangunan, "11.", njopBangunan, "13.", bangunanVal)

	totalY := njopTop + 60
	pdf.Rect(380, totalY, 170, 15, "")
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(385, totalY+11, "14.")
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(410, totalY+11, "Rp "+formatIntID(totalNJOP))

	// Informasi tambahan 15-17
	kodePerolehan := strings.TrimSpace(data.JenisPerolehan)
	if len(kodePerolehan) == 1 {
		kodePerolehan = "0" + kodePerolehan
	}
	if len(kodePerolehan) == 0 {
		kodePerolehan = "00"
	}
	teksPerolehan := jenisPerolehanText(kodePerolehan)

	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, totalY+15, "15. Jenis Perolehan hak atas tanah dan/atau bangunan :")
	pdf.Rect(70, totalY+20, 20, 15, "")
	pdf.Text(75, totalY+32, kodePerolehan)
	pdf.Text(95, totalY+32, teksPerolehan)
	pdf.Text(55, totalY+40, "16. Harga transaksi / Nilai pasar")
	pdf.Text(190, totalY+40, ":")
	pdf.Text(200, totalY+40, "Rp")
	pdf.Rect(213, totalY+35, 160, 15, "")
	pdf.Text(215, totalY+47, formatIntID(strToFloat(data.HargaTransaksi)))
	pdf.Text(55, totalY+55, "17. Nomor Sertifikat Tanah")
	pdf.Text(190, totalY+55, ":")
	pdf.Text(200, totalY+55, val(data.NomorSertifikat))

	// === BAGIAN C - PERHITUNGAN BPHTB ===
	bphtbTop := totalY + 60
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(55, bphtbTop+12, "C. PENGHITUNGAN BPHTB")
	pdf.Text(420, bphtbTop+12, "Dalam Rupiah")
	pdf.Line(50, bphtbTop, 550, bphtbTop)
	pdf.Line(375, bphtbTop, 375, bphtbTop+150)

	// Strict calculation: reuse Go logic (points 1..6 consistent with backend).
	calc := repository.CalculateBPHTB(totalNJOP, data.HargaTransaksi, data.JenisPerolehan, data.BphtbYangtelahDibayar)
	hargaTransaksi := strToFloat(data.HargaTransaksi)
	npop := math.Max(hargaTransaksi, totalNJOP)
	npoptkp := calc.NPOPTKP
	npopkp := math.Max(0, npop-npoptkp)
	bphtbTerutang := math.Round(calc.BeaTerutang)
	pengurangan := 0.0
	denda := 0.0
	harusDibayar := math.Round(calc.BeaDibayar)

	type row struct {
		label, formula, code, value string
	}
	rows := []row{
		{"1. Nilai Perolehan Objek Pajak (NPOP)", "", "1", formatIntID(npop)},
		{"2. Nilai Perolehan Objek Pajak Tidak Kena Pajak (NPOPTKP)", "", "2", formatIntID(npoptkp)},
		{"3. Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP)", "1 - 2", "3", formatIntID(npopkp)},
		{"4. Bea Perolehan Hak atas Tanah dan Bangunan yang terutang", "5 % x 3", "4", formatIntID(bphtbTerutang)},
		{"5. Pengurangan  0,00    %", "% x angka", "5", "0"},
		{"6. Denda  0,00", "", "", "0,00"},
		{"7. Bea Perolehan Hak atas Tanah dan Bangunan yang harus dibayar", "4 - 6", "6", formatIntID(harusDibayar)},
		{"8. Bea Perolehan Hak atas Tanah dan Bangunan yang telah dibayar", "7", "7", formatIntID(data.BphtbYangtelahDibayar)},
		{"9. Bea Perolehan Hak atas Tanah dan Bangunan yang kurang dibayar", "7 - 8", "9", formatIntID(math.Max(0, harusDibayar-data.BphtbYangtelahDibayar))},
	}
	_ = pengurangan
	_ = denda

	colX := []float64{50, 330, 430, 450, 550}
	pdf.SetFont("Helvetica", "", 8)
	for i, r := range rows {
		y := bphtbTop + 15 + float64(i)*15
		pdf.Rect(colX[0], y, colX[4]-colX[0], 15, "")
		pdf.Line(colX[2], y, colX[2], y+15)
		pdf.Line(colX[3], y, colX[3], y+15)
		pdf.SetXY(colX[0]+5, y+3)
		pdf.CellFormat(colX[1]-colX[0]+20, 10, r.label, "", 0, "L", false, 0, "")
		pdf.SetXY(colX[1]+50, y+3)
		pdf.CellFormat(colX[2]-colX[1]-10, 10, r.formula, "", 0, "L", false, 0, "")
		pdf.SetXY(colX[2]+5, y+3)
		pdf.CellFormat(colX[3]-colX[2]-10, 10, r.code, "", 0, "C", false, 0, "")
		pdf.SetXY(colX[3]+5, y+3)
		pdf.CellFormat(colX[4]-colX[3]-10, 10, r.value, "", 0, "R", false, 0, "")
	}
	pdf.Line(colX[0], bphtbTop+15, colX[4], bphtbTop+15)

	// === BAGIAN D - JUMLAH SETORAN ===
	boxD := bphtbTop + float64(len(rows))*16 + 5
	pdf.Line(50, boxD+40, 550, boxD+40)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.Text(55, boxD+12, "D. Jumlah Setoran berdasarkan Perhitungan WP dan :")
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, boxD+32, "Nomor SKPDKB:")
	pdf.Text(380, boxD+32, "Tanggal:")

	// X-mark logic (ported): if needs STPD / underpaid then mark STPD; else mark Penghitungan WP.
	wpMark := !data.NeedsSTPD
	stpdMark := data.NeedsSTPD
	// Place mark areas roughly consistent with legacy (checkboxes in section D).
	pdf.Rect(55, boxD+15, 10, 10, "")
	pdf.Text(58, boxD+23, markX(wpMark))
	pdf.Text(70, boxD+23, "Penghitungan Wajib Pajak")
	pdf.Rect(220, boxD+15, 10, 10, "")
	pdf.Text(223, boxD+23, markX(stpdMark))
	pdf.Text(235, boxD+23, "STPD")

	// === FOOTER ===
	footerY := boxD + 50
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, footerY+10, "No Booking")
	pdf.Text(55, footerY+20, val(data.Nobooking))
	pdf.Text(55, footerY+30, "No Registrasi")
	pdf.Text(55, footerY+40, val(data.NoRegistrasi))
	pdf.Text(55, footerY+55, "Tgl Bayar")
	pdf.Text(55, footerY+65, formatDateID(data.TanggalPembayaran))
	pdf.Text(55, footerY+85, "No Validasi")
	pdf.Text(55, footerY+95, val(data.NoValidasi))
	pdf.Text(55, footerY+100, "PPAT / PPATS / NOTARIS")
	pdf.Text(55, footerY+110, val(data.PpatPejabatUmum))

	rightX := 350.0
	pdf.Text(rightX, footerY+10, "Cibinong, "+formatDateID(time.Now()))
	pdf.Text(rightX, footerY+25, "Mengetahui,")
	pdf.Text(rightX, footerY+35, val(data.PvSubjectCn))

	// QR Code / Key
	qrPayload := strings.TrimSpace(data.QrPayload)
	if qrPayload == "" {
		qrPayload = buildDefaultQrPayload(data)
	}
	if qrPayload != "" {
		png, err := qrcode.Encode(qrPayload, qrcode.Medium, 256)
		if err == nil && len(png) > 0 {
			opt := gofpdf.ImageOptions{ImageType: "PNG", ReadDpi: true}
			pdf.RegisterImageOptionsReader("pv_qr", opt, bytes.NewReader(png))
			pdf.ImageOptions("pv_qr", rightX+50, footerY+45, 100, 0, false, opt, 0, "")
		} else {
			pdf.Text(rightX, footerY+45, "Tempat QR CODE")
		}
	}

	// Under QR: special_parafv & NIP
	pdf.Text(rightX, footerY+170, val(data.PvSpecialParafv))
	if strings.TrimSpace(data.PvNip) != "" {
		pdf.Text(rightX, footerY+180, "NIP "+data.PvNip)
	} else {
		pdf.Text(rightX, footerY+180, "NIP Tidak Diketahui")
	}

	// Also print key line (digital signature key) for auditability.
	pdf.SetFont("Helvetica", "", 6)
	pdf.Text(55, 585, "Digital Signature Key: "+shorten(qrPayload, 160))

	return pdf.Output(w)
}

func addValidasiWatermark(pdf *gofpdf.Fpdf, text string) {
	t := strings.TrimSpace(text)
	if t == "" || pdf == nil {
		return
	}
	// Light gray watermark, rotated. Keep it subtle.
	pdf.SetTextColor(220, 220, 220)
	pdf.SetFont("Helvetica", "B", 54)
	pdf.TransformBegin()
	// Rotate around center-ish of page.
	pdf.TransformRotate(35, 300, 420)
	pdf.Text(80, 420, t)
	pdf.TransformEnd()
	// Reset color (black)
	pdf.SetTextColor(0, 0, 0)
}

func drawNjopRow(pdf *gofpdf.Fpdf, y float64, objek, no1 string, luas float64, no2 string, njop float64, no3 string, total float64) {
	pdf.Rect(50, y, 500, 20, "")
	pdf.Line(120, y, 120, y+20)
	pdf.Line(140, y, 140, y+20)
	pdf.Line(250, y, 250, y+20)
	pdf.Line(270, y, 270, y+20)
	pdf.Line(380, y, 380, y+35)
	pdf.Line(400, y, 400, y+35)
	pdf.SetFont("Helvetica", "", 9)
	pdf.Text(55, y+13, objek)
	pdf.Text(125, y+13, no1)
	pdf.Text(150, y+13, fmt.Sprintf("%v m\xb2", trimFloat(luas)))
	pdf.Text(255, y+13, no2)
	pdf.Text(275, y+13, "Rp "+formatIntID(njop))
	pdf.Text(385, y+13, no3)
	pdf.Text(410, y+13, "Rp "+formatIntID(total))
}

func formatIntID(v float64) string {
	n := int64(math.Round(v))
	if n < 0 {
		n = -n
	}
	s := fmt.Sprintf("%d", n)
	var out []byte
	for i, c := range []byte(s) {
		if i > 0 && (len(s)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, c)
	}
	return string(out)
}

func trimFloat(v float64) string {
	if math.Abs(v-math.Round(v)) < 0.0000001 {
		return fmt.Sprintf("%.0f", v)
	}
	return fmt.Sprintf("%.2f", v)
}

func strToFloat(s string) float64 {
	x := strings.TrimSpace(s)
	x = strings.ReplaceAll(x, ".", "")
	x = strings.ReplaceAll(x, ",", ".")
	if x == "" {
		return 0
	}
	f, _ := strconv.ParseFloat(x, 64)
	return f
}

func formatDateID(date interface{}) string {
	switch v := date.(type) {
	case string:
		if strings.TrimSpace(v) == "" {
			return ""
		}
		d, err := time.Parse(time.RFC3339, v)
		if err == nil {
			return d.Format("02 January 2006")
		}
		// try YYYY-MM-DD
		d2, err2 := time.Parse("2006-01-02", v[:min(10, len(v))])
		if err2 == nil {
			return d2.Format("02 January 2006")
		}
		return v
	case time.Time:
		return v.Format("02 January 2006")
	default:
		return fmt.Sprintf("%v", v)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func val(s string) string {
	return strings.TrimSpace(s)
}

func markX(ok bool) string {
	if ok {
		return "X"
	}
	return ""
}

func shorten(s string, n int) string {
	t := strings.TrimSpace(s)
	if len(t) <= n {
		return t
	}
	return t[:n] + "…"
}

func buildDefaultQrPayload(d *repository.ValidasiPDFData) string {
	nv := strings.TrimSpace(d.NoValidasi)
	if nv == "" {
		return ""
	}
	if strings.TrimSpace(d.PvNip) == "" || strings.TrimSpace(d.PvSpecialParafv) == "" || strings.TrimSpace(d.PvCertCreatedAtISO) == "" {
		return ""
	}
	// pv cert created at -> DD/MM/YYYY
	t, err := time.Parse(time.RFC3339, d.PvCertCreatedAtISO)
	if err != nil {
		// tolerate YYYY-MM-DD
		t2, err2 := time.Parse("2006-01-02", d.PvCertCreatedAtISO[:min(10, len(d.PvCertCreatedAtISO))])
		if err2 != nil {
			return ""
		}
		t = t2
	}
	formatted := t.Format("02/01/2006")
	return fmt.Sprintf("%s/%s/%s//E-BPHTB BAPPENDA KAB BOGOR|%s", d.PvNip, formatted, d.PvSpecialParafv, nv)
}

func jenisPerolehanText(code string) string {
	m := map[string]string{
		"01": "Jual Beli",
		"02": "Tukar Menukar",
		"03": "Hibah",
		"04": "Pemasukan dalam Perseroan",
		"05": "Pemisahan Hak",
		"06": "Pelepasan Hak",
		"07": "Penunjukan Pembeli dalam Lelang",
		"08": "Pelaksanaan Putusan Hakim",
		"09": "Penggabungan Usaha",
		"10": "Pemekaran Usaha",
		"11": "Hadiah",
		"12": "Warisan",
		"13": "Pemberian Hak Baru",
		"14": "Kelanjutan Pelepasan Hak",
		"15": "Pemindahan Hak",
		"33": "Lainnya",
	}
	if v, ok := m[code]; ok {
		return v
	}
	return "Tidak Diketahui"
}

