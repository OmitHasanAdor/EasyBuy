"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const DISPLAY_LIMIT = 4;
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

function useEarliestActiveCountdown(saleEndTimes: number[]) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeTimes = saleEndTimes.filter((t) => t > now);
  const nearest = activeTimes.length ? Math.min(...activeTimes) : null;
  const msLeft = nearest ? nearest - now : 0;

  const d = Math.floor(msLeft / 86_400_000);
  const h = Math.floor((msLeft % 86_400_000) / 3_600_000);
  const m = Math.floor((msLeft % 3_600_000) / 60_000);
  const s = Math.floor((msLeft % 60_000) / 1000);
  return { d, h, m, s, hasActive: nearest !== null };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#2B2420] font-serif text-lg font-semibold text-[#F7F2E7]">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wide text-[#2B2420]/70">{label}</span>
    </div>
  );
}

export default function FlashSale() {
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

  const saleEndTimes = products.map((p) => new Date(p.saleEndsAt!).getTime());
  const { d, h, m, s, hasActive } = useEarliestActiveCountdown(saleEndTimes);

  const activeProducts = products.filter((p) => new Date(p.saleEndsAt!).getTime() > Date.now());
  const visibleProducts = activeProducts.slice(0, DISPLAY_LIMIT);
  const hasMore = activeProducts.length > DISPLAY_LIMIT;

  if (!loading && !error && activeProducts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden bg-gradient-to-br from-[#C05620] via-[#B14A1B] to-[#8E3D14] px-6 py-20 sm:px-10 lg:px-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0px, #fff 2px, transparent 2px, transparent 22px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <motion.span
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[4px] text-[#FBD9BC]"
            >
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <Zap className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
              </motion.span>
              Limited Time
            </motion.span>
            <h2 className="font-serif text-3xl font-medium text-white sm:text-4xl">
              Flash Sale
            </h2>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            {!loading && !error && hasActive && (
              <div className="flex items-center gap-2 rounded-lg bg-[#F7F2E7] px-4 py-3 shadow-lg">
                <motion.span
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  className="mr-0.5 text-[#C05620]"
                >
                  <Zap className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
                </motion.span>
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
                  Ends in
                </span>
                {d > 0 && (
                  <>
                    <TimeBox value={d} label="days" />
                    <span className="font-serif text-lg text-[#2B2420]">:</span>
                  </>
                )}
                <TimeBox value={h} label="hrs" />
                <span className="font-serif text-lg text-[#2B2420]">:</span>
                <TimeBox value={m} label="min" />
                <span className="font-serif text-lg text-[#2B2420]">:</span>
                <TimeBox value={s} label="sec" />
              </div>
            )}

            {hasMore && (
              <Link
                href="/flash-sale"
                className="group/link inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white"
              >
                <span className="relative">
                  View all deals
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 ease-out group-hover/link:w-full" />
                </span>
                <span className="transition-transform duration-300 ease-out group-hover/link:translate-x-1">
                  →
                </span>
              </Link>
            )}
          </div>
        </div>

        {loading && <ProductGridSkeleton count={4} />}

        {error && <p className="text-sm text-white/80">Could not load flash sale right now.</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} variant="sale" badge={getBadge(product)} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}