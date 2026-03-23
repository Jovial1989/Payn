import type { Route } from "next";
import Link from "next/link";
import { SectionContainer } from "@/components/section-container";
import { Tag } from "@/components/tag";

const intents = [
  {
    href: "/loans" as Route,
    title: "Loans",
    description: "Compare personal loans with transparent ranking, borrowing ranges, and application details.",
  },
  {
    href: "/cards" as Route,
    title: "Cards",
    description: "Review fees, credit limits, and card features without burying the important terms.",
  },
  {
    href: "/transfers" as Route,
    title: "Transfers",
    description: "Compare money transfer providers on speed, payout method, and corridor coverage.",
  },
  {
    href: "/exchange" as Route,
    title: "Exchange",
    description: "See currency exchange options with spread visibility and route-aware comparison.",
  },
];

const principles = [
  "Independent comparison",
  "Transparent ranking logic",
  "Commission disclosed when applicable",
];

export function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_320px]">
      <section className="grid gap-4 md:grid-cols-2">
        {intents.map((intent) => (
          <SectionContainer
            key={intent.href}
            as={Link}
            href={intent.href}
            className="transition-colors hover:bg-panel-strong"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Marketplace</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink">{intent.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{intent.description}</p>
          </SectionContainer>
        ))}
      </section>

      <SectionContainer className="h-fit">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Why Payn</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">
          Financial comparison designed to be readable and trustworthy.
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          Payn focuses on ranking clarity, visible disclosures, and product information people can
          use before they leave for a provider site.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {principles.map((principle) => (
            <Tag key={principle} tone="muted">
              {principle}
            </Tag>
          ))}
        </div>
      </SectionContainer>
    </div>
  );
}
