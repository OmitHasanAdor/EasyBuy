import { Truck, ShieldCheck, RotateCcw, BadgeCheck } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Same-day delivery in Dhaka, and reliable shipping across all of Bangladesh.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "Pay safely with cards, mobile banking, or cash on delivery — your choice.",
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
    <section className="w-full bg-[#F7F2E7] px-6 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[4px] text-[#C05620]">
            Why EasyBuy
          </span>
          <h2 className="font-serif text-3xl font-medium text-[#2B2420] sm:text-4xl">
            Shopping made simple &amp; trusted
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-lg border border-[#E7DCC4] bg-white/40 px-6 py-10 text-center transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#EA8A4A] to-[#BE531D]">
                <Icon className="h-6 w-6 text-[#F7F2E7]" strokeWidth={2} />
              </div>
              <h3 className="mb-2 font-serif text-lg font-medium text-[#2B2420]">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-[#5B5145]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}