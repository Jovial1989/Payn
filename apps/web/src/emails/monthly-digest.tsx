import { Link, Section, Text } from "@react-email/components";
import {
  ColorTokens,
  EmailLayout,
  TextStyles,
} from "./_layout";

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
      preview={`Top offers in ${country} for ${month}.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={TextStyles.eyebrow}>{month} · {country}</Text>
      <Text style={TextStyles.heading}>Your top offers this month</Text>
      <Text style={TextStyles.body}>
        {greeting} here are the highest-ranked financial products for {country}
        right now — based on published terms and our scoring model, not paid
        placement.
      </Text>

      <Section
        style={{
          margin: "20px 0 8px",
          padding: 0,
          border: `1px solid ${ColorTokens.lineSubtle}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {topOffers.map((offer, i) => (
          <table
            key={`${offer.providerName}-${offer.category}-${i}`}
            cellPadding={0}
            cellSpacing={0}
            role="presentation"
            style={{
              width: "100%",
              borderTop:
                i === 0 ? "none" : `1px solid ${ColorTokens.lineSubtle}`,
              backgroundColor: ColorTokens.surface,
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "18px 20px" }}>
                  <table
                    cellPadding={0}
                    cellSpacing={0}
                    role="presentation"
                    style={{ width: "100%" }}
                  >
                    <tbody>
                      <tr>
                        <td valign="middle">
                          <Text
                            style={{
                              ...TextStyles.eyebrow,
                              color: ColorTokens.accentStrong,
                              margin: 0,
                              fontSize: 10,
                            }}
                          >
                            #{i + 1} · {offer.category}
                          </Text>
                          <Text
                            style={{
                              ...TextStyles.body,
                              fontSize: 16,
                              fontWeight: 700,
                              color: ColorTokens.ink,
                              margin: "4px 0 2px",
                            }}
                          >
                            {offer.providerName}
                          </Text>
                          <Text
                            style={{
                              ...TextStyles.body,
                              fontSize: 14,
                              margin: 0,
                            }}
                          >
                            {offer.headline}
                          </Text>
                        </td>
                        <td valign="middle" align="right" style={{ width: 100 }}>
                          <Link
                            href={offer.url}
                            style={{
                              fontFamily: TextStyles.body.fontFamily,
                              fontSize: 14,
                              fontWeight: 700,
                              color: ColorTokens.accent,
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            See offer →
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </Section>

      <Text style={TextStyles.muted}>
        Rankings are based on published terms and our scoring model — never paid
        placement. We earn from affiliate links only when a provider monetises;
        the ordering doesn&apos;t change based on payouts.
      </Text>
    </EmailLayout>
  );
}
