/**
 * Render all email templates to public/_email-previews/{id}.html
 * Run: cd apps/web && npx tsx scripts/preview-emails.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import React, { createElement } from "react";
import { render } from "@react-email/render";
import { TEMPLATE_REGISTRY } from "../src/lib/email/templates";
import WelcomeEmail from "../src/emails/welcome";
import RateAlertEmail from "../src/emails/rate-alert";
import MonthlyDigestEmail from "../src/emails/monthly-digest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const components: Record<string, React.FC<any>> = { welcome: WelcomeEmail, "rate-alert": RateAlertEmail, "monthly-digest": MonthlyDigestEmail };

const outDir = join(process.cwd(), "public", "_email-previews");
mkdirSync(outDir, { recursive: true });

(async () => {
  for (const meta of Object.values(TEMPLATE_REGISTRY)) {
    const Component = components[meta.id];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = await render(createElement(Component, meta.sampleProps as any));
    const outPath = join(outDir, `${meta.id}.html`);
    writeFileSync(outPath, html);
    console.log(`✓  ${meta.id} → ${outPath}`);
  }
})();
