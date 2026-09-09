"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import { authFetch } from "@/lib/auth-fetch";

type Review = {
  id: number;
  productId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    images: string[];
  };
};

export default function BuyerReviewPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery<Review[]>({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      const res = await authFetch(`${API_URL}/api/reviews/my`);

      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }

      return res.json();
    },
  });

  const deleteReview = async (productId: number, reviewId: number) => {
    setDeletingId(reviewId);

    try {
      const res = await authFetch(
        `${API_URL}/api/products/${productId}/reviews`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete review");
      }

      toast.success("Review deleted.");

      queryClient.invalidateQueries({
        queryKey: ["my-reviews"],
      });

      queryClient.invalidateQueries({
        queryKey: ["reviews", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } catch {
      toast.error("Couldn't delete your review. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-neutral-500">
            Loading your reviews...
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-neutral-500">
            Could not load your reviews right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
            <MessageSquare className="h-5 w-5" strokeWidth={2} />
          </div>

          <div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
              My Reviews
            </h1>

            <p className="text-sm text-neutral-500">
              {reviews.length === 0
                ? "You haven't written any reviews yet."
                : `${reviews.length} review${
                    reviews.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-[#E7DCC4] bg-white/60 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
              <MessageSquare className="h-8 w-8" strokeWidth={1.6} />
            </div>

            <p className="max-w-xs text-sm text-neutral-500">
              You haven&apos;t reviewed any products yet.
            </p>

            <Link
              href="/products"
              className="mt-1 rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Review list */
          <div className="flex flex-col gap-5">
            {reviews.map((review) => {
              const image = review.product.images?.[0];

              return (
                <div
                  key={review.id}
                  className="rounded-lg border border-[#E7DCC4] bg-white p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    {/* Product image */}
                    <Link
                      href={`/products/${review.product.id}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[#F2EADA]"
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={review.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                          No image
                        </div>
                      )}
                    </Link>

                    {/* Review content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/products/${review.product.id}`}
                          className="font-serif text-lg text-[#2B2420] hover:text-[#C05620]"
                        >
                          {review.product.name}
                        </Link>

                        {review.verifiedPurchase && (
                          <span className="rounded-full bg-[#F0E6D2] px-2 py-0.5 text-[10px] font-semibold text-[#8E3D14]">
                            Verified purchase
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mb-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className="h-4 w-4"
                            strokeWidth={0}
                            fill={
                              n <= review.rating
                                ? "#C05620"
                                : "#E7DCC4"
                            }
                          />
                        ))}
                      </div>

                      {/* Title */}
                      {review.title && (
                        <p className="font-semibold text-[#2B2420]">
                          {review.title}
                        </p>
                      )}

                      {/* Comment */}
                      {review.comment && (
                        <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                          {review.comment}
                        </p>
                      )}

                      {/* Date */}
                      <p className="mt-2 text-xs text-neutral-400">
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString()}
                        {review.updatedAt !== review.createdAt &&
                          " · Edited"}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-4">
                        <Link
                          href={`/products/${review.product.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2B2420] hover:text-[#C05620]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit review
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === review.id}
                          onClick={() =>
                            deleteReview(
                              review.product.id,
                              review.id
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8E3D14] disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />

                          {deletingId === review.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}