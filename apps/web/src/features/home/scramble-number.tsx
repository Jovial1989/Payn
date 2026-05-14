"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface ScrambleNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  durationMs?: number;
  scrambleFps?: number;
}

export function ScrambleNumber({
  value,
  decimals = 2,
  suffix = "",
  durationMs = 800,
  scrambleFps = 30,
}: ScrambleNumberProps) {
  const shouldReduce = useReducedMotion();
  const [display, setDisplay] = useState<string>(value.toFixed(decimals));
  const startedRef = useRef(false);

  useEffect(() => {
    if (shouldReduce) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    // Guard against React strict-mode double-invocation in dev
    if (startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const frameInterval = 1000 / scrambleFps;
    let lastFrame = startTime;
    let rafId = 0;

    const finalStr = value.toFixed(decimals);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Lock digits left-to-right in the final 30% of duration
      const lockProgress = Math.max(0, (progress - 0.7) / 0.3);

      if (now - lastFrame >= frameInterval) {
        lastFrame = now;

        if (progress >= 1) {
          setDisplay(finalStr);
          return;
        }

        const scrambled = finalStr
          .split("")
          .map((ch, i) => {
            if (ch === "." || ch === ",") return ch;
            const lockThreshold = i / finalStr.length;
            if (lockProgress > lockThreshold) return ch;
            return Math.floor(Math.random() * 10).toString();
          })
          .join("");

        setDisplay(scrambled);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — runs ONCE on mount, never restarts on hover or parent re-render

  return <>{display}{suffix}</>;
}
