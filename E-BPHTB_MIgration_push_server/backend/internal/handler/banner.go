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

// BannerHandler handles /api/banners (public) and /api/admin/banners (admin).
type BannerHandler struct {
	cfg    *config.Config
	user   *repository.UserRepo
	banner *repository.BannerRepo
}

// NewBannerHandler creates a BannerHandler.
func NewBannerHandler(cfg *config.Config, user *repository.UserRepo, banner *repository.BannerRepo) *BannerHandler {
	return &BannerHandler{cfg: cfg, user: user, banner: banner}
}

func (h *BannerHandler) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	userid := adminUseridFromCookie(r)
	if userid == "" {
		adminJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "Unauthorized"})
		return false
	}
	if h.user == nil || h.user.Pool() == nil {
		adminJSON(w, http.StatusServiceUnavailable, map[string]interface{}{"success": false, "message": "Database tidak tersedia"})
		return false
	}
	user, err := h.user.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || user == nil {
		adminJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "message": "Unauthorized"})
		return false
	}
	div := strings.ToLower(strings.TrimSpace(user.Divisi))
	if div != "administrator" && div != "admin" && div != "a" {
		adminJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Admin access required"})
		return false
	}
	return true
}

func bannerToMap(row *repository.BannerRow) map[string]interface{} {
	m := map[string]interface{}{
		"id":         row.ID,
		"image_path": row.ImagePath,
		"ttl_type":   row.TTLType,
		"created_at": row.CreatedAt.Format(time.RFC3339),
	}
	if row.LinkURL != nil {
		m["link_url"] = *row.LinkURL
	} else {
		m["link_url"] = ""
	}
	if row.TTLValue != nil {
		m["ttl_value"] = *row.TTLValue
	} else {
		m["ttl_value"] = nil
	}
	if row.ExpiresAt != nil {
		m["expires_at"] = row.ExpiresAt.Format(time.RFC3339)
	} else {
		m["expires_at"] = nil
	}
	return m
}

// computeExpiresAt returns expires_at from ttlType and ttlValue. For "lifetime" returns nil.
func computeExpiresAt(ttlType string, ttlValue *int) *time.Time {
	if ttlValue == nil || *ttlValue <= 0 {
		return nil
	}
	ttlType = strings.ToLower(strings.TrimSpace(ttlType))
	now := time.Now()
	switch ttlType {
	case "hours":
		t := now.Add(time.Duration(*ttlValue) * time.Hour)
		return &t
	case "day":
		t := now.AddDate(0, 0, *ttlValue)
		return &t
	default:
		return nil // lifetime
	}
}

// GetActive handles GET /api/banners (public). Returns only active banners.
func (h *BannerHandler) GetActive(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	list, err := h.banner.ListActive(r.Context())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "data": nil})
		return
	}
	data := make([]map[string]interface{}, 0, len(list))
	for i := range list {
		data = append(data, bannerToMap(&list[i]))
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": data})
}

// GetListAdmin handles GET /api/admin/banners (admin only). Returns all banners.
func (h *BannerHandler) GetListAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	list, err := h.banner.ListAll(r.Context())
	if err != nil {
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	data := make([]map[string]interface{}, 0, len(list))
	for i := range list {
		data = append(data, bannerToMap(&list[i]))
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// CreateAdmin handles POST /api/admin/banners (admin only). Multipart: image file + link_url, ttl_type, ttl_value.
func (h *BannerHandler) CreateAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	const maxSize = 10 << 20 // 10MB
	if err := r.ParseMultipartForm(maxSize); err != nil {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "Upload too large or invalid"})
		return
	}
	file, header, err := r.FormFile("image")
	if err != nil {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "missing image"})
		return
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid image type"})
		return
	}
	linkURL := strings.TrimSpace(r.FormValue("link_url"))
	ttlType := strings.TrimSpace(r.FormValue("ttl_type"))
	if ttlType == "" {
		ttlType = "lifetime"
	}
	var ttlValue *int
	if v := r.FormValue("ttl_value"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			ttlValue = &n
		}
	}
	expiresAt := computeExpiresAt(ttlType, ttlValue)

	dir := h.cfg.BannerUploadDir
	if dir == "" {
		dir = "./uploads/banners"
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "server config error"})
		return
	}
	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	fpath := filepath.Join(dir, name)
	dst, err := os.Create(fpath)
	if err != nil {
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		_ = os.Remove(fpath)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	// Store filename only; served at /api/uploads/banners/{name}
	id, err := h.banner.Create(r.Context(), name, linkURL, ttlType, ttlValue, expiresAt)
	if err != nil {
		_ = os.Remove(fpath)
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{"success": true, "id": id, "image_path": name})
}

// UpdateAdmin handles PUT /api/admin/banners/{id} (admin only). JSON or form: link_url, ttl_type, ttl_value; optional new image.
func (h *BannerHandler) UpdateAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := r.PathValue("id")
	if idStr == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "id required"})
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid id"})
		return
	}
	row, err := h.banner.GetByID(r.Context(), id)
	if err != nil || row == nil {
		adminJSON(w, http.StatusNotFound, map[string]interface{}{"success": false, "message": "not found"})
		return
	}
	imagePath := row.ImagePath
	linkStr := ""
	if row.LinkURL != nil {
		linkStr = *row.LinkURL
	}
	ttlType := row.TTLType
	ttlValue := row.TTLValue

	ct := r.Header.Get("Content-Type")
	if strings.Contains(ct, "application/json") {
		var body struct {
			LinkURL  *string `json:"link_url"`
			TTLType  string  `json:"ttl_type"`
			TTLValue *int    `json:"ttl_value"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
			if body.LinkURL != nil {
				linkStr = *body.LinkURL
			}
			if body.TTLType != "" {
				ttlType = body.TTLType
			}
			if body.TTLValue != nil {
				ttlValue = body.TTLValue
			}
		}
	} else {
		if err := r.ParseMultipartForm(10 << 20); err == nil {
			if v := r.FormValue("link_url"); v != "" {
				linkStr = v
			}
			if v := r.FormValue("ttl_type"); v != "" {
				ttlType = v
			}
			if v := r.FormValue("ttl_value"); v != "" {
				if n, e := strconv.Atoi(v); e == nil {
					ttlValue = &n
				}
			}
			file, header, err := r.FormFile("image")
			if err == nil && file != nil && header != nil {
				ext := strings.ToLower(filepath.Ext(header.Filename))
				if ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".gif" || ext == ".webp" {
					dir := h.cfg.BannerUploadDir
					if dir == "" {
						dir = "./uploads/banners"
					}
					os.MkdirAll(dir, 0755)
					name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
					fpath := filepath.Join(dir, name)
					dst, createErr := os.Create(fpath)
					if createErr == nil {
						io.Copy(dst, file)
						dst.Close()
						imagePath = name
					}
					file.Close()
				} else {
					file.Close()
				}
			}
		}
	}
	expiresAt := computeExpiresAt(ttlType, ttlValue)
	if err := h.banner.Update(r.Context(), id, imagePath, linkStr, ttlType, ttlValue, expiresAt); err != nil {
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}

// DeleteAdmin handles DELETE /api/admin/banners/{id} (admin only).
func (h *BannerHandler) DeleteAdmin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}
	if !h.requireAdmin(w, r) {
		return
	}
	idStr := r.PathValue("id")
	if idStr == "" {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "id required"})
		return
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		adminJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "invalid id"})
		return
	}
	if err := h.banner.Delete(r.Context(), id); err != nil {
		adminJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	adminJSON(w, http.StatusOK, map[string]interface{}{"success": true})
}
