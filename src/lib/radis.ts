import { Redis } from "@upstash/redis";
import { env } from "./env";


// Upstash (serverless-friendly):
export const redis = new Redis({
url: env.UPSTASH_REDIS_REST_URL,
token: env.UPSTASH_REDIS_REST_TOKEN,
});


/* If you prefer self-hosted Redis with ioredis:
import IORedis from "ioredis";
export const redis = new IORedis(process.env.REDIS_URL!);
*/