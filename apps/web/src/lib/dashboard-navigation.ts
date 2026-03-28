import type { MarketplaceCategory } from "@payn/types";

export type DashboardView =
  | "dashboard"
  | "explore"
  | MarketplaceCategory
  | "profile";

export interface DashboardNavItem {
  id: DashboardView;
  label: string;
  group: "core" | "products" | "account";
  description: string;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    group: "core",
    description: "Overview and summary",
  },
  {
    id: "explore",
    label: "Explore",
    group: "core",
    description: "Browse and filter offers",
  },
  { id: "loans", label: "Loans", group: "products", description: "Borrowing options" },
  { id: "cards", label: "Cards", group: "products", description: "Payment cards" },
  { id: "transfers", label: "Transfers", group: "products", description: "Money movement" },
  { id: "exchange", label: "Exchange", group: "products", description: "Currency conversion" },
  { id: "insurance", label: "Insurance", group: "products", description: "Protection products" },
  { id: "investments", label: "Investments", group: "products", description: "Platforms and assets" },
  { id: "profile", label: "Profile", group: "account", description: "Preferences and setup" },
];

const dashboardViewSet = new Set<DashboardView>(dashboardNavItems.map((item) => item.id));

export function normalizeDashboardView(value?: string | null): DashboardView {
  if (value && dashboardViewSet.has(value as DashboardView)) {
    return value as DashboardView;
  }

  return "dashboard";
}

export function getDashboardHref(view: DashboardView) {
  return view === "dashboard" ? "/dashboard" : `/dashboard?view=${view}`;
}
