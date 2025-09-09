// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Keep these inline so we don't import any Node/Redis code
const SESSION_COOKIE = "sid";
const PUBLIC_PATHS = ["/login", "/_next", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout", "/favicon.ico"];

// Which paths require auth
const PROTECTED_MATCHER = ["/dashboard/:path*", "/settings/:path*", "/admin/:path*"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // protect certain routes by cookie presence only
  const needsAuth =
    PROTECTED_MATCHER.some((p) => matchPath(pathname, p)) ||
    pathname === "/dashboard" || pathname === "/";

  if (!needsAuth) return NextResponse.next();

  // If no session cookie, redirect to login
  const sid = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sid) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Cookie exists -> let Node/API do the heavy checks (Redis/JWT) later
  return NextResponse.next();
}

// Very small matcher helper; avoids importing third-party libs
function matchPath(pathname: string, pattern: string) {
  // pattern like "/dashboard/:path*"
  if (pattern.endsWith("/:path*")) {
    const base = pattern.replace("/:path*", "");
    return pathname === base || pathname.startsWith(base + "/");
  }
  return pathname === pattern;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
