import { requireRole } from "@/lib/session";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          System alerts and admin updates
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Notification system is not connected to the database yet. New sellers,
        flagged products, and high-value orders will appear here later.
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
        <Bell className="mb-3 h-10 w-10 text-[#E7DCC4]" />
        <p className="text-sm font-medium text-[#2B2420]">No notifications</p>
        <p className="mt-1 max-w-sm text-center text-sm text-[#8E3D14]/70">
          Admin alerts for moderation, disputes, and system events will show
          here.
        </p>
      </div>
    </div>
  );
}