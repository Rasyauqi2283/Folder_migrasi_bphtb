package ktpocr

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type easyOCRResponse struct {
	Success    bool     `json:"success"`
	RawText    string   `json:"raw_text"`
	Lines      []string `json:"lines"`
	DurationMS int64    `json:"duration_ms"`
}

func callEasyOCR(imagePath string, endpoint string, timeout time.Duration) (string, []string, error) {
	f, err := os.Open(imagePath)
	if err != nil {
		return "", nil, err
	}
	defer f.Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("image", filepath.Base(imagePath))
	if err != nil {
		return "", nil, err
	}
	if _, err = io.Copy(part, f); err != nil {
		return "", nil, err
	}
	if err = writer.Close(); err != nil {
		return "", nil, err
	}

	if timeout <= 0 {
		timeout = 60 * time.Second
	}
	req, err := http.NewRequest(http.MethodPost, endpoint, &body)
	if err != nil {
		return "", nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: timeout}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", nil, fmt.Errorf("easyocr status=%d body=%s", resp.StatusCode, string(respBytes))
	}

	var payload easyOCRResponse
	if err := json.Unmarshal(respBytes, &payload); err != nil {
		return "", nil, err
	}
	if !payload.Success {
		return "", nil, fmt.Errorf("easyocr success=false")
	}
	return payload.RawText, payload.Lines, nil
}
