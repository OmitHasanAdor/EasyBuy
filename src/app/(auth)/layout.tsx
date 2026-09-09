"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const brandLines = [
  "Real sellers,",
  "real styles.",
  "Find something",
  "you'll actually wear.",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[55%_45%] overflow-hidden">

      {/* ── LEFT PANEL — brand / visual ──────────────────────────── */}
      <motion.aside
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease }}
        className="relative hidden md:flex flex-col justify-between overflow-hidden bg-linear-to-br from-[#C05620] to-[#7A3210] px-14 py-12"
        aria-hidden="true"
      >
        {/* Subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        {/* Decorative large background letterform */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={1.2}
          className="pointer-events-none absolute -bottom-10 -right-10 w-[440px] stroke-[#F7F2E7]/8"
        >
          <path d="M30,12 L44,12 L50,24 L56,12 L70,12 L78,92 L58,92 L58,42 L50,58 L42,42 L42,92 L22,92 Z" />
        </svg>

        {/* Decorative dress outline */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={1.2}
          className="pointer-events-none absolute -top-10 -left-6 w-72 stroke-[#F7F2E7]/6"
        >
          <path d="M38,10 Q50,4 62,10 L67,26 L58,22 L64,92 L36,92 L42,22 L33,26 Z" />
        </svg>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.15 }}
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 p-1.5 backdrop-blur-sm">
              <Image
                src="/logo.png"
                alt="EasyBuy"
                width={80}
                height={80}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <span className="text-[15px] font-semibold tracking-wide text-[#F7F2E7]">
              EasyBuy
            </span>
          </Link>
        </motion.div>

        {/* Center copy */}
        <div className="relative z-10 flex flex-col gap-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="text-[11px] font-bold uppercase tracking-[5px] text-[#F7F2E7]/55"
          >
            EasyBuy · Fashion
          </motion.span>

          <div className="space-y-0.5">
            {brandLines.map((line, i) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease, delay: 0.4 + i * 0.1 }}
                className="font-serif text-[36px] font-medium leading-tight text-[#F7F2E7] lg:text-[44px]"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.85 }}
          className="relative z-10 text-[12px] font-medium text-[#F7F2E7]/50"
        >
          Tailored &amp; everyday essentials, since 2024.
        </motion.p>
      </motion.aside>

      {/* ── RIGHT PANEL — form area ───────────────────────────────── */}
      <motion.main
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease }}
        className="flex flex-col items-center justify-center bg-[#F7F2E7] px-6 py-16 sm:px-12"
      >
        {/* Mobile-only logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
          className="mb-10 flex md:hidden flex-col items-center gap-3"
        >
          <Link href="/">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.10)]">
              <Image
                src="/logo.png"
                alt="EasyBuy"
                width={96}
                height={96}
                className="h-full w-full object-contain"
              />
            </div>
          </Link>
          <span className="text-[13px] font-semibold tracking-widest text-[#2B2420]">
            EasyBuy
          </span>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="w-full max-w-md rounded-3xl bg-white/80 px-8 py-10 shadow-[0_8px_40px_rgba(43,36,32,0.10)] backdrop-blur-sm sm:px-10"
        >
          {children}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease, delay: 0.7 }}
          className="mt-8 text-center text-[11px] text-[#5B5145]/60"
        >
          © {new Date().getFullYear()} EasyBuy. All rights reserved.
        </motion.p>
      </motion.main>
    </div>
  );
}
