"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { apiFetch } from "@/lib/apiFetch";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardPage() {
  const router = useRouter();
  const { token, ready } = useAuth();
  const [resp, setResp] = useState<string>("Loading…");

  useEffect(() => {
    if (!ready) return; // wait for silent restore

    if (!token) {
      router.replace("/login?next=/dashboard");
      return;
    }

    (async () => {
      const res = await apiFetch("/api/secret");
      if (!res.ok) {
        router.replace("/login?next=/dashboard");
        return;
      }
      const data = await res.json();
      setResp(JSON.stringify(data, null, 2));
    })();
  }, [ready, token, router]);

  if (!ready) return <main className="p-6">Checking session…</main>;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <LogoutButton />
      </div>
      <pre className="p-3 bg-gray-100 rounded">{resp}</pre>
    </main>
  );
}
