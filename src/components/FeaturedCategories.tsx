"use client";

import { useEffect, useState } from "react";
import { Shirt, Home, Sparkles, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/config/api";

// Map categories to their icons and colors
const CATEGORY_STYLE: Record<string, { icon: typeof Shirt; bg: string }> = {
  "Men's Fashion": { icon: Shirt, bg: "bg-[#C05620]" },
  "Women's Fashion": { icon: ShoppingBag, bg: "bg-[#8E3D14]" },
  "Home & Lifestyle": { icon: Home, bg: "bg-[#5B5145]" },
  "New Arrivals": { icon: Sparkles, bg: "bg-[#2B2420]" },
};
const FALLBACK_STYLE = { icon: Tag, bg: "bg-[#8E7B5C]" };

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="w-full bg-[#F7F2E7] px-6 py-16 sm:px-10 lg:px-16">
      <h2 className="mb-10 font-serif text-3xl font-normal text-[#2B2420] sm:text-4xl">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {loading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white sm:h-48" />
          ))}

        {!loading &&
          categories.map((name) => {
            const { icon: Icon, bg } = CATEGORY_STYLE[name] ?? FALLBACK_STYLE;
            return (
              <Link
                key={name}
                href={`/products?category=${encodeURIComponent(name)}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#ddd6c9] bg-white transition-shadow hover:shadow-lg"
              >
                <div className={`flex h-28 items-center justify-center sm:h-36 ${bg}`}>
                  <Icon size={36} className="text-[#F7F2E7] transition-transform group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-[#2B2420]">{name}</h3>
                </div>
              </Link>
            );
          })}
      </div>
    </section>
  );
}