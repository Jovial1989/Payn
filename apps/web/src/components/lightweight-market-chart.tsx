"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { MarketDataPoint, MarketIntelligenceDirection } from "@/lib/market-intelligence";

export function LightweightMarketChart({
  points,
  direction,
}: {
  points: MarketDataPoint[];
  direction: MarketIntelligenceDirection;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) {
      return;
    }

    const container = containerRef.current;
    let chart: IChartApi | null = null;
    let series: ISeriesApi<"Area"> | null = null;

    const render = () => {
      chart?.remove();

      chart = createChart(container, {
        width: container.clientWidth,
        height: 280,
        layout: {
          background: { type: ColorType.Solid, color: "#FFFFFF" },
          textColor: "#6B7280",
          attributionLogo: true,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: "#F0F1F4" },
        },
        rightPriceScale: {
          borderVisible: false,
          scaleMargins: { top: 0.14, bottom: 0.14 },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          vertLine: { color: "#C9CDD4", width: 1, style: 2, labelBackgroundColor: "#111111" },
          horzLine: { color: "#E4E6EB", labelBackgroundColor: "#111111" },
        },
        handleScroll: {
          mouseWheel: false,
          pressedMouseMove: false,
          horzTouchDrag: true,
          vertTouchDrag: false,
        },
        handleScale: {
          mouseWheel: false,
          pinch: true,
          axisPressedMouseMove: false,
        },
      });

      series = chart.addSeries(AreaSeries, {
        lineColor: direction === "down" ? "#F97316" : "#111111",
        topColor: direction === "down" ? "rgba(249, 115, 22, 0.16)" : "rgba(17, 17, 17, 0.14)",
        bottomColor: "rgba(255, 255, 255, 0.02)",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: "#FFFFFF",
        crosshairMarkerBackgroundColor: direction === "down" ? "#F97316" : "#111111",
      });

      series.setData(
        points.map((point) => ({
          time: Math.floor(new Date(point.time).getTime() / 1000) as UTCTimestamp,
          value: point.value,
        })),
      );

      chart.timeScale().fitContent();
    };

    render();

    const observer = new ResizeObserver(() => {
      if (chart) {
        chart.applyOptions({ width: container.clientWidth });
        chart.timeScale().fitContent();
      } else {
        render();
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
      chart?.remove();
      chart = null;
      series = null;
    };
  }, [direction, points]);

  return <div ref={containerRef} className="h-[280px] w-full" />;
}
