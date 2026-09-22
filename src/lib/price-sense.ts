import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export type PriceSenseResult = {
  category: string;
  sampleSize: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  suggested: number | null;
  message: string;
};

export async function fetchPriceSense(
  category: string,
  excludeProductId?: number
): Promise<PriceSenseResult> {
  const q = new URLSearchParams({ category });
  if (excludeProductId) q.set("excludeProductId", String(excludeProductId));

  const res = await authFetch(
    `${API_URL}/api/seller/price-sense?${q.toString()}`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "PriceSense failed");
  return data as PriceSenseResult;
}