"use client";

import { Truck, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery in Dhaka, and reliable shipping across all of Bangladesh.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Pay with cards, mobile banking, or cash on delivery. Your choice, always safe.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "Changed your mind? Return any item within 7 days, no questions asked.",
  },
  {
    icon: BadgeCheck,
    title: "Curated Quality",
    desc: "Every seller on EasyBuy is vetted, so you always shop with confidence.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-white px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
            Why EasyBuy
          </span>
          <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
            Shopping made simple &amp; trusted
          </h2>
        </motion.div>

        {/* ── Feature grid ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: i * 0.08 }}
              className="group flex flex-col items-center rounded-2xl border border-[#E7DCC4] bg-[#F7F2E7]/60 px-6 py-10 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_32px_rgba(43,36,32,0.10)]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#EA8A4A] to-[#BE531D] shadow-[0_4px_16px_rgba(192,86,32,0.25)] transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-6 w-6 text-[#F7F2E7]" strokeWidth={1.8} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-medium text-[#2B2420]">
                {title}
              </h3>
              <p className="text-[14px] leading-relaxed text-[#5B5145]">{desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}