"use client";

import clsx from "clsx";
import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/button";
import {
  getProductEntryActionLabel,
  SearchIcon,
} from "@/components/product-entry-action";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { trackSignInClicked } from "@/lib/analytics";
import { getDictionary } from "@/lib/i18n";
import { localePath, switchLocalePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";
import { marketplaceCategories } from "@/lib/marketplace";
import { getActiveCategoriesForCountry } from "@/lib/countries";
import { OUTCOME_BUCKETS, flatCategoryForBucket } from "@/features/catalog/outcomes";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { AffiliateDisclosureBanner } from "@/components/affiliate-disclosure-banner";
import { CompareProvider } from "@/features/compare/compare-store";
// WEB.2 — `CompareBar` (bottom-docked floating ribbon) was deleted.
// Compare CTA lives inline on the Dashboard via `<CompareReadyCard />`
// now — no global floating chrome.
// WEB.4 — Compare chip is wired into the dashboard inner-header below
// (workspace pages don't render the marketing site Header).
import { CompareHeaderChip } from "@/features/compare/compare-header-chip";
import { categoryGroups } from "@/lib/marketplace";

// Resolve the pillar label for a given category by walking the 5+1
// canonical groups in `categoryGroups`. Returns null if the category
// isn't classified — caller falls back to "Payn / Section".
function findPillarForCategory(
  category: string,
  dictionary: ReturnType<typeof getDictionary>,
): string | null {
  const group = categoryGroups.find((g) => (g.categories as string[]).includes(category));
  if (!group) return null;
  return dictionary.sidebarNav[group.labelKey];
}

// PASS A (routing) — bucket→flat-category mapping lives in
// `features/catalog/outcomes.ts` (single source of truth, next to
// OUTCOME_BUCKETS). The sidebar links and active-state check use
// `flatCategoryForBucket` imported from there.

type AppNavItem = {
  id: "dashboard" | "discover" | MarketplaceCategory | "settings";
  label: string;
  href: string;
  icon?: React.ReactNode;
  disabledWhenLoggedOut?: boolean;
};

type AppSection = AppNavItem["id"] | "offers" | "login" | "signup" | "other";

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function resolveCurrentSection(pathname: string | null): AppSection {
  if (!pathname) return "other";
  if (pathname.includes("/dashboard")) return "dashboard";
  if (pathname.includes("/settings")) return "settings";
  if (pathname.includes("/offers/")) return "offers";
  if (pathname.includes("/login")) return "login";
  if (pathname.includes("/signup")) return "signup";
  if (pathname.includes("/discover")) return "discover";
  // PASS A (routing) — the `/explore/<bucket>` vocabulary is retired; the
  // canonical category surface is the flat `/en/<category>` route, which
  // the loop below matches directly. (The old short-circuit existed only
  // to stop `/explore/travel-and-abroad` from masquerading as `/travel`.)
  for (const cat of marketplaceCategories) {
    if (pathname.includes(`/${cat}`)) return cat;
  }
  return "other";
}

function getSectionTitle(
  section: AppSection,
  labels: Record<string, string>,
  authLabels: { signIn: string; createAccount: string; offerDetails: string },
) {
  if (section === "dashboard") return labels.dashboard;
  if (section === "settings") return labels.settings;
  if (section === "offers") return authLabels.offerDetails;
  if (section === "login") return authLabels.signIn;
  if (section === "signup") return authLabels.createAccount;
  return labels[section] ?? "Payn";
}

function SidebarLink({
  label,
  href,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <span className="flex w-full items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold text-ink-tertiary opacity-55">
        {icon}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors",
        active
          ? "bg-accent-emerald-soft text-accent-emerald-strong shadow-[0_0_0_1px_rgba(15,138,75,0.15)]"
          : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 3l3 3-3 3" />
    </svg>
  );
}

// Inline icon set for sidebar items that previously rendered without one.
// Stroke-based, currentColor-driven so they inherit text-ink-tertiary /
// hover colours from the SidebarLink wrapper. Keeping these inline (no
// external icon library) is consistent with the SearchIcon / ChevronIcon
// pattern already in this file.
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="5" rx="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1.2" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 7h-9M6 3.5L2.5 7 6 10.5" />
    </svg>
  );
}

// TASK-303 (PR-V3-02) — `CollapsibleBucketGroup` deleted. Each bucket
// is a single flat `SidebarLink` now. The sub-category taxonomy that
// used to fold under the chevron lives exclusively as chip filters on
// the bucket page (TASK-304 + `SUB_CATEGORIES`).

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const isAdmin = user?.app_metadata?.role === "admin"; // SEC-FIX PAYN-A13: only app_metadata is server-set
  const preferences = useMarketplacePreferences();
  const dictionary = getDictionary(preferences.locale);
  const uiCopy = getUiCopy(preferences.locale);
  const productEntryActionLabel = getProductEntryActionLabel(preferences.locale);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const activeCategories = useMemo(
    () => getActiveCategoriesForCountry(preferences.country),
    [preferences.country],
  );
  // Atlas buckets are the sole navigation tree now. Filter each bucket's
  // sub-categories to those present in the user's country; drop any bucket
  // that ends up empty. Order from OUTCOME_BUCKETS.order.
  const visibleBuckets = useMemo(
    () =>
      [...OUTCOME_BUCKETS]
        .sort((a, b) => a.order - b.order)
        .map((bucket) => ({
          bucket,
          visibleCategories: (bucket.categories as MarketplaceCategory[]).filter((c) =>
            activeCategories.has(c),
          ),
        }))
        .filter(({ visibleCategories }) => visibleCategories.length > 0),
    [activeCategories],
  );

  const systemItems = useMemo<AppNavItem[]>(
    () => [
      {
        id: "dashboard",
        label: uiCopy.dashboard.navItems.dashboard.label,
        href: localePath(preferences.locale, "/dashboard"),
        icon: <DashboardIcon className="h-4 w-4 shrink-0" />,
      },
      {
        id: "discover",
        label: productEntryActionLabel,
        href: localePath(preferences.locale, "/discover"),
        icon: <SearchIcon className="h-4 w-4 shrink-0" />,
      },
    ],
    [preferences.locale, productEntryActionLabel, uiCopy.dashboard.navItems],
  );

  // Settings now ships with its own icon so it stops looking orphaned at
  // the bottom of the sidebar — every other sidebar item has one (per UX
  // audit). Same SidebarLink wiring as systemItems[].
  const settingsItem = useMemo<AppNavItem>(
    () => ({
      id: "settings",
      label: uiCopy.dashboard.navItems.profile.label,
      href: localePath(preferences.locale, "/settings"),
      icon: <SettingsIcon className="h-4 w-4 shrink-0" />,
      disabledWhenLoggedOut: true,
    }),
    [preferences.locale, uiCopy.dashboard.navItems],
  );

  const navItems = useMemo<AppNavItem[]>(
    () => [
      ...systemItems,
      ...marketplaceCategories.map((cat) => ({
        id: cat as AppNavItem["id"],
        label: dictionary.categories[cat],
        href: localePath(preferences.locale, `/${cat}`),
      })),
      settingsItem,
    ],
    [dictionary.categories, preferences.locale, systemItems, settingsItem],
  );

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [navItems, router]);

  useEffect(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Expanded set is keyed by bucket slug now. Auto-open the bucket whose
  // sub-category the user is currently viewing (e.g. on /banking,
  // TASK-303 — `expandedBuckets` + `toggleBucket` removed with the
  // collapsible sidebar. Sidebar is flat; bucket pages own their own
  // sub-category state via chips. `currentSection` is still needed
  // elsewhere (highlighting the active top-level system item).
  const currentSection = resolveCurrentSection(pathname);

  function isOnBucketPage(bucketSlug: string): boolean {
    // PASS A — buckets now link to the flat category route; the sidebar
    // entry is active when the user is on that category's flat path.
    const flat = flatCategoryForBucket(bucketSlug);
    if (!flat) return false;
    return pathname?.includes(`/${flat}`) ?? false;
  }

  const sectionLabels = useMemo(
    () => ({
      dashboard: uiCopy.dashboard.navItems.dashboard.label,
      discover: productEntryActionLabel,
      settings: uiCopy.dashboard.navItems.profile.label,
      ...Object.fromEntries(marketplaceCategories.map((cat) => [cat, dictionary.categories[cat]])),
    }),
    [dictionary.categories, productEntryActionLabel, uiCopy.dashboard.navItems],
  );
  const currentSectionTitle = getSectionTitle(currentSection, sectionLabels, {
    signIn: uiCopy.auth.signIn,
    createAccount: uiCopy.auth.createAccount,
    offerDetails: dictionary.offerDetail.detailEyebrow,
  });
  const displayName =
    [profile?.first_name?.trim(), profile?.last_name?.trim()].filter(Boolean).join(" ") ||
    user?.email?.split("@")[0] ||
    "Payn";
  const avatarInitials = getInitials(displayName) || "P";
  const handleSignInClick = () => {
    trackSignInClicked({
      country: preferences.country,
      language: preferences.locale,
      loggedIn: false,
    });
  };

  const handleLanguageChange = (nextLocale: typeof preferences.locale) => {
    preferences.setLanguage(nextLocale);
    startTransition(() => {
      router.push(switchLocalePath(pathname ?? localePath(preferences.locale, "/discover"), nextLocale));
    });
  };

  const handleCountryChange = (nextCountry: string) => {
    startTransition(() => {
      preferences.setCountry(nextCountry);
    });
  };

  const handleSignOut = async () => {
    // signOut() clears local state then navigates to /api/v1/auth/signout
    // (GET redirect). The server clears cookies and redirects to home.
    await signOut();
  };

  return (
    <CompareProvider>
    {/* RESP.13 — Outer container gutters trimmed to px-2 on 375px
        (was px-3). The inner white card carries its own border + rounded
        corners, so the page now has 8px between the card edge and the
        viewport instead of 12px, freeing more space for the headline
        + offer cards inside. */}
    <div className="min-h-screen overflow-x-hidden bg-bg text-ink pb-20 md:pb-0">
      <div className="mx-auto flex w-full min-w-0 max-w-[1600px] gap-4 px-2 py-3 sm:px-4 sm:py-4 lg:flex-row lg:px-5 lg:py-5">
        <aside className="hidden overflow-hidden rounded-[24px] border border-line bg-white shadow-card lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-[248px] lg:flex-col">
          {/* Compact back-link — the full-size Payn lockup used to live here,
              which doubled the brand mark already visible in the outer page
              header. Per UX audit: one Payn at the top, a quiet arrow inside
              the dashboard shell. */}
          {/* WEB.6 — Explicit `prefetch` so Next.js warms the
              marketing homepage chunk + RSC payload as soon as this
              link is in the viewport. User reported a ~5s delay on
              back-to-site; default Next.js 16 viewport prefetch is
              less aggressive than 15, so opting in here makes the
              click feel instant after the first second of dwell. */}
          <Link
            prefetch
            href={localePath(preferences.locale, "/")}
            className="flex items-center gap-2 border-b border-line px-5 py-3 text-[13px] font-medium text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>{uiCopy.common.backToSite}</span>
          </Link>

          <div className="hidden flex-1 overflow-y-auto px-3 py-4 lg:block">
            <div className="grid gap-1">
              {systemItems.map((item) => (
                <SidebarLink key={item.id} label={item.label} href={item.href} icon={item.icon}
                  active={item.id === currentSection} onClick={() => undefined} />
              ))}
            </div>

            {/* TASK-303 (PR-V3-02) — Flat sidebar per V1 brief §B. The
                previous `CollapsibleBucketGroup` rendered each bucket
                as an expandable parent with one nav row per inner
                category (`Banking → Banking / Neobanks / Wallets`).
                That tree is gone — the sub-category taxonomy now lives
                exclusively as chip filters inside the category page
                (TASK-304 + `SUB_CATEGORIES`). Each top-level bucket is
                a single `SidebarLink` straight to the flat
                `/<category>` route (PASS A). */}
            <div className="mt-4">
              <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Browse
              </p>
              <div className="grid gap-0.5">
                {visibleBuckets.map(({ bucket }) => (
                  <SidebarLink
                    key={bucket.slug}
                    label={dictionary.homeAtlas[bucket.bucketKey].title}
                    href={localePath(preferences.locale, `/${flatCategoryForBucket(bucket.slug) ?? bucket.slug}`)}
                    active={isOnBucketPage(bucket.slug)}
                    onClick={() => undefined}
                  />
                ))}
              </div>
            </div>

            {/* WEB.5 — Settings entry was duplicated in the sidebar
                AND in the avatar dropdown (top-right). The dropdown
                wins because it's already where the user expects
                account-scoped actions; keeping it twice clutters
                the sidebar's product-discovery focus. Sidebar entry
                removed. */}
          </div>
        </aside>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(88vw,340px)] flex-col overflow-y-auto border-r border-line bg-white px-4 py-4 shadow-elevated lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <Link
                  prefetch
                  href={localePath(preferences.locale, "/")}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-ink-tertiary transition-colors hover:text-ink"
                >
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  <span>{uiCopy.common.backToSite}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                  aria-label="Close navigation"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>

              <div className="mt-5 grid gap-1">
                {systemItems.map((item) => (
                  <SidebarLink key={item.id} label={item.label} href={item.href} icon={item.icon}
                    active={item.id === currentSection} onClick={() => setMobileNavOpen(false)} />
                ))}
              </div>

              {/* TASK-303 — Same flat sidebar pattern as desktop. */}
              <div className="mt-4">
                <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                  Browse
                </p>
                <div className="grid gap-0.5">
                  {visibleBuckets.map(({ bucket }) => (
                    <SidebarLink
                      key={bucket.slug}
                      label={dictionary.homeAtlas[bucket.bucketKey].title}
                      href={localePath(preferences.locale, `/${flatCategoryForBucket(bucket.slug) ?? bucket.slug}`)}
                      active={isOnBucketPage(bucket.slug)}
                      onClick={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* WEB.5 — Same Settings removal applied to the mobile
                  sidebar drawer for consistency with desktop. */}

              <div className="mt-6 grid gap-3 rounded-[22px] border border-line bg-bg-surface px-4 py-4">
                <label className="grid gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.nav.country}
                  </span>
                  <select
                    value={preferences.country}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    className="h-11 rounded-[16px] border border-line bg-white px-3 text-sm font-semibold text-ink outline-none"
                  >
                    {preferences.availableCountries.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                    {dictionary.nav.language}
                  </span>
                  <select
                    value={preferences.locale}
                    onChange={(event) => handleLanguageChange(event.target.value as typeof preferences.locale)}
                    className="h-11 rounded-[16px] border border-line bg-white px-3 text-sm font-semibold text-ink outline-none"
                  >
                    {Object.entries(dictionary.locales).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-[16px] border border-line bg-white px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{dictionary.nav.currency}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{preferences.currency}</p>
                </div>
              </div>
            </aside>
          </>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2.5rem)] rounded-[24px] border border-line bg-white shadow-card">
            <header className="border-b border-line bg-white/95 px-3 py-3 backdrop-blur-md sm:px-4 sm:py-4 lg:sticky lg:top-0 lg:z-30 lg:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(true);
                      setAccountMenuOpen(false);
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-bg-surface lg:hidden"
                    aria-label="Open navigation"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 6h14M3 10h14M3 14h14" />
                    </svg>
                  </button>

                  {/* Breadcrumb — kills the "HOME PAYN Payn" double-prefix.
                      Was: uppercase "HOME / Section" + duplicate H1 below.
                      Now: a single nested breadcrumb `Payn / {Pillar} / {Section}`
                      with proper visual hierarchy. Page content owns its
                      own H1 — the shell only carries the trail.

                      Special cases — leaf segment is suppressed when:
                        • section is "other" (e.g. /explore/<bucket> where the
                          page already renders its own header + back-link)
                        • section is "offers" (PDP — the page hero IS the
                          identity; "Payn / Offer detail" added noise)
                        • leaf would resolve to literal "Payn" (the "other"
                          fallback, which would print "Payn / Payn"). */}
                  {(() => {
                    const pillar = currentSection !== "dashboard" && currentSection !== "settings" && currentSection !== "discover" && currentSection !== "offers" && currentSection !== "other"
                      ? findPillarForCategory(currentSection, dictionary)
                      : null;
                    const showLeaf =
                      currentSection !== "other" &&
                      currentSection !== "offers" &&
                      currentSectionTitle !== "Payn";
                    return (
                      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                        <ol className="flex items-center gap-1.5 text-[12px] text-ink-tertiary">
                          <li>
                            <Link
                              href={localePath(preferences.locale, "/")}
                              className="font-medium underline-offset-2 transition-colors hover:text-ink hover:underline"
                            >
                              Payn
                            </Link>
                          </li>
                          {pillar && (
                            <>
                              <li className="text-line-strong" aria-hidden="true">/</li>
                              <li className="font-medium">{pillar}</li>
                            </>
                          )}
                          {showLeaf && (
                            <>
                              <li className="text-line-strong" aria-hidden="true">/</li>
                              <li className="min-w-0 flex-1 truncate font-bold text-ink">
                                {currentSectionTitle}
                              </li>
                            </>
                          )}
                        </ol>
                      </nav>
                    );
                  })()}
                </div>

                {/* WEB.4 — Compare chip inside the dashboard's inner
                    header. The marketing-site Header is hidden under
                    `/dashboard`, so without this the desktop user has
                    no global Compare indicator while inside the
                    workspace. Renders nothing when the set is empty. */}
                <CompareHeaderChip locale={preferences.locale} />

                {/* Account control — logged-in users get a compact avatar
                    button that opens a menu with their identity + Settings +
                    Sign out. Logged-out users see a Sign in / Create
                    account pair. Both states needed because the dashboard
                    routes don't render the marketing-site header above. */}
                <div className="relative flex shrink-0 items-center gap-2">
                  {user ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setAccountMenuOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={accountMenuOpen}
                        className="group inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[13px] font-semibold text-ink shadow-subtle transition-all hover:border-accent-emerald/40 hover:shadow-card"
                      >
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-emerald-soft text-[11px] font-bold text-accent-emerald-strong">
                          {avatarInitials}
                        </span>
                        <span className="hidden max-w-[120px] truncate sm:inline">
                          {displayName}
                        </span>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`}>
                          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {accountMenuOpen && (
                        <>
                          <button
                            type="button"
                            aria-label="Close account menu"
                            onClick={() => setAccountMenuOpen(false)}
                            className="fixed inset-0 z-30 cursor-default bg-transparent"
                          />
                          <div
                            role="menu"
                            className="absolute right-0 top-full z-40 mt-2 w-[240px] overflow-hidden rounded-2xl border border-line bg-white shadow-elevated"
                          >
                            <div className="border-b border-line px-4 py-3">
                              <p className="truncate text-[13px] font-bold text-ink">{displayName}</p>
                              {user.email && (
                                <p className="mt-0.5 truncate text-[12px] text-ink-tertiary">{user.email}</p>
                              )}
                            </div>
                            <div className="py-1">
                              <Link
                                href={settingsItem.href}
                                onClick={() => setAccountMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                              >
                                <SettingsIcon className="h-3.5 w-3.5" />
                                <span>Settings</span>
                              </Link>
                              <button
                                type="button"
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-[13px] font-medium text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M6 3H3v10h3M10 11l3-3-3-3M5 8h8" />
                                </svg>
                                <span>Sign out</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* RESP.13 — At 375px the previous "Sign in" +
                          "Create account" pair (~220px combined) plus
                          the hamburger + breadcrumb pushed the whole
                          header off-screen. On mobile we drop the
                          "Create account" CTA (still reachable via
                          /signup link from the hamburger menu and the
                          marketing site hero), and shrink "Sign in"
                          to a compact pill. Full pair returns at sm. */}
                      <Link
                        href={`${localePath(preferences.locale, "/login")}?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
                        className="inline-flex h-9 items-center rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink transition-colors hover:border-accent-emerald/40 hover:text-accent-emerald-strong sm:px-4"
                      >
                        Sign in
                      </Link>
                      <Link
                        href={localePath(preferences.locale, "/signup")}
                        className={`${buttonStyles({ variant: "primary", size: "sm" })} hidden sm:inline-flex`}
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* RESP.13 — Inner content padded p-3 on 375px (was p-4)
                to give nested cards an extra 8px each side; sm: returns
                to the original p-6/p-8 ladder. Also `min-w-0` makes
                sure children can shrink past their intrinsic width
                when constrained by the flex parent above. */}
            <div className="min-w-0 p-3 sm:p-6 lg:p-8">{children}</div>
          </div>
        </div>
      </div>
      <MobileBottomNav />
      <AffiliateDisclosureBanner />
      {/* WEB.2 — `<CompareBar />` removed; see import comment above. */}
    </div>
    </CompareProvider>
  );
}
