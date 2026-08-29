"use client";

import { useState } from "react";
import { submitSellerRequest } from "@/actions/seller-requests";
import { Store, Clock, AlertCircle, CheckCircle2, RefreshCw, Send } from "lucide-react";

interface SellerRequestData {
    id: string;
    storeName: string;
    phone?: string | null;
    description?: string | null;
    status: string;
    adminNote?: string | null;
    createdAt: Date | string;
}

interface Props {
    userRole: string;
    initialPhone?: string | null;
    existingRequest?: SellerRequestData | null;
}

export default function BecomeSellerSection({
    userRole,
    initialPhone = "",
    existingRequest = null,
}: Props) {
    const [isReapplying, setIsReapplying] = useState(false);
    const [storeName, setStoreName] = useState(existingRequest?.storeName || "");
    const [phone, setPhone] = useState(initialPhone || existingRequest?.phone || "");
    const [description, setDescription] = useState(existingRequest?.description || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // If user is already a seller
    if (userRole === "seller") {
        return (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">Seller Account Active</h2>
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Seller
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Your seller account is approved and ready. You can list products and manage your inventory.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If user has a pending request
    if (existingRequest && existingRequest.status === "PENDING" && !isReapplying) {
        return (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 shrink-0">
                        <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Seller Request Under Review</h2>
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                Pending Approval
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            We received your seller application. An administrator is reviewing your store details and will update your status soon.
                        </p>
                        <div className="bg-white/80 rounded-xl p-3 border border-amber-200/60 text-xs space-y-1 text-gray-700">
                            <p><strong>Proposed Store Name:</strong> {existingRequest.storeName}</p>
                            {existingRequest.phone && <p><strong>Contact Phone:</strong> {existingRequest.phone}</p>}
                            {existingRequest.description && <p><strong>Description:</strong> {existingRequest.description}</p>}
                            <p className="text-gray-400 pt-1">
                                Submitted on {new Date(existingRequest.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If previous request was rejected
    if (existingRequest && existingRequest.status === "REJECTED" && !isReapplying) {
        return (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-600 shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-3 flex-1">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Seller Request Not Approved</h2>
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                    Rejected
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Unfortunately, your previous seller request was not approved.
                            </p>
                        </div>

                        {existingRequest.adminNote && (
                            <div className="bg-white/80 rounded-xl p-3 border border-red-200/60 text-xs text-red-900">
                                <strong>Admin Note:</strong> {existingRequest.adminNote}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsReapplying(true)}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-apply with updated details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // "Become a Seller" Form
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        const res = await submitSellerRequest({
            storeName,
            phone,
            description,
        });

        setLoading(false);

        if (res.error) {
            setError(res.error);
            return;
        }

        setSuccessMsg("Your request to become a seller has been submitted successfully!");
        setIsReapplying(false);
    }

    return (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-700">
                    <Store className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Become a Seller on EasyBuy</h2>
                    <p className="text-xs text-gray-500">
                        Start selling your products to thousands of buyers on our marketplace.
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. Trendy Crafts & Apparel"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Contact Phone Number
                        </label>
                        <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Store / Product Description (Optional)
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Tell us what types of products you plan to sell and why you'd like to join EasyBuy..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-3 pt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-[#C05620] hover:bg-[#A84515] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting Request...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Seller Request
                            </>
                        )}
                    </button>

                    {isReapplying && (
                        <button
                            type="button"
                            onClick={() => setIsReapplying(false)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
