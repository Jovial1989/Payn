import type { ReactNode } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/button";

export function DashboardSectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-subtle sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
          <h2 className="mt-3 text-h3 text-ink">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DashboardEmptyState({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-line-strong bg-white p-5">
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-4"}>
        {cta}
      </Link>
    </div>
  );
}

export function DashboardLoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-[28px] border border-line bg-white p-10 shadow-subtle">
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        <p className="text-sm text-ink-secondary">{label}</p>
      </div>
    </div>
  );
}

export function DashboardMetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-[22px] border border-line bg-white px-5 py-4 shadow-subtle">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
        {label}
      </p>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-ink-tertiary">{hint}</p> : null}
    </div>
  );
}

export function DashboardContextPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
      {children}
    </span>
  );
}
