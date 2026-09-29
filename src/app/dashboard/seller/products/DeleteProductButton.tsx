"use client";

import { API_URL } from "@/config/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type Props = {
  productId: number;
  productName: string;
};

export function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      // The API authenticates with the Bearer session token, not cookies
      const res = await authFetch(`${API_URL}/api/seller/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete product");
        return;
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}