"use client";

import type { MarketplaceLocale } from "@payn/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { buttonStyles } from "@/components/button";
import { DashboardSectionCard } from "@/components/dashboard-primitives";
import { Tag } from "@/components/tag";
import { getCountrySelectorOptions, getLocalizedMarketScopeOptions } from "@/lib/countries";
import { writePersistedProfileDraft } from "@/lib/profile-persistence";
import type { UserProfileMarketScope } from "@/lib/residence-countries";
import { getDictionary } from "@/lib/i18n";
import { supportedLocales } from "@/lib/marketplace";
import { getGoalLabel, getUserTypeOptions } from "@/lib/ui-copy";
import type { UserProfile } from "@/lib/types";

type SettingsSavePayload = {
  first_name: string | null;
  last_name: string | null;
  preferred_locale: MarketplaceLocale;
  user_type: "personal" | "freelancer" | "business";
  selected_categories: string[];
  goals: string[];
  home_country: string | null;
  market_scope: UserProfileMarketScope;
};

const categoryOptions = [
  "loans",
  "cards",
  "transfers",
  "exchange",
  "insurance",
  "investments",
] as const;

const goalOptions = [
  "travel",
  "savings",
  "crypto",
  "international_transfers",
  "insurance",
  "everyday_banking",
] as const;

export function DashboardProfileWorkspace({
  locale,
  userId,
  email,
  profile,
  onSignOut,
  onSave,
  onRequestPasswordReset,
}: {
  locale: MarketplaceLocale;
  userId: string;
  email: string;
  profile: UserProfile | null;
  onSignOut: () => void | Promise<void>;
  onSave: (data: SettingsSavePayload) => void | Promise<void>;
  onRequestPasswordReset: (email: string) => Promise<{ error: string | null }>;
}) {
  const dictionary = getDictionary(locale);
  const userTypes = getUserTypeOptions(locale);
  const countryOptions = useMemo(
    () => getCountrySelectorOptions({ includeGroups: false, locale }),
    [locale],
  );
  const marketScopeOptions = useMemo(() => getLocalizedMarketScopeOptions(locale), [locale]);
  const copy =
    locale === "de"
      ? {
          headerEyebrow: "Profil & Einstellungen",
          headerTitle: "Dein Konto und deine Einstellungen",
          headerDescription:
            "Diese Einstellungen bestimmen, welche Angebote du siehst und wie wir sie für dich sortieren.",
          saving: "Speichert…",
          saveFailed: "Speichern fehlgeschlagen",
          saved: "Gespeichert",
          firstName: "Vorname",
          addFirstName: "Vorname ergänzen",
          lastName: "Nachname",
          addLastName: "Nachname ergänzen",
          countryOfResidence: "Wohnsitzland",
          chooseCountry: "Land wählen",
          preferredLanguage: "Sprache",
          profileType: "Profiltyp",
          marketScope: "Marktabdeckung",
          email: "E-Mail",
          emailHint:
            "Wird für Anmeldung, Wiederherstellung und Sitzungssicherheit verwendet. Discover-Routing hängt nicht mehr von dieser Seite ab.",
          productsYouCareAbout: "Produkte, die dir wichtig sind",
          moneyGoals: "Finanzziele",
          securityEyebrow: "Sicherheit",
          securityTitle: "Passwort und Login-Sicherheit",
          securityDescription:
            "Kontoschutz bleibt hier, damit das Dashboard auf Aktivität und Empfehlungen fokussiert bleibt.",
          passwordReset: "Passwort zurücksetzen",
          resetHint: `Sende einen Reset-Link an ${email}, wenn du dein Passwort ändern möchtest.`,
          sendingReset: "Reset-Link wird gesendet…",
          sendPasswordReset: "Passwort-Reset senden",
          resetSent: "Reset-E-Mail gesendet.",
          resetFailed: "Reset-Link konnte nicht gesendet werden.",
          resetProviderHint: "Du erhältst eine E-Mail von der Supabase-Authentifizierung.",
          sessionSafety: "Sitzungssicherheit",
          sessionSafetyHint:
            "Sitzungs- und Geräte-Steuerung kann später hier erweitert werden, ohne Bearbeitungslogik zurück ins Dashboard zu schieben.",
          sessionEyebrow: "Sitzung",
          sessionTitle: "Aktuelle Sitzung",
          sessionDescription:
            "Nutze diesen Bereich, wenn du den angemeldeten Workspace verlassen willst, ohne gespeicherte Einstellungen zu verlieren.",
          signOut: "Abmelden",
          signOutHint:
            "Beim Abmelden wird nur die aktuelle Sitzung beendet. Profilfelder und Empfehlungseinstellungen bleiben gespeichert.",
        }
      : {
          headerEyebrow: "Profile & settings",
          headerTitle: "Your account and preferences",
          headerDescription:
            "These settings shape which offers you see and how we rank them for you.",
          saving: "Saving…",
          saveFailed: "Save failed",
          saved: "Saved",
          firstName: "First name",
          addFirstName: "Add first name",
          lastName: "Last name",
          addLastName: "Add last name",
          countryOfResidence: "Country of residence",
          chooseCountry: "Choose country",
          preferredLanguage: "Language",
          profileType: "Profile type",
          marketScope: "Market scope",
          email: "Email",
          emailHint:
            "Used for sign-in, recovery, and session security. Discover routing no longer depends on this page.",
          productsYouCareAbout: "Products you care about",
          moneyGoals: "Money goals",
          securityEyebrow: "Security",
          securityTitle: "Password and login security",
          securityDescription:
            "Account protection stays here so dashboard can stay focused on activity and recommendations.",
          passwordReset: "Password reset",
          resetHint: `Send a reset link to ${email} if you want to change your password.`,
          sendingReset: "Sending reset link…",
          sendPasswordReset: "Send password reset",
          resetSent: "Reset email sent.",
          resetFailed: "Could not send reset link.",
          resetProviderHint: "You’ll receive an email from Supabase authentication.",
          sessionSafety: "Session safety",
          sessionSafetyHint:
            "Session and device-level controls can expand here later without pushing account-editing logic back into dashboard.",
          sessionEyebrow: "Session",
          sessionTitle: "Current session",
          sessionDescription:
            "Use this area when you want to leave the signed-in workspace without losing your saved settings.",
          signOut: "Sign out",
          signOutHint:
            "Signing out closes the current session only. Your profile fields and recommendation preferences stay persisted.",
        };
  const username = email.split("@")[0];
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [preferredLocale, setPreferredLocale] = useState<MarketplaceLocale>(profile?.preferred_locale ?? locale);
  const [homeCountry, setHomeCountry] = useState(profile?.home_country ?? "");
  const [userType, setUserType] = useState<UserProfile["user_type"]>(profile?.user_type ?? "personal");
  const [marketScope, setMarketScope] = useState<UserProfileMarketScope>(profile?.market_scope ?? "eu_fallback");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile?.selected_categories ?? []);
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? []);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [resetState, setResetState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resetError, setResetError] = useState<string | null>(null);
  const [emailMarketingOptIn, setEmailMarketingOptIn] = useState(false);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<"weekly" | "monthly" | "off">("monthly");
  const [emailPrefsSaved, setEmailPrefsSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me/email-preferences")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { marketing_opt_in: boolean; digest_frequency: "weekly" | "monthly" | "off" } | null) => {
        if (d) { setEmailMarketingOptIn(d.marketing_opt_in); setEmailDigestFrequency(d.digest_frequency); }
      })
      .catch(() => { /* ignore */ });
  }, []);

  const savePayload = useMemo<SettingsSavePayload>(
    () => ({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      preferred_locale: preferredLocale,
      user_type: userType,
      selected_categories: selectedCategories,
      goals,
      home_country: homeCountry || null,
      market_scope: marketScope,
    }),
    [firstName, goals, homeCountry, lastName, marketScope, preferredLocale, selectedCategories, userType],
  );
  const lastSavedPayloadRef = useRef(JSON.stringify(savePayload));
  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || username;
  const initials = [firstName.trim(), lastName.trim()]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || username.slice(0, 2).toUpperCase();

  useEffect(() => {
    const nextPayload = {
      first_name: profile?.first_name ?? null,
      last_name: profile?.last_name ?? null,
      preferred_locale: profile?.preferred_locale ?? locale,
      user_type: profile?.user_type ?? "personal",
      selected_categories: profile?.selected_categories ?? [],
      goals: profile?.goals ?? [],
      home_country: profile?.home_country ?? null,
      market_scope: profile?.market_scope ?? "eu_fallback",
    } satisfies SettingsSavePayload;

    setFirstName(nextPayload.first_name ?? "");
    setLastName(nextPayload.last_name ?? "");
    setPreferredLocale(nextPayload.preferred_locale);
    setHomeCountry(nextPayload.home_country ?? "");
    setUserType(nextPayload.user_type);
    setSelectedCategories(nextPayload.selected_categories);
    setGoals(nextPayload.goals);
    setMarketScope(nextPayload.market_scope);
    lastSavedPayloadRef.current = JSON.stringify(nextPayload);
    setSaveState("saved");
  }, [locale, profile]);

  useEffect(() => {
    writePersistedProfileDraft(userId, {
      first_name: savePayload.first_name,
      last_name: savePayload.last_name,
      preferred_locale: savePayload.preferred_locale,
      selected_categories: savePayload.selected_categories,
      goals: savePayload.goals,
      home_country: savePayload.home_country,
      user_type: savePayload.user_type,
      market_scope: savePayload.market_scope,
    });
  }, [savePayload, userId]);

  useEffect(() => {
    const payloadSignature = JSON.stringify(savePayload);
    if (payloadSignature === lastSavedPayloadRef.current) {
      return;
    }

    let isActive = true;
    setSaveState("saving");

    const timeout = window.setTimeout(() => {
      void Promise.resolve(onSave(savePayload))
        .then(() => {
          if (!isActive) return;
          lastSavedPayloadRef.current = payloadSignature;
          setSaveState("saved");
        })
        .catch(() => {
          if (isActive) {
            setSaveState("error");
          }
        });
    }, 500);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [onSave, savePayload]);

  const toggleValue = (collection: string[], value: string, setter: (values: string[]) => void) => {
    setter(collection.includes(value) ? collection.filter((item) => item !== value) : [...collection, value]);
  };

  return (
    <div className="mx-auto grid max-w-[1040px] gap-6">
      <DashboardSectionCard
        eyebrow={copy.headerEyebrow}
        title={copy.headerTitle}
        description={copy.headerDescription}
      >
        <div className="grid gap-5">
          <div className="flex flex-col gap-4 rounded-[22px] border border-[#EAEAEA] bg-[#F7F7F8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-emerald text-sm font-bold text-white">
                {initials}
              </div>
              <div>
                <p className="text-lg font-bold tracking-[-0.03em] text-ink">{displayName}</p>
                <p className="mt-1 text-sm text-ink-secondary">{email}</p>
              </div>
            </div>
            <Tag tone={saveState === "error" ? "orange" : saveState === "saving" ? "blue" : "success"}>
              {saveState === "saving" ? copy.saving : saveState === "error" ? copy.saveFailed : copy.saved}
            </Tag>
          </div>

          {/* Identity form — restyled per UX audit. The previous design wrapped
              each input in its own card with a grey input-on-grey-card stack,
              which made the fields look like inactive read-only labels. The
              eyebrow text was uppercase 11px — "shouty caps in tiny type" per
              the audit. New treatment is one container per logical block, a
              regular sentence-case label, and a solid white input with a clear
              emerald focus ring (Apple-style). */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">
                {copy.firstName}
              </span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder={copy.addFirstName}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-tertiary outline-none transition-colors focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald-soft"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">
                {copy.lastName}
              </span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder={copy.addLastName}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-tertiary outline-none transition-colors focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald-soft"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">
                {copy.countryOfResidence}
              </span>
              <select
                value={homeCountry}
                onChange={(event) => setHomeCountry(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald-soft"
              >
                <option value="">{copy.chooseCountry}</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">
                {copy.preferredLanguage}
              </span>
              <select
                value={preferredLocale}
                onChange={(event) => setPreferredLocale(event.target.value as MarketplaceLocale)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald-soft"
              >
                {supportedLocales.map((value) => (
                  <option key={value} value={value}>
                    {dictionary.locales[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[13px] font-medium text-ink-secondary">
                {copy.profileType}
              </span>
              <select
                value={userType}
                onChange={(event) => setUserType(event.target.value as UserProfile["user_type"])}
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none transition-colors focus:border-accent-emerald focus:ring-2 focus:ring-accent-emerald-soft"
              >
                {userTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
            <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.marketScope}
              </p>
              <div className="mt-3 grid gap-2">
                {marketScopeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMarketScope(option.value)}
                    className={`rounded-[16px] border px-4 py-3 text-left transition-colors ${
                      marketScope === option.value
                        ? "border-accent-emerald bg-accent-emerald text-white"
                        : "border-[#EAEAEA] bg-[#F7F7F8] text-ink-secondary hover:bg-white hover:text-ink"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className={`mt-1 block text-xs ${marketScope === option.value ? "text-white/80" : "text-ink-tertiary"}`}>
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">{copy.email}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{email}</p>
              <p className="mt-2 text-sm text-ink-tertiary">
                {copy.emailHint}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.productsYouCareAbout}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleValue(selectedCategories, category, setSelectedCategories)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                      selectedCategories.includes(category)
                        ? "border-accent-emerald bg-accent-emerald text-white"
                        : "border-[#EAEAEA] bg-[#F7F7F8] text-ink-secondary hover:bg-white hover:text-ink"
                    }`}
                  >
                    {dictionary.categories[category]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.moneyGoals}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleValue(goals, goal, setGoals)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                      goals.includes(goal)
                        ? "border-accent-emerald bg-accent-emerald text-white"
                        : "border-[#EAEAEA] bg-[#F7F7F8] text-ink-secondary hover:bg-white hover:text-ink"
                    }`}
                  >
                    {getGoalLabel(locale, goal)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSectionCard
          eyebrow={copy.securityEyebrow}
          title={copy.securityTitle}
          description={copy.securityDescription}
        >
          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-4">
              <p className="text-sm font-semibold text-ink">{copy.passwordReset}</p>
              <p className="mt-2 text-sm text-ink-secondary">
                {copy.resetHint}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setResetState("sending");
                    setResetError(null);
                    const result = await onRequestPasswordReset(email);
                    if (result.error) {
                      setResetState("error");
                      setResetError(result.error);
                      return;
                    }
                    setResetState("sent");
                  }}
                  className={`${buttonStyles({ variant: "secondary", size: "sm" })} w-full justify-center sm:w-auto`}
                >
                  {resetState === "sending" ? copy.sendingReset : copy.sendPasswordReset}
                </button>
                <span className="text-sm text-ink-tertiary">
                  {resetState === "sent"
                    ? copy.resetSent
                    : resetState === "error"
                      ? resetError ?? copy.resetFailed
                      : copy.resetProviderHint}
                </span>
              </div>
            </div>

            <div className="rounded-[20px] border border-dashed border-[#DADCE0] bg-white px-4 py-4">
              <p className="text-sm font-semibold text-ink">{copy.sessionSafety}</p>
              <p className="mt-2 text-sm text-ink-secondary">
                {copy.sessionSafetyHint}
              </p>
            </div>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow="Notifications"
          title="Email preferences"
          description="Control which emails Payn sends to your account."
        >
          <div className="grid gap-4">
            <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={emailMarketingOptIn}
                  onChange={(e) => setEmailMarketingOptIn(e.target.checked)}
                  className="mt-0.5 accent-accent-emerald"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">Receive marketing emails</p>
                  <p className="mt-0.5 text-sm text-ink-secondary">Rate alerts, monthly digests, new offer announcements.</p>
                </div>
              </label>
            </div>
            <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-0.5 accent-accent-emerald" />
                <div>
                  <p className="text-sm font-semibold text-ink">Receive account emails</p>
                  <p className="mt-0.5 text-sm text-ink-secondary">Sign in, security, password reset. Required for account security.</p>
                </div>
              </div>
            </div>
            {emailMarketingOptIn && (
              <div className="rounded-[20px] border border-[#EAEAEA] bg-white px-4 py-4">
                <p className="text-sm font-semibold text-ink">Digest frequency</p>
                <div className="mt-3 grid gap-2">
                  {(["weekly", "monthly", "off"] as const).map((freq) => (
                    <label key={freq} className="flex cursor-pointer items-center gap-3">
                      <input type="radio" name="digestFreq" value={freq} checked={emailDigestFrequency === freq} onChange={() => setEmailDigestFrequency(freq)} className="accent-accent-emerald" />
                      <span className="text-sm text-ink capitalize">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/me/email-preferences", {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ marketing_opt_in: emailMarketingOptIn, digest_frequency: emailDigestFrequency }),
                  });
                  setEmailPrefsSaved(true);
                  setTimeout(() => setEmailPrefsSaved(false), 2000);
                }}
                className={`${buttonStyles({ variant: "secondary", size: "sm" })} w-full justify-center sm:w-auto`}
              >
                Save preferences
              </button>
              {emailPrefsSaved && <span className="text-sm text-accent-emerald-strong">Saved</span>}
            </div>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          eyebrow={copy.sessionEyebrow}
          title={copy.sessionTitle}
          description={copy.sessionDescription}
        >
          <div className="rounded-[20px] border border-[#EAEAEA] bg-[#F7F7F8] px-4 py-4">
            <p className="text-sm font-semibold text-ink">{copy.signOut}</p>
            <p className="mt-2 text-sm text-ink-secondary">
              {copy.signOutHint}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => void onSignOut()}
                className={`${buttonStyles({ variant: "primary", size: "sm" })} w-full justify-center sm:w-auto`}
              >
                {copy.signOut}
              </button>
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </div>
  );
}
