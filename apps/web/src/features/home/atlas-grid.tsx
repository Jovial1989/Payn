"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useInView, animate } from "motion/react";
import type { MarketplaceLocale } from "@payn/types";
import { getDictionary, formatCopy } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import type { OutcomeBucketCount, ProviderInfo } from "@/features/catalog/count-by-outcome";

// Brand colors for initials fallback — covers the most common providers in the catalogue
const FALLBACK_COLORS: Record<string, string> = {
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
  default: "#94A3B8",
};

function providerBg(slug: string): string {
  return FALLBACK_COLORS[slug] ?? FALLBACK_COLORS.default;
}

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
function AnimatedCounter({ value, shouldReduce }: { value: number; shouldReduce: boolean | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [display, setDisplay] = useState(shouldReduce ? value : 0);

  useEffect(() => {
    if (!isInView || shouldReduce) return;
    const controls = animate(0, value, {
      duration: 0.8, ease: "easeOut", delay: 0.1,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, value, shouldReduce]);

  return <span ref={ref}>{display}</span>;
}

function ProviderAvatar({ provider, index }: { provider: ProviderInfo; index: number }) {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white text-[9px] font-bold uppercase text-white"
      style={{
        background: provider.logoPath ? "#f3f4f6" : providerBg(provider.slug),
        marginLeft: index === 0 ? 0 : -6,
        zIndex: 10 - index,
        position: "relative",
      }}
      title={provider.name}
    >
      {provider.logoPath ? (
        <Image
          src={provider.logoPath}
          alt={provider.name}
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
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
        <h2 className="text-[1.5rem] font-bold tracking-[-0.025em] text-ink sm:text-[1.75rem]">
          {sectionHeadline}
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-secondary">{atlas.atlas.sectionSub}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {buckets.map(({ bucket, count, topProviders }, i) => {
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
            `/explore/${bucket.slug}?country=${country}`,
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
              initial={shouldReduce ? false : { opacity: 0, y: 10 }}
              animate={shouldReduce ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
