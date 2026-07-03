"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useInView, animate } from "motion/react";
import { SectionNum } from "@/features/home/section-num";
import type { MarketplaceLocale } from "@payn/types";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import type { OutcomeBucketCount, ProviderInfo } from "@/features/catalog/count-by-outcome";
import { flatCategoryForBucket } from "@/features/catalog/outcomes";

// Brand colors for initials fallback — covers the most common providers in the catalogue
const FALLBACK_COLORS: Record<string, string> = {
  airwallex: "#1D2B3A",
  wise: "#164B3E",
  revolut: "#2D1B69",
  "trade-republic": "#0B2B1C",
  monzo: "#FF4F40",
  starling: "#7B61FF",
  "chase-uk": "#117ACA",
  bbva: "#004481",
  ing: "#FF6200",
  boursorama: "#E30613",
  "younited-credit": "#001E5A",
  "intesa-sanpaolo": "#008C45",
  unicredit: "#E2001A",
  tide: "#00C7B5",
  qonto: "#4A5568",
  kraken: "#5741D9",
  etoro: "#6541F2",
  binance: "#F0B90B",
  n26: "#14202A",
  klarna: "#FFB3C7",
  sumup: "#00A2E8",
  wallester: "#1A1446",
  default: "#94A3B8",
};

function providerBg(slug: string): string {
  return FALLBACK_COLORS[slug] ?? FALLBACK_COLORS.default;
}

// STRAT.6 — which "browse by type" buckets show in Business mode. The
// grid is consumer-centric by default; Business focuses on the buckets a
// company actually uses (and drops Saving / Investing / Family / Insurance).
const BUSINESS_BUCKET_SLUGS = new Set([
  "for-business",
  "sending-money",
  "bank-accounts",
  "cards",
  "borrowing",
]);

// ─── Card motion variants ──────────────────────────────────────────────────────
const cardVariants = {
  rest:      { y: 0,  boxShadow: "0 0px 0px rgba(15,23,32,0)", borderColor: "rgba(17,24,39,0.08)" },
  cardHover: { y: -4, boxShadow: "0 8px 24px rgba(15,23,32,0.10)", borderColor: "#10B981" },
  tap:       { scale: 0.97, y: 0 },
};
const iconVariants = {
  rest:      { scale: 1, rotate: 0 },
  cardHover: { scale: 1.2, rotate: -8 },
};

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
//
// SSR + first client paint must show the FINAL value, not 0 — otherwise the
// rendered HTML reads "0 options in Europe" to bots, screen-shotters, and
// any user whose browser is slow to hydrate, killing the trust signal.
// The count-up animation is preserved but only fires when the value changes
// AFTER initial mount (e.g. user switches country and the bucket count
// re-computes). For first-time mount we leave the static number as-is.
function AnimatedCounter({ value, shouldReduce }: { value: number; shouldReduce: boolean | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-10% 0px" });
  const [display, setDisplay] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    // No animation needed when the value hasn't actually changed since the
    // last render, or when the user prefers reduced motion, or when the
    // card isn't in view yet.
    if (shouldReduce || !isInView) {
      setDisplay(value);
      previousValue.current = value;
      return;
    }
    const from = previousValue.current;
    if (from === value) {
      // Same value as before — nothing to animate.
      return;
    }
    const controls = animate(from, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
      onComplete: () => {
        previousValue.current = value;
      },
    });
    return () => controls.stop();
  }, [isInView, value, shouldReduce]);

  return <span ref={ref}>{display}</span>;
}

function ProviderAvatar({ provider, index }: { provider: ProviderInfo; index: number }) {
  // P1.1b — Same three-tier logo resolution as ProviderLogo:
  // curated /logos/<slug>.png → Google favicon → letter avatar.
  // The bucket cards (Cards / Savings / Transfers …) now surface real
  // brand marks for providers we never hand-curated.
  const [broken, setBroken] = useState(false);
  const faviconUrl = !provider.logoPath && provider.websiteUrl
    ? (() => {
        try {
          return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(provider.websiteUrl!).hostname)}&sz=64`;
        } catch {
          return null;
        }
      })()
    : null;
  const remoteLogo = provider.logoPath ?? faviconUrl;
  const useLetterFallback = broken || !remoteLogo;
  const isFavicon = !provider.logoPath && Boolean(faviconUrl);

  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[9px] font-bold uppercase text-white"
      style={{
        background: useLetterFallback ? providerBg(provider.slug) : "#f3f4f6",
        marginLeft: index === 0 ? 0 : -6,
        zIndex: 10 - index,
        position: "relative",
      }}
      title={provider.name}
    >
      {!useLetterFallback ? (
        isFavicon ? (
          // Favicons come from a third-party domain (Google's proxy)
          // and don't fit Next.js Image's remotePatterns config —
          // render via a plain <img> so we don't have to whitelist
          // www.google.com globally.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={remoteLogo!}
            alt={provider.name}
            width={20}
            height={20}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
            className="h-5 w-5 object-contain"
          />
        ) : (
          <Image
            src={remoteLogo!}
            alt={provider.name}
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
            onError={() => setBroken(true)}
          />
        )
      ) : (
        provider.mark.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

interface AtlasGridProps {
  country: string;
  locale: string;
  buckets: OutcomeBucketCount[];
}

export function AtlasGrid({ country, locale, buckets }: AtlasGridProps) {
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const atlas = dictionary.homeAtlas;
  const shouldReduce = useReducedMotion();
  const { audience } = useMarketplacePreferences();
  // STRAT.6 — filter the bucket grid by audience. Personal hides the
  // business-only bucket; Business shows the company-relevant subset.
  const visibleBuckets =
    audience === "business"
      ? buckets.filter((b) => BUSINESS_BUCKET_SLUGS.has(b.bucket.slug))
      : buckets.filter((b) => b.bucket.slug !== "for-business");

  const countryName =
    atlas.countryNames[country.toUpperCase()] ?? country;

  const sectionHeadline = formatCopy(atlas.atlas.sectionHeadline, { country: countryName });

  return (
    <section className="mx-auto w-full min-w-0">
      <motion.div
        className="mb-8"
        initial={shouldReduce ? false : { opacity: 0, y: 12 }}
        whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
          <SectionNum value="02" className="mr-2.5 text-[10px] text-ink-tertiary/50" />
          Browse by type
        </p>
        <h2 className="text-[1.5rem] font-bold tracking-[-0.025em] text-ink sm:text-[1.75rem]">
          {sectionHeadline}
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-secondary">{atlas.atlas.sectionSub}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleBuckets.map(({ bucket, count, topProviders }, i) => {
          const isAvailable = count > 0;
          const counterText = isAvailable
            ? formatCopy(
                count === 1 ? atlas.atlas.cardCounterTextSingular : atlas.atlas.cardCounterText,
                { count, country: countryName },
              )
            : formatCopy(atlas.atlas.cardComingSoonText, { country: countryName });

          const title = atlas[bucket.bucketKey].title;
          const description = atlas[bucket.bucketKey].description;
          const Icon = bucket.Icon;

          const bucketHref = localePath(
            locale as MarketplaceLocale,
            `/${flatCategoryForBucket(bucket.slug) ?? bucket.slug}?country=${country}`,
          );

          const counterSuffix = isAvailable ? counterText.slice(String(count).length) : null;

          const card = isAvailable && !shouldReduce ? (
            <motion.div
              className="block rounded-2xl border bg-white p-5 cursor-pointer"
              variants={cardVariants}
              initial="rest"
              whileHover="cardHover"
              whileTap="tap"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2.5">
                <motion.span
                  variants={iconVariants}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                >
                  <Icon className="h-5 w-5 shrink-0 text-accent-emerald" />
                </motion.span>
                <span className="text-[14px] font-semibold text-ink">{title}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-secondary">{description}</p>
              {topProviders.length > 0 && (
                <div className="mt-4 flex items-center">
                  {topProviders.map((p, idx) => (
                    <ProviderAvatar key={p.slug} provider={p} index={idx} />
                  ))}
                </div>
              )}
              <p className="mt-4 text-[12px] font-medium text-accent-emerald">
                <AnimatedCounter value={count} shouldReduce={shouldReduce} />
                {counterSuffix}
                <span aria-hidden> →</span>
              </p>
            </motion.div>
          ) : (
            <div
              className={[
                "block rounded-2xl border bg-white p-5",
                isAvailable ? "cursor-pointer border-line" : "cursor-default border-line opacity-50",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-5 w-5 shrink-0 text-accent-emerald" />
                <span className="text-[14px] font-semibold text-ink">{title}</span>
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-secondary">{description}</p>
              {topProviders.length > 0 && (
                <div className="mt-4 flex items-center">
                  {topProviders.map((p, idx) => (
                    <ProviderAvatar key={p.slug} provider={p} index={idx} />
                  ))}
                </div>
              )}
              <p className={["mt-4 text-[12px] font-medium", isAvailable ? "text-accent-emerald" : "text-ink-tertiary"].join(" ")}>
                {counterText}
                {isAvailable && <span aria-hidden> →</span>}
              </p>
            </div>
          );

          return (
            <motion.div
              key={bucket.slug}
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5% 0px" }}
              transition={{ type: "spring", stiffness: 55, damping: 18, delay: i * 0.07 }}
            >
              {isAvailable ? (
                <Link href={bucketHref} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
