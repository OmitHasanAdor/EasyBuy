"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { nextStatuses } from "@/lib/orders";

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

  // Only offer the moves the API allows (EB-11)
  const options = [status, ...nextStatuses(status)];
  const isFinal = options.length === 1;

  async function onChange(next: string) {
    if (next === status) return;
    if (next === "CANCELLED" && !confirm(`Cancel order #${orderId}? Its stock will be put back.`)) {
      return;
    }

    setLoading(true);
    setValue(next);
    try {
      const res = await authFetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setValue(status);
        alert(data.error || "Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      setValue(status);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      disabled={loading || isFinal}
      title={isFinal ? "This order is final and can't change status" : undefined}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-[#E7DCC4] bg-white px-2 py-1 text-xs font-medium text-[#2B2420] outline-none disabled:opacity-50"
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
