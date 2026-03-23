APP_NAME := payn-backend

.PHONY: run-api run-worker run-scheduler build-api build-worker build-scheduler fmt test

run-api:
	go run ./cmd/api

run-worker:
	go run ./cmd/worker

run-scheduler:
	go run ./cmd/scheduler

build-api:
	go build -o bin/api ./cmd/api

build-worker:
	go build -o bin/worker ./cmd/worker

build-scheduler:
	go build -o bin/scheduler ./cmd/scheduler

fmt:
	go fmt ./...

test:
	go test ./...

