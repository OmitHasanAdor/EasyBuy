"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const bestSellerBadge = {
  label: "Best Seller",
  className: "bg-[#C05620] text-[#F7F2E7]",
};

// Scattered sparkle positions 
const SPARKLES = [
  { top: "18%", left: "8%", size: 14, opacity: 0.5, delay: 0 },
  { top: "62%", left: "16%", size: 9, opacity: 0.35, delay: 0.2 },
  { top: "28%", left: "88%", size: 18, opacity: 0.45, delay: 0.4 },
  { top: "72%", left: "92%", size: 11, opacity: 0.3, delay: 0.6 },
  { top: "45%", left: "50%", size: 8, opacity: 0.25, delay: 0.8 },
  { top: "12%", left: "60%", size: 10, opacity: 0.3, delay: 1.0 },
];

export default function BestSellersPage() {
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

  return (
    <main className="min-h-screen w-full bg-[#FBF8F1]">
      {/* Header banner */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#C05620] to-[#A8471C] pb-24 pt-20">

        {SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute text-[#FBD9BC]"
            style={{ top: s.top, left: s.left }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, s.opacity, s.opacity * 0.6, s.opacity], scale: 1 }}
            transition={{ duration: 3, delay: s.delay, repeat: Infinity, repeatType: "reverse" }}
          >
            <Star size={s.size} fill="currentColor" strokeWidth={0} />
          </motion.span>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-16"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[4px] text-[#FBD9BC]">
            <Star className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
            Shop the Favorites
          </span>
          <h1 className="font-serif text-3xl font-medium text-white sm:text-4xl">
            Best Sellers
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            The products our customers keep coming back for.
          </p>
        </motion.div>

        <svg
          className="absolute bottom-0 left-0 w-full text-[#FBF8F1]"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            fill="currentColor"
            d="M0,40 C240,90 480,0 720,20 C960,40 1200,90 1440,30 L1440,80 L0,80 Z"
          />
        </svg>
      </section>

      {/* Products grid */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {loading && <ProductGridSkeleton count={8} />}

          {error && (
            <p className="text-sm text-neutral-500">Could not load best sellers right now.</p>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-lg border border-[#E7DCC4] bg-white px-6 py-16 text-center">
              <p className="font-serif text-lg text-[#2B2420]">No best sellers yet</p>
              <p className="mt-2 text-sm text-neutral-500">Check back soon.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} badge={bestSellerBadge} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}