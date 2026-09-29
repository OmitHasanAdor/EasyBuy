import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import EditProductForm, { type EditableProduct } from "./EditProductForm";

export const metadata: Metadata = {
  title: "Edit Product",
};

async function getProduct(id: string): Promise<EditableProduct | null> {
  if (!/^\d+$/.test(id)) return null;

  const res = await serverApiFetch(`/api/seller/products/${id}`);
  if (!res || res.status === 404 || res.status === 400) return null;
  if (!res.ok) {
    throw new Error(`Failed to load product ${id}: ${res.status}`);
  }
  return res.json();
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("seller");
  const { id } = await params;

  // 404 for ids that don't exist or belong to another seller
  const product = await getProduct(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <Link
          href="/dashboard/seller/products"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#8E3D14]/80 hover:text-[#C05620]"
        >
          <ArrowLeft className="h-4 w-4" />
          My Products
        </Link>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Update the listing details of &ldquo;{product.name}&rdquo;. Stock is
          managed from the Inventory page.
        </p>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}
