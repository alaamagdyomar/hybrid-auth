import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const [, token] = auth.split(" ");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { payload } = await verifyAccessToken(token);
    return NextResponse.json({ ok: true, user: { id: payload.sub, role: (payload as any).role } });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
