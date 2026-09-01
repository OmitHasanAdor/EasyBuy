import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";


export default async function SellerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("seller");

  return (
    <DashboardLayout role="seller" userName={user.name} userEmail={user.email}>
      {children}
    </DashboardLayout>
  );
}