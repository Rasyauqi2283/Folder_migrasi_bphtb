package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// KtpIndorobertaResponse is the JSON body from POST /extract-ktp (Python FastAPI).
type KtpIndorobertaResponse struct {
	NIK                        *string `json:"nik"`
	Nama                       *string `json:"nama"`
	Alamat                     *string `json:"alamat"`
	RTRW                       *string `json:"rt_rw"`
	Kecamatan                  *string `json:"kecamatan"`
	RawText                    string  `json:"raw_text"`
	ManualVerificationRequired bool    `json:"manual_verification_required"`
	Engine                     string  `json:"engine"`
}

// ExtractKtpIndoroberta mengirim gambar ke microservice Python (multipart field: file).
// baseURL contoh: http://127.0.0.1:8020 (tanpa path; /extract-ktp ditambahkan di sini).
func ExtractKtpIndoroberta(ctx context.Context, baseURL, imagePath string, timeout time.Duration) (*KtpIndorobertaResponse, error) {
	baseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
	if baseURL == "" {
		return nil, fmt.Errorf("KTP_INDOROBERTA_URL kosong")
	}
	f, err := os.Open(imagePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	part, err := mw.CreateFormFile("file", filepath.Base(imagePath))
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, f); err != nil {
		return nil, err
	}
	if err := mw.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, baseURL+"/extract-ktp", &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())

	// Batas waktu utama dari context (mis. 15s di handler); tanpa Timeout ganda pada Client.
	_ = timeout
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("extract-ktp: HTTP %d: %s", resp.StatusCode, string(body))
	}
	var out KtpIndorobertaResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return nil, err
	}
	return &out, nil
}
