"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { Header } from "@/components/header";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { Tag } from "@/components/tag";
import { getDictionary } from "@/lib/i18n";
import { getMarketCategoryHref, marketplaceCategories } from "@/lib/marketplace";

export function SiteShell({
  children,
  activePage = "marketplace",
  activeCategory,
  eyebrow,
  title,
  description,
  heroTags = [],
  hideHero = false,
}: {
  children: React.ReactNode;
  activePage?: "marketplace" | "about" | "contact" | "waitlist";
  activeCategory?: MarketplaceCategory;
  eyebrow?: string;
  title?: string;
  description?: string;
  heroTags?: string[];
  hideHero?: boolean;
}) {
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header activePage={activePage} activeCategory={activeCategory} />
      <main className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-8 lg:px-8 lg:py-10">
        {!hideHero && title && description && (
          <section className="rounded-[32px] border border-line bg-white p-6 shadow-card lg:p-8">
            {eyebrow ? (
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
            ) : null}
            <h1 className="mt-3 max-w-3xl text-h1 text-ink">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-secondary">{description}</p>
            {heroTags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
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

      <footer className="border-t border-line bg-white/95">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-ink">Payn</span>
              <span className="text-xs text-ink-tertiary">{dictionary.markets[preferences.market]}</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary">
              {dictionary.footer.copy}
            </p>
            <p className="mt-4 max-w-lg text-xs leading-5 text-ink-tertiary">
              {dictionary.footer.disclaimer}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {dictionary.footer.compare}
            </p>
            <div className="mt-4 grid gap-3">
              {marketplaceCategories.map((category) => (
                <Link
                  key={category}
                  href={getMarketCategoryHref(preferences.market, category)}
                  className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
                >
                  {dictionary.categories[category]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {dictionary.footer.company}
            </p>
            <div className="mt-4 grid gap-3">
              <Link href="/about" className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                {dictionary.nav.about}
              </Link>
              <Link href="/contact" className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                {dictionary.nav.contact}
              </Link>
              <Link href="/waitlist" className="text-sm font-medium text-ink-secondary transition-colors hover:text-ink">
                {dictionary.nav.mobileWaitlist}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
