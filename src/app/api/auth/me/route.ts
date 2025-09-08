import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { SESSION_COOKIE } from "@/lib/cookies";

export async function GET() {
  const sid = cookies().get(SESSION_COOKIE)?.value;
  if (!sid) return NextResponse.json({ user: null });
  const sess = await getSession(sid);
  if (!sess) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: sess.userId, role: sess.role } });
}
