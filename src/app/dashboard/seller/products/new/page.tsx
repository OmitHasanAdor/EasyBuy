import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireRole } from "@/lib/session"
import AddProductForm from "./AddProductForm"


export default async function AddNewProductPage() {
  await requireRole("seller")

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const token = session.session?.token

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
          Add New Product
        </h1>

        <p className="mt-1 text-sm text-[#8E3D14]/80">
          Add a new product to your store.
        </p>
      </div>

      <AddProductForm token={token} />
    </div>
  )
}