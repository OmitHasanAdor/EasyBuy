import type { ReactNode } from "react";
import { requireRole } from "@/lib/session";
import DashboardLayout from "@/components/DashboardLayout";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("admin");

  return (
    <DashboardLayout role="admin" userName={user.name} userEmail={user.email}>
      {children}
    </DashboardLayout>
  );
}