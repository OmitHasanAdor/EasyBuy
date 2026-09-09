"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

type Variant = {
  size: string
  color: string
  stock: string
  price: string
}

type Props = {
  token: string
}

export default function AddProductForm({ token }: Props) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState("0")

  const [hasVariants, setHasVariants] = useState(false)

  const [discountPercent, setDiscountPercent] = useState("")
  const [saleEndsAt, setSaleEndsAt] = useState("")

  const [isBestSeller, setIsBestSeller] = useState(false)

  const [variants, setVariants] = useState<Variant[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function addVariant() {
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        stock: "0",
        price: "",
      },
    ])
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index))
  }

  function updateVariant(
    index: number,
    field: keyof Variant,
    value: string
  ) {
    const updatedVariants = [...variants]

    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    }

    setVariants(updatedVariants)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Product name is required")
      return
    }

    if (!description.trim()) {
      setError("Description is required")
      return
    }

    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0")
      return
    }

    if (!category.trim()) {
      setError("Category is required")
      return
    }

    if (!hasVariants && Number(stock) < 0) {
      setError("Stock cannot be negative")
      return
    }

    setLoading(true)

    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),

        images: image.trim() ? [image.trim()] : [],

        stock: hasVariants ? 0 : Number(stock),

        hasVariants,

        discountPercent:
          discountPercent === ""
            ? null
            : Number(discountPercent),

        saleEndsAt: saleEndsAt
          ? new Date(saleEndsAt).toISOString()
          : null,

        isBestSeller,

        variants: hasVariants
          ? variants.map((variant) => ({
              size: variant.size.trim() || null,
              color: variant.color.trim() || null,
              stock: Number(variant.stock),
              price:
                variant.price === ""
                  ? null
                  : Number(variant.price),
            }))
          : [],
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      )

      const result = await res.json()

      if (!res.ok) {
        if (result.details?.length > 0) {
          setError(result.details[0].message)
        } else {
          setError(result.error || "Failed to create product")
        }

        return
      }

      setSuccess("Product created successfully!")

      setTimeout(() => {
        router.push("/dashboard/seller/products")
        router.refresh()
      }, 800)
    } catch (error) {
      console.error("Create product error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl space-y-6"
    >
      {/* Basic Information */}
      <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">
          Basic Information
        </h2>

        <div className="mt-5 space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B2420]">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B2420]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product"
              rows={5}
              className="w-full resize-none rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
            />
          </div>

          {/* Price + Category */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#2B2420]">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#2B2420]">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Clothing"
                className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B2420]">
              Image URL
            </label>

            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/product.jpg"
              className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
            />

            <p className="mt-1 text-xs text-[#8E3D14]/60">
              Add a direct image URL.
            </p>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">
          Inventory
        </h2>

        <div className="mt-5">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked)

                if (!e.target.checked) {
                  setVariants([])
                }
              }}
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-[#2B2420]">
              This product has variants
            </span>
          </label>

          {!hasVariants ? (
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-[#2B2420]">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#2B2420]">
                  Product Variants
                </h3>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-2 rounded-md border border-[#E7DCC4] px-3 py-2 text-sm font-medium text-[#2B2420] hover:bg-[#F7F2E7]"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </button>
              </div>

              {variants.length === 0 && (
                <div className="rounded-md border border-dashed border-[#E7DCC4] p-6 text-center">
                  <p className="text-sm text-[#8E3D14]/70">
                    No variants added yet.
                  </p>
                </div>
              )}

              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#E7DCC4] bg-[#FBF8F1] p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Size */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#2B2420]">
                        Size
                      </label>

                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                        placeholder="e.g. M"
                        className="w-full rounded-md border border-[#E7DCC4] bg-white px-3 py-2 text-sm outline-none focus:border-[#8E3D14]"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#2B2420]">
                        Color
                      </label>

                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "color",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Black"
                        className="w-full rounded-md border border-[#E7DCC4] bg-white px-3 py-2 text-sm outline-none focus:border-[#8E3D14]"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#2B2420]">
                        Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "stock",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-[#E7DCC4] bg-white px-3 py-2 text-sm outline-none focus:border-[#8E3D14]"
                      />
                    </div>

                    {/* Variant Price */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#2B2420]">
                        Variant Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "price",
                            e.target.value
                          )
                        }
                        placeholder="Optional"
                        className="w-full rounded-md border border-[#E7DCC4] bg-white px-3 py-2 text-sm outline-none focus:border-[#8E3D14]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove variant
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promotion */}
      <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">
          Promotion
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Discount */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B2420]">
              Discount Percentage
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) =>
                setDiscountPercent(e.target.value)
              }
              placeholder="0 - 100"
              className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
            />
          </div>

          {/* Sale Ends */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B2420]">
              Sale Ends At
            </label>

            <input
              type="datetime-local"
              value={saleEndsAt}
              onChange={(e) => setSaleEndsAt(e.target.value)}
              className="w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]"
            />
          </div>
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            className="h-4 w-4"
          />

          <span className="text-sm font-medium text-[#2B2420]">
            Mark as Best Seller
          </span>
        </label>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-[#E7DCC4] px-5 py-2.5 text-sm font-medium text-[#2B2420] hover:bg-[#F7F2E7]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#2B2420] px-5 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Product..." : "Create Product"}
        </button>
      </div>
    </form>
  )
}