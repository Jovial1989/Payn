package main

import (
	"log"

	"github.com/payn/payn/backend/internal/application"
	"github.com/payn/payn/backend/internal/platform/config"
	"github.com/payn/payn/backend/internal/platform/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logr := logger.New(cfg.AppName+"-scheduler", cfg.Environment)
	app := application.New(cfg, logr)
	app.RunScheduler()
}

