import { Button, Section, Text } from "@react-email/components";
import {
  ButtonStyles,
  ColorTokens,
  EmailLayout,
  TextStyles,
} from "./_layout";

export interface WelcomeEmailProps {
  firstName?: string;
  country?: string;
  unsubscribeUrl: string;
}

export default function WelcomeEmail({
  firstName,
  country,
  unsubscribeUrl,
}: WelcomeEmailProps) {
  const greeting = firstName ? `Welcome, ${firstName}.` : "Welcome to Payn.";
  const countryLine = country
    ? `We compare published terms from 50+ providers in ${country} and rank them by what you'll actually pay.`
    : "We compare published terms from 50+ providers across Europe and rank them by what you'll actually pay.";

  return (
    <EmailLayout
      preview="Find money tools that actually fit you."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={TextStyles.eyebrow}>You&apos;re in</Text>
      <Text style={TextStyles.heading}>{greeting}</Text>
      <Text style={TextStyles.body}>
        Most people overpay on loans, cards, transfers, and savings — usually
        because the headline rate hides a fee that only matters at the end.
        {" "}{countryLine}
      </Text>

      {/* Three lightweight feature rows — keeps email small but reads as
          product copy, not generic marketing fluff. */}
      <Section
        style={{
          margin: "24px 0",
          paddingTop: 24,
          borderTop: `1px solid ${ColorTokens.lineSubtle}`,
        }}
      >
        {[
          {
            title: "Compare across markets",
            body: "Loans, cards, transfers, savings, investments, insurance — one ranking, one country.",
          },
          {
            title: "See real cost, not just APR",
            body: "We score each offer on the all-in cost so the headline rate stops being a trap.",
          },
          {
            title: "Save what you like",
            body: "Pin offers to your dashboard, get rate-change alerts when terms move.",
          },
        ].map((row) => (
          <table
            key={row.title}
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
            style={{ width: "100%", marginBottom: 14 }}
          >
            <tbody>
              <tr>
                <td valign="top" style={{ width: 28, paddingRight: 10 }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: ColorTokens.surfaceAccent,
                      color: ColorTokens.accentStrong,
                      fontWeight: 700,
                      fontSize: 12,
                      lineHeight: "22px",
                      textAlign: "center",
                    }}
                  >
                    ✓
                  </div>
                </td>
                <td valign="top">
                  <Text
                    style={{
                      ...TextStyles.body,
                      fontWeight: 700,
                      color: ColorTokens.ink,
                      margin: 0,
                    }}
                  >
                    {row.title}
                  </Text>
                  <Text
                    style={{
                      ...TextStyles.body,
                      margin: "2px 0 0",
                      fontSize: 14,
                    }}
                  >
                    {row.body}
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </Section>

      <Section style={{ marginTop: 24, textAlign: "center" }}>
        <Button href="https://www.payn.online/en/discover" style={ButtonStyles.primary}>
          Start comparing
        </Button>
      </Section>

      <Text style={TextStyles.muted}>
        Have a question? Reply to this email and a person will read it.
      </Text>
    </EmailLayout>
  );
}
