package config

import (
	"os"
	"strconv"
	"strings"
)

// MasterParity memetakan konstanta dari folder_utuh_server/conf.cfg/master_config.php
// ke variabel lingkungan Go. Password / connection string penuh TIDAK boleh dikirim ke klien.
//
// Tabel pemetaan singkat (lihat juga master_config.env.example di akar backend):
//
//	PHP define              Env Go (default jika kosong = seperti contoh PHP produksi / aman)
//	APP_TITLE               APP_TITLE
//	APP_NAME                APP_NAME
//	APP_CORP                APP_CORP
//	APP_VERSION             APP_VERSION
//	APP_YEAR                APP_YEAR
//	LICENSE_TO              LICENSE_TO
//	LICENSE_TO_SUB          LICENSE_TO_SUB
//	Asia/Jakarta            APP_TIMEZONE
//	KD_PROPINSI             KD_PROPINSI
//	KD_DATI2                KD_DATI2
//	SIPPBB_*                SIPPBB_SP_01, SIPPBB_SP_02, SIPPBB_PP_01, SIPPBB_PP_02
//	KD_KANWIL               KD_KANWIL
//	KD_KANTOR               KD_KANTOR
//	SIZE_FILE_MAX           SIZE_FILE_MAX (bytes)
//	MENU_AKSES_ID           MENU_AKSES_ID
//	DOMAIN_BOGOR            DOMAIN_BOGOR
//	DB_HOST (MSSQL)         MSSQL_HOST
//	DB_NAME                 MSSQL_DATABASE
//	DB_PORT                 MSSQL_PORT
//	DB_USER                 (hanya internal; jangan expose)
//	DB_PASS                 (hanya internal; jangan expose)
//	DB_HOST_PBB             PBB_HOST
//	DB_PORT_PBB             PBB_PORT
//	DB_NAME_PBB             PBB_DATABASE
//	SCHEMA_PBB              PBB_SCHEMA
//	MY_BASE_URL (PHP)       PHP_LEGACY_BASE_URL — untuk link Next → IIS / CodeIgniter
//	SMTP_HOST               SMTP_HOST (tanpa ssl:// prefix di public)
//	SMTP_PORT               SMTP_PORT
//	SMTP_UNAME              SMTP_DISPLAY_NAME
//	VVF_GO_API_BASE (PHP→Go) — di sisi Go: API_URL / origin publik backend
type MasterParity struct {
	AppTitle       string
	AppName        string
	AppCorp        string
	AppVersion     string
	AppYear        string
	LicenseTo      string
	LicenseToSub   string
	Timezone       string
	KDPropinsi     string
	KDDati2        string
	SippbbSp01     string
	SippbbSp02     string
	SippbbPp01     string
	SippbbPp02     string
	KDKanwil       string
	KDKantor       string
	SizeFileMax    int
	SizeFileMaxLbl string
	MenuAksesID    string
	DomainBogor    string

	// PHP legacy base URL (satu pintu modul lama / registrasi IIS).
	PhpLegacyBaseURL string

	// MSSQL produksi (BPHTB_RESTORE) — kredensial hanya dari env, tidak pernah di JSON publik.
	MSSQLHost     string
	MSSQLPort     string
	MSSQLDatabase string
	MSSQLUser     string
	MSSQLPassword string

	// Oracle PBB (NOP) — integrasi; password tidak di JSON publik.
	PBBHost     string
	PBBPort     string
	PBBDatabase string
	PBBSchema   string
	PBBUser     string
	PBBPassword string

	// SMTP — pengiriman email dari Go; password tidak di JSON publik.
	SMTPHost        string
	SMTPPort        int
	SMTPUser        string
	SMTPPassword    string
	SMTPDisplayName string
}

func envOr(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v != "" {
		return v
	}
	return fallback
}

func envInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return n
}

// LoadMasterParity membaca env; default non-rahasia mengikuti contoh master_config.php server Bogor.
func LoadMasterParity() *MasterParity {
	m := &MasterParity{
		AppTitle:       envOr("APP_TITLE", "SISTEM INFORMASI PEMERIKSAAN PAJAK BUMI DAN BANGUNAN"),
		AppName:        envOr("APP_NAME", "os_bphtb_bgr"),
		AppCorp:        envOr("APP_CORP", "SIMDADU"),
		AppVersion:     envOr("APP_VERSION", "0.1"),
		AppYear:        envOr("APP_YEAR", "2019"),
		LicenseTo:      envOr("LICENSE_TO", "PEMERINTAH KABUPATEN BOGOR"),
		LicenseToSub:   envOr("LICENSE_TO_SUB", "BADAN KEPEGAWAIAN DAN PENGEMBANGAN SDM"),
		Timezone:       envOr("APP_TIMEZONE", "Asia/Jakarta"),
		KDPropinsi:     envOr("KD_PROPINSI", "32"),
		KDDati2:        envOr("KD_DATI2", "03"),
		SippbbSp01:     envOr("SIPPBB_SP_01", "800"),
		SippbbSp02:     envOr("SIPPBB_SP_02", "BIDPP"),
		SippbbPp01:     envOr("SIPPBB_PP_01", "973"),
		SippbbPp02:     envOr("SIPPBB_PP_02", "BIDPP"),
		KDKanwil:       envOr("KD_KANWIL", "22"),
		KDKantor:       envOr("KD_KANTOR", "13"),
		SizeFileMax:    envInt("SIZE_FILE_MAX", 1000000),
		SizeFileMaxLbl: envOr("SIZE_FILE_MAX_LABEL", "1MB"),
		MenuAksesID:    envOr("MENU_AKSES_ID", "bphtb_bgr_id"),
		DomainBogor:    envOr("DOMAIN_BOGOR", "192.168.1.210"),
		PhpLegacyBaseURL: strings.TrimRight(strings.TrimSpace(envOr("PHP_LEGACY_BASE_URL", "")), "/"),

		MSSQLHost:     strings.TrimSpace(os.Getenv("MSSQL_HOST")),
		MSSQLPort:     strings.TrimSpace(os.Getenv("MSSQL_PORT")),
		MSSQLDatabase: strings.TrimSpace(os.Getenv("MSSQL_DATABASE")),
		MSSQLUser:     strings.TrimSpace(os.Getenv("MSSQL_USER")),
		MSSQLPassword: strings.TrimSpace(os.Getenv("MSSQL_PASSWORD")),

		PBBHost:     strings.TrimSpace(os.Getenv("PBB_HOST")),
		PBBPort:     strings.TrimSpace(os.Getenv("PBB_PORT")),
		PBBDatabase: strings.TrimSpace(os.Getenv("PBB_DATABASE")),
		PBBSchema:   strings.TrimSpace(os.Getenv("PBB_SCHEMA")),
		PBBUser:     strings.TrimSpace(os.Getenv("PBB_USER")),
		PBBPassword: strings.TrimSpace(os.Getenv("PBB_PASSWORD")),

		SMTPHost:        stripSMTPScheme(strings.TrimSpace(os.Getenv("SMTP_HOST"))),
		SMTPPort:        envInt("SMTP_PORT", 465),
		SMTPUser:        strings.TrimSpace(os.Getenv("SMTP_USER")),
		SMTPPassword:    strings.TrimSpace(os.Getenv("SMTP_PASS")),
		SMTPDisplayName: envOr("SMTP_UNAME", "E-BPHTB KAB BOGOR"),
	}
	if m.MSSQLPort == "" {
		m.MSSQLPort = "1433"
	}
	if m.PBBPort == "" {
		m.PBBPort = "1521"
	}
	if m.PBBSchema == "" {
		m.PBBSchema = "SIMPBB"
	}
	return m
}

func stripSMTPScheme(host string) string {
	host = strings.TrimSpace(host)
	for _, prefix := range []string{"ssl://", "tls://"} {
		if strings.HasPrefix(strings.ToLower(host), prefix) {
			return host[len(prefix):]
		}
	}
	return host
}

// ToPublicMap untuk GET /api/config — tanpa password / user DB.
func (m *MasterParity) ToPublicMap() map[string]interface{} {
	if m == nil {
		return map[string]interface{}{}
	}
	mssqlOn := m.MSSQLHost != "" && m.MSSQLDatabase != ""
	pbbOn := m.PBBHost != "" && m.PBBDatabase != ""
	smtpOn := m.SMTPHost != "" && m.SMTPUser != ""
	return map[string]interface{}{
		"appTitle":       m.AppTitle,
		"appName":        m.AppName,
		"appCorp":        m.AppCorp,
		"appVersion":     m.AppVersion,
		"appYear":        m.AppYear,
		"licenseTo":      m.LicenseTo,
		"licenseToSub":   m.LicenseToSub,
		"timezone":       m.Timezone,
		"kdPropinsi":     m.KDPropinsi,
		"kdDati2":        m.KDDati2,
		"sippbbSp01":     m.SippbbSp01,
		"sippbbSp02":     m.SippbbSp02,
		"sippbbPp01":     m.SippbbPp01,
		"sippbbPp02":     m.SippbbPp02,
		"kdKanwil":       m.KDKanwil,
		"kdKantor":       m.KDKantor,
		"sizeFileMax":    m.SizeFileMax,
		"sizeFileMaxLbl": m.SizeFileMaxLbl,
		"menuAksesId":    m.MenuAksesID,
		"domainBogor":    m.DomainBogor,
		"phpLegacyBaseUrl": m.PhpLegacyBaseURL,
		"mssqlConfigured":  mssqlOn,
		"pbbIntegrationConfigured": pbbOn,
		"smtpConfigured":           smtpOn,
		"smtpHost":                   m.SMTPHost,
		"smtpPort":                   m.SMTPPort,
		"smtpDisplayName":            m.SMTPDisplayName,
	}
}
