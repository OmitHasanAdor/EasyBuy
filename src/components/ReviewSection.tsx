"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

type Review = {
  id: number;
  userId: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt?: string;
  user: { name: string };
};

export default function ReviewSection({ productId }: { productId: number }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: () => fetch(`${API_URL}/api/products/${productId}/reviews`).then((res) => res.json()),
  });

  const myReview = userId ? reviews.find((r) => r.userId === userId) ?? null : null;
  const isEditing = !!myReview;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset form when switching between editing and writing a new review
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title ?? "");
      setComment(myReview.comment ?? "");
    } else {
      setRating(5);
      setTitle("");
      setComment("");
    }
    // Reset hover state when switching between editing and writing a new review
  }, [myReview?.id]);

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  const submitReview = async () => {
    if (!userId) {
      toast.error("Please sign in to leave a review.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success(isEditing ? "Review updated." : "Review saved. Thanks for sharing!");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch {
      toast.error("Couldn't save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!userId) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API_URL}/api/products/${productId}/reviews`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Review deleted.");
      setRating(5);
      setTitle("");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch {
      toast.error("Couldn't delete your review. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-[#E7DCC4] pt-10">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-serif text-2xl font-medium text-[#2B2420]">Reviews</h2>
        {avgRating !== null && (
          <span className="flex items-center gap-1 text-sm text-neutral-600">
            <Star className="h-4 w-4 fill-[#C05620] text-[#C05620]" strokeWidth={0} />
            {avgRating.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Write / edit a review */}
      <div className="mb-10 rounded-lg border border-[#E7DCC4] bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          {isEditing && <Pencil className="h-3.5 w-3.5 text-[#8E3D14]" strokeWidth={2} />}
          <p className="text-sm font-semibold text-[#2B2420]">
            {isEditing ? "Edit your review" : "Write a review"}
          </p>
        </div>

        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} star`}
              className="p-0.5"
            >
              <Star
                className="h-6 w-6"
                strokeWidth={1.5}
                fill={n <= (hoverRating || rating) ? "#C05620" : "none"}
                color={n <= (hoverRating || rating) ? "#C05620" : "#C9BB9C"}
              />
            </button>
          ))}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          maxLength={120}
          className="mb-2 w-full rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what you liked or didn't (optional)"
          maxLength={2000}
          rows={3}
          className="mb-3 w-full rounded-sm border border-[#E7DCC4] px-3 py-2 text-sm text-[#2B2420]"
        />

        {userId ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={submitReview}
              disabled={submitting || deleting}
              className="rounded-sm bg-[#2B2420] px-5 py-2.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Saving..." : isEditing ? "Update review" : "Submit review"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={deleteReview}
                disabled={submitting || deleting}
                className="text-sm font-semibold text-[#8E3D14] underline underline-offset-2 disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete review"}
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-block rounded-sm bg-[#2B2420] px-5 py-2.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
          >
            Sign in to review
          </Link>
        )}
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-[#E7DCC4] pb-6 last:border-0">
              <div className="mb-1 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-3.5 w-3.5"
                    strokeWidth={0}
                    fill={n <= r.rating ? "#C05620" : "#E7DCC4"}
                  />
                ))}
                {r.verifiedPurchase && (
                  <span className="ml-1 rounded-full bg-[#F0E6D2] px-2 py-0.5 text-[10px] font-semibold text-[#8E3D14]">
                    Verified purchase
                  </span>
                )}
                {userId === r.userId && (
                  <span className="ml-1 rounded-full bg-[#2B2420] px-2 py-0.5 text-[10px] font-semibold text-[#F7F2E7]">
                    Your review
                  </span>
                )}
              </div>
              {r.title && <p className="font-semibold text-[#2B2420]">{r.title}</p>}
              {r.comment && <p className="mt-1 text-sm leading-relaxed text-neutral-600">{r.comment}</p>}
              <p className="mt-2 text-xs text-neutral-400">
                {r.user.name} · {new Date(r.createdAt).toLocaleDateString()}
                {r.updatedAt && r.updatedAt !== r.createdAt && " (edited)"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}