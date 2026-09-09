"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

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
      // Get token from cookie or your auth client — adjust if needed
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            // If you store token in localStorage/cookie, add Authorization here
          },
        }
      );

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