import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await loginUser(body, req.headers);
    // loginUser already set cookie via cookies() if implemented; otherwise set here
    return NextResponse.json({ user: res.user, accessToken: res.accessToken });
  } catch (err: any) {
    console.error(err);
    const msg = typeof err?.message === "string" ? err.message : "Server error";
    const status = msg.includes("credentials") ? 401 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
