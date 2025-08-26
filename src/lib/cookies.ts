import { cookies } from "next/headers";


const common = {
httpOnly: true,
secure: process.env.NODE_ENV === "production",
sameSite: "strict" as const,
path: "/",
};


export const SESSION_COOKIE = "sid"; // holds session id only


export function setSessionCookie(sid: string, maxAgeSec: number) {
cookies().set(SESSION_COOKIE, sid, { ...common, maxAge: maxAgeSec });
}


export function clearSessionCookie() {
cookies().set(SESSION_COOKIE, "", { ...common, maxAge: 0 });
}