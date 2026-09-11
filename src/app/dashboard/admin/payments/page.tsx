import { requireRole } from "@/lib/session";
import { Wallet } from "lucide-react";

export default async function AdminPaymentsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Payments & Transactions
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Track platform payments and payouts
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Payment gateway integration is not connected yet. Transaction history
        and seller payouts will appear here once a provider (e.g. bKash,
        SSLCommerz, Stripe) is set up.
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
        <Wallet className="mb-3 h-10 w-10 text-[#E7DCC4]" />
        <p className="text-sm font-medium text-[#2B2420]">No transactions yet</p>
        <p className="mt-1 max-w-sm text-center text-sm text-[#8E3D14]/70">
          Order payments, refunds, and seller payouts will be listed here.
        </p>
      </div>
    </div>
  );
}