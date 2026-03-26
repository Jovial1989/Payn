import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} = {}) {
  return clsx(
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
    size === "sm" && "h-9 rounded-full px-4 text-sm",
    size === "md" && "h-11 rounded-full px-6 text-sm",
    size === "lg" && "h-12 rounded-full px-7 text-base",
    variant === "primary" &&
      "bg-black text-white shadow-subtle hover:bg-gray-800 active:bg-gray-900",
    variant === "secondary" &&
      "border border-line-strong bg-white text-ink hover:bg-bg-surface",
    variant === "ghost" &&
      "bg-transparent text-ink hover:bg-bg-surface",
    fullWidth && "w-full",
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button type={type} className={clsx(buttonStyles({ variant, size }), className)} {...props} />;
}
