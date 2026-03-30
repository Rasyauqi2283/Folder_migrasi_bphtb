package pdf

import (
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"ebphtb/backend/internal/repository"

	"github.com/jung-kurt/gofpdf/v2"
)

const (
	pageW      = 595.0
	margin     = 30.0
	rightBorder = pageW - margin // 565
	leftX      = 50.0
	rightX     = 150.0
	midLabX    = 320.0
	midValX    = 420.0
	rightLab2  = 320.0
	rightVal2  = 460.0
)

// labelValue draws label + ":" + value (single line). Label Bold, value Regular.
func labelValue(pdf *gofpdf.Fpdf, x, y, labelW, valueW float64, label, value string) {
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(x, y)
	pdf.CellFormat(labelW, 12, label, "", 0, "L", false, 0, "")
	pdf.SetXY(x+labelW, y)
	pdf.CellFormat(10, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(x+labelW+10, y)
	pdf.CellFormat(valueW, 12, value, "", 0, "L", false, 0, "")
}

// labelValueMulti draws label + ":" then value with MultiCell (wrapping). Returns new Y after value.
func labelValueMulti(pdf *gofpdf.Fpdf, x, y, labelW, valueW float64, label, value string) float64 {
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(x, y)
	pdf.CellFormat(labelW, 12, label, "", 0, "L", false, 0, "")
	pdf.SetXY(x+labelW, y)
	pdf.CellFormat(10, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(x+labelW+10, y)
	pdf.MultiCell(valueW, 12, value, "", "L", false)
	return pdf.GetY()
}

var bulanIndo = []string{"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}

func formatTanggal(s string) string {
	if s == "" {
		return ""
	}
	parts := strings.Split(s, "-")
	if len(parts) != 3 {
		return s
	}
	day, month, year := parts[0], parts[1], parts[2]
	mi, _ := strconv.Atoi(month)
	if mi < 1 || mi > 12 {
		return s
	}
	return day + " " + bulanIndo[mi-1] + " " + year
}

func formatNumberID(v float64) string {
	// 2 decimals, thousands '.', decimals ','
	s := fmt.Sprintf("%.2f", math.Abs(v))
	parts := strings.SplitN(s, ".", 2)
	intPart := parts[0]
	decPart := "00"
	if len(parts) == 2 {
		decPart = parts[1]
	}
	var b strings.Builder
	for i, c := range intPart {
		if i > 0 && (len(intPart)-i)%3 == 0 {
			b.WriteByte('.')
		}
		b.WriteRune(c)
	}
	out := b.String() + "," + decPart
	if v < 0 {
		out = "-" + out
	}
	return out
}

func formatCurrency(v float64) string {
	return "Rp " + formatNumberID(v)
}

// GenerateSSPD writes SSPD BPHTB (Badan) PDF to w, matching legacy layout. logoPath is optional (BAPPENDA logo).
func GenerateSSPD(w io.Writer, data *repository.SSPDPDFData, logoPath string) error {
	if data == nil {
		return fmt.Errorf("data is nil")
	}
	pdf := gofpdf.New("P", "pt", "A4", "")
	pdf.SetMargins(30, 30, 30)
	pdf.SetAutoPageBreak(false, 30)
	pdf.AddPage()
	pdf.SetFont("Helvetica", "", 10)

	// Logo (top-left, like legacy)
	if logoPath != "" {
		if _, err := os.Stat(logoPath); err == nil {
			logoWidth := pageW * 0.11
			pdf.Image(logoPath, 35, 30, logoWidth, 0, false, "", 0, "")
		}
	}

	// Title block (fixed positions like Node)
	pdf.SetFont("Helvetica", "B", 16)
	pdf.SetXY(200, 40)
	pdf.CellFormat(195, 14, "SURAT SETORAN PAJAK DAERAH", "", 0, "C", false, 0, "")
	pdf.SetXY(130, 60)
	pdf.CellFormat(335, 14, "BEA PEROLEHAN HAK ATAS TANAH DAN BANGUNAN", "", 0, "C", false, 0, "")
	pdf.SetXY(260, 80)
	pdf.CellFormat(75, 14, "(SSPD - BPHTB)", "", 0, "C", false, 0, "")
	pdf.Line(0, 105, pageW, 105)
	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetXY(40, 110)
	pdf.CellFormat(455, 10, "Badan Pengelolaan Pendapatan Daerah Kabupaten Bogor", "", 0, "L", false, 0, "")

	// Main content border: vertical at margin & rightBorder, top line 120
	pdf.Line(margin, 120, margin, 545)
	pdf.Line(rightBorder, 120, rightBorder, 545)
	pdf.Line(0, 120, pageW, 120)

	// Wajib Pajak section: label Bold, value Regular; long fields use MultiCell
	labelValue(pdf, leftX, 125, 90, 350, "No. Booking", data.Nobooking)
	labelValue(pdf, leftX, 140, 90, 350, "No. NPWP", data.Npwpwp)
	labelValue(pdf, leftX, 155, 90, 350, "Nama Wajib Pajak", data.Namawajibpajak)
	labelValueMulti(pdf, leftX, 170, 90, 350, "Alamat Wajib Pajak", data.Alamatwajibpajak)
	labelValue(pdf, leftX, 195, 90, 350, "Kabupaten/Kota", data.Kabupatenkotawp)
	labelValue(pdf, leftX, 210, 90, 350, "Kecamatan", data.Kecamatanwp)
	labelValue(pdf, leftX, 225, 90, 350, "Tahun AJB", data.Tahunajb)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(midLabX, 195)
	pdf.CellFormat(90, 12, "Kelurahan/Desa", "", 0, "L", false, 0, "")
	pdf.SetXY(midValX-10, 195)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(midValX, 195)
	pdf.CellFormat(rightBorder-midValX-10, 12, data.Kelurahandesawp, "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(midLabX, 210)
	pdf.CellFormat(90, 12, "RT/RW", "", 0, "L", false, 0, "")
	pdf.SetXY(midValX-10, 210)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(midValX, 210)
	pdf.CellFormat(rightBorder-midValX-10, 12, data.Rtrwwp, "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(midLabX, 225)
	pdf.CellFormat(90, 12, "Kodepos", "", 0, "L", false, 0, "")
	pdf.SetXY(midValX-10, 225)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(midValX, 225)
	pdf.CellFormat(rightBorder-midValX-10, 12, data.Kodeposwp, "", 0, "L", false, 0, "")
	pdf.SetXY(midLabX, 125)
	pdf.CellFormat(200, 12, "Jenis Wajib Pajak     : Badan Usaha", "", 0, "L", false, 0, "")

	// Objek Pajak section; long text use MultiCell
	pdf.Line(margin, 235, rightBorder, 235)
	labelValue(pdf, leftX, 245, 180, rightBorder-230, "Nomor Objek Pajak(NOP) PBB", data.Noppbb)
	labelValueMulti(pdf, leftX, 260, 180, rightBorder-230, "Objek Tanah dan/atau Bangunan", data.Letaktanahdanbangunan)
	labelValueMulti(pdf, leftX, 295, 90, rightVal2-rightX-10, "Keterangan", data.Keterangan)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(rightLab2, 295)
	pdf.CellFormat(130, 12, "Nomor Bukti Pembayaran", "", 0, "L", false, 0, "")
	pdf.SetXY(rightVal2-10, 295)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightVal2, 295)
	pdf.CellFormat(rightBorder-rightVal2-5, 12, data.NomorBuktiPembayaran, "", 0, "L", false, 0, "")
	labelValue(pdf, leftX, 310, 90, rightVal2-rightX-10, "RT/RW", data.RtRwobjekpajak)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(rightLab2, 310)
	pdf.CellFormat(130, 12, "Tanggal Perolehan", "", 0, "L", false, 0, "")
	pdf.SetXY(rightVal2-10, 310)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightVal2, 310)
	pdf.CellFormat(rightBorder-rightVal2-5, 12, formatTanggal(data.TanggalPerolehan), "", 0, "L", false, 0, "")
	labelValue(pdf, leftX, 325, 90, rightVal2-rightX-10, "Status Kepemilikan", data.StatusKepemilikan)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(rightLab2, 325)
	pdf.CellFormat(130, 12, "Tanggal Pembayaran", "", 0, "L", false, 0, "")
	pdf.SetXY(rightVal2-10, 325)
	pdf.CellFormat(20, 12, ":", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(rightVal2, 325)
	pdf.CellFormat(rightBorder-rightVal2-5, 12, formatTanggal(data.TanggalPembayaran), "", 0, "L", false, 0, "")
	labelValue(pdf, rightLab2, 350, 90, rightBorder-410, "Nomor Sertifikat", data.NomorSertifikat)

	// Table NJOP: colWidths [100, 80, 120, 180], border from tableWidth
	colW := [4]float64{100, 80, 120, 180}
	tblX := 40.0
	tableWidth := colW[0] + colW[1] + colW[2] + colW[3]
	tblY := 360.0
	tblBottom := tblY + 60
	pdf.Line(tblX, tblY, tblX+tableWidth, tblY)
	pdf.SetFont("Helvetica", "B", 10)
	// NOTE: gofpdf core fonts are ISO-8859-1; use Latin-1 bytes to avoid UTF-8 artifacts.
	// \xb2 = superscript 2 (²), \xd7 = multiplication sign (×).
	for i, h := range []string{"BPHTB", "Luas/m\xb2", "NJOP PBB", "Luas \xd7 NJOP PBB/m\xb2"} {
		x := tblX
		for j := 0; j < i; j++ {
			x += colW[j]
		}
		pdf.SetXY(x, tblY+4)
		pdf.CellFormat(colW[i], 20, h, "", 0, "C", false, 0, "")
	}
	tblY += 20
	pdf.Line(tblX, tblY, tblX+tableWidth, tblY)
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(tblX, tblY+4)
	pdf.CellFormat(colW[0], 20, "Tanah (Bumi)", "", 0, "L", false, 0, "")
	pdf.CellFormat(colW[1], 20, formatNumberID(data.LuasTanah), "", 0, "R", false, 0, "")
	pdf.CellFormat(colW[2], 20, formatCurrency(data.NjopTanah), "", 0, "R", false, 0, "")
	pdf.CellFormat(colW[3], 20, formatCurrency(data.LuasxnjopTanah), "", 0, "R", false, 0, "")
	tblY += 20
	pdf.Line(tblX, tblY, tblX+tableWidth, tblY)
	pdf.SetXY(tblX, tblY+4)
	pdf.CellFormat(colW[0], 20, "Bangunan", "", 0, "L", false, 0, "")
	pdf.CellFormat(colW[1], 20, formatNumberID(data.LuasBangunan), "", 0, "R", false, 0, "")
	pdf.CellFormat(colW[2], 20, formatCurrency(data.NjopBangunan), "", 0, "R", false, 0, "")
	pdf.CellFormat(colW[3], 20, formatCurrency(data.LuasxnjopBangunan), "", 0, "R", false, 0, "")
	tblY += 20
	totalNJOP := data.LuasxnjopTanah + data.LuasxnjopBangunan
	pdf.Line(tblX+colW[0]+colW[1], tblY, tblX+tableWidth, tblY)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(tblX+colW[0]+colW[1], tblY+4)
	pdf.CellFormat(colW[2], 20, "TOTAL NILAI", "", 0, "C", false, 0, "")
	pdf.CellFormat(colW[3], 20, formatCurrency(totalNJOP), "", 0, "R", false, 0, "")
	x := tblX
	for _, w := range colW {
		pdf.Line(x, 360, x, tblBottom)
		x += w
	}
	pdf.Line(x, 360, x, tblBottom)
	pdf.Line(tblX, 420, tblX+tableWidth, 420)

	// Penghitungan BPHTB
	calc := repository.CalculateBPHTB(totalNJOP, data.HargaTransaksi, data.JenisPerolehan, data.BphtbYangtelahDibayar)
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(40, 470)
	pdf.CellFormat(100, 12, "Penghitungan BPHTB", "", 0, "L", false, 0, "")
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetXY(145, 471.5)
	pdf.CellFormat(250, 10, "(Harga diisi berdasarkan penghitungan Wajib Pajak)", "", 0, "L", false, 0, "")
	pdf.Line(margin, 480, rightBorder, 480)
	pdf.Line(405, 480, 405, 545)
	pdf.Line(415, 480, 415, 545)
	pdf.Line(320, 480, 320, 545)
	pdf.Line(320, 493, rightBorder, 493)
	pdf.Line(320, 503, rightBorder, 503)
	pdf.Line(320, 513, rightBorder, 513)
	pdf.Line(320, 523, rightBorder, 523)
	pdf.Line(320, 533, rightBorder, 533)
	items := []struct {
		label string
		val   string
	}{
		{"1. Nilai Perolehan Objek Pajak (NPOP)", formatCurrency(calc.NPOP)},
		{"2. Nilai Perolehan Objek Pajak Tidak Kena Pajak (NPOPTKP)", formatCurrency(calc.NPOPTKP)},
		{"3. Nilai Perolehan Objek Pajak Kena Pajak (NPOPKP)", formatCurrency(calc.NPOPKP)},
		{"4. Bea Perolehan Hak atas Tanah dan Bangunan yang terutang", formatCurrency(calc.BeaTerutang)},
		{"5. Bea Perolehan Hak atas Tanah dan Bangunan yang telah dibayar", formatCurrency(calc.BeaDibayar)},
		{"6. Bea Perolehan Hak atas Tanah dan Bangunan yang kurang dibayar", formatCurrency(calc.KurangBayar)},
	}
	for i, it := range items {
		y := 485.0 + float64(i)*10
		pdf.SetFont("Helvetica", "", 9)
		pdf.SetXY(40, y)
		pdf.CellFormat(275, 10, it.label, "", 0, "L", false, 0, "")
		pdf.SetXY(420, y)
		pdf.CellFormat(135, 10, it.val, "", 0, "R", false, 0, "")
		pdf.SetFont("Helvetica", "", 8)
		pdf.SetXY(407, y)
		pdf.CellFormat(8, 10, fmt.Sprintf("%d", i+1), "", 0, "C", false, 0, "")
	}
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(323, 505)
	pdf.CellFormat(80, 10, "angka 1 - angka 2", "", 0, "L", false, 0, "")
	pdf.SetXY(323, 515)
	pdf.CellFormat(80, 10, "5% x angka 3", "", 0, "L", false, 0, "")
	pdf.SetXY(323, 535)
	pdf.CellFormat(80, 10, "angka 4 - angka 5", "", 0, "L", false, 0, "")
	pdf.Line(0, 545, pageW, 545)

	// Jumlah Setoran Berdasarkan
	selY := 550.0
	pdf.SetFont("Helvetica", "B", 10)
	pdf.SetXY(40, selY)
	pdf.CellFormat(250, 12, "Jumlah Setoran Berdasarkan:", "", 0, "L", false, 0, "")
	pdf.Line(0, selY+10, pageW, selY+10)
	drawCheckbox := func(x, y float64, checked bool) {
		pdf.Rect(x, y, 12, 12, "D")
		if checked {
			pdf.SetFont("Helvetica", "B", 14)
			pdf.SetXY(x+1, y-2)
			pdf.CellFormat(10, 14, "x", "", 0, "C", false, 0, "")
			pdf.SetFont("Helvetica", "", 10)
		}
	}
	opts := []struct {
		label string
		checked bool
	}{
		{"a. Penghitungan Wajib Pajak", false},
		{"b. STPD BPHTB/SKPDB KURANG BAYAR*)", false},
		{"c. Pengurangan dihitung sendiri menjadi:", false},
		{"d. .........", false},
	}
	// Strict rule:
	// - If point 6 == 0 => mark [X] at a. Penghitungan Wajib Pajak
	// - If point 6 > 0  => mark [X] at b. STPD BPHTB
	if calc.KurangBayar <= 0.0001 {
		opts[0].checked = true
	} else {
		opts[1].checked = true
	}

	for i, o := range opts {
		y := selY + 20 + float64(i)*15
		drawCheckbox(40, y, o.checked)
		pdf.SetFont("Helvetica", "", 9)
		pdf.SetXY(60, y-2)
		pdf.CellFormat(400, 12, o.label, "", 0, "L", false, 0, "")
	}
	// Align "Nomor/Tanggal" with option b line, and "% berdasarkan" with option c line.
	yB := selY + 20 + 1*15
	yC := selY + 20 + 2*15
	nomorText := "Nomor: ______"
	tanggalText := "Tanggal: ______"
	if calc.KurangBayar > 0.0001 {
		if strings.TrimSpace(data.StpdCode) != "" {
			nomorText = "Nomor: " + strings.TrimSpace(data.StpdCode)
		}
		// Prefer tanggalstpd from p_1_verifikasi; best-effort format DD/MM/YYYY.
		if strings.TrimSpace(data.TanggalStpd) != "" {
			tanggalText = "Tanggal: " + formatTanggal(strings.TrimSpace(data.TanggalStpd))
		}
	}
	pdf.SetFont("Helvetica", "", 9)
	pdf.SetXY(300, yB-2)
	pdf.CellFormat(90, 12, nomorText, "", 0, "L", false, 0, "")
	pdf.SetXY(410, yB-2)
	pdf.CellFormat(110, 12, tanggalText, "", 0, "L", false, 0, "")
	pdf.SetXY(300, yC-2)
	pdf.CellFormat(200, 12, "% berdasarkan ......", "", 0, "L", false, 0, "")

	// Jumlah Yang Disetorkan: box width 190 (40–230), 340 (250–590); text width = box width
	pdf.SetFont("Helvetica", "", 10)
	pdf.SetXY(40, 630)
	pdf.CellFormat(200, 12, "Jumlah Yang Disetorkan:", "", 0, "L", false, 0, "")
	pdf.SetXY(250, 630)
	pdf.CellFormat(150, 12, "Dengan huruf:", "", 0, "L", false, 0, "")
	pdf.Rect(40, 640, 190, 15, "D")
	pdf.SetXY(45, 643)
	pdf.CellFormat(190, 12, formatCurrency(calc.BeaDibayar), "", 0, "L", false, 0, "")
	pdf.Rect(250, 640, 340, 15, "D")
	pdf.SetXY(255, 643)
	pdf.CellFormat(340, 12, terbilangRupiah(calc.BeaDibayar), "", 0, "L", false, 0, "")
	pdf.Line(0, 660, pageW, 660)

	// Signature blocks (4 columns); start below line 660
	sigY := 670.0
	colW2 := 110.0
	gap := 24.0
	cols := []float64{30, 30 + colW2 + gap, 30 + 2*(colW2+gap), 30 + 3*(colW2+gap) + 20}
	pdf.SetFont("Helvetica", "", 8)
	pdf.SetXY(cols[0], sigY)
	pdf.CellFormat(colW2, 10, data.Kabupatenkotawp+", tgl "+data.Tanggal, "", 0, "C", false, 0, "")
	pdf.SetXY(cols[1], sigY)
	pdf.CellFormat(colW2, 10, "PPAT/PPATS/NOTARIS", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[2], sigY)
	pdf.CellFormat(colW2, 10, "DITERIMA OLEH:", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[3], sigY)
	pdf.CellFormat(colW2, 10, "Telah Diverifikasi", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[0], sigY+15)
	pdf.CellFormat(colW2, 10, "WAJIB PAJAK/PENYETOR", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[0], sigY+30)
	pdf.CellFormat(colW2, 10, data.Namawajibpajak, "", 0, "C", false, 0, "")
	// Inject WP signature (if available) proportionally inside Wajib Pajak area.
	if strings.TrimSpace(data.PathTtdWp) != "" {
		drawImageContain(pdf, data.PathTtdWp, cols[0]+8, sigY+34, colW2-16, 34)
	}
	pdf.SetXY(cols[1], sigY+10)
	pdf.CellFormat(colW2, 10, data.NamaPembuat, "", 0, "C", false, 0, "")
	pdf.SetXY(cols[1], sigY+70)
	pdf.CellFormat(colW2, 10, data.SpecialField, "", 0, "C", false, 0, "")
	pdf.SetXY(cols[2], sigY+10)
	pdf.CellFormat(colW2, 10, "TEMPAT PEMBAYARAN BPHTB", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[2], sigY+20)
	pdf.CellFormat(colW2, 10, "tanggal : .........", "", 0, "C", false, 0, "")
	pdf.Line(cols[2]+(colW2-80)/2, sigY+50, cols[2]+(colW2-80)/2+80, sigY+50)
	pdf.SetXY(cols[2], sigY+70)
	pdf.CellFormat(colW2, 10, "(................................)", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[3], sigY+10)
	pdf.CellFormat(colW2, 10, "BADAN PENDAPATAN DAERAH", "", 0, "C", false, 0, "")
	pdf.Rect(cols[3]+(colW2-110)/2, sigY+30, 110, 50, "D")
	pdf.SetXY(cols[3], sigY+70)
	pdf.CellFormat(colW2, 10, "(................................)", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[0], sigY+90)
	pdf.CellFormat(colW2, 10, "Nomor Validasi", "", 0, "C", false, 0, "")
	pdf.SetXY(cols[0], sigY+105)
	pdf.CellFormat(colW2, 10, "...............", "", 0, "C", false, 0, "")
	pdf.Line(0, sigY+85, pageW, sigY+85)

	return pdf.Output(w)
}

func drawImageContain(pdf *gofpdf.Fpdf, imgPath string, x, y, maxW, maxH float64) {
	if strings.TrimSpace(imgPath) == "" {
		return
	}
	if _, err := os.Stat(imgPath); err != nil {
		return
	}
	ext := strings.ToLower(filepath.Ext(imgPath))
	imgType := "PNG"
	if ext == ".jpg" || ext == ".jpeg" {
		imgType = "JPG"
	} else if ext == ".webp" {
		// gofpdf may not support WEBP directly in all builds.
		return
	}
	opts := gofpdf.ImageOptions{ImageType: imgType, ReadDpi: true}
	info := pdf.RegisterImageOptions(imgPath, opts)
	if info == nil {
		return
	}
	w := info.Width()
	h := info.Height()
	if w <= 0 || h <= 0 || maxW <= 0 || maxH <= 0 {
		return
	}
	scale := maxW / w
	if (h * scale) > maxH {
		scale = maxH / h
	}
	drawW := w * scale
	drawH := h * scale
	dx := x + (maxW-drawW)/2
	dy := y + (maxH-drawH)/2
	pdf.ImageOptions(imgPath, dx, dy, drawW, drawH, false, opts, 0, "")
}

func terbilangRupiah(angka float64) string {
	if angka <= 0 {
		return "Nol Rupiah"
	}
	return terbilang(int64(angka)) + " Rupiah"
}

func terbilang(n int64) string {
	if n == 0 {
		return "Nol"
	}
	satuan := []string{"", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"}
	belasan := []string{"Sepuluh", "Sebelas", "Dua Belas", "Tiga Belas", "Empat Belas", "Lima Belas", "Enam Belas", "Tujuh Belas", "Delapan Belas", "Sembilan Belas"}
	var f func(int64) string
	f = func(num int64) string {
		if num < 10 {
			return satuan[num]
		}
		if num < 20 {
			return belasan[num-10]
		}
		if num < 100 {
			return f(num/10) + " Puluh " + f(num%10)
		}
		if num < 200 {
			return "Seratus " + f(num-100)
		}
		if num < 1000 {
			return f(num/100) + " Ratus " + f(num%100)
		}
		if num < 2000 {
			return "Seribu " + f(num-1000)
		}
		if num < 1000000 {
			return f(num/1000) + " Ribu " + f(num%1000)
		}
		if num < 1000000000 {
			return f(num/1000000) + " Juta " + f(num%1000000)
		}
		if num < 1000000000000 {
			return f(num/1000000000) + " Milyar " + f(num%1000000000)
		}
		return f(num/1000000000000) + " Triliun " + f(num%1000000000000)
	}
	return strings.TrimSpace(f(n))
}

/////////////////////////////////////////////////////////////

// GenerateMohonValidasi writes Permohonan Validasi PDF to w.
func GenerateMohonValidasi(w io.Writer, data *repository.MohonValidasiPDFData) error {
	if data == nil {
		return fmt.Errorf("data is nil")
	}
	// Match Node.js PDFKit layout: units are "points". We render with mm and convert.
	const ptToMm = 0.3527
	mm := func(pt float64) float64 { return pt * ptToMm }

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.SetAutoPageBreak(false, 0)
	pdf.AddPage()

	// Coordinates from JS (points)
	leftColumnX := 20.0
	middleColumnX := 150.0
	currentY := 50.0

	bold := "B"
	normal := ""

	// Header grey bar
	headerHeight := 60.0
	footerHeight := 30.0
	pdf.SetFillColor(105, 105, 105)
	pdf.Rect(0, mm(headerHeight-10), 210, mm(footerHeight), "F")
	pdf.SetTextColor(0, 0, 0)

	// Title centered
	pdf.SetFont("Helvetica", bold, 14)
	pdf.SetXY(mm(leftColumnX), mm(60))
	pdf.CellFormat(mm(500), mm(14), "FORMULIR PERMOHONAN PENELITIAN SSPD BPHTB", "", 0, "C", false, 0, "")
	currentY = headerHeight + footerHeight + 10 // 100

	// Intro lines
	pdf.SetFont("Helvetica", normal, 12)
	pdf.SetXY(mm(leftColumnX), mm(currentY))
	pdf.CellFormat(0, mm(12), "Lamp  : 1 (satu) set", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(leftColumnX), mm(currentY+10))
	pdf.CellFormat(0, mm(12), "Perihal : Penyampaian SSPD BPHTB untuk Diteliti", "", 0, "L", false, 0, "")
	currentY += 50

	// Addressee
	paraf := "______"
	if strings.TrimSpace(data.SpecialField) != "" {
		// Keep placeholder behavior: actual "parafv" is not available in this data struct; use blank.
		paraf = "______"
	}
	pdf.SetXY(mm(leftColumnX), mm(currentY))
	pdf.CellFormat(0, mm(12), "Yth. Kepala Dinas "+paraf, "", 0, "L", false, 0, "")
	pdf.SetXY(mm(leftColumnX), mm(currentY+10))
	pdf.CellFormat(0, mm(12), "Kabupaten Bogor", "", 0, "L", false, 0, "")
	currentY += 30

	pdf.SetXY(mm(leftColumnX), mm(currentY))
	pdf.CellFormat(0, mm(12), "Yang bertanda tangan di bawah ini :", "", 0, "L", false, 0, "")
	currentY += 20

	// Helper: label ":" value, with fixed X like JS.
	drawRow := func(label, value string, y float64) float64 {
		pdf.SetFont("Helvetica", normal, 12)
		pdf.SetXY(mm(leftColumnX), mm(y))
		pdf.CellFormat(mm(middleColumnX-leftColumnX-20), mm(12), label, "", 0, "L", false, 0, "")
		pdf.SetXY(mm(middleColumnX-10), mm(y))
		pdf.CellFormat(mm(10), mm(12), ":", "", 0, "L", false, 0, "")
		pdf.SetXY(mm(middleColumnX), mm(y))
		pdf.CellFormat(mm(500-middleColumnX), mm(12), value, "", 0, "L", false, 0, "")
		return y + 12
	}
	// Multi-line value (wrap within width 500-middleColumnX).
	drawRowMulti := func(label, value string, y float64) float64 {
		pdf.SetFont("Helvetica", normal, 12)
		pdf.SetXY(mm(leftColumnX), mm(y))
		pdf.CellFormat(mm(middleColumnX-leftColumnX-20), mm(12), label, "", 0, "L", false, 0, "")
		pdf.SetXY(mm(middleColumnX-10), mm(y))
		pdf.CellFormat(mm(10), mm(12), ":", "", 0, "L", false, 0, "")
		pdf.SetXY(mm(middleColumnX), mm(y))
		pdf.MultiCell(mm(500-middleColumnX), mm(12), value, "", "L", false)
		return (pdf.GetY() / ptToMm) // convert back to pt-ish baseline for subsequent y math
	}

	namaPemohon := strings.TrimSpace(data.NamaPembuat)
	if namaPemohon == "" {
		namaPemohon = "______"
	}
	alamatPemohon := strings.TrimSpace(data.AlamatPemohon)
	if alamatPemohon == "" {
		alamatPemohon = "______"
	}
	telepon := strings.TrimSpace(data.Telepon)
	if telepon == "" {
		telepon = "______"
	}
	currentY = drawRow("Nama Pemohon", namaPemohon, currentY)
	currentY = drawRow("Alamat", alamatPemohon, currentY)
	currentY = drawRow("No. Telepon", telepon, currentY)
	currentY += 30

	// WP block
	namaWp := strings.TrimSpace(data.Namawajibpajak)
	if namaWp == "" {
		namaWp = "______"
	}
	alamatWp := strings.TrimSpace(data.Alamatwajibpajak)
	if alamatWp == "" {
		alamatWp = "______"
	}
	kelWp := strings.TrimSpace(data.Kelurahandesawp)
	if kelWp == "" {
		kelWp = "______"
	}
	kecWp := strings.TrimSpace(data.Kecamatanwp)
	if kecWp == "" {
		kecWp = "______"
	}
	kabWp := strings.TrimSpace(data.Kabupatenkotawp)
	if kabWp == "" {
		kabWp = "______"
	}
	currentY = drawRow("Nama Wajib Pajak", namaWp, currentY)
	currentY = drawRow("Alamat", alamatWp, currentY)
	currentY = drawRow("Desa / Kelurahan", kelWp, currentY)
	currentY = drawRow("Kecamatan", kecWp, currentY)
	currentY = drawRow("Kabupaten/Kota", kabWp, currentY)
	currentY += 20

	// Description paragraph
	pdf.SetFont("Helvetica", normal, 12)
	pdf.SetXY(mm(leftColumnX), mm(currentY))
	pdf.MultiCell(mm(500), mm(12), "Bersama ini disampaikan SSPD BPHTB untuk diteliti atas perolehan hak atas tanah dan/atau bangunan sebagai berikut :", "", "L", false)
	currentY = (pdf.GetY() / ptToMm) + 28 // match JS +40 (approx after wrapping)

	// Object data
	nop := strings.TrimSpace(data.Noppbb)
	if nop == "" {
		nop = "______"
	}
	atasNama := strings.TrimSpace(data.Namapemilikobjekpajak)
	if atasNama == "" {
		atasNama = "______"
	}
	letak := strings.TrimSpace(data.Letaktanahdanbangunan)
	if letak == "" {
		letak = "______"
	}
	luasStr := fmt.Sprintf("Tanah %s m²   Bangunan %s m²", formatNumberID(data.LuasTanah), formatNumberID(data.LuasBangunan))
	currentY = drawRow("NOP", nop, currentY)
	currentY = drawRow("Atas Nama", atasNama, currentY)
	currentY = drawRow("Luas", luasStr, currentY)
	currentY = drawRowMulti("Alamat", letak, currentY)

	// Sub rows start at x=150/250 like JS
	kampung := strings.TrimSpace(data.Kampungop)
	if kampung == "" {
		kampung = "_______________"
	}
	kelOp := strings.TrimSpace(data.Kelurahanop)
	if kelOp == "" {
		kelOp = "_______________"
	}
	kecOp := strings.TrimSpace(data.Kecamatanopj)
	if kecOp == "" {
		kecOp = "_______________"
	}
	pdf.SetFont("Helvetica", normal, 12)
	pdf.SetXY(mm(150), mm(currentY))
	pdf.CellFormat(mm(100), mm(12), "Kampung", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(240), mm(currentY))
	pdf.CellFormat(mm(10), mm(12), ":", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(250), mm(currentY))
	pdf.CellFormat(mm(260), mm(12), kampung, "", 0, "L", false, 0, "")
	currentY += 12

	pdf.SetXY(mm(150), mm(currentY))
	pdf.CellFormat(mm(100), mm(12), "Desa/Kelurahan", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(240), mm(currentY))
	pdf.CellFormat(mm(10), mm(12), ":", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(250), mm(currentY))
	pdf.CellFormat(mm(260), mm(12), kelOp, "", 0, "L", false, 0, "")
	currentY += 12

	pdf.SetXY(mm(150), mm(currentY))
	pdf.CellFormat(mm(100), mm(12), "Kecamatan", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(240), mm(currentY))
	pdf.CellFormat(mm(10), mm(12), ":", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(250), mm(currentY))
	pdf.CellFormat(mm(260), mm(12), kecOp+" Kabupaten Bogor", "", 0, "L", false, 0, "")
	currentY += 20

	// Attachment header
	pdf.SetFont("Helvetica", bold, 12)
	pdf.SetXY(mm(leftColumnX), mm(currentY))
	pdf.CellFormat(0, mm(12), "Terlampir dokumen sebagai berikut :", "", 0, "L", false, 0, "")
	currentY += 15

	// Attachment list uses fixed Y in JS; mimic for exact look.
	pdf.SetFont("Helvetica", normal, 12)
	keterangan := strings.TrimSpace(data.Keterangan)
	if keterangan == "" {
		keterangan = "______"
	}
	type fixedLine struct {
		txt string
		x   float64
		y   float64
	}
	lines := []fixedLine{
		{txt: "a.", x: 20, y: 475}, {txt: "SSPD BPHTB yang telah diregistrasi.", x: 32, y: 475},
		{txt: "b.", x: 20, y: 488}, {txt: "Fotocopy KTP Pemohon/Wajib Pajak, apabila dikuasakan disertakan Surat Kuasa dan fotocopy KTP", x: 32, y: 488},
		{txt: "penerima kuasa.", x: 32, y: 501},
		{txt: "c.", x: 20, y: 514}, {txt: "Foto Copy SPPT PBB dan STTS Terakhir.", x: 32, y: 514},
		{txt: "d.", x: 20, y: 527}, {txt: "Surat Setoran Bank/bukti penerimaan bank.", x: 32, y: 527},
		{txt: "e.", x: 20, y: 540}, {txt: "Dokumen yang membuktikan/menunjukan terjadinya perolehan hak atas tanah dan/atau bangunan", x: 32, y: 540},
		{txt: "yang dijadikan dasar pembuatan akta.", x: 32, y: 553},
		{txt: "f.", x: 20, y: 566}, {txt: "Bukti tidak memiliki tunggakan PBB.", x: 32, y: 566},
		{txt: "g.", x: 20, y: 579}, {txt: "Fotocopy Sertifikat Tanah.", x: 32, y: 579},
		{txt: "h.", x: 20, y: 592}, {txt: keterangan, x: 32, y: 592},
	}
	for _, ln := range lines {
		pdf.SetXY(mm(ln.x), mm(ln.y))
		pdf.CellFormat(0, mm(12), ln.txt, "", 0, "L", false, 0, "")
	}

	// Signature block (computed like JS)
	currentY += 140
	baseY := currentY + 40
	leftSigX := 80.0
	rightSigX := 350.0

	// Date & location
	pdf.SetFont("Helvetica", normal, 12)
	pdf.SetXY(mm(rightSigX+20), mm(baseY-25))
	pdf.CellFormat(0, mm(12), "Cibinong,", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(rightSigX+70), mm(baseY-25))
	pdf.CellFormat(0, mm(12), formatTanggal(data.Tanggal)+" 20__", "", 0, "L", false, 0, "")

	// Labels
	pdf.SetXY(mm(leftSigX-35), mm(baseY))
	pdf.CellFormat(0, mm(12), "Petugas Penerima Berkas,", "", 0, "L", false, 0, "")
	pdf.SetXY(mm(rightSigX+60), mm(baseY))
	pdf.CellFormat(0, mm(12), "Pemohon", "", 0, "L", false, 0, "")

	// Signature image (best-effort). We only render if a local file is reachable.
	if p := strings.TrimSpace(data.TandaTanganPath); p != "" && !strings.HasPrefix(p, "http://") && !strings.HasPrefix(p, "https://") {
		candidates := []string{p}
		if strings.HasPrefix(p, "/") {
			candidates = append(candidates, strings.TrimPrefix(p, "/"))
		}
		var sigPath string
		for _, c := range candidates {
			if c == "" {
				continue
			}
			if _, err := os.Stat(c); err == nil {
				sigPath = c
				break
			}
			// try relative to current working directory
			if _, err := os.Stat(filepath.Clean(c)); err == nil {
				sigPath = filepath.Clean(c)
				break
			}
		}
		if sigPath != "" {
			pdf.ImageOptions(sigPath, mm(rightSigX+40), mm(baseY+20), mm(35), 0, false, gofpdf.ImageOptions{ReadDpi: true}, 0, "")
		}
	}

	// Names
	nameY := baseY + 100
	namaPengirim := strings.TrimSpace(data.NamaPengirim)
	if namaPengirim == "" {
		namaPengirim = "_____________________"
	}
	special := strings.TrimSpace(data.SpecialField)
	if special == "" {
		special = "_____________________"
	}
	pdf.SetXY(mm(leftSigX-60), mm(nameY))
	pdf.CellFormat(mm(200), mm(12), namaPengirim, "", 0, "C", false, 0, "")
	pdf.SetXY(mm(rightSigX), mm(nameY))
	pdf.CellFormat(mm(200), mm(12), special, "", 0, "C", false, 0, "")

	return pdf.Output(w)
}
