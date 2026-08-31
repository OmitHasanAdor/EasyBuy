"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { TriangleAlert, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: send to Sentry later
    console.error("EasyBuy runtime error:", error);
  }, [error]);

  return (
    <section className="relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden bg-[#FBF8F1] px-6 py-20">
      <div className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-[#C05620]/[0.06] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 1.6, duration: 0.6 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]"
        >
          <TriangleAlert className="h-10 w-10" strokeWidth={1.6} />
        </motion.div>

        <div>
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
            Something went wrong
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
            We hit a snag
          </h1>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-[#5B5145]">
          An unexpected error occurred while loading this page. Try heading
          back to the homepage.
        </p>

        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 rounded-sm bg-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#F7F2E7] shadow-md shadow-[#2B2420]/10 transition-all hover:-translate-y-0.5 hover:opacity-90"
        >
          <Home className="h-4 w-4" strokeWidth={2} />
          Back to Home
        </Link>
      </motion.div>
    </section>
  );
}