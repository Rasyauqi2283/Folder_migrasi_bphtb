package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NextNoRegistrasiLtb allocates the next registration number for the given channel:
//   O = online (PU kirim berkas), V = offline (LTB input loket).
// Sequence is per calendar year, 6-digit zero-padded suffix, from ltb_1_terima_berkas_sspd.no_registrasi.
func NextNoRegistrasiLtb(ctx context.Context, pool *pgxpool.Pool, channel byte) (string, error) {
	if pool == nil {
		return "", fmt.Errorf("database not configured")
	}
	if channel != 'O' && channel != 'V' {
		return "", fmt.Errorf("invalid registration channel")
	}
	year := time.Now().Year()
	prefix := fmt.Sprintf("%d%c", year, channel)
	likePattern := prefix + "%"
	var nextSeq int
	err := pool.QueryRow(ctx, `
		SELECT COALESCE(MAX(CAST(right(no_registrasi, 6) AS integer)), 0) + 1
		FROM ltb_1_terima_berkas_sspd
		WHERE no_registrasi LIKE $1
	`, likePattern).Scan(&nextSeq)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%06d", prefix, nextSeq), nil
}

// NextNoRegistrasiLtbTx is the same as NextNoRegistrasiLtb but runs inside an open transaction.
func NextNoRegistrasiLtbTx(ctx context.Context, tx pgx.Tx, channel byte) (string, error) {
	if channel != 'O' && channel != 'V' {
		return "", fmt.Errorf("invalid registration channel")
	}
	year := time.Now().Year()
	prefix := fmt.Sprintf("%d%c", year, channel)
	likePattern := prefix + "%"
	var nextSeq int
	err := tx.QueryRow(ctx, `
		SELECT COALESCE(MAX(CAST(right(no_registrasi, 6) AS integer)), 0) + 1
		FROM ltb_1_terima_berkas_sspd
		WHERE no_registrasi LIKE $1
	`, likePattern).Scan(&nextSeq)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%06d", prefix, nextSeq), nil
}
