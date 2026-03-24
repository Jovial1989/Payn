import { FilterPanel } from "@/components/filter-panel";
import { SiteShell } from "@/components/site-shell";

export default function ExchangePage() {
  return (
    <SiteShell
      activeHref="/exchange"
      eyebrow="Currency Exchange Marketplace"
      title="FX discovery without burying spreads and fees."
      description="Pair-aware product data, spread visibility, and clearer pricing notes once live providers are connected."
      heroTags={["Pair-aware", "Spread visibility", "Execution windows"]}
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <FilterPanel category="exchange" />
        <section className="grid gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-[200px] w-[200px] rounded-full bg-primary opacity-[0.04] blur-[60px]" />
            <div className="relative">
              <p className="text-caption uppercase tracking-widest text-primary">Coming soon</p>
              <h2 className="mt-3 text-h2 text-ink">
                Pair-level pricing modules and educational content.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The route is prepared for spread-led ranking, execution windows, and visible pricing
                mechanics instead of hiding FX economics behind generic product cards.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-bg-elevated p-6">
              <p className="text-caption uppercase tracking-widest text-ink-tertiary">Planned</p>
              <p className="mt-3 text-sm font-semibold text-ink">
                Live pair cards, execution selectors, and spread explainers.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-bg-elevated p-6">
              <p className="text-caption uppercase tracking-widest text-ink-tertiary">Why it matters</p>
              <p className="mt-3 text-sm font-semibold text-ink">
                FX users need price mechanics and trust cues before they commit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
