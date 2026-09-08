"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/auth-fetch";
import { API_URL } from "@/config/api";
import { Loader2, Check } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  storeName: string | null;
  storeDescription: string | null;
};

export function StoreSettingsForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [storeName, setStoreName] = useState(profile.storeName ?? "");
  const [storeDescription, setStoreDescription] = useState(
    profile.storeDescription ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await authFetch(`${API_URL}/api/seller/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || null,
          storeName: storeName.trim() || undefined,
          storeDescription: storeDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to save settings");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-xl border border-[#E7DCC4] bg-white p-6"
    >
      {/* Email (read-only) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
          Email
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          className="w-full rounded-md border border-[#E7DCC4] bg-[#F7F2E7] px-3 py-2.5 text-sm text-[#8E3D14]/70 outline-none"
        />
        <p className="mt-1 text-xs text-[#8E3D14]/60">Email cannot be changed</p>
      </div>

      {/* Display name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
          Your Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2.5 text-sm text-[#2B2420] outline-none focus:border-[#C05620]"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
          Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2.5 text-sm text-[#2B2420] outline-none focus:border-[#C05620]"
        />
      </div>

      {/* Store name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
          Store Name
        </label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Your store name"
          className="w-full rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2.5 text-sm text-[#2B2420] outline-none focus:border-[#C05620]"
        />
      </div>

      {/* Store description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#2B2420]">
          Store Description
        </label>
        <textarea
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          rows={4}
          placeholder="Tell customers about your store..."
          className="w-full resize-none rounded-md border border-[#E7DCC4] bg-[#FBF8F1] px-3 py-2.5 text-sm text-[#2B2420] outline-none focus:border-[#C05620]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-[#2B2420] px-5 py-2.5 text-sm font-medium text-[#F7F2E7] transition hover:bg-[#3A342C] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4" />
        ) : null}
        {saved ? "Saved" : "Save Changes"}
      </button>
    </form>
  );
}