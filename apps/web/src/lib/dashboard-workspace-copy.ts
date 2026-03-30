import type { MarketplaceLocale } from "@payn/types";

type DashboardWorkspaceCopy = {
  overviewDescription: string;
  accountSummaryTitle: string;
  topPicksDescription: string;
  marketPulseEyebrow: string;
  marketPulseTitle: string;
  marketPulseDescription: string;
  marketPulseFallback: string;
  openInvestmentView: string;
  continueEyebrow: string;
  continueTitle: string;
  continueDescription: string;
  recentlyViewedTitle: string;
  compareTrayTitle: string;
  compareTrayDescription: string;
  compareReadyLabel: string;
  quickAccessDescription: string;
  investmentsEyebrow: string;
  investmentsTitle: string;
  investmentsDescription: string;
  backToDashboard: string;
  broaderDiscovery: string;
  investmentOffersEyebrow: string;
  investmentOffersTitle: string;
  investmentOffersDescription: string;
};

const copy: Record<MarketplaceLocale, DashboardWorkspaceCopy> = {
  en: {
    overviewDescription:
      "Use Payn as a control center for comparison, saved offers, market context, and the next decision across every category.",
    accountSummaryTitle: "Account summary",
    topPicksDescription:
      "A cross-category shortlist based on your market, profile, and recent activity.",
    marketPulseEyebrow: "Market pulse",
    marketPulseTitle: "A quick look at key markets",
    marketPulseDescription:
      "Track a compact trend snapshot across crypto, FX, and broad-market exposure before opening the full investments workspace.",
    marketPulseFallback: "Market data is catching up. Open the investment view for a refreshed snapshot.",
    openInvestmentView: "Open investment view",
    continueEyebrow: "Continue",
    continueTitle: "Continue where you left off",
    continueDescription:
      "Pick up saved offers, revisit recent views, and keep your compare-ready shortlist moving.",
    recentlyViewedTitle: "Recently viewed",
    compareTrayTitle: "Compare tray",
    compareTrayDescription:
      "Keep up to three shortlisted offers ready for side-by-side review.",
    compareReadyLabel: "Ready to compare",
    quickAccessDescription:
      "Jump straight into the product workspace you want without losing the broader dashboard view.",
    investmentsEyebrow: "Investments workspace",
    investmentsTitle: "Market intelligence and investment discovery",
    investmentsDescription:
      "Keep investment research in its own workspace with trend context, provider access, and product discovery separate from the main dashboard overview.",
    backToDashboard: "Back to dashboard",
    broaderDiscovery: "Broader discovery",
    investmentOffersEyebrow: "Investment offers",
    investmentOffersTitle: "Platforms and products in this market",
    investmentOffersDescription:
      "Offers relevant to your market and profile, kept separate from the main dashboard overview.",
  },
  de: {
    overviewDescription:
      "Nutze Payn als Steuerzentrale für Vergleiche, gespeicherte Angebote, Marktkontext und die nächste Entscheidung über alle Kategorien hinweg.",
    accountSummaryTitle: "Kontoübersicht",
    topPicksDescription:
      "Eine kategorienübergreifende Shortlist basierend auf deinem Markt, Profil und jüngster Aktivität.",
    marketPulseEyebrow: "Marktpuls",
    marketPulseTitle: "Kurzer Blick auf zentrale Märkte",
    marketPulseDescription:
      "Behalte einen kompakten Trendüberblick über Krypto, FX und breite Markt-Exposure im Blick, bevor du den vollen Investment-Workspace öffnest.",
    marketPulseFallback: "Marktdaten werden aktualisiert. Öffne den Investment-Workspace für einen frischen Snapshot.",
    openInvestmentView: "Investment-Ansicht öffnen",
    continueEyebrow: "Weiter",
    continueTitle: "Dort weitermachen, wo du aufgehört hast",
    continueDescription:
      "Greife gespeicherte Angebote auf, rufe zuletzt angesehene Produkte erneut auf und halte deine vergleichsbereite Shortlist in Bewegung.",
    recentlyViewedTitle: "Zuletzt angesehen",
    compareTrayTitle: "Vergleichsleiste",
    compareTrayDescription:
      "Halte bis zu drei shortlistete Angebote für einen direkten Vergleich bereit.",
    compareReadyLabel: "Vergleichsbereit",
    quickAccessDescription:
      "Spring direkt in den gewünschten Produkt-Workspace, ohne die übergreifende Dashboard-Sicht zu verlieren.",
    investmentsEyebrow: "Investment-Workspace",
    investmentsTitle: "Marktintelligenz und Investment-Discovery",
    investmentsDescription:
      "Halte Investment-Recherche in einem eigenen Workspace mit Trendkontext, Anbieterzugang und Produktsuche getrennt von der Hauptübersicht.",
    backToDashboard: "Zurück zum Dashboard",
    broaderDiscovery: "Breitere Suche",
    investmentOffersEyebrow: "Investment-Angebote",
    investmentOffersTitle: "Plattformen und Produkte in diesem Markt",
    investmentOffersDescription:
      "Angebote passend zu deinem Markt und Profil, getrennt von der Hauptübersicht des Dashboards.",
  },
  es: {
    overviewDescription:
      "Usa Payn como centro de control para comparación, ofertas guardadas, contexto de mercado y la siguiente decisión en todas las categorías.",
    accountSummaryTitle: "Resumen de cuenta",
    topPicksDescription:
      "Una shortlist transversal por categoría basada en tu mercado, perfil y actividad reciente.",
    marketPulseEyebrow: "Pulso del mercado",
    marketPulseTitle: "Vista rápida de mercados clave",
    marketPulseDescription:
      "Sigue una vista compacta de cripto, FX y exposición de mercado amplia antes de abrir el workspace completo de inversiones.",
    marketPulseFallback: "Los datos de mercado se están actualizando. Abre la vista de inversiones para una instantánea nueva.",
    openInvestmentView: "Abrir vista de inversiones",
    continueEyebrow: "Continuar",
    continueTitle: "Continúa donde lo dejaste",
    continueDescription:
      "Retoma ofertas guardadas, revisa vistas recientes y mantén tu shortlist lista para comparar.",
    recentlyViewedTitle: "Visto recientemente",
    compareTrayTitle: "Bandeja de comparación",
    compareTrayDescription:
      "Mantén hasta tres ofertas de la shortlist listas para revisar lado a lado.",
    compareReadyLabel: "Listo para comparar",
    quickAccessDescription:
      "Salta directamente al workspace del producto que necesitas sin perder la vista general del dashboard.",
    investmentsEyebrow: "Workspace de inversiones",
    investmentsTitle: "Inteligencia de mercado y descubrimiento de inversión",
    investmentsDescription:
      "Mantén la investigación de inversiones en un workspace propio con contexto de tendencia, acceso a proveedores y descubrimiento de productos separado del dashboard principal.",
    backToDashboard: "Volver al dashboard",
    broaderDiscovery: "Exploración general",
    investmentOffersEyebrow: "Ofertas de inversión",
    investmentOffersTitle: "Plataformas y productos en este mercado",
    investmentOffersDescription:
      "Ofertas relevantes para tu mercado y perfil, separadas del dashboard principal.",
  },
  fr: {
    overviewDescription:
      "Utilisez Payn comme centre de contrôle pour comparer, retrouver vos offres sauvegardées, voir le contexte de marché et avancer dans chaque catégorie.",
    accountSummaryTitle: "Résumé du compte",
    topPicksDescription:
      "Une shortlist multi-catégories basée sur votre marché, votre profil et votre activité récente.",
    marketPulseEyebrow: "Pouls du marché",
    marketPulseTitle: "Vue rapide des marchés clés",
    marketPulseDescription:
      "Suivez un aperçu compact de la crypto, du FX et des expositions de marché larges avant d’ouvrir l’espace investissements complet.",
    marketPulseFallback: "Les données de marché se mettent à jour. Ouvrez la vue investissements pour un instantané actualisé.",
    openInvestmentView: "Ouvrir la vue investissements",
    continueEyebrow: "Continuer",
    continueTitle: "Reprendre où vous vous êtes arrêté",
    continueDescription:
      "Retrouvez vos offres sauvegardées, vos dernières vues et gardez une shortlist prête à comparer.",
    recentlyViewedTitle: "Vu récemment",
    compareTrayTitle: "Zone de comparaison",
    compareTrayDescription:
      "Gardez jusqu’à trois offres prêtes pour une revue côte à côte.",
    compareReadyLabel: "Prêt à comparer",
    quickAccessDescription:
      "Accédez directement à l’espace produit voulu sans perdre la vue d’ensemble du dashboard.",
    investmentsEyebrow: "Espace investissements",
    investmentsTitle: "Intelligence de marché et découverte d’investissement",
    investmentsDescription:
      "Gardez la recherche d’investissement dans un espace dédié avec contexte de tendance, accès fournisseur et découverte produit séparés du dashboard principal.",
    backToDashboard: "Retour au dashboard",
    broaderDiscovery: "Découverte plus large",
    investmentOffersEyebrow: "Offres d’investissement",
    investmentOffersTitle: "Plateformes et produits sur ce marché",
    investmentOffersDescription:
      "Des offres pertinentes pour votre marché et votre profil, séparées de la vue d’ensemble principale.",
  },
  it: {
    overviewDescription:
      "Usa Payn come centro di controllo per confronto, offerte salvate, contesto di mercato e prossima decisione in ogni categoria.",
    accountSummaryTitle: "Riepilogo account",
    topPicksDescription:
      "Una shortlist cross-category basata sul tuo mercato, profilo e attività recente.",
    marketPulseEyebrow: "Market pulse",
    marketPulseTitle: "Vista rapida sui mercati chiave",
    marketPulseDescription:
      "Segui uno snapshot compatto di crypto, FX ed esposizione ai mercati ampi prima di aprire il workspace completo investimenti.",
    marketPulseFallback: "I dati di mercato si stanno aggiornando. Apri la vista investimenti per uno snapshot aggiornato.",
    openInvestmentView: "Apri vista investimenti",
    continueEyebrow: "Continua",
    continueTitle: "Riprendi da dove hai lasciato",
    continueDescription:
      "Riprendi offerte salvate, visualizzazioni recenti e mantieni attiva la shortlist pronta al confronto.",
    recentlyViewedTitle: "Visti di recente",
    compareTrayTitle: "Tray di confronto",
    compareTrayDescription:
      "Tieni fino a tre offerte della shortlist pronte per un confronto affiancato.",
    compareReadyLabel: "Pronto al confronto",
    quickAccessDescription:
      "Vai direttamente nel workspace di prodotto che ti serve senza perdere la vista generale del dashboard.",
    investmentsEyebrow: "Workspace investimenti",
    investmentsTitle: "Market intelligence e discovery investimenti",
    investmentsDescription:
      "Mantieni la ricerca sugli investimenti in un workspace dedicato con contesto di trend, accesso ai provider e discovery prodotto separati dalla panoramica principale.",
    backToDashboard: "Torna al dashboard",
    broaderDiscovery: "Discovery più ampia",
    investmentOffersEyebrow: "Offerte investimento",
    investmentOffersTitle: "Piattaforme e prodotti in questo mercato",
    investmentOffersDescription:
      "Offerte rilevanti per il tuo mercato e profilo, separate dalla panoramica principale del dashboard.",
  },
  pt: {
    overviewDescription:
      "Use a Payn como centro de controlo para comparação, ofertas guardadas, contexto de mercado e a próxima decisão em todas as categorias.",
    accountSummaryTitle: "Resumo da conta",
    topPicksDescription:
      "Uma shortlist transversal às categorias com base no seu mercado, perfil e atividade recente.",
    marketPulseEyebrow: "Pulso do mercado",
    marketPulseTitle: "Visão rápida dos mercados-chave",
    marketPulseDescription:
      "Acompanhe um snapshot compacto de cripto, FX e exposição ampla ao mercado antes de abrir o workspace completo de investimentos.",
    marketPulseFallback: "Os dados de mercado estão a atualizar. Abra a vista de investimentos para um snapshot atualizado.",
    openInvestmentView: "Abrir vista de investimentos",
    continueEyebrow: "Continuar",
    continueTitle: "Continue onde ficou",
    continueDescription:
      "Retome ofertas guardadas, reveja visualizações recentes e mantenha a shortlist pronta para comparar.",
    recentlyViewedTitle: "Vistos recentemente",
    compareTrayTitle: "Área de comparação",
    compareTrayDescription:
      "Mantenha até três ofertas da shortlist prontas para revisão lado a lado.",
    compareReadyLabel: "Pronto para comparar",
    quickAccessDescription:
      "Entre diretamente no workspace de produto que pretende sem perder a visão geral do dashboard.",
    investmentsEyebrow: "Workspace de investimentos",
    investmentsTitle: "Inteligência de mercado e descoberta de investimento",
    investmentsDescription:
      "Mantenha a pesquisa de investimento num workspace dedicado com contexto de tendência, acesso a provedores e descoberta de produtos separados da visão geral principal.",
    backToDashboard: "Voltar ao dashboard",
    broaderDiscovery: "Descoberta mais ampla",
    investmentOffersEyebrow: "Ofertas de investimento",
    investmentOffersTitle: "Plataformas e produtos neste mercado",
    investmentOffersDescription:
      "Ofertas relevantes para o seu mercado e perfil, separadas da visão geral principal do dashboard.",
  },
};

export function getDashboardWorkspaceCopy(locale: MarketplaceLocale) {
  return copy[locale] ?? copy.en;
}

