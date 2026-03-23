package http

import (
	"context"
	"errors"
	"fmt"
	stdhttp "net/http"
	"time"

	"github.com/payn/payn/backend/internal/platform/config"
	"log/slog"
)

type Server struct {
	server *stdhttp.Server
	logger *slog.Logger
}

func NewServer(cfg config.Config, logger *slog.Logger, handler stdhttp.Handler) *Server {
	return &Server{
		logger: logger,
		server: &stdhttp.Server{
			Addr:              ":" + cfg.HTTP.Port,
			Handler:           handler,
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       cfg.HTTP.ReadTimeout,
			WriteTimeout:      cfg.HTTP.WriteTimeout,
			IdleTimeout:       cfg.HTTP.IdleTimeout,
		},
	}
}

func (s *Server) Run(ctx context.Context) error {
	errCh := make(chan error, 1)

	go func() {
		if err := s.server.ListenAndServe(); !errors.Is(err, stdhttp.ErrServerClosed) {
			errCh <- fmt.Errorf("listen and serve: %w", err)
		}
		close(errCh)
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		s.logger.Info("shutting down api server")
		if err := s.server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown server: %w", err)
		}

		return nil
	case err := <-errCh:
		return err
	}
}

