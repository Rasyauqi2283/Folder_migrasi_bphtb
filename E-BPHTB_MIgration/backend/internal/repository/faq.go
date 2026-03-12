package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// FAQRepo handles faq table operations.
type FAQRepo struct {
	pool *pgxpool.Pool
}

// NewFAQRepo creates a FAQRepo.
func NewFAQRepo(pool *pgxpool.Pool) *FAQRepo {
	return &FAQRepo{pool: pool}
}

// FAQRow represents one faq row.
type FAQRow struct {
	ID         int64
	Question   string
	AnswerHTML string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	ExpiresAt  *time.Time
}

// List returns FAQ items. If publicOnly is true, only returns rows where expires_at IS NULL OR expires_at > NOW().
func (r *FAQRepo) List(ctx context.Context, publicOnly bool) ([]FAQRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `SELECT id, question, answer_html, created_at, updated_at, expires_at FROM faq`
	args := []interface{}{}
	if publicOnly {
		q += ` WHERE (expires_at IS NULL OR expires_at > NOW())`
	}
	q += ` ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []FAQRow
	for rows.Next() {
		var row FAQRow
		if err := rows.Scan(&row.ID, &row.Question, &row.AnswerHTML, &row.CreatedAt, &row.UpdatedAt, &row.ExpiresAt); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// GetByID returns one FAQ by id.
func (r *FAQRepo) GetByID(ctx context.Context, id int64) (*FAQRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	var row FAQRow
	err := r.pool.QueryRow(ctx,
		`SELECT id, question, answer_html, created_at, updated_at, expires_at FROM faq WHERE id = $1`,
		id,
	).Scan(&row.ID, &row.Question, &row.AnswerHTML, &row.CreatedAt, &row.UpdatedAt, &row.ExpiresAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &row, nil
}

// Create inserts a new FAQ.
func (r *FAQRepo) Create(ctx context.Context, question, answerHTML string, expiresAt *time.Time) (int64, error) {
	if r.pool == nil {
		return 0, nil
	}
	var id int64
	err := r.pool.QueryRow(ctx,
		`INSERT INTO faq (question, answer_html, expires_at) VALUES ($1, $2, $3) RETURNING id`,
		question, answerHTML, expiresAt,
	).Scan(&id)
	return id, err
}

// Update updates an existing FAQ.
func (r *FAQRepo) Update(ctx context.Context, id int64, question, answerHTML string, expiresAt *time.Time) error {
	if r.pool == nil {
		return nil
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE faq SET question = $1, answer_html = $2, updated_at = NOW(), expires_at = $3 WHERE id = $4`,
		question, answerHTML, expiresAt, id,
	)
	return err
}

// Delete deletes an FAQ by id.
func (r *FAQRepo) Delete(ctx context.Context, id int64) error {
	if r.pool == nil {
		return nil
	}
	_, err := r.pool.Exec(ctx, `DELETE FROM faq WHERE id = $1`, id)
	return err
}
