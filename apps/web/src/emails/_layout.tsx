import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

// ─── Payn-brand email shell ──────────────────────────────────────────────────
//
// Mirrors the design tokens declared in CLAUDE.md so transactional and
// marketing emails feel like the same product as the dashboard:
//   • Manrope (web font with Apple system fallback for clients that
//     block remote fonts: Gmail iOS, native Outlook on Windows, etc).
//   • Emerald 0F8A4B accent on CTAs + a tinted bar above the logo to
//     hint at the brand without printing the full lockup twice.
//   • Surface-muted (#f5f7f4) page background; #FFFFFF card with the
//     same rounded-2xl + soft shadow + 1px hairline border used by
//     dashboard surfaces.
//   • Footer block carries the legal address, unsubscribe link, and a
//     muted byline so the design system reads as one product.
//
// Children are normal React-Email components — block them with
// generous vertical padding (24/32) and use ColorTokens for any custom
// inline styles to keep palette drift out.

export const ColorTokens = {
  bg: "#f5f7f4",
  surface: "#ffffff",
  surfaceMuted: "#f5f7f4",
  surfaceAccent: "#ddf4e7",
  accent: "#0f8a4b",
  accentStrong: "#0b6d3b",
  ink: "#111827",
  inkSecondary: "#4b5563",
  inkTertiary: "#8a94a6",
  lineSubtle: "rgba(17, 24, 39, 0.08)",
  lineStrong: "rgba(17, 24, 39, 0.14)",
} as const;

const FONT_STACK =
  '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

const body: CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: ColorTokens.bg,
  fontFamily: FONT_STACK,
  color: ColorTokens.ink,
  WebkitFontSmoothing: "antialiased",
};

const outerSection: CSSProperties = {
  padding: "40px 16px 56px",
};

const card: CSSProperties = {
  backgroundColor: ColorTokens.surface,
  maxWidth: 560,
  margin: "0 auto",
  borderRadius: 20,
  border: `1px solid ${ColorTokens.lineSubtle}`,
  boxShadow: "0 10px 30px rgba(15, 23, 32, 0.05)",
  overflow: "hidden",
};

const accentBar: CSSProperties = {
  height: 6,
  background:
    `linear-gradient(90deg, ${ColorTokens.accent} 0%, #1BE39A 60%, #0A6B46 100%)`,
};

const header: CSSProperties = {
  padding: "28px 32px 8px",
};

const lockup: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
};

const wordmark: CSSProperties = {
  fontFamily: FONT_STACK,
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  color: ColorTokens.ink,
  margin: 0,
};

const main: CSSProperties = {
  padding: "16px 32px 32px",
};

const footer: CSSProperties = {
  padding: "20px 32px 28px",
  backgroundColor: ColorTokens.surfaceMuted,
};

const footerText: CSSProperties = {
  fontSize: 12,
  lineHeight: "18px",
  color: ColorTokens.inkTertiary,
  margin: "8px 0 0",
};

const footerLink: CSSProperties = {
  color: ColorTokens.inkSecondary,
  textDecoration: "underline",
  textUnderlineOffset: "2px",
};

export interface EmailLayoutProps {
  preview: string;
  unsubscribeUrl?: string;
  children: ReactNode;
}

export function EmailLayout({
  preview,
  unsubscribeUrl,
  children,
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        {/* Most clients ignore web fonts (Gmail iOS/Android, native
            Outlook). We embed Manrope via a plain @import so Apple Mail,
            Thunderbird, and webmail render the brand face; everything
            else falls back to the Apple system stack which already
            mirrors Manrope's metrics closely. */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={outerSection}>
          <Container style={card}>
            <Section style={accentBar} />
            <Section style={header}>
              <table cellPadding={0} cellSpacing={0} role="presentation" style={lockup}>
                <tbody>
                  <tr>
                    <td valign="middle">
                      <Img
                        src="https://www.payn.online/logo-email.png"
                        width="36"
                        height="36"
                        alt="Payn"
                        style={{
                          display: "block",
                          borderRadius: 10,
                        }}
                      />
                    </td>
                    <td valign="middle" style={{ paddingLeft: 10 }}>
                      <Text style={wordmark}>Payn</Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
            <Section style={main}>{children}</Section>
            <Hr style={{ margin: 0, borderColor: ColorTokens.lineSubtle }} />
            <Section style={footer}>
              <Text style={footerText}>
                Payn helps you compare loans, cards, transfers, and savings
                across Europe — ranked by what you&apos;ll actually pay.
              </Text>
              {unsubscribeUrl ? (
                <Text style={footerText}>
                  <Link href={unsubscribeUrl} style={footerLink}>
                    Unsubscribe
                  </Link>{" "}
                  from marketing emails · You&apos;ll still receive critical
                  account messages.
                </Text>
              ) : null}
              <Text
                style={{
                  ...footerText,
                  fontSize: 11,
                  color: ColorTokens.inkTertiary,
                  marginTop: 12,
                }}
              >
                Payn · payn.online · sent from{" "}
                <Link
                  href="https://www.payn.online"
                  style={{ color: ColorTokens.inkTertiary, textDecoration: "none" }}
                >
                  noreply@payn.online
                </Link>
              </Text>
            </Section>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}

// Shared building blocks — pull from these in templates so every
// transactional email looks identical without copy-pasting inline styles.

export const TextStyles = {
  heading: {
    fontFamily: FONT_STACK,
    fontSize: 26,
    lineHeight: "32px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    color: ColorTokens.ink,
    margin: "0 0 12px",
  } as CSSProperties,
  body: {
    fontFamily: FONT_STACK,
    fontSize: 15,
    lineHeight: "24px",
    color: ColorTokens.inkSecondary,
    margin: "0 0 16px",
  } as CSSProperties,
  muted: {
    fontFamily: FONT_STACK,
    fontSize: 13,
    lineHeight: "20px",
    color: ColorTokens.inkTertiary,
    margin: "16px 0 0",
  } as CSSProperties,
  eyebrow: {
    fontFamily: FONT_STACK,
    fontSize: 11,
    lineHeight: "16px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: ColorTokens.accent,
    margin: "0 0 8px",
  } as CSSProperties,
} as const;

export const ButtonStyles = {
  primary: {
    backgroundColor: ColorTokens.accent,
    color: "#ffffff",
    padding: "14px 24px",
    borderRadius: 999,
    textDecoration: "none",
    fontFamily: FONT_STACK,
    fontSize: 15,
    fontWeight: 700,
    display: "inline-block",
    boxShadow: "0 10px 24px rgba(15, 138, 75, 0.22)",
  } as CSSProperties,
  ghost: {
    backgroundColor: ColorTokens.surfaceAccent,
    color: ColorTokens.accentStrong,
    padding: "12px 20px",
    borderRadius: 999,
    textDecoration: "none",
    fontFamily: FONT_STACK,
    fontSize: 14,
    fontWeight: 700,
    display: "inline-block",
  } as CSSProperties,
} as const;

export const MetricCardStyles = {
  wrap: {
    backgroundColor: ColorTokens.surfaceMuted,
    borderRadius: 16,
    padding: "16px 20px",
    margin: "16px 0",
  } as CSSProperties,
  label: {
    fontFamily: FONT_STACK,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: ColorTokens.inkTertiary,
    margin: 0,
  } as CSSProperties,
  value: {
    fontFamily: FONT_STACK,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.01em",
    color: ColorTokens.ink,
    margin: "4px 0 0",
  } as CSSProperties,
} as const;
