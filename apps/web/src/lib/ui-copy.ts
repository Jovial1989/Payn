import type { MarketplaceLocale } from "@payn/types";

type UserTypeOption = {
  id: "personal" | "freelancer" | "business";
  label: string;
  description: string;
};

type UiCopy = {
  common: {
    home: string;
    explore: string;
    saved: string;
    profile: string;
    signOut: string;
    saveOffer: string;
    savedOffer: string;
    savingOffer: string;
    review: string;
    opening: string;
    backToSite: string;
    guest: string;
    account: string;
    notSignedIn: string;
    edit: string;
    months: string;
    products: string;
    providers: string;
    views: string;
    saves: string;
    clicks: string;
    compare: string;
    apply: string;
    downloadOn: string;
    appStore: string;
    getItOn: string;
    googlePlay: string;
    earlyAccessOpen: string;
  };
  header: {
    accountMenuLabel: string;
    openMenuLabel: string;
    closeMenuLabel: string;
    savedOffers: string;
    loggedInState: string;
  };
  explorePromo: {
    providerCoverageEyebrow: string;
    providerCoverageTitle: string;
    providerCoverageDescription: string;
    mobileEyebrow: string;
    mobileTitle: string;
    mobileDescription: string;
    mobileBullets: string[];
    mobileCta: string;
  };
  waitlist: {
    heroTags: string[];
    nextStepsEyebrow: string;
    nextSteps: Array<{ title: string; text: string }>;
    warningTitle: string;
    warningDescription: string;
    formEyebrow: string;
    formTitle: string;
    formDescription: string;
    emailLabel: string;
    emailPlaceholder: string;
    platformLabel: string;
    platforms: {
      ios: string;
      android: string;
      both: string;
    };
    joining: string;
    joinBoth: string;
    joinPlatform: string;
    invalidEmail: string;
    configuring: string;
    saveFailed: string;
    success: string;
    alreadyOnWaitlist: string;
  };
  auth: {
    loginEyebrow: string;
    signupEyebrow: string;
    loginTitle: string;
    signupTitle: string;
    loginDescription: string;
    signupDescription: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    loginPasswordPlaceholder: string;
    signupPasswordPlaceholder: string;
    signingIn: string;
    creatingAccount: string;
    signIn: string;
    createAccount: string;
    panelLoginTitle: string;
    panelSignupTitle: string;
    benefits: string[];
    loginPrompt: string;
    signupPrompt: string;
    accountCreatedEyebrow: string;
    confirmEmailTitle: string;
    confirmEmailDescription: string;
    goToSignIn: string;
    onboardingEyebrow: string;
    onboardingTitle: string;
    onboardingDescription: string;
    onboardingCompleteLabel: string;
    loading: string;
    callbackError: string;
    notConfigured: string;
    genericError: string;
    invalidCredentials: string;
    alreadyRegistered: string;
    weakPassword: string;
    emailNotConfirmed: string;
    failedToFetch: string;
  };
  dashboard: {
    navGroups: {
      core: string;
      products: string;
      account: string;
    };
    navItems: {
      dashboard: { label: string; description: string };
      discover: { label: string; description: string };
      loans: { label: string; description: string };
      cards: { label: string; description: string };
      transfers: { label: string; description: string };
      exchange: { label: string; description: string };
      insurance: { label: string; description: string };
      investments: { label: string; description: string };
      profile: { label: string; description: string };
    };
    shellTag: string;
    shellTitle: string;
    userTypeSuffix: string;
    loadingDashboard: string;
    loadingWorkspace: string;
    guestEyebrow: string;
    guestTitle: string;
    guestDescription: string;
    summaryEyebrow: string;
    welcomeBack: string;
    openExplore: string;
    overviewRecommendedEyebrow: string;
    overviewRecommendedTitle: string;
    seeAll: string;
    categoriesEyebrow: string;
    categoriesTitle: string;
    savedEyebrow: string;
    savedTitle: string;
    browseMore: string;
    noSavedTitle: string;
    noSavedDescription: string;
    trendingEyebrow: string;
    trendingTitle: string;
    providersEyebrow: string;
    providersTitle: string;
    categoryMatchesTitle: string;
    noCategoryTitle: string;
    noCategoryDescription: string;
    stats: {
      paynScore: string;
      products: string;
      saved: string;
      providers: string;
      available: string;
    };
    accountEyebrow: string;
    accountTitle: string;
    profileTypeEyebrow: string;
    profileTypeTitle: string;
    interestsEyebrow: string;
    interestsTitle: string;
    useCasesEyebrow: string;
    useCasesTitle: string;
    emailLabel: string;
    marketLabel: string;
    savePreferences: string;
    savingPreferences: string;
    openProfile: string;
  };
  homeMockup: {
    shortlistTitle: string;
    savedProductsLabel: string;
    badges: string[];
    speeds: string[];
    compareAll: string;
    bestOption: string;
    readyToApply: string;
  };
  userTypes: UserTypeOption[];
  goalLabels: Record<string, string>;
};

const uiCopy: Record<MarketplaceLocale, UiCopy> = {
  en: {
    common: {
      home: "Home",
      explore: "Explore",
      saved: "Saved",
      profile: "Settings",
      signOut: "Sign out",
      saveOffer: "Save offer",
      savedOffer: "Saved",
      savingOffer: "Saving...",
      review: "Review",
      opening: "Opening...",
      backToSite: "Back to site",
      guest: "Guest",
      account: "Account",
      notSignedIn: "Not signed in",
      edit: "Edit",
      months: "months",
      products: "products",
      providers: "providers",
      views: "views",
      saves: "saves",
      clicks: "clicks",
      compare: "Compare",
      apply: "Apply",
      downloadOn: "Download on the",
      appStore: "App Store",
      getItOn: "Get it on",
      googlePlay: "Google Play",
      earlyAccessOpen: "Early access open",
    },
    header: {
      accountMenuLabel: "Account menu",
      openMenuLabel: "Open menu",
      closeMenuLabel: "Close menu",
      savedOffers: "Saved offers",
      loggedInState: "Logged in",
    },
    explorePromo: {
      providerCoverageEyebrow: "Provider coverage",
      providerCoverageTitle: "Recognizable providers stay visible",
      providerCoverageDescription:
        "Payn keeps the marketplace grounded in institutions people already know so the filtering experience still feels credible while you compare.",
      mobileEyebrow: "Payn mobile",
      mobileTitle: "Take your shortlist with you on iPhone & Android",
      mobileDescription:
        "Your saved offers, compare picks, and search history sync to the mobile app the moment it ships. Join the waitlist with the same email you use here.",
      mobileBullets: [
        "Track saved offers across categories and countries",
        "Pick up where you left off after a provider click",
        "Receive updates when product terms change",
      ],
      mobileCta: "Join mobile waitlist",
    },
    waitlist: {
      heroTags: ["Real waitlist", "Platform choice", "No fake store links"],
      nextStepsEyebrow: "What happens next",
      nextSteps: [
        {
          title: "You choose the platform",
          text: "Use one form for iPhone, Android, or both instead of dead-end App Store or Google Play buttons.",
        },
        {
          title: "We keep the web experience live",
          text: "The website remains the primary product while the mobile release is prepared.",
        },
        {
          title: "You still control the next click",
          text: "Browse comparisons, review tradeoffs, and open provider sites only when the offer still fits.",
        },
      ],
      warningTitle: "Store pages are not live yet.",
      warningDescription:
        "That is why Payn now uses this waitlist route instead of pretend download buttons.",
      formEyebrow: "Mobile access",
      formTitle: "Register your interest",
      formDescription:
        "Choose the platform you care about and we will email you when the first Payn mobile release is ready.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      platformLabel: "Platform",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Both",
      },
      joining: "Joining waitlist...",
      joinBoth: "Join the mobile waitlist",
      joinPlatform: "Join {platform} waitlist",
      invalidEmail: "Enter a valid email address.",
      configuring: "Waitlist is being configured. Please email us directly for early access.",
      saveFailed: "Could not save your waitlist request. Please try again.",
      success: "You are on the waitlist. We will email you when mobile access opens.",
      alreadyOnWaitlist: "You are already on the waitlist for that platform.",
    },
    auth: {
      loginEyebrow: "Sign in",
      signupEyebrow: "Get started",
      loginTitle: "Welcome back",
      signupTitle: "Create your Payn account",
      loginDescription: "Access your dashboard, saved offers, and personalized recommendations.",
      signupDescription:
        "Set up your account to save offers, build your shortlist, and continue into your personal dashboard.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      loginPasswordPlaceholder: "Your password",
      signupPasswordPlaceholder: "Minimum 6 characters",
      signingIn: "Signing in...",
      creatingAccount: "Creating account...",
      signIn: "Sign in",
      createAccount: "Create account",
      panelLoginTitle: "Your Payn account",
      panelSignupTitle: "What you unlock",
      benefits: [
        "Saved offers across categories and countries",
        "A real dashboard with recommendations and trends",
        "Provider handoff tracking that improves your Payn score",
        "A clean path from signup into onboarding and dashboard",
      ],
      loginPrompt: "New to Payn?",
      signupPrompt: "Already have an account?",
      accountCreatedEyebrow: "Account created",
      confirmEmailTitle: "Confirm your email to continue",
      confirmEmailDescription:
        "We created your Payn account for {email}. Open the confirmation email, then sign in to continue to your dashboard.",
      goToSignIn: "Go to sign in",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "How will you use Payn?",
      onboardingDescription:
        "Choose the setup that best matches how you make financial decisions.",
      onboardingCompleteLabel: "Continue to dashboard",
      loading: "Loading your account",
      callbackError:
        "Payn could not complete sign-in from the email link. Please try signing in again.",
      notConfigured: "Authentication is not configured for this environment yet.",
      genericError: "Payn could not complete the request. Please try again.",
      invalidCredentials: "Incorrect email or password. Please try again.",
      alreadyRegistered: "This email is already registered. Try signing in instead.",
      weakPassword: "Password must be at least 6 characters.",
      emailNotConfirmed: "Confirm your email first, then sign in.",
      failedToFetch: "Payn could not reach the authentication service. Please try again in a moment.",
    },
    dashboard: {
      navGroups: {
        core: "Core",
        products: "Products",
        account: "Account",
      },
      navItems: {
        dashboard: { label: "Dashboard", description: "Overview and summary" },
        discover: { label: "Discover", description: "Search and compare offers" },
        loans: { label: "Loans", description: "Borrowing options" },
        cards: { label: "Cards", description: "Payment cards" },
        transfers: { label: "Transfers", description: "Money movement" },
        exchange: { label: "Exchange", description: "Currency conversion" },
        insurance: { label: "Insurance", description: "Protection products" },
        investments: { label: "Investments", description: "Platforms and assets" },
        profile: { label: "Settings", description: "Account and session" },
      },
      shellTag: "Product",
      shellTitle: "Financial control center",
      userTypeSuffix: "profile",
      loadingDashboard: "Loading dashboard",
      loadingWorkspace: "Loading your workspace",
      guestEyebrow: "Dashboard",
      guestTitle: "Sign in to access your Payn workspace",
      guestDescription:
        "Compare loans, cards, transfers, exchange, insurance, and investments in one place.",
      summaryEyebrow: "Summary",
      welcomeBack: "Welcome back",
      openExplore: "Discover offers",
      overviewRecommendedEyebrow: "Recommended",
      overviewRecommendedTitle: "Top products in your market",
      seeAll: "See all",
      categoriesEyebrow: "Categories",
      categoriesTitle: "Browse by category",
      savedEyebrow: "Saved",
      savedTitle: "Your shortlist",
      browseMore: "Browse more",
      noSavedTitle: "No saved offers yet",
      noSavedDescription: "Save products from Discover to build your shortlist.",
      trendingEyebrow: "Trending",
      trendingTitle: "Gaining attention",
      providersEyebrow: "Providers",
      providersTitle: "Providers in this category",
      categoryMatchesTitle: "Best matches for your profile",
      noCategoryTitle: "No offers available in this category",
      noCategoryDescription: "Check back soon.",
      stats: {
        paynScore: "Payn score",
        products: "Products",
        saved: "Saved",
        providers: "Providers",
        available: "Available",
      },
      accountEyebrow: "Account",
      accountTitle: "Your account",
      profileTypeEyebrow: "Profile type",
      profileTypeTitle: "How you use Payn",
      interestsEyebrow: "Interests",
      interestsTitle: "Categories you care about",
      useCasesEyebrow: "Use cases",
      useCasesTitle: "What you use financial products for",
      emailLabel: "Email",
      marketLabel: "Market",
      savePreferences: "Save preferences",
      savingPreferences: "Saving...",
      openProfile: "Settings",
    },
    homeMockup: {
      shortlistTitle: "Your shortlist",
      savedProductsLabel: "3 products saved",
      badges: ["Best for travel", "Lowest fees", "Best overall"],
      speeds: ["Same day", "Instant", "1-2 days"],
      compareAll: "Compare all 3",
      bestOption: "Best option found",
      readyToApply: "Wise Transfer - ready to apply",
    },
    userTypes: [
      {
        id: "personal",
        label: "Personal",
        description: "Track everyday borrowing, cards, transfers, and exchange for yourself.",
      },
      {
        id: "freelancer",
        label: "Freelancer",
        description: "Compare tools for irregular income, cross-border payments, and flexible banking.",
      },
      {
        id: "business",
        label: "Business",
        description: "Find products for team spending, company transfers, and business finance decisions.",
      },
    ],
    goalLabels: {
      travel: "travel",
      savings: "savings",
      crypto: "crypto",
      international_transfers: "international transfers",
      investing: "investing",
      insurance: "insurance",
      everyday_banking: "everyday banking",
    },
  },
  de: {
    common: {
      home: "Start",
      explore: "Entdecken",
      saved: "Gespeichert",
      profile: "Einstellungen",
      signOut: "Abmelden",
      saveOffer: "Angebot speichern",
      savedOffer: "Gespeichert",
      savingOffer: "Wird gespeichert...",
      review: "Prüfen",
      opening: "Wird geöffnet...",
      backToSite: "Zur Website",
      guest: "Gast",
      account: "Konto",
      notSignedIn: "Nicht angemeldet",
      edit: "Bearbeiten",
      months: "Monate",
      products: "Produkte",
      providers: "Anbieter",
      views: "Aufrufe",
      saves: "Speicherungen",
      clicks: "Klicks",
      compare: "Vergleichen",
      apply: "Weiter",
      downloadOn: "Laden im",
      appStore: "App Store",
      getItOn: "Jetzt auf",
      googlePlay: "Google Play",
      earlyAccessOpen: "Frühzugang offen",
    },
    header: {
      accountMenuLabel: "Kontomenü",
      openMenuLabel: "Menü öffnen",
      closeMenuLabel: "Menü schließen",
      savedOffers: "Gespeicherte Angebote",
      loggedInState: "Angemeldet",
    },
    explorePromo: {
      providerCoverageEyebrow: "Anbieterabdeckung",
      providerCoverageTitle: "Bekannte Anbieter bleiben sichtbar",
      providerCoverageDescription:
        "Payn hält den Marktplatz in vertrauten Finanzmarken verankert, damit sich das Filtern beim Vergleichen glaubwürdig anfühlt.",
      mobileEyebrow: "Payn Mobile",
      mobileTitle: "Nimm deine Shortlist mit aufs iPhone & Android",
      mobileDescription:
        "Deine gespeicherten Angebote, Vergleiche und Suchverläufe synchronisieren sich mit der mobilen App, sobald sie startet. Trag dich mit derselben E-Mail-Adresse ein, die du hier nutzt.",
      mobileBullets: [
        "Gespeicherte Angebote über Kategorien und Länder hinweg verfolgen",
        "Nach dem Klick zum Anbieter genau dort weitermachen",
        "Updates erhalten, wenn sich Produktbedingungen ändern",
      ],
      mobileCta: "Zur mobilen Warteliste",
    },
    waitlist: {
      heroTags: ["Echte Warteliste", "Plattformwahl", "Keine Fake-Store-Links"],
      nextStepsEyebrow: "Wie es weitergeht",
      nextSteps: [
        {
          title: "Du wählst die Plattform",
          text: "Nutze ein Formular für iPhone, Android oder beide statt leerer App-Store- oder Google-Play-Buttons.",
        },
        {
          title: "Die Web-Erfahrung bleibt live",
          text: "Die Website bleibt das Hauptprodukt, während die mobile Veröffentlichung vorbereitet wird.",
        },
        {
          title: "Du kontrollierst weiter den nächsten Klick",
          text: "Vergleiche weiter Angebote, prüfe Trade-offs und öffne Anbieterseiten nur, wenn das Produkt noch passt.",
        },
      ],
      warningTitle: "Store-Seiten sind noch nicht live.",
      warningDescription:
        "Darum nutzt Payn jetzt diese Wartelisten-Route statt vorgetäuschter Download-Buttons.",
      formEyebrow: "Mobiler Zugriff",
      formTitle: "Interesse registrieren",
      formDescription:
        "Wähle die Plattform, die dir wichtig ist, und wir schreiben dir, sobald die erste mobile Payn-Version bereit ist.",
      emailLabel: "E-Mail",
      emailPlaceholder: "du@example.com",
      platformLabel: "Plattform",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Beide",
      },
      joining: "Warteliste wird beigetreten...",
      joinBoth: "Zur mobilen Warteliste",
      joinPlatform: "{platform}-Warteliste beitreten",
      invalidEmail: "Gib eine gültige E-Mail-Adresse ein.",
      configuring: "Die Warteliste wird gerade eingerichtet. Bitte schreibe uns direkt für frühen Zugang.",
      saveFailed: "Deine Wartelisten-Anfrage konnte nicht gespeichert werden. Bitte versuche es erneut.",
      success: "Du stehst auf der Warteliste. Wir schreiben dir, sobald mobiler Zugang verfügbar ist.",
      alreadyOnWaitlist: "Du stehst für diese Plattform bereits auf der Warteliste.",
    },
    auth: {
      loginEyebrow: "Anmelden",
      signupEyebrow: "Loslegen",
      loginTitle: "Willkommen zurück",
      signupTitle: "Erstelle dein Payn-Konto",
      loginDescription: "Greife auf dein Dashboard, gespeicherte Angebote und personalisierte Empfehlungen zu.",
      signupDescription:
        "Erstelle dein Konto, um Angebote zu speichern, deine Shortlist aufzubauen und in dein persönliches Dashboard zu wechseln.",
      emailLabel: "E-Mail",
      emailPlaceholder: "du@example.com",
      passwordLabel: "Passwort",
      loginPasswordPlaceholder: "Dein Passwort",
      signupPasswordPlaceholder: "Mindestens 6 Zeichen",
      signingIn: "Anmeldung läuft...",
      creatingAccount: "Konto wird erstellt...",
      signIn: "Anmelden",
      createAccount: "Konto erstellen",
      panelLoginTitle: "Dein Payn-Konto",
      panelSignupTitle: "Was du freischaltest",
      benefits: [
        "Gespeicherte Angebote über Kategorien und Länder hinweg",
        "Ein echtes Dashboard mit Empfehlungen und Trends",
        "Anbieter-Weiterleitungen, die deinen Payn-Score verbessern",
        "Ein klarer Weg von der Registrierung ins Onboarding und Dashboard",
      ],
      loginPrompt: "Neu bei Payn?",
      signupPrompt: "Schon ein Konto?",
      accountCreatedEyebrow: "Konto erstellt",
      confirmEmailTitle: "Bestätige deine E-Mail, um fortzufahren",
      confirmEmailDescription:
        "Wir haben dein Payn-Konto für {email} erstellt. Öffne die Bestätigungs-Mail und melde dich dann an, um mit deinem Dashboard fortzufahren.",
      goToSignIn: "Zur Anmeldung",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "Wie nutzt du Payn?",
      onboardingDescription:
        "Wähle die Einrichtung, die am besten dazu passt, wie du Finanzentscheidungen triffst.",
      onboardingCompleteLabel: "Weiter zum Dashboard",
      loading: "Konto wird geladen",
      callbackError:
        "Payn konnte die Anmeldung über den E-Mail-Link nicht abschließen. Bitte versuche die Anmeldung erneut.",
      notConfigured: "Authentifizierung ist für diese Umgebung noch nicht eingerichtet.",
      genericError: "Payn konnte die Anfrage nicht abschließen. Bitte versuche es erneut.",
      invalidCredentials: "E-Mail oder Passwort sind nicht korrekt. Bitte versuche es erneut.",
      alreadyRegistered: "Diese E-Mail ist bereits registriert. Versuche stattdessen, dich anzumelden.",
      weakPassword: "Das Passwort muss mindestens 6 Zeichen lang sein.",
      emailNotConfirmed: "Bestätige zuerst deine E-Mail und melde dich dann an.",
      failedToFetch: "Payn konnte den Authentifizierungsdienst nicht erreichen. Bitte versuche es gleich noch einmal.",
    },
    dashboard: {
      navGroups: {
        core: "Kern",
        products: "Produkte",
        account: "Konto",
      },
      navItems: {
        dashboard: { label: "Dashboard", description: "Überblick und Zusammenfassung" },
        discover: { label: "Entdecken", description: "Angebote suchen und vergleichen" },
        loans: { label: "Kredite", description: "Finanzierungsoptionen" },
        cards: { label: "Karten", description: "Zahlungskarten" },
        transfers: { label: "Transfers", description: "Geld bewegen" },
        exchange: { label: "Wechsel", description: "Währungsumtausch" },
        insurance: { label: "Versicherung", description: "Schutzprodukte" },
        investments: { label: "Investments", description: "Plattformen und Anlageklassen" },
        profile: { label: "Einstellungen", description: "Konto und Sitzung" },
      },
      shellTag: "Produkt",
      shellTitle: "Finanz-Steuerzentrale",
      userTypeSuffix: "Profil",
      loadingDashboard: "Dashboard wird geladen",
      loadingWorkspace: "Dein Workspace wird geladen",
      guestEyebrow: "Dashboard",
      guestTitle: "Melde dich an, um deinen Payn-Workspace zu öffnen",
      guestDescription:
        "Vergleiche Kredite, Karten, Transfers, Wechsel, Versicherungen und Investments an einem Ort.",
      summaryEyebrow: "Übersicht",
      welcomeBack: "Willkommen zurück",
      openExplore: "Angebote entdecken",
      overviewRecommendedEyebrow: "Empfohlen",
      overviewRecommendedTitle: "Top-Produkte in deinem Markt",
      seeAll: "Alle ansehen",
      categoriesEyebrow: "Kategorien",
      categoriesTitle: "Nach Kategorie stöbern",
      savedEyebrow: "Gespeichert",
      savedTitle: "Deine Shortlist",
      browseMore: "Mehr entdecken",
      noSavedTitle: "Noch keine gespeicherten Angebote",
      noSavedDescription:
        "Speichere Produkte aus Entdecken, um deine Shortlist aufzubauen.",
      trendingEyebrow: "Trend",
      trendingTitle: "Gewinnt Aufmerksamkeit",
      providersEyebrow: "Anbieter",
      providersTitle: "Anbieter in dieser Kategorie",
      categoryMatchesTitle: "Beste Treffer für dein Profil",
      noCategoryTitle: "Keine Angebote in dieser Kategorie verfügbar",
      noCategoryDescription: "Schau bald wieder vorbei.",
      stats: {
        paynScore: "Payn-Score",
        products: "Produkte",
        saved: "Gespeichert",
        providers: "Anbieter",
        available: "Verfügbar",
      },
      accountEyebrow: "Konto",
      accountTitle: "Dein Konto",
      profileTypeEyebrow: "Profiltyp",
      profileTypeTitle: "Wie du Payn nutzt",
      interestsEyebrow: "Interessen",
      interestsTitle: "Kategorien, die dir wichtig sind",
      useCasesEyebrow: "Anwendungsfälle",
      useCasesTitle: "Wofür du Finanzprodukte nutzt",
      emailLabel: "E-Mail",
      marketLabel: "Markt",
      savePreferences: "Präferenzen speichern",
      savingPreferences: "Wird gespeichert...",
      openProfile: "Einstellungen",
    },
    homeMockup: {
      shortlistTitle: "Deine Shortlist",
      savedProductsLabel: "3 Produkte gespeichert",
      badges: ["Am besten für Reisen", "Niedrigste Gebühren", "Beste Gesamtwahl"],
      speeds: ["Gleicher Tag", "Sofort", "1-2 Tage"],
      compareAll: "Alle 3 vergleichen",
      bestOption: "Beste Option gefunden",
      readyToApply: "Wise Transfer - bereit zum Weitergehen",
    },
    userTypes: [
      {
        id: "personal",
        label: "Privat",
        description: "Behalte alltägliche Kredite, Karten, Transfers und Wechsel für dich selbst im Blick.",
      },
      {
        id: "freelancer",
        label: "Freelancer",
        description: "Vergleiche Tools für unregelmäßiges Einkommen, grenzüberschreitende Zahlungen und flexibles Banking.",
      },
      {
        id: "business",
        label: "Business",
        description: "Finde Produkte für Team-Ausgaben, Firmenüberweisungen und geschäftliche Finanzentscheidungen.",
      },
    ],
    goalLabels: {
      travel: "reisen",
      savings: "sparen",
      crypto: "krypto",
      international_transfers: "internationale transfers",
      investing: "investieren",
      insurance: "versicherung",
      everyday_banking: "alltagsbanking",
    },
  },
  es: {
    common: {
      home: "Inicio",
      explore: "Explorar",
      saved: "Guardado",
      profile: "Ajustes",
      signOut: "Cerrar sesión",
      saveOffer: "Guardar oferta",
      savedOffer: "Guardada",
      savingOffer: "Guardando...",
      review: "Revisar",
      opening: "Abriendo...",
      backToSite: "Volver al sitio",
      guest: "Invitado",
      account: "Cuenta",
      notSignedIn: "Sin iniciar sesión",
      edit: "Editar",
      months: "meses",
      products: "productos",
      providers: "proveedores",
      views: "vistas",
      saves: "guardados",
      clicks: "clics",
      compare: "Comparar",
      apply: "Continuar",
      downloadOn: "Descargar en",
      appStore: "App Store",
      getItOn: "Disponible en",
      googlePlay: "Google Play",
      earlyAccessOpen: "Acceso anticipado abierto",
    },
    header: {
      accountMenuLabel: "Menú de cuenta",
      openMenuLabel: "Abrir menú",
      closeMenuLabel: "Cerrar menú",
      savedOffers: "Ofertas guardadas",
      loggedInState: "Con sesión iniciada",
    },
    explorePromo: {
      providerCoverageEyebrow: "Cobertura de proveedores",
      providerCoverageTitle: "Los proveedores reconocibles siguen visibles",
      providerCoverageDescription:
        "Payn mantiene el marketplace apoyado en instituciones que la gente ya conoce para que el filtrado siga siendo creíble mientras comparas.",
      mobileEyebrow: "Payn móvil",
      mobileTitle: "Lleva tu shortlist al iPhone y Android",
      mobileDescription:
        "Tus ofertas guardadas, comparativas y búsquedas se sincronizarán con la app móvil cuando se lance. Apúntate con el mismo email que usas aquí.",
      mobileBullets: [
        "Seguir ofertas guardadas entre categorías y países",
        "Retomar donde lo dejaste después de ir al proveedor",
        "Recibir avisos cuando cambien las condiciones del producto",
      ],
      mobileCta: "Unirse a la lista de espera móvil",
    },
    waitlist: {
      heroTags: ["Lista de espera real", "Elección de plataforma", "Sin botones falsos de tiendas"],
      nextStepsEyebrow: "Qué pasa después",
      nextSteps: [
        {
          title: "Tú eliges la plataforma",
          text: "Usa un solo formulario para iPhone, Android o ambos en lugar de botones vacíos de App Store o Google Play.",
        },
        {
          title: "La experiencia web sigue activa",
          text: "La web sigue siendo el producto principal mientras se prepara el lanzamiento móvil.",
        },
        {
          title: "Sigues controlando el siguiente clic",
          text: "Sigue comparando, revisa concesiones y abre sitios de proveedores solo cuando la oferta siga encajando.",
        },
      ],
      warningTitle: "Las páginas de las tiendas aún no están activas.",
      warningDescription:
        "Por eso Payn usa ahora esta ruta de lista de espera en lugar de botones de descarga fingidos.",
      formEyebrow: "Acceso móvil",
      formTitle: "Registra tu interés",
      formDescription:
        "Elige la plataforma que te importa y te escribiremos cuando la primera versión móvil de Payn esté lista.",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@ejemplo.com",
      platformLabel: "Plataforma",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Ambas",
      },
      joining: "Uniéndote a la lista...",
      joinBoth: "Unirse a la lista de espera móvil",
      joinPlatform: "Unirse a la lista de {platform}",
      invalidEmail: "Introduce un correo electrónico válido.",
      configuring: "La lista de espera se está configurando. Escríbenos directamente para acceso anticipado.",
      saveFailed: "No se pudo guardar tu solicitud. Inténtalo de nuevo.",
      success: "Ya estás en la lista de espera. Te escribiremos cuando se abra el acceso móvil.",
      alreadyOnWaitlist: "Ya estás en la lista de espera para esa plataforma.",
    },
    auth: {
      loginEyebrow: "Iniciar sesión",
      signupEyebrow: "Empezar",
      loginTitle: "Bienvenido de nuevo",
      signupTitle: "Crea tu cuenta Payn",
      loginDescription: "Accede a tu dashboard, ofertas guardadas y recomendaciones personalizadas.",
      signupDescription:
        "Crea tu cuenta para guardar ofertas, construir tu shortlist y continuar en tu dashboard personal.",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@ejemplo.com",
      passwordLabel: "Contraseña",
      loginPasswordPlaceholder: "Tu contraseña",
      signupPasswordPlaceholder: "Mínimo 6 caracteres",
      signingIn: "Iniciando sesión...",
      creatingAccount: "Creando cuenta...",
      signIn: "Iniciar sesión",
      createAccount: "Crear cuenta",
      panelLoginTitle: "Tu cuenta Payn",
      panelSignupTitle: "Lo que desbloqueas",
      benefits: [
        "Ofertas guardadas entre categorías y países",
        "Un dashboard real con recomendaciones y tendencias",
        "Seguimiento de clics al proveedor que mejora tu puntuación Payn",
        "Un camino claro desde el registro al onboarding y al dashboard",
      ],
      loginPrompt: "¿Nuevo en Payn?",
      signupPrompt: "¿Ya tienes cuenta?",
      accountCreatedEyebrow: "Cuenta creada",
      confirmEmailTitle: "Confirma tu correo para continuar",
      confirmEmailDescription:
        "Hemos creado tu cuenta Payn para {email}. Abre el correo de confirmación y luego inicia sesión para continuar con tu dashboard.",
      goToSignIn: "Ir a iniciar sesión",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "¿Cómo usarás Payn?",
      onboardingDescription:
        "Elige la configuración que mejor encaje con cómo tomas decisiones financieras.",
      onboardingCompleteLabel: "Continuar al dashboard",
      loading: "Cargando tu cuenta",
      callbackError:
        "Payn no pudo completar el inicio de sesión desde el enlace del correo. Inténtalo de nuevo.",
      notConfigured: "La autenticación aún no está configurada para este entorno.",
      genericError: "Payn no pudo completar la solicitud. Inténtalo de nuevo.",
      invalidCredentials: "Correo o contraseña incorrectos. Inténtalo de nuevo.",
      alreadyRegistered: "Este correo ya está registrado. Prueba a iniciar sesión.",
      weakPassword: "La contraseña debe tener al menos 6 caracteres.",
      emailNotConfirmed: "Confirma primero tu correo y luego inicia sesión.",
      failedToFetch: "Payn no pudo contactar con el servicio de autenticación. Vuelve a intentarlo en un momento.",
    },
    dashboard: {
      navGroups: {
        core: "Principal",
        products: "Productos",
        account: "Cuenta",
      },
      navItems: {
        dashboard: { label: "Panel", description: "Resumen general" },
        discover: { label: "Descubrir", description: "Buscar y comparar ofertas" },
        loans: { label: "Préstamos", description: "Opciones de financiación" },
        cards: { label: "Tarjetas", description: "Tarjetas de pago" },
        transfers: { label: "Transferencias", description: "Movimiento de dinero" },
        exchange: { label: "Cambio", description: "Conversión de divisas" },
        insurance: { label: "Seguros", description: "Productos de protección" },
        investments: { label: "Inversiones", description: "Plataformas y activos" },
        profile: { label: "Ajustes", description: "Cuenta y sesión" },
      },
      shellTag: "Producto",
      shellTitle: "Centro de control financiero",
      userTypeSuffix: "perfil",
      loadingDashboard: "Cargando panel",
      loadingWorkspace: "Cargando tu espacio",
      guestEyebrow: "Panel",
      guestTitle: "Inicia sesión para abrir tu espacio Payn",
      guestDescription:
        "Compara préstamos, tarjetas, transferencias, cambio, seguros e inversiones en un solo lugar.",
      summaryEyebrow: "Resumen",
      welcomeBack: "Bienvenido de nuevo",
      openExplore: "Explorar ofertas",
      overviewRecommendedEyebrow: "Recomendado",
      overviewRecommendedTitle: "Productos destacados en tu mercado",
      seeAll: "Ver todo",
      categoriesEyebrow: "Categorías",
      categoriesTitle: "Explorar por categoría",
      savedEyebrow: "Guardado",
      savedTitle: "Tu shortlist",
      browseMore: "Ver más",
      noSavedTitle: "Aún no hay ofertas guardadas",
      noSavedDescription: "Guarda productos desde Explorar para construir tu shortlist.",
      trendingEyebrow: "Tendencia",
      trendingTitle: "Ganando atención",
      providersEyebrow: "Proveedores",
      providersTitle: "Proveedores de esta categoría",
      categoryMatchesTitle: "Mejores opciones para tu perfil",
      noCategoryTitle: "No hay ofertas disponibles en esta categoría",
      noCategoryDescription: "Vuelve a comprobarlo pronto.",
      stats: {
        paynScore: "Puntuación Payn",
        products: "Productos",
        saved: "Guardado",
        providers: "Proveedores",
        available: "Disponibles",
      },
      accountEyebrow: "Cuenta",
      accountTitle: "Tu cuenta",
      profileTypeEyebrow: "Tipo de perfil",
      profileTypeTitle: "Cómo usas Payn",
      interestsEyebrow: "Intereses",
      interestsTitle: "Categorías que te importan",
      useCasesEyebrow: "Casos de uso",
      useCasesTitle: "Para qué usas los productos financieros",
      emailLabel: "Correo electrónico",
      marketLabel: "Mercado",
      savePreferences: "Guardar preferencias",
      savingPreferences: "Guardando...",
      openProfile: "Ajustes",
    },
    homeMockup: {
      shortlistTitle: "Tu shortlist",
      savedProductsLabel: "3 productos guardados",
      badges: ["Mejor para viajar", "Menores comisiones", "Mejor opción general"],
      speeds: ["Mismo día", "Instantáneo", "1-2 días"],
      compareAll: "Comparar los 3",
      bestOption: "Mejor opción encontrada",
      readyToApply: "Wise Transfer - listo para continuar",
    },
    userTypes: [
      {
        id: "personal",
        label: "Personal",
        description: "Sigue préstamos, tarjetas, transferencias y cambio para tu día a día.",
      },
      {
        id: "freelancer",
        label: "Freelancer",
        description: "Compara herramientas para ingresos irregulares, pagos internacionales y banca flexible.",
      },
      {
        id: "business",
        label: "Empresa",
        description: "Encuentra productos para gasto de equipo, transferencias de empresa y decisiones financieras del negocio.",
      },
    ],
    goalLabels: {
      travel: "viajes",
      savings: "ahorro",
      crypto: "cripto",
      international_transfers: "transferencias internacionales",
      investing: "inversión",
      insurance: "seguros",
      everyday_banking: "banca diaria",
    },
  },
  fr: {
    common: {
      home: "Accueil",
      explore: "Explorer",
      saved: "Sauvegardé",
      profile: "Paramètres",
      signOut: "Se déconnecter",
      saveOffer: "Enregistrer l'offre",
      savedOffer: "Enregistrée",
      savingOffer: "Enregistrement...",
      review: "Voir",
      opening: "Ouverture...",
      backToSite: "Retour au site",
      guest: "Invité",
      account: "Compte",
      notSignedIn: "Non connecté",
      edit: "Modifier",
      months: "mois",
      products: "produits",
      providers: "fournisseurs",
      views: "vues",
      saves: "sauvegardes",
      clicks: "clics",
      compare: "Comparer",
      apply: "Continuer",
      downloadOn: "Télécharger sur",
      appStore: "App Store",
      getItOn: "Disponible sur",
      googlePlay: "Google Play",
      earlyAccessOpen: "Accès anticipé ouvert",
    },
    header: {
      accountMenuLabel: "Menu du compte",
      openMenuLabel: "Ouvrir le menu",
      closeMenuLabel: "Fermer le menu",
      savedOffers: "Offres sauvegardées",
      loggedInState: "Connecté",
    },
    explorePromo: {
      providerCoverageEyebrow: "Couverture fournisseurs",
      providerCoverageTitle: "Les fournisseurs reconnus restent visibles",
      providerCoverageDescription:
        "Payn garde le marketplace ancré dans des institutions connues pour que l'expérience de filtrage reste crédible pendant la comparaison.",
      mobileEyebrow: "Payn mobile",
      mobileTitle: "Emportez votre shortlist sur iPhone et Android",
      mobileDescription:
        "Vos offres sauvegardées, comparaisons et recherches se synchroniseront avec l'application mobile à son lancement. Inscrivez-vous avec le même e-mail que vous utilisez ici.",
      mobileBullets: [
        "Suivre les offres sauvegardées entre catégories et pays",
        "Reprendre là où vous vous êtes arrêté après un clic vers un fournisseur",
        "Recevoir des alertes quand les conditions changent",
      ],
      mobileCta: "Rejoindre la liste d'attente mobile",
    },
    waitlist: {
      heroTags: ["Vraie liste d'attente", "Choix de plateforme", "Pas de faux liens store"],
      nextStepsEyebrow: "Et ensuite",
      nextSteps: [
        {
          title: "Vous choisissez la plateforme",
          text: "Un seul formulaire pour iPhone, Android ou les deux au lieu de boutons App Store ou Google Play sans issue.",
        },
        {
          title: "L'expérience web reste active",
          text: "Le site reste le produit principal pendant la préparation de la sortie mobile.",
        },
        {
          title: "Vous gardez le contrôle du clic suivant",
          text: "Continuez à comparer, à lire les compromis et à ouvrir les sites des fournisseurs seulement quand l'offre convient encore.",
        },
      ],
      warningTitle: "Les pages des stores ne sont pas encore en ligne.",
      warningDescription:
        "C'est pourquoi Payn utilise maintenant cette route de liste d'attente au lieu de faux boutons de téléchargement.",
      formEyebrow: "Accès mobile",
      formTitle: "Enregistrez votre intérêt",
      formDescription:
        "Choisissez la plateforme qui vous intéresse et nous vous écrirons quand la première version mobile de Payn sera prête.",
      emailLabel: "E-mail",
      emailPlaceholder: "vous@exemple.com",
      platformLabel: "Plateforme",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Les deux",
      },
      joining: "Inscription en cours...",
      joinBoth: "Rejoindre la liste d'attente mobile",
      joinPlatform: "Rejoindre la liste d'attente {platform}",
      invalidEmail: "Entrez une adresse e-mail valide.",
      configuring: "La liste d'attente est en cours de configuration. Écrivez-nous directement pour un accès anticipé.",
      saveFailed: "Impossible d'enregistrer votre demande pour le moment. Réessayez.",
      success: "Vous êtes sur la liste d'attente. Nous vous écrirons quand l'accès mobile ouvrira.",
      alreadyOnWaitlist: "Vous êtes déjà sur la liste d'attente pour cette plateforme.",
    },
    auth: {
      loginEyebrow: "Connexion",
      signupEyebrow: "Commencer",
      loginTitle: "Bon retour",
      signupTitle: "Créez votre compte Payn",
      loginDescription: "Accédez à votre tableau de bord, vos offres sauvegardées et vos recommandations personnalisées.",
      signupDescription:
        "Créez votre compte pour sauvegarder des offres, constituer votre shortlist et poursuivre dans votre tableau de bord personnel.",
      emailLabel: "E-mail",
      emailPlaceholder: "vous@exemple.com",
      passwordLabel: "Mot de passe",
      loginPasswordPlaceholder: "Votre mot de passe",
      signupPasswordPlaceholder: "Au moins 6 caractères",
      signingIn: "Connexion...",
      creatingAccount: "Création du compte...",
      signIn: "Se connecter",
      createAccount: "Créer un compte",
      panelLoginTitle: "Votre compte Payn",
      panelSignupTitle: "Ce que vous débloquez",
      benefits: [
        "Offres sauvegardées entre catégories et pays",
        "Un vrai tableau de bord avec recommandations et tendances",
        "Un suivi des clics fournisseurs qui améliore votre score Payn",
        "Un chemin clair de l'inscription vers l'onboarding puis le tableau de bord",
      ],
      loginPrompt: "Nouveau sur Payn ?",
      signupPrompt: "Vous avez déjà un compte ?",
      accountCreatedEyebrow: "Compte créé",
      confirmEmailTitle: "Confirmez votre e-mail pour continuer",
      confirmEmailDescription:
        "Nous avons créé votre compte Payn pour {email}. Ouvrez l'e-mail de confirmation puis connectez-vous pour continuer vers votre tableau de bord.",
      goToSignIn: "Aller à la connexion",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "Comment allez-vous utiliser Payn ?",
      onboardingDescription:
        "Choisissez la configuration qui correspond le mieux à votre façon de prendre des décisions financières.",
      onboardingCompleteLabel: "Continuer vers le tableau de bord",
      loading: "Chargement de votre compte",
      callbackError:
        "Payn n'a pas pu terminer la connexion depuis le lien e-mail. Réessayez.",
      notConfigured: "L'authentification n'est pas encore configurée pour cet environnement.",
      genericError: "Payn n'a pas pu terminer la demande. Réessayez.",
      invalidCredentials: "E-mail ou mot de passe incorrect. Réessayez.",
      alreadyRegistered: "Cet e-mail est déjà enregistré. Essayez de vous connecter.",
      weakPassword: "Le mot de passe doit contenir au moins 6 caractères.",
      emailNotConfirmed: "Confirmez d'abord votre e-mail, puis connectez-vous.",
      failedToFetch: "Payn n'a pas pu joindre le service d'authentification. Réessayez dans un instant.",
    },
    dashboard: {
      navGroups: {
        core: "Essentiel",
        products: "Produits",
        account: "Compte",
      },
      navItems: {
        dashboard: { label: "Tableau de bord", description: "Vue d'ensemble et résumé" },
        discover: { label: "Découvrir", description: "Rechercher et comparer les offres" },
        loans: { label: "Prêts", description: "Options d'emprunt" },
        cards: { label: "Cartes", description: "Cartes de paiement" },
        transfers: { label: "Transferts", description: "Mouvement d'argent" },
        exchange: { label: "Change", description: "Conversion de devises" },
        insurance: { label: "Assurance", description: "Produits de protection" },
        investments: { label: "Investissements", description: "Plateformes et actifs" },
        profile: { label: "Paramètres", description: "Compte et session" },
      },
      shellTag: "Produit",
      shellTitle: "Centre de contrôle financier",
      userTypeSuffix: "profil",
      loadingDashboard: "Chargement du tableau de bord",
      loadingWorkspace: "Chargement de votre espace",
      guestEyebrow: "Tableau de bord",
      guestTitle: "Connectez-vous pour ouvrir votre espace Payn",
      guestDescription:
        "Comparez prêts, cartes, transferts, change, assurance et investissements au même endroit.",
      summaryEyebrow: "Résumé",
      welcomeBack: "Bon retour",
      openExplore: "Explorer les offres",
      overviewRecommendedEyebrow: "Recommandé",
      overviewRecommendedTitle: "Produits les mieux placés sur votre marché",
      seeAll: "Voir tout",
      categoriesEyebrow: "Catégories",
      categoriesTitle: "Parcourir par catégorie",
      savedEyebrow: "Sauvegardé",
      savedTitle: "Votre shortlist",
      browseMore: "Voir plus",
      noSavedTitle: "Aucune offre sauvegardée pour le moment",
      noSavedDescription:
        "Sauvegardez des produits depuis Explorer pour constituer votre shortlist.",
      trendingEyebrow: "Tendance",
      trendingTitle: "En train de gagner de l'attention",
      providersEyebrow: "Fournisseurs",
      providersTitle: "Fournisseurs de cette catégorie",
      categoryMatchesTitle: "Meilleures correspondances pour votre profil",
      noCategoryTitle: "Aucune offre disponible dans cette catégorie",
      noCategoryDescription: "Revenez bientôt.",
      stats: {
        paynScore: "Score Payn",
        products: "Produits",
        saved: "Sauvegardé",
        providers: "Fournisseurs",
        available: "Disponibles",
      },
      accountEyebrow: "Compte",
      accountTitle: "Votre compte",
      profileTypeEyebrow: "Type de profil",
      profileTypeTitle: "Comment vous utilisez Payn",
      interestsEyebrow: "Intérêts",
      interestsTitle: "Catégories qui vous importent",
      useCasesEyebrow: "Cas d'usage",
      useCasesTitle: "À quoi servent vos produits financiers",
      emailLabel: "E-mail",
      marketLabel: "Marché",
      savePreferences: "Enregistrer les préférences",
      savingPreferences: "Enregistrement...",
      openProfile: "Paramètres",
    },
    homeMockup: {
      shortlistTitle: "Votre shortlist",
      savedProductsLabel: "3 produits sauvegardés",
      badges: ["Idéal voyage", "Frais les plus bas", "Meilleure option"],
      speeds: ["Même jour", "Instantané", "1-2 jours"],
      compareAll: "Comparer les 3",
      bestOption: "Meilleure option trouvée",
      readyToApply: "Wise Transfer - prêt à continuer",
    },
    userTypes: [
      {
        id: "personal",
        label: "Personnel",
        description: "Suivez prêts, cartes, transferts et change pour vos besoins quotidiens.",
      },
      {
        id: "freelancer",
        label: "Freelance",
        description: "Comparez des outils pour revenus irréguliers, paiements transfrontaliers et banque flexible.",
      },
      {
        id: "business",
        label: "Entreprise",
        description: "Trouvez des produits pour les dépenses d'équipe, les transferts d'entreprise et les décisions financières de société.",
      },
    ],
    goalLabels: {
      travel: "voyage",
      savings: "épargne",
      crypto: "crypto",
      international_transfers: "transferts internationaux",
      investing: "investissement",
      insurance: "assurance",
      everyday_banking: "banque du quotidien",
    },
  },
  it: {
    common: {
      home: "Home",
      explore: "Esplora",
      saved: "Salvati",
      profile: "Impostazioni",
      signOut: "Esci",
      saveOffer: "Salva offerta",
      savedOffer: "Salvata",
      savingOffer: "Salvataggio...",
      review: "Esamina",
      opening: "Apertura...",
      backToSite: "Torna al sito",
      guest: "Ospite",
      account: "Account",
      notSignedIn: "Non connesso",
      edit: "Modifica",
      months: "mesi",
      products: "prodotti",
      providers: "provider",
      views: "visualizzazioni",
      saves: "salvataggi",
      clicks: "clic",
      compare: "Confronta",
      apply: "Continua",
      downloadOn: "Scarica su",
      appStore: "App Store",
      getItOn: "Disponibile su",
      googlePlay: "Google Play",
      earlyAccessOpen: "Accesso anticipato aperto",
    },
    header: {
      accountMenuLabel: "Menu account",
      openMenuLabel: "Apri menu",
      closeMenuLabel: "Chiudi menu",
      savedOffers: "Offerte salvate",
      loggedInState: "Connesso",
    },
    explorePromo: {
      providerCoverageEyebrow: "Copertura provider",
      providerCoverageTitle: "I provider riconoscibili restano visibili",
      providerCoverageDescription:
        "Payn mantiene il marketplace ancorato a istituzioni già note, così l'esperienza di filtro resta credibile mentre confronti.",
      mobileEyebrow: "Payn mobile",
      mobileTitle: "Porta la tua shortlist su iPhone & Android",
      mobileDescription:
        "Le tue offerte salvate, confronti e ricerche si sincronizzeranno con l'app mobile al lancio. Iscriviti con la stessa email che usi qui.",
      mobileBullets: [
        "Seguire le offerte salvate tra categorie e paesi",
        "Riprendere da dove hai lasciato dopo il click verso un provider",
        "Ricevere aggiornamenti quando cambiano le condizioni del prodotto",
      ],
      mobileCta: "Unisciti alla lista d'attesa mobile",
    },
    waitlist: {
      heroTags: ["Lista d'attesa reale", "Scelta piattaforma", "Nessun falso link agli store"],
      nextStepsEyebrow: "Cosa succede dopo",
      nextSteps: [
        {
          title: "Scegli tu la piattaforma",
          text: "Usa un solo modulo per iPhone, Android o entrambi invece di pulsanti App Store o Google Play finti.",
        },
        {
          title: "L'esperienza web resta attiva",
          text: "Il sito resta il prodotto principale mentre il rilascio mobile viene preparato.",
        },
        {
          title: "Continui a controllare il prossimo clic",
          text: "Continua a confrontare, a leggere i trade-off e ad aprire i siti dei provider solo quando l'offerta ha ancora senso.",
        },
      ],
      warningTitle: "Le pagine degli store non sono ancora live.",
      warningDescription:
        "Per questo Payn ora usa questa rotta di lista d'attesa invece di pulsanti di download finti.",
      formEyebrow: "Accesso mobile",
      formTitle: "Registra il tuo interesse",
      formDescription:
        "Scegli la piattaforma che ti interessa e ti scriveremo quando la prima release mobile di Payn sarà pronta.",
      emailLabel: "Email",
      emailPlaceholder: "tu@esempio.com",
      platformLabel: "Piattaforma",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Entrambe",
      },
      joining: "Iscrizione in corso...",
      joinBoth: "Unisciti alla lista d'attesa mobile",
      joinPlatform: "Unisciti alla lista d'attesa {platform}",
      invalidEmail: "Inserisci un indirizzo email valido.",
      configuring: "La lista d'attesa è in configurazione. Scrivici direttamente per l'accesso anticipato.",
      saveFailed: "Non è stato possibile salvare la richiesta. Riprova.",
      success: "Sei nella lista d'attesa. Ti scriveremo quando l'accesso mobile sarà disponibile.",
      alreadyOnWaitlist: "Sei già nella lista d'attesa per questa piattaforma.",
    },
    auth: {
      loginEyebrow: "Accedi",
      signupEyebrow: "Inizia",
      loginTitle: "Bentornato",
      signupTitle: "Crea il tuo account Payn",
      loginDescription: "Accedi al tuo dashboard, alle offerte salvate e alle raccomandazioni personalizzate.",
      signupDescription:
        "Crea il tuo account per salvare offerte, costruire la tua shortlist e continuare nel tuo dashboard personale.",
      emailLabel: "Email",
      emailPlaceholder: "tu@esempio.com",
      passwordLabel: "Password",
      loginPasswordPlaceholder: "La tua password",
      signupPasswordPlaceholder: "Almeno 6 caratteri",
      signingIn: "Accesso in corso...",
      creatingAccount: "Creazione account...",
      signIn: "Accedi",
      createAccount: "Crea account",
      panelLoginTitle: "Il tuo account Payn",
      panelSignupTitle: "Cosa sblocchi",
      benefits: [
        "Offerte salvate tra categorie e paesi",
        "Un vero dashboard con raccomandazioni e trend",
        "Tracciamento dei click verso i provider che migliora il tuo punteggio Payn",
        "Un percorso pulito dalla registrazione all'onboarding e al dashboard",
      ],
      loginPrompt: "Nuovo su Payn?",
      signupPrompt: "Hai già un account?",
      accountCreatedEyebrow: "Account creato",
      confirmEmailTitle: "Conferma la tua email per continuare",
      confirmEmailDescription:
        "Abbiamo creato il tuo account Payn per {email}. Apri l'email di conferma, poi accedi per continuare verso il tuo dashboard.",
      goToSignIn: "Vai al login",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "Come userai Payn?",
      onboardingDescription:
        "Scegli la configurazione che corrisponde meglio a come prendi decisioni finanziarie.",
      onboardingCompleteLabel: "Continua al dashboard",
      loading: "Caricamento account",
      callbackError:
        "Payn non è riuscito a completare l'accesso dal link email. Riprova ad accedere.",
      notConfigured: "L'autenticazione non è ancora configurata per questo ambiente.",
      genericError: "Payn non è riuscito a completare la richiesta. Riprova.",
      invalidCredentials: "Email o password non corretti. Riprova.",
      alreadyRegistered: "Questa email è già registrata. Prova ad accedere.",
      weakPassword: "La password deve contenere almeno 6 caratteri.",
      emailNotConfirmed: "Conferma prima la tua email, poi accedi.",
      failedToFetch: "Payn non è riuscito a raggiungere il servizio di autenticazione. Riprova tra un momento.",
    },
    dashboard: {
      navGroups: {
        core: "Principale",
        products: "Prodotti",
        account: "Account",
      },
      navItems: {
        dashboard: { label: "Dashboard", description: "Panoramica e riepilogo" },
        discover: { label: "Scopri", description: "Cerca e confronta le offerte" },
        loans: { label: "Prestiti", description: "Opzioni di finanziamento" },
        cards: { label: "Carte", description: "Carte di pagamento" },
        transfers: { label: "Trasferimenti", description: "Movimento di denaro" },
        exchange: { label: "Cambio", description: "Conversione valuta" },
        insurance: { label: "Assicurazioni", description: "Prodotti di protezione" },
        investments: { label: "Investimenti", description: "Piattaforme e asset" },
        profile: { label: "Impostazioni", description: "Account e sessione" },
      },
      shellTag: "Prodotto",
      shellTitle: "Centro di controllo finanziario",
      userTypeSuffix: "profilo",
      loadingDashboard: "Caricamento dashboard",
      loadingWorkspace: "Caricamento spazio",
      guestEyebrow: "Dashboard",
      guestTitle: "Accedi per aprire il tuo spazio Payn",
      guestDescription:
        "Confronta prestiti, carte, trasferimenti, cambio, assicurazioni e investimenti in un unico posto.",
      summaryEyebrow: "Riepilogo",
      welcomeBack: "Bentornato",
      openExplore: "Esplora offerte",
      overviewRecommendedEyebrow: "Consigliati",
      overviewRecommendedTitle: "Top prodotti nel tuo mercato",
      seeAll: "Vedi tutto",
      categoriesEyebrow: "Categorie",
      categoriesTitle: "Esplora per categoria",
      savedEyebrow: "Salvati",
      savedTitle: "La tua shortlist",
      browseMore: "Scopri di più",
      noSavedTitle: "Nessuna offerta salvata per ora",
      noSavedDescription: "Salva prodotti da Esplora per costruire la tua shortlist.",
      trendingEyebrow: "Trend",
      trendingTitle: "Sta attirando attenzione",
      providersEyebrow: "Provider",
      providersTitle: "Provider di questa categoria",
      categoryMatchesTitle: "Migliori match per il tuo profilo",
      noCategoryTitle: "Nessuna offerta disponibile in questa categoria",
      noCategoryDescription: "Torna a controllare presto.",
      stats: {
        paynScore: "Punteggio Payn",
        products: "Prodotti",
        saved: "Salvati",
        providers: "Provider",
        available: "Disponibili",
      },
      accountEyebrow: "Account",
      accountTitle: "Il tuo account",
      profileTypeEyebrow: "Tipo di profilo",
      profileTypeTitle: "Come usi Payn",
      interestsEyebrow: "Interessi",
      interestsTitle: "Categorie che ti interessano",
      useCasesEyebrow: "Casi d'uso",
      useCasesTitle: "Per cosa usi i prodotti finanziari",
      emailLabel: "Email",
      marketLabel: "Mercato",
      savePreferences: "Salva preferenze",
      savingPreferences: "Salvataggio...",
      openProfile: "Impostazioni",
    },
    homeMockup: {
      shortlistTitle: "La tua shortlist",
      savedProductsLabel: "3 prodotti salvati",
      badges: ["Ideale per viaggi", "Commissioni più basse", "Migliore in assoluto"],
      speeds: ["In giornata", "Istantaneo", "1-2 giorni"],
      compareAll: "Confronta tutti e 3",
      bestOption: "Migliore opzione trovata",
      readyToApply: "Wise Transfer - pronto per continuare",
    },
    userTypes: [
      {
        id: "personal",
        label: "Personale",
        description: "Segui prestiti, carte, trasferimenti e cambio per le tue esigenze quotidiane.",
      },
      {
        id: "freelancer",
        label: "Freelance",
        description: "Confronta strumenti per reddito variabile, pagamenti internazionali e banking flessibile.",
      },
      {
        id: "business",
        label: "Business",
        description: "Trova prodotti per spese del team, trasferimenti aziendali e decisioni finanziarie dell'impresa.",
      },
    ],
    goalLabels: {
      travel: "viaggi",
      savings: "risparmio",
      crypto: "crypto",
      international_transfers: "trasferimenti internazionali",
      investing: "investimenti",
      insurance: "assicurazioni",
      everyday_banking: "banking quotidiano",
    },
  },
  pt: {
    common: {
      home: "Início",
      explore: "Explorar",
      saved: "Guardado",
      profile: "Definições",
      signOut: "Terminar sessão",
      saveOffer: "Guardar oferta",
      savedOffer: "Guardada",
      savingOffer: "A guardar...",
      review: "Rever",
      opening: "A abrir...",
      backToSite: "Voltar ao site",
      guest: "Convidado",
      account: "Conta",
      notSignedIn: "Sem sessão iniciada",
      edit: "Editar",
      months: "meses",
      products: "produtos",
      providers: "fornecedores",
      views: "visualizações",
      saves: "guardados",
      clicks: "cliques",
      compare: "Comparar",
      apply: "Continuar",
      downloadOn: "Descarregar na",
      appStore: "App Store",
      getItOn: "Disponível no",
      googlePlay: "Google Play",
      earlyAccessOpen: "Acesso antecipado aberto",
    },
    header: {
      accountMenuLabel: "Menu da conta",
      openMenuLabel: "Abrir menu",
      closeMenuLabel: "Fechar menu",
      savedOffers: "Ofertas guardadas",
      loggedInState: "Sessão iniciada",
    },
    explorePromo: {
      providerCoverageEyebrow: "Cobertura de fornecedores",
      providerCoverageTitle: "Os fornecedores reconhecíveis continuam visíveis",
      providerCoverageDescription:
        "A Payn mantém o marketplace assente em instituições que as pessoas já conhecem para que a experiência de filtragem continue credível enquanto compara.",
      mobileEyebrow: "Payn mobile",
      mobileTitle: "Leve a shortlist para o iPhone & Android",
      mobileDescription:
        "As suas ofertas guardadas, comparações e pesquisas vão sincronizar-se com a app móvel quando esta for lançada. Inscreva-se com o mesmo email que usa aqui.",
      mobileBullets: [
        "Acompanhar ofertas guardadas entre categorias e países",
        "Retomar onde ficou depois do clique para o fornecedor",
        "Receber atualizações quando os termos do produto mudarem",
      ],
      mobileCta: "Entrar na lista de espera móvel",
    },
    waitlist: {
      heroTags: ["Lista de espera real", "Escolha de plataforma", "Sem botões falsos de loja"],
      nextStepsEyebrow: "O que acontece a seguir",
      nextSteps: [
        {
          title: "Escolhe a plataforma",
          text: "Use um só formulário para iPhone, Android ou ambos em vez de botões vazios da App Store ou Google Play.",
        },
        {
          title: "A experiência web continua ativa",
          text: "O site continua a ser o produto principal enquanto o lançamento móvel é preparado.",
        },
        {
          title: "Continua a controlar o próximo clique",
          text: "Continue a comparar, a rever trade-offs e a abrir sites de fornecedores apenas quando a oferta ainda fizer sentido.",
        },
      ],
      warningTitle: "As páginas das lojas ainda não estão ativas.",
      warningDescription:
        "É por isso que a Payn usa agora esta rota de lista de espera em vez de botões de download fingidos.",
      formEyebrow: "Acesso móvel",
      formTitle: "Registe o seu interesse",
      formDescription:
        "Escolha a plataforma que lhe interessa e enviaremos um email quando a primeira versão móvel da Payn estiver pronta.",
      emailLabel: "Email",
      emailPlaceholder: "voce@exemplo.com",
      platformLabel: "Plataforma",
      platforms: {
        ios: "iPhone / iPad",
        android: "Android",
        both: "Ambas",
      },
      joining: "A entrar na lista...",
      joinBoth: "Entrar na lista de espera móvel",
      joinPlatform: "Entrar na lista de espera de {platform}",
      invalidEmail: "Introduza um endereço de email válido.",
      configuring: "A lista de espera está a ser configurada. Contacte-nos diretamente para acesso antecipado.",
      saveFailed: "Não foi possível guardar o pedido neste momento. Tente novamente.",
      success: "Está na lista de espera. Enviaremos um email quando o acesso móvel abrir.",
      alreadyOnWaitlist: "Já está na lista de espera para essa plataforma.",
    },
    auth: {
      loginEyebrow: "Entrar",
      signupEyebrow: "Começar",
      loginTitle: "Bem-vindo de volta",
      signupTitle: "Crie a sua conta Payn",
      loginDescription: "Aceda ao seu painel, ofertas guardadas e recomendações personalizadas.",
      signupDescription:
        "Crie a sua conta para guardar ofertas, construir a shortlist e continuar para o seu painel pessoal.",
      emailLabel: "Email",
      emailPlaceholder: "voce@exemplo.com",
      passwordLabel: "Palavra-passe",
      loginPasswordPlaceholder: "A sua palavra-passe",
      signupPasswordPlaceholder: "Mínimo de 6 caracteres",
      signingIn: "A entrar...",
      creatingAccount: "A criar conta...",
      signIn: "Entrar",
      createAccount: "Criar conta",
      panelLoginTitle: "A sua conta Payn",
      panelSignupTitle: "O que desbloqueia",
      benefits: [
        "Ofertas guardadas entre categorias e países",
        "Um painel real com recomendações e tendências",
        "Seguimento de cliques para fornecedores que melhora a sua pontuação Payn",
        "Um caminho limpo do registo para o onboarding e painel",
      ],
      loginPrompt: "Novo na Payn?",
      signupPrompt: "Já tem conta?",
      accountCreatedEyebrow: "Conta criada",
      confirmEmailTitle: "Confirme o seu email para continuar",
      confirmEmailDescription:
        "Criámos a sua conta Payn para {email}. Abra o email de confirmação e depois entre para continuar para o seu painel.",
      goToSignIn: "Ir para entrar",
      onboardingEyebrow: "Onboarding",
      onboardingTitle: "Como vai usar a Payn?",
      onboardingDescription:
        "Escolha a configuração que melhor corresponde à forma como toma decisões financeiras.",
      onboardingCompleteLabel: "Continuar para o painel",
      loading: "A carregar a sua conta",
      callbackError:
        "A Payn não conseguiu concluir a entrada a partir do link de email. Tente novamente.",
      notConfigured: "A autenticação ainda não está configurada para este ambiente.",
      genericError: "A Payn não conseguiu concluir o pedido. Tente novamente.",
      invalidCredentials: "Email ou palavra-passe incorretos. Tente novamente.",
      alreadyRegistered: "Este email já está registado. Tente iniciar sessão.",
      weakPassword: "A palavra-passe deve ter pelo menos 6 caracteres.",
      emailNotConfirmed: "Confirme primeiro o seu email e depois inicie sessão.",
      failedToFetch: "A Payn não conseguiu contactar o serviço de autenticação. Tente novamente dentro de momentos.",
    },
    dashboard: {
      navGroups: {
        core: "Base",
        products: "Produtos",
        account: "Conta",
      },
      navItems: {
        dashboard: { label: "Painel", description: "Visão geral e resumo" },
        discover: { label: "Descobrir", description: "Pesquisar e comparar ofertas" },
        loans: { label: "Empréstimos", description: "Opções de financiamento" },
        cards: { label: "Cartões", description: "Cartões de pagamento" },
        transfers: { label: "Transferências", description: "Movimento de dinheiro" },
        exchange: { label: "Câmbio", description: "Conversão de moeda" },
        insurance: { label: "Seguros", description: "Produtos de proteção" },
        investments: { label: "Investimentos", description: "Plataformas e ativos" },
        profile: { label: "Definições", description: "Conta e sessão" },
      },
      shellTag: "Produto",
      shellTitle: "Centro de controlo financeiro",
      userTypeSuffix: "perfil",
      loadingDashboard: "A carregar painel",
      loadingWorkspace: "A carregar o seu espaço",
      guestEyebrow: "Painel",
      guestTitle: "Inicie sessão para abrir o seu espaço Payn",
      guestDescription:
        "Compare empréstimos, cartões, transferências, câmbio, seguros e investimentos num só lugar.",
      summaryEyebrow: "Resumo",
      welcomeBack: "Bem-vindo de volta",
      openExplore: "Explorar ofertas",
      overviewRecommendedEyebrow: "Recomendado",
      overviewRecommendedTitle: "Principais produtos no seu mercado",
      seeAll: "Ver tudo",
      categoriesEyebrow: "Categorias",
      categoriesTitle: "Explorar por categoria",
      savedEyebrow: "Guardado",
      savedTitle: "A sua shortlist",
      browseMore: "Ver mais",
      noSavedTitle: "Ainda não há ofertas guardadas",
      noSavedDescription: "Guarde produtos em Explorar para construir a sua shortlist.",
      trendingEyebrow: "Tendência",
      trendingTitle: "A ganhar atenção",
      providersEyebrow: "Fornecedores",
      providersTitle: "Fornecedores desta categoria",
      categoryMatchesTitle: "Melhores correspondências para o seu perfil",
      noCategoryTitle: "Não há ofertas disponíveis nesta categoria",
      noCategoryDescription: "Volte a verificar em breve.",
      stats: {
        paynScore: "Pontuação Payn",
        products: "Produtos",
        saved: "Guardado",
        providers: "Fornecedores",
        available: "Disponíveis",
      },
      accountEyebrow: "Conta",
      accountTitle: "A sua conta",
      profileTypeEyebrow: "Tipo de perfil",
      profileTypeTitle: "Como usa a Payn",
      interestsEyebrow: "Interesses",
      interestsTitle: "Categorias que mais lhe interessam",
      useCasesEyebrow: "Casos de uso",
      useCasesTitle: "Para que usa produtos financeiros",
      emailLabel: "Email",
      marketLabel: "Mercado",
      savePreferences: "Guardar preferências",
      savingPreferences: "A guardar...",
      openProfile: "Definições",
    },
    homeMockup: {
      shortlistTitle: "A sua shortlist",
      savedProductsLabel: "3 produtos guardados",
      badges: ["Melhor para viajar", "Taxas mais baixas", "Melhor opção geral"],
      speeds: ["No mesmo dia", "Instantâneo", "1-2 dias"],
      compareAll: "Comparar os 3",
      bestOption: "Melhor opção encontrada",
      readyToApply: "Wise Transfer - pronto para continuar",
    },
    userTypes: [
      {
        id: "personal",
        label: "Pessoal",
        description: "Acompanhe empréstimos, cartões, transferências e câmbio para o seu dia a dia.",
      },
      {
        id: "freelancer",
        label: "Freelancer",
        description: "Compare ferramentas para rendimento irregular, pagamentos internacionais e banca flexível.",
      },
      {
        id: "business",
        label: "Empresa",
        description: "Encontre produtos para despesas de equipa, transferências empresariais e decisões financeiras do negócio.",
      },
    ],
    goalLabels: {
      travel: "viagem",
      savings: "poupança",
      crypto: "cripto",
      international_transfers: "transferências internacionais",
      investing: "investimento",
      insurance: "seguros",
      everyday_banking: "banca do dia a dia",
    },
  },
};

function resolveLocale(locale: MarketplaceLocale) {
  return uiCopy[locale] ?? uiCopy.en;
}

export function getUiCopy(locale: MarketplaceLocale) {
  return resolveLocale(locale);
}

export function getUserTypeOptions(locale: MarketplaceLocale) {
  return resolveLocale(locale).userTypes;
}

export function getGoalLabel(locale: MarketplaceLocale, goal: string) {
  return resolveLocale(locale).goalLabels[goal] ?? goal.replace(/_/g, " ");
}

export function formatUiCopy(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, "g"), value),
    template,
  );
}
