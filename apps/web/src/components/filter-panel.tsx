import type { MarketplaceCategory } from "@payn/types";
import clsx from "clsx";

const categoryNotes: Record<Exclude<MarketplaceCategory, "loans">, string> = {
  cards: "Card filtering will layer pricing, rewards, and annual fee signals into the same ranking framework.",
  transfers:
    "Transfer filtering will surface corridor, payout method, and speed preferences once live provider data is connected.",
  exchange:
    "FX filtering will focus on pair, execution window, and spread visibility as exchange products are added.",
};

const creditScoreOptions = [
  { label: "Excellent", detail: "720+" },
  { label: "Good", detail: "660 - 719" },
  { label: "Fair", detail: "600 - 659" },
  { label: "Building", detail: "Below 600" },
];

const purposeOptions = ["Debt consolidation", "Large purchases", "Home improvements", "Other personal use"];

export function FilterPanel({ category }: { category: MarketplaceCategory }) {
  if (category !== "loans") {
    return (
      <aside className="h-fit rounded-2xl border border-line bg-bg-elevated p-6 lg:sticky lg:top-20">
        <p className="text-caption uppercase tracking-widest text-primary">Filters</p>
        <h2 className="mt-3 text-h3 text-ink">Filters for {category}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{categoryNotes[category]}</p>
      </aside>
    );
  }

  return (
    <aside className="h-fit rounded-2xl border border-line bg-bg-elevated p-6 lg:sticky lg:top-20">
      <p className="text-caption uppercase tracking-widest text-primary">Refine</p>
      <h2 className="mt-3 text-h3 text-ink">Adjust your search</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Narrow results by amount, term, credit profile, and purpose.
      </p>

      <form className="mt-6 grid gap-6">
        {/* Amount slider */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="amount" className="text-sm font-medium text-ink">
              Amount
            </label>
            <span className="rounded-md bg-bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
              EUR 25,000
            </span>
          </div>
          <input
            id="amount"
            type="range"
            min="1000"
            max="50000"
            defaultValue="25000"
            className="mt-3 w-full accent-primary"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-ink-tertiary">
            <span>EUR 1k</span>
            <span>EUR 50k</span>
          </div>
        </section>

        {/* Term slider */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="term" className="text-sm font-medium text-ink">
              Term
            </label>
            <span className="rounded-md bg-bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
              48 months
            </span>
          </div>
          <input
            id="term"
            type="range"
            min="12"
            max="84"
            defaultValue="48"
            className="mt-3 w-full accent-primary"
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-ink-tertiary">
            <span>12 mo</span>
            <span>84 mo</span>
          </div>
        </section>

        {/* Credit score */}
        <section>
          <p className="text-sm font-medium text-ink">Credit score</p>
          <div className="mt-3 grid gap-1.5">
            {creditScoreOptions.map((option, index) => (
              <button
                key={option.label}
                type="button"
                className={clsx(
                  "flex items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-all duration-200",
                  index === 1
                    ? "border-line-active bg-primary-soft text-ink"
                    : "border-line bg-bg-surface text-ink-secondary hover:border-line-strong hover:text-ink",
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-ink-tertiary">{option.detail}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Purpose */}
        <section>
          <label htmlFor="purpose" className="text-sm font-medium text-ink">
            Purpose
          </label>
          <select
            id="purpose"
            defaultValue="Debt consolidation"
            className="mt-2 h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink transition-colors focus:border-line-active focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {purposeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>
      </form>

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs leading-5 text-ink-tertiary">
          Filters refine comparison views using information available from providers and Payn&apos;s ranking rules.
        </p>
      </div>
    </aside>
  );
}
