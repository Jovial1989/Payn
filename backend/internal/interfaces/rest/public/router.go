package public

import (
	"encoding/json"
	"net/http"

	"github.com/payn/payn/backend/internal/domain/affiliate"
	"github.com/payn/payn/backend/internal/domain/catalog"
	"github.com/payn/payn/backend/internal/domain/lead"
	"github.com/payn/payn/backend/internal/domain/ranking"
)

func NewRouter(
	catalogService catalog.Service,
	rankingService ranking.Service,
	affiliateService affiliate.Service,
	leadService lead.Service,
) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"status":    "ok",
			"catalog":   catalogService.Name(),
			"ranking":   rankingService.Name(),
			"affiliate": affiliateService.Name(),
			"lead":      leadService.Name(),
		})
	})

	mux.HandleFunc("/offers", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": "public offers endpoint scaffolded; catalog retrieval belongs here",
		})
	})

	mux.HandleFunc("/affiliate/click", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": "affiliate click tracking contract reserved",
		})
	})

	mux.HandleFunc("/leads", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": "lead capture contract reserved",
		})
	})

	return mux
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

