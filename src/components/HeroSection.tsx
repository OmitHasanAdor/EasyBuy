import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative grid w-full grid-cols-1 overflow-hidden md:min-h-160 md:grid-cols-2">
      {/* Men's panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-linear-to-br from-[#C05620] to-[#8E3D14] py-20 md:py-0">
        <span className="absolute left-6 top-8 hidden text-[13px] font-bold uppercase tracking-[3px] text-[#F7F2E7]/85 md:block md:left-12">
          Menswear
        </span>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={2.2}
          className="pointer-events-none absolute -bottom-8 -right-10 w-95 stroke-[#F7F2E7]/15"
        >
          <path d="M30,12 L44,12 L50,24 L56,12 L70,12 L78,92 L58,92 L58,42 L50,58 L42,42 L42,92 L22,92 Z" />
        </svg>

        <span className="absolute bottom-10 left-6 hidden text-[13px] font-medium text-[#F7F2E7]/90 md:block md:left-12">
          01 — Tailored &amp; everyday essentials
        </span>
      </div>

      {/* Women's panel */}
      <div className="relative flex items-center justify-center overflow-hidden bg-[#F2EADA] py-20 md:py-0">
        <span className="absolute right-6 top-8 hidden text-[13px] font-bold uppercase tracking-[3px] text-[#8E3D14]/85 md:block md:right-12">
          Womenswear
        </span>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth={2.2}
          className="pointer-events-none absolute -bottom-10 -left-8 w-85 stroke-[#C05620]/15"
        >
          <path d="M38,10 Q50,4 62,10 L67,26 L58,22 L64,92 L36,92 L42,22 L33,26 Z" />
        </svg>

        <span className="absolute bottom-10 right-6 hidden text-[13px] font-medium text-[#8E3D14]/90 md:block md:right-12">
          02 — Elevated silhouettes for every day
        </span>
      </div>

      {/* Diagonal seam (desktop only) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-35 -translate-x-1/2 bg-[#F7F2E7] md:block"
        style={{ clipPath: "polygon(50% 0%, 100% 0%, 50% 100%, 0% 100%)" }}
      />

      {/* Center content */}
      <div className="absolute left-1/2 top-1/2 z-10 flex w-[92vw] max-w-140 -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
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

        <div className="mt-6 flex gap-3.5 bg-[#F7F2E7] px-4 pb-4 pt-2.5">
          <a
            href="#"
            className="inline-block rounded-sm bg-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#F7F2E7] transition-opacity hover:opacity-90"
          >
            Shop Men
          </a>
          <a
            href="#"
            className="inline-block rounded-sm border-[1.5px] border-[#2B2420] px-7 py-3.5 text-sm font-semibold tracking-wide text-[#2B2420] transition-colors hover:bg-[#2B2420] hover:text-[#F7F2E7]"
          >
            Shop Women
          </a>
        </div>
      </div>
    </section>
  );
}