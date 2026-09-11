"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  productId,
  name,
}: {
  productId: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}