import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";
import {
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Store,
} from "lucide-react";
import { headers } from "next/headers";

export default async function SellerProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { user: sessionUser } = session;

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const latestSellerRequest = await prisma.sellerRequest.findFirst({
    where: {
      userId: dbUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Seller Profile
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your seller account and store information.
            </p>
          </div>

          <SignOutButton />
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-[#2B2420] to-[#5C4D44] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {dbUser.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {dbUser.name}
                </h2>

                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {dbUser.email}
                </p>
              </div>
            </div>

            {/* Seller Role Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200">
                <Store className="w-3.5 h-3.5" />
                Seller Account
              </span>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />

              <span>
                <strong>Phone:</strong>{" "}
                {dbUser.phone || "Not provided"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />

              <span>
                <strong>Status:</strong>{" "}
                <span className="capitalize text-emerald-600 font-semibold">
                  {dbUser.status || "Active"}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />

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

        {/* Store Information */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Store Information
              </h2>

              <p className="text-xs text-gray-500">
                Information submitted when becoming a seller.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Store Name
              </p>

              <p className="font-semibold text-gray-900">
                {latestSellerRequest?.storeName || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Application Status
              </p>

              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                {latestSellerRequest?.status || "Approved"}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Store Phone
              </p>

              <p className="font-semibold text-gray-900">
                {latestSellerRequest?.phone ||
                  dbUser.phone ||
                  "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Store Description
              </p>

              <p className="text-gray-700">
                {latestSellerRequest?.description ||
                  "No store description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}