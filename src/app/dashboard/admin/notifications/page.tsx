import { requireRole } from "@/lib/session";
import NotificationsPage from "@/components/NotificationsPage";

export default async function AdminNotificationsPage() {
  await requireRole("admin");
  return <NotificationsPage />;
}