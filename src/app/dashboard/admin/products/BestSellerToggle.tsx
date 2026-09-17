"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

// Only admins can grant or remove the Best Seller badge (EB-08)
export function BestSellerToggle({
  productId,
  isBestSeller,
}: {
  productId: number;
  isBestSeller: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(isBestSeller);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !value;
    setLoading(true);
    setValue(next);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBestSeller: next }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setValue(!next);
        alert(err.error || "Failed to update the badge");
        return;
      }
      router.refresh();
    } catch {
      setValue(!next);
      alert("Failed to update the badge");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={value}
      title={value ? "Remove Best Seller badge" : "Give Best Seller badge"}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
        value
          ? "bg-[#C05620] text-[#F7F2E7] hover:bg-[#A84515]"
          : "border border-[#E7DCC4] bg-white text-[#3A342C] hover:bg-[#F0E6D2]"
      }`}
    >
      <Award className="h-3.5 w-3.5" />
      {value ? "Best Seller" : "Mark"}
    </button>
  );
}
