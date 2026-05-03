# Payn Source of Truth Specification

## Document Status

- **Project:** Payn / MotixAI ecosystem
- **Methodology:** Specification-Driven Development (SDD)
- **Role of this document:** Central source of truth derived from the current repository state
- **Language:** English
- **Evidence policy:** This document is based only on the code currently present in the repository

## 1. System Architecture

### 1.1 Repository Topology

The repository is a monorepo with three main product surfaces and shared packages:

- `apps/web`: Next.js web application
- `apps/mobile`: Flutter mobile application
- `backend`: Go service scaffold
- `packages/types`: shared marketplace type definitions
- `packages/config`: shared package placeholder
- `packages/utils`: shared utility package placeholder
- `packages/ui`: shared UI package placeholder
- `supabase`: database migrations, config, and seed assets

### 1.2 Implemented Technology Stack

#### Web

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** React 19-style app structure, Tailwind CSS, custom CSS tokens, Framer Motion / Motion
- **Auth and persistence:** Supabase Auth and Supabase Postgres via `@supabase/ssr` and `@supabase/supabase-js`
- **Analytics:** Amplitude (`@amplitude/unified`)
- **External market data:** Open Exchange Rates, ExchangeRate.host, Frankfurter, Finnhub, Twelve Data, Alpha Vantage, CoinGecko, Yahoo Finance
- **AI:** Gemini via Google Generative Language REST API (`gemini-2.5-flash`)

#### Mobile

- **Framework:** Flutter
- **Routing:** `go_router`
- **State:** `ChangeNotifier`-based `AppController`
- **Storage:** local persistence via `shared_preferences`
- **Networking:** `dio`
- **Analytics:** `amplitude_flutter`
- **Fonts:** `google_fonts`

#### Backend

- **Language:** Go 1.24
- **Structure:** simple clean-architecture-inspired module split under `internal/`
- **Runtime status:** scaffolded; routes mostly return `501 Not Implemented`

#### Data Platform

- **Actual implemented database layer:** Supabase Postgres
- **Migration system:** SQL migrations in `supabase/migrations`
- **Security model:** Row Level Security (RLS) for user-owned tables

### 1.3 Runtime Architecture by Surface

#### Web Runtime

The web app is the most implemented production surface in this repository.

- Server-rendered and client-rendered route mix via Next.js App Router
- Public product discovery pages for marketplace categories and offers
- Authenticated dashboard backed by Supabase user/session state
- API routes under `apps/web/src/app/api/v1/*`
- Static offer catalog sourced from local TypeScript datasets, not from Supabase tables
- Live market intelligence and FX quote endpoints aggregate third-party APIs at request time

#### Mobile Runtime

The mobile app is a rich local-first client.

- Marketplace data is loaded from local in-app repository classes
- Authentication is simulated locally through `LocalAuthRepository`
- Saved offers, compare state, recent views, and preferences are persisted locally
- Market intelligence is fetched directly from Yahoo Finance and falls back to generated synthetic series if unavailable
- No Supabase integration is implemented in the mobile code scanned

#### Backend Runtime

The Go backend exposes:

- `/healthz`
- `/v1/public/health`
- `/v1/admin/health`

Reserved but unimplemented contracts:

- `/v1/public/offers`
- `/v1/public/affiliate/click`
- `/v1/public/leads`
- `/v1/admin/offers`

### 1.4 Module Structure

#### Web Modules

- `src/app`: route tree and API handlers
- `src/components`: UI composition layer
- `src/features`: feature-specific page datasets and sections
- `src/lib`: shared client/server domain logic, copy, locale, ranking helpers, analytics, market logic
- `src/server`: server-only service adapters for catalog, content, providers, FX, dashboard, market intelligence, Supabase
- `src/hooks`: auth state hook

#### Mobile Modules

- `lib/app`: bootstrap and router
- `lib/core`: theme, storage, network, localization, config
- `lib/features`: screen-level modules
- `lib/shared/models`: marketplace and analytics models
- `lib/shared/services`: app controller, repositories, analytics, market intelligence
- `lib/shared/widgets`: reusable UI primitives

#### Backend Modules

- `internal/application`: app composition
- `internal/domain`: catalog, ranking, affiliate, lead service placeholders
- `internal/interfaces/rest`: public and admin HTTP routers
- `internal/platform`: config, logger, middleware, HTTP server

## 2. Data Schema

### 2.1 Critical Finding

No Firestore schema is implemented in the scanned codebase.

- No Firebase or Firestore client usage was found.
- The implemented persistence layer is Supabase Postgres.
- Any stakeholder language referring to Firestore is not aligned with the current repository state.

### 2.2 Implemented Supabase Tables

#### `public.categories`

| Field | Type | Notes |
| --- | --- | --- |
| `code` | `text` | Primary key |
| `name` | `text` | Required |
| `created_at` | `timestamptz` | Default `now()` |

#### `public.countries`

| Field | Type | Notes |
| --- | --- | --- |
| `code` | `text` | Primary key |
| `name` | `text` | Required |
| `region` | `text` | Default `'EU'` |
| `created_at` | `timestamptz` | Default `now()` |

#### `public.providers`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, `gen_random_uuid()` |
| `slug` | `text` | Unique |
| `name` | `text` | Required |
| `website_url` | `text` | Required |
| `logo_path` | `text` | Nullable |
| `trust_score` | `numeric(5,2)` | Default `0` |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `public.product_offers`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `provider_id` | `uuid` | FK to `providers.id` |
| `category_code` | `text` | FK to `categories.code` |
| `slug` | `text` | Unique |
| `title` | `text` | Required |
| `subtitle` | `text` | Nullable |
| `pricing_snapshot` | `jsonb` | Default `{}` |
| `benefits` | `jsonb` | Default `[]` |
| `best_for` | `jsonb` | Default `[]` |
| `compliance_notes` | `jsonb` | Default `[]` |
| `provider_website_url` | `text` | Required |
| `affiliate_link` | `text` | Required |
| `link_type` | `text` | Required |
| `affiliate_priority_score` | `numeric(5,2)` | Default `0` |
| `base_rank` | `numeric(8,3)` | Default `0` |
| `published` | `boolean` | Default `false` |
| `last_reviewed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `public.offer_country_availability`

| Field | Type | Notes |
| --- | --- | --- |
| `offer_id` | `uuid` | FK to `product_offers.id`, cascade delete |
| `country_code` | `text` | FK to `countries.code` |
| `is_available` | `boolean` | Default `true` |

Primary key: `(offer_id, country_code)`

#### `public.ranking_rules`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `category_code` | `text` | FK to `categories.code` |
| `country_code` | `text` | Nullable FK to `countries.code` |
| `rule_key` | `text` | Required |
| `weight` | `numeric(6,3)` | Required |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | Default `now()` |

#### `public.affiliate_clicks`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `offer_id` | `uuid` | FK to `product_offers.id` |
| `country_code` | `text` | Nullable |
| `session_id` | `text` | Nullable |
| `referrer` | `text` | Nullable |
| `metadata` | `jsonb` | Default `{}` |
| `created_at` | `timestamptz` | Default `now()` |

#### `public.leads`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `offer_id` | `uuid` | Nullable FK to `product_offers.id` |
| `category_code` | `text` | FK to `categories.code` |
| `country_code` | `text` | Nullable FK to `countries.code` |
| `email` | `text` | Nullable |
| `phone` | `text` | Nullable |
| `payload` | `jsonb` | Default `{}` |
| `status` | `text` | Default `'received'` |
| `created_at` | `timestamptz` | Default `now()` |

#### `public.content_pages`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `slug` | `text` | Unique |
| `page_type` | `text` | Required |
| `title` | `text` | Required |
| `body` | `jsonb` | Default `{}` |
| `published` | `boolean` | Default `false` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `public.user_preferences`

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Primary key |
| `preferred_country_code` | `text` | Nullable FK to `countries.code` |
| `saved_filters` | `jsonb` | Default `{}` |
| `updated_at` | `timestamptz` | Default `now()` |

#### `public.user_profiles`

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | `uuid` | Primary key, FK to `auth.users.id`, cascade delete |
| `selected_categories` | `text[]` | Default empty array |
| `home_country` | `text` | Nullable FK to `countries.code` |
| `market_scope` | `text` | Default `'eu_fallback'`, constrained to `local_only`, `eu_fallback`, `all_europe` |
| `target_countries` | `text[]` | Default empty array |
| `goals` | `text[]` | Default empty array |
| `user_type` | `text` | Default `'personal'` |
| `spending_range` | `text` | Nullable |
| `transfer_range` | `text` | Nullable |
| `loan_range` | `text` | Nullable |
| `onboarding_completed` | `boolean` | Default `false` |
| `first_name` | `text` | Nullable |
| `last_name` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` |

RLS enabled. Users can select, insert, and update only their own row.

#### `public.saved_offers`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `auth.users.id`, cascade delete |
| `offer_id` | `text` | Required, references local catalog IDs in application code |
| `category` | `text` | Required |
| `saved_at` | `timestamptz` | Default `now()` |

Unique constraint: `(user_id, offer_id)`

RLS enabled. Users can select, insert, and delete only their own rows.

#### `public.user_activity`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `auth.users.id`, cascade delete |
| `action` | `text` | Required |
| `offer_id` | `text` | Nullable |
| `category` | `text` | Nullable |
| `metadata` | `jsonb` | Default `{}` |
| `created_at` | `timestamptz` | Default `now()` |

RLS enabled. Users can select and insert only their own rows.

#### `public.app_waitlist`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `email` | `text` | Required |
| `platform` | `text` | `ios`, `android`, or `both` |
| `source` | `text` | Default `'website'` |
| `created_at` | `timestamptz` | Default `now()` |

Unique index: `lower(email), platform`

RLS enabled. Anonymous and authenticated users may insert if simple email/platform checks pass.

### 2.3 Implemented Functions

#### `public.dashboard_market_match(home_country text, target_market text)`

Utility SQL function used by dashboard aggregation logic to determine market scope matching.

#### `public.get_market_offer_activity(target_market text, target_user_type text, lookback_days integer)`

Security definer function that rolls up:

- save counts from `saved_offers`
- provider click counts from `user_activity`
- offer view counts from `user_activity`
- weighted activity score

This function powers dashboard recommendation and trend features.

### 2.4 Relationship Map

- `providers` -> `product_offers`: one-to-many
- `categories` -> `product_offers`: one-to-many
- `countries` -> `offer_country_availability`: one-to-many
- `product_offers` -> `offer_country_availability`: one-to-many
- `categories` -> `ranking_rules`: one-to-many
- `countries` -> `ranking_rules`: optional one-to-many
- `auth.users` -> `user_profiles`: one-to-one
- `auth.users` -> `saved_offers`: one-to-many
- `auth.users` -> `user_activity`: one-to-many

### 2.5 Important Schema-to-Code Reality Check

The repository contains a richer marketplace schema in Supabase, but the currently running web and mobile product catalogs are sourced primarily from local TypeScript and Dart datasets.

This means:

- `product_offers`, `providers`, `ranking_rules`, `affiliate_clicks`, `leads`, and `content_pages` are structurally defined in SQL
- the active web catalog service still reads from local files such as `marketplace-offers.ts`, `mock-data.ts`, `marketplace-expanded-offers.ts`, and `marketplace-fallback-offers.ts`
- the mobile app also uses a local marketplace repository rather than database-backed offer retrieval

## 3. Feature Inventory

### 3.1 Web Product Features

- **Authentication**
  - Email/password sign-in and sign-up via Supabase
  - Auth callback exchange route
  - Password reset request flow
  - Sign-out route and client-side session clearing
- **Profile and onboarding**
  - User profile creation-on-first-auth
  - Name capture
  - Country and market scope preferences
  - Category, goals, user type, and financial range preferences
  - Local draft persistence for profile onboarding
- **Marketplace discovery**
  - Category routes for loans, cards, transfers, exchange, insurance, investments
  - Market-aware offer filtering
  - Provider, feature, subtype, amount, and term filters
  - Offer detail pages
  - Related offers and compare-oriented layouts
- **Dashboard**
  - Personalized dashboard API route
  - Saved offers retrieval
  - Recent activity usage
  - Recommendation and trend blocks
  - Market pulse, FX, crypto, and provider activity signals
- **User activity capture**
  - Offer views recorded to `user_activity`
  - Provider click events recorded to `user_activity`
  - Saved offers recorded to `saved_offers`
- **Market intelligence**
  - Asset/timeframe intelligence API
  - Investment-oriented signals and recommendations
  - Live provider fallback chain across multiple third-party market APIs
- **FX quote service**
  - Real-time or near-real-time quote endpoint
  - Multi-provider fallback chain
  - Hardcoded indicative-rate fallback when all providers fail
- **AI chat assistant**
  - Fast-path regex answers for common finance questions
  - Gemini-backed contextual chat for broader questions
  - Context injection for category, country, goals, and categories
- **Localization**
  - Web locale dictionaries for at least `en`, `de`, `es`, `fr`, `it`, `pt`
  - Locale-sensitive routes and copy
- **Waitlist**
  - Mobile app waitlist capture into Supabase

### 3.2 Mobile Product Features

- Locale gate before normal app access
- Home, Explore, Saved, Profile, Offer Detail, Compare, and Auth screens
- Local guest/auth session switching
- Local saved offers, compare list, recent items, and preferences
- Local ranking and recommendation heuristics
- Market intelligence charts with live Yahoo Finance fetch and synthetic fallback
- External provider handoff flow
- Mobile analytics event tracking

### 3.3 Backend Features

Implemented:

- health endpoints
- application composition
- request logging middleware

Reserved but not implemented:

- public offers API
- affiliate click ingestion API
- lead capture API
- admin offers management API
- worker and scheduler jobs

## 4. UI/UX Design Tokens

### 4.1 Current Aesthetic Direction in Code

The active web and mobile product direction is best described as:

- premium fintech / neo-banking interface language
- dark, glassy dashboard shell on the web authenticated surface
- clean, bright, editorial comparison surfaces in Tailwind tokens
- high-radius cards, soft shadows, thin borders, premium typography
- strong use of cyan/emerald accent color for action and emphasis

The requested “Revolut-style” positioning is partially reflected in the codebase through:

- glassmorphism and blurred elevated shells
- dense dashboard navigation
- premium fintech card treatments
- compact, data-led decision surfaces

### 4.2 Web Token Evidence

From `apps/web/src/app/globals.css` and `apps/web/tailwind.config.ts`:

- **Base dark shell colors:** `--bg-base`, `--surface-base`, `--surface-elevated`, `--ink-primary`
- **Accent colors:** `--emerald`, `--emerald-strong`, Tailwind `accent.emerald`
- **Surface patterns:** premium cards, glass surfaces, subtle grids, hero orbs, layered gradients
- **Motion:** `section-enter`, `card-enter`, `page-enter`, floating layers, hover lift patterns
- **Shape language:** large rounded corners, pills, soft borders
- **Typography:** `Inter`, `Inter Tight`, `Geist Mono`

Representative styling patterns:

- glass and blur overlays
- translucent sidebars and hero panels
- premium card hover elevation
- pill-chip filters and segmented controls
- contrast-heavy dark shells for dashboard/application views

### 4.3 Mobile Token Evidence

From `apps/mobile/lib/core/theme/app_theme.dart`:

- **Base palette:** light premium neutral surface system
- **Accent:** `0xFF0FBE7B` / `0xFF0D9F67`
- **Radius scale:** chip `999`, button `18`, card `28`, panel `32`, shell `34`
- **Spacing scale:** `4`, `8`, `12`, `16`, `20`, `24`, `32`
- **Typography:** `Inter` and `Inter Tight`
- **Component feel:** large rounded cards, soft outlines, no heavy shadows, polished Material 3 adaptation

### 4.4 Shared UI Patterns

- marketplace cards with provider badges and top metrics
- premium CTA buttons
- chart cards and insight blocks
- dashboard workspace modules
- localized comparison tables
- provider handoff surfaces

## 5. AI Integration Logic

### 5.1 Implemented AI Surface

The only implemented LLM integration in the scanned codebase is the web chat API route:

- `apps/web/src/app/api/v1/chat/route.ts`

### 5.2 System Prompt

The system prompt defines Payn AI as:

- built-in assistant for a European financial marketplace
- concise, trustworthy, product-native, non-jargon
- explicitly non-advisory and non-guaranteeing
- required to avoid inventing provider details
- aware of core categories: loans, credit cards, money transfers, currency exchange

### 5.3 LLM Flow

1. Request body includes `messages` and optional `context`
2. The route checks regex-based fast paths first
3. If matched, it returns a local static answer without calling Gemini
4. If no Gemini API key is configured, it returns a fallback product message
5. If Gemini is available, the route:
   - augments the system prompt with category, country, goals, and selected categories
   - maps conversation roles into Gemini REST format
   - calls `gemini-2.5-flash:generateContent`
   - applies a 15-second timeout
   - returns response text plus suggestion prompts

### 5.4 Gemini Configuration

Implemented request configuration:

- **Model:** `gemini-2.5-flash`
- **API style:** direct REST call to Google Generative Language API
- **System instruction:** sent through `system_instruction.parts`
- **Generation config:**
  - `temperature: 0.7`
  - `maxOutputTokens: 400`
  - `topP: 0.9`

### 5.5 Fast-Path Answer Set

The chat route contains built-in local answer packs for topics including:

- APR
- transfer fees
- FX spread
- cashback
- debit vs credit
- fixed exchange rate
- factors affecting APR
- overdrafts
- loan overview
- Payn ranking methodology

### 5.6 LLM Chain Depth

No multi-step LLM chain, tool calling loop, agent runtime, vector retrieval pipeline, or Google AI SDK package integration was found.

The current design is a single-route, single-call pattern with:

- regex fast path
- prompt enrichment
- direct Gemini request
- fallback responses

## 6. Architecture Debt

### 6.1 Data Layer Mismatch

- The database schema models a normalized provider/offer platform in Supabase.
- The active web and mobile catalog implementations still rely on local hardcoded datasets.
- `saved_offers.offer_id` stores text IDs tied to local catalog records rather than foreign keys to `product_offers`.

### 6.2 Firestore vs Supabase Terminology Drift

- Stakeholder framing references Firestore.
- The actual codebase uses Supabase/Postgres and contains no Firestore implementation.
- This is a documentation and alignment risk for SDD.

### 6.3 Backend Is Mostly Scaffolded

- The Go backend domain services are empty placeholders.
- Public and admin business endpoints are reserved but not implemented.
- Worker and scheduler are bootstrapped only by log messages.

### 6.4 Mobile Auth Is Not Real Authentication

- `LocalAuthRepository` accepts sign-in/sign-up and persists a local session without remote verification.
- The mobile client currently behaves as a local simulation rather than a Supabase-authenticated client.

### 6.5 Design System Inconsistency

- Web styling contains multiple competing visual systems:
  - dark glass dashboard shell
  - lighter Tailwind token palette
  - separate root `payn-theme.css` dark token layer
- Fonts also differ by surface and file (`Inter`, `Inter Tight`, `Geist Mono`, `google_fonts` on mobile).
- This indicates an evolving but not fully consolidated design system.

### 6.6 Placeholder Services in Web Server Layer

- `content-service.ts` returns placeholder content
- `provider-service.ts` returns placeholder provider data
- catalog is local-file-backed instead of DB-backed

### 6.7 Fallback-Heavy Product Logic

- Market intelligence uses multi-provider fallback and can degrade to unavailable/stale states
- FX quotes fall back to hardcoded indicative rates
- Mobile market intelligence falls back to synthetic generated chart data
- Fallback catalog offers are explicitly injected to pad thin market coverage

### 6.8 Product Scope Outpaces Data Contracts

- Categories include `insurance` and `investments` in shared types and UI flows
- The chat system prompt only mentions loans, credit cards, money transfers, and currency exchange
- This creates a small but real product-language mismatch between catalog scope and AI scope

### 6.9 Worktree Volatility

- The repository currently contains unrelated uncommitted edits in both web and mobile files
- This increases the risk that documentation becomes stale quickly unless SPEC updates are maintained alongside implementation

## 7. Operational Configuration Surface

### 7.1 Web Environment Variables Observed

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `OPEN_EXCHANGE_RATES_APP_ID`
- `EXCHANGERATE_HOST_ACCESS_KEY`
- `COINGECKO_API_KEY`
- `COINGECKO_DEMO_API_KEY`
- `FINNHUB_API_KEY`
- `TWELVE_DATA_API_KEY`
- `ALPHA_VANTAGE_API_KEY`

### 7.2 Mobile Runtime Dependencies of Note

- local persistence via `shared_preferences`
- external navigation via `url_launcher`
- analytics via Amplitude
- remote charting source via Yahoo Finance endpoint

## 8. Source-of-Truth Summary

At the time of this scan, Payn is architected as a monorepo whose most complete production surface is the Next.js web app. Supabase is the actual persistence platform, while the marketplace catalog itself remains primarily code-defined rather than database-driven. The Flutter app is a polished local-first companion experience, and the Go backend is a scaffold for future service extraction rather than the current system of record.
