"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { authFetch } from "@/lib/auth-fetch";
import { authClient } from "@/lib/auth-client";
import { API_URL } from "@/config/api";

type Address = {
    id: number;
    label: string | null;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postalCode: string | null;
    isDefault: boolean;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalCount } = useCart();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "SSLCOMMERZ">("COD");

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [placing, setPlacing] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    useEffect(() => {
        if (sessionLoading) return;

        if (!session?.user) {
            router.replace("/login?callbackUrl=/checkout");
            return;
        }

        if (items.length === 0) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await authFetch(`${API_URL}/api/addresses`);
                if (!res.ok) throw new Error("Failed to load addresses");
                const data: Address[] = await res.json();
                if (cancelled) return;
                setAddresses(data);
                const def = data.find((a) => a.isDefault) ?? data[0];
                if (def) setSelectedAddressId(def.id);
            } catch {
                if (!cancelled) toast.error("Could not load addresses");
            } finally {
                if (!cancelled) setLoadingAddresses(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [session, sessionLoading, items.length, router]);

    async function placeOrder() {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }

        setPlacing(true);
        try {
            const res = await authFetch(`${API_URL}/api/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentMethod,
                    addressId: selectedAddressId,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                toast.error(data.error || "Failed to place order");
                return;
            }

            // SSLCommerz → external redirect (window.location OK)
            if (data.type === "redirect" && data.url) {
                toast.success("Redirecting to payment...");
                window.location.href = data.url;
                return;
            }

            // COD
            toast.success(data.message || "Order placed successfully");
            router.push(`/checkout/success?orderId=${data.orderId}`);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setPlacing(false);
        }
    }

    if (sessionLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center bg-[#FBF8F1]">
                <Loader2 className="h-6 w-6 animate-spin text-[#C05620]" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <section className="bg-[#FBF8F1] px-6 py-16">
                <div className="mx-auto max-w-lg text-center">
                    <p className="text-sm text-neutral-500">Your cart is empty.</p>
                    <Link
                        href="/products"
                        className="mt-4 inline-block rounded-sm bg-[#2B2420] px-6 py-3 text-sm font-semibold text-[#F7F2E7]"
                    >
                        Browse Products
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-[#FBF8F1] px-6 py-12 sm:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-8 font-serif text-3xl font-medium text-[#2B2420]">
                    Checkout
                </h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left: address + payment */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Address */}
                        <div className="rounded-lg border border-[#E7DCC4] bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-serif text-lg text-[#2B2420]">
                                    Delivery Address
                                </h2>
                                <Link
                                    href="/dashboard/buyer/addresses"
                                    className="text-sm text-[#C05620] hover:underline"
                                >
                                    Manage addresses
                                </Link>
                            </div>

                            {loadingAddresses ? (
                                <p className="text-sm text-neutral-500">Loading addresses...</p>
                            ) : addresses.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-[#E7DCC4] py-8 text-center">
                                    <MapPin className="mx-auto mb-2 h-8 w-8 text-[#E7DCC4]" />
                                    <p className="text-sm text-neutral-500">No saved address</p>
                                    <Link
                                        href="/dashboard/buyer/addresses"
                                        className="mt-3 inline-block text-sm font-medium text-[#C05620] hover:underline"
                                    >
                                        Add an address first →
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {addresses.map((addr) => (
                                        <li key={addr.id}>
                                            <label
                                                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${selectedAddressId === addr.id
                                                    ? "border-[#2B2420] bg-[#FBF8F1]"
                                                    : "border-[#E7DCC4] hover:border-[#C05620]/40"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-[#2B2420]">
                                                        {addr.fullName}
                                                        {addr.label && (
                                                            <span className="ml-2 text-xs text-[#C05620]">
                                                                {addr.label}
                                                            </span>
                                                        )}
                                                        {addr.isDefault && (
                                                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                                                Default
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">{addr.phone}</p>
                                                    <p className="mt-1 text-sm text-[#3A342C]">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                                    </p>
                                                    <p className="text-sm text-[#3A342C]">
                                                        {addr.city}
                                                        {addr.postalCode ? ` — ${addr.postalCode}` : ""}
                                                    </p>
                                                </div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Payment method */}
                        <div className="rounded-lg border border-[#E7DCC4] bg-white p-6">
                            <h2 className="mb-4 font-serif text-lg text-[#2B2420]">
                                Payment Method
                            </h2>

                            <div className="space-y-3">
                                <label
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${paymentMethod === "COD"
                                        ? "border-[#2B2420] bg-[#FBF8F1]"
                                        : "border-[#E7DCC4] hover:border-[#C05620]/40"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-[#2B2420]">
                                            Cash on Delivery (COD)
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Pay when you receive the order
                                        </p>
                                    </div>
                                </label>

                                <label
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${paymentMethod === "SSLCOMMERZ"
                                        ? "border-[#2B2420] bg-[#FBF8F1]"
                                        : "border-[#E7DCC4] hover:border-[#C05620]/40"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === "SSLCOMMERZ"}
                                        onChange={() => setPaymentMethod("SSLCOMMERZ")}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-[#2B2420]">
                                            Online Payment
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            bKash, Nagad, Card via SSLCommerz
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right: summary */}
                    <div className="h-fit rounded-lg border border-[#E7DCC4] bg-white p-6">
                        <h2 className="mb-4 font-serif text-lg text-[#2B2420]">
                            Order Summary
                        </h2>

                        <ul className="mb-4 max-h-48 space-y-3 overflow-y-auto">
                            {items.map((item) => (
                                <li key={`${item.id}-${item.variantId}`} className="flex gap-3">
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-[#F2EADA]">
                                        {item.imageUrl && (
                                            <Image
                                                src={item.imageUrl}
                                                alt=""
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-[#2B2420]">{item.name}</p>
                                        <p className="text-xs text-neutral-500">
                                            ×{item.qty} · ৳{(item.price * item.qty).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between text-sm text-neutral-600">
                            <span>Subtotal ({totalCount} items)</span>
                            <span>৳{subtotal.toLocaleString()}</span>
                        </div>

                        <div className="my-4 h-px bg-[#E7DCC4]" />

                        <div className="flex justify-between font-serif text-lg text-[#2B2420]">
                            <span>Total</span>
                            <span>৳{subtotal.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={placeOrder}
                            disabled={placing || !selectedAddressId || addresses.length === 0}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-[#2B2420] py-3.5 text-sm font-semibold text-[#F7F2E7] transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                            {placing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {paymentMethod === "SSLCOMMERZ" ? "Pay Online" : "Place Order (COD)"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}