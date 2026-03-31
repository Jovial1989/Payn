"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardDiscoverWorkspace } from "@/components/dashboard-discover-workspace";
import { DashboardLoadingState, DashboardSectionCard } from "@/components/dashboard-primitives";
import { DashboardOverviewWorkspace } from "@/components/dashboard-overview-workspace";
import { DashboardProfileWorkspace } from "@/components/dashboard-profile-workspace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import {
  getActiveDashboardView,
  getDashboardHref,
  type DashboardView,
} from "@/lib/dashboard-navigation";
import { matchesOfferMarketWithScope } from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getUiCopy } from "@/lib/ui-copy";

const dashboardCategories: MarketplaceCategory[] = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
];

function getMarketOffers(market: string, marketScope: "local_only" | "eu_fallback" | "all_europe") {
  return marketplaceOffers.filter((offer) =>
    matchesOfferMarketWithScope(
      offer,
      market as import("@payn/types").MarketplaceMarket,
      marketScope,
    ),
  );
}

function getCategoryOffers(
  market: string,
  category: MarketplaceCategory,
  marketScope: "local_only" | "eu_fallback" | "all_europe",
) {
  return getMarketOffers(market, marketScope).filter((offer) => offer.category === category);
}

type DashboardPreferenceSavePayload = {
  user_type: "personal" | "freelancer" | "business";
  selected_categories: string[];
  goals: string[];
  home_country: string | null;
  market_scope: "local_only" | "eu_fallback" | "all_europe";
};

type SettingsSavePayload = {
  first_name: string | null;
  last_name: string | null;
};

export function DashboardAppView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeView = useMemo(
    () => getActiveDashboardView(pathname, searchParams.get("view")),
    [pathname, searchParams],
  );

  const router = useRouter();
  const { user, profile, loading, updateProfile, signOut, requestPasswordReset } = useAuth();
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);

  const dashboardMarketScope = profile?.market_scope ?? "eu_fallback";
  const resolvedProfileMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;
  const dashboardMarket = dashboardMarketScope === "all_europe" ? "eu" : resolvedProfileMarket;
  const marketLabel = dictionary.markets[dashboardMarket];
  const discoverHref = localePath(preferences.locale, "/discover");
  const dashboardHref = useCallback(
    (view: DashboardView) => getDashboardHref(view, preferences.locale),
    [preferences.locale],
  );
  const handleDashboardPreferenceSave = useCallback(
    async (data: DashboardPreferenceSavePayload) => {
      await updateProfile({
        user_type: data.user_type,
        selected_categories: data.selected_categories,
        goals: data.goals,
        home_country: data.home_country,
        market_scope: data.market_scope,
        onboarding_completed: true,
      });
    },
    [updateProfile],
  );
  const handleSettingsSave = useCallback(
    async (data: SettingsSavePayload) => {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
      });
    },
    [updateProfile],
  );
  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace(localePath(preferences.locale, "/login"));
  }, [preferences.locale, router, signOut]);
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
      // dashboard insights are optional
    } finally {
      clearTimeout(timeout);
    }
  }, [user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const allOffers = useMemo(
    () => getMarketOffers(dashboardMarket, dashboardMarketScope),
    [dashboardMarket, dashboardMarketScope],
  );

  if (loading) {
    return <DashboardLoadingState label={uiCopy.dashboard.loadingWorkspace} />;
  }

  if (!user) {
    return (
      <div className="grid gap-6">
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.guestEyebrow}
          title={uiCopy.dashboard.guestTitle}
          description="Stay inside the logged-in product shell to compare offers, save decisions, and move between categories without jumping back to the public homepage."
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

  const username = user.email ? user.email.split("@")[0] : "Payn";
  const savedOffers = insights?.savedOffers ?? [];
  const watchedOffers = insights?.watchedOffers ?? [];
  const categoryCounts = Object.fromEntries(
    dashboardCategories.map((category) => [
      category,
      getCategoryOffers(dashboardMarket, category, dashboardMarketScope).length,
    ]),
  ) as Record<MarketplaceCategory, number>;

  let body: React.ReactNode;

  if (routeView === "discover") {
    body = (
      <DashboardDiscoverWorkspace
        key="discover"
        locale={preferences.locale}
        marketLabel={marketLabel}
        offers={allOffers}
      />
    );
  } else if (routeView === "profile") {
    body = (
      <DashboardProfileWorkspace
        key="profile"
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
      <DashboardOverviewWorkspace
        key="dashboard"
        locale={preferences.locale}
        userId={user.id}
        username={username}
        profile={profile ?? null}
        marketLabel={marketLabel}
        marketOffers={allOffers}
        savedOffers={savedOffers}
        watchedOffers={watchedOffers}
        categoryCounts={categoryCounts}
        settingsHref={dashboardHref("profile")}
        discoverHref={discoverHref}
        categoryHref={(category) => dashboardHref(category)}
        investmentsHref={dashboardHref("investments")}
        onSavePreferences={handleDashboardPreferenceSave}
      />
    );
  }

  return <div className="grid gap-5">{body}</div>;
}
