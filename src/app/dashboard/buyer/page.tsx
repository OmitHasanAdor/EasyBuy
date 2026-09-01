import { requireRole } from "@/lib/session";
import Link from "next/link";
import Image from "next/image";
import { Package, Clock, CheckCircle2, Wallet } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://easybuy-server-q1y8.onrender.com";

type OrderProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  isBestSeller: boolean;
  discountPercent?: number | null;
  saleEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: OrderProduct;
};

type Order = {
  id: number;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function BuyerDashboard() {
  const user = await requireRole("buyer");

  const response = await fetch(
    `${API_URL}/api/orders?userId=${user.id}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders: Order[] = await response.json();

  const totalOrders = orders.length;

  const pendingOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "SHIPPED"].includes(order.status)
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const totalSpent = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
    },
    {
      label: "In Progress",
      value: pendingOrders,
      icon: Clock,
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle2,
    },
    {
      label: "Total Spent",
      value: `৳${totalSpent.toLocaleString()}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="px-6 py-8 sm:px-10">
      <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
        Welcome back
        {user.name ? `, ${user.name.split(" ")[0]}` : ""}
      </h1>

      <p className="mt-1 text-sm text-[#5B5145]">
        Here&apos;s a quick look at your EasyBuy activity.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-[#E7DCC4] bg-white p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#C05620]/10">
              <Icon
                className="h-4.5 w-4.5 text-[#C05620]"
                strokeWidth={2}
              />
            </div>

            <p className="text-2xl font-semibold text-[#2B2420]">
              {value}
            </p>

            <p className="text-xs text-[#8E3D14]/70">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-[#2B2420]">
            Recent Orders
          </h2>

          <Link
            href="/dashboard/buyer/orders"
            className="text-sm font-semibold text-[#C05620] hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E7DCC4] bg-white p-10 text-center">
            <p className="text-sm text-[#5B5145]">
              No orders yet. Once you shop, your orders will show up here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#E7DCC4] bg-white">
            {recentOrders.map((order, index) => {
              const firstItem = order.items[0];
              const extraCount = order.items.length - 1;

              return (
                <div
                  key={order.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    index !== recentOrders.length - 1
                      ? "border-b border-[#F0E6D2]"
                      : ""
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#F2EADA]">
                    {firstItem?.product.imageUrl && (
                      <Image
                        src={firstItem.product.imageUrl}
                        alt={firstItem.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2B2420]">
                      {firstItem?.product.name}

                      {extraCount > 0 && (
                        <span className="text-[#8E3D14]/70">
                          {" "}
                          +{extraCount} more
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-[#8E3D14]/70">
                      {new Date(order.createdAt).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      STATUS_STYLES[order.status] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status.toLowerCase()}
                  </span>

                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-[#2B2420]">
                    ৳{order.total.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}