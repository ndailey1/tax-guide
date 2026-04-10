import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

function verifyToken(token: string): boolean {
  const secret = process.env.AUTH_PASSWORD ?? "fallback";
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, hash] = parts;
  const expected = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  if (hash !== expected) return false;
  const age = Date.now() - parseInt(timestamp, 10);
  return age < 7 * 24 * 60 * 60 * 1000;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and auth API routes through
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie with valid token
  const authCookie = request.cookies.get("tax-guide-auth");

  if (!authCookie || !verifyToken(authCookie.value)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
