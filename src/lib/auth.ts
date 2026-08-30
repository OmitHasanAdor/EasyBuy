import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    // ── Database ──────────────────────────────────────────────────────────────
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // ── Email & Password ──────────────────────────────────────────────────────
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
    },

    // ── Custom User Fields ────────────────────────────────────────────────────
    user: {
        additionalFields: {
            status: {
                type: "string",
                defaultValue: "active",
                input: false,
            },
            phone: {
                type: "string",
                required: false,
            },
        },
    },

    // ── Plugins ───────────────────────────────────────────────────────────────
    plugins: [
        // Admin plugin — gives auth.api.setRole(), banUser(), etc.
        admin({
            defaultRole: "buyer",
            adminRoles: ["admin"],
        }),

        // JWT plugin — issues tokens so the Express backend can verify users
        jwt({
            jwt: {
                // Include role in the JWT payload so the Express backend
                // can check it without hitting the database.
                definePayload: (session) => ({
                    id: session.user.id,
                    email: session.user.email,
                    role: session.user.role,
                    name: session.user.name,
                }),
            },
        }),

        // Makes session cookies work correctly in Next.js App Router
        nextCookies(),
    ],

    // ── Session Config ────────────────────────────────────────────────────────
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5-minute cookie cache to reduce DB reads
        },
    },

    // ── Core Config ───────────────────────────────────────────────────────────
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL:
        process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000"),
});

// ── TypeScript Type Export ────────────────────────────────────────────────────
// Use this type anywhere you need session data with full type safety.
export type Session = typeof auth.$Infer.Session;