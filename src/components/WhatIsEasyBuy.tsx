import Image from "next/image";
import { ShieldCheck, Users } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "A marketplace built on trust",
    description:
      "EasyBuy connects local sellers with buyers across Bangladesh. Every payment is held safely until you confirm your order has arrived as expected.",
  },
  {
    icon: Users,
    title: "Support independent sellers",
    description:
      "No middlemen, no warehouses — just real sellers reaching real buyers directly, with fair pricing on every listing.",
  },
];

export default function WhatIsEasyBuy() {
  return (
    <section className="w-full bg-[#F7F2E7] px-6 py-24 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-serif text-4xl font-normal text-[#2B2420] sm:text-[44px]">
          What is EasyBuy?
        </h2>
        <a
          href="#"
          className="mt-3 inline-block text-sm text-[#8E3D14] underline decoration-dotted underline-offset-4 transition-colors hover:text-[#C05620]"
        >
          Read our story
        </a>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#ddd6c9] bg-white p-7 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA]">
                <Icon size={22} className="text-[#8E3D14]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-[#2B2420]">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                {description}
              </p>
            </div>
          ))}

          <div className="rounded-2xl border border-[#ddd6c9] bg-white p-7 text-left shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA] p-2">
              <Image
                src="/logo.png"
                alt="EasyBuy"
                width={28}
                height={28}
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[#2B2420]">
              Shop with confidence
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
              Our AI-backed checks flag suspicious listings before they reach
              you, so every purchase feels safe from start to finish.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-lg font-semibold text-[#2B2420]">
            Have a question? We&apos;ve got some answers.
          </p>
          <a
            href="#"
            className="mt-5 inline-block rounded-full border border-[#2B2420] px-6 py-2.5 text-sm font-semibold text-[#2B2420] transition-colors hover:bg-[#2B2420] hover:text-white"
          >
            Go to Help Center
          </a>
        </div>
      </div>
    </section>
  );
}