"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

export default function LogoutButton() {
  const router = useRouter();
  const { setToken } = useAuth();

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setToken(null);
    router.replace("/login");
  }

  return (
    <button onClick={doLogout} className="px-3 py-2 rounded bg-gray-800 text-white">
      Logout
    </button>
  );
}
