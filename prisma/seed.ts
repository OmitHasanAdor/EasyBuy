// prisma/seed.ts
import "dotenv/config";                                        // ← Must be FIRST line
import { PrismaClient } from "../src/generated/prisma/client"; // ← Prisma 7 path
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.warn("ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping admin seed.");
        return;
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

const DEMO_BUYERS = [
    {
        name: "Sophia Vance",
        email: "sophia.vance@easybuy.com",
        password: "EasyBuy123!",
        image: "/trial-room/avatars/female/female-avatar-01-tank-jeans.png",
    },
    {
        name: "Marcus Chen",
        email: "marcus.chen@easybuy.com",
        password: "EasyBuy123!",
        image: "/trial-room/avatars/male/male-avatar-01-athletic-tank-jeans.png",
    },
    {
        name: "Elena Rostova",
        email: "elena.rostova@easybuy.com",
        password: "EasyBuy123!",
        image: "/trial-room/avatars/female/female-avatar-08-bobhair-tank-jeans.png",
    },
];

async function seedDemoBuyers() {
    const { auth } = await import("../src/lib/auth");

    for (const buyer of DEMO_BUYERS) {
        const existing = await prisma.user.findUnique({ where: { email: buyer.email } });

        if (!existing) {
            await auth.api.signUpEmail({
                body: {
                    email: buyer.email,
                    password: buyer.password,
                    name: buyer.name,
                    image: buyer.image,
                },
            });
            console.log("Created demo buyer:", buyer.email, `(${buyer.name})`);
        } else {
            console.log("Demo buyer already exists:", buyer.email);
        }

        await prisma.user.update({
            where: { email: buyer.email },
            data: {
                role: "buyer",
                image: buyer.image,
                status: "active",
            },
        });
    }
    console.log("✅ All demo buyers verified with avatars and credentials.");

    // Also set avatar for existing demo buyer eshams05@gmail.com if present
    const eshams = await prisma.user.findUnique({ where: { email: "eshams05@gmail.com" } });
    if (eshams) {
        await prisma.user.update({
            where: { email: "eshams05@gmail.com" },
            data: { image: "/trial-room/avatars/female/female-avatar-01-tank-jeans.png" },
        });
        console.log("Updated avatar for eshams05@gmail.com");
    }
}

async function main() {
    await seedAdmin();
    await seedDemoBuyers();
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

