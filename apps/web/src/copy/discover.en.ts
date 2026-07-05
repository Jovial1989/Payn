export const discoverCopy = {
  hero: {
    // Honest currency claim only — FX rates are genuinely live. The earlier
    // "30 European markets" was false (the country picker offers 7 named
    // markets + an all-Europe scope), so we drop the fabricated count.
    eyebrow: "Live European pricing",
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
    quickStartLabel: "Browse by category:",
    quickStart: [
      // Labels match the sidebar canonical names so a category reads the same
      // wherever the user finds it (UX audit FIX-03). The full set is listed
      // (not just 4) so phones can scroll the whole category range, and the
      // "Browse by category" label makes clear these are categories.
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
      // CAT.11 — Was "Daily price refresh / Rates verified within 24h"
      // which the May 2026 audit disproved (Lightyear, Revolut Savings,
      // Plum, Curve, GoHenry, SafetyWing were all 12–24 months stale).
      // Renamed to honest framing: rates are reviewed manually each
      // month, individual offers carry their own `updatedAt`, and the
      // catalog never tells the user it's faster than that.
      refresh: "Monthly catalogue review",
      refreshSub: "Each offer carries its own last-updated date",
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
