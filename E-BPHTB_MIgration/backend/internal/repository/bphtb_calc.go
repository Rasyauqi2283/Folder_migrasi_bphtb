package repository

import (
	"math"
	"strconv"
	"strings"
)

// BPHTBCalc represents the strict SSPD BPHTB calculation points (1..6).
type BPHTBCalc struct {
	// Poin 1..6 (Rupiah, may contain decimals pre-rounding)
	NPOP       float64 // Poin 1 (max(TotalNJOP, HargaTransaksi))
	NPOPTKP    float64 // Poin 2 (auto from jenis perolehan)
	NPOPKP     float64 // Poin 3
	BeaTerutang float64 // Poin 4 (5% * poin3)
	BeaDibayar float64 // Poin 5 (manual / gateway paid)
	KurangBayar float64 // Poin 6 (max(poin4-poin5,0))

	NeedsSTPD bool // true when poin6 > 0
}

// normalizeJenisPerolehanKode strips labels like "01 - Jual Beli" → "01".
func normalizeJenisPerolehanKode(kode string) string {
	s := strings.TrimSpace(kode)
	if len(s) >= 2 && s[0] >= '0' && s[0] <= '9' && s[1] >= '0' && s[1] <= '9' {
		return s[:2]
	}
	return s
}

// NPOPTKPFromJenisPerolehan maps kode jenis perolehan -> NPOPTKP (Rupiah).
// This mirrors frontend `NPOPTKP_MAP` defaults and should stay consistent.
func NPOPTKPFromJenisPerolehan(kode string) float64 {
	k := strings.TrimSpace(strings.ToUpper(normalizeJenisPerolehanKode(kode)))
	switch k {
	case "04", "05", "24":
		// Waris & Hibah Wasiat (minimal nasional) — lihat docs/jenis_perolehan.md
		return 300_000_000
	case "28":
		return 40_000_000
	case "29":
		return 49_000_000
	case "34":
		return 0
	default:
		// Default umum (Jual Beli, dll) = 80 juta
		return 80_000_000
	}
}

func parseMoneyToFloat(s string) float64 {
	t := strings.TrimSpace(s)
	if t == "" {
		return 0
	}
	// Keep digits and separators; tolerate "1.234.567,89" or "1,234,567.89".
	var b strings.Builder
	for _, r := range t {
		if (r >= '0' && r <= '9') || r == '.' || r == ',' || r == '-' {
			b.WriteRune(r)
		}
	}
	clean := b.String()
	if clean == "" || clean == "-" {
		return 0
	}
	// Strategy:
	// - If both '.' and ',' exist, assume the last separator is decimal.
	// - Else if only ',' exists, treat as decimal when it appears once and has 1-2 digits after; otherwise thousands.
	// - Else '.' as decimal when it appears once and has 1-2 digits after; otherwise thousands.
	lastDot := strings.LastIndex(clean, ".")
	lastComma := strings.LastIndex(clean, ",")
	decimalSep := ""
	if lastDot >= 0 && lastComma >= 0 {
		if lastDot > lastComma {
			decimalSep = "."
		} else {
			decimalSep = ","
		}
	} else if lastComma >= 0 {
		decimalSep = ","
	} else if lastDot >= 0 {
		decimalSep = "."
	}
	if decimalSep != "" {
		parts := strings.Split(clean, decimalSep)
		if len(parts) > 2 {
			// remove all separators (fallback)
			clean = strings.ReplaceAll(strings.ReplaceAll(clean, ".", ""), ",", "")
			v, _ := strconv.ParseFloat(clean, 64)
			return v
		}
		intPart := strings.ReplaceAll(parts[0], ".", "")
		intPart = strings.ReplaceAll(intPart, ",", "")
		decPart := ""
		if len(parts) == 2 {
			decPart = parts[1]
		}
		if decPart != "" {
			clean = intPart + "." + decPart
		} else {
			clean = intPart
		}
	} else {
		clean = strings.ReplaceAll(strings.ReplaceAll(clean, ".", ""), ",", "")
	}
	v, _ := strconv.ParseFloat(clean, 64)
	return v
}

// CalculateBPHTB performs strict calculation (points 1..6).
// totalNJOP is expected to be total NJOP (tanah+bangunan). hargaTransaksiStr may be empty.
// beaDibayar is the paid amount (point 5) for calculating point 6.
func CalculateBPHTB(totalNJOP float64, hargaTransaksiStr string, jenisPerolehan string, beaDibayar float64) BPHTBCalc {
	hv := parseMoneyToFloat(hargaTransaksiStr)
	npop := math.Max(0, totalNJOP)
	if hv > npop {
		npop = hv
	}
	npoptkp := NPOPTKPFromJenisPerolehan(jenisPerolehan)
	npopkp := npop - npoptkp
	if npopkp < 0 {
		npopkp = 0
	}
	beaTerutang := npopkp * 0.05
	kurang := beaTerutang - math.Max(0, beaDibayar)
	if kurang < 0 {
		kurang = 0
	}
	return BPHTBCalc{
		NPOP:        npop,
		NPOPTKP:     npoptkp,
		NPOPKP:      npopkp,
		BeaTerutang: beaTerutang,
		BeaDibayar:  math.Max(0, beaDibayar),
		KurangBayar: kurang,
		NeedsSTPD:   kurang > 0.0001,
	}
}

