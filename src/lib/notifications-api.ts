import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export async function fetchNotifications() {
  const res = await authFetch(`${API_URL}/api/notifications`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed");
  return data as { notifications: NotificationItem[]; unreadCount: number };
}

export async function markNotificationRead(id: number) {
  await authFetch(`${API_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  await authFetch(`${API_URL}/api/notifications/read-all`, {
    method: "POST",
  });
}