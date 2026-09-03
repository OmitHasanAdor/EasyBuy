"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/api";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import ProductCard, { Product } from "@/components/ProductCard";

export default function RecentlyViewed() {
// Read localStorage after mount
  const [ids, setIds] = useState<number[] | null>(null);
  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

 // Reuse the shared products cache and filter client-side
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products", "all"],
    queryFn: () => fetch(`${API_URL}/api/products`).then((res) => res.json()),
    enabled: !!ids && ids.length > 0,
  });

  if (!ids || ids.length === 0) return null;

// Keep recently viewed order
  const products = ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <h2 className="mb-8 font-serif text-3xl font-normal text-[#2B2420] sm:text-4xl">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:grid-cols-5">
        {products.slice(0, 5).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}