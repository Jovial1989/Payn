FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/api ./cmd/api

FROM gcr.io/distroless/static-debian12

WORKDIR /srv
COPY --from=builder /bin/api /srv/api
EXPOSE 8080

ENTRYPOINT ["/srv/api"]

