"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { buttonStyles } from "@/components/button";
import { DashboardLoadingState, DashboardSectionCard } from "@/components/dashboard-primitives";
import { DashboardProfileWorkspace } from "@/components/dashboard-profile-workspace";
import { OfferCard } from "@/components/offer-card";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
// WEB.2 — Inline Compare-ready card. Lives at the top of the Dashboard
// view whenever the user has 1+ offers in their Compare set. Replaces
// the bottom-docked CompareBar (now deleted in WEB.2).
import { CompareReadyCard } from "@/features/compare/compare-ready-card";
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import { useAuth } from "@/hooks/use-auth";
import {
  AnalyticsEvent,
  buildWebAnalyticsProperties,
  trackSignInClicked,
} from "@/lib/analytics";
import {
  getCategoryOffersForCountrySelection,
} from "@/lib/countries";
import type { DashboardInsights } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { switchLocalePath } from "@/lib/locale";
import { getDashboardHref, type DashboardView } from "@/lib/dashboard-navigation";
import { getUiCopy } from "@/lib/ui-copy";

const dashboardCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

type SettingsSavePayload = {
  first_name: string | null;
  last_name: string | null;
  preferred_locale: "en" | "de" | "es" | "fr" | "it" | "pt";
  user_type: "personal" | "freelancer" | "business";
  selected_categories: string[];
  goals: string[];
  home_country: string | null;
  market_scope: "local_only" | "eu_fallback" | "all_europe";
};

type DashboardAppViewProps = {
  view?: Extract<DashboardView, "dashboard" | "settings">;
};

export function DashboardAppView({ view = "dashboard" }: DashboardAppViewProps) {
  const router = useRouter();
  const { user, profile, loading, updateProfile, signOut, requestPasswordReset } = useAuth();
  const preferences = useMarketplacePreferences();
  const uiCopy = getUiCopy(preferences.locale);
  const dictionary = getDictionary(preferences.locale);
  const productEntryActionLabel = getProductEntryActionLabel(preferences.locale);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const productMarketScope = "eu_fallback";
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = useCallback(
    (view: DashboardView) => getDashboardHref(view, preferences.locale),
    [preferences.locale],
  );
  const handleSettingsSave = useCallback(
    async (data: SettingsSavePayload) => {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        preferred_locale: data.preferred_locale,
        user_type: data.user_type,
        selected_categories: data.selected_categories,
        goals: data.goals,
        home_country: data.home_country,
        market_scope: data.market_scope,
        onboarding_completed: true,
      });
      if (data.home_country) {
        preferences.setCountry(data.home_country);
      }
      if (data.preferred_locale !== preferences.locale) {
        preferences.setLanguage(data.preferred_locale);
        router.replace(switchLocalePath(window.location.pathname, data.preferred_locale));
      }
    },
    [preferences, router, updateProfile],
  );
  const handleSignOut = useCallback(async () => {
    await signOut();
    // Hard reload to flush every auth-derived widget (sidebar,
    // dashboard chrome, server data) — see app-shell.handleSignOut.
    window.location.assign(discoverHref);
  }, [discoverHref, signOut]);
  const loadInsights = useCallback(async () => {
    if (!user) {
      setInsights(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("/api/v1/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (response.ok) {
        setInsights((await response.json()) as DashboardInsights);
      }
    } catch {
      // dashboard insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const pageView = (
    <AnalyticsPageView
      eventName={view === "settings" ? AnalyticsEvent.SettingsViewed : AnalyticsEvent.DashboardViewed}
      dedupeKey={`dashboard:${view}`}
      properties={buildWebAnalyticsProperties({
        country: preferences.country,
        language: preferences.locale,
        loggedIn: Boolean(user),
      })}
      ready={!loading}
    />
  );

  if (loading) {
    return <DashboardLoadingState label={uiCopy.dashboard.loadingWorkspace} />;
  }

  if (!user) {
    // Guest dashboard — was previously a dead-end with just "Sign in".
    // Replaced with a value-first sell: three feature tiles with concrete
    // example chips drawn from the same signal we already publish on
    // home (WhatsNew), a single primary CTA, and a frictionless
    // "Continue as guest" escape that wins findability but loses the
    // attention war against the sign-up button.
    const featureTiles: Array<{
      key: string;
      title: string;
      example: string;
      icon: React.ReactNode;
    }> = [
      {
        key: "track",
        title: "Track rate drops",
        example: "Wise cut transfer fees 0.05% last week",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 17l5-5 4 4 5-7 4 5" />
            <path d="M16 9h5v5" />
          </svg>
        ),
      },
      {
        key: "save",
        title: "Save your shortlist",
        example: "Keep the 3 cards you're comparing in one place",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 3h14v18l-7-4.5L5 21V3z" />
          </svg>
        ),
      },
      {
        key: "alerts",
        title: "Get rate alerts",
        example: "ING raised easy-access savings 3.8% → 4.0%",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0112 0c0 6 3 7 3 7H3s3-1 3-7z" />
            <path d="M10 21a2 2 0 004 0" />
          </svg>
        ),
      },
    ];
    const signInHref = `${localePath(preferences.locale, "/login")}?next=${encodeURIComponent(localePath(preferences.locale, "/dashboard"))}`;

    return (
      <div className="grid gap-10">
        {pageView}

        <header className="max-w-prose-base">
          <p className="eyebrow-cap" data-tone="emerald">
            {uiCopy.dashboard.guestEyebrow}
          </p>
          <h1 className="display-lead mt-3 text-[1.75rem] sm:text-[2.25rem]">
            Save the offers you're comparing.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            One account, your shortlist across cards, savings, transfers and
            loans — with alerts when providers move their rates.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {featureTiles.map((tile, i) => (
            <div
              key={tile.key}
              className="group relative overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/25 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-emerald-soft text-accent-emerald-strong transition-transform group-hover:scale-105">
                <span className="block h-6 w-6">{tile.icon}</span>
              </div>
              <p className="mt-4 text-[15px] font-bold tracking-tight-1 text-ink">
                {tile.title}
              </p>
              <p className="mt-2 rounded-xl border border-line bg-bg-surface px-3 py-2 text-[12px] leading-snug text-ink-secondary">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-emerald align-middle" />
                {tile.example}
              </p>
              {/* Subtle skewed accent that breaks text monotony per the
                  "abstract visuals" spec — corner gradient only, no raster. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rotate-[18deg] rounded-full bg-accent-emerald/5 blur-2xl"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link
            href={signInHref}
            onClick={() =>
              trackSignInClicked({
                country: preferences.country,
                language: preferences.locale,
                loggedIn: false,
              })
            }
            className={buttonStyles({ variant: "primary", size: "lg" })}
          >
            Create account
          </Link>
          {/* Plain-text guest escape — wins findability, loses the attention
              war against the primary CTA. No competing button. */}
          <Link
            href={discoverHref}
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-tertiary transition-colors hover:text-ink"
          >
            {productEntryActionLabel}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h7M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
        <p className="text-[12px] text-ink-tertiary">
          30 seconds · email and password · no card asked
        </p>
      </div>
    );
  }

  const savedOffers = insights?.savedOffers ?? [];
  const watchedOffers = insights?.watchedOffers ?? [];
  const bestOffers = insights?.recommended.slice(0, 3) ?? [];
  const recentActivity = [
    ...watchedOffers.slice(0, 2).map((offer) => ({
      id: `viewed-${offer.id}`,
      label: "Viewed",
      title: `${offer.providerName} · ${offer.title}`,
    })),
    ...savedOffers.slice(0, 2).map((offer) => ({
      id: `saved-${offer.id}`,
      label: "Saved",
      title: `${offer.providerName} · ${offer.title}`,
    })),
  ].slice(0, 4);
  const categoryCounts = Object.fromEntries(
    dashboardCategories.map((category) => [
      category,
      getCategoryOffersForCountrySelection(
        preferences.country,
        category,
        productMarketScope,
      ).length,
    ]),
  ) as Record<MarketplaceCategory, number>;

  let body: React.ReactNode;

  if (view === "settings") {
    body = (
      <DashboardProfileWorkspace
        key="settings"
        locale={preferences.locale}
        userId={user.id}
        email={user.email ?? ""}
        profile={profile ?? null}
        onSignOut={handleSignOut}
        onSave={handleSettingsSave}
        onRequestPasswordReset={requestPasswordReset}
      />
    );
  } else {
    body = (
      <div className="grid gap-6">
        {/* WEB.7 — Glance hero mirroring Flutter MOB.12. ONE display-
            size headline metric (the leading recommended offer's
            primary metric) + ONE primary CTA "Find best rate" →
            /discover. Everything else on the page is secondary. */}
        {bestOffers.length > 0 ? (
          <GlanceHero
            offerProvider={bestOffers[0].offer.providerName}
            offerTitle={bestOffers[0].offer.title}
            metricLabel={
              bestOffers[0].offer.metrics?.[0]?.label ?? "Live rate"
            }
            metricValue={bestOffers[0].offer.metrics?.[0]?.value ?? "—"}
            ctaHref={discoverHref}
          />
        ) : null}

        {/* WEB.2 — Sits at the top of the dashboard whenever the user
            has 1+ offers picked for Compare. Self-hides at count 0.
            Owns its own drawer state so no floating chrome lives at
            the bottom of the viewport anymore. */}
        <CompareReadyCard locale={preferences.locale} />

        <DashboardSectionCard
          eyebrow="Personalized"
          title="Best offers for you"
          description="Your clearest next options, ranked for quick decisions."
          action={
            <Link href={discoverHref} className={buttonStyles({ variant: "secondary", size: "md" })}>
              {productEntryActionLabel}
            </Link>
          }
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {bestOffers.map((item, index) => (
              <OfferCard key={item.offer.id} offer={item.offer} rank={index + 1} locale={preferences.locale} />
            ))}
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Continue"
          title="Continue where you left off"
          description="Jump back into recently viewed or saved offers without restarting your search."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {(watchedOffers.length > 0 ? watchedOffers : savedOffers).slice(0, 2).map((offer, index) => (
              <OfferCard key={offer.id} offer={offer} rank={index + 1} locale={preferences.locale} />
            ))}
            {watchedOffers.length === 0 && savedOffers.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-line bg-bg-surface p-6 text-sm leading-relaxed text-ink-secondary">
                Save or open offers to build your shortlist.
              </div>
            ) : null}
          </div>
        </DashboardSectionCard>

        {/* Activity block — used to always render three "SAVED 0 / VIEWED 0
            / SUGGESTIONS 3" tiles, which shouted nothing-here as a metric
            instead of inviting a first action. Now: when the user has no
            saved or viewed offers, we hide the zero tiles entirely and
            show a single "start your shortlist" CTA. Once they have at
            least one activity, the original list + tile-grid layout
            comes back. */}
        {(() => {
          const hasActivity = savedOffers.length > 0 || watchedOffers.length > 0;
          return (
            <DashboardSectionCard
              eyebrow="Activity"
              title="Recent activity"
              description={
                hasActivity
                  ? "Your latest shortlist actions and signals, kept lightweight."
                  : `Save or open offers to build your shortlist. ${bestOffers.length} suggestions are waiting on the right.`
              }
            >
              {hasActivity ? (
                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="metric-tile rounded-[22px] p-5">
                    <div className="grid gap-3">
                      {recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_4px_18px_rgba(15,23,32,0.04)]"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                              {item.label}
                            </p>
                            <p className="mt-1 truncate text-sm font-semibold text-ink">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {[
                      { label: "Saved", value: savedOffers.length },
                      { label: "Viewed", value: watchedOffers.length },
                      { label: "Suggestions", value: bestOffers.length },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-[24px] border border-line bg-white px-5 py-4 shadow-card">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{stat.label}</p>
                        <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-[-0.04em] text-ink">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-[22px] border border-dashed border-line bg-bg-surface px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <div className="max-w-prose-base">
                    <p className="text-[15px] font-bold tracking-tight-1 text-ink">
                      Your saved cards will live here.
                    </p>
                    <p className="mt-1.5 text-[13px] text-ink-secondary">
                      Open any offer and hit Save — we&apos;ll keep your shortlist warm and surface rate changes.
                    </p>
                  </div>
                  <Link
                    href={discoverHref}
                    className={`${buttonStyles({ variant: "primary", size: "md" })} shrink-0`}
                  >
                    Browse the catalogue
                  </Link>
                </div>
              )}
            </DashboardSectionCard>
          );
        })()}

        <DashboardSectionCard
          eyebrow="Explore"
          title="Explore categories"
          description="Browse by financial goal with the shortest path to a decision."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dashboardCategories.map((category) => (
              <Link
                key={category}
                href={dashboardHref(category)}
                className="group rounded-[24px] border border-line bg-white px-5 py-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-accent-emerald/20 hover:shadow-elevated"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  {categoryCounts[category]} offers
                </p>
                <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-ink">
                  {dictionary.categories[category]}
                </p>
                <p className="mt-3 text-sm font-semibold text-accent-emerald transition-colors group-hover:text-accent-emerald-strong">
                  Explore {dictionary.categories[category].toLowerCase()} &rarr;
                </p>
              </Link>
            ))}
          </div>
        </DashboardSectionCard>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {pageView}
      {body}
    </div>
  );
}

// ─── GlanceHero ────────────────────────────────────────────────────────
//
// WEB.7 — Dashboard hero matching Flutter MOB.12. ONE display-size
// metric ("TODAY'S BEST RATE") + provider line + ONE primary emerald
// CTA. Secondary content (saved/compared/recent metrics, category
// pills, smart suggestions) lives elsewhere on the page — this card
// is glanceability above everything else.
function GlanceHero({
  offerProvider,
  offerTitle,
  metricLabel,
  metricValue,
  ctaHref,
}: {
  offerProvider: string;
  offerTitle: string;
  metricLabel: string;
  metricValue: string;
  ctaHref: string;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-accent-emerald/15 bg-gradient-to-br from-accent-emerald-soft/60 to-white px-5 py-7 shadow-[0_18px_36px_rgba(15,138,75,0.10)] sm:rounded-[32px] sm:px-8 sm:py-9"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-accent-emerald-strong">
        Today&apos;s best rate
      </p>
      {/* Display-size headline metric — clamp() so it auto-scales
          between 2.8rem (375px) and 4.2rem (md+). Tabular figures so
          "0.41%" doesn't jitter against the next live update. */}
      <p
        className="mt-3 font-extrabold tabular-nums leading-none tracking-[-0.06em] text-ink"
        style={{ fontSize: "clamp(2.8rem, 9vw, 4.2rem)" }}
      >
        {metricValue}
      </p>
      <p className="mt-2 text-[13px] text-ink-secondary sm:text-[14px]">
        {metricLabel} · {offerProvider} — {offerTitle}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={ctaHref}
          prefetch
          className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-emerald px-6 text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(15,138,75,0.28)] transition-all hover:bg-accent-emerald-strong"
        >
          Find best rate
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
