package handler

import (
	"net/http"
	"path/filepath"
	"strings"
)

// ServeUploadDir serves a file from dir. Filename must be base name only (no path traversal).
func ServeUploadDir(dir, filename string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		if filename == "" || strings.Contains(filename, "..") || strings.ContainsRune(filename, '/') || strings.ContainsRune(filename, '\\') {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		path := filepath.Join(dir, filename)
		absPath, err := filepath.Abs(path)
		if err != nil {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		absDir, err := filepath.Abs(dir)
		if err != nil || !strings.HasPrefix(absPath, absDir) {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}
		http.ServeFile(w, r, absPath)
	}
}
