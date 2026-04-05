package ktpocr

import (
	_ "embed"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

//go:embed data/ktp_user_words.txt
var embeddedKtpUserWords string

// Env KTP_TESSERACT_USER_WORDS: path ke file teks (satu kata/frasa per baris), mengganti daftar bawaan.
const envTesseractUserWords = "KTP_TESSERACT_USER_WORDS"

var (
	materializedUserWordsPath string
	materializeUserWordsOnce  sync.Once
)

func resolvedTesseractUserWordsPath() string {
	if p := strings.TrimSpace(os.Getenv(envTesseractUserWords)); p != "" {
		st, err := os.Stat(p)
		if err == nil && !st.IsDir() {
			return p
		}
		log.Printf("[KTP OCR] %s tidak valid (%v), pakai daftar kata bawaan", envTesseractUserWords, err)
	}
	materializeUserWordsOnce.Do(func() {
		dir, err := os.MkdirTemp("", "ktpocr_uw_*")
		if err != nil {
			log.Printf("[KTP OCR] gagal temp user-words: %v", err)
			return
		}
		path := filepath.Join(dir, "ktp_user_words.txt")
		if err := os.WriteFile(path, []byte(strings.TrimSpace(embeddedKtpUserWords)+"\n"), 0644); err != nil {
			log.Printf("[KTP OCR] gagal tulis user-words: %v", err)
			return
		}
		materializedUserWordsPath = path
	})
	return materializedUserWordsPath
}

func tesseractUserWordsArgs() []string {
	p := resolvedTesseractUserWordsPath()
	if p == "" {
		return nil
	}
	return []string{"--user-words", p}
}
