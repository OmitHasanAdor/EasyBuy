"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import type { Order } from "./page";

type OrdersClientProps = {
    orders: Order[];
};

const STATUS_STYLES: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersClient({ orders }: OrdersClientProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // যদি orders না আসে, তাহলে error দেখান
    useEffect(() => {
        if (!orders || orders.length === 0) {
            // এটা error না, এটা empty state
            return;
        }
    }, [orders]);

    // যদি orders undefined বা null হয়
    if (!orders) {
        return (
            <div className="px-6 py-8 text-center">
                <p className="text-red-600">No order data available</p>
            </div>
        );
    }

    const filteredOrders =
        statusFilter === "ALL"
            ? orders
            : orders.filter((order) => order.status === statusFilter);

    const toggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="px-6 py-8 sm:px-10">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-medium text-[#2B2420]">
                        My Orders
                    </h1>
                    <p className="mt-1 text-sm text-[#5B5145]">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} total
                    </p>
                </div>

                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-[#E7DCC4] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#2B2420] outline-none focus:border-[#C05620] focus:ring-1 focus:ring-[#C05620] sm:w-48"
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {status === "ALL" ? "All Orders" : status}
                                {status !== "ALL" && statusCounts[status]
                                    ? ` (${statusCounts[status]})`
                                    : ""}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B5145]" />
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="mt-8 rounded-lg border border-dashed border-[#E7DCC4] bg-white p-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-[#C05620]/40" />
                    <h3 className="mt-4 font-serif text-lg font-medium text-[#2B2420]">
                        No orders found
                    </h3>
                    <p className="mt-1 text-sm text-[#5B5145]">
                        {statusFilter === "ALL"
                            ? "You haven't placed any orders yet."
                            : `No orders with status "${statusFilter}".`}
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {filteredOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        const firstItem = order.items?.[0];
                        const extraCount = (order.items?.length || 0) - 1;

                        return (
                            <div
                                key={order.id}
                                className="overflow-hidden rounded-lg border border-[#E7DCC4] bg-white transition-shadow hover:shadow-sm"
                            >
                                {/* Order Header */}
                                <div
                                    className="flex cursor-pointer flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-4">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#F2EADA]">
                                            {firstItem?.product?.imageUrl && (
                                                <Image
                                                    src={firstItem.product.imageUrl}
                                                    alt={firstItem.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[#2B2420]">
                                                Order #{order.id}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8E3D14]/70">
                                                <span suppressHydrationWarning>
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {order.items?.length || 0} item
                                                    {(order.items?.length || 0) !== 1 ? "s" : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {order.status.toLowerCase()}
                                        </span>
                                        <span className="shrink-0 text-sm font-semibold text-[#2B2420]">
                                            ৳{order.total.toLocaleString()}
                                        </span>
                                        <button className="ml-1 shrink-0 text-[#8E3D14]/50 hover:text-[#C05620]">
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details (expanded) */}
                                {isExpanded && (
                                    <div className="border-t border-[#F0E6D2] px-5 py-4">
                                        <h4 className="mb-3 text-sm font-medium text-[#2B2420]">
                                            Order Items
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 rounded-lg bg-[#FAF7F0] p-3"
                                                >
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white">
                                                        {item.product?.imageUrl && (
                                                            <Image
                                                                src={item.product.imageUrl}
                                                                alt={item.product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-[#2B2420]">
                                                            {item.product?.name}
                                                        </p>
                                                        <p className="text-xs text-[#8E3D14]/70">
                                                            Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-sm font-semibold text-[#2B2420]">
                                                        ৳{(item.quantity * item.price).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-[#E7DCC4] pt-3">
                                            <span className="text-sm text-[#5B5145]">Total</span>
                                            <span className="text-lg font-bold text-[#2B2420]">
                                                ৳{order.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}