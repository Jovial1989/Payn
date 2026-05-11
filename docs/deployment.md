# Payn Deployment

## Normal Workflow

Agents work locally only:

1. Edit files.
2. Run local checks.
3. Show `git status`.
4. When the user says `deploy`, commit and push to `main`.
5. Vercel deploys automatically from GitHub.

## Normal Deploy

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

Do not run `vercel deploy` for normal releases.

## Local Checks

```bash
npm run deploy:check
```

This runs local validation only. It does not deploy.

Useful individual commands:

```bash
npm run dev:web
npm run build:web
npm run lint:web
```

## Vercel

Production project:
- Project: `payn`
- Production branch: `main`
- Root directory: `apps/web`
- Domains: `payn.online`, `www.payn.online`

Vercel should remain connected to GitHub and auto-deploy from `Jovial1989/Payn`.

Use Vercel CLI only for exceptional operations:
- inspecting a failed deployment
- emergency rollback
- one-off manual deployment explicitly requested by the user

## Rollback

Prefer Vercel dashboard rollback.

CLI rollback is acceptable only when explicitly requested:

```bash
vercel rollback
```

## Supabase

Do not touch Supabase for UI-only or copy-only changes.

Use Supabase only when a change includes:
- new tables
- schema changes
- migrations
- database functions
- RLS/policy changes
- required seed data

When schema changes are included, commit the migration first and apply it in the controlled Supabase workflow.

## Agent Rules

When asked for code changes:
- edit locally
- run local checks
- do not deploy automatically
- do not run Vercel deploy
- do not run Supabase commands unless schema/database changes are part of the request

When asked to deploy:
- do not open Vercel
- do not run `vercel deploy`
- commit and push to `origin main`
- report that Vercel will auto-deploy from GitHub
