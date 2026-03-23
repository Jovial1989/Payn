import { FilterPanel } from "@/components/filter-panel";
import { SectionContainer } from "@/components/section-container";
import { SiteShell } from "@/components/site-shell";

export default function ExchangePage() {
  return (
    <SiteShell
      activeHref="/exchange"
      eyebrow="Currency exchange marketplace"
      title="Support FX discovery without burying spreads and fees."
      description="The exchange route is ready for pair-aware product data, spread visibility, and clearer pricing notes once live providers are connected."
      heroTags={["Pair-aware", "Spread visibility", "Execution windows"]}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="exchange" />
        <section className="grid gap-4">
          <SectionContainer>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">FX canvas</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">
              Pair-level pricing modules and educational trust content belong here.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              The route is prepared for spread-led ranking, execution windows, and visible pricing
              mechanics instead of hiding FX economics behind generic product cards.
            </p>
          </SectionContainer>
          <div className="grid gap-4 md:grid-cols-2">
            <SectionContainer>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Planned modules</p>
              <p className="mt-3 text-base font-semibold text-ink">
                Live pair cards, execution selectors, and spread explainers.
              </p>
            </SectionContainer>
            <SectionContainer>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why this matters</p>
              <p className="mt-3 text-base font-semibold text-ink">
                FX users need price mechanics and trust cues before they commit.
              </p>
            </SectionContainer>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
