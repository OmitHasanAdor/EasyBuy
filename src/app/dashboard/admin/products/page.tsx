import { headers } from "next/headers";
import { requireRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { Package } from "lucide-react";
import { DeleteProductButton } from "./DeleteProductButton";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: string;
  seller: { id: string; name: string; email: string } | null;
  _count: { orderItems: number; reviews: number };
};

async function getProducts(): Promise<Product[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];
  const token = (session as { session?: { token?: string } })?.session?.token;
  if (!token) return [];

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminProductsPage() {
  await requireRole("admin");
  const products = await getProducts();

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Product Moderation
        </h1>
        <p className="mt-1 text-sm text-[#8E3D14]/80">
          {products.length} product{products.length !== 1 ? "s" : ""} on platform
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <Package className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No products</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E7DCC4] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7DCC4] bg-[#F7F2E7]">
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Product</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Seller</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Category</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Price</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Stock</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420]">Orders</th>
                  <th className="px-4 py-3 font-medium text-[#2B2420] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[#E7DCC4] last:border-0 hover:bg-[#FBF8F1]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-[#E7DCC4]">
                          {p.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-[#2B2420]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">
                      {p.seller?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#3A342C]">{p.category}</td>
                    <td className="px-4 py-3 text-[#2B2420]">৳{p.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{p.stock}</td>
                    <td className="px-4 py-3 text-[#3A342C]">{p._count.orderItems}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteProductButton productId={p.id} name={p.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}