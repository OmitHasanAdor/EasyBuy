"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";
import SearchFilterBar from "@/components/SearchFilterBar";
import { isApparelProduct } from "@/lib/apparel";

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
  const initialCategory = searchParams.get("category") ?? "";
  const initialTryOn = searchParams.get("tryon") === "true";

  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tryOnOnly, setTryOnOnly] = useState(initialTryOn);

  // Sync state if searchParams change externally (e.g. user clicked nav link)
  const [prevParams, setPrevParams] = useState({ category: initialCategory, tryon: initialTryOn });
  if (prevParams.category !== initialCategory || prevParams.tryon !== initialTryOn) {
    setPrevParams({ category: initialCategory, tryon: initialTryOn });
    setCategory(initialCategory);
    setTryOnOnly(initialTryOn);
  }

  const { data: products = [], isLoading: loading, isError: error } = useQuery<Product[]>({
    queryKey: ["products", search, category, minPrice, maxPrice],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await axios.get(`${API_URL}/api/products`, { params });
      return res.data;
    },
  });

  const displayedProducts = tryOnOnly ? products.filter(isApparelProduct) : products;

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
          {search
            ? `Results for "${search}"`
            : tryOnOnly
              ? "AI Virtual Trial Room Apparel"
              : category || "All Products"}
        </h1>
        <p className="mb-8 text-sm text-neutral-500">
          {loading
            ? "Loading..."
            : `${displayedProducts.length} product${displayedProducts.length === 1 ? "" : "s"} found${
                tryOnOnly ? " (eligible for AI Virtual Try-On)" : ""
              }`}
        </p>

        <SearchFilterBar
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          tryOnOnly={tryOnOnly}
          onChange={(f) => {
            setCategory(f.category);
            setMinPrice(f.minPrice);
            setMaxPrice(f.maxPrice);
            setTryOnOnly(!!f.tryOnOnly);
          }}
        />

        {loading && <ProductGridSkeleton count={8} />}

        {error && <p className="text-sm text-neutral-500">Could not load products right now.</p>}

        {!loading && !error && displayedProducts.length === 0 && (
          <p className="text-sm text-neutral-500">
            {tryOnOnly
              ? "No AI Try-On ready apparel items match these filters."
              : "No products match these filters."}
          </p>
        )}

        {!loading && !error && displayedProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} badge={getBadge(product)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}