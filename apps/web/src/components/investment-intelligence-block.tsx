"use client";

import type { MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { LightweightMarketChart } from "@/components/lightweight-market-chart";
import { ProviderLogo } from "@/components/provider-logo";
import { Tag } from "@/components/tag";
import {
  getMarketIntelligenceCopy,
} from "@/lib/market-intelligence-copy";
import {
  marketIntelligenceAssetOptions,
  marketIntelligenceTimeframeOptions,
  type MarketIntelligenceAssetId,
  type MarketIntelligencePayload,
  type MarketIntelligenceTimeframe,
} from "@/lib/market-intelligence";

function formatPrice(value: number, locale: MarketplaceLocale, currency: string) {
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

export function InvestmentIntelligenceBlock({
  locale,
}: {
  locale: MarketplaceLocale;
}) {
  const [assetId, setAssetId] = useState<MarketIntelligenceAssetId>("btc");
  const [timeframe, setTimeframe] = useState<MarketIntelligenceTimeframe>("1W");
  const [payload, setPayload] = useState<MarketIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const copy = getMarketIntelligenceCopy(locale);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          asset: assetId,
          timeframe,
          locale,
        });

        const response = await fetch(`/api/v1/market-intelligence?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const nextPayload = (await response.json()) as MarketIntelligencePayload;

        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch {
        if (!cancelled) {
          setPayload(null);
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
  }, [assetId, locale, timeframe]);

  return (
    <section className="grid gap-4 rounded-[28px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-[28px] font-bold tracking-[-0.04em] text-ink sm:text-[32px]">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-secondary">{copy.subtitle}</p>
        </div>
        {payload ? (
          <div className="rounded-[24px] border border-[#ECECEC] bg-[#F9F9FA] px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {copy.pulseTitle}
            </p>
            <p className="mt-1 text-[24px] font-bold tracking-[-0.04em] text-ink">
              {formatPrice(payload.latestPrice, locale, payload.currency)}
            </p>
            <p
              className={clsx(
                "mt-1 text-sm font-semibold",
                payload.direction === "down" ? "text-[#C2410C]" : "text-[#067647]",
              )}
            >
              {formatChange(locale, payload.changePct)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {marketIntelligenceAssetOptions.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setAssetId(asset.id)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                assetId === asset.id
                  ? "border-black bg-black text-white"
                  : "border-[#E7E7E9] bg-[#F7F7F8] text-ink-secondary hover:border-black/10 hover:text-ink",
              )}
            >
              {asset.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {marketIntelligenceTimeframeOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeframe(item.id)}
              className={clsx(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                timeframe === item.id
                  ? "bg-[#111111] text-white"
                  : "bg-[#F5F5F7] text-ink-secondary hover:text-ink",
              )}
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[26px] border border-[#ECECEC] bg-white p-4 sm:p-5">
          {loading && !payload ? (
            <div className="grid h-[280px] place-items-center rounded-[22px] bg-[#F7F7F8] text-sm text-ink-secondary">
              {copy.loading}
            </div>
          ) : payload ? (
            <>
              <LightweightMarketChart points={payload.points} direction={payload.direction} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-[#F8F8F9] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={payload.stale ? "muted" : "success"}>{payload.statusLabel}</Tag>
                  <span className="text-ink-secondary">{payload.sourceLabel}</span>
                </div>
                <span className="text-xs text-ink-tertiary">
                  {new Intl.DateTimeFormat(locale, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(payload.updatedAt))}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-tertiary">
                <span>{payload.attributionNotice}</span>
                <a
                  href={payload.attributionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink"
                >
                  {payload.attributionLabel}
                </a>
              </div>
            </>
          ) : (
            <div className="grid h-[280px] place-items-center rounded-[22px] bg-[#F7F7F8] text-sm text-ink-secondary">
              {copy.retrying}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[26px] border border-[#ECECEC] bg-[#FCFCFC] p-5">
            <div>
              <p className="text-sm font-bold text-ink">{copy.trendTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{copy.trendBody}</p>
            </div>
            <div className="mt-4 grid gap-3">
              {payload?.signals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-[20px] border border-[#EEEEF0] bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                      {signal.label}
                    </p>
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        signal.tone === "positive" && "bg-[#EAF8F1] text-[#067647]",
                        signal.tone === "neutral" && "bg-[#EEF4FF] text-[#175CD3]",
                        signal.tone === "caution" && "bg-[#FFF1E7] text-[#C2410C]",
                      )}
                    >
                      {signal.tone === "positive"
                        ? copy.valueLabels.positive
                        : signal.tone === "neutral"
                          ? copy.valueLabels.neutral
                          : copy.valueLabels.cautious}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{signal.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#ECECEC] bg-[#FCFCFC] p-5">
            <p className="text-sm font-bold text-ink">{copy.recommendationTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{copy.recommendationBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {payload?.recommendations.map((item) => (
                <Tag key={item} tone="muted" className="rounded-[999px] bg-[#F1F2F4] text-ink">
                  {item}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[26px] border border-[#ECECEC] bg-[#FCFCFC] p-5">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-ink">{copy.availableTitle}</p>
          <p className="text-sm leading-relaxed text-ink-secondary">{copy.availableBody}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {payload?.availableOn.map((provider) => (
            <div
              key={provider.providerName}
              className="rounded-[22px] border border-[#ECECEF] bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <ProviderLogo providerName={provider.providerName} size="md" muted={false} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{provider.providerName}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{provider.note}</p>
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-ink-tertiary">{provider.offerTitle}</p>
              <Link href={provider.href} className={clsx(buttonStyles({ variant: "secondary", size: "sm" }), "mt-4")}>
                {copy.providerDetails}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

