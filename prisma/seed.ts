import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();


async function main() {
const email = "admin@example.com";
const passwordHash = await bcrypt.hash("Admin#12345", 12);
await prisma.user.upsert({
where: { email },
update: {},
create: { email, passwordHash, role: "ADMIN" },
});
console.log("Seeded admin@example.com / Admin#12345");
}


main().finally(() => prisma.$disconnect());