import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeSession } from "@/lib/session";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/cookies";

export async function POST() {
  const sid = cookies().get(SESSION_COOKIE)?.value;
  if (sid) await revokeSession(sid);
  clearSessionCookie();
  return NextResponse.json({ ok: true });
}
