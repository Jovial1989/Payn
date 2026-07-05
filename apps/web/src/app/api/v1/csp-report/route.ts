import { NextResponse } from "next/server";

/**
 * CSP violation report receiver.
 * Browsers POST here when a Content-Security-Policy directive is violated.
 * Reports are logged server-side for security monitoring.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    // Log for monitoring — in production pipe to your observability stack
    console.warn("[csp-violation]", JSON.stringify(body));
  } catch {
    // Ignore malformed reports
  }
  // Spec requires 204 No Content
  return new NextResponse(null, { status: 204 });
}
