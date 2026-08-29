"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Submit a request to become a seller.
 */
export async function submitSellerRequest(data: {
    storeName: string;
    phone?: string;
    description?: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return { error: "You must be signed in to submit a seller request." };
    }

    const userId = session.user.id;
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!currentUser) {
        return { error: "User account not found." };
    }

    if (currentUser.role === "seller" || currentUser.role === "admin") {
        return { error: `You already have the '${currentUser.role}' role.` };
    }

    if (!data.storeName || data.storeName.trim().length < 2) {
        return { error: "Store name must be at least 2 characters." };
    }

    // Check for existing pending request
    const existingPending = await prisma.sellerRequest.findFirst({
        where: {
            userId,
            status: "PENDING",
        },
    });

    if (existingPending) {
        return { error: "You already have a pending seller request under review." };
    }

    // Update user's phone if provided
    if (data.phone?.trim()) {
        await prisma.user.update({
            where: { id: userId },
            data: { phone: data.phone.trim() },
        });
    }

    // Create the seller request
    const newRequest = await prisma.sellerRequest.create({
        data: {
            userId,
            storeName: data.storeName.trim(),
            phone: data.phone?.trim() || currentUser.phone || null,
            description: data.description?.trim() || null,
            status: "PENDING",
        },
    });

    revalidatePath("/profile");
    return { success: true, request: newRequest };
}

/**
 * Admin action to approve a seller request.
 */
export async function approveSellerRequest(requestId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
        return { error: "Unauthorized: Only administrators can approve seller requests." };
    }

    const sellerReq = await prisma.sellerRequest.findUnique({
        where: { id: requestId },
    });

    if (!sellerReq) {
        return { error: "Seller request not found." };
    }

    if (sellerReq.status === "APPROVED") {
        return { error: "This seller request has already been approved." };
    }

    await prisma.$transaction([
        prisma.sellerRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                adminNote: null,
            },
        }),
        prisma.user.update({
            where: { id: sellerReq.userId },
            data: { role: "seller" },
        }),
    ]);

    revalidatePath("/profile");
    return { success: true };
}

/**
 * Admin action to reject a seller request.
 */
export async function rejectSellerRequest(requestId: string, adminNote?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "admin") {
        return { error: "Unauthorized: Only administrators can reject seller requests." };
    }

    const sellerReq = await prisma.sellerRequest.findUnique({
        where: { id: requestId },
    });

    if (!sellerReq) {
        return { error: "Seller request not found." };
    }

    await prisma.sellerRequest.update({
        where: { id: requestId },
        data: {
            status: "REJECTED",
            adminNote: adminNote?.trim() || null,
        },
    });

    revalidatePath("/profile");
    return { success: true };
}
