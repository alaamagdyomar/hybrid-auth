import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, rotateSession } from "@/lib/session";
import { signAccessToken } from "@/lib/jwt";
import { setSessionCookie } from "@/lib/cookies";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const sid = cookies().get("sid")?.value;
  if (!sid) return NextResponse.json({ error: "No session" }, { status: 401 });

  const sess = await getSession(sid);
  if (!sess) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const newSid = await rotateSession(sid);
  if (!newSid) return NextResponse.json({ error: "Stale session" }, { status: 401 });

  setSessionCookie(newSid, env.SESSION_TTL_SEC);
  const accessToken = await signAccessToken({ sub: sess.userId, role: sess.role });
  return NextResponse.json({ accessToken });
}
