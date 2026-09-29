"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { API_URL } from "@/config/api";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import ProductCard, { Product } from "@/components/ProductCard";

const ease = [0.22, 1, 0.36, 1] as const;

export default function RecentlyViewed() {
  // Read localStorage after mount to avoid hydration mismatch
  const [ids, setIds] = useState<number[] | null>(null);
  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  // Reuse the shared products cache and filter client-side
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["products", "all"],
    queryFn: () =>
      fetch(`${API_URL}/api/products`).then((res) => res.json()),
    enabled: !!ids && ids.length > 0,
  });

  if (!ids || ids.length === 0) return null;

  // Keep recently viewed order
  const products = ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 5);

  if (products.length === 0) return null;

  return (
    <section className="w-full bg-[#F7F2E7] px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-12 flex items-end gap-4"
        >
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
              <History size={12} strokeWidth={2.5} />
              Your History
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              Recently Viewed
            </h2>
          </div>
        </motion.div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease, delay: i * 0.07 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}