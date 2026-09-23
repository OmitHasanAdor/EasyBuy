import type { ReactNode } from "react";
import Sidebar, { type Role } from "@/components/Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
  role: Role;
  userName?: string;
  userEmail?: string;
};

const DashboardLayout = ({
  children,
  role,
  userName,
  userEmail,
}: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F1] md:flex-row">
      <Sidebar role={role} userName={userName} userEmail={userEmail} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export default DashboardLayout;