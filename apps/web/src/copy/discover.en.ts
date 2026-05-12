export const discoverCopy = {
  hero: {
    eyebrow: "Compare across Europe",
    headline: "Find money tools that actually fit you.",
    subhead: "Cards, loans, transfers and savings — compare the real cost in seconds.",
    searchPlaceholder: [
      "Send €500 to Spain",
      "Best savings account in Germany",
      "0% credit card UK",
      "Personal loan €10,000 over 36 months",
      "Cheapest EUR to GBP transfer",
    ],
    quickStartLabel: "Or jump in:",
    quickStart: [
      { label: "Send money", goal: "transfers" as const },
      { label: "Borrow", goal: "loans" as const },
      { label: "Save", goal: "savings" as const },
      { label: "Spend abroad", goal: "travel" as const },
    ],
    continueCard: {
      prefix: "You were comparing",
      cta: "Continue →",
    },
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
