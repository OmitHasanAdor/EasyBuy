import { requireRole } from "@/lib/session";
import OrdersClient from "./OrdersClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://easybuy-server-q1y8.onrender.com";

export type OrderProduct = {
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
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

// সার্ভার কম্পোনেন্ট – এখানে try/catch ব্যবহার করবেন না
export default async function OrdersPage() {
  const user = await requireRole("buyer");

  const response = await fetch(
    `${API_URL}/api/orders?userId=${user.id}`,
    {
      cache: "no-store",
    }
  );

  // যদি API fail করে, তাহলে error throw করুন (Next.js automatic error handling)
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const orders: Order[] = await response.json();

  return <OrdersClient orders={orders} />;
}