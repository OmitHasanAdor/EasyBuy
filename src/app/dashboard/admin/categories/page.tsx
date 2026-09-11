import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Tags } from "lucide-react";

type CategoryRow = {
  name: string;
  productCount: number;
  totalStock: number;
};

async function getCategories(): Promise<CategoryRow[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminCategoriesPage() {
  await requireRole("admin");
  const categories = await getCategories();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Categories
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Categories derived from products · {categories.length} total
        </p>
      </div>

      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        There is no separate Category model. Categories come from product
        fields. Sellers set them when adding products.
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Tags className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No categories</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-[#E7DCC4] bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0E6D2]">
                  <Tags className="h-4 w-4 text-[#C05620]" />
                </div>
                <div>
                  <p className="font-medium text-[#2B2420]">{c.name}</p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {c.productCount} product{c.productCount !== 1 ? "s" : ""} ·{" "}
                    {c.totalStock} in stock
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}