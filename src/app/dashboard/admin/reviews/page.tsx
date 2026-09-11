import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Star } from "lucide-react";
import { DeleteReviewButton } from "./DeleteReviewButton";

type Review = {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  product: { id: number; name: string; images: string[] };
  user: { id: string; name: string; email: string };
};

async function getReviews(): Promise<Review[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminReviewsPage() {
  await requireRole("admin");
  const reviews = await getReviews();

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Review Moderation
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          {reviews.length} reviews · avg {avg > 0 ? avg.toFixed(1) : "—"}★
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Star className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[#E7DCC4] bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3 sm:w-52 sm:shrink-0">
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-[#E7DCC4]">
                    {r.product.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#2B2420]">
                      {r.product.name}
                    </p>
                    <p className="text-xs text-[#8E3D14]/70">{r.user.name}</p>
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= r.rating
                              ? "fill-[#C05620] text-[#C05620]"
                              : "text-[#E7DCC4]"
                          }`}
                        />
                      ))}
                    </div>
                    {r.verifiedPurchase && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <p className="mt-1 text-sm font-medium text-[#2B2420]">
                      {r.title}
                    </p>
                  )}
                  {r.comment && (
                    <p className="mt-1 text-sm text-[#3A342C]">{r.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-[#8E3D14]/60">
                    {r.user.email} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                <DeleteReviewButton reviewId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}