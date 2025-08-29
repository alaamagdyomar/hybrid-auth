// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuth } from "@/lib/auth";

export default async function HomePage() {
  const token = cookies().get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    await verifyAuth(token);
    redirect("/dashboard");
  } catch {
    redirect("/login");
  }
}
