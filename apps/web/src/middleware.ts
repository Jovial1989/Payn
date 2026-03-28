import { type NextRequest, NextResponse } from "next/server";
import { supportedLocales, detectPreferencesFromAcceptLanguage, isSupportedLocale } from "@/lib/marketplace";

const PUBLIC_FILE = /\.(.*)$/;
const SKIP_PREFIXES = ["/_next", "/api", "/auth", "/icon.svg", "/kyrylo.jpeg"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, Next.js internals, and API routes
  if (
    PUBLIC_FILE.test(pathname) ||
    SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Check if the first segment is a supported locale
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isSupportedLocale(firstSegment)) {
    // URL already has locale prefix — strip it and rewrite internally
    const locale = firstSegment;
    const restPath = "/" + segments.slice(1).join("/");

    const response = NextResponse.rewrite(new URL(restPath, request.url));
    response.headers.set("x-payn-locale", locale);
    response.cookies.set("payn-locale", locale, { path: "/", maxAge: 31536000 });
    return response;
  }

  // No locale prefix — detect locale and redirect
  const cookieLocale = request.cookies.get("payn-locale")?.value;
  const detected = detectPreferencesFromAcceptLanguage(
    request.headers.get("accept-language"),
  );
  const locale =
    cookieLocale && isSupportedLocale(cookieLocale)
      ? cookieLocale
      : detected.locale;

  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  redirectUrl.search = request.nextUrl.search;
  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
