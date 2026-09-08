import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return null;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/profile`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch profile:", await res.text());
    return null;
  }

  return res.json();
}

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