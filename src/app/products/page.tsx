"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";
import SearchFilterBar from "@/components/SearchFilterBar";

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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCategory(searchParams.get("category") ?? "");
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    axios
      .get(`${API_URL}/api/products`, { params })
      .then((res) => setProducts(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, category, minPrice, maxPrice]);

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
          {search ? `Results for "${search}"` : category || "All Products"}
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          {loading ? "Loading..." : `${products.length} product${products.length === 1 ? "" : "s"} found`}
        </p>

        <SearchFilterBar
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onChange={(f) => {
            setCategory(f.category);
            setMinPrice(f.minPrice);
            setMaxPrice(f.maxPrice);
          }}
        />

        {loading && <ProductGridSkeleton count={8} />}

        {error && <p className="text-sm text-neutral-500">Could not load products right now.</p>}

        {!loading && !error && products.length === 0 && (
          <p className="text-sm text-neutral-500">No products match these filters.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} badge={getBadge(product)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}