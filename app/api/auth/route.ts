import { NextResponse } from "next/server";
import crypto from "crypto";

function generateToken(): string {
  const secret = process.env.AUTH_PASSWORD ?? "fallback";
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${hmac}`;
}

function verifyToken(token: string): boolean {
  const secret = process.env.AUTH_PASSWORD ?? "fallback";
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, hash] = parts;
  const expected = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  if (hash !== expected) return false;
  // Token valid for 7 days
  const age = Date.now() - parseInt(timestamp, 10);
  return age < 7 * 24 * 60 * 60 * 1000;
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const validUser = process.env.AUTH_USERNAME;
  const validPass = process.env.AUTH_PASSWORD;

  if (!validUser || !validPass) {
    return NextResponse.json(
      { error: "Authentication not configured" },
      { status: 500 }
    );
  }

  if (username === validUser && password === validPass) {
    const token = generateToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set("tax-guide-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
