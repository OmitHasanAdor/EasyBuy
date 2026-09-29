"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const DISPLAY_LIMIT = 8;
const ease = [0.22, 1, 0.36, 1] as const;

const bestSellerBadge = {
  label: "Best Seller",
  className: "bg-[#C05620] text-[#F7F2E7]",
};

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/best-sellers`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = products.slice(0, DISPLAY_LIMIT);
  const hasMore = products.length > DISPLAY_LIMIT;

  return (
    <section className="w-full bg-white px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
              Shop the Favorites
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              Best Sellers
            </h2>
          </div>

          {hasMore && (
            <Link
              href="/best-sellers"
              className="group inline-flex items-center gap-2 self-start rounded-full border border-[#2B2420] px-5 py-2.5 text-[13px] font-semibold text-[#2B2420] transition-all duration-300 hover:bg-[#2B2420] hover:text-[#F7F2E7] sm:self-auto"
            >
              View all
              <ArrowRight
                size={14}
                strokeWidth={2.2}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </motion.div>

        {/* ── Loading skeleton ── */}
        {loading && <ProductGridSkeleton count={4} />}

        {/* ── Error state ── */}
        {error && (
          <p className="text-sm text-neutral-500">
            Could not load best sellers right now.
          </p>
        )}

        {/* ── Product grid ── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, ease, delay: i * 0.06 }}
              >
                <ProductCard product={product} badge={bestSellerBadge} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}