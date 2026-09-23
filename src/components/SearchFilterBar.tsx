"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { API_URL } from "@/config/api";

type SearchFilterBarProps = {
  category: string;
  minPrice: string;
  maxPrice: string;
  tryOnOnly?: boolean;
  onChange: (filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    tryOnOnly?: boolean;
  }) => void;
};

export default function SearchFilterBar({
  category,
  minPrice,
  maxPrice,
  tryOnOnly = false,
  onChange,
}: SearchFilterBarProps) {
  // Same "categories" cache key as Navbar/FeaturedCategories.
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_URL}/api/categories`).then((res) => res.json()),
  });

  return (
    <div className="mb-8 flex flex-wrap items-end gap-4 rounded-lg border border-[#E7DCC4] bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Category</label>
        <select
          value={category}
          onChange={(e) => onChange({ category: e.target.value, minPrice, maxPrice, tryOnOnly })}
          className="rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        >
          <option value="">All Products</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Min Price</label>
        <input
          type="number"
          min="0"
          value={minPrice}
          onChange={(e) => onChange({ category, minPrice: e.target.value, maxPrice, tryOnOnly })}
          placeholder="৳0"
          className="w-28 rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Max Price</label>
        <input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => onChange({ category, minPrice, maxPrice: e.target.value, tryOnOnly })}
          placeholder="৳10000"
          className="w-28 rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Virtual Trial</label>
        <button
          type="button"
          onClick={() => onChange({ category, minPrice, maxPrice, tryOnOnly: !tryOnOnly })}
          className={`flex items-center gap-1.5 rounded-sm border px-3 py-2 text-sm font-medium transition-all ${
            tryOnOnly
              ? "border-[#C05620] bg-[#C05620] text-white shadow-xs"
              : "border-[#E7DCC4] bg-white text-[#3A342C] hover:border-[#C05620]/50"
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${tryOnOnly ? "text-[#F7F2E7]" : "text-[#C05620]"}`} />
          <span>AI Try-On Ready</span>
        </button>
      </div>

      {(category || minPrice || maxPrice || tryOnOnly) && (
        <button
          type="button"
          onClick={() => onChange({ category: "", minPrice: "", maxPrice: "", tryOnOnly: false })}
          className="text-sm font-semibold text-[#8E3D14] underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}