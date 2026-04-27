import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket } from "@payn/types";

type Dictionary = {
  nav: {
    marketplace: string;
    about: string;
    contact: string;
    signIn: string;
    dashboard: string;
    compareOptions: string;
    myOffers: string;
    mobileWaitlist: string;
    country: string;
    language: string;
    currency: string;
  };
  categories: Record<MarketplaceCategory | "all", string>;
  categoryDescriptions: Record<MarketplaceCategory, string>;
  markets: Record<MarketplaceMarket, string>;
  locales: Record<MarketplaceLocale, string>;
  filters: {
    searchLabel: string;
    searchPlaceholder: string;
    countryLabel: string;
    categoryLabel: string;
    providerLabel: string;
    featureLabel: string;
    subtypeLabel: string;
    amountLabel: string;
    termLabel: string;
    reset: string;
    anyProvider: string;
    anyFeature: string;
    anySubtype: string;
  };
  explorer: {
    eyebrow: string;
    title: string;
    description: string;
    liveRankingLabel: string;
    optionsInCountry: string;
    resultsLabel: string;
    providersLabel: string;
    filteredFrom: string;
    availableIn: string;
    topResults: string;
    emptyTitle: string;
    emptyDescription: string;
    filterSummary: string;
    openCategoryPage: string;
    filtersButton: string;
    searchChipPrefix: string;
    showingResults: string;
    showMoreResults: string;
    sortOptions: Record<"relevance" | "fees" | "speed" | "recommended", string>;
    emptyActions: {
      clearFilters: string;
      openCards: string;
      showAllCategories: string;
      tryExchange: string;
      tryTransfers: string;
    };
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    heroCtaSecondary: string;
    heroPanelTitle: string;
    heroPanelSubtitle: string;
    heroPanelSignalsTitle: string;
    heroPanelSignalSummary: string;
    heroPanelNoteTitle: string;
    heroPanelNoteBody: string;
    trustRating: string;
    needsTitle: string;
    needsActions: string[];
    valuePoints: string[];
    browseByCategory: string;
    categoryCountLabel: string;
    products: string;
    topRanked: string;
    topRankedSubtitle: string;
    seeAll: string;
    tagFastest: string;
    tagNoFees: string;
    tagBestValue: string;
    whyPaynEyebrow: string;
    whyPaynTitle: string;
    howItWorksEyebrow: string;
    howItWorksTitle: string;
    openExplore: string;
    step: string;
    steps: string[];
    appHeadline: string;
    appSubtitle: string;
    appBullets: string[];
    appWaitlistNote: string;
    providerTitle: string;
    providerDescription: string;
    appTitle: string;
    appDescription: string;
    appPoints: string[];
    waitlistCta: string;
    howWeRankOffers: string;
    noAccountRequired: string;
    heroPillProviders: string;
    heroPillCategories: string;
    heroPillNoSignup: string;
    heroEyebrowShort: string;
    heroHeadline: string;
    heroSubtitleShort: string;
    whyPaynCards: Array<{ title: string; description: string }>;
    waitlistModal: {
      badge: string;
      title: string;
      subtitle: string;
      placeholder: string;
      submit: string;
      submitting: string;
      successMessage: string;
      errorFallback: string;
      noSpam: string;
    };
    mobile: {
      badge: string;
      heading: string;
      subtitle: string;
      joinWishlist: string;
      learnMore: string;
    };
    mockup: {
      yourShortlist: string;
      productsSaved: string;
      compare: string;
      bestOptionFound: string;
      continue: string;
      navHome: string;
      navExplore: string;
      navSaved: string;
      navSettings: string;
    };
  };
  offerCard: {
    updated: string;
    keyTradeoff: string;
    reviewOffer: string;
    providerSite: string;
    reviewBeforeLeave: string;
    providerCta: Record<MarketplaceCategory, string>;
    compareAdded: string;
    compareToggle: string;
    partnerLabel: string;
  };
  offerDetail: {
    detailEyebrow: string;
    reviewedOn: string;
    backToCategory: string;
    visitProvider: string;
    primaryAction: string;
    primaryActionBody: string;
    ratesTitle: string;
    benefitsTitle: string;
    tradeoffsTitle: string;
    whyShown: string;
    tradeoff: string;
    beforeClick: string;
    related: string;
    viewAll: string;
    beforeClickPoints: string[];
  };
  footer: {
    compare: string;
    company: string;
    copy: string;
    credibility: string;
    disclaimer: string;
  };
  about: {
    eyebrow: string;
    title: string;
    description: string;
    missionTitle: string;
    missionBody: string;
    coverageTitle: string;
    coverageBody: string;
    builtByTitle: string;
    builtByName: string;
    builtByBody: string;
    builtByExperience: string;
    storyTitle: string;
    storyBody: string[];
    backgroundTitle: string;
    backgroundPoints: string[];
    linkedinLabel: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    chatTitle: string;
    chatBody: string;
    chatCta: string;
    reachTitle: string;
    reachBody: string;
    emailCta: string;
    founderNote: string;
    partnershipTitle: string;
    partnershipBody: string;
    partnershipCta: string;
  };
  metrics: Record<string, string>;
};

const baseMetrics = {
  APR: "APR",
  Amount: "Amount",
  Term: "Term",
  "Annual fee": "Annual fee",
  "Monthly fee": "Monthly fee",
  "FX Fee": "FX fee",
  Spread: "Spread",
  Speed: "Speed",
  Fee: "Fee",
  "Transfer fee": "Transfer fee",
  Cover: "Cover",
  Price: "Price",
  Coverage: "Coverage",
  Cashback: "Cashback",
  ATM: "ATM",
  Approval: "Approval",
  Market: "Market",
  "FX fee": "FX fee",
  "Monthly cover": "Monthly cover",
  "Medical cover": "Medical cover",
  "Insured amount": "Insured amount",
  Deductible: "Deductible",
  "Region coverage": "Region coverage",
  "Baggage / delay": "Baggage / delay",
  Outpatient: "Outpatient",
  Inpatient: "Inpatient",
  "Digital claims": "Digital claims",
  "Family cover": "Family cover",
  "Collision / theft": "Collision / theft",
  "Rolling monthly": "Rolling monthly",
  "Countries covered": "Countries covered",
  "Medical emergencies": "Medical emergencies",
  "Remote work suitability": "Remote work suitability",
  "Device cover": "Device cover",
  "Theft / liquid": "Theft / liquid",
  "Worldwide protection": "Worldwide protection",
  "Monthly premium": "Monthly premium",
  "Waiting period": "Waiting period",
  "Trip length": "Trip length",
  Excess: "Excess",
  Liability: "Liability",
  Roadside: "Roadside",
  "ETF trades": "ETF trades",
  "Savings plan": "Savings plan",
  Markets: "Markets",
  "Crypto fee": "Crypto fee",
  Access: "Access",
  "Custody fee": "Custody fee",
} satisfies Record<string, string>;

const dictionaries: Record<MarketplaceLocale, Dictionary> = {
  en: {
    nav: {
      marketplace: "Explore",
      about: "About",
      contact: "Contact",
      signIn: "Sign in",
      dashboard: "Dashboard",
      compareOptions: "Get started",
      myOffers: "My offers",
      mobileWaitlist: "Mobile waitlist",
      country: "Country",
      language: "Language",
      currency: "Currency",
    },
    categories: {
      all: "All categories",
      loans: "Loans",
      cards: "Cards",
      transfers: "Transfers",
      exchange: "Exchange",
      insurance: "Insurance",
      investments: "Investments",
    },
    categoryDescriptions: {
      loans: "Borrowing offers with visible pricing, amount ranges, and term context.",
      cards: "Card products compared by fees, rewards, and travel fit.",
      transfers: "Transfer routes ranked by delivered value, speed, and payout method.",
      exchange: "Exchange tools compared by spread, fee structure, and execution context.",
      insurance: "Cover options for life, health, travel, and car policies.",
      investments: "Investment platforms across stocks, crypto, and multi-asset accounts.",
    },
    markets: {
      eu: "All Europe",
      international: "International",
      de: "Germany",
      es: "Spain",
      uk: "United Kingdom",
      fr: "France",
      it: "Italy",
      pt: "Portugal",
      nl: "Netherlands",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Search",
      searchPlaceholder: "Search products, providers, or use cases",
      countryLabel: "Country",
      categoryLabel: "Category",
      providerLabel: "Provider",
      featureLabel: "Focus",
      subtypeLabel: "Subtype",
      amountLabel: "Amount needed",
      termLabel: "Minimum term coverage",
      reset: "Reset filters",
      anyProvider: "All providers",
      anyFeature: "Any focus",
      anySubtype: "Any subtype",
    },
    explorer: {
      eyebrow: "Explore by market",
      title: "Find products by country, category, and real filters.",
      description:
        "Select a country, narrow the category, and adjust filters to see ranked offers immediately.",
      liveRankingLabel: "Live ranking",
      optionsInCountry: "{count} options in {country}",
      resultsLabel: "matching results",
      providersLabel: "providers",
      filteredFrom: "Filtered from",
      availableIn: "Available in",
      topResults: "Top results",
      emptyTitle: "No offers match this setup",
      emptyDescription: "Try a different country, category, or filter combination to widen the marketplace view.",
      filterSummary: "Results update immediately when country, category, search, or filters change.",
      openCategoryPage: "Open category page",
      filtersButton: "Filters",
      searchChipPrefix: "Search",
      showingResults: "Showing {shown} of {total} results",
      showMoreResults: "Show more results",
      sortOptions: {
        relevance: "Best match",
        fees: "Lowest fee",
        speed: "Fastest",
        recommended: "Recommended",
      },
      emptyActions: {
        clearFilters: "Clear filters",
        openCards: "Open cards",
        showAllCategories: "Show all categories",
        tryExchange: "Try exchange",
        tryTransfers: "Try transfers",
      },
    },
    home: {
      heroEyebrow: "Decision-first financial comparison",
      heroTitle: "Find your best financial option in Europe in under 60 seconds",
      heroSubtitle:
        "Compare 40+ banks and fintechs with full transparency — no hidden fees, no impact on your credit score",
      heroCta: "Find best option",
      heroCtaSecondary: "See top offers",
      heroPanelTitle: "Top offers in your market",
      heroPanelSubtitle: "Ranked by transparency, fees, and fit for your selected market.",
      heroPanelSignalsTitle: "Decision signals",
      heroPanelSignalSummary: "See trusted providers and categories in one fast comparison view.",
      heroPanelNoteTitle: "Why this view helps",
      heroPanelNoteBody: "See rates, fees, and tradeoffs before you leave Payn.",
      trustRating: "⭐ 4.9/5 based on user reviews",
      needsTitle: "What do you need?",
      needsActions: [
        "Borrow money",
        "Send money abroad",
        "Get a better card",
        "Exchange currency",
      ],
      valuePoints: [
        "Transparent comparisons with rates, fees, and tradeoffs in plain view.",
        "No hidden fees buried inside provider flows.",
        "Decision-first UX built to compare before you click out.",
        "Checking options does not impact your credit score.",
      ],
      browseByCategory: "Explore financial products",
      categoryCountLabel: "categories",
      products: "products",
      topRanked: "Top offers",
      topRankedSubtitle: "Selected for All Europe",
      seeAll: "See all",
      tagFastest: "Fastest",
      tagNoFees: "No fees",
      tagBestValue: "Best value",
      whyPaynEyebrow: "Why Payn",
      whyPaynTitle: "Why people use Payn before they apply",
      howItWorksEyebrow: "How it works",
      howItWorksTitle: "Three steps from need to provider",
      openExplore: "Start comparing",
      step: "Step",
      steps: [
        "Select what you need",
        "Compare offers",
        "Continue with provider",
      ],
      appHeadline: "Save on web, continue on mobile",
      appSubtitle: "Build your shortlist on any device. Compare side by side. When you are ready to decide, everything is right where you left it.",
      appBullets: [
        "Your shortlist syncs across devices",
        "Side-by-side comparison on the go",
        "Pick up where you left off",
      ],
      appWaitlistNote: "Join the waitlist for early access. iOS and Android.",
      providerTitle: "Trusted providers",
      providerDescription:
        "Payn compares products from recognizable European providers without turning the experience into an ad wall.",
      appTitle: "Payn app",
      appDescription:
        "The mobile app is still on the waitlist, but the route is real and tied to the current product roadmap.",
      appPoints: [
        "Track saved offers across countries and categories",
        "Get notified when provider terms change",
        "Move from web comparison into a logged-in mobile workspace",
      ],
      waitlistCta: "Join mobile waitlist",
      howWeRankOffers: "How we rank offers",
      noAccountRequired: "No account required to compare.",
      heroPillProviders: "40+ providers",
      heroPillCategories: "Loans · Cards · Transfers · FX",
      heroPillNoSignup: "No signup required",
      heroEyebrowShort: "Decision-first finance",
      heroHeadline: "Compare less. Decide better.",
      heroSubtitleShort: "Payn turns messy financial search into one clear recommendation, with pricing and tradeoffs visible before you leave.",
      whyPaynCards: [
        {
          title: "Transparent pricing",
          description: "Rates, fees, and tradeoffs stay visible before you leave Payn.",
        },
        {
          title: "No hidden fees",
          description: "Cost signals stay upfront instead of getting buried inside provider flows.",
        },
        {
          title: "Decision-first UX",
          description: "Compare quickly and move only when a result is worth your time.",
        },
        {
          title: "No credit impact",
          description: "Checking options on Payn does not affect your credit score.",
        },
      ],
      waitlistModal: {
        badge: "Early access",
        title: "Get notified at launch",
        subtitle: "Enter your email and we'll reach out as soon as Payn is live on iOS and Android.",
        placeholder: "your@email.com",
        submit: "Notify me",
        submitting: "Saving…",
        successMessage: "You're on the list! We'll notify you when the app launches.",
        errorFallback: "Something went wrong. Please try again.",
        noSpam: "No spam. Unsubscribe anytime.",
      },
      mobile: {
        badge: "Early access open",
        heading: "Payn on mobile — coming soon",
        subtitle: "Your shortlist, comparisons, and saved offers — all in your pocket. iOS and Android.",
        joinWishlist: "Join wishlist",
        learnMore: "Learn more",
      },
      mockup: {
        yourShortlist: "Your shortlist",
        productsSaved: "{count} products saved",
        compare: "Compare",
        bestOptionFound: "Best option found",
        continue: "Continue",
        navHome: "Home",
        navExplore: "Explore",
        navSaved: "Saved",
        navSettings: "Settings",
      },
    },
    offerCard: {
      updated: "Updated today",
      keyTradeoff: "Key tradeoff",
      reviewOffer: "Check details",
      providerSite: "Go to provider",
      reviewBeforeLeave: "Review the product on Payn before you leave for the provider.",
      providerCta: {
        loans: "Check my rate",
        cards: "See card details",
        transfers: "Open provider",
        exchange: "Open provider",
        insurance: "Check price",
        investments: "View platform",
      },
      compareAdded: "Added",
      compareToggle: "Compare",
      partnerLabel: "Partner",
    },
    offerDetail: {
      detailEyebrow: "Offer detail",
      reviewedOn: "reviewed on",
      backToCategory: "Back to category",
      visitProvider: "Visit provider",
      primaryAction: "Primary action",
      primaryActionBody: "Smooth handoff to {provider} when you are ready.",
      ratesTitle: "Rates",
      benefitsTitle: "Benefits",
      tradeoffsTitle: "Tradeoffs",
      whyShown: "Why Payn shows this offer",
      tradeoff: "Main tradeoff to review",
      beforeClick: "Before you click through",
      related: "More to compare",
      viewAll: "View all",
      beforeClickPoints: [
        "Availability, pricing, and eligibility can vary by country and customer profile.",
        "Review the provider site for current terms, fees, and application requirements.",
        "Payn may earn commission from some partners, but compensation alone does not determine ranking order.",
      ],
    },
    footer: {
      compare: "Compare",
      company: "Company",
      copy:
        "Compare financial products with market-aware availability, visible pricing, and transparent ranking logic.",
      credibility: "Built by fintech professionals with global banking experience",
      disclaimer:
        "Payn may earn commission from some partners, but compensation alone does not determine order.",
    },
    about: {
      eyebrow: "About",
      title: "About Payn",
      description: "Payn is a decision-first financial marketplace focused on clarity, transparency, and better financial choices.",
      missionTitle: "Our mission",
      missionBody:
        "Payn is being built to make cross-market financial discovery more useful. Start with a country, narrow by category, and review the tradeoffs before you click out.",
      coverageTitle: "What Payn covers",
      coverageBody:
        "The marketplace now spans loans, cards, transfers, exchange, insurance, and investments across European and international availability models.",
      builtByTitle: "Built by",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Founder & product lead",
      builtByExperience:
        "Experience across Tier 1 and Tier 2 banks, enterprise fintech, insurance companies, and financial platforms.",
      storyTitle: "Why Payn?",
      storyBody: [
        "Payn started as CreditPay — an early attempt to simplify how people discover and compare financial products.",
        "After working closely with banks and financial platforms across Europe, it became clear that most users still overpay due to lack of transparency and poor comparison tools.",
        "Payn is the evolution of that idea: a cleaner, faster, and more transparent way to make financial decisions.",
      ],
      backgroundTitle: "Background",
      backgroundPoints: [
        "10+ years in financial services and technology",
        "Experience with banking, payments, and data platforms",
        "Built financial solutions across multiple markets",
      ],
      linkedinLabel: "Connect on LinkedIn",
    },
    contact: {
      eyebrow: "Contact",
      title: "Get in touch",
      description: "Questions about the product, partnerships, or collaboration? Reach out directly.",
      chatTitle: "Contact the founder",
      chatBody: "For partnerships, product discussions, integrations, and feedback.",
      chatCta: "Chat with us",
      reachTitle: "Email",
      reachBody: "Prefer email? Use it for follow-ups or anything that does not need a live conversation.",
      emailCta: "Email Payn",
      founderNote:
        "Payn builds on that experience to make financial comparison clearer, faster, and more transparent.",
      partnershipTitle: "Partnerships",
      partnershipBody: "Share your company, product type, and markets covered so the conversation starts with context.",
      partnershipCta: "Discuss partnerships",
    },
    metrics: baseMetrics,
  },
  de: {
    nav: {
      marketplace: "Entdecken",
      about: "Über Payn",
      contact: "Kontakt",
      signIn: "Anmelden",
      dashboard: "Dashboard",
      compareOptions: "Loslegen",
      myOffers: "Meine Angebote",
      mobileWaitlist: "Mobile-Warteliste",
      country: "Land",
      language: "Sprache",
      currency: "Währung",
    },
    categories: {
      all: "Alle Kategorien",
      loans: "Kredite",
      cards: "Karten",
      transfers: "Überweisungen",
      exchange: "Wechsel",
      insurance: "Versicherungen",
      investments: "Investments",
    },
    categoryDescriptions: {
      loans: "Kreditangebote mit sichtbaren Preisen, Betragsrahmen und Laufzeiten.",
      cards: "Karten nach Gebühren, Vorteilen und Reiseeignung verglichen.",
      transfers: "Überweisungen nach Auszahlungswert, Tempo und Auszahlungsart sortiert.",
      exchange: "Wechselangebote nach Spread, Gebührenmodell und Ausführungskontext verglichen.",
      insurance: "Versicherungen für Leben, Gesundheit, Reisen und Auto.",
      investments: "Investmentplattformen für Aktien, Krypto und Multi-Asset-Zugänge.",
    },
    markets: {
      eu: "Ganz Europa",
      international: "International",
      de: "Deutschland",
      es: "Spanien",
      uk: "Vereinigtes Königreich",
      fr: "Frankreich",
      it: "Italien",
      pt: "Portugal",
      nl: "Niederlande",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Suche",
      searchPlaceholder: "Produkte, Anbieter oder Nutzung suchen",
      countryLabel: "Land",
      categoryLabel: "Kategorie",
      providerLabel: "Anbieter",
      featureLabel: "Fokus",
      subtypeLabel: "Untertyp",
      amountLabel: "Benötigter Betrag",
      termLabel: "Mindestlaufzeit",
      reset: "Filter zurücksetzen",
      anyProvider: "Alle Anbieter",
      anyFeature: "Jeder Fokus",
      anySubtype: "Jeder Untertyp",
    },
    explorer: {
      eyebrow: "Nach Markt entdecken",
      title: "Produkte nach Land, Kategorie und echten Filtern finden.",
      description:
        "Land auswählen, Kategorie eingrenzen und Filter anpassen, um sofort sortierte Angebote zu sehen.",
      liveRankingLabel: "Live-Ranking",
      optionsInCountry: "{count} Optionen in {country}",
      resultsLabel: "passende Ergebnisse",
      providersLabel: "Anbieter",
      filteredFrom: "Gefiltert aus",
      availableIn: "Verfügbar in",
      topResults: "Top-Ergebnisse",
      emptyTitle: "Keine Angebote passen zu dieser Auswahl",
      emptyDescription: "Versuchen Sie ein anderes Land, eine andere Kategorie oder andere Filter.",
      filterSummary: "Ergebnisse aktualisieren sich sofort bei Land, Kategorie, Suche oder Filtern.",
      openCategoryPage: "Kategorieseite öffnen",
      filtersButton: "Filter",
      searchChipPrefix: "Suche",
      showingResults: "{shown} von {total} Ergebnissen",
      showMoreResults: "Mehr Ergebnisse",
      sortOptions: {
        relevance: "Beste Wahl",
        fees: "Niedrigste Gebühr",
        speed: "Schnellste",
        recommended: "Empfohlen",
      },
      emptyActions: {
        clearFilters: "Filter löschen",
        openCards: "Karten öffnen",
        showAllCategories: "Alle Kategorien",
        tryExchange: "Wechsel versuchen",
        tryTransfers: "Transfers versuchen",
      },
    },
    home: {
      heroEyebrow: "Finanzvergleich für Entscheidungen",
      heroTitle: "Finden Sie in unter 60 Sekunden Ihre beste Finanzoption in Europa",
      heroSubtitle:
        "Vergleichen Sie mehr als 40 Banken und Fintechs mit voller Transparenz — ohne versteckte Gebühren und ohne Einfluss auf Ihre Bonität",
      heroCta: "Beste Option finden",
      heroCtaSecondary: "Top-Angebote sehen",
      heroPanelTitle: "Top-Angebote in Ihrem Markt",
      heroPanelSubtitle: "Nach Transparenz, Gebühren und Passung für Ihren gewählten Markt sortiert.",
      heroPanelSignalsTitle: "Entscheidungssignale",
      heroPanelSignalSummary: "Vertrauenswürdige Anbieter und Kategorien in einer schnellen Vergleichsansicht.",
      heroPanelNoteTitle: "Warum diese Ansicht hilft",
      heroPanelNoteBody: "Sehen Sie Raten, Gebühren und Zielkonflikte, bevor Sie Payn verlassen.",
      trustRating: "⭐ 4,9/5 basierend auf Nutzerbewertungen",
      needsTitle: "Was brauchen Sie?",
      needsActions: [
        "Geld leihen",
        "Geld ins Ausland senden",
        "Eine bessere Karte finden",
        "Währung wechseln",
      ],
      valuePoints: [
        "Transparente Vergleiche mit sichtbaren Preisen, Gebühren und Zielkonflikten.",
        "Keine versteckten Gebühren im Anbieterprozess.",
        "Eine Entscheidungsoberfläche, die den Vergleich vor dem Klick priorisiert.",
        "Optionen prüfen beeinflusst Ihre Bonität nicht.",
      ],
      browseByCategory: "Finanzprodukte erkunden",
      categoryCountLabel: "Kategorien",
      products: "Produkte",
      topRanked: "Top-Angebote",
      topRankedSubtitle: "Ausgewählt für Ganz Europa",
      seeAll: "Alle ansehen",
      tagFastest: "Schnellste Option",
      tagNoFees: "Keine Gebühren",
      tagBestValue: "Beste Wahl",
      whyPaynEyebrow: "Warum Payn",
      whyPaynTitle: "Warum Menschen Payn vor dem Antrag nutzen",
      howItWorksEyebrow: "So funktioniert es",
      howItWorksTitle: "Drei Schritte vom Bedarf zum Anbieter",
      openExplore: "Jetzt vergleichen",
      step: "Schritt",
      steps: [
        "Wählen Sie, was Sie brauchen",
        "Vergleichen Sie Angebote",
        "Weiter zum Anbieter",
      ],
      appHeadline: "Im Web speichern, mobil weitermachen",
      appSubtitle: "Erstelle deine Auswahl auf jedem Gerät. Vergleiche Seite an Seite. Wenn du dich entscheidest, ist alles genau da, wo du aufgehört hast.",
      appBullets: [
        "Deine Auswahl synchronisiert sich geräteübergreifend",
        "Vergleich unterwegs, Seite an Seite",
        "Mach weiter, wo du aufgehört hast",
      ],
      appWaitlistNote: "Tritt der Warteliste bei für frühen Zugang. iOS und Android.",
      providerTitle: "Vertrauenswürdige Anbieter",
      providerDescription:
        "Payn vergleicht Produkte namhafter europäischer Anbieter, ohne daraus eine Werbewand zu machen.",
      appTitle: "Payn App",
      appDescription:
        "Die mobile App ist noch auf der Warteliste, aber der Pfad ist real und mit dem aktuellen Produktplan verbunden.",
      appPoints: [
        "Gespeicherte Angebote über Länder und Kategorien verfolgen",
        "Benachrichtigungen bei Änderungen von Anbieterbedingungen erhalten",
        "Vom Webvergleich in einen mobilen Workspace wechseln",
      ],
      waitlistCta: "Zur Mobile-Warteliste",
      howWeRankOffers: "Wie wir Angebote bewerten",
      noAccountRequired: "Kein Konto erforderlich für den Vergleich.",
      heroPillProviders: "40+ Anbieter",
      heroPillCategories: "Kredite · Karten · Überweisungen · Wechsel",
      heroPillNoSignup: "Ohne Registrierung",
      heroEyebrowShort: "Entscheidungsorientierte Finanzen",
      heroHeadline: "Weniger vergleichen. Besser entscheiden.",
      heroSubtitleShort: "Payn macht aus unübersichtlicher Finanzsuche eine klare Empfehlung — mit sichtbaren Preisen und Abwägungen, bevor Sie weiterklicken.",
      whyPaynCards: [
        {
          title: "Transparente Preise",
          description: "Zinsen, Gebühren und Zielkonflikte bleiben sichtbar, bevor Sie weiterklicken.",
        },
        {
          title: "Keine versteckten Gebühren",
          description: "Wichtige Kostensignale bleiben vorne statt im Anbieterprozess verborgen.",
        },
        {
          title: "Entscheidungsorientiert",
          description: "Schnell vergleichen und nur weitergehen, wenn das Ergebnis überzeugt.",
        },
        {
          title: "Ohne Score-Effekt",
          description: "Das Prüfen von Optionen auf Payn beeinflusst Ihre Bonität nicht.",
        },
      ],
      waitlistModal: {
        badge: "Frühzugang",
        title: "Benachrichtigung bei Launch",
        subtitle: "Gib deine E-Mail ein und wir melden uns, sobald Payn auf iOS und Android verfügbar ist.",
        placeholder: "deine@email.de",
        submit: "Benachrichtigen",
        submitting: "Speichern…",
        successMessage: "Du bist auf der Liste! Wir benachrichtigen dich beim App-Launch.",
        errorFallback: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
        noSpam: "Kein Spam. Jederzeit abmeldbar.",
      },
      mobile: {
        badge: "Frühzugang geöffnet",
        heading: "Payn auf dem Handy — bald verfügbar",
        subtitle: "Ihre Merkliste, Vergleiche und gespeicherte Angebote — in Ihrer Tasche. iOS und Android.",
        joinWishlist: "Auf die Warteliste",
        learnMore: "Mehr erfahren",
      },
      mockup: {
        yourShortlist: "Ihre Merkliste",
        productsSaved: "{count} Produkte gespeichert",
        compare: "Vergleichen",
        bestOptionFound: "Beste Option gefunden",
        continue: "Weiter",
        navHome: "Startseite",
        navExplore: "Entdecken",
        navSaved: "Gespeichert",
        navSettings: "Einstellungen",
      },
    },
    offerCard: {
      updated: "Heute aktualisiert",
      keyTradeoff: "Wichtiger Zielkonflikt",
      reviewOffer: "Details ansehen",
      providerSite: "Zum Anbieter",
      reviewBeforeLeave: "Prüfen Sie das Produkt zuerst auf Payn, bevor Sie zur Anbieterseite gehen.",
      providerCta: {
        loans: "Rate prüfen",
        cards: "Karte ansehen",
        transfers: "Anbieter öffnen",
        exchange: "Anbieter öffnen",
        insurance: "Preis prüfen",
        investments: "Plattform ansehen",
      },
      compareAdded: "Hinzugefügt",
      compareToggle: "Vergleichen",
      partnerLabel: "Partner",
    },
    offerDetail: {
      detailEyebrow: "Angebotsdetail",
      reviewedOn: "geprüft am",
      backToCategory: "Zurück zur Kategorie",
      visitProvider: "Anbieter öffnen",
      primaryAction: "Nächster Schritt",
      primaryActionBody: "Öffnen Sie {provider}, wenn Sie fortfahren möchten.",
      ratesTitle: "Konditionen",
      benefitsTitle: "Vorteile",
      tradeoffsTitle: "Worauf Sie achten sollten",
      whyShown: "Warum Payn dieses Angebot zeigt",
      tradeoff: "Wichtigster Zielkonflikt",
      beforeClick: "Vor dem Weiterklick",
      related: "Weiter vergleichen",
      viewAll: "Alle anzeigen",
      beforeClickPoints: [
        "Verfügbarkeit, Preis und Eignung können je nach Land und Profil variieren.",
        "Prüfen Sie die Anbieterseite für aktuelle Bedingungen, Gebühren und Anforderungen.",
        "Payn kann bei manchen Partnern Provision erhalten, aber Vergütung allein bestimmt die Reihenfolge nicht.",
      ],
    },
    footer: {
      compare: "Vergleichen",
      company: "Unternehmen",
      copy:
        "Finanzprodukte mit marktabhängiger Verfügbarkeit, sichtbaren Preisen und transparenter Ranglogik vergleichen.",
      credibility: "Gebaut von Fintech-Profis mit globaler Banking-Erfahrung",
      disclaimer:
        "Payn kann bei manchen Partnern Provision erhalten, aber Vergütung allein bestimmt die Reihenfolge nicht.",
    },
    about: {
      eyebrow: "Über Payn",
      title: "Über Payn",
      description: "Payn ist ein entscheidungsorientierter Finanzmarktplatz mit Fokus auf Klarheit, Transparenz und bessere Finanzentscheidungen.",
      missionTitle: "Unsere Mission",
      missionBody:
        "Payn soll grenzüberschreitende Finanzsuche nützlicher machen. Mit Land beginnen, nach Kategorie verfeinern und Zielkonflikte vor dem Klick prüfen.",
      coverageTitle: "Was Payn abdeckt",
      coverageBody:
        "Der Marktplatz umfasst jetzt Kredite, Karten, Überweisungen, Wechsel, Versicherungen und Investments in europäischen und internationalen Modellen.",
      builtByTitle: "Gebaut von",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Gründer & Product Lead",
      builtByExperience:
        "Erfahrung mit Tier-1- und Tier-2-Banken, Enterprise-Fintech, Versicherungsunternehmen und Finanzplattformen.",
      storyTitle: "Warum Payn?",
      storyBody: [
        "Payn begann als CreditPay — ein früher Versuch, die Entdeckung und den Vergleich von Finanzprodukten zu vereinfachen.",
        "Nach enger Zusammenarbeit mit Banken und Finanzplattformen in ganz Europa wurde klar, dass die meisten Nutzer wegen fehlender Transparenz und schlechter Vergleichswerkzeuge immer noch zu viel bezahlen.",
        "Payn ist die Weiterentwicklung dieser Idee: ein klarerer, schnellerer und transparenterer Weg, finanzielle Entscheidungen zu treffen.",
      ],
      backgroundTitle: "Hintergrund",
      backgroundPoints: [
        "Mehr als 10 Jahre in Finanzdienstleistungen und Technologie",
        "Erfahrung mit Banking-, Payment- und Datenplattformen",
        "Finanzlösungen für mehrere Märkte aufgebaut",
      ],
      linkedinLabel: "Auf LinkedIn vernetzen",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Kontakt aufnehmen",
      description: "Fragen zum Produkt, zu Partnerschaften oder zur Zusammenarbeit? Kontaktieren Sie uns direkt.",
      chatTitle: "Den Gründer kontaktieren",
      chatBody: "Für Partnerschaften, Produktgespräche, Integrationen und Feedback.",
      chatCta: "Mit uns chatten",
      reachTitle: "E-Mail",
      reachBody: "Lieber per E-Mail? Nutzen Sie sie für Follow-ups oder alles, was kein Live-Gespräch braucht.",
      emailCta: "Payn per E-Mail kontaktieren",
      founderNote:
        "Payn baut auf dieser Erfahrung auf, um Finanzvergleiche klarer, schneller und transparenter zu machen.",
      partnershipTitle: "Partnerschaften",
      partnershipBody: "Nennen Sie Unternehmen, Produkttyp und Märkte, damit das Gespräch mit Kontext startet.",
      partnershipCta: "Partnerschaft besprechen",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Betrag",
      Term: "Laufzeit",
      "Annual fee": "Jahresgebühr",
      "Monthly fee": "Monatsgebühr",
      Price: "Preis",
      Coverage: "Deckung",
      Cashback: "Rückvergütung",
      ATM: "Bargeldbezug",
      Approval: "Zusage",
      Market: "Markt",
      "FX fee": "FX-Gebühr",
      "Monthly cover": "Monatliche Deckung",
      "Medical cover": "Medizinische Deckung",
      "Insured amount": "Versicherungssumme",
      Deductible: "Selbstbeteiligung",
      "Region coverage": "Regionale Deckung",
      "Baggage / delay": "Gepäck / Verspätung",
      Outpatient: "Ambulant",
      Inpatient: "Stationär",
      "Digital claims": "Digitale Schadenmeldung",
      "Family cover": "Familienschutz",
      "Collision / theft": "Unfall / Diebstahl",
      "Rolling monthly": "Monatlich kündbar",
      "Countries covered": "Abgedeckte Länder",
      "Medical emergencies": "Medizinische Notfälle",
      "Remote work suitability": "Für Remote-Arbeit geeignet",
      "Device cover": "Geräteschutz",
      "Theft / liquid": "Diebstahl / Flüssigkeit",
      "Worldwide protection": "Weltweiter Schutz",
      Spread: "Spread",
      Speed: "Tempo",
      Fee: "Gebühr",
      Cover: "Deckung",
      "Monthly premium": "Monatsprämie",
      "Waiting period": "Wartezeit",
      "Trip length": "Reisedauer",
      Liability: "Haftung",
      Roadside: "Pannenhilfe",
      Markets: "Märkte",
      Access: "Zugang",
      "Custody fee": "Depotgebühr",
    },
  },
  es: {
    nav: {
      marketplace: "Explorar",
      about: "Acerca de",
      contact: "Contacto",
      signIn: "Iniciar sesión",
      dashboard: "Panel",
      compareOptions: "Empezar",
      myOffers: "Mis ofertas",
      mobileWaitlist: "Lista de espera móvil",
      country: "País",
      language: "Idioma",
      currency: "Moneda",
    },
    categories: {
      all: "Todas las categorías",
      loans: "Préstamos",
      cards: "Tarjetas",
      transfers: "Transferencias",
      exchange: "Cambio de divisa",
      insurance: "Seguros",
      investments: "Inversiones",
    },
    categoryDescriptions: {
      loans: "Préstamos con precios visibles, rangos de importe y contexto de plazo.",
      cards: "Tarjetas comparadas por comisiones, ventajas y uso en viajes.",
      transfers: "Transferencias ordenadas por valor recibido, velocidad y método de pago.",
      exchange: "Herramientas de cambio comparadas por spread, comisiones y ejecución.",
      insurance: "Cobertura de vida, salud, viaje y coche.",
      investments: "Plataformas de inversión en acciones, cripto y cuentas multi-activo.",
    },
    markets: {
      eu: "Toda Europa",
      international: "Internacional",
      de: "Alemania",
      es: "España",
      uk: "Reino Unido",
      fr: "Francia",
      it: "Italia",
      pt: "Portugal",
      nl: "Países Bajos",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Buscar",
      searchPlaceholder: "Buscar productos, proveedores o usos",
      countryLabel: "País",
      categoryLabel: "Categoría",
      providerLabel: "Proveedor",
      featureLabel: "Enfoque",
      subtypeLabel: "Subtipo",
      amountLabel: "Importe",
      termLabel: "Plazo",
      reset: "Restablecer filtros",
      anyProvider: "Todos los proveedores",
      anyFeature: "Cualquier enfoque",
      anySubtype: "Cualquier subtipo",
    },
    explorer: {
      eyebrow: "Mercado por país",
      title: "Explora por país, categoría y filtros útiles.",
      description:
        "Compara con una selección de país clara, filtros útiles y resultados listos para decidir.",
      liveRankingLabel: "Ranking en tiempo real",
      optionsInCountry: "{count} opciones en {country}",
      resultsLabel: "resultados",
      providersLabel: "proveedores",
      filteredFrom: "Filtrado desde",
      availableIn: "Disponible en",
      topResults: "Mejores resultados",
      emptyTitle: "No hay ofertas para esta combinación",
      emptyDescription: "Prueba otro país, otra categoría o filtros distintos.",
      filterSummary: "Los resultados se actualizan al instante cuando cambias país, categoría, búsqueda o filtros.",
      openCategoryPage: "Abrir página de categoría",
      filtersButton: "Filtros",
      searchChipPrefix: "Búsqueda",
      showingResults: "Mostrando {shown} de {total} resultados",
      showMoreResults: "Ver más resultados",
      sortOptions: {
        relevance: "Mejor encaje",
        fees: "Menor coste",
        speed: "Más rápido",
        recommended: "Recomendado",
      },
      emptyActions: {
        clearFilters: "Borrar filtros",
        openCards: "Ver tarjetas",
        showAllCategories: "Ver todas las categorías",
        tryExchange: "Probar cambio de divisa",
        tryTransfers: "Probar transferencias",
      },
    },
    home: {
      heroEyebrow: "Comparación financiera para decidir",
      heroTitle: "Encuentra tu mejor opción financiera en Europa en menos de 60 segundos",
      heroSubtitle:
        "Compara más de 40 bancos y fintechs con total transparencia — sin comisiones ocultas y sin impacto en tu historial crediticio",
      heroCta: "Comparar ahora",
      heroCtaSecondary: "Ver mejores ofertas",
      heroPanelTitle: "Mejores ofertas en tu mercado",
      heroPanelSubtitle: "Ordenadas por transparencia, comisiones y encaje para tu mercado seleccionado.",
      heroPanelSignalsTitle: "Señales de decisión",
      heroPanelSignalSummary: "Proveedores y categorías clave en una vista rápida para comparar mejor.",
      heroPanelNoteTitle: "Por qué esta vista ayuda",
      heroPanelNoteBody: "Consulta tasas, comisiones y compromisos antes de salir de Payn.",
      trustRating: "⭐ 4,9/5 según reseñas de usuarios",
      needsTitle: "¿Qué necesitas?",
      needsActions: [
        "Pedir dinero prestado",
        "Enviar dinero al extranjero",
        "Conseguir una mejor tarjeta",
        "Cambiar divisa",
      ],
      valuePoints: [
        "Comparaciones transparentes con precios, comisiones y compromisos a la vista.",
        "Sin comisiones ocultas dentro del flujo del proveedor.",
        "Una UX orientada a decidir antes de salir al proveedor.",
        "Consultar opciones no afecta a tu historial crediticio.",
      ],
      browseByCategory: "Explorar productos financieros",
      categoryCountLabel: "categorías",
      products: "productos",
      topRanked: "Ofertas destacadas",
      topRankedSubtitle: "Seleccionadas para toda Europa",
      seeAll: "Ver todo",
      tagFastest: "Más rápido",
      tagNoFees: "Sin comisiones",
      tagBestValue: "Mejor opción",
      whyPaynEyebrow: "Por qué Payn",
      whyPaynTitle: "Por qué la gente usa Payn antes de solicitar",
      howItWorksEyebrow: "Cómo funciona",
      howItWorksTitle: "Tres pasos desde la necesidad hasta el proveedor",
      openExplore: "Comparar ahora",
      step: "Paso",
      steps: [
        "Selecciona lo que necesitas",
        "Compara ofertas",
        "Continúa con el proveedor",
      ],
      appHeadline: "Guarda en la web, continúa en móvil",
      appSubtitle:
        "Construye tu shortlist en cualquier dispositivo. Compara lado a lado. Cuando llegue el momento de decidir, todo sigue donde lo dejaste.",
      appBullets: [
        "Tu shortlist se sincroniza entre dispositivos",
        "Comparación lado a lado desde el móvil",
        "Retoma donde lo dejaste",
      ],
      appWaitlistNote: "Únete a la lista para acceso anticipado. iOS y Android.",
      providerTitle: "Proveedores disponibles",
      providerDescription:
        "Payn mantiene proveedores reconocibles a la vista para que la comparación siga siendo creíble y clara.",
      appTitle: "App de Payn",
      appDescription:
        "La app móvil sigue en lista de espera, pero la ruta es real y conecta con el roadmap actual.",
      appPoints: [
        "Seguir ofertas guardadas entre países y categorías",
        "Recibir avisos cuando cambien las condiciones de un proveedor",
        "Pasar de la comparación web a un espacio móvil con sesión",
      ],
      waitlistCta: "Unirse a la lista móvil",
      howWeRankOffers: "Cómo clasificamos las ofertas",
      noAccountRequired: "No se necesita cuenta para comparar.",
      heroPillProviders: "40+ proveedores",
      heroPillCategories: "Préstamos · Tarjetas · Transferencias · Cambio",
      heroPillNoSignup: "Sin registro",
      heroEyebrowShort: "Finanzas orientadas a la decisión",
      heroHeadline: "Compara menos. Decide mejor.",
      heroSubtitleShort: "Payn convierte la búsqueda financiera confusa en una recomendación clara, con precios y compensaciones visibles antes de salir.",
      whyPaynCards: [
        {
          title: "Precios transparentes",
          description: "Tipos, comisiones y compromisos siguen visibles antes de salir de Payn.",
        },
        {
          title: "Sin comisiones ocultas",
          description: "Las señales de coste quedan al frente y no escondidas en el flujo del proveedor.",
        },
        {
          title: "UX para decidir",
          description: "Compara rápido y avanza solo cuando una opción merece tu tiempo.",
        },
        {
          title: "Sin impacto crediticio",
          description: "Consultar opciones en Payn no afecta tu puntuación crediticia.",
        },
      ],
      waitlistModal: {
        badge: "Acceso anticipado",
        title: "Notificación en el lanzamiento",
        subtitle: "Introduce tu email y te avisaremos en cuanto Payn esté disponible en iOS y Android.",
        placeholder: "tu@email.es",
        submit: "Notificarme",
        submitting: "Guardando…",
        successMessage: "¡Estás en la lista! Te avisaremos cuando la app se lance.",
        errorFallback: "Algo salió mal. Por favor, inténtalo de nuevo.",
        noSpam: "Sin spam. Cancela cuando quieras.",
      },
      mobile: {
        badge: "Acceso anticipado abierto",
        heading: "Payn en el móvil — próximamente",
        subtitle: "Tu selección, comparaciones y ofertas guardadas — en tu bolsillo. iOS y Android.",
        joinWishlist: "Unirse a la lista de espera",
        learnMore: "Saber más",
      },
      mockup: {
        yourShortlist: "Tu selección",
        productsSaved: "{count} productos guardados",
        compare: "Comparar",
        bestOptionFound: "Mejor opción encontrada",
        continue: "Continuar",
        navHome: "Inicio",
        navExplore: "Explorar",
        navSaved: "Guardado",
        navSettings: "Ajustes",
      },
    },
    offerCard: {
      updated: "Actualizado hoy",
      keyTradeoff: "Punto clave a revisar",
      reviewOffer: "Ver oferta",
      providerSite: "Ir al proveedor",
      reviewBeforeLeave: "Revisa el producto en Payn antes de salir al proveedor.",
      providerCta: {
        loans: "Consultar tipo",
        cards: "Ver tarjeta",
        transfers: "Ir al proveedor",
        exchange: "Ir al proveedor",
        insurance: "Ver precio",
        investments: "Ver plataforma",
      },
      compareAdded: "Añadido",
      compareToggle: "Comparar",
      partnerLabel: "Partner",
    },
    offerDetail: {
      detailEyebrow: "Detalle de oferta",
      reviewedOn: "revisado el",
      backToCategory: "Volver a la categoría",
      visitProvider: "Ir al proveedor",
      primaryAction: "Siguiente paso",
      primaryActionBody: "Abre {provider} cuando quieras continuar.",
      ratesTitle: "Condiciones",
      benefitsTitle: "Ventajas",
      tradeoffsTitle: "Aspectos a revisar",
      whyShown: "Por qué Payn muestra esta oferta",
      tradeoff: "Punto clave a revisar",
      beforeClick: "Antes de continuar",
      related: "Más para comparar",
      viewAll: "Ver todo",
      beforeClickPoints: [
        "La disponibilidad, el precio y la elegibilidad pueden variar según el país y el perfil.",
        "Revisa el sitio del proveedor para ver condiciones, comisiones y requisitos actuales.",
        "Payn puede ganar comisión con algunos socios, pero la compensación por sí sola no determina el orden.",
      ],
    },
    footer: {
      compare: "Comparar",
      company: "Empresa",
      copy:
        "Compara productos financieros con disponibilidad por mercado, precios visibles y una lógica de ranking transparente.",
      credibility: "Creado por profesionales fintech con experiencia bancaria global",
      disclaimer:
        "Payn puede ganar comisión con algunos socios, pero la compensación por sí sola no determina el orden.",
    },
    about: {
      eyebrow: "Acerca de",
      title: "Acerca de Payn",
      description: "Payn es un mercado financiero orientado a la decisión, centrado en claridad, transparencia y mejores decisiones financieras.",
      missionTitle: "Nuestra misión",
      missionBody:
        "Payn quiere hacer más útil la búsqueda financiera entre mercados. Empieza por país, filtra por categoría y revisa los compromisos antes del clic.",
      coverageTitle: "Qué cubre Payn",
      coverageBody:
        "El mercado ya cubre préstamos, tarjetas, transferencias, cambio, seguros e inversiones con modelos europeos e internacionales.",
      builtByTitle: "Creado por",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Fundador y responsable de producto",
      builtByExperience:
        "Experiencia con bancos Tier 1 y Tier 2, fintech empresarial, aseguradoras y plataformas financieras.",
      storyTitle: "¿Por qué Payn?",
      storyBody: [
        "Payn comenzó como CreditPay, un primer intento de simplificar cómo las personas descubren y comparan productos financieros.",
        "Tras trabajar de cerca con bancos y plataformas financieras en toda Europa, quedó claro que la mayoría de los usuarios siguen pagando de más por falta de transparencia y malas herramientas de comparación.",
        "Payn es la evolución de esa idea: una forma más limpia, rápida y transparente de tomar decisiones financieras.",
      ],
      backgroundTitle: "Trayectoria",
      backgroundPoints: [
        "Más de 10 años en servicios financieros y tecnología",
        "Experiencia en banca, pagos y plataformas de datos",
        "Soluciones financieras construidas para múltiples mercados",
      ],
      linkedinLabel: "Conectar en LinkedIn",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Habla con Payn",
      description: "¿Preguntas sobre el producto, alianzas o colaboración? Escríbenos directamente.",
      chatTitle: "Contacta con el fundador",
      chatBody: "Para alianzas, conversaciones de producto, integraciones y feedback.",
      chatCta: "Chatea con nosotros",
      reachTitle: "Email",
      reachBody: "¿Prefieres email? Úsalo para seguimiento o para cualquier tema que no requiera una conversación en directo.",
      emailCta: "Enviar email a Payn",
      founderNote:
        "Payn se apoya en esa experiencia para hacer la comparación financiera más clara, rápida y transparente.",
      partnershipTitle: "Alianzas",
      partnershipBody: "Comparte empresa, tipo de producto y mercados cubiertos para empezar con contexto.",
      partnershipCta: "Hablar de alianzas",
    },
    metrics: {
      ...baseMetrics,
      APR: "TAE",
      Amount: "Importe",
      Term: "Plazo",
      "Annual fee": "Cuota anual",
      "Monthly fee": "Cuota mensual",
      Spread: "Margen",
      Speed: "Velocidad",
      Fee: "Comisión",
      Cover: "Cobertura",
      "Monthly premium": "Prima mensual",
      "Waiting period": "Carencia",
      "Trip length": "Duración del viaje",
      Liability: "Responsabilidad",
      Roadside: "Asistencia",
      Markets: "Mercados",
      Access: "Acceso",
      "Custody fee": "Custodia",
    },
  },
  fr: {
    nav: {
      marketplace: "Explorer",
      about: "À propos",
      contact: "Contact",
      signIn: "Connexion",
      dashboard: "Tableau de bord",
      compareOptions: "Commencer",
      myOffers: "Mes offres",
      mobileWaitlist: "Liste mobile",
      country: "Pays",
      language: "Langue",
      currency: "Devise",
    },
    categories: {
      all: "Toutes les catégories",
      loans: "Prêts",
      cards: "Cartes",
      transfers: "Transferts",
      exchange: "Change",
      insurance: "Assurance",
      investments: "Investissements",
    },
    categoryDescriptions: {
      loans: "Prêts avec prix visibles, fourchettes de montant et contexte de durée.",
      cards: "Cartes comparées par frais, avantages et usage voyage.",
      transfers: "Transferts classés par valeur livrée, vitesse et mode de paiement.",
      exchange: "Outils de change comparés par spread, frais et contexte d'exécution.",
      insurance: "Couverture vie, santé, voyage et auto.",
      investments: "Plateformes pour actions, crypto et comptes multi-actifs.",
    },
    markets: {
      eu: "Toute l'Europe",
      international: "International",
      de: "Allemagne",
      es: "Espagne",
      uk: "Royaume-Uni",
      fr: "France",
      it: "Italie",
      pt: "Portugal",
      nl: "Pays-Bas",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Recherche",
      searchPlaceholder: "Rechercher un produit, un fournisseur ou un usage",
      countryLabel: "Pays",
      categoryLabel: "Catégorie",
      providerLabel: "Fournisseur",
      featureLabel: "Focus",
      subtypeLabel: "Sous-type",
      amountLabel: "Montant recherché",
      termLabel: "Durée minimale couverte",
      reset: "Réinitialiser",
      anyProvider: "Tous les fournisseurs",
      anyFeature: "Tous les focus",
      anySubtype: "Tous les sous-types",
    },
    explorer: {
      eyebrow: "Marché par pays",
      title: "Commencer par le pays, la catégorie et de vrais filtres.",
      description:
        "Payn ouvre désormais sur la sélection du marché, des filtres utiles et des résultats directs plutôt que sur un hero dominant.",
      liveRankingLabel: "Classement en direct",
      optionsInCountry: "{count} options en {country}",
      resultsLabel: "résultats",
      providersLabel: "fournisseurs",
      filteredFrom: "Filtré depuis",
      availableIn: "Disponible en",
      topResults: "Meilleurs résultats",
      emptyTitle: "Aucune offre ne correspond",
      emptyDescription: "Essayez un autre pays, une autre catégorie ou d'autres filtres.",
      filterSummary: "Les résultats changent immédiatement quand le pays, la catégorie, la recherche ou les filtres changent.",
      openCategoryPage: "Ouvrir la catégorie",
      filtersButton: "Filtres",
      searchChipPrefix: "Recherche",
      showingResults: "{shown} sur {total} résultats",
      showMoreResults: "Voir plus de résultats",
      sortOptions: {
        relevance: "Meilleure adéquation",
        fees: "Moins cher",
        speed: "Le plus rapide",
        recommended: "Recommandé",
      },
      emptyActions: {
        clearFilters: "Effacer les filtres",
        openCards: "Voir les cartes",
        showAllCategories: "Voir toutes les catégories",
        tryExchange: "Essayer le change",
        tryTransfers: "Essayer les transferts",
      },
    },
    home: {
      heroEyebrow: "Comparaison financière pour décider",
      heroTitle: "Trouvez votre meilleure option financière en Europe en moins de 60 secondes",
      heroSubtitle:
        "Comparez plus de 40 banques et fintechs en toute transparence — sans frais cachés et sans impact sur votre score de crédit",
      heroCta: "Vérifier vos options",
      heroCtaSecondary: "Voir les meilleures offres",
      heroPanelTitle: "Meilleures offres dans votre marché",
      heroPanelSubtitle: "Classées par transparence, frais et pertinence pour votre marché sélectionné.",
      heroPanelSignalsTitle: "Signaux de décision",
      heroPanelSignalSummary: "Des fournisseurs et catégories clés dans une vue rapide pour comparer plus vite.",
      heroPanelNoteTitle: "Pourquoi cette vue aide",
      heroPanelNoteBody: "Voyez les tarifs, frais et compromis avant de quitter Payn.",
      trustRating: "⭐ 4,9/5 d'après les avis utilisateurs",
      needsTitle: "De quoi avez-vous besoin ?",
      needsActions: [
        "Emprunter de l'argent",
        "Envoyer de l'argent à l'étranger",
        "Obtenir une meilleure carte",
        "Changer de devise",
      ],
      valuePoints: [
        "Des comparaisons transparentes avec taux, frais et compromis visibles.",
        "Aucun frais caché dans le parcours fournisseur.",
        "Une UX pensée pour décider avant de cliquer ailleurs.",
        "Consulter vos options n'affecte pas votre score de crédit.",
      ],
      browseByCategory: "Explorer les produits financiers",
      categoryCountLabel: "catégories",
      products: "produits",
      topRanked: "Meilleures offres",
      topRankedSubtitle: "Sélectionnées pour toute l'Europe",
      seeAll: "Voir tout",
      tagFastest: "Le plus rapide",
      tagNoFees: "Sans frais",
      tagBestValue: "Meilleur rapport",
      whyPaynEyebrow: "Pourquoi Payn",
      whyPaynTitle: "Pourquoi les gens utilisent Payn avant de déposer une demande",
      howItWorksEyebrow: "Comment ça marche",
      howItWorksTitle: "Trois étapes du besoin au fournisseur",
      openExplore: "Commencer à comparer",
      step: "Étape",
      steps: [
        "Sélectionnez ce dont vous avez besoin",
        "Comparez les offres",
        "Continuez avec le fournisseur",
      ],
      appHeadline: "Enregistrer sur le web, continuer sur mobile",
      appSubtitle:
        "Constituez votre shortlist sur n'importe quel appareil. Comparez côte à côte. Quand vient le moment de décider, tout reste là où vous l'avez laissé.",
      appBullets: [
        "Votre shortlist se synchronise entre appareils",
        "Comparaison côte à côte en mobilité",
        "Reprenez là où vous vous êtes arrêté",
      ],
      appWaitlistNote: "Rejoignez la liste d'attente pour un accès anticipé. iOS et Android.",
      providerTitle: "Couverture fournisseurs",
      providerDescription:
        "Les fournisseurs reconnus restent visibles sous les résultats pour ancrer le marché dans de vraies institutions.",
      appTitle: "App Payn",
      appDescription:
        "L'app mobile est encore en liste d'attente, mais le parcours est réel et lié à la feuille de route actuelle.",
      appPoints: [
        "Suivre les offres enregistrées entre pays et catégories",
        "Recevoir des alertes quand les conditions changent",
        "Passer de la comparaison web à un espace mobile connecté",
      ],
      waitlistCta: "Rejoindre la liste mobile",
      howWeRankOffers: "Comment nous classons les offres",
      noAccountRequired: "Aucun compte requis pour comparer.",
      heroPillProviders: "40+ fournisseurs",
      heroPillCategories: "Prêts · Cartes · Virements · Change",
      heroPillNoSignup: "Sans inscription",
      heroEyebrowShort: "Finances orientées décision",
      heroHeadline: "Comparez moins. Décidez mieux.",
      heroSubtitleShort: "Payn transforme la recherche financière complexe en une recommandation claire, avec prix et compromis visibles avant de partir.",
      whyPaynCards: [
        {
          title: "Tarification claire",
          description: "Taux, frais et compromis restent visibles avant de quitter Payn.",
        },
        {
          title: "Pas de frais cachés",
          description: "Les signaux de coût restent en surface au lieu d'être noyés dans le parcours du partenaire.",
        },
        {
          title: "Pensé pour décider",
          description: "Comparez vite et n'avancez que lorsqu'une offre mérite votre temps.",
        },
        {
          title: "Sans impact crédit",
          description: "Consulter des options sur Payn n'affecte pas votre score de crédit.",
        },
      ],
      waitlistModal: {
        badge: "Accès anticipé",
        title: "Être notifié au lancement",
        subtitle: "Entrez votre email et nous vous contacterons dès que Payn sera disponible sur iOS et Android.",
        placeholder: "votre@email.fr",
        submit: "Me notifier",
        submitting: "Enregistrement…",
        successMessage: "Vous êtes sur la liste ! Nous vous préviendrons au lancement.",
        errorFallback: "Une erreur s'est produite. Veuillez réessayer.",
        noSpam: "Pas de spam. Désabonnez-vous à tout moment.",
      },
      mobile: {
        badge: "Accès anticipé ouvert",
        heading: "Payn sur mobile — bientôt disponible",
        subtitle: "Votre sélection, comparaisons et offres sauvegardées — dans votre poche. iOS et Android.",
        joinWishlist: "Rejoindre la liste d'attente",
        learnMore: "En savoir plus",
      },
      mockup: {
        yourShortlist: "Votre sélection",
        productsSaved: "{count} produits sauvegardés",
        compare: "Comparer",
        bestOptionFound: "Meilleure option trouvée",
        continue: "Continuer",
        navHome: "Accueil",
        navExplore: "Explorer",
        navSaved: "Sauvegardé",
        navSettings: "Paramètres",
      },
    },
    offerCard: {
      updated: "Mis à jour aujourd'hui",
      keyTradeoff: "Point d'attention",
      reviewOffer: "Voir les détails",
      providerSite: "Aller au fournisseur",
      reviewBeforeLeave: "Vérifiez le produit sur Payn avant de quitter vers le fournisseur.",
      providerCta: {
        loans: "Vérifier mon taux",
        cards: "Voir la carte",
        transfers: "Ouvrir le fournisseur",
        exchange: "Ouvrir le fournisseur",
        insurance: "Voir le prix",
        investments: "Voir la plateforme",
      },
      compareAdded: "Ajouté",
      compareToggle: "Comparer",
      partnerLabel: "Partenaire",
    },
    offerDetail: {
      detailEyebrow: "Détail de l'offre",
      reviewedOn: "révisé le",
      backToCategory: "Retour à la catégorie",
      visitProvider: "Voir le fournisseur",
      primaryAction: "Action principale",
      primaryActionBody: "Ouvrez {provider} quand vous êtes prêt à continuer.",
      ratesTitle: "Conditions",
      benefitsTitle: "Avantages",
      tradeoffsTitle: "Points à surveiller",
      whyShown: "Pourquoi Payn montre cette offre",
      tradeoff: "Principal point d'attention",
      beforeClick: "Avant de continuer",
      related: "Continuer à comparer",
      viewAll: "Voir tout",
      beforeClickPoints: [
        "La disponibilité, le prix et l'éligibilité peuvent varier selon le pays et le profil.",
        "Vérifiez le site du fournisseur pour les conditions, frais et critères actuels.",
        "Payn peut percevoir une commission auprès de certains partenaires, mais la rémunération seule ne détermine pas l'ordre.",
      ],
    },
    footer: {
      compare: "Comparer",
      company: "Société",
      copy:
        "Comparez des produits financiers avec disponibilité par marché, prix visibles et logique de classement transparente.",
      credibility: "Créé par des professionnels de la fintech avec une expérience bancaire mondiale",
      disclaimer:
        "Payn peut percevoir une commission auprès de certains partenaires, mais la rémunération seule ne détermine pas l'ordre.",
    },
    about: {
      eyebrow: "À propos",
      title: "À propos de Payn",
      description: "Payn est un marché financier pensé pour décider, centré sur la clarté, la transparence et de meilleurs choix financiers.",
      missionTitle: "Notre mission",
      missionBody:
        "Payn veut rendre la découverte financière entre marchés plus utile. Commencez par un pays, affinez par catégorie et examinez les compromis avant de cliquer.",
      coverageTitle: "Ce que couvre Payn",
      coverageBody:
        "Le marché couvre désormais prêts, cartes, transferts, change, assurance et investissements sur des modèles européens et internationaux.",
      builtByTitle: "Créé par",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Fondateur & responsable produit",
      builtByExperience:
        "Expérience auprès de banques de rang 1 et 2, de fintechs d'entreprise, d'assureurs et de plateformes financières.",
      storyTitle: "Pourquoi Payn ?",
      storyBody: [
        "Payn a commencé sous le nom de CreditPay, une première tentative pour simplifier la manière dont les gens découvrent et comparent les produits financiers.",
        "Après avoir travaillé de près avec des banques et des plateformes financières dans toute l'Europe, il est devenu clair que la plupart des utilisateurs paient encore trop cher à cause d'un manque de transparence et de mauvais outils de comparaison.",
        "Payn est l'évolution de cette idée : une manière plus claire, plus rapide et plus transparente de prendre des décisions financières.",
      ],
      backgroundTitle: "Parcours",
      backgroundPoints: [
        "Plus de 10 ans dans les services financiers et la technologie",
        "Expérience en banque, paiements et plateformes de données",
        "Solutions financières développées sur plusieurs marchés",
      ],
      linkedinLabel: "Se connecter sur LinkedIn",
    },
    contact: {
      eyebrow: "Contact",
      title: "Contacter Payn",
      description: "Questions sur le produit, les partenariats ou une collaboration ? Contactez-nous directement.",
      chatTitle: "Contacter le fondateur",
      chatBody: "Pour les partenariats, échanges produit, intégrations et retours.",
      chatCta: "Discuter avec nous",
      reachTitle: "Email",
      reachBody: "Vous préférez l'email ? Utilisez-le pour un suivi ou pour tout sujet qui ne demande pas une conversation en direct.",
      emailCta: "Envoyer un email à Payn",
      founderNote:
        "Payn s'appuie sur cette expérience pour rendre la comparaison financière plus claire, plus rapide et plus transparente.",
      partnershipTitle: "Partenariats",
      partnershipBody: "Partagez votre société, votre type de produit et vos marchés couverts pour démarrer avec du contexte.",
      partnershipCta: "Parler partenariat",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Montant",
      Term: "Durée",
      "Annual fee": "Frais annuels",
      "Monthly fee": "Frais mensuels",
      Speed: "Vitesse",
      Fee: "Frais",
      Cover: "Couverture",
      "Monthly premium": "Prime mensuelle",
      "Waiting period": "Délai d'attente",
      "Trip length": "Durée du voyage",
      Liability: "Responsabilité",
      Roadside: "Assistance",
      Markets: "Marchés",
      Access: "Accès",
      "Custody fee": "Frais de garde",
    },
  },
  it: {
    nav: {
      marketplace: "Esplora",
      about: "Chi siamo",
      contact: "Contatti",
      signIn: "Accedi",
      dashboard: "Dashboard",
      compareOptions: "Inizia",
      myOffers: "Le mie offerte",
      mobileWaitlist: "Lista app",
      country: "Paese",
      language: "Lingua",
      currency: "Valuta",
    },
    categories: {
      all: "Tutte le categorie",
      loans: "Prestiti",
      cards: "Carte",
      transfers: "Trasferimenti",
      exchange: "Cambio",
      insurance: "Assicurazioni",
      investments: "Investimenti",
    },
    categoryDescriptions: {
      loans: "Prestiti con prezzi visibili, importi e contesto di durata.",
      cards: "Carte confrontate per commissioni, vantaggi e uso in viaggio.",
      transfers: "Trasferimenti ordinati per valore ricevuto, velocità e metodo di pagamento.",
      exchange: "Strumenti di cambio confrontati per spread, commissioni ed esecuzione.",
      insurance: "Coperture vita, salute, viaggio e auto.",
      investments: "Piattaforme per azioni, crypto e conti multi-asset.",
    },
    markets: {
      eu: "Tutta Europa",
      international: "Internazionale",
      de: "Germania",
      es: "Spagna",
      uk: "Regno Unito",
      fr: "Francia",
      it: "Italia",
      pt: "Portogallo",
      nl: "Paesi Bassi",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Cerca",
      searchPlaceholder: "Cerca prodotti, provider o casi d'uso",
      countryLabel: "Paese",
      categoryLabel: "Categoria",
      providerLabel: "Provider",
      featureLabel: "Focus",
      subtypeLabel: "Sottotipo",
      amountLabel: "Importo richiesto",
      termLabel: "Copertura minima della durata",
      reset: "Reimposta filtri",
      anyProvider: "Tutti i provider",
      anyFeature: "Qualsiasi focus",
      anySubtype: "Qualsiasi sottotipo",
    },
    explorer: {
      eyebrow: "Marketplace per paese",
      title: "Parti da paese, categoria e filtri reali.",
      description:
        "Payn ora apre con selezione del mercato, filtri utili e risultati immediati invece di una hero dominante.",
      liveRankingLabel: "Classifica live",
      optionsInCountry: "{count} opzioni in {country}",
      resultsLabel: "risultati",
      providersLabel: "provider",
      filteredFrom: "Filtrato da",
      availableIn: "Disponibile in",
      topResults: "Risultati principali",
      emptyTitle: "Nessuna offerta trovata",
      emptyDescription: "Prova un altro paese, un'altra categoria o filtri diversi.",
      filterSummary: "I risultati cambiano subito quando cambiano paese, categoria, ricerca o filtri.",
      openCategoryPage: "Apri pagina categoria",
      filtersButton: "Filtri",
      searchChipPrefix: "Ricerca",
      showingResults: "{shown} di {total} risultati",
      showMoreResults: "Mostra altri risultati",
      sortOptions: {
        relevance: "Migliore corrispondenza",
        fees: "Costo più basso",
        speed: "Più veloce",
        recommended: "Consigliato",
      },
      emptyActions: {
        clearFilters: "Cancella filtri",
        openCards: "Apri carte",
        showAllCategories: "Tutte le categorie",
        tryExchange: "Prova il cambio",
        tryTransfers: "Prova i trasferimenti",
      },
    },
    home: {
      heroEyebrow: "Confronto finanziario per decidere",
      heroTitle: "Trova la tua migliore opzione finanziaria in Europa in meno di 60 secondi",
      heroSubtitle:
        "Confronta più di 40 banche e fintech con piena trasparenza — senza costi nascosti e senza impatto sul tuo punteggio di credito",
      heroCta: "Controlla le opzioni",
      heroCtaSecondary: "Vedi le migliori offerte",
      heroPanelTitle: "Migliori offerte nel tuo mercato",
      heroPanelSubtitle: "Classificate per trasparenza, costi e aderenza al mercato selezionato.",
      heroPanelSignalsTitle: "Segnali decisionali",
      heroPanelSignalSummary: "Provider affidabili e categorie chiave in una vista rapida per confrontare meglio.",
      heroPanelNoteTitle: "Perché questa vista aiuta",
      heroPanelNoteBody: "Vedi tassi, costi e compromessi prima di uscire da Payn.",
      trustRating: "⭐ 4,9/5 in base alle recensioni degli utenti",
      needsTitle: "Di cosa hai bisogno?",
      needsActions: [
        "Prendere denaro in prestito",
        "Inviare denaro all'estero",
        "Trovare una carta migliore",
        "Cambiare valuta",
      ],
      valuePoints: [
        "Confronti trasparenti con prezzi, costi e compromessi ben visibili.",
        "Nessun costo nascosto nei passaggi del provider.",
        "Una UX pensata per decidere prima di uscire verso il provider.",
        "Controllare le opzioni non influisce sul tuo punteggio di credito.",
      ],
      browseByCategory: "Esplora i prodotti finanziari",
      categoryCountLabel: "categorie",
      products: "prodotti",
      topRanked: "Offerte top",
      topRankedSubtitle: "Selezionate per tutta Europa",
      seeAll: "Vedi tutto",
      tagFastest: "Più rapido",
      tagNoFees: "Senza commissioni",
      tagBestValue: "Miglior valore",
      whyPaynEyebrow: "Perché Payn",
      whyPaynTitle: "Perché le persone usano Payn prima di fare domanda",
      howItWorksEyebrow: "Come funziona",
      howItWorksTitle: "Tre passaggi dal bisogno al provider",
      openExplore: "Inizia a confrontare",
      step: "Passo",
      steps: [
        "Seleziona ciò di cui hai bisogno",
        "Confronta le offerte",
        "Continua con il provider",
      ],
      appHeadline: "Salva sul web, continua su mobile",
      appSubtitle:
        "Costruisci la tua shortlist da qualsiasi dispositivo. Confronta affiancando le opzioni. Quando sei pronto a decidere, tutto resta dove lo hai lasciato.",
      appBullets: [
        "La shortlist si sincronizza tra dispositivi",
        "Confronto affiancato anche in movimento",
        "Riprendi da dove avevi interrotto",
      ],
      appWaitlistNote: "Entra nella lista di attesa per l'accesso anticipato. iOS e Android.",
      providerTitle: "Copertura provider",
      providerDescription:
        "I provider riconoscibili restano visibili sotto i risultati per mantenere il marketplace ancorato a istituzioni reali.",
      appTitle: "App Payn",
      appDescription:
        "L'app mobile è ancora in lista di attesa, ma il percorso è reale e collegato alla roadmap attuale.",
      appPoints: [
        "Seguire offerte salvate tra paesi e categorie",
        "Ricevere avvisi quando cambiano le condizioni",
        "Passare dal confronto web a uno spazio mobile autenticato",
      ],
      waitlistCta: "Entra nella lista mobile",
      howWeRankOffers: "Come classifichiamo le offerte",
      noAccountRequired: "Nessun account richiesto per confrontare.",
      heroPillProviders: "40+ provider",
      heroPillCategories: "Prestiti · Carte · Bonifici · Cambio",
      heroPillNoSignup: "Senza registrazione",
      heroEyebrowShort: "Finanza orientata alla decisione",
      heroHeadline: "Confronta meno. Decidi meglio.",
      heroSubtitleShort: "Payn trasforma la ricerca finanziaria caotica in una chiara raccomandazione, con prezzi e compromessi visibili prima di uscire.",
      whyPaynCards: [
        {
          title: "Prezzi trasparenti",
          description: "Tassi, costi e compromessi restano visibili prima di uscire da Payn.",
        },
        {
          title: "Nessun costo nascosto",
          description: "I segnali di costo restano in primo piano invece di sparire nel flusso del provider.",
        },
        {
          title: "UX orientata alla scelta",
          description: "Confronta rapidamente e vai avanti solo quando un risultato vale il tuo tempo.",
        },
        {
          title: "Nessun impatto sul credito",
          description: "Controllare le opzioni su Payn non influisce sul tuo punteggio creditizio.",
        },
      ],
      waitlistModal: {
        badge: "Accesso anticipato",
        title: "Notifica al lancio",
        subtitle: "Inserisci la tua email e ti contatteremo appena Payn sarà disponibile su iOS e Android.",
        placeholder: "tua@email.it",
        submit: "Notificami",
        submitting: "Salvataggio…",
        successMessage: "Sei in lista! Ti avviseremo al lancio dell'app.",
        errorFallback: "Qualcosa è andato storto. Riprova.",
        noSpam: "Niente spam. Cancellati quando vuoi.",
      },
      mobile: {
        badge: "Accesso anticipato aperto",
        heading: "Payn su mobile — in arrivo",
        subtitle: "La tua selezione, confronti e offerte salvate — in tasca. iOS e Android.",
        joinWishlist: "Iscriviti alla lista d'attesa",
        learnMore: "Scopri di più",
      },
      mockup: {
        yourShortlist: "La tua selezione",
        productsSaved: "{count} prodotti salvati",
        compare: "Confronta",
        bestOptionFound: "Migliore opzione trovata",
        continue: "Continua",
        navHome: "Home",
        navExplore: "Esplora",
        navSaved: "Salvati",
        navSettings: "Impostazioni",
      },
    },
    offerCard: {
      updated: "Aggiornato oggi",
      keyTradeoff: "Punto da valutare",
      reviewOffer: "Controlla i dettagli",
      providerSite: "Vai al provider",
      reviewBeforeLeave: "Controlla il prodotto su Payn prima di uscire verso il provider.",
      providerCta: {
        loans: "Controlla il tasso",
        cards: "Vedi la carta",
        transfers: "Apri il provider",
        exchange: "Apri il provider",
        insurance: "Vedi il prezzo",
        investments: "Vedi la piattaforma",
      },
      compareAdded: "Aggiunto",
      compareToggle: "Confronta",
      partnerLabel: "Partner",
    },
    offerDetail: {
      detailEyebrow: "Dettaglio offerta",
      reviewedOn: "revisionato il",
      backToCategory: "Torna alla categoria",
      visitProvider: "Vai al provider",
      primaryAction: "Azione principale",
      primaryActionBody: "Apri {provider} quando vuoi continuare.",
      ratesTitle: "Condizioni",
      benefitsTitle: "Vantaggi",
      tradeoffsTitle: "Aspetti da valutare",
      whyShown: "Perché Payn mostra questa offerta",
      tradeoff: "Punto principale da valutare",
      beforeClick: "Prima di continuare",
      related: "Continua a confrontare",
      viewAll: "Vedi tutto",
      beforeClickPoints: [
        "Disponibilità, prezzo ed eleggibilità possono cambiare in base a paese e profilo.",
        "Controlla il sito del provider per condizioni, commissioni e requisiti aggiornati.",
        "Payn può ricevere commissioni da alcuni partner, ma il compenso da solo non determina l'ordine.",
      ],
    },
    footer: {
      compare: "Confronta",
      company: "Azienda",
      copy:
        "Confronta prodotti finanziari con disponibilità per mercato, prezzi visibili e logica di ranking trasparente.",
      credibility: "Creato da professionisti fintech con esperienza bancaria globale",
      disclaimer:
        "Payn può ricevere commissioni da alcuni partner, ma il compenso da solo non determina l'ordine.",
    },
    about: {
      eyebrow: "Chi siamo",
      title: "Chi è Payn",
      description: "Payn è un marketplace finanziario orientato alla decisione, costruito su chiarezza, trasparenza e scelte finanziarie migliori.",
      missionTitle: "La nostra missione",
      missionBody:
        "Payn vuole rendere più utile la scoperta finanziaria tra mercati. Parti dal paese, restringi per categoria e valuta i compromessi prima del clic.",
      coverageTitle: "Cosa copre Payn",
      coverageBody:
        "Il marketplace copre ora prestiti, carte, trasferimenti, cambio, assicurazioni e investimenti con modelli europei e internazionali.",
      builtByTitle: "Creato da",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Founder e product lead",
      builtByExperience:
        "Esperienza con banche Tier 1 e Tier 2, fintech enterprise, compagnie assicurative e piattaforme finanziarie.",
      storyTitle: "Perché Payn?",
      storyBody: [
        "Payn è nato come CreditPay, un primo tentativo di semplificare il modo in cui le persone scoprono e confrontano i prodotti finanziari.",
        "Dopo aver lavorato a stretto contatto con banche e piattaforme finanziarie in tutta Europa, è diventato chiaro che la maggior parte degli utenti continua a pagare troppo a causa della scarsa trasparenza e di strumenti di confronto poco efficaci.",
        "Payn è l'evoluzione di quell'idea: un modo più pulito, veloce e trasparente di prendere decisioni finanziarie.",
      ],
      backgroundTitle: "Background",
      backgroundPoints: [
        "Oltre 10 anni nei servizi finanziari e nella tecnologia",
        "Esperienza con banking, pagamenti e piattaforme dati",
        "Soluzioni finanziarie costruite per mercati multipli",
      ],
      linkedinLabel: "Collegati su LinkedIn",
    },
    contact: {
      eyebrow: "Contatti",
      title: "Parla con Payn",
      description: "Domande sul prodotto, partnership o collaborazione? Contattaci direttamente.",
      chatTitle: "Contatta il founder",
      chatBody: "Per partnership, confronti di prodotto, integrazioni e feedback.",
      chatCta: "Chatta con noi",
      reachTitle: "Email",
      reachBody: "Preferisci l'email? Usala per follow-up o per tutto cio che non richiede una conversazione live.",
      emailCta: "Invia un'email a Payn",
      founderNote:
        "Payn nasce da questa esperienza per rendere il confronto finanziario più chiaro, veloce e trasparente.",
      partnershipTitle: "Partnership",
      partnershipBody: "Condividi azienda, tipo di prodotto e mercati coperti per iniziare con contesto.",
      partnershipCta: "Parla di partnership",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Importo",
      Term: "Durata",
      "Annual fee": "Canone annuo",
      "Monthly fee": "Canone mensile",
      Speed: "Velocità",
      Fee: "Commissione",
      Cover: "Copertura",
      "Monthly premium": "Premio mensile",
      "Waiting period": "Carenza",
      "Trip length": "Durata viaggio",
      Liability: "Responsabilità",
      Roadside: "Assistenza stradale",
      Markets: "Mercati",
      Access: "Accesso",
      "Custody fee": "Commissione custodia",
    },
  },
  pt: {
    nav: {
      marketplace: "Explorar",
      about: "Sobre",
      contact: "Contacto",
      signIn: "Entrar",
      dashboard: "Painel",
      compareOptions: "Começar",
      myOffers: "As minhas ofertas",
      mobileWaitlist: "Lista móvel",
      country: "País",
      language: "Idioma",
      currency: "Moeda",
    },
    categories: {
      all: "Todas as categorias",
      loans: "Empréstimos",
      cards: "Cartões",
      transfers: "Transferências",
      exchange: "Câmbio",
      insurance: "Seguros",
      investments: "Investimentos",
    },
    categoryDescriptions: {
      loans: "Empréstimos com preços visíveis, intervalos de montante e contexto de prazo.",
      cards: "Cartões comparados por comissões, benefícios e uso em viagem.",
      transfers: "Transferências ordenadas por valor entregue, velocidade e método de pagamento.",
      exchange: "Ferramentas de câmbio comparadas por spread, comissões e execução.",
      insurance: "Coberturas de vida, saúde, viagem e automóvel.",
      investments: "Plataformas para ações, cripto e contas multi-ativo.",
    },
    markets: {
      eu: "Toda a Europa",
      international: "Internacional",
      de: "Alemanha",
      es: "Espanha",
      uk: "Reino Unido",
      fr: "França",
      it: "Itália",
      pt: "Portugal",
      nl: "Países Baixos",
    },
    locales: {
      en: "English",
      de: "Deutsch",
      es: "Español",
      fr: "Français",
      it: "Italiano",
      pt: "Português",
    },
    filters: {
      searchLabel: "Pesquisar",
      searchPlaceholder: "Pesquisar produtos, fornecedores ou usos",
      countryLabel: "País",
      categoryLabel: "Categoria",
      providerLabel: "Fornecedor",
      featureLabel: "Foco",
      subtypeLabel: "Subtipo",
      amountLabel: "Montante necessário",
      termLabel: "Cobertura mínima de prazo",
      reset: "Limpar filtros",
      anyProvider: "Todos os fornecedores",
      anyFeature: "Qualquer foco",
      anySubtype: "Qualquer subtipo",
    },
    explorer: {
      eyebrow: "Marketplace por país",
      title: "Comece por país, categoria e filtros reais.",
      description:
        "A Payn agora abre com seleção de mercado, filtros úteis e resultados imediatos em vez de um hero dominante.",
      liveRankingLabel: "Ranking em tempo real",
      optionsInCountry: "{count} opções em {country}",
      resultsLabel: "resultados",
      providersLabel: "fornecedores",
      filteredFrom: "Filtrado de",
      availableIn: "Disponível em",
      topResults: "Melhores resultados",
      emptyTitle: "Nenhuma oferta encontrada",
      emptyDescription: "Experimente outro país, outra categoria ou filtros diferentes.",
      filterSummary: "Os resultados mudam de imediato quando muda país, categoria, pesquisa ou filtros.",
      openCategoryPage: "Abrir página da categoria",
      filtersButton: "Filtros",
      searchChipPrefix: "Pesquisa",
      showingResults: "A mostrar {shown} de {total} resultados",
      showMoreResults: "Ver mais resultados",
      sortOptions: {
        relevance: "Melhor correspondência",
        fees: "Menor custo",
        speed: "Mais rápido",
        recommended: "Recomendado",
      },
      emptyActions: {
        clearFilters: "Limpar filtros",
        openCards: "Ver cartões",
        showAllCategories: "Ver todas as categorias",
        tryExchange: "Experimentar câmbio",
        tryTransfers: "Experimentar transferências",
      },
    },
    home: {
      heroEyebrow: "Comparação financeira para decidir",
      heroTitle: "Encontre a sua melhor opção financeira na Europa em menos de 60 segundos",
      heroSubtitle:
        "Compare mais de 40 bancos e fintechs com total transparência — sem comissões ocultas e sem impacto no seu historial de crédito",
      heroCta: "Ver as suas opções",
      heroCtaSecondary: "Ver melhores ofertas",
      heroPanelTitle: "Melhores ofertas no seu mercado",
      heroPanelSubtitle: "Ordenadas por transparência, comissões e adequação ao mercado selecionado.",
      heroPanelSignalsTitle: "Sinais de decisão",
      heroPanelSignalSummary: "Fornecedores e categorias-chave numa vista rápida para comparar melhor.",
      heroPanelNoteTitle: "Porque esta vista ajuda",
      heroPanelNoteBody: "Veja taxas, comissões e trade-offs antes de sair da Payn.",
      trustRating: "⭐ 4,9/5 com base nas avaliações dos utilizadores",
      needsTitle: "Do que precisa?",
      needsActions: [
        "Pedir dinheiro emprestado",
        "Enviar dinheiro para o estrangeiro",
        "Conseguir um cartão melhor",
        "Trocar moeda",
      ],
      valuePoints: [
        "Comparações transparentes com taxas, comissões e compromissos visíveis.",
        "Sem comissões ocultas no fluxo do fornecedor.",
        "Uma experiência pensada para decidir antes de sair da Payn.",
        "Ver opções não afeta o seu historial de crédito.",
      ],
      browseByCategory: "Explorar produtos financeiros",
      categoryCountLabel: "categorias",
      products: "produtos",
      topRanked: "Melhores ofertas",
      topRankedSubtitle: "Selecionadas para toda a Europa",
      seeAll: "Ver tudo",
      tagFastest: "Mais rápido",
      tagNoFees: "Sem comissões",
      tagBestValue: "Melhor valor",
      whyPaynEyebrow: "Porque a Payn",
      whyPaynTitle: "Porque as pessoas usam a Payn antes de avançar",
      howItWorksEyebrow: "Como funciona",
      howItWorksTitle: "Três passos da necessidade ao fornecedor",
      openExplore: "Começar a comparar",
      step: "Passo",
      steps: [
        "Escolha o que precisa",
        "Compare ofertas",
        "Continue com o fornecedor",
      ],
      appHeadline: "Guardar na web, continuar no móvel",
      appSubtitle:
        "Construa a sua shortlist em qualquer dispositivo. Compare lado a lado. Quando chegar a hora de decidir, tudo continua onde ficou.",
      appBullets: [
        "A shortlist sincroniza entre dispositivos",
        "Comparação lado a lado em movimento",
        "Retome onde ficou",
      ],
      appWaitlistNote: "Entre na lista de espera para acesso antecipado. iOS e Android.",
      providerTitle: "Cobertura de fornecedores",
      providerDescription:
        "Fornecedores reconhecíveis continuam visíveis abaixo dos resultados para manter o marketplace ligado a instituições reais.",
      appTitle: "App Payn",
      appDescription:
        "A app móvel ainda está em lista de espera, mas o percurso é real e ligado ao roadmap atual.",
      appPoints: [
        "Acompanhar ofertas guardadas entre países e categorias",
        "Receber alertas quando as condições mudam",
        "Passar da comparação web para um espaço móvel autenticado",
      ],
      waitlistCta: "Entrar na lista móvel",
      howWeRankOffers: "Como classificamos as ofertas",
      noAccountRequired: "Sem conta necessária para comparar.",
      heroPillProviders: "40+ fornecedores",
      heroPillCategories: "Empréstimos · Cartões · Transferências · Câmbio",
      heroPillNoSignup: "Sem registo",
      heroEyebrowShort: "Finanças orientadas para a decisão",
      heroHeadline: "Compare menos. Decida melhor.",
      heroSubtitleShort: "Payn transforma a pesquisa financeira confusa numa recomendação clara, com preços e compromissos visíveis antes de sair.",
      whyPaynCards: [
        {
          title: "Preços transparentes",
          description: "Taxas, comissões e compromissos mantêm-se visíveis antes de sair da Payn.",
        },
        {
          title: "Sem comissões ocultas",
          description: "Os sinais de custo ficam à frente em vez de desaparecerem no fluxo do fornecedor.",
        },
        {
          title: "UX para decidir",
          description: "Compare depressa e avance apenas quando a opção merece o seu tempo.",
        },
        {
          title: "Sem impacto no crédito",
          description: "Ver opções na Payn não afeta a sua pontuação de crédito.",
        },
      ],
      waitlistModal: {
        badge: "Acesso antecipado",
        title: "Ser notificado no lançamento",
        subtitle: "Insira o seu email e entraremos em contacto assim que a Payn estiver disponível no iOS e Android.",
        placeholder: "seu@email.pt",
        submit: "Notifique-me",
        submitting: "A guardar…",
        successMessage: "Está na lista! Notificaremos quando a app for lançada.",
        errorFallback: "Algo correu mal. Por favor, tente novamente.",
        noSpam: "Sem spam. Cancele a qualquer momento.",
      },
      mobile: {
        badge: "Acesso antecipado aberto",
        heading: "Payn no telemóvel — em breve",
        subtitle: "A sua seleção, comparações e ofertas guardadas — no seu bolso. iOS e Android.",
        joinWishlist: "Entrar na lista de espera",
        learnMore: "Saber mais",
      },
      mockup: {
        yourShortlist: "A sua seleção",
        productsSaved: "{count} produtos guardados",
        compare: "Comparar",
        bestOptionFound: "Melhor opção encontrada",
        continue: "Continuar",
        navHome: "Início",
        navExplore: "Explorar",
        navSaved: "Guardado",
        navSettings: "Definições",
      },
    },
    offerCard: {
      updated: "Atualizado hoje",
      keyTradeoff: "Ponto principal a rever",
      reviewOffer: "Ver detalhes",
      providerSite: "Ir ao fornecedor",
      reviewBeforeLeave: "Veja o produto na Payn antes de sair para o fornecedor.",
      providerCta: {
        loans: "Ver a minha taxa",
        cards: "Ver cartão",
        transfers: "Abrir fornecedor",
        exchange: "Abrir fornecedor",
        insurance: "Ver preço",
        investments: "Ver plataforma",
      },
      compareAdded: "Adicionado",
      compareToggle: "Comparar",
      partnerLabel: "Parceiro",
    },
    offerDetail: {
      detailEyebrow: "Detalhe da oferta",
      reviewedOn: "revisto em",
      backToCategory: "Voltar à categoria",
      visitProvider: "Ir ao fornecedor",
      primaryAction: "Ação principal",
      primaryActionBody: "Abra {provider} quando estiver pronto para continuar.",
      ratesTitle: "Condições",
      benefitsTitle: "Vantagens",
      tradeoffsTitle: "Aspetos a rever",
      whyShown: "Porque a Payn mostra esta oferta",
      tradeoff: "Ponto principal a rever",
      beforeClick: "Antes de continuar",
      related: "Continuar a comparar",
      viewAll: "Ver tudo",
      beforeClickPoints: [
        "Disponibilidade, preço e elegibilidade podem variar por país e perfil.",
        "Verifique o site do fornecedor para condições, comissões e requisitos atuais.",
        "A Payn pode receber comissão de alguns parceiros, mas a compensação por si só não determina a ordem.",
      ],
    },
    footer: {
      compare: "Comparar",
      company: "Empresa",
      copy:
        "Compare produtos financeiros com disponibilidade por mercado, preços visíveis e lógica de ranking transparente.",
      credibility: "Criado por profissionais de fintech com experiência bancária global",
      disclaimer:
        "A Payn pode receber comissão de alguns parceiros, mas a compensação por si só não determina a ordem.",
    },
    about: {
      eyebrow: "Sobre",
      title: "Sobre a Payn",
      description: "A Payn é um marketplace financeiro orientado à decisão, focado em clareza, transparência e melhores escolhas financeiras.",
      missionTitle: "A nossa missão",
      missionBody:
        "A Payn quer tornar a descoberta financeira entre mercados mais útil. Comece pelo país, reduza por categoria e reveja os compromissos antes do clique.",
      coverageTitle: "O que a Payn cobre",
      coverageBody:
        "O marketplace cobre agora empréstimos, cartões, transferências, câmbio, seguros e investimentos com modelos europeus e internacionais.",
      builtByTitle: "Criado por",
      builtByName: "Kyrylo Petrov",
      builtByBody: "Fundador & líder de produto",
      builtByExperience:
        "Experiência com bancos Tier 1 e Tier 2, fintech empresarial, seguradoras e plataformas financeiras.",
      storyTitle: "Porque a Payn?",
      storyBody: [
        "A Payn começou como CreditPay, uma primeira tentativa de simplificar a forma como as pessoas descobrem e comparam produtos financeiros.",
        "Depois de trabalhar de perto com bancos e plataformas financeiras em toda a Europa, ficou claro que a maioria dos utilizadores continua a pagar demasiado por falta de transparência e por ferramentas de comparação fracas.",
        "A Payn é a evolução dessa ideia: uma forma mais limpa, rápida e transparente de tomar decisões financeiras.",
      ],
      backgroundTitle: "Percurso",
      backgroundPoints: [
        "Mais de 10 anos em serviços financeiros e tecnologia",
        "Experiência com banca, pagamentos e plataformas de dados",
        "Soluções financeiras construídas em vários mercados",
      ],
      linkedinLabel: "Ligar no LinkedIn",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Fale com a Payn",
      description: "Questões sobre o produto, parcerias ou colaboração? Fale connosco diretamente.",
      chatTitle: "Contactar o fundador",
      chatBody: "Para parcerias, conversas sobre produto, integrações e feedback.",
      chatCta: "Abrir chat",
      reachTitle: "Email",
      reachBody: "Prefere email? Use-o para seguimento ou para tudo o que não exija uma conversa em direto.",
      emailCta: "Enviar email à Payn",
      founderNote:
        "A Payn apoia-se nessa experiência para tornar a comparação financeira mais clara, rápida e transparente.",
      partnershipTitle: "Parcerias",
      partnershipBody: "Partilhe empresa, tipo de produto e mercados cobertos para começar com contexto.",
      partnershipCta: "Falar sobre parcerias",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Montante",
      Term: "Prazo",
      "Annual fee": "Comissão anual",
      "Monthly fee": "Comissão mensal",
      Speed: "Velocidade",
      Fee: "Comissão",
      Cover: "Cobertura",
      "Monthly premium": "Prémio mensal",
      "Waiting period": "Período de espera",
      "Trip length": "Duração da viagem",
      Liability: "Responsabilidade",
      Roadside: "Assistência",
      Markets: "Mercados",
      Access: "Acesso",
      "Custody fee": "Comissão de custódia",
    },
  },
};

export function getDictionary(locale: MarketplaceLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function getMetricLabel(locale: MarketplaceLocale, label: string) {
  const dictionary = getDictionary(locale);
  return dictionary.metrics[label] ?? label;
}

const localizedReasons: Record<MarketplaceLocale, Record<string, string>> = {
  en: {},
  de: {
    "Visible pricing": "Sichtbare Preisangaben",
    "Provider context": "Anbieterkontext",
    "Top-ranked in this category": "Top-Platzierung in dieser Kategorie",
    "Competitive starting rate": "Wettbewerbsfähiger Einstiegszins",
    "Mid-range APR": "APR im Mittelfeld",
    "Low or zero transfer fees": "Niedrige oder keine Transfergebühren",
    "Near mid-market exchange rate": "Nahe am Mittelkurs",
    "High borrowing limit available": "Hoher Kreditrahmen verfügbar",
    "High overall product score": "Hohe Gesamtbewertung des Produkts",
  },
  es: {
    "Visible pricing": "Precios visibles",
    "Provider context": "Contexto del proveedor",
    "Top-ranked in this category": "Entre las primeras de la categoría",
    "Competitive starting rate": "Tipo inicial competitivo",
    "Mid-range APR": "APR en rango medio",
    "Low or zero transfer fees": "Comisiones de transferencia bajas o nulas",
    "Near mid-market exchange rate": "Cerca del tipo medio de mercado",
    "High borrowing limit available": "Límite de financiación alto",
    "High overall product score": "Puntuación global alta del producto",
  },
  fr: {
    "Visible pricing": "Tarification visible",
    "Provider context": "Contexte du fournisseur",
    "Top-ranked in this category": "Parmi les mieux classées de la catégorie",
    "Competitive starting rate": "Taux de départ compétitif",
    "Mid-range APR": "TAEG de milieu de gamme",
    "Low or zero transfer fees": "Frais de transfert faibles ou nuls",
    "Near mid-market exchange rate": "Proche du taux moyen du marché",
    "High borrowing limit available": "Plafond d'emprunt élevé",
    "High overall product score": "Score global produit élevé",
  },
  it: {
    "Visible pricing": "Prezzi visibili",
    "Provider context": "Contesto del provider",
    "Top-ranked in this category": "Tra le prime della categoria",
    "Competitive starting rate": "Tasso iniziale competitivo",
    "Mid-range APR": "APR di fascia media",
    "Low or zero transfer fees": "Commissioni di trasferimento basse o zero",
    "Near mid-market exchange rate": "Vicino al tasso medio di mercato",
    "High borrowing limit available": "Importo finanziabile elevato",
    "High overall product score": "Punteggio complessivo elevato",
  },
  pt: {
    "Visible pricing": "Precos visiveis",
    "Provider context": "Contexto do fornecedor",
    "Top-ranked in this category": "Entre as melhores da categoria",
    "Competitive starting rate": "Taxa inicial competitiva",
    "Mid-range APR": "APR intermédia",
    "Low or zero transfer fees": "Comissões de transferência baixas ou nulas",
    "Near mid-market exchange rate": "Perto da taxa média de mercado",
    "High borrowing limit available": "Limite elevado disponível",
    "High overall product score": "Pontuação global elevada do produto",
  },
};

const localizedUiTokens: Record<MarketplaceLocale, Record<string, string>> = {
  en: {},
  de: {
    "Best match": "Beste Wahl",
    Cheapest: "Günstigste Option",
    Fastest: "Schnellste Option",
    "Best rated": "Bestbewertet",
    "Most flexible": "Flexibelste Option",
    "Lowest fees": "Niedrigste Gebühren",
    Easiest: "Am einfachsten",
    "Pro tools": "Profi-Tools",
    "Savings plan": "Sparplan",
    "Travel-friendly": "Reisefreundlich",
    "Best cashback": "Stärkstes Cashback",
    "Crypto support": "Krypto-Support",
    "No annual fee": "Keine Jahresgebühr",
    "Country fit": "Passend für dieses Land",
    "Live quote": "Live-Kurs",
    "Consumer credit": "Konsumentenkredit",
    "Travel-first": "Reisefokus",
    "Cashback-first": "Cashback-Fokus",
    "FX-first": "FX-Fokus",
    "ATM focus": "Bargeld-Fokus",
    "Stronger ATM": "Höherer Bargeldrahmen",
    "Instant setup": "Sofort startklar",
    "Check provider": "Beim Anbieter prüfen",
    "Best overall": "Beste Gesamtwahl",
    "Best travel fit": "Beste Reiseoption",
    "Best cashback angle": "Bestes Cashback-Profil",
    Viewed: "Angesehen",
    Saved: "Gespeichert",
    Resume: "Fortsetzen",
    Name: "Name",
    Country: "Land",
    "Profile type": "Profiltyp",
    "Market scope": "Marktabdeckung",
    "Saved categories": "Gespeicherte Kategorien",
    "Not set yet": "Noch nicht festgelegt",
    Dashboard: "Dashboard",
    Settings: "Einstellungen",
    Compare: "Vergleichen",
    Added: "Hinzugefügt",
    Open: "Öffnen",
  },
  es: {
    Compare: "Comparar",
    Added: "Añadido",
    Open: "Abrir",
    Partner: "Partner",
    "Best value": "Mejor opción",
    "Best match": "Mejor encaje",
    Recommended: "Recomendado",
  },
  fr: {},
  it: {},
  pt: {},
};

const localizedTradeoffs: Record<MarketplaceLocale, Record<string, string>> = {
  en: {},
  de: {
    "Pricing can move up quickly for smaller amounts or thinner credit profiles.":
      "Die Preisgestaltung kann bei kleineren Beträgen oder schwächerem Profil schnell steigen.",
    "Final approval and pricing still depend on local eligibility, income, and credit checks.":
      "Endgültige Zusage und Preis hängen weiter von lokaler Eignung, Einkommen und Bonitätsprüfung ab.",
    "The strongest perks usually come with a recurring plan fee.":
      "Die stärksten Vorteile kommen meist mit einer laufenden Plan-Gebühr.",
    "Travel or reward value only pays off when it matches how you actually spend.":
      "Reise- oder Bonusvorteile lohnen sich nur, wenn sie zum echten Ausgabeverhalten passen.",
    "The lowest-cost route can still be slower than faster payout options.":
      "Die günstigste Route kann trotzdem langsamer sein als schnellere Auszahlungsoptionen.",
    "Delivered amount still changes with corridor, payout method, and timing.":
      "Der ausgezahlte Betrag hängt weiter von Korridor, Auszahlungsart und Timing ab.",
    "A clean headline rate can still sit next to markups or conversion fees.":
      "Ein sauberer Kurs kann trotzdem mit Aufschlägen oder Umtauschgebühren verbunden sein.",
    "The final rate still depends on spread, fee structure, and execution timing.":
      "Der Endkurs hängt weiter von Spread, Gebührenstruktur und Ausführungszeitpunkt ab.",
    "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.":
      "Prämien, Ausschlüsse und Annahme können sich je nach Alter, Gesundheit, Fahrzeugprofil oder Reisedetails ändern.",
    "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.":
      "Niedrige sichtbare Gebühren beseitigen weder Marktrisiko noch Depotbedingungen, FX-Kosten oder Produktkomplexität.",
  },
  es: {
    "Pricing can move up quickly for smaller amounts or thinner credit profiles.":
      "El precio puede subir rápido con importes pequeños o perfiles de crédito más ajustados.",
    "Final approval and pricing still depend on local eligibility, income, and credit checks.":
      "La aprobación final y el precio siguen dependiendo de elegibilidad local, ingresos y revisión de crédito.",
    "The strongest perks usually come with a recurring plan fee.":
      "Las mejores ventajas suelen venir con una cuota recurrente.",
    "Travel or reward value only pays off when it matches how you actually spend.":
      "El valor de viaje o recompensas solo compensa cuando encaja con tu gasto real.",
    "The lowest-cost route can still be slower than faster payout options.":
      "La ruta más barata puede seguir siendo más lenta que otras opciones de pago.",
    "Delivered amount still changes with corridor, payout method, and timing.":
      "El importe entregado sigue cambiando según corredor, método de pago y momento.",
    "A clean headline rate can still sit next to markups or conversion fees.":
      "Un tipo atractivo puede seguir acompañado de recargos o comisiones de conversión.",
    "The final rate still depends on spread, fee structure, and execution timing.":
      "El tipo final sigue dependiendo del spread, la estructura de comisiones y el momento de ejecución.",
    "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.":
      "Primas, exclusiones y aceptación pueden cambiar según edad, salud, perfil del vehículo o detalles del viaje.",
    "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.":
      "Las comisiones bajas a la vista no eliminan el riesgo de mercado, la custodia, el FX ni la complejidad del producto.",
  },
  fr: {
    "Pricing can move up quickly for smaller amounts or thinner credit profiles.":
      "Le prix peut monter vite pour de petits montants ou des profils de crédit plus fragiles.",
    "Final approval and pricing still depend on local eligibility, income, and credit checks.":
      "L'accord final et le prix dépendent toujours de l'éligibilité locale, des revenus et du contrôle de crédit.",
    "The strongest perks usually come with a recurring plan fee.":
      "Les meilleurs avantages s'accompagnent souvent d'un abonnement payant.",
    "Travel or reward value only pays off when it matches how you actually spend.":
      "La valeur voyage ou récompense ne paie que si elle correspond vraiment à vos dépenses.",
    "The lowest-cost route can still be slower than faster payout options.":
      "L'option la moins chère peut rester plus lente qu'un paiement plus rapide.",
    "Delivered amount still changes with corridor, payout method, and timing.":
      "Le montant reçu dépend toujours du corridor, du mode de versement et du timing.",
    "A clean headline rate can still sit next to markups or conversion fees.":
      "Un taux attractif peut toujours être accompagné de marges ou de frais de conversion.",
    "The final rate still depends on spread, fee structure, and execution timing.":
      "Le taux final dépend toujours du spread, de la structure de frais et du moment d'exécution.",
    "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.":
      "Primes, exclusions et acceptation peuvent évoluer selon l'âge, la santé, le profil du véhicule ou le voyage.",
    "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.":
      "Des frais affichés bas n'éliminent ni le risque de marché, ni la garde, ni le FX, ni la complexité.",
  },
  it: {
    "Pricing can move up quickly for smaller amounts or thinner credit profiles.":
      "Il prezzo puo salire rapidamente per importi piccoli o profili di credito piu deboli.",
    "Final approval and pricing still depend on local eligibility, income, and credit checks.":
      "Approvazione finale e prezzo dipendono ancora da idoneita locale, reddito e controlli sul credito.",
    "The strongest perks usually come with a recurring plan fee.":
      "I vantaggi migliori arrivano spesso con un canone ricorrente.",
    "Travel or reward value only pays off when it matches how you actually spend.":
      "Il valore di viaggio o reward conta solo se corrisponde alla spesa reale.",
    "The lowest-cost route can still be slower than faster payout options.":
      "La rotta piu economica puo essere comunque piu lenta delle opzioni piu rapide.",
    "Delivered amount still changes with corridor, payout method, and timing.":
      "L'importo ricevuto cambia ancora in base a corridoio, metodo di pagamento e tempistiche.",
    "A clean headline rate can still sit next to markups or conversion fees.":
      "Un buon tasso puo comunque nascondere ricarichi o commissioni di conversione.",
    "The final rate still depends on spread, fee structure, and execution timing.":
      "Il tasso finale dipende ancora da spread, struttura commissionale e momento di esecuzione.",
    "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.":
      "Premi, esclusioni e accettazione possono cambiare con eta, salute, profilo del veicolo o dettagli del viaggio.",
    "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.":
      "Commissioni basse in evidenza non eliminano rischio di mercato, custodia, costi FX o complessita del prodotto.",
  },
  pt: {
    "Pricing can move up quickly for smaller amounts or thinner credit profiles.":
      "O preco pode subir rapidamente para montantes pequenos ou perfis de credito mais fracos.",
    "Final approval and pricing still depend on local eligibility, income, and credit checks.":
      "A aprovacao final e o preco continuam a depender da elegibilidade local, rendimento e analise de credito.",
    "The strongest perks usually come with a recurring plan fee.":
      "Os melhores beneficios costumam vir com uma mensalidade recorrente.",
    "Travel or reward value only pays off when it matches how you actually spend.":
      "O valor de viagem ou recompensas so compensa quando corresponde ao gasto real.",
    "The lowest-cost route can still be slower than faster payout options.":
      "A rota de menor custo pode continuar a ser mais lenta do que opcoes de pagamento mais rapidas.",
    "Delivered amount still changes with corridor, payout method, and timing.":
      "O montante entregue continua a variar com corredor, metodo de pagamento e momento.",
    "A clean headline rate can still sit next to markups or conversion fees.":
      "Uma taxa apelativa pode continuar acompanhada de margens ou comissoes de conversao.",
    "The final rate still depends on spread, fee structure, and execution timing.":
      "A taxa final continua a depender do spread, da estrutura de comissoes e do momento de execucao.",
    "Premiums, exclusions, and acceptance can change with age, health, vehicle profile, or trip details.":
      "Premios, exclusoes e aceitacao podem mudar com idade, saude, perfil do veiculo ou detalhes da viagem.",
    "Low headline fees do not remove market risk, custody terms, FX costs, or product complexity.":
      "Comissoes baixas em destaque nao eliminam risco de mercado, custodia, custos FX ou complexidade do produto.",
  },
};

export function translateMatchReason(locale: MarketplaceLocale, reason: string) {
  const marketMatch = reason.match(/^Available in (\d+)\+ European markets$/);
  if (marketMatch) {
    const count = marketMatch[1];
    if (locale === "de") return `Verfugbar in ${count}+ europaischen Markten`;
    if (locale === "es") return `Disponible en ${count}+ mercados europeos`;
    if (locale === "fr") return `Disponible sur ${count}+ marches europeens`;
    if (locale === "it") return `Disponibile in ${count}+ mercati europei`;
    if (locale === "pt") return `Disponivel em ${count}+ mercados europeus`;
  }

  return localizedReasons[locale][reason] ?? reason;
}

export function translateTradeoff(locale: MarketplaceLocale, tradeoff: string) {
  return localizedTradeoffs[locale][tradeoff] ?? tradeoff;
}

export function translateUiToken(locale: MarketplaceLocale, label: string) {
  return localizedUiTokens[locale][label] ?? label;
}

export function formatCopy(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (copy, [key, value]) => copy.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
