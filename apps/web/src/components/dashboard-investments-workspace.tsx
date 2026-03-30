"use client";

import type { MarketplaceLocale } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import {
  DashboardContextPill,
  DashboardEmptyState,
  DashboardMetricCard,
  DashboardSectionCard,
} from "@/components/dashboard-primitives";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";
import { OfferCard } from "@/components/offer-card";
import type { DashboardOfferInsight } from "@/lib/dashboard";
import { getDashboardWorkspaceCopy } from "@/lib/dashboard-workspace-copy";
import { getUiCopy } from "@/lib/ui-copy";

export function DashboardInvestmentsWorkspace({
  locale,
  marketLabel,
  userLabel,
  dashboardHref,
  exploreHref,
  offers,
}: {
  locale: MarketplaceLocale;
  marketLabel: string;
  userLabel: string | null;
  dashboardHref: string;
  exploreHref: string;
  offers: DashboardOfferInsight[];
}) {
  const uiCopy = getUiCopy(locale);
  const copy = getDashboardWorkspaceCopy(locale);
  const providerCount = new Set(offers.map((item) => item.offer.providerName)).size;

  return (
    <div className="grid gap-5">
      <DashboardSectionCard
        eyebrow={copy.investmentsEyebrow}
        title={copy.investmentsTitle}
        description={copy.investmentsDescription}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={dashboardHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              {copy.backToDashboard}
            </Link>
            <Link href={exploreHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
              {copy.broaderDiscovery}
            </Link>
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div>
            <div className="flex flex-wrap gap-2">
              <DashboardContextPill>{marketLabel}</DashboardContextPill>
              {userLabel ? <DashboardContextPill>{userLabel}</DashboardContextPill> : null}
              <DashboardContextPill>
                {offers.length} {uiCopy.common.products}
              </DashboardContextPill>
            </div>
            <div className="mt-4 rounded-[24px] border border-line bg-bg-surface px-5 py-4">
              <p className="text-sm font-semibold text-ink">{copy.investmentOffersTitle}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                {copy.investmentOffersDescription}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DashboardMetricCard
              label={uiCopy.dashboard.stats.providers}
              value={providerCount}
              hint={copy.investmentsEyebrow}
            />
            <DashboardMetricCard
              label={uiCopy.dashboard.stats.available}
              value={offers.length}
              hint={marketLabel}
            />
          </div>
        </div>
      </DashboardSectionCard>

      <InvestmentIntelligenceBlock locale={locale} />

      <DashboardSectionCard
        eyebrow={copy.investmentOffersEyebrow}
        title={copy.investmentOffersTitle}
        description={copy.investmentOffersDescription}
      >
        {offers.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {offers.map((item, index) => (
              <OfferCard
                key={item.offer.id}
                offer={item.offer}
                rank={index + 1}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            title={uiCopy.dashboard.noCategoryTitle}
            description={uiCopy.dashboard.noCategoryDescription}
            href={exploreHref}
            cta={uiCopy.dashboard.openExplore}
          />
        )}
      </DashboardSectionCard>
    </div>
  );
}
