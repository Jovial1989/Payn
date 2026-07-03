import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money glossary in plain English — Payn",
  description:
    "APR, FX fee, AER, SEPA, BNPL — what they actually mean, in one line each.",
};

// UX.4 — Plain-language glossary. Each entry has:
//   • term (anchor target)
//   • one-line definition (what most users need)
//   • longer story (for the curious / first-time learner)
//   • cross-reference (optional)
//
// The page is server-rendered with each entry getting an `id` so any
// inline reference elsewhere on the site can deep-link straight to
// the definition (e.g. `/help/glossary#apr`).

interface GlossaryEntry {
  id: string;
  term: string;
  oneLine: string;
  longStory?: string;
  compareWith?: string;
}

const ENTRIES: GlossaryEntry[] = [
  {
    id: "apr",
    term: "APR",
    oneLine:
      "How much extra you pay each year on a loan, as a % of what you borrowed.",
    longStory:
      "APR stands for Annual Percentage Rate. If you borrow €1,000 at 5% APR, after one year you'd owe back about €1,050 — the extra €50 is what the bank earns. The catch: APR is annual, but most loans are paid monthly, so the page calculator translates it into the real monthly payment for you.",
    compareWith:
      "Interest rate — similar idea, but APR includes the bank's fees as well, so APR is usually a bit higher and more honest.",
  },
  {
    id: "interest-rate",
    term: "Interest rate",
    oneLine: "The % a bank charges you to lend you money.",
    longStory:
      "The headline number on most loan ads. Doesn't include fees the bank tacks on (origination, admin). Compare APR for the true cost.",
  },
  {
    id: "term",
    term: "Term",
    oneLine: "How many months you'll pay the loan back.",
    longStory:
      "Longer term = lower monthly payment but more total interest. €10k over 24 months: cheaper interest, painful monthly bill. €10k over 60 months: easier monthly, but you pay way more total interest. The page calculator shows both.",
  },
  {
    id: "principal",
    term: "Principal",
    oneLine: "The amount you actually borrowed — separate from interest.",
  },
  {
    id: "fx-fee",
    term: "FX fee",
    oneLine: "Extra fee when you pay or withdraw in another currency.",
    longStory:
      "Most regular bank cards charge 1.5-3% on every payment abroad — silently. Cards like Revolut, Wise, or N26 charge 0% up to a weekly cap. On a 2-week holiday spending €1,500, that's €30-50 you keep instead of giving to the bank.",
  },
  {
    id: "exchange-rate",
    term: "Exchange rate",
    oneLine:
      "How many of one currency you get for another (€1 = $1.07, for example).",
    longStory:
      "Banks usually quote a rate that's worse than the real market (mid-market) rate, then pocket the difference. That gap is called the spread.",
    compareWith: "Spread, mid-market rate",
  },
  {
    id: "spread",
    term: "Spread",
    oneLine: "The hidden mark-up on top of the real exchange rate.",
    longStory:
      "Example: real EUR→USD rate is 1.0700. Your bank quotes 1.0500 when you buy USD. That 0.0200 gap is the spread, and it's the bank's profit. Wise and most modern apps show you the real mid-market rate and charge an explicit fee instead, so you can see exactly what you're paying.",
  },
  {
    id: "cashback",
    term: "Cashback",
    oneLine: "Money the card gives back to you on what you spend.",
    longStory:
      "Headline cashback rates are usually capped (e.g. up to 1%, only at certain shops, only above €100/month spend). Watch for cashback paid in volatile crypto tokens (Plutus, Wirex) — that's a different product entirely.",
  },
  {
    id: "maker-taker",
    term: "Maker / Taker fee",
    oneLine: "Two ways a crypto exchange charges you to trade.",
    longStory:
      "Set your own price and wait for someone to match it = 'maker' (cheaper — you add liquidity). Buy instantly at the going price = 'taker' (a touch more). Most casual buys are taker trades, so that's the fee that usually applies to you. We keep both numbers rather than hiding them behind a single 'trading fee'.",
  },
  {
    id: "atm-fee",
    term: "ATM withdrawal fee",
    oneLine: "Fee for taking cash out of a machine.",
    longStory:
      "Two layers usually: your card's issuer might charge (typical: €0 up to a limit, then 1-2%) and the ATM owner may add a separate fee in some countries. Modern travel cards usually have a monthly free allowance (€200/mo on Revolut Standard).",
  },
  {
    id: "aer",
    term: "AER",
    oneLine:
      "Like APR but for savings — how much your money grows in a year, including compounding.",
    longStory:
      "Annual Equivalent Rate. €10k at 4% AER = €400 after a year. Honest savings products quote AER; less honest ones quote the simple interest rate, which sounds higher but is the same money.",
  },
  {
    id: "compound-interest",
    term: "Compound interest",
    oneLine: "Earning interest on top of interest you already earned.",
    longStory:
      "After year 1: €10,000 × 4% = €10,400. After year 2: €10,400 × 4% = €10,816 (not €10,800). It snowballs. The longer your money sits, the more powerful this gets.",
  },
  {
    id: "easy-access",
    term: "Easy access",
    oneLine: "You can take your money out any time.",
    longStory:
      "Pays a lower rate than fixed accounts but gives flexibility. Best for emergency funds or anything you might need within the year.",
  },
  {
    id: "notice-account",
    term: "Notice / fixed account",
    oneLine: "You agree to leave your money locked for a set period.",
    longStory:
      "30 days, 90 days, 1 year, 5 years. Longer lock = higher rate (usually). Break early and you lose some or all the interest.",
  },
  {
    id: "neobank",
    term: "Neobank",
    oneLine: "A bank that lives entirely in your phone, no branches.",
    longStory:
      "N26, Revolut, bunq, Monzo, Starling. All hold proper banking or e-money licences in the EU with deposit guarantees up to €100k. The reason they're cheaper than your local bank: no physical branches.",
  },
  {
    id: "iban",
    term: "IBAN",
    oneLine: "Your international bank account number — used for receiving money.",
    longStory:
      "Starts with the country code (DE, FR, ES, etc.) and is 15-34 characters long. Same purpose as a sort-code + account-number in the UK or an ABA routing number in the US.",
  },
  {
    id: "sepa",
    term: "SEPA",
    oneLine: "European money transfers — usually free between EU banks.",
    longStory:
      "Single Euro Payments Area. Standard SEPA transfer: 1-2 days, free or near-free. SEPA Instant: under 10 seconds, supported by most modern banks. Anything outside EUR-to-EUR isn't SEPA.",
  },
  {
    id: "p2p",
    term: "P2P",
    oneLine: "Sending money straight to another person — no shop or middleman.",
    longStory:
      "Peer-to-peer: splitting rent, paying back a friend, sending cash to family. On most apps it's instant and free between users — watch for fees when it crosses currencies or leaves the app's own network.",
  },
  {
    id: "corridor",
    term: "Corridor",
    oneLine: "The country-to-country route your money takes when you send it abroad.",
    longStory:
      "E.g. Germany → Philippines or France → Morocco. Cost and speed vary a lot by corridor — the same provider can be cheap on one route and pricey on another, which is why we compare per corridor, not in general.",
  },
  {
    id: "bnpl",
    term: "BNPL",
    oneLine: "Buy now, pay in 3-4 instalments. No interest if you pay on time.",
    longStory:
      "Klarna, PayPal Pay in 3, Clearpay. The catch: late payments hit your credit file in some countries, and the spending limits can encourage over-buying. For one-off purchases under €1,000 it's a clean tool; for everyday shopping it's a debt trap.",
  },
  {
    id: "soft-credit-check",
    term: "Soft credit check",
    oneLine:
      "Looks at your credit but doesn't leave a mark on your record.",
    longStory:
      "Used when you check a rate. You can do as many as you want without affecting your score. Most lenders on Payn do a soft check first to show you a personalised quote before you commit.",
  },
  {
    id: "hard-credit-check",
    term: "Hard credit check",
    oneLine: "Leaves a mark on your credit record. Used when you actually apply.",
    longStory:
      "Multiple hard checks in a short window can lower your score. Tip: do all your soft-check rate shopping first, then submit the formal application to the one you pick.",
  },
  {
    id: "premium-insurance",
    term: "Premium (insurance)",
    oneLine: "The amount you pay the insurance company every month or year.",
  },
  {
    id: "deductible",
    term: "Deductible / Excess",
    oneLine:
      "What you pay yourself before the insurance kicks in on a claim.",
    longStory:
      "€500 deductible means you pay the first €500 of any claim, the insurer pays the rest. Higher deductible = lower premium. Useful if you mostly want catastrophic-case cover, not first-dollar.",
  },
  {
    id: "coverage",
    term: "Coverage",
    oneLine: "What the insurance actually pays for (and up to how much).",
    longStory:
      "Look for the medical maximum (€500k vs €5M is a huge gap) and the list of exclusions (pre-existing conditions, extreme sports, alcohol-related incidents).",
  },
  {
    id: "debit-vs-credit",
    term: "Debit vs credit",
    oneLine:
      "Debit = pays from money you already have. Credit = you borrow first, pay later.",
  },
  {
    id: "psan",
    term: "PSAN",
    oneLine: "French registration for crypto companies (AMF supervised).",
    longStory:
      "Prestataire de Services sur Actifs Numériques. If you see PSAN on a French crypto provider (Coinhouse, Bitpanda France), it means they're legally allowed to operate there and supervised by the French market authority.",
  },
  {
    id: "fscs",
    term: "FSCS",
    oneLine: "UK deposit protection — up to £85k if a bank goes bust.",
    longStory:
      "Financial Services Compensation Scheme. Covers UK-licensed banks. Doesn't apply to money held inside investment funds (e.g. a Money Market Fund), only bank deposits.",
  },
];

export default function GlossaryPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
        Glossary
      </p>
      <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.025em] text-ink sm:text-[2.5rem]">
        Money words, in plain English.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-secondary">
        Banks love their jargon. Here&apos;s every term you&apos;ll see on Payn
        — what it means in one line, plus the longer story if you want it.
      </p>

      <ul className="mt-8 grid gap-6">
        {ENTRIES.map((entry) => (
          <li
            key={entry.id}
            id={entry.id}
            className="scroll-mt-24 border-t border-line pt-6 first:border-t-0 first:pt-0"
          >
            <h2 className="text-[1.25rem] font-bold tracking-[-0.015em] text-ink">
              {entry.term}
            </h2>
            <p className="mt-1 text-[14px] font-semibold leading-relaxed text-accent-emerald-strong">
              {entry.oneLine}
            </p>
            {entry.longStory && (
              <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
                {entry.longStory}
              </p>
            )}
            {entry.compareWith && (
              <p className="mt-2 text-[12px] text-ink-tertiary">
                <span className="font-semibold uppercase tracking-[0.16em]">
                  Compare with:
                </span>{" "}
                {entry.compareWith}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
