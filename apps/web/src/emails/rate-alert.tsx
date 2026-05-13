import { Heading, Text, Button, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface RateAlertEmailProps {
  firstName?: string;
  providerName: string;
  productName: string;
  oldRate: string;
  newRate: string;
  productUrl: string;
  unsubscribeUrl: string;
}

export default function RateAlertEmail({
  firstName,
  providerName,
  productName,
  oldRate,
  newRate,
  productUrl,
  unsubscribeUrl,
}: RateAlertEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  return (
    <EmailLayout preview={`${providerName} updated the ${productName} rate.`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>{greeting}</Text>
      <Heading style={{ fontSize: "22px", marginTop: "8px", color: "#1F2937" }}>
        {providerName} updated the {productName} rate.
      </Heading>
      <Section style={{ marginTop: "20px", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px" }}>
        <Text style={{ fontSize: "13px", color: "#6b7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Previous rate
        </Text>
        <Text style={{ fontSize: "24px", color: "#9ca3af", margin: "4px 0 16px", textDecoration: "line-through" }}>
          {oldRate}
        </Text>
        <Hr style={{ borderColor: "#e5e7eb" }} />
        <Text style={{ fontSize: "13px", color: "#6b7280", margin: "16px 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          New rate
        </Text>
        <Text style={{ fontSize: "32px", fontWeight: 700, color: "#10B981", margin: "4px 0 0" }}>
          {newRate}
        </Text>
      </Section>
      <Section style={{ marginTop: "24px" }}>
        <Button
          href={productUrl}
          style={{ backgroundColor: "#10B981", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "16px", fontWeight: 500 }}
        >
          See updated offer
        </Button>
      </Section>
      <Text style={{ fontSize: "13px", color: "#9ca3af", marginTop: "24px" }}>
        You received this because you saved this offer in Payn. Account emails will continue.
      </Text>
    </EmailLayout>
  );
}
