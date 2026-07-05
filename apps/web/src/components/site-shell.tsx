"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";
import { motion, useScroll } from "motion/react";
import { useMemo } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { getProductEntryActionLabel } from "@/components/product-entry-action";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { categoryGroups } from "@/lib/marketplace";
import { getActiveCategoriesForCountry } from "@/lib/countries";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AffiliateDisclosureBanner } from "@/components/affiliate-disclosure-banner";

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
  const activeCategories = useMemo(() => getActiveCategoriesForCountry(preferences.country), [preferences.country]);
  const visibleCategoryGroups = useMemo(
    () => categoryGroups.map((g) => ({ ...g, categories: g.categories.filter((c) => activeCategories.has(c)) })).filter((g) => g.categories.length > 0),
    [activeCategories],
  );

  // ── Scroll progress ──────────────────────────────────────────────────────────
  // Thin emerald bar fixed to the top of the viewport that fills as the user
  // scrolls through the page. scrollYProgress is already 0→1 so we can pass
  // it directly to scaleX — no useTransform/useSpring needed.
  const { scrollYProgress: scaleX } = useScroll();

  return (
    <div className="min-h-screen overflow-x-clip bg-bg pb-20 text-ink md:pb-0">
      {/* Scroll progress bar */}
      <motion.div
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-accent-emerald"
        style={{ scaleX }}
      />
      <main className="mx-auto flex w-full min-w-0 max-w-[1240px] flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        {/* RESP.11 — Site-wide hero section: tightened mobile gutters
            (p-5 vs p-6), corner radius scales from 24px → 32px, and
            the h1 shrinks from text-h1 (44px) to 2rem on 375px so
            page titles like "Top European loans 2026" don't wrap into
            3 lines under the eyebrow. */}
        {!hideHero && title && description && (
          <section className="rounded-[24px] bg-gradient-to-br from-[#0D1812] to-[#13181A] p-5 sm:rounded-[32px] sm:p-8">
            {eyebrow ? (
              <p className="text-caption uppercase tracking-[0.28em] text-white/50">{eyebrow}</p>
            ) : null}
            <h1 className="mt-4 max-w-3xl text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-h1">{title}</h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/70 sm:text-base">{description}</p>
            {heroTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {heroTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
        {children}
      </main>

      {/* RESP.11 — Footer: was gap-8 + py-8 on mobile which felt
          stretched-out at 375px; bumped to gap-10 between column
          stacks because mobile collapses to single-column anyway and
          the vertical rhythm needs more separation between the brand
          block, category nav, and company links. */}
      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-10 sm:gap-8 sm:px-5 sm:py-8 lg:grid-cols-[1fr_1.6fr_0.7fr] lg:px-8 lg:py-10">
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
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-secondary">
              {dictionary.footer.credibility}
            </p>
            <p className="mt-4 max-w-lg text-xs leading-5 text-ink-tertiary">
              {dictionary.footer.disclaimer}
            </p>
          </div>

          {/* Footer columns — driven by shared categoryGroups registry, filtered by country */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-6">
              {visibleCategoryGroups.slice(0, 3).map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {dictionary.sidebarNav[group.labelKey]}
                  </p>
                  <div className="mt-3 grid gap-2.5">
                    {group.categories.map((cat) => (
                      <Link key={cat} href={localePath(locale, `/${cat}`)}
                        className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                        {dictionary.categories[cat]}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-6">
              {visibleCategoryGroups.slice(3).map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                    {dictionary.sidebarNav[group.labelKey]}
                  </p>
                  <div className="mt-3 grid gap-2.5">
                    {group.categories.map((cat) => (
                      <Link key={cat} href={localePath(locale, `/${cat}`)}
                        className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                        {dictionary.categories[cat]}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
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
              <Link href="/how-we-rank" className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                How we rank
              </Link>
              <Link href="/how-we-make-money" className="text-sm font-medium text-ink-secondary transition-colors hover:text-accent-emerald-strong">
                How we make money
              </Link>
              {/* BUG-015 — Legal pages exposed in the footer so the
                  GDPR / Impressumspflicht compliance surface is one
                  click from every page. Without these links the
                  signup-time T&C checkbox points nowhere. */}
              <Link
                href="/legal/terms"
                className="mt-2 text-sm font-medium text-ink-tertiary transition-colors hover:text-accent-emerald-strong"
              >
                Terms
              </Link>
              <Link
                href="/legal/privacy"
                className="text-sm font-medium text-ink-tertiary transition-colors hover:text-accent-emerald-strong"
              >
                Privacy
              </Link>
              <Link
                href="/legal/cookies"
                className="text-sm font-medium text-ink-tertiary transition-colors hover:text-accent-emerald-strong"
              >
                Cookies
              </Link>
              <Link
                href="/legal/imprint"
                className="text-sm font-medium text-ink-tertiary transition-colors hover:text-accent-emerald-strong"
              >
                Imprint
              </Link>
              <Link
                href="/legal/affiliate-disclosure"
                className="text-sm font-medium text-ink-tertiary transition-colors hover:text-accent-emerald-strong"
              >
                Affiliate disclosure
              </Link>
            </div>
          </div>
        </div>
        {/* Ghost wordmark — editorial footer accent, à la Semaloop.
            aria-hidden so screen readers skip it; select-none so it
            doesn't pollute clipboard on Cmd+A. */}
        <div aria-hidden="true" className="overflow-hidden border-t border-line/40">
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="select-none text-center text-[clamp(5rem,17vw,13rem)] font-extrabold leading-[0.82] tracking-[-0.04em] text-ink/[0.04]"
          >
            Payn
          </motion.p>
        </div>
      </footer>
      <MobileBottomNav />
      <AffiliateDisclosureBanner />
    </div>
  );
}
