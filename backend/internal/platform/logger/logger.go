package logger

import (
	"log/slog"
	"os"
)

func New(service, environment string) *slog.Logger {
	return slog.New(
		slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{}),
	).With("service", service, "environment", environment)
}

