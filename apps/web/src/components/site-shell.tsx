import type { Route } from "next";
import { Header } from "@/components/header";
import { Tag } from "@/components/tag";

export function SiteShell({
  title,
  eyebrow,
  description,
  children,
  activeHref,
  heroTags = [],
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  activeHref?: Route;
  heroTags?: string[];
}) {
  return (
    <div className="min-h-screen bg-bg-deep">
      <Header activeHref={activeHref} />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-10 lg:px-8 lg:py-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-line bg-bg-elevated p-8 lg:p-12">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-primary opacity-[0.04] blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-secondary opacity-[0.03] blur-[80px]" />

          <div className="relative">
            <p className="text-caption uppercase tracking-widest text-primary">{eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-h1 text-ink sm:text-display">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-secondary">{description}</p>
            {heroTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {heroTags.map((tag) => (
                  <Tag key={tag} tone="muted">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </section>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-bg-deep">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="#040907" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-ink">Payn</span>
            <span className="text-xs text-ink-tertiary">European Financial Marketplace</span>
          </div>
          <p className="text-xs leading-5 text-ink-tertiary">
            Payn compares financial products from regulated European providers. Commission may be earned from some partners.
            Rankings are based on product fit, cost, and provider quality — not compensation alone.
          </p>
        </div>
      </footer>
    </div>
  );
}
