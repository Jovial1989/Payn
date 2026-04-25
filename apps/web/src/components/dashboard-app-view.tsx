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
    },
    [preferences, updateProfile],
  );
  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace(discoverHref);
  }, [discoverHref, router, signOut]);
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
    return (
      <div className="grid gap-6">
        {pageView}
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.guestEyebrow}
          title={uiCopy.dashboard.guestTitle}
          description={
            preferences.locale === "de"
              ? "Das Dashboard ist jetzt das Kontrollzentrum für angemeldete Nutzer. Discover und alle Produktseiten bleiben für Gäste offen, während dein Konto Entscheidungspfad, Einstellungen und Empfehlungen speichert."
              : "Dashboard is now the signed-in control center. Discover and every product page stay open to guests, while your account keeps the decision trail, settings, and recommendations."
          }
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath(preferences.locale, "/login")}
              onClick={() =>
                trackSignInClicked({
                  country: preferences.country,
                  language: preferences.locale,
                  loggedIn: false,
                })
              }
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              {uiCopy.auth.signIn}
            </Link>
            <Link
              href={discoverHref}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              {productEntryActionLabel}
            </Link>
          </div>
        </DashboardSectionCard>
      </div>
    );
  }

  const savedOffers = insights?.savedOffers ?? [];
  const watchedOffers = insights?.watchedOffers ?? [];
  const bestOffers = insights?.recommended.slice(0, 3) ?? [];
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
              <div className="rounded-[20px] border border-dashed border-line bg-white p-6 text-sm leading-relaxed text-ink-secondary">
                Save or open offers to build your shortlist.
              </div>
            ) : null}
          </div>
        </DashboardSectionCard>

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
                className="group rounded-[22px] border border-[#EAEAEA] bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(15,138,75,0.18)] hover:shadow-[0_16px_36px_rgba(15,23,32,0.08)]"
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
