package idgen

import (
	"context"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5"
)

// IDPattern defines prefix and digit count for userid generation.
type IDPattern struct {
	Prefix string
	Digits int
}

var idPatterns = map[string]IDPattern{
	"PPAT":            {Prefix: "PAT", Digits: 2},
	"PPATS":           {Prefix: "PATS", Digits: 2},
	"BANK":            {Prefix: "BANK", Digits: 2},
	"LTB":             {Prefix: "LTB", Digits: 2},
	"LSB":             {Prefix: "LSB", Digits: 2},
	"Wajib Pajak":     {Prefix: "WP", Digits: 2},
	"Administrator":   {Prefix: "A", Digits: 2},
	"Customer Service": {Prefix: "CS", Digits: 2},
	"Peneliti":        {Prefix: "P", Digits: 2},
	"Peneliti Validasi": {Prefix: "PV", Digits: 2},
}

// DivisiCodeToName maps frontend divisi code (PAT, A, CS, ...) to full divisi name for idgen.
var DivisiCodeToName = map[string]string{
	"PAT":  "PPAT",
	"PATS": "PPATS",
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

// GenerateUserID returns next userid for divisi (e.g. WP01, PAT01).
// tx must be from an active transaction (FOR UPDATE).
func GenerateUserID(ctx context.Context, tx pgx.Tx, divisiName string) (string, error) {
	pattern := idPatterns[divisiName]
	if pattern.Prefix == "" && pattern.Digits == 0 {
		pattern = IDPattern{Prefix: divisiName, Digits: 2}
	}
	if pattern.Digits == 0 {
		pattern.Digits = 2
	}
	totalLength := len(pattern.Prefix) + pattern.Digits

	var lastID string
	err := tx.QueryRow(ctx,
		`SELECT userid FROM a_2_verified_users 
		 WHERE userid LIKE $1 AND LENGTH(userid) = $2 AND verifiedstatus = 'complete'
		 ORDER BY userid DESC LIMIT 1 FOR UPDATE`,
		pattern.Prefix+"%", totalLength,
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

	return pattern.Prefix + fmt.Sprintf("%0*d", pattern.Digits, nextNum), nil
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
