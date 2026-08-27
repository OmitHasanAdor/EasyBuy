"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { API_URL } from "@/config/api";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
};

const DISPLAY_LIMIT = 8;

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

      {loading && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-48 w-full animate-pulse rounded-2xl bg-[#F2EADA] sm:h-56" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#F2EADA]" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#F2EADA]" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-neutral-500">
          Could not load products right now.
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <a key={product.id} href="#" className="group">
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-[#F2EADA] sm:h-56">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-sm font-medium text-[#2B2420]">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[#2B2420]">
                  ৳{product.price.toLocaleString()}
                </p>
              </a>
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