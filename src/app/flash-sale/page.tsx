"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";
import MiniCountdown from "@/components/MiniCountdown";

export default function FlashSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/flash-sale`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const activeProducts = products.filter((p) => new Date(p.saleEndsAt!).getTime() > Date.now());

  return (
    <main className="min-h-screen w-full bg-[#FBF8F1]">
      {/* Header banner  */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#C05620] via-[#B14A1B] to-[#8E3D14] px-6 py-16 sm:px-10 lg:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0px, #fff 2px, transparent 2px, transparent 22px)",
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[4px] text-[#FBD9BC]">
            <Zap className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
            Limited Time
          </span>
          <h1 className="font-serif text-3xl font-medium text-white sm:text-4xl">
            All Flash Sale Deals
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            Every active deal, in one place. Each card shows its own countdown — once it hits
            zero, that deal is gone for good.
          </p>
        </div>
      </section>

      {/* Deals grid */}
      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {loading && <ProductGridSkeleton count={8} />}

          {error && (
            <p className="text-sm text-neutral-500">Could not load flash sale deals right now.</p>
          )}

          {!loading && !error && activeProducts.length === 0 && (
            <div className="rounded-lg border border-[#E7DCC4] bg-white px-6 py-16 text-center">
              <p className="font-serif text-lg text-[#2B2420]">No active deals right now</p>
              <p className="mt-2 text-sm text-neutral-500">
                Check back soon — new flash sales drop regularly.
              </p>
            </div>
          )}

          {!loading && !error && activeProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
              {activeProducts.map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard product={product} variant="sale" />
                  {product.saleEndsAt && <MiniCountdown endsAt={product.saleEndsAt} />}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}