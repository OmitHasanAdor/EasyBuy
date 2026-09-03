"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const DISPLAY_LIMIT = 4;
const ease = [0.22, 1, 0.36, 1] as const;

// Remote: badge helper for flash sale products
const NEW_WINDOW_DAYS = 3;

const bestSellerBadge = {
  label: "Best Seller",
  className: "bg-[#C05620] text-[#F7F2E7]",
};

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

/* ─── countdown hook ──────────────────────────────────── */
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

/* ─── time box ────────────────────────────────────────── */
function TimeBox({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/15 backdrop-blur-sm">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="absolute font-serif text-xl font-semibold text-white"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[2px] text-white/50">
        {label}
      </span>
    </div>
  );
}

/* ─── component ───────────────────────────────────────── */
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

  const activeProducts = products.filter(
    (p) => new Date(p.saleEndsAt!).getTime() > Date.now()
  );
  const visibleProducts = activeProducts.slice(0, DISPLAY_LIMIT);
  const hasMore = activeProducts.length > DISPLAY_LIMIT;

  if (!loading && !error && activeProducts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.55, ease }}
      className="relative w-full overflow-hidden bg-linear-to-br from-[#C05620] via-[#B14A1B] to-[#8E3D14] px-6 py-20 sm:px-10 lg:px-16"
    >
      {/* diagonal stripe texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0px, #fff 2px, transparent 2px, transparent 22px)",
        }}
      />
      {/* radial glow top-left */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* ── Section header ── */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          {/* left — label + title */}
          <div>
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[4px] text-white/70"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Zap className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
              </motion.span>
              Limited Time
            </motion.span>
            <h2 className="font-serif text-3xl font-medium text-white sm:text-4xl">
              Flash Sale
            </h2>
          </div>

          {/* right — countdown + view all */}
          <div className="flex flex-col items-start gap-4 sm:items-end">
            {!loading && !error && hasActive && (
              <div className="flex items-center gap-1.5 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm ring-1 ring-white/15">
                <span className="mr-2 text-[11px] font-semibold uppercase tracking-[2px] text-white/60">
                  Ends in
                </span>
                {d > 0 && (
                  <>
                    <TimeBox value={d} label="days" />
                    <span className="mb-4 font-serif text-lg text-white/40">:</span>
                  </>
                )}
                <TimeBox value={h} label="hrs" />
                <span className="mb-4 font-serif text-lg text-white/40">:</span>
                <TimeBox value={m} label="min" />
                <span className="mb-4 font-serif text-lg text-white/40">:</span>
                <TimeBox value={s} label="sec" />
              </div>
            )}

            {hasMore && (
              <Link
                href="/flash-sale"
                className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#C05620]"
              >
                View all deals
                <ArrowRight
                  size={14}
                  strokeWidth={2.2}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </div>
        </div>

        {/* ── States ── */}
        {loading && <ProductGridSkeleton count={4} />}
        {error && (
          <p className="text-sm text-white/70">
            Could not load flash sale right now.
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
                transition={{ duration: 0.45, ease, delay: i * 0.07 }}
              >
                <ProductCard product={product} variant="sale" badge={getBadge(product)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}