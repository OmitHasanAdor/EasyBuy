import { headers } from "next/headers";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { ClipboardList } from "lucide-react";
import { OrderStatusSelect } from "./OrderStatusSelect";

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: {
    id: number;
    quantity: number;
    price: number;
    product: { id: number; name: string; images: string[] };
  }[];
};

async function getOrders(status?: string): Promise<Order[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

const FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const status = params.status || "";
  const orders = await getOrders(status || undefined);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          All Orders
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value;
          const href = f.value
            ? `/dashboard/admin/orders?status=${f.value}`
            : "/dashboard/admin/orders";
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-[#2B2420] text-[#F7F2E7]"
                  : "border border-[#E7DCC4] bg-white text-[#3A342C] hover:bg-[#F0E6D2]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <ClipboardList className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#2B2420]">Order #{order.id}</p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {order.user.name} · {order.user.email} ·{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                  <p className="text-sm font-semibold text-[#2B2420]">
                    ৳{Number(order.total).toLocaleString()}
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-[#E7DCC4]">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-[#E7DCC4]">
                      {item.product.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2B2420]">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-[#8E3D14]/70">
                        Qty {item.quantity} · ৳{item.price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}