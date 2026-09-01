import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col overflow-hidden md:grid md:min-h-160 md:grid-cols-2">
      {/* Men's panel */}
      <div className="relative order-1 flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-linear-to-br from-[#C05620] to-[#8E3D14] py-8 md:order-0 md:block md:py-0">
        <span className="relative z-10 text-[13px] font-bold uppercase tracking-[3px] text-[#F7F2E7] md:absolute md:left-12 md:top-8 md:text-[#F7F2E7]/85">
          Menswear
        </span>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={2.2}
          className="pointer-events-none absolute -bottom-8 -right-10 w-60 stroke-[#F7F2E7]/15 md:w-95"
        >
          <path d="M30,12 L44,12 L50,24 L56,12 L70,12 L78,92 L58,92 L58,42 L50,58 L42,42 L42,92 L22,92 Z" />
        </svg>

        <span className="relative z-10 text-[12px] font-medium text-[#F7F2E7]/85 md:absolute md:bottom-10 md:left-12 md:text-[13px] md:text-[#F7F2E7]/90">
          01 — Tailored &amp; everyday essentials
        </span>
      </div>

      {/* Center content — normal flow on mobile, absolute overlay from md up */}
      <div className="relative z-10 order-2 flex w-full flex-col items-center bg-[#F7F2E7] px-6 py-10 text-center md:absolute md:left-1/2 md:top-1/2 md:order-0 md:w-[92vw] md:max-w-140 md:-translate-x-1/2 md:-translate-y-1/2 md:bg-transparent md:px-0 md:py-0">
        {/* Real EasyBuy logo mark */}
        <div className="mb-4 h-14 w-14 overflow-hidden rounded-2xl bg-[#F7F2E7] p-1.5 shadow-md">
          <Image
            src="/logo.png"
            alt="EasyBuy"
            width={112}
            height={112}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <span className="mb-5 rounded-full bg-[#F7F2E7] px-4 py-1.5 text-xs font-semibold uppercase tracking-[4px] text-[#8E3D14]">
          New Season · EasyBuy
        </span>

        <h1 className="bg-[#F7F2E7] px-2.5 py-1 font-serif text-4xl font-medium leading-[1.05] text-[#2B2420] md:text-[56px]">
          Style, sorted
          <br />
          for <em className="font-light italic text-[#C05620]">him</em> &amp;{" "}
          <em className="font-light italic text-[#C05620]">her</em>
        </h1>

        <p className="mt-2.5 max-w-110 bg-[#F7F2E7] px-4 pb-1 pt-2.5 text-[15.5px] leading-relaxed text-[#5B5145]">
          One easy marketplace for men&apos;s and women&apos;s fashion —
          curated sellers, fair prices, and fast delivery across Bangladesh.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3.5 bg-[#F7F2E7] px-4 pb-4 pt-2.5">
          <Link
            href="/products?category=Men's Fashion"
            className="inline-block rounded-sm bg-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#F7F2E7] transition-opacity hover:opacity-90"
          >
            Shop Men
          </Link>
          <Link
            href="/products?category=Women's Fashion"
            className="inline-block rounded-sm border-[1.5px] border-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#2B2420] transition-colors hover:bg-[#2B2420] hover:text-[#F7F2E7]"
          >
            Shop Women
          </Link>
        </div>
      </div>

      {/* Women's panel */}
      <div className="relative order-3 flex flex-col items-center justify-center gap-1.5 overflow-hidden bg-[#F2EADA] py-8 md:order-0 md:block md:py-0">
        <span className="relative z-10 text-[13px] font-bold uppercase tracking-[3px] text-[#8E3D14] md:absolute md:right-12 md:top-8 md:text-[#8E3D14]/85">
          Womenswear
        </span>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={2.2}
          className="pointer-events-none absolute -bottom-10 -left-8 w-55 stroke-[#C05620]/15 md:w-85"
        >
          <path d="M38,10 Q50,4 62,10 L67,26 L58,22 L64,92 L36,92 L42,22 L33,26 Z" />
        </svg>

        <span className="relative z-10 text-[12px] font-medium text-[#8E3D14]/85 md:absolute md:bottom-10 md:right-12 md:text-[13px] md:text-[#8E3D14]/90">
          02 — Elevated silhouettes for every day
        </span>
      </div>

      {/* Diagonal seam (desktop only — mobile stacks panels instead) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-35 -translate-x-1/2 bg-[#F7F2E7] md:block"
        style={{ clipPath: "polygon(50% 0%, 100% 0%, 50% 100%, 0% 100%)" }}
      />
    </section>
  );
}