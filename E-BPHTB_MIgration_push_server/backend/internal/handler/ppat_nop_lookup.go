package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"ebphtb/backend/internal/repository"
)

// LookupNopPBB handles GET /api/ppat/pbb/lookup-nop?nop=...
// Menggabungkan data dari URL internal PBB (opsional, PBB_NOP_LOOKUP_URL) dan fallback DB terbaru.
func (h *PpatHandler) LookupNopPBB(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		ppatJSONError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}
	userid := getPpatUserid(r)
	if userid == "" {
		ppatJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if h.repo == nil || h.repo.Pool() == nil {
		ppatJSONError(w, http.StatusServiceUnavailable, "Database tidak tersedia")
		return
	}

	raw := strings.TrimSpace(r.URL.Query().Get("nop"))
	digits := repository.NormalizeNopDigits(raw)
	if len(digits) < 10 {
		ppatJSONError(w, http.StatusBadRequest, "NOP tidak valid (minimal 10 digit)")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
	defer cancel()

	out := map[string]interface{}{
		"namawajibpajak":  "",
		"alamat_objek":    "",
		"luas_tanah":      nil,
		"njop_tanah":      nil,
		"luas_bangunan":   nil,
		"njop_bangunan":   nil,
		"source":          "none",
		"noppbb_referensi": "",
	}

	if h.cfg != nil && strings.TrimSpace(h.cfg.PbbNopLookupURL) != "" {
		if ext, err := fetchPbbExternalNOP(ctx, h.cfg.PbbNopLookupURL, raw); err == nil && len(ext) > 0 {
			mergeNopLookupMap(out, ext)
			out["source"] = "external"
		}
	}

	row, err := h.repo.LookupNopFromLatestBooking(ctx, digits)
	if err != nil {
		ppatJSONError(w, http.StatusInternalServerError, "Gagal mencari NOP")
		return
	}
	if row != nil {
		if out["source"] == "none" {
			out["source"] = "internal_db"
		} else if out["source"] == "external" {
			out["source"] = "external+internal_db"
		}
		nws, _ := out["namawajibpajak"].(string)
		if strings.TrimSpace(row.Namawajibpajak) != "" && strings.TrimSpace(nws) == "" {
			out["namawajibpajak"] = row.Namawajibpajak
		}
		aos, _ := out["alamat_objek"].(string)
		if strings.TrimSpace(row.AlamatObjek) != "" && strings.TrimSpace(aos) == "" {
			out["alamat_objek"] = row.AlamatObjek
		}
		if row.LuasTanah != nil && out["luas_tanah"] == nil {
			out["luas_tanah"] = *row.LuasTanah
		}
		if row.NjopTanah != nil && out["njop_tanah"] == nil {
			out["njop_tanah"] = *row.NjopTanah
		}
		if row.LuasBangunan != nil && out["luas_bangunan"] == nil {
			out["luas_bangunan"] = *row.LuasBangunan
		}
		if row.NjopBangunan != nil && out["njop_bangunan"] == nil {
			out["njop_bangunan"] = *row.NjopBangunan
		}
		if row.Noppbb != "" {
			out["noppbb_referensi"] = row.Noppbb
		}
	}

	nw, _ := out["namawajibpajak"].(string)
	ao, _ := out["alamat_objek"].(string)
	if strings.TrimSpace(nw) == "" && strings.TrimSpace(ao) == "" && out["luas_tanah"] == nil && out["njop_tanah"] == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "NOP tidak ditemukan di sistem",
			"data":    out,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    out,
	})
}

func mergeNopLookupMap(dst map[string]interface{}, src map[string]interface{}) {
	try := func(key string, aliases ...string) interface{} {
		if v, ok := src[key]; ok && v != nil {
			return v
		}
		for _, a := range aliases {
			if v, ok := src[a]; ok && v != nil {
				return v
			}
		}
		return nil
	}
	if v := try("namawajibpajak", "nama_wp", "nama_wajib_pajak", "NAMA_WP"); v != nil {
		dst["namawajibpajak"] = strings.TrimSpace(toString(v))
	}
	if v := try("alamat_objek", "alamat", "letaktanahdanbangunan", "ALAMAT"); v != nil {
		dst["alamat_objek"] = strings.TrimSpace(toString(v))
	}
	if v := try("luas_tanah", "luasTanah"); v != nil {
		dst["luas_tanah"] = toFloat(v)
	}
	if v := try("njop_tanah", "njopTanah"); v != nil {
		dst["njop_tanah"] = toFloat(v)
	}
	if v := try("luas_bangunan", "luasBangunan"); v != nil {
		dst["luas_bangunan"] = toFloat(v)
	}
	if v := try("njop_bangunan", "njopBangunan"); v != nil {
		dst["njop_bangunan"] = toFloat(v)
	}
}

func toString(v interface{}) string {
	switch t := v.(type) {
	case string:
		return t
	case json.Number:
		return t.String()
	default:
		return strings.TrimSpace(fmt.Sprint(v))
	}
}

func toFloat(v interface{}) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case json.Number:
		f, _ := t.Float64()
		return f
	default:
		return 0
	}
}

func fetchPbbExternalNOP(ctx context.Context, tpl string, nopRaw string) (map[string]interface{}, error) {
	u := strings.TrimSpace(tpl)
	nopQ := url.QueryEscape(strings.TrimSpace(nopRaw))
	if strings.Contains(u, "{nop}") {
		u = strings.ReplaceAll(u, "{nop}", nopQ)
	} else if c := strings.Count(u, "%s"); c == 1 {
		u = fmt.Sprintf(u, strings.TrimSpace(nopRaw))
	} else {
		join := "?"
		if strings.Contains(u, "?") {
			join = "&"
		}
		u = u + join + "nop=" + nopQ
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u, nil)
	if err != nil {
		return nil, err
	}
	client := &http.Client{Timeout: 10 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, io.EOF
	}
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return nil, err
	}
	var root map[string]interface{}
	dec := json.NewDecoder(strings.NewReader(string(body)))
	dec.UseNumber()
	if err := dec.Decode(&root); err != nil {
		return nil, err
	}
	if data, ok := root["data"].(map[string]interface{}); ok {
		return data, nil
	}
	return root, nil
}
