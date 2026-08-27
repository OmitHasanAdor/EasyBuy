# EasyBuy Authentication Guide
### Role-Based Auth with Better Auth + Prisma + PostgreSQL (TypeScript)

> **Written for**: EasyBuy eCommerce platform — Next.js frontend + separate Express/Fastify backend  
> **Based on**: Analysis of Medicare Connect project + latest Better Auth & PostgreSQL docs (2026)  
> **Stack**: Next.js (App Router) · TypeScript · Better Auth · Prisma · PostgreSQL

---

## 📋 Table of Contents

1. [Architecture Overview — Why JWT is Needed](#1-architecture-overview--why-jwt-is-needed)
2. [What You Had in Medicare Connect](#2-what-you-had-in-medicare-connect)
3. [EasyBuy vs Medicare: Role Mapping](#3-easybuy-vs-medicare-role-mapping)
4. [Did Doctors Retain Patient Features?](#4-did-doctors-retain-patient-features)
5. [PostgreSQL Setup — Local (Docker) & Cloud (Neon)](#5-postgresql-setup--local-docker--cloud-neon)
6. [Shared Database — Auth + Backend in One DB](#6-shared-database--auth--backend-in-one-db)
7. [Defining the Prisma Schema](#7-defining-the-prisma-schema)
8. [Configuring Better Auth with JWT (auth.ts)](#8-configuring-better-auth-with-jwt-authts)
9. [Creating the Auth Client (auth-client.ts)](#9-creating-the-auth-client-auth-clientts)
10. [The Route Handler](#10-the-route-handler)
11. [Seeding the Admin Account](#11-seeding-the-admin-account)
12. [Route Protection Patterns (Next.js)](#12-route-protection-patterns-nextjs)
13. [Using JWT in Your Frontend (calling backend)](#13-using-jwt-in-your-frontend-calling-backend)
14. [Verifying JWT in Your Express Backend](#14-verifying-jwt-in-your-express-backend)
15. [Seller Application & Admin Approval Flow](#15-seller-application--admin-approval-flow)
16. [Session Access Cheatsheet](#16-session-access-cheatsheet)
17. [Key Differences from Medicare Connect](#17-key-differences-from-medicare-connect)
18. [Common Pitfalls to Avoid](#18-common-pitfalls-to-avoid)
19. [Environment Variables Checklist](#19-environment-variables-checklist)

---

## 1. Architecture Overview — Why JWT is Needed

This is the critical piece to understand first. EasyBuy has **two separate server processes**:

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                          │
└────────────────────┬─────────────────────┬──────────────────┘
                     │                     │
         Page loads / UI           API calls for products,
                     │             orders, cart, etc.
                     ▼                     ▼
┌──────────────────────────┐   ┌─────────────────────────┐
│   Next.js App            │   │   Express/Fastify        │
│   (Port 3000)            │   │   Backend (Port 5000)    │
│                          │   │                          │
│  • Better Auth lives here│   │  • Products API          │
│  • Issues JWT tokens     │   │  • Orders API            │
│  • Manages sessions      │   │  • Cart, Reviews, etc.   │
│  • Next.js pages/layouts │   │  • Needs to verify who   │
│                          │   │    the caller is         │
└──────────────┬───────────┘   └───────────┬─────────────┘
               │                           │
               └───────────┬───────────────┘
                            │
                   Both connect to the
                   SAME PostgreSQL DB
                            │
               ┌────────────▼────────────┐
               │   PostgreSQL Database    │
               │                          │
               │  • Better Auth tables    │
               │    (user, session, etc.) │
               │  • EasyBuy tables        │
               │    (product, order, etc.)│
               └──────────────────────────┘
```

### The Problem

The Express backend runs as a separate process. It has **no access to Better Auth's session system** — it can't call `auth.api.getSession()` because that's in Next.js. So how does it know who is calling it?

### The Solution: JWT (JSON Web Token)

Better Auth's JWT plugin issues a **signed token** when the user logs in. The frontend attaches this token to every request to the Express backend. The backend verifies the token's signature independently — **without needing to talk to Next.js or the database**.

```
1. User logs in via Next.js/Better Auth
2. Better Auth issues a JWT (signed with RS256 asymmetric keys)
3. Frontend stores the JWT and attaches it to backend API requests
4. Express backend verifies the JWT signature using Better Auth's JWKS endpoint
5. Decoded JWT payload contains: user ID, email, role → no DB query needed
```

### Why JWKS, not the Shared Secret?

In Medicare, the JWT was likely verified using the `BETTER_AUTH_SECRET` (symmetric HMAC). The **modern standard in 2026** is to use **JWKS (JSON Web Key Set)** — Better Auth's JWT plugin automatically uses RS256 (asymmetric keys), exposing a public JWKS endpoint. Your Express backend fetches these public keys and verifies tokens with them.

**Benefits:**
- ✅ You never share the `BETTER_AUTH_SECRET` with the backend (security)
- ✅ Key rotation works automatically
- ✅ Industry standard for microservice/distributed auth

---

## 2. What You Had in Medicare Connect

After studying every relevant file in your old project, here is an exact summary:

### Auth Library & Config
- **Better Auth** with MongoDB adapter
- Plugins: `jwt()`, `nextCookies()`
- `role` as `additionalFields` with `defaultValue: "patient"`

### User Schema
```
role   → string, default: "patient"
phone  → string, optional
gender → string, optional
status → string, default: "active"
```

### Roles & How They Were Assigned
| Role | How Assigned |
|------|-------------|
| `admin` | Seeded at startup from `ADMIN_EMAIL` env var, role set directly in MongoDB |
| `doctor` | Admin approves a doctor application via the Express backend; Express updated the MongoDB role |
| `patient` | Default — every new user |

### Key Pattern: Token Usage
In `admin/doctors/page.jsx` and `admin/users/page.jsx`:
```js
const tokenRes = await authClient.token();
const tokenValue = tokenRes?.data?.token || "";
// sent as Authorization: Bearer <tokenValue> to Express
```
This is **identical** to what EasyBuy will do.

### ⚠️ Bugs Found in Medicare (Fix These in EasyBuy)
1. **Doctor and Patient layouts had NO server-side role guard** — anyone could access them
2. **Admin seeding was inline at module load** — messy and ran on every hot reload
3. **Role was directly written to MongoDB** instead of using `auth.api.setRole()`

---

## 3. EasyBuy vs Medicare: Role Mapping

| Medicare Connect | EasyBuy | Notes |
|-----------------|---------|-------|
| `patient` | `buyer` | Default role for all new users |
| `doctor` | `seller` | Promoted from buyer upon admin approval |
| `admin` | `admin` | Predefined, seeded at startup |

The application flow is identical:
```
Register → buyer (default)
           ↓
    Buyer submits seller application
           ↓
    Admin reviews application
           ↓
   Approved → promoted to seller
   Rejected → stays buyer
```

---

## 4. Did Doctors Retain Patient Features?

**No — not by design.** In Medicare:
- Doctor's layout had only: Appointments, Prescriptions, Profile, Settings
- No patient features (book appointment, payment history, reviews)
- There was no guard on the patient layout, so technically a doctor *could* navigate there — but that was a bug, not a feature

**For EasyBuy — your sellers WILL retain buyer features (by design):**
- A seller can still browse, buy, and review products
- The seller dashboard shows additional seller-only capabilities (manage listings, view orders, etc.)
- The buyer route guard explicitly allows sellers: `["buyer", "seller", "admin"]`

---

## 5. PostgreSQL Setup — Local (Docker) & Cloud (Neon)

Since you're new to PostgreSQL, here are the two most popular approaches in 2026: **Docker for local dev** and **Neon for cloud dev**. You can use either — or both (local for offline, cloud for staging).

---

### Option A: Docker (Local) — Recommended for Development

**Why Docker?** One command spins up a full PostgreSQL instance, pinned to a specific version, no clutter on your system, and data persists in a volume.

#### Step 1: Install Docker Desktop
Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) and install it. Make sure it's running.

#### Step 2: Create `docker-compose.yml` in your project root

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:17          # Pin the version — never use "latest"
    container_name: easybuy_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: easybuy
    ports:
      - "5432:5432"             # localhost:5432 → container:5432
    volumes:
      - pgdata:/var/lib/postgresql/data  # Data persists when container stops

volumes:
  pgdata:
```

#### Step 3: Start the database

```bash
docker compose up -d
# -d means "detached" — runs in background
```

Check it's running:
```bash
docker compose ps
# Should show "easybuy_db" with status "running"
```

#### Step 4: Add the connection string to `.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/easybuy?schema=public"
```

#### Useful Docker Commands

```bash
# Start DB
docker compose up -d

# Stop DB (data is saved)
docker compose stop

# Stop AND delete container (data is saved in volume)
docker compose down

# Stop AND delete EVERYTHING including data (nuclear option)
docker compose down -v

# View logs
docker compose logs postgres

# Connect to the DB with psql (inside the container)
docker exec -it easybuy_db psql -U postgres -d easybuy
```

> **Note for Windows**: If port `5432` is already in use, you likely have a local PostgreSQL install running. Stop it: `net stop postgresql` in an admin CMD prompt. Or change the port mapping to `"5433:5432"` and update your `DATABASE_URL` to use port `5433`.

---

### Option B: Neon (Cloud) — Free Tier, No Local Setup

**Why Neon?** Zero setup, works from anywhere, great for solo dev or when you don't want to run Docker. Also perfect for deployment since your Vercel/Railway app uses the same DB.

#### Step 1: Create a free account
Go to [neon.tech](https://neon.tech) → Sign up → Create a project named `easybuy`.

#### Step 2: Get your connection strings
Neon gives you **two** URLs — you need both:

```env
# Pooled — for your app queries (through PgBouncer connection pool)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/easybuy?sslmode=require"

# Direct — for Prisma CLI migrations only (migrations don't work through pooler)
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/easybuy?sslmode=require"
```

The difference is the `-pooler` in the hostname. Copy both from the Neon dashboard.

#### Step 3: Update `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  # Required for Neon — used by Prisma CLI
}
```

> **Important**: If you're using Docker (Option A), you do NOT need `directUrl`. Just set `url = env("DATABASE_URL")`.

#### Neon Free Tier Limits (2026)
| Feature | Limit |
|---------|-------|
| Projects | 100 |
| Storage | 0.5 GB per project |
| Compute | 100 CPU-hours/month |
| Branches | 10 per project |
| Scale-to-zero | After 5 min inactivity |

The free tier is more than enough for development.

---

### Which Should You Choose?

| | Docker (Local) | Neon (Cloud) |
|-|---------------|-------------|
| **Offline work** | ✅ Works offline | ❌ Needs internet |
| **Speed** | ✅ Fastest (no network hop) | 🟡 Slight latency |
| **Setup** | Requires Docker Desktop | ✅ Instant |
| **Cost** | Free | Free tier |
| **Best for** | Daily dev work | Deploy-close dev, solo projects |

**Recommendation**: Use **Docker for local development** + **Neon for your staging/cloud environment**. They both use the same Prisma schema — just different `DATABASE_URL` values.

---

## 6. Shared Database — Auth + Backend in One DB

Yes, Better Auth and your Express backend can (and should) share the same PostgreSQL database. Here's why this works and how it's structured:

```
easybuy (PostgreSQL database)
│
├── Better Auth Tables (auto-generated by CLI)
│   ├── user           ← core user info + your custom fields (role, status)
│   ├── session        ← active user sessions
│   ├── account        ← OAuth accounts (Google, etc.)
│   └── verification   ← email verification tokens
│
└── EasyBuy Business Tables (you create these)
    ├── product        ← seller's product listings
    ├── order          ← buyer's orders
    ├── order_item     ← line items per order
    ├── cart_item      ← shopping cart items
    ├── review         ← product reviews
    └── seller_profile ← extended seller info (store name, status, etc.)
```

Both your Next.js app (Better Auth) and your Express backend use the **same `DATABASE_URL`** environment variable to connect to this one database. They just access different tables.

### How they relate:

Your business tables reference the Better Auth `user` table via foreign keys:

```prisma
model Product {
  id       String @id @default(cuid())
  sellerId String          // ← references User.id from Better Auth's table
  user     User   @relation(fields: [sellerId], references: [id])
  // ...
}
```

This means:
- Your Express backend can do `prisma.product.findMany({ where: { sellerId: decodedJwt.id } })` — it uses the `id` from the JWT payload
- No need to duplicate user data — the `user` table is the single source of truth

---

## 7. Defining the Prisma Schema

First, initialize Prisma and let the CLI generate the Better Auth tables:

```bash
# Initialize Prisma
npx prisma init --datasource-provider postgresql

# Generate Better Auth core tables into schema.prisma
npx @better-auth/cli generate
```

Then extend the generated schema with your EasyBuy fields and tables:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  # directUrl = env("DIRECT_URL")  ← Uncomment if using Neon
}

// ─── Better Auth Core Tables (generated, then extended) ───────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // ── EasyBuy Custom Fields ────────────────────────────────────────────────────
  role          String    @default("buyer")   // "buyer" | "seller" | "admin"
  status        String    @default("active")  // "active" | "suspended"
  phone         String?

  // ── Better Auth Relations ─────────────────────────────────────────────────
  sessions      Session[]
  accounts      Account[]

  // ── EasyBuy Relations ─────────────────────────────────────────────────────
  sellerProfile SellerProfile?
  products      Product[]
  orders        Order[]
  reviews       Review[]

  @@map("user")  // Better Auth expects lowercase table name
}

model Session {
  id             String   @id @default(cuid())
  expiresAt      DateTime
  token          String   @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  ipAddress      String?
  userAgent      String?
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}

// ─── EasyBuy Business Tables ──────────────────────────────────────────────────

model SellerProfile {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeName          String
  storeDescription   String?
  verificationStatus String   @default("pending") // "pending" | "approved" | "rejected"
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Product {
  id          String      @id @default(cuid())
  sellerId    String
  seller      User        @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  name        String
  description String?
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  imageUrl    String?
  category    String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
  reviews     Review[]
}

model Order {
  id         String      @id @default(cuid())
  buyerId    String
  buyer      User        @relation(fields: [buyerId], references: [id])
  status     String      @default("pending") // "pending" | "paid" | "shipped" | "delivered" | "cancelled"
  total      Decimal     @db.Decimal(10, 2)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  items      OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())
}
```

After writing/editing the schema:

```bash
# Sync schema to your database
npx prisma migrate dev --name init

# Regenerate the Prisma client (TypeScript types)
npx prisma generate

# Optional: Open a visual DB browser
npx prisma studio
```

---

## 8. Configuring Better Auth with JWT (`auth.ts`)

Create `src/lib/auth.ts`. This is the **most important file** — the central auth config:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma"; // your singleton client (see below)

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

  // ── Social Providers (optional) ───────────────────────────────────────────
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },

  // ── Custom User Fields ────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "buyer",  // Every new user is a buyer
        input: false,           // ⚠️ CRITICAL: prevents users from setting their own role
      },
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
    admin(),

    // JWT plugin — issues tokens so your Express backend can verify users
    jwt({
      jwt: {
        // Include role in the JWT payload so your Express backend
        // can check it without hitting the database.
        definePayload: (session) => ({
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,   // ← roles in the token
          name: session.user.name,
        }),
        // Token expiry (default: 15 minutes — good for security)
        // expirationTime: "1h",
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

// ── TypeScript Type Export ──────────────────────────────────────────────────
// Use this type anywhere you need access to session data with full type safety.
export type Session = typeof auth.$Infer.Session;
```

### Prisma Singleton (`src/lib/prisma.ts`)

Always use a singleton to avoid creating too many DB connections (especially important in Next.js due to hot reload):

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## 9. Creating the Auth Client (`auth-client.ts`)

Create `src/lib/auth-client.ts`. This runs **in the browser only**:

```typescript
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    // jwtClient exposes authClient.token() — used to get the JWT
    // before making calls to your Express backend
    jwtClient(),

    // adminClient enables admin actions from client-side (admin users only)
    adminClient(),
  ],
});

// Export individual methods for easy import
export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
```

---

## 10. The Route Handler

Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This handles ALL Better Auth routes:
// POST /api/auth/sign-in/email
// POST /api/auth/sign-up/email
// POST /api/auth/sign-out
// GET  /api/auth/get-session
// GET  /api/auth/jwks        ← Your Express backend uses this to verify JWTs
// ... and more
export const { GET, POST } = toNextJsHandler(auth);
```

> **Note the JWKS route**: When the JWT plugin is enabled, Better Auth automatically exposes `GET /api/auth/jwks` — a public endpoint that returns the public keys used to sign tokens. Your Express backend will call this to verify JWTs.

---

## 11. Seeding the Admin Account

Use a dedicated seed script — much cleaner than doing it at module load time like Medicare did.

**`prisma/seed.ts`**:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    // Use Better Auth's API to create the account (handles password hashing)
    const { auth } = await import("../src/lib/auth");

    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "EasyBuy Admin",
      },
    });

    console.log("Admin account created:", adminEmail);
  }

  // Always ensure the role is "admin" (idempotent)
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: "admin" },
  });

  console.log("Admin role verified.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to `package.json`**:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Run it**:
```bash
npm install tsx --save-dev   # needed to run .ts scripts directly
npx prisma db seed
```

---

## 12. Route Protection Patterns (Next.js)

### 12.1 Middleware — Cookie-only fast check

Create `src/middleware.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### 12.2 Layout-level Role Guards (the actual security layer)

**Admin layout** — only admins:
```typescript
// src/app/dashboard/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/unauthorized");

  return <>{children}</>;
}
```

**Seller layout** — sellers and admins:
```typescript
// src/app/dashboard/seller/layout.tsx
export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  if (!["seller", "admin"].includes(session.user.role)) redirect("/unauthorized");

  return <>{children}</>;
}
```

**Buyer layout** — buyers, sellers, AND admins (sellers retain buying privileges):
```typescript
// src/app/dashboard/buyer/layout.tsx
export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");
  // All logged-in users can access buyer features
  if (!["buyer", "seller", "admin"].includes(session.user.role)) redirect("/unauthorized");

  return <>{children}</>;
}
```

### 12.3 Dashboard Router

```typescript
// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/login");

  const { role } = session.user;
  if (role === "admin")  redirect("/dashboard/admin");
  if (role === "seller") redirect("/dashboard/seller");
  redirect("/dashboard/buyer");
}
```

---

## 13. Using JWT in Your Frontend (calling backend)

This is the same pattern Medicare used. In any client component that needs to call your Express backend:

```typescript
"use client";

import { authClient } from "@/lib/auth-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function fetchProducts() {
  // Step 1: Get the JWT token
  const tokenRes = await authClient.token();
  const token = tokenRes?.data?.token || "";

  // Step 2: Send it as a Bearer token to your Express backend
  const res = await fetch(`${BACKEND_URL}/api/products`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}
```

> **JWT Lifespan**: The JWT expires (default ~15 minutes). `authClient.token()` automatically handles getting a fresh token if the current one is expired. You don't need to manage this manually.

---

## 14. Verifying JWT in Your Express Backend

This is the **most important new section** — how your Express backend verifies who's calling.

### Step 1: Install dependencies

```bash
# In your Express project
npm install jose  # modern, lightweight JWT library — better than jsonwebtoken in 2026
```

### Step 2: Create a JWT verification middleware

```typescript
// middleware/auth.ts (in your Express project)
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";

const NEXT_APP_URL = process.env.NEXT_APP_URL || "http://localhost:3000";

// Cache the JWKS — this fetches Better Auth's public keys once
// and caches them. Don't fetch on every request!
const JWKS = createRemoteJWKSet(
  new URL(`${NEXT_APP_URL}/api/auth/jwks`)
);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

// General auth middleware — just checks that the user is logged in
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS);

    // Attach the decoded user to the request
    req.user = {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role-specific middleware — use these on specific routes
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireSeller(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!["seller", "admin"].includes(req.user?.role || "")) {
    return res.status(403).json({ error: "Seller access required" });
  }
  next();
}
```

### Step 3: Use the middleware on your routes

```typescript
// routes/products.ts (in your Express project)
import express from "express";
import { requireAuth, requireSeller, requireAdmin } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Public: anyone can browse products
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

// Protected: only logged-in users can see product details
router.get("/:id", requireAuth, async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });
  res.json(product);
});

// Seller-only: create a new product listing
router.post("/", requireAuth, requireSeller, async (req, res) => {
  const { name, price, description, stock, category } = req.body;

  const product = await prisma.product.create({
    data: {
      sellerId: req.user!.id,  // from the JWT payload
      name,
      price,
      description,
      stock,
      category,
    },
  });

  res.status(201).json(product);
});

// Admin-only: delete any product
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: "Product deleted" });
});

export default router;
```

### Step 4: Connect your Express backend to the same database

In your Express project's `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/easybuy?schema=public"
NEXT_APP_URL="http://localhost:3000"  # Where your Next.js app runs (for JWKS fetch)
```

Your Express backend uses the **same `DATABASE_URL`** as your Next.js app — they both connect to the same PostgreSQL database. The Express backend uses Prisma the same way:

```typescript
// lib/prisma.ts (in your Express project)
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

> **Note**: The Express backend uses its own Prisma instance, but it's pointing to the same database. The Prisma schema (`schema.prisma`) should be shared or kept in sync between both projects — or you can put both the Next.js frontend and Express backend in a **monorepo** and share one `prisma/schema.prisma`.

---

## 15. Seller Application & Admin Approval Flow

### The Full Flow:

```
1. Buyer submits application (Next.js API route)
         ↓
2. SellerProfile record created with status: "pending"
         ↓
3. Admin sees pending applications in /dashboard/admin/sellers
         ↓
4. Admin approves → auth.api.setRole() promotes user to "seller"
         ↓
5. SellerProfile status updated to "approved"
         ↓
6. Next time seller logs in, their JWT contains role: "seller"
```

### Buyer Submits Application (`src/app/api/seller/apply/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "buyer") {
    return NextResponse.json({ error: "Only buyers can apply" }, { status: 400 });
  }

  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Application already exists" }, { status: 400 });
  }

  const { storeName, storeDescription } = await req.json();

  const application = await prisma.sellerProfile.create({
    data: {
      userId: session.user.id,
      storeName,
      storeDescription,
      verificationStatus: "pending",
    },
  });

  return NextResponse.json({ message: "Application submitted!", application });
}
```

### Admin Approves/Rejects (`src/app/api/admin/sellers/[id]/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action } = await req.json(); // "approve" | "reject"

  const application = await prisma.sellerProfile.findUnique({
    where: { id: params.id },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    await prisma.sellerProfile.update({
      where: { id: params.id },
      data: { verificationStatus: "approved" },
    });

    // Promote the user's role using Better Auth's Admin plugin API
    // This is the CORRECT way — updates the user table properly
    await auth.api.setRole({
      body: { userId: application.userId, role: "seller" },
      headers: await headers(),
    });

    return NextResponse.json({ message: "Seller approved" });
  }

  if (action === "reject") {
    await prisma.sellerProfile.update({
      where: { id: params.id },
      data: { verificationStatus: "rejected" },
    });
    return NextResponse.json({ message: "Application rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
```

---

## 16. Session Access Cheatsheet

### In a Next.js Server Component or Layout
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
// session?.user.id, .name, .email, .role, .status
```

### In a Next.js Client Component
```typescript
"use client";
import { useSession } from "@/lib/auth-client";

const { data: session, isPending } = useSession();
// session?.user.id, .name, .email, .role
```

### In a Next.js API Route
```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

### Getting the JWT (to call Express backend)
```typescript
"use client";
import { authClient } from "@/lib/auth-client";

const tokenRes = await authClient.token();
const jwt = tokenRes?.data?.token || "";
```

### In Express (after `requireAuth` middleware)
```typescript
router.get("/protected", requireAuth, (req, res) => {
  // req.user is populated by the middleware
  const { id, email, role, name } = req.user;
});
```

---

## 17. Key Differences from Medicare Connect

| Aspect | Medicare Connect | EasyBuy |
|--------|-----------------|---------|
| **Database** | MongoDB (schemaless) | PostgreSQL via Prisma (typed schema) |
| **Adapter import** | `@better-auth/mongo-adapter` | `better-auth/adapters/prisma` (built-in) |
| **JWT verification** | Shared secret (HMAC) | JWKS endpoint (RS256 asymmetric) — more secure |
| **Role promotion** | Direct MongoDB `updateOne` | `auth.api.setRole()` from admin plugin |
| **Admin seeding** | Inline in auth.js at module load | Dedicated seed script via `npx prisma db seed` |
| **Route guards** | Only admin was properly guarded | ALL role-specific layouts are guarded |
| **Seller retains buyer features** | Doctors did NOT retain patient features | Sellers explicitly allowed in buyer routes |
| **Type safety** | JavaScript only | Full TypeScript + Prisma-generated types |
| **DB structure** | Dual collections (Better Auth `user` + custom `users`) | Single `user` table with custom fields |

---

## 18. Common Pitfalls to Avoid

### ❌ Pitfall 1: Database calls in middleware (performance killer)
```typescript
// ❌ Hits DB on every request
export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession(...);
}

// ✅ Just check for the cookie
export async function middleware(req: NextRequest) {
  const cookie = getSessionCookie(req);
}
```

### ❌ Pitfall 2: Forgetting `input: false` on role field
Without it, users can self-assign `role: "admin"` during registration.
```typescript
role: {
  type: "string",
  defaultValue: "buyer",
  input: false, // ← ALWAYS include this
},
```

### ❌ Pitfall 3: Role in JWT becomes stale after promotion
After `auth.api.setRole()` promotes a buyer to seller, their **existing JWT still says "buyer"** until it expires and is re-issued. Options:
- Tell the user to log out and back in (simplest)
- Set a short JWT expiry (e.g., 15 minutes) so it auto-refreshes

### ❌ Pitfall 4: Multiple PrismaClient instances (connection exhaustion)
```typescript
// ❌ Creates a new connection pool on every hot reload / import
const prisma = new PrismaClient();

// ✅ Use the singleton from src/lib/prisma.ts
import { prisma } from "@/lib/prisma";
```

### ❌ Pitfall 5: Using `DATABASE_URL` with pooler for migrations (Neon)
```bash
# ❌ Will fail on Neon — pooler can't handle migrations
DATABASE_URL="...pooler...neon.tech/easybuy" npx prisma migrate dev

# ✅ Use DIRECT_URL for migrations (Prisma reads it from schema.prisma automatically)
# Just make sure directUrl = env("DIRECT_URL") is in your schema.prisma
```

### ❌ Pitfall 6: Fetching JWKS on every request in Express
```typescript
// ❌ Creates a new fetch to /api/auth/jwks on every request
const key = await fetch(`${NEXTJS_URL}/api/auth/jwks`);

// ✅ Create JWKS once and reuse (jose caches it automatically)
const JWKS = createRemoteJWKSet(new URL(`${NEXTJS_URL}/api/auth/jwks`));
// Then just call jwtVerify(token, JWKS) — the keys are cached
```

### ❌ Pitfall 7: Not awaiting headers() in Next.js
```typescript
// ❌ Works in old Next.js, fails in newer versions
const session = await auth.api.getSession({ headers: headers() });

// ✅ Always await headers()
const session = await auth.api.getSession({ headers: await headers() });
```

---

## 19. Environment Variables Checklist

### Next.js App (`.env`)
```env
# ── Database ─────────────────────────────────────────────────────────────────
# Docker local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/easybuy?schema=public"

# Neon cloud (uncomment if using Neon):
# DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/easybuy?sslmode=require"
# DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/easybuy?sslmode=require"

# ── Better Auth ───────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET="run: openssl rand -base64 32"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# ── Admin Seed ────────────────────────────────────────────────────────────────
ADMIN_EMAIL="admin@easybuy.com"
ADMIN_PASSWORD="your-secure-admin-password"

# ── Backend URL (for frontend to call Express) ────────────────────────────────
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000"

# ── Optional: Google OAuth ────────────────────────────────────────────────────
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."
```

### Express Backend (`.env`)
```env
# ── Same Database (shared with Next.js) ──────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/easybuy?schema=public"

# ── Next.js app URL (for JWKS endpoint) ──────────────────────────────────────
NEXT_APP_URL="http://localhost:3000"

# ── Server Config ─────────────────────────────────────────────────────────────
PORT=5000
```

Generate `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## Quick Start Checklist

```bash
# ─── Database Setup ───────────────────────────────────────────────────────────
docker compose up -d              # Start PostgreSQL (or use Neon)

# ─── Prisma Setup ────────────────────────────────────────────────────────────
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
npx @better-auth/cli generate     # Adds Better Auth tables to schema.prisma
# → Edit schema.prisma: add role/status fields + EasyBuy business tables
npx prisma migrate dev --name init
npx prisma generate

# ─── Better Auth Setup ───────────────────────────────────────────────────────
npm install better-auth
# → Create src/lib/prisma.ts      (singleton)
# → Create src/lib/auth.ts        (with jwt + admin + nextCookies plugins)
# → Create src/lib/auth-client.ts (with jwtClient + adminClient)
# → Create src/app/api/auth/[...all]/route.ts

# ─── Admin Seed ──────────────────────────────────────────────────────────────
npm install tsx --save-dev
# → Create prisma/seed.ts
npx prisma db seed

# ─── Express Backend ─────────────────────────────────────────────────────────
npm install jose                  # For JWT verification
# → Create middleware/auth.ts     (requireAuth, requireSeller, requireAdmin)
# → Connect to same DATABASE_URL
# → Use JWKS from http://localhost:3000/api/auth/jwks
```

---

> **References (2026)**:
> - [Better Auth Documentation](https://www.better-auth.com/docs)
> - [Better Auth Prisma Adapter](https://www.better-auth.com/docs/adapters/prisma)
> - [Better Auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
> - [Neon Postgres + Prisma Guide](https://neon.tech/docs/guides/prisma)
> - [jose JWT Library](https://github.com/panva/jose)
> - [Prisma + Docker Setup](https://www.prisma.io/docs/guides/development-environment/docker)
> - Medicare Connect source: `c:\DockYard\web-projects\Assignment_10\medicare-connect-client`
