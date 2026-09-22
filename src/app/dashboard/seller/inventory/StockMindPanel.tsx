"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, Loader2 } from "lucide-react";
import { fetchStockMind, type StockMindItem } from "@/lib/stock-mind";

function riskClass(risk: StockMindItem["risk"]) {
  switch (risk) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "low":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function StockMindPanel() {
  const [summary, setSummary] = useState("");
  const [items, setItems] = useState<StockMindItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchStockMind();
        if (cancelled) return;
        setSummary(data.summary);
        setItems(data.items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#E7DCC4] bg-white p-6 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        StockMind analyzing…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
      <div className="mb-3 flex items-center gap-2">
        <Brain className="h-5 w-5 text-[#C05620]" />
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">
          StockMind
        </h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-neutral-600">{summary}</p>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No products to analyze.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7DCC4] text-xs uppercase tracking-wide text-neutral-500">
                <th className="pb-2 pr-3 font-medium">Product</th>
                <th className="pb-2 pr-3 font-medium">Stock</th>
                <th className="pb-2 pr-3 font-medium">Sold (30d)</th>
                <th className="pb-2 pr-3 font-medium">Est. days left</th>
                <th className="pb-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.productId} className="border-b border-[#F0E6D2]">
                  <td className="py-2.5 pr-3">
                    <Link
                      href={`/dashboard/seller/products`}
                      className="font-medium text-[#2B2420] hover:text-[#C05620]"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs text-neutral-400">{row.category}</p>
                  </td>
                  <td className="py-2.5 pr-3">{row.stock}</td>
                  <td className="py-2.5 pr-3">{row.soldLast30Days}</td>
                  <td className="py-2.5 pr-3">
                    {row.daysUntilStockOut == null
                      ? "—"
                      : `${row.daysUntilStockOut}d`}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${riskClass(row.risk)}`}
                    >
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}