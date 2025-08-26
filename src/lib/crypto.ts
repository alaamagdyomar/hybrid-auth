import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";


export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);


export const randomToken = (bytes = 24) => randomBytes(bytes).toString("base64url");