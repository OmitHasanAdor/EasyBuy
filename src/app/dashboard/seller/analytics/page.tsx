import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { BarChart3, TrendingUp, ShoppingCart, Package } from "lucide-react";

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
};

type Product = {
  id: number;
  name: string;
  images: string[];
  _count?: { orderItems: number };
};

async function getToken() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return (session as any).session?.token as string | undefined;
}

async function getOrders(): Promise<SellerOrder[]> {
  const token = await getToken();
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

async function getProducts(): Promise<Product[]> {
  const token = await getToken();
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function SellerAnalyticsPage() {
  await requireRole("seller");

  const [orders, products] = await Promise.all([getOrders(), getProducts()]);

  // ---- Calculations ----
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((s, o) => s + o.sellerTotal, 0);

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  const avgOrderValue =
    deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

  // Status breakdown
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const o of orders) {
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }
  }
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  // Top products by quantity sold
  const productSales = new Map<
    number,
    { name: string; images: string[]; qty: number; revenue: number }
  >();

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    for (const item of order.items) {
      const existing = productSales.get(item.product.id) ?? {
        name: item.product.name,
        images: item.product.images ?? [],
        qty: 0,
        revenue: 0,
      };
      existing.qty += item.quantity;
      existing.revenue += item.price * item.quantity;
      productSales.set(item.product.id, existing);
    }
  }

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Revenue by month (last 6 months)
  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthMap.set(key, 0);
  }

  for (const order of orders) {
    if (order.status !== "DELIVERED") continue;
    const d = new Date(order.createdAt);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + order.sellerTotal);
    }
  }

  const monthlyData = Array.from(monthMap.entries());
  const maxMonthly = Math.max(...monthlyData.map(([, v]) => v), 1);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Sales Analytics
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Performance overview of your store
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          subtitle="From delivered orders"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Total Orders"
          value={totalOrders}
          subtitle={`${deliveredOrders} delivered`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <KpiCard
          title="Avg. Order Value"
          value={`৳${Math.round(avgOrderValue).toLocaleString()}`}
          subtitle="Delivered only"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KpiCard
          title="Products"
          value={products.length}
          subtitle={`${pendingOrders} pending orders`}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly revenue bars */}
        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <h2 className="mb-4 font-medium text-[#2B2420]">
            Revenue (Last 6 Months)
          </h2>
          {monthlyData.every(([, v]) => v === 0) ? (
            <p className="text-sm text-[#8E3D14]/70">No delivered sales yet.</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map(([month, value]) => (
                <div
                  key={month}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-medium text-[#2B2420]">
                    {value > 0 ? `৳${Math.round(value / 1000)}k` : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-[#C05620] transition-all"
                    style={{
                      height: `${Math.max((value / maxMonthly) * 100, value > 0 ? 4 : 0)}%`,
                      minHeight: value > 0 ? 4 : 0,
                    }}
                  />
                  <span className="text-[10px] text-[#8E3D14]/70">{month}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Order status breakdown */}
        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <h2 className="mb-4 font-medium text-[#2B2420]">Orders by Status</h2>
          {totalOrders === 0 ? (
            <p className="text-sm text-[#8E3D14]/70">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-[#3A342C]">{status}</span>
                    <span className="font-medium text-[#2B2420]">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F0E6D2]">
                    <div
                      className={`h-full rounded-full ${statusBarColor(status)}`}
                      style={{ width: `${(count / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top products */}
      <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
        <h2 className="mb-4 font-medium text-[#2B2420]">Top Selling Products</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-[#8E3D14]/70">
            No sales data yet. Orders will show top products here.
          </p>
        ) : (
          <ul className="space-y-3">
            {topProducts.map((p, i) => (
              <li
                key={p.name + i}
                className="flex items-center gap-3 rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-3"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2B2420] text-xs font-bold text-[#F7F2E7]">
                  {i + 1}
                </span>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#E7DCC4]">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#2B2420]">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {p.qty} sold · ৳{p.revenue.toLocaleString()} revenue
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

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E7DCC4] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8E3D14]/80">{title}</p>
        <div className="text-[#C05620]">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#2B2420]">{value}</p>
      <p className="mt-0.5 text-xs text-[#8E3D14]/60">{subtitle}</p>
    </div>
  );
}

function statusBarColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-500",
    SHIPPED: "bg-blue-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-400",
  };
  return map[status] ?? "bg-gray-400";
}