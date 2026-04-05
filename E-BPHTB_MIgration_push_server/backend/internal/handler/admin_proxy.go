package handler

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// AdminProxyHandler returns a reverse proxy that forwards /api/admin/* to legacy Node backend.
// UsersProxyHandler forwards /api/users/* to legacy Node backend.
func UsersProxyHandler(targetURL string) http.Handler {
	if targetURL == "" {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Users API proxy not configured (LEGACY_NODE_URL)", http.StatusServiceUnavailable)
		})
	}
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Printf("[USERS_PROXY] invalid LEGACY_NODE_URL: %v", err)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Users API proxy misconfigured", http.StatusServiceUnavailable)
		})
	}
	return httputil.NewSingleHostReverseProxy(target)
}

// AdminProxyHandler returns a reverse proxy that forwards /api/admin/* to legacy Node backend.
func AdminProxyHandler(targetURL string) http.Handler {
	if targetURL == "" {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Admin API proxy not configured (LEGACY_NODE_URL)", http.StatusServiceUnavailable)
		})
	}
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Printf("[ADMIN_PROXY] invalid LEGACY_NODE_URL: %v", err)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Admin API proxy misconfigured", http.StatusServiceUnavailable)
		})
	}
	proxy := httputil.NewSingleHostReverseProxy(target)
	return proxy
}

// LegacyAPIProxyHandler returns a reverse proxy for /api/* requests not handled by Go.
// Register this last so only unmatched /api/* paths (bank, peneliti, LSB, paraf, pv, validasi, etc.) are forwarded to Node.
func LegacyAPIProxyHandler(targetURL string) http.Handler {
	if targetURL == "" {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Legacy API proxy not configured (LEGACY_NODE_URL)", http.StatusServiceUnavailable)
		})
	}
	target, err := url.Parse(targetURL)
	if err != nil {
		log.Printf("[LEGACY_API_PROXY] invalid LEGACY_NODE_URL: %v", err)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "Legacy API proxy misconfigured", http.StatusServiceUnavailable)
		})
	}
	return httputil.NewSingleHostReverseProxy(target)
}
