import {
  Users,
  ShoppingBag,
  Store,
  DollarSign,
} from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "0",
    icon: Users,
  },
  {
    title: "Total Products",
    value: "0",
    icon: ShoppingBag,
  },
  {
    title: "Total Sellers",
    value: "0",
    icon: Store,
  },
  {
    title: "Total Sales",
    value: "৳0",
    icon: DollarSign,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage EasyBuy users, sellers, products and orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.title}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Welcome to EasyBuy Admin
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            From here you can manage seller requests, users,
            products and marketplace activity.
          </p>
        </div>
      </div>
    </div>
  )
}