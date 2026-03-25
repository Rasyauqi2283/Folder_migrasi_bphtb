package repository

import (
	"context"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// SystemStatusRepo reads system status flags from DB table system_status.
type SystemStatusRepo struct {
	pool *pgxpool.Pool
}

func NewSystemStatusRepo(pool *pgxpool.Pool) *SystemStatusRepo {
	return &SystemStatusRepo{pool: pool}
}

func (r *SystemStatusRepo) Pool() *pgxpool.Pool { return r.pool }

type MaintenanceStatus struct {
	Online      bool
	Message     *string
	ScheduledAt *time.Time
	EtaDoneAt   *time.Time
	UpdatedAt   *time.Time
}

// GetMaintenanceMode returns maintenance flag from system_status key 'maintenance_mode'.
// If row doesn't exist, defaults to online.
func (r *SystemStatusRepo) GetMaintenanceMode(ctx context.Context) (*MaintenanceStatus, error) {
	if r.pool == nil {
		// no DB configured: treat as online so dev can run.
		return &MaintenanceStatus{Online: true}, nil
	}
	var value *string
	var message *string
	var scheduledAt *time.Time
	var etaDoneAt *time.Time
	var updatedAt *time.Time
	err := r.pool.QueryRow(ctx, `
		SELECT value, message, scheduled_at, eta_done_at, updated_at
		FROM system_status
		WHERE key = 'maintenance_mode'
	`).Scan(&value, &message, &scheduledAt, &etaDoneAt, &updatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return &MaintenanceStatus{Online: true}, nil
		}
		return nil, err
	}
	v := strings.ToLower(strings.TrimSpace(ptrToStr(value)))
	online := v != "offline" && v != "off"
	return &MaintenanceStatus{
		Online:      online,
		Message:     message,
		ScheduledAt: scheduledAt,
		EtaDoneAt:   etaDoneAt,
		UpdatedAt:   updatedAt,
	}, nil
}

func ptrToStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

