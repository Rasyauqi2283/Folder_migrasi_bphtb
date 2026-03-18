📄 Dokumentasi Perbaikan Layout PDF (NodeJS → Golang)

Dokumen ini menjelaskan perbaikan layout PDF generator di Golang agar hasilnya identik dengan versi NodeJS (PDFKit).

Masalah utama berasal dari perbedaan:

PDFKit (NodeJS) → otomatis wrapping dan flow layout

gofpdf (Go) → harus manual positioning

Akibatnya beberapa elemen PDF menjadi:

tidak sejajar

border tabel rusak

text keluar dari box

spacing tidak konsisten

Dokumen ini menjelaskan 7 perbaikan utama.

1️⃣ Perbaikan Lebar Halaman

Masalah:

Kode NodeJS menggunakan line sampai 700px, sedangkan A4 width sebenarnya 595pt.

NodeJS
doc.moveTo(0, 105).lineTo(700, 105)
Golang (seharusnya)
const pageW = 595.0

leftBorder := 30.0
rightBorder := pageW - 30

pdf.Line(leftBorder, 120, leftBorder, 545)
pdf.Line(rightBorder, 120, rightBorder, 545)
pdf.Line(0, 120, pageW, 120)

⚠️ Jangan gunakan angka statis seperti 560 atau 700.

Gunakan:

pageW - margin
2️⃣ Perbaikan Text Wrapping

Masalah:

PDFKit otomatis wrap text.

Sedangkan Cell() di Go tidak wrap text, sehingga teks keluar dari box.

Salah
pdf.CellFormat(320, 12, data.Letaktanahdanbangunan)
Benar
pdf.MultiCell(320, 12, data.Letaktanahdanbangunan, "", "L", false)

Gunakan MultiCell() untuk field berikut:

Alamat Wajib Pajak

Objek Tanah dan Bangunan

Keterangan

Letak tanah dan bangunan

3️⃣ Perbaikan Struktur Table NJOP

Masalah:

Vertical line tabel NJOP tidak mengikuti width kolom.

Salah
pdf.Line(520, 360, 520, 420)
pdf.Line(40, 420, 520, 420)
Benar
tableWidth := colW[0] + colW[1] + colW[2] + colW[3]

pdf.Line(tblX, tblY, tblX+tableWidth, tblY)
Vertical Line
x := tblX
for _, w := range colW {
    pdf.Line(x, 360, x, tblY+60)
    x += w
}

pdf.Line(x, 360, x, tblY+60)

Dengan ini border tabel akan sejajar sempurna.

4️⃣ Perbaikan Posisi Signature

Masalah:

Signature terlalu ke bawah.

NodeJS
signatureYPosition = 670

Namun layout Go berbeda sehingga harus disesuaikan.

Perbaikan
sigY := 630.0

Karena:

545 + 85 = 630
5️⃣ Perbaikan Box "Jumlah Yang Disetorkan"

Masalah:

Lebar box dan text tidak sama.

NodeJS
moveTo(40,640).lineTo(230,640)
Golang
pdf.Rect(40, 640, 190, 15)
pdf.Rect(250, 640, 340, 15)
Text harus sama dengan width box
pdf.CellFormat(190, 12, formatCurrency(...))

Jangan gunakan width lain.

6️⃣ Konsistensi Font

Masalah:

Label dan value tidak konsisten antara Bold dan Regular.

Salah
pdf.SetFont("Helvetica", "", 10)
pdf.Cell(...)
Benar
pdf.SetFont("Helvetica", "B", 10)
pdf.Cell(...)
pdf.SetFont("Helvetica", "", 10)
pdf.Cell(...)

Standarisasi:

Elemen	Font
Label	Bold
Value	Regular
Header	Bold
7️⃣ Perbaikan Fungsi Row Layout

Fungsi row() terlalu sempit.

Saat ini
pdf.CellFormat(200, 12, val)

Jika text panjang → keluar box.

Perbaikan
pdf.MultiCell(350, 12, val, "", "L", false)


⭐ Rekomendasi Refactor (Best Practice)

Kode PDF saat ini terlalu hardcoded dan panjang (1000+ line).

Sebaiknya buat layout helper function.
Contoh Helper
func labelValue(pdf *gofpdf.Fpdf, x, y float64, label, value string) {

    pdf.SetFont("Helvetica", "B", 10)
    pdf.SetXY(x, y)
    pdf.Cell(90, 12, label)

    pdf.SetFont("Helvetica", "", 10)
    pdf.SetXY(x+90, y)
    pdf.Cell(10, 12, ":")

    pdf.SetXY(x+100, y)
    pdf.Cell(300, 12, value)
}
Penggunaan
labelValue(pdf, 50, 125, "No. Booking", data.Nobooking)
labelValue(pdf, 50, 140, "No. NPWP", data.Npwpwp)
Keuntungan:
-kode 70% lebih pendek
-layout lebih konsisten
-mudah maintenance
-mudah diubah jika desain berubah

🎯 Target Setelah Perbaikan

Jika semua poin diperbaiki:

Layout identik dengan NodeJS

Text tidak keluar dari box

Table border presisi

Signature posisi benar

Code lebih maintainable

✅ Disarankan menggunakan dokumen ini sebagai:

dokumentasi developer

referensi refactor kode

prompt AI coding (Cursor / Copilot / GPT)