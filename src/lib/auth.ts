// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { loginSchema } from "./validators";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/crypto";
import { signAccessToken } from "@/lib/jwt";
import { createSession } from "@/lib/session";
import { setSessionCookie } from "./cookies";
import { env } from "./env";


const secretKey = process.env.JWT_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

// Type for JWT payload
export interface AuthPayload {
  userId: string;
  email: string;
}

// Generate a JWT
export async function signAuth(payload: AuthPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h") // token valid for 1 hour
    .sign(encodedKey);
}

// Verify a JWT (used in middleware & protected routes)
export async function verifyAuth(token: string): Promise<AuthPayload> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as AuthPayload;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

// export async function loginUser(email: string, password: string, ua?: string, ip?: string) {
//   const user = await prisma.user.findUnique({ where: { email } });
//   if (!user) return null;

//   const ok = await verifyPassword(password, user.passwordHash);
//   if (!ok) return null;

//   const sid = await createSession({ userId: user.id, role: user.role, ua, ip });
//   const accessToken = await signAccessToken({ sub: user.id, role: user.role });

//   return { user, accessToken, sid };
// }

export async function loginUser(body: unknown, reqHeaders: Headers) {
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) throw new Error("Invalid input");

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("Invalid credentials");

  const ua = reqHeaders.get("user-agent") ?? undefined;
  const ip = (reqHeaders.get("x-forwarded-for") ?? "").split(",")[0] || undefined;
  const sid = await createSession({ userId: user.id, role: user.role, ua, ip });

  // set cookie (note: when called from route handler, use cookies() there.
  setSessionCookie(sid, env.SESSION_TTL_SEC);

  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  return { user: { id: user.id, email: user.email, role: user.role }, accessToken, sid };
}
