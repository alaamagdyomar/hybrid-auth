import { getAccessToken, refreshAccessTokenOnce, setAccessToken } from "./clientAuth";

// Usage: const res = await apiFetch("/api/secret");
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  // Attach current token
  const token = getAccessToken();
  const headers = new Headers(init?.headers as HeadersInit);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers, credentials: "include" });

  // If not unauthorized, return as-is
  if (res.status !== 401) return res;

  // Try a single refresh, then retry once
  try {
    const newToken = await refreshAccessTokenOnce();
    const h2 = new Headers(init?.headers as HeadersInit);
    h2.set("Authorization", `Bearer ${newToken}`);
    res = await fetch(input, { ...init, headers: h2, credentials: "include" });
    return res;
  } catch {
    setAccessToken(null);
    return res; // original 401
  }
}
