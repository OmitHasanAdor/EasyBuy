// prisma/seed.ts
import "dotenv/config";                                        // ← Must be FIRST line
import { PrismaClient } from "../src/generated/prisma/client"; // ← Prisma 7 path
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
        process.exit(1);
    }

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existing) {
        const { auth } = await import("../src/lib/auth");
        await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: "EasyBuy Admin",
            },
        });
        console.log("Admin account created:", adminEmail);
    } else {
        console.log("Admin already exists:", adminEmail);
    }

    await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin" },
    });

    console.log("Admin role verified.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
