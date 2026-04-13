"use client";

import type { MarketplaceCategory } from "@payn/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardDiscoverWorkspace } from "@/components/dashboard-discover-workspace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { getOffersForCountrySelection } from "@/lib/countries";
import type { DashboardInsights } from "@/lib/dashboard";
import { localePath } from "@/lib/locale";
import type { MarketplaceOffer } from "@payn/types";

function getRecentTrailOffers(insights: DashboardInsights | null) {
  if (!insights) {
    return [] as MarketplaceOffer[];
  }

  const merged: MarketplaceOffer[] = [];
  const seen = new Set<string>();
  const buckets = [insights.watchedOffers, insights.savedOffers];

  for (const bucket of buckets) {
    for (const offer of bucket) {
      if (!seen.has(offer.id)) {
        seen.add(offer.id);
        merged.push(offer);
      }
    }
  }

  return merged;
}

export function DiscoverPageView({
  initialIntent,
}: {
  initialIntent?: MarketplaceCategory;
}) {
  const { user, profile } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const productMarketScope = "eu_fallback";

  const loadInsights = useCallback(async () => {
    if (!user) {
      setInsights(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("/api/v1/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });

      if (response.ok) {
        setInsights((await response.json()) as DashboardInsights);
      }
    } catch {
      // Discover should stay usable even if retention signals fail to load.
    } finally {
      window.clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const offers = useMemo(
    () => getOffersForCountrySelection(preferences.country, productMarketScope),
    [preferences.country],
  );
  const recentTrail = useMemo(() => getRecentTrailOffers(insights), [insights]);

  return (
    <DashboardDiscoverWorkspace
      locale={preferences.locale}
      userId={user?.id ?? null}
      initialIntent={initialIntent}
      marketLabel={preferences.countryLabel}
      preferredCountry={preferences.country}
      onCountryChange={preferences.setCountry}
      profile={profile ?? null}
      offers={offers}
      recentOffers={recentTrail}
      savedOffers={insights?.savedOffers ?? []}
      dashboardHref={localePath(preferences.locale, "/dashboard")}
      settingsHref={localePath(preferences.locale, "/settings")}
      categoryHref={(category: MarketplaceCategory) => localePath(preferences.locale, `/${category}`)}
    />
  );
}
