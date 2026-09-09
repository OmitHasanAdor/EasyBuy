"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { Check, Loader2 } from "lucide-react";

type Props = {
  type: "product" | "variant";
  id: number;
  currentStock: number;
};

export function StockEditor({ type, id, currentStock }: Props) {
  const router = useRouter();
  const [stock, setStock] = useState(String(currentStock));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanged = Number(stock) !== currentStock;

  async function handleSave() {
    const value = Number(stock);
    if (!Number.isFinite(value) || value < 0) {
      alert("Enter a valid stock number (0 or more)");
      return;
    }

    setLoading(true);
    setSaved(false);

    try {
      const endpoint =
        type === "product"
          ? `${API_URL}/api/seller/products/${id}/stock`
          : `${API_URL}/api/seller/variants/${id}/stock`;

      const res = await authFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update stock");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="w-20 rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-2 py-1.5 text-sm text-[#2B2420] outline-none focus:border-[#C05620]"
      />
      <button
        onClick={handleSave}
        disabled={loading || !hasChanged}
        className="inline-flex h-8 items-center gap-1 rounded-md bg-[#2B2420] px-3 text-xs font-medium text-[#F7F2E7] transition hover:bg-[#3A342C] disabled:opacity-40"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          "Update"
        )}
      </button>
    </div>
  );
}