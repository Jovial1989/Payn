"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; exact?: boolean };
type NavGroup = { heading: string; items: NavItem[] };

// Grouped information architecture for the admin panel.
// Catalog = the product data. Marketing = outbound comms + homepage surfaces.
// Insights = analytics. People = users. Dashboard = the at-a-glance overview.
const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Dashboard",
    items: [{ href: "/admin", label: "Overview", exact: true }],
  },
  {
    heading: "Catalog",
    items: [
      { href: "/admin/offers", label: "Offers" },
      { href: "/admin/offer-health", label: "Offer Health" },
      { href: "/admin/parser", label: "Import" },
    ],
  },
  {
    heading: "Marketing",
    items: [
      { href: "/admin/mail", label: "Email" },
      { href: "/admin/push", label: "Push" },
      { href: "/admin/highlights", label: "Highlights" },
      { href: "/admin/featured", label: "Featured" },
    ],
  },
  {
    heading: "Insights",
    items: [{ href: "/admin/clicks", label: "Clicks" }],
  },
  {
    heading: "People",
    items: [{ href: "/admin/users", label: "Users" }],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.heading} className="grid gap-0.5">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
            {group.heading}
          </p>
          {group.items.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[10px] px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent-emerald-soft text-accent-emerald-strong"
                    : "text-ink-secondary hover:bg-bg-surface hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
