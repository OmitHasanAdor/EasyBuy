"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const NEW_WINDOW_DAYS = 3;

const bestSellerBadge = {
  label: "Best Seller",
  className: "bg-[#C05620] text-[#F7F2E7]",
};

// Function to determine the badge for a product based on its properties
function getBadge(product: Product) {
  if (product.isBestSeller) return bestSellerBadge;
  if (!product.createdAt) return null;
  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= NEW_WINDOW_DAYS) {
    return { label: "New", className: "bg-[#2B2420] text-white" };
  }
  return null;
}

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
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
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#2B2420] via-[#332A24] to-[#1E1915] px-6 py-20 sm:px-10 lg:px-16">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(#F7F2E7 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #C05620, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-6xl"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[4px] text-[#E29E6E]">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            Right Now
          </span>
          <h1 className="font-serif text-3xl font-medium text-white sm:text-4xl">
            Trending Now
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/60">
            What everyone&apos;s adding to their cart right now.
          </p>
        </motion.div>
      </section>

      {/* Products grid */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {loading && <ProductGridSkeleton count={8} />}

          {error && (
            <p className="text-sm text-neutral-500">Could not load products right now.</p>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-lg border border-[#E7DCC4] bg-white px-6 py-16 text-center">
              <p className="font-serif text-lg text-[#2B2420]">No products yet</p>
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
                <ProductCard key={product.id} product={product} badge={getBadge(product)} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}