"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Trash2, Download, ExternalLink, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type TryOnLook = {
  id: string;
  productId: number;
  productName: string;
  imageUrl: string;
  createdAt: string;
};

export default function BuyerLooksPage() {
  const queryClient = useQueryClient();

  const { data: looks = [], isLoading } = useQuery<TryOnLook[]>({
    queryKey: ["my-looks"],
    queryFn: async () => {
      const res = await fetch("/api/trial-room/looks");
      const data = await res.json();
      return data.success ? data.looks : [];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/trial-room/looks?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete look.");
      }
      toast.success("Look removed from your collection.");
      queryClient.setQueryData<TryOnLook[]>(["my-looks"], (old = []) =>
        old.filter((item) => item.id !== id)
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete look.";
      toast.error(msg);
    }
  };

  const handleDownload = (imageUrl: string, productName: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `easybuy-${productName.toLowerCase().replace(/\s+/g, "-")}-look.webp`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section className="w-full bg-[#FBF8F1] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C05620] mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Try-On</span>
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#2B2420]">My Saved Looks</h1>
            <p className="mt-1 text-sm text-[#5C4D44]">
              Revisit and manage the virtual try-on looks you created with EasyBuy AI.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#E7DCC4] bg-white px-4 py-2 text-xs font-semibold text-[#2B2420] shadow-xs hover:border-[#8E3D14] hover:bg-[#FAF7F2] transition-colors"
          >
            <span>Try More Outfits</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#8E3D14]" />
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[#E7DCC4] bg-white p-4 shadow-sm animate-pulse"
              >
                <div className="aspect-3/4 w-full rounded-xl bg-[#F0E6D2]" />
                <div className="mt-4 h-4 w-3/4 rounded bg-[#F0E6D2]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#F0E6D2]" />
              </div>
            ))}
          </div>
        ) : looks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E7DCC4] bg-white p-12 text-center sm:p-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F2E7] text-[#C05620] mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#2B2420]">No Saved Looks Yet</h2>
            <p className="mt-2 max-w-md text-sm text-[#5C4D44]">
              Browse our fashion catalog, tap <span className="font-semibold text-[#8E3D14]">Virtual Trial Room</span> on any clothing item, and save your photo composite to revisit anytime.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#FAF7F2] hover:bg-[#3D332D] shadow-sm transition-colors"
            >
              <Sparkles className="h-4 w-4 text-[#E67E22]" />
              Explore Fashion Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => (
              <motion.div
                key={look.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E7DCC4] bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Look composite image */}
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-[#F2EADA]">
                  <Image
                    src={look.imageUrl}
                    alt={look.productName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                    unoptimized
                  />

                  {/* Top-right floating actions */}
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleDownload(look.imageUrl, look.productName)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2B2420]/80 text-white shadow-sm backdrop-blur-xs hover:bg-[#2B2420] transition-colors"
                      title="Download look"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(look.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/80 text-white shadow-sm backdrop-blur-xs hover:bg-red-600 transition-colors"
                      title="Remove from saved looks"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info & links */}
                <div className="mt-4 flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#2B2420] line-clamp-1">
                      {look.productName}
                    </h3>
                    <p className="mt-1 text-xs text-[#8E3D14]/80">
                      Tried on {new Date(look.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F0E6D2]">
                    <Link
                      href={`/products/${look.productId}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E7DCC4] bg-[#FAF7F2] py-2 text-xs font-semibold text-[#2B2420] hover:bg-white hover:border-[#8E3D14] hover:text-[#8E3D14] transition-colors"
                    >
                      <span>View Product</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
