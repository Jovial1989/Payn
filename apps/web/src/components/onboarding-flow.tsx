"use client";

import { useCallback, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { getCountrySelectorOptions } from "@/lib/countries";

const CATEGORIES = [
  { id: "loans", label: "Loans", icon: "$" },
  { id: "cards", label: "Credit Cards", icon: "C" },
  { id: "transfers", label: "Money Transfers", icon: "T" },
  { id: "exchange", label: "Currency Exchange", icon: "X" },
];

const GOALS = [
  { id: "lowest_fees", label: "Lowest fees" },
  { id: "best_rates", label: "Best rates" },
  { id: "fast_approval", label: "Fast approval" },
  { id: "premium", label: "Premium experience" },
  { id: "cashback", label: "Cashback / rewards" },
  { id: "business", label: "Business use" },
  { id: "no_hidden_fees", label: "No hidden fees" },
];

const USER_TYPES = [
  { id: "personal", label: "Personal user", description: "Managing personal finances" },
  { id: "freelancer", label: "Freelancer", description: "Self-employed or contractor" },
  { id: "business", label: "Business owner", description: "Running a company" },
];

interface OnboardingData {
  categories: string[];
  homeCountry: string;
  targetCountries: string[];
  goals: string[];
  userType: string;
}

export function OnboardingFlow({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const { user, updateProfile } = useAuth();
  const { locale } = useMarketplacePreferences();
  const countryOptions = getCountrySelectorOptions({ includeGroups: false, locale });
  const copy =
    locale === "de"
      ? {
          step: "Schritt",
          skip: "Jetzt überspringen",
          categoriesTitle: "Wonach suchst du?",
          categoriesDescription: "Wähle die Finanzprodukte aus, die du vergleichen möchtest.",
          countryTitle: "Wo bist du ansässig?",
          countryDescription: "Wir zeigen zuerst Angebote, die in deinem Land verfügbar sind.",
          goalsTitle: "Was ist dir am wichtigsten?",
          goalsDescription: "Wähle deine Prioritäten für bessere Empfehlungen.",
          userTypeTitle: "Wie wirst du Payn nutzen?",
          userTypeDescription: "Das hilft uns, Empfehlungen besser auf dich zuzuschneiden.",
          back: "Zurück",
          continue: "Weiter",
          saving: "Speichert...",
          recommendations: "Meine Empfehlungen ansehen",
        }
      : {
          step: "Step",
          skip: "Skip for now",
          categoriesTitle: "What are you looking for?",
          categoriesDescription: "Select the financial products you want to compare.",
          countryTitle: "Where are you based?",
          countryDescription: "We will show offers available in your country first.",
          goalsTitle: "What matters most to you?",
          goalsDescription: "Select your priorities to get better recommendations.",
          userTypeTitle: "How will you use Payn?",
          userTypeDescription: "This helps us tailor recommendations to your needs.",
          back: "Back",
          continue: "Continue",
          saving: "Saving...",
          recommendations: "See my recommendations",
        };
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    categories: [],
    homeCountry: "",
    targetCountries: [],
    goals: [],
    userType: "personal",
  });

  const toggleItem = useCallback(
    (key: keyof OnboardingData, item: string) => {
      setData((prev) => {
        const arr = prev[key] as string[];
        return {
          ...prev,
          [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
        };
      });
    },
    [],
  );

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return data.categories.length > 0;
      case 1:
        return data.homeCountry !== "";
      case 2:
        return data.goals.length > 0;
      case 3:
        return data.userType !== "";
      default:
        return true;
    }
  }, [step, data]);

  const handleFinish = useCallback(async () => {
    setSaving(true);
    if (user) {
      await updateProfile({
        selected_categories: data.categories,
        home_country: data.homeCountry || null,
        target_countries: data.targetCountries,
        goals: data.goals,
        user_type: data.userType as "personal" | "freelancer" | "business",
        onboarding_completed: true,
      });
    }
    // Also save to localStorage for guest users
    localStorage.setItem("payn_profile", JSON.stringify(data));
    setSaving(false);
    onComplete();
  }, [user, data, updateProfile, onComplete]);

  if (!open) return null;

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[520px] rounded-3xl bg-white p-8 shadow-elevated">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-tertiary">
              {copy.step} {step + 1} / {totalSteps}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-ink-tertiary hover:text-ink"
            >
              {copy.skip}
            </button>
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-bg-surface">
            <div
              className="h-1 rounded-full bg-accent-emerald transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 0: Categories */}
        {step === 0 && (
          <div>
            <h2 className="text-h3 text-ink">{copy.categoriesTitle}</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {copy.categoriesDescription}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const selected = data.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleItem("categories", cat.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      selected
                        ? "border-accent-emerald/30 bg-accent-emerald-soft"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-accent-emerald text-white"
                          : "bg-bg-surface text-ink-secondary"
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-sm font-semibold text-ink">
                      {locale === "de"
                        ? {
                            loans: "Kredite",
                            cards: "Karten",
                            transfers: "Überweisungen",
                            exchange: "Wechsel",
                          }[cat.id]
                        : cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Country */}
        {step === 1 && (
          <div>
            <h2 className="text-h3 text-ink">{copy.countryTitle}</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {copy.countryDescription}
            </p>
            <div className="mt-6 grid max-h-[320px] gap-2 overflow-y-auto">
              {countryOptions.map((country) => {
                const selected = data.homeCountry === country.value;
                return (
                  <button
                    key={country.value}
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, homeCountry: country.value }))}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      selected
                        ? "border-accent-emerald/30 bg-accent-emerald-soft"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-accent-emerald text-white"
                          : "bg-bg-surface text-ink-secondary"
                      }`}
                    >
                      {country.code}
                    </div>
                    <span className="text-sm font-medium text-ink">{country.label}</span>
                    {selected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto text-accent-emerald">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div>
            <h2 className="text-h3 text-ink">{copy.goalsTitle}</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {copy.goalsDescription}
            </p>
            <div className="mt-6 grid gap-2">
              {GOALS.map((goal) => {
                const selected = data.goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleItem("goals", goal.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      selected
                        ? "border-accent-emerald/30 bg-accent-emerald-soft"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        selected ? "bg-accent-emerald" : "border border-line"
                      }`}
                    >
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {locale === "de"
                        ? {
                            lowest_fees: "Niedrigste Gebühren",
                            best_rates: "Beste Kurse",
                            fast_approval: "Schnelle Zusage",
                            premium: "Premium-Erlebnis",
                            cashback: "Cashback / Rewards",
                            business: "Geschäftlich",
                            no_hidden_fees: "Keine versteckten Gebühren",
                          }[goal.id]
                        : goal.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: User type */}
        {step === 3 && (
          <div>
            <h2 className="text-h3 text-ink">{copy.userTypeTitle}</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {copy.userTypeDescription}
            </p>
            <div className="mt-6 grid gap-3">
              {USER_TYPES.map((type) => {
                const selected = data.userType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, userType: type.id }))}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      selected
                        ? "border-accent-emerald/30 bg-accent-emerald-soft"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <p className="text-sm font-bold text-ink">
                      {locale === "de"
                        ? {
                            personal: "Privatnutzer",
                            freelancer: "Freelancer",
                            business: "Unternehmer",
                          }[type.id]
                        : type.label}
                    </p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      {locale === "de"
                        ? {
                            personal: "Verwaltet private Finanzen",
                            freelancer: "Selbstständig oder Auftragnehmer",
                            business: "Führt ein Unternehmen",
                          }[type.id]
                        : type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              {copy.back}
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="h-11 rounded-full bg-accent-emerald px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-30"
            >
              {copy.continue}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !canProceed()}
              onClick={handleFinish}
              className="h-11 rounded-full bg-accent-emerald px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-30"
            >
              {saving ? copy.saving : copy.recommendations}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
