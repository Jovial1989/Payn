import type { MarketplaceLocale } from "@payn/types";
import type {
  MarketAssetKind,
  MarketIntelligenceDirection,
  MarketInsightTone,
} from "@/lib/market-intelligence";

type MarketCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  pulseTitle: string;
  pulseBody: string;
  fearGreedTitle: string;
  trendTitle: string;
  trendBody: string;
  availableTitle: string;
  availableBody: string;
  recommendationTitle: string;
  recommendationBody: string;
  providerDetails: string;
  loading: string;
  retrying: string;
  delayed: string;
  live: string;
  unavailable: string;
  unavailableBody: string;
  insightLabels: {
    momentum: string;
    volatility: string;
    relativeTrend: string;
    summary: string;
  };
  valueLabels: {
    positive: string;
    neutral: string;
    cautious: string;
    low: string;
    medium: string;
    high: string;
    aboveAverage: string;
    nearAverage: string;
    belowAverage: string;
  };
  source: {
    live: (source: string) => string;
    delayed: (source: string) => string;
  };
};

const copy: Record<MarketplaceLocale, MarketCopy> = {
  en: {
    eyebrow: "Market intelligence",
    title: "Trend-aware context for long-term allocation",
    subtitle:
      "Track market pulse, recent momentum, and which Payn providers can help you access the theme.",
    pulseTitle: "Market pulse",
    pulseBody: "A live or delayed snapshot depending on market-data availability.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Trend insight",
    trendBody: "Short signals generated from recent price movement.",
    availableTitle: "Available through",
    availableBody: "Providers in Payn that can be used to access this market or theme.",
    recommendationTitle: "Useful context",
    recommendationBody: "Soft guidance only. Not financial advice.",
    providerDetails: "View provider",
    loading: "Loading market pulse…",
    retrying: "Refreshing with a delayed snapshot.",
    delayed: "Delayed snapshot",
    live: "Live market data",
    unavailable: "Data unavailable",
    unavailableBody: "Market data temporarily unavailable. Try again shortly.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatility",
      relativeTrend: "Relative trend",
      summary: "Short summary",
    },
    valueLabels: {
      positive: "Positive",
      neutral: "Neutral",
      cautious: "Cautious",
      low: "Low",
      medium: "Medium",
      high: "High",
      aboveAverage: "Above 7-day average",
      nearAverage: "Near 7-day average",
      belowAverage: "Below 7-day average",
    },
    source: {
      live: (source) => `Live via ${source}`,
      delayed: (source) => `Delayed via ${source}`,
    },
  },
  de: {
    eyebrow: "Marktintelligenz",
    title: "Trendbewusster Kontext für langfristige Allokation",
    subtitle:
      "Beobachte Marktpuls, Momentum und welche Payn-Anbieter Zugang zu diesem Thema bieten.",
    pulseTitle: "Marktpuls",
    pulseBody: "Live oder verzögert, je nach Verfügbarkeit der Marktdaten.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Trend-Signale",
    trendBody: "Kurze Hinweise auf Basis der jüngsten Preisbewegung.",
    availableTitle: "Verfügbar über",
    availableBody: "Anbieter in Payn, über die du dieses Marktsegment erreichen kannst.",
    recommendationTitle: "Nützlicher Kontext",
    recommendationBody: "Nur weiche Orientierung. Keine Anlageberatung.",
    providerDetails: "Anbieter öffnen",
    loading: "Marktpuls wird geladen…",
    retrying: "Es wird eine verzögerte Momentaufnahme geladen.",
    delayed: "Verzögerte Momentaufnahme",
    live: "Live-Marktdaten",
    unavailable: "Daten nicht verfügbar",
    unavailableBody: "Marktdaten sind vorübergehend nicht verfügbar. Bitte versuche es in Kürze erneut.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatilität",
      relativeTrend: "Relativer Trend",
      summary: "Kurzfazit",
    },
    valueLabels: {
      positive: "Positiv",
      neutral: "Neutral",
      cautious: "Vorsichtig",
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      aboveAverage: "Über dem 7-Tage-Durchschnitt",
      nearAverage: "Nahe dem 7-Tage-Durchschnitt",
      belowAverage: "Unter dem 7-Tage-Durchschnitt",
    },
    source: {
      live: (source) => `Live über ${source}`,
      delayed: (source) => `Verzögert über ${source}`,
    },
  },
  es: {
    eyebrow: "Inteligencia de mercado",
    title: "Contexto con tendencia para asignación a largo plazo",
    subtitle:
      "Sigue el pulso del mercado, el momentum reciente y qué proveedores de Payn ofrecen acceso a este tema.",
    pulseTitle: "Pulso del mercado",
    pulseBody: "Instantánea en vivo o con retraso según la disponibilidad de datos.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Señales de tendencia",
    trendBody: "Señales breves generadas a partir del movimiento reciente del precio.",
    availableTitle: "Disponible a través de",
    availableBody: "Proveedores en Payn que pueden darte acceso a este mercado o temática.",
    recommendationTitle: "Contexto útil",
    recommendationBody: "Orientación suave únicamente. No es asesoramiento financiero.",
    providerDetails: "Ver proveedor",
    loading: "Cargando pulso del mercado…",
    retrying: "Actualizando con una instantánea retrasada.",
    delayed: "Instantánea retrasada",
    live: "Datos en vivo",
    unavailable: "Datos no disponibles",
    unavailableBody: "Los datos de mercado no están disponibles temporalmente. Vuelve a intentarlo en breve.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatilidad",
      relativeTrend: "Tendencia relativa",
      summary: "Resumen breve",
    },
    valueLabels: {
      positive: "Positivo",
      neutral: "Neutral",
      cautious: "Cauto",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      aboveAverage: "Por encima de la media de 7 días",
      nearAverage: "Cerca de la media de 7 días",
      belowAverage: "Por debajo de la media de 7 días",
    },
    source: {
      live: (source) => `En vivo vía ${source}`,
      delayed: (source) => `Retrasado vía ${source}`,
    },
  },
  fr: {
    eyebrow: "Intelligence de marché",
    title: "Contexte orienté tendance pour une allocation long terme",
    subtitle:
      "Suivez le pouls du marché, le momentum récent et les fournisseurs Payn permettant d’y accéder.",
    pulseTitle: "Pouls du marché",
    pulseBody: "Instantané en direct ou différé selon la disponibilité des données.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Signaux de tendance",
    trendBody: "Signaux courts générés à partir des récents mouvements de prix.",
    availableTitle: "Disponible via",
    availableBody: "Fournisseurs présents sur Payn permettant d’accéder à ce marché ou thème.",
    recommendationTitle: "Contexte utile",
    recommendationBody: "Orientation légère uniquement. Pas un conseil financier.",
    providerDetails: "Voir le fournisseur",
    loading: "Chargement du pouls du marché…",
    retrying: "Actualisation avec un instantané différé.",
    delayed: "Instantané différé",
    live: "Données en direct",
    unavailable: "Données indisponibles",
    unavailableBody: "Les données de marché sont temporairement indisponibles. Réessayez dans un instant.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatilité",
      relativeTrend: "Tendance relative",
      summary: "Résumé court",
    },
    valueLabels: {
      positive: "Positif",
      neutral: "Neutre",
      cautious: "Prudent",
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      aboveAverage: "Au-dessus de la moyenne 7 jours",
      nearAverage: "Proche de la moyenne 7 jours",
      belowAverage: "Sous la moyenne 7 jours",
    },
    source: {
      live: (source) => `En direct via ${source}`,
      delayed: (source) => `Différé via ${source}`,
    },
  },
  it: {
    eyebrow: "Market intelligence",
    title: "Contesto guidato dal trend per allocazione di lungo periodo",
    subtitle:
      "Monitora market pulse, momentum recente e quali provider Payn possono dare accesso a questo tema.",
    pulseTitle: "Market pulse",
    pulseBody: "Snapshot live o ritardata in base alla disponibilità dei dati di mercato.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Segnali di trend",
    trendBody: "Indicazioni brevi generate dal recente movimento dei prezzi.",
    availableTitle: "Disponibile tramite",
    availableBody: "Provider presenti su Payn che possono dare accesso a questo mercato o tema.",
    recommendationTitle: "Contesto utile",
    recommendationBody: "Indicazioni leggere soltanto. Non è consulenza finanziaria.",
    providerDetails: "Apri provider",
    loading: "Caricamento del market pulse…",
    retrying: "Aggiornamento con snapshot ritardata.",
    delayed: "Snapshot ritardata",
    live: "Dati live",
    unavailable: "Dati non disponibili",
    unavailableBody: "I dati di mercato non sono temporaneamente disponibili. Riprova tra poco.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatilità",
      relativeTrend: "Trend relativo",
      summary: "Sintesi breve",
    },
    valueLabels: {
      positive: "Positivo",
      neutral: "Neutrale",
      cautious: "Cauto",
      low: "Bassa",
      medium: "Media",
      high: "Alta",
      aboveAverage: "Sopra la media a 7 giorni",
      nearAverage: "Vicino alla media a 7 giorni",
      belowAverage: "Sotto la media a 7 giorni",
    },
    source: {
      live: (source) => `Live via ${source}`,
      delayed: (source) => `Ritardato via ${source}`,
    },
  },
  pt: {
    eyebrow: "Inteligência de mercado",
    title: "Contexto orientado por tendência para alocação de longo prazo",
    subtitle:
      "Acompanhe o pulso do mercado, o momentum recente e quais provedores Payn dão acesso a este tema.",
    pulseTitle: "Pulso do mercado",
    pulseBody: "Snapshot em tempo real ou atrasado conforme a disponibilidade dos dados.",
    fearGreedTitle: "Fear & Greed",
    trendTitle: "Sinais de tendência",
    trendBody: "Sinais curtos gerados a partir do movimento recente de preços.",
    availableTitle: "Disponível através de",
    availableBody: "Provedores na Payn que podem dar acesso a este mercado ou tema.",
    recommendationTitle: "Contexto útil",
    recommendationBody: "Orientação leve apenas. Não é aconselhamento financeiro.",
    providerDetails: "Ver provedor",
    loading: "A carregar o pulso do mercado…",
    retrying: "A atualizar com snapshot atrasado.",
    delayed: "Snapshot atrasado",
    live: "Dados em tempo real",
    unavailable: "Dados indisponíveis",
    unavailableBody: "Os dados de mercado estão temporariamente indisponíveis. Tente novamente daqui a pouco.",
    insightLabels: {
      momentum: "Momentum",
      volatility: "Volatilidade",
      relativeTrend: "Tendência relativa",
      summary: "Resumo curto",
    },
    valueLabels: {
      positive: "Positivo",
      neutral: "Neutro",
      cautious: "Cauteloso",
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      aboveAverage: "Acima da média de 7 dias",
      nearAverage: "Perto da média de 7 dias",
      belowAverage: "Abaixo da média de 7 dias",
    },
    source: {
      live: (source) => `Ao vivo via ${source}`,
      delayed: (source) => `Atrasado via ${source}`,
    },
  },
};

export function getMarketIntelligenceCopy(locale: MarketplaceLocale) {
  return copy[locale] ?? copy.en;
}

export function getLocalizedInsightValue(
  locale: MarketplaceLocale,
  kind: "momentum" | "volatility" | "relativeTrend",
  tone: MarketInsightTone,
) {
  const dictionary = getMarketIntelligenceCopy(locale);

  if (kind === "volatility") {
    return tone === "positive"
      ? dictionary.valueLabels.low
      : tone === "neutral"
        ? dictionary.valueLabels.medium
        : dictionary.valueLabels.high;
  }

  if (kind === "relativeTrend") {
    return tone === "positive"
      ? dictionary.valueLabels.aboveAverage
      : tone === "neutral"
        ? dictionary.valueLabels.nearAverage
        : dictionary.valueLabels.belowAverage;
  }

  return tone === "positive"
    ? dictionary.valueLabels.positive
    : tone === "neutral"
      ? dictionary.valueLabels.neutral
      : dictionary.valueLabels.cautious;
}

export function getLocalizedSummary(
  locale: MarketplaceLocale,
  assetLabel: string,
  direction: MarketIntelligenceDirection,
  tone: MarketInsightTone,
) {
  if (locale === "de") {
    if (tone === "positive") {
      return `${assetLabel} hält sich über dem jüngsten Durchschnitt und zeigt konstruktives Kurzfrist-Momentum.`;
    }
    if (tone === "caution") {
      return `${assetLabel} zeigt weichere Trendbedingungen, daher kann eine schrittweise Allokation sinnvoller sein als Timing.`;
    }
    return `${assetLabel} bewegt sich in einer gemischten Phase, daher sind Zugangskosten und Diversifikation wichtiger als Timing.`;
  }

  if (locale === "es") {
    if (tone === "positive") {
      return `${assetLabel} se mantiene por encima de su media reciente y conserva un momentum constructivo.`;
    }
    if (tone === "caution") {
      return `${assetLabel} muestra una tendencia más débil, por lo que una asignación gradual puede encajar mejor que el timing.`;
    }
    return `${assetLabel} se mueve en una fase mixta, así que pesan más la diversificación y los costes de acceso que el timing.`;
  }

  if (locale === "fr") {
    if (tone === "positive") {
      return `${assetLabel} reste au-dessus de sa moyenne récente avec un momentum court terme constructif.`;
    }
    if (tone === "caution") {
      return `${assetLabel} évolue avec une tendance plus fragile, ce qui favorise davantage une allocation progressive qu’un timing serré.`;
    }
    return `${assetLabel} traverse une phase plus mixte, où la diversification et le coût d’accès comptent plus que le timing.`;
  }

  if (locale === "it") {
    if (tone === "positive") {
      return `${assetLabel} resta sopra la sua media recente e mantiene un momentum costruttivo nel breve periodo.`;
    }
    if (tone === "caution") {
      return `${assetLabel} mostra condizioni di trend più deboli, quindi un’allocazione graduale può essere più adatta del market timing.`;
    }
    return `${assetLabel} si muove in una fase mista, quindi costi di accesso e diversificazione contano più del timing.`;
  }

  if (locale === "pt") {
    if (tone === "positive") {
      return `${assetLabel} mantém-se acima da média recente e mostra momentum construtivo no curto prazo.`;
    }
    if (tone === "caution") {
      return `${assetLabel} apresenta uma tendência mais fraca, por isso uma alocação faseada pode ser mais adequada do que tentar acertar no timing.`;
    }
    return `${assetLabel} está numa fase mais mista, por isso diversificação e custo de acesso importam mais do que timing.`;
  }

  if (tone === "positive") {
    return `${assetLabel} is holding above its recent average with constructive short-term momentum.`;
  }

  if (tone === "caution") {
    return direction === "down"
      ? `${assetLabel} is showing softer trend conditions, so a slower allocation approach may fit better than short-term timing.`
      : `${assetLabel} is showing higher-risk conditions, so pacing and diversification matter more than timing.`;
  }

  return `${assetLabel} is moving in a mixed range, so access costs and diversification matter more than short-term timing.`;
}

export function getLocalizedRecommendations(
  locale: MarketplaceLocale,
  kind: MarketAssetKind,
  volatilityTone: MarketInsightTone,
) {
  if (locale === "de") {
    if (kind === "crypto") {
      return [
        "Eher geeignet als volatilere Beimischung neben einem breiteren Kernportfolio.",
        "Meist besser für schrittweise Allokation als für kurzfristiges Timing.",
        "Bei höherer Volatilität ist Diversifikation oft wichtiger als Konzentration.",
      ];
    }
    if (kind === "commodity") {
      return [
        "Nützlich eher als Diversifikationsbaustein als als vollständige Kernallokation.",
        "Kann sich anders verhalten als breite Aktien-ETFs in Stressphasen.",
        "Vergleiche Plattformkosten und ETF-Zugang, bevor du dich für einen Anbieter entscheidest.",
      ];
    }
    if (kind === "fx") {
      return [
        "Volatiler als klassische Sparprodukte oder Cash-Alternativen.",
        "Eher geeignet für makrogetriebene Allokation als für kurzfristiges Timing.",
        "Vergleiche Spreads und Marktzugang über Anbieter hinweg.",
      ];
    }

    return [
      "Geeignet für diversifizierten Marktzugang innerhalb einer langfristigen Allokation.",
      "Meist besser für stetige Beiträge als für kurzes Markttiming.",
      volatilityTone === "caution"
        ? "Die Schwankung liegt aktuell höher als üblich, also hilft eine ruhigere Allokation."
        : "Vergleiche Gebühren, Marktzugang und Sparplan-Unterstützung vor der Auswahl eines Anbieters.",
    ];
  }

  if (locale === "es") {
    if (kind === "crypto") {
      return [
        "Más adecuado como exposición satélite de mayor volatilidad junto a una cartera más amplia.",
        "Normalmente encaja mejor en asignación gradual que en timing de corto plazo.",
        "Cuando la volatilidad sube, diversificar suele importar más que concentrar.",
      ];
    }
    if (kind === "commodity") {
      return [
        "Útil más como capa de diversificación que como asignación principal.",
        "Puede comportarse distinto a los ETF de renta variable amplia en entornos de riesgo.",
        "Compara costes de plataforma y acceso a ETF antes de elegir proveedor.",
      ];
    }
    if (kind === "fx") {
      return [
        "Más volátil que productos de ahorro o efectivo.",
        "Mejor para exposición macro que para timing de corto plazo.",
        "Compara spreads y acceso al mercado entre proveedores.",
      ];
    }

    return [
      "Adecuado para exposición diversificada al mercado dentro de una asignación a largo plazo.",
      "Suele encajar mejor con aportaciones constantes que con timing de corto plazo.",
      volatilityTone === "caution"
        ? "La volatilidad está por encima de lo normal, así que conviene un ritmo de asignación más gradual."
        : "Compara comisiones, acceso a mercados y planes periódicos antes de elegir proveedor.",
    ];
  }

  if (locale === "fr") {
    if (kind === "crypto") {
      return [
        "Convient davantage comme exposition satellite plus volatile autour d’un portefeuille plus large.",
        "Souvent mieux adapté à une allocation progressive qu’au timing court terme.",
        "Quand la volatilité monte, la diversification compte généralement plus que la concentration.",
      ];
    }
    if (kind === "commodity") {
      return [
        "Utile davantage comme poche de diversification que comme allocation cœur.",
        "Peut évoluer différemment des ETF actions larges en phase de stress.",
        "Comparez les coûts de plateforme et l’accès ETF avant de choisir un fournisseur.",
      ];
    }
    if (kind === "fx") {
      return [
        "Plus volatil que les produits d’épargne ou les alternatives cash.",
        "Mieux adapté à une exposition macro qu’au timing court terme.",
        "Comparez spreads et accès au marché selon les fournisseurs.",
      ];
    }

    return [
      "Adapté à une exposition diversifiée au marché dans une allocation long terme.",
      "Convient généralement mieux à des versements réguliers qu’au timing court terme.",
      volatilityTone === "caution"
        ? "La volatilité est au-dessus de la normale, donc une allocation plus progressive peut être préférable."
        : "Comparez frais, accès marché et plans programmés avant de choisir un fournisseur.",
    ];
  }

  if (locale === "it") {
    if (kind === "crypto") {
      return [
        "Più adatto come esposizione satellite ad alta volatilità accanto a un portafoglio più ampio.",
        "Di solito è più adatto a un’allocazione graduale che al timing di breve periodo.",
        "Quando la volatilità sale, la diversificazione conta più della concentrazione.",
      ];
    }
    if (kind === "commodity") {
      return [
        "Utile più come componente di diversificazione che come allocazione principale.",
        "Può comportarsi in modo diverso dagli ETF azionari ampi nelle fasi risk-off.",
        "Confronta costi di piattaforma e accesso agli ETF prima di scegliere il provider.",
      ];
    }
    if (kind === "fx") {
      return [
        "Più volatile rispetto a prodotti di risparmio o alternative cash.",
        "Meglio adatto a esposizione macro che al timing di breve periodo.",
        "Confronta spread e accesso al mercato tra i provider.",
      ];
    }

    return [
      "Adatto a un’esposizione di mercato diversificata in un’allocazione di lungo periodo.",
      "Di solito funziona meglio con contributi costanti che con timing di breve periodo.",
      volatilityTone === "caution"
        ? "La volatilità è sopra la norma, quindi un ritmo di allocazione più graduale può essere preferibile."
        : "Confronta commissioni, accesso ai mercati e piani ricorrenti prima di scegliere il provider.",
    ];
  }

  if (locale === "pt") {
    if (kind === "crypto") {
      return [
        "Mais adequado como exposição satélite de maior volatilidade ao lado de uma carteira mais ampla.",
        "Normalmente encaixa melhor em alocação faseada do que em timing de curto prazo.",
        "Quando a volatilidade aumenta, a diversificação tende a importar mais do que a concentração.",
      ];
    }
    if (kind === "commodity") {
      return [
        "Útil mais como componente de diversificação do que como alocação principal.",
        "Pode comportar-se de forma diferente dos ETF de ações amplas em fases de aversão ao risco.",
        "Compare custos da plataforma e acesso a ETF antes de escolher um provedor.",
      ];
    }
    if (kind === "fx") {
      return [
        "Mais volátil do que produtos de poupança ou alternativas em cash.",
        "Melhor para exposição macro do que para timing de curto prazo.",
        "Compare spreads e acesso ao mercado entre provedores.",
      ];
    }

    return [
      "Adequado para exposição diversificada ao mercado numa alocação de longo prazo.",
      "Normalmente funciona melhor com contribuições regulares do que com timing de curto prazo.",
      volatilityTone === "caution"
        ? "A volatilidade está acima do normal, por isso um ritmo de alocação mais gradual pode ser mais adequado."
        : "Compare comissões, acesso a mercado e planos recorrentes antes de escolher um provedor.",
    ];
  }

  if (kind === "crypto") {
    return [
      "Suitable for higher-volatility satellite exposure around a broader portfolio.",
      "Better suited for phased allocation than short-term timing.",
      "When volatility rises, diversification usually matters more than concentration.",
    ];
  }

  if (kind === "commodity") {
    return [
      "Useful as a diversification sleeve rather than a full core allocation.",
      "Can behave differently from broad-market ETFs during risk-off periods.",
      "Compare provider costs and ETF access before choosing a route.",
    ];
  }

  if (kind === "fx") {
    return [
      "Higher volatility than cash savings products or simple cash alternatives.",
      "Better suited for macro-led exposure than short-term timing.",
      "Compare spreads and market access across providers before deciding.",
    ];
  }

  return [
    "Suitable for diversified market exposure within a long-term allocation.",
    "Better suited for steady contributions than short-term timing.",
    volatilityTone === "caution"
      ? "Volatility is running above normal, so pacing matters more than chasing momentum."
      : "Compare provider fees, market access, and savings-plan support before choosing.",
  ];
}

export function getProviderSuitabilityNote(
  locale: MarketplaceLocale,
  providerName: string,
  kind: MarketAssetKind,
) {
  const isCrypto = kind === "crypto";

  if (locale === "de") {
    switch (providerName) {
      case "Trade Republic":
        return "Gut geeignet für ETF-basierte, langfristige Allokation mit Sparplänen.";
      case "Scalable Capital":
        return "Stark für wiederkehrenden Portfolioaufbau und breite ETF-Abdeckung.";
      case "DEGIRO":
        return "Nützlich für breiteren Zugang zu börsennotierten Märkten.";
      case "eToro":
        return isCrypto
          ? "Nützlich, wenn du Krypto neben anderen Anlageklassen in einem Konto halten willst."
          : "Nützlich für Multi-Asset-Zugang in einem Konto.";
      case "Bitpanda":
        return "Nützlich für eurobasierten Krypto-Zugang und wiederkehrende Käufe.";
      case "Coinbase":
        return "Besser geeignet für unkomplizierten Zugang zu großen Krypto-Assets.";
      default:
        return "Vergleiche Gebühren, Zugang und Produktbreite, bevor du weitergehst.";
    }
  }

  if (locale === "es") {
    switch (providerName) {
      case "Trade Republic":
        return "Adecuado para asignación de largo plazo basada en ETF y planes periódicos.";
      case "Scalable Capital":
        return "Útil para construir cartera con aportaciones recurrentes y acceso ETF amplio.";
      case "DEGIRO":
        return "Útil para acceso más amplio a mercados cotizados.";
      case "eToro":
        return isCrypto
          ? "Útil si quieres mantener cripto junto con otras clases de activos en una sola cuenta."
          : "Útil para acceso multi-activo en una sola cuenta.";
      case "Bitpanda":
        return "Útil para acceso a cripto en euros y compras recurrentes.";
      case "Coinbase":
        return "Más adecuado para acceso sencillo a los principales criptoactivos.";
      default:
        return "Compara comisiones, acceso y amplitud del producto antes de continuar.";
    }
  }

  if (locale === "fr") {
    switch (providerName) {
      case "Trade Republic":
        return "Adapté à une allocation long terme via ETF et plans programmés.";
      case "Scalable Capital":
        return "Utile pour construire un portefeuille avec versements récurrents et large accès ETF.";
      case "DEGIRO":
        return "Utile pour un accès plus large aux marchés cotés.";
      case "eToro":
        return isCrypto
          ? "Utile si vous voulez garder la crypto aux côtés d’autres classes d’actifs dans un seul compte."
          : "Utile pour un accès multi-actifs dans un seul compte.";
      case "Bitpanda":
        return "Utile pour un accès crypto en euros et des achats récurrents.";
      case "Coinbase":
        return "Mieux adapté à un accès simple aux principaux cryptoactifs.";
      default:
        return "Comparez frais, accès et largeur produit avant de continuer.";
    }
  }

  if (locale === "it") {
    switch (providerName) {
      case "Trade Republic":
        return "Adatto ad allocazione di lungo periodo tramite ETF e piani ricorrenti.";
      case "Scalable Capital":
        return "Utile per costruire portafoglio con contributi ricorrenti e ampia copertura ETF.";
      case "DEGIRO":
        return "Utile per accesso più ampio ai mercati quotati.";
      case "eToro":
        return isCrypto
          ? "Utile se vuoi tenere crypto insieme ad altre asset class in un solo conto."
          : "Utile per accesso multi-asset in un unico conto.";
      case "Bitpanda":
        return "Utile per accesso crypto in euro e acquisti ricorrenti.";
      case "Coinbase":
        return "Più adatto per accesso semplice ai principali crypto asset.";
      default:
        return "Confronta commissioni, accesso e ampiezza dell’offerta prima di procedere.";
    }
  }

  if (locale === "pt") {
    switch (providerName) {
      case "Trade Republic":
        return "Adequado para alocação de longo prazo com ETF e planos recorrentes.";
      case "Scalable Capital":
        return "Útil para construir carteira com contribuições recorrentes e ampla cobertura de ETF.";
      case "DEGIRO":
        return "Útil para acesso mais amplo a mercados cotados.";
      case "eToro":
        return isCrypto
          ? "Útil se quiser manter cripto ao lado de outras classes de ativos numa única conta."
          : "Útil para acesso multiativo numa só conta.";
      case "Bitpanda":
        return "Útil para acesso a cripto em euros e compras recorrentes.";
      case "Coinbase":
        return "Mais adequado para acesso simples aos principais criptoativos.";
      default:
        return "Compare comissões, acesso e amplitude do produto antes de avançar.";
    }
  }

  switch (providerName) {
    case "Trade Republic":
      return "Useful for ETF-led long-term allocation and simple recurring plans.";
    case "Scalable Capital":
      return "Useful for recurring portfolio building with broad ETF access.";
    case "DEGIRO":
      return "Better suited for broader listed-market access.";
    case "eToro":
      return isCrypto
        ? "Useful if you want crypto alongside other asset classes in one account."
        : "Useful for multi-asset access in one account.";
    case "Bitpanda":
      return "Useful for euro-based crypto access and recurring buys.";
    case "Coinbase":
      return "Better suited for straightforward access to major crypto assets.";
    default:
      return "Compare fees, access, and product breadth before you continue.";
  }
}
