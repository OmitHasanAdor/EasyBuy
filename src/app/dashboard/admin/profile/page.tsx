import { requireRole } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";
import AdminSellerRequests from "@/components/profile/AdminSellerRequests";
import AdminUsersList from "@/components/profile/AdminUsersList";
import { prisma } from "@/lib/prisma";
import {
//   User,
  Mail,
  Shield,
  Phone,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default async function AdminProfilePage() {
  const user = await requireRole("admin");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return null;
  }

  const [allSellerRequests, allUsers] = await Promise.all([
    prisma.sellerRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        banned: true,
        createdAt: true,
        sellerRequests: {
          select: {
            storeName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="w-full bg-[#FBF8F1] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420]">
              Admin Profile
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Your account and platform management tools
            </p>
          </div>
          <SignOutButton />
        </div>

        {/* Profile card */}
        <div className="rounded-lg border border-[#E7DCC4] bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#E7DCC4] pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2B2420] text-xl font-bold text-[#F7F2E7]">
                {dbUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2B2420]">
                  {dbUser.name}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Mail className="h-3.5 w-3.5" />
                  {dbUser.email}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
              <Shield className="h-3.5 w-3.5" />
              Administrator
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2 text-[#3A342C]">
              <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
              <span>
                <strong>Phone:</strong> {dbUser.phone || "Not provided"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#3A342C]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-400" />
              <span>
                <strong>Status:</strong>{" "}
                <span className="font-semibold capitalize text-emerald-600">
                  {dbUser.status || "active"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#3A342C]">
              <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
              <span>
                <strong>Member since:</strong>{" "}
                {new Date(dbUser.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Admin tools from old profile */}
        <AdminSellerRequests requests={allSellerRequests} />
        <AdminUsersList users={allUsers} />
      </div>
    </div>
  );
}