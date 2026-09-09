import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Boxes, AlertTriangle } from "lucide-react";
import { StockEditor } from "./StockEditor";

type Variant = {
  id: number;
  size: string | null;
  color: string | null;
  stock: number;
  price: number | null;
};

type InventoryProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  hasVariants: boolean;
  variants: Variant[];
};

async function getInventory(): Promise<InventoryProduct[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const token = (session as any).session?.token as string | undefined;
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/inventory`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch inventory:", await res.text());
    return [];
  }

  return res.json();
}

export default async function SellerInventoryPage() {
  await requireRole("seller");
  const products = await getInventory();

  const lowStockCount = products.reduce((count, p) => {
    if (p.hasVariants) {
      return count + p.variants.filter((v) => v.stock < 5).length;
    }
    return count + (p.stock < 5 ? 1 : 0);
  }, 0);

  const outOfStockCount = products.reduce((count, p) => {
    if (p.hasVariants) {
      return count + p.variants.filter((v) => v.stock === 0).length;
    }
    return count + (p.stock === 0 ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Manage stock for your products and variants
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7DCC4] bg-white p-4">
          <p className="text-sm text-[#8E3D14]/80">Total Products</p>
          <p className="mt-1 text-2xl font-semibold text-[#2B2420]">
            {products.length}
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-orange-700">Low Stock (&lt; 5)</p>
          <p className="mt-1 text-2xl font-semibold text-orange-800">
            {lowStockCount}
          </p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">Out of Stock</p>
          <p className="mt-1 text-2xl font-semibold text-red-800">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Inventory List */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Boxes className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No products yet</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            Add products to manage inventory
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-[#E7DCC4] bg-white overflow-hidden"
            >
              {/* Product header */}
              <div className="flex items-center gap-4 border-b border-[#E7DCC4] bg-[#F7F2E7] px-4 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#E7DCC4]">
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#2B2420]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#8E3D14]/70">
                    {product.category} · ৳{product.price.toLocaleString()}
                    {product.hasVariants
                      ? ` · ${product.variants.length} variants`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Stock rows */}
              <div className="divide-y divide-[#E7DCC4]">
                {!product.hasVariants ? (
                  /* Simple product stock */
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#3A342C]">Main stock</span>
                      <StockBadge stock={product.stock} />
                    </div>
                    <StockEditor
                      type="product"
                      id={product.id}
                      currentStock={product.stock}
                    />
                  </div>
                ) : (
                  /* Variant stocks */
                  product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[#3A342C]">
                          {[variant.size, variant.color]
                            .filter(Boolean)
                            .join(" / ") || "Default"}
                        </span>
                        <StockBadge stock={variant.stock} />
                        {variant.price != null && (
                          <span className="text-xs text-[#8E3D14]/60">
                            ৳{variant.price}
                          </span>
                        )}
                      </div>
                      <StockEditor
                        type="variant"
                        id={variant.id}
                        currentStock={variant.stock}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
        <AlertTriangle className="h-3 w-3" />
        Out of stock
      </span>
    );
  }
  if (stock < 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
        <AlertTriangle className="h-3 w-3" />
        Low ({stock})
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      {stock} in stock
    </span>
  );
}