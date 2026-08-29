"use client";

import { useState, useTransition } from "react";
import { approveSellerRequest, rejectSellerRequest } from "@/actions/seller-requests";
import { Check, X, ShieldCheck, Clock, Store, Mail, Phone, FileText, AlertCircle } from "lucide-react";

export interface SellerRequestItem {
    id: string;
    userId: string;
    storeName: string;
    phone?: string | null;
    description?: string | null;
    status: string;
    adminNote?: string | null;
    createdAt: Date | string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

interface Props {
    requests: SellerRequestItem[];
}

export default function AdminSellerRequests({ requests: initialRequests }: Props) {
    const [requests, setRequests] = useState<SellerRequestItem[]>(initialRequests);
    const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [actionError, setActionError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredRequests = requests.filter((r) => {
        if (activeTab === "ALL") return true;
        return r.status === activeTab;
    });

    const pendingCount = requests.filter((r) => r.status === "PENDING").length;

    function handleApprove(requestId: string) {
        setActionError("");
        setProcessingId(requestId);

        startTransition(async () => {
            const res = await approveSellerRequest(requestId);
            setProcessingId(null);

            if (res.error) {
                setActionError(res.error);
                return;
            }

            // Update local state
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId
                        ? { ...r, status: "APPROVED", adminNote: null, user: { ...r.user, role: "seller" } }
                        : r
                )
            );
        });
    }

    function handleReject(requestId: string) {
        setActionError("");
        setProcessingId(requestId);

        startTransition(async () => {
            const res = await rejectSellerRequest(requestId, rejectNote);
            setProcessingId(null);
            setRejectingId(null);
            setRejectNote("");

            if (res.error) {
                setActionError(res.error);
                return;
            }

            // Update local state
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === requestId
                        ? { ...r, status: "REJECTED", adminNote: rejectNote || null }
                        : r
                )
            );
        });
    }

    return (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">Seller Approval Requests</h2>
                            {pendingCount > 0 && (
                                <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingCount} pending
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Review and approve or reject buyer requests to become marketplace sellers.
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-medium text-gray-600 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("PENDING")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            activeTab === "PENDING"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        Pending ({requests.filter((r) => r.status === "PENDING").length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("APPROVED")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            activeTab === "APPROVED"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("REJECTED")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            activeTab === "REJECTED"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        Rejected
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("ALL")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            activeTab === "ALL"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        All ({requests.length})
                    </button>
                </div>
            </div>

            {actionError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {actionError}
                </div>
            )}

            <div className="mt-5 space-y-4">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-medium text-gray-500">No {activeTab.toLowerCase()} requests found</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => {
                        const isProcessing = isPending && processingId === req.id;
                        const isRejectOpen = rejectingId === req.id;

                        return (
                            <div
                                key={req.id}
                                className="border border-gray-200/80 rounded-xl p-5 hover:border-gray-300 transition-colors bg-white"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 flex items-center gap-1.5 text-base">
                                                <Store className="w-4 h-4 text-amber-600" />
                                                {req.storeName}
                                            </span>

                                            {req.status === "PENDING" && (
                                                <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                                                    Pending Review
                                                </span>
                                            )}
                                            {req.status === "APPROVED" && (
                                                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                                                    Approved
                                                </span>
                                            )}
                                            {req.status === "REJECTED" && (
                                                <span className="bg-red-100 text-red-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                                                    Rejected
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <strong>Applicant:</strong> {req.user.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                {req.user.email}
                                            </span>
                                            {req.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {req.phone}
                                                </span>
                                            )}
                                            <span className="text-gray-400">
                                                Applied on {new Date(req.createdAt).toLocaleDateString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>

                                        {req.description && (
                                            <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-start gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                                <span>{req.description}</span>
                                            </p>
                                        )}

                                        {req.adminNote && (
                                            <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-100">
                                                <strong>Admin Note:</strong> {req.adminNote}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {req.status === "PENDING" && (
                                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => handleApprove(req.id)}
                                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => {
                                                    setRejectingId(isRejectOpen ? null : req.id);
                                                    setRejectNote("");
                                                }}
                                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Rejection Feedback Form */}
                                {isRejectOpen && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Rejection Reason / Feedback (Optional):
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="e.g. Incomplete business details, invalid contact number..."
                                                value={rejectNote}
                                                onChange={(e) => setRejectNote(e.target.value)}
                                                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                            />
                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => handleReject(req.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Confirm Rejection
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRejectingId(null)}
                                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-2"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
