import type { Route } from "next";
import Link from "next/link";
import { Tag } from "@/components/tag";

const categories = [
  {
    href: "/loans" as Route,
    title: "Loans",
    description: "Compare personal loans with transparent ranking and borrowing ranges.",
    stat: "From 3.5% APR",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2" />
      </svg>
    ),
  },
  {
    href: "/cards" as Route,
    title: "Cards",
    description: "Review fees, credit limits, and card features with full transparency.",
    stat: "Up to 55 days interest-free",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    href: "/transfers" as Route,
    title: "Transfers",
    description: "Compare money transfer providers on speed, fees, and corridors.",
    stat: "Zero hidden fees",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    ),
  },
  {
    href: "/exchange" as Route,
    title: "Exchange",
    description: "Currency exchange with spread visibility and route-aware comparison.",
    stat: "Real-time rates",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M3 12l4-4M3 12l4 4M21 6H3M21 6l-4-4M21 6l-4 4" />
      </svg>
    ),
  },
];

const stats = [
  { value: "100+", label: "Partner Providers" },
  { value: "12", label: "EU Markets" },
  { value: "4.9", label: "User Rating" },
];

const trustPoints = [
  {
    title: "Independent comparison",
    description: "Rankings are built on product fit, cost, and quality — not on how much a provider pays us.",
  },
  {
    title: "Transparent methodology",
    description: "Every ranking factor is disclosed. You can see why an offer appears where it does.",
  },
  {
    title: "Commission disclosed",
    description: "When we earn commission, we say so. Compensation alone never determines ranking order.",
  },
];

export function HomePage() {
  return (
    <div className="grid gap-8">
      {/* Stats bar */}
      <section className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-line bg-bg-elevated p-6 sm:gap-16">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-ink">{stat.value}</p>
              <p className="mt-0.5 text-xs text-ink-tertiary">{stat.label}</p>
            </div>
            {i < stats.length - 1 && <div className="hidden h-8 w-px bg-line sm:block" />}
          </div>
        ))}
      </section>

      {/* Category grid */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-h2 text-ink">Browse products</h2>
          <Tag tone="accent">4 categories</Tag>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-line bg-bg-elevated p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-active hover:shadow-glow"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-bg-deep">
                {cat.icon}
              </div>
              <h3 className="text-lg font-semibold text-ink">{cat.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{cat.description}</p>
              <p className="mt-3 text-xs font-semibold text-primary">{cat.stat}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust section */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-[300px] w-[300px] rounded-full bg-secondary opacity-[0.03] blur-[80px]" />

        <div className="grid gap-8 p-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 lg:p-12">
          <div>
            <p className="text-caption uppercase tracking-widest text-secondary">Why Payn</p>
            <h2 className="mt-3 text-h2 text-ink">
              Financial comparison designed to be transparent and trustworthy.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
              Payn focuses on ranking clarity, visible disclosures, and product information
              you can actually use before you visit a provider site.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-elevated bg-bg-surface text-[10px] font-bold text-ink-secondary"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-tertiary">Trusted by 50,000+ Europeans</p>
            </div>
          </div>

          <div className="grid gap-4">
            {trustPoints.map((point, i) => (
              <div
                key={point.title}
                className="flex gap-4 rounded-xl border border-line bg-bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
