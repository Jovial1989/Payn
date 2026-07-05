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
import { formatMarketName } from "@/lib/market-name";

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
            `Wechsle Asset oder Zeitraum und Payn aktualisiert Chart, Puls, Trendsignale und Anbieter-Ranking für ${formatMarketName(marketLabel)} in einem Workspace.`,
          backToDashboard: "Zurück zum Dashboard",
          backToDiscover: "Zurück zu Discover",
        }
      : {
          eyebrow: "Investments workspace",
          title: "Compare market context first, then choose the right platform",
          description:
            `Change asset or timeframe and Payn updates the chart, pulse, trend signals, and provider ranking for ${formatMarketName(marketLabel)} in one workspace.`,
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

  // Refine results — filters the provider ranking under the chart (the chart
  // itself is asset-driven and stays put). Open on desktop, collapsed on
  // mobile (opens on lg+ after mount) so the chart + platforms aren't pushed
  // down by the filter block on small screens.
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      setFiltersOpen(true);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [commission, setCommission] = useState("any");
  const [assetFocus, setAssetFocus] = useState("any");
  const [savingsPlan, setSavingsPlan] = useState("any");

  const refineCopy =
    locale === "de"
      ? { refine: "Ergebnisse verfeinern", search: "Suche", searchPh: "Plattform suchen", commission: "Provision", any: "Beliebig", free: "Provisionsfrei", asset: "Anlage", stocks: "Aktien", etfs: "ETFs", crypto: "Krypto", plan: "Sparplan", planYes: "Sparplan verfügbar" }
      : { refine: "Refine results", search: "Search", searchPh: "Search a platform", commission: "Commission", any: "Any", free: "Commission-free", asset: "Asset", stocks: "Stocks", etfs: "ETFs", crypto: "Crypto", plan: "Savings plan", planYes: "Has savings plan" };

  const filteredOffers = offers.filter((offer) => {
    const text = `${offer.providerName} ${offer.title} ${offer.subtitle} ${offer.bestFor.join(" ")} ${offer.metrics
      .map((m) => `${m.label} ${m.value}`)
      .join(" ")}`.toLowerCase();
    if (searchQuery.trim() && !text.includes(searchQuery.trim().toLowerCase())) return false;
    if (commission === "free" && !/commission[- ]?free|free trades|zero commission|no commission|€0|0\s?%/.test(text)) return false;
    if (assetFocus !== "any" && !text.includes(assetFocus === "etfs" ? "etf" : assetFocus)) return false;
    if (savingsPlan === "yes" && !/savings plan|sparplan|recurring/.test(text)) return false;
    return true;
  });

  const refineFieldClass =
    "h-[52px] w-full appearance-none rounded-[16px] border border-line bg-white px-4 text-sm font-medium text-ink outline-none transition-colors focus:border-accent-emerald/40";

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

      <section>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-accent-emerald-strong"
        >
          <span>{refineCopy.refine}</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {filtersOpen ? (
          <div className="mt-4 rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{refineCopy.search}</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={refineCopy.searchPh}
                  className={refineFieldClass}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{refineCopy.commission}</span>
                <select value={commission} onChange={(event) => setCommission(event.target.value)} className={refineFieldClass}>
                  <option value="any">{refineCopy.any}</option>
                  <option value="free">{refineCopy.free}</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{refineCopy.asset}</span>
                <select value={assetFocus} onChange={(event) => setAssetFocus(event.target.value)} className={refineFieldClass}>
                  <option value="any">{refineCopy.any}</option>
                  <option value="stocks">{refineCopy.stocks}</option>
                  <option value="etfs">{refineCopy.etfs}</option>
                  <option value="crypto">{refineCopy.crypto}</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">{refineCopy.plan}</span>
                <select value={savingsPlan} onChange={(event) => setSavingsPlan(event.target.value)} className={refineFieldClass}>
                  <option value="any">{refineCopy.any}</option>
                  <option value="yes">{refineCopy.planYes}</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </section>

      <InvestmentIntelligenceBlock
        locale={locale}
        assetId={selectedAssetId}
        onAssetChange={setSelectedAssetId}
        providerMatches={undefined}
        marketLabel={marketLabel}
        offers={filteredOffers}
      />
    </div>
  );
}
