package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"ebphtb/backend/internal/repository"
)

// UserLookupHandler serves GET /api/user/lookup for PU (PPAT) — data dari a_2_verified_users.
type UserLookupHandler struct {
	repo *repository.UserRepo
}

// NewUserLookupHandler constructs handler.
func NewUserLookupHandler(repo *repository.UserRepo) *UserLookupHandler {
	return &UserLookupHandler{repo: repo}
}

// Lookup handles GET /api/user/lookup?identity_number=...
func (h *UserLookupHandler) Lookup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Unauthorized"})
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Database tidak tersedia"})
		return
	}

	raw := strings.TrimSpace(r.URL.Query().Get("identity_number"))
	if raw == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "identity_number wajib"})
		return
	}
	kind := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("identity_kind")))
	if kind != "" && kind != "nik" && kind != "npwp" {
		kind = ""
	}

	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	row, err := h.repo.LookupVerifiedUserByIdentity(ctx, raw, kind)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "message": "Gagal mencari data"})
		return
	}
	if row == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Data belum terdaftar, silakan isi manual",
			"data":    nil,
		})
		return
	}

	// Perkaya alamat dari KTP OCR (jika ada) untuk NIK terdaftar
	if row.Nik != "" {
		if ocrJSON, _ := h.repo.GetCekKtpOcrByNIK(ctx, row.Nik); strings.TrimSpace(ocrJSON) != "" {
			applyKtpOcrHints(ocrJSON, row)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    row,
	})
}

func applyKtpOcrHints(ocrJSON string, out *repository.VerifiedUserLookupPublic) {
	var m map[string]interface{}
	if err := json.Unmarshal([]byte(ocrJSON), &m); err != nil {
		return
	}
	pickStr := func(keys ...string) string {
		for _, k := range keys {
			if v, ok := m[k]; ok && v != nil {
				if s, ok := v.(string); ok {
					s = strings.TrimSpace(s)
					if s != "" {
						return s
					}
				}
			}
		}
		return ""
	}
	if out.KabupatenKota == "" {
		out.KabupatenKota = strings.TrimSpace(pickStr("kabupaten", "Kabupaten", "kota", "Kota", "KABUPATEN", "KOTA"))
	}
	if out.Kecamatan == "" {
		out.Kecamatan = pickStr("kecamatan", "Kecamatan", "KECAMATAN")
	}
	if out.Kelurahan == "" {
		out.Kelurahan = pickStr("kelurahan", "Kelurahan", "kel_desa", "desa", "Desa", "KELURAHAN")
	}
	rt := pickStr("rt", "RT")
	rw := pickStr("rw", "RW")
	if out.Rtrw == "" && (rt != "" || rw != "") {
		out.Rtrw = strings.Trim(strings.TrimSpace(rt+"/"+rw), "/")
	}
	if out.AlamatLengkap == "" {
		out.AlamatLengkap = pickStr("alamat", "Alamat", "address", "jalan", "Jalan")
	}
}
