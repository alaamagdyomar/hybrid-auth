// Simple fetch wrapper. You will provide the access token string from context/hook.
export async function apiFetch(token: string | null, input: RequestInfo, init?: RequestInit) {
const headers = new Headers(init?.headers as HeadersInit);
if (token) headers.set("Authorization", `Bearer ${token}`);
let res = await fetch(input, { ...init, headers, credentials: "include" });
if (res.status !== 401) return res;


// try to refresh (cookie-based sid sent automatically)
const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
if (r.ok) {
const { accessToken } = await r.json();
// retry with new token
const h2 = new Headers(init?.headers as HeadersInit);
h2.set("Authorization", `Bearer ${accessToken}`);
res = await fetch(input, { ...init, headers: h2, credentials: "include" });
// expose new token to caller
(res as any).__newAccessToken = accessToken;
}
return res;
}