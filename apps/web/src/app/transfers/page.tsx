import { FilterPanel } from "@/components/filter-panel";
import { SectionContainer } from "@/components/section-container";
import { SiteShell } from "@/components/site-shell";

export default function TransfersPage() {
  return (
    <SiteShell
      activeHref="/transfers"
      eyebrow="Money transfers marketplace"
      title="Route users into corridor-aware transfer discovery."
      description="Transfer comparison will use the same trust-first layout once corridor, payout method, and speed data are connected."
      heroTags={["Fee transparency", "Corridor-aware", "Payout options"]}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="transfers" />
        <section className="grid gap-4">
          <SectionContainer>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Transfer canvas</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">
              Results, corridor notes, and payout education will land here.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              The shell is ready for ranking cards, compare tables, and trust blocks that explain
              pricing and payout trade-offs instead of leaving them implicit.
            </p>
          </SectionContainer>
          <div className="grid gap-4 md:grid-cols-2">
            <SectionContainer>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Planned modules</p>
              <p className="mt-3 text-base font-semibold text-ink">
                Ranking cards, compare rails, and corridor trust notes.
              </p>
            </SectionContainer>
            <SectionContainer>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Why this matters</p>
              <p className="mt-3 text-base font-semibold text-ink">
                Speed, cost, and payout clarity should be visible before the click-out.
              </p>
            </SectionContainer>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
