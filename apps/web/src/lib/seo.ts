import type { Metadata } from "next";
import type { MarketplaceCategory, MarketplaceLocale } from "@payn/types";
import { normalizeLocale, supportedLocales } from "@/lib/marketplace";

// Pass B (SEO net-new). Canonical surface for a category is the FLAT
// per-locale route `/<locale>/<category>` — never `/explore/*` (Pass A
// already 301'd those into flat). hreflang covers exactly the 4 locales
// the app actually serves (`supportedLocales`: en, de, es, fr) plus an
// `x-default` pointing at the English flat URL.
//
// URLs here are root-relative; `metadataBase` in the root layout makes
// them absolute (https://payn.online/...), so we never hardcode the
// origin twice.

type CategoryCopy = { title: string; description: string };

// Intent-mapped, factual one-liners. Deliberately light — concise titles
// and a single descriptive sentence per category, no keyword stuffing.
// All copy is English; this pass does not translate metadata per locale.
const categoryCopy: Record<MarketplaceCategory, CategoryCopy> = {
  cards: {
    title: "Compare credit cards across Europe — ranked by real cost | Payn",
    description:
      "Compare European credit cards on annual fees, APR, and rewards, ranked transparently so the real cost is clear before you apply.",
  },
  savings: {
    title: "Compare savings accounts across Europe — ranked by real return | Payn",
    description:
      "Compare European savings accounts on interest rate, access terms, and deposit protection, ranked on the return you actually keep.",
  },
  transfers: {
    title: "Compare money transfer services across Europe — ranked by real cost | Payn",
    description:
      "Compare international money transfer providers on fees, exchange-rate markup, and delivery speed, ranked by the amount that actually arrives.",
  },
  loans: {
    title: "Compare loans across Europe — ranked by real cost | Payn",
    description:
      "Compare European personal loans on APR, term, and total repayable, ranked so the true cost of borrowing is visible upfront.",
  },
  insurance: {
    title: "Compare insurance across Europe — ranked by real value | Payn",
    description:
      "Compare European insurance cover on premium, exclusions, and protection, ranked to show where the value genuinely sits.",
  },
  banking: {
    title: "Compare bank accounts across Europe — ranked by real cost | Payn",
    description:
      "Compare European bank accounts on monthly fees, perks, and conditions, ranked transparently so the everyday cost is clear.",
  },
  investments: {
    title: "Compare investment platforms across Europe — ranked by real cost | Payn",
    description:
      "Compare European investment platforms on fees, choice, and access, ranked on the cost that actually erodes returns.",
  },
  business: {
    title: "Compare business accounts across Europe — ranked by real cost | Payn",
    description:
      "Compare European business banking on pricing, features, and eligibility, ranked so the real cost for your company is clear.",
  },
  kids: {
    title: "Compare kids & family accounts across Europe — ranked clearly | Payn",
    description:
      "Compare European kids and family money accounts on controls, fees, and age limits, ranked transparently for parents.",
  },
  crypto: {
    title: "Compare crypto platforms across Europe — ranked by real cost | Payn",
    description:
      "Compare European crypto platforms on fees, spreads, and supported assets, ranked on the cost you actually pay to trade.",
  },
  exchange: {
    title: "Compare currency exchange across Europe — ranked by real rate | Payn",
    description:
      "Compare European currency exchange services on spread and fees, ranked by the real rate after every markup is counted.",
  },
  remittance: {
    title: "Compare remittance services across Europe — ranked by real cost | Payn",
    description:
      "Compare remittance providers on fees, exchange rate, and payout method, ranked by the amount that actually reaches the recipient.",
  },
  bnpl: {
    title: "Compare buy now pay later across Europe — ranked clearly | Payn",
    description:
      "Compare European buy-now-pay-later options on terms, fees, and credit checks, ranked transparently before you commit.",
  },
  neobanks: {
    title: "Compare neobanks across Europe — ranked by real cost | Payn",
    description:
      "Compare European neobanks on fees, features, and licensing, ranked transparently so the real cost and protection are clear.",
  },
  debit: {
    title: "Compare debit cards across Europe — ranked by real cost | Payn",
    description:
      "Compare European debit cards on ATM and foreign-transaction fees, ranked on the everyday cost of spending abroad and at home.",
  },
  wallets: {
    title: "Compare digital wallets across Europe — ranked by real cost | Payn",
    description:
      "Compare European digital wallets on fees, limits, and withdrawal terms, ranked transparently so the real cost is clear.",
  },
  payroll: {
    title: "Compare payroll & invoicing across Europe — ranked by real cost | Payn",
    description:
      "Compare European payroll and invoicing tools on pricing, scale, and compliance, ranked on the cost that grows with headcount.",
  },
  trading: {
    title: "Compare trading platforms across Europe — ranked by real cost | Payn",
    description:
      "Compare European trading platforms on fees, spreads, and markets, ranked on the cost that actually affects your returns.",
  },
  travel: {
    title: "Compare travel cards across Europe — ranked by real cost | Payn",
    description:
      "Compare European travel cards on foreign-transaction fees, perks, and conditions, ranked by the real cost of spending abroad.",
  },
  tax: {
    title: "Compare tax & accounting tools across Europe — ranked clearly | Payn",
    description:
      "Compare European tax and accounting software on pricing, features, and integrations, ranked transparently for filing and bookkeeping.",
  },
  budgeting: {
    title: "Compare budgeting & finance apps across Europe — ranked clearly | Payn",
    description:
      "Compare European budgeting and personal-finance apps on features, fees, and account links, ranked transparently.",
  },
  cashback: {
    title: "Compare cashback & rewards across Europe — ranked by real value | Payn",
    description:
      "Compare European cashback and rewards offers on rates, caps, and conditions, ranked on the value you actually earn.",
  },
  expense: {
    title: "Compare expense tracking across Europe — ranked by real cost | Payn",
    description:
      "Compare European expense-tracking tools on pricing, automation, and integrations, ranked transparently by real cost.",
  },
};

function categoryPaths(category: MarketplaceCategory) {
  // hreflang map keyed off the locales the app actually serves, plus
  // x-default → English. Kept in sync with `supportedLocales` so we never
  // emit a market we don't render.
  const languages: Record<string, string> = {};
  for (const locale of supportedLocales) {
    languages[locale] = `/${locale}/${category}`;
  }
  languages["x-default"] = `/en/${category}`;
  return languages;
}

/**
 * Build per-category SEO `Metadata` for a flat category route.
 *
 * @param category  one of `marketplaceCategories`
 * @param locale    the active request locale (en | de | es | fr). Falls
 *                   back to `en` if anything unexpected is passed, so the
 *                   canonical is always a valid flat URL.
 *
 * Returns intent-mapped title/description plus:
 *   - alternates.canonical  → `/<locale>/<category>`
 *   - alternates.languages  → { en, de, es, fr, x-default } flat URLs
 */
export function buildCategoryMetadata(
  category: MarketplaceCategory,
  locale: MarketplaceLocale | string,
): Metadata {
  const resolvedLocale = normalizeLocale(locale);
  const copy = categoryCopy[category];

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${resolvedLocale}/${category}`,
      languages: categoryPaths(category),
    },
  };
}
