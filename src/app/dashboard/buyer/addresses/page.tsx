import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
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
  const res = await serverApiFetch("/api/addresses");
  if (!res) return [];

  if (!res.ok) {
    console.error("Failed to fetch addresses:", await res.text());
    return [];
  }

  return res.json();
}

export const metadata: Metadata = {
  title: "Saved Addresses",
};

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