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
    <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
          <h2 className="mt-3 text-h3 text-ink">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
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
    <div className="rounded-[20px] border border-dashed border-line-strong bg-white p-5">
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-4 w-full justify-center sm:w-auto"}>
        {cta}
      </Link>
    </div>
  );
}

export function DashboardLoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-[24px] border border-[#EAEAEA] bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="grid gap-4 py-4">
        <div className="h-5 w-32 animate-pulse rounded-full bg-[#ECEEF2]" />
        <div className="grid gap-3 rounded-[24px] border border-[#EAEAEA] bg-[#FCFCFD] p-5">
          <div className="h-10 w-full animate-pulse rounded-[18px] bg-[#ECEEF2]" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-[20px] bg-[#F1F2F4]" />
            <div className="h-24 animate-pulse rounded-[20px] bg-[#F1F2F4]" />
          </div>
        </div>
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
    <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
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
    <span className="rounded-full border border-[#EAEAEA] bg-[#F7F7F8] px-3 py-1.5 text-xs font-semibold text-ink">
      {children}
    </span>
  );
}
