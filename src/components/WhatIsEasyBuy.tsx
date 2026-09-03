import Image from "next/image";
import { ShieldCheck, Users } from "lucide-react";
import FadeInView from "@/components/FadeInView";

const points = [
  {
    icon: ShieldCheck,
    title: "Built on trust",
    description:
      "Every payment is held safely until you confirm your order arrived as expected. No surprises.",
  },
  {
    icon: Users,
    title: "Real independent sellers",
    description:
      "No middlemen, no warehouses. Just real people selling directly to real buyers at fair prices.",
  },
];

export default function WhatIsEasyBuy() {
  return (
    <section className="w-full bg-[#F7F2E7] px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Header ── */}
        <FadeInView className="mb-16 text-center" margin="-80px">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
            About us
          </span>
          <h2 className="font-serif text-4xl font-medium text-[#2B2420] sm:text-[44px]">
            What is EasyBuy?
          </h2>
          <a
            href="#"
            className="mt-4 inline-block text-sm font-medium text-[#8E3D14] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#C05620]"
          >
            Read our story
          </a>
        </FadeInView>

        {/* ── Cards ── */}
        <div className="grid gap-6 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, description }, i) => (
            <FadeInView
              key={title}
              delay={i * 0.1}
              y={24}
              className="group rounded-2xl border border-[#E7DCC4] bg-white p-7 text-left shadow-[0_2px_12px_rgba(43,36,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(43,36,32,0.11)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#EA8A4A] to-[#BE531D]">
                <Icon size={22} className="text-[#F7F2E7]" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 font-serif text-lg font-medium text-[#2B2420]">
                {title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#5B5145]">
                {description}
              </p>
            </FadeInView>
          ))}

          {/* third card — logo card */}
          <FadeInView
            delay={0.2}
            y={24}
            className="group rounded-2xl border border-[#E7DCC4] bg-white p-7 text-left shadow-[0_2px_12px_rgba(43,36,32,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(43,36,32,0.11)]"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#F2EADA] p-2">
              <Image
                src="/logo.png"
                alt="EasyBuy"
                width={32}
                height={32}
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="mt-5 font-serif text-lg font-medium text-[#2B2420]">
              Shop with confidence
            </h3>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#5B5145]">
              AI-backed checks flag suspicious listings before they reach you,
              so every purchase feels safe from the start.
            </p>
          </FadeInView>
        </div>

        {/* ── CTA row ── */}
        <FadeInView
          delay={0.3}
          margin="-40px"
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <p className="font-serif text-lg font-medium text-[#2B2420]">
            Have a question? We&apos;ve got answers.
          </p>
          <a
            href="#"
            className="inline-flex items-center rounded-full border border-[#2B2420] px-6 py-2.5 text-sm font-semibold text-[#2B2420] transition-all duration-300 hover:bg-[#2B2420] hover:text-[#F7F2E7]"
          >
            Go to Help Center
          </a>
        </FadeInView>

      </div>
    </section>
  );
}