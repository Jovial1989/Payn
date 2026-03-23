import Link from "next/link";

const intents = [
  {
    href: "/loans",
    title: "Get a loan",
    description: "Personal loans, refinancing, and country-aware eligibility discovery.",
  },
  {
    href: "/cards",
    title: "Find a card",
    description: "Credit card comparison with pricing, rewards, and fee transparency.",
  },
  {
    href: "/transfers",
    title: "Send money",
    description: "Cross-border transfer providers with speed, fee, and corridor coverage.",
  },
  {
    href: "/exchange",
    title: "Exchange currency",
    description: "FX providers, spread visibility, and trust-led partner selection.",
  },
];

export function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="grid gap-4 md:grid-cols-2">
        {intents.map((intent) => (
          <Link
            key={intent.href}
            href={intent.href}
            className="rounded-3xl border border-white/10 bg-panel p-6 transition hover:border-accent/40 hover:bg-panel-strong"
          >
            <h2 className="text-xl font-semibold text-ink">{intent.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{intent.description}</p>
          </Link>
        ))}
      </section>
      <section className="rounded-3xl border border-white/10 bg-panel p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Trust layer</p>
        <h2 className="mt-4 text-2xl font-semibold text-ink">Editorial discovery, not payout spam.</h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          Payn is structured for explainable ranking, affiliate disclosures, and future lead-routing
          without moving business rules into the client.
        </p>
      </section>
    </div>
  );
}

