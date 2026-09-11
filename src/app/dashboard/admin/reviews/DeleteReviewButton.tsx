"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { Trash2 } from "lucide-react";

export function DeleteReviewButton({ reviewId }: { reviewId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
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
      className="shrink-0 rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}