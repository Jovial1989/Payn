const GOAL_PATTERNS: [RegExp, string][] = [
  [/\bsend\b|\btransfer\b|\bremit\b|\bpay (?:to|abroad)\b/i, "transfers"],
  [/\bloan\b|\bborrow\b|\bcredit\b|\bfinanc(?:e|ing)\b/i, "loans"],
  [/\bcard\b|\bcredit card\b|\bdebit\b|\bcashback\b/i, "cards"],
  [/\bsav(?:e|ings)\b|\baer\b|\binterest rate\b/i, "savings"],
  [/\bexchange\b|\bconvert\b|\bfx\b/i, "exchange"],
  [/\binsur(?:e|ance|ed)\b|\bcover\b/i, "insurance"],
  [/\bcrypto\b|\bbitcoin\b|\bethereum\b/i, "crypto"],
  [/\binvest\b|\betf\b|\bbroker\b|\bstocks?\b/i, "investments"],
  [/\btravel card\b|\bspend abroad\b|\bholiday\b/i, "travel"],
  [/\bneobank\b|\bdigital bank\b/i, "neobanks"],
];

const CURRENCY_RE = /\b(EUR|USD|GBP|CHF|PLN|SEK|NOK|DKK|HUF|CZK)\b/gi;
const AMOUNT_RE =
  /(?:€|\$|£|CHF\s*)?(\d{1,3}(?:[,.\s]\d{3})*(?:[.,]\d+)?)\s*(?:k|K|m|M|EUR|USD|GBP)?/;
const MARKETS: Record<string, string> = {
  germany: "de",
  deutschland: "de",
  spain: "es",
  españa: "es",
  italy: "it",
  italia: "it",
  france: "fr",
  uk: "uk",
  "united kingdom": "uk",
  britain: "uk",
  england: "uk",
  netherlands: "nl",
  holland: "nl",
  nederland: "nl",
  portugal: "pt",
};
const TERM_RE = /(\d{1,3})\s*(month|year|mo|yr)/i;

export type ParsedSearch = {
  goal: string | undefined;
  amount: number | undefined;
  currencies: string[];
  market: string | undefined;
  term: number | undefined;
};

export function parseSearch(q: string): ParsedSearch {
  const goal = GOAL_PATTERNS.find(([re]) => re.test(q))?.[1];
  const currencies = [...q.matchAll(CURRENCY_RE)].map((m) => m[1].toUpperCase());
  const amountMatch = q.match(AMOUNT_RE);
  const amount = amountMatch ? parseAmount(amountMatch[0]) : undefined;
  const market = Object.entries(MARKETS).find(([k]) =>
    new RegExp(`\\b${k}\\b`, "i").test(q),
  )?.[1];
  const termMatch = q.match(TERM_RE);
  const term = termMatch
    ? Number(termMatch[1]) * (termMatch[2].toLowerCase().startsWith("y") ? 12 : 1)
    : undefined;

  return { goal, amount, currencies, market, term };
}

function parseAmount(s: string): number {
  const cleaned = s
    .replace(/[€$£\s]|EUR|USD|GBP|CHF/gi, "")
    .replace(/,/g, "");
  const n =
    Number(cleaned.replace(/[kK]$/, "")) * (/k$/i.test(cleaned) ? 1000 : 1);
  return Math.round(n * (/m$/i.test(cleaned) ? 1_000_000 : 1));
}
