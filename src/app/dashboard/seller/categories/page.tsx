import { headers } from "next/headers";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Tags, Package, Plus } from "lucide-react";

type Product = {
  id: number;
  name: string;
  category: string;
  stock: number;
  images: string[];
  hasVariants: boolean;
  variants?: { stock: number }[];
};

type CategoryRow = {
  name: string;
  productCount: number;
  totalStock: number;
  products: { id: number; name: string; images: string[] }[];
};

async function getSellerProducts(): Promise<Product[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as any).session?.token as string | undefined;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch products for categories:", await res.text());
    return [];
  }

  return res.json();
}

function groupByCategory(products: Product[]): CategoryRow[] {
  const map = new Map<string, CategoryRow>();

  for (const p of products) {
    const name = p.category?.trim() || "Uncategorized";
    const stock = p.hasVariants
      ? (p.variants ?? []).reduce((s, v) => s + v.stock, 0)
      : p.stock;

    if (!map.has(name)) {
      map.set(name, {
        name,
        productCount: 0,
        totalStock: 0,
        products: [],
      });
    }

    const row = map.get(name)!;
    row.productCount += 1;
    row.totalStock += stock;
    if (row.products.length < 4) {
      row.products.push({
        id: p.id,
        name: p.name,
        images: p.images ?? [],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export default async function SellerCategoriesPage() {
  await requireRole("seller");
  const products = await getSellerProducts();
  const categories = groupByCategory(products);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
            Categories
          </h1>
          <p className="mt-1 text-sm text-[#8E3D14]/80">
            Categories used by your products · {categories.length} total
          </p>
        </div>
        <Link
          href="/dashboard/seller/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#2B2420] px-4 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C]"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Info note */}
      <div className="rounded-lg border border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3 text-sm text-[#3A342C]">
        Categories are managed through products. When you add or edit a product,
        set its category — it will show up here automatically.
      </div>

      {/* Empty state */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Tags className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No categories yet</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            Add products with categories to see them here
          </p>
          <Link
            href="/dashboard/seller/products/new"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2B2420] px-4 py-2 text-sm font-medium text-[#F7F2E7]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="rounded-xl border border-[#E7DCC4] bg-white p-5 transition hover:border-[#C05620]/40"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0E6D2]">
                    <Tags className="h-4 w-4 text-[#C05620]" />
                  </div>
                  <div>
                    <h2 className="font-medium text-[#2B2420]">{cat.name}</h2>
                    <p className="text-xs text-[#8E3D14]/70">
                      {cat.productCount} product
                      {cat.productCount !== 1 ? "s" : ""} · {cat.totalStock}{" "}
                      in stock
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview thumbnails */}
              {cat.products.length > 0 && (
                <div className="mb-4 flex -space-x-2">
                  {cat.products.map((p) => (
                    <div
                      key={p.id}
                      className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-[#E7DCC4]"
                      title={p.name}
                    >
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-[#8E3D14]/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link
                href={`/dashboard/seller/products?category=${encodeURIComponent(cat.name)}`}
                className="text-sm font-medium text-[#C05620] hover:underline"
              >
                View products →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}