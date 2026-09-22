"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Sparkles,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { API_URL } from "@/config/api";
import Loading from "@/components/Loading";
import { Product } from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import RelatedProducts from "@/components/RelatedProducts";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist";
import { trackRecentlyViewed } from "@/lib/recently-viewed";
import { isDiscountActive, unitPrice } from "@/lib/pricing";
import TrialRoomModal from "@/components/trial-room/TrialRoomModal";
import { isApparelProduct } from "@/lib/apparel";
import { authFetch } from "@/lib/auth-fetch";
import { authClient } from "@/lib/auth-client";

const LOW_STOCK_THRESHOLD = 10;
const NEW_WINDOW_DAYS = 3;

type ProductVariant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
};

export type ProductDetail = Product & {
  variants: ProductVariant[];
};

function getTrialMode(category: string): "try_on" | "in_room" | null {
  const c = category.toLowerCase();
  if (c.includes("home") || c.includes("lifestyle")) return "in_room";
  if (c.includes("men") || c.includes("women") || c.includes("fashion")) {
    return "try_on";
  }
  return null;
}

export default function ProductDetailClient({
  initialProduct,
}: {
  initialProduct: ProductDetail;
}) {
  const productId = initialProduct.id;
  const { data: product, isLoading, isError } = useQuery<ProductDetail>({
    queryKey: ["product", productId],
    queryFn: () =>
      axios.get(`${API_URL}/api/products/${productId}`).then((res) => res.data),
    initialData: initialProduct,
    initialDataUpdatedAt: 0,
  });

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { data: session } = authClient.useSession();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isTrialRoomOpen, setIsTrialRoomOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [now] = useState(() => Date.now());

  const fileRef = useRef<HTMLInputElement>(null);
  const [trialFile, setTrialFile] = useState<File | null>(null);
  const [trialPreview, setTrialPreview] = useState<string | null>(null);
  const [trialResult, setTrialResult] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  useEffect(() => {
    if (product) trackRecentlyViewed(product.id);
  }, [product]);

  function onPickTrialFile(file: File | null) {
    setTrialResult(null);
    setTrialFile(file);
    setTrialPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function runTrial() {
    if (!session?.user) {
      toast.error("Please sign in to use AI try-on");
      return;
    }
    if (!trialFile || !product) return;

    setTrialLoading(true);
    setTrialResult(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(trialFile);
      });

      const res = await authFetch(`${API_URL}/api/try-on`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, image: dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not generate preview");
        return;
      }
      setTrialResult(data.image as string);
      toast.success("Preview ready");
    } catch {
      toast.error("Try-on failed. Please try again.");
    } finally {
      setTrialLoading(false);
    }
  }

  if (isLoading) return <Loading label="Loading product..." variant="full" />;
  if (isError || !product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-neutral-500">Product not found.</p>
      </div>
    );
  }

  const trialMode = getTrialMode(product.category);
  const variants = product.variants ?? [];
  const hasVariants = !!product.hasVariants && variants.length > 0;
  const sizes = [
    ...new Set(variants.map((v) => v.size).filter((s): s is string => !!s)),
  ];
  const colors = [
    ...new Set(variants.map((v) => v.color).filter((c): c is string => !!c)),
  ];
  const matchedVariant = hasVariants
    ? variants.find(
        (v) =>
          (sizes.length === 0 || v.size === selectedSize) &&
          (colors.length === 0 || v.color === selectedColor)
      )
    : undefined;

  const isSizeAvailable = (size: string) =>
    variants.some(
      (v) =>
        v.size === size &&
        (!selectedColor || v.color === selectedColor) &&
        v.stock > 0
    );
  const isColorAvailable = (color: string) =>
    variants.some(
      (v) =>
        v.color === color &&
        (!selectedSize || v.size === selectedSize) &&
        v.stock > 0
    );

  const needsSelection =
    hasVariants &&
    ((sizes.length > 0 && !selectedSize) ||
      (colors.length > 0 && !selectedColor));
  const availableStock = hasVariants
    ? (matchedVariant?.stock ?? 0)
    : product.stock;
  const basePrice = matchedVariant?.price ?? product.price;
  const hasDiscount = isDiscountActive(product);
  const finalPrice = unitPrice(product, matchedVariant?.price);
  const daysSinceCreated = product.createdAt
    ? (now - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const isNew =
    daysSinceCreated !== null && daysSinceCreated <= NEW_WINDOW_DAYS;
  const isLowStock =
    availableStock > 0 && availableStock < LOW_STOCK_THRESHOLD;
  const isOutOfStock = availableStock === 0;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const isApparel = isApparelProduct(product);
  const wishlisted = isWishlisted(product.id);

  const handleWishlist = () => {
    const wasWishlisted = wishlisted;
    const success = toggle(product.id);
    if (success) {
      toast.success(
        wasWishlisted ? "Removed from wishlist" : "Added to wishlist"
      );
    } else {
      toast.error("Couldn't update your wishlist. Please try again.");
    }
  };

  const handleAddToCart = async () => {
    if (hasVariants && !matchedVariant) {
      toast.error("Please select a size/color first.");
      return;
    }
    const success = await addItem({
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
    }
  };

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500"
        >
          <Link href="/" className="hover:text-[#8E3D14]">
            Home
          </Link>
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

            {/* Quick Virtual Trial Room badge overlay */}
            {isApparel && images.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTrialRoomOpen(true)}
                className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-[#2B2420]/85 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-sm transition-all hover:bg-[#8E3D14] hover:scale-105"
                title="Try on this item virtually with AI"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#E7C182]" />
                <span>Virtual Try-On</span>
              </button>
            )}

            {images.length > 0 ? (
              <Swiper
                spaceBetween={10}
                onSwiper={setSwiper}
                onSlideChange={(s) => setActiveImageIndex(s.activeIndex)}
                className="aspect-square w-full overflow-hidden rounded-lg bg-[#F2EADA]"
              >
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
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(i);
                      swiper?.slideTo(i);
                    }}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#F2EADA] border transition-all ${
                      activeImageIndex === i
                        ? "border-[#8E3D14] ring-2 ring-[#8E3D14]/40"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Select photo ${i + 1}`}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420]">
              {product.name}
            </h1>
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
            <p className="text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>

            {sizes.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
                  Size
                </p>
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

            {colors.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
                  Color
                </p>
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

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8E3D14]">
                Qty
              </span>
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
                  onClick={() =>
                    setQuantity((q) => Math.min(availableStock || 1, q + 1))
                  }
                  className="flex h-9 w-9 items-center justify-center text-[#2B2420] hover:bg-[#F0E6D2]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-3">
              {/* Virtual Trial Room CTA */}
              {isApparel && (
                <button
                  type="button"
                  onClick={() => setIsTrialRoomOpen(true)}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-sm border border-[#C05620] bg-gradient-to-r from-[#FBF8F1] via-[#FFF8EE] to-[#FDF4E7] px-6 py-3 text-sm font-semibold text-[#8E3D14] shadow-xs transition-all duration-300 hover:border-[#8E3D14] hover:bg-[#8E3D14] hover:text-white hover:shadow-sm"
                >
                  <Sparkles className="h-4 w-4 text-[#C05620] transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
                  <span>Virtual Trial Room — Try On with AI</span>
                  <span className="ml-1 rounded bg-[#C05620]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8E3D14] group-hover:bg-white/20 group-hover:text-white">
                    AI Beta
                  </span>
                </button>
              )}

              <div className="flex gap-3">
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

            {trialMode && (
              <div className="mt-6 rounded-lg border border-[#E7DCC4] bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C05620]" />
                  <h2 className="text-sm font-semibold text-[#2B2420]">
                    {trialMode === "in_room" ? "See in my room" : "Try on me"}
                  </h2>
                </div>
                <p className="mb-3 text-xs text-neutral-500">
                  {trialMode === "in_room"
                    ? "Upload a photo of your room. AI will place this product in the scene."
                    : "Upload a clear photo of yourself. AI will show this item on you."}{" "}
                  Preview only — not an exact fit.
                </p>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    onPickTrialFile(e.target.files?.[0] ?? null)
                  }
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-sm border border-[#E7DCC4] px-4 py-2.5 text-sm font-medium text-[#2B2420] hover:bg-[#F0E6D2]"
                  >
                    <Upload className="h-4 w-4" />
                    {trialFile ? "Change photo" : "Upload photo"}
                  </button>
                  <button
                    type="button"
                    disabled={!trialFile || trialLoading}
                    onClick={runTrial}
                    className="inline-flex items-center gap-2 rounded-sm bg-[#C05620] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
                  >
                    {trialLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate preview
                      </>
                    )}
                  </button>
                </div>

                {(trialPreview || trialResult) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {trialPreview && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                          Your photo
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={trialPreview}
                          alt="Upload preview"
                          className="max-h-64 w-full rounded-md object-contain bg-[#F2EADA]"
                        />
                      </div>
                    )}
                    {trialResult && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                          AI preview
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={trialResult}
                          alt="AI try-on result"
                          className="max-h-64 w-full rounded-md object-contain bg-[#F2EADA]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ReviewSection productId={product.id} />
        <RelatedProducts productId={product.id} />

        {/* Virtual Trial Room Modal */}
        <TrialRoomModal
          isOpen={isTrialRoomOpen}
          onClose={() => setIsTrialRoomOpen(false)}
          product={{
            id: product.id,
            name: product.name,
            images: images,
            price: finalPrice,
            category: product.category,
          }}
          selectedImage={images[activeImageIndex] || images[0]}
        />
      </div>
    </section>
  );
}