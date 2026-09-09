import { headers } from "next/headers";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  Wallet,
  Clock,
} from "lucide-react";

type DashboardData = {
  summary: {
    totalBuyers: number;
    totalSellers: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  recentOrders: {
    id: number;
    status: string;
    total: number;
    createdAt: string;
    user: { name: string; email: string };
    items: { id: number }[];
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }[];
};

async function getDashboard(): Promise<DashboardData | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Admin dashboard failed:", await res.text());
    return null;
  }

  return res.json();
}

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");
  const data = await getDashboard();

  const s = data?.summary ?? {
    totalBuyers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Welcome, {user.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Buyers" value={s.totalBuyers} icon={<Users className="h-5 w-5" />} href="/dashboard/admin/buyers" />
        <Card title="Sellers" value={s.totalSellers} icon={<Store className="h-5 w-5" />} href="/dashboard/admin/sellers" />
        <Card title="Products" value={s.totalProducts} icon={<Package className="h-5 w-5" />} href="/dashboard/admin/products" />
        <Card title="Orders" value={s.totalOrders} icon={<ShoppingCart className="h-5 w-5" />} href="/dashboard/admin/orders" />
        <Card title="Pending Orders" value={s.pendingOrders} icon={<Clock className="h-5 w-5" />} href="/dashboard/admin/orders?status=PENDING" />
        <Card title="Revenue" value={`৳${Number(s.totalRevenue).toLocaleString()}`} icon={<Wallet className="h-5 w-5" />} href="/dashboard/admin/orders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-[#2B2420]">Recent Orders</h2>
            <Link href="/dashboard/admin/orders" className="text-sm text-[#C05620] hover:underline">
              View all
            </Link>
          </div>
          {(data?.recentOrders?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#8E3D14]/70">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {data!.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-3">
                  <div>
                    <p className="text-sm font-medium text-[#2B2420]">Order #{o.id}</p>
                    <p className="text-xs text-[#8E3D14]/70">
                      {o.user?.name} · {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">৳{Number(o.total).toLocaleString()}</p>
                    <span className="text-[10px] font-semibold text-[#8E3D14]">{o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent users */}
        <section className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-[#2B2420]">Recent Users</h2>
            <Link href="/dashboard/admin/buyers" className="text-sm text-[#C05620] hover:underline">
              Manage
            </Link>
          </div>
          {(data?.recentUsers?.length ?? 0) === 0 ? (
            <p className="text-sm text-[#8E3D14]/70">No users yet.</p>
          ) : (
            <ul className="space-y-3">
              {data!.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-3">
                  <div>
                    <p className="text-sm font-medium text-[#2B2420]">{u.name}</p>
                    <p className="text-xs text-[#8E3D14]/70">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-[#F0E6D2] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#C05620]">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#E7DCC4] bg-white p-5 transition hover:border-[#C05620]/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8E3D14]/80">{title}</p>
        <div className="text-[#C05620]">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[#2B2420]">{value}</p>
    </Link>
  );
}