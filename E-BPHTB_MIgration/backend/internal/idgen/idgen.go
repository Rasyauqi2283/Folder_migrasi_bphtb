package idgen

import (
	"context"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
)

// IDPattern defines prefix and max digit capacity for userid generation.
// Nomor dimulai 01, 02, … 09, 10, … 99, 100, 1000, … sampai 99999 (tanpa leading zero kecuali 01–09).
type IDPattern struct {
	Prefix string
	Digits int // kapasitas digit (5 = max 99999)
}

var idPatterns = map[string]IDPattern{
	"PPAT":            {Prefix: "PAT", Digits: 5},
	"PPATS":           {Prefix: "PATS", Digits: 5},
	"Notaris":         {Prefix: "NOTA", Digits: 5},
	"BANK":            {Prefix: "BANK", Digits: 5},
	"LTB":             {Prefix: "LTB", Digits: 5},
	"LSB":             {Prefix: "LSB", Digits: 5},
	"Wajib Pajak":     {Prefix: "WP", Digits: 5},
	"Administrator":   {Prefix: "A", Digits: 5},
	"Customer Service": {Prefix: "CS", Digits: 5},
	"Peneliti":        {Prefix: "P", Digits: 5},
	"Peneliti Validasi": {Prefix: "PV", Digits: 5},
}

// DivisiCodeToName maps frontend divisi code (PAT, A, CS, ...) to full divisi name for idgen.
var DivisiCodeToName = map[string]string{
	"PAT":     "PPAT",
	"PATS":    "PPATS",
	"NOTA":    "Notaris",
	"A":    "Administrator",
	"CS":   "Customer Service",
	"LTB":  "LTB",
	"LSB":  "LSB",
	"P":    "Peneliti",
	"PV":   "Peneliti Validasi",
	"BANK": "BANK",
	"WP":   "Wajib Pajak",
}

const (
	ppatMin = 20000
	ppatMax = 29999
)

// GenerateUserID returns next userid for divisi: prefix + nomor 01, 02, … 09, 10, … 99, 100, … 99999.
// tx must be from an active transaction (FOR UPDATE).
func GenerateUserID(ctx context.Context, tx pgx.Tx, divisiName string) (string, error) {
	pattern := idPatterns[divisiName]
	if pattern.Prefix == "" && pattern.Digits == 0 {
		pattern = IDPattern{Prefix: divisiName, Digits: 5}
	}
	if pattern.Digits == 0 {
		pattern.Digits = 5
	}
	// Cari userid terakhir yang prefix + angka saja (panjang variabel: PAT01, PAT99, PAT100, dll.)
	regexPattern := "^" + pattern.Prefix + "[0-9]+$"
	var lastID string
	err := tx.QueryRow(ctx,
		`SELECT userid FROM a_2_verified_users 
		 WHERE userid ~ $1 AND verifiedstatus = 'complete'
		 ORDER BY (REGEXP_REPLACE(userid, $2, '')::BIGINT) DESC
		 LIMIT 1 FOR UPDATE`,
		regexPattern, "^"+pattern.Prefix,
	).Scan(&lastID)
	if err != nil && err != pgx.ErrNoRows {
		return "", err
	}

	nextNum := 1
	if lastID != "" {
		numStr := lastID[len(pattern.Prefix):]
		n, _ := strconv.Atoi(numStr)
		nextNum = n + 1
	}
	maxNum := 1
	for i := 0; i < pattern.Digits; i++ {
		maxNum *= 10
	}
	if nextNum >= maxNum {
		return "", fmt.Errorf("nomor ID untuk divisi %s telah mencapai batas maksimum", divisiName)
	}
	// 01–09 (2 digit), lalu 10, 11, … 99, 100, … 99999 (tanpa leading zero)
	numPart := fmt.Sprintf("%d", nextNum)
	if nextNum <= 9 {
		numPart = fmt.Sprintf("%02d", nextNum)
	}
	return pattern.Prefix + numPart, nil
}

// GeneratePPATNumber returns next ppat_khusus (5-digit, 20000-29999).
// tx must be from an active transaction (FOR UPDATE).
func GeneratePPATNumber(ctx context.Context, tx pgx.Tx) (string, error) {
	var lastPpat string
	err := tx.QueryRow(ctx,
		`SELECT ppat_khusus FROM a_2_verified_users 
		 WHERE ppat_khusus IS NOT NULL AND ppat_khusus != '' 
		   AND ppat_khusus ~ '^[0-9]+$' AND divisi IN ('PPAT', 'PPATS')
		 ORDER BY ppat_khusus::INTEGER DESC LIMIT 1 FOR UPDATE`,
	).Scan(&lastPpat)
	if err != nil && err != pgx.ErrNoRows {
		return "", err
	}

	nextNum := ppatMin
	if lastPpat != "" {
		n, _ := strconv.Atoi(lastPpat)
		nextNum = n + 1
		if nextNum > ppatMax {
			return "", fmt.Errorf("nomor PPAT khusus telah mencapai batas maksimum")
		}
	}
	return fmt.Sprintf("%05d", nextNum), nil
}
