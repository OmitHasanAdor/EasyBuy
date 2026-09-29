"use client";

import { useQuery } from "@tanstack/react-query";
import { Shirt, Home, Sparkles, ShoppingBag, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_URL } from "@/config/api";

/* ─── category config ───────────────────────────────────── */
type CategoryStyle = {
  icon: typeof Shirt;
  gradient: string;
  accent: string;
};

const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  "Men's Fashion": {
    icon: Shirt,
    gradient: "from-[#C05620] to-[#8E3D14]",
    accent: "#C05620",
  },
  "Women's Fashion": {
    icon: ShoppingBag,
    gradient: "from-[#8E3D14] to-[#5A2409]",
    accent: "#8E3D14",
  },
  "Home & Lifestyle": {
    icon: Home,
    gradient: "from-[#5B5145] to-[#3A342C]",
    accent: "#5B5145",
  },
  "New Arrivals": {
    icon: Sparkles,
    gradient: "from-[#2B2420] to-[#1A1511]",
    accent: "#2B2420",
  },
};

const FALLBACK_STYLE: CategoryStyle = {
  icon: Tag,
  gradient: "from-[#8E7B5C] to-[#5B5145]",
  accent: "#8E7B5C",
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function FeaturedCategories() {
  // Reuses the shared categories cache
  const { data: categories = [], isLoading } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: () => fetch(`${API_URL}/api/categories`).then((res) => res.json()),
  });

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="w-full bg-white px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-12"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
            Browse
          </span>
          <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
            Shop by Category
          </h2>
        </motion.div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">

          {/* skeleton */}
          {isLoading &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl bg-[#F2EADA] sm:h-64"
              />
            ))}

          {/* category cards */}
          {!isLoading &&
            categories.map((name, i) => {
              const { icon: Icon, gradient, accent } =
                CATEGORY_STYLE[name] ?? FALLBACK_STYLE;

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(name)}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(43,36,32,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(43,36,32,0.13)]"
                  >
                    {/* icon panel — gradient background */}
                    <div
                      className={`relative flex h-36 items-center justify-center overflow-hidden bg-linear-to-br sm:h-44 ${gradient}`}
                    >
                      {/* subtle radial glow */}
                      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_60%_40%,_#fff_0%,_transparent_65%)]" />

                      <Icon
                        size={42}
                        className="relative z-10 text-[#F7F2E7] transition-transform duration-300 ease-out group-hover:scale-110"
                        strokeWidth={1.6}
                      />
                    </div>

                    {/* label row */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <h3 className="font-serif text-[17px] font-medium leading-tight text-[#2B2420]">
                        {name}
                      </h3>
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105"
                        style={{ backgroundColor: accent + "18", color: accent }}
                      >
                        <ArrowRight
                          size={14}
                          strokeWidth={2.2}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
}