package repository

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5"
)

// VerifiedUserLookupPublic is safe profile data for PU booking prefill (no password / email).
type VerifiedUserLookupPublic struct {
	Nama          string `json:"nama"`
	Nik           string `json:"nik,omitempty"`
	NpwpBadan     string `json:"npwp_badan,omitempty"`
	Telepon       string `json:"telepon,omitempty"`
	AlamatLengkap string `json:"alamat_lengkap,omitempty"`
	KabupatenKota string `json:"kabupaten_kota,omitempty"`
	Kecamatan     string `json:"kecamatan,omitempty"`
	Kelurahan     string `json:"kelurahan,omitempty"`
	Rtrw          string `json:"rtrw,omitempty"` // gabungan RT/RW dari OCR bila ada
}

// NormalizeIdentityDigits keeps only digits for NIK/NPWP comparison.
func NormalizeIdentityDigits(raw string) string {
	var b strings.Builder
	for _, r := range strings.TrimSpace(raw) {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// LookupVerifiedUserByIdentity finds one row in a_2_verified_users by NIK or NPWP (parameterized; aman dari SQL injection).
// kind: "" (keduanya), "nik", atau "npwp" — membatasi kolom pencarian sesuai jenis WP di form PU.
func (r *UserRepo) LookupVerifiedUserByIdentity(ctx context.Context, identityRaw, kind string) (*VerifiedUserLookupPublic, error) {
	if r.pool == nil {
		return nil, nil
	}
	d := NormalizeIdentityDigits(identityRaw)
	if len(d) < 10 {
		return nil, nil
	}
	k := strings.ToLower(strings.TrimSpace(kind))
	var cond string
	switch k {
	case "nik":
		cond = `regexp_replace(COALESCE(nik, ''), '[^0-9]', '', 'g') = $1`
	case "npwp":
		cond = `regexp_replace(COALESCE(npwp_badan, ''), '[^0-9]', '', 'g') = $1`
	default:
		cond = `(regexp_replace(COALESCE(nik, ''), '[^0-9]', '', 'g') = $1
			OR regexp_replace(COALESCE(npwp_badan, ''), '[^0-9]', '', 'g') = $1)`
	}
	q := `
		SELECT nama,
			COALESCE(nik, ''),
			COALESCE(telepon, ''),
			COALESCE(alamat_pu, ''),
			COALESCE(npwp_badan, '')
		FROM a_2_verified_users
		WHERE verifiedstatus IN ('complete', 'verified_pending')
		  AND (` + cond + `)
		ORDER BY CASE WHEN verifiedstatus = 'complete' THEN 0 ELSE 1 END, id DESC
		LIMIT 1`
	var out VerifiedUserLookupPublic
	err := r.pool.QueryRow(ctx, q, d).Scan(
		&out.Nama, &out.Nik, &out.Telepon, &out.AlamatLengkap, &out.NpwpBadan,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &out, nil
}
