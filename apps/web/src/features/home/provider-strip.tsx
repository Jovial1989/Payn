"use client";

import { getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";

const PROVIDER_NAMES = [
  "Revolut", "Wise", "Trade Republic", "Klarna", "N26", "Monzo", "Starling", "Chase UK",
  "BBVA", "Santander", "ING", "Boursorama", "Younited", "Intesa Sanpaolo", "UniCredit",
  "Tide", "Qonto", "Stripe", "PayPal", "Western Union", "Kraken", "eToro",
];

interface ProviderStripProps {
  locale: string;
}

export function ProviderStrip({ locale }: ProviderStripProps) {
  const dictionary = getDictionary(locale as MarketplaceLocale);
  const label = dictionary.homeAtlas.providerStrip.label;
  const doubled = [...PROVIDER_NAMES, ...PROVIDER_NAMES];

  return (
    <section className="border-y border-gray-100 bg-gray-50/30 py-8">
      <div className="mb-3 text-center">
        <span className="text-[10px] font-medium tracking-widest text-[#9ca3af]">
          {label}
        </span>
      </div>
      <div className="relative overflow-hidden">
        <div className="provider-marquee-track flex whitespace-nowrap">
          {doubled.map((name, i) => (
            <span key={i} className="mx-6 text-sm font-medium text-[#6b7280] hover:text-[#1F2937]">
              {name}
            </span>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes provider-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .provider-marquee-track {
          animation: provider-marquee 40s linear infinite;
        }
        .provider-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .provider-marquee-track { animation: none; }
        }
      `}} />
    </section>
  );
}
