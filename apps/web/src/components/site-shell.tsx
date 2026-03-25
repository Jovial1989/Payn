import type { Route } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Tag } from "@/components/tag";

export function SiteShell({
  title,
  eyebrow,
  description,
  children,
  activeHref,
  heroTags = [],
  hideHero = false,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  activeHref?: Route;
  heroTags?: string[];
  hideHero?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg-deep">
      <Header activeHref={activeHref} />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-10 lg:px-8 lg:py-14">
        {!hideHero && (
          <section className="rounded-3xl bg-white p-8 shadow-card lg:p-12">
            <p className="text-caption uppercase tracking-widest text-ink-secondary">{eyebrow}</p>
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
          </section>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-ink">Payn</span>
            <span className="text-xs text-ink-tertiary">European Financial Marketplace</span>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex gap-6">
              <Link href="/about" className="text-xs font-medium text-ink-secondary transition-colors hover:text-ink">About</Link>
              <Link href="/contact" className="text-xs font-medium text-ink-secondary transition-colors hover:text-ink">Contact</Link>
            </div>
            <p className="max-w-lg text-xs leading-5 text-ink-tertiary lg:text-right">
              Payn compares financial products from regulated European providers. Commission may be earned from some partners.
              Rankings are based on product fit, cost, and provider quality. Compensation does not determine order.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
