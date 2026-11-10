import { NextResponse, type NextRequest } from "next/server";

/** Harus sama dengan SESSION_COOKIE di lib/session.ts (proxy tidak mengimpor modul server-only). */
const SESSION_COOKIE = "cms_session";

/**
 * Gerbang cepat: tanpa cookie sesi → /login. Validasi token yang sebenarnya
 * dilakukan di server (requireSession / sessionFor) dan oleh API.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname, search } = request.nextUrl;

  if (pathname === "/login") {
    return hasSession && !request.nextUrl.searchParams.has("expired")
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|placeholders/|favicon.ico|.*\\..*).*)"],
};
