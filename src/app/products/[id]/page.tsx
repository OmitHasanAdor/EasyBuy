"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { API_URL } from "@/config/api";
import Loading from "@/components/Loading";
import { Product } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Loading product..." variant="full" />;
  if (error || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Product not found.</p>
      </div>
    );
  }

  const hasDiscount = !!product.discountPercent && product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercent! / 100))
    : product.price;

 // Use the product image as the gallery image
  const images = [product.imageUrl];

  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
    toggle(product.id);
    toast.success(
      wishlisted ? "Removed from wishlist" : "Added to wishlist"
    );
  };

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <Swiper spaceBetween={10} className="aspect-square w-full overflow-hidden rounded-lg bg-[#F2EADA]">
          {images.map((src, i) => (
            <SwiperSlide key={i} className="relative">
              <Image src={src} alt={product.name} fill className="object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
            {product.category}
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#2B2420]">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl font-medium text-[#2B2420]">
              ৳{finalPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-lg text-neutral-400 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>

          <p className="text-sm text-neutral-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                addItem({ id: product.id, name: product.name, price: finalPrice, imageUrl: product.imageUrl });
                toast.success(`${product.name} added to cart`);
              }}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#2B2420] px-6 py-3.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              Add to Cart
            </button>

            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wishlisted}
              className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#2B2420] text-[#8E3D14] transition-colors hover:bg-[#F0E6D2]"
            >
              <Heart
                className="h-5 w-5"
                strokeWidth={2}
                fill={wishlisted ? "#8E3D14" : "none"}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}