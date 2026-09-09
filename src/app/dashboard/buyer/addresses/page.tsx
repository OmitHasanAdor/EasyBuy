import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
// import { MapPin } from "lucide-react";
import { AddressesClient } from "./AddressesClient";

export type Address = {
  id: number;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string | null;
  isDefault: boolean;
};

async function getAddresses(): Promise<Address[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch addresses:", await res.text());
    return [];
  }

  return res.json();
}

export default async function BuyerAddressesPage() {
  await requireRole("buyer");
  const addresses = await getAddresses();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Saved Addresses
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Manage delivery addresses for faster checkout
        </p>
      </div>

      <AddressesClient initialAddresses={addresses} />
    </div>
  );
}