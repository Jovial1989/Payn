import { Html, Head, Preview, Body, Container, Section, Img, Text, Hr, Link } from "@react-email/components";
import type { ReactNode } from "react";

export interface EmailLayoutProps {
  preview: string;
  unsubscribeUrl?: string;
  children: ReactNode;
}

export function EmailLayout({ preview, unsubscribeUrl, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f6f6f6", fontFamily: "Inter, -apple-system, system-ui, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: "white", padding: "32px", maxWidth: "560px", margin: "32px auto", borderRadius: "12px" }}>
          <Section>
            <Img src="https://www.payn.online/logo-email.png" width="48" height="48" alt="Payn" />
          </Section>
          {children}
          <Hr style={{ marginTop: "32px", borderColor: "#e5e7eb" }} />
          <Section>
            <Text style={{ fontSize: "12px", color: "#6b7280", lineHeight: "18px" }}>
              Payn helps you compare financial products across Europe.
              {unsubscribeUrl && (
                <>
                  {" "}
                  <Link href={unsubscribeUrl} style={{ color: "#6b7280", textDecoration: "underline" }}>
                    Unsubscribe
                  </Link>
                  {" "}from marketing emails.
                </>
              )}
            </Text>
            <Text style={{ fontSize: "11px", color: "#9ca3af" }}>
              Payn Ltd · Compare financial products across Europe · payn.online
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
