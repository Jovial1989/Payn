"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const CATEGORIES = [
  { id: "loans", label: "Loans", icon: "$" },
  { id: "cards", label: "Credit Cards", icon: "C" },
  { id: "transfers", label: "Money Transfers", icon: "T" },
  { id: "exchange", label: "Currency Exchange", icon: "X" },
];

const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "FI", name: "Finland" },
  { code: "LU", name: "Luxembourg" },
  { code: "GR", name: "Greece" },
  { code: "GB", name: "United Kingdom" },
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
              Step {step + 1} of {totalSteps}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-ink-tertiary hover:text-ink"
            >
              Skip for now
            </button>
          </div>
          <div className="mt-3 h-1 w-full rounded-full bg-bg-surface">
            <div
              className="h-1 rounded-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 0: Categories */}
        {step === 0 && (
          <div>
            <h2 className="text-h3 text-ink">What are you looking for?</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Select the financial products you want to compare.
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
                        ? "border-black bg-black/[0.03]"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        selected
                          ? "bg-black text-white"
                          : "bg-bg-surface text-ink-secondary"
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-sm font-semibold text-ink">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Country */}
        {step === 1 && (
          <div>
            <h2 className="text-h3 text-ink">Where are you based?</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              We will show offers available in your country first.
            </p>
            <div className="mt-6 grid max-h-[320px] gap-2 overflow-y-auto">
              {COUNTRIES.map((country) => {
                const selected = data.homeCountry === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setData((prev) => ({ ...prev, homeCountry: country.code }))}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      selected
                        ? "border-black bg-black/[0.03]"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-black text-white"
                          : "bg-bg-surface text-ink-secondary"
                      }`}
                    >
                      {country.code}
                    </div>
                    <span className="text-sm font-medium text-ink">{country.name}</span>
                    {selected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-auto text-black">
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
            <h2 className="text-h3 text-ink">What matters most to you?</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Select your priorities to get better recommendations.
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
                        ? "border-black bg-black/[0.03]"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        selected ? "bg-black" : "border border-line"
                      }`}
                    >
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium text-ink">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: User type */}
        {step === 3 && (
          <div>
            <h2 className="text-h3 text-ink">How will you use Payn?</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              This helps us tailor recommendations to your needs.
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
                        ? "border-black bg-black/[0.03]"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <p className="text-sm font-bold text-ink">{type.label}</p>
                    <p className="mt-1 text-xs text-ink-secondary">{type.description}</p>
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
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={saving || !canProceed()}
              onClick={handleFinish}
              className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-30"
            >
              {saving ? "Saving..." : "See my recommendations"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
