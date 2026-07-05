"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";
import { KNOWN_LOGOS } from "@/features/catalog/known-logos.generated";
import { providerToSlug } from "@/features/catalog/provider-logo";

// BUG-106 — provider strip was showing plain text only.
// Now shows a rounded logo square (curated /logos/<slug>.png →
// Google favicon proxy) beside each provider name — same 3-tier
// resolution as ProviderAvatar / ProviderLogo.
const PROVIDERS: { name: string; websiteUrl: string }[] = [
  { name: "Revolut",          websiteUrl: "https://www.revolut.com" },
  { name: "Wise",             websiteUrl: "https://wise.com" },
  { name: "Trade Republic",   websiteUrl: "https://traderepublic.com" },
  { name: "Klarna",           websiteUrl: "https://klarna.com" },
  { name: "N26",              websiteUrl: "https://n26.com" },
  { name: "Monzo",            websiteUrl: "https://monzo.com" },
  { name: "Starling Bank",    websiteUrl: "https://starlingbank.com" },
  { name: "Chase UK",         websiteUrl: "https://chase.co.uk" },
  { name: "BBVA",             websiteUrl: "https://bbva.com" },
  { name: "Santander",        websiteUrl: "https://santander.com" },
  { name: "ING",              websiteUrl: "https://ing.com" },
  { name: "Bunq",             websiteUrl: "https://bunq.com" },
  { name: "Younited Credit",  websiteUrl: "https://younited-credit.com" },
  { name: "Intesa Sanpaolo",  websiteUrl: "https://intesasanpaolo.com" },
  { name: "UniCredit",        websiteUrl: "https://unicredit.eu" },
  { name: "Tide",             websiteUrl: "https://tide.co" },
  { name: "Qonto",            websiteUrl: "https://qonto.com" },
  { name: "PayPal",           websiteUrl: "https://paypal.com" },
  { name: "Western Union",    websiteUrl: "https://westernunion.com" },
  { name: "Kraken",           websiteUrl: "https://kraken.com" },
  { name: "eToro",            websiteUrl: "https://etoro.com" },
];

function ProviderChip({ name, websiteUrl }: { name: string; websiteUrl: string }) {
  const [broken, setBroken] = useState(false);
  const slug = providerToSlug(name);
  const hasLocal = KNOWN_LOGOS.has(slug);
  const logoSrc = hasLocal
    ? `/logos/${slug}.png`
    : (() => {
        try {
          return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(websiteUrl).hostname)}&sz=64`;
        } catch {
          return null;
        }
      })();

  return (
    <span className="mx-4 inline-flex shrink-0 items-center gap-2 sm:mx-6">
      {logoSrc && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoSrc}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="h-5 w-5 shrink-0 rounded-[5px] object-contain"
        />
      ) : (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[#f3f4f6] text-[7px] font-bold text-[#6b7280]"
          aria-hidden="true"
        >
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-[13px] font-medium text-[#6b7280] sm:text-sm">
        {name}
      </span>
    </span>
  );
}

interface ProviderStripProps {
  locale: string;
}

export function ProviderStrip({ locale }: ProviderStripProps) {
  const shouldReduce = useReducedMotion();
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const label = dictionary.homeAtlas.providerStrip.label;
  const doubled = [...PROVIDERS, ...PROVIDERS];

  return (
    <motion.section
      className="w-full min-w-0 overflow-hidden border-y border-gray-100 bg-gray-50/30 py-8"
      initial={shouldReduce ? false : { opacity: 0 }}
      whileInView={shouldReduce ? {} : { opacity: 1 }}
      viewport={{ once: true, margin: "-5% 0px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-3 text-center">
        <span className="text-[10px] font-medium tracking-widest text-[#9ca3af]">
          {label}
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div className="provider-marquee-track flex whitespace-nowrap">
          {doubled.map((p, i) => (
            <ProviderChip key={i} name={p.name} websiteUrl={p.websiteUrl} />
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes provider-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .provider-marquee-track {
          animation: provider-marquee 60s linear infinite;
        }
        @media (min-width: 768px) {
          .provider-marquee-track {
            animation-duration: 40s;
          }
        }
        .provider-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .provider-marquee-track { animation: none; }
        }
      `}} />
    </motion.section>
  );
}
