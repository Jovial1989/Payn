"use client";

import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { DashboardDiscoverWorkspace } from "@/components/dashboard-discover-workspace";
import { DiscoverHero } from "@/components/discover/hero";
import { TodayStrip } from "@/components/discover/today-strip";
import { HelpDecide } from "@/components/discover/help-decide";
import { TrustBand } from "@/components/discover/trust-band";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import { getOffersForCountrySelection } from "@/lib/countries";
import type { DashboardInsights } from "@/lib/dashboard";
import { localePath } from "@/lib/locale";
import type { MarketplaceOffer } from "@payn/types";
import { AtlasGrid } from "@/features/home/atlas-grid";
import {
  countOffersByOutcome,
  countTotalOffers,
} from "@/features/catalog/count-by-outcome";
import { discoverCopy as t } from "@/copy/discover.en";

function getRecentTrailOffers(insights: DashboardInsights | null) {
  if (!insights) return [] as MarketplaceOffer[];
  const merged: MarketplaceOffer[] = [];
  const seen = new Set<string>();
  for (const offer of [...insights.watchedOffers, ...insights.savedOffers]) {
    if (!seen.has(offer.id)) { seen.add(offer.id); merged.push(offer); }
  }
  return merged;
}

export function DiscoverPageView({
  initialIntent,
}: {
  initialIntent?: MarketplaceCategory;
}) {
  const { user, profile, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [activeGoal, setActiveGoal] = useState<MarketplaceCategory | undefined>(
    initialIntent,
  );
  const workspaceRef = useRef<HTMLDivElement>(null);
  const productMarketScope = "eu_fallback";

  const loadInsights = useCallback(async () => {
    if (!user) { setInsights(null); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch("/api/v1/dashboard", { cache: "no-store", signal: controller.signal });
      if (response.ok) setInsights((await response.json()) as DashboardInsights);
    } catch { /* stay usable */ } finally { window.clearTimeout(timeout); }
  }, [user]);

  useEffect(() => { void loadInsights(); }, [loadInsights]);

  const offers = useMemo(
    () => getOffersForCountrySelection(preferences.country, productMarketScope),
    [preferences.country],
  );
  const recentTrail = useMemo(() => getRecentTrailOffers(insights), [insights]);
  const continueOffer = recentTrail[0] ?? insights?.savedOffers?.[0] ?? null;

  // Live counts that feed the hero stat tiles AND the AtlasGrid below — both
  // read from the same source so the page's "27 cards" pill and the hero's
  // "X products" never disagree.
  const { productCount, providerCount } = useMemo(
    () => countTotalOffers(preferences.country),
    [preferences.country],
  );
  const buckets = useMemo(
    () => countOffersByOutcome(preferences.country),
    [preferences.country],
  );

  const handleGoalSelect = useCallback((goal: MarketplaceCategory) => {
    setActiveGoal(goal);
    // Scroll the workspace into view after a short paint delay
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const categoryHref = useCallback(
    (category: MarketplaceCategory) => localePath(preferences.locale, `/${category}`),
    [preferences.locale],
  );

  return (
    <>
      <AnalyticsPageView
        eventName={AnalyticsEvent.DiscoverViewed}
        dedupeKey="discover"
        properties={buildWebAnalyticsProperties({
          category: initialIntent ?? null,
          country: preferences.country,
          language: preferences.locale,
          loggedIn: Boolean(user),
        })}
        ready={!loading}
      />

      <div className="grid gap-8 lg:gap-10">
        {/* § 1 — Hero with live proof tiles. */}
        <DiscoverHero
          locale={preferences.locale}
          onGoalSelect={handleGoalSelect}
          continueOffer={continueOffer}
          productCount={productCount}
          providerCount={providerCount}
        />

        {/* § 2 — What people are checking today. Keeps a sense of motion just
                  below the fold so the page never feels static. */}
        <TodayStrip getHref={categoryHref} />

        {/* § 3 — Atlas bucket grid. This is the primary navigation surface for
                  /discover — nine tiles, each opens a curated cluster of
                  products. Replaces the previous "browse by goal" pill row
                  that was hidden inside the workspace. */}
        <section className="grid gap-2">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-strong">
                {t.atlas.eyebrow}
              </p>
              <h2 className="mt-2 text-[1.5rem] font-bold tracking-[-0.025em] text-ink sm:text-[1.75rem]">
                {t.atlas.heading}
              </h2>
              <p className="mt-1.5 max-w-[60ch] text-[14px] text-ink-secondary">
                {t.atlas.subhead}
              </p>
            </div>
          </div>
          <AtlasGrid
            country={preferences.country}
            locale={preferences.locale}
            buckets={buckets}
          />
        </section>

        {/* § 4 — Why Payn trust band. Dark, high-contrast panel that breaks
                  the white rhythm and ties the brand promise to four concrete
                  proof points. */}
        <TrustBand />

        {/* § 5 — Interactive quick-check workspace. Same component as before,
                  now positioned after the user has seen the catalogue scope
                  and the trust pillars, so the "tell me about your situation"
                  ask lands with more reason to engage. */}
        <div ref={workspaceRef}>
          <DashboardDiscoverWorkspace
            locale={preferences.locale}
            userId={user?.id ?? null}
            initialIntent={activeGoal as MarketplaceCategory | undefined}
            marketLabel={preferences.countryLabel}
            preferredCountry={preferences.country}
            onCountryChange={preferences.setCountry}
            profile={profile ?? null}
            offers={offers}
            categoryHref={categoryHref}
          />
        </div>

        {/* § 6 — Help me decide. */}
        <HelpDecide contactHref={localePath(preferences.locale, "/contact")} />
      </div>
    </>
  );
}
