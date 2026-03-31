"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buttonStyles } from "@/components/button";
import { DashboardCardsWorkspace } from "@/components/dashboard-cards-workspace";
import { DashboardCategoryWorkspace } from "@/components/dashboard-category-workspace";
import { DashboardInvestmentsWorkspace } from "@/components/dashboard-investments-workspace";
import { DashboardLoadingState, DashboardSectionCard } from "@/components/dashboard-primitives";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import type { MarketIntelligenceAssetId } from "@/lib/market-intelligence";
import { matchesOfferMarketWithScope } from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getUiCopy } from "@/lib/ui-copy";

function getCategoryOffers(
  market: string,
  category: MarketplaceCategory,
  marketScope: "local_only" | "eu_fallback" | "all_europe",
) {
  return marketplaceOffers
    .filter((offer) =>
      matchesOfferMarketWithScope(
        offer,
        market as import("@payn/types").MarketplaceMarket,
        marketScope,
      ),
    )
    .filter((offer) => offer.category === category);
}

function mergeInsights(...buckets: DashboardOfferInsight[][]) {
  const seen = new Set<string>();
  const merged: DashboardOfferInsight[] = [];
  for (const bucket of buckets) {
    for (const item of bucket) {
      if (!seen.has(item.offer.id)) {
        seen.add(item.offer.id);
        merged.push(item);
      }
    }
  }
  return merged;
}

export function ProductCategoryView({ category }: { category: MarketplaceCategory }) {
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);

  const dashboardMarketScope = profile?.market_scope ?? "eu_fallback";
  const resolvedProfileMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;
  const dashboardMarket = dashboardMarketScope === "all_europe" ? "eu" : resolvedProfileMarket;
  const marketLabel = dictionary.markets[dashboardMarket];
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = localePath(preferences.locale, "/dashboard");

  const loadInsights = useCallback(async () => {
    if (!user) return;
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
      // insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  if (loading) {
    return <DashboardLoadingState label={uiCopy.dashboard.loadingWorkspace} />;
  }

  if (!user) {
    return (
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.guestEyebrow}
          title={uiCopy.dashboard.guestTitle}
          description="Sign in to compare offers, save decisions, and move between categories without losing your context."
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath(preferences.locale, "/login")}
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              {uiCopy.auth.signIn}
            </Link>
            <Link
              href={localePath(preferences.locale, "/signup")}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              {dictionary.nav.compareOptions}
            </Link>
          </div>
        </DashboardSectionCard>
      </div>
    );
  }

  const categoryOffers = getCategoryOffers(dashboardMarket, category, dashboardMarketScope);
  const categoryInsights = insights
    ? mergeInsights(
        insights.recommended.filter((item) => item.offer.category === category),
        insights.bestValueToday.filter((item) => item.offer.category === category),
        insights.popularWithUsersLikeYou.filter((item) => item.offer.category === category),
        insights.trendingInMarket.filter((item) => item.offer.category === category),
      )
    : [];

  if (category === "investments") {
    return (
      <div className="grid gap-5">
        <DashboardInvestmentsWorkspace
          key={`investments:${searchParams.get("asset") ?? "btc"}`}
          locale={preferences.locale}
          marketLabel={marketLabel}
          dashboardHref={dashboardHref}
          discoverHref={discoverHref}
          initialAssetId={(searchParams.get("asset") as MarketIntelligenceAssetId | null) ?? undefined}
          offers={categoryOffers}
        />
      </div>
    );
  }

  if (category === "cards") {
    return (
      <div className="grid gap-5">
        <DashboardCardsWorkspace
          key="cards"
          locale={preferences.locale}
          marketLabel={marketLabel}
          offers={categoryOffers}
          discoverHref={discoverHref}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <DashboardCategoryWorkspace
        key={category}
        locale={preferences.locale}
        category={category}
        marketLabel={marketLabel}
        profile={profile ?? null}
        offers={categoryOffers}
        insights={categoryInsights}
        savedCount={insights?.savedOffers.filter((offer) => offer.category === category).length ?? 0}
        discoverHref={discoverHref}
      />
    </div>
  );
}
