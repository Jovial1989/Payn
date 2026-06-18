"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export interface RateAlertButtonProps {
  category: string;
  country: string;
  countryLabel: string;
  locale: string;
}

interface RateAlert {
  id: string;
  category: string;
  country: string;
  metric: string;
  operator: "above" | "below";
  threshold: number;
  label: string;
}

interface MetricOption {
  metric: string;
  label: string;
  defaultOperator: "above" | "below";
  unit: string;
}

const METRIC_OPTIONS: Record<string, MetricOption[]> = {
  savings: [{ metric: "rate", label: "Interest rate (AER)", defaultOperator: "above", unit: "%" }],
  loans: [{ metric: "apr", label: "APR", defaultOperator: "below", unit: "%" }],
  transfers: [{ metric: "fx_fee", label: "FX fee", defaultOperator: "below", unit: "%" }],
  exchange: [{ metric: "fx_fee", label: "FX fee", defaultOperator: "below", unit: "%" }],
  cards: [
    { metric: "fx_fee", label: "FX fee", defaultOperator: "below", unit: "%" },
    { metric: "annual_fee", label: "Annual fee", defaultOperator: "below", unit: "€" },
  ],
};

export function RateAlertButton({
  category,
  country,
  countryLabel,
  locale: _locale,
}: RateAlertButtonProps) {
  const { user, loading } = useAuth();

  const [existingAlert, setExistingAlert] = useState<RateAlert | null>(null);
  const [alertsLoaded, setAlertsLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const metricOptions = METRIC_OPTIONS[category] ?? [];
  const defaultMetric = metricOptions[0];

  const [selectedMetric, setSelectedMetric] = useState<string>(defaultMetric?.metric ?? "rate");
  const [operator, setOperator] = useState<"above" | "below">(
    defaultMetric?.defaultOperator ?? "above",
  );
  const [threshold, setThreshold] = useState<string>("");

  const formRef = useRef<HTMLDivElement>(null);

  const loadAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/v1/alerts", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: RateAlert[] };
      const match = data.alerts.find(
        (a) => a.category === category && a.country === country,
      );
      setExistingAlert(match ?? null);
    } catch {
      // silent — alerts are non-critical
    } finally {
      setAlertsLoaded(true);
    }
  }, [user, category, country]);

  useEffect(() => {
    if (!loading && user) {
      void loadAlerts();
    } else if (!loading && !user) {
      setAlertsLoaded(true);
    }
  }, [loading, user, loadAlerts]);

  // Reset form metric/operator when category changes
  useEffect(() => {
    const opts = METRIC_OPTIONS[category] ?? [];
    const first = opts[0];
    if (first) {
      setSelectedMetric(first.metric);
      setOperator(first.defaultOperator);
    }
    setThreshold("");
    setExpanded(false);
    setShowConfirmRemove(false);
  }, [category, country]);

  if (loading || !alertsLoaded || !user || metricOptions.length === 0) return null;

  const currentMetricOption =
    metricOptions.find((m) => m.metric === selectedMetric) ?? metricOptions[0];

  const handleSave = async () => {
    if (!threshold || isNaN(parseFloat(threshold))) return;
    setSaving(true);
    try {
      const thresholdNum = parseFloat(threshold);
      const metricOption = currentMetricOption;
      const generatedLabel = `${metricOption.label} ${operator === "above" ? "rises above" : "drops below"} ${thresholdNum}${metricOption.unit} in ${countryLabel}`;

      const res = await fetch("/api/v1/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          country,
          metric: selectedMetric,
          operator,
          threshold: thresholdNum,
          label: generatedLabel,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { alert: RateAlert };
      setExistingAlert(data.alert);
      setExpanded(false);
      setThreshold("");
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existingAlert) return;
    setRemoving(true);
    try {
      await fetch(`/api/v1/alerts/${existingAlert.id}`, { method: "DELETE" });
      setExistingAlert(null);
      setShowConfirmRemove(false);
    } catch {
      // silent
    } finally {
      setRemoving(false);
    }
  };

  if (existingAlert) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowConfirmRemove((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent-emerald/30 bg-accent-emerald-soft px-3 py-1.5 text-[12px] font-medium text-accent-emerald-strong transition-colors hover:border-accent-emerald/60"
        >
          <span>🔔</span>
          <span>Alert active</span>
          <span>✓</span>
        </button>

        {showConfirmRemove && (
          <div
            ref={formRef}
            className="absolute left-0 top-full z-10 mt-2 min-w-[200px] rounded-xl border border-line bg-white p-3 shadow-card"
          >
            <p className="mb-2 text-[12px] text-ink-secondary">Remove this alert?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={removing}
                className="rounded-lg bg-accent-emerald px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                {removing ? "Removing…" : "Remove"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmRemove(false)}
                className="text-[12px] text-ink-tertiary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setExpanded((prev) => !prev);
          setShowConfirmRemove(false);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary transition-colors hover:border-accent-emerald hover:text-accent-emerald-strong"
      >
        <span>🔔</span>
        <span>Set alert</span>
      </button>

      {expanded && (
        <div
          ref={formRef}
          className="absolute left-0 top-full z-10 mt-2 w-72 rounded-xl border border-line bg-white p-3 shadow-card"
        >
          <div className="mb-2.5 flex flex-col gap-2">
            {metricOptions.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
                  Metric
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => {
                    setSelectedMetric(e.target.value);
                    const opt = metricOptions.find((m) => m.metric === e.target.value);
                    if (opt) setOperator(opt.defaultOperator);
                  }}
                  className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-[12px] text-ink outline-none focus:border-accent-emerald"
                >
                  {metricOptions.map((m) => (
                    <option key={m.metric} value={m.metric}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
                Condition
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value as "above" | "below")}
                className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-[12px] text-ink outline-none focus:border-accent-emerald"
              >
                <option value="above">rises above</option>
                <option value="below">drops below</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wide text-ink-tertiary">
                Threshold ({currentMetricOption?.unit ?? "%"})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={`e.g. ${category === "savings" ? "4.5" : "1.5"}`}
                className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-[12px] text-ink outline-none placeholder:text-ink-tertiary focus:border-accent-emerald"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !threshold}
              className="rounded-lg bg-accent-emerald px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                setThreshold("");
              }}
              className="text-[12px] text-ink-tertiary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
