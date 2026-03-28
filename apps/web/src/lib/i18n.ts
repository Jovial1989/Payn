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
    resultsLabel: string;
    providersLabel: string;
    filteredFrom: string;
    availableIn: string;
    topResults: string;
    emptyTitle: string;
    emptyDescription: string;
    filterSummary: string;
    openCategoryPage: string;
  };
  home: {
    providerTitle: string;
    providerDescription: string;
    appTitle: string;
    appDescription: string;
    appPoints: string[];
    waitlistCta: string;
  };
  offerCard: {
    updated: string;
    keyTradeoff: string;
    reviewOffer: string;
    providerSite: string;
    reviewBeforeLeave: string;
  };
  offerDetail: {
    detailEyebrow: string;
    reviewedOn: string;
    backToCategory: string;
    visitProvider: string;
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
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    reachTitle: string;
    reachBody: string;
    partnershipTitle: string;
    partnershipBody: string;
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
      resultsLabel: "matching results",
      providersLabel: "providers",
      filteredFrom: "Filtered from",
      availableIn: "Available in",
      topResults: "Top results",
      emptyTitle: "No offers match this setup",
      emptyDescription: "Try a different country, category, or filter combination to widen the marketplace view.",
      filterSummary: "Results update immediately when country, category, search, or filters change.",
      openCategoryPage: "Open category page",
    },
    home: {
      providerTitle: "Provider coverage",
      providerDescription:
        "Recognizable providers stay visible below the results so the marketplace still feels grounded in real institutions.",
      appTitle: "Payn app",
      appDescription:
        "The mobile app is still on the waitlist, but the route is real and tied to the current product roadmap.",
      appPoints: [
        "Track saved offers across countries and categories",
        "Get notified when provider terms change",
        "Move from web comparison into a logged-in mobile workspace",
      ],
      waitlistCta: "Join mobile waitlist",
    },
    offerCard: {
      updated: "Updated",
      keyTradeoff: "Key tradeoff",
      reviewOffer: "Review offer",
      providerSite: "Provider site",
      reviewBeforeLeave: "Review the product on Payn before you leave for the provider.",
    },
    offerDetail: {
      detailEyebrow: "Offer detail",
      reviewedOn: "reviewed on",
      backToCategory: "Back to category",
      visitProvider: "Visit provider",
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
      disclaimer:
        "Payn may earn commission from some partners, but compensation alone does not determine order.",
    },
    about: {
      eyebrow: "About",
      title: "About Payn",
      description: "A country-aware financial marketplace built around clarity, useful filters, and transparent comparison.",
      missionTitle: "Our mission",
      missionBody:
        "Payn is being built to make cross-market financial discovery more useful. Start with a country, narrow by category, and review the tradeoffs before you click out.",
      coverageTitle: "What Payn covers",
      coverageBody:
        "The marketplace now spans loans, cards, transfers, exchange, insurance, and investments across European and international availability models.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Get in touch",
      description: "Questions, partnerships, or product feedback can be sent directly to Payn.",
      reachTitle: "Reach Payn directly",
      reachBody: "Use email for support, product feedback, or marketplace questions.",
      partnershipTitle: "Partnerships",
      partnershipBody: "Share your company, product type, and markets covered so the conversation starts with context.",
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
      resultsLabel: "passende Ergebnisse",
      providersLabel: "Anbieter",
      filteredFrom: "Gefiltert aus",
      availableIn: "Verfügbar in",
      topResults: "Top-Ergebnisse",
      emptyTitle: "Keine Angebote passen zu dieser Auswahl",
      emptyDescription: "Versuchen Sie ein anderes Land, eine andere Kategorie oder andere Filter.",
      filterSummary: "Ergebnisse aktualisieren sich sofort bei Land, Kategorie, Suche oder Filtern.",
      openCategoryPage: "Kategorieseite öffnen",
    },
    home: {
      providerTitle: "Anbieterabdeckung",
      providerDescription:
        "Bekannte Anbieter bleiben unter den Ergebnissen sichtbar, damit der Marktplatz mit realen Institutionen verankert bleibt.",
      appTitle: "Payn App",
      appDescription:
        "Die mobile App ist noch auf der Warteliste, aber der Pfad ist real und mit dem aktuellen Produktplan verbunden.",
      appPoints: [
        "Gespeicherte Angebote über Länder und Kategorien verfolgen",
        "Benachrichtigungen bei Änderungen von Anbieterbedingungen erhalten",
        "Vom Webvergleich in einen mobilen Workspace wechseln",
      ],
      waitlistCta: "Zur Mobile-Warteliste",
    },
    offerCard: {
      updated: "Aktualisiert",
      keyTradeoff: "Wichtiger Zielkonflikt",
      reviewOffer: "Angebot prüfen",
      providerSite: "Zur Anbieterseite",
      reviewBeforeLeave: "Prüfen Sie das Produkt zuerst auf Payn, bevor Sie zur Anbieterseite gehen.",
    },
    offerDetail: {
      detailEyebrow: "Angebotsdetail",
      reviewedOn: "geprüft am",
      backToCategory: "Zurück zur Kategorie",
      visitProvider: "Anbieter öffnen",
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
      disclaimer:
        "Payn kann bei manchen Partnern Provision erhalten, aber Vergütung allein bestimmt die Reihenfolge nicht.",
    },
    about: {
      eyebrow: "Über Payn",
      title: "Über Payn",
      description: "Ein länderbasierter Finanzmarktplatz für Klarheit, nutzbare Filter und transparente Vergleiche.",
      missionTitle: "Unsere Mission",
      missionBody:
        "Payn soll grenzüberschreitende Finanzsuche nützlicher machen. Mit Land beginnen, nach Kategorie verfeinern und Zielkonflikte vor dem Klick prüfen.",
      coverageTitle: "Was Payn abdeckt",
      coverageBody:
        "Der Marktplatz umfasst jetzt Kredite, Karten, Überweisungen, Wechsel, Versicherungen und Investments in europäischen und internationalen Modellen.",
    },
    contact: {
      eyebrow: "Kontakt",
      title: "Kontakt aufnehmen",
      description: "Fragen, Partnerschaften oder Produktfeedback können direkt an Payn gesendet werden.",
      reachTitle: "Payn direkt erreichen",
      reachBody: "Nutzen Sie E-Mail für Support, Produktfeedback oder Fragen zum Marktplatz.",
      partnershipTitle: "Partnerschaften",
      partnershipBody: "Nennen Sie Unternehmen, Produkttyp und Märkte, damit das Gespräch mit Kontext startet.",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Betrag",
      Term: "Laufzeit",
      "Annual fee": "Jahresgebühr",
      "Monthly fee": "Monatsgebühr",
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
    },
    categories: {
      all: "Todas las categorías",
      loans: "Préstamos",
      cards: "Tarjetas",
      transfers: "Transferencias",
      exchange: "Cambio",
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
      amountLabel: "Importe necesario",
      termLabel: "Cobertura mínima de plazo",
      reset: "Restablecer filtros",
      anyProvider: "Todos los proveedores",
      anyFeature: "Cualquier enfoque",
      anySubtype: "Cualquier subtipo",
    },
    explorer: {
      eyebrow: "Mercado por país",
      title: "Empieza con país, categoría y filtros reales.",
      description:
        "Payn ahora abre con selección de mercado, filtros útiles y resultados directos en lugar de un hero dominante.",
      resultsLabel: "resultados",
      providersLabel: "proveedores",
      filteredFrom: "Filtrado desde",
      availableIn: "Disponible en",
      topResults: "Mejores resultados",
      emptyTitle: "No hay ofertas para esta combinación",
      emptyDescription: "Prueba otro país, otra categoría o filtros distintos.",
      filterSummary: "Los resultados cambian al instante cuando cambias país, categoría, búsqueda o filtros.",
      openCategoryPage: "Abrir página de categoría",
    },
    home: {
      providerTitle: "Cobertura de proveedores",
      providerDescription:
        "Los proveedores reconocibles siguen visibles bajo los resultados para mantener el mercado anclado en instituciones reales.",
      appTitle: "App de Payn",
      appDescription:
        "La app móvil sigue en lista de espera, pero la ruta es real y conecta con el roadmap actual.",
      appPoints: [
        "Seguir ofertas guardadas entre países y categorías",
        "Recibir avisos cuando cambien las condiciones de un proveedor",
        "Pasar de la comparación web a un espacio móvil con sesión",
      ],
      waitlistCta: "Unirse a la lista móvil",
    },
    offerCard: {
      updated: "Actualizado",
      keyTradeoff: "Punto clave a revisar",
      reviewOffer: "Revisar oferta",
      providerSite: "Sitio del proveedor",
      reviewBeforeLeave: "Revisa el producto en Payn antes de salir al proveedor.",
    },
    offerDetail: {
      detailEyebrow: "Detalle de oferta",
      reviewedOn: "revisado el",
      backToCategory: "Volver a la categoría",
      visitProvider: "Ir al proveedor",
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
      disclaimer:
        "Payn puede ganar comisión con algunos socios, pero la compensación por sí sola no determina el orden.",
    },
    about: {
      eyebrow: "Acerca de",
      title: "Acerca de Payn",
      description: "Un mercado financiero por país, centrado en claridad, filtros útiles y comparación transparente.",
      missionTitle: "Nuestra misión",
      missionBody:
        "Payn quiere hacer más útil la búsqueda financiera entre mercados. Empieza por país, filtra por categoría y revisa los compromisos antes del clic.",
      coverageTitle: "Qué cubre Payn",
      coverageBody:
        "El mercado ya cubre préstamos, tarjetas, transferencias, cambio, seguros e inversiones con modelos europeos e internacionales.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Habla con Payn",
      description: "Preguntas, alianzas o comentarios sobre el producto pueden enviarse directamente a Payn.",
      reachTitle: "Contacto directo",
      reachBody: "Usa el correo para soporte, dudas del producto o preguntas sobre el mercado.",
      partnershipTitle: "Alianzas",
      partnershipBody: "Comparte empresa, tipo de producto y mercados cubiertos para empezar con contexto.",
    },
    metrics: {
      ...baseMetrics,
      Amount: "Importe",
      Term: "Plazo",
      "Annual fee": "Cuota anual",
      "Monthly fee": "Cuota mensual",
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
      resultsLabel: "résultats",
      providersLabel: "fournisseurs",
      filteredFrom: "Filtré depuis",
      availableIn: "Disponible en",
      topResults: "Meilleurs résultats",
      emptyTitle: "Aucune offre ne correspond",
      emptyDescription: "Essayez un autre pays, une autre catégorie ou d'autres filtres.",
      filterSummary: "Les résultats changent immédiatement quand le pays, la catégorie, la recherche ou les filtres changent.",
      openCategoryPage: "Ouvrir la catégorie",
    },
    home: {
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
    },
    offerCard: {
      updated: "Mis à jour",
      keyTradeoff: "Point d'attention",
      reviewOffer: "Voir l'offre",
      providerSite: "Site du fournisseur",
      reviewBeforeLeave: "Vérifiez le produit sur Payn avant de quitter vers le fournisseur.",
    },
    offerDetail: {
      detailEyebrow: "Détail de l'offre",
      reviewedOn: "révisé le",
      backToCategory: "Retour à la catégorie",
      visitProvider: "Voir le fournisseur",
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
      disclaimer:
        "Payn peut percevoir une commission auprès de certains partenaires, mais la rémunération seule ne détermine pas l'ordre.",
    },
    about: {
      eyebrow: "À propos",
      title: "À propos de Payn",
      description: "Un marché financier par pays, construit autour de la clarté, de filtres utiles et d'une comparaison transparente.",
      missionTitle: "Notre mission",
      missionBody:
        "Payn veut rendre la découverte financière entre marchés plus utile. Commencez par un pays, affinez par catégorie et examinez les compromis avant de cliquer.",
      coverageTitle: "Ce que couvre Payn",
      coverageBody:
        "Le marché couvre désormais prêts, cartes, transferts, change, assurance et investissements sur des modèles européens et internationaux.",
    },
    contact: {
      eyebrow: "Contact",
      title: "Contacter Payn",
      description: "Questions, partenariats ou retours produit peuvent être envoyés directement à Payn.",
      reachTitle: "Contact direct",
      reachBody: "Utilisez l'email pour le support, les retours produit ou les questions marché.",
      partnershipTitle: "Partenariats",
      partnershipBody: "Partagez votre société, votre type de produit et vos marchés couverts pour démarrer avec du contexte.",
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
      resultsLabel: "risultati",
      providersLabel: "provider",
      filteredFrom: "Filtrato da",
      availableIn: "Disponibile in",
      topResults: "Risultati principali",
      emptyTitle: "Nessuna offerta trovata",
      emptyDescription: "Prova un altro paese, un'altra categoria o filtri diversi.",
      filterSummary: "I risultati cambiano subito quando cambiano paese, categoria, ricerca o filtri.",
      openCategoryPage: "Apri pagina categoria",
    },
    home: {
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
    },
    offerCard: {
      updated: "Aggiornato",
      keyTradeoff: "Punto da valutare",
      reviewOffer: "Vedi offerta",
      providerSite: "Sito del provider",
      reviewBeforeLeave: "Controlla il prodotto su Payn prima di uscire verso il provider.",
    },
    offerDetail: {
      detailEyebrow: "Dettaglio offerta",
      reviewedOn: "revisionato il",
      backToCategory: "Torna alla categoria",
      visitProvider: "Vai al provider",
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
      disclaimer:
        "Payn può ricevere commissioni da alcuni partner, ma il compenso da solo non determina l'ordine.",
    },
    about: {
      eyebrow: "Chi siamo",
      title: "Chi è Payn",
      description: "Un marketplace finanziario per paese costruito su chiarezza, filtri utili e confronto trasparente.",
      missionTitle: "La nostra missione",
      missionBody:
        "Payn vuole rendere più utile la scoperta finanziaria tra mercati. Parti dal paese, restringi per categoria e valuta i compromessi prima del clic.",
      coverageTitle: "Cosa copre Payn",
      coverageBody:
        "Il marketplace copre ora prestiti, carte, trasferimenti, cambio, assicurazioni e investimenti con modelli europei e internazionali.",
    },
    contact: {
      eyebrow: "Contatti",
      title: "Parla con Payn",
      description: "Domande, partnership o feedback di prodotto possono essere inviati direttamente a Payn.",
      reachTitle: "Contatto diretto",
      reachBody: "Usa l'email per supporto, feedback o domande sul marketplace.",
      partnershipTitle: "Partnership",
      partnershipBody: "Condividi azienda, tipo di prodotto e mercati coperti per iniziare con contesto.",
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
      resultsLabel: "resultados",
      providersLabel: "fornecedores",
      filteredFrom: "Filtrado de",
      availableIn: "Disponível em",
      topResults: "Melhores resultados",
      emptyTitle: "Nenhuma oferta encontrada",
      emptyDescription: "Experimente outro país, outra categoria ou filtros diferentes.",
      filterSummary: "Os resultados mudam de imediato quando muda país, categoria, pesquisa ou filtros.",
      openCategoryPage: "Abrir página da categoria",
    },
    home: {
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
    },
    offerCard: {
      updated: "Atualizado",
      keyTradeoff: "Ponto principal a rever",
      reviewOffer: "Ver oferta",
      providerSite: "Site do fornecedor",
      reviewBeforeLeave: "Veja o produto na Payn antes de sair para o fornecedor.",
    },
    offerDetail: {
      detailEyebrow: "Detalhe da oferta",
      reviewedOn: "revisto em",
      backToCategory: "Voltar à categoria",
      visitProvider: "Ir ao fornecedor",
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
      disclaimer:
        "A Payn pode receber comissão de alguns parceiros, mas a compensação por si só não determina a ordem.",
    },
    about: {
      eyebrow: "Sobre",
      title: "Sobre a Payn",
      description: "Um marketplace financeiro por país, centrado em clareza, filtros úteis e comparação transparente.",
      missionTitle: "A nossa missão",
      missionBody:
        "A Payn quer tornar a descoberta financeira entre mercados mais útil. Comece pelo país, reduza por categoria e reveja os compromissos antes do clique.",
      coverageTitle: "O que a Payn cobre",
      coverageBody:
        "O marketplace cobre agora empréstimos, cartões, transferências, câmbio, seguros e investimentos com modelos europeus e internacionais.",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Fale com a Payn",
      description: "Perguntas, parcerias ou feedback de produto podem ser enviados diretamente para a Payn.",
      reachTitle: "Contacto direto",
      reachBody: "Use o email para apoio, feedback ou questões sobre o marketplace.",
      partnershipTitle: "Parcerias",
      partnershipBody: "Partilhe empresa, tipo de produto e mercados cobertos para começar com contexto.",
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
