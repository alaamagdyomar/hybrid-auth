// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuth } from "./lib/auth"; // custom helper

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  // Public routes (no need to be logged in)
  const publicPaths = ["/login"];
  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // If no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify JWT
  try {
    await verifyAuth(token);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/"], // Protect root + dashboard
};
