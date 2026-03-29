// Backend Go — auth (login, register, verify-otp, resend-otp, upload-ktp, real-ktp-verification).
// Migrasi 100%: tidak proxy ke Node.
// CORS diaktifkan agar frontend (Next.js) di origin lain bisa memanggil API.
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/handler"
	"ebphtb/backend/internal/payment"
	"ebphtb/backend/internal/repository"
	"ebphtb/backend/internal/worker"
)

// corsMiddleware menambahkan header CORS dan menangani preflight OPTIONS.
func corsMiddleware(allowedOrigins []string, next http.Handler) http.Handler {
	// Support:
	// - exact origin match: "https://bphtbbappenda.vercel.app"
	// - wildcard any origin: "*"
	// - suffix match: "*.vercel.app" (matches https://foo.vercel.app)
	type originRule struct {
		exact  string
		suffix string
		any    bool
	}
	var rules []originRule
	for _, raw := range allowedOrigins {
		o := strings.TrimSpace(raw)
		if o == "" {
			continue
		}
		if o == "*" {
			rules = append(rules, originRule{any: true})
			continue
		}
		if strings.HasPrefix(o, "*.") {
			rules = append(rules, originRule{suffix: strings.TrimPrefix(o, "*.")})
			continue
		}
		rules = append(rules, originRule{exact: o})
	}
	if len(rules) == 0 {
		rules = []originRule{{exact: "http://localhost:3000"}}
	}

	isAllowed := func(origin string) bool {
		if origin == "" {
			return false
		}
		for _, r := range rules {
			if r.any {
				return true
			}
			if r.exact != "" && origin == r.exact {
				return true
			}
			if r.suffix != "" {
				// Match both "https://foo.bar" and "http://foo.bar" by checking host suffix.
				// We deliberately avoid full URL parsing to keep this lightweight and tolerant.
				if strings.Contains(origin, "://") {
					// origin format per spec: scheme://host[:port]
					parts := strings.SplitN(origin, "://", 2)
					if len(parts) == 2 {
						hostPort := parts[1]
						host := strings.SplitN(hostPort, ":", 2)[0]
						if host == r.suffix || strings.HasSuffix(host, "."+r.suffix) {
							return true
						}
					}
				}
			}
		}
		return false
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		// Some requests legitimately omit Origin (same-origin navigations, server-to-server, health checks).
		// Do not treat empty Origin as a blocked CORS attempt.
		if strings.TrimSpace(origin) != "" {
			allowed := isAllowed(origin)
			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				log.Printf("Blocked CORS origin: %s", origin)
			}
			log.Printf("CORS Origin: %s | Allowed: %v", origin, allowed)
		}
		// Ensure caches/proxies don't mix responses across origins.
		w.Header().Add("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		// Allow common custom headers used by clients/proxies.
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-User-Id, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// cleanupOldKTPTempFiles menghapus file JSON hasil ekstraksi KTP di temp_uploads yang lebih lama dari maxAge.
func cleanupOldKTPTempFiles(dir string, maxAge time.Duration) {
	if dir == "" {
		return
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return
	}
	cutoff := time.Now().Add(-maxAge)
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		path := filepath.Join(dir, e.Name())
		info, err := e.Info()
		if err != nil {
			continue
		}
		if info.ModTime().Before(cutoff) {
			if err := os.Remove(path); err != nil {
				log.Printf("[STARTUP] cleanup old KTP temp %s: %v", path, err)
			}
		}
	}
}

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	// Bersihkan file JSON KTP temp yang tertinggal
	cleanupOldKTPTempFiles(cfg.TempUploadsDir, time.Hour)
	mux := http.NewServeMux()

	var pool *pgxpool.Pool
	if cfg.DBURL != "" {
		p, err := pgxpool.New(context.Background(), cfg.DBURL)
		if err != nil {
			log.Printf("[DB] WARNING: failed to connect: %v (register will fail)", err)
		} else {
			pool = p
			defer pool.Close()
		}
	}
	authHandler := handler.NewAuthHandler(cfg, pool)

	// /api/users/* — handler Go 100% (tanpa proxy Node)
	// Migrasi bertahap: users API sepenuhnya di Go.
	var userRepo *repository.UserRepo
	if pool != nil {
		userRepo = repository.NewUserRepo(pool)
	} else {
		userRepo = repository.NewUserRepo(nil)
	}
	usersHandler := handler.NewUsersHandler(userRepo, cfg.TempUploadsDir)
	// Path spesifik pakai method eksplisit agar tidak konflik dengan pola /api/users/{userid} (Go 1.22+ ServeMux).
	mux.HandleFunc("GET /api/users/pending", usersHandler.GetPending)
	mux.HandleFunc("GET /api/users/complete", usersHandler.GetComplete)
	mux.HandleFunc("POST /api/users/generate-userid", usersHandler.GenerateUserID)
	mux.HandleFunc("POST /api/users/assign-userid-and-divisi", usersHandler.AssignUserIDAndDivisi)
	mux.HandleFunc("POST /api/users/wp-badan/{id}/approve", usersHandler.ApproveWPBadan)
	mux.HandleFunc("POST /api/users/wp-badan/{id}/reject", usersHandler.RejectWPBadan)
	mux.HandleFunc("PUT /api/users/{userid}", usersHandler.PutUser)
	mux.HandleFunc("DELETE /api/users/{userid}", usersHandler.DeleteUser)
	mux.HandleFunc("PUT /api/users/{userid}/status-ppat", usersHandler.PutStatusPpat)

	userLookupHandler := handler.NewUserLookupHandler(userRepo)
	mux.HandleFunc("GET /api/user/lookup", userLookupHandler.Lookup)

	var systemStatusRepo *repository.SystemStatusRepo
	if pool != nil {
		systemStatusRepo = repository.NewSystemStatusRepo(pool)
	} else {
		systemStatusRepo = repository.NewSystemStatusRepo(nil)
	}
	systemStatusHandler := handler.NewSystemStatusHandler(systemStatusRepo)
	mux.HandleFunc("GET /api/system/status", systemStatusHandler.GetSystemStatus)
	adminSystemStatus := handler.NewAdminSystemStatusHandler(userRepo, systemStatusRepo)
	mux.HandleFunc("PUT /api/admin/system/maintenance-mode", adminSystemStatus.PutMaintenanceMode)

	var quotaRepo *repository.QuotaRepo
	if pool != nil {
		quotaRepo = repository.NewQuotaRepo(pool)
	} else {
		quotaRepo = repository.NewQuotaRepo(nil)
	}
	quotaHandler := handler.NewQuotaHandler(quotaRepo)
	mux.HandleFunc("GET /api/admin/quota-today", quotaHandler.GetAdminQuotaToday)
	mux.HandleFunc("GET /api/peneliti/quota-today", quotaHandler.GetPenelitiQuotaToday)

	var csTicketRepo *repository.CsTicketRepo
	if pool != nil {
		csTicketRepo = repository.NewCsTicketRepo(pool)
	} else {
		csTicketRepo = repository.NewCsTicketRepo(nil)
	}
	csTemplateRepo := repository.NewCsTemplateRepo(pool)
	supportHandler := handler.NewSupportHandler(csTicketRepo, csTemplateRepo, userRepo)
	mux.HandleFunc("POST /api/public/support/tickets", supportHandler.CreatePublicTicket)
	mux.HandleFunc("GET /api/cs/support/tickets/unread-count", supportHandler.UnreadCountCS)
	mux.HandleFunc("GET /api/cs/support/tickets/{ticket_id}", supportHandler.GetTicketCS)
	mux.HandleFunc("POST /api/cs/support/tickets/{ticket_id}/reply", supportHandler.ReplyTicketCS)
	mux.HandleFunc("GET /api/cs/support/tickets", supportHandler.ListTicketsCS)
	mux.HandleFunc("GET /api/cs/templates", supportHandler.ListTemplatesCS)
	mux.HandleFunc("POST /api/cs/templates", supportHandler.CreateTemplateCS)
	mux.HandleFunc("DELETE /api/cs/templates/{id}", supportHandler.DeleteTemplateCS)

	// KTP Preview — handler Go (return JSON ekstraksi OCR, bukan gambar)
	mux.HandleFunc("GET /api/admin/ktp-preview/{id}", usersHandler.KTPPreview)

	// Admin notification-warehouse & pemutakhiran — handler Go (sebelum proxy agar route spesifik didahulukan)
	var bookingRepo *repository.BookingRepo
	if pool != nil {
		bookingRepo = repository.NewBookingRepo(pool)
	} else {
		bookingRepo = repository.NewBookingRepo(nil)
	}
	adminNW := handler.NewAdminNotificationWarehouseHandler(userRepo, bookingRepo)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-users", adminNW.GetPpatUsers)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-users-stats", adminNW.GetPpatUsersStats)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-users/{userid}", adminNW.GetPpatUserByID)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-chart-data", adminNW.GetPpatChartData)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-renewal", adminNW.GetPpatRenewal)
	// Missing legacy endpoints that caused production 502/500
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-ltb", adminNW.GetPpatLtb)
	mux.HandleFunc("GET /api/admin/notification-warehouse/ppat-ltb/{bookingId}", adminNW.GetPpatLtbDetail)
	mux.HandleFunc("GET /api/admin/notification-warehouse/peneliti-lsb", adminNW.GetPenelitiLsb)
	mux.HandleFunc("GET /api/admin/notification-warehouse/lsb-ppat", adminNW.GetLsbPpat)
	mux.HandleFunc("GET /api/admin/notification-warehouse/stats", adminNW.GetStats)
	mux.HandleFunc("POST /api/admin/notification-warehouse/send-ping", adminNW.SendPing)
	mux.HandleFunc("GET /api/admin/notification-warehouse/poll-ping", adminNW.PollPing)
	mux.HandleFunc("GET /api/admin/ppat/user/{userid}/diserahkan", adminNW.GetDiserahkan)

	// Admin validasi QR — handler Go
	var validationRepo *repository.ValidationRepo
	if pool != nil {
		validationRepo = repository.NewValidationRepo(pool)
	} else {
		validationRepo = repository.NewValidationRepo(nil)
	}
	adminValidasi := handler.NewAdminValidasiHandler(userRepo, validationRepo)
	mux.HandleFunc("GET /api/admin/validate-qr/{no_validasi}", adminValidasi.GetValidateQR)
	mux.HandleFunc("GET /api/admin/validate-qr-search", adminValidasi.GetValidateQRSearch)
	mux.HandleFunc("GET /api/admin/validation-statistics", adminValidasi.GetValidationStatistics)

	// FAQ — public list + admin CRUD + upload image for rich text
	var faqRepo *repository.FAQRepo
	if pool != nil {
		faqRepo = repository.NewFAQRepo(pool)
	} else {
		faqRepo = repository.NewFAQRepo(nil)
	}
	faqHandler := handler.NewFAQHandler(cfg, userRepo, faqRepo)
	mux.HandleFunc("GET /api/faq", faqHandler.GetList)
	mux.HandleFunc("POST /api/faq", faqHandler.Create)
	mux.HandleFunc("PUT /api/faq/{id}", faqHandler.Update)
	mux.HandleFunc("DELETE /api/faq/{id}", faqHandler.Delete)
	mux.HandleFunc("POST /api/faq/upload", faqHandler.Upload)

	// Banners — public active list; admin CRUD
	var bannerRepo *repository.BannerRepo
	if pool != nil {
		bannerRepo = repository.NewBannerRepo(pool)
	} else {
		bannerRepo = repository.NewBannerRepo(nil)
	}
	bannerHandler := handler.NewBannerHandler(cfg, userRepo, bannerRepo)
	mux.HandleFunc("GET /api/banners", bannerHandler.GetActive)
	mux.HandleFunc("GET /api/admin/banners", bannerHandler.GetListAdmin)
	mux.HandleFunc("POST /api/admin/banners", bannerHandler.CreateAdmin)
	mux.HandleFunc("PUT /api/admin/banners/{id}", bannerHandler.UpdateAdmin)
	mux.HandleFunc("DELETE /api/admin/banners/{id}", bannerHandler.DeleteAdmin)

	// Serve uploaded files (FAQ rich text images, banner images)
	mux.HandleFunc("GET /api/uploads/faq/{filename}", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeUploadDir(cfg.FAQUploadDir, r.PathValue("filename"))(w, r)
	})
	mux.HandleFunc("GET /api/uploads/banners/{filename}", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeUploadDir(cfg.BannerUploadDir, r.PathValue("filename"))(w, r)
	})
	// Serve WP Badan docs (NIB PDF) from TEMP_UPLOADS_DIR/nib_docs
	mux.HandleFunc("GET /api/uploads/nib/{filename}", func(w http.ResponseWriter, r *http.Request) {
		handler.ServeUploadDir(filepath.Join(cfg.TempUploadsDir, "nib_docs"), r.PathValue("filename"))(w, r)
	})

	// PPAT — handler Go (load-all-booking, rekap/diserahkan, send-now, create-booking, generate-pdf); didahulukan dari proxy
	var ppatRepo *repository.PpatRepo
	if pool != nil {
		ppatRepo = repository.NewPpatRepo(pool)
	} else {
		ppatRepo = repository.NewPpatRepo(nil)
	}
	var laporanRepo *repository.PpatLaporanRepo
	if pool != nil {
		laporanRepo = repository.NewPpatLaporanRepo(pool)
	} else {
		laporanRepo = repository.NewPpatLaporanRepo(nil)
	}

	// CS support tickets (public landing + CS dashboard)
	if pool != nil {
		_, err := pool.Exec(context.Background(), `
			CREATE TABLE IF NOT EXISTS cs_tickets (
				id              bigserial PRIMARY KEY,
				ticket_id       varchar(32) NOT NULL UNIQUE,
				submitter_name  varchar(255) NOT NULL,
				user_email      varchar(255) NOT NULL,
				subject         text NOT NULL,
				message         text NOT NULL,
				status          varchar(32) NOT NULL DEFAULT 'open',
				unread_by_cs    boolean NOT NULL DEFAULT true,
				created_at      timestamptz NOT NULL DEFAULT now(),
				updated_at      timestamptz NOT NULL DEFAULT now()
			);
			CREATE INDEX IF NOT EXISTS idx_cs_tickets_created ON cs_tickets (created_at DESC);
			CREATE INDEX IF NOT EXISTS idx_cs_tickets_unread ON cs_tickets (unread_by_cs) WHERE unread_by_cs = true;
			CREATE TABLE IF NOT EXISTS cs_ticket_replies (
				id              bigserial PRIMARY KEY,
				ticket_id       varchar(32) NOT NULL REFERENCES cs_tickets(ticket_id) ON DELETE CASCADE,
				body            text NOT NULL,
				author_type     varchar(16) NOT NULL DEFAULT 'cs',
				created_by_userid varchar(100),
				created_at      timestamptz NOT NULL DEFAULT now()
			);
			CREATE INDEX IF NOT EXISTS idx_cs_ticket_replies_ticket ON cs_ticket_replies (ticket_id, created_at);
		`)
		if err != nil {
			log.Printf("[BOOT] ensure cs_tickets: %v", err)
		}
	}

	// Ensure WP sign request table exists (idempotent)
	if pool != nil {
		_, err := pool.Exec(context.Background(), `
			CREATE TABLE IF NOT EXISTS wp_sign_requests (
				id bigserial PRIMARY KEY,
				nobooking varchar(255) NOT NULL,
				wp_userid varchar(100) NOT NULL,
				wp_email text,
				pu_userid varchar(100) NOT NULL,
				status varchar(20) NOT NULL DEFAULT 'pending',
				created_at timestamptz NOT NULL DEFAULT now(),
				updated_at timestamptz NOT NULL DEFAULT now(),
				UNIQUE (nobooking, wp_userid)
			);
			CREATE INDEX IF NOT EXISTS idx_wp_sign_requests_wp_userid ON wp_sign_requests (wp_userid);
			CREATE INDEX IF NOT EXISTS idx_wp_sign_requests_status ON wp_sign_requests (status);
		`)
		if err != nil {
			log.Printf("[BOOT] ensure wp_sign_requests: %v", err)
		}
	}

	// Gateway + SSPD lunas columns (idempotent; mirror database/migrations/022_bank_gateway_sspd_lunas.sql)
	if pool != nil {
		_, err := pool.Exec(context.Background(), `
			ALTER TABLE public.pat_1_bookingsspd
				ADD COLUMN IF NOT EXISTS sspd_pembayaran_status character varying(40) DEFAULT 'BELUM_LUNAS';
			COMMENT ON COLUMN public.pat_1_bookingsspd.sspd_pembayaran_status IS 'BELUM_LUNAS | LUNAS — diisi otomatis saat gateway PAID';
			ALTER TABLE public.pat_1_bookingsspd
				ADD COLUMN IF NOT EXISTS billing_id character varying(64),
				ADD COLUMN IF NOT EXISTS billing_expires_at timestamp with time zone,
				ADD COLUMN IF NOT EXISTS payment_amount_requested bigint,
				ADD COLUMN IF NOT EXISTS payment_amount_paid bigint,
				ADD COLUMN IF NOT EXISTS payment_status character varying(40) DEFAULT 'WAITING_FOR_PAYMENT';
			COMMENT ON COLUMN public.pat_1_bookingsspd.payment_status IS 'WAITING_FOR_PAYMENT | PAID | KURANG_BAYAR';
			ALTER TABLE public.bank_1_cek_hasil_transaksi
				ADD COLUMN IF NOT EXISTS gateway_nominal_received bigint,
				ADD COLUMN IF NOT EXISTS gateway_status character varying(32),
				ADD COLUMN IF NOT EXISTS gateway_reference character varying(255),
				ADD COLUMN IF NOT EXISTS gateway_paid_at timestamp with time zone,
				ADD COLUMN IF NOT EXISTS gateway_channel character varying(64);
		`)
		if err != nil {
			log.Printf("[BOOT] ensure gateway/bank columns: %v", err)
		}
	}

	ppatHandler := handler.NewPpatHandler(cfg, ppatRepo, bookingRepo, userRepo, laporanRepo)
	mux.HandleFunc("GET /api/ppat_generate-pdf-badan/{nobooking}", ppatHandler.GeneratePdfBadan)
	mux.HandleFunc("GET /api/ppat/generate-pdf-mohon-validasi/{nobooking}", ppatHandler.GeneratePdfMohonValidasi)
	mux.HandleFunc("GET /api/check-my-signature", ppatHandler.CheckMySignature)
	mux.HandleFunc("GET /api/ppat/load-all-booking", ppatHandler.LoadAllBooking)
	mux.HandleFunc("GET /api/ppat/rekap/diserahkan", ppatHandler.RekapDiserahkan)
	mux.HandleFunc("POST /api/ppat/send-now", ppatHandler.SendNow)
	mux.HandleFunc("POST /api/ppat/create-permohonan-validasi", ppatHandler.CreatePermohonanValidasi)
	mux.HandleFunc("PUT /api/ppat/update-booking/{nobooking}", ppatHandler.UpdateBookingBadan)
	mux.HandleFunc("PATCH /api/ppat/update-booking/{nobooking}", ppatHandler.UpdateBookingBadan)
	mux.HandleFunc("POST /api/ppat_create-booking-and-bphtb", ppatHandler.CreateBookingBadan)
	mux.HandleFunc("POST /api/ppat_create-booking-and-bphtb-perorangan", ppatHandler.CreateBookingPerorangan)
	mux.HandleFunc("GET /api/ppat/booking/history", ppatHandler.BookingHistoryBadan)
	mux.HandleFunc("GET /api/ppat/booking/{nobooking}/callback", ppatHandler.GetBookingCallbackBadan)
	mux.HandleFunc("GET /api/ppat/pbb/lookup-nop", ppatHandler.LookupNopPBB)
	mux.HandleFunc("GET /api/ppat/booking/{nobooking}", ppatHandler.GetBooking)
	mux.HandleFunc("PUT /api/ppat/update-trackstatus/{nobooking}", ppatHandler.UpdateTrackstatus)
	mux.HandleFunc("DELETE /api/ppat/booking/{nobooking}", ppatHandler.DeleteBooking)
	mux.HandleFunc("GET /api/ppat/quota", ppatHandler.GetQuota)
	mux.HandleFunc("GET /api/ppat/get-documents", ppatHandler.GetDocuments)
	mux.HandleFunc("GET /api/ppat/file-proxy", ppatHandler.FileProxy)
	mux.HandleFunc("POST /api/ppat/schedule-send", ppatHandler.ScheduleSend)
	mux.HandleFunc("POST /api/ppat/upload-signatures", ppatHandler.UploadSignatures)
	mux.HandleFunc("POST /api/ppat/upload-documents", ppatHandler.UploadDocuments)
	mux.HandleFunc("GET /api/ppat/corrections/pending", ppatHandler.ListPendingCorrections)
	mux.HandleFunc("POST /api/ppat/corrections/{nobooking}/upload-proof", ppatHandler.UploadCorrectionProof)
	mux.HandleFunc("POST /api/ppat/corrections/{nobooking}/resubmit", ppatHandler.ResubmitCorrection)
	mux.HandleFunc("GET /api/ppat/monitoring-keterlambatan", ppatHandler.MonitoringKeterlambatan)
	mux.HandleFunc("POST /api/ppat/laporan-bulanan/submit", ppatHandler.SubmitLaporanBulanan)
	mux.HandleFunc("POST /api/ppat/monitoring-keterlambatan/unblock", ppatHandler.PostMonitoringUnblock)
	mux.HandleFunc("POST /api/ppat/monitoring-keterlambatan/notify", ppatHandler.PostMonitoringNotify)
	mux.HandleFunc("POST /api/ppat/request-billing", ppatHandler.RequestBilling)
	mux.HandleFunc("GET /api/ppat/billing/pending", ppatHandler.PendingBillingSummary)

	// WP — Libatkan WP flow (validate, invite, list, approve)
	wpSign := handler.NewWpSignHandler(userRepo, ppatRepo)
	mux.HandleFunc("POST /api/wp/validate", wpSign.ValidateWP)
	mux.HandleFunc("POST /api/wp/invite-sign", wpSign.InviteSign)
	mux.HandleFunc("GET /api/wp/sign-requests", wpSign.ListSignRequests)
	mux.HandleFunc("POST /api/wp/sign-requests/{id}/approve", wpSign.ApproveSignRequest)

	// PPAT/PU: seluruh layanan di atas dilayani Go. Tidak ada proxy ke Node untuk /api/ppat/* maupun /api/ppat_*.

	// Bank, LTB, Peneliti, LSB, Paraf (Peneliti Validasi) — handler Go (sama seperti Admin, PU)
	var bankRepo *repository.BankRepo
	var ltbRepo *repository.LtbRepo
	var penelitiRepo *repository.PenelitiRepo
	var lsbRepo *repository.LSBRepo
	var parafRepo *repository.ParafRepo
	if pool != nil {
		bankRepo = repository.NewBankRepo(pool)
		penelitiRepo = repository.NewPenelitiRepo(pool)
		ltbRepo = repository.NewLtbRepo(pool, penelitiRepo)
		lsbRepo = repository.NewLSBRepo(pool)
		parafRepo = repository.NewParafRepo(pool)
	} else {
		bankRepo = repository.NewBankRepo(nil)
		penelitiRepo = repository.NewPenelitiRepo(nil)
		ltbRepo = repository.NewLtbRepo(nil, nil)
		lsbRepo = repository.NewLSBRepo(nil)
		parafRepo = repository.NewParafRepo(nil)
	}
	bankHandler := handler.NewBankHandler(bankRepo, userRepo)
	mux.HandleFunc("GET /api/bank/transaksi", bankHandler.ListTransaksi)
	mux.HandleFunc("GET /api/bank/transaksi/{nobooking}/detail", bankHandler.GetTransaksiDetail)

	paymentWebhookHandler := handler.NewPaymentGatewayWebhookHandler(cfg, bankRepo)
	mux.HandleFunc("POST /api/webhooks/payment-gateway", paymentWebhookHandler.Handle)

	// (Mock) Bank BJB Billing client is constructed in handler when needed.
	_ = payment.MockBJBClient{}

	ltbHandler := handler.NewLtbHandler(ltbRepo, userRepo, ppatRepo)
	mux.HandleFunc("GET /api/ltb/terima-berkas-sspd", ltbHandler.ListTerimaBerkas)
	mux.HandleFunc("GET /api/ltb/terima-berkas-sspd/{nobooking}/documents", ltbHandler.GetDocuments)
	mux.HandleFunc("POST /api/ltb/terima-berkas-sspd/{nobooking}/reject", ltbHandler.Reject)
	mux.HandleFunc("POST /api/ltb/terima-berkas-sspd/{nobooking}/send", ltbHandler.SendToVerifikasi)
	mux.HandleFunc("GET /api/ltb/offline/drafts/{nobooking}", ltbHandler.GetOfflineDraft)
	mux.HandleFunc("GET /api/ltb/offline/drafts", ltbHandler.ListOfflineDrafts)
	mux.HandleFunc("POST /api/ltb/offline/booking/{nobooking}/generate-registrasi", ltbHandler.GenerateOfflineRegistration)
	mux.HandleFunc("PUT /api/ltb/offline/booking/{nobooking}", ltbHandler.UpdateOfflineBooking)
	mux.HandleFunc("POST /api/ltb/offline/booking", ltbHandler.CreateOfflineBooking)

	penelitiHandler := handler.NewPenelitiHandler(penelitiRepo, userRepo)
	mux.HandleFunc("GET /api/peneliti_get-berkas-fromltb", penelitiHandler.GetBerkasFromLtb)
	mux.HandleFunc("POST /api/peneliti/claim-assignment", penelitiHandler.ClaimUnassigned)
	mux.HandleFunc("POST /api/peneliti/update-booking-fields", penelitiHandler.UpdateBookingFields)
	mux.HandleFunc("GET /api/peneliti/get-berkas-till-verif", penelitiHandler.GetBerkasTillVerif)
	mux.HandleFunc("POST /api/peneliti_update-berdasarkan-pemilihan", penelitiHandler.UpdateBerdasarkanPemilihan)
	mux.HandleFunc("POST /api/peneliti/lock-document", penelitiHandler.LockDocument)
	mux.HandleFunc("POST /api/peneliti_send-to-paraf", penelitiHandler.SendToParaf)
	mux.HandleFunc("POST /api/peneliti_reject-with-reason", penelitiHandler.RejectWithReason)
	mux.HandleFunc("POST /api/peneliti/berikan-paraf-kasie", penelitiHandler.BerikanParafKasie)

	lsbHandler := handler.NewLSBHandler(lsbRepo, userRepo)
	mux.HandleFunc("GET /api/LSB_berkas-complete", lsbHandler.BerkasComplete)
	mux.HandleFunc("GET /api/LSB_monitoring-penyerahan", lsbHandler.MonitoringPenyerahan)

	parafHandler := handler.NewParafHandler(parafRepo, userRepo)
	mux.HandleFunc("GET /api/paraf/get-berkas-pending", parafHandler.GetBerkasPending)
	mux.HandleFunc("GET /api/paraf/get-monitoring-documents", parafHandler.GetMonitoringDocuments)

	// Proxy /api/admin/* ke Node dimatikan.
	// Alasan: sebagian besar endpoint /api/admin/* sudah punya handler Go (lihat registrasi di atas),
	// dan proxy ini berisiko membuat route admin yang seharusnya dilayani Go menjadi nyasar ke legacy Node di production.
	// Jika nanti ada endpoint /api/admin/* yang belum dimigrasi, kita akan tambah handler Go-nya satu per satu.
	// mux.Handle("/api/admin/", handler.AdminProxyHandler(cfg.LegacyNodeURL))

	// Auth handlers — semua di Go (migrasi 100%, tidak proxy ke Node)
	mux.HandleFunc("/api/v1/auth/upload-ktp", authHandler.UploadKTP)
	mux.HandleFunc("/api/v1/auth/upload-nib-doc", authHandler.UploadNIBDoc)
	mux.HandleFunc("/api/v1/auth/real-ktp-verification", authHandler.RealKTPVerification)
	mux.HandleFunc("/api/v1/auth/register", authHandler.Register)
	mux.HandleFunc("/api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("/api/v1/auth/request-otp", authHandler.RequestOTP)
	mux.HandleFunc("/api/v1/auth/verify-otp-finalize", authHandler.VerifyOTPFinalize)
	mux.HandleFunc("/api/v1/auth/verify-otp", authHandler.VerifyOTP)
	mux.HandleFunc("/api/v1/auth/resend-otp", authHandler.ResendOTP)
	mux.HandleFunc("POST /api/v1/auth/reset-password-request", authHandler.ResetPasswordRequest)
	mux.HandleFunc("POST /api/v1/auth/verify-reset-otp", authHandler.VerifyResetOTP)
	mux.HandleFunc("POST /api/v1/auth/verify-reset-token", authHandler.VerifyResetToken)
	mux.HandleFunc("POST /api/v1/auth/reset-password", authHandler.ResetPassword)

	// Profile (GET profile, upload foto, ubah password, paraf, lengkapi profil)
	mux.HandleFunc("GET /api/v1/auth/profile", authHandler.GetProfile)
	mux.HandleFunc("PUT /api/v1/auth/profile", authHandler.UpdateProfile)
	mux.HandleFunc("POST /api/v1/auth/profile/upload", authHandler.UploadProfilePhoto)
	mux.HandleFunc("POST /api/v1/auth/update-password", authHandler.UpdatePassword)
	mux.HandleFunc("POST /api/v1/auth/update-profile-paraf", authHandler.UpdateProfileParaf)
	mux.HandleFunc("POST /api/v1/auth/complete-profile", authHandler.CompleteProfile)
	mux.HandleFunc("GET /api/profile-photo/{userid}", authHandler.ServeProfilePhoto)
	mux.HandleFunc("GET /api/profile-signature/{userid}", authHandler.ServeProfileSignature)
	mux.HandleFunc("POST /api/v1/auth/logout", authHandler.Logout)

	// GET /health dan GET /api/health — health check (Koyeb/frontend bisa pakai salah satu)
	healthHandler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		payload := map[string]interface{}{
			"status":      "healthy",
			"environment": cfg.Env,
			"service":     "ebphtb-backend-go",
		}
		if pool != nil {
			ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
			err := pool.Ping(ctx)
			cancel()
			if err != nil {
				payload["database"] = "disconnected"
				payload["database_error"] = err.Error()
			} else {
				payload["database"] = "connected"
			}
		} else {
			payload["database"] = "not_configured"
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(payload)
	}
	mux.HandleFunc("/health", healthHandler)
	mux.HandleFunc("/api/health", healthHandler)

	// GET /api/config — config untuk frontend (mirror Node)
	mux.HandleFunc("/api/config", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"apiUrl":      cfg.APIURL,
			"environment": cfg.Env,
		})
	})

	// Legacy API proxy: forward any unmatched /api/* ke Node (pv/cert, validasi/claim, dll). Bank, Peneliti, LSB, Paraf sudah dilayani Go di atas.
	// mux.Handle("/api/", handler.LegacyAPIProxyHandler(cfg.LegacyNodeURL))

	addr := ":" + strconv.Itoa(cfg.Port)

	// CORS: izinkan origin frontend. Production (Koyeb) wajib set CORS_ORIGINS ke domain Vercel.
	corsOrigins := []string{"http://localhost:3000", "https://bphtbbappenda.vercel.app"}
	if s := os.Getenv("CORS_ORIGINS"); s != "" {
		parts := strings.Split(s, ",")
		corsOrigins = nil
		for _, p := range parts {
			o := strings.TrimSpace(p)
			if o != "" {
				corsOrigins = append(corsOrigins, o)
			}
		}
		if len(corsOrigins) == 0 {
			corsOrigins = []string{"http://localhost:3000", "https://bphtbbappenda.vercel.app"}
		}
	}
	log.Printf("CORS allowed origins: %v", corsOrigins)
	// CORS must be outermost so OPTIONS preflight isn't blocked by the gate.
	gated := handler.SystemGateMiddleware(systemStatusRepo, mux)
	var inFlight atomic.Int64
	tracked := handler.InFlightMiddleware(&inFlight, gated)
	logged := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Incoming: %s %s", r.Method, r.URL.Path)
		tracked.ServeHTTP(w, r)
	})
	h := corsMiddleware(corsOrigins, logged)
	server := &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadTimeout:       15 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	worker.StartPpatLaporanSuspendJob(pool, laporanRepo)

	go func() {
		log.Printf("Backend Go listening on %s (migrasi penuh, tidak ada proxy Node)", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give the server time to drain in-flight requests.
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	log.Printf("In-flight requests before shutdown: %d", inFlight.Load())
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown: %v", err)
	}

	// Best-effort wait for handlers to return (Shutdown should already wait,
	// but this improves observability and catches custom long-running handlers).
	drainDeadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(drainDeadline) {
		n := inFlight.Load()
		if n <= 0 {
			break
		}
		time.Sleep(100 * time.Millisecond)
	}
	log.Printf("In-flight requests after shutdown: %d", inFlight.Load())
}
