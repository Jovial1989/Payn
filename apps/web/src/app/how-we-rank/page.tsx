import { SiteShell } from "@/components/site-shell";
import { getRequestPreferences } from "@/lib/request-preferences";

export const metadata = {
  title: "How we rank providers — Payn",
  description: "Learn how Payn ranks financial providers: by real cost first, not advertising spend. Country is a filter you choose, not a ranking weight.",
};

const rankingSteps = [
  {
    label: "You pick a country",
    description:
      "Country is a filter, not a ranking weight. We hide any provider that doesn't serve the market you selected, so everything you see is something you can actually use. Filtering by country never moves a provider up or down the order — it only decides who appears at all.",
  },
  {
    label: "We rank by real cost",
    description:
      "The default order leads with the lowest real cost first. For each offer we read the cost metrics it exposes — fees, annual or monthly fees, exchange-rate spread, FX markup, conversion fees — and sort cheapest to most expensive. This is the order you see before you change anything.",
  },
  {
    label: "Missing-cost offers go last",
    description:
      "An offer with no parseable cost figure can never win on cost, so it sorts to the bottom of the default view rather than the top. \"No data\" doesn't get a free pass to the front of the list.",
  },
  {
    label: "Ties break on a disclosed tie-breaker",
    description:
      "When two offers come out at the same real cost — or when neither exposes a parseable cost — we break the tie with a disclosed affiliate-priority score. It only ever decides order between otherwise-equal results; it cannot move a more expensive offer above a cheaper one.",
  },
];

export default async function HowWeRankPage() {
  await getRequestPreferences();

  return (
    <SiteShell
      eyebrow="Transparency"
      title="How we rank providers"
      description="Ranked by real cost, not commission. Here is exactly how the default order is built."
    >
      <div className="grid gap-5">
        <section className="rounded-[24px] border border-line bg-white p-5 sm:rounded-[28px] sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">The order</p>
          <h2 className="mt-3 text-h2 text-ink">Real cost first</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            By default, Payn ranks providers by real cost — lowest total cost first. The order is
            built fresh on each page load from the cost metrics each offer exposes. You can re-sort
            by speed or other options at any time, but the order you land on leads with cost.
            Country is a filter you choose, not a factor that pushes any provider up the list.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {rankingSteps.map((step, index) => (
              <div key={step.label} className="rounded-[20px] border border-line bg-bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{step.label}</p>
                  <span className="rounded-full bg-accent-emerald-soft px-3 py-0.5 text-xs font-semibold text-accent-emerald-strong">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">You stay in control</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              The real-cost order is the starting point, not a cage. Change the country filter,
              search, narrow by provider or feature, or switch the sort to speed — the list
              re-ranks live. The default just makes sure the first thing you see is the cheapest,
              not the best-paying.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">No pay-to-rank</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Providers cannot pay to appear higher in rankings. Ranking is decoupled from
              commission, with one disclosed exception: partners carry an{" "}
              <code className="rounded bg-bg-surface px-1 py-0.5 font-mono text-xs">affiliatePriorityScore</code>{" "}
              that breaks ties only between otherwise-equal results. It cannot lift a more expensive
              offer above a cheaper one.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Live data</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              For transfers and currency exchange, we fetch a live mid-market rate and calculate
              exactly how much the recipient would receive after each provider&apos;s fees and
              spread, so the cost you compare reflects current market conditions.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">What we don&apos;t score</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Customer support quality, app store ratings, and brand reputation are not part of
              the score. We focus on measurable, objective data points that can be verified
              and updated regularly.
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Data sources</p>
          <h2 className="mt-3 text-h2 text-ink">Where the data comes from</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Provider metrics are sourced from official pricing pages, provider APIs, and periodic
            manual reviews. We update catalogue data at minimum monthly. If you spot an error or
            outdated figure, please contact us — we will investigate and correct it within 48 hours.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
