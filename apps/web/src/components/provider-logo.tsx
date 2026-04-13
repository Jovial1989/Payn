"use client";

import clsx from "clsx";
import { useState } from "react";
import { getProviderBrand } from "@/lib/provider-brands";

const sizeConfig = {
  sm: {
    frame: "h-10 w-10 rounded-[12px]",
    stage: "inset-[3px] rounded-[9px]",
    imagePad: "p-2.5",
    imageBounds: "max-h-[16px] max-w-[26px]",
    monogram: "min-h-[24px] min-w-[24px] rounded-[8px] px-1.5 text-[11px]",
  },
  md: {
    frame: "h-12 w-12 rounded-[12px]",
    stage: "inset-[4px] rounded-[10px]",
    imagePad: "p-3",
    imageBounds: "max-h-[18px] max-w-[30px]",
    monogram: "min-h-[28px] min-w-[28px] rounded-[8px] px-2 text-[12px]",
  },
  lg: {
    frame: "h-14 w-14 rounded-[14px]",
    stage: "inset-[4px] rounded-[11px]",
    imagePad: "p-3.5",
    imageBounds: "max-h-[20px] max-w-[34px]",
    monogram: "min-h-[32px] min-w-[32px] rounded-[9px] px-2 text-[13px]",
  },
} as const;

function getProviderInitials(providerName: string) {
  const tokens = providerName
    .split(/[\s&/.-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return "?";
  }

  if (tokens.length === 1) {
    return tokens[0]!.slice(0, 3).toUpperCase();
  }

  return `${tokens[0]![0] ?? ""}${tokens[1]![0] ?? ""}`.toUpperCase();
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const parsed = Number.parseInt(value, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getMonogramTextColor(bg: string, text: string) {
  return text.toUpperCase() === "#FFFFFF" ? bg : text;
}

export function ProviderLogo({
  providerName,
  websiteUrl: _websiteUrl,
  size = "md",
  muted = true,
  className,
}: {
  providerName: string;
  websiteUrl?: string;
  size?: keyof typeof sizeConfig;
  muted?: boolean;
  className?: string;
}) {
  const brand = getProviderBrand(providerName);
  const [broken, setBroken] = useState(false);
  const fallbackMark = brand.mark || getProviderInitials(providerName);
  const useFallback = broken || !brand.logoPath;
  const accentColor = brand.bg;
  const monogramTextColor = getMonogramTextColor(brand.bg, brand.text);
  const monogramBackground = hexToRgba(accentColor, 0.12);
  const monogramBorder = hexToRgba(accentColor, 0.18);
  const stageBackground = useFallback ? "#FBFBFC" : brand.logoPlateColor ?? "#FFFFFF";
  const stageBorderColor = useFallback
    ? "#E9ECF1"
    : brand.logoPlateBorderColor ?? "rgba(15, 23, 42, 0.06)";
  const config = sizeConfig[size];

  return (
    <span
      className={clsx(
        "group/provider relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[#E5E7EB] bg-[#F4F5F7] shadow-[0_1px_0_rgba(255,255,255,0.96),0_10px_24px_rgba(15,23,42,0.04)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:scale-[1.03] hover:border-[#D9DDE5] hover:shadow-[0_1px_0_rgba(255,255,255,0.98),0_14px_28px_rgba(15,23,42,0.08)]",
        config.frame,
        className,
      )}
      aria-hidden="true"
    >
      <span
        className={clsx("absolute border shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]", config.stage)}
        style={{ backgroundColor: stageBackground, borderColor: stageBorderColor }}
      />

      {!useFallback ? (
        <span
          className={clsx(
            "relative z-[1] flex h-full w-full items-center justify-center",
            config.imagePad,
          )}
        >
          <img
            src={brand.logoPath}
            alt={`${providerName} logo`}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className={clsx(
              "h-auto w-auto object-contain transition-transform duration-200 group-hover/provider:scale-[1.04]",
              config.imageBounds,
              muted ? "opacity-[0.96]" : "opacity-100",
              brand.logoImageClassName,
            )}
            style={{
              transform: `translateY(${brand.logoTranslateY ?? 0}px) scale(${brand.logoScale ?? 1})`,
              transformOrigin: "center",
            }}
          />
        </span>
      ) : (
        <span className="relative z-[1] flex h-full w-full items-center justify-center">
          <span
            className={clsx(
              "inline-flex items-center justify-center border font-extrabold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition-transform duration-200 group-hover/provider:scale-[1.03]",
              config.monogram,
            )}
            style={{
              backgroundColor: monogramBackground,
              borderColor: monogramBorder,
              color: monogramTextColor,
              fontFamily: "Manrope, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: fallbackMark.length > 2 ? "-0.08em" : "-0.05em",
            }}
          >
            {fallbackMark}
          </span>
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
        "inline-flex items-center border border-[#E7E9EE] bg-white text-ink-secondary shadow-[0_1px_0_rgba(255,255,255,0.95)]",
        compact ? "gap-2.5 rounded-full px-3 py-2" : "gap-3 rounded-full px-3.5 py-2.5",
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
