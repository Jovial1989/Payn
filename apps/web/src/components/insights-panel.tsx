import { Tag } from "@/components/tag";

export function InsightsPanel({
  reason,
  benchmarkLabel,
  benchmarkValue,
  offerValue,
  tips,
}: {
  reason: string;
  benchmarkLabel: string;
  benchmarkValue: string;
  offerValue: string;
  tips: string[];
}) {
  return (
    <aside className="grid gap-4 rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="rounded-[18px] bg-[#F7F7F8] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          Why this offer
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink">{reason}</p>
      </div>

      <div className="rounded-[18px] border border-[#ECECEC] bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          Market benchmark
        </p>
        <div className="mt-3 grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-ink-secondary">{benchmarkLabel}</span>
            <Tag tone="muted">{benchmarkValue}</Tag>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">This offer</span>
            <Tag tone="blue">{offerValue}</Tag>
          </div>
        </div>
      </div>

      <div className="rounded-[18px] bg-[#F7F7F8] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          Tips to improve approval
        </p>
        <div className="mt-3 grid gap-2">
          {tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
