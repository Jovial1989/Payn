"use client";

import type { MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardSectionCard } from "@/components/dashboard-primitives";
import { Tag } from "@/components/tag";
import type { MarketIntelligencePayload } from "@/lib/market-intelligence";
import { getDashboardWorkspaceCopy } from "@/lib/dashboard-workspace-copy";

const pulseAssets = ["btc", "eurusd", "spy", "gold"] as const;

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
          setItems(responses.filter((item): item is MarketIntelligencePayload => item !== null));
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
            <div
              key={item.assetId}
              className="flex items-center justify-between rounded-[20px] border border-line bg-bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{item.assetLabel}</p>
                <p className="mt-1 text-xs text-ink-tertiary">{item.sourceLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-ink">
                  {formatValue(locale, item.latestPrice, item.currency)}
                </p>
                <div className="mt-1 flex items-center justify-end gap-2">
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
            </div>
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

