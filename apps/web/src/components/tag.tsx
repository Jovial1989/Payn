import clsx from "clsx";
import type { HTMLAttributes } from "react";

type TagTone = "neutral" | "accent" | "muted";

export function tagStyles({ tone = "neutral" }: { tone?: TagTone } = {}) {
  return clsx(
    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium",
    tone === "neutral" && "border-line bg-bg text-ink",
    tone === "accent" && "border-line bg-primary-soft text-accent",
    tone === "muted" && "border-line bg-panel text-muted",
  );
}

export function Tag({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return <span className={clsx(tagStyles({ tone }), className)} {...props} />;
}
