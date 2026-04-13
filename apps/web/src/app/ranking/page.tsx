import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { SiteShell } from "@/components/site-shell";
import { getDictionary } from "@/lib/i18n";
import { getRequestPreferences } from "@/lib/request-preferences";
import { localePath } from "@/lib/locale";

const rankingFactors = [
  {
    title: "Pricing transparency",
    description:
      "We surface APR, fees, spreads, and hidden costs so you can compare actual cost — not headline rates. Offers with clearer pricing rank higher.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Product-market fit",
    description:
      "Each offer is scored on how well it matches the user's selected market, category, and financial goals. A great product in the wrong country scores lower.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    title: "User relevance signals",
    description:
      "When you set preferences (country, goals, categories), rankings adjust. A freelancer looking for low-fee transfers sees different top results than someone comparing credit cards.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: "Provider quality",
    description:
      "We factor in regulatory status, public reputation, and product completeness. Offers from licensed, well-established providers get a baseline quality boost.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Affiliate priority",
    description:
      "Some providers are affiliate partners. Partner offers may receive a ranking boost, but only within products that already meet quality and relevance thresholds. This is always disclosed.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

export default async function RankingPage() {
  const preferences = await getRequestPreferences();
  const dictionary = getDictionary(preferences.locale);

  return (
    <SiteShell
      activePage={undefined}
      eyebrow="Methodology"
      title="How We Rank Offers"
      description="Payn ranks financial products using a combination of pricing transparency, market fit, user relevance, provider quality, and affiliate priority. Here's how each factor works."
    >
      <div className="grid gap-5">
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rankingFactors.map((factor) => (
            <div
              key={factor.title}
              className="flex flex-col rounded-[22px] border border-line bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bg-surface text-ink">
                {factor.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-ink">{factor.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {factor.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] border border-line bg-[#F7F8F9] p-6 sm:p-8">
          <h2 className="text-h3 text-ink">What this means for you</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
            Rankings are designed to surface the most relevant and transparent options first.
            Partner offers are clearly labeled. You can always re-sort by APR, fees, provider
            name, or recency in the explorer. Payn does not guarantee any financial outcome —
            always review terms on the provider's site before applying.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath(preferences.locale, "/discover")}
              className={buttonStyles({ variant: "primary", size: "md" })}
            >
              {dictionary.home.heroCta}
            </Link>
            <Link
              href={localePath(preferences.locale, "/contact")}
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Questions? Contact us
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
