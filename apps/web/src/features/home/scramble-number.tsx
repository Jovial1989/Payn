interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  // Retained for call-site compatibility. The count-up/scramble animation was
  // dropped in P0.4: it seeded its initial state with all-zeros
  // (value.replace(/\d/g, "0")), so the SERVER-rendered HTML read "000+" /
  // "0.00%" and search engines indexed an empty catalogue. The real number now
  // renders on first paint (SSR and client agree — no hydration flash).
  durationMs?: number;
  scrambleFps?: number;
  cacheKey?: string;
}

export function ScrambleNumber({ value, decimals = 2, suffix = "" }: Props) {
  return (
    <>
      {value.toFixed(decimals)}
      {suffix}
    </>
  );
}
