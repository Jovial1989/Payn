"use client";

import type { MarketplaceLocale } from "@payn/types";
import { useEffect, useState } from "react";
import { getCountrySelectorOptions, individualCountryOptions } from "@/lib/countries";
import { getMessages } from "@/lib/messages";
import { supportedLocales } from "@/lib/marketplace";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";

const LOCALE_GATE_COOKIE = "payn-locale-gate-done";

const languageOptions: { value: MarketplaceLocale; label: string; native: string }[] = (
  [
    { value: "en" as MarketplaceLocale, label: "English", native: "English" },
    { value: "de" as MarketplaceLocale, label: "German", native: "Deutsch" },
    { value: "es" as MarketplaceLocale, label: "Spanish", native: "Español" },
    { value: "fr" as MarketplaceLocale, label: "French", native: "Français" },
    { value: "it" as MarketplaceLocale, label: "Italian", native: "Italiano" },
    { value: "pt" as MarketplaceLocale, label: "Portuguese", native: "Português" },
  ] as { value: MarketplaceLocale; label: string; native: string }[]
).filter((opt) => supportedLocales.includes(opt.value));

function hasCompletedLocaleGate(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${LOCALE_GATE_COOKIE}=`));
}

function markLocaleGateDone() {
  document.cookie = `${LOCALE_GATE_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
}

// Country options that are real countries only (not groups like "EU" or "International")
const gateCountryOptions = individualCountryOptions.slice(0, 20); // top 20 by coverage order

export function LocaleGate() {
  const { locale, setCountry, setLanguage } = useMarketplacePreferences();
  const messages = getMessages(locale);
  const [visible, setVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<MarketplaceLocale | "">("");

  // Only check on client mount — no SSR, no hydration mismatch
  useEffect(() => {
    if (!hasCompletedLocaleGate()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const ready = selectedCountry !== "" && selectedLocale !== "";

  function handleContinue() {
    if (!ready) return;
    setCountry(selectedCountry);
    setLanguage(selectedLocale as MarketplaceLocale);
    markLocaleGateDone();
    setVisible(false);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[28px] border border-[#EAEAEA] bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
        {/* Logo mark */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-emerald">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 12L8 4L12 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0D0D0D]">Payn</span>
        </div>

        <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#0D0D0D]">
          {messages.localeGate.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5F6368]">
          {messages.localeGate.description}
        </p>

        <div className="mt-6 grid gap-4">
          {/* Market / Region */}
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
              {messages.localeGate.regionLabel}
            </span>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="h-[52px] w-full appearance-none rounded-[16px] border border-[#EAEAEA] bg-white pl-4 pr-10 text-sm font-medium text-[#0D0D0D] outline-none transition-all duration-200 focus:border-accent-emerald/30 focus:shadow-[0_0_0_3px_rgba(15,138,75,0.10)] focus:ring-0"
              >
                <option value="" disabled>
                  {messages.localeGate.regionPlaceholder}
                </option>
                {gateCountryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </label>

          {/* Language */}
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9AA0A6]">
              {messages.localeGate.languageLabel}
            </span>
            <div className="relative">
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value as MarketplaceLocale)}
                className="h-[52px] w-full appearance-none rounded-[16px] border border-[#EAEAEA] bg-white pl-4 pr-10 text-sm font-medium text-[#0D0D0D] outline-none transition-all duration-200 focus:border-accent-emerald/30 focus:shadow-[0_0_0_3px_rgba(15,138,75,0.10)] focus:ring-0"
              >
                <option value="" disabled>
                  {messages.localeGate.languagePlaceholder}
                </option>
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.native} — {opt.label}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </label>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!ready}
          className="mt-6 h-[52px] w-full rounded-[16px] bg-accent-emerald text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-emerald-strong disabled:cursor-not-allowed disabled:opacity-35"
        >
          {messages.localeGate.continue}
        </button>

        <p className="mt-4 text-center text-xs text-[#9AA0A6]">
          {messages.localeGate.hint}
        </p>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA0A6]"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
