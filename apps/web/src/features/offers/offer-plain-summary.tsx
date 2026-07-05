import type { MarketplaceCategory, MarketplaceOffer } from "@payn/types";

// UX.6 — Plain-language summary block that sits between the deep-dive
// accordions and the cross-sell strip on the offer page. Adds two
// elements the existing PDP was missing:
//
//   1. "What people ask about this" — a plain-language FAQ. The
//      existing PdpDeepDive answers product questions
//      ("Pricing & fees", "What you get", "Things to watch"); the FAQ
//      answers process questions ("Will checking my rate hurt my
//      credit score?", "What if I lose my job mid-loan?"). Those are
//      the questions a 17-year-old or 65-year-old actually thinks
//      about before signing anything.
//
//   2. "Last checked on <date>" — explicit freshness stamp. The
//      existing copy only buried this in i18n. Here it sits in its
//      own card at the bottom of the page, two clicks before the
//      "Apply on provider" handoff, so users see the date stamp
//      while making the decision.
//
// FAQs are category-driven. Real per-offer FAQ content can be
// authored in the catalogue later; this default set covers the most
// common questions for each product type.

interface FaqEntry {
  question: string;
  answer: string;
}

// Category-default FAQ. Map keyed by the broad category cluster; the
// individual MarketplaceCategory values fold into one of these
// clusters. Each entry is intentionally short — the goal is the
// confidence boost, not a wall of text.
const FAQ_BY_CATEGORY: Record<string, FaqEntry[]> = {
  loans: [
    {
      question: "Will checking my rate hurt my credit score?",
      answer:
        "No. Most lenders on Payn do a 'soft check' first, which doesn't leave a mark on your record. Your score is only affected if you actually accept the loan and the lender runs a 'hard check' to finalise it.",
    },
    {
      question: "What if I lose my job mid-loan?",
      answer:
        "Contact the lender as soon as you can — many offer a payment break of 1-3 months. Interest still builds during that period, and there's no automatic insurance, so payment-protection is an optional add-on you'd buy separately.",
    },
    {
      question: "Can I pay it off early?",
      answer:
        "Most modern lenders (Klarna, Younited, Smava) charge no early-repayment fee. Some traditional banks still do — the offer's 'boring details' table below shows whether this one does.",
    },
    {
      question: "Why is my actual rate higher than the advertised one?",
      answer:
        "Advertised rates are the lender's best offer for borrowers with very strong credit history. The 'representative APR' is what at least 51% of accepted applicants get; you can be above or below it.",
    },
  ],
  cards: [
    {
      question: "Will this card work outside my home country?",
      answer:
        "Yes — these cards run on Visa or Mastercard, accepted in 200+ countries. The FX fee shown in the panel above is what you'd pay every time you spend in another currency.",
    },
    {
      question: "What if my card is stolen?",
      answer:
        "Every card here lets you freeze it instantly from the app. You're protected against fraudulent transactions under EU consumer law (Article 73, PSD2) — you're liable for max €50, the rest is the bank's problem.",
    },
    {
      question: "Will I need to switch my main account?",
      answer:
        "No. Most of these cards work as a second card alongside your existing bank. You top them up by transfer or direct debit. Some (N26, Revolut Standard) can become your main account if you want; others (Curve, Wise) are specifically a 'travel + everyday' layer.",
    },
    {
      question: "Is there a monthly fee?",
      answer:
        "Each card's monthly fee is in the 'boring details' table below. Many entry tiers are €0/month with optional paid tiers (Premium / Metal) that unlock higher cashback or travel insurance.",
    },
  ],
  transfers: [
    {
      question: "How long will the money take to arrive?",
      answer:
        "Most modern services (Wise, Revolut, OFX, Atlantic Money) deliver same-day for major EU-EU and EU-UK corridors. Cross-currency transfers to non-EU countries take 1-2 business days. Cash pickup (WorldRemit, Western Union) is usually within minutes.",
    },
    {
      question: "What does 'mid-market rate' mean?",
      answer:
        "The real exchange rate you'd see on Google or Reuters — not the rate your bank quotes. Apps like Wise and Atlantic Money use the mid-market rate and charge an explicit fee; banks usually add an invisible markup (2-4%) on top of the rate instead.",
    },
    {
      question: "Is my money safe in transit?",
      answer:
        "Yes — every regulated provider holds your money in a safeguarded client account, separated from their company funds. If the provider failed, your money would be returned. None of these services hold your money as a deposit — that's why FSCS / deposit guarantees don't apply.",
    },
    {
      question: "What ID will they ask for?",
      answer:
        "First transfer usually needs a passport / EU ID upload. KYC is automated and takes under 10 minutes for most users. Larger amounts (>€10k) may trigger an extra source-of-funds question.",
    },
  ],
  savings: [
    {
      question: "Is my money safe?",
      answer:
        "It depends on the product. Bank-licensed accounts (N26, bunq, Trade Republic via Deutsche Bank) carry a €100,000 EU deposit guarantee per account-holder. Money-market funds (Lightyear) carry a smaller €20,000 investor-protection cover and are technically not bank deposits.",
    },
    {
      question: "Can the rate change?",
      answer:
        "Yes. Most of these rates are variable — when the ECB cuts rates, your interest drops. Fixed accounts lock the rate but you can't withdraw without losing the interest.",
    },
    {
      question: "Do I need to pay tax on the interest?",
      answer:
        "Yes — interest counts as income in every EU country. Some accounts (Cash ISAs in the UK, PEA in France) shelter it tax-free up to limits; most don't. Always declare it in your tax return.",
    },
    {
      question: "What's the minimum I can put in?",
      answer:
        "Almost all of these have no minimum balance. You can start with €1 and add more whenever you want.",
    },
  ],
  insurance: [
    {
      question: "What's a 'deductible' or 'excess'?",
      answer:
        "The amount you pay yourself before insurance kicks in. A €500 excess means you pay the first €500 of any claim, the insurer pays the rest. Higher excess = lower premium.",
    },
    {
      question: "What happens if I have to claim?",
      answer:
        "Most modern insurers handle claims in-app — you upload photos / receipts and get an answer within 24-72 hours. Travel insurance usually requires you to file within 30 days of the incident.",
    },
    {
      question: "Does my existing card already cover this?",
      answer:
        "Premium and Metal cards from Revolut, Wise, and most banks include some travel insurance for cardholders — but coverage is usually €1M medical max with €100/day max for delays, not €5M+. Worth checking before buying a separate policy.",
    },
  ],
  banking: [
    {
      question: "Is my money protected like at a high-street bank?",
      answer:
        "Yes — every bank here either holds a full EU banking licence (N26, bunq, Deutsche-Bank-backed Trade Republic) or operates under an e-money licence with equivalent safeguarding (Revolut). Deposit protection is €100,000 per account-holder.",
    },
    {
      question: "Can I switch my salary to one of these?",
      answer:
        "Yes — every account here gives you a real IBAN you can put on your payroll form. Direct debits, standing orders, and SEPA all work normally.",
    },
    {
      question: "How long does opening take?",
      answer:
        "Most accounts open in 5-15 minutes via the app: passport upload + a 30-second video selfie. Card arrives in 3-7 days; virtual card usually works in the app immediately.",
    },
  ],
};

// Map specific MarketplaceCategory values onto the FAQ clusters above.
function getFaqsForCategory(category: MarketplaceCategory): FaqEntry[] {
  if (category === "loans" || category === "bnpl") return FAQ_BY_CATEGORY.loans;
  if (
    category === "cards" ||
    category === "debit" ||
    category === "travel" ||
    category === "cashback"
  )
    return FAQ_BY_CATEGORY.cards;
  if (
    category === "transfers" ||
    category === "exchange" ||
    category === "remittance"
  )
    return FAQ_BY_CATEGORY.transfers;
  if (category === "savings") return FAQ_BY_CATEGORY.savings;
  if (category === "insurance") return FAQ_BY_CATEGORY.insurance;
  if (
    category === "banking" ||
    category === "neobanks" ||
    category === "wallets"
  )
    return FAQ_BY_CATEGORY.banking;
  return [];
}

function formatLastChecked(value: string): string {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

interface OfferPlainSummaryProps {
  offer: MarketplaceOffer;
}

export function OfferPlainSummary({ offer }: OfferPlainSummaryProps) {
  const faqs = getFaqsForCategory(offer.category);
  const lastChecked = offer.updatedAt
    ? formatLastChecked(offer.updatedAt)
    : null;

  return (
    <section className="grid gap-4">
      {faqs.length > 0 && (
        <article className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:rounded-[28px] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            What people ask about this
          </p>
          <h2 className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
            Questions before you sign anything.
          </h2>

          {/* Native <details> so the FAQ works without JS and gets
              indexed by Google. Each question's chevron rotates on
              open via the marker pseudo-element. */}
          <div className="mt-5 divide-y divide-line">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group py-4 first:pt-0 last:pb-0"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <span className="text-[15px] font-semibold leading-snug text-ink">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-ink-secondary transition-transform group-open:rotate-45"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 2v8M2 6h8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </article>
      )}

      {lastChecked && (
        <article className="rounded-[20px] border border-line bg-bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-emerald-soft text-accent-emerald-strong"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M8 4v4l2.5 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                Last checked
              </p>
              <p className="text-[14px] font-semibold text-ink">
                We last verified these numbers on {lastChecked}.
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                Rates and conditions can change between checks. Confirm the
                headline numbers on the provider&apos;s own site before
                signing anything.
              </p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
