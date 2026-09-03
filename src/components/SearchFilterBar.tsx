"use client";

import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/api";

type SearchFilterBarProps = {
  category: string;
  minPrice: string;
  maxPrice: string;
  onChange: (filters: { category: string; minPrice: string; maxPrice: string }) => void;
};

export default function SearchFilterBar({ category, minPrice, maxPrice, onChange }: SearchFilterBarProps) {
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
          onChange={(e) => onChange({ category: e.target.value, minPrice, maxPrice })}
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
          onChange={(e) => onChange({ category, minPrice: e.target.value, maxPrice })}
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
          onChange={(e) => onChange({ category, minPrice, maxPrice: e.target.value })}
          placeholder="৳10000"
          className="w-28 rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        />
      </div>

      {(category || minPrice || maxPrice) && (
        <button
          onClick={() => onChange({ category: "", minPrice: "", maxPrice: "" })}
          className="text-sm font-semibold text-[#8E3D14] underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}