"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { MarketplaceOffer } from "@payn/types";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { SaveOfferButton } from "@/components/save-offer-button";
import { getProviderLogoPath } from "@/features/catalog/provider-logo";
import { normalizeDisplayText } from "@/lib/marketplace";

// ─── PdpStickySummary ──────────────────────────────────────────────────────────
//
// Premium top sticky bar that slides in once the page hero leaves the viewport.
// Apple/Stripe/Linear pattern — keeps the headline metric + CTA always within
// reach without forcing the user to scroll back up.
//
// Implementation note: we use IntersectionObserver on a sentinel sibling
// element rendered immediately AFTER the hero. When that sentinel exits the
// viewport (i.e. the user has scrolled past the hero), we transition the
// fixed bar in. We don't observe the hero card directly because once it
// unintersects we want the bar to stay visible during the whole tail of the
// page, regardless of where the hero is — observing a single point below
// the hero gives us a binary "above / below" toggle cleanly.
//
// The bottom sticky bar (rendered server-side in the PDP) stays — it's the
// mobile-first action affordance. On desktop the top bar dominates; on
// mobile both can coexist because we only render the top bar at lg+.
interface PdpStickySummaryProps {
  offer: MarketplaceOffer;
  ctaLabel: string;
}

export function PdpStickySummary({ offer, ctaLabel }: PdpStickySummaryProps) {
  const shouldReduce = useReducedMotion();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sentinel sits BELOW the hero. When it stops intersecting (i.e.
        // the user has scrolled past the hero AND past the sentinel) we
        // hide the bar. When it intersects we hide. Net result: bar is
        // visible only when sentinel is above the viewport.
        if (entry) {
          // boundingClientRect.top is positive when sentinel is below the
          // viewport, negative when it's above.
          setShow(entry.boundingClientRect.top < 0);
        }
      },
      // Track in real time — every scroll position triggers.
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const logoPath = getProviderLogoPath(offer.providerName);
  const primaryMetric = offer.metrics[0];

  return (
    <>
      {/* Sentinel — invisible 1px element rendered after the hero. The
          parent inserts <PdpStickySummary /> right after the hero block,
          so this sentinel naturally sits below the hero in the DOM. */}
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <motion.div
        // Top-fixed bar. Hidden below lg because mobile has a bottom sticky.
        className="pointer-events-none fixed inset-x-0 top-0 z-30 hidden lg:block"
        initial={shouldReduce ? false : { y: -56, opacity: 0 }}
        animate={shouldReduce ? false : show ? { y: 0, opacity: 1 } : { y: -56, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!show}
      >
        <div className="pointer-events-auto mx-auto mt-3 max-w-6xl px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/85 px-3 py-2 shadow-elevated backdrop-blur-xl">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-accent-emerald-soft">
              {logoPath ? (
                <Image
                  src={logoPath}
                  alt={offer.providerName}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <span className="text-[11px] font-extrabold text-accent-emerald-strong">
                  {offer.providerMark.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-3">
              <p className="truncate text-[13px] font-bold leading-tight text-ink">
                {normalizeDisplayText(offer.title)}
              </p>
              {primaryMetric && (
                <>
                  <span className="text-line-strong">·</span>
                  <p className="shrink-0 text-[13px] font-bold tabular-nums text-ink">
                    {normalizeDisplayText(primaryMetric.value)}
                  </p>
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <SaveOfferButton offer={offer} mode="icon" stopPropagation />
              <ProviderLinkButton
                offer={offer}
                label={ctaLabel}
                source="offer_detail_sticky"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
