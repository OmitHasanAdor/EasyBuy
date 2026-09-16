"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const tranId = params.get("tran_id");
  const valId = params.get("val_id");

  const [status, setStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(!!tranId);

  useEffect(() => {
    if (!tranId) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await authFetch(`${API_URL}/api/payments/sslcommerz/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tran_id: tranId,
            val_id: valId || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          setStatus(data.paymentStatus ?? null);
        }
      } catch {
        // ignore — still show success UI
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tranId, valId]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#FBF8F1] px-6">
      <div className="max-w-md text-center">
        {checking ? (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#C05620]" />
            <p className="text-sm text-neutral-500">Confirming payment...</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" />
            <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
              {status === "PAID" ? "Payment successful!" : "Order placed!"}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {orderId
                ? `Order #${orderId}${
                    status === "PAID"
                      ? " is paid."
                      : status === "UNPAID" && tranId
                      ? " — payment is being confirmed."
                      : " — pay on delivery."
                  }`
                : "Your order was submitted successfully."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard/buyer/orders"
                className="rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7]"
              >
                View Orders
              </Link>
              <Link
                href="/products"
                className="rounded-sm border border-[#E7DCC4] px-6 py-3 text-sm font-medium text-[#2B2420]"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}