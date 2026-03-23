package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	AppName     string
	Environment string
	HTTP        HTTPConfig
	JWT         JWTConfig
	Postgres    PostgresConfig
	Redis       RedisConfig
	Supabase    SupabaseConfig
	Analytics   AnalyticsConfig
}

type HTTPConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

type JWTConfig struct {
	Issuer    string
	Audience  string
	AccessTTL time.Duration
}

type PostgresConfig struct {
	Host     string
	Port     int
	Database string
	User     string
	Password string
	SSLMode  string
}

type RedisConfig struct {
	Address  string
	Password string
	DB       int
}

type SupabaseConfig struct {
	URL            string
	ServiceRoleKey string
}

type AnalyticsConfig struct {
	Provider string
}

func Load() (Config, error) {
	pgPort, err := intFromEnv("POSTGRES_PORT", 5432)
	if err != nil {
		return Config{}, err
	}

	redisDB, err := intFromEnv("REDIS_DB", 0)
	if err != nil {
		return Config{}, err
	}

	readTimeout, err := durationFromEnv("HTTP_READ_TIMEOUT", 10*time.Second)
	if err != nil {
		return Config{}, err
	}

	writeTimeout, err := durationFromEnv("HTTP_WRITE_TIMEOUT", 15*time.Second)
	if err != nil {
		return Config{}, err
	}

	idleTimeout, err := durationFromEnv("HTTP_IDLE_TIMEOUT", 60*time.Second)
	if err != nil {
		return Config{}, err
	}

	accessTTL, err := durationFromEnv("JWT_ACCESS_TTL", 15*time.Minute)
	if err != nil {
		return Config{}, err
	}

	return Config{
		AppName:     stringFromEnv("APP_NAME", "payn-backend"),
		Environment: stringFromEnv("APP_ENV", "development"),
		HTTP: HTTPConfig{
			Port:         stringFromEnv("HTTP_PORT", "8080"),
			ReadTimeout:  readTimeout,
			WriteTimeout: writeTimeout,
			IdleTimeout:  idleTimeout,
		},
		JWT: JWTConfig{
			Issuer:    stringFromEnv("JWT_ISSUER", "payn"),
			Audience:  stringFromEnv("JWT_AUDIENCE", "payn-web"),
			AccessTTL: accessTTL,
		},
		Postgres: PostgresConfig{
			Host:     stringFromEnv("POSTGRES_HOST", "127.0.0.1"),
			Port:     pgPort,
			Database: stringFromEnv("POSTGRES_DB", "payn"),
			User:     stringFromEnv("POSTGRES_USER", "postgres"),
			Password: os.Getenv("POSTGRES_PASSWORD"),
			SSLMode:  stringFromEnv("POSTGRES_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Address:  stringFromEnv("REDIS_ADDR", "127.0.0.1:6379"),
			Password: os.Getenv("REDIS_PASSWORD"),
			DB:       redisDB,
		},
		Supabase: SupabaseConfig{
			URL:            os.Getenv("SUPABASE_URL"),
			ServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		},
		Analytics: AnalyticsConfig{
			Provider: stringFromEnv("ANALYTICS_PROVIDER", "internal"),
		},
	}, nil
}

func stringFromEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

func intFromEnv(key string, fallback int) (int, error) {
	if value := os.Getenv(key); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return 0, fmt.Errorf("parse %s: %w", key, err)
		}

		return parsed, nil
	}

	return fallback, nil
}

func durationFromEnv(key string, fallback time.Duration) (time.Duration, error) {
	if value := os.Getenv(key); value != "" {
		parsed, err := time.ParseDuration(value)
		if err != nil {
			return 0, fmt.Errorf("parse %s: %w", key, err)
		}

		return parsed, nil
	}

	return fallback, nil
}

