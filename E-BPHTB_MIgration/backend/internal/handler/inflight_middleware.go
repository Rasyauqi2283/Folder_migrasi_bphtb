package handler

import (
	"net/http"
	"sync/atomic"
)

// InFlightMiddleware tracks active requests. It is intentionally lightweight:
// increment at start, decrement on return.
func InFlightMiddleware(counter *atomic.Int64, next http.Handler) http.Handler {
	if counter == nil {
		return next
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		counter.Add(1)
		defer counter.Add(-1)
		next.ServeHTTP(w, r)
	})
}

