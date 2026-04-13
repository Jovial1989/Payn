"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { InvestmentIntelligenceBlock } from "@/components/investment-intelligence-block";
import {
  normalizeMarketIntelligenceAsset,
  type MarketIntelligenceAssetId,
} from "@/lib/market-intelligence";
import {
  readPersistedProductWorkspaceState,
  writePersistedProductWorkspaceState,
} from "@/lib/product-workspace-state";

export function DashboardInvestmentsWorkspace({
  locale,
  userId,
  marketLabel,
  dashboardHref,
  discoverHref,
  initialAssetId,
  offers,
}: {
  locale: MarketplaceLocale;
  userId?: string | null;
  marketLabel: string;
  dashboardHref?: string;
  discoverHref: string;
  initialAssetId?: MarketIntelligenceAssetId;
  offers: MarketplaceOffer[];
}) {
  const copy =
    locale === "de"
      ? {
          eyebrow: "Investment-Workspace",
          title: "Erst den Markt-Kontext vergleichen, dann die passende Plattform wählen",
          description:
            `Wechsle Asset oder Zeitraum und Payn aktualisiert Chart, Puls, Trendsignale und Anbieter-Ranking für ${marketLabel.toLowerCase()} in einem Workspace.`,
          backToDashboard: "Zurück zum Dashboard",
          backToDiscover: "Zurück zu Discover",
        }
      : {
          eyebrow: "Investments workspace",
          title: "Compare market context first, then choose the right platform",
          description:
            `Change asset or timeframe and Payn updates the chart, pulse, trend signals, and provider ranking for ${marketLabel.toLowerCase()} in one workspace.`,
          backToDashboard: "Back to dashboard",
          backToDiscover: "Back to Discover",
        };
  const workspaceStateKey = "product-investments";
  const [workspaceStateLoaded, setWorkspaceStateLoaded] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<MarketIntelligenceAssetId>(
    normalizeMarketIntelligenceAsset(initialAssetId),
  );

  useEffect(() => {
    const persistedState = readPersistedProductWorkspaceState(
      workspaceStateKey,
      { selectedAssetId: normalizeMarketIntelligenceAsset(initialAssetId) },
      userId,
    );

    setSelectedAssetId(
      normalizeMarketIntelligenceAsset(
        persistedState.selectedAssetId as MarketIntelligenceAssetId | undefined,
      ),
    );
    setWorkspaceStateLoaded(true);
  }, [initialAssetId, userId]);

  useEffect(() => {
    if (!workspaceStateLoaded) {
      return;
    }

    writePersistedProductWorkspaceState(
      workspaceStateKey,
      { selectedAssetId },
      userId,
    );
  }, [selectedAssetId, userId, workspaceStateLoaded]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-[30px] font-bold tracking-[-0.05em] text-ink sm:text-[34px]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            {copy.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dashboardHref ? (
            <Link href={dashboardHref} className={buttonStyles({ variant: "ghost", size: "sm" })}>
              {copy.backToDashboard}
            </Link>
          ) : null}
          <Link href={discoverHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
            {copy.backToDiscover}
          </Link>
        </div>
      </div>

      <InvestmentIntelligenceBlock
        locale={locale}
        assetId={selectedAssetId}
        onAssetChange={setSelectedAssetId}
        providerMatches={undefined}
        marketLabel={marketLabel}
        offers={offers}
      />
    </div>
  );
}
