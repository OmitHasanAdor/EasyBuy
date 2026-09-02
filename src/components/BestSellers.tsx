"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";

const DISPLAY_LIMIT = 8;

// Badges
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
    <section className="w-full bg-[#FBF8F1] px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
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
            Could not load best sellers right now.
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} badge={bestSellerBadge} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}