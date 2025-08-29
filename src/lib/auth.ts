// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

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
