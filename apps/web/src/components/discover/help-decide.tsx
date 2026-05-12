import Link from "next/link";
import { discoverCopy as t } from "@/copy/discover.en";

export function HelpDecide({ contactHref }: { contactHref: string }) {
  const [col1, col2, col3] = t.helpDecide.columns;

  return (
    <section className="rounded-[28px] border border-line bg-white px-6 py-8 shadow-card sm:px-8">
      <div className="mb-6 flex items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          {t.helpDecide.eyebrow}
        </p>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-ink">{col1.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{col1.body}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">{col2.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{col2.body}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-ink">{col3.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{col3.body}</p>
          <Link
            href={contactHref}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-emerald-strong transition-colors hover:text-accent-emerald"
          >
            {col3.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
