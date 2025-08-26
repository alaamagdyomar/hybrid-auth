import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";


const secret = new TextEncoder().encode(env.JWT_SECRET);


export type AccessClaims = { sub: string; role: string };


export async function signAccessToken(payload: AccessClaims) {
const now = Math.floor(Date.now() / 1000);
return await new SignJWT(payload)
.setProtectedHeader({ alg: "HS512", typ: "JWT" })
.setIssuedAt(now)
.setExpirationTime(now + env.ACCESS_TOKEN_TTL_SEC)
.sign(secret);
}


export async function verifyAccessToken(token: string) {
return await jwtVerify(token, secret, { algorithms: ["HS512"] });
}