export const env = {
NODE_ENV: process.env.NODE_ENV ?? "development",
DATABASE_URL: process.env.DATABASE_URL ?? "",
JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
ACCESS_TOKEN_TTL_SEC: Number(process.env.ACCESS_TOKEN_TTL_SEC ?? 900),
SESSION_TTL_SEC: Number(process.env.SESSION_TTL_SEC ?? 1209600),
// Upstash (preferred). If using ioredis, replace lib/redis.ts accordingly.
UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
};