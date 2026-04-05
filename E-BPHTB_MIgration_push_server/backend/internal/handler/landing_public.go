package handler

import (
	"encoding/json"
	"net/http"
)

// PublicLandingPing matches CodeIgniter root::landing_ping() JSON: {"ok":true}.
// PHP: GET .../root/landing_ping — used by verse landing for simple liveness.
func PublicLandingPing(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Method tidak diizinkan.",
		})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}
