import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, clearSessionCookie } from "@/lib/cookies";
import { revokeSession } from "@/lib/session";


export async function POST() {
try {
const sid = cookies().get(SESSION_COOKIE)?.value;
if (sid) await revokeSession(sid);
clearSessionCookie();
return NextResponse.json({ ok: true });
} catch (err) {
console.error(err);
return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}