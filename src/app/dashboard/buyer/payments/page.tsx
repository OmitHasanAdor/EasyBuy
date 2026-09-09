import { requireRole } from "@/lib/session";
import { CreditCard } from "lucide-react";

export default async function BuyerPaymentsPage() {
  await requireRole("buyer");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Payment Methods
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Manage how you pay for orders
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Saved payment methods are not available yet. At checkout you can still
        choose bKash, Nagad, Card, or Cash on Delivery.
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
        <CreditCard className="mb-3 h-10 w-10 text-[#E7DCC4]" />
        <p className="text-sm font-medium text-[#2B2420]">
          No saved payment methods
        </p>
        <p className="mt-1 max-w-sm text-center text-sm text-[#8E3D14]/70">
          Secure card saving will be added later via a payment provider.
        </p>
      </div>
    </div>
  );
}