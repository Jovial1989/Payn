# Payn

Payn is a monorepo with:

- `apps/web`: Next.js web app deployed to Vercel
- `apps/mobile`: Flutter mobile client
- `backend`: Go services
- `supabase`: database migrations and local Supabase config

## Deploy flow

### Production

1. Keep the Vercel project linked to this repo and the `main` branch.
2. Set the Vercel project root directory to `apps/web`.
3. Vercel should use the detected `Next.js` framework preset.
4. Push or merge to `main`.
5. Vercel automatically creates the production deployment for `payn.online`.

### Preview deployments

1. Push any feature branch.
2. Open a pull request.
3. Vercel creates a preview deployment for that branch or PR automatically.
4. Review the preview URL before merging.

No manual redeploy workflow is required when Git integration is configured correctly.

## Vercel project settings

- Framework preset: `Next.js`
- Root directory: `apps/web`
- Build command: `npm run build`
- Install command: use the workspace lockfile defaults from the repository
- Output directory: `.next`

### Required environment variables

Configure these in Vercel for the correct environments:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `FINNHUB_API_KEY`
- `TWELVE_DATA_API_KEY`
- `ALPHA_VANTAGE_API_KEY`
- `OPEN_EXCHANGE_RATES_APP_ID`
- `EXCHANGE_RATE_HOST_ACCESS_KEY`

Set production values for `Production`, and non-production values for `Preview` when needed.

## Deployment notes

- Locale routing is handled with `apps/web/src/proxy.ts`.
- The web app no longer depends on Google Font downloads during build, which makes builds faster and more reliable.
- `apps/web/next.config.ts` keeps Turbopack rooted at the monorepo root and enables image format optimization.
- Dynamic APIs are still used only where request-specific behavior is required, such as auth/profile-aware routes and locale-prefixed routing.

## Local development

### Web

1. Install dependencies.
2. Run `npm run dev` inside `apps/web`.

### Mobile

1. Run `flutter pub get` inside `apps/mobile`.
2. Run `flutter run`.
