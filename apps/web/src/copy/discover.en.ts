export const discoverCopy = {
  hero: {
    // Free to use — true, and clearer than the old "Live European pricing"
    // (which over-claimed "live": only FX is truly live, the catalogue is
    // reviewed monthly — see stats.refresh).
    eyebrow: "Free to compare",
    // Same line as the mobile app — one brand voice across both.
    headline: "Stop overpaying. Start comparing.",
    subhead:
      "See what banks, cards and apps really cost across Europe — and keep the cheapest. Free, no sign-up.",
    searchPlaceholder: [
      "Send €500 to Spain",
      "Best savings account in Germany",
      "0% credit card UK",
      "Personal loan €10,000",
      "Cheapest euro to pound transfer",
    ],
    quickStartLabel: "Or pick a category:",
    quickStart: [
      // Labels match the sidebar names so a category reads the same
      // wherever the user finds it.
      { label: "Transfers", goal: "transfers" as const },
      { label: "Cards", goal: "cards" as const },
      { label: "Savings", goal: "savings" as const },
      { label: "Loans", goal: "loans" as const },
      { label: "Banking", goal: "banking" as const },
      { label: "Investments", goal: "investments" as const },
      { label: "Insurance", goal: "insurance" as const },
      { label: "Travel cards", goal: "travel" as const },
      { label: "Business", goal: "business" as const },
    ],
    continueCard: {
      prefix: "You were looking at",
      cta: "Continue →",
    },
    stats: {
      products: "products compared",
      providers: "providers",
      // "countries", not a marketing "30" — the picker offers 7 named
      // markets (DE/ES/IT/FR/UK/NL/PT) + an all-Europe scope.
      markets: "countries",
      // P1.3 — one honest, tiered freshness promise, matched on /how-we-rank
      // and every offer page: live FX rates refresh daily; catalogue terms
      // (fees, features) are verified at least monthly; each offer shows its
      // own last-checked date.
      refresh: "Rate refresh",
      refreshSub: "Catalogue terms verified monthly; each offer shows its date",
    },
  },

  atlas: {
    eyebrow: "Browse",
    heading: "What do you need?",
    subhead:
      "Pick a category and see your best options — no jargon, no guessing.",
  },

  trustBand: {
    eyebrow: "Why Payn",
    heading: "Made to find your best option",
    pillars: [
      {
        kicker: "Up to date",
        title: "Rates we keep current",
        // CAT.11 — was "Rates pulled daily / refreshed every day", which
        // contradicts the monthly review. Softened to the truth.
        body: "We check provider fees and rates regularly, and every offer shows when it was last updated.",
      },
      {
        kicker: "No pay-to-win",
        title: "Order can't be bought",
        body: "We rank by real cost, not by who pays us — and we label every paid link.",
      },
      {
        kicker: "Made for you",
        title: "Only what you can get",
        body: "We show options you can actually open in your country — no dead-ends.",
      },
      {
        kicker: "Real help",
        title: "A person, not a bot",
        body: "Stuck? Email a real person at Payn. No sales pitch.",
      },
    ],
  },

  todayStrip: {
    heading: "What people check today",
    subhead: "Popular in the last 24 hours.",
    fallback: {
      heading: "Popular right now",
      subhead: "Updated every hour.",
    },
  },

  goalGrid: {
    heading: "Browse by goal",
    subhead: "Pick what you want to do.",
  },

  quickCheck: {
    heading: "A couple of details",
    subhead: "We'll show three good options as you type.",
    preview: {
      heading: "Three good options",
      cachedNotice: "Showing earlier rates. Refresh in a moment for the latest.",
      seeMoreTemplate: "See all {count} {category} offers →",
    },
  },

  helpDecide: {
    eyebrow: "How it works",
    columns: [
      {
        title: "How we compare",
        body: "We check every provider's real cost — fees and rates — and rank by what you'll actually pay.",
      },
      {
        title: "What we don't do",
        body: "No advice. No hidden ranking. No fake urgency. We tell you which links pay us.",
      },
      {
        title: "Talk to a human",
        body: "Stuck? Email a real person.",
        cta: "Contact us →",
      },
    ],
  },

  rankingFootnote:
    "Ranked by real cost and value. Payn compares published prices and estimates — final pricing and approval are up to the provider.",
} as const;
