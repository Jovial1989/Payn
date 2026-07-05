import { describe, expect, it } from "vitest";
import {
  annualiseFee,
  detectFeePeriod,
  estimateCardYearlyCost,
} from "./card-cost";

describe("detectFeePeriod / annualiseFee", () => {
  it("annualises a monthly fee (×12)", () => {
    expect(detectFeePeriod("Monthly fee", "EUR 16.90")).toBe("monthly");
    expect(annualiseFee(16.9, "monthly")).toBeCloseTo(202.8, 2);
  });

  it("leaves an annual fee untouched", () => {
    expect(detectFeePeriod("Annual fee", "GBP 36")).toBe("annual");
    expect(annualiseFee(36, "annual")).toBe(36);
  });

  it("treats a ranged monthly fee as monthly", () => {
    expect(detectFeePeriod("Annual fee", "EUR 0 - 9.90/mo")).toBe("monthly");
  });
});

describe("estimateCardYearlyCost", () => {
  it("fee-only card: net equals the fee, no false offset", () => {
    const e = estimateCardYearlyCost({
      annualFee: 120,
      fxFeePercent: 0,
      cashbackPercent: 0,
      monthlySpend: 1000,
      travelMode: false,
    });
    expect(e.grossFee).toBe(120);
    expect(e.net).toBe(120);
    expect(e.cashbackOffsetsFee).toBe(false);
  });

  it("cashback > fee: nets to 0 and flags the offset (never a bare €0)", () => {
    const e = estimateCardYearlyCost({
      annualFee: 60,
      fxFeePercent: 0,
      cashbackPercent: 2,
      monthlySpend: 2000,
      travelMode: false,
    });
    // 24000 * 0.02 * 0.35 = 168 cashback vs 60 fee
    expect(e.cashbackBenefit).toBeCloseTo(168, 2);
    expect(e.net).toBe(0);
    expect(e.cashbackOffsetsFee).toBe(true);
  });

  it("monthly-fee card annualised upstream ranks on the true yearly fee", () => {
    const annualFee = annualiseFee(16.9, "monthly"); // 202.80
    const e = estimateCardYearlyCost({
      annualFee,
      fxFeePercent: 0,
      cashbackPercent: 1,
      monthlySpend: 1800,
      travelMode: false,
    });
    // 21600 * 0.01 * 0.35 = 75.6 cashback vs 202.80 fee → ~127.20 net
    expect(e.net).toBeCloseTo(127.2, 1);
    expect(e.cashbackOffsetsFee).toBe(false);
  });

  it("range-fee card uses its premium-tier annual fee", () => {
    const e = estimateCardYearlyCost({
      annualFee: 119, // EUR 0 - 9.90/mo → 9.90 * 12
      fxFeePercent: 0.5,
      cashbackPercent: 0,
      monthlySpend: 1500,
      travelMode: true,
    });
    // foreign spend 18000 * 0.42 = 7560; FX drag 7560 * 0.005 = 37.8
    expect(e.grossFee).toBeCloseTo(156.8, 1);
    expect(e.net).toBeCloseTo(156.8, 1);
  });

  it("never returns a negative net", () => {
    const e = estimateCardYearlyCost({
      annualFee: 0,
      fxFeePercent: 0,
      cashbackPercent: 5,
      monthlySpend: 5000,
      travelMode: false,
    });
    expect(e.net).toBe(0);
    expect(e.cashbackOffsetsFee).toBe(false); // no fee to offset
  });
});
