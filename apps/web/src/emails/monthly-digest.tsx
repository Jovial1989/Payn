import { Heading, Text, Section, Link, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface MonthlyDigestOffer {
  category: string;
  providerName: string;
  headline: string;
  url: string;
}

export interface MonthlyDigestEmailProps {
  firstName?: string;
  country: string;
  month: string;
  topOffers: MonthlyDigestOffer[];
  unsubscribeUrl: string;
}

export default function MonthlyDigestEmail({
  firstName,
  country,
  month,
  topOffers,
  unsubscribeUrl,
}: MonthlyDigestEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  return (
    <EmailLayout
      preview={`Top financial offers in ${country} for ${month}.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>{greeting}</Text>
      <Heading style={{ fontSize: "22px", marginTop: "8px", color: "#1F2937" }}>
        Top offers in {country} — {month}
      </Heading>
      <Text style={{ fontSize: "15px", lineHeight: "22px", color: "#4b5563" }}>
        Here are the best-ranked financial products available in your area right now.
      </Text>
      <Section style={{ marginTop: "20px" }}>
        {topOffers.map((offer, i) => (
          <Section
            key={i}
            style={{
              borderBottom: i < topOffers.length - 1 ? "1px solid #e5e7eb" : "none",
              padding: "16px 0",
            }}
          >
            <Text style={{ fontSize: "11px", color: "#10B981", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {offer.category}
            </Text>
            <Text style={{ fontSize: "16px", fontWeight: 600, color: "#1F2937", margin: "0 0 2px" }}>
              {offer.providerName}
            </Text>
            <Text style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px" }}>
              {offer.headline}
            </Text>
            <Link
              href={offer.url}
              style={{ fontSize: "14px", color: "#10B981", textDecoration: "none", fontWeight: 500 }}
            >
              See offer →
            </Link>
          </Section>
        ))}
      </Section>
      <Hr style={{ marginTop: "8px", borderColor: "#e5e7eb" }} />
      <Text style={{ fontSize: "13px", color: "#9ca3af", marginTop: "16px" }}>
        Rankings are based on published terms and our scoring model — not paid placements.
      </Text>
    </EmailLayout>
  );
}
