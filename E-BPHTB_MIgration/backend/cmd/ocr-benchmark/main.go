package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/ktpocr"
	"github.com/joho/godotenv"
)

type imageStats struct {
	File            string
	Accuracy        float64
	ExtractedFields int
	IsValidNIK      bool
	IsReadable      bool
	HasNama         bool
	HasAlamat       bool
	Decision        string
}

func main() {
	_ = godotenv.Load()
	cfg := config.Load()

	imageDir := "..\\uji_gambar_ktp"
	if len(os.Args) > 1 && strings.TrimSpace(os.Args[1]) != "" {
		imageDir = os.Args[1]
	}

	images, err := listImages(imageDir)
	if err != nil {
		fmt.Printf("gagal membaca folder uji: %v\n", err)
		os.Exit(1)
	}
	if len(images) == 0 {
		fmt.Printf("tidak ada gambar KTP pada: %s\n", imageDir)
		os.Exit(1)
	}

	stats := make([]imageStats, 0, len(images))
	for _, img := range images {
		r, err := ktpocr.ExtractHybrid(
			img,
			cfg.EasyOCREnabled,
			cfg.EasyOCRURL,
			time.Duration(cfg.EasyOCRTimeout)*time.Millisecond,
		)
		if err != nil {
			fmt.Printf("[ERROR] %s: %v\n", filepath.Base(img), err)
			continue
		}
		if r == nil || r.Stats == nil {
			fmt.Printf("[WARN] %s: OCR result kosong\n", filepath.Base(img))
			continue
		}
		decision := classifyDecision(r.Stats.Accuracy, r.Stats.IsValidNIK, r.Stats.ExtractedFields)
		stats = append(stats, imageStats{
			File:            filepath.Base(img),
			Accuracy:        r.Stats.Accuracy,
			ExtractedFields: r.Stats.ExtractedFields,
			IsValidNIK:      r.Stats.IsValidNIK,
			IsReadable:      r.IsReadable,
			HasNama:         r.Nama != nil,
			HasAlamat:       r.Alamat != nil,
			Decision:        decision,
		})
	}

	if len(stats) == 0 {
		fmt.Println("benchmark gagal: tidak ada hasil OCR valid")
		os.Exit(1)
	}

	sort.Slice(stats, func(i, j int) bool { return stats[i].File < stats[j].File })
	fmt.Println("=== OCR Benchmark (KTP) ===")
	fmt.Println("file | acc | fields | nik_valid | readable | nama | alamat | decision")
	for _, s := range stats {
		fmt.Printf("%s | %.1f | %d | %t | %t | %t | %t | %s\n",
			s.File, s.Accuracy, s.ExtractedFields, s.IsValidNIK, s.IsReadable, s.HasNama, s.HasAlamat, s.Decision)
	}

	total := float64(len(stats))
	var validNIK, readable, criticalComplete, needsReview, reject int
	var sumAcc float64
	for _, s := range stats {
		sumAcc += s.Accuracy
		if s.IsValidNIK {
			validNIK++
		}
		if s.IsReadable {
			readable++
		}
		if s.HasNama && s.HasAlamat {
			criticalComplete++
		}
		switch s.Decision {
		case "needs_review":
			needsReview++
		case "reject":
			reject++
		}
	}

	fmt.Println("\n=== Ringkasan ===")
	fmt.Printf("Total gambar           : %d\n", len(stats))
	fmt.Printf("Rata-rata akurasi      : %.2f\n", sumAcc/total)
	fmt.Printf("NIK valid rate         : %.2f%%\n", float64(validNIK)*100/total)
	fmt.Printf("Readable rate (NIK+Nama): %.2f%%\n", float64(readable)*100/total)
	fmt.Printf("Critical fields lengkap: %.2f%%\n", float64(criticalComplete)*100/total)
	fmt.Printf("Needs review rate      : %.2f%%\n", float64(needsReview)*100/total)
	fmt.Printf("Reject rate            : %.2f%%\n", float64(reject)*100/total)
}

func listImages(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	files := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := strings.ToLower(e.Name())
		if strings.HasSuffix(name, ".jpg") || strings.HasSuffix(name, ".jpeg") || strings.HasSuffix(name, ".png") || strings.HasSuffix(name, ".bmp") {
			files = append(files, filepath.Join(dir, e.Name()))
		}
	}
	return files, nil
}

func classifyDecision(accuracy float64, isValidNIK bool, extractedFields int) string {
	if !isValidNIK && (accuracy < 20 || extractedFields < 3) {
		return "reject"
	}
	if accuracy < 50 || !isValidNIK || extractedFields < 5 {
		return "needs_review"
	}
	return "success"
}
