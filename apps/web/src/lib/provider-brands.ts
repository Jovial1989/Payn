/**
 * Provider brand identity map.
 * Used across offer cards, homepage, and category pages
 * to give each provider a recognizable visual identity.
 */

export interface ProviderBrand {
  mark: string;
  bg: string;
  text: string;
  websiteUrl: string;
  logoPath?: string;
  logoBackground?: string;
  logoBorderColor?: string;
  logoImageClassName?: string;
}

const brands: Record<string, ProviderBrand> = {
  Revolut: {
    mark: "R",
    bg: "#191C1F",
    text: "#FFFFFF",
    websiteUrl: "https://www.revolut.com",
    logoPath: "/logos/revolut.svg",
    logoBackground: "#131518",
    logoBorderColor: "rgba(19, 21, 24, 0.08)",
    logoImageClassName: "scale-[1.14] brightness-0 invert",
  },
  Wise: {
    mark: "W",
    bg: "#9FE870",
    text: "#163300",
    websiteUrl: "https://wise.com",
    logoPath: "/logos/wise.svg",
    logoBackground: "#F1F7F6",
    logoImageClassName: "scale-[1.14]",
  },
  N26: {
    mark: "N",
    bg: "#36A18B",
    text: "#FFFFFF",
    websiteUrl: "https://n26.com",
    logoPath: "/logos/n26.png",
    logoBackground: "#EEF7F4",
    logoImageClassName: "scale-[1.08]",
  },
  Klarna: {
    mark: "K",
    bg: "#FFB3C7",
    text: "#17120F",
    websiteUrl: "https://www.klarna.com/international/",
    logoPath: "/logos/klarna.svg",
    logoBackground: "#FFF4F8",
    logoImageClassName: "scale-[1.18]",
  },
  Auxmoney: {
    mark: "AM",
    bg: "#B3005C",
    text: "#FFFFFF",
    websiteUrl: "https://www.auxmoney.com",
    logoPath: "/logos/auxmoney.svg",
    logoBackground: "#FFF5FA",
    logoImageClassName: "scale-[1.12]",
  },
  bunq: { mark: "b", bg: "#00B7A8", text: "#FFFFFF", websiteUrl: "https://www.bunq.com" },
  Curve: { mark: "C", bg: "#12123B", text: "#FFFFFF", websiteUrl: "https://www.curve.com" },
  Zopa: { mark: "Z", bg: "#3B1F65", text: "#FFFFFF", websiteUrl: "https://www.zopa.com" },
  Monese: { mark: "M", bg: "#00D2C8", text: "#FFFFFF", websiteUrl: "https://monese.com" },
  ING: { mark: "ING", bg: "#FF6200", text: "#FFFFFF", websiteUrl: "https://www.ing.com" },
  Santander: {
    mark: "S",
    bg: "#EC0000",
    text: "#FFFFFF",
    websiteUrl: "https://www.santander.com",
    logoPath: "/logos/santander.svg",
    logoBackground: "#EC0000",
    logoBorderColor: "rgba(236, 0, 0, 0.12)",
    logoImageClassName: "scale-[1.18]",
  },
  BBVA: { mark: "B", bg: "#004481", text: "#FFFFFF", websiteUrl: "https://www.bbva.com" },
  "Deutsche Bank": { mark: "DB", bg: "#001E50", text: "#FFFFFF", websiteUrl: "https://www.deutsche-bank.de" },
  "BNP Paribas": {
    mark: "BNP",
    bg: "#00915A",
    text: "#FFFFFF",
    websiteUrl: "https://group.bnpparibas/en/",
    logoPath: "/logos/bnp-paribas.svg",
    logoBackground: "#F4F8F5",
    logoImageClassName: "scale-[1.1]",
  },
  Barclays: { mark: "BC", bg: "#00AEEF", text: "#FFFFFF", websiteUrl: "https://www.barclays.co.uk" },
  Barclaycard: { mark: "BC", bg: "#00AEEF", text: "#FFFFFF", websiteUrl: "https://www.barclaycard.co.uk" },
  "ABN AMRO": { mark: "ABN", bg: "#004832", text: "#FFD200", websiteUrl: "https://www.abnamro.nl" },
  UniCredit: { mark: "UC", bg: "#E01A22", text: "#FFFFFF", websiteUrl: "https://www.unicreditgroup.eu" },
  XE: { mark: "XE", bg: "#00245D", text: "#FFFFFF", websiteUrl: "https://www.xe.com" },
  Remitly: { mark: "R", bg: "#3B1B7B", text: "#FFFFFF", websiteUrl: "https://www.remitly.com" },
  Payoneer: { mark: "P", bg: "#FF4800", text: "#FFFFFF", websiteUrl: "https://www.payoneer.com" },
  Rabobank: { mark: "R", bg: "#F29100", text: "#FFFFFF", websiteUrl: "https://www.rabobank.com" },
  WorldRemit: { mark: "WR", bg: "#6B2D8B", text: "#FFFFFF", websiteUrl: "https://www.worldremit.com" },
  CurrencyFair: { mark: "CF", bg: "#1A936F", text: "#FFFFFF", websiteUrl: "https://www.currencyfair.com" },
  "Interactive Brokers": { mark: "IB", bg: "#D41F28", text: "#FFFFFF", websiteUrl: "https://www.interactivebrokers.com" },
  "Western Union": { mark: "WU", bg: "#FFDD00", text: "#000000", websiteUrl: "https://www.westernunion.com" },
  Allianz: { mark: "AZ", bg: "#003781", text: "#FFFFFF", websiteUrl: "https://www.allianz.com" },
  AXA: { mark: "AXA", bg: "#0C1C8C", text: "#FFFFFF", websiteUrl: "https://www.axa.com" },
  Alan: { mark: "AL", bg: "#0C6CFF", text: "#FFFFFF", websiteUrl: "https://alan.com" },
  Admiral: { mark: "AD", bg: "#CF102D", text: "#FFFFFF", websiteUrl: "https://www.admiral.com" },
  Generali: { mark: "GN", bg: "#B62025", text: "#FFFFFF", websiteUrl: "https://www.generali.com" },
  SafetyWing: { mark: "SW", bg: "#1D4ED8", text: "#FFFFFF", websiteUrl: "https://safetywing.com" },
  "Trade Republic": { mark: "TR", bg: "#101010", text: "#FFFFFF", websiteUrl: "https://traderepublic.com" },
  "Scalable Capital": { mark: "SC", bg: "#1D3B6A", text: "#FFFFFF", websiteUrl: "https://de.scalable.capital" },
  Smava: {
    mark: "SM",
    bg: "#7CC242",
    text: "#0E2C08",
    websiteUrl: "https://www.smava.de",
    logoPath: "/logos/smava.svg",
    logoBackground: "#F3F8EC",
    logoImageClassName: "scale-[1.1]",
  },
  eToro: { mark: "ET", bg: "#6CC24A", text: "#0B1307", websiteUrl: "https://www.etoro.com" },
  DEGIRO: { mark: "DG", bg: "#123A2B", text: "#FFFFFF", websiteUrl: "https://www.degiro.com" },
  Bitpanda: { mark: "BP", bg: "#17C964", text: "#052A17", websiteUrl: "https://www.bitpanda.com" },
  Coinbase: { mark: "CB", bg: "#0052FF", text: "#FFFFFF", websiteUrl: "https://www.coinbase.com" },
};

/** Default fallback for unknown providers */
const fallback: ProviderBrand = {
  mark: "?",
  bg: "#6B7280",
  text: "#FFFFFF",
  websiteUrl: "https://www.payn.online",
};

export function getProviderBrand(providerName: string): ProviderBrand {
  return brands[providerName] ?? fallback;
}

export function getAllProviderBrands() {
  return brands;
}

export function getProviderLogoPath(providerName: string) {
  return getProviderBrand(providerName).logoPath ?? null;
}
