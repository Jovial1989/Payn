// Providers manually blocked from the catalog, regardless of link health.
//
// Use this when a partner's affiliate link *resolves* server-side but is broken
// for real users — e.g. eToro returns an "unauthorised-ad" page only to certain
// traffic, so the automated link checker sees it as alive and would re-add it.
// A name here is excluded from the catalog AND skipped by the FinanceAds sync,
// so it never comes back. Remove the name to re-enable once fixed upstream
// (e.g. eToro affiliate account authorised in the FinanceAds dashboard).
const BLOCKED = new Set<string>([
  "etoro", // affiliate account unauthorised → every creative dead-ends for users
]);

function normalizeProvider(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function isBlockedProvider(name: string | null | undefined): boolean {
  if (!name) return false;
  return BLOCKED.has(normalizeProvider(name));
}
