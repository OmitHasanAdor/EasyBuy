"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { API_URL } from "@/config/api";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  isBestSeller: boolean;
};

const DISPLAY_LIMIT = 4;

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  const visibleProducts = showAll ? products : products.slice(0, DISPLAY_LIMIT);
  const hasMore = products.length > DISPLAY_LIMIT && !showAll;

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
            <button
              onClick={() => setShowAll(true)}
              className="group/link inline-flex items-center gap-1.5 text-sm font-semibold tracking-wide text-[#8E3D14]"
            >
              <span className="relative">
                View all products
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#8E3D14] transition-all duration-300 ease-out group-hover/link:w-full" />
              </span>
              <span className="transition-transform duration-300 ease-out group-hover/link:translate-x-1">
                →
              </span>
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="aspect-square w-full animate-pulse rounded-lg bg-[#F2EADA]" />
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#F2EADA]" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#F2EADA]" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-sm text-neutral-500">
            Could not load best sellers right now.
          </p>
        )}

        {/* Product grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-[#E7DCC4] bg-white transition-shadow hover:shadow-lg"
              >
                {/* Badges */}
                <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
                  <span className="rounded-full bg-[#C05620] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F7F2E7]">
                    Best Seller
                  </span>
                  {product.stock < 10 && (
                    <span className="rounded-full bg-[#2B2420] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  aria-label="Add to wishlist"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#8E3D14] transition-colors hover:bg-white"
                >
                  <Heart className="h-4 w-4" strokeWidth={2} />
                </button>

                {/* Product image */}
                <div className="relative aspect-square overflow-hidden bg-[#F2EADA]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8E3D14]">
                    {product.category}
                  </span>
                  <h3 className="font-serif text-base font-medium leading-snug text-[#2B2420]">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-serif text-lg font-medium text-[#2B2420]">
                      ৳{product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}