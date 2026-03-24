package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	mail "ebphtb/backend/internal/email"
	"ebphtb/backend/internal/repository"
)

func penelitiUseridFromCookie(r *http.Request) string {
	c, err := r.Cookie("ebphtb_userid")
	if err != nil || c == nil || strings.TrimSpace(c.Value) == "" {
		return ""
	}
	return strings.TrimSpace(c.Value)
}

// PenelitiHandler handles /api/peneliti_get-berkas-fromltb and /api/peneliti/get-berkas-till-verif (Go-native).
type PenelitiHandler struct {
	repo     *repository.PenelitiRepo
	userRepo *repository.UserRepo
}

// NewPenelitiHandler creates a PenelitiHandler.
func NewPenelitiHandler(repo *repository.PenelitiRepo, userRepo *repository.UserRepo) *PenelitiHandler {
	return &PenelitiHandler{repo: repo, userRepo: userRepo}
}

func (h *PenelitiHandler) requirePeneliti(r *http.Request) (userid string, ok bool) {
	userid = penelitiUseridFromCookie(r)
	if userid == "" {
		return "", false
	}
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return "", false
	}
	if !strings.EqualFold(strings.TrimSpace(u.Divisi), "Peneliti") {
		return "", false
	}
	return userid, true
}

func (h *PenelitiHandler) requireSignature(userid string, r *http.Request) error {
	u, err := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	if err != nil || u == nil {
		return err
	}
	if u.TandaTanganPath == nil || strings.TrimSpace(*u.TandaTanganPath) == "" || u.TandaTanganMime == nil || strings.TrimSpace(*u.TandaTanganMime) == "" {
		return http.ErrNoCookie
	}
	return nil
}

func penelitiJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// GetBerkasFromLtb handles GET /api/peneliti_get-berkas-fromltb.
func (h *PenelitiHandler) GetBerkasFromLtb(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak. Silakan login dengan user divisi Peneliti."})
		return
	}
	data, err := h.repo.GetBerkasFromLtb(r.Context(), userid)
	if err != nil {
		log.Printf("[PENELITI] GetBerkasFromLtb: %v", err)
		penelitiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "message": "An error occurred while fetching data."})
		return
	}
	if data == nil {
		data = []repository.PenelitiBerkasFromLtbRow{}
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": data})
}

// GetBerkasTillVerif handles GET /api/peneliti/get-berkas-till-verif.
func (h *PenelitiHandler) GetBerkasTillVerif(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]string{"success": "false", "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusUnauthorized, map[string]interface{}{"success": false, "code": "UNAUTHENTICATED", "message": "Authentication required"})
		return
	}
	data, err := h.repo.GetBerkasTillVerif(r.Context(), userid)
	if err != nil {
		log.Printf("[PENELITI] GetBerkasTillVerif: %v", err)
		penelitiJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "code": "SERVER_ERROR", "message": "Internal server error"})
		return
	}
	if data == nil {
		data = []repository.PenelitiBerkasTillVerifRow{}
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{
		"success": true, "data": data,
		"metadata": map[string]interface{}{"count": len(data), "generatedAt": ""},
	})
}

// UpdateBerdasarkanPemilihan handles POST /api/peneliti_update-berdasarkan-pemilihan.
func (h *PenelitiHandler) UpdateBerdasarkanPemilihan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak"})
		return
	}
	if err := h.requireSignature(userid, r); err != nil {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak."})
		return
	}
	var body struct {
		Data *struct {
			Nobooking                 string  `json:"nobooking"`
			Pemilihan                 string  `json:"pemilihan"`
			NomorSTPD                 *string `json:"nomorstpd"`
			TanggalSTPD               *string `json:"tanggalstpd"`
			AngkaPersen               *string `json:"angkapersen"`
			KeteranganDihitungSendiri *string `json:"keterangandihitungSendiri"`
			IsiKeteranganLainnya      *string `json:"isiketeranganlainnya"`
			PersetujuanVerif          bool    `json:"persetujuanVerif"`
		} `json:"data"`
		Nobooking                 string  `json:"nobooking"`
		Pemilihan                 string  `json:"pemilihan"`
		NomorSTPD                 *string `json:"nomorstpd"`
		TanggalSTPD               *string `json:"tanggalstpd"`
		AngkaPersen               *string `json:"angkapersen"`
		KeteranganDihitungSendiri *string `json:"keterangandihitungSendiri"`
		IsiKeteranganLainnya      *string `json:"isiketeranganlainnya"`
		PersetujuanVerif          bool    `json:"persetujuanVerif"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)

	src := body.Data
	if src == nil {
		src = &struct {
			Nobooking                 string  `json:"nobooking"`
			Pemilihan                 string  `json:"pemilihan"`
			NomorSTPD                 *string `json:"nomorstpd"`
			TanggalSTPD               *string `json:"tanggalstpd"`
			AngkaPersen               *string `json:"angkapersen"`
			KeteranganDihitungSendiri *string `json:"keterangandihitungSendiri"`
			IsiKeteranganLainnya      *string `json:"isiketeranganlainnya"`
			PersetujuanVerif          bool    `json:"persetujuanVerif"`
		}{
			Nobooking: body.Nobooking, Pemilihan: body.Pemilihan, NomorSTPD: body.NomorSTPD, TanggalSTPD: body.TanggalSTPD,
			AngkaPersen: body.AngkaPersen, KeteranganDihitungSendiri: body.KeteranganDihitungSendiri, IsiKeteranganLainnya: body.IsiKeteranganLainnya, PersetujuanVerif: body.PersetujuanVerif,
		}
	}
	if strings.TrimSpace(src.Nobooking) == "" || strings.TrimSpace(src.Pemilihan) == "" {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking dan pemilihan wajib"})
		return
	}

	var angkaPtr *float64
	if src.AngkaPersen != nil && strings.TrimSpace(*src.AngkaPersen) != "" {
		v, err := strconv.ParseFloat(strings.TrimSpace(*src.AngkaPersen), 64)
		if err != nil {
			penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "angkapersen tidak valid"})
			return
		}
		angkaPtr = &v
	}
	err := h.repo.SaveVerificationByPemilihan(r.Context(), userid, repository.PenelitiVerificationUpdateInput{
		Nobooking: strings.TrimSpace(src.Nobooking), Pemilihan: strings.TrimSpace(src.Pemilihan), NomorSTPD: src.NomorSTPD, TanggalSTPD: src.TanggalSTPD,
		AngkaPersen: angkaPtr, KeteranganDihitungSendiri: src.KeteranganDihitungSendiri, IsiKeteranganLainnya: src.IsiKeteranganLainnya, PersetujuanVerif: src.PersetujuanVerif,
	})
	if err != nil {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Data verifikasi berhasil disimpan"})
}

// LockDocument handles POST /api/peneliti/lock-document.
func (h *PenelitiHandler) LockDocument(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak"})
		return
	}
	if err := h.requireSignature(userid, r); err != nil {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak."})
		return
	}
	var body struct {
		Nobooking string `json:"nobooking"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.Nobooking) == "" {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	u, _ := h.userRepo.GetByIdentifierForLogin(r.Context(), userid)
	nama := userid
	if u != nil && strings.TrimSpace(u.Nama) != "" {
		nama = strings.TrimSpace(u.Nama)
	}
	if err := h.repo.LockDocument(r.Context(), strings.TrimSpace(body.Nobooking), userid, nama); err != nil {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Dokumen berhasil diambil untuk diperiksa"})
}

// SendToParaf handles POST /api/peneliti_send-to-paraf.
func (h *PenelitiHandler) SendToParaf(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak"})
		return
	}
	if err := h.requireSignature(userid, r); err != nil {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak."})
		return
	}
	var body struct {
		Nobooking string `json:"nobooking"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.Nobooking) == "" {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	if err := h.repo.SendToParaf(r.Context(), userid, strings.TrimSpace(body.Nobooking)); err != nil {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Berhasil dikirim ke paraf kasie"})
}

// RejectWithReason handles POST /api/peneliti_reject-with-reason.
func (h *PenelitiHandler) RejectWithReason(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak"})
		return
	}
	if err := h.requireSignature(userid, r); err != nil {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak."})
		return
	}
	var body struct {
		Nobooking string `json:"nobooking"`
		Reason    string `json:"reason"`
		Alasan    string `json:"alasan"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	reason := strings.TrimSpace(body.Reason)
	if reason == "" {
		reason = strings.TrimSpace(body.Alasan)
	}
	if strings.TrimSpace(body.Nobooking) == "" || reason == "" {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking dan alasan wajib"})
		return
	}
	info, err := h.repo.RejectWithReason(r.Context(), strings.TrimSpace(body.Nobooking), reason)
	if err != nil {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	if info != nil && strings.TrimSpace(info.ToEmail) != "" {
		toName := info.ToName
		if strings.TrimSpace(toName) == "" {
			toName = "Pengguna"
		}
		go func(emailTo, targetName, nb, rsn string) {
			if err := mail.SendPenelitiRejectionNotification(emailTo, targetName, nb, rsn); err != nil {
				log.Printf("[PENELITI] RejectWithReason email notify failed: %v", err)
			}
		}(info.ToEmail, toName, info.Nobooking, reason)
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Data berhasil ditolak"})
}

// BerikanParafKasie handles POST /api/peneliti/berikan-paraf-kasie.
func (h *PenelitiHandler) BerikanParafKasie(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		penelitiJSON(w, http.StatusMethodNotAllowed, map[string]interface{}{"success": false, "message": "Method Not Allowed"})
		return
	}
	userid, ok := h.requirePeneliti(r)
	if !ok {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Akses ditolak"})
		return
	}
	if err := h.requireSignature(userid, r); err != nil {
		penelitiJSON(w, http.StatusForbidden, map[string]interface{}{"success": false, "message": "Anda belum mendaftarkan tanda tangan/paraf di profil. Akses ditolak."})
		return
	}
	var body struct {
		Nobooking string `json:"nobooking"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.Nobooking) == "" {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": "nobooking wajib"})
		return
	}
	if err := h.repo.BerikanParafKasie(r.Context(), userid, strings.TrimSpace(body.Nobooking)); err != nil {
		penelitiJSON(w, http.StatusBadRequest, map[string]interface{}{"success": false, "message": err.Error()})
		return
	}
	penelitiJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Paraf berhasil diberikan"})
}
