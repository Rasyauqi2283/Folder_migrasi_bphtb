package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"ebphtb/backend/internal/repository"
)

type QuotaHandler struct {
	repo *repository.QuotaRepo

	mu    sync.Mutex
	cache map[string]quotaCacheEntry
}

type quotaCacheEntry struct {
	expiresAt time.Time
	payload   map[string]interface{}
	status    int
}

func NewQuotaHandler(repo *repository.QuotaRepo) *QuotaHandler {
	return &QuotaHandler{
		repo:  repo,
		cache: map[string]quotaCacheEntry{},
	}
}

func quotaUseridFromCookieOrHeader(r *http.Request) string {
	if c, err := r.Cookie("ebphtb_userid"); err == nil && c != nil && strings.TrimSpace(c.Value) != "" {
		return strings.TrimSpace(c.Value)
	}
	return strings.TrimSpace(r.Header.Get("X-User-Id"))
}

func parseJakartaDateParam(raw string) (time.Time, bool) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Time{}, false
	}
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		loc = time.Local
	}
	// Expect YYYY-MM-DD
	t, err := time.ParseInLocation("2006-01-02", raw, loc)
	if err != nil {
		return time.Time{}, false
	}
	return t, true
}

// GetAdminQuotaToday handles GET /api/admin/quota-today?mode=online|offline&date=YYYY-MM-DD
func (h *QuotaHandler) GetAdminQuotaToday(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	mode := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("mode")))
	if mode == "" {
		mode = "online"
	}
	dateParam := r.URL.Query().Get("date")
	limit := 80
	if mode == "offline" {
		limit = 40
	}

	dateJakarta := jakartaNow()
	if t, ok := parseJakartaDateParam(dateParam); ok {
		dateJakarta = t
	}

	// Cache per mode+date (admin global)
	cacheKey := "admin:" + mode + ":" + dateJakarta.Format("2006-01-02")
	if entry, ok := h.getCache(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(entry.status)
		_ = json.NewEncoder(w).Encode(entry.payload)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()

	used := 0
	var err error
	if mode == "online" {
		used, err = h.repo.CountOnlineReceivedOnDate(ctx, dateJakarta)
	} else {
		// Placeholder until offline case exists in DB.
		used = 0
		err = nil
	}
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memuat kuota")
		return
	}

	payload := map[string]interface{}{
		"success": true,
		"mode":    mode,
		"limit":   limit,
		"used":    used,
		"date":    dateJakarta.Format("2006-01-02"),
		"tz":      "Asia/Jakarta",
	}
	h.setCache(cacheKey, http.StatusOK, payload, 15*time.Second)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

// GetPenelitiQuotaToday handles GET /api/peneliti/quota-today?mode=online|offline&date=YYYY-MM-DD
func (h *QuotaHandler) GetPenelitiQuotaToday(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	userid := quotaUseridFromCookieOrHeader(r)
	if userid == "" {
		jsonError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	mode := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("mode")))
	if mode == "" {
		mode = "online"
	}
	dateParam := r.URL.Query().Get("date")
	limit := 80
	if mode == "offline" {
		limit = 40
	}

	dateJakarta := jakartaNow()
	if t, ok := parseJakartaDateParam(dateParam); ok {
		dateJakarta = t
	}

	cacheKey := "peneliti:" + userid + ":" + mode + ":" + dateJakarta.Format("2006-01-02")
	if entry, ok := h.getCache(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(entry.status)
		_ = json.NewEncoder(w).Encode(entry.payload)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()

	verified := 0
	var err error
	if mode == "online" {
		verified, err = h.repo.CountOnlineVerifiedByUserOnDate(ctx, userid, dateJakarta)
	} else {
		verified = 0
		err = nil
	}
	if err != nil {
		jsonError(w, http.StatusInternalServerError, "Gagal memuat kuota")
		return
	}

	payload := map[string]interface{}{
		"success":      true,
		"mode":         mode,
		"limit":        limit,
		"verified":     verified,
		"verified_by":  userid,
		"date":         dateJakarta.Format("2006-01-02"),
		"tz":           "Asia/Jakarta",
		"cache_ttl_s":  15,
		"offline_note": "Coming Soon",
	}
	h.setCache(cacheKey, http.StatusOK, payload, 15*time.Second)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *QuotaHandler) getCache(key string) (quotaCacheEntry, bool) {
	h.mu.Lock()
	defer h.mu.Unlock()
	e, ok := h.cache[key]
	if !ok {
		return quotaCacheEntry{}, false
	}
	if time.Now().After(e.expiresAt) {
		delete(h.cache, key)
		return quotaCacheEntry{}, false
	}
	return e, true
}

func (h *QuotaHandler) setCache(key string, status int, payload map[string]interface{}, ttl time.Duration) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.cache[key] = quotaCacheEntry{
		expiresAt: time.Now().Add(ttl),
		payload:   payload,
		status:    status,
	}
}

