"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type LoadingProps = {
  label?: string;
  variant?: "full" | "inline";
};

export default function Loading({ label = "Loading...", variant = "full" }: LoadingProps) {
  const isFull = variant === "full";

  return (
    <div
      className={
        isFull
          ? "flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-[#FBF8F1] px-6"
          : "flex flex-col items-center justify-center gap-3 py-6"
      }
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* glow pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.15, 0.45] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="absolute h-full w-full rounded-full bg-[#C05620]/30 blur-xl"
        />
        {/* rotating ring, logo sits inside it */}
        <div className="absolute h-16 w-16 rounded-full border-[3px] border-[#F2EADA] border-t-[#C05620] animate-spin" />

        {/* spin rotate */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        >
          <Image src="/logo.png" alt="EasyBuy" width={34} height={34} priority />
        </motion.div>
      </div>

      {label && <LoadingText text={label} />}
    </div>
  );
}

// three-dot bounce
function LoadingText({ text }: { text: string }) {
  const base = text.replace(/\.+$/, "");
  return (
    <div className="flex items-center gap-2">
      <p className="font-serif text-sm text-[#8E3D14]">{base}</p>
      <div className="loader-dots" />
    </div>
  );
}

// placeholder shape while a product card's data is still loading
export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-square w-full animate-pulse rounded-lg bg-[#F2EADA]" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#F2EADA]" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-[#F2EADA]" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}