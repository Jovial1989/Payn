"use client";

import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardOfferTile } from "@/components/dashboard-offer-tile";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import { UserTypeOnboardingCard } from "@/components/user-type-onboarding-card";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import type { DashboardInsights, DashboardOfferInsight } from "@/lib/dashboard";
import { resolveProfileMarket } from "@/lib/dashboard";
import {
  getDashboardHref,
  normalizeDashboardView,
  type DashboardView,
} from "@/lib/dashboard-navigation";
import { MarketplaceExplorer } from "@/components/marketplace-explorer";
import { marketDefinitions, matchesOfferMarket, normalizeDisplayText } from "@/lib/marketplace";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

const categoryLabels: Record<MarketplaceCategory, string> = {
  loans: "Loans",
  cards: "Cards",
  transfers: "Transfers",
  exchange: "Exchange",
  insurance: "Insurance",
  investments: "Investments",
};

const dashboardCategories = Object.keys(categoryLabels) as MarketplaceCategory[];

interface DashboardAlert {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "blue" | "success" | "orange";
}

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
    <div className="rounded-[24px] border border-dashed border-line-strong bg-white p-5">
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-4"}>
        {cta}
      </Link>
    </div>
  );
}

function LoadingState({ label = "Loading dashboard" }: { label?: string }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-10 shadow-subtle">
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        <p className="text-sm text-ink-secondary">{label}</p>
      </div>
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[28px] border border-line bg-white p-5 shadow-subtle sm:p-6 ${className}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
          <h2 className="mt-3 text-h3 text-ink">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SummaryPanel({
  email,
  marketLabel,
  userLabel,
  score,
  selectedCategories,
  trackedCount,
}: {
  email: string | null | undefined;
  marketLabel: string;
  userLabel: string | null;
  score: number;
  selectedCategories: string[];
  trackedCount: number;
}) {
  return (
    <section className="rounded-[30px] border border-line bg-white p-5 shadow-subtle sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Summary</p>
          <h1 className="mt-3 text-h2 text-ink">
            Welcome back{email ? `, ${email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            This is your product workspace - a single place to track market changes, compare saved products, and pick up where you left off.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="success">{marketLabel}</Tag>
            {userLabel ? <Tag tone="muted">{userLabel}</Tag> : null}
            {selectedCategories.slice(0, 3).map((category) => (
              <Tag key={category} tone="blue">
                {normalizeDisplayText(category)}
              </Tag>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={getDashboardHref("explore" as DashboardView)} className={buttonStyles({ variant: "primary", size: "md" })}>
              Explore offers
            </Link>
            <Link href={getDashboardHref("saved")} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open saved
            </Link>
            <Link href={getDashboardHref("profile")} className={buttonStyles({ variant: "ghost", size: "md" })}>
              View profile
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Payn score
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{score}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Tracked products
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{trackedCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Focus market
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Profile
            </p>
            <p className="mt-2 text-lg font-bold text-ink">{userLabel ?? "Account"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function OfferTileGrid({
  items,
  emptyTitle,
  emptyDescription,
  href = "/explore",
  cta = "Explore offers",
}: {
  items: DashboardOfferInsight[];
  emptyTitle: string;
  emptyDescription: string;
  href?: string;
  cta?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        href={href}
        cta={cta}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <DashboardOfferTile key={item.offer.id} offer={item.offer} insight={item} />
      ))}
    </div>
  );
}

function SavedOffersGrid({
  offers,
  insightMap,
}: {
  offers: MarketplaceOffer[];
  insightMap: Map<string, DashboardOfferInsight>;
}) {
  if (offers.length === 0) {
    return (
      <EmptyState
        title="No saved offers yet"
        description="Save products from Explore or an offer detail page to build your shortlist here."
        href={getDashboardHref("explore" as DashboardView)}
        cta="Go to Explore"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {offers.map((offer) => (
        <DashboardOfferTile
          key={offer.id}
          offer={offer}
          insight={insightMap.get(offer.id)}
          eyebrow="Saved"
        />
      ))}
    </div>
  );
}

function AlertsList({ alerts }: { alerts: DashboardAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-line-strong bg-white p-5">
        <p className="text-sm font-semibold text-ink">No live alerts right now</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Alerts appear when saved products, recent views, or market signals create a useful action for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          href={alert.href}
          className="rounded-[24px] border border-line bg-white px-4 py-4 shadow-subtle transition-colors hover:bg-bg-surface"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{alert.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{alert.detail}</p>
            </div>
            <Tag tone={alert.tone}>Alert</Tag>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MarketSnapshot({
  insights,
}: {
  insights: DashboardInsights;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        eyebrow="Market snapshot"
        title="What is changing around you"
        description="Live FX input, provider momentum, and category demand make the dashboard feel current instead of static."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              FX movement
            </p>
            {insights.marketSignals.fx ? (
              <>
                <p className="mt-3 text-xl font-bold text-ink">{insights.marketSignals.fx.pair}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {insights.marketSignals.fx.rate.toFixed(4)} now, {insights.marketSignals.fx.changePct >= 0 ? "+" : ""}
                  {insights.marketSignals.fx.changePct.toFixed(2)}% vs previous day
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                FX data is ready to appear here when a server-side exchange-rate source is configured.
              </p>
            )}
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Market tone
            </p>
            {insights.marketSignals.news ? (
              <>
                <p className="mt-3 text-xl font-bold capitalize text-ink">{insights.marketSignals.news.tone}</p>
                <p className="mt-1 text-sm text-ink-secondary">
                  {insights.marketSignals.news.headlineCount} recent headlines from {insights.marketSignals.news.source}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Investment news sentiment will appear here when the Finnhub server key is available.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Momentum"
        title="Trending providers and categories"
        description="These blocks come from actual saves, views, and provider clicks in your market and among similar account types."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Trending providers
            </p>
            <div className="mt-4 grid gap-3">
              {insights.trendingProviders.length > 0 ? (
                insights.trendingProviders.slice(0, 4).map((provider) => (
                  <div
                    key={provider.providerName}
                    className="flex items-center justify-between rounded-[20px] bg-bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <ProviderLogo providerName={provider.providerName} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{provider.providerName}</p>
                        <p className="mt-1 text-xs text-ink-tertiary">
                          {provider.offerCount} active products
                        </p>
                      </div>
                    </div>
                    <Tag tone="muted">{provider.activityScore.toFixed(1)}</Tag>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-secondary">
                  Provider momentum will appear once enough signed-in activity is available.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              Trending categories
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {insights.marketSignals.categoryMomentum.length > 0 ? (
                insights.marketSignals.categoryMomentum.map((item) => (
                  <Tag key={item.category} tone="blue">
                    {categoryLabels[item.category]} · {item.activityScore.toFixed(1)}
                  </Tag>
                ))
              ) : (
                <p className="text-sm text-ink-secondary">
                  Category demand will appear here as user activity builds.
                </p>
              )}
            </div>
            <div className="mt-5 rounded-[20px] bg-bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Trending crypto
              </p>
              {insights.marketSignals.crypto.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {insights.marketSignals.crypto.slice(0, 4).map((coin) => (
                    <Tag key={coin.id} tone="purple">
                      {coin.symbol}
                      {coin.priceChange24h !== null
                        ? ` ${coin.priceChange24h >= 0 ? "+" : ""}${coin.priceChange24h.toFixed(1)}%`
                        : ""}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-secondary">
                  CoinGecko trends will appear here when available.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function RewardsBlock({ insights }: { insights: DashboardInsights }) {
  return (
    <SectionCard
      eyebrow="Rewards"
      title="Payn score and engagement"
      description="Rewards stay tied to real activity only: saves, provider clicks, and tracked research."
    >
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[24px] bg-black px-6 py-6 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Your Payn score
          </p>
          <p className="mt-3 text-5xl font-bold tracking-tight">{insights.loyalty.score}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Save offer = +1 point. Click provider = +2 points. Score reflects product engagement, not decorative gamification.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Saved
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.savedCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Provider clicks
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.providerClickCount}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Offer views
            </p>
            <p className="mt-2 text-2xl font-bold text-ink">{insights.loyalty.viewedCount}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function buildAlertFeed(
  insights: DashboardInsights,
  activeCategory?: MarketplaceCategory,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const savedIds = new Set(insights.savedOffers.map((offer) => offer.id));

  if (
    insights.marketSignals.fx &&
    Math.abs(insights.marketSignals.fx.changePct) >= 0.6 &&
    (!activeCategory || activeCategory === "transfers" || activeCategory === "exchange")
  ) {
    alerts.push({
      id: "fx-move",
      title: `FX moved on ${insights.marketSignals.fx.pair}`,
      detail: `${insights.marketSignals.fx.changePct >= 0 ? "Up" : "Down"} ${Math.abs(
        insights.marketSignals.fx.changePct,
      ).toFixed(2)}% since yesterday. Review transfer and exchange products if timing matters.`,
      href: getDashboardHref("trends"),
      tone: "blue",
    });
  }

  const savedTrending = insights.trendingInMarket.find((item) => savedIds.has(item.offer.id));
  if (savedTrending) {
    alerts.push({
      id: "saved-trending",
      title: `${savedTrending.offer.title} is gaining attention`,
      detail: "A saved product is also trending in your market right now.",
      href: getDashboardHref("saved"),
      tone: "success",
    });
  }

  if (insights.watchedOffers.length > 0) {
    alerts.push({
      id: "recent-research",
      title: "You have recent research to pick back up",
      detail: `${insights.watchedOffers.length} recently viewed product${insights.watchedOffers.length === 1 ? "" : "s"} can be reviewed or saved from your tracking block.`,
      href: getDashboardHref("saved"),
      tone: "orange",
    });
  }

  if (
    insights.marketSignals.news?.tone === "cautious" &&
    (!activeCategory || activeCategory === "investments")
  ) {
    alerts.push({
      id: "news-caution",
      title: "Investment sentiment turned cautious",
      detail: "Recent market headlines are leaning cautious. Review platform and crypto exposure carefully before clicking through.",
      href: getDashboardHref("trends"),
      tone: "orange",
    });
  }

  return alerts.slice(0, 3);
}

function createInsightMap(insights: DashboardInsights) {
  const map = new Map<string, DashboardOfferInsight>();
  const buckets = [
    insights.recommended,
    insights.bestValueToday,
    insights.popularWithUsersLikeYou,
    insights.trendingInMarket,
    insights.marketSignals.risingFxOffers,
    insights.marketSignals.cryptoPlatforms,
  ];

  for (const bucket of buckets) {
    for (const item of bucket) {
      if (!map.has(item.offer.id)) {
        map.set(item.offer.id, item);
      }
    }
  }

  return map;
}

function mergeInsights(...buckets: DashboardOfferInsight[][]) {
  const seen = new Set<string>();
  const merged: DashboardOfferInsight[] = [];

  for (const bucket of buckets) {
    for (const item of bucket) {
      if (seen.has(item.offer.id)) {
        continue;
      }

      seen.add(item.offer.id);
      merged.push(item);
    }
  }

  return merged;
}

function toInsightForOffer(
  offer: MarketplaceOffer,
  insightMap: Map<string, DashboardOfferInsight>,
): DashboardOfferInsight {
  return (
    insightMap.get(offer.id) ?? {
      offer,
      activityScore: 0,
      saveCount: 0,
      providerClickCount: 0,
      offerViewCount: 0,
    }
  );
}

function CatalogOfferGrid({
  offers,
  emptyTitle,
  emptyDescription,
}: {
  offers: MarketplaceOffer[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (offers.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        href={getDashboardHref("explore" as DashboardView)}
        cta="Explore offers"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {offers.map((offer) => (
        <DashboardOfferTile key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

function getMarketOffers(market: string) {
  return marketplaceOffers.filter((offer) =>
    matchesOfferMarket(offer, market as import("@payn/types").MarketplaceMarket),
  );
}

function getCategoryOffers(market: string, category: MarketplaceCategory) {
  return getMarketOffers(market).filter((offer) => offer.category === category);
}

function getUniqueProviders(offers: MarketplaceOffer[]) {
  const seen = new Set<string>();
  return offers
    .filter((offer) => {
      if (seen.has(offer.providerName)) return false;
      seen.add(offer.providerName);
      return true;
    })
    .map((offer) => offer.providerName);
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const activeView = useMemo(
    () => normalizeDashboardView(searchParams.get("view")),
    [searchParams],
  );

  const { user, profile, loading } = useAuth();
  const preferences = useMarketplacePreferences();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const dashboardMarket = profile ? resolveProfileMarket(profile.home_country) : preferences.market;
  const marketLabel = marketDefinitions[dashboardMarket].label;

  // Try to load insights in background - never blocks UI
  const loadInsights = useCallback(async () => {
    if (!user || !profile?.onboarding_completed) return;
    setInsightsLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("/api/v1/dashboard", {
        cache: "no-store",
        signal: controller.signal,
      });
      if (response.ok) {
        const payload = (await response.json()) as DashboardInsights;
        setInsights(payload);
      }
    } catch {
      // Insights are optional - dashboard works without them
    } finally {
      clearTimeout(timeout);
      setInsightsLoading(false);
    }
  }, [profile?.onboarding_completed, user]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  useEffect(() => {
    if (!user || !profile?.onboarding_completed) return;
    const refresh = () => void loadInsights();
    window.addEventListener("payn:saved-offers-changed", refresh);
    window.addEventListener("payn:provider-click", refresh);
    return () => {
      window.removeEventListener("payn:saved-offers-changed", refresh);
      window.removeEventListener("payn:provider-click", refresh);
    };
  }, [loadInsights, profile?.onboarding_completed, user]);

  const userLabel = useMemo(() => {
    if (!profile?.user_type) return null;
    return profile.user_type === "personal"
      ? "Personal"
      : profile.user_type === "freelancer"
        ? "Freelancer"
        : "Business";
  }, [profile]);

  const insightMap = useMemo(
    () => (insights ? createInsightMap(insights) : new Map<string, DashboardOfferInsight>()),
    [insights],
  );

  const activeCategory = dashboardCategories.includes(activeView as MarketplaceCategory)
    ? (activeView as MarketplaceCategory)
    : null;

  const alerts = useMemo(
    () => (insights ? buildAlertFeed(insights, activeCategory ?? undefined) : []),
    [activeCategory, insights],
  );

  // Static catalog data for the current market
  const allOffers = useMemo(() => getMarketOffers(dashboardMarket), [dashboardMarket]);

  // --- Auth loading gate (with safety timeout in auth hook) ---
  if (loading) {
    return <LoadingState label="Loading your product workspace" />;
  }

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="grid gap-6">
        <SectionCard
          eyebrow="Dashboard"
          title="Sign in to access your Payn workspace"
          description="Compare loans, cards, transfers, exchange, insurance, and investments - all in one workspace."
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Sign in
            </Link>
            <Link href="/signup" className={buttonStyles({ variant: "secondary", size: "lg" })}>
              Get started
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Preview"
          title="What you get with a Payn account"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Saved shortlist", desc: "Track and compare products you are considering" },
              { label: "Market trends", desc: "See what is gaining attention in your market" },
              { label: "Payn score", desc: "Earn points as you research and engage with products" },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] bg-bg-surface px-5 py-5">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  // --- Signed in, onboarding not done: show inline, don't block ---
  const needsOnboarding = !profile?.onboarding_completed;

  // === RENDER FUNCTIONS ===

  const renderSummary = () => (
    <section className="rounded-[30px] border border-line bg-white p-5 shadow-subtle sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Summary</p>
          <h1 className="mt-3 text-h2 text-ink">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Your product workspace across loans, cards, transfers, exchange, insurance, and investments.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Tag tone="success">{marketLabel}</Tag>
            {userLabel ? <Tag tone="muted">{userLabel}</Tag> : null}
            {(profile?.selected_categories ?? []).slice(0, 3).map((cat) => (
              <Tag key={cat} tone="blue">{normalizeDisplayText(cat)}</Tag>
            ))}
            {insightsLoading ? (
              <Tag tone="muted">Loading insights...</Tag>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={getDashboardHref("explore" as DashboardView)} className={buttonStyles({ variant: "primary", size: "md" })}>
              Explore offers
            </Link>
            <Link href={getDashboardHref("saved")} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open saved
            </Link>
            <Link href={getDashboardHref("profile")} className={buttonStyles({ variant: "ghost", size: "md" })}>
              View profile
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Payn score</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{insights?.loyalty.score ?? 0}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Available products</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{allOffers.length}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Focus market</p>
            <p className="mt-2 text-lg font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">Profile</p>
            <p className="mt-2 text-lg font-bold text-ink">{userLabel ?? "Account"}</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderOverview = () => {
    const recommended = insights
      ? insights.recommended
      : allOffers.slice(0, 6).map((offer) => ({
          offer,
          activityScore: 0,
          saveCount: 0,
          providerClickCount: 0,
          offerViewCount: 0,
        }));

    return (
      <div className="grid gap-5">
        {needsOnboarding ? (
          <SectionCard
            eyebrow="Setup"
            title="Complete your profile to unlock personalized recommendations"
          >
            <UserTypeOnboardingCard />
          </SectionCard>
        ) : null}

        {insights ? (
          <MarketSnapshot insights={insights} />
        ) : (
          <SectionCard
            eyebrow="Market snapshot"
            title={`${marketLabel} marketplace`}
            description={`${allOffers.length} products available from ${getUniqueProviders(allOffers).length} providers across 6 categories.`}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {(["loans", "cards", "transfers", "exchange", "insurance", "investments"] as MarketplaceCategory[]).map((cat) => {
                const count = getCategoryOffers(dashboardMarket, cat).length;
                return (
                  <Link
                    key={cat}
                    href={getDashboardHref(cat)}
                    className="rounded-[24px] bg-bg-surface px-5 py-5 transition-colors hover:bg-bg-overlay"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      {categoryLabels[cat]}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-ink">{count}</p>
                    <p className="mt-1 text-xs text-ink-tertiary">products</p>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        )}

        <SectionCard
          eyebrow="Recommended"
          title="Top products in your market"
          action={
            <Link href={getDashboardHref("explore" as DashboardView)} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Explore more
            </Link>
          }
        >
          <OfferTileGrid
            items={recommended}
            emptyTitle="No recommendations yet"
            emptyDescription="Recommendations appear once your profile and market create enough signal."
          />
        </SectionCard>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            eyebrow="Saved / tracking"
            title="Your saved products and alerts"
          >
            {insights ? (
              <div className="grid gap-5">
                <SavedOffersGrid offers={insights.savedOffers.slice(0, 4)} insightMap={insightMap} />
                {alerts.length > 0 ? <AlertsList alerts={alerts} /> : null}
              </div>
            ) : (
              <EmptyState
                title="Start building your shortlist"
                description="Save products from Explore to track and compare them here."
                href={getDashboardHref("explore" as DashboardView)}
                cta="Browse offers"
              />
            )}
          </SectionCard>

          <div className="grid gap-5">
            <SectionCard
              eyebrow="Trends"
              title="What is gaining attention"
            >
              {insights && insights.trendingInMarket.length > 0 ? (
                <OfferTileGrid
                  items={insights.trendingInMarket.slice(0, 3)}
                  emptyTitle="No trends yet"
                  emptyDescription="Trends appear as activity builds."
                  href={getDashboardHref("trends")}
                  cta="Open trends"
                />
              ) : (
                <div className="grid gap-3">
                  {allOffers.slice(0, 3).map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/offers/${offer.slug}`}
                      className="flex items-center justify-between rounded-[20px] bg-bg-surface px-4 py-3 transition-colors hover:bg-bg-overlay"
                    >
                      <div className="flex items-center gap-3">
                        <ProviderLogo providerName={offer.providerName} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-ink">{offer.title}</p>
                          <p className="mt-0.5 text-xs text-ink-tertiary">{offer.providerName}</p>
                        </div>
                      </div>
                      <Tag tone="muted">{categoryLabels[offer.category]}</Tag>
                    </Link>
                  ))}
                </div>
              )}
            </SectionCard>

            {insights ? (
              <RewardsBlock insights={insights} />
            ) : (
              <SectionCard eyebrow="Rewards" title="Payn score">
                <div className="rounded-[24px] bg-black px-6 py-6 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Your Payn score</p>
                  <p className="mt-3 text-5xl font-bold tracking-tight">0</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    Save offers and click through to providers to earn points.
                  </p>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryView = (category: MarketplaceCategory) => {
    const offers = getCategoryOffers(dashboardMarket, category);
    const providers = getUniqueProviders(offers);
    const savedInCategory = insights?.savedOffers.filter((o) => o.category === category) ?? [];

    // If insights exist, try to get insight-enhanced offers
    const insightOffers = insights
      ? mergeInsights(
          insights.recommended.filter((i) => i.offer.category === category),
          insights.bestValueToday.filter((i) => i.offer.category === category),
          insights.trendingInMarket.filter((i) => i.offer.category === category),
        )
      : [];

    const displayOffers = insightOffers.length > 0
      ? insightOffers
      : offers.slice(0, 6).map((offer) => ({
          offer,
          activityScore: 0,
          saveCount: 0,
          providerClickCount: 0,
          offerViewCount: 0,
        }));

    return (
      <div className="grid gap-5">
        <SectionCard
          eyebrow={categoryLabels[category]}
          title={`${categoryLabels[category]} workspace`}
          action={
            <Link href={getDashboardHref("explore" as DashboardView)} className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open Explore
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Available offers</p>
              <p className="mt-2 text-2xl font-bold text-ink">{offers.length}</p>
            </div>
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Providers</p>
              <p className="mt-2 text-2xl font-bold text-ink">{providers.length}</p>
            </div>
            <div className="rounded-[24px] bg-bg-surface px-5 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Saved</p>
              <p className="mt-2 text-2xl font-bold text-ink">{savedInCategory.length}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Recommended"
          title={`Best ${categoryLabels[category].toLowerCase()} products for your profile`}
        >
          <OfferTileGrid
            items={displayOffers}
            emptyTitle={`No ${categoryLabels[category].toLowerCase()} offers available`}
            emptyDescription="Check back soon as more offers become available in this category."
          />
        </SectionCard>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            eyebrow="Tracking"
            title={`Saved ${categoryLabels[category].toLowerCase()}`}
          >
            {savedInCategory.length > 0 ? (
              <SavedOffersGrid offers={savedInCategory} insightMap={insightMap} />
            ) : (
              <EmptyState
                title={`No saved ${categoryLabels[category].toLowerCase()} yet`}
                description={`Save ${categoryLabels[category].toLowerCase()} products from Explore to track them here.`}
                href={getDashboardHref("explore" as DashboardView)}
                cta="Browse offers"
              />
            )}
          </SectionCard>

          <SectionCard
            eyebrow="Providers"
            title={`${categoryLabels[category]} providers`}
          >
            <div className="grid gap-3">
              {providers.slice(0, 6).map((name) => (
                <div key={name} className="flex items-center gap-3 rounded-[20px] bg-bg-surface px-4 py-3">
                  <ProviderLogo providerName={name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{name}</p>
                    <p className="mt-0.5 text-xs text-ink-tertiary">
                      {offers.filter((o) => o.providerName === name).length} products
                    </p>
                  </div>
                </div>
              ))}
              {providers.length === 0 ? (
                <p className="text-sm text-ink-secondary">No providers available in this category for your market.</p>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  const renderSavedView = () => (
    <div className="grid gap-5">
      <SectionCard
        eyebrow="Saved"
        title="Your tracked products"
      >
        {insights && insights.savedOffers.length > 0 ? (
          <SavedOffersGrid offers={insights.savedOffers} insightMap={insightMap} />
        ) : (
          <EmptyState
            title="No saved offers yet"
            description="Save products from Explore to build your shortlist here."
            href={getDashboardHref("explore" as DashboardView)}
            cta="Go to Explore"
          />
        )}
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard eyebrow="Watched" title="Recently viewed">
          {insights && insights.watchedOffers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.watchedOffers.map((offer) => (
                <DashboardOfferTile key={offer.id} offer={offer} insight={insightMap.get(offer.id)} eyebrow="Viewed" />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recently viewed offers"
              description="Open an offer detail page while signed in and it will appear here."
              href={getDashboardHref("explore" as DashboardView)}
              cta="Browse offers"
            />
          )}
        </SectionCard>

        <SectionCard eyebrow="Alerts" title="What needs attention">
          <AlertsList alerts={alerts} />
        </SectionCard>
      </div>
    </div>
  );

  const renderTrendsView = () => (
    <div className="grid gap-5">
      {insights ? (
        <MarketSnapshot insights={insights} />
      ) : (
        <SectionCard
          eyebrow="Market snapshot"
          title={`${marketLabel} marketplace`}
          description={`${allOffers.length} products from ${getUniqueProviders(allOffers).length} providers.`}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {(["loans", "cards", "transfers"] as MarketplaceCategory[]).map((cat) => (
              <div key={cat} className="rounded-[24px] bg-bg-surface px-5 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{categoryLabels[cat]}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{getCategoryOffers(dashboardMarket, cat).length}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard eyebrow="Trending products" title="Offers gaining attention">
        {insights && insights.trendingInMarket.length > 0 ? (
          <OfferTileGrid
            items={insights.trendingInMarket}
            emptyTitle="No trends yet"
            emptyDescription="Trends appear as activity builds."
          />
        ) : (
          <CatalogOfferGrid
            offers={allOffers.slice(0, 6)}
            emptyTitle="No offers available"
            emptyDescription="Check back soon."
          />
        )}
      </SectionCard>

      <SectionCard eyebrow="Top providers" title="Most active providers in your market">
        <div className="grid gap-3 sm:grid-cols-2">
          {getUniqueProviders(allOffers).slice(0, 8).map((name) => (
            <div key={name} className="flex items-center gap-3 rounded-[20px] bg-bg-surface px-4 py-3">
              <ProviderLogo providerName={name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-ink">{name}</p>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {allOffers.filter((o) => o.providerName === name).length} products
                </p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );

  const renderRewardsView = () => (
    <div className="grid gap-5">
      {insights ? (
        <RewardsBlock insights={insights} />
      ) : (
        <SectionCard eyebrow="Rewards" title="Payn score and engagement">
          <div className="rounded-[24px] bg-black px-6 py-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Your Payn score</p>
            <p className="mt-3 text-5xl font-bold tracking-tight">0</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Save offers and click through to providers to start earning points.
            </p>
          </div>
        </SectionCard>
      )}

      <SectionCard
        eyebrow="How to earn"
        title="A simple engagement system"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Save an offer</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Add products to your shortlist as you compare options across categories.
            </p>
            <Tag tone="success" className="mt-4">+1 point</Tag>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Click through to provider</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Continue to a provider once you are ready to review full terms outside Payn.
            </p>
            <Tag tone="blue" className="mt-4">+2 points</Tag>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-sm font-semibold text-ink">Research your market</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              Views improve recommendations but do not inflate loyalty points on their own.
            </p>
            <Tag tone="muted" className="mt-4">Recommendation signal</Tag>
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const renderProfileView = () => (
    <div className="grid gap-5">
      <SectionCard
        eyebrow="Profile"
        title="Your dashboard setup"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Email</p>
            <p className="mt-2 text-sm font-bold text-ink">{user.email ?? "Not set"}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">User type</p>
            <p className="mt-2 text-lg font-bold text-ink">{userLabel ?? "Not set"}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Home market</p>
            <p className="mt-2 text-lg font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[24px] bg-bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Categories</p>
            <p className="mt-2 text-lg font-bold text-ink">
              {profile?.selected_categories?.length || dashboardCategories.length}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Preferences"
        title="Your preferences"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Country</p>
            <p className="mt-2 text-sm font-bold text-ink">{marketLabel}</p>
            <p className="mt-1 text-xs text-ink-tertiary">Affects which products and providers are shown</p>
          </div>
          <div className="rounded-[24px] border border-line bg-bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Profile type</p>
            <p className="mt-2 text-sm font-bold text-ink">{userLabel ?? "Personal"}</p>
            <p className="mt-1 text-xs text-ink-tertiary">Shapes recommendations and ranking logic</p>
          </div>
          <div className="rounded-[24px] border border-line bg-bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Interests</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {((profile?.selected_categories ?? []).length > 0
                ? profile!.selected_categories
                : dashboardCategories
              ).map((cat) => (
                <Tag key={cat} tone="blue">{normalizeDisplayText(cat)}</Tag>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-line bg-bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">Use cases</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(profile?.goals ?? []).length > 0 ? (
                profile!.goals.map((goal) => (
                  <Tag key={goal} tone="muted">{normalizeDisplayText(goal.replace(/_/g, " "))}</Tag>
                ))
              ) : (
                <p className="text-xs text-ink-secondary">No use cases set yet</p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Account type"
        title="Change how you use Payn"
      >
        <UserTypeOnboardingCard
          title="Update your profile type"
          description="Changing your type will adjust recommendations, trends, and category ranking."
          completeLabel="Save changes"
        />
      </SectionCard>
    </div>
  );

  const renderExploreView = () => (
    <MarketplaceExplorer
      offers={marketplaceOffers}
      initialMarket={dashboardMarket}
      initialCategory="all"
      mode="home"
    />
  );

  // === VIEW ROUTING ===
  let body: React.ReactNode;

  if (activeView === "explore") {
    body = renderExploreView();
  } else if (activeCategory) {
    body = renderCategoryView(activeCategory);
  } else if (activeView === "saved") {
    body = renderSavedView();
  } else if (activeView === "trends") {
    body = renderTrendsView();
  } else if (activeView === "rewards") {
    body = renderRewardsView();
  } else if (activeView === "profile") {
    body = renderProfileView();
  } else {
    body = renderOverview();
  }

  return (
    <div className="grid gap-5">
      {renderSummary()}
      {body}
    </div>
  );
}
