import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_layout";

export interface WelcomeEmailProps {
  firstName?: string;
  country?: string;
  unsubscribeUrl: string;
}

export default function WelcomeEmail({ firstName, country, unsubscribeUrl }: WelcomeEmailProps) {
  const greeting = firstName ? `Welcome to Payn, ${firstName}.` : "Welcome to Payn.";
  return (
    <EmailLayout preview="Find money tools that actually fit you." unsubscribeUrl={unsubscribeUrl}>
      <Heading style={{ fontSize: "24px", marginTop: "24px", color: "#1F2937" }}>{greeting}</Heading>
      <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#1F2937" }}>
        Most people overpay on loans, cards, transfers, and savings.
        {country ? ` In ${country} too.` : ""}
        {" "}We compare published terms from 50+ providers, score them on real cost, and rank by what you&apos;ll actually pay.
      </Text>
      <Section style={{ marginTop: "24px" }}>
        <Button
          href="https://www.payn.online/en/discover"
          style={{ backgroundColor: "#10B981", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "16px", fontWeight: 500 }}
        >
          Start comparing
        </Button>
      </Section>
      <Text style={{ fontSize: "14px", color: "#6b7280", marginTop: "24px" }}>
        Have a question? Reply to this email and a person will read it.
      </Text>
    </EmailLayout>
  );
}
