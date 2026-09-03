"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingCart, ChevronRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { API_URL } from "@/config/api";
import Loading from "@/components/Loading";
import { Product } from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist";
import { trackRecentlyViewed } from "@/lib/recently-viewed";

const LOW_STOCK_THRESHOLD = 10;
const NEW_WINDOW_DAYS = 3;

type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
};

type ProductDetail = Product & {
  variants: ProductVariant[];
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const { data: product, isLoading, isError } = useQuery<ProductDetail>({
    queryKey: ["product", productId],
    queryFn: () => axios.get(`${API_URL}/api/products/${productId}`).then((res) => res.data),
    enabled: Number.isFinite(productId),
  });

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  // Track only loaded products
  useEffect(() => {
    if (product) trackRecentlyViewed(product.id);
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) return <Loading label="Loading product..." variant="full" />;
  if (isError || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Product not found.</p>
      </div>
    );
  }

  const variants = product.variants ?? [];
  const hasVariants = !!product.hasVariants && variants.length > 0;

  const sizes = [...new Set(variants.map((v) => v.size).filter((s): s is string => !!s))];
  const colors = [...new Set(variants.map((v) => v.color).filter((c): c is string => !!c))];

  const matchedVariant = hasVariants
    ? variants.find(
        (v) =>
          (sizes.length === 0 || v.size === selectedSize) &&
          (colors.length === 0 || v.color === selectedColor)
      )
    : undefined;

  // Show sizes that are still in stock
  const isSizeAvailable = (size: string) =>
    variants.some((v) => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0);
  const isColorAvailable = (color: string) =>
    variants.some((v) => v.color === color && (!selectedSize || v.size === selectedSize) && v.stock > 0);

  const needsSelection =
    hasVariants && ((sizes.length > 0 && !selectedSize) || (colors.length > 0 && !selectedColor));
  const availableStock = hasVariants ? (matchedVariant?.stock ?? 0) : product.stock;
  const basePrice = matchedVariant?.price ?? product.price;

  const hasDiscount = !!product.discountPercent && product.discountPercent > 0;
  const finalPrice = hasDiscount
    ? Math.round(basePrice * (1 - product.discountPercent! / 100))
    : basePrice;

  const daysSinceCreated = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const isNew = daysSinceCreated !== null && daysSinceCreated <= NEW_WINDOW_DAYS;
  const isLowStock = availableStock > 0 && availableStock < LOW_STOCK_THRESHOLD;
  const isOutOfStock = availableStock === 0;

  const images = product.images && product.images.length > 0 ? product.images : [];

  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
    const wasWishlisted = wishlisted;
    const success = toggle(product.id);
    if (success) {
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } else {
      toast.error("Couldn't update your wishlist. Please try again.");
    }
  };

  const handleAddToCart = () => {
    if (hasVariants && !matchedVariant) {
      toast.error("Please select a size/color first.");
      return;
    }
    const success = addItem({
      id: product.id,
      variantId: matchedVariant?.id ?? null,
      name: product.name,
      price: finalPrice,
      imageUrl: images[0] ?? "",
      size: matchedVariant?.size ?? null,
      color: matchedVariant?.color ?? null,
      qty: quantity,
    });
    if (success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error("Couldn't add to cart. Please try again.");
    }
  };

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
          <Link href="/" className="hover:text-[#8E3D14]">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#8E3D14]"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#2B2420]">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              {product.isBestSeller && (
                <span className="rounded-full bg-[#C05620] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F7F2E7]">
                  Best Seller
                </span>
              )}
              {isNew && (
                <span className="rounded-full bg-[#2B2420] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  New
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-[#C05620] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  -{product.discountPercent}%
                </span>
              )}
              {isLowStock && (
                <span className="rounded-full bg-[#2B2420] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Low Stock
                </span>
              )}
              {isOutOfStock && (
                <span className="rounded-full bg-neutral-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Out of Stock
                </span>
              )}
            </div>

            {images.length > 0 ? (
              <Swiper spaceBetween={10} className="aspect-square w-full overflow-hidden rounded-lg bg-[#F2EADA]">
                {images.map((src, i) => (
                  <SwiperSlide key={i} className="relative">
                    <Image
                      src={src}
                      alt={`${product.name} - photo ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-[#F2EADA] text-sm text-neutral-400">
                No image available
              </div>
            )}

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#F2EADA]">
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

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
                  ৳{basePrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-neutral-600">{product.description}</p>

            {/* Size selector */}
            {sizes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const available = isSizeAvailable(size);
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(size)}
                        className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-[#2B2420] bg-[#2B2420] text-white"
                            : available
                            ? "border-[#E7DCC4] text-[#2B2420] hover:border-[#2B2420]"
                            : "cursor-not-allowed border-[#E7DCC4] text-neutral-300 line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {colors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const available = isColorAvailable(color);
                    const active = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                          active
                            ? "border-[#2B2420] bg-[#2B2420] text-white"
                            : available
                            ? "border-[#E7DCC4] text-[#2B2420] hover:border-[#2B2420]"
                            : "cursor-not-allowed border-[#E7DCC4] text-neutral-300 line-through"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-sm text-neutral-500">
              {needsSelection
                ? "Select options to see availability"
                : availableStock > 0
                ? `${availableStock} in stock`
                : "Out of stock"}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">Qty</span>
              <div className="flex items-center rounded-sm border border-[#E7DCC4]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-[#2B2420] hover:bg-[#F0E6D2]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock || 1, q + 1))}
                  className="flex h-9 w-9 items-center justify-center text-[#2B2420] hover:bg-[#F0E6D2]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || needsSelection}
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
                <Heart className="h-5 w-5" strokeWidth={2} fill={wishlisted ? "#8E3D14" : "none"} />
              </button>
            </div>
          </div>
        </div>

        <ReviewSection productId={product.id} />
        <RelatedProducts productId={product.id} />
      </div>
    </section>
  );
}