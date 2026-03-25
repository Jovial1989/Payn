/**
 * Provider brand identity map.
 * Used across offer cards, homepage, and category pages
 * to give each provider a recognizable visual identity.
 */

export interface ProviderBrand {
  /** Short mark/initials displayed in the avatar */
  mark: string;
  /** Background color (hex) */
  bg: string;
  /** Text color (hex) */
  text: string;
}

const brands: Record<string, ProviderBrand> = {
  Revolut:            { mark: "R",   bg: "#191C1F", text: "#FFFFFF" },
  Wise:               { mark: "W",   bg: "#9FE870", text: "#163300" },
  N26:                { mark: "N",   bg: "#36A18B", text: "#FFFFFF" },
  Klarna:             { mark: "K",   bg: "#FFB3C7", text: "#17120F" },
  bunq:               { mark: "b",   bg: "#00B7A8", text: "#FFFFFF" },
  Curve:              { mark: "C",   bg: "#12123B", text: "#FFFFFF" },
  Zopa:               { mark: "Z",   bg: "#3B1F65", text: "#FFFFFF" },
  Monese:             { mark: "M",   bg: "#00D2C8", text: "#FFFFFF" },
  ING:                { mark: "ING", bg: "#FF6200", text: "#FFFFFF" },
  Santander:          { mark: "S",   bg: "#EC0000", text: "#FFFFFF" },
  BBVA:               { mark: "B",   bg: "#004481", text: "#FFFFFF" },
  "Deutsche Bank":    { mark: "DB",  bg: "#001E50", text: "#FFFFFF" },
  "BNP Paribas":      { mark: "BNP", bg: "#00915A", text: "#FFFFFF" },
  Barclays:           { mark: "BC",  bg: "#00AEEF", text: "#FFFFFF" },
  Barclaycard:        { mark: "BC",  bg: "#00AEEF", text: "#FFFFFF" },
  "ABN AMRO":         { mark: "ABN", bg: "#004832", text: "#FFD200" },
  UniCredit:          { mark: "UC",  bg: "#E01A22", text: "#FFFFFF" },
  XE:                 { mark: "XE",  bg: "#00245D", text: "#FFFFFF" },
  Remitly:            { mark: "R",   bg: "#3B1B7B", text: "#FFFFFF" },
  Payoneer:           { mark: "P",   bg: "#FF4800", text: "#FFFFFF" },
  Rabobank:           { mark: "R",   bg: "#F29100", text: "#FFFFFF" },
  WorldRemit:         { mark: "WR",  bg: "#6B2D8B", text: "#FFFFFF" },
  CurrencyFair:       { mark: "CF",  bg: "#1A936F", text: "#FFFFFF" },
  "Interactive Brokers": { mark: "IB", bg: "#D41F28", text: "#FFFFFF" },
  "Western Union":    { mark: "WU",  bg: "#FFDD00", text: "#000000" },
};

/** Default fallback for unknown providers */
const fallback: ProviderBrand = { mark: "?", bg: "#6B7280", text: "#FFFFFF" };

export function getProviderBrand(providerName: string): ProviderBrand {
  return brands[providerName] ?? fallback;
}

export function getAllProviderBrands() {
  return brands;
}
