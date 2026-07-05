// P1.3 — build-time re-verification report. Lists catalogue offers whose last
// verification date is past the report threshold (120 days) so they can be
// re-checked. Informational (never fails the build) — run with `pnpm report:stale`.
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { STALE_REPORT_DAYS, getStaleOffers } from "@/lib/staleness";

const now = new Date();
const stale = getStaleOffers(marketplaceOffers, now, STALE_REPORT_DAYS);

if (stale.length === 0) {
  console.log(`✓ report:stale — no offers past ${STALE_REPORT_DAYS} days without re-verification.`);
  process.exit(0);
}

console.warn(
  `\n⚠ report:stale — ${stale.length} offer(s) past ${STALE_REPORT_DAYS} days; re-verify terms:\n`,
);
for (const row of stale) {
  console.warn(`  ${String(row.days).padStart(4)}d  ${row.slug}  (${row.providerName})`);
}
console.warn("");
process.exit(0);
