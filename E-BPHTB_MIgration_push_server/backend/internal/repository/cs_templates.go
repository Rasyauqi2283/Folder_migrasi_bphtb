package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CsTemplateRepo handles cs_reply_templates.
type CsTemplateRepo struct {
	pool *pgxpool.Pool
}

func NewCsTemplateRepo(pool *pgxpool.Pool) *CsTemplateRepo {
	return &CsTemplateRepo{pool: pool}
}

func (r *CsTemplateRepo) Pool() *pgxpool.Pool { return r.pool }

type CsReplyTemplateRow struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

func (r *CsTemplateRepo) ListTemplatesByCS(ctx context.Context, csUserid string) ([]CsReplyTemplateRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	csUserid = strings.TrimSpace(csUserid)
	if csUserid == "" {
		return nil, fmt.Errorf("cs userid kosong")
	}
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, content, created_by, created_at
		FROM cs_reply_templates
		WHERE created_by = $1
		ORDER BY created_at DESC, id DESC
	`, csUserid)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]CsReplyTemplateRow, 0, 16)
	for rows.Next() {
		var x CsReplyTemplateRow
		if err := rows.Scan(&x.ID, &x.Title, &x.Content, &x.CreatedBy, &x.CreatedAt); err != nil {
			continue
		}
		out = append(out, x)
	}
	return out, rows.Err()
}

func (r *CsTemplateRepo) CreateTemplate(ctx context.Context, title, content, csUserid string) (*CsReplyTemplateRow, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	title = strings.TrimSpace(title)
	content = strings.TrimSpace(content)
	csUserid = strings.TrimSpace(csUserid)
	if title == "" || content == "" || csUserid == "" {
		return nil, fmt.Errorf("data tidak lengkap")
	}
	if len(title) > 120 {
		return nil, fmt.Errorf("judul terlalu panjang (maks 120 karakter)")
	}

	var out CsReplyTemplateRow
	err := r.pool.QueryRow(ctx, `
		INSERT INTO cs_reply_templates (title, content, created_by)
		VALUES ($1, $2, $3)
		RETURNING id, title, content, created_by, created_at
	`, title, content, csUserid).Scan(&out.ID, &out.Title, &out.Content, &out.CreatedBy, &out.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *CsTemplateRepo) DeleteTemplate(ctx context.Context, id int64, csUserid string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	csUserid = strings.TrimSpace(csUserid)
	if csUserid == "" || id <= 0 {
		return fmt.Errorf("invalid request")
	}
	tag, err := r.pool.Exec(ctx, `DELETE FROM cs_reply_templates WHERE id = $1 AND created_by = $2`, id, csUserid)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

