import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CreditCard, MessageSquareText, Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "EasyBuy is a fashion and lifestyle marketplace for Bangladesh where approved independent sellers meet buyers directly.",
};

const pillars = [
  {
    icon: Store,
    title: "Independent sellers",
    text: "EasyBuy is a marketplace, not a warehouse. Local sellers list their own products and ship them to you.",
  },
  {
    icon: BadgeCheck,
    title: "Every seller is reviewed",
    text: "Anyone can apply to sell, but a shop only goes live after our team has reviewed and approved the application.",
  },
  {
    icon: CreditCard,
    title: "Pay the way you prefer",
    text: "Choose cash on delivery, or pay online by card or mobile banking through SSLCommerz.",
  },
  {
    icon: MessageSquareText,
    title: "Honest reviews",
    text: "Only buyers who have received a product can review it, so ratings come from real orders.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#FBF8F1]">
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
          Our story
        </span>
        <h1 className="font-serif text-4xl font-medium text-[#2B2420] sm:text-5xl">
          Commerce that stays human
        </h1>
        <p className="mt-6 text-[15.5px] leading-relaxed text-[#5B5145]">
          EasyBuy started with a simple idea: shopping for clothes and everyday
          essentials in Bangladesh should feel personal again. Instead of one big
          store, EasyBuy brings together independent sellers and the people who
          buy from them, with clear prices in taka and delivery across the country.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-16 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-[#E7DCC4] bg-white p-7 shadow-[0_2px_12px_rgba(43,36,32,0.06)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#EA8A4A] to-[#BE531D]">
              <Icon className="h-5 w-5 text-[#F7F2E7]" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 font-serif text-lg font-medium text-[#2B2420]">{title}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#5B5145]">{text}</p>
          </div>
        ))}
      </section>

      <section className="border-t border-[#E7DCC4] bg-[#F7F2E7] px-6 py-14 text-center">
        <h2 className="font-serif text-2xl font-medium text-[#2B2420]">Be part of it</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5B5145]">
          Find something you&apos;ll actually wear, or open your own shop on EasyBuy.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7] transition hover:bg-[#C05620]"
          >
            Browse products
          </Link>
          <Link
            href="/dashboard/buyer/profile"
            className="rounded-full border border-[#2B2420] px-6 py-3 text-sm font-semibold text-[#2B2420] transition hover:bg-[#2B2420] hover:text-[#F7F2E7]"
          >
            Become a seller
          </Link>
          <Link
            href="/help"
            className="rounded-full px-6 py-3 text-sm font-semibold text-[#8E3D14] underline decoration-dotted underline-offset-4 hover:text-[#C05620]"
          >
            Help Center
          </Link>
        </div>
      </section>
    </div>
  );
}
