import { headers } from "next/headers";
import Link from "next/link";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Plus, Package, Pencil } from "lucide-react";
import { DeleteProductButton } from "./DeleteProductButton";


type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  hasVariants: boolean;
  isBestSeller: boolean;
  discountPercent: number | null;
  createdAt: string;
  variants: { id: number; size: string | null; color: string | null; stock: number }[];
  _count: { orderItems: number; reviews: number };
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
    console.error("Failed to fetch seller products:", await res.text());
    return [];
  }

  return res.json();
}

export default async function SellerProductsPage() {
  await requireRole("seller");
  const products = await getSellerProducts();

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
            My Products
          </h1>
          <p className="mt-1 text-sm text-[#8E3D14]/80">
            {products.length} product{products.length !== 1 ? "s" : ""} in your store
          </p>
        </div>
        <Link
          href="/dashboard/seller/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#2B2420] px-4 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C]"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </Link>
      </div>

      {/* Products Table / Empty State */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Package className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No products yet</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            Start by adding your first product
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
        <div className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7DCC4] bg-[#F7F2E7]">
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Product</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Category</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Price</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Stock</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Orders</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Status</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = product.hasVariants
                    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                    : product.stock;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#E7DCC4] last:border-0 hover:bg-[#FBF8F1]"
                    >
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-[#E7DCC4]">
                            {product.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#2B2420]">
                              {product.name}
                            </p>
                            {product.isBestSeller && (
                              <span className="text-[10px] font-semibold text-[#C05620]">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-[#3A342C]">
                        {product.category}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-medium text-[#2B2420]">
                        ৳{product.price.toLocaleString()}
                        {product.discountPercent ? (
                          <span className="ml-1 text-xs text-green-600">
                            -{product.discountPercent}%
                          </span>
                        ) : null}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span
                          className={
                            totalStock === 0
                              ? "font-medium text-red-600"
                              : totalStock < 5
                              ? "font-medium text-orange-600"
                              : "text-[#3A342C]"
                          }
                        >
                          {totalStock}
                        </span>
                        {product.hasVariants && (
                          <span className="ml-1 text-xs text-[#8E3D14]/60">
                            ({product.variants.length} variants)
                          </span>
                        )}
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-3 text-[#3A342C]">
                        {product._count.orderItems}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {totalStock === 0 ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            Out of Stock
                          </span>
                        ) : totalStock < 5 ? (
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/seller/products/${product.id}/edit`}
                            className="rounded-md p-1.5 text-[#3A342C] transition hover:bg-[#F0E6D2]"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <DeleteProductButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}