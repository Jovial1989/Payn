"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import { Tag } from "@/components/tag";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { marketplaceCategories } from "@/lib/marketplace";

export function SiteShell({
  children,
  activePage,
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
  const { locale } = preferences;
  const productEntryActionLabel = getProductEntryActionLabel(locale);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200">
      <main className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        {!hideHero && title && description && (
          <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
            {eyebrow ? (
              <p className="text-caption uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
            ) : null}
            <h1 className="mt-4 max-w-3xl text-h1 text-slate-50">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-400">{description}</p>
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

      <footer className="border-t border-white/10 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8 lg:py-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-100">Payn</span>
              <span className="text-xs text-slate-500">{preferences.countryLabel}</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
              {dictionary.footer.copy}
            </p>
            <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-slate-200">
              {dictionary.footer.credibility}
            </p>
            <p className="mt-4 max-w-lg text-xs leading-5 text-slate-500">
              {dictionary.footer.disclaimer}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {dictionary.footer.compare}
            </p>
            <div className="mt-4 grid gap-3">
              {marketplaceCategories.map((category) => (
                <Link
                  key={category}
                  href={localePath(locale, `/${category}`)}
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
                >
                  {dictionary.categories[category]}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {dictionary.footer.company}
            </p>
            <div className="mt-4 grid gap-3">
              <Link href={localePath(locale, "/discover")} className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100">
                {productEntryActionLabel}
              </Link>
              <Link href={localePath(locale, "/about")} className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100">
                {dictionary.nav.about}
              </Link>
              <Link href={localePath(locale, "/contact")} className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100">
                {dictionary.nav.contact}
              </Link>
              <Link href={localePath(locale, "/waitlist")} className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-100">
                {dictionary.nav.mobileWaitlist}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
