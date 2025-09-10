"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAccessToken, onTokenChange, refreshAccessTokenOnce, setAccessToken } from "@/lib/clientAuth";

type AuthCtx = {
  token: string | null;
  setToken: (t: string | null) => void;
  ready: boolean; // true after initial restore attempt
};

const Ctx = createContext<AuthCtx>({ token: null, setToken: () => {}, ready: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, _setToken] = useState<string | null>(getAccessToken());
  const [ready, setReady] = useState(false);

  // subscribe to token updates
  useEffect(() => {
    const off = onTokenChange(_setToken);
    return off;
  }, []);

  // silent restore on first load (if no token but cookie exists)
  useEffect(() => {
    (async () => {
      try {
        if (!getAccessToken()) {
          await refreshAccessTokenOnce(); // sets token if sid cookie is valid
        }
      } catch {
        // not logged in or session invalid
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo(() => ({ token, setToken: setAccessToken, ready }), [token, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
