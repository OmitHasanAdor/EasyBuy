"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* ─── reusable transition presets ──────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col overflow-hidden md:grid md:min-h-[calc(100vh-64px)] md:grid-cols-2"
      aria-label="Hero — Style for him & her"
    >
      {/* ── LEFT PANEL — Menswear ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease }}
        className="relative order-1 flex flex-col items-center justify-center gap-2 overflow-hidden bg-linear-to-br from-[#C05620] to-[#7A3210] py-14 md:order-none md:py-0"
      >
        {/* subtle grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px",
          }}
        />

        {/* Top label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
          className="relative z-10 text-[10px] font-bold uppercase tracking-[4px] text-[#F7F2E7]/60 md:absolute md:left-12 md:top-10"
        >
          01 &nbsp;/&nbsp; Menswear
        </motion.span>

        {/* Decorative large M letterform */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={1.4}
          className="pointer-events-none absolute -bottom-6 -right-8 w-56 stroke-[#F7F2E7]/[0.08] md:w-88"
        >
          <path d="M30,12 L44,12 L50,24 L56,12 L70,12 L78,92 L58,92 L58,42 L50,58 L42,42 L42,92 L22,92 Z" />
        </svg>

        {/* Bottom label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
          className="relative z-10 text-[11px] font-medium text-[#F7F2E7]/50 md:absolute md:bottom-10 md:left-12"
        >
          Tailored &amp; everyday essentials
        </motion.span>
      </motion.div>

      {/* ── CENTER CONTENT CARD ──────────────────────────────────── */}
      {/* On mobile: normal flow block. On desktop: absolute centered overlay */}
      <div className="relative z-20 order-2 flex w-full flex-col items-center bg-[#F7F2E7] px-8 py-12 text-center md:absolute md:left-1/2 md:top-1/2 md:order-none md:w-auto md:-translate-x-1/2 md:-translate-y-1/2 md:bg-transparent md:px-0 md:py-0">

        {/* unified card on desktop */}
        <div className="flex flex-col items-center md:rounded-3xl md:bg-[#F7F2E7]/95 md:px-12 md:py-10 md:shadow-[0_8px_60px_rgba(43,36,32,0.14)] md:backdrop-blur-sm">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.1 }}
            className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_2px_16px_rgba(0,0,0,0.10)]"
          >
            <Image
              src="/logo.png"
              alt="EasyBuy"
              width={112}
              height={112}
              className="h-full w-full object-contain"
              priority
            />
          </motion.div>

          {/* Season badge */}
          <motion.span
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.2 }}
            className="mb-6 inline-block rounded-full bg-[#2B2420] px-5 py-1.5 text-[9px] font-bold uppercase tracking-[5px] text-[#F7F2E7]"
          >
            New Season · EasyBuy
          </motion.span>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.3 }}
            className="font-serif text-[42px] font-medium leading-[1.0] tracking-tight text-[#2B2420] md:text-[60px] md:leading-[0.95]"
          >
            Style, sorted
            <br />
            for{" "}
            <em className="font-medium not-italic text-[#C05620]">him</em>
            {" "}&amp;{" "}
            <em className="font-medium not-italic text-[#C05620]">her</em>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.4 }}
            className="mt-4 max-w-[300px] text-[14.5px] leading-relaxed text-[#5B5145]"
          >
            Real sellers, real styles. Find something you&apos;ll actually
            wear, without the fuss.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.5 }}
            className="mt-7 flex flex-wrap justify-center gap-3"
          >
            <Link
              href="/products?category=Men's Fashion"
              id="hero-shop-men"
              className="inline-flex items-center rounded-full bg-[#2B2420] px-7 py-3.5 text-[13px] font-semibold tracking-wide text-[#F7F2E7] transition-all duration-300 hover:bg-[#C05620] hover:shadow-[0_8px_24px_rgba(192,86,32,0.4)]"
            >
              Shop Men
            </Link>
            <Link
              href="/products?category=Women's Fashion"
              id="hero-shop-women"
              className="inline-flex items-center rounded-full border-2 border-[#2B2420] px-7 py-3.5 text-[13px] font-semibold tracking-wide text-[#2B2420] transition-all duration-300 hover:border-[#C05620] hover:bg-[#C05620] hover:text-[#F7F2E7] hover:shadow-[0_8px_24px_rgba(192,86,32,0.3)]"
            >
              Shop Women
            </Link>
          </motion.div>

        </div>
      </div>

      {/* ── RIGHT PANEL — Womenswear ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, ease }}
        className="relative order-3 flex flex-col items-center justify-center gap-2 overflow-hidden bg-[#F2EADA] py-14 md:order-none md:py-0"
      >
        {/* Top label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
          className="relative z-10 text-[10px] font-bold uppercase tracking-[4px] text-[#8E3D14]/55 md:absolute md:right-12 md:top-10"
        >
          02 &nbsp;/&nbsp; Womenswear
        </motion.span>

        {/* Decorative dress letterform */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={1.4}
          className="pointer-events-none absolute -bottom-8 -left-6 w-52 stroke-[#C05620]/10 md:w-80"
        >
          <path d="M38,10 Q50,4 62,10 L67,26 L58,22 L64,92 L36,92 L42,22 L33,26 Z" />
        </svg>

        {/* Bottom label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
          className="relative z-10 text-[11px] font-medium text-[#8E3D14]/50 md:absolute md:bottom-10 md:right-12"
        >
          Elevated silhouettes for every day
        </motion.span>
      </motion.div>

      {/* ── Diagonal seam (desktop only) ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-36 -translate-x-1/2 bg-[#F7F2E7] md:block"
        style={{ clipPath: "polygon(50% 0%, 100% 0%, 50% 100%, 0% 100%)" }}
      />

      {/* ── Scroll indicator (desktop only) ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 md:flex"
        aria-hidden="true"
      >
        <span className="text-[9px] font-semibold uppercase tracking-[3px] text-[#2B2420]/35">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-[#2B2420]/35" strokeWidth={2} />
        </motion.div>
      </motion.div>
    </section>
  );
}