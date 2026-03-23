# Payn Architecture

Payn is structured as a monorepo with a dedicated Go backend, a Next.js web app, a Flutter mobile client, shared packages, and a Supabase persistence layer.

## Principles

- Business rules stay server-owned.
- Supabase provides PostgreSQL, auth foundation, and storage, not the entire application layer.
- Web and mobile consume shared contracts instead of forking marketplace logic.
- Affiliate-first monetization is supported from day one without blocking lead capture or broker routing later.

## Top-level layout

- `backend`: Go services for public/admin APIs, workers, and schedulers.
- `apps/web`: Next.js marketplace shell and route architecture.
- `apps/mobile`: Flutter client scaffold for future authenticated discovery.
- `packages`: shared types, config, utilities, and future UI primitives.
- `supabase`: migrations, local config, seed data, and limited function support.
- `docs`: architecture, scope, API, and setup references.

