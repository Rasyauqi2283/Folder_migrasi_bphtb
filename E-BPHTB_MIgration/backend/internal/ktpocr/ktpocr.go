package ktpocr

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"log"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/disintegration/imaging"
)

const (
	ocrTimeoutSec   = 12  // per tesseract invocation (avoid long hangs)
	maxFileSize     = 10 * 1024 * 1024
	minWidthUpscale = 1000
	targetWidthLow  = 1800 // Slightly higher default width for OCR
	targetWidthHigh = 2200
	// early exit when we already have strong NIK + nama + confidence
	earlyExitMinConf = 78.0
)

var supportedExts = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".bmp": true}

// tesseract PSM modes:
// 6=uniform block (KTP layout), 11=sparse, 4=single column (some photos)
var tesseractPSMs = []string{"6", "11"}

// tesseractPSMsFast: first pass only block (fastest; often enough for clear KTP)
var tesseractPSMsFast = []string{"6"}

// preprocessVariant defines method + optional rotation angle (degrees)
type preprocessVariant struct {
	method   string
	rotation float64
}

type qualityMetrics struct {
	Brightness float64
	Contrast   float64
	Sharpness  float64
	IsHardCase bool
	Class      string
}

type ocrCandidate struct {
	result  *Result
	score   float64
	variant preprocessVariant
	psm     string
}

// Varian preprocessing untuk gambar jelas/sedikit miring.
// Dijaga ringkas untuk kebutuhan produksi (hanya ekstrak NIK/Nama/Alamat).
var basePreprocessVariants = []preprocessVariant{
	{method: "raw", rotation: 0},
	{method: "rotate_only", rotation: -1.5},
	{method: "rotate_only", rotation: 1.5},
	{method: "otsu", rotation: 0},
	{method: "adaptive", rotation: 0},
	{method: "threshold", rotation: 0},
	{method: "deblur", rotation: 0},
}

func buildPreprocessVariants(q qualityMetrics) []preprocessVariant {
	out := make([]preprocessVariant, 0, len(basePreprocessVariants)+40)
	out = append(out, basePreprocessVariants...)
	// Hard case: tambahkan sedikit rotasi saja (tetap ringkas).
	if q.IsHardCase || q.Class == "moderate" {
		for _, rot := range []float64{-3, -2, 2, 3} {
			out = append(out, preprocessVariant{method: "rotate_only", rotation: rot})
		}
	}
	// Deduplicate variants.
	seen := map[string]bool{}
	dedup := make([]preprocessVariant, 0, len(out))
	for _, v := range out {
		key := fmt.Sprintf("%s:%.1f", v.method, v.rotation)
		if seen[key] {
			continue
		}
		seen[key] = true
		dedup = append(dedup, v)
	}
	return dedup
}

// variantsForQuality limits preprocessing depth: gambar bagus = lebih sedikit panggilan Tesseract (produksi).
func variantsForQuality(q qualityMetrics) []preprocessVariant {
	switch q.Class {
	case "good":
		return []preprocessVariant{
			{method: "raw", rotation: 0},
			{method: "otsu", rotation: 0},
		}
	case "moderate":
		return []preprocessVariant{
			{method: "raw", rotation: 0},
			{method: "otsu", rotation: 0},
			{method: "adaptive", rotation: 0},
			{method: "threshold", rotation: 0},
		}
	case "hard", "very_hard":
		// Tahap pertama: setengah jalan antara moderate vs full (cepat), sweep penuh hanya jika masih gagal
		return []preprocessVariant{
			{method: "raw", rotation: 0},
			{method: "otsu", rotation: 0},
			{method: "adaptive", rotation: 0},
			{method: "threshold", rotation: 0},
			{method: "deblur", rotation: 0},
			{method: "rotate_only", rotation: -1.5},
			{method: "rotate_only", rotation: 1.5},
		}
	default: // unknown → anggap moderate
		return []preprocessVariant{
			{method: "raw", rotation: 0},
			{method: "otsu", rotation: 0},
			{method: "adaptive", rotation: 0},
			{method: "threshold", rotation: 0},
		}
	}
}

func earlyExitOK(r *Result, conf float64) bool {
	if r == nil || r.NIK == nil || !validateNIK(*r.NIK) || r.Nama == nil {
		return false
	}
	if len(strings.TrimSpace(*r.Nama)) < 4 {
		return false
	}
	if conf >= earlyExitMinConf+6 && r.Alamat != nil && len(strings.TrimSpace(*r.Alamat)) >= 8 {
		return true
	}
	if conf >= earlyExitMinConf+12 {
		return true
	}
	if conf >= earlyExitMinConf && r.Alamat != nil && len(strings.TrimSpace(*r.Alamat)) >= 5 {
		return true
	}
	return false
}

func runTesseract(imagePath string, psm string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(ocrTimeoutSec)*time.Second)
	defer cancel()
	// --oem 3: default (legacy + LSTM) tends to be more tolerant on noisy KTP backgrounds.
	// Note: This is heavier than OEM 1, but more robust for KTP (banyak noise/pattern).
	cmd := exec.CommandContext(ctx, "tesseract", imagePath, "stdout", "-l", "ind+eng", "--oem", "3", "--psm", psm)
	var out bytes.Buffer
	var errOut bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errOut
	if err := cmd.Run(); err != nil {
		log.Printf("[KTP OCR] tesseract psm=%s error: %v stderr: %s", psm, err, errOut.String())
		return "", err
	}
	return out.String(), nil
}

// runTesseractDigitsOnly: satu baris angka — dipakai untuk crop NIK (whitelist mengurangi salah baca huruf sebagai angka).
func runTesseractDigitsOnly(imagePath string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(ocrTimeoutSec)*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "tesseract", imagePath, "stdout", "-l", "eng", "--oem", "1", "--psm", "7",
		"-c", "tessedit_char_whitelist=0123456789",
	)
	var out bytes.Buffer
	var errOut bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errOut
	if err := cmd.Run(); err != nil {
		return "", err
	}
	return out.String(), nil
}

// ExtractHybrid: production-ready default is Tesseract-only (EasyOCR disabled).
func ExtractHybrid(imagePath string, easyEnabled bool, easyEndpoint string, easyTimeout time.Duration) (*Result, error) {
	start := time.Now()
	if err := validateImageFile(imagePath); err != nil {
		return errorResult(start, err.Error()), err
	}
	_ = easyEnabled
	_ = easyEndpoint
	_ = easyTimeout
	return extractWithTesseract(imagePath, start)
}

// Extract runs OCR on imagePath and returns KTP fields.
// Uses tesseract CLI; mencoba berbagai preprocessing (otsu, adaptive, deblur, rotasi) dan PSM untuk gambar miring/blur.
func Extract(imagePath string) (*Result, error) {
	start := time.Now()
	if err := validateImageFile(imagePath); err != nil {
		return errorResult(start, err.Error()), err
	}
	return extractWithTesseract(imagePath, start)
}

func extractWithTesseract(imagePath string, start time.Time) (*Result, error) {

	quality, qErr := analyzeImageQuality(imagePath)
	if qErr != nil {
		quality = qualityMetrics{Class: "unknown"}
	}
	variants := variantsForQuality(quality)

	var candidates []ocrCandidate
	var bestCandidate *ocrCandidate
	variantCount := len(variants)

	earlyStop := false
	processOne := func(variant preprocessVariant, psm string) bool {
		imgPath := imagePath
		var toRemove string
		if variant.method != "raw" {
			preprocessed, errPre := preprocess(imagePath, variant.method, variant.rotation)
			if errPre != nil {
				return false
			}
			imgPath = preprocessed
			toRemove = preprocessed
		} else if variant.rotation != 0 {
			rotated, errRot := preprocess(imagePath, "rotate_only", variant.rotation)
			if errRot != nil {
				return false
			}
			imgPath = rotated
			toRemove = rotated
		}

		text, err := runTesseract(imgPath, psm)
		if toRemove != "" {
			os.Remove(toRemove)
		}
		if err != nil || text == "" {
			return false
		}

		lines := strings.Split(text, "\n")
		trimmed := make([]string, 0, len(lines))
		for _, l := range lines {
			trimmed = append(trimmed, strings.TrimSpace(l))
		}
		norm := normalizeText(text)
		extracted := extractAllFields(norm, trimmed)
		conf := estimateConfidence(extracted)
		extracted.Confidence = conf
		extracted.RawText = text
		extracted.ProcessingTime = time.Since(start).Milliseconds()

		score := calcScore(extracted, conf)
		c := ocrCandidate{
			result:  extracted,
			score:   score,
			variant: variant,
			psm:     psm,
		}
		candidates = append(candidates, c)
		if bestCandidate == nil || score > bestCandidate.score {
			copied := c
			bestCandidate = &copied
		}
		return earlyExitOK(extracted, conf)
	}

	// Sweep 1: gambar bagus → hanya PSM 6 (blok) dulu (paling cepat)
	psmsA := tesseractPSMsFast
	if quality.Class == "moderate" || quality.Class == "hard" || quality.Class == "very_hard" {
		psmsA = tesseractPSMs
	}
outer1:
	for _, variant := range variants {
		for _, psm := range psmsA {
			if processOne(variant, psm) {
				earlyStop = true
				break outer1
			}
		}
	}

	// Sweep 2: gambar "good" — tambahkan PSM sparse jika belum cukup
	if !earlyStop && quality.Class == "good" && bestCandidate != nil && !earlyExitOK(bestCandidate.result, bestCandidate.result.Confidence) {
	outer2:
		for _, variant := range variants {
			if processOne(variant, "11") {
				earlyStop = true
				break outer2
			}
		}
	}

	// Sweep 3: fallback penuh untuk kasus sulit / hasil lemah
	weak := bestCandidate == nil
	if !weak {
		weak = !bestCandidate.result.IsReadable ||
			calcScore(bestCandidate.result, bestCandidate.result.Confidence) < 0.52
	}
	if !earlyStop && weak {
		full := buildPreprocessVariants(quality)
		if len(full) > variantCount {
			variants = full
			variantCount = len(full)
		outer3:
			for _, variant := range variants {
				for _, psm := range tesseractPSMs {
					if processOne(variant, psm) {
						break outer3
					}
				}
			}
		}
	}

	if bestCandidate == nil || len(candidates) == 0 {
		return errorResult(start, "OCR could not extract text"), nil
	}

	out := buildConsensusResult(candidates, bestCandidate.result)
	out = recoverCriticalFieldsByROI(imagePath, out)
	normalizeCriticalFields(out)

	conf := estimateConfidence(out)
	out.Confidence = conf
	out.ProcessingTime = time.Since(start).Milliseconds()
	finalScore := calcScore(out, conf)
	out.Stats = getExtractionStats(out, finalScore*100)

	log.Printf("[KTP OCR] class=%s hard_case=%t variants_used=%d candidates=%d score=%.2f acc=%.2f ms=%d",
		quality.Class, quality.IsHardCase, variantCount, len(candidates), finalScore, out.Stats.Accuracy, out.ProcessingTime)

	return out, nil
}

func parseOCRTextToResult(imagePath string, rawText string, start time.Time) *Result {
	txt := strings.TrimSpace(rawText)
	if txt == "" {
		return nil
	}
	lines := strings.Split(txt, "\n")
	trimmed := make([]string, 0, len(lines))
	for _, l := range lines {
		trimmed = append(trimmed, strings.TrimSpace(l))
	}

	out := extractAllFields(normalizeText(txt), trimmed)
	out.RawText = txt
	out = recoverCriticalFieldsByROI(imagePath, out)
	normalizeCriticalFields(out)

	conf := estimateConfidence(out)
	out.Confidence = conf
	out.ProcessingTime = time.Since(start).Milliseconds()
	finalScore := calcScore(out, conf)
	out.Stats = getExtractionStats(out, finalScore*100)
	return out
}

// isEasyResultUsable: hanya anggap usable jika NIK valid, agar gambar sedikit blur/miring tetap dianalisis dengan Tesseract (banyak varian rotasi/deblur).
func isEasyResultUsable(r *Result) bool {
	if r == nil || r.Stats == nil {
		return false
	}
	return r.Stats.IsValidNIK
}

func validateImageFile(imagePath string) error {
	info, err := os.Stat(imagePath)
	if err != nil {
		return err
	}
	if info.Size() == 0 {
		return os.ErrInvalid
	}
	if info.Size() > maxFileSize {
		return os.ErrInvalid // "File terlalu besar"
	}
	ext := strings.ToLower(filepath.Ext(imagePath))
	if !supportedExts[ext] {
		return os.ErrInvalid
	}
	return nil
}

func binarizeThreshold(src image.Image, thr uint8) *image.Gray {
	b := src.Bounds()
	gray := image.NewGray(b)
	draw.Draw(gray, b, src, b.Min, draw.Src)
	for y := b.Min.Y; y < b.Max.Y; y++ {
		for x := b.Min.X; x < b.Max.X; x++ {
			i := gray.PixOffset(x, y)
			if gray.Pix[i] >= thr {
				gray.Pix[i] = 255
			} else {
				gray.Pix[i] = 0
			}
		}
	}
	return gray
}

// otsuThreshold computes Otsu threshold for an 8-bit grayscale image.
func otsuThreshold(gray *image.Gray) uint8 {
	if gray == nil || len(gray.Pix) == 0 {
		return 140
	}
	var hist [256]int
	for _, p := range gray.Pix {
		hist[int(p)]++
	}
	total := len(gray.Pix)
	sumAll := 0
	for t := 0; t < 256; t++ {
		sumAll += t * hist[t]
	}
	sumB := 0
	wB := 0
	varMax := -1.0
	thr := 140
	for t := 0; t < 256; t++ {
		wB += hist[t]
		if wB == 0 {
			continue
		}
		wF := total - wB
		if wF == 0 {
			break
		}
		sumB += t * hist[t]
		mB := float64(sumB) / float64(wB)
		mF := float64(sumAll-sumB) / float64(wF)
		v := float64(wB) * float64(wF) * (mB - mF) * (mB - mF)
		if v > varMax {
			varMax = v
			thr = t
		}
	}
	if thr < 60 {
		thr = 60
	}
	if thr > 200 {
		thr = 200
	}
	return uint8(thr)
}

func binarizeOtsu(src image.Image) *image.Gray {
	b := src.Bounds()
	g := image.NewGray(b)
	draw.Draw(g, b, src, b.Min, draw.Src)
	thr := otsuThreshold(g)
	return binarizeThreshold(g, thr)
}

func preprocess(imagePath string, method string, rotationDeg float64) (string, error) {
	img, err := imaging.Open(imagePath, imaging.AutoOrientation(true))
	if err != nil {
		return "", err
	}
	bounds := img.Bounds()
	w := bounds.Dx()
	// Upscale gambar kecil agar lebih terbaca (blur/miring)
	if w > 0 && w < minWidthUpscale {
		img = imaging.Resize(img, targetWidthLow, 0, imaging.Lanczos)
	} else if w > targetWidthHigh {
		img = imaging.Resize(img, targetWidthHigh, 0, imaging.Lanczos)
	}

	// rotate_only: hanya rotasi untuk gambar miring
	if method == "rotate_only" {
		if rotationDeg != 0 {
			img = imaging.Rotate(img, rotationDeg, color.White)
		}
		tmpFile, err := os.CreateTemp("", "ktp_ocr_*.png")
		if err != nil {
			return "", err
		}
		tmp := tmpFile.Name()
		tmpFile.Close()
		if err := imaging.Save(img, tmp); err != nil {
			os.Remove(tmp)
			return "", err
		}
		return tmp, nil
	}

	img = imaging.Grayscale(img)
	img = imaging.AdjustContrast(img, 20)

	switch method {
	case "otsu":
		// KTP: grayscale → denoise ringan → sharpen → Otsu binarization.
		img = imaging.Blur(img, 0.8)
		img = imaging.Sharpen(img, 1.3)
		img = imaging.AdjustContrast(img, 55)
		img = binarizeOtsu(img)
	case "adaptive":
		img = imaging.Sharpen(img, 1.5)
		img = imaging.AdjustContrast(img, 50)
	case "threshold":
		img = imaging.Sharpen(img, 1.2)
		img = imaging.AdjustContrast(img, 55)
		img = binarizeThreshold(img, 140)
	case "grayscale":
		img = imaging.Sharpen(img, 1.0)
	case "deblur":
		img = imaging.Sharpen(img, 2.0)
		img = imaging.AdjustContrast(img, 55)
	default:
		img = imaging.Sharpen(img, 1.2)
		img = imaging.AdjustContrast(img, 45)
	}

	// Rotasi untuk perbaiki gambar miring
	if rotationDeg != 0 {
		img = imaging.Rotate(img, rotationDeg, color.White)
	}

	tmpFile, err := os.CreateTemp("", "ktp_ocr_*.png")
	if err != nil {
		return "", err
	}
	tmp := tmpFile.Name()
	tmpFile.Close()
	if err := imaging.Save(img, tmp); err != nil {
		os.Remove(tmp)
		return "", err
	}
	return tmp, nil
}

func extractAllFields(text string, lines []string) *Result {
	r := &Result{}
	r.NIK = extractNIK(text, lines)
	r.Nama = extractNama(text, lines)
	r.Alamat = extractAlamat(text, lines)
	r.RawText = text
	r.IsReadable = r.NIK != nil && validateNIK(*r.NIK) && r.Nama != nil && strings.TrimSpace(*r.Nama) != ""
	return r
}

func buildConsensusResult(cands []ocrCandidate, fallback *Result) *Result {
	out := cloneResult(fallback)
	if out == nil {
		out = &Result{}
	}

	if nik := pickBestString(cands, func(r *Result) *string { return r.NIK }, normalizeNIKForVote, validateNIK); nik != nil {
		out.NIK = nik
	}
	if nama := pickBestString(cands, func(r *Result) *string { return r.Nama }, normalizeTextForVote, nil); nama != nil {
		out.Nama = nama
	}
	if alamat := pickBestString(cands, func(r *Result) *string { return r.Alamat }, normalizeTextForVote, nil); alamat != nil {
		out.Alamat = alamat
	}
	out.IsReadable = out.NIK != nil && validateNIK(*out.NIK) && out.Nama != nil && strings.TrimSpace(*out.Nama) != ""
	return out
}

func pickBestString(cands []ocrCandidate, selector func(*Result) *string, normalize func(string) string, validator func(string) bool) *string {
	weights := map[string]float64{}
	for _, c := range cands {
		if c.result == nil {
			continue
		}
		v := selector(c.result)
		if v == nil {
			continue
		}
		key := normalize(*v)
		if key == "" {
			continue
		}
		w := c.score + (c.result.Confidence / 100.0)
		if validator != nil && validator(key) {
			w += 0.75
		}
		weights[key] += w
	}
	if len(weights) == 0 {
		return nil
	}

	bestKey := ""
	bestWeight := -1.0
	// Prefer valid values when validator exists.
	if validator != nil {
		for k, w := range weights {
			if !validator(k) {
				continue
			}
			if w > bestWeight {
				bestWeight = w
				bestKey = k
			}
		}
	}
	if bestKey == "" {
		for k, w := range weights {
			if w > bestWeight {
				bestWeight = w
				bestKey = k
			}
		}
	}
	if bestKey == "" {
		return nil
	}
	v := bestKey
	return &v
}

func normalizeTextForVote(s string) string {
	s = strings.TrimSpace(strings.ToUpper(s))
	s = regexp.MustCompile(`\s+`).ReplaceAllString(s, " ")
	return s
}

func normalizeNIKForVote(s string) string {
	s = strings.ToUpper(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		switch r {
		case 'O', 'D', 'Q':
			b.WriteByte('0')
		case 'I', 'L', '|':
			b.WriteByte('1')
		case 'Z':
			b.WriteByte('2')
		case 'S':
			b.WriteByte('5')
		case 'G':
			b.WriteByte('6')
		case 'B':
			b.WriteByte('8')
		default:
			if r >= '0' && r <= '9' {
				b.WriteRune(r)
			}
		}
	}
	v := b.String()
	if len(v) < 16 {
		return ""
	}
	if len(v) > 16 {
		v = v[:16]
	}
	return v
}

func keepDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func cloneResult(in *Result) *Result {
	if in == nil {
		return nil
	}
	out := *in
	if in.NIK != nil {
		v := *in.NIK
		out.NIK = &v
	}
	if in.Nama != nil {
		v := *in.Nama
		out.Nama = &v
	}
	if in.Alamat != nil {
		v := *in.Alamat
		out.Alamat = &v
	}
	return &out
}

func recoverCriticalFieldsByROI(imagePath string, base *Result) *Result {
	if base == nil {
		return base
	}
	// High-accuracy mode: crop-per-field is useful even if fields exist (to refine).
	missingCritical := base.NIK == nil || base.Nama == nil || base.Alamat == nil

	img, err := imaging.Open(imagePath, imaging.AutoOrientation(true))
	if err != nil {
		return base
	}
	b := img.Bounds()
	w, h := b.Dx(), b.Dy()
	if w < 40 || h < 40 {
		return base
	}

	// Template KTP relatif (perkiraan). Crop per field meningkatkan akurasi jauh dibanding full-card OCR.
	// Koordinat dibuat longgar agar tetap bekerja meski foto sedikit miring/zoom.
	nikRect := image.Rect(int(float64(w)*0.22), int(float64(h)*0.18), int(float64(w)*0.92), int(float64(h)*0.30))
	namaRect := image.Rect(int(float64(w)*0.18), int(float64(h)*0.29), int(float64(w)*0.92), int(float64(h)*0.40))
	alamatRect := image.Rect(int(float64(w)*0.10), int(float64(h)*0.40), int(float64(w)*0.92), int(float64(h)*0.68))
	leftRect := image.Rect(0, 0, int(float64(w)*0.74), int(float64(h)*0.96))

	nikImg := imaging.Crop(img, nikRect)
	namaImg := imaging.Crop(img, namaRect)
	alamatImg := imaging.Crop(img, alamatRect)
	leftImg := imaging.Crop(img, leftRect)

	leftPath, err := saveTempImage(leftImg)
	if err != nil {
		return base
	}
	defer os.Remove(leftPath)
	nikPath, err := saveTempImage(nikImg)
	if err != nil {
		return base
	}
	defer os.Remove(nikPath)
	namaPath, err := saveTempImage(namaImg)
	if err != nil {
		return base
	}
	defer os.Remove(namaPath)
	alamatPath, err := saveTempImage(alamatImg)
	if err != nil {
		return base
	}
	defer os.Remove(alamatPath)

	// Crop atas: NIK sering salah baca huruf sebagai angka — pakai whitelist digit-only.
	if txt, err := runTesseractDigitsOnly(nikPath); err == nil && txt != "" {
		d := keepDigits(txt)
		if len(d) >= 16 {
			for i := 0; i <= len(d)-16; i++ {
				cand := d[i : i+16]
				if validateNIK(cand) {
					base.NIK = &cand
					break
				}
			}
		}
	}

	recoverFromTexts := func(p string, psm string) {
		txt, err := runTesseract(p, psm)
		if err != nil || txt == "" {
			return
		}
		lines := strings.Split(txt, "\n")
		trimmed := make([]string, 0, len(lines))
		for _, l := range lines {
			trimmed = append(trimmed, strings.TrimSpace(l))
		}
		ex := extractAllFields(normalizeText(txt), trimmed)
		fillMissingFields(base, ex)
	}

	// Field-specific OCR uses PSM 6 (uniform block).
	recoverFromTexts(namaPath, "6")
	recoverFromTexts(alamatPath, "6")
	// Fallback broader crop(s)
	if missingCritical {
		recoverFromTexts(leftPath, "11")
	}
	base.IsReadable = base.NIK != nil && validateNIK(*base.NIK) && base.Nama != nil && strings.TrimSpace(*base.Nama) != ""
	return base
}

func saveTempImage(img image.Image) (string, error) {
	tmpFile, err := os.CreateTemp("", "ktp_roi_*.png")
	if err != nil {
		return "", err
	}
	tmp := tmpFile.Name()
	tmpFile.Close()
	if err := imaging.Save(img, tmp); err != nil {
		os.Remove(tmp)
		return "", err
	}
	return tmp, nil
}

func fillMissingFields(dst, src *Result) {
	if dst == nil || src == nil {
		return
	}
	if dst.NIK == nil && src.NIK != nil {
		dst.NIK = src.NIK
	}
	if dst.Nama == nil && src.Nama != nil {
		dst.Nama = src.Nama
	}
	if dst.Alamat == nil && src.Alamat != nil {
		dst.Alamat = src.Alamat
	}
}

func normalizeCriticalFields(r *Result) {
	if r == nil {
		return
	}
	if r.NIK != nil {
		n := normalizeNIKForVote(*r.NIK)
		if c := correctNIK(n); c != nil {
			r.NIK = c
		}
	}
}

func analyzeImageQuality(imagePath string) (qualityMetrics, error) {
	img, err := imaging.Open(imagePath, imaging.AutoOrientation(true))
	if err != nil {
		return qualityMetrics{}, err
	}
	b := img.Bounds()
	if b.Dx() == 0 || b.Dy() == 0 {
		return qualityMetrics{}, fmt.Errorf("empty image")
	}

	var sum, sumSq, edge float64
	var count, edgeCount int
	step := 2
	for y := b.Min.Y; y < b.Max.Y; y += step {
		for x := b.Min.X; x < b.Max.X; x += step {
			cur := luminance(img.At(x, y))
			sum += cur
			sumSq += cur * cur
			count++
			if x+step < b.Max.X {
				right := luminance(img.At(x+step, y))
				edge += math.Abs(cur - right)
				edgeCount++
			}
			if y+step < b.Max.Y {
				bot := luminance(img.At(x, y+step))
				edge += math.Abs(cur - bot)
				edgeCount++
			}
		}
	}
	if count == 0 || edgeCount == 0 {
		return qualityMetrics{}, fmt.Errorf("invalid image sampling")
	}
	mean := sum / float64(count)
	variance := (sumSq / float64(count)) - (mean * mean)
	if variance < 0 {
		variance = 0
	}
	contrast := math.Sqrt(variance)
	sharpness := edge / float64(edgeCount)

	q := qualityMetrics{
		Brightness: mean,
		Contrast:   contrast,
		Sharpness:  sharpness,
	}
	// Lebih toleran: lebih banyak gambar dapat extra preprocessing
	q.IsHardCase = contrast < 32 || sharpness < 16 || mean < 75 || mean > 210
	switch {
	case contrast < 22 || sharpness < 11:
		q.Class = "very_hard"
		q.IsHardCase = true
	case q.IsHardCase:
		q.Class = "hard"
	case contrast < 38 || sharpness < 20:
		q.Class = "moderate"
	default:
		q.Class = "good"
	}
	return q, nil
}

func luminance(c color.Color) float64 {
	r, g, b, _ := c.RGBA()
	r8 := float64(r >> 8)
	g8 := float64(g >> 8)
	b8 := float64(b >> 8)
	return (0.299 * r8) + (0.587 * g8) + (0.114 * b8)
}

func calcScore(r *Result, conf float64) float64 {
	s := conf / 100
	if r.NIK != nil {
		s += 0.2
	}
	if r.Nama != nil {
		s += 0.15
	}
	if r.Alamat != nil {
		s += 0.15
	}
	if r.NIK != nil && !validateNIK(*r.NIK) {
		s -= 0.15
	}
	if s > 1 {
		s = 1
	}
	return s
}

func estimateConfidence(r *Result) float64 {
	// Confidence heuristik berbasis 3 field utama: NIK, Nama, Alamat.
	score := 0.0
	total := 0.0

	total += 25
	if r.NIK != nil && validateNIK(*r.NIK) {
		score += 25
	}
	total += 15
	if r.Nama != nil && len(strings.TrimSpace(*r.Nama)) >= 4 {
		score += 15
	}
	total += 10
	if r.Alamat != nil && len(strings.TrimSpace(*r.Alamat)) >= 5 {
		score += 10
	}
	if total == 0 {
		return 0
	}
	return score / total * 100
}

func getExtractionStats(r *Result, accuracy float64) *Stats {
	fields := []*string{r.NIK, r.Nama, r.Alamat}
	count := 0
	for _, f := range fields {
		if f != nil {
			count++
		}
	}
	isValidNIK := false
	if r.NIK != nil && validateNIK(*r.NIK) {
		isValidNIK = true
	}
	completeness := 0.0
	totalFields := 3
	if totalFields > 0 {
		completeness = float64(count) / float64(totalFields) * 100
	}
	return &Stats{
		TotalFields:     totalFields,
		ExtractedFields: count,
		Confidence:      r.Confidence,
		Accuracy:        accuracy,
		ProcessingTime:  r.ProcessingTime,
		IsValidNIK:      isValidNIK,
		Completeness:    completeness,
	}
}

func errorResult(start time.Time, msg string) *Result {
	return &Result{
		ProcessingTime: time.Since(start).Milliseconds(),
		RawText:        "",
	}
}
