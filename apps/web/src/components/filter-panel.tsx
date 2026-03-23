import type { MarketplaceCategory } from "@payn/types";
import clsx from "clsx";
import { SectionContainer } from "@/components/section-container";

const categoryNotes: Record<Exclude<MarketplaceCategory, "loans">, string> = {
  cards: "Card filtering will layer pricing, rewards, and annual fee signals into the same ranking framework.",
  transfers:
    "Transfer filtering will surface corridor, payout method, and speed preferences once live provider data is connected.",
  exchange:
    "FX filtering will focus on pair, execution window, and spread visibility as exchange products are added.",
};

const creditScoreOptions = [
  { label: "Excellent", detail: "720+" },
  { label: "Good", detail: "660-719" },
  { label: "Fair", detail: "600-659" },
  { label: "Building credit", detail: "Below 600" },
];

const purposeOptions = ["Debt consolidation", "Large purchases", "Home improvements", "Other personal use"];

export function FilterPanel({ category }: { category: MarketplaceCategory }) {
  if (category !== "loans") {
    return (
      <SectionContainer as="aside" className="h-fit lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Filters</p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-ink">
          Filters for {category}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{categoryNotes[category]}</p>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer as="aside" className="h-fit lg:sticky lg:top-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Filter loans</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">Adjust your search</h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        Narrow the ranked results by amount, repayment term, credit profile, and borrowing purpose.
      </p>

      <form className="mt-6 grid gap-6">
        <section>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="amount" className="text-sm font-medium text-ink">
              Amount
            </label>
            <span className="text-sm text-muted">EUR 25,000</span>
          </div>
          <input
            id="amount"
            type="range"
            min="1000"
            max="50000"
            defaultValue="25000"
            className="mt-3 w-full accent-primary"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>EUR 1k</span>
            <span>EUR 50k</span>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="term" className="text-sm font-medium text-ink">
              Term
            </label>
            <span className="text-sm text-muted">48 months</span>
          </div>
          <input
            id="term"
            type="range"
            min="12"
            max="84"
            defaultValue="48"
            className="mt-3 w-full accent-primary"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span>12 months</span>
            <span>84 months</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-medium text-ink">Credit score</p>
          <div className="mt-3 grid gap-2">
            {creditScoreOptions.map((option, index) => (
              <button
                key={option.label}
                type="button"
                className={clsx(
                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                  index === 1
                    ? "border-primary bg-panel-strong text-ink"
                    : "border-line bg-bg text-muted hover:bg-panel-strong",
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs">{option.detail}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label htmlFor="purpose" className="text-sm font-medium text-ink">
            Purpose
          </label>
          <select
            id="purpose"
            defaultValue="Debt consolidation"
            className="mt-3 h-12 w-full rounded-2xl border border-line bg-bg px-4 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {purposeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>
      </form>

      <div className="mt-6 border-t border-line pt-5">
        <p className="text-xs leading-5 text-muted">
          Filters refine comparison views and only use information available from providers and
          Payn&apos;s ranking rules.
        </p>
      </div>
    </SectionContainer>
  );
}
