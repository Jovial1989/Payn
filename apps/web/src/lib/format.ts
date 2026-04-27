import type { MarketplaceLocale } from "@payn/types";

export function formatCurrency(locale: MarketplaceLocale, value: number, currency = "EUR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function formatPercent(locale: MarketplaceLocale, value: number, digits = 2) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
}
