import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/cookies";
import { getSession } from "@/lib/session";


export async function GET() {
try {
const sid = cookies().get(SESSION_COOKIE)?.value;
if (!sid) return NextResponse.json({ user: null });
const sess = await getSession(sid);
if (!sess) return NextResponse.json({ user: null });
return NextResponse.json({ user: { id: sess.userId, role: sess.role } });
} catch (err) {
console.error(err);
return NextResponse.json({ user: null });
}
}