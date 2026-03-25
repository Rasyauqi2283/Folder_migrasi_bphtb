package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"

	mail "ebphtb/backend/internal/email"
	"ebphtb/backend/internal/repository"
)

// SupportHandler handles public support tickets and CS replies.
type SupportHandler struct {
	tickets *repository.CsTicketRepo
	users   *repository.UserRepo
}

// NewSupportHandler creates SupportHandler.
func NewSupportHandler(tickets *repository.CsTicketRepo, users *repository.UserRepo) *SupportHandler {
	return &SupportHandler{tickets: tickets, users: users}
}

func csUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

func isCustomerService(divisi string) bool {
	d := strings.ToLower(strings.TrimSpace(divisi))
	return d == "customer service" || d == "cs"
}

func (h *SupportHandler) requireCS(w http.ResponseWriter, r *http.Request) (userid string, ok bool) {
	userid = csUseridFromCookie(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	if h.users == nil || h.users.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return "", false
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	u, err := h.users.GetByIdentifierForLogin(ctx, userid)
	if err != nil || u == nil {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return "", false
	}
	if !isCustomerService(u.Divisi) {
		jsonError(w, http.StatusForbidden, "Akses khusus Customer Service")
		return "", false
	}
	return userid, true
}

// CreatePublicTicket handles POST /api/public/support/tickets (no login).
func (h *SupportHandler) CreatePublicTicket(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if h.tickets == nil || h.tickets.Pool() == nil {
		jsonError(w, http.StatusServiceUnavailable, "Layanan tidak tersedia")
		return
	}
	var body struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, http.StatusBadRequest, "JSON tidak valid")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()

	ticketID, err := h.tickets.CreateTicket(ctx, body.Name, body.Email, body.Subject, body.Message)
	if err != nil {
		log.Printf("[SUPPORT] CreateTicket: %v", err)
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	go func(to, nama, tid, subj, msg string) {
		if err := mail.SendSupportTicketConfirmation(to, nama, tid, subj, msg); err != nil {
			log.Printf("[SUPPORT] confirmation email: %v", err)
		}
	}(strings.TrimSpace(strings.ToLower(body.Email)), strings.TrimSpace(body.Name), ticketID, strings.TrimSpace(body.Subject), strings.TrimSpace(body.Message))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"ticket_id":  ticketID,
		"message":    "Tiket berhasil dibuat. Periksa email Anda untuk nomor tiket.",
	})
}

// ListTicketsCS handles GET /api/cs/support/tickets.
func (h *SupportHandler) ListTicketsCS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if _, ok := h.requireCS(w, r); !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
	defer cancel()
	list, err := h.tickets.ListTickets(ctx)
	if err != nil {
		log.Printf("[SUPPORT] ListTickets: %v", err)
		jsonError(w, http.StatusInternalServerError, "Gagal memuat tiket")
		return
	}
	unread, _ := h.tickets.CountUnread(ctx)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"data":          list,
		"unread_count": unread,
	})
}

// UnreadCountCS handles GET /api/cs/support/tickets/unread-count.
func (h *SupportHandler) UnreadCountCS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if _, ok := h.requireCS(w, r); !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	n, err := h.tickets.CountUnread(ctx)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "unread_count": n})
}

// GetTicketCS handles GET /api/cs/support/tickets/{ticket_id}.
func (h *SupportHandler) GetTicketCS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	if _, ok := h.requireCS(w, r); !ok {
		return
	}
	tid := r.PathValue("ticket_id")
	if tid == "" {
		jsonError(w, http.StatusBadRequest, "ticket_id wajib")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	t, err := h.tickets.GetTicket(ctx, tid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			jsonError(w, http.StatusNotFound, "Tiket tidak ditemukan")
			return
		}
		jsonError(w, http.StatusInternalServerError, "Gagal")
		return
	}
	_ = h.tickets.MarkTicketRead(ctx, tid)
	replies, _ := h.tickets.ListReplies(ctx, tid)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"ticket":  t,
		"replies": replies,
	})
}

// ReplyTicketCS handles POST /api/cs/support/tickets/{ticket_id}/reply.
func (h *SupportHandler) ReplyTicketCS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	csUserid, ok := h.requireCS(w, r)
	if !ok {
		return
	}
	tid := r.PathValue("ticket_id")
	if tid == "" {
		jsonError(w, http.StatusBadRequest, "ticket_id wajib")
		return
	}
	var body struct {
		Reply  string `json:"reply"`
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		jsonError(w, http.StatusBadRequest, "JSON tidak valid")
		return
	}
	st := strings.TrimSpace(body.Status)
	if st == "" {
		st = "in_progress"
	}
	ctx, cancel := context.WithTimeout(r.Context(), 20*time.Second)
	defer cancel()
	ticket, err := h.tickets.GetTicket(ctx, tid)
	if err != nil {
		jsonError(w, http.StatusNotFound, "Tiket tidak ditemukan")
		return
	}
	err = h.tickets.AddReplyAndUpdateStatus(ctx, tid, body.Reply, csUserid, st)
	if err != nil {
		log.Printf("[SUPPORT] AddReply: %v", err)
		jsonError(w, http.StatusBadRequest, err.Error())
		return
	}

	go func() {
		if err := mail.SendSupportTicketReply(ticket.UserEmail, tid, ticket.Subject, ticket.Message, strings.TrimSpace(body.Reply)); err != nil {
			log.Printf("[SUPPORT] reply email: %v", err)
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Balasan terkirim ke email pengguna.",
	})
}
