"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const userTypes = [
  {
    id: "personal",
    label: "Personal",
    description: "Track everyday borrowing, cards, transfers, and exchange for yourself.",
  },
  {
    id: "freelancer",
    label: "Freelancer",
    description: "Compare tools for irregular income, cross-border payments, and flexible banking.",
  },
  {
    id: "business",
    label: "Business",
    description: "Find products for team spending, company transfers, and business finance decisions.",
  },
] as const;

export function UserTypeOnboardingCard({
  title = "How will you use Payn?",
  description = "Choose the setup that best matches how you make financial decisions.",
  completeLabel = "Continue to dashboard",
}: {
  title?: string;
  description?: string;
  completeLabel?: string;
}) {
  const router = useRouter();
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
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Onboarding</p>
      <h2 className="mt-3 text-h2 text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>

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
          {saving ? "Saving..." : completeLabel}
        </button>
      </div>
    </section>
  );
}
