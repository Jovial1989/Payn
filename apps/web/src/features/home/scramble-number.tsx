"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// Module-level — survives ANY remount, persists for the page session
const PLAYED_VALUES = new Set<string>();

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  durationMs?: number;
  scrambleFps?: number;
  cacheKey?: string;
}

export function ScrambleNumber({
  value,
  decimals = 2,
  suffix = "",
  durationMs = 800,
  scrambleFps = 30,
  cacheKey,
}: Props) {
  const shouldReduce = useReducedMotion();
  const key = cacheKey ?? `scramble-${value}-${decimals}-${suffix}`;
  const alreadyPlayed = PLAYED_VALUES.has(key);

  const [display, setDisplay] = useState<string>(() => {
    if (shouldReduce || alreadyPlayed) return value.toFixed(decimals);
    return value.toFixed(decimals).replace(/\d/g, "0");
  });

  useEffect(() => {
    if (shouldReduce || alreadyPlayed) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    PLAYED_VALUES.add(key);

    const start = performance.now();
    const frameMs = 1000 / scrambleFps;
    let lastFrame = start;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const lockProgress = Math.max(0, (progress - 0.7) / 0.3);

      if (now - lastFrame >= frameMs) {
        lastFrame = now;
        if (progress >= 1) {
          setDisplay(value.toFixed(decimals));
          return;
        }
        const finalStr = value.toFixed(decimals);
        const scrambled = finalStr
          .split("")
          .map((ch, i) => {
            if (ch === "." || ch === ",") return ch;
            if (lockProgress > i / finalStr.length) return ch;
            return Math.floor(Math.random() * 10).toString();
          })
          .join("");
        setDisplay(scrambled);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{display}{suffix}</>;
}
