"use client";

import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { DashboardDiscoverWorkspace } from "@/components/dashboard-discover-workspace";
import { DiscoverHero } from "@/components/discover/hero";
import { TodayStrip } from "@/components/discover/today-strip";
import { HelpDecide } from "@/components/discover/help-decide";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsEvent, buildWebAnalyticsProperties } from "@/lib/analytics";
import { getOffersForCountrySelection } from "@/lib/countries";
import type { DashboardInsights } from "@/lib/dashboard";
import { localePath } from "@/lib/locale";
import type { MarketplaceOffer } from "@payn/types";

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

      <div className="grid gap-8">
        {/* § 3.1 Hero */}
        <DiscoverHero
          locale={preferences.locale}
          onGoalSelect={handleGoalSelect}
          continueOffer={continueOffer}
        />

        {/* § 3.2 What people are checking today */}
        <TodayStrip getHref={categoryHref} />

        {/* § 3.3 + 3.4 Browse by goal + Quick check */}
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

        {/* § 3.5 Help me decide */}
        <HelpDecide contactHref={localePath(preferences.locale, "/contact")} />
      </div>
    </>
  );
}
