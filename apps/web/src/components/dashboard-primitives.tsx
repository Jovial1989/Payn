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
    <section className="motion-section relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-3 text-h3 text-slate-100">{title}</h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
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
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.04] p-6">
      <p className="text-base font-bold text-slate-100">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
      <Link href={href} className={buttonStyles({ variant: "secondary", size: "md" }) + " mt-4 w-full justify-center sm:w-auto"}>
        {cta}
      </Link>
    </div>
  );
}

export function DashboardLoadingState({ label }: { label: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-md">
      <div className="grid gap-4 py-4">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="grid gap-4 rounded-[24px] border border-white/10 bg-black/20 p-6">
          <div className="h-10 w-full animate-pulse rounded-[18px] bg-white/8" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 animate-pulse rounded-[20px] bg-white/8" />
            <div className="h-24 animate-pulse rounded-[20px] bg-white/8" />
          </div>
        </div>
        <p className="text-sm text-slate-400">{label}</p>
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-2xl font-bold text-slate-100">{value}</div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function DashboardContextPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold leading-none text-slate-200 whitespace-nowrap">
      {children}
    </span>
  );
}
