"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { MarketplaceOffer } from "@payn/types";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { ProviderLogo } from "@/components/provider-logo";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { UserTypeOnboardingCard } from "@/components/user-type-onboarding-card";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import {
  getPopularProviders,
  getRecommendedOffers,
  getTrendingOffers,
  resolveProfileMarket,
} from "@/lib/dashboard";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import type { SavedOffer } from "@/lib/types";

function EmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-line-strong bg-white p-6 text-left">
      <p className="text-lg font-bold text-ink">{title}</p>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-5"}>
        {cta}
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const preferences = useMarketplacePreferences();
  const [savedRows, setSavedRows] = useState<SavedOffer[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [providerClickCount, setProviderClickCount] = useState(0);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const dashboardMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;

  const recommendedOffers = useMemo(
    () =>
      getRecommendedOffers({
        offers: marketplaceOffers,
        profile,
      }),
    [profile],
  );

  const trendingOffers = useMemo(
    () =>
      getTrendingOffers({
        offers: marketplaceOffers,
        market: dashboardMarket,
      }),
    [dashboardMarket],
  );

  const popularProviders = useMemo(
    () =>
      getPopularProviders({
        offers: marketplaceOffers,
        market: dashboardMarket,
      }),
    [dashboardMarket],
  );

  const savedOffers = useMemo(
    () =>
      savedRows
        .map((row) => marketplaceOffers.find((offer) => offer.id === row.offer_id))
        .filter(Boolean) as MarketplaceOffer[],
    [savedRows],
  );

  const paynScore = savedRows.length + providerClickCount * 2;

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      if (!user || !isSupabaseConfigured()) {
        setSavedRows([]);
        setProviderClickCount(0);
        setSavedLoading(false);
        return;
      }

      setSavedLoading(true);

      const [{ data: savedData }, { count }] = await Promise.all([
        supabase
          .from("saved_offers")
          .select("*")
          .order("saved_at", { ascending: false }),
        supabase
          .from("user_activity")
          .select("id", { count: "exact", head: true })
          .eq("action", "provider_click"),
      ]);

      if (!cancelled) {
        setSavedRows((savedData as SavedOffer[] | null) ?? []);
        setProviderClickCount(count ?? 0);
        setSavedLoading(false);
      }
    };

    void loadDashboardData();

    const handleSavedOfferChange = () => {
      void loadDashboardData();
    };

    const handleProviderClick = () => {
      void loadDashboardData();
    };

    window.addEventListener("payn:saved-offers-changed", handleSavedOfferChange);
    window.addEventListener("payn:provider-click", handleProviderClick);

    return () => {
      cancelled = true;
      window.removeEventListener("payn:saved-offers-changed", handleSavedOfferChange);
      window.removeEventListener("payn:provider-click", handleProviderClick);
    };
  }, [supabase, user]);

  if (loading) {
    return (
      <SiteShell hideHero>
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        </div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell hideHero>
        <div className="mx-auto max-w-2xl rounded-[32px] border border-line bg-white p-8 text-center shadow-card">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Dashboard</p>
          <h1 className="mt-3 text-h2 text-ink">Sign in to view your Payn dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
            Saved offers, personalized recommendations, trends, and your Payn score are available once you sign in.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/login" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Get started
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!profile?.onboarding_completed) {
    return (
      <SiteShell hideHero>
        <div className="grid gap-6">
          <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Welcome back</p>
            <h1 className="mt-3 text-h2 text-ink">Finish your setup to unlock recommendations</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
              Choose how you use Payn so the dashboard can rank the most relevant products for your account.
            </p>
          </section>
          <UserTypeOnboardingCard />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell hideHero>
      <div className="grid gap-8">
        <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Dashboard</p>
              <h1 className="mt-3 text-h2 text-ink">
                Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                Recommendations are tuned to your account type and preferred market. Saved offers and provider activity stay attached to this profile.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag tone="success">{dashboardMarket.toUpperCase()}</Tag>
                <Tag tone="muted">
                  {profile.user_type === "personal"
                    ? "Personal"
                    : profile.user_type === "freelancer"
                      ? "Freelancer"
                      : "Business"}
                </Tag>
                {profile.selected_categories.slice(0, 3).map((category) => (
                  <Tag key={category} tone="blue">
                    {category}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-[24px] bg-bg-surface px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Your Payn score
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{paynScore}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
                className="h-11 rounded-full border border-line px-5 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
              >
                Sign out
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Recommended</p>
              <h2 className="mt-3 text-h3 text-ink">Products picked for your profile</h2>
            </div>
            <Link href="/explore" className={buttonStyles({ variant: "secondary", size: "md" })}>
              Explore more
            </Link>
          </div>

          <div className="grid gap-4">
            {recommendedOffers.map((offer, index) => (
              <OfferCard key={offer.id} offer={offer} rank={index + 1} locale={preferences.locale} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4">
            <div>
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Saved</p>
              <h2 className="mt-3 text-h3 text-ink">Your shortlist</h2>
            </div>

            {savedLoading ? (
              <div className="rounded-[28px] border border-line bg-white p-8 shadow-card">
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
                </div>
              </div>
            ) : savedOffers.length > 0 ? (
              <div className="grid gap-4">
                {savedOffers.slice(0, 3).map((offer, index) => (
                  <OfferCard key={offer.id} offer={offer} rank={index + 1} locale={preferences.locale} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No saved offers yet"
                description="Save a product from Explore or from an offer detail page to build your shortlist here."
                href="/explore"
                cta="Go to Explore"
              />
            )}
          </div>

          <div className="grid gap-6">
            <section className="rounded-[28px] border border-line bg-white p-6 shadow-card">
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Trends</p>
              <h2 className="mt-3 text-h3 text-ink">What stands out right now</h2>

              <div className="mt-5 grid gap-3">
                {trendingOffers.map((offer, index) => (
                  <Link
                    key={offer.id}
                    href={`/offers/${offer.slug}`}
                    className="rounded-[24px] bg-bg-surface px-4 py-4 transition-colors hover:bg-bg-overlay"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-ink">{offer.title}</p>
                        <p className="mt-1 text-xs text-ink-secondary">{offer.providerName}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink">
                        #{index + 1}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 border-t border-line pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Popular providers
                </p>
                <div className="mt-4 grid gap-3">
                  {popularProviders.map((provider) => (
                    <div key={provider.providerName} className="flex items-center justify-between rounded-2xl bg-bg-surface px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProviderLogo providerName={provider.providerName} size="sm" />
                        <span className="text-sm font-medium text-ink">{provider.providerName}</span>
                      </div>
                      <span className="text-xs font-semibold text-ink-secondary">
                        {provider.count} products
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-line bg-white p-6 shadow-card">
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Loyalty</p>
              <h2 className="mt-3 text-h3 text-ink">Your Payn score: {paynScore}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Saving an offer adds 1 point. Clicking through to a provider adds 2 points. The score grows with real product activity on your account.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    Saved offers
                  </p>
                  <p className="mt-2 text-xl font-bold text-ink">{savedRows.length}</p>
                </div>
                <div className="rounded-2xl bg-bg-surface px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    Provider clicks
                  </p>
                  <p className="mt-2 text-xl font-bold text-ink">{providerClickCount}</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
