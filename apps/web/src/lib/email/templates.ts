import { createElement } from "react";
import type { ReactElement } from "react";
import WelcomeEmail, { type WelcomeEmailProps } from "@/emails/welcome";
import RateAlertEmail, { type RateAlertEmailProps } from "@/emails/rate-alert";
import MonthlyDigestEmail, { type MonthlyDigestEmailProps } from "@/emails/monthly-digest";

export type TemplateId = "welcome" | "rate-alert" | "monthly-digest";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  defaultSubject: string;
  category: "transactional" | "marketing";
  sampleProps: Record<string, unknown>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateMeta> = {
  welcome: {
    id: "welcome",
    name: "Welcome",
    description: "Sent when a user completes signup. Once per user.",
    defaultSubject: "Welcome to Payn",
    category: "transactional",
    sampleProps: { firstName: "Sample", country: "UK", unsubscribeUrl: "#" },
  },
  "rate-alert": {
    id: "rate-alert",
    name: "Rate alert",
    description: "Triggered when a provider rate changes on a saved offer.",
    defaultSubject: "Rate update on a saved offer",
    category: "transactional",
    sampleProps: {
      firstName: "Sample",
      providerName: "Trade Republic",
      productName: "Cash",
      oldRate: "4.0%",
      newRate: "4.5%",
      productUrl: "https://traderepublic.com/cash",
      unsubscribeUrl: "#",
    },
  },
  "monthly-digest": {
    id: "monthly-digest",
    name: "Monthly digest",
    description: "Top offers in user's country, sent once a month.",
    defaultSubject: "Top offers in {country} this month",
    category: "marketing",
    sampleProps: {
      firstName: "Sample",
      country: "Germany",
      month: "May",
      topOffers: [
        { category: "Savings", providerName: "Trade Republic", headline: "4.0% APR · No minimum", url: "#" },
        { category: "Loan", providerName: "Younited", headline: "3.9% APR · 36 months", url: "#" },
        { category: "Card", providerName: "Revolut", headline: "1% cashback · €0/month", url: "#" },
      ],
      unsubscribeUrl: "#",
    },
  },
};

export function renderTemplate(id: TemplateId, props: Record<string, unknown>): ReactElement {
  switch (id) {
    case "welcome":
      return createElement(WelcomeEmail, props as unknown as WelcomeEmailProps);
    case "rate-alert":
      return createElement(RateAlertEmail, props as unknown as RateAlertEmailProps);
    case "monthly-digest":
      return createElement(MonthlyDigestEmail, props as unknown as MonthlyDigestEmailProps);
    default:
      throw new Error(`Unknown template: ${id}`);
  }
}
