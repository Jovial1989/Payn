import { SiteShell } from "@/components/site-shell";
import { getRequestPreferences } from "@/lib/request-preferences";

export const metadata = {
  title: "How we make money — Payn",
  description: "Payn is free to use. Learn how we earn revenue and how that affects what you see.",
};

const revenueStreams = [
  {
    label: "Affiliate referrals",
    description:
      "When you click through to a provider and sign up, we may receive a referral fee. This fee is paid by the provider, not by you. The amount varies by provider and product category.",
    affects: false,
  },
  {
    label: "Partner placements",
    description:
      "Some providers have paid to be listed on Payn. Partners are marked with a badge. Being a partner does not affect their ranking score — it only acts as a mild tie-breaker between otherwise equal scores.",
    affects: false,
  },
  {
    label: "Premium features (future)",
    description:
      "We plan to offer optional premium features for users — rate alerts, portfolio tracking, and personalised reports. These will be subscription-based and will never influence the product rankings.",
    affects: false,
  },
];

export default async function HowWeMakeMoneyPage() {
  await getRequestPreferences();

  return (
    <SiteShell
      eyebrow="Transparency"
      title="How we make money"
      description="Payn is free to use. We earn revenue through affiliate referrals and partner listings — here is exactly how that works and what it means for you."
    >
      <div className="grid gap-5">
        <section className="rounded-[24px] border border-line bg-white p-5 sm:rounded-[28px] sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Revenue model</p>
          <h2 className="mt-3 text-h2 text-ink">Three ways we earn</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            We never charge users. Instead, we earn when you choose a product through Payn. Every
            revenue stream is listed below, along with whether it affects the rankings you see.
          </p>

          <div className="mt-6 grid gap-4">
            {revenueStreams.map((stream) => (
              <div key={stream.label} className="rounded-[20px] border border-line bg-bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-ink">{stream.label}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-semibold ${
                      stream.affects
                        ? "bg-red-50 text-red-700"
                        : "bg-accent-emerald-soft text-accent-emerald-strong"
                    }`}
                  >
                    {stream.affects ? "Affects ranking" : "Does not affect ranking"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{stream.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Partner badges</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Providers who have a commercial relationship with Payn are marked with a{" "}
              <strong className="font-semibold text-ink">Partner</strong> badge on their product
              card. Non-partners are listed exactly the same way — there is no penalty for not
              being a partner.
            </p>
          </div>

          <div className="rounded-[24px] border border-line bg-white p-6">
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Your data</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              We do not sell your personal data to providers or third parties. Aggregate,
              anonymised usage signals (e.g. which categories are most searched in Germany) may
              be shared with providers to help them understand market demand.
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-bg-surface p-5 sm:rounded-[28px] sm:p-8">
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Our commitment</p>
          <h2 className="mt-3 text-h2 text-ink">Editorial independence</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Our ranking algorithm is the same for every provider, whether they are a partner or
            not. Commercial relationships do not influence editorial decisions about which products
            to list, how to describe them, or where they appear in the results. If you believe a
            listing is inaccurate or misleading, please contact us and we will review it within
            48 hours.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
