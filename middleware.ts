import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.AUTH_PASSWORD ?? "fallback";
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, hash] = parts;

  // Use Web Crypto API (Edge Runtime compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(timestamp));
  const expected = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hash !== expected) return false;
  const age = Date.now() - parseInt(timestamp, 10);
  return age < 7 * 24 * 60 * 60 * 1000;
}

export async function middleware(request: NextRequest) {
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

  if (!authCookie || !(await verifyToken(authCookie.value))) {
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
