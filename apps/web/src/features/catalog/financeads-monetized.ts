import type { MarketplaceOffer } from "@payn/types";

// ─── Financeads monetised partner offers ─────────────────────────────────────
//
// Direct affiliate offers routed through Financeads tracking URLs. Each one
// carries `monetized: true, affiliate: true, isPartner: true` so the ranking
// pipeline surfaces them ahead of unmonetised comparables. Confidence is
// pinned high (0.93+) — provider identity is hand-verified, not inferred
// by the discovery crawler.
//
// To add a new partner: drop a new entry below with the financeads tracking
// URL in `affiliateLink`. The flat `marketplaceOffers` export in
// marketplace-offers.ts already spreads this list in.

export const financeadsMonetizedOffers: MarketplaceOffer[] = [
  // ── Airwallex — global business banking + multi-currency accounts ─────────
  {
    id: "business-airwallex",
    slug: "airwallex-global-business",
    category: "business",
    countryCodes: ["EU", "UK", "INTERNATIONAL"],
    providerMark: "AW",
    providerName: "Airwallex",
    title: "Airwallex Global Business Account",
    subtitle:
      "Multi-currency business account with local accounts in 60+ countries, low FX, virtual & physical Visa cards, and global payouts for scaling businesses.",
    metrics: [
      { label: "Local accounts", value: "60+ countries" },
      { label: "FX margin", value: "From 0.5% above interbank" },
      { label: "Card", value: "Virtual + physical Visa" },
    ],
    bestFor: ["Multi-currency business", "Global payouts", "Low FX"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.96,
    providerWebsiteUrl: "https://www.airwallex.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C4120135638T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.98,
      dataSource: "affiliate",
      searchTags: [
        "business banking",
        "multi-currency",
        "global payouts",
        "fx",
        "international",
      ],
    },
  },

  // ── Coinhouse — first crypto broker in France ─────────────────────────────
  {
    id: "crypto-coinhouse",
    slug: "coinhouse-fr",
    category: "crypto",
    // CAT.9 — Coinhouse is French residents only (PSAN AMF
    // registration is France-specific). Was surfaced as eu_wide,
    // which misled non-FR European users.
    countryCodes: ["FR"],
    providerMark: "CH",
    providerName: "Coinhouse",
    title: "Coinhouse Crypto Broker",
    subtitle:
      "The first registered crypto broker in France (PSAN). Buy, sell, and stake bitcoin and major cryptocurrencies with SEPA deposits and personal advisors.",
    metrics: [
      { label: "Regulation", value: "PSAN (AMF, France)" },
      { label: "Fees", value: "From 0.99%" },
      { label: "Assets", value: "BTC, ETH and 50+ majors" },
    ],
    bestFor: ["French residents", "Regulated crypto", "Beginners"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.94,
    providerWebsiteUrl: "https://www.coinhouse.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C386875220T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "regional",
      confidenceScore: 0.96,
      dataSource: "affiliate",
      accessType: "spot_crypto",
      beginnerFriendly: true,
      platformUxLevel: "beginner",
      searchTags: ["crypto", "france", "bitcoin", "psan", "regulated"],
    },
  },

  // ── Currensea — UK travel debit card with zero FX ─────────────────────────
  {
    id: "cards-currensea",
    slug: "currensea-travel-card",
    category: "debit",
    countryCodes: ["UK"],
    providerMark: "CS",
    providerName: "Currensea",
    title: "Currensea Travel Debit Card",
    subtitle:
      "UK travel debit card that links directly to your existing high-street bank account. Spend abroad at the mid-market rate with no FX markup on the Essential plan.",
    metrics: [
      { label: "FX fee", value: "0% (Essential)" },
      { label: "Account", value: "Links to your UK bank" },
      { label: "Monthly fee", value: "Free (Essential)" },
    ],
    bestFor: ["Travel spending", "Zero FX", "Linked to UK bank"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.93,
    providerWebsiteUrl: "https://www.currensea.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C305057336T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "regional",
      confidenceScore: 0.96,
      dataSource: "affiliate",
      cardType: "debit",
      fxFeePercent: 0,
      annualFeeAmount: 0,
      searchTags: ["travel card", "zero fx", "uk", "debit"],
    },
  },

  // ── Deblock — French neobank + crypto wallet hybrid ───────────────────────
  {
    id: "banking-deblock",
    slug: "deblock-account-fr",
    category: "neobanks",
    countryCodes: ["FR", "EU"],
    providerMark: "DB",
    providerName: "Deblock",
    title: "Deblock Account + Wallet",
    subtitle:
      "Hybrid French neobank account that pairs a regulated current account with a self-custody crypto wallet. EU IBAN, Visa card, and on-chain swaps in one app.",
    metrics: [
      { label: "Account", value: "EU IBAN + Visa debit" },
      { label: "Wallet", value: "Self-custody on-chain" },
      { label: "Monthly fee", value: "Free" },
    ],
    bestFor: ["Self-custody", "France", "Crypto + banking"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.93,
    providerWebsiteUrl: "https://deblock.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5262122606T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "regional",
      confidenceScore: 0.95,
      dataSource: "affiliate",
      searchTags: [
        "neobank",
        "france",
        "crypto wallet",
        "self-custody",
        "iban",
      ],
    },
  },

  // ── Enky Invest — French real-estate crowdfunding ─────────────────────────
  {
    id: "investments-enky-invest",
    slug: "enky-invest",
    category: "investments",
    countryCodes: ["FR", "EU", "INTERNATIONAL"],
    providerMark: "EN",
    providerName: "Enky Invest",
    title: "Enky Real Estate Crowdfunding",
    subtitle:
      "French real-estate crowdfunding platform offering fractional access to vetted property projects. Target IRR 8–11%, ticket sizes from EUR 100.",
    metrics: [
      { label: "Asset class", value: "Real estate crowdfunding" },
      { label: "Target IRR", value: "8% – 11%" },
      { label: "Minimum", value: "EUR 100" },
    ],
    bestFor: ["Passive income", "Real estate", "France"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.91,
    providerWebsiteUrl: "https://enky.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5327124129T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.94,
      dataSource: "affiliate",
      accessType: "multi_asset_brokerage",
      subtype: "real-estate",
      riskProfile: "balanced",
      minDeposit: "EUR 100",
      assetsAvailableLabel: "Real estate crowdfunding projects",
      platformUxLevel: "intermediate",
      searchTags: [
        "real estate",
        "crowdfunding",
        "passive income",
        "france",
        "fractional",
      ],
    },
  },

  // ── Hilton Honors Debit Card (Curve / Galileo issued) ─────────────────────
  {
    id: "cards-hilton-honors-debit",
    slug: "hilton-honors-debit-card",
    category: "debit",
    // CAT.9 — Was ["EU","UK","INTERNATIONAL"]; the underlying Currensea
    // product is UK residents only, so widening to EU/INT misled
    // continental users. Restricted to UK.
    countryCodes: ["UK"],
    providerMark: "HH",
    providerName: "Hilton Honors",
    title: "Hilton Honors Debit Card",
    subtitle:
      "Co-branded Hilton Honors travel debit card issued by Currensea (UK only). Earns Hilton Honors points on every purchase with low foreign-transaction fees and travel-cover perks.",
    metrics: [
      // CAT.3 — Was "FX fee: 0% foreign transactions" — incorrect.
      // Currensea's Hilton Honors product is 0.99% FX on the basic
      // card and 0.50% FX on the Plus tier. Also added the previously-
      // hidden annual fee (£60 basic, £150 Plus) so the price/value
      // trade-off is visible before the user clicks Visit provider.
      { label: "Rewards", value: "Hilton Honors points on every spend" },
      { label: "FX fee", value: "0.99% (basic) · 0.50% (Plus)" },
      { label: "Annual fee", value: "£60 (basic) · £150 (Plus)" },
      { label: "Perks", value: "Status accelerators + travel cover" },
    ],
    bestFor: ["Hilton loyalty", "Travel rewards", "UK residents"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.92,
    providerWebsiteUrl: "https://www.hilton.com/en/hilton-honors/",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5184120876T",
    updatedAt: "2026-05-25T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      // CAT.9 — Was "international"; restricted to "regional" since
      // the underlying Currensea product only onboards UK residents.
      // The countryCodes:["UK"] above is the authoritative gate.
      availability: "regional",
      confidenceScore: 0.94,
      dataSource: "affiliate",
      cardType: "debit",
      // FX is no longer free — the previous `0` value made the
      // ranking algorithm award this card the "Best FX" badge it
      // didn't deserve.
      fxFeePercent: 0.99,
      annualFeeAmount: 60,
      cashbackPercent: 0,
      searchTags: ["hilton", "rewards", "travel card", "loyalty", "debit", "uk"],
    },
  },

  // ── ActivTrades — international forex + CFD broker ────────────────────────
  {
    id: "investments-activtrades",
    slug: "activtrades-broker",
    category: "trading",
    countryCodes: ["EU", "UK", "INTERNATIONAL"],
    providerMark: "AT",
    providerName: "ActivTrades",
    title: "ActivTrades Trading Platform",
    subtitle:
      "FCA / CSSF regulated multi-asset broker for forex, CFDs, indices, commodities and shares. Advanced platforms (MT4 / MT5 / ActivTrader) with tight spreads.",
    metrics: [
      { label: "Markets", value: "FX, CFDs, indices, shares" },
      { label: "Platforms", value: "MT4 / MT5 / ActivTrader" },
      { label: "Regulation", value: "FCA + CSSF" },
    ],
    bestFor: ["Active traders", "CFDs", "Advanced platforms"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.93,
    providerWebsiteUrl: "https://www.activtrades.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5315127127T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.96,
      dataSource: "affiliate",
      accessType: "multi_asset_brokerage",
      subtype: "cfd",
      riskProfile: "growth",
      platformUxLevel: "advanced",
      assetsAvailableLabel: "Forex, CFDs, indices, shares, commodities",
      searchTags: ["forex", "cfd", "broker", "mt4", "mt5", "trading"],
    },
  },

  // ── SumUp — international SME payments (multi-country routing) ────────────
  {
    id: "business-sumup",
    slug: "sumup-card-reader",
    category: "business",
    countryCodes: ["IT", "UK", "ES", "NL", "FR", "EU", "INTERNATIONAL"],
    providerMark: "SU",
    providerName: "SumUp",
    title: "SumUp Card Reader + Business Account",
    subtitle:
      "Plug-and-play card reader and SME business account used by 4M+ merchants across Europe. Take card payments anywhere, get paid next business day, no monthly fee.",
    metrics: [
      { label: "Reader fee", value: "1.69% per transaction" },
      { label: "Monthly fee", value: "Free" },
      { label: "Payouts", value: "Next business day" },
    ],
    bestFor: ["Card payments", "Small business", "No monthly fee"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.95,
    providerWebsiteUrl: "https://sumup.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C370274362T",
    // Per-country tracking URLs — the provider handoff picks the local URL
    // for the user's market when available, falling back to the IT default.
    providerUrls: {
      IT: "https://www.financeads.net/tc.php?t=83248C370274362T",
      GB: "https://www.financeads.net/tc.php?t=83248C370276486T",
      UK: "https://www.financeads.net/tc.php?t=83248C370276486T",
      ES: "https://www.financeads.net/tc.php?t=83248C370276488T",
      NL: "https://www.financeads.net/tc.php?t=83248C370276490T",
      FR: "https://www.financeads.net/tc.php?t=83248C370276492T",
    },
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.98,
      dataSource: "affiliate",
      searchTags: [
        "card reader",
        "payments",
        "small business",
        "sme",
        "merchant",
      ],
    },
  },

  // ── Wallester Business — international corporate card platform ────────────
  {
    id: "business-wallester",
    slug: "wallester-business-cards",
    category: "business",
    countryCodes: ["EU", "INTERNATIONAL"],
    providerMark: "WL",
    providerName: "Wallester",
    title: "Wallester Business Cards",
    subtitle:
      "Corporate card platform with virtual and physical Visa cards for teams. Free tier includes 300 cards, advanced spend controls, and instant card issuance.",
    metrics: [
      { label: "Free cards", value: "Up to 300 (Free plan)" },
      { label: "Card", value: "Virtual + physical Visa" },
      { label: "Issuance", value: "Instant" },
    ],
    bestFor: ["Corporate cards", "Spend controls", "Free tier"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.92,
    providerWebsiteUrl: "https://wallester.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C439099052T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.96,
      dataSource: "affiliate",
      searchTags: [
        "corporate cards",
        "expense management",
        "team cards",
        "virtual cards",
      ],
    },
  },

  // ── Waltio — crypto tax + portfolio tracker ───────────────────────────────
  {
    id: "tax-waltio",
    slug: "waltio-crypto-tax",
    category: "tax",
    countryCodes: ["FR", "EU", "INTERNATIONAL"],
    providerMark: "WT",
    providerName: "Waltio",
    title: "Waltio Crypto Tax Reporting",
    subtitle:
      "Crypto portfolio tracker and tax-report generator. Aggregates 200+ exchanges and wallets, generates compliant tax forms for France, Belgium, Spain, and more.",
    metrics: [
      { label: "Exchanges", value: "200+ supported" },
      { label: "Tax forms", value: "FR / BE / ES + more" },
      { label: "Plans", value: "From EUR 49/year" },
    ],
    bestFor: ["Crypto tax", "Portfolio tracking", "Compliance"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.91,
    providerWebsiteUrl: "https://waltio.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5295123365T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.95,
      dataSource: "affiliate",
      searchTags: [
        "crypto tax",
        "portfolio tracker",
        "tax reporting",
        "france",
      ],
    },
  },

  // ── YouHodler — Earn Interest ─────────────────────────────────────────────
  {
    id: "crypto-youhodler-earn",
    slug: "youhodler-earn-interest",
    category: "crypto",
    countryCodes: ["EU", "INTERNATIONAL"],
    providerMark: "YH",
    providerName: "YouHodler",
    title: "YouHodler Earn Interest",
    subtitle:
      "Earn weekly compounded interest on stablecoins and major crypto. Rates up to 15% APR depending on asset, with no lockup on top tiers.",
    metrics: [
      { label: "APR", value: "Up to 15% (asset-dependent)" },
      { label: "Compounding", value: "Weekly" },
      { label: "Lockup", value: "None on top tier" },
    ],
    bestFor: ["Crypto yield", "Stablecoins", "No lockup"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.93,
    providerWebsiteUrl: "https://www.youhodler.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C324060796T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.96,
      dataSource: "affiliate",
      accessType: "spot_crypto",
      subtype: "yield",
      riskProfile: "growth",
      searchTags: [
        "crypto",
        "yield",
        "earn",
        "stablecoin",
        "interest",
      ],
    },
  },

  // ── YouHodler — Crypto Exchange ───────────────────────────────────────────
  {
    id: "crypto-youhodler-exchange",
    slug: "youhodler-crypto-exchange",
    category: "crypto",
    countryCodes: ["EU", "INTERNATIONAL"],
    providerMark: "YH",
    providerName: "YouHodler",
    title: "YouHodler Crypto Exchange",
    subtitle:
      "Spot crypto exchange with 50+ assets, instant swaps, and fiat ramps via SEPA / SWIFT / card. Same wallet as Earn and Multi-HODL — one app, three primitives.",
    metrics: [
      { label: "Assets", value: "50+ majors and alts" },
      { label: "Fiat", value: "SEPA + SWIFT + card" },
      { label: "Fees", value: "From 0.1% per swap" },
    ],
    bestFor: ["Spot crypto", "Multi-asset", "Fiat ramps"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.91,
    providerWebsiteUrl: "https://www.youhodler.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C324068488T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.95,
      dataSource: "affiliate",
      accessType: "spot_crypto",
      subtype: "spot",
      searchTags: ["crypto", "exchange", "spot", "swap", "sepa"],
    },
  },

  // ── YouHodler — Multi-HODL (leveraged crypto) ─────────────────────────────
  {
    id: "crypto-youhodler-multihodl",
    slug: "youhodler-multi-hodl",
    category: "crypto",
    countryCodes: ["EU", "INTERNATIONAL"],
    providerMark: "YH",
    providerName: "YouHodler",
    title: "YouHodler Multi-HODL",
    subtitle:
      "Leveraged crypto trading product — set a price band, multiply exposure, auto-close on target. For experienced users who want directional crypto exposure without manual margin management.",
    metrics: [
      { label: "Leverage", value: "Up to 50x (asset-dependent)" },
      { label: "Style", value: "Auto-managed price bands" },
      { label: "Risk", value: "High — losses capped at deposit" },
    ],
    bestFor: ["Advanced crypto", "Directional bets", "Auto-managed leverage"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.88,
    providerWebsiteUrl: "https://www.youhodler.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C324068486T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.94,
      dataSource: "affiliate",
      accessType: "spot_crypto",
      subtype: "leveraged",
      riskProfile: "growth",
      platformUxLevel: "advanced",
      searchTags: ["crypto", "leverage", "multi-hodl", "advanced"],
    },
  },

  // ── Krak Card — international travel/cashback card ────────────────────────
  {
    id: "cards-krak",
    slug: "krak-card-international",
    category: "debit",
    // CAT.9 — Krak (by Lunar, Denmark) launched in DK in 2024 and
    // expanded to a small set of EU markets. The previous
    // ["EU","INTERNATIONAL"] surfacing made it look universally
    // available, but availability + features vary materially by
    // country. Narrowed to the markets where Lunar/Krak actually
    // onboards retail users today.
    countryCodes: ["DK", "SE", "NO", "FI"],
    providerMark: "KR",
    providerName: "Krak Card",
    title: "Krak Card",
    subtitle:
      "Prepaid card from Lunar (Denmark) with crypto top-ups, cashback on everyday spend, and 0% FX on travel. Currently rolling out across Nordic markets — full feature set varies by country.",
    metrics: [
      { label: "FX fee", value: "0% on travel" },
      { label: "Cashback", value: "Up to 1% on spend" },
      { label: "Top-up", value: "SEPA + crypto" },
    ],
    bestFor: ["Digital nomads", "Crypto top-ups", "Zero FX"],
    linkType: "affiliate_redirect",
    affiliatePriorityScore: 0.9,
    providerWebsiteUrl: "https://krak.com",
    affiliateLink: "https://www.financeads.net/tc.php?t=83248C5666133898T",
    updatedAt: "2026-05-22T00:00:00Z",
    attributes: {
      affiliate: true,
      monetized: true,
      isPartner: true,
      availability: "international",
      confidenceScore: 0.92,
      dataSource: "affiliate",
      cardType: "debit",
      fxFeePercent: 0,
      cashbackPercent: 1,
      cryptoSupport: true,
      searchTags: ["nomad", "crypto card", "travel", "cashback", "prepaid"],
    },
  },
];
