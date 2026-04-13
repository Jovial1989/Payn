"use client";

import type { MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardSectionCard } from "@/components/dashboard-primitives";
import { Tag } from "@/components/tag";
import { getDashboardDecisionCopy } from "@/lib/dashboard-decision-copy";
import type { MarketIntelligencePayload } from "@/lib/market-intelligence";
import { getDashboardWorkspaceCopy } from "@/lib/dashboard-workspace-copy";

const pulseAssets = ["btc", "eth", "spy", "eustocks", "gold"] as const;

function formatValue(locale: MarketplaceLocale, value: number, currency: string) {
  if (currency === "USD") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value > 10 ? 2 : 4,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value > 10 ? 2 : 4,
  }).format(value);
}

function formatChange(locale: MarketplaceLocale, value: number) {
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));

  return `${value >= 0 ? "+" : "-"}${formatted}%`;
}

function Sparkline({
  points,
  direction,
}: {
  points: MarketIntelligencePayload["points"];
  direction: MarketIntelligencePayload["direction"];
}) {
  if (points.length === 0) {
    return <div className="h-10 w-20 rounded-full bg-white/70" />;
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 80;
      const y = 32 - ((point.value - min) / spread) * 24;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 80 32" className="h-10 w-20" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={direction === "down" ? "#C2410C" : "#067647"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DashboardMarketPulseOverview({
  locale,
  investmentsHref,
}: {
  locale: MarketplaceLocale;
  investmentsHref: string;
}) {
  const [items, setItems] = useState<MarketIntelligencePayload[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = getDashboardWorkspaceCopy(locale);
  const decisionCopy = getDashboardDecisionCopy(locale);
  const investmentsAssetHref = (assetId: string) =>
    investmentsHref.includes("?")
      ? `${investmentsHref}&asset=${assetId}`
      : `${investmentsHref}?asset=${assetId}`;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const responses = await Promise.all(
          pulseAssets.map(async (asset) => {
            const params = new URLSearchParams({
              asset,
              timeframe: "1W",
              locale,
            });

            const response = await fetch(`/api/v1/market-intelligence?${params.toString()}`, {
              cache: "no-store",
            });

            if (!response.ok) {
              return null;
            }

            return (await response.json()) as MarketIntelligencePayload;
          }),
        );

        if (!cancelled) {
          setItems(
            responses.filter(
              (item): item is MarketIntelligencePayload => item !== null && !item.unavailable,
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <DashboardSectionCard
      eyebrow={copy.marketPulseEyebrow}
      title={copy.marketPulseTitle}
      description={copy.marketPulseDescription}
      action={
        <Link href={investmentsHref} className={buttonStyles({ variant: "secondary", size: "sm" })}>
          {copy.openInvestmentView}
        </Link>
      }
    >
      {loading ? (
        <div className="grid gap-3">
          {pulseAssets.map((asset) => (
            <div key={asset} className="h-[68px] animate-pulse rounded-[20px] bg-bg-surface" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link
              key={item.assetId}
              href={investmentsAssetHref(item.assetId)}
              className="flex flex-col gap-3 rounded-[20px] border border-line bg-bg-surface px-4 py-3 transition-all hover:border-line-strong hover:bg-white sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Sparkline points={item.points.slice(-14)} direction={item.direction} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.assetLabel}</p>
                  <p className="mt-1 text-xs text-ink-tertiary">
                    {item.sourceLabel} · {decisionCopy.expandAsset}
                  </p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-bold text-ink">
                  {formatValue(locale, item.latestPrice, item.currency)}
                </p>
                <div className="mt-1 flex items-center gap-2 sm:justify-end">
                  <span
                    className={clsx(
                      "text-xs font-semibold",
                      item.direction === "down" ? "text-[#C2410C]" : "text-[#067647]",
                    )}
                  >
                    {formatChange(locale, item.changePct)}
                  </span>
                  <Tag tone={item.stale ? "muted" : "blue"}>{item.statusLabel}</Tag>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-line bg-white px-4 py-4 text-sm text-ink-secondary">
          {copy.marketPulseFallback}
        </div>
      )}
    </DashboardSectionCard>
  );
}
