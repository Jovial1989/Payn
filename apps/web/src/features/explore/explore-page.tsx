import type { MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { MarketplaceExplorer } from "@/components/marketplace-explorer";
import { ProviderStrip } from "@/components/provider-strip";
import { localePath } from "@/lib/locale";

const featuredProviders = [
  "Revolut",
  "Wise",
  "Klarna",
  "N26",
  "Santander",
  "BNP Paribas",
];

export function ExplorePageContent({
  offers,
  locale,
  market,
}: {
  offers: MarketplaceOffer[];
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
}) {
  return (
    <div className="grid gap-10">
      <MarketplaceExplorer offers={offers} initialMarket={market} initialCategory="all" mode="home" />

      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Provider coverage</p>
            <h2 className="mt-3 text-h2 text-ink">Recognizable providers stay visible</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Payn keeps the marketplace grounded in institutions people already know so the filtering experience still feels credible while you compare.
          </p>
        </div>

        <div className="mt-6">
          <ProviderStrip providers={featuredProviders.length > 0 ? featuredProviders : Array.from(new Set(offers.map((offer) => offer.providerName))).slice(0, 18)} />
        </div>
      </section>

      <section className="rounded-[32px] border border-line bg-[#101717] p-6 text-white shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Payn mobile</p>
            <h2 className="mt-3 text-h2 text-white">Keep the shortlist in your pocket</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              The mobile app is still in rollout, but the waitlist is real and tied to the same comparison account you use on the web.
            </p>
          </div>

          <div>
            <div className="grid gap-3">
              {[
                "Track saved offers across categories and countries",
                "Pick up where you left off after a provider click",
                "Receive updates when product terms change",
              ].map((item) => (
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
              <Link href={localePath(locale, "/waitlist")} className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Join mobile waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
