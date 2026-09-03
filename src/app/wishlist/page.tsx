"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { Heart, HeartOff } from "lucide-react";
import { API_URL } from "@/config/api";
import { ProductGridSkeleton } from "@/components/Loading";
import ProductCard, { Product } from "@/components/ProductCard";
import { useWishlist } from "@/lib/wishlist";

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

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for wishlist IDs to load from localStorage
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch wishlist products in parallel
    Promise.all(
      ids.map((id) =>
        axios
          .get(`${API_URL}/api/products/${id}`)
          .then((res) => res.data as Product)
          .catch(() => null)
      )
    )
    // Ignore failed or missing products
      .then((results) => setProducts(results.filter((p): p is Product => p !== null)))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]"
          >
            <Heart className="h-5 w-5" strokeWidth={2} fill="currentColor" />
          </motion.div>
          <div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              My Wishlist
            </h1>
            <p className="text-sm text-neutral-500">
              {loading ? "Loading..." : `${products.length} product${products.length === 1 ? "" : "s"} saved`}
            </p>
          </div>
        </div>

        {loading && <ProductGridSkeleton count={4} />}

        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#E7DCC4] bg-white/60 py-20 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
              <HeartOff className="h-8 w-8" strokeWidth={1.6} />
            </div>
            <p className="max-w-xs text-sm text-neutral-500">
              Nothing saved yet — tap the heart on a product to add it here.
            </p>
            <Link
              href="/products"
              className="mt-1 rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
            >
              Browse Products
            </Link>
          </motion.div>
        )}

        {!loading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} badge={getBadge(product)} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}