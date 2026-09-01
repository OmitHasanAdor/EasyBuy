import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/components/Sidebar";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Verifies the current session belongs to a user with the required role.
 * Queries the database directly via Prisma (same DB Better-Auth writes to),
 * instead of calling the separate easybuy-server API — this avoids relying
 * on NEXT_PUBLIC_API_URL / a second database being in sync.
 *
 * Redirects to /login if there's no session, or to /unauthorized if the
 * role doesn't match. Returns the user's data on success.
 */
export async function requireRole(requiredRole: Role): Promise<SessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const role = (dbUser.role || "buyer") as Role;

  if (role !== requiredRole) {
    console.warn(
      `Access Denied. Required: ${requiredRole}, Found: ${role} (user: ${dbUser.email})`
    );
    redirect("/unauthorized");
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role,
  };
}