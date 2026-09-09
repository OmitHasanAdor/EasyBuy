import { headers } from "next/headers"
import { requireRole } from "@/lib/session"
import { auth } from "@/lib/auth"
import {
  Package,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

type Product = {
  id: number
  name: string
  price: number
  stock: number
  category: string
}

type RecentOrder = {
  id: number
  status: string
  total: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: {
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

type DashboardData = {
  summary: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    lowStockCount: number
  }
  recentProducts: Product[]
  recentOrders: RecentOrder[]
}

async function getSellerDashboard(): Promise<DashboardData | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return null

  const token = (session as any).session?.token as string | undefined

  if (!token) return null

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/seller/dashboard`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  )

  if (!res.ok) {
    console.error("Failed to fetch seller dashboard:", await res.text())
    return null
  }

  return res.json()
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date))
}

function getStatusClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700"
    case "SHIPPED":
      return "bg-blue-100 text-blue-700"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700"
    case "CANCELLED":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default async function SellerOverviewPage() {
  await requireRole("seller")

  const data = await getSellerDashboard()

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Seller Overview</h1>
        <p className="mt-2 text-gray-500">
          Failed to load seller dashboard data.
        </p>
      </div>
    )
  }

  const { summary, recentProducts, recentOrders } = data

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Seller Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your store and track your sales performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Products */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h2 className="mt-2 text-2xl font-bold">
                {summary.totalProducts}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <Link
            href="/dashboard/seller/products"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Orders */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h2 className="mt-2 text-2xl font-bold">
                {summary.totalOrders}
              </h2>
            </div>

            <div className="rounded-lg bg-purple-50 p-3">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          <Link
            href="/dashboard/seller/orders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline"
          >
            View orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h2 className="mt-2 text-2xl font-bold">
                ৳{summary.totalRevenue.toLocaleString()}
              </h2>
            </div>

            <div className="rounded-lg bg-green-50 p-3">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <Link
            href="/dashboard/seller/earnings"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
          >
            View earnings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Low Stock */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <h2 className="mt-2 text-2xl font-bold">
                {summary.lowStockCount}
              </h2>
            </div>

            <div className="rounded-lg bg-orange-50 p-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </div>

          <Link
            href="/dashboard/seller/inventory"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline"
          >
            Check inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Recent Products + Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">Recent Products</h2>
              <p className="text-sm text-gray-500">
                Your latest added products
              </p>
            </div>

            <Link
              href="/dashboard/seller/products"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {recentProducts.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                No products found.
              </p>
            ) : (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.category}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ৳{product.price.toLocaleString()}
                    </p>

                    <p
                      className={`mt-1 text-sm ${
                        product.stock < 5
                          ? "text-orange-600"
                          : "text-gray-500"
                      }`}
                    >
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">Recent Orders</h2>
              <p className="text-sm text-gray-500">
                Your latest customer orders
              </p>
            </div>

            <Link
              href="/dashboard/seller/orders"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                No orders found.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium">
                        Order #{order.id}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {order.user.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>

                    <p className="font-semibold">
                      ৳{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}