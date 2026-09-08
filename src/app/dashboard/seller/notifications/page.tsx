import { requireRole } from "@/lib/session";
import { Bell, Package, ShoppingCart, Star, Wallet } from "lucide-react";

// Placeholder types — later replace with real API data
type NotificationItem = {
  id: string;
  type: "order" | "review" | "stock" | "payout" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// For now: empty. When you add Notification model + API, fetch here.
async function getNotifications(): Promise<NotificationItem[]> {
  return [];
}

const TYPE_ICON = {
  order: ShoppingCart,
  review: Star,
  stock: Package,
  payout: Wallet,
  system: Bell,
};

export default async function SellerNotificationsPage() {
  await requireRole("seller");
  const notifications = await getNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#8E3D14]/80">
            {notifications.length === 0
              ? "Order updates, reviews, and alerts will appear here"
              : `${unreadCount} unread · ${notifications.length} total`}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Notification system is not connected to the database yet. When a
        Notification model and API are added, real-time order, stock, and review
        alerts will show here.
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Bell className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No notifications</p>
          <p className="mt-1 max-w-sm text-center text-sm text-[#8E3D14]/70">
            You&apos;ll be notified about new orders, low stock, customer
            reviews, and payouts.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            return (
              <li
                key={n.id}
                className={`flex gap-3 rounded-xl border p-4 transition ${
                  n.read
                    ? "border-[#E7DCC4] bg-white"
                    : "border-[#C05620]/30 bg-[#C05620]/5"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    n.read ? "bg-[#F0E6D2] text-[#8E3D14]" : "bg-[#C05620]/15 text-[#C05620]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[#2B2420]">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C05620]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-[#3A342C]">{n.message}</p>
                  <p className="mt-1 text-xs text-[#8E3D14]/60">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}