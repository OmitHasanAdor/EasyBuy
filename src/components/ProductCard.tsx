"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/lib/wishlist";
import MiniCountdown from "@/components/MiniCountdown";

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  stock: number;
  isBestSeller?: boolean;
  createdAt?: string;
  discountPercent?: number | null;
  saleEndsAt?: string | null;
  hasVariants?: boolean;
  reviews?: { rating: number }[];
};

type ProductCardProps = {
  product: Product;
  badge?: { label: string; className: string } | null;
  variant?: "default" | "sale";
};

const LOW_STOCK_THRESHOLD = 10;

export default function ProductCard({ product, badge, variant = "default" }: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const hasDiscount = !!product.discountPercent && product.discountPercent > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercent! / 100))
    : product.price;

  // Get the cover image and average rating
  const coverImage = product.images?.[0] || null;

  const reviewCount = product.reviews?.length ?? 0;
  const avgRating =
    reviewCount > 0
      ? product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWishlisted = wishlisted;
    const success = toggle(product.id);
    if (success) {
      toast.success(wasWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } else {
      toast.error("Couldn't update your wishlist. Please try again.");
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-lg ${
        variant === "sale"
          ? "border-[#C05620]/30 ring-1 ring-[#C05620]/20 hover:ring-[#C05620]/50"
          : "border-[#E7DCC4]"
      }`}
    >
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        {badge && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        )}
        {hasDiscount && (
          <span className="rounded-full bg-[#C05620] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            -{product.discountPercent}%
          </span>
        )}
        {product.stock < LOW_STOCK_THRESHOLD && product.stock > 0 && (
          <span className="rounded-full bg-[#2B2420] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-full bg-neutral-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of Stock
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        onClick={handleWishlist}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#8E3D14] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95"
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={2} fill={wishlisted ? "#8E3D14" : "none"} />
      </button>

      <div className="relative aspect-square overflow-hidden bg-[#F2EADA]">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-8 w-8 text-[#C9BB9C]" strokeWidth={1.5} />
          </div>
        )}
        {variant === "sale" && product.saleEndsAt && (
          <MiniCountdown endsAt={product.saleEndsAt} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8E3D14]">
          {product.category}
        </span>
        <h3 className="font-serif text-base font-medium leading-snug text-[#2B2420]">
          {product.name}
        </h3>

        {avgRating !== null && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#C05620] text-[#C05620]" strokeWidth={0} />
            <span className="text-xs font-semibold text-[#2B2420]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({reviewCount})</span>
          </div>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className={`font-serif text-lg font-medium ${variant === "sale" ? "text-[#C05620]" : "text-[#2B2420]"}`}>
            ৳{discountedPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-neutral-400 line-through">
              ৳{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}