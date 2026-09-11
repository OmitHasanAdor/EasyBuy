import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  Store,
  Package,
} from "lucide-react";

type ReportsData = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalBuyers: number;
    totalSellers: number;
    totalProducts: number;
    avgOrderValue: number;
  };
  monthlyRevenue: { month: string; value: number }[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: {
    product: { id: number; name: string; images: string[]; price: number } | null;
    quantitySold: number;
    orderCount: number;
  }[];
};

async function getReports(): Promise<ReportsData | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminReportsPage() {
  await requireRole("admin");
  const data = await getReports();

  const s = data?.summary ?? {
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalBuyers: 0,
    totalSellers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
  };

  const monthly = data?.monthlyRevenue ?? [];
  const maxMonthly = Math.max(...monthly.map((m) => m.value), 1);
  const status = data?.statusBreakdown ?? [];
  const maxStatus = Math.max(...status.map((x) => x.count), 1);
  const top = data?.topProducts ?? [];

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Platform-wide performance overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Revenue" value={`৳${Number(s.totalRevenue).toLocaleString()}`} sub="Delivered orders" icon={<TrendingUp className="h-5 w-5" />} />
        <Kpi title="Orders" value={s.totalOrders} sub={`${s.deliveredOrders} delivered`} icon={<ShoppingCart className="h-5 w-5" />} />
        <Kpi title="Avg Order" value={`৳${Math.round(s.avgOrderValue).toLocaleString()}`} sub="Delivered only" icon={<BarChart3 className="h-5 w-5" />} />
        <Kpi title="Users" value={s.totalBuyers + s.totalSellers} sub={`${s.totalBuyers} buyers · ${s.totalSellers} sellers`} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi title="Buyers" value={s.totalBuyers} sub="Registered" icon={<Users className="h-5 w-5" />} />
        <Kpi title="Sellers" value={s.totalSellers} sub="Active sellers" icon={<Store className="h-5 w-5" />} />
        <Kpi title="Products" value={s.totalProducts} sub="Listed" icon={<Package className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <h2 className="mb-4 font-medium text-[#2B2420]">Revenue (6 months)</h2>
          {monthly.every((m) => m.value === 0) ? (
            <p className="text-sm text-[#8E3D14]/70">No delivered sales yet.</p>
          ) : (
            <div className="flex h-40 items-end gap-2">
              {monthly.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-[#2B2420]">
                    {m.value > 0 ? `৳${Math.round(m.value / 1000)}k` : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[#C05620]"
                    style={{
                      height: `${Math.max((m.value / maxMonthly) * 100, m.value > 0 ? 4 : 0)}%`,
                    }}
                  />
                  <span className="text-[10px] text-[#8E3D14]/70">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <h2 className="mb-4 font-medium text-[#2B2420]">Orders by Status</h2>
          {status.length === 0 ? (
            <p className="text-sm text-[#8E3D14]/70">No orders.</p>
          ) : (
            <div className="space-y-3">
              {status.map((row) => (
                <div key={row.status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[#3A342C]">{row.status}</span>
                    <span className="font-medium text-[#2B2420]">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F0E6D2]">
                    <div
                      className="h-full rounded-full bg-[#C05620]"
                      style={{ width: `${(row.count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
        <h2 className="mb-4 font-medium text-[#2B2420]">Top Products</h2>
        {top.length === 0 ? (
          <p className="text-sm text-[#8E3D14]/70">No sales data yet.</p>
        ) : (
          <ul className="space-y-3">
            {top.map((t, i) => (
              <li
                key={t.product?.id ?? i}
                className="flex items-center gap-3 rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2B2420] text-xs font-bold text-[#F7F2E7]">
                  {i + 1}
                </span>
                <div className="h-10 w-10 overflow-hidden rounded-md bg-[#E7DCC4]">
                  {t.product?.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.product.images[0]} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2B2420]">
                    {t.product?.name ?? "Unknown"}
                  </p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {t.quantitySold} sold · {t.orderCount} order lines
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E7DCC4] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8E3D14]/80">{title}</p>
        <div className="text-[#C05620]">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#2B2420]">{value}</p>
      <p className="mt-0.5 text-xs text-[#8E3D14]/60">{sub}</p>
    </div>
  );
}