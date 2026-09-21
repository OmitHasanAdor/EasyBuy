import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export type ListingCopilotResult = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  seoKeywords: string[];
};

export async function requestListingCopy(input: {
  name?: string;
  category?: string;
  price?: number;
  notes?: string;
}): Promise<ListingCopilotResult> {
  const res = await authFetch(`${API_URL}/api/seller/listing-copilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Generate failed");
  }
  return data as ListingCopilotResult;
}