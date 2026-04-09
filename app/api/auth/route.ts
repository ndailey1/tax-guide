import { NextResponse } from "next/server";

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
    const response = NextResponse.json({ success: true });
    response.cookies.set("tax-guide-auth", "authenticated", {
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
