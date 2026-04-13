import type { MarketplaceLocale } from "@payn/types";

type DashboardDecisionCopy = {
  actionHubEyebrow: string;
  actionHubTitle: string;
  actionHubDescription: string;
  starterActions: {
    cards: { title: string; description: string };
    loans: { title: string; description: string };
    transfers: { title: string; description: string };
  };
  recommendedForStart: string;
  recommendedForStartDescription: string;
  bestNoFeeCards: string;
  bestNoFeeCardsDescription: string;
  personalizedRecommendations: string;
  personalizedRecommendationsDescription: string;
  bestForPrefix: string;
  decisionSections: {
    topPicks: string;
    bestForProfile: string;
    cheapest: string;
    fastest: string;
  };
  smartFilters: string;
  smartFilterLabels: {
    noAnnualFee: string;
    instantApproval: string;
    highLimit: string;
    cryptoFriendly: string;
  };
  compareTopThree: string;
  comparisonTitle: string;
  comparisonDescription: string;
  comparisonColumns: {
    apr: string;
    fees: string;
    speed: string;
    approval: string;
    limits: string;
  };
  filteredEmptyTitle: string;
  filteredEmptyDescription: string;
  clearFilters: string;
  startWithTopPicks: string;
  transferToolEyebrow: string;
  transferToolTitle: string;
  exchangeToolTitle: string;
  calculatorDescription: string;
  amountLabel: string;
  fromLabel: string;
  toLabel: string;
  recipientGets: string;
  bestRate: string;
  fastest: string;
  lowestFee: string;
  expandAsset: string;
};

const copy: Record<MarketplaceLocale, DashboardDecisionCopy> = {
  en: {
    actionHubEyebrow: "Start here",
    actionHubTitle: "Choose your next financial move",
    actionHubDescription:
      "Use the dashboard as a decision engine: start with one action, compare the shortlist, and move into the provider only when the fit is clear.",
    starterActions: {
      cards: {
        title: "Find the best card",
        description: "Start with no-fee and travel-friendly cards in your market.",
      },
      loans: {
        title: "Find the best loan",
        description: "See low-rate and fast-decision borrowing options first.",
      },
      transfers: {
        title: "Send money abroad",
        description: "Compare delivered amount, fees, and payout speed side by side.",
      },
    },
    recommendedForStart: "Top 3 products to get started",
    recommendedForStartDescription:
      "A simple shortlist for the first decision if you have not saved or viewed anything yet.",
    bestNoFeeCards: "Best no-fee cards in your region",
    bestNoFeeCardsDescription:
      "Good first picks if you want low-cost cards before moving into a broader comparison.",
    personalizedRecommendations: "Recommended for you",
    personalizedRecommendationsDescription:
      "Personalized ideas based on your saved offers, recent views, and current market.",
    bestForPrefix: "Best for",
    decisionSections: {
      topPicks: "Top picks for you",
      bestForProfile: "Best for your profile",
      cheapest: "Cheapest option",
      fastest: "Fastest approval",
    },
    smartFilters: "Smart filters",
    smartFilterLabels: {
      noAnnualFee: "No annual fee",
      instantApproval: "Instant approval",
      highLimit: "High limit",
      cryptoFriendly: "Crypto friendly",
    },
    compareTopThree: "Compare top 3",
    comparisonTitle: "Compare the leading options",
    comparisonDescription:
      "Use a quick comparison before opening individual provider details.",
    comparisonColumns: {
      apr: "APR",
      fees: "Fees",
      speed: "Speed",
      approval: "Approval",
      limits: "Limits",
    },
    filteredEmptyTitle: "No offers match these filters yet",
    filteredEmptyDescription:
      "Try a broader filter set or start with the top picks so Payn can guide the next step.",
    clearFilters: "Clear filters",
    startWithTopPicks: "Start with top picks",
    transferToolEyebrow: "Transfer tool",
    transferToolTitle: "See what your recipient gets",
    exchangeToolTitle: "See who gives the strongest exchange outcome",
    calculatorDescription:
      "Enter an amount and compare providers by delivered value, fee level, and speed.",
    amountLabel: "Amount",
    fromLabel: "From",
    toLabel: "To",
    recipientGets: "Recipient gets",
    bestRate: "Best rate",
    fastest: "Fastest",
    lowestFee: "Lowest fee",
    expandAsset: "Open asset view",
  },
  de: {
    actionHubEyebrow: "Start hier",
    actionHubTitle: "Wähle deinen nächsten Finanzschritt",
    actionHubDescription:
      "Nutze das Dashboard als Entscheidungszentrale: starte mit einer Aktion, vergleiche die Shortlist und öffne den Anbieter erst, wenn der Fit klar ist.",
    starterActions: {
      cards: {
        title: "Beste Karte finden",
        description: "Starte mit gebührenfreien und reisetauglichen Karten in deinem Markt.",
      },
      loans: {
        title: "Besten Kredit finden",
        description: "Sieh zuerst günstige Kredite und schnelle Entscheidungen.",
      },
      transfers: {
        title: "Geld ins Ausland senden",
        description: "Vergleiche Auszahlungsbetrag, Gebühren und Geschwindigkeit direkt.",
      },
    },
    recommendedForStart: "Top 3 Produkte zum Einstieg",
    recommendedForStartDescription:
      "Eine einfache Shortlist für die erste Entscheidung, wenn du noch nichts gespeichert oder angesehen hast.",
    bestNoFeeCards: "Beste Karten ohne Jahresgebühr in deiner Region",
    bestNoFeeCardsDescription:
      "Gute erste Optionen, wenn du mit günstigen Karten starten willst.",
    personalizedRecommendations: "Empfohlen für dich",
    personalizedRecommendationsDescription:
      "Personalisierte Ideen basierend auf gespeicherten Angeboten, letzten Ansichten und deinem Markt.",
    bestForPrefix: "Am besten für",
    decisionSections: {
      topPicks: "Top-Empfehlungen für dich",
      bestForProfile: "Am besten für dein Profil",
      cheapest: "Günstigste Option",
      fastest: "Schnellste Zusage",
    },
    smartFilters: "Intelligente Filter",
    smartFilterLabels: {
      noAnnualFee: "Keine Jahresgebühr",
      instantApproval: "Sofortentscheidung",
      highLimit: "Hohes Limit",
      cryptoFriendly: "Krypto-freundlich",
    },
    compareTopThree: "Top 3 vergleichen",
    comparisonTitle: "Führende Optionen vergleichen",
    comparisonDescription:
      "Nutze den Schnellvergleich, bevor du einzelne Anbieterdetails öffnest.",
    comparisonColumns: {
      apr: "APR",
      fees: "Gebühren",
      speed: "Geschwindigkeit",
      approval: "Zusage",
      limits: "Limits",
    },
    filteredEmptyTitle: "Noch keine Angebote für diese Filter",
    filteredEmptyDescription:
      "Erweitere die Filter oder starte mit den Top-Empfehlungen, damit Payn den nächsten Schritt führen kann.",
    clearFilters: "Filter löschen",
    startWithTopPicks: "Mit Top-Empfehlungen starten",
    transferToolEyebrow: "Transfer-Tool",
    transferToolTitle: "Sieh, was beim Empfänger ankommt",
    exchangeToolTitle: "Sieh, wer das stärkste Wechselergebnis bietet",
    calculatorDescription:
      "Gib einen Betrag ein und vergleiche Anbieter nach Auszahlungswert, Gebühren und Geschwindigkeit.",
    amountLabel: "Betrag",
    fromLabel: "Von",
    toLabel: "Nach",
    recipientGets: "Empfänger erhält",
    bestRate: "Bester Kurs",
    fastest: "Am schnellsten",
    lowestFee: "Niedrigste Gebühr",
    expandAsset: "Asset-Ansicht öffnen",
  },
  es: {
    actionHubEyebrow: "Empieza aquí",
    actionHubTitle: "Elige tu próximo movimiento financiero",
    actionHubDescription:
      "Usa el dashboard como motor de decisión: empieza con una acción, compara la shortlist y abre el proveedor solo cuando el encaje esté claro.",
    starterActions: {
      cards: {
        title: "Encontrar la mejor tarjeta",
        description: "Empieza con tarjetas sin cuota y útiles para viajar en tu mercado.",
      },
      loans: {
        title: "Encontrar el mejor préstamo",
        description: "Ve primero opciones con menor coste y decisión rápida.",
      },
      transfers: {
        title: "Enviar dinero al extranjero",
        description: "Compara importe recibido, comisiones y velocidad en un solo lugar.",
      },
    },
    recommendedForStart: "Top 3 productos para empezar",
    recommendedForStartDescription:
      "Una shortlist simple para la primera decisión si aún no has guardado ni visto nada.",
    bestNoFeeCards: "Mejores tarjetas sin cuota en tu región",
    bestNoFeeCardsDescription:
      "Buenas opciones iniciales si quieres empezar con tarjetas de bajo coste.",
    personalizedRecommendations: "Recomendado para ti",
    personalizedRecommendationsDescription:
      "Ideas personalizadas según tus guardados, vistas recientes y mercado actual.",
    bestForPrefix: "Mejor para",
    decisionSections: {
      topPicks: "Top picks para ti",
      bestForProfile: "Mejor para tu perfil",
      cheapest: "Opción más barata",
      fastest: "Aprobación más rápida",
    },
    smartFilters: "Filtros inteligentes",
    smartFilterLabels: {
      noAnnualFee: "Sin cuota anual",
      instantApproval: "Aprobación instantánea",
      highLimit: "Límite alto",
      cryptoFriendly: "Cripto friendly",
    },
    compareTopThree: "Comparar top 3",
    comparisonTitle: "Comparar las opciones líderes",
    comparisonDescription:
      "Usa una comparación rápida antes de abrir los detalles de cada proveedor.",
    comparisonColumns: {
      apr: "APR",
      fees: "Comisiones",
      speed: "Velocidad",
      approval: "Aprobación",
      limits: "Límites",
    },
    filteredEmptyTitle: "Aún no hay ofertas para estos filtros",
    filteredEmptyDescription:
      "Amplía los filtros o empieza con los top picks para que Payn guíe el siguiente paso.",
    clearFilters: "Limpiar filtros",
    startWithTopPicks: "Empezar con top picks",
    transferToolEyebrow: "Herramienta de transferencias",
    transferToolTitle: "Mira cuánto recibe el destinatario",
    exchangeToolTitle: "Mira quién ofrece el mejor resultado de cambio",
    calculatorDescription:
      "Introduce un importe y compara proveedores por valor recibido, coste y velocidad.",
    amountLabel: "Cantidad",
    fromLabel: "De",
    toLabel: "A",
    recipientGets: "El destinatario recibe",
    bestRate: "Mejor tipo",
    fastest: "Más rápido",
    lowestFee: "Menor comisión",
    expandAsset: "Abrir vista del activo",
  },
  fr: {
    actionHubEyebrow: "Commencez ici",
    actionHubTitle: "Choisissez votre prochaine décision financière",
    actionHubDescription:
      "Utilisez le dashboard comme moteur de décision: démarrez par une action, comparez la shortlist, puis ouvrez le fournisseur seulement quand le choix est clair.",
    starterActions: {
      cards: {
        title: "Trouver la meilleure carte",
        description: "Commencez avec des cartes sans frais annuels et adaptées au voyage.",
      },
      loans: {
        title: "Trouver le meilleur prêt",
        description: "Voyez d’abord les options moins chères avec réponse rapide.",
      },
      transfers: {
        title: "Envoyer de l’argent à l’étranger",
        description: "Comparez montant reçu, frais et vitesse au même endroit.",
      },
    },
    recommendedForStart: "Top 3 produits pour démarrer",
    recommendedForStartDescription:
      "Une shortlist simple pour la première décision si vous n’avez encore rien sauvegardé ni consulté.",
    bestNoFeeCards: "Meilleures cartes sans frais annuels dans votre région",
    bestNoFeeCardsDescription:
      "De bons premiers choix si vous voulez commencer par des cartes à faible coût.",
    personalizedRecommendations: "Recommandé pour vous",
    personalizedRecommendationsDescription:
      "Des idées personnalisées selon vos sauvegardes, vos vues récentes et votre marché.",
    bestForPrefix: "Idéal pour",
    decisionSections: {
      topPicks: "Top picks pour vous",
      bestForProfile: "Le plus adapté à votre profil",
      cheapest: "Option la moins chère",
      fastest: "Approbation la plus rapide",
    },
    smartFilters: "Filtres intelligents",
    smartFilterLabels: {
      noAnnualFee: "Sans frais annuels",
      instantApproval: "Approbation instantanée",
      highLimit: "Limite élevée",
      cryptoFriendly: "Compatible crypto",
    },
    compareTopThree: "Comparer le top 3",
    comparisonTitle: "Comparer les options principales",
    comparisonDescription:
      "Utilisez une comparaison rapide avant d’ouvrir les détails du fournisseur.",
    comparisonColumns: {
      apr: "APR",
      fees: "Frais",
      speed: "Vitesse",
      approval: "Approbation",
      limits: "Limites",
    },
    filteredEmptyTitle: "Aucune offre ne correspond à ces filtres",
    filteredEmptyDescription:
      "Élargissez les filtres ou commencez par les top picks pour laisser Payn guider la suite.",
    clearFilters: "Réinitialiser les filtres",
    startWithTopPicks: "Commencer avec les top picks",
    transferToolEyebrow: "Outil de transfert",
    transferToolTitle: "Voyez ce que reçoit le destinataire",
    exchangeToolTitle: "Voyez qui offre le meilleur résultat de change",
    calculatorDescription:
      "Saisissez un montant et comparez les fournisseurs par valeur reçue, coût et vitesse.",
    amountLabel: "Montant",
    fromLabel: "De",
    toLabel: "Vers",
    recipientGets: "Le destinataire reçoit",
    bestRate: "Meilleur taux",
    fastest: "Le plus rapide",
    lowestFee: "Frais les plus bas",
    expandAsset: "Ouvrir la vue actif",
  },
  it: {
    actionHubEyebrow: "Inizia da qui",
    actionHubTitle: "Scegli la tua prossima decisione finanziaria",
    actionHubDescription:
      "Usa il dashboard come motore decisionale: parti da un’azione, confronta la shortlist e apri il provider solo quando il fit è chiaro.",
    starterActions: {
      cards: {
        title: "Trova la carta migliore",
        description: "Inizia con carte senza canone e adatte ai viaggi nel tuo mercato.",
      },
      loans: {
        title: "Trova il prestito migliore",
        description: "Vedi prima le opzioni più convenienti e con risposta rapida.",
      },
      transfers: {
        title: "Invia denaro all’estero",
        description: "Confronta importo ricevuto, commissioni e velocità nello stesso posto.",
      },
    },
    recommendedForStart: "Top 3 prodotti per iniziare",
    recommendedForStartDescription:
      "Una shortlist semplice per la prima decisione se non hai ancora salvato o visto nulla.",
    bestNoFeeCards: "Migliori carte senza canone nella tua area",
    bestNoFeeCardsDescription:
      "Buone prime opzioni se vuoi iniziare con carte a basso costo.",
    personalizedRecommendations: "Consigliato per te",
    personalizedRecommendationsDescription:
      "Idee personalizzate basate su offerte salvate, visualizzazioni recenti e mercato attuale.",
    bestForPrefix: "Ideale per",
    decisionSections: {
      topPicks: "Top pick per te",
      bestForProfile: "Migliore per il tuo profilo",
      cheapest: "Opzione più economica",
      fastest: "Approvazione più rapida",
    },
    smartFilters: "Filtri intelligenti",
    smartFilterLabels: {
      noAnnualFee: "Nessun canone annuale",
      instantApproval: "Approvazione istantanea",
      highLimit: "Limite alto",
      cryptoFriendly: "Crypto friendly",
    },
    compareTopThree: "Confronta top 3",
    comparisonTitle: "Confronta le opzioni principali",
    comparisonDescription:
      "Usa un confronto rapido prima di aprire i dettagli dei provider.",
    comparisonColumns: {
      apr: "APR",
      fees: "Commissioni",
      speed: "Velocità",
      approval: "Approvazione",
      limits: "Limiti",
    },
    filteredEmptyTitle: "Nessuna offerta corrisponde ancora a questi filtri",
    filteredEmptyDescription:
      "Allarga i filtri oppure inizia dalle top pick così Payn può guidare il prossimo passo.",
    clearFilters: "Azzera filtri",
    startWithTopPicks: "Inizia dalle top pick",
    transferToolEyebrow: "Strumento trasferimenti",
    transferToolTitle: "Vedi quanto riceve il destinatario",
    exchangeToolTitle: "Vedi chi offre il miglior risultato di cambio",
    calculatorDescription:
      "Inserisci un importo e confronta i provider per valore ricevuto, costo e velocità.",
    amountLabel: "Importo",
    fromLabel: "Da",
    toLabel: "A",
    recipientGets: "Il destinatario riceve",
    bestRate: "Miglior tasso",
    fastest: "Più veloce",
    lowestFee: "Commissione più bassa",
    expandAsset: "Apri vista asset",
  },
  pt: {
    actionHubEyebrow: "Comece aqui",
    actionHubTitle: "Escolha a sua próxima decisão financeira",
    actionHubDescription:
      "Use o dashboard como motor de decisão: comece com uma ação, compare a shortlist e abra o fornecedor apenas quando o encaixe estiver claro.",
    starterActions: {
      cards: {
        title: "Encontrar o melhor cartão",
        description: "Comece com cartões sem anuidade e bons para viagens no seu mercado.",
      },
      loans: {
        title: "Encontrar o melhor empréstimo",
        description: "Veja primeiro opções com menor custo e decisão rápida.",
      },
      transfers: {
        title: "Enviar dinheiro para o estrangeiro",
        description: "Compare valor recebido, comissões e velocidade lado a lado.",
      },
    },
    recommendedForStart: "Top 3 produtos para começar",
    recommendedForStartDescription:
      "Uma shortlist simples para a primeira decisão se ainda não guardou nem viu nada.",
    bestNoFeeCards: "Melhores cartões sem anuidade na sua região",
    bestNoFeeCardsDescription:
      "Boas primeiras escolhas se quiser começar com cartões de baixo custo.",
    personalizedRecommendations: "Recomendado para si",
    personalizedRecommendationsDescription:
      "Ideias personalizadas com base nas ofertas guardadas, vistas recentes e mercado atual.",
    bestForPrefix: "Melhor para",
    decisionSections: {
      topPicks: "Top picks para si",
      bestForProfile: "Melhor para o seu perfil",
      cheapest: "Opção mais barata",
      fastest: "Aprovação mais rápida",
    },
    smartFilters: "Filtros inteligentes",
    smartFilterLabels: {
      noAnnualFee: "Sem anuidade",
      instantApproval: "Aprovação instantânea",
      highLimit: "Limite elevado",
      cryptoFriendly: "Crypto friendly",
    },
    compareTopThree: "Comparar top 3",
    comparisonTitle: "Comparar as principais opções",
    comparisonDescription:
      "Use uma comparação rápida antes de abrir os detalhes do fornecedor.",
    comparisonColumns: {
      apr: "APR",
      fees: "Comissões",
      speed: "Velocidade",
      approval: "Aprovação",
      limits: "Limites",
    },
    filteredEmptyTitle: "Ainda não há ofertas para estes filtros",
    filteredEmptyDescription:
      "Alargue os filtros ou comece pelos top picks para deixar a Payn orientar o próximo passo.",
    clearFilters: "Limpar filtros",
    startWithTopPicks: "Começar pelos top picks",
    transferToolEyebrow: "Ferramenta de transferências",
    transferToolTitle: "Veja quanto o destinatário recebe",
    exchangeToolTitle: "Veja quem oferece o melhor resultado cambial",
    calculatorDescription:
      "Introduza um valor e compare fornecedores por valor recebido, custo e velocidade.",
    amountLabel: "Valor",
    fromLabel: "De",
    toLabel: "Para",
    recipientGets: "O destinatário recebe",
    bestRate: "Melhor taxa",
    fastest: "Mais rápido",
    lowestFee: "Menor comissão",
    expandAsset: "Abrir vista do ativo",
  },
};

export function getDashboardDecisionCopy(locale: MarketplaceLocale) {
  return copy[locale] ?? copy.en;
}
