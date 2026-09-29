"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export function BuyerActions({
  userId,
  banned,
  status,
}: {
  userId: string;
  banned: boolean;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(data: { banned?: boolean; status?: string; banReason?: string | null }) {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {banned ? (
        <button
          disabled={loading}
          onClick={() => patch({ banned: false, banReason: null, status: "active" })}
          className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-200 disabled:opacity-50"
        >
          Unban
        </button>
      ) : (
        <button
          disabled={loading}
          onClick={() => {
            if (confirm("Ban this buyer?")) patch({ banned: true, status: "inactive", banReason: "Banned by admin" });
          }}
          className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
        >
          Ban
        </button>
      )}
      {status === "active" && !banned ? (
        <button
          disabled={loading}
          onClick={() => patch({ status: "inactive" })}
          className="rounded-md bg-[#F0E6D2] px-2.5 py-1 text-xs font-medium text-[#3A342C] hover:bg-[#E7DCC4] disabled:opacity-50"
        >
          Deactivate
        </button>
      ) : !banned ? (
        <button
          disabled={loading}
          onClick={() => patch({ status: "active" })}
          className="rounded-md bg-[#F0E6D2] px-2.5 py-1 text-xs font-medium text-[#3A342C] hover:bg-[#E7DCC4] disabled:opacity-50"
        >
          Activate
        </button>
      ) : null}
    </div>
  );
}