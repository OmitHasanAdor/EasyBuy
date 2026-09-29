import { requireRole } from "@/lib/session";
import NotificationsPage from "@/components/NotificationsPage";

export default async function SellerNotificationsPage() {
  await requireRole("seller");
  return <NotificationsPage />;
}