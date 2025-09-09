// src/lib/redis.ts
import { env } from "./env";

export function getRedis() {
  // Only allow in Node runtime (API routes, server actions). Not in Edge/middleware.
  if (typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge") {
    // lazy require so Edge bundler doesn’t include the TCP client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IORedis = require("ioredis");
    const url = env.REDIS_URL || "redis://127.0.0.1:6379";
    return new IORedis(url);
  }
  throw new Error("Redis not available in this runtime (Edge). Do not import redis in middleware.");
}

export const redis = getRedis();
