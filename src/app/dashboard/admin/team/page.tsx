import { requireRole } from "@/lib/session";
import { UserCog } from "lucide-react";

export default async function AdminTeamPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Team & Roles
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Manage admin team members and permissions
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Multi-admin roles (support, moderator, super-admin) are not set up yet.
        Currently only the single <strong>admin</strong> role is used.
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
        <UserCog className="mb-3 h-10 w-10 text-[#E7DCC4]" />
        <p className="text-sm font-medium text-[#2B2420]">Team management coming soon</p>
        <p className="mt-1 max-w-sm text-center text-sm text-[#8E3D14]/70">
          Invite staff, assign roles, and control access from this page later.
        </p>
      </div>
    </div>
  );
}