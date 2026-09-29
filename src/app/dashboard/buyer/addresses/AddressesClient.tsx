"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { MapPin, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import type { Address } from "./page";

type FormState = {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

const emptyForm: FormState = {
  label: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  isDefault: false,
};

export function AddressesClient({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? "",
      city: addr.city,
      postalCode: addr.postalCode ?? "",
      isDefault: addr.isDefault,
    });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      label: form.label.trim() || null,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || null,
      city: form.city.trim(),
      postalCode: form.postalCode.trim() || null,
      isDefault: form.isDefault,
    };

    try {
      const url =
        editingId != null
          ? `${API_URL}/api/addresses/${editingId}`
          : `${API_URL}/api/addresses`;

      const res = await authFetch(url, {
        method: editingId != null ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save address");
        return;
      }

      setOpen(false);
      router.refresh();
      // Optimistic: refetch via refresh; also update local if create returned body
      const saved = await res.json().catch(() => null);
      if (saved && editingId == null) {
        setAddresses((prev) => [saved, ...prev]);
      } else if (saved && editingId != null) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? saved : a))
        );
      } else {
        window.location.reload();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this address?")) return;

    try {
      const res = await authFetch(`${API_URL}/api/addresses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Failed to delete");
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch {
      alert("Something went wrong");
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={openCreate}
        className="inline-flex items-center gap-2 rounded-md bg-[#2B2420] px-4 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C]"
      >
        <Plus className="h-4 w-4" />
        Add Address
      </button>

      {addresses.length === 0 && !open ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCC4] bg-white py-16">
          <MapPin className="mb-3 h-10 w-10 text-[#E7DCC4]" />
          <p className="text-sm font-medium text-[#2B2420]">No saved addresses</p>
          <p className="mt-1 text-sm text-[#8E3D14]/70">
            Add an address for faster checkout
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl border border-[#E7DCC4] bg-white p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  {addr.label && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#C05620]">
                      {addr.label}
                    </span>
                  )}
                  {addr.isDefault && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(addr)}
                    className="rounded-md p-1.5 text-[#3A342C] hover:bg-[#F0E6D2]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="font-medium text-[#2B2420]">{addr.fullName}</p>
              <p className="text-sm text-[#3A342C]">{addr.phone}</p>
              <p className="mt-1 text-sm text-[#3A342C]">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
              </p>
              <p className="text-sm text-[#3A342C]">
                {addr.city}
                {addr.postalCode ? ` — ${addr.postalCode}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#E7DCC4] bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-[#2B2420]">
                {editingId != null ? "Edit Address" : "Add Address"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-[#F0E6D2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                placeholder="Label (Home, Office)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
              />
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
              />
              <input
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
              />
              <input
                required
                placeholder="Address line 1"
                value={form.addressLine1}
                onChange={(e) =>
                  setForm({ ...form, addressLine1: e.target.value })
                }
                className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
              />
              <input
                placeholder="Address line 2 (optional)"
                value={form.addressLine2}
                onChange={(e) =>
                  setForm({ ...form, addressLine2: e.target.value })
                }
                className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
                />
                <input
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                  className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2 text-sm outline-none focus:border-[#C05620]"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#3A342C]">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                />
                Set as default address
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2B2420] px-4 py-2.5 text-sm font-medium text-[#F7F2E7] disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId != null ? "Update Address" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}