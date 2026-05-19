"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Highlight } from "@/features/highlights/get-active-highlights";
import { formatCopy, getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";

const KIND_COLORS: Record<Highlight["kind"], { bg: string; text: string; dot: string }> = {
  rate_change:    { bg: "bg-accent-emerald-soft",  text: "text-accent-emerald-strong", dot: "bg-accent-emerald" },
  new_launch:     { bg: "bg-accent-blue",           text: "text-accent-blue-text",      dot: "bg-blue-400" },
  new_provider:   { bg: "bg-[#F3F0FF]",             text: "text-[#5B21B6]",             dot: "bg-purple-400" },
  feature_update: { bg: "bg-accent-orange",         text: "text-accent-orange-text",    dot: "bg-orange-400" },
};

interface WhatsNewProps {
  highlights: Highlight[];
  locale: string;
  countryName: string;
}

export function WhatsNew({ highlights, locale, countryName }: WhatsNewProps) {
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const atlas = dictionary.homeAtlas;

  if (highlights.length === 0) return null;

  function kindLabel(kind: Highlight["kind"]): string {
    switch (kind) {
      case "rate_change":    return atlas.whatsNew.kindRateChange;
      case "new_launch":     return atlas.whatsNew.kindNewLaunch;
      case "new_provider":   return atlas.whatsNew.kindNewProvider;
      case "feature_update": return atlas.whatsNew.kindFeatureUpdate;
    }
  }

  return (
    <section className="w-full min-w-0">
      <motion.div
        className="mb-5"
        initial={shouldReduce ? false : { opacity: 0, y: 12 }}
        whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-[1.25rem] font-bold tracking-[-0.02em] text-ink">
          {formatCopy(atlas.whatsNew.sectionHeadline, { country: countryName })}
        </h2>
        <p className="mt-1 text-[13px] text-ink-secondary">{atlas.whatsNew.sectionSub}</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((h, i) => {
          const colors = KIND_COLORS[h.kind];
          return (
            <motion.div
              key={h.id}
              initial={shouldReduce ? false : { opacity: 0, y: 8 }}
              animate={shouldReduce ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.26, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-subtle"
            >
              <div
                className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${colors.bg} ${colors.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                {kindLabel(h.kind)}
              </div>

              <p className="text-[14px] font-semibold leading-tight text-ink">{h.title}</p>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-secondary">{h.body}</p>

              {h.cta_url && (
                <a
                  href={h.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-accent-emerald hover:text-accent-emerald-strong"
                >
                  {h.cta_text}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
