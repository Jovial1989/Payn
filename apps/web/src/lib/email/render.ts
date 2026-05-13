import { render } from "@react-email/render";
import type { ReactNode } from "react";

export async function renderEmail(component: ReactNode): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ]);
  return { html, text };
}
