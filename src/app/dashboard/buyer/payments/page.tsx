import Link from "next/link";
import { requireRole } from "@/lib/session";
import {
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const CHECKOUT_METHODS = [
  {
    id: "ssl",
    title: "Online payment (SSLCommerz)",
    description:
      "Pay with bKash, Nagad, cards, and other methods through the secure SSLCommerz gateway at checkout.",
    icon: Smartphone,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description:
      "Place the order now and pay in cash when the parcel arrives.",
    icon: Banknote,
  },
] as const;

export default async function BuyerPaymentsPage() {
  await requireRole("buyer");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
          <CreditCard className="h-5 w-5" strokeWidth={2} />
        </div>

        <div>
          <h1 className="font-serif text-2xl font-medium text-[#2B2420] sm:text-3xl">
            Payment Methods
          </h1>
          <p className="text-sm text-[#8E3D14]/80">
            How you can pay for orders on EasyBuy
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-[#E7DCC4] bg-white p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C05620]" />

        <p className="text-sm text-neutral-600">
          Saved cards are not stored on EasyBuy yet. At checkout you can choose
          Cash on Delivery or pay online via SSLCommerz (bKash, Nagad, cards,
          and more).
        </p>
      </div>

      <div className="space-y-4">
        {CHECKOUT_METHODS.map((method) => {
          const Icon = method.icon;

          return (
            <div
              key={method.id}
              className="flex gap-4 rounded-xl border border-[#E7DCC4] bg-white p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F2EADA] text-[#C05620]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#2B2420]">
                  {method.title}
                </h2>

                <p className="mt-1 text-sm text-neutral-600">
                  {method.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <Link
          href="/dashboard/buyer/cart"
          className="inline-flex items-center gap-2 rounded-sm bg-[#2B2420] px-5 py-3 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90"
        >
          Go to cart
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}