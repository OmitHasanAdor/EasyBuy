import { requireRole } from "@/lib/session";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Platform configuration and preferences
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Global settings (site name, commission rate, shipping rules, maintenance
        mode) will be editable here after a Settings model is added.
      </div>

      <div className="max-w-xl space-y-4 rounded-xl border border-[#E7DCC4] bg-white p-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Site name
          </label>
          <input
            disabled
            defaultValue="EasyBuy"
            className="w-full rounded-md border border-[#E7DCC4] bg-[#F7F2E7] px-3 py-2.5 text-sm text-[#8E3D14]/70"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Support email
          </label>
          <input
            disabled
            defaultValue="support@easybuy.com"
            className="w-full rounded-md border border-[#E7DCC4] bg-[#F7F2E7] px-3 py-2.5 text-sm text-[#8E3D14]/70"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
            Platform commission (%)
          </label>
          <input
            disabled
            defaultValue="10"
            className="w-full rounded-md border border-[#E7DCC4] bg-[#F7F2E7] px-3 py-2.5 text-sm text-[#8E3D14]/70"
          />
        </div>
        <p className="flex items-center gap-2 text-xs text-[#8E3D14]/70">
          <Settings className="h-3.5 w-3.5" />
          Fields are read-only until settings API is connected
        </p>
      </div>
    </div>
  );
}