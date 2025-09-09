// Tiny in-memory access token store + single-flight refresh

let accessToken: string | null = null;
const listeners = new Set<(t: string | null) => void>();
let inflightRefresh: Promise<string> | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(t: string | null) {
  accessToken = t;
  listeners.forEach(fn => fn(t));
}

export function onTokenChange(fn: (t: string | null) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Call /api/auth/refresh once even if multiple requests need it simultaneously
export async function refreshAccessTokenOnce(): Promise<string> {
  if (!inflightRefresh) {
    inflightRefresh = (async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // send sid cookie
      });
      if (!res.ok) {
        setAccessToken(null);
        inflightRefresh = null;
        throw new Error("refresh failed");
      }
      const { accessToken } = await res.json();
      setAccessToken(accessToken);
      inflightRefresh = null;
      return accessToken;
    })();
  }
  return inflightRefresh;
}
