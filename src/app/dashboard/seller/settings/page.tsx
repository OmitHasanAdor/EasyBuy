import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { StoreSettingsForm } from "./StoreSettingsForm";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
  storeName: string | null;
  storeDescription: string | null;
};

async function getProfile(): Promise<Profile | null> {
  const res = await serverApiFetch("/api/seller/profile");
  if (!res) return null;

  if (!res.ok) {
    console.error("Failed to fetch profile:", await res.text());
    return null;
  }

  return res.json();
}

export const metadata: Metadata = {
  title: "Store Settings",
};

export default async function SellerSettingsPage() {
  await requireRole("seller");
  const profile = await getProfile();

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-sm text-[#8E3D14]/80">
          Could not load store settings. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Store Settings
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Manage your store information and contact details
        </p>
      </div>

      <StoreSettingsForm profile={profile} />
    </div>
  );
}