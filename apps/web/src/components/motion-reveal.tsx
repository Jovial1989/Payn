"use client";

import { createElement } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export function MotionReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style = { ["--motion-delay" as string]: `${delay}ms` } as CSSProperties;
  const tagProps = {
    ref,
    className: `${visible ? "motion-section" : "opacity-0 translate-y-6"} ${className}`.trim(),
    style,
  } as const;

  return createElement(Tag, tagProps, children);
}
