"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { localePath } from "@/lib/locale";
import { getUiCopy, getUserTypeOptions } from "@/lib/ui-copy";

export function UserTypeOnboardingCard({
  title,
  description,
  completeLabel,
}: {
  title?: string;
  description?: string;
  completeLabel?: string;
}) {
  const router = useRouter();
  const { locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
  const userTypes = getUserTypeOptions(locale);
  const { profile, updateProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<
    "personal" | "freelancer" | "business"
  >(profile?.user_type ?? "personal");
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);

    try {
      await Promise.race([
        updateProfile({
          user_type: selectedType,
          onboarding_completed: true,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
      ]);
    } catch {
      // Profile saved optimistically even if backend is slow
    }

    setSaving(false);
    router.push(localePath(locale, "/dashboard"));
    router.refresh();
  };

  return (
    <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{uiCopy.auth.onboardingEyebrow}</p>
      <h2 className="mt-3 text-h2 text-ink">{title ?? uiCopy.auth.onboardingTitle}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
        {description ?? uiCopy.auth.onboardingDescription}
      </p>

      <div className="mt-6 grid gap-3">
        {userTypes.map((option) => {
          const active = selectedType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedType(option.id)}
              className={[
                "rounded-[24px] border p-5 text-left transition-all",
                active
                  ? "border-black bg-black/[0.03]"
                  : "border-line bg-white hover:border-line-strong hover:bg-bg-surface/60",
              ].join(" ")}
            >
              <p className="text-sm font-bold text-ink">{option.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleComplete}
          disabled={saving}
          className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? uiCopy.dashboard.savingPreferences : completeLabel ?? uiCopy.auth.onboardingCompleteLabel}
        </button>
      </div>
    </section>
  );
}
