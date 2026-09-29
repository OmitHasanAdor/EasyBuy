import type { ReactNode } from "react";

// This file is a Next.js route segment layout for everything under /dashboard.
// It intentionally does NOT render Sidebar or know about roles — each role
// folder (buyer/seller/admin) wraps its own content with the reusable
// components/DashboardLayout.tsx component instead, after verifying the
// user's role via requireRole(). Keeping this one simple avoids Next.js
// auto-invoking it with a missing `role` prop.

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}