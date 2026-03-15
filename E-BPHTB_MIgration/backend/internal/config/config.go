package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                int
	Env                 string
	APIURL              string
	DBURL               string
	LegacyNodeURL       string // Backend Node (verify-otp, resend-otp, login); proxy ke sini
	TempUploadsDir      string // Direktori temp untuk KTP upload
	ProfilePhotoDir     string // Upload foto profil (path disimpan di DB)
	ProfileSignatureDir string // Upload paraf/tanda tangan
	FAQUploadDir        string // Upload gambar untuk rich text FAQ
	BannerUploadDir    string // Upload gambar banner
	EasyOCRURL          string // URL service EasyOCR (endpoint /ocr)
	EasyOCREnabled      bool   // Aktifkan EasyOCR sebagai OCR utama
	EasyOCRTimeout      int    // Timeout request EasyOCR dalam milidetik
	PpatStorageBaseDir  string // Base path untuk dokumen PPAT (akta, sertifikat, pelengkap)
	TandaTanganBaseDir  string // Base path untuk tanda tangan per-booking (folderttdwp)
	PDFLogoPath        string // Path ke logo BAPPENDA untuk PDF SSPD (mis. ../frontend-next/asset/Logobappenda_pdf.png)
}

func Load() *Config {
	port := 3005
	if p := os.Getenv("GO_PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	if p := os.Getenv("BACKEND_GO_PORT"); p != "" {
		if v, err := strconv.Atoi(p); err == nil {
			port = v
		}
	}
	env := os.Getenv("NODE_ENV")
	if env == "" {
		env = "development"
	}
	apiURL := os.Getenv("API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:" + strconv.Itoa(port)
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/bappenda?sslmode=disable"
	}
	legacyNodeURL := os.Getenv("LEGACY_NODE_URL")
	if legacyNodeURL == "" {
		legacyNodeURL = "http://localhost:3001"
	}
	tempUploadsDir := os.Getenv("TEMP_UPLOADS_DIR")
	if tempUploadsDir == "" {
		tempUploadsDir = "./temp_uploads"
	}
	profilePhotoDir := os.Getenv("PROFILE_PHOTO_DIR")
	if profilePhotoDir == "" {
		profilePhotoDir = "./uploads/profile"
	}
	profileSignatureDir := os.Getenv("PROFILE_SIGNATURE_DIR")
	if profileSignatureDir == "" {
		profileSignatureDir = "./uploads/signature"
	}
	faqUploadDir := os.Getenv("FAQ_UPLOAD_DIR")
	if faqUploadDir == "" {
		faqUploadDir = "./uploads/faq"
	}
	bannerUploadDir := os.Getenv("BANNER_UPLOAD_DIR")
	if bannerUploadDir == "" {
		bannerUploadDir = "./uploads/banners"
	}
	easyOCRURL := os.Getenv("EASYOCR_URL")
	if easyOCRURL == "" {
		easyOCRURL = "http://localhost:8010/ocr"
	}
	easyOCREnabled := parseBoolEnv(os.Getenv("EASYOCR_ENABLED"), true)
	// Default 120s: cold start EasyOCR (model load) bisa 30–120s; setelah warmup cukup ~5–15s
	easyOCRTimeout := 120000
	if p := os.Getenv("EASYOCR_TIMEOUT_MS"); p != "" {
		if v, err := strconv.Atoi(p); err == nil && v > 0 {
			easyOCRTimeout = v
		}
	}
	ppatStorageDir := os.Getenv("PPAT_STORAGE_DIR")
	if ppatStorageDir == "" {
		ppatStorageDir = "./storage/ppat"
	}
	tandaTanganDir := os.Getenv("PPAT_TANDA_TANGAN_DIR")
	if tandaTanganDir == "" {
		tandaTanganDir = "./storage/ppat/ttd"
	}
	pdfLogoPath := os.Getenv("PDF_LOGO_PATH")
	if pdfLogoPath == "" {
		pdfLogoPath = "../frontend-next/asset/Logobappenda_pdf.png"
	}
	return &Config{
		Port:                port,
		Env:                 env,
		APIURL:              apiURL,
		DBURL:               dbURL,
		LegacyNodeURL:       legacyNodeURL,
		TempUploadsDir:      tempUploadsDir,
		ProfilePhotoDir:     profilePhotoDir,
		ProfileSignatureDir: profileSignatureDir,
		FAQUploadDir:        faqUploadDir,
		BannerUploadDir:     bannerUploadDir,
		EasyOCRURL:          easyOCRURL,
		EasyOCREnabled:      easyOCREnabled,
		EasyOCRTimeout:      easyOCRTimeout,
		PpatStorageBaseDir:  ppatStorageDir,
		TandaTanganBaseDir:  tandaTanganDir,
		PDFLogoPath:        pdfLogoPath,
	}
}

func parseBoolEnv(v string, fallback bool) bool {
	switch v {
	case "1", "true", "TRUE", "yes", "YES", "on", "ON":
		return true
	case "0", "false", "FALSE", "no", "NO", "off", "OFF":
		return false
	default:
		return fallback
	}
}
