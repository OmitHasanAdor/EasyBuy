"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Ban } from "lucide-react";

export default function CheckoutCancelPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#FBF8F1] px-6">
      <div className="max-w-md text-center">
        <Ban className="mx-auto mb-4 h-14 w-14 text-[#C05620]" />
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {orderId
            ? `You cancelled payment for order #${orderId}.`
            : "You cancelled the payment."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/buyer/cart"
            className="rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7]"
          >
            Back to Cart
          </Link>
          <Link
            href="/checkout"
            className="rounded-sm border border-[#E7DCC4] px-6 py-3 text-sm font-medium text-[#2B2420]"
          >
            Try Checkout Again
          </Link>
        </div>
      </div>
    </section>
  );
}