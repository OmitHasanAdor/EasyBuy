import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; name: string; images: string[] };
};

type SellerOrder = {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  sellerTotal: number;
  customer: { name: string; email: string };
};

async function getSellerOrders(): Promise<SellerOrder[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch orders for earnings:", await res.text());
    return [];
  }

  return res.json();
}

export default async function SellerEarningsPage() {
  await requireRole("seller");
  const orders = await getSellerOrders();

  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const pending = orders.filter(
    (o) => o.status === "PENDING" || o.status === "SHIPPED"
  );

  const availableBalance = delivered.reduce((s, o) => s + o.sellerTotal, 0);
  const pendingBalance = pending.reduce((s, o) => s + o.sellerTotal, 0);
  const totalEarned = availableBalance; // for now same as available (no payout history)

  // Recent delivered (earnings history)
  const recentEarnings = [...delivered]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Earnings & Payouts
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Track your store earnings from completed orders
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8E3D14]/80">Available Balance</p>
            <Wallet className="h-5 w-5 text-[#C05620]" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#2B2420]">
            ৳{availableBalance.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-[#8E3D14]/60">
            From delivered orders
          </p>
        </div>

        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-orange-700">Pending</p>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-orange-900">
            ৳{pendingBalance.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-orange-700/70">
            {pending.length} order{pending.length !== 1 ? "s" : ""} in progress
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700">Total Earned</p>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-green-900">
            ৳{totalEarned.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-green-700/70">
            Lifetime delivered revenue
          </p>
        </div>
      </div>

      {/* Payout note */}
      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        <strong className="font-medium text-[#2B2420]">Note:</strong> Payout
        requests are not enabled yet. Available balance is calculated from
        delivered orders. A full payout system can be added later.
      </div>

      {/* Earnings history */}
      <section className="rounded-xl border border-[#E7DCC4] bg-white overflow-hidden">
        <div className="border-b border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3">
          <h2 className="font-medium text-[#2B2420]">Earnings History</h2>
          <p className="text-xs text-[#8E3D14]/70">
            Recent delivered orders and your share
          </p>
        </div>

        {recentEarnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <CheckCircle2 className="mb-3 h-10 w-10 text-[#E7DCC4]" />
            <p className="text-sm font-medium text-[#2B2420]">
              No earnings yet
            </p>
            <p className="mt-1 text-sm text-[#8E3D14]/70">
              Delivered orders will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7DCC4]">
                  <th className="px-4 py-3 font-medium text-[#2B2420]">
                    Order
                  </th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">
                    Customer
                  </th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Date</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Items</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420] text-right">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentEarnings.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E7DCC4] last:border-0 hover:bg-[#FBF8F1]"
                  >
                    <td className="px-4 py-3 font-medium text-[#2B2420]">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {order.customer?.name ?? "Customer"}
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">
                      +৳{Number(order.sellerTotal).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}