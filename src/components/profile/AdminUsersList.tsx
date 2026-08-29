"use client";

import { useState } from "react";
import { Users, Search, ShoppingBag, Store, Shield } from "lucide-react";

export interface AdminUserData {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    phone?: string | null;
    banned: boolean;
    createdAt: Date | string;
    sellerRequests?: {
        storeName: string;
        status: string;
    }[];
}

interface Props {
    users: AdminUserData[];
}

export default function AdminUsersList({ users }: Props) {
    const [filterRole, setFilterRole] = useState<"ALL" | "buyer" | "seller" | "admin">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const buyers = users.filter((u) => u.role === "buyer");
    const sellers = users.filter((u) => u.role === "seller");
    const admins = users.filter((u) => u.role === "admin");

    const filteredUsers = users.filter((u) => {
        if (filterRole !== "ALL" && u.role !== filterRole) {
            return false;
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = u.name.toLowerCase().includes(q);
            const matchEmail = u.email.toLowerCase().includes(q);
            const matchPhone = u.phone?.toLowerCase().includes(q);
            const matchStore = u.sellerRequests?.some((s) => s.storeName.toLowerCase().includes(q));
            return matchName || matchEmail || matchPhone || matchStore;
        }

        return true;
    });

    return (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                        <p className="text-xs text-gray-500">
                            Overview of registered buyers, sellers, and administrators.
                        </p>
                    </div>
                </div>

                {/* Role Tabs */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl text-xs font-medium text-gray-600 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setFilterRole("buyer")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            filterRole === "buyer"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        Buyers ({buyers.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterRole("seller")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                            filterRole === "seller"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        <Store className="w-3.5 h-3.5 text-amber-600" />
                        Sellers ({sellers.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterRole("ALL")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                            filterRole === "ALL"
                                ? "bg-white text-gray-900 shadow-xs font-semibold"
                                : "hover:text-gray-900"
                        }`}
                    >
                        All ({users.length})
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 mb-4 relative">
                <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email, phone, or store name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
            </div>

            {/* Users Table / List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
                            <th className="pb-3 px-3">User</th>
                            <th className="pb-3 px-3">Role</th>
                            <th className="pb-3 px-3">Contact</th>
                            <th className="pb-3 px-3">Account Status</th>
                            <th className="pb-3 px-3">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No users found matching your filter criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const initials = u.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                const approvedStore = u.sellerRequests?.find((r) => r.status === "APPROVED")?.storeName;

                                return (
                                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                                        {/* User Name & Avatar */}
                                        <td className="py-3 px-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{u.name}</p>
                                                    <p className="text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role Badge */}
                                        <td className="py-3 px-3">
                                            {u.role === "admin" && (
                                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            )}
                                            {u.role === "seller" && (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                        <Store className="w-3 h-3" /> Seller
                                                    </span>
                                                    {approvedStore && (
                                                        <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                                            {approvedStore}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {u.role === "buyer" && (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                    <ShoppingBag className="w-3 h-3" /> Buyer
                                                </span>
                                            )}
                                        </td>

                                        {/* Phone */}
                                        <td className="py-3 px-3 text-gray-600">
                                            {u.phone || <span className="text-gray-400 italic">No phone</span>}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-3">
                                            {u.banned ? (
                                                <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Banned
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium capitalize">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {u.status || "active"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined Date */}
                                        <td className="py-3 px-3 text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
