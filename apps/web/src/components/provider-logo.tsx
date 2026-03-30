"use client";

import clsx from "clsx";
import { useState } from "react";
import { getProviderBrand, getProviderLogoPath } from "@/lib/provider-brands";

const sizeClasses = {
  sm: "h-10 w-10 rounded-[14px] p-1.5",
  md: "h-11 w-11 rounded-[16px] p-2",
  lg: "h-14 w-14 rounded-[18px] p-2.5",
} as const;

export function ProviderLogo({
  providerName,
  websiteUrl: _websiteUrl,
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
  const logoPath = getProviderLogoPath(providerName);

  return (
    <span
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden border bg-[#F5F7F9] shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        sizeClasses[size],
        className,
      )}
      style={
        !broken && logoPath
          ? {
              backgroundColor: brand.logoBackground ?? "#F5F7F9",
              borderColor: brand.logoBorderColor ?? "rgba(0, 0, 0, 0.05)",
            }
          : undefined
      }
      aria-hidden="true"
    >
      {!broken && logoPath ? (
        <img
          src={logoPath}
          alt={`${providerName} logo`}
          loading="lazy"
          onError={() => setBroken(true)}
          className={clsx(
            "h-full w-full object-contain transition-opacity duration-200",
            muted ? "opacity-95" : "opacity-100",
            brand.logoImageClassName,
          )}
        />
      ) : (
        <span
          className={clsx(
            "flex h-full w-full items-center justify-center rounded-[inherit] font-bold uppercase tracking-[0.08em]",
            brand.mark.length > 2 ? "text-[8px]" : "text-[11px]",
          )}
          style={{ color: brand.text, backgroundColor: brand.logoBackground ?? brand.bg }}
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
        "inline-flex items-center border border-line bg-white text-ink-secondary",
        compact ? "gap-2 rounded-full px-3 py-2" : "gap-2.5 rounded-full px-3.5 py-2.5",
        className,
      )}
    >
      <ProviderLogo
        providerName={providerName}
        websiteUrl={websiteUrl}
        size={compact ? "sm" : "md"}
        muted={muted}
      />
      <span className={clsx("font-semibold", compact ? "text-xs" : "text-sm")}>
        {providerName}
      </span>
    </div>
  );
}
