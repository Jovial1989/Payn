import Link from "next/link";

export function HelpDecide({ contactHref }: { contactHref: string }) {
  return (
    <section className="rounded-[28px] border border-line bg-white px-6 py-8 shadow-card sm:px-8">
      <div className="mb-6 flex items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          Before you decide
        </p>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Column 1 — How we rank */}
        <div>
          <p className="text-sm font-semibold text-ink">How Payn compares</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            We pull live terms from every provider, score them on real cost — fees, FX, and APR — and rank by what you will actually pay. We don't sell your data and we tell you which links pay us.
          </p>
        </div>

        {/* Column 2 — What we don't do */}
        <div>
          <p className="text-sm font-semibold text-ink">What we don't do</p>
          <ul className="mt-2 grid gap-2">
            {[
              "No financial advice",
              "No hidden ranking",
              "No fake urgency",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg-surface text-[10px] font-bold text-ink-tertiary">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Talk to a human */}
        <div>
          <p className="text-sm font-semibold text-ink">Talk to a person</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Stuck on a comparison? Email a real person.
          </p>
          <Link
            href={contactHref}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-emerald-strong transition-colors hover:text-accent-emerald"
          >
            Contact us →
          </Link>
        </div>
      </div>
    </section>
  );
}
