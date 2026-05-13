import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { renderTemplate, type TemplateId } from "@/lib/email/templates";
import { renderEmail } from "@/lib/email/render";

type PreviewBody = {
  templateId: TemplateId;
  props?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as PreviewBody | null;
  if (!body?.templateId) {
    return NextResponse.json({ error: "templateId is required" }, { status: 400 });
  }

  try {
    const element = renderTemplate(body.templateId, body.props ?? {});
    const { html, text } = await renderEmail(element);
    return NextResponse.json({ html, text });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Render failed" }, { status: 500 });
  }
}
