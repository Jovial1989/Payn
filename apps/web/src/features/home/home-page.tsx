import type { MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { MarketplaceExplorer } from "@/components/marketplace-explorer";
import { ProviderStrip } from "@/components/provider-strip";
import { getDictionary } from "@/lib/i18n";

export function HomePage({
  offers,
  locale,
  market,
}: {
  offers: MarketplaceOffer[];
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
}) {
  const dictionary = getDictionary(locale);
  const providers = Array.from(new Set(offers.map((offer) => offer.providerName))).slice(0, 18);

  return (
    <div className="grid gap-10">
      <MarketplaceExplorer
        offers={offers}
        initialMarket={market}
        initialCategory="all"
        mode="home"
      />

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {dictionary.home.providerTitle}
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
            {dictionary.home.providerDescription}
          </p>
        </div>

        <div className="mt-6">
          <ProviderStrip providers={providers} />
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-[#101717] p-6 text-white shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              {dictionary.nav.mobileWaitlist}
            </p>
            <h2 className="mt-3 text-h2 text-white">{dictionary.home.appTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {dictionary.home.appDescription}
            </p>
          </div>

          <div>
            <div className="grid gap-3">
              {dictionary.home.appPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-emerald-300">
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/waitlist" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                {dictionary.home.waitlistCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
