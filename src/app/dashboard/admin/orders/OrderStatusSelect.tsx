"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

const STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [loading, setLoading] = useState(false);

  async function onChange(next: string) {
    setLoading(true);
    setValue(next);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setValue(status);
        alert("Failed to update status");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[#E7DCC4] bg-white px-2 py-1 text-xs font-medium text-[#2B2420] outline-none disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}