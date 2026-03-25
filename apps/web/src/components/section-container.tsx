import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SectionTone = "default" | "subtle" | "glass";
type SectionPadding = "sm" | "md" | "lg";

type SectionContainerProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  padding?: SectionPadding;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function SectionContainer<T extends ElementType = "section">({
  as,
  children,
  className,
  tone = "default",
  padding = "md",
  ...props
}: SectionContainerProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      className={clsx(
        "rounded-3xl border transition-all duration-200",
        tone === "default" && "border-line bg-white shadow-card",
        tone === "subtle" && "border-line bg-transparent",
        tone === "glass" && "glass",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
