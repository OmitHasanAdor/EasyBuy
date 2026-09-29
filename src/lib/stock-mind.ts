import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export type StockMindItem = {
  productId: number;
  name: string;
  stock: number;
  category: string;
  soldLast30Days: number;
  avgPerDay: number;
  daysUntilStockOut: number | null;
  risk: "high" | "medium" | "low" | "ok";
};

export type StockMindResult = {
  items: StockMindItem[];
  summary: string;
};

export async function fetchStockMind(): Promise<StockMindResult> {
  const res = await authFetch(`${API_URL}/api/seller/stock-mind`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to load StockMind");
  return data as StockMindResult;
}