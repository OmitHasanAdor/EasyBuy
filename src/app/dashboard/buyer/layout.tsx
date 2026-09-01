import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("buyer");

  return (
    <DashboardLayout role="buyer" userName={user.name} userEmail={user.email}>
      {children}
    </DashboardLayout>
  );
}