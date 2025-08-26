import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { verifyPassword } from "@/lib/crypto";
import { signAccessToken } from "@/lib/jwt";
import { createSession } from "@/lib/session";
import { setSessionCookie } from "@/lib/cookies";
import { env } from "@/lib/env";


export async function POST(req: Request) {
try {
const body = await req.json();
const parsed = loginSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });


const { email, password } = parsed.data;
const user = await prisma.user.findUnique({ where: { email } });
if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });


const ok = await verifyPassword(password, user.passwordHash);
if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });


// Create a server-side session (session store holds refresh state)
const ua = req.headers.get("user-agent") ?? undefined;
const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0] || undefined;
const sid = await createSession({ userId: user.id, role: user.role, ua, ip });


// Set HttpOnly cookie with session id
setSessionCookie(sid, env.SESSION_TTL_SEC);


// Issue short-lived access token (to be stored in-memory by client)
const accessToken = await signAccessToken({ sub: user.id, role: user.role });


return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role }, accessToken });
} catch (err) {
console.error(err);
return NextResponse.json({ error: "Server error" }, { status: 500 });
}
}