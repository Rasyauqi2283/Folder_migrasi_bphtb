package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CsTicketRepo handles cs_tickets and cs_ticket_replies.
type CsTicketRepo struct {
	pool *pgxpool.Pool
}

// NewCsTicketRepo creates CsTicketRepo.
func NewCsTicketRepo(pool *pgxpool.Pool) *CsTicketRepo {
	return &CsTicketRepo{pool: pool}
}

// Pool returns underlying pool.
func (r *CsTicketRepo) Pool() *pgxpool.Pool { return r.pool }

// CsTicketRow is one ticket for listing.
type CsTicketRow struct {
	TicketID       string    `json:"ticket_id"`
	SubmitterName  string    `json:"submitter_name"`
	UserEmail      string    `json:"user_email"`
	Subject        string    `json:"subject"`
	Message        string    `json:"message"`
	Status         string    `json:"status"`
	UnreadByCs     bool      `json:"unread_by_cs"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// CsReplyRow is one reply.
type CsReplyRow struct {
	ID              int64     `json:"id"`
	TicketID        string    `json:"ticket_id"`
	Body            string    `json:"body"`
	AuthorType      string    `json:"author_type"`
	CreatedByUserid *string   `json:"created_by_userid,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

// CreateTicket inserts a new ticket with generated ticket_id (TKT-YYYYMMDD-NNN).
func (r *CsTicketRepo) CreateTicket(ctx context.Context, submitterName, userEmail, subject, message string) (ticketID string, err error) {
	if r.pool == nil {
		return "", fmt.Errorf("database not configured")
	}
	submitterName = strings.TrimSpace(submitterName)
	userEmail = strings.TrimSpace(strings.ToLower(userEmail))
	subject = strings.TrimSpace(subject)
	message = strings.TrimSpace(message)
	if submitterName == "" || userEmail == "" || subject == "" || message == "" {
		return "", fmt.Errorf("data tidak lengkap")
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(928374651)`)
	if err != nil {
		return "", err
	}

	day := time.Now().Format("20060102")
	prefix := "TKT-" + day + "-"
	var maxSeq int
	err = tx.QueryRow(ctx, `
		SELECT COALESCE(MAX(split_part(ticket_id, '-', 3)::int), 0)
		FROM cs_tickets
		WHERE ticket_id LIKE $1
	`, prefix+"%").Scan(&maxSeq)
	if err != nil {
		return "", err
	}
	next := maxSeq + 1
	if next > 999 {
		return "", fmt.Errorf("kuota tiket harian penuh, coba besok")
	}
	ticketID = fmt.Sprintf("%s%03d", prefix, next)

	_, err = tx.Exec(ctx, `
		INSERT INTO cs_tickets (ticket_id, submitter_name, user_email, subject, message, status, unread_by_cs)
		VALUES ($1, $2, $3, $4, $5, 'open', true)
	`, ticketID, submitterName, userEmail, subject, message)
	if err != nil {
		return "", err
	}
	if err = tx.Commit(ctx); err != nil {
		return "", err
	}
	return ticketID, nil
}

// ListTickets returns tickets for CS dashboard (newest first).
func (r *CsTicketRepo) ListTickets(ctx context.Context) ([]CsTicketRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	rows, err := r.pool.Query(ctx, `
		SELECT ticket_id, submitter_name, user_email, subject, message, status, unread_by_cs, created_at, updated_at
		FROM cs_tickets
		ORDER BY
			CASE WHEN status = 'open' THEN 0 WHEN status = 'in_progress' THEN 1 ELSE 2 END,
			unread_by_cs DESC,
			created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []CsTicketRow
	for rows.Next() {
		var t CsTicketRow
		if err := rows.Scan(&t.TicketID, &t.SubmitterName, &t.UserEmail, &t.Subject, &t.Message, &t.Status, &t.UnreadByCs, &t.CreatedAt, &t.UpdatedAt); err != nil {
			continue
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

// CountUnread returns tickets with unread_by_cs = true.
func (r *CsTicketRepo) CountUnread(ctx context.Context) (int, error) {
	if r.pool == nil {
		return 0, nil
	}
	var n int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*)::int FROM cs_tickets WHERE unread_by_cs = true`).Scan(&n)
	return n, err
}

// MarkTicketRead sets unread_by_cs false.
func (r *CsTicketRepo) MarkTicketRead(ctx context.Context, ticketID string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	_, err := r.pool.Exec(ctx, `UPDATE cs_tickets SET unread_by_cs = false, updated_at = now() WHERE ticket_id = $1`, ticketID)
	return err
}

// GetTicket returns one ticket by id.
func (r *CsTicketRepo) GetTicket(ctx context.Context, ticketID string) (*CsTicketRow, error) {
	if r.pool == nil {
		return nil, fmt.Errorf("database not configured")
	}
	var t CsTicketRow
	err := r.pool.QueryRow(ctx, `
		SELECT ticket_id, submitter_name, user_email, subject, message, status, unread_by_cs, created_at, updated_at
		FROM cs_tickets WHERE ticket_id = $1
	`, ticketID).Scan(&t.TicketID, &t.SubmitterName, &t.UserEmail, &t.Subject, &t.Message, &t.Status, &t.UnreadByCs, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

// ListReplies returns conversation for a ticket.
func (r *CsTicketRepo) ListReplies(ctx context.Context, ticketID string) ([]CsReplyRow, error) {
	if r.pool == nil {
		return nil, nil
	}
	rows, err := r.pool.Query(ctx, `
		SELECT id, ticket_id, body, author_type, created_by_userid, created_at
		FROM cs_ticket_replies
		WHERE ticket_id = $1
		ORDER BY created_at ASC
	`, ticketID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []CsReplyRow
	for rows.Next() {
		var x CsReplyRow
		if err := rows.Scan(&x.ID, &x.TicketID, &x.Body, &x.AuthorType, &x.CreatedByUserid, &x.CreatedAt); err != nil {
			continue
		}
		out = append(out, x)
	}
	return out, rows.Err()
}

// AddReplyAndUpdateStatus inserts CS reply and updates ticket status.
func (r *CsTicketRepo) AddReplyAndUpdateStatus(ctx context.Context, ticketID, body, csUserid, newStatus string) error {
	if r.pool == nil {
		return fmt.Errorf("database not configured")
	}
	body = strings.TrimSpace(body)
	if body == "" {
		return fmt.Errorf("balasan kosong")
	}
	switch newStatus {
	case "open", "in_progress", "resolved":
	default:
		newStatus = "in_progress"
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var uid *string
	if csUserid != "" {
		uid = &csUserid
	}
	_, err = tx.Exec(ctx, `
		INSERT INTO cs_ticket_replies (ticket_id, body, author_type, created_by_userid)
		VALUES ($1, $2, 'cs', $3)
	`, ticketID, body, uid)
	if err != nil {
		return err
	}
	res, err := tx.Exec(ctx, `
		UPDATE cs_tickets SET status = $2, unread_by_cs = false, updated_at = now() WHERE ticket_id = $1
	`, ticketID, newStatus)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return tx.Commit(ctx)
}
