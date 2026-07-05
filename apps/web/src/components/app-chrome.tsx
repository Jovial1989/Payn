"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { marketplaceCategories } from "@/lib/marketplace";

// WEB.5 — Marketing header is hidden on any page wrapped in the
// workspace `AppShell`. Both shells used to render together on
// /discover and the category routes, which gave the user a "LOGGED IN /
// Dashboard" pill at the top AND a "petrov.cpay ▾" avatar dropdown
// directly under it — a literal duplicate of "you're authenticated".
// Listing those routes here removes the marketing chrome wherever
// AppShell is already in charge. The workspace inner header keeps the
// avatar dropdown so the user still has a single, clear account control.
const hiddenPrefixes = [
  "/dashboard",
  "/settings",
  "/login",
  "/signup",
  "/offers/",
  "/discover",
  "/hero-preview", // standalone dark hero — no light marketing chrome
];

// PASS A — the flat `/en/<category>` routes (cards, savings, …) each
// render their own `AppShell` inner header via their layout → ProductShell.
// Without listing them here, AppChrome ALSO rendered the marketing
// `<Header>` → two stacked headers. The set is derived from
// `marketplaceCategories` (single source of truth) and matched on whole
// path segments — `/en/cards`, `/cards`, `/cards?...` hide the marketing
// chrome, but an offer slug like `/offers/wise-travel-card` (which merely
// contains "travel"/"card") does not, and neither do marketing routes
// (/about, /help, /how-we-rank, …) which share no segment with a category.
const FLAT_CATEGORY_SEGMENT = new RegExp(
  `/(?:${marketplaceCategories.join("|")})(?:/|\\?|$)`,
);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspacePath = pathname
    ? hiddenPrefixes.some((prefix) => pathname.includes(prefix)) ||
      FLAT_CATEGORY_SEGMENT.test(pathname)
    : false;
  const shouldShowHeader = !isWorkspacePath;

  return (
    <>
      {shouldShowHeader ? <Header /> : null}
      {children}
    </>
  );
}
