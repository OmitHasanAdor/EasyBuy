"use client";

import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/config/api";
import ProductCard, { Product } from "@/components/ProductCard";

export default function RelatedProducts({ productId }: { productId: number }) {
  const { data: related = [], isLoading } = useQuery<Product[]>({
    queryKey: ["related-products", productId],
    queryFn: () => fetch(`${API_URL}/api/products/${productId}/related`).then((res) => res.json()),
  });

  if (!isLoading && related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-[#E7DCC4] pt-10">
      <h2 className="mb-6 font-serif text-2xl font-medium text-[#2B2420]">You may also like</h2>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading &&
          [...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-[#F2EADA]" />
          ))}
        {!isLoading && related.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}