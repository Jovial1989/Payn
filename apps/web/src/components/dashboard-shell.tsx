"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { Tag } from "@/components/tag";
import {
  getActiveDashboardView,
  getDashboardHref,
  getDashboardNavItems,
} from "@/lib/dashboard-navigation";
import { localePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";

function SidebarItem({
  label,
  description,
  href,
  active,
}: {
  label: string;
  description: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-[20px] px-4 py-3 transition-all",
        active
          ? "bg-black text-white shadow-subtle"
          : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
      )}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className={clsx("mt-1 text-xs", active ? "text-white/65" : "text-ink-tertiary")}>
        {description}
      </p>
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
  const dashboardNavItems = useMemo(() => getDashboardNavItems(locale), [locale]);

  const activeView = useMemo(
    () => getActiveDashboardView(pathname, searchParams.get("view")),
    [pathname, searchParams],
  );

  const groupedItems = useMemo(
    () => ({
      core: dashboardNavItems.filter((item) => item.group === "core"),
      products: dashboardNavItems.filter((item) => item.group === "products"),
      account: dashboardNavItems.filter((item) => item.group === "account"),
    }),
    [dashboardNavItems],
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-5 lg:py-5">
        <aside className="overflow-hidden rounded-[30px] border border-line bg-white shadow-subtle lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-[280px] lg:flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-5">
            <Link href={localePath(locale, "/")} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 12L8 4L12 12"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-ink">Payn</p>
                <p className="text-xs text-ink-tertiary">{uiCopy.dashboard.shellTitle}</p>
              </div>
            </Link>
            <Tag tone="muted" className="hidden lg:inline-flex">
              {uiCopy.dashboard.shellTag}
            </Tag>
          </div>

          <div className="border-b border-line px-3 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dashboardNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={getDashboardHref(item.id, locale)}
                  className={clsx(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    activeView === item.id
                      ? "bg-black text-white"
                      : "bg-bg-surface text-ink-secondary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden flex-1 overflow-y-auto px-3 py-4 lg:block">
            <div className="grid gap-5">
              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {uiCopy.dashboard.navGroups.core}
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.core.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id, locale)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {uiCopy.dashboard.navGroups.products}
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.products.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id, locale)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  {uiCopy.dashboard.navGroups.account}
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.account.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id, locale)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </aside>

        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2.5rem)] rounded-[30px] border border-line bg-[#FBFCFD] p-4 shadow-subtle sm:p-5 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
