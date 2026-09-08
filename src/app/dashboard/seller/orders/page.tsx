import { headers } from "next/headers";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { ClipboardList } from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
  };
};

type SellerOrder = {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  items: OrderItem[];
  sellerTotal: number;
};

async function getSellerOrders(status?: string): Promise<SellerOrder[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as any).session?.token as string | undefined;
  if (!token) return [];

  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/seller/orders`);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch seller orders:", await res.text());
    return [];
  }

  return res.json();
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function SellerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("seller");
  const params = await searchParams;
  const status = params.status || "";
  const orders = await getSellerOrders(status || undefined);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Orders & Invoices
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Orders that include your products · {orders.length} shown
        </p>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = status === f.value;
          const href = f.value
            ? `/dashboard/seller/orders?status=${f.value}`
            : "/dashboard/seller/orders";

          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-[#2B2420] text-[#F7F2E7]"
                  : "border border-[#E7DCC4] bg-white text-[#3A342C] hover:bg-[#F0E6D2]"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <ClipboardList className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No orders found</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            {status
              ? `No ${status.toLowerCase()} orders yet`
              : "Orders with your products will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white"
            >
              {/* Order header */}
              <div className="flex flex-col gap-3 border-b border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#2B2420]">
                    Order #{order.id}
                  </p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {order.customer?.name ?? "Customer"} ·{" "}
                    {order.customer?.email} ·{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <p className="text-sm font-semibold text-[#2B2420]">
                    ৳{Number(order.sellerTotal).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items (seller's products only) */}
              <ul className="divide-y divide-[#E7DCC4]">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#E7DCC4]">
                      {item.product?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2B2420]">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-[#8E3D14]/70">
                        Qty: {item.quantity} · ৳{item.price.toLocaleString()}{" "}
                        each
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[#2B2420]">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    SHIPPED: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}