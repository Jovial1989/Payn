"use client";

import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { Tag } from "@/components/tag";
import { useAuth } from "@/hooks/use-auth";
import {
  dashboardNavItems,
  getDashboardHref,
  normalizeDashboardView,
} from "@/lib/dashboard-navigation";
import { localePath } from "@/lib/locale";

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
  const searchParams = useSearchParams();
  const { locale } = useMarketplacePreferences();
  const { user, profile, signOut } = useAuth();

  const activeView = useMemo(
    () => normalizeDashboardView(searchParams.get("view")),
    [searchParams],
  );

  const groupedItems = useMemo(
    () => ({
      core: dashboardNavItems.filter((item) => item.group === "core"),
      products: dashboardNavItems.filter((item) => item.group === "products"),
      account: dashboardNavItems.filter((item) => item.group === "account"),
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-5 lg:py-5">
        <aside className="overflow-hidden rounded-[30px] border border-line bg-white shadow-card lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:w-[280px] lg:flex-col">
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
                <p className="text-xs text-ink-tertiary">Financial control center</p>
              </div>
            </Link>
            <Tag tone="muted" className="hidden lg:inline-flex">
              Product
            </Tag>
          </div>

          <div className="border-b border-line px-3 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dashboardNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={getDashboardHref(item.id)}
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
                  Core
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.core.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Products
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.products.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
                  Account
                </p>
                <div className="mt-2 grid gap-1">
                  {groupedItems.account.map((item) => (
                    <SidebarItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      href={getDashboardHref(item.id)}
                      active={activeView === item.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-line px-5 py-5">
            <div className="rounded-[24px] bg-bg-surface px-4 py-4">
              <div className="flex items-center gap-3">
                {user?.email ? (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                    {user.email.split("@")[0].slice(0, 2).toUpperCase()}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {user?.email ? user.email.split("@")[0] : "Guest"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-tertiary">
                    {profile?.user_type
                      ? `${profile.user_type.charAt(0).toUpperCase()}${profile.user_type.slice(1)} profile`
                      : user ? "Account" : "Not signed in"}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={localePath(locale, "/")} className="text-xs font-semibold text-ink-secondary transition-colors hover:text-ink">
                  Back to site
                </Link>
                {user ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      window.location.href = localePath(locale, "/");
                    }}
                    className="text-xs font-semibold text-ink-secondary transition-colors hover:text-ink"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link href={localePath(locale, "/login")} className="text-xs font-semibold text-ink-secondary transition-colors hover:text-ink">
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="min-h-[calc(100vh-2.5rem)] rounded-[30px] border border-line bg-[#FBFCFD] p-4 shadow-card sm:p-5 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
