import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/crypto";


export async function POST(req: Request) {
const body = await req.json();
const parsed = registerSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });


const { email, password } = parsed.data;
const existing = await prisma.user.findUnique({ where: { email } });
if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });


const passwordHash = await hashPassword(password);
await prisma.user.create({ data: { email, passwordHash, role: "USER" } });
return NextResponse.json({ success: true });
}