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
    <div className="min-h-screen bg-bg text-ink">
      <main className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        {!hideHero && title && description && (
          <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
            {eyebrow ? (
              <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{eyebrow}</p>
            ) : null}
            <h1 className="mt-4 max-w-3xl text-h1 text-ink">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-secondary">{description}</p>
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

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 sm:px-5 lg:grid-cols-[1fr_1.6fr_0.7fr] lg:px-8 lg:py-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent-emerald/15 bg-accent-emerald-soft">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12" stroke="#0F8A4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-ink">Payn</span>
              <span className="text-xs text-ink-tertiary">{preferences.countryLabel}</span>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary">
              {dictionary.footer.copy}
            </p>
            <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-ink">
              {dictionary.footer.credibility}
            </p>
            <p className="mt-4 max-w-lg text-xs leading-5 text-ink-tertiary">
              {dictionary.footer.disclaimer}
            </p>
          </div>

          {/* Footer column: Consumer & Invest */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                Banking & Cards
              </p>
              <div className="mt-3 grid gap-2.5">
                {(["banking","neobanks","savings","debit","cards","wallets"] as MarketplaceCategory[]).map((cat) => (
                  <Link key={cat} href={localePath(locale, `/${cat}`)}
                    className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                    {dictionary.categories[cat]}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                Send & Exchange
              </p>
              <div className="mt-3 grid gap-2.5">
                {(["transfers","remittance","exchange","travel","bnpl"] as MarketplaceCategory[]).map((cat) => (
                  <Link key={cat} href={localePath(locale, `/${cat}`)}
                    className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                    {dictionary.categories[cat]}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                Invest & Borrow
              </p>
              <div className="mt-3 grid gap-2.5">
                {(["investments","trading","crypto","loans","insurance","cashback"] as MarketplaceCategory[]).map((cat) => (
                  <Link key={cat} href={localePath(locale, `/${cat}`)}
                    className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                    {dictionary.categories[cat]}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                Business
              </p>
              <div className="mt-3 grid gap-2.5">
                {(["business","payroll","tax","expense","budgeting","kids"] as MarketplaceCategory[]).map((cat) => (
                  <Link key={cat} href={localePath(locale, `/${cat}`)}
                    className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                    {dictionary.categories[cat]}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {dictionary.footer.company}
            </p>
            <div className="mt-4 grid gap-3">
              <Link href={localePath(locale, "/discover")} className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                {productEntryActionLabel}
              </Link>
              <Link href={localePath(locale, "/about")} className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                {dictionary.nav.about}
              </Link>
              <Link href={localePath(locale, "/contact")} className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                {dictionary.nav.contact}
              </Link>
              <Link href={localePath(locale, "/waitlist")} className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                {dictionary.nav.mobileWaitlist}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
