import { SiteShell } from "@/components/site-shell";
import { getRequestPreferences } from "@/lib/request-preferences";

export const metadata = {
  title: "How we rank providers — Payn",
  description: "Learn how Payn scores and ranks financial providers. Our methodology is built on real data, not advertising spend.",
};

const rankingFactors = [
  {
    label: "Country fit",
    weight: "52%",
    description:
      "We match providers to the country you selected. A provider that directly supports your market scores higher than one with only EU-wide or international coverage. This is the single biggest factor in our scoring.",
  },
  {
    label: "Speed",
    weight: "22%",
    description:
      "How fast money moves or how quickly you can open and use an account. We pull speed data from provider metrics and normalise it across categories — shorter is always better.",
  },
  {
    label: "Simplicity",
    weight: "14%",
    description:
      "A proxy for friction: how many steps, conditions, or restrictions stand between you and the product. Fewer barriers means a higher simplicity score.",
  },
  {
    label: "Popularity & outcome",
    weight: "12%",
    description:
      "A composite of engagement signals (saves, clicks) and the primary outcome value for the category — recipient amount for transfers, monthly payment for loans, estimated premium for insurance.",
  },
];

export default async function HowWeRankPage() {
  await getRequestPreferences();

  return (
    <SiteShell
      eyebrow="Transparency"
      title="How we rank providers"
      description="Our rankings are built on a scoring model, not advertising spend. Here is exactly how it works."
    >
      <div className="grid gap-5">
        <section className="rounded-[28px] border border-line bg-white p-6 sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">The model</p>
          <h2 className="mt-3 text-h2 text-ink">Four factors, one score</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Every provider on Payn receives a composite score between 0 and 100. The score is
            calculated fresh on each page load using your current country selection and the inputs
            you have entered (transfer amount, loan term, etc.). Partners and non-partners are
            scored by the same formula.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {rankingFactors.map((factor) => (
              <div key={factor.label} className="rounded-[20px] border border-line bg-bg-surface p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{factor.label}</p>
                  <span className="rounded-full bg-accent-emerald-soft px-3 py-0.5 text-xs font-semibold text-accent-emerald-strong">
                    {factor.weight}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{factor.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Diversity boost</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              When a single provider would appear multiple times (different products from the same
              brand), we apply a diversity boost to surface alternatives. This prevents one brand
              from dominating the top of the list even if all its products score highly.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">No pay-to-rank</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Providers cannot pay to appear higher in rankings. Partners receive an{" "}
              <code className="rounded bg-bg-surface px-1 py-0.5 font-mono text-xs">affiliatePriorityScore</code>{" "}
              that acts as a mild tie-breaker between otherwise equal scores, but it cannot
              override the four primary factors.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Live data</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              For transfers and currency exchange, we fetch a live mid-market rate and calculate
              exactly how much the recipient would receive after each provider&apos;s fees and
              spread. The ranked order updates whenever the market moves.
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

        <section className="rounded-[28px] border border-line bg-bg-surface p-6 sm:p-8">
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
