"use client";

import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { DashboardMarketPulseOverview } from "@/components/dashboard-market-pulse-overview";
import { DashboardOfferTile } from "@/components/dashboard-offer-tile";
import { DashboardMetricCard, DashboardSectionCard } from "@/components/dashboard-primitives";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import type { DashboardOfferInsight } from "@/lib/dashboard";
import { getDashboardWorkspaceCopy } from "@/lib/dashboard-workspace-copy";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferHref } from "@/lib/marketplace";
import { getUiCopy } from "@/lib/ui-copy";

function CompactOfferList({
  locale,
  offers,
  emptyLabel,
}: {
  locale: MarketplaceLocale;
  offers: MarketplaceOffer[];
  emptyLabel: string;
}) {
  const dictionary = getDictionary(locale);

  if (offers.length === 0) {
    return <p className="text-sm leading-relaxed text-ink-secondary">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-2.5">
      {offers.map((offer) => (
        <Link
          key={offer.id}
          href={localePath(locale, getOfferHref(offer))}
          className="flex items-center justify-between rounded-[18px] border border-line bg-white px-4 py-3 transition-colors hover:bg-bg-surface"
        >
          <div className="flex min-w-0 items-center gap-3">
            <ProviderLogo providerName={offer.providerName} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{offer.title}</p>
              <p className="mt-0.5 truncate text-xs text-ink-tertiary">{offer.providerName}</p>
            </div>
          </div>
          <Tag tone="muted">{dictionary.categories[offer.category]}</Tag>
        </Link>
      ))}
    </div>
  );
}

export function DashboardOverviewWorkspace({
  locale,
  username,
  userLabel,
  marketLabel,
  allOfferCount,
  providerCount,
  savedCount,
  compareReadyCount,
  topPicks,
  savedOffers,
  watchedOffers,
  categoryCounts,
  profileHref,
  exploreHref,
  investmentsHref,
  categoryHref,
}: {
  locale: MarketplaceLocale;
  username: string;
  userLabel: string | null;
  marketLabel: string;
  allOfferCount: number;
  providerCount: number;
  savedCount: number;
  compareReadyCount: number;
  topPicks: DashboardOfferInsight[];
  savedOffers: MarketplaceOffer[];
  watchedOffers: MarketplaceOffer[];
  categoryCounts: Record<MarketplaceCategory, number>;
  profileHref: string;
  exploreHref: string;
  investmentsHref: string;
  categoryHref: (category: MarketplaceCategory) => string;
}) {
  const dictionary = getDictionary(locale);
  const uiCopy = getUiCopy(locale);
  const copy = getDashboardWorkspaceCopy(locale);

  return (
    <div className="grid gap-5">
      <DashboardSectionCard
        eyebrow={uiCopy.dashboard.summaryEyebrow}
        title={`${uiCopy.dashboard.welcomeBack}, ${username}`}
        description={copy.overviewDescription}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={exploreHref} className={buttonStyles({ variant: "primary", size: "sm" })}>
              {uiCopy.dashboard.openExplore}
            </Link>
            <Link href={profileHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              {uiCopy.dashboard.openProfile}
            </Link>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-line bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {copy.accountSummaryTitle}
            </p>
            <p className="mt-2 text-base font-bold text-ink">{username}</p>
            <Link
              href={profileHref}
              className="mt-2 inline-flex text-xs font-semibold text-ink-tertiary transition-colors hover:text-ink"
            >
              {uiCopy.common.edit}
            </Link>
          </div>
          <div className="rounded-[22px] border border-line bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {uiCopy.dashboard.marketLabel}
            </p>
            <p className="mt-2 text-base font-bold text-ink">{marketLabel}</p>
          </div>
          <div className="rounded-[22px] border border-line bg-bg-surface px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {uiCopy.dashboard.profileTypeTitle}
            </p>
            <p className="mt-2 text-base font-bold text-ink">{userLabel ?? "-"}</p>
          </div>
        </div>
      </DashboardSectionCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          label={uiCopy.dashboard.stats.products}
          value={allOfferCount}
          hint={uiCopy.dashboard.categoriesTitle}
        />
        <DashboardMetricCard
          label={uiCopy.dashboard.stats.providers}
          value={providerCount}
          hint={uiCopy.dashboard.providersTitle}
        />
        <DashboardMetricCard
          label={uiCopy.dashboard.stats.saved}
          value={savedCount}
          hint={uiCopy.dashboard.savedTitle}
        />
        <DashboardMetricCard
          label={uiCopy.common.compare}
          value={compareReadyCount}
          hint={copy.compareReadyLabel}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <DashboardSectionCard
          eyebrow={uiCopy.dashboard.overviewRecommendedEyebrow}
          title={uiCopy.dashboard.overviewRecommendedTitle}
          description={copy.topPicksDescription}
          action={
            <Link href={exploreHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              {uiCopy.dashboard.seeAll}
            </Link>
          }
        >
          <div className="grid gap-3 md:grid-cols-2">
            {topPicks.map((item) => (
              <DashboardOfferTile
                key={item.offer.id}
                offer={item.offer}
                insight={item}
                eyebrow={dictionary.categories[item.offer.category]}
              />
            ))}
          </div>
        </DashboardSectionCard>

        <DashboardMarketPulseOverview locale={locale} investmentsHref={investmentsHref} />
      </div>

      <DashboardSectionCard
        eyebrow={copy.continueEyebrow}
        title={copy.continueTitle}
        description={copy.continueDescription}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-[24px] bg-bg-surface px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">{uiCopy.dashboard.savedTitle}</p>
              <Tag tone="muted">{savedCount}</Tag>
            </div>
            <div className="mt-4">
              <CompactOfferList
                locale={locale}
                offers={savedOffers}
                emptyLabel={uiCopy.dashboard.noSavedDescription}
              />
            </div>
          </div>

          <div className="rounded-[24px] bg-bg-surface px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-ink">{copy.recentlyViewedTitle}</p>
              <Tag tone="muted">{watchedOffers.length}</Tag>
            </div>
            <div className="mt-4">
              <CompactOfferList
                locale={locale}
                offers={watchedOffers}
                emptyLabel={copy.continueDescription}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-white px-4 py-4">
            <p className="text-sm font-bold text-ink">{copy.compareTrayTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {copy.compareTrayDescription}
            </p>
            <div className="mt-5 rounded-[20px] bg-bg-surface px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.compareReadyLabel}
              </p>
              <p className="mt-2 text-3xl font-bold text-ink">{compareReadyCount}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">
                {savedCount > 0
                  ? `${savedCount} ${uiCopy.common.saved.toLowerCase()}`
                  : uiCopy.dashboard.noSavedDescription}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={exploreHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
                {uiCopy.dashboard.openExplore}
              </Link>
              <Link href={investmentsHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
                {copy.openInvestmentView}
              </Link>
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        eyebrow={uiCopy.dashboard.categoriesEyebrow}
        title={uiCopy.dashboard.categoriesTitle}
        description={copy.quickAccessDescription}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(
            [
              "loans",
              "cards",
              "transfers",
              "exchange",
              "insurance",
              "investments",
            ] as MarketplaceCategory[]
          ).map((category) => (
            <Link
              key={category}
              href={categoryHref(category)}
              className="flex items-center justify-between rounded-[22px] border border-line bg-bg-surface px-4 py-4 transition-colors hover:border-line-strong hover:bg-white"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{dictionary.categories[category]}</p>
                <p className="mt-1 text-xs text-ink-tertiary">
                  {categoryCounts[category]} {uiCopy.common.products}
                </p>
              </div>
              <span className="text-lg text-ink-tertiary">→</span>
            </Link>
          ))}
        </div>
      </DashboardSectionCard>
    </div>
  );
}
