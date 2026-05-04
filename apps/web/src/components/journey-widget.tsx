import Link from "next/link";
import clsx from "clsx";

export type JourneyItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  complete: boolean;
};

export function JourneyWidget({
  title,
  description,
  progress,
  items,
}: {
  title: string;
  description: string;
  progress: number;
  items: JourneyItem[];
}) {
  return (
    <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            Onboarding
          </p>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.03em] text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-[-0.04em] text-ink">{progress}%</p>
          <p className="text-xs text-ink-tertiary">Complete</p>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-[#ECEDEF]">
        <div
          className="h-full rounded-full bg-accent-emerald transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-start gap-3 rounded-[18px] border border-[#ECECEC] bg-[#F8F8F9] px-4 py-4 transition-colors hover:bg-white"
          >
            <div
              className={clsx(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                item.complete
                  ? "border-accent-emerald bg-accent-emerald text-white"
                  : "border-[#DADCE0] bg-white text-ink-tertiary",
              )}
            >
              {item.complete ? "✓" : "○"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
