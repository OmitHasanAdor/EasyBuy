"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F2E7] px-6 py-20 text-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#EA8A4A] to-[#BE531D] shadow-lg"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
          transition={{ duration: 1.1, delay: 0.4, ease: "easeInOut" }}
        >
          <ShieldAlert className="h-11 w-11 text-[#F7F2E7]" strokeWidth={1.8} />
        </motion.div>
      </motion.div>

      {/* Eyebrow */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-3 text-xs font-semibold uppercase tracking-[4px] text-[#C05620]"
      >
        Error 403
      </motion.span>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="font-serif text-4xl font-medium text-[#2B2420] sm:text-5xl"
      >
        Access Denied
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.45 }}
        className="mt-4 max-w-md text-[15.5px] leading-relaxed text-[#5B5145]"
      >
        You don&apos;t have permission to view this page. If you think this
        is a mistake, try signing in with the correct account or head back
        to somewhere you belong.
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.45 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm bg-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#F7F2E7] transition-opacity hover:opacity-90"
        >
          <Home className="h-4 w-4" strokeWidth={2} />
          Back to Homepage
        </Link>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-sm border-[1.5px] border-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#2B2420] transition-colors hover:bg-[#2B2420] hover:text-[#F7F2E7]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Sign In Again
        </Link>
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12 text-xs text-[#8E3D14]/70"
      >
        EasyBuy · Keeping every account&apos;s access exactly where it
        belongs
      </motion.p>
    </div>
  );
}