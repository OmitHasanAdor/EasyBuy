import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Star } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  product: {
    id: number;
    name: string;
    images: string[];
  };
  user: {
    name: string;
  };
};

async function getSellerReviews(): Promise<Review[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/reviews`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch seller reviews:", await res.text());
    return [];
  }

  return res.json();
}

export default async function SellerReviewsPage() {
  await requireRole("seller");
  const reviews = await getSellerReviews();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingBreakdown.map((r) => r.count), 1);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Customer Reviews
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Reviews left on your products · {reviews.length} total
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Average */}
        <div className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <p className="text-sm text-[#8E3D14]/80">Average Rating</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-semibold text-[#2B2420]">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </span>
            <div className="mb-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(avgRating)
                      ? "fill-[#C05620] text-[#C05620]"
                      : "text-[#E7DCC4]"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-[#8E3D14]/60">
            Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown */}
        <div className="rounded-xl border border-[#E7DCC4] bg-white p-5">
          <p className="mb-3 text-sm text-[#8E3D14]/80">Rating breakdown</p>
          <div className="space-y-1.5">
            {ratingBreakdown.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-[#3A342C]">{star}</span>
                <Star className="h-3 w-3 fill-[#C05620] text-[#C05620]" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0E6D2]">
                  <div
                    className="h-full rounded-full bg-[#C05620]"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-[#8E3D14]/70">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Star className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No reviews yet</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            Customer reviews on your products will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-[#E7DCC4] bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Product thumb */}
                <div className="flex items-center gap-3 sm:w-48 sm:shrink-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#E7DCC4]">
                    {review.product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.product.images[0]}
                        alt={review.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="truncate text-sm font-medium text-[#2B2420]">
                    {review.product.name}
                  </p>
                </div>

                {/* Review content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= review.rating
                              ? "fill-[#C05620] text-[#C05620]"
                              : "text-[#E7DCC4]"
                          }`}
                        />
                      ))}
                    </div>
                    {review.verifiedPurchase && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <p className="mt-1.5 text-sm font-medium text-[#2B2420]">
                      {review.title}
                    </p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-sm text-[#3A342C] leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-[#8E3D14]/70">
                    {review.user?.name ?? "Customer"} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}