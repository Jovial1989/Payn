import { Button, Hr, Section, Text } from "@react-email/components";
import {
  ButtonStyles,
  ColorTokens,
  EmailLayout,
  TextStyles,
} from "./_layout";

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
    <EmailLayout
      preview={`${providerName} updated the ${productName} rate.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={TextStyles.eyebrow}>Rate alert</Text>
      <Text style={TextStyles.heading}>
        {providerName} changed {productName}
      </Text>
      <Text style={TextStyles.body}>
        {greeting} we picked up a rate change on one of the offers you saved.
        Here&apos;s what moved:
      </Text>

      <Section
        style={{
          backgroundColor: ColorTokens.surfaceMuted,
          borderRadius: 16,
          padding: "20px 22px",
          margin: "20px 0 8px",
          border: `1px solid ${ColorTokens.lineSubtle}`,
        }}
      >
        <Text
          style={{
            ...TextStyles.eyebrow,
            color: ColorTokens.inkTertiary,
            margin: 0,
          }}
        >
          Previous rate
        </Text>
        <Text
          style={{
            fontFamily: TextStyles.heading.fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: ColorTokens.inkTertiary,
            textDecoration: "line-through",
            margin: "4px 0 16px",
          }}
        >
          {oldRate}
        </Text>
        <Hr style={{ margin: "8px 0 16px", borderColor: ColorTokens.lineSubtle }} />
        <Text
          style={{
            ...TextStyles.eyebrow,
            color: ColorTokens.accent,
            margin: "0 0 4px",
          }}
        >
          New rate
        </Text>
        <Text
          style={{
            fontFamily: TextStyles.heading.fontFamily,
            fontSize: 34,
            lineHeight: "40px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: ColorTokens.accent,
            margin: 0,
          }}
        >
          {newRate}
        </Text>
      </Section>

      <Section style={{ marginTop: 24, textAlign: "center" }}>
        <Button href={productUrl} style={ButtonStyles.primary}>
          See updated offer
        </Button>
      </Section>

      <Text style={TextStyles.muted}>
        You&apos;re getting this because you saved this offer in Payn. Critical
        account messages will keep arriving regardless of preferences.
      </Text>
    </EmailLayout>
  );
}
