package application

import (
	"encoding/json"
	"net/http"

	"github.com/payn/payn/backend/internal/domain/affiliate"
	"github.com/payn/payn/backend/internal/domain/catalog"
	"github.com/payn/payn/backend/internal/domain/lead"
	"github.com/payn/payn/backend/internal/domain/ranking"
	adminrest "github.com/payn/payn/backend/internal/interfaces/rest/admin"
	publicrest "github.com/payn/payn/backend/internal/interfaces/rest/public"
	"github.com/payn/payn/backend/internal/platform/config"
	"github.com/payn/payn/backend/internal/platform/middleware"
	"log/slog"
)

type App struct {
	config    config.Config
	logger    *slog.Logger
	catalog   catalog.Service
	affiliate affiliate.Service
	ranking   ranking.Service
	lead      lead.Service
}

func New(cfg config.Config, logger *slog.Logger) *App {
	return &App{
		config:    cfg,
		logger:    logger,
		catalog:   catalog.NewService(),
		affiliate: affiliate.NewService(),
		ranking:   ranking.NewService(),
		lead:      lead.NewService(),
	}
}

func (a *App) Router() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{
			"status": "ok",
			"app":    a.config.AppName,
			"env":    a.config.Environment,
		})
	})

	publicRouter := publicrest.NewRouter(a.catalog, a.ranking, a.affiliate, a.lead)
	adminRouter := adminrest.NewRouter(a.catalog, a.ranking, a.affiliate, a.lead)

	mux.Handle("/v1/public/", http.StripPrefix("/v1/public", publicRouter))
	mux.Handle("/v1/admin/", http.StripPrefix("/v1/admin", adminRouter))

	return middleware.RequestLogging(a.logger, mux)
}

func (a *App) RunWorker() {
	a.logger.Info("worker bootstrapped", "responsibility", "background jobs and async pipelines")
}

func (a *App) RunScheduler() {
	a.logger.Info("scheduler bootstrapped", "responsibility", "recurring jobs and ingestion orchestration")
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
