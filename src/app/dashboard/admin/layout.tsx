import type { Metadata } from "next"
import type { ReactNode } from "react"
import { requireRole } from "@/lib/session"
import DashboardLayout from "@/components/DashboardLayout"

// Dashboard pages are private: keep them out of search results
export const metadata: Metadata = {
  title: { template: "%s | EasyBuy Admin", default: "Admin Dashboard" },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await requireRole("admin")

  return (
    <DashboardLayout
      role="admin"
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  )
}