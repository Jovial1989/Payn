"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MarketplaceOffer, MarketplaceLocale } from "@payn/types";
import { OfferRowAtlas } from "@/features/marketplace/offer-row-atlas";

// ─── TopPicksStrip ─────────────────────────────────────────────────────────────
//
// Brings the catalogue's Card v2 visuals (award ribbons, comparative
// glyphs, verified Payn score) into the home page. Three rows, category-
// diverse, picked server-side from the country's full market so the strip
// shows what's actually strong right now — not a curated marketing list.
//
// Slots between SavingsSpotlight and Manifesto so the flow reads:
//   AtlasGrid → numbers proof → real products → brand statement → updates
// — i.e. by the time the user hits the Manifesto they've already seen the
// inventory in three shapes.
interface TopPicksStripProps {
  picks: MarketplaceOffer[];
  marketContext: MarketplaceOffer[];
  locale: MarketplaceLocale;
  countryLabel: string;
}

export function TopPicksStrip({
  picks,
  marketContext,
  locale,
  countryLabel,
}: TopPicksStripProps) {
  const shouldReduce = useReducedMotion();

  if (picks.length === 0) return null;

  return (
    <section className="w-full min-w-0">
      <motion.div
        className="mb-6 flex flex-col gap-2"
        initial={shouldReduce ? false : { opacity: 0, y: 12 }}
        whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow-cap" data-tone="emerald">
          Top picks this week · {countryLabel}
        </p>
        <h2 className="display-lead max-w-prose-wide text-[1.5rem] sm:text-[1.75rem]">
          What's actually winning right now.
        </h2>
        <p className="max-w-prose-base text-[14px] leading-relaxed text-ink-secondary">
          Three offers leading our market across cost, speed, and eligibility.
          Updated whenever providers publish new terms.
        </p>
      </motion.div>

      <div className="grid gap-3">
        {picks.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={shouldReduce ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <OfferRowAtlas
              offer={offer}
              locale={locale}
              marketContext={marketContext}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
