"use client";

import clsx from "clsx";
import { useMemo, useState } from "react";
import { getProviderBrand, getProviderLogoUrl } from "@/lib/provider-brands";

const sizeClasses = {
  sm: "h-8 w-8 rounded-xl",
  md: "h-10 w-10 rounded-2xl",
  lg: "h-12 w-12 rounded-2xl",
} as const;

export function ProviderLogo({
  providerName,
  websiteUrl,
  size = "md",
  muted = true,
  className,
}: {
  providerName: string;
  websiteUrl?: string;
  size?: keyof typeof sizeClasses;
  muted?: boolean;
  className?: string;
}) {
  const brand = getProviderBrand(providerName);
  const [broken, setBroken] = useState(false);
  const logoUrl = useMemo(
    () => getProviderLogoUrl(providerName, websiteUrl),
    [providerName, websiteUrl],
  );

  return (
    <span
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white shadow-subtle",
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {!broken && logoUrl ? (
        <img
          src={logoUrl}
          alt={`${providerName} logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className={clsx(
            "h-[72%] w-[72%] object-contain transition-opacity duration-200",
            muted ? "grayscale opacity-85" : "opacity-100",
          )}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase"
          style={{ backgroundColor: brand.bg, color: brand.text }}
        >
          {brand.mark}
        </span>
      )}
    </span>
  );
}

export function ProviderBadge({
  providerName,
  websiteUrl,
  muted = true,
  compact = false,
  className,
}: {
  providerName: string;
  websiteUrl?: string;
  muted?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "inline-flex items-center border border-line bg-white/80 text-ink-secondary shadow-subtle backdrop-blur-sm",
        compact ? "gap-2 rounded-full px-3 py-2" : "gap-2.5 rounded-full px-3.5 py-2.5",
        className,
      )}
    >
      <ProviderLogo providerName={providerName} websiteUrl={websiteUrl} size={compact ? "sm" : "md"} muted={muted} />
      <span className={clsx("font-semibold", compact ? "text-xs" : "text-sm")}>
        {providerName}
      </span>
    </div>
  );
}
