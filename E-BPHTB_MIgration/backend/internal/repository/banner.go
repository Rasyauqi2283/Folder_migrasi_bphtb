package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// BannerRepo handles banners table operations.
type BannerRepo struct {
	pool *pgxpool.Pool
}

// NewBannerRepo creates a BannerRepo.
func NewBannerRepo(pool *pgxpool.Pool) *BannerRepo {
	return &BannerRepo{pool: pool}
}

// BannerRow represents one banner row.
type BannerRow struct {
	ID         int64
	ImagePath  string
	LinkURL    *string
	TTLType    string
	TTLValue   *int
	ExpiresAt  *time.Time
	CreatedAt  time.Time
}

// ListActive returns banners visible to public (expires_at IS NULL OR expires_at > NOW()).
func (r *BannerRepo) ListActive(ctx context.Context) ([]BannerRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `SELECT id, image_path, link_url, ttl_type, ttl_value, expires_at, created_at FROM banners 
		  WHERE (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []BannerRow
	for rows.Next() {
		var row BannerRow
		if err := rows.Scan(&row.ID, &row.ImagePath, &row.LinkURL, &row.TTLType, &row.TTLValue, &row.ExpiresAt, &row.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// ListAll returns all banners (for admin).
func (r *BannerRepo) ListAll(ctx context.Context) ([]BannerRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	q := `SELECT id, image_path, link_url, ttl_type, ttl_value, expires_at, created_at FROM banners ORDER BY created_at DESC`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []BannerRow
	for rows.Next() {
		var row BannerRow
		if err := rows.Scan(&row.ID, &row.ImagePath, &row.LinkURL, &row.TTLType, &row.TTLValue, &row.ExpiresAt, &row.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

// GetByID returns one banner by id.
func (r *BannerRepo) GetByID(ctx context.Context, id int64) (*BannerRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	var row BannerRow
	err := r.pool.QueryRow(ctx,
		`SELECT id, image_path, link_url, ttl_type, ttl_value, expires_at, created_at FROM banners WHERE id = $1`,
		id,
	).Scan(&row.ID, &row.ImagePath, &row.LinkURL, &row.TTLType, &row.TTLValue, &row.ExpiresAt, &row.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &row, nil
}

// Create inserts a new banner. linkURL can be nil for empty.
func (r *BannerRepo) Create(ctx context.Context, imagePath, linkURL, ttlType string, ttlValue *int, expiresAt *time.Time) (int64, error) {
	if r.pool == nil {
		return 0, nil
	}
	var link *string
	if linkURL != "" {
		link = &linkURL
	}
	var id int64
	err := r.pool.QueryRow(ctx,
		`INSERT INTO banners (image_path, link_url, ttl_type, ttl_value, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		imagePath, link, ttlType, ttlValue, expiresAt,
	).Scan(&id)
	return id, err
}

// Update updates an existing banner.
func (r *BannerRepo) Update(ctx context.Context, id int64, imagePath, linkURL, ttlType string, ttlValue *int, expiresAt *time.Time) error {
	if r.pool == nil {
		return nil
	}
	var link *string
	if linkURL != "" {
		link = &linkURL
	}
	_, err := r.pool.Exec(ctx,
		`UPDATE banners SET image_path = $1, link_url = $2, ttl_type = $3, ttl_value = $4, expires_at = $5 WHERE id = $6`,
		imagePath, link, ttlType, ttlValue, expiresAt, id,
	)
	return err
}

// Delete deletes a banner by id.
func (r *BannerRepo) Delete(ctx context.Context, id int64) error {
	if r.pool == nil {
		return nil
	}
	_, err := r.pool.Exec(ctx, `DELETE FROM banners WHERE id = $1`, id)
	return err
}
