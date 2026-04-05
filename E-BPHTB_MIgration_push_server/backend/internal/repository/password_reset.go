package repository

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// ResetUserInfo holds nama, email, divisi, userid for reset-password page display.
type ResetUserInfo struct {
	Nama   string
	Email  string
	Divisi string
	Userid string
}

// GetResetUserByEmail returns user info by email for verified_pending/complete (for reset password page).
func (r *UserRepo) GetResetUserByEmail(ctx context.Context, email string) (*ResetUserInfo, error) {
	if r.pool == nil {
		return nil, nil
	}
	var u ResetUserInfo
	err := r.pool.QueryRow(ctx,
		`SELECT nama, email, divisi, userid FROM a_2_verified_users
		 WHERE email = $1 AND verifiedstatus IN ('verified_pending','complete')`,
		email,
	).Scan(&u.Nama, &u.Email, &u.Divisi, &u.Userid)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// VerifiedEmailNikExists checks if a verified user exists by email+nik (verified_pending/complete).
func (r *UserRepo) VerifiedEmailNikExists(ctx context.Context, email, nik string) (bool, error) {
	if r.pool == nil {
		return false, nil
	}
	var n int
	err := r.pool.QueryRow(ctx,
		`SELECT 1 FROM a_2_verified_users WHERE email=$1 AND nik=$2 AND verifiedstatus IN ('verified_pending','complete')`,
		email, nik,
	).Scan(&n)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return err == nil, err
}

// InsertPasswordResetOTP creates a new password reset OTP request.
func (r *UserRepo) InsertPasswordResetOTP(ctx context.Context, email, nik, otpHash string, expiresAt time.Time) error {
	if r.pool == nil {
		return errors.New("db pool nil")
	}
	_, err := r.pool.Exec(ctx,
		`INSERT INTO password_reset_otp (email, nik, otp_hash, otp_expires_at) VALUES ($1,$2,$3,$4)`,
		email, nik, otpHash, expiresAt,
	)
	return err
}

type PasswordResetOTPRow struct {
	ID            int64
	Email         string
	NIK           string
	OtpHash       string
	OtpExpiresAt  time.Time
	OtpVerifiedAt *time.Time
}

// GetLatestUnverifiedPasswordResetOTP returns the latest row for email that is not verified/reset yet.
func (r *UserRepo) GetLatestUnverifiedPasswordResetOTP(ctx context.Context, email string) (*PasswordResetOTPRow, error) {
	if r.pool == nil {
		return nil, errors.New("db pool nil")
	}
	row := &PasswordResetOTPRow{}
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, nik, otp_hash, otp_expires_at, otp_verified_at
		FROM password_reset_otp
		WHERE email=$1 AND otp_verified_at IS NULL AND password_reset_at IS NULL
		ORDER BY created_at DESC
		LIMIT 1
	`, email).Scan(&row.ID, &row.Email, &row.NIK, &row.OtpHash, &row.OtpExpiresAt, &row.OtpVerifiedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return row, err
}

// VerifyPasswordResetOTP marks OTP verified and sets reset token hash+expiry.
func (r *UserRepo) VerifyPasswordResetOTP(ctx context.Context, id int64, resetTokenHash string, resetExpiresAt time.Time) error {
	if r.pool == nil {
		return errors.New("db pool nil")
	}
	_, err := r.pool.Exec(ctx, `
		UPDATE password_reset_otp
		SET otp_verified_at = NOW(),
			reset_token_hash = $2,
			reset_expires_at = $3
		WHERE id = $1 AND otp_verified_at IS NULL AND password_reset_at IS NULL
	`, id, resetTokenHash, resetExpiresAt)
	return err
}

// GetResetTokenEmail returns email for a reset token if valid & not used.
func (r *UserRepo) GetResetTokenEmail(ctx context.Context, resetTokenHash string) (email string, ok bool, err error) {
	if r.pool == nil {
		return "", false, errors.New("db pool nil")
	}
	var out string
	err = r.pool.QueryRow(ctx, `
		SELECT email
		FROM password_reset_otp
		WHERE reset_token_hash=$1
		  AND reset_expires_at IS NOT NULL
		  AND reset_expires_at > NOW()
		  AND password_reset_at IS NULL
		ORDER BY created_at DESC
		LIMIT 1
	`, resetTokenHash).Scan(&out)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return out, true, nil
}

// MarkPasswordResetUsed marks reset token as used (single-use).
func (r *UserRepo) MarkPasswordResetUsed(ctx context.Context, resetTokenHash string) error {
	if r.pool == nil {
		return errors.New("db pool nil")
	}
	_, err := r.pool.Exec(ctx, `
		UPDATE password_reset_otp
		SET password_reset_at = NOW()
		WHERE reset_token_hash=$1 AND password_reset_at IS NULL
	`, resetTokenHash)
	return err
}

