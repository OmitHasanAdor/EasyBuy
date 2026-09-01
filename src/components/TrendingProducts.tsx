"use client";

import { useEffect, useState } from "react";
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
  const [showAll, setShowAll] = useState(false);

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

  const visibleProducts = showAll ? products : products.slice(0, DISPLAY_LIMIT);
  const hasMore = products.length > DISPLAY_LIMIT && !showAll;

  return (
    <section className="w-full bg-white px-6 py-16 sm:px-10 lg:px-16">
      <h2 className="mb-10 font-serif text-3xl font-normal text-[#2B2420] sm:text-4xl">
        Trending Now
      </h2>

      {loading && <ProductGridSkeleton count={4} />}

      {error && (
        <p className="text-sm text-neutral-500">
          Could not load products right now.
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} badge={getBadge(product)} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="inline-block rounded-full border border-[#2B2420] px-7 py-2.5 text-sm font-semibold text-[#2B2420] transition-colors hover:bg-[#2B2420] hover:text-white"
              >
                View All Products
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}