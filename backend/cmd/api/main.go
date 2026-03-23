package main

import (
	"context"
	"log"
	"os/signal"
	"syscall"

	"github.com/payn/payn/backend/internal/application"
	platformhttp "github.com/payn/payn/backend/internal/platform/http"
	"github.com/payn/payn/backend/internal/platform/config"
	"github.com/payn/payn/backend/internal/platform/logger"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logr := logger.New(cfg.AppName, cfg.Environment)
	app := application.New(cfg, logr)
	server := platformhttp.NewServer(cfg, logr, app.Router())

	logr.Info("starting api server", "port", cfg.HTTP.Port, "env", cfg.Environment)
	if err := server.Run(ctx); err != nil {
		logr.Error("api server stopped", "error", err)
	}
}

