export interface ProviderBrand {
  mark: string;
  bg: string;
  text: string;
  websiteUrl: string;
  logoPath?: string;
  logoScale?: number;
  logoTranslateY?: number;
  logoPlateColor?: string;
  logoPlateBorderColor?: string;
  logoImageClassName?: string;
}

function defineBrand(
  mark: string,
  bg: string,
  text: string,
  websiteUrl: string,
  extra: Partial<ProviderBrand> = {},
): ProviderBrand {
  return {
    mark,
    bg,
    text,
    websiteUrl,
    ...extra,
  };
}

const brands: Record<string, ProviderBrand> = {
  Revolut: defineBrand("R", "#17181C", "#FFFFFF", "https://www.revolut.com", {
    logoPath: "/logos/revolut.svg",
    logoScale: 0.88,
    logoPlateColor: "#FFFFFF",
  }),
  Wise: defineBrand("W", "#9FE870", "#163300", "https://wise.com", {
    logoPath: "/logos/wise.svg",
    logoScale: 0.9,
    logoPlateColor: "#F5F7F6",
  }),
  N26: defineBrand("N26", "#2F8F7D", "#FFFFFF", "https://n26.com", {
    logoPath: "/logos/n26.svg",
    logoScale: 0.92,
    logoPlateColor: "#FFFFFF",
  }),
  Klarna: defineBrand("K", "#FFB3C7", "#17120F", "https://www.klarna.com/international/", {
    logoPath: "/logos/klarna.svg",
    logoScale: 0.84,
    logoPlateColor: "#F6F7F8",
  }),
  Auxmoney: defineBrand("AM", "#B3005C", "#FFFFFF", "https://www.auxmoney.com", {
    logoPath: "/logos/auxmoney.svg",
    logoScale: 0.84,
    logoPlateColor: "#F6F7F8",
  }),
  bunq: defineBrand("bq", "#00B7A8", "#FFFFFF", "https://www.bunq.com"),
  Curve: defineBrand("CV", "#1C2142", "#FFFFFF", "https://www.curve.com"),
  Zopa: defineBrand("Z", "#432072", "#FFFFFF", "https://www.zopa.com"),
  Monese: defineBrand("M", "#00B9AE", "#FFFFFF", "https://monese.com"),
  ING: defineBrand("ING", "#FF6200", "#FFFFFF", "https://www.ing.com"),
  Santander: defineBrand("S", "#EC0000", "#FFFFFF", "https://www.santander.com", {
    logoPath: "/logos/santander.svg",
    logoScale: 0.84,
    logoPlateColor: "#F7F7F8",
  }),
  BBVA: defineBrand("BB", "#004481", "#FFFFFF", "https://www.bbva.com"),
  "Deutsche Bank": defineBrand("DB", "#001E50", "#FFFFFF", "https://www.deutsche-bank.de"),
  "BNP Paribas": defineBrand("BNP", "#00915A", "#FFFFFF", "https://group.bnpparibas/en/", {
    logoPath: "/logos/bnp-paribas.svg",
    logoScale: 0.86,
    logoPlateColor: "#F7F7F8",
  }),
  Barclays: defineBrand("BC", "#00AEEF", "#FFFFFF", "https://www.barclays.co.uk"),
  Barclaycard: defineBrand("BC", "#00AEEF", "#FFFFFF", "https://www.barclaycard.co.uk"),
  "ABN AMRO": defineBrand("ABN", "#004832", "#FFD200", "https://www.abnamro.nl"),
  UniCredit: defineBrand("UC", "#E01A22", "#FFFFFF", "https://www.unicreditgroup.eu"),
  XE: defineBrand("XE", "#153260", "#FFFFFF", "https://www.xe.com"),
  Remitly: defineBrand("R", "#4B248B", "#FFFFFF", "https://www.remitly.com"),
  Payoneer: defineBrand("P", "#FF4800", "#FFFFFF", "https://www.payoneer.com"),
  Rabobank: defineBrand("RB", "#F29100", "#FFFFFF", "https://www.rabobank.com"),
  WorldRemit: defineBrand("WR", "#6B2D8B", "#FFFFFF", "https://www.worldremit.com"),
  CurrencyFair: defineBrand("CF", "#1A936F", "#FFFFFF", "https://www.currencyfair.com"),
  "Interactive Brokers": defineBrand("IB", "#D41F28", "#FFFFFF", "https://www.interactivebrokers.com"),
  "Western Union": defineBrand("WU", "#FFD100", "#111111", "https://www.westernunion.com"),
  Allianz: defineBrand("AZ", "#003781", "#FFFFFF", "https://www.allianz.com"),
  "Allianz Care": defineBrand("AC", "#003781", "#FFFFFF", "https://www.allianzcare.com"),
  AXA: defineBrand("AXA", "#0C1C8C", "#FFFFFF", "https://www.axa.com"),
  Alan: defineBrand("AL", "#0C6CFF", "#FFFFFF", "https://alan.com"),
  Admiral: defineBrand("AD", "#CF102D", "#FFFFFF", "https://www.admiral.com"),
  Generali: defineBrand("GN", "#B62025", "#FFFFFF", "https://www.generali.com"),
  SafetyWing: defineBrand("SW", "#1D4ED8", "#FFFFFF", "https://safetywing.com"),
  "Trade Republic": defineBrand("TR", "#101010", "#FFFFFF", "https://traderepublic.com"),
  "Scalable Capital": defineBrand("SC", "#1D3B6A", "#FFFFFF", "https://de.scalable.capital"),
  Smava: defineBrand("SM", "#7CC242", "#0E2C08", "https://www.smava.de", {
    logoPath: "/logos/smava.svg",
    logoScale: 0.84,
    logoPlateColor: "#F7F7F8",
  }),
  eToro: defineBrand("eT", "#6CC24A", "#0B1307", "https://www.etoro.com"),
  DEGIRO: defineBrand("DG", "#123A2B", "#FFFFFF", "https://www.degiro.com"),
  Bitpanda: defineBrand("BP", "#17C964", "#052A17", "https://www.bitpanda.com"),
  Coinbase: defineBrand("CB", "#0052FF", "#FFFFFF", "https://www.coinbase.com", {
    logoPath: "/logos/coinbase.svg",
    logoScale: 0.94,
    logoPlateColor: "#FFFFFF",
  }),
  "Binance EU": defineBrand("BN", "#F0B90B", "#111111", "https://www.binance.com"),
  Kraken: defineBrand("K", "#5B5DE8", "#FFFFFF", "https://www.kraken.com"),
  "Trading 212": defineBrand("T212", "#168B5B", "#FFFFFF", "https://www.trading212.com"),
  Saxo: defineBrand("SX", "#0C7A6A", "#FFFFFF", "https://www.home.saxo"),
  "Bupa Global": defineBrand("BG", "#002F6C", "#FFFFFF", "https://www.bupaglobal.com"),
  Cardif: defineBrand("CD", "#0D5CAB", "#FFFFFF", "https://www.bnpparibascardif.com"),
  "Cigna Global": defineBrand("CG", "#006A8E", "#FFFFFF", "https://www.cignaglobal.com"),
  ERGO: defineBrand("ER", "#6A00FF", "#FFFFFF", "https://www.ergo.com"),
  Genki: defineBrand("GK", "#FF7A00", "#FFFFFF", "https://genki.world"),
  Heymondo: defineBrand("HM", "#00A98F", "#FFFFFF", "https://heymondo.com"),
  "Insured Nomads": defineBrand("IN", "#264E8B", "#FFFFFF", "https://insurednomads.com"),
  "Orange Protect": defineBrand("OP", "#FF7900", "#111111", "https://www.orange.com"),
  PassportCard: defineBrand("PC", "#00B7A8", "#FFFFFF", "https://www.passportcard.com"),
  "World Nomads": defineBrand("WN", "#192C6A", "#FFFFFF", "https://www.worldnomads.com"),
  Zurich: defineBrand("ZU", "#006BB6", "#FFFFFF", "https://www.zurich.com"),
  MoneyGram: defineBrand("MG", "#E31837", "#FFFFFF", "https://www.moneygram.com"),
  PaySend: defineBrand("PS", "#0B57D0", "#FFFFFF", "https://paysend.com"),
  Paysera: defineBrand("PY", "#00A0DF", "#FFFFFF", "https://www.paysera.com"),
  Skrill: defineBrand("SK", "#862165", "#FFFFFF", "https://www.skrill.com"),
  OFX: defineBrand("OFX", "#182D55", "#FFFFFF", "https://www.ofx.com"),
  "Atlantic Money": defineBrand("AM", "#101828", "#FFFFFF", "https://atlantic.money"),
  Monzo: defineBrand("MZ", "#FF5A3C", "#FFFFFF", "https://monzo.com"),
  "Starling Bank": defineBrand("SB", "#5F2C8A", "#FFFFFF", "https://www.starlingbank.com"),
  Lunar: defineBrand("LU", "#2D2A4A", "#FFFFFF", "https://lunar.app"),
  Vivid: defineBrand("VV", "#6737FF", "#FFFFFF", "https://vivid.money"),
  Plutus: defineBrand("PL", "#6D36FF", "#FFFFFF", "https://plutus.it"),
  "Tomorrow Bank": defineBrand("TM", "#0E5E4A", "#FFFFFF", "https://www.tomorrow.one"),
  "Aion Bank": defineBrand("AI", "#7A2CFF", "#FFFFFF", "https://www.aion.be"),
  "Bank Norwegian": defineBrand("BN", "#D91C24", "#FFFFFF", "https://www.banknorwegian.com"),
  Bondora: defineBrand("BO", "#00A66A", "#FFFFFF", "https://www.bondora.com"),
  BoursoBank: defineBrand("BB", "#E1007A", "#FFFFFF", "https://www.boursobank.com"),
  "C24 Bank": defineBrand("C24", "#1A4EF5", "#FFFFFF", "https://www.c24.de"),
  "CEC Bank": defineBrand("CEC", "#00934E", "#FFFFFF", "https://www.cec.ro"),
  CaixaBank: defineBrand("CX", "#0057B8", "#FFFFFF", "https://www.caixabank.com"),
  Cofidis: defineBrand("CO", "#E0001B", "#FFFFFF", "https://www.cofidis.com"),
  "Credit Agricole": defineBrand("CA", "#007A53", "#FFFFFF", "https://www.credit-agricole.com"),
  "Credit Mutuel": defineBrand("CM", "#005CA9", "#FFFFFF", "https://www.creditmutuel.fr"),
  Creditea: defineBrand("CR", "#334155", "#FFFFFF", "https://www.creditea.com"),
  "Currencies Direct": defineBrand("CD", "#1B4D8C", "#FFFFFF", "https://www.currenciesdirect.com"),
  Ferratum: defineBrand("FE", "#7725D8", "#FFFFFF", "https://www.ferratum.com"),
  "Intesa Sanpaolo": defineBrand("IS", "#00744A", "#FFFFFF", "https://group.intesasanpaolo.com"),
  Lydia: defineBrand("LY", "#5942FF", "#FFFFFF", "https://www.lydia.me"),
  "Monex Europe": defineBrand("ME", "#0C3B72", "#FFFFFF", "https://monexeurope.com"),
  Nickel: defineBrand("NI", "#2B2E31", "#FFFFFF", "https://nickel.eu"),
  Oney: defineBrand("ON", "#7A48FF", "#FFFFFF", "https://www.oney.com"),
  Openbank: defineBrand("OB", "#E50A13", "#FFFFFF", "https://www.openbank.com"),
  "PKO Bank Polski": defineBrand("PKO", "#002D72", "#FFFFFF", "https://www.pkobp.pl"),
  Postbank: defineBrand("PB", "#F5C400", "#111111", "https://www.postbank.de"),
  "Raiffeisen Bank": defineBrand("RB", "#F8C400", "#111111", "https://www.raiffeisenbank.com"),
  SEB: defineBrand("SEB", "#00A760", "#FFFFFF", "https://sebgroup.com"),
  "Small World": defineBrand("SW", "#3B82F6", "#FFFFFF", "https://www.smallworldfs.com"),
  Sogexia: defineBrand("SG", "#121826", "#FFFFFF", "https://www.sogexia.com"),
  Soldo: defineBrand("SO", "#0019A5", "#FFFFFF", "https://www.soldo.com"),
  Tink: defineBrand("TK", "#111827", "#FFFFFF", "https://tink.com"),
  "Younited Credit": defineBrand("YC", "#5E3AFF", "#FFFFFF", "https://younited.com"),
  mBank: defineBrand("mB", "#E30613", "#FFFFFF", "https://www.mbank.pl"),
};

const generatedBrandTones: Array<Pick<ProviderBrand, "bg" | "text">> = [
  { bg: "#1F3C62", text: "#FFFFFF" },
  { bg: "#2F5A45", text: "#FFFFFF" },
  { bg: "#5A3E74", text: "#FFFFFF" },
  { bg: "#6B4D3A", text: "#FFFFFF" },
  { bg: "#334155", text: "#FFFFFF" },
];

function hashProviderName(providerName: string) {
  let hash = 0;

  for (const char of providerName) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function createGeneratedBrand(providerName: string): ProviderBrand {
  const tone = generatedBrandTones[hashProviderName(providerName) % generatedBrandTones.length]!;

  return {
    mark: "",
    bg: tone.bg,
    text: tone.text,
    websiteUrl: "https://www.payn.online",
  };
}

export function getProviderBrand(providerName: string): ProviderBrand {
  return brands[providerName] ?? createGeneratedBrand(providerName);
}

export function getAllProviderBrands() {
  return brands;
}

export function getProviderLogoPath(providerName: string) {
  return getProviderBrand(providerName).logoPath ?? null;
}
