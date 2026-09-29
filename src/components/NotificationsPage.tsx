"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Loader2 } from "lucide-react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/notifications-api";

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setItems(data.notifications);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#8E3D14]/80">
            Orders and payment updates
          </p>
        </div>
        {items.some((n) => !n.read) && (
          <button
            type="button"
            onClick={async () => {
              await markAllNotificationsRead();
              load();
            }}
            className="text-sm font-medium text-[#C05620] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Bell className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm text-[#2B2420]">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.link || "#"}
                onClick={() => {
                  if (!n.read) markNotificationRead(n.id);
                }}
                className={`block rounded-xl border border-[#E7DCC4] p-4 transition hover:border-[#C05620]/40 ${
                  n.read ? "bg-white" : "bg-[#FBF8F1]"
                }`}
              >
                <p className="text-sm font-semibold text-[#2B2420]">{n.title}</p>
                <p className="mt-0.5 text-sm text-neutral-600">{n.body}</p>
                <p className="mt-2 text-[11px] text-neutral-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}