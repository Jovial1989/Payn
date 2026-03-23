# Backend Architecture

The backend is organized as a modular Go service with separate entrypoints for the public API, worker processes, and scheduled jobs.

- `cmd/api`: boots the HTTP API.
- `cmd/worker`: reserved for background jobs such as click enrichment, lead processing, and cache invalidation.
- `cmd/scheduler`: reserved for recurring ingestion and ranking workflows.
- `internal/domain`: server-owned marketplace domains.
- `internal/interfaces/rest`: public and admin HTTP boundaries.
- `internal/platform`: cross-cutting concerns such as config, logging, middleware, auth, and infrastructure clients.

