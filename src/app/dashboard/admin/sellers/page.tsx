import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Store } from "lucide-react";
import { SellerActions } from "./SellerActions";

type Seller = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  banned: boolean;
  createdAt: string;
  _count: { products: number };
};

async function getSellers(): Promise<Seller[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/sellers`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminSellersPage() {
  await requireRole("admin");
  const sellers = await getSellers();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Seller Management
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          {sellers.length} seller{sellers.length !== 1 ? "s" : ""} on platform
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Store className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No sellers yet</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7DCC4] bg-[#F7F2E7]">
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Name</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Email</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Products</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Joined</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.id} className="border-b border-[#E7DCC4] last:border-0 hover:bg-[#FBF8F1]">
                    <td className="px-4 py-3 font-medium text-[#2B2420]">{s.name}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{s.email}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{s._count.products}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          s.banned
                            ? "bg-red-100 text-red-700"
                            : s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.banned ? "banned" : s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <SellerActions userId={s.id} banned={s.banned} status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}