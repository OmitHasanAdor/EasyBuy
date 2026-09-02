"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const DISPLAY_LIMIT = 8;
const NEW_WINDOW_DAYS = 3;

// "New" badge if recently added, else no badge
function getBadge(product: Product) {
  if (!product.createdAt) return null;
  const daysSinceCreated =
    (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= NEW_WINDOW_DAYS) {
    return { label: "New", className: "bg-[#2B2420] text-white" };
  }
  return null;
}

export default function TrendingProducts() {
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

  const visibleProducts = products.slice(0, DISPLAY_LIMIT);
  const hasMore = products.length > DISPLAY_LIMIT;

  return (
    <section className="w-full bg-white px-6 py-16 sm:px-10 lg:px-16">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="font-serif text-3xl font-normal text-[#2B2420] sm:text-4xl">
          Trending Now
        </h2>
        {hasMore && (
          <Link
            href="/trending"
            className="group/link inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-[#8E3D14]"
          >
            <span className="relative">
              View all products
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#8E3D14] transition-all duration-300 ease-out group-hover/link:w-full" />
            </span>
            <span className="transition-transform duration-300 ease-out group-hover/link:translate-x-1">
              →
            </span>
          </Link>
        )}
      </div>

      {loading && <ProductGridSkeleton count={4} />}

      {error && (
        <p className="text-sm text-neutral-500">
          Could not load products right now.
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} badge={getBadge(product)} />
          ))}
        </div>
      )}
    </section>
  );
}