import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BLOCKED_ACCOUNT_MESSAGE, isAccountBlocked } from "@/lib/account";

export default async function PostAuthPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, banned: true, banExpires: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  if (isAccountBlocked(dbUser)) {
    redirect(`/login?error=${encodeURIComponent(BLOCKED_ACCOUNT_MESSAGE)}`);
  }

  const role = dbUser.role || "buyer";

if (role === "admin") {
  redirect("/dashboard/admin/profile");
}
  if (role === "seller") {
    redirect("/dashboard/seller/profile");
  }
  // first Google login → default buyer
  redirect("/dashboard/buyer/profile");
}