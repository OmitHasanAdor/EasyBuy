import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";

// Dashboard pages are private: keep them out of search results
export const metadata: Metadata = {
  title: { template: "%s | EasyBuy", default: "My Account" },
  robots: { index: false, follow: false },
};

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("buyer");

  return (
    <DashboardLayout role="buyer" userName={user.name} userEmail={user.email}>
      {children}
    </DashboardLayout>
  );
}