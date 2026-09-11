import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Users } from "lucide-react";
import { BuyerActions } from "./BuyerActions";

type Buyer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  banned: boolean;
  createdAt: string;
  _count: { orders: number };
};

async function getBuyers(): Promise<Buyer[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/buyers`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminBuyersPage() {
  await requireRole("admin");
  const buyers = await getBuyers();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Buyer Management
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          {buyers.length} buyer{buyers.length !== 1 ? "s" : ""} registered
        </p>
      </div>

      {buyers.length === 0 ? (
        <Empty icon={<Users className="h-10 w-10 text-[#E7DCC4]" />} text="No buyers yet" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7DCC4] bg-[#F7F2E7]">
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Name</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Email</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Orders</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Joined</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((b) => (
                  <tr key={b.id} className="border-b border-[#E7DCC4] last:border-0 hover:bg-[#FBF8F1]">
                    <td className="px-4 py-3 font-medium text-[#2B2420]">{b.name}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{b.email}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{b._count.orders}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={b.banned ? "banned" : b.status} />
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BuyerActions userId={b.id} banned={b.banned} status={b.status} />
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

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    banned: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[status] ?? "bg-gray-100"}`}>
      {status}
    </span>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
      {icon}
      <p className="mt-3 text-sm font-medium text-[#2B2420]">{text}</p>
    </div>
  );
}