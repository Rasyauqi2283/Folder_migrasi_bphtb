package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/repository"
)

// FAQHandler handles /api/faq and /api/faq/upload.
type FAQHandler struct {
	cfg  *config.Config
	user *repository.UserRepo
	faq  *repository.FAQRepo
}

// NewFAQHandler creates a FAQHandler.
func NewFAQHandler(cfg *config.Config, user *repository.UserRepo, faq *repository.FAQRepo) *FAQHandler {
	return &FAQHandler{cfg: cfg, user: user, faq: faq}
}

func (h *FAQHandler) isAdmin(r *http.Request) bool {
	userid := adminUseridFromCookie(r)
	if userid == "" {
		return false
	}
	if h.user == nil || h.user.Pool() == nil {
		return false
	}
	user, err := h.user.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		return false
	}
	div := strings.ToLower(strings.TrimSpace(user.Divisi))
	return div == "administrator" || div == "admin" || div == "a"
}

func (h *FAQHandler) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	if !h.isAdmin(r) {
		faqJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "Unauthorized"})
		return false
	}
	return true
}

func faqJSON(w http.ResponseWriter, status int, body interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}

// GetList handles GET /api/faq. Public: only active (expires_at). Admin: all.
func (h *FAQHandler) GetList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	publicOnly := !h.isAdmin(r)
	list, err := h.faq.List(r.Context(), publicOnly)
	if err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	data := make([]map[string]interface{}, 0, len(list))
	for _, row := range list {
		var expiresAt interface{}
		if row.ExpiresAt != nil {
			expiresAt = row.ExpiresAt.Format(time.RFC3339)
		}
		data = append(data, map[string]interface{}{
			"id":          row.ID,
			"question":    row.Question,
			"answer_html": row.AnswerHTML,
			"created_at":  row.CreatedAt.Format(time.RFC3339),
			"updated_at":  row.UpdatedAt.Format(time.RFC3339),
			"expires_at":  expiresAt,
		})
	}
	faqJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// Create handles POST /api/faq (admin only).
func (h *FAQHandler) Create(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	var body struct {
		Question   string `json:"question"`
		AnswerHTML string `json:"answer_html"`
		TTLType    string `json:"ttl_type"`
		TTLValue   *int   `json:"ttl_value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Invalid JSON"})
		return
	}
	question := strings.TrimSpace(body.Question)
	answerHTML := strings.TrimSpace(body.AnswerHTML)
	if question == "" || answerHTML == "" {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "question and answer_html required"})
		return
	}
	var expiresAt *time.Time
	if body.TTLType != "" && body.TTLValue != nil && *body.TTLValue > 0 {
		now := time.Now()
		switch strings.ToLower(body.TTLType) {
		case "hours":
			t := now.Add(time.Duration(*body.TTLValue) * time.Hour)
			expiresAt = &t
		case "day":
			t := now.AddDate(0, 0, *body.TTLValue)
			expiresAt = &t
		}
	}
	id, err := h.faq.Create(r.Context(), question, answerHTML, expiresAt)
	if err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	faqJSON(w, http.StatusOK, map[string]interface{}{"success": true, "id": id})
}

// Update handles PUT /api/faq/{id} (admin only).
func (h *FAQHandler) Update(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := r.PathValue("id")
	if idStr == "" {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "id required"})
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid id"})
		return
	}
	var body struct {
		Question   string `json:"question"`
		AnswerHTML string `json:"answer_html"`
		TTLType    string `json:"ttl_type"`
		TTLValue   *int   `json:"ttl_value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Invalid JSON"})
		return
	}
	question := strings.TrimSpace(body.Question)
	answerHTML := strings.TrimSpace(body.AnswerHTML)
	if question == "" || answerHTML == "" {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "question and answer_html required"})
		return
	}
	var expiresAt *time.Time
	if body.TTLType != "" && body.TTLValue != nil && *body.TTLValue > 0 {
		now := time.Now()
		switch strings.ToLower(body.TTLType) {
		case "hours":
			t := now.Add(time.Duration(*body.TTLValue) * time.Hour)
			expiresAt = &t
		case "day":
			t := now.AddDate(0, 0, *body.TTLValue)
			expiresAt = &t
		}
	}
	if err := h.faq.Update(r.Context(), id, question, answerHTML, expiresAt); err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	faqJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// Delete handles DELETE /api/faq/{id} (admin only).
func (h *FAQHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := r.PathValue("id")
	if idStr == "" {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "id required"})
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid id"})
		return
	}
	if err := h.faq.Delete(r.Context(), id); err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	faqJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// Upload handles POST /api/faq/upload (admin only). Expects multipart form "image". Returns { success, url }.
func (h *FAQHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	const maxSize = 5 << 20 // 5MB
	if err := r.ParseMultipartForm(maxSize); err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Upload too large or invalid"})
		return
	}
	file, header, err := r.FormFile("image")
	if err != nil {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "missing image"})
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		faqJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid image type"})
		return
	}
	dir := h.cfg.FAQUploadDir
	if dir == "" {
		dir = "./uploads/faq"
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "server config error"})
		return
	}
	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	fpath := filepath.Join(dir, name)
	dst, err := os.Create(fpath)
	if err != nil {
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		_ = os.Remove(fpath)
		faqJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	url := "/api/uploads/faq/" + name
	faqJSON(w, http.StatusOK, map[string]interface{}{"success": true, "url": url})
}
