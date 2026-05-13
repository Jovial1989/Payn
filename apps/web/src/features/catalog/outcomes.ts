import type { ComponentType, SVGProps } from "react";
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

export const OUTCOME_BUCKETS: OutcomeBucket[] = [
  { slug: "spend-smarter",    Icon: IconSpendSmarter,  bucketKey: "bucketSpendSmarter",  categories: ["cards", "debit", "cashback"],                          order: 1 },
  { slug: "earn-on-cash",     Icon: IconEarnOnCash,    bucketKey: "bucketEarnOnCash",    categories: ["savings"],                                              order: 2 },
  { slug: "travel-and-abroad",Icon: IconTravelAbroad,  bucketKey: "bucketTravel",        categories: ["transfers", "exchange", "travel", "remittance"],        order: 3 },
  { slug: "daily-banking",    Icon: IconDailyBanking,  bucketKey: "bucketBanking",       categories: ["banking", "neobanks", "wallets"],                       order: 4 },
  { slug: "invest-and-grow",  Icon: IconInvestGrow,    bucketKey: "bucketInvest",        categories: ["investments", "trading", "crypto"],                     order: 5 },
  { slug: "big-purchases",    Icon: IconBigPurchases,  bucketKey: "bucketBigPurchases",  categories: ["loans", "bnpl"],                                        order: 6 },
  { slug: "for-business",     Icon: IconForBusiness,   bucketKey: "bucketBusiness",      categories: ["business", "payroll", "tax", "expense"],               order: 7 },
  { slug: "family-and-kids",  Icon: IconFamilyKids,    bucketKey: "bucketFamily",        categories: ["kids", "budgeting"],                                    order: 8 },
  { slug: "protect",          Icon: IconProtect,       bucketKey: "bucketProtect",       categories: ["insurance"],                                            order: 9 },
];
