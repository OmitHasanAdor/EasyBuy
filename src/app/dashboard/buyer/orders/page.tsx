import { requireRole } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import OrdersClient from "./OrdersClient";

export type OrderProduct = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
  isBestSeller: boolean;
  discountPercent?: number | null;
  saleEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: OrderProduct;
};

export type Order = {
  id: number;
  userId: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

// Server Component: no try/catch here, a failed request goes to error.tsx
export default async function OrdersPage() {
  await requireRole("buyer");

  // The API returns the orders of whoever owns the session token
  const response = await serverApiFetch("/api/orders");

  if (!response || !response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders: Order[] = await response.json();

  return <OrdersClient orders={orders} />;
}