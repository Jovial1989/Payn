import { describe, expect, it } from "vitest";
import { normalizeFxCurrency, supportedFxCurrencies } from "./fx-quote";
import {
  TRANSFER_CORRIDOR_PRESETS,
  getDefaultTransferCorridor,
} from "./transfer-corridor";

// P0.1 — a cold /transfers visit (no URL params) must resolve to a corridor
// that produces a ranked list on first paint, never the "UK→UK" same-country
// dead end the audit found. These guard the invariants the UI relies on.
describe("getDefaultTransferCorridor", () => {
  const markets = ["uk", "de", "fr", "es", "it", "pt", "all_europe", "", "pl", "se"];

  for (const market of markets) {
    it(`yields a non-identity, quotable corridor for "${market || "(empty)"}"`, () => {
      const c = getDefaultTransferCorridor(market);
      // Never a same-country corridor (the audit's UK→UK bug).
      expect(c.fromCountry).not.toBe(c.toCountry);
      // Never an identity currency pair (would produce no quote / empty list).
      expect(c.fromCurrency).not.toBe(c.toCurrency);
      // Both sides must be currencies the quote engine can actually price.
      expect(supportedFxCurrencies).toContain(c.fromCurrency);
      expect(supportedFxCurrencies).toContain(c.toCurrency);
    });
  }

  it("keeps a euro market on EUR→GBP into the UK", () => {
    const c = getDefaultTransferCorridor("de");
    expect(c.fromCurrency).toBe("EUR");
    expect(c.toCurrency).toBe("GBP");
    expect(c.toCountry).toBe("uk");
  });

  it("flips a sterling market to GBP→EUR (never UK→UK)", () => {
    const c = getDefaultTransferCorridor("uk");
    expect(c.fromCurrency).toBe("GBP");
    expect(c.toCurrency).toBe("EUR");
    expect(c.fromCountry).toBe("uk");
    expect(c.toCountry).not.toBe("uk");
  });

  it("keeps a non-identity, quotable corridor for a PLN market (P1.2)", () => {
    // PLN is now a supported FX currency, so a Polish user quotes in PLN.
    expect(supportedFxCurrencies).toContain("PLN");
    expect(normalizeFxCurrency("PLN", "EUR")).toBe("PLN");
    const c = getDefaultTransferCorridor("pl");
    expect(c.fromCountry).not.toBe(c.toCountry);
    expect(c.fromCurrency).not.toBe(c.toCurrency);
    expect(supportedFxCurrencies).toContain(c.fromCurrency);
  });
});

describe("TRANSFER_CORRIDOR_PRESETS", () => {
  it("only offers quotable, non-identity pairs", () => {
    expect(TRANSFER_CORRIDOR_PRESETS.length).toBeGreaterThan(0);
    for (const p of TRANSFER_CORRIDOR_PRESETS) {
      expect(p.fromCurrency).not.toBe(p.toCurrency);
      expect(supportedFxCurrencies).toContain(p.fromCurrency);
      expect(supportedFxCurrencies).toContain(p.toCurrency);
    }
  });
});
