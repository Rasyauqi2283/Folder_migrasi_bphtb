package repository

import (
	"context"
	"database/sql"
	"strings"

	"github.com/jackc/pgx/v5"
)

// NopPBBLookupResult is the latest internal booking row matching NOP (PBB reference).
type NopPBBLookupResult struct {
	Namawajibpajak string   `json:"namawajibpajak"`
	AlamatObjek    string   `json:"alamat_objek"`
	LuasTanah      *float64 `json:"luas_tanah"`
	NjopTanah      *float64 `json:"njop_tanah"`
	LuasBangunan   *float64 `json:"luas_bangunan"`
	NjopBangunan   *float64 `json:"njop_bangunan"`
	Nobooking      string   `json:"nobooking,omitempty"`
	Noppbb         string   `json:"noppbb,omitempty"`
}

// NormalizeNopDigits strips non-digits from NOP (PBB) for comparison.
func NormalizeNopDigits(raw string) string {
	var b strings.Builder
	for _, r := range raw {
		if r >= '0' && r <= '9' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// LookupNopFromLatestBooking finds the most recent pat_1 row whose NOP matches digits-only key.
func (r *PpatRepo) LookupNopFromLatestBooking(ctx context.Context, nopDigits string) (*NopPBBLookupResult, error) {
	if r.pool == nil {
		return nil, nil
	}
	d := strings.TrimSpace(nopDigits)
	if len(d) < 10 {
		return nil, nil
	}
	const q = `
		SELECT p.namawajibpajak,
			COALESCE(p4.letaktanahdanbangunan, '') AS alamat_objek,
			p5.luas_tanah, p5.njop_tanah, p5.luas_bangunan, p5.njop_bangunan,
			p.nobooking, p.noppbb
		FROM pat_1_bookingsspd p
		LEFT JOIN pat_4_objek_pajak p4 ON p4.nobooking = p.nobooking
		LEFT JOIN pat_5_penghitungan_njop p5 ON p5.nobooking = p.nobooking
		WHERE regexp_replace(COALESCE(p.noppbb, ''), '[^0-9]', '', 'g') = $1
		ORDER BY p.bookingid DESC NULLS LAST, p.created_at DESC NULLS LAST
		LIMIT 1`
	var out NopPBBLookupResult
	var lt, nt, lb, nb sql.NullFloat64
	err := r.pool.QueryRow(ctx, q, d).Scan(
		&out.Namawajibpajak, &out.AlamatObjek, &lt, &nt, &lb, &nb, &out.Nobooking, &out.Noppbb,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if lt.Valid {
		v := lt.Float64
		out.LuasTanah = &v
	}
	if nt.Valid {
		v := nt.Float64
		out.NjopTanah = &v
	}
	if lb.Valid {
		v := lb.Float64
		out.LuasBangunan = &v
	}
	if nb.Valid {
		v := nb.Float64
		out.NjopBangunan = &v
	}
	return &out, nil
}
