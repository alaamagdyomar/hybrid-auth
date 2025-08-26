import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, setSessionCookie } from "@/lib/cookies";
import { getSession, rotateSession } from "@/lib/session";
import { signAccessToken } from "@/lib/jwt";
import { env } from "@/lib/env";


export async function POST(req: Request) {
try {
const sid = cookies().get(SESSION_COOKIE)?.value;
if (!sid) return NextResponse.json({ error: "No session" }, { status: 401 });


const sess = await getSession(sid);
if (!sess) return NextResponse.json({ error: "Invalid session" }, { status: 401 });


// rotate session id to prevent fixation and replay
const newSid = await rotateSession(sid);
if (!newSid) return NextResponse.json({ error: "Stale session" }, { status: 401 });


// set new cookie for the rotated session
setSessionCookie(newSid, env.SESSION_TTL_SEC);


// issue a new short-lived access token
const accessToken = await signAccessToken({ sub: sess.userId, role: sess.role });


return NextResponse.json({ accessToken });
} catch (err) {
console.error(err);
return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}