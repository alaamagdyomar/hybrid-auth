import { redis } from "./radis";
import { randomToken } from "./crypto";
import { env } from "./env";


const PREFIX = "sess:";


export type SessionData = {
userId: string;
role: string;
ua?: string;
ip?: string;
ver: number; // rotation version counter
createdAt: number; // epoch ms
updatedAt: number; // epoch ms
};


export async function createSession(inp: Omit<SessionData, "ver"|"createdAt"|"updatedAt">) {
const sid = randomToken(24);
const now = Date.now();
const data: SessionData = { ...inp, ver: 1, createdAt: now, updatedAt: now };
await redis.set(PREFIX + sid, data, { ex: env.SESSION_TTL_SEC });
return sid;
}


export async function getSession(sid: string): Promise<SessionData | null> {
const data = await redis.get<SessionData>(PREFIX + sid);
return data ?? null;
}


export async function touchSession(sid: string) {
// Extend TTL without rotation (optional). Upstash doesn't support EXPIRE via HTTP get directly; re-set value.
const key = PREFIX + sid;
const data = await redis.get<SessionData>(key);
if (data) {
data.updatedAt = Date.now();
await redis.set(key, data, { ex: env.SESSION_TTL_SEC });
}
}


export async function rotateSession(oldSid: string) {
const old = await getSession(oldSid);
if (!old) return null;
const newSid = randomToken(24);
const now = Date.now();
const next = { ...old, ver: old.ver + 1, updatedAt: now };
await redis.set(PREFIX + newSid, next, { ex: env.SESSION_TTL_SEC });
await redis.del(PREFIX + oldSid);
return newSid;
}


export async function revokeSession(sid: string) {
await redis.del(PREFIX + sid);
}