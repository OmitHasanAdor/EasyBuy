"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

export default function CheckoutFailPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#FBF8F1] px-6">
      <div className="max-w-md text-center">
        <XCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Payment failed
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {orderId
            ? `Order #${orderId} could not be paid. Your items are still in your cart, so you can try again.`
            : "Payment was not completed."}
        </p>
        {orderId && (
          <p className="mt-2 text-xs text-neutral-400">
            If the unpaid order still shows as pending, you can cancel it from{" "}
            <Link href="/dashboard/buyer/orders" className="underline hover:text-[#C05620]">
              My Orders
            </Link>
            .
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/buyer/cart"
            className="rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7]"
          >
            Back to Cart
          </Link>
          <Link
            href="/products"
            className="rounded-sm border border-[#E7DCC4] px-6 py-3 text-sm font-medium text-[#2B2420]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}