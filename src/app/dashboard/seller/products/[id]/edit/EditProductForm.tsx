"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config/api";
import { authFetch } from "@/lib/auth-fetch";
import { MAX_DISCOUNT_PERCENT } from "@/lib/pricing";

export type EditableProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  discountPercent: number | null;
  saleEndsAt: string | null;
};

// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm"
function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

const inputClass =
  "w-full rounded-md border border-[#E7DCC4] px-3 py-2.5 text-sm outline-none focus:border-[#8E3D14]";
const labelClass = "mb-2 block text-sm font-medium text-[#2B2420]";

export default function EditProductForm({ product }: { product: EditableProduct }) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [category, setCategory] = useState(product.category);
  const [image, setImage] = useState(product.images[0] ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    product.discountPercent != null ? String(product.discountPercent) : ""
  );
  const [saleEndsAt, setSaleEndsAt] = useState(() => toDateTimeLocal(product.saleEndsAt));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !category.trim()) {
      setError("Name, description and category are required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    const discount = discountPercent === "" ? null : Number(discountPercent);
    if (
      discount !== null &&
      (!Number.isInteger(discount) || discount < 0 || discount > MAX_DISCOUNT_PERCENT)
    ) {
      setError(`Discount must be a whole number between 0 and ${MAX_DISCOUNT_PERCENT}%`);
      return;
    }

    // keep any extra photos, only the cover image is editable here
    const otherImages = product.images.slice(1);

    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/api/seller/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          category: category.trim(),
          images: image.trim() ? [image.trim(), ...otherImages] : otherImages,
          discountPercent: discount,
          saleEndsAt: saleEndsAt ? new Date(saleEndsAt).toISOString() : null,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(result.details?.[0]?.message || result.error || "Failed to update product");
        return;
      }

      router.push("/dashboard/seller/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">Basic Information</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="edit-name" className={labelClass}>Product Name</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="edit-description" className={labelClass}>Description</label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="edit-price" className={labelClass}>Price</label>
              <input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="edit-category" className={labelClass}>Category</label>
              <input
                id="edit-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-image" className={labelClass}>Cover Image URL</label>
            <input
              id="edit-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/product.jpg"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DCC4] bg-white p-6">
        <h2 className="font-serif text-lg font-medium text-[#2B2420]">Promotion</h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="edit-discount" className={labelClass}>Discount Percentage</label>
            <input
              id="edit-discount"
              type="number"
              min="0"
              max={MAX_DISCOUNT_PERCENT}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder={`0 - ${MAX_DISCOUNT_PERCENT}`}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="edit-sale-ends" className={labelClass}>Sale Ends At</label>
            <input
              id="edit-sale-ends"
              type="datetime-local"
              value={saleEndsAt}
              onChange={(e) => setSaleEndsAt(e.target.value)}
              // the server renders this in its own time zone
              suppressHydrationWarning
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
          disabled={saving}
          className="rounded-md bg-[#2B2420] px-5 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
