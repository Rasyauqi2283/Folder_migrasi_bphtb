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
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"ebphtb/backend/internal/config"
	"ebphtb/backend/internal/handler"
	"ebphtb/backend/internal/repository"
)

// corsMiddleware menambahkan header CORS dan menangani preflight OPTIONS.
func corsMiddleware(allowedOrigins []string, next http.Handler) http.Handler {
	originSet := make(map[string]bool)
	for _, o := range allowedOrigins {
		originSet[strings.TrimSpace(o)] = true
	}
	if len(originSet) == 0 {
		originSet["http://localhost:3000"] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if originSet[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		} else if len(originSet) == 1 {
			for o := range originSet {
				w.Header().Set("Access-Control-Allow-Origin", o)
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
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
	usersHandler := handler.NewUsersHandler(userRepo)
	// Path spesifik pakai method eksplisit agar tidak konflik dengan pola /api/users/{userid} (Go 1.22+ ServeMux).
	mux.HandleFunc("GET /api/users/pending", usersHandler.GetPending)
	mux.HandleFunc("GET /api/users/complete", usersHandler.GetComplete)
	mux.HandleFunc("POST /api/users/generate-userid", usersHandler.GenerateUserID)
	mux.HandleFunc("POST /api/users/assign-userid-and-divisi", usersHandler.AssignUserIDAndDivisi)
	mux.HandleFunc("PUT /api/users/{userid}", usersHandler.PutUser)
	mux.HandleFunc("DELETE /api/users/{userid}", usersHandler.DeleteUser)
	mux.HandleFunc("PUT /api/users/{userid}/status-ppat", usersHandler.PutStatusPpat)

	// KTP Preview — handler Go (return JSON ekstraksi OCR, bukan gambar)
	mux.HandleFunc("GET /api/admin/ktp-preview/{id}", usersHandler.KTPPreview)

	// Proxy /api/admin/* ke Node (sisa endpoint admin yang belum dimigrasi)
	mux.Handle("/api/admin/", handler.AdminProxyHandler(cfg.LegacyNodeURL))

	// Auth handlers — semua di Go (migrasi 100%, tidak proxy ke Node)
	mux.HandleFunc("/api/v1/auth/upload-ktp", authHandler.UploadKTP)
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

	// GET /health — health check (mirror Node); termasuk status koneksi DB
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
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
	})

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

	addr := ":" + strconv.Itoa(cfg.Port)

	// CORS: izinkan origin frontend (default localhost:3000)
	corsOrigins := []string{"http://localhost:3000"}
	if s := os.Getenv("CORS_ORIGINS"); s != "" {
		corsOrigins = strings.Split(s, ",")
	}
	h := corsMiddleware(corsOrigins, mux)

	server := &http.Server{Addr: addr, Handler: h}

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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown: %v", err)
	}
}





