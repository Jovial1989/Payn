import type { Metadata } from "next";

// BUG-015 — Imprint is mandatory under §5 TMG for any commercial
// site visible in Germany / Austria / Switzerland. Even if Payn is
// operated from elsewhere, German-language visitors expect this
// page; the absence of an Impressum is a textbook competitor-
// challenge in DACH markets.

export const metadata: Metadata = {
  title: "Imprint — Payn",
  description: "Operator details and regulatory contact for payn.online.",
};

export default function ImprintPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Legal
      </p>
      <h1>Imprint (Impressum)</h1>
      <p className="!text-ink-tertiary">Last updated: 25 May 2026</p>

      <h2>Operator</h2>
      <p>
        Kyrylo Petrov
        <br />
        Operating payn.online as a sole proprietor.
      </p>

      <h2>Contact</h2>
      <p>
        Email: <a href="mailto:hello@payn.online">hello@payn.online</a>
        <br />
        Press / partnerships:{" "}
        <a href="mailto:partnerships@payn.online">partnerships@payn.online</a>
      </p>

      <h2>Responsible for content (§ 18 Abs. 2 MStV)</h2>
      <p>Kyrylo Petrov, hello@payn.online.</p>

      <h2>EU online dispute resolution</h2>
      <p>
        The European Commission provides a platform for online dispute
        resolution:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        . Payn is not obligated and not willing to participate in dispute
        resolution proceedings before a consumer arbitration body.
      </p>

      <h2>Liability for content</h2>
      <p>
        As a service provider, we are responsible for our own content on these
        pages according to general laws. We are not obligated to monitor third-
        party information transmitted or stored, or to investigate
        circumstances that indicate illegal activity.
      </p>
    </>
  );
}
