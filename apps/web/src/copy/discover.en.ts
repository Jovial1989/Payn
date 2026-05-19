export const discoverCopy = {
  hero: {
    // Eyebrow promises specificity ("30 markets") + currency ("live"). The
    // previous wording — "Compare across Europe" — left the user wondering
    // what exactly they were about to do.
    eyebrow: "Live across 30 European markets",
    // Two-line headline with the value verb up front. Promise + outcome.
    headline: "Money tools, compared on the only thing that matters: cost.",
    subhead:
      "Cards, loans, transfers, savings, insurance — every European provider, every fee, every rate. We do the maths so you don't.",
    searchPlaceholder: [
      "Send €500 to Spain",
      "Best savings account in Germany",
      "0% credit card UK",
      "Personal loan €10,000 over 36 months",
      "Cheapest EUR to GBP transfer",
    ],
    quickStartLabel: "Or jump in:",
    quickStart: [
      // Labels intentionally match the sidebar canonical names so the same
      // category reads the same way wherever the user finds it (UX audit
      // FIX-03). "Transfers" not "Send money", "Loans" not "Borrow", etc.
      { label: "Transfers", goal: "transfers" as const },
      { label: "Loans", goal: "loans" as const },
      { label: "Savings", goal: "savings" as const },
      { label: "Travel cards", goal: "travel" as const },
    ],
    continueCard: {
      prefix: "You were comparing",
      cta: "Continue →",
    },
    // Live stat tiles render to the right of the headline on lg+. Each pulls
    // its number from real catalogue data so the proof feels true on first
    // load, not at the end of a marketing scroll.
    stats: {
      products: "products compared",
      providers: "trusted providers",
      markets: "European markets",
      refresh: "Daily price refresh",
      refreshSub: "Rates verified within 24h",
    },
  },

  atlas: {
    eyebrow: "Browse the catalogue",
    heading: "Nine ways money moves. Pick one.",
    subhead:
      "Each tile groups the products that solve one job — so you stop guessing whether a travel card belongs under Transfers or Cards.",
  },

  trustBand: {
    eyebrow: "Why Payn",
    heading: "Built for the question \"which one's actually best for me?\"",
    pillars: [
      {
        kicker: "Live data",
        title: "Rates pulled daily",
        body: "We refresh APRs, FX spreads and fees from every provider every day — not once a quarter when a press release goes out.",
      },
      {
        kicker: "No pay-to-win",
        title: "Ranking can't be bought",
        body: "Position is decided by real outcome: fees, FX, APR, speed. We flag every affiliate link so you know which ones pay us.",
      },
      {
        kicker: "Eligibility-first",
        title: "Shown if you can actually get it",
        body: "We filter by your country and basic eligibility before you click — no \"sorry, not available in your region\" dead-ends.",
      },
      {
        kicker: "Human help",
        title: "A person, not a chatbot",
        body: "Stuck choosing? Email a real human at Payn. No upsell, no commission incentive — just a second opinion.",
      },
    ],
  },

  todayStrip: {
    heading: "What people are checking today",
    subhead: "Live comparisons from the last 24 hours.",
    fallback: {
      heading: "Recently popular",
      subhead: "Refreshed every hour.",
    },
  },

  goalGrid: {
    heading: "Browse by goal",
    subhead: "Pick what you're trying to do.",
  },

  quickCheck: {
    heading: "A couple of details",
    subhead: "We'll show three good fits as you type.",
    preview: {
      heading: "Three good fits",
      cachedNotice: "Showing rates from earlier today. Refresh in a moment for the latest.",
      seeMoreTemplate: "See all {count} {category} offers →",
    },
  },

  helpDecide: {
    eyebrow: "How this works",
    columns: [
      {
        title: "How Payn compares",
        body: "We pull live terms from every provider, score them on real cost — fees, FX, APR — and rank by what you'll actually pay.",
      },
      {
        title: "What we don't do",
        body: "No advice. No hidden ranking. No fake urgency. We tell you which links pay us.",
      },
      {
        title: "Talk to a human",
        body: "Stuck on a comparison? Email a person.",
        cta: "Contact us →",
      },
    ],
  },

  rankingFootnote:
    "Sorted by relevance, real outcome, speed, simplicity, and popularity. Payn compares published provider terms and estimated costs. Final eligibility and pricing stay with the provider.",
} as const;
