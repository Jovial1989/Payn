import type { ComponentType, SVGProps } from "react";
import type { MarketplaceCategory } from "@payn/types";
import {
  IconSpendSmarter,
  IconEarnOnCash,
  IconTravelAbroad,
  IconDailyBanking,
  IconInvestGrow,
  IconBigPurchases,
  IconForBusiness,
  IconFamilyKids,
  IconProtect,
} from "@/features/home/bucket-icons";
import { CATEGORIES } from "@/lib/categories";

export type BucketKey =
  | "bucketSpendSmarter"
  | "bucketEarnOnCash"
  | "bucketTravel"
  | "bucketBanking"
  | "bucketInvest"
  | "bucketBigPurchases"
  | "bucketBusiness"
  | "bucketFamily"
  | "bucketProtect";

export interface OutcomeBucket {
  slug: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  bucketKey: BucketKey;
  categories: string[];
  order: number;
}

// V3 spec §1.1 — slugs are the plain-English category slugs from
// `lib/categories.ts` (cards, saving, sending-money, …). The previous
// bucket-jargon slugs (spend-smarter, earn-on-cash, …) were migrated to
// these new slugs as part of TASK-310, but this list lagged behind, so
// every `/explore/<new-slug>` request — including the ones that the
// next.config.ts 301 redirects rewrote to — fell through the
// `OUTCOME_BUCKETS.find(...)` lookup in `app/explore/[bucket]/page.tsx`
// and returned 404 across the board. The old slugs still resolve via
// the 301 redirects in next.config.ts → here.
//
// `bucketKey` is preserved so existing i18n strings keep their labels
// (the dictionary still keys off `bucketSpendSmarter` etc.); only the
// URL slug moved.
//
// "travel" sub-category lives under Cards: those offers (Wise Travel Card,
// Revolut Premium Travel, Curve Travel, N26 You Travel, etc.) are cards
// with travel-focused perks — not money-movement products. Keeping them
// in Sending money made users hunt across buckets for "travel cards".
export const OUTCOME_BUCKETS: OutcomeBucket[] = [
  { slug: "cards",         Icon: IconSpendSmarter, bucketKey: "bucketSpendSmarter",  categories: ["cards", "debit", "travel", "cashback"],        order: 1 },
  { slug: "saving",        Icon: IconEarnOnCash,   bucketKey: "bucketEarnOnCash",    categories: ["savings"],                                     order: 2 },
  { slug: "sending-money", Icon: IconTravelAbroad, bucketKey: "bucketTravel",        categories: ["transfers", "exchange", "remittance"],         order: 3 },
  { slug: "bank-accounts", Icon: IconDailyBanking, bucketKey: "bucketBanking",       categories: ["banking", "neobanks", "wallets"],              order: 4 },
  { slug: "investing",     Icon: IconInvestGrow,   bucketKey: "bucketInvest",        categories: ["investments", "trading", "crypto"],            order: 5 },
  { slug: "borrowing",     Icon: IconBigPurchases, bucketKey: "bucketBigPurchases",  categories: ["loans", "bnpl"],                               order: 6 },
  { slug: "for-business",  Icon: IconForBusiness,  bucketKey: "bucketBusiness",      categories: ["business", "payroll", "tax", "expense"],       order: 7 },
  { slug: "family",        Icon: IconFamilyKids,   bucketKey: "bucketFamily",        categories: ["kids", "budgeting"],                           order: 8 },
  { slug: "insurance",     Icon: IconProtect,      bucketKey: "bucketProtect",       categories: ["insurance"],                                   order: 9 },
];

// PASS A (routing) — the `/explore/<bucket>` vocabulary is retired. The
// canonical category surface is the flat `/en/<category>` route, so any
// surface that used to link to `/explore/<bucket.slug>` now translates the
// bucket slug through this single mapping. Kept here next to
// `OUTCOME_BUCKETS` so bucket identity and its flat destination stay in one
// place. (locale is a middleware rewrite — `localePath(locale, "/" + cat)`
// prepends the prefix.)
export const BUCKET_TO_FLAT_CATEGORY: Record<string, MarketplaceCategory> = {
  cards: "cards",
  saving: "savings",
  "sending-money": "transfers",
  "bank-accounts": "banking",
  investing: "investments",
  borrowing: "loans",
  "for-business": "business",
  family: "kids",
  insurance: "insurance",
};

export function flatCategoryForBucket(
  bucketSlug: string,
): MarketplaceCategory | null {
  return BUCKET_TO_FLAT_CATEGORY[bucketSlug] ?? null;
}

// Build-time guard against the regression that caused every /explore/<slug>
// to 404: `OUTCOME_BUCKETS` slugs drifted away from `lib/categories.ts`
// CATEGORIES slugs, so `app/explore/[bucket]/page.tsx` couldn't find any
// bucket and fell through to `notFound()`. The next.config.ts redirects
// also assume the new slug set lands on a real page. This check runs at
// module load (so during `next build`'s static analysis pass) and throws
// loudly if the two lists ever go out of sync again. The exact slug-by-
// slug equality is not required — `for-business` differs from `business`
// historically in the category id ("business" is the marketplace
// category, "for-business" is the bucket slug) — so we only assert that
// every CATEGORIES slug is reachable via at least one bucket. Drift in
// the other direction (a bucket with no matching category) is allowed.
{
  const bucketSlugs = new Set(OUTCOME_BUCKETS.map((b) => b.slug));
  const missing = CATEGORIES.map((c) => c.slug).filter((s) => !bucketSlugs.has(s));
  if (missing.length > 0) {
    throw new Error(
      `[outcomes.ts] OUTCOME_BUCKETS is missing slugs from lib/categories.ts CATEGORIES: ` +
        `${missing.join(", ")}. ` +
        `Every CategoryId.slug must appear as an OUTCOME_BUCKETS[].slug so /explore/<slug> resolves. ` +
        `Either add a bucket entry or update the canonical category slug.`,
    );
  }
}
