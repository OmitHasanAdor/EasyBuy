import { requireRole } from "@/lib/session";
import NotificationsPage from "@/components/NotificationsPage";

export default async function BuyerNotificationsPage() {
  await requireRole("buyer");
  return <NotificationsPage />;
}